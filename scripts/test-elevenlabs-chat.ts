// Test ElevenLabs agent via Simulate Conversation API (text-based, no voice needed)
const ELEVENLABS_API_KEY = 'sk_2626951f5c9cebb6b387f8ace8acb1623a2cfbf46c538ef7';
const ELEVENLABS_AGENT_ID = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || '';

async function testElevenLabsChat(userMessage: string) {
  if (!ELEVENLABS_AGENT_ID) {
    throw new Error('NEXT_PUBLIC_ELEVENLABS_AGENT_ID not set in .env.local');
  }

  console.log(`\n🧪 Testing ElevenLabs Simulate Conversation API with message: "${userMessage}"\n`);

  const response = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${ELEVENLABS_AGENT_ID}/simulate-conversation`, {
    method: 'POST',
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      simulation_specification: {
        simulated_user_config: {
          initial_message: userMessage
        }
      }
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ElevenLabs API error (${response.status}): ${error}`);
  }

  const data = await response.json();

  console.log('✅ ElevenLabs Simulate Conversation Response:');
  console.log(JSON.stringify(data, null, 2));

  // Extract conversation transcript
  if (data.simulated_conversation) {
    console.log('\n📝 Conversation Transcript:');
    data.simulated_conversation.forEach((turn: any, index: number) => {
      console.log(`\n${index + 1}. ${turn.role}: ${turn.message}`);
      if (turn.tool_calls) {
        console.log(`   Tool calls: ${JSON.stringify(turn.tool_calls, null, 2)}`);
      }
    });
  }

  return data;
}

// Get message from command line or use default
const testMessage = process.argv[2] || 'What integrations are available?';

testElevenLabsChat(testMessage)
  .then(() => {
    console.log('\n✅ Test completed successfully!');
    console.log('\nTip: You can pass a custom message:');
    console.log('  npx tsx scripts/test-elevenlabs-chat.ts "your custom message"');
  })
  .catch((err) => {
    console.error('\n❌ Test failed:', err.message);
    process.exit(1);
  });
