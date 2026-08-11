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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userIdStr = searchParams.get('user_id');
    
    // Default to returning all if no user_id, or filter by user_id
    // Since mockTransactions doesn't currently strictly map user_id on all items,
    // we return all, but we could filter if mockTransactions had account ownership mapped perfectly.
    // For now, return all mockTransactions as requested for the backend to consume.
    return NextResponse.json(mockTransactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
