// Check ElevenLabs agent configuration
const ELEVENLABS_API_KEY = 'sk_2626951f5c9cebb6b387f8ace8acb1623a2cfbf46c538ef7';
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
