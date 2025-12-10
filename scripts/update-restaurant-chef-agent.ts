import axios from 'axios';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || 'sk_f9556323e6be0cac1aa1af8992aa4ae9a2275b2e2f0c0165';
const AGENT_ID = 'agent_8401kb684w18f71961rjgr6c3d6f'; // Boutique agent, now used for restaurant

// All menu item IDs from menu-data.ts
const menuItemIds = [
  // Signature Dishes
  'spicy-chicken-pot',
  'spicy-numbing-seafood-hotpot',
  'sichuan-boiled-wagyu-beef',
  'pickled-cabbage-fish',
  'boiling-fish-in-spicy-broth',
  // Appetizers
  'soy-braised-beef',
  'cold-chicken-in-chili-oil',
  'pork-ear-in-chili-oil',
  'smashed-cucumber-with-garlic',
  'mouthwatering-chicken',
  // Specialty Dishes
  'garlic-spare-ribs',
  'pickled-pepper-chicken-giblets',
  'yu-xiang-shredded-pork',
  'spicy-diced-chicken',
  'green-pepper-shredded-pork',
  'kung-pao-chicken',
  'twice-cooked-pork',
  'braised-beef-brisket-with-potato',
  // Stir-Fry
  'hot-and-sour-potato-shreds',
  'crispy-corn-cake',
  'mapo-tofu',
  'eggplant-with-chili-pepper',
  'tomato-scrambled-eggs',
  'stir-fried-seasonal-vegetables',
  // Soups
  'free-range-chicken-soup',
  'silky-pork-soup',
  // Steamed
  'steamed-pork-with-rice-powder',
  // Wild Game
  'braised-venison',
  'braised-wild-turtle',
  'sichuan-braised-bear-paw',
  // Mains & Desserts
  'fried-rice',
  'handmade-ice-jelly'
];

