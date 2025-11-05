# VAPI Best Practices & Optimization Guide 2025

## Executive Summary

This comprehensive guide covers VAPI optimization techniques for maximum voice quality, tool calling success, and conversational excellence. **Cost is not a constraint** - focus is on optimal performance.

**Key Findings:**
- Ultra-low latency achievable: ~465ms end-to-end
- Tool calling success rate depends heavily on prompt engineering
- Voice quality hierarchy: ElevenLabs > PlayHT > Azure
- LLM choice critical for tool use: Claude Sonnet 4 > GPT-4 Turbo > Gemini Pro

---

## 1. Voice Quality Optimization

### 1.1 LLM Model Selection (Premium Tier)

#### Recommended Priority Order

**#1: Claude Sonnet 4** (Best for Tool Calling)
- **Tool calling accuracy**: 72.7% on SWE-bench (highest)
- **Agentic capabilities**: Best-in-class on TAU-bench
- **Features**: Interleaved thinking, parallel tool use
- **Voice conversation**: Excellent reasoning, natural responses
- **Cost**: Higher but worth it for complex interactions
- **Best for**: Multi-tool workflows, complex decision trees

**Configuration:**
```json
{
  "model": "claude-sonnet-4",
  "temperature": 0.6,
  "maxTokens": 250,
  "topP": 0.9
}
```

**#2: GPT-4 Turbo** (Best for Natural Conversation)
- **Voice conversation**: Most natural voice flow and personality
- **Tool calling**: Strong (90.2% coding accuracy)
- **Latency**: Optimized for voice
- **Best for**: Customer-facing conversations, natural dialogue
- **Note**: Can interrupt users (tune endpointing carefully)

**Configuration:**
```json
{
  "model": "gpt-4-turbo",
  "temperature": 0.7,
  "maxTokens": 200,
  "topP": 0.95,
  "frequencyPenalty": 0.3
}
```

**#3: Groq Llama 4 Maverick** (Best for Speed)
- **Latency**: Fastest LLM processing (Groq infrastructure)
- **Balance**: Speed + capability sweet spot
- **Tool calling**: Good for simpler functions
- **Best for**: High-volume, latency-critical applications

**Configuration:**
```json
{
  "model": "llama-4-maverick-17b-128e",
  "temperature": 0.5,
  "maxTokens": 200
}
```

#### Model Comparison Matrix

| Model | Tool Calling | Speed | Conversation | Cost | Use Case |
|-------|-------------|-------|--------------|------|----------|
| Claude Sonnet 4 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | $$$ | Complex workflows |
| GPT-4 Turbo | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | $$$ | Natural dialogue |
| Groq Llama 4 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | $$ | High-volume |
| Gemini 2.5 Pro | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | $ | Multimodal |

### 1.2 Voice Provider Selection

#### Recommended: ElevenLabs (Premium Quality)

**Why ElevenLabs Wins:**
- **MOS Score**: 4.14 (highest in industry)
- **Survey winner**: 37% best-rated vs competitors
- **Pronunciation**: 81.97% accuracy
- **Latency**: 75ms TTFB (time to first byte)
- **Streaming**: 135ms TTFA (time to first audio)
- **Voices**: 32+ languages, custom voice cloning
- **Real-time**: Optimized for conversational AI

**Configuration for Maximum Quality:**
```json
{
  "voiceProvider": "11labs",
  "voiceId": "EXAVITQu4vr4xnSDxMaL",  // Sarah (default high quality)
  "model": "eleven_flash_v2_5",        // Low latency model
  "stability": 0.5,                    // Balance emotion/consistency
  "similarityBoost": 0.75,             // Voice clone accuracy
  "style": 0.3,                        // Natural variation
  "useSpeakerBoost": true,             // Enhanced clarity
  "optimizeStreamingLatency": 4        // Maximum speed priority
}
```

**Voice Selection Guide:**
- **Customer service**: Sarah, Rachel (warm, professional)
- **Technical support**: Adam, Sam (clear, authoritative)
- **Sales**: Bella, Antoni (engaging, energetic)
- **Healthcare**: Elli, Josh (calm, reassuring)

