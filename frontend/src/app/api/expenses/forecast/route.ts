import { NextResponse } from 'next/server';
import { ExpenseEngineAPI } from '../../../../lib/expense-engine/services/engine';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const currentMonthStartDate = searchParams.get('currentMonthStartDate');
  const currentMonthEndDate = searchParams.get('currentMonthEndDate');

  if (!currentMonthStartDate || !currentMonthEndDate) {
    return NextResponse.json({ error: 'currentMonthStartDate and currentMonthEndDate are required' }, { status: 400 });
  }

  try {
    const forecast = await ExpenseEngineAPI.getForecast(currentMonthStartDate, currentMonthEndDate);
    return NextResponse.json(forecast);
  } catch (error) {
    console.error('Error fetching expense forecast:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
