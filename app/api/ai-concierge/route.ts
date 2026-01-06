import { NextRequest, NextResponse } from 'next/server';

// ============================================
// Types
// ============================================

interface BookingContext {
  currentStep: string;
  currentFlow: string;
  searchParams: {
    destination: string;
    checkIn: string;
    checkOut: string;
    nights: number;
    adults: number;
    children: number;
  };
  cart: {
    accommodationCount: number;
    serviceCount: number;
    productCount: number;
    totalAmount: number;
    hasAccommodation: boolean;
    serviceCategories: string[];
  };
  selectedProperty?: {
    name: string;
    location: string;
    amenities: string[];
  };
  userPreferences: Record<string, unknown>;
}

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface RequestBody {
  message: string;
  context: BookingContext;
  sessionId: string;
  conversationHistory: ConversationMessage[];
}

interface QuickSuggestion {
  id: string;
  label: string;
  action: string;
  data?: Record<string, unknown>;
}

interface AIResponse {
  message: string;
  action: string;
  actionData?: Record<string, unknown>;
  suggestions?: QuickSuggestion[];
  learnedPreferences?: Record<string, unknown>;
}

// ============================================
// System Prompt Builder
// ============================================

function buildSystemPrompt(context: BookingContext): string {
  const {
    currentStep,
    currentFlow,
    searchParams,
    cart,
    selectedProperty,
    userPreferences,
  } = context;

  return `You are Yuki, a friendly and knowledgeable ski resort booking assistant for a Niseko, Japan booking platform. You help guests book accommodations, ski equipment rentals, lessons, and other services.

IMPORTANT: Always respond in English.

## Your Personality
- Warm, helpful, and enthusiastic about skiing and Niseko
- Knowledgeable about ski equipment, lessons, and the local area
- Proactive in suggesting relevant services without being pushy
- Concise but thorough in explanations

## Current Booking Context
- **Step**: ${currentStep}
- **Flow**: ${currentFlow === 'accommodation_first' ? 'Started with accommodation search' : 'Started with services/products'}
- **Destination**: ${searchParams.destination}
- **Dates**: ${searchParams.checkIn} to ${searchParams.checkOut} (${searchParams.nights} nights)
- **Guests**: ${searchParams.adults} adults${searchParams.children > 0 ? `, ${searchParams.children} children` : ''}

## Cart Status
- Accommodations: ${cart.accommodationCount}
- Services: ${cart.serviceCount} (categories: ${cart.serviceCategories.join(', ') || 'none'})
- Products: ${cart.productCount}
- Total: ¥${cart.totalAmount.toLocaleString()}
- Has accommodation: ${cart.hasAccommodation ? 'Yes' : 'No'}

${selectedProperty ? `## Selected Property
- Name: ${selectedProperty.name}
- Location: ${selectedProperty.location}
- Amenities: ${selectedProperty.amenities.join(', ')}` : ''}

${Object.keys(userPreferences).length > 0 ? `## User Preferences
${JSON.stringify(userPreferences, null, 2)}` : ''}

## Available Actions
You can suggest these actions by including them in your response:
- navigate_to: Navigate to a different step (search, results, services, cart, checkout)
- add_to_cart: Add a service to cart (requires serviceId)
- show_recommendations: Show upsell recommendations
- get_cart_summary: Review cart contents
- checkout: Proceed to checkout

## Response Format
Provide helpful, conversational responses. When suggesting an action, be natural about it.

## Services Available
- Ski rentals (premium and standard packages)
- Snowboard rentals
- Ski lessons (private, group, kids camp)
- Snowboard lessons
- Airport transfers
- Shuttle services
- Lift passes (all-mountain, night skiing, multi-day)
- Spa treatments
- Activities (snowmobiling, snowshoeing)

## Key Information
- Niseko has 4 interconnected resorts: Grand Hirafu, Hanazono, Niseko Village, Annupuri
- Famous for powder snow (up to 15m annually)
- Peak season: December to February
- Beginner-friendly but also has challenging terrain
- Many properties offer ski-in/ski-out or shuttle service

Be helpful, suggest relevant services based on the user's booking, and make the experience enjoyable!`;
}

// ============================================
// Suggestion Generator
// ============================================

