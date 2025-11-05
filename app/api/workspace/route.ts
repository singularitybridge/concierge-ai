import { NextResponse } from 'next/server';

const AGENT_HUB_API_URL = 'https://2197a486470b.ngrok-free.app';
const INTEGRATION_EXPERT_ID = '68e1af59dd4ab3bce91a07dc';

// Helper to parse lead info from JSON
function parseLeadInfo(content: string) {
  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}

// Helper to parse question from JSON
function parseQuestion(content: string) {
  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'all';

  try {
    const response = {
      leads: [],
      sessions: [],
      questions: []
    };

    // Note: This is a placeholder that shows the structure
    // In production, you would:
    // 1. Use the Agent Hub MCP to list workspace items
    // 2. Filter by type (leads, sessions, questions)
    // 3. Parse the content and return structured data

    // For now, returning mock data that matches the workspace structure
    // When the Agent Hub API is accessible, this would call:
    // - sb-agent-hub__list_workspace_items with scope="agent" and scopeId=INTEGRATION_EXPERT_ID
    // - sb-agent-hub__get_workspace_item for each item to get full content

    if (type === 'all' || type === 'leads') {
      response.leads = [{
        id: 'lead_example_123',
        phoneNumber: '+1234567890',
        firstName: 'Example',
        lastName: 'Lead',
        company: 'Demo Company',
        role: 'CTO',
        status: 'new',
        createdAt: '2025-10-10T12:00:00Z',
        lastContact: '2025-10-10T14:30:00Z',
        sessions: ['session_example_1'],
        interests: ['JIRA', 'SendGrid'],
        notes: 'Interested in integration capabilities'
      }];
    }

    if (type === 'all' || type === 'sessions') {
      response.sessions = [{
        id: 'session_example_1',
        leadId: 'lead_example_123',
        title: 'Initial Consultation - JIRA Integration',
        content: `# Initial Consultation

**Date:** 2025-10-10

## Discussion Points
- Asked about JIRA integration capabilities
- Interested in automated ticket creation
- Wants to see code examples

## Actions Taken
- Provided overview of JIRA integration
- Shared documentation links
- Scheduled follow-up

## Next Steps
- Send implementation guide
- Schedule technical demo`,
        timestamp: '2025-10-10T14:30:00Z'
      }];
    }

    if (type === 'all' || type === 'questions') {
      response.questions = [{
        id: 'question_example_1',
        leadId: 'lead_example_123',
        question: 'How do I integrate with Salesforce CRM?',
        context: 'Customer asked about CRM integration options during initial call',
        timestamp: '2025-10-10T14:35:00Z',
        category: 'integration',
        priority: 'high',
        status: 'pending'
      }];
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching workspace data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workspace data' },
      { status: 500 }
    );
  }
}

// TODO: Implement with real MCP calls
// Example of how it would work:
/*
async function getWorkspaceLeads() {
  // List all items in /leads directory
  const items = await sb_agent_hub__list_workspace_items({
    scope: 'agent',
    scopeId: INTEGRATION_EXPERT_ID,
    prefix: '/leads'
  });

  const leads = [];
  for (const item of items) {
    if (item.endsWith('/info.json')) {
      const content = await sb_agent_hub__get_workspace_item({
        scope: 'agent',
        scopeId: INTEGRATION_EXPERT_ID,
        itemPath: item
      });

      const lead = parseLeadInfo(content);
      if (lead) leads.push(lead);
    }
  }

  return leads;
}
*/
