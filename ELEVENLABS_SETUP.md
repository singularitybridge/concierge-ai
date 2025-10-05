# ElevenLabs Integration Setup Guide

This guide explains how to set up the ElevenLabs conversational AI agent integration.

## Overview

The ElevenLabs integration follows the same architecture as VAPI:

```
User speaks → ElevenLabs Agent → Webhook Tool → Integration Expert AI Agent → Response → User
```

## Architecture

1. **ElevenLabs Agent**: Handles voice conversation with the user
2. **Webhook Tool**: `query_integration_expert` - calls our backend when triggered
3. **Webhook Handler**: `/api/elevenlabs-webhook` - processes tool calls
4. **AI Agent**: Integration Expert agent processes the query
5. **Response**: Sent back to ElevenLabs and spoken to user

## Quick Setup (Automated)

### Option 1: Using Setup Script (Recommended)

```bash
# Run the setup script with your webhook URL
npx tsx scripts/setup-elevenlabs-agent.ts https://your-deployed-url.com/api/elevenlabs-webhook

# Or for local testing (requires ngrok or similar)
npx tsx scripts/setup-elevenlabs-agent.ts https://your-ngrok-url.ngrok.io/api/elevenlabs-webhook
```

This script will:
1. Create the ElevenLabs agent via API
2. Configure the webhook tool
3. Update `.env.local` with the agent ID
4. Provide next steps

## Manual Setup

### Step 1: Create the Agent

1. Go to [ElevenLabs Conversational AI Dashboard](https://elevenlabs.io/app/conversational-ai)
2. Click "Create Agent"
3. Configure the agent:
   - **Name**: Integration Expert Voice Agent
   - **First Message**: "Hello! I'm your integration expert assistant. How can I help you today?"
   - **Language**: English
   - **System Prompt**:
     ```
     You are a helpful integration expert assistant. When users ask about integrations, APIs, or technical questions, use the query_integration_expert tool to get accurate information.

     Always use the tool when the user asks technical questions. Pass their message directly to the tool and respond with the information you receive.
     ```

### Step 2: Add Webhook Tool

1. In your agent settings, go to "Tools"
2. Click "Add Tool"
3. Select "Webhook" as the tool type
4. Configure the webhook tool:

   **Basic Settings:**
   - **Tool Name**: `query_integration_expert`
   - **Description**: Query the integration expert AI agent for information about integrations, APIs, and technical questions.
   - **URL**: `https://your-domain.com/api/elevenlabs-webhook`
   - **Method**: POST

   **Parameters:**
   ```json
   {
     "type": "object",
     "properties": {
       "message": {
         "type": "string",
         "description": "The user message or question to send to the integration expert"
       }
     },
     "required": ["message"]
   }
   ```

### Step 3: Configure Environment

1. Copy your agent ID from the dashboard
2. Update `.env.local`:
   ```bash
   NEXT_PUBLIC_ELEVENLABS_AGENT_ID=your-agent-id-here
   ```

3. Restart your Next.js development server

## Testing

### Test via Simulate Conversation API (Text-based)

```bash
# Test with default message
npx tsx scripts/test-elevenlabs-chat.ts

# Test with custom message
npx tsx scripts/test-elevenlabs-chat.ts "What integrations are available?"
```

### Test via Voice UI

1. Open your app at http://localhost:3001
2. Click the purple "Talk (ElevenLabs)" button (bottom-left)
3. Grant microphone permissions
4. Speak your question
5. The agent should respond via voice

## Webhook Payload Format

### Request from ElevenLabs to our webhook:

```json
{
  "tool_name": "query_integration_expert",
  "parameters": {
    "message": "What integrations are available?"
  }
}
```

### Response from our webhook to ElevenLabs:

```json
{
  "result": "Here are the available integrations: ..."
}
```

## Troubleshooting

### Agent ID not configured
- **Error**: "ElevenLabs Agent ID not configured" alert
- **Solution**: Set `NEXT_PUBLIC_ELEVENLABS_AGENT_ID` in `.env.local` and restart dev server

### Webhook not receiving calls
- **Check 1**: Verify webhook URL is publicly accessible (use ngrok for local testing)
- **Check 2**: Ensure tool name is exactly `query_integration_expert`
- **Check 3**: Check ElevenLabs agent logs for webhook errors
- **Check 4**: Verify webhook handler at `/api/elevenlabs-webhook/route.ts` is running

### Connection fails
- **Check 1**: Verify API key in `.env.local`
- **Check 2**: Check browser console for errors
- **Check 3**: Ensure you granted microphone permissions

### Tool not being called
- **Check 1**: Verify the system prompt instructs the agent to use the tool
- **Check 2**: Try more explicit questions like "Use the integration expert tool to tell me about APIs"
- **Check 3**: Check ElevenLabs dashboard logs to see if tool was detected

## Comparison with VAPI

| Feature | VAPI | ElevenLabs |
|---------|------|------------|
| **Button Color** | Blue (right) | Purple (left) |
| **SDK** | `@vapi-ai/web` | `@elevenlabs/react` |
| **Webhook Format** | `results[{toolCallId, result}]` | `{result}` |
| **Connection** | WebSocket | WebRTC/WebSocket |
| **Tool Parameter** | `toolCalls[0].function.arguments` | `parameters` |
| **Test API** | Chat API | Simulate Conversation API |

## Files Structure

```
├── app/
│   ├── api/
│   │   └── elevenlabs-webhook/
│   │       └── route.ts              # Webhook handler
│   ├── components/
│   │   └── ElevenLabsButton.tsx      # UI component
│   └── layout.tsx                     # Includes ElevenLabsButton
├── scripts/
│   ├── setup-elevenlabs-agent.ts     # Automated setup script
│   └── test-elevenlabs-chat.ts       # Text-based test script
└── .env.local                         # Environment variables
```

## Next Steps

1. Test both VAPI and ElevenLabs side-by-side
2. Compare voice quality, latency, and accuracy
3. Implement advanced features from `/docs/vapi-features-to-implement.mdx`
4. Add conversation memory and analytics