function generateSuggestions(context: BookingContext, messageContent: string): QuickSuggestion[] {
  const suggestions: QuickSuggestion[] = [];
  const { currentStep, cart, searchParams } = context;

  // Context-aware suggestions
  if (!cart.hasAccommodation && cart.serviceCount > 0) {
    suggestions.push({
      id: 'sug-acc',
      label: 'Find accommodation',
      action: 'navigate_to',
      data: { step: 'results' },
    });
  }

  if (cart.hasAccommodation && !cart.serviceCategories.includes('ski_rental')) {
    suggestions.push({
      id: 'sug-ski',
      label: 'Add ski rentals',
      action: 'show_recommendations',
      data: { category: 'ski_rental' },
    });
  }

  if (cart.hasAccommodation && !cart.serviceCategories.includes('lift_pass')) {
    suggestions.push({
      id: 'sug-lift',
      label: 'Add lift pass',
      action: 'show_recommendations',
      data: { category: 'lift_pass' },
    });
  }

  if (searchParams.children > 0 && !cart.serviceCategories.includes('ski_lesson')) {
    suggestions.push({
      id: 'sug-kids',
      label: 'Kids lessons',
      action: 'search_services',
      data: { category: 'ski_lesson', level: 'kids' },
    });
  }

  if (cart.accommodationCount > 0 || cart.serviceCount > 0) {
    suggestions.push({
      id: 'sug-cart',
      label: 'Review my cart',
      action: 'get_cart_summary',
      data: {},
    });
  }

  if (currentStep === 'cart' && cart.totalAmount > 0) {
    suggestions.push({
      id: 'sug-checkout',
      label: 'Ready to book',
      action: 'checkout',
      data: {},
    });
  }

  return suggestions.slice(0, 3);
}

// ============================================
// Action Extractor
// ============================================

function extractAction(response: string): { action: string; actionData?: Record<string, unknown> } {
  // Look for action patterns in the response
  const actionPatterns = [
    { pattern: /\[ACTION:navigate_to:(\w+)\]/i, action: 'navigate_to', dataKey: 'step' },
    { pattern: /\[ACTION:add_to_cart:(\w+)\]/i, action: 'add_to_cart', dataKey: 'serviceId' },
    { pattern: /\[ACTION:checkout\]/i, action: 'checkout' },
    { pattern: /\[ACTION:show_recommendations:?(\w*)\]/i, action: 'show_recommendations', dataKey: 'category' },
  ];

  for (const { pattern, action, dataKey } of actionPatterns) {
    const match = response.match(pattern);
    if (match) {
      return {
        action,
        actionData: dataKey && match[1] ? { [dataKey]: match[1] } : undefined,
      };
    }
  }

  // Check for implicit actions based on response content
  if (response.toLowerCase().includes('let me show you') && response.toLowerCase().includes('properties')) {
    return { action: 'navigate_to', actionData: { step: 'results' } };
  }

  if (response.toLowerCase().includes('proceed to checkout') || response.toLowerCase().includes('ready to complete')) {
    return { action: 'checkout' };
  }

  return { action: 'none' };
}

// ============================================
// Preference Extractor
// ============================================

function extractPreferences(message: string, response: string): Record<string, unknown> | undefined {
  const preferences: Record<string, unknown> = {};
  const combined = `${message} ${response}`.toLowerCase();

  // Ski level
  if (combined.includes('beginner') || combined.includes('first time')) {
    preferences.skiLevel = 'beginner';
  } else if (combined.includes('intermediate')) {
    preferences.skiLevel = 'intermediate';
  } else if (combined.includes('advanced') || combined.includes('expert')) {
    preferences.skiLevel = 'advanced';
  }

  // Budget
  if (combined.includes('budget') || combined.includes('affordable') || combined.includes('cheap')) {
    preferences.budgetRange = 'budget';
  } else if (combined.includes('luxury') || combined.includes('premium') || combined.includes('best')) {
    preferences.budgetRange = 'luxury';
  }

  // Kids
  if (combined.includes('kids') || combined.includes('children') || combined.includes('family')) {
    preferences.travelingWithKids = true;
  }

  return Object.keys(preferences).length > 0 ? preferences : undefined;
}

// ============================================
// API Handler
// ============================================

