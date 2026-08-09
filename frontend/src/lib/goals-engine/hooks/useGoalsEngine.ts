import { useQuery } from '@tanstack/react-query';
import { GoalsClientAPI } from '../services/client-api';
import { GoalDetailOut } from '../types';

const DEFAULT_USER_ID = 1;

export const useGoalsSummary = (userId: number = DEFAULT_USER_ID) => {
  return useQuery({
    queryKey: ['goals-summary', userId],
    queryFn: () => GoalsClientAPI.getSummary(userId)
  });
};

export const useGoalPredictionSummary = (userId: number = DEFAULT_USER_ID) => {
  return useQuery({
    queryKey: ['goals-prediction-summary', userId],
    queryFn: () => GoalsClientAPI.getPredictionSummary(userId)
  });
};

export const useGoalComparison = (userId: number = DEFAULT_USER_ID) => {
  return useQuery({
    queryKey: ['goals-comparison', userId],
    queryFn: () => GoalsClientAPI.getPredictionComparison(userId)
  });
};

export const useGoalsList = (userId: number = DEFAULT_USER_ID) => {
  return useQuery({
    queryKey: ['goals-list', userId],
    queryFn: () => GoalsClientAPI.getGoals(userId)
  });
};

export const useGoalsDetailedList = (userId: number = DEFAULT_USER_ID) => {
  return useQuery({
    queryKey: ['goals-detailed-list', userId],
    queryFn: async () => {
      // First get the list of goals
      const goals = await GoalsClientAPI.getGoals(userId);
      // Then fetch details for each goal to get calculated properties like required_monthly_contribution
      const detailedGoals = await Promise.all(
        goals.map(g => GoalsClientAPI.getGoalDetail(g.id, userId))
      );
      return detailedGoals;
    }
  });
};
