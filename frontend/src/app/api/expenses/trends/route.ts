import { NextResponse } from 'next/server';
import { ExpenseEngineAPI } from '../../../../lib/expense-engine/services/engine';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const periodType = (searchParams.get('periodType') || 'MONTHLY') as 'DAILY' | 'WEEKLY' | 'MONTHLY';
  const startDate = searchParams.get('startDate') || undefined;
  const endDate = searchParams.get('endDate') || undefined;

  try {
    const trends = await ExpenseEngineAPI.getTrends(periodType, startDate, endDate);
    return NextResponse.json(trends);
  } catch (error) {
    console.error('Error fetching expense trends:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
