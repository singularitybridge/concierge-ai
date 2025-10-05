// Test ngrok webhook endpoint
import axios from 'axios';

async function testNgrok() {
  const ngrokUrl = 'https://36c531a77d34.ngrok-free.app/api/vapi-webhook';

  console.log('🧪 Testing ngrok webhook:', ngrokUrl);

  try {
    const response = await axios.post(ngrokUrl, {
      message: {
        type: 'function-call',
        functionCall: {
          id: 'test-ngrok-123',
          parameters: {
            message: 'test from ngrok'
          }
        }
      }
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('✅ Response status:', response.status);
    console.log('📦 Response data:', JSON.stringify(response.data, null, 2));
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testNgrok();
