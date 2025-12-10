// Update ElevenLabs Registration Concierge agent via local API route
// This avoids API key issues by using the running app's API

const AGENT_ID = 'agent_1701k6s0xmc7e4ysqcqq5msf3yvq';
const API_URL = 'http://localhost:4024/api/elevenlabs-prompt';

const updatedPrompt = `You are Takeshi, the AI concierge for The 1898 Niseko, an exclusive boutique hotel in Hokkaido, Japan. You are helping guests register for the Grand Opening celebration.

CRITICAL: At the START of every conversation, IMMEDIATELY call the get_context tool BEFORE saying anything else. This provides:
- Current date/time in Japan (use the greeting field for time-appropriate greeting)
- Event details (the Grand Opening is TODAY - December 10, 2025)
- Registration progress

THE EVENT:
The Grand Opening is TODAY, December 10, 2025 at 4:00 PM. This is the day of the celebration!

USING THE CONTEXT:
When get_context returns, check currentDateTime.greeting to use the right greeting:
- "Good morning" if before noon
- "Good afternoon" if 12-5pm
- "Good evening" if after 5pm

PERSONALITY:
- Warm, professional, elegant
- Speak clearly and concisely (voice interface)
- Patient and accommodating
- Reflect the luxury of the property
- NEVER use honorifics like "san" with guest names

YOUR GOAL:
Help guests complete their RSVP by collecting registration information through natural conversation.

REGISTRATION INFORMATION TO COLLECT:
1. Guest name
2. Company or affiliation
3. Email address
4. Phone number
5. Partners attending? (How many guests total?)
6. Children attending? (Ages if yes)
7. Transportation needs (airport pickup, driving, other)
8. Dietary requirements or food allergies
9. Interest in overnight accommodation?
10. Any special requests or remarks?

CONVERSATION FLOW:
- Call get_context FIRST (before speaking)
- Use the appropriate greeting from context
- Reference that the event is TODAY if relevant
- Collect information naturally, 1-2 items at a time
- Confirm details back to the guest
- Keep responses brief for voice

USING CLIENT TOOLS:
- ALWAYS call get_context first to get current time and event info
- After collecting ALL information, call show_registration_summary
- When guest confirms, call registration_complete
- If guest asks about hotel, call navigate_tab with appropriate tab
- When done, call end_call

IMPORTANT:
- Don't ask for information already provided
- Summarize at the end before confirming
- Be gracious and express anticipation for meeting them at today's event`;

const tools = [
  {
    type: 'client',
    name: 'get_context',
    description: 'Get current date/time, event details, hotel information, and registration progress. ALWAYS call this at the start of the conversation to get the appropriate greeting.',
    parameters: {
      type: 'object',
      required: [],
      properties: {}
    },
    expects_response: true
  },
  {
    type: 'client',
    name: 'show_registration_summary',
    description: 'Display registration summary for guest to review',
    parameters: {
      type: 'object',
      required: ['guestName'],
      properties: {
        guestName: { type: 'string', description: "Guest's full name" },
        company: { type: 'string', description: 'Company or affiliation' },
        email: { type: 'string', description: 'Email address' },
        phone: { type: 'string', description: 'Phone number' },
        totalGuests: { type: 'number', description: 'Total number of guests' },
        children: { type: 'string', description: "Children attending (ages or 'none')" },
        transportation: { type: 'string', description: 'Transportation arrangements' },
        dietary: { type: 'string', description: 'Dietary requirements' },
        overnight: { type: 'boolean', description: 'Interested in overnight stay' },
        remarks: { type: 'string', description: 'Special requests' }
      }
    },
    expects_response: false
  },
  {
    type: 'client',
    name: 'registration_complete',
    description: 'Show success message when registration is confirmed',
    parameters: {
      type: 'object',
      required: ['guestName'],
      properties: {
        guestName: { type: 'string', description: "Guest's name for confirmation" }
      }
    },
    expects_response: false
  },
  {
    type: 'client',
    name: 'navigate_tab',
    description: 'Navigate to hotel info tab when guest asks about details',
    parameters: {
      type: 'object',
      required: ['tab'],
      properties: {
        tab: { type: 'string', description: 'Tab to navigate to', enum: ['suites', 'dining', 'location'] }
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

async function updateAgent() {
  console.log('🔄 Updating Registration Concierge agent via API route...\n');

  const updatePayload = {
    conversation_config: {
      agent: {
        first_message: "Welcome to The 1898 Niseko! I'm Takeshi, and I'd be delighted to help you register for today's Grand Opening celebration. May I start with your name?",
        prompt: {
          prompt: updatedPrompt,
          llm: 'gemini-2.0-flash',
          temperature: 0.0,
          tools
        }
      }
    }
  };

  const response = await fetch(`${API_URL}?agentId=${AGENT_ID}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updatePayload)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update agent (${response.status}): ${error}`);
  }

  const result = await response.json();

  if (result.error) {
    throw new Error(result.error);
  }

  console.log('✅ Registration agent updated with date/time context!');
  console.log('\nThe agent will now:');
  console.log('1. Call get_context at the start to get current date/time');
  console.log('2. Use the appropriate greeting (morning/afternoon/evening)');
  console.log('3. Know that the event is TODAY (December 10, 2025)');
  console.log('\nNo restart needed - the app uses the updated prompt immediately.');
}

updateAgent().catch((err) => {
  console.error('\n❌ Failed:', err.message);
  process.exit(1);
});
