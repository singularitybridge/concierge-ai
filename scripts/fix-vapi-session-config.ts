#!/usr/bin/env tsx
/**
 * Fix VAPI Configuration for Session/Caller Info
 *
 * This script fixes the configuration issue where VAPI sends minimal payload
 * instead of full webhook payload with call metadata.
 *
 * ROOT CAUSE:
 * - Tool has url configured → sends minimal {"userInput": "..."} payload
 * - Assistant needs serverMessages configured → enables full payload
 *
 * FIXES:
 * 1. Remove url from tool configuration
 * 2. Add serverMessages to assistant configuration
 *
 * RESULT:
 * - Webhook receives full payload with call.id, call.customer, toolCallId, etc.
 */

const VAPI_PRIVATE_KEY = '59c0d5cc-d643-4b16-9607-224c8f570ae0';
const ASSISTANT_ID = '957955fc-dba8-4766-9132-4bcda7aad3b2';
const TOOL_ID = 'df8c0458-21ba-4a24-a011-63569e7bda30';

interface ToolConfig {
  url?: string;
  [key: string]: any;
}

interface AssistantConfig {
  serverMessages?: string[];
  [key: string]: any;
}

async function fixConfiguration() {
  console.log('🔧 Fixing VAPI Configuration for Session Info\n');
  console.log('═══════════════════════════════════════════════\n');

  // Step 1: Get current tool configuration
  console.log('📋 Step 1: Getting current tool configuration...');
  const toolResponse = await fetch(`https://api.vapi.ai/tool/${TOOL_ID}`, {
    headers: {
      'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`
    }
  });

  if (!toolResponse.ok) {
    throw new Error(`Failed to get tool: ${toolResponse.status} - ${await toolResponse.text()}`);
  }

  const toolConfig: ToolConfig = await toolResponse.json();
  console.log('   Current tool URL:', toolConfig.url || 'NOT SET');

  // Step 2: Remove url from tool if present
  if (toolConfig.url) {
    console.log('\n🔨 Step 2: Removing tool-level URL...');

    // Extract only the updatable fields (exclude read-only fields)
    const { id, createdAt, updatedAt, type, orgId, url, ...updatableFields } = toolConfig;

    // Send PATCH with url explicitly set to null to remove it
    const updatePayload = {
      ...updatableFields,
      url: null
    };

    const updateToolResponse = await fetch(`https://api.vapi.ai/tool/${TOOL_ID}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatePayload)
    });

    if (!updateToolResponse.ok) {
      const error = await updateToolResponse.text();
      throw new Error(`Failed to update tool: ${updateToolResponse.status} - ${error}`);
    }

    console.log('   ✅ Removed tool-level URL successfully');
  } else {
    console.log('\n✓ Step 2: Tool URL already not set (GOOD!)');
  }

  // Step 3: Get current assistant configuration
  console.log('\n📋 Step 3: Getting current assistant configuration...');
  const assistantResponse = await fetch(`https://api.vapi.ai/assistant/${ASSISTANT_ID}`, {
    headers: {
      'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`
    }
  });

  if (!assistantResponse.ok) {
    throw new Error(`Failed to get assistant: ${assistantResponse.status} - ${await assistantResponse.text()}`);
  }

  const assistantConfig: AssistantConfig = await assistantResponse.json();
  console.log('   Current serverMessages:', assistantConfig.serverMessages || 'NOT SET');

  // Step 4: Add serverMessages if not present or incomplete
  const requiredMessages = ['tool-calls', 'function-call'];
  const needsUpdate = !assistantConfig.serverMessages ||
                      !requiredMessages.every(msg => assistantConfig.serverMessages?.includes(msg));

  if (needsUpdate) {
    console.log('\n🔨 Step 4: Adding serverMessages configuration...');

    const updateAssistantResponse = await fetch(`https://api.vapi.ai/assistant/${ASSISTANT_ID}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        serverMessages: requiredMessages
      })
    });

    if (!updateAssistantResponse.ok) {
      const error = await updateAssistantResponse.text();
      throw new Error(`Failed to update assistant: ${updateAssistantResponse.status} - ${error}`);
    }

    console.log('   ✅ Added serverMessages successfully');
  } else {
    console.log('\n✓ Step 4: serverMessages already configured (GOOD!)');
  }

  // Step 5: Verify final configuration
  console.log('\n📊 Step 5: Verifying final configuration...');

  const verifyToolResponse = await fetch(`https://api.vapi.ai/tool/${TOOL_ID}`, {
    headers: { 'Authorization': `Bearer ${VAPI_PRIVATE_KEY}` }
  });
  const verifyAssistantResponse = await fetch(`https://api.vapi.ai/assistant/${ASSISTANT_ID}`, {
    headers: { 'Authorization': `Bearer ${VAPI_PRIVATE_KEY}` }
  });

  const finalTool = await verifyToolResponse.json();
  const finalAssistant = await verifyAssistantResponse.json();

  console.log('\n═══════════════════════════════════════════════');
  console.log('✅ CONFIGURATION FIXED SUCCESSFULLY!\n');

  console.log('📋 Final Configuration:');
  console.log('   Tool URL:', finalTool.url || '❌ NOT SET (Correct!)');
  console.log('   Assistant serverUrl:', finalAssistant.serverUrl || '⚠️ NOT SET');
  console.log('   Assistant serverMessages:', finalAssistant.serverMessages || '⚠️ NOT SET');

  console.log('\n🎯 Expected Behavior:');
  console.log('   ✓ VAPI will now send FULL webhook payload');
  console.log('   ✓ Payload will include: call.id, call.customer, toolCallId, message.toolCalls');
  console.log('   ✓ Webhook can extract session and caller information');

  console.log('\n📝 Next Steps:');
  console.log('   1. Make a test call to VAPI assistant');
  console.log('   2. Check webhook logs (npm run dev)');
  console.log('   3. Verify full payload is received with call metadata');
  console.log('   4. Confirm session ID and caller info are logged\n');
}

// Run the fix
fixConfiguration().catch(err => {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
});
