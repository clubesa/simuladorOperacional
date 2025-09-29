import React from "react";
import { GoogleGenAI } from "@google/genai";

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
        const fetchInstructions = async () => {
            try {
                const dataFiles = [
                    './data/heuristicaExtra.txt',
                    './data/concepcao.txt',
                    './data/planoDeNegocio.txt',
                    './data/playbookDeVendas.txt',
                    './data/tabelasDePreco.txt',
                ];

                const responses = await Promise.all(
                    dataFiles.map(url => fetch(url).then(res => {
                        if (!res.ok) throw new Error(`Failed to load ${url}`);
                        return res.text();
                    }))
                );

                const [heuristicaExtra, concepcao, planoDeNegocio, playbookDeVendas, tabelasDePreco] = responses;

                const fullInstruction = `Você é um assistente de IA especialista e consultor para o ecossistema LABirintar. Seu nome é Nina. Sua base de conhecimento primária é a documentação interna fornecida abaixo. Use esta documentação para responder às perguntas da forma mais completa e precisa possível. Além disso, você tem a capacidade de realizar pesquisas na web para encontrar informações atuais ou complementares quando a documentação não for suficiente. Ao usar informações da web, sempre cite suas fontes.

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
                setSystemInstruction(fullInstruction);
                setIsReady(true);
            } catch (err) {
                console.error("Failed to load AI system instructions:", err);
                setError("Falha ao inicializar a assistente. Tente recarregar a página.");
            }
        };

        fetchInstructions();
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
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.2