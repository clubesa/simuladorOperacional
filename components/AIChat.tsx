import React from "react";
import { GoogleGenAI } from "@google/genai";

export const AIChat = () => {
    const { useState, useRef, useEffect } = React;
    
    // This data would normally be imported, but is inlined for this single-file setup
    const heuristicaExtra = `A Arquitetura de Três Camadas: Uma Lógica Universal

Esta estrutura conceitual forma a espinha dorsal do "Simulador Operacional", proporcionando a flexibilidade necessária para modelar qualquer cenário de contraturno.
Camada 1: Slots de Tempo (Time Slots): Esta é a unidade fundamental e indivisível de produção. O dia operacional da escola (por exemplo, das 8h às 18h) é fracionado em slots de 1 hora cada. Esta granularidade oferece a base para todo o planejamento, agendamento e alocação de recursos. É a "moeda" comum do sistema.
Camada 2: Janelas de Permanência (Windows of Stay): Esta camada representa o produto efetivamente adquirido pela família. Uma "Janela" é definida como um bloco contíguo de um ou mais slots de tempo. É nesta camada que a precificação e a oferta comercial são estruturadas. A flexibilidade deste conceito é a chave para unificar os diferentes modelos de negócio.
Camada 3: Atividades (Especialidades & Supervisão Pedagógica): Esta camada representa os serviços de valor agregado que são alocados pelo sistema dentro da "Janela de Permanência" adquirida por um aluno. É aqui que a otimização ocorre. O sistema decide qual a melhor combinação de "Especialidades" (atividades de alto valor e custo, ministradas por EEs especialistas) e "Supervisão Pedagógica" (atividades de menor custo, conduzidas por pedagogos generalistas) para preencher a janela de tempo de cada aluno, garantindo a viabilidade econômica sem comprometer a experiência. A "Supervisão Pedagógica" funciona como uma variável de balanceamento crucial para evitar margens de contribuição negativas.

Flexibilidade por Design: Resolvendo o Paradoxo da Gara

A arquitetura de três camadas resolve elegantemente a aparente contradição entre os modelos de precificação das linhas "Infantil" e "Fundamental", especialmente o caso híbrido da Gara School.
Para a "Linha Infantil": A família compra explicitamente um produto nomeado que corresponde a uma "Janela de Permanência" (por exemplo, "Integral 8h-13h" da tabela de preços da Gara).1 Para o sistema, isso se traduz em uma janela de 5 slots (das 8h às 13h) que precisa ser preenchida. A tarefa do otimizador é alocar a melhor combinação de atividades para o grupo de crianças que comprou este produto, maximizando a margem de contribuição total.
Para a "Linha Fundamental" (Modelo Builders): A família compra um pacote de "Especialidades" (por exemplo, "3 aulas" da tabela de preços da Builders).1 Esta compra
define implicitamente a "Janela de Permanência" do aluno. Para o sistema, um aluno que comprou "3 aulas" adquiriu uma janela de 3 slots. A tarefa do otimizador é então agendar essas três especialidades específicas dentro dos slots disponíveis na escola, respeitando todas as restrições.
A Solução para a Gara: A tabela de preços da Gara, que aplica a lógica de "Janela" também para o Ensino Fundamental, deixa de ser um paradoxo e se torna apenas mais uma configuração dentro do modelo unificado.1 Um aluno do Fundamental na Gara que está no produto "Integral 8h-13h" é tratado, do ponto de vista do agendamento, de forma idêntica a um aluno do Infantil: ele ocupa uma janela de 5 slots que precisa ser preenchida com atividades. A diferença pode estar no portfólio de especialidades disponíveis para ele, mas a lógica de alocação de tempo é a mesma.
Desta forma, a "Janela de Permanência" emerge como a unidade universal de venda e agendamento, seja ela explicitamente nomeada (como no Infantil) ou implicitamente definida (como no Fundamental). O sistema de backend não precisa mais se preocupar com a nomenclatura ou a estrutura comercial dos produtos de cada escola. Ele só precisa de duas informações para cada aluno em um determinado dia: 1) Qual o slot de início e fim de sua "Janela de Permanência"? e 2) Quais "Especialidades" específicas (se houver) devem ser obrigatoriamente agendadas dentro dessa janela? Essa abstração simplifica radicalmente a lógica de programação e torna a ferramenta verdadeiramente universal e escalável, conforme solicitado.`;
    const concepcao = `Concepção...`;
    const planoDeNegocio = `Plano de negócio LABirintar...`;
    const playbookDeVendas = `O Motor de Crescimento Labirintar...`;
    const tabelasDePreco = `Valores 2026 Gara Extra...`;
    
    const systemInstruction = `Você é um assistente de IA especialista e consultor para o ecossistema LABirintar. Seu nome é Nina. Sua base de conhecimento primária é a documentação interna fornecida abaixo. Use esta documentação para responder às perguntas da forma mais completa e precisa possível. Além disso, você tem a capacidade de realizar pesquisas na web para encontrar informações atuais ou complementares quando a documentação não for suficiente. Ao usar informações da web, sempre cite suas fontes.

BASE DE CONHECIMENTO INTERNA:
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


    const [isModalOpen, setIsModalOpen] = useState(false);
    const [history, setHistory] = useState([]);
    const [userInput, setUserInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history, loading]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!userInput.trim() || loading) return;

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
            setHistory(prev => [...prev, { role: 'model', content: errorMessage }]);
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
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    );
    const ChatIcon = ({ className }) => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.76 9.76 0 0 1-2.53-.401m-1.01-4.042a9.753 9.753 0 0 0-3.232-4.135A9.753 9.753 0 0 0 3 12a9.753 9.753 0 0 0 3.232 4.135m10.505-1.586a9.753 9.753 0 0 1-3.232-4.135m3.232 4.135a9.753 9.753 0 0 0-3.232-4.135M3 12a9.753 9.753 0 0 1 3.232-4.135m10.505 1.586a9.753 9.753 0 0 0 3.232-4.135" />
        </svg>
    );

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="fixed bottom-6 right-6 bg-[#ff595a] text-white p-4 rounded-full shadow-lg hover:bg-red-600 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff595a]"
                aria-label="Abrir chat com a Nina"
            >
                <ChatIcon className="w-8 h-8" />
            </button>

            {isModalOpen && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
                    onClick={() => setIsModalOpen(false)}
                >
                    <div 
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col m-4"
                        onClick={e => e.stopPropagation()}
                    >
                         <div className="flex justify-between items-center p-4 border-b border-[#e0cbb2]">
                            <h2 className="text-xl font-bold text-[#5c3a21]">Converse com a Nina</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-full hover:bg-[#f3f0e8]">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-[#8c6d59]">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex-1 bg-[#f3f0e8] p-6 overflow-y-auto space-y-4">
                            {history.length === 0 && (
                                <div className="flex justify-start">
                                    <div className="max-w-lg p-3 rounded-xl bg-white text-[#5c3a21]">
                                        <p>Olá! Eu sou a Nina, sua assistente de IA da LABirintar. Como posso ajudar com os cenários operacionais e modelos de negócio hoje?</p>
                                    </div>
                                </div>
                            )}
                            {history.map((msg, index) => (
                                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-lg p-3 rounded-xl ${msg.role === 'user' ? 'bg-[#ff595a] text-white' : 'bg-white text-[#5c3a21]'}`}>
                                        <p className="whitespace-pre-wrap">{msg.content}</p>
                                        {msg.sources && msg.sources.length > 0 && (
                                          <div className="mt-3 pt-3 border-t border-t-[#e0cbb2]">
                                              <h4 className="text-xs font-semibold flex items-center gap-1.5"><SourceIcon className="w-4 h-4" /> Fontes da Web:</h4>
                                              <ul className="text-xs list-disc pl-5 mt-1 space-y-1">
                                                  {msg.sources.map((source, i) => (
                                                      <li key={i}>
                                                          <a href={source.uri} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-700 visited:text-purple-700">
                                                              {source.title || new URL(source.uri).hostname}
                                                          </a>
                                                      </li>
                                                  ))}
                                              </ul>
                                          </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                     <div className="max-w-lg p-3 rounded-xl bg-white text-[#5c3a21]">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-[#8c6d59] rounded-full animate-pulse"></div>
                                            <div className="w-2 h-2 bg-[#8c6d59] rounded-full animate-pulse [animation-delay:0.2s]"></div>
                                            <div className="w-2 h-2 bg-[#8c6d59] rounded-full animate-pulse [animation-delay:0.4s]"></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>
                        <div className="p-4 border-t border-[#e0cbb2] bg-white rounded-b-2xl">
                            <form onSubmit={handleSubmit} className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={userInput}
                                    onChange={(e) => setUserInput(e.target.value)}
                                    placeholder="Pergunte algo..."
                                    className="flex-1 w-full rounded-md border-[#e0cbb2] bg-white text-[#5c3a21] shadow-sm focus:border-[#ff595a] focus:ring-1 focus:ring-[#ff595a] px-4 py-2"
                                    disabled={loading}
                                />
                                <button type="submit" className="p-2 rounded-full text-white bg-[#ff595a] hover:bg-red-600 disabled:bg-[#d1b89f] transition-colors" disabled={loading}>
                                    <SendIcon className="w-5 h-5" />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
