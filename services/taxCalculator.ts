import { TaxRegime, CalculatorParams, AnexoType, TaxResult } from '../types';
import { cnaes, tabelasSimplesNacional } from '../data/simplesNacional';

// --- CONSTANTS ---
const IBS_CBS_RATE = 0.27; // Final combined rate for full reform
const CBS_RATE = 0.088; // Estimated federal rate for transition
const IBS_RATE = 0.182; // Estimated state/municipal rate for transition
const IRPJ_RATE = 0.15;
const CSLL_RATE = 0.09;
const ADICIONAL_IRPJ_RATE = 0.10;
const SOFTWARE_CNAES = ['62.02-3-00', '62.03-1-00'];
const PIS_NC_RATE = 0.0165;
const COFINS_NC_RATE = 0.076;


// --- HELPERS ---
const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
};

function getIssRate(cnaeCode: string): number {
    return SOFTWARE_CNAES.includes(cnaeCode) ? 0.02 : 0.05; // 2% for software, 5% default
}

// --- CALCULATION LOGIC FOR EACH REGIME/PERIOD ---

function calcularSimplesNacional(
  receitaMensal: number, 
  rbt12: number, 
  folha12m: number, 
  cnaeCode: string
): TaxResult {
  if (!cnaeCode || isNaN(receitaMensal) || receitaMensal <= 0 || isNaN(rbt12) || rbt12 < 0) {
    return { total: 0, breakdown: [], effectiveRate: 0 };
  }

  const cnaeInfo = cnaes.find(c => c.cnae === cnaeCode);
  if (!cnaeInfo) return { total: 0, breakdown: [], effectiveRate: 0 };

  let anexoId: AnexoType = cnaeInfo.anexo;

  if (cnaeInfo.observacao.includes('Fator R')) {
    if (isNaN(folha12m) || folha12m < 0) return { total: 0, breakdown: [], effectiveRate: 0 };
    const fatorR = rbt12 > 0 ? folha12m / rbt12 : 0;
    if (fatorR >= 0.28) {
      anexoId = 'III';
    } else {
      anexoId = 'V';
    }
  }

  const anexo = tabelasSimplesNacional.find(a => a.anexo === anexoId);
  if (!anexo) return { total: 0, breakdown: [], effectiveRate: 0 };

  const faixa = anexo.faixas.find(f => rbt12 >= f.receita_12m_min && rbt12 <= f.receita_12m_max);
  if (!faixa) return { total: 0, breakdown: [], effectiveRate: 0 };

  const { aliquota_percentual, parcela_deduzir } = faixa;
  
  let totalTax;
  let aliquotaEfetiva;
  if (rbt12 === 0) {
    const primeiraFaixa = anexo.faixas[0];
    aliquotaEfetiva = primeiraFaixa.aliquota_percentual / 100;
    totalTax = receitaMensal * aliquotaEfetiva;
  } else {
    aliquotaEfetiva = ((rbt12 * (aliquota_percentual / 100)) - parcela_deduzir) / rbt12;
    totalTax = receitaMensal * aliquotaEfetiva;
  }
  
  const breakdown = [{ 
      name: 'Simples Nacional', 
      value: totalTax,
      rate: `Efetiva: ${(aliquotaEfetiva * 100).toFixed(2).replace('.', ',')}%`,
      category: 'receita' as const
  }];
  return {
    total: totalTax,
    breakdown,
    effectiveRate: receitaMensal > 0 ? totalTax / receitaMensal : 0,
  };
}

