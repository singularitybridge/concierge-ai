// Update ElevenLabs Guest Concierge agent with get_context tool

const ELEVENLABS_API_KEY = 'sk_2626951f5c9cebb6b387f8ace8acb1623a2cfbf46c538ef7';
const AGENT_ID = 'agent_1701kagqnj4qe9aa7ysvh8qycc9e';

const updatedPrompt = `You are Yuki, the AI concierge for The 1898 Niseko, a luxury boutique hotel in Niseko, Japan.

IMPORTANT: At the start of every conversation, call the get_context tool to retrieve the current guest's booking information, activities, and available services. This ensures you have accurate, up-to-date information about the guest.

PERSONALITY:
- Warm, gracious Japanese hospitality style
- Knowledgeable about Niseko and local culture
- Proactive in suggesting experiences
- Address the guest by name when appropriate
- Keep responses concise for voice

HOTEL SERVICES:

Dining:
- Yuki Restaurant: Fine kaiseki dining, dinner 6-10 PM
- Room Service: Available 6 AM - 11 PM
- Breakfast: Included, 7-10 AM

Onsen (Hot Springs):
- Private Rooftop Onsen: Bookable in 1-hour slots
- Communal Onsen: Open 5 AM - 11 PM
- Tattoo-friendly policy

Experiences:
- Ski lessons at Grand Hirafu
- Snowshoe forest treks
- Village cultural tours
- Airport transfers

USING CLIENT TOOLS:
- ALWAYS call get_context first to get guest information
- Use show_modal for important information
- Use show_success to confirm requests
- Use request_service to submit service requests (room_service, housekeeping, onsen_booking, concierge, maintenance)
- Use end_call when conversation is complete`;

async function updateAgent() {
  console.log('🔄 Updating Guest Concierge agent...\n');

  const tools = [
    {
      type: 'client',
      name: 'get_context',
      description: 'Get the current guest context including booking details, scheduled activities, and available services. ALWAYS call this at the start of the conversation.',
      parameters: {
        type: 'object',
        required: [],
        properties: {}
      },
      expects_response: false
    },
    {
      type: 'client',
      name: 'show_modal',
      description: 'Display a modal with important information',
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
      description: 'Show a success notification',
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
      description: 'Submit a hotel service request',
      parameters: {
        type: 'object',
        required: ['service_type', 'details'],
        properties: {
          service_type: {
            type: 'string',
            description: 'Service type',
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
      description: 'End the call gracefully',
      parameters: {
        type: 'object',
        required: [],
        properties: {}
      },
      expects_response: false
    }
  ];

  const updatePayload = {
    conversation_config: {
      agent: {
        first_message: "Welcome to The 1898 Niseko. I'm Yuki, your personal concierge. Let me check your booking details...",
        prompt: {
          prompt: updatedPrompt,
          llm: 'gemini-2.0-flash',
          temperature: 0.0,
          tools
        }
      }
    }
  };

  const response = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${AGENT_ID}`, {
    method: 'PATCH',
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updatePayload)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update agent (${response.status}): ${error}`);
  }

  console.log('✅ Agent updated with get_context tool!');
  console.log('\nThe agent will now:');
  console.log('1. Call get_context at the start of each conversation');
  console.log('2. Have access to real guest data from the page');
  console.log('3. Use request_service for service requests');
  console.log('\nRestart the app: pm2 restart ai-realtime-chat');
}

updateAgent().catch((err) => {
  console.error('\n❌ Failed:', err.message);
  process.exit(1);
});
