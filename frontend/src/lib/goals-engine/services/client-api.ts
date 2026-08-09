import { GoalPredictionSummaryOut, GoalComparisonItem, GoalSummaryOut, GoalOut, GoalDetailOut, GoalContributionOut, GoalProjectionOut, GoalSimulationScenario, GoalSimulationOut } from '../types';

export const GoalsClientAPI = {
  async getSummary(userId: number): Promise<GoalSummaryOut> {
    const res = await fetch(`/api/goals/summary?user_id=${userId}`);
    if (!res.ok) throw new Error('Failed to fetch goals summary');
    return res.json();
  },

  async getPredictionSummary(userId: number): Promise<GoalPredictionSummaryOut> {
    const res = await fetch(`/api/goals/predictions/summary?user_id=${userId}`);
    if (!res.ok) throw new Error('Failed to fetch prediction summary');
    return res.json();
  },

  async getPredictionComparison(userId: number): Promise<GoalComparisonItem[]> {
    const res = await fetch(`/api/goals/predictions/compare?user_id=${userId}`);
    if (!res.ok) throw new Error('Failed to fetch goal comparison');
    return res.json();
  },
  
  async getGoals(userId: number): Promise<GoalOut[]> {
    const res = await fetch(`/api/goals?user_id=${userId}`);
    if (!res.ok) throw new Error('Failed to fetch goals');
    return res.json();
  },

  async getGoalDetail(goalId: number, userId: number): Promise<GoalDetailOut> {
    const res = await fetch(`/api/goals/detail?goal_id=${goalId}&user_id=${userId}`);
    if (!res.ok) throw new Error('Failed to fetch goal detail');
    return res.json();
  },

  async getGoalContributions(goalId: number, userId: number): Promise<GoalContributionOut[]> {
    const res = await fetch(`/api/goals/${goalId}/contributions?user_id=${userId}`);
    if (!res.ok) throw new Error('Failed to fetch goal contributions');
    return res.json();
  },

  async getGoalProjection(goalId: number, userId: number): Promise<GoalProjectionOut> {
    const res = await fetch(`/api/goals/${goalId}/projection?user_id=${userId}`);
    if (!res.ok) throw new Error('Failed to fetch goal projection');
    return res.json();
  },

  async simulateGoalProjection(goalId: number, userId: number, scenario: GoalSimulationScenario): Promise<GoalSimulationOut> {
    const res = await fetch(`/api/goals/${goalId}/simulate?user_id=${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(scenario)
    });
    if (!res.ok) throw new Error('Failed to simulate goal projection');
    return res.json();
  }
};


