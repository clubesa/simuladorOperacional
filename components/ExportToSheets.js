
import React from "react";
import { TaxRegime } from "../types.js";
import { allComponents } from "../data/jamSessionData.js";

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
    return `${(value * 100).toFixed(2).replace('.', ',')}%`;
};

const stringToColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
};

const DRETableHTML = ({ dre, title, remuneracaoHorariaLiquida, totalMonthlyHours }) => {
    const resultadoColorClass = dre.resultadoLiquido >= 0 ? 'text-green-700' : 'text-red-700';

    const renderDetails = (details) => {
        if (!details || details.length === 0) return '';
        return details.map(item => {
            if (item.value === 0) return '';
            
            // Logic for Hierarchical Groups (Level 2: Item -> Level 3: Schools)
            if (item.isGroup && item.subDetails) {
                let groupHtml = `
                    <div class="mb-2 mt-2 border-l-4 border-[#bf917f] pl-2 bg-gray-50 rounded py-1">
                        <div class="flex justify-between items-center font-bold text-xs text-[#5c3a21] mb-1">
                            <span>${item.name}</span>
                            <span>${formatCurrencyWithoutSymbol(item.value)}</span>
                        </div>
                `;
                groupHtml += item.subDetails.map(sub => `
                    <div class="grid grid-cols-3 gap-2 py-0.5 text-[10px] text-gray-600 pl-2 border-l border-dashed border-gray-300 ml-1">
                        <span>${sub.name}${sub.rate ? ` (${sub.rate})` : ''}</span>
                        <span class="text-right font-mono">-</span>
                        <span class="text-right font-mono">${formatCurrencyWithoutSymbol(sub.value)}</span>
                    </div>
                `).join('');
                groupHtml += `</div>`;
                return groupHtml;
            }

            // Standard Level 1 Item
            const value = item.value || 0;
            const percentValue = item.category === 'receita' || item.category === 'resultado' ? value : -value;
            return `
            <div class="grid grid-cols-3 gap-2 py-1 text-xs text-gray-600">
                <span class="pl-4">- ${item.name}${item.rate ? ` (${item.rate})` : ''}</span>
                <span class="text-right font-mono">${formatPercent(dre.receitaBruta > 0 ? percentValue / dre.receitaBruta : 0)}</span>
                <span class="text-right font-mono">${formatCurrencyWithoutSymbol(value)}</span>
            </div>
            ${item.details ? `<div class="col-span-3 pl-8 text-[10px] text-gray-500 italic">${item.details}</div>` : ''}
        `}).join('');
    };

    const rows = [
        { label: "Receita Bruta", value: dre.receitaBruta, percent: 1, details: renderDetails(dre.receitaBrutaDetails) },
        { 
            label: `(-) Impostos s/ Receita`, 
            value: -dre.impostosSobreReceita, 
            percent: dre.receitaBruta > 0 ? -dre.impostosSobreReceita / dre.receitaBruta : 0,
            details: renderDetails(dre.impostosSobreReceitaDetails)
        },
        { label: "(=) Receita Líquida", value: dre.receitaLiquida, percent: dre.receitaBruta > 0 ? dre.receitaLiquida / dre.receitaBruta : 0, isSubtotal: true },
        { 
            label: `(-) Custos Variáveis`, 
            value: -dre.custosVariaveis, 
            percent: dre.receitaBruta > 0 ? -dre.custosVariaveis / dre.receitaBruta : 0,
            details: renderDetails(dre.custosVariaveisDetails)
        },
        { label: "(=) Margem de Contribuição", value: dre.margemContribuicao, percent: dre.margemContribuicaoPercent, isSubtotal: true },
        { 
            label: `(-) Custos Fixos`, 
            value: -dre.custosFixos, 
            percent: dre.receitaBruta > 0 ? -dre.custosFixos / dre.receitaBruta : 0,
            details: renderDetails(dre.custosFixosDetails)
        },
        { label: "(=) EBIT", value: dre.ebit, percent: dre.receitaBruta > 0 ? dre.ebit / dre.receitaBruta : 0, isSubtotal: true },
        { 
            label: `(-) Impostos s/ Resultado`, 
            value: -dre.impostosSobreResultado, 
            percent: dre.receitaBruta > 0 ? -dre.impostosSobreResultado / dre.receitaBruta : 0,
            details: renderDetails(dre.impostosSobreResultadoDetails)
        },
        { label: "(=) Resultado Líquido", value: dre.resultadoLiquido, percent: dre.receitaBruta > 0 ? dre.resultadoLiquido / dre.receitaBruta : 0, isFinal: true },
    ];
    
     if (remuneracaoHorariaLiquida !== undefined && totalMonthlyHours !== undefined) {
        rows.push({ 
            label: `(i) Remuneração / Hora`, 
            value: remuneracaoHorariaLiquida,
            isInfo: true,
            detailsText: `Baseado em ${totalMonthlyHours.toFixed(0)}h/mês.`
        });
    }

    let tableHtml = `
        <div class="bg-white p-6 rounded-lg shadow-md border border-gray-200 break-inside-avoid">
            <h3 class="text-xl font-bold text-[#5c3a21] mb-4">${title}</h3>
            <div class="space-y-1 text-sm">
                <div class="grid grid-cols-3 gap-2 font-semibold text-[#8c6d59] border-b pb-2">
                    <span>Descrição</span>
                    <span class="text-right">AV %</span>
                    <span class="text-right">Valor (R$)</span>
                </div>`;
    
    rows.forEach(item => {
        if (item.isInfo) {
             tableHtml += `
                <div class="grid grid-cols-3 gap-2 py-1 mt-2 border-t border-dashed border-gray-300 items-center">
                    <span class="font-semibold">${item.label}</span>
                    <span class="text-right text-xs text-gray-500">${item.detailsText}</span>
                    <span class="text-right font-mono font-bold text-[#5c3a21]">${formatCurrencyWithoutSymbol(item.value)}</span>
                </div>
            `;
        } else {
            tableHtml += `
                <div class="grid grid-cols-3 gap-2 py-1 ${item.isSubtotal ? 'border-t border-dashed border-gray-300 font-semibold' : ''} ${item.isFinal ? 'border-t-2 border-gray-400 font-bold' : ''}">
                    <span>${item.label}</span>
                    <span class="text-right font-mono">${formatPercent(item.percent)}</span>
                    <span class="text-right font-mono ${item.isFinal ? resultadoColorClass : ''}">${formatCurrencyWithoutSymbol(item.value)}</span>
                </div>
            `;
        }
        if (item.details) {
            tableHtml += `<div class="bg-gray-50 rounded px-2 py-1">${item.details}</div>`;
        }
    });

    tableHtml += `</div></div>`;
    return tableHtml;
};

