import { NextResponse } from 'next/server';
import { CashFlowEngineAPI } from '@/lib/cashflow-engine/services/engine';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const periodType = searchParams.get('period') as 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | null;
  const startDate = searchParams.get('start_date') || undefined;
  const endDate = searchParams.get('end_date') || undefined;

  if (!periodType || !['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'].includes(periodType)) {
    return NextResponse.json({ error: 'Invalid period parameter' }, { status: 400 });
  }

  try {
    const trends = await CashFlowEngineAPI.getTrends(periodType, startDate, endDate);
    return NextResponse.json(trends);
  } catch (error) {
    console.error('CashFlow API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
