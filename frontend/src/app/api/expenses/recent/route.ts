import { NextResponse } from 'next/server';
import { ExpenseEngineAPI } from '../../../../lib/expense-engine/services/engine';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '10', 10);

  try {
    const expenses = await ExpenseEngineAPI.getExpenses();
    // Sort by date descending
    expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return NextResponse.json(expenses.slice(0, limit));
  } catch (error) {
    console.error('Error fetching recent expenses:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
