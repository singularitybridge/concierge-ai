# AI Realtime Voice Chat

Voice chat application powered by VAPI and custom AI agents. Talk to your AI assistant using voice, phone, or messaging platforms.

## Architecture

```
User (Web/Phone/WhatsApp/Slack)
    ↓
VAPI (Speech-to-Text + Text-to-Speech)
    ↓
Next.js Webhook (/api/vapi-webhook)
    ↓
Your AI Agent API
```

## Features

- 🎤 **Voice Input** - Speak naturally to your AI agent
- ⚡ **Real-time** - Get instant responses
- 📞 **Phone Support** - Call from any phone
- 💬 **Multi-platform** - WhatsApp, Slack & more

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:

```env
# AI Agent API (from sb-api-services-v2)
AI_AGENT_API_URL=http://localhost:3000/api/v1/agents
AI_AGENT_ID=your-agent-id
AI_AGENT_API_KEY=your-agent-api-key

# VAPI Configuration (get from vapi.ai)
NEXT_PUBLIC_VAPI_PUBLIC_KEY=your-vapi-public-key
VAPI_PRIVATE_KEY=your-vapi-private-key
NEXT_PUBLIC_VAPI_ASSISTANT_ID=your-vapi-assistant-id
```

### 3. Set Up VAPI

1. Sign up at [vapi.ai](https://vapi.ai)
2. Create a new assistant in the VAPI dashboard
3. Configure the assistant:
   - **Function/Tool**: Add a function that calls your webhook
   - **URL**: `https://your-domain.com/api/vapi-webhook`
   - **Method**: POST
4. Copy your Public Key and Assistant ID to `.env.local`

### 4. Configure Your AI Agent

The webhook expects your AI agent API to accept this format:

```json
POST /execute
{
  "assistantId": "your-agent-id",
  "userInput": "user message here"
}
```

And return:

```json
{
  "response": "agent response text",
  // or
  "content": "agent response text"
}
```

### 5. Run Development Server

#### Option A: Using PM2 (Recommended)

```bash
pm2 start ecosystem.config.js
```

Useful PM2 commands:
```bash
pm2 logs ai-realtime-chat    # View logs
pm2 restart ai-realtime-chat # Restart app
pm2 stop ai-realtime-chat    # Stop app
pm2 status                   # Check all processes
```

#### Option B: Using npm directly

```bash
npm run dev
```

Open [http://localhost:4024](http://localhost:4024)

## Usage

### Web Widget

1. Click the phone button in the bottom right corner
2. Allow microphone access
3. Start speaking!

### Phone Integration

1. Purchase a phone number in VAPI dashboard ($10/month)
2. Configure the number to use your assistant
3. Call the number to talk to your AI agent

### Messaging Platforms

#### Slack
1. Install VAPI Slack app from dashboard
2. Select your assistant
3. DM the bot or mention it in channels

#### WhatsApp/Telegram
1. Set up Twilio account
2. Connect Twilio to VAPI
3. Configure webhook forwarding
4. See full guide: `docs/VOICE_PROVIDER_ANALYSIS.md`

## Project Structure

```
app/
├── api/
│   └── vapi-webhook/
│       └── route.ts          # VAPI webhook handler
├── components/
│   └── VapiButton.tsx        # Voice chat button
├── layout.tsx                # Root layout with VAPI
└── page.tsx                  # Landing page

docs/
└── VOICE_PROVIDER_ANALYSIS.md # Detailed provider comparison
```

## API Route

The webhook at `/api/vapi-webhook` handles VAPI function calls and forwards them to your AI agent API.

Key flow:
1. User speaks → VAPI converts to text
2. VAPI calls webhook with message
3. Webhook forwards to AI agent
4. Agent response returned to VAPI
5. VAPI speaks response to user

## Customization

### Change AI Provider

Edit `app/api/vapi-webhook/route.ts` to change how you call your AI agent:

```typescript
const agentResponse = await fetch(`${agentApiUrl}/execute`, {
  // Your custom API call here
});
```

### Style the Widget

Edit `app/components/VapiButton.tsx` to customize the voice button appearance.

### Update Landing Page

Edit `app/page.tsx` to change the UI.

## Testing Without Voice

Use the Chat API test script to test webhook integration programmatically:

```bash
# Test with a question that will trigger the function
npx tsx scripts/test-vapi-chat.ts "What integrations are available?"

# Test with a custom message
npx tsx scripts/test-vapi-chat.ts "How do I use the Slack integration?"
```

The script sends text messages to VAPI, which triggers the webhook flow just like voice calls. This is much faster for testing!

## Troubleshooting

### Voice button not working
- Check browser console for errors
- Verify `NEXT_PUBLIC_VAPI_PUBLIC_KEY` is set
- Verify `NEXT_PUBLIC_VAPI_ASSISTANT_ID` is set
- Allow microphone permissions

### Agent not responding
- Check webhook is publicly accessible
- Verify AI agent API is running
- Check environment variables are correct
- Review webhook logs for errors

### Poor voice quality
- Check internet connection
- Adjust VAPI voice settings in dashboard
- Consider upgrading VAPI plan

## Deployment

This project is configured for automatic deployment via Vercel:

- **Platform**: Vercel
- **Auto-deploy**: Pushes to `main` branch trigger automatic deployment
- **GitHub**: [singularitybridge/concierge-ai](https://github.com/singularitybridge/concierge-ai)

To deploy manually:
```bash
npm run build
```

## Cost Estimate

Based on 10,000 minutes/month:
- VAPI base: $500
- Phone lines (5): $50
- Speech-to-Text: ~$120
- Text-to-Speech: ~$750
- **Total**: ~$1,520/month ($0.15/min)

## Next Steps

1. ✅ Web voice chat working
2. 🔄 Add phone number integration
3. 🔄 Set up Slack/WhatsApp
4. 🔄 Add conversation history
5. 🔄 Implement user authentication

## Resources

- [VAPI Documentation](https://docs.vapi.ai)
- [AI Agent Hub API](../sb-api-services-v2)
- [Voice Provider Analysis](docs/VOICE_PROVIDER_ANALYSIS.md)
