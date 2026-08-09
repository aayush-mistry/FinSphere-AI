import { NextResponse } from 'next/server';
import { mockTransactions } from '../../../lib/balance-engine/utils/mockData';

export async function POST(request: Request) {
  try {
    const newTransaction = await request.json();
    
    // In memory mutation. This works in dev mode for state persistence
    // across the next.js api routes within the same node process.
    mockTransactions.push(newTransaction);
    
    return NextResponse.json({ success: true, transaction: newTransaction }, { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
