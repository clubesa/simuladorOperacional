import React from "react";

export const FichaPedagogicaModal = ({ componentData, onClose }) => {
    
    const FichaSection = ({ title, icon, children }) => (
        <div className="mb-6">
            <h3 className="text-lg font-bold text-[#5c3a21] mb-3 flex items-center gap-2">
                <span className="text-xl">{icon}</span>
                {title}
            </h3>
            <div className="space-y-3 bg-[#f3f0e8] p-4 rounded-lg border border-[#e0cbb2]">
                {children}
            </div>
        </div>
    );

    const InfoPair = ({ label, children }) => (
         <div className="text-sm">
            <p className="font-semibold text-[#8c6d59] mb-0.5">{label}</p>
            <div className="text-[#5c3a21] whitespace-pre-wrap">{children}</div>
        </div>
    );

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="ficha-title"
        >
            <div 
                className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col m-4"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex justify-between items-start mb-4 pb-4 border-b border-[#e0cbb2]">
                    <div>
                        <h2 id="ficha-title" className="text-2xl font-bold text-[#5c3a21] flex items-center gap-3">
                            <span className="text-4xl">{componentData.icon}</span>
                            {componentData.name}
                        </h2>
                        <p className="text-[#8c6d59] mt-1">Ficha Pedagógica da Experiência</p>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-[#f3f0e8]">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-[#8c6d59]">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                </header>

                <main className="flex-1 overflow-y-auto pr-3">
                    {/* FIX: Changed component calls to use standard JSX children to resolve TS errors. */}
                    <FichaSection title="Camada Pedagógica" icon="✨">
                        <React.Fragment>
                            <InfoPair label="Eixo">{componentData.eixoName}</InfoPair>
                            <InfoPair label="Intencionalidade pedagógica">{componentData.ficha.intencionalidade}</InfoPair>
                            <InfoPair label="Temas transversais e conexões com a BNCC">{componentData.ficha.temasBncc}</InfoPair>
                        </React.Fragment>
                    </FichaSection>
                    
                    <FichaSection title="Camada Prática" icon="⚙️">
                        <React.Fragment>
                            <div className="grid md:grid-cols-2 gap-4">
                                <InfoPair label="Idades atendidas">{componentData.ficha.idades}</InfoPair>
                                <InfoPair label="Quantidade mínima/máxima">{componentData.ficha.minMaxAlunos}</InfoPair>
                                <InfoPair label="Duração">{componentData.ficha.duracao}</InfoPair>
                                <InfoPair label="Necessidade de apoio pedagógico">{componentData.ficha.apoioPedagogico}</InfoPair>
                            </div>
                            <InfoPair label="Recursos necessários da Escola">{componentData.ficha.recursosEscola}</InfoPair>
                            <InfoPair label="Recursos que a LABirintar provê">{componentData.ficha.recursosLabirintar}</InfoPair>
                            <InfoPair label="Protocolos de segurança">{componentData.ficha.protocolosSeguranca}</InfoPair>
                        </React.Fragment>
                    </FichaSection>
                    
                    <FichaSection title="Camada Estética" icon="🎨">
                        <React.Fragment>
                            <InfoPair label="Materialidades que envolvem este fazer">{componentData.ficha.materialidades}</InfoPair>
                            <InfoPair label="Experiência estética desejada">{componentData.ficha.experienciaEstetica}</InfoPair>
                            <InfoPair label="Dinâmica das aulas">{componentData.ficha.dinamicaAulas}</InfoPair>
                            <InfoPair label="Produto final">{componentData.ficha.produtoFinal}</InfoPair>
                            <InfoPair label="Documentação pedagógica">{componentData.ficha.documentacao}</InfoPair>
                        </React.Fragment>
                    </FichaSection>
                </main>
            </div>
        </div>
    );
};