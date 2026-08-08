import { NextResponse } from 'next/server';
import { CashFlowEngineAPI } from '@/lib/cashflow-engine/services/engine';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limitStr = searchParams.get('limit') || '10';
  const limit = parseInt(limitStr, 10);
  const accountId = searchParams.get('account') || undefined;

  try {
    const recent = await CashFlowEngineAPI.getRecent(limit, accountId);
    return NextResponse.json(recent);
  } catch (error) {
    console.error('CashFlow API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
