# ElevenLabs + Twilio Conference Calling Setup Guide

This guide explains how to set up true 3-way conference calling with ElevenLabs AI voice agent using Twilio.

## Architecture Overview

```
┌──────────────┐
│  Web User    │──┐
│ (Browser)    │  │
└──────────────┘  │
                  │    ┌────────────────────┐
┌──────────────┐  ├───→│ Twilio Conference  │
│ Phone User   │──┘    │   (Room: conf-X)   │
│ (Any Phone)  │       └──────────┬─────────┘
└──────────────┘                  │
                                  │ Media Streams (WebSocket)
                                  ↓
                        ┌──────────────────────┐
                        │   Your Server        │
                        │  - Receives audio    │
                        │  - Sends to AI       │
                        │  - Gets response     │
                        │  - Returns audio     │
                        └──────────────────────┘
                                  │
                                  ↓
                        ┌──────────────────────┐
                        │  ElevenLabs AI       │
                        │  - Speech-to-Text    │
                        │  - AI Brain          │
                        │  - Text-to-Speech    │
                        └──────────────────────┘
```

## What You Built

✅ Twilio token generation endpoint (`/api/twilio/token`)
✅ Media Streams bridge to ElevenLabs (`/api/twilio/media-stream`)
✅ Conference TwiML endpoint (`/api/twilio/conference-elevenlabs`)
✅ Conference starter API (`/api/twilio/start-conference`)
✅ UI integration in VoiceSessionChat component
✅ Status callback handlers

## Required Twilio Credentials

You need to add these to `.env.local`:

### 1. Account SID & Auth Token
Go to https://console.twilio.com
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
```

### 2. Phone Number
Buy a phone number from Twilio Console → Phone Numbers → Buy a number
```env
TWILIO_PHONE_NUMBER=+1234567890
```

### 3. API Key & Secret
Go to https://console.twilio.com → Settings → API Keys → Create new API Key
```env
TWILIO_API_KEY=SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_SECRET=your_api_secret_here
```

### 4. TwiML Application
Go to https://console.twilio.com → Voice → TwiML Apps → Create new

**Configuration:**
- Friendly Name: `Conference AI App`
- Voice Request URL: `https://your-domain.com/api/twilio/conference-elevenlabs`
- Voice Request Method: `POST`

Then add the TwiML App SID to `.env.local`:
```env
TWILIO_TWIML_APP_SID=APxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 5. Webhook Base URL
Set your public webhook URL (use cloudflare tunnel or ngrok):
```env
WEBHOOK_BASE_URL=https://your-tunnel-url.trycloudflare.com
```

## How to Use

### 1. Start Voice Call
- Select **ElevenLabs** as provider
- Click "Start Voice Call"
- You're now talking with ElevenLabs AI

### 2. Add Phone Participant
- Click "Add Phone Participant" section
- Enter phone number: `+972-52-6722216` (or any number)
- Click "Call" button

### 3. Conference Active
- Web user (you) hears and talks to AI
- Phone user hears and talks to AI
- AI participates in real-time with all participants
- **True 3-way conference** - everyone hears everyone

## Technical Details

### Media Streams Flow

1. **Twilio → Server**: Conference audio streamed via WebSocket (mulaw/8kHz)
2. **Server → ElevenLabs**: Audio converted and sent to Conversational AI WebSocket
3. **ElevenLabs → Server**: AI response audio returned
4. **Server → Twilio**: Audio sent back to conference
5. **Twilio → Participants**: All participants hear AI response

### Audio Format Conversion

- **Twilio**: mulaw @ 8kHz base64
- **ElevenLabs**: PCM16 @ 16kHz base64
- Server handles conversion in `/api/twilio/media-stream`

### WebSocket Limitations

Next.js doesn't natively support WebSocket upgrades in App Router. Options:

**Option 1: Custom Server (Recommended)**
Create `server.js`:
```javascript
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { WebSocketServer } = require('ws');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const wss = new WebSocketServer({ server, path: '/api/twilio/media-stream' });

  wss.on('connection', (ws, req) => {
    const { query } = parse(req.url, true);
    // Handle WebSocket connection
    require('./app/api/twilio/media-stream/route').handleWebSocket(
      ws,
      query.conferenceId,
      query.agentId
    );
  });

  server.listen(3000, () => {
    console.log('> Ready on http://localhost:3000');
  });
});
```

**Option 2: Deploy to Vercel/Railway**
These platforms support WebSocket upgrades automatically.

**Option 3: Use Separate WebSocket Server**
Run WebSocket server on different port (e.g., 3001) and proxy through nginx.

## Testing Checklist

- [ ] Twilio credentials added to `.env.local`
- [ ] Phone number purchased and configured
- [ ] TwiML App created and webhook URL set
- [ ] Cloudflare tunnel or ngrok running for webhooks
- [ ] WebSocket server configured (custom server or deployment)
- [ ] ElevenLabs API key in `.env.local`
- [ ] Start call with ElevenLabs provider
- [ ] Add phone participant successfully
- [ ] All three parties can hear each other

## Troubleshooting

### "Twilio credentials not configured"
→ Add all required Twilio environment variables to `.env.local`

### "WebSocket upgrade failed"
→ Need custom server or WebSocket-compatible deployment platform

### "Call connects but no audio"
→ Check Media Streams webhook URL is accessible
→ Verify cloudflare tunnel or ngrok is running
→ Check server logs for WebSocket errors

### "AI doesn't respond"
→ Verify ElevenLabs API key is valid
→ Check ElevenLabs agent ID is correct
→ Review server logs for ElevenLabs WebSocket errors

## Cost Considerations

**Twilio Charges:**
- Phone number: ~$1-2/month
- Outbound calls: ~$0.01-0.04/minute (varies by destination)
- Conference participants: Charged per participant per minute

**ElevenLabs Charges:**
- Conversational AI: Based on usage minutes
- Check your ElevenLabs plan limits

## Next Steps

1. Get Twilio credentials from console
2. Add credentials to `.env.local`
3. Configure custom WebSocket server (if needed)
4. Test with real phone numbers
5. Monitor usage and costs

## Support

If you need help:
- Twilio Docs: https://www.twilio.com/docs/voice/conference
- ElevenLabs Docs: https://elevenlabs.io/docs/conversational-ai
- GitHub Issues: [Your repo here]
