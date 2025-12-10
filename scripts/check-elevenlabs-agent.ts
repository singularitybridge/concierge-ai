// Check ElevenLabs agent configuration
const ELEVENLABS_API_KEY = 'sk_14bb2ae18b9ffb62873b07a8c1b949cf558cf82be83f1d4a';
const AGENT_ID = 'agent_1701k6s0xmc7e4ysqcqq5msf3yvq';

async function checkAgent() {
  console.log('🔍 Checking ElevenLabs agent configuration...\n');

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${AGENT_ID}`, {
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get agent: ${response.status} - ${error}`);
    }

    const agent = await response.json();

    console.log('📋 Full Agent Response:');
    console.log(JSON.stringify(agent, null, 2));

    return agent;
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

checkAgent().catch(err => {
  console.error('Failed:', err.message);
  process.exit(1);
});
