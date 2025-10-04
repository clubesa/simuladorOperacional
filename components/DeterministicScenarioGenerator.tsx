

import React from "react";
import { categorias as eixosPedagogicos, allComponents } from '../data/jamSessionData.tsx';
import { Slider } from './Slider.tsx';
import { FormControl } from './FormControl.tsx';
import { NumberInput } from './NumberInput.tsx';
import { FichaPedagogicaModal } from './FichaPedagogicaModal.tsx';
import { Toggle } from './Toggle.tsx';

const MIN_CAPACITY_PER_TURMA = 3;
const MAX_CAPACITY_PER_TURMA = 12;

export const DeterministicScenarioGenerator = ({ selectedSchool, availableProducts, scenarios, setScenarios }) => {
    const { useState, useMemo, useEffect, useRef } = React;

    const [selectedProductId, setSelectedProductId] = useState(availableProducts.length > 0 ? availableProducts[0].id : null);
    const [frequency, setFrequency] = useState(5);
    const [avgStudents, setAvgStudents] = useState(15);
    const [allowSingleStudentTurma, setAllowSingleStudentTurma] = useState(false);
    const [schedule, setSchedule] = useState<Record<string, Record<string, { componentId: string, turmaId: string, studentCount: number }[]>>>({});
    const [unitPrice, setUnitPrice] = useState(0);
    const [dragOverCell, setDragOverCell] = useState(null);
    const [openEixos, setOpenEixos] = useState(eixosPedagogicos.length > 0 ? [eixosPedagogicos[0].id] : []);
    const [error, setError] = useState(null);
    const [selectedComponentForFicha, setSelectedComponentForFicha] = useState(null);
    
    const isInitialMount = useRef(true);

    const effectiveMinCapacity = useMemo(() => allowSingleStudentTurma ? 1 : MIN_CAPACITY_PER_TURMA, [allowSingleStudentTurma]);

    const totalTurmasCount = useMemo(() => {
        if (!schedule) return 0;
        return Object.values(schedule).reduce((count: number, daySchedule) => {
            return count + Object.values(daySchedule).reduce((dayCount, slotArray) => dayCount + (slotArray?.length || 0), 0);
        }, 0);
    }, [schedule]);

    const redistributeStudents = (currentSchedule, totalStudents: number) => {
        const newSchedule = JSON.parse(JSON.stringify(currentSchedule));
    
        Object.keys(newSchedule).forEach(day => {
            Object.keys(newSchedule[day]).forEach(slot => {
                const turmasInSlot = newSchedule[day][slot];
                if (turmasInSlot && turmasInSlot.length > 0) {
                    const numTurmas = turmasInSlot.length;
                    const baseStudents = Math.floor(totalStudents / numTurmas);
                    const remainder = totalStudents % numTurmas;
    
                    for (let i = 0; i < numTurmas; i++) {
                        turmasInSlot[i].studentCount = baseStudents + (i < remainder ? 1 : 0);
                    }
                }
            });
        });
    
        return newSchedule;
    };

    useEffect(() => {
        setSchedule(prev => redistributeStudents(prev, avgStudents));
    }, [avgStudents, totalTurmasCount]);


    const getComponentsOnDay = (daySchedule: Record<string, { componentId: string, turmaId: string }[]> | undefined): number => {
        if (!daySchedule) {
            return 0;
        }
        return Object.values(daySchedule).reduce((count: number, cellArray: { componentId: string, turmaId: string }[]) => {
            return count + (cellArray?.length || 0);
        }, 0);
    };

    const getOccupiedSlotsOnDay = (daySchedule: Record<string, { componentId: string, turmaId: string }[]> | undefined): number => {
        if (!daySchedule) return 0;
        return Object.keys(daySchedule).filter(slot => daySchedule[slot] && daySchedule[slot].length > 0).length;
    };


    const timeSlots = Array.from({ length: 10 }, (_, i) => `${8 + i}:00`);
    const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
    
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
    
    const resetConfigurator = () => {
        const newProducts = availableProducts;
        const defaultProductId = newProducts.length > 0 ? newProducts[0].id : null;
        setSelectedProductId(defaultProductId);
        setFrequency(5);
        setSchedule({});
        setAvgStudents(15);
    };

    useEffect(() => {
        resetConfigurator();
    }, [selectedSchool]);
    
    useEffect(() => {
        setSchedule({});
    }, [selectedProductId]);

    const totalComponentsCount = useMemo(() => {
        if (!schedule || !selectedProduct) return 0;
        const uniqueComponents = new Set();
         Object.values(schedule).forEach(daySchedule => {
            Object.values(daySchedule || {}).forEach(cellArray => {
                (cellArray || []).forEach(cellData => {
                    if (cellData && cellData.componentId) {
                        uniqueComponents.add(cellData.componentId);
                    }
                })
            });
        });
        return uniqueComponents.size;
    }, [schedule, selectedProduct]);
    
    const totalCost = useMemo(() => {
        if (!selectedProduct) return 0;
        if (selectedProduct.type === 'window') {
            return selectedProduct.priceMatrix[frequency] ?? 0;
        }
        if (selectedProduct.type === 'component') {
            // For component types, price is based on the number of *unique* activities per week.
            const uniqueComponentsCount = totalComponentsCount > 0 ? totalComponentsCount : frequency;
            return selectedProduct.priceMatrix[uniqueComponentsCount] ?? 0;
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

            // --- VALIDATION LOGIC ---
            if (source === 'library') {
                if (avgStudents < effectiveMinCapacity && totalTurmasCount === 0) {
                    setError(`A quantidade de alunos (${avgStudents}) é menor que o quórum mínimo por turma (${effectiveMinCapacity}).`);
                    setTimeout(() => setError(null), 5000);
                    return;
                }
                
                // NEW RULE: Prevent dropping the same component if it already exists in the schedule.
                const isComponentAlreadyScheduled = Object.values(schedule).some(daySchedule => 
                    Object.values(daySchedule).some(slotArray => 
                        slotArray.some(turma => turma.componentId === componentId)
                    )
                );
                if (isComponentAlreadyScheduled) {
                    setError(`O componente "${component.name}" já foi alocado. Uma coorte não pode repetir componentes.`);
                    setTimeout(() => setError(null), 5000);
                    return;
                }
            }
            
            if (selectedProduct?.type === 'component') {
                const occupiedDays = Object.keys(schedule).filter(d => getComponentsOnDay(schedule[d]) > 0);
                const isAddingToNewDay = !occupiedDays.includes(toDay);
                let wouldExceedDayFrequency = false;
                
                if (isAddingToNewDay && occupiedDays.length >= frequency) {
                    if (source === 'library') {
                        wouldExceedDayFrequency = true;
                    } else if (source === 'grid') {
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
                    const isMoveWithinSameDay = source === 'grid' && fromDay === toDay;
                    if (!isMoveWithinSameDay) {
                        const occupiedSlotsOnToDay = getOccupiedSlotsOnDay(schedule[toDay]);
                        const isToSlotAlreadyOccupied = schedule[toDay]?.[toSlot]?.length > 0;
                        if (!isToSlotAlreadyOccupied && occupiedSlotsOnToDay >= selectedProduct.maxPerDay) {
                            setError(`Limite de ${selectedProduct.maxPerDay} slot(s) com atividade(s) por dia atingido para ${toDay}.`);
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
                    // NEW LOGIC: Create multiple turmas if student count exceeds max capacity.
                    const numTurmasNecessarias = Math.max(1, Math.ceil(avgStudents / MAX_CAPACITY_PER_TURMA));
                    for (let i = 0; i < numTurmasNecessarias; i++) {
                        nextSchedule[toDay][toSlot].push({ componentId, turmaId: getNextTurmaId(nextSchedule), studentCount: 0 });
                    }
                } else {
                    // When moving, move all turmas of the same component from the source slot.
                    if (nextSchedule[fromDay] && nextSchedule[fromDay][fromSlot]) {
                        const turmasToMove = nextSchedule[fromDay][fromSlot].filter(item => item.componentId === componentId);
                        nextSchedule[toDay][toSlot].push(...turmasToMove);
                        
                        nextSchedule[fromDay][fromSlot] = nextSchedule[fromDay][fromSlot].filter(item => item.componentId !== componentId);
                        if (nextSchedule[fromDay][fromSlot].length === 0) {
                            delete nextSchedule[fromDay][fromSlot];
                        }
                        if (Object.keys(nextSchedule[fromDay]).length === 0) {
                            delete nextSchedule[fromDay];
                        }
                    }
                }
                
                return redistributeStudents(nextSchedule, avgStudents);
            });
        } catch (err) { console.error("Error processing drop data:", err); }
    };


    const handleDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };
    const handleDragEnter = (day, slot) => setDragOverCell({ day, slot });
    const handleTableDragLeave = () => setDragOverCell(null);
    const handleRemoveComponent = (day, slot, turmaIdToRemove) => {
        setSchedule(prev => {
            const newSchedule = JSON.parse(JSON.stringify(prev));
            if (newSchedule[day] && newSchedule[day][slot]) {
                const componentIdToRemove = newSchedule[day][slot].find(item => item.turmaId === turmaIdToRemove)?.componentId;
                
                // Remove all turmas of the same component from that slot
                if(componentIdToRemove) {
                    newSchedule[day][slot] = newSchedule[day][slot].filter(item => item.componentId !== componentIdToRemove);
                }
                
                if (newSchedule[day][slot].length === 0) {
                    delete newSchedule[day][slot];
                    if (Object.keys(newSchedule[day]).length === 0) delete newSchedule[day];
                }
            }
            return newSchedule; // Redistribution will be handled by the useEffect
        });
    };
    
    const occupiedDaysCount = useMemo(() => {
      if (!schedule) return 0;
      return Object.keys(schedule).filter(day => getComponentsOnDay(schedule[day]) > 0).length;
    }, [schedule]);
    
    const isSlotAvailable = (day, slot) => {
        if (!selectedProduct) return false;
        
        const occupiedDays = Object.keys(schedule).filter(d => getComponentsOnDay(schedule[d]) > 0);
        
        if (selectedProduct.type === 'component') {
            const isNewDay = !occupiedDays.includes(day);
            if (isNewDay && occupiedDays.length >= frequency) {
                return false;
            }
            if (selectedProduct.maxPerDay) {
                const occupiedSlotsOnDay = getOccupiedSlotsOnDay(schedule[day]);
                const isThisSlotOccupied = schedule[day]?.[slot]?.length > 0;
                if (occupiedSlotsOnDay >= selectedProduct.maxPerDay && !isThisSlotOccupied) {
                    return false;
                }
            }
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

    const handleGenerateOptimalSchedule = () => {
        if (!selectedProduct || avgStudents <= 0) {
            setError("Selecione um produto e defina a quantidade de alunos para gerar uma sugestão.");
            setTimeout(() => setError(null), 3000);
            return;
        }
    
        setError(null);
    
        const totalUniqueActivitiesNeeded = frequency;
        if (allComponents.length < totalUniqueActivitiesNeeded) {
            setError(`Não há componentes únicos suficientes na biblioteca (${allComponents.length}) para preencher uma frequência de ${totalUniqueActivitiesNeeded}.`);
            setTimeout(() => setError(null), 5000);
            return;
        }

        const shuffledComponents = [...allComponents].sort(() => 0.5 - Math.random());
        const componentsToSchedule = shuffledComponents.slice(0, totalUniqueActivitiesNeeded);
        
        const validSpotsByDay = {};
        const daysToUse = days.slice(0, frequency);
        
        daysToUse.forEach(day => {
            validSpotsByDay[day] = [];
            timeSlots.forEach(slot => {
                let isSpotValid = true;
                if (selectedProduct.type === 'window') {
                    const slotHour = parseInt(slot.split(':')[0], 10);
                    if (selectedProduct.startSlot && selectedProduct.endSlot && (slotHour < selectedProduct.startSlot || slotHour >= selectedProduct.endSlot)) {
                        isSpotValid = false;
                    }
                }
                if (isSpotValid) {
                    validSpotsByDay[day].push(slot);
                }
            });
        });
    
        let newSchedule = {};
        const numTurmasPerActivity = Math.max(1, Math.ceil(avgStudents / MAX_CAPACITY_PER_TURMA));

        componentsToSchedule.forEach((component, index) => {
            const day = daysToUse[index];
            if (validSpotsByDay[day] && validSpotsByDay[day].length > 0) {
                const randomSlot = validSpotsByDay[day][Math.floor(Math.random() * validSpotsByDay[day].length)];
                
                if (!newSchedule[day]) newSchedule[day] = {};
                if (!newSchedule[day][randomSlot]) newSchedule[day][randomSlot] = [];
                
                for (let i = 0; i < numTurmasPerActivity; i++) {
                     newSchedule[day][randomSlot].push({
                        componentId: component.id,
                        turmaId: getNextTurmaId(newSchedule),
                        studentCount: 0 
                    });
                }
            }
        });
        
        setSchedule(redistributeStudents(newSchedule, avgStudents));
    };

    const handleShowFicha = (component, eixo) => {
        setSelectedComponentForFicha({ ...component, eixoName: eixo.name, eixoIntention: eixo.intention });
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
                    <FormControl label="1. Selecione o Produto (A Base Rítmica)">
                         <select value={selectedProductId ?? ''} onChange={(e) => setSelectedProductId(e.target.value)} className="w-full rounded-md border-[#e0cbb2] bg-white text-[#5c3a21] shadow-sm focus:border-[#ff595a] focus:ring-1 focus:ring-[#ff5a5a] px-3 py-2" disabled={!availableProducts.length}>
                            {availableProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </FormControl>
                     <FormControl label="2. Defina a Frequência (O Compasso)">
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center bg-white p-1 rounded-md border border-[#e0cbb2]">
                                {[1, 2, 3, 4, 5].map(f => (
                                    <button key={f} onClick={() => setFrequency(f)} className={`flex-1 py-1 rounded-md text-sm transition-colors ${frequency === f ? 'bg-[#ff595a] text-white font-semibold' : 'text-[#8c6d59] hover:bg-[#f3f0e8]'}`}>
                                        {f}x
                                    </button>
                                ))}
                            </div>
                             <div className={`text-center text-sm font-semibold p-1 rounded-md ${occupiedDaysCount > frequency ? 'bg-red-100 text-red-700' : occupiedDaysCount === frequency ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                                Dias com Atividades: {occupiedDaysCount} de {frequency}
                            </div>
                        </div>
                    </FormControl>
                </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
                    <FormControl label="3. Quantidade de Alunos">
                        <NumberInput value={avgStudents} onChange={setAvgStudents} min={1} max={500} step={1} />
                        <div className="text-xs text-center text-[#8c6d59] mt-2 space-y-1">
                            <p><strong>{totalTurmasCount}</strong> turma(s) na grade. Mínimo: <strong>{effectiveMinCapacity}</strong>. Máximo: <strong>{MAX_CAPACITY_PER_TURMA}</strong>.</p>
                        </div>
                    </FormControl>
                    
                     <FormControl 
                        label="Permitir Turma com 1 Matrícula" 
                        description="Desabilita a regra de quórum mínimo por turma.">
                        
                            <div className="flex justify-start pt-2">
                                <Toggle enabled={allowSingleStudentTurma} onChange={setAllowSingleStudentTurma} />
                            </div>
                        
                    </FormControl>

                    <FormControl 
                        label="4. Preço de Venda (Matrícula)" 
                        description="Auto-calculado ou editável.">
                        
                            <NumberInput 
                                value={unitPrice} 
                                onChange={setUnitPrice} 
                                prefix="R$" 
                                formatAsCurrency={true}
                                min={0}
                                max={99999}
                                step={1}
                            />
                        
                    </FormControl>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
                <div className="md:col-span-1 p-4 bg-[#f3f0e8] rounded-2xl border border-[#e0cbb2]">
                     <h3 className="font-semibold text-center mb-4 text-[#5c3a21]">Biblioteca de Componentes</h3>
                     <div className="space-y-2">
                        {eixosPedagogicos.map(eixo => (
                             <div key={eixo.id}>
                                <button onClick={() => toggleEixo(eixo.id)} className="w-full p-2 bg-white rounded-lg font-semibold text-[#5c3a21] cursor-pointer list-none flex justify-between items-center hover:bg-[#ffe9c9] transition-colors" aria-expanded={openEixos.includes(eixo.id)} aria-controls={`eixo-panel-${eixo.id}`}>
                                    <div className="flex items-center">
                                        <span>{eixo.name}</span>
                                    </div>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={`w-4 h-4 text-[#8c6d59] transition-transform flex-shrink-0 ${openEixos.includes(eixo.id) ? 'rotate-90' : 'rotate-0'}`}><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
                                </button>
                                {openEixos.includes(eixo.id) && (
                                    <div id={`eixo-panel-${eixo.id}`} className="grid grid-cols-1 gap-2 pt-2">
                                        {eixo.components.map(c => {
                                            return (
                                                <button key={c.id} onClick={() => handleShowFicha(c, eixo)} onDragStart={(e) => handleDragStart(e, c)} onDragEnd={handleDragEnd} draggable={true} className={`p-2 bg-white rounded-lg shadow-sm text-center border-2 border-transparent transition-all duration-200 cursor-grab active:cursor-grabbing hover:bg-[#ffe9c9] hover:shadow-md focus:outline-none active:outline-none`}>
                                                    <span className="text-2xl">{c.icon}</span>
                                                    <div className="text-sm font-semibold text-[#5c3a21] mt-1 flex items-center justify-center">
                                                        <span>{c.name}</span>
                                                    </div>
                                                </button>
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
                                            <td key={day} onDrop={(e) => isDroppable && handleDrop(e, day, slot)} onDragOver={isDroppable ? handleDragOver : undefined} onDragEnter={() => isDroppable && handleDragEnter(day, slot)} className={`align-top p-1 h-24 w-1/5 border-x border-[#e0cbb2] transition-colors ${!isAvailable ? 'bg-gray-200' : isBeingDraggedOver && isDroppable ? 'bg-[#ffe9c9] border-2 border-dashed border-[#ff595a]' : (isImplicitWindow || cellArray.length > 0) ? 'bg-orange-50' : 'bg-white'}`}>
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
                                                                    <div className="flex items-center gap-1 text-[10px] text-[#5c3a21] font-semibold mt-0.5">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3"><path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" /></svg>
                                                                        <span>{cellData.studentCount}</span>
                                                                    </div>
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
            <div className="text-center mt-8 pt-6 border-t border-[#e0cbb2] flex flex-wrap justify-center items-center gap-4">
                 <button onClick={handleGenerateOptimalSchedule} className="bg-white border border-[#ff595a] text-[#ff595a] font-semibold py-2 px-5 rounded-lg shadow-sm hover:bg-[#ffe9c9] transition-colors inline-flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M10 3.5a.75.75 0 0 1 .75.75v2.5a.75.75 0 0 1-1.5 0V4.25A.75.75 0 0 1 10 3.5ZM9.25 8.75a.75.75 0 0 0-1.5 0v2.5a.75.75 0 0 0 1.5 0v-2.5ZM12.25 8.75a.75.75 0 0 0-1.5 0v2.5a.75.75 0 0 0 1.5 0v-2.5ZM6.879 6.121a.75.75 0 0 0-1.06-1.06l-1.75 1.75a.75.75 0 1 0 1.06 1.06l1.75-1.75ZM16.03 5.06a.75.75 0 0 0-1.06-1.06l-1.75 1.75a.75.75 0 1 0 1.06 1.06l1.75-1.75ZM10 12.25a.75.75 0 0 1 .75.75v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 .75-.75ZM9.03 14.94a.75.75 0 0 0 1.06-1.06l-1.75-1.75a.75.75 0 1 0-1.06 1.06l1.75 1.75ZM13.879 13.121a.75.75 0 0 0 1.06-1.06l-1.75-1.75a.75.75 0 0 0-1.06 1.06l1.75 1.75Z" /></svg>
                    Sugerir Grade Otimizada
                </button>
                <button onClick={handleClearSchedule} disabled={Object.keys(schedule).length === 0} className="bg-white border border-gray-300 text-[#5c3a21] font-semibold py-2 px-5 rounded-lg shadow-sm hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Limpar Grade</button>
                <button onClick={handleSaveScenario} className="bg-[#ff595a] text-white font-bold py-2 px-5 rounded-lg shadow-md hover:bg-red-600 transition-colors">Salvar Cenário</button>
            </div>
             {selectedComponentForFicha && (
                <FichaPedagogicaModal 
                    componentData={selectedComponentForFicha}
                    onClose={() => setSelectedComponentForFicha(null)}
                />
            )}
        </div>
    );
};