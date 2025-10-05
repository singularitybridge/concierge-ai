// Script to update VAPI assistant configuration via API
const VAPI_ASSISTANT_ID = '957955fc-dba8-4766-9132-4bcda7aad3b2';
const VAPI_PRIVATE_KEY = '59c0d5cc-d643-4b16-9607-224c8f570ae0';
const WEBHOOK_URL = 'https://36c531a77d34.ngrok-free.app/api/vapi-webhook';

async function updateVapiAssistant() {
  const assistantConfig = {
    model: {
      provider: "openai",
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a helpful voice assistant that helps users learn about available integrations and how to use them.

When users ask about integrations, actions, or how to implement something, ALWAYS use the query_integration_expert function to get accurate information from the integration expert AI.

Use the function for ANY question about:
- What integrations are available
- How to do something
- Specific integration details
- Actions and their parameters
- Implementation guidance

After getting the response from the function, speak it naturally to the user in a conversational, friendly way. Keep responses concise for voice.`
        }
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "query_integration_expert",
            description: "Get information about integrations, actions, and implementation details from the integration expert AI. Use this for ANY integration-related question.",
            parameters: {
              type: "object",
              properties: {
                message: {
                  type: "string",
                  description: "The user's question about integrations"
                }
              },
              required: ["message"]
            }
          },
          async: false,
          server: {
            url: WEBHOOK_URL
          }
        }
      ]
    }
  };

  try {
    const response = await fetch(`https://api.vapi.ai/assistant/${VAPI_ASSISTANT_ID}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(assistantConfig)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`VAPI API error (${response.status}): ${error}`);
    }

    const data = await response.json();
    console.log('✅ VAPI assistant updated successfully!');
    console.log('Assistant ID:', data.id);
    console.log('System prompt updated');
    console.log('Function configured:', data.model?.functions?.[0]?.name);
    return data;
  } catch (error) {
    console.error('❌ Failed to update VAPI assistant:', error);
    throw error;
  }
}

// Run the update
updateVapiAssistant()
  .then(() => console.log('\n✅ Done! Your VAPI assistant is now configured.'))
  .catch((err) => {
    console.error('\n❌ Error:', err.message);
    process.exit(1);
  });
