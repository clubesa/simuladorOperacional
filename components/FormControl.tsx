import React from "react";

// FIX: Added explicit type definitions for props and made `children` optional to resolve type errors.
export const FormControl = ({ label, description = null, children, className = "" }: { label: React.ReactNode; description?: any; children?: React.ReactNode, className?: string }) => {
  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      <label className="text-sm font-medium text-[#5c3a21]">{label}</label>
      {children}
      {description && <p className="text-xs text-[#8c6d59]">{description}</p>}
    </div>
  );
};