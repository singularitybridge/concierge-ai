# ElevenLabs Tool Setup - Manual Configuration Required

## Issue
The ElevenLabs API does not properly support adding tools programmatically. Tools must be configured through the **ElevenLabs Dashboard**.

## Current Status
- ✅ Agent created: `agent_1701k6s0xmc7e4ysqcqq5msf3yvq`
- ✅ System prompt configured (instructs agent to use tool)
- ✅ Webhook endpoint working: `/api/elevenlabs-webhook`
- ✅ Ngrok URL: `https://36c531a77d34.ngrok-free.app`
- ❌ Tool NOT configured (must be done via dashboard)

## Steps to Add Tool in Dashboard

1. **Go to ElevenLabs Dashboard**
   - Visit: https://elevenlabs.io/app/conversational-ai
   - Find agent: "Integration Expert Voice Agent"

2. **Navigate to Tools Section**
   - Click on the agent
   - Go to "Tools" tab
   - Click "Add Tool" button

3. **Configure Server Tool (Webhook)**
   - **Tool Type**: Select "Server" (webhook)
   - **Tool Name**: `query_integration_expert`
   - **Description**:
     ```
     Query the integration expert AI agent to get information about available
     integrations, actions, and implementation details. Use this for ANY question
     about integrations or technical topics.
     ```
   - **Webhook URL**: `https://36c531a77d34.ngrok-free.app/api/elevenlabs-webhook`
   - **Wait for Output**: ✅ Enabled (agent waits for webhook response)

4. **Define Parameters** (JSON Schema)
   ```json
   {
     "type": "object",
     "properties": {
       "message": {
         "type": "string",
         "description": "The user's question or query about integrations"
       }
     },
     "required": ["message"]
   }
   ```

5. **Save and Enable**
   - Click "Save"
   - Ensure tool is **ENABLED** (toggle on)

## Testing After Configuration

Once the tool is added in the dashboard, test with:

```bash
# Test webhook endpoint directly (should work already)
npx tsx scripts/test-elevenlabs-webhook.ts

# Test with live agent conversation
# Open ElevenLabs widget and say:
# "List all available integrations"
```

## Expected Webhook Format

ElevenLabs will send:
```json
{
  "conversation_id": "conv_xxx",
  "tool_name": "query_integration_expert",
  "parameters": {
    "message": "user's question"
  }
}
```

Your webhook should respond:
```json
{
  "result": "response text from Agent Hub"
}
```

## Current System Prompt
```
You are a helpful integration expert assistant. When users ask about
integrations, APIs, or technical questions, use the query_integration_expert
tool to get accurate information.

Always use the tool when the user asks technical questions. Pass their
message directly to the tool and respond with the information you receive.
```

## Verification Checklist

After adding tool in dashboard:

- [ ] Tool appears in agent's tools list
- [ ] Tool is marked as "Enabled"
- [ ] Webhook URL is `https://36c531a77d34.ngrok-free.app/api/elevenlabs-webhook`
- [ ] "Wait for output" is enabled
- [ ] Parameter schema matches above
- [ ] Test conversation triggers webhook (check server logs)
- [ ] Agent responds with integration information

## Important Notes

1. **Ngrok URL Changes**: When ngrok restarts, update the webhook URL in dashboard
2. **Production**: Replace ngrok with permanent HTTPS endpoint
3. **Monitoring**: Watch `http://localhost:4040` (ngrok inspector) for webhook calls
4. **Server Logs**: Monitor Next.js server for `📥 ElevenLabs webhook received:`

## Alternative: Use VAPI Instead

VAPI tools CAN be configured via API (already working):
- Tool is configured via API
- Webhook URL set to ngrok
- Function calls working in tests
- System prompt updated

Consider using VAPI if dashboard configuration is not feasible.
