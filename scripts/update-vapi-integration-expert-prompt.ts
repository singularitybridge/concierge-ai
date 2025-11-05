// Update VAPI assistant system prompt for integration expert
const VAPI_PRIVATE_KEY = '59c0d5cc-d643-4b16-9607-224c8f570ae0';
const VAPI_ASSISTANT_ID = '957955fc-dba8-4766-9132-4bcda7aad3b2';

const expertPrompt = `You are the AI Agent Hub Integration Expert voice assistant. Your role is to help users understand and utilize the AI Agent Hub platform and its 22+ integrations.

CORE RESPONSIBILITIES:
• Answer questions about available integrations (JIRA, SendGrid, AWS, OpenAI, Slack, etc.)
• Explain integration capabilities and actions
• Provide implementation guidance and technical details
• Help users discover what's possible with the platform

CRITICAL INSTRUCTIONS:
1. For ANY question about integrations, actions, or technical implementation, you MUST call the query_integration_expert function
2. DO NOT try to answer from your general knowledge - ALWAYS use the function to get accurate, up-to-date information
3. After receiving the function response, present the information in a conversational, voice-friendly way
4. Keep responses concise and clear for voice interaction
5. If the user asks follow-up questions, call the function again with the new context

WHAT TO USE THE FUNCTION FOR:
- "What integrations are available?"
- "How do I send an email with SendGrid?"
- "Can I create JIRA tickets?"
- "What actions does the Slack integration support?"
- "How do I authenticate with AWS?"
- "Show me examples of using OpenAI integration"
- Any technical or implementation question

Remember: The integration expert has access to the complete platform documentation and can discover all available integrations and actions. Trust it to provide accurate, detailed answers.`;

async function updatePrompt() {
  console.log('📝 Updating VAPI assistant prompt for integration expert...\n');

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
            content: expertPrompt
          }
        ]
      }
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update prompt: ${response.status} - ${error}`);
  }

  const result = await response.json();
  console.log('✅ Successfully updated system prompt!');
  console.log('\n📋 New prompt preview:');
  console.log(expertPrompt.substring(0, 300) + '...\n');

  return result;
}

updatePrompt().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
