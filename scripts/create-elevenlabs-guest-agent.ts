// Create ElevenLabs Guest Concierge agent (based on registration concierge)
import * as fs from 'fs';
import * as path from 'path';

const ELEVENLABS_API_KEY = 'sk_2626951f5c9cebb6b387f8ace8acb1623a2cfbf46c538ef7';

const guestPrompt = `You are Yuki, the AI concierge for The 1898 Niseko, a luxury boutique hotel in Niseko, Japan. You assist guests with their stay and provide warm, personalized service.

GUEST CONTEXT:
You have access to the guest's booking information displayed on their screen:
- Guest: Avi Osipov
- Room: Mountain View Suite (3rd Floor)
- Check-in: December 20, 2025
- Check-out: December 24, 2025
- Pet: Traveling with Shmutzi (Cat)
- Airport pickup confirmed for 3:00 PM

SCHEDULED ACTIVITIES:
- Tonight 7:00 PM: Kaiseki Dinner at Yuki Restaurant (Confirmed)
- Tomorrow 6:00 AM: Private Onsen at Rooftop Bath (Confirmed)
- Dec 21, 9:00 AM: Ski Lesson at Grand Hirafu (Pending)

HOTEL SERVICES:

Dining:
- Yuki Restaurant: Fine kaiseki dining, dinner 6-10 PM
- Room Service: Available 6 AM - 11 PM, full menu
- Breakfast: Included, 7-10 AM at Yuki Restaurant

Onsen (Hot Springs):
- Private Rooftop Onsen: Bookable in 1-hour slots
- Communal Onsen: Open 5 AM - 11 PM
- Tattoo-friendly policy

Experiences:
- Ski lessons and lift passes at Grand Hirafu
- Snowshoe forest treks
- Village cultural tours
- Airport transfers

Pet Policy:
- Pet-friendly rooms available
- Pet beds and bowls provided
- Nearby walking areas

PERSONALITY:
- Warm, gracious Japanese hospitality style
- Knowledgeable about Niseko and local culture
- Proactive in suggesting experiences
- Address the guest by name when appropriate
- Keep responses concise for voice

USING CLIENT TOOLS:
- Use show_modal for important information or confirmations
- Use show_success to confirm completed requests
- Use request_service to submit service requests
- Use end_call when the conversation is complete`;

async function createGuestAgent() {
  console.log('🏨 Creating ElevenLabs Guest Concierge agent...\n');

  const agentConfig = {
    name: 'The 1898 Niseko - Guest Concierge',
    conversation_config: {
      asr: {
        quality: 'high',
        provider: 'elevenlabs',
        user_input_audio_format: 'pcm_16000'
      },
      turn: {
        turn_timeout: 7.0,
        mode: 'turn',
        turn_eagerness: 'normal'
      },
      tts: {
        model_id: 'eleven_turbo_v2',
        voice_id: 'cjVigY5qzO86Huf0OWal', // Same voice as registration
        agent_output_audio_format: 'pcm_16000',
        optimize_streaming_latency: 3,
        stability: 0.5,
        speed: 1.0,
        similarity_boost: 0.8
      },
      conversation: {
        text_only: false,
        max_duration_seconds: 600
      },
      agent: {
        first_message: "Welcome back, Avi. I'm Yuki, your personal concierge. I can see you have a Kaiseki dinner tonight at 7 PM at Yuki Restaurant. How may I assist you with your stay?",
        language: 'en',
        prompt: {
          prompt: guestPrompt,
          llm: 'gemini-2.0-flash',
          temperature: 0.0,
          max_tokens: -1,
          tools: [
            {
              type: 'client',
              name: 'show_modal',
              description: 'Display a modal with important information for the guest',
              parameters: {
                type: 'object',
                required: ['title', 'message', 'type'],
                properties: {
                  title: { type: 'string', description: 'Modal title' },
                  message: { type: 'string', description: 'Modal message' },
                  type: { type: 'string', description: 'Modal type: success, error, info, warning' }
                }
              },
              expects_response: false
            },
            {
              type: 'client',
              name: 'show_success',
              description: 'Show a success notification to confirm an action',
              parameters: {
                type: 'object',
                required: ['message'],
                properties: {
                  message: { type: 'string', description: 'Success message' }
                }
              },
              expects_response: false
            },
            {
              type: 'client',
              name: 'request_service',
              description: 'Submit a service request (room service, housekeeping, onsen booking, etc.)',
              parameters: {
                type: 'object',
                required: ['service_type', 'details'],
                properties: {
                  service_type: {
                    type: 'string',
                    description: 'Type of service',
                    enum: ['room_service', 'housekeeping', 'onsen_booking', 'concierge', 'maintenance']
                  },
                  details: { type: 'string', description: 'Request details' },
                  priority: { type: 'string', description: 'Priority: normal, high, urgent' }
                }
              },
              expects_response: false
            },
            {
              type: 'client',
              name: 'end_call',
              description: 'End the call gracefully when conversation is complete',
              parameters: {
                type: 'object',
                required: [],
                properties: {}
              },
              expects_response: false
            }
          ]
        }
      }
    },
    platform_settings: {
      widget: {
        text_input_enabled: true,
        supports_text_only: true
      }
    }
  };

  console.log('📋 Creating agent...');

  const createResponse = await fetch('https://api.elevenlabs.io/v1/convai/agents/create', {
    method: 'POST',
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(agentConfig)
  });

  if (!createResponse.ok) {
    const error = await createResponse.text();
    throw new Error(`Failed to create agent (${createResponse.status}): ${error}`);
  }

  const agent = await createResponse.json();
  const agentId = agent.agent_id;

  console.log(`✅ Agent created: ${agentId}`);
  console.log(`   Name: The 1898 Niseko - Guest Concierge\n`);

  // Update .env.local
  const envPath = path.join(process.cwd(), '.env.local');
  let envContent = fs.readFileSync(envPath, 'utf-8');

  const envVar = 'NEXT_PUBLIC_ELEVENLABS_GUEST_AGENT_ID';
  if (envContent.includes(`${envVar}=`)) {
    envContent = envContent.replace(
      new RegExp(`${envVar}=.*`),
      `${envVar}=${agentId}`
    );
  } else {
    envContent += `\n${envVar}=${agentId}`;
  }

  fs.writeFileSync(envPath, envContent);

  console.log(`✅ Updated .env.local with ${envVar}=${agentId}`);
  console.log('\n🎉 Guest Concierge agent created!');
  console.log('\nNext steps:');
  console.log('1. Restart the app: pm2 restart ai-realtime-chat');
  console.log('2. Update guest page to use new agent ID');
  console.log('3. Test at http://localhost:4024/guest');

  return { agentId };
}

createGuestAgent().catch((err) => {
  console.error('\n❌ Failed:', err.message);
  process.exit(1);
});
