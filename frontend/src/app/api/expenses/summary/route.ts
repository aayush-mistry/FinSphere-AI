import { NextResponse } from 'next/server';
import { ExpenseEngineAPI } from '../../../../lib/expense-engine/services/engine';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  if (!startDate || !endDate) {
    return NextResponse.json({ error: 'startDate and endDate are required' }, { status: 400 });
  }

  try {
    const summary = await ExpenseEngineAPI.getSummary(startDate, endDate);
    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error fetching expense summary:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
