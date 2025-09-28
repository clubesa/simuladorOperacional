import React, { useState, useMemo } from 'react';
import { produtos, componentes, Schedule, Componente } from '../data/jamSessionData';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
};

const JamSessionStudio: React.FC = () => {
    const [selectedProductId, setSelectedProductId] = useState<string | null>(produtos[0].id);
    const [frequency, setFrequency] = useState<number>(5);
    const [schedule, setSchedule] = useState<Schedule>({});
    const [dragOverCell, setDragOverCell] = useState<{ day: string; slot: string } | null>(null);

    const selectedProduct = useMemo(() => produtos.find(p => p.id === selectedProductId), [selectedProductId]);
    const totalCost = useMemo(() => selectedProduct?.priceMatrix[frequency] ?? 0, [selectedProduct, frequency]);

    const timeSlots = Array.from({ length: 11 }, (_, i) => `${8 + i}:00`); // 8:00 to 18:00
    const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];

    const handleDragStart = (e: React.DragEvent, component: Componente) => {
        e.dataTransfer.setData('text/plain', component.id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragEnd = () => {
        setDragOverCell(null);
    };
    
    const handleDrop = (e: React.DragEvent, day: string, slot: string) => {
        e.preventDefault();
        setDragOverCell(null);
        const componentId = e.dataTransfer.getData('text/plain');
        if (!componentId) return;

        const component = componentes.find(c => c.id === componentId);
        if (!component) return;
        
        setSchedule(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                [slot]: component.id,
            }
        }));
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };
    
    const handleDragEnter = (day: string, slot: string) => {
        setDragOverCell({ day, slot });
    };

    const handleTableDragLeave = () => {
        setDragOverCell(null);
    };
    
    const handleRemoveComponent = (day: string, slot: string) => {
        setSchedule(prev => {
            const newDaySchedule = { ...prev[day] };
            delete newDaySchedule[slot];
            return {
                ...prev,
                [day]: newDaySchedule
            };
        });
    };

    const isSlotAvailable = (slot: string) => {
        if (!selectedProduct) return false;
        const slotHour = parseInt(slot.split(':')[0], 10);
        return slotHour >= selectedProduct.startSlot && slotHour < selectedProduct.endSlot;
    };
    
    return (
        <div className="my-12 p-6 bg-white rounded-2xl shadow-xl border-2 border-[#ff595a]">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-[#5c3a21]">Jam Session Studio</h2>
                <p className="text-[#8c6d59] max-w-3xl mx-auto">
                    Componha a semana ideal! Selecione um produto, a frequência e arraste os componentes para montar a grade horária.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div>
                    <label className="block text-sm font-medium text-[#5c3a21] mb-2">1. Selecione o Produto (A Base Rítmica)</label>
                    <select
                        value={selectedProductId ?? ''}
                        onChange={(e) => setSelectedProductId(e.target.value)}
                        className="w-full rounded-md border-[#e0cbb2] bg-white text-[#5c3a21] shadow-sm focus:border-[#ff595a] focus:ring-1 focus:ring-[#ff595a] px-3 py-2"
                    >
                        {produtos.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-[#5c3a21] mb-2">2. Defina a Frequência (O Compasso)</label>
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
                     <div className="grid grid-cols-2 gap-3">
                        {componentes.map(c => (
                            <div
                                key={c.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, c)}
                                onDragEnd={handleDragEnd}
                                className="p-2 bg-white rounded-lg shadow-sm text-center cursor-grab active:cursor-grabbing border-2 border-transparent hover:border-[#ff595a]"
                            >
                                <span className="text-2xl">{c.icon}</span>
                                <p className="text-xs font-semibold text-[#5c3a21] mt-1">{c.name}</p>
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
                                        const scheduledComponent = scheduledComponentId ? componentes.find(c => c.id === scheduledComponentId) : null;
                                        const isAvailable = isSlotAvailable(slot);
                                        const isBeingDraggedOver = dragOverCell?.day === day && dragOverCell?.slot === slot;

                                        return (
                                            <td
                                                key={day}
                                                onDrop={(e) => isAvailable && handleDrop(e, day, slot)}
                                                onDragOver={isAvailable ? handleDragOver : undefined}
                                                onDragEnter={() => isAvailable && handleDragEnter(day, slot)}
                                                className={`p-1.5 h-20 w-1/5 border-x border-[#e0cbb2] transition-colors ${
                                                    !isAvailable 
                                                        ? 'bg-gray-200 opacity-50' 
                                                        : isBeingDraggedOver 
                                                        ? 'bg-[#ffe9c9] border-2 border-dashed border-[#ff595a]' 
                                                        : 'bg-white'
                                                }`}
                                            >
                                                {isAvailable && scheduledComponent && (
                                                     <div className="relative p-2 bg-[#f3f0e8] rounded-lg h-full flex flex-col items-center justify-center text-center shadow-inner">
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
            <div className="text-center mt-6">
                <button className="bg-[#ff595a] text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-red-600 transition-colors">
                    Salvar Cenário de Demanda
                </button>
            </div>
        </div>
    );
};

export default JamSessionStudio;