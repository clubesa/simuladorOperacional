


import React from "react";
import { FormControl } from './FormControl.tsx';
import { NumberInput } from './NumberInput.tsx';
import { calculateTax } from '../services/taxCalculator.tsx';
import { TaxRegime } from '../types.tsx';
import { cnaes } from '../data/simplesNacional.tsx';
import { Select } from './Select.tsx';
import { Toggle } from './Toggle.tsx';

export const EcosystemSimulator = ({ partnershipModel: initialPartnershipModel, simulationYear }) => {
    const { useState, useMemo, useEffect } = React;

    const [tmFamilia, setTmFamilia] = useState(25000);

    const [labirintarState, setLabirintarState] = useState({
        percentage: 20,
        operationalCosts: 5000,
        regime: TaxRegime.LUCRO_REAL,
        cnaeCode: '62.02-3/00',
        creditGeneratingCosts: 2500,
        pat: false,
    });
    const handleLabirintarChange = (field, value) => {
        setLabirintarState(prev => ({...prev, [field]: value}));
    }

    const [educatorState, setEducatorState] = useState({
        percentage: 35,
        materialCosts: 500,
        regime: TaxRegime.SIMPLES_NACIONAL,
        cnaeCode: '85.50-3/02',
        rbt12: 40000,
        presuncao: 32,
        creditGeneratingCosts: 0,
        pat: false,
    });
    const handleEducatorChange = (field, value) => {
        setEducatorState(prev => ({...prev, [field]: value}));
    }

    const [schoolState, setSchoolState] = useState({
        percentage: 30, // Default for Escala
        regime: TaxRegime.LUCRO_PRESUMIDO, // Inherited from Fazer vs Comprar
        cnaeCode: '85.12-1/00', // Inherited
        presuncao: 32,
        pat: false,
    });
    const handleSchoolChange = (field, value) => {
        setSchoolState(prev => ({...prev, [field]: value}));
    }
    
    const [provedorState, setProvedorState] = useState({
        percentage: 15,
        operationalCosts: 1000,
        regime: TaxRegime.LUCRO_PRESUMIDO,
        cnaeCode: '74.90-1/04',
        presuncao: 32,
        creditGeneratingCosts: 500,
        pat: false,
    });
    const handleProvedorChange = (field, value) => {
        setProvedorState(prev => ({...prev, [field]: value}));
    }

    // Use internal state for partnership model to control school's take
    const [partnershipModel, setPartnershipModel] = useState(initialPartnershipModel);
    useEffect(() => {
        if (partnershipModel.model === 'Entrada') {
            setSchoolState(prev => ({ ...prev, percentage: 20 }));
        } else if (partnershipModel.model === 'Escala') {
            setSchoolState(prev => ({ ...prev, percentage: 30 }));
        }
    }, [partnershipModel.model]);


    const totalPercentage = useMemo(() => {
        return labirintarState.percentage + educatorState.percentage + schoolState.percentage + provedorState.percentage;
    }, [labirintarState.percentage, educatorState.percentage, schoolState.percentage, provedorState.percentage]);


    // --- P&L CALCULATIONS FOR EACH PARTNER ---

    const labirintarResult = useMemo(() => {
        const receitaSplit = tmFamilia * (labirintarState.percentage / 100);
        const receitaSaas = partnershipModel.model === 'Escala' ? partnershipModel.saasFee : 0;
        const receitaBruta = receitaSplit + receitaSaas;

        const custosFixos = labirintarState.operationalCosts;
        const taxResult = calculateTax({
            simulationYear, regime: labirintarState.regime, receita: receitaBruta, custo: custosFixos,
            presuncao: 32, cnaeCode: labirintarState.cnaeCode, creditGeneratingCosts: labirintarState.creditGeneratingCosts, pat: labirintarState.pat,
        });

        const impostosSobreReceita = taxResult.breakdown.filter(i => i.category === 'receita').reduce((s, i) => s + i.value, 0);
        const impostosSobreResultado = taxResult.breakdown.filter(i => i.category === 'resultado').reduce((s, i) => s + i.value, 0);
        const ebit = receitaBruta - impostosSobreReceita - custosFixos;
        const resultadoLiquido = ebit - impostosSobreResultado;
        const mcPercent = receitaBruta > 0 ? (receitaBruta - impostosSobreReceita) / receitaBruta : 0;

        return {
            dre: { receitaBruta, impostosSobreReceita, receitaLiquida: receitaBruta - impostosSobreReceita, custosVariaveis: 0, margemContribuicao: receitaBruta - impostosSobreReceita, margemContribuicaoPercent: mcPercent, custosFixos, ebit, impostosSobreResultado, resultadoLiquido, impostosSobreReceitaDetails: taxResult.breakdown.filter(i => i.category === 'receita'), impostosSobreResultadoDetails: taxResult.breakdown.filter(i => i.category === 'resultado')},
            bep: { receita: mcPercent > 0 ? custosFixos / mcPercent : Infinity }
        };
    }, [tmFamilia, labirintarState, partnershipModel, simulationYear]);

    const educatorResult = useMemo(() => {
        const receitaBruta = tmFamilia * (educatorState.percentage / 100);
        const custosFixos = educatorState.materialCosts;
        const rbt12ForCalc = educatorState.rbt12 > 0 ? educatorState.rbt12 : receitaBruta * 12;

        const taxResult = calculateTax({
            simulationYear, regime: educatorState.regime, receita: receitaBruta, custo: custosFixos,
            cnaeCode: educatorState.cnaeCode, rbt12: rbt12ForCalc, folha: 0, presuncao: educatorState.presuncao,
            creditGeneratingCosts: educatorState.creditGeneratingCosts, pat: educatorState.pat,
        });

        const impostosSobreReceita = taxResult.breakdown.filter(i => i.category === 'receita').reduce((s, i) => s + i.value, 0);
        const impostosSobreResultado = taxResult.breakdown.filter(i => i.category === 'resultado').reduce((s, i) => s + i.value, 0);
        const ebit = receitaBruta - impostosSobreReceita - custosFixos;
        const resultadoLiquido = ebit - impostosSobreResultado;
        const mcPercent = receitaBruta > 0 ? (receitaBruta - impostosSobreReceita) / receitaBruta : 0;

        return {
            dre: { receitaBruta, impostosSobreReceita, receitaLiquida: receitaBruta - impostosSobreReceita, custosVariaveis: 0, margemContribuicao: receitaBruta - impostosSobreReceita, margemContribuicaoPercent: mcPercent, custosFixos, ebit, impostosSobreResultado, resultadoLiquido, impostosSobreReceitaDetails: taxResult.breakdown.filter(i => i.category === 'receita'), impostosSobreResultadoDetails: taxResult.breakdown.filter(i => i.category === 'resultado') },
            bep: { receita: mcPercent > 0 ? custosFixos / mcPercent : Infinity }
        };
    }, [tmFamilia, educatorState, simulationYear]);

    const schoolResult = useMemo(() => {
        const receitaBruta = tmFamilia * (schoolState.percentage / 100);
        const custosFixos = partnershipModel.model === 'Escala' ? partnershipModel.saasFee : 0; // SaaS is a cost for the school

        const taxResult = calculateTax({
            simulationYear, regime: schoolState.regime, receita: receitaBruta, custo: custosFixos,
            cnaeCode: schoolState.cnaeCode, presuncao: schoolState.presuncao, pat: schoolState.pat,
        });

        const impostosSobreReceita = taxResult.breakdown.filter(i => i.category === 'receita').reduce((s, i) => s + i.value, 0);
        const impostosSobreResultado = taxResult.breakdown.filter(i => i.category === 'resultado').reduce((s, i) => s + i.value, 0);
        const ebit = receitaBruta - impostosSobreReceita - custosFixos;
        const resultadoLiquido = ebit - impostosSobreResultado;
        const mcPercent = receitaBruta > 0 ? (receitaBruta - impostosSobreReceita) / receitaBruta : 0;
        
        return {
            dre: { receitaBruta, impostosSobreReceita, receitaLiquida: receitaBruta - impostosSobreReceita, custosVariaveis: 0, margemContribuicao: receitaBruta - impostosSobreReceita, margemContribuicaoPercent: mcPercent, custosFixos, ebit, impostosSobreResultado, resultadoLiquido, impostosSobreReceitaDetails: taxResult.breakdown.filter(i => i.category === 'receita'), impostosSobreResultadoDetails: taxResult.breakdown.filter(i => i.category === 'resultado') },
            bep: { receita: mcPercent > 0 ? custosFixos / mcPercent : Infinity }
        };
    }, [tmFamilia, schoolState, partnershipModel, simulationYear]);

    const provedorResult = useMemo(() => {
        const receitaBruta = tmFamilia * (provedorState.percentage / 100);
        const custosFixos = provedorState.operationalCosts;

        const taxResult = calculateTax({
            simulationYear, regime: provedorState.regime, receita: receitaBruta, custo: custosFixos,
            cnaeCode: provedorState.cnaeCode, presuncao: provedorState.presuncao,
            creditGeneratingCosts: provedorState.creditGeneratingCosts, pat: provedorState.pat,
        });
        
        const impostosSobreReceita = taxResult.breakdown.filter(i => i.category === 'receita').reduce((s, i) => s + i.value, 0);
        const impostosSobreResultado = taxResult.breakdown.filter(i => i.category === 'resultado').reduce((s, i) => s + i.value, 0);
        const ebit = receitaBruta - impostosSobreReceita - custosFixos;
        const resultadoLiquido = ebit - impostosSobreResultado;
        const mcPercent = receitaBruta > 0 ? (receitaBruta - impostosSobreReceita) / receitaBruta : 0;

        return {
            dre: { receitaBruta, impostosSobreReceita, receitaLiquida: receitaBruta - impostosSobreReceita, custosVariaveis: 0, margemContribuicao: receitaBruta - impostosSobreReceita, margemContribuicaoPercent: mcPercent, custosFixos, ebit, impostosSobreResultado, resultadoLiquido, impostosSobreReceitaDetails: taxResult.breakdown.filter(i => i.category === 'receita'), impostosSobreResultadoDetails: taxResult.breakdown.filter(i => i.category === 'resultado') },
            bep: { receita: mcPercent > 0 ? custosFixos / mcPercent : Infinity }
        };
    }, [tmFamilia, provedorState, simulationYear]);


    const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    const cnaeOptions = useMemo(() => cnaes.map(c => ({ value: c.cnae, label: `${c.cnae} - ${c.descricao}` })), []);

    // FIX: Added explicit types and made children optional to resolve type error.
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
                         <div className="text-xs bg-white p-2 rounded-md border border-[#e0cbb2]">
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
                <h2 className="text-2xl font-bold text-center mb-2 text-[#5c3a21]">Saúde do Ecossistema</h2>
                <p className="text-center text-[#8c6d59] mb-8 max-w-3xl mx-auto">
                    Avalie a viabilidade de cada parceiro com base na distribuição do faturamento total (TM Família) para o ano de {simulationYear}.
                </p>
                
                <div className="max-w-4xl mx-auto space-y-4">
                    <FormControl label="Faturamento Total do Ecossistema (TM Família)" className="max-w-sm mx-auto">
                        <NumberInput value={tmFamilia} onChange={setTmFamilia} prefix="R$" formatAsCurrency={true} min={0} max={999999} step={1000} />
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
                           <span className="text-xs p-1 bg-amber-100 rounded-md border border-amber-200">
                                + <strong className="text-[#5c3a21]">{formatCurrency(partnershipModel.saasFee)}</strong> de SaaS para LABirintar (Custo para Escola)
                            </span>
                        )}
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mt-8">
                    {/* LABirintar Card */}
                    <ScenarioCard title="Viabilidade LABirintar">
                        <FormControl label="Percentual de Repasse (TM Família)" description="Percentual do faturamento que vai para a LABirintar."><NumberInput value={labirintarState.percentage} onChange={v => handleLabirintarChange('percentage', v)} prefix="%" min={0} max={100} step={1} /></FormControl>
                        {/* FIX: Added missing min, max, and step props to NumberInput component. */}
                        <FormControl label="Custos Operacionais Fixos (Mês)"><NumberInput value={labirintarState.operationalCosts} onChange={v => handleLabirintarChange('operationalCosts', v)} prefix="R$" formatAsCurrency={true} min={0} max={999999} step={100} /></FormControl>
                        <h4 className="font-semibold text-sm uppercase tracking-wider text-[#8c6d59] border-b border-[#e0cbb2] pb-2 mt-4 mb-2 text-center">Parâmetros Tributários</h4>
                        <FormControl label="Regime Tributário"><Select value={labirintarState.regime} onChange={v => handleLabirintarChange('regime', v)} options={Object.values(TaxRegime)} /></FormControl>
                        <FormControl label="Atividade (CNAE)"><select value={labirintarState.cnaeCode} onChange={e => handleLabirintarChange('cnaeCode', e.target.value)} className="w-full rounded-md border-[#e0cbb2] bg-white text-[#5c3a21] shadow-sm focus:border-[#ff595a] focus:ring-1 focus:ring-[#ff595a] px-3 py-2">{cnaeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></FormControl>
                        {/* FIX: Added missing min, max, and step props to NumberInput component. */}
                        {labirintarState.regime === TaxRegime.LUCRO_REAL && (<><FormControl label="Custos Geradores de Crédito"><NumberInput value={labirintarState.creditGeneratingCosts} onChange={v => handleLabirintarChange('creditGeneratingCosts', v)} prefix="R$" formatAsCurrency={true} min={0} max={999999} step={100} /></FormControl><FormControl label="Optante do PAT?"><div className="flex justify-start"><Toggle enabled={labirintarState.pat} onChange={v => handleLabirintarChange('pat', v)} /></div></FormControl></>)}
                        <DREDisplay dre={labirintarResult.dre} bep={labirintarResult.bep} />
                    </ScenarioCard>

                     {/* School Card */}
                    <ScenarioCard title="Viabilidade Escola">
                        <FormControl label="Modelo de Remuneração"><Select value={partnershipModel.model} onChange={v => setPartnershipModel(p => ({...p, model: v}))} options={['Entrada', 'Escala']} /></FormControl>
                        <FormControl label="Percentual de Repasse (TM Família)" description="Percentual do faturamento que fica com a Escola."><NumberInput value={schoolState.percentage} onChange={v => handleSchoolChange('percentage', v)} prefix="%" min={0} max={100} step={1} /></FormControl>
                        {/* FIX: Added missing min, max, and step props to NumberInput component. */}
                        {partnershipModel.model === 'Escala' && (<FormControl label="Taxa de SaaS (Custo Fixo)"><NumberInput value={partnershipModel.saasFee} onChange={v => setPartnershipModel(p => ({...p, saasFee: v}))} prefix="R$" formatAsCurrency={true} min={0} max={10000} step={100} /></FormControl>)}
                        <h4 className="font-semibold text-sm uppercase tracking-wider text-[#8c6d59] border-b border-[#e0cbb2] pb-2 mt-4 mb-2 text-center">Parâmetros Tributários</h4>
                        <FormControl label="Regime Tributário"><Select value={schoolState.regime} onChange={v => handleSchoolChange('regime', v)} options={Object.values(TaxRegime)} /></FormControl>
                        <FormControl label="Atividade (CNAE)"><select value={schoolState.cnaeCode} onChange={e => handleSchoolChange('cnaeCode', e.target.value)} className="w-full rounded-md border-[#e0cbb2] bg-white text-[#5c3a21] shadow-sm focus:border-[#ff595a] focus:ring-1 focus:ring-[#ff595a] px-3 py-2">{cnaeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></FormControl>
                        <DREDisplay dre={schoolResult.dre} bep={schoolResult.bep} />
                    </ScenarioCard>

                    {/* Educator Card */}
                    <ScenarioCard title="Viabilidade Educador Empreendedor">
                        <FormControl label="Percentual de Repasse (TM Família)" description="Percentual do faturamento para o educador."><NumberInput value={educatorState.percentage} onChange={v => handleEducatorChange('percentage', v)} prefix="%" min={0} max={100} step={1} /></FormControl>
                        {/* FIX: Added missing min, max, and step props to NumberInput component. */}
                        <FormControl label="Custos de Materiais (Mês)"><NumberInput value={educatorState.materialCosts} onChange={v => handleEducatorChange('materialCosts', v)} prefix="R$" formatAsCurrency={true} min={0} max={99999} step={10} /></FormControl>
                        <h4 className="font-semibold text-sm uppercase tracking-wider text-[#8c6d59] border-b border-[#e0cbb2] pb-2 mt-4 mb-2 text-center">Parâmetros Tributários</h4>
                        <FormControl label="Regime Tributário"><Select value={educatorState.regime} onChange={v => handleEducatorChange('regime', v)} options={Object.values(TaxRegime)} /></FormControl>
                        <FormControl label="Atividade (CNAE)"><select value={educatorState.cnaeCode} onChange={e => handleEducatorChange('cnaeCode', e.target.value)} className="w-full rounded-md border-[#e0cbb2] bg-white text-[#5c3a21] shadow-sm focus:border-[#ff595a] focus:ring-1 focus:ring-[#ff595a] px-3 py-2">{cnaeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></FormControl>
                        {/* FIX: Added missing min, max, and step props to NumberInput component. */}
                        {educatorState.regime === TaxRegime.SIMPLES_NACIONAL && (<FormControl label="Receita Bruta (Últimos 12 meses)"><NumberInput value={educatorState.rbt12} onChange={v => handleEducatorChange('rbt12', v)} prefix="R$" formatAsCurrency={true} min={0} max={4800000} step={10000} /></FormControl>)}
                        <DREDisplay dre={educatorResult.dre} bep={educatorResult.bep} />
                    </ScenarioCard>

                    {/* Provedor Card */}
                    <ScenarioCard title="Viabilidade Provedor Educacional">
                        <FormControl label="Percentual de Repasse (TM Família)" description="Percentual do faturamento para o provedor."><NumberInput value={provedorState.percentage} onChange={v => handleProvedorChange('percentage', v)} prefix="%" min={0} max={100} step={1} /></FormControl>
                        {/* FIX: Added missing min, max, and step props to NumberInput component. */}
                        <FormControl label="Custos Operacionais (Mês)"><NumberInput value={provedorState.operationalCosts} onChange={v => handleProvedorChange('operationalCosts', v)} prefix="R$" formatAsCurrency={true} min={0} max={99999} step={100} /></FormControl>
                        <h4 className="font-semibold text-sm uppercase tracking-wider text-[#8c6d59] border-b border-[#e0cbb2] pb-2 mt-4 mb-2 text-center">Parâmetros Tributários</h4>
                        <FormControl label="Regime Tributário"><Select value={provedorState.regime} onChange={v => handleProvedorChange('regime', v)} options={Object.values(TaxRegime)} /></FormControl>
                        <FormControl label="Atividade (CNAE)"><select value={provedorState.cnaeCode} onChange={e => handleProvedorChange('cnaeCode', e.target.value)} className="w-full rounded-md border-[#e0cbb2] bg-white text-[#5c3a21] shadow-sm focus:border-[#ff595a] focus:ring-1 focus:ring-[#ff595a] px-3 py-2">{cnaeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></FormControl>
                        {provedorState.regime === TaxRegime.LUCRO_PRESUMIDO && (<FormControl label="Alíquota de Presunção"><NumberInput value={provedorState.presuncao} onChange={v => handleProvedorChange('presuncao', v)} prefix="%" min={0} max={100} step={1} /></FormControl>)}
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
