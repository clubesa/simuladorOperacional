
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

export const App = () => {
    const { useState } = React;

    const [activeTab, setActiveTab] = useState(TABS.JAM_SESSION);
    
    // Shared state lifted up to be passed between components
    const [scenarios, setScenarios] = useState([]);
    const [variableCosts, setVariableCosts] = useState({ almoco: 22, lanche: 11 });
    const [partnershipModel, setPartnershipModel] = useState({
        model: 'Entrada',
        schoolPercentage: 20,
        saasFee: 0,
    });
    const [simulationYear, setSimulationYear] = useState(2025);

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
    
    const TabButton = ({ label, isActive, onClick }) => (
        <button
            onClick={onClick}
            className={`px-4 py-3 text-sm sm:text-base font-semibold border-b-4 transition-colors duration-200 focus:outline-none ${
                isActive 
                ? 'border-[#ff595a] text-[#5c3a21]' 
                : 'border-transparent text-[#8c6d59] hover:border-[#e0cbb2] hover:text-[#5c3a21]'
            }`}
            role="tab"
            aria-selected={isActive}
        >
            {label}
        </button>
    );

    return (
        <div className="min-h-screen bg-[#f3f0e8] text-[#5c3a21] p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-wrap justify-between items-center mb-6 gap-y-4">
                    <div className="w-80">
                        <h1 className="text-3xl font-bold text-[#5c3a21]">Simulador Operacional</h1>
                        <p className="text-sm text-[#8c6d59]">by LABirintar</p>
                    </div>
                    <div className="w-80 text-right">
                         <FormControl label="Ano da Simulação Global">
                            <Slider value={simulationYear} onChange={setSimulationYear} min={2024} max={2034} />
                         </FormControl>
                    </div>
                </header>

                <div className="bg-white p-6 rounded-2xl shadow-lg border border-[#e0cbb2]">
                    <nav className="border-b border-[#e0cbb2] -mx-6 px-6">
                         <div className="flex items-center space-x-2 sm:space-x-4 overflow-x-auto" role="tablist">
                            <TabButton label="1. Jam Session Studio" isActive={activeTab === TABS.JAM_SESSION} onClick={() => setActiveTab(TABS.JAM_SESSION)} />
                            <TabButton label="2. Análise Fazer vs. Comprar" isActive={activeTab === TABS.OPERATIONAL} onClick={() => setActiveTab(TABS.OPERATIONAL)} />
                            <TabButton label="3. Saúde do Ecossistema" isActive={activeTab === TABS.ECOSYSTEM} onClick={() => setActiveTab(TABS.ECOSYSTEM)} />
                            <TabButton label="4. Calculadora Tributária" isActive={activeTab === TABS.TRIBUTARY} onClick={() => setActiveTab(TABS.TRIBUTARY)} />
                         </div>
                    </nav>
                    
                    <div className="mt-6">
                        {renderContent()}
                    </div>
                </div>
            </div>
            <AIChat />
        </div>
    );
};
