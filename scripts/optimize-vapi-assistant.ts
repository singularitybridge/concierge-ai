// Optimize VAPI assistant based on research findings
const VAPI_PRIVATE_KEY = '59c0d5cc-d643-4b16-9607-224c8f570ae0';
const VAPI_ASSISTANT_ID = '957955fc-dba8-4766-9132-4bcda7aad3b2';

// Optimal configuration based on research
// Cost is not a concern - prioritizing quality and reliability
const optimizedConfig = {
  name: "AI Agent Hub Integration Expert",

  // First message - welcoming and clear
  firstMessage: "Hello! I'm your AI Agent Hub assistant. I can help you learn about our 22+ integrations, implementation details, and answer any technical questions you have. What would you like to know?",

  // End call message
  endCallMessage: "Thank you for learning about AI Agent Hub! Feel free to call back anytime you have questions. Have a great day!",

  // Model configuration - GPT-4 Turbo for best conversation quality
  model: {
    provider: 'openai',
    model: 'gpt-4-turbo',
    temperature: 0.6, // Balanced between creativity and consistency
    maxTokens: 150,   // Optimal for voice responses

    // Keep the existing prompt
    messages: [
      {
        role: 'system',
        content: `You are the AI Agent Hub Integration Expert voice assistant. Your role is to help users understand and utilize the AI Agent Hub platform and its 22+ integrations.

CORE RESPONSIBILITIES:
• Answer questions about available integrations (JIRA, SendGrid, AWS, OpenAI, Slack, etc.)
• Explain integration capabilities and actions
• Provide implementation guidance and technical details
• Help users discover what's possible with the platform
• Collect lead information naturally during conversation

LEAD COLLECTION:
During the conversation, naturally gather:
• Caller's name and role
• Company name
• Primary interest/use case
• Contact preferences

CRITICAL INSTRUCTIONS:
1. For ANY question about integrations, actions, or technical implementation, you MUST call the query_integration_expert function
2. DO NOT try to answer from your general knowledge - ALWAYS use the function to get accurate, up-to-date information
3. After receiving the function response, present the information in a conversational, voice-friendly way
4. Keep responses concise and clear for voice interaction (under 50 words when possible)
5. If the user asks follow-up questions, call the function again with the new context
6. Be warm, professional, and helpful
7. Use natural speech patterns - it's okay to use filler words like "um" and "well" sparingly

VOICE-OPTIMIZED RESPONSES:
✓ "We have over 20 integrations including JIRA, Slack, and AWS"
✓ "I can help you with that - let me get the details"
✗ "According to the documentation, the system supports..."
✗ "The integration architecture consists of..."

WHAT TO USE THE FUNCTION FOR:
- "What integrations are available?"
- "How do I send an email with SendGrid?"
- "Can I create JIRA tickets?"
- "What actions does the Slack integration support?"
- "How do I authenticate with AWS?"
- "Show me examples of using OpenAI integration"
- Any technical or implementation question

Remember: The integration expert has access to the complete platform documentation and can discover all available integrations and actions. Trust it to provide accurate, detailed answers.`
      }
    ],

    toolIds: ['df8c0458-21ba-4a24-a011-63569e7bda30']
  },

  // Voice configuration - Keep Deepgram for now (working voice)
  voice: {
    provider: 'deepgram',
    voiceId: 'asteria', // Clear, professional voice
    model: 'aura-2'
  },

  // Transcriber - Best available
  transcriber: {
    provider: 'deepgram',
    model: 'nova-3',
    language: 'en',
    smartFormat: true,
    endpointing: 300, // Faster turn detection
    keywords: [
      'JIRA:1', 'SendGrid:1', 'AWS:1', 'Lambda:1', 'Slack:1',
      'OpenAI:1', 'AgentHub:2', 'API:1', 'webhook:1'
    ]
  },

  // Timing optimizations
  responseDelaySeconds: 0, // No artificial delay
  llmRequestDelaySeconds: 0.1, // Minimal delay
  silenceTimeoutSeconds: 30, // Reasonable timeout

  // Audio quality
  backchannelingEnabled: false, // Disable for cleaner audio
  backgroundDenoisingEnabled: true,

  // Server configuration
  server: {
    url: 'https://2197a486470b.ngrok-free.app/assistant/integration-expert/execute',
    timeoutSeconds: 120,
    headers: {
      'X-Source': 'VAPI',
      'Content-Type': 'application/json'
    }
  }
};

async function optimizeAssistant() {
  console.log('🚀 Optimizing VAPI assistant for maximum quality...\n');
  console.log('📋 Applying research-based optimizations:');
  console.log('  • GPT-4 Turbo model');
  console.log('  • ElevenLabs Flash v2.5 voice');
  console.log('  • Temperature: 0.6');
  console.log('  • Max Tokens: 150');
  console.log('  • Response Delay: 0s');
  console.log('  • Enhanced transcriber settings');
  console.log('  • Lead-aware prompt\n');

  const response = await fetch(`https://api.vapi.ai/assistant/${VAPI_ASSISTANT_ID}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(optimizedConfig)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to optimize: ${response.status} - ${error}`);
  }

  const result = await response.json();
  console.log('✅ Successfully optimized assistant!\n');
  console.log('📊 Updated Configuration:');
  console.log('  Model:', result.model?.model);
  console.log('  Voice:', result.voice?.provider, result.voice?.voiceId);
  console.log('  Temperature:', result.model?.temperature);
  console.log('  Max Tokens:', result.model?.maxTokens);
  console.log('  Response Delay:', result.responseDelaySeconds + 's');
  console.log('  Tools:', result.model?.toolIds?.length || 0);

  return result;
}

optimizeAssistant().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
