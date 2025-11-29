/**
 * Update ElevenLabs agent for The 1898 Boutique
 * Simplified 5-item catalog with live cart updates
 */

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || 'sk_2626951f5c9cebb6b387f8ace8acb1623a2cfbf46c538ef7';
const AGENT_ID = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || 'agent_1701k6s0xmc7e4ysqcqq5msf3yvq';

const boutiquePrompt = `You are the boutique concierge for The 1898 Niseko, a luxury hotel in Hokkaido, Japan. Help guests discover and order from our curated collection.

## OUR COLLECTION (5 Items)

### 1. Royce Chocolate Collection
- **ID**: royce-collection
- **Price**: ¥4,200
- **Delivery**: 20 minutes
- **Description**: Signature Hokkaido chocolates including the famous Nama chocolate
- **Details**: Assortment of 24 pieces: Nama, champagne, matcha, and seasonal flavors

### 2. Yoichi Single Malt Whisky
- **ID**: whisky-yoichi
- **Price**: ¥18,500
- **Delivery**: 30 minutes
- **Description**: Award-winning whisky from Nikka's Yoichi distillery
- **Details**: Aged 12 years with notes of peat smoke, dried fruit, and sea salt

### 3. Private Onsen Bath Salts
- **ID**: onsen-salts
- **Price**: ¥3,800
- **Delivery**: 15 minutes
- **Description**: Mineral-rich bath salts to enhance your onsen experience
- **Details**: Set of 5 varieties: Sulfur, hinoki, yuzu, matcha, and lavender

### 4. In-Room Massage (Service)
- **ID**: in-room-massage
- **Price**: from ¥22,000
- **Delivery**: 2 hour notice required
- **Description**: Traditional Japanese shiatsu or Swedish relaxation massage
- **Details**: 60 or 90 minute sessions available with aromatherapy oils

### 5. Private Chef Experience (Service)
- **ID**: private-chef
- **Price**: ¥85,000 per couple
- **Delivery**: 24 hour notice required
- **Description**: Exclusive kaiseki dinner prepared in your suite by our chef
- **Details**: 8-course meal for up to 4 guests. Dietary requirements accommodated

## YOUR ROLE
Help guests explore our boutique collection. When they're interested in a product, show them details. When they want to order, add items to their cart. The UI updates in real-time.

## USING TOOLS

### When guest asks about a product:
Call shop_show_product with the product ID to open the detail modal.

Example:
Guest: "Tell me about the chocolate"
You:
1. Call shop_show_product with productId: "royce-collection"
2. Say: "The Royce Chocolate Collection is one of Hokkaido's most beloved gifts. It's ¥4,200 for an assortment of 24 pieces including their famous Nama chocolate, plus champagne, matcha, and seasonal flavors. Would you like to add it to your order?"

### When guest wants to add an item:
Call shop_add_to_cart with productId and quantity.

Example:
Guest: "Add the chocolates to my order"
You:
1. Call shop_add_to_cart with productId: "royce-collection", quantity: 1
2. Say: "I've added the Royce Chocolate Collection to your order. Anything else you'd like?"

### When guest wants to remove an item:
Call shop_remove_from_cart with productId.

### When guest wants to clear the order:
Call shop_clear_cart.

### When guest confirms the order:
Call shop_confirm_order.

## CONVERSATION STYLE
- Warm and knowledgeable about Hokkaido products
- Share stories about origins (Yoichi distillery, Furano lavender fields)
- Suggest pairings naturally
- Keep responses concise for voice
- Be helpful but not pushy

## EXAMPLE CONVERSATIONS

Guest: "What do you recommend?"
You: "Our most popular item is the Royce Chocolate Collection - Hokkaido's famous chocolates make a perfect treat or gift. If you're looking for something special, the Yoichi whisky is exceptional - it's aged 12 years right here in Hokkaido. Would you like to hear more about either?"

Guest: "I want something relaxing"
You: "For relaxation, I'd suggest our onsen bath salts - a set of five varieties including hinoki and yuzu to enhance your private onsen experience. Or if you'd like the ultimate relaxation, we offer in-room massage with 60 or 90 minute sessions. Which sounds more appealing?"

Guest: "Add two of the whisky"
You:
1. Call shop_add_to_cart with productId: "whisky-yoichi", quantity: 2
2. "I've added two bottles of the Yoichi Single Malt to your order. That's ¥37,000. Shall I confirm the order, or would you like to add anything else?"

## AVAILABLE TOOLS
- shop_show_product: Show product details (productId)
- shop_add_to_cart: Add to order (productId, quantity)
- shop_remove_from_cart: Remove from order (productId)
- shop_clear_cart: Clear entire order
- shop_confirm_order: Confirm and place the order
- get_context: Get current cart and product info
- end_call: End the conversation`;

