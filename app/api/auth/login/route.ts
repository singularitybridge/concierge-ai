import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();
    const accessKey = process.env.ONSEN_MASTER_KEY || 'niseko1898';

    if (code === accessKey) {
      return NextResponse.json({
        success: true,
        role: 'admin',
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
