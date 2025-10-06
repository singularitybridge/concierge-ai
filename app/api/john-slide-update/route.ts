import { NextRequest, NextResponse } from 'next/server';

// In-memory store for slide state (can be replaced with Redis/DB for production)
const slideStore = new Map<string, any>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId = 'default', slideIndex, topic, content } = body;

    const slideData = {
      slideIndex: slideIndex ?? 0,
      topic: topic ?? '',
      content: content ?? '',
      timestamp: Date.now(),
    };

    // Store slide data
    slideStore.set(sessionId, slideData);

    console.log('📊 john updated slide:', slideData);

    return NextResponse.json({
      success: true,
      slideData
    });
  } catch (error) {
    console.error('Slide update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId') || 'default';

    const slideData = slideStore.get(sessionId);

    if (!slideData) {
      return NextResponse.json({
        slideIndex: 0,
        topic: 'Welcome',
        content: '<p>Ask me about integrations!</p>',
        timestamp: Date.now()
      });
    }

    return NextResponse.json(slideData);
  } catch (error) {
    console.error('Slide fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
