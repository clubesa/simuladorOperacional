import React from "react";

export const Slider = ({ value, onChange, min, max, step = 1, suffix = "" }) => {
  return (
    <div className="flex items-center space-x-4">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="w-full h-2 bg-[#e0cbb2] rounded-lg appearance-none cursor-pointer slider-thumb"
      />
      <span className="font-bold text-lg text-[#5c3a21] w-20 text-center">{value}{suffix}</span>
    </div>
  );
};