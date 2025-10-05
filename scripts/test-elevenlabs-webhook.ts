// Test ElevenLabs webhook by simulating tool call
import axios from 'axios';

async function testWebhook() {
  const webhookUrl = 'http://localhost:3002/api/elevenlabs-webhook';

  console.log('🧪 Testing ElevenLabs webhook:', webhookUrl);
  console.log('📤 Sending simulated tool call...\n');

  try {
    const response = await axios.post(webhookUrl, {
      tool_name: 'query_integration_expert',
      parameters: {
        message: 'List all available integrations'
      }
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
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

testWebhook();
