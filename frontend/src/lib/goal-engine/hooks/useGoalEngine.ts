import { useState, useMemo } from 'react';
import { GoalModel, ScenarioModifiers, GoalEngineResult } from '../types';
import { runGoalSimulation } from '../simulation';

export function useGoalEngine(initialGoal: GoalModel) {
  const [goal, setGoal] = useState<GoalModel>(initialGoal);
  
  const [modifiers, setModifiers] = useState<ScenarioModifiers>({
    monthlyContributionAdjustment: 0,
    salaryIncrease: 0,
    medicalExpense: 0,
    inflationAdjustment: 0,
    returnRateAdjustment: 0,
  });

  // Automatically recalculate all metrics whenever the goal or scenario modifiers change
  const engineResult: GoalEngineResult = useMemo(() => {
    return runGoalSimulation(goal, modifiers);
  }, [goal, modifiers]);

  const updateModifier = (key: keyof ScenarioModifiers, value: number) => {
    setModifiers(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetModifiers = () => {
    setModifiers({
      monthlyContributionAdjustment: 0,
      salaryIncrease: 0,
      medicalExpense: 0,
      inflationAdjustment: 0,
      returnRateAdjustment: 0,
    });
  };

  const updateGoal = (updatedFields: Partial<GoalModel>) => {
    setGoal(prev => ({
      ...prev,
      ...updatedFields
    }));
  };

  return {
    goal,
    modifiers,
    result: engineResult,
    updateModifier,
    resetModifiers,
    updateGoal
  };
}
