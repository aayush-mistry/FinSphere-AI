import { AgentRequest, AgentIntent, AgentResponse } from './types';
import { FinancialAdvisorAgent } from './agents/financialAdvisor';
import { SpendingIntelligenceAgent } from './agents/spendingAgent';
import { GoalPlanningAgent } from './agents/goalAgent';
import { RecommendationEngineAgent } from './agents/recommendationEngine';

export class MultiAgentSupervisor {
  private financialAdvisor = new FinancialAdvisorAgent();
  private spendingAgent = new SpendingIntelligenceAgent();
  private goalAgent = new GoalPlanningAgent();
  private recommendationEngine = new RecommendationEngineAgent();

  private detectIntents(query: string): AgentIntent[] {
    const q = query.toLowerCase();
    const intents: AgentIntent[] = [];

    if (q.match(/health|overall|budget|summary|how am i doing/)) {
      intents.push('financial_advisor');
    }
    if (q.match(/spend|expenses|category|subscription|food|dining|shopping/)) {
      intents.push('spending_analysis');
    }
    if (q.match(/goal|save|house|car|retire|fund/)) {
      intents.push('goal_planning');
    }
    if (q.match(/recommend|advice|improve|should i/)) {
      intents.push('recommendation');
    }

    // Default to advisor if nothing matches
    if (intents.length === 0) {
      intents.push('financial_advisor');
    }

    return intents;
  }

  async processRequest(request: AgentRequest): Promise<AgentResponse> {
    const intents = this.detectIntents(request.query);
    const promises: Promise<AgentResponse>[] = [];

    // The supervisor intelligently calls multiple agents if needed
    if (intents.includes('financial_advisor')) promises.push(this.financialAdvisor.analyze(request));
    if (intents.includes('spending_analysis')) promises.push(this.spendingAgent.analyze(request));
    if (intents.includes('goal_planning')) promises.push(this.goalAgent.analyze(request));
    if (intents.includes('recommendation')) promises.push(this.recommendationEngine.analyze(request));

    const responses = await Promise.all(promises);

    // Combine responses
    let combinedContent = "";
    let combinedConfidence = 0;
    const combinedSources = new Set<string>();

    responses.forEach((res, index) => {
      if (index > 0) combinedContent += "\n\n---\n\n";
      combinedContent += res.content;
      combinedConfidence += res.confidence;
      res.sources.forEach(s => combinedSources.add(s));
    });

    return {
      content: combinedContent,
      confidence: combinedConfidence / responses.length, // average confidence
      sources: Array.from(combinedSources),
    };
  }
}
