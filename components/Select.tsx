import React from "react";

const ResetIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 text-[#8c6d59] group-hover:text-[#ff595a] transition-colors">
        <path fillRule="evenodd" d="M12.75 8a4.75 4.75 0 1 1-9.5 0 4.75 4.75 0 0 1 9.5 0ZM8 3.25a.75.75 0 0 1 .75.75v3.25H11a.75.75 0 0 1 0 1.5H8.75V12a.75.75 0 0 1-1.5 0V8.75H4a.75.75 0 0 1 0-1.5h3.25V4A.75.75 0 0 1 8 3.25Z" clipRule="evenodd" transform="rotate(45 8 8)" />
    </svg>
);

export const Select = ({ value, onChange, options, defaultValue, onReset }) => {
  const handleChange = (e) => {
    onChange(e.target.value);
  };
  
  const hasBeenChanged = onReset && defaultValue !== undefined && value !== defaultValue;

  return (
    <div className="relative">
      <select
        value={value}
        onChange={handleChange}
        className={`w-full rounded-md border-[#bf917f] bg-white text-[#5c3a21] shadow-sm focus:border-[#ff595a] focus:ring-1 focus:ring-[#ff595a] py-2 pl-3 appearance-none ${hasBeenChanged ? 'pr-16' : 'pr-10'}`}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
        {hasBeenChanged && (
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onReset(); }}
            className="pointer-events-auto p-1 group z-10 mr-1"
            aria-label="Restaurar valor padrão"
          >
            <ResetIcon />
          </button>
        )}
        <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </div>
    </div>
  );
};