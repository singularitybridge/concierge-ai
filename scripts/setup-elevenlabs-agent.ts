// Create ElevenLabs agent with webhook tool configuration
import * as fs from 'fs';
import * as path from 'path';

const ELEVENLABS_API_KEY = 'sk_2626951f5c9cebb6b387f8ace8acb1623a2cfbf46c538ef7';

interface WebhookTool {
  type: 'webhook';
  name: string;
  description: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  parameters?: {
    type: 'object';
    properties: Record<string, {
      type: string;
      description: string;
    }>;
    required?: string[];
  };
}

interface AgentConfig {
  name: string;
  conversation_config: {
    agent: {
      prompt: {
        prompt: string;
      };
      first_message: string;
      language: string;
    };
    tts?: {
      voice_id?: string;
    };
  };
  platform_settings?: {
    widget_config?: {
      avatar_url?: string;
    };
  };
}

async function createElevenLabsAgent(webhookUrl: string) {
  console.log('🚀 Creating ElevenLabs agent with webhook tool...\n');

  // Define the webhook tool
  const webhookTool: WebhookTool = {
    type: 'webhook',
    name: 'query_integration_expert',
    description: 'Query the integration expert AI agent for information about integrations, APIs, and technical questions.',
    url: webhookUrl,
    method: 'POST',
    parameters: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: 'The user message or question to send to the integration expert'
        }
      },
      required: ['message']
    }
  };

  // Agent configuration
  const agentConfig: AgentConfig = {
    name: 'Integration Expert Voice Agent',
    conversation_config: {
      agent: {
        prompt: {
          prompt: `You are a helpful integration expert assistant. When users ask about integrations, APIs, or technical questions, use the query_integration_expert tool to get accurate information.

Always use the tool when the user asks technical questions. Pass their message directly to the tool and respond with the information you receive.`
        },
        first_message: 'Hello! I\'m your integration expert assistant. How can I help you today?',
        language: 'en'
      }
    }
  };

  console.log('📋 Agent Configuration:');
  console.log(JSON.stringify(agentConfig, null, 2));
  console.log('\n🔧 Webhook Tool Configuration:');
  console.log(JSON.stringify(webhookTool, null, 2));

  // Create the agent
  const createResponse = await fetch('https://api.elevenlabs.io/v1/convai/agents/create', {
    method: 'POST',
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(agentConfig)
  });

  if (!createResponse.ok) {
    const error = await createResponse.text();
    throw new Error(`Failed to create agent (${createResponse.status}): ${error}`);
  }

  const agent = await createResponse.json();
  const agentId = agent.agent_id;

  console.log(`\n✅ Agent created successfully!`);
  console.log(`Agent ID: ${agentId}`);
  console.log(`Agent Name: ${agent.name || 'Integration Expert Voice Agent'}`);

  // Now add the webhook tool to the agent
  console.log('\n🔧 Adding webhook tool to agent...');

  const addToolResponse = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}/add-tool`, {
    method: 'POST',
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(webhookTool)
  });

  if (!addToolResponse.ok) {
    const error = await addToolResponse.text();
    console.warn(`⚠️  Warning: Could not add tool via API (${addToolResponse.status}): ${error}`);
    console.log('\n📝 Manual Setup Required:');
    console.log('1. Go to https://elevenlabs.io/app/conversational-ai');
    console.log(`2. Find agent: ${agentId}`);
    console.log('3. Add a webhook tool with these settings:');
    console.log(`   - Name: query_integration_expert`);
    console.log(`   - Description: Query the integration expert AI agent`);
    console.log(`   - URL: ${webhookUrl}`);
    console.log(`   - Method: POST`);
    console.log(`   - Parameters: { "message": { "type": "string", "description": "User message" } }`);
  } else {
    console.log('✅ Webhook tool added successfully!');
  }

  // Update .env.local with the agent ID
  const envPath = path.join(process.cwd(), '.env.local');
  let envContent = fs.readFileSync(envPath, 'utf-8');

  if (envContent.includes('NEXT_PUBLIC_ELEVENLABS_AGENT_ID=')) {
    envContent = envContent.replace(
      /NEXT_PUBLIC_ELEVENLABS_AGENT_ID=.*/,
      `NEXT_PUBLIC_ELEVENLABS_AGENT_ID=${agentId}`
    );
  } else {
    envContent += `\nNEXT_PUBLIC_ELEVENLABS_AGENT_ID=${agentId}`;
  }

  fs.writeFileSync(envPath, envContent);
  console.log(`\n✅ Updated .env.local with agent ID`);

  console.log('\n🎉 Setup complete!');
  console.log('\nNext steps:');
  console.log('1. Restart your Next.js dev server to load the new env variable');
  console.log('2. Test the agent with: npx tsx scripts/test-elevenlabs-chat.ts');
  console.log('3. Or click the purple "Talk (ElevenLabs)" button in the app');

  return agent;
}

// Get webhook URL from command line or use default
const webhookUrl = process.argv[2] || 'http://localhost:3001/api/elevenlabs-webhook';

console.log(`🌐 Using webhook URL: ${webhookUrl}\n`);
console.log('💡 Tip: For production, use your deployed URL:');
console.log('   npx tsx scripts/setup-elevenlabs-agent.ts https://your-domain.com/api/elevenlabs-webhook\n');

createElevenLabsAgent(webhookUrl)
  .catch((err) => {
    console.error('\n❌ Setup failed:', err.message);
    process.exit(1);
  });
