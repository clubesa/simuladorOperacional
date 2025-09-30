

import React from "react";
import { productDataBySchool } from '../data/jamSessionData.tsx';
import { Slider } from './Slider.tsx';
import { FormControl } from './FormControl.tsx';
import { NumberInput } from './NumberInput.tsx';
import { DeterministicScenarioGenerator } from './DeterministicScenarioGenerator.tsx';
import { StochasticScenarioGenerator } from './StochasticScenarioGenerator.tsx';


export const JamSessionStudio = ({ scenarios, setScenarios }) => {
    const { useState, useMemo } = React;

    const [mode, setMode] = useState('deterministico');
    const [selectedSchool, setSelectedSchool] = useState(Object.keys(productDataBySchool)[0]);
    const availableProducts = useMemo(() => productDataBySchool[selectedSchool], [selectedSchool]);

    const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    const handleRemoveScenario = (id: number) => {
        setScenarios(prev => prev.filter(s => s.id !== id));
    };

    return (
        <div className="my-2">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-[#5c3a21]">Jam Session Studio</h2>
                <p className="text-[#8c6d59] max-w-3xl mx-auto">
                    Configure os produtos e a demanda de alunos para cada unidade operacional. Os cenários salvos serão usados na aba de análise.
                </p>
            </div>
            
            <div className="space-y-6 border-b border-[#e0cbb2] pb-8 mb-8">
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    <FormControl label="1. Selecione a Escola" children={
                        <select value={selectedSchool} onChange={(e) => setSelectedSchool(e.target.value)} className="w-full rounded-md border-[#e0cbb2] bg-white text-[#5c3a21] shadow-sm focus:border-[#ff595a] focus:ring-1 focus:ring-[#ff595a] px-3 py-2">
                            {Object.keys(productDataBySchool).map(school => <option key={school} value={school}>{school}</option>)}
                        </select>
                    }/>
                </div>
                
                <div className="flex justify-center pt-4">
                    <div className="bg-white p-1 rounded-lg border border-[#e0cbb2] flex space-x-1" role="tablist" aria-label="Modo de Cenarização">
                        <button 
                            onClick={() => setMode('deterministico')} 
                            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#ff595a] ${mode === 'deterministico' ? 'bg-[#ff595a] text-white' : 'text-[#5c3a21] hover:bg-[#f3f0e8]'}`}
                            role="tab"
                            aria-selected={mode === 'deterministico'}
                        >
                            Cenário Determinístico
                        </button>
                        <button 
                            onClick={() => setMode('estocastico')} 
                            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#ff595a] ${mode === 'estocastico' ? 'bg-[#ff595a] text-white' : 'text-[#5c3a21] hover:bg-[#f3f0e8]'}`}
                            role="tab"
                            aria-selected={mode === 'estocastico'}
                        >
                            Cenário Estocástico
                        </button>
                    </div>
                </div>
            </div>

            {mode === 'deterministico' && (
              // FIX: Removed the `key` prop. The component's internal `useEffect` hook already handles state resets when its props change, making the key redundant and fixing the TypeScript error.
              <DeterministicScenarioGenerator 
                selectedSchool={selectedSchool} 
                availableProducts={availableProducts}
                scenarios={scenarios}
                setScenarios={setScenarios}
              />
            )}

            {mode === 'estocastico' && (
                // FIX: Removed the `key` prop. An `useEffect` hook was added to the child component to handle state resets, resolving the TypeScript error.
                <StochasticScenarioGenerator 
                    selectedSchool={selectedSchool}
                    availableProducts={availableProducts}
                    setScenarios={setScenarios}
                />
            )}
            
            {scenarios.length > 0 && (
                <div className="mt-8 pt-6 border-t border-[#e0cbb2]">
                    <h3 className="text-lg font-semibold text-center mb-4 text-[#5c3a21]">Cenários de Demanda Salvos</h3>
                    <div className="max-w-4xl mx-auto bg-[#f3f0e8] p-4 rounded-xl border border-[#e0cbb2]">
                       <div className="grid grid-cols-4 gap-4 font-bold text-sm text-[#8c6d59] border-b border-[#e0cbb2] pb-2 mb-2">
                           <div>Escola / Produto</div>
                           <div className="text-center">Alunos</div>
                           <div className="text-center">Preço Unit.</div>
                           <div></div>
                       </div>
                       <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                            {scenarios.map(s => (
                                <div key={s.id} className="grid grid-cols-4 gap-4 items-center bg-white p-2 rounded-md text-sm">
                                    <div>
                                        <p className="font-semibold text-[#5c3a21]">{s.school}</p>
                                        <p className="text-xs text-[#8c6d59]">{s.productName}</p>
                                    </div>
                                    <div className="text-center font-medium text-[#5c3a21]">{s.avgStudents}</div>
                                    <div className="text-center font-medium text-[#5c3a21]">{formatCurrency(s.unitPrice)}</div>
                                    <div className="text-right">
                                        <button onClick={() => handleRemoveScenario(s.id)} className="text-red-500 hover:text-red-700 font-bold" aria-label={`Remover cenário ${s.productName}`}>Remover</button>
                                    </div>
                                </div>
                            ))}
                       </div>
                    </div>
                </div>
            )}
        </div>
    );
};