// PRE-2027: CURRENT SYSTEM
function calcularLucroRealAtual(receita: number, custo: number, pat: boolean, cnaeCode: string, creditGeneratingCosts: number): TaxResult {
    const breakdown: TaxResult['breakdown'] = [];
    
    const issRate = getIssRate(cnaeCode);
    const iss = receita * issRate;
    breakdown.push({ name: 'ISS', value: iss, rate: `${(issRate * 100).toFixed(2).replace('.', ',')}%`, category: 'receita' });

    // PIS/Cofins não-cumulativo
    const pisDebito = receita * PIS_NC_RATE;
    const pisCredito = creditGeneratingCosts * PIS_NC_RATE;
    const pisAPagar = Math.max(0, pisDebito - pisCredito);
    const pisCreditoSaldo = Math.max(0, pisCredito - pisDebito);

    breakdown.push({ name: 'PIS', value: pisAPagar, rate: `Débito: ${formatCurrency(pisDebito)}`, category: 'receita' });
    if (pisCreditoSaldo > 0) {
        breakdown.push({ name: 'Saldo Credor PIS', value: pisCreditoSaldo, category: 'informativo' });
    }

    const cofinsDebito = receita * COFINS_NC_RATE;
    const cofinsCredito = creditGeneratingCosts * COFINS_NC_RATE;
    const cofinsAPagar = Math.max(0, cofinsDebito - cofinsCredito);
    const cofinsCreditoSaldo = Math.max(0, cofinsCredito - cofinsDebito);
    
    breakdown.push({ name: 'Cofins', value: cofinsAPagar, rate: `Débito: ${formatCurrency(cofinsDebito)}`, category: 'receita' });
    if (cofinsCreditoSaldo > 0) {
        breakdown.push({ name: 'Saldo Credor Cofins', value: cofinsCreditoSaldo, category: 'informativo' });
    }
    
    // Para a DRE, a despesa com impostos sobre receita é o débito total
    const impostosSobreReceitaDRE = iss + pisDebito + cofinsDebito;
    const baseCalculoIRPJCSLL = Math.max(0, receita - custo - impostosSobreReceitaDRE);
    
    const irpj = pat ? (baseCalculoIRPJCSLL * IRPJ_RATE) * 0.96 : baseCalculoIRPJCSLL * IRPJ_RATE;
    const adicionalIrpj = baseCalculoIRPJCSLL > 20000 ? (baseCalculoIRPJCSLL - 20000) * ADICIONAL_IRPJ_RATE : 0;
    const csll = baseCalculoIRPJCSLL * CSLL_RATE;

    breakdown.push({name: 'IRPJ', value: irpj, rate: pat ? '15% c/ Redução PAT' : '15%', category: 'resultado'});
    if (adicionalIrpj > 0) breakdown.push({name: 'Adicional IRPJ', value: adicionalIrpj, rate: '10% s/ lucro > R$20k', category: 'resultado'});
    breakdown.push({name: 'CSLL', value: csll, rate: '9%', category: 'resultado'});

    const total = breakdown.filter(t => t.category !== 'informativo').reduce((sum, item) => sum + item.value, 0);
    return { total, breakdown, effectiveRate: receita > 0 ? total / receita : 0 };
}

function calcularLucroPresumidoAtual(receita: number, presuncao: number, cnaeCode: string): TaxResult {
    const breakdown: TaxResult['breakdown'] = [];
    const issRate = getIssRate(cnaeCode);
    const iss = receita * issRate;
    const pis = receita * 0.0065;
    const cofins = receita * 0.03;

    const baseCalculo = receita * presuncao;
    const irpj = baseCalculo * IRPJ_RATE;
    const adicionalIrpj = baseCalculo > 20000 ? (baseCalculo - 20000) * ADICIONAL_IRPJ_RATE : 0;
    const csllPresuncao = (presuncao === 0.32 ? 0.32 : 0.12);
    const csll = receita * csllPresuncao * CSLL_RATE;

    breakdown.push({name: 'ISS', value: iss, rate: `${(issRate * 100).toFixed(2).replace('.', ',')}%`, category: 'receita'});
    breakdown.push({name: 'PIS', value: pis, rate: '0,65%', category: 'receita'});
    breakdown.push({name: 'Cofins', value: cofins, rate: '3,00%', category: 'receita'});
    breakdown.push({name: 'IRPJ', value: irpj, rate: `15% s/ ${(presuncao * 100).toFixed(0)}% da receita`, category: 'resultado'});
    if (adicionalIrpj > 0) breakdown.push({name: 'Adicional IRPJ', value: adicionalIrpj, rate: '10% s/ base > R$20k', category: 'resultado'});
    breakdown.push({name: 'CSLL', value: csll, rate: `9% s/ ${(csllPresuncao * 100).toFixed(0)}% da receita`, category: 'resultado'});
    
    const total = breakdown.reduce((sum, item) => sum + item.value, 0);
    return { total, breakdown, effectiveRate: receita > 0 ? total / receita : 0 };
}