export async function POST(req: NextRequest) {
  try {
    const body: RequestBody = await req.json();
    const { message, context, sessionId, conversationHistory } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Check for Anthropic API key
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      // Fallback to rule-based responses if no API key
      console.log('No Anthropic API key, using fallback responses');
      return NextResponse.json(getFallbackResponse(message, context));
    }

    // Build messages array
    const apiMessages = [
      ...conversationHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: 'user', content: message },
    ];

    // Call Claude via fetch
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 500,
        system: buildSystemPrompt(context),
        messages: apiMessages,
      }),
    });

    if (!response.ok) {
      console.error('Anthropic API error:', response.status);
      return NextResponse.json(getFallbackResponse(message, context));
    }

    const data = await response.json();

    // Extract text response
    const textContent = data.content?.find((c: { type: string; text?: string }) => c.type === 'text');
    const responseText = textContent?.text || "I'm sorry, I couldn't generate a response.";

    // Clean up any action markers from the response
    const cleanedResponse = responseText.replace(/\[ACTION:[^\]]+\]/g, '').trim();

    // Extract action
    const { action, actionData } = extractAction(responseText);

    // Generate suggestions
    const suggestions = generateSuggestions(context, message);

    // Extract preferences
    const learnedPreferences = extractPreferences(message, responseText);

    const aiResponse: AIResponse = {
      message: cleanedResponse,
      action,
      actionData,
      suggestions,
      learnedPreferences,
    };

    return NextResponse.json(aiResponse);
  } catch (error) {
    console.error('AI Concierge error:', error);

    // Return a friendly error response
    return NextResponse.json({
      message: "I'm having trouble connecting right now. Please try again in a moment, or feel free to browse the services yourself!",
      action: 'none',
      suggestions: [
        { id: 'sug-retry', label: 'Try again', action: 'none', data: { query: 'Hello' } },
        { id: 'sug-services', label: 'Browse services', action: 'navigate_to', data: { step: 'services' } },
      ],
    });
  }
}

// ============================================
// Fallback Response (when no API key)
// ============================================

