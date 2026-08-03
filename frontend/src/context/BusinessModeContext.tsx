"use client";
import React, { createContext, useContext, useState } from "react";

type BusinessModeContextType = {
  isBusinessMode: boolean;
  setIsBusinessMode: (val: boolean) => void;
};

const BusinessModeContext = createContext<BusinessModeContextType | undefined>(undefined);

export function BusinessModeProvider({ children }: { children: React.ReactNode }) {
  const [isBusinessMode, setIsBusinessMode] = useState(false);
  return (
    <BusinessModeContext.Provider value={{ isBusinessMode, setIsBusinessMode }}>
      {children}
    </BusinessModeContext.Provider>
  );
}

export function useBusinessMode() {
  const context = useContext(BusinessModeContext);
  if (context === undefined) {
    throw new Error("useBusinessMode must be used within a BusinessModeProvider");
  }
  return context;
}
