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

## Advanced Webhook & Tools Configuration

### Understanding ElevenLabs Tool Types (2025)

ElevenLabs supports three types of tools:

1. **Server Tools (Webhooks)**
   - Execute on your backend infrastructure via API calls
   - Best for: Secure data access, business logic, database queries, third-party API integrations
   - Configuration: Dashboard Tools section → Add Tool → Server
   - Requires: Public HTTPS endpoint (ngrok for local dev)

2. **Client Tools**
   - Execute in the user's browser/device using SDK
   - Best for: Device features (camera, notifications, geolocation), UI interactions
   - Configuration: Implemented in your frontend code
   - No webhook required

3. **System Tools**
   - Built-in ElevenLabs platform tools
   - Examples: Sending emails, scheduling, standard operations
   - Configuration: Available in dashboard, no custom code needed

### Server Tool (Webhook) Configuration Deep Dive

#### Dashboard Configuration

1. Navigate to your agent → Tools section
2. Click "Add Tool" → Select "Server" type
3. Configure tool settings:

**Basic Configuration:**
```json
{
  "toolName": "query_integration_expert",
  "type": "server",
  "webhookUrl": "https://your-domain.com/api/elevenlabs-webhook",
  "description": "Query the integration expert AI for technical information",
  "waitForOutput": true
}
```

**Parameters Schema:**
```json
{
  "type": "object",
  "properties": {
    "message": {
      "type": "string",
      "description": "The user's question or message"
    }
  },
  "required": ["message"]
}
```

**Important:**
- `waitForOutput: true` - Agent waits for webhook response before continuing
- `waitForOutput: false` - Agent continues immediately (fire-and-forget)

#### Webhook Request Format

When ElevenLabs calls your webhook, it sends a POST request:

**Headers:**
```
Authorization: Bearer xi-api-key-xxxxx
X-Webhook-Secret: your-webhook-secret (if configured)
Content-Type: application/json
```

**Payload Structure:**
```json
{
  "conversation_id": "conv_abc123",
  "user_id": "user_789",
  "tool_name": "query_integration_expert",
  "transcript": "What integrations are available?",
  "parameters": {
    "message": "What integrations are available?"
  },
  "extracted_variables": {
    "additional_context": "value"
  }
}
```

#### Webhook Response Format

Your endpoint must respond with:

**Success Response (200 OK):**
```json
{
  "result": "Here are the available integrations...",
  "status": "success",
  "variables": {
    "booking_id": "optional-context-for-conversation"
  }
}
```

**Response Requirements:**
- Must return within 2-3 seconds for best UX
- JSON must be valid and match any defined output schema
- For complex queries, consider async processing with status updates

#### Schema Validation

ElevenLabs enforces strict JSON schema validation:

**Output Schema Example:**
```json
{
  "type": "object",
  "properties": {
    "result": {
      "type": "string"
    },
    "data": {
      "type": "object",
      "properties": {
        "count": { "type": "number" },
        "items": {
          "type": "array",
          "items": { "type": "string" }
        }
      }
    }
  },
  "required": ["result"]
}
```

**Critical Rules:**
- All required fields must be present
- No extra fields unless schema allows additionalProperties
- Types must match exactly (string vs number)
- Arrays must contain valid items
- Objects must be proper JSON (not stringified)

### Triggering Agent via API for Testing

#### Method 1: Get Signed URL for WebSocket Connection

```bash
curl -X POST https://api.elevenlabs.io/v1/convai/agents/get_signed_url \
  -H "Authorization: Bearer xi-api-key-xxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "agent_1701k6s0xmc7e4ysqcqq5msf3yvq"
  }'
```

**Response:**
```json
{
  "signed_url": "wss://api.elevenlabs.io/v1/convai/conversation?signature=..."
}
```

Use this URL to establish WebSocket connection for real-time conversation.

#### Method 2: Conversation Simulation API (Text-based testing)

```bash
curl -X POST https://api.elevenlabs.io/v1/convai/conversations \
  -H "Authorization: Bearer xi-api-key-xxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "agent_1701k6s0xmc7e4ysqcqq5msf3yvq",
    "text": "What integrations are available?",
    "mode": "text"
  }'
```

This simulates a conversation turn and should trigger your webhook if the agent decides to use the tool.

### Security Best Practices

1. **Webhook Secret Validation**
   ```typescript
   // Validate webhook secret in header
   const webhookSecret = request.headers.get('x-webhook-secret');
   if (webhookSecret !== process.env.ELEVENLABS_WEBHOOK_SECRET) {
     return new Response('Unauthorized', { status: 401 });
   }
   ```

