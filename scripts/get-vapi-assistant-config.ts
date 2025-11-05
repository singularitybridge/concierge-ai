// Get complete VAPI assistant configuration
const VAPI_PRIVATE_KEY = '59c0d5cc-d643-4b16-9607-224c8f570ae0';
const VAPI_ASSISTANT_ID = '957955fc-dba8-4766-9132-4bcda7aad3b2';

async function getAssistantConfig() {
  console.log('🔧 Getting complete VAPI assistant configuration...\n');

  const response = await fetch(`https://api.vapi.ai/assistant/${VAPI_ASSISTANT_ID}`, {
    headers: {
      'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`
    }
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get config: ${response.status} - ${error}`);
  }

  const config = await response.json();

  console.log('📋 Complete Assistant Configuration:');
  console.log(JSON.stringify(config, null, 2));

  console.log('\n\n📊 Key Settings Summary:');
  console.log('─────────────────────────────────────');
  console.log('Model Provider:', config.model?.provider || 'Not set');
  console.log('Model:', config.model?.model || 'Not set');
  console.log('Temperature:', config.model?.temperature ?? 'Not set');
  console.log('Max Tokens:', config.model?.maxTokens || 'Not set');
  console.log('\nVoice Provider:', config.voice?.provider || 'Not set');
  console.log('Voice ID:', config.voice?.voiceId || 'Not set');
  console.log('\nFirst Message:', config.firstMessage || 'Not set');
  console.log('Tools Count:', config.model?.tools?.length || 0);

  return config;
}

getAssistantConfig().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
