// Check VAPI assistant configuration
const VAPI_PRIVATE_KEY = '59c0d5cc-d643-4b16-9607-224c8f570ae0';
const VAPI_ASSISTANT_ID = '957955fc-dba8-4766-9132-4bcda7aad3b2';

async function checkConfig() {
  const response = await fetch(`https://api.vapi.ai/assistant/${VAPI_ASSISTANT_ID}`, {
    headers: {
      'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to get config: ${response.status}`);
  }

  const config = await response.json();

  console.log('🔧 VAPI Assistant Configuration:\n');
  console.log('Model:', config.model?.model);
  console.log('\n📋 Tools Configuration:');
  console.log(JSON.stringify(config.model?.tools, null, 2));

  return config;
}

checkConfig().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
