// Create ElevenLabs Tea Sales Agent
import * as fs from 'fs';
import * as path from 'path';

const ELEVENLABS_API_KEY = 'sk_2626951f5c9cebb6b387f8ace8acb1623a2cfbf46c538ef7';

const teaSalesPrompt = `You are Mei Lin, a tea sommelier and sales expert at Zen Leaf Tea House. You help customers discover and purchase premium specialty teas from around the world.

YOUR ROLE:
- Help customers explore our tea collection
- Answer questions about tea types, origins, flavors, and brewing
- Make personalized recommendations based on preferences
- Assist with ordering by adding teas to their cart
- Provide information about caffeine levels and health benefits

TEA COLLECTION (use get_context to see full details):

GREEN TEAS:
- Premium Sencha (sencha-001): $28/100g - Japanese green, grassy & umami, medium caffeine
- Ceremonial Matcha (matcha-001): $45/30g - Stone-ground, creamy & rich, high caffeine

OOLONG:
- Taiwan High Mountain (oolong-001): $35/75g - Ali Shan, floral & buttery, medium caffeine

SPECIALTY:
- Jasmine Dragon Pearls (jasmine-001): $38/50g - Hand-rolled pearls, jasmine aroma, medium caffeine

BLACK TEA:
- Classic Earl Grey (earlgrey-001): $22/100g - Ceylon with bergamot, bold & citrus, high caffeine

HERBAL (CAFFEINE FREE):
- Egyptian Chamomile (chamomile-001): $18/50g - Nile Delta flowers, sweet & relaxing

PERSONALITY:
- Warm, knowledgeable, and passionate about tea
- Share interesting facts about tea origins and traditions
- Listen to preferences and make thoughtful recommendations
- Speak naturally and conversationally
- Keep responses concise for voice

USING CLIENT TOOLS:

When customer asks about a specific tea:
- Use tea_show_product with the product ID to display details

When customer wants to add tea to cart:
- Use tea_add_to_cart with product ID and quantity
- Confirm what was added

When customer asks to see their cart:
- Use tea_show_cart to open the cart panel

When customer wants to filter by category:
- Use tea_filter_category with: green, black, oolong, herbal, specialty, or all

When customer is ready to complete order:
- Use tea_confirm_order to finalize

Always use get_context first if you need current cart status or product details.

EXAMPLE INTERACTIONS:

User: "What green teas do you have?"
You: "We have two beautiful green teas. Our Premium Sencha from Kyoto has a fresh, grassy flavor - perfect for daily enjoyment. And our Ceremonial Matcha is stone-ground for a rich, creamy experience. Would you like me to show you either one?"

User: "Add 2 of the sencha please"
You: [Use tea_add_to_cart with productId: sencha-001, quantity: 2] "I've added 2 bags of our Premium Sencha to your cart. That's $56 for 200 grams of wonderful Japanese green tea. Would you like to explore anything else?"

User: "Something without caffeine for evening?"
You: "Our Egyptian Chamomile is perfect for evenings. Whole flowers from the Nile Delta with sweet, honey notes. It's naturally caffeine-free and wonderfully relaxing. Shall I show you the details or add it to your cart?"`;

