import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import http from 'http';

// HTTP agent configured for IPv4 only
const httpAgent = new http.Agent({
  family: 4,
  keepAlive: true
});

// Agent Hub MCP API endpoint
const AGENT_HUB_URL = process.env.AGENT_HUB_API_URL || 'http://127.0.0.1:3000';
const AGENT_HUB_KEY = process.env.AGENT_HUB_API_KEY || '';

// Handle GET requests (health checks)
export async function GET(req: NextRequest) {
  console.log('📥 Slide update webhook GET request (health check)');
  return NextResponse.json({ status: 'ok', method: 'GET' });
}

// Handle OPTIONS requests (CORS preflight)
export async function OPTIONS(req: NextRequest) {
  console.log('📥 Slide update webhook OPTIONS request (CORS preflight)');
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('📥 Slide update received:', JSON.stringify(body, null, 2));

    // Handle both VAPI and ElevenLabs formats
    const toolName = body.message?.toolCalls?.[0]?.function?.name || body.tool_name || 'update_slide';
    const parameters = body.message?.toolCalls?.[0]?.function?.arguments || body.parameters || body;

    console.log('🔍 Tool call detection:', { toolName, parameters });

    if (toolName === 'update_slide') {
      const { slideIndex, topic, content, sessionId } = parameters;

      console.log('🎬 Slide update request:', { slideIndex, topic, content, sessionId });

      // Prepare slide data
      const slideData = {
        slideIndex: slideIndex ?? 0,
        topic: topic ?? '',
        content: content ?? '',
        timestamp: Date.now(),
      };

      // Update Agent Hub workspace
      try {
        const workspaceUrl = `${AGENT_HUB_URL}/workspace/session/${sessionId || 'default'}/slides/current.json`;

        console.log('📤 Updating workspace:', workspaceUrl);

        await axios.put(workspaceUrl, slideData, {
          httpAgent: httpAgent,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${AGENT_HUB_KEY}`
          },
          timeout: 5000,
        });

        console.log('✅ Workspace updated successfully');
      } catch (workspaceError: any) {
        console.error('⚠️ Workspace update failed:', workspaceError.message);
        // Continue even if workspace update fails
      }

      // Respond based on source
      if (body.message?.toolCalls) {
        // VAPI format
        const toolCallId = body.message.toolCalls[0].id;
        return NextResponse.json({
          results: [{
            toolCallId,
            result: JSON.stringify({
              success: true,
              slideIndex: slideData.slideIndex,
              topic: slideData.topic,
              message: `Slide updated to ${slideData.slideIndex}: ${slideData.topic}`
            })
          }]
        });
      } else {
        // ElevenLabs format
        return NextResponse.json({
          result: `Slide updated to ${slideData.slideIndex}: ${slideData.topic}`
        });
      }
    }

    // For other message types, just acknowledge
    return NextResponse.json({ status: 'received' });

  } catch (error) {
    console.error('Slide update webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
