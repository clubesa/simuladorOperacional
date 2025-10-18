import React from "react";

export const InfoTooltip = ({ text }) => {
    const { useState, useRef, useEffect } = React;
    
    const [style, setStyle] = useState({});
    const [arrowStyle, setArrowStyle] = useState({});
    const [isVisible, setIsVisible] = useState(false);
    
    const wrapperRef = useRef(null);
    const tooltipRef = useRef(null);
    
    const calculatePosition = () => {
        if (!wrapperRef.current || !tooltipRef.current) return;

        const wrapperRect = wrapperRef.current.getBoundingClientRect();
        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        
        const space = 8; // Viewport edge margin

        let finalLeft = wrapperRect.left + (wrapperRect.width / 2) - (tooltipRect.width / 2);
        
        // Check right boundary
        if (finalLeft + tooltipRect.width > window.innerWidth - space) {
            finalLeft = window.innerWidth - tooltipRect.width - space;
        }
        
        // Check left boundary
        if (finalLeft < space) {
            finalLeft = space;
        }

        const arrowLeft = wrapperRect.left + (wrapperRect.width / 2) - finalLeft;

        setStyle({
            left: `${finalLeft}px`,
            top: `${wrapperRect.top - tooltipRect.height - 8}px`, // 8px arrow height + margin
        });
        setArrowStyle({
            left: `${arrowLeft}px`,
        });
    };
    
    const handleMouseEnter = () => {
        setIsVisible(true);
    };

    const handleMouseLeave = () => {
        setIsVisible(false);
    };

    useEffect(() => {
        if (isVisible) {
            calculatePosition();
            window.addEventListener('resize', calculatePosition);
            window.addEventListener('scroll', calculatePosition, true); // Capture scroll on any element
        }
        return () => {
             window.removeEventListener('resize', calculatePosition);
             window.removeEventListener('scroll', calculatePosition, true);
        }
    }, [isVisible]);

    return (
        <div 
            ref={wrapperRef}
            className="relative inline-flex items-center"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onFocus={handleMouseEnter}
            onBlur={handleMouseLeave}
            tabIndex={0} 
            role="tooltip"
            aria-label={text}
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[#8c6d59] cursor-pointer" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
            </svg>
            
            <div 
                ref={tooltipRef}
                style={style}
                className={`fixed w-64 p-3 bg-[#bf917f] text-white text-xs rounded-lg shadow-lg transition-opacity duration-300 pointer-events-none z-50 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                aria-hidden={!isVisible}
            >
                {text}
                <div 
                    style={arrowStyle}
                    className="absolute top-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-[#bf917f] -translate-x-1/2"
                    aria-hidden="true"
                ></div>
            </div>
        </div>
    );
};