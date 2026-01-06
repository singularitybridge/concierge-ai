import { create } from 'zustand';
import { ServiceCategory } from './bookingStore';

// ============================================
// Message Types
// ============================================

export type MessageRole = 'user' | 'assistant' | 'system';
export type MessageType = 'text' | 'voice' | 'action' | 'suggestion' | 'error';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  type: MessageType;
  content: string;
  timestamp: Date;
  metadata?: {
    voiceDuration?: number;
    actionType?: ConciergeAction;
    actionData?: Record<string, unknown>;
    suggestions?: QuickSuggestion[];
  };
}

export interface QuickSuggestion {
  id: string;
  label: string;
  action: ConciergeAction;
  data?: Record<string, unknown>;
}

// ============================================
// Concierge Actions
// ============================================

export type ConciergeAction =
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'navigate_to'
  | 'show_recommendations'
  | 'apply_discount'
  | 'get_cart_summary'
  | 'get_property_info'
  | 'get_service_info'
  | 'search_properties'
  | 'search_services'
  | 'set_preference'
  | 'checkout'
  | 'none';

export interface ActionResult {
  success: boolean;
  action: ConciergeAction;
  message: string;
  data?: Record<string, unknown>;
}

// ============================================
// Voice State
// ============================================

export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

export interface VoiceSession {
  isActive: boolean;
  state: VoiceState;
  callId?: string;
  startTime?: Date;
  transcript?: string;
  error?: string;
}

// ============================================
// User Preferences (learned from conversation)
// ============================================

export interface UserPreferences {
  skiLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  preferredActivities?: string[];
  budgetRange?: 'budget' | 'mid-range' | 'luxury';
  travelingWithKids?: boolean;
  dietaryRestrictions?: string[];
  language?: string;
  previousVisit?: boolean;
}

// ============================================
// Booking Context (sent to AI)
// ============================================

export interface BookingContext {
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
    serviceCategories: ServiceCategory[];
  };
  selectedProperty?: {
    name: string;
    location: string;
    amenities: string[];
  };
  userPreferences: UserPreferences;
}

// ============================================
// Store State
// ============================================

interface ConciergeState {
  // Chat
  messages: ChatMessage[];
  isTyping: boolean;
  inputValue: string;

  // Voice
  voiceSession: VoiceSession;

  // UI State
  isOpen: boolean;
  isMinimized: boolean;
  activeTab: 'chat' | 'voice';

  // User preferences (learned)
  userPreferences: UserPreferences;

  // Session
  sessionId: string;
  lastInteraction: Date | null;

  // Pending actions
  pendingAction: {
    action: ConciergeAction;
    data: Record<string, unknown>;
  } | null;

  // Quick suggestions
  quickSuggestions: QuickSuggestion[];

  // Actions - Chat
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;
  setInputValue: (value: string) => void;
  setIsTyping: (isTyping: boolean) => void;

  // Actions - Voice
  setVoiceSession: (session: Partial<VoiceSession>) => void;
  startVoiceSession: () => void;
  endVoiceSession: () => void;

  // Actions - UI
  toggleOpen: () => void;
  setIsOpen: (isOpen: boolean) => void;
  setIsMinimized: (isMinimized: boolean) => void;
  setActiveTab: (tab: 'chat' | 'voice') => void;

  // Actions - Preferences
  updatePreferences: (prefs: Partial<UserPreferences>) => void;

  // Actions - Suggestions
  setQuickSuggestions: (suggestions: QuickSuggestion[]) => void;
  clearQuickSuggestions: () => void;

  // Actions - Pending Actions
  setPendingAction: (action: ConciergeAction, data: Record<string, unknown>) => void;
  clearPendingAction: () => void;

  // Actions - Session
  resetSession: () => void;

  // Helpers
  getLastUserMessage: () => ChatMessage | undefined;
  getLastAssistantMessage: () => ChatMessage | undefined;
  getConversationHistory: (limit?: number) => ChatMessage[];
}

// ============================================
// Initial State
// ============================================

const initialVoiceSession: VoiceSession = {
  isActive: false,
  state: 'idle',
};

const initialUserPreferences: UserPreferences = {};

// Generate session ID
const generateSessionId = () => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// ============================================
// Store Implementation
// ============================================

