import React from "react";
import { FormControl } from './FormControl.tsx';
import { NumberInput } from './NumberInput.tsx';
import { calculateTax } from '../services/taxCalculator.tsx';
import { TaxRegime } from '../types.tsx';
import { cnaes } from '../data/simplesNacional.tsx';
import { Select } from './Select.tsx';
import { Toggle } from './Toggle.tsx';
import { labirintarPriceMatrix } from '../data/tabelasDePreco.ts';
import { fixedCostsData } from '../data/fixedCosts.ts';
import { usePersistentState } from "../App.tsx";

const ECO_DEFAULTS = {
    TM_FAMILIA: 0,
    LABIRINTAR_STATE: {
        percentage: 20,
        operationalCosts: 5000,
        regime: TaxRegime.LUCRO_REAL,
        cnaeCode: '62.02-3/00',
        pat: false,
        contributionMargin: 40,
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
    SCHOOL_STATE: {
        percentage: 30,
    },
    PROVEDOR_STATE: {
        percentage: 15,
        operationalCosts: 1000,
        regime: TaxRegime.LUCRO_PRESUMIDO,
        cnaeCode: '74.90-1/04',
        presuncao: 32,
        pat: false,
    },
};

export const EcosystemSimulator = ({ scenarios, partnershipModel: initialPartnershipModel, simulationYear, schoolTaxParams }) => {
    const { useMemo, useEffect } = React;

    const [selectedScenarioIds, setSelectedScenarioIds, resetSelectedScenarioIds] = usePersistentState('sim-eco-selectedIds', []);
    const [tmFamilia, setTmFamilia, resetTmFamilia] = usePersistentState('sim-eco-tmFamilia', ECO_DEFAULTS.TM_FAMILIA);

    // Scenario selection logic
    useEffect(() => {
        if (scenarios && scenarios.length > 0 && selectedScenarioIds.length === 0) {
            setSelectedScenarioIds(scenarios.map(s => s.id));
        }
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

    const handleSelectAll = () => setSelectedScenarioIds(scenarios.map(s => s.id));
    const handleDeselectAll = () => setSelectedScenarioIds([]);
    const handleSelectBySchool = (school) => {
        const schoolScenarioIds = scenarios.filter(s => s.school === school).map(s => s.id);
        setSelectedScenarioIds(schoolScenarioIds);
    };
    
    const { totalRevenue: calculatedTotalRevenue, totalStudents } = useMemo(() => {
        if (!scenarios || scenarios.length === 0) return { totalRevenue: 0, totalStudents: 0 };
        
        const filteredScenarios = scenarios.filter(s => selectedScenarioIds.includes(s.id));
        
        const totalRevenue = filteredScenarios.reduce((acc, scenario) => {
            const familyPrice = labirintarPriceMatrix[scenario.frequency] || 0;
            return acc + (scenario.avgStudents * familyPrice);
        }, 0);

        const totalStudents = filteredScenarios.reduce((acc, scenario) => acc + scenario.avgStudents, 0);

        return { totalRevenue, totalStudents };
    }, [scenarios, selectedScenarioIds]);

    useEffect(() => {
        if(calculatedTotalRevenue > 0) {
            setTmFamilia(calculatedTotalRevenue);
        }
    }, [calculatedTotalRevenue]);


    const [labirintarState, setLabirintarState, resetLabirintarState] = usePersistentState('sim-eco-labirintarState', ECO_DEFAULTS.LABIRINTAR_STATE);
    const handleLabirintarChange = (field, value) => {
        setLabirintarState(prev => ({...prev, [field]: value}));
    }

    const [educatorState, setEducatorState, resetEducatorState] = usePersistentState('sim-eco-educatorState', ECO_DEFAULTS.EDUCATOR_STATE);
    const handleEducatorChange = (field, value) => {
        setEducatorState(prev => ({...prev, [field]: value}));
    }

    const [schoolState, setSchoolState, resetSchoolState] = usePersistentState('sim-eco-schoolState', ECO_DEFAULTS.SCHOOL_STATE);
    const handleSchoolChange = (field, value) => {
        setSchoolState(prev => ({...prev, [field]: value}));
    }
    
    const [provedorState, setProvedorState, resetProvedorState] = usePersistentState('sim-eco-provedorState', ECO_DEFAULTS.PROVEDOR_STATE);
    const handleProvedorChange = (field, value) => {
        setProvedorState(prev => ({...prev, [field]: value}));
    }

    // FIX: Destructured the reset function from usePersistentState to be used in the Select component.
    const [partnershipModel, setPartnershipModel, resetPartnershipModel] = usePersistentState('sim-eco-partnershipModel', initialPartnershipModel);
    useEffect(() => {
        if (partnershipModel.model === 'Entrada') {
            setSchoolState(prev => ({ ...prev, percentage: 20 }));
        } else if (partnershipModel.model === 'Escala') {
            setSchoolState(prev => ({ ...prev, percentage: 30 }));
        }
    }, [partnershipModel.model]);

    useEffect(() => {
        const yearData = fixedCostsData.filter(item => new Date(item.date).getFullYear() === simulationYear);

        if (yearData.length > 0) {
            const sum = yearData.reduce((acc, item) => acc + item.value, 0);
            const average = sum / yearData.length;
            handleLabirintarChange('operationalCosts', average);
        }
    }, [simulationYear]);

    const totalPercentage = useMemo(() => {
        return labirintarState.percentage + educatorState.percentage + schoolState.percentage + provedorState.percentage;
    }, [labirintarState.percentage, educatorState.percentage, schoolState.percentage, provedorState.percentage]);


    // --- P&L CALCULATIONS FOR EACH PARTNER ---

    const labirintarResult = useMemo(() => {
        const receitaSplit = tmFamilia * (labirintarState.percentage / 100);
        const receitaSaas = partnershipModel.model === 'Escala' ? partnershipModel.saasFee : 0;
        const receitaBruta = receitaSplit + receitaSaas;
        const custosFixos = labirintarState.operationalCosts;
        const mcPercentTarget = (labirintarState.contributionMargin || 0) / 100;
        const margemContribuicaoTarget = receitaBruta * mcPercentTarget;

        let custosVariaveis;

        if (labirintarState.regime === TaxRegime.LUCRO_REAL) {
            const SOFTWARE_CNAES = ['62.02-3/00', '62.03-1-00'];
            const EDUCATION_CNAES_2_PERCENT_ISS = ['85.12-1/00', '85.13-9/00', '85.20-1/00'];
            let issRate = 0.05;
            if (SOFTWARE_CNAES.includes(labirintarState.cnaeCode) || EDUCATION_CNAES_2_PERCENT_ISS.includes(labirintarState.cnaeCode)) {
                issRate = 0.02;
            }

            const PIS_NC_RATE = 0.0165;
            const COFINS_NC_RATE = 0.076;
            const T_PC = PIS_NC_RATE + COFINS_NC_RATE;

            if (simulationYear < 2027 && (1 - T_PC) !== 0) {
                const numerator = receitaBruta * (1 - issRate - T_PC) + custosFixos * T_PC - margemContribuicaoTarget;
                const denominator = 1 - T_PC;
                custosVariaveis = Math.max(0, numerator / denominator);
            } else {
                const tempTaxResult = calculateTax({ simulationYear, regime: labirintarState.regime, receita: receitaBruta, custo: 0, creditGeneratingCosts: 0, pat: labirintarState.pat, cnaeCode: labirintarState.cnaeCode });
                const tempImpostos = tempTaxResult.breakdown.filter(i => i.category === 'receita').reduce((s, i) => s + i.value, 0);
                const tempReceitaLiquida = receitaBruta - tempImpostos;
                custosVariaveis = Math.max(0, tempReceitaLiquida - margemContribuicaoTarget);
            }
        } else {
            const taxResultForRevenue = calculateTax({
                simulationYear, regime: labirintarState.regime, receita: receitaBruta, custo: 0,
                presuncao: 32, cnaeCode: labirintarState.cnaeCode, creditGeneratingCosts: 0, pat: labirintarState.pat,
            });
            const impostosSobreReceita = taxResultForRevenue.breakdown.filter(i => i.category === 'receita').reduce((s, i) => s + i.value, 0);
            const receitaLiquida = receitaBruta - impostosSobreReceita;
            custosVariaveis = Math.max(0, receitaLiquida - margemContribuicaoTarget);
        }

        const totalCost = custosVariaveis + custosFixos;
        const creditGeneratingCostsForTax = custosVariaveis + custosFixos;

        const finalTaxResult = calculateTax({
            simulationYear, regime: labirintarState.regime, receita: receitaBruta, custo: totalCost,
            presuncao: 32, cnaeCode: labirintarState.cnaeCode, 
            creditGeneratingCosts: creditGeneratingCostsForTax, 
            pat: labirintarState.pat,
        });

        const impostosSobreReceitaDetails = finalTaxResult.breakdown.filter(i => i.category === 'receita');
        const impostosSobreReceita = impostosSobreReceitaDetails.reduce((s, i) => s + i.value, 0);
        const impostosSobreResultadoDetails = finalTaxResult.breakdown.filter(i => i.category === 'resultado');
        const impostosSobreResultado = impostosSobreResultadoDetails.reduce((s, i) => s + i.value, 0);

        const receitaLiquida = receitaBruta - impostosSobreReceita;
        const margemContribuicao = receitaLiquida - custosVariaveis;
        const ebit = margemContribuicao - custosFixos;
        const resultadoLiquido = ebit - impostosSobreResultado;
        const margemContribuicaoPercent = receitaBruta > 0 ? margemContribuicao / receitaBruta : 0;
        
        const mcUnitaria = totalStudents > 0 ? margemContribuicao / totalStudents : 0;
        const bepAlunosCalculado = mcUnitaria > 0 ? custosFixos / mcUnitaria : Infinity;
        const bepAlunos = isFinite(bepAlunosCalculado) ? Math.ceil(bepAlunosCalculado) : Infinity;
        const bepReceita = margemContribuicaoPercent > 0 ? custosFixos / margemContribuicaoPercent : Infinity;

        return {
            dre: { 
                receitaBruta, 
                impostosSobreReceita, 
                impostosSobreReceitaDetails,
                receitaLiquida, 
                custosVariaveis, 
                margemContribuicao, 
                margemContribuicaoPercent, 
                custosFixos, 
                ebit, 
                impostosSobreResultado, 
                resultadoLiquido, 
                impostosSobreResultadoDetails
            },
            bep: { receita: bepReceita, alunos: bepAlunos }
        };
    }, [tmFamilia, labirintarState, partnershipModel, simulationYear, totalStudents]);

    const educatorResult = useMemo(() => {
        const receitaBruta = tmFamilia * (educatorState.percentage / 100);
        const custosFixos = educatorState.materialCosts;
        const rbt12ForCalc = educatorState.rbt12 > 0 ? educatorState.rbt12 : receitaBruta * 12;

        const taxResult = calculateTax({
            simulationYear, regime: educatorState.regime, receita: receitaBruta, custo: custosFixos,
            cnaeCode: educatorState.cnaeCode, rbt12: rbt12ForCalc, folha: 0, presuncao: educatorState.presuncao,
            creditGeneratingCosts: custosFixos, pat: educatorState.pat,
        });

        const impostosSobreReceita = taxResult.breakdown.filter(i => i.category === 'receita').reduce((s, i) => s + i.value, 0);
        const impostosSobreResultado = taxResult.breakdown.filter(i => i.category === 'resultado').reduce((s, i) => s + i.value, 0);
        const receitaLiquida = receitaBruta - impostosSobreReceita;
        const ebit = receitaLiquida - custosFixos;
        const resultadoLiquido = ebit - impostosSobreResultado;
        const mcPercent = receitaBruta > 0 ? receitaLiquida / receitaBruta : 0;

        const mcUnitaria = totalStudents > 0 ? receitaLiquida / totalStudents : 0;
        const bepAlunosCalculado = mcUnitaria > 0 ? custosFixos / mcUnitaria : Infinity;
        const bepAlunos = isFinite(bepAlunosCalculado) ? Math.ceil(bepAlunosCalculado) : Infinity;

        return {
            dre: { receitaBruta, impostosSobreReceita, receitaLiquida, custosVariaveis: 0, margemContribuicao: receitaLiquida, margemContribuicaoPercent: mcPercent, custosFixos, ebit, impostosSobreResultado, resultadoLiquido, impostosSobreReceitaDetails: taxResult.breakdown.filter(i => i.category === 'receita'), impostosSobreResultadoDetails: taxResult.breakdown.filter(i => i.category === 'resultado') },
            bep: { receita: mcPercent > 0 ? custosFixos / mcPercent : Infinity, alunos: bepAlunos }
        };
    }, [tmFamilia, educatorState, simulationYear, totalStudents]);

    const schoolResult = useMemo(() => {
        const receitaBruta = tmFamilia * (schoolState.percentage / 100);
        const custosFixos = partnershipModel.model === 'Escala' ? partnershipModel.saasFee : 0;

        const taxResult = calculateTax({
            simulationYear, 
            regime: schoolTaxParams.regime, 
            receita: receitaBruta, 
            custo: custosFixos,
            cnaeCode: schoolTaxParams.cnaeCode, 
            presuncao: schoolTaxParams.presuncao, 
            pat: schoolTaxParams.pat, 
            creditGeneratingCosts: custosFixos
        });

        const impostosSobreReceita = taxResult.breakdown.filter(i => i.category === 'receita').reduce((s, i) => s + i.value, 0);
        const impostosSobreResultado = taxResult.breakdown.filter(i => i.category === 'resultado').reduce((s, i) => s + i.value, 0);
        const receitaLiquida = receitaBruta - impostosSobreReceita;
        const ebit = receitaLiquida - custosFixos;
        const resultadoLiquido = ebit - impostosSobreResultado;
        const mcPercent = receitaBruta > 0 ? receitaLiquida / receitaBruta : 0;

        const mcUnitaria = totalStudents > 0 ? receitaLiquida / totalStudents : 0;
        const bepAlunosCalculado = mcUnitaria > 0 ? custosFixos / mcUnitaria : Infinity;
        const bepAlunos = isFinite(bepAlunosCalculado) ? Math.ceil(bepAlunosCalculado) : Infinity;
        
        return {
            dre: { receitaBruta, impostosSobreReceita, receitaLiquida, custosVariaveis: 0, margemContribuicao: receitaLiquida, margemContribuicaoPercent: mcPercent, custosFixos, ebit, impostosSobreResultado, resultadoLiquido, impostosSobreReceitaDetails: taxResult.breakdown.filter(i => i.category === 'receita'), impostosSobreResultadoDetails: taxResult.breakdown.filter(i => i.category === 'resultado') },
            bep: { receita: mcPercent > 0 ? custosFixos / mcPercent : Infinity, alunos: bepAlunos }
        };
    }, [tmFamilia, schoolState, partnershipModel, simulationYear, schoolTaxParams, totalStudents]);

    const provedorResult = useMemo(() => {
        const receitaBruta = tmFamilia * (provedorState.percentage / 100);
        const custosFixos = provedorState.operationalCosts;

        const taxResult = calculateTax({
            simulationYear, regime: provedorState.regime, receita: receitaBruta, custo: custosFixos,
            cnaeCode: provedorState.cnaeCode, presuncao: provedorState.presuncao,
            creditGeneratingCosts: custosFixos, pat: provedorState.pat,
        });
        
        const impostosSobreReceita = taxResult.breakdown.filter(i => i.category === 'receita').reduce((s, i) => s + i.value, 0);
        const impostosSobreResultado = taxResult.breakdown.filter(i => i.category === 'resultado').reduce((s, i) => s + i.value, 0);
        const receitaLiquida = receitaBruta - impostosSobreReceita;
        const ebit = receitaLiquida - custosFixos;
        const resultadoLiquido = ebit - impostosSobreResultado;
        const mcPercent = receitaBruta > 0 ? receitaLiquida / receitaBruta : 0;

        const mcUnitaria = totalStudents > 0 ? receitaLiquida / totalStudents : 0;
        const bepAlunosCalculado = mcUnitaria > 0 ? custosFixos / mcUnitaria : Infinity;
        const bepAlunos = isFinite(bepAlunosCalculado) ? Math.ceil(bepAlunosCalculado) : Infinity;

        return {
            dre: { receitaBruta, impostosSobreReceita, receitaLiquida, custosVariaveis: 0, margemContribuicao: receitaLiquida, margemContribuicaoPercent: mcPercent, custosFixos, ebit, impostosSobreResultado, resultadoLiquido, impostosSobreReceitaDetails: taxResult.breakdown.filter(i => i.category === 'receita'), impostosSobreResultadoDetails: taxResult.breakdown.filter(i => i.category === 'resultado') },
            bep: { receita: mcPercent > 0 ? custosFixos / mcPercent : Infinity, alunos: bepAlunos }
        };
    }, [tmFamilia, provedorState, simulationYear, totalStudents]);


    const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    const cnaeOptions = useMemo(() => cnaes.map(c => ({ value: c.cnae, label: `${c.cnae} - ${c.descricao}` })), []);

    const ScenarioCard = ({ title, children }: { title: string; children?: React.ReactNode; }) => (
        <div className="bg-[#f3f0e8] p-6 rounded-2xl shadow-lg border border-[#e0cbb2]">
            <h3 className="text-xl font-bold text-[#5c3a21] text-center">{title}</h3>
            <div className="space-y-4 mt-4">
                {children}
            </div>
        </div>
    );
    
    const DREDisplay = ({ dre, bep }) => {
        const { useState } = React;
        const [showReceitaDetails, setShowReceitaDetails] = useState(false);
        const [showResultadoDetails, setShowResultadoDetails] = useState(false);
        
        const formatValue = (value) => new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
        const formatNumber = (value) => new Intl.NumberFormat('pt-BR').format(value);
        const formatPercent = (value) => isNaN(value) || !isFinite(value) ? '-' : `${(value * 100).toFixed(1).replace('.', ',')}%`;
        const resultadoColorClass = dre.resultadoLiquido >= 0 ? 'text-green-600' : 'text-red-600';
        
        const ChevronDownIcon = ({ className = "w-4 h-4" }) => (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        );
    
        const DRELine = ({ label, value, percent, isSubtotal = false, isFinal = false }) => (
            <div className={`grid grid-cols-[minmax(0,1fr)_auto_90px] sm:grid-cols-[minmax(0,1fr)_60px_110px] gap-x-1 sm:gap-x-2 items-baseline text-sm ${isSubtotal ? 'font-semibold' : ''} ${isFinal ? 'font-bold text-base' : ''}`}>
                <span className="truncate">{label}</span>
                <span className="font-mono text-xs text-right text-[#8c6d59]">{percent}</span>
                <strong className={`${isFinal ? resultadoColorClass : 'text-[#5c3a21]'} font-mono text-right truncate`}>{formatValue(value)}</strong>
            </div>
        );
    
        return (
            <div className="mt-6 space-y-2">
                <h4 className="grid grid-cols-[minmax(0,1fr)_auto_90px] sm:grid-cols-[minmax(0,1fr)_60px_110px] gap-x-1 sm:gap-x-2 font-semibold text-sm uppercase tracking-wider text-[#8c6d59] border-b border-[#e0cbb2] pb-2 mb-4">
                    <span className="truncate">Estrutura de Resultado</span>
                    <span className="text-right">AV %</span>
                    <span className="text-right">Valor</span>
                </h4>
                
                <DRELine label="Receita Bruta" value={dre.receitaBruta} percent={formatPercent(1)} />
                <div className="text-sm">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto_90px] sm:grid-cols-[minmax(0,1fr)_60px_110px] gap-x-1 sm:gap-x-2 items-center">
                        <button onClick={() => setShowReceitaDetails(!showReceitaDetails)} className="flex items-center gap-2 text-left p-1 -ml-1 rounded-md hover:bg-[#e0cbb2]/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff595a] min-w-0" aria-expanded={showReceitaDetails}>
                            <span className="truncate">(-) Impostos s/ Receita</span>
                            <ChevronDownIcon className={`w-3.5 h-3.5 text-[#8c6d59] transition-transform duration-200 ${showReceitaDetails ? 'rotate-180' : ''}`} />
                        </button>
                        <span className="font-mono text-xs text-right text-[#8c6d59]">{formatPercent(dre.receitaBruta > 0 ? -dre.impostosSobreReceita / dre.receitaBruta : 0)}</span>
                        <strong className="font-mono text-right text-[#5c3a21] truncate">{formatValue(-dre.impostosSobreReceita)}</strong>
                    </div>
                    {showReceitaDetails && dre.impostosSobreReceitaDetails?.length > 0 && (
                        <div className="pl-4 mt-1 space-y-1 text-xs ml-1 py-1">
                            {dre.impostosSobreReceitaDetails.map(tax => (
                                <div key={tax.name} className="grid grid-cols-[minmax(0,1fr)_auto_90px] sm:grid-cols-[minmax(0,1fr)_60px_110px] gap-x-1 sm:gap-x-2 items-baseline -ml-4">
                                    <span className="text-[#8c6d59]">{tax.name} ({tax.rate})</span>
                                    <span className="font-mono text-right text-[#8c6d59]">{formatPercent(dre.receitaBruta > 0 ? tax.value / dre.receitaBruta : 0)}</span>
                                    <strong className="font-mono text-right text-[#5c3a21] truncate">{formatValue(tax.value)}</strong>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <DRELine label="(=) Receita Líquida" value={dre.receitaLiquida} percent={formatPercent(dre.receitaBruta > 0 ? dre.receitaLiquida / dre.receitaBruta : 0)} isSubtotal={true} />
                 {dre.custosVariaveis > 0 && (
                    <DRELine label="(-) Custos Variáveis" value={-dre.custosVariaveis} percent={formatPercent(dre.receitaBruta > 0 ? -dre.custosVariaveis / dre.receitaBruta : 0)} />
                 )}
                <div className="pt-2 mt-2 border-t border-dashed border-[#e0cbb2]">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto_90px] sm:grid-cols-[minmax(0,1fr)_60px_110px] gap-x-1 sm:gap-x-2 items-baseline text-sm font-semibold">
                        <span>(=) Margem de Contribuição</span>
                        <span className="font-mono text-xs text-right text-[#8c6d59]">{formatPercent(dre.margemContribuicaoPercent)}</span>
                        <strong className="font-mono text-right text-[#5c3a21] truncate">{formatValue(dre.margemContribuicao)}</strong>
                    </div>
                </div>
                <div className="pt-2 mt-2 border-t border-dashed border-[#e0cbb2]">
                    <DRELine label="(-) Custos Fixos" value={-dre.custosFixos} percent={formatPercent(dre.receitaBruta > 0 ? -dre.custosFixos / dre.receitaBruta : 0)} />
                    <DRELine label="(=) EBIT" value={dre.ebit} percent={formatPercent(dre.receitaBruta > 0 ? dre.ebit / dre.receitaBruta : 0)} isSubtotal={true} />
                </div>
                <div className="pt-2 mt-2 border-t border-dashed border-[#e0cbb2]">
                    <div className="text-sm">
                        <div className="grid grid-cols-[minmax(0,1fr)_auto_90px] sm:grid-cols-[minmax(0,1fr)_60px_110px] gap-x-1 sm:gap-x-2 items-center">
                            <button onClick={() => setShowResultadoDetails(!showResultadoDetails)} className="flex items-center gap-2 text-left p-1 -ml-1 rounded-md hover:bg-[#e0cbb2]/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff595a] min-w-0" aria-expanded={showResultadoDetails}>
                                <span className="truncate">(-) Impostos s/ Resultado</span>
                                <ChevronDownIcon className={`w-3.5 h-3.5 text-[#8c6d59] transition-transform duration-200 ${showResultadoDetails ? 'rotate-180' : ''}`} />
                            </button>
                            <span className="font-mono text-xs text-right text-[#8c6d59]">{formatPercent(dre.receitaBruta > 0 ? -dre.impostosSobreResultado / dre.receitaBruta : 0)}</span>
                            <strong className="font-mono text-right text-[#5c3a21] truncate">{formatValue(-dre.impostosSobreResultado)}</strong>
                        </div>
                        {showResultadoDetails && dre.impostosSobreResultadoDetails?.length > 0 && (
                             <div className="pl-4 mt-1 space-y-1 text-xs ml-1 py-1">
                                {dre.impostosSobreResultadoDetails.map(tax => (
                                    <div key={tax.name} className="grid grid-cols-[minmax(0,1fr)_auto_90px] sm:grid-cols-[minmax(0,1fr)_60px_110px] gap-x-1 sm:gap-x-2 items-baseline -ml-4">
                                        <span className="text-[#8c6d59]">{tax.name} ({tax.rate})</span>
                                        <span className="font-mono text-right text-[#8c6d59]">{formatPercent(dre.receitaBruta > 0 ? tax.value / dre.receitaBruta : 0)}</span>
                                        <strong className="font-mono text-right text-[#5c3a21] truncate">{formatValue(tax.value)}</strong>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <hr className="border-t border-[#e0cbb2] my-2" />
                <DRELine label="(=) Resultado Líquido" value={dre.resultadoLiquido} percent={formatPercent(dre.receitaBruta > 0 ? dre.resultadoLiquido / dre.receitaBruta : 0)} isFinal={true} />
                {bep && (
                    <div className="pt-2 mt-2 border-t border-dashed border-[#e0cbb2] text-center">
                        <p className="text-xs font-bold uppercase text-[#8c6d59] tracking-wider mb-2">Ponto de Equilíbrio</p>
                         <div className="text-xs bg-white p-2 rounded-md border border-[#e0cbb2] space-y-1">
                            {bep.alunos !== undefined && (
                                <p>Matrículas: <strong className="text-[#5c3a21]">{isFinite(bep.alunos) ? formatNumber(bep.alunos) : 'N/A'}</strong></p>
                            )}
                            <p>Receita: <strong className="text-[#5c3a21]">{isFinite(bep.receita) ? formatCurrency(bep.receita) : 'N/A'}</strong></p>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="mt-4">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-xl font-bold text-center mb-2 text-[#5c3a21]">Saúde do Ecossistema</h2>
                <p className="text-center text-[#8c6d59] mb-8 max-w-3xl mx-auto">
                    Avalie a viabilidade de cada parceiro com base na distribuição do faturamento total (TM Família) para o ano de {simulationYear}.
                </p>
                
                <div className="max-w-4xl mx-auto space-y-4">
                     <FormControl label="Cenários para Análise do Ecossistema">
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
                                                <button onClick={() => handleSelectBySchool(school)} className="text-xs font-medium text-[#ff595a] hover:underline">{school}</button>
                                            </React.Fragment>
                                        ))}
                                        <span className="text-gray-300">|</span>
                                        <button onClick={handleDeselectAll} className="text-xs font-medium text-[#8c6d59] hover:underline">Limpar</button>
                                    </div>
                                </div>
                                <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                                    {scenarios.map(scenario => (
                                        <label key={scenario.id} className="flex items-center p-2 rounded-md hover:bg-[#f3f0e8] cursor-pointer transition-colors">
                                            <input type="checkbox" checked={selectedScenarioIds.includes(scenario.id)} onChange={() => handleScenarioSelectionChange(scenario.id)} className="h-4 w-4 rounded border-gray-300 text-[#ff595a] focus:ring-[#ff595a]" />
                                            <div className="ml-3 text-sm">
                                                <span className="font-semibold text-[#5c3a21]">{scenario.school}</span> - <span>{scenario.productName}</span>
                                                <span className="text-[#8c6d59] ml-2">({scenario.avgStudents} alunos)</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-center text-[#8c6d59] p-4 bg-white rounded-md border border-dashed border-[#e0cbb2]">Nenhum cenário de demanda foi salvo. Adicione cenários na aba "Jam Session Studio".</p>
                        )}
                    </FormControl>

                    <FormControl 
                        label="Faturamento Total do Ecossistema (TM Família)" 
                        description="Calculado com base nos cenários selecionados. Você pode editar este valor para simulações."
                        className="max-w-sm mx-auto">
                        <NumberInput value={tmFamilia} onChange={setTmFamilia} prefix="R$" formatAsCurrency={true} min={0} max={999999} step={1000} defaultValue={ECO_DEFAULTS.TM_FAMILIA} onReset={resetTmFamilia}/>
                    </FormControl>

                     <div className="p-4 bg-white rounded-md border border-[#e0cbb2] text-sm text-center space-y-2">
                        <p><strong>Distribuição do Faturamento do Ecossistema</strong></p>
                        <div className="flex justify-center items-center gap-3 flex-wrap">
                            <span>LABirintar: <strong className="text-[#5c3a21]">{labirintarState.percentage}%</strong></span>
                            <span>Escola: <strong className="text-[#5c3a21]">{schoolState.percentage}%</strong></span>
                            <span>Educador: <strong className="text-[#5c3a21]">{educatorState.percentage}%</strong></span>
                            <span>Provedor: <strong className="text-[#5c3a21]">{provedorState.percentage}%</strong></span>
                        </div>
                        {totalPercentage !== 100 && (
                            <p className="text-xs p-2 bg-red-100 rounded-md border border-red-200 text-red-700 font-semibold">
                                Atenção: A soma dos percentuais é {totalPercentage.toFixed(2)}%. Ajuste para que a soma seja 100%.
                            </p>
                        )}
                        {partnershipModel.model === 'Escala' && (
                           <span className="inline-block mt-2 text-xs p-1 bg-amber-100 rounded-md border border-amber-200">
                                + <strong className="text-[#5c3a21]">{formatCurrency(partnershipModel.saasFee)}</strong> de SaaS para LABirintar (Custo para Escola)
                            </span>
                        )}
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mt-8">
                    {/* LABirintar Card */}
                    <ScenarioCard title="Viabilidade LABirintar">
                        <FormControl label="Percentual de Repasse (TM Família)" description="Percentual do faturamento que vai para a LABirintar."><NumberInput value={labirintarState.percentage} onChange={v => handleLabirintarChange('percentage', v)} prefix="%" min={0} max={100} step={1} defaultValue={ECO_DEFAULTS.LABIRINTAR_STATE.percentage} onReset={resetLabirintarState} /></FormControl>
                        <FormControl label="Margem de Contribuição Alvo" description="Percentual da Receita Bruta, conforme valuation. Usado para calcular custos variáveis."><NumberInput value={labirintarState.contributionMargin} onChange={v => handleLabirintarChange('contributionMargin', v)} prefix="%" min={0} max={100} step={1} defaultValue={ECO_DEFAULTS.LABIRINTAR_STATE.contributionMargin} onReset={resetLabirintarState} /></FormControl>
                        <FormControl 
                            label="Custos Operacionais Fixos (Mês)"
                            description={`Valor médio mensal para o ano de ${simulationYear}, com base na projeção de valuation. Pode ser editado manualmente.`}>
                            <NumberInput value={labirintarState.operationalCosts} onChange={v => handleLabirintarChange('operationalCosts', v)} prefix="R$" formatAsCurrency={true} min={0} max={999999} step={100} defaultValue={ECO_DEFAULTS.LABIRINTAR_STATE.operationalCosts} onReset={resetLabirintarState} />
                        </FormControl>
                        <h4 className="font-semibold text-sm uppercase tracking-wider text-[#8c6d59] border-b border-[#e0cbb2] pb-2 mt-4 mb-2 text-center">Parâmetros Tributários</h4>
                        {/* FIX: Added defaultValue and onReset props to Select component to fix prop type error. */}
                        <FormControl label="Regime Tributário"><Select value={labirintarState.regime} onChange={v => handleLabirintarChange('regime', v)} options={Object.values(TaxRegime)} defaultValue={ECO_DEFAULTS.LABIRINTAR_STATE.regime} onReset={resetLabirintarState} /></FormControl>
                        <FormControl label="Atividade (CNAE)"><select value={labirintarState.cnaeCode} onChange={e => handleLabirintarChange('cnaeCode', e.target.value)} className="w-full rounded-md border-[#e0cbb2] bg-white text-[#5c3a21] shadow-sm focus:border-[#ff595a] focus:ring-1 focus:ring-[#ff595a] px-3 py-2">{cnaeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></FormControl>
                        {labirintarState.regime === TaxRegime.LUCRO_REAL && (<FormControl label="Optante do PAT?"><div className="flex justify-start"><Toggle enabled={labirintarState.pat} onChange={v => handleLabirintarChange('pat', v)} /></div></FormControl>)}
                        <DREDisplay dre={labirintarResult.dre} bep={labirintarResult.bep} />
                    </ScenarioCard>

                     {/* School Card */}
                    <ScenarioCard title="Viabilidade Escola">
                        {/* FIX: Added defaultValue and onReset props to Select component to fix prop type error. */}
                        <FormControl label="Modelo de Remuneração"><Select value={partnershipModel.model} onChange={v => setPartnershipModel(p => ({...p, model: v}))} options={['Entrada', 'Escala']} defaultValue={initialPartnershipModel.model} onReset={resetPartnershipModel} /></FormControl>
                        <FormControl label="Percentual de Repasse (TM Família)" description="Percentual do faturamento que fica com a Escola."><NumberInput value={schoolState.percentage} onChange={v => handleSchoolChange('percentage', v)} prefix="%" min={0} max={100} step={1} defaultValue={ECO_DEFAULTS.SCHOOL_STATE.percentage} onReset={resetSchoolState} /></FormControl>
                        {partnershipModel.model === 'Escala' && (<FormControl label="Taxa de SaaS (Custo Fixo)"><NumberInput value={partnershipModel.saasFee} onChange={v => setPartnershipModel(p => ({...p, saasFee: v}))} prefix="R$" formatAsCurrency={true} min={0} max={10000} step={100} /></FormControl>)}
                        <p className="text-xs text-center text-[#8c6d59] p-2 bg-white rounded-md border border-dashed border-[#e0cbb2] mt-4">
                            Os parâmetros tributários (Regime, CNAE, etc.) são herdados da configuração do cenário "Fazer" na aba "Análise Fazer vs. Comprar" para garantir consistência.
                        </p>
                        <DREDisplay dre={schoolResult.dre} bep={schoolResult.bep} />
                    </ScenarioCard>

                    {/* Educator Card */}
                    <ScenarioCard title="Viabilidade Educador Empreendedor">
                        <FormControl label="Percentual de Repasse (TM Família)" description="Percentual do faturamento para o educador."><NumberInput value={educatorState.percentage} onChange={v => handleEducatorChange('percentage', v)} prefix="%" min={0} max={100} step={1} defaultValue={ECO_DEFAULTS.EDUCATOR_STATE.percentage} onReset={resetEducatorState} /></FormControl>
                        <FormControl label="Custos de Materiais (Mês)"><NumberInput value={educatorState.materialCosts} onChange={v => handleEducatorChange('materialCosts', v)} prefix="R$" formatAsCurrency={true} min={0} max={99999} step={10} defaultValue={ECO_DEFAULTS.EDUCATOR_STATE.materialCosts} onReset={resetEducatorState} /></FormControl>
                        <h4 className="font-semibold text-sm uppercase tracking-wider text-[#8c6d59] border-b border-[#e0cbb2] pb-2 mt-4 mb-2 text-center">Parâmetros Tributários</h4>
                        {/* FIX: Added defaultValue and onReset props to Select component to fix prop type error. */}
                        <FormControl label="Regime Tributário"><Select value={educatorState.regime} onChange={v => handleEducatorChange('regime', v)} options={Object.values(TaxRegime)} defaultValue={ECO_DEFAULTS.EDUCATOR_STATE.regime} onReset={resetEducatorState} /></FormControl>
                        <FormControl label="Atividade (CNAE)"><select value={educatorState.cnaeCode} onChange={e => handleEducatorChange('cnaeCode', e.target.value)} className="w-full rounded-md border-[#e0cbb2] bg-white text-[#5c3a21] shadow-sm focus:border-[#ff595a] focus:ring-1 focus:ring-[#ff595a] px-3 py-2">{cnaeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></FormControl>
                        {educatorState.regime === TaxRegime.SIMPLES_NACIONAL && (<FormControl label="Receita Bruta (Últimos 12 meses)"><NumberInput value={educatorState.rbt12} onChange={v => handleEducatorChange('rbt12', v)} prefix="R$" formatAsCurrency={true} min={0} max={4800000} step={10000} defaultValue={ECO_DEFAULTS.EDUCATOR_STATE.rbt12} onReset={resetEducatorState} /></FormControl>)}
                        <DREDisplay dre={educatorResult.dre} bep={educatorResult.bep} />
                    </ScenarioCard>

                    {/* Provedor Card */}
                    <ScenarioCard title="Viabilidade Provedor Educacional">
                        <FormControl label="Percentual de Repasse (TM Família)" description="Percentual do faturamento para o provedor."><NumberInput value={provedorState.percentage} onChange={v => handleProvedorChange('percentage', v)} prefix="%" min={0} max={100} step={1} defaultValue={ECO_DEFAULTS.PROVEDOR_STATE.percentage} onReset={resetProvedorState} /></FormControl>
                        <FormControl label="Custos Operacionais (Mês)"><NumberInput value={provedorState.operationalCosts} onChange={v => handleProvedorChange('operationalCosts', v)} prefix="R$" formatAsCurrency={true} min={0} max={99999} step={100} defaultValue={ECO_DEFAULTS.PROVEDOR_STATE.operationalCosts} onReset={resetProvedorState} /></FormControl>
                        <h4 className="font-semibold text-sm uppercase tracking-wider text-[#8c6d59] border-b border-[#e0cbb2] pb-2 mt-4 mb-2 text-center">Parâmetros Tributários</h4>
                        {/* FIX: Added defaultValue and onReset props to Select component to fix prop type error. */}
                        <FormControl label="Regime Tributário"><Select value={provedorState.regime} onChange={v => handleProvedorChange('regime', v)} options={Object.values(TaxRegime)} defaultValue={ECO_DEFAULTS.PROVEDOR_STATE.regime} onReset={resetProvedorState} /></FormControl>
                        <FormControl label="Atividade (CNAE)"><select value={provedorState.cnaeCode} onChange={e => handleProvedorChange('cnaeCode', e.target.value)} className="w-full rounded-md border-[#e0cbb2] bg-white text-[#5c3a21] shadow-sm focus:border-[#ff595a] focus:ring-1 focus:ring-[#ff595a] px-3 py-2">{cnaeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></FormControl>
                        {provedorState.regime === TaxRegime.LUCRO_PRESUMIDO && (<FormControl label="Alíquota de Presunção"><NumberInput value={provedorState.presuncao} onChange={v => handleProvedorChange('presuncao', v)} prefix="%" min={0} max={100} step={1} defaultValue={ECO_DEFAULTS.PROVEDOR_STATE.presuncao} onReset={resetProvedorState} /></FormControl>)}
                        <DREDisplay dre={provedorResult.dre} bep={provedorResult.bep} />
                    </ScenarioCard>

                </div>
                 <p className="text-center text-xs text-[#8c6d59] mt-8 max-w-3xl mx-auto">
                    Atenção: Esta é uma simulação simplificada para fins de planejamento estratégico. Custos e impostos podem variar.
                </p>
            </div>
        </div>
    );
};