2. **HMAC Signature Validation**
   ```typescript
   import crypto from 'crypto';

   function validateSignature(payload: string, signature: string, secret: string) {
     const hmac = crypto.createHmac('sha256', secret);
     const digest = hmac.update(payload).digest('hex');
     return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
   }
   ```

3. **Rate Limiting**
   - Implement rate limits on webhook endpoints
   - ElevenLabs may retry failed webhooks

4. **Authentication Headers**
   - Never expose API keys in URLs or query params
   - Always use Authorization header
   - Store secrets in environment variables

### Common Webhook Issues & Solutions

#### Issue 1: Webhook Not Triggering

**Symptoms:**
- Tool defined but never called
- No requests reaching your endpoint
- Agent doesn't acknowledge tool existence

**Solutions:**

1. **Check Agent System Prompt**
   - Must explicitly instruct agent to use the tool
   - Example: "When users ask technical questions, use the query_integration_expert tool"
   - Be specific about when to trigger

2. **Verify Tool Visibility**
   - Tool must be "enabled" in dashboard
   - Check tool name matches exactly (case-sensitive)
   - Ensure tool is associated with the agent

3. **Test Tool Detection**
   - Ask explicit questions: "Use the query_integration_expert tool to help me"
   - Check ElevenLabs dashboard conversation logs
   - Look for tool detection in agent's reasoning

4. **URL Accessibility**
   - Webhook URL must be publicly accessible
   - Test with: `curl -X POST https://your-url.com/webhook -d '{}'`
   - Check firewall/security group rules
   - Verify HTTPS (not HTTP)

#### Issue 2: Webhook Receiving Calls but Not Responding

**Symptoms:**
- Requests reaching endpoint
- No response to user
- Timeout errors in logs

**Solutions:**

1. **Check Response Time**
   - Must respond within 2-3 seconds
   - Optimize slow database queries
   - Consider caching for frequent requests

2. **Validate Response Format**
   - Must be valid JSON
   - Check required fields are present
   - Ensure Content-Type: application/json header

3. **Log Response Details**
   ```typescript
   console.log('Sending response:', JSON.stringify(response, null, 2));
   ```

4. **Test Response Schema**
   - Use JSON schema validator
   - Match response to defined output schema
   - Check for type mismatches

#### Issue 3: 404/500 Errors

**Symptoms:**
- HTTP 404: Not Found
- HTTP 500: Internal Server Error
- Webhook logs show errors

**Solutions:**

1. **Verify Route Configuration**
   ```typescript
   // Next.js: app/api/elevenlabs-webhook/route.ts
   export async function POST(request: Request) {
     // Handler code
   }
   ```

2. **Check Deployment**
   - Route deployed to production
   - Environment variables set
   - Build completed successfully

3. **Test Endpoint Directly**
   ```bash
   curl -X POST https://your-url.com/api/elevenlabs-webhook \
     -H "Content-Type: application/json" \
     -d '{"tool_name": "query_integration_expert", "parameters": {"message": "test"}}'
   ```

4. **Review Server Logs**
   - Check application logs
   - Look for uncaught exceptions
   - Verify dependencies loaded

#### Issue 4: Authentication Failures

**Symptoms:**
- 401 Unauthorized responses
- "Invalid webhook secret" errors
- Requests rejected

**Solutions:**

1. **Verify Secret Configuration**
   - Check environment variable set correctly
   - Ensure no trailing spaces/newlines
   - Match dashboard configuration

2. **Check Header Name**
   - Could be `X-Webhook-Secret` or custom name
   - Review ElevenLabs documentation
   - Test with different header names

3. **Disable Auth Temporarily**
   - Test without auth to isolate issue
   - Re-enable after confirming connection works

#### Issue 5: Multiple Sequential Calls Failing

**Symptoms:**
- First webhook call works
- Subsequent calls in same conversation fail
- Session state issues

**Solutions:**

1. **Implement Session Management**
   ```typescript
   const sessions = new Map();

   export async function POST(request: Request) {
     const { conversation_id } = await request.json();

     // Get or create session
     if (!sessions.has(conversation_id)) {
       sessions.set(conversation_id, { context: {} });
     }

     const session = sessions.get(conversation_id);
     // Process with session context
   }
   ```

2. **Handle Conversation State**
   - Pass context in variables
   - Maintain conversation history
   - Clean up old sessions

3. **Check for Connection Limits**
   - Verify no rate limiting
   - Check concurrent request handling
   - Monitor connection pool

### Testing Workflow

#### Local Development

1. **Setup ngrok**
   ```bash
   ngrok http 3002
   ```

