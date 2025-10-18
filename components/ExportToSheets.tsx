import React from "react";

export const ExportToSheets = () => {
    const { useState } = React;
    const [isModalOpen, setIsModalOpen] = useState(false);

    const exportScriptCode = `/**
 * Cria uma nova Planilha Google com os resultados de uma simulação do Simulador Operacional.
 *
 * @param {string} jsonDataString Uma string JSON contendo os resultados da simulação.
 * O JSON deve ter a seguinte estrutura:
 * {
 *   "scenarioName": "Simulação Gara - Cenário A",
 *   "timetable": [
 *     {"dia": "Segunda", "horario": "08:00", "turma": "A", "atividade": "Robótica", "educador": "Carlos", "alunos": 10},
 *     {"dia": "Terça", "horario": "09:00", "turma": "B", "atividade": "Circo", "educador": "Ana", "alunos": 8}
 *   ],
 *   "financials": [
 *     {"kpi": "Receita Bruta Total", "escola": 63000, "labirintar": 27000},
 *     {"kpi": "Custos Totais", "escola": 57000, "labirintar": 18000},
 *     {"kpi": "Lucro Líquido", "escola": 4500, "labirintar": 7200}
 *   ],
 *   "unallocated": [
 *     {"alunoId": "ALUNO001", "motivo": "Conflito de horário"},
 *     {"alunoId": "ALUNO002", "motivo": "Turma não atingiu quórum"}
 *   ]
 * }
 * @returns {string} A URL da nova Planilha Google criada.
 * @customfunction
 */
function EXPORTAR_RESULTADOS(jsonDataString) {
  try {
    const data = JSON.parse(jsonDataString);
    const scenarioName = data.scenarioName || 'Resultado da Simulação';
    const spreadsheet = SpreadsheetApp.create(\`\${scenarioName} - \${new Date().toLocaleDateString('pt-BR')}\`);
    
    // --- Aba de Grade Horária ---
    const timetableSheet = spreadsheet.getSheetByName('Página1');
    timetableSheet.setName('Grade Horária Otimizada');
    const timetableHeaders = ["Dia", "Horário", "Turma", "Atividade", "Educador", "Nº de Alunos"];
    timetableSheet.appendRow(timetableHeaders);
    timetableSheet.getRange("A1:F1").setFontWeight("bold").setBackground("#f4f0e8");
    
    data.timetable.forEach(row => {
      timetableSheet.appendRow([row.dia, row.horario, row.turma, row.atividade, row.educador, row.alunos]);
    });
    timetableSheet.autoResizeColumns(1, timetableHeaders.length);
    
    // --- Aba de Sumário Financeiro ---
    const financialsSheet = spreadsheet.insertSheet('Sumário Financeiro');
    const financialsHeaders = ["Indicador (KPI)", "Resultado Escola", "Resultado LABirintar"];
    financialsSheet.appendRow(financialsHeaders);
    financialsSheet.getRange("A1:C1").setFontWeight("bold").setBackground("#f4f0e8");

    data.financials.forEach(row => {
      financialsSheet.appendRow([
          row.kpi,
          row.escola,
          row.labirintar
      ]);
    });
    financialsSheet.getRange("B2:C" + (data.financials.length + 1)).setNumberFormat("R$ #,##0.00");
    financialsSheet.autoResizeColumns(1, financialsHeaders.length);
    
    // --- Aba de Alunos Não Alocados ---
    if (data.unallocated && data.unallocated.length > 0) {
      const unallocatedSheet = spreadsheet.insertSheet('Relatório de Exceções');
      const unallocatedHeaders = ["ID do Aluno", "Motivo da Não Alocação"];
      unallocatedSheet.appendRow(unallocatedHeaders);
      unallocatedSheet.getRange("A1:B1").setFontWeight("bold").setBackground("#f4f0e8");

      data.unallocated.forEach(row => {
        unallocatedSheet.appendRow([row.alunoId, row.motivo]);
      });
      unallocatedSheet.autoResizeColumns(1, unallocatedHeaders.length);
    }

    return spreadsheet.getUrl();
    
  } catch (e) {
    return "Erro ao processar JSON ou criar planilha: " + e.toString();
  }
}`;
    const CodeBlock = ({ code }) => {
        return (
          <div className="relative h-full flex flex-col">
            <pre className="flex-1 bg-[#f4f0e8] border border-[#bf917f] text-[#5c3a21] p-4 rounded-lg overflow-auto text-sm">
              <code>{code}</code>
            </pre>
          </div>
        );
    };

    return (
        <>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-md border border-[#bf917f] bg-white px-3 py-1.5 text-sm font-medium text-[#5c3a21] shadow-sm transition-all duration-200 ease-in-out hover:bg-[#f4f0e8] focus:outline-none focus:ring-2 focus:ring-[#ff595a] focus:ring-offset-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
                    <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
                </svg>
                Exportar para Planilhas
            </button>
            
            {isModalOpen && (
                 <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
                    onClick={() => setIsModalOpen(false)}
                >
                    <div 
                        className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] flex flex-col m-4"
                        onClick={e => e.stopPropagation()}
                    >
                         <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-[#5c3a21]">Exportar Resultados para Google Sheets</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-full hover:bg-[#f4f0e8]">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-[#8c6d59]">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <p className="text-[#8c6d59] mb-4 text-sm">
                            Copie este código para o editor de script do Google Planilhas. Você poderá chamar a função <code className="bg-[#ffe9c9] px-1 py-0.5 rounded text-sm font-mono text-[#5c3a21]">EXPORTAR_RESULTADOS()</code> passando uma string JSON com os dados da simulação para criar um novo arquivo com os resultados.
                        </p>
                        <div className="flex-1 overflow-hidden min-h-0">
                             <CodeBlock code={exportScriptCode} />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};