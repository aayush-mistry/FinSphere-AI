import { NextResponse } from 'next/server';
import { ExpenseEngineAPI } from '../../../../lib/expense-engine/services/engine';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const recentStartDate = searchParams.get('recentStartDate');
  const recentEndDate = searchParams.get('recentEndDate');
  const historicalStartDate = searchParams.get('historicalStartDate');
  const historicalEndDate = searchParams.get('historicalEndDate');

  if (!recentStartDate || !recentEndDate || !historicalStartDate || !historicalEndDate) {
    return NextResponse.json({ error: 'recent and historical date ranges are required' }, { status: 400 });
  }

  try {
    const anomalies = await ExpenseEngineAPI.getAnomalies(
      recentStartDate, 
      recentEndDate, 
      historicalStartDate, 
      historicalEndDate
    );
    return NextResponse.json(anomalies);
  } catch (error) {
    console.error('Error fetching expense anomalies:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
