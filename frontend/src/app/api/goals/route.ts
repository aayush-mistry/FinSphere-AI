import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('user_id') || '1'; // Defaulting to 1 for prototype

  try {
    const res = await fetch(`${BACKEND_URL}/api/goals/?user_id=${userId}`, {
      cache: 'no-store'
    });
    
    if (!res.ok) throw new Error('Failed to fetch goals');
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying to backend:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
