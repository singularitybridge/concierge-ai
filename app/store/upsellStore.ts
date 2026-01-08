import { create } from 'zustand';
import { ServiceCategory, CartAccommodation, CartService, GuestService } from './bookingStore';

// ============================================
// Upsell Types
// ============================================

export type UpsellTrigger =
  | 'post_room_selection'      // After user adds a room
  | 'pre_checkout'             // Before final checkout
  | 'no_accommodation'         // Products in cart but no room
  | 'cart_composition'         // Based on what's in cart
  | 'contextual';              // Based on user context (dates, guests, etc.)

export type UpsellPriority = 'high' | 'medium' | 'low';

export interface UpsellRecommendation {
  id: string;
  serviceId: string;
  serviceName: string;
  category: ServiceCategory;
  reason: string;                    // Why we're recommending this
  priority: UpsellPriority;
  discountMessage?: string;          // e.g., "10% family discount available"
  triggerRule: string;               // Which rule generated this
  estimatedPrice: number;
  priceType: string;
}

export interface UpsellRule {
  id: string;
  name: string;
  description: string;
  trigger: UpsellTrigger;
  priority: UpsellPriority;
  conditions: UpsellCondition[];
  recommendations: string[];         // Service IDs to recommend
  reasonTemplate: string;            // Template for the reason message
  discountTemplate?: string;
  isActive: boolean;
}

export interface UpsellCondition {
  type: 'has_children' | 'guest_count' | 'stay_length' | 'no_service_category' |
        'has_accommodation' | 'no_accommodation' | 'cart_empty' | 'season' |
        'property_amenity' | 'total_guests_min' | 'total_guests_max';
  operator?: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains';
  value?: string | number | boolean;
}

export interface UpsellContext {
  // Guest info
  adults: number;
  children: number;
  childAges: number[];
  totalGuests: number;

  // Stay info
  checkIn: string;
  checkOut: string;
  nights: number;
  destination: string;

  // Cart state
  hasAccommodation: boolean;
  accommodations: CartAccommodation[];
  services: CartService[];
  serviceCategoriesInCart: ServiceCategory[];

  // Property info (if selected)
  propertyAmenities: string[];
  distanceToLift: string;
}

// ============================================
// Upsell Rules Database
// ============================================

