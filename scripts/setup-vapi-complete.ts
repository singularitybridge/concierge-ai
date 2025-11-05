/**
 * Complete VAPI setup: Model + Client-side Tools
 */
import axios from 'axios';

const VAPI_API_KEY = process.env.VAPI_PRIVATE_KEY || '59c0d5cc-d643-4b16-9607-224c8f570ae0';
const ASSISTANT_ID = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || '957955fc-dba8-4766-9132-4bcda7aad3b2';

// Client-side tools configuration
const clientSideTools = [
  {
    type: 'function',
    function: {
      name: 'show_modal',
      description: 'Show a modal/popup on the screen with a title and message. Use this when you want to display information to the user in a prominent way.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'The title of the modal' },
          message: { type: 'string', description: 'The message content to display in the modal' },
          type: { type: 'string', enum: ['success', 'error', 'info', 'warning'], description: 'The type/style of the modal (default: info)' }
        },
        required: ['title', 'message']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'show_confirmation',
      description: 'Show a confirmation dialog asking the user to confirm or cancel an action.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'The title of the confirmation dialog' },
          message: { type: 'string', description: 'The confirmation message/question' }
        },
        required: ['title', 'message']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'navigate_to',
      description: 'Navigate to a different page in the application',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'The path to navigate to (e.g., "/dashboard", "/settings")' }
        },
        required: ['path']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'show_success',
      description: 'Show a success notification/message to the user',
      parameters: {
        type: 'object',
        properties: {
          message: { type: 'string', description: 'The success message to display' }
        },
        required: ['message']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'show_error',
      description: 'Show an error notification/message to the user',
      parameters: {
        type: 'object',
        properties: {
          message: { type: 'string', description: 'The error message to display' }
        },
        required: ['message']
      }
    }
  },
  {
    type: 'function',
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

async function setupVapi() {
  try {
    console.log('🔧 Setting up VAPI assistant (Model + Tools)...\n');

    const response = await axios.patch(
      `https://api.vapi.ai/assistant/${ASSISTANT_ID}`,
      {
        model: {
          provider: 'openai',
          model: 'gpt-4.1-mini',
          temperature: 0.7,
          maxTokens: 250,
          tools: clientSideTools
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${VAPI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ VAPI Assistant Configured!\n');
    console.log('📊 Model Configuration:');
    console.log('  Provider:', response.data.model.provider);
    console.log('  Model:', response.data.model.model);
    console.log('  Temperature:', response.data.model.temperature);
    console.log('  Max Tokens:', response.data.model.maxTokens);

    console.log('\n🔧 Client-Side Tools:');
    console.log('  Total:', response.data.model.tools.length);
    response.data.model.tools.forEach((tool: any, idx: number) => {
      console.log(`  ${idx + 1}. ${tool.function.name}`);
    });

    console.log('\n✅ Ready to test! Try saying:');
    console.log('  - "Show me a success message"');
    console.log('  - "Display a modal"');
    console.log('  - "Show an error"');
    console.log('  - "End the call" or "Goodbye"');

  } catch (error: any) {
    console.error('❌ Error:', error.response?.data || error.message);
    process.exit(1);
  }
}

setupVapi();
