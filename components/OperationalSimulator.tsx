

import React from "react";
import { TaxRegime } from '../types.tsx';
import { cnaes } from '../data/simplesNacional.tsx';
import { calculateTax } from '../services/taxCalculator.tsx';
import { FormControl } from './FormControl.tsx';
import { NumberInput } from './NumberInput.tsx';
import { Select } from './Select.tsx';
import { ExportToSheets } from './ExportToSheets.tsx';

export const OperationalSimulator = () => {
    const { useState, useMemo } = React;
    const [numAlunos, setNumAlunos] = useState(180);
    const [mensalidade, setMensalidade] = useState(350);

    const [fazerState, setFazerState] = useState({
        custoInstrutor: 4500,
        numTurmas: 12,
        outrosCustos: 3000,
        regime: TaxRegime.LUCRO_REAL,
        cnaeCode: '85.50-3-02',
        creditGeneratingCosts: 1500,
    });

    const handleFazerChange = (field, value) => {
        setFazerState(prev => ({ ...prev, [field]: value }));
    };

    const [comprarState, setComprarState] = useState({
        receitaParceria: 15000,
        regime: TaxRegime.LUCRO_PRESUMIDO,
        cnaeCode: '74.90-1-04',
        presuncao: 32,
    });
    
    const handleComprarChange = (field, value) => {
        setComprarState(prev => ({ ...prev, [field]: value }));
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const fazerResult = useMemo(() => {
        const receita = numAlunos * mensalidade;
        const custos = (fazerState.custoInstrutor * fazerState.numTurmas) + fazerState.outrosCustos;
        
        const taxResult = calculateTax({
            simulationYear: 2033,
            regime: fazerState.regime,
            receita,
            custo: custos,
            presuncao: 32,
            pat: false,
            cnaeCode: fazerState.cnaeCode,
            creditGeneratingCosts: fazerState.creditGeneratingCosts,
        });

        return {
            receita,
            custos,
            impostos: taxResult.total,
            resultado: receita - custos - taxResult.total
        };
    }, [numAlunos, mensalidade, fazerState]);

    const comprarResult = useMemo(() => {
        const receita = comprarState.receitaParceria;
        const taxResult = calculateTax({
            simulationYear: 2033,
            regime: comprarState.regime,
            receita,
            custo: 0,
            presuncao: comprarState.presuncao,
            pat: false,
            cnaeCode: comprarState.cnaeCode,
            creditGeneratingCosts: 0,
        });
        
        return {
            receita,
            custos: 0,
            impostos: taxResult.total,
            resultado: receita - taxResult.total
        };
    }, [comprarState]);

    const cnaeOptions = useMemo(() => cnaes.map(c => ({
        value: c.cnae,
        label: `${c.cnae} - ${c.descricao}`
    })), []);
    
    const diferencaResultado = comprarResult.resultado - fazerResult.resultado;

    const ScenarioCard = ({ title, subtitle, children, className = "" }) => (
        <div className={`bg-[#f3f0e8] p-6 rounded-2xl shadow-lg border border-[#e0cbb2] ${className}`}>
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
            <div className="flex justify-between text-red-700"><span>(-) Impostos</span> <span>{formatCurrency(result.impostos)}</span></div>
            <hr className="border-t border-[#e0cbb2] my-2" />
            <div className="flex justify-between font-bold text-base"><span>(=) Resultado Líquido</span> <span className="text-[#ff595a]">{formatCurrency(result.resultado)}</span></div>
        </div>
    );

    return (
        <div className="mt-12">
            <h2 className="text-2xl font-bold text-center mb-2 text-[#5c3a21]">Simulador Operacional: Fazer vs. Comprar</h2>
            <p className="text-center text-[#8c6d59] mb-8 max-w-3xl mx-auto">
                Compare o resultado financeiro de operar o extracurricular internamente versus firmar uma parceria com a LABirintar,
                considerando um cenário futuro com a Reforma Tributária consolidada (2033+).
            </p>

            {/* FIX: Correctly wrap child component within ScenarioCard */}
            <ScenarioCard title="Parâmetros Gerais da Demanda" subtitle="Valores que impactam a receita no cenário 'Fazer'.">
                <div className="grid md:grid-cols-2 gap-4">
                    {/* FIX: Correctly wrap child component within FormControl */}
                    <FormControl label="Nº Total de Alunos no Extracurricular">
                        <NumberInput value={numAlunos} onChange={setNumAlunos} min={0} max={1000} step={1} />
                    </FormControl>
                    {/* FIX: Correctly wrap child component within FormControl */}
                    <FormControl label="Mensalidade Média por Aluno">
                        <NumberInput value={mensalidade} onChange={setMensalidade} prefix="R$" min={0} max={2000} step={10} />
                    </FormControl>
                </div>
            </ScenarioCard>

            <div className="grid md:grid-cols-2 gap-8 mt-8">
                {/* FIX: Correctly wrap child component within ScenarioCard */}
                <ScenarioCard title="Cenário 1: Fazer" subtitle="Operação internalizada pela escola.">
                    <h4 className="font-semibold text-sm uppercase tracking-wider text-[#8c6d59] border-b border-[#e0cbb2] pb-2 mb-4">Parâmetros de Custo</h4>
                    {/* FIX: Correctly wrap child component within FormControl */}
                    <FormControl label="Custo Total por Instrutor/Turma (CLT)">
                        <NumberInput value={fazerState.custoInstrutor} onChange={v => handleFazerChange('custoInstrutor', v)} prefix="R$" min={0} max={20000} step={100} />
                    </FormControl>
                    {/* FIX: Correctly wrap child component within FormControl */}
                    <FormControl label="Nº de Turmas Necessárias">
                        <NumberInput value={fazerState.numTurmas} onChange={v => handleFazerChange('numTurmas', v)} min={0} max={100} step={1} />
                    </FormControl>
                    {/* FIX: Correctly wrap child component within FormControl */}
                    <FormControl label="Outros Custos Mensais (Software, Marketing, etc.)">
                        <NumberInput value={fazerState.outrosCustos} onChange={v => handleFazerChange('outrosCustos', v)} prefix="R$" min={0} max={50000} step={100} />
                    </FormControl>

                    <h4 className="font-semibold text-sm uppercase tracking-wider text-[#8c6d59] border-b border-[#e0cbb2] pb-2 my-4 pt-4">Parâmetros Tributários</h4>
                    {/* FIX: Correctly wrap child component within FormControl */}
                    <FormControl label="Regime Tributário">
                        <Select value={fazerState.regime} onChange={v => handleFazerChange('regime', v)} options={[TaxRegime.LUCRO_REAL, TaxRegime.LUCRO_PRESUMIDO]} />
                    </FormControl>
                     {/* FIX: Correctly wrap child component within FormControl */}
                     <FormControl label="Atividade (CNAE)">
                        <select value={fazerState.cnaeCode} onChange={e => handleFazerChange('cnaeCode', e.target.value)} className="w-full rounded-md border-[#e0cbb2] bg-white text-[#5c3a21] shadow-sm focus:border-[#ff595a] focus:ring-1 focus:ring-[#ff595a] px-3 py-2">
                           {cnaeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </FormControl>
                    {fazerState.regime === TaxRegime.LUCRO_REAL && (
                         // FIX: Correctly wrap child component within FormControl
                         <FormControl label="Custos Geradores de Crédito (CBS/IBS)">
                            <NumberInput value={fazerState.creditGeneratingCosts} onChange={v => handleFazerChange('creditGeneratingCosts', v)} prefix="R$" min={0} max={100000} step={100} />
                        </FormControl>
                    )}
                   <ResultDisplay result={fazerResult} />
                </ScenarioCard>

                {/* FIX: Correctly wrap child component within ScenarioCard */}
                <ScenarioCard title="Cenário 2: Comprar" subtitle="Parceria estratégica com a LABirintar.">
                    <h4 className="font-semibold text-sm uppercase tracking-wider text-[#8c6d59] border-b border-[#e0cbb2] pb-2 mb-4">Parâmetros de Receita</h4>
                    {/* FIX: Correctly wrap child component within FormControl */}
                    <FormControl label="Receita Mensal da Parceria (Ex: Locação)">
                        <NumberInput value={comprarState.receitaParceria} onChange={v => handleComprarChange('receitaParceria', v)} prefix="R$" min={0} max={100000} step={100} />
                    </FormControl>
                    
                    <h4 className="font-semibold text-sm uppercase tracking-wider text-[#8c6d59] border-b border-[#e0cbb2] pb-2 my-4 pt-4">Parâmetros Tributários</h4>
                    {/* FIX: Correctly wrap child component within FormControl */}
                    <FormControl label="Regime Tributário">
                        <Select value={comprarState.regime} onChange={v => handleComprarChange('regime', v)} options={[TaxRegime.LUCRO_PRESUMIDO, TaxRegime.LUCRO_REAL]} />
                    </FormControl>
                     {/* FIX: Correctly wrap child component within FormControl */}
                     <FormControl label="Atividade (CNAE)">
                        <select value={comprarState.cnaeCode} onChange={e => handleComprarChange('cnaeCode', e.target.value)} className="w-full rounded-md border-[#e0cbb2] bg-white text-[#5c3a21] shadow-sm focus:border-[#ff595a] focus:ring-1 focus:ring-[#ff595a] px-3 py-2">
                           {cnaeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </FormControl>
                    {comprarState.regime === TaxRegime.LUCRO_PRESUMIDO && (
                         // FIX: Correctly wrap child component within FormControl
                         <FormControl label="Alíquota de Presunção">
                           <NumberInput value={comprarState.presuncao} onChange={v => handleComprarChange('presuncao', v)} prefix="%" min={0} max={100} step={1} />
                        </FormControl>
                    )}
                     <ResultDisplay result={comprarResult} />
                </ScenarioCard>
            </div>

             <div className="mt-8 bg-white p-6 rounded-2xl shadow-xl border-2 border-[#ff595a]">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-[#5c3a21]">Análise Comparativa de Resultado</h3>
                    <ExportToSheets />
                </div>
                <div className="mt-4 text-center">
                    {diferencaResultado > 0 ? (
                        <p className="text-lg">
                            O cenário <strong>"Comprar"</strong> (Parceria LABirintar) é <strong className="text-green-600">{formatCurrency(diferencaResultado)}</strong> mais rentável por mês.
                        </p>
                    ) : (
                         <p className="text-lg">
                            O cenário <strong>"Fazer"</strong> (Operação Própria) é <strong className="text-red-600">{formatCurrency(Math.abs(diferencaResultado))}</strong> mais rentável por mês.
                        </p>
                    )}
                     <p className="text-sm text-[#8c6d59] mt-2 max-w-2xl mx-auto">
                        Esta análise é puramente financeira. O cenário "Comprar" também elimina riscos operacionais, trabalhistas, de inadimplência e a complexidade da gestão, agregando valor estratégico não quantificado aqui.
                    </p>
                </div>
            </div>

        </div>
    );
};
