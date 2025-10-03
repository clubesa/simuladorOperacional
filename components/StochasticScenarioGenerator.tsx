





import React from "react";
import { FormControl } from './FormControl.tsx';
import { NumberInput } from './NumberInput.tsx';

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
        const percent = products.length > 0 ? parseFloat((100 / products.length).toFixed(2)) : 0;
        products.forEach(p => dist[p.id] = percent);
        return dist;
    },
    'Agressivo': (products) => {
        const prices = products.map(p => p.priceMatrix[5] || 0);
        const minPrice = Math.min(...prices.filter(p => p > 0));
        let totalWeight = 0;
        const weights = products.map(p => {
            const price = p.priceMatrix[5] || 0;
            const weight = minPrice > 0 && price > 0 ? price / minPrice : 1;
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
    
    const [productDist, setProductDist] = useState<Record<string, number>>({});
    const [freqDists, setFreqDists] = useState<Record<string, Record<number, number>>>({});
    const [editingFreqFor, setEditingFreqFor] = useState(null);
    const [simulationResult, setSimulationResult] = useState<Record<string, Record<number, number>> | null>(null);
    const hasSimulatedRef = useRef(false);

    const [manualInputMode, setManualInputMode] = useState('absolute');
    const [manualGrid, setManualGrid] = useState<Record<string, Record<number, number>>>({});
    
    useEffect(() => {
        const initialProductDist = productDistPresets['Moderado'](availableProducts);
        setProductDist(initialProductDist);

        const initialFreqDists: Record<string, Record<number, number>> = {};
        availableProducts.forEach(p => {
            initialFreqDists[p.id] = { ...freqDistPresets['Distribuída'] };
        });
        setFreqDists(initialFreqDists);

        const initialManualGrid: Record<string, Record<number, number>> = {};
        availableProducts.forEach(p => {
            initialManualGrid[p.id] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        });
        setManualGrid(initialManualGrid);

        setSimulationResult(null);
        setEditingFreqFor(null);
        hasSimulatedRef.current = false;
    }, [availableProducts, selectedSchool]);

    const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    const runMonteCarlo = useCallback(() => {
        const resultGrid: Record<string, Record<number, number>> = {};
        availableProducts.forEach(p => {
            resultGrid[p.id] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        });

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

        availableProducts.forEach(p => {
            const studentsForThisProduct = studentProductChoices.filter(id => id === p.id).length;
            if (studentsForThisProduct > 0) {
                const freqDist = freqDists[p.id] || {};
                const freqCDF = [];
                let freqCumulative = 0;
                [1, 2, 3, 4, 5].forEach(f => {
                    freqCumulative += (freqDist[f] || 0) / 100;
                    freqCDF.push({ freq: f, cumulative: freqCumulative });
                });

                for (let i = 0; i < studentsForThisProduct; i++) {
                    const r = Math.random();
                    const choice = freqCDF.find(item => r <= item.cumulative);
                    const chosenFreq = choice ? choice.freq : 1;
                    resultGrid[p.id][chosenFreq]++;
                }
            }
        });
        setSimulationResult(resultGrid);
    }, [availableProducts, productDist, freqDists, projectedStudents]);

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

    const handleManualGridChange = (productId, freq, value) => {
        const cleanValue = String(value).trim();
        const numValue = cleanValue === '' ? 0 : parseInt(cleanValue, 10);
        if (isNaN(numValue)) return;
    
        setManualGrid(prev => ({
            ...prev,
            [productId]: {
                ...prev[productId],
                [freq]: numValue,
            },
        }));
    };
    
    const manualGridTotals = useMemo(() => {
        if (!manualGrid || Object.keys(manualGrid).length === 0) {
            return { byProduct: {}, byFreq: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, grandTotal: 0 };
        }

        const totals: { byProduct: Record<string, number>, byFreq: Record<number, number>, grandTotal: number } = { byProduct: {}, byFreq: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, grandTotal: 0 };
        availableProducts.forEach(p => {
            const row = manualGrid[p.id] || {};
            // FIX: Cast `val` to a number inside reduce to prevent type errors with the '+' operator, as Object.values can return `unknown[]`.
            const productTotal = Object.values(row).reduce((sum, val) => sum + (Number(val) || 0), 0);
            totals.byProduct[p.id] = productTotal;
            totals.grandTotal += productTotal;

            Object.entries(row).forEach(([freqKey, value]) => {
                const freqNum = parseInt(freqKey, 10);
                if (Object.prototype.hasOwnProperty.call(totals.byFreq, freqNum)) {
                    // FIX: Cast `value` to a number to prevent type errors with the '+=' operator, as Object.entries can return `unknown` for values.
                    totals.byFreq[freqNum] += (Number(value) || 0);
                }
            });
        });
        return totals;
    }, [manualGrid, availableProducts]);
    
    const handleSaveScenarios = () => {
        const scenariosToSave = [];
        const gridToUse = genMethod === 'manual' ? manualGrid : simulationResult;
    
        if (!gridToUse || Object.keys(gridToUse).length === 0) return;
    
        availableProducts.forEach(product => {
            const freqCounts = gridToUse[product.id];
            if (freqCounts) {
                // Using Object.entries for type safety.
                Object.entries(freqCounts).forEach(([freq, numStudents]) => {
                    const numStudentsValue = Number(numStudents) || 0;
                    if (numStudentsValue > 0) {
                        const freqNum = parseInt(freq, 10);
                        const unitPrice = product.priceMatrix[freqNum] || 0;
                        scenariosToSave.push({
                            id: `${Date.now()}-${product.id}-${freq}`,
                            school: selectedSchool,
                            productName: `${product.name} - ${freq}x (${formatCurrency(unitPrice)})`,
                            productId: product.id,
                            frequency: freqNum,
                            schedule: {},
                            unitPrice: unitPrice,
                            avgStudents: numStudentsValue,
                        });
                    }
                });
            }
        });
    
        if (scenariosToSave.length > 0) {
            setScenarios(prev => [...prev, ...scenariosToSave]);
            setSimulationResult(null);
            hasSimulatedRef.current = false;
        }
    };
    
    const handleApplyProductPreset = (presetName: string) => {
        if (productDistPresets[presetName]) {
            const newDist = productDistPresets[presetName](availableProducts);
            setProductDist(newDist);
        }
    };

    const handleApplyFreqPreset = (presetName: string) => {
        if (freqDistPresets[presetName] && editingFreqFor) {
            setFreqDists(prev => ({
                ...prev,
                [editingFreqFor.id]: { ...freqDistPresets[presetName] },
            }));
        }
    };

    return (
        <div className="mt-6">
            <p className="text-center text-sm text-[#8c6d59] mb-6 max-w-2xl mx-auto">
                Modele a incerteza da demanda usando simulação ou insira manualmente a distribuição de alunos para gerar múltiplos cenários de uma vez.
            </p>
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-[#e0cbb2] space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                    <FormControl label="Total de Alunos (Escola)" children={<NumberInput value={totalStudents} onChange={setTotalStudents} min={0} max={5000} step={10} />} />
                    <FormControl label="Taxa de Conversão para Extra" children={<NumberInput value={conversionRate} onChange={setConversionRate} prefix="%" min={0} max={100} step={1} />} />
                    <div className="text-center bg-[#f3f0e8] p-4 rounded-lg">
                        <p className="text-sm uppercase font-bold text-[#8c6d59]">Alunos Projetados</p>
                        <p className="text-4xl font-bold text-[#ff595a]">{projectedStudents}</p>
                    </div>
                </div>
            </div>

            <div className="flex justify-center pt-6">
                <div className="bg-white p-1 rounded-lg border border-[#e0cbb2] flex space-x-1" role="tablist">
                    <button onClick={() => setGenMethod('monteCarlo')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#ff595a] ${genMethod === 'monteCarlo' ? 'bg-[#ff595a] text-white' : 'text-[#5c3a21] hover:bg-[#f3f0e8]'}`} role="tab" aria-selected={genMethod === 'monteCarlo'}>Simulação Monte Carlo</button>
                    <button onClick={() => setGenMethod('manual')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#ff595a] ${genMethod === 'manual' ? 'bg-[#ff595a] text-white' : 'text-[#5c3a21] hover:bg-[#f3f0e8]'}`} role="tab" aria-selected={genMethod === 'manual'}>Entrada Manual</button>
                </div>
            </div>

            {genMethod === 'monteCarlo' && (
                <div className="mt-6 bg-white p-6 rounded-2xl shadow-lg border border-[#e0cbb2] space-y-6">
                    <div>
                        <h3 className="text-lg font-bold text-[#5c3a21]">1. Distribuição de Alunos por Produto</h3>
                        <div className="flex items-center gap-2 mt-2">
                           <span className="text-sm text-[#8c6d59]">Aplicar Perfil:</span>
                           {Object.keys(productDistPresets).map(name => <button key={name} onClick={() => handleApplyProductPreset(name)} className="text-xs font-semibold bg-[#f3f0e8] text-[#5c3a21] px-3 py-1 rounded-full hover:bg-[#e0cbb2]">{name}</button>)}
                        </div>
                        <div className="mt-4 space-y-2">
                           {availableProducts.map(p => (
                               <div key={p.id} className="grid grid-cols-[1fr_120px] items-center gap-4">
                                   <label className="text-sm text-[#5c3a21] truncate">{p.name}</label>
                                   <NumberInput value={productDist[p.id] || 0} onChange={v => handleProductDistChange(p.id, v)} prefix="%" min={0} max={100} step={1} />
                               </div>
                           ))}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-[#5c3a21]">2. Distribuição por Frequência (para cada produto)</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-4">
                           {availableProducts.map(p => (
                               <button key={p.id} onClick={() => setEditingFreqFor(p)} className="p-2 text-left bg-[#f3f0e8] rounded-lg hover:bg-[#e0cbb2] transition-colors focus:outline-none focus:ring-2 focus:ring-[#ff595a]">
                                   <p className="text-sm font-semibold text-[#5c3a21] truncate">{p.name}</p>
                                   <p className="text-xs text-[#8c6d59]">Clique para editar</p>
                               </button>
                           ))}
                        </div>
                    </div>
                    <div className="text-center pt-4">
                       <button onClick={handleRunMonteCarloClick} className="bg-[#ff595a] text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-red-600 transition-colors">Simular</button>
                    </div>
                    {simulationResult && (
                        <div className="mt-4 pt-4 border-t border-[#e0cbb2]">
                             <h3 className="text-lg font-bold text-center text-[#5c3a21]">Resultado da Simulação</h3>
                             <p className="text-center text-sm text-[#8c6d59] mb-4">(Nº de alunos por produto/frequência)</p>
                             <div className="overflow-x-auto">
                                 <table className="w-full text-sm text-center">
                                     <thead className="bg-[#f3f0e8] text-[#8c6d59]">
                                         <tr>
                                             <th className="p-2 rounded-l-lg text-left">Produto</th>
                                             {[1,2,3,4,5].map(f => <th key={f} className="p-2">{f}x/sem</th>)}
                                             <th className="p-2 rounded-r-lg">Total</th>
                                         </tr>
                                     </thead>
                                     <tbody>
                                         {availableProducts.map(p => (
                                             <tr key={p.id} className="border-b border-[#f3f0e8]">
                                                 <td className="p-2 text-left font-semibold text-[#5c3a21]">{p.name}</td>
                                                 {[1,2,3,4,5].map(f => <td key={f} className="p-2 font-mono">{simulationResult[p.id]?.[f] || 0}</td>)}
                                                 {/* FIX: Cast `v` to a number inside reduce to prevent type errors with the '+' operator, as Object.values can return `unknown[]`. */}
                                                 <td className="p-2 font-mono font-bold bg-gray-50">{Object.values(simulationResult[p.id] || {}).reduce((s, v) => s + (Number(v) || 0), 0)}</td>
                                             </tr>
                                         ))}
                                     </tbody>
                                 </table>
                             </div>
                        </div>
                    )}
                </div>
            )}
            
            {genMethod === 'manual' && (
                <div className="mt-6 bg-white p-6 rounded-2xl shadow-lg border border-[#e0cbb2] space-y-6">
                     <div className="overflow-x-auto">
                         <table className="w-full text-sm text-center border-collapse">
                             <thead className="bg-[#f3f0e8] text-[#8c6d59]">
                                 <tr>
                                     <th className="p-2 rounded-tl-lg text-left w-2/5">Produto</th>
                                     {[1,2,3,4,5].map(f => <th key={f} className="p-2 font-semibold">{f}x / sem</th>)}
                                     <th className="p-2 rounded-tr-lg font-semibold bg-[#e0cbb2] text-[#5c3a21]">Total</th>
                                 </tr>
                             </thead>
                             <tbody>
                                 {availableProducts.map(p => (
                                     <tr key={p.id} className="border-b border-[#f3f0e8]">
                                         <td className="p-2 text-left font-semibold text-[#5c3a21]">{p.name}</td>
                                         {[1,2,3,4,5].map(f => (
                                            <td key={f} className="p-1">
                                                <input type="number" value={manualGrid[p.id]?.[f] || ''} onChange={e => handleManualGridChange(p.id, f, e.target.value)} className="w-16 p-1 text-center bg-white rounded-md border border-[#e0cbb2] focus:ring-1 focus:ring-[#ff595a] focus:border-[#ff595a]"/>
                                            </td>
                                         ))}
                                         <td className="p-2 font-mono font-bold bg-[#f3f0e8] text-[#5c3a21]">{manualGridTotals.byProduct[p.id] || 0}</td>
                                     </tr>
                                 ))}
                                 <tr className="bg-[#e0cbb2] text-[#5c3a21] font-bold">
                                    <td className="p-2 text-left rounded-bl-lg">Total Alunos</td>
                                    {[1,2,3,4,5].map(f => <td key={f} className="p-2 font-mono">{manualGridTotals.byFreq[f] || 0}</td>)}
                                    <td className="p-2 font-mono text-lg rounded-br-lg">{manualGridTotals.grandTotal}</td>
                                 </tr>
                             </tbody>
                         </table>
                         <p className="text-xs text-right text-[#8c6d59] mt-2">Total de alunos projetados: {projectedStudents}. A diferença é de {projectedStudents - manualGridTotals.grandTotal}.</p>
                     </div>
                </div>
            )}

            <div className="text-center mt-8 pt-6 border-t border-[#e0cbb2]">
                <button onClick={handleSaveScenarios} disabled={(!simulationResult && genMethod === 'monteCarlo') || (manualGridTotals.grandTotal === 0 && genMethod === 'manual')} className="bg-[#ff595a] text-white font-bold py-2 px-5 rounded-lg shadow-md hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    Salvar {genMethod === 'manual' ? manualGridTotals.grandTotal : projectedStudents} Alunos como Cenários
                </button>
            </div>

            {editingFreqFor && (
                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={() => setEditingFreqFor(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg m-4" onClick={e => e.stopPropagation()}>
                         <h3 className="text-lg font-bold text-[#5c3a21] truncate">{editingFreqFor.name}</h3>
                         <p className="text-sm text-[#8c6d59] mb-4">Ajuste a distribuição de frequência para este produto.</p>
                         <div className="flex items-center gap-2 mt-2 mb-4">
                           <span className="text-sm text-[#8c6d59]">Aplicar Perfil:</span>
                           {Object.keys(freqDistPresets).map(name => <button key={name} onClick={() => handleApplyFreqPreset(name)} className="text-xs font-semibold bg-[#f3f0e8] text-[#5c3a21] px-3 py-1 rounded-full hover:bg-[#e0cbb2]">{name}</button>)}
                        </div>
                         <div className="space-y-2">
                             {[1,2,3,4,5].map(f => (
                               <div key={f} className="grid grid-cols-[1fr_120px] items-center gap-4">
                                   <label className="text-sm text-[#5c3a21]">{f}x por semana</label>
                                   <NumberInput value={freqDists[editingFreqFor.id]?.[f] || 0} onChange={v => handleFreqDistChange(f, v)} prefix="%" min={0} max={100} step={1} />
                               </div>
                           ))}
                         </div>
                         <div className="text-right mt-6">
                            <button onClick={() => setEditingFreqFor(null)} className="bg-[#ff595a] text-white font-semibold py-2 px-5 rounded-lg shadow-sm hover:bg-red-600 transition-colors">Fechar</button>
                         </div>
                    </div>
                 </div>
            )}

        </div>
    );
};