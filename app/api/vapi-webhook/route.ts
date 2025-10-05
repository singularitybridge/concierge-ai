import { NextRequest, NextResponse } from 'next/server';
import http from 'http';

// Custom fetch with IPv4-only agent
async function fetchWithIPv4(url: string, options: RequestInit = {}) {
  const agent = new http.Agent({ family: 4 });
  return fetch(url, {
    ...options,
    // @ts-ignore - Next.js fetch supports agent
    agent
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Debug: Log what VAPI is sending
    console.log('📥 VAPI webhook received:', JSON.stringify(body, null, 2));

    // Handle tool call (new format) or function-call (old format)
    const isToolCall = body.message?.toolCalls?.length > 0;
    const isFunctionCall = body.message?.type === 'function-call';

    console.log('🔍 Tool call detection:', { isToolCall, isFunctionCall, hasMessage: !!body.message });

    if (isToolCall || isFunctionCall) {
      // Extract message and tool call ID from either format
      const toolCall = body.message.toolCalls?.[0];
      const functionCall = body.message.functionCall;

      const userMessage = isToolCall
        ? toolCall?.function?.arguments?.message
        : functionCall?.parameters?.message;

      const toolCallId = toolCall?.id || functionCall?.id;

      if (!userMessage) {
        return NextResponse.json({ error: 'No message provided' }, { status: 400 });
      }

      console.log('🔑 Tool call ID:', toolCallId);

      // Call the AI Agent API
      const agentApiUrl = process.env.AI_AGENT_API_URL;

      if (!agentApiUrl) {
        console.error('Missing AI_AGENT_API_URL environment variable');
        return NextResponse.json({
          result: 'Sorry, the AI agent is not configured properly.'
        });
      }

      console.log('🌐 Calling agent API:', agentApiUrl);
      console.log('📤 Request payload:', { userInput: userMessage });

      const agentResponse = await fetchWithIPv4(agentApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.AI_AGENT_API_KEY || ''}`
        },
        body: JSON.stringify({
          userInput: userMessage
        })
      });

      console.log('📡 Agent response status:', agentResponse.status);

      if (!agentResponse.ok) {
        const errorText = await agentResponse.text();
        console.error('❌ Agent API error:', agentResponse.status, errorText);
        throw new Error(`Agent API error: ${agentResponse.status} - ${errorText}`);
      }

      const agentData = await agentResponse.json();

      console.log('📦 Raw agent response:', JSON.stringify(agentData, null, 2));

      // Extract the response text from agent
      // Handle array format: content[0].text.value or simple string format
      let responseText = 'I received your message but have no response.';

      if (Array.isArray(agentData.content) && agentData.content[0]?.text?.value) {
        responseText = agentData.content[0].text.value;
      } else if (typeof agentData.content === 'string') {
        responseText = agentData.content;
      } else if (agentData.response) {
        responseText = agentData.response;
      }

      console.log('🤖 Extracted text:', responseText.substring(0, 200));

      // Return in VAPI's expected format with toolCallId
      const response = {
        results: [
          {
            toolCallId: toolCallId,
            result: responseText
          }
        ]
      };

      console.log('📤 Returning to VAPI:', JSON.stringify(response));

      return NextResponse.json(response);
    }

    // For other message types, just acknowledge
    return NextResponse.json({ status: 'received' });

  } catch (error) {
    console.error('VAPI webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error', result: 'Sorry, something went wrong.' },
      { status: 500 }
    );
  }
}
