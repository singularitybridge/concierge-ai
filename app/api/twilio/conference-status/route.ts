/**
 * Twilio conference status callback endpoint
 * Logs conference events for monitoring
 */
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    console.log('🎙️ Conference status update:', {
      ConferenceSid: data.ConferenceSid,
      FriendlyName: data.FriendlyName,
      StatusCallbackEvent: data.StatusCallbackEvent,
      Timestamp: data.Timestamp
    });

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('Conference status callback error:', error);
    return new NextResponse('Error', { status: 500 });
  }
}
