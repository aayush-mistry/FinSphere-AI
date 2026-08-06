import { AgentRequest, AgentResponse, BaseAgent } from '../types';
import { formatCurrency } from '@/lib/format';

export class FinancialAdvisorAgent implements BaseAgent {
  async analyze(request: AgentRequest): Promise<AgentResponse> {
    const { context } = request;
    
    // Determine macro strengths and weaknesses
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    
    if (context.cashFlow.savingsRate >= 20) {
      strengths.push("Excellent savings rate (>20%)");
    } else if (context.cashFlow.savingsRate < 5) {
      weaknesses.push("Critically low savings rate");
    }

    if (context.financialHealth.factors.emergencyFund === 'excellent') {
      strengths.push("Strong emergency fund buffering");
    } else if (context.financialHealth.factors.emergencyFund === 'poor') {
      weaknesses.push("Insufficient emergency reserves");
    }

    if (context.financialHealth.factors.debtToIncome === 'excellent') {
      strengths.push("Healthy debt-to-income ratio");
    } else if (context.financialHealth.factors.debtToIncome === 'poor') {
      weaknesses.push("High debt burden relative to income");
    }

    if (strengths.length === 0) strengths.push("Consistent income tracking");
    if (weaknesses.length === 0) weaknesses.push("None identified currently");

    const content = `
### 📊 Executive Financial Summary
**Overall Health Score:** ${context.financialHealth.score}/100

Your overall financial profile indicates a **${context.financialHealth.score > 70 ? 'stable' : 'vulnerable'}** position. 
You currently hold **${formatCurrency(context.netWorth)}** in net worth, driven by ${formatCurrency(context.totalAssets)} in assets and ${formatCurrency(context.totalLiabilities)} in liabilities.

#### 📈 Cash Flow Analysis
- **Monthly Income:** ${formatCurrency(context.cashFlow.monthlyIncome)}
- **Monthly Expenses:** ${formatCurrency(context.cashFlow.monthlyExpenses)}
- **Net Cash Flow:** ${formatCurrency(context.cashFlow.netCashFlow)}
- **Savings Rate:** ${context.cashFlow.savingsRate.toFixed(1)}%

#### ⚡ Profile Strengths & Weaknesses
**Strengths:**
${strengths.map(s => `- ✅ ${s}`).join('\n')}

**Weaknesses:**
${weaknesses.map(w => `- ⚠️ ${w}`).join('\n')}

*This analysis is based on your current accounts and transaction history.*
`;

    return {
      content: content.trim(),
      confidence: 0.95,
      sources: ['Financial Context Engine -> Accounts, Transactions, Health Score'],
    };
  }
}
