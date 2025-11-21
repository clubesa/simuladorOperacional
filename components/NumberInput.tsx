
import React from "react";

const { useState, useEffect } = React;

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const ResetIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 text-[#8c6d59] group-hover:text-[#ff595a] transition-colors">
        <path fillRule="evenodd" d="M12.75 8a4.75 4.75 0 1 1-9.5 0 4.75 4.75 0 0 1 9.5 0ZM8 3.25a.75.75 0 0 1 .75.75v3.25H11a.75.75 0 0 1 0 1.5H8.75V12a.75.75 0 0 1-1.5 0V8.75H4a.75.75 0 0 1 0-1.5h3.25V4A.75.75 0 0 1 8 3.25Z" clipRule="evenodd" transform="rotate(45 8 8)" />
    </svg>
);


// FIX: Added explicit type definitions for props to make defaultValue and onReset optional.
export const NumberInput = ({
  value,
  onChange,
  placeholder = "",
  prefix = null,
  min,
  max,
  step,
  formatAsCurrency = false,
  disabled = false,
  onFocus = () => {},
  defaultValue,
  onReset,
  className = ""
}: {
  value: number | null | undefined;
  onChange: (value: number) => void;
  placeholder?: string;
  prefix?: React.ReactNode;
  min?: number;
  max?: number;
  step?: number;
  formatAsCurrency?: boolean;
  disabled?: boolean;
  onFocus?: () => void;
  defaultValue?: number;
  onReset?: () => void;
  className?: string;
}) => {
  const [displayValue, setDisplayValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  
  const hasBeenChanged = onReset && defaultValue !== undefined && value !== defaultValue;

  useEffect(() => {
    // When not focused, the display value should be a formatted representation of the prop value.
    if (!isFocused) {
      if (value === null || typeof value === 'undefined' || isNaN(value)) {
        setDisplayValue('');
        return;
      }

      if (formatAsCurrency) {
        setDisplayValue(currencyFormatter.format(value));
      } else {
        setDisplayValue(value.toString());
      }
    }
  }, [value, isFocused, formatAsCurrency]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDisplayValue(inputValue); // Update display immediately for fluid typing.

    let parsedValue;
    let isValidPartial = false;

    if (formatAsCurrency) {
        const numericString = inputValue.replace(/\./g, '').replace(',', '.');
        if (numericString === '' || numericString === '-') {
            parsedValue = 0;
            isValidPartial = true;
        } else if (/^-?\d*\.?\d*$/.test(numericString)) {
            parsedValue = parseFloat(numericString);
            isValidPartial = true;
        }
    } else { // non-currency
        if (inputValue === '' || inputValue === '-') {
            parsedValue = 0;
            isValidPartial = true;
        } else if (/^-?\d*\.?\d*$/.test(inputValue)) {
            parsedValue = parseFloat(inputValue);
            isValidPartial = true;
        }
    }

    if (isValidPartial && typeof parsedValue === 'number' && !isNaN(parsedValue)) {
        onChange(parsedValue);
    }
    // If input is invalid (e.g., contains letters), we don't call onChange.
    // The invalid text remains in the input for the user to see and correct.
    // On blur, it will snap back to the last valid value from props.
  };
  
  const handleFocus = () => {
    onFocus();
    setIsFocused(true);
    
    // On focus, convert the model value to a simple, editable string.
    if (value === null || typeof value === 'undefined' || value === 0) {
        setDisplayValue(''); // Start with a blank field for easier typing.
        return;
    }
    
    if (formatAsCurrency) {
      setDisplayValue(String(value).replace('.', ','));
    } else {
      setDisplayValue(String(value));
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // The useEffect hook will now trigger because isFocused has changed.
    // It will format the display value based on the last valid 'value' from props.
    // This automatically handles cleanup of invalid or partial inputs.
  };
  
  return (
    <div className={`relative ${className}`}>
      {prefix && (
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#8c6d59]">
          {prefix}
        </span>
      )}
       {hasBeenChanged && (
        <button
          type="button"
          onClick={() => onReset && onReset()}
          className="absolute inset-y-0 right-0 flex items-center pr-3 group z-10"
          aria-label="Restaurar valor padrão"
        >
          <ResetIcon />
        </button>
      )}
      <input
        // Use 'text' to allow partial inputs like "15." which are invalid for 'number'
        type="text" 
        // Provide hints to mobile keyboards
        inputMode={formatAsCurrency ? "decimal" : "numeric"}
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full rounded-md border-[#bf917f] bg-white text-[#5c3a21] shadow-sm focus:border-[#ff595a] focus:ring-1 focus:ring-[#ff595a] ${prefix ? 'pl-10' : 'pl-3'} ${hasBeenChanged ? 'pr-10' : 'pr-3'} py-2 ${formatAsCurrency ? 'text-right' : ''} ${disabled ? 'bg-gray-100 cursor-not-allowed text-gray-600' : ''}`}
      />
    </div>
  );
};