const generateScenariosTableHTML = (inputScenarios) => {
    if (!inputScenarios || inputScenarios.length === 0) return '';

    return `
        <div class="bg-white p-6 rounded-lg shadow-md border border-[#e0cbb2] mb-8 break-inside-avoid">
            <h3 class="text-lg font-bold text-[#5c3a21] mb-4 border-b border-[#e0cbb2] pb-2">Cenários de Demanda (Inputs)</h3>
            <div class="overflow-x-auto">
                <table class="w-full text-xs text-left">
                    <thead>
                        <tr class="bg-[#f4f0e8] text-[#5c3a21]">
                            <th class="p-2 font-bold border-r border-[#e0cbb2]">Produto</th>
                            <th class="p-2 text-center border-r border-[#e0cbb2]">Freq.</th>
                            <th class="p-2 text-center border-r border-[#e0cbb2]">Alunos</th>
                            <th class="p-2 text-center border-r border-[#e0cbb2]">Turmas</th>
                            <th class="p-2 text-right">Preço Unit.</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${inputScenarios.map((s, i) => `
                            <tr class="border-b border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}">
                                <td class="p-2 border-r border-gray-100 font-medium text-[#5c3a21]">${s.name}</td>
                                <td class="p-2 text-center border-r border-gray-100">${s.freq}x</td>
                                <td class="p-2 text-center border-r border-gray-100 font-bold">${s.students}</td>
                                <td class="p-2 text-center border-r border-gray-100">${s.turmas || '-'}</td>
                                <td class="p-2 text-right font-mono text-[#5c3a21]">${formatCurrency(s.price)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
};

const generateGlobalGridHTML = (globalSchedule, maxCapacity, schoolName) => {
    if (!globalSchedule || Object.keys(globalSchedule).length === 0) return '';

    const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
    const slots = Array.from(new Set(Object.values(globalSchedule).flatMap(day => Object.keys(day)))).sort();

    return `
        <div class="bg-white p-6 rounded-lg shadow-md border border-gray-200 mt-8 break-inside-avoid">
            <h3 class="text-xl font-bold text-[#5c3a21] mb-2">Grade Horária - ${schoolName}</h3>
            
            <!-- LEGENDA DE OCUPAÇÃO -->
            <div class="flex flex-wrap gap-4 mb-4 text-xs border-b border-gray-100 pb-4">
                <span class="font-bold text-[#8c6d59] mr-2 self-center">Taxa de Ocupação:</span>
                <div class="flex items-center gap-1">
                    <div class="w-3 h-3 rounded border border-gray-300" style="background-color: #fef2f2;"></div>
                    <span class="text-[#5c3a21]">Lotado (100%+)</span>
                </div>
                <div class="flex items-center gap-1">
                    <div class="w-3 h-3 rounded border border-gray-300" style="background-color: #ecfdf5;"></div>
                    <span class="text-[#5c3a21]">Eficiente (70%-99%)</span>
                </div>
                <div class="flex items-center gap-1">
                    <div class="w-3 h-3 rounded border border-gray-300" style="background-color: #fffbeb;"></div>
                    <span class="text-[#5c3a21]">Moderado (40%-69%)</span>
                </div>
                <div class="flex items-center gap-1">
                    <div class="w-3 h-3 rounded border border-gray-300" style="background-color: #f9fafb;"></div>
                    <span class="text-[#5c3a21]">Ocioso (<40%)</span>
                </div>
            </div>

            <div class="overflow-x-auto rounded-lg border border-gray-200">
                <table class="w-full text-xs text-left border-collapse">
                    <thead>
                        <tr class="bg-[#f4f0e8]">
                            <th class="p-2 border-r border-gray-200 text-[#8c6d59] w-20 text-center">Horário</th>
                            ${days.map(day => `<th class="p-2 border-r border-gray-200 text-center text-[#8c6d59] min-w-[120px]">${day}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${slots.map(slot => `
                            <tr class="border-t border-gray-200">
                                <td class="p-2 border-r border-gray-200 font-semibold text-[#8c6d59] text-center">${slot}</td>
                                ${days.map(day => {
                                    const data = globalSchedule[day]?.[slot];
                                    if (!data) return `<td class="p-2 border-r border-gray-200"></td>`;

                                    const { totalStudents, breakdown, classesNeeded, generalistStudents } = data;
                                    
                                    const occupancy = totalStudents / (classesNeeded * maxCapacity);
                                    let bgClass = 'background-color: #f9fafb;';
                                    if (occupancy >= 1) bgClass = 'background-color: #fef2f2;';
                                    else if (occupancy >= 0.7) bgClass = 'background-color: #ecfdf5;';
                                    else if (occupancy >= 0.4) bgClass = 'background-color: #fffbeb;';

                                    let cellContent = `
                                        <div class="flex flex-col gap-1">
                                            <div class="flex justify-between items-center border-b border-gray-200 pb-1 mb-1">
                                                <span class="font-bold text-[#5c3a21]">${totalStudents} Alunos</span>
                                                <span class="text-[10px] text-[#8c6d59] font-mono bg-white/50 px-1 rounded">${classesNeeded} Turma(s)</span>
                                            </div>
                                    `;

                                    Object.entries(breakdown).forEach(([compName, count]) => {
                                        if (compName === 'Quintal Vivo') return;
                                        const numCount = Number(count);
                                        const compClasses = Math.ceil(numCount / maxCapacity);
                                        const color = stringToColor(compName);

                                        cellContent += `
                                            <div class="text-[10px] flex justify-between items-center font-bold" style="color: ${color}">
                                                <span class="truncate max-w-[100px]" title="${compName}">${compName}</span>
                                                <span>${numCount} (${compClasses}t)</span>
                                            </div>
                                        `;
                                    });

                                    if (generalistStudents > 0) {
                                        const quintalClasses = Math.ceil(generalistStudents / maxCapacity);
                                        cellContent += `
                                            <div class="text-[10px] text-[#1e4620] font-bold mt-1 flex justify-between items-center">
                                                <span>Quintal Vivo</span>
                                                <span>${generalistStudents} ({quintalClasses}t)</span>
                                            </div>
                                        `;
                                    }

                                    cellContent += `</div>`;

                                    return `<td class="p-2 border-r border-gray-200 align-top" style="${bgClass}">${cellContent}</td>`;
                                }).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
};

const generateSummarySection = (consolidatedResults, isParcialMode) => {
    const cons = consolidatedResults.consolidated;
    
    // Determine active metrics based on mode
    const schoolProfit = isParcialMode ? cons.fazerResult.dre.resultadoLiquido : cons.comprarResult.dre.resultadoLiquido;
    const labProfit = cons.labirintarResult.dre.resultadoLiquido;
    
    // Calculate Total Taxes for Ecosystem (Tax Efficiency Check)
    // School Tax + Lab Tax + Educator Tax + Provider Tax
    const schoolTaxes = isParcialMode
        ? (cons.fazerResult.dre.impostosSobreReceita + cons.fazerResult.dre.impostosSobreResultado)
        : (cons.comprarResult.dre.impostosSobreReceita + cons.comprarResult.dre.impostosSobreResultado);
        
    const labTaxes = cons.labirintarResult.dre.impostosSobreReceita + cons.labirintarResult.dre.impostosSobreResultado;
    const eduTaxes = cons.educatorResult.dre.impostosSobreReceita + cons.educatorResult.dre.impostosSobreResultado;
    const provTaxes = cons.provedorResult.dre.impostosSobreReceita + cons.provedorResult.dre.impostosSobreResultado;
    
    const totalTax = schoolTaxes + labTaxes + eduTaxes + provTaxes;

    const modeLabel = isParcialMode ? "Modo Parcial (Serviço)" : "Modo Total (Parceria)";

    return `
        <div class="bg-white p-6 rounded-lg shadow-md border border-[#e0cbb2] mb-8 break-inside-avoid">
            <h3 class="text-xl font-bold text-[#5c3a21] mb-4 border-b border-[#e0cbb2] pb-2">Resumo Executivo - ${modeLabel}</h3>
            
            <div class="overflow-x-auto">
                <table class="w-full text-sm text-left">
                    <thead>
                        <tr class="bg-[#f4f0e8] text-[#5c3a21]">
                            <th class="p-3 rounded-tl-lg">Indicador (Consolidado)</th>
                            <th class="p-3 text-right rounded-tr-lg">Valores</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="border-b border-gray-100">
                            <td class="p-3 font-semibold">Receita Bruta Total (Ecossistema)</td>
                            <td class="p-3 text-right font-mono">${formatCurrency(cons.optimizationMetrics.totalRevenue)}</td>
                        </tr>
                        <tr class="border-b border-gray-100 bg-gray-50">
                            <td class="p-3 font-bold text-[#5c3a21]">Resultado Líquido (Escola)</td>
                            <td class="p-3 text-right font-mono font-bold text-[#5c3a21]">${formatCurrency(schoolProfit)}</td>
                        </tr>
                        <tr class="border-b border-gray-100">
                            <td class="p-3 font-semibold text-[#8c6d59]">Resultado Líquido (LABirintar)</td>
                            <td class="p-3 text-right font-mono">${formatCurrency(labProfit)}</td>
                        </tr>
                         <tr class="bg-blue-50">
                            <td class="p-3 font-semibold text-blue-800">Carga Tributária Total (Ecossistema)</td>
                            <td class="p-3 text-right font-mono text-blue-800">${formatCurrency(totalTax)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
};

export const generateReportHtml = (data) => {
    const { consolidatedResults, simulationYear, reportType, isParcialMode, globalMaxCapacity } = data;
    
    const consolidated = consolidatedResults.consolidated;
    const schools = consolidatedResults.schools;

    const reportTitles = {
        complete: 'Análise Estratégica Consolidada (Grupo)',
        provider: 'Relatório para Provedor (Grupo)',
        educator: 'Relatório para Educador (Grupo)'
    };
    const reportTitle = reportTitles[reportType] || 'Relatório Consolidado';

    const generateSection = (title, result, schoolName = "") => {
        return `
            <div class="page-break"></div>
            <h2 class="text-2xl font-bold text-[#5c3a21] text-center mt-12 mb-6 border-b border-[#e0cbb2] pb-2">${title} ${schoolName ? `- ${schoolName}` : ''}</h2>
            
            ${schoolName ? generateScenariosTableHTML(result.inputScenarios) : ''}

            ${(reportType === 'complete') ? `
                <h3 class="text-xl font-semibold text-[#5c3a21] mt-6 mb-4">Análise da Escola/Grupo</h3>
                <div class="grid md:${isParcialMode ? 'grid-cols-1' : 'grid-cols-2'} gap-8">
                    ${DRETableHTML({ dre: result.fazerResult.dre, title: "Cenário 1: Fazer" })}
                    ${!isParcialMode ? DRETableHTML({ dre: result.comprarResult.dre, title: "Cenário 2: Comprar" }) : ''}
                </div>
            ` : ''}

            <h3 class="text-xl font-semibold text-[#5c3a21] mt-8 mb-4">Saúde do Ecossistema</h3>
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                ${(reportType === 'complete') ? DRETableHTML({ dre: result.labirintarResult.dre, title: "Viabilidade LABirintar" }) : ''}
                ${(reportType === 'complete' || reportType === 'educator') ? DRETableHTML({ dre: result.educatorResult.dre, title: "Viabilidade Educador", remuneracaoHorariaLiquida: result.educatorResult.remuneracaoHorariaLiquida, totalMonthlyHours: result.totalMonthlyHours }) : ''}
                ${(reportType === 'complete' || reportType === 'provider') ? DRETableHTML({ dre: result.provedorResult.dre, title: "Viabilidade Provedor" }) : ''}
            </div>
            
            ${generateGlobalGridHTML(result.optimizationMetrics.globalSchedule, globalMaxCapacity, schoolName || 'Grupo Econômico')}
        `;
    };

    return `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>${reportTitle} - ${simulationYear}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Raleway:wght@400;600;700&family=Roboto+Slab:wght@700&display=swap" rel="stylesheet">
            <style>
                body { font-family: 'Raleway', sans-serif; background-color: #f4f0e8; }
                h1, h2, h3, h4, h5, h6 { font-family: 'Roboto Slab', serif; }
                .hidden { display: none; }
                @media print {
                    body { background-color: white !important; font-size: 10pt; }
                    .no-print { display: none !important; }
                    @page { size: A4; margin: 1cm; }
                    #printable-report { margin: 0; padding: 0; border: none !important; box-shadow: none !important; width: 100%; max-width: 100%; }
                    .page-break { page-break-before: always; }
                    .break-inside-avoid { break-inside: avoid; }
                }
            </style>
        </head>
        <body class="text-[#5c3a21]">
            <header class="p-4 flex justify-between items-center bg-white shadow-md sticky top-0 z-10 no-print">
                <h2 class="hidden sm:block text-xl font-bold text-[#5c3a21] text-center">${reportTitle}</h2>
                <div class="flex items-center gap-2">
                    <button onclick="downloadHTML()" class="inline-flex items-center gap-2 rounded-md bg-[#ff595a] text-white px-4 py-1.5 text-sm font-bold shadow-sm hover:bg-red-600">GitHub Pages</button>
                    <button onclick="window.print()" class="inline-flex items-center gap-2 rounded-md border border-[#bf917f] bg-white px-3 py-1.5 text-sm font-medium text-[#5c3a21] hover:bg-[#ffe9c9]">PDF</button>
                    <button onclick="window.close()" class="inline-flex items-center gap-2 rounded-md border border-[#bf917f] bg-white px-3 py-1.5 text-sm font-medium text-[#5c3a21] hover:bg-[#f4f0e8]">Fechar</button>
                </div>
            </header>
            <main>
                <div id="printable-report" class="max-w-6xl mx-auto bg-white p-8 my-8 rounded-xl shadow-lg border border-gray-200">
                    <div class="text-center mb-8">
                        <h1 class="text-3xl font-bold text-[#5c3a21]">${reportTitle}</h1>
                        <p class="text-lg text-[#8c6d59]">Simulação Consolidada para o ano de ${simulationYear}</p>
                    </div>
                    
                    ${(reportType === 'complete') ? generateSummarySection(consolidatedResults, isParcialMode) : ''}
                    
                    <!-- Consolidated Section -->
                    ${generateSection("Resumo Consolidado (Grupo)", consolidated)}

                    <!-- Per School Sections -->
                    ${Object.entries(schools).map(([schoolName, result]) => generateSection("Detalhamento por Unidade", result, schoolName)).join('')}

                </div>
            </main>
            
            <div id="publishModal" class="fixed inset-0 bg-black bg-opacity-50 hidden flex items-center justify-center z-50 no-print">
                <div class="bg-white p-6 rounded-2xl shadow-2xl max-w-md w-full text-center">
                    <h3 class="text-xl font-bold text-[#5c3a21] mb-4">Arquivo Gerado!</h3>
                    <p class="text-sm text-[#8c6d59] mb-4">O arquivo <strong>index.html</strong> foi baixado. Faça upload no GitHub Pages.</p>
                    <button onclick="document.getElementById('publishModal').classList.add('hidden')" class="bg-[#ff595a] text-white px-4 py-2 rounded-lg font-bold hover:bg-red-600 transition-colors w-full">Entendi</button>
                </div>
            </div>

            <script>
                function downloadHTML() {
                    const header = document.querySelector('header');
                    const originalHeader = header.innerHTML;
                    header.innerHTML = '<h2 class="text-xl font-bold text-[#5c3a21] text-center w-full py-2">${reportTitle}</h2>';
                    const currentHTML = document.documentElement.outerHTML;
                    header.innerHTML = originalHeader;
                    const blob = new Blob([currentHTML], {type: 'text/html'});
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'index.html';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    document.getElementById('publishModal').classList.remove('hidden');
                }
            </script>
        </body>
        </html>
    `;
};
