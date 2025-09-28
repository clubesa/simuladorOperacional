import React from "react";

export const Select = ({ value, onChange, options }) => {
  const handleChange = (e) => {
    onChange(e.target.value);
  };
  
  return (
    <select
      value={value}
      onChange={handleChange}
      className="w-full rounded-md border-[#e0cbb2] bg-white text-[#5c3a21] shadow-sm focus:border-[#ff595a] focus:ring-1 focus:ring-[#ff595a] px-3 py-2"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
};
