import { NextResponse } from 'next/server';
import { IncomeEngineAPI } from '../../../../lib/income-engine/services/engine';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate') || undefined;
  const endDate = searchParams.get('endDate') || undefined;

  try {
    const types = await IncomeEngineAPI.getTypes(startDate, endDate);
    return NextResponse.json(types);
  } catch (error) {
    console.error('Error fetching income types:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
