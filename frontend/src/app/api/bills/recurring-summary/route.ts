import { NextRequest, NextResponse } from 'next/server';
import { IncomeEngineAPI } from '../../../../lib/income-engine/services/engine';

const API_BASE_URL = 'http://localhost:8000/api';

function getDatesForIncomeSummary() {
  const now = new Date();
  
  // Current month bounds
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
  
  // Previous month bounds
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();
  
  // Current year bounds
  const currentYearStart = new Date(now.getFullYear(), 0, 1).toISOString();
  const currentYearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59).toISOString();
  
  return {
    currentMonthStart,
    currentMonthEnd,
    previousMonthStart,
    previousMonthEnd,
    currentYearStart,
    currentYearEnd
  };
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get('user_id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
    }

    // 1. Calculate dates and fetch monthly income
    let monthlyIncome: number | null = null;
    try {
      const dates = getDatesForIncomeSummary();
      const incomeSummary = await IncomeEngineAPI.getSummary(
        dates.currentMonthStart,
        dates.currentMonthEnd,
        dates.previousMonthStart,
        dates.previousMonthEnd,
        dates.currentYearStart,
        dates.currentYearEnd
      );
      if (incomeSummary && typeof incomeSummary.currentMonthIncome === 'number') {
        monthlyIncome = incomeSummary.currentMonthIncome;
      }
    } catch (incomeError) {
      console.warn('Could not fetch income summary for recurring bills:', incomeError);
      // We proceed even if income fails, passing null
    }

    // 2. Build the backend API URL
    const backendParams = new URLSearchParams();
    backendParams.append('user_id', userId);
    if (monthlyIncome !== null && monthlyIncome > 0) {
      backendParams.append('monthly_income', monthlyIncome.toString());
    }

    // 3. Fetch recurring summary from Python backend
    const res = await fetch(`${API_BASE_URL}/bills/recurring-summary?${backendParams.toString()}`);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Backend error (GET /bills/recurring-summary):', errorText);
      throw new Error(`Backend responded with status ${res.status}`);
    }
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy error (GET /bills/recurring-summary):', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
