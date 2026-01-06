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
    totalAmount: number;
    hasAccommodation: boolean;
  };
  selectedProperty?: {
    name: string;
    location: string;
  };
}

interface VapiToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

interface VapiMessage {
  type: string;
  toolCalls?: VapiToolCall[];
  toolCallList?: VapiToolCall[];
  functionCall?: {
    name: string;
    parameters: Record<string, unknown>;
  };
  call?: {
    id: string;
    metadata?: {
      bookingContext?: BookingContext;
      sessionId?: string;
    };
  };
}

// ============================================
// Booking-Aware System Prompt
// ============================================

function buildBookingSystemPrompt(context?: BookingContext): string {
  const basePrompt = `You are Yuki, a friendly ski resort booking assistant for Niseko, Japan. You help guests via voice calls with:
- Finding and booking accommodations
- Ski equipment rentals
- Ski and snowboard lessons
- Lift passes and activities
- Airport transfers

IMPORTANT: Always respond in English. Be concise and natural for voice conversation. Keep responses under 2-3 sentences unless more detail is requested.`;

  if (!context) {
    return basePrompt;
  }

  return `${basePrompt}

CURRENT BOOKING CONTEXT:
- Step: ${context.currentStep}
- Destination: ${context.searchParams.destination}
- Dates: ${context.searchParams.checkIn} to ${context.searchParams.checkOut} (${context.searchParams.nights} nights)
- Guests: ${context.searchParams.adults} adults${context.searchParams.children > 0 ? `, ${context.searchParams.children} children` : ''}
- Cart: ${context.cart.accommodationCount} accommodations, ${context.cart.serviceCount} services, ¥${context.cart.totalAmount.toLocaleString()} total
${context.selectedProperty ? `- Looking at: ${context.selectedProperty.name}` : ''}

Use this context to give personalized recommendations. If they have children, suggest kids' lessons. If no lift pass, mention it.`;
}

// ============================================
// Tool Handlers
// ============================================

interface ToolResponse {
  result: string;
  action?: string;
  data?: Record<string, unknown>;
}

function handleGetBookingStatus(context?: BookingContext): ToolResponse {
  if (!context || context.cart.totalAmount === 0) {
    return {
      result: "Your cart is currently empty. Would you like help finding accommodation or ski services?",
    };
  }

  const parts: string[] = [];

  if (context.cart.accommodationCount > 0) {
    parts.push(`${context.cart.accommodationCount} accommodation`);
  }
  if (context.cart.serviceCount > 0) {
    parts.push(`${context.cart.serviceCount} service${context.cart.serviceCount > 1 ? 's' : ''}`);
  }

  return {
    result: `You have ${parts.join(' and ')} in your cart, totaling ${context.cart.totalAmount.toLocaleString()} yen. Would you like to continue shopping or proceed to checkout?`,
  };
}

function handleGetRecommendations(context?: BookingContext): ToolResponse {
  const recommendations: string[] = [];

  if (context) {
    if (!context.cart.hasAccommodation) {
      recommendations.push("You haven't selected accommodation yet - we have lovely chalets and hotels near the slopes");
    }
    if (context.searchParams.children > 0) {
      recommendations.push("For your kids, I'd recommend our Kids Ski Camp - certified instructors make learning fun!");
    }
    if (context.cart.serviceCount === 0) {
      recommendations.push("Don't forget ski rentals - our premium package includes powder-ready equipment perfect for Niseko");
    }
  }

  if (recommendations.length === 0) {
    recommendations.push("Based on your trip, I'd suggest adding a lift pass for the Niseko United resorts");
    recommendations.push("Our spa treatments are perfect after a day on the slopes");
  }

  return {
    result: recommendations.slice(0, 2).join(". Also, ") + ".",
  };
}

function handleSearchProperties(_args: Record<string, unknown>): ToolResponse {
  return {
    result: "I can show you our available properties! We have ski-in/ski-out chalets, luxury resorts, and cozy family lodges. What's most important to you - proximity to lifts, amenities, or budget?",
    action: 'navigate_to',
    data: { step: 'results' },
  };
}

