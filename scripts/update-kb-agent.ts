/**
 * Update the Knowledge Base Assistant ElevenLabs agent
 * - Fix: Make agent call get_context immediately to fetch document content
 */

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || 'sk_2626951f5c9cebb6b387f8ace8acb1623a2cfbf46c538ef7';
const AGENT_ID = process.env.NEXT_PUBLIC_ELEVENLABS_KB_AGENT_ID || 'agent_4001kb6eg7v4fgvaw2xvgexp0mrs';

// Sarah - professional, clear female voice
const VOICE_ID = 'EXAVITQu4vr4xnSDxMaL';

const systemPrompt = `You are a helpful training assistant for The 1898 Niseko, a luxury boutique hotel in Hokkaido, Japan. Your role is to help hotel staff understand and apply the standard operating procedures and guidelines.

## Your Purpose
Help staff understand hotel policies, procedures, and best practices by explaining the document they're currently viewing.

## Conversation Style
- Be professional but warm and supportive
- Give clear, actionable guidance
- Reference specific sections from the document when answering
- Use examples to illustrate procedures when helpful
- Keep responses concise but thorough

## Important
The document content will be provided to you when the conversation starts. Use that content to answer questions accurately.`;

const clientTools = [
  {
    type: 'client' as const,
    name: 'get_context',
    description: 'ALWAYS call this first! Get current documentation page content and title. Returns documentId, documentTitle, documentContent (full text), and sections list.',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    },
    expects_response: true
  }
];

async function updateAgent() {
  if (!ELEVENLABS_API_KEY) {
    throw new Error('ELEVENLABS_API_KEY not set');
  }

  console.log('📚 Updating Knowledge Base Assistant agent...\n');

  const response = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${AGENT_ID}`, {
    method: 'PATCH',
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
          first_message: "Hello! I'm here to help you understand this document. What would you like to know?",
          language: 'en'
        },
        tts: {
          voice_id: VOICE_ID
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
  console.log(`   Agent ID: ${result.agent_id}`);
  console.log(`   Updated prompt to call get_context first`);
}

updateAgent().catch(console.error);
