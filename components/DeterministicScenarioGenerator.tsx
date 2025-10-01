
import React from "react";
import { categorias as eixosPedagogicos, allComponents } from '../data/jamSessionData.tsx';
import { Slider } from './Slider.tsx';
import { FormControl } from './FormControl.tsx';
import { NumberInput } from './NumberInput.tsx';

export const DeterministicScenarioGenerator = ({ selectedSchool, availableProducts, scenarios, setScenarios }) => {
    const { useState, useMemo, useEffect, useRef } = React;

    const [selectedProductId, setSelectedProductId] = useState(availableProducts.length > 0 ? availableProducts[0].id : null);
    const [frequency, setFrequency] = useState(5);
    const [capacity, setCapacity] = useState(100);
    const [avgStudents, setAvgStudents] = useState(15);
    const [schedule, setSchedule] = useState<Record<string, Record<string, { componentId: string, turmaId: string }[]>>>({});
    const [unitPrice, setUnitPrice] = useState(0);
    const [dragOverCell, setDragOverCell] = useState(null);
    const [openEixos, setOpenEixos] = useState(eixosPedagogicos.length > 0 ? [eixosPedagogicos[0].id] : []);
    const [error, setError] = useState(null);
    
    const [isAutoMode, setIsAutoMode] = useState(false);
    const isInitialMount = useRef(true);

    // FIX: Define a single, well-typed helper function to count components in a day's schedule. This avoids type inference issues with nested `reduce` calls.
    const getComponentsOnDay = (daySchedule: Record<string, { componentId: string, turmaId: string }[]> | undefined): number => {
        if (!daySchedule) {
            return 0;
        }
        // @fix: Explicitly type the accumulator in the reduce function to prevent it from being inferred as 'unknown'.
        return Object.values(daySchedule).reduce((count: number, cellArray: { componentId: string, turmaId: string }[]) => {
            return count + (cellArray?.length || 0);
        }, 0);
    };

    const timeSlots = Array.from({ length: 10 }, (_, i) => `${8 + i}:00`);
    const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];

    const shuffleArray = (array) => {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    };
    
    const selectedProduct = useMemo(() => availableProducts.find(p => p.id === selectedProductId), [selectedProductId, availableProducts]);

    const getNextTurmaId = (currentSchedule) => {
        const usedTurmaIds = new Set();
        Object.values(currentSchedule).forEach(daySchedule => {
            Object.values(daySchedule || {}).forEach(cellArray => {
                (cellArray || []).forEach(cellData => {
                    if (cellData && cellData.turmaId) {
                        usedTurmaIds.add(cellData.turmaId);
                    }
                })
            });
        });
    
        for (let i = 0; i < 26 * 27; i++) { // Supports up to ZZ
            let turmaId;
            if (i < 26) {
                turmaId = String.fromCharCode('A'.charCodeAt(0) + i);
            } else {
                turmaId = String.fromCharCode('A'.charCodeAt(0) + Math.floor(i / 26) - 1) + String.fromCharCode('A'.charCodeAt(0) + (i % 26));
            }
            
            if (!usedTurmaIds.has(turmaId)) {
                return turmaId;
            }
        }
        return 'Full'; // Fallback
    };
    
    const autoFillLogic = () => {
        if (!selectedProduct) return;

        setError(null);

        const componentPool = shuffleArray([...allComponents.filter(c => c.id !== 'c10')]);
        const newSchedule = {};

        const potentialSlots = [];
        const daysToConsider = days.slice(0, frequency);

        if (selectedProduct.type === 'window') {
            const { startSlot, endSlot } = selectedProduct;
            if (startSlot !== undefined && endSlot !== undefined) {
                for (const day of daysToConsider) {
                    for (let hour = startSlot; hour < endSlot; hour++) {
                        potentialSlots.push({ day, slot: `${hour}:00` });
                    }
                }
            }
        } else if (selectedProduct.type === 'component') {
            const { maxPerDay = 1 } = selectedProduct;
            for (const day of daysToConsider) {
                let componentsForThisDay = 0;
                for (const slot of timeSlots) {
                    if (componentsForThisDay < maxPerDay) {
                        potentialSlots.push({ day, slot });
                        componentsForThisDay++;
                    } else {
                        break;
                    }
                }
            }
        }
        
        const shuffledSlots = shuffleArray(potentialSlots);
        const slotsToFillCount = Math.round(shuffledSlots.length * (capacity / 100));
        const slotsToFill = shuffledSlots.slice(0, slotsToFillCount);
        
        let tempScheduleForIdGen = {};
        for (const { day, slot } of slotsToFill) {
            const component = componentPool.pop();
            if (component) {
                if (!newSchedule[day]) newSchedule[day] = {};
                const turmaId = getNextTurmaId(tempScheduleForIdGen);
                const cellData = { componentId: component.id, turmaId };
                newSchedule[day][slot] = [cellData];
                
                if (!tempScheduleForIdGen[day]) tempScheduleForIdGen[day] = {};
                tempScheduleForIdGen[day][slot] = [cellData];
            } else {
                break;
            }
        }
        
        setSchedule(newSchedule);
    };
    
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        if (isAutoMode) {
            autoFillLogic();
        }
    }, [capacity, selectedProductId, frequency]);

    const resetConfigurator = () => {
        const newProducts = availableProducts;
        const defaultProductId = newProducts.length > 0 ? newProducts[0].id : null;
        setSelectedProductId(defaultProductId);
        setFrequency(5);
        setSchedule({});
        setIsAutoMode(false);
        setAvgStudents(15);
        setCapacity(100);
    };

    useEffect(() => {
        resetConfigurator();
    }, [selectedSchool]);
    
    useEffect(() => {
        setSchedule({});
        setIsAutoMode(false);
    }, [selectedProductId]);

    const totalComponentsCount = useMemo(() => {
        if (!schedule || !selectedProduct) return 0;
        // FIX: Replaced nested reduce with a call to the helper function for clarity and type safety.
// @fix: Explicitly type the accumulator in the reduce function to prevent it from being inferred as 'unknown'.
        // FIX: Explicitly typed `daySchedule` to prevent it from being inferred as `unknown` by TypeScript.
        return Object.values(schedule).reduce((count: number, daySchedule: Record<string, { componentId: string, turmaId: string }[]>) => {
            return count + getComponentsOnDay(daySchedule);
        }, 0);
    }, [schedule, selectedProduct]);

    const totalCost = useMemo(() => {
        if (!selectedProduct) return 0;
        if (selectedProduct.type === 'window') {
            return selectedProduct.priceMatrix[frequency] ?? 0;
        }
        if (selectedProduct.type === 'component') {
            const priceIndex = totalComponentsCount > 0 ? totalComponentsCount : frequency;
            return selectedProduct.priceMatrix[priceIndex] ?? 0;
        }
        return 0;
    }, [selectedProduct, frequency, totalComponentsCount]);

    useEffect(() => {
        setUnitPrice(totalCost);
    }, [totalCost]);

    const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    const handleDragStart = (e, component) => {
        e.dataTransfer.setData('text/plain', JSON.stringify({ componentId: component.id, source: 'library' }));
        e.dataTransfer.effectAllowed = 'move';
    };
    const handleGridDragStart = (e, cellData, fromDay, fromSlot) => {
        e.dataTransfer.setData('text/plain', JSON.stringify({ ...cellData, source: 'grid', fromDay, fromSlot }));
        e.dataTransfer.effectAllowed = 'move';
    };
    const handleDragEnd = () => setDragOverCell(null);
    const handleDrop = (e, toDay, toSlot) => {
        setIsAutoMode(false);
        e.preventDefault();
        setDragOverCell(null);
        const dataString = e.dataTransfer.getData('text/plain');
        if (!dataString) return;

        try {
            const data = JSON.parse(dataString);
            const { componentId, source, fromDay, fromSlot, turmaId } = data;
            const component = allComponents.find(c => c.id === componentId);
            if (!component) return;

            if (source === 'grid' && fromDay === toDay && fromSlot === toSlot) return;

            // FIX: Removed local getComponentsOnDay function to use the globally defined one.
            if (selectedProduct?.type === 'component') {
                const occupiedDays = Object.keys(schedule).filter(d => getComponentsOnDay(schedule[d]) > 0);
                const isAddingToNewDay = !occupiedDays.includes(toDay);
                let wouldExceedDayFrequency = false;
                
                if (isAddingToNewDay && occupiedDays.length >= frequency) {
                    if (source === 'library') {
                        wouldExceedDayFrequency = true;
                    } else if (source === 'grid') {
                        // FIX: Use helper function.
                        const fromDayCount = getComponentsOnDay(schedule[fromDay]);
                        if (fromDayCount > 1) { 
                            wouldExceedDayFrequency = true;
                        }
                    }
                }

                if (wouldExceedDayFrequency) {
                    setError(`Limite de ${frequency} dia(s) com componentes por semana atingido.`);
                    setTimeout(() => setError(null), 3000);
                    return;
                }
                
                if (selectedProduct.maxPerDay) {
                    const isDifferentDay = source === 'grid' && fromDay !== toDay;
                    if (source === 'library' || isDifferentDay) {
                        // FIX: Use helper function.
                        const componentsOnToDay = getComponentsOnDay(schedule[toDay]);
                        if (componentsOnToDay >= selectedProduct.maxPerDay) {
                            setError(`Limite de ${selectedProduct.maxPerDay} componente(s) por dia atingido para ${toDay}.`);
                            setTimeout(() => setError(null), 3000);
                            return;
                        }
                    }
                }
            }

            if (selectedProduct?.type === 'window') {
                const occupiedDays = Object.keys(schedule).filter(d => getComponentsOnDay(schedule[d]) > 0);
                const isAddingToNewDay = !occupiedDays.includes(toDay);
                let wouldExceedFrequency = false;
                if (isAddingToNewDay && occupiedDays.length >= frequency) {
                    if (source === 'library') {
                        wouldExceedFrequency = true;
                    } else if (source === 'grid') {
                        const fromDayCount = getComponentsOnDay(schedule[fromDay]);
                        if (fromDayCount > 1) wouldExceedFrequency = true;
                    }
                }
                if (wouldExceedFrequency) {
                    setError(`Limite de ${frequency} dias com componentes por semana atingido.`);
                    setTimeout(() => setError(null), 3000);
                    return;
                }
            }
            
            setError(null);
            setSchedule(prev => {
                const nextSchedule = JSON.parse(JSON.stringify(prev));
                
                if (!nextSchedule[toDay]) nextSchedule[toDay] = {};
                if (!nextSchedule[toDay][toSlot]) nextSchedule[toDay][toSlot] = [];

                if (source === 'library') {
                    nextSchedule[toDay][toSlot].push({ componentId, turmaId: getNextTurmaId(prev) });
                } else {
                    nextSchedule[toDay][toSlot].push({ componentId, turmaId });
                }

                if (source === 'grid' && fromDay && fromSlot) {
                    if (nextSchedule[fromDay] && nextSchedule[fromDay][fromSlot]) {
                        nextSchedule[fromDay][fromSlot] = nextSchedule[fromDay][fromSlot].filter(item => item.turmaId !== turmaId);
                        if (nextSchedule[fromDay][fromSlot].length === 0) {
                            delete nextSchedule[fromDay][fromSlot];
                        }
                        if (Object.keys(nextSchedule[fromDay]).length === 0) {
                            delete nextSchedule[fromDay];
                        }
                    }
                }
                return nextSchedule;
            });
        } catch (err) { console.error("Error processing drop data:", err); }
    };
    const handleDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };
    const handleDragEnter = (day, slot) => setDragOverCell({ day, slot });
    const handleTableDragLeave = () => setDragOverCell(null);
    const handleRemoveComponent = (day, slot, turmaIdToRemove) => {
        setIsAutoMode(false);
        setSchedule(prev => {
            const newSchedule = JSON.parse(JSON.stringify(prev));
            if (newSchedule[day] && newSchedule[day][slot]) {
                newSchedule[day][slot] = newSchedule[day][slot].filter(item => item.turmaId !== turmaIdToRemove);
                if (newSchedule[day][slot].length === 0) {
                    delete newSchedule[day][slot];
                    if (Object.keys(newSchedule[day]).length === 0) delete newSchedule[day];
                }
            }
            return newSchedule;
        });
    };
    
    const isSlotAvailable = (day, slot) => {
        if (!selectedProduct) return false;
        
        // FIX: Removed local getComponentsOnDay and now using the helper function.
        const occupiedDays = Object.keys(schedule).filter(d => getComponentsOnDay(schedule[d]) > 0);
        
        if (selectedProduct.type === 'component') {
            const isNewDay = !occupiedDays.includes(day);
            if (isNewDay && occupiedDays.length >= frequency) return false;
            return true;
        }
        if (selectedProduct.type === 'window') {
            if (occupiedDays.length >= frequency && !occupiedDays.includes(day)) return false;
            if (!selectedProduct.startSlot || !selectedProduct.endSlot) return false;
            const slotHour = parseInt(slot.split(':')[0], 10);
            return slotHour >= selectedProduct.startSlot && slotHour < selectedProduct.endSlot;
        }
        return true;
    };

    const toggleEixo = (eixoId) => {
        setOpenEixos(prev => prev.includes(eixoId) ? prev.filter(id => id !== eixoId) : [...prev, eixoId]);
    };

    const implicitWindows = useMemo(() => {
        if (selectedProduct?.type !== 'component' || !schedule) return {};
        const windows = {};
        // FIX: Removed local getComponentsOnDay to use the globally defined one.
        
        for (const day in schedule) {
            if (getComponentsOnDay(schedule[day]) > 0) {
                const daySchedule = schedule[day];
                const slotNumbers = Object.keys(daySchedule).flatMap(slot => (daySchedule[slot]?.length > 0 ? [parseInt(slot.split(':')[0], 10)] : []));
                if (slotNumbers.length > 0) {
                    windows[day] = { min: Math.min(...slotNumbers), max: Math.max(...slotNumbers) };
                }
            }
        }
        return windows;
    }, [schedule, selectedProduct]);

    const handleClearSchedule = () => {
        setSchedule({});
        setError(null);
        setIsAutoMode(false);
    };

    const handleAutoFillClick = () => {
        setIsAutoMode(true);
        autoFillLogic();
    };
    
    const handleSaveScenario = () => {
        if (!selectedProduct || avgStudents <= 0 || Object.keys(schedule).length === 0) {
            setError("Preencha o produto, a grade e a quantidade de alunos para salvar.");
            setTimeout(() => setError(null), 3000);
            return;
        }
        const newScenario = {
            id: Date.now(),
            school: selectedSchool,
            productName: `${selectedProduct.name} - ${frequency}x (${formatCurrency(unitPrice)})`,
            productId: selectedProductId,
            frequency: frequency,
            schedule: schedule,
            unitPrice: unitPrice,
            avgStudents: avgStudents,
        };
        setScenarios(prev => [...prev, newScenario]);
        resetConfigurator();
    };
    
    return (
        <div className="mt-6">
            <p className="text-center text-sm text-[#8c6d59] mb-6 max-w-2xl mx-auto">
                Crie um cenário detalhado para um produto específico, arrastando componentes para a grade horária.
            </p>
            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow-md" role="alert">
                    <p className="font-bold">Ação não permitida</p>
                    <p>{error}</p>
                </div>
            )}
            
            <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <FormControl label="2. Selecione o Produto (A Base Rítmica)" children={
                         <select value={selectedProductId ?? ''} onChange={(e) => setSelectedProductId(e.target.value)} className="w-full rounded-md border-[#e0cbb2] bg-white text-[#5c3a21] shadow-sm focus:border-[#ff595a] focus:ring-1 focus:ring-[#ff595a] px-3 py-2" disabled={!availableProducts.length}>
                            {availableProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    }/>
                    <FormControl label="3. Defina a Frequência (O Compasso)" children={
                        <div className="flex justify-between items-center bg-white p-1 rounded-md border border-[#e0cbb2]">
                            {[1, 2, 3, 4, 5].map(f => (
                                <button key={f} onClick={() => setFrequency(f)} className={`flex-1 py-1 rounded-md text-sm transition-colors ${frequency === f ? 'bg-[#ff595a] text-white font-semibold' : 'text-[#8c6d59] hover:bg-[#f3f0e8]'}`}>
                                    {f}x
                                </button>
                            ))}
                        </div>
                    }/>
                </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                    <FormControl label="4. Ocupação da Capacidade Instalada" children={<Slider value={capacity} onChange={setCapacity} min={0} max={100} suffix="%" />} />
                    <FormControl label="5. Quantidade Média de Alunos" children={<NumberInput value={avgStudents} onChange={setAvgStudents} min={1} max={100} step={1} />} />
                    
                    <FormControl 
                        label="6. Preço de Venda (Matrícula)" 
                        description="Auto-calculado ou editável."
                        children={
                            <NumberInput 
                                value={unitPrice} 
                                onChange={setUnitPrice} 
                                prefix="R$" 
                                formatAsCurrency={true}
                                min={0}
                                max={99999}
                                step={1}
                            />
                        } 
                    />
                    
                    <div className="flex justify-start items-center gap-4 pt-6">
                        <button onClick={handleAutoFillClick} disabled={!selectedProduct} className="inline-flex items-center gap-2 bg-white border border-[#ff595a] text-[#ff595a] font-semibold py-2 px-5 rounded-lg shadow-sm hover:bg-[#fff5f5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.31h5.418a.562.562 0 0 1 .321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 21.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988H8.9a.563.563 0 0 0 .475-.31L11.48 3.5Z" /></svg>
                            Preencher (Auto)
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-1 p-4 bg-[#f3f0e8] rounded-2xl border border-[#e0cbb2]">
                     <h3 className="font-semibold text-center mb-4 text-[#5c3a21]">Biblioteca de Componentes</h3>
                     <div className="space-y-2">
                        {eixosPedagogicos.map(eixo => (
                             <div key={eixo.id}>
                                <button onClick={() => toggleEixo(eixo.id)} className="w-full p-2 bg-white rounded-lg font-semibold text-[#5c3a21] cursor-pointer list-none flex justify-between items-center hover:bg-[#ffe9c9] transition-colors" aria-expanded={openEixos.includes(eixo.id)} aria-controls={`eixo-panel-${eixo.id}`}>
                                    <div className="flex items-center">
                                        <span>{eixo.name}</span>
                                    </div>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className={`w-4 h-4 text-[#8c6d59] transition-transform ${openEixos.includes(eixo.id) ? 'rotate-90' : 'rotate-0'}`}><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
                                </button>
                                {openEixos.includes(eixo.id) && (
                                    <div id={`eixo-panel-${eixo.id}`} className="grid grid-cols-1 gap-2 pt-2">
                                        {eixo.components.map(c => {
                                            return (
                                                <div key={c.id} draggable={true} onDragStart={(e) => handleDragStart(e, c)} onDragEnd={handleDragEnd} className={`p-2 bg-white rounded-lg shadow-sm text-center border-2 border-transparent transition-all cursor-grab active:cursor-grabbing hover:border-[#ff595a] focus:outline-none active:outline-none`}>
                                                    <span className="text-2xl">{c.icon}</span>
                                                    <div className="text-sm font-semibold text-[#5c3a21] mt-1 flex items-center justify-center">
                                                        <span>{c.name}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}
                     </div>
                </div>
                <div className="md:col-span-3 overflow-x-auto">
                    <table className="w-full border-collapse" onDragLeave={handleTableDragLeave}>
                        <thead>
                            <tr>
                                <th className="p-2 w-20"></th>
                                {days.map(day => <th key={day} className="p-2 text-sm font-semibold text-[#5c3a21]">{day}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {timeSlots.map(slot => (
                                <tr key={slot} className="border-t border-[#e0cbb2]">
                                    <td className="p-2 text-xs text-center font-mono text-[#8c6d59]">{slot}</td>
                                    {days.map(day => {
                                        const cellArray = schedule[day]?.[slot] || [];
                                        const isAvailable = isSlotAvailable(day, slot);
                                        const isDroppable = isAvailable;
                                        const isBeingDraggedOver = dragOverCell?.day === day && dragOverCell?.slot === slot;
                                        const slotHour = parseInt(slot.split(':')[0], 10);
                                        const isImplicitWindow = selectedProduct?.type === 'component' && cellArray.length === 0 && implicitWindows[day] && slotHour >= implicitWindows[day].min && slotHour <= implicitWindows[day].max;
                                        return (
                                            <td key={day} onDrop={(e) => isDroppable && handleDrop(e, day, slot)} onDragOver={isDroppable ? handleDragOver : undefined} onDragEnter={() => isDroppable && handleDragEnter(day, slot)} className={`align-top p-1 h-24 w-1/5 border-x border-[#e0cbb2] transition-colors ${!isAvailable ? 'bg-gray-200 opacity-50' : isBeingDraggedOver && isDroppable ? 'bg-[#ffe9c9] border-2 border-dashed border-[#ff595a]' : isImplicitWindow ? 'bg-orange-50' : 'bg-white'}`}>
                                                <div className="h-full w-full flex flex-col space-y-1 overflow-y-auto pr-1">
                                                    {cellArray.map((cellData) => {
                                                        const scheduledComponent = allComponents.find(c => c.id === cellData.componentId);
                                                        if (!scheduledComponent) return null;
                                                        return (
                                                            <div key={cellData.turmaId} draggable onDragStart={(e) => handleGridDragStart(e, cellData, day, slot)} onDragEnd={handleDragEnd} className="relative p-1 bg-[#f3f0e8] rounded-md flex-shrink-0 flex items-center gap-2 text-left shadow-inner cursor-move active:cursor-grabbing">
                                                                <button onClick={() => handleRemoveComponent(day, slot, cellData.turmaId)} className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center rounded-full bg-white/50 hover:bg-red-500 hover:text-white text-gray-500 text-xs leading-none z-10" aria-label={`Remover ${scheduledComponent.name}`}>&times;</button>
                                                                <span className="text-xl">{scheduledComponent.icon}</span>
                                                                <div>
                                                                    <p className="text-[11px] font-semibold text-[#5c3a21] leading-tight">{scheduledComponent.name}</p>
                                                                    <p className="text-[10px] text-[#8c6d59] font-bold">Turma {cellData.turmaId}</p>
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </td>
                                        )
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="text-center mt-8 pt-6 border-t border-[#e0cbb2] space-x-4">
                <button onClick={handleClearSchedule} disabled={Object.keys(schedule).length === 0} className="bg-white border border-gray-300 text-[#5c3a21] font-semibold py-2 px-5 rounded-lg shadow-sm hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Limpar Grade Atual</button>
                <button onClick={handleSaveScenario} className="bg-[#ff595a] text-white font-bold py-2 px-5 rounded-lg shadow-md hover:bg-red-600 transition-colors">Salvar Cenário de Demanda</button>
            </div>
        </div>
    );
};