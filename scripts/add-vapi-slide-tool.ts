// Add update_slide tool to VAPI assistant
const VAPI_PRIVATE_KEY = '59c0d5cc-d643-4b16-9607-224c8f570ae0';
const VAPI_ASSISTANT_ID = '957955fc-dba8-4766-9132-4bcda7aad3b2';
const NGROK_URL = 'https://36c531a77d34.ngrok-free.app';

async function addSlideTool() {
  console.log('🔧 Adding update_slide tool to VAPI assistant...\n');

  // First, get current configuration
  const getResponse = await fetch(`https://api.vapi.ai/assistant/${VAPI_ASSISTANT_ID}`, {
    headers: {
      'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`,
    }
  });

  if (!getResponse.ok) {
    throw new Error(`Failed to get current config: ${getResponse.status}`);
  }

  const currentConfig = await getResponse.json();
  const existingTools = currentConfig.model?.tools || [];

  // Check if update_slide tool already exists
  const hasUpdateSlide = existingTools.some((tool: any) =>
    tool.function?.name === 'update_slide'
  );

  if (hasUpdateSlide) {
    console.log('ℹ️  update_slide tool already exists, skipping...');
    return currentConfig;
  }

  // Add the new slide tool
  const newTool = {
    type: 'function',
    async: false,
    server: {
      url: `${NGROK_URL}/api/update-slide`,
      timeoutSeconds: 30
    },
    function: {
      name: 'update_slide',
      description: 'Update the presentation slide to show relevant information based on the conversation topic. Use this when discussing a specific topic, showing examples, or when the user asks to see something visually.',
      parameters: {
        type: 'object',
        required: ['slideIndex', 'topic'],
        properties: {
          slideIndex: {
            type: 'number',
            description: 'The slide index to navigate to (0-4). 0=Welcome, 1=Integration Overview, 2=Technical Details, 3=Code Examples, 4=Next Steps'
          },
          topic: {
            type: 'string',
            description: 'The current topic or title for the slide'
          },
          content: {
            type: 'string',
            description: 'Optional: HTML content to display in the slide. Use bullet points or code snippets.'
          },
          sessionId: {
            type: 'string',
            description: 'Optional: Session ID for tracking'
          }
        }
      }
    }
  };

  // Update assistant with new tool
  const updateResponse = await fetch(`https://api.vapi.ai/assistant/${VAPI_ASSISTANT_ID}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: {
        ...currentConfig.model,
        tools: [...existingTools, newTool]
      }
    })
  });

  if (!updateResponse.ok) {
    const error = await updateResponse.text();
    throw new Error(`Failed to add slide tool: ${updateResponse.status} - ${error}`);
  }

  const result = await updateResponse.json();
  console.log('✅ Successfully added update_slide tool!');
  console.log('\nCurrent tools:');
  result.model?.tools?.forEach((tool: any, index: number) => {
    console.log(`  ${index + 1}. ${tool.function?.name}`);
  });

  return result;
}

addSlideTool().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
