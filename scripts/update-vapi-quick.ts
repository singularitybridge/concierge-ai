// Quick update VAPI assistant with current Cloudflare URL
const VAPI_PRIVATE_KEY = '59c0d5cc-d643-4b16-9607-224c8f570ae0';
const VAPI_ASSISTANT_ID = '957955fc-dba8-4766-9132-4bcda7aad3b2';

// Get URL from command line or use default
const TUNNEL_URL = process.argv[2] || 'https://identical-drew-urgent-doe.trycloudflare.com';

async function updateVapiTool() {
  console.log('🔧 Updating VAPI assistant...\n');
  console.log('📍 Tunnel URL:', TUNNEL_URL);
  console.log('🎯 Tool URL:', `${TUNNEL_URL}/api/assistant/integration-expert/execute`);
  console.log('📞 Webhook URL:', `${TUNNEL_URL}/api/vapi-webhook`);
  console.log();

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
              url: `${TUNNEL_URL}/api/assistant/integration-expert/execute`,
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
  console.log('✅ Successfully updated VAPI assistant!');
  console.log('\n📋 Tool configuration:');
  console.log(JSON.stringify(result.model?.tools?.[0], null, 2));
  console.log('\n✨ VAPI is now connected to your tunnel!');
  console.log('\n⚠️  Note: This is a quick tunnel - the URL will change on restart.');
  console.log('   For a permanent URL, complete Cloudflare authentication and run:');
  console.log('   npm run tunnel:setup');

  return result;
}

updateVapiTool().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
