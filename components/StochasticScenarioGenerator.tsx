

import React from "react";
import { FormControl } from './FormControl.tsx';
import { NumberInput } from './NumberInput.tsx';
import { allComponents } from '../data/jamSessionData.tsx';

// --- Presets for Distributions ---
const productDistPresets = {
    'Conservador': (products) => {
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
            dist[p.id] = totalWeight > 0 ? parseFloat(((weights[i] / totalWeight) * 100).toFixed(2)) : 100 / products.length;
        });
        return dist;
    },
    'Moderado': (products) => {
        const dist = {};
        const percent = parseFloat((100 / products.length).toFixed(2));
        products.forEach(p => dist[p.id] = percent);
        return dist;
    },
    'Agressivo': (products) => {
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
            dist[p.id] = totalWeight > 0 ? parseFloat(((weights[i] / totalWeight) * 100).toFixed(2)) : 100 / products.length;
        });
        return dist;
    },
};

const freqDistPresets = {
    'Foco em Baixa Frequência': { 1: 30, 2: 40, 3: 20, 4: 5, 5: 5 },
    'Distribuída': { 1: 20, 2: 20, 3: 20, 4: 20, 5: 20 },
    'Foco em Alta Frequência': { 1: 5, 2: 5, 3: 20, 4: 30, 5: 40 },
};

