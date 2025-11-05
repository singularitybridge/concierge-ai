import { NextRequest, NextResponse } from 'next/server';

const VAPI_PRIVATE_KEY = process.env.VAPI_PRIVATE_KEY || '59c0d5cc-d643-4b16-9607-224c8f570ae0';
const ASSISTANT_ID = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || '957955fc-dba8-4766-9132-4bcda7aad3b2';

// Get current VAPI configuration
export async function GET() {
  try {
    const response = await fetch(`https://api.vapi.ai/assistant/${ASSISTANT_ID}`, {
      headers: {
        'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error(`VAPI API error: ${response.status}`);
    }

    const config = await response.json();

    return NextResponse.json({
      success: true,
      config: {
        assistantId: config.id,
        assistantName: config.name,
        firstMessage: config.firstMessage || '',
        toolUrl: config.model?.tools?.[0]?.server?.url || null,
        serverMessages: config.serverMessages || [],
        toolName: config.model?.tools?.[0]?.function?.name,
        toolTimeout: config.model?.tools?.[0]?.server?.timeoutSeconds,
        tools: config.model?.tools || [],
        fullToolConfig: config.model?.tools?.[0] || null
      }
    });
  } catch (error) {
    console.error('Error fetching VAPI config:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Update VAPI configuration with new base URL, first message, and tool config
export async function POST(req: NextRequest) {
  try {
    const { baseUrl, firstMessage, toolConfig } = await req.json();

    if (!baseUrl && !firstMessage && !toolConfig) {
      return NextResponse.json({
        success: false,
        error: 'At least one field (baseUrl, firstMessage, or toolConfig) is required'
      }, { status: 400 });
    }

    // First, get the current configuration to preserve existing model settings
    const currentResponse = await fetch(`https://api.vapi.ai/assistant/${ASSISTANT_ID}`, {
      headers: {
        'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`
      }
    });

    if (!currentResponse.ok) {
      throw new Error(`Failed to fetch current VAPI config: ${currentResponse.status}`);
    }

    const currentConfig = await currentResponse.json();

    // Build update payload
    const updatePayload: any = {};

    // Handle base URL update
    if (baseUrl || toolConfig) {
      const cleanBaseUrl = baseUrl ? baseUrl.replace(/\/$/, '') : '';
      const toolUrl = baseUrl ? `${cleanBaseUrl}/api/assistant/integration-expert/execute` : toolConfig?.server?.url;
      const webhookUrl = baseUrl ? `${cleanBaseUrl}/api/vapi-webhook` : currentConfig.serverUrl;

      if (baseUrl) {
        console.log('Updating URLs...');
        console.log('Tool URL:', toolUrl);
        console.log('Webhook URL:', webhookUrl);

        updatePayload.serverUrl = webhookUrl;
        updatePayload.server = {
          url: webhookUrl,
          timeoutSeconds: 20
        };
      }

      // Preserve existing model configuration and only update tools
      updatePayload.model = {
        ...currentConfig.model,  // Preserve provider, model, temperature, etc.
        tools: [
          toolConfig || {
            type: 'function',
            async: false,
            server: {
              url: toolUrl,
              timeoutSeconds: 30
            },
            function: {
              name: 'query_integration_expert',
              parameters: {
                type: 'object',
                required: ['user-input'],
                properties: {
                  'user-input': {
                    type: 'string',
                    description: 'The user\'s question about integrations, actions, or platform capabilities'
                  }
                }
              },
              description: 'Query the AI Agent Hub integration expert to get comprehensive information about available integrations, actions, implementation details, and platform capabilities. Use this for ANY question about integrations, technical details, or how to use the platform.'
            }
          }
        ]
      };

      // If toolConfig provided with baseUrl, update the URL in it
      if (baseUrl && toolConfig && updatePayload.model.tools[0].server) {
        updatePayload.model.tools[0].server.url = toolUrl;
      }
    }

    // Handle first message update
    if (firstMessage !== undefined) {
      updatePayload.firstMessage = firstMessage;
    }

    console.log('Updating VAPI configuration with:', JSON.stringify(updatePayload, null, 2));

    // Update assistant configuration
    const response = await fetch(`https://api.vapi.ai/assistant/${ASSISTANT_ID}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatePayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`VAPI API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();

    const toolUrl = baseUrl ? `${baseUrl.replace(/\/$/, '')}/api/assistant/integration-expert/execute` :
                    toolConfig?.server?.url || currentConfig.model?.tools?.[0]?.server?.url;

    return NextResponse.json({
      success: true,
      message: 'VAPI configuration updated successfully',
      config: {
        toolUrl,
        assistantId: result.id
      }
    });
  } catch (error) {
    console.error('Error updating VAPI config:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
