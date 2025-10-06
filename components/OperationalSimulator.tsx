
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

const WEEKS_PER_MONTH = 4.3452381;

export const OperationalSimulator = ({ scenarios, partnershipModel, setPartnershipModel, simulationYear, variableCosts }) => {
    const { useState, useMemo, useEffect } = React;
    
    const [selectedScenarioIds, setSelectedScenarioIds] = useState([]);

    const [costoPrestadorPorHora, setCostoPrestadorPorHora] = useState(150);
    const [costoEstagiario, setCostoEstagiario] = useState(2001);

    const [fazerState, setFazerState] = useState({
        custoInstrutor: 0, // Agora será o custo fixo total calculado
        regime: TaxRegime.LUCRO_PRESUMIDO,
        cnaeCode: '85.12-1/00',
        creditGeneratingCosts: 0, // Será calculado a partir dos variáveis
        pat: false,
        presuncao: 32,
    });

    const handleFazerChange = (field, value) => {
        setFazerState(prev => ({ ...prev, [field]: value }));
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

    const [comprarState, setComprarState] = useState({
        pvuLabirintar: 0,
    });
    
    const handleComprarChange = (field, value) => {
        setComprarState(prev => ({ ...prev, [field]: value }));
    };
    
    useEffect(() => {
        setSelectedScenarioIds(scenarios.map(s => s.id));
    }, [scenarios]);

    const handleScenarioSelectionChange = (scenarioId) => {
        setSelectedScenarioIds(prev =>
            prev.includes(scenarioId)
                ? prev.filter(id => id !== scenarioId)
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
            acc.totalTurmas += Object.values(scenario.schedule).reduce((count: number, day) => count + Object.keys(day || {}).length, 0);
            acc.totalStudents += scenario.avgStudents;
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
    
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const variableCostDetails = useMemo(() => {
        if (!filteredScenarios || filteredScenarios.length === 0) {
            return {
                totalAlimentacaoCost: 0,
                totalCostoPrestador: 0,
                alimentacaoDetails: 'N/A',
                prestadorDetails: 'N/A'
            };
        }

        let totalLunchesPerMonth = 0;
        let totalSnacksPerMonth = 0;
        let totalFreqHoras = 0;

        const totalAlimentacaoCost = filteredScenarios.reduce((totalCost, scenario) => {
            const { numLunches, numSnacks } = parseFoodCostsFromName(scenario.productName);
            // This calculation is per-student, then multiplied by students.
            const dailyFoodCost = (numLunches * variableCosts.almoco) + (numSnacks * variableCosts.lanche);
            const weeklyFoodCost = dailyFoodCost * scenario.frequency;
            const monthlyFoodCost = weeklyFoodCost * WEEKS_PER_MONTH * scenario.avgStudents;

            // For details, we need the totals
            const monthlyLunchesForScenario = numLunches * scenario.frequency * WEEKS_PER_MONTH * scenario.avgStudents;
            const monthlySnacksForScenario = numSnacks * scenario.frequency * WEEKS_PER_MONTH * scenario.avgStudents;
            totalLunchesPerMonth += monthlyLunchesForScenario;
            totalSnacksPerMonth += monthlySnacksForScenario;

            return totalCost + monthlyFoodCost;
        }, 0);

        const totalCostoPrestador = filteredScenarios.reduce((total, scenario) => {
            const costPerStudent = scenario.frequency * costoPrestadorPorHora;
            totalFreqHoras += scenario.frequency * scenario.avgStudents;
            return total + (costPerStudent * scenario.avgStudents);
        }, 0);
        
        const formatCompactCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

        const alimentacaoDetails = `(${totalLunchesPerMonth.toFixed(0)} almoços × ${formatCompactCurrency(variableCosts.almoco)}) + (${totalSnacksPerMonth.toFixed(0)} lanches × ${formatCompactCurrency(variableCosts.lanche)})`;
        const prestadorDetails = `(${totalFreqHoras.toFixed(0)} mat./freq. × ${formatCompactCurrency(costoPrestadorPorHora)})`;

        return { totalAlimentacaoCost, totalCostoPrestador, alimentacaoDetails, prestadorDetails };
    }, [filteredScenarios, variableCosts, costoPrestadorPorHora]);
    
    const { numEstagiarios, custoFixoTotalEstagiarios } = useMemo(() => {
        const HORAS_ESTAGIARIO_SEMANA = 30;
        const HORAS_ESTAGIARIO_MES = HORAS_ESTAGIARIO_SEMANA * 4;
        
        // Assumimos que cada "turma" na contagem representa uma hora de aula.
        const numEstagiarios = Math.ceil(totalTurmas / HORAS_ESTAGIARIO_MES);
        const custoTotal = numEstagiarios * costoEstagiario;

        return { numEstagiarios, custoFixoTotalEstagiarios: custoTotal };
    }, [totalTurmas, costoEstagiario]);

    useEffect(() => {
        const totalVariableCostsForCredit = variableCostDetails.totalAlimentacaoCost + variableCostDetails.totalCostoPrestador;
        handleFazerChange('creditGeneratingCosts', totalVariableCostsForCredit);
    }, [variableCostDetails]);

    useEffect(() => {
        handleFazerChange('custoInstrutor', custoFixoTotalEstagiarios);
    }, [custoFixoTotalEstagiarios]);

    const { labirintarBaseRevenue, labirintarWeightedAvgPrice } = useMemo(() => {
        if (!filteredScenarios || filteredScenarios.length === 0) {
            return { labirintarBaseRevenue: 0, labirintarWeightedAvgPrice: 0 };
        }
        let totalRevenue = 0;
        let totalStudents = 0;
        filteredScenarios.forEach(s => {
            const price = labirintarPriceMatrix[s.frequency] || 0;
            totalRevenue += s.avgStudents * price;
            totalStudents += s.avgStudents;
        });
        const weightedAvgPrice = totalStudents > 0 ? totalRevenue / totalStudents : 0;
        return { labirintarBaseRevenue: totalRevenue, labirintarWeightedAvgPrice: weightedAvgPrice };
    }, [filteredScenarios]);
    
    useEffect(() => {
        // Update the editable input field with the calculated weighted average from LABirintar's table.
        // This value can be manually overridden by the user.
        setComprarState(prev => ({ ...prev, pvuLabirintar: labirintarWeightedAvgPrice }));
    }, [labirintarWeightedAvgPrice]);

    const formatCurrencyWithoutSymbol = (value) => {
        return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
    }

    const fazerResult = useMemo(() => {
        const receitaBruta = totalRevenue;
        const { totalAlimentacaoCost, totalCostoPrestador, alimentacaoDetails, prestadorDetails } = variableCostDetails;
        const custosVariaveis = totalAlimentacaoCost + totalCostoPrestador;
        const custosFixos = fazerState.custoInstrutor;
        const custosTotais = custosVariaveis + custosFixos;
        
        const taxResult = calculateTax({
            simulationYear: simulationYear,
            regime: fazerState.regime,
            receita: totalRevenue,
            custo: custosTotais,
            presuncao: fazerState.presuncao,
            pat: fazerState.pat,
            cnaeCode: fazerState.cnaeCode,
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
                    { name: 'Custo Prestador', value: totalCostoPrestador, details: prestadorDetails }
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
    }, [totalRevenue, fazerState, variableCostDetails, simulationYear, totalStudents]);

    const comprarResult = useMemo(() => {
        // The base revenue for the "Comprar" scenario is calculated from LABirintar's own price table.
        // If the user manually edits the "Ticket Médio" input, that edited value is used instead,
        // allowing for what-if analysis.
        const comprarBaseRevenue = comprarState.pvuLabirintar !== labirintarWeightedAvgPrice
            ? comprarState.pvuLabirintar * totalStudents
            : labirintarBaseRevenue;

        const receitaBruta = comprarBaseRevenue * (partnershipModel.schoolPercentage / 100);
        const custosVariaveis = variableCostDetails.totalAlimentacaoCost; // School still bears the variable costs (lunch, etc.)
        const custosFixos = partnershipModel.model === 'Escala' ? partnershipModel.saasFee : 0;
        const custosTotais = custosVariaveis + custosFixos;

        const taxResult = calculateTax({
            simulationYear: simulationYear,
            regime: fazerState.regime,
            receita: receitaBruta,
            custo: custosTotais,
            presuncao: fazerState.presuncao,
            pat: fazerState.pat,
            cnaeCode: fazerState.cnaeCode,
            creditGeneratingCosts: 0,
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
                alunos: 0,
                receita: 0
            },
            unitEconomics: {
                mcPorMatricula: totalStudents > 0 ? margemContribuicao / totalStudents : 0
            }
        };
    }, [comprarState, partnershipModel, variableCostDetails, simulationYear, totalStudents, labirintarBaseRevenue, labirintarWeightedAvgPrice, fazerState]);

    const cnaeOptions = useMemo(() => cnaes.map(c => ({
        value: c.cnae,
        label: `${c.cnae} - ${c.descricao}`
    })), []);
    
    const diferencaResultado = comprarResult.dre.resultadoLiquido - fazerResult.dre.resultadoLiquido;

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
    
        const resultadoColorClass = dre.resultadoLiquido >= 0 ? 'text-green-600' : 'text-[#5c3a21]';
        
        const ChevronDownIcon = ({ className = "w-4 h-4 transition-transform" }) => (
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
                
                <DRELine label="(=) Resultado Líquido" value={dre.resultadoLiquido} percent={formatPercent(dre.receitaBruta > 0 ? dre.resultadoLiquido / dre.receitaBruta : 0)} isFinal={true} customColorClass={resultadoColorClass.replace('#', 'e6cbe4')} />
    
                {bep && (
                    <div className="pt-2 mt-2 border-t border-dashed border-[#e0cbb2]">
                        <p className="text-xs font-bold uppercase text-[#8c6d59] tracking-wider mb-2 text-center">Ponto de Equilíbrio</p>
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

    return (
        <div className="mt-4">
            <div className="max-w-5xl mx-auto">
                <h2 className="text-2xl font-bold text-center mb-2 text-[#5c3a21]">Análise Fazer vs. Comprar</h2>
                <p className="text-center text-[#8c6d59] mb-8 max-w-3xl mx-auto">
                    Compare o resultado financeiro de operar o extracurricular internamente versus firmar uma parceria para o ano de {simulationYear}.
                </p>
                
                <div className="max-w-2xl mx-auto mb-8">
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
                                    {uniqueSchools.map(school => (
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
                            <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                                {scenarios.map(scenario => (
                                    <label key={scenario.id} className="flex items-center p-2 rounded-md hover:bg-[#f3f0e8] cursor-pointer transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={selectedScenarioIds.includes(scenario.id)}
                                            onChange={() => handleScenarioSelectionChange(scenario.id)}
                                            className="h-4 w-4 rounded border-gray-300 text-[#ff595a] focus:ring-[#ff595a]"
                                        />
                                        <div className="ml-3 text-sm">
                                            <span className="font-semibold text-[#5c3a21]">{scenario.school}</span> - <span>{scenario.productName}</span>
                                            <span className="text-[#8c6d59] ml-2">({scenario.avgStudents} alunos)</span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-center text-[#8c6d59] p-4 bg-white rounded-md border border-dashed border-[#e0cbb2]">
                            Nenhum cenário de demanda foi salvo ainda. Adicione cenários na aba "1. Configuração de Demanda".
                        </p>
                    )}
                  </FormControl>
                   <p className="text-xs text-center text-[#8c6d59] mt-2 space-y-1">
                        <span>Analisando <strong>{filteredScenarios.length}</strong> cenário(s) com:</span><br/>
                        <span><strong>{totalStudents}</strong> Aluno(s)</span> | 
                        <span> <strong>{totalTurmas}</strong> Turmas/Mês</span> | 
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
                                <FormControl 
                                    label="Custo Prestador (por hora/mês)"
                                    description="Valor pago ao parceiro por matrícula, por hora contratada na semana."
                                    className="max-w-sm mx-auto">
                                    <NumberInput value={costoPrestadorPorHora} onChange={setCostoPrestadorPorHora} prefix="R$" formatAsCurrency={true} min={0} max={1000} step={1} />
                                </FormControl>

                                <h5 className="font-semibold text-xs uppercase tracking-wider text-[#8c6d59] mt-6">Parâmetros de Custos Fixos</h5>
                                <FormControl
                                    label="Custo Mensal por Estagiário (CLT)"
                                    description="Base para cálculo do custo fixo total com instrutores."
                                    className="max-w-sm mx-auto">
                                    <NumberInput value={costoEstagiario} onChange={setCostoEstagiario} prefix="R$" formatAsCurrency={true} min={0} max={9999} step={1} />
                                </FormControl>
                                <FormControl
                                    label="Custo Fixo Total com Instrutores (Calculado)"
                                    description={`Baseado em ${numEstagiarios} estagiário(s) para cobrir ${totalTurmas} horas/turma por mês. Pode ser editado.`}
                                    className="max-w-sm mx-auto">
                                    <NumberInput value={fazerState.custoInstrutor} onChange={v => handleFazerChange('custoInstrutor', v)} prefix="R$" formatAsCurrency={true} min={0} max={99999} step={1} />
                                </FormControl>

                                <h4 className="font-semibold text-sm uppercase tracking-wider text-[#8c6d59] border-b border-[#e0cbb2] pb-2 my-4 pt-4">Parâmetros Tributários</h4>
                                <FormControl 
                                    label="Regime Tributário">
                                    <Select value={fazerState.regime} onChange={v => handleFazerChange('regime', v)} options={Object.values(TaxRegime)} />
                                </FormControl>
                                 <FormControl 
                                    label="Atividade (CNAE)">
                                    
                                        <select value={fazerState.cnaeCode} onChange={e => handleFazerChange('cnaeCode', e.target.value)} className="w-full rounded-md border-[#e0cbb2] bg-white text-[#5c3a21] shadow-sm focus:border-[#ff595a] focus:ring-1 focus:ring-[#ff595a] px-3 py-2">
                                        {cnaeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                        </select>
                                    
                                </FormControl>
                                {fazerState.regime === TaxRegime.LUCRO_PRESUMIDO && (
                                    <FormControl 
                                        label="Alíquota de Presunção">
                                        <NumberInput value={fazerState.presuncao} onChange={v => handleFazerChange('presuncao', v)} prefix="%" min={0} max={100} step={1} />
                                    </FormControl>
                                )}
                                {fazerState.regime === TaxRegime.LUCRO_REAL && (
                                    <>
                                        <FormControl 
                                            label="Custos Geradores de Crédito (Calculado)"
                                            description="Soma dos custos variáveis (alimentação + prestador). Pode ser editado.">
                                            <NumberInput value={fazerState.creditGeneratingCosts} onChange={v => handleFazerChange('creditGeneratingCosts', v)} prefix="R$" formatAsCurrency={true} min={0} max={999999} step={1} />
                                        </FormControl>
                                        <FormControl 
                                            label="Optante do PAT?" 
                                            description="Reduz o IRPJ devido em 4%.">
                                            
                                                <div className="flex justify-start">
                                                    <Toggle enabled={fazerState.pat} onChange={v => handleFazerChange('pat', v)} />
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
                                    <Select value={partnershipModel.model} onChange={v => handlePartnershipModelChange('model', v)} options={['Entrada', 'Escala']} />
                                </FormControl>
                                <FormControl 
                                    label="Percentual da Receita para Escola"
                                    className="max-w-sm mx-auto">
                                    <NumberInput value={partnershipModel.schoolPercentage} onChange={v => handlePartnershipModelChange('schoolPercentage', v)} prefix="%" min={0} max={100} step={1} />
                                </FormControl>
                                {partnershipModel.model === 'Escala' && (
                                    <FormControl 
                                        label="Taxa de SaaS LABirintar (Custo Fixo)"
                                        description="Valor mensal pago pela escola à LABirintar no modelo Escala."
                                        className="max-w-sm mx-auto">
                                        <NumberInput value={partnershipModel.saasFee} onChange={v => handlePartnershipModelChange('saasFee', v)} prefix="R$" formatAsCurrency={true} min={0} max={10000} step={100} />
                                    </FormControl>
                                )}
                                <FormControl 
                                    label="Ticket Médio (TM) Família"
                                    description="Informe o TM Família médio ponderado que a LABirintar cobrará. Calculado com base nos cenários selecionados, mas pode ser editado."
                                    className="max-w-sm mx-auto">
                                    <NumberInput value={comprarState.pvuLabirintar} onChange={v => handleComprarChange('pvuLabirintar', v)} prefix="R$" formatAsCurrency={true} min={0} max={999999} step={1} />
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
