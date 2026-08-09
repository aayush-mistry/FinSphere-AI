import { NextResponse } from 'next/server';
import { mockTransactions } from '../../../../lib/balance-engine/utils/mockData';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const transaction = mockTransactions.find(t => t.id === params.id);
  
  if (!transaction) {
    return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
  }
  
  return NextResponse.json(transaction);
}
