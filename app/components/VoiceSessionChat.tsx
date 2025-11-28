'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Phone, PhoneOff, Mic, Loader2, Trash2, Settings, UserPlus } from 'lucide-react';
import Link from 'next/link';
import Vapi from '@vapi-ai/web';
import { useConversation } from '@elevenlabs/react';
import VoiceActionModal from './VoiceActionModal';
import { executeClientFunction } from '../utils/clientSideFunctions';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

type VoiceProvider = 'vapi' | 'elevenlabs';

interface VoiceSessionChatProps {
  agentId: string;
  sessionId?: string;
  elevenLabsAgentId?: string; // Optional custom ElevenLabs agent ID
  contextData?: Record<string, unknown>; // Dynamic context data for the agent
  title?: string; // Custom title for the chat header
  subtitle?: string; // Custom subtitle for the chat header
  suggestions?: string[]; // Suggestions to show before chat starts
  avatar?: string; // Avatar image path
  welcomeMessage?: string; // Welcome/intro message about the agent
}

export default function VoiceSessionChat({ agentId, sessionId = 'default', elevenLabsAgentId, contextData, title, subtitle, suggestions, avatar, welcomeMessage }: VoiceSessionChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [provider, setProvider] = useState<VoiceProvider>('elevenlabs');
  const [vapi, setVapi] = useState<Vapi | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isVapiLoading, setIsVapiLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const contextDataRef = useRef<Record<string, unknown> | undefined>(contextData);

  // Keep ref updated with latest contextData
  useEffect(() => {
    contextDataRef.current = contextData;
  }, [contextData]);

  // Conference call state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isAddingPhone, setIsAddingPhone] = useState(false);
  const [conferenceId, setConferenceId] = useState<string>('');

  // Voice Action Modal State
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    actions: Array<{
      label: string;
      onClick: () => void;
      variant?: 'primary' | 'secondary' | 'danger';
    }>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    actions: []
  });

  const agentTools = {
    vapi: ['Registration', 'Event Details', 'Accommodations', 'Dining'],
    elevenlabs: ['Registration', 'Transportation', 'Dietary Needs', 'Inquiries']
  };

  // ElevenLabs conversation
  const elevenLabsConversation = useConversation({
    clientTools: {
      show_modal: async (parameters: { title: string; message: string; type?: string }) => {
        console.log('🔧 ElevenLabs client tool: show_modal', parameters);
        setModalState({
          isOpen: true,
          title: parameters.title,
          message: parameters.message,
          type: (parameters.type as 'success' | 'error' | 'info' | 'warning') || 'info',
          actions: []
        });
        return `Showed modal: ${parameters.title}`;
      },
      show_success: async (parameters: { message: string }) => {
        console.log('🔧 ElevenLabs client tool: show_success', parameters);
        setModalState({
          isOpen: true,
          title: 'Success',
          message: parameters.message,
          type: 'success',
          actions: []
        });
        return `Showed success message: ${parameters.message}`;
      },
      show_error: async (parameters: { message: string }) => {
        console.log('🔧 ElevenLabs client tool: show_error', parameters);
        setModalState({
          isOpen: true,
          title: 'Error',
          message: parameters.message,
          type: 'error',
          actions: []
        });
        return `Showed error message: ${parameters.message}`;
      },
      show_confirmation: async (parameters: { title: string; message: string }) => {
        console.log('🔧 ElevenLabs client tool: show_confirmation', parameters);
        return new Promise((resolve) => {
          setModalState({
            isOpen: true,
            title: parameters.title,
            message: parameters.message,
            type: 'info',
            actions: [
              { label: 'Confirm', onClick: () => resolve('confirmed') },
              { label: 'Cancel', onClick: () => resolve('cancelled') }
            ]
          });
        });
      },
      navigate_to: async (parameters: { path: string }) => {
        console.log('🔧 ElevenLabs client tool: navigate_to', parameters);
        window.location.href = parameters.path;
        return `Navigating to: ${parameters.path}`;
      },
      end_call: async () => {
        console.log('🔧 ElevenLabs client tool: end_call');
        elevenLabsConversation.endSession();
        return 'Call ended';
      },
      get_context: async () => {
        console.log('🔧 ElevenLabs client tool: get_context', contextDataRef.current);
        if (contextDataRef.current) {
          return JSON.stringify(contextDataRef.current);
        }
        return 'No context data available';
      },
      request_service: async (parameters: { service_type: string; details: string; preferred_time?: string }) => {
        console.log('🔧 ElevenLabs client tool: request_service', parameters);
        // First, highlight the quick action button
        window.dispatchEvent(new CustomEvent('service-processing', {
          detail: { serviceType: parameters.service_type }
        }));
        // Dispatch event to update guest page
        const event = new CustomEvent('service-request', {
          detail: {
            type: parameters.service_type,
            details: parameters.details,
            time: parameters.preferred_time || 'As soon as possible'
          }
        });
        window.dispatchEvent(event);
        // Show confirmation modal
        setModalState({
          isOpen: true,
          title: 'Request Confirmed',
          message: `Your ${parameters.service_type.replace(/_/g, ' ')} request has been submitted. ${parameters.details}`,
          type: 'success',
          actions: []
        });
        return `Service request confirmed: ${parameters.service_type} - ${parameters.details}`;
      },
      book_activity: async (parameters: { activity_type: string; date: string; time: string; details?: string }) => {
        console.log('🔧 ElevenLabs client tool: book_activity', parameters);
        // Highlight the quick action button (activity_type maps to serviceType)
        window.dispatchEvent(new CustomEvent('service-processing', {
          detail: { serviceType: parameters.activity_type }
        }));
        // Dispatch event to update schedule
        const event = new CustomEvent('update-schedule', {
          detail: {
            action: 'add',
            title: parameters.activity_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            time: `${parameters.date}, ${parameters.time}`,
            location: parameters.details || 'To be confirmed',
            status: 'pending'
          }
        });
        window.dispatchEvent(event);
        // Show confirmation modal
        setModalState({
          isOpen: true,
          title: 'Booking Requested',
          message: `Your ${parameters.activity_type.replace(/_/g, ' ')} booking for ${parameters.date} at ${parameters.time} is being processed.`,
          type: 'success',
          actions: []
        });
        return `Activity booked: ${parameters.activity_type} on ${parameters.date} at ${parameters.time}`;
      },
      update_schedule: async (parameters: { action: string; title: string; time?: string; location?: string; status?: string }) => {
        console.log('🔧 ElevenLabs client tool: update_schedule', parameters);
        const event = new CustomEvent('update-schedule', { detail: parameters });
        window.dispatchEvent(event);
        return `Schedule updated: ${parameters.action} - ${parameters.title}`;
      },
      show_registration_summary: async (parameters: {
        guestName: string;
        company?: string;
        email?: string;
        phone?: string;
        totalGuests?: number;
        children?: string;
        transportation?: string;
        dietary?: string;
        timing?: string;
        overnight?: boolean;
        remarks?: string;
      }) => {
        console.log('🔧 ElevenLabs client tool: show_registration_summary', parameters);
        // Dispatch event to show inline in HotelPages
        const event = new CustomEvent('show-registration', { detail: parameters });
        window.dispatchEvent(event);
        return `Showed registration summary for ${parameters.guestName}`;
      },
      registration_complete: async (parameters: { guestName: string }) => {
        console.log('🔧 ElevenLabs client tool: registration_complete', parameters);
        // Dispatch event to show completion inline
        const event = new CustomEvent('registration-complete', { detail: parameters });
        window.dispatchEvent(event);
        return `Registration completed for ${parameters.guestName}`;
      },
      navigate_tab: async (parameters: { tab: string }) => {
        console.log('🔧 ElevenLabs client tool: navigate_tab', parameters);
        // Also dispatch show-info-panel for new experience page
        const event = new CustomEvent('show-info-panel', { detail: { panel: parameters.tab } });
        window.dispatchEvent(event);
        // Legacy support
        const legacyEvent = new CustomEvent('navigate-tab', { detail: { tab: parameters.tab } });
        window.dispatchEvent(legacyEvent);
        return `Showing ${parameters.tab} information`;
      },
      // Live Registration Tools
      update_registration_field: async (parameters: { field: string; value: string }) => {
        console.log('🔧 ElevenLabs client tool: update_registration_field', parameters);
        const event = new CustomEvent('update-registration-field', {
          detail: { field: parameters.field, value: parameters.value }
        });
        window.dispatchEvent(event);
        return `Updated ${parameters.field} to ${parameters.value}`;
      },
      show_info_panel: async (parameters: { panel: string }) => {
        console.log('🔧 ElevenLabs client tool: show_info_panel', parameters);
        const event = new CustomEvent('show-info-panel', { detail: { panel: parameters.panel } });
        window.dispatchEvent(event);
        return `Showing ${parameters.panel} information panel`;
      },
      hide_info_panel: async () => {
        console.log('🔧 ElevenLabs client tool: hide_info_panel');
        const event = new CustomEvent('hide-info-panel', {});
        window.dispatchEvent(event);
        return 'Info panel hidden';
      },
      mark_registration_complete: async (parameters: { guestName: string }) => {
        console.log('🔧 ElevenLabs client tool: mark_registration_complete', parameters);
        const event = new CustomEvent('registration-complete', { detail: { guestName: parameters.guestName } });
        window.dispatchEvent(event);
        return `Registration completed for ${parameters.guestName}`;
      },
      // Tea Shop Tools
      tea_show_product: async (parameters: { productId: string }) => {
        console.log('🔧 ElevenLabs client tool: tea_show_product', parameters);
        const event = new CustomEvent('tea-show-product', { detail: { productId: parameters.productId } });
        window.dispatchEvent(event);
        return `Showing product details for ${parameters.productId}`;
      },
      tea_add_to_cart: async (parameters: { productId: string; quantity?: number }) => {
        console.log('🔧 ElevenLabs client tool: tea_add_to_cart', parameters);
        const event = new CustomEvent('tea-add-to-cart', {
          detail: { productId: parameters.productId, quantity: parameters.quantity || 1 }
        });
        window.dispatchEvent(event);
        return `Added ${parameters.quantity || 1} of ${parameters.productId} to cart`;
      },
      tea_show_cart: async () => {
        console.log('🔧 ElevenLabs client tool: tea_show_cart');
        const event = new CustomEvent('tea-show-cart', {});
        window.dispatchEvent(event);
        return 'Showing cart';
      },
      tea_confirm_order: async () => {
        console.log('🔧 ElevenLabs client tool: tea_confirm_order');
        const event = new CustomEvent('tea-confirm-order', {});
        window.dispatchEvent(event);
        return 'Order confirmed';
      },
      tea_filter_category: async (parameters: { category: string }) => {
        console.log('🔧 ElevenLabs client tool: tea_filter_category', parameters);
        const event = new CustomEvent('tea-filter-category', { detail: { category: parameters.category } });
        window.dispatchEvent(event);
        return `Filtered to ${parameters.category} category`;
      },
      // Hotel Boutique Tools
      shop_show_product: async (parameters: { productId: string }) => {
        console.log('🔧 ElevenLabs client tool: shop_show_product', parameters);
        const event = new CustomEvent('shop-show-product', { detail: { productId: parameters.productId } });
        window.dispatchEvent(event);
        return `Showing product details for ${parameters.productId}`;
      },
      shop_add_to_cart: async (parameters: { productId: string; quantity?: number }) => {
        console.log('🔧 ElevenLabs client tool: shop_add_to_cart', parameters);
        const event = new CustomEvent('shop-add-to-cart', {
          detail: { productId: parameters.productId, quantity: parameters.quantity || 1 }
        });
        window.dispatchEvent(event);
        return `Added ${parameters.quantity || 1} of ${parameters.productId} to order`;
      },
      shop_show_cart: async () => {
        console.log('🔧 ElevenLabs client tool: shop_show_cart');
        const event = new CustomEvent('shop-show-cart', {});
        window.dispatchEvent(event);
        return 'Showing order';
      },
      shop_confirm_order: async () => {
        console.log('🔧 ElevenLabs client tool: shop_confirm_order');
        const event = new CustomEvent('shop-confirm-order', {});
        window.dispatchEvent(event);
        return 'Order confirmed';
      },
      shop_remove_from_cart: async (parameters: { productId: string }) => {
        console.log('🔧 ElevenLabs client tool: shop_remove_from_cart', parameters);
        const event = new CustomEvent('shop-remove-from-cart', { detail: { productId: parameters.productId } });
        window.dispatchEvent(event);
        return `Removed ${parameters.productId} from order`;
      },
      shop_clear_cart: async () => {
        console.log('🔧 ElevenLabs client tool: shop_clear_cart');
        const event = new CustomEvent('shop-clear-cart', {});
        window.dispatchEvent(event);
        return 'Order cleared';
      },
      shop_close_product: async () => {
        console.log('🔧 ElevenLabs client tool: shop_close_product');
        const event = new CustomEvent('shop-close-product', {});
        window.dispatchEvent(event);
        return 'Product modal closed';
      }
    },
    onConnect: () => {
      setIsCallActive(true);
      setIsVapiLoading(false);
      console.log('✅ ElevenLabs connected with client tools');
    },
    onDisconnect: () => {
      setIsCallActive(false);
      setIsVapiLoading(false);
    },
    onMessage: (message) => {
      setMessages(prev => {
        const lastMsg = prev[prev.length - 1];
        const role = message.source === 'user' ? 'user' : 'assistant';

        // Update last message if same role and within 2 seconds
        if (lastMsg && lastMsg.role === role && Date.now() - lastMsg.timestamp < 2000) {
          return [...prev.slice(0, -1), { ...lastMsg, content: message.message }];
        }
        return [...prev, { role, content: message.message, timestamp: Date.now() }];
      });
    },
    onError: (error) => {
      console.error('ElevenLabs error:', error);
      setIsVapiLoading(false);
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Listen for external messages (from quick actions, etc.)
  useEffect(() => {
    const handleExternalMessage = (event: CustomEvent<{ message: string }>) => {
      const { message } = event.detail;

      // Add as user message
      const userMessage: Message = {
        role: 'user',
        content: message,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, userMessage]);

      // Send to active provider if call is active
      if (isCallActive) {
        if (provider === 'vapi' && vapi) {
          vapi.send({
            type: 'add-message',
            message: {
              role: 'user',
              content: message
            }
          });
        }
        // ElevenLabs doesn't support text messages during calls
      }
    };

    window.addEventListener('send-chat-message', handleExternalMessage as EventListener);
    return () => {
      window.removeEventListener('send-chat-message', handleExternalMessage as EventListener);
    };
  }, [isCallActive, provider, vapi]);

  // Initialize VAPI
  useEffect(() => {
    if (provider !== 'vapi') return;

    const vapiInstance = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || '');
    setVapi(vapiInstance);

    vapiInstance.on('call-start', () => {
      setIsCallActive(true);
      setIsVapiLoading(false);
    });

    vapiInstance.on('call-end', () => {
      setIsCallActive(false);
      setIsVapiLoading(false);
    });

    vapiInstance.on('message', async (message: any) => {
      console.log('🔵 VAPI Message:', {
        type: message.type,
        role: message.role,
        transcriptType: message.transcriptType,
        transcript: message.transcript,
        fullMessage: message
      });

      // Handle client-side function calls (OpenAI format from VAPI)
      if (message.type === 'model-output' && message.output && Array.isArray(message.output)) {
        const functionCalls = message.output.filter((item: any) => item.type === 'function');

        for (const functionCall of functionCalls) {
          const functionName = functionCall.function.name;
          const functionCallId = functionCall.id;

          // Parse arguments if they're a JSON string
          let parameters = {};
          try {
            parameters = typeof functionCall.function.arguments === 'string'
              ? JSON.parse(functionCall.function.arguments)
              : functionCall.function.arguments;
          } catch (e) {
            console.error('Failed to parse function arguments:', e);
          }

          console.log('🔧 Client-side function call:', { functionName, parameters, functionCallId });

          try {
            // Execute the function with context
            const result = await executeClientFunction(
              functionName,
              parameters,
              {
                showModal: (modalParams) => {
                  setModalState({
                    isOpen: true,
                    title: modalParams.title,
                    message: modalParams.message,
                    type: modalParams.type || 'info',
                    actions: modalParams.actions || []
                  });
                },
                endCall: endCall,
                updateState: (key: string, value: any) => {
                  console.log('State update:', key, value);
                }
              }
            );

            console.log('✅ Function executed successfully:', result);

            // Add function execution to chat
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: `✓ ${functionName}`,
              timestamp: Date.now()
            }]);

          } catch (error: any) {
            console.error('❌ Function execution error:', error);

            // Add error to chat
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: `✗ Error: ${error.message}`,
              timestamp: Date.now()
            }]);
          }
        }
      }

      if (message.type === 'transcript') {
        const isPartial = message.transcriptType === 'partial';
        const isFinal = message.transcriptType === 'final';
        const role = message.role;

        setMessages(prev => {
          const lastMsg = prev[prev.length - 1];

          console.log('📝 Message State:', {
            isPartial,
            isFinal,
            role,
            transcript: message.transcript,
            lastMsg: lastMsg ? { role: lastMsg.role, content: lastMsg.content } : null
          });

          // If same role as last message: UPDATE (for both partial and final)
          if (lastMsg && lastMsg.role === role) {
            console.log('✏️ UPDATING last message');
            return [...prev.slice(0, -1), { ...lastMsg, content: message.transcript, timestamp: Date.now() }];
          }

          // If different role or no last message: ADD new message
          console.log('➕ ADDING new message');
          return [...prev, { role, content: message.transcript, timestamp: Date.now() }];
        });
      }
    });

    vapiInstance.on('error', (error) => {
      console.error('VAPI error:', error);
      setIsVapiLoading(false);
    });

    return () => {
      vapiInstance.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider]);

  const startCall = async () => {
    setIsVapiLoading(true);
    try {
      if (provider === 'vapi' && vapi) {
        await vapi.start(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || '');
      } else if (provider === 'elevenlabs') {
        await elevenLabsConversation.startSession({
          agentId: elevenLabsAgentId || process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || '',
        });
      }
    } catch (error) {
      console.error('Failed to start call:', error);
      setIsVapiLoading(false);
    }
  };

  const endCall = async () => {
    if (provider === 'vapi' && vapi) {
      vapi.stop();
    } else if (provider === 'elevenlabs') {
      elevenLabsConversation.endSession();
    }
  };

  const addPhoneToCall = async () => {
    if (!phoneNumber.trim()) {
      alert('Please enter a phone number');
      return;
    }

    setIsAddingPhone(true);
    try {
      // Generate conference ID if not already set
      const confId = conferenceId || `conf-${Date.now()}`;
      if (!conferenceId) {
        setConferenceId(confId);
      }

      console.log('📞 Adding phone to conference:', { phoneNumber, conferenceId: confId, provider });

      if (provider === 'elevenlabs') {
        // For ElevenLabs: Start Twilio conference with AI + phone
        const response = await fetch('/api/twilio/start-conference', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            conferenceId: confId,
            phoneNumbers: [phoneNumber.trim()],
            agentId: elevenLabsAgentId || process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || data.message || 'Failed to start conference');
        }

        console.log('✅ ElevenLabs conference started:', data);

        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `📞 Starting 3-way conference with ElevenLabs AI. Calling ${phoneNumber}...`,
          timestamp: Date.now()
        }]);
      } else if (provider === 'vapi') {
        // For VAPI: Use existing phone call API
        const response = await fetch('/api/vapi/call-phone', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            phoneNumber: phoneNumber.trim(),
            conferenceId: confId
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to add phone');
        }

        console.log('✅ Phone added to VAPI conference:', data);

        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `📞 Calling ${phoneNumber}... They will join the conversation shortly.`,
          timestamp: Date.now()
        }]);
      } else {
        throw new Error(`Conference calling not supported for provider: ${provider}`);
      }

      // Clear phone input
      setPhoneNumber('');

    } catch (error) {
      console.error('Error adding phone:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to add phone to call';
      alert(errorMessage);

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `❌ ${errorMessage}`,
        timestamp: Date.now()
      }]);
    } finally {
      setIsAddingPhone(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageText = input;
    setInput('');
    setIsLoading(true);

    try {
      if (provider === 'vapi' && vapi && isCallActive) {
        vapi.send({
          type: 'add-message',
          message: {
            role: 'user',
            content: messageText
          }
        });
      } else if (provider === 'elevenlabs' && isCallActive) {
        // ElevenLabs uses audio input, not text messages
        console.log('Text messages not supported in ElevenLabs - use voice input');
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Header - Always visible */}
      <div className="px-5 py-4 border-b border-stone-100">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-stone-100">
            <img
              src={avatar || '/avatars/assistant-avatar.jpg'}
              alt={title || 'Concierge'}
              className="w-full h-full object-cover"
            />
          </div>
          {/* Name & Status */}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-medium text-stone-800" style={{ fontFamily: 'var(--font-cormorant)' }}>
              {title || 'Concierge'}
            </h2>
            {isCallActive ? (
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-green-600">Connected</span>
              </div>
            ) : (
              <p className="text-xs text-stone-400">AI Assistant</p>
            )}
          </div>
          {/* Clear Button - Only when messages exist */}
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              aria-label="Clear chat"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && !isCallActive && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            {/* Welcome Message */}
            <p className="text-sm text-stone-600 leading-relaxed max-w-[280px]">
              {welcomeMessage || 'I\'m here to help. Tap below to start a conversation.'}
            </p>

            {/* Suggestions */}
            {suggestions && suggestions.length > 0 && (
              <div className="mt-8 w-full">
                <p className="text-[10px] uppercase tracking-wider text-stone-400 mb-3">Try saying</p>
                <div className="space-y-2">
                  {suggestions.map((suggestion, idx) => (
                    <div
                      key={idx}
                      className="px-4 py-2.5 text-sm text-stone-600 bg-stone-50 rounded-xl text-left"
                    >
                      "{suggestion}"
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {messages.length === 0 && isCallActive && (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-xs font-medium">
              <Mic className="w-3.5 h-3.5 animate-pulse" />
              <span>Listening...</span>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                msg.role === 'user'
                  ? 'bg-stone-800 text-white'
                  : 'bg-white text-stone-800 shadow-sm'
              }`}
            >
              <p className="text-sm leading-relaxed">{msg.content}</p>
              <p className={`text-xs mt-1 ${
                msg.role === 'user' ? 'text-stone-400' : 'text-stone-400'
              }`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Controls */}
      <div className="p-4 border-t border-stone-100">
        {!isCallActive ? (
          /* Speak Button - Initial State */
          <button
            id="voice-call-button"
            onClick={startCall}
            disabled={isVapiLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm bg-stone-800 text-white hover:bg-stone-700 rounded-full transition-colors disabled:opacity-50"
          >
            {isVapiLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Phone className="w-4 h-4" />
                <span>Speak with Concierge</span>
              </>
            )}
          </button>
        ) : (
          /* Chat Active - Input with Send and End buttons */
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-white border border-stone-200 rounded-full text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300 disabled:opacity-50"
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="p-2 text-stone-600 hover:text-stone-800 disabled:opacity-30 transition-colors"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
            <button
              id="voice-call-button"
              onClick={endCall}
              className="p-2 text-red-500 hover:text-red-600 transition-colors"
              aria-label="End call"
            >
              <PhoneOff className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Voice Action Modal */}
      <VoiceActionModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        actions={modalState.actions}
      />
    </div>
  );
}
