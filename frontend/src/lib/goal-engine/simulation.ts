import { GoalModel, ScenarioModifiers, PredictionMetrics, ScenarioPoint, GoalRecommendation, GoalEngineResult } from './types';
import { calculateFutureValue, calculateInflationAdjustedTarget, calculateRequiredMonthlySavings, calculateMonthsToTarget } from './calculators';
import { differenceInMonths, parseISO, addMonths, format } from 'date-fns';

export function runGoalSimulation(goal: GoalModel, modifiers?: ScenarioModifiers): GoalEngineResult {
  // Apply Modifiers
  const monthlyContribution = Math.max(0, goal.monthlyContribution + (modifiers?.monthlyContributionAdjustment || 0) + (modifiers?.salaryIncrease || 0));
  const currentAmount = Math.max(0, goal.currentAmount - (modifiers?.medicalExpense || 0));
  const expectedReturnRate = goal.expectedReturnRate + (modifiers?.returnRateAdjustment || 0);
  const inflationRate = goal.inflationRate + (modifiers?.inflationAdjustment || 0);

  const now = new Date();
  const deadline = parseISO(goal.deadline);
  const monthsRemaining = Math.max(0, differenceInMonths(deadline, now));

  // 1. Inflation Adjusted Target
  const adjustedTarget = calculateInflationAdjustedTarget(goal.targetAmount, inflationRate, monthsRemaining);

  // 2. Predict Completion Timeline
  const monthsToTarget = calculateMonthsToTarget(adjustedTarget, currentAmount, monthlyContribution, expectedReturnRate);
  
  let projectedDate: string | null = null;
  if (monthsToTarget !== Infinity && monthsToTarget >= 0) {
    projectedDate = addMonths(now, Math.ceil(monthsToTarget)).toISOString();
  }

  // 3. Required Monthly Savings (to hit strict deadline)
  const requiredMonthlySavings = calculateRequiredMonthlySavings(adjustedTarget, currentAmount, expectedReturnRate, monthsRemaining);

  // 4. Generate Timeline Points for Chart (Forecast over `monthsRemaining` + buffer)
  const timeline: ScenarioPoint[] = [];
  const chartMonths = Math.max(monthsRemaining, Math.min(120, monthsToTarget === Infinity ? monthsRemaining + 24 : Math.ceil(monthsToTarget) + 12));
  
  for (let i = 0; i <= chartMonths; i++) {
    const pointDate = addMonths(now, i);
    
    // Expected Case
    const expectedValue = calculateFutureValue(currentAmount, monthlyContribution, expectedReturnRate, i);
    
    // Best Case (+2% return, +10% contribution)
    const bestCaseValue = calculateFutureValue(currentAmount, monthlyContribution * 1.1, expectedReturnRate + 0.02, i);
    
    // Worst Case (-2% return, -10% contribution)
    const worstCaseValue = calculateFutureValue(currentAmount, monthlyContribution * 0.9, Math.max(0, expectedReturnRate - 0.02), i);

    timeline.push({
      month: i,
      date: format(pointDate, 'MMM yyyy'),
      expectedValue,
      bestCaseValue,
      worstCaseValue,
      inflationAdjustedTarget: calculateInflationAdjustedTarget(goal.targetAmount, inflationRate, i)
    });
  }

  // 5. Success Probability Heuristic
  let successProbability = 0;
  if (currentAmount >= adjustedTarget) {
    successProbability = 100;
  } else if (monthsRemaining > 0 && monthsToTarget !== Infinity) {
    // Ratio of how fast we are going vs how fast we need to go
    const velocityRatio = monthlyContribution / (requiredMonthlySavings || 1); 
    successProbability = Math.min(100, Math.max(0, velocityRatio * 90)); // cap at 90% until fully achieved
  }

  // 6. Metrics
  const currentProgressPercent = Math.min(100, (currentAmount / adjustedTarget) * 100);
  const remainingAmount = Math.max(0, adjustedTarget - currentAmount);
  const impactOfInflation = adjustedTarget - goal.targetAmount;
  const expectedFinalValue = calculateFutureValue(currentAmount, monthlyContribution, expectedReturnRate, monthsRemaining);
  const compoundGrowthTotal = expectedFinalValue - (currentAmount + (monthlyContribution * monthsRemaining));

  let riskLevel: 'low' | 'medium' | 'high' = 'high';
  if (successProbability >= 80) riskLevel = 'low';
  else if (successProbability >= 50) riskLevel = 'medium';

  const metrics: PredictionMetrics = {
    currentProgressPercent,
    remainingAmount,
    requiredMonthlySavings,
    projectedCompletionDate: projectedDate,
    successProbability,
    impactOfInflation,
    compoundGrowthTotal,
    riskLevel,
    confidenceScore: 0.85,
  };

  // 7. AI Recommendations
  const recommendations: GoalRecommendation[] = [];
  
  if (successProbability < 50) {
    const deficit = requiredMonthlySavings - monthlyContribution;
    if (deficit > 0) {
      recommendations.push({
        priority: 'critical',
        confidence: 0.9,
        estimatedFinancialImpact: deficit,
        reason: 'You are significantly off track for your deadline.',
        actionPlan: `Increase monthly savings by $${deficit.toFixed(0)} to reach your goal on time.`
      });
    }
  }

  if (expectedReturnRate < 0.02 && monthsRemaining > 36) {
    recommendations.push({
      priority: 'high',
      confidence: 0.85,
      estimatedFinancialImpact: (bestCaseValue - expectedValue),
      reason: 'Your time horizon is long enough to accept market risk, but your expected return is very low (likely sitting in cash).',
      actionPlan: `Consider investing this idle cash into index funds. It could reduce your timeline substantially.`
    });
  }

  if (impactOfInflation > (goal.targetAmount * 0.1)) {
    recommendations.push({
      priority: 'medium',
      confidence: 0.95,
      estimatedFinancialImpact: impactOfInflation,
      reason: `Inflation is eroding your purchasing power over this long timeline.`,
      actionPlan: `Ensure your investments are outpacing the ${inflationRate * 100}% inflation rate.`
    });
  }

  return {
    goal,
    metrics,
    timeline,
    recommendations
  };
}
