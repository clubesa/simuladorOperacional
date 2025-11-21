import React from "react";
import { JamSessionStudio } from './components/JamSessionStudio.tsx';
import { StrategicAnalysis } from './components/StrategicAnalysis.tsx';
import { AIChat } from './components/AIChat.tsx';
import { Slider } from './components/Slider.tsx';
import { FormControl } from './components/FormControl.tsx';
import { TaxRegime } from './types.tsx';
import { AppManualModal } from './components/AppManualModal.tsx';
import { labirintarLogoBase64 } from './assets/logo.ts';

const TABS = {
    JAM_SESSION: 'Jam Session Studio',
    STRATEGIC_ANALYSIS: 'Análise Estratégica',
    MANUAL: 'Manual do App',
};

// Default state values
export const DEFAULTS = {
    VARIABLE_COSTS: { almoco: 22, lanche: 11 },
    PARTNERSHIP_MODEL: { schoolPercentage: 30, saasFee: 2000 },
    SCHOOL_TAX_PARAMS: { regime: TaxRegime.LUCRO_REAL, cnaeCode: '85.12-1/00', presuncao: 32, pat: false },
};

// SVG Icon Components (moved outside App component)
const JamSessionIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467l2.31-.66a2.25 2.25 0 0 0 1.632-2.163Zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 0 1-.99-3.467l2.31-.66A2.25 2.25 0 0 0 9 15.553Z" />
    </svg>
);
const StrategicAnalysisIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
    </svg>
);
const ManualIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
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
const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0h18" />
    </svg>
);


export const usePersistentState = <T,>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>, () => void] => {
  const [state, setState] = React.useState<T>(() => {
    try {
      const storedValue = localStorage.getItem(key);
      if (storedValue) {
        const parsedValue = JSON.parse(storedValue);
        // Merge with defaults only if both are non-array objects to avoid errors with primitive types
        if (
          typeof defaultValue === 'object' && defaultValue !== null && !Array.isArray(defaultValue) &&
          typeof parsedValue === 'object' && parsedValue !== null && !Array.isArray(parsedValue)
        ) {
          return { ...defaultValue, ...parsedValue };
        }
        return parsedValue;
      }
      return defaultValue;
    } catch (error) {
      console.error(`Error reading localStorage key “${key}”:`, error);
      return defaultValue;
    }
  });

  React.useEffect(() => {
    try {
        localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error(`Error setting localStorage key “${key}”:`, error);
    }
  }, [key, state]);

  const resetState = () => setState(defaultValue);

  return [state, setState, resetState];
};

const YearSelectionModal = ({ isOpen, onClose, year, setYear }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm m-4"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-[#5c3a21]">Selecionar Ano da Simulação</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-[#f4f0e8]">
                        <CloseIcon />
                    </button>
                </div>
                <FormControl label={`Ano selecionado: ${year}`}>
                    <Slider value={year} onChange={setYear} min={2024} max={2034} />
                </FormControl>
                <div className="text-right mt-4">
                  <button onClick={onClose} className="bg-[#ff595a] text-white font-bold py-2 px-5 rounded-lg shadow-md hover:bg-red-600 transition-colors">
                    Confirmar
                  </button>
                </div>
            </div>
        </div>
    );
};

