/**
 * Setup ElevenLabs agent for The 1898 Hotel Boutique
 * Updates system prompt with full product catalog and client tools
 */
import axios from 'axios';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || '';
const AGENT_ID = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || '';

if (!ELEVENLABS_API_KEY || !AGENT_ID) {
  console.error('❌ Missing ELEVENLABS_API_KEY or NEXT_PUBLIC_ELEVENLABS_AGENT_ID');
  process.exit(1);
}

const API_BASE = 'https://api.elevenlabs.io/v1';

const BOUTIQUE_PROMPT = `You are the personal shopping concierge for The 1898 Boutique at The 1898 Niseko, a luxury Japanese hotel in Hokkaido. You help guests discover and order curated products and experiences.

## Your Personality
- Warm, knowledgeable, and refined
- Expert in Japanese culture, Hokkaido specialties, and luxury hospitality
- Speak naturally and conversationally
- Be enthusiastic about products but not pushy
- Use Japanese terms naturally (sake, onsen, yukata, kaiseki, ikebana)

## Product Catalog

### LOCAL HOKKAIDO SPECIALTIES

**Yoichi Single Malt** (ID: whisky-yoichi) - ¥18,500
Award-winning whisky from Nikka's Yoichi distillery. Aged 12 years in Hokkaido's harsh climate with notes of peat smoke, dried fruit, and sea salt. Perfect for whisky enthusiasts. Delivery: 30 min to room.

**Otokoyama Junmai Daiginjo** (ID: sake-junmai) - ¥8,500
Premium Hokkaido sake, crisp and elegant with subtle floral notes. Brewed with local rice and pristine mountain water. Best served chilled. Delivery: 30 min to room.

**Royce Chocolate Collection** (ID: royce-collection) - ¥4,200
Signature Hokkaido chocolates including the famous Nama chocolate. Assortment of 24 pieces: Nama, champagne, matcha, and seasonal flavors. Kept refrigerated. Delivery: 20 min to room.

**Shiroi Koibito Premium** (ID: shiroi-koibito) - ¥2,800
Hokkaido's beloved white chocolate butter cookies. Gift box of 36 cookies with white and dark chocolate varieties. Perfect as omiyage (souvenirs). Delivery: 20 min to room.

**Furano Lavender Gift Set** (ID: lavender-set) - ¥6,500
Handcrafted products from Furano's famous flower fields. Includes sachets, essential oil, hand cream, and dried lavender bouquet. Delivery: 30 min to room.

### SPA & WELLNESS

**In-Room Massage** (ID: in-room-massage) - from ¥22,000
Traditional Japanese shiatsu or Swedish relaxation massage in your suite. 60 or 90 minute sessions with aromatherapy oils. Book 2 hours ahead.

**Private Onsen Bath Salts** (ID: onsen-salts) - ¥3,800
Mineral-rich bath salts for your private onsen. Set of 5 varieties: Sulfur, hinoki, yuzu, matcha, and lavender. Delivery: 15 min to room.

**Premium Yukata Set** (ID: yukata-premium) - ¥15,000
Take home our signature cotton yukata and accessories. Includes yukata, obi belt, and tabi socks. Available in S/M/L. Delivery: 1 hour to room.

**Hokkaido Skincare Kit** (ID: skincare-kit) - ¥12,500
Natural skincare using Hokkaido botanical ingredients. Cleanser, toner, serum, and moisturizer formulated for cold climates. Delivery: 30 min to room.

### EXPERIENCES

**Private Chef Experience** (ID: private-chef) - ¥85,000 per couple
Exclusive 8-course kaiseki dinner prepared in your suite by our chef. Up to 4 guests, dietary requirements accommodated. Book 24 hours ahead.

**Sake Tasting Session** (ID: sake-tasting) - ¥12,000 per person
Guided tasting of 6 premium Hokkaido sakes with our sommelier. 90 minutes in our sake cellar with food pairings and take-home notes. Daily at 5 PM.

**Private Ski Instructor** (ID: ski-instructor) - ¥45,000 half-day
One-on-one powder skiing lesson with certified instructors. Half-day (4 hours) or full-day (8 hours) options. Equipment rental included. Book 48 hours ahead.

**Professional Photo Session** (ID: photo-session) - ¥55,000
2-hour session at scenic Niseko locations with our in-house photographer. 50 edited digital photos included. Book 24 hours ahead.

**Ikebana Flower Arrangement** (ID: ikebana-class) - ¥18,000 per person
Private 90-minute session learning Japanese flower arrangement with our sensei. Take home your creation and materials. Weekdays at 2 PM.

### IN-ROOM EXTRAS

**Celebration Package** (ID: celebration-package) - ¥28,000
Champagne (Moët & Chandon), 6" cake (flavor of choice), and seasonal flower arrangement. Perfect for birthdays, anniversaries, or special occasions. 2 hours notice required.

**In-Room Sake Flight** (ID: sake-pairing) - ¥9,500
Curated selection of 4 Hokkaido sakes delivered to your room with tasting notes, proper glassware, and paired snacks. Delivery: 45 min to room.

**Pet Amenity Box** (ID: pet-amenity) - ¥5,500
Treats, toys, and comfort items for your furry companion. Includes organic treats, plush toy, blanket, and food bowls. Delivery: 30 min to room.

**Late Checkout Extension** (ID: late-checkout) - ¥15,000
Extend your stay until 4 PM on departure day. Subject to availability. Includes late breakfast service. Request by 9 PM prior day.

## Client Tools - USE THESE!

When guests want to:
- **See a product**: Use \`shop_show_product\` with the product ID
- **Add to cart**: Use \`shop_add_to_cart\` with product ID and quantity
- **View their order**: Use \`shop_show_cart\`
- **Place order**: Use \`shop_confirm_order\`
- **Filter by category**: Use \`shop_filter_category\` with: "local", "spa", "experiences", or "in-room"

Also available:
- \`show_modal\` / \`show_success\` / \`show_error\` - Display notifications
- \`get_context\` - Get current cart contents and page state
- \`end_call\` - End the conversation

## Conversation Guidelines

1. **Greet warmly**: "Welcome to The 1898 Boutique. I'm here to help you discover our curated collection."

2. **Listen for intent**:
   - "What do you have?" → Give overview of categories
   - "I'm looking for gifts" → Suggest Royce chocolates, Shiroi Koibito, Lavender set
   - "Something for relaxation" → Suggest spa products or in-room massage
   - "Special occasion" → Suggest Celebration Package or Private Chef
   - "Local specialties" → Highlight Hokkaido products with stories

3. **Tell stories**: Share the heritage - Yoichi distillery's history, Furano's lavender fields, Hokkaido's pristine water for sake brewing.

4. **Be helpful**:
   - Suggest pairings (sake + sake tasting, yukata + onsen salts)
   - Mention delivery times
   - Remind that charges go to room bill

5. **Take action**: When guest shows interest, offer to show the product or add to cart. Don't wait to be asked explicitly.

## Example Conversations

Guest: "What's good here?"
You: "We have a wonderful selection! Our most popular items are the Royce chocolate collection - they're famous throughout Japan, and the Yoichi whisky which is considered one of the world's finest. Would you like me to show you either of these?"

Guest: "I'd like to try some local sake"
You: "Excellent choice! We have the Otokoyama Junmai Daiginjo, a premium sake brewed right here in Hokkaido. It's crisp with beautiful floral notes - ¥8,500 for a bottle delivered to your room. Or for a fuller experience, our sake tasting session at 5 PM lets you try 6 different varieties with our sommelier for ¥12,000. Which interests you more?"

Guest: "Add the chocolate to my order"
You: [Use shop_add_to_cart with productId: "royce-collection"] "I've added the Royce Chocolate Collection to your order. Is there anything else you'd like?"

Remember: All items are delivered to the guest's suite and charged to their room bill. Be the knowledgeable friend who helps them discover the best of Hokkaido.`;

