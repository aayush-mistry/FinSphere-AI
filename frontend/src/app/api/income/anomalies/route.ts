import { NextResponse } from 'next/server';
import { IncomeEngineAPI } from '../../../../lib/income-engine/services/engine';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const recentStartDate = searchParams.get('recentStartDate');
  const recentEndDate = searchParams.get('recentEndDate');
  const historicalStartDate = searchParams.get('historicalStartDate');
  const historicalEndDate = searchParams.get('historicalEndDate');

  if (!recentStartDate || !recentEndDate || !historicalStartDate || !historicalEndDate) {
    return NextResponse.json({ error: 'Missing date parameters' }, { status: 400 });
  }

  try {
    const anomalies = await IncomeEngineAPI.getAnomalies(
      recentStartDate, recentEndDate,
      historicalStartDate, historicalEndDate
    );
    return NextResponse.json(anomalies);
  } catch (error) {
    console.error('Error fetching income anomalies:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
