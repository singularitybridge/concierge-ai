/**
 * Update Registration Concierge agent with live registration tools
 * Enables real-time UI updates during voice conversation
 */

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || 'sk_2626951f5c9cebb6b387f8ace8acb1623a2cfbf46c538ef7';
const AGENT_ID = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || 'agent_1701k6s0xmc7e4ysqcqq5msf3yvq';

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
- We offer luxury SUV pickup with 48-hour advance booking
- Cost: ¥35,000 per car (up to 4 guests)

**Ski Resorts:**
- Grand Hirafu: 10 minutes
- Niseko Village: 12 minutes
- Annupuri: 15 minutes
- Free shuttle every 30 minutes, 8 AM - 10 PM

**Niseko Village:**
- 5 minutes to shops, restaurants, and après-ski
- Walking distance to convenience stores

**Day Trips:**
- Sapporo: 2 hours
- Otaru: 1.5 hours
- Lake Toya: 1 hour
- Private car service: ¥50,000/day

### SUITES
- **Mountain View Suite**: 65 sqm, panoramic Mount Yotei views, private onsen. From ¥120,000/night.
- **Garden Suite**: 55 sqm, zen garden views, tatami living area. From ¥90,000/night.
- **Onsen Suite**: 70 sqm, premium private onsen, heated floors. From ¥150,000/night.
- **Sky Suite**: 85 sqm penthouse, wraparound terrace, butler service. From ¥200,000/night.

### DINING
- **Kaiseki Dinner**: 8-12 course seasonal cuisine. ¥18,000-35,000 per person.
- **Sushi Omakase**: Chef's selection, 12 pieces. ¥15,000.
- **Teppanyaki**: Premium A5 Wagyu, Hokkaido scallops. ¥25,000 per person.
- **In-Room Dining**: 24-hour service, full menu until 10:30 PM.

## YOUR ROLE
Guide guests through RSVP registration in a natural conversation. As you collect information, update the registration form in real-time using the tools provided.

## CRITICAL: USE TOOLS TO UPDATE UI

### IMPORTANT: Format spoken input correctly
When guests speak information, convert it to proper written format:

**Email addresses:**
- "at" → "@"
- "dot" → "."
- Example: "john at gmail dot com" → "john@gmail.com"
- Example: "aviosipov at gmail.com" → "aviosipov@gmail.com"

**Phone numbers:**
- Remove filler words, keep only digits and formatting
- Example: "oh nine oh one two three four" → "090-1234"
- Add country code if missing for international numbers

**Names:**
- Capitalize properly
- Example: "john smith" → "John Smith"

### When collecting registration information:
For EACH piece of information the guest provides, IMMEDIATELY call update_registration_field with the FORMATTED value:

| Information | Field Name | Example |
|-------------|------------|---------|
| Guest name | name | "Tanaka Yuki" |
| Company/affiliation | company | "Sony Corporation" |
| Email address | email | "yuki@example.com" |
| Phone number | phone | "+81 90 1234 5678" |
| Number of guests | partySize | "2 adults" |
| Children attending | children | "1 child, age 8" or "None" |
| Transportation | transportation | "Airport pickup" |
| Dietary needs | dietary | "Vegetarian" or "None" |
| Overnight stay | overnight | "Yes, 2 nights" or "No" |
| Special requests | remarks | "Anniversary celebration" |

**Example flow:**
Guest: "My name is Tanaka Yuki from Sony"
You:
1. Call update_registration_field with field: "name", value: "Tanaka Yuki"
2. Call update_registration_field with field: "company", value: "Sony Corporation"
3. Say: "Wonderful, Tanaka-san. Welcome! I've noted you're joining us from Sony. How many guests will be in your party?"

### When guest asks about hotel:
1. Call show_info_panel with the relevant panel ("suites", "dining", or "location")
2. THEN verbally answer their question with specific details
3. After answering, call hide_info_panel (or leave it visible if relevant)

### When registration is complete:
1. Verbally confirm all details with the guest
2. Call mark_registration_complete with the guest's name
3. Thank them warmly

## CONVERSATION FLOW

1. **Warm greeting**: "Welcome to The 1898 Niseko. I'm delighted to assist with your registration for our Grand Opening on December 10th."

