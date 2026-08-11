import {
  CashFlowSummary,
  CashFlowTrend,
  CashFlowRecent,
  CashFlowReconciliation,
  CashFlowAllocation,
  CashFlowInsights,
  CashFlowComparison,
  CashFlowProjection
} from '../types';

export const CashFlowClientAPI = {
  async getSummary(params: {
    start_date: string;
    end_date: string;
    account?: string;
  }): Promise<CashFlowSummary> {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    const res = await fetch(`/api/cashflow/summary?${query}`);
    if (!res.ok) throw new Error('Failed to fetch cash flow summary');
    return res.json();
  },

  async getTrends(params: {
    start_date: string;
    end_date: string;
    period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  }): Promise<CashFlowTrend> {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    const res = await fetch(`/api/cashflow/trends?${query}`);
    if (!res.ok) throw new Error('Failed to fetch cash flow trends');
    return res.json();
  },

  async getReconciliation(params: {
    start_date: string;
    end_date: string;
    account?: string;
  }): Promise<CashFlowReconciliation> {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    const res = await fetch(`/api/cashflow/reconciliation?${query}`);
    if (!res.ok) throw new Error('Failed to fetch cash flow reconciliation');
    return res.json();
  },

  async getAllocation(params: {
    start_date: string;
    end_date: string;
    account?: string;
  }): Promise<CashFlowAllocation> {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    const res = await fetch(`/api/cashflow/allocation?${query}`);
    if (!res.ok) throw new Error('Failed to fetch cash flow allocation');
    return res.json();
  },

  async getComparison(params: {
    start_date: string;
    end_date: string;
  }): Promise<CashFlowComparison[]> {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    const res = await fetch(`/api/cashflow/comparison?${query}`);
    if (!res.ok) throw new Error('Failed to fetch cash flow comparison');
    return res.json();
  },

  async getInsights(params: {
    start_date: string;
    end_date: string;
    account?: string;
  }): Promise<CashFlowInsights> {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    const res = await fetch(`/api/cashflow/insights?${query}`);
    if (!res.ok) throw new Error('Failed to fetch cash flow insights');
    return res.json();
  },

  async getRecent(params: {
    limit?: number;
    account?: string;
  }): Promise<CashFlowRecent> {
    const query = new URLSearchParams();
    if (params.limit) query.set('limit', params.limit.toString());
    if (params.account) query.set('account', params.account);
    const res = await fetch(`/api/cashflow/recent?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch recent cash movements');
    return res.json();
  },

  async getCashFlowProjection(userId: number, days: number = 30): Promise<CashFlowProjection> {
    const res = await fetch(`/api/cashflow/projection?user_id=${userId}&days=${days}`);
    if (!res.ok) throw new Error('Failed to fetch cash flow projection');
    return res.json();
  }
};
