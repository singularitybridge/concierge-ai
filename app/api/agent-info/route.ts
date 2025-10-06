import { NextRequest, NextResponse } from 'next/server';

const AGENT_HUB_API_URL = process.env.AGENT_HUB_API_URL || 'https://agent-hub-api.services.silverbullet.cloud';
const AGENT_HUB_API_KEY = process.env.AGENT_HUB_API_KEY || '';

export async function POST(request: NextRequest) {
  try {
    const { agentId } = await request.json();

    if (!agentId) {
      return NextResponse.json({ error: 'Agent ID required' }, { status: 400 });
    }

    // Call Agent Hub API to get agent info
    const response = await fetch(`${AGENT_HUB_API_URL}/ai-agents/${agentId}`, {
      headers: {
        'Authorization': `Bearer ${AGENT_HUB_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('Failed to fetch agent info:', response.statusText);
      return NextResponse.json({ error: 'Failed to fetch agent info' }, { status: response.status });
    }

    const agentData = await response.json();

    return NextResponse.json({
      id: agentData._id || agentData.id,
      name: agentData.name,
      description: agentData.description,
      llmProvider: agentData.llmProvider,
      llmModel: agentData.llmModel
    });

  } catch (error) {
    console.error('Agent info API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agent info' },
      { status: 500 }
    );
  }
}