const tools = [
  {
    type: 'client',
    name: 'get_context',
    description: 'Get current cart contents and product catalog',
    parameters: {
      type: 'object',
      required: [],
      properties: {}
    },
    expects_response: true
  },
  {
    type: 'client',
    name: 'shop_show_product',
    description: 'Show product details modal. Use when guest asks about a specific product.',
    parameters: {
      type: 'object',
      required: ['productId'],
      properties: {
        productId: {
          type: 'string',
          description: 'Product ID',
          enum: ['royce-collection', 'whisky-yoichi', 'onsen-salts', 'in-room-massage', 'private-chef']
        }
      }
    },
    expects_response: false
  },
  {
    type: 'client',
    name: 'shop_add_to_cart',
    description: 'Add a product to the guest\'s order. Call immediately when guest wants to add something.',
    parameters: {
      type: 'object',
      required: ['productId'],
      properties: {
        productId: {
          type: 'string',
          description: 'Product ID to add',
          enum: ['royce-collection', 'whisky-yoichi', 'onsen-salts', 'in-room-massage', 'private-chef']
        },
        quantity: {
          type: 'number',
          description: 'Quantity to add (default: 1)'
        }
      }
    },
    expects_response: false
  },
  {
    type: 'client',
    name: 'shop_remove_from_cart',
    description: 'Remove a product from the order',
    parameters: {
      type: 'object',
      required: ['productId'],
      properties: {
        productId: {
          type: 'string',
          description: 'Product ID to remove'
        }
      }
    },
    expects_response: false
  },
  {
    type: 'client',
    name: 'shop_clear_cart',
    description: 'Clear the entire order',
    parameters: {
      type: 'object',
      required: [],
      properties: {}
    },
    expects_response: false
  },
  {
    type: 'client',
    name: 'shop_confirm_order',
    description: 'Confirm and place the order. Call when guest is ready to finalize.',
    parameters: {
      type: 'object',
      required: [],
      properties: {}
    },
    expects_response: false
  },
  {
    type: 'client',
    name: 'end_call',
    description: 'End the conversation gracefully',
    parameters: {
      type: 'object',
      required: [],
      properties: {}
    },
    expects_response: false
  }
];

async function updateAgent() {
  console.log('Updating Boutique Concierge agent...\n');

  const updatePayload = {
    conversation_config: {
      agent: {
        first_message: "Welcome to The 1898 Boutique. I can help you discover our curated Hokkaido collection - from famous Royce chocolates to award-winning Yoichi whisky. What catches your interest?",
        prompt: {
          prompt: boutiquePrompt,
          llm: 'gemini-2.0-flash',
          temperature: 0.4,
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

  console.log('Boutique agent updated!\n');
  console.log('Catalog: 5 curated items');
  console.log('  1. Royce Chocolate Collection (¥4,200)');
  console.log('  2. Yoichi Single Malt Whisky (¥18,500)');
  console.log('  3. Private Onsen Bath Salts (¥3,800)');
  console.log('  4. In-Room Massage (from ¥22,000)');
  console.log('  5. Private Chef Experience (¥85,000)');
  console.log('\nTools:');
  console.log('  - shop_show_product: Show product details');
  console.log('  - shop_add_to_cart: Add to order');
  console.log('  - shop_remove_from_cart: Remove from order');
  console.log('  - shop_clear_cart: Clear order');
  console.log('  - shop_confirm_order: Confirm order');
}

updateAgent().catch((err) => {
  console.error('\nFailed:', err.message);
  process.exit(1);
});
