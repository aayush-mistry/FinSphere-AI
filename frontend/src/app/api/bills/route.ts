import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'http://localhost:8000/api';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const res = await fetch(`${API_BASE_URL}/bills?${searchParams.toString()}`);
    
    if (!res.ok) {
      throw new Error(`Backend responded with status ${res.status}`);
    }
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy error (GET /bills):', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(`${API_BASE_URL}/bills`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    if (!res.ok) {
      const errorData = await res.text();
      console.error('Backend error (POST /bills):', errorData);
      throw new Error(`Backend responded with status ${res.status}`);
    }
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy error (POST /bills):', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
