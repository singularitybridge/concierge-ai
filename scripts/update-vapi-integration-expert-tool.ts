// Update VAPI assistant to use the integration-expert endpoint
const VAPI_PRIVATE_KEY = '59c0d5cc-d643-4b16-9607-224c8f570ae0';
const VAPI_ASSISTANT_ID = '957955fc-dba8-4766-9132-4bcda7aad3b2';
const NGROK_URL = 'https://dafa0a2f91f1.ngrok-free.app';

async function updateTool() {
  console.log('🔧 Updating VAPI assistant to use integration-expert endpoint...\n');

  const response = await fetch(`https://api.vapi.ai/assistant/${VAPI_ASSISTANT_ID}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: {
        provider: 'openai',
        model: 'gpt-4',
        tools: [
          {
            type: 'function',
            async: false,
            server: {
              url: `${NGROK_URL}/api/assistant/integration-expert/execute`,
              timeoutSeconds: 30
            },
            function: {
              name: 'query_integration_expert',
              description: 'Query the AI Agent Hub integration expert to get comprehensive information about available integrations, actions, implementation details, and platform capabilities. Use this for ANY question about integrations, technical details, or how to use the platform.',
              parameters: {
                type: 'object',
                required: ['user-input'],
                properties: {
                  'user-input': {
                    type: 'string',
                    description: 'The user\'s question about integrations, actions, or platform capabilities'
                  }
                }
              }
            }
          }
        ]
      }
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update tool: ${response.status} - ${error}`);
  }

  const result = await response.json();
  console.log('✅ Successfully updated tool!');
  console.log('\n📍 Tool URL:', `${NGROK_URL}/api/assistant/integration-expert/execute`);
  console.log('\nTool configuration:');
  console.log(JSON.stringify(result.model?.tools, null, 2));

  return result;
}

updateTool().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
