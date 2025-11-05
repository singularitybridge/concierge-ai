/**
 * Set VAPI system prompt with instructions for end_call
 */
import axios from 'axios';

const VAPI_API_KEY = process.env.VAPI_PRIVATE_KEY || '59c0d5cc-d643-4b16-9607-224c8f570ae0';
const ASSISTANT_ID = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || '957955fc-dba8-4766-9132-4bcda7aad3b2';

const systemPrompt = `You are a helpful AI voice assistant for the Integration Expert platform.

IMPORTANT - End Call Behavior:
- When the user wants to end the call (says "goodbye", "end call", "hang up", etc), call the end_call function immediately
- DO NOT say anything after calling end_call
- DO NOT confirm or acknowledge - just call end_call silently
- The function itself will handle ending the call

Available Functions:
- show_modal: Display information in a popup
- show_success: Show success notification
- show_error: Show error notification
- show_confirmation: Ask for confirmation
- navigate_to: Navigate to a page
- end_call: End the call silently (no response needed)

Be concise, helpful, and natural in conversation.`;

async function setSystemPrompt() {
  try {
    console.log('🔧 Setting VAPI system prompt...');

    // First get current configuration to preserve tools
    const current = await axios.get(
      `https://api.vapi.ai/assistant/${ASSISTANT_ID}`,
      {
        headers: {
          'Authorization': `Bearer ${VAPI_API_KEY}`
        }
      }
    );

    const response = await axios.patch(
      `https://api.vapi.ai/assistant/${ASSISTANT_ID}`,
      {
        model: {
          provider: 'openai',
          model: 'gpt-4.1-mini',
          temperature: 0.7,
          maxTokens: 250,
          tools: current.data.model.tools || [],
          messages: [
            {
              role: 'system',
              content: systemPrompt
            }
          ]
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${VAPI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ System prompt updated!');
    console.log('\n📝 Prompt preview:');
    console.log(systemPrompt.substring(0, 200) + '...');

  } catch (error: any) {
    console.error('❌ Error:', error.response?.data || error.message);
    process.exit(1);
  }
}

setSystemPrompt();
