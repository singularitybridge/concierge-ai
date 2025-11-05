// Update VAPI assistant to use Cloudflare Tunnel URL
import { readFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const VAPI_PRIVATE_KEY = '59c0d5cc-d643-4b16-9607-224c8f570ae0';
const VAPI_ASSISTANT_ID = '957955fc-dba8-4766-9132-4bcda7aad3b2';

// Get Cloudflare tunnel URL from config
function getCloudflareUrl(): string {
  try {
    const configPath = join(homedir(), '.cloudflared', 'config.yml');
    const config = readFileSync(configPath, 'utf-8');

    // Extract tunnel ID
    const tunnelMatch = config.match(/^tunnel:\s+(.+)$/m);
    if (!tunnelMatch) {
      throw new Error('Could not find tunnel ID in config');
    }

    const tunnelId = tunnelMatch[1].trim();
    const url = `https://${tunnelId}.cfargotunnel.com`;

    console.log('✅ Found Cloudflare Tunnel URL:', url);
    return url;
  } catch (error) {
    console.error('❌ Error reading Cloudflare config:', error);
    console.error('   Please run: ./scripts/setup-cloudflare-tunnel.sh');
    process.exit(1);
  }
}

async function updateVapiTool() {
  const baseUrl = getCloudflareUrl();

  console.log('🔧 Updating VAPI assistant with Cloudflare Tunnel URL...\n');
  console.log('📍 Base URL:', baseUrl);
  console.log('🎯 Tool URL:', `${baseUrl}/api/assistant/integration-expert/execute`);
  console.log('📞 Webhook URL:', `${baseUrl}/api/vapi-webhook`);
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
              url: `${baseUrl}/api/assistant/integration-expert/execute`,
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
  console.log(JSON.stringify(result.model?.tools, null, 2));
  console.log('\n🎉 Your VAPI assistant is now using the persistent Cloudflare URL!');
  console.log('   This URL will never change, even after restarts.');

  return result;
}

updateVapiTool().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