2. **Update Webhook URL**
   - Copy ngrok HTTPS URL
   - Update in ElevenLabs dashboard
   - Format: `https://abc123.ngrok-free.app/api/elevenlabs-webhook`

3. **Test with curl**
   ```bash
   curl -X POST https://abc123.ngrok-free.app/api/elevenlabs-webhook \
     -H "Content-Type: application/json" \
     -d '{
       "tool_name": "query_integration_expert",
       "parameters": { "message": "test" }
     }'
   ```

4. **Monitor Logs**
   - Watch server console
   - Check ngrok request inspector: http://localhost:4040
   - Review response payloads

#### Production Deployment

1. **Deploy Application**
   - Build and deploy to hosting platform
   - Set environment variables
   - Verify route accessibility

2. **Update Webhook URL**
   - Use production domain
   - Must be HTTPS
   - Test endpoint before updating

3. **Monitor and Debug**
   - Use logging service (Datadog, Loggly)
   - Set up error alerts
   - Track webhook success rate

### Dashboard vs API Configuration

**Dashboard (Visual Configuration):**
- **Pros:**
  - Easy, no-code setup
  - Visual interface
  - Good for prototyping
  - Quick testing

- **Cons:**
  - Manual updates
  - Not version controlled
  - Harder to replicate across environments

**API (Programmatic Configuration):**
- **Pros:**
  - Automation & CI/CD integration
  - Version control
  - Environment management
  - Scripted setup

- **Cons:**
  - Requires coding
  - More complex initial setup
  - API changes may break scripts

**Best Practice:**
- Use **dashboard** for initial setup and experimentation
- Use **API** for production deployments and automation
- Document both approaches for team reference

## Troubleshooting

### Agent ID not configured
- **Error**: "ElevenLabs Agent ID not configured" alert
- **Solution**: Set `NEXT_PUBLIC_ELEVENLABS_AGENT_ID` in `.env.local` and restart dev server

### Webhook not receiving calls
- **Check 1**: Verify webhook URL is publicly accessible (use ngrok for local testing)
- **Check 2**: Ensure tool name is exactly `query_integration_expert`
- **Check 3**: Check ElevenLabs agent logs for webhook errors
- **Check 4**: Verify webhook handler at `/api/elevenlabs-webhook/route.ts` is running
- **Check 5**: Review system prompt - must instruct agent when to use tools
- **Check 6**: Test with explicit trigger: "Use the integration expert tool..."
- **Check 7**: Verify tool is enabled in dashboard
- **Check 8**: Check conversation logs in ElevenLabs dashboard

### Connection fails
- **Check 1**: Verify API key in `.env.local`
- **Check 2**: Check browser console for errors
- **Check 3**: Ensure you granted microphone permissions
- **Check 4**: Test with signed URL endpoint
- **Check 5**: Verify WebSocket connection in network tab

### Tool not being called
- **Check 1**: Verify the system prompt instructs the agent to use the tool
- **Check 2**: Try more explicit questions like "Use the integration expert tool to tell me about APIs"
- **Check 3**: Check ElevenLabs dashboard logs to see if tool was detected
- **Check 4**: Ensure waitForOutput is set correctly (true recommended)
- **Check 5**: Verify parameter schema matches expected format

### Webhook timeout or slow responses
- **Check 1**: Optimize backend processing (< 2-3 seconds)
- **Check 2**: Add caching for frequent queries
- **Check 3**: Use async processing for long-running tasks
- **Check 4**: Monitor response times in logs
- **Check 5**: Consider rate limiting and connection pooling

### JSON schema validation errors
- **Check 1**: Ensure all required fields in response
- **Check 2**: Verify field types match schema (string vs number)
- **Check 3**: No extra fields unless additionalProperties allowed
- **Check 4**: Arrays contain valid item types
- **Check 5**: Objects are proper JSON (not stringified)

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

## Your Current Setup Analysis

Based on your configuration:

**Working Components:**
- ✅ Agent ID: `agent_1701k6s0xmc7e4ysqcqq5msf3yvq`
- ✅ Webhook endpoint: `http://localhost:3002/api/elevenlabs-webhook`
- ✅ Ngrok URL: `https://36c531a77d34.ngrok-free.app`
- ✅ Direct webhook testing works (simulated payload successfully calls Agent Hub API)

**Issue: Live Agent Not Triggering Webhook**

### Most Likely Causes:

1. **System Prompt Missing Tool Instruction**
   - The agent's system prompt likely doesn't tell it to use the tool
   - **Solution**: Update agent system prompt in dashboard to include:
     ```
     When users ask technical questions about integrations or APIs,
     use the query_integration_expert tool to get accurate information.
     Always pass the user's question directly to the tool.
     ```

