import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';

import { heuristicaExtra } from '../data/heuristicaExtra';
import { concepcao } from '../data/concepcao';
import { planoDeNegocio } from '../data/planoDeNegocio';
import { playbookDeVendas } from '../data/playbookDeVendas';
import { tabelasDePreco } from '../data/tabelasDePreco';


const systemInstruction = `Você é um assistente de IA especialista e consultor para o ecossistema LABirintar. Seu nome é Nina. Sua base de conhecimento primária é a documentação interna fornecida abaixo. Use esta documentação para responder às perguntas da forma mais completa e precisa possível. Além disso, você tem a capacidade de realizar pesquisas na web para encontrar informações atuais ou complementares quando a documentação não for suficiente. Ao usar informações da web, sempre cite suas fontes.

BASE DE CONHECIMENTO INTERNA:

${heuristicaExtra}

${concepcao}

${planoDeNegocio}

${playbookDeVendas}

${tabelasDePreco}
`;

const SendIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
    </svg>
);

const SourceIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
  </svg>
);

const ChatIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.76 9.76 0 0 1-2.53-.401m-1.01-4.042a9.753 9.753 0 0 0-3.232-4.135A9.753 9.753 0 0 0 3 12a9.753 9.753 0 0 0 3.232 4.135m10.505-1.586a9.753 9.753 0 0 1-3.232-4.135m3.232 4.135a9.753 9.753 0 0 0-3.232-4.135M3 12a9.753 9.753 0 0 1 3.232-4.135m10.505 1.586a9.753 9.753 0 0 0 3.232-4.135" />
    </svg>
);


interface ChatMessage {
    role: 'user' | 'model';
    content: string;
    sources?: { uri: string; title: string }[];
}

const AIChat: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [history, setHistory] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history, loading]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || loading) return;

        const userMessage: ChatMessage = { role: 'user', content: userInput };
        setHistory(prev => [...prev, userMessage]);
        setUserInput('');
        setLoading(true);
        setError(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
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
                .filter((web): web is { uri: string; title: string } => !!web && !!web.uri && !!web.title);

            const modelMessage: ChatMessage = { role: 'model', content: text, sources };
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

export default AIChat;
