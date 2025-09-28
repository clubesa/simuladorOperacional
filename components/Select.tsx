import React from 'react';

interface SelectProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: T[];
}

const Select = <T extends string>({ value, onChange, options }: SelectProps<T>): React.ReactElement => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value as T);
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

export default Select;