export const StochasticScenarioGenerator = ({ selectedSchool, availableProducts, scenarios, setScenarios }) => {
    const { useState, useMemo, useEffect, useCallback, useRef } = React;

    const [totalStudents, setTotalStudents] = useState(200);
    const [conversionRate, setConversionRate] = useState(25);
    const projectedStudents = useMemo(() => Math.round(totalStudents * (conversionRate / 100)), [totalStudents, conversionRate]);

    const [genMethod, setGenMethod] = useState('monteCarlo');
    
    // State for Monte Carlo
    const [productDist, setProductDist] = useState < Record < string, number >> ({});
    const [freqDists, setFreqDists] = useState < Record < string, Record < number, number >>> ({});
    const [editingFreqFor, setEditingFreqFor] = useState(null); // This will hold the product object for the modal
    const [simulationResult, setSimulationResult] = useState < Record < string, number > | null > (null); // To store and display simulation numbers
    const hasSimulatedRef = useRef(false);

    // State for Manual Entry
    const [manualInputMode, setManualInputMode] = useState('absolute'); // 'absolute' or 'percentage'
    const [manualGrid, setManualGrid] = useState < Record < string, Record < number, number >>> ({});
    const [manualGridPercentages, setManualGridPercentages] = useState < Record < string, Record < number, number >>> ({});

    // Reset state when school/products change
    useEffect(() => {
        const initialProductDist = productDistPresets['Moderado'](availableProducts);
        setProductDist(initialProductDist);

        const initialFreqDists: Record < string, Record < number, number >> = {};
        availableProducts.forEach(p => {
            initialFreqDists[p.id] = { ...freqDistPresets['Distribuída'] };
        });
        setFreqDists(initialFreqDists);

        const initialManualGrid: Record < string, Record < number, number >> = {};
        const initialManualGridPercentages: Record < string, Record < number, number >> = {};
        availableProducts.forEach(p => {
            initialManualGrid[p.id] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
            initialManualGridPercentages[p.id] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        });
        setManualGrid(initialManualGrid);
        setManualGridPercentages(initialManualGridPercentages);

        setSimulationResult(null);
        setEditingFreqFor(null);
        hasSimulatedRef.current = false;
    }, [availableProducts, selectedSchool]);


    const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    // --- MONTE CARLO HANDLERS ---
    const handleApplyProductPreset = (presetName) => {
        const newDist = productDistPresets[presetName](availableProducts);
        setProductDist(newDist);
    };

    const handleApplyFreqPreset = (presetName) => {
        if (!editingFreqFor) return;
        setFreqDists(prev => ({
            ...prev,
            [editingFreqFor.id]: { ...freqDistPresets[presetName] }
        }));
    };

    const runMonteCarlo = useCallback(() => {
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
            studentProductChoices.push(choice ? choice.id : productCDF[0]?.id);
        }

        const studentsPerProduct: Record < string, number > = {};
        availableProducts.forEach(p => studentsPerProduct[p.id] = 0);
        studentProductChoices.forEach(productId => {
            if (productId) studentsPerProduct[productId]++;
        });
        
        setSimulationResult(studentsPerProduct);
    }, [availableProducts, productDist, projectedStudents]);

    useEffect(() => {
        if (hasSimulatedRef.current) {
            runMonteCarlo();
        }
    }, [runMonteCarlo]);

    const handleRunMonteCarloClick = () => {
        hasSimulatedRef.current = true;
        runMonteCarlo();
    };

    const handleProductDistChange = (productId, value) => {
        const numValue = parseFloat(value) || 0;
        setProductDist(prev => ({...prev, [productId]: numValue}));
    };

    const handleFreqDistChange = (freq, value) => {
        const numValue = parseFloat(value) || 0;
        if (!editingFreqFor) return;
        setFreqDists(prev => ({
            ...prev,
            [editingFreqFor.id]: {
                ...prev[editingFreqFor.id],
                [freq]: numValue,
            }
        }));
    };

    // --- MANUAL GRID HANDLERS ---
    const handleManualGridChange = (productId, freq, value) => {
        const numValue = parseInt(value, 10) || 0;
        setManualGrid(prev => ({
            ...prev,
            [productId]: {
                ...prev[productId],
                [freq]: numValue,
            }
        }));
    };
    
    const handleManualGridPercentageChange = (productId, freq, value) => {
        const numValue = parseFloat(value) || 0;
        setManualGridPercentages(prev => ({
            ...prev,
            [productId]: {
                ...prev[productId],
                [freq]: numValue,
            }
        }));
    };

    // --- SCENARIO GENERATION ---
    const generateScheduleForScenario = (product, frequency) => {
        // This is a simplified schedule generator for placeholder purposes.
        const schedule: Record < string, Record < string, { componentId: string, turmaId: string }[]>> = {};
        const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
        const timeSlots = Array.from({ length: 10 }, (_, i) => `${8 + i}:00`);
        const componentPool = [...allComponents.filter(c => c.id !== 'c10')].sort(() => 0.5 - Math.random());

        const daysToConsider = days.slice(0, frequency);
        
        let turmaIdCounter = 0;
        const getNextTurmaId = () => String.fromCharCode('A'.charCodeAt(0) + turmaIdCounter++);

        if (product.type === 'window') {
            daysToConsider.forEach(day => {
                schedule[day] = {};
                for (let hour = product.startSlot; hour < product.endSlot; hour++) {
                    const component = componentPool.pop() || allComponents.find(c => c.id === 'c10'); // Fallback to cuidaria
                    schedule[day][`${hour}:00`] = [{ componentId: component.id, turmaId: getNextTurmaId() }];
                }
            });
        } else if (product.type === 'component') {
             const componentsToSchedule = product.priceMatrix[frequency] ? frequency : Object.keys(product.priceMatrix).length;
             let scheduledCount = 0;
             daysToConsider.forEach(day => {
                 schedule[day] = {};
                 for(let i = 0; i < (product.maxPerDay || 1) && scheduledCount < componentsToSchedule; i++) {
                     const component = componentPool.pop();
                     if(component) {
                         schedule[day][timeSlots[i]] = [{ componentId: component.id, turmaId: getNextTurmaId() }];
                         scheduledCount++;
                     }
                 }
             });
        }
        return schedule;
    };
    
    const handleGenerateScenarios = () => {
        let demandMatrix: Record < string, Record < number, number >>;

        if (genMethod === 'monteCarlo') {
            if (!simulationResult) return; // Must run simulation first
            
            demandMatrix = {};
            availableProducts.forEach(p => {
                demandMatrix[p.id] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
                const studentCountForProduct = simulationResult[p.id] || 0;
                
                const freqCDF = [];
                let freqCumulative = 0;
                [1, 2, 3, 4, 5].forEach(f => {
                    freqCumulative += (freqDists[p.id]?.[f] || 0) / 100;
                    freqCDF.push({ freq: f, cumulative: freqCumulative });
                });

                for (let i = 0; i < studentCountForProduct; i++) {
                    const r = Math.random();
                    const choice = freqCDF.find(item => r <= item.cumulative);
                    const freq = choice ? choice.freq : freqCDF[0]?.freq || 1;
                    demandMatrix[p.id][freq]++;
                }
            });
        } else { // Manual method
            if (manualInputMode === 'absolute') {
                demandMatrix = manualGrid;
            } else { // Percentage mode - convert to absolute
                const flatPercentages = [];
                Object.keys(manualGridPercentages).forEach(productId => {
                    Object.keys(manualGridPercentages[productId]).forEach(freq => {
                        flatPercentages.push({ key: `${productId}-${freq}`, percentage: manualGridPercentages[productId][freq] || 0 });
                    });
                });

                const absoluteValues = {};
                const remainders = {};
                let totalAssigned = 0;

                flatPercentages.forEach(item => {
                    const exactValue = (item.percentage / 100) * projectedStudents;
                    absoluteValues[item.key] = Math.floor(exactValue);
                    remainders[item.key] = exactValue - absoluteValues[item.key];
                    totalAssigned += absoluteValues[item.key];
                });

                const remaining = projectedStudents - totalAssigned;
                const sortedRemainders = Object.keys(remainders).sort((a, b) => remainders[b] - remainders[a]);

                for (let i = 0; i < remaining; i++) {
                    const keyToIncrement = sortedRemainders[i];
                    if (keyToIncrement) absoluteValues[keyToIncrement]++;
                }
                
                demandMatrix = {};
                availableProducts.forEach(p => demandMatrix[p.id] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
                Object.keys(absoluteValues).forEach(key => {
                    const [productId, freq] = key.split('-');
                    if (demandMatrix[productId]) demandMatrix[productId][parseInt(freq, 10)] = absoluteValues[key];
                });
            }
        }

        const newScenarios = [];
        let scenarioCounter = 0;
        
        availableProducts.forEach(product => {
            [1, 2, 3, 4, 5].forEach(freq => {
                const studentCount = demandMatrix[product.id]?.[freq] || 0;
                if (studentCount > 0) {
                    const schedule = generateScheduleForScenario(product, freq);
                    let unitPrice = 0;
                    
                    if (product.type === 'window') {
                        unitPrice = product.priceMatrix[freq] ?? 0;
                    } else if (product.type === 'component') {
                        const totalComponentsCount = Object.values(schedule).reduce((count: number, daySchedule: Record<string, { componentId: string, turmaId: string }[]>) => count + Object.keys(daySchedule || {}).length, 0);
                        unitPrice = product.priceMatrix[totalComponentsCount] || product.priceMatrix[freq] || 0;
                    }
                    
                    newScenarios.push({
                        id: Date.now() + scenarioCounter++,
                        school: selectedSchool,
                        productName: `${product.name} (${freq}x) - ${formatCurrency(unitPrice)}`,
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
        alert(`${newScenarios.length} cenários foram gerados e salvos com sucesso!`);
    };
    
    const totalProductDist = useMemo(() => {
        return Object.values(productDist).reduce((sum: number, v: number) => sum + (v || 0), 0);
    }, [productDist]);

    const totalFreqDist = useMemo(() => {
        if (!editingFreqFor) return 0;
        return Object.values(freqDists[editingFreqFor.id] || {}).reduce((sum: number, v: number) => sum + (v || 0), 0);
    }, [freqDists, editingFreqFor]);

    const manualGridTotals = useMemo(() => {
        const rowTotals: Record<string, number> = {};
        const colTotals: Record<number, number> = {1:0, 2:0, 3:0, 4:0, 5:0};
        let grandTotal = 0;
        
        const gridToSum = manualInputMode === 'absolute' ? manualGrid : manualGridPercentages;

        availableProducts.forEach(p => {
            // @fix: Ensure value `v` in reduce is treated as a number to prevent `unknown` type inference issues.
            const productRowTotal = Object.values(gridToSum[p.id] || {}).reduce((sum: number, v: unknown) => sum + Number(v || 0), 0);
            rowTotals[p.id] = productRowTotal;
            grandTotal += productRowTotal;
            [1,2,3,4,5].forEach(f => {
                // FIX: Explicitly cast value to number to resolve type inference issue.
                const value = (gridToSum[p.id] || {})[f];
                colTotals[f] += Number(value || 0);
            });
        });
        return { rowTotals, colTotals, grandTotal };
    }, [manualGrid, manualGridPercentages, manualInputMode, availableProducts]);

    return (
        <div className="mt-6 space-y-8">
            <p className="text-center text-sm text-[#8c6d59] mb-6 max-w-2xl mx-auto">
                Projete a demanda de forma agregada usando simulação probabilística ou entrada manual para criar múltiplos cenários de uma só vez.
            </p>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-[#e0cbb2]">
                <h3 className="text-xl font-bold text-[#5c3a21] mb-4">1. Definição da Base de Alunos</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                    <FormControl label="Total de Alunos na Escola (Regular)" children={<NumberInput value={totalStudents} onChange={setTotalStudents} min={0} max={10000} step={10} />} />
                    <FormControl label="Taxa de Conversão para o Extracurricular (%)" children={<NumberInput value={conversionRate} onChange={setConversionRate} min={0} max={100} step={1} />} />
                    <div className="text-center bg-[#f3f0e8] p-4 rounded-lg">
                        <p className="text-sm uppercase font-bold text-[#8c6d59]">Total de Alunos Projetados</p>
                        <p className="text-4xl font-bold text-[#ff595a]">{projectedStudents}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-[#e0cbb2]">
                 <h3 className="text-xl font-bold text-[#5c3a21] mb-4">2. Escolha do Método de Geração de Cenário</h3>
                <div className="flex justify-center">
                    <div className="bg-[#f3f0e8] p-1 rounded-lg border border-[#e0cbb2] flex space-x-1" role="tablist" aria-label="Método de Geração de Demanda">
                        <button onClick={() => setGenMethod('monteCarlo')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${genMethod === 'monteCarlo' ? 'bg-[#ffe9c9] text-[#5c3a21]' : 'text-[#8c6d59] hover:bg-[#e0cbb2]'}`} role="tab"> (A) Distribuição Monte Carlo </button>
                        <button onClick={() => setGenMethod('manual')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${genMethod === 'manual' ? 'bg-[#ffe9c9] text-[#5c3a21]' : 'text-[#8c6d59] hover:bg-[#e0cbb2]'}`} role="tab">(B) Distribuição Direta</button>
                    </div>
                </div>

                {genMethod === 'monteCarlo' && (
                    <div className="mt-6">
                        <h4 className="font-semibold text-lg text-center text-[#5c3a21] mb-2">Nível 1 - Tabela de Distribuição de Produtos</h4>
                        <div className="flex justify-center gap-2 mb-4">
                            {Object.keys(productDistPresets).map(preset => (
                                <button key={preset} onClick={() => handleApplyProductPreset(preset)} className="text-xs px-3 py-1 bg-white border border-[#e0cbb2] rounded-full hover:bg-[#f3f0e8]">{preset}</button>
                            ))}
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead className="bg-[#f3f0e8]">
                                    <tr>
                                        <th className="p-2 text-sm text-left font-semibold border border-[#e0cbb2]">Produto</th>
                                        <th className="p-2 text-sm font-semibold border border-[#e0cbb2] w-48">Distribuição (%)</th>
                                        <th className="p-2 text-sm font-semibold border border-[#e0cbb2] w-40">Nº de Alunos Simulado</th>
                                        <th className="p-2 text-sm font-semibold border border-[#e0cbb2] w-48">Configurar Frequência</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {availableProducts.map(p => (
                                        <tr key={p.id} className="bg-white">
                                            <td className="p-2 text-xs font-semibold border border-[#e0cbb2]">{p.name}</td>
                                            <td className="p-1 border border-[#e0cbb2]">
                                                <NumberInput value={productDist[p.id] || 0} onChange={v => handleProductDistChange(p.id, v)} min={0} max={100} step={0.1} />
                                            </td>
                                            <td className="p-2 text-center font-bold border border-[#e0cbb2]">{simulationResult ? simulationResult[p.id] || 0 : '-'}</td>
                                            <td className="p-2 text-center border border-[#e0cbb2]"><button onClick={() => setEditingFreqFor(p)} className="text-sm text-[#ff595a] hover:underline">Configurar</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-[#f3f0e8] font-bold">
                                    <tr>
                                        <td className="p-2 text-right border border-[#e0cbb2]">Total</td>
                                        <td className={`p-2 text-center border border-[#e0cbb2] ${Math.abs(100 - totalProductDist) > 0.1 ? 'text-red-500' : 'text-green-600'}`}>{totalProductDist.toFixed(2)}%</td>
                                        <td className="p-2 text-center border border-[#e0cbb2]">{simulationResult ? Object.values(simulationResult).reduce((s: number, v: number) => s + v, 0) : '-'}</td>
                                        <td className="border border-[#e0cbb2]"></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                         <div className="text-center mt-4">
                            <button onClick={handleRunMonteCarloClick} className="bg-white border border-[#ff595a] text-[#ff595a] font-bold py-2 px-4 rounded-lg shadow-sm hover:bg-[#fff5f5]">Executar Simulação (Nível 1)</button>
                        </div>
                    </div>
                )}
                
                {genMethod === 'manual' && (
                     <div className="mt-6">
                         <h4 className="font-semibold text-lg text-center text-[#5c3a21] mb-2">Matriz de Entrada Direta</h4>
                         <div className="flex justify-center items-center gap-4 mb-4">
                            <label className="text-sm font-semibold text-[#5c3a21]">Modo de Entrada:</label>
                            <div className="bg-[#f3f0e8] p-1 rounded-lg border border-[#e0cbb2] flex space-x-1">
                                <button onClick={() => setManualInputMode('absolute')} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${manualInputMode === 'absolute' ? 'bg-[#ffe9c9] text-[#5c3a21]' : 'text-[#8c6d59] hover:bg-[#e0cbb2]'}`}>Alunos (Absoluto)</button>
                                <button onClick={() => setManualInputMode('percentage')} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${manualInputMode === 'percentage' ? 'bg-[#ffe9c9] text-[#5c3a21]' : 'text-[#8c6d59] hover:bg-[#e0cbb2]'}`}>Distribuição (%)</button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                 <thead className="bg-[#f3f0e8]">
                                     <tr>
                                         <th className="p-2 text-sm text-left font-semibold border border-[#e0cbb2]">Produto</th>
                                         {[1,2,3,4,5].map(f => <th key={f} className="p-2 text-sm font-semibold border border-[#e0cbb2] w-24">{f}x/sem</th>)}
                                         <th className="p-2 text-sm font-semibold border border-[#e0cbb2] w-32">Total</th>
                                     </tr>
                                 </thead>
                                 <tbody>
                                    {availableProducts.map(p => (
                                        <tr key={p.id} className="bg-white">
                                            <td className="p-2 text-xs font-semibold border border-[#e0cbb2]">{p.name}</td>
                                            {[1,2,3,4,5].map(f => (
                                                <td key={f} className="p-1 border border-[#e0cbb2]">
                                                    {manualInputMode === 'absolute' ? (
                                                        // FIX: Added missing 'max' property required by the NumberInput component.
                                                        <NumberInput value={manualGrid[p.id]?.[f] || 0} onChange={v => handleManualGridChange(p.id, f, v)} min={0} max={projectedStudents} step={1} />
                                                    ) : (
                                                        <NumberInput value={manualGridPercentages[p.id]?.[f] || 0} onChange={v => handleManualGridPercentageChange(p.id, f, v)} prefix="%" min={0} max={100} step={0.1} />
                                                    )}
                                                </td>
                                            ))}
                                            <td className="p-2 text-center font-bold border border-[#e0cbb2] bg-gray-50">
                                                {manualInputMode === 'absolute' ? manualGridTotals.rowTotals[p.id] : `${manualGridTotals.rowTotals[p.id]?.toFixed(2)}%`}
                                            </td>
                                        </tr>
                                    ))}
                                 </tbody>
                                 <tfoot className="bg-[#f3f0e8] font-bold">
                                     <tr>
                                         <td className="p-2 text-right border border-[#e0cbb2]">Total</td>
                                         {[1,2,3,4,5].map(f => <td key={f} className="p-2 text-center border border-[#e0cbb2]">{manualInputMode === 'absolute' ? manualGridTotals.colTotals[f] : `${manualGridTotals.colTotals[f]?.toFixed(2)}%`}</td>)}
                                         <td className={`p-2 text-center border border-[#e0cbb2] ${
                                             manualInputMode === 'absolute' 
                                             ? (manualGridTotals.grandTotal !== projectedStudents ? 'text-red-500' : 'text-green-600')
                                             : (Math.abs(100 - manualGridTotals.grandTotal) > 0.1 ? 'text-red-500' : 'text-green-600')
                                         }`}>
                                            {manualInputMode === 'absolute' ? `${manualGridTotals.grandTotal} / ${projectedStudents}` : `${manualGridTotals.grandTotal.toFixed(2)}%`}
                                         </td>
                                     </tr>
                                 </tfoot>
                            </table>
                        </div>
                     </div>
                )}
            </div>
            
            <div className="text-center mt-8 pt-6 border-t border-[#e0cbb2]">
                <button onClick={handleGenerateScenarios} className="bg-[#ff595a] text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-red-600 transition-colors text-lg">
                    Gerar e Salvar Cenários de Demanda
                </button>
            </div>
            
            {editingFreqFor && (
                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={() => setEditingFreqFor(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-[#5c3a21] mb-1">Nível 2 - Distribuição de Frequência</h3>
                        <p className="text-sm text-[#8c6d59] mb-4">Para o produto: <strong className="font-semibold">{editingFreqFor.name}</strong></p>
                        <div className="flex justify-center gap-2 mb-4">
                            {Object.keys(freqDistPresets).map(preset => (
                                <button key={preset} onClick={() => handleApplyFreqPreset(preset)} className="text-xs px-3 py-1 bg-white border border-[#e0cbb2] rounded-full hover:bg-[#f3f0e8]">{preset}</button>
                            ))}
                        </div>
                        <table className="w-full border-collapse">
                            <thead className="bg-[#f3f0e8]">
                                <tr>
                                    {[1,2,3,4,5].map(f => <th key={f} className="p-2 text-sm font-semibold border border-[#e0cbb2]">{f}x/sem (%)</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    {[1,2,3,4,5].map(f => (
                                        <td key={f} className="p-1 border border-[#e0cbb2]">
                                            <NumberInput value={freqDists[editingFreqFor.id]?.[f] || 0} onChange={v => handleFreqDistChange(f, v)} min={0} max={100} step={0.1} />
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                             <tfoot className="bg-[#f3f0e8] font-bold">
                                <tr>
                                    <td colSpan={5} className={`p-2 text-center border border-[#e0cbb2] ${Math.abs(100 - totalFreqDist) > 0.1 ? 'text-red-500' : 'text-green-600'}`}>Total: {totalFreqDist.toFixed(2)}%</td>
                                </tr>
                             </tfoot>
                        </table>
                        <div className="text-right mt-4">
                            <button onClick={() => setEditingFreqFor(null)} className="bg-[#ff595a] text-white font-bold py-2 px-4 rounded-lg shadow-sm">Fechar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};