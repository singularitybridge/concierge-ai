# VAPI Quick Reference Configurations

Fast-access configuration templates for common use cases. Copy-paste ready.

---

## Premium Quality Configuration (Cost No Object)

```json
{
  "name": "Premium Voice Agent",
  "model": {
    "provider": "anthropic",
    "model": "claude-sonnet-4",
    "temperature": 0.6,
    "maxTokens": 200,
    "topP": 0.9
  },
  "transcriber": {
    "provider": "assemblyai",
    "model": "universal-streaming",
    "language": "en",
    "formatTurns": false,
    "endUtteranceSilenceThreshold": 200
  },
  "voice": {
    "provider": "11labs",
    "voiceId": "EXAVITQu4vr4xnSDxMaL",
    "model": "eleven_flash_v2_5",
    "stability": 0.5,
    "similarityBoost": 0.75,
    "style": 0.3,
    "useSpeakerBoost": true,
    "optimizeStreamingLatency": 4
  },
  "startSpeakingPlan": {
    "waitSeconds": 0.3,
    "smartEndpointing": {
      "enabled": true,
      "provider": "livekit"
    },
    "transcriptionEndpointing": {
      "enabled": true,
      "onPunctuationSeconds": 0.3,
      "onNoPunctuationSeconds": 1.2
    }
  },
  "stopSpeakingPlan": {
    "numWords": 2,
    "voiceSeconds": 0.2,
    "backoffSeconds": 1.0
  },
  "audioProcessing": {
    "backgroundNoiseReduction": "smart",
    "backgroundSpeechDenoising": true,
    "echoCancellation": true,
    "autoGainControl": true
  },
  "responseDelaySeconds": 0,
  "llmRequestDelaySeconds": 0,
  "interruptionThreshold": 50,
  "toolCallConfig": {
    "timeoutSeconds": 10,
    "maxRetries": 2,
    "retryDelayMs": 500
  }
}
```

**Expected Performance:**
- Latency: 500-700ms
- Tool calling accuracy: >95%
- Voice quality: MOS 4.14
- Cost: ~$0.15-0.20/minute

---

## Ultra-Low Latency Configuration (Speed Priority)

```json
{
  "name": "Speed-Optimized Agent",
  "model": {
    "provider": "groq",
    "model": "llama-4-maverick-17b-128e",
    "temperature": 0.5,
    "maxTokens": 150
  },
  "transcriber": {
    "provider": "assemblyai",
    "model": "universal-streaming",
    "language": "en",
    "formatTurns": false,
    "endUtteranceSilenceThreshold": 150
  },
  "voice": {
    "provider": "11labs",
    "model": "eleven_flash_v2_5",
    "voiceId": "EXAVITQu4vr4xnSDxMaL",
    "optimizeStreamingLatency": 4
  },
  "startSpeakingPlan": {
    "waitSeconds": 0.2,
    "smartEndpointing": {
      "enabled": true,
      "provider": "livekit"
    },
    "transcriptionEndpointing": {
      "enabled": true,
      "onPunctuationSeconds": 0.2,
      "onNoPunctuationSeconds": 1.0
    }
  },
  "stopSpeakingPlan": {
    "numWords": 2,
    "voiceSeconds": 0.15,
    "backoffSeconds": 0.8
  },
  "responseDelaySeconds": 0,
  "llmRequestDelaySeconds": 0
}
```

**Expected Performance:**
- Latency: 400-500ms
- Tool calling: Good for simple functions
- Cost: ~$0.08-0.12/minute

---

## Customer Service Configuration

```json
{
  "name": "Customer Service Agent",
  "model": {
    "provider": "openai",
    "model": "gpt-4-turbo",
    "temperature": 0.7,
    "maxTokens": 200,
    "frequencyPenalty": 0.3
  },
  "transcriber": {
    "provider": "assemblyai",
    "model": "universal-streaming",
    "language": "en",
    "formatTurns": false
  },
  "voice": {
    "provider": "11labs",
    "voiceId": "EXAVITQu4vr4xnSDxMaL",
    "model": "eleven_flash_v2_5",
    "stability": 0.6,
    "style": 0.3,
    "optimizeStreamingLatency": 4
  },
  "startSpeakingPlan": {
    "waitSeconds": 0.4,
    "smartEndpointing": { "enabled": true, "provider": "livekit" },
    "transcriptionEndpointing": {
      "enabled": true,
      "onPunctuationSeconds": 0.3,
      "onNoPunctuationSeconds": 1.3
    }
  },
  "stopSpeakingPlan": {
    "numWords": 2,
    "voiceSeconds": 0.2,
    "backoffSeconds": 1.0
  },
  "audioProcessing": {
    "backgroundNoiseReduction": "smart",
    "echoCancellation": true
  },
  "systemPrompt": "You are a friendly, professional customer service agent..."
}
```

