

import React from "react";
import { TaxRegime } from '../types.tsx';
import { cnaes, tabelasSimplesNacional } from '../data/simplesNacional.tsx';
import { calculateTax } from '../services/taxCalculator.tsx';
import { FormControl } from './FormControl.tsx';
import { Slider } from './Slider.tsx';
import { Select } from './Select.tsx';
import { NumberInput } from './NumberInput.tsx';
import { Toggle } from './Toggle.tsx';
import { GoogleAppsScriptViewer } from './GoogleAppsScriptViewer.tsx';

export const TributarySimulator = ({ simulationYear }) => {
  const { useState, useMemo } = React;
  
  const [regime, setRegime] = useState(TaxRegime.LUCRO_PRESUMIDO);
  const [receita, setReceita] = useState(100000);
  const [custo, setCusto] = useState(50000);
  const [presuncao, setPresuncao] = useState(32);
  const [pat, setPat] = useState(false);
  const [creditGeneratingCosts, setCreditGeneratingCosts] = useState(30000);
  const [cnaeCode, setCnaeCode] = useState(cnaes[8].cnae); // Default: Ensino Médio
  const [rbt12, setRbt12] = useState(1200000);
  const [folha, setFolha] = useState(336000);

  const selectedCnae = useMemo(() => cnaes.find(c => c.cnae === cnaeCode), [cnaeCode]);
  const needsFatorR = useMemo(() => selectedCnae?.observacao.includes('Fator R'), [selectedCnae]);

  const anexoInfo = useMemo(() => {
    if (!selectedCnae || regime !== TaxRegime.SIMPLES_NACIONAL) return null;
    let anexoId = selectedCnae.anexo;
    if (needsFatorR) {
      const fatorR = rbt12 > 0 ? folha / rbt12 : 0;
      anexoId = fatorR >= 0.28 ? 'III' : 'V';
    }
    return tabelasSimplesNacional.find(a => a.anexo === anexoId);
  }, [selectedCnae, regime, needsFatorR, rbt12, folha]);

  const faixaInfo = useMemo(() => {
    if (!anexoInfo || isNaN(rbt12)) return null;
    return anexoInfo.faixas.find(f => rbt12 >= f.receita_12m_min && rbt12 <= f.receita_12m_max) || null;
  }, [anexoInfo, rbt12]);

  const result = useMemo(() => {
    return calculateTax({
      simulationYear,
      regime,
      receita,
      custo,
      presuncao,
      pat,
      cnaeCode,
      rbt12,
      folha,
      creditGeneratingCosts,
    });
  }, [simulationYear, regime, receita, custo, presuncao, pat, cnaeCode, rbt12, folha, creditGeneratingCosts]);

  const cnaeOptions = useMemo(() => cnaes.map(c => ({
    value: c.cnae,
    label: `${c.cnae} - ${c.descricao}`
  })), []);
  
  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div className="my-2">
      <div className="flex flex-wrap justify-between items-center gap-y-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#5c3a21]">Calculadora Tributária</h2>
            <p className="text-[#8c6d59] max-w-3xl mt-1">
              Use a calculadora para fazer simulações tributárias pontuais e entender o impacto de cada regime e da reforma tributária em um cenário específico.
            </p>
          </div>
          <GoogleAppsScriptViewer />
      </div>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-6 border-t border-dashed border-[#e0cbb2]">
        {/* Input Column */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg border border-[#e0cbb2] space-y-6">
          <h2 className="text-xl font-bold">Parâmetros da Simulação</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormControl label="Receita Bruta (Mensal)">
                  <NumberInput value={receita} onChange={setReceita} prefix="R$" formatAsCurrency={true} min={0} max={9999999} step={1000} />
              </FormControl>
              <FormControl label="Custo/Despesa Total (Mensal)">
                  <NumberInput value={custo} onChange={setCusto} prefix="R$" formatAsCurrency={true} min={0} max={9999999} step={1000} />
              </FormControl>
          </div>
          
          <h3 className="font-semibold text-lg uppercase tracking-wider text-[#8c6d59] border-b border-[#e0cbb2] pb-2 mt-6 mb-4">Parâmetros Tributários</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormControl label="Regime Tributário">
                  <Select value={regime} onChange={setRegime} options={Object.values(TaxRegime)} />
              </FormControl>
              <FormControl label="Atividade (CNAE)">
                  <select value={cnaeCode} onChange={e => setCnaeCode(e.target.value)} className="w-full rounded-md border-[#e0cbb2] bg-white text-[#5c3a21] shadow-sm focus:border-[#ff595a] focus:ring-1 focus:ring-[#ff595a] px-3 py-2">
                      {cnaeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
              </FormControl>
          </div>

          {regime === TaxRegime.SIMPLES_NACIONAL && (
              <div className="p-4 bg-[#f3f0e8] rounded-lg border border-dashed border-[#e0cbb2] space-y-4">
                   <h4 className="font-semibold text-center text-[#8c6d59]">Parâmetros do Simples Nacional</h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormControl label="Receita Bruta (Últimos 12 meses)">
                          <NumberInput value={rbt12} onChange={setRbt12} prefix="R$" formatAsCurrency={true} min={0} max={4800000} step={10000} />
                      </FormControl>
                      <FormControl label="Folha de Pagamento (Últimos 12 meses)" description={needsFatorR ? 'Usado para o Fator R' : 'Não aplicável para este CNAE'}>
                          <NumberInput value={folha} onChange={setFolha} prefix="R$" formatAsCurrency={true} disabled={!needsFatorR} min={0} max={4800000} step={10000}/>
                      </FormControl>
                   </div>
              </div>
          )}
          
          {regime === TaxRegime.LUCRO_PRESUMIDO && (
               <div className="p-4 bg-[#f3f0e8] rounded-lg border border-dashed border-[#e0cbb2] space-y-4">
                   <h4 className="font-semibold text-center text-[#8c6d59]">Parâmetros do Lucro Presumido</h4>
                   <FormControl label="Alíquota de Presunção">
                      <NumberInput value={presuncao} onChange={setPresuncao} prefix="%" min={0} max={100} step={1} />
                   </FormControl>
              </div>
          )}

          {regime === TaxRegime.LUCRO_REAL && (
              <div className="p-4 bg-[#f3f0e8] rounded-lg border border-dashed border-[#e0cbb2] space-y-4">
                  <h4 className="font-semibold text-center text-[#8c6d59]">Parâmetros do Lucro Real</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormControl label="Custos Geradores de Crédito" description="Custos que geram crédito de PIS/COFINS (atual) ou CBS/IBS (reforma).">
                          <NumberInput value={creditGeneratingCosts} onChange={setCreditGeneratingCosts} prefix="R$" formatAsCurrency={true} min={0} max={9999999} step={1000} />
                      </FormControl>
                      <FormControl label="Optante do PAT?" description="Reduz o IRPJ devido em 4%.">
                          <div className="flex justify-start pt-2">
                              <Toggle enabled={pat} onChange={setPat} />
                          </div>
                      </FormControl>
                  </div>
              </div>
          )}
        </div>

        {/* Results Column */}
        <div className="lg:col-span-1 bg-[#f3f0e8] p-6 rounded-2xl shadow-inner border border-[#e0cbb2]">
          <h2 className="text-xl font-bold mb-4 text-center">Resultado da Simulação</h2>
          <div className="bg-white p-6 rounded-xl shadow-md border border-[#e0cbb2]">
              <div className="text-center border-b border-dashed border-[#e0cbb2] pb-4 mb-4">
                  <p className="text-sm uppercase font-bold text-[#8c6d59]">Total de Impostos</p>
                  <p className="text-4xl font-bold text-[#ff595a]">{formatCurrency(result.total)}</p>
                  <p className="text-sm font-semibold text-[#8c6d59]">Alíquota Efetiva: {(result.effectiveRate * 100).toFixed(2).replace('.', ',')}%</p>
              </div>
              <h3 className="text-base font-bold text-center mb-3 text-[#5c3a21]">Detalhamento dos Impostos</h3>
              <div className="space-y-2">
                  {result.breakdown.map((tax, index) => (
                      <div key={index} className={`p-2 rounded-md ${tax.category === 'informativo' ? 'bg-blue-50 text-blue-800' : 'bg-[#f3f0e8]'}`}>
                          <div className="flex justify-between items-baseline text-sm">
                              <span className="font-semibold text-[#5c3a21]">{tax.name}</span>
                              <span className="font-mono font-bold text-[#5c3a21]">{formatCurrency(tax.value)}</span>
                          </div>
                           {tax.rate && <p className="text-xs text-right text-[#8c6d59]">{tax.rate}</p>}
                      </div>
                  ))}
              </div>
          </div>
          
          {regime === TaxRegime.SIMPLES_NACIONAL && anexoInfo && (
              <div className="mt-6 bg-white p-4 rounded-xl shadow-md border border-[#e0cbb2] text-center">
                  <h3 className="text-base font-bold mb-2 text-[#5c3a21]">Enquadramento Simples Nacional</h3>
                  <p className="text-sm text-[#8c6d59]">Anexo: <strong className="text-[#5c3a21]">{anexoInfo.anexo}</strong></p>
                  {faixaInfo && <p className="text-sm text-[#8c6d59]">Faixa: <strong className="text-[#5c3a21]">{faixaInfo.ordem}</strong></p>}
                  {needsFatorR && <p className="text-sm text-[#8c6d59]">Fator R: <strong className="text-[#5c3a21]">{rbt12 > 0 ? ((folha / rbt12) * 100).toFixed(2) : 0}%</strong></p>}
              </div>
          )}
        </div>
      </main>
    </div>
  );
};
