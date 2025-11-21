
import React from "react";
import { TaxRegime } from '../types.tsx';
import { cnaes } from '../data/simplesNacional.tsx';
import { calculateTax } from '../services/taxCalculator.tsx';
import { FormControl } from './FormControl.tsx';
import { NumberInput } from './NumberInput.tsx';
import { Select } from './Select.tsx';
import { generateReportHtml } from './ExportToSheets.tsx';
import { Toggle } from './Toggle.tsx';
import { InfoTooltip } from './InfoTooltip.tsx';
import { usePersistentState } from "../App.tsx";
import { DEFAULTS } from '../App.tsx';
import { fixedCostsData } from '../data/fixedCosts.ts';
import { Slider } from './Slider.tsx';
import { allComponents } from '../data/jamSessionData.tsx';
import { labirintarPriceMatrix } from "../data/tabelasDePreco.ts";

const WEEKS_PER_MONTH = 4.3452381;
const OCIO_VIVO_ID = 'c27';

const OP_SIM_DEFAULTS = {
    COSTO_MENSAL_SLOT: 150, 
    COSTO_NEXIALISTA: 2001,
};

const ECO_DEFAULTS = {
    LABIRINTAR_STATE: {
        percentage: 20,
        operationalCosts: 40000,
        regime: TaxRegime.LUCRO_REAL,
        cnaeCode: '62.02-3/00',
        pat: false,
        variableCostPercentage: 40,
    },
    EDUCATOR_STATE: {
        percentage: 35,
        materialCosts: 500,
        regime: TaxRegime.SIMPLES_NACIONAL,
        cnaeCode: '85.50-3/02',
        rbt12: 40000,
        presuncao: 32,
        pat: false,
    },
    PROVEDOR_STATE: {
        percentage: 10,
        operationalCosts: 1000,
        regime: TaxRegime.LUCRO_PRESUMIDO,
        cnaeCode: '74.90-1/04',
        presuncao: 32,
        pat: false,
    },
};

// Hash function to generate colors from strings
const stringToColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
};