---

## Technical Support Configuration

```json
{
  "name": "Technical Support Agent",
  "model": {
    "provider": "anthropic",
    "model": "claude-sonnet-4",
    "temperature": 0.4,
    "maxTokens": 250
  },
  "transcriber": {
    "provider": "assemblyai",
    "model": "universal-streaming",
    "language": "en",
    "formatTurns": false
  },
  "voice": {
    "provider": "11labs",
    "voiceId": "pNInz6obpgDQGcFmaJgB",
    "model": "eleven_flash_v2_5",
    "stability": 0.7,
    "optimizeStreamingLatency": 3
  },
  "startSpeakingPlan": {
    "waitSeconds": 0.6,
    "smartEndpointing": { "enabled": true, "provider": "livekit" },
    "transcriptionEndpointing": {
      "enabled": true,
      "onPunctuationSeconds": 0.4,
      "onNoPunctuationSeconds": 2.0
    }
  },
  "stopSpeakingPlan": {
    "numWords": 3,
    "voiceSeconds": 0.3,
    "backoffSeconds": 1.2
  },
  "toolCallConfig": {
    "timeoutSeconds": 15,
    "maxRetries": 3
  }
}
```

---

## Sales/Outbound Configuration

```json
{
  "name": "Sales Agent",
  "model": {
    "provider": "openai",
    "model": "gpt-4-turbo",
    "temperature": 0.8,
    "maxTokens": 200,
    "presencePenalty": 0.2
  },
  "voice": {
    "provider": "11labs",
    "voiceId": "pqHfZKP75CvOlQylNhV4",
    "model": "eleven_flash_v2_5",
    "stability": 0.4,
    "style": 0.5,
    "optimizeStreamingLatency": 4
  },
  "transcriber": {
    "provider": "assemblyai",
    "model": "universal-streaming",
    "formatTurns": false
  },
  "startSpeakingPlan": {
    "waitSeconds": 0.3,
    "smartEndpointing": { "enabled": true },
    "transcriptionEndpointing": {
      "onPunctuationSeconds": 0.25,
      "onNoPunctuationSeconds": 1.1
    }
  },
  "systemPrompt": "You are an enthusiastic, personable sales representative..."
}
```

---

## Healthcare/Sensitive Configuration

```json
{
  "name": "Healthcare Agent",
  "model": {
    "provider": "anthropic",
    "model": "claude-sonnet-4",
    "temperature": 0.3,
    "maxTokens": 250
  },
  "voice": {
    "provider": "11labs",
    "voiceId": "ThT5KcBeYPX3keUQqHPh",
    "model": "eleven_flash_v2_5",
    "stability": 0.8,
    "style": 0.2,
    "optimizeStreamingLatency": 3
  },
  "transcriber": {
    "provider": "assemblyai",
    "model": "universal-streaming",
    "formatTurns": false
  },
  "startSpeakingPlan": {
    "waitSeconds": 0.8,
    "smartEndpointing": { "enabled": true },
    "transcriptionEndpointing": {
      "onPunctuationSeconds": 0.5,
      "onNoPunctuationSeconds": 2.5
    }
  },
  "stopSpeakingPlan": {
    "numWords": 3,
    "voiceSeconds": 0.3,
    "backoffSeconds": 1.5
  },
  "audioProcessing": {
    "backgroundNoiseReduction": "smart",
    "backgroundSpeechDenoising": true,
    "echoCancellation": true,
    "autoGainControl": true
  },
  "hipaaCompliant": true
}
```

---

## Call Center (High Noise) Configuration

