/**
 * TwiML endpoint for connecting ElevenLabs AI agent to Twilio conference
 * This endpoint returns TwiML that starts Media Streams and joins conference
 */
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const conferenceId = searchParams.get('conferenceId') || 'default-conference';
    const agentId = searchParams.get('agentId') || process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;

    // Get the base URL for WebSocket connection
    const protocol = request.headers.get('x-forwarded-proto') || 'https';
    const host = request.headers.get('host');
    const wsProtocol = protocol === 'https' ? 'wss' : 'ws';
    const wsUrl = `${wsProtocol}://${host}/api/twilio/media-stream?conferenceId=${conferenceId}&agentId=${agentId}`;

    // Generate TwiML that connects to conference and starts media stream
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Start>
    <Stream url="${wsUrl}" />
  </Start>
  <Dial>
    <Conference
      startConferenceOnEnter="true"
      endConferenceOnExit="false"
      statusCallback="/api/twilio/conference-status"
      statusCallbackEvent="start end join leave"
      statusCallbackMethod="POST"
    >${conferenceId}</Conference>
  </Dial>
</Response>`;

    console.log('📞 Conference TwiML generated:', { conferenceId, agentId, wsUrl });

    return new NextResponse(twiml, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  } catch (error) {
    console.error('Conference TwiML error:', error);
    return NextResponse.json(
      { error: 'Failed to generate TwiML' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  // Same logic for GET requests
  return POST(request);
}