const defaultUpsellRules: UpsellRule[] = [
  // === POST ROOM SELECTION RULES ===
  {
    id: 'rule-family-kids-camp',
    name: 'Family with Children - Kids Camp',
    description: 'Suggest kids ski camp for families with children',
    trigger: 'post_room_selection',
    priority: 'high',
    conditions: [
      { type: 'has_children', value: true },
      { type: 'no_service_category', value: 'ski_lesson' }
    ],
    recommendations: ['svc-lesson-3'], // Kids Ski Camp
    reasonTemplate: 'Perfect for your {childCount} {childPlural}! Our certified instructors make learning fun.',
    discountTemplate: 'Family booking discount available',
    isActive: true
  },
  {
    id: 'rule-ski-rental-basic',
    name: 'No Ski Rental - Suggest Equipment',
    description: 'Suggest ski rental when no equipment in cart',
    trigger: 'post_room_selection',
    priority: 'high',
    conditions: [
      { type: 'no_service_category', value: 'ski_rental' },
      { type: 'no_service_category', value: 'snowboard_rental' }
    ],
    recommendations: ['svc-rental-1', 'svc-rental-2'], // Premium and Standard ski
    reasonTemplate: 'Complete your ski trip with quality rental equipment',
    isActive: true
  },
  {
    id: 'rule-lift-pass',
    name: 'No Lift Pass - Suggest Passes',
    description: 'Suggest lift passes when not in cart',
    trigger: 'post_room_selection',
    priority: 'high',
    conditions: [
      { type: 'no_service_category', value: 'lift_pass' }
    ],
    recommendations: ['svc-lift-1', 'svc-lift-3'], // All mountain and 5-day
    reasonTemplate: 'Access all 4 Niseko United resorts with one pass',
    isActive: true
  },
  {
    id: 'rule-long-stay-multi-pass',
    name: 'Long Stay - Multi-day Pass',
    description: 'Suggest multi-day passes for stays of 4+ nights',
    trigger: 'post_room_selection',
    priority: 'medium',
    conditions: [
      { type: 'stay_length', operator: 'greater_than', value: 3 },
      { type: 'no_service_category', value: 'lift_pass' }
    ],
    recommendations: ['svc-lift-3'], // 5-day pass
    reasonTemplate: 'Save with our {nights}-day pass - better value for longer stays!',
    discountTemplate: 'Multi-day discount applied',
    isActive: true
  },
  {
    id: 'rule-airport-transfer',
    name: 'Suggest Airport Transfer',
    description: 'Suggest transfer service for all bookings',
    trigger: 'post_room_selection',
    priority: 'medium',
    conditions: [
      { type: 'no_service_category', value: 'airport_transfer' }
    ],
    recommendations: ['svc-transfer-1', 'svc-transfer-2'],
    reasonTemplate: 'Hassle-free transfer from New Chitose Airport',
    isActive: true
  },
  {
    id: 'rule-group-lesson',
    name: 'Adult Group - Lessons',
    description: 'Suggest group lessons for adult-only groups',
    trigger: 'post_room_selection',
    priority: 'medium',
    conditions: [
      { type: 'has_children', value: false },
      { type: 'total_guests_min', value: 2 },
      { type: 'no_service_category', value: 'ski_lesson' }
    ],
    recommendations: ['svc-lesson-2'], // Group lesson
    reasonTemplate: 'Learn together with a group lesson - fun and social!',
    isActive: true
  },

  // === PRE-CHECKOUT RULES ===
  {
    id: 'rule-spa-relax',
    name: 'Pre-checkout Spa Suggestion',
    description: 'Suggest spa after a day of skiing',
    trigger: 'pre_checkout',
    priority: 'medium',
    conditions: [
      { type: 'no_service_category', value: 'spa' },
      { type: 'has_accommodation', value: true }
    ],
    recommendations: ['svc-spa-1', 'svc-spa-2'],
    reasonTemplate: 'Relax after skiing with our spa treatments',
    isActive: true
  },
  {
    id: 'rule-night-skiing',
    name: 'Pre-checkout Night Skiing',
    description: 'Suggest night skiing experience',
    trigger: 'pre_checkout',
    priority: 'low',
    conditions: [
      { type: 'no_service_category', value: 'lift_pass' }
    ],
    recommendations: ['svc-lift-2'], // Night skiing pass
    reasonTemplate: 'Experience magical night skiing under the lights!',
    isActive: true
  },
  {
    id: 'rule-activity-adventure',
    name: 'Pre-checkout Activities',
    description: 'Suggest activities for adventurous guests',
    trigger: 'pre_checkout',
    priority: 'low',
    conditions: [
      { type: 'no_service_category', value: 'activity' },
      { type: 'has_children', value: false }
    ],
    recommendations: ['svc-activity-1', 'svc-activity-2'],
    reasonTemplate: 'Add some adventure to your trip!',
    isActive: true
  },

  // === NO ACCOMMODATION RULES ===
  {
    id: 'rule-no-room-suggest',
    name: 'Products Only - Suggest Accommodation',
    description: 'When cart has services but no room, suggest accommodation',
    trigger: 'no_accommodation',
    priority: 'high',
    conditions: [
      { type: 'no_accommodation', value: true },
      { type: 'cart_empty', value: false }
    ],
    recommendations: [], // Special handling - suggests properties, not services
    reasonTemplate: 'You have services booked for {dates}. Need a place to stay?',
    isActive: true
  },

  // === CONTEXTUAL RULES ===
  {
    id: 'rule-shuttle-far-property',
    name: 'Shuttle for Far Properties',
    description: 'Suggest shuttle for properties far from lift',
    trigger: 'contextual',
    priority: 'medium',
    conditions: [
      { type: 'no_service_category', value: 'shuttle' }
    ],
    recommendations: ['svc-shuttle-1'],
    reasonTemplate: 'Convenient shuttle service to get you to the slopes',
    isActive: true
  }
];

// ============================================
// Store State Interface
// ============================================

interface UpsellState {
  // Rules
  rules: UpsellRule[];

