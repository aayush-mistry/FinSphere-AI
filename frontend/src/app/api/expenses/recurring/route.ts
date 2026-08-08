import { NextResponse } from 'next/server';
import { ExpenseEngineAPI } from '../../../../lib/expense-engine/services/engine';

export async function GET() {
  try {
    const recurring = await ExpenseEngineAPI.getRecurring();
    return NextResponse.json(recurring);
  } catch (error) {
    console.error('Error fetching recurring expenses:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
