
import React from "react";
import { eixosPedagogicos, allComponents } from '../data/jamSessionData.tsx';
import { FormControl } from './FormControl.tsx';
import { NumberInput } from './NumberInput.tsx';
import { FichaPedagogicaModal } from './FichaPedagogicaModal.tsx';
import { Toggle } from './Toggle.tsx';
import { InfoTooltip } from './InfoTooltip.tsx';
import { FloatingAlert } from './FloatingAlert.tsx';
import { usePersistentState } from "../App.tsx";
import { labirintarPriceMatrix } from "../data/tabelasDePreco.ts";

const OCIO_VIVO_ID = 'c27';

const INFANTIL_AGE_RANGE = { min: 0, max: 5 };
const FUNDAMENTAL_AGE_RANGE = { min: 6, max: 14 };

const parseAgeRange = (ageString) => {
    if (!ageString) return { min: 0, max: 99 };
    const matches = ageString.match(/(\d+)\s*a\s*(\d+)/);
    if (matches && matches.length === 3) {
        return { min: parseInt(matches[1], 10), max: parseInt(matches[2], 10) };
    }
    return { min: 0, max: 99 }; // Fallback for unparseable strings
};

const rangesOverlap = (range1, range2) => {
    if (!range1 || !range2) return true; // If any range is invalid, don't block
    return range1.min <= range2.max && range2.min <= range1.max;
};

// New component for frequency selection
const FrequencySelector = ({ value, onChange, max }) => {
    const options = Array.from({ length: max }, (_, i) => i + 1);
    return (
        <div className="flex space-x-1 bg-white p-1 rounded-lg border border-[#bf917f]">
            {options.map(option => (
                <button
                    key={option}
                    onClick={() => onChange(option)}
                    type="button"
                    className={`flex-1 px-3 py-2 text-sm font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#ff595a] ${
                        value === option
                        ? 'bg-[#ff595a] text-white shadow-sm'
                        : 'text-[#5c3a21] hover:bg-[#f4f0e8]'
                    }`}
                >
                    {option}x
                </button>
            ))}
        </div>
    );
};


