#!/bin/bash

# Setup Cloudflare Tunnel for VAPI Integration
# This script creates a persistent tunnel with a fixed URL

set -e

echo "🌐 Setting up Cloudflare Tunnel for VAPI..."
echo ""

# Tunnel name
TUNNEL_NAME="sb-vapi-tunnel"

# Check if already authenticated
if [ ! -f ~/.cloudflared/cert.pem ]; then
    echo "❌ Not authenticated with Cloudflare"
    echo "   Please run: cloudflared tunnel login"
    exit 1
fi

# Check if tunnel already exists
if cloudflared tunnel list | grep -q "$TUNNEL_NAME"; then
    echo "✅ Tunnel '$TUNNEL_NAME' already exists"
    TUNNEL_ID=$(cloudflared tunnel list | grep "$TUNNEL_NAME" | awk '{print $1}')
else
    echo "📡 Creating tunnel '$TUNNEL_NAME'..."
    cloudflared tunnel create $TUNNEL_NAME
    TUNNEL_ID=$(cloudflared tunnel list | grep "$TUNNEL_NAME" | awk '{print $1}')
    echo "✅ Tunnel created with ID: $TUNNEL_ID"
fi

echo ""
echo "🎯 Your fixed tunnel URL will be:"
echo "   https://${TUNNEL_ID}.cfargotunnel.com"
echo ""
echo "💾 Creating tunnel configuration..."

# Create config file
mkdir -p ~/.cloudflared
cat > ~/.cloudflared/config.yml <<EOF
tunnel: $TUNNEL_ID
credentials-file: /Users/avi/.cloudflared/${TUNNEL_ID}.json

ingress:
  - hostname: ${TUNNEL_ID}.cfargotunnel.com
    service: http://localhost:3000
  - service: http_status:404
EOF

echo "✅ Configuration created at ~/.cloudflared/config.yml"
echo ""
echo "🚀 Tunnel setup complete!"
echo ""
echo "Next steps:"
echo "1. Start the tunnel: ./scripts/start-cloudflare-tunnel.sh"
echo "2. Update VAPI config: npm run update-vapi-url"
echo ""
echo "Your persistent VAPI webhook URL:"
echo "   https://${TUNNEL_ID}.cfargotunnel.com/api/vapi-webhook"
