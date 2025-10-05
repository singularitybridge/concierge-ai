// Add query_integration_expert tool to ElevenLabs agent - Try different structure
const ELEVENLABS_API_KEY = 'sk_2626951f5c9cebb6b387f8ace8acb1623a2cfbf46c538ef7';
const AGENT_ID = 'agent_1701k6s0xmc7e4ysqcqq5msf3yvq';

async function tryDifferentStructures() {
  console.log('🔧 Trying different tool structures...\n');

  // Structure 1: Server type instead of webhook
  const structure1 = {
    conversation_config: {
      agent: {
        prompt: {
          tools: [
            {
              type: 'server',
              name: 'query_integration_expert',
              description: 'Query the integration expert AI agent to get information about available integrations, actions, and implementation details.',
              config: {
                endpoint: 'https://36c531a77d34.ngrok-free.app/api/elevenlabs-webhook',
                method: 'POST',
                parameters: {
                  message: {
                    type: 'string',
                    required: true,
                    description: 'The user\'s question or query about integrations'
                  }
                }
              }
            }
          ]
        }
      }
    }
  };

  console.log('📋 Trying structure 1 (server type)...');
  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${AGENT_ID}`, {
      method: 'PATCH',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(structure1)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Structure 1 worked!');
      console.log(JSON.stringify(result.conversation_config?.agent?.prompt?.tools, null, 2));
      return;
    } else {
      const error = await response.text();
      console.log('❌ Structure 1 failed:', error.substring(0, 200));
    }
  } catch (error: any) {
    console.log('❌ Structure 1 error:', error.message);
  }

  // Structure 2: Webhook with response_schema
  const structure2 = {
    conversation_config: {
      agent: {
        prompt: {
          tools: [
            {
              type: 'webhook',
              name: 'query_integration_expert',
              description: 'Query the integration expert AI',
              webhook: {
                url: 'https://36c531a77d34.ngrok-free.app/api/elevenlabs-webhook',
                method: 'POST',
                api_schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      description: 'The user\'s question'
                    }
                  },
                  required: ['message']
                },
                response_schema: {
                  type: 'object',
                  properties: {
                    result: {
                      type: 'string'
                    }
                  }
                }
              }
            }
          ]
        }
      }
    }
  };

  console.log('\n📋 Trying structure 2 (webhook with response_schema)...');
  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${AGENT_ID}`, {
      method: 'PATCH',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(structure2)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Structure 2 worked!');
      console.log(JSON.stringify(result.conversation_config?.agent?.prompt?.tools, null, 2));
      return;
    } else {
      const error = await response.text();
      console.log('❌ Structure 2 failed:', error.substring(0, 200));
    }
  } catch (error: any) {
    console.log('❌ Structure 2 error:', error.message);
  }

  // Structure 3: Minimal webhook
  const structure3 = {
    conversation_config: {
      agent: {
        prompt: {
          tools: [
            {
              type: 'webhook',
              name: 'query_integration_expert',
              description: 'Query integration expert',
              webhook: {
                url: 'https://36c531a77d34.ngrok-free.app/api/elevenlabs-webhook',
                api_schema: {
                  type: 'object',
                  properties: {}
                }
              }
            }
          ]
        }
      }
    }
  };

  console.log('\n📋 Trying structure 3 (minimal webhook)...');
  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${AGENT_ID}`, {
      method: 'PATCH',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(structure3)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Structure 3 worked!');
      console.log(JSON.stringify(result.conversation_config?.agent?.prompt?.tools, null, 2));
      return;
    } else {
      const error = await response.text();
      console.log('❌ Structure 3 failed:', error.substring(0, 200));
    }
  } catch (error: any) {
    console.log('❌ Structure 3 error:', error.message);
  }

  console.log('\n❌ All structures failed. Tools must be configured via dashboard.');
}

tryDifferentStructures().catch(err => {
  console.error('Failed:', err.message);
  process.exit(1);
});
