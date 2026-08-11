import { NextResponse } from 'next/server';
import { CashFlowEngineAPI } from '@/lib/cashflow-engine/services/engine';
import { IncomeEngineAPI } from '@/lib/income-engine/services/engine';
import { ExpenseEngineAPI } from '@/lib/expense-engine/services/engine';
import { calculateCashFlowProjection } from '@/lib/cashflow-engine/calculators/projection';
import { UpcomingBillOccurrence } from '@/lib/bills-engine/types';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userIdStr = searchParams.get('user_id');
    const daysStr = searchParams.get('days') || '30';
    
    if (!userIdStr) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }
    
    const userId = parseInt(userIdStr, 10);
    const days = parseInt(daysStr, 10);
    
    if (isNaN(userId) || isNaN(days) || days < 1 || days > 365) {
      return NextResponse.json({ error: 'Invalid parameters. days must be between 1 and 365.' }, { status: 400 });
    }

    // Reference Date is strictly today in application timezone (assumed UTC / server time)
    const today = new Date();
    const referenceDateStr = format(today, 'yyyy-MM-dd');
    
    // 1. Starting Cash
    const position = await CashFlowEngineAPI.getPosition(referenceDateStr, referenceDateStr);
    const startingCash = position.endingBalance; // Balance precisely at the end of the reference day
    
    // 2. Expected Income
    const currentMonthStart = format(startOfMonth(today), 'yyyy-MM-dd');
    const currentMonthEnd = format(endOfMonth(today), 'yyyy-MM-dd');
    
    // Historical period: last 6 months for stability
    const historicalStart = format(subDays(startOfMonth(today), 180), 'yyyy-MM-dd');
    const historicalEnd = format(subDays(startOfMonth(today), 1), 'yyyy-MM-dd');

    let expectedMonthlyIncome = 0;
    let incomeProjectionAvailable = false;
    try {
      const incomeForecast = await IncomeEngineAPI.getForecast(currentMonthStart, currentMonthEnd, historicalStart, historicalEnd);
      expectedMonthlyIncome = incomeForecast.expectedFinal;
      incomeProjectionAvailable = true;
    } catch (e) {
      // Fallback if IncomeEngine lacks enough data
      console.warn("Income forecast not available", e);
    }
    
    // 3. Expected Expenses
    let expectedMonthlyExpense = 0;
    try {
      const expenseForecast = await ExpenseEngineAPI.getForecast(currentMonthStart, currentMonthEnd);
      expectedMonthlyExpense = expenseForecast.expectedFinalSpending;
    } catch (e) {
      console.warn("Expense forecast not available", e);
    }
    
    // 4. Bills integration (recurring baseline and exact occurrences)
    // Fetch recurring summary to prevent double counting
    let monthlyRecurringBills = 0;
    try {
      const recurringRes = await fetch(`http://127.0.0.1:8000/api/bills/recurring-summary?user_id=${userId}`);
      if (recurringRes.ok) {
        const data = await recurringRes.json();
        monthlyRecurringBills = data.monthly_recurring || 0;
      }
    } catch (e) {
      console.warn("Recurring bills fetch failed", e);
    }
    
    // Calculate expected non-bill expense
    const expectedMonthlyNonBillExpense = Math.max(0, expectedMonthlyExpense - monthlyRecurringBills);
    
    // Fetch deterministic upcoming occurrences
    let upcomingBills: UpcomingBillOccurrence[] = [];
    try {
      // Use 127.0.0.1 instead of localhost for Node fetch reliability
      const upcomingRes = await fetch(`http://127.0.0.1:8000/api/bills/upcoming?user_id=${userId}&days=${days}&reference_date=${referenceDateStr}`);
      if (upcomingRes.ok) {
        upcomingBills = await upcomingRes.json();
      } else {
         console.warn("Upcoming bills API returned non-ok", await upcomingRes.text());
      }
    } catch (e) {
      console.warn("Upcoming bills fetch failed", e);
    }
    
    // 5. Orchestrate Projection
    const projection = calculateCashFlowProjection(
      startingCash,
      expectedMonthlyIncome,
      expectedMonthlyNonBillExpense,
      upcomingBills,
      days,
      referenceDateStr,
      incomeProjectionAvailable
    );
    
    return NextResponse.json(projection);
    
  } catch (error: any) {
    console.error('Error computing cash flow projection:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