#### Alternative: PlayHT (Good Quality, Lower Cost)

**When to use:**
- Budget constraints (but still premium)
- Need broader voice selection
- SSML support required

**Configuration:**
```json
{
  "voiceProvider": "playht",
  "voiceId": "jennifer",
  "quality": "premium",
  "speed": 1.0,
  "emotion": "natural"
}
```

**Comparison:**
- MOS: 3.8 (vs ElevenLabs 4.14)
- Survey: 11% best-rated
- Latency: Competitive but not documented
- Note: Quality can be inconsistent on long-form

#### Alternative: Azure TTS (Enterprise Grade)

**When to use:**
- Enterprise compliance requirements
- Microsoft ecosystem integration
- Need highest pronunciation accuracy

**Strengths:**
- Pronunciation: 84.72% accuracy (highest)
- Reliability: Enterprise SLA
- Customization: Neural voice tuning

**Weaknesses:**
- MOS: Lower than ElevenLabs
- Latency: Slightly higher TTFA
- Survey: 6% best-rated

### 1.3 Audio Quality Settings

**Optimal Configuration:**
```json
{
  "audioEncoding": "pcm",              // Highest quality
  "sampleRate": 24000,                 // High fidelity
  "bitDepth": 16,                      // CD quality
  "channels": 1,                       // Mono for voice
  "enableAudioEnhancements": true,
  "noiseReduction": "smart",           // AI-powered
  "echoCancellation": true,
  "autoGainControl": true
}
```

### 1.4 Latency Optimization

**Target: ~465ms End-to-End**

Component latency breakdown:
- STT (AssemblyAI): 90ms
- LLM (Groq): 150-200ms
- TTS (ElevenLabs Flash): 75ms
- Network/Processing: 100-150ms
- **Total**: ~465ms

**Critical Settings:**

```json
{
  "transcriber": {
    "provider": "assemblyai",
    "model": "universal-streaming",
    "language": "en",
    "formatTurns": false,            // CRITICAL: saves processing time
    "endUtteranceSilenceThreshold": 200
  },

  "voice": {
    "provider": "11labs",
    "model": "eleven_flash_v2_5",    // Optimized for latency
    "optimizeStreamingLatency": 4    // Maximum speed
  },

  "model": {
    "provider": "groq",               // Fastest infrastructure
    "model": "llama-4-maverick-17b",
    "maxTokens": 150                  // Shorter = faster
  }
}
```

**Response Delay Optimization:**
```json
{
  "responseDelaySeconds": 0,          // Near-zero for natural flow
  "llmRequestDelaySeconds": 0,        // No artificial delays
  "interruptionThreshold": 50         // Fast interruption detection
}
```

---

## 2. Tool Calling Success Rate

### 2.1 Model Selection for Tool Use

**Rankings:**
1. **Claude Sonnet 4**: 72.7% SWE-bench, best agentic performance
2. **GPT-4 Turbo**: 90.2% coding accuracy, strong function calling
3. **Gemini 2.5 Pro**: 63.8% SWE-bench, improving
4. **Groq Llama 4**: Good for simple tools, fast execution

### 2.2 Prompt Engineering for Reliable Tool Calling

#### System Prompt Structure

```markdown
# Identity
You are a professional [role] assistant with access to specialized tools.

# Available Tools
You have access to the following functions:
- **get_customer_data**: Retrieve customer information by ID or email
- **create_ticket**: Create a support ticket with description and priority
- **transfer_call**: Transfer to a human agent or department

# Tool Usage Guidelines

## When to Use Tools
1. Use get_customer_data IMMEDIATELY when user provides identifier
2. Use create_ticket ONLY when user explicitly requests support
3. Use transfer_call when explicitly requested or issue is beyond scope

## How to Use Tools
- NEVER mention "calling a function" or "using a tool"
- Silently execute the function
- Wait for the result before responding
- Incorporate results naturally into conversation

## Critical Rules
- ALWAYS verify you have required parameters before calling
- If missing parameters, ask user politely
- If tool fails, provide graceful fallback response
- NEVER expose technical error messages to user

# Response Style
- Professional and concise
- Natural conversational tone
- No robotic behavior
- Use results to provide helpful answers

# Error Handling
If a tool call fails:
1. Apologize naturally: "I'm having trouble accessing that information"
2. Offer alternative: "Let me try a different approach" or transfer
3. NEVER say: "Function failed" or "Tool error"
```

