import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const assistantId = searchParams.get('assistantId');

  if (!assistantId) {
    return NextResponse.json({ error: 'Assistant ID is required' }, { status: 400 });
  }

  try {
    const response = await fetch(`https://api.vapi.ai/assistant/${assistantId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.VAPI_PRIVATE_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`VAPI API error: ${response.statusText}`);
    }

    const data = await response.json();

    return NextResponse.json({
      prompt: data.model?.messages?.[0]?.content || data.firstMessage || 'No prompt found',
      fullData: data
    });
  } catch (error) {
    console.error('Error fetching VAPI prompt:', error);
    return NextResponse.json(
      { error: 'Failed to fetch VAPI prompt' },
      { status: 500 }
    );
  }
}
