

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
    const { useState, useMemo, useEffect, useCallback } = React;

    const [totalStudents, setTotalStudents] = useState(200);
    const [conversionRate, setConversionRate] = useState(25);
    const projectedStudents = useMemo(() => Math.round(totalStudents * (conversionRate / 100)), [totalStudents, conversionRate]);
    
    // States for the unified grid
    const [productDistPercent, setProductDistPercent] = useState<Record<string, number>>({});
    const [studentDistAbsolute, setStudentDistAbsolute] = useState<Record<string, number>>({});
    const [productInputMode, setProductInputMode] = useState<'percent' | 'absolute'>('percent');

    // States for the frequency modal
    const [freqDistsPercent, setFreqDistsPercent] = useState<Record<string, Record<number, number>>>({});
    const [freqDistsAbsolute, setFreqDistsAbsolute] = useState<Record<string, Record<number, number>>>({});
    const [freqInputMode, setFreqInputMode] = useState<'percent' | 'absolute'>('percent');
    const [editingFreqFor, setEditingFreqFor] = useState(null);

    const initializeDistributions = useCallback(() => {
        // Product Distribution
        const initialProductDist = productDistPresets['Moderado'](availableProducts);
        setProductDistPercent(initialProductDist);
        
        const initialAbsoluteDist: Record<string, number> = {};
        let studentSum = 0;
        availableProducts.forEach((p, index) => {
            const isLast = index === availableProducts.length - 1;
            const studentsForProduct = isLast 
                ? projectedStudents - studentSum
                : Math.round(projectedStudents * ((initialProductDist[p.id] || 0) / 100));
            initialAbsoluteDist[p.id] = studentsForProduct;
            studentSum += studentsForProduct;
        });
        setStudentDistAbsolute(initialAbsoluteDist);
        setProductInputMode('percent');

        // Frequency Distributions
        const initialFreqDistsP: Record<string, Record<number, number>> = {};
        const initialFreqDistsA: Record<string, Record<number, number>> = {};
        availableProducts.forEach(p => {
            const studentsForProduct = initialAbsoluteDist[p.id] || 0;
            const defaultFreqDist = { ...freqDistPresets['Distribuída'] };
            initialFreqDistsP[p.id] = defaultFreqDist;
            
            const absoluteFreqs: Record<number, number> = { 1:0, 2:0, 3:0, 4:0, 5:0 };
            let freqStudentSum = 0;
            [1, 2, 3, 4].forEach(f => {
                const studentsForFreq = Math.round(studentsForProduct * ((defaultFreqDist[f] || 0) / 100));
                absoluteFreqs[f] = studentsForFreq;
                freqStudentSum += studentsForFreq;
            });
            absoluteFreqs[5] = studentsForProduct - freqStudentSum;
            initialFreqDistsA[p.id] = absoluteFreqs;
        });
        setFreqDistsPercent(initialFreqDistsP);
        setFreqDistsAbsolute(initialFreqDistsA);

    }, [availableProducts, projectedStudents]);

    useEffect(() => {
        initializeDistributions();
    }, [initializeDistributions]);


    const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    // --- Product Distribution Handlers ---
    const handleProductPercentChange = (productId, value) => {
        const numValue = parseFloat(value) || 0;
        const newDistPercent = {...productDistPercent, [productId]: numValue };
        setProductDistPercent(newDistPercent);

        // Recalculate absolute values
        const newDistAbsolute: Record<string, number> = {};
        let studentSum = 0;
        availableProducts.forEach((p, index) => {
            const isLast = index === availableProducts.length - 1;
            const studentsForProduct = isLast 
                ? projectedStudents - studentSum
                : Math.round(projectedStudents * ((newDistPercent[p.id] || 0) / 100));
            newDistAbsolute[p.id] = studentsForProduct;
            studentSum += studentsForProduct;
        });
        setStudentDistAbsolute(newDistAbsolute);
    };

    const handleProductAbsoluteChange = (productId, value) => {
        const numValue = parseInt(value, 10) || 0;
        const newDistAbsolute = {...studentDistAbsolute, [productId]: numValue };
        setStudentDistAbsolute(newDistAbsolute);
        
        // Recalculate percentages
        // FIX: Cast Object.values to number[] to ensure type safety in reduce.
        const totalAbsoluteStudents = (Object.values(newDistAbsolute) as number[]).reduce((sum: number, val: number) => sum + val, 0);
        const newDistPercent: Record<string, number> = {};
        availableProducts.forEach(p => {
            newDistPercent[p.id] = totalAbsoluteStudents > 0 
                ? parseFloat((((newDistAbsolute[p.id] || 0) / totalAbsoluteStudents) * 100).toFixed(2))
                : 0;
        });
        setProductDistPercent(newDistPercent);
    };

    const productTotals = useMemo(() => {
        // FIX: Cast Object.values to number[] to ensure type safety in reduce.
        const totalPercent = (Object.values(productDistPercent) as number[]).reduce((sum: number, v: number) => sum + v, 0);
        const totalAbsolute = (Object.values(studentDistAbsolute) as number[]).reduce((sum: number, v: number) => sum + v, 0);
        return { totalPercent, totalAbsolute };
    }, [productDistPercent, studentDistAbsolute]);

    // --- Frequency Distribution Handlers (for modal) ---
    const handleFreqPercentChange = (freq, value) => {
        if (!editingFreqFor) return;
        const numValue = parseFloat(value) || 0;
        const productId = editingFreqFor.id;

        const newFreqsPercent = {
            ...freqDistsPercent,
            [productId]: {
                ...freqDistsPercent[productId],
                [freq]: numValue
            }
        };
        setFreqDistsPercent(newFreqsPercent);

        // Recalculate absolute
        const studentsForThisProduct = studentDistAbsolute[productId] || 0;
        const newFreqsAbsolute: Record<number, number> = { 1:0, 2:0, 3:0, 4:0, 5:0 };
        let studentSum = 0;
        [1,2,3,4].forEach(f => {
            const students = Math.round(studentsForThisProduct * ((newFreqsPercent[productId][f] || 0) / 100));
            newFreqsAbsolute[f] = students;
            studentSum += students;
        });
        newFreqsAbsolute[5] = studentsForThisProduct - studentSum;
        
        setFreqDistsAbsolute(prev => ({...prev, [productId]: newFreqsAbsolute}));
    };

    const handleFreqAbsoluteChange = (freq, value) => {
        if (!editingFreqFor) return;
        const numValue = parseInt(value, 10) || 0;
        const productId = editingFreqFor.id;

        const newFreqsAbsolute = {
            ...freqDistsAbsolute,
            [productId]: {
                ...freqDistsAbsolute[productId],
                [freq]: numValue,
            }
        };
        setFreqDistsAbsolute(newFreqsAbsolute);

        // Recalculate percent
        // FIX: Cast Object.values to number[] to ensure type safety in reduce.
        const totalAbsolute = (Object.values(newFreqsAbsolute[productId]) as number[]).reduce((s: number, v: number) => s + v, 0);
        const newFreqsPercent: Record<number, number> = { 1:0, 2:0, 3:0, 4:0, 5:0 };
        [1,2,3,4,5].forEach(f => {
            newFreqsPercent[f] = totalAbsolute > 0 ? parseFloat((((newFreqsAbsolute[productId][f] || 0) / totalAbsolute) * 100).toFixed(2)) : 0;
        });

        setFreqDistsPercent(prev => ({...prev, [productId]: newFreqsPercent}));
    };

    const freqModalTotals = useMemo(() => {
        if (!editingFreqFor) return { totalPercent: 0, totalAbsolute: 0 };
        const productId = editingFreqFor.id;
        // FIX: Cast Object.values to number[] to ensure type safety in reduce.
        const totalPercent = (Object.values(freqDistsPercent[productId] || {}) as number[]).reduce((s: number, v: number) => s + v, 0);
        const totalAbsolute = (Object.values(freqDistsAbsolute[productId] || {}) as number[]).reduce((s: number, v: number) => s + v, 0);
        return { totalPercent, totalAbsolute };
    }, [editingFreqFor, freqDistsPercent, freqDistsAbsolute]);

    const handleSaveScenarios = () => {
        const scenariosToSave = [];
        
        availableProducts.forEach(product => {
            const freqCounts = freqDistsAbsolute[product.id];
            if (freqCounts) {
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
            initializeDistributions(); // Reset for next use
        }
    };
    
    const handleApplyProductPreset = (presetName: string) => {
        if (productDistPresets[presetName]) {
            const newDist = productDistPresets[presetName](availableProducts);
            setProductDistPercent(newDist);
            setProductInputMode('percent');

             const newDistAbsolute: Record<string, number> = {};
            let studentSum = 0;
            availableProducts.forEach((p, index) => {
                const isLast = index === availableProducts.length - 1;
                const studentsForProduct = isLast 
                    ? projectedStudents - studentSum
                    : Math.round(projectedStudents * ((newDist[p.id] || 0) / 100));
                newDistAbsolute[p.id] = studentsForProduct;
                studentSum += studentsForProduct;
            });
            setStudentDistAbsolute(newDistAbsolute);
        }
    };

    const handleApplyFreqPreset = (presetName: string) => {
        if (freqDistPresets[presetName] && editingFreqFor) {
            setFreqInputMode('percent');
            const newDist = { ...freqDistPresets[presetName] };
            setFreqDistsPercent(prev => ({...prev, [editingFreqFor.id]: newDist}));
            
            const studentsForThisProduct = studentDistAbsolute[editingFreqFor.id] || 0;
            const newFreqsAbsolute: Record<number, number> = { 1:0, 2:0, 3:0, 4:0, 5:0 };
            let studentSum = 0;
            [1,2,3,4].forEach(f => {
                const students = Math.round(studentsForThisProduct * ((newDist[f] || 0) / 100));
                newFreqsAbsolute[f] = students;
                studentSum += students;
            });
            newFreqsAbsolute[5] = studentsForThisProduct - studentSum;
            setFreqDistsAbsolute(prev => ({...prev, [editingFreqFor.id]: newFreqsAbsolute}));
        }
    };

    return (
        <div className="mt-6">
            <p className="text-center text-sm text-[#8c6d59] mb-6 max-w-2xl mx-auto">
                Modele a incerteza da demanda usando uma simulação de <strong>Monte Carlo</strong> para gerar múltiplos cenários de uma vez. Insira percentuais (%) ou números absolutos (Abs) para definir a distribuição.
            </p>
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-[#e0cbb2] space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                    <FormControl label="Total de Alunos (Escola)"><NumberInput value={totalStudents} onChange={setTotalStudents} min={0} max={5000} step={10} /></FormControl>
                    <FormControl label="Taxa de Conversão para Extra"><NumberInput value={conversionRate} onChange={setConversionRate} prefix="%" min={0} max={100} step={1} /></FormControl>
                    <div className="text-center bg-[#f3f0e8] p-4 rounded-lg">
                        <p className="text-sm uppercase font-bold text-[#8c6d59]">Alunos Projetados</p>
                        <p className="text-4xl font-bold text-[#ff595a]">{projectedStudents}</p>
                    </div>
                </div>
            </div>

            <div className="mt-6 bg-white p-6 rounded-2xl shadow-lg border border-[#e0cbb2] space-y-6">
                <div>
                    <h3 className="text-lg font-bold text-[#5c3a21]">1. Distribuição de Alunos por Produto</h3>
                    <div className="flex items-center gap-2 mt-2">
                       <span className="text-sm text-[#8c6d59]">Aplicar Perfil:</span>
                       {Object.keys(productDistPresets).map(name => <button key={name} onClick={() => handleApplyProductPreset(name)} className="text-xs font-semibold bg-[#f3f0e8] text-[#5c3a21] px-3 py-1 rounded-full hover:bg-[#e0cbb2]">{name}</button>)}
                    </div>
                    <div className="mt-4 space-y-2">
                       <div className="grid grid-cols-[1fr_90px_90px] items-center gap-x-4 px-2 font-semibold text-sm text-right text-[#8c6d59]">
                           <span className="text-left">Produto</span>
                           <span>%</span>
                           <span>Abs</span>
                       </div>
                       {availableProducts.map(p => (
                           <div key={p.id} className="grid grid-cols-[1fr_90px_90px] items-center gap-x-4 p-2 rounded-md hover:bg-[#f3f0e8]">
                               <label className="text-sm text-[#5c3a21] truncate text-left">{p.name}</label>
                               <NumberInput value={productDistPercent[p.id] || 0} onChange={v => handleProductPercentChange(p.id, v)} onFocus={() => setProductInputMode('percent')} prefix="%" min={0} max={100} step={1} disabled={productInputMode === 'absolute'}/>
                               <NumberInput value={studentDistAbsolute[p.id] || 0} onChange={v => handleProductAbsoluteChange(p.id, v)} onFocus={() => setProductInputMode('absolute')} min={0} max={projectedStudents} step={1} disabled={productInputMode === 'percent'}/>
                           </div>
                       ))}
                       <div className={`grid grid-cols-[1fr_90px_90px] items-center gap-x-4 px-2 font-bold text-sm text-right text-[#5c3a21] border-t-2 border-[#e0cbb2] pt-2 mt-2`}>
                           <span className="text-left">Total</span>
                           <span className={`p-2 rounded-md ${productTotals.totalPercent.toFixed(2) !== '100.00' ? 'text-red-600 bg-red-100' : 'text-green-700 bg-green-100'}`}>{productTotals.totalPercent.toFixed(2)}%</span>
                           <span className="p-2">{productTotals.totalAbsolute}</span>
                       </div>
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-[#5c3a21]">2. Distribuição por Frequência (para cada produto)</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-4">
                       {availableProducts.map(p => (
                           <button key={p.id} onClick={() => setEditingFreqFor(p)} className="p-2 text-left bg-[#f3f0e8] rounded-lg hover:bg-[#e0cbb2] transition-colors focus:outline-none focus:ring-2 focus:ring-[#ff595a]">
                               <p className="text-sm font-semibold text-[#5c3a21] truncate">{p.name}</p>
                               <p className="text-xs text-[#8c6d59]">{studentDistAbsolute[p.id] || 0} aluno(s) - <span className="underline">Editar</span></p>
                           </button>
                       ))}
                    </div>
                </div>
            </div>
            
            <div className="text-center mt-8 pt-6 border-t border-[#e0cbb2]">
                <button onClick={handleSaveScenarios} disabled={productTotals.totalAbsolute === 0} className="bg-[#ff595a] text-white font-bold py-2 px-5 rounded-lg shadow-md hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    Salvar {productTotals.totalAbsolute} Alunos como Cenários
                </button>
            </div>

            {editingFreqFor && (
                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={() => setEditingFreqFor(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg m-4" onClick={e => e.stopPropagation()}>
                         <h3 className="text-lg font-bold text-[#5c3a21] truncate">{editingFreqFor.name}</h3>
                         <p className="text-sm text-[#8c6d59] mb-4">Ajuste a distribuição para os <strong className="text-[#5c3a21]">{studentDistAbsolute[editingFreqFor.id] || 0}</strong> alunos deste produto.</p>
                         <div className="flex items-center gap-2 mt-2 mb-4">
                           <span className="text-sm text-[#8c6d59]">Aplicar Perfil:</span>
                           {Object.keys(freqDistPresets).map(name => <button key={name} onClick={() => handleApplyFreqPreset(name)} className="text-xs font-semibold bg-[#f3f0e8] text-[#5c3a21] px-3 py-1 rounded-full hover:bg-[#e0cbb2]">{name}</button>)}
                        </div>
                         <div className="space-y-2">
                             <div className="grid grid-cols-[1fr_90px_90px] items-center gap-x-4 px-2 font-semibold text-sm text-right text-[#8c6d59]">
                               <span className="text-left">Frequência</span>
                               <span>%</span>
                               <span>Abs</span>
                             </div>
                             {[1,2,3,4,5].map(f => (
                               <div key={f} className="grid grid-cols-[1fr_90px_90px] items-center gap-x-4 p-2 rounded-md hover:bg-[#f3f0e8]">
                                   <label className="text-sm text-[#5c3a21] text-left">{f}x por semana</label>
                                   <NumberInput value={freqDistsPercent[editingFreqFor.id]?.[f] || 0} onChange={v => handleFreqPercentChange(f, v)} onFocus={() => setFreqInputMode('percent')} prefix="%" min={0} max={100} step={1} disabled={freqInputMode === 'absolute'} />
                                   <NumberInput value={freqDistsAbsolute[editingFreqFor.id]?.[f] || 0} onChange={v => handleFreqAbsoluteChange(f, v)} onFocus={() => setFreqInputMode('absolute')} min={0} max={studentDistAbsolute[editingFreqFor.id] || 0} step={1} disabled={freqInputMode === 'percent'} />
                               </div>
                           ))}
                           <div className={`grid grid-cols-[1fr_90px_90px] items-center gap-x-4 px-2 font-bold text-sm text-right text-[#5c3a21] border-t-2 border-[#e0cbb2] pt-2 mt-2`}>
                                <span className="text-left">Total</span>
                                <span className={`p-2 rounded-md ${freqModalTotals.totalPercent.toFixed(2) !== '100.00' ? 'text-red-600 bg-red-100' : 'text-green-700 bg-green-100'}`}>{freqModalTotals.totalPercent.toFixed(2)}%</span>
                                <span className={`p-2 rounded-md ${freqModalTotals.totalAbsolute !== (studentDistAbsolute[editingFreqFor.id] || 0) ? 'text-red-600 bg-red-100' : 'text-green-700 bg-green-100'}`}>{freqModalTotals.totalAbsolute}</span>
                           </div>
                         </div>
                         <div className="text-right mt-6">
                            <button onClick={() => setEditingFreqFor(null)} className="bg-[#ff595a] text-white font-semibold py-2 px-5 rounded-lg shadow-sm hover:bg-red-600 transition-colors">Confirmar</button>
                         </div>
                    </div>
                 </div>
            )}

        </div>
    );
};