#### Tool Definition Best Practices

**Good Function Schema:**
```json
{
  "name": "get_customer_data",
  "description": "Retrieves complete customer profile including purchase history, support tickets, and preferences. Use when user provides email, phone, or customer ID. Required for personalized assistance.",

  "parameters": {
    "type": "object",
    "properties": {
      "identifier": {
        "type": "string",
        "description": "Customer email address, phone number, or customer ID. Examples: 'john@example.com', '+1-555-0123', 'CUST-12345'"
      },
      "includeHistory": {
        "type": "boolean",
        "description": "Include purchase and support history. Default true.",
        "default": true
      }
    },
    "required": ["identifier"]
  },

  "messages": {
    "requestStart": "Let me pull up your information...",
    "requestResponseDelayed": "This is taking a moment, please hold...",
    "requestFailed": "I'm having trouble accessing your profile. Let me try another way."
  }
}
```

**Key Principles:**
1. **Descriptive function names**: Use verb-noun format
2. **Clear descriptions**: Include when/why to use
3. **Parameter examples**: Show exact format expected
4. **User-facing messages**: Natural language, not technical
5. **Explicit requirements**: List required vs optional params

### 2.3 Async vs Sync Tool Calls

**Use Synchronous (async: false) when:**
- Response depends on tool result
- User expects immediate answer
- Tool is fast (<2 seconds)
- Example: Database lookups, calculations

```json
{
  "name": "check_inventory",
  "async": false,
  "messages": {
    "requestStart": "Checking availability..."
  }
}
```

**Use Asynchronous (async: true) when:**
- Response doesn't block conversation
- Tool is slow (>2 seconds)
- Side effects only (logging, triggers)
- Example: Send email, create ticket, analytics

```json
{
  "name": "send_confirmation_email",
  "async": true,
  "messages": {
    "requestStart": "I'll send that to your email."
  }
}
```

### 2.4 Error Handling & Retries

**Configuration:**
```json
{
  "toolCallConfig": {
    "timeoutSeconds": 10,              // Max wait per tool
    "maxRetries": 2,                   // Retry failed calls
    "retryDelayMs": 500,               // Backoff between retries
    "fallbackResponse": "I encountered an issue. Let me connect you with a specialist who can help."
  }
}
```

**Server-Side Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "CUSTOMER_NOT_FOUND",
    "userMessage": "I couldn't find that customer record. Could you verify the email or customer ID?",
    "technicalDetails": "Database query returned 0 results for identifier: john@example.com"
  },
  "fallbackOptions": [
    "transfer_to_support",
    "create_new_customer"
  ]
}
```

### 2.5 Testing Tool Reliability

**Metrics to Track:**
- **Tool call success rate**: Target >95%
- **Parameter extraction accuracy**: Target >98%
- **Timeout frequency**: Target <2%
- **Fallback activation rate**: Target <5%

**Testing Checklist:**
- [ ] Test with missing parameters
- [ ] Test with malformed parameters
- [ ] Test timeout scenarios
- [ ] Test network failures
- [ ] Test concurrent tool calls
- [ ] Test interruption during tool execution

---

## 3. Conversational Quality

### 3.1 Prompt Engineering for Voice

**Key Principles:**
1. Write for spoken, not written communication
2. Use short, clear sentences
3. Avoid complex vocabulary
4. Include natural speech patterns
5. Design for interruptions

**Example Voice-Optimized Prompt:**

```markdown
# Identity
You are Alex, a friendly customer support agent.

# Voice Personality
- Warm and approachable
- Slightly casual but professional
- Use occasional filler words: "um", "let's see", "alright"
- Natural pauses: "..." indicates brief pause
- Emphasis: "*word*" for stressed words

# Response Style

## Keep It Conversational
GOOD: "Sure! Let me check that for you."
BAD: "I will now proceed to query the database for the requested information."

