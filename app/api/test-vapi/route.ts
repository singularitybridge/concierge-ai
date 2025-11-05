import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Get VAPI configuration from environment
    const vapiPrivateKey = process.env.VAPI_PRIVATE_KEY;
    const vapiAssistantId = body.assistantId || process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || '957955fc-dba8-4766-9132-4bcda7aad3b2';

    if (!vapiPrivateKey) {
      return NextResponse.json(
        { error: 'VAPI_PRIVATE_KEY not configured' },
        { status: 500 }
      );
    }

    // Format request for VAPI Chat API
    const vapiRequest = {
      input: [
        {
          role: 'user',
          content: body.userInput || body.message || ''
        }
      ],
      assistantId: vapiAssistantId,
      stream: false // Non-streaming for now, can enable later
    };

    // Add previousChatId if provided for conversation continuity
    if (body.previousChatId) {
      vapiRequest.previousChatId = body.previousChatId;
    }

    console.log('[VAPI Chat Proxy] Calling VAPI Chat API');
    console.log('[VAPI Chat Proxy] Assistant ID:', vapiAssistantId);
    console.log('[VAPI Chat Proxy] User input:', vapiRequest.input[0].content);

    // Call VAPI Chat API
    const response = await fetch('https://api.vapi.ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${vapiPrivateKey}`
      },
      body: JSON.stringify(vapiRequest)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[VAPI Chat Proxy] Error response:', errorText);
      return NextResponse.json(
        {
          error: `VAPI API Error: ${response.status} ${response.statusText}`,
          details: errorText
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Extract the conversation flow from VAPI response
    let finalResponse = '';
    let toolCalls = [];
    let conversationFlow = [];

    if (data.output && Array.isArray(data.output)) {
      // Parse the conversation flow
      for (const item of data.output) {
        if (item.role === 'assistant' && item.tool_calls) {
          // Tool call made by assistant
          toolCalls = item.tool_calls;
          conversationFlow.push({
            type: 'tool_call',
            calls: item.tool_calls.map(tc => ({
              name: tc.function.name,
              arguments: JSON.parse(tc.function.arguments)
            }))
          });
        } else if (item.role === 'tool') {
          // Tool response - handle various content formats
          let toolContent = item.content;

          // If content is a string, try to parse it as JSON
          if (typeof toolContent === 'string') {
            try {
              toolContent = JSON.parse(toolContent);
            } catch (parseError) {
              // If parsing fails, treat as plain string
              console.warn('[VAPI Chat Proxy] Could not parse tool content as JSON:', parseError);
              conversationFlow.push({
                type: 'tool_response',
                content: toolContent // Use the raw string
              });
              continue;
            }
          }

          // Extract response from various possible formats
          let responseText = '';
          if (toolContent.content && Array.isArray(toolContent.content) && toolContent.content[0]?.text?.value) {
            responseText = toolContent.content[0].text.value;
          } else if (toolContent.result) {
            responseText = toolContent.result;
          } else if (toolContent.response) {
            responseText = toolContent.response;
          } else if (typeof toolContent === 'string') {
            responseText = toolContent;
          }

          if (responseText) {
            conversationFlow.push({
              type: 'tool_response',
              content: responseText
            });
          }
        } else if (item.role === 'assistant' && item.content) {
          // Final assistant response
          finalResponse = item.content;
          conversationFlow.push({
            type: 'final_response',
            content: item.content
          });
        }
      }
    }

    // Format response
    // VAPI returns 'id' field, not 'chatId', for session tracking
    const sessionId = data.id || `chat_${Date.now()}`;

    return NextResponse.json({
      id: sessionId,
      role: 'assistant',
      content: [
        {
          type: 'text',
          text: {
            value: finalResponse || 'No response received'
          }
        }
      ],
      created_at: Math.floor(Date.now() / 1000),
      assistant_id: vapiAssistantId,
      message_type: 'text',
      chatId: sessionId, // Return as chatId for frontend consistency
      conversationFlow: conversationFlow, // Include full flow for debugging
      rawOutput: data.output // Include raw output for inspection
    });

  } catch (error) {
    console.error('[VAPI Chat Proxy] Error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
