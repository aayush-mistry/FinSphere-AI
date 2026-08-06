import { AgentRequest, AgentResponse, BaseAgent } from '../types';

export class RecommendationEngineAgent implements BaseAgent {
  async analyze(request: AgentRequest): Promise<AgentResponse> {
    const { context } = request;
    const recommendations: string[] = [];

    // Rule 1: High interest debt
    const creditCards = context.accounts.filter(a => a.type === 'credit_card' && a.balance < 0);
    if (creditCards.length > 0) {
      recommendations.push(`**🚨 Prioritize High-Interest Debt**: You have outstanding credit card balances. Consider allocating extra cash flow to pay this down to avoid high compounding interest.`);
    }

    // Rule 2: Low Savings Rate
    if (context.cashFlow.savingsRate > 0 && context.cashFlow.savingsRate < 15) {
      recommendations.push(`**💡 Boost Savings Rate**: Your savings rate is ${context.cashFlow.savingsRate.toFixed(1)}%. Financial experts recommend aiming for 20%. Try reducing discretionary spending to boost this.`);
    }

    // Rule 3: Idle Cash
    const idleCash = context.accounts.filter(a => a.type === 'checking' && a.balance > 10000);
    if (idleCash.length > 0) {
      recommendations.push(`**📈 Move Idle Cash**: You have over $10,000 sitting in checking accounts earning little to no interest. Consider moving a portion to your High Yield Savings or Investment accounts.`);
    }

    // Rule 4: Emergency Fund Check
    if (context.financialHealth.factors.emergencyFund === 'poor' || context.financialHealth.factors.emergencyFund === 'fair') {
      recommendations.push(`**🛡️ Build Emergency Fund**: Your cash buffers are low. Target 3-6 months of living expenses ($${(context.cashFlow.monthlyExpenses * 3).toFixed(0)}) in a liquid savings account.`);
    }

    if (recommendations.length === 0) {
      recommendations.push(`**🌟 Maintain Course**: You are hitting all core financial benchmarks. Consider increasing your investment contributions or setting a new ambitious financial goal!`);
    }

    const content = `### 💡 Proactive Recommendations\n\n${recommendations.map(r => `- ${r}`).join('\n\n')}`;

    return {
      content: content.trim(),
      confidence: 0.92,
      sources: ['Financial Context Engine -> Rule Engine'],
    };
  }
}
