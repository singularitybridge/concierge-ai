/**
 * Twilio call status callback endpoint
 * Logs call events for monitoring
 */
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    console.log('📞 Call status update:', {
      CallSid: data.CallSid,
      CallStatus: data.CallStatus,
      From: data.From,
      To: data.To,
      Direction: data.Direction
    });

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('Call status callback error:', error);
    return new NextResponse('Error', { status: 500 });
  }
}
