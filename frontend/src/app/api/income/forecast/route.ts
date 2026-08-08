import { NextResponse } from 'next/server';
import { IncomeEngineAPI } from '../../../../lib/income-engine/services/engine';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const currentMonthStart = searchParams.get('currentMonthStart');
  const currentMonthEnd = searchParams.get('currentMonthEnd');
  const historicalStartDate = searchParams.get('historicalStartDate');
  const historicalEndDate = searchParams.get('historicalEndDate');

  if (!currentMonthStart || !currentMonthEnd || !historicalStartDate || !historicalEndDate) {
    return NextResponse.json({ error: 'Missing date parameters' }, { status: 400 });
  }

  try {
    const forecast = await IncomeEngineAPI.getForecast(
      currentMonthStart, currentMonthEnd,
      historicalStartDate, historicalEndDate
    );
    return NextResponse.json(forecast);
  } catch (error) {
    console.error('Error fetching income forecast:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
