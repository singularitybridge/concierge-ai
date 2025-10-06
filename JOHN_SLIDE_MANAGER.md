# John - AI Slide Manager

## Overview
**john** is an AI agent responsible for managing presentation slide state based on conversation context. John proactively updates slides stored in his Agent Hub workspace, which the Next.js app syncs with in real-time.

## Architecture

```
User Conversation → john Agent (68474f065d1be14ff68cd6ae)
                         ↓
                   Calls HTTP API:
                   POST /api/john-slide-update
                         ↓
                   In-memory slide store
                         ↓
                   Next.js polls GET /api/john-slide-update (2s)
                         ↓
                   Zustand Store updates
                         ↓
                   Reveal.js navigates to slide
```

## Agent Details

- **Agent ID**: `68474f065d1be14ff68cd6ae`
- **Name**: john
- **Model**: GPT-4.1-mini
- **Primary Role**: Slide state management
- **Secondary Role**: Creative multimedia generation

## How It Works

### 1. john's Responsibilities

John automatically:
- Monitors conversation context for topic changes
- Updates slide index based on discussion topic
- Generates relevant HTML content for slides
- Stores slide state in workspace at `/slides/current.json`

### 2. Slide Index Mapping

| Index | Slide Title | When john Uses It |
|-------|------------|-------------------|
| 0 | Welcome | Initial greetings, general questions |
| 1 | Integration Overview | Discussing available integrations |
| 2 | Technical Details | Deep dive into technical aspects |
| 3 | Code Examples | Showing code snippets |
| 4 | Next Steps | Action items, recommendations |

### 3. API Format

john calls the slide update API with:
```json
{
  "sessionId": "default",
  "slideIndex": 1,
  "topic": "Integration Overview",
  "content": "<ul><li>Available integrations</li><li>Authentication methods</li></ul>"
}
```

### 4. Next.js Synchronization

The app polls the local API:
- **Endpoint**: `http://localhost:3002/api/john-slide-update?sessionId=default`
- **Poll Interval**: 2 seconds
- **Update Detection**: Timestamp-based change detection
- **Store**: Zustand for state management
- **Storage**: In-memory Map (can be upgraded to Redis/DB)

## Using john for Slide Management

### API Integration

```javascript
const apiUrl = 'http://localhost:3000/assistant/68474f065d1be14ff68cd6ae/execute';
const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NmQ0Y2MzMjg0NjEyMjMzNDEzYmViNzciLCJlbWFpbCI6ImF2aUBzaW5ndWxhcml0eWJyaWRnZS5uZXQiLCJjb21wYW55SWQiOiI2NmQ0MWFjMzQ4N2MxOWY2ZDRjMjNmYTEiLCJpYXQiOjE3NTk2NTg5MDIsImV4cCI6MTc2MDI2MzcwMn0.FCdXMSBPywWbqjMv9pQdor-6WCdkQ9Fk7VkV23M3myE';

async function sendToJohn(userInput) {
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({ userInput })
  });

  const data = await response.json();
  return data.content || data;
}

// john will automatically update slides based on conversation
await sendToJohn('Tell me about the available integrations');
```

### Conversation Examples

**Example 1: Welcome**
- User: "Hello!"
- john: Sets slide 0 (Welcome)

**Example 2: Integration Overview**
- User: "What integrations do you support?"
- john: Sets slide 1 with integration list

**Example 3: Technical Deep Dive**
- User: "How does authentication work?"
- john: Sets slide 2 with technical details

**Example 4: Code Examples**
- User: "Show me a code example"
- john: Sets slide 3 with code snippet

**Example 5: Next Steps**
- User: "What should I do to get started?"
- john: Sets slide 4 with action items

## Testing

### Test Script
```bash
node scripts/test-john-slides.js
```

This sends a series of messages to john that trigger slide transitions.

### Manual Testing

1. **Check current slide state**:
   ```bash
   curl 'http://localhost:3002/api/john-slide-update?sessionId=default'
   ```

