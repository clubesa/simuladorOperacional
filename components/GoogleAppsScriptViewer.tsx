import React from "react";

export const GoogleAppsScriptViewer = () => {
    const { useState } = React;
    const [isModalOpen, setIsModalOpen] = useState(false);

    const appsScriptCode = `/**
 * Calcula o imposto devido com base no regime tributário e nos parâmetros fornecidos.
 * A função retorna todos os valores de IMPOSTOS A PAGAR como NÚMEROS NEGATIVOS.
 * A função retorna SALDOS CREDORES GERADOS como NÚMEROS POSITIVOS.
 *
 * Exemplo (Valor Total):
 * =CALCULAR_IMPOSTO(2029; "Lucro Real"; 100000; -50000; 32; FALSO; "62.02-3-00"; 1200000; 336000; -30000) -> Retorna o total de impostos a pagar (ex: -16844.50)
 *
 * Exemplo (Imposto Específico):
 * =CALCULAR_IMPOSTO(2029; "Lucro Real"; 100000; -50000; 32; FALSO; "62.02-3-00"; 1200000; 336000; -30000; "ISS") -> Retorna -2000.00
 * =CALCULAR_IMPOSTO(2029; "Lucro Presumido"; 100000; -50000; 32; FALSO; "85.13-9-00"; 1200000; 336000; 0; "ISS") -> Retorna -2000.00
 *
 * @param {number} simulationYear O ano para o qual a simulação será feita.
 * @param {string} regime O regime tributário ('Simples nacional', 'Lucro Real', 'Lucro Presumido').
 * @param {number} receita A receita bruta mensal da empresa.
 * @param {number} custo O custo/despesa total mensal (pode ser informado como positivo ou negativo).
 * @param {number} presuncao A alíquota de presunção do lucro (ex: 32 para 32%).
 * @param {boolean|string} pat Indica se a empresa é optante pelo PAT (ex: VERDADEIRO ou "true").
 * @param {string} cnaeCode O código CNAE da atividade principal.
 * @param {number} rbt12 A receita bruta dos últimos 12 meses (para Simples Nacional).
 * @param {number} folha A folha de pagamento dos últimos 12 meses (para Fator R no Simples Nacional).
 * @param {number} creditGeneratingCosts Custos que geram crédito de PIS/Cofins/CBS/IBS (pode ser informado como positivo ou negativo).
 * @param {string} [impostoEspecifico] Opcional. O nome do imposto a ser retornado (ex: "ISS", "IRPJ", "Saldo Credor PIS"). Se omitido, retorna o valor total.
 * @returns {number} O valor do imposto (negativo), saldo credor (positivo) ou o total de impostos a pagar.
 * @customfunction
 */
function CALCULAR_IMPOSTO(simulationYear, regime, receita, custo, presuncao, pat, cnaeCode, rbt12, folha, creditGeneratingCosts, impostoEspecifico) {
  // Garante que custos sejam tratados como valores positivos para os cálculos internos.
  custo = Math.abs(custo || 0);
  creditGeneratingCosts = Math.abs(creditGeneratingCosts || 0);
  // Normaliza o parâmetro 'pat' para lidar com booleano ou string ("true"/"false")
  var isPatOptIn = (pat === true || String(pat).toLowerCase() === 'true');

  // --- DADOS E CONSTANTES ---
  const cnaes = [
    { "cnae": "47.11-3-01", "descricao": "Comércio varejista", "anexo": "I", "observacao": "Atividade de comércio" },
    { "cnae": "56.11-2-01", "descricao": "Restaurantes e similares", "anexo": "I", "observacao": "Alimentação" },
    { "cnae": "62.02-3-00", "descricao": "Desenvolvimento de software customizável", "anexo": "V", "observacao": "Fator R" },
    { "cnae": "62.03-1-00", "descricao": "Desenvolvimento de software não-customizável", "anexo": "V", "observacao": "Fator R" },
    { "cnae": "69.20-6-01", "descricao": "Advocacia", "anexo": "IV", "observacao": "Não utiliza Fator R" },
    { "cnae": "74.90-1-04", "descricao": "Intermediação de negócios", "anexo": "V", "observacao": "Fator R" },
    { "cnae": "85.12-1/00", "descricao": "Educação infantil - pré-escola", "anexo": "III", "observacao": "Atividade de ensino" },
    { "cnae": "85.13-9-00", "descricao": "Ensino fundamental", "anexo": "III", "observacao": "Atividade de ensino" },
    { "cnae": "85.20-1/00", "descricao": "Ensino médio", "anexo": "III", "observacao": "Atividade de ensino" },
    { "cnae": "85.50-3-02", "descricao": "Apoio à educação", "anexo": "V", "observacao": "Fator R" }
  ];

  const tabelasSimplesNacional = [
      { "anexo": "I", "faixas": [
          { "receita_12m_min": 0.00, "receita_12m_max": 180000.00, "aliquota_percentual": 4.00, "parcela_deduzir": 0.00 },
          { "receita_12m_min": 180000.01, "receita_12m_max": 360000.00, "aliquota_percentual": 7.30, "parcela_deduzir": 5940.00 },
          { "receita_12m_min": 360000.01, "receita_12m_max": 720000.00, "aliquota_percentual": 9.50, "parcela_deduzir": 13860.00 },
          { "receita_12m_min": 720000.01, "receita_12m_max": 1800000.00, "aliquota_percentual": 10.70, "parcela_deduzir": 22500.00 },
          { "receita_12m_min": 1800000.01, "receita_12m_max": 3600000.00, "aliquota_percentual": 14.30, "parcela_deduzir": 87300.00 },
          { "receita_12m_min": 3600000.01, "receita_12m_max": 4800000.00, "aliquota_percentual": 19.00, "parcela_deduzir": 378000.00 }
      ]},
      { "anexo": "III", "faixas": [
          { "receita_12m_min": 0.00, "receita_12m_max": 180000.00, "aliquota_percentual": 6.00, "parcela_deduzir": 0.00 },
          { "receita_12m_min": 180000.01, "receita_12m_max": 360000.00, "aliquota_percentual": 11.20, "parcela_deduzir": 9360.00 },
          { "receita_12m_min": 360000.01, "receita_12m_max": 720000.00, "aliquota_percentual": 13.50, "parcela_deduzir": 17640.00 },
          { "receita_12m_min": 720000.01, "receita_12m_max": 1800000.00, "aliquota_percentual": 16.00, "parcela_deduzir": 35640.00 },
          { "receita_12m_min": 1800000.01, "receita_12m_max": 3600000.00, "aliquota_percentual": 21.00, "parcela_deduzir": 125640.00 },
          { "receita_12m_min": 3600000.01, "receita_12m_max": 4800000.00, "aliquota_percentual": 33.00, "parcela_deduzir": 648000.00 }
      ]},
      { "anexo": "IV", "faixas": [
          { "receita_12m_min": 0.00, "receita_12m_max": 180000.00, "aliquota_percentual": 4.50, "parcela_deduzir": 0.00 },
          { "receita_12m_min": 180000.01, "receita_12m_max": 360000.00, "aliquota_percentual": 9.00, "parcela_deduzir": 8100.00 },
          { "receita_12m_min": 360000.01, "receita_12m_max": 720000.00, "aliquota_percentual": 10.20, "parcela_deduzir": 12420.00 },
          { "receita_12m_min": 720000.01, "receita_12m_max": 1800000.00, "aliquota_percentual": 14.00, "parcela_deduzir": 39780.00 },
          { "receita_12m_min": 1800000.01, "receita_12m_max": 3600000.00, "aliquota_percentual": 22.00, "parcela_deduzir": 183780.00 },
          { "receita_12m_min": 3600000.01, "receita_12m_max": 4800000.00, "aliquota_percentual": 33.00, "parcela_deduzir": 828000.00 }
      ]},
      { "anexo": "V", "faixas": [
          { "receita_12m_min": 0.00, "receita_12m_max": 180000.00, "aliquota_percentual": 15.50, "parcela_deduzir": 0.00 },
          { "receita_12m_min": 180000.01, "receita_12m_max": 360000.00, "aliquota_percentual": 18.00, "parcela_deduzir": 4500.00 },
          { "receita_12m_min": 360000.01, "receita_12m_max": 720000.00, "aliquota_percentual": 19.50, "parcela_deduzir": 9900.00 },
          { "receita_12m_min": 720000.01, "receita_12m_max": 1800000.00, "aliquota_percentual": 20.50, "parcela_deduzir": 17100.00 },
          { "receita_12m_min": 1800000.01, "receita_12m_max": 3600000.00, "aliquota_percentual": 23.00, "parcela_deduzir": 62100.00 },
          { "receita_12m_min": 3600000.01, "receita_12m_max": 4800000.00, "aliquota_percentual": 30.50, "parcela_deduzir": 540000.00 }
      ]}
  ];
  
  const CBS_RATE = 0.088;
  const IBS_RATE = 0.182;
  const IRPJ_RATE = 0.15;
  const CSLL_RATE = 0.09;
  const ADICIONAL_IRPJ_RATE = 0.10;
  const SOFTWARE_CNAES = ['62.02-3-00', '62.03-1-00'];
  const EDUCATION_CNAES_2_PERCENT_ISS = ['85.12-1/00', '85.13-9/00', '85.20-1/00']; // CNAEs de Ensino com ISS de 2% em SP
  const PIS_NC_RATE = 0.0165;
  const COFINS_NC_RATE = 0.076;
  
  function getIssRate(cnaeCode) {
    // ISS de 2% para CNAEs de software e ensino (específico para SP, conforme regra de negócio).
    if (SOFTWARE_CNAES.indexOf(cnaeCode) !== -1 || EDUCATION_CNAES_2_PERCENT_ISS.indexOf(cnaeCode) !== -1) {
      return 0.02;
    }
    return 0.05; // Alíquota padrão para outros serviços.
  }
  
  function calcularSimplesNacional(receitaMensal, rbt12, folha12m, cnaeCode) {
    const cnaeInfo = cnaes.filter(function(c) { return c.cnae === cnaeCode; })[0];
    if (!cnaeInfo) return { total: 0, breakdown: []};

    let anexoId = cnaeInfo.anexo;
    if (cnaeInfo.observacao.indexOf('Fator R') !== -1) {
      const fatorR = rbt12 > 0 ? folha12m / rbt12 : 0;
      anexoId = (fatorR >= 0.28) ? 'III' : 'V';
    }

    const anexo = tabelasSimplesNacional.filter(function(a) { return a.anexo === anexoId; })[0];
    if (!anexo) return { total: 0, breakdown: []};
    
    const faixa = anexo.faixas.filter(function(f) { return rbt12 >= f.receita_12m_min && rbt12 <= f.receita_12m_max; })[0];
    if (!faixa) return { total: 0, breakdown: []};

    const aliquotaEfetiva = rbt12 === 0 ? (anexo.faixas[0].aliquota_percentual / 100) : (((rbt12 * (faixa.aliquota_percentual / 100)) - faixa.parcela_deduzir) / rbt12);
    const totalTax = receitaMensal * aliquotaEfetiva;
    return { total: totalTax, breakdown: [{ name: 'Simples nacional', value: totalTax }] };
  }
  
  // --- FUNÇÕES DE CÁLCULO REATORADAS ---

  function calcularLucroRealAtual(receita, custo, pat, cnaeCode, creditGeneratingCosts) {
      const breakdown = [];
      const iss = receita * getIssRate(cnaeCode);
      breakdown.push({name: 'ISS', value: iss });

      const pisDebito = receita * PIS_NC_RATE;
      const pisCredito = creditGeneratingCosts * PIS_NC_RATE;
      const pisAPagar = Math.max(0, pisDebito - pisCredito);
      const pisCreditoSaldo = Math.max(0, pisCredito - pisDebito);
      breakdown.push({name: 'PIS', value: pisAPagar });
      if (pisCreditoSaldo > 0) breakdown.push({name: 'Saldo Credor PIS', value: pisCreditoSaldo });

      const cofinsDebito = receita * COFINS_NC_RATE;
      const cofinsCredito = creditGeneratingCosts * COFINS_NC_RATE;
      const cofinsAPagar = Math.max(0, cofinsDebito - cofinsCredito);
      const cofinsCreditoSaldo = Math.max(0, cofinsCredito - cofinsDebito);
      breakdown.push({name: 'Cofins', value: cofinsAPagar });
      if (cofinsCreditoSaldo > 0) breakdown.push({name: 'Saldo Credor Cofins', value: cofinsCreditoSaldo });

      // Base de cálculo do IRPJ/CSLL usa o débito como despesa
      const impostosSobreReceitaDRE = iss + pisDebito + cofinsDebito;
      const baseCalculoIRPJCSLL = Math.max(0, receita - custo - impostosSobreReceitaDRE);
      
      const irpj = pat ? (baseCalculoIRPJCSLL * IRPJ_RATE) * 0.96 : baseCalculoIRPJCSLL * IRPJ_RATE;
      const adicionalIrpj = baseCalculoIRPJCSLL > 20000 ? (baseCalculoIRPJCSLL - 20000) * ADICIONAL_IRPJ_RATE : 0;
      const csll = baseCalculoIRPJCSLL * CSLL_RATE;

      breakdown.push({name: 'IRPJ', value: irpj });
      if (adicionalIrpj > 0) breakdown.push({name: 'Adicional IRPJ', value: adicionalIrpj });
      breakdown.push({name: 'CSLL', value: csll });

      return { breakdown: breakdown };
  }
  
  function calcularLucroPresumidoAtual(receita, presuncao, cnaeCode) {
      const breakdown = [];
      const iss = receita * getIssRate(cnaeCode);
      const pis = receita * 0.0065;
      const cofins = receita * 0.03;
      
      const baseCalculo = receita * presuncao;
      const irpj = baseCalculo * IRPJ_RATE;
      const adicionalIrpj = baseCalculo > 20000 ? (baseCalculo - 20000) * ADICIONAL_IRPJ_RATE : 0;
      const csllPresuncao = (presuncao === 0.32 ? 0.32 : 0.12);
      const csll = receita * csllPresuncao * CSLL_RATE;

      breakdown.push({name: 'ISS', value: iss });
      breakdown.push({name: 'PIS', value: pis });
      breakdown.push({name: 'Cofins', value: cofins });
      breakdown.push({name: 'IRPJ', value: irpj });
      if (adicionalIrpj > 0) breakdown.push({name: 'Adicional IRPJ', value: adicionalIrpj });
      breakdown.push({name: 'CSLL', value: csll });
      
      return { breakdown: breakdown };
  }

  function calcularReforma(receita, custo, cnaeCode, regime, presuncao, creditGeneratingCosts, year) {
    var breakdown = [];
    var cbsDebito = 0, cbsCredito = 0, cbsAPagar = 0, cbsCreditoSaldo = 0;
    var ibsDebito = 0, ibsCredito = 0, ibsAPagar = 0, ibsCreditoSaldo = 0;
    var issValue = 0;

    // --- CBS ---
    if (year >= 2027) {
      cbsDebito = receita * CBS_RATE;
      if (regime === 'Lucro Real' || (regime === 'Lucro Presumido' && year >= 2033)) {
        cbsCredito = creditGeneratingCosts * CBS_RATE;
        cbsAPagar = Math.max(0, cbsDebito - cbsCredito);
        cbsCreditoSaldo = Math.max(0, cbsCredito - cbsDebito);
      } else {
        cbsAPagar = cbsDebito;
      }
      breakdown.push({ name: 'CBS', value: cbsAPagar });
      if (cbsCreditoSaldo > 0) breakdown.push({ name: 'Saldo Credor CBS', value: cbsCreditoSaldo });
    }

    // --- ISS / IBS ---
    if (year >= 2029 && year < 2033) { // Transição
      var transitionProgress = (year - 2028) / 4.0;
      var issProportion = 1 - transitionProgress;
      var ibsProportion = transitionProgress;

      issValue = (receita * getIssRate(cnaeCode)) * issProportion;
      if (issValue > 0.01) {
        breakdown.push({ name: 'ISS (' + (issProportion * 100).toFixed(0) + '%)', value: issValue });
      }
      
      ibsDebito = (receita * IBS_RATE) * ibsProportion;
      if (regime === 'Lucro Real') {
        ibsCredito = (creditGeneratingCosts * IBS_RATE) * ibsProportion;
        ibsAPagar = Math.max(0, ibsDebito - ibsCredito);
        ibsCreditoSaldo = Math.max(0, ibsCredito - ibsDebito);
        
        if (ibsAPagar > 0 || ibsCredito > 0) {
            breakdown.push({ name: 'IBS (' + (ibsProportion * 100).toFixed(0) + '%)', value: ibsAPagar });
        }
        if (ibsCreditoSaldo > 0) {
            breakdown.push({ name: 'Saldo Credor IBS (' + (ibsProportion * 100).toFixed(0) + '%)', value: ibsCreditoSaldo });
        }
      } else { // Lucro Presumido
        ibsAPagar = ibsDebito;
        if (ibsAPagar > 0) {
            breakdown.push({ name: 'IBS (' + (ibsProportion * 100).toFixed(0) + '%)', value: ibsAPagar });
        }
      }
    } else if (year >= 2033) { // Reforma Total
        ibsDebito = receita * IBS_RATE;
        if (regime === 'Lucro Real' || regime === 'Lucro Presumido') {
            ibsCredito = creditGeneratingCosts * IBS_RATE;
            ibsAPagar = Math.max(0, ibsDebito - ibsCredito);
            ibsCreditoSaldo = Math.max(0, ibsCredito - ibsDebito);
        } else {
            ibsAPagar = ibsDebito;
        }
        breakdown.push({ name: 'IBS', value: ibsAPagar });
        if (ibsCreditoSaldo > 0) breakdown.push({ name: 'Saldo Credor IBS', value: ibsCreditoSaldo });
    } else { // 2027-2028
        issValue = receita * getIssRate(cnaeCode);
        breakdown.push({ name: 'ISS', value: issValue });
    }

    // --- IRPJ / CSLL ---
    var impostosSobreReceitaDRE = cbsDebito + ibsDebito + issValue;
    var baseCalculoIRPJCSLL;
    if (regime === 'Lucro Real') {
      baseCalculoIRPJCSLL = Math.max(0, receita - custo - impostosSobreReceitaDRE);
    } else { // Lucro Presumido
      baseCalculoIRPJCSLL = receita * presuncao;
    }

    var irpj = baseCalculoIRPJCSLL * IRPJ_RATE;
    var adicionalIrpj = baseCalculoIRPJCSLL > 20000 ? (baseCalculoIRPJCSLL - 20000) * ADICIONAL_IRPJ_RATE : 0;
    var csll = baseCalculoIRPJCSLL * CSLL_RATE;

    breakdown.push({ name: 'IRPJ', value: irpj });
    if (adicionalIrpj > 0) breakdown.push({ name: 'Adicional IRPJ', value: adicionalIrpj });
    breakdown.push({ name: 'CSLL', value: csll });

    return { breakdown: breakdown };
  }

  // --- LÓGICA PRINCIPAL ---
  if (isNaN(receita) || receita <= 0 || !cnaeCode) return 0;

  var resultBreakdown;

  if (regime === 'Simples nacional') {
    var simplesResult = calcularSimplesNacional(receita, rbt12, folha, cnaeCode);
    if (simulationYear >= 2027) {
      simplesResult.breakdown = [{ name: 'Simples na Reforma (a definir)', value: simplesResult.total }];
    }
    resultBreakdown = simplesResult.breakdown;
  } else if (simulationYear < 2027) {
    if (regime === 'Lucro Real') {
      resultBreakdown = calcularLucroRealAtual(receita, custo, isPatOptIn, cnaeCode, creditGeneratingCosts).breakdown;
    } else { // Lucro Presumido
      resultBreakdown = calcularLucroPresumidoAtual(receita, presuncao / 100, cnaeCode).breakdown;
    }
    
    if (simulationYear === 2026) {
        var cbsTestTax = receita * 0.009;
        var ibsTestTax = receita * 0.001;
        var totalTestTax = cbsTestTax + ibsTestTax;
        
        var cofinsIndex = -1;
        for (var i = 0; i < resultBreakdown.length; i++) {
            if (resultBreakdown[i].name.indexOf('Cofins') !== -1) { cofinsIndex = i; break; }
        }

        if (cofinsIndex !== -1) {
            var originalCofinsValue = resultBreakdown[cofinsIndex].value;
            var deductionAmount = Math.min(Math.max(0, originalCofinsValue), totalTestTax);
            resultBreakdown[cofinsIndex].value -= deductionAmount;
        }

        resultBreakdown.push({ name: 'CBS (Teste 2026)', value: cbsTestTax });
        resultBreakdown.push({ name: 'IBS (Teste 2026)', value: ibsTestTax });
    }
  } else {
      resultBreakdown = calcularReforma(receita, custo, cnaeCode, regime, presuncao / 100, creditGeneratingCosts, simulationYear).breakdown;
  }

  if (!resultBreakdown) return 0;

  if (impostoEspecifico) {
    var impostoEspecificoLower = String(impostoEspecifico).toLowerCase().trim();
    var imposto = resultBreakdown.filter(function(item) {
      // Usa 'indexOf === 0' (equivalente a startsWith) para encontrar impostos com nomes dinâmicos (ex: "ISS (75%)" ao buscar por "iss")
      return item.name.toLowerCase().trim().indexOf(impostoEspecificoLower) === 0;
    })[0];
    
    if (!imposto) return 0;

    // Retorna saldos credores como positivo, impostos a pagar como negativo
    return imposto.name.toLowerCase().indexOf('saldo') !== -1 ? imposto.value : -imposto.value;
  }
  
  // Soma apenas os impostos a pagar (ignora saldos credores)
  var totalImpostosAPagar = resultBreakdown.reduce(function(sum, item) {
      return item.name.toLowerCase().indexOf('saldo') === -1 ? sum + item.value : sum;
  }, 0);
  
  return -totalImpostosAPagar;
}`;

    const CodeBlock = ({ code }) => {
      return (
        <div className="relative h-full flex flex-col">
          <pre className="flex-1 bg-[#f4f0e8] border border-[#bf917f] text-[#5c3a21] p-4 rounded-lg overflow-auto text-sm">
            <code>{code}</code>
          </pre>
        </div>
      );
    };

    return (
        <>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center justify-center rounded-md border border-[#bf917f] bg-white px-3 py-1.5 text-sm font-medium text-[#5c3a21] shadow-sm transition-all duration-200 ease-in-out hover:bg-[#f4f0e8] focus:outline-none focus:ring-2 focus:ring-[#ff595a] focus:ring-offset-2"
            >
                Código Apps Script
            </button>
            
            {isModalOpen && (
                 <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
                    onClick={() => setIsModalOpen(false)}
                >
                    <div 
                        className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] flex flex-col m-4"
                        onClick={e => e.stopPropagation()}
                    >
                         <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-[#5c3a21]">Google Apps Script para Planilhas</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-full hover:bg-[#f4f0e8]">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-[#8c6d59]">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <p className="text-[#8c6d59] mb-4 text-sm">
                            Copie e cole este código no editor de script do Google Planilhas (`Extensões &gt; Apps Script`) para usar a função <code className="bg-[#ffe9c9] px-1 py-0.5 rounded text-sm font-mono text-[#5c3a21]">CALCULAR_IMPOSTO()</code> diretamente nas suas células.
                        </p>
                        <div className="flex-1 overflow-hidden min-h-0">
                             <CodeBlock code={appsScriptCode} />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};