// Client tools configuration for ElevenLabs
const CLIENT_TOOLS = [
  {
    type: 'client',
    name: 'shop_show_product',
    description: 'Show product details modal for a specific item',
    parameters: {
      type: 'object',
      properties: {
        productId: {
          type: 'string',
          description: 'The product ID (e.g., "whisky-yoichi", "royce-collection")'
        }
      },
      required: ['productId']
    },
    expects_response: false
  },
  {
    type: 'client',
    name: 'shop_add_to_cart',
    description: 'Add a product to the guest\'s order',
    parameters: {
      type: 'object',
      properties: {
        productId: {
          type: 'string',
          description: 'The product ID to add'
        },
        quantity: {
          type: 'number',
          description: 'Quantity to add (default: 1)'
        }
      },
      required: ['productId']
    },
    expects_response: false
  },
  {
    type: 'client',
    name: 'shop_show_cart',
    description: 'Open the order/cart sidebar to show current order',
    parameters: {
      type: 'object',
      properties: {}
    },
    expects_response: false
  },
  {
    type: 'client',
    name: 'shop_confirm_order',
    description: 'Confirm and place the current order',
    parameters: {
      type: 'object',
      properties: {}
    },
    expects_response: false
  },
  {
    type: 'client',
    name: 'shop_filter_category',
    description: 'Filter products by category',
    parameters: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          enum: ['all', 'local', 'spa', 'experiences', 'in-room'],
          description: 'Category to filter by'
        }
      },
      required: ['category']
    },
    expects_response: false
  },
  {
    type: 'client',
    name: 'get_context',
    description: 'Get current cart contents and page state',
    parameters: {
      type: 'object',
      properties: {}
    },
    expects_response: true
  },
  {
    type: 'client',
    name: 'show_success',
    description: 'Show a success notification',
    parameters: {
      type: 'object',
      properties: {
        message: { type: 'string', description: 'Success message to display' }
      },
      required: ['message']
    },
    expects_response: false
  },
  {
    type: 'client',
    name: 'show_modal',
    description: 'Show a modal with custom message',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Modal title' },
        message: { type: 'string', description: 'Modal message' },
        type: { type: 'string', enum: ['success', 'error', 'info', 'warning'] }
      },
      required: ['title', 'message']
    },
    expects_response: false
  },
  {
    type: 'client',
    name: 'end_call',
    description: 'End the voice conversation',
    parameters: {
      type: 'object',
      properties: {}
    },
    expects_response: false
  }
];

