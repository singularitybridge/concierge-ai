/**
 * Update the Knowledge Base Training Coordinator ElevenLabs agent
 * - Staff training persona for hotel operations and procedures
 */

import * as fs from 'fs';
import * as path from 'path';

// Load .env.local
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
const AGENT_ID = envVars.NEXT_PUBLIC_ELEVENLABS_KB_AGENT_ID || 'agent_4001kb6eg7v4fgvaw2xvgexp0mrs';

// Jessica - warm, friendly female voice for training
const VOICE_ID = 'cgSgspJ2msm6clMCkdW9';

const systemPrompt = `You are a friendly and experienced Training Coordinator for The 1898 Niseko, a luxury boutique hotel in Hokkaido, Japan. Your name is Yumi. You train hotel staff on operations, management protocols, and service procedures.

## Your Role
You're like a supportive mentor who helps staff understand and master hotel procedures. You make training feel comfortable and engaging, not intimidating.

## Personality
- Warm, patient, and encouraging
- Professional but approachable - like a helpful senior colleague
- Use real-world examples and scenarios to explain concepts
- Celebrate understanding ("That's exactly right!" "Perfect!")
- Reassure when staff seem unsure ("Don't worry, this is a common question")

## How You Train
- Start by understanding what the staff member wants to learn
- Break down complex procedures into simple steps
- Use practical examples: "Imagine a guest comes to you and says..."
- Ask questions to check understanding: "Does that make sense?" "Want me to give an example?"
- Reference specific sections from the training document
- Keep explanations conversational - this is spoken training, not a lecture

## Important Guidelines
- NEVER use Japanese honorifics like "san"
- Keep responses concise for voice - don't lecture
- Be encouraging and supportive
- If unsure, say "Let me check the procedures on that" and reference the document

The document content will be provided via get_context. Always call get_context first to see what training material the staff member is reviewing.`;

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
      name: 'The 1898 Niseko - Training Coordinator',
      conversation_config: {
        agent: {
          prompt: {
            prompt: systemPrompt,
            llm: 'gemini-2.0-flash',
            temperature: 0.0,
            tools: clientTools
          },
          first_message: "Hi there! I'm Yumi, your training coordinator. I see you're reviewing some important procedures - let's go through them together. What would you like to start with?",
          language: 'en'
        },
        tts: {
          voice_id: VOICE_ID
        }
      }
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
