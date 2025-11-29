/**
 * Create the Guest Services ElevenLabs agent for hotel staff
 * This agent helps manage guests, arrivals, and service requests
 */

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || 'sk_2626951f5c9cebb6b387f8ace8acb1623a2cfbf46c538ef7';

const systemPrompt = `You are a Guest Services Assistant for The 1898 Niseko, a luxury boutique hotel in Hokkaido, Japan. Your role is to help hotel staff manage guests, check arrivals, and handle service requests.

## Your Capabilities
You have access to real-time data about:
- Current in-house guests
- Today's arrivals and departures
- Active service requests
- Guest profiles and preferences

## Available Tools
Use these tools to help staff:
- **get_context**: Fetch current guest data, arrivals, and requests
- **show_guest_card**: Display detailed guest information in a modal
- **show_request_card**: Display service request details
- **close_modal**: Close any open modal/card
- **filter_view**: Switch between Guests, Arrivals, or Requests tabs
- **send_message**: Send a message to a guest (SMS/email)
- **offer_pickup**: Offer airport pickup service to a guest
- **add_guest_note**: Add a note to a guest's profile
- **update_request_status**: Update service request status (pending, in-progress, completed)

## Behavior Guidelines
1. When asked about a specific guest (e.g., "Did the Tanaka family arrive?"), use show_guest_card to display their details
2. Always use tools immediately - don't ask for confirmation
3. After showing a guest card, briefly summarize key info verbally
4. Keep responses concise and professional
5. When closing modals, just say "Done" or acknowledge briefly
6. For service actions (messages, pickup offers), confirm the action was taken

## Context
The data will be provided when the conversation starts. Reference it to answer questions about guests, arrivals, and requests.

## Example Interactions
- "Did the Tanaka family arrive?" → show_guest_card for Tanaka, summarize arrival status
- "Show me pending requests" → filter_view to requests, list them verbally
- "Send a welcome message to Dr. Yamamoto" → send_message tool, confirm sent
- "Offer pickup to Mr. Chen" → offer_pickup tool, confirm offered
- "Add a note that Mrs. Sato prefers green tea" → add_guest_note tool, confirm added
- "Close this" → close_modal tool`;