const ComponentSelectionModal = ({ 
    isOpen, 
    onClose, 
    onConfirmAndGenerate,
    selectedIds,
    productAgeRange,
    compatibleSpecialistComponents,
    maxComponentes,
    convergenceAnalysis,
    onViewFicha,
    renderOnlyModal = false
}) => {
    const { useState, useEffect } = React;
    const [currentSelection, setCurrentSelection] = useState(selectedIds);
    const [openEixos, setOpenEixos] = useState([]);
    
    useEffect(() => {
        if (isOpen) {
            setCurrentSelection(selectedIds);
            setOpenEixos(eixosPedagogicos.map(e => e.id));
        }
    }, [isOpen, selectedIds]);

    const handleToggleComponent = (componentId) => {
        const isCurrentlySelected = currentSelection.includes(componentId);
        if (!isCurrentlySelected && currentSelection.length >= maxComponentes) {
            // Do not allow selecting more than the max
            return;
        }
        
        setCurrentSelection(prev => 
            isCurrentlySelected
            ? prev.filter(currentId => currentId !== componentId) 
            : [...prev, componentId]
        );
    };
    
    const handleSelectAllCompatible = () => {
        const allCompatibleIds = compatibleSpecialistComponents.map(c => c.id).slice(0, maxComponentes);
        setCurrentSelection(allCompatibleIds);
    };


    const handleDeselectAll = () => {
        setCurrentSelection([]);
    };

    const handleGenerateClick = () => {
        onConfirmAndGenerate(currentSelection);
        onClose();
    };



    const toggleEixo = (eixoId) => {
        setOpenEixos(prev => prev.includes(eixoId) ? prev.filter(openEixoId => openEixoId !== eixoId) : [...prev, eixoId]);
    };
    
    const isSelectionValid = currentSelection.length === maxComponentes;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col m-4" onClick={e => e.stopPropagation()}>
                <header className="p-4 flex justify-between items-center border-b border-[#bf917f]">
                    <div>
                        <h3 className="text-xl font-bold text-[#5c3a21]">Selecionar Componentes</h3>
                        <p className="text-sm text-[#8c6d59]">Selecione os componentes para compor a grade ou o pool de especialistas.</p>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-[#f4f0e8]"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-[#8c6d59]"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg></button>
                </header>

                <div className="p-4 flex justify-between items-center border-b border-[#bf917f] bg-[#f4f0e8]">
                    <div className="font-semibold text-sm">
                        <span className="text-[#5c3a21]">Componentes Selecionados: </span>
                        <span className={`font-bold ${!isSelectionValid && maxComponentes < 50 ? 'text-red-600' : 'text-[#5c3a21]'}`}>{currentSelection.length}</span>
                        {maxComponentes < 50 && <span className="text-[#8c6d59]"> / {maxComponentes} (Necessários)</span>}
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={handleSelectAllCompatible} className="text-sm font-medium text-[#ff595a] hover:underline" disabled={maxComponentes === 0}>Otimizar Seleção</button>
                        <button onClick={handleDeselectAll} className="text-sm font-medium text-[#8c6d59] hover:underline">Limpar</button>
                    </div>
                </div>

                <div className="flex-1 p-4 overflow-y-auto">
                    {maxComponentes === 0 && (
                        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-4 rounded-r-lg" role="alert">
                            <div className="flex">
                                <div className="py-1">
                                    <svg className="fill-current h-6 w-6 text-amber-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zM9 13h2v-2H9v2zm0-7h2v5H9V6z"/></svg>
                                </div>
                                <div>
                                    <p className="font-bold text-amber-800">Nenhum componente especialista pode ser selecionado.</p>
                                    <p className="text-sm text-amber-700 mt-1">
                                       O número de especialidades por dia está definido como 0.
                                    </p>
                                    <p className="text-sm text-amber-700 mt-2 font-semibold">O que fazer?</p>
                                    <ul className="list-disc list-inside text-sm text-amber-700">
                                        <li><strong>Aumente o Nº de Especialidades / Dia</strong> na tela anterior para abrir espaço na grade.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                    {eixosPedagogicos.map(eixo => (
                        <div key={eixo.id} className="mb-2">
                            <button onClick={() => toggleEixo(eixo.id)} className="w-full text-left font-semibold p-2 flex justify-between items-center text-[#5c3a21] bg-[#f4f0e8] rounded-md">
                                <span>{eixo.name}</span>
                                <svg className={`w-4 h-4 transition-transform ${openEixos.includes(eixo.id) ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </button>
                            {openEixos.includes(eixo.id) && (
                                <div className="pl-2 mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {eixo.components.map(component => {
                                        const isOcioVivo = component.id === OCIO_VIVO_ID;
                                        const componentAgeRange = parseAgeRange(component.ficha.idades);
                                        const isCompatible = !productAgeRange || rangesOverlap(productAgeRange, componentAgeRange);
                                        const isSelected = currentSelection.includes(component.id);
                                        const isLimitReached = currentSelection.length >= maxComponentes;
                                        const isDisabled = isOcioVivo || (!isCompatible && maxComponentes < 50) || (!isSelected && isLimitReached);

                                        return (
                                            <div key={component.id} className={`flex items-center justify-between p-2 rounded-md border text-sm transition-colors ${isDisabled && !isSelected ? 'bg-gray-100 opacity-60' : 'hover:bg-[#ffe9c9]'}`}>
                                                <label className={`flex items-center gap-2 flex-grow ${isDisabled && !isSelected ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                                                    <input 
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => handleToggleComponent(component.id)}
                                                        disabled={isDisabled}
                                                        className="h-4 w-4 rounded border-gray-300 text-[#ff595a] focus:ring-[#ff595a] accent-[#ff595a] disabled:opacity-50"
                                                    />
                                                    <span className="truncate">{component.icon} {component.name}</span>
                                                </label>
                                                <button 
                                                    type="button" 
                                                    onClick={(e) => { e.stopPropagation(); onViewFicha(allComponents.find(c => c.id === component.id)); }}
                                                    className="ml-2 p-1 text-[#8c6d59] hover:text-[#5c3a21] rounded-full focus:outline-none focus:ring-2 focus:ring-[#ff595a]"
                                                    aria-label={`Ver ficha de ${component.name}`}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                                                    </svg>
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <footer className="p-4 border-t border-[#bf917f] flex justify-between items-center">
                   {(!isSelectionValid && maxComponentes < 50) ? (
                        <p className="text-xs text-red-600">Você deve selecionar exatamente {maxComponentes} componentes.</p>
                    ) : <span></span>}
                    <button 
                        onClick={handleGenerateClick}
                        disabled={(!isSelectionValid && maxComponentes < 50)}
                        className="bg-[#ff595a] text-white font-bold py-2 px-5 rounded-lg shadow-md hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                            <path fillRule="evenodd" d="M9.53 2.302a.75.75 0 0 1 1.06 0l1.3 1.3a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0l-1.3-1.3a.75.75 0 0 1 0-1.06l4.25-4.25Zm-6.53 9.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0l1.3 1.3a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0l-1.3-1.3ZM12 11.25a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
                            <path d="M3.08 8.08a.75.75 0 0 1 1.06 0l1.3 1.3a.75.75 0 0 1 0 1.06l-1.3 1.3a.75.75 0 0 1-1.06-1.06l.22-.22H2.25a.75.75 0 0 1 0-1.5h1.05l-.22-.22a.75.75 0 0 1 0-1.06Zm10.04 4.04a.75.75 0 0 1 0-1.06l1.3-1.3a.75.75 0 0 1 1.06 0l1.3 1.3a.75.75 0 0 1-1.06 0l-1.3-1.3Z" />
                            <path d="M12.25 2.25a.75.75 0 0 1 1.5 0v1.05l.22-.22a.75.75 0 0 1 1.06 1.06l-1.3 1.3a.75.75 0 0 1-1.06 0l-1.3-1.3a.75.75 0 0 1 1.06-1.06l.22.22V2.25Z" />
                        </svg>
                        {renderOnlyModal ? 'Confirmar Seleção' : (maxComponentes > 50 ? 'Confirmar Seleção' : 'Gerar Grade Otimizada')}
                    </button>
                </footer>
            </div>
        </div>
    );
};


const DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
const TIME_SLOTS = Array.from({ length: 11 }, (_, i) => `${(8 + i).toString().padStart(2, '0')}:00`); // 08:00 to 18:00

export const DeterministicScenarioGenerator = ({
    selectedSchool,
    availableProducts,
    scenarios,
    setScenarios,
    editingScenario,
    setEditingScenario,
    minCapacity,
    setMinCapacity,
    resetMinCapacity,
    minCapacityDefault,
    maxCapacity,
    setMaxCapacity,
    resetMaxCapacity,
    maxCapacityDefault,
    operationMode = 'Total',
    setOperationMode = () => {},
    // New props for Import functionality
    componentSelectorModalOpen,
    setComponentSelectorModalOpen,
    setComponentSelectorCallback,
    importSelectedComponents,
    setImportSelectedComponents,
    setIsComponentSelectorOpen,
    renderOnlyModal = false,
    customMaxComponents = null
}) => {
    const { useEffect, useMemo, useState } = React;

    const [selectedProductId, setSelectedProductId, resetSelectedProductId] = usePersistentState('sim-det-productId', '');
    const [frequency, setFrequency, resetFrequency] = usePersistentState('sim-det-frequency', 1);
    const [avgStudents, setAvgStudents, resetAvgStudents] = usePersistentState('sim-det-avgStudents', 12);
    const [schedule, setSchedule, resetSchedule] = usePersistentState('sim-det-schedule', {});
    const [unitPrice, setUnitPrice] = React.useState(0);
    const [specialistBudgetPerDay, setSpecialistBudgetPerDay, resetSpecialistBudgetPerDay] = usePersistentState('sim-det-specialistBudgetPerDay', 1);
    const [selectedComponentIds, setSelectedComponentIds, resetSelectedComponentIds] = usePersistentState('sim-det-selectedComponentIds', []);
    const [memorial, setMemorial] = useState('');
    
    // Internal state for normal operation
    const [internalIsComponentModalOpen, setInternalIsComponentModalOpen] = React.useState(false);
    const [selectedComponentForFicha, setSelectedComponentForFicha] = React.useState(null);
    const [alertMessage, setAlertMessage] = React.useState('');
    
    // Effective Modal State
    const isModalOpen = renderOnlyModal ? componentSelectorModalOpen : internalIsComponentModalOpen;
    const setModalOpen = renderOnlyModal ? (setComponentSelectorModalOpen || setIsComponentSelectorOpen) : setInternalIsComponentModalOpen;
    
    const [dragItem, setDragItem] = useState(null); // Stores info about the dragged item
    const [dragOverItem, setDragOverItem] = useState(null); // Stores info about the item being dragged over

    const selectedProduct = useMemo(() => availableProducts.find(p => p.id === selectedProductId), [availableProducts, selectedProductId]);
    const isFundamentalB1B2 = useMemo(() => selectedProduct?.id === 'b-f1' || selectedProduct?.id === 'b-f2', [selectedProduct]);

    // Drag and Drop Handlers
    const handleDragStart = (e, data) => {
        if (!isFundamentalB1B2) return;
        // For B1/B2, there's always one turma per slot, so index is always 0.
        const dragData = { day: data.day, slot: data.slot, index: data.index };
        e.dataTransfer.setData('application/json', JSON.stringify(dragData));
        setDragItem(dragData);
        e.currentTarget.classList.add('opacity-40');
    };

    const handleDragEnd = (e) => {
        if (!isFundamentalB1B2) return;
        setDragItem(null);
        setDragOverItem(null);
        e.currentTarget.classList.remove('opacity-40');
    };

    const handleDragOver = (e) => {
        if (!isFundamentalB1B2) return;
        e.preventDefault(); // This is necessary to allow dropping
    };

    const handleDragEnter = (e, data) => {
        if (!isFundamentalB1B2 || !dragItem) return;
        e.preventDefault();
        // Don't highlight if dragging over the source element
        if (dragItem.day === data.day && dragItem.slot === data.slot) {
            return;
        }
        setDragOverItem(data);
    };

    const handleDragLeave = (e) => {
        if (!isFundamentalB1B2) return;
        setDragOverItem(null);
    };

    const handleDrop = (e, targetData) => {
        if (!isFundamentalB1B2) return;
        e.preventDefault();
        const dragDataString = e.dataTransfer.getData('application/json');
        if (!dragDataString) {
            setDragOverItem(null);
            return;
        }

        const sourceData = JSON.parse(dragDataString);
        
        // Prevent dropping on the same spot
        if (sourceData.day === targetData.day && sourceData.slot === targetData.slot) {
            setDragOverItem(null);
            return;
        }

        // Update schedule state by swapping contents of source and target slots
        setSchedule(currentSchedule => {
            const newSchedule = JSON.parse(JSON.stringify(currentSchedule));

            const sourceContent = newSchedule[sourceData.day]?.[sourceData.slot];
            const targetContent = newSchedule[targetData.day]?.[targetData.slot];
            
            // The swap:
            newSchedule[sourceData.day][sourceData.slot] = targetContent;
            newSchedule[targetData.day][targetData.slot] = sourceContent;

            return newSchedule;
        });

        setDragItem(null);
        setDragOverItem(null);
    };


    const visibleTimeSlots = useMemo(() => {
        if (selectedProduct?.type === 'window' && selectedProduct.startSlot && selectedProduct.endSlot) {
            return TIME_SLOTS.filter(slot => {
                const slotHour = parseInt(slot.split(':')[0], 10);
                return slotHour >= selectedProduct.startSlot && slotHour < selectedProduct.endSlot;
            });
        }
        return TIME_SLOTS;
    }, [selectedProduct]);

    const defaultUnitPrice = useMemo(() => {
        // Always use the product's specific price matrix, falling back only if necessary
        const priceMatrix = selectedProduct?.priceMatrix || labirintarPriceMatrix;
        return priceMatrix?.[frequency] || 0;
    }, [selectedProduct, frequency]);

    useEffect(() => {
        // Always use the product's specific price matrix, falling back only if necessary
        const priceMatrix = selectedProduct?.priceMatrix || labirintarPriceMatrix;
        const calculatedPrice = priceMatrix?.[frequency] || 0;
        setUnitPrice(calculatedPrice);
    }, [selectedProductId, frequency, availableProducts]);
    
    const productAgeRange = useMemo(() => {
        if (!selectedProduct) return null;
        if (selectedProduct.name.toLowerCase().includes('infantil')) return INFANTIL_AGE_RANGE;
        if (selectedProduct.name.toLowerCase().includes('fundamental')) return FUNDAMENTAL_AGE_RANGE;
        return null; 
    }, [selectedProduct]);
    
    const compatibleSpecialistComponents = useMemo(() => {
        return allComponents.filter(c => 
            c.id !== OCIO_VIVO_ID && 
            (!productAgeRange || rangesOverlap(productAgeRange, parseAgeRange(c.ficha.idades)))
        );
    }, [productAgeRange]);

    useEffect(() => {
        if (selectedProduct) {
            setSelectedComponentIds([]);
        }
    }, [selectedProductId]); 

    useEffect(() => {
        if (editingScenario) {
            setSelectedProductId(editingScenario.productId);
            setFrequency(editingScenario.frequency);
            setAvgStudents(editingScenario.avgStudents);
            setSchedule(editingScenario.schedule || {});
            setUnitPrice(editingScenario.unitPrice || 0);
            setMinCapacity(editingScenario.minCapacity || 6);
            setMaxCapacity(editingScenario.maxCapacity || 12);
            setSpecialistBudgetPerDay(editingScenario.specialistBudgetPerDay || 1);
            setSelectedComponentIds(editingScenario.selectedComponentIds || []);
            setMemorial(editingScenario.memorial || '');
            // Note: operationMode removed from inputs, handled globally in analysis
        } else {
            resetForm();
        }
    }, [editingScenario, availableProducts]);
    
     useEffect(() => {
        if (availableProducts.length > 0) {
            const currentProductExists = availableProducts.some(p => p.id === selectedProductId);
            if (!currentProductExists || !selectedProductId) {
                setSelectedProductId(availableProducts[0].id);
            }
        }
    }, [availableProducts, selectedProductId]);

    const resetForm = () => {
        resetSelectedProductId();
        resetFrequency();
        resetAvgStudents();
        resetSchedule();
        setEditingScenario(null);
        resetSelectedComponentIds();
        resetSpecialistBudgetPerDay();
        setMemorial('');
    };

    const convergenceAnalysis = useMemo(() => {
        if (!selectedProduct || !avgStudents || avgStudents <= 0) {
            return { numCoortes: 0, numSlots: 0, convergencia: 0, status: 'Aguardando dados...', indiceRotacaoDiaria: 0, specialistBudgetPerDay: 0, maxNexialistas: 0, turmasEspecDia: 0, alunosPorTurmaEspec: 0 };
        }
        
        const numCoortes = Math.ceil(avgStudents / maxCapacity);
        const numSlots = visibleTimeSlots.length > 0 ? visibleTimeSlots.length : (selectedProduct.type === 'window' ? (selectedProduct.endSlot - selectedProduct.startSlot) : frequency);
        const convergencia = numSlots > 0 ? numCoortes / numSlots : 0;
        
        let status = "Convergência Indefinida";
        if (convergencia === 1) status = "Convergência Perfeita";
        else if (convergencia > 1) status = "Mais Coortes que Slots";
        else if (convergencia < 1 && convergencia > 0) status = "Menos Coortes que Slots";

        let maxNexialistas;

        if (numCoortes <= 1) {
            const numOcioVivoSlots = numSlots - specialistBudgetPerDay;
            maxNexialistas = numOcioVivoSlots > 0 ? 1 : 0;
        } else {
            maxNexialistas = Math.max(0, numCoortes - specialistBudgetPerDay);
        }
        
        const turmasEspecDia = numCoortes * specialistBudgetPerDay;
        const alunosPorTurmaEspec = turmasEspecDia > 0 ? avgStudents / turmasEspecDia : 0;

        return { 
            numCoortes, 
            numSlots, 
            convergencia, 
            status,
            specialistBudgetPerDay, 
            maxNexialistas,
            turmasEspecDia,
            alunosPorTurmaEspec,
        };
    }, [selectedProduct, avgStudents, maxCapacity, frequency, specialistBudgetPerDay, visibleTimeSlots]);

    const { numCoortes, numSlots, maxNexialistas, turmasEspecDia, alunosPorTurmaEspec } = convergenceAnalysis;
    
    const totalComponentesNecessarios = useMemo(() => {
        if (customMaxComponents !== null) return customMaxComponents; // Override for import mode
        if (specialistBudgetPerDay === 0) return 0;
        return specialistBudgetPerDay * frequency;
    }, [specialistBudgetPerDay, frequency, customMaxComponents]);

    const totalSpecialistTurmasPerWeek = useMemo(() => {
        if (!numCoortes || !selectedProduct) return 0;
        return specialistBudgetPerDay * numCoortes * frequency;
    }, [numCoortes, specialistBudgetPerDay, frequency, selectedProduct]);

    const handleSave = () => {
        if (!selectedProduct) return;
        
        const turmasCount = convergenceAnalysis.numCoortes || Math.max(1, Math.ceil(avgStudents / maxCapacity));

        const newScenario = {
            id: editingScenario ? editingScenario.id : Date.now().toString(),
            school: selectedSchool,
            productName: selectedProduct.name,
            productId: selectedProduct.id,
            frequency: frequency,
            avgStudents: avgStudents,
            unitPrice: unitPrice,
            schedule: schedule,
            turmas: turmasCount,
            minCapacity: minCapacity,
            maxCapacity: maxCapacity,
            specialistBudgetPerDay: specialistBudgetPerDay,
            selectedComponentIds: selectedComponentIds,
            memorial: memorial,
            totalSpecialistTurmasPerWeek: totalSpecialistTurmasPerWeek,
            operationMode: operationMode || 'Total', // Fallback to 'Total' if undefined
            turmasEspecDia: turmasEspecDia,
            alunosPorTurmaEspec: alunosPorTurmaEspec,
        };
        
        setScenarios(prev => editingScenario ? prev.map(s => s.id === editingScenario.id ? newScenario : s) : [...prev, newScenario]);
        resetForm();
    };
    
    const generateOptimizedSchedule = (componentsToUse) => {
        if (!selectedProduct) {
            setAlertMessage("Por favor, selecione um produto primeiro.");
            return;
        }
    
        if (specialistBudgetPerDay > 0 && componentsToUse.length !== totalComponentesNecessarios) {
            setAlertMessage(`Seleção de componentes inválida. São necessários exatamente ${totalComponentesNecessarios} componentes para este cenário (${specialistBudgetPerDay} por dia). Você selecionou ${componentsToUse.length}.`);
            return;
        }
    
        if (specialistBudgetPerDay > 0 && totalComponentesNecessarios > 0 && componentsToUse.length === 0) {
            setAlertMessage("Selecione os componentes especialistas ou defina o Nº de Especialidades / Dia para 0.");
            return;
        }
    
        if (numSlots > 0 && numSlots < numCoortes) {
            setAlertMessage(`A rotação completa não é possível pois o número de slots na janela (${numSlots}) é menor que o número de turmas (${numCoortes}). A grade será gerada, mas nem todas as turmas verão o especialista no mesmo dia.`);
        } else {
            setAlertMessage('');
        }
    
        const studentCount = avgStudents;
    
        // 1. Create Cohorts
        const cohorts = [];
        if (studentCount > 0 && numCoortes > 0) {
            const baseSize = Math.floor(studentCount / numCoortes);
            let remainder = studentCount % numCoortes;
            for (let i = 0; i < numCoortes; i++) {
                cohorts.push({ id: `C-${String.fromCharCode(65 + i)}`, size: baseSize + (remainder > 0 ? 1 : 0) });
                if (remainder > 0) remainder--;
            }
        } else {
            setSchedule({});
            return;
        }
    
        const activeDays = DAYS.slice(0, frequency);
        const newSchedule = {};
        let availableSpecialistsForWeek = [...componentsToUse];
        
        // Generate a numeric hash from product ID to stagger start times
        const productOffset = selectedProductId ? selectedProductId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;
    
        activeDays.forEach(day => {
            newSchedule[day] = {};
            const specialistsForThisDay = availableSpecialistsForWeek.splice(0, specialistBudgetPerDay);
    
            // MULTI-COHORT LOGIC WITH STAGGERING
            // The goal: distribute specialists homogeneously across the window (slots).
            // Instead of assigning all specialists to all cohorts in the first slot,
            // we stagger the assignment based on COHORT index AND PRODUCT ID.
            
            visibleTimeSlots.forEach((slot, slotIndex) => {
                const assignmentsForThisSlot = [];
                
                cohorts.forEach((cohort, cohortIndex) => {
                    let assignedSpecialistId = null;
                    
                    if (specialistBudgetPerDay > 0 && specialistsForThisDay.length > 0) {
                        const step = Math.floor(numSlots / specialistBudgetPerDay) || 1;
                        
                        // Offset calculation:
                        // cohortIndex: staggers different cohorts within THIS product.
                        // productOffset: staggers THIS product relative to OTHER products starting at the same time.
                        const startSlotIndex = (cohortIndex + productOffset) % numSlots;
                        
                        const targetSlotsForCohort = [];
                        for(let k=0; k < specialistBudgetPerDay; k++) {
                            let targetSlot = (startSlotIndex + (k * step)) % numSlots;
                            targetSlotsForCohort.push(targetSlot);
                        }
                        
                        // Does the current slot match one of the target slots?
                        const matchIndex = targetSlotsForCohort.indexOf(slotIndex);
                        
                        if (matchIndex !== -1) {
                            assignedSpecialistId = specialistsForThisDay[(cohortIndex + matchIndex) % specialistsForThisDay.length];
                        }
                    }
                    
                    if (assignedSpecialistId) {
                         const component = allComponents.find(c => c.id === assignedSpecialistId);
                         const prefix = component ? component.name.substring(0, 4).toUpperCase() : 'TURM';
                         const cohortLetter = cohort.id.split('-')[1];
                         
                         assignmentsForThisSlot.push({
                            componentId: assignedSpecialistId,
                            studentCount: cohort.size,
                            turmaId: `${prefix}-${cohortLetter}`,
                            pairId: null,
                        });
                    } else if (!isFundamentalB1B2) {
                        // Assign Quintal Vivo (unless it's B1/B2 which leaves empty)
                         assignmentsForThisSlot.push({
                            componentId: OCIO_VIVO_ID,
                            studentCount: cohort.size,
                            turmaId: `OCIO-${cohort.id.split('-')[1]}`,
                            pairId: null,
                        });
                    }
                });

                 // Sort to maintain a consistent visual order in the grid
                const getCohortLetter = (turmaId) => turmaId.substring(turmaId.lastIndexOf('-') + 1);
                assignmentsForThisSlot.sort((a, b) => getCohortLetter(a.turmaId).localeCompare(getCohortLetter(b.turmaId)));
                
                if (assignmentsForThisSlot.length > 0) {
                    newSchedule[day][slot] = assignmentsForThisSlot;
                } else if (isFundamentalB1B2) {
                     newSchedule[day][slot] = 'LOCKED';
                }
            });
        });
    
        setSchedule(newSchedule);
    };

    const handleConfirmAndGenerate = (selectedIds) => {
        if (renderOnlyModal && setImportSelectedComponents) {
            setImportSelectedComponents(selectedIds);
        } else {
            setSelectedComponentIds(selectedIds);
            generateOptimizedSchedule(selectedIds);
        }
    };

    const activeDays = useMemo(() => {
        if (!schedule || Object.keys(schedule).length === 0) {
            return [];
        }
        return Object.keys(schedule).filter(day => 
            schedule[day] && Object.keys(schedule[day]).length > 0
        );
    }, [schedule]);
    
    const effectiveSelectedIds = renderOnlyModal ? (importSelectedComponents || []) : selectedComponentIds;

    if (renderOnlyModal) {
        return (
             <>
                <ComponentSelectionModal 
                    isOpen={isModalOpen} 
                    onClose={() => setModalOpen(false)}
                    onConfirmAndGenerate={handleConfirmAndGenerate}
                    selectedIds={effectiveSelectedIds}
                    productAgeRange={null}
                    compatibleSpecialistComponents={allComponents.filter(c => c.id !== OCIO_VIVO_ID)}
                    maxComponentes={totalComponentesNecessarios} // Uses customMaxComponents if provided
                    convergenceAnalysis={{}}
                    onViewFicha={setSelectedComponentForFicha}
                    renderOnlyModal={true}
                />
                {selectedComponentForFicha && <FichaPedagogicaModal componentData={selectedComponentForFicha} onClose={() => setSelectedComponentForFicha(null)} />}
            </>
        );
    }

    return (
        <div>
            <FloatingAlert message={alertMessage} onClose={() => setAlertMessage('')} />
            <h3 className="text-lg font-medium text-center text-[#5c3a21] mb-4">{editingScenario ? "Editando Cenário" : "3. Crie um Cenário de Demanda"}</h3>
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-[#bf917f] space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <FormControl label="Produto (Janela de Permanência)"><select value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)} className="w-full rounded-md border-[#bf917f] bg-white text-[#5c3a21] shadow-sm focus:border-[#ff595a] focus:ring-1 focus:ring-[#ff595a] px-3 py-2"><option value="" disabled>Selecione</option>{availableProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></FormControl>
                    <FormControl label="Frequência (vezes por semana)"><FrequencySelector value={frequency} onChange={setFrequency} max={5} /></FormControl>
                    <FormControl label="Batelada (Nº de Alunos por Produto)"><NumberInput value={avgStudents} onChange={setAvgStudents} min={1} max={500} step={1} defaultValue={12} onReset={resetAvgStudents}/></FormControl>
                    <FormControl label="Preço Unitário de Venda (tabela)">
                        <NumberInput 
                            value={unitPrice} 
                            onChange={setUnitPrice} 
                            prefix="R$" 
                            formatAsCurrency={true} 
                            min={0} 
                            max={999999} 
                            step={1} 
                            defaultValue={defaultUnitPrice}
                            onReset={() => setUnitPrice(defaultUnitPrice)}
                        />
                    </FormControl>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start pt-6 mt-6 border-t border-dashed border-[#e0cbb2]">
                    <FormControl label="Quórum Turma"><NumberInput value={minCapacity} onChange={setMinCapacity} min={1} max={maxCapacity} step={1} defaultValue={minCapacityDefault} onReset={resetMinCapacity} /></FormControl>
                    <FormControl label="Capacidade Max Turma"><NumberInput value={maxCapacity} onChange={setMaxCapacity} min={minCapacity} max={50} step={1} defaultValue={maxCapacityDefault} onReset={resetMaxCapacity} /></FormControl>
                    <FormControl label={
                        <div className="flex items-center gap-1">
                            <span>Especialidades / Dia</span>
                            <InfoTooltip text="Define quantas atividades com especialistas diferentes ocorrerão em um dia. O restante da grade será preenchido com 'Quintal Vivo' (nexialistas)." />
                        </div>
                    }>
                        <NumberInput value={specialistBudgetPerDay} onChange={setSpecialistBudgetPerDay} min={0} max={numSlots} step={1} defaultValue={1} onReset={resetSpecialistBudgetPerDay} />
                    </FormControl>
                </div>
                
                {selectedProduct && (
                    <div className="p-4 bg-[#f4f0e8] rounded-lg border border-[#e0cbb2]">
                        <h4 className="font-bold text-center text-[#5c3a21] mb-2">Análise de Viabilidade da Grade</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 text-center text-sm">
                            <div className="bg-white p-2 rounded flex flex-col justify-center"><p className="font-semibold text-xs text-[#8c6d59]">Nº de Coortes</p><p className="font-bold text-lg text-[#5c3a21]">{numCoortes}</p></div>
                            <div className="bg-white p-2 rounded flex flex-col justify-center"><p className="font-semibold text-xs text-[#8c6d59]">Slots da Janela</p><p className="font-bold text-lg text-[#5c3a21]">{numSlots}</p></div>
                             <div className="bg-white p-2 rounded flex flex-col justify-center"><p className="font-semibold text-xs text-[#8c6d59]">Espec./Dia</p><p className="font-bold text-lg text-[#5c3a21]">{specialistBudgetPerDay}</p></div>
                            <div className="bg-white p-2 rounded flex flex-col justify-center"><p className="font-semibold text-xs text-[#8c6d59]">Turmas Espec./Dia</p><p className="font-bold text-lg text-[#5c3a21]">{turmasEspecDia}</p></div>
                            <div className="bg-white p-2 rounded flex flex-col justify-center"><p className="font-semibold text-xs text-[#8c6d59]">Alunos/Turma Espec.</p><p className="font-bold text-lg text-[#5c3a21]">{alunosPorTurmaEspec.toFixed(1)}</p></div>
                            <div className="bg-white p-2 rounded flex flex-col justify-center"><p className="font-semibold text-xs text-[#8c6d59]">Turmas Espec./Semana</p><p className="font-bold text-lg text-[#5c3a21]">{totalSpecialistTurmasPerWeek}</p></div>
                             <div className="bg-white p-2 rounded flex flex-col justify-center col-span-2 sm:col-span-1"><p className="font-semibold text-xs text-[#8c6d59]">Espec. / Nexialistas</p><p className="font-bold text-lg"><span className="text-[#ff595a]">{specialistBudgetPerDay}</span><span className="text-[#8c6d59]"> / </span><span className="text-[#5c3a21]">{maxNexialistas}</span></p></div>
                        </div>
                    </div>
                )}

                <div className="pt-6 border-t border-dashed border-[#e0cbb2]">
                     <FormControl label="Memorial do Cenário (Opcional)" description="Anote suas hipóteses e premissas para este cenário. Ficará visível como um tooltip na lista de cenários salvos.">
                        <textarea
                            value={memorial}
                            onChange={(e) => setMemorial(e.target.value)}
                            rows={2}
                            className="w-full rounded-md border-[#bf917f] bg-white text-[#5c3a21] shadow-sm focus:border-[#ff595a] focus:ring-1 focus:ring-[#ff595a] px-3 py-2"
                            placeholder="Ex: Cenário otimista com alta adesão ao produto integral..."
                        />
                    </FormControl>
                </div>
                 
                 <div className="pt-6 border-t border-dashed border-[#e0cbb2]">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 items-center mb-4">
                         <div>
                             <h4 className="text-md font-bold text-[#5c3a21]">Grade Horária do Produto</h4>
                             <p className="text-xs text-[#8c6d59]">Use os controles para gerar uma grade otimizada com base nos parâmetros do cenário.</p>
                         </div>
                     </div>

                    <div className="flex flex-wrap justify-center items-center gap-4 mb-4">
                        <button onClick={() => setModalOpen(true)} className="inline-flex items-center gap-2 text-sm font-semibold bg-white border border-[#bf917f] text-[#5c3a21] py-2 px-4 rounded-lg shadow-sm hover:bg-[#f4f0e8] transition-colors"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" /></svg>{`Selecionar Componentes e Gerar Grade (${selectedComponentIds.length})`}</button>
                    </div>
                    
                    <div className="overflow-x-auto rounded-lg border border-[#e0cbb2]">
                        <div className="grid" style={{ gridTemplateColumns: `60px repeat(${DAYS.length}, minmax(140px, 1fr))` }}>
                            <div className="font-semibold text-xs text-center p-2 border-b border-r border-[#e0cbb2] bg-[#f4f0e8] sticky left-0 top-0 z-20">Horário</div>
                            {DAYS.map(day => <div key={day} className="font-semibold text-xs text-center p-2 border-b border-r border-[#e0cbb2] bg-[#f4f0e8] sticky top-0 z-10">{day}</div>)}
                            {visibleTimeSlots.map(slot => (
                                <React.Fragment key={slot}>
                                    <div className="font-semibold text-xs text-center p-2 border-b border-r border-[#e0cbb2] bg-[#f4f0e8] sticky left-0 z-10 flex items-center justify-center">{slot}</div>
                                    {DAYS.map(day => {
                                        const slotData = schedule[day]?.[slot];
                                        const isLocked = slotData === 'LOCKED';
                                        const turmasInSlot = Array.isArray(slotData) ? slotData : [];
                                        const isScheduleGenerated = activeDays.length > 0;
                                        const isDayActive = !isScheduleGenerated || activeDays.includes(day);
                                        const isDragOver = dragOverItem?.day === day && dragOverItem?.slot === slot;

                                        return (
                                            <div 
                                                key={`${day}-${slot}`}
                                                onDragOver={handleDragOver}
                                                onDragEnter={(e) => handleDragEnter(e, { day, slot })}
                                                onDragLeave={handleDragLeave}
                                                onDrop={(e) => handleDrop(e, { day, slot })}
                                                className={`relative p-1 border-b border-r border-[#e0cbb2] flex-shrink-0 transition-all duration-200 group hover:z-20 overflow-hidden ${
                                                    !isDayActive || isLocked ? 'bg-gray-200/70' : 'bg-white'
                                                } ${isDragOver ? 'bg-green-100 ring-2 ring-green-400 ring-inset' : ''}`}
                                                style={{ minHeight: '6rem' }}
                                            >
                                                {isLocked && (
                                                    <div className="absolute inset-0 flex items-center justify-center" aria-label="Slot indisponível">
                                                    </div>
                                                )}
                                                <div className="relative h-full group-hover:space-y-px">
                                                    {turmasInSlot.map((turma, index) => {
                                                        const component = allComponents.find(c => c.id === turma.componentId);
                                                        
                                                        const isStacked = turmasInSlot.length > 1;
                                                        const offset = 12;
                                                        
                                                        const style = {
                                                            zIndex: turmasInSlot.length - index,
                                                            '--offset-top': isStacked ? `${index * offset}px` : 'auto',
                                                            '--scale-factor': 1 - (index * 0.06),
                                                            '--translate-y-factor': `${index * 4}px`
                                                        };

                                                        return (
                                                            <div 
                                                                key={turma.turmaId || index} 
                                                                style={style}
                                                                draggable={isFundamentalB1B2}
                                                                onDragStart={(e) => handleDragStart(e, { day, slot, index })}
                                                                onDragEnd={handleDragEnd}
                                                                onClick={() => component && setSelectedComponentForFicha(component)}
                                                                className={`px-1.5 py-0.5 rounded-md text-[10px] border border-[#bf917f] shadow-md bg-white border-l-4 border-l-[#bf917f] 
                                                                    transition-all duration-300 ease-in-out transform-gpu hover:shadow-lg hover:border-l-[#ff595a]
                                                                    ${isStacked 
                                                                        ? `absolute left-1 right-1 top-[var(--offset-top)] scale-[var(--scale-factor)] translate-y-[var(--translate-y-factor)] origin-top group-hover:relative group-hover:top-auto group-hover:scale-100 group-hover:translate-y-0` 
                                                                        : `relative`
                                                                    }
                                                                    ${isFundamentalB1B2 ? 'cursor-move' : 'cursor-pointer'}
                                                                `}
                                                            >
                                                                <p className="font-bold text-[#5c3a21] truncate pr-4">{component?.icon} {component?.name || turma.componentId}</p>
                                                                <p className="text-[#8c6d59]">{turma.turmaId} ({turma.studentCount} aluno(s))</p>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                 </div>

                <div className="flex justify-end gap-4 pt-6 border-t border-[#e0cbb2]">
                    {editingScenario && <button onClick={resetForm} className="text-sm font-medium text-[#8c6d59] hover:underline">Cancelar Edição</button>}
                    <button onClick={handleSave} className="bg-[#ff595a] text-white font-bold py-2 px-5 rounded-lg shadow-md hover:bg-red-600 transition-colors">{editingScenario ? 'Atualizar Cenário' : 'Salvar Cenário'}</button>
                </div>
            </div>
            
            <ComponentSelectionModal 
                isOpen={isModalOpen} 
                onClose={() => setModalOpen(false)}
                onConfirmAndGenerate={handleConfirmAndGenerate}
                selectedIds={effectiveSelectedIds}
                productAgeRange={productAgeRange}
                compatibleSpecialistComponents={compatibleSpecialistComponents}
                maxComponentes={totalComponentesNecessarios}
                convergenceAnalysis={convergenceAnalysis}
                onViewFicha={setSelectedComponentForFicha}
            />

            {selectedComponentForFicha && <FichaPedagogicaModal componentData={selectedComponentForFicha} onClose={() => setSelectedComponentForFicha(null)} />}
        </div>
    );
};