```json
{
  "name": "Call Center Agent",
  "model": {
    "provider": "openai",
    "model": "gpt-4-turbo",
    "temperature": 0.6,
    "maxTokens": 200
  },
  "voice": {
    "provider": "11labs",
    "model": "eleven_flash_v2_5",
    "optimizeStreamingLatency": 4,
    "useSpeakerBoost": true
  },
  "transcriber": {
    "provider": "assemblyai",
    "model": "universal-streaming",
    "formatTurns": false,
    "endUtteranceSilenceThreshold": 250
  },
  "audioProcessing": {
    "backgroundNoiseReduction": "aggressive",
    "backgroundSpeechDenoising": true,
    "echoCancellation": "enhanced",
    "autoGainControl": true,
    "backgroundSound": "office"
  },
  "vadConfig": {
    "threshold": 0.7,
    "aggressiveness": 3
  },
  "startSpeakingPlan": {
    "waitSeconds": 0.4,
    "smartEndpointing": { "enabled": true },
    "transcriptionEndpointing": {
      "onPunctuationSeconds": 0.4,
      "onNoPunctuationSeconds": 1.5
    }
  }
}
```

---

## Voice Selection Guide

### Customer Service (Warm, Professional)

**Female:**
- `EXAVITQu4vr4xnSDxMaL` - Sarah (default, versatile)
- `21m00Tcm4TlvDq8ikWAM` - Rachel (professional)
- `MF3mGyEYCl7XYWbV9V6O` - Elli (calm, reassuring)

**Male:**
- `pNInz6obpgDQGcFmaJgB` - Adam (clear, professional)
- `VR6AewLTigWG4xSOukaG` - Arnold (authoritative)

### Sales (Energetic, Engaging)

**Female:**
- `EXAVITQu4vr4xnSDxMaL` - Sarah
- `pqHfZKP75CvOlQylNhV4` - Bill (energetic male alternative)

**Male:**
- `ErXwobaYiN019PkySvjV` - Antoni (engaging)
- `VR6AewLTigWG4xSOukaG` - Arnold

### Technical Support (Clear, Authoritative)

**Male:**
- `pNInz6obpgDQGcFmaJgB` - Adam (best clarity)
- `TxGEqnHWrfWFTfGW9XjX` - Josh (calm explainer)

**Female:**
- `21m00Tcm4TlvDq8ikWAM` - Rachel

### Healthcare (Calm, Reassuring)

- `MF3mGyEYCl7XYWbV9V6O` - Elli (female, best for healthcare)
- `TxGEqnHWrfWFTfGW9XjX` - Josh (male)
- `ThT5KcBeYPX3keUQqHPh` - Dorothy (gentle female)

---

## Tool Configuration Template

```json
{
  "name": "function_name",
  "description": "Clear description of what this function does. Include when to use it and what it returns. Example: 'Retrieves customer profile including purchase history and preferences. Use when user provides email or customer ID.'",

  "async": false,

  "parameters": {
    "type": "object",
    "properties": {
      "parameter_name": {
        "type": "string",
        "description": "Detailed parameter description with examples. Example: 'Customer email address like john@example.com or customer ID like CUST-12345'"
      }
    },
    "required": ["parameter_name"]
  },

  "messages": {
    "requestStart": "Let me look that up for you...",
    "requestResponseDelayed": "This is taking a moment, please hold...",
    "requestComplete": "Got it!",
    "requestFailed": "I'm having trouble accessing that information. Let me try another way."
  },

  "server": {
    "url": "https://your-api.com/function",
    "timeoutSeconds": 10
  }
}
```

---

## System Prompt Template

```markdown
# Identity
You are [role description]. You help users with [primary function].

# Voice Personality
- [Personality trait 1]
- [Personality trait 2]
- Natural speech: Use "um", "let's see", "hmm" occasionally
- Pauses: Use "..." to indicate brief pauses
- Emphasis: "*word*" for stressed words

# Response Style

## Conciseness
- Keep responses under 2-3 sentences
- If explaining complex info, break into steps
- Ask "Want me to explain more?" instead of monologuing

## Conversation Examples
GOOD: "Sure! Let me check that for you."
BAD: "I will now proceed to query the database."

GOOD: "Your order is... processing. Should arrive Tuesday."
BAD: "Your order status is currently in processing state."

# Available Tools
You have access to:
- **tool_name**: Description of when/how to use

## Tool Usage Rules
- NEVER mention "calling a function" or "using a tool"
- Execute silently and naturally incorporate results
- If missing parameters, ask politely
- If tool fails, provide graceful fallback

# Interruption Handling
- You WILL be interrupted - this is normal
- Stop immediately, listen to new input
- Acknowledge: "Got it" or "Sure"
- Never complain about being interrupted

# Error Handling
If something goes wrong:
1. Apologize naturally: "I'm having trouble with that"
2. Offer alternative or transfer
3. NEVER expose technical errors

# Pronunciation
- Phone numbers: "five-five-five, two-three-four-five"
- Dates: "March nineteenth"
- Prices: "fifty-nine ninety-nine"
- URLs: "I'll send that to your email"
```

