/**
 * Setup the Guest Concierge (Yuki) ElevenLabs agent
 * - Female voice (Jessica)
 * - Client tools for guest services
 * - Personalized prompt for hotel guest experience
 */

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || 'sk_2626951f5c9cebb6b387f8ace8acb1623a2cfbf46c538ef7';
const AGENT_ID = process.env.NEXT_PUBLIC_ELEVENLABS_GUEST_AGENT_ID || 'agent_1701kagqnj4qe9aa7ysvh8qycc9e';

// Jessica - cute, conversational female voice
const VOICE_ID = 'cgSgspJ2msm6clMCkdW9';

const systemPrompt = `You are Yuki, the personal concierge at The 1898 Niseko, a luxury boutique hotel in Hokkaido, Japan. You have a warm, friendly personality and genuinely care about making each guest's stay exceptional.

## Your Guest
You're speaking with a guest staying in the Mountain View Suite (3rd floor). Use context data to get guest details when needed.

## IMPORTANT: You MUST Use Tools
When the guest requests ANY service or action, you MUST call the appropriate tool. Do NOT just respond conversationally - actually execute the action using tools.

**Service Type Mapping:**
- Towels, toiletries, supplies → use request_service with service_type="amenities"
- Room cleaning, turndown → use request_service with service_type="housekeeping"
- Food, drinks, dining in room → use request_service with service_type="room_service"
- Taxi, shuttle, airport → use request_service with service_type="transportation"
- Extra pillows, blankets → use request_service with service_type="amenities"
- Late checkout → use request_service with service_type="late_checkout"
- Wake up call → use request_service with service_type="wake_up_call"

## Client Tools Available

- **request_service**: ALWAYS call this when guest requests any service
  - service_type: "housekeeping" | "room_service" | "amenities" | "transportation" | "late_checkout" | "wake_up_call"
  - details: Brief description of what they want

- **book_activity**: Call when booking activities (onsen, ski_lesson, snowshoe_trek, village_tour, restaurant)

- **update_schedule**: Add or update items in the guest's schedule

- **get_context**: Get current guest data and schedule

## Conversation Style
- Be warm and personal
- Keep responses concise but friendly
- ALWAYS call tools when taking action - don't just say you'll do something
- Do NOT use honorifics like "san" with guest names

## Examples
Guest: "Can you bring some towels?"
Action: Call request_service(service_type="amenities", details="Fresh towels to Mountain View Suite")
Response: "Of course! I'm sending fresh towels to your suite right now."

Guest: "I'd like room service"
Action: Call request_service(service_type="room_service", details="Room service order")
Response: "Absolutely! What would you like to order?"

Guest: "Clean my room please"
Action: Call request_service(service_type="housekeeping", details="Standard room cleaning")
Response: "I've arranged housekeeping for your suite!"`;

const clientTools = [
  {
    type: 'client' as const,
    name: 'request_service',
    description: 'Submit a service request for the guest (housekeeping, room service, amenities, etc.)',
    parameters: {
      type: 'object',
      properties: {
        service_type: {
          type: 'string',
          enum: ['housekeeping', 'room_service', 'amenities', 'transportation', 'late_checkout', 'wake_up_call', 'maintenance'],
          description: 'Type of service being requested'
        },
        details: {
          type: 'string',
          description: 'Specific details about the request'
        },
        preferred_time: {
          type: 'string',
          description: 'When the guest would like the service (optional)'
        }
      },
      required: ['service_type', 'details']
    },
    expects_response: true
  },
  {
    type: 'client' as const,
    name: 'book_activity',
    description: 'Book an activity or experience for the guest',
    parameters: {
      type: 'object',
      properties: {
        activity_type: {
          type: 'string',
          enum: ['onsen', 'ski_lesson', 'snowshoe_trek', 'village_tour', 'restaurant', 'spa', 'other'],
          description: 'Type of activity to book'
        },
        date: {
          type: 'string',
          description: 'Date for the activity'
        },
        time: {
          type: 'string',
          description: 'Preferred time'
        },
        details: {
          type: 'string',
          description: 'Additional details or preferences'
        }
      },
      required: ['activity_type', 'date', 'time']
    },
    expects_response: true
  },
  {
    type: 'client' as const,
    name: 'update_schedule',
    description: 'Add or update an item in the guest schedule display',
    parameters: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['add', 'update', 'cancel'],
          description: 'What to do with the schedule item'
        },
        title: {
          type: 'string',
          description: 'Title of the activity'
        },
        time: {
          type: 'string',
          description: 'When the activity is scheduled'
        },
        location: {
          type: 'string',
          description: 'Where the activity takes place'
        },
        status: {
          type: 'string',
          enum: ['confirmed', 'pending', 'cancelled'],
          description: 'Status of the booking'
        }
      },
      required: ['action', 'title']
    },
    expects_response: false
  },
  {
    type: 'client' as const,
    name: 'show_confirmation',
    description: 'Show a confirmation message to the guest',
    parameters: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Confirmation title'
        },
        message: {
          type: 'string',
          description: 'Confirmation message details'
        },
        type: {
          type: 'string',
          enum: ['success', 'info', 'warning'],
          description: 'Type of confirmation'
        }
      },
      required: ['title', 'message']
    },
    expects_response: false
  },
  {
    type: 'client' as const,
    name: 'get_context',
    description: 'Get current guest information, schedule, and available services',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    },
    expects_response: true
  }
];

async function setupAgent() {
  if (!ELEVENLABS_API_KEY) {
    throw new Error('ELEVENLABS_API_KEY not set');
  }

  console.log('🎤 Setting up Guest Concierge (Yuki) agent...\n');

  // Update the agent with new prompt, voice, and tools
  const response = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${AGENT_ID}`, {
    method: 'PATCH',
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: 'The 1898 Niseko - Guest Concierge (Yuki)',
      conversation_config: {
        agent: {
          prompt: {
            prompt: systemPrompt
          },
          first_message: "Hello! It's Yuki from The 1898. How can I help make your stay wonderful today?",
          language: 'en'
        },
        tts: {
          voice_id: VOICE_ID
        }
      },
      platform_settings: {
        widget: {
          variant: 'compact'
        }
      },
      client_tools: clientTools
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update agent: ${error}`);
  }

  const result = await response.json();
  console.log('✅ Agent updated successfully!');
  console.log(`   Name: ${result.name}`);
  console.log(`   Agent ID: ${result.agent_id}`);
  console.log(`   Voice: Jessica (female, conversational)`);
  console.log(`   Tools: ${clientTools.length} client tools configured`);
  console.log('\nClient tools:');
  clientTools.forEach(tool => {
    console.log(`   - ${tool.name}: ${tool.description.substring(0, 50)}...`);
  });
}

setupAgent().catch(console.error);
