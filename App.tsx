

import React from "react";
import { JamSessionStudio } from './components/JamSessionStudio.tsx';
import { OperationalSimulator } from './components/OperationalSimulator.tsx';
import { EcosystemSimulator } from './components/EcosystemSimulator.tsx';
import { TributarySimulator } from './components/TributarySimulator.tsx';
import { AIChat } from './components/AIChat.tsx';
import { Slider } from './components/Slider.tsx';
import { FormControl } from './components/FormControl.tsx';

const TABS = {
    JAM_SESSION: 'Jam Session Studio',
    OPERATIONAL: 'Análise Fazer vs. Comprar',
    ECOSYSTEM: 'Saúde do Ecossistema',
    TRIBUTARY: 'Calculadora Tributária',
};

// SVG Icon Components
const JamSessionIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467l2.31-.66a2.25 2.25 0 0 0 1.632-2.163Zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 0 1-.99-3.467l2.31-.66A2.25 2.25 0 0 0 9 15.553Z" />
    </svg>
);
const OperationalIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52v16.5m-1.25-16.5c1.01.143 2.01.317 3 .52m-3-.52l-3.5 15.75m-7.5-15.75c1.01.143 2.01.317 3 .52m-3-.52l-3.5 15.75m9.75-15.75c1.01.143 2.01.317 3 .52m-3-.52l3.5 15.75" />
    </svg>
);
const EcosystemIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
    </svg>
);
const TributaryIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008Zm0 3h.008v.008H8.25v-.008Zm0 3h.008v.008H8.25v-.008Zm3-6h.008v.008H11.25v-.008Zm0 3h.008v.008H11.25v-.008Zm0 3h.008v.008H11.25v-.008Zm3-6h.008v.008H14.25v-.008Zm0 3h.008v.008H14.25v-.008Zm0 3h.008v.008H14.25v-.008ZM6 21h12a2.25 2.25 0 0 0 2.25-2.25V5.25A2.25 2.25 0 0 0 18 3H6.75A2.25 2.25 0 0 0 4.5 5.25v13.5A2.25 2.25 0 0 0 6 21Z" />
    </svg>
);
const HamburgerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
);
const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);


