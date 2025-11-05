# Cloudflare Tunnel Setup for VAPI Integration

This guide explains how to set up a **persistent Cloudflare Tunnel** for your VAPI integration, replacing ngrok with a fixed URL that never changes.

## Why Cloudflare Tunnel?

**Problem with ngrok free tier:**
- URL changes every time you restart
- Need to manually update VAPI configuration each time
- Session time limits

**Cloudflare Tunnel benefits:**
- ✅ Fixed URL that never changes
- ✅ No time limits or reconnection needed
- ✅ More secure (authenticated tunnel)
- ✅ No bandwidth limits
- ✅ **Completely FREE**

## Setup Instructions

### 1. Authenticate with Cloudflare

First, you need to authenticate with Cloudflare (one-time setup):

```bash
cloudflared tunnel login
```

This will open your browser to authenticate with Cloudflare. You need:
- A Cloudflare account (free)
- At least one domain in your account (or use the free `.cfargotunnel.com` subdomain)

### 2. Create the Tunnel

Run the setup script to create your tunnel:

```bash
npm run tunnel:setup
```

This script will:
1. Create a persistent tunnel named `sb-vapi-tunnel`
2. Generate a unique tunnel ID
3. Create configuration files
4. Display your fixed tunnel URL

**Your URL will look like:** `https://[tunnel-id].cfargotunnel.com`

### 3. Start the Tunnel

Start the tunnel (run this whenever you want to connect):

```bash
npm run tunnel:start
```

Keep this running in a terminal. The tunnel will:
- Forward requests to your local app on `http://localhost:3000`
- Show connection status and logs
- Remain active until you stop it (Ctrl+C)

### 4. Update VAPI Configuration

Update your VAPI assistant to use the new Cloudflare URL:

```bash
npm run tunnel:update-vapi
```

This automatically:
1. Reads your tunnel URL from the Cloudflare config
2. Updates the VAPI assistant tool endpoint
3. Configures the webhook URL

## URLs Reference

After setup, your URLs will be:

```
Base URL:     https://[tunnel-id].cfargotunnel.com
Webhook:      https://[tunnel-id].cfargotunnel.com/api/vapi-webhook
Tool Server:  https://[tunnel-id].cfargotunnel.com/api/assistant/integration-expert/execute
```

These URLs **never change** - you can configure them once in VAPI and forget about it!

## Daily Usage

1. **Start your Next.js app** (if not already running):
   ```bash
   npm run dev
   ```

2. **Start the Cloudflare tunnel**:
   ```bash
   npm run tunnel:start
   ```

That's it! Your VAPI integration is now accessible via the persistent URL.

## Troubleshooting

### "Not authenticated with Cloudflare"
Run: `cloudflared tunnel login`

### "Tunnel not configured yet"
Run: `npm run tunnel:setup`

### "Could not find tunnel ID"
Delete `~/.cloudflared/config.yml` and run setup again

### Check tunnel status
```bash
cloudflared tunnel list
```

### View tunnel configuration
```bash
cat ~/.cloudflared/config.yml
```

## Advanced: Custom Domain

If you want to use your own domain (e.g., `vapi.yourdomain.com`):

1. Add DNS record in Cloudflare:
   ```bash
   cloudflared tunnel route dns sb-vapi-tunnel vapi.yourdomain.com
   ```

2. Update `~/.cloudflared/config.yml`:
   ```yaml
   ingress:
     - hostname: vapi.yourdomain.com
       service: http://localhost:3000
     - service: http_status:404
   ```

3. Restart the tunnel and update VAPI

## Migration from ngrok

Your old ngrok URL was: `https://e60f20e23ff2.ngrok-free.app`

New Cloudflare URL will be: `https://[tunnel-id].cfargotunnel.com`

The setup script already updated your VAPI configuration, so you're good to go!

## File Reference

- `scripts/setup-cloudflare-tunnel.sh` - One-time setup script
- `scripts/start-cloudflare-tunnel.sh` - Start the tunnel
- `scripts/update-vapi-with-cloudflare.ts` - Update VAPI configuration
- `~/.cloudflared/config.yml` - Tunnel configuration
- `~/.cloudflared/[tunnel-id].json` - Tunnel credentials

## Support

For Cloudflare Tunnel documentation:
https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/

For VAPI webhook documentation:
https://docs.vapi.ai/
