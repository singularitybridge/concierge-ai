/**
 * Start a Twilio conference with ElevenLabs AI agent
 * Creates conference and adds AI participant
 */
import { NextResponse } from 'next/server';

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

export async function POST(request: Request) {
  try {
    // Check if Twilio credentials are configured
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      return NextResponse.json(
        {
          error: 'Twilio credentials not configured',
          message: 'Please add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER to your .env.local file',
          instructions: {
            step1: 'Go to https://console.twilio.com',
            step2: 'Get Account SID and Auth Token from dashboard',
            step3: 'Buy a phone number from Phone Numbers section',
            step4: 'Add credentials to .env.local'
          }
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { conferenceId, phoneNumbers = [], agentId } = body;

    if (!conferenceId) {
      return NextResponse.json(
        { error: 'Conference ID is required' },
        { status: 400 }
      );
    }

    // Import Twilio SDK
    const twilio = (await import('twilio')).default;
    const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

    console.log('🎙️ Starting conference:', { conferenceId, agentId });

    // Get webhook base URL
    const protocol = request.headers.get('x-forwarded-proto') || 'https';
    const host = request.headers.get('host');
    const baseUrl = `${protocol}://${host}`;

    // URL for AI agent to join conference
    const aiWebhookUrl = `${baseUrl}/api/twilio/conference-elevenlabs?conferenceId=${conferenceId}&agentId=${agentId}`;

    // Add AI agent as first participant (using TwiML application)
    const aiCall = await client.calls.create({
      url: aiWebhookUrl,
      to: 'conference',  // Placeholder - will be overridden by TwiML
      from: TWILIO_PHONE_NUMBER,
      statusCallback: `${baseUrl}/api/twilio/call-status`,
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
    });

    console.log('✅ AI agent joining conference:', aiCall.sid);

    // Add phone participants
    const phoneCallSids = [];
    for (const phoneNumber of phoneNumbers) {
      const phoneCall = await client.calls.create({
        url: `${baseUrl}/api/vapi/conference?conferenceId=${conferenceId}`,
        to: phoneNumber,
        from: TWILIO_PHONE_NUMBER,
        statusCallback: `${baseUrl}/api/twilio/call-status`,
        statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
      });

      phoneCallSids.push(phoneCall.sid);
      console.log('📞 Phone participant added:', phoneNumber, phoneCall.sid);
    }

    return NextResponse.json({
      success: true,
      conferenceId,
      aiCallSid: aiCall.sid,
      phoneCallSids,
      message: 'Conference started with ElevenLabs AI agent'
    });

  } catch (error) {
    console.error('Conference start error:', error);
    return NextResponse.json(
      {
        error: 'Failed to start conference',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
