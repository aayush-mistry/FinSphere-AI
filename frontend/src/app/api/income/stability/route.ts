import { NextResponse } from 'next/server';
import { IncomeEngineAPI } from '../../../../lib/income-engine/services/engine';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate') || undefined;
  const endDate = searchParams.get('endDate') || undefined;

  try {
    const stability = await IncomeEngineAPI.getStability(startDate, endDate);
    return NextResponse.json(stability);
  } catch (error) {
    console.error('Error fetching income stability:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