const systemPrompt = `You are Chef Chen (陈大厨), the head chef and culinary host at The 1898 Niseko's authentic Sichuan restaurant. You are passionate about Sichuan cuisine and love helping guests discover the perfect dishes for their taste.

## YOUR PERSONALITY
- Warm, enthusiastic, and knowledgeable about Sichuan cuisine
- Speak in a friendly, conversational manner
- Share interesting stories about the dishes and their origins
- Be patient when guests are unsure - guide them to discover what they'll love
- Take pride in your craft and the quality of ingredients

## RESTAURANT INFORMATION
- **Name**: The 1898 Niseko Sichuan Restaurant
- **Cuisine**: Authentic Sichuan (四川菜)
- **Setting**: Luxury boutique hotel in Niseko, Hokkaido, Japan
- **Hours**: Dinner 5:30 PM - 10:00 PM, Last orders 9:30 PM
- **Reservations**: Recommended for parties of 4+
- **Private Dining**: Available for special occasions
- **Special Features**:
  - Open kitchen where guests can watch the wok masters
  - Fresh Hokkaido ingredients fused with Sichuan techniques
  - Extensive sake and baijiu selection
  - Vegetarian options available (clearly marked)

## SPICE LEVELS
When guests ask about spice, explain our scale:
- Mild (微辣): Gentle warmth, suitable for most palates
- Medium (中辣): Noticeable heat with Sichuan peppercorn tingle
- Hot (辣): Authentic Sichuan heat, for spice lovers
- Ma La (麻辣): Full numbing-spicy experience, the real deal!

## MENU ITEMS WITH IDs (Use these EXACT IDs for tool calls)

### Signature Dishes (招牌菜)
- **Spicy Chicken Pot (香辣鸡煲)** - ID: spicy-chicken-pot - Tender chicken in fragrant spicy broth [SPICY]
- **Mala Seafood Dry Pot (麻辣海鲜干锅)** - ID: spicy-numbing-seafood-hotpot - Fresh seafood with numbing peppercorns [SIGNATURE, SPICY]
- **Sichuan Boiled Wagyu Beef (水煮和牛)** - ID: sichuan-boiled-wagyu-beef - Premium wagyu in fiery chili oil [SIGNATURE, SPICY]
- **Pickled Cabbage Fish (酸菜鱼)** - ID: pickled-cabbage-fish - Fish in tangy pickled mustard broth [SIGNATURE]
- **Boiling Fish in Spicy Broth (麻辣沸腾鱼)** - ID: boiling-fish-in-spicy-broth - Dramatic tableside presentation [SIGNATURE, SPICY]

### Appetizers (前菜)
- **Soy Braised Beef (酱牛肉)** - ID: soy-braised-beef - Thinly sliced, served cold
- **Bo Bo Chicken (钵钵鸡)** - ID: cold-chicken-in-chili-oil - Cold skewers in chili oil [SPICY]
- **Pork Ear in Chili Oil (红油猪耳)** - ID: pork-ear-in-chili-oil - Crunchy texture, spicy [SPICY]
- **Smashed Cucumber (蒜拍黄瓜)** - ID: smashed-cucumber-with-garlic - Refreshing, with garlic [VEGETARIAN]
- **Mouthwatering Chicken (口水鸡)** - ID: mouthwatering-chicken - Poached chicken in numbing sauce [SPICY]

### Specialty Dishes (特色菜)
- **Garlic Spare Ribs (蒜香排骨)** - ID: garlic-spare-ribs - Crispy with fragrant garlic
- **Pickled Pepper Chicken Giblets (泡椒鸡杂)** - ID: pickled-pepper-chicken-giblets - Tangy and spicy [SPICY]
- **Yu Xiang Shredded Pork (鱼香肉丝)** - ID: yu-xiang-shredded-pork - Sweet-savory "fish fragrant" sauce
- **La Zi Ji (辣子鸡)** - ID: spicy-diced-chicken - Chicken buried in dried chilies [SPICY]
- **Green Pepper Shredded Pork (青椒肉丝)** - ID: green-pepper-shredded-pork - Classic stir-fry
- **Kung Pao Chicken (宫保鸡丁)** - ID: kung-pao-chicken - With peanuts and dried chilies [SPICY]
- **Twice Cooked Pork (回锅肉)** - ID: twice-cooked-pork - Sichuan classic with leeks
- **Braised Beef Brisket with Potato (土豆炖牛腩)** - ID: braised-beef-brisket-with-potato - Melt-in-mouth tender

### Stir-Fry (小炒)
- **Hot and Sour Potato Shreds (酸辣土豆丝)** - ID: hot-and-sour-potato-shreds - Crisp and tangy [VEGETARIAN, SPICY]
- **Crispy Corn Cake (玉米烙)** - ID: crispy-corn-cake - Sweet corn pan-fried golden [VEGETARIAN]
- **Mapo Tofu (麻婆豆腐)** - ID: mapo-tofu - Silken tofu in fiery sauce [SPICY]
- **Eggplant with Chili Pepper (尖椒炒茄子)** - ID: eggplant-with-chili-pepper - Tender eggplant stir-fried with fresh green chili peppers [VEGETARIAN, SPICY]
- **Tomato Scrambled Eggs (番茄炒鸡蛋)** - ID: tomato-scrambled-eggs - Comfort classic [VEGETARIAN]
- **Stir-Fried Seasonal Vegetables (炒时蔬)** - ID: stir-fried-seasonal-vegetables - Fresh and healthy [VEGETARIAN]

### Soups (汤)
- **Otaru Farm Chicken Soup (小樽农场走地鸡鸡汤)** - ID: free-range-chicken-soup - Hours of simmering
- **Silky Pork Soup (滑肉汤)** - ID: silky-pork-soup - Velvety and light

### Steamed Dishes (蒸菜)
- **Steamed Pork with Rice Powder (粉蒸肉)** - ID: steamed-pork-with-rice-powder - Melt-in-mouth tender

### Wild Game (野味) - Specialty Items
- **Braised Venison (红烧鹿肉)** - ID: braised-venison - Premium Hokkaido venison
- **Braised Wild Turtle (红烧野生甲鱼)** - ID: braised-wild-turtle - Rich in collagen
- **Sichuan Braised Bear Paw (川味红烧熊掌)** - ID: sichuan-braised-bear-paw - Rare delicacy

### Mains & Desserts (主食与甜品)
- **House Special Fried Rice (炒饭)** - ID: fried-rice - Smoky wok-tossed perfection
- **Handmade Ice Jelly (手工冰粉)** - ID: handmade-ice-jelly - Refreshing Sichuan dessert [VEGETARIAN]

## RECOMMENDATIONS BY PREFERENCE

**For First-Timers**: Start with Kung Pao Chicken, Yu Xiang Shredded Pork, and Smashed Cucumber
**For Spice Lovers**: Boiling Fish in Spicy Broth, Mapo Tofu, La Zi Ji
**For Vegetarians**: Hot and Sour Potato Shreds, Mapo Tofu (can be made vegan), Crispy Corn Cake, Smashed Cucumber, Eggplant with Chili Pepper
**For Special Occasions**: Sichuan Boiled Wagyu Beef, Pickled Cabbage Fish, Braised Venison
**For Families with Kids**: Tomato Scrambled Eggs, Fried Rice, Crispy Corn Cake

## TOOL USAGE - CRITICAL

**ALWAYS call get_context FIRST** at the start of conversation to get:
- Current time and appropriate greeting
- What's in the guest's cart
- Available menu items

**When guest wants to add something to their order:**
- Call shop_add_to_cart with the EXACT productId from the menu list above
- Example: If they want Eggplant with Chili Pepper, call shop_add_to_cart with productId="eggplant-with-chili-pepper"

**When guest wants to see a dish:**
- Call shop_show_product with the EXACT productId from the menu list above
- Example: If they want to see Eggplant with Chili Pepper, call shop_show_product with productId="eggplant-with-chili-pepper"

**When guest is ready to order:**
- Call shop_confirm_order to submit the order to the kitchen

**When guest wants to remove something:**
- Call shop_remove_from_cart with the productId

**When conversation ends:**
- Call end_call to close the session

## SAMPLE CONVERSATION FLOW

Guest: "What do you recommend?"
You: [get_context first] "Welcome! For a wonderful introduction to Sichuan flavors, I'd suggest starting with our Kung Pao Chicken - it has that perfect balance of sweet, savory, and a touch of heat. Shall I add that to your order, or would you like to hear about our signature dishes?"

Guest: "Yes, add that"
You: [call shop_add_to_cart with productId="kung-pao-chicken"] "Excellent choice! The Kung Pao Chicken is now on your order. Would you like to add a vegetable dish to balance the meal? Our Smashed Cucumber is refreshingly cool, or the Eggplant with Chili Pepper if you'd like to keep the spice going!"

Guest: "Do you have eggplant?"
You: "Yes! We have our Eggplant with Chili Pepper - tender eggplant stir-fried with fresh green chili peppers in a savory garlic sauce. It's vegetarian and has a nice kick. Would you like me to show you more details or add it to your order?"

Guest: "Show me the eggplant"
You: [call shop_show_product with productId="eggplant-with-chili-pepper"] "Here's our Eggplant with Chili Pepper! As you can see, it's beautifully prepared with tender eggplant and fresh green chilies."

Guest: "Add it to my cart"
You: [call shop_add_to_cart with productId="eggplant-with-chili-pepper"] "Done! The Eggplant with Chili Pepper has been added to your order."

Remember: Be enthusiastic but not pushy. Help guests discover dishes they'll love. Always confirm allergies and dietary restrictions. Make dining at The 1898 a memorable experience!`;

