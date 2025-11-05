#!/bin/bash

# Start Quick Cloudflare Tunnel and update VAPI automatically

echo "🚀 Starting Cloudflare Quick Tunnel on port 4024..."
echo ""

# Start tunnel in background and capture output
TUNNEL_OUTPUT=$(mktemp)
cloudflared tunnel --url http://localhost:4024 > "$TUNNEL_OUTPUT" 2>&1 &
TUNNEL_PID=$!

echo "⏳ Waiting for tunnel URL..."

# Wait for URL to appear (max 15 seconds)
for i in {1..15}; do
    if grep -q "trycloudflare.com" "$TUNNEL_OUTPUT"; then
        break
    fi
    sleep 1
done

# Extract the URL
TUNNEL_URL=$(grep -o "https://[a-z0-9-]*.trycloudflare.com" "$TUNNEL_OUTPUT" | head -1)

if [ -z "$TUNNEL_URL" ]; then
    echo "❌ Failed to get tunnel URL"
    kill $TUNNEL_PID 2>/dev/null
    rm "$TUNNEL_OUTPUT"
    exit 1
fi

echo ""
echo "✅ Tunnel is running!"
echo "📍 URL: $TUNNEL_URL"
echo ""
echo "🔄 Updating VAPI configuration..."
echo ""

# Update VAPI with the new URL
npx tsx scripts/update-vapi-quick.ts "$TUNNEL_URL"

echo ""
echo "🎉 All set! Your VAPI is now connected."
echo ""
echo "📝 Tunnel is running in background (PID: $TUNNEL_PID)"
echo "   To stop: kill $TUNNEL_PID"
echo ""
echo "🔗 URLs:"
echo "   Webhook: $TUNNEL_URL/api/vapi-webhook"
echo "   Tool:    $TUNNEL_URL/api/assistant/integration-expert/execute"
echo ""

# Clean up temp file
rm "$TUNNEL_OUTPUT"

# Wait to keep output visible
echo "Press Ctrl+C to view logs, or close this terminal when done."
wait $TUNNEL_PID