2. **Tool Not Enabled in Dashboard**
   - Tool may be configured but not enabled/active
   - **Solution**: Go to agent → Tools → verify tool is "enabled"

3. **Tool Configuration Mismatch**
   - Tool might be configured with wrong URL (localhost instead of ngrok)
   - **Solution**: Update webhook URL in dashboard to:
     ```
     https://36c531a77d34.ngrok-free.app/api/elevenlabs-webhook
     ```

4. **Agent Not Detecting When to Use Tool**
   - Agent may not understand when tool should be triggered
   - **Solution**: Make system prompt very explicit OR test with explicit request:
     ```
     "Use the query_integration_expert tool to help me with APIs"
     ```

### Debug Steps for Your Situation:

1. **Check Agent Dashboard:**
   ```
   1. Go to ElevenLabs dashboard
   2. Find agent: agent_1701k6s0xmc7e4ysqcqq5msf3yvq
   3. Click Tools section
   4. Verify tool exists and is ENABLED
   5. Check webhook URL is: https://36c531a77d34.ngrok-free.app/api/elevenlabs-webhook
   6. Verify waitForOutput is set to true
   ```

2. **Review System Prompt:**
   ```
   1. Go to agent settings
   2. Find System Prompt field
   3. Add explicit instruction to use query_integration_expert tool
   4. Save changes
   ```

3. **Test with Explicit Trigger:**
   ```bash
   # Use your test script but with explicit tool request
   npx tsx scripts/test-elevenlabs-chat.ts \
     "Please use the query_integration_expert tool to tell me about available integrations"
   ```

4. **Monitor Webhook Traffic:**
   ```bash
   # In one terminal, run ngrok with inspector
   ngrok http 3002

   # In another terminal, watch your app logs
   # Then test agent and check both:
   # - http://localhost:4040 (ngrok inspector)
   # - Your app console logs
   ```

5. **Check Conversation Logs:**
   ```
   1. After testing agent, go to dashboard
   2. Find recent conversation
   3. Check conversation logs/details
   4. Look for:
      - Did agent attempt to use tool?
      - Any error messages?
      - Tool detection status
   ```

### Quick Fix Checklist:

- [ ] System prompt includes explicit tool usage instruction
- [ ] Tool is enabled in dashboard (not just created)
- [ ] Webhook URL in dashboard is ngrok HTTPS (not localhost)
- [ ] `waitForOutput` is set to `true`
- [ ] Tool name is exactly: `query_integration_expert`
- [ ] Parameter schema includes `message` field
- [ ] Ngrok is running and accessible
- [ ] Backend server is running on port 3002
- [ ] Test with explicit tool trigger phrase

### Expected Flow (When Working):

1. User speaks: "What integrations are available?"
2. Agent detects technical question
3. Agent decides to use `query_integration_expert` tool
4. ElevenLabs sends POST to: `https://36c531a77d34.ngrok-free.app/api/elevenlabs-webhook`
5. Your webhook handler receives request
6. Calls Agent Hub API with user message
7. Receives response from Integration Expert agent
8. Returns response to ElevenLabs
9. Agent speaks response to user

### If Still Not Working:

**Test 1: Verify Tool Configuration via API**
```bash
# Get agent details to see tool configuration
curl https://api.elevenlabs.io/v1/convai/agents/agent_1701k6s0xmc7e4ysqcqq5msf3yvq \
  -H "xi-api-key: YOUR_API_KEY"
```

**Test 2: Simulate Conversation**
```bash
curl -X POST https://api.elevenlabs.io/v1/convai/conversations \
  -H "xi-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "agent_1701k6s0xmc7e4ysqcqq5msf3yvq",
    "text": "Use the query_integration_expert tool to tell me about APIs"
  }'
```

**Test 3: Check Webhook from ElevenLabs Side**
- Enable debug logging in your webhook handler
- Add detailed console.log for all incoming requests
- Check if ANY requests from ElevenLabs are reaching ngrok

### Alternative: Recreate Tool

If nothing works, delete and recreate the tool:

1. Delete current tool from dashboard
2. Use setup script to recreate:
   ```bash
   npx tsx scripts/setup-elevenlabs-agent.ts \
     https://36c531a77d34.ngrok-free.app/api/elevenlabs-webhook
   ```
3. Test immediately with explicit trigger phrase

## Next Steps

1. Fix webhook triggering using steps above
2. Test both VAPI and ElevenLabs side-by-side
3. Compare voice quality, latency, and accuracy
4. Implement advanced features from `/docs/vapi-features-to-implement.mdx`
5. Add conversation memory and analytics
