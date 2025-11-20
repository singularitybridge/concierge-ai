import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();
    const guestKey = process.env.ONSEN_GUEST_KEY || 'niseko2025';

    if (code === guestKey) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  }
}
