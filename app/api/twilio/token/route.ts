/**
 * Generate Twilio access tokens for web clients
 * Used to connect web users to Twilio conferences
 */
import { NextResponse } from 'next/server';

// We'll need these from Twilio Console:
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_API_KEY = process.env.TWILIO_API_KEY;
const TWILIO_API_SECRET = process.env.TWILIO_API_SECRET;
const TWILIO_TWIML_APP_SID = process.env.TWILIO_TWIML_APP_SID;

export async function POST(request: Request) {
  try {
    // Check if Twilio credentials are configured
    if (!TWILIO_ACCOUNT_SID || !TWILIO_API_KEY || !TWILIO_API_SECRET || !TWILIO_TWIML_APP_SID) {
      return NextResponse.json(
        {
          error: 'Twilio credentials not configured',
          message: 'Please add TWILIO_ACCOUNT_SID, TWILIO_API_KEY, TWILIO_API_SECRET, and TWILIO_TWIML_APP_SID to your .env.local file'
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { identity } = body;

    if (!identity) {
      return NextResponse.json(
        { error: 'Identity is required' },
        { status: 400 }
      );
    }

    // Import Twilio SDK dynamically to avoid bundling issues
    const twilio = await import('twilio');
    const AccessToken = twilio.jwt.AccessToken;
    const VoiceGrant = AccessToken.VoiceGrant;

    // Create access token
    const token = new AccessToken(
      TWILIO_ACCOUNT_SID,
      TWILIO_API_KEY,
      TWILIO_API_SECRET,
      { identity }
    );

    // Create voice grant
    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: TWILIO_TWIML_APP_SID,
      incomingAllow: true,
    });

    token.addGrant(voiceGrant);

    console.log('✅ Generated Twilio token for:', identity);

    return NextResponse.json({
      token: token.toJwt(),
      identity
    });

  } catch (error) {
    console.error('Token generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate token', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
