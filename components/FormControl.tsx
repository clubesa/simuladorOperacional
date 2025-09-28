
import React from 'react';

interface FormControlProps {
  label: string;
  description?: string;
  children: React.ReactNode;
}

const FormControl: React.FC<FormControlProps> = ({ label, description, children }) => {
  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-medium text-[#5c3a21]">{label}</label>
      {children}
      {description && <p className="text-xs text-[#8c6d59]">{description}</p>}
    </div>
  );
};

export default FormControl;