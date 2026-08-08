import { NextResponse } from 'next/server';
import { IncomeEngineAPI } from '../../../../lib/income-engine/services/engine';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '10');

  try {
    const all = await IncomeEngineAPI.getIncomeTransactions();
    // Sort descending by date
    all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return NextResponse.json(all.slice(0, limit));
  } catch (error) {
    console.error('Error fetching recent income:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