export const useConciergeStore = create<ConciergeState>((set, get) => ({
  // Initial State
  messages: [],
  isTyping: false,
  inputValue: '',
  voiceSession: initialVoiceSession,
  isOpen: false,
  isMinimized: false,
  activeTab: 'chat',
  userPreferences: initialUserPreferences,
  sessionId: generateSessionId(),
  lastInteraction: null,
  pendingAction: null,
  quickSuggestions: [],

  // ============================================
  // Actions - Chat
  // ============================================
  addMessage: (message) => {
    const newMessage: ChatMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };

    set((state) => ({
      messages: [...state.messages, newMessage],
      lastInteraction: new Date(),
    }));
  },

  clearMessages: () => {
    set({ messages: [] });
  },

  setInputValue: (value) => {
    set({ inputValue: value });
  },

  setIsTyping: (isTyping) => {
    set({ isTyping });
  },

  // ============================================
  // Actions - Voice
  // ============================================
  setVoiceSession: (session) => {
    set((state) => ({
      voiceSession: { ...state.voiceSession, ...session },
    }));
  },

  startVoiceSession: () => {
    set({
      voiceSession: {
        isActive: true,
        state: 'listening',
        startTime: new Date(),
      },
    });
  },

  endVoiceSession: () => {
    set({
      voiceSession: initialVoiceSession,
    });
  },

  // ============================================
  // Actions - UI
  // ============================================
  toggleOpen: () => {
    set((state) => ({ isOpen: !state.isOpen, isMinimized: false }));
  },

  setIsOpen: (isOpen) => {
    set({ isOpen, isMinimized: false });
  },

  setIsMinimized: (isMinimized) => {
    set({ isMinimized });
  },

  setActiveTab: (tab) => {
    set({ activeTab: tab });
  },

  // ============================================
  // Actions - Preferences
  // ============================================
  updatePreferences: (prefs) => {
    set((state) => ({
      userPreferences: { ...state.userPreferences, ...prefs },
    }));
  },

  // ============================================
  // Actions - Suggestions
  // ============================================
  setQuickSuggestions: (suggestions) => {
    set({ quickSuggestions: suggestions });
  },

  clearQuickSuggestions: () => {
    set({ quickSuggestions: [] });
  },

  // ============================================
  // Actions - Pending Actions
  // ============================================
  setPendingAction: (action, data) => {
    set({ pendingAction: { action, data } });
  },

  clearPendingAction: () => {
    set({ pendingAction: null });
  },

  // ============================================
  // Actions - Session
  // ============================================
  resetSession: () => {
    set({
      messages: [],
      isTyping: false,
      inputValue: '',
      voiceSession: initialVoiceSession,
      userPreferences: initialUserPreferences,
      sessionId: generateSessionId(),
      lastInteraction: null,
      pendingAction: null,
      quickSuggestions: [],
    });
  },

  // ============================================
  // Helpers
  // ============================================
  getLastUserMessage: () => {
    const messages = get().messages;
    return [...messages].reverse().find((m) => m.role === 'user');
  },

  getLastAssistantMessage: () => {
    const messages = get().messages;
    return [...messages].reverse().find((m) => m.role === 'assistant');
  },

  getConversationHistory: (limit = 10) => {
    const messages = get().messages;
    return messages.slice(-limit);
  },
}));

// ============================================
// Context Builder Helper
// ============================================

export function buildBookingContext(
  bookingState: {
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
    cartAccommodations: { totalPrice: number }[];
    cartServices: { category: ServiceCategory; totalPrice: number }[];
    cartProducts: { totalPrice: number }[];
    selectedProperty?: {
      name: string;
      location: string;
      amenities: string[];
    } | null;
  },
  userPreferences: UserPreferences
): BookingContext {
  const serviceCategories = [...new Set(bookingState.cartServices.map((s) => s.category))];
  const totalAmount =
    bookingState.cartAccommodations.reduce((sum, a) => sum + a.totalPrice, 0) +
    bookingState.cartServices.reduce((sum, s) => sum + s.totalPrice, 0) +
    bookingState.cartProducts.reduce((sum, p) => sum + p.totalPrice, 0);

  return {
    currentStep: bookingState.currentStep,
    currentFlow: bookingState.currentFlow,
    searchParams: bookingState.searchParams,
    cart: {
      accommodationCount: bookingState.cartAccommodations.length,
      serviceCount: bookingState.cartServices.length,
      productCount: bookingState.cartProducts.length,
      totalAmount,
      hasAccommodation: bookingState.cartAccommodations.length > 0,
      serviceCategories,
    },
    selectedProperty: bookingState.selectedProperty
      ? {
          name: bookingState.selectedProperty.name,
          location: bookingState.selectedProperty.location,
          amenities: bookingState.selectedProperty.amenities,
        }
      : undefined,
    userPreferences,
  };
}

// ============================================
// Default Quick Suggestions by Step
// ============================================

export const defaultSuggestionsByStep: Record<string, QuickSuggestion[]> = {
  search: [
    { id: 'sug-1', label: 'Help me choose dates', action: 'none', data: { query: 'What are the best dates to visit Niseko?' } },
    { id: 'sug-2', label: 'Recommend properties', action: 'search_properties', data: {} },
    { id: 'sug-3', label: 'What\'s included?', action: 'none', data: { query: 'What services are typically included with bookings?' } },
  ],
  results: [
    { id: 'sug-4', label: 'Compare properties', action: 'none', data: { query: 'Can you compare the properties for me?' } },
    { id: 'sug-5', label: 'Best for families', action: 'search_properties', data: { filter: 'family' } },
    { id: 'sug-6', label: 'Closest to lift', action: 'search_properties', data: { sort: 'distance' } },
  ],
  services: [
    { id: 'sug-7', label: 'Recommend ski gear', action: 'show_recommendations', data: { category: 'ski_rental' } },
    { id: 'sug-8', label: 'Best for beginners', action: 'search_services', data: { level: 'beginner' } },
    { id: 'sug-9', label: 'What do I need?', action: 'none', data: { query: 'What equipment and services do I need for skiing?' } },
  ],
  cart: [
    { id: 'sug-10', label: 'Review my cart', action: 'get_cart_summary', data: {} },
    { id: 'sug-11', label: 'Any discounts?', action: 'none', data: { query: 'Are there any discounts available?' } },
    { id: 'sug-12', label: 'Add more services', action: 'navigate_to', data: { step: 'services' } },
  ],
  checkout: [
    { id: 'sug-13', label: 'Payment options', action: 'none', data: { query: 'What payment methods do you accept?' } },
    { id: 'sug-14', label: 'Cancellation policy', action: 'none', data: { query: 'What is the cancellation policy?' } },
    { id: 'sug-15', label: 'Need help', action: 'none', data: { query: 'I need help completing my booking' } },
  ],
};