const tools = [
  {
    type: 'client',
    name: 'get_context',
    description: 'Get current guest data including in-house guests, arrivals, departures, and service requests',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    },
    expects_response: true
  },
  {
    type: 'client',
    name: 'show_guest_card',
    description: 'Display a guest\'s detailed profile card. Use when asked about a specific guest or family.',
    parameters: {
      type: 'object',
      properties: {
        guestId: {
          type: 'string',
          description: 'The ID or name of the guest to show (e.g., "tanaka", "chen", "yamamoto")'
        }
      },
      required: ['guestId']
    },
    expects_response: true
  },
  {
    type: 'client',
    name: 'show_request_card',
    description: 'Display a service request\'s details.',
    parameters: {
      type: 'object',
      properties: {
        requestId: {
          type: 'string',
          description: 'The ID of the request to show'
        }
      },
      required: ['requestId']
    },
    expects_response: true
  },
  {
    type: 'client',
    name: 'close_modal',
    description: 'Close any open modal, card, or popup',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    },
    expects_response: false
  },
  {
    type: 'client',
    name: 'filter_view',
    description: 'Switch the view to show a specific tab: guests, arrivals, or requests',
    parameters: {
      type: 'object',
      properties: {
        view: {
          type: 'string',
          description: 'The view to show',
          enum: ['guests', 'arrivals', 'requests']
        }
      },
      required: ['view']
    },
    expects_response: true
  },
  {
    type: 'client',
    name: 'send_message',
    description: 'Send a message to a guest via SMS or email. Use for welcome messages, confirmations, or notifications.',
    parameters: {
      type: 'object',
      properties: {
        guestId: {
          type: 'string',
          description: 'The ID or name of the guest'
        },
        message: {
          type: 'string',
          description: 'The message to send'
        },
        channel: {
          type: 'string',
          description: 'How to send: sms, email, or both',
          enum: ['sms', 'email', 'both']
        }
      },
      required: ['guestId', 'message']
    },
    expects_response: true
  },
  {
    type: 'client',
    name: 'offer_pickup',
    description: 'Offer airport pickup or transportation service to a guest',
    parameters: {
      type: 'object',
      properties: {
        guestId: {
          type: 'string',
          description: 'The ID or name of the guest'
        },
        pickupType: {
          type: 'string',
          description: 'Type of pickup: airport, station, or custom location',
          enum: ['airport', 'station', 'custom']
        },
        scheduledTime: {
          type: 'string',
          description: 'Suggested pickup time (optional)'
        }
      },
      required: ['guestId']
    },
    expects_response: true
  },
  {
    type: 'client',
    name: 'add_guest_note',
    description: 'Add a note or comment to a guest\'s profile for future reference',
    parameters: {
      type: 'object',
      properties: {
        guestId: {
          type: 'string',
          description: 'The ID or name of the guest'
        },
        note: {
          type: 'string',
          description: 'The note to add to their profile'
        },
        category: {
          type: 'string',
          description: 'Category of note: preference, request, issue, general',
          enum: ['preference', 'request', 'issue', 'general']
        }
      },
      required: ['guestId', 'note']
    },
    expects_response: true
  },
  {
    type: 'client',
    name: 'update_request_status',
    description: 'Update the status of a service request',
    parameters: {
      type: 'object',
      properties: {
        requestId: {
          type: 'string',
          description: 'The ID of the request to update'
        },
        status: {
          type: 'string',
          description: 'New status for the request',
          enum: ['pending', 'in-progress', 'completed']
        },
        note: {
          type: 'string',
          description: 'Optional note about the status change'
        }
      },
      required: ['requestId', 'status']
    },
    expects_response: true
  }
];

const agentConfig = {
  name: 'The 1898 Niseko - Guest Services',
  conversation_config: {
    asr: {
      quality: 'high',
      provider: 'elevenlabs',
      user_input_audio_format: 'pcm_16000'
    },
    turn: {
      turn_timeout: 7.0,
      mode: 'turn'
    },
    tts: {
      model_id: 'eleven_turbo_v2',
      voice_id: 'pFZP5JQG7iQjIQuC4Bku', // Lily - professional female voice
      stability: 0.5,
      speed: 1.0,
      similarity_boost: 0.8
    },
    conversation: {
      max_duration_seconds: 600
    },
    agent: {
      first_message: "Hello! I'm your Guest Services assistant. I can help you check on guests, view arrivals, or manage service requests. What would you like to know?",
      language: 'en',
      prompt: {
        prompt: systemPrompt,
        llm: 'gemini-2.0-flash',
        temperature: 0.0,
        tools: tools
      }
    }
  }
};

async function createAgent() {
  if (!ELEVENLABS_API_KEY) {
    throw new Error('ELEVENLABS_API_KEY not set');
  }

  console.log('🏨 Creating Guest Services ElevenLabs agent...\n');

  const response = await fetch('https://api.elevenlabs.io/v1/convai/agents/create', {
    method: 'POST',
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(agentConfig)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create agent: ${error}`);
  }

  const result = await response.json();
  console.log('✅ Guest Services Agent created!');
  console.log(`   Agent ID: ${result.agent_id}`);
  console.log(`   Name: ${agentConfig.name}`);
  console.log(`   Voice: Lily (professional female)`);
  console.log(`   Tools: ${tools.map(t => t.name).join(', ')}`);
  console.log('\n📝 Add to .env.local:');
  console.log(`   NEXT_PUBLIC_ELEVENLABS_GUESTSERVICES_AGENT_ID=${result.agent_id}`);

  return result.agent_id;
}

createAgent().catch(console.error);
