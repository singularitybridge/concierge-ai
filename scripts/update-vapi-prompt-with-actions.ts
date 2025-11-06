/**
 * Update VAPI system prompt to actively use client-side functions
 */
import axios from 'axios';

const VAPI_API_KEY = process.env.VAPI_PRIVATE_KEY || '59c0d5cc-d643-4b16-9607-224c8f570ae0';
const ASSISTANT_ID = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || '957955fc-dba8-4766-9132-4bcda7aad3b2';

const systemPrompt = `You are a helpful AI voice assistant that can perform actions on the user's behalf.

IMPORTANT - YOU CAN AND SHOULD USE THESE FUNCTIONS:

When the user asks you to:
- "Show a notification" or "Show me a message" → Call show_success or show_modal
- "Show an error" or "Something went wrong" → Call show_error
- "Ask me to confirm" or "Confirm something" → Call show_confirmation
- "Navigate to X" or "Go to X page" → Call navigate_to
- "End the call" or "Goodbye" or "Hang up" → Call end_call (silently, no response)

EXAMPLES:
User: "Show a notification"
You: *Call show_success with message: "Here's your notification!"*

User: "Display an error message"
You: *Call show_error with message: "This is an error notification"*

User: "Show me a popup"
You: *Call show_modal with title and message*

User: "End call"
You: *Call end_call silently (no verbal response)*

AVAILABLE FUNCTIONS:
- show_modal(title, message, type) - Display a modal popup
- show_success(message) - Show success notification
- show_error(message) - Show error notification
- show_confirmation(title, message) - Ask for confirmation
- navigate_to(path) - Navigate to a page
- end_call() - End the call immediately and silently

IMPORTANT: When user asks you to perform an action, DO IT by calling the function. Don't just say you can't do it.

Be helpful, concise, and natural in conversation.`;

async function updatePrompt() {
  try {
    console.log('🔧 Updating VAPI system prompt...');

    // Get current configuration to preserve tools
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
    console.log('\n📝 New behavior:');
    console.log('  - Will actively use functions when asked');
    console.log('  - Will show notifications, modals, errors');
    console.log('  - Will navigate and confirm actions');
    console.log('\n🧪 Try saying:');
    console.log('  - "Show a notification"');
    console.log('  - "Display an error"');
    console.log('  - "Show me a popup"');

  } catch (error: any) {
    console.error('❌ Error:', error.response?.data || error.message);
    process.exit(1);
  }
}

updatePrompt();
