#!/bin/bash

# Start Cloudflare Permanent Tunnel with token

TUNNEL_TOKEN="eyJhIjoiZjk3Yjc5YWEwMmRmMmQ3MmY0ODIyMDFkM2Q0NzRmNjMiLCJ0IjoiYTg0M2NiYWUtNzg5ZC00N2Q0LWE0NDYtYWVhZGY1ZjBmNDMyIiwicyI6Ill6VTBZVFEyTWpjdFpqQTFPUzAwWWpOaUxXSTJPV0V0TmpZek1tSmhOR05pTjJRMyJ9"

echo "🚀 Starting Cloudflare Permanent Tunnel..."
echo ""
echo "⚠️  IMPORTANT: Before running this tunnel, you need to configure routing in the Cloudflare dashboard:"
echo ""
echo "   1. Go to: https://one.dash.cloudflare.com/"
echo "   2. Navigate to: Networks > Tunnels"
echo "   3. Click on your tunnel"
echo "   4. Go to 'Public Hostname' tab"
echo "   5. Add a public hostname:"
echo "      - Subdomain: (leave blank or choose one)"
echo "      - Domain: (select your tunnel domain)"
echo "      - Service: http://localhost:4024"
echo ""
echo "   Once configured, your tunnel URL will be shown in the dashboard."
echo ""
echo "Press Enter to start the tunnel..."
read

echo "🌐 Starting tunnel..."
echo ""

cloudflared tunnel run --token "$TUNNEL_TOKEN"
