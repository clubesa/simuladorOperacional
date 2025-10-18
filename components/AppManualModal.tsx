import React from "react";
import { manualDePesquisaOperacional } from '../data/manualDePesquisaOperacional.ts';

const Section = ({ title, children }) => (
    <div className="mb-6">
        <h3 className="text-xl font-bold text-[#5c3a21] border-b-2 border-[#e0cbb2] pb-2 mb-3">{title}</h3>
        <div className="space-y-4 text-[#5c3a21]">{children}</div>
    </div>
);

const SubSection = ({ title, children }) => (
     <div className="mt-4">
        <h4 className="text-lg font-semibold text-[#8c6d59]">{title}</h4>
        <div className="mt-2 pl-4 border-l-2 border-[#e0cbb2] space-y-3">{children}</div>
    </div>
);

export const AppManualModal = ({ onClose }) => {
    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="manual-title"
        >
            <div 
                className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] flex flex-col m-4"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex justify-between items-start mb-4 pb-4 border-b border-[#e0cbb2]">
                    <div>
                        <h2 id="manual-title" className="text-2xl font-bold text-[#5c3a21]">
                            Manual de Pesquisa Operacional do Simulador
                        </h2>
                        <p className="text-[#8c6d59] mt-1">Versão 1.0 - Modelagem, Regras de Negócio e Lógica Financeira</p>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-[#f3f0e8]">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-[#8c6d59]">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                </header>

                <main className="flex-1 overflow-y-auto pr-3 text-base leading-relaxed">
                    <p className="mb-6 bg-amber-50 border border-amber-200 p-3 rounded-lg text-sm text-amber-800">
                        <strong>Objetivo do Documento:</strong> Este manual formaliza o modelo matemático e as heurísticas de negócio que governam o "Simulador Operacional". O propósito é descrever, de maneira inequívoca, as regras de alocação de recursos, os modelos de custeio e as análises de viabilidade para permitir auditoria, validação e futuras otimizações.
                    </p>
                    
                    <pre className="whitespace-pre-wrap font-sans">
                        {manualDePesquisaOperacional}
                    </pre>
                </main>
            </div>
        </div>
    );
};