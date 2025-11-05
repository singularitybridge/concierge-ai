// Test the integration-expert endpoint
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NmQ0Y2MzMjg0NjEyMjMzNDEzYmViNzciLCJlbWFpbCI6ImF2aUBzaW5ndWxhcml0eWJyaWRnZS5uZXQiLCJjb21wYW55SWQiOiI2NmQ0MWFjMzQ4N2MxOWY2ZDRjMjNmYTEiLCJpYXQiOjE3NTk0MjI5OTIsImV4cCI6MTc2MDAyNzc5Mn0.tQTZ7mCqFP7INoTf5FxkfBKwb4OwsYlID3bWW2cuD4o';
const NGROK_URL = 'https://2197a486470b.ngrok-free.app';

async function testEndpoint() {
  console.log('🧪 Testing integration-expert endpoint...\n');
  console.log('📍 Endpoint:', `${NGROK_URL}/assistant/integration-expert/execute`);

  const testPayload = {
    'user-input': 'What integrations are available?',
    sessionId: 'test-session-123',
    metadata: {
      test: true
    }
  };

  console.log('📤 Test payload:');
  console.log(JSON.stringify(testPayload, null, 2));
  console.log('');

  try {
    const response = await fetch(`${NGROK_URL}/assistant/integration-expert/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(testPayload)
    });

    console.log('📊 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      throw new Error(`Request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('\n✅ Success! Response:');
    console.log(JSON.stringify(data, null, 2));

  } catch (error) {
    console.error('\n❌ Test failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

testEndpoint();
