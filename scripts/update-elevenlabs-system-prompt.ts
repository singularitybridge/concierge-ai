/**
 * Update ElevenLabs Agent System Prompt to Include Client Tools Instructions
 */
import axios from 'axios';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || '';
const AGENT_ID = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || '';

if (!ELEVENLABS_API_KEY) {
  console.error('❌ ELEVENLABS_API_KEY environment variable is required');
  process.exit(1);
}

if (!AGENT_ID) {
  console.error('❌ NEXT_PUBLIC_ELEVENLABS_AGENT_ID environment variable is required');
  process.exit(1);
}

const API_BASE = 'https://api.elevenlabs.io/v1';

async function getAgent() {
  try {
    const response = await axios.get(
      `${API_BASE}/convai/agents/${AGENT_ID}`,
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY
        }
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching agent:', error.response?.data || error.message);
    throw error;
  }
}

async function updateAgentPrompt(newPrompt: string) {
  try {
    const agent = await getAgent();

    const response = await axios.patch(
      `${API_BASE}/convai/agents/${AGENT_ID}`,
      {
        prompt: {
          ...agent.prompt,
          prompt: newPrompt
        }
      },
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Updated agent system prompt');
    return response.data;
  } catch (error: any) {
    console.error('❌ Error updating agent prompt:', error.response?.data || error.message);
    throw error;
  }
}

async function main() {
  console.log('🔧 Fetching current agent configuration...\n');

  const agent = await getAgent();

  console.log('📝 Agent structure:');
  console.log(JSON.stringify(agent, null, 2));
  console.log('\n');

  console.log('📝 Current system prompt:');
  console.log('---');
  console.log(agent.prompt?.prompt || agent.prompt || '(no prompt set)');
  console.log('---\n');

  const newPrompt = `You are an integration expert assistant. You help users with questions about integrations, APIs, and technical topics.

When a user requests to show a notification, success message, error message, modal, or confirmation dialog, use the appropriate client tool:

- Use "show_success" tool when the user asks to show a notification, success message, or confirmation of completion
- Use "show_error" tool when the user asks to show an error or problem
- Use "show_modal" tool when the user asks to show a popup or modal with custom title and message
- Use "show_confirmation" tool when the user needs to confirm an action
- Use "navigate_to" tool when the user asks to go to a different page
- Use "end_call" tool when the user says goodbye or asks to end the call

Examples:
- "Show a notification" → Use show_success tool with message parameter
- "Show me an error" → Use show_error tool with message parameter
- "Show a popup" → Use show_modal tool with title and message parameters
- "End the call" → Use end_call tool

Be direct and use the tools immediately when requested instead of asking for clarification.`;

  console.log('🔧 Updating system prompt with client tools instructions...\n');

  await updateAgentPrompt(newPrompt);

  console.log('\n✅ System prompt updated!');
  console.log('\n📝 Next steps:');
  console.log('1. Start a new ElevenLabs voice call');
  console.log('2. Say: "Show a notification" to test');
  console.log('3. Check console for: 🔧 ElevenLabs client tool: show_success');
}

main().catch((error) => {
  console.error('❌ Update failed:', error);
  process.exit(1);
});
