#!/bin/bash

# Start Cloudflare Tunnel for VAPI Integration

echo "🚀 Starting Cloudflare Tunnel..."
echo ""

# Check if config exists
if [ ! -f ~/.cloudflared/config.yml ]; then
    echo "❌ Tunnel not configured yet"
    echo "   Please run: ./scripts/setup-cloudflare-tunnel.sh"
    exit 1
fi

# Get tunnel ID from config
TUNNEL_ID=$(grep "^tunnel:" ~/.cloudflared/config.yml | awk '{print $2}')

if [ -z "$TUNNEL_ID" ]; then
    echo "❌ Could not find tunnel ID in config"
    exit 1
fi

echo "📡 Tunnel URL: https://${TUNNEL_ID}.cfargotunnel.com"
echo "🎯 Webhook URL: https://${TUNNEL_ID}.cfargotunnel.com/api/vapi-webhook"
echo "🎯 Tool URL: https://${TUNNEL_ID}.cfargotunnel.com/api/assistant/integration-expert/execute"
echo ""
echo "🌐 Starting tunnel (Ctrl+C to stop)..."
echo ""

# Start the tunnel
cloudflared tunnel run
