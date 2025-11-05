/**
 * API endpoint to initiate VAPI outbound phone calls
 * Used for adding phone participants to conference calls
 */
import { NextResponse } from 'next/server';

const VAPI_API_KEY = process.env.VAPI_PRIVATE_KEY || '59c0d5cc-d643-4b16-9607-224c8f570ae0';
const VAPI_ASSISTANT_ID = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || '957955fc-dba8-4766-9132-4bcda7aad3b2';
const VAPI_PHONE_NUMBER_ID = 'cd529016-6726-4b44-a4ad-009588605251';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phoneNumber, conferenceId } = body;

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Ensure phone number is in E.164 format
    const formattedNumber = phoneNumber.startsWith('+')
      ? phoneNumber
      : `+${phoneNumber}`;

    console.log('📞 Initiating outbound call:', {
      phoneNumber: formattedNumber,
      conferenceId,
      assistantId: VAPI_ASSISTANT_ID
    });

    // Make outbound call through VAPI
    // Note: The phone call will be managed by VAPI's AI assistant
    // For full 3-way conference (web + phone + AI), we'd need to use Twilio Client SDK
    // Current implementation: AI bridges web and phone calls
    const response = await fetch('https://api.vapi.ai/call/phone', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        assistantId: VAPI_ASSISTANT_ID,
        customer: {
          number: formattedNumber
        },
        phoneNumberId: VAPI_PHONE_NUMBER_ID
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('VAPI call failed:', error);
      return NextResponse.json(
        { error: 'Failed to initiate call', details: error },
        { status: response.status }
      );
    }

    const callData = await response.json();
    console.log('✅ Call initiated:', callData);

    return NextResponse.json({
      success: true,
      callId: callData.id,
      phoneNumber: formattedNumber,
      conferenceId,
      status: callData.status
    });

  } catch (error) {
    console.error('Call phone error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate call', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