function getFallbackResponse(message: string, context: BookingContext): AIResponse {
  const lowerMessage = message.toLowerCase();
  const { cart, searchParams, currentStep } = context;

  // Greeting
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey') || lowerMessage.includes('good morning') || lowerMessage.includes('good afternoon')) {
    return {
      message: `Hello! Welcome to your Niseko ski trip booking! I see you're looking at ${searchParams.destination} for ${searchParams.nights} nights with ${searchParams.adults} adults${searchParams.children > 0 ? ` and ${searchParams.children} children` : ''}. How can I help you today?`,
      action: 'none',
      suggestions: generateSuggestions(context, message),
    };
  }

  // Price/cost inquiry
  if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('how much') || lowerMessage.includes('expensive') || lowerMessage.includes('cheap') || lowerMessage.includes('budget')) {
    return {
      message: `Our prices vary by service. Ski rentals start from ¥5,000/day for standard and ¥8,500/day for premium equipment. Lessons range from ¥8,000 for group classes to ¥25,000 for private instruction. Lift passes are around ¥6,500/day. Would you like to see our full service catalog with prices?`,
      action: 'none',
      suggestions: [
        { id: 'sug-1', label: 'View all services', action: 'navigate_to', data: { step: 'services' } },
        { id: 'sug-2', label: 'Ski rentals', action: 'navigate_to', data: { step: 'services' } },
      ],
    };
  }

  // Help inquiry
  if (lowerMessage.includes('help') || lowerMessage.includes('what can you') || lowerMessage.includes('how do i') || lowerMessage.includes('assist')) {
    return {
      message: `I'm Yuki, your booking assistant! I can help you with: 1) Finding and booking accommodation, 2) Ski & snowboard rentals, 3) Lessons for all skill levels, 4) Lift passes, 5) Airport transfers and shuttles, 6) Spa treatments and activities. Just ask me anything!`,
      action: 'none',
      suggestions: generateSuggestions(context, message),
    };
  }

  // Cart inquiry
  if (lowerMessage.includes('cart') || lowerMessage.includes('my booking') || lowerMessage.includes('my order') || lowerMessage.includes('what do i have')) {
    if (cart.totalAmount === 0) {
      return {
        message: "Your cart is currently empty. Would you like me to help you find accommodation or ski services?",
        action: 'none',
        suggestions: [
          { id: 'sug-1', label: 'Find accommodation', action: 'navigate_to', data: { step: 'results' } },
          { id: 'sug-2', label: 'Browse services', action: 'navigate_to', data: { step: 'services' } },
        ],
      };
    }
    return {
      message: `You have ${cart.accommodationCount} accommodation(s) and ${cart.serviceCount} service(s) in your cart, totaling ¥${cart.totalAmount.toLocaleString()}. Would you like to review your cart or continue shopping?`,
      action: 'none',
      suggestions: [
        { id: 'sug-1', label: 'Review cart', action: 'navigate_to', data: { step: 'cart' } },
        { id: 'sug-2', label: 'Add more', action: 'navigate_to', data: { step: 'services' } },
      ],
    };
  }

  // Ski rental inquiry
  if (lowerMessage.includes('ski') || lowerMessage.includes('rental') || lowerMessage.includes('equipment') || lowerMessage.includes('gear')) {
    return {
      message: "We offer premium and standard ski rental packages! Premium (¥8,500/day) includes high-performance Rossignol skis perfect for Niseko's powder. Standard (¥5,000/day) is great for casual skiers. All rentals include boots, poles, and helmet. Would you like to see our options?",
      action: 'none',
      suggestions: [
        { id: 'sug-1', label: 'Show ski rentals', action: 'navigate_to', data: { step: 'services' } },
        { id: 'sug-2', label: 'Snowboard rentals', action: 'navigate_to', data: { step: 'services' } },
      ],
    };
  }

  // Snowboard inquiry
  if (lowerMessage.includes('snowboard') || lowerMessage.includes('board')) {
    return {
      message: "We have great snowboard rental packages! Premium boards (¥8,500/day) are perfect for powder, and standard packages (¥5,000/day) work great for all conditions. All include boots and bindings. Want to see our snowboard options?",
      action: 'none',
      suggestions: [
        { id: 'sug-1', label: 'View snowboards', action: 'navigate_to', data: { step: 'services' } },
      ],
    };
  }

  // Lessons inquiry
  if (lowerMessage.includes('lesson') || lowerMessage.includes('learn') || lowerMessage.includes('instructor') || lowerMessage.includes('teach') || lowerMessage.includes('beginner')) {
    const hasKids = searchParams.children > 0;
    return {
      message: `We have excellent lessons available! Private lessons (¥25,000) give you one-on-one attention. Group lessons (¥8,000) are social and fun. ${hasKids ? "For your kids, our Kids Ski Camp (¥15,000) is fantastic - certified instructors make learning fun with games and hot chocolate breaks!" : ""} All levels welcome, from first-timers to advanced.`,
      action: 'none',
      suggestions: [
        { id: 'sug-1', label: 'View lessons', action: 'navigate_to', data: { step: 'services' } },
        ...(hasKids ? [{ id: 'sug-2', label: 'Kids camp', action: 'navigate_to', data: { step: 'services' } }] : []),
      ],
    };
  }

  // Lift pass inquiry
  if (lowerMessage.includes('lift') || lowerMessage.includes('pass') || lowerMessage.includes('ticket') || lowerMessage.includes('slope')) {
    return {
      message: "For lift passes, I recommend the Niseko United All-Mountain Pass (¥6,500/day) - it gives you access to all 4 interconnected resorts: Grand Hirafu, Hanazono, Niseko Village, and Annupuri. We also have night skiing passes (¥2,800) if you want to ski under the lights!",
      action: 'none',
      suggestions: [
        { id: 'sug-1', label: 'View lift passes', action: 'navigate_to', data: { step: 'services' } },
      ],
    };
  }

  // Transfer/transport inquiry
  if (lowerMessage.includes('transfer') || lowerMessage.includes('airport') || lowerMessage.includes('shuttle') || lowerMessage.includes('transport') || lowerMessage.includes('bus')) {
    return {
      message: "We offer convenient transport options! Airport transfers from New Chitose Airport (¥5,000/person) take about 2.5 hours. Local shuttle services (¥800/trip) run between the resorts and villages. Would you like to book a transfer?",
      action: 'none',
      suggestions: [
        { id: 'sug-1', label: 'Book transfer', action: 'navigate_to', data: { step: 'services' } },
      ],
    };
  }

  // Property/accommodation inquiry
  if (lowerMessage.includes('hotel') || lowerMessage.includes('property') || lowerMessage.includes('accommodation') || lowerMessage.includes('stay') || lowerMessage.includes('room') || lowerMessage.includes('chalet')) {
    return {
      message: "We have wonderful properties in Niseko! From cozy chalets to luxury resorts, many with ski-in/ski-out access or shuttle service. Options range from ¥15,000 to ¥80,000+ per night depending on size and amenities. Would you like me to show you available properties?",
      action: 'none',
      suggestions: [
        { id: 'sug-1', label: 'View properties', action: 'navigate_to', data: { step: 'results' } },
      ],
    };
  }

  // Spa/wellness inquiry
  if (lowerMessage.includes('spa') || lowerMessage.includes('massage') || lowerMessage.includes('onsen') || lowerMessage.includes('relax') || lowerMessage.includes('wellness')) {
    return {
      message: "After a day on the slopes, nothing beats a relaxing spa treatment! We offer massages, hot stone therapy, and access to traditional Japanese onsen (hot springs). Treatments start from ¥8,000. Perfect for sore muscles!",
      action: 'none',
      suggestions: [
        { id: 'sug-1', label: 'View spa services', action: 'navigate_to', data: { step: 'services' } },
      ],
    };
  }

  // Weather/conditions inquiry
  if (lowerMessage.includes('weather') || lowerMessage.includes('snow') || lowerMessage.includes('condition') || lowerMessage.includes('powder')) {
    return {
      message: "Niseko is famous for its incredible powder snow - averaging 15 meters annually! The best conditions are typically December through February. The snow is light and dry, perfect for skiing and snowboarding. Current conditions look great for your trip dates!",
      action: 'none',
      suggestions: generateSuggestions(context, message),
    };
  }

  // Checkout inquiry
  if (lowerMessage.includes('checkout') || lowerMessage.includes('pay') || lowerMessage.includes('book now') || lowerMessage.includes('complete') || lowerMessage.includes('finish') || lowerMessage.includes('confirm')) {
    if (cart.totalAmount > 0) {
      return {
        message: `Great! You're ready to complete your booking of ¥${cart.totalAmount.toLocaleString()}. Let me take you to checkout!`,
        action: 'checkout',
        suggestions: [],
      };
    }
    return {
      message: "Your cart is empty. Would you like to browse our accommodations or services first?",
      action: 'none',
      suggestions: [
        { id: 'sug-1', label: 'Find accommodation', action: 'navigate_to', data: { step: 'results' } },
        { id: 'sug-2', label: 'Browse services', action: 'navigate_to', data: { step: 'services' } },
      ],
    };
  }

  // Date/timing/when to visit inquiry (must be before recommendation check)
  if (lowerMessage.includes('when') || lowerMessage.includes('date') || lowerMessage.includes('time of year') || lowerMessage.includes('season') ||
      (lowerMessage.includes('best') && (lowerMessage.includes('visit') || lowerMessage.includes('go') || lowerMessage.includes('travel') || lowerMessage.includes('month')))) {
    return {
      message: "The best time to visit Niseko is December through February for peak powder conditions! December offers holiday festivities and great early-season snow. January typically has the deepest powder (up to 15 meters annually!). February is excellent with slightly warmer temps. March is good for spring skiing with sunny days. The ski season runs from late November to early May.",
      action: 'none',
      suggestions: [
        { id: 'sug-1', label: 'Check availability', action: 'navigate_to', data: { step: 'results' } },
        { id: 'sug-2', label: 'View services', action: 'navigate_to', data: { step: 'services' } },
      ],
    };
  }

  // Recommendation inquiry
  if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest') || lowerMessage.includes('what should') ||
      (lowerMessage.includes('best') && !lowerMessage.includes('visit') && !lowerMessage.includes('time') && !lowerMessage.includes('date'))) {
    const hasKids = searchParams.children > 0;
    return {
      message: `Based on your trip (${searchParams.nights} nights, ${searchParams.adults} adults${hasKids ? `, ${searchParams.children} kids` : ''}), I'd recommend: 1) Premium ski rental for the best powder experience, 2) An all-mountain lift pass, ${hasKids ? '3) Kids Ski Camp for the little ones, ' : ''}and 4) An airport transfer for convenience. Want me to show you these options?`,
      action: 'none',
      suggestions: [
        { id: 'sug-1', label: 'View recommendations', action: 'navigate_to', data: { step: 'services' } },
        { id: 'sug-2', label: 'Find accommodation', action: 'navigate_to', data: { step: 'results' } },
      ],
    };
  }

  // Thank you
  if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
    return {
      message: "You're welcome! I'm here to help make your Niseko trip amazing. Is there anything else you'd like to know or book?",
      action: 'none',
      suggestions: generateSuggestions(context, message),
    };
  }

  // Yes/confirmation
  if (lowerMessage === 'yes' || lowerMessage === 'sure' || lowerMessage === 'ok' || lowerMessage === 'okay' || lowerMessage.includes('show me') || lowerMessage.includes('let\'s see')) {
    return {
      message: "Great! Let me show you our available services. You can browse ski rentals, lessons, lift passes, and more. What interests you most?",
      action: 'navigate_to',
      actionData: { step: 'services' },
      suggestions: [
        { id: 'sug-1', label: 'Ski rentals', action: 'navigate_to', data: { step: 'services' } },
        { id: 'sug-2', label: 'Lessons', action: 'navigate_to', data: { step: 'services' } },
        { id: 'sug-3', label: 'Lift passes', action: 'navigate_to', data: { step: 'services' } },
      ],
    };
  }

  // Default response - more helpful
  return {
    message: `I'd be happy to help with your Niseko ski trip! You can ask me about:\n• Ski & snowboard rentals\n• Lessons (private, group, kids)\n• Lift passes\n• Accommodation\n• Airport transfers\n• Spa & activities\n\nOr just tell me what you're looking for!`,
    action: 'none',
    suggestions: generateSuggestions(context, message),
  };
}
