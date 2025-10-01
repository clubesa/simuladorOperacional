import React from "react";
import { TaxRegime } from '../types.tsx';
import { cnaes } from '../data/simplesNacional.tsx';
import { calculateTax } from '../services/taxCalculator.tsx';
import { FormControl } from './FormControl.tsx';
import { NumberInput } from './NumberInput.tsx';
import { Select } from './Select.tsx';
import { ExportToSheets } from './ExportToSheets.tsx';
import { Toggle } from './Toggle.tsx';
import { Slider } from './Slider.tsx';

export const OperationalSimulator = ({ scenarios, partnershipModel, setPartnershipModel, simulationYear, setSimulationYear }) => {
    const { useState, useMemo, useEffect } = React;
    
    const [selectedScenarioIds, setSelectedScenarioIds] = useState([]);

    const [variableCosts, setVariableCosts] = useState({ almoco: 22, lanche: 11 });

    const [fazerState, setFazerState] = useState({
        custoInstrutor: 4500,
        outrosCustos: 3000,
        regime: TaxRegime.LUCRO_REAL,
        cnaeCode: '85.50-3-02',
        creditGeneratingCosts: 1500,
        pat: false,
    });
    
    const handleVariableCostsChange = (field, value) => {
        setVariableCosts(prev => ({ ...prev, [field]: value }));
    };

    const handleFazerChange = (field, value) => {
        setFazerState(prev => ({ ...prev, [field]: value }));
    };
    
    const handlePartnershipModelChange = (field, value) => {
        setPartnershipModel(prev => ({ ...prev, [field]: value }));
    };

    const [comprarState, setComprarState] = useState({
        regime: TaxRegime.LUCRO_PRESUMIDO,
        cnaeCode: '74.90-1-04',
        presuncao: 32,
    });
    
    const handleComprarChange = (field, value) => {
        setComprarState(prev => ({ ...prev, [field]: value }));
    };
    
    useEffect(() => {
        setSelectedScenarioIds(scenarios.map(s => s.id));
    }, [scenarios]);

    const handleScenarioSelectionChange = (scenarioId) => {
        setSelectedScenarioIds(prev =>
            prev.includes(scenarioId)
                ? prev.filter(id => id !== scenarioId)
                : [...prev, scenarioId]
        );
    };

    const uniqueSchools = useMemo(() => {
        if (!scenarios) return [];
        const schools = new Set(scenarios.map(s => s.school));
        return Array.from(schools);
    }, [scenarios]);

    const handleSelectAll = () => {
        setSelectedScenarioIds(scenarios.map(s => s.id));
    };

    const handleDeselectAll = () => {
        setSelectedScenarioIds([]);
    };
    
    const handleSelectBySchool = (school) => {
        const schoolScenarioIds = scenarios
            .filter(s => s.school === school)
            .map(s => s.id);
        setSelectedScenarioIds(schoolScenarioIds);
    };

    const filteredScenarios = useMemo(() => {
        return scenarios.filter(s => selectedScenarioIds.includes(s.id));
    }, [scenarios, selectedScenarioIds]);
    
    const { totalRevenue, totalTurmas, totalStudents } = useMemo(() => {
        if (!filteredScenarios || filteredScenarios.length === 0) {
            return { totalRevenue: 0, totalTurmas: 0, totalStudents: 0 };
        }
        return filteredScenarios.reduce((acc, scenario) => {
            acc.totalRevenue += scenario.avgStudents * scenario.unitPrice;
            acc.totalTurmas += Object.values(scenario.schedule).reduce((count: number, day) => count + Object.keys(day || {}).length, 0);
            acc.totalStudents += scenario.avgStudents;
            return acc;
        }, { totalRevenue: 0, totalTurmas: 0, totalStudents: 0 });
    }, [filteredScenarios]);

    const totalStudentDaysPerWeek = useMemo(() => {
        if (!filteredScenarios || filteredScenarios.length === 0) return 0;
        return filteredScenarios.reduce((acc, scenario) => acc + (scenario.avgStudents * scenario.frequency), 0);
    }, [filteredScenarios]);

    const totalVariableCosts = useMemo(() => {
        // Assume 4 weeks per month as per business logic
        return totalStudentDaysPerWeek * 4 * (variableCosts.almoco + variableCosts.lanche);
    }, [totalStudentDaysPerWeek, variableCosts]);


    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const fazerResult = useMemo(() => {
        const receitaBruta = totalRevenue;
        const custosVariaveis = totalVariableCosts;
        const custosFixos = (fazerState.custoInstrutor * totalTurmas) + fazerState.outrosCustos;
        const custosTotais = custosVariaveis + custosFixos;
        
        const taxResult = calculateTax({
            simulationYear: simulationYear,
            regime: fazerState.regime,
            receita: totalRevenue,
            custo: custosTotais,
            presuncao: 32, // Not used in Lucro Real for this calc, but passed for consistency
            pat: fazerState.pat,
            cnaeCode: fazerState.cnaeCode,
            creditGeneratingCosts: fazerState.creditGeneratingCosts,
        });
        
        const impostosSobreReceitaDetails = taxResult.breakdown.filter(i => i.category === 'receita');
        const impostosSobreResultadoDetails = taxResult.breakdown.filter(i => i.category === 'resultado');
        const impostosSobreReceita = impostosSobreReceitaDetails.reduce((sum, i) => sum + i.value, 0);
        const impostosSobreResultado = impostosSobreResultadoDetails.reduce((sum, i) => sum + i.value, 0);

        const receitaLiquida = receitaBruta - impostosSobreReceita;
        const margemContribuicao = receitaLiquida - custosVariaveis;
        const margemContribuicaoPercent = receitaBruta > 0 ? margemContribuicao / receitaBruta : 0;
        const ebit = margemContribuicao - custosFixos;
        const resultadoLiquido = ebit - impostosSobreResultado;
        
        const mcUnitaria = totalStudents > 0 ? (receitaBruta - custosVariaveis - impostosSobreReceita) / totalStudents : 0;
        const bepAlunos = mcUnitaria > 0 ? custosFixos / mcUnitaria : Infinity;
        const receitaPorAluno = totalStudents > 0 ? receitaBruta / totalStudents : 0;
        const bepReceita = bepAlunos * receitaPorAluno;

        return {
            dre: {
                receitaBruta,
                impostosSobreReceita,
                impostosSobreReceitaDetails,
                receitaLiquida,
                custosVariaveis,
                margemContribuicao,
                margemContribuicaoPercent,
                custosFixos,
                ebit,
                impostosSobreResultado,
                impostosSobreResultadoDetails,
                resultadoLiquido,
            },
            bep: {
                alunos: bepAlunos,
                receita: bepReceita
            },
            unitEconomics: {
                resultadoPorAluno: totalStudents > 0 ? resultadoLiquido / totalStudents : 0
            }
        };
    }, [totalRevenue, totalTurmas, fazerState, totalVariableCosts, simulationYear, totalStudents]);

    const comprarResult = useMemo(() => {
        const receitaBruta = totalRevenue * (partnershipModel.schoolPercentage / 100);
        const custosVariaveis = totalVariableCosts; // School still bears the variable costs (lunch, etc.)
        const custosFixos = 0;
        const custosTotais = custosVariaveis + custosFixos;

        const taxResult = calculateTax({
            simulationYear: simulationYear,
            regime: comprarState.regime,
            receita: receitaBruta,
            custo: custosTotais,
            presuncao: comprarState.presuncao,
            pat: false,
            cnaeCode: comprarState.cnaeCode,
            creditGeneratingCosts: 0,
        });
        
        const impostosSobreReceitaDetails = taxResult.breakdown.filter(i => i.category === 'receita');
        const impostosSobreResultadoDetails = taxResult.breakdown.filter(i => i.category === 'resultado');
        const impostosSobreReceita = impostosSobreReceitaDetails.reduce((sum, i) => sum + i.value, 0);
        const impostosSobreResultado = impostosSobreResultadoDetails.reduce((sum, i) => sum + i.value, 0);

        const receitaLiquida = receitaBruta - impostosSobreReceita;
        const margemContribuicao = receitaLiquida - custosVariaveis;
        const margemContribuicaoPercent = receitaBruta > 0 ? margemContribuicao / receitaBruta : 0;
        const ebit = margemContribuicao - custosFixos;
        const resultadoLiquido = ebit - impostosSobreResultado;

        return {
             dre: {
                receitaBruta,
                impostosSobreReceita,
                impostosSobreReceitaDetails,
                receitaLiquida,
                custosVariaveis,
                margemContribuicao,
                margemContribuicaoPercent,
                custosFixos,
                ebit,
                impostosSobreResultado,
                impostosSobreResultadoDetails,
                resultadoLiquido,
            },
            bep: {
                alunos: 0,
                receita: 0
            },
            unitEconomics: {
                resultadoPorAluno: totalStudents > 0 ? resultadoLiquido / totalStudents : 0
            }
        };
    }, [comprarState, totalRevenue, partnershipModel, totalVariableCosts, simulationYear, totalStudents]);

    const cnaeOptions = useMemo(() => cnaes.map(c => ({
        value: c.cnae,
        label: `${c.cnae} - ${c.descricao}`
    })), []);
    
    const diferencaResultado = comprarResult.dre.resultadoLiquido - fazerResult.dre.resultadoLiquido;

    const ScenarioCard = ({ title, subtitle, children, className = "" }) => (
        <div className={`bg-[#f3f0e8] p-6 rounded-2xl shadow-lg border border-[#e0cbb2] ${className}`}>
            <h3 className="text-xl font-bold text-[#5c3a21]">{title}</h3>
            <p className="text-sm text-[#8c6d59] mb-6">{subtitle}</p>
            <div className="space-y-4">
                {children}
            </div>
        </div>
    );

    const DREDisplay = ({ dre, bep, unitEconomics }) => {
        const { useState } = React;
        const [showReceitaDetails, setShowReceitaDetails] = useState(false);
        const [showResultadoDetails, setShowResultadoDetails] = useState(false);

        const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
        const formatNumber = (value) => new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value);
    
        const resultadoColorClass = dre.resultadoLiquido >= 0 ? 'text-green-600' : 'text-[#5c3a21]';
        
        const ChevronDownIcon = ({ className = "w-4 h-4 transition-transform" }) => (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        );
    
        const DRELine = ({ label, value, isSubtotal = false, isFinal = false, customColorClass = "" }) => (
            <div className={`flex justify-between items-baseline text-sm ${isSubtotal ? 'font-semibold' : ''} ${isFinal ? 'font-bold text-base' : ''}`}>
                <span>{label}</span>
                <strong className={`${customColorClass || (isFinal ? resultadoColorClass : 'text-[#5c3a21]')} font-mono`}>{formatCurrency(value)}</strong>
            </div>
        );

        return (
            <div className="mt-6 space-y-2">
                <h4 className="font-semibold text-sm uppercase tracking-wider text-center text-[#8c6d59] border-b border-[#e0cbb2] pb-2 mb-4">Estrutura de Resultado</h4>
                
                <DRELine label="Receita Bruta" value={dre.receitaBruta} />

                {/* Collapsible Impostos s/ Receita */}
                <div className="text-sm">
                    <div className="flex justify-between items-center">
                        <button onClick={() => setShowReceitaDetails(!showReceitaDetails)} className="flex items-center gap-2 text-left p-1 -ml-1 rounded-md hover:bg-[#e0cbb2]/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff595a]" aria-expanded={showReceitaDetails}>
                            <span>(-) Impostos s/ Receita</span>
                            <ChevronDownIcon className={`w-3.5 h-3.5 text-[#8c6d59] transition-transform duration-200 ${showReceitaDetails ? 'rotate-180' : ''}`} />
                        </button>
                        <strong className="font-mono text-[#5c3a21]">{formatCurrency(-dre.impostosSobreReceita)}</strong>
                    </div>
                    {showReceitaDetails && dre.impostosSobreReceitaDetails && dre.impostosSobreReceitaDetails.length > 0 && (
                        <div className="pl-6 mt-1 space-y-1 text-xs ml-1 py-1">
                            {dre.impostosSobreReceitaDetails.map(tax => (
                                <div key={tax.name} className="flex justify-between items-baseline">
                                    <span className="text-[#8c6d59]">{tax.name} ({tax.rate})</span>
                                    <strong className="font-mono text-[#5c3a21]">{formatCurrency(tax.value)}</strong>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                <DRELine label="(=) Receita Líquida" value={dre.receitaLiquida} isSubtotal={true} />
                
                <div className="pt-2 mt-2 border-t border-dashed border-[#e0cbb2]">
                    <DRELine label="(-) Custos Variáveis" value={-dre.custosVariaveis} />
                    <div className="flex justify-between items-baseline text-sm font-semibold">
                        <span>(=) Margem de Contribuição</span>
                        <strong className="font-mono text-[#5c3a21]">{formatCurrency(dre.margemContribuicao)} <span className="text-xs font-normal text-[#8c6d59]">({(dre.margemContribuicaoPercent * 100).toFixed(1).replace('.', ',')}%)</span></strong>
                    </div>
                </div>
    
                <div className="pt-2 mt-2 border-t border-dashed border-[#e0cbb2]">
                    <DRELine label="(-) Custos Fixos" value={-dre.custosFixos} />
                    <DRELine label="(=) EBIT" value={dre.ebit} isSubtotal={true} />
                </div>
    
                <div className="pt-2 mt-2 border-t border-dashed border-[#e0cbb2]">
                     {/* Collapsible Impostos s/ Resultado */}
                    <div className="text-sm">
                        <div className="flex justify-between items-center">
                            <button onClick={() => setShowResultadoDetails(!showResultadoDetails)} className="flex items-center gap-2 text-left p-1 -ml-1 rounded-md hover:bg-[#e0cbb2]/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff595a]" aria-expanded={showResultadoDetails}>
                                <span>(-) Impostos s/ Resultado</span>
                                <ChevronDownIcon className={`w-3.5 h-3.5 text-[#8c6d59] transition-transform duration-200 ${showResultadoDetails ? 'rotate-180' : ''}`} />
                            </button>
                            <strong className="font-mono text-[#5c3a21]">{formatCurrency(-dre.impostosSobreResultado)}</strong>
                        </div>
                        {showResultadoDetails && dre.impostosSobreResultadoDetails && dre.impostosSobreResultadoDetails.length > 0 && (
                            <div className="pl-6 mt-1 space-y-1 text-xs ml-1 py-1">
                                {dre.impostosSobreResultadoDetails.map(tax => (
                                    <div key={tax.name} className="flex justify-between items-baseline">
                                        <span className="text-[#8c6d59]">{tax.name} ({tax.rate})</span>
                                        <strong className="font-mono text-[#5c3a21]">{formatCurrency(tax.value)}</strong>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
    
                <hr className="border-t border-[#e0cbb2] my-2" />
                
                <DRELine label="(=) Resultado Líquido" value={dre.resultadoLiquido} isFinal={true} customColorClass={resultadoColorClass.replace('#', 'e6cbe4')} />
    
                {bep && (
                    <div className="pt-2 mt-2 border-t border-dashed border-[#e0cbb2]">
                        <p className="text-xs font-bold uppercase text-[#8c6d59] tracking-wider mb-2 text-center">Ponto de Equilíbrio</p>
                        <div className="text-xs text-center bg-white p-2 rounded-md border border-[#e0cbb2]">
                            {bep.alunos !== undefined && (
                                 <p>Matrículas: <strong className="text-[#5c3a21]">{isFinite(bep.alunos) ? `${formatNumber(bep.alunos)}` : 'N/A'}</strong></p>
                            )}
                            <p>Receita: <strong className="text-[#5c3a21]">{isFinite(bep.receita) ? formatCurrency(bep.receita) : 'N/A'}</strong></p>
                        </div>
                    </div>
                )}
                
                {unitEconomics && (
                     <div className="pt-2 mt-2 border-t border-dashed border-[#e0cbb2]">
                        <p className="text-xs font-bold uppercase text-[#8c6d59] tracking-wider mb-2 text-center">Unit Economics</p>
                        <div className="flex justify-between text-sm">
                            <span className="text-[#8c6d59]">Resultado por Aluno</span> 
                            <strong className="text-[#5c3a21] font-mono">{formatCurrency(unitEconomics.resultadoPorAluno)}</strong>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="mt-4">
            <h2 className="text-2xl font-bold text-center mb-2 text-[#5c3a21]">Análise Fazer vs. Comprar</h2>
            <p className="text-center text-[#8c6d59] mb-8 max-w-3xl mx-auto">
                Compare o resultado financeiro de operar o extracurricular internamente versus firmar uma parceria.
            </p>
            
            <div className="max-w-2xl mx-auto mb-8">
              <FormControl 
                label="Cenários a Analisar"
                children={scenarios.length > 0 ? (
                    <div className="bg-white p-4 rounded-md border border-[#e0cbb2] space-y-3">
                        <div className="flex justify-between items-center pb-2 border-b border-[#e0cbb2] flex-wrap gap-y-2">
                            <p className="text-sm font-semibold text-[#5c3a21] mr-4">
                                {selectedScenarioIds.length} de {scenarios.length} selecionado(s)
                            </p>
                            <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Filtros de seleção de cenário">
                                <button onClick={handleSelectAll} className="text-xs font-medium text-[#ff595a] hover:underline">Grupo BR</button>
                                {uniqueSchools.map(school => (
                                    <React.Fragment key={school}>
                                        <span className="text-gray-300">|</span>
                                        <button onClick={() => handleSelectBySchool(school)} className="text-xs font-medium text-[#ff595a] hover:underline">
                                            {school}
                                        </button>
                                    </React.Fragment>
                                ))}
                                <span className="text-gray-300">|</span>
                                <button onClick={handleDeselectAll} className="text-xs font-medium text-[#8c6d59] hover:underline">Limpar</button>
                            </div>
                        </div>
                        <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                            {scenarios.map(scenario => (
                                <label key={scenario.id} className="flex items-center p-2 rounded-md hover:bg-[#f3f0e8] cursor-pointer transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={selectedScenarioIds.includes(scenario.id)}
                                        onChange={() => handleScenarioSelectionChange(scenario.id)}
                                        className="h-4 w-4 rounded border-gray-300 text-[#ff595a] focus:ring-[#ff595a]"
                                    />
                                    <div className="ml-3 text-sm">
                                        <span className="font-semibold text-[#5c3a21]">{scenario.school}</span> - <span>{scenario.productName}</span>
                                        <span className="text-[#8c6d59] ml-2">({scenario.avgStudents} alunos)</span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-center text-[#8c6d59] p-4 bg-white rounded-md border border-dashed border-[#e0cbb2]">
                        Nenhum cenário de demanda foi salvo ainda. Adicione cenários na aba "1. Configuração de Demanda".
                    </p>
                )}
              />
               <p className="text-xs text-center text-[#8c6d59] mt-2">
                    Analisando <strong>{filteredScenarios.length}</strong> cenário(s) selecionado(s) com um total de <strong>{totalStudents}</strong> aluno(s).
                </p>
            </div>
            
            <div className="max-w-4xl mx-auto mb-8">
                <ScenarioCard
                    title="Parâmetros Variáveis (por Aluno/Dia)"
                    subtitle="Custos que se aplicam a ambos os cenários e dependem do número de alunos."
                    children={
                        <>
                            <div className="grid md:grid-cols-2 gap-4">
                                <FormControl
                                    label="Custo do Almoço"
                                    children={<NumberInput value={variableCosts.almoco} onChange={v => handleVariableCostsChange('almoco', v)} prefix="R$" formatAsCurrency={true} min={0} max={1000} step={1} />}
                                />
                                <FormControl
                                    label="Custo do Lanche"
                                    children={<NumberInput value={variableCosts.lanche} onChange={v => handleVariableCostsChange('lanche', v)} prefix="R$" formatAsCurrency={true} min={0} max={1000} step={1} />}
                                />
                            </div>
                            <p className="text-xs text-center text-[#8c6d59] mt-2">
                                Total de "Aluno-Dias" por semana (calculado): <strong>{totalStudentDaysPerWeek}</strong>. O custo mensal total é calculado considerando 4 semanas.
                            </p>
                        </>
                    }
                />
            </div>

            <div className="max-w-4xl mx-auto mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-[#e0cbb2]">
                    {/* FIX: Changed component to pass children as an explicit prop instead of nested JSX. */}
                    <FormControl 
                        label={`Ano de Simulação: ${simulationYear}`}
                        description={`${simulationYear < 2026 ? 'Cenário atual.' : simulationYear === 2026 ? 'Fase de Teste (0.9% CBS + 0.1% IBS).' : simulationYear < 2029 ? 'Início da CBS (PIS/COFINS extintos).' : simulationYear < 2033 ? 'Transição do ISS para o IBS.' : 'Reforma implementada.'}`}
                        children={
                            <div className="pt-2">
                                <Slider value={simulationYear} onChange={setSimulationYear} min={2025} max={2034} />
                            </div>
                        }
                    /> 
                </div>
            </div>


            <div className="grid md:grid-cols-2 gap-8 mt-8">
                <ScenarioCard 
                    title="Cenário 1: Fazer" 
                    subtitle="Operação internalizada pela escola."
                    children={<>
                        <h4 className="font-semibold text-sm uppercase tracking-wider text-[#8c6d59] border-b border-[#e0cbb2] pb-2 mb-4">Parâmetros de Custo</h4>
                        <div className="p-3 bg-white rounded-md border border-[#e0cbb2] text-sm space-y-1">
                            <div className="flex justify-between">
                                <span className="text-[#8c6d59]">Nº de Turmas (Calculado):</span>
                                <span className="font-bold text-[#5c3a21]">{totalTurmas}</span>
                            </div>
                             <div className="flex justify-between">
                                <span className="text-[#8c6d59]">Receita Total (Calculada):</span>
                                <span className="font-bold text-[#5c3a21]">{formatCurrency(totalRevenue)}</span>
                            </div>
                        </div>
                        <FormControl 
                            label="Custo Total por Instrutor/Turma (CLT)"
                            children={<NumberInput value={fazerState.custoInstrutor} onChange={v => handleFazerChange('custoInstrutor', v)} prefix="R$" formatAsCurrency={true} min={0} max={99999} step={1} />}
                        />
                        <FormControl 
                            label="Outros Custos Mensais (Software, etc.)"
                            children={<NumberInput value={fazerState.outrosCustos} onChange={v => handleFazerChange('outrosCustos', v)} prefix="R$" formatAsCurrency={true} min={0} max={99999} step={1} />}
                        />

                        <h4 className="font-semibold text-sm uppercase tracking-wider text-[#8c6d59] border-b border-[#e0cbb2] pb-2 my-4 pt-4">Parâmetros Tributários</h4>
                        <FormControl 
                            label="Regime Tributário"
                            children={<Select value={fazerState.regime} onChange={v => handleFazerChange('regime', v)} options={[TaxRegime.LUCRO_REAL, TaxRegime.LUCRO_PRESUMIDO]} />}
                        />
                         <FormControl 
                            label="Atividade (CNAE)"
                            children={
                                <select value={fazerState.cnaeCode} onChange={e => handleFazerChange('cnaeCode', e.target.value)} className="w-full rounded-md border-[#e0cbb2] bg-white text-[#5c3a21] shadow-sm focus:border-[#ff595a] focus:ring-1 focus:ring-[#ff595a] px-3 py-2">
                                {cnaeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                            }
                        />
                        {fazerState.regime === TaxRegime.LUCRO_REAL && (
                            <>
                                <FormControl 
                                    label="Custos Geradores de Crédito"
                                    description="Custos que geram crédito de PIS/COFINS (cenário atual) ou CBS/IBS (reforma)."
                                    children={<NumberInput value={fazerState.creditGeneratingCosts} onChange={v => handleFazerChange('creditGeneratingCosts', v)} prefix="R$" formatAsCurrency={true} min={0} max={99999} step={1} />}
                                />
                                <FormControl 
                                    label="Optante do PAT?" 
                                    description="Reduz o IRPJ devido em 4%." 
                                    children={
                                        <div className="flex justify-start">
                                            <Toggle enabled={fazerState.pat} onChange={v => handleFazerChange('pat', v)} />
                                        </div>
                                    }
                                />
                            </>
                        )}
                       <DREDisplay dre={fazerResult.dre} bep={fazerResult.bep} unitEconomics={fazerResult.unitEconomics} />
                    </>}
                />

                <ScenarioCard 
                    title="Cenário 2: Comprar" 
                    subtitle="Parceria estratégica com a LABirintar."
                    children={<>
                        <h4 className="font-semibold text-sm uppercase tracking-wider text-[#8c6d59] border-b border-[#e0cbb2] pb-2 mb-4">Modelo de Remuneração da Escola</h4>
                         <FormControl 
                            label="Modelo de Remuneração"
                            children={<Select value={partnershipModel.model} onChange={v => handlePartnershipModelChange('model', v)} options={['Entrada', 'Escala']} />}
                        />
                        <FormControl 
                            label="Percentual da Receita para Escola"
                            children={<NumberInput value={partnershipModel.schoolPercentage} onChange={v => handlePartnershipModelChange('schoolPercentage', v)} prefix="%" min={0} max={100} step={1} />}
                        />
                        
                        <h4 className="font-semibold text-sm uppercase tracking-wider text-[#8c6d59] border-b border-[#e0cbb2] pb-2 my-4 pt-4">Parâmetros Tributários da Escola</h4>
                        <FormControl 
                            label="Regime Tributário"
                            children={<Select value={comprarState.regime} onChange={v => handleComprarChange('regime', v)} options={[TaxRegime.LUCRO_PRESUMIDO, TaxRegime.LUCRO_REAL]} />}
                        />
                         <FormControl 
                            label="Atividade (CNAE)"
                            children={
                                <select value={comprarState.cnaeCode} onChange={e => handleComprarChange('cnaeCode', e.target.value)} className="w-full rounded-md border-[#e0cbb2] bg-white text-[#5c3a21] shadow-sm focus:border-[#ff595a] focus:ring-1 focus:ring-[#ff595a] px-3 py-2">
                                {cnaeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                            }
                        />
                        {comprarState.regime === TaxRegime.LUCRO_PRESUMIDO && (
                             <FormControl 
                                label="Alíquota de Presunção"
                                children={<NumberInput value={comprarState.presuncao} onChange={v => handleComprarChange('presuncao', v)} prefix="%" min={0} max={100} step={1} />}
                            />
                        )}
                         <DREDisplay dre={comprarResult.dre} bep={comprarResult.bep} unitEconomics={comprarResult.unitEconomics} />
                    </>}
                />
            </div>

             <div className="mt-8 bg-white p-6 rounded-2xl shadow-xl border border-[#e0cbb2]">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-[#5c3a21]">Análise Comparativa de Resultado</h3>
                    <ExportToSheets />
                </div>
                <div className="mt-4 text-center">
                    {diferencaResultado > 0 ? (
                        <p className="text-lg">
                            O cenário <strong>"Comprar"</strong> (Parceria LABirintar) é <strong className="text-green-600">{formatCurrency(diferencaResultado)}</strong> mais rentável por mês para a Escola.
                        </p>
                    ) : (
                         <p className="text-lg">
                            O cenário <strong>"Fazer"</strong> (Operação Própria) é <strong className="text-red-600">{formatCurrency(Math.abs(diferencaResultado))}</strong> mais rentável por mês para a Escola.
                        </p>
                    )}
                     <p className="text-sm text-[#8c6d59] mt-2 max-w-2xl mx-auto">
                        Esta análise é puramente financeira. O cenário "Comprar" também elimina riscos operacionais, trabalhistas, de inadimplência e a complexidade da gestão, agregando valor estratégico não quantificado aqui.
                    </p>
                </div>
            </div>

        </div>
    );
};