async function createTeaAgent() {
  console.log('🍵 Creating ElevenLabs Tea Sales Agent...\n');

  const agentConfig = {
    name: 'Zen Leaf Tea House - Tea Sommelier',
    conversation_config: {
      asr: {
        quality: 'high',
        provider: 'elevenlabs',
        user_input_audio_format: 'pcm_16000'
      },
      turn: {
        turn_timeout: 7.0,
        mode: 'turn',
        turn_eagerness: 'normal'
      },
      tts: {
        model_id: 'eleven_turbo_v2',
        voice_id: 'EXAVITQu4vr4xnSDxMaL', // Sarah - warm, friendly voice
        agent_output_audio_format: 'pcm_16000',
        optimize_streaming_latency: 3,
        stability: 0.5,
        speed: 1.0,
        similarity_boost: 0.8
      },
      conversation: {
        text_only: false,
        max_duration_seconds: 600
      },
      agent: {
        first_message: "Welcome to Zen Leaf Tea House! I'm Mei Lin, your tea sommelier. I'm here to help you discover our premium collection of specialty teas from Japan, Taiwan, China, and beyond. What kind of tea experience are you looking for today?",
        language: 'en',
        prompt: {
          prompt: teaSalesPrompt,
          llm: 'gemini-2.0-flash',
          temperature: 0.7,
          max_tokens: -1,
          tools: [
            {
              type: 'client',
              name: 'get_context',
              description: 'Get current context including product catalog, cart contents, and selected category. Always call this first to get accurate cart and product information.',
              parameters: {
                type: 'object',
                required: [],
                properties: {}
              },
              expects_response: true
            },
            {
              type: 'client',
              name: 'tea_show_product',
              description: 'Display detailed product information in a modal. Use when customer asks about a specific tea.',
              parameters: {
                type: 'object',
                required: ['productId'],
                properties: {
                  productId: {
                    type: 'string',
                    description: 'Product ID (e.g., sencha-001, matcha-001, oolong-001, jasmine-001, earlgrey-001, chamomile-001)'
                  }
                }
              },
              expects_response: false
            },
            {
              type: 'client',
              name: 'tea_add_to_cart',
              description: 'Add a tea product to the cart. Use when customer wants to buy a tea.',
              parameters: {
                type: 'object',
                required: ['productId'],
                properties: {
                  productId: {
                    type: 'string',
                    description: 'Product ID to add to cart'
                  },
                  quantity: {
                    type: 'number',
                    description: 'Quantity to add (default 1)'
                  }
                }
              },
              expects_response: false
            },
            {
              type: 'client',
              name: 'tea_show_cart',
              description: 'Open the shopping cart panel to show current items',
              parameters: {
                type: 'object',
                required: [],
                properties: {}
              },
              expects_response: false
            },
            {
              type: 'client',
              name: 'tea_filter_category',
              description: 'Filter products by category to help customer browse',
              parameters: {
                type: 'object',
                required: ['category'],
                properties: {
                  category: {
                    type: 'string',
                    description: 'Category: all, green, black, oolong, herbal, specialty'
                  }
                }
              },
              expects_response: false
            },
            {
              type: 'client',
              name: 'tea_confirm_order',
              description: 'Confirm and place the order when customer is ready to checkout',
              parameters: {
                type: 'object',
                required: [],
                properties: {}
              },
              expects_response: false
            },
            {
              type: 'client',
              name: 'show_modal',
              description: 'Display a general information modal',
              parameters: {
                type: 'object',
                required: ['title', 'message', 'type'],
                properties: {
                  title: { type: 'string', description: 'Modal title' },
                  message: { type: 'string', description: 'Modal message' },
                  type: { type: 'string', description: 'Modal type: success, error, info, warning' }
                }
              },
              expects_response: false
            },
            {
              type: 'client',
              name: 'end_call',
              description: 'End the call gracefully when conversation is complete',
              parameters: {
                type: 'object',
                required: [],
                properties: {}
              },
              expects_response: false
            }
          ]
        }
      }
    },
    platform_settings: {
      widget: {
        text_input_enabled: true,
        supports_text_only: true
      }
    }
  };

  console.log('📋 Creating agent...');

  const createResponse = await fetch('https://api.elevenlabs.io/v1/convai/agents/create', {
    method: 'POST',
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(agentConfig)
  });

  if (!createResponse.ok) {
    const error = await createResponse.text();
    throw new Error(`Failed to create agent (${createResponse.status}): ${error}`);
  }

  const agent = await createResponse.json();
  const agentId = agent.agent_id;

  console.log(`✅ Agent created: ${agentId}`);
  console.log(`   Name: Zen Leaf Tea House - Tea Sommelier\n`);

  // Update .env.local
  const envPath = path.join(process.cwd(), '.env.local');
  let envContent = fs.readFileSync(envPath, 'utf-8');

  const envVar = 'NEXT_PUBLIC_ELEVENLABS_TEA_AGENT_ID';
  if (envContent.includes(`${envVar}=`)) {
    envContent = envContent.replace(
      new RegExp(`${envVar}=.*`),
      `${envVar}=${agentId}`
    );
  } else {
    envContent += `\n${envVar}=${agentId}`;
  }

  fs.writeFileSync(envPath, envContent);

  console.log(`✅ Updated .env.local with ${envVar}=${agentId}`);
  console.log('\n🎉 Tea Sales Agent created!');
  console.log('\nNext steps:');
  console.log('1. Restart the app: pm2 restart ai-realtime-chat');
  console.log('2. Visit http://localhost:4024/experience');
  console.log('3. Click "Speak with Concierge" to start voice ordering');

  return { agentId };
}

createTeaAgent().catch((err) => {
  console.error('\n❌ Failed:', err.message);
  process.exit(1);
});
