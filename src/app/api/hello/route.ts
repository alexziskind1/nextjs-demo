import { NextRequest, NextResponse } from 'next/server';
import { HelloService } from '@/lib/services/helloService';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');

  if (!name) {
    return NextResponse.json(
      { error: 'Name parameter is required' },
      { status: 400 }
    );
  }

  const result = await HelloService.processHelloRequest(name);
  
  if (result.success) {
    return NextResponse.json({ message: result.message });
  } else {
    return NextResponse.json(
      { error: result.error },
      { status: 400 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    const result = await HelloService.processHelloRequest(name);
    
    if (result.success) {
      return NextResponse.json({ message: result.message });
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid JSON in request body' },
      { status: 400 }
    );
  }
}
