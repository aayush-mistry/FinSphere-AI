import { NextResponse } from 'next/server';
import { IncomeEngineAPI } from '../../../../lib/income-engine/services/engine';

export async function GET() {
  try {
    const recurring = await IncomeEngineAPI.getRecurring();
    return NextResponse.json(recurring);
  } catch (error) {
    console.error('Error fetching recurring income:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
