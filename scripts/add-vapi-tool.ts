// Add query_integration_expert tool to VAPI assistant
const VAPI_PRIVATE_KEY = '59c0d5cc-d643-4b16-9607-224c8f570ae0';
const VAPI_ASSISTANT_ID = '957955fc-dba8-4766-9132-4bcda7aad3b2';

async function addTool() {
  console.log('🔧 Adding query_integration_expert tool to VAPI assistant...\n');

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
              url: 'https://36c531a77d34.ngrok-free.app/api/vapi-webhook',
              timeoutSeconds: 30
            },
            function: {
              name: 'query_integration_expert',
              description: 'Query the integration expert AI agent to get information about available integrations, actions, and how to use them. Use this for ANY question about integrations, actions, or technical implementation details.',
              parameters: {
                type: 'object',
                required: ['message'],
                properties: {
                  message: {
                    type: 'string',
                    description: 'The user\'s question or query about integrations'
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
    throw new Error(`Failed to add tool: ${response.status} - ${error}`);
  }

  const result = await response.json();
  console.log('✅ Successfully added tool!');
  console.log('\nTool configuration:');
  console.log(JSON.stringify(result.model?.tools, null, 2));

  return result;
}

addTool().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
