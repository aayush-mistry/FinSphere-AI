import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'http://localhost:8000/api';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ billId: string }> }) {
  try {
    const { billId } = await params;
    const searchParams = req.nextUrl.searchParams;
    const body = await req.json();
    const res = await fetch(`${API_BASE_URL}/bills/${billId}/status?${searchParams.toString()}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    if (!res.ok) {
      const errorData = await res.text();
      console.error(`Backend error (PATCH /bills/${billId}/status):`, errorData);
      throw new Error(`Backend responded with status ${res.status}`);
    }
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Proxy error (PATCH /bills/status):`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
