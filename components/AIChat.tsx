

import React from "react";
import { GoogleGenAI } from "@google/genai";
import { heuristicaExtra } from '../data/heuristicaExtra.ts';
import { concepcao } from '../data/concepcao.ts';
import { planoDeNegocio } from '../data/planoDeNegocio.ts';
import { playbookDeVendas } from '../data/playbookDeVendas.ts';
import { tabelasDePreco } from '../data/tabelasDePreco.ts';
import { demandaEstocastica } from '../data/demandaEstocastica.ts';
import { componentesPedagogicos } from '../data/componentesPedagogicos.ts';

export const AIChat = () => {
    const { useState, useRef, useEffect } = React;
    
    const [systemInstruction, setSystemInstruction] = useState(null);
    const [isReady, setIsReady] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [history, setHistory] = useState([]);
    const [userInput, setUserInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const chatEndRef = useRef(null);

    useEffect(() => {
        try {
            const fullInstruction = `Você é um assistente de IA especialista e consultor para o ecossistema LABirintar. Seu nome é Nina. Sua base de conhecimento primária é a documentação interna fornecida abaixo. Use esta documentação para responder às perguntas da forma mais completa e precisa possível. Além disso, você tem a capacidade de realizar pesquisas na web para encontrar informações atuais ou complementares quando a documentação não for suficiente. Ao usar informações da web, sempre cite suas fontes.

BASE DE CONHECIMENTO INTERNA:
--- COMPONENTES PEDAGÓGICOS ---
${componentesPedagogicos}

--- HEURÍSTICA DE DEMANDA ESTOCÁSTICA ---
${demandaEstocastica}

--- HEURÍSTICA EXTRA ---
${heuristicaExtra}

--- CONCEPÇÃO ---
${concepcao}

--- PLANO DE NEGÓCIO ---
${planoDeNegocio}

--- PLAYBOOK DE VENDAS ---
${playbookDeVendas}

--- TABELAS DE PREÇO ---
${tabelasDePreco}
`;
            setSystemInstruction(fullInstruction);
            setIsReady(true);
        } catch (err) {
            console.error("Failed to build AI system instructions:", err);
            setError("Falha ao inicializar a assistente. Tente recarregar a página.");
        }
    }, []);


    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history, loading]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!userInput.trim() || loading || !isReady) return;

        const userMessage = { role: 'user', content: userInput };
        setHistory(prev => [...prev, userMessage]);
        setUserInput('');
        setLoading(true);
        setError(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY }); 
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: userInput,
                config: {
                    systemInstruction: systemInstruction,
                    tools: [{ googleSearch: {} }],
                },
            });

            const text = response.text;
            const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
            
            const sources = groundingChunks
                ?.map(chunk => chunk.web)
                .filter((web) => !!web && !!web.uri && !!web.title);

            const modelMessage = { role: 'model', content: text, sources };
            setHistory(prev => [...prev, modelMessage]);

        } catch (err) {
            console.error("Gemini API error:", err);
            const errorMessage = "Desculpe, não consegui processar sua solicitação. Tente novamente.";
            setError(errorMessage);
            setHistory(prev => [...prev, { role: 'model', content: errorMessage, error: true }]);
        } finally {
            setLoading(false);
        }
    };
    
    const SendIcon = ({ className }) => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
            <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
        </svg>
    );
    const SourceIcon = ({ className }) => (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.25" />
      </svg>
    );

    const NinaIcon = ({ className }) => (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" opacity=".3"/>
        <path d="M12 4c-4.41 0-8 3.59-8 8s3.59 8 8 8 8-3.59 8-8-3.59-8-8-8zm0 1.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zM12 20c-3.31 0-6-2.69-6-6h2c0 2.21 1.79 4 4 4s4-1.79 4-4h2c0 3.31-2.69 6-6 6zm0-10c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
      </svg>
    );
    
    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="fixed bottom-4 right-4 bg-[#ff595a] text-white rounded-full p-3 shadow-lg hover:bg-red-600 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff595a]"
                aria-label="Abrir chat com assistente Nina"
            >
                <NinaIcon className="w-6 h-6" />
            </button>

            {isModalOpen && (
                <div 
                    className="fixed inset-0 z-50 flex items-end justify-center sm:justify-end bg-black bg-opacity-50"
                >
                    <div 
                        className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-lg h-[90vh] max-h-[700px] flex flex-col m-0 sm:mr-6 sm:mb-6"
                    >
                        <header className="flex items-center justify-between p-4 border-b border-[#e0cbb2] bg-[#f3f0e8] rounded-t-2xl">
                            <div className="flex items-center gap-3">
                                <NinaIcon className="w-8 h-8 text-[#ff595a]" />
                                <div>
                                    <h2 className="text-lg font-bold text-[#5c3a21]">Assistente Nina</h2>
                                    <p className="text-xs text-[#8c6d59]">Especialista do ecossistema LABirintar</p>
                                </div>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-full hover:bg-[#e0cbb2]">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-[#8c6d59]">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </header>
                        
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {history.length === 0 && (
                                <div className="text-center text-sm text-[#8c6d59] p-4 bg-[#f3f0e8] rounded-lg">
                                    <p>Olá! Sou a Nina, sua assistente virtual. Como posso ajudar a otimizar a operação da sua escola hoje?</p>
                                </div>
                            )}
                            {history.map((msg, index) => (
                                <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.role === 'model' && <NinaIcon className="w-6 h-6 text-[#ff595a] flex-shrink-0 mt-1" />}
                                    <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${msg.role === 'user' ? 'bg-[#ff595a] text-white rounded-br-none' : 'bg-[#f3f0e8] text-[#5c3a21] rounded-bl-none'}`}>
                                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                        {msg.sources && msg.sources.length > 0 && (
                                            <div className="mt-3 pt-2 border-t border-[#e0cbb2]">
                                                <h4 className="text-xs font-bold flex items-center gap-1.5">
                                                    <SourceIcon className="w-3 h-3" />
                                                    Fontes da Web
                                                </h4>
                                                <ul className="text-xs list-disc list-inside mt-1 space-y-1">
                                                    {msg.sources.map((source, i) => (
                                                        <li key={i}><a href={source.uri} target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80">{source.title}</a></li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                             {loading && (
                                <div className="flex justify-start gap-3">
                                    <NinaIcon className="w-6 h-6 text-[#ff595a] flex-shrink-0 mt-1" />
                                    <div className="max-w-xs md:max-w-md p-3 rounded-2xl bg-[#f3f0e8] text-[#5c3a21] rounded-bl-none">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-[#8c6d59] rounded-full animate-pulse"></div>
                                            <div className="w-2 h-2 bg-[#8c6d59] rounded-full animate-pulse delay-150"></div>
                                            <div className="w-2 h-2 bg-[#8c6d59] rounded-full animate-pulse delay-300"></div>
                                        </div>
                                    </div>
                                </div>
                             )}
                            <div ref={chatEndRef} />
                        </div>

                        <form onSubmit={handleSubmit} className="p-4 border-t border-[#e0cbb2]">
                            {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
                             <div className="relative">
                                <input
                                    type="text"
                                    value={userInput}
                                    onChange={(e) => setUserInput(e.target.value)}
                                    placeholder={!isReady ? "Inicializando assistente..." : "Pergunte algo..."}
                                    disabled={loading || !isReady}
                                    className="w-full rounded-full border-[#e0cbb2] bg-white text-[#5c3a21] shadow-sm focus:border-[#ff595a] focus:ring-1 focus:ring-[#ff595a] pl-4 pr-12 py-2"
                                />
                                <button type="submit" disabled={loading || !userInput.trim() || !isReady} className="absolute inset-y-0 right-0 flex items-center justify-center w-10 h-10 text-white bg-[#ff595a] rounded-full m-1 disabled:opacity-50 hover:bg-red-600 transition-colors">
                                    <SendIcon className="w-5 h-5"/>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};