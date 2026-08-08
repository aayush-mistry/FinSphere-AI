import { NextResponse } from 'next/server';
import { ExpenseEngineAPI } from '../../../../lib/expense-engine/services/engine';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const currentStartDate = searchParams.get('currentStartDate');
  const currentEndDate = searchParams.get('currentEndDate');
  const previousStartDate = searchParams.get('previousStartDate');
  const previousEndDate = searchParams.get('previousEndDate');

  if (!currentStartDate || !currentEndDate || !previousStartDate || !previousEndDate) {
    return NextResponse.json({ error: 'current and previous date ranges are required' }, { status: 400 });
  }

  try {
    const categories = await ExpenseEngineAPI.getCategories(
      currentStartDate, 
      currentEndDate, 
      previousStartDate, 
      previousEndDate
    );
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching expense categories:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
