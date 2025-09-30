

import React from "react";
import { FormControl } from './FormControl.tsx';
import { NumberInput } from './NumberInput.tsx';
import { allComponents } from '../data/jamSessionData.tsx';

// --- Presets for Distributions ---
const productDistPresets = {
    'conservador': (products) => {
        const prices = products.map(p => p.priceMatrix[5] || 0);
        const maxPrice = Math.max(...prices);
        let totalWeight = 0;
        const weights = products.map(p => {
            const price = p.priceMatrix[5] || 0;
            const weight = maxPrice > 0 ? (maxPrice - price) / maxPrice + 0.1 : 1;
            totalWeight += weight;
            return weight;
        });
        const dist = {};
        products.forEach((p, i) => {
            dist[p.id] = totalWeight > 0 ? (weights[i] / totalWeight) * 100 : 100 / products.length;
        });
        return dist;
    },
    'moderado': (products) => {
        const dist = {};
        const percent = 100 / products.length;
        products.forEach(p => dist[p.id] = percent);
        return dist;
    },
    'agressivo': (products) => {
        const prices = products.map(p => p.priceMatrix[5] || 0);
        const minPrice = Math.min(...prices.filter(p => p > 0));
        let totalWeight = 0;
        const weights = products.map(p => {
            const price = p.priceMatrix[5] || 0;
            const weight = minPrice > 0 ? price / minPrice : 1;
            totalWeight += weight;
            return weight;
        });
        const dist = {};
        products.forEach((p, i) => {
            dist[p.id] = totalWeight > 0 ? (weights[i] / totalWeight) * 100 : 100 / products.length;
        });
        return dist;
    },
};

const freqDistPresets = {
    'baixa': { 1: 30, 2: 40, 3: 20, 4: 5, 5: 5 },
    'distribuida': { 1: 20, 2: 20, 3: 20, 4: 20, 5: 20 },
    'alta': { 1: 5, 2: 5, 3: 20, 4: 30, 5: 40 },
};