---

## Environment-Specific Audio Settings

### Quiet Office/Home
```json
{
  "backgroundSound": "off",
  "audioProcessing": {
    "backgroundNoiseReduction": "light"
  },
  "vadConfig": {
    "threshold": 0.5,
    "aggressiveness": 1
  }
}
```

### Busy Office
```json
{
  "backgroundSound": "office",
  "audioProcessing": {
    "backgroundNoiseReduction": "smart",
    "backgroundSpeechDenoising": true
  },
  "vadConfig": {
    "threshold": 0.6,
    "aggressiveness": 2
  }
}
```

### Call Center
```json
{
  "backgroundSound": "office",
  "audioProcessing": {
    "backgroundNoiseReduction": "aggressive",
    "backgroundSpeechDenoising": true,
    "echoCancellation": "enhanced"
  },
  "vadConfig": {
    "threshold": 0.7,
    "aggressiveness": 3
  }
}
```

### Outdoor/Street
```json
{
  "audioProcessing": {
    "backgroundNoiseReduction": "aggressive",
    "windNoiseReduction": true
  },
  "vadConfig": {
    "threshold": 0.8,
    "aggressiveness": 3
  }
}
```

---

## Temperature Guide

| Use Case | Temperature | Description |
|----------|-------------|-------------|
| Technical Support | 0.3-0.4 | Precise, consistent responses |
| Customer Service | 0.5-0.6 | Reliable with slight variation |
| General Conversation | 0.6-0.7 | Natural, balanced |
| Sales/Engagement | 0.7-0.8 | Creative, personable |
| Creative Tasks | 0.8-0.9 | High variation (use cautiously) |

---

## Max Tokens Guide

| Response Type | Max Tokens | ~Words | Use Case |
|--------------|------------|--------|----------|
| Concise | 100-150 | 70-100 | Quick answers, confirmations |
| Standard | 150-200 | 100-150 | Normal conversation |
| Detailed | 200-300 | 150-225 | Explanations, troubleshooting |
| Complex | 300-400 | 225-300 | Technical details (use sparingly) |

**Recommendation:** Start with 150-200 for voice conversations.

---

## Latency Troubleshooting

If latency >1000ms, check in order:

1. **formatTurns** - Must be `false`
2. **responseDelaySeconds** - Should be `0`
3. **llmRequestDelaySeconds** - Should be `0`
4. **LLM provider** - Groq fastest, Claude/GPT slower
5. **maxTokens** - Lower = faster
6. **Voice model** - Use `eleven_flash_v2_5`
7. **optimizeStreamingLatency** - Set to `4`
8. **Network** - Check server latency

---

## Tool Call Success Troubleshooting

If tool calls failing (>5% failure rate):

1. **LLM model** - Upgrade to Claude Sonnet 4 or GPT-4 Turbo
2. **Function description** - Add detailed examples
3. **System prompt** - Include explicit tool usage guidelines
4. **Parameters** - Show exact format with examples
5. **Timeout** - Increase from default 10s if needed
6. **Retry logic** - Enable with 2-3 retries
7. **Error messages** - Make user-friendly, not technical

---

## Quick Decision Matrix

### Choose LLM:
- **Complex tools + highest accuracy** → Claude Sonnet 4
- **Natural conversation + good tools** → GPT-4 Turbo
- **Speed priority + simple tools** → Groq Llama 4
- **Cost priority + high volume** → Gemini 2.5 Pro

### Choose Voice Provider:
- **Best quality** → ElevenLabs
- **Good quality + lower cost** → PlayHT
- **Enterprise compliance** → Azure TTS

### Choose Latency Target:
- **Ultra-fast (<500ms)** → Groq + ElevenLabs Flash + aggressive settings
- **Balanced (500-700ms)** → GPT-4/Claude + ElevenLabs + standard settings
- **Quality priority (700-1000ms)** → Claude Sonnet 4 + ElevenLabs + relaxed settings

---

## Next Steps

1. Copy relevant configuration above
2. Customize system prompt for your use case
3. Add your tools using template
4. Test with real scenarios
5. Monitor metrics
6. Iterate based on results

For detailed explanations, see the full guide: `VAPI_BEST_PRACTICES_OPTIMIZATION_GUIDE.md`
