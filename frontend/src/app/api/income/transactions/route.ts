import { NextResponse } from 'next/server';
import { IncomeEngineAPI } from '../../../../lib/income-engine/services/engine';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate') || undefined;
  const endDate = searchParams.get('endDate') || undefined;
  const type = searchParams.get('type') || undefined;
  const source = searchParams.get('source') || undefined;

  try {
    const transactions = await IncomeEngineAPI.getIncomeTransactions(startDate, endDate, type, source);
    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching income transactions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
