import { NextRequest, NextResponse } from 'next/server';

// This endpoint provides direct access to the integration-expert agent
// for VAPI and other voice/chat integrations

const AGENT_HUB_API_KEY = process.env.AI_AGENT_API_KEY || process.env.AGENT_HUB_API_KEY;
const AGENT_HUB_API_URL = process.env.AGENT_HUB_API_URL || 'https://agenthub.swiftbrief.ai/api';

// CORS headers for VAPI
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle OPTIONS preflight and GET health check
export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(req: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    service: 'integration-expert',
    endpoint: '/api/assistant/integration-expert/execute'
  }, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log('📥 Integration Expert API called:', JSON.stringify(body, null, 2));

    // Note: No auth required here since VAPI tool calls don't send auth headers
    // The Agent Hub API itself handles authentication

    let userInput: string;
    let sessionId: string | undefined;
    let metadata: any = {};
    let toolCallId: string | undefined;

    // Handle VAPI webhook format (tool-calls message type)
    if (body.message && body.message.type === 'tool-calls' && body.message.toolCallList?.length > 0) {
      const toolCall = body.message.toolCallList[0];
      userInput = toolCall.function.arguments['user-input'];
      toolCallId = toolCall.id;

      // Use call ID for phone calls, chat ID for web chats
      sessionId = body.message.call?.id || body.message.chat?.id;

      // Extract customer/user information from VAPI
      // Note: VAPI doesn't automatically send customer data in tool-calls webhooks
      // Customer data must be passed via assistant variables or collected during conversation
      const customer = body.message.call?.customer || body.customer;
      const phoneNumber = customer?.number || body.message.call?.phoneNumber || body.phoneNumber;
      const customerName = customer?.name;
      const customerEmail = customer?.email;

      // Check for customer data in assistant variables
      const assistantVars = body.message.assistant?.variableValues || {};

      metadata = {
        // VAPI context
        vapiAssistantId: body.message.assistant?.id,
        vapiChatId: body.message.chat?.id,
        vapiCallId: body.message.call?.id,
        callType: body.message.call?.type,
        timestamp: body.message.timestamp,

        // Customer identification (from customer object or assistant variables)
        customerPhone: phoneNumber || assistantVars.customerPhone,
        customerName: customerName || assistantVars.customerName,
        customerEmail: customerEmail || assistantVars.customerEmail,
        customerId: customer?.id || assistantVars.customerId,

        // Include all assistant variables
        assistantVariables: assistantVars
      };

      // Log customer info for debugging
      console.log('👤 Customer Info:', {
        phone: metadata.customerPhone,
        name: metadata.customerName,
        email: metadata.customerEmail,
        customerId: metadata.customerId,
        sessionId: sessionId,
        callType: metadata.callType
      });
    } else {
      // Handle direct tool call format (when tool is called directly)
      userInput = body['user-input'] || body.userInput || body.message;
      sessionId = body.sessionId || body.session_id;
      metadata = body.metadata || {};
      toolCallId = body.toolCallId || body.tool_call_id;
    }

    if (!userInput) {
      return NextResponse.json({
        error: 'Missing user-input parameter'
      }, { status: 400, headers: corsHeaders });
    }

    console.log('🔑 Session ID:', sessionId);
    console.log('💬 User input:', userInput);

    // Call Agent Hub API directly
    const agentHubUrl = `${AGENT_HUB_API_URL}/assistant/integration-expert/execute`;

    // Format request according to Agent Hub API spec
    const agentHubPayload = {
      userInput,
      assistantId: 'integration-expert',
      ...(sessionId && { sessionId }) // Include sessionId for conversation context
      // Note: responseFormat removed - it was causing issues with response parsing
    };

    console.log('🌐 Calling Agent Hub:', agentHubUrl);
    console.log('📤 Payload:', JSON.stringify(agentHubPayload, null, 2));
    console.log('📋 Additional Context - Session ID:', sessionId);
    console.log('📋 Additional Context - Metadata:', JSON.stringify(metadata, null, 2));

    try {
      const agentResponse = await fetch(agentHubUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AGENT_HUB_API_KEY}`
        },
        body: JSON.stringify(agentHubPayload),
        signal: AbortSignal.timeout(25000) // 25 second timeout
      });

      if (!agentResponse.ok) {
        const errorText = await agentResponse.text();
        console.error('❌ Agent Hub API error:', agentResponse.status, errorText);

        // If token expired, return helpful message
        if (errorText.includes('expired') || errorText.includes('Token expired')) {
          return NextResponse.json({
            success: true,
            response: 'The integration expert is currently unavailable due to an expired authentication token. Please contact support to refresh the token.',
            sessionId,
            metadata
          }, { headers: corsHeaders });
        }

        throw new Error(`Agent Hub API failed: ${agentResponse.status}`);
      }

      const agentData = await agentResponse.json();
      console.log('📦 Agent response:', JSON.stringify(agentData, null, 2));

      // Extract response text from various possible formats
      let responseText = '';
      if (agentData.content) {
        if (Array.isArray(agentData.content)) {
          responseText = agentData.content[0]?.text?.value || '';
        } else if (typeof agentData.content === 'string') {
          responseText = agentData.content;
        }
      } else if (agentData.response) {
        responseText = agentData.response;
      }

      // Return in VAPI-expected format if toolCallId is provided
      if (toolCallId) {
        return NextResponse.json({
          results: [{
            toolCallId: toolCallId,
            result: responseText
          }]
        }, { headers: corsHeaders });
      }

      // Otherwise return in generic format for other integrations
      return NextResponse.json({
        success: true,
        response: responseText,
        sessionId: agentData.sessionId || sessionId,
        metadata: metadata
      }, { headers: corsHeaders });

    } catch (fetchError) {
      console.error('❌ Fetch error:', fetchError);

      // Return a graceful error response
      const errorMessage = 'I apologize, but I\'m having trouble connecting to the integration expert right now. Please try again in a moment.';

      if (toolCallId) {
        return NextResponse.json({
          results: [{
            toolCallId: toolCallId,
            result: errorMessage
          }]
        }, { headers: corsHeaders });
      }

      return NextResponse.json({
        success: true,
        response: errorMessage,
        sessionId,
        metadata
      }, { headers: corsHeaders });
    }

  } catch (error) {
    console.error('❌ Integration Expert API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
