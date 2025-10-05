import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import http from 'http';

// HTTP agent configured for IPv4 only
const httpAgent = new http.Agent({
  family: 4,  // Force IPv4
  keepAlive: true
});

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

      const agentResponse = await axios.post(agentApiUrl, {
        userInput: userMessage
      }, {
        httpAgent: httpAgent,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.AI_AGENT_API_KEY || ''}`
        },
        timeout: 30000,
        validateStatus: (status) => status < 500 // Don't throw on 4xx
      });

      console.log('📡 Agent response status:', agentResponse.status);

      if (agentResponse.status >= 400) {
        console.error('❌ Agent API error:', agentResponse.status, agentResponse.data);
        throw new Error(`Agent API error: ${agentResponse.status} - ${JSON.stringify(agentResponse.data)}`);
      }

      const agentData = agentResponse.data;

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