export const StochasticScenarioGenerator = ({ selectedSchool, availableProducts, setScenarios }) => {
    // FIX: Import useEffect from React.
    const { useState, useMemo, useEffect } = React;

    const [totalStudents, setTotalStudents] = useState(200);
    const [conversionRate, setConversionRate] = useState(25);
    const projectedStudents = useMemo(() => Math.round(totalStudents * (conversionRate / 100)), [totalStudents, conversionRate]);

    const [genMethod, setGenMethod] = useState('monteCarlo');
    
    // State for Monte Carlo
    const [productDist, setProductDist] = useState(() => productDistPresets.moderado(availableProducts));
    const [freqDists, setFreqDists] = useState(() => {
        const freqs = {};
        availableProducts.forEach(p => freqs[p.id] = { ...freqDistPresets.distribuida });
        return freqs;
    });
    const [editingFreqFor, setEditingFreqFor] = useState(null);

    // State for Manual Entry
    // FIX: Explicitly typed the 'grid' object to ensure proper type inference for the 'manualGrid' state.
    const [manualGrid, setManualGrid] = useState(() => {
        const grid: {[key: string]: {[key: number]: number}} = {};
        availableProducts.forEach(p => {
            grid[p.id] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        });
        return grid;
    });
    const [simulationResult, setSimulationResult] = useState(null);

    // FIX: Added a useEffect hook to reset component state when `availableProducts` changes.
    // This makes the component self-contained and allows removing the `key` prop from its usage in the parent component, which was causing a TypeScript error.
    useEffect(() => {
        setProductDist(productDistPresets.moderado(availableProducts));
        // FIX: Explicitly typed 'newFreqs' and 'newGrid' to ensure state has a well-defined structure, resolving subsequent type errors.
        // FIX: Removed incorrect `:any` typing on `p` to allow for proper type inference from `availableProducts`.
        const newFreqs: {[key: string]: {[key: number]: number}} = {};
        availableProducts.forEach(p => newFreqs[p.id] = { ...freqDistPresets.distribuida });
        setFreqDists(newFreqs);

        // FIX: Removed incorrect `:any` typing on `p` to allow for proper type inference from `availableProducts`.
        const newGrid: {[key: string]: {[key: number]: number}} = {};
        availableProducts.forEach(p => {
            newGrid[p.id] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        });
        setManualGrid(newGrid);
        setSimulationResult(null);
    }, [availableProducts]);

    const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    const handleApplyProductPreset = (presetName) => {
        const newDist = productDistPresets[presetName](availableProducts);
        setProductDist(newDist);
    };

    const handleApplyFreqPreset = (presetName) => {
        if (!editingFreqFor) return;
        const newFreqs = { ...freqDists };
        newFreqs[editingFreqFor.id] = freqDistPresets[presetName];
        setFreqDists(newFreqs);
    };
    
    const runMonteCarlo = () => {
        // Level 1: Distribute students to products
        const studentProductChoices = [];
        const productCDF = [];
        let cumulative = 0;
        availableProducts.forEach(p => {
            cumulative += (productDist[p.id] || 0) / 100;
            productCDF.push({ id: p.id, cumulative });
        });

        for (let i = 0; i < projectedStudents; i++) {
            const r = Math.random();
            const choice = productCDF.find(p => r <= p.cumulative);
            studentProductChoices.push(choice ? choice.id : productCDF[0].id);
        }

        const studentsPerProduct = {};
        availableProducts.forEach(p => studentsPerProduct[p.id] = 0);
        studentProductChoices.forEach(productId => studentsPerProduct[productId]++);

        // Level 2: Distribute students by frequency for each product
        const finalGrid = {};
        availableProducts.forEach(p => {
            finalGrid[p.id] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
            const freqCDF = [];
            let freqCumulative = 0;
            [1,2,3,4,5].forEach(f => {
                freqCumulative += (freqDists[p.id][f] || 0) / 100;
                freqCDF.push({ freq: f, cumulative: freqCumulative });
            });

            for (let i = 0; i < studentsPerProduct[p.id]; i++) {
                const r = Math.random();
                const choice = freqCDF.find(item => r <= item.cumulative);
                const freq = choice ? choice.freq : freqCDF[0].freq;
                finalGrid[p.id][freq]++;
            }
        });

        return finalGrid;
    };
    
    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    // FIX: Added a return type annotation to ensure `schedule` is not inferred as `any`, which caused downstream type errors.
    const generateScheduleForScenario = (product, frequency): { [key: string]: { [key: string]: string } } => {
        const newSchedule: { [key: string]: { [key: string]: string } } = {};
        const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
        const timeSlots = Array.from({ length: 10 }, (_, i) => `${8 + i}:00`);
        const componentPool = shuffleArray([...allComponents.filter(c => c.id !== 'c10')]);

        const daysToConsider = days.slice(0, frequency);
        const potentialSlots = [];

        if (product.type === 'window') {
            const { startSlot, endSlot } = product;
            if (startSlot !== undefined && endSlot !== undefined) {
                for (const day of daysToConsider) {
                    for (let hour = startSlot; hour < endSlot; hour++) {
                        potentialSlots.push({ day, slot: `${hour}:00` });
                    }
                }
            }
        } else if (product.type === 'component') {
            const { maxPerDay = 1 } = product;
            for (const day of daysToConsider) {
                let componentsForThisDay = 0;
                for (const slot of timeSlots) {
                    if (componentsForThisDay < maxPerDay) {
                        potentialSlots.push({ day, slot });
                        componentsForThisDay++;
                    } else break;
                }
            }
        }
        
        for (const { day, slot } of potentialSlots) {
            const component = componentPool.pop();
            if (component) {
                if (!newSchedule[day]) newSchedule[day] = {};
                newSchedule[day][slot] = component.id;
            } else break;
        }
        return newSchedule;
    };

    const handleGenerateScenarios = () => {
        const demandMatrix = genMethod === 'monteCarlo' ? runMonteCarlo() : manualGrid;
        setSimulationResult(demandMatrix); // Save for display

        const newScenarios = [];
        let scenarioCounter = 0;
        
        availableProducts.forEach(product => {
            [1,2,3,4,5].forEach(freq => {
                const studentCount = demandMatrix[product.id]?.[freq] || 0;
                if (studentCount > 0) {
                    const schedule = generateScheduleForScenario(product, freq);
                    let unitPrice = 0;

                    if (product.type === 'window') {
                        unitPrice = product.priceMatrix[freq] ?? 0;
                    } else if (product.type === 'component') {
                         // FIX: Removed type `any` from `daySchedule`, as `schedule` is now properly typed. This resolves the indexing error on the next line.
                         const totalComponentsCount = Object.values(schedule).reduce((count: number, daySchedule) => count + Object.keys(daySchedule || {}).length, 0);
                        unitPrice = product.priceMatrix[totalComponentsCount] ?? product.priceMatrix[freq] ?? 0;
                    }
                    
                    newScenarios.push({
                        id: Date.now() + scenarioCounter++,
                        school: selectedSchool,
                        productName: `${product.name} - ${freq}x (${formatCurrency(unitPrice)})`,
                        productId: product.id,
                        frequency: freq,
                        schedule: schedule,
                        unitPrice: unitPrice,
                        avgStudents: studentCount,
                    });
                }
            });
        });
        setScenarios(prev => [...prev, ...newScenarios]);
    };
    
    // ... UI rendering ...
    return (
        <div className="mt-6 space-y-6">
            <p className="text-center text-sm text-[#8c6d59] mb-6 max-w-2xl mx-auto">
                Projete a demanda de forma agregada usando simulação probabilística ou entrada manual para criar múltiplos cenários de uma só vez.
            </p>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-[#e0cbb2]">
                <h3 className="text-xl font-bold text-[#5c3a21] mb-4">Definição da Base de Alunos</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                    <FormControl label="Total de Alunos na Escola (Regular)" children={
                        // FIX: Added the required 'max' prop to the NumberInput component.
                        <NumberInput value={totalStudents} onChange={setTotalStudents} min={0} max={10000} step={10} />
                    }/>
                     <FormControl label="Taxa de Conversão para o Extracurricular (%)" children={
                        <NumberInput value={conversionRate} onChange={setConversionRate} min={0} max={100} step={1} />
                    }/>
                    <div className="text-center bg-[#f3f0e8] p-4 rounded-lg">
                        <p className="text-sm uppercase font-bold text-[#8c6d59]">Total de Alunos Projetados</p>
                        <p className="text-4xl font-bold text-[#ff595a]">{projectedStudents}</p>
                    </div>
                </div>
            </div>

            <div className="flex justify-center pt-4">
                <div className="bg-white p-1 rounded-lg border border-[#e0cbb2] flex space-x-1" role="tablist" aria-label="Método de Geração de Demanda">
                    <button onClick={() => setGenMethod('monteCarlo')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${genMethod === 'monteCarlo' ? 'bg-[#ffe9c9] text-[#5c3a21]' : 'text-[#8c6d59] hover:bg-[#f3f0e8]'}`} role="tab">Simulação (Monte Carlo)</button>
                    <button onClick={() => setGenMethod('manual')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${genMethod === 'manual' ? 'bg-[#ffe9c9] text-[#5c3a21]' : 'text-[#8c6d59] hover:bg-[#f3f0e8]'}`} role="tab">Entrada Manual Direta</button>
                </div>
            </div>

            {genMethod === 'monteCarlo' && (
                <div>Monte Carlo UI Placeholder</div>
            )}
            
            {genMethod === 'manual' && (
                 <div className="overflow-x-auto">
                    <table className="w-full border-collapse bg-white">
                        <thead>
                            <tr className="bg-[#f3f0e8]">
                                <th className="p-2 text-sm font-semibold text-[#5c3a21] text-left border border-[#e0cbb2]">Produto</th>
                                {[1,2,3,4,5].map(f => <th key={f} className="p-2 text-sm font-semibold text-[#5c3a21] border border-[#e0cbb2]">{f}x/sem</th>)}
                                <th className="p-2 text-sm font-semibold text-[#5c3a21] border border-[#e0cbb2]">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* FIX: Removed incorrect `:any` typing on `p` to allow for proper type inference from `availableProducts`. */}
                            {availableProducts.map(p => {
                                // FIX: Removed explicit type annotations from reduce function as they are now correctly inferred. This resolves type errors.
                                // FIX: Explicitly typed accumulator and value in reduce to prevent type errors.
                                const rowTotal = Object.values(manualGrid[p.id] || {}).reduce((sum: number, v: number) => sum + (v || 0), 0);
                                return (
                                <tr key={p.id}>
                                    <td className="p-2 text-xs font-semibold text-[#5c3a21] border border-[#e0cbb2]">{p.name}</td>
                                    {[1,2,3,4,5].map(f => (
                                        <td key={f} className="p-1 border border-[#e0cbb2]">
                                            <input type="number" value={manualGrid[p.id]?.[f] || ''} onChange={e => {
                                                const val = parseInt(e.target.value, 10) || 0;
                                                setManualGrid(prev => ({...prev, [p.id]: {...prev[p.id], [f]: val}}))
                                            }} className="w-full p-1 text-center rounded-md border-gray-300 focus:ring-[#ff595a] focus:border-[#ff595a]" />
                                        </td>
                                    ))}
                                    <td className="p-2 text-sm text-center font-bold text-[#5c3a21] border border-[#e0cbb2] bg-[#f3f0e8]">{rowTotal}</td>
                                </tr>
                            )})}
                        </tbody>
                         <tfoot>
                            <tr className="bg-[#f3f0e8] font-bold">
                                <td className="p-2 text-sm text-[#5c3a21] border border-[#e0cbb2]">Total Alunos</td>
                                {[1,2,3,4,5].map(f => {
                                    // FIX: Removed incorrect `:any` typing on `p` and redundant type annotations to allow for proper type inference. This resolves the type error.
                                    // FIX: Explicitly typed accumulator in reduce to prevent type errors.
                                    const colTotal = availableProducts.reduce((sum: number, p) => sum + (manualGrid[p.id]?.[f] || 0), 0);
                                    return <td key={f} className="p-2 text-sm text-center text-[#5c3a21] border border-[#e0cbb2]">{colTotal}</td>
                                })}
                                <td className="p-2 text-sm text-center text-[#ff595a] border border-[#e0cbb2]">
                                    {/* FIX: Removed incorrect `:any` typing and redundant type annotations. Correct type inference now prevents the `+` operator error. */}
                                    {/* FIX: Explicitly typed accumulators and values in reduce calls to prevent type errors. */}
                                    {availableProducts.reduce((sum: number, p) => sum + Object.values(manualGrid[p.id] || {}).reduce((s: number, v: number) => s + (v || 0), 0), 0)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            )}
            <div className="text-center mt-8 pt-6 border-t border-[#e0cbb2]">
                <button onClick={handleGenerateScenarios} className="bg-[#ff595a] text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-red-600 transition-colors text-lg">
                    Gerar e Salvar Cenários de Demanda
                </button>
            </div>
        </div>
    );
};