const ELEVENLABS_API_KEY = 'sk_2626951f5c9cebb6b387f8ace8acb1623a2cfbf46c538ef7';
const AGENT_ID = 'agent_1701k6s0xmc7e4ysqcqq5msf3yvq';

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

USING CLIENT TOOLS:
- After collecting ALL information, call show_registration_summary with the collected data
- When guest confirms details are correct, call registration_complete
- If guest asks about hotel amenities, dining, or location, call navigate_tab with the appropriate tab
- When guest says goodbye or is done, call end_call

IMPORTANT:
- Don't ask for information already provided
- Summarize at the end before confirming
- Be gracious and express anticipation for meeting them at the event`;

const firstMessage = "Welcome to The 1898 Niseko. I'm your registration concierge for our Grand Opening celebration on December 10th. I'll help you complete your RSVP — it will only take a few moments. May I begin with your name?";

async function updateElevenLabsAgent() {
  console.log('🏨 Updating ElevenLabs agent for hotel registration...\n');

  const response = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${AGENT_ID}`, {
    method: 'PATCH',
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: "The 1898 Niseko - Registration Concierge",
      conversation_config: {
        agent: {
          prompt: {
            prompt: systemPrompt
          },
          first_message: firstMessage,
          language: "en"
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
  console.log('✅ ElevenLabs agent updated successfully!\n');
  console.log('Agent ID:', result.agent_id);
  console.log('Name:', result.name);

  // Verify the update
  const verifyResponse = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${AGENT_ID}`, {
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY
    }
  });

  if (verifyResponse.ok) {
    const agent = await verifyResponse.json();
    console.log('\nVerified prompt (first 200 chars):', agent.conversation_config?.agent?.prompt?.prompt?.substring(0, 200) + '...');
    console.log('First message:', agent.conversation_config?.agent?.first_message);
  }
}

updateElevenLabsAgent().catch(console.error);
