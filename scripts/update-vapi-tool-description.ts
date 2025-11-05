// Update VAPI tool description for integration expert
const VAPI_PRIVATE_KEY = '59c0d5cc-d643-4b16-9607-224c8f570ae0';
const TOOL_ID = 'df8c0458-21ba-4a24-a011-63569e7bda30';

// Optimal description for the integration expert
const optimalDescription = `Query the AI Agent Hub integration expert for comprehensive information about:
• Available integrations (JIRA, SendGrid, AWS, OpenAI, Slack, Google, Microsoft, and 20+ more)
• Integration capabilities and actions (create tickets, send emails, manage cloud resources, etc.)
• Implementation guidance and technical details
• Authentication and configuration requirements
• API schemas and parameters
• Code examples and best practices

Use this tool for ANY question about platform integrations, actions, or how to implement specific functionality using the AI Agent Hub.`;

const improvedFunctionName = 'query_integration_expert';

async function updateTool() {
  console.log('🔧 Updating VAPI tool description...\n');

  const response = await fetch(`https://api.vapi.ai/tool/${TOOL_ID}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      function: {
        name: improvedFunctionName,
        description: optimalDescription
      },
      body: {
        type: 'object',
        required: ['userInput'],
        properties: {
          userInput: {
            description: 'The user\'s question about integrations, actions, or platform capabilities',
            type: 'string'
          }
        }
      }
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update tool: ${response.status} - ${error}`);
  }

  const tool = await response.json();
  console.log('✅ Successfully updated tool description!');
  console.log('\n📋 New Function Name:', tool.function.name);
  console.log('\n📝 New Description:');
  console.log(optimalDescription);
  console.log('\n🔗 Tool ID:', tool.id);

  return tool;
}

updateTool().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
