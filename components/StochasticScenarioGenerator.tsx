import React from "react";
import { FormControl } from './FormControl.tsx';
import { NumberInput } from './NumberInput.tsx';
import { InfoTooltip } from './InfoTooltip.tsx';

const usePersistentState = <T,>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [state, setState] = React.useState<T>(() => {
    try {
      const storedValue = localStorage.getItem(key);
      return storedValue ? JSON.parse(storedValue) as T : defaultValue;
    } catch (error) {
      console.error(`Error reading localStorage key “${key}”:`, error);
      return defaultValue;
    }
  });

  React.useEffect(() => {
    try {
        localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error(`Error setting localStorage key “${key}”:`, error);
    }
  }, [key, state]);

  return [state, setState];
};

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

export const StochasticScenarioGenerator = ({ selectedSchool, availableProducts, scenarios, setScenarios, minCapacity, maxCapacity }) => {
    const { useMemo, useEffect } = React;

    const [totalStudents, setTotalStudents] = usePersistentState('sim-sto-totalStudents', 200);
    const [conversionRate, setConversionRate] = usePersistentState('sim-sto-conversionRate', 25);
    const projectedStudents = useMemo(() => Math.round(totalStudents * (conversionRate / 100)), [totalStudents, conversionRate]);
    
    // States for the unified grid
    const [productDistPercent, setProductDistPercent] = usePersistentState<Record<string, number>>('sim-sto-productDistPercent', {});
    const [studentDistAbsolute, setStudentDistAbsolute] = React.useState<Record<string, number>>({});
    const [productInputMode, setProductInputMode] = React.useState<'percent' | 'absolute'>('percent');

    // States for the frequency modal
    const [freqDistsPercent, setFreqDistsPercent] = usePersistentState<Record<string, Record<number, number>>>('sim-sto-freqDistsPercent', {});
    const [freqDistsAbsolute, setFreqDistsAbsolute] = React.useState<Record<string, Record<number, number>>>({});
    const [freqInputMode, setFreqInputMode] = React.useState<'percent' | 'absolute'>('percent');
    const [editingFreqFor, setEditingFreqFor] = React.useState(null);

    // EFFECT 1: Initialization on school/product change
    useEffect(() => {
        // This effect sets the defaults when the available products change.
        if (availableProducts.length === 0) return;

        // Product Distribution
        const initialProductDist = productDistPresets['Moderado'](availableProducts);
        setProductDistPercent(initialProductDist);
        setProductInputMode('percent');

        // Frequency Distributions
        const initialFreqDistsP: Record<string, Record<number, number>> = {};
        availableProducts.forEach(p => {
            initialFreqDistsP[p.id] = { ...freqDistPresets['Distribuída'] };
        });
        setFreqDistsPercent(initialFreqDistsP);
        
        // Note: Absolute values will be calculated by the other effects that will trigger after these state updates.
    }, [availableProducts]);

    // EFFECT 2: Update absolute student numbers for products
    useEffect(() => {
        if (Object.keys(productDistPercent).length === 0) return;
        // This effect syncs the absolute student numbers whenever the total projected students or the percentage distribution changes.
        const newDistAbsolute: Record<string, number> = {};
        let studentSum = 0;
        const totalP = (Object.values(productDistPercent) as number[]).reduce((s,v) => s+v, 0);

        // Normalize percentages if they don't sum to 100 to avoid losing students in rounding
        const normalizationFactor = totalP > 0 ? 100 / totalP : 0;

        availableProducts.forEach((p, index) => {
            const isLast = index === availableProducts.length - 1;
            if (isLast) {
                 newDistAbsolute[p.id] = projectedStudents - studentSum;
            } else {
                const percent = (productDistPercent[p.id] || 0) * (totalP > 0 ? 100 / totalP : 1 / availableProducts.length);
                const studentsForProduct = Math.round(projectedStudents * ((productDistPercent[p.id] || 0) / 100));
                newDistAbsolute[p.id] = studentsForProduct;
                studentSum += studentsForProduct;
            }
        });
        setStudentDistAbsolute(newDistAbsolute);

    }, [projectedStudents, productDistPercent, availableProducts]);

    // EFFECT 3: Update absolute student numbers for frequencies
    useEffect(() => {
        if (Object.keys(studentDistAbsolute).length === 0 || Object.keys(freqDistsPercent).length === 0) return;
        // This effect syncs the frequency absolute numbers whenever the product's student count or frequency percentages change.
        const newFreqDistsA: Record<string, Record<number, number>> = {};

        availableProducts.forEach(p => {
            const studentsForProduct = studentDistAbsolute[p.id] || 0;
            const currentFreqPercentDist = freqDistsPercent[p.id] || {};
            const absoluteFreqs: Record<number, number> = { 1:0, 2:0, 3:0, 4:0, 5:0 };
            let freqStudentSum = 0;

            const totalFP = (Object.values(currentFreqPercentDist) as number[]).reduce((s,v) => s+v, 0);
            const normalizationFactor = totalFP > 0 ? 100 / totalFP : 0;

            [1, 2, 3, 4].forEach(f => {
                const percent = (currentFreqPercentDist[f] || 0) * normalizationFactor;
                const studentsForFreq = Math.round(studentsForProduct * ((currentFreqPercentDist[f] || 0) / 100));
                absoluteFreqs[f] = studentsForFreq;
                freqStudentSum += studentsForFreq;
            });
            absoluteFreqs[5] = Math.max(0, studentsForProduct - freqStudentSum);
            newFreqDistsA[p.id] = absoluteFreqs;
        });
        
        setFreqDistsAbsolute(newFreqDistsA);
    }, [studentDistAbsolute, freqDistsPercent, availableProducts]);


    const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    // --- Product Distribution Handlers ---
    const handleProductPercentChange = (productId, value) => {
        const numValue = parseFloat(value) || 0;
        const newDistPercent = {...productDistPercent, [productId]: numValue };
        setProductDistPercent(newDistPercent);
    };

    const handleProductAbsoluteChange = (productId, value) => {
        const numValue = parseInt(value, 10) || 0;
        const newDistAbsolute = {...studentDistAbsolute, [productId]: numValue };
        setStudentDistAbsolute(newDistAbsolute);
        
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
                        const totalTurmasCount = Math.max(1, Math.ceil(numStudentsValue / maxCapacity));
                        
                        scenariosToSave.push({
                            id: `${Date.now()}-${product.id}-${freq}`,
                            school: selectedSchool,
                            productName: product.name,
                            productId: product.id,
                            frequency: freqNum,
                            schedule: {},
                            unitPrice: unitPrice,
                            avgStudents: numStudentsValue,
                            turmas: totalTurmasCount,
                            minCapacity: minCapacity,
                            maxCapacity: maxCapacity,
                            ocioVivoPercentage: 40, // Default for stochastic scenarios
                        });
                    }
                });
            }
        });
    
        if (scenariosToSave.length > 0) {
            setScenarios(prev => [...prev, ...scenariosToSave]);
        }
    };
    
    const handleApplyProductPreset = (presetName: string) => {
        if (productDistPresets[presetName]) {
            const newDist = productDistPresets[presetName](availableProducts);
            setProductDistPercent(newDist);
            setProductInputMode('percent');
        }
    };

    const handleApplyFreqPreset = (presetName: string) => {
        if (freqDistPresets[presetName] && editingFreqFor) {
            setFreqInputMode('percent');
            const newDist = { ...freqDistPresets[presetName] };
            setFreqDistsPercent(prev => ({...prev, [editingFreqFor.id]: newDist}));
        }
    };

    return (
        <div className="mt-6">
            <p className="text-center text-sm text-[#8c6d59] mb-6 max-w-2xl mx-auto">
                Modele a incerteza da demanda usando uma simulação de <strong>Monte Carlo</strong> para gerar múltiplos cenários de uma vez. Insira percentuais (%) ou números absolutos (Abs) para definir a distribuição.
            </p>
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-[#bf917f] space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                    <FormControl label="Total de Alunos (Escola)"><NumberInput value={totalStudents} onChange={setTotalStudents} min={0} max={5000} step={10} /></FormControl>
                    <FormControl label="Taxa de Conversão para Extra">
                         <div className="flex items-center gap-2">
                            <div className="flex-1">
                               <NumberInput value={conversionRate} onChange={setConversionRate} prefix="%" min={0} max={100} step={1} />
                            </div>
                            <InfoTooltip text="Percentual estimado de alunos do total da escola que irão se matricular em alguma atividade extracurricular. Este valor é usado para projetar o número total de alunos a serem distribuídos entre os produtos." />
                        </div>
                    </FormControl>
                    <div className="text-center bg-[#f4f0e8] p-4 rounded-lg">
                        <p className="text-sm uppercase font-bold text-[#8c6d59]">Alunos Projetados</p>
                        <p className="text-4xl font-bold text-[#ff595a]">{projectedStudents}</p>
                    </div>
                </div>
            </div>

            <div className="mt-6 bg-white p-6 rounded-2xl shadow-lg border border-[#bf917f] space-y-6">
                <div>
                    <h3 className="text-lg font-bold text-[#5c3a21]">1. Distribuição de Alunos por Produto</h3>
                    <div className="flex items-center gap-2 mt-2">
                       <span className="text-sm text-[#8c6d59]">Aplicar Perfil:</span>
                       {Object.keys(productDistPresets).map(name => <button key={name} onClick={() => handleApplyProductPreset(name)} className="text-xs font-semibold bg-[#f4f0e8] text-[#5c3a21] px-3 py-1 rounded-full hover:bg-[#ffe9c9]">{name}</button>)}
                    </div>
                    <div className="mt-4 space-y-2">
                       <div className="grid grid-cols-[1fr_90px_90px] items-center gap-x-4 px-2 font-semibold text-sm text-right text-[#8c6d59]">
                           <span className="text-left">Produto</span>
                           <span>%</span>
                           <span>Abs</span>
                       </div>
                       {availableProducts.map(p => (
                           <div key={p.id} className="grid grid-cols-[1fr_90px_90px] items-center gap-x-4 p-2 rounded-md hover:bg-[#f4f0e8]">
                               <label className="text-sm text-[#5c3a21] truncate text-left">{p.name}</label>
                               <NumberInput value={productDistPercent[p.id] || 0} onChange={v => handleProductPercentChange(p.id, v)} onFocus={() => setProductInputMode('percent')} prefix="%" min={0} max={100} step={1} disabled={productInputMode === 'absolute'}/>
                               <NumberInput value={studentDistAbsolute[p.id] || 0} onChange={v => handleProductAbsoluteChange(p.id, v)} onFocus={() => setProductInputMode('absolute')} min={0} max={projectedStudents} step={1} disabled={productInputMode === 'percent'}/>
                           </div>
                       ))}
                       <div className={`grid grid-cols-[1fr_90px_90px] items-center gap-x-4 px-2 font-bold text-sm text-right text-[#5c3a21] border-t-2 border-[#bf917f] pt-2 mt-2`}>
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
                           <button key={p.id} onClick={() => setEditingFreqFor(p)} className="p-2 text-left bg-[#f4f0e8] rounded-lg hover:bg-[#ffe9c9] transition-colors focus:outline-none focus:ring-2 focus:ring-[#ff595a]">
                               <p className="text-sm font-semibold text-[#5c3a21] truncate">{p.name}</p>
                               <p className="text-xs text-[#8c6d59]">{studentDistAbsolute[p.id] || 0} aluno(s) - <span className="underline">Editar</span></p>
                           </button>
                       ))}
                    </div>
                </div>
            </div>
            
            <div className="text-center mt-8 pt-6 border-t border-[#bf917f]">
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
                           {Object.keys(freqDistPresets).map(name => <button key={name} onClick={() => handleApplyFreqPreset(name)} className="text-xs font-semibold bg-[#f4f0e8] text-[#5c3a21] px-3 py-1 rounded-full hover:bg-[#ffe9c9]">{name}</button>)}
                        </div>
                         <div className="space-y-2">
                             <div className="grid grid-cols-[1fr_90px_90px] items-center gap-x-4 px-2 font-semibold text-sm text-right text-[#8c6d59]">
                               <span className="text-left">Frequência</span>
                               <span>%</span>
                               <span>Abs</span>
                             </div>
                             {[1,2,3,4,5].map(f => (
                               <div key={f} className="grid grid-cols-[1fr_90px_90px] items-center gap-x-4 p-2 rounded-md hover:bg-[#f4f0e8]">
                                   <label className="text-sm text-[#5c3a21] text-left">{f}x por semana</label>
                                   <NumberInput value={freqDistsPercent[editingFreqFor.id]?.[f] || 0} onChange={v => handleFreqPercentChange(f, v)} onFocus={() => setFreqInputMode('percent')} prefix="%" min={0} max={100} step={1} disabled={freqInputMode === 'absolute'} />
                                   <NumberInput value={freqDistsAbsolute[editingFreqFor.id]?.[f] || 0} onChange={v => handleFreqAbsoluteChange(f, v)} onFocus={() => setFreqInputMode('absolute')} min={0} max={studentDistAbsolute[editingFreqFor.id] || 0} step={1} disabled={freqInputMode === 'percent'} />
                               </div>
                           ))}
                           <div className={`grid grid-cols-[1fr_90px_90px] items-center gap-x-4 px-2 font-bold text-sm text-right text-[#5c3a21] border-t-2 border-[#bf917f] pt-2 mt-2`}>
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