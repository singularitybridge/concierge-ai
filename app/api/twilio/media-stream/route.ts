/**
 * WebSocket endpoint for bridging Twilio Media Streams with ElevenLabs
 * This creates a bidirectional audio bridge between Twilio conference and ElevenLabs AI
 */
import { NextRequest } from 'next/server';
import { WebSocket } from 'ws';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const upgradeHeader = request.headers.get('upgrade');

  if (upgradeHeader !== 'websocket') {
    return new Response('Expected WebSocket connection', { status: 426 });
  }

  const { searchParams } = new URL(request.url);
  const conferenceId = searchParams.get('conferenceId') || 'default';
  const agentId = searchParams.get('agentId') || process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;

  console.log('🔌 WebSocket upgrade requested:', { conferenceId, agentId });

  // In Next.js 14+, WebSocket upgrades need custom server
  // For now, return instructions
  return new Response(
    JSON.stringify({
      message: 'WebSocket endpoint ready',
      note: 'WebSocket connections require custom server or deployment platform support',
      conferenceId,
      agentId,
      instructions: 'Use a WebSocket-compatible deployment (Vercel with Edge Runtime, custom Node server, or ngrok tunnel)'
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
}

/**
 * WebSocket handler function (to be used with custom server or Edge Runtime)
 */
export async function handleWebSocket(
  twilioWs: WebSocket,
  conferenceId: string,
  agentId: string
) {
  console.log('🎙️ Starting Media Stream bridge:', { conferenceId, agentId });

  // Connect to ElevenLabs
  const elevenlabsWsUrl = `wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${agentId}`;
  const elevenlabsWs = new WebSocket(elevenlabsWsUrl);

  let streamSid: string | null = null;

  // Handle Twilio -> ElevenLabs audio
  twilioWs.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());

      switch (msg.event) {
        case 'start':
          streamSid = msg.start.streamSid;
          console.log('📡 Stream started:', streamSid);

          // Send initial config to ElevenLabs
          if (elevenlabsWs.readyState === WebSocket.OPEN) {
            elevenlabsWs.send(JSON.stringify({
              type: 'conversation_initiation_client_data',
              conversation_config_override: {
                agent: {
                  prompt: {
                    prompt: `You are participating in a conference call. Conference ID: ${conferenceId}. Be helpful and engaging.`
                  }
                }
              }
            }));
          }
          break;

        case 'media':
          // Forward audio to ElevenLabs
          if (elevenlabsWs.readyState === WebSocket.OPEN && msg.media.payload) {
            // Twilio sends mulaw base64, ElevenLabs expects PCM16
            // Need to decode and convert
            const audioBuffer = Buffer.from(msg.media.payload, 'base64');

            elevenlabsWs.send(JSON.stringify({
              type: 'audio',
              audio: audioBuffer.toString('base64')
            }));
          }
          break;

        case 'stop':
          console.log('📡 Stream stopped:', streamSid);
          elevenlabsWs.close();
          break;
      }
    } catch (error) {
      console.error('Error processing Twilio message:', error);
    }
  });

  // Handle ElevenLabs -> Twilio audio
  elevenlabsWs.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());

      switch (msg.type) {
        case 'audio':
          // Forward audio back to Twilio
          if (twilioWs.readyState === WebSocket.OPEN && msg.audio) {
            twilioWs.send(JSON.stringify({
              event: 'media',
              streamSid: streamSid,
              media: {
                payload: msg.audio
              }
            }));
          }
          break;

        case 'interruption':
          // Handle interruptions
          if (twilioWs.readyState === WebSocket.OPEN) {
            twilioWs.send(JSON.stringify({
              event: 'clear',
              streamSid: streamSid
            }));
          }
          break;

        case 'ping':
          // Respond to pings
          elevenlabsWs.send(JSON.stringify({ type: 'pong' }));
          break;
      }
    } catch (error) {
      console.error('Error processing ElevenLabs message:', error);
    }
  });

  // Handle connection errors
  twilioWs.on('error', (error) => {
    console.error('Twilio WebSocket error:', error);
  });

  elevenlabsWs.on('error', (error) => {
    console.error('ElevenLabs WebSocket error:', error);
  });

  // Handle connection close
  twilioWs.on('close', () => {
    console.log('🔌 Twilio connection closed');
    elevenlabsWs.close();
  });

  elevenlabsWs.on('close', () => {
    console.log('🔌 ElevenLabs connection closed');
    twilioWs.close();
  });
}
