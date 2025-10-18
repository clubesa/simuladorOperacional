

import React from "react";
import { TaxRegime } from '../types.tsx';
import { cnaes } from '../data/simplesNacional.tsx';
import { calculateTax } from '../services/taxCalculator.tsx';
import { FormControl } from './FormControl.tsx';
import { NumberInput } from './NumberInput.tsx';
import { labirintarPriceMatrix } from '../data/tabelasDePreco.ts';
import { Select } from './Select.tsx';
import { ExportToSheets } from './ExportToSheets.tsx';
import { Toggle } from './Toggle.tsx';
import { Slider } from './Slider.tsx';
import { InfoTooltip } from './InfoTooltip.tsx';
import { usePersistentState } from "../App.tsx";
import { productDataBySchool } from '../data/jamSessionData.tsx';

const WEEKS_PER_MONTH = 4.3452381;
const OCIO_VIVO_ID = 'c27';

const OP_SIM_DEFAULTS = {
    COSTO_ESPECIALISTA: 150, 
    COSTO_NEXIALISTA: 2001,
    COMPRAR_STATE: { pvuLabirintar: 0 },
};

// Helper functions moved to module scope to prevent re-creation on render
const formatCurrency = (value) => {
    if (typeof value !== 'number' || isNaN(value)) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const formatCurrencyWithoutSymbol = (value) => {
    if (typeof value !== 'number' || isNaN(value)) return '0,00';
    return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
};


// Sub-components moved out of the main component to prevent unmounting on re-render
const ScenarioCard = ({ title, subtitle, children, className = "" }) => (
    <div className={`bg-[#f3f0e8] p-6 rounded-2xl shadow-lg border border-[#e0cbb2] ${className}`}>
        <h3 className="text-xl font-bold text-[#5c3a21]">{title}</h3>
        <p className="text-sm text-[#8c6d59] mb-6">{subtitle}</p>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

const DREDisplay = ({ dre, bep, unitEconomics }) => {
    const { useState } = React;
    const [showReceitaDetails, setShowReceitaDetails] = useState(false);
    const [showResultadoDetails, setShowResultadoDetails] = useState(false);
    const [showVariaveisDetails, setShowVariaveisDetails] = useState(false);

    const formatValue = (value) => formatCurrencyWithoutSymbol(value);
    const formatNumber = (value) => new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
    const formatPercent = (value) => {
        if (isNaN(value) || !isFinite(value) || value === null) return '-';
        return `${(value * 100).toFixed(1).replace('.', ',')}%`;
    };

    const resultadoColorClass = dre.resultadoLiquido >= 0 ? 'text-green-600' : 'text-red-600';
    
    const ChevronDownIcon = ({ className = "w-4 h-4" }) => (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
      </svg>
    );

    const DRELine = ({ label, value, percent, isSubtotal = false, isFinal = false, customColorClass = "" }) => (
        <div className={`grid grid-cols-[minmax(0,1fr)_auto_90px] sm:grid-cols-[minmax(0,1fr)_60px_110px] gap-x-1 sm:gap-x-2 items-baseline text-sm ${isSubtotal ? 'font-semibold' : ''} ${isFinal ? 'font-bold text-base' : ''}`}>
            <span className="truncate">{label}</span>
            <span className="font-mono text-xs text-right text-[#8c6d59]">{percent}</span>
            <strong className={`${customColorClass || (isFinal ? resultadoColorClass : 'text-[#5c3a21]')} font-mono text-right truncate`}>{formatValue(value)}</strong>
        </div>
    );

    return (
        <div className="mt-6 space-y-2">
            <h4 className="grid grid-cols-[minmax(0,1fr)_auto_90px] sm:grid-cols-[minmax(0,1fr)_60px_110px] gap-x-1 sm:gap-x-2 font-semibold text-sm uppercase tracking-wider text-[#8c6d59] border-b border-[#e0cbb2] pb-2 mb-4">
                <span className="text-left truncate">Estrutura de Resultado</span>
                <span className="text-right">AV %</span>
                <span className="text-right">Valor</span>
            </h4>
            
            <DRELine label="Receita Bruta" value={dre.receitaBruta} percent={formatPercent(1)} />

            {/* Collapsible Impostos s/ Receita */}
            <div className="text-sm">
                <div className="grid grid-cols-[minmax(0,1fr)_auto_90px] sm:grid-cols-[minmax(0,1fr)_60px_110px] gap-x-1 sm:gap-x-2 items-center">
                    <button onClick={() => setShowReceitaDetails(!showReceitaDetails)} className="flex items-center gap-2 text-left p-1 -ml-1 rounded-md hover:bg-[#e0cbb2]/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff595a] min-w-0" aria-expanded={showReceitaDetails}>
                        <span className="truncate">(-) Impostos s/ Receita</span>
                        <ChevronDownIcon className={`w-3.5 h-3.5 text-[#8c6d59] transition-transform duration-200 ${showReceitaDetails ? 'rotate-180' : ''}`} />
                    </button>
                    <span className="font-mono text-xs text-right text-[#8c6d59]">{formatPercent(dre.receitaBruta > 0 ? -dre.impostosSobreReceita / dre.receitaBruta : 0)}</span>
                    <strong className="font-mono text-right text-[#5c3a21] truncate">{formatValue(-dre.impostosSobreReceita)}</strong>
                </div>
                {showReceitaDetails && dre.impostosSobreReceitaDetails && dre.impostosSobreReceitaDetails.length > 0 && (
                    <div className="pl-4 mt-1 space-y-1 text-xs ml-1 py-1">
                        {dre.impostosSobreReceitaDetails.map(tax => {
                            const taxPercent = dre.receitaBruta > 0 ? tax.value / dre.receitaBruta : 0;
                            return (
                                 <div key={tax.name} className="grid grid-cols-[minmax(0,1fr)_auto_90px] sm:grid-cols-[minmax(0,1fr)_60px_110px] gap-x-1 sm:gap-x-2 items-baseline -ml-4">
                                    <span className="text-[#8c6d59]">{tax.name} ({tax.rate})</span>
                                    <span className="font-mono text-right text-[#8c6d59]">{formatPercent(taxPercent)}</span>
                                    <strong className="font-mono text-right text-[#5c3a21] truncate">{formatValue(tax.value)}</strong>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
            
            <DRELine label="(=) Receita Líquida" value={dre.receitaLiquida} percent={formatPercent(dre.receitaBruta > 0 ? dre.receitaLiquida / dre.receitaBruta : 0)} isSubtotal={true} />
            
            <div className="pt-2 mt-2 border-t border-dashed border-[#e0cbb2]">
                {/* Collapsible Custos Variáveis */}
                <div className="text-sm">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto_90px] sm:grid-cols-[minmax(0,1fr)_60px_110px] gap-x-1 sm:gap-x-2 items-center">
                        <button onClick={() => setShowVariaveisDetails(!showVariaveisDetails)} className="flex items-center gap-2 text-left p-1 -ml-1 rounded-md hover:bg-[#e0cbb2]/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff595a] min-w-0" aria-expanded={showVariaveisDetails}>
                            <span className="truncate">(-) Custos Variáveis</span>
                            <ChevronDownIcon className={`w-3.5 h-3.5 text-[#8c6d59] transition-transform duration-200 ${showVariaveisDetails ? 'rotate-180' : ''}`} />
                        </button>
                        <span className="font-mono text-xs text-right text-[#8c6d59]">{formatPercent(dre.receitaBruta > 0 ? -dre.custosVariaveis / dre.receitaBruta : 0)}</span>
                        <strong className="font-mono text-right text-[#5c3a21] truncate">{formatValue(-dre.custosVariaveis)}</strong>
                    </div>
                    {showVariaveisDetails && dre.custosVariaveisDetails && dre.custosVariaveisDetails.length > 0 && (
                        <div className="pl-4 mt-1 space-y-2 text-xs py-2">
                            {dre.custosVariaveisDetails.map(cost => {
                                if (cost.value === 0) return null;
                                return (
                                    <div key={cost.name} className="flex justify-between items-start">
                                        <div>
                                            <p className="text-[#8c6d59] font-medium">{cost.name}</p>
                                            <p className="text-[#8c6d59]/80 text-[10px] leading-tight max-w-[200px]">{cost.details}</p>
                                        </div>
                                        <strong className="font-mono text-right text-[#5c3a21] flex-shrink-0 pl-2">{formatValue(cost.value)}</strong>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-[minmax(0,1fr)_auto_90px] sm:grid-cols-[minmax(0,1fr)_60px_110px] gap-x-1 sm:gap-x-2 items-baseline text-sm font-semibold mt-2">
                    <span className="truncate">(=) Margem de Contribuição</span>
                    <span className="font-mono text-xs text-right text-[#8c6d59]">{formatPercent(dre.margemContribuicaoPercent)}</span>
                    <strong className="font-mono text-right text-[#5c3a21] truncate">{formatValue(dre.margemContribuicao)}</strong>
                </div>
            </div>

            <div className="pt-2 mt-2 border-t border-dashed border-[#e0cbb2]">
                <DRELine label="(-) Custos Fixos" value={-dre.custosFixos} percent={formatPercent(dre.receitaBruta > 0 ? -dre.custosFixos / dre.receitaBruta : 0)} />
                <DRELine label="(=) EBIT" value={dre.ebit} percent={formatPercent(dre.receitaBruta > 0 ? dre.ebit / dre.receitaBruta : 0)} isSubtotal={true} />
            </div>

            <div className="pt-2 mt-2 border-t border-dashed border-[#e0cbb2]">
                 {/* Collapsible Impostos s/ Resultado */}
                <div className="text-sm">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto_90px] sm:grid-cols-[minmax(0,1fr)_60px_110px] gap-x-1 sm:gap-x-2 items-center">
                        <button onClick={() => setShowResultadoDetails(!showResultadoDetails)} className="flex items-center gap-2 text-left p-1 -ml-1 rounded-md hover:bg-[#e0cbb2]/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff595a] min-w-0" aria-expanded={showResultadoDetails}>
                            <span className="truncate">(-) Impostos s/ Resultado</span>
                            <ChevronDownIcon className={`w-3.5 h-3.5 text-[#8c6d59] transition-transform duration-200 ${showResultadoDetails ? 'rotate-180' : ''}`} />
                        </button>
                        <span className="font-mono text-xs text-right text-[#8c6d59]">{formatPercent(dre.receitaBruta > 0 ? -dre.impostosSobreResultado / dre.receitaBruta : 0)}</span>
                        <strong className="font-mono text-right text-[#5c3a21] truncate">{formatValue(-dre.impostosSobreResultado)}</strong>
                    </div>
                    {showResultadoDetails && dre.impostosSobreResultadoDetails && dre.impostosSobreResultadoDetails.length > 0 && (
                        <div className="pl-4 mt-1 space-y-1 text-xs ml-1 py-1">
                            {dre.impostosSobreResultadoDetails.map(tax => {
                                const taxPercent = dre.receitaBruta > 0 ? tax.value / dre.receitaBruta : 0;
                                return (
                                    <div key={tax.name} className="grid grid-cols-[minmax(0,1fr)_auto_90px] sm:grid-cols-[minmax(0,1fr)_60px_110px] gap-x-1 sm:gap-x-2 items-baseline -ml-4">
                                        <span className="text-[#8c6d59]">{tax.name} ({tax.rate})</span>
                                        <span className="font-mono text-right text-[#8c6d59]">{formatPercent(taxPercent)}</span>
                                        <strong className="font-mono text-right text-[#5c3a21] truncate">{formatValue(tax.value)}</strong>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>

            <hr className="border-t border-[#e0cbb2] my-2" />
            
            <DRELine label="(=) Resultado Líquido" value={dre.resultadoLiquido} percent={formatPercent(dre.receitaBruta > 0 ? dre.resultadoLiquido / dre.receitaBruta : 0)} isFinal={true} customColorClass={resultadoColorClass} />

            {bep && (
                <div className="pt-2 mt-2 border-t border-dashed border-[#e0cbb2]">
                    <p className="flex items-center justify-center text-xs font-bold uppercase text-[#8c6d59] tracking-wider mb-2 text-center gap-1">
                        Ponto de Equilíbrio
                        <InfoTooltip text="O Ponto de Equilíbrio indica o mínimo de matrículas ou receita necessários para cobrir todos os custos (fixos e variáveis) e não ter prejuízo. É calculado como: Custos Fixos / Margem de Contribuição por Matrícula." />
                    </p>
                    <div className="text-xs text-center bg-white p-2 rounded-md border border-[#e0cbb2]">
                        {bep.alunos !== undefined && (
                             <p>Matrículas: <strong className="text-[#5c3a21]">{isFinite(bep.alunos) ? `${formatNumber(bep.alunos)}` : 'N/A'}</strong></p>
                        )}
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
        </div>
    );
};


export const OperationalSimulator = ({ 
    scenarios, 
    partnershipModel, 
    setPartnershipModel, 
    resetPartnershipModel,
    partnershipModelDefault,
    simulationYear, 
    variableCosts, 
    schoolTaxParams, 
    setSchoolTaxParams,
    resetSchoolTaxParams,
    schoolTaxParamsDefault
}) => {
    const { useMemo, useEffect, useRef } = React;
    
    const [selectedScenarioIds, setSelectedScenarioIds, resetSelectedScenarioIds] = usePersistentState('sim-op-selectedIds', []);
    const selectAllCheckboxRef = useRef(null);

    const [costoEspecialistaPorSessao, setCostoEspecialistaPorSessao, resetCostoEspecialistaPorSessao] = usePersistentState('sim-op-costoEspecialista', OP_SIM_DEFAULTS.COSTO_ESPECIALISTA);
    const [costoNexialista, setCostoNexialista, resetCostoNexialista] = usePersistentState('sim-op-costoNexialista', OP_SIM_DEFAULTS.COSTO_NEXIALISTA);

    const [fazerState, setFazerState] = usePersistentState('sim-op-fazerState', {
        custoInstrutor: 0,
        creditGeneratingCosts: 0,
    });
    
    const handleFazerChange = (field, value) => {
        setFazerState(prev => ({ ...prev, [field]: value }));
    };
    
    const handleTaxParamsChange = (field, value) => {
        setSchoolTaxParams(prev => ({ ...prev, [field]: value }));
    };

    const handlePartnershipModelChange = (field, value) => {
        setPartnershipModel(prev => {
            const newState = { ...prev, [field]: value };
            if (field === 'model') {
                if (value === 'Entrada') {
                    newState.schoolPercentage = 20;
                    newState.saasFee = 0;
                } else if (value === 'Escala') {
                    newState.schoolPercentage = 30;
                    newState.saasFee = 2000;
                }
            }
            return newState;
        });
    };

    const [comprarState, setComprarState, resetComprarState] = usePersistentState('sim-op-comprarState', OP_SIM_DEFAULTS.COMPRAR_STATE);
    
    const handleComprarChange = (field, value) => {
        setComprarState(prev => ({ ...prev, [field]: value }));
    };
    
    useEffect(() => {
        if (scenarios && selectedScenarioIds.length === 0) {
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
                // FIX: 'id' was not defined in this scope. Changed to 'scenarioId' to correctly add the new ID to the array.
                : [...prev, scenarioId]
        );
    };

    const uniqueSchools = useMemo(() => {
        if (!scenarios) return [];
        const schools = new Set(scenarios.map(s => s.school));
        return Array.from(schools);
    }, [scenarios]);

    const handleSelectAll = () => {
        setSelectedScenarioIds(scenarios.map(s => s.id));
    };

    const handleDeselectAll = () => {
        setSelectedScenarioIds([]);
    };
    
    const handleSelectAllChange = (e) => {
        if (e.target.checked) {
            handleSelectAll();
        } else {
            handleDeselectAll();
        }
    };
    
    const handleSelectBySchool = (school) => {
        const schoolScenarioIds = scenarios
            .filter(s => s.school === school)
            .map(s => s.id);
        setSelectedScenarioIds(schoolScenarioIds);
    };

    const filteredScenarios = useMemo(() => {
        return scenarios.filter(s => selectedScenarioIds.includes(s.id));
    }, [scenarios, selectedScenarioIds]);
    
    const { totalRevenue, totalTurmas, totalStudents } = useMemo(() => {
        if (!filteredScenarios || filteredScenarios.length === 0) {
            return { totalRevenue: 0, totalTurmas: 0, totalStudents: 0 };
        }
        return filteredScenarios.reduce((acc, scenario) => {
            acc.totalRevenue += scenario.avgStudents * scenario.unitPrice;
            acc.totalStudents += scenario.avgStudents;
            acc.totalTurmas += scenario.turmas || 0; // Correctly sum the 'turmas' property from each scenario
            
            return acc;
        }, { totalRevenue: 0, totalTurmas: 0, totalStudents: 0 });
    }, [filteredScenarios]);

    const parseFoodCostsFromName = (productName) => {
        const lowerName = productName.toLowerCase();
        let numLunches = 0;
        let numSnacks = 0;

        if (lowerName.includes("fundamental - b1") || lowerName.includes("fundamental - b2")) {
            return { numLunches: 0, numSnacks: 0 };
        }

        if (lowerName.includes("+ almoço")) {
            numLunches = 1;
        }
        if (lowerName.includes("+ 1 lanche")) {
            numSnacks = 1;
        } else if (lowerName.includes("+ 2 lanches")) {
            numSnacks = 2;
        }
        return { numLunches, numSnacks };
    };
    
    const variableCostDetails = useMemo(() => {
        if (!filteredScenarios || filteredScenarios.length === 0) {
            return {
                totalAlimentacaoCost: 0,
                totalCostoEspecialista: 0,
                alimentacaoDetails: 'N/A',
                especialistaDetails: 'N/A',
                hasSpecialistComponents: false,
            };
        }
    
        const hasSpecialistComponents = filteredScenarios.some(s => s.specialistBudgetPerDay > 0);
    
        let totalLunchesPerMonth = 0;
        let totalSnacksPerMonth = 0;
    
        const totalAlimentacaoCost = filteredScenarios.reduce((totalCost, scenario) => {
            const { numLunches, numSnacks } = parseFoodCostsFromName(scenario.productName);
            const dailyFoodCost = (numLunches * variableCosts.almoco) + (numSnacks * variableCosts.lanche);
            const weeklyFoodCost = dailyFoodCost * scenario.frequency;
            const monthlyFoodCost = weeklyFoodCost * WEEKS_PER_MONTH * scenario.avgStudents;
    
            const monthlyLunchesForScenario = numLunches * scenario.frequency * WEEKS_PER_MONTH * scenario.avgStudents;
            const monthlySnacksForScenario = numSnacks * scenario.frequency * WEEKS_PER_MONTH * scenario.avgStudents;
            totalLunchesPerMonth += monthlyLunchesForScenario;
            totalSnacksPerMonth += monthlySnacksForScenario;
    
            return totalCost + monthlyFoodCost;
        }, 0);
    
        const totalCostoEspecialista = filteredScenarios.reduce((total, s) => {
            if (s.totalSpecialistTurmasPerWeek && s.totalSpecialistTurmasPerWeek > 0) {
                // Nova lógica: Custo Mensal = (Nº sessões/semana) x (Custo Mensal por Sessão Semanal)
                const monthlyCost = s.totalSpecialistTurmasPerWeek * costoEspecialistaPorSessao;
                return total + monthlyCost;
            }
            return total;
        }, 0);
    
        const formatCompactCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    
        const alimentacaoDetails = `(${totalLunchesPerMonth.toFixed(0)} almoços × ${formatCompactCurrency(variableCosts.almoco)}) + (${totalSnacksPerMonth.toFixed(0)} lanches × ${formatCompactCurrency(variableCosts.lanche)})`;
        
        const especialistaDetails = hasSpecialistComponents
            ? `Cálculo: (Total de Sessões de Especialista/Semana) × (Custo Mensal por Sessão Semanal).`
            : 'N/A';
    
        return { totalAlimentacaoCost, totalCostoEspecialista, alimentacaoDetails, especialistaDetails, hasSpecialistComponents };
    }, [filteredScenarios, variableCosts, costoEspecialistaPorSessao]);
    
    const { numNexialistas, custoFixoTotalNexialistas } = useMemo(() => {
        let maxNexialistsNeeded = 0;

        const allSlots: Record<string, { componentId: string, studentCount: number }[]> = {}; // { "Seg-8:00": [turmas], ... }

        filteredScenarios.forEach(scenario => {
            if (!scenario.schedule) return;
            Object.entries(scenario.schedule).forEach(([day, daySchedule]) => {
                Object.entries(daySchedule).forEach(([slot, turmasInSlot]) => {
                    const key = `${day}-${slot}`;
                    if (!allSlots[key]) {
                        allSlots[key] = [];
                    }
                    allSlots[key].push(...(turmasInSlot as { componentId: string, studentCount: number }[]));
                });
            });
        });

        Object.values(allSlots).forEach((turmasInSlot) => {
            const ocioVivoTurmasCount = turmasInSlot.filter(t => t.componentId === OCIO_VIVO_ID).length;
            if (ocioVivoTurmasCount > maxNexialistsNeeded) {
                maxNexialistsNeeded = ocioVivoTurmasCount;
            }
        });

        const custoTotal = maxNexialistsNeeded * costoNexialista;
        
        return { 
            numNexialistas: maxNexialistsNeeded, 
            custoFixoTotalNexialistas: custoTotal,
        };
    }, [filteredScenarios, costoNexialista]);

    useEffect(() => {
        const totalVariableCostsForCredit = variableCostDetails.totalAlimentacaoCost + variableCostDetails.totalCostoEspecialista;
        handleFazerChange('creditGeneratingCosts', totalVariableCostsForCredit + fazerState.custoInstrutor);
    }, [variableCostDetails, fazerState.custoInstrutor]);

    useEffect(() => {
        handleFazerChange('custoInstrutor', custoFixoTotalNexialistas);
    }, [custoFixoTotalNexialistas]);

    const { labirintarBaseRevenue, labirintarWeightedAvgPrice } = useMemo(() => {
        if (!filteredScenarios || filteredScenarios.length === 0) {
            return { labirintarBaseRevenue: 0, labirintarWeightedAvgPrice: 0 };
        }
        let totalRevenue = 0;
        let totalStudents = 0;
        filteredScenarios.forEach(s => {
            const basePrice = labirintarPriceMatrix[s.frequency] || 0;
            const priceMultiplier = (s.specialistBudgetPerDay || 0) / 2.0;
            const adjustedPrice = basePrice * priceMultiplier;
            
            totalRevenue += s.avgStudents * adjustedPrice;
            totalStudents += s.avgStudents;
        });
        const weightedAvgPrice = totalStudents > 0 ? totalRevenue / totalStudents : 0;
        return { labirintarBaseRevenue: totalRevenue, labirintarWeightedAvgPrice: weightedAvgPrice };
    }, [filteredScenarios]);
    
    useEffect(() => {
        setComprarState(prev => ({ ...prev, pvuLabirintar: labirintarWeightedAvgPrice }));
    }, [labirintarWeightedAvgPrice]);

    const fazerResult = useMemo(() => {
        const receitaBruta = totalRevenue;
        const { totalAlimentacaoCost, totalCostoEspecialista, alimentacaoDetails, especialistaDetails } = variableCostDetails;
        const custosVariaveis = totalAlimentacaoCost + totalCostoEspecialista;
        const custosFixos = fazerState.custoInstrutor;
        const custosTotais = custosVariaveis + custosFixos;
        
        const taxResult = calculateTax({
            simulationYear: simulationYear,
            regime: schoolTaxParams.regime,
            receita: totalRevenue,
            custo: custosTotais,
            presuncao: schoolTaxParams.presuncao,
            pat: schoolTaxParams.pat,
            cnaeCode: schoolTaxParams.cnaeCode,
            creditGeneratingCosts: fazerState.creditGeneratingCosts,
        });
        
        const impostosSobreReceitaDetails = taxResult.breakdown.filter(i => i.category === 'receita');
        const impostosSobreResultadoDetails = taxResult.breakdown.filter(i => i.category === 'resultado');
        const impostosSobreReceita = impostosSobreReceitaDetails.reduce((sum, i) => sum + i.value, 0);
        const impostosSobreResultado = impostosSobreResultadoDetails.reduce((sum, i) => sum + i.value, 0);

        const receitaLiquida = receitaBruta - impostosSobreReceita;
        const margemContribuicao = receitaLiquida - custosVariaveis;
        const margemContribuicaoPercent = receitaBruta > 0 ? margemContribuicao / receitaBruta : 0;
        const ebit = margemContribuicao - custosFixos;
        const resultadoLiquido = ebit - impostosSobreResultado;
        
        const mcUnitaria = totalStudents > 0 ? margemContribuicao / totalStudents : 0;
        const bepAlunosCalculado = mcUnitaria > 0 ? custosFixos / mcUnitaria : Infinity;
        const bepAlunos = isFinite(bepAlunosCalculado) ? Math.ceil(bepAlunosCalculado) : Infinity;
        const receitaPorAluno = totalStudents > 0 ? receitaBruta / totalStudents : 0;
        const bepReceita = isFinite(bepAlunos) ? bepAlunos * receitaPorAluno : Infinity;

        return {
            dre: {
                receitaBruta,
                impostosSobreReceita,
                impostosSobreReceitaDetails,
                receitaLiquida,
                custosVariaveis,
                custosVariaveisDetails: [
                    { name: 'Custo Alimentação', value: totalAlimentacaoCost, details: alimentacaoDetails },
                    { name: 'Custo Educador Especialista', value: totalCostoEspecialista, details: especialistaDetails }
                ],
                margemContribuicao,
                margemContribuicaoPercent,
                custosFixos,
                ebit,
                impostosSobreResultado,
                impostosSobreResultadoDetails,
                resultadoLiquido,
            },
            bep: {
                alunos: bepAlunos,
                receita: bepReceita
            },
            unitEconomics: {
                mcPorMatricula: totalStudents > 0 ? margemContribuicao / totalStudents : 0
            }
        };
    }, [totalRevenue, fazerState, variableCostDetails, simulationYear, totalStudents, schoolTaxParams]);

    const comprarResult = useMemo(() => {
        const comprarBaseRevenue = comprarState.pvuLabirintar !== labirintarWeightedAvgPrice
            ? comprarState.pvuLabirintar * totalStudents
            : labirintarBaseRevenue;

        const receitaBruta = comprarBaseRevenue * (partnershipModel.schoolPercentage / 100);
        const custosVariaveis = variableCostDetails.totalAlimentacaoCost;
        const custosFixos = partnershipModel.model === 'Escala' ? partnershipModel.saasFee : 0;
        const custosTotais = custosVariaveis + custosFixos;

        const taxResult = calculateTax({
            simulationYear: simulationYear,
            regime: schoolTaxParams.regime,
            receita: receitaBruta,
            custo: custosTotais,
            presuncao: schoolTaxParams.presuncao,
            pat: schoolTaxParams.pat,
            cnaeCode: schoolTaxParams.cnaeCode,
            creditGeneratingCosts: custosTotais,
        });
        
        const impostosSobreReceitaDetails = taxResult.breakdown.filter(i => i.category === 'receita');
        const impostosSobreResultadoDetails = taxResult.breakdown.filter(i => i.category === 'resultado');
        const impostosSobreReceita = impostosSobreReceitaDetails.reduce((sum, i) => sum + i.value, 0);
        const impostosSobreResultado = impostosSobreResultadoDetails.reduce((sum, i) => sum + i.value, 0);

        const receitaLiquida = receitaBruta - impostosSobreReceita;
        const margemContribuicao = receitaLiquida - custosVariaveis;
        const margemContribuicaoPercent = receitaBruta > 0 ? margemContribuicao / receitaBruta : 0;
        const ebit = margemContribuicao - custosFixos;
        const resultadoLiquido = ebit - impostosSobreResultado;

        const mcUnitaria = totalStudents > 0 ? margemContribuicao / totalStudents : 0;
        const bepAlunosCalculado = mcUnitaria > 0 ? custosFixos / mcUnitaria : Infinity;
        const bepAlunos = isFinite(bepAlunosCalculado) ? Math.ceil(bepAlunosCalculado) : Infinity;
        const receitaPorAluno = totalStudents > 0 ? receitaBruta / totalStudents : 0;
        const bepReceita = isFinite(bepAlunos) ? bepAlunos * receitaPorAluno : Infinity;

        return {
             dre: {
                receitaBruta,
                impostosSobreReceita,
                impostosSobreReceitaDetails,
                receitaLiquida,
                custosVariaveis,
                 custosVariaveisDetails: [
                    { name: 'Custo Alimentação', value: variableCostDetails.totalAlimentacaoCost, details: variableCostDetails.alimentacaoDetails }
                ],
                margemContribuicao,
                margemContribuicaoPercent,
                custosFixos,
                ebit,
                impostosSobreResultado,
                impostosSobreResultadoDetails,
                resultadoLiquido,
            },
            bep: {
                alunos: bepAlunos,
                receita: bepReceita
            },
            unitEconomics: {
                mcPorMatricula: totalStudents > 0 ? margemContribuicao / totalStudents : 0
            }
        };
    }, [comprarState, partnershipModel, variableCostDetails, simulationYear, totalStudents, labirintarBaseRevenue, labirintarWeightedAvgPrice, schoolTaxParams]);

    const cnaeOptions = useMemo(() => cnaes.map(c => ({
        value: c.cnae,
        label: `${c.cnae} - ${c.descricao}`
    })), []);
    
    const diferencaResultado = comprarResult.dre.resultadoLiquido - fazerResult.dre.resultadoLiquido;

    return (
        <div className="mt-4">
            <div className="max-w-5xl mx-auto">
                <h2 className="text-xl font-bold text-center mb-2 text-[#5c3a21]">Análise Fazer vs. Comprar</h2>
                <p className="text-center text-[#8c6d59] mb-8 max-w-3xl mx-auto">
                    Compare o resultado financeiro de operar o extracurricular internamente versus firmar uma parceria para o ano de {simulationYear}.
                </p>
                
                <div className="max-w-4xl mx-auto mb-8">
                  <FormControl 
                    label="Cenários a Analisar">
                    {scenarios.length > 0 ? (
                        <div className="bg-white p-4 rounded-md border border-[#e0cbb2] space-y-3">
                            <div className="flex justify-between items-center pb-2 border-b border-[#e0cbb2] flex-wrap gap-y-2">
                                <p className="text-sm font-semibold text-[#5c3a21] mr-4">
                                    {selectedScenarioIds.length} de {scenarios.length} selecionado(s)
                                </p>
                                <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Filtros de seleção de cenário">
                                    <button onClick={handleSelectAll} className="text-xs font-medium text-[#ff595a] hover:underline">Grupo BR</button>
                                    {uniqueSchools.map((school: string) => (
                                        <React.Fragment key={school}>
                                            <span className="text-gray-300">|</span>
                                            <button onClick={() => handleSelectBySchool(school)} className="text-xs font-medium text-[#ff595a] hover:underline">
                                                {school}
                                            </button>
                                        </React.Fragment>
                                    ))}
                                    <span className="text-gray-300">|</span>
                                    <button onClick={handleDeselectAll} className="text-xs font-medium text-[#8c6d59] hover:underline">Limpar</button>
                                </div>
                            </div>
                            <div className="max-h-60 overflow-y-auto pr-2">
                               <div className="grid grid-cols-[auto_1fr_60px_60px_60px_90px_100px] gap-x-4 items-center font-bold text-sm text-[#8c6d59] border-b border-[#bf917f] pb-2 mb-2 px-2 sticky top-0 bg-white z-10">
                                   <input
                                        type="checkbox"
                                        ref={selectAllCheckboxRef}
                                        onChange={handleSelectAllChange}
                                        className="h-4 w-4 rounded border-gray-400 text-[#ff595a] focus:ring-[#ff595a]"
                                        aria-label="Selecionar todos os cenários"
                                    />
                                   <div className="text-left">Escola / Produto</div>
                                   <div className="text-center">Freq.</div>
                                   <div className="text-center">Turmas</div>
                                   <div className="text-center">Alunos</div>
                                   <div className="text-right">Preço</div>
                                   <div className="text-right">Receita</div>
                               </div>
                               <div className="space-y-2">
                                    {scenarios.map(s => (
                                        <label key={s.id} className="grid grid-cols-[auto_1fr_60px_60px_60px_90px_100px] gap-x-4 items-start bg-white p-2 rounded-md text-sm hover:bg-[#f3f0e8] transition-colors cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectedScenarioIds.includes(s.id)}
                                                onChange={() => handleScenarioSelectionChange(s.id)}
                                                className="h-4 w-4 rounded border-gray-300 text-[#ff595a] focus:ring-[#ff595a] mt-1"
                                                aria-label={`Selecionar cenário ${s.productName}`}
                                            />
                                            <div className="min-w-0">
                                                <p className="font-semibold text-[#5c3a21]">{s.school}</p>
                                                <p className="text-xs text-[#8c6d59] truncate">{s.productName}</p>
                                                <div className="text-xs text-[#8c6d59] mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                                                    <span><strong className="font-medium">{s.avgStudents}</strong> alunos</span>
                                                    <span className="text-gray-300">|</span>
                                                    <span>Quórum: <strong className="font-medium">{s.minCapacity || '-'}</strong></span>
                                                    <span className="text-gray-300">|</span>
                                                    <span>Cap.: <strong className="font-medium">{s.maxCapacity || '-'}</strong></span>
                                                    <span className="text-gray-300">|</span>
                                                    <span>Espec./Dia: <strong className="font-medium">{s.specialistBudgetPerDay !== undefined ? s.specialistBudgetPerDay : '-'}</strong></span>
                                                </div>
                                            </div>
                                            <div className="text-center font-medium text-[#5c3a21] pt-1">{s.frequency}x</div>
                                            <div className="text-center font-medium text-[#5c3a21] pt-1">{s.turmas || '-'}</div>
                                            <div className="text-center font-medium text-[#5c3a21] pt-1">{s.avgStudents}</div>
                                            <div className="text-right font-medium text-[#5c3a21] pt-1">{formatCurrency(s.unitPrice)}</div>
                                            <div className="text-right font-medium text-[#5c3a21] pt-1">{formatCurrency(s.unitPrice * s.avgStudents)}</div>
                                        </label>
                                    ))}
                               </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-center text-[#8c6d59] p-4 bg-white rounded-md border border-dashed border-[#e0cbb2]">
                            Nenhum cenário de demanda foi salvo. Adicione cenários na aba "Jam Session Studio".
                        </p>
                    )}
                  </FormControl>
                   <p className="text-xs text-center text-[#8c6d59] mt-2 space-y-1">
                        <span>Analisando <strong>{filteredScenarios.length}</strong> cenário(s) com:</span><br/>
                        <span><strong>{totalStudents}</strong> Aluno(s)</span> | 
                        <span> <strong>{Math.round(totalTurmas)}</strong> Turmas/Mês</span> | 
                        <span> Receita Total: <strong>{formatCurrency(totalRevenue)}</strong></span>
                    </p>
                </div>
                
                <div className="max-w-4xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-8 mt-8">
                        <ScenarioCard 
                            title="Cenário 1: Fazer" 
                            subtitle="Operação internalizada pela escola."
                            children={<>
                                <h4 className="font-semibold text-sm uppercase tracking-wider text-[#8c6d59] border-b border-[#e0cbb2] pb-2 mb-4">PARÂMETROS DE RESULTADO</h4>
                                
                                <h5 className="font-semibold text-xs uppercase tracking-wider text-[#8c6d59] mt-4">Parâmetros de Custos Variáveis</h5>
                                {variableCostDetails.hasSpecialistComponents && (
                                    <FormControl 
                                        label="Custo Mensal por Sessão Semanal (Especialista)"
                                        description="Custo mensal pago a um parceiro por uma sessão semanal fixa (ex: R$150/mês para ensinar toda segunda-feira às 10h)."
                                        className="max-w-sm mx-auto">
                                        <NumberInput value={costoEspecialistaPorSessao} onChange={setCostoEspecialistaPorSessao} prefix="R$" formatAsCurrency={true} min={0} max={1000} step={1} defaultValue={OP_SIM_DEFAULTS.COSTO_ESPECIALISTA} onReset={resetCostoEspecialistaPorSessao}/>
                                    </FormControl>
                                )}

                                <h5 className="font-semibold text-xs uppercase tracking-wider text-[#8c6d59] mt-6">Parâmetros de Custos Fixos</h5>
                                <FormControl
                                    label="Custo Mensal Nexialista"
                                    description="Custo fixo mensal por educador nexialista (CLT), responsável pelo 'Ócio Vivo'."
                                    className="max-w-sm mx-auto">
                                    <NumberInput value={costoNexialista} onChange={setCostoNexialista} prefix="R$" formatAsCurrency={true} min={0} max={9999} step={1} defaultValue={OP_SIM_DEFAULTS.COSTO_NEXIALISTA} onReset={resetCostoNexialista} />
                                </FormControl>
                                <FormControl
                                    label="Custo Fixo Total com Educadores"
                                    description={`Calculado com base em ${numNexialistas} nexialista(s) para cobrir o pico de demanda simultânea por 'Ócio Vivo'. Pode ser editado.`}
                                    className="max-w-sm mx-auto">
                                    <NumberInput value={fazerState.custoInstrutor} onChange={v => handleFazerChange('custoInstrutor', v)} prefix="R$" formatAsCurrency={true} min={0} max={99999} step={1} />
                                </FormControl>

                                <h4 className="font-semibold text-sm uppercase tracking-wider text-[#8c6d59] border-b border-[#e0cbb2] pb-2 my-4 pt-4">Parâmetros Tributários</h4>
                                <FormControl 
                                    label="Regime Tributário">
                                    {/* FIX: Add defaultValue and onReset props to Select component to fix prop type error. */}
                                    <Select value={schoolTaxParams.regime} onChange={v => handleTaxParamsChange('regime', v)} options={Object.values(TaxRegime)} defaultValue={schoolTaxParamsDefault.regime} onReset={resetSchoolTaxParams} />
                                </FormControl>
                                 <FormControl 
                                    label="Atividade (CNAE)">
                                    
                                        <select value={schoolTaxParams.cnaeCode} onChange={e => handleTaxParamsChange('cnaeCode', e.target.value)} className="w-full rounded-md border-[#e0cbb2] bg-white text-[#5c3a21] shadow-sm focus:border-[#ff595a] focus:ring-1 focus:ring-[#ff595a] px-3 py-2">
                                        {cnaeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                        </select>
                                    
                                </FormControl>
                                {schoolTaxParams.regime === TaxRegime.LUCRO_PRESUMIDO && (
                                    <FormControl 
                                        label="Alíquota de Presunção">
                                        <NumberInput value={schoolTaxParams.presuncao} onChange={v => handleTaxParamsChange('presuncao', v)} prefix="%" min={0} max={100} step={1} defaultValue={schoolTaxParamsDefault.presuncao} onReset={resetSchoolTaxParams} />
                                    </FormControl>
                                )}
                                {schoolTaxParams.regime === TaxRegime.LUCRO_REAL && (
                                    <>
                                        <FormControl 
                                            label="Custos Geradores de Crédito (Calculado)"
                                            description="Soma dos custos fixos (educadores) e variáveis. Pode ser editado.">
                                            <NumberInput value={fazerState.creditGeneratingCosts} onChange={v => handleFazerChange('creditGeneratingCosts', v)} prefix="R$" formatAsCurrency={true} min={0} max={999999} step={1} />
                                        </FormControl>
                                        <FormControl 
                                            label="Optante do PAT?" 
                                            description="Reduz o IRPJ devido em 4%.">
                                            
                                                <div className="flex justify-start">
                                                    <Toggle enabled={schoolTaxParams.pat} onChange={v => handleTaxParamsChange('pat', v)} />
                                                </div>
                                            
                                        </FormControl>
                                    </>
                                )}
                               <DREDisplay dre={fazerResult.dre} bep={fazerResult.bep} unitEconomics={fazerResult.unitEconomics} />
                            </>}
                        />

                        <ScenarioCard 
                            title="Cenário 2: Comprar" 
                            subtitle="Parceria estratégica com a LABirintar."
                            children={<>
                                <h4 className="font-semibold text-sm uppercase tracking-wider text-[#8c6d59] border-b border-[#e0cbb2] pb-2 mb-4">Modelo de Remuneração da Escola</h4>
                                 <FormControl 
                                    label="Modelo de Remuneração"
                                    className="max-w-sm mx-auto">
                                    <Select 
                                        value={partnershipModel.model} 
                                        onChange={v => handlePartnershipModelChange('model', v)} 
                                        options={['Entrada', 'Escala']}
                                        defaultValue={partnershipModelDefault.model}
                                        onReset={resetPartnershipModel} 
                                    />
                                </FormControl>
                                <FormControl 
                                    label="Percentual da Receita para Escola"
                                    className="max-w-sm mx-auto">
                                    <NumberInput value={partnershipModel.schoolPercentage} onChange={v => handlePartnershipModelChange('schoolPercentage', v)} prefix="%" min={0} max={100} step={1} defaultValue={partnershipModelDefault.schoolPercentage} onReset={resetPartnershipModel} />
                                </FormControl>
                                {partnershipModel.model === 'Escala' && (
                                    <FormControl 
                                        label="Taxa de SaaS LABirintar (Custo Fixo)"
                                        description="Valor mensal pago pela escola à LABirintar no modelo Escala."
                                        className="max-w-sm mx-auto">
                                        <NumberInput value={partnershipModel.saasFee} onChange={v => handlePartnershipModelChange('saasFee', v)} prefix="R$" formatAsCurrency={true} min={0} max={10000} step={100} defaultValue={partnershipModelDefault.saasFee} onReset={resetPartnershipModel} />
                                    </FormControl>
                                )}
                                <FormControl 
                                    label="Ticket Médio (TM) Família"
                                    description="TM Família da LABirintar, ajustado pelo nº de especialidades. O TM base é para 2 especialidades/dia. Pode ser editado."
                                    className="max-w-sm mx-auto">
                                    <NumberInput value={comprarState.pvuLabirintar} onChange={v => handleComprarChange('pvuLabirintar', v)} prefix="R$" formatAsCurrency={true} min={0} max={999999} step={1} defaultValue={OP_SIM_DEFAULTS.COMPRAR_STATE.pvuLabirintar} onReset={resetComprarState}/>
                                </FormControl>
                                
                                <h4 className="font-semibold text-sm uppercase tracking-wider text-[#8c6d59] border-b border-[#e0cbb2] pb-2 my-4 pt-4">Parâmetros Tributários da Escola</h4>
                                <p className="text-xs text-center text-[#8c6d59] p-2 bg-[#f3f0e8] rounded-md border border-dashed border-[#e0cbb2]">
                                    Os parâmetros de Regime Tributário, CNAE e Alíquota de Presunção são herdados do cenário "Fazer" para garantir consistência na análise da mesma entidade (escola).
                                </p>
                                 <DREDisplay dre={comprarResult.dre} bep={comprarResult.bep} unitEconomics={comprarResult.unitEconomics} />
                            </>}
                        />
                    </div>
                </div>

                 <div className="mt-8 bg-white p-6 rounded-2xl shadow-xl border border-[#e0cbb2]">
                    <div className="flex justify-between items-center gap-4">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-xl font-bold text-[#5c3a21] truncate">Análise Comparativa de Resultado</h3>
                        </div>
                        <ExportToSheets />
                    </div>
                    <div className="mt-4 text-center">
                        {diferencaResultado > 0 ? (
                            <p className="text-lg break-words">
                                O cenário <strong>"Comprar"</strong> (Parceria LABirintar) é <strong className="text-green-600">{formatCurrency(diferencaResultado)}</strong> mais rentável por mês para a Escola.
                            </p>
                        ) : (
                             <p className="text-lg break-words">
                                O cenário <strong>"Fazer"</strong> (Operação Própria) é <strong className="text-red-600">{formatCurrency(Math.abs(diferencaResultado))}</strong> mais rentável por mês para a Escola.
                            </p>
                        )}
                         <p className="text-sm text-[#8c6d59] mt-2 max-w-2xl mx-auto">
                            Esta análise é puramente financeira. O cenário "Comprar" também elimina riscos operacionais, trabalhistas, de inadimplência e a complexidade da gestão, agregando valor estratégico não quantificado aqui.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};