
import React from "react";
import { FormControl } from './FormControl.tsx';
import { NumberInput } from './NumberInput.tsx';
import { calculateTax } from '../services/taxCalculator.tsx';
import { TaxRegime } from '../types.tsx';
import { cnaes } from '../data/simplesNacional.tsx';
import { Select } from './Select.tsx';
import { Toggle } from './Toggle.tsx';

export const EcosystemSimulator = ({ scenarios, partnershipModel, simulationYear }) => {
    const { useState, useMemo } = React;

    const [labirintarState, setLabirintarState] = useState({
        operationalCosts: 5000,
        regime: TaxRegime.LUCRO_REAL,
        cnaeCode: '62.02-3-00',
        creditGeneratingCosts: 2500,
        pat: false,
    });
    const handleLabirintarChange = (field, value) => {
        setLabirintarState(prev => ({...prev, [field]: value}));
    }

    const [educatorState, setEducatorState] = useState({
        payPerClass: 2000,
        materialCosts: 500,
        regime: TaxRegime.SIMPLES_NACIONAL,
        cnaeCode: '85.50-3-02',
        rbt12: 40000,
        presuncao: 32,
        creditGeneratingCosts: 0,
        pat: false,
    });
    const handleEducatorChange = (field, value) => {
        setEducatorState(prev => ({...prev, [field]: value}));
    }

    const { totalRevenue, totalTurmas } = useMemo(() => {
        if (!scenarios || scenarios.length === 0) {
            return { totalRevenue: 0, totalTurmas: 0 };
        }
        return scenarios.reduce((acc, scenario) => {
            acc.totalRevenue += scenario.avgStudents * scenario.unitPrice;
            acc.totalTurmas += Object.values(scenario.schedule).reduce((count: number, day) => count + Object.keys(day || {}).length, 0);
            return acc;
        }, { totalRevenue: 0, totalTurmas: 0 });
    }, [scenarios]);

    const labirintarRevenue = useMemo(() => {
        return totalRevenue * (1 - (partnershipModel.schoolPercentage / 100));
    }, [totalRevenue, partnershipModel]);

    const labirintarResult = useMemo(() => {
        const receitaBruta = labirintarRevenue;
        const custosVariaveis = educatorState.payPerClass * totalTurmas;
        const custosFixos = labirintarState.operationalCosts;
        const custosTotais = custosVariaveis + custosFixos;

        const taxResult = calculateTax({
            simulationYear,
            regime: labirintarState.regime,
            receita: receitaBruta,
            custo: custosTotais,
            presuncao: 32, // Not used for this calc, but passed for consistency
            cnaeCode: labirintarState.cnaeCode,
            creditGeneratingCosts: labirintarState.creditGeneratingCosts,
            pat: labirintarState.pat,
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

        const mcPercent = receitaBruta > 0 ? margemContribuicao / receitaBruta : 0;
        const bepReceita = mcPercent > 0 ? custosFixos / mcPercent : Infinity;

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
                impostosSobreResultadoDetails,
                resultadoLiquido,
            },
            bep: {
                receita: bepReceita,
            }
        };
    }, [labirintarRevenue, labirintarState, educatorState.payPerClass, totalTurmas, simulationYear]);

     const educatorResult = useMemo(() => {
        const receitaBruta = educatorState.payPerClass * totalTurmas;
        const rbt12ForCalc = educatorState.rbt12 > 0 ? educatorState.rbt12 : receitaBruta * 12;
        const custosVariaveis = 0;
        const custosFixos = educatorState.materialCosts;
        const custosTotais = custosVariaveis + custosFixos;

        const taxResult = calculateTax({
            simulationYear,
            regime: educatorState.regime,
            receita: receitaBruta,
            custo: custosTotais,
            cnaeCode: educatorState.cnaeCode,
            rbt12: rbt12ForCalc,
            folha: 0,
            presuncao: educatorState.presuncao,
            creditGeneratingCosts: educatorState.creditGeneratingCosts,
            pat: educatorState.pat,
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

        const mcPorTurma = totalTurmas > 0 ? (receitaBruta - custosVariaveis - impostosSobreReceita) / totalTurmas : 0;
        const bepTurmas = mcPorTurma > 0 ? custosFixos / mcPorTurma : Infinity;
        const receitaPorTurma = educatorState.payPerClass;
        const bepReceita = bepTurmas * receitaPorTurma;
        
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
                impostosSobreResultadoDetails,
                resultadoLiquido,
            },
            bep: {
                turmas: bepTurmas,
                receita: bepReceita
            }
        };
    }, [educatorState, totalTurmas, simulationYear]);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const cnaeOptions = useMemo(() => cnaes.map(c => ({
        value: c.cnae,
        label: `${c.cnae} - ${c.descricao}`
    })), []);

    const ScenarioCard = ({ title, subtitle, children }) => (
        <div className="bg-[#f3f0e8] p-6 rounded-2xl shadow-lg border border-[#e0cbb2]">
            <h3 className="text-xl font-bold text-[#5c3a21]">{title}</h3>
            <p className="text-sm text-[#8c6d59] mb-6">{subtitle}</p>
            <div className="space-y-4">
                {children}
            </div>
        </div>
    );
    
    const DREDisplay = ({ dre, bep }) => {
        const { useState } = React;
        const [showReceitaDetails, setShowReceitaDetails] = useState(false);
        const [showResultadoDetails, setShowResultadoDetails] = useState(false);
        
        const formatValue = (value) => new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
        const formatNumber = (value) => new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value);
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
            <div className={`grid grid-cols-[1fr_60px_110px] gap-x-2 items-baseline text-sm ${isSubtotal ? 'font-semibold' : ''} ${isFinal ? 'font-bold text-base' : ''}`}>
                <span className="truncate">{label}</span>
                <span className="font-mono text-xs text-right text-[#8c6d59]">{percent}</span>
                <strong className={`${customColorClass || (isFinal ? resultadoColorClass : 'text-[#5c3a21]')} font-mono text-right`}>{formatValue(value)}</strong>
            </div>
        );
    
        return (
            <div className="mt-6 space-y-2">
                <h4 className="grid grid-cols-[1fr_60px_110px] gap-x-2 font-semibold text-sm uppercase tracking-wider text-[#8c6d59] border-b border-[#e0cbb2] pb-2 mb-4">
                    <span className="text-left">Estrutura de Resultado</span>
                    <span className="text-right">AV %</span>
                    <span className="text-right">Valor</span>
                </h4>
                
                <DRELine label="Receita Bruta" value={dre.receitaBruta} percent={formatPercent(1)} />
                
                {/* Collapsible Impostos s/ Receita */}
                <div className="text-sm">
                    <div className="grid grid-cols-[1fr_60px_110px] gap-x-2 items-center">
                        <button onClick={() => setShowReceitaDetails(!showReceitaDetails)} className="flex items-center gap-2 text-left p-1 -ml-1 rounded-md hover:bg-[#e0cbb2]/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff595a]" aria-expanded={showReceitaDetails}>
                            <span>(-) Impostos s/ Receita</span>
                            <ChevronDownIcon className={`w-3.5 h-3.5 text-[#8c6d59] transition-transform duration-200 ${showReceitaDetails ? 'rotate-180' : ''}`} />
                        </button>
                        <span className="font-mono text-xs text-right text-[#8c6d59]">{formatPercent(dre.receitaBruta > 0 ? -dre.impostosSobreReceita / dre.receitaBruta : 0)}</span>
                        <strong className="font-mono text-right text-[#5c3a21]">{formatValue(-dre.impostosSobreReceita)}</strong>
                    </div>
                    {showReceitaDetails && dre.impostosSobreReceitaDetails && dre.impostosSobreReceitaDetails.length > 0 && (
                        <div className="pl-4 mt-1 space-y-1 text-xs ml-1 py-1">
                            {dre.impostosSobreReceitaDetails.map(tax => {
                                const taxPercent = dre.receitaBruta > 0 ? tax.value / dre.receitaBruta : 0;
                                return (
                                    <div key={tax.name} className="grid grid-cols-[1fr_60px_110px] gap-x-2 items-baseline -ml-4">
                                        <span className="text-[#8c6d59] truncate">{tax.name} ({tax.rate})</span>
                                        <span className="font-mono text-right text-[#8c6d59]">{formatPercent(taxPercent)}</span>
                                        <strong className="font-mono text-right text-[#5c3a21]">{formatValue(tax.value)}</strong>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                <DRELine label="(=) Receita Líquida" value={dre.receitaLiquida} percent={formatPercent(dre.receitaBruta > 0 ? dre.receitaLiquida / dre.receitaBruta : 0)} isSubtotal={true} />
                
                <div className="pt-2 mt-2 border-t border-dashed border-[#e0cbb2]">
                    <DRELine label="(-) Custos Variáveis" value={-dre.custosVariaveis} percent={formatPercent(dre.receitaBruta > 0 ? -dre.custosVariaveis / dre.receitaBruta : 0)} />
                    <div className="grid grid-cols-[1fr_60px_110px] gap-x-2 items-baseline text-sm font-semibold">
                        <span>(=) Margem de Contribuição</span>
                        <span className="font-mono text-xs text-right text-[#8c6d59]">{formatPercent(dre.margemContribuicaoPercent)}</span>
                        <strong className="font-mono text-right text-[#5c3a21]">{formatValue(dre.margemContribuicao)}</strong>
                    </div>
                </div>
    
                <div className="pt-2 mt-2 border-t border-dashed border-[#e0cbb2]">
                    <DRELine label="(-) Custos Fixos" value={-dre.custosFixos} percent={formatPercent(dre.receitaBruta > 0 ? -dre.custosFixos / dre.receitaBruta : 0)} />
                    <DRELine label="(=) EBIT" value={dre.ebit} percent={formatPercent(dre.receitaBruta > 0 ? dre.ebit / dre.receitaBruta : 0)} isSubtotal={true} />
                </div>
    
                <div className="pt-2 mt-2 border-t border-dashed border-[#e0cbb2]">
                    {/* Collapsible Impostos s/ Resultado */}
                    <div className="text-sm">
                        <div className="grid grid-cols-[1fr_60px_110px] gap-x-2 items-center">
                            <button onClick={() => setShowResultadoDetails(!showResultadoDetails)} className="flex items-center gap-2 text-left p-1 -ml-1 rounded-md hover:bg-[#e0cbb2]/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff595a]" aria-expanded={showResultadoDetails}>
                                <span>(-) Impostos s/ Resultado</span>
                                <ChevronDownIcon className={`w-3.5 h-3.5 text-[#8c6d59] transition-transform duration-200 ${showResultadoDetails ? 'rotate-180' : ''}`} />
                            </button>
                            <span className="font-mono text-xs text-right text-[#8c6d59]">{formatPercent(dre.receitaBruta > 0 ? -dre.impostosSobreResultado / dre.receitaBruta : 0)}</span>
                            <strong className="font-mono text-right text-[#5c3a21]">{formatValue(-dre.impostosSobreResultado)}</strong>
                        </div>
                        {showResultadoDetails && dre.impostosSobreResultadoDetails && dre.impostosSobreResultadoDetails.length > 0 && (
                             <div className="pl-4 mt-1 space-y-1 text-xs ml-1 py-1">
                                {dre.impostosSobreResultadoDetails.map(tax => {
                                    const taxPercent = dre.receitaBruta > 0 ? tax.value / dre.receitaBruta : 0;
                                    return (
                                        <div key={tax.name} className="grid grid-cols-[1fr_60px_110px] gap-x-2 items-baseline -ml-4">
                                            <span className="text-[#8c6d59] truncate">{tax.name} ({tax.rate})</span>
                                            <span className="font-mono text-right text-[#8c6d59]">{formatPercent(taxPercent)}</span>
                                            <strong className="font-mono text-right text-[#5c3a21]">{formatValue(tax.value)}</strong>
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
                            {bep.turmas !== undefined && (
                                <p>Turmas: <strong className="text-[#5c3a21]">{isFinite(bep.turmas) ? `${formatNumber(bep.turmas)}` : 'N/A'}</strong></p>
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
            <h2 className="text-2xl font-bold text-center mb-2 text-[#5c3a21]">Análise de Saúde do Ecossistema</h2>
            <p className="text-center text-[#8c6d59] mb-8 max-w-3xl mx-auto">
                Avalie a viabilidade econômico-financeira para os parceiros do ecossistema com base no modelo de remuneração da escola para o ano de {simulationYear}.
            </p>
            
            <div className="p-4 mb-8 bg-white rounded-md border border-[#e0cbb2] text-sm max-w-2xl mx-auto text-center">
                Modelo de Parceria Selecionado: <strong className="text-[#ff595a]">{partnershipModel.model}</strong> | 
                Repasse para Escola: <strong className="text-[#ff595a]">{partnershipModel.schoolPercentage}%</strong> |
                Receita Total Gerada: <strong className="text-[#ff595a]">{formatCurrency(totalRevenue)}</strong>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
                <ScenarioCard
                    title="Viabilidade LABirintar"
                    subtitle="Análise do P&L da LABirintar na parceria."
                    children={<>
                        <FormControl
                            label="Custos Operacionais Fixos (Mês)"
                            children={<NumberInput value={labirintarState.operationalCosts} onChange={v => handleLabirintarChange('operationalCosts', v)} prefix="R$" formatAsCurrency={true} min={0} max={999999} step={1} />}
                        />

                        <h4 className="font-semibold text-sm uppercase tracking-wider text-[#8c6d59] border-b border-[#e0cbb2] pb-2 mt-6 mb-4">Parâmetros Tributários</h4>
                         <FormControl
                            label="Regime Tributário"
                            children={<Select value={labirintarState.regime} onChange={v => handleLabirintarChange('regime', v)} options={[TaxRegime.LUCRO_REAL, TaxRegime.LUCRO_PRESUMIDO, TaxRegime.SIMPLES_NACIONAL]} />}
                        />
                         <FormControl
                            label="Atividade (CNAE)"
                            children={
                                <select value={labirintarState.cnaeCode} onChange={e => handleLabirintarChange('cnaeCode', e.target.value)} className="w-full rounded-md border-[#e0cbb2] bg-white text-[#5c3a21] shadow-sm focus:border-[#ff595a] focus:ring-1 focus:ring-[#ff595a] px-3 py-2">
                                {cnaeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                            }
                        />
                        {labirintarState.regime === TaxRegime.LUCRO_REAL && (
                           <>
                            <FormControl 
                                label="Custos Geradores de Crédito"
                                description="Custos que geram crédito de PIS/COFINS (cenário atual) ou CBS/IBS (reforma)."
                                children={<NumberInput value={labirintarState.creditGeneratingCosts} onChange={v => handleLabirintarChange('creditGeneratingCosts', v)} prefix="R$" formatAsCurrency={true} min={0} max={99999} step={1} />}
                            />
                             <FormControl 
                                label="Optante do PAT?" 
                                description="Reduz o IRPJ devido em 4%." 
                                children={
                                    <div className="flex justify-start">
                                        <Toggle enabled={labirintarState.pat} onChange={v => handleLabirintarChange('pat', v)} />
                                    </div>
                                }
                            />
                           </>
                        )}

                        <DREDisplay dre={labirintarResult.dre} bep={labirintarResult.bep} />
                    </>}
                />

                 <ScenarioCard
                    title="Viabilidade Educador Empreendedor"
                    subtitle="Análise da remuneração do educador parceiro."
                    children={<>
                        <FormControl
                            label="Remuneração por Turma (Mês)"
                            children={<NumberInput value={educatorState.payPerClass} onChange={v => handleEducatorChange('payPerClass', v)} prefix="R$" formatAsCurrency={true} min={0} max={99999} step={1} />}
                        />
                         <FormControl
                            label="Custos de Materiais (Mês)"
                            children={<NumberInput value={educatorState.materialCosts} onChange={v => handleEducatorChange('materialCosts', v)} prefix="R$" formatAsCurrency={true} min={0} max={99999} step={1} />}
                        />
                        
                        <h4 className="font-semibold text-sm uppercase tracking-wider text-[#8c6d59] border-b border-[#e0cbb2] pb-2 mt-6 mb-4">Parâmetros Tributários</h4>
                        <FormControl
                            label="Regime Tributário"
                            children={<Select value={educatorState.regime} onChange={v => handleEducatorChange('regime', v)} options={Object.values(TaxRegime)} />}
                        />
                        <FormControl
                            label="Atividade (CNAE)"
                            children={
                                <select value={educatorState.cnaeCode} onChange={e => handleEducatorChange('cnaeCode', e.target.value)} className="w-full rounded-md border-[#e0cbb2] bg-white text-[#5c3a21] shadow-sm focus:border-[#ff595a] focus:ring-1 focus:ring-[#ff595a] px-3 py-2">
                                    {cnaeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                            }
                        />
                        {educatorState.regime === TaxRegime.SIMPLES_NACIONAL && (
                            <FormControl
                                label="Receita Bruta (Últimos 12 meses)"
                                description="Usado para cálculo da alíquota do Simples Nacional."
                                children={<NumberInput value={educatorState.rbt12} onChange={v => handleEducatorChange('rbt12', v)} prefix="R$" formatAsCurrency={true} min={0} max={4800000} step={1000} />}
                            />
                        )}
                        {educatorState.regime === TaxRegime.LUCRO_PRESUMIDO && (
                            <FormControl 
                                label="Alíquota de Presunção"
                                children={<NumberInput value={educatorState.presuncao} onChange={v => handleEducatorChange('presuncao', v)} prefix="%" min={0} max={100} step={1} />}
                            />
                        )}
                        {educatorState.regime === TaxRegime.LUCRO_REAL && (
                            <>
                                <FormControl 
                                    label="Custos Geradores de Crédito"
                                    description="Custos que geram crédito de PIS/COFINS (cenário atual) ou CBS/IBS (reforma)."
                                    children={<NumberInput value={educatorState.creditGeneratingCosts} onChange={v => handleEducatorChange('creditGeneratingCosts', v)} prefix="R$" formatAsCurrency={true} min={0} max={99999} step={100} />}
                                />
                                <FormControl 
                                    label="Optante do PAT?" 
                                    description="Reduz o IRPJ devido em 4%." 
                                    children={
                                        <div className="flex justify-start">
                                            <Toggle enabled={educatorState.pat} onChange={v => handleEducatorChange('pat', v)} />
                                        </div>
                                    }
                                />
                            </>
                        )}
                        
                        <DREDisplay dre={educatorResult.dre} bep={educatorResult.bep} />
                    </>}
                />
            </div>
             <p className="text-center text-xs text-[#8c6d59] mt-8 max-w-3xl mx-auto">
                Atenção: Esta é uma simulação simplificada para fins de planejamento estratégico. Custos e impostos podem variar.
            </p>
        </div>
    );
};