  // Current recommendations
  currentRecommendations: UpsellRecommendation[];

  // Tracking
  shownRecommendations: string[];      // IDs of recommendations shown
  acceptedRecommendations: string[];   // IDs of accepted recommendations
  declinedRecommendations: string[];   // IDs of declined recommendations

  // Current gate
  currentGate: UpsellTrigger | null;
  gateVisible: boolean;

  // Available services reference (for looking up service details)
  availableServices: GuestService[];

  // Actions
  setAvailableServices: (services: GuestService[]) => void;
  generateRecommendations: (context: UpsellContext, trigger: UpsellTrigger) => UpsellRecommendation[];
  showGate: (trigger: UpsellTrigger) => void;
  hideGate: () => void;
  acceptRecommendation: (recommendationId: string) => void;
  declineRecommendation: (recommendationId: string) => void;
  declineAllForGate: () => void;
  resetTracking: () => void;

  // Helpers
  getTopRecommendations: (count?: number) => UpsellRecommendation[];
  hasRecommendations: () => boolean;
  shouldShowAccommodationUpsell: (context: UpsellContext) => boolean;
}

// ============================================
// Helper Functions
// ============================================

function evaluateCondition(condition: UpsellCondition, context: UpsellContext): boolean {
  switch (condition.type) {
    case 'has_children':
      return condition.value === (context.children > 0);

    case 'guest_count':
      if (condition.operator === 'equals') return context.totalGuests === condition.value;
      if (condition.operator === 'greater_than') return context.totalGuests > (condition.value as number);
      if (condition.operator === 'less_than') return context.totalGuests < (condition.value as number);
      return false;

    case 'total_guests_min':
      return context.totalGuests >= (condition.value as number);

    case 'total_guests_max':
      return context.totalGuests <= (condition.value as number);

    case 'stay_length':
      if (condition.operator === 'equals') return context.nights === condition.value;
      if (condition.operator === 'greater_than') return context.nights > (condition.value as number);
      if (condition.operator === 'less_than') return context.nights < (condition.value as number);
      return false;

    case 'no_service_category':
      return !context.serviceCategoriesInCart.includes(condition.value as ServiceCategory);

    case 'has_accommodation':
      return condition.value === context.hasAccommodation;

    case 'no_accommodation':
      return condition.value === !context.hasAccommodation;

    case 'cart_empty':
      const isEmpty = context.accommodations.length === 0 && context.services.length === 0;
      return condition.value === isEmpty;

    case 'property_amenity':
      if (condition.operator === 'contains') {
        return context.propertyAmenities.some(a =>
          a.toLowerCase().includes((condition.value as string).toLowerCase())
        );
      }
      return false;

    case 'season':
      // Simple season check based on month
      const checkInDate = new Date(context.checkIn);
      const month = checkInDate.getMonth();
      if (condition.value === 'winter') return month >= 11 || month <= 2;
      if (condition.value === 'peak') return month === 0 || month === 1; // Jan-Feb
      return false;

    default:
      return false;
  }
}

function evaluateRule(rule: UpsellRule, context: UpsellContext): boolean {
  if (!rule.isActive) return false;
  return rule.conditions.every(condition => evaluateCondition(condition, context));
}

function formatReasonTemplate(template: string, context: UpsellContext): string {
  let result = template;

  result = result.replace('{childCount}', context.children.toString());
  result = result.replace('{childPlural}', context.children === 1 ? 'child' : 'children');
  result = result.replace('{nights}', context.nights.toString());
  result = result.replace('{guestCount}', context.totalGuests.toString());
  result = result.replace('{dates}', `${context.checkIn} to ${context.checkOut}`);
  result = result.replace('{destination}', context.destination);

  return result;
}

// ============================================
// Store Implementation
// ============================================

