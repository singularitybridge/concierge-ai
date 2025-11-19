const ELEVENLABS_API_KEY = 'sk_2626951f5c9cebb6b387f8ace8acb1623a2cfbf46c538ef7';
const AGENT_ID = 'agent_1701k6s0xmc7e4ysqcqq5msf3yvq';

const clientTools = [
  {
    type: "client",
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
  },
  {
    type: "client",
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
  },
  {
    type: "client",
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
  },
  {
    type: "client",
    name: "end_call",
    description: "End the call gracefully. Use when guest says goodbye or registration is complete.",
    parameters: {
      type: "object",
      properties: {}
    }
  }
];

async function setupElevenLabsTools() {
  console.log('🔧 Setting up ElevenLabs client tools for hotel registration...\n');

  const response = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${AGENT_ID}`, {
    method: 'PATCH',
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      conversation_config: {
        agent: {
          prompt: {
            tools: clientTools
          }
        }
      }
    })
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('❌ Failed to update ElevenLabs agent:', error);
    return;
  }

  const result = await response.json();
  console.log('✅ ElevenLabs client tools configured!\n');

  // Verify the update
  const verifyResponse = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${AGENT_ID}`, {
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY
    }
  });

  if (verifyResponse.ok) {
    const agent = await verifyResponse.json();
    const tools = agent.conversation_config?.agent?.prompt?.tools || [];
    console.log('Configured tools:', tools.map((t: any) => t.name).join(', '));
  }
}

setupElevenLabsTools().catch(console.error);
