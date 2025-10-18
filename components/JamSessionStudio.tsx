import React from "react";
import { productDataBySchool } from '../data/jamSessionData.tsx';
import { Slider } from './Slider.tsx';
import { FormControl } from './FormControl.tsx';
import { NumberInput } from './NumberInput.tsx';
import { DeterministicScenarioGenerator } from './DeterministicScenarioGenerator.tsx';
import { StochasticScenarioGenerator } from './StochasticScenarioGenerator.tsx';
import { InfoTooltip } from './InfoTooltip.tsx';
import { usePersistentState } from '../App.tsx';

const JAM_SESSION_DEFAULTS = {
    MIN_CAPACITY: 6,
    MAX_CAPACITY: 12,
};

export const JamSessionStudio = ({ scenarios, setScenarios, variableCosts, setVariableCosts, resetVariableCosts, variableCostsDefault }) => {
    const { useMemo, useRef, useEffect } = React;

    const [mode, setMode, resetMode] = usePersistentState('sim-jam-mode', 'deterministico');
    const [selectedSchool, setSelectedSchool, resetSelectedSchool] = usePersistentState('sim-jam-selectedSchool', Object.keys(productDataBySchool)[0]);
    const availableProducts = useMemo(() => productDataBySchool[selectedSchool], [selectedSchool]);
    
    const [minCapacity, setMinCapacity, resetMinCapacity] = usePersistentState('sim-jam-minCapacity', JAM_SESSION_DEFAULTS.MIN_CAPACITY);
    const [maxCapacity, setMaxCapacity, resetMaxCapacity] = usePersistentState('sim-jam-maxCapacity', JAM_SESSION_DEFAULTS.MAX_CAPACITY);

    const [selectedScenarioIds, setSelectedScenarioIds] = React.useState([]);
    const selectAllCheckboxRef = useRef(null);
    const [editingScenario, setEditingScenario] = React.useState(null);

    useEffect(() => {
        if (selectAllCheckboxRef.current) {
            const numSelected = selectedScenarioIds.length;
            const numScenarios = scenarios.length;
            selectAllCheckboxRef.current.checked = numSelected === numScenarios && numScenarios > 0;
            selectAllCheckboxRef.current.indeterminate = numSelected > 0 && numSelected < numScenarios;
        }
    }, [selectedScenarioIds, scenarios]);

    const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    
    const handleScenarioSelectionChange = (id) => {
        setSelectedScenarioIds(prev =>
            prev.includes(id) ? prev.filter(scenarioId => scenarioId !== id) : [...prev, id]
        );
    };

    const handleSelectAllChange = (e) => {
        if (e.target.checked) {
            setSelectedScenarioIds(scenarios.map(s => s.id));
        } else {
            setSelectedScenarioIds([]);
        }
    };
    
    const handleDeleteSelected = () => {
        setScenarios(prev => prev.filter(s => !selectedScenarioIds.includes(s.id)));
        setSelectedScenarioIds([]);
    };

    const EditIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
          <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
          <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
        </svg>
    );

    return (
        <div className="my-2">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-8">
                    <h2 className="text-xl font-bold text-[#5c3a21]">Jam Session Studio</h2>
                    <p className="text-[#8c6d59] max-w-3xl mx-auto">
                        Configure a escola, os produtos e a demanda de alunos. Os cenários salvos serão usados na aba de análise.
                    </p>
                </div>
                
                <div className="space-y-6 border-b border-[#bf917f] pb-8 mb-8">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 items-start">
                        <div>
                            <FormControl label="1. Selecione a Escola">
                                <select value={selectedSchool} onChange={(e) => setSelectedSchool(e.target.value)} className="w-full rounded-md border-[#bf917f] bg-white text-[#5c3a21] shadow-sm focus:border-[#ff595a] focus:ring-1 focus:ring-[#ff595a] px-3 py-2">
                                    {Object.keys(productDataBySchool).map(school => <option key={school} value={school}>{school}</option>)}
                                </select>
                            </FormControl>
                        </div>
                        <div className="space-y-2">
                             <FormControl label="Custo do Almoço" description="Custo unitário por aluno. Usado nas simulações.">
                                <NumberInput 
                                    value={variableCosts.almoco} 
                                    onChange={v => setVariableCosts(prev => ({ ...prev, almoco: v }))} 
                                    prefix="R$" 
                                    formatAsCurrency={true}
                                    min={0}
                                    max={100}
                                    step={0.5}
                                    defaultValue={variableCostsDefault.almoco}
                                    onReset={resetVariableCosts}
                                />
                            </FormControl>
                            <FormControl label="Custo do Lanche" description="Custo unitário por aluno. Usado nas simulações.">
                                <NumberInput 
                                    value={variableCosts.lanche} 
                                    onChange={v => setVariableCosts(prev => ({ ...prev, lanche: v }))} 
                                    prefix="R$" 
                                    formatAsCurrency={true}
                                    min={0}
                                    max={50}
                                    step={0.5}
                                    defaultValue={variableCostsDefault.lanche}
                                    onReset={resetVariableCosts}
                                />
                            </FormControl>
                        </div>
                    </div>
                    
                    <div className="flex justify-center pt-4">
                        <FormControl label="2. Escolha o Modo de Previsão" className="items-center">
                            <div className="bg-white p-1 rounded-lg border border-[#bf917f] flex items-center space-x-1" role="tablist" aria-label="Modo de Previsão">
                                <div className="flex items-center">
                                    <button 
                                        onClick={() => setMode('deterministico')} 
                                        className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#ff595a] ${mode === 'deterministico' ? 'bg-[#ff595a] text-white' : 'text-[#5c3a21] hover:bg-[#f4f0e8]'}`}
                                        role="tab"
                                        aria-selected={mode === 'deterministico'}
                                    >
                                        Determinística
                                    </button>
                                    <div className="pr-1">
                                        <InfoTooltip text="Neste modo, você define um cenário de demanda único e fixo, com um número exato de alunos para cada produto. Ideal para planejar com base em projeções conhecidas ou para criar um cenário base manualmente." />
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <button 
                                        onClick={() => setMode('estocastico')} 
                                        className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#ff595a] ${mode === 'estocastico' ? 'bg-[#ff595a] text-white' : 'text-[#5c3a21] hover:bg-[#f4f0e8]'}`}
                                        role="tab"
                                        aria-selected={mode === 'estocastico'}
                                    >
                                        Probabilística
                                    </button>
                                    <div className="pr-1">
                                         <InfoTooltip text="Neste modo, você modela a incerteza da demanda. Defina a distribuição provável de matrículas e o simulador gerará múltiplos cenários de uma vez, refletindo um cenário mais realista (Simulação de Monte Carlo)." />
                                    </div>
                                </div>
                            </div>
                        </FormControl>
                    </div>
                </div>

                <div style={{ display: mode === 'deterministico' ? 'block' : 'none' }}>
                  <DeterministicScenarioGenerator 
                    selectedSchool={selectedSchool} 
                    availableProducts={availableProducts}
                    scenarios={scenarios}
                    setScenarios={setScenarios}
                    editingScenario={editingScenario}
                    setEditingScenario={setEditingScenario}
                    minCapacity={minCapacity}
                    setMinCapacity={setMinCapacity}
                    resetMinCapacity={resetMinCapacity}
                    minCapacityDefault={JAM_SESSION_DEFAULTS.MIN_CAPACITY}
                    maxCapacity={maxCapacity}
                    setMaxCapacity={setMaxCapacity}
                    resetMaxCapacity={resetMaxCapacity}
                    maxCapacityDefault={JAM_SESSION_DEFAULTS.MAX_CAPACITY}
                  />
                </div>
                
                <div style={{ display: mode === 'estocastico' ? 'block' : 'none' }}>
                    <StochasticScenarioGenerator 
                        selectedSchool={selectedSchool}
                        availableProducts={availableProducts}
                        scenarios={scenarios}
                        setScenarios={setScenarios}
                        minCapacity={minCapacity}
                        maxCapacity={maxCapacity}
                    />
                </div>
                
                {scenarios.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-[#bf917f]">
                         <div className="max-w-4xl mx-auto flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-[#5c3a21]">Cenários de Demanda Salvos</h3>
                            <button
                                onClick={handleDeleteSelected}
                                disabled={selectedScenarioIds.length === 0}
                                className="text-sm font-medium text-[#ff595a] hover:underline disabled:text-gray-400 disabled:no-underline transition-colors"
                                aria-label={`Excluir ${selectedScenarioIds.length} cenários selecionados`}
                            >
                                Excluir Selecionados ({selectedScenarioIds.length})
                            </button>
                        </div>
                        <div className="max-w-4xl mx-auto bg-[#f4f0e8] p-4 rounded-xl border border-[#bf917f]">
                           <div className="grid grid-cols-[auto_1fr_60px_60px_60px_90px_100px_auto] gap-x-4 items-center font-bold text-sm text-[#8c6d59] border-b border-[#bf917f] pb-2 mb-2 px-2">
                               <input
                                    type="checkbox"
                                    ref={selectAllCheckboxRef}
                                    onChange={handleSelectAllChange}
                                    className="h-4 w-4 rounded border-gray-400 text-[#ff595a] focus:ring-[#ff595a]"
                                    aria-label="Selecionar todos os cenários"
                                />
                               <div className="text-left">Escola / Produto</div>
                               <div className="text-center">Freq.</div>
                               <div className="text-center">Turmas</div>
                               <div className="text-center">Alunos</div>
                               <div className="text-right">Preço</div>
                               <div className="text-right">Receita</div>
                               <div className="w-8"></div>
                           </div>
                           <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                {scenarios.map(s => (
                                    <div key={s.id} className="grid grid-cols-[auto_1fr_60px_60px_60px_90px_100px_auto] gap-x-4 items-center bg-white p-2 rounded-md text-sm hover:bg-[#ffe9c9] transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={selectedScenarioIds.includes(s.id)}
                                            onChange={() => handleScenarioSelectionChange(s.id)}
                                            className="h-4 w-4 rounded border-gray-300 text-[#ff595a] focus:ring-[#ff595a]"
                                            aria-label={`Selecionar cenário ${s.productName}`}
                                        />
                                        <div className="min-w-0">
                                            <p className="font-semibold text-[#5c3a21]">{s.school}</p>
                                            <p className="text-xs text-[#8c6d59] truncate">{s.productName}</p>
                                            <div className="text-xs text-[#8c6d59] mt-1 flex items-center gap-x-2 flex-wrap">
                                                <span>Quórum: <strong>{s.minCapacity || '-'}</strong></span>
                                                <span className="text-gray-300">|</span>
                                                <span>Cap.: <strong>{s.maxCapacity || '-'}</strong></span>
                                                <span className="text-gray-300">|</span>
                                                <span>Espec./Dia: <strong className="font-medium">{s.specialistBudgetPerDay !== undefined ? s.specialistBudgetPerDay : '-'}</strong></span>
                                            </div>
                                        </div>
                                        <div className="text-center font-medium text-[#5c3a21]">{s.frequency}x</div>
                                        <div className="text-center font-medium text-[#5c3a21]">{s.turmas || '-'}</div>
                                        <div className="text-center font-medium text-[#5c3a21]">{s.avgStudents}</div>
                                        <div className="text-right font-medium text-[#5c3a21]">{formatCurrency(s.unitPrice)}</div>
                                        <div className="text-right font-medium text-[#5c3a21]">{formatCurrency(s.unitPrice * s.avgStudents)}</div>
                                        <button 
                                            onClick={() => {
                                                if (mode !== 'deterministico') {
                                                    setMode('deterministico');
                                                }
                                                setSelectedSchool(s.school);
                                                setEditingScenario(s);
                                            }}
                                            className="p-1 text-[#8c6d59] hover:text-[#5c3a21] rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff595a]" 
                                            aria-label={`Editar cenário ${s.productName}`}>
                                            <EditIcon />
                                        </button>
                                    </div>
                                ))}
                           </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};