import { AgentRequest, AgentResponse, BaseAgent } from '../types';
import { formatCurrency } from '@/lib/format';

export class GoalPlanningAgent implements BaseAgent {
  async analyze(request: AgentRequest): Promise<AgentResponse> {
    const { context, query } = request;
    const { goals, cashFlow } = context;

    if (!goals || goals.length === 0) {
      return {
        content: "You currently don't have any active financial goals set. Would you like me to help you create an Emergency Fund or Retirement goal?",
        confidence: 0.95,
        sources: ['Financial Context Engine -> Goals']
      };
    }

    let content = `### 🎯 Goal Planning Analysis\n\n`;
    
    // Check if query is about a specific goal (e.g. "house", "car")
    const queryLower = query.toLowerCase();
    const specificGoal = goals.find(g => queryLower.includes(g.category.toLowerCase()) || queryLower.includes(g.name.toLowerCase()));

    const goalsToAnalyze = specificGoal ? [specificGoal] : goals;

    goalsToAnalyze.forEach(goal => {
      const remaining = goal.targetAmount - goal.currentAmount;
      const progressPercent = (goal.currentAmount / goal.targetAmount) * 100;
      
      content += `#### **${goal.name}**\n`;
      content += `- **Target:** ${formatCurrency(goal.targetAmount)}\n`;
      content += `- **Current:** ${formatCurrency(goal.currentAmount)} (${progressPercent.toFixed(1)}%)\n`;
      
      if (remaining <= 0) {
        content += `> 🎉 **Congratulations!** You have reached this goal.\n\n`;
      } else {
        // Deterministic projection based on net cash flow (assuming 50% of net cash flow is put towards goals)
        const monthlyAllocation = cashFlow.netCashFlow > 0 ? cashFlow.netCashFlow * 0.5 : 0;
        
        if (monthlyAllocation > 0) {
          const monthsToCompletion = remaining / (monthlyAllocation / goals.length); // rough split
          const estimatedDate = new Date();
          estimatedDate.setMonth(estimatedDate.getMonth() + Math.ceil(monthsToCompletion));
          
          content += `> 📅 **Projection:** At your current savings rate, allocating a portion of your positive cash flow, you are on track to reach this by **${estimatedDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}**.\n\n`;
        } else {
          content += `> ⚠️ **Warning:** Your current net cash flow is zero or negative. You need to reduce expenses or increase income to make progress on this goal.\n\n`;
        }
      }
    });

    return {
      content: content.trim(),
      confidence: 0.85,
      sources: ['Financial Context Engine -> Goals, Cash Flow'],
    };
  }
}