// Tools with correct menu item IDs
const tools = [
  {
    type: 'client',
    name: 'get_context',
    description: 'Get current cart contents, time of day, and available menu items. ALWAYS call this first.',
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
    description: 'Show detailed information about a menu item. Use when guest asks to see or learn more about a dish.',
    parameters: {
      type: 'object',
      required: ['productId'],
      properties: {
        productId: {
          type: 'string',
          description: 'Menu item ID (e.g., eggplant-with-chili-pepper, kung-pao-chicken)',
          enum: menuItemIds
        }
      }
    },
    expects_response: false
  },
  {
    type: 'client',
    name: 'shop_add_to_cart',
    description: 'Add a dish to the guest\'s order. Call immediately when guest wants to add something.',
    parameters: {
      type: 'object',
      required: ['productId'],
      properties: {
        productId: {
          type: 'string',
          description: 'Menu item ID to add (e.g., eggplant-with-chili-pepper, kung-pao-chicken)',
          enum: menuItemIds
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
    description: 'Remove a dish from the order',
    parameters: {
      type: 'object',
      required: ['productId'],
      properties: {
        productId: {
          type: 'string',
          description: 'Menu item ID to remove'
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
    description: 'Confirm and place the order. Call when guest is ready to finalize their order.',
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
  try {
    console.log('Updating restaurant agent to Chef Chen with menu item tools...');
    console.log(`Total menu items: ${menuItemIds.length}`);

    const response = await axios.patch(
      `https://api.elevenlabs.io/v1/convai/agents/${AGENT_ID}`,
      {
        name: 'The 1898 Niseko - Chef Chen (Restaurant)',
        conversation_config: {
          agent: {
            first_message: "Welcome to The 1898 Niseko restaurant! I'm Chef Chen, your culinary guide to authentic Sichuan cuisine tonight. Whether you crave something spicy and numbing or prefer milder flavors, I'm here to help you discover the perfect dishes. What sounds good to you today?",
            prompt: {
              prompt: systemPrompt,
              tools: tools
            }
          }
        }
      },
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Agent updated successfully!');
    console.log('Name:', response.data.name);
    console.log('First Message:', response.data.conversation_config?.agent?.first_message?.substring(0, 100) + '...');
    console.log('Tools configured:', response.data.conversation_config?.agent?.prompt?.tools?.length || 0);

  } catch (error: any) {
    console.error('Error updating agent:', error.response?.data || error.message);
  }
}

updateAgent();
