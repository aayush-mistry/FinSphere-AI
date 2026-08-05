"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { FinancialProfile } from "@/lib/types/profile";
import { mockFinancialProfile } from "@/lib/mockData/profileData";
import { MOCK_INSIGHTS, MOCK_GOALS, MOCK_BILLS, MOCK_ALERTS } from "@/lib/mockData";
import { Insight, Goal, Bill, AIAlert } from "@/lib/types";

interface FinancialProfileContextType {
  profile: FinancialProfile;
  setProfile: React.Dispatch<React.SetStateAction<FinancialProfile>>;
  insights: Insight[];
  goals: Goal[];
  bills: Bill[];
  alerts: AIAlert[];
  isLoading: boolean;
}

const FinancialProfileContext = createContext<FinancialProfileContextType | undefined>(undefined);

export function FinancialProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<FinancialProfile>(mockFinancialProfile);
  // In a real app, these would be fetched alongside or derived from the profile
  const [insights] = useState<Insight[]>(MOCK_INSIGHTS);
  const [goals] = useState<Goal[]>(MOCK_GOALS);
  const [bills] = useState<Bill[]>(MOCK_BILLS);
  const [alerts] = useState<AIAlert[]>(MOCK_ALERTS);
  const [isLoading] = useState(false);

  return (
    <FinancialProfileContext.Provider value={{ profile, setProfile, insights, goals, bills, alerts, isLoading }}>
      {children}
    </FinancialProfileContext.Provider>
  );
}

export function useFinancialProfile() {
  const context = useContext(FinancialProfileContext);
  if (context === undefined) {
    throw new Error("useFinancialProfile must be used within a FinancialProfileProvider");
  }
  return context;
}
