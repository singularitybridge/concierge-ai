import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import http from 'http';
import { VapiClient } from '@vapi-ai/server-sdk';
import { logger } from '@/app/utils/logger';

// HTTP agent configured for IPv4 only
const httpAgent = new http.Agent({
  family: 4,  // Force IPv4
  keepAlive: true
});

// Initialize Vapi client
const vapiClient = new VapiClient({
  token: process.env.VAPI_PRIVATE_KEY!,
});

// Store active sessions for status updates
// In production, use Redis or similar
interface SessionData {
  callId: string;
  controlUrl: string;
  agentHubSessionId?: string;
  createdAt: number;
}

const activeSessions = new Map<string, SessionData>();

// CORS headers for VAPI
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, ngrok-skip-browser-warning',
};

// Handle OPTIONS preflight request
export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Debug: Log what VAPI is sending
    console.log('📥 VAPI webhook received:', JSON.stringify(body, null, 2));

    // Log full payload to file for debugging
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    logger.info('vapi-webhook-raw', `Request ${requestId}`, body);

    // Extract VAPI metadata (can be in body.call or body.message.call)
    const call = body.message?.call || body.call;
    const callId = call?.id;
    const callerId = call?.customer?.phoneNumber || call?.customerId;
    const callerName = call?.customer?.name;
    const assistantId = call?.assistantId;
    const callMetadata = call?.metadata;

    console.log('========================================');
    console.log('📞 VAPI Call Metadata:');
    console.log('  Call ID (Session):', callId);
    console.log('  Caller Phone:', callerId);
    console.log('  Caller Name:', callerName);
    console.log('  Assistant ID:', assistantId);
    console.log('  Custom Metadata:', callMetadata);
    console.log('========================================');

    // Structured logging of session metadata
    if (callId) {
      logger.vapiWebhook(callId, body);
      logger.sessionEvent(callId, 'webhook_received', {
        caller: { phone: callerId, name: callerName },
        assistant: assistantId,
        metadata: callMetadata
      });
    }

    // Handle different VAPI formats:
    // 1. Full webhook format (voice calls): body.message.toolCallList or body.message.toolCalls
    // 2. Simple parameter format (Chat API): body.userInput directly
    const isToolCall = body.message?.toolCalls?.length > 0 || body.message?.toolCallList?.length > 0;
    const isFunctionCall = body.message?.type === 'function-call';
    const isSimpleFormat = body.userInput && !body.message;

    console.log('🔍 Tool call detection:', {
      isToolCall,
      isFunctionCall,
      isSimpleFormat,
      hasMessage: !!body.message
    });

    if (isToolCall || isFunctionCall) {
      // Extract message and tool call ID from either format
      const toolCall = body.message.toolCalls?.[0] || body.message.toolCallList?.[0];
      const functionCall = body.message.functionCall;

      // Parse arguments if they're a JSON string
      let args = {};
      if (toolCall?.function?.arguments) {
        args = typeof toolCall.function.arguments === 'string'
          ? JSON.parse(toolCall.function.arguments)
          : toolCall.function.arguments;
      }

      const userMessage = isToolCall
        ? (args.userInput || args.message || args.query || toolCall?.function?.arguments?.message)
        : functionCall?.parameters?.message;

      const toolCallId = toolCall?.id || functionCall?.id;

      if (!userMessage) {
        return NextResponse.json({ error: 'No message provided' }, { status: 400, headers: corsHeaders });
      }

      console.log('🔑 Tool call ID:', toolCallId);

      // Get call details to obtain controlUrl for async updates
      let controlUrl = '';
      if (callId) {
        try {
          const callDetails = await vapiClient.calls.get(callId);
          controlUrl = callDetails.monitor?.controlUrl || '';
          console.log('🎯 Control URL:', controlUrl);
        } catch (error) {
          console.error('Failed to get call details:', error);
        }
      }

      // Build context-aware request for Agent Hub
      const agentName = process.env.AI_AGENT_ID || 'integration-expert';
      const agentFullId = process.env.AI_AGENT_FULL_ID || '68e1af59dd4ab3bce91a07dc';

      const agentRequest = {
        assistantId: agentName,
        userInput: userMessage,
        sessionId: callId, // Use VAPI call ID as session identifier
        systemPromptOverride: `
Context: You are speaking with a caller via voice call.
${callerId ? `Caller Phone: ${callerId}` : ''}
${callerName ? `Caller Name: ${callerName}` : ''}
${callId ? `Call Session: ${callId}` : ''}

Provide conversational, voice-friendly responses.
Keep responses concise and natural for voice interaction.
You may have previous context from this caller in the workspace.
        `.trim()
      };

      console.log('🌐 Calling Agent Hub execute endpoint');
      console.log('🤖 Agent Info:', {
        name: agentName,
        id: agentFullId,
        model: 'gpt-4.1-mini'
      });
      console.log('📤 Request payload:', JSON.stringify(agentRequest, null, 2));

      // Log Agent Hub call
      if (callId) {
        logger.agentHubCall(callId, agentRequest);
      }

      // Store session info and start background execution
      if (callId && controlUrl && toolCallId) {
        activeSessions.set(toolCallId, {
          callId,
          controlUrl,
          agentHubSessionId: callId,
          createdAt: Date.now(),
        });

        // Start Agent Hub execution in background (don't await)
        executeAgentHubTask(toolCallId, callId, agentRequest);
      }

      // Immediately respond to Vapi
      const response = {
        results: [
          {
            toolCallId: toolCallId,
            result: 'I\'m working on your request. One moment please...'
          }
        ]
      };

      console.log('========================================');
      console.log('📤 Returning immediate response to VAPI');
      console.log('  Tool Call ID:', toolCallId);
      console.log('  Starting background execution for session:', callId);
      console.log('========================================\n');

      return NextResponse.json(response, { headers: corsHeaders });
    }

    // Handle simple parameter format (Chat API / simple HTTP)
    if (isSimpleFormat) {
      const userMessage = body.userInput;

      console.log('📝 Simple format detected - userInput:', userMessage);

      const agentApiUrl = process.env.AI_AGENT_API_URL;

      if (!agentApiUrl) {
        console.error('Missing AI_AGENT_API_URL environment variable');
        return NextResponse.json({
          result: 'Sorry, the AI agent is not configured properly.'
        }, { headers: corsHeaders });
      }

      // Build context-aware request for Agent Hub
      const agentRequest = {
        userInput: userMessage,
        sessionId: callId || 'chat_session',
        systemPromptOverride: `
Context: You are speaking with a user via chat/API.
${callerId ? `Caller Phone: ${callerId}` : ''}
${callerName ? `Caller Name: ${callerName}` : ''}
${callId ? `Session: ${callId}` : ''}

Provide conversational, concise responses.
        `.trim()
      };

      console.log('🌐 Calling agent API (simple format):', agentApiUrl);
      console.log('📤 Request payload:', JSON.stringify(agentRequest, null, 2));

      const agentResponse = await axios.post(agentApiUrl, agentRequest, {
        httpAgent: httpAgent,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.AI_AGENT_API_KEY || ''}`
        },
        timeout: 30000,
        validateStatus: (status) => status < 500
      });

      console.log('📡 Agent response status:', agentResponse.status);

      if (agentResponse.status >= 400) {
        console.error('❌ Agent API error:', agentResponse.status, agentResponse.data);
        return NextResponse.json({
          result: 'Sorry, I encountered an error. Please try again.'
        }, { headers: corsHeaders });
      }

      const agentData = agentResponse.data;

      // Extract response text
      let responseText = 'I received your message but have no response.';

      if (Array.isArray(agentData.content) && agentData.content[0]?.text?.value) {
        responseText = agentData.content[0].text.value;
      } else if (typeof agentData.content === 'string') {
        responseText = agentData.content;
      } else if (agentData.response) {
        responseText = agentData.response;
      }

      console.log('🤖 Response text:', responseText.substring(0, 200));
      console.log('========================================\n');

      // Return simple response for Chat API
      return NextResponse.json({
        result: responseText
      }, { headers: corsHeaders });
    }

    // For other message types, just acknowledge
    return NextResponse.json({ status: 'received' }, { headers: corsHeaders });

  } catch (error) {
    console.error('VAPI webhook error:', error);

    // Log error with context
    const errorData = error instanceof Error ? {
      message: error.message,
      stack: error.stack
    } : error;

    logger.error('vapi-webhook', 'Webhook error', errorData);

    return NextResponse.json(
      { error: 'Internal server error', result: 'Sorry, something went wrong.' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Execute Agent Hub task in background with status updates
async function executeAgentHubTask(toolCallId: string, sessionId: string, agentRequest: any) {
  const session = activeSessions.get(toolCallId);
  if (!session || !session.controlUrl) {
    console.log('⚠️ No session found for execution:', toolCallId);
    return;
  }

  // Send initial status update
  await sendVoiceUpdate(session.controlUrl, 'I\'m searching through the documentation...');

  try {
    // Call Agent Hub execute endpoint
    const agentHubUrl = `${process.env.AGENT_HUB_API_URL}/assistant/${agentRequest.assistantId}/execute`;

    console.log('🚀 Starting Agent Hub execution for session:', sessionId);
    console.log('🎯 Agent Hub URL:', agentHubUrl);
    console.log('🤖 Using agent:', agentRequest.assistantId);

    // Send periodic status updates while waiting
    const statusInterval = setInterval(async () => {
      const elapsed = Date.now() - session.createdAt;
      const seconds = Math.floor(elapsed / 1000);

      if (seconds === 3) {
        await sendVoiceUpdate(session.controlUrl, 'I\'m analyzing the information...');
      } else if (seconds === 6) {
        await sendVoiceUpdate(session.controlUrl, 'Almost done processing your request...');
      }
    }, 1000);

    // Execute the Agent Hub task
    const agentResponse = await axios.post(agentHubUrl, agentRequest, {
      httpAgent: httpAgent,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.AI_AGENT_API_KEY || ''}`
      },
      timeout: 60000, // 60 second timeout for Agent Hub execution
      validateStatus: (status) => status < 500
    });

    clearInterval(statusInterval);

    console.log('📡 Agent Hub response status:', agentResponse.status);

    if (agentResponse.status >= 400) {
      console.error('❌ Agent Hub error:', agentResponse.status, agentResponse.data);

      await sendVoiceUpdate(
        session.controlUrl,
        'I encountered an issue processing your request. Please try again.'
      );

      activeSessions.delete(toolCallId);
      return;
    }

    const agentData = agentResponse.data;

    // Extract response text from Agent Hub response
    let responseText = 'I completed your request but have no response to share.';

    if (Array.isArray(agentData.content) && agentData.content[0]?.text?.value) {
      responseText = agentData.content[0].text.value;
    } else if (typeof agentData.content === 'string') {
      responseText = agentData.content;
    } else if (agentData.response) {
      responseText = agentData.response;
    } else if (agentData.result) {
      responseText = agentData.result;
    }

    console.log('✅ Agent Hub execution completed');
    console.log('📄 Response length:', responseText.length, 'characters');

    // Send the final result via Live Call Control
    await sendVoiceUpdate(session.controlUrl, responseText);

    // Clean up session
    activeSessions.delete(toolCallId);
    console.log('🗑️ Cleaned up session:', toolCallId);

  } catch (error) {
    console.error('❌ Agent Hub execution error:', error);

    // Send error message
    await sendVoiceUpdate(
      session.controlUrl,
      'I encountered an issue while processing your request. Please try again.'
    );

    // Clean up session
    activeSessions.delete(toolCallId);
  }
}

// Send voice update using Vapi's Live Call Control API
async function sendVoiceUpdate(controlUrl: string, message: string) {
  if (!controlUrl) {
    console.warn('⚠️ No controlUrl available for voice update');
    return;
  }

  try {
    console.log('🔊 Sending voice update:', message.substring(0, 100));

    await axios.post(`${controlUrl}/say`, {
      message: message,
    }, {
      timeout: 5000,
    });

    console.log('✅ Voice update sent successfully');
  } catch (error) {
    console.error('❌ Failed to send voice update:', error);
  }
}