// 2027-2028: CBS REPLACES PIS/COFINS
function calcularHibrido2027(receita: number, custo: number, cnaeCode: string, regime: TaxRegime, presuncao: number, creditGeneratingCosts: number): TaxResult {
    const breakdown: TaxResult['breakdown'] = [];
    
    const cbsDebito = receita * CBS_RATE;
    let cbsAPagar = cbsDebito;
    
    if (regime === TaxRegime.LUCRO_REAL) {
        const cbsCredito = creditGeneratingCosts * CBS_RATE;
        cbsAPagar = Math.max(0, cbsDebito - cbsCredito);
        const cbsCreditoSaldo = Math.max(0, cbsCredito - cbsDebito);
        breakdown.push({ name: 'CBS', value: cbsAPagar, rate: `Débito: ${formatCurrency(cbsDebito)}`, category: 'receita' });
        if (cbsCreditoSaldo > 0) {
            breakdown.push({ name: 'Saldo Credor CBS', value: cbsCreditoSaldo, category: 'informativo' });
        }
    } else {
        breakdown.push({ name: 'CBS', value: cbsAPagar, rate: `${(CBS_RATE * 100).toFixed(2).replace('.', ',')}%`, category: 'receita' });
    }
    
    const issRate = getIssRate(cnaeCode);
    const iss = receita * issRate;
    breakdown.push({ name: 'ISS', value: iss, rate: `${(issRate * 100).toFixed(2).replace('.', ',')}%`, category: 'receita' });

    const impostosSobreReceitaDRE = cbsDebito + iss;
    let baseCalculoIRPJCSLL: number;
    if(regime === TaxRegime.LUCRO_REAL) {
        baseCalculoIRPJCSLL = Math.max(0, receita - custo - impostosSobreReceitaDRE);
    } else {
        baseCalculoIRPJCSLL = receita * presuncao;
    }
    const irpj = baseCalculoIRPJCSLL * IRPJ_RATE;
    const adicionalIrpj = baseCalculoIRPJCSLL > 20000 ? (baseCalculoIRPJCSLL - 20000) * ADICIONAL_IRPJ_RATE : 0;
    const csll = baseCalculoIRPJCSLL * CSLL_RATE;

    breakdown.push({ name: 'IRPJ', value: irpj, rate: '15%', category: 'resultado' });
    if (adicionalIrpj > 0) breakdown.push({ name: 'Adicional IRPJ', value: adicionalIrpj, rate: '10% s/ base > R$20k', category: 'resultado' });
    breakdown.push({ name: 'CSLL', value: csll, rate: '9%', category: 'resultado' });
    
    const total = breakdown.filter(t => t.category !== 'informativo').reduce((sum, item) => sum + item.value, 0);
    return { total, breakdown, effectiveRate: receita > 0 ? total / receita : 0 };
}

