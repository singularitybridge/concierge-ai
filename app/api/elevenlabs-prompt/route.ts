import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get('agentId');

  if (!agentId) {
    return NextResponse.json({ error: 'Agent ID is required' }, { status: 400 });
  }

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}`, {
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY || '',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.statusText}`);
    }

    const data = await response.json();

    return NextResponse.json({
      prompt: data.prompt || data.conversation_config?.agent?.prompt?.prompt || 'No prompt found',
      fullData: data
    });
  } catch (error) {
    console.error('Error fetching ElevenLabs prompt:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ElevenLabs prompt' },
      { status: 500 }
    );
  }
}
