/**
 * Setup ElevenLabs Client Tools via API
 * Creates 6 client tools and adds them to the agent
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

// Define the 6 client tools
const clientTools = [
  {
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
  },
  {
    name: 'show_success',
    description: 'Show a success notification/message to the user. Use this when the user asks to show a notification or success message.',
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
  },
  {
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
  },
  {
    name: 'show_confirmation',
    description: 'Show a confirmation dialog asking the user to confirm or cancel an action',
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
        }
      },
      required: ['title', 'message']
    }
  },
  {
    name: 'navigate_to',
    description: 'Navigate to a different page in the application',
    parameters: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'The path to navigate to (e.g., "/dashboard", "/settings")'
        }
      },
      required: ['path']
    }
  },
  {
    name: 'end_call',
    description: 'End the current voice call. Use this when the user says goodbye, asks to hang up, or wants to end the conversation.',
    parameters: {
      type: 'object',
      properties: {}
    }
  }
];

async function createClientTool(toolConfig: any) {
  try {
    const response = await axios.post(
      `${API_BASE}/convai/tools`,
      {
        tool_config: {
          type: 'client',
          name: toolConfig.name,
          description: toolConfig.description,
          parameters: toolConfig.parameters,
          expects_response: true,
          response_timeout_secs: 30,
          disable_interruptions: false
        }
      },
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`✅ Created tool: ${toolConfig.name} (ID: ${response.data.id})`);
    return response.data.id;
  } catch (error: any) {
    console.error(`❌ Error creating tool ${toolConfig.name}:`, error.response?.data || error.message);
    throw error;
  }
}

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

async function updateAgent(toolIds: string[]) {
  try {
    const agent = await getAgent();

    // Get existing tool_ids and merge with new ones
    const existingToolIds = agent.conversation_config?.agent?.prompt?.tool_ids || [];
    const allToolIds = [...new Set([...existingToolIds, ...toolIds])]; // Remove duplicates

    const response = await axios.patch(
      `${API_BASE}/convai/agents/${AGENT_ID}`,
      {
        conversation_config: {
          ...agent.conversation_config,
          agent: {
            ...agent.conversation_config.agent,
            prompt: {
              ...agent.conversation_config.agent.prompt,
              tool_ids: allToolIds
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

    console.log('✅ Updated agent with tool IDs');
    console.log(`   Existing tools: ${existingToolIds.length}`);
    console.log(`   New tools: ${toolIds.length}`);
    console.log(`   Total tools: ${allToolIds.length}`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error updating agent:', error.response?.data || error.message);
    throw error;
  }
}

async function main() {
  console.log('🔧 Setting up ElevenLabs client tools...\n');

  // Create all 6 client tools
  const toolIds: string[] = [];

  for (const tool of clientTools) {
    try {
      const toolId = await createClientTool(tool);
      toolIds.push(toolId);
    } catch (error) {
      console.error(`Failed to create tool: ${tool.name}`);
      // Continue with other tools even if one fails
    }
  }

  if (toolIds.length === 0) {
    console.error('❌ No tools were created successfully');
    process.exit(1);
  }

  console.log(`\n✅ Created ${toolIds.length}/${clientTools.length} tools\n`);

  // Update agent to reference the new tools
  console.log('🔧 Updating agent with tool IDs...');
  await updateAgent(toolIds);

  console.log('\n✅ Setup complete!');
  console.log('\n📝 Next steps:');
  console.log('1. Reload the page to reconnect with updated tools');
  console.log('2. Start a new ElevenLabs voice call');
  console.log('3. Say: "Show a notification" to test');
  console.log('4. Check console for: 🔧 ElevenLabs client tool: show_success');
}

main().catch((error) => {
  console.error('❌ Setup failed:', error);
  process.exit(1);
});
