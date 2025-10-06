'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Phone, PhoneOff, Mic, Loader2, Trash2, FileText, Info, X } from 'lucide-react';
import Vapi from '@vapi-ai/web';
import { useConversation } from '@elevenlabs/react';

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
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [agentPrompts, setAgentPrompts] = useState<{ vapi?: string; elevenlabs?: string }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const agentTools = {
    vapi: ['Voice-to-Text (Deepgram)', 'Text-to-Voice (11Labs/PlayHT)', 'Function Calling', 'Custom Tools'],
    elevenlabs: ['Voice-to-Voice AI', 'Conversational AI', 'Real-time Processing', 'Context Awareness']
  };

  // ElevenLabs conversation
  const elevenLabsConversation = useConversation({
    onConnect: () => {
      setIsCallActive(true);
      setIsVapiLoading(false);
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

  const endCall = () => {
    if (provider === 'vapi' && vapi) {
      vapi.stop();
    } else if (provider === 'elevenlabs') {
      elevenLabsConversation.endSession();
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

  const fetchAgentPrompts = async () => {
    try {
      // Fetch VAPI prompt
      const vapiResponse = await fetch(`/api/vapi-prompt?assistantId=${process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID}`);
      if (vapiResponse.ok) {
        const vapiData = await vapiResponse.json();
        setAgentPrompts(prev => ({ ...prev, vapi: vapiData.prompt }));
      }

      // Fetch ElevenLabs prompt
      const elevenLabsResponse = await fetch(`/api/elevenlabs-prompt?agentId=${process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID}`);
      if (elevenLabsResponse.ok) {
        const elevenLabsData = await elevenLabsResponse.json();
        setAgentPrompts(prev => ({ ...prev, elevenlabs: elevenLabsData.prompt }));
      }
    } catch (error) {
      console.error('Error fetching agent prompts:', error);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-4 py-3">
        {/* Title Row */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-900">Voice Session</h2>
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

        {/* Voice Agent Selector */}
        {!isCallActive && (
          <div className="mb-3">
            <p className="text-xs font-medium text-gray-700 mb-2">Voice Agent</p>
            <div className="flex gap-2">
              <button
                onClick={() => setProvider('vapi')}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  provider === 'vapi'
                    ? 'bg-indigo-50 border-indigo-600 text-indigo-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                VAPI
              </button>
              <button
                onClick={() => setProvider('elevenlabs')}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  provider === 'elevenlabs'
                    ? 'bg-indigo-50 border-indigo-600 text-indigo-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                ElevenLabs
              </button>
            </div>
          </div>
        )}

        {/* Agent Info */}
        <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-900">
                  {provider === 'vapi' ? 'VAPI Agent' : 'ElevenLabs Agent'}
                </h3>
                <button
                  onClick={() => {
                    setShowPromptModal(true);
                    if (Object.keys(agentPrompts).length === 0) {
                      fetchAgentPrompts();
                    }
                  }}
                  className="p-1 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                  aria-label="View prompt"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {provider === 'vapi'
                  ? 'Voice AI with function calling'
                  : 'Real-time conversational AI'
                }
              </p>
            </div>
          </div>

          {/* Tools */}
          <div>
            <p className="text-xs font-medium text-gray-700 mb-1.5">Tools & Features</p>
            <div className="flex flex-wrap gap-1.5">
              {agentTools[provider].map((tool, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-white text-xs text-gray-600 border border-gray-300 rounded"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Call Button */}
        <button
          onClick={isCallActive ? endCall : startCall}
          disabled={isVapiLoading}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
            isCallActive
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
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
              <span>Start Voice Call</span>
            </>
          )}
        </button>
      </div>

      {/* Prompt Modal */}
      {showPromptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Agent Prompt</h3>
              <button
                onClick={() => setShowPromptModal(false)}
                className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  {provider === 'vapi' ? 'VAPI' : 'ElevenLabs'}
                </p>
                <div className="bg-gray-50 p-3 rounded border border-gray-200">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                    {agentPrompts[provider] || 'Loading...'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {/* Voice Status */}
        {isCallActive && (
          <div className="flex items-center gap-2 justify-center mb-3">
            <div className="flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1.5 rounded-lg text-xs font-medium">
              <Mic className="w-3.5 h-3.5 animate-pulse" />
              <span>Voice call active</span>
            </div>
          </div>
        )}

        {messages.length === 0 && (
          <div className="text-center py-12">
            <Phone className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600 font-medium">Start a voice session</p>
            <p className="text-sm text-gray-500 mt-1">
              Choose provider and click start to begin
            </p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-900 border border-gray-200'
              }`}
            >
              <p className="text-sm leading-relaxed">{msg.content}</p>
              <p className={`text-xs mt-1 ${
                msg.role === 'user' ? 'text-indigo-200' : 'text-gray-400'
              }`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isCallActive ? "Type to send via voice..." : "Type a message..."}
            disabled={isLoading || !isCallActive}
            className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim() || !isCallActive}
            className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
