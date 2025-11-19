/**
 * Fix VAPI tools to enable client-side execution
 * Tools need async: true for client-side function calls
 */
import axios from 'axios';

const VAPI_API_KEY = process.env.VAPI_PRIVATE_KEY || '59c0d5cc-d643-4b16-9607-224c8f570ae0';
const ASSISTANT_ID = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || '957955fc-dba8-4766-9132-4bcda7aad3b2';

const tools = [
  {
    type: 'function',
    async: true, // ✅ Enable client-side execution
    function: {
      name: 'show_modal',
      description: 'Show a modal/popup on the screen with a title and message. Use this when you want to display information to the user in a prominent way.',
      parameters: {
        type: 'object',
        required: ['title', 'message'],
        properties: {
          title: {
            type: 'string',
            description: 'The title of the modal'
          },
          message: {
            type: 'string',
            description: 'The message content to display in the modal'
          },
          type: {
            type: 'string',
            enum: ['success', 'error', 'info', 'warning'],
            description: 'The type/style of the modal (default: info)'
          }
        }
      }
    }
  },
  {
    type: 'function',
    async: true,
    function: {
      name: 'show_success',
      description: 'Show a success notification/message to the user',
      parameters: {
        type: 'object',
        required: ['message'],
        properties: {
          message: {
            type: 'string',
            description: 'The success message to display'
          }
        }
      }
    }
  },
  {
    type: 'function',
    async: true,
    function: {
      name: 'show_error',
      description: 'Show an error notification/message to the user',
      parameters: {
        type: 'object',
        required: ['message'],
        properties: {
          message: {
            type: 'string',
            description: 'The error message to display'
          }
        }
      }
    }
  },
  {
    type: 'function',
    async: true,
    function: {
      name: 'show_confirmation',
      description: 'Show a confirmation dialog asking the user to confirm or cancel an action.',
      parameters: {
        type: 'object',
        required: ['title', 'message'],
        properties: {
          title: {
            type: 'string',
            description: 'The title of the confirmation dialog'
          },
          message: {
            type: 'string',
            description: 'The confirmation message/question'
          }
        }
      }
    }
  },
  {
    type: 'function',
    async: true,
    function: {
      name: 'navigate_to',
      description: 'Navigate to a different page in the application',
      parameters: {
        type: 'object',
        required: ['path'],
        properties: {
          path: {
            type: 'string',
            description: 'The path to navigate to (e.g., "/dashboard", "/settings")'
          }
        }
      }
    }
  },
  {
    type: 'function',
    async: true,
    function: {
      name: 'end_call',
      description: 'End the current voice call. Use this when the user says goodbye, asks to hang up, or wants to end the conversation.',
      parameters: {
        type: 'object',
        properties: {}
      }
    }
  }
];

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

async function fixTools() {
  try {
    console.log('🔧 Fixing VAPI tools configuration...');
    console.log('✅ Adding async: true to enable client-side execution');

    const response = await axios.patch(
      `https://api.vapi.ai/assistant/${ASSISTANT_ID}`,
      {
        model: {
          provider: 'openai',
          model: 'gpt-4.1-mini',
          temperature: 0.7,
          maxTokens: 250,
          tools: tools,
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

    console.log('✅ Tools updated with client-side execution enabled!');
    console.log('\n📝 Changes:');
    console.log('  - Added async: true to all 6 functions');
    console.log('  - Functions will now execute in browser');
    console.log('  - No server round-trip needed');
    console.log('\n🔄 Next steps:');
    console.log('  1. Reload the page to get new VAPI connection');
    console.log('  2. Start a voice call');
    console.log('  3. Try saying: "Show a notification"');

  } catch (error: any) {
    console.error('❌ Error:', error.response?.data || error.message);
    process.exit(1);
  }
}

fixTools();
