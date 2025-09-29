import React from "react";

const { useState, useEffect } = React;

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const NumberInput = ({ value, onChange, placeholder = "", prefix = null, min, max, step, formatAsCurrency = false }) => {
  const [displayValue, setDisplayValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    // Only format the value when the input is not focused to avoid disrupting user input.
    if (!isFocused) {
      if (formatAsCurrency) {
        if (value === null || typeof value === 'undefined' || isNaN(value)) {
          setDisplayValue('');
        } else {
          setDisplayValue(currencyFormatter.format(value));
        }
      } else {
         // For non-currency, ensure value is not null/undefined before toString()
        setDisplayValue(value === null || typeof value === 'undefined' ? '' : value.toString());
      }
    }
  }, [value, isFocused, formatAsCurrency]);

  const handleCurrencyChange = (e) => {
    const inputValue = e.target.value;
    setDisplayValue(inputValue); // Let user type freely

    // Clean up input for parsing: remove thousands separators, then replace comma with dot.
    const numericString = inputValue.replace(/\./g, '').replace(',', '.');
    
    // Only call onChange if it's a valid partial number
    if (numericString === '' || /^\d*\.?\d*$/.test(numericString)) {
        const numValue = parseFloat(numericString);
        if (!isNaN(numValue)) {
            onChange(numValue);
        } else if (inputValue.trim() === '') {
            onChange(0);
        }
    }
  };
  
  const handleFocus = () => {
    setIsFocused(true);
    // When focusing, show a less formatted value for easier editing.
    if (formatAsCurrency) {
      if(value === 0) {
        setDisplayValue('');
      } else if (value) {
        // Display with comma decimal but no thousands separators
        setDisplayValue(String(value).replace('.', ','));
      }
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // The useEffect hook will trigger a re-format when isFocused becomes false.
  };

  const handleLegacyChange = (e) => {
    const rawValue = e.target.value;
    if (rawValue === '') {
        onChange(0); // Treat empty as 0 for consistency
        return;
    }
    const numValue = parseFloat(rawValue);
    if (!isNaN(numValue)) {
        onChange(numValue);
    }
  };
  
  if (!formatAsCurrency) {
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
            onChange={handleLegacyChange}
            placeholder={placeholder}
            min={min}
            max={max}
            step={step}
            className={`w-full rounded-md border-[#e0cbb2] bg-white text-[#5c3a21] shadow-sm focus:border-[#ff595a] focus:ring-1 focus:ring-[#ff595a] ${prefix ? 'pl-10' : 'pl-3'} pr-3 py-2`}
        />
        </div>
    );
  }
  
  return (
    <div className="relative">
      {prefix && (
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#8c6d59]">
          {prefix}
        </span>
      )}
      <input
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleCurrencyChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`w-full rounded-md border-[#e0cbb2] bg-white text-[#5c3a21] shadow-sm focus:border-[#ff595a] focus:ring-1 focus:ring-[#ff595a] ${prefix ? 'pl-10' : 'pl-3'} pr-3 py-2 text-right`}
      />
    </div>
  );
};
