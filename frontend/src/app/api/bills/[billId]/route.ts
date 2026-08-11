import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'http://localhost:8000/api';

export async function GET(req: NextRequest, { params }: { params: { billId: string } }) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const res = await fetch(`${API_BASE_URL}/bills/${params.billId}?${searchParams.toString()}`);
    
    if (!res.ok) {
      throw new Error(`Backend responded with status ${res.status}`);
    }
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Proxy error (GET /bills/${params.billId}):`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { billId: string } }) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const body = await req.json();
    const res = await fetch(`${API_BASE_URL}/bills/${params.billId}?${searchParams.toString()}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    if (!res.ok) {
      const errorData = await res.text();
      console.error(`Backend error (PUT /bills/${params.billId}):`, errorData);
      throw new Error(`Backend responded with status ${res.status}`);
    }
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Proxy error (PUT /bills/${params.billId}):`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { billId: string } }) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const res = await fetch(`${API_BASE_URL}/bills/${params.billId}?${searchParams.toString()}`, {
      method: 'DELETE',
    });
    
    if (!res.ok) {
      throw new Error(`Backend responded with status ${res.status}`);
    }
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Proxy error (DELETE /bills/${params.billId}):`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
