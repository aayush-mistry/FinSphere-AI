import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GoalsClientAPI } from '../services/client-api';
import { GoalDetailOut, GoalSimulationScenario, GoalOut } from '../types';

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
      const goals = await GoalsClientAPI.getGoals(userId);
      const detailedGoals = await Promise.all(
        goals.map(g => GoalsClientAPI.getGoalDetail(g.id, userId))
      );
      return detailedGoals;
    }
  });
};

export const useGoalIntelligence = (goalId: number, userId: number = DEFAULT_USER_ID) => {
  return useQuery({
    queryKey: ['goal-intelligence', goalId, userId],
    queryFn: async () => {
      // Fetch detail, projection, and contributions sequentially or in parallel
      const [detail, projection, contributions] = await Promise.all([
        GoalsClientAPI.getGoalDetail(goalId, userId),
        GoalsClientAPI.getGoalProjection(goalId, userId),
        GoalsClientAPI.getGoalContributions(goalId, userId)
      ]);
      
      return {
        detail,
        projection,
        contributions
      };
    },
    enabled: !!goalId
  });
};

export const useSimulateGoal = (goalId: number, userId: number = DEFAULT_USER_ID) => {
  return useMutation({
    mutationFn: (scenario: GoalSimulationScenario) => 
      GoalsClientAPI.simulateGoalProjection(goalId, userId, scenario)
  });
};

export const useCreateGoal = (userId: number = DEFAULT_USER_ID) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<GoalOut>) => GoalsClientAPI.createGoal(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals-summary'] });
      queryClient.invalidateQueries({ queryKey: ['goals-prediction-summary'] });
      queryClient.invalidateQueries({ queryKey: ['goals-comparison'] });
      queryClient.invalidateQueries({ queryKey: ['goals-list'] });
      queryClient.invalidateQueries({ queryKey: ['goals-detailed-list'] });
    }
  });
};

export const useUpdateGoal = (userId: number = DEFAULT_USER_ID) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ goalId, data }: { goalId: number; data: Partial<GoalOut> }) => 
      GoalsClientAPI.updateGoal(goalId, userId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['goals-summary'] });
      queryClient.invalidateQueries({ queryKey: ['goals-prediction-summary'] });
      queryClient.invalidateQueries({ queryKey: ['goals-comparison'] });
      queryClient.invalidateQueries({ queryKey: ['goals-list'] });
      queryClient.invalidateQueries({ queryKey: ['goals-detailed-list'] });
      queryClient.invalidateQueries({ queryKey: ['goal-intelligence', variables.goalId] });
    }
  });
};

export const useArchiveGoal = (userId: number = DEFAULT_USER_ID) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (goalId: number) => GoalsClientAPI.archiveGoal(goalId, userId),
    onSuccess: (_, goalId) => {
      queryClient.invalidateQueries({ queryKey: ['goals-summary'] });
      queryClient.invalidateQueries({ queryKey: ['goals-prediction-summary'] });
      queryClient.invalidateQueries({ queryKey: ['goals-comparison'] });
      queryClient.invalidateQueries({ queryKey: ['goals-list'] });
      queryClient.invalidateQueries({ queryKey: ['goals-detailed-list'] });
      queryClient.invalidateQueries({ queryKey: ['goal-intelligence', goalId] });
    }
  });
};
