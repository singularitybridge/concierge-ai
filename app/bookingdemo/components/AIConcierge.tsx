'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  MessageCircle,
  Mic,
  MicOff,
  Send,
  X,
  Minus,
  ChevronUp,
  Bot,
  User,
  Sparkles,
  Volume2,
  VolumeX,
  RefreshCw,
  ShoppingCart,
  ArrowRight,
  Loader2,
  Check,
  Plus,
  Settings,
  HelpCircle,
} from 'lucide-react';
import Vapi from '@vapi-ai/web';
import {
  useConciergeStore,
  ChatMessage,
  QuickSuggestion,
  defaultSuggestionsByStep,
  buildBookingContext,
  ConciergeAction,
} from '../../store/conciergeStore';
import { useBookingStore, BookingStep } from '../../store/bookingStore';
import { useUpsellStore } from '../../store/upsellStore';

// ============================================
// Concierge Configuration
// ============================================

const CONCIERGE_CONFIG = {
  name: 'Yuki',
  subtitle: 'Booking Assistant',
  welcomeMessage: "Hi! I'm Yuki, your ski trip booking assistant. I can help you find the perfect accommodation, recommend ski equipment, and answer any questions. How can I help you today?",
  typingDelay: 50, // ms per character for typing effect
  voiceEnabled: true,
};

// ============================================
// AI Concierge Component
// ============================================

