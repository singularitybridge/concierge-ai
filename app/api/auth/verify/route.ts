import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();
    const masterKey = process.env.ONSEN_MASTER_KEY;

    if (!masterKey) {
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    if (code === masterKey) {
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
