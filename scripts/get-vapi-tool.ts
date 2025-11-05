// Get VAPI tool configuration
const VAPI_PRIVATE_KEY = '59c0d5cc-d643-4b16-9607-224c8f570ae0';
const TOOL_ID = 'df8c0458-21ba-4a24-a011-63569e7bda30';

async function getTool() {
  console.log('🔧 Getting VAPI tool configuration...\n');

  const response = await fetch(`https://api.vapi.ai/tool/${TOOL_ID}`, {
    headers: {
      'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`
    }
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get tool: ${response.status} - ${error}`);
  }

  const tool = await response.json();
  console.log('📋 Current Tool Configuration:');
  console.log(JSON.stringify(tool, null, 2));

  return tool;
}

getTool().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
