import axios from 'axios';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || 'sk_f9556323e6be0cac1aa1af8992aa4ae9a2275b2e2f0c0165';
const AGENT_ID = 'agent_8401kb684w18f71961rjgr6c3d6f';

// New Japanese menu item IDs
const japaneseMenuIds = [
  // Chef's Signature
  'kaiseki-omakase',
  'snow-crab-course',
  'wagyu-a5-tasting',
  'uni-trio',
  // Sashimi & Sushi
  'otoro-sashimi',
  'hokkaido-sashimi-mori',
  'ikura-don',
  'sushi-omakase',
  // Hokkaido Specialties
  'jingisukan',
  'yubari-melon',
  'hokkaido-scallops',
  'soup-curry',
  // Wagyu & Grills
  'wagyu-sirloin',
  'wagyu-yakiniku',
  'robata-seafood',
  // Hot Pots
  'shabu-shabu',
  'sukiyaki',
  'crab-nabe',
  // Tempura
  'tempura-mori',
  'ebi-tempura',
  'vegetable-tempura',
  // Rice & Noodles
  'sapporo-ramen',
  'unagi-don',
  'chirashi-don',
  'soba-cold',
  // Desserts
  'matcha-parfait',
  'hokkaido-milk-soft',
  'mochi-ice-cream',
  'dorayaki',
];

const clientTools = [
  {
    type: 'client',
    name: 'shop_show_product',
    description: 'Show detailed information about a menu item. Use when guest asks to see or learn more about a dish.',
    expects_response: false,
    parameters: {
      type: 'object',
      required: ['productId'],
      properties: {
        productId: {
          type: 'string',
          description: 'Menu item ID (e.g., kaiseki-omakase, otoro-sashimi, shabu-shabu)',
          enum: japaneseMenuIds,
        },
      },
    },
  },
  {
    type: 'client',
    name: 'shop_add_to_cart',
    description: "Add a dish to the guest's order. Call immediately when guest wants to add something.",
    expects_response: false,
    parameters: {
      type: 'object',
      required: ['productId'],
      properties: {
        productId: {
          type: 'string',
          description: 'Menu item ID to add (e.g., kaiseki-omakase, wagyu-sirloin, sapporo-ramen)',
          enum: japaneseMenuIds,
        },
        quantity: {
          type: 'number',
          description: 'Quantity to add (default: 1)',
        },
      },
    },
  },
  {
    type: 'client',
    name: 'shop_filter_category',
    description: 'Filter the menu display by category. Use when guest asks to see a specific type of food.',
    expects_response: false,
    parameters: {
      type: 'object',
      required: ['category'],
      properties: {
        category: {
          type: 'string',
          description: 'Category to filter by',
          enum: ['all', 'signature', 'sashimi', 'hokkaido', 'wagyu', 'nabe', 'tempura', 'rice-noodles', 'desserts'],
        },
      },
    },
  },
  {
    type: 'client',
    name: 'shop_confirm_order',
    description: 'Confirm and place the order. Call when guest is ready to finalize their order.',
    expects_response: false,
    parameters: {
      type: 'object',
      required: [],
      properties: {},
    },
  },
  {
    type: 'client',
    name: 'shop_remove_from_cart',
    description: 'Remove a dish from the order',
    expects_response: false,
    parameters: {
      type: 'object',
      required: ['productId'],
      properties: {
        productId: {
          type: 'string',
          description: 'Menu item ID to remove',
        },
      },
    },
  },
  {
    type: 'client',
    name: 'shop_clear_cart',
    description: 'Clear the entire order',
    expects_response: false,
    parameters: {
      type: 'object',
      required: [],
      properties: {},
    },
  },
  {
    type: 'client',
    name: 'get_context',
    description: 'Get current cart contents, time of day, and available menu items. Call this to see what the guest has ordered so far.',
    expects_response: true,
    parameters: {
      type: 'object',
      required: [],
      properties: {},
    },
  },
  {
    type: 'client',
    name: 'end_call',
    description: 'End the conversation gracefully',
    expects_response: false,
    parameters: {
      type: 'object',
      required: [],
      properties: {},
    },
  },
];

async function updateAgentTools() {
  try {
    // Get current agent config to preserve the prompt
    const getResponse = await axios.get(
      `https://api.elevenlabs.io/v1/convai/agents/${AGENT_ID}`,
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
        },
      }
    );

    const currentPrompt = getResponse.data.conversation_config?.agent?.prompt?.prompt || '';
    console.log('Current prompt length:', currentPrompt.length);

    // Update the agent with new tools
    const response = await axios.patch(
      `https://api.elevenlabs.io/v1/convai/agents/${AGENT_ID}`,
      {
        conversation_config: {
          agent: {
            prompt: {
              prompt: currentPrompt,
              tools: clientTools,
            },
          },
        },
      },
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Agent tools updated successfully!');
    console.log('Tools count:', response.data.conversation_config?.agent?.prompt?.tools?.length);

    // Verify by listing tool names
    const tools = response.data.conversation_config?.agent?.prompt?.tools || [];
    console.log('Tool names:', tools.map((t: { name: string }) => t.name).join(', '));
  } catch (error: any) {
    console.error('Error updating agent tools:', error.response?.data || error.message);
  }
}

updateAgentTools();
