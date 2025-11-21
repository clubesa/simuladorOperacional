
import React from "react";
import { productDataBySchool, allComponents } from '../data/jamSessionData.tsx';
import { Slider } from './Slider.tsx';
import { FormControl } from './FormControl.tsx';
import { NumberInput } from './NumberInput.tsx';
import { DeterministicScenarioGenerator } from './DeterministicScenarioGenerator.tsx';
import { StochasticScenarioGenerator } from './StochasticScenarioGenerator.tsx';
import { InfoTooltip } from './InfoTooltip.tsx';
import { usePersistentState } from '../App.tsx';
import { Toggle } from './Toggle.tsx';
import { labirintarPriceMatrix } from "../data/tabelasDePreco.ts";

const JAM_SESSION_DEFAULTS = {
    MIN_CAPACITY: 6,
    MAX_CAPACITY: 12,
};

const OCIO_VIVO_ID = 'c27';

// Helper for age range parsing (duplicated to avoid export issues without changing multiple files)
const parseAgeRange = (ageString) => {
    if (!ageString) return { min: 0, max: 99 };
    const matches = ageString.match(/(\d+)\s*a\s*(\d+)/);
    if (matches && matches.length === 3) {
        return { min: parseInt(matches[1], 10), max: parseInt(matches[2], 10) };
    }
    return { min: 0, max: 99 };
};

const rangesOverlap = (range1, range2) => {
    if (!range1 || !range2) return true;
    return range1.min <= range2.max && range2.min <= range1.max;
};