// 2029-2032: ISS/IBS TRANSITION
function calcularTransicao2029(receita: number, custo: number, cnaeCode: string, regime: TaxRegime, presuncao: number, creditGeneratingCosts: number, year: number): TaxResult {
    const breakdown: TaxResult['breakdown'] = [];
    
    const cbsDebito = receita * CBS_RATE;
    let cbsAPagar = cbsDebito;

    if (regime === TaxRegime.LUCRO_REAL) {
        const cbsCredito = creditGeneratingCosts * CBS_RATE;
        cbsAPagar = Math.max(0, cbsDebito - cbsCredito);
        const cbsCreditoSaldo = Math.max(0, cbsCredito - cbsDebito);
        breakdown.push({ name: 'CBS', value: cbsAPagar, rate: `Débito: ${formatCurrency(cbsDebito)}`, category: 'receita' });
        if(cbsCreditoSaldo > 0) breakdown.push({ name: 'Saldo Credor CBS', value: cbsCreditoSaldo, category: 'informativo' });
    } else {
        breakdown.push({ name: 'CBS', value: cbsAPagar, rate: `${(CBS_RATE * 100).toFixed(2).replace('.', ',')}%`, category: 'receita' });
    }

    // A transição ocorre em 4 anos (2029, 2030, 2031, 2032).
    // O progresso vai de 0.25 (em 2029) a 1.0 (em 2032).
    const transitionProgress = (year - 2028) / 4.0;
    const issProportion = 1 - transitionProgress;
    const ibsProportion = transitionProgress;
    
    const issRate = getIssRate(cnaeCode);
    const issValue = (receita * issRate) * issProportion;
    if (issValue > 0.01) breakdown.push({ name: `ISS (${(issProportion * 100).toFixed(0)}%)`, value: issValue, rate: `${(issRate * 100).toFixed(2).replace('.', ',')}%`, category: 'receita' });
    
    const ibsDebito = (receita * IBS_RATE) * ibsProportion;
    let ibsAPagar = ibsDebito;

    if (regime === TaxRegime.LUCRO_REAL) {
        const ibsCredito = (creditGeneratingCosts * IBS_RATE) * ibsProportion;
        ibsAPagar = Math.max(0, ibsDebito - ibsCredito);
        const ibsCreditoSaldo = Math.max(0, ibsCredito - ibsDebito);
        if (ibsAPagar > 0 || ibsCredito > 0) breakdown.push({ name: `IBS (${(ibsProportion * 100).toFixed(0)}%)`, value: ibsAPagar, rate: `Débito: ${formatCurrency(ibsDebito)}`, category: 'receita' });
        if (ibsCreditoSaldo > 0) breakdown.push({ name: `Saldo Credor IBS (${(ibsProportion * 100).toFixed(0)}%)`, value: ibsCreditoSaldo, category: 'informativo' });
    } else {
        if (ibsAPagar > 0) breakdown.push({ name: `IBS (${(ibsProportion * 100).toFixed(0)}%)`, value: ibsAPagar, rate: `${(IBS_RATE * 100).toFixed(2).replace('.', ',')}%`, category: 'receita' });
    }

    const impostosSobreReceitaDRE = cbsDebito + issValue + ibsDebito;
    let baseCalculoIRPJCSLL: number;
    if(regime === TaxRegime.LUCRO_REAL) {
        baseCalculoIRPJCSLL = Math.max(0, receita - custo - impostosSobreReceitaDRE);
    } else {
        baseCalculoIRPJCSLL = receita * presuncao;
    }
    const irpj = baseCalculoIRPJCSLL * IRPJ_RATE;
    const adicionalIrpj = baseCalculoIRPJCSLL > 20000 ? (baseCalculoIRPJCSLL - 20000) * ADICIONAL_IRPJ_RATE : 0;
    const csll = baseCalculoIRPJCSLL * CSLL_RATE;

    breakdown.push({ name: 'IRPJ', value: irpj, rate: '15%', category: 'resultado' });
    if (adicionalIrpj > 0) breakdown.push({ name: 'Adicional IRPJ', value: adicionalIrpj, rate: '10% s/ base > R$20k', category: 'resultado' });
    breakdown.push({ name: 'CSLL', value: csll, rate: '9%', category: 'resultado' });

    const total = breakdown.filter(t => t.category !== 'informativo').reduce((sum, item) => sum + item.value, 0);
    return { total, breakdown, effectiveRate: receita > 0 ? total / receita : 0 };
}

