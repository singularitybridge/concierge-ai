/**
 * Webhook endpoint for Twilio conference TwiML
 * This endpoint returns TwiML that directs calls to join a conference room
 */
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const conferenceId = searchParams.get('conferenceId') || 'vapi-conference-default';

    // Generate TwiML response for Twilio
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial>
    <Conference startConferenceOnEnter="true" endConferenceOnExit="false">${conferenceId}</Conference>
  </Dial>
</Response>`;

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
  // Same logic for GET requests (Twilio can use GET or POST)
  return POST(request);
}
