/**
 * Update the Task Assistant ElevenLabs agent with client tools
 */

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || 'sk_2626951f5c9cebb6b387f8ace8acb1623a2cfbf46c538ef7';
const AGENT_ID = process.env.NEXT_PUBLIC_ELEVENLABS_TASK_AGENT_ID || 'agent_0801kb6hm9daeemb72fxchd2nggz';

const systemPrompt = `You are a task management assistant for The 1898 Niseko, a luxury boutique hotel in Hokkaido, Japan. Your role is to help hotel staff manage and update tasks efficiently.

## Important
The task details will be provided to you when the conversation starts. Use that information to assist with the task.

## Available Tools
You have these tools to manage tasks:
- **update_status**: Change the task status. Use values: "pending", "in-progress", "completed", or "blocked"
- **update_notes**: Add or update notes on the task
- **add_comment**: Add a comment to the task's activity log

## When to Use Tools
- If asked to mark complete, use update_status with status "completed"
- If asked to add a note, use update_notes
- If asked to add a comment or update, use add_comment immediately
- If asked about the task, reference the context provided

## Conversation Style
- Be efficient and action-oriented
- Use tools immediately when the user requests an action - don't ask for confirmation
- Confirm the action was taken after using a tool
- Keep responses brief`;

// Tools go inside conversation_config.agent.prompt.tools
const tools = [
  {
    type: 'client',
    name: 'get_context',
    description: 'Get current task details including title, description, status, notes, and activity log',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    },
    expects_response: true
  },
  {
    type: 'client',
    name: 'update_status',
    description: 'Update the task status. Call this when user asks to mark task as complete, in progress, blocked, or pending.',
    parameters: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          description: 'The new status: pending, in-progress, completed, or blocked',
          enum: ['pending', 'in-progress', 'completed', 'blocked']
        }
      },
      required: ['status']
    },
    expects_response: true
  },
  {
    type: 'client',
    name: 'update_notes',
    description: 'Update or append to the task notes. Call this when user wants to add a note to the task.',
    parameters: {
      type: 'object',
      properties: {
        notes: {
          type: 'string',
          description: 'The notes to add or update'
        },
        append: {
          type: 'boolean',
          description: 'If true, append to existing notes. If false, replace notes. Default is true.'
        }
      },
      required: ['notes']
    },
    expects_response: true
  },
  {
    type: 'client',
    name: 'add_comment',
    description: 'Add a comment to the task activity log. Call this immediately when user asks to add a comment, log an update, or record something.',
    parameters: {
      type: 'object',
      properties: {
        comment: {
          type: 'string',
          description: 'The comment to add to the activity log'
        }
      },
      required: ['comment']
    },
    expects_response: true
  }
];

async function updateAgent() {
  if (!ELEVENLABS_API_KEY) {
    throw new Error('ELEVENLABS_API_KEY not set');
  }

  console.log('📋 Updating Task Assistant agent with client tools...\n');

  const response = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${AGENT_ID}`, {
    method: 'PATCH',
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      conversation_config: {
        agent: {
          first_message: "Hi! I'm ready to help you manage this task. What would you like to do?",
          prompt: {
            prompt: systemPrompt,
            tools: tools
          }
        }
      }
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update agent: ${error}`);
  }

  const result = await response.json();
  console.log('✅ Agent updated successfully!');
  console.log(`   Agent ID: ${result.agent_id}`);
  console.log(`   Tools: update_status, update_notes, add_comment, get_context`);
}

updateAgent().catch(console.error);
