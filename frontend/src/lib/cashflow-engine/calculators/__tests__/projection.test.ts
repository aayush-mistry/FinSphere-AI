import { calculateCashFlowProjection } from '../projection';
import { UpcomingBillOccurrence } from '../../../../bills-engine/types';

describe('calculateCashFlowProjection', () => {
  const refDate = '2026-08-11';
  
  it('Test 1: Bills only projection', () => {
    const upcomingBills: UpcomingBillOccurrence[] = [{
      bill_id: 1, bill_name: 'Rent', category: 'Housing', amount: 20000, currency: 'INR',
      due_date: '2026-08-15', frequency: 'Monthly', account_id: null, account_name: null,
      auto_pay: false, days_until_due: 4, status: 'Upcoming'
    }];
    
    const res = calculateCashFlowProjection(100000, 0, 0, upcomingBills, 30, refDate, false);
    
    expect(res.starting_cash).toBe(100000);
    expect(res.projected_bills).toBe(20000);
    expect(res.ending_cash).toBe(80000);
  });

  it('Test 2: Income + Bill', () => {
    const upcomingBills: UpcomingBillOccurrence[] = [{
      bill_id: 2, bill_name: 'Bill', category: 'O', amount: 20000, currency: 'INR',
      due_date: '2026-08-20', frequency: 'Monthly', account_id: null, account_name: null,
      auto_pay: false, days_until_due: 9, status: 'Upcoming'
    }];
    
    // 50,000 monthly income means 50000/30 per day for 30 days = 50,000 total inflow
    const res = calculateCashFlowProjection(100000, 50000, 0, upcomingBills, 30, refDate, true);
    
    expect(res.starting_cash).toBe(100000);
    expect(Math.round(res.projected_income)).toBe(50000);
    expect(res.projected_bills).toBe(20000);
    // JS float math can have tiny errors, so we round
    expect(Math.round(res.ending_cash)).toBe(130000);
  });

  it('Test 3: Income + Expense + Bill', () => {
    const upcomingBills: UpcomingBillOccurrence[] = [{
      bill_id: 3, bill_name: 'Bill', category: 'O', amount: 10000, currency: 'INR',
      due_date: '2026-08-20', frequency: 'Monthly', account_id: null, account_name: null,
      auto_pay: false, days_until_due: 9, status: 'Upcoming'
    }];
    
    const res = calculateCashFlowProjection(100000, 50000, 20000, upcomingBills, 30, refDate, true);
    
    expect(res.starting_cash).toBe(100000);
    expect(Math.round(res.projected_income)).toBe(50000);
    expect(Math.round(res.projected_expenses)).toBe(20000);
    expect(res.projected_bills).toBe(10000);
    expect(Math.round(res.ending_cash)).toBe(120000);
  });

  it('Test 4: Negative cash detection', () => {
    const upcomingBills: UpcomingBillOccurrence[] = [{
      bill_id: 4, bill_name: 'Big Bill', category: 'O', amount: 30000, currency: 'INR',
      due_date: '2026-08-15', frequency: 'Monthly', account_id: null, account_name: null,
      auto_pay: false, days_until_due: 4, status: 'Upcoming'
    }];
    
    const res = calculateCashFlowProjection(20000, 0, 0, upcomingBills, 30, refDate, false);
    
    expect(res.cash_shortfall).toBe(true);
    expect(res.shortfall_amount).toBe(10000);
    expect(res.shortfall_date).toBe('2026-08-15');
    expect(res.minimum_projected_cash).toBe(-10000);
  });

  it('Test 5: Multiple occurrences', () => {
    const upcomingBills: UpcomingBillOccurrence[] = [
      {
        bill_id: 5, bill_name: 'Weekly', category: 'O', amount: 500, currency: 'INR',
        due_date: '2026-08-15', frequency: 'Weekly', account_id: null, account_name: null,
        auto_pay: false, days_until_due: 4, status: 'Upcoming'
      },
      {
        bill_id: 5, bill_name: 'Weekly', category: 'O', amount: 500, currency: 'INR',
        due_date: '2026-08-22', frequency: 'Weekly', account_id: null, account_name: null,
        auto_pay: false, days_until_due: 11, status: 'Upcoming'
      }
    ];
    
    const res = calculateCashFlowProjection(10000, 0, 0, upcomingBills, 30, refDate, false);
    
    expect(res.projected_bills).toBe(1000);
    expect(res.ending_cash).toBe(9000);
    expect(res.events.length).toBe(2);
  });

  it('Test 6: Horizon cutoffs', () => {
    const upcomingBills: UpcomingBillOccurrence[] = [
      {
        bill_id: 6, bill_name: 'Out of bound', category: 'O', amount: 5000, currency: 'INR',
        due_date: '2026-09-15', frequency: 'Monthly', account_id: null, account_name: null,
        auto_pay: false, days_until_due: 35, status: 'Upcoming'
      }
    ];
    
    // Test 30 days. Bill is at day 35. It shouldn't match any day in the loop.
    const res = calculateCashFlowProjection(10000, 0, 0, upcomingBills, 30, refDate, false);
    
    expect(res.projected_bills).toBe(0);
    expect(res.ending_cash).toBe(10000);
    expect(res.events.length).toBe(0);
  });

  it('Test 7: Reconciliation math', () => {
    const upcomingBills: UpcomingBillOccurrence[] = [{
      bill_id: 7, bill_name: 'Bill', category: 'O', amount: 15234, currency: 'INR',
      due_date: '2026-08-20', frequency: 'Monthly', account_id: null, account_name: null,
      auto_pay: false, days_until_due: 9, status: 'Upcoming'
    }];
    
    const start = 84521;
    const inc = 98124;
    const exp = 43921;
    const res = calculateCashFlowProjection(start, inc, exp, upcomingBills, 30, refDate, true);
    
    const recMath = start + res.projected_income - res.projected_expenses - res.projected_bills;
    expect(Math.abs(res.ending_cash - recMath)).toBeLessThan(0.01); // Float precision tolerance
  });
});
