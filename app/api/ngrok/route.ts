import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Check if ngrok is running and get the URL
async function getNgrokUrl(): Promise<string | null> {
  try {
    // Check if ngrok process is running
    const { stdout: psOutput } = await execAsync('ps aux | grep "[n]grok http" || echo "not running"');

    if (psOutput.includes('not running')) {
      return null;
    }

    // Try to get URL from ngrok API
    try {
      const response = await fetch('http://127.0.0.1:4040/api/tunnels');
      const data = await response.json();

      if (data.tunnels && data.tunnels.length > 0) {
        // Find HTTPS tunnel
        const httpsTunnel = data.tunnels.find((t: any) => t.public_url?.startsWith('https://'));
        if (httpsTunnel) {
          return httpsTunnel.public_url;
        }

        // Fallback to first tunnel
        return data.tunnels[0].public_url;
      }
    } catch (apiError) {
      console.log('Ngrok API not accessible, process might be starting...');
    }

    return null;
  } catch (error) {
    console.error('Error checking ngrok:', error);
    return null;
  }
}

// Start ngrok on port 4024
async function startNgrok(): Promise<{ url: string | null; error?: string }> {
  try {
    // Check if ngrok is already running
    const existingUrl = await getNgrokUrl();
    if (existingUrl) {
      return { url: existingUrl };
    }

    console.log('Starting ngrok on port 4024...');

    // Start ngrok in background
    exec('ngrok http 4024 --log=stdout > /tmp/ngrok.log 2>&1 &', (error) => {
      if (error) {
        console.error('Error starting ngrok:', error);
      }
    });

    // Wait for ngrok to start (max 10 seconds)
    for (let i = 0; i < 20; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));

      const url = await getNgrokUrl();
      if (url) {
        console.log('Ngrok started successfully:', url);
        return { url };
      }
    }

    return {
      url: null,
      error: 'Ngrok started but URL not available yet. Please try again in a few seconds.'
    };
  } catch (error) {
    console.error('Error starting ngrok:', error);
    return {
      url: null,
      error: error instanceof Error ? error.message : 'Failed to start ngrok'
    };
  }
}

// GET: Check ngrok status and get URL
export async function GET() {
  try {
    const url = await getNgrokUrl();

    return NextResponse.json({
      success: true,
      running: !!url,
      url: url,
      port: 4024
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST: Start ngrok if not running
export async function POST() {
  try {
    const result = await startNgrok();

    if (result.url) {
      return NextResponse.json({
        success: true,
        url: result.url,
        message: 'Ngrok is running'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to start ngrok'
      }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