const SidebarButton = ({ icon, text, isActive, onClick }) => (
    <div className="relative group" role="presentation">
        <button
            onClick={onClick}
            aria-label={text}
            className={`flex items-center justify-center w-full py-3 rounded-lg transition-colors duration-200 ${
                isActive
                ? 'bg-[#ffe9c9] text-[#5c3a21]'
                : 'text-[#8c6d59] hover:bg-[#f4f0e8]'
            }`}
            role="tab"
            aria-selected={isActive}
        >
            <span className={`transition-colors duration-200 ${isActive ? 'text-[#ff595a]' : 'text-[#8c6d59]'}`}>{icon}</span>
        </button>
        <div 
            className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-[#5c3a21] text-white text-xs font-semibold rounded-md shadow-lg whitespace-nowrap z-50 transform opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
            role="tooltip"
        >
            {text}
            {/* Arrow */}
            <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-r-4 border-r-[#5c3a21]"></div>
        </div>
    </div>
);

const MobileSidebarButton = ({ icon, text, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center w-full p-3 rounded-lg text-left transition-colors duration-200 ${
            isActive
            ? 'bg-[#ffe9c9] text-[#5c3a21]'
            : 'text-[#8c6d59] hover:bg-[#f4f0e8]'
        }`}
        role="tab"
        aria-selected={isActive}
    >
        <span className={`transition-colors duration-200 ${isActive ? 'text-[#ff595a]' : 'text-[#8c6d59]'}`}>{icon}</span>
        <span className="ml-4 font-semibold text-sm whitespace-nowrap">{text}</span>
    </button>
);

const MenuContent = ({ activeTab, handleTabClick, isMobileMenuOpen, setIsMobileMenuOpen, isManualOpen, isYearModalOpen, setIsYearModalOpen, simulationYear, setSimulationYear, contentContainerRef }) => {
    const ButtonComponent = isMobileMenuOpen ? MobileSidebarButton : SidebarButton;
    
    const onTabClick = (tab) => {
        if (tab === TABS.MANUAL) {
            handleTabClick(true);
            return;
        }
        handleTabClick(tab);
    };

    return (
        <>
            <div className={isMobileMenuOpen ? "p-2 space-y-2" : "p-1 space-y-2"} role="tablist">
                <ButtonComponent icon={<JamSessionIcon />} text={TABS.JAM_SESSION} isActive={activeTab === TABS.JAM_SESSION} onClick={() => onTabClick(TABS.JAM_SESSION)} />
                <ButtonComponent icon={<StrategicAnalysisIcon />} text={TABS.STRATEGIC_ANALYSIS} isActive={activeTab === TABS.STRATEGIC_ANALYSIS} onClick={() => onTabClick(TABS.STRATEGIC_ANALYSIS)} />
                <div className="pt-2 border-t border-[#bf917f] my-2"></div>
                <ButtonComponent icon={<ManualIcon />} text={TABS.MANUAL} isActive={isManualOpen} onClick={() => onTabClick(TABS.MANUAL)} />
            </div>
            <div className={isMobileMenuOpen ? "p-2 border-t border-[#bf917f]" : "p-1 border-t border-[#bf917f]"}>
                 {isMobileMenuOpen ? (
                    <FormControl label="Ano da Simulação">
                       <Slider value={simulationYear} onChange={setSimulationYear} min={2024} max={2034} />
                    </FormControl>
                 ) : (
                    <ButtonComponent icon={<CalendarIcon />} text={`Ano da Simulação: ${simulationYear}`} isActive={isYearModalOpen} onClick={() => setIsYearModalOpen(true)} />
                 )}
            </div>
        </>
    );
};


export const App = () => {
    const { useRef, useState, useCallback } = React;

    const [activeTab, setActiveTab, resetActiveTab] = usePersistentState('sim-activeTab', TABS.JAM_SESSION);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isManualOpen, setIsManualOpen] = useState(false);
    const [isYearModalOpen, setIsYearModalOpen] = useState(false);
    const contentContainerRef = useRef(null);
    
    // Shared state
    const [scenarios, setScenarios, resetScenarios] = usePersistentState('sim-scenarios', []);
    const [variableCosts, setVariableCosts, resetVariableCosts] = usePersistentState('sim-variableCosts', DEFAULTS.VARIABLE_COSTS);
    const [partnershipModel, setPartnershipModel, resetPartnershipModel] = usePersistentState('sim-partnershipModel', DEFAULTS.PARTNERSHIP_MODEL);
    const [simulationYear, setSimulationYear, resetSimulationYear] = usePersistentState('sim-simulationYear', 2025);
    const [schoolTaxParams, setSchoolTaxParams, resetSchoolTaxParams] = usePersistentState('sim-schoolTaxParams', DEFAULTS.SCHOOL_TAX_PARAMS);

    const handleTabClick = useCallback((tab) => {
        if (tab === true) { // Special case for manual modal
            setIsManualOpen(true);
            return;
        }
        setActiveTab(tab);
        setIsMobileMenuOpen(false); // Close mobile menu on selection
        // Scroll to top of content window
        if (contentContainerRef.current) {
            contentContainerRef.current.scrollTop = 0;
        }
    }, [setActiveTab, setIsManualOpen, setIsMobileMenuOpen, contentContainerRef]);
    
    return (
        <div className="min-h-screen text-[#5c3a21] p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="relative sticky top-0 z-30 bg-transparent py-[4.5rem] -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto flex items-center justify-end">
                        {/* Empty container for alignment purposes */}
                    </div>
                     <div className="absolute bottom-6 left-0 right-0">
                        <h1 className="text-center text-2xl font-bold text-[#5c3a21]" style={{ fontFamily: "'Roboto Slab', serif" }}>
                            Simulador Operacional
                        </h1>
                    </div>
                </header>
                
                <div className="relative mt-6">
                     {/* --- Mobile Menu --- */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="fixed top-5 left-5 z-40 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-[#bf917f]"
                            aria-label="Abrir menu"
                        >
                            <HamburgerIcon />
                        </button>
                        <div
                            className={`fixed inset-0 z-50 transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                        >
                            <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)}></div>
                            <div className={`relative bg-white w-80 h-full shadow-xl transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                                 <div className="p-4 flex justify-between items-center border-b border-[#bf917f]">
                                    <h2 className="font-bold text-[#5c3a21]">Menu</h2>
                                    <button onClick={() => setIsMobileMenuOpen(false)} aria-label="Fechar menu" className="p-1"><CloseIcon /></button>
                                 </div>
                                {/* FIX: Added missing props to the MenuContent component to resolve type errors. */}
                                <nav><MenuContent isMobileMenuOpen={true} handleTabClick={handleTabClick} activeTab={activeTab} isManualOpen={isManualOpen} simulationYear={simulationYear} setSimulationYear={setSimulationYear} setIsMobileMenuOpen={setIsMobileMenuOpen} isYearModalOpen={isYearModalOpen} setIsYearModalOpen={setIsYearModalOpen} contentContainerRef={contentContainerRef} /></nav>
                            </div>
                        </div>
                    </div>

                    {/* --- Desktop Menu --- */}
                    <nav className="hidden md:block absolute top-0 z-30 bg-transparent transition-all duration-300 ease-in-out w-14">
                        {/* FIX: Added missing props to the MenuContent component to resolve type errors. */}
                        <MenuContent isMobileMenuOpen={false} handleTabClick={handleTabClick} activeTab={activeTab} isManualOpen={isManualOpen} isYearModalOpen={isYearModalOpen} setIsYearModalOpen={setIsYearModalOpen} simulationYear={simulationYear} setSimulationYear={setSimulationYear} setIsMobileMenuOpen={setIsMobileMenuOpen} contentContainerRef={contentContainerRef} />
                    </nav>

                    <main className="md:pl-20 lg:pl-24">
                        <div ref={contentContainerRef} className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-[#bf917f] max-h-[calc(100vh-13rem)] overflow-y-auto overflow-x-hidden">
                            <div style={{ display: activeTab === TABS.JAM_SESSION ? 'block' : 'none' }}>
                                <JamSessionStudio 
                                    scenarios={scenarios} 
                                    setScenarios={setScenarios}
                                />
                            </div>
                             <div style={{ display: activeTab === TABS.STRATEGIC_ANALYSIS ? 'block' : 'none' }}>
                                <StrategicAnalysis 
                                    scenarios={scenarios}
                                    partnershipModel={partnershipModel}
                                    setPartnershipModel={setPartnershipModel}
                                    resetPartnershipModel={resetPartnershipModel}
                                    partnershipModelDefault={DEFAULTS.PARTNERSHIP_MODEL}
                                    simulationYear={simulationYear}
                                    variableCosts={variableCosts}
                                    setVariableCosts={setVariableCosts}
                                    resetVariableCosts={resetVariableCosts}
                                    variableCostsDefault={DEFAULTS.VARIABLE_COSTS}
                                    schoolTaxParams={schoolTaxParams}
                                    setSchoolTaxParams={setSchoolTaxParams}
                                    resetSchoolTaxParams={resetSchoolTaxParams}
                                    schoolTaxParamsDefault={DEFAULTS.SCHOOL_TAX_PARAMS}
                                />
                            </div>
                        </div>
                    </main>
                </div>
            </div>
            <AIChat />
            {isManualOpen && <AppManualModal onClose={() => setIsManualOpen(false)} />}
            <YearSelectionModal isOpen={isYearModalOpen} onClose={() => setIsYearModalOpen(false)} year={simulationYear} setYear={setSimulationYear} />
        </div>
    );
};