2. **Send message to john**:
   ```bash
   curl -X POST http://localhost:3000/assistant/68474f065d1be14ff68cd6ae/execute \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -d '{"userInput": "Tell me about integrations"}'
   ```

3. **Watch Next.js app**:
   - Open http://localhost:3002
   - See slides update automatically
   - Check connection indicator (green = connected)

## Advantages Over Webhook Approach

### Previous Approach (VAPI/ElevenLabs Webhooks)
- ❌ Required voice AI platform to call webhook
- ❌ Platform-specific tool configurations
- ❌ Ngrok needed for local testing
- ❌ Manual dashboard setup (ElevenLabs)
- ❌ Different formats for different platforms

### john Agent Approach
- ✅ **Platform agnostic** - Works with any chat/voice system
- ✅ **Stateless API** - Simple HTTP requests
- ✅ **No webhooks needed** - Direct workspace updates
- ✅ **No ngrok required** - Local development friendly
- ✅ **Proactive intelligence** - john decides when to update slides
- ✅ **Unified storage** - Agent Hub workspace as single source of truth
- ✅ **Easy testing** - Simple API calls, no voice required

## Integration Points

### 1. With VAPI/ElevenLabs Voice
Instead of using the `update_slide` webhook tool, integrate john:
```javascript
// In voice conversation handler
async function handleVoiceMessage(transcript) {
  // Send transcript to john
  const response = await sendToJohn(transcript);

  // john automatically updates slides based on context
  // Next.js app picks up changes via polling

  return response; // Return john's response to voice AI
}
```

### 2. With Chat Interfaces
```javascript
// In chat message handler
async function handleChatMessage(message) {
  const response = await sendToJohn(message);
  // Slides update automatically
  return response;
}
```

### 3. Direct Integration
```javascript
// Any application can send messages to john
const slideManager = {
  updateContext: async (context) => {
    await sendToJohn(context);
    // john will update slides appropriately
  }
};
```

## Files Modified

1. **`/app/api/john-slide-update/route.ts`** (Created)
   - POST endpoint for john to update slides
   - GET endpoint for Next.js to poll current state
   - In-memory Map storage (can upgrade to Redis/DB)

2. **`/app/hooks/useSlideSync.ts`**
   - Changed to poll local Next.js API
   - Now polls: `/api/john-slide-update?sessionId=default`

3. **john's Agent Prompt** (via Agent Hub)
   - Added slide management as primary responsibility
   - Configured to call HTTP API for slide updates
   - Added slide index mapping and HTML content guidelines

4. **`/scripts/test-john-slides.js`** (Created)
   - Test script for john's slide management
   - Demonstrates conversation flow with slide updates

## Monitoring

### Check Connection Status
The Next.js app shows:
- 🟢 Green dot = Connected to john's workspace
- 🔴 Red dot = Connection lost

### View Current Slide State
```bash
# Via Next.js API
curl 'http://localhost:3002/api/john-slide-update?sessionId=default'

# Or visit in browser
http://localhost:3002/api/john-slide-update?sessionId=default
```

### Debug Logs
```javascript
// In browser console
useSlideStore.getState() // View current slide state

// In john's response
// john will log when updating slides
```

## Next Steps

1. ✅ john configured and prompt updated
2. ✅ HTTP API endpoints created
3. ✅ Next.js app syncing with local API
4. ✅ Test script created
5. ⬜ Test john's slide updates with live conversations
6. ⬜ Integrate john with voice conversation flow
7. ⬜ Upgrade storage from in-memory to Redis/DB for production
8. ⬜ Add session-specific context to john
9. ⬜ Implement slide content templates

## Related Documentation

- [Voice Agent Integrations](./docs/voice-agent-integrations.mdx) (old webhook approach)
- [VAPI Slide Tool Setup](./scripts/add-vapi-slide-tool.ts) (deprecated)
- [ElevenLabs Slide Tool Setup](./ELEVENLABS_SLIDE_TOOL_SETUP.md) (deprecated)
- [Agent Hub MCP Documentation](https://docs.singularitybridge.net/agent-hub)
