import { Bill, CreateBillPayload, UpdateBillPayload, BillStatus, RecurringSummaryResponse, UpcomingBillOccurrence, UpcomingBillsSummaryResponse } from '../types';

export const BillsClientAPI = {
  async getBills(userId: number, filters?: { status?: BillStatus, category?: string, frequency?: string }): Promise<Bill[]> {
    const params = new URLSearchParams();
    params.append('user_id', userId.toString());
    
    if (filters?.status) params.append('status', filters.status);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.frequency) params.append('frequency', filters.frequency);

    const res = await fetch(`/api/bills?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch bills');
    return res.json();
  },

  async getBill(billId: number, userId: number): Promise<Bill> {
    const res = await fetch(`/api/bills/${billId}?user_id=${userId}`);
    if (!res.ok) throw new Error('Failed to fetch bill detail');
    return res.json();
  },

  async createBill(userId: number, data: CreateBillPayload): Promise<Bill> {
    const res = await fetch(`/api/bills`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ...data, user_id: userId })
    });
    if (!res.ok) throw new Error('Failed to create bill');
    return res.json();
  },

  async updateBill(billId: number, userId: number, data: UpdateBillPayload): Promise<Bill> {
    const res = await fetch(`/api/bills/${billId}?user_id=${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update bill');
    return res.json();
  },

  async updateBillStatus(billId: number, userId: number, status: BillStatus): Promise<Bill> {
    const res = await fetch(`/api/bills/${billId}/status?user_id=${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update bill status');
    return res.json();
  },

  async deleteBill(billId: number, userId: number): Promise<void> {
    const res = await fetch(`/api/bills/${billId}?user_id=${userId}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete bill');
  },

  async getRecurringExpenseSummary(userId: number): Promise<RecurringSummaryResponse> {
    const res = await fetch(`/api/bills/recurring-summary?user_id=${userId}`);
    if (!res.ok) throw new Error('Failed to fetch recurring expense summary');
    return res.json();
  },

  async getUpcomingBills(userId: number, days: number = 30): Promise<UpcomingBillOccurrence[]> {
    const res = await fetch(`http://localhost:8000/api/bills/upcoming?user_id=${userId}&days=${days}`);
    if (!res.ok) throw new Error('Failed to fetch upcoming bills');
    return res.json();
  },

  async getUpcomingBillsSummary(userId: number, days: number = 30): Promise<UpcomingBillsSummaryResponse> {
    const res = await fetch(`http://localhost:8000/api/bills/upcoming-summary?user_id=${userId}&days=${days}`);
    if (!res.ok) throw new Error('Failed to fetch upcoming bills summary');
    return res.json();
  }
};
