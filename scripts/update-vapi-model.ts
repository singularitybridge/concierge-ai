/**
 * Update VAPI assistant to use gpt-4.1-mini model
 */
import axios from 'axios';

const VAPI_API_KEY = process.env.VAPI_PRIVATE_KEY || '59c0d5cc-d643-4b16-9607-224c8f570ae0';
const ASSISTANT_ID = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || '957955fc-dba8-4766-9132-4bcda7aad3b2';

async function updateVapiModel() {
  try {
    console.log('🔧 Updating VAPI assistant model to gpt-4.1-mini...');
    console.log('📋 Assistant ID:', ASSISTANT_ID);

    const response = await axios.patch(
      `https://api.vapi.ai/assistant/${ASSISTANT_ID}`,
      {
        model: {
          provider: 'openai',
          model: 'gpt-4.1-mini',
          temperature: 0.7,
          maxTokens: 250
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${VAPI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Model updated successfully!');
    console.log('\n📊 New Configuration:');
    console.log('  Provider:', response.data.model.provider);
    console.log('  Model:', response.data.model.model);
    console.log('  Temperature:', response.data.model.temperature);
    console.log('  Max Tokens:', response.data.model.maxTokens);

    console.log('\n💡 Benefits of gpt-4.1-mini:');
    console.log('  - Excellent tool calling accuracy');
    console.log('  - Natural conversation flow');
    console.log('  - Optimized for voice interactions');
    console.log('  - Cost-effective');

  } catch (error: any) {
    console.error('❌ Error updating VAPI assistant:', error.response?.data || error.message);
    process.exit(1);
  }
}

updateVapiModel();