function handleSearchServices(args: Record<string, unknown>): ToolResponse {
  const category = args.category as string;

  const categoryMessages: Record<string, string> = {
    ski_rental: "For ski rentals, we have premium and standard packages. Premium includes high-performance Rossignol skis perfect for powder. Standard is great for casual skiers. Which interests you?",
    ski_lesson: "We offer private lessons, group classes, and a fantastic Kids Ski Camp! Private gives you one-on-one attention, while group is more social and budget-friendly.",
    lift_pass: "For lift passes, I recommend the Niseko United All-Mountain pass - it gives you access to all 4 interconnected resorts. We also have night skiing passes if you want to ski under the lights!",
    default: "We have ski rentals, lessons, lift passes, spa treatments, and more. What type of service are you interested in?",
  };

  return {
    result: categoryMessages[category] || categoryMessages.default,
    action: 'navigate_to',
    data: { step: 'services' },
  };
}

function handleProceedCheckout(context?: BookingContext): ToolResponse {
  if (!context || context.cart.totalAmount === 0) {
    return {
      result: "Your cart is empty. Let's add something first - would you like to look at accommodations or services?",
    };
  }

  return {
    result: `Great! Your total is ${context.cart.totalAmount.toLocaleString()} yen. I'll take you to checkout now. You'll need to enter your contact details and payment information.`,
    action: 'checkout',
  };
}

// ============================================
// API Handler
// ============================================

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message: VapiMessage = body.message || body;
    const bookingContext = message.call?.metadata?.bookingContext;

    // Handle tool calls
    const toolCalls = message.toolCalls || message.toolCallList || [];

    if (toolCalls.length > 0) {
      const results = toolCalls.map((toolCall) => {
        const functionName = toolCall.function.name;
        let args: Record<string, unknown> = {};

        try {
          args = JSON.parse(toolCall.function.arguments || '{}');
        } catch {
          args = {};
        }

        let response: ToolResponse;

        switch (functionName) {
          case 'get_booking_status':
            response = handleGetBookingStatus(bookingContext);
            break;
          case 'get_recommendations':
            response = handleGetRecommendations(bookingContext);
            break;
          case 'search_properties':
            response = handleSearchProperties(args);
            break;
          case 'search_services':
            response = handleSearchServices(args);
            break;
          case 'proceed_checkout':
            response = handleProceedCheckout(bookingContext);
            break;
          default:
            response = {
              result: "I'm not sure how to help with that. Would you like me to help you with your booking?",
            };
        }

        return {
          toolCallId: toolCall.id,
          result: response.result,
        };
      });

      return NextResponse.json({ results }, { headers: corsHeaders });
    }

    // Handle function calls (older format)
    if (message.functionCall) {
      const { name } = message.functionCall;

      let response: ToolResponse;

      switch (name) {
        case 'get_booking_status':
          response = handleGetBookingStatus(bookingContext);
          break;
        case 'get_recommendations':
          response = handleGetRecommendations(bookingContext);
          break;
        default:
          response = { result: "How can I help with your booking?" };
      }

      return NextResponse.json({ result: response.result }, { headers: corsHeaders });
    }

    // Default acknowledgment
    return NextResponse.json({ status: 'received' }, { headers: corsHeaders });

  } catch {
    return NextResponse.json(
      { error: 'Internal server error', result: 'Sorry, something went wrong.' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// ============================================
// GET endpoint for VAPI assistant configuration
// ============================================

export async function GET(req: NextRequest) {
  // Return tool definitions for VAPI assistant configuration
  const tools = [
    {
      type: 'function',
      function: {
        name: 'get_booking_status',
        description: 'Get the current booking status including cart contents and total',
        parameters: {
          type: 'object',
          properties: {},
          required: [],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'get_recommendations',
        description: 'Get personalized recommendations based on the current booking',
        parameters: {
          type: 'object',
          properties: {},
          required: [],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'search_properties',
        description: 'Search for available properties/accommodations',
        parameters: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              description: 'Property type filter (chalet, hotel, resort)',
            },
          },
          required: [],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'search_services',
        description: 'Search for available services',
        parameters: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              description: 'Service category (ski_rental, ski_lesson, lift_pass, spa, transfer)',
            },
          },
          required: [],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'proceed_checkout',
        description: 'Proceed to checkout with current cart',
        parameters: {
          type: 'object',
          properties: {},
          required: [],
        },
      },
    },
  ];

  return NextResponse.json(
    {
      systemPrompt: buildBookingSystemPrompt(),
      tools,
    },
    { headers: corsHeaders }
  );
}
