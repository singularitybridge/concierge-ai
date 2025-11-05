# VAPI Tool-Level vs Assistant-Level Server Configuration

Quick visual comparison to understand the difference.

---

## 🔴 WRONG: Tool-Level Server URL (Current Issue)

```
┌─────────────────────────────────────┐
│      VAPI Assistant Config          │
│                                     │
│  ┌───────────────────────────────┐ │
│  │  Tool: integration_expert     │ │
│  │                               │ │
│  │  server: {                    │ │
│  │    url: "your-webhook"  ◄─────┼─┼── This causes minimal payload!
│  │    timeout: 30                │ │
│  │  }                            │ │
│  └───────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
         │
         ▼
   Webhook receives:
   {
     "userInput": "test"
   }

   ❌ Missing: call.id, call.customer, toolCallId, message.toolCalls
```

---

## ✅ CORRECT: Assistant-Level Server URL

```
┌─────────────────────────────────────┐
│      VAPI Assistant Config          │
│                                     │
│  serverUrl: "your-webhook"  ◄───────┼── This sends full payload!
│  serverMessages: [                  │
│    "tool-calls",                    │
│    "function-call"                  │
│  ]                                  │
│                                     │
│  ┌───────────────────────────────┐ │
│  │  Tool: integration_expert     │ │
│  │                               │ │
│  │  function: {                  │ │
│  │    name: "integration_expert" │ │
│  │    parameters: {...}          │ │
│  │  }                            │ │
│  │                               │ │
│  │  ❌ NO server.url here!       │ │
│  └───────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
         │
         ▼
   Webhook receives:
   {
     "message": {
       "type": "tool-calls",
       "toolCalls": [{
         "id": "toolu_abc123",
         "function": {
           "name": "integration_expert",
           "arguments": {...}
         }
       }],
       "customer": {...}
     },
     "call": {
       "id": "call_xyz789",
       "customer": {
         "phoneNumber": "+14155551234",
         "name": "John Doe"
       },
       "assistantId": "asst_123",
       "status": "in-progress",
       "metadata": {...}
     },
     "toolCallId": "toolu_abc123",
     "messages": [...]
   }

   ✅ Includes: Everything you need!
```

---

## Configuration Priority

```
If BOTH are set, tool-level WINS (and you get minimal payload):

Priority:  1. tool.server.url        ← Highest (minimal payload)
           2. assistant.serverUrl     ← Use this one (full payload)
           3. phoneNumber.serverUrl   ← Lower
           4. organization.serverUrl  ← Lowest
```

---

## Migration Checklist

```
Current State (❌):
  Assistant Config:
    └── tools:
          └── integration_expert:
                └── server:
                      └── url: "https://your-webhook"  ← REMOVE THIS

Target State (✅):
  Assistant Config:
    ├── serverUrl: "https://your-webhook"  ← ADD THIS
    ├── serverMessages: ["tool-calls", "function-call"]  ← ADD THIS
    └── tools:
          └── integration_expert:
                └── function:
                      └── name: "integration_expert"
                      └── parameters: {...}
                      ❌ NO server property
```

---

## Quick Test

After updating configuration, check your logs:

### ❌ If you see this (WRONG):
```json
{
  "userInput": "test question"
}
```
→ You still have tool-level server.url configured!

### ✅ If you see this (CORRECT):
```json
{
  "message": {
    "type": "tool-calls",
    "toolCalls": [...]
  },
  "call": {
    "id": "call_abc123",
    "customer": {...}
  },
  "toolCallId": "toolu_xyz"
}
```
→ Configuration is correct!

---

## Response Format

Both configurations require the same response format:

```json
{
  "results": [
    {
      "toolCallId": "toolu_abc123",
      "result": "Your response text here"
    }
  ]
}
```

But only the assistant-level config provides the `toolCallId` in the request!

---

## Summary

| Aspect | Tool-Level Server | Assistant-Level Server |
|--------|-------------------|------------------------|
| **Configuration Location** | Inside `tool.server.url` | Root `assistant.serverUrl` |
| **Payload Type** | Minimal (parameters only) | Full (call metadata + parameters) |
| **Includes call.id** | ❌ No | ✅ Yes |
| **Includes call.customer** | ❌ No | ✅ Yes |
| **Includes toolCallId** | ❌ No | ✅ Yes |
| **Includes message.toolCalls** | ❌ No | ✅ Yes |
| **Session Tracking** | ❌ Difficult | ✅ Easy (use call.id) |
| **Caller Identification** | ❌ Not Available | ✅ Full customer data |
| **Use Case** | Simple, stateless functions | Context-aware, session-based apps |
| **When to Use** | Never (use assistant-level) | Always (for full features) |

---

**Key Takeaway**: Always use assistant-level `serverUrl` + `serverMessages` for full webhook payload. Never set `server.url` inside individual tools.
