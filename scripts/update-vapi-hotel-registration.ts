const VAPI_KEY = '59c0d5cc-d643-4b16-9607-224c8f570ae0';
const ASSISTANT_ID = '957955fc-dba8-4766-9132-4bcda7aad3b2';

const systemPrompt = `You are a refined AI concierge for The 1898 Niseko, an exclusive boutique hotel in Hokkaido, Japan. You are helping guests register for the Grand Opening celebration on Wednesday, December 10, 2025 at 4:00 PM.

PERSONALITY:
- Warm, professional, elegant
- Speak clearly and concisely (voice interface)
- Patient and accommodating
- Reflect the luxury of the property

YOUR GOAL:
Help guests complete their RSVP by collecting registration information through natural conversation.

REGISTRATION INFORMATION TO COLLECT:
1. Guest name
2. Company or affiliation
3. Email address
4. Phone number
5. Partners attending? (How many guests total?)
6. Children attending? (Ages if yes)
7. Transportation needs:
   - Airport pickup from New Chitose Airport?
   - Driving themselves (valet parking available)?
   - Other arrangements?
8. Dietary requirements or food allergies
9. Timing preferences:
   - Arriving on time at 4:00 PM?
   - Need to leave early? (What time?)
   - Arriving late? (What time?)
10. Interest in overnight accommodation?
11. Any special requests or remarks?

CONVERSATION FLOW:
- Collect information naturally, 1-2 items at a time
- Confirm details back to the guest
- Be flexible if information comes out of order
- Keep responses brief for voice

USING TOOLS:
- After collecting ALL information, call \`show_registration_summary\` with the collected data
- When guest confirms details are correct, call \`registration_complete\`
- If guest asks about hotel amenities, dining, or location, call \`navigate_tab\` with the appropriate tab
- When guest says goodbye or is done, call \`end_call\`

IMPORTANT:
- Don't ask for information already provided
- Summarize at the end before confirming
- Be gracious and express anticipation for meeting them at the event`;

const firstMessage = "Welcome to The 1898 Niseko. I'm your registration concierge for our Grand Opening celebration on December 10th. I'll help you complete your RSVP — it will only take a few moments. May I begin with your name?";

const tools = [
  {
    type: "function",
    async: true,
    function: {
      name: "show_registration_summary",
      description: "Display a summary of the collected registration information for the guest to review before confirming.",
      parameters: {
        type: "object",
        required: ["guestName"],
        properties: {
          guestName: {
            type: "string",
            description: "Guest's full name"
          },
          company: {
            type: "string",
            description: "Company or affiliation"
          },
          email: {
            type: "string",
            description: "Email address"
          },
          phone: {
            type: "string",
            description: "Phone number"
          },
          totalGuests: {
            type: "number",
            description: "Total number of guests including partners"
          },
          children: {
            type: "string",
            description: "Children attending (ages or 'none')"
          },
          transportation: {
            type: "string",
            description: "Transportation arrangements"
          },
          dietary: {
            type: "string",
            description: "Dietary requirements or allergies"
          },
          timing: {
            type: "string",
            description: "Arrival/departure timing"
          },
          overnight: {
            type: "boolean",
            description: "Interested in overnight accommodation"
          },
          remarks: {
            type: "string",
            description: "Special requests or remarks"
          }
        }
      }
    }
  },
  {
    type: "function",
    async: true,
    function: {
      name: "registration_complete",
      description: "Show success message that registration is complete. Call this after guest confirms their registration details.",
      parameters: {
        type: "object",
        required: ["guestName"],
        properties: {
          guestName: {
            type: "string",
            description: "Guest's name for the confirmation message"
          }
        }
      }
    }
  },
  {
    type: "function",
    async: true,
    function: {
      name: "navigate_tab",
      description: "Navigate to a different information tab when guest asks about hotel details.",
      parameters: {
        type: "object",
        required: ["tab"],
        properties: {
          tab: {
            type: "string",
            enum: ["suites", "dining", "location"],
            description: "The tab to navigate to"
          }
        }
      }
    }
  },
  {
    type: "function",
    async: true,
    function: {
      name: "end_call",
      description: "End the call gracefully. Use when guest says goodbye or registration is complete.",
      parameters: {
        type: "object",
        properties: {}
      }
    }
  }
];

async function updateVapiAssistant() {
  console.log('🏨 Updating VAPI assistant for hotel registration...\n');

  const response = await fetch(`https://api.vapi.ai/assistant/${ASSISTANT_ID}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${VAPI_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: "The 1898 Niseko - Registration Concierge",
      firstMessage,
      model: {
        provider: "openai",
        model: "gpt-4o-mini",
        temperature: 0.7,
        maxTokens: 300,
        messages: [
          {
            role: "system",
            content: systemPrompt
          }
        ],
        tools
      },
      voice: {
        provider: "deepgram",
        model: "aura-2",
        voiceId: "asteria"
      },
      endCallMessage: "Thank you for registering. We look forward to welcoming you to The 1898 Niseko on December 10th. Have a wonderful day.",
      silenceTimeoutSeconds: 30
    })
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('❌ Failed to update VAPI assistant:', error);
    return;
  }

  const result = await response.json();
  console.log('✅ VAPI assistant updated successfully!\n');
  console.log('Name:', result.name);
  console.log('First Message:', result.firstMessage);
  console.log('Tools:', result.model?.tools?.map((t: any) => t.function.name).join(', '));
}

updateVapiAssistant().catch(console.error);
