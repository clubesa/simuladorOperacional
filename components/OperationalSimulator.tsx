
import React from "react";
import { TaxRegime } from '../types.tsx';
import { cnaes } from '../data/simplesNacional.tsx';
import { calculateTax } from '../services/taxCalculator.tsx';
import { FormControl } from './FormControl.tsx';
import { NumberInput } from './NumberInput.tsx';
import { Select } from './Select.tsx';
import { ExportToSheets } from './ExportToSheets.tsx';

export const OperationalSimulator = ({ scenarios, partnershipModel, setPartnershipModel }) => {
    const { useState, useMemo, useEffect } = React;
    
    const [selectedScenarioIds, setSelectedScenarioIds] = useState([]);

    const [variableCosts, setVariableCosts] = useState({ almoco: 22, lanche: 11 });

    const [fazerState, setFazerState] = useState({
        custoInstrutor: 4500,
        outrosCustos: 3000,
        regime: TaxRegime.LUCRO_REAL,
        cnaeCode: '85.50-3-02',
        creditGeneratingCosts: 1500,
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
        const receita = totalRevenue;
        const custosFixos = (fazerState.custoInstrutor * totalTurmas) + fazerState.outrosCustos;
        const custos = custosFixos + totalVariableCosts;
        
        const taxResult = calculateTax({
            simulationYear: 2033,
            regime: fazerState.regime,
            receita,
            custo: custos,
            presuncao: 32,
            pat: false,
            cnaeCode: fazerState.cnaeCode,
            creditGeneratingCosts: fazerState.creditGeneratingCosts,
        });

        return {
            receita,
            custos,
            impostos: taxResult.total,
            resultado: receita - custos - taxResult.total
        };
    }, [totalRevenue, totalTurmas, fazerState, totalVariableCosts]);

    const comprarResult = useMemo(() => {
        const receita = totalRevenue * (partnershipModel.schoolPercentage / 100);
        const custos = totalVariableCosts; // School still bears the variable costs (lunch, etc.)

        const taxResult = calculateTax({
            simulationYear: 2033,
            regime: comprarState.regime,
            receita,
            custo: custos,
            presuncao: comprarState.presuncao,
            pat: false,
            cnaeCode: comprarState.cnaeCode,
            creditGeneratingCosts: 0,
        });
        
        return {
            receita,
            custos: custos,
            impostos: taxResult.total,
            resultado: receita - custos - taxResult.total
        };
    }, [comprarState, totalRevenue, partnershipModel, totalVariableCosts]);

    const cnaeOptions = useMemo(() => cnaes.map(c => ({
        value: c.cnae,
        label: `${c.cnae} - ${c.descricao}`
    })), []);
    
    const diferencaResultado = comprarResult.resultado - fazerResult.resultado;

    const ScenarioCard = ({ title, subtitle, children, className = "" }) => (
        <div className={`bg-[#f3f0e8] p-6 rounded-2xl shadow-lg border border-[#e0cbb2] ${className}`}>
            <h3 className="text-xl font-bold text-[#5c3a21]">{title}</h3>
            <p className="text-sm text-[#8c6d59] mb-6">{subtitle}</p>
            <div className="space-y-4">
                {children}
            </div>
        </div>
    );

    const ResultDisplay = ({ result, studentCount }) => (
        <div className="mt-6 space-y-2 text-sm">
            <div className="flex justify-between"><span>Receita Bruta</span> <strong>{formatCurrency(result.receita)}</strong></div>
            <div className="flex justify-between text-red-700"><span>(-) Custos e Despesas</span> <span>{formatCurrency(result.custos)}</span></div>
            <div className="flex justify-between text-red-700"><span>(-) Impostos</span> <span>{formatCurrency(result.impostos)}</span></div>
            <hr className="border-t border-[#e0cbb2] my-2" />
            <div className="flex justify-between font-bold text-base"><span>(=) Resultado Líquido</span> <span className="text-[#ff595a]">{formatCurrency(result.resultado)}</span></div>
             <div className="pt-2 mt-2 border-t border-dashed border-[#e0cbb2]">
                <p className="text-xs font-bold uppercase text-[#8c6d59] tracking-wider mb-2 text-center">Unit Economics</p>
                <div className="flex justify-between text-sm">
                    <span className="text-[#8c6d59]">Resultado por Aluno</span> 
                    <strong className="text-[#5c3a21]">{formatCurrency(studentCount > 0 ? result.resultado / studentCount : 0)}</strong>
                </div>
            </div>
        </div>
    );

    return (
        <div className="mt-4">
            <h2 className="text-2xl font-bold text-center mb-2 text-[#5c3a21]">Análise Fazer vs. Comprar</h2>
            <p className="text-center text-[#8c6d59] mb-8 max-w-3xl mx-auto">
                Compare o resultado financeiro de operar o extracurricular internamente versus firmar uma parceria,
                considerando um cenário com a Reforma Tributária consolidada (2033+).
            </p>
            
            <div className="max-w-2xl mx-auto mb-8">
              {/* FIX: Changed to explicit children prop to resolve error. */}
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
                {/* FIX: Changed to explicit children prop to resolve error. */}
                <ScenarioCard
                    title="Parâmetros Variáveis (por Aluno/Dia)"
                    subtitle="Custos que se aplicam a ambos os cenários e dependem do número de alunos."
                    children={
                        <>
                            <div className="grid md:grid-cols-2 gap-4">
                                <FormControl
                                    label="Custo do Almoço"
                                    // FIX: Added missing min, max, and step props to NumberInput.
                                    children={<NumberInput value={variableCosts.almoco} onChange={v => handleVariableCostsChange('almoco', v)} prefix="R$" formatAsCurrency={true} min={0} max={1000} step={1} />}
                                />
                                <FormControl
                                    label="Custo do Lanche"
                                    // FIX: Added missing min, max, and step props to NumberInput.
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
                            // FIX: Added missing min, max, and step props to NumberInput.
                            children={<NumberInput value={fazerState.custoInstrutor} onChange={v => handleFazerChange('custoInstrutor', v)} prefix="R$" formatAsCurrency={true} min={0} max={99999} step={1} />}
                        />
                        <FormControl 
                            label="Outros Custos Mensais (Software, etc.)"
                            // FIX: Added missing min, max, and step props to NumberInput.
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
                            <FormControl 
                                label="Custos Geradores de Crédito (CBS/IBS)"
                                // FIX: Added missing min, max, and step props to NumberInput.
                                children={<NumberInput value={fazerState.creditGeneratingCosts} onChange={v => handleFazerChange('creditGeneratingCosts', v)} prefix="R$" formatAsCurrency={true} min={0} max={99999} step={1} />}
                            />
                        )}
                       <ResultDisplay result={fazerResult} studentCount={totalStudents} />
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
                         <ResultDisplay result={comprarResult} studentCount={totalStudents} />
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