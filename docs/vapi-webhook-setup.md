# VAPI Webhook Setup

## Overview
The VAPI webhook at `/app/api/vapi-webhook/route.ts` now extracts call metadata and passes it to Agent Hub for session persistence and caller identification.

## Configuration

### 1. Update VAPI Tool Server URL
In your VAPI assistant's tool configuration, set the Server URL to:

```
https://YOUR_NGROK_URL.ngrok-free.app/api/vapi-webhook
```

**Example:**
```
https://2197a486470b.ngrok-free.app/api/vapi-webhook
```

### 2. Environment Variables Required
```env
AI_AGENT_API_URL=http://127.0.0.1:3000/assistant/integration-expert/execute
AI_AGENT_API_KEY=your_agent_hub_api_key
```

## What It Does

### 1. Extracts VAPI Metadata
```typescript
- call.id           → Used as sessionId for Agent Hub
- call.customer.phoneNumber → Caller phone number
- call.customer.name        → Caller name (if available)
- call.assistantId          → VAPI assistant ID
- call.metadata             → Custom metadata you set
```

### 2. Passes Context to Agent Hub
```typescript
{
  userInput: "What integrations are available?",
  sessionId: "call_abc123",
  systemPromptOverride: `
    Context: You are speaking with a caller via voice call.
    Caller Phone: +14155551234
    Call Session: call_abc123

    Provide conversational, voice-friendly responses.
    Keep responses concise and natural for voice interaction.
    You may have previous context from this caller in the workspace.
  `
}
```

### 3. Returns Response to VAPI
```typescript
{
  results: [{
    toolCallId: "toolu_abc123",
    result: "Here are the available integrations..."
  }]
}
```

## Console Logs You'll See

When a call comes in, you'll see:

```
📥 VAPI webhook received: {...full payload...}

========================================
📞 VAPI Call Metadata:
  Call ID (Session): call_abc123xyz
  Caller Phone: +14155551234
  Caller Name: John Doe
  Assistant ID: asst_957955fc...
  Custom Metadata: { customerId: "cus_123" }
========================================

🔍 Tool call detection: { isToolCall: true, ... }
🔑 Tool call ID: toolu_xyz789

🌐 Calling agent API: http://127.0.0.1:3000/assistant/integration-expert/execute
📤 Request payload: {
  "userInput": "What integrations are available?",
  "sessionId": "call_abc123xyz",
  "systemPromptOverride": "Context: You are speaking..."
}

📡 Agent response status: 200
📦 Raw agent response: {...}
🤖 Extracted text: Here are the available integrations...

========================================
📤 Returning to VAPI:
  Tool Call ID: toolu_xyz789
  Response Length: 245 chars
  Response Preview: Here are the available integrations...
========================================
```

## Benefits

1. **Session Persistence**: Each call gets a unique session ID
2. **Caller Identification**: Agent knows who's calling
3. **Voice Optimization**: System prompt includes voice-friendly instructions
4. **Debugging**: Comprehensive logging for troubleshooting

## Testing

### Via VAPI Chat API (test-vapi-simulation.html)
The Chat API doesn't include call metadata, so you'll see:
```
Call ID (Session): undefined
Caller Phone: undefined
```

### Via Actual Voice Call
When testing with real VAPI calls, you'll see full metadata.

### Custom Metadata
To pass custom data, set it when creating the call:
```typescript
{
  assistantId: "asst_123",
  customer: {
    phoneNumber: "+14155551234",
    name: "John Doe"
  },
  metadata: {
    customerId: "cus_123",
    accountType: "premium"
  }
}
```

## Next Steps

1. Update your VAPI tool's Server URL to point to this webhook
2. Test with a voice call to see the metadata in console
3. Check Agent Hub workspace for session data persistence
4. Monitor logs to verify caller identification is working
