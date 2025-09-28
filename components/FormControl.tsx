import React from "react";

export const FormControl = ({ label, description = null, children }) => {
  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-medium text-[#5c3a21]">{label}</label>
      {children}
      {description && <p className="text-xs text-[#8c6d59]">{description}</p>}
    </div>
  );
};