// POST-2033: FULL REFORM SYSTEM
function calcularReformaTotalLucroReal(receita: number, custo: number, creditGeneratingCosts: number): TaxResult {
    const breakdown: TaxResult['breakdown'] = [];

    const cbsDebito = receita * CBS_RATE;
    const cbsCredito = creditGeneratingCosts * CBS_RATE;
    const cbsAPagar = Math.max(0, cbsDebito - cbsCredito);
    const cbsCreditoSaldo = Math.max(0, cbsCredito - cbsDebito);
    breakdown.push({ name: 'CBS', value: cbsAPagar, rate: `Débito: ${formatCurrency(cbsDebito)}`, category: 'receita' });
    if(cbsCreditoSaldo > 0) breakdown.push({ name: 'Saldo Credor CBS', value: cbsCreditoSaldo, category: 'informativo' });


    const ibsDebito = receita * IBS_RATE;
    const ibsCredito = creditGeneratingCosts * IBS_RATE;
    const ibsAPagar = Math.max(0, ibsDebito - ibsCredito);
    const ibsCreditoSaldo = Math.max(0, ibsCredito - ibsDebito);
    breakdown.push({ name: 'IBS', value: ibsAPagar, rate: `Débito: ${formatCurrency(ibsDebito)}`, category: 'receita' });
    if(ibsCreditoSaldo > 0) breakdown.push({ name: 'Saldo Credor IBS', value: ibsCreditoSaldo, category: 'informativo' });


    const impostosSobreReceitaDRE = cbsDebito + ibsDebito;
    const baseCalculoIRPJCSLL = Math.max(0, receita - custo - impostosSobreReceitaDRE);
    
    const irpj = baseCalculoIRPJCSLL * IRPJ_RATE;
    const adicionalIrpj = baseCalculoIRPJCSLL > 20000 ? (baseCalculoIRPJCSLL - 20000) * ADICIONAL_IRPJ_RATE : 0;
    const csll = baseCalculoIRPJCSLL * CSLL_RATE;

    breakdown.push({ name: 'IRPJ', value: irpj, rate: '15%', category: 'resultado' });
    if (adicionalIrpj > 0) breakdown.push({ name: 'Adicional IRPJ', value: adicionalIrpj, rate: '10% s/ base > R$20k', category: 'resultado' });
    breakdown.push({ name: 'CSLL', value: csll, rate: '9%', category: 'resultado' });
    
    const total = breakdown.filter(t => t.category !== 'informativo').reduce((sum, item) => sum + item.value, 0);
    return { total, breakdown, effectiveRate: receita > 0 ? total / receita : 0 };
}

function calcularReformaTotalLucroPresumido(receita: number, presuncao: number, creditGeneratingCosts: number): TaxResult {
    const breakdown: TaxResult['breakdown'] = [];

    // No Lucro Presumido pós-reforma, a apuração de CBS/IBS também pode gerar crédito
    const cbsDebito = receita * CBS_RATE;
    const cbsCredito = creditGeneratingCosts * CBS_RATE;
    const cbsAPagar = Math.max(0, cbsDebito - cbsCredito);
    const cbsCreditoSaldo = Math.max(0, cbsCredito - cbsDebito);
    breakdown.push({ name: 'CBS', value: cbsAPagar, rate: `Débito: ${formatCurrency(cbsDebito)}`, category: 'receita' });
    if(cbsCreditoSaldo > 0) breakdown.push({ name: 'Saldo Credor CBS', value: cbsCreditoSaldo, category: 'informativo' });

    const ibsDebito = receita * IBS_RATE;
    const ibsCredito = creditGeneratingCosts * IBS_RATE;
    const ibsAPagar = Math.max(0, ibsDebito - ibsCredito);
    const ibsCreditoSaldo = Math.max(0, ibsCredito - ibsDebito);
    breakdown.push({ name: 'IBS', value: ibsAPagar, rate: `Débito: ${formatCurrency(ibsDebito)}`, category: 'receita' });
    if(ibsCreditoSaldo > 0) breakdown.push({ name: 'Saldo Credor IBS', value: ibsCreditoSaldo, category: 'informativo' });
    
    const baseCalculo = receita * presuncao;

    const irpj = baseCalculo * IRPJ_RATE;
    const adicionalIrpj = baseCalculo > 20000 ? (baseCalculo - 20000) * ADICIONAL_IRPJ_RATE : 0;
    const csll = baseCalculo * CSLL_RATE;

    breakdown.push({ name: 'IRPJ', value: irpj, rate: '15% s/ base presumida', category: 'resultado' });
    if (adicionalIrpj > 0) breakdown.push({ name: 'Adicional IRPJ', value: adicionalIrpj, rate: '10% s/ base > R$20k', category: 'resultado' });
    breakdown.push({ name: 'CSLL', value: csll, rate: '9% s/ base presumida', category: 'resultado' });

    const total = breakdown.filter(t => t.category !== 'informativo').reduce((sum, item) => sum + item.value, 0);
    return { total, breakdown, effectiveRate: receita > 0 ? total / receita : 0 };
}