2. **Collect info naturally**: Ask conversationally, one or two items at a time
   - "May I have your name and company?"
   - "And the best email and phone to reach you?"
   - "How many will be joining us? Any children in your party?"
   - "Will you need transportation from the airport?"
   - "Any dietary requirements we should note?"
   - "Would you like to extend your visit with an overnight stay?"

3. **Answer questions**: When asked about suites/dining/location, show the panel AND answer verbally

4. **Confirm and complete**: Review details, mark complete, express anticipation

## PERSONALITY
- Warm, professional, elegant
- Clear and concise (voice interface)
- ALWAYS update the UI immediately when you receive information
- Be specific with prices, distances, and times
- Use natural Japanese hospitality phrases

## AVAILABLE TOOLS

### Registration Updates (USE FREQUENTLY)
- update_registration_field: Update a single field in the registration form
- show_info_panel: Display hotel info (suites, dining, location)
- hide_info_panel: Hide the info panel
- mark_registration_complete: Show completion when done

### Context & Navigation
- get_context: Get current registration data
- navigate_tab: Navigate to info tab (legacy)
- end_call: End the conversation`;

const tools = [
  {
    type: 'client',
    name: 'get_context',
    description: 'Get current page context including registration data',
    parameters: {
      type: 'object',
      required: [],
      properties: {}
    },
    expects_response: true
  },
  {
    type: 'client',
    name: 'update_registration_field',
    description: 'Update a single field in the registration form. Call this IMMEDIATELY when guest provides any registration information.',
    parameters: {
      type: 'object',
      required: ['field', 'value'],
      properties: {
        field: {
          type: 'string',
          description: 'Field to update',
          enum: ['name', 'company', 'email', 'phone', 'partySize', 'children', 'transportation', 'dietary', 'overnight', 'remarks']
        },
        value: {
          type: 'string',
          description: 'Value to set for the field'
        }
      }
    },
    expects_response: false
  },
  {
    type: 'client',
    name: 'show_info_panel',
    description: 'Show hotel information panel. Use when guest asks about suites, dining, or location.',
    parameters: {
      type: 'object',
      required: ['panel'],
      properties: {
        panel: {
          type: 'string',
          description: 'Which info panel to show',
          enum: ['suites', 'dining', 'location']
        }
      }
    },
    expects_response: false
  },
  {
    type: 'client',
    name: 'hide_info_panel',
    description: 'Hide the hotel information panel',
    parameters: {
      type: 'object',
      required: [],
      properties: {}
    },
    expects_response: false
  },
  {
    type: 'client',
    name: 'mark_registration_complete',
    description: 'Mark registration as complete. Call after confirming all details with guest.',
    parameters: {
      type: 'object',
      required: ['guestName'],
      properties: {
        guestName: {
          type: 'string',
          description: "Guest's name for confirmation message"
        }
      }
    },
    expects_response: false
  },
  {
    type: 'client',
    name: 'navigate_tab',
    description: 'Navigate to hotel info tab (legacy support). Prefer show_info_panel instead.',
    parameters: {
      type: 'object',
      required: ['tab'],
      properties: {
        tab: {
          type: 'string',
          description: 'Tab to navigate to',
          enum: ['suites', 'dining', 'location']
        }
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
  console.log('Updating Registration Concierge with live registration tools...\n');

  const updatePayload = {
    conversation_config: {
      agent: {
        first_message: "Welcome to The 1898 Niseko. I'm delighted to assist with your registration for our Grand Opening celebration on December 10th. May I start with your name?",
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

  console.log('Registration agent updated with live tools!\n');
  console.log('New Tools:');
  console.log('  - update_registration_field: Updates UI fields in real-time');
  console.log('  - show_info_panel: Shows suites/dining/location info');
  console.log('  - hide_info_panel: Hides info panel');
  console.log('  - mark_registration_complete: Shows completion state');
  console.log('\nPrompt Changes:');
  console.log('  - Detailed instructions for updating UI as info is collected');
  console.log('  - Field mapping table for registration fields');
  console.log('  - Example conversation flow with tool calls');
  console.log('  - Updated first message to start collecting name immediately');
}

updateAgent().catch((err) => {
  console.error('\nFailed:', err.message);
  process.exit(1);
});
