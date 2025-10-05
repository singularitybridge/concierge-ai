// Add query_integration_expert tool to ElevenLabs agent
const ELEVENLABS_API_KEY = 'sk_2626951f5c9cebb6b387f8ace8acb1623a2cfbf46c538ef7';
const AGENT_ID = 'agent_1701k6s0xmc7e4ysqcqq5msf3yvq';

async function addTool() {
  console.log('🔧 Adding query_integration_expert tool to ElevenLabs agent...\n');

  const toolConfig = {
    conversation_config: {
      agent: {
        prompt: {
          tools: [
            {
              type: 'webhook',
              name: 'query_integration_expert',
              description: 'Query the integration expert AI agent to get information about available integrations, actions, and implementation details. Use this for ANY question about integrations or technical topics.',
              webhook: {
                url: 'https://36c531a77d34.ngrok-free.app/api/elevenlabs-webhook',
                api_schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      description: 'The user\'s question or query about integrations'
                    }
                  },
                  required: ['message']
                }
              }
            }
          ]
        }
      }
    }
  };

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${AGENT_ID}`, {
      method: 'PATCH',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(toolConfig)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to update agent: ${response.status} - ${error}`);
    }

    const result = await response.json();
    console.log('✅ Successfully added tool!');
    console.log('\nUpdated tools:');
    console.log(JSON.stringify(result.conversation_config?.agent?.prompt?.tools, null, 2));

    return result;
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

addTool().catch(err => {
  console.error('Failed:', err.message);
  process.exit(1);
});
