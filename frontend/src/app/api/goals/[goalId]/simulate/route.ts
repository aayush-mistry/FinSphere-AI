import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ goalId: string }> }
) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('user_id') || '1';
  const { goalId } = await params;

  try {
    const body = await request.json();
    const res = await fetch(`${BACKEND_URL}/api/goals/${goalId}/simulate?user_id=${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });
    
    if (!res.ok) throw new Error('Failed to fetch simulation');
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying simulation to backend:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