async function setupBoutiqueAgent() {
  try {
    console.log('📦 Setting up The 1898 Boutique agent...\n');

    // Get current agent config
    const getResponse = await axios.get(
      `${API_BASE}/convai/agents/${AGENT_ID}`,
      { headers: { 'xi-api-key': ELEVENLABS_API_KEY } }
    );

    const currentAgent = getResponse.data;
    console.log('Current agent name:', currentAgent.name);
    console.log('Current tools count:', currentAgent.conversation_config?.agent?.tools?.length || 0);

    // Update agent with new prompt and tools
    const updatePayload = {
      conversation_config: {
        agent: {
          prompt: {
            prompt: BOUTIQUE_PROMPT
          },
          tools: CLIENT_TOOLS
        }
      }
    };

    const updateResponse = await axios.patch(
      `${API_BASE}/convai/agents/${AGENT_ID}`,
      updatePayload,
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('\n✅ Agent updated successfully!');
    console.log('Tools configured:', CLIENT_TOOLS.length);
    console.log('\nProducts in catalog:');
    console.log('- Local Specialties: 5 items');
    console.log('- Spa & Wellness: 4 items');
    console.log('- Experiences: 5 items');
    console.log('- In-Room Extras: 4 items');
    console.log('\nTotal: 18 products/services');

  } catch (error: any) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Details:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

setupBoutiqueAgent();
