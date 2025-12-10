/**
 * Update ElevenLabs Agents with Real The 1898 Niseko Hotel Data
 * Updates system prompts to include accurate suite types and amenities
 */

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || '';

// Agent IDs from .env.local
const AGENTS = {
  guestServices: process.env.NEXT_PUBLIC_ELEVENLABS_GUESTSERVICES_AGENT_ID || 'agent_6101kb6k5whff2crpw8yxvwcxs95',
  mainAgent: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || 'agent_1701k6s0xmc7e4ysqcqq5msf3yvq',
};

const API_BASE = 'https://api.elevenlabs.io/v1';

// Real The 1898 Niseko hotel data
const HOTEL_INFO = `
## The 1898 Niseko - Luxury Boutique Hotel

### Our Suite Collection
All suites feature private onsen, floor-to-ceiling windows, heated floors, and direct elevator access.

**Penthouses:**
- **Hirafu Penthouse** - "The Ultimate Mountain Residence" (4 bed, 280 sqm) - Unobstructed Mt. Yotei views, butler service
- **Hanazono Penthouse** - "Panoramic Mountain Luxury" (3 bed, 220 sqm) - Wraparound views of Hanazono ski area

**Duplex Suites:**
- **Annupuri Duplex** - "Elevated Living" (3 bed, 180 sqm) - Two-level family suite, Mt. Annupuri views
- **Village Duplex** - "Contemporary Mountain Elegance" (2 bed, 150 sqm) - Modern luxury with Japanese design, fireplace

**Premium Suites:**
- **Moiwa Suite** - "Intimate Sophistication" (2 bed, 120 sqm) - Mt. Moiwa views, tatami room
- **Weiss Suite** - "Refined Simplicity" (1 bed, 85 sqm) - Work desk, private bar, perfect for business travelers

### Hotel Services (Available to All Guests)
- **Transfers and Private Transport** - Airport pickups from New Chitose, private car service
- **World-Class Dining & On-Site Sommelier** - Fine dining with curated wine pairings
- **Onsen in Every Unit** - Private hot spring bath in each suite
- **Laundry and Cleaning** - Daily housekeeping and laundry service
- **Massage & Wellness Treatments** - In-suite spa treatments available
- **On-Site Parking** - Valet parking service
- **Concierge Service** - 24/7 personal concierge for all requests

### Additional Services
- Ski services (lift passes, premium rentals, private lessons)
- Winter activities (snowshoeing, snowmobile tours, ice fishing)
- Complimentary shuttle to Niseko United ski resorts

### Current Guests
- **Tanaka Family** (VIP) - Hirafu Penthouse, Dec 10-15, celebrating anniversary
- **Mr. & Mrs. Chen** - Moiwa Suite, Dec 10-13, honeymoon couple
- **Sato Couple** - Village Duplex, Dec 8-12, anniversary
- **Kim Family** - Annupuri Duplex, Dec 9-11, family ski trip
- **Dr. Yamamoto** - Weiss Suite, Dec 9-13, business traveler
`;

const GUEST_SERVICES_PROMPT = `You are a Guest Services Assistant for The 1898 Niseko, an ultra-luxury boutique hotel in Hokkaido, Japan. Your role is to help hotel staff manage guests, check arrivals, and handle service requests.

${HOTEL_INFO}

## Your Capabilities
You have access to real-time data about:
- Current in-house guests and their suite assignments
- Today's arrivals and departures
- Active service requests
- Guest profiles and preferences

## Available Tools
Use these tools to help staff:
- **get_context**: Fetch current guest data, arrivals, and requests
- **show_guest_card**: Display detailed guest information in a modal
- **show_request_card**: Display service request details
- **close_modal**: Close any open modal/card
- **filter_view**: Switch between Guests, Arrivals, or Requests tabs
- **send_message**: Send a message to a guest (SMS/email)
- **offer_pickup**: Offer airport pickup service (New Chitose Airport)
- **add_guest_note**: Add a note to a guest's profile
- **update_request_status**: Update service request status

## Behavior Guidelines
1. When asked about a specific guest, use show_guest_card to display their details
2. Reference suite names correctly (e.g., "Hirafu Penthouse", "Moiwa Suite")
3. Mention relevant amenities when discussing guest services
4. Keep responses concise and professional
5. Always use tools immediately without asking for confirmation

## Example Interactions
- "Did the Tanaka family arrive?" → show_guest_card for Tanaka, mention they're in the Hirafu Penthouse
- "Show me pending requests" → filter_view to requests tab
- "What suite is Dr. Yamamoto in?" → The Weiss Suite
- "Offer pickup to Mr. Chen" → offer_pickup for New Chitose Airport transfer`;

async function getAgent(agentId: string) {
  const response = await fetch(`${API_BASE}/convai/agents/${agentId}`, {
    headers: { 'xi-api-key': ELEVENLABS_API_KEY }
  });

  if (!response.ok) {
    throw new Error(`Failed to get agent ${agentId}: ${await response.text()}`);
  }

  return response.json();
}

async function updateAgentPrompt(agentId: string, newPrompt: string, agentName: string) {
  console.log(`\n🔧 Updating ${agentName}...`);

  const agent = await getAgent(agentId);

  // Update the prompt within conversation_config.agent.prompt.prompt
  const response = await fetch(`${API_BASE}/convai/agents/${agentId}`, {
    method: 'PATCH',
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      conversation_config: {
        agent: {
          prompt: {
            prompt: newPrompt,
            llm: agent.conversation_config?.agent?.prompt?.llm || 'gemini-2.0-flash',
            temperature: 0.0,
            tools: agent.conversation_config?.agent?.prompt?.tools || []
          }
        }
      }
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update ${agentName}: ${error}`);
  }

  console.log(`✅ ${agentName} updated with real hotel data`);
  return response.json();
}

async function main() {
  if (!ELEVENLABS_API_KEY) {
    console.error('❌ ELEVENLABS_API_KEY is required');
    process.exit(1);
  }

  console.log('🏨 Updating ElevenLabs agents with real The 1898 Niseko hotel data...\n');
  console.log('Hotel suites: Hirafu Penthouse, Hanazono Penthouse, Annupuri Duplex, Village Duplex, Moiwa Suite, Weiss Suite');

  try {
    // Update Guest Services agent
    await updateAgentPrompt(
      AGENTS.guestServices,
      GUEST_SERVICES_PROMPT,
      'Guest Services Agent'
    );

    console.log('\n✅ All agents updated successfully!');
    console.log('\n📝 Suite names now used:');
    console.log('   - Hirafu Penthouse (The Ultimate Mountain Residence)');
    console.log('   - Hanazono Penthouse (Panoramic Mountain Luxury)');
    console.log('   - Annupuri Duplex (Elevated Living)');
    console.log('   - Village Duplex (Contemporary Mountain Elegance)');
    console.log('   - Moiwa Suite (Intimate Sophistication)');
    console.log('   - Weiss Suite (Refined Simplicity)');

  } catch (error) {
    console.error('❌ Update failed:', error);
    process.exit(1);
  }
}

main();
