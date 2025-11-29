/**
 * Create a Knowledge Base Assistant ElevenLabs agent
 * - Helps staff understand hotel SOPs and procedures
 * - Gets context about the current documentation page
 * - Professional, helpful tone for staff training
 */

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || 'sk_2626951f5c9cebb6b387f8ace8acb1623a2cfbf46c538ef7';

// Sarah - professional, clear female voice
const VOICE_ID = 'EXAVITQu4vr4xnSDxMaL';

const systemPrompt = `You are a helpful training assistant for The 1898 Niseko, a luxury boutique hotel in Hokkaido, Japan. Your role is to help hotel staff understand and apply the standard operating procedures and guidelines documented in the knowledge base.

## Your Purpose
You help staff members understand:
- Hotel policies and procedures
- Best practices for guest service
- Emergency protocols
- Operational guidelines

## How You Work
You have access to the current documentation page the staff member is viewing. When they ask questions, reference the specific content from that page to provide accurate, helpful answers.

## Conversation Style
- Be professional but warm and supportive
- Give clear, actionable guidance
- Reference specific sections from the documentation when relevant
- If asked about something not in the current document, let them know and offer to help with what IS covered
- Use examples to illustrate procedures when helpful
- Keep responses concise but thorough

## Client Tools Available
- **get_context**: Get the current documentation page content and metadata

## Examples
Staff: "What's the complaint resolution process?"
Action: Reference the specific steps from the document
Response: "According to our Guest Experience Standards, we follow the LISTEN framework: First, allow the guest to fully express their concern without interruption..."

Staff: "How much can I offer for compensation?"
Response: "Staff are empowered to offer up to ¥10,000 in compensation without manager approval for service recovery situations."`;

const clientTools = [
  {
    type: 'client' as const,
    name: 'get_context',
    description: 'Get current documentation page content and title',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    },
    expects_response: true
  }
];

async function createAgent() {
  if (!ELEVENLABS_API_KEY) {
    throw new Error('ELEVENLABS_API_KEY not set');
  }

  console.log('📚 Creating Knowledge Base Assistant agent...\n');

  const response = await fetch('https://api.elevenlabs.io/v1/convai/agents/create', {
    method: 'POST',
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: 'The 1898 Niseko - Knowledge Base Assistant',
      conversation_config: {
        agent: {
          prompt: {
            prompt: systemPrompt
          },
          first_message: "Hello! I'm here to help you understand our hotel procedures. What would you like to know about this document?",
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
    throw new Error(`Failed to create agent: ${error}`);
  }

  const result = await response.json();
  console.log('✅ Agent created successfully!');
  console.log(`   Name: ${result.name}`);
  console.log(`   Agent ID: ${result.agent_id}`);
  console.log(`   Voice: Sarah (professional, clear)`);
  console.log(`\n📝 Add this to your .env.local:`);
  console.log(`   NEXT_PUBLIC_ELEVENLABS_KB_AGENT_ID=${result.agent_id}`);
}

createAgent().catch(console.error);
