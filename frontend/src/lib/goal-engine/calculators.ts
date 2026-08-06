/**
 * Financial Calculators for the Goal Prediction Engine
 */

export function calculateFutureValue(
  presentValue: number,
  monthlyContribution: number,
  annualRate: number,
  months: number
): number {
  if (annualRate === 0) {
    return presentValue + (monthlyContribution * months);
  }
  
  const monthlyRate = annualRate / 12;
  
  // Compound interest on principal
  const pvCompound = presentValue * Math.pow(1 + monthlyRate, months);
  
  // Future value of a series of monthly contributions
  const fvContributions = monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
  
  return pvCompound + fvContributions;
}

export function calculateInflationAdjustedTarget(
  currentTarget: number,
  annualInflationRate: number,
  monthsToTarget: number
): number {
  if (annualInflationRate === 0 || monthsToTarget <= 0) return currentTarget;
  
  const years = monthsToTarget / 12;
  return currentTarget * Math.pow(1 + annualInflationRate, years);
}

export function calculateRequiredMonthlySavings(
  targetAmount: number,
  currentAmount: number,
  annualRate: number,
  months: number
): number {
  if (months <= 0) return targetAmount > currentAmount ? targetAmount - currentAmount : 0;
  if (targetAmount <= currentAmount) return 0;
  
  if (annualRate === 0) {
    return (targetAmount - currentAmount) / months;
  }
  
  const monthlyRate = annualRate / 12;
  const pvCompound = currentAmount * Math.pow(1 + monthlyRate, months);
  
  const remainingTarget = targetAmount - pvCompound;
  
  // Reverse FV formula to solve for PMT
  if (remainingTarget <= 0) return 0;
  
  const pmt = (remainingTarget * monthlyRate) / (Math.pow(1 + monthlyRate, months) - 1);
  return pmt;
}

export function calculateMonthsToTarget(
  targetAmount: number,
  currentAmount: number,
  monthlyContribution: number,
  annualRate: number
): number {
  if (currentAmount >= targetAmount) return 0;
  if (monthlyContribution <= 0 && annualRate <= 0) return Infinity; // Impossible
  
  if (annualRate === 0) {
    return (targetAmount - currentAmount) / monthlyContribution;
  }
  
  const monthlyRate = annualRate / 12;
  
  // Solved formula for nper: log( (PMT - FV*r) / (PMT + PV*r) ) / log(1+r)
  // Wait, standard NPER formula in JS:
  const pmt = monthlyContribution;
  const pv = currentAmount;
  const fv = -targetAmount; // FV is cash outflow from perspective of account
  
  // If growth on principal alone exceeds target, it will eventually hit it without contributions
  if (pmt === 0 && (pv * monthlyRate) <= 0) return Infinity;
  
  const dividend = pmt - (fv * monthlyRate);
  const divisor = pmt + (pv * monthlyRate);
  
  if (dividend / divisor <= 0) return Infinity; // Will never reach
  
  const months = Math.log(dividend / divisor) / Math.log(1 + monthlyRate);
  return months;
}
