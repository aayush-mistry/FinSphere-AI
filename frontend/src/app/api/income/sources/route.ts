import { NextResponse } from 'next/server';
import { IncomeEngineAPI } from '../../../../lib/income-engine/services/engine';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const currentStartDate = searchParams.get('currentStartDate');
  const currentEndDate = searchParams.get('currentEndDate');
  const previousStartDate = searchParams.get('previousStartDate');
  const previousEndDate = searchParams.get('previousEndDate');

  if (!currentStartDate || !currentEndDate || !previousStartDate || !previousEndDate) {
    return NextResponse.json({ error: 'Missing date parameters' }, { status: 400 });
  }

  try {
    const sources = await IncomeEngineAPI.getSources(currentStartDate, currentEndDate, previousStartDate, previousEndDate);
    return NextResponse.json(sources);
  } catch (error) {
    console.error('Error fetching income sources:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
