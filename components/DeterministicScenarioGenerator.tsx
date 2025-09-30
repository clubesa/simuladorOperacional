
import React from "react";
import { categorias, allComponents } from '../data/jamSessionData.tsx';
import { Slider } from './Slider.tsx';
import { FormControl } from './FormControl.tsx';
import { NumberInput } from './NumberInput.tsx';

export const DeterministicScenarioGenerator = ({ selectedSchool, availableProducts, scenarios, setScenarios }) => {
    const { useState, useMemo, useEffect, useRef } = React;

    const [selectedProductId, setSelectedProductId] = useState(availableProducts.length > 0 ? availableProducts[0].id : null);
    const [frequency, setFrequency] = useState(5);
    const [capacity, setCapacity] = useState(100);
    const [avgStudents, setAvgStudents] = useState(15);
    const [schedule, setSchedule] = useState({});
    const [unitPrice, setUnitPrice] = useState(0);
    const [dragOverCell, setDragOverCell] = useState(null);
    const [openCategories, setOpenCategories] = useState(categorias.length > 0 ? [categorias[0].id] : []);
    const [error, setError] = useState(null);
    
    const [isAutoMode, setIsAutoMode] = useState(false);
    const isInitialMount = useRef(true);

    const scheduledComponentIds = useMemo(() => {
        const ids = new Set();
        Object.values(schedule).forEach(daySchedule => {
            Object.values(daySchedule || {}).forEach(componentId => {
                ids.add(componentId);
            });
        });
        return ids;
    }, [schedule]);

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

        for (const { day, slot } of slotsToFill) {
            const component = componentPool.pop();
            if (component) {
                if (!newSchedule[day]) newSchedule[day] = {};
                newSchedule[day][slot] = component.id;
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
        if (!schedule || !selectedProduct || selectedProduct.type !== 'component') return 0;
        return Object.values(schedule).reduce((count: number, daySchedule) => count + Object.keys(daySchedule || {}).length, 0);
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
        e.dataTransfer.setData('text/plain', JSON.stringify({ id: component.id, source: 'library' }));
        e.dataTransfer.effectAllowed = 'move';
    };
    const handleGridDragStart = (e, component, fromDay, fromSlot) => {
        e.dataTransfer.setData('text/plain', JSON.stringify({ id: component.id, source: 'grid', fromDay, fromSlot }));
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
            const { id: componentId, source, fromDay, fromSlot } = data;
            const component = allComponents.find(c => c.id === componentId);
            if (!component) return;

            if ((source === 'grid' && fromDay === toDay && fromSlot === toSlot) || schedule[toDay]?.[toSlot]) return;

            const scheduledItems = Object.values(schedule).flatMap(daySchedule => Object.values(daySchedule || {}));

            if (componentId !== 'c10' && source === 'library' && scheduledItems.includes(componentId)) {
                setError(`O componente "${component.name}" já está na grade.`);
                setTimeout(() => setError(null), 3000);
                return;
            }

            if (selectedProduct?.type === 'component') {
                const occupiedDays = Object.keys(schedule).filter(d => Object.keys(schedule[d] || {}).length > 0);
                const isAddingToNewDay = !occupiedDays.includes(toDay);
                let wouldExceedDayFrequency = false;
                if (isAddingToNewDay && occupiedDays.length >= frequency) {
                    if (source === 'library') wouldExceedDayFrequency = true;
                    else if (source === 'grid') {
                        const isLeavingFromDayEmpty = schedule[fromDay] && Object.keys(schedule[fromDay]).length === 1;
                        if (!isLeavingFromDayEmpty) wouldExceedDayFrequency = true;
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
                        const componentsOnDay = Object.keys(schedule[toDay] || {}).length;
                        if (componentsOnDay >= selectedProduct.maxPerDay) {
                            setError(`Limite de ${selectedProduct.maxPerDay} componente(s) por dia atingido para ${toDay}.`);
                            setTimeout(() => setError(null), 3000);
                            return;
                        }
                    }
                }
            }

            if (selectedProduct?.type === 'window') {
                const occupiedDays = Object.keys(schedule).filter(d => Object.keys(schedule[d] || {}).length > 0);
                const isAddingToNewDay = !occupiedDays.includes(toDay);
                let wouldExceedFrequency = false;
                if (isAddingToNewDay && occupiedDays.length >= frequency) {
                    if (source === 'library') wouldExceedFrequency = true;
                    else if (source === 'grid') {
                        const isLeavingDayEmpty = schedule[fromDay] && Object.keys(schedule[fromDay]).length === 1;
                        if (!isLeavingDayEmpty) wouldExceedFrequency = true;
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
                nextSchedule[toDay][toSlot] = componentId;
                if (source === 'grid' && fromDay && fromSlot) {
                    if (nextSchedule[fromDay]) {
                        delete nextSchedule[fromDay][fromSlot];
                        if (Object.keys(nextSchedule[fromDay]).length === 0) delete nextSchedule[fromDay];
                    }
                }
                return nextSchedule;
            });
        } catch (err) { console.error("Error processing drop data:", err); }
    };
    const handleDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };
    const handleDragEnter = (day, slot) => setDragOverCell({ day, slot });
    const handleTableDragLeave = () => setDragOverCell(null);
    const handleRemoveComponent = (day, slot) => {
        setIsAutoMode(false);
        setSchedule(prev => {
            const newSchedule = JSON.parse(JSON.stringify(prev));
            if (newSchedule[day] && newSchedule[day][slot]) {
                delete newSchedule[day][slot];
                if (Object.keys(newSchedule[day]).length === 0) delete newSchedule[day];
            }
            return newSchedule;
        });
    };
    
    const isSlotAvailable = (day, slot) => {
        if (!selectedProduct) return false;
        if (selectedProduct.type === 'component') {
            const occupiedDays = Object.keys(schedule).filter(d => Object.keys(schedule[d] || {}).length > 0);
            if (selectedProduct.maxPerDay) {
                const componentsOnDay = Object.keys(schedule[day] || {}).length;
                if (componentsOnDay >= selectedProduct.maxPerDay && !schedule[day]?.[slot]) return false;
            }
            const isNewDay = !occupiedDays.includes(day);
            if (isNewDay && occupiedDays.length >= frequency) return false;
            return true;
        }
        if (selectedProduct.type === 'window') {
            const occupiedDays = Object.keys(schedule).filter(d => Object.keys(schedule[d] || {}).length > 0);
            if (occupiedDays.length >= frequency && !occupiedDays.includes(day)) return false;
            if (!selectedProduct.startSlot || !selectedProduct.endSlot) return false;
            const slotHour = parseInt(slot.split(':')[0], 10);
            return slotHour >= selectedProduct.startSlot && slotHour < selectedProduct.endSlot;
        }
        return true;
    };

    const toggleCategory = (categoryId) => {
        setOpenCategories(prev => prev.includes(categoryId) ? prev.filter(id => id !== categoryId) : [...prev, categoryId]);
    };

    const implicitWindows = useMemo(() => {
        if (selectedProduct?.type !== 'component' || !schedule) return {};
        const windows = {};
        for (const day in schedule) {
            const daySchedule = schedule[day];
            if (Object.keys(daySchedule).length > 0) {
                const slotNumbers = Object.keys(daySchedule).map(slot => parseInt(slot.split(':')[0], 10));
                windows[day] = { min: Math.min(...slotNumbers), max: Math.max(...slotNumbers) };
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
                        {categorias.map(category => (
                             <div key={category.id}>
                                <button onClick={() => toggleCategory(category.id)} className="w-full p-2 bg-white rounded-lg font-semibold text-[#5c3a21] cursor-pointer list-none flex justify-between items-center hover:bg-[#ffe9c9] transition-colors" aria-expanded={openCategories.includes(category.id)} aria-controls={`category-panel-${category.id}`}>
                                    <span>{category.name}</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className={`w-4 h-4 text-[#8c6d59] transition-transform ${openCategories.includes(category.id) ? 'rotate-90' : 'rotate-0'}`}><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
                                </button>
                                {openCategories.includes(category.id) && (
                                    <div id={`category-panel-${category.id}`} className="grid grid-cols-2 gap-3 pt-2">
                                        {category.components.map(c => {
                                            const isScheduled = c.id !== 'c10' && scheduledComponentIds.has(c.id);
                                            return (
                                                <div key={c.id} draggable={!isScheduled} onDragStart={(e) => !isScheduled && handleDragStart(e, c)} onDragEnd={handleDragEnd} className={`p-2 bg-white rounded-lg shadow-sm text-center border-2 border-transparent transition-all ${isScheduled ? 'opacity-40 cursor-not-allowed' : 'cursor-grab active:cursor-grabbing hover:border-[#ff595a] focus:outline-none active:outline-none'}`}>
                                                    <span className="text-2xl">{c.icon}</span>
                                                    <p className="text-xs font-semibold text-[#5c3a21] mt-1">{c.name}</p>
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
                                        const scheduledComponentId = schedule[day]?.[slot];
                                        const scheduledComponent = scheduledComponentId ? allComponents.find(c => c.id === scheduledComponentId) : null;
                                        const isAvailable = isSlotAvailable(day, slot);
                                        const isDroppable = isAvailable && !scheduledComponent;
                                        const isBeingDraggedOver = dragOverCell?.day === day && dragOverCell?.slot === slot;
                                        const slotHour = parseInt(slot.split(':')[0], 10);
                                        const isImplicitWindow = selectedProduct?.type === 'component' && !scheduledComponentId && implicitWindows[day] && slotHour >= implicitWindows[day].min && slotHour <= implicitWindows[day].max;
                                        return (
                                            <td key={day} onDrop={(e) => isDroppable && handleDrop(e, day, slot)} onDragOver={isDroppable ? handleDragOver : undefined} onDragEnter={() => isDroppable && handleDragEnter(day, slot)} className={`p-1.5 h-20 w-1/5 border-x border-[#e0cbb2] transition-colors ${!isAvailable ? 'bg-gray-200 opacity-50' : isBeingDraggedOver && isDroppable ? 'bg-[#ffe9c9] border-2 border-dashed border-[#ff595a]' : isImplicitWindow ? 'bg-orange-50' : 'bg-white'}`}>
                                                {scheduledComponent && (
                                                     <div draggable onDragStart={(e) => handleGridDragStart(e, scheduledComponent, day, slot)} onDragEnd={handleDragEnd} className="relative p-2 bg-[#f3f0e8] rounded-lg h-full flex flex-col items-center justify-center text-center shadow-inner cursor-move active:cursor-grabbing active:shadow-none focus:outline-none active:outline-none">
                                                        <button onClick={() => handleRemoveComponent(day, slot)} className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center rounded-full bg-white/50 hover:bg-red-500 hover:text-white text-gray-500 text-xs leading-none" aria-label={`Remover ${scheduledComponent.name}`}>&times;</button>
                                                        <span className="text-2xl">{scheduledComponent.icon}</span>
                                                        <p className="text-xs font-semibold text-[#5c3a21] mt-1">{scheduledComponent.name}</p>
                                                    </div>
                                                )}
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