GOOD: "Hmm, looks like your order is... still in processing. Should arrive Tuesday."
BAD: "Your order status is currently in the processing state. Estimated delivery date: 2024-03-19."

## Handle Interruptions Gracefully
If interrupted:
- Stop mid-sentence naturally
- Acknowledge: "Oh, go ahead" or "Yes?"
- Adapt to new topic without complaint

## Response Length
- Keep responses under 3 sentences when possible
- If explaining complex info, break into steps and pause
- Ask if user wants more details: "Want me to explain more?"

# Pronunciation Guide
- Phone numbers: "five-five-five, two-three-four-five" (not individual digits)
- Dates: "March nineteenth" (not "three slash nineteen")
- Prices: "fifty-nine ninety-nine" (not "five nine point nine nine")
- URLs: Don't spell out, say "I'll send that link to your email"

# Emotional Intelligence
- Match user's energy level
- If user is frustrated: acknowledge, empathize, solve
- If user is happy: match enthusiasm
- If user is confused: slow down, simplify, confirm understanding
```

### 3.2 Response Length Optimization

**Target Metrics:**
- Average response: 15-30 words
- Maximum response: 50 words
- Exceptions: Explanations up to 75 words with pauses

**Configuration:**
```json
{
  "model": {
    "maxTokens": 200,                 // ~150 words max
    "temperature": 0.7,                // Natural variation
    "presencePenalty": 0.3,            // Avoid repetition
    "frequencyPenalty": 0.3            // Encourage brevity
  }
}
```

**Prompt Guidance:**
```markdown
# Response Length Rules
- Default response: 1-2 sentences max
- If explaining something: Break into chunks, wait for confirmation
- If listing options: Maximum 3 at a time, ask "Want more?"
- NEVER monologue - conversational ping-pong

Example:
USER: "What's my order status?"
GOOD: "Your order shipped yesterday! Should arrive Wednesday."
BAD: "Thank you for inquiring about your order status. I've checked our system and I can confirm that your order has been processed and shipped. The tracking information shows that it departed our fulfillment center yesterday and is currently in transit. Based on the shipping method you selected, the estimated delivery date is Wednesday."
```

### 3.3 Interruption Handling

**Configuration:**
```json
{
  "stopSpeakingPlan": {
    "numWords": 2,                    // Stop after 2 words spoken
    "voiceSeconds": 0.2,               // 200ms of speech detected
    "backoffSeconds": 1.0              // Resume after 1 second pause
  },

  "interruptionConfig": {
    "enabled": true,
    "sensitivity": "high",             // Catch subtle interruptions
    "resumeBehavior": "contextual"     // Smart resume vs restart
  }
}
```

**Prompt Guidance:**
```markdown
# Handling Interruptions

You WILL be interrupted frequently. This is normal in conversation.

