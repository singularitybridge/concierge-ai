# VAPI Function Calling & Dynamic Metadata Passing Guide

## Executive Summary

VAPI automatically includes call metadata (session ID, caller phone number, call context) in webhook payloads when custom tools/functions are invoked. This metadata can be accessed from the webhook request body and passed to external APIs like Agent Hub. No special configuration is needed - VAPI includes this information by default in all tool call webhooks.

**Key Takeaway**: When your VAPI assistant calls a custom tool, the webhook receives a rich payload containing call metadata that can be extracted and forwarded to your backend APIs.

---

## Table of Contents

1. [VAPI Function Calling Overview](#vapi-function-calling-overview)
2. [Webhook Payload Structure](#webhook-payload-structure)
3. [Accessing Call Metadata](#accessing-call-metadata)
4. [Passing Metadata to External APIs](#passing-metadata-to-external-apis)
5. [Dynamic Variables](#dynamic-variables)
6. [Configuration Examples](#configuration-examples)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## VAPI Function Calling Overview

### How It Works

1. **Tool Definition**: You define a custom tool/function in your VAPI assistant configuration
2. **Assistant Invocation**: During a call, the LLM decides to call your tool based on the conversation
3. **Webhook Trigger**: VAPI sends a POST request to your tool's server URL
4. **Payload Includes Metadata**: The request body automatically contains call context and metadata
5. **Your Response**: Your server processes the request and returns a result
6. **Continuation**: The assistant uses the result to continue the conversation

### Key Components

```json
{
  "type": "function",
  "function": {
    "name": "integration_expert",
    "description": "Call the Agent Hub integration expert",
    "parameters": {
      "type": "object",
      "properties": {
        "userInput": {
          "type": "string",
          "description": "The user's question or request"
        }
      },
      "required": ["userInput"]
    }
  },
  "server": {
    "url": "https://your-api.com/webhook/vapi-tool-call",
    "timeout": 30
  }
}
```

---

## Webhook Payload Structure

### Complete Request Body

When VAPI calls your custom tool, it sends a POST request with this structure:

```typescript
interface VapiToolCallRequest {
  // Message metadata
  message: {
    type: "tool-calls" | "function-call";

    // The actual function call details
    functionCall?: {
      name: string;
      parameters: {
        [key: string]: any;
      };
    };

    // Customer/caller information
    customer?: {
      phoneNumber?: string;
      number?: string;
      name?: string;
      email?: string;
    };
  };

  // Call context - THIS IS THE KEY SECTION
  call: {
    id: string;                    // Unique call identifier
    orgId: string;                 // Your VAPI organization ID
    assistantId: string;           // Assistant ID handling the call
    phoneNumber?: string;          // Caller's phone number

    // Customer details (may also be in message.customer)
    customer?: {
      number: string;
      phoneNumber: string;
      name?: string;
      email?: string;
    };

    // Call status and timing
    status: "queued" | "ringing" | "in-progress" | "forwarding" | "ended";
    startedAt?: string;            // ISO timestamp
    endedAt?: string;              // ISO timestamp

    // Custom metadata you set
    metadata?: {
      [key: string]: any;
    };

    // Additional call details
    type: "inboundPhoneCall" | "outboundPhoneCall" | "webCall";
    costs?: Array<{
      type: string;
      amount: number;
    }>;
  };

  // Tool call identifier - REQUIRED in response
  toolCallId: string;

  // Optional: messages history
  messages?: Array<{
    role: "user" | "assistant" | "system";
    content: string;
  }>;

  // Optional: async execution context
  async?: {
    enabled: boolean;
    timeoutSeconds?: number;
  };

  // Server configuration
  server?: {
    url: string;
    timeout?: number;
  };
}
```

### Real-World Example Payload

```json
{
  "message": {
    "type": "tool-calls",
    "functionCall": {
      "name": "integration_expert",
      "parameters": {
        "userInput": "How do I integrate Stripe payments?"
      }
    },
    "customer": {
      "phoneNumber": "+14155551234"
    }
  },
  "call": {
    "id": "call_abc123xyz",
    "orgId": "org_456def",
    "assistantId": "asst_789ghi",
    "phoneNumber": "+14155551234",
    "customer": {
      "number": "+14155551234",
      "phoneNumber": "+14155551234"
    },
    "status": "in-progress",
    "startedAt": "2025-01-10T15:30:00Z",
    "type": "inboundPhoneCall",
    "metadata": {
      "customerId": "cus_123",
      "sessionType": "support"
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

---

## Accessing Call Metadata

### Extraction Pattern (Node.js/Express)

```typescript
import express from 'express';

const app = express();
app.use(express.json());

app.post('/webhook/vapi-tool-call', async (req, res) => {
  try {
    // Extract metadata from request body
    const {
      message,
      call,
      toolCallId,
      messages
    } = req.body;

    // Get call metadata
    const callId = call?.id;
    const sessionId = call?.id; // Use call.id as session ID
    const callerId = call?.customer?.phoneNumber ||
                     call?.phoneNumber ||
                     message?.customer?.phoneNumber;

    const assistantId = call?.assistantId;
    const customMetadata = call?.metadata || {};

    // Get function call details
    const functionName = message?.functionCall?.name;
    const functionParams = message?.functionCall?.parameters || {};

    // Validate required fields
    if (!toolCallId) {
      return res.status(400).json({
        error: "Missing toolCallId"
      });
    }

    if (!callId || !functionName) {
      return res.status(400).json({
        error: "Missing required call metadata"
      });
    }

    console.log('VAPI Tool Call Received:', {
      callId,
      callerId,
      functionName,
      parameters: functionParams
    });

    // Your processing logic here...
    const result = await processFunctionCall({
      callId,
      callerId,
      sessionId,
      assistantId,
      functionName,
      functionParams,
      customMetadata
    });

    // Return response with toolCallId
    res.json({
      results: [{
        toolCallId: toolCallId,
        result: result
      }]
    });

  } catch (error) {
    console.error('Error processing VAPI tool call:', error);

    // Return error response
    res.status(500).json({
      results: [{
        toolCallId: req.body.toolCallId,
        result: `Error: ${error.message}`
      }]
    });
  }
});
```

### TypeScript Helper Functions

```typescript
// Type-safe metadata extraction
interface CallMetadata {
  callId: string;
  sessionId: string;
  callerId?: string;
  assistantId: string;
  customMetadata: Record<string, any>;
  callStatus: string;
  callType: string;
  startedAt?: string;
}

function extractCallMetadata(requestBody: any): CallMetadata {
  const call = requestBody.call || {};
  const message = requestBody.message || {};

  return {
    callId: call.id,
    sessionId: call.id, // Use call.id as session identifier
    callerId: call.customer?.phoneNumber ||
              call.phoneNumber ||
              message.customer?.phoneNumber,
    assistantId: call.assistantId,
    customMetadata: call.metadata || {},
    callStatus: call.status || 'unknown',
    callType: call.type || 'unknown',
    startedAt: call.startedAt
  };
}

// Function call extraction
interface FunctionCallInfo {
  name: string;
  parameters: Record<string, any>;
  toolCallId: string;
}

function extractFunctionCall(requestBody: any): FunctionCallInfo {
  const message = requestBody.message || {};
  const functionCall = message.functionCall || {};

  return {
    name: functionCall.name,
    parameters: functionCall.parameters || {},
    toolCallId: requestBody.toolCallId
  };
}
```

---

## Passing Metadata to External APIs

### Agent Hub Integration Example

When calling Agent Hub's execute endpoint with VAPI metadata:

```typescript
import axios from 'axios';

async function callAgentHubWithVapiMetadata(
  vapiRequest: any
): Promise<string> {
  // Extract metadata
  const metadata = extractCallMetadata(vapiRequest);
  const functionCall = extractFunctionCall(vapiRequest);

  // Call Agent Hub API with metadata
  const response = await axios.post(
    'https://agent-hub-api.com/assistant/integration-expert/execute',
    {
      // User's question from VAPI
      userInput: functionCall.parameters.userInput,

      // Pass VAPI metadata as session context
      sessionId: metadata.sessionId,

      // Optional: Include metadata in system prompt override
      systemPromptOverride: `
You are helping a caller (${metadata.callerId || 'unknown'})
in an active voice call (Call ID: ${metadata.callId}).

Call Context:
- Session ID: ${metadata.sessionId}
- Call Status: ${metadata.callStatus}
- Started: ${metadata.startedAt || 'N/A'}

${metadata.customMetadata.customerId ?
  `Customer ID: ${metadata.customMetadata.customerId}` : ''}

Please provide concise, voice-friendly responses suitable for phone conversation.
      `.trim()
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.AGENT_HUB_API_KEY}`,
        'Content-Type': 'application/json',
        // Include VAPI metadata in custom headers for logging
        'X-VAPI-Call-ID': metadata.callId,
        'X-VAPI-Caller-ID': metadata.callerId || 'unknown'
      }
    }
  );

  return response.data.response || response.data.content;
}

// Usage in webhook handler
app.post('/webhook/vapi-tool-call', async (req, res) => {
  try {
    const result = await callAgentHubWithVapiMetadata(req.body);

    res.json({
      results: [{
        toolCallId: req.body.toolCallId,
        result: result
      }]
    });
  } catch (error) {
    console.error('Error calling Agent Hub:', error);
    res.status(500).json({
      results: [{
        toolCallId: req.body.toolCallId,
        result: `Sorry, I encountered an error: ${error.message}`
      }]
    });
  }
});
```

### Generic API Integration Pattern

For any external API that needs call context:

```typescript
interface ExternalAPIRequest {
  // Your API's parameters
  query: string;

  // VAPI call context
  context: {
    callId: string;
    sessionId: string;
    userId?: string;
    phoneNumber?: string;
    metadata: Record<string, any>;
  };
}

async function callExternalAPI(
  vapiRequest: any,
  apiEndpoint: string
): Promise<any> {
  const metadata = extractCallMetadata(vapiRequest);
  const functionCall = extractFunctionCall(vapiRequest);

  const apiRequest: ExternalAPIRequest = {
    query: functionCall.parameters.query,
    context: {
      callId: metadata.callId,
      sessionId: metadata.sessionId,
      userId: metadata.customMetadata.userId,
      phoneNumber: metadata.callerId,
      metadata: metadata.customMetadata
    }
  };

  const response = await axios.post(apiEndpoint, apiRequest);
  return response.data;
}
```

---

## Dynamic Variables

### Setting Variables at Call Initiation

You can set custom variables when creating a call that will be available in `call.metadata`:

```typescript
// Creating outbound call with custom metadata
const callResponse = await axios.post(
  'https://api.vapi.ai/call',
  {
    assistantId: 'asst_789ghi',
    customer: {
      number: '+14155551234'
    },
    // Custom metadata available in all tool calls
    metadata: {
      customerId: 'cus_123',
      accountType: 'premium',
      previousCallCount: 5,
      preferredLanguage: 'en'
    }
  },
  {
    headers: {
      'Authorization': `Bearer ${process.env.VAPI_API_KEY}`
    }
  }
);
```

### Using Variables in Tool Calls

These variables are automatically included in every tool call webhook:

```typescript
app.post('/webhook/vapi-tool-call', async (req, res) => {
  const metadata = req.body.call?.metadata || {};

  // Access custom variables
  const customerId = metadata.customerId;
  const accountType = metadata.accountType;
  const previousCallCount = metadata.previousCallCount;

  console.log('Customer context:', {
    customerId,
    accountType,
    previousCallCount
  });

  // Use in your logic
  if (accountType === 'premium') {
    // Provide enhanced service
  }
});
```

### Variable Injection in Prompts

You can reference variables in assistant prompts using `{{variableName}}` syntax:

```json
{
  "model": {
    "provider": "openai",
    "model": "gpt-4",
    "messages": [
      {
        "role": "system",
        "content": "You are assisting customer {{customerId}} with account type {{accountType}}. This is their call number {{previousCallCount}}."
      }
    ]
  },
  "variableValues": {
    "customerId": "{{metadata.customerId}}",
    "accountType": "{{metadata.accountType}}",
    "previousCallCount": "{{metadata.previousCallCount}}"
  }
}
```

---

## Configuration Examples

### Complete Tool Configuration with Metadata

```json
{
  "name": "Premium Support Assistant",
  "model": {
    "provider": "openai",
    "model": "gpt-4",
    "messages": [
      {
        "role": "system",
        "content": "You are a helpful support assistant. When you need expert technical help, use the integration_expert tool."
      }
    ]
  },
  "voice": {
    "provider": "11labs",
    "voiceId": "21m00Tcm4TlvDq8ikWAM"
  },
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "integration_expert",
        "description": "Call this tool when the user asks technical questions about integrations, API usage, or needs expert developer guidance. This tool connects to a specialized integration expert AI that can provide detailed technical information.",
        "parameters": {
          "type": "object",
          "properties": {
            "userInput": {
              "type": "string",
              "description": "The user's technical question or request. Be specific and include relevant context from the conversation."
            }
          },
          "required": ["userInput"]
        }
      },
      "server": {
        "url": "https://your-api.com/webhook/vapi-integration-expert",
        "timeout": 30
      }
    }
  ],
  "serverUrl": "https://your-api.com/webhook/vapi-events",
  "serverMessages": [
    "tool-calls",
    "function-call",
    "conversation-update",
    "end-of-call-report"
  ]
}
```

### Webhook Handler Complete Example

```typescript
import express from 'express';
import axios from 'axios';

const app = express();
app.use(express.json());

// Configuration
const AGENT_HUB_API_URL = process.env.AGENT_HUB_API_URL || 'https://agent-hub-api.com';
const AGENT_HUB_API_KEY = process.env.AGENT_HUB_API_KEY;

// Main webhook handler
app.post('/webhook/vapi-integration-expert', async (req, res) => {
  try {
    console.log('VAPI Tool Call Received:', JSON.stringify(req.body, null, 2));

    // Extract all metadata
    const {
      message,
      call,
      toolCallId,
      messages
    } = req.body;

    // Validate
    if (!toolCallId) {
      return res.status(400).json({
        error: 'Missing toolCallId'
      });
    }

    if (!message?.functionCall?.parameters?.userInput) {
      return res.status(400).json({
        error: 'Missing userInput parameter'
      });
    }

    // Extract metadata
    const callMetadata = {
      callId: call?.id,
      sessionId: call?.id,
      callerId: call?.customer?.phoneNumber || call?.phoneNumber || message?.customer?.phoneNumber,
      assistantId: call?.assistantId,
      customMetadata: call?.metadata || {},
      callStatus: call?.status,
      startedAt: call?.startedAt
    };

    console.log('Call Metadata:', callMetadata);

    // Build system prompt with context
    const systemPromptOverride = `
You are an integration expert AI assistant helping a caller in an active voice conversation.

Call Context:
- Call ID: ${callMetadata.callId}
- Session ID: ${callMetadata.sessionId}
- Caller: ${callMetadata.callerId || 'Unknown'}
- Status: ${callMetadata.callStatus}

${callMetadata.customMetadata.customerId ?
  `Customer ID: ${callMetadata.customMetadata.customerId}\n` : ''}

Important Guidelines:
1. Provide concise, voice-friendly responses (2-3 sentences)
2. Use clear, simple language suitable for phone conversation
3. If providing code examples, describe them verbally first
4. Offer to send detailed documentation via email/SMS if needed

User's Question: ${message.functionCall.parameters.userInput}
    `.trim();

    // Call Agent Hub
    const agentHubResponse = await axios.post(
      `${AGENT_HUB_API_URL}/assistant/integration-expert/execute`,
      {
        userInput: message.functionCall.parameters.userInput,
        sessionId: callMetadata.sessionId,
        systemPromptOverride: systemPromptOverride
      },
      {
        headers: {
          'Authorization': `Bearer ${AGENT_HUB_API_KEY}`,
          'Content-Type': 'application/json',
          'X-VAPI-Call-ID': callMetadata.callId || 'unknown',
          'X-VAPI-Session-ID': callMetadata.sessionId || 'unknown'
        },
        timeout: 25000 // 25 seconds (less than VAPI's 30s timeout)
      }
    );

    // Extract response
    const result = agentHubResponse.data.response ||
                   agentHubResponse.data.content ||
                   'I received your question but got an unexpected response format.';

    console.log('Agent Hub Response:', result);

    // Return to VAPI
    res.json({
      results: [{
        toolCallId: toolCallId,
        result: result
      }]
    });

  } catch (error) {
    console.error('Error processing VAPI tool call:', error);

    // Return error response
    const errorMessage = error.response?.data?.error ||
                        error.message ||
                        'An unexpected error occurred';

    res.json({
      results: [{
        toolCallId: req.body.toolCallId,
        result: `I apologize, but I encountered an error: ${errorMessage}. Please try rephrasing your question.`
      }]
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`VAPI webhook server running on port ${PORT}`);
});
```

---

## Best Practices

### 1. Always Extract and Log Metadata

```typescript
// Good: Comprehensive logging
console.log('VAPI Tool Call:', {
  callId: call?.id,
  callerId: call?.customer?.phoneNumber,
  functionName: message?.functionCall?.name,
  timestamp: new Date().toISOString()
});

// Bad: No logging
const result = await processCall(req.body);
```

### 2. Validate Required Fields

```typescript
// Good: Validate before processing
if (!toolCallId || !call?.id || !message?.functionCall) {
  return res.status(400).json({
    error: 'Missing required fields',
    received: {
      toolCallId: !!toolCallId,
      callId: !!call?.id,
      functionCall: !!message?.functionCall
    }
  });
}

// Bad: Assume fields exist
const result = await process(message.functionCall.parameters);
```

### 3. Handle Phone Number Variations

```typescript
// Good: Check multiple possible locations
const getCallerPhoneNumber = (requestBody: any): string | undefined => {
  return requestBody.call?.customer?.phoneNumber ||
         requestBody.call?.customer?.number ||
         requestBody.call?.phoneNumber ||
         requestBody.message?.customer?.phoneNumber;
};

// Bad: Assume single location
const phoneNumber = req.body.call.customer.phoneNumber;
```

### 4. Set Appropriate Timeouts

```typescript
// Good: Leave buffer for VAPI timeout
{
  "server": {
    "url": "https://your-api.com/tool",
    "timeout": 30  // VAPI timeout in seconds
  }
}

// In your code: Set shorter timeout
const response = await axios.post(url, data, {
  timeout: 25000  // 25 seconds < 30 second VAPI timeout
});

// Bad: Longer than VAPI timeout
const response = await axios.post(url, data, {
  timeout: 35000  // Will cause VAPI to timeout first
});
```

### 5. Return Helpful Error Messages

```typescript
// Good: User-friendly error for voice
res.json({
  results: [{
    toolCallId: toolCallId,
    result: "I'm having trouble accessing that information right now. Could you please try again, or ask your question in a different way?"
  }]
});

// Bad: Technical error for voice
res.json({
  results: [{
    toolCallId: toolCallId,
    result: "Error 500: Internal server error. Stack trace: ..."
  }]
});
```

### 6. Use TypeScript for Type Safety

```typescript
// Good: Type-safe extraction
interface VapiToolCallRequest {
  message: {
    type: string;
    functionCall?: {
      name: string;
      parameters: Record<string, any>;
    };
    customer?: {
      phoneNumber?: string;
    };
  };
  call: {
    id: string;
    customer?: {
      phoneNumber?: string;
    };
    metadata?: Record<string, any>;
  };
  toolCallId: string;
}

app.post('/webhook', (req: Request<{}, {}, VapiToolCallRequest>, res) => {
  // TypeScript will catch errors
  const callId: string = req.body.call.id;
});
```

### 7. Store Metadata for Analytics

```typescript
// Good: Store for later analysis
await db.collection('vapi_calls').insertOne({
  callId: call.id,
  callerId: getCallerPhoneNumber(req.body),
  functionName: message.functionCall.name,
  parameters: message.functionCall.parameters,
  timestamp: new Date(),
  metadata: call.metadata
});

// Then process the call
const result = await processCall(req.body);
```

---

## Troubleshooting

### Issue: Not Receiving Metadata

**Problem**: Webhook receives request but metadata is missing or undefined

**Solutions**:
1. Check that you're accessing the correct path in the request body
2. Log the entire request body to see structure: `console.log(JSON.stringify(req.body, null, 2))`
3. Verify call type - web calls may have different structure than phone calls

```typescript
// Debug logging
app.post('/webhook', (req, res) => {
  console.log('=== FULL REQUEST BODY ===');
  console.log(JSON.stringify(req.body, null, 2));
  console.log('=== END ===');

  // Then process normally
});
```

### Issue: toolCallId Missing in Response

**Problem**: VAPI shows error "Missing toolCallId in response"

**Solution**: Always include toolCallId in response, even for errors

```typescript
// Correct: Always include toolCallId
res.json({
  results: [{
    toolCallId: req.body.toolCallId,
    result: result
  }]
});

// Wrong: Missing toolCallId
res.json({
  result: result
});
```

### Issue: Timeout Errors

**Problem**: Tool calls timing out

**Solutions**:
1. Increase VAPI tool timeout (default is 20s)
2. Optimize your API calls
3. Use async tools for long-running operations

```json
{
  "server": {
    "url": "https://your-api.com/tool",
    "timeout": 30
  },
  "async": {
    "enabled": true
  }
}
```

### Issue: Phone Number Formats

**Problem**: Phone numbers in different formats (+1, with/without country code)

**Solution**: Normalize phone numbers

```typescript
function normalizePhoneNumber(phone: string | undefined): string | undefined {
  if (!phone) return undefined;

  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');

  // Add +1 if US number without country code
  if (digits.length === 10) {
    return `+1${digits}`;
  }

  // Add + if missing
  if (digits.length > 10 && !phone.startsWith('+')) {
    return `+${digits}`;
  }

  return phone;
}
```

### Issue: Cannot Pass Data Between Tools

**Problem**: Need to share data across multiple tool calls in same conversation

**Solution**: Use call.metadata or maintain server-side session storage

```typescript
// Option 1: Update call metadata (requires API call)
await axios.patch(
  `https://api.vapi.ai/call/${callId}`,
  {
    metadata: {
      ...existingMetadata,
      lastToolResult: result,
      userPreference: preference
    }
  }
);

// Option 2: Server-side session storage
const sessionStore = new Map<string, any>();

app.post('/webhook', async (req, res) => {
  const sessionId = req.body.call.id;

  // Get previous context
  const sessionData = sessionStore.get(sessionId) || {};

  // Process with context
  const result = await processWithContext(req.body, sessionData);

  // Update session
  sessionStore.set(sessionId, {
    ...sessionData,
    lastResult: result,
    timestamp: new Date()
  });

  res.json({
    results: [{
      toolCallId: req.body.toolCallId,
      result: result
    }]
  });
});
```

---

## Testing

### Local Testing with ngrok

```bash
# Terminal 1: Start your webhook server
npm run dev

# Terminal 2: Create public URL
ngrok http 3000

# Use the ngrok URL in VAPI tool configuration
# https://abc123.ngrok.io/webhook/vapi-tool-call
```

### Test Payload

Save this as `test-vapi-payload.json`:

```json
{
  "message": {
    "type": "tool-calls",
    "functionCall": {
      "name": "integration_expert",
      "parameters": {
        "userInput": "How do I integrate Stripe with my Node.js app?"
      }
    },
    "customer": {
      "phoneNumber": "+14155551234"
    }
  },
  "call": {
    "id": "test_call_123",
    "orgId": "org_test",
    "assistantId": "asst_test",
    "phoneNumber": "+14155551234",
    "customer": {
      "number": "+14155551234",
      "phoneNumber": "+14155551234"
    },
    "status": "in-progress",
    "startedAt": "2025-01-10T15:30:00Z",
    "type": "inboundPhoneCall",
    "metadata": {
      "customerId": "test_customer_123",
      "environment": "test"
    }
  },
  "toolCallId": "test_tool_call_123",
  "messages": [
    {
      "role": "user",
      "content": "I need help with Stripe integration"
    }
  ]
}
```

### Testing Script

```bash
# Test your webhook with curl
curl -X POST http://localhost:3000/webhook/vapi-tool-call \
  -H "Content-Type: application/json" \
  -d @test-vapi-payload.json
```

Or with a Node.js script:

```typescript
import axios from 'axios';
import fs from 'fs';

async function testWebhook() {
  const testPayload = JSON.parse(
    fs.readFileSync('test-vapi-payload.json', 'utf-8')
  );

  try {
    const response = await axios.post(
      'http://localhost:3000/webhook/vapi-tool-call',
      testPayload
    );

    console.log('Success!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testWebhook();
```

---

## Summary

### Key Points

1. **Automatic Metadata Inclusion**: VAPI automatically includes call metadata in all tool call webhooks - no special configuration needed

2. **Access Pattern**: Extract metadata from `req.body.call` and `req.body.message` in your webhook handler

3. **Essential Fields**:
   - `call.id` - Unique call identifier (use as session ID)
   - `call.customer.phoneNumber` - Caller's phone number
   - `call.metadata` - Custom variables you set
   - `toolCallId` - Required in response

4. **Passing to External APIs**: Extract metadata in webhook, include in API calls to Agent Hub or other services

5. **Dynamic Variables**: Set custom metadata when creating calls, access in all tool calls

6. **Best Practices**:
   - Always validate and log metadata
   - Handle multiple phone number formats
   - Set appropriate timeouts
   - Return user-friendly error messages
   - Use TypeScript for type safety

### Your Agent Hub Integration

For your specific use case calling Agent Hub's integration-expert:

```typescript
// Extract from VAPI webhook
const sessionId = req.body.call.id;
const callerId = req.body.call.customer?.phoneNumber;
const userInput = req.body.message.functionCall.parameters.userInput;

// Call Agent Hub with context
await axios.post(
  'https://agent-hub-api.com/assistant/integration-expert/execute',
  {
    userInput: userInput,
    sessionId: sessionId,
    systemPromptOverride: `
      Helping caller ${callerId} in voice call ${sessionId}.
      Provide concise, voice-friendly responses.
    `
  }
);
```

---

## References

- **VAPI Custom Tools Documentation**: https://docs.vapi.ai/tools/custom-tools
- **VAPI Server Messages**: https://docs.vapi.ai/server-url/events
- **VAPI Function Calling**: https://docs.vapi.ai/tools/custom-tools#function-calling
- **VAPI API Reference**: https://docs.vapi.ai/api-reference
- **Related Research**: See `vapi-messaging-server-research.md` for messaging server details

---

**Last Updated**: 2025-01-10
**Research Method**: Perplexity AI + VAPI Documentation
**Confidence Level**: High
