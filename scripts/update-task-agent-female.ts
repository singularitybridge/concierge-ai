import axios from 'axios';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || 'sk_f9556323e6be0cac1aa1af8992aa4ae9a2275b2e2f0c0165';
const AGENT_ID = 'agent_0801kb6hm9daeemb72fxchd2nggz';

// Jessica - conversational, cute, young female American voice
const FEMALE_VOICE_ID = 'cgSgspJ2msm6clMCkdW9';

const taskAssistantPrompt = `You are Yuki, a task management assistant for The 1898 Niseko, a luxury boutique hotel in Hokkaido, Japan. You have a warm, professional female voice and help hotel staff manage tasks efficiently.

## CRITICAL: Starting the Conversation
When the conversation starts, you will receive task context via get_context. You MUST:
1. Call get_context immediately to get the current task details
2. Greet the user briefly
3. Provide a quick summary of the task (title, status, priority)
4. Suggest ONE specific action based on the task's current state

Example opening after receiving context:
- If status is "pending": "This is the [task title] task, currently pending. Would you like me to mark it as in progress so we can get started?"
- If status is "in-progress": "I see we're working on [task title]. The notes mention [key detail]. Would you like to add an update or mark it complete?"
- If status is "completed": "This task is already completed. Would you like to add any final notes or review the activity log?"

## Your Personality
- Warm and helpful, like a friendly colleague
- Efficient - get straight to the point
- Proactive - suggest next steps without being asked
- Professional but personable

## Available Tools
You have these tools to manage tasks:
- **get_context**: Call this FIRST to get current task details
- **update_status**: Change status to "pending", "in-progress", "completed", or "blocked"
- **update_notes**: Add notes to the task. Use append: true to add to existing notes
- **add_comment**: Add a comment to the activity log

## Task Status Flow
- pending → in-progress (when starting work)
- in-progress → completed (when finished)
- in-progress → blocked (if there's an issue)
- blocked → in-progress (when issue resolved)

## Guidelines
1. Always call get_context first if you haven't received task details
2. Be proactive - suggest actions based on task state
3. Confirm actions after completing them
4. Keep responses concise but helpful
5. If unsure about a detail, check the notes or ask the user`;

async function updateAgent() {
  try {
    // First, get current agent config to preserve tools
    const getResponse = await axios.get(
      `https://api.elevenlabs.io/v1/convai/agents/${AGENT_ID}`,
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
        },
      }
    );

    const currentTools = getResponse.data.conversation_config?.agent?.prompt?.tools || [];
    console.log('Current tools count:', currentTools.length);
    console.log('Current voice:', getResponse.data.conversation_config?.tts?.voice_id);

    // Update the agent with female voice and new prompt
    const response = await axios.patch(
      `https://api.elevenlabs.io/v1/convai/agents/${AGENT_ID}`,
      {
        name: 'The 1898 Niseko - Yuki (Task Assistant)',
        conversation_config: {
          tts: {
            voice_id: FEMALE_VOICE_ID,
          },
          agent: {
            first_message: "Hi, I'm Yuki, your task assistant. Let me check what we're working on...",
            prompt: {
              prompt: taskAssistantPrompt,
              tools: currentTools,
            },
          },
        },
      },
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Agent updated successfully!');
    console.log('New name:', response.data.name);
    console.log('New voice:', response.data.conversation_config?.tts?.voice_id);
    console.log('First message:', response.data.conversation_config?.agent?.first_message);
  } catch (error: any) {
    console.error('Error updating agent:', error.response?.data || error.message);
  }
}

updateAgent();