## When Interrupted
1. Stop immediately (system handles this)
2. Listen to user's new input
3. Acknowledge if appropriate: "Got it" or "Sure"
4. Respond to NEW topic (don't return to previous unless asked)

## Do NOT Say
- "Let me finish"
- "As I was saying"
- "You interrupted me"
- Any complaint about being interrupted

## DO Say (if relevant)
- "Oh, okay!" (cheerful pivot)
- "Sure, happy to help with that"
- "Got it, let's look at that instead"
```

### 3.4 Background Noise Handling

**Smart Denoising (Recommended):**
```json
{
  "audioProcessing": {
    "backgroundNoiseReduction": "smart",  // AI-powered Krisp
    "aggressiveness": "moderate",         // Balance noise vs voice quality
    "adaptiveFiltering": true             // Adjust to environment
  }
}
```

**Background Speech Denoising:**
```json
{
  "backgroundSpeechDenoising": {
    "enabled": true,                   // Filter out TV, other voices
    "focusOnPrimarySpeaker": true,     // Proprietary VAPI model
    "echoSuppression": true
  }
}
```

**Voice Activity Detection Tuning:**
```json
{
  "vadConfig": {
    "threshold": 0.5,                  // Default for normal environments
    "aggressiveness": 2,               // Scale 0-3, higher = more aggressive
    "silenceBuffer": 300               // 300ms silence to detect speech end
  }
}
```

**Environment-Specific Settings:**

```json
// Quiet office/home
{
  "backgroundSound": "off",
  "vadThreshold": 0.5,
  "denoising": "light"
}

// Busy office
{
  "backgroundSound": "office",
  "vadThreshold": 0.6,
  "denoising": "smart",
  "backgroundSpeechDenoising": true
}

// Call center
{
  "backgroundSound": "office",
  "vadThreshold": 0.7,
  "denoising": "aggressive",
  "backgroundSpeechDenoising": true,
  "echoCancellation": "enhanced"
}

// Street/outdoor
{
  "vadThreshold": 0.8,
  "denoising": "aggressive",
  "windNoiseReduction": true
}
```

### 3.5 Filler Words & Natural Speech

**Include Natural Speech Patterns:**

```markdown
# Natural Speech Elements

## Filler Words (Use Sparingly)
- "um" - when thinking
- "let's see" - before looking something up
- "hmm" - when considering options
- "well" - when pivoting or softening
- "alright" - transitioning to action

Examples:
"Hmm, let me check that for you..."
"Alright, so it looks like your order is on the way."
"Um, I'm not seeing that in our system. Could you verify the order number?"

## Acknowledgment Sounds
- "Mm-hmm" - understanding/agreement
- "Oh!" - realization
- "Ah" - understanding
- "Okay" - confirmation

## Emphasis Markers
Use *asterisks* for emphasis in your internal processing:
"That's *really* important to note."
"We can *definitely* help with that."

## Pauses
Use "..." in responses to indicate natural pauses:
"Your account shows... three active subscriptions."
"Let me see... yes, I can transfer you to that department."
```

**Important**: Don't overuse - should feel natural, not forced.

---

## 4. Configuration Parameters

### 4.1 Temperature Settings

**Voice Conversation Recommendations:**

```json
// Customer service (consistent, reliable)
{
  "temperature": 0.5,
  "topP": 0.9
}

// Sales/engagement (creative, personable)
{
  "temperature": 0.7,
  "topP": 0.95
}

// Technical support (precise, structured)
{
  "temperature": 0.4,
  "topP": 0.85
}

// General conversation (balanced)
{
  "temperature": 0.6,
  "topP": 0.9
}
```

**Effects:**
- **Low (0.3-0.5)**: Predictable, consistent, safe responses
- **Medium (0.5-0.7)**: Natural variation, recommended for most use cases
- **High (0.7-0.9)**: Creative, variable, risk of hallucination

### 4.2 Max Tokens

**Voice-Specific Guidelines:**

```json
// Concise responses (recommended)
{
  "maxTokens": 150,        // ~100 words
  "targetTokens": 50       // ~35 words average
}

// Standard responses
{
  "maxTokens": 200,        // ~150 words
  "targetTokens": 75       // ~50 words average
}

// Detailed explanations (use sparingly)
{
  "maxTokens": 300,        // ~225 words
  "targetTokens": 100      // ~75 words average
}
```

**Why Keep Low:**
1. Faster generation = lower latency
2. Users prefer concise in voice
3. Natural conversation ping-pong
4. Reduces token costs
5. Better interruption handling

### 4.3 Voice Activity Detection

**Start Speaking Plan (When to Start):**

```json
{
  "startSpeakingPlan": {
    "waitSeconds": 0.4,              // Default wait before speaking

    "smartEndpointing": {
      "enabled": true,
      "provider": "livekit",         // Best for English
      "waitFunction": "200 + 8000 * x"  // Dynamic wait formula
    },

    "transcriptionEndpointing": {
      "enabled": true,
      "onPunctuationSeconds": 0.3,   // Quick response on sentence end
      "onNoPunctuationSeconds": 1.5, // Wait longer if no punctuation
      "onNumberSeconds": 0.5         // Number detection
    }
  }
}
```

**Configuration by Use Case:**

```json
// Quick service (fast food, simple queries)
{
  "waitSeconds": 0.2,
  "smartEndpointing": { "enabled": true },
  "transcriptionEndpointing": {
    "onPunctuationSeconds": 0.2,
    "onNoPunctuationSeconds": 1.0
  }
}

// Technical support (complex explanations)
{
  "waitSeconds": 0.6,
  "smartEndpointing": { "enabled": true },
  "transcriptionEndpointing": {
    "onPunctuationSeconds": 0.4,
    "onNoPunctuationSeconds": 2.0   // Give user time to think
  }
}

// Healthcare (careful, patient)
{
  "waitSeconds": 0.8,
  "smartEndpointing": { "enabled": true },
  "transcriptionEndpointing": {
    "onPunctuationSeconds": 0.5,
    "onNoPunctuationSeconds": 2.5
  }
}
```

**Stop Speaking Plan (Interruption Detection):**

```json
{
  "stopSpeakingPlan": {
    "numWords": 2,                   // Stop after user says 2 words
    "voiceSeconds": 0.2,              // Or 200ms of voice detected
    "backoffSeconds": 1.0             // Wait 1s before resuming
  }
}
```

**Critical Note:**
> VAPI's default settings can add **1.5+ seconds** to response time. Optimizing VAD is essential for natural conversation flow.

### 4.4 Response Modalities

**Streaming Configuration:**

```json
{
  "streaming": {
    "enabled": true,                 // Stream audio as generated
    "chunkSize": 1024,                // Bytes per chunk
    "bufferSize": 2048,               // Buffer before playback
    "codec": "opus",                  // Efficient codec
    "bitrate": 24000                  // Balance quality/bandwidth
  }
}
```

**Response Format:**

```json
{
  "responseFormat": {
    "type": "audio",                 // Direct audio output
    "transcriptionEnabled": true,    // Also return text
    "timestampsEnabled": true,       // For analytics
    "emotionDetection": true         // Track user sentiment
  }
}
```

### 4.5 Complete Example Configuration

**Premium Quality, Low Latency Setup:**

```json
{
  "assistant": {
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
}
```

---

## 5. Testing & Monitoring

### 5.1 Key Metrics to Track

**Voice Quality:**
- Mean Opinion Score (MOS): Target >4.0
- Pronunciation accuracy: Target >85%
- Audio dropout rate: Target <1%
- Latency (end-to-end): Target <700ms

**Tool Calling:**
- Tool call success rate: Target >95%
- Parameter extraction accuracy: Target >98%
- Tool execution time: Target <2s average
- Timeout rate: Target <2%

**Conversation Quality:**
- Completion rate: Target >90%
- Average turns per conversation: Track trend
- Interruption handling success: Target >95%
- User satisfaction (if available): Target >4.5/5

### 5.2 A/B Testing Framework

**Test Variables:**
1. LLM models (Claude vs GPT-4 vs Groq)
2. Voice providers (ElevenLabs vs PlayHT)
3. Temperature settings (0.5 vs 0.7 vs 0.9)
4. Max tokens (150 vs 200 vs 250)
5. VAD wait times (0.2s vs 0.4s vs 0.6s)

**Sample Size:**
- Minimum 100 conversations per variant
- Statistical significance: p < 0.05
- Duration: 1-2 weeks per test

### 5.3 Monitoring Dashboard

**Essential Metrics:**

```json
{
  "realtime": {
    "activeCallsCount": 0,
    "averageLatencyMs": 0,
    "currentErrorRate": 0
  },

  "hourly": {
    "callsCount": 0,
    "completionRate": 0,
    "averageDurationSeconds": 0,
    "toolCallSuccessRate": 0
  },

  "alerts": [
    {
      "metric": "latency",
      "threshold": 1000,
      "severity": "warning"
    },
    {
      "metric": "errorRate",
      "threshold": 0.05,
      "severity": "critical"
    }
  ]
}
```

---

## 6. Cost Optimization (When Needed)

While cost is not a primary concern, here are optimization strategies:

### 6.1 Variable Tiers

**Premium Tier** (VIP customers):
- Claude Sonnet 4 + ElevenLabs
- Max quality settings
- Extended timeout tolerances

**Standard Tier** (Regular customers):
- GPT-4 Turbo + ElevenLabs
- Balanced settings
- Standard timeouts

**High-Volume Tier** (Simple queries):
- Groq Llama 4 + PlayHT
- Optimized for speed
- Aggressive timeouts

### 6.2 Dynamic Model Switching

```javascript
// Example logic
function selectModel(conversationContext) {
  if (conversationContext.requiresTools && conversationContext.toolComplexity > 3) {
    return "claude-sonnet-4";  // Complex tool workflows
  }

  if (conversationContext.isCustomerFacing) {
    return "gpt-4-turbo";       // Natural conversation
  }

  return "llama-4-maverick";    // Default fast option
}
```

---

## 7. Quick Start Checklist

### Initial Setup
- [ ] Choose LLM model (Claude Sonnet 4 recommended)
- [ ] Select voice provider (ElevenLabs recommended)
- [ ] Configure transcriber (AssemblyAI Universal-Streaming)
- [ ] Set up audio processing (Smart Denoising enabled)

### Prompt Engineering
- [ ] Write voice-optimized system prompt
- [ ] Define clear tool usage guidelines
- [ ] Include error handling fallbacks
- [ ] Add natural speech patterns

### VAD Optimization
- [ ] Set waitSeconds: 0.3-0.4
- [ ] Enable smart endpointing (LiveKit)
- [ ] Configure stop speaking plan (2 words / 0.2s)
- [ ] Test with background noise

### Tool Configuration
- [ ] Write descriptive function schemas
- [ ] Add user-facing messages
- [ ] Set appropriate timeouts
- [ ] Configure retry logic

### Testing
- [ ] Test happy path scenarios
- [ ] Test error handling
- [ ] Test interruption handling
- [ ] Test with various backgrounds noise
- [ ] Load test with concurrent calls

### Monitoring
- [ ] Set up latency tracking
- [ ] Monitor tool call success rates
- [ ] Track completion rates
- [ ] Configure alerts

---

## 8. Common Issues & Solutions

### Issue: High Latency (>1000ms)

**Checklist:**
- [ ] Using fast LLM? (Groq recommended)
- [ ] formatTurns set to false?
- [ ] responseDelaySeconds set to 0?
- [ ] Using ElevenLabs Flash v2.5?
- [ ] optimizeStreamingLatency set to 4?

**Quick Fix:**
```json
{
  "transcriber": { "formatTurns": false },
  "model": { "provider": "groq", "maxTokens": 150 },
  "voice": { "optimizeStreamingLatency": 4 },
  "responseDelaySeconds": 0
}
```

### Issue: Poor Tool Calling Success

**Checklist:**
- [ ] Using Claude Sonnet 4 or GPT-4 Turbo?
- [ ] Function descriptions detailed enough?
- [ ] System prompt includes tool usage guidelines?
- [ ] Parameters have examples?
- [ ] Error messages user-friendly?

**Quick Fix:**
- Upgrade to Claude Sonnet 4
- Rewrite function descriptions with examples
- Add explicit "When to use this tool" section

### Issue: Frequent Interruptions/False Triggers

**Checklist:**
- [ ] backgroundSpeechDenoising enabled?
- [ ] Smart Denoising active?
- [ ] VAD threshold too low?
- [ ] Background noise in test environment?

**Quick Fix:**
```json
{
  "audioProcessing": {
    "backgroundNoiseReduction": "smart",
    "backgroundSpeechDenoising": true
  },
  "vadConfig": {
    "threshold": 0.6,  // Increase if too sensitive
    "aggressiveness": 2
  }
}
```

### Issue: Agent Too Verbose

**Checklist:**
- [ ] maxTokens set to 200 or less?
- [ ] Prompt includes brevity guidelines?
- [ ] Temperature too high (>0.8)?

**Quick Fix:**
```json
{
  "model": {
    "maxTokens": 150,
    "temperature": 0.6,
    "presencePenalty": 0.3,
    "frequencyPenalty": 0.3
  }
}
```

Add to prompt:
```markdown
# Response Length
- Keep responses under 2 sentences
- If complex explanation needed, break into steps
- Ask "Want me to explain more?" instead of monologuing
```

### Issue: Awkward Interruption Handling

**Checklist:**
- [ ] stopSpeakingPlan configured?
- [ ] numWords set to 2-3?
- [ ] Prompt includes interruption handling?

**Quick Fix:**
```json
{
  "stopSpeakingPlan": {
    "numWords": 2,
    "voiceSeconds": 0.2,
    "backoffSeconds": 1.0
  }
}
```

Add to prompt:
```markdown
# Interruptions
When interrupted, DO NOT:
- Complain or mention it
- Try to finish your thought
- Say "as I was saying"

DO:
- Pivot immediately to new topic
- Acknowledge briefly: "Sure!" or "Okay!"
```

---

## 9. Advanced Techniques

### 9.1 Context-Aware Response Timing

Adjust VAD based on conversation state:

```javascript
function getVadSettings(conversationState) {
  if (conversationState.isCollectingComplexInfo) {
    return {
      waitSeconds: 0.8,
      onNoPunctuationSeconds: 2.5
    };
  }

  if (conversationState.isQuickQuery) {
    return {
      waitSeconds: 0.2,
      onNoPunctuationSeconds: 1.0
    };
  }

  return defaultVadSettings;
}
```

### 9.2 Emotion-Adaptive Voice

Select voice/settings based on detected user emotion:

```javascript
function getVoiceSettings(userEmotion) {
  switch(userEmotion) {
    case "frustrated":
      return {
        voiceId: "calming_voice",
        stability: 0.6,  // More consistent
        style: 0.2       // Less variation
      };

    case "happy":
      return {
        voiceId: "energetic_voice",
        stability: 0.4,  // More expressive
        style: 0.4       // More variation
      };

    default:
      return defaultVoiceSettings;
  }
}
```

### 9.3 Progressive Enhancement

Start with minimal config, add complexity as needed:

**Phase 1: Basic (Week 1)**
- Single LLM (GPT-4 Turbo)
- Single voice (ElevenLabs default)
- Basic VAD settings
- No tools

**Phase 2: Tools (Week 2-3)**
- Add 1-3 core tools
- Tool call error handling
- Async operations

**Phase 3: Optimization (Week 4-5)**
- A/B test models
- Tune VAD settings
- Voice selection
- Advanced prompting

**Phase 4: Advanced (Week 6+)**
- Context-aware timing
- Emotion detection
- Dynamic model selection
- Multi-tool workflows

---

## 10. Resources

### Official Documentation
- VAPI Docs: https://docs.vapi.ai
- Voice Pipeline Config: https://docs.vapi.ai/customization/voice-pipeline-configuration
- Speech Configuration: https://docs.vapi.ai/customization/speech-configuration
- Prompting Guide: https://docs.vapi.ai/prompting-guide
- Tool Calling: https://docs.vapi.ai/tools-calling

### Voice Providers
- ElevenLabs Docs: https://elevenlabs.io/docs
- PlayHT Docs: https://docs.play.ht
- AssemblyAI Docs: https://www.assemblyai.com/docs

### Community
- VAPI Discord: https://discord.gg/vapi
- VAPI Support: https://support.vapi.ai

### Example Code
- VAPI Examples: https://github.com/VapiAI/examples
- Custom LLM Integration: https://github.com/VapiAI/example-custom-llm
- Next.js Starter: https://github.com/cameronking4/next-tailwind-vapi-starter

---

## Conclusion

**Optimal Stack for Premium Quality:**
- **LLM**: Claude Sonnet 4 (tool calling) or GPT-4 Turbo (conversation)
- **Voice**: ElevenLabs Flash v2.5
- **Transcriber**: AssemblyAI Universal-Streaming
- **Target Latency**: ~465ms end-to-end
- **Key Success Factor**: Prompt engineering + VAD optimization

**Quick Wins:**
1. Set `formatTurns: false` (saves 100-200ms)
2. Set `responseDelaySeconds: 0` (saves 200-400ms)
3. Set `maxTokens: 150` (faster generation + better UX)
4. Enable Smart Denoising (cleaner audio)
5. Configure interruption handling (natural flow)

**Remember:**
- Start simple, optimize progressively
- Test everything with real users
- Monitor metrics continuously
- Iterate on prompts weekly
- A/B test major changes

With these settings and practices, you'll achieve industry-leading voice AI quality with reliable tool use and natural conversations.
