import { FinancialContext } from "@/engine/types";

export type AgentIntent = 
  | 'financial_advisor'
  | 'spending_analysis'
  | 'goal_planning'
  | 'recommendation'
  | 'general';

export interface AgentRequest {
  query: string;
  context: FinancialContext;
}

export interface AgentResponse {
  content: string; // Markdown formatted response
  confidence: number;
  sources: string[];
}

export interface BaseAgent {
  analyze(request: AgentRequest): Promise<AgentResponse>;
}