export const useUpsellStore = create<UpsellState>((set, get) => ({
  rules: defaultUpsellRules,
  currentRecommendations: [],
  shownRecommendations: [],
  acceptedRecommendations: [],
  declinedRecommendations: [],
  currentGate: null,
  gateVisible: false,
  availableServices: [],

  setAvailableServices: (services) => {
    set({ availableServices: services });
  },

  generateRecommendations: (context, trigger) => {
    const state = get();
    const { rules, declinedRecommendations, availableServices } = state;

    // Filter rules by trigger and evaluate conditions
    const matchingRules = rules.filter(rule =>
      rule.trigger === trigger && evaluateRule(rule, context)
    );

    // Generate recommendations from matching rules
    const recommendations: UpsellRecommendation[] = [];

    for (const rule of matchingRules) {
      for (const serviceId of rule.recommendations) {
        // Skip if already declined
        if (declinedRecommendations.includes(serviceId)) continue;

        // Skip if already in cart
        if (context.services.some(s => s.serviceId === serviceId)) continue;

        // Find the service details
        const service = availableServices.find(s => s.id === serviceId);
        if (!service) continue;

        // Create recommendation
        const recommendation: UpsellRecommendation = {
          id: `rec-${rule.id}-${serviceId}`,
          serviceId: service.id,
          serviceName: service.name,
          category: service.category,
          reason: formatReasonTemplate(rule.reasonTemplate, context),
          priority: rule.priority,
          discountMessage: rule.discountTemplate,
          triggerRule: rule.id,
          estimatedPrice: service.price,
          priceType: service.priceType
        };

        recommendations.push(recommendation);
      }
    }

    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    // Update state
    set({
      currentRecommendations: recommendations,
      shownRecommendations: [...state.shownRecommendations, ...recommendations.map(r => r.id)]
    });

    return recommendations;
  },

  showGate: (trigger) => {
    set({ currentGate: trigger, gateVisible: true });
  },

  hideGate: () => {
    set({ gateVisible: false });
  },

  acceptRecommendation: (recommendationId) => {
    set(state => ({
      acceptedRecommendations: [...state.acceptedRecommendations, recommendationId],
      currentRecommendations: state.currentRecommendations.filter(r => r.id !== recommendationId)
    }));
  },

  declineRecommendation: (recommendationId) => {
    const state = get();
    const recommendation = state.currentRecommendations.find(r => r.id === recommendationId);

    set(state => ({
      declinedRecommendations: recommendation
        ? [...state.declinedRecommendations, recommendation.serviceId]
        : state.declinedRecommendations,
      currentRecommendations: state.currentRecommendations.filter(r => r.id !== recommendationId)
    }));
  },

  declineAllForGate: () => {
    const state = get();
    const serviceIds = state.currentRecommendations.map(r => r.serviceId);

    set({
      declinedRecommendations: [...state.declinedRecommendations, ...serviceIds],
      currentRecommendations: [],
      gateVisible: false
    });
  },

  resetTracking: () => {
    set({
      currentRecommendations: [],
      shownRecommendations: [],
      acceptedRecommendations: [],
      declinedRecommendations: [],
      currentGate: null,
      gateVisible: false
    });
  },

  getTopRecommendations: (count = 3) => {
    return get().currentRecommendations.slice(0, count);
  },

  hasRecommendations: () => {
    return get().currentRecommendations.length > 0;
  },

  shouldShowAccommodationUpsell: (context) => {
    // Show accommodation upsell if:
    // 1. There are services in cart
    // 2. No accommodation in cart
    return context.services.length > 0 && !context.hasAccommodation;
  }
}));

// ============================================
// Context Builder Helper
// ============================================

export function buildUpsellContext(
  searchParams: { adults: number; children: number; checkIn: string; checkOut: string; nights: number; destination: string },
  cartAccommodations: CartAccommodation[],
  cartServices: CartService[],
  childAges: number[] = [],
  propertyAmenities: string[] = [],
  distanceToLift: string = ''
): UpsellContext {
  const serviceCategoriesInCart = [...new Set(cartServices.map(s => s.category))];

  return {
    adults: searchParams.adults,
    children: searchParams.children,
    childAges,
    totalGuests: searchParams.adults + searchParams.children,
    checkIn: searchParams.checkIn,
    checkOut: searchParams.checkOut,
    nights: searchParams.nights,
    destination: searchParams.destination,
    hasAccommodation: cartAccommodations.length > 0,
    accommodations: cartAccommodations,
    services: cartServices,
    serviceCategoriesInCart,
    propertyAmenities,
    distanceToLift
  };
}
