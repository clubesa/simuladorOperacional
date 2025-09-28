import React from "react";

export const NumberInput = ({ value, onChange, placeholder = "", prefix = null, min, max, step }) => {
  const handleChange = (e) => {
    const numValue = e.target.value === '' ? 0 : parseFloat(e.target.value);
    onChange(isNaN(numValue) ? 0 : numValue);
  };
  
  return (
    <div className="relative">
      {prefix && (
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#8c6d59]">
          {prefix}
        </span>
      )}
      <input
        type="number"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        className={`w-full rounded-md border-[#e0cbb2] bg-white text-[#5c3a21] shadow-sm focus:border-[#ff595a] focus:ring-1 focus:ring-[#ff595a] ${prefix ? 'pl-10' : 'pl-3'} pr-3 py-2`}
      />
    </div>
  );
};
