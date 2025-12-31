# CLAUDE.md - Project Context for Claude Code

## Project Overview

**AI Realtime Voice Chat** - A Next.js application for voice chat powered by VAPI and custom AI agents. Supports web voice, phone calls, and messaging platforms (WhatsApp, Slack).

## Quick Commands

```bash
# Start with PM2 (recommended)
pm2 start ecosystem.config.js

# PM2 management
pm2 logs ai-realtime-chat    # View logs
pm2 restart ai-realtime-chat # Restart
pm2 stop ai-realtime-chat    # Stop

# Direct npm
npm run dev                  # Dev server on port 4024
npm run build                # Build for production
npm run lint                 # Run linter
```

## Tech Stack

- **Framework**: Next.js 16 with Turbopack
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State**: Zustand
- **Voice**: VAPI SDK (@vapi-ai/web, @vapi-ai/server-sdk)
- **Phone**: Twilio Voice SDK
- **Process Manager**: PM2

## Project Structure

```
app/
├── api/
│   └── vapi-webhook/route.ts  # VAPI webhook handler
├── components/
│   └── VapiButton.tsx         # Voice chat button
├── layout.tsx                 # Root layout
└── page.tsx                   # Landing page

data/                          # JSON data files
├── guests.json
├── properties.json
├── reservations.json
└── services.json

scripts/                       # Utility scripts
└── test-vapi-chat.ts         # Chat API test script

docs/
└── VOICE_PROVIDER_ANALYSIS.md # Provider comparison
```

## Development

- **Port**: 4024 (dev server)
- **PM2 App Name**: `ai-realtime-chat`
- **Config**: `ecosystem.config.js`
- **Logs**: `./logs/pm2-out.log`, `./logs/pm2-error.log`

## Deployment

- **Platform**: Vercel (auto-deploy on push to main)
- **GitHub Repo**: `singularitybridge/concierge-ai`
- **Production URL**: Automatically deployed from `main` branch

## Environment Variables

Required in `.env.local`:
- `AI_AGENT_API_URL` - AI agent API endpoint
- `AI_AGENT_ID` - Agent identifier
- `AI_AGENT_API_KEY` - Agent API key
- `NEXT_PUBLIC_VAPI_PUBLIC_KEY` - VAPI public key
- `VAPI_PRIVATE_KEY` - VAPI private key
- `NEXT_PUBLIC_VAPI_ASSISTANT_ID` - VAPI assistant ID

## Key Files

- `app/api/vapi-webhook/route.ts` - Main webhook for VAPI integration
- `app/components/VapiButton.tsx` - Voice chat UI component
- `ecosystem.config.js` - PM2 configuration
- `next.config.ts` - Next.js configuration
