// Update VAPI assistant system prompt to enforce function calling
const VAPI_PRIVATE_KEY = '59c0d5cc-d643-4b16-9607-224c8f570ae0';
const VAPI_ASSISTANT_ID = '957955fc-dba8-4766-9132-4bcda7aad3b2';

const improvedPrompt = `You are a helpful voice assistant that helps users learn about available integrations and how to use them.

IMPORTANT: When users ask about integrations, actions, or technical questions, you MUST call the query_integration_expert function. Do NOT write code or describe what you would do - ACTUALLY CALL THE FUNCTION.

Call the function for ANY question about:
- What integrations are available
- How to do something
- Specific integration details
- Actions and their parameters
- Implementation guidance

After receiving the function response, speak it naturally to the user in a conversational, friendly way. Keep responses concise for voice.`;

async function updatePrompt() {
  console.log('📝 Updating VAPI assistant prompt...\n');

  const response = await fetch(`https://api.vapi.ai/assistant/${VAPI_ASSISTANT_ID}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: {
        provider: 'openai',
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: improvedPrompt
          }
        ]
      }
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update: ${response.status} - ${error}`);
  }

  const result = await response.json();
  console.log('✅ Successfully updated system prompt!');
  console.log('\nNew prompt:');
  console.log(improvedPrompt);

  return result;
}

updatePrompt().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
