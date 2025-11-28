/**
 * Update the Boutique agent to use a female voice (Jessica)
 */

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || 'sk_2626951f5c9cebb6b387f8ace8acb1623a2cfbf46c538ef7';
const AGENT_ID = 'agent_8401kb684w18f71961rjgr6c3d6f';

// Jessica - cute, conversational female voice
const VOICE_ID = 'cgSgspJ2msm6clMCkdW9';

async function updateVoice() {
  console.log('🎤 Updating Boutique agent to female voice (Jessica)...\n');

  const response = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${AGENT_ID}`, {
    method: 'PATCH',
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      conversation_config: {
        tts: {
          voice_id: VOICE_ID
        }
      }
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update agent: ${error}`);
  }

  const result = await response.json();
  console.log('✅ Agent updated successfully!');
  console.log(`   Name: ${result.name}`);
  console.log(`   Agent ID: ${result.agent_id}`);
  console.log(`   Voice ID: ${result.conversation_config?.tts?.voice_id || 'Not set'}`);
}

updateVoice().catch(console.error);