export const App = () => {
    const { useState } = React;

    const [activeTab, setActiveTab] = useState(TABS.JAM_SESSION);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    // Shared state
    const [scenarios, setScenarios] = useState([]);
    const [variableCosts, setVariableCosts] = useState({ almoco: 22, lanche: 11 });
    const [partnershipModel, setPartnershipModel] = useState({
        model: 'Entrada',
        schoolPercentage: 20,
        saasFee: 0,
    });
    const [simulationYear, setSimulationYear] = useState(2025);

    const handleTabClick = (tab) => {
        setActiveTab(tab);
        setIsMobileMenuOpen(false); // Close mobile menu on selection
    };

    const renderContent = () => {
        switch (activeTab) {
            case TABS.JAM_SESSION:
                return <JamSessionStudio 
                    scenarios={scenarios} 
                    setScenarios={setScenarios}
                    variableCosts={variableCosts}
                    setVariableCosts={setVariableCosts}
                />;
            case TABS.OPERATIONAL:
                return <OperationalSimulator 
                    scenarios={scenarios}
                    partnershipModel={partnershipModel}
                    setPartnershipModel={setPartnershipModel}
                    simulationYear={simulationYear}
                    variableCosts={variableCosts}
                />;
            case TABS.ECOSYSTEM:
                 return <EcosystemSimulator 
                    scenarios={scenarios}
                    partnershipModel={partnershipModel}
                    simulationYear={simulationYear}
                />;
            case TABS.TRIBUTARY:
                return <TributarySimulator simulationYear={simulationYear} />;
            default:
                return <JamSessionStudio 
                    scenarios={scenarios} 
                    setScenarios={setScenarios}
                    variableCosts={variableCosts}
                    setVariableCosts={setVariableCosts}
                />;
        }
    };
    
    const SidebarButton = ({ icon, text, isActive, onClick }) => (
        <button
            onClick={onClick}
            className={`flex items-center w-full py-3 pl-2 pr-3 rounded-lg text-left transition-colors duration-200 group-hover:pl-3 ${
                isActive
                ? 'bg-[#ffe9c9] text-[#5c3a21]'
                : 'text-[#8c6d59] hover:bg-[#f3f0e8]'
            }`}
            role="tab"
            aria-selected={isActive}
        >
            <span className={`transition-colors duration-200 ${isActive ? 'text-[#ff595a]' : 'text-[#8c6d59]'}`}>{icon}</span>
            <span className="ml-4 font-semibold text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity delay-150 duration-200">
                {text}
            </span>
        </button>
    );

    const MobileSidebarButton = ({ icon, text, isActive, onClick }) => (
        <button
            onClick={onClick}
            className={`flex items-center w-full p-3 rounded-lg text-left transition-colors duration-200 ${
                isActive
                ? 'bg-[#ffe9c9] text-[#5c3a21]'
                : 'text-[#8c6d59] hover:bg-[#f3f0e8]'
            }`}
            role="tab"
            aria-selected={isActive}
        >
            <span className={`transition-colors duration-200 ${isActive ? 'text-[#ff595a]' : 'text-[#8c6d59]'}`}>{icon}</span>
            <span className="ml-4 font-semibold text-sm whitespace-nowrap">{text}</span>
        </button>
    );

    const MenuContent = ({ isMobile = false }) => {
        const ButtonComponent = isMobile ? MobileSidebarButton : SidebarButton;
        return (
            <>
                <div className={isMobile ? "p-2 space-y-2" : "p-1 space-y-2"} role="tablist">
                    <ButtonComponent icon={<JamSessionIcon />} text={TABS.JAM_SESSION} isActive={activeTab === TABS.JAM_SESSION} onClick={() => handleTabClick(TABS.JAM_SESSION)} />
                    <ButtonComponent icon={<OperationalIcon />} text={TABS.OPERATIONAL} isActive={activeTab === TABS.OPERATIONAL} onClick={() => handleTabClick(TABS.OPERATIONAL)} />
                    <ButtonComponent icon={<EcosystemIcon />} text={TABS.ECOSYSTEM} isActive={activeTab === TABS.ECOSYSTEM} onClick={() => handleTabClick(TABS.ECOSYSTEM)} />
                    <ButtonComponent icon={<TributaryIcon />} text={TABS.TRIBUTARY} isActive={activeTab === TABS.TRIBUTARY} onClick={() => handleTabClick(TABS.TRIBUTARY)} />
                </div>
                <div className={`p-2 border-t border-[#e0cbb2] ${isMobile ? '' : 'transition-opacity duration-300 ease-in-out opacity-0 group-hover:opacity-100'}`}>
                     <FormControl label="Ano da Simulação">
                        <Slider value={simulationYear} onChange={setSimulationYear} min={2024} max={2034} />
                     </FormControl>
                </div>
            </>
        );
    };

    return (
        <div className="min-h-screen bg-[#f3f0e8] text-[#5c3a21] p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="sticky top-0 z-30 bg-[#f3f0e8]/95 backdrop-blur-sm py-4 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto text-center">
                        <h1 className="text-3xl font-bold text-[#5c3a21]">Simulador Operacional</h1>
                        <p className="text-sm text-[#8c6d59]">by LABirintar</p>
                    </div>
                </header>
                
                <div className="relative mt-6">
                     {/* --- Mobile Menu --- */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="fixed top-5 left-5 z-40 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-[#e0cbb2]"
                            aria-label="Abrir menu"
                        >
                            <HamburgerIcon />
                        </button>
                        <div
                            className={`fixed inset-0 z-50 transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                        >
                            <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)}></div>
                            <div className={`relative bg-white w-80 h-full shadow-xl transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                                 <div className="p-4 flex justify-between items-center border-b border-[#e0cbb2]">
                                    <h2 className="font-bold text-[#5c3a21]">Menu</h2>
                                    <button onClick={() => setIsMobileMenuOpen(false)} aria-label="Fechar menu" className="p-1"><CloseIcon /></button>
                                 </div>
                                <nav><MenuContent isMobile={true} /></nav>
                            </div>
                        </div>
                    </div>

                    {/* --- Desktop Menu --- */}
                    <nav className="hidden md:block absolute top-0 z-20 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-[#e0cbb2] transition-all duration-300 ease-in-out w-14 hover:w-80 group overflow-hidden">
                        <MenuContent />
                    </nav>

                    <main className="md:pl-20 lg:pl-24">
                        <div className="bg-white p-6 rounded-2xl shadow-lg border border-[#e0cbb2] max-h-[calc(100vh-12rem)] overflow-y-auto">
                            {renderContent()}
                        </div>
                    </main>
                </div>
            </div>
            <AIChat />
        </div>
    );
};