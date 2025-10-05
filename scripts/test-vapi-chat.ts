// Test VAPI assistant via Chat API (text-based, no voice needed)
const VAPI_PRIVATE_KEY = '59c0d5cc-d643-4b16-9607-224c8f570ae0';
const VAPI_ASSISTANT_ID = '957955fc-dba8-4766-9132-4bcda7aad3b2';

async function testVapiChat(userMessage: string) {
  console.log(`\n🧪 Testing VAPI Chat API with message: "${userMessage}"\n`);

  const response = await fetch('https://api.vapi.ai/chat', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      assistantId: VAPI_ASSISTANT_ID,
      input: userMessage
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`VAPI Chat API error (${response.status}): ${error}`);
  }

  const data = await response.json();

  console.log('✅ VAPI Chat API Response:');
  console.log(JSON.stringify(data, null, 2));

  return data;
}

// Get message from command line or use default
const testMessage = process.argv[2] || 'What integrations are available?';

testVapiChat(testMessage)
  .then(() => {
    console.log('\n✅ Test completed successfully!');
    console.log('\nTip: You can pass a custom message:');
    console.log('  npx tsx scripts/test-vapi-chat.ts "your custom message"');
  })
  .catch((err) => {
    console.error('\n❌ Test failed:', err.message);
    process.exit(1);
  });
