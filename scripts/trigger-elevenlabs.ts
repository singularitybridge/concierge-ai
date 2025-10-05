// Trigger ElevenLabs agent to test webhook
import axios from 'axios';

const ELEVENLABS_API_KEY = 'sk_14bb2ae18b9ffb62873b07a8c1b949cf558cf82be83f1d4a';
const AGENT_ID = 'agent_1701k6s0xmc7e4ysqcqq5msf3yvq';

async function triggerAgent() {
  console.log('🎙️ Triggering ElevenLabs agent...\n');

  try {
    // Start conversation with agent
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/convai/conversation`,
      {
        agent_id: AGENT_ID,
        text: "List all available integrations"
      },
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    console.log('✅ Response status:', response.status);
    console.log('📦 Response data:', JSON.stringify(response.data, null, 2));
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

triggerAgent();
