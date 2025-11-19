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
}

export default function VoiceSessionChat({ agentId, sessionId = 'default' }: VoiceSessionChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [provider, setProvider] = useState<VoiceProvider>('vapi');
  const [vapi, setVapi] = useState<Vapi | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isVapiLoading, setIsVapiLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
        const event = new CustomEvent('navigate-tab', { detail: { tab: parameters.tab } });
        window.dispatchEvent(event);
        return `Navigated to ${parameters.tab} tab`;
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
          agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || '',
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
            agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID
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
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3">
        {/* Title Row */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-2xl font-light text-stone-800 tracking-wide" style={{ fontFamily: 'var(--font-cormorant)' }}>Concierge <span className="text-stone-400">AI</span></h2>
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              aria-label="Clear chat"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Voice Provider Selector */}
        {!isCallActive && (
          <div className="mb-3">
            <p className="text-xs text-stone-400 mb-2">Voice Provider</p>
            <div className="flex gap-3">
              <button
                onClick={() => setProvider('vapi')}
                className={`text-xs transition-colors ${
                  provider === 'vapi'
                    ? 'text-stone-800'
                    : 'text-stone-400 hover:text-stone-600'
                }`}
              >
                VAPI
              </button>
              <button
                onClick={() => setProvider('elevenlabs')}
                className={`text-xs transition-colors ${
                  provider === 'elevenlabs'
                    ? 'text-stone-800'
                    : 'text-stone-400 hover:text-stone-600'
                }`}
              >
                ElevenLabs
              </button>
            </div>
          </div>
        )}

        {/* Agent Info */}
        <div className="mb-3 p-4 bg-white rounded-lg border border-stone-200">
          <div className="flex items-start gap-3 mb-3">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full border border-stone-200 shadow-sm overflow-hidden">
                <img
                  src="/avatars/assistant-avatar.jpg"
                  alt="Hotel Concierge"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium text-stone-800">
                  {provider === 'vapi' && 'Hotel Concierge'}
                  {provider === 'elevenlabs' && 'Guest Services'}
                </h3>
                {provider === 'vapi' && (
                  <Link
                    href="/vapi"
                    className="p-1 text-stone-500 hover:bg-stone-100 rounded transition-colors"
                    aria-label="Settings"
                  >
                    <Settings className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
              <p className="text-xs text-stone-500 mt-1">
                {provider === 'vapi' && 'Reservations & local recommendations'}
                {provider === 'elevenlabs' && 'Real-time guest assistance'}
              </p>
            </div>
          </div>

          {/* Services */}
          <div>
            <p className="text-xs text-stone-400 mb-2 uppercase tracking-wider">Available Services</p>
            <div className="flex flex-wrap gap-1.5">
              {agentTools[provider].map((tool, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 bg-stone-50 text-xs text-stone-600 rounded-full"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Call Button */}
        <button
          id="voice-call-button"
          onClick={isCallActive ? endCall : startCall}
          disabled={isVapiLoading}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
            isCallActive
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-stone-800 hover:bg-stone-900 text-white'
          } disabled:opacity-50`}
        >
          {isVapiLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isCallActive ? (
            <>
              <PhoneOff className="w-5 h-5" />
              <span>End Call</span>
            </>
          ) : (
            <>
              <Phone className="w-5 h-5" />
              <span>Speak with Concierge</span>
            </>
          )}
        </button>

      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Voice Status */}
        {isCallActive && (
          <div className="flex items-center gap-2 justify-center mb-3">
            <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-xs font-medium">
              <Mic className="w-3.5 h-3.5 animate-pulse" />
              <span>Connected</span>
            </div>
          </div>
        )}

        {messages.length === 0 && (
          <div className="text-center py-12">
            <Phone className="w-8 h-8 text-stone-300 mx-auto mb-3" />
            <p className="text-sm text-stone-600" style={{ fontFamily: 'var(--font-cormorant)' }}>How may I assist you?</p>
            <p className="text-xs text-stone-400 mt-2">
              Tap above to speak with our concierge
            </p>
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

      {/* Input */}
      <div className="p-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isCallActive ? "Type your message..." : "Start a call to chat..."}
            disabled={isLoading || !isCallActive}
            className="flex-1 px-4 py-2.5 bg-white border border-stone-200 rounded-full text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-stone-400 disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim() || !isCallActive}
            className="p-2.5 bg-stone-800 text-white rounded-full hover:bg-stone-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
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
