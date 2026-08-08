import { NextResponse } from 'next/server';
import { CashFlowEngineAPI } from '@/lib/cashflow-engine/services/engine';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('start_date');
  const endDate = searchParams.get('end_date');
  const accountId = searchParams.get('account') || undefined;

  if (!startDate || !endDate) {
    return NextResponse.json({ error: 'Missing date parameters' }, { status: 400 });
  }

  try {
    const summary = await CashFlowEngineAPI.getSummary(startDate, endDate, accountId);
    return NextResponse.json(summary);
  } catch (error) {
    console.error('CashFlow API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