const DataImporterModal = ({ isOpen, onClose, onImport, schoolName, onOpenComponentSelector, selectedComponentCount, importSpecialistBudget, setImportSpecialistBudget, setImportRequiredSpecialties }) => {
    const [pasteData, setPasteData] = React.useState("");
    const [isProcessing, setIsProcessing] = React.useState(false);
    const [previewData, setPreviewData] = React.useState(null);
    const [importType, setImportType] = React.useState('window'); // 'window' or 'component'
    const [maxSlotsPerDay, setMaxSlotsPerDay] = React.useState(1); // For specialty import logic
    
    // Local configuration state for the import batch
    const [importMinCapacity, setImportMinCapacity] = React.useState(6);
    const [importMaxCapacity, setImportMaxCapacity] = React.useState(12);

    React.useEffect(() => {
        if (isOpen) {
            // Force reset every time modal opens to ensure clean state
            setPasteData("");
            setPreviewData(null);
        }
    }, [isOpen]);

    const handleDownloadTemplate = () => {
        let content = '';
        if (importType === 'window') {
            content = `Frequência\tIntegral Manhã\tPreço\tSemi Integral\tPreço\n1x/semana\t10\t750,00\t5\t500,00\n2x/semana\t5\t1300,00\t8\t900,00\n3x/semana\t2\t1800,00\t2\t1300,00\n4x/semana\t0\t2200,00\t0\t1600,00\n5x/semana\t15\t2500,00\t1\t1900,00`;
        } else {
            content = `Frequência (Aulas/Semana)\tQtd Alunos\tPreço Unitário\n1 aula\t19\t362,84\n2 aulas\t3\t689,39\n3 aulas\t1\t979,67\n4 aulas\t0\t1.233,65\n5 aulas\t0\t1.451,36\n6 aulas\t0\t1.687,20\n7 aulas\t0\t1.917,61\n8 aulas\t0\t2.133,49\n9 aulas\t0\t2.334,87\n10 aulas\t0\t2.530,80`;
        }
        
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `template_importacao_${importType}.txt`); // txt easier for copy paste than excel csv which might mess formatting
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePreview = () => {
        if (!pasteData.trim()) return;

        try {
            const rows = pasteData.trim().split('\n').map(row => row.split('\t'));
            
            if (importType === 'component') {
                // --- LOGIC FOR SPECIALTIES (AVULSO) ---
                // Expected: Freq Label | Qty | Price
                // We need to aggregate rows into 1-5 Frequency buckets based on MaxSlotsPerDay
                
                const buckets = { 1: { count: 0, price: 0 }, 2: { count: 0, price: 0 }, 3: { count: 0, price: 0 }, 4: { count: 0, price: 0 }, 5: { count: 0, price: 0 } };
                
                for (let i = 1; i < rows.length; i++) {
                    const row = rows[i];
                    if (row.length < 3) continue;
                    
                    const label = row[0].toLowerCase();
                    const countRaw = row[1];
                    const priceRaw = row[2];
                    
                    const count = countRaw ? parseInt(countRaw.trim().replace(/\./g, ''), 10) : 0;
                    let price = 0;
                    if (priceRaw) {
                        const cleanPrice = priceRaw.replace('R$', '').trim().replace(/\./g, '').replace(',', '.');
                        price = parseFloat(cleanPrice) || 0;
                    }
                    
                    // Extract numeric lessons count from label "X aulas"
                    const match = label.match(/(\d+)/);
                    if (match) {
                        const numLessons = parseInt(match[1], 10);
                        // Map Lessons -> Frequency (Days per Week)
                        // Logic: If MaxSlots=1, Freq = Lessons.
                        // If MaxSlots=2, Freq = Ceil(Lessons / 2).
                        const freq = Math.min(5, Math.max(1, Math.ceil(numLessons / maxSlotsPerDay)));
                        
                        if (count > 0) {
                            buckets[freq].count += count;
                            // For simplicity in simulation, we take the highest price seen for this bucket or average?
                            // Let's take the max to be conservative on revenue or specific price.
                            // Actually, better to average if we are merging? No, let's overwrite. 
                            // Usually high lessons = high freq.
                            // If multiple rows map to same frequency (e.g. 9 and 10 lessons map to 5 days), 
                            // we summing students is correct. Price? Price of 10 lessons is > 9 lessons.
                            // We should probably use a weighted price, but let's use the price of the highest lesson count row for that freq bucket.
                            if (price > buckets[freq].price) {
                                buckets[freq].price = price;
                            }
                        }
                    }
                }
                
                const matrixRow = { frequency: 1, counts: [] }; // Dummy wrapper
                const priceMatrix = {};
                
                // Construct single matrix row for the "Product"
                Object.entries(buckets).forEach(([f, data]) => {
                    priceMatrix[f] = data.price;
                });
                
                // Transform to standard PreviewData format
                // For component import, we treat it as 1 Product with different frequencies
                const finalMatrix = [];
                
                // We need to pivot this. The standard preview expects Rows=Frequencies.
                // So we create 5 rows.
                [1, 2, 3, 4, 5].forEach(f => {
                    finalMatrix.push({
                        frequency: f,
                        counts: [buckets[f].count]
                    });
                });

                setPreviewData({ 
                    headers: ["Especialidade Importada"], 
                    matrix: finalMatrix,
                    priceMatrices: { 0: priceMatrix },
                    type: 'component'
                });

            } else {
                // --- LOGIC FOR WINDOWS (JANELA) --- (Existing)
                const headerRow = rows[0];
                
                const products = [];
                // Iterate columns starting from 1, jumping by 2 to capture Product/Price pairs
                for (let i = 1; i < headerRow.length; i++) {
                    const headerText = headerRow[i].trim();
                    if ((i - 1) % 2 === 0) {
                         if (headerText) {
                            products.push({ name: headerText, colIndex: i });
                         }
                    }
                }
                
                const matrix = [];
                const extractedPriceMatrices = {}; // Map productIndex -> { freq: price }
                
                // Initialize price matrices
                products.forEach((_, idx) => { extractedPriceMatrices[idx] = {}; });
    
                for (let i = 1; i < rows.length; i++) {
                    const row = rows[i];
                    if (!row[0]) continue;
    
                    const freqRaw = row[0].toLowerCase().replace(/[^0-9]/g, '');
                    const freq = parseInt(freqRaw, 10);
                    
                    if (!isNaN(freq) && freq > 0 && freq <= 5) {
                        const rowData = { frequency: freq, counts: [] };
                        
                        products.forEach((prod, pIdx) => {
                            // 1. Parse Quantity (Count)
                            const countRaw = row[prod.colIndex];
                            const count = countRaw ? parseInt(countRaw.trim().replace(/\./g, ''), 10) : 0;
                            
                            // 2. Parse Price (Next Column)
                            const priceRaw = row[prod.colIndex + 1];
                            let price = 0;
                            if (priceRaw) {
                                // Handle formats like "R$ 1.234,56" or "1234.56"
                                const cleanPrice = priceRaw.replace('R$', '').trim().replace(/\./g, '').replace(',', '.');
                                price = parseFloat(cleanPrice) || 0;
                            }
    
                            rowData.counts.push(isNaN(count) ? 0 : count);
                            
                            if (price > 0) {
                                extractedPriceMatrices[pIdx][freq] = price;
                            }
                        });
                        
                        matrix.push(rowData);
                    }
                }
    
                setPreviewData({ 
                    headers: products.map(p => p.name), 
                    matrix,
                    priceMatrices: extractedPriceMatrices,
                    type: 'window'
                });
            }

        } catch (e) {
            console.error(e);
            alert("Erro ao processar os dados. Verifique o formato e tente novamente.");
        }
    };

    // Calculate required specialties logic
    const maxFrequency = React.useMemo(() => {
        if (!previewData) return 0;
        // Find the highest frequency that actually has student counts > 0
        let maxFreqFound = 0;
        previewData.matrix.forEach(row => {
            const totalStudentsInFreq = row.counts.reduce((a, b) => a + b, 0);
            if (totalStudentsInFreq > 0 && row.frequency > maxFreqFound) {
                maxFreqFound = row.frequency;
            }
        });
        return maxFreqFound;
    }, [previewData]);

    const requiredSpecialties = maxFrequency * importSpecialistBudget;
    const isSelectionValid = selectedComponentCount === requiredSpecialties;

    const handleConfirm = () => {
        if (!isSelectionValid && requiredSpecialties > 0) return;
        
        setIsProcessing(true);
        setTimeout(() => {
            onImport(previewData, {
                minCapacity: importMinCapacity,
                maxCapacity: importMaxCapacity,
                specialistBudgetPerDay: importSpecialistBudget,
                importType: importType,
                maxSlotsPerDay: maxSlotsPerDay
            });
            setIsProcessing(false);
            onClose();
        }, 500);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col m-4" onClick={e => e.stopPropagation()}>
                <header className="p-6 border-b border-[#bf917f] bg-[#f4f0e8] rounded-t-2xl">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-xl font-bold text-[#5c3a21]">Importar Demanda (Control + V)</h3>
                            <div className="mt-2 p-2 bg-white rounded border border-[#e0cbb2] inline-block">
                                <span className="text-sm text-[#8c6d59]">Escola Selecionada:</span>
                                <br/>
                                <strong className="text-[#ff595a] text-lg">{schoolName}</strong>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-1 rounded-full hover:bg-[#e0cbb2]">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-[#8c6d59]">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </header>
                
                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    {/* Import Type Selector */}
                    <div className="flex flex-col md:flex-row gap-6 p-4 bg-white border border-[#e0cbb2] rounded-lg items-center">
                        <div className="flex-1">
                            <span className="block text-sm font-bold text-[#5c3a21] mb-2">Tipo de Produto</span>
                            <div className="flex space-x-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="importType" value="window" checked={importType === 'window'} onChange={() => setImportType('window')} className="accent-[#ff595a]" />
                                    <span className="text-sm text-[#5c3a21]">Contraturno (Janela)</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="importType" value="component" checked={importType === 'component'} onChange={() => setImportType('component')} className="accent-[#ff595a]" />
                                    <span className="text-sm text-[#5c3a21]">Especialidades (Avulso)</span>
                                </label>
                            </div>
                        </div>
                        {importType === 'component' && (
                             <div className="w-48">
                                <FormControl label="Max Slots / Dia" description="Quantas aulas um aluno pode fazer por dia?">
                                    <NumberInput value={maxSlotsPerDay} onChange={setMaxSlotsPerDay} min={1} max={2} />
                                </FormControl>
                            </div>
                        )}
                        <div>
                            <button onClick={handleDownloadTemplate} className="text-sm bg-[#fff8f0] text-[#ff595a] font-bold py-2 px-4 rounded border border-[#ff595a] hover:bg-[#ffe9c9] transition-colors flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                                Baixar Modelo TXT
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <FormControl label="Dados da Planilha (Colar aqui)" description={importType === 'window' ? "Estrutura: Frequência | Produto A | Preço A..." : "Estrutura: Aulas/Semana | Qtd Alunos | Preço Unitário"}>
                                 <textarea
                                    value={pasteData}
                                    onChange={e => setPasteData(e.target.value)}
                                    rows={6}
                                    placeholder={importType === 'window' ? `1x/semana\t10\t750,00...` : `1 aula\t19\t362,84...`}
                                    className="w-full font-mono text-xs rounded-md border-[#bf917f] bg-gray-50 text-[#5c3a21] shadow-sm focus:border-[#ff595a] focus:ring-1 focus:ring-[#ff595a] px-3 py-2 whitespace-pre"
                                />
                            </FormControl>
                        </div>
                        <div className="bg-[#fff8f0] p-4 rounded-lg border border-[#bf917f]">
                            <h4 className="font-bold text-[#5c3a21] text-sm mb-3 border-b border-[#e0cbb2] pb-2">Configuração Global para Importação</h4>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormControl label="Quórum Turma">
                                        <NumberInput value={importMinCapacity} onChange={setImportMinCapacity} min={1} max={50} step={1} />
                                    </FormControl>
                                    <FormControl label="Capacidade Max">
                                        <NumberInput value={importMaxCapacity} onChange={setImportMaxCapacity} min={1} max={50} step={1} />
                                    </FormControl>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    <FormControl label="Especialidades / Dia" description="Quantos especialistas diferentes cada turma terá por dia.">
                                        <NumberInput value={importSpecialistBudget} onChange={setImportSpecialistBudget} min={0} max={5} step={1} />
                                    </FormControl>
                                </div>
                            </div>
                        </div>
                    </div>

                    {!previewData && (
                        <div className="text-right border-t border-[#e0cbb2] pt-4">
                             <button onClick={handlePreview} disabled={!pasteData} className="bg-[#e0cbb2] text-[#5c3a21] font-bold py-2 px-4 rounded-lg hover:bg-[#d4bfa0] disabled:opacity-50 transition-colors">
                                Processar Colunas
                            </button>
                        </div>
                    )}

                    {previewData && (
                        <div className="space-y-4">
                            <div className="bg-[#f4f0e8] p-4 rounded-lg border border-[#e0cbb2]">
                                <h4 className="font-bold text-[#5c3a21] mb-2 text-sm">Pré-visualização: {previewData.headers.length} Produtos Identificados</h4>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs text-left border-collapse">
                                        <thead>
                                            <tr className="bg-white border-b border-[#bf917f]">
                                                <th className="p-2 border-r border-[#e0cbb2]">Freq.</th>
                                                {previewData.headers.map((h, i) => (
                                                    <th key={i} className="p-2 font-medium text-[#5c3a21] border-r border-[#e0cbb2] min-w-[150px]">
                                                        {h} <br/>
                                                        <span className="text-[10px] text-gray-500 font-normal">(Qtd | Preço)</span>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {previewData.matrix.map((row, i) => (
                                                <tr key={i} className="border-b border-[#e0cbb2]">
                                                    <td className="p-2 font-bold border-r border-[#e0cbb2]">{row.frequency}x</td>
                                                    {row.counts.map((count, j) => {
                                                        const price = previewData.priceMatrices[j]?.[row.frequency];
                                                        return (
                                                            <td key={j} className="p-2 border-r border-[#e0cbb2]">
                                                                <span className={`font-bold ${count > 0 ? 'text-[#ff595a]' : 'text-gray-400'}`}>{count} alunos</span>
                                                                {price > 0 && <span className="block text-[10px] text-gray-600">R$ {price.toFixed(2)}</span>}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Botão de Seleção de Especialidades movido para DEPOIS da tabela */}
                            <div className="flex justify-center">
                                <button 
                                    onClick={() => {
                                        if (setImportRequiredSpecialties) setImportRequiredSpecialties(requiredSpecialties);
                                        onOpenComponentSelector();
                                    }}
                                    disabled={requiredSpecialties === 0}
                                    className={`flex items-center justify-between w-full max-w-md p-3 border border-[#bf917f] rounded-lg transition-colors group ${isSelectionValid && requiredSpecialties > 0 ? 'bg-green-50 border-green-500' : 'bg-white hover:bg-[#ffe9c9]'}`}
                                >
                                    <div className="text-left">
                                        <span className="block text-sm font-bold text-[#5c3a21]">Selecionar Especialidades</span>
                                        <span className={`text-xs ${isSelectionValid && requiredSpecialties > 0 ? 'text-green-700' : 'text-red-600'}`}>
                                            {selectedComponentCount > 0 
                                                ? `${selectedComponentCount} selecionadas` 
                                                : requiredSpecialties === 0 ? "Nenhuma especialidade necessária (0/dia)" : "Nenhuma selecionada"}
                                        </span>
                                        <span className="block text-[10px] text-[#8c6d59] mt-1">
                                            Meta: {requiredSpecialties} (Máx Freq {maxFrequency}x * {importSpecialistBudget} Esp/Dia)
                                        </span>
                                    </div>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${isSelectionValid && requiredSpecialties > 0 ? 'text-green-600' : 'text-[#ff595a]'}`}>
                                        {isSelectionValid && requiredSpecialties > 0 ? <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />}
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <footer className="p-6 border-t border-[#bf917f] flex justify-end gap-3">
                    <button onClick={onClose} className="text-[#8c6d59] font-medium hover:underline">Cancelar</button>
                    <button 
                        onClick={handleConfirm} 
                        disabled={!previewData || isProcessing || (!isSelectionValid && requiredSpecialties > 0)}
                        className="bg-[#ff595a] text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title={(!isSelectionValid && requiredSpecialties > 0) ? `Selecione exatamente ${requiredSpecialties} especialidades.` : ""}
                    >
                        {isProcessing ? 'Importando...' : 'Confirmar e Gerar Cenários'}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export const JamSessionStudio = ({ scenarios, setScenarios }) => {
    const { useMemo, useRef, useEffect, useState } = React;

    const [customSchools, setCustomSchools] = usePersistentState('sim-jam-customSchools', {});
    const [hiddenDefaultSchools, setHiddenDefaultSchools] = usePersistentState('sim-jam-hiddenDefaults', []); // Track deleted default schools
    const [selectedSchool, setSelectedSchool, resetSelectedSchool] = usePersistentState('sim-jam-selectedSchool', Object.keys(productDataBySchool)[0]);
    
    // New School UI State
    const [isCreatingSchool, setIsCreatingSchool] = useState(false);
    const [newSchoolName, setNewSchoolName] = useState("");
    
    // Dropdown State
    const [isSchoolDropdownOpen, setIsSchoolDropdownOpen] = useState(false);
    const schoolDropdownRef = useRef(null);

    // Import modal state
    const [isImportModalOpen, setIsImportModalOpen] = React.useState(false);
    const [importSelectedComponents, setImportSelectedComponents] = React.useState([]);
    const [isComponentSelectorOpen, setIsComponentSelectorOpen] = React.useState(false);
    const [importSpecialistBudget, setImportSpecialistBudget] = React.useState(1);
    const [importRequiredSpecialties, setImportRequiredSpecialties] = useState(0);

    // Merge default and custom schools, removing hidden defaults
    const allSchoolsData = useMemo(() => {
        const filteredDefaults = {};
        Object.entries(productDataBySchool).forEach(([name, data]) => {
            if (!hiddenDefaultSchools.includes(name)) {
                filteredDefaults[name] = data;
            }
        });
        return { ...filteredDefaults, ...customSchools };
    }, [customSchools, hiddenDefaultSchools]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (schoolDropdownRef.current && !schoolDropdownRef.current.contains(event.target)) {
                setIsSchoolDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Ensure selected school is valid (fallback to first available)
    useEffect(() => {
        if (!isCreatingSchool && !allSchoolsData[selectedSchool] && Object.keys(allSchoolsData).length > 0) {
            setSelectedSchool(Object.keys(allSchoolsData)[0]);
        } else if (!allSchoolsData[selectedSchool] && Object.keys(allSchoolsData).length === 0) {
             setSelectedSchool("");
        }
    }, [allSchoolsData, selectedSchool, isCreatingSchool]);

    const [schoolConfigs, setSchoolConfigs] = usePersistentState('sim-jam-schoolConfigs', {});

    // Derived state based on selected school, defaulting if not set
    const mode = schoolConfigs[selectedSchool]?.mode || 'deterministico';

    const setMode = (newMode) => {
        setSchoolConfigs(prev => ({
            ...prev,
            [selectedSchool]: { ...prev[selectedSchool], mode: newMode }
        }));
    };

    const handleCreateSchoolSave = () => {
        if (newSchoolName && newSchoolName.trim() !== "") {
            const name = newSchoolName.trim();
            setCustomSchools(prev => ({
                ...prev,
                [name]: [] // Initialize with empty product list
            }));
            setSelectedSchool(name);
            setIsCreatingSchool(false);
        }
    };

    const handleCreateSchoolCancel = () => {
        setIsCreatingSchool(false);
        setNewSchoolName("");
        // Revert to a safe value if current selection is invalid
        if (!allSchoolsData[selectedSchool] && Object.keys(allSchoolsData).length > 0) {
             setSelectedSchool(Object.keys(allSchoolsData)[0]);
        }
    };

    const handleDeleteSchool = (schoolName) => {
       if (window.confirm(`Tem certeza que deseja excluir a escola "${schoolName}"?`)) {
           // Determine if it's a default school or custom
           const isDefault = productDataBySchool.hasOwnProperty(schoolName);
           
           if (isDefault) {
                setHiddenDefaultSchools(prev => {
                    if (!prev.includes(schoolName)) {
                        return [...prev, schoolName];
                    }
                    return prev;
                });
           } else {
                setCustomSchools(prev => {
                    const newCustomSchools = { ...prev };
                    delete newCustomSchools[schoolName];
                    return newCustomSchools;
                });
           }
           
           // Remove scenarios associated with deleted school
           setScenarios(prev => prev.filter(s => s.school !== schoolName));

           // Close dropdown
           setIsSchoolDropdownOpen(false);
           
           // Logic to select another school will run automatically via the useEffect
       }
    };

    const availableProducts = useMemo(() => allSchoolsData[selectedSchool] || [], [selectedSchool, allSchoolsData]);
    
    const [minCapacity, setMinCapacity, resetMinCapacity] = usePersistentState('sim-jam-minCapacity', JAM_SESSION_DEFAULTS.MIN_CAPACITY);
    const [maxCapacity, setMaxCapacity, resetMaxCapacity] = usePersistentState('sim-jam-maxCapacity', JAM_SESSION_DEFAULTS.MAX_CAPACITY);

    const [selectedScenarioIds, setSelectedScenarioIds] = React.useState([]);
    const selectAllCheckboxRef = useRef(null);
    const [editingScenario, setEditingScenario] = React.useState(null);

    // State for Component Selection Modal
    const [componentSelectorModalOpen, setComponentSelectorModalOpen] = React.useState(false);
    const [componentSelectorCallback, setComponentSelectorCallback] = React.useState(null); // Not used directly, just logic flow

    useEffect(() => {
        if (selectAllCheckboxRef.current) {
            const numSelected = selectedScenarioIds.length;
            const numScenarios = scenarios.length;
            selectAllCheckboxRef.current.checked = numSelected === numScenarios && numScenarios > 0;
            selectAllCheckboxRef.current.indeterminate = numSelected > 0 && numSelected < numScenarios;
        }
    }, [selectedScenarioIds, scenarios]);

    const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    
    const handleScenarioSelectionChange = (id) => {
        setSelectedScenarioIds(prev =>
            prev.includes(id) ? prev.filter(scenarioId => scenarioId !== id) : [...prev, id]
        );
    };

    const handleSelectAllChange = (e) => {
        if (e.target.checked) {
            setSelectedScenarioIds(scenarios.map(s => s.id));
        } else {
            setSelectedScenarioIds([]);
        }
    };
    
    const handleDeleteSelected = () => {
        setScenarios(prev => prev.filter(s => !selectedScenarioIds.includes(s.id)));
        setSelectedScenarioIds([]);
    };

    const handleImportData = (data, config) => {
        // 1. Create Products with Extracted Price Matrices
        const newProducts = data.headers.map((name, index) => {
             const extractedMatrix = data.priceMatrices[index] || {};
             const finalMatrix = { ...labirintarPriceMatrix, ...extractedMatrix };
             
             let type = 'component';
             let startSlot = 13;
             let endSlot = 18;
             let maxPerDay = null;

             if (data.type === 'window') {
                 type = 'window';
                 const lowerName = name.toLowerCase();
                 const timePattern = /(?:das\s*)?(\d{1,2})(?:h|:00)?\s*(?:-|à|a|as|às)\s*(\d{1,2})(?:h|:00)?/i;
                 const match = lowerName.match(timePattern);
                 if (match) {
                     startSlot = parseInt(match[1], 10);
                     endSlot = parseInt(match[2], 10);
                 } else {
                     if (lowerName.includes('manhã') || lowerName.includes('8h')) { startSlot = 8; endSlot = 13; }
                     else if (lowerName.includes('10h')) { startSlot = 10; endSlot = 13; }
                 }
             } else {
                 // Component Type
                 maxPerDay = config.maxSlotsPerDay || 1;
                 // Default start for components if not window based
                 startSlot = 13;
                 endSlot = 18;
             }
             
             return {
                id: `custom-${Date.now()}-${index}`,
                name: name,
                type: type,
                startSlot: startSlot, 
                endSlot: endSlot,
                maxPerDay: maxPerDay,
                priceMatrix: finalMatrix 
            };
        });

        setCustomSchools(prev => ({
            ...prev,
            [selectedSchool]: [...(prev[selectedSchool] || []), ...newProducts]
        }));
        
        const newScenarios = [];
        const DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
        const TIME_SLOTS = Array.from({ length: 11 }, (_, i) => `${(8 + i).toString().padStart(2, '0')}:00`);

        // GLOBAL SCHEDULE TRACKER for Smart Binning and Load Balancing
        const globalSlotTracker = {};
        DAYS.forEach(d => {
            globalSlotTracker[d] = {};
            for(let h = 8; h <= 18; h++) {
                globalSlotTracker[d][h] = 0;
            }
        });

        data.matrix.forEach(row => {
            const freq = row.frequency;
            row.counts.forEach((count, colIndex) => {
                if (count > 0) {
                    const product = newProducts[colIndex];
                    const unitPrice = product.priceMatrix[freq] || 0;
                    
                    const currentMaxCapacity = config.maxCapacity || maxCapacity;
                    const currentMinCapacity = config.minCapacity || minCapacity;
                    const currentSpecialistBudget = config.specialistBudgetPerDay !== undefined ? config.specialistBudgetPerDay : 1;
                    
                    const numCoortes = Math.max(1, Math.ceil(count / currentMaxCapacity));
                    const totalTurmasCount = numCoortes;
                    const turmasEspecDia = numCoortes * currentSpecialistBudget;
                    const totalSpecialistTurmasPerWeek = turmasEspecDia * freq;
                    const alunosPorTurmaEspec = turmasEspecDia > 0 ? count / turmasEspecDia : 0;

                    let generatedSchedule = {};
                    let selectedCompIds = [];
                    
                    if (currentSpecialistBudget > 0 || count > 0) {
                        let compatible = [];
                        if (importSelectedComponents.length > 0) {
                            compatible = allComponents.filter(c => importSelectedComponents.includes(c.id));
                        } else {
                            const ageRange = product.name.toLowerCase().includes('infantil') ? {min:0, max:5} : {min:6, max:14};
                            compatible = allComponents.filter(c => c.id !== OCIO_VIVO_ID && rangesOverlap(parseAgeRange(c.ficha.idades), ageRange));
                        }
                        
                        const componentsToUse = compatible.map(c => c.id);
                        if (componentsToUse.length > 0) {
                             selectedCompIds = componentsToUse.slice(0, Math.max(componentsToUse.length, currentSpecialistBudget));
                        } else {
                             selectedCompIds = [];
                        }

                        const visibleTimeSlots = TIME_SLOTS.filter(slot => {
                            const slotHour = parseInt(slot.split(':')[0], 10);
                            return slotHour >= product.startSlot && slotHour < product.endSlot;
                        });
                        
                        const activeDays = DAYS.slice(0, freq);

                        // Create Cohorts
                        const cohorts = [];
                        const baseSize = Math.floor(count / numCoortes);
                        let remainder = count % numCoortes;
                        for (let i = 0; i < numCoortes; i++) {
                            cohorts.push({ id: `C-${String.fromCharCode(65 + i)}`, size: baseSize + (remainder > 0 ? 1 : 0) });
                            if (remainder > 0) remainder--;
                        }
                        
                        let globalComponentIndex = 0;

                        activeDays.forEach((day) => {
                            generatedSchedule[day] = {};
                            
                            const dailyComponents = [];
                            if (currentSpecialistBudget > 0 && selectedCompIds.length > 0) {
                                for(let k=0; k < currentSpecialistBudget; k++) {
                                    dailyComponents.push(selectedCompIds[globalComponentIndex % selectedCompIds.length]);
                                    globalComponentIndex++;
                                }
                            }

                            const cohortSpecialistSlots = new Map(); 

                            cohorts.forEach((cohort, cIdx) => {
                                const targetSlotIndices = [];
                                if (currentSpecialistBudget > 0) {
                                    const getHour = (idx) => product.startSlot + idx;
                                    let availableIndices = visibleTimeSlots.map((_, i) => i);
                                    
                                    for(let k=0; k < currentSpecialistBudget; k++) {
                                         let chosenIndex = -1;
                                         for (let idx of availableIndices) {
                                             const h = getHour(idx);
                                             const currentTotal = globalSlotTracker[day][h];
                                             const spaceInLastClass = currentMaxCapacity - (currentTotal % currentMaxCapacity);
                                             const isPartiallyFull = (currentTotal % currentMaxCapacity) !== 0;
                                             if (isPartiallyFull && cohort.size <= spaceInLastClass) {
                                                 chosenIndex = idx;
                                                 break;
                                             }
                                         }
                                         if (chosenIndex === -1) {
                                             availableIndices.sort((a, b) => {
                                                 return globalSlotTracker[day][getHour(a)] - globalSlotTracker[day][getHour(b)];
                                             });
                                             chosenIndex = availableIndices[0];
                                         }
                                         if (chosenIndex !== -1) {
                                             targetSlotIndices.push(chosenIndex);
                                             globalSlotTracker[day][getHour(chosenIndex)] += cohort.size;
                                             availableIndices = availableIndices.filter(i => i !== chosenIndex);
                                         }
                                    }
                                }
                                cohortSpecialistSlots.set(cIdx, targetSlotIndices);
                            });

                            visibleTimeSlots.forEach((slot, sIdx) => {
                                const assignments = [];
                                cohorts.forEach((cohort, cIdx) => {
                                    const specialistSlotIndices = cohortSpecialistSlots.get(cIdx) || [];
                                    let assignedComponentId = null;
                                    const specIndexOrder = specialistSlotIndices.indexOf(sIdx);
                                    
                                    if (specIndexOrder !== -1 && dailyComponents.length > 0) {
                                        assignedComponentId = dailyComponents[(cIdx + specIndexOrder) % dailyComponents.length];
                                    } else if (product.type === 'window') { // Only assign Quintal Vivo for windows
                                        assignedComponentId = OCIO_VIVO_ID;
                                    }

                                    if (assignedComponentId) {
                                        const component = allComponents.find(c => c.id === assignedComponentId);
                                        const prefix = component ? component.name.substring(0, 4).toUpperCase() : 'TURM';
                                        const cohortLetter = cohort.id.split('-')[1];
                                        
                                        assignments.push({
                                            componentId: assignedComponentId,
                                            studentCount: cohort.size,
                                            turmaId: `${prefix}-${cohortLetter}`,
                                            pairId: null
                                        });
                                    }
                                });
                                if (assignments.length > 0) {
                                     generatedSchedule[day][slot] = assignments;
                                }
                            });
                        });
                    }
                    
                    newScenarios.push({
                        id: `import-${Date.now()}-${colIndex}-${freq}`,
                        school: selectedSchool,
                        productName: product.name,
                        productId: product.id,
                        frequency: freq,
                        schedule: generatedSchedule,
                        unitPrice: unitPrice,
                        avgStudents: count,
                        turmas: totalTurmasCount,
                        minCapacity: currentMinCapacity,
                        maxCapacity: currentMaxCapacity,
                        specialistBudgetPerDay: currentSpecialistBudget,
                        selectedComponentIds: selectedCompIds,
                        memorial: `Importado (${data.type === 'window' ? 'Janela' : 'Avulso'}): ${currentSpecialistBudget} esp/dia.`,
                        operationMode: 'Total',
                        turmasEspecDia: turmasEspecDia,
                        alunosPorTurmaEspec: alunosPorTurmaEspec,
                        totalSpecialistTurmasPerWeek: totalSpecialistTurmasPerWeek
                    });
                }
            });
        });

        setScenarios(prev => [...prev, ...newScenarios]);
    };

    const EditIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
          <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
          <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25-1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
        </svg>
    );
    
    const TrashIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
        </svg>
    );

    return (
        <div className="my-2">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-8">
                    <h2 className="text-xl font-bold text-[#5c3a21]">Jam Session Studio</h2>
                    <p className="text-[#8c6d59] max-w-3xl mx-auto">
                        Configure a escola, os produtos e a demanda de alunos. Importe previsões de demanda para gerar cenários automaticamente.
                    </p>
                </div>
                
                <div className="space-y-8 border-b border-[#bf917f] pb-8 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                        <div className="w-full">
                            <h3 className="text-lg font-medium text-[#5c3a21] mb-2">1. Selecione a Escola</h3>
                            {isCreatingSchool ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={newSchoolName}
                                        onChange={(e) => setNewSchoolName(e.target.value)}
                                        placeholder="Nome da Nova Escola"
                                        className="flex-1 rounded-md border-[#bf917f] bg-white text-[#5c3a21] shadow-sm focus:border-[#ff595a] focus:ring-1 focus:ring-[#ff595a] px-3 py-2"
                                        autoFocus
                                    />
                                    <button onClick={handleCreateSchoolSave} className="p-2 bg-[#ff595a] text-white rounded-md hover:bg-red-600 focus:outline-none" title="Salvar">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" /></svg>
                                    </button>
                                    <button onClick={handleCreateSchoolCancel} className="p-2 bg-gray-200 text-gray-600 rounded-md hover:bg-gray-300 focus:outline-none" title="Cancelar">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" /></svg>
                                    </button>
                                </div>
                            ) : (
                                <div className="relative" ref={schoolDropdownRef}>
                                   <button 
                                       type="button"
                                       onClick={() => setIsSchoolDropdownOpen(!isSchoolDropdownOpen)}
                                       className="w-full rounded-md border-[#bf917f] bg-white text-[#5c3a21] shadow-sm focus:border-[#ff595a] focus:ring-1 focus:ring-[#ff595a] px-3 py-2 text-left flex justify-between items-center"
                                   >
                                       <span className="truncate font-medium">{selectedSchool || 'Selecione...'}</span>
                                       <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="none" stroke="currentColor"><path d="M7 7l3-3 3 3m0 6l-3 3-3-3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                   </button>
                            
                                   {isSchoolDropdownOpen && (
                                       <div className="absolute z-50 mt-1 w-full rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none max-h-60 overflow-auto border border-[#bf917f]">
                                           <ul className="py-1 text-sm text-[#5c3a21]">
                                               {Object.keys(allSchoolsData).map((school) => (
                                                   <li 
                                                       key={school} 
                                                       className={`flex row hover:bg-[#ffe9c9] ${selectedSchool === school ? 'bg-[#f4f0e8] font-semibold' : ''}`}
                                                   >
                                                       <button 
                                                           type="button"
                                                           className="flex-1 text-left py-2 pl-3 pr-2 cursor-pointer overflow-hidden truncate focus:outline-none"
                                                           onClick={() => { setSelectedSchool(school); setIsSchoolDropdownOpen(false); }}
                                                       >
                                                           {school}
                                                       </button>
                                                       <button 
                                                            type="button"
                                                            className="p-2 cursor-pointer text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors border-l border-transparent hover:border-[#e0cbb2] focus:outline-none z-20"
                                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteSchool(school); }}
                                                            title="Excluir escola"
                                                            aria-label={`Excluir escola ${school}`}
                                                        >
                                                            <TrashIcon /> 
                                                        </button>
                                                   </li>
                                               ))}
                                               <div className="border-t border-gray-100 my-1"></div>
                                               <li 
                                                   className="relative cursor-pointer select-none py-2 pl-3 pr-9 text-[#ff595a] font-bold hover:bg-[#f4f0e8]"
                                                   onClick={() => {
                                                       setIsCreatingSchool(true);
                                                       setNewSchoolName("");
                                                       setIsSchoolDropdownOpen(false);
                                                   }}
                                               >
                                                   + Nova Escola...
                                               </li>
                                           </ul>
                                       </div>
                                   )}
                               </div>
                            )}
                        </div>
                        
                         <FormControl label={
                             <h3 className="text-lg font-medium text-[#5c3a21] mb-2 flex items-center justify-start md:justify-end gap-2">
                                 2. Modo de Previsão
                                 <InfoTooltip text="Determinístico: Cenário de demanda único e fixo. Probabilístico: Simulação de Monte Carlo para gerar múltiplos cenários com base na incerteza da demanda." />
                             </h3>
                         }>
                             <div className="flex items-center justify-start md:justify-end space-x-3 bg-white p-2 rounded-lg">
                                <span className={`font-semibold text-sm transition-colors ${mode === 'deterministico' ? 'text-[#ff595a]' : 'text-[#8c6d59]'}`}>
                                    Determinística
                                </span>
                                <Toggle
                                    enabled={mode === 'estocastico'}
                                    onChange={(enabled) => setMode(enabled ? 'estocastico' : 'deterministico')}
                                />
                                <span className={`font-semibold text-sm transition-colors ${mode === 'estocastico' ? 'text-[#ff595a]' : 'text-[#8c6d59]'}`}>
                                    Probabilística
                                </span>
                            </div>
                         </FormControl>
                    </div>
                </div>

                <div style={{ display: mode === 'deterministico' ? 'block' : 'none' }}>
                    <div className="flex justify-end mb-4">
                        <button onClick={() => { setImportSelectedComponents([]); setIsImportModalOpen(true); }} className="text-sm bg-[#f4f0e8] border border-[#bf917f] text-[#5c3a21] font-bold py-2 px-4 rounded-lg hover:bg-[#ffe9c9] transition-colors flex items-center gap-2 shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                <path fillRule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
                            </svg>
                            Importar Demanda (Control + V)
                        </button>
                    </div>
                  <DeterministicScenarioGenerator 
                    selectedSchool={selectedSchool} 
                    availableProducts={availableProducts}
                    scenarios={scenarios}
                    setScenarios={setScenarios}
                    editingScenario={editingScenario}
                    setEditingScenario={setEditingScenario}
                    minCapacity={minCapacity}
                    setMinCapacity={setMinCapacity}
                    resetMinCapacity={resetMinCapacity}
                    minCapacityDefault={JAM_SESSION_DEFAULTS.MIN_CAPACITY}
                    maxCapacity={maxCapacity}
                    setMaxCapacity={setMaxCapacity}
                    resetMaxCapacity={resetMaxCapacity}
                    maxCapacityDefault={JAM_SESSION_DEFAULTS.MAX_CAPACITY}
                    componentSelectorModalOpen={componentSelectorModalOpen}
                    setComponentSelectorModalOpen={setComponentSelectorModalOpen}
                    setComponentSelectorCallback={setComponentSelectorCallback}
                    importSelectedComponents={importSelectedComponents}
                    setImportSelectedComponents={setImportSelectedComponents}
                    setIsComponentSelectorOpen={setIsComponentSelectorOpen}
                    customMaxComponents={componentSelectorModalOpen ? importRequiredSpecialties : null}
                  />
                </div>
                
                <div style={{ display: mode === 'estocastico' ? 'block' : 'none' }}>
                    <StochasticScenarioGenerator 
                        selectedSchool={selectedSchool}
                        availableProducts={availableProducts}
                        scenarios={scenarios}
                        setScenarios={setScenarios}
                        minCapacity={minCapacity}
                        maxCapacity={maxCapacity}
                    />
                </div>
                
                {scenarios.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-[#bf917f]">
                         <div className="max-w-6xl mx-auto flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-[#5c3a21]">Cenários de Demanda Salvos</h3>
                            <button
                                onClick={handleDeleteSelected}
                                disabled={selectedScenarioIds.length === 0}
                                className="text-sm font-medium text-[#ff595a] hover:underline disabled:text-gray-400 disabled:no-underline transition-colors"
                                aria-label={`Excluir ${selectedScenarioIds.length} cenários selecionados`}
                            >
                                Excluir Selecionados ({selectedScenarioIds.length})
                            </button>
                        </div>
                        <div className="max-w-6xl mx-auto bg-[#f4f0e8] p-4 rounded-xl border border-[#bf917f]">
                           <div className="grid grid-cols-[30px_1fr_50px_60px_60px_70px_80px_90px_auto] gap-x-2 items-center font-bold text-sm text-[#8c6d59] border-b border-[#bf917f] pb-2 mb-2 px-2">
                               <input
                                    type="checkbox"
                                    ref={selectAllCheckboxRef}
                                    onChange={handleSelectAllChange}
                                    className="h-4 w-4 rounded border-gray-400 text-[#ff595a] focus:ring-[#ff595a] accent-[#ff595a]"
                                    aria-label="Selecionar todos os cenários"
                                />
                               <div className="text-left">Escola</div>
                               <div className="text-center">Freq.</div>
                               <div className="text-center">Alunos</div>
                               <div className="text-center">Turmas</div>
                               <div className="text-center">Espec./Dia</div>
                               <div className="text-right">Preço</div>
                               <div className="text-right">Receita</div>
                               <div className="w-8"></div>
                           </div>
                           <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                {scenarios.map(s => (
                                    <div key={s.id} className="flex flex-col bg-white rounded-md border border-transparent hover:border-[#e0cbb2] mb-2 shadow-sm overflow-hidden transition-colors">
                                        {/* Row 1: Product Name */}
                                        <div className="w-full px-3 py-2 border-b border-gray-100 bg-gray-50 flex justify-between items-start">
                                             <p className="text-sm font-bold text-[#5c3a21] whitespace-normal break-words">{s.productName}</p>
                                             <div className="flex items-center gap-2 ml-2">
                                                 {s.memorial && (
                                                    <InfoTooltip text={s.memorial} />
                                                )}
                                            </div>
                                        </div>

                                        {/* Row 2: Data Grid */}
                                        <div className="grid grid-cols-[30px_1fr_50px_60px_60px_70px_80px_90px_auto] gap-x-2 items-start py-2 px-2 text-sm">
                                            <input
                                                type="checkbox"
                                                checked={selectedScenarioIds.includes(s.id)}
                                                onChange={() => handleScenarioSelectionChange(s.id)}
                                                className="h-4 w-4 mt-1 rounded border-gray-300 text-[#ff595a] focus:ring-[#ff595a] accent-[#ff595a]"
                                                aria-label={`Selecionar cenário ${s.productName}`}
                                            />
                                            <div className="font-semibold text-[#5c3a21] self-center truncate">{s.school}</div>
                                            <div className="text-center font-medium text-[#5c3a21] self-center">{s.frequency}x</div>
                                            <div className="text-center font-medium text-[#5c3a21] self-center">{s.avgStudents}</div>
                                            <div className="text-center font-medium text-[#5c3a21] self-center">{s.turmas || '-'}</div>
                                            <div className="text-center font-medium text-[#5c3a21] self-center">{s.specialistBudgetPerDay}</div>
                                            <div className="text-right font-medium text-[#5c3a21] self-center">{formatCurrency(s.unitPrice)}</div>
                                            <div className="text-right font-medium text-[#5c3a21] self-center">{formatCurrency(s.unitPrice * s.avgStudents)}</div>
                                            <div className="flex justify-end items-center">
                                                 <button 
                                                    onClick={() => {
                                                        if (mode !== 'deterministico') {
                                                            setMode('deterministico');
                                                        }
                                                        setSelectedSchool(s.school);
                                                        setEditingScenario(s);
                                                    }}
                                                    className="p-1 text-[#8c6d59] hover:text-[#5c3a21] rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff595a]" 
                                                    aria-label={`Editar cenário ${s.productName}`}>
                                                    <EditIcon />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                           </div>
                        </div>
                    </div>
                )}

                <DataImporterModal 
                    isOpen={isImportModalOpen} 
                    onClose={() => setIsImportModalOpen(false)} 
                    onImport={handleImportData}
                    schoolName={selectedSchool}
                    onOpenComponentSelector={(maxFreqFromModal) => {
                        setIsComponentSelectorOpen(true);
                    }}
                    selectedComponentCount={importSelectedComponents.length}
                    importSpecialistBudget={importSpecialistBudget}
                    setImportSpecialistBudget={setImportSpecialistBudget}
                    setImportRequiredSpecialties={setImportRequiredSpecialties}
                />
                
                <DeterministicScenarioGenerator 
                    selectedSchool={selectedSchool} 
                    availableProducts={availableProducts}
                    scenarios={scenarios}
                    setScenarios={setScenarios}
                    editingScenario={editingScenario}
                    setEditingScenario={setEditingScenario}
                    minCapacity={minCapacity}
                    setMinCapacity={setMinCapacity}
                    resetMinCapacity={resetMinCapacity}
                    minCapacityDefault={JAM_SESSION_DEFAULTS.MIN_CAPACITY}
                    maxCapacity={maxCapacity}
                    setMaxCapacity={setMaxCapacity}
                    resetMaxCapacity={resetMaxCapacity}
                    maxCapacityDefault={JAM_SESSION_DEFAULTS.MAX_CAPACITY}
                    // Passing props for the standalone Component Selector Modal (used by Import)
                    componentSelectorModalOpen={isComponentSelectorOpen}
                    setComponentSelectorModalOpen={setIsComponentSelectorOpen}
                    importSelectedComponents={importSelectedComponents}
                    setImportSelectedComponents={setImportSelectedComponents}
                    renderOnlyModal={true} // New prop to render ONLY the modal if active
                    setComponentSelectorCallback={setComponentSelectorCallback}
                    setIsComponentSelectorOpen={setIsComponentSelectorOpen}
                    customMaxComponents={importRequiredSpecialties}
                />
            </div>
        </div>
    );
};
