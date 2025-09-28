import React, { useState, useMemo, useEffect } from 'react';
import { TaxRegime, TaxType, TaxResult } from './types';
import { calculateTax } from './services/taxCalculator';
import { cnaes, tabelasSimplesNacional } from './data/simplesNacional';
import FormControl from './components/FormControl';
import NumberInput from './components/NumberInput';
import Select from './components/Select';
import Toggle from './components/Toggle';
import OperationalSimulator from './components/OperationalSimulator';
import Slider from './components/Slider';
import GoogleAppsScriptViewer from './components/GoogleAppsScriptViewer';
import AIChat from './components/AIChat';
import JamSessionStudio from './components/JamSessionStudio';

const CalculatorIcon: React.FC<{className: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25v-.008Zm2.25-4.5h.008v.008H10.5v-.008Zm0 2.25h.008v.008H10.5v-.008Zm0 2.25h.008v.008H10.5v-.008Zm2.25-4.5h.008v.008H12.75v-.008Zm0 2.25h.008v.008H12.75v-.008Zm0 2.25h.008v.008H12.75v-.008Zm2.25-4.5h.008v.008H15v-.008Zm0 2.25h.008v.008H15v-.008Zm0 2.25h.008v.008H15v-.008Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0 0 15 0m-15 0a7.5 7.5 0 1 1 15 0m-15 0H3m18 0h-1.5m-15.065-7.025L2.975 2.975m18.05 18.05-1.5-1.5M6.34 6.34l-1.5-1.5m15.065 0-1.5 1.5M4.5 12a7.5 7.5 0 0 1 15 0" />
    </svg>
);

