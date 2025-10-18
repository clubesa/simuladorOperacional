import React from "react";

const { useEffect, useState } = React;

export const FloatingAlert = ({ message, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (message) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
                // Allow time for fade-out animation before calling onClose
                setTimeout(onClose, 300);
            }, 5000); // Auto-close after 5 seconds

            return () => clearTimeout(timer);
        } else {
            setIsVisible(false);
        }
    }, [message, onClose]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300);
    };

    return (
        <div 
            className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 transition-all duration-300 ease-in-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}
            role="alert"
            aria-live="assertive"
        >
            <div className="bg-red-100 border border-[#ff595a] text-[#5c3a21] px-4 py-3 rounded-lg relative shadow-lg flex items-center justify-between">
                <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#ff595a] mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span className="block sm:inline text-sm font-medium">{message}</span>
                </div>
                <button onClick={handleClose} className="p-1 -mr-1 rounded-full hover:bg-[#ff595a]/20">
                    <svg className="fill-current h-5 w-5 text-[#ff595a]" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Fechar</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
                </button>
            </div>
        </div>
    );
};