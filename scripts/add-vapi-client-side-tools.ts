/**
 * Add client-side tools to VAPI assistant
 * These tools execute directly in the browser without server URLs
 */

import axios from 'axios';

const VAPI_API_KEY = process.env.VAPI_PRIVATE_KEY || process.env.VAPI_KEY;
const ASSISTANT_ID = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || '957955fc-dba8-4766-9132-4bcda7aad3b2';

if (!VAPI_API_KEY) {
  console.error('❌ VAPI_PRIVATE_KEY or VAPI_KEY environment variable is required');
  process.exit(1);
}

// Client-side tools configuration (no server.url means client-side execution)
const clientSideTools = [
  {
    type: 'function',
    function: {
      name: 'show_modal',
      description: 'Show a modal/popup on the screen with a title and message. Use this when you want to display information to the user in a prominent way.',
      parameters: {
        type: 'object',
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
        },
        required: ['title', 'message']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'show_confirmation',
      description: 'Show a confirmation dialog asking the user to confirm or cancel an action. Returns which button the user clicked.',
      parameters: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: 'The title of the confirmation dialog'
          },
          message: {
            type: 'string',
            description: 'The confirmation message/question'
          },
          confirmLabel: {
            type: 'string',
            description: 'Label for the confirm button (default: "Confirm")'
          },
          cancelLabel: {
            type: 'string',
            description: 'Label for the cancel button (default: "Cancel")'
          }
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
          path: {
            type: 'string',
            description: 'The path to navigate to (e.g., "/dashboard", "/settings", "/workspace")'
          }
        },
        required: ['path']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'click_button',
      description: 'Click a button on the current page using a CSS selector',
      parameters: {
        type: 'object',
        properties: {
          selector: {
            type: 'string',
            description: 'CSS selector for the button to click (e.g., "#submit-btn", ".save-button")'
          }
        },
        required: ['selector']
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
          message: {
            type: 'string',
            description: 'The success message to display'
          }
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
          message: {
            type: 'string',
            description: 'The error message to display'
          }
        },
        required: ['message']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_current_page',
      description: 'Get information about the current page the user is viewing',
      parameters: {
        type: 'object',
        properties: {}
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'scroll_to_top',
      description: 'Scroll to the top of the current page',
      parameters: {
        type: 'object',
        properties: {}
      }
    }
  }
];

async function updateVapiAssistant() {
  try {
    console.log('🔧 Updating VAPI assistant with client-side tools...');
    console.log('📋 Assistant ID:', ASSISTANT_ID);

    // Get current assistant configuration
    const getCurrentConfig = await axios.get(
      `https://api.vapi.ai/assistant/${ASSISTANT_ID}`,
      {
        headers: {
          'Authorization': `Bearer ${VAPI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Current assistant retrieved');

    const currentTools = getCurrentConfig.data.model?.tools || [];
    console.log(`📦 Current tools count: ${currentTools.length}`);

    // Filter out old client-side tools and keep server-side tools
    const serverSideTools = currentTools.filter((tool: any) =>
      tool.server?.url || tool.async
    );

    // Combine server-side tools with new client-side tools
    const updatedTools = [...serverSideTools, ...clientSideTools];

    console.log(`📦 Server-side tools: ${serverSideTools.length}`);
    console.log(`📦 New client-side tools: ${clientSideTools.length}`);
    console.log(`📦 Total tools: ${updatedTools.length}`);

    // Update assistant with new tools
    const response = await axios.patch(
      `https://api.vapi.ai/assistant/${ASSISTANT_ID}`,
      {
        model: {
          ...getCurrentConfig.data.model,
          tools: updatedTools
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${VAPI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('\n✅ VAPI assistant updated successfully!');
    console.log('\n📋 Client-Side Tools Added:');
    clientSideTools.forEach((tool, idx) => {
      console.log(`  ${idx + 1}. ${tool.function.name} - ${tool.function.description}`);
    });

    console.log('\n💡 Usage Examples:');
    console.log('  - "Show me a success message"');
    console.log('  - "Display an error popup"');
    console.log('  - "Navigate to the dashboard"');
    console.log('  - "Show me a confirmation dialog"');
    console.log('  - "What page am I on?"');
    console.log('  - "Scroll to the top"');

    console.log('\n🎯 These tools will execute directly in the browser!');

  } catch (error: any) {
    console.error('❌ Error updating VAPI assistant:', error.response?.data || error.message);
    process.exit(1);
  }
}

updateVapiAssistant();
