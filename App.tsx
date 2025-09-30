
import React from "react";
import { JamSessionStudio } from './components/JamSessionStudio.tsx';
import { OperationalSimulator } from './components/OperationalSimulator.tsx';
import { EcosystemSimulator } from './components/EcosystemSimulator.tsx';
import { AIChat } from './components/AIChat.tsx';
import { TaxRegime } from './types.tsx';
import { cnaes, tabelasSimplesNacional } from './data/simplesNacional.tsx';
import { calculateTax } from './services/taxCalculator.tsx';
import { FormControl } from './components/FormControl.tsx';
import { NumberInput } from './components/NumberInput.tsx';
import { Select } from './components/Select.tsx';
import { Toggle } from './components/Toggle.tsx';
import { Slider } from './components/Slider.tsx';
import { GoogleAppsScriptViewer } from './components/GoogleAppsScriptViewer.tsx';

export const App = () => {
  const { useState, useMemo, useEffect } = React;
  
  const [simulationYear, setSimulationYear] = useState(2025);
  const [regime, setRegime] = useState(TaxRegime.LUCRO_PRESUMIDO);
  const [receita, setReceita] = useState(100000);
  const [custo, setCusto] = useState(50000);
  const [presuncao, setPresuncao] = useState(32);
  const [pat, setPat] = useState(false);
  const [creditGeneratingCosts, setCreditGeneratingCosts] = useState(30000);

  const [cnaeCode, setCnaeCode] = useState(cnaes[2].cnae);
  const [rbt12, setRbt12] = useState(100000 * 12);
  const [folha, setFolha] = useState(28000 * 12);
  
  const [activeTab, setActiveTab] = useState('config');
  const [scenarios, setScenarios] = useState(() => {
    try {
      const savedScenarios = localStorage.getItem('operationalSimulatorScenarios');
      return savedScenarios ? JSON.parse(savedScenarios) : [];
    } catch (error) {
      console.error("Failed to parse scenarios from localStorage", error);
      return [];
    }
  });
  const [partnershipModel, setPartnershipModel] = useState({ model: 'Entrada', schoolPercentage: 20 });
  
  useEffect(() => {
    try {
      localStorage.setItem('operationalSimulatorScenarios', JSON.stringify(scenarios));
    } catch (error) {
      console.error("Failed to save scenarios to localStorage", error);
    }
  }, [scenarios]);


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

  const result = useMemo(() => {
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

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };
  
  const cnaeOptions = useMemo(() => cnaes.map(c => ({
    value: c.cnae,
    label: `${c.cnae} - ${c.descricao}`
  })), []);

  const impostosSobreReceita = useMemo(() => result.breakdown.filter(item => item.category === 'receita'), [result.breakdown]);
  const impostosSobreResultado = useMemo(() => result.breakdown.filter(item => item.category === 'resultado'), [result.breakdown]);
  const creditosGerados = useMemo(() => result.breakdown.filter(item => item.category === 'informativo'), [result.breakdown]);
  
  // --- Ícones para a Navegação ---
  const ConfigIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" /></svg>;
  const CompareIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.092 1.21-.138 2.43-.138 3.662m15.824 0c0 1.232-.046 2.453-.138 3.662a4.006 4.006 0 0 1-3.7 3.7 48.678 48.678 0 0 1-7.324 0 4.006 4.006 0 0 1-3.7-3.7c-.092 1.21-.138 2.43-.138 3.662m15.824 0a48.673 48.673 0 0 0-7.912 0c-2.912 0-5.648.794-7.912 0M4.5 12a9 9 0 1 1 18 0a9 9 0 0 1-18 0Z" /></svg>;
  const EcosystemIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m-7.5-2.962 3.97-3.97m-3.97 3.97-3.97-3.97m3.97 3.97L9 21m-3-3 3.97-3.97m-3.97 3.97L4.5 12m0 0 3.97-3.97M4.5 12l3.97 3.97m0 0L12 21m-7.5-9-3.97-3.97M9 12l-3.97 3.97M9 12l3.97-3.97M9 12l3.97 3.97M9 12l-3.97-3.97M15 12l-3.97-3.97m3.97 3.97-3.97 3.97m3.97-3.97.939-.939a9.091 9.091 0 0 1 2.322 3.977A49.037 49.037 0 0 1 21 12m-6 0a49.038 49.038 0 0 0-3.458-2.348c-.51-.354-.922-.8-1.284-1.311l-3.976 3.976 3.976 3.976c.362-.51.774-.957 1.284-1.311A49.037 49.037 0 0 0 15 12Z" /></svg>;
  const CalculatorIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25v-.008Zm2.25-4.5h.008v.008H10.5v-.008Zm0 2.25h.008v.008H10.5v-.008Zm0 2.25h.008v.008H10.5v-.008Zm2.25-4.5h.008v.008H12.75v-.008Zm0 2.25h.008v.008H12.75v-.008Zm0 2.25h.008v.008H12.75v-.008ZM8.25 18h7.5a2.25 2.25 0 0 0 2.25-2.25V9a2.25 2.25 0 0 0-2.25-2.25h-7.5A2.25 2.25 0 0 0 6 9v6.75A2.25 2.25 0 0 0 8.25 18Z" /></svg>;

  const navItems = [
    { id: 'config', label: '1. Configuração de Demanda', icon: ConfigIcon },
    { id: 'operational', label: '2. Análise Fazer vs. Comprar', icon: CompareIcon },
    { id: 'ecosystem', label: '3. Saúde do Ecossistema', icon: EcosystemIcon },
    { id: 'calculator', label: 'Calculadora Tributária', icon: CalculatorIcon },
  ];

  return (
    <div className="min-h-screen bg-[#f3f0e8]">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#5c3a21]">Simulador Operacional</h1>
          <p className="text-[#8c6d59] mt-2 max-w-4xl mx-auto">
            Ferramenta de planejamento estratégico para avaliar a viabilidade da internalização versus parceria na oferta de atividades extracurriculares.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          {/* --- BARRA LATERAL --- */}
          <aside className="lg:sticky lg:top-8 self-start space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-[#e0cbb2]">
              <FormControl 
                label={`Ano de Simulação: ${simulationYear}`}
                description={`${simulationYear < 2026 ? 'Cenário atual.' : simulationYear === 2026 ? 'Fase de Teste (0.9% CBS + 0.1% IBS).' : simulationYear < 2029 ? 'Início da CBS (PIS/COFINS extintos).' : simulationYear < 2033 ? 'Transição do ISS para o IBS.' : 'Reforma implementada.'}`}
                children={<Slider value={simulationYear} onChange={setSimulationYear} min={2025} max={2034} />} 
              />
            </div>
            
            <div className="bg-white p-4 rounded-2xl shadow-lg border border-[#e0cbb2]">
                <nav className="space-y-2">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm text-left transition-colors focus:outline-none focus:ring-2 focus:ring-[#ff595a] focus:ring-offset-2 ${
                                activeTab === item.id 
                                ? 'bg-[#ffe9c9] text-[#5c3a21] font-bold' 
                                : 'text-[#8c6d59] hover:bg-[#f3f0e8] hover:text-[#5c3a21]'
                            }`}
                        >
                            <item.icon className="w-5 h-5 flex-shrink-0" />
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>
            </div>
          </aside>
          
          {/* --- CONTEÚDO PRINCIPAL --- */}
          <main>
            <div style={{ display: activeTab === 'config' ? 'block' : 'none' }}>
                <JamSessionStudio scenarios={scenarios} setScenarios={setScenarios} />
            </div>
            <div style={{ display: activeTab === 'operational' ? 'block' : 'none' }}>
                <OperationalSimulator 
                    scenarios={scenarios} 
                    partnershipModel={partnershipModel}
                    setPartnershipModel={setPartnershipModel}
                    simulationYear={simulationYear}
                />
            </div>
            <div style={{ display: activeTab === 'ecosystem' ? 'block' : 'none' }}>
                <EcosystemSimulator 
                    scenarios={scenarios}
                    partnershipModel={partnershipModel}
                    simulationYear={simulationYear}
                />
            </div>
            
            <div style={{ display: activeTab === 'calculator' ? 'block' : 'none' }}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-[#e0cbb2]">
                        <div className="flex items-center gap-3 mb-4">
                            <CalculatorIcon className="w-8 h-8 text-[#ff595a]" />
                            <h2 className="text-xl font-bold text-[#5c3a21]">Configuração</h2>
                        </div>
                        <div className="space-y-4">
                            <FormControl 
                              label="Regime Tributário"
                              children={<Select value={regime} onChange={setRegime} options={Object.values(TaxRegime)} />}
                            />
                             <FormControl label="Receita Bruta (Mensal)" children={
                                <NumberInput value={receita} onChange={setReceita} prefix="R$" formatAsCurrency={true} min={0} max={10000000} step={1000} />
                            }/>
                            <FormControl label="Custo/Despesa (Mensal)" children={
                                <NumberInput value={custo} onChange={setCusto} prefix="R$" formatAsCurrency={true} min={0} max={10000000} step={1000} />
                            }/>
                            {regime === TaxRegime.LUCRO_PRESUMIDO && (
                                <FormControl label="Alíquota de Presunção" children={
                                    <NumberInput value={presuncao} onChange={setPresuncao} prefix="%" min={0} max={100} step={1}/>
                                }/>
                            )}
                            {regime === TaxRegime.LUCRO_REAL && (
                                <>
                                    <FormControl 
                                        label="Custos Geradores de Crédito" 
                                        description="Custos que geram crédito de PIS/COFINS (cenário atual) ou CBS/IBS (reforma)."
                                        children={
                                        <NumberInput value={creditGeneratingCosts} onChange={setCreditGeneratingCosts} prefix="R$" formatAsCurrency={true} min={0} max={10000000} step={100} />
                                    }/>
                                    <FormControl label="Optante do PAT?" description="Reduz o IRPJ devido em 4%." children={
                                        <div className="flex justify-start">
                                            <Toggle enabled={pat} onChange={setPat} />
                                        </div>
                                    }/>
                                </>
                            )}
                             <FormControl label="Atividade (CNAE)" children={
                                <select value={cnaeCode} onChange={(e) => setCnaeCode(e.target.value)} className="w-full rounded-md border-[#e0cbb2] bg-white text-[#5c3a21] shadow-sm focus:border-[#ff595a] focus:ring-1 focus:ring-[#ff595a] px-3 py-2">
                                  {cnaeOptions.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                  ))}
                                </select>
                            }/>

                            {regime === TaxRegime.SIMPLES_NACIONAL && (
                                <>
                                    <FormControl label="Receita Bruta (Últimos 12 meses)" children={
                                        <NumberInput value={rbt12} onChange={setRbt12} prefix="R$" formatAsCurrency={true} min={0} max={4800000} step={10000}/>
                                    }/>
                                    {needsFatorR && (
                                        <FormControl label="Folha de Pagamento (Últimos 12 meses)" description="Necessário para cálculo do Fator R." children={
                                            <NumberInput value={folha} onChange={setFolha} prefix="R$" formatAsCurrency={true} min={0} max={4800000} step={1000} />
                                        }/>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-[#e0cbb2] sticky top-8">
                         <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-xl font-bold text-[#5c3a21]">Resultado da Simulação</h2>
                                <p className="text-sm text-[#8c6d59]">Carga tributária para {regime} em {simulationYear}</p>
                            </div>
                            <GoogleAppsScriptViewer />
                         </div>

                        <div className="space-y-4">
                            <div className="bg-[#f3f0e8] p-4 rounded-lg text-center">
                                <p className="text-sm uppercase font-bold text-[#8c6d59]">Total de Impostos</p>
                                <p className="text-4xl font-bold text-[#ff595a]">{formatCurrency(result.total)}</p>
                                <p className="text-sm font-semibold text-[#5c3a21]">Alíquota Efetiva: {(result.effectiveRate * 100).toFixed(2).replace('.', ',')}%</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {impostosSobreReceita.length > 0 && (
                                     <div className="space-y-2">
                                        <h3 className="font-semibold text-center text-[#5c3a21]">Impostos sobre a Receita</h3>
                                        <div className="bg-[#f3f0e8] p-3 rounded-lg space-y-2">
                                            {impostosSobreReceita.map(tax => (
                                                <div key={tax.name} className="flex justify-between items-baseline text-sm">
                                                    <span className="text-[#8c6d59]">{tax.name} <em className="text-xs not-italic">({tax.rate})</em></span>
                                                    <strong className="font-mono text-[#5c3a21]">{formatCurrency(tax.value)}</strong>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {impostosSobreResultado.length > 0 && (
                                    <div className="space-y-2">
                                        <h3 className="font-semibold text-center text-[#5c3a21]">Impostos sobre o Resultado</h3>
                                        <div className="bg-[#f3f0e8] p-3 rounded-lg space-y-2">
                                            {impostosSobreResultado.map(tax => (
                                                <div key={tax.name} className="flex justify-between items-baseline text-sm">
                                                    <span className="text-[#8c6d59]">{tax.name} <em className="text-xs not-italic">({tax.rate})</em></span>
                                                    <strong className="font-mono text-[#5c3a21]">{formatCurrency(tax.value)}</strong>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                             {creditosGerados.length > 0 && (
                                <div className="space-y-2 pt-2">
                                    <h3 className="font-semibold text-center text-[#5c3a21]">Saldos Credores Gerados (Informativo)</h3>
                                    <div className="bg-green-50 border border-green-200 p-3 rounded-lg space-y-2">
                                        {creditosGerados.map(tax => (
                                            <div key={tax.name} className="flex justify-between items-baseline text-sm">
                                                <span className="text-green-700">{tax.name}</span>
                                                <strong className="font-mono text-green-800">{formatCurrency(tax.value)}</strong>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                             {regime === TaxRegime.SIMPLES_NACIONAL && anexoInfo && (
                                <div className="text-sm text-center bg-[#f3f0e8] p-3 rounded-lg">
                                    <p>
                                        Com RBT12 de <strong className="text-[#5c3a21]">{formatCurrency(rbt12)}</strong>
                                        {needsFatorR && ` e Folha de ${formatCurrency(folha)} (Fator R: ${rbt12 > 0 ? ((folha/rbt12)*100).toFixed(2) : 0}%)`},
                                        a empresa se enquadra no <strong className="text-[#5c3a21]">Anexo {anexoInfo.anexo}</strong>,
                                        na <strong className="text-[#5c3a21]">{faixaInfo?.ordem}ª Faixa</strong>.
                                    </p>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
          </main>
        </div>
      </div>
      <AIChat />
    </div>
  );
};
