import { AgentRequest, AgentResponse, BaseAgent } from '../types';
import { formatCurrency } from '@/lib/format';

export class SpendingIntelligenceAgent implements BaseAgent {
  async analyze(request: AgentRequest): Promise<AgentResponse> {
    const { context } = request;
    const { spendingSummary, cashFlow } = context;

    if (!spendingSummary || spendingSummary.length === 0) {
      return {
        content: "I don't have enough transaction data to analyze your spending behavior yet.",
        confidence: 0.1,
        sources: []
      };
    }

    const topCategory = spendingSummary[0];
    const secondCategory = spendingSummary.length > 1 ? spendingSummary[1] : null;

    let content = `### 💳 Spending Intelligence Analysis\n\n`;
    content += `Your total monthly expenses are **${formatCurrency(cashFlow.monthlyExpenses)}**.\n\n`;
    
    content += `#### 📊 Top Spending Categories\n`;
    content += `- **${topCategory.category}:** ${formatCurrency(topCategory.amount)} (${topCategory.percentage.toFixed(1)}% of expenses)\n`;
    
    if (secondCategory) {
      content += `- **${secondCategory.category}:** ${formatCurrency(secondCategory.amount)} (${secondCategory.percentage.toFixed(1)}% of expenses)\n`;
    }

    // Lifestyle Inflation / Anomaly detection (Deterministic mocked logic based on data)
    let anomalyDetected = false;
    if (topCategory.category === 'Dining' && topCategory.percentage > 30) {
      anomalyDetected = true;
      content += `\n> ⚠️ **Insight**: Dining accounts for a significant portion (${topCategory.percentage.toFixed(1)}%) of your discretionary spending. Reducing this could drastically improve your ${cashFlow.savingsRate.toFixed(1)}% savings rate.\n`;
    }
    
    if (topCategory.category === 'Food' && topCategory.percentage > 25) {
      anomalyDetected = true;
      content += `\n> 💡 **Insight**: Food expenses are quite high. Consider meal prepping or analyzing your grocery vs. takeout ratio.\n`;
    }

    if (!anomalyDetected) {
      content += `\n> ✅ **Insight**: Your spending appears well-distributed without major concentration risks in discretionary categories.\n`;
    }

    // Subscription detection logic (mock simulation based on recurring flags in transactions)
    const recurringCount = context.recentTransactions.filter(t => t.amount < 0 && t.isRecurring).length;
    if (recurringCount > 0) {
      content += `\n#### 🔄 Recurring & Subscriptions\n`;
      content += `I detected **${recurringCount} recurring transactions** recently. It's good practice to audit these monthly to prevent subscription creep.\n`;
    }

    return {
      content: content.trim(),
      confidence: 0.90,
      sources: ['Financial Context Engine -> Transactions, Spending Summary'],
    };
  }
}
