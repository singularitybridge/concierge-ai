// Fix Registration Concierge agent to answer questions with hotel info

const ELEVENLABS_API_KEY = 'sk_2626951f5c9cebb6b387f8ace8acb1623a2cfbf46c538ef7';
const AGENT_ID = 'agent_1701k6s0xmc7e4ysqcqq5msf3yvq';

const updatedPrompt = `You are a refined AI concierge for The 1898 Niseko, an exclusive boutique hotel in Hokkaido, Japan. You are helping guests register for the Grand Opening celebration.

## EVENT DETAILS
- Event: Grand Opening Celebration
- Date: Wednesday, December 10, 2025
- Time: 4:00 PM
- Location: The 1898 Niseko, Hokkaido

## HOTEL INFORMATION

### LOCATION & TRANSPORTATION
**From New Chitose Airport:**
- Distance: 110 km, approximately 2.5 hours by car
- We offer complimentary luxury SUV pickup with 48-hour advance booking
- Cost: ¥35,000 per car (up to 4 guests)

**Ski Resorts:**
- Grand Hirafu (largest area): 10 minutes
- Niseko Village: 12 minutes
- Annupuri: 15 minutes
- Free shuttle every 30 minutes, 8 AM - 10 PM

**Niseko Village:**
- 5 minutes to shops, restaurants, and après-ski
- Walking distance to convenience stores
- Our concierge can arrange restaurant reservations

**Day Trips:**
- Sapporo: 2 hours
- Otaru (canal district, sushi): 1.5 hours
- Lake Toya: 1 hour
- Private car service available: ¥50,000/day

### SUITES
- **Mountain View Suite**: 65 sqm, panoramic Mount Yotei views, king bed, private indoor/outdoor onsen. From ¥120,000/night.
- **Garden Suite**: 55 sqm, zen garden views, queen bed, tatami living area. From ¥90,000/night.
- **Onsen Suite**: 70 sqm, premium private onsen, king bed, heated floors. From ¥150,000/night.
- **Sky Suite**: 85 sqm penthouse, wraparound terrace, fireplace, butler service. From ¥200,000/night.

### DINING
- **Kaiseki Dinner**: 8-12 course seasonal Japanese haute cuisine. ¥18,000-35,000 per person.
- **Sushi Omakase**: Chef's selection, 12-piece omakase ¥15,000.
- **Teppanyaki**: Premium A5 Wagyu, Hokkaido scallops. ¥25,000 per person.
- **In-Room Dining**: 24-hour service, full menu until 10:30 PM.

## YOUR ROLE
Help guests complete their RSVP while answering any questions about the hotel, event, or services.

## WHEN GUESTS ASK QUESTIONS
**IMPORTANT**: When a guest asks about transportation, suites, dining, or location:
1. First, call navigate_tab to show them the relevant information on screen
2. Then IMMEDIATELY answer their question using the information above
3. Be specific with distances, prices, and times

Example - Guest asks "How do I get there from the airport?":
1. Call navigate_tab with tab: "location"
2. Say: "From New Chitose Airport, it's about 110 kilometers, roughly a 2.5 hour drive. We offer complimentary luxury SUV pickup if you book 48 hours ahead - it's ¥35,000 for up to 4 guests. Would you like me to arrange airport pickup for you?"

## REGISTRATION INFORMATION TO COLLECT
1. Guest name
2. Company or affiliation
3. Email address
4. Phone number
5. Number of guests attending
6. Children attending? (Ages if yes)
7. Transportation needs (airport pickup, driving, other)
8. Dietary requirements
9. Interest in overnight accommodation?
10. Any special requests?

## PERSONALITY
- Warm, professional, elegant
- Speak clearly and concisely (voice interface)
- ALWAYS answer questions directly - don't just offer to show information
- Be helpful and knowledgeable about the hotel

## USING CLIENT TOOLS
- navigate_tab: Show hotel info tab AND answer the question
- show_registration_summary: After collecting ALL information
- registration_complete: When guest confirms registration
- end_call: When conversation is complete`;

const tools = [
  {
    type: 'client',
    name: 'get_context',
    description: 'Get current page context and cart data',
    parameters: {
      type: 'object',
      required: [],
      properties: {}
    },
    expects_response: true
  },
  {
    type: 'client',
    name: 'show_registration_summary',
    description: 'Display registration summary for guest to review',
    parameters: {
      type: 'object',
      required: ['guestName'],
      properties: {
        guestName: { type: 'string', description: "Guest's full name" },
        company: { type: 'string', description: 'Company or affiliation' },
        email: { type: 'string', description: 'Email address' },
        phone: { type: 'string', description: 'Phone number' },
        totalGuests: { type: 'number', description: 'Total number of guests' },
        children: { type: 'string', description: "Children attending (ages or 'none')" },
        transportation: { type: 'string', description: 'Transportation arrangements' },
        dietary: { type: 'string', description: 'Dietary requirements' },
        timing: { type: 'string', description: 'Arrival/departure timing' },
        overnight: { type: 'boolean', description: 'Interested in overnight stay' },
        remarks: { type: 'string', description: 'Special requests' }
      }
    },
    expects_response: false
  },
  {
    type: 'client',
    name: 'registration_complete',
    description: 'Show success message when registration is confirmed',
    parameters: {
      type: 'object',
      required: ['guestName'],
      properties: {
        guestName: { type: 'string', description: "Guest's name for confirmation" }
      }
    },
    expects_response: false
  },
  {
    type: 'client',
    name: 'navigate_tab',
    description: 'Navigate to hotel info tab to show details on screen. ALWAYS follow this by verbally answering the guest question.',
    parameters: {
      type: 'object',
      required: ['tab'],
      properties: {
        tab: { type: 'string', description: 'Tab to navigate to', enum: ['suites', 'dining', 'location'] }
      }
    },
    expects_response: false
  },
  {
    type: 'client',
    name: 'end_call',
    description: 'End the call gracefully',
    parameters: {
      type: 'object',
      required: [],
      properties: {}
    },
    expects_response: false
  }
];

async function updateAgent() {
  console.log('🔄 Fixing Registration Concierge agent prompt...\n');

  const updatePayload = {
    conversation_config: {
      agent: {
        first_message: "Welcome to The 1898 Niseko. I'm your concierge for our Grand Opening celebration on December 10th. How may I assist you today?",
        prompt: {
          prompt: updatedPrompt,
          llm: 'gemini-2.0-flash',
          temperature: 0.3,
          tools
        }
      }
    }
  };

  const response = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${AGENT_ID}`, {
    method: 'PATCH',
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updatePayload)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update agent (${response.status}): ${error}`);
  }

  console.log('✅ Registration agent prompt fixed!');
  console.log('\nChanges:');
  console.log('- Added full hotel information (location, suites, dining) to prompt');
  console.log('- Instructed agent to ANSWER questions after showing tabs');
  console.log('- Added example of proper response flow');
  console.log('- Increased temperature slightly for more natural responses');
}

updateAgent().catch((err) => {
  console.error('\n❌ Failed:', err.message);
  process.exit(1);
});
