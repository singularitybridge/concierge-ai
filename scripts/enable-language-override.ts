import axios from 'axios';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || 'sk_f9556323e6be0cac1aa1af8992aa4ae9a2275b2e2f0c0165';

// All agent IDs that need language override enabled
const agentIds = [
  'agent_1701k6s0xmc7e4ysqcqq5msf3yvq', // Main concierge/Yuki
  'agent_8401kb684w18f71961rjgr6c3d6f', // Restaurant/Chef Chen
  'agent_1701kagqnj4qe9aa7ysvh8qycc9e', // Guest agent
  'agent_3901kaxpws36erg8msxqkmq3de36', // Tea agent
  'agent_4001kb6eg7v4fgvaw2xvgexp0mrs', // KB agent
  'agent_0801kb6hm9daeemb72fxchd2nggz', // Task agent
  'agent_6101kb6k5whff2crpw8yxvwcxs95', // Guest services agent
];

async function enableLanguageOverride(agentId: string) {
  try {
    console.log(`\nUpdating agent ${agentId}...`);

    // First, get current agent config to preserve existing settings
    const getResponse = await axios.get(
      `https://api.elevenlabs.io/v1/convai/agents/${agentId}`,
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
        }
      }
    );

    const currentOverrides = getResponse.data.platform_settings?.overrides?.conversation_config_override || {};

    // Update with language override enabled
    const response = await axios.patch(
      `https://api.elevenlabs.io/v1/convai/agents/${agentId}`,
      {
        platform_settings: {
          overrides: {
            conversation_config_override: {
              ...currentOverrides,
              agent: {
                ...currentOverrides.agent,
                language: true, // Enable language override
                first_message: true, // Also enable first message override for localized greetings
              }
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

    const name = response.data.name;
    const langOverride = response.data.platform_settings?.overrides?.conversation_config_override?.agent?.language;
    console.log(`✅ ${name}: language override = ${langOverride}`);

  } catch (error: any) {
    console.error(`❌ Error updating agent ${agentId}:`, error.response?.data || error.message);
  }
}

async function main() {
  console.log('Enabling language overrides for all agents...\n');

  for (const agentId of agentIds) {
    await enableLanguageOverride(agentId);
  }

  console.log('\n✅ Done!');
}

main();
