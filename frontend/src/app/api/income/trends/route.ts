import { NextResponse } from 'next/server';
import { IncomeEngineAPI } from '../../../../lib/income-engine/services/engine';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const periodType = searchParams.get('periodType') as 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' || 'MONTHLY';
  const startDate = searchParams.get('startDate') || undefined;
  const endDate = searchParams.get('endDate') || undefined;

  try {
    const trends = await IncomeEngineAPI.getTrends(periodType, startDate, endDate);
    return NextResponse.json(trends);
  } catch (error) {
    console.error('Error fetching income trends:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
