import { NextRequest, NextResponse } from 'next/server';

const AGENT_HUB_API_URL = process.env.AGENT_HUB_API_URL || 'https://agent-hub-api.services.silverbullet.cloud';
const AGENT_HUB_API_KEY = process.env.AGENT_HUB_API_KEY || '';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get('agentId');
  const filePath = searchParams.get('filePath');

  if (!agentId) {
    return NextResponse.json({ error: 'Agent ID required' }, { status: 400 });
  }

  try {
    // Resolve agent name to ID if needed
    let resolvedAgentId = agentId;
    if (!/^[0-9a-f]{24}$/i.test(agentId)) {
      // Not a MongoDB ObjectID, try to resolve as name
      try {
        const agentInfoResponse = await fetch(`${AGENT_HUB_API_URL}/ai-agents/${agentId}`, {
          headers: {
            'Authorization': `Bearer ${AGENT_HUB_API_KEY}`,
            'Content-Type': 'application/json'
          }
        });

        if (agentInfoResponse.ok) {
          const agentData = await agentInfoResponse.json();
          resolvedAgentId = agentData._id || agentData.id;
        }
      } catch (err) {
        console.error('Error resolving agent name:', err);
      }
    }

    // If filePath provided, get specific file content
    if (filePath) {
      try {
        const contentResponse = await fetch(`${AGENT_HUB_API_URL}/api/workspace/get?path=${encodeURIComponent(filePath)}&scope=agent&agentId=${resolvedAgentId}`, {
          headers: {
            'Authorization': `Bearer ${AGENT_HUB_API_KEY}`,
            'Content-Type': 'application/json',
            'x-agent-id': resolvedAgentId
          }
        });

        if (contentResponse.ok) {
          const fileData = await contentResponse.json();

          // Determine mimeType based on file extension
          let mimeType = 'text/plain';
          if (filePath.endsWith('.html')) {
            mimeType = 'text/html';
          } else if (filePath.endsWith('.mdx') || filePath.endsWith('.md')) {
            mimeType = 'text/markdown';
          }

          return NextResponse.json({
            path: filePath,
            content: fileData.content,
            mimeType
          });
        }
      } catch (err) {
        console.error('Error fetching file from workspace:', err);
      }

      // If file not found, return session MDX content (converted to HTML)
      if (filePath === '/agent.session.mdx') {
        const sessionContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      max-width: 900px;
      margin: 0 auto;
      padding: 40px 20px;
      line-height: 1.6;
      color: #1f2937;
    }
    h1 {
      color: #4f46e5;
      font-size: 2.5rem;
      margin-bottom: 1rem;
      font-weight: 700;
    }
    h2 {
      color: #6366f1;
      font-size: 1.75rem;
      margin-top: 2.5rem;
      margin-bottom: 1rem;
      font-weight: 600;
    }
    h3 {
      color: #374151;
      font-size: 1.25rem;
      margin-bottom: 0.5rem;
      font-weight: 600;
    }
    p {
      margin-bottom: 1rem;
      color: #4b5563;
    }
    ol {
      color: #4b5563;
    }
    ol li {
      margin-bottom: 0.5rem;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      margin: 1.5rem 0;
    }
    .card {
      padding: 1rem;
      border-radius: 0.5rem;
    }
    .card h3 {
      margin-top: 0;
      margin-bottom: 0.5rem;
      font-weight: 600;
    }
    .card p {
      font-size: 0.875rem;
      margin: 0;
    }
    .bg-blue-50 { background: #eff6ff; }
    .text-blue-900 { color: #1e3a8a; }
    .text-blue-700 { color: #1d4ed8; }
    .bg-purple-50 { background: #faf5ff; }
    .text-purple-900 { color: #581c87; }
    .text-purple-700 { color: #7e22ce; }
    .bg-green-50 { background: #f0fdf4; }
    .text-green-900 { color: #14532d; }
    .text-green-700 { color: #15803d; }
    .bg-orange-50 { background: #fff7ed; }
    .text-orange-900 { color: #7c2d12; }
    .text-orange-700 { color: #c2410c; }
    .session-box {
      background: #f9fafb;
      border-left: 4px solid #6366f1;
      border-radius: 0.5rem;
      padding: 1rem;
      margin: 1.5rem 0;
    }
    .session-box p {
      font-size: 0.875rem;
      color: #4b5563;
      margin: 0;
    }
    hr {
      border: none;
      border-top: 1px solid #e5e7eb;
      margin: 2rem 0;
    }
    .ideas ul {
      list-style: none;
      padding: 0;
    }
    .ideas li {
      padding: 0.5rem 0;
      color: #6b7280;
      font-style: italic;
    }
    .footer {
      margin-top: 2rem;
      text-align: center;
      font-size: 0.875rem;
      color: #6b7280;
    }
  </style>
</head>
<body>
  <h1>🎙️ Voice Session Ready</h1>
  <p>Welcome to your AI-powered workspace! I'm here to help you create, build, and collaborate through natural voice conversations.</p>

  <h2>What We Can Build Together</h2>
  <div class="grid">
    <div class="card bg-blue-50">
      <h3 class="text-blue-900">📱 Web Applications</h3>
      <p class="text-blue-700">Interactive HTML/CSS/JS apps, React components, full-stack features</p>
    </div>
    <div class="card bg-purple-50">
      <h3 class="text-purple-900">📄 Documents</h3>
      <p class="text-purple-700">Reports, presentations, documentation, markdown files</p>
    </div>
    <div class="card bg-green-50">
      <h3 class="text-green-900">🎨 Designs</h3>
      <p class="text-green-700">Prototypes, mockups, landing pages, UI components</p>
    </div>
    <div class="card bg-orange-50">
      <h3 class="text-orange-900">⚙️ Code & Tools</h3>
      <p class="text-orange-700">Scripts, utilities, APIs, automation tools</p>
    </div>
  </div>

  <h2>How to Get Started</h2>
  <ol>
    <li><strong>Click "Start Voice Call"</strong> in the panel to begin</li>
    <li><strong>Tell me what you want to create</strong> - be as specific or high-level as you like</li>
    <li><strong>Watch files appear</strong> in real-time as I build</li>
    <li><strong>Iterate together</strong> - refine, adjust, and improve through conversation</li>
  </ol>

  <h2>Current Session</h2>
  <div class="session-box">
    <p class="text-gray-600">No active goals yet. Start by telling me what you'd like to build!</p>
  </div>

  <hr>

  <h3>💡 Quick Start Ideas</h3>
  <ul class="ideas">
    <li><em>"Create a task manager app with a clean UI"</em></li>
    <li><em>"Build an interactive pricing calculator"</em></li>
    <li><em>"Design a landing page for a SaaS product"</em></li>
    <li><em>"Generate a weekly report template"</em></li>
    <li><em>"Make a color palette generator tool"</em></li>
  </ul>

  <div class="footer">
    Your files will appear in this workspace as we build → Check the file selector above to view them
  </div>
</body>
</html>`;

        return NextResponse.json({
          path: filePath,
          content: sessionContent,
          mimeType: 'text/html'
        });
      }

      return NextResponse.json({
        path: filePath,
        content: '# File not found\n\nThis file has not been created yet.',
        mimeType: 'text/plain'
      });
    }

    // Try to list workspace files via Agent Hub API
    try {
      const listResponse = await fetch(`${AGENT_HUB_API_URL}/api/workspace/list?prefix=/&scope=agent&agentId=${resolvedAgentId}`, {
        headers: {
          'Authorization': `Bearer ${AGENT_HUB_API_KEY}`,
          'Content-Type': 'application/json',
          'x-agent-id': resolvedAgentId
        }
      });

      if (listResponse.ok) {
        const data = await listResponse.json();
        // Agent Hub API returns 'paths' not 'items', and without leading slashes
        const files = (data.paths || data.items || []).map((path: string) =>
          path.startsWith('/') ? path : `/${path}`
        ).filter((path: string) => path !== '/');

        console.log(`[Workspace API] Successfully listed ${files.length} files for agent ${resolvedAgentId}`);
        return NextResponse.json({
          files: files
        });
      } else {
        const errorText = await listResponse.text();
        console.warn(`[Workspace API] Failed to list files for agent ${resolvedAgentId}: ${listResponse.status} ${errorText}`);
      }
    } catch (err) {
      console.error('[Workspace API] Error listing workspace files:', err);
    }

    // Fallback to empty array if workspace not accessible
    // Note: Agent Hub HTTP API may not be available - files can still be managed via MCP
    console.log(`[Workspace API] Returning empty file list for agent ${resolvedAgentId} (workspace may be managed via MCP)`);
    return NextResponse.json({
      files: [],
      message: 'Workspace listing via HTTP API unavailable. Files may be managed via MCP protocol.'
    });

  } catch (error) {
    console.error('Workspace API error:', error);
    return NextResponse.json(
      { error: 'Failed to access workspace' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, filePath, content } = body;

    if (!agentId || !filePath) {
      return NextResponse.json({ error: 'Agent ID and file path required' }, { status: 400 });
    }

    // Resolve agent name to ID if needed
    let resolvedAgentId = agentId;
    if (!/^[0-9a-f]{24}$/i.test(agentId)) {
      try {
        const agentInfoResponse = await fetch(`${AGENT_HUB_API_URL}/ai-agents/${agentId}`, {
          headers: {
            'Authorization': `Bearer ${AGENT_HUB_API_KEY}`,
            'Content-Type': 'application/json'
          }
        });

        if (agentInfoResponse.ok) {
          const agentData = await agentInfoResponse.json();
          resolvedAgentId = agentData._id || agentData.id;
        }
      } catch (err) {
        console.error('Error resolving agent name:', err);
      }
    }

    // Save to Agent Hub workspace
    const saveResponse = await fetch(`${AGENT_HUB_API_URL}/api/workspace/set`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AGENT_HUB_API_KEY}`,
        'Content-Type': 'application/json',
        'x-agent-id': resolvedAgentId
      },
      body: JSON.stringify({
        path: filePath,
        content: content,
        metadata: {
          scope: 'agent',
          agentId: resolvedAgentId
        }
      })
    });

    if (saveResponse.ok) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Failed to save file' }, { status: 500 });
  } catch (error) {
    console.error('Workspace update error:', error);
    return NextResponse.json({ error: 'Failed to update workspace' }, { status: 500 });
  }
}