// --- MAIN EXPORTED FUNCTION ---
export function calculateTax(params: CalculatorParams): TaxResult {
    const { simulationYear, regime, receita, custo, presuncao, folha = 0, pat, cnaeCode, rbt12 = 0, creditGeneratingCosts } = params;
    
    if (isNaN(receita) || receita <= 0 || !cnaeCode) return { total: 0, breakdown: [], effectiveRate: 0 };

    if (regime === TaxRegime.SIMPLES_NACIONAL) {
        const result = calcularSimplesNacional(receita, rbt12, folha, cnaeCode);
        if (simulationYear >= 2027) {
            result.breakdown = [{ name: 'Simples na Reforma (a definir)', value: result.total, category: 'receita', rate: result.breakdown[0].rate }];
        }
        return result;
    }
    
    if (simulationYear < 2027) {
        let result: TaxResult;
        if (regime === TaxRegime.LUCRO_REAL) {
            result = calcularLucroRealAtual(receita, custo, pat, cnaeCode, creditGeneratingCosts);
        } else {
            result = calcularLucroPresumidoAtual(receita, presuncao / 100, cnaeCode);
        }
        
        if (simulationYear === 2026) {
            const cbsTestTax = receita * 0.009; // 0.9%
            const ibsTestTax = receita * 0.001; // 0.1%
            const totalTestTax = cbsTestTax + ibsTestTax;

            // Find Cofins and apply the deduction
            const cofinsIndex = result.breakdown.findIndex(t => t.name.startsWith('Cofins'));
            if (cofinsIndex !== -1) {
                const originalCofinsValue = result.breakdown[cofinsIndex].value;
                const deductionAmount = Math.min(Math.max(0, originalCofinsValue), totalTestTax);
                
                // Update Cofins value and rate description
                result.breakdown[cofinsIndex].value -= deductionAmount;
                const originalRate = result.breakdown[cofinsIndex].rate;
                result.breakdown[cofinsIndex].rate = `${originalRate} (Dedução: ${formatCurrency(deductionAmount)})`;
            }

            // Add the test tax as a separate line item
            result.breakdown.push({ 
                name: 'CBS (Teste 2026)', 
                value: cbsTestTax, 
                rate: '0,90%',
                category: 'receita'
            });
            result.breakdown.push({ 
                name: 'IBS (Teste 2026)', 
                value: ibsTestTax, 
                rate: '0,10%',
                category: 'receita'
            });

            // The total tax burden doesn't change, it's a reallocation.
            // Recalculate total and effective rate from the modified breakdown for consistency.
            result.total = result.breakdown.filter(t => t.category !== 'informativo').reduce((sum, item) => sum + item.value, 0);
            result.effectiveRate = receita > 0 ? result.total / receita : 0;
        }
        return result;
    }

    if (simulationYear >= 2027 && simulationYear < 2029) {
        return calcularHibrido2027(receita, custo, cnaeCode, regime, presuncao / 100, creditGeneratingCosts);
    }

    if (simulationYear >= 2029 && simulationYear < 2033) {
        return calcularTransicao2029(receita, custo, cnaeCode, regime, presuncao / 100, creditGeneratingCosts, simulationYear);
    }

    if (simulationYear >= 2033) {
        if (regime === TaxRegime.LUCRO_REAL) {
            return calcularReformaTotalLucroReal(receita, custo, creditGeneratingCosts);
        } else {
            return calcularReformaTotalLucroPresumido(receita, presuncao / 100, creditGeneratingCosts);
        }
    }
    
    return { total: 0, breakdown: [], effectiveRate: 0 };
}