const App: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [simulationYear, setSimulationYear] = useState<number>(currentYear);
  const [regime, setRegime] = useState<TaxRegime>(TaxRegime.LUCRO_PRESUMIDO);
  const [receita, setReceita] = useState<number>(100000);
  const [custo, setCusto] = useState<number>(50000);
  const [presuncao, setPresuncao] = useState<number>(32);
  const [pat, setPat] = useState<boolean>(false);
  const [creditGeneratingCosts, setCreditGeneratingCosts] = useState<number>(30000);

  const [cnaeCode, setCnaeCode] = useState<string>(cnaes[2].cnae);
  const [rbt12, setRbt12] = useState<number>(100000 * 12);
  const [folha, setFolha] = useState<number>(28000 * 12);

  const selectedCnae = useMemo(() => cnaes.find(c => c.cnae === cnaeCode), [cnaeCode]);
  const needsFatorR = useMemo(() => selectedCnae?.observacao.includes('Fator R'), [selectedCnae]);

  const anexoInfo = useMemo(() => {
    if (!selectedCnae || regime !== TaxRegime.SIMPLES_NACIONAL) return null;
    
    let anexoId = selectedCnae.anexo;
    
    if (needsFatorR) {
      const fatorR = rbt12 > 0 ? folha / rbt12 : 0;
      anexoId = fatorR >= 0.28 ? 'III' : 'V';
    }
    
    return tabelasSimplesNacional.find(a => a.anexo === anexoId);
  }, [selectedCnae, regime, needsFatorR, rbt12, folha]);

  const faixaInfo = useMemo(() => {
    if (!anexoInfo || isNaN(rbt12)) return null;
    return anexoInfo.faixas.find(f => rbt12 >= f.receita_12m_min && rbt12 <= f.receita_12m_max) || null;
  }, [anexoInfo, rbt12]);

  const result: TaxResult = useMemo(() => {
    return calculateTax({
      simulationYear,
      regime,
      receita,
      custo,
      presuncao,
      folha,
      pat,
      cnaeCode,
      rbt12,
      creditGeneratingCosts,
    });
  }, [simulationYear, regime, receita, custo, presuncao, folha, pat, cnaeCode, rbt12, creditGeneratingCosts]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };
  
  const cnaeOptions = useMemo(() => cnaes.map(c => ({
    value: c.cnae,
    label: `${c.cnae} - ${c.descricao}`
  })), []);

  const impostosSobreReceita = useMemo(() => result.breakdown.filter(item => item.category === 'receita'), [result.breakdown]);
  const impostosSobreResultado = useMemo(() => result.breakdown.filter(item => item.category === 'resultado'), [result.breakdown]);
  const creditosGerados = useMemo(() => result.breakdown.filter(item => item.category === 'informativo'), [result.breakdown]);


  return (
    <div className="min-h-screen font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-10">
          <CalculatorIcon className="w-16 h-16 mx-auto text-[#ff595a]" />
          <h1 className="text-4xl font-bold tracking-tight mt-4 text-[#5c3a21]">
            Análise de Cenários
          </h1>
          <p className="mt-2 text-lg text-[#8c6d59]">
            Compare os cenários "Fazer" vs "Comprar" e entenda o impacto financeiro e tributário da parceria com a LABirintar.
          </p>
        </header>

        <JamSessionStudio />

        <OperationalSimulator />

        <main className="grid grid-cols-1 md:grid-cols-5 gap-8 mt-12">
          <div className="md:col-span-3 bg-[#f3f0e8] p-6 rounded-2xl shadow-lg border border-[#e0cbb2]">
            <div className="flex justify-between items-center mb-6 border-b border-[#e0cbb2] pb-4">
                <h2 className="text-xl font-semibold text-[#5c3a21]">
                  Calculadora de Tributos Detalhada
                </h2>
                <GoogleAppsScriptViewer />
            </div>
            <div className="space-y-6">
              <FormControl label="Ano da Simulação" description="Arraste para selecionar o ano e ver o impacto da transição tributária.">
                  <Slider value={simulationYear} onChange={setSimulationYear} min={currentYear} max={2034} />
              </FormControl>

              <FormControl label="Regime Tributário">
                <Select<TaxRegime>
                  value={regime}
                  onChange={setRegime}
                  options={Object.values(TaxRegime)}
                />
              </FormControl>

              <FormControl label="Receita Bruta Mensal">
                <NumberInput value={receita} onChange={setReceita} prefix="R$" />
              </FormControl>
              
              {regime === TaxRegime.SIMPLES_NACIONAL && (
                <>
                  <FormControl label="Atividade (CNAE)">
                     <select
                        value={cnaeCode}
                        onChange={(e) => setCnaeCode(e.target.value)}
                        className="w-full rounded-md border-[#e0cbb2] bg-white text-[#5c3a21] shadow-sm focus:border-[#ff595a] focus:ring-1 focus:ring-[#ff595a] px-3 py-2"
                      >
                        {cnaeOptions.map((option) => ( <option key={option.value} value={option.value}> {option.label} </option> ))}
                      </select>
                      {anexoInfo && (
                        <div className="text-xs text-[#8c6d59] mt-2 p-3 bg-white rounded-md border border-[#e0cbb2] space-y-2">
                          <div>
                            Enquadramento: <strong>Anexo {anexoInfo.anexo}</strong> ({anexoInfo.descricao})
                          </div>
                          {faixaInfo ? (
                              <div>
                                  Faixa de Tributação: <strong>{faixaInfo.ordem}ª Faixa</strong>
                                  <div className="italic pl-2 mt-1">
                                      Faturamento (12m): {formatCurrency(faixaInfo.receita_12m_min)} a {formatCurrency(faixaInfo.receita_12m_max)}
                                  </div>
                                   <div className="italic pl-2">
                                      Alíquota Nominal: {faixaInfo.aliquota_percentual.toFixed(2).replace('.', ',')}%
                                  </div>
                              </div>
                          ) : rbt12 > 4800000 ? (
                              <div className="font-semibold text-red-600">
                                  Receita excede o limite do Simples Nacional (R$ 4.800.000,00).
                              </div>
                          ) : null }
                        </div>
                      )}
                  </FormControl>
                   <FormControl label="Receita Bruta (Últimos 12 meses)">
                     <NumberInput value={rbt12} onChange={setRbt12} prefix="R$" />
                   </FormControl>
                  {needsFatorR && (
                    <FormControl label="Folha de Pagamento (Últimos 12 meses)">
                      <NumberInput value={folha} onChange={setFolha} prefix="R$" />
                    </FormControl>
                  )}
                </>
              )}
              
              {regime === TaxRegime.LUCRO_REAL && (
                <>
                   <FormControl label="Atividade (CNAE)" description="Define a alíquota de ISS aplicável até a sua extinção em 2033.">
                    <select
                      value={cnaeCode}
                      onChange={(e) => setCnaeCode(e.target.value)}
                      className="w-full rounded-md border-[#e0cbb2] bg-white text-[#5c3a21] shadow-sm focus:border-[#ff595a] focus:ring-1 focus:ring-[#ff595a] px-3 py-2"
                    >
                      {cnaeOptions.map((option) => ( <option key={option.value} value={option.value}> {option.label} </option> ))}
                    </select>
                  </FormControl>
                  <FormControl label="Custos e Despesas Totais/Dedutíveis">
                    <NumberInput value={custo} onChange={setCusto} prefix="R$" />
                  </FormControl>
                  
                  <FormControl 
                    label="Custos Geradores de Crédito" 
                    description="Parte dos custos que permite crédito de PIS/Cofins (antes de 2027) e de CBS/IBS (a partir de 2027)."
                  >
                    <NumberInput value={creditGeneratingCosts} onChange={setCreditGeneratingCosts} prefix="R$" />
                  </FormControl>

                  {simulationYear < 2027 && (
                     <FormControl label="Incentivo PAT">
                         <Toggle enabled={pat} onChange={setPat} />
                      </FormControl>
                  )}
                </>
              )}

              {regime === TaxRegime.LUCRO_PRESUMIDO && (
                 <>
                    <FormControl label="Atividade (CNAE)" description="Define a alíquota de ISS aplicável até a sua extinção em 2033.">
                      <select
                        value={cnaeCode}
                        onChange={(e) => setCnaeCode(e.target.value)}
                        className="w-full rounded-md border-[#e0cbb2] bg-white text-[#5c3a21] shadow-sm focus:border-[#ff595a] focus:ring-1 focus:ring-[#ff595a] px-3 py-2"
                      >
                        {cnaeOptions.map((option) => ( <option key={option.value} value={option.value}> {option.label} </option> ))}
                      </select>
                    </FormControl>
                    <FormControl label="Alíquota de Presunção">
                        <NumberInput value={presuncao} onChange={setPresuncao} prefix="%" min={0} max={100} />
                    </FormControl>
                    {simulationYear >= 2027 && (
                      <FormControl label="Custos Geradores de Crédito (CBS/IBS)" description="Crédito presumido pode ser aplicável. Informe os custos para simular.">
                        <NumberInput value={creditGeneratingCosts} onChange={setCreditGeneratingCosts} prefix="R$" />
                      </FormControl>
                    )}
                 </>
              )}
            </div>
          </div>

          <div className="md:col-span-2">
             <div className="sticky top-8 bg-[#f3f0e8] p-6 rounded-2xl shadow-lg border border-[#e0cbb2]">
                <h3 className="text-lg font-semibold text-[#5c3a21] mb-4">
                  Resultado da Simulação ({simulationYear})
                </h3>
                
                {result.breakdown.length > 0 ? (
                  <div>
                    {impostosSobreReceita.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold uppercase text-[#8c6d59] tracking-wider mb-2">Sobre a Receita</h4>
                        <div className="space-y-2">
                          {impostosSobreReceita.map((item) => (
                            <div key={item.name} className="flex justify-between items-start text-sm">
                              <span className="text-[#8c6d59] pt-1">{item.name}</span>
                              <div className="text-right">
                                <span className="font-medium text-[#5c3a21]">{formatCurrency(item.value)}</span>
                                {item.rate && <span className="block text-xs text-[#8c6d59]">{item.rate}</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {impostosSobreResultado.length > 0 && (
                      <div className="pt-3 mt-3 border-t border-[#e0cbb2]">
                        <h4 className="text-xs font-bold uppercase text-[#8c6d59] tracking-wider mb-2">Sobre o Resultado (Lucro)</h4>
                         <div className="space-y-2">
                          {impostosSobreResultado.map((item) => (
                            <div key={item.name} className="flex justify-between items-start text-sm">
                              <span className="text-[#8c6d59] pt-1">{item.name}</span>
                              <div className="text-right">
                                <span className="font-medium text-[#5c3a21]">{formatCurrency(item.value)}</span>
                                {item.rate && <span className="block text-xs text-[#8c6d59]">{item.rate}</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                     {creditosGerados.length > 0 && (
                      <div className="pt-3 mt-3 border-t border-[#e0cbb2]">
                        <h4 className="text-xs font-bold uppercase text-[#8c6d59] tracking-wider mb-2">Créditos Gerados (p/ Mês Seguinte)</h4>
                         <div className="space-y-2">
                          {creditosGerados.map((item) => (
                            <div key={item.name} className="flex justify-between items-start text-sm">
                              <span className="text-[#8c6d59] pt-1">{item.name}</span>
                              <div className="text-right">
                                <span className="font-medium text-green-600">{formatCurrency(item.value)}</span>
                                {item.rate && <span className="block text-xs text-[#8c6d59]">{item.rate}</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-center text-[#8c6d59]">Preencha os dados para ver o resultado.</p>
                )}

                {result.total > 0 && (
                  <div className="mt-4 pt-4 border-t border-[#e0cbb2]">
                     <div className="flex justify-between items-center font-bold text-lg">
                        <span className="text-[#5c3a21]">Total de Impostos</span>
                        <span className="text-[#ff595a]">{formatCurrency(result.total)}</span>
                     </div>
                     <div className="flex justify-between items-center text-sm mt-2">
                          <span className="text-[#8c6d59]">Alíquota Efetiva</span>
                          <span className="font-medium text-[#5c3a21]">{(result.effectiveRate * 100).toFixed(2).replace('.',',')}%</span>
                     </div>
                  </div>
                )}
             </div>
          </div>
        </main>
        
        <footer className="text-center mt-12 text-sm text-[#8c6d59]">
            <p>
                Esta é uma ferramenta de simulação. Os valores são estimativas.
            </p>
        </footer>

        <AIChat />
      </div>
    </div>
  );
};

export default App;