// Helper functions
const formatCurrency = (value) => {
    if (typeof value !== 'number' || isNaN(value)) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const formatCurrencyWithoutSymbol = (value) => {
    if (typeof value !== 'number' || isNaN(value)) return '0,00';
    return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
};

const formatPercent = (value) => {
    if (isNaN(value) || !isFinite(value) || value === null) return '-';
    return `${(value * 100).toFixed(1).replace('.', ',')}%`;
};

// Sub-components
const ScenarioCard = ({ title, subtitle, children, className = "" }: any) => (
    <div className={`bg-[#f3f0e8] p-6 rounded-2xl shadow-lg border border-[#e0cbb2] ${className}`}>
        <h3 className="text-xl font-bold text-[#5c3a21]">{title}</h3>
        {subtitle && <p className="text-sm text-[#8c6d59] mb-6">{subtitle}</p>}
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

const TabButton = ({ label, isActive, onClick }: any) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors border-t border-l border-r ${
            isActive 
            ? 'bg-[#f3f0e8] text-[#5c3a21] border-[#e0cbb2] -mb-px z-10' 
            : 'bg-white text-[#8c6d59] border-transparent hover:bg-gray-50'
        }`}
    >
        {label}
    </button>
);

const DREDisplay = ({ dre, bep, unitEconomics, remuneracaoHorariaLiquida, totalMonthlyHours }: any) => {
    const { useState } = React;
    const [showReceitaBrutaDetails, setShowReceitaBrutaDetails] = useState(false);
    const [showImpostosReceitaDetails, setShowImpostosReceitaDetails] = useState(true); 
    const [showResultadoDetails, setShowResultadoDetails] = useState(false);
    const [showVariaveisDetails, setShowVariaveisDetails] = useState(true); 
    const [showFixosDetails, setShowFixosDetails] = useState(true);

    const formatValue = (value) => formatCurrencyWithoutSymbol(value);
    const formatNumber = (value) => new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

    const resultadoColorClass = dre.resultadoLiquido >= 0 ? 'text-green-600' : 'text-red-600';
    
    const ChevronDownIcon = ({ className = "w-4 h-4" }) => (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
      </svg>
    );
    
    const renderDetails = (details) => {
        if (!details || details.length === 0) return null;
        return (
            <div className="pl-4 mt-1 space-y-2 text-xs py-2">
                {details.map((item, idx) => {
                    if (item.value === 0) return null;

                    // Handle Grouping (Level 2 Hierarchy: Item -> Schools)
                    if (item.isGroup && item.subDetails) {
                        return (
                            <details key={`${item.name}-${idx}`} className="group mb-2 border-l-2 border-[#bf917f] pl-2">
                                <summary className="flex justify-between items-center cursor-pointer list-none hover:bg-[#e0cbb2]/20 p-1 rounded select-none transition-colors">
                                    <div className="flex items-center gap-1">
                                        <span className="font-bold text-[#5c3a21]">{item.name}</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-[#8c6d59] transform group-open:rotate-180 transition-transform">
                                            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 01.02-1.06z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <span className="font-mono text-[#5c3a21] font-bold">{formatValue(item.value)}</span>
                                </summary>
                                <div className="pl-3 mt-1 space-y-1 border-l border-dashed border-[#bf917f]/30">
                                    {item.subDetails.map((sub, subIdx) => (
                                        <div key={`sub-${subIdx}`} className="flex justify-between items-start py-0.5">
                                            <span className="text-[#8c6d59]">{sub.name} {sub.rate ? `(${sub.rate})` : ''}</span>
                                            <span className="font-mono text-[#5c3a21]">{formatValue(sub.value)}</span>
                                        </div>
                                    ))}
                                </div>
                            </details>
                        );
                    }

                    // Standard Item (Level 1)
                    return (
                        <div key={`${item.name}-${idx}`} className="flex justify-between items-start border-b border-dotted border-gray-200 pb-1 last:border-0">
                            <div>
                                <p className="text-[#8c6d59] font-medium">{item.name} {item.rate ? `(${item.rate})` : ''}</p>
                                {item.details && <p className="text-[#8c6d59]/80 text-[10px] leading-tight max-w-[200px]">{item.details}</p>}
                            </div>
                            <strong className="font-mono text-right text-[#5c3a21] flex-shrink-0 pl-2">{formatValue(item.value)}</strong>
                        </div>
                    )
                })}
            </div>
        );
    };

    const DRELine = ({ label, value, percent, isSubtotal = false, isFinal = false, customColorClass = "" }: any) => (
        <div className={`grid grid-cols-[minmax(0,1fr)_auto_90px] sm:grid-cols-[minmax(0,1fr)_60px_110px] gap-x-1 sm:gap-x-2 items-baseline text-sm ${isSubtotal ? 'font-semibold' : ''} ${isFinal ? 'font-bold text-base' : ''}`}>
            <span className="truncate">{label}</span>
            <span className="font-mono text-xs text-right text-[#8c6d59]">{percent}</span>
            <strong className={`${customColorClass || (isFinal ? resultadoColorClass : 'text-[#5c3a21]')} font-mono text-right truncate`}>{formatValue(value)}</strong>
        </div>
    );
    
    const CollapsibleDRELine = ({ label, value, percent, details, isVisible, onToggle, showDetailsContent }: any) => (
        <div className="text-sm">
            <div className="grid grid-cols-[minmax(0,1fr)_auto_90px] sm:grid-cols-[minmax(0,1fr)_60px_110px] gap-x-1 sm:gap-x-2 items-center">
                <button onClick={onToggle} className="flex items-center gap-2 text-left p-1 -ml-1 rounded-md hover:bg-[#e0cbb2]/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff595a] min-w-0" aria-expanded={isVisible}>
                    <span className="truncate">{label}</span>
                    {details && details.length > 0 && <ChevronDownIcon className={`w-3.5 h-3.5 text-[#8c6d59] transition-transform duration-200 ${isVisible ? 'rotate-180' : ''}`} />}
                </button>
                <span className="font-mono text-xs text-right text-[#8c6d59]">{percent}</span>
                <strong className="font-mono text-right text-[#5c3a21] truncate">{formatValue(value)}</strong>
            </div>
            {isVisible && showDetailsContent}
        </div>
    );


    return (
        <div className="mt-6 space-y-2">
            <h4 className="grid grid-cols-[minmax(0,1fr)_auto_90px] sm:grid-cols-[minmax(0,1fr)_60px_110px] gap-x-1 sm:gap-x-2 font-semibold text-sm uppercase tracking-wider text-[#8c6d59] border-b border-[#e0cbb2] pb-2 mb-4">
                <span className="text-left truncate">Estrutura de Resultado</span>
                <span className="text-right">AV %</span>
                <span className="text-right">Valor</span>
            </h4>
            
            <CollapsibleDRELine 
                label="Receita Bruta" 
                value={dre.receitaBruta} 
                percent={formatPercent(1)} 
                details={dre.receitaBrutaDetails}
                isVisible={showReceitaBrutaDetails}
                onToggle={() => setShowReceitaBrutaDetails(!showReceitaBrutaDetails)}
                showDetailsContent={renderDetails(dre.receitaBrutaDetails)}
            />
            <CollapsibleDRELine 
                label="(-) Impostos s/ Receita" 
                value={-dre.impostosSobreReceita} 
                percent={formatPercent(dre.receitaBruta > 0 ? -dre.impostosSobreReceita / dre.receitaBruta : 0)} 
                details={dre.impostosSobreReceitaDetails} 
                isVisible={showImpostosReceitaDetails} 
                onToggle={() => setShowImpostosReceitaDetails(!showImpostosReceitaDetails)} 
                showDetailsContent={renderDetails(dre.impostosSobreReceitaDetails)} 
            />
            <DRELine label="(=) Receita Líquida" value={dre.receitaLiquida} percent={formatPercent(dre.receitaBruta > 0 ? dre.receitaLiquida / dre.receitaBruta : 0)} isSubtotal={true} />
            
            <div className="pt-2 mt-2 border-t border-dashed border-[#e0cbb2]">
                <CollapsibleDRELine label="(-) Custos Variáveis" value={-dre.custosVariaveis} percent={formatPercent(dre.receitaBruta > 0 ? -dre.custosVariaveis / dre.receitaBruta : 0)} details={dre.custosVariaveisDetails} isVisible={showVariaveisDetails} onToggle={() => setShowVariaveisDetails(!showVariaveisDetails)} showDetailsContent={renderDetails(dre.custosVariaveisDetails)} />
                <div className="grid grid-cols-[minmax(0,1fr)_auto_90px] sm:grid-cols-[minmax(0,1fr)_60px_110px] gap-x-1 sm:gap-x-2 items-baseline text-sm font-semibold mt-2">
                    <span className="truncate">(=) Margem de Contribuição</span>
                    <span className="font-mono text-xs text-right text-[#8c6d59]">{formatPercent(dre.margemContribuicaoPercent)}</span>
                    <strong className="font-mono text-right text-[#5c3a21] truncate">{formatValue(dre.margemContribuicao)}</strong>
                </div>
            </div>

            <div className="pt-2 mt-2 border-t border-dashed border-[#e0cbb2]">
                <CollapsibleDRELine label="(-) Custos Fixos" value={-dre.custosFixos} percent={formatPercent(dre.receitaBruta > 0 ? -dre.custosFixos / dre.receitaBruta : 0)} details={dre.custosFixosDetails} isVisible={showFixosDetails} onToggle={() => setShowFixosDetails(!showFixosDetails)} showDetailsContent={renderDetails(dre.custosFixosDetails)} />
                <DRELine label="(=) EBIT" value={dre.ebit} percent={formatPercent(dre.receitaBruta > 0 ? dre.ebit / dre.receitaBruta : 0)} isSubtotal={true} />
            </div>

            <div className="pt-2 mt-2 border-t border-dashed border-[#e0cbb2]">
                <CollapsibleDRELine label="(-) Impostos s/ Resultado" value={-dre.impostosSobreResultado} percent={formatPercent(dre.receitaBruta > 0 ? -dre.impostosSobreResultado / dre.receitaBruta : 0)} details={dre.impostosSobreResultadoDetails} isVisible={showResultadoDetails} onToggle={() => setShowResultadoDetails(!showResultadoDetails)} showDetailsContent={renderDetails(dre.impostosSobreResultadoDetails)} />
            </div>

            <hr className="border-t border-[#e0cbb2] my-2" />
            <DRELine label="(=) Resultado Líquido" value={dre.resultadoLiquido} percent={formatPercent(dre.receitaBruta > 0 ? dre.resultadoLiquido / dre.receitaBruta : 0)} isFinal={true} customColorClass={resultadoColorClass} />

            {bep && (
                <div className="pt-2 mt-2 border-t border-dashed border-[#e0cbb2]">
                    <p className="flex items-center justify-center text-xs font-bold uppercase text-[#8c6d59] tracking-wider mb-2 text-center gap-1">Ponto de Equilíbrio <InfoTooltip text="O Ponto de Equilíbrio indica o mínimo de matrículas ou receita necessários para cobrir todos os custos (fixos e variáveis) e não ter prejuízo. É calculado como: Custos Fixos / Margem de Contribuição por Matrícula." /></p>
                    <div className="text-xs text-center bg-white p-2 rounded-md border border-[#e0cbb2]">
                        {bep.alunos !== undefined && (<p>Matrículas: <strong className="text-[#5c3a21]">{isFinite(bep.alunos) ? `${formatNumber(bep.alunos)}` : 'N/A'}</strong></p>)}
                        <p>Receita: <strong className="text-[#5c3a21]">{isFinite(bep.receita) ? formatCurrency(bep.receita) : 'N/A'}</strong></p>
                    </div>
                </div>
            )}
            
            {unitEconomics && (
                 <div className="pt-2 mt-2 border-t border-dashed border-[#e0cbb2]">
                    <p className="text-xs font-bold uppercase text-[#8c6d59] tracking-wider mb-2 text-center">Unit Economics</p>
                    <div className="grid grid-cols-[minmax(0,1fr)_auto_90px] sm:grid-cols-[minmax(0,1fr)_60px_110px] gap-x-1 sm:gap-x-2 items-baseline text-sm">
                        <span className="text-[#8c6d59]">MC por Matrícula</span> 
                        <span className="font-mono text-xs text-right text-[#8c6d59]">{formatPercent(dre.margemContribuicaoPercent)}</span>
                        <strong className="text-[#5c3a21] font-mono text-right truncate">{formatCurrency(unitEconomics.mcPorMatricula)}</strong>
                    </div>
                </div>
            )}

            {remuneracaoHorariaLiquida !== undefined && (
                <div className="pt-2 mt-2 border-t border-dashed border-[#e0cbb2]">
                    <p className="flex items-center justify-center text-xs font-bold uppercase text-[#8c6d59] tracking-wider mb-2 text-center gap-1">
                        Remuneração por Hora
                        <InfoTooltip text="Resultado líquido do educador dividido pelo total de horas de aulas especialistas dadas no mês. Representa o ganho efetivo por hora trabalhada." />
                    </p>
                    <div className="grid grid-cols-[minmax(0,1fr)_auto_90px] sm:grid-cols-[minmax(0,1fr)_60px_110px] gap-x-1 sm:gap-x-2 items-baseline text-sm">
                        <span className="truncate">Líquido / Hora</span>
                        <span className="font-mono text-xs text-right text-[#8c6d59]">{totalMonthlyHours > 0 ? `(${totalMonthlyHours.toFixed(0)}h)` : ''}</span>
                        <strong className="text-[#5c3a21] font-mono text-right truncate">{formatCurrency(remuneracaoHorariaLiquida)}</strong>
                    </div>
                </div>
            )}
        </div>
    );
};

const GlobalGridDisplay = ({ globalSchedule, maxCapacity, schoolName }: any) => {
    if (!globalSchedule || Object.keys(globalSchedule).length === 0) return null;

    const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
    const slots = Array.from(new Set(Object.values(globalSchedule).flatMap(day => Object.keys(day as any)))).sort();

    return (
        <div className="mt-6">
             <div className="bg-white p-4 rounded-xl border border-[#bf917f] overflow-x-auto">
                <h3 className="text-lg font-bold text-[#5c3a21] mb-2 flex items-center gap-2">
                    Grade Horária Unificada - {schoolName || 'Todas as Escolas'}
                    <InfoTooltip text="Esta grade mostra o total acumulado de alunos. A 'Otimização' agrupa alunos da MESMA atividade no MESMO horário para economizar especialistas." />
                </h3>
                <table className="w-full text-xs text-left border-collapse">
                    <thead>
                        <tr className="bg-[#f4f0e8]">
                            <th class="p-2 border-r border-gray-200 text-[#8c6d59] w-20 text-center">Horário</th>
                            {days.map(day => <th key={day} className="p-2 border-r border-gray-200 text-center text-[#8c6d59] min-w-[120px]">{day}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {slots.map(slot => (
                            <tr key={slot} className="border-t border-gray-200">
                                <td className="p-2 border-r border-gray-200 font-semibold text-[#8c6d59] text-center">{slot}</td>
                                {days.map(day => {
                                    const data = globalSchedule[day]?.[slot];
                                    if (!data) return <td key={day} className="p-2 border-r border-gray-200"></td>;

                                    const { totalStudents, breakdown, classesNeeded, generalistStudents } = data;
                                    
                                    // Visual indicator logic - Occupancy
                                    const occupancy = totalStudents / (classesNeeded * maxCapacity);
                                    let bgClass = 'bg-white';
                                    if (occupancy >= 1) bgClass = 'bg-red-50'; // Overload or extremely efficient
                                    else if (occupancy >= 0.7) bgClass = 'bg-green-50'; // Efficient
                                    else if (occupancy >= 0.4) bgClass = 'bg-amber-50'; // Moderate
                                    else bgClass = 'bg-gray-50'; // Inefficient

                                    return (
                                        <td key={day} className={`p-2 border-r border-gray-200 align-top ${bgClass}`}>
                                            <div className="flex flex-col gap-1">
                                                <div className="flex justify-between items-center border-b border-gray-200 pb-1 mb-1">
                                                    <span className="font-bold text-[#5c3a21]">{totalStudents} Alunos</span>
                                                    <span className="text-[10px] text-[#8c6d59] font-mono bg-white/50 px-1 rounded">{classesNeeded} Turma(s)</span>
                                                </div>
                                                
                                                {Object.entries(breakdown).map(([compName, count]) => {
                                                    if (compName === 'Quintal Vivo') return null; // Render separate
                                                    const numCount = count as number;
                                                    const compClasses = Math.ceil(numCount / maxCapacity);
                                                    // Generate consistent color from string
                                                    const color = stringToColor(compName);
                                                    
                                                    return (
                                                        <div key={compName} className="text-[10px] flex justify-between items-center font-semibold" style={{ color: color }}>
                                                            <span className="truncate max-w-[100px]" title={compName}>{compName}</span>
                                                            <span>{numCount} ({compClasses}t)</span>
                                                        </div>
                                                    );
                                                })}

                                                {generalistStudents > 0 && (
                                                    <div className="text-[10px] text-[#1e4620] font-bold mt-1 flex justify-between items-center">
                                                        <span>Quintal Vivo</span>
                                                        <span>{generalistStudents} ({Math.ceil(generalistStudents / maxCapacity)}t)</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const StrategicAnalysis = ({ 
    scenarios, 
    partnershipModel, setPartnershipModel, resetPartnershipModel, partnershipModelDefault,
    simulationYear, 
    variableCosts, setVariableCosts, resetVariableCosts, variableCostsDefault,
    schoolTaxParams, setSchoolTaxParams, resetSchoolTaxParams, schoolTaxParamsDefault,
}: any) => {
    const { useMemo, useEffect, useRef, useState, useCallback } = React;
    
    // --- SHARED STATE ---
    const [selectedScenarioIds, setSelectedScenarioIds] = usePersistentState('sim-analysis-selectedIds', []);
    const selectAllCheckboxRef = useRef(null);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const cnaeOptions = useMemo(() => cnaes.map(c => ({ value: c.cnae, label: `${c.cnae} - ${c.descricao}` })), []);
    const [isReportMenuOpen, setIsReportMenuOpen] = useState(false);
    const reportMenuRef = useRef(null);
    const [activeTab, setActiveTab] = useState('Consolidado');
    
    // --- FAZER/COMPRAR STATE ---
    const [costoMensalPorSlot, setCostoMensalPorSlot, resetCostoMensalPorSlot] = usePersistentState('sim-op-costoMensalPorSlot', OP_SIM_DEFAULTS.COSTO_MENSAL_SLOT);
    const [costoNexialista, setCostoNexialista, resetCostoNexialista] = usePersistentState('sim-op-costoNexialista', OP_SIM_DEFAULTS.COSTO_NEXIALISTA);
    const [fazerState, setFazerState] = usePersistentState('sim-op-fazerState', { custoInstrutor: 0, creditGeneratingCosts: 0 });
    const [escolaAssumeCustoNexialista, setEscolaAssumeCustoNexialista, resetEscolaAssumeCustoNexialista] = usePersistentState('sim-op-escolaAssumeCustoNexialista', true);

    // --- OPTIMIZATION STATE ---
    const [globalMaxCapacity, setGlobalMaxCapacity] = usePersistentState('sim-opt-maxCapacity', 12);
    
    // --- OPERATION MODE STATE ---
    const [operationMode, setOperationMode] = usePersistentState('sim-analysis-opMode', 'Total');
    const isParcialMode = operationMode === 'Parcial';

    // --- ECOSYSTEM STATE ---
    const [labirintarState, setLabirintarState, resetLabirintarState] = usePersistentState<any>('sim-eco-labirintarState', ECO_DEFAULTS.LABIRINTAR_STATE);
    const [educatorState, setEducatorState, resetEducatorState] = usePersistentState<any>('sim-eco-educatorState', ECO_DEFAULTS.EDUCATOR_STATE);
    const [provedorState, setProvedorState, resetProvedorState] = usePersistentState<any>('sim-eco-provedorState', ECO_DEFAULTS.PROVEDOR_STATE);
    
    // --- HANDLERS ---
    const handleTaxParamsChange = (field, value) => setSchoolTaxParams(prev => ({ ...prev, [field]: value }));
    const handleFazerChange = (field, value) => setFazerState(prev => ({ ...prev, [field]: value }));
    const handleLabirintarChange = useCallback((field, value) => setLabirintarState(prev => ({...prev, [field]: value})), [setLabirintarState]);
    const handleEducatorChange = useCallback((field, value) => setEducatorState(prev => ({...prev, [field]: value})), [setEducatorState]);
    const handleProvedorChange = useCallback((field, value) => setProvedorState(prev => ({...prev, [field]: value})), [setProvedorState]);
    const handlePartnershipModelChange = (field, value) => {
        setPartnershipModel(prev => ({ ...prev, [field]: value }));
    };
    
    // Close report menu on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (reportMenuRef.current && !reportMenuRef.current.contains(event.target)) {
                setIsReportMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredScenarios = useMemo(() => scenarios.filter(s => selectedScenarioIds.includes(s.id)), [scenarios, selectedScenarioIds]);
    const uniqueSchools = useMemo(() => Array.from(new Set(scenarios.map(s => s.school))), [scenarios]);
    const schoolsInAnalysis = useMemo(() => Array.from(new Set(filteredScenarios.map(s => s.school))), [filteredScenarios]);

    // --- AUTOMATIC CALCULATIONS ---
    useEffect(() => {
        if (provedorState.percentage !== 10) {
            handleProvedorChange('percentage', 10);
        }
    }, [provedorState.percentage, handleProvedorChange]);

    useEffect(() => {
        if (!isParcialMode) {
            const newLabPercentage = Math.max(0, 100 - partnershipModel.schoolPercentage - educatorState.percentage - provedorState.percentage);
            handleLabirintarChange('percentage', parseFloat(newLabPercentage.toFixed(2)));
        } else {
             const newLabPercentage = Math.max(0, 100 - educatorState.percentage - provedorState.percentage);
             handleLabirintarChange('percentage', parseFloat(newLabPercentage.toFixed(2)));
        }
    }, [partnershipModel.schoolPercentage, educatorState.percentage, provedorState.percentage, handleLabirintarChange, isParcialMode]);


    // --- SCENARIO SELECTION LOGIC ---
    useEffect(() => {
        if (scenarios && scenarios.length > 0 && selectedScenarioIds.length === 0) {
            setSelectedScenarioIds(scenarios.map(s => s.id));
        }
    }, [scenarios]);
    
    useEffect(() => {
        if (selectAllCheckboxRef.current) {
            const numSelected = selectedScenarioIds.length;
            const numScenarios = scenarios.length;
            selectAllCheckboxRef.current.checked = numSelected === numScenarios && numScenarios > 0;
            selectAllCheckboxRef.current.indeterminate = numSelected > 0 && numSelected < numScenarios;
        }
    }, [selectedScenarioIds, scenarios]);

    const handleScenarioSelectionChange = (scenarioId) => {
        setSelectedScenarioIds(prev =>
            prev.includes(scenarioId)
                ? prev.filter(id => id !== scenarioId)
                : [...prev, scenarioId]
        );
    };

    const handleSelectAll = () => setSelectedScenarioIds(scenarios.map(s => s.id));
    const handleDeselectAll = () => setSelectedScenarioIds([]);
    const handleSelectBySchool = (school) => setSelectedScenarioIds(scenarios.filter(s => s.school === school).map(s => s.id));
    const handleSelectAllChange = (e) => e.target.checked ? handleSelectAll() : handleDeselectAll();

    const parseFoodCostsFromName = (productName) => {
        const lowerName = productName.toLowerCase();
        if (lowerName.includes("fundamental - b1") || lowerName.includes("fundamental - b2")) return { numLunches: 0, numSnacks: 0 };
        return {
            numLunches: lowerName.includes("+ almoço") ? 1 : 0,
            numSnacks: lowerName.includes("+ 2 lanches") ? 2 : (lowerName.includes("+ 1 lanche") || lowerName.includes("+ 1 lanches")) ? 1 : 0,
        };
    };

    const calculateResultForScenarios = (scenariosSubset, currentParcialMode) => {
        // 1. Optimization Metrics
        let totalRevenue = 0;
        let totalServiceRevenue = 0;
        let totalStandardRevenue = 0;
        let totalStudents = 0;
        let totalIsolatedTurmas = 0;
        let totalIsolatedWeeklyHours = 0;
        const scheduleMap = {}; 

        scenariosSubset.forEach(s => {
            totalRevenue += s.avgStudents * s.unitPrice;
            totalServiceRevenue += costoMensalPorSlot * s.frequency * s.avgStudents; 
            const stdPrice = labirintarPriceMatrix[s.frequency] || 0;
            totalStandardRevenue += stdPrice * s.avgStudents;

            totalStudents += s.avgStudents;
            totalIsolatedTurmas += s.turmas || 0;
            totalIsolatedWeeklyHours += s.totalSpecialistTurmasPerWeek || 0;

            if (s.schedule) {
                Object.entries(s.schedule).forEach(([day, dayData]) => {
                     if (!scheduleMap[day]) scheduleMap[day] = {};
                     Object.entries(dayData).forEach(([slot, turmas]) => {
                         if (!scheduleMap[day][slot]) {
                             scheduleMap[day][slot] = { totalStudents: 0, generalistStudents: 0, breakdown: {} };
                         }
                         if (!Array.isArray(turmas)) return;
                         (turmas as any[]).forEach(t => {
                             const isOcioVivo = t.componentId === OCIO_VIVO_ID;
                             scheduleMap[day][slot].totalStudents += t.studentCount;
                             if (isOcioVivo) {
                                 scheduleMap[day][slot].generalistStudents += t.studentCount;
                                 scheduleMap[day][slot].breakdown['Quintal Vivo'] = (scheduleMap[day][slot].breakdown['Quintal Vivo'] || 0) + t.studentCount;
                             } else {
                                 const component = allComponents.find(c => c.id === t.componentId);
                                 const compName = component ? component.name : t.componentId;
                                 scheduleMap[day][slot].breakdown[compName] = (scheduleMap[day][slot].breakdown[compName] || 0) + t.studentCount;
                             }
                         });
                     });
                });
            }
        });

        let totalOptimizedWeeklyHours = 0;
        const globalSchedule = {};
        Object.keys(scheduleMap).forEach(day => {
            if (!globalSchedule[day]) globalSchedule[day] = {};
            Object.keys(scheduleMap[day]).forEach(slot => {
                const data = scheduleMap[day][slot];
                let specialistClassesForSlot = 0;
                let generalistClassesForSlot = 0;
                Object.entries(data.breakdown).forEach(([compName, count]) => {
                    const numCount = count as number;
                    if (compName === 'Quintal Vivo') {
                        generalistClassesForSlot = Math.ceil(numCount / globalMaxCapacity);
                    } else {
                        const classesForThisComp = Math.ceil(numCount / globalMaxCapacity);
                        specialistClassesForSlot += classesForThisComp;
                    }
                });
                totalOptimizedWeeklyHours += specialistClassesForSlot;
                globalSchedule[day][slot] = { ...data, classesNeeded: specialistClassesForSlot + generalistClassesForSlot };
            });
        });
        
        const totalWeeklyHours = totalOptimizedWeeklyHours;
        const efficiencySavingsHours = Math.max(0, totalIsolatedWeeklyHours - totalOptimizedWeeklyHours);
        const efficiencySavingsPercent = totalIsolatedWeeklyHours > 0 ? (efficiencySavingsHours / totalIsolatedWeeklyHours) : 0;
        const totalMonthlyHours = totalOptimizedWeeklyHours * WEEKS_PER_MONTH;

        // 2. Cost Details
        const details = { totalAlimentacaoCost: 0, totalCostoEspecialista: 0, alimentacaoDetails: 'N/A', especialistaDetails: 'N/A', hasSpecialistComponents: false };
        let totalStudentSessionsPerWeek = 0;
        let totalLunchesPerMonth = 0;
        let totalSnacksPerMonth = 0;
    
        scenariosSubset.forEach(s => {
            const { numLunches, numSnacks } = parseFoodCostsFromName(s.productName);
            details.totalAlimentacaoCost += ((numLunches * variableCosts.almoco) + (numSnacks * variableCosts.lanche)) * s.frequency * WEEKS_PER_MONTH * s.avgStudents;
            totalLunchesPerMonth += numLunches * s.frequency * WEEKS_PER_MONTH * s.avgStudents;
            totalSnacksPerMonth += numSnacks * s.frequency * WEEKS_PER_MONTH * s.avgStudents;
            if (s.specialistBudgetPerDay > 0) {
                details.hasSpecialistComponents = true;
                totalStudentSessionsPerWeek += s.avgStudents * s.specialistBudgetPerDay * s.frequency;
            }
        });
        details.totalCostoEspecialista = totalStudentSessionsPerWeek * costoMensalPorSlot;
        details.alimentacaoDetails = `(${totalLunchesPerMonth.toFixed(0)} almoços) + (${totalSnacksPerMonth.toFixed(0)} lanches)`;
        details.especialistaDetails = `${totalStudentSessionsPerWeek} participações/sem`;

        let maxNexialistsNeeded = 0;
        Object.values(globalSchedule).forEach(dayData => {
            Object.values(dayData).forEach(slotData => {
                const generalistStudents = (slotData as any).generalistStudents || 0;
                const needed = Math.ceil(generalistStudents / globalMaxCapacity);
                if (needed > maxNexialistsNeeded) maxNexialistsNeeded = needed;
            });
        });
        const custoFixoTotalNexialistas = maxNexialistsNeeded * costoNexialista;

        // 3. Fazer Result
        const fazerReceita = totalRevenue;
        const fazerCustosVariaveis = details.totalAlimentacaoCost + details.totalCostoEspecialista;
        const fazerCustosFixos = fazerState.custoInstrutor; 
        const calculatedFixedCost = custoFixoTotalNexialistas; 
        
        const fazerTax = calculateTax({ simulationYear, regime: schoolTaxParams.regime, receita: fazerReceita, custo: fazerCustosVariaveis + calculatedFixedCost, presuncao: schoolTaxParams.presuncao, pat: schoolTaxParams.pat, cnaeCode: schoolTaxParams.cnaeCode, creditGeneratingCosts: fazerCustosVariaveis + calculatedFixedCost });
        
        const fazerResult = {
            dre: {
                receitaBruta: fazerReceita,
                impostosSobreReceita: fazerTax.breakdown.filter(i => i.category === 'receita').reduce((s: number, i: any) => s + i.value, 0),
                impostosSobreReceitaDetails: fazerTax.breakdown.filter(i => i.category === 'receita'),
                receitaLiquida: fazerReceita - fazerTax.breakdown.filter(i => i.category === 'receita').reduce((s: number, i: any) => s + i.value, 0),
                custosVariaveis: fazerCustosVariaveis,
                custosVariaveisDetails: [{name:'Alimentação', value:details.totalAlimentacaoCost}, {name:'Especialista', value:details.totalCostoEspecialista}],
                margemContribuicao: (fazerReceita - fazerTax.breakdown.filter(i => i.category === 'receita').reduce((s: number, i: any) => s + i.value, 0)) - fazerCustosVariaveis,
                margemContribuicaoPercent: fazerReceita > 0 ? ((fazerReceita - fazerTax.breakdown.filter(i => i.category === 'receita').reduce((s: number, i: any) => s + i.value, 0)) - fazerCustosVariaveis)/fazerReceita : 0,
                custosFixos: calculatedFixedCost,
                custosFixosDetails: [{name:'Nexialistas', value: calculatedFixedCost}],
                ebit: ((fazerReceita - fazerTax.breakdown.filter(i => i.category === 'receita').reduce((s: number, i: any) => s + i.value, 0)) - fazerCustosVariaveis) - calculatedFixedCost,
                impostosSobreResultado: fazerTax.breakdown.filter(i => i.category === 'resultado').reduce((s: number, i: any) => s + i.value, 0),
                impostosSobreResultadoDetails: fazerTax.breakdown.filter(i => i.category === 'resultado'),
                resultadoLiquido: (((fazerReceita - fazerTax.breakdown.filter(i => i.category === 'receita').reduce((s: number, i: any) => s + i.value, 0)) - fazerCustosVariaveis) - calculatedFixedCost) - fazerTax.breakdown.filter(i => i.category === 'resultado').reduce((s: number, i: any) => s + i.value, 0)
            },
            bep: { alunos: 0, receita: 0 }, // Simplified for aggregation
            unitEconomics: { mcPorMatricula: 0 }
        };

        // 4. Comprar Result
        const comprarReceita = totalRevenue * (partnershipModel.schoolPercentage / 100);
        const custoNexialistaEscola = escolaAssumeCustoNexialista ? calculatedFixedCost : 0;
        const comprarCustosVariaveis = details.totalAlimentacaoCost;
        const comprarCustosFixos = partnershipModel.saasFee + custoNexialistaEscola;
        const comprarTax = calculateTax({ simulationYear, regime: schoolTaxParams.regime, receita: comprarReceita, custo: comprarCustosVariaveis + comprarCustosFixos, presuncao: schoolTaxParams.presuncao, pat: schoolTaxParams.pat, cnaeCode: schoolTaxParams.cnaeCode, creditGeneratingCosts: comprarCustosVariaveis + comprarCustosFixos });
        
        const comprarResult = {
             dre: {
                receitaBruta: comprarReceita,
                impostosSobreReceita: comprarTax.breakdown.filter(i => i.category === 'receita').reduce((s: number, i: any) => s + i.value, 0),
                impostosSobreReceitaDetails: comprarTax.breakdown.filter(i => i.category === 'receita'),
                receitaLiquida: comprarReceita - comprarTax.breakdown.filter(i => i.category === 'receita').reduce((s: number, i: any) => s + i.value, 0),
                custosVariaveis: comprarCustosVariaveis,
                custosVariaveisDetails: [{name:'Alimentação', value:details.totalAlimentacaoCost}],
                margemContribuicao: (comprarReceita - comprarTax.breakdown.filter(i => i.category === 'receita').reduce((s: number, i: any) => s + i.value, 0)) - comprarCustosVariaveis,
                margemContribuicaoPercent: comprarReceita > 0 ? ((comprarReceita - comprarTax.breakdown.filter(i => i.category === 'receita').reduce((s: number, i: any) => s + i.value, 0)) - comprarCustosVariaveis)/comprarReceita : 0,
                custosFixos: comprarCustosFixos,
                custosFixosDetails: [{name:'SaaS', value: partnershipModel.saasFee}, {name:'Nexialista', value: custoNexialistaEscola}],
                ebit: ((comprarReceita - comprarTax.breakdown.filter(i => i.category === 'receita').reduce((s: number, i: any) => s + i.value, 0)) - comprarCustosVariaveis) - comprarCustosFixos,
                impostosSobreResultado: comprarTax.breakdown.filter(i => i.category === 'resultado').reduce((s: number, i: any) => s + i.value, 0),
                impostosSobreResultadoDetails: comprarTax.breakdown.filter(i => i.category === 'resultado'),
                resultadoLiquido: (((comprarReceita - comprarTax.breakdown.filter(i => i.category === 'receita').reduce((s: number, i: any) => s + i.value, 0)) - comprarCustosVariaveis) - comprarCustosFixos) - comprarTax.breakdown.filter(i => i.category === 'resultado').reduce((s: number, i: any) => s + i.value, 0)
            },
            bep: { alunos: 0, receita: 0 },
            unitEconomics: { mcPorMatricula: 0 }
        };

        // 5. Eco Results
        // Helper for Partner DRE - This is used for "By School" view only
        const calcPartner = (state, pct, fixedField, monthlyHrs=0, addFixed=0, addVar=0, revOverride=null) => {
            const isStdBase = !currentParcialMode && (state === educatorState || state === provedorState);
            const baseRev = currentParcialMode ? totalServiceRevenue : (isStdBase ? totalStandardRevenue : totalRevenue);
            let grossRev = revOverride !== null ? revOverride : (baseRev * (pct / 100) + (state === labirintarState && !currentParcialMode ? partnershipModel.saasFee : 0));
            
            const varCostPct = state.variableCostPercentage || 0;
            const varCostVal = (grossRev * (varCostPct / 100)) + addVar;
            const fixCostVal = state[fixedField] + addFixed;
            const rbt = state.rbt12 > 0 ? state.rbt12 : grossRev * 12;
            
            const taxes = calculateTax({ simulationYear, regime: state.regime, receita: grossRev, custo: varCostVal + fixCostVal, cnaeCode: state.cnaeCode, rbt12: rbt, presuncao: state.presuncao, creditGeneratingCosts: varCostVal + fixCostVal, pat: state.pat });
            
            const taxRev = taxes.breakdown.filter(i => i.category === 'receita').reduce((s: number, i: any) => s + i.value, 0);
            const taxRes = taxes.breakdown.filter(i => i.category === 'resultado').reduce((s: number, i: any) => s + i.value, 0);
            const netRev = grossRev - taxRev;
            const mc = netRev - varCostVal;
            const ebit = mc - fixCostVal;
            const netRes = ebit - taxRes;
            
            return {
                dre: {
                    receitaBruta: grossRev, receitaBrutaDetails:[], impostosSobreReceita: taxRev, impostosSobreReceitaDetails: taxes.breakdown.filter(i => i.category === 'receita'), receitaLiquida: netRev, custosVariaveis: varCostVal, custosVariaveisDetails: [], margemContribuicao: mc, margemContribuicaoPercent: grossRev>0?mc/grossRev:0, custosFixos: fixCostVal, custosFixosDetails: [], ebit: ebit, impostosSobreResultado: taxRes, impostosSobreResultadoDetails: taxes.breakdown.filter(i => i.category === 'resultado'), resultadoLiquido: netRes
                },
                bep: { alunos: 0, receita: 0 },
                unitEconomics: { mcPorMatricula: 0 },
                remuneracaoHorariaLiquida: monthlyHrs > 0 ? netRes / monthlyHrs : 0
            };
        };

        const educatorRes = calcPartner(educatorState, Number(educatorState.percentage), 'materialCosts', totalMonthlyHours);
        const provedorRes = calcPartner(provedorState, Number(provedorState.percentage), 'operationalCosts');
        
        let labRev: number | null = 0;
        if (!currentParcialMode) {
            const schoolShare = totalRevenue * (Number(partnershipModel.schoolPercentage) / 100);
            const educatorShare = totalStandardRevenue * (Number(educatorState.percentage) / 100);
            const providerShare = totalStandardRevenue * (Number(provedorState.percentage) / 100);
            labRev = totalRevenue - schoolShare - educatorShare - providerShare;
        } else {
            labRev = null; 
        }
        
        const labirintarRes = calcPartner(labirintarState, Number(labirintarState.percentage), 'operationalCosts', 0, 0, (escolaAssumeCustoNexialista ? 0 : calculatedFixedCost), labRev);

        return {
            optimizationMetrics: { totalRevenue, totalServiceRevenue, totalStandardRevenue, totalStudents, totalWeeklyHours, globalSchedule, efficiencySavingsHours, efficiencySavingsPercent, totalOptimizedWeeklyHours, totalIsolatedWeeklyHours },
            variableCostDetails: details,
            fazerResult,
            comprarResult,
            labirintarResult: labirintarRes,
            educatorResult: educatorRes,
            provedorResult: provedorRes,
            totalMonthlyHours,
            inputScenarios: scenariosSubset.map(s => ({
                name: s.productName,
                freq: s.frequency,
                students: s.avgStudents,
                turmas: s.turmas,
                price: s.unitPrice
            }))
        };
    };

    const calculateAnalysis = (targetParcialMode) => {
        const schools = Array.from(new Set(filteredScenarios.map((s: any) => s.school))) as string[];
        const resultsBySchool: any = {};
        
        // 1. Calculate per school
        schools.forEach(school => {
            resultsBySchool[school] = calculateResultForScenarios(filteredScenarios.filter(s => s.school === school), targetParcialMode);
        });

        // 2. Aggregate for Consolidated View - Schools
        const sumDRE = (dres: any[], schoolsList: any[] = []) => {
            const keys = ['receitaBruta', 'impostosSobreReceita', 'receitaLiquida', 'custosVariaveis', 'margemContribuicao', 'custosFixos', 'ebit', 'impostosSobreResultado', 'resultadoLiquido'];
            const result: any = {};
            keys.forEach(k => result[k] = 0);
            dres.forEach(d => {
                keys.forEach(k => result[k] += (d[k] as number)); // Explicit cast
            });
            
            result['margemContribuicaoPercent'] = result.receitaBruta > 0 ? result.margemContribuicao / result.receitaBruta : 0;
            
            // Hierarchical Breakdown Logic
            // For Revenue, we keep School -> Value
            if (schoolsList.length === dres.length) {
                result['receitaBrutaDetails'] = [];
                schoolsList.forEach((school, i) => {
                    result['receitaBrutaDetails'].push({ name: school, value: dres[i].receitaBruta });
                });
                
                // For other categories, we invert hierarchy: Item Type -> Schools
                const groupByItemName = (detailKey) => {
                    const itemMap = {};
                    dres.forEach((dre, idx) => {
                        const schoolName = schoolsList[idx];
                        const details = dre[detailKey] || [];
                        details.forEach(item => {
                            if (!itemMap[item.name]) {
                                itemMap[item.name] = { 
                                    name: item.name, 
                                    value: 0, 
                                    isGroup: true, 
                                    subDetails: [] 
                                };
                            }
                            itemMap[item.name].value += item.value;
                            itemMap[item.name].subDetails.push({
                                name: schoolName,
                                value: item.value,
                                rate: item.rate
                            });
                        });
                    });
                    return Object.values(itemMap);
                };

                result['impostosSobreReceitaDetails'] = groupByItemName('impostosSobreReceitaDetails');
                result['custosVariaveisDetails'] = groupByItemName('custosVariaveisDetails');
                result['custosFixosDetails'] = groupByItemName('custosFixosDetails');
                result['impostosSobreResultadoDetails'] = groupByItemName('impostosSobreResultadoDetails');

            } else {
                 // Fallback
                 result['receitaBrutaDetails'] = dres.flatMap(d => d.receitaBrutaDetails || []);
                 result['impostosSobreReceitaDetails'] = dres.flatMap(d => d.impostosSobreReceitaDetails || []);
                 result['custosVariaveisDetails'] = dres.flatMap(d => d.custosVariaveisDetails || []);
                 result['custosFixosDetails'] = dres.flatMap(d => d.custosFixosDetails || []);
                 result['impostosSobreResultadoDetails'] = dres.flatMap(d => d.impostosSobreResultadoDetails || []);
            }
            
            return result;
        };

        const fazerDREs = schools.map(s => resultsBySchool[s].fazerResult.dre);
        const comprarDREs = schools.map(s => resultsBySchool[s].comprarResult.dre);
        
        const consolidatedFazer = { dre: sumDRE(fazerDREs, schools) };
        const consolidatedComprar = { dre: sumDRE(comprarDREs, schools) };

        // 3. Aggregate for Consolidated View - AGENTS (Eco of Scale)
        const groupTotalRevenue = Object.values(resultsBySchool).reduce<number>((acc, r: any) => acc + (r.optimizationMetrics.totalRevenue as number), 0);
        const groupTotalServiceRevenue = Object.values(resultsBySchool).reduce<number>((acc, r: any) => acc + (r.optimizationMetrics.totalServiceRevenue as number), 0);
        const groupTotalStandardRevenue = Object.values(resultsBySchool).reduce<number>((acc, r: any) => acc + (r.optimizationMetrics.totalStandardRevenue as number), 0);
        const groupTotalMonthlyHours = Object.values(resultsBySchool).reduce<number>((acc, r: any) => acc + (r.totalMonthlyHours as number), 0);

        // Recalculate Agents DRE for Group Level
        const calcGroupAgent = (state: any, pct: number, fixedField: string, monthlyHrs: number = 0, addFixed: number = 0, revOverride: number | null = null) => {
            const isStdBase = !targetParcialMode && (state === educatorState || state === provedorState);
            const baseRev = targetParcialMode ? groupTotalServiceRevenue : (isStdBase ? groupTotalStandardRevenue : groupTotalRevenue);
            let grossRev = revOverride !== null ? revOverride : (baseRev * (pct / 100) + (state === labirintarState && !targetParcialMode ? (partnershipModel.saasFee as number) * schools.length : 0)); 
            
            let calculatedAddVar = 0;
            if (state === labirintarState && !escolaAssumeCustoNexialista) {
                 calculatedAddVar = (Object.values(resultsBySchool) as any[]).reduce((acc: number, r: any) => {
                     return acc + (r.fazerResult.dre.custosFixos as number); 
                 }, 0);
            }

            const varCostPct = state.variableCostPercentage || 0;
            const varCostVal = (grossRev * (varCostPct / 100)) + calculatedAddVar;
            const fixCostVal = state[fixedField] + addFixed; // USE STATE FIXED COST (Economy of Scale)
            const rbt = state.rbt12 > 0 ? state.rbt12 : grossRev * 12;
            
            const taxes = calculateTax({ simulationYear, regime: state.regime, receita: grossRev, custo: varCostVal + fixCostVal, cnaeCode: state.cnaeCode, rbt12: rbt, presuncao: state.presuncao, creditGeneratingCosts: varCostVal + fixCostVal, pat: state.pat });
            
            const taxRev = taxes.breakdown.filter(i => i.category === 'receita').reduce((s: number, i: any) => s + i.value, 0);
            const taxRes = taxes.breakdown.filter(i => i.category === 'resultado').reduce((s: number, i: any) => s + i.value, 0);
            const netRev = grossRev - taxRev;
            const mc = netRev - varCostVal;
            const ebit = mc - fixCostVal;
            const netRes = ebit - taxRes;
            
            const revDetails = [];
            schools.forEach((s: any) => {
                const schoolRes: any = resultsBySchool[s];
                const share = schoolRes.optimizationMetrics.totalRevenue / groupTotalRevenue;
                if (share > 0) revDetails.push({ name: s, value: grossRev * share });
            });

            return {
                dre: {
                    receitaBruta: grossRev, receitaBrutaDetails: revDetails, impostosSobreReceita: taxRev, impostosSobreReceitaDetails: taxes.breakdown.filter(i => i.category === 'receita'), receitaLiquida: netRev, custosVariaveis: varCostVal, custosVariaveisDetails: [], margemContribuicao: mc, margemContribuicaoPercent: grossRev>0?mc/grossRev:0, custosFixos: fixCostVal, custosFixosDetails: [], ebit: ebit, impostosSobreResultado: taxRes, impostosSobreResultadoDetails: taxes.breakdown.filter(i => i.category === 'resultado'), resultadoLiquido: netRes
                },
                bep: { alunos: 0, receita: 0 },
                unitEconomics: { mcPorMatricula: 0 },
                remuneracaoHorariaLiquida: monthlyHrs > 0 ? netRes / monthlyHrs : 0
            };
        };

        const consolidatedEducator = calcGroupAgent(educatorState, Number(educatorState.percentage), 'materialCosts', groupTotalMonthlyHours);
        const consolidatedProvedor = calcGroupAgent(provedorState, Number(provedorState.percentage), 'operationalCosts');
        
        let groupLabRev: number | null = 0;
        if (!targetParcialMode) {
            const schoolShare = groupTotalRevenue * (Number(partnershipModel.schoolPercentage) / 100);
            const educatorShare = groupTotalStandardRevenue * (Number(educatorState.percentage) / 100);
            const providerShare = groupTotalStandardRevenue * (Number(provedorState.percentage) / 100);
            groupLabRev = groupTotalRevenue - schoolShare - educatorShare - providerShare;
        } else {
            groupLabRev = null;
        }
        
        const consolidatedLabirintar = calcGroupAgent(labirintarState, Number(labirintarState.percentage), 'operationalCosts', 0, 0, groupLabRev);

        const consolidated: any = {
            fazerResult: consolidatedFazer,
            comprarResult: consolidatedComprar,
            labirintarResult: consolidatedLabirintar,
            educatorResult: consolidatedEducator,
            provedorResult: consolidatedProvedor,
            optimizationMetrics: {
                totalRevenue: groupTotalRevenue,
                totalServiceRevenue: groupTotalServiceRevenue,
                totalStudents: Object.values(resultsBySchool).reduce<number>((acc, r: any) => acc + (r.optimizationMetrics.totalStudents as number), 0),
                globalSchedule: null 
            },
            totalMonthlyHours: groupTotalMonthlyHours,
            inputScenarios: null // consolidated view doesn't show inputs yet
        };
        
        consolidatorUnitEconomics(consolidated.fazerResult, Number(consolidated.optimizationMetrics.totalStudents as number));
        consolidatorUnitEconomics(consolidated.comprarResult, Number(consolidated.optimizationMetrics.totalStudents as number));

        return { schools: resultsBySchool, consolidated };
    };

    function consolidatorUnitEconomics(result: any, totalStudents: number) {
        const mc = Number(result.dre.margemContribuicao);
        const cf = Number(result.dre.custosFixos);
        const mcPercent = Number(result.dre.margemContribuicaoPercent);
        
        const mcUnit = totalStudents > 0 ? mc / totalStudents : 0;
        result.unitEconomics = { mcPorMatricula: mcUnit };
        result.bep = { 
            alunos: mcUnit > 0 ? Math.ceil(cf / mcUnit) : Infinity, 
            receita: mcPercent > 0 ? cf / mcPercent : Infinity 
        };
    }

    const consolidatedResults = useMemo(() => calculateAnalysis(isParcialMode), [filteredScenarios, variableCosts, costoMensalPorSlot, costoNexialista, fazerState, escolaAssumeCustoNexialista, globalMaxCapacity, schoolTaxParams, partnershipModel, isParcialMode, labirintarState, educatorState, provedorState, simulationYear]);

    const activeResults = activeTab === 'Consolidado' ? consolidatedResults.consolidated : consolidatedResults.schools[activeTab];
    const optimizationMetrics = activeResults?.optimizationMetrics || { totalRevenue: 0, totalServiceRevenue: 0, totalStudents: 0, globalSchedule: {} };
    const fazerResult = activeResults?.fazerResult;
    const comprarResult = activeResults?.comprarResult;
    const labirintarResult = activeResults?.labirintarResult;
    const educatorResult = activeResults?.educatorResult;
    const provedorResult = activeResults?.provedorResult;
    const totalMonthlyHours = activeResults?.totalMonthlyHours || 0;
    const totalRevenue = optimizationMetrics.totalRevenue;
    const totalServiceRevenue = optimizationMetrics.totalServiceRevenue;

    const diferencaResultado = comprarResult && fazerResult ? (Number(comprarResult.dre.resultadoLiquido) - Number(fazerResult.dre.resultadoLiquido)) : 0;
    const totalPercentageDisplay = Number(labirintarState.percentage) + Number(educatorState.percentage) + Number(provedorState.percentage) + (isParcialMode ? 0 : Number(partnershipModel.schoolPercentage));

    // Handle Report Generation with new structure
    const handleGenerateReport = async (reportType) => {
        setIsGeneratingReport(true);
        setIsReportMenuOpen(false);
        
        const newWindow = window.open('', '_blank');
        if (!newWindow) {
            alert("Não foi possível abrir o relatório. Por favor, desabilite o bloqueador de pop-ups.");
            setIsGeneratingReport(false);
            return;
        }
        newWindow.document.write(`<html><head><title>Gerando Relatório...</title><style>body{font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;background-color:#f4f0e8;color:#5c3a21;text-align:center;}.spinner{animation:rotate 2s linear infinite;width:60px;height:60px;margin:0 auto 20px;}.path{stroke:#ff595a;stroke-linecap:round;animation:dash 1.5s ease-in-out infinite;}@keyframes rotate{100%{transform:rotate(360deg)}}@keyframes dash{0%{stroke-dasharray:1,150;stroke-dashoffset:0}50%{stroke-dasharray:90,150;stroke-dashoffset:-35}100%{stroke-dasharray:90,150;stroke-dashoffset:-124}}</style></head><body><div><svg class="spinner" viewBox="0 0 50 50"><circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle></svg><p><b>Gerando relatório consolidado...</b></p></div></body></html>`);

        try {
            const analysisText = "";

            const reportData = { 
                consolidatedResults,
                simulationYear, 
                analysisText, 
                reportType,
                isParcialMode,
                globalMaxCapacity
            };
            
            const html = generateReportHtml(reportData);
            newWindow.document.open();
            newWindow.document.write(html);
            newWindow.document.close();
        } catch (error) {
            console.error(error);
            newWindow.close();
            alert("Erro ao gerar relatório.");
        } finally {
            setIsGeneratingReport(false);
        }
    };

    return (
        <div className="mt-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 border-b border-[#bf917f] pb-4 gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-[#5c3a21]">Análise Estratégica</h2>
                        <p className="text-sm text-[#8c6d59]">Compare cenários e avalie a viabilidade.</p>
                    </div>
                    <FormControl label={
                         <div className="flex items-center gap-2 text-[#5c3a21] text-sm font-bold">
                             Modo de Operação
                             <InfoTooltip text="Total: LABirintar gerencia o faturamento e faz o split da receita. Parcial: LABirintar atua como fornecedora para a escola." />
                         </div>
                     }>
                         <div className="flex items-center space-x-3 bg-white p-1 rounded-lg border border-[#e0cbb2]">
                            <span className={`font-semibold text-xs transition-colors px-2 ${isParcialMode ? 'text-[#ff595a]' : 'text-[#8c6d59]'}`}>
                                Parcial
                            </span>
                            <Toggle
                                enabled={operationMode === 'Total'}
                                onChange={(enabled) => setOperationMode(enabled ? 'Total' : 'Parcial')}
                            />
                            <span className={`font-semibold text-xs transition-colors px-2 ${operationMode === 'Total' ? 'text-[#ff595a]' : 'text-[#8c6d59]'}`}>
                                Total
                            </span>
                        </div>
                     </FormControl>
                </div>

                {/* Scenario Selection */}
                <div className="max-w-6xl mx-auto mb-8">
                    <FormControl label="Cenários a Analisar">
                        {scenarios.length > 0 ? (
                           <div className="bg-white p-4 rounded-xl border border-[#bf917f]">
                                <div className="flex justify-between items-center pb-2 border-b border-[#e0cbb2] flex-wrap gap-y-2">
                                    <p className="text-sm font-semibold text-[#5c3a21] mr-4">{selectedScenarioIds.length} de {scenarios.length} selecionado(s)</p>
                                    
                                    {/* Updated Filter Buttons */}
                                    <div className="flex items-center gap-2 flex-wrap" role="group">
                                        <button 
                                            onClick={handleSelectAll} 
                                            className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                                                scenarios.length > 0 && selectedScenarioIds.length === scenarios.length 
                                                ? 'bg-[#ffe9c9] text-[#5c3a21] border-[#ff595a] font-bold' 
                                                : 'bg-white text-[#8c6d59] border-[#e0cbb2] hover:bg-[#f4f0e8]'
                                            }`}
                                        >
                                            Grupo Econômico
                                        </button>
                                        {uniqueSchools.map((school) => {
                                            const schoolScenarioIds = scenarios.filter(s => s.school === school).map(s => s.id);
                                            const isSchoolActive = schoolScenarioIds.length > 0 && schoolScenarioIds.every(id => selectedScenarioIds.includes(id));
                                            return (
                                                <button 
                                                    key={school}
                                                    onClick={() => handleSelectBySchool(school)} 
                                                    className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                                                        isSchoolActive
                                                        ? 'bg-[#ffe9c9] text-[#5c3a21] border-[#ff595a] font-bold'
                                                        : 'bg-white text-[#8c6d59] border-[#e0cbb2] hover:bg-[#f4f0e8]'
                                                    }`}
                                                >
                                                    {school}
                                                </button>
                                            );
                                        })}
                                        <button onClick={handleDeselectAll} className="text-xs font-medium text-[#8c6d59] hover:text-[#ff595a] underline px-2 py-1 ml-2">Limpar</button>
                                    </div>
                                </div>
                               <div className="max-h-60 overflow-y-auto pr-2 mt-2">
                                   <div className="grid grid-cols-[30px_1fr_50px_60px_60px_70px_80px_90px] gap-x-2 items-center font-bold text-sm text-[#8c6d59] border-b border-[#bf917f] pb-2 mb-2 px-2 sticky top-0 bg-white z-10">
                                       <input
                                            type="checkbox"
                                            ref={selectAllCheckboxRef}
                                            onChange={handleSelectAllChange}
                                            className="h-4 w-4 rounded border-gray-400 accent-[#ff595a]"
                                            aria-label="Selecionar todos os cenários"
                                        />
                                       <div className="text-left col-span-1">Escola</div>
                                       <div className="text-center">Freq.</div>
                                       <div className="text-center">Alunos</div>
                                       <div className="text-center">Turmas</div>
                                       <div className="text-center">Espec./Dia</div>
                                       <div className="text-right">Preço</div>
                                       <div className="text-right">Receita</div>
                                   </div>
                                   <div className="space-y-3">
                                        {scenarios.map(s => (
                                            <label key={s.id} className="flex flex-col bg-white rounded-md border border-transparent hover:border-[#e0cbb2] mb-2 shadow-sm overflow-hidden transition-colors cursor-pointer">
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
                                                <div className="grid grid-cols-[30px_1fr_50px_60px_60px_70px_80px_90px] gap-x-2 items-start py-2 px-2 text-sm">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedScenarioIds.includes(s.id)}
                                                        onChange={() => handleScenarioSelectionChange(s.id)}
                                                        className="h-4 w-4 mt-1 rounded border-gray-300 accent-[#ff595a]"
                                                        aria-label={`Selecionar cenário ${s.productName}`}
                                                    />
                                                    <div className="font-semibold text-[#5c3a21] self-center truncate">{s.school}</div>
                                                    <div className="text-center font-medium text-[#5c3a21] self-center">{s.frequency}x</div>
                                                    <div className="text-center font-medium text-[#5c3a21] self-center">{s.avgStudents}</div>
                                                    <div className="text-center font-medium text-[#5c3a21] self-center">{s.turmas || '-'}</div>
                                                    <div className="text-center font-medium text-[#5c3a21] self-center">{s.specialistBudgetPerDay}</div>
                                                    <div className="text-right font-medium text-[#5c3a21] self-center">{formatCurrency(s.unitPrice)}</div>
                                                    <div className="text-right font-medium text-[#5c3a21] self-center">{formatCurrency(s.unitPrice * s.avgStudents)}</div>
                                                </div>
                                            </label>
                                        ))}
                                   </div>
                               </div>
                           </div>
                        ) : (<p className="text-sm text-center text-[#8c6d59] p-4 bg-white rounded-md border border-dashed border-[#e0cbb2]">Nenhum cenário de demanda foi salvo. Adicione cenários na aba "Jam Session Studio".</p>)}
                    </FormControl>
                </div>
                
                {/* VIEW NAVIGATION - Updated to flex-wrap */}
                <div className="flex flex-wrap items-center gap-1 border-b border-[#e0cbb2] mb-6">
                    <TabButton label="Visão Consolidada (Grupo)" isActive={activeTab === 'Consolidado'} onClick={() => setActiveTab('Consolidado')} />
                    {schoolsInAnalysis.map(school => (
                        <TabButton key={school} label={school} isActive={activeTab === school} onClick={() => setActiveTab(school)} />
                    ))}
                </div>

                 {/* Part 1: Fazer vs Comprar */}
                <div>
                    <h3 className="text-xl font-bold text-center mb-2 text-[#5c3a21]">Parte 1: Análise da Escola (Fazer vs. Comprar)</h3>
                    <div className="max-w-4xl mx-auto mb-6">
                        <div className="bg-[#f4f0e8] p-4 rounded-lg border border-[#e0cbb2] shadow-sm">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-[#5c3a21] text-sm">Grade Horária - {activeTab}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-[#8c6d59]">Capacidade Global:</span>
                                    <NumberInput value={globalMaxCapacity} onChange={setGlobalMaxCapacity} min={5} max={50} className="w-16 text-xs" />
                                </div>
                            </div>
                            
                            {activeTab === 'Consolidado' ? (
                                schoolsInAnalysis.map(school => (
                                    <div key={school} className="mt-4 border-t border-[#e0cbb2] pt-4">
                                        <h5 className="text-sm font-bold text-[#5c3a21] mb-2">{school}</h5>
                                        <GlobalGridDisplay globalSchedule={consolidatedResults.schools[school].optimizationMetrics.globalSchedule} maxCapacity={globalMaxCapacity} schoolName={school} />
                                    </div>
                                ))
                            ) : (
                                <GlobalGridDisplay globalSchedule={optimizationMetrics.globalSchedule} maxCapacity={globalMaxCapacity} schoolName={activeTab} />
                            )}
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 mt-6">
                        <ScenarioCard title="Cenário 1: Fazer" subtitle="Operação internalizada pela escola.">
                            <h4 className="font-semibold text-sm uppercase tracking-wider text-[#8c6d59] border-b border-[#e0cbb2] pb-2 mb-4">Parâmetros de Custo (Escola)</h4>
                            <FormControl label="Custo do Almoço"><NumberInput value={variableCosts.almoco} onChange={v => setVariableCosts(p => ({ ...p, almoco: v }))} prefix="R$" formatAsCurrency={true} min={0} max={100} step={0.5} defaultValue={variableCostsDefault.almoco} onReset={resetVariableCosts}/></FormControl>
                            <FormControl label="Custo do Lanche"><NumberInput value={variableCosts.lanche} onChange={v => setVariableCosts(p => ({ ...p, lanche: v }))} prefix="R$" formatAsCurrency={true} min={0} max={50} step={0.5} defaultValue={variableCostsDefault.lanche} onReset={resetVariableCosts}/></FormControl>
                            <FormControl label="Custo Mensal por Slot (Especialista)"><NumberInput value={costoMensalPorSlot} onChange={setCostoMensalPorSlot} prefix="R$" formatAsCurrency={true} min={0} max={1000} step={1} defaultValue={OP_SIM_DEFAULTS.COSTO_MENSAL_SLOT} onReset={resetCostoMensalPorSlot}/></FormControl>
                            <FormControl label="Custo Mensal Nexialista"><NumberInput value={costoNexialista} onChange={setCostoNexialista} prefix="R$" formatAsCurrency={true} min={0} max={9999} step={1} defaultValue={OP_SIM_DEFAULTS.COSTO_NEXIALISTA} onReset={resetCostoNexialista} /></FormControl>
                            <h4 className="font-semibold text-sm uppercase tracking-wider text-[#8c6d59] border-b border-[#e0cbb2] pb-2 my-4 pt-4">Parâmetros Tributários (Escola)</h4>
                            <FormControl label="Regime Tributário"><Select value={schoolTaxParams.regime} onChange={v => handleTaxParamsChange('regime', v)} options={Object.values(TaxRegime)} defaultValue={schoolTaxParamsDefault.regime} onReset={resetSchoolTaxParams} /></FormControl>
                            <FormControl label="Atividade (CNAE)"><select value={schoolTaxParams.cnaeCode} onChange={e => handleTaxParamsChange('cnaeCode', e.target.value)} className="w-full rounded-md border-[#e0cbb2] bg-white text-[#5c3a21] shadow-sm focus:border-[#ff595a] focus:ring-1 focus:ring-[#ff595a] px-3 py-2">{cnaeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></FormControl>
                            {schoolTaxParams.regime === TaxRegime.LUCRO_PRESUMIDO && (<FormControl label="Alíquota de Presunção"><NumberInput value={schoolTaxParams.presuncao} onChange={v => handleTaxParamsChange('presuncao', v)} prefix="%" min={0} max={100} step={1} defaultValue={schoolTaxParamsDefault.presuncao} onReset={resetSchoolTaxParams} /></FormControl>)}
                            {schoolTaxParams.regime === TaxRegime.LUCRO_REAL && (<FormControl label="Optante do PAT?"><div className="flex justify-start"><Toggle enabled={schoolTaxParams.pat} onChange={v => handleTaxParamsChange('pat', v)} /></div></FormControl>)}
                           <DREDisplay dre={fazerResult.dre} bep={fazerResult.bep} unitEconomics={fazerResult.unitEconomics} />
                        </ScenarioCard>
                        
                        {!isParcialMode && (
                            <ScenarioCard title="Cenário 2: Comprar" subtitle="Parceria estratégica com a LABirintar.">
                                 <h4 className="font-semibold text-sm uppercase tracking-wider text-[#8c6d59] border-b border-[#e0cbb2] pb-2 mb-4">Modelo de Parceria</h4>
                                <FormControl label="Percentual da Receita para Escola">
                                    <Slider value={partnershipModel.schoolPercentage} onChange={v => handlePartnershipModelChange('schoolPercentage', v)} min={0} max={100} suffix="%" />
                                </FormControl>
                                <FormControl label="Taxa de SaaS LABirintar (Custo Fixo)">
                                    <NumberInput value={partnershipModel.saasFee} onChange={v => handlePartnershipModelChange('saasFee', v)} prefix="R$" formatAsCurrency={true} min={0} max={10000} step={100} defaultValue={partnershipModelDefault.saasFee} onReset={resetPartnershipModel} />
                                </FormControl>
                                <FormControl label={
                                    <div className="flex items-center gap-1">
                                        <span>Escola assume custo do Nexialista?</span>
                                        <InfoTooltip text="Se ativado, a escola arca com o custo do educador nexialista. Se desativado, este custo é absorvido pela LABirintar." />
                                    </div>
                                }>
                                    <div className="flex justify-start">
                                        <Toggle enabled={escolaAssumeCustoNexialista} onChange={setEscolaAssumeCustoNexialista} />
                                    </div>
                                </FormControl>
                                <p className="text-xs text-center text-[#8c6d59] p-2 bg-[#f3f0e8] rounded-md border border-dashed border-[#e0cbb2]">Parâmetros tributários da escola são herdados do cenário "Fazer" para consistência.</p>
                                 <DREDisplay dre={comprarResult.dre} bep={comprarResult.bep} unitEconomics={comprarResult.unitEconomics} />
                            </ScenarioCard>
                        )}
                        {isParcialMode && (
                             <div className="bg-[#fff5f5] p-6 rounded-2xl shadow-lg border border-red-200 flex flex-col items-center justify-center text-center opacity-60 grayscale">
                                <h3 className="text-xl font-bold text-gray-500 mb-2">Cenário 2: Comprar</h3>
                                <p className="text-gray-500 text-sm">Desativado no Modo Parcial.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Part 2: Ecosystem Health */}
                <div className="mt-12">
                    <h3 className="text-xl font-bold text-center mb-2 text-[#5c3a21]">Parte 2: Análise da Saúde do Ecossistema ({activeTab})</h3>
                    <div className="max-w-4xl mx-auto p-4 bg-white rounded-md border border-[#e0cbb2] text-sm text-center space-y-2">
                        <p><strong>Distribuição do Faturamento ({formatCurrency(isParcialMode ? totalServiceRevenue : totalRevenue)})</strong> <span className="text-xs text-[#8c6d59]">{isParcialMode ? "(Base: Receita de Serviços)" : "(Base: GMV Famílias)"}</span></p>
                        {!isParcialMode ? (
                            <div className="flex justify-center items-center gap-3 flex-wrap">
                                <span>LABirintar: <strong className="text-[#5c3a21]">Remanescente</strong></span>
                                <span>Escola: <strong className="text-[#5c3a21]">{partnershipModel.schoolPercentage}%</strong></span>
                                <span>Educador: <strong className="text-[#5c3a21]">{educatorState.percentage}%</strong></span>
                                <span>Provedor: <strong className="text-[#5c3a21]">{provedorState.percentage}%</strong></span>
                            </div>
                        ) : (
                            <div className="flex justify-center items-center gap-3 flex-wrap">
                                <span>LABirintar: <strong className="text-[#5c3a21]">{labirintarState.percentage.toFixed(2)}%</strong></span>
                                <span>Educador: <strong className="text-[#5c3a21]">{educatorState.percentage}%</strong></span>
                                <span>Provedor: <strong className="text-[#5c3a21]">{provedorState.percentage}%</strong></span>
                            </div>
                        )}
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
                        <ScenarioCard title="Viabilidade LABirintar">
                            <FormControl label="Custos Operacionais Fixos (Mês)"><NumberInput value={labirintarState.operationalCosts} onChange={v => handleLabirintarChange('operationalCosts', v)} prefix="R$" formatAsCurrency={true} min={0} max={999999} step={100} defaultValue={ECO_DEFAULTS.LABIRINTAR_STATE.operationalCosts} onReset={resetLabirintarState} /></FormControl>
                            <h4 className="font-semibold text-sm uppercase text-[#8c6d59] border-b border-[#e0cbb2] pb-2 mt-4 mb-2 text-center">Tributário</h4>
                            <FormControl label="Regime"><Select value={labirintarState.regime} onChange={v => handleLabirintarChange('regime', v)} options={Object.values(TaxRegime)} defaultValue={ECO_DEFAULTS.LABIRINTAR_STATE.regime} onReset={resetLabirintarState} /></FormControl>
                            <DREDisplay dre={labirintarResult.dre} bep={labirintarResult.bep} unitEconomics={labirintarResult.unitEconomics} />
                        </ScenarioCard>
                        <ScenarioCard title="Viabilidade Educador">
                            <FormControl label="% de Repasse">
                                <Slider value={educatorState.percentage} onChange={v => handleEducatorChange('percentage', v)} min={0} max={100} suffix="%" />
                            </FormControl>
                            <FormControl label="Custos de Materiais (Mês)"><NumberInput value={educatorState.materialCosts} onChange={v => handleEducatorChange('materialCosts', v)} prefix="R$" formatAsCurrency={true} min={0} max={99999} step={10} defaultValue={ECO_DEFAULTS.EDUCATOR_STATE.materialCosts} onReset={resetEducatorState} /></FormControl>
                            <h4 className="font-semibold text-sm uppercase text-[#8c6d59] border-b border-[#e0cbb2] pb-2 mt-4 mb-2 text-center">Tributário</h4>
                            <FormControl label="Regime"><Select value={educatorState.regime} onChange={v => handleEducatorChange('regime', v)} options={Object.values(TaxRegime)} defaultValue={ECO_DEFAULTS.EDUCATOR_STATE.regime} onReset={resetEducatorState} /></FormControl>
                            <DREDisplay dre={educatorResult.dre} bep={educatorResult.bep} unitEconomics={educatorResult.unitEconomics} remuneracaoHorariaLiquida={educatorResult.remuneracaoHorariaLiquida} totalMonthlyHours={totalMonthlyHours} />
                        </ScenarioCard>
                        <ScenarioCard title="Viabilidade Provedor">
                            <FormControl label="Custos Operacionais (Mês)"><NumberInput value={provedorState.operationalCosts} onChange={v => handleProvedorChange('operationalCosts', v)} prefix="R$" formatAsCurrency={true} min={0} max={99999} step={100} defaultValue={ECO_DEFAULTS.PROVEDOR_STATE.operationalCosts} onReset={resetProvedorState} /></FormControl>
                            <h4 className="font-semibold text-sm uppercase text-[#8c6d59] border-b border-[#e0cbb2] pb-2 mt-4 mb-2 text-center">Tributário</h4>
                            <FormControl label="Regime"><Select value={provedorState.regime} onChange={v => handleProvedorChange('regime', v)} options={Object.values(TaxRegime)} defaultValue={ECO_DEFAULTS.PROVEDOR_STATE.regime} onReset={resetProvedorState} /></FormControl>
                            <DREDisplay dre={provedorResult.dre} bep={provedorResult.bep} unitEconomics={provedorResult.unitEconomics} />
                        </ScenarioCard>
                    </div>
                </div>

                 <div className="mt-12 bg-white p-6 rounded-2xl shadow-xl border border-[#e0cbb2]">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <h3 className="text-xl font-bold text-[#5c3a21] truncate">Análise Comparativa e Relatório Final</h3>
                         <div ref={reportMenuRef} className="relative">
                            <button 
                                onClick={() => setIsReportMenuOpen(prev => !prev)}
                                disabled={isGeneratingReport} 
                                className="inline-flex items-center justify-center gap-2 rounded-md border border-[#bf917f] bg-white px-3 py-1.5 text-sm font-medium text-[#5c3a21] shadow-sm transition-all hover:bg-[#f4f0e8] focus:outline-none focus:ring-2 focus:ring-[#ff595a] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-wait"
                            >
                                {isGeneratingReport ? (
                                    <><svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Gerando...</>
                                ) : (
                                    <><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M4 2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H4Zm1.5 5.75a.75.75 0 0 1 .75-.75h8.5a.75.75 0 0 1 0 1.5h-8.5a.75.75 0 0 1-.75-.75Zm0 3.5a.75.75 0 0 1 .75-.75h8.5a.75.75 0 0 1 0 1.5h-8.5a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" /></svg>Gerar Relatório...</>
                                )}
                            </button>
                            {isReportMenuOpen && (
                                <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-md shadow-lg border border-[#e0cbb2] z-10">
                                    <button onClick={() => handleGenerateReport('complete')} className="block w-full text-left px-4 py-2 text-sm text-[#5c3a21] hover:bg-[#f4f0e8]">Completo</button>
                                    <button onClick={() => handleGenerateReport('provider')} className="block w-full text-left px-4 py-2 text-sm text-[#5c3a21] hover:bg-[#f4f0e8]">Para Provedor</button>
                                    <button onClick={() => handleGenerateReport('educator')} className="block w-full text-left px-4 py-2 text-sm text-[#5c3a21] hover:bg-[#f4f0e8]">Para Educador</button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="mt-4 text-center">
                        {!isParcialMode ? (
                            <>
                                {diferencaResultado > 0 ? (<p className="text-lg">O cenário <strong>"Comprar"</strong> é <strong className="text-green-600">{formatCurrency(diferencaResultado)}</strong> mais rentável por mês ({activeTab}).</p>) : (<p className="text-lg">O cenário <strong>"Fazer"</strong> é <strong className="text-red-600">{formatCurrency(Math.abs(diferencaResultado))}</strong> mais rentável por mês ({activeTab}).</p>)}
                            </>
                        ) : (
                            <p className="text-lg text-[#5c3a21]">
                                <strong>Modo Parcial:</strong> A análise foca na viabilidade e distribuição de receita entre os parceiros do ecossistema.
                            </p>
                        )}
                    </div>
                </div>

                <p className="text-center text-xs text-[#8c6d59] mt-8 max-w-3xl mx-auto">Atenção: Esta é uma simulação simplificada para fins de planejamento estratégico. Custos e impostos podem variar.</p>
            </div>
        </div>
    );
};