export function AIConcierge() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [vapi, setVapi] = useState<Vapi | null>(null);
  const [isVapiReady, setIsVapiReady] = useState(false);

  // Concierge store
  const {
    messages,
    isTyping,
    inputValue,
    voiceSession,
    isOpen,
    isMinimized,
    activeTab,
    quickSuggestions,
    sessionId,
    addMessage,
    setInputValue,
    setIsTyping,
    setVoiceSession,
    startVoiceSession,
    endVoiceSession,
    toggleOpen,
    setIsOpen,
    setIsMinimized,
    setActiveTab,
    setQuickSuggestions,
    userPreferences,
    updatePreferences,
  } = useConciergeStore();

  // Booking store
  const {
    currentStep,
    currentFlow,
    searchParams,
    cartAccommodations,
    cartServices,
    cartProducts,
    selectedProperty,
    availableServices,
    addServiceToCart,
    setCurrentStep,
    getCartTotal,
  } = useBookingStore();

  // Initialize VAPI
  useEffect(() => {
    const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
    if (!publicKey) {
      console.warn('VAPI public key not configured');
      return;
    }

    const vapiInstance = new Vapi(publicKey);
    setVapi(vapiInstance);

    vapiInstance.on('call-start', () => {
      setVoiceSession({ isActive: true, state: 'listening' });
    });

    vapiInstance.on('call-end', () => {
      endVoiceSession();
    });

    vapiInstance.on('speech-start', () => {
      setVoiceSession({ state: 'speaking' });
    });

    vapiInstance.on('speech-end', () => {
      setVoiceSession({ state: 'listening' });
    });

    vapiInstance.on('message', (message: any) => {
      if (message.type === 'transcript' && message.transcriptType === 'final') {
        // User's speech was transcribed
        if (message.role === 'user') {
          addMessage({
            role: 'user',
            type: 'voice',
            content: message.transcript,
            metadata: { voiceDuration: message.duration },
          });
        } else if (message.role === 'assistant') {
          addMessage({
            role: 'assistant',
            type: 'voice',
            content: message.transcript,
          });
        }
      }
    });

    vapiInstance.on('error', (error: any) => {
      console.error('VAPI error:', error);
      setVoiceSession({ state: 'error', error: error.message });
    });

    setIsVapiReady(true);

    return () => {
      vapiInstance.stop();
    };
  }, []);

  // Add welcome message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      addMessage({
        role: 'assistant',
        type: 'text',
        content: CONCIERGE_CONFIG.welcomeMessage,
        metadata: {
          suggestions: defaultSuggestionsByStep[currentStep] || [],
        },
      });
      setQuickSuggestions(defaultSuggestionsByStep[currentStep] || []);
    }
  }, [isOpen, messages.length, currentStep]);

  // Update suggestions when step changes
  useEffect(() => {
    const suggestions = defaultSuggestionsByStep[currentStep] || [];
    setQuickSuggestions(suggestions);
  }, [currentStep]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Build context for AI
  const buildContext = useCallback(() => {
    return buildBookingContext(
      {
        currentStep,
        currentFlow,
        searchParams,
        cartAccommodations,
        cartServices,
        cartProducts,
        selectedProperty,
      },
      userPreferences
    );
  }, [currentStep, currentFlow, searchParams, cartAccommodations, cartServices, cartProducts, selectedProperty, userPreferences]);

  // Send message to AI
  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Add user message
    addMessage({
      role: 'user',
      type: 'text',
      content: content.trim(),
    });

    setInputValue('');
    setIsTyping(true);

    try {
      const context = buildContext();

      const response = await fetch('/api/ai-concierge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          context,
          sessionId,
          conversationHistory: messages.slice(-6).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();

      // Handle AI response
      addMessage({
        role: 'assistant',
        type: 'text',
        content: data.message,
        metadata: {
          actionType: data.action,
          actionData: data.actionData,
          suggestions: data.suggestions,
        },
      });

      // Handle actions
      if (data.action && data.action !== 'none') {
        handleAction(data.action, data.actionData);
      }

      // Update suggestions
      if (data.suggestions) {
        setQuickSuggestions(data.suggestions);
      }

      // Update preferences if learned
      if (data.learnedPreferences) {
        updatePreferences(data.learnedPreferences);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      addMessage({
        role: 'assistant',
        type: 'error',
        content: "I'm sorry, I encountered an error. Please try again.",
      });
    } finally {
      setIsTyping(false);
    }
  };

  // Handle actions from AI
  const handleAction = (action: ConciergeAction, data?: Record<string, unknown>) => {
    switch (action) {
      case 'navigate_to':
        if (data?.step) {
          setCurrentStep(data.step as BookingStep);
        }
        break;
      case 'add_to_cart':
        if (data?.serviceId) {
          const service = availableServices.find((s) => s.id === data.serviceId);
          if (service) {
            addServiceToCart({
              id: `svc-${Date.now()}`,
              serviceId: service.id,
              serviceName: service.name,
              vendorName: service.vendorName,
              category: service.category,
              date: searchParams.checkIn,
              quantity: 1,
              participants: searchParams.adults + searchParams.children,
              pricePerUnit: service.price,
              totalPrice: service.price,
            });
          }
        }
        break;
      case 'checkout':
        setCurrentStep('checkout');
        break;
      default:
        break;
    }
  };

  // Handle quick suggestion click
  const handleSuggestionClick = (suggestion: QuickSuggestion) => {
    if (suggestion.action === 'none' && suggestion.data?.query) {
      sendMessage(suggestion.data.query as string);
    } else {
      handleAction(suggestion.action, suggestion.data);
    }
  };

  // Handle voice toggle
  const toggleVoice = async () => {
    if (!vapi || !isVapiReady) return;

    if (voiceSession.isActive) {
      vapi.stop();
      endVoiceSession();
    } else {
      const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
      if (!assistantId) {
        console.error('VAPI assistant ID not configured');
        return;
      }

      startVoiceSession();

      try {
        // Start with booking context and English language
        const context = buildContext();
        await vapi.start(assistantId, {
          transcriber: {
            provider: 'deepgram',
            language: 'en',
          },
          metadata: {
            bookingContext: context,
            sessionId,
          },
        } as any);
      } catch (error) {
        console.error('Failed to start voice session:', error);
        setVoiceSession({ state: 'error', error: 'Failed to start voice session' });
      }
    }
  };

  // Handle input submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      maximumFractionDigits: 0,
    }).format(price);
  };

  // ============================================
  // Render
  // ============================================

  // Floating button when closed
  if (!isOpen) {
    return (
      <button
        onClick={toggleOpen}
        className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-full shadow-lg transition-all hover:scale-105 group"
        aria-label="Open AI Assistant"
      >
        <div className="relative">
          <Bot className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
        </div>
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-white text-slate-800 text-sm font-medium rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Need help? Ask Yuki!
        </span>
      </button>
    );
  }

  // Minimized state
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden w-80">
        <button
          onClick={() => setIsMinimized(false)}
          className="w-full flex items-center gap-3 p-4 hover:bg-white/5 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-white">{CONCIERGE_CONFIG.name}</p>
            <p className="text-xs text-white/60">{CONCIERGE_CONFIG.subtitle}</p>
          </div>
          <ChevronUp className="w-5 h-5 text-white/60" />
        </button>
      </div>
    );
  }

  // Full panel
  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] max-h-[80vh] bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-white/10 bg-gradient-to-r from-amber-500/10 to-orange-500/10">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-white flex items-center gap-2">
            {CONCIERGE_CONFIG.name}
            <span className="w-2 h-2 bg-emerald-400 rounded-full" />
          </p>
          <p className="text-xs text-white/60">{CONCIERGE_CONFIG.subtitle}</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(true)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Minimize"
          >
            <Minus className="w-4 h-4 text-white/60" />
          </button>
          <button
            onClick={toggleOpen}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-white/60" />
          </button>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex border-b border-white/10">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
            activeTab === 'chat'
              ? 'text-amber-400 border-b-2 border-amber-400'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          Chat
        </button>
        <button
          onClick={() => setActiveTab('voice')}
          className={`flex-1 py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
            activeTab === 'voice'
              ? 'text-amber-400 border-b-2 border-amber-400'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <Mic className="w-4 h-4" />
          Voice
          {voiceSession.isActive && (
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          )}
        </button>
      </div>

      {/* Chat Tab */}
      {activeTab === 'chat' && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} formatPrice={formatPrice} />
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white/10 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          {quickSuggestions.length > 0 && (
            <div className="px-4 pb-2">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {quickSuggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-3 py-1.5 bg-white/10 hover:bg-amber-500/20 border border-white/20 hover:border-amber-500/30 rounded-full text-xs text-white/80 hover:text-amber-400 whitespace-nowrap transition-colors"
                  >
                    {suggestion.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-white/10">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder:text-white/40 focus:outline-none focus:border-amber-500/50"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/50 text-white rounded-xl transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </>
      )}

      {/* Voice Tab */}
      {activeTab === 'voice' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          {/* Voice visualization */}
          <div className="relative mb-8">
            <div
              className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${
                voiceSession.isActive
                  ? voiceSession.state === 'speaking'
                    ? 'bg-gradient-to-br from-amber-500 to-orange-600 animate-pulse'
                    : voiceSession.state === 'listening'
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                    : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                  : 'bg-white/10'
              }`}
            >
              {voiceSession.isActive ? (
                voiceSession.state === 'speaking' ? (
                  <Volume2 className="w-12 h-12 text-white" />
                ) : voiceSession.state === 'listening' ? (
                  <Mic className="w-12 h-12 text-white animate-pulse" />
                ) : (
                  <Loader2 className="w-12 h-12 text-white animate-spin" />
                )
              ) : (
                <MicOff className="w-12 h-12 text-white/40" />
              )}
            </div>

            {/* Ripple effect when active */}
            {voiceSession.isActive && (
              <>
                <div className="absolute inset-0 rounded-full border-2 border-amber-500/30 animate-ping" />
                <div className="absolute inset-0 rounded-full border-2 border-amber-500/20 animate-ping" style={{ animationDelay: '300ms' }} />
              </>
            )}
          </div>

          {/* Status text */}
          <p className="text-white text-lg font-medium mb-2">
            {voiceSession.isActive
              ? voiceSession.state === 'speaking'
                ? 'Yuki is speaking...'
                : voiceSession.state === 'listening'
                ? "I'm listening..."
                : 'Processing...'
              : 'Tap to start voice chat'}
          </p>
          <p className="text-white/60 text-sm mb-8">
            {voiceSession.isActive
              ? 'Speak naturally, I\'ll help you with your booking'
              : 'Talk to Yuki using your voice'}
          </p>

          {/* Voice button */}
          <button
            onClick={toggleVoice}
            disabled={!isVapiReady}
            className={`px-8 py-4 rounded-2xl font-medium transition-all flex items-center gap-3 ${
              voiceSession.isActive
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-amber-500 hover:bg-amber-600 text-white'
            } disabled:opacity-50`}
          >
            {voiceSession.isActive ? (
              <>
                <MicOff className="w-5 h-5" />
                End Conversation
              </>
            ) : (
              <>
                <Mic className="w-5 h-5" />
                Start Voice Chat
              </>
            )}
          </button>

          {/* Error message */}
          {voiceSession.error && (
            <p className="mt-4 text-sm text-red-400">{voiceSession.error}</p>
          )}

          {/* Voice transcript */}
          {voiceSession.transcript && (
            <div className="mt-6 p-4 bg-white/5 rounded-xl max-w-full">
              <p className="text-xs text-white/40 mb-1">You said:</p>
              <p className="text-sm text-white">{voiceSession.transcript}</p>
            </div>
          )}
        </div>
      )}

      {/* Cart Summary Footer */}
      {(cartAccommodations.length > 0 || cartServices.length > 0) && (
        <div className="p-3 border-t border-white/10 bg-white/5">
          <button
            onClick={() => setCurrentStep('cart')}
            className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-white/70">
                {cartAccommodations.length + cartServices.length} items in cart
              </span>
            </div>
            <span className="text-sm font-medium text-amber-400">{formatPrice(getCartTotal())}</span>
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================
// Message Bubble Component
// ============================================

interface MessageBubbleProps {
  message: ChatMessage;
  formatPrice: (price: number) => string;
}

function MessageBubble({ message, formatPrice }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isError = message.type === 'error';

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser
            ? 'bg-white/20'
            : isError
            ? 'bg-red-500/20'
            : 'bg-gradient-to-br from-amber-500 to-orange-600'
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className={`w-4 h-4 ${isError ? 'text-red-400' : 'text-white'}`} />
        )}
      </div>

      {/* Message content */}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-amber-500 text-white rounded-tr-sm'
            : isError
            ? 'bg-red-500/10 border border-red-500/30 text-red-300 rounded-tl-sm'
            : 'bg-white/10 text-white rounded-tl-sm'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>

        {/* Voice indicator */}
        {message.type === 'voice' && (
          <div className="flex items-center gap-1 mt-2 text-xs opacity-60">
            <Mic className="w-3 h-3" />
            <span>Voice message</span>
          </div>
        )}

        {/* Action result */}
        {message.metadata?.actionType && message.metadata.actionType !== 'none' && (
          <div className="mt-2 pt-2 border-t border-white/10 flex items-center gap-2 text-xs text-amber-400">
            <Check className="w-3 h-3" />
            <span>Action: {message.metadata.actionType.replace('_', ' ')}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default AIConcierge;
