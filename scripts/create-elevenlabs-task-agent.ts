/**
 * Create a Task Assistant ElevenLabs agent
 * - Helps staff manage tasks and updates
 * - Can update status, notes, and add comments
 * - Gets context about the current task
 */

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || 'sk_2626951f5c9cebb6b387f8ace8acb1623a2cfbf46c538ef7';

// Daniel - professional, clear male voice
const VOICE_ID = 'onwK4e9ZLuTAKqWW03F9';

const systemPrompt = `You are a task management assistant for The 1898 Niseko, a luxury boutique hotel in Hokkaido, Japan. Your role is to help hotel staff manage and update tasks efficiently.

## Your Purpose
Help staff members with task management:
- Explain task details and requirements
- Update task status (pending, in-progress, completed, blocked)
- Add notes to tasks
- Add comments to the activity log

## Important
The task details will be provided to you when the conversation starts. Use that information to assist with the task.

## Available Actions
When the user asks you to do something, use the appropriate client tool:
- To update the status, use the update_status tool with values: "pending", "in-progress", "completed", or "blocked"
- To update notes, use the update_notes tool
- To add a comment, use the add_comment tool

## Conversation Style
- Be efficient and action-oriented
- Confirm actions before executing them
- Provide brief status updates after completing actions
- Keep responses concise

## Examples
Staff: "Mark this as complete"
Response: "I'll mark this task as completed." [Use update_status tool with status: completed]

Staff: "Add a note that the guest prefers morning delivery"
Response: "Adding that note now." [Use update_notes tool]

Staff: "What's this task about?"
Response: Reference the task title, description, and relevant details from the context.`;

const clientTools = [
  {
    type: 'client' as const,
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
    type: 'client' as const,
    name: 'update_status',
    description: 'Update the task status. Valid values: pending, in-progress, completed, blocked',
    parameters: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['pending', 'in-progress', 'completed', 'blocked'],
          description: 'The new status for the task'
        }
      },
      required: ['status']
    },
    expects_response: true
  },
  {
    type: 'client' as const,
    name: 'update_notes',
    description: 'Update or append to the task notes',
    parameters: {
      type: 'object',
      properties: {
        notes: {
          type: 'string',
          description: 'The notes to add or update'
        },
        append: {
          type: 'boolean',
          description: 'If true, append to existing notes. If false, replace notes.'
        }
      },
      required: ['notes']
    },
    expects_response: true
  },
  {
    type: 'client' as const,
    name: 'add_comment',
    description: 'Add a comment to the task activity log',
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

async function createAgent() {
  if (!ELEVENLABS_API_KEY) {
    throw new Error('ELEVENLABS_API_KEY not set');
  }

  console.log('📋 Creating Task Assistant agent...\n');

  const response = await fetch('https://api.elevenlabs.io/v1/convai/agents/create', {
    method: 'POST',
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: 'The 1898 Niseko - Task Assistant',
      conversation_config: {
        agent: {
          prompt: {
            prompt: systemPrompt
          },
          first_message: "Hi! I'm here to help you manage this task. What would you like to do?",
          language: 'en'
        },
        tts: {
          voice_id: VOICE_ID
        }
      },
      platform_settings: {
        widget: {
          variant: 'compact'
        }
      },
      client_tools: clientTools
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create agent: ${error}`);
  }

  const result = await response.json();
  console.log('✅ Agent created successfully!');
  console.log(`   Name: ${result.name}`);
  console.log(`   Agent ID: ${result.agent_id}`);
  console.log(`   Voice: Daniel (professional, clear)`);
  console.log(`\n📝 Add this to your .env.local:`);
  console.log(`   NEXT_PUBLIC_ELEVENLABS_TASK_AGENT_ID=${result.agent_id}`);
}

createAgent().catch(console.error);
