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

    // Debug: Log what ElevenLabs is sending
    console.log('📥 ElevenLabs webhook received:', JSON.stringify(body, null, 2));

    // ElevenLabs sends tool calls in the format:
    // { tool_name: "...", parameters: {...} }
    const toolName = body.tool_name;
    const parameters = body.parameters;

    console.log('🔍 Tool call detection:', { toolName, hasParameters: !!parameters });

    if (toolName === 'query_integration_expert') {
      const userMessage = parameters?.message;

      if (!userMessage) {
        return NextResponse.json({ error: 'No message provided' }, { status: 400 });
      }

      console.log('🔑 Tool:', toolName);
      console.log('💬 Message:', userMessage);

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
      let responseText = 'I received your message but have no response.';

      if (Array.isArray(agentData.content) && agentData.content[0]?.text?.value) {
        responseText = agentData.content[0].text.value;
      } else if (typeof agentData.content === 'string') {
        responseText = agentData.content;
      } else if (agentData.response) {
        responseText = agentData.response;
      }

      console.log('🤖 Extracted text:', responseText.substring(0, 200));

      // Return in ElevenLabs expected format
      const response = {
        result: responseText
      };

      console.log('📤 Returning to ElevenLabs:', JSON.stringify(response));

      return NextResponse.json(response);
    }

    // For other message types, just acknowledge
    return NextResponse.json({ status: 'received' });

  } catch (error) {
    console.error('ElevenLabs webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error', result: 'Sorry, something went wrong.' },
      { status: 500 }
    );
  }
}
