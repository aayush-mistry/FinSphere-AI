import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { FinancialProfile } from "@/lib/types/profile";

export interface HealthMetricResult {
  name: string;
  score: number;
  max_score: number;
  value_description: string;
  status: "excellent" | "good" | "fair" | "poor";
}

export interface HealthEngineResponse {
  overall_score: number;
  raw_score: number;
  risk_level: string;
  color_code: "emerald" | "amber" | "rose";
  metrics: HealthMetricResult[];
  ai_explanation: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export function useFinancialHealth(profile: FinancialProfile | null) {
  const [data, setData] = useState<HealthEngineResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    api.calculateFinancialHealth(profile)
      .then((res: HealthEngineResponse) => {
        if (isMounted) {
          setData(res);
          setIsLoading(false);
        }
      })
      .catch((err: any) => {
        if (isMounted) {
          console.error("Failed to calculate financial health:", err);
          setError(err.message || "Failed to calculate health score.");
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [profile]);

  return { data, isLoading, error };
}
