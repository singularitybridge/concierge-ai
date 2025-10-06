# ElevenLabs Slide Tool Setup - Manual Dashboard Configuration

## Overview
Add the `update_slide` tool to the ElevenLabs Conversational AI agent to enable real-time slide updates during voice conversations.

## Why Manual Configuration?
The ElevenLabs API does **NOT** support adding tools programmatically. Tools must be configured through the ElevenLabs Dashboard.

## Current Status
- ✅ Agent: `agent_1701k6s0xmc7e4ysqcqq5msf3yvq` ("Integration Expert Voice Agent")
- ✅ Ngrok URL: `https://36c531a77d34.ngrok-free.app`
- ✅ Webhook endpoint: `/api/update-slide`
- ❌ Tool NOT configured (must be done via dashboard)

---

## Steps to Add Slide Tool in Dashboard

### 1. Navigate to ElevenLabs Dashboard
- Visit: https://elevenlabs.io/app/conversational-ai
- Find agent: "Integration Expert Voice Agent"
- Click on the agent
- Go to "Tools" tab
- Click "Add Tool" button

### 2. Configure Server Tool (Webhook)

**Basic Settings:**
- **Tool Type**: Select "Server" (webhook)
- **Tool Name**: `update_slide`
- **Description**:
  ```
  Update the presentation slide to show relevant information based on the conversation topic.
  Use this when discussing a specific topic, showing examples, or when the user asks to see
  something visually.
  ```
- **Webhook URL**: `https://36c531a77d34.ngrok-free.app/api/update-slide`
- **Wait for Output**: ✅ Enabled (agent waits for webhook response)

### 3. Define Parameters

**Parameter Configuration:**

1. **slideIndex** (required)
   - **Identifier**: `slideIndex`
   - **Data Type**: Number
   - **Required**: ✅ Yes
   - **Description**: The slide index to navigate to (0-4). 0=Welcome, 1=Integration Overview, 2=Technical Details, 3=Code Examples, 4=Next Steps

2. **topic** (required)
   - **Identifier**: `topic`
   - **Data Type**: String
   - **Required**: ✅ Yes
   - **Value Type**: LLM Prompt
   - **Description**: The current topic or title for the slide

3. **content** (optional)
   - **Identifier**: `content`
   - **Data Type**: String
   - **Required**: ❌ No
   - **Value Type**: LLM Prompt
   - **Description**: Optional HTML content to display in the slide. Use bullet points or code snippets.

4. **sessionId** (optional)
   - **Identifier**: `sessionId`
   - **Data Type**: String
   - **Required**: ❌ No
   - **Value Type**: LLM Prompt
   - **Description**: Optional session ID for tracking

**JSON Schema (for reference):**
```json
{
  "type": "object",
  "properties": {
    "slideIndex": {
      "type": "number",
      "description": "The slide index to navigate to (0-4). 0=Welcome, 1=Integration Overview, 2=Technical Details, 3=Code Examples, 4=Next Steps"
    },
    "topic": {
      "type": "string",
      "description": "The current topic or title for the slide"
    },
    "content": {
      "type": "string",
      "description": "Optional: HTML content to display in the slide. Use bullet points or code snippets."
    },
    "sessionId": {
      "type": "string",
      "description": "Optional: Session ID for tracking"
    }
  },
  "required": ["slideIndex", "topic"]
}
```

### 4. Save and Enable
- Click "Save"
- Ensure tool is **ENABLED** (toggle on)
- Verify tool appears in agent's tools list

---

## Expected Behavior

### When ElevenLabs Calls the Tool:

**Request Format:**
```json
{
  "tool_name": "update_slide",
  "parameters": {
    "slideIndex": 1,
    "topic": "Integration Overview",
    "content": "<ul><li>Available integrations</li><li>Authentication methods</li></ul>",
    "sessionId": "conv_xxx"
  }
}
```

**Webhook Response:**
```json
{
  "result": "Slide updated to 1: Integration Overview"
}
```

