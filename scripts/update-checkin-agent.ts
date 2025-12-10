/**
 * Update ElevenLabs Check-In Concierge Agent
 * - Regular hotel check-in flow (not event registration)
 * - Updates guest details in real-time via update_registration_field
 */

import * as fs from 'fs';
import * as path from 'path';

// Load .env.local manually
const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars: Record<string, string> = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const ELEVENLABS_API_KEY = envVars.ELEVENLABS_API_KEY;
const AGENT_ID = envVars.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || 'agent_1701k6s0xmc7e4ysqcqq5msf3yvq';

const systemPrompt = `You are Takeshi (健), the AI check-in concierge for The 1898 Niseko, an exclusive boutique hotel in Hokkaido, Japan.

CRITICAL: At the START of every conversation, IMMEDIATELY call the get_context tool to get:
- Current date/time in Japan (use the greeting field)
- Hotel information
- Current check-in progress
- Selected language (en, zh, or ja)

MULTI-LANGUAGE SUPPORT:
When get_context returns, check the "language" field:
- "en" = English: Respond in fluent, warm English
- "zh" = Chinese (Mandarin): Respond in fluent Mandarin Chinese (简体中文)
- "ja" = Japanese: Respond in fluent, polite Japanese (日本語)

ALWAYS respond in the language specified by the context. Match the formality and cultural nuances appropriate to each language.

USING THE CONTEXT:
When get_context returns, use currentDateTime.greeting for time-appropriate greeting in the appropriate language.

PERSONALITY:
- Warm, professional, elegant
- Speak clearly and concisely (voice interface)
- Patient and accommodating
- Reflect the luxury of the property
- For English: NEVER use honorifics like "san" with guest names
- For Japanese: Use appropriate honorifics (様/さん) as culturally expected
- For Chinese: Use respectful forms of address

YOUR GOAL:
Help guests complete their hotel check-in by collecting information through natural conversation in their preferred language.

CHECK-IN INFORMATION TO COLLECT:
1. Guest name - call update_registration_field with field="name"
2. Email address - call update_registration_field with field="email"
3. Phone number - call update_registration_field with field="phone"
4. Number of guests - call update_registration_field with field="partySize"
5. Arrival date - call update_registration_field with field="arrivalDate"
6. Departure date - call update_registration_field with field="departureDate"
7. Room preference - call update_registration_field with field="roomPreference"
8. Transportation needs - call update_registration_field with field="transportation"
9. Dietary requirements - call update_registration_field with field="dietary"
10. Special requests - call update_registration_field with field="remarks"

CRITICAL TOOL USAGE:
- Call get_context FIRST (before speaking)
- EVERY TIME the guest provides information, IMMEDIATELY call update_registration_field with the field name and value
- The UI updates in real-time when you call update_registration_field
- After collecting ALL information, call registration_complete
- If guest asks about hotel amenities, call navigate_tab with suites, dining, or location
- When done, call end_call

FIELD NAMES (use exactly these):
- name, email, phone, partySize, arrivalDate, departureDate, roomPreference, transportation, dietary, remarks

EXAMPLE:
Guest: "My name is John Smith"
You: [Call update_registration_field with field="name", value="John Smith"]
You: "Wonderful, thank you John. And what email address should we use for your confirmation?"

CONVERSATION FLOW:
- Keep responses brief for voice
- Collect 1-2 items at a time
- Confirm details back to the guest
- Don't ask for information already provided`;

const tools = [
  {
    type: 'client',
    name: 'get_context',
    description: 'Get current date/time, hotel info, and check-in progress. ALWAYS call this at the start.',
    parameters: {
      type: 'object',
      required: [],
      properties: {}
    },
    expects_response: true
  },
  {
    type: 'client',
    name: 'update_registration_field',
    description: 'Update a guest check-in field in real-time. Call this IMMEDIATELY when the guest provides any information. Fields: name, email, phone, partySize, arrivalDate, departureDate, roomPreference, transportation, dietary, remarks',
    parameters: {
      type: 'object',
      required: ['field', 'value'],
      properties: {
        field: {
          type: 'string',
          description: 'The field to update. Must be one of: name, email, phone, partySize, arrivalDate, departureDate, roomPreference, transportation, dietary, remarks',
          enum: ['name', 'email', 'phone', 'partySize', 'arrivalDate', 'departureDate', 'roomPreference', 'transportation', 'dietary', 'remarks']
        },
        value: {
          type: 'string',
          description: 'The value to set for the field'
        }
      }
    },
    expects_response: false
  },
  {
    type: 'client',
    name: 'registration_complete',
    description: 'Mark check-in as complete. Call after all information collected and confirmed.',
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
    description: 'Show hotel info when guest asks about suites, dining, or location',
    parameters: {
      type: 'object',
      required: ['tab'],
      properties: {
        tab: { type: 'string', description: 'Tab to show', enum: ['suites', 'dining', 'location'] }
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
  if (!ELEVENLABS_API_KEY) {
    throw new Error('ELEVENLABS_API_KEY not set in .env.local');
  }

  console.log('🏨 Updating Check-In Concierge agent...\n');
  console.log(`   Agent ID: ${AGENT_ID}`);
  console.log(`   API Key: ${ELEVENLABS_API_KEY.substring(0, 10)}...`);

  const updatePayload = {
    name: 'The 1898 Niseko - Check-In Concierge',
    conversation_config: {
      agent: {
        first_message: "Welcome to The 1898 Niseko! I'm Takeshi, your check-in concierge. I'd be delighted to assist with your arrival today. May I have your name please?",
        language: 'en',
        prompt: {
          prompt: systemPrompt,
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

  const result = await response.json();
  console.log('\n✅ Check-In Concierge agent updated!');
  console.log(`   Agent ID: ${result.agent_id}`);
  console.log('\nThe agent now has these tools:');
  tools.forEach(tool => console.log(`   - ${tool.name}`));
  console.log('\n📝 Key tool: update_registration_field');
  console.log('   This updates the UI in real-time as guest provides info');
}

updateAgent().catch((err) => {
  console.error('\n❌ Failed:', err.message);
  process.exit(1);
});
