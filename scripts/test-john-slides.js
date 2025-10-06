// Test script for john agent slide management
// john automatically updates slides based on conversation context

const JOHN_API_URL = 'http://localhost:3000/assistant/68474f065d1be14ff68cd6ae/execute';
const JOHN_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NmQ0Y2MzMjg0NjEyMjMzNDEzYmViNzciLCJlbWFpbCI6ImF2aUBzaW5ndWxhcml0eWJyaWRnZS5uZXQiLCJjb21wYW55SWQiOiI2NmQ0MWFjMzQ4N2MxOWY2ZDRjMjNmYTEiLCJpYXQiOjE3NTk2NTg5MDIsImV4cCI6MTc2MDI2MzcwMn0.FCdXMSBPywWbqjMv9pQdor-6WCdkQ9Fk7VkV23M3myE';

async function sendToJohn(message) {
  console.log(`\n👤 User: ${message}`);

  const response = await fetch(JOHN_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${JOHN_API_KEY}`
    },
    body: JSON.stringify({ userInput: message })
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  console.log(`🤖 John: ${data.content || JSON.stringify(data)}`);

  return data;
}

async function testSlideManagement() {
  console.log('🎬 Testing john\'s slide management...\n');
  console.log('john will automatically update slides via HTTP API');
  console.log('The Next.js app polls /api/john-slide-update every 2 seconds\n');

  try {
    // Test 1: Welcome message (should stay on slide 0)
    await sendToJohn('Hello! I want to learn about integrations.');
    await sleep(1000);

    // Test 2: Ask about integrations (should move to slide 1)
    await sendToJohn('Can you show me what integrations are available?');
    await sleep(1000);

    // Test 3: Ask for technical details (should move to slide 2)
    await sendToJohn('Tell me more about the authentication process');
    await sleep(1000);

    // Test 4: Ask for code example (should move to slide 3)
    await sendToJohn('Show me a code example of how to authenticate');
    await sleep(1000);

    // Test 5: Ask about next steps (should move to slide 4)
    await sendToJohn('What should I do next to get started?');

    console.log('\n✅ Test complete! Check the Next.js app to see slide transitions.');
    console.log('📊 Current slide state: http://localhost:3002/api/john-slide-update?sessionId=default');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run tests
testSlideManagement().catch(console.error);