### What Happens:
1. Voice AI detects topic change in conversation
2. AI calls `update_slide` tool with slide index and topic
3. Webhook updates Agent Hub workspace (`/slides/current.json`)
4. Next.js app polls workspace and detects change
5. Reveal.js navigates to new slide
6. Dynamic content is rendered

---

## Slide Index Reference

| Index | Slide Title | When to Use |
|-------|------------|-------------|
| 0 | Welcome | Initial greeting, general questions |
| 1 | Integration Overview | Discussing available integrations, capabilities |
| 2 | Technical Details | Deep dive into specific integration details |
| 3 | Code Examples | Showing code snippets, implementation |
| 4 | Next Steps | Action items, recommendations, closing |

---

## Testing After Configuration

### 1. Test Webhook Directly
```bash
curl -X POST https://36c531a77d34.ngrok-free.app/api/update-slide \
  -H "Content-Type: application/json" \
  -d '{
    "tool_name": "update_slide",
    "parameters": {
      "slideIndex": 1,
      "topic": "Test Slide",
      "content": "<p>This is a test</p>"
    }
  }'
```

Expected response:
```json
{"result":"Slide updated to 1: Test Slide"}
```

### 2. Test with Live Voice Conversation

**Example Conversation:**
- **User**: "Can you show me the available integrations?"
- **AI**: (Calls `update_slide` with `slideIndex: 1, topic: "Integration Overview"`)
- **Result**: Slide automatically navigates to Integration Overview

**Example with Content:**
- **User**: "Show me a code example for the API"
- **AI**: (Calls `update_slide` with `slideIndex: 3, topic: "API Example", content: "<pre><code>...</code></pre>"`)
- **Result**: Slide navigates to Code Examples with API code displayed

### 3. Verify Workspace Update

Check Agent Hub workspace:
```bash
curl http://127.0.0.1:3000/workspace/session/default/slides/current.json
```

Expected response:
```json
{
  "slideIndex": 1,
  "topic": "Integration Overview",
  "content": "<ul><li>Available integrations</li></ul>",
  "timestamp": 1234567890
}
```

---

## Verification Checklist

After adding tool in dashboard:

- [ ] Tool appears in agent's tools list
- [ ] Tool is marked as "Enabled"
- [ ] Webhook URL is correct: `https://36c531a77d34.ngrok-free.app/api/update-slide`
- [ ] "Wait for output" is enabled
- [ ] All required parameters are configured
- [ ] Parameter data types are correct (Number for slideIndex, String for others)
- [ ] Test conversation triggers slide update (check server logs)
- [ ] Slides navigate automatically in UI
- [ ] Workspace is updated with slide data

---

## Important Notes

### 1. Ngrok URL Changes
When ngrok restarts, update the webhook URL in dashboard:
1. Get new ngrok URL: `ngrok http 3000`
2. Update tool webhook URL in ElevenLabs dashboard
3. Save changes

### 2. Production Deployment
Replace ngrok with permanent HTTPS endpoint:
- Use Vercel, Netlify, or custom domain
- Update webhook URL in dashboard
- No code changes needed

### 3. Monitoring
- **Ngrok Inspector**: http://localhost:4040 (see all webhook calls)
- **Server Logs**: Monitor Next.js for `📥 Slide update received:`
- **Browser DevTools**: Check Zustand store state

### 4. Troubleshooting

**Tool not triggering:**
- Verify tool is enabled in dashboard
- Check webhook URL is accessible (test with curl)
- Review AI system prompt (should mention slide updates)
- Check ngrok tunnel is active

**Slides not updating:**
- Verify workspace update succeeded (check logs)
- Ensure Next.js app is polling workspace
- Check Zustand store state in React DevTools
- Verify Reveal.js is initialized

**Wrong slide index:**
- Update AI's understanding of slide index mapping
- Add examples to system prompt
- Verify parameter type is Number, not String

---

## Related Documentation

- [Voice Agent Integrations](./docs/voice-agent-integrations.mdx)
- [VAPI Slide Tool Setup](./scripts/add-vapi-slide-tool.ts)
- [Slide Presentation Component](./app/components/SlidePresentation.tsx)
- [Workspace Sync Hook](./app/hooks/useSlideSync.ts)
