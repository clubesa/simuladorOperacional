import React from "react";
import { productDataBySchool, categorias, allComponents } from '../data/jamSessionData.tsx';

export const JamSessionStudio = () => {
    const { useState, useMemo, useEffect } = React;

    const [selectedSchool, setSelectedSchool] = useState(Object.keys(productDataBySchool)[0]);
    const availableProducts = useMemo(() => productDataBySchool[selectedSchool], [selectedSchool]);
    
    const [selectedProductId, setSelectedProductId] = useState(availableProducts.length > 0 ? availableProducts[0].id : null);
    const [frequency, setFrequency] = useState(5);
    // FIX: Add explicit type for the schedule state to resolve type inference issues.
    const [schedule, setSchedule] = useState<Record<string, Record<string, string>>>({});
    const [dragOverCell, setDragOverCell] = useState(null);
    const [openCategories, setOpenCategories] = useState(categorias.length > 0 ? [categorias[0].id] : []);
    const [error, setError] = useState(null);
    
    const scheduledComponentIds = useMemo(() => {
        const ids = new Set();
        Object.values(schedule).forEach(daySchedule => {
            Object.values(daySchedule || {}).forEach(componentId => {
                ids.add(componentId);
            });
        });
        return ids;
    }, [schedule]);

    useEffect(() => {
        const newProducts = productDataBySchool[selectedSchool];
        const defaultProductId = newProducts.length > 0 ? newProducts[0].id : null;
        setSelectedProductId(defaultProductId);
        // Also reset frequency to a common value if the product changes.
        setFrequency(5);
        setSchedule({}); // Clear the schedule when school changes
    }, [selectedSchool]);

    useEffect(() => {
        setSchedule({}); // Clear the schedule when product changes as well
    }, [selectedProductId]);

    const selectedProduct = useMemo(() => availableProducts.find(p => p.id === selectedProductId), [selectedProductId, availableProducts]);

    const totalComponentsCount = useMemo(() => {
        if (!schedule || !selectedProduct || selectedProduct.type !== 'component') return 0;
        // FIX: Explicitly type the accumulator 'count' as a number to resolve the type error.
        return Object.values(schedule).reduce((count: number, daySchedule) => count + Object.keys(daySchedule || {}).length, 0);
    }, [schedule, selectedProduct]);

    const totalCost = useMemo(() => {
        if (!selectedProduct) return 0;
        
        if (selectedProduct.type === 'window') {
            return selectedProduct.priceMatrix[frequency] ?? 0;
        }
        
        if (selectedProduct.type === 'component') {
            // Price matrix is indexed by the number of components, not frequency of days
            return selectedProduct.priceMatrix[totalComponentsCount] ?? 0;
        }

        return 0;
    }, [selectedProduct, frequency, totalComponentsCount]);

    const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    const timeSlots = Array.from({ length: 11 }, (_, i) => `${8 + i}:00`);
    const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];

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
        e.preventDefault();
        setDragOverCell(null);
        const dataString = e.dataTransfer.getData('text/plain');
        if (!dataString) return;

        try {
            const data = JSON.parse(dataString);
            const { id: componentId, source, fromDay, fromSlot } = data;
            const component = allComponents.find(c => c.id === componentId);
            if (!component) return;

            // Prevent dropping on itself or on an occupied cell
            if ((source === 'grid' && fromDay === toDay && fromSlot === toSlot) || schedule[toDay]?.[toSlot]) {
                return;
            }

            // --- VALIDATIONS ---
            const scheduledItems = Object.values(schedule).flatMap(daySchedule => Object.values(daySchedule || {}));

            // 1. Prevent duplicate components (only for new drops from library)
            if (source === 'library' && scheduledItems.includes(componentId)) {
                setError(`O componente "${component.name}" já está na grade.`);
                setTimeout(() => setError(null), 3000);
                return;
            }

            // 2. Logic for 'component' type products (Fundamental)
            if (selectedProduct?.type === 'component') {
                const occupiedDays = Object.keys(schedule).filter(d => Object.keys(schedule[d] || {}).length > 0);

                // Check weekly day frequency limit
                const isAddingToNewDay = !occupiedDays.includes(toDay);
                let wouldExceedDayFrequency = false;

                if (isAddingToNewDay && occupiedDays.length >= frequency) {
                    if (source === 'library') {
                        wouldExceedDayFrequency = true;
                    } else if (source === 'grid') {
                        const isLeavingFromDayEmpty = schedule[fromDay] && Object.keys(schedule[fromDay]).length === 1;
                        if (!isLeavingFromDayEmpty) {
                            wouldExceedDayFrequency = true;
                        }
                    }
                }

                if (wouldExceedDayFrequency) {
                    setError(`Limite de ${frequency} dia(s) com componentes por semana atingido.`);
                    setTimeout(() => setError(null), 3000);
                    return;
                }
                
                // Check daily component limit
                if (selectedProduct.maxPerDay) {
                    const isDifferentDay = source === 'grid' && fromDay !== toDay;
                    // Check only when adding a new component to the day
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

            // 3. Logic for 'window' type products
            if (selectedProduct?.type === 'window') {
                const occupiedDays = Object.keys(schedule).filter(d => Object.keys(schedule[d] || {}).length > 0);
                const isAddingToNewDay = !occupiedDays.includes(toDay);
                
                let wouldExceedFrequency = false;
                if (isAddingToNewDay && occupiedDays.length >= frequency) {
                    if (source === 'library') {
                        wouldExceedFrequency = true;
                    } else if (source === 'grid') {
                        const isLeavingDayEmpty = schedule[fromDay] && Object.keys(schedule[fromDay]).length === 1;
                        // Occupied days increase only if moving from a populated day to a new empty day
                        if (!isLeavingDayEmpty) {
                            wouldExceedFrequency = true;
                        }
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
                        if (Object.keys(nextSchedule[fromDay]).length === 0) {
                            delete nextSchedule[fromDay];
                        }
                    }
                }
                
                return nextSchedule;
            });

        } catch (err) {
            console.error("Error processing drop data:", err);
        }
    };
    const handleDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };
    const handleDragEnter = (day, slot) => setDragOverCell({ day, slot });
    const handleTableDragLeave = () => setDragOverCell(null);
    const handleRemoveComponent = (day, slot) => {
        setSchedule(prev => {
            const newSchedule = JSON.parse(JSON.stringify(prev));
            if (newSchedule[day] && newSchedule[day][slot]) {
                delete newSchedule[day][slot];
                if (Object.keys(newSchedule[day]).length === 0) {
                    delete newSchedule[day];
                }
            }
            return newSchedule;
        });
    };
    
    const isSlotAvailable = (day, slot) => {
        if (!selectedProduct) return false;

        if (selectedProduct.type === 'component') {
            const occupiedDays = Object.keys(schedule).filter(d => Object.keys(schedule[d] || {}).length > 0);

            // Daily limit: Is this day already full?
            if (selectedProduct.maxPerDay) {
                const componentsOnDay = Object.keys(schedule[day] || {}).length;
                if (componentsOnDay >= selectedProduct.maxPerDay && !schedule[day]?.[slot]) {
                    return false;
                }
            }

            // Weekly day limit: Are we trying to add to a new day when the day limit is reached?
            const isNewDay = !occupiedDays.includes(day);
            if (isNewDay && occupiedDays.length >= frequency) {
                return false;
            }

            return true;
        }
        
        if (selectedProduct.type === 'window') {
            const occupiedDays = Object.keys(schedule).filter(d => Object.keys(schedule[d] || {}).length > 0);
            if (occupiedDays.length >= frequency && !occupiedDays.includes(day)) {
                return false;
            }
            if (!selectedProduct.startSlot || !selectedProduct.endSlot) {
                return false;
            }
            const slotHour = parseInt(slot.split(':')[0], 10);
            return slotHour >= selectedProduct.startSlot && slotHour < selectedProduct.endSlot;
        }
        
        return true; // Default to available
    };

    const toggleCategory = (categoryId) => {
        setOpenCategories(prev => prev.includes(categoryId) ? prev.filter(id => id !== categoryId) : [...prev, categoryId]);
    };

    const implicitWindows = useMemo(() => {
        if (selectedProduct?.type !== 'component' || !schedule) {
            return {};
        }
        const windows = {};
        for (const day in schedule) {
            const daySchedule = schedule[day];
            if (Object.keys(daySchedule).length > 0) {
                const slotNumbers = Object.keys(daySchedule).map(slot => parseInt(slot.split(':')[0], 10));
                windows[day] = {
                    min: Math.min(...slotNumbers),
                    max: Math.max(...slotNumbers),
                };
            }
        }
        return windows;
    }, [schedule, selectedProduct]);

    const shuffleArray = (array) => {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    };

    const handleClearSchedule = () => {
        setSchedule({});
        setError(null);
    };

    const handleAutoFill = () => {
        if (!selectedProduct) return;

        // Reset schedule before filling
        setSchedule({});
        setError(null);

        // Create a mutable copy of shuffled components to draw from, excluding supervision
        const componentPool = shuffleArray([...allComponents.filter(c => c.id !== 'c10')]);

        const newSchedule: Record<string, Record<string, string>> = {};
        const daysToFill = days.slice(0, frequency);

        if (selectedProduct.type === 'window') {
            const { startSlot, endSlot } = selectedProduct;
            if (startSlot === undefined || endSlot === undefined) return;

            for (const day of daysToFill) {
                newSchedule[day] = {};
                for (let hour = startSlot; hour < endSlot; hour++) {
                    const slot = `${hour}:00`;
                    const component = componentPool.pop();
                    if (component) {
                        newSchedule[day][slot] = component.id;
                    } else {
                        break; 
                    }
                }
            }
        } else if (selectedProduct.type === 'component') {
            const { maxPerDay = 1 } = selectedProduct;
            
            for (const day of daysToFill) {
                newSchedule[day] = {};
                let componentsPlacedToday = 0;
                for (const slot of timeSlots) {
                    if (componentsPlacedToday >= maxPerDay) break;
                    
                    const component = componentPool.pop();
                    if (component) {
                        newSchedule[day][slot] = component.id;
                        componentsPlacedToday++;
                    } else {
                        break;
                    }
                }
            }
        }
        setSchedule(newSchedule);
    };


    return (
        <div className="my-12 p-6 bg-white rounded-2xl shadow-xl border-2 border-[#ff595a]">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-[#5c3a21]">Jam Session Studio</h2>
                <p className="text-[#8c6d59] max-w-3xl mx-auto">
                    Componha com a Jam Session para o groove! Selecione um produto, a frequência e arraste os componentes para montar a grade horária.
                </p>
            </div>
            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow-md" role="alert">
                    <p className="font-bold">Ação não permitida</p>
                    <p>{error}</p>
                </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                <div>
                    <label className="block text-sm font-medium text-[#5c3a21] mb-2">1. Selecione a Escola</label>
                    <select
                        value={selectedSchool}
                        onChange={(e) => setSelectedSchool(e.target.value)}
                        className="w-full rounded-md border-[#e0cbb2] bg-white text-[#5c3a21] shadow-sm focus:border-[#ff595a] focus:ring-1 focus:ring-[#ff595a] px-3 py-2"
                    >
                        {Object.keys(productDataBySchool).map(school => <option key={school} value={school}>{school}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-[#5c3a21] mb-2">2. Selecione o Produto (A Base Rítmica)</label>
                    <select
                        value={selectedProductId ?? ''}
                        onChange={(e) => setSelectedProductId(e.target.value)}
                        className="w-full rounded-md border-[#e0cbb2] bg-white text-[#5c3a21] shadow-sm focus:border-[#ff595a] focus:ring-1 focus:ring-[#ff595a] px-3 py-2"
                        disabled={!availableProducts.length}
                    >
                        {availableProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-[#5c3a21] mb-2">
                        3. Defina a Frequência (O Compasso)
                    </label>
                    <div className="flex justify-between items-center bg-white p-1 rounded-md border border-[#e0cbb2]">
                        {[1, 2, 3, 4, 5].map(f => (
                            <button
                                key={f}
                                onClick={() => setFrequency(f)}
                                className={`flex-1 py-1 rounded-md text-sm transition-colors ${frequency === f ? 'bg-[#ff595a] text-white font-semibold' : 'text-[#8c6d59] hover:bg-[#f3f0e8]'}`}
                            >
                                {f}x
                            </button>
                        ))}
                    </div>
                </div>
                 <div className="bg-[#f3f0e8] p-4 rounded-lg border border-[#e0cbb2] flex flex-col justify-center">
                    <p className="text-sm text-[#8c6d59] text-center">Custo Total da Configuração:</p>
                    <p className="text-2xl font-bold text-[#ff595a] text-center">{formatCurrency(totalCost)}</p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-1 p-4 bg-[#f3f0e8] rounded-2xl border border-[#e0cbb2]">
                     <h3 className="font-semibold text-center mb-4 text-[#5c3a21]">Biblioteca de Componentes</h3>
                     <div className="space-y-2">
                        {categorias.map(category => (
                             <div key={category.id}>
                                <button 
                                    onClick={() => toggleCategory(category.id)}
                                    className="w-full p-2 bg-white rounded-lg font-semibold text-[#5c3a21] cursor-pointer list-none flex justify-between items-center hover:bg-[#ffe9c9] transition-colors"
                                    aria-expanded={openCategories.includes(category.id)}
                                    aria-controls={`category-panel-${category.id}`}
                                >
                                    <span>{category.name}</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className={`w-4 h-4 text-[#8c6d59] transition-transform ${openCategories.includes(category.id) ? 'rotate-90' : 'rotate-0'}`}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                                    </svg>
                                </button>
                                {openCategories.includes(category.id) && (
                                    <div 
                                        id={`category-panel-${category.id}`}
                                        className="grid grid-cols-2 gap-3 pt-2"
                                    >
                                        {category.components.map(c => {
                                            const isScheduled = scheduledComponentIds.has(c.id);
                                            return (
                                                <div
                                                    key={c.id}
                                                    draggable={!isScheduled}
                                                    onDragStart={(e) => !isScheduled && handleDragStart(e, c)}
                                                    onDragEnd={handleDragEnd}
                                                    className={`p-2 bg-white rounded-lg shadow-sm text-center border-2 border-transparent transition-all ${
                                                        isScheduled
                                                            ? 'opacity-40 cursor-not-allowed'
                                                            : 'cursor-grab active:cursor-grabbing hover:border-[#ff595a] focus:outline-none active:outline-none'
                                                    }`}
                                                >
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
                                        const isImplicitWindow = selectedProduct?.type === 'component' && 
                                                                !scheduledComponentId &&
                                                                implicitWindows[day] &&
                                                                slotHour >= implicitWindows[day].min &&
                                                                slotHour <= implicitWindows[day].max;

                                        return (
                                            <td
                                                key={day}
                                                onDrop={(e) => isDroppable && handleDrop(e, day, slot)}
                                                onDragOver={isDroppable ? handleDragOver : undefined}
                                                onDragEnter={() => isDroppable && handleDragEnter(day, slot)}
                                                className={`p-1.5 h-20 w-1/5 border-x border-[#e0cbb2] transition-colors ${
                                                    !isAvailable 
                                                        ? 'bg-gray-200 opacity-50' 
                                                        : isBeingDraggedOver && isDroppable
                                                        ? 'bg-[#ffe9c9] border-2 border-dashed border-[#ff595a]' 
                                                        : isImplicitWindow
                                                        ? 'bg-orange-50'
                                                        : 'bg-white'
                                                }`}
                                            >
                                                {scheduledComponent && (
                                                     <div 
                                                        draggable
                                                        onDragStart={(e) => handleGridDragStart(e, scheduledComponent, day, slot)}
                                                        onDragEnd={handleDragEnd}
                                                        className="relative p-2 bg-[#f3f0e8] rounded-lg h-full flex flex-col items-center justify-center text-center shadow-inner cursor-move active:cursor-grabbing active:shadow-none focus:outline-none active:outline-none"
                                                     >
                                                        <button 
                                                          onClick={() => handleRemoveComponent(day, slot)} 
                                                          className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center rounded-full bg-white/50 hover:bg-red-500 hover:text-white text-gray-500 text-xs leading-none"
                                                          aria-label={`Remover ${scheduledComponent.name}`}
                                                        >
                                                            &times;
                                                        </button>
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
            <div className="text-center mt-8 pt-6 border-t border-[#e0cbb2] flex justify-center items-center gap-4 flex-wrap">
                <button
                    onClick={handleClearSchedule}
                    disabled={Object.keys(schedule).length === 0}
                    className="bg-white border border-gray-300 text-[#5c3a21] font-semibold py-2 px-5 rounded-lg shadow-sm hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Limpar Grade
                </button>
                <button 
                    onClick={handleAutoFill} 
                    disabled={!selectedProduct} 
                    className="inline-flex items-center gap-2 bg-white border border-[#ff595a] text-[#ff595a] font-semibold py-2 px-5 rounded-lg shadow-sm hover:bg-[#fff5f5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.31h5.418a.562.562 0 0 1 .321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 21.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988H8.9a.563.563 0 0 0 .475-.31L11.48 3.5Z" />
                    </svg>
                    Preencher (Auto)
                </button>
                <button className="bg-[#ff595a] text-white font-bold py-2 px-5 rounded-lg shadow-md hover:bg-red-600 transition-colors">
                    Salvar Cenário de Demanda
                </button>
            </div>
        </div>
    );
};