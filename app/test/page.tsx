'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, Sparkles, Loader2, Activity, Phone, PhoneOff, Mic } from 'lucide-react';
import Vapi from '@vapi-ai/web';

const JOHN_API_URL = 'http://localhost:3000/assistant/68474f065d1be14ff68cd6ae/execute';
const JOHN_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NmQ0Y2MzMjg0NjEyMjMzNDEzYmViNzciLCJlbWFpbCI6ImF2aUBzaW5ndWxhcml0eWJyaWRnZS5uZXQiLCJjb21wYW55SWQiOiI2NmQ0MWFjMzQ4N2MxOWY2ZDRjMjNmYTEiLCJpYXQiOjE3NTk2NTg5MDIsImV4cCI6MTc2MDI2MzcwMn0.FCdXMSBPywWbqjMv9pQdor-6WCdkQ9Fk7VkV23M3myE';
const SLIDE_API_URL = '/api/john-slide-update';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface SlideData {
  slideIndex?: number;
  topic?: string;
  content?: string;
  timestamp?: number;
}

export default function TestPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [screenContent, setScreenContent] = useState({
    title: 'AI Agent Screen',
    content: '<div class="text-center py-20"><p class="text-xl text-gray-400">Start chatting with john to see dynamic content here</p></div>',
    topic: ''
  });
  const [isConnected, setIsConnected] = useState(false);
  const [vapi, setVapi] = useState<Vapi | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isVapiLoading, setIsVapiLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastTimestampRef = useRef<number>(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Poll john's workspace for screen updates
  useEffect(() => {
    const pollWorkspace = async () => {
      try {
        const response = await fetch(`${SLIDE_API_URL}?sessionId=default`);

        if (response.ok) {
          const data: SlideData = await response.json();
          setIsConnected(true);

          // Update screen only if timestamp is newer
          if (data.timestamp && data.timestamp > lastTimestampRef.current) {
            lastTimestampRef.current = data.timestamp;

            setScreenContent({
              title: data.topic || 'AI Agent Screen',
              content: data.content || '<div class="text-center py-20"><p class="text-xl text-gray-400">Waiting for content...</p></div>',
              topic: data.topic || ''
            });
          }
        } else {
          setIsConnected(false);
        }
      } catch (error) {
        console.error('Error polling workspace:', error);
        setIsConnected(false);
      }
    };

    // Poll every 2 seconds
    const interval = setInterval(pollWorkspace, 2000);
    pollWorkspace(); // Initial fetch

    return () => clearInterval(interval);
  }, []);

  const handleVoiceMessage = async (transcript: string) => {
    if (!transcript.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: transcript,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch(JOHN_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${JOHN_API_KEY}`
        },
        body: JSON.stringify({
          userInput: transcript,
          sessionId: 'default'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Extract text content
      let textContent = '';
      if (Array.isArray(data.content)) {
        textContent = data.content
          .map((block: any) => {
            if (block.type === 'text' && block.text?.value) {
              return block.text.value;
            }
            return '';
          })
          .join('\n');
      } else if (typeof data.content === 'string') {
        textContent = data.content;
      } else {
        textContent = JSON.stringify(data);
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: textContent || 'No response',
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Send response to VAPI for TTS
      if (vapi && isCallActive && textContent) {
        vapi.send({
          type: 'add-message',
          message: {
            role: 'assistant',
            content: textContent
          }
        });
      }

    } catch (error) {
      console.error('Error sending message to john:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Failed to send message'}`,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const startCall = async () => {
    if (!vapi) return;

    setIsVapiLoading(true);
    try {
      await vapi.start(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || '');
    } catch (error) {
      console.error('Failed to start call:', error);
      setIsVapiLoading(false);
    }
  };

  const endCall = () => {
    if (!vapi) return;
    vapi.stop();
  };

  // Initialize VAPI
  useEffect(() => {
    const vapiInstance = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || '');
    setVapi(vapiInstance);

    // Call status events
    vapiInstance.on('call-start', () => {
      console.log('📞 Call started');
      setIsCallActive(true);
      setIsVapiLoading(false);
    });

    vapiInstance.on('call-end', () => {
      console.log('📞 Call ended');
      setIsCallActive(false);
      setIsVapiLoading(false);
    });

    // Message events
    vapiInstance.on('message', async (message: any) => {
      console.log('📨 VAPI message:', message);

      if (message.type === 'transcript' && message.role === 'user') {
        const transcript = message.transcript;
        console.log('🎤 User said:', transcript);

        // Send to john and get response
        await handleVoiceMessage(transcript);
      } else if (message.type === 'transcript' && message.role === 'assistant') {
        const assistantText = message.transcript;
        console.log('🤖 Assistant said:', assistantText);

        // Add assistant response to chat
        const assistantMessage: Message = {
          role: 'assistant',
          content: assistantText,
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, assistantMessage]);
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
  }, []);

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
      // If VAPI is connected, send through VAPI (simulating voice)
      if (vapi && isCallActive) {
        console.log('📤 Sending text through VAPI:', messageText);
        vapi.send({
          type: 'add-message',
          message: {
            role: 'user',
            content: messageText
          }
        });
        // Response will come through VAPI message handler
        setIsLoading(false);
      } else {
        // Direct call to john (fallback)
        const response = await fetch(JOHN_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${JOHN_API_KEY}`
          },
          body: JSON.stringify({
            userInput: messageText,
            sessionId: 'default'
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Extract text content from john's structured response
        let textContent = '';
        if (Array.isArray(data.content)) {
          textContent = data.content
            .map((block: any) => {
              if (block.type === 'text' && block.text?.value) {
                return block.text.value;
              }
              return '';
            })
            .join('\n');
        } else if (typeof data.content === 'string') {
          textContent = data.content;
        } else {
          textContent = JSON.stringify(data);
        }

        const assistantMessage: Message = {
          role: 'assistant',
          content: textContent || 'No response',
          timestamp: Date.now()
        };

        setMessages(prev => [...prev, assistantMessage]);
        setIsLoading(false);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Failed to send message'}`,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">john AI Agent Test</h1>
              <p className="text-sm text-gray-500">Dynamic content screen with chat interface</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* AI Agent Screen - Single Dynamic Display */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              {/* Screen Header */}
              <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
                <h2 className="text-lg font-semibold">{screenContent.title}</h2>
                <p className="text-sm text-indigo-100 mt-1">Live content from john</p>
              </div>

              {/* Screen Content */}
              <div className="p-8 min-h-[500px]">
                <div
                  className="text-gray-800"
                  dangerouslySetInnerHTML={{ __html: screenContent.content }}
                />
              </div>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden h-[600px] flex flex-col">
              {/* Chat Header */}
              <div className="px-5 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Chat with john</h3>
                      <p className="text-xs text-indigo-100">Ask about integrations</p>
                    </div>
                  </div>
                  {/* Voice Call Button */}
                  <button
                    onClick={isCallActive ? endCall : startCall}
                    disabled={isVapiLoading}
                    className={`p-2.5 rounded-lg transition-all ${
                      isCallActive
                        ? 'bg-red-500 hover:bg-red-600'
                        : 'bg-white/20 hover:bg-white/30'
                    } disabled:opacity-50`}
                    aria-label={isCallActive ? 'End call' : 'Start voice call'}
                  >
                    {isVapiLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : isCallActive ? (
                      <PhoneOff className="w-5 h-5" />
                    ) : (
                      <Phone className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
                {/* Voice Status Indicator */}
                {isCallActive && (
                  <div className="flex items-center gap-2 justify-center mb-3">
                    <div className="flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1.5 rounded-full text-xs font-medium">
                      <Mic className="w-3.5 h-3.5 animate-pulse" />
                      <span>Voice call active</span>
                    </div>
                  </div>
                )}

                {messages.length === 0 && (
                  <div className="text-center mt-12">
                    <div className="inline-flex p-4 bg-indigo-50 rounded-2xl mb-3">
                      <MessageCircle className="w-8 h-8 text-indigo-600" />
                    </div>
                    <p className="text-gray-900 font-medium mb-1">Start a conversation</p>
                    <p className="text-sm text-gray-500">
                      Try: "What integrations are available?"
                    </p>
                    {!isCallActive && (
                      <p className="text-xs text-gray-400 mt-2">
                        Or click the phone icon to start voice chat
                      </p>
                    )}
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
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white text-gray-900 border border-gray-200 shadow-sm'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      <p className={`text-xs mt-1.5 ${
                        msg.role === 'user' ? 'text-indigo-200' : 'text-gray-400'
                      }`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                        <span className="text-sm text-gray-600">john is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}

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
                    placeholder={isCallActive ? "Type to send via VAPI..." : "Ask john..."}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 transition-all"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={isLoading || !input.trim()}
                    className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    aria-label="Send message"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
