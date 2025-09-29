import React from "react";
import { FormControl } from './FormControl.tsx';
import { NumberInput } from './NumberInput.tsx';

export const EcosystemSimulator = ({ scenarios, partnershipModel }) => {
    const { useState, useMemo } = React;

    const [labirintarState, setLabirintarState] = useState({
        operationalCosts: 5000,
        taxRate: 15,
    });
    const handleLabirintarChange = (field, value) => {
        setLabirintarState(prev => ({...prev, [field]: value}));
    }

    const [educatorState, setEducatorState] = useState({
        payPerClass: 2000,
        materialCosts: 500,
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
            // FIX: Explicitly typed the 'count' accumulator to prevent a type error.
            acc.totalTurmas += Object.values(scenario.schedule).reduce((count: number, day) => count + Object.keys(day || {}).length, 0);
            return acc;
        }, { totalRevenue: 0, totalTurmas: 0 });
    }, [scenarios]);

    const labirintarRevenue = useMemo(() => {
        return totalRevenue * (1 - (partnershipModel.schoolPercentage / 100));
    }, [totalRevenue, partnershipModel]);

    const labirintarResult = useMemo(() => {
        const impostos = labirintarRevenue * (labirintarState.taxRate / 100);
        const custosTotais = labirintarState.operationalCosts + (educatorState.payPerClass * totalTurmas);
        const resultado = labirintarRevenue - custosTotais - impostos;
        return {
            receita: labirintarRevenue,
            custos: custosTotais,
            impostos: impostos,
            resultado: resultado,
        };
    }, [labirintarRevenue, labirintarState, educatorState, totalTurmas]);

     const educatorResult = useMemo(() => {
        const receita = educatorState.payPerClass * totalTurmas;
        const custos = educatorState.materialCosts;
        const resultado = receita - custos;
         return {
            receita: receita,
            custos: custos,
            impostos: 0, // Simplificação
            resultado: resultado,
        };
    }, [educatorState, totalTurmas]);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const ScenarioCard = ({ title, subtitle, children }) => (
        <div className="bg-[#f3f0e8] p-6 rounded-2xl shadow-lg border border-[#e0cbb2]">
            <h3 className="text-xl font-bold text-[#5c3a21]">{title}</h3>
            <p className="text-sm text-[#8c6d59] mb-6">{subtitle}</p>
            <div className="space-y-4">
                {children}
            </div>
        </div>
    );
    
    const ResultDisplay = ({ result }) => (
        <div className="mt-6 space-y-2 text-sm">
            <div className="flex justify-between"><span>Receita Bruta</span> <strong>{formatCurrency(result.receita)}</strong></div>
            <div className="flex justify-between text-red-700"><span>(-) Custos e Despesas</span> <span>{formatCurrency(result.custos)}</span></div>
            <div className="flex justify-between text-red-700"><span>(-) Impostos (Simplificado)</span> <span>{formatCurrency(result.impostos)}</span></div>
            <hr className="border-t border-[#e0cbb2] my-2" />
            <div className="flex justify-between font-bold text-base"><span>(=) Resultado Líquido</span> <span className="text-[#ff595a]">{formatCurrency(result.resultado)}</span></div>
        </div>
    );


    return (
        <div className="mt-4">
            <h2 className="text-2xl font-bold text-center mb-2 text-[#5c3a21]">Análise de Saúde do Ecossistema</h2>
            <p className="text-center text-[#8c6d59] mb-8 max-w-3xl mx-auto">
                Avalie a viabilidade econômico-financeira para os parceiros do ecossistema com base no modelo de remuneração da escola.
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
                            // FIX: Added missing 'max' prop to NumberInput.
                            children={<NumberInput value={labirintarState.operationalCosts} onChange={v => handleLabirintarChange('operationalCosts', v)} prefix="R$" min={0} max={1000000} step={100} />}
                        />
                         <FormControl
                            label="Alíquota de Imposto Simplificada (%)"
                            children={<NumberInput value={labirintarState.taxRate} onChange={v => handleLabirintarChange('taxRate', v)} prefix="%" min={0} max={100} step={1} />}
                        />
                        <ResultDisplay result={labirintarResult} />
                    </>}
                />

                 <ScenarioCard
                    title="Viabilidade Educador Empreendedor"
                    subtitle="Análise da remuneração do educador parceiro."
                    children={<>
                        <FormControl
                            label="Remuneração por Turma (Mês)"
                            // FIX: Added missing 'max' prop to NumberInput.
                            children={<NumberInput value={educatorState.payPerClass} onChange={v => handleEducatorChange('payPerClass', v)} prefix="R$" min={0} max={20000} step={50} />}
                        />
                         <FormControl
                            label="Custos de Materiais (Mês)"
                            // FIX: Added missing 'max' prop to NumberInput.
                            children={<NumberInput value={educatorState.materialCosts} onChange={v => handleEducatorChange('materialCosts', v)} prefix="R$" min={0} max={50000} step={50} />}
                        />
                        <ResultDisplay result={educatorResult} />
                    </>}
                />
            </div>
             <p className="text-center text-xs text-[#8c6d59] mt-8 max-w-3xl mx-auto">
                Atenção: Esta é uma simulação simplificada para fins de planejamento estratégico. Custos e impostos podem variar.
            </p>
        </div>
    );
};
