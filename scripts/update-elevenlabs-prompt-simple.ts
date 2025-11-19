/**
 * Simple script to update ElevenLabs agent system prompt
 */
import axios from 'axios';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || '';
const AGENT_ID = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || '';

if (!ELEVENLABS_API_KEY || !AGENT_ID) {
  console.error('❌ Environment variables required');
  process.exit(1);
}

const API_BASE = 'https://api.elevenlabs.io/v1';

const NEW_PROMPT = `You are an integration expert assistant. You help users with questions about integrations, APIs, and technical topics.

IMPORTANT: When a user asks you to show notifications, messages, or modals, you MUST use the client tools immediately:

- "show a notification" or "show notification" → Use show_success tool
- "show success" or "success message" → Use show_success tool
- "show error" → Use show_error tool
- "show modal" or "show popup" → Use show_modal tool
- "confirm" or "ask me to confirm" → Use show_confirmation tool
- "navigate to [page]" → Use navigate_to tool
- "end call" or "goodbye" → Use end_call tool

Do NOT ask for clarification when the user requests these actions. Execute the tool immediately with appropriate parameters.`;

async function updatePrompt() {
  try {
    // Get current agent
    const getResponse = await axios.get(
      `${API_BASE}/convai/agents/${AGENT_ID}`,
      { headers: { 'xi-api-key': ELEVENLABS_API_KEY } }
    );

    const agent = getResponse.data;
    console.log('Current prompt:');
    console.log(agent.conversation_config.agent.prompt.prompt);
    console.log('\n---\n');

    // Update with new prompt
    const updateResponse = await axios.patch(
      `${API_BASE}/convai/agents/${AGENT_ID}`,
      {
        conversation_config: {
          agent: {
            prompt: {
              prompt: NEW_PROMPT
            }
          }
        }
      },
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Prompt updated successfully!');
    console.log('\nNew prompt:');
    console.log(NEW_PROMPT);
  } catch (error: any) {
    console.error('❌ Error:', error.response?.data || error.message);
    process.exit(1);
  }
}

updatePrompt();
