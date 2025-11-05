# VAPI Tool Server Configuration Research Report

**Date**: 2025-01-10
**Research Method**: Perplexity AI (sonar-pro, sonar-reasoning-pro models)
**Confidence Level**: High
**Status**: ✅ Issue Identified & Solution Documented

---

## Executive Summary

**Problem**: VAPI tool is only sending `{"userInput": "..."}` instead of the full webhook payload with `call.id`, `call.customer`, `message.toolCalls`, and `toolCallId`.

**Root Cause**: The difference in payload structure depends on **WHERE** the `serverUrl` is configured in VAPI:

- **Tool-level `server.url`**: Sends minimal payload (function parameters only)
- **Assistant-level `serverUrl`**: Sends full webhook payload with call metadata
- **serverMessages configuration**: Must include `"tool-calls"` event to receive tool call webhooks

**Solution**: Configure the webhook URL at the **assistant level** (not tool level) and enable `"tool-calls"` in `serverMessages`.

---

## Table of Contents

1. [Understanding VAPI Server URL Configuration](#understanding-vapi-server-url-configuration)
2. [Payload Structure Differences](#payload-structure-differences)
3. [Configuration Hierarchy](#configuration-hierarchy)
4. [Required Configuration for Full Payload](#required-configuration-for-full-payload)
5. [Migration Steps](#migration-steps)
6. [Testing & Verification](#testing--verification)
7. [Common Issues & Solutions](#common-issues--solutions)
8. [Best Practices](#best-practices)
9. [References](#references)

---

## Understanding VAPI Server URL Configuration

### Two Configuration Levels

VAPI provides two distinct ways to configure where webhooks are sent:

#### 1. Tool-Level Server URL (`tool.server.url`)

**Location**: Individual tool/function configuration

**Configuration**:
```json
{
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "integration_expert",
        "parameters": { ... }
      },
      "server": {
        "url": "https://your-api.com/tool-endpoint",
        "timeout": 30
      }
    }
  ]
}
```

**Payload Sent**: **MINIMAL** - Function parameters only
```json
{
  "userInput": "How do I integrate Stripe?"
}
```

**Use Case**: Simple, stateless function execution where you only need the function parameters.

---

#### 2. Assistant-Level Server URL (`assistant.serverUrl`)

**Location**: Assistant configuration (not inside individual tools)

**Configuration**:
```json
{
  "name": "My Assistant",
  "model": { ... },
  "voice": { ... },
  "serverUrl": "https://your-api.com/webhook",
  "serverMessages": [
    "tool-calls",
    "function-call",
    "conversation-update",
    "end-of-call-report"
  ],
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "integration_expert",
        "parameters": { ... }
      }
      // NO server.url here!
    }
  ]
}
```

**Payload Sent**: **FULL** - Complete webhook with call metadata
```json
{
  "message": {
    "type": "tool-calls",
    "toolCalls": [
      {
        "id": "toolu_abc123",
        "type": "function",
        "function": {
          "name": "integration_expert",
          "arguments": {
            "userInput": "How do I integrate Stripe?"
          }
        }
      }
    ],
    "customer": {
      "phoneNumber": "+14155551234"
    }
  },
  "call": {
    "id": "call_abc123xyz",
    "orgId": "org_456def",
    "assistantId": "asst_789ghi",
    "customer": {
      "number": "+14155551234",
      "phoneNumber": "+14155551234",
      "name": "John Doe"
    },
    "status": "in-progress",
    "startedAt": "2025-01-10T15:30:00Z",
    "type": "inboundPhoneCall",
    "metadata": {
      "customerId": "cus_123"
    }
  },
  "toolCallId": "toolu_abc123",
  "messages": [
    {
      "role": "user",
      "content": "I need help with Stripe integration"
    }
  ]
}
```

**Use Case**: When you need call context, session persistence, caller identification, or conversation history.

---

## Payload Structure Differences

### Tool-Level Server Payload (Current Issue)

```json
{
  "userInput": "How do I integrate Stripe payments?"
}
```

**What's Missing**:
- ❌ No `call.id` (can't maintain session)
- ❌ No `call.customer` (can't identify caller)
- ❌ No `toolCallId` (can't properly respond)
- ❌ No `message.toolCalls` structure
- ❌ No call metadata or conversation history

---

### Assistant-Level Server Payload (What You Need)

```json
{
  "message": {
    "type": "tool-calls",
    "role": "tool_calls",
    "time": 1746309515839,
    "secondsFromStart": 14.17,
    "toolCalls": [
      {
        "id": "1746309515838-9g1zeofn3",
        "type": "function",
        "function": {
          "name": "integration_expert",
          "arguments": "{\"userInput\": \"How do I integrate Stripe?\"}"
        }
      }
    ],
    "customer": {
      "phoneNumber": "+14155551234",
      "name": "John Doe",
      "email": "john@example.com"
    }
  },
  "call": {
    "id": "call_abc123xyz",
    "orgId": "org_456def",
    "assistantId": "asst_789ghi",
    "phoneNumber": "+14155551234",
    "customer": {
      "number": "+14155551234",
      "phoneNumber": "+14155551234",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "status": "in-progress",
    "startedAt": "2025-01-10T15:30:00Z",
    "endedAt": null,
    "type": "inboundPhoneCall",
    "costs": [],
    "metadata": {
      "customerId": "cus_123",
      "accountType": "premium"
    }
  },
  "toolCallId": "1746309515838-9g1zeofn3",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful assistant..."
    },
    {
      "role": "user",
      "content": "I need help with Stripe integration"
    },
    {
      "role": "assistant",
      "content": "I can help you with that. Let me get some information..."
    }
  ]
}
```

**What's Included**:
- ✅ `call.id` - Unique call identifier for session tracking
- ✅ `call.customer` - Full caller information (phone, name, email)
- ✅ `call.metadata` - Custom variables you set
- ✅ `toolCallId` - Required for response correlation
- ✅ `message.toolCalls` - Array of all tool calls
- ✅ `messages` - Conversation history
- ✅ Call timing and status information

---

## Configuration Hierarchy

VAPI has a hierarchy for server URLs (higher levels override lower ones):

1. **Function/Tool Level** (`tool.server.url`) - **Highest Priority**
   - If set, only this endpoint receives the tool call
   - Sends minimal payload (parameters only)

2. **Assistant Level** (`assistant.serverUrl`)
   - Receives all events specified in `serverMessages`
   - Sends full webhook payload

3. **Phone Number Level** (for phone number-based assistants)
   - Organization-wide configuration

4. **Organization Level**
   - Account-wide default webhook URL

**Important**: If you set `tool.server.url`, it **overrides** the assistant-level `serverUrl` for that specific tool, and you'll only get the minimal payload.

---

## Required Configuration for Full Payload

### Step 1: Remove Tool-Level Server URL

**Before** (❌ Incorrect - sends minimal payload):
```json
{
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "integration_expert",
        "parameters": {
          "type": "object",
          "properties": {
            "userInput": {
              "type": "string",
              "description": "The user's question"
            }
          }
        }
      },
      "server": {
        "url": "https://your-api.com/webhook/vapi-tool",
        "timeout": 30
      }
    }
  ]
}
```

**After** (✅ Correct - tool has NO server.url):
```json
{
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "integration_expert",
        "parameters": {
          "type": "object",
          "properties": {
            "userInput": {
              "type": "string",
              "description": "The user's question"
            }
          }
        }
      }
      // NO server.url property here!
    }
  ]
}
```

---

### Step 2: Add Assistant-Level Server URL

Add these properties at the **root of your assistant configuration**:

```json
{
  "name": "Integration Expert Assistant",
  "model": {
    "provider": "openai",
    "model": "gpt-4",
    "messages": [
      {
        "role": "system",
        "content": "You are a helpful integration expert..."
      }
    ]
  },
  "voice": {
    "provider": "11labs",
    "voiceId": "21m00Tcm4TlvDq8ikWAM"
  },

  // ADD THESE TWO PROPERTIES:
  "serverUrl": "https://your-api.com/api/vapi-webhook",
  "serverMessages": [
    "tool-calls",
    "function-call",
    "conversation-update",
    "end-of-call-report"
  ],

  "tools": [
    {
      "type": "function",
      "function": {
        "name": "integration_expert",
        "parameters": { ... }
      }
      // NO server.url here!
    }
  ]
}
```

---

### Step 3: Enable Server Messages

The `serverMessages` array tells VAPI which events to send to your webhook:

```json
{
  "serverMessages": [
    "tool-calls",         // ✅ REQUIRED for tool call webhooks
    "function-call",      // ✅ REQUIRED (alternative event type)
    "conversation-update", // Optional: Get conversation state updates
    "end-of-call-report",  // Optional: Get call summary when call ends
    "hang",                // Optional: When user hangs up
    "speech-update",       // Optional: Real-time transcription
    "status-update",       // Optional: Call status changes
    "transcript"           // Optional: Full transcript updates
  ]
}
```

**Minimum Required** for tool calls:
```json
{
  "serverMessages": ["tool-calls", "function-call"]
}
```

---

## Migration Steps

### Option 1: Using VAPI Dashboard

1. **Navigate to your assistant**:
   - Go to VAPI Dashboard → Assistants → Select your assistant

2. **Open Advanced Settings**:
   - Scroll down to "Advanced" section
   - Find "Server URL" field

3. **Configure Server URL**:
   - Enter: `https://your-domain.com/api/vapi-webhook`
   - Save changes

4. **Enable Server Messages**:
   - Find "Server Messages" section
   - Enable: `tool-calls` and `function-call`
   - Save changes

5. **Remove Tool-Level Server URL**:
   - Go to Tools section
   - Select your `integration_expert` tool
   - Remove the "Server URL" field from the tool
   - Save tool configuration

---

### Option 2: Using VAPI API

**Update Assistant Configuration**:

```typescript
import axios from 'axios';

async function updateVapiAssistant() {
  const assistantId = 'asst_your_assistant_id';

  const response = await axios.patch(
    `https://api.vapi.ai/assistant/${assistantId}`,
    {
      serverUrl: 'https://your-api.com/api/vapi-webhook',
      serverMessages: [
        'tool-calls',
        'function-call',
        'conversation-update',
        'end-of-call-report'
      ],
      // Remove server.url from tools
      tools: [
        {
          type: 'function',
          function: {
            name: 'integration_expert',
            description: 'Call integration expert for technical help',
            parameters: {
              type: 'object',
              properties: {
                userInput: {
                  type: 'string',
                  description: 'User question'
                }
              },
              required: ['userInput']
            }
          }
          // NO server property!
        }
      ]
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.VAPI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );

  console.log('Assistant updated:', response.data);
}
```

---

### Option 3: Using Existing Scripts

If you have VAPI configuration scripts:

```bash
# Check current configuration
npm run check-vapi-config

# Update assistant with new server URL
npm run update-vapi-assistant
```

Edit your update script to include:
```typescript
{
  serverUrl: process.env.VAPI_WEBHOOK_URL,
  serverMessages: ['tool-calls', 'function-call', 'end-of-call-report']
}
```

---

## Testing & Verification

### 1. Verify Configuration

**Check your assistant config**:
```bash
curl https://api.vapi.ai/assistant/{assistantId} \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Look for**:
```json
{
  "serverUrl": "https://your-domain.com/api/vapi-webhook",
  "serverMessages": ["tool-calls", "function-call"],
  "tools": [
    {
      "function": { ... }
      // Should NOT have "server" property
    }
  ]
}
```

---

### 2. Test Webhook Payload

**Make a test call** and check your server logs:

```typescript
// In your webhook handler
app.post('/api/vapi-webhook', (req, res) => {
  console.log('========================================');
  console.log('FULL VAPI PAYLOAD:');
  console.log(JSON.stringify(req.body, null, 2));
  console.log('========================================');

  // Verify structure
  const hasFullPayload =
    req.body.call?.id &&
    req.body.call?.customer &&
    req.body.message?.toolCalls &&
    req.body.toolCallId;

  console.log('Has full payload:', hasFullPayload);

  if (!hasFullPayload) {
    console.error('❌ Still receiving minimal payload!');
    console.log('Check assistant configuration.');
  } else {
    console.log('✅ Full payload received!');
  }

  // ... rest of handler
});
```

---

### 3. Expected Log Output

**After correct configuration**, you should see:

```
========================================
FULL VAPI PAYLOAD:
{
  "message": {
    "type": "tool-calls",
    "toolCalls": [
      {
        "id": "toolu_abc123",
        "function": {
          "name": "integration_expert",
          "arguments": "{\"userInput\":\"test\"}"
        }
      }
    ],
    "customer": {
      "phoneNumber": "+14155551234"
    }
  },
  "call": {
    "id": "call_xyz789",
    "customer": {
      "phoneNumber": "+14155551234"
    },
    "assistantId": "asst_123",
    "status": "in-progress",
    "metadata": {}
  },
  "toolCallId": "toolu_abc123",
  "messages": [...]
}
========================================
Has full payload: true
✅ Full payload received!
```

---

## Common Issues & Solutions

### Issue 1: Still Getting Minimal Payload

**Symptoms**:
```json
{ "userInput": "test" }
```

**Solutions**:

1. **Check tool configuration** - Make sure tool does NOT have `server.url`:
```bash
# Verify via API
curl https://api.vapi.ai/assistant/{assistantId} \
  -H "Authorization: Bearer YOUR_API_KEY" | jq '.tools[0].server'

# Should output: null or empty
```

2. **Verify serverMessages includes tool-calls**:
```bash
curl https://api.vapi.ai/assistant/{assistantId} \
  -H "Authorization: Bearer YOUR_API_KEY" | jq '.serverMessages'

# Should include: "tool-calls" and "function-call"
```

3. **Clear VAPI cache** - Sometimes configuration changes take a moment:
   - Wait 30-60 seconds after updating
   - Make a fresh test call

---

### Issue 2: Not Receiving Webhooks at All

**Symptoms**: No POST requests hitting your server

**Solutions**:

1. **Check serverUrl is set** at assistant level:
```json
{
  "serverUrl": "https://your-domain.com/api/vapi-webhook"
}
```

2. **Verify URL is publicly accessible**:
```bash
curl -X POST https://your-domain.com/api/vapi-webhook \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

3. **Check VAPI dashboard logs**:
   - Go to Logs tab in VAPI dashboard
   - Look for webhook delivery attempts
   - Check for error messages

4. **Use ngrok for local testing**:
```bash
ngrok http 3000
# Use the ngrok URL in VAPI configuration
```

---

### Issue 3: Missing call.customer or call.metadata

**Symptoms**: `call.customer` is undefined or null

**Solutions**:

1. **For phone calls**: Customer data is automatically populated

2. **For web calls**: You must provide customer data:
```typescript
const call = await vapi.start({
  assistantId: 'asst_123',
  metadata: {
    customerId: 'cus_123',
    userId: 'user_456'
  }
});
```

3. **For outbound calls**: Set customer in API call:
```json
{
  "assistantId": "asst_123",
  "customer": {
    "number": "+14155551234",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "metadata": {
    "customerId": "cus_123"
  }
}
```

---

### Issue 4: toolCallId Not Present

**Symptoms**: `req.body.toolCallId` is undefined

**Possible Causes**:

1. **Wrong event type**: Your webhook is receiving a different event type
   - Check `req.body.message.type`
   - Should be `"tool-calls"` or `"function-call"`

2. **Tool-level server URL still set**: Revert to assistant-level configuration

3. **serverMessages not configured**: Add `"tool-calls"` to serverMessages array

---

### Issue 5: Response Not Being Spoken

**Symptoms**: Webhook returns response but VAPI doesn't speak it

**Solutions**:

1. **Verify response format**:
```typescript
// Correct format
res.json({
  results: [{
    toolCallId: req.body.toolCallId,
    result: "Here is my response"
  }]
});

// Wrong format (missing results array)
res.json({
  result: "Here is my response"
});
```

2. **Check toolCallId matches**:
```typescript
// Extract correct toolCallId
const toolCallId =
  req.body.toolCallId ||
  req.body.message?.toolCalls?.[0]?.id;

// Return with same ID
res.json({
  results: [{
    toolCallId: toolCallId,
    result: response
  }]
});
```

3. **Verify timeout settings**:
```json
{
  "server": {
    "timeout": 30  // Increase if responses are slow
  }
}
```

---

## Best Practices

### 1. Centralized Webhook for All Tools

**Recommended**: Use assistant-level serverUrl for all tools

```json
{
  "serverUrl": "https://your-api.com/api/vapi-webhook",
  "serverMessages": ["tool-calls", "function-call", "end-of-call-report"],
  "tools": [
    {
      "function": { "name": "tool1", ... }
      // No server.url
    },
    {
      "function": { "name": "tool2", ... }
      // No server.url
    }
  ]
}
```

**Benefits**:
- Single webhook handles all tools
- Consistent payload structure
- Shared session/context management
- Easier logging and debugging

---

### 2. Route Tools in Webhook Handler

```typescript
app.post('/api/vapi-webhook', async (req, res) => {
  const { message, call, toolCallId } = req.body;

  // Extract tool call details
  const toolCall = message.toolCalls?.[0];
  const functionName = toolCall?.function?.name;
  const parameters = JSON.parse(toolCall?.function?.arguments || '{}');

  // Route based on function name
  let result;

  switch (functionName) {
    case 'integration_expert':
      result = await handleIntegrationExpert(parameters, call);
      break;

    case 'booking_tool':
      result = await handleBooking(parameters, call);
      break;

    case 'customer_lookup':
      result = await handleCustomerLookup(parameters, call);
      break;

    default:
      result = `Unknown tool: ${functionName}`;
  }

  // Return response
  res.json({
    results: [{
      toolCallId: toolCallId,
      result: result
    }]
  });
});
```

---

### 3. Extract and Log Metadata

```typescript
// Helper to extract metadata
function extractVapiMetadata(requestBody: any) {
  const { call, message } = requestBody;

  return {
    callId: call?.id,
    sessionId: call?.id, // Use call.id as session identifier
    callerId: call?.customer?.phoneNumber ||
              call?.phoneNumber ||
              message?.customer?.phoneNumber,
    callerName: call?.customer?.name,
    callerEmail: call?.customer?.email,
    assistantId: call?.assistantId,
    callStatus: call?.status,
    callType: call?.type,
    startedAt: call?.startedAt,
    customMetadata: call?.metadata || {}
  };
}

// Use in handler
app.post('/api/vapi-webhook', async (req, res) => {
  const metadata = extractVapiMetadata(req.body);

  console.log('Call Metadata:', metadata);

  // Pass to your business logic
  const result = await processCall(req.body, metadata);

  // ...
});
```

---

### 4. Handle Multiple Event Types

```typescript
app.post('/api/vapi-webhook', async (req, res) => {
  const eventType = req.body.message?.type;

  switch (eventType) {
    case 'tool-calls':
    case 'function-call':
      return handleToolCall(req, res);

    case 'conversation-update':
      return handleConversationUpdate(req, res);

    case 'end-of-call-report':
      return handleEndOfCall(req, res);

    case 'status-update':
      return handleStatusUpdate(req, res);

    default:
      return res.json({ status: 'received' });
  }
});
```

---

### 5. Implement Proper Error Handling

```typescript
app.post('/api/vapi-webhook', async (req, res) => {
  try {
    const { toolCallId } = req.body;

    // Validate required fields
    if (!toolCallId) {
      return res.status(400).json({
        error: 'Missing toolCallId'
      });
    }

    // Process call
    const result = await processToolCall(req.body);

    // Return success
    res.json({
      results: [{
        toolCallId: toolCallId,
        result: result
      }]
    });

  } catch (error) {
    console.error('Webhook error:', error);

    // Return user-friendly error
    res.json({
      results: [{
        toolCallId: req.body.toolCallId,
        result: 'I apologize, but I encountered an error. Please try again.'
      }]
    });
  }
});
```

---

### 6. Use Environment Variables

```typescript
// .env
VAPI_WEBHOOK_URL=https://your-domain.com/api/vapi-webhook
VAPI_API_KEY=your_vapi_api_key
AI_AGENT_API_URL=https://agent-hub.com/execute
AI_AGENT_API_KEY=your_agent_hub_key

// In configuration script
const assistantConfig = {
  serverUrl: process.env.VAPI_WEBHOOK_URL,
  serverMessages: ['tool-calls', 'function-call', 'end-of-call-report'],
  // ...
};
```

---

### 7. Store Call Data for Analytics

```typescript
app.post('/api/vapi-webhook', async (req, res) => {
  const metadata = extractVapiMetadata(req.body);

  // Store call data
  await db.collection('vapi_calls').insertOne({
    callId: metadata.callId,
    callerId: metadata.callerId,
    assistantId: metadata.assistantId,
    functionName: req.body.message?.toolCalls?.[0]?.function?.name,
    timestamp: new Date(),
    metadata: metadata.customMetadata
  });

  // Process call
  const result = await processToolCall(req.body);

  // Store result
  await db.collection('vapi_calls').updateOne(
    { callId: metadata.callId },
    {
      $set: {
        result: result,
        completedAt: new Date()
      }
    }
  );

  // Return response
  res.json({
    results: [{
      toolCallId: req.body.toolCallId,
      result: result
    }]
  });
});
```

---

## References

### Research Sources

1. **Perplexity AI Research** (2025-01-10):
   - sonar-pro model: VAPI tool server configuration basics
   - sonar-reasoning-pro model: Payload structure analysis
   - Multiple searches on serverUrl vs serverMessages configuration

2. **VAPI Official Documentation**:
   - Server URL Events: https://docs.vapi.ai/server-url/events
   - Custom Tools: https://docs.vapi.ai/tools/custom-tools
   - Function Calling: https://docs.vapi.ai/tools/custom-tools#function-calling
   - API Reference: https://docs.vapi.ai/api-reference

3. **Key Findings**:
   - Tool-level server URL overrides assistant-level configuration
   - serverMessages array controls which events are sent
   - Full payload requires assistant-level serverUrl + serverMessages
   - toolCallId is required in response for proper correlation

---

### Related Documentation

- `/docs/vapi-function-calling-metadata-guide.md` - Detailed metadata extraction guide
- `/docs/vapi-webhook-setup.md` - Current webhook implementation
- `/docs/VAPI_BEST_PRACTICES_OPTIMIZATION_GUIDE.md` - Best practices
- `/docs/VAPI_QUICK_REFERENCE_CONFIGS.md` - Configuration reference

---

### Example Assistant Configuration (Complete)

```json
{
  "name": "Integration Expert Assistant",
  "model": {
    "provider": "openai",
    "model": "gpt-4",
    "temperature": 0.7,
    "messages": [
      {
        "role": "system",
        "content": "You are a helpful integration expert. When users ask technical questions, use the integration_expert tool."
      }
    ]
  },
  "voice": {
    "provider": "11labs",
    "voiceId": "21m00Tcm4TlvDq8ikWAM"
  },
  "serverUrl": "https://your-domain.com/api/vapi-webhook",
  "serverMessages": [
    "tool-calls",
    "function-call",
    "conversation-update",
    "end-of-call-report"
  ],
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "integration_expert",
        "description": "Call this tool when the user asks technical questions about integrations, APIs, or needs expert developer guidance.",
        "parameters": {
          "type": "object",
          "properties": {
            "userInput": {
              "type": "string",
              "description": "The user's technical question or request. Be specific and include relevant context."
            }
          },
          "required": ["userInput"]
        }
      }
    }
  ],
  "firstMessage": "Hi! I'm your integration expert. How can I help you today?",
  "endCallMessage": "Thanks for calling. Have a great day!",
  "endCallPhrases": ["goodbye", "bye", "that's all"]
}
```

---

## Conclusion

The key to receiving the full VAPI webhook payload with `call.id`, `call.customer`, `message.toolCalls`, and `toolCallId` is:

1. **Remove** `server.url` from individual tool configurations
2. **Add** `serverUrl` at the assistant level
3. **Configure** `serverMessages` to include `"tool-calls"` and `"function-call"`

This ensures your webhook receives the complete call context, enabling:
- Session persistence across multiple tool calls
- Caller identification and personalization
- Access to conversation history
- Custom metadata propagation
- Proper response correlation via toolCallId

---

**Last Updated**: 2025-01-10
**Research Status**: Complete
**Implementation Status**: Ready for deployment
