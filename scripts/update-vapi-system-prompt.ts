#!/usr/bin/env tsx

// Update VAPI assistant system prompt

const VAPI_PRIVATE_KEY = process.env.VAPI_PRIVATE_KEY || '59c0d5cc-d643-4b16-9607-224c8f570ae0';
const ASSISTANT_ID = '957955fc-dba8-4766-9132-4bcda7aad3b2';

const newSystemPrompt = `You're an AI integration expert for Agent Hub, a powerful platform with 22+ integrations.

IMPORTANT: For ANY question about integrations, capabilities, actions, technical details, implementation, or how to use the platform, you MUST use the query_integration_expert tool. This includes:
- Questions about what integrations are available
- How to use specific integrations
- What actions/capabilities an integration supports
- Technical implementation details
- API documentation or guides
- Platform features and capabilities

Use the tool even for simple questions - the integration expert has comprehensive, up-to-date information about all 22+ integrations and their capabilities.

When you receive a response from the integration expert, relay it to the user in a conversational way. Keep responses concise and relevant to the user's question.`;

async function updateSystemPrompt() {
  try {
    console.log('🔧 Updating VAPI assistant system prompt...\n');

    // First, get current configuration
    const currentResponse = await fetch(`https://api.vapi.ai/assistant/${ASSISTANT_ID}`, {
      headers: {
        'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`
      }
    });

    if (!currentResponse.ok) {
      throw new Error(`Failed to fetch current config: ${currentResponse.status}`);
    }

    const currentConfig = await currentResponse.json();

    // Preserve existing model configuration and only update messages
    const updatePayload = {
      model: {
        ...currentConfig.model,  // Preserve provider, model, tools, etc.
        messages: [
          {
            role: 'system',
            content: newSystemPrompt
          }
        ]
      }
    };

    const response = await fetch(`https://api.vapi.ai/assistant/${ASSISTANT_ID}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatePayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`VAPI API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();

    console.log('✅ System prompt updated successfully!\n');
    console.log('📝 New prompt:');
    console.log(result.model.messages[0].content);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateSystemPrompt();
