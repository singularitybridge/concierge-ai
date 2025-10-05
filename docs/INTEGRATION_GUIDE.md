# Integration Guide: Connecting to AI Agent Hub

This guide shows how to connect the voice chat app to your AI Agent Hub API from `sb-api-services-v2`.

## Prerequisites

1. AI Agent Hub API running (from `/Users/avi/dev/avio/sb/sb-api-services-v2`)
2. At least one AI agent created in the hub
3. API authentication configured

## Step 1: Get Your Agent Credentials

### Option A: Using MCP (Recommended)

If you have the sb-agent-hub MCP server configured:

```typescript
// List all agents
mcp__sb-agent-hub__list_agents()

// Get specific agent info
mcp__sb-agent-hub__get_agent_info({ agentId: "your-agent-id-or-name" })
```

### Option B: Using API Directly

```bash
# List agents
curl -X GET http://localhost:3000/api/v1/agents \
  -H "Authorization: Bearer YOUR_API_KEY"

# Get agent details
curl -X GET http://localhost:3000/api/v1/agents/{agent-id} \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## Step 2: Configure Environment

Update `.env.local` with your agent details:

```env
# Your AI Agent Hub API
AI_AGENT_API_URL=http://localhost:3000/api/v1/agents
AI_AGENT_ID=681b41850f470a9a746f280e
AI_AGENT_API_KEY=your-api-key-here
```

## Step 3: Test the Connection

Create a test script to verify the connection:

```typescript
// test-agent.ts
async function testAgent() {
  const response = await fetch('http://localhost:3000/api/v1/agents/execute', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_API_KEY'
    },
    body: JSON.stringify({
      assistantId: 'your-agent-id',
      userInput: 'Hello, can you hear me?'
    })
  });

  const data = await response.json();
  console.log('Agent response:', data);
}

testAgent();
```

Run:
```bash
npx tsx test-agent.ts
```

## Step 4: Configure VAPI Assistant

1. Go to [VAPI Dashboard](https://dashboard.vapi.ai)
2. Create a new assistant
3. Configure the function/tool:

```json
{
  "name": "chat_with_agent",
  "description": "Send user message to AI agent and get response",
  "parameters": {
    "type": "object",
    "properties": {
      "message": {
        "type": "string",
        "description": "User's message"
      }
    },
    "required": ["message"]
  },
  "url": "https://your-domain.com/api/vapi-webhook",
  "method": "POST"
}
```

4. Set up ngrok for local testing:

```bash
# Install ngrok
brew install ngrok

# Start ngrok
ngrok http 3000

# Copy the HTTPS URL and update VAPI webhook
```

## Step 5: Customize the Webhook

If your AI agent API has a different response format, update `app/api/vapi-webhook/route.ts`:

```typescript
// Example: Custom response parsing
const agentData = await agentResponse.json();

// If your API returns: { data: { message: "..." } }
const responseText = agentData.data?.message || 'No response';

// If your API returns: { result: { text: "..." } }
const responseText = agentData.result?.text || 'No response';

return NextResponse.json({
  result: responseText
});
```

## Step 6: Add Session Management (Optional)

For conversation history, update the webhook to include session IDs:

```typescript
// In route.ts
const sessionId = body.message?.call?.id || 'default';

const agentResponse = await fetch(`${agentApiUrl}/execute`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.AI_AGENT_API_KEY}`
  },
  body: JSON.stringify({
    assistantId: agentId,
    userInput: userMessage,
    sessionId: sessionId  // Add session tracking
  })
});
```

## Troubleshooting

### Issue: "Agent API not configured"
**Solution**: Check that `AI_AGENT_API_URL` and `AI_AGENT_ID` are set in `.env.local`

### Issue: "401 Unauthorized"
**Solution**: Verify `AI_AGENT_API_KEY` is correct and has proper permissions

### Issue: "Agent not responding"
**Solution**:
- Check if AI Agent Hub API is running
- Verify the agent ID exists
- Check API logs for errors

### Issue: "CORS errors"
**Solution**: If webhook is on different domain, configure CORS in AI Agent Hub API

### Issue: "Webhook timeout"
**Solution**: If agent takes >30s to respond, consider:
- Implementing streaming responses
- Using background jobs
- Optimizing agent processing

## Advanced: Streaming Responses

For real-time streaming, modify the webhook to support Server-Sent Events:

```typescript
// Advanced streaming example
export async function POST(req: NextRequest) {
  const stream = new ReadableStream({
    async start(controller) {
      // Stream agent responses
      const response = await fetch(agentApiUrl, {
        // ... config
      });

      const reader = response.body?.getReader();
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          controller.enqueue(value);
        }
      }
      controller.close();
    }
  });

  return new Response(stream);
}
```

## Security Considerations

1. **Never expose private keys**: Keep `VAPI_PRIVATE_KEY` and `AI_AGENT_API_KEY` server-side only
2. **Validate webhooks**: Add VAPI signature verification
3. **Rate limiting**: Implement rate limits on webhook endpoint
4. **Input sanitization**: Validate user input before sending to agent

## Next Steps

- [ ] Add user authentication
- [ ] Implement conversation history
- [ ] Add multi-agent routing
- [ ] Set up monitoring and analytics
- [ ] Configure production deployment

## Resources

- [AI Agent Hub MCP Documentation](https://github.com/your-repo/sb-agent-hub)
- [VAPI Webhooks Guide](https://docs.vapi.ai/webhooks)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
