import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AGENT_HUB_API_URL = process.env.AGENT_HUB_API_URL || 'https://agent-hub-api.services.silverbullet.cloud';
const AGENT_HUB_API_KEY = process.env.AGENT_HUB_API_KEY || '';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const agentId = '68e1af59dd4ab3bce91a07dc'; // integration-expert

  // Map routes to workspace paths
  // Note: /vapi root is reserved for the config page at app/vapi/page.tsx
  const routeMap: Record<string, string> = {
    '/vapi/app': '/vapi-integration-app/index.mdx',
    '/vapi/app/tests': '/vapi-integration-app/tests.mdx',
    '/vapi/webhook-test': '/vapi-integration-app/webhook-test.html',
    '/vapi/sessions': '/vapi-integration-app/sessions.html',
  };

  const workspacePath = routeMap[pathname];

  if (workspacePath) {
    try {
      // For MDX files, render them through Agent Hub UI iframe
      if (workspacePath.endsWith('.mdx')) {
        const documentId = Buffer.from(`${agentId}:${workspacePath}`).toString('base64');
        const iframeHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VAPI Integration Expert</title>
  <style>
    body, html {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
    iframe {
      border: none;
      width: 100%;
      height: 100vh;
    }
  </style>
</head>
<body>
  <iframe
    src="http://localhost:5173/embed/workspace/${documentId}?apiKey=${AGENT_HUB_API_KEY}"
    sandbox="allow-scripts allow-forms allow-same-origin"
    title="VAPI Integration Expert Workspace"
  ></iframe>
</body>
</html>`;

        return new NextResponse(iframeHtml, {
          headers: {
            'Content-Type': 'text/html',
            'Cache-Control': 'no-store',
          },
        });
      }

      // For HTML files, serve content directly
      const response = await fetch(`${AGENT_HUB_API_URL}/api/workspace/get?path=${encodeURIComponent(workspacePath)}&scope=agent&agentId=${agentId}`, {
        headers: {
          'Authorization': `Bearer ${AGENT_HUB_API_KEY}`,
          'Content-Type': 'application/json',
          'x-agent-id': agentId
        }
      });

      if (response.ok) {
        const data = await response.json();
        return new NextResponse(data.content, {
          headers: {
            'Content-Type': 'text/html',
            'Cache-Control': 'no-store',
          },
        });
      }
    } catch (error) {
      console.error(`Error fetching ${workspacePath} from workspace:`, error);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/vapi', '/vapi/:path*'],
};
