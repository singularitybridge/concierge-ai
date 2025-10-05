// Test if VAPI can call the function
import axios from 'axios';

const VAPI_PRIVATE_KEY = '59c0d5cc-d643-4b16-9607-224c8f570ae0';
const VAPI_ASSISTANT_ID = '957955fc-dba8-4766-9132-4bcda7aad3b2';

async function testFunctionCall() {
  console.log('🧪 Testing if VAPI actually calls the function...\n');

  // Create a web call
  const createResponse = await fetch('https://api.vapi.ai/call/web', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      assistantId: VAPI_ASSISTANT_ID
    })
  });

  const call = await createResponse.json();
  console.log('📞 Call created:', call.id);
  console.log('🔗 Web call URL:', call.webCallUrl);
  console.log('\n🎤 Now speak: "List all available integrations"');
  console.log('\nCheck the server logs to see if the webhook receives a function call!\n');
}

testFunctionCall().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
