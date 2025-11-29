import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();
    const staffKey = process.env.ONSEN_MASTER_KEY;
    const guestKey = process.env.ONSEN_GUEST_KEY || 'niseko2025';

    if (!staffKey) {
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Check staff access
    if (code === staffKey) {
      return NextResponse.json({
        success: true,
        role: 'staff',
        message: 'Welcome to the Staff Portal'
      });
    }

    // Check guest access
    if (code === guestKey) {
      return NextResponse.json({
        success: true,
        role: 'guest',
        message: 'Welcome to The 1898 Niseko'
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid access code' });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  }
}
