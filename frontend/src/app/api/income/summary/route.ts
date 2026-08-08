import { NextResponse } from 'next/server';
import { IncomeEngineAPI } from '../../../../lib/income-engine/services/engine';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const currentMonthStart = searchParams.get('currentMonthStart');
  const currentMonthEnd = searchParams.get('currentMonthEnd');
  const previousMonthStart = searchParams.get('previousMonthStart');
  const previousMonthEnd = searchParams.get('previousMonthEnd');
  const currentYearStart = searchParams.get('currentYearStart');
  const currentYearEnd = searchParams.get('currentYearEnd');

  if (!currentMonthStart || !currentMonthEnd || !previousMonthStart || !previousMonthEnd || !currentYearStart || !currentYearEnd) {
    return NextResponse.json({ error: 'Missing date parameters' }, { status: 400 });
  }

  try {
    const summary = await IncomeEngineAPI.getSummary(
      currentMonthStart, currentMonthEnd, 
      previousMonthStart, previousMonthEnd, 
      currentYearStart, currentYearEnd
    );
    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error fetching income summary:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
