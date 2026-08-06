import { Transaction, Insight } from './types';



export function generateInsights(transactions: Transaction[]): Insight[] {
  const insights: Insight[] = [];
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Filter out positive amounts (income) and keep expenses for spending analysis
  const expenses = transactions.filter(t => t.amount < 0);
  
  // 1. Analyze Spending Trends (Current vs Previous Month)
  const currentMonthExpenses = expenses.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  
  const previousMonthExpenses = expenses.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === prevMonth && d.getFullYear() === prevMonthYear;
  });

  // Aggregate by category
  const currentCategoryTotals: Record<string, number> = {};
  currentMonthExpenses.forEach(t => {
    currentCategoryTotals[t.category] = (currentCategoryTotals[t.category] || 0) + Math.abs(t.amount);
  });

  const previousCategoryTotals: Record<string, number> = {};
  previousMonthExpenses.forEach(t => {
    previousCategoryTotals[t.category] = (previousCategoryTotals[t.category] || 0) + Math.abs(t.amount);
  });

  // Check for significant spikes in spending
  for (const category in currentCategoryTotals) {
    if (category === "Rent" || category === "Subscriptions" || category === "Utilities") continue;
    
    const current = currentCategoryTotals[category];
    const previous = previousCategoryTotals[category] || 0;
    
    if (previous > 0) {
      const increase = (current - previous) / previous;
      if (increase > 0.15) { // 15% increase threshold
        insights.push({
          id: `trend-${category}-${Date.now()}`,
          title: `${category} Spending Increased`,
          description: `You spent ${(increase * 100).toFixed(0)}% more on ${category.toLowerCase()} this month compared to last month.`,
          severity: increase > 0.3 ? "high" : "medium",
          category: category,
          confidenceScore: 92,
          financialImpact: `Estimated additional annual expense of ₹${((current - previous) * 12).toLocaleString("en-IN")} if this trend continues.`,
          reasoning: `You spent ₹${current.toLocaleString("en-IN")} this month compared to ₹${previous.toLocaleString("en-IN")} last month.`,
          suggestedAction: `Reduce ${category.toLowerCase()} spending by ₹${(current - previous).toLocaleString("en-IN")} per month to return to your target budget.`,
          relatedTransactions: currentMonthExpenses.filter(t => t.category === category).map(t => t.id.toString()),
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  // 2. Subscription Price Detection
  const currentSubs = currentMonthExpenses.filter(t => t.category === "Subscriptions");
  const previousSubs = previousMonthExpenses.filter(t => t.category === "Subscriptions");

  // simplified subscription check
  const currentSubTotal = currentSubs.reduce((acc, t) => acc + Math.abs(t.amount), 0);
  const previousSubTotal = previousSubs.reduce((acc, t) => acc + Math.abs(t.amount), 0);

  if (currentSubTotal > previousSubTotal) {
    const diff = currentSubTotal - previousSubTotal;
    insights.push({
      id: `subs-${Date.now()}`,
      title: `Subscription Cost Increased`,
      description: `Your subscription costs increased by ₹${diff} this month.`,
      severity: "medium",
      category: "Subscriptions",
      confidenceScore: 98,
      financialImpact: `Annual impact of ₹${(diff * 12).toLocaleString("en-IN")}.`,
      reasoning: `Total subscription spend was ₹${previousSubTotal} last month, but is ₹${currentSubTotal} this month.`,
      suggestedAction: `Review your active subscriptions and cancel any services you no longer use.`,
      timestamp: new Date().toISOString()
    });
  }

  // 3. Cash Flow Analysis
  const currentIncome = transactions
    .filter(t => t.amount > 0 && new Date(t.date).getMonth() === currentMonth)
    .reduce((acc, t) => acc + t.amount, 0);
    
  const currentTotalExpenses = currentMonthExpenses.reduce((acc, t) => acc + Math.abs(t.amount), 0);
  
  if (currentIncome > 0 && currentTotalExpenses > 0) {
    const savingsRate = ((currentIncome - currentTotalExpenses) / currentIncome) * 100;
    
    if (savingsRate > 20) {
      insights.push({
        id: `savings-${Date.now()}`,
        title: `Healthy Savings Rate`,
        description: `You are saving ${savingsRate.toFixed(1)}% of your income this month.`,
        severity: "low", // success wasn't in the options provided for severity, we can use "low" or maybe standard info. Wait, requirement says (Low, Medium, High, Critical). "low" is a good substitute for positive/neutral. Let's make it look distinct in the UI.
        category: "Savings",
        confidenceScore: 95,
        financialImpact: `Positive cash flow of ₹${(currentIncome - currentTotalExpenses).toLocaleString("en-IN")} this month.`,
        reasoning: `Your income is ₹${currentIncome.toLocaleString("en-IN")} and expenses are ₹${currentTotalExpenses.toLocaleString("en-IN")}.`,
        suggestedAction: `Consider investing the surplus cash into a diversified index fund.`,
        timestamp: new Date().toISOString()
      });
    } else if (savingsRate < 5) {
      insights.push({
        id: `savings-low-${Date.now()}`,
        title: `Low Savings Rate`,
        description: `You are saving less than 5% of your income this month.`,
        severity: "critical",
        category: "Savings",
        confidenceScore: 90,
        financialImpact: `Limited capacity to handle emergencies or invest for the future.`,
        reasoning: `High expenses of ₹${currentTotalExpenses.toLocaleString("en-IN")} against an income of ₹${currentIncome.toLocaleString("en-IN")}.`,
        suggestedAction: `Identify discretionary expenses and cut back by at least 10% next month.`,
        timestamp: new Date().toISOString()
      });
    }
  }

  // 4. Weekend Spending Analysis (mocked simulation)
  const weekendDiscretionary = currentMonthExpenses.filter(t => {
    const day = new Date(t.date).getDay();
    return (day === 0 || day === 6) && (t.category === "Dining" || t.category === "Entertainment" || t.category === "Shopping");
  }).reduce((acc, t) => acc + Math.abs(t.amount), 0);

  const totalDiscretionary = currentMonthExpenses.filter(t => 
    t.category === "Dining" || t.category === "Entertainment" || t.category === "Shopping"
  ).reduce((acc, t) => acc + Math.abs(t.amount), 0);

  if (totalDiscretionary > 0) {
    const weekendPercentage = (weekendDiscretionary / totalDiscretionary) * 100;
    if (weekendPercentage > 40) {
      insights.push({
        id: `weekend-${Date.now()}`,
        title: `High Weekend Spending`,
        description: `Weekend spending accounts for ${weekendPercentage.toFixed(0)}% of discretionary expenses.`,
        severity: "low",
        category: "Habits",
        confidenceScore: 85,
        financialImpact: `Reducing weekend splurges by 20% could save you ₹${(weekendDiscretionary * 0.2).toLocaleString("en-IN")} monthly.`,
        reasoning: `You spent ₹${weekendDiscretionary.toLocaleString("en-IN")} out of ₹${totalDiscretionary.toLocaleString("en-IN")} discretionary budget on weekends.`,
        suggestedAction: `Plan affordable weekend activities or set a strict weekend spending limit.`,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Fallback insight if no anomalies detected
  if (insights.length === 0) {
    insights.push({
      id: `stable-${Date.now()}`,
      title: `Finances are Stable`,
      description: `Your spending patterns are consistent with the previous month.`,
      severity: "low",
      category: "Overview",
      confidenceScore: 99,
      financialImpact: `On track with historical trends.`,
      reasoning: `No significant deviations detected across your expense categories.`,
      suggestedAction: `Continue monitoring your budget and stick to your financial goals.`,
      timestamp: new Date().toISOString()
    });
  }

  return insights;
}
