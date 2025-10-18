
import React from "react";

const { useRef, useState, useEffect, useCallback } = React;

export const Slider = ({ value, onChange, min, max, step = 1, suffix = "" }) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Unified handler for both mouse and touch events
  const getClientX = (e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent): number => {
    if ('touches' in e && e.touches.length > 0) {
        return e.touches[0].clientX;
    }
    return (e as MouseEvent).clientX;
  };

  // Memoized function to calculate and set the new value.
  // Dependencies are stable, so this function is created only once.
  const handleValueChange = useCallback((clientX: number) => {
    if (!trackRef.current) return;

    const rect = trackRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    
    const range = max - min;
    const rawValue = min + percentage * range;
    
    const numSteps = (rawValue - min) / step;
    const steppedValue = Math.round(numSteps) * step + min;
    
    const finalValue = Math.max(min, Math.min(max, steppedValue));

    // Let the parent component handle whether to re-render.
    // React's setState bails out automatically if the value is the same.
    onChange(finalValue);
  }, [min, max, step, onChange]);

  // Start dragging
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    // Prevent text selection on desktop and default touch behaviors
    e.preventDefault(); 
    setIsDragging(true);
    handleValueChange(getClientX(e));
  };

  // Effect to handle dragging logic globally
  useEffect(() => {
    const handleDragMove = (e: MouseEvent | TouchEvent) => {
        // preventDefault for touchmove to avoid scrolling the page while sliding
        if (e.type === 'touchmove' && e.cancelable) e.preventDefault();
        handleValueChange(getClientX(e));
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };

    if (isDragging) {
        document.body.style.cursor = 'grabbing';
        document.body.style.userSelect = 'none';
        // Mouse events
        window.addEventListener('mousemove', handleDragMove);
        window.addEventListener('mouseup', handleDragEnd);
        // Touch events
        window.addEventListener('touchmove', handleDragMove, { passive: false });
        window.addEventListener('touchend', handleDragEnd);
        window.addEventListener('touchcancel', handleDragEnd);
    }

    // Cleanup function
    return () => {
        document.body.style.cursor = 'default';
        document.body.style.userSelect = '';
        window.removeEventListener('mousemove', handleDragMove);
        window.removeEventListener('mouseup', handleDragEnd);
        window.removeEventListener('touchmove', handleDragMove);
        window.removeEventListener('touchend', handleDragEnd);
        window.removeEventListener('touchcancel', handleDragEnd);
    };
  }, [isDragging, handleValueChange]);

  const percent = max === min ? 0 : ((value - min) / (max - min)) * 100;

  return (
    <div className="relative pt-2 pb-5 px-2 select-none" onTouchStart={handleDragStart}>
      {/* The track */}
      <div
        ref={trackRef}
        onMouseDown={handleDragStart}
        className="relative w-full h-2 bg-[#e0cbb2] rounded-full cursor-pointer my-2"
        role="slider"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        tabIndex={0}
      >
        {/* The filled part of the track */}
        <div
          className="absolute top-0 left-0 h-full bg-[#ff595a] rounded-full pointer-events-none"
          style={{ width: `${percent}%` }}
        />
        {/* The draggable thumb */}
        <div
          className="absolute top-1/2 w-5 h-5 bg-white border-2 border-[#ff595a] rounded-full cursor-grabbing shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff595a]"
          style={{ 
            left: `${percent}%`, 
            transform: 'translate(-50%, -50%)' 
          }}
          tabIndex={-1}
        />
      </div>
      {/* The output label showing the current value */}
      <output 
          style={{
            left: `${percent}%`,
            transform: `translateX(-50%)`,
          }}
          className="absolute top-6 font-bold text-base text-[#5c3a21] text-center pointer-events-none"
        >
          {value}{suffix}
      </output>
    </div>
  );
};
