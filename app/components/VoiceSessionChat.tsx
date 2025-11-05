'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Phone, PhoneOff, Mic, Loader2, Trash2, Settings, UserPlus } from 'lucide-react';
import Link from 'next/link';
import Vapi from '@vapi-ai/web';
import { useConversation } from '@elevenlabs/react';
import { AudioCaptureManager } from '../utils/audioCaptureManager';
import { AudioPlaybackManager } from '../utils/audioPlaybackManager';
import VoiceActionModal from './VoiceActionModal';
import { executeClientFunction } from '../utils/clientSideFunctions';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

type VoiceProvider = 'vapi' | 'elevenlabs' | 'openai' | 'gemini';

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
  const [openaiWs, setOpenaiWs] = useState<WebSocket | null>(null);
  const [geminiWs, setGeminiWs] = useState<WebSocket | null>(null);
  const audioCaptureRef = useRef<AudioCaptureManager | null>(null);
  const audioPlaybackRef = useRef<AudioPlaybackManager | null>(null);

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
    vapi: ['Voice-to-Text (Deepgram)', 'Text-to-Voice (11Labs/PlayHT)', 'Function Calling', 'Custom Tools'],
    elevenlabs: ['Voice-to-Voice AI', 'Conversational AI', 'Real-time Processing', 'Context Awareness'],
    openai: ['GPT-4o Realtime', 'Voice-to-Voice', 'Function Calling', 'Low Latency'],
    gemini: ['Gemini 2.0 Live', 'Multimodal AI', 'Real-time Streaming', 'Context Awareness']
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

  const startOpenAIRealtimeCall = async () => {
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    if (!apiKey) {
      console.error('OpenAI API key not found');
      setIsVapiLoading(false);
      return;
    }

    try {
      // Initialize audio managers with OpenAI sample rate (24kHz)
      if (!audioCaptureRef.current) {
        audioCaptureRef.current = new AudioCaptureManager();
      }
      if (!audioPlaybackRef.current) {
        audioPlaybackRef.current = new AudioPlaybackManager();
        await audioPlaybackRef.current.initialize(24000); // OpenAI uses 24kHz output
      } else {
        // Clear any existing audio queue to prevent overlap
        audioPlaybackRef.current.clearQueue();
      }

      // WebSocket connection with API key in subprotocol
      const url = `wss://api.openai.com/v1/realtime?model=gpt-4o-mini-realtime-preview`;
      const ws = new WebSocket(url, [
        'realtime',
        `openai-insecure-api-key.${apiKey}`,
        'openai-beta.realtime-v1'
      ]);

      ws.onopen = async () => {
        console.log('OpenAI Realtime connected');

        // Configure session
        ws.send(JSON.stringify({
          type: 'session.update',
          session: {
            modalities: ['text', 'audio'],
            instructions: agentPrompts.openai || 'You are a helpful AI assistant.',
            voice: 'coral',
            input_audio_format: 'pcm16',
            output_audio_format: 'pcm16',
            input_audio_transcription: {
              model: 'whisper-1'
            },
            turn_detection: {
              type: 'server_vad',
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 200
            }
          }
        }));

        // Trigger initial greeting using response.create with instructions
        ws.send(JSON.stringify({
          type: 'response.create',
          response: {
            modalities: ['text', 'audio'],
            instructions: 'Greet the user warmly and introduce yourself briefly in a friendly, conversational tone.',
            max_output_tokens: 150
          }
        }));

        // Start audio capture and send to WebSocket (24kHz for OpenAI)
        try {
          await audioCaptureRef.current!.startCapture((pcm16Data, base64Audio) => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({
                type: 'input_audio_buffer.append',
                audio: base64Audio
              }));
            }
          }, 24000); // OpenAI uses 24kHz input

          setIsCallActive(true);
          setIsVapiLoading(false);
        } catch (error) {
          console.error('Failed to start audio capture:', error);
          ws.close();
          setIsVapiLoading(false);
        }
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        // Debug logging
        if (data.type?.startsWith('response.')) {
          console.log('OpenAI event:', data.type, data);
        }

        // Handle session confirmation
        if (data.type === 'session.updated') {
          console.log('OpenAI session updated:', data.session);
        }

        // Handle errors
        if (data.type === 'error') {
          console.error('OpenAI error:', data.error);
          return;
        }

        // Handle audio responses - ONLY play audio from response.audio.delta
        if (data.type === 'response.audio.delta' && data.delta) {
          audioPlaybackRef.current?.addBase64AudioChunk(data.delta);
        }

        // Handle text transcripts - ONLY for display, NOT for audio playback
        if (data.type === 'response.audio_transcript.delta') {
          setMessages(prev => {
            const lastMsg = prev[prev.length - 1];
            if (lastMsg && lastMsg.role === 'assistant') {
              return [...prev.slice(0, -1), {
                ...lastMsg,
                content: lastMsg.content + data.delta
              }];
            }
            return [...prev, {
              role: 'assistant',
              content: data.delta,
              timestamp: Date.now()
            }];
          });
        } else if (data.type === 'conversation.item.input_audio_transcription.completed') {
          // Display user's transcribed speech
          if (data.transcript) {
            console.log('User said:', data.transcript);
            setMessages(prev => [...prev, {
              role: 'user',
              content: data.transcript,
              timestamp: Date.now()
            }]);
          }
        } else if (data.type === 'input_audio_buffer.speech_started') {
          console.log('User started speaking');
        } else if (data.type === 'input_audio_buffer.speech_stopped') {
          console.log('User stopped speaking');
        } else if (data.type === 'conversation.interrupted') {
          console.log('Conversation interrupted');
          // Clear audio queue when interrupted
          audioPlaybackRef.current?.clearQueue();
        }
      };

      ws.onerror = (error) => {
        console.error('OpenAI WebSocket error:', error);
        setIsVapiLoading(false);
      };

      ws.onclose = async () => {
        console.log('OpenAI WebSocket closed');
        setIsCallActive(false);
        setIsVapiLoading(false);

        // Cleanup audio
        await audioCaptureRef.current?.stopCapture();
        await audioPlaybackRef.current?.stop();
      };

      setOpenaiWs(ws);
    } catch (error) {
      console.error('Failed to start OpenAI Realtime call:', error);
      setIsVapiLoading(false);
    }
  };

  const startGeminiLiveCall = async () => {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      console.error('Gemini API key not found');
      setIsVapiLoading(false);
      return;
    }

    try {
      // Initialize audio managers with Gemini sample rates (16kHz input, 24kHz output)
      if (!audioCaptureRef.current) {
        audioCaptureRef.current = new AudioCaptureManager();
      }
      if (!audioPlaybackRef.current) {
        audioPlaybackRef.current = new AudioPlaybackManager();
        await audioPlaybackRef.current.initialize(24000); // Gemini uses 24kHz output
      } else {
        // Clear any existing audio queue to prevent overlap
        audioPlaybackRef.current.clearQueue();
      }

      // Gemini Live WebSocket endpoint
      const ws = new WebSocket(
        `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${apiKey}`
      );

      ws.onopen = async () => {
        console.log('Gemini Live connected');

        // Send initial setup message
        const setupMessage = {
          setup: {
            model: 'models/gemini-2.0-flash-exp',
            generationConfig: {
              responseModalities: ["audio"],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: 'Aoede'
                  }
                }
              }
            },
            systemInstruction: {
              parts: [{
                text: agentPrompts.gemini || 'You are a helpful AI assistant.'
              }]
            }
          }
        };

        console.log('Sending Gemini setup:', JSON.stringify(setupMessage, null, 2));
        ws.send(JSON.stringify(setupMessage));

        // Trigger initial greeting from assistant
        const greetingMessage = {
          clientContent: {
            turns: [{
              role: 'user',
              parts: [{
                text: 'Hello! Please greet me warmly and introduce yourself briefly.'
              }]
            }],
            turnComplete: true
          }
        };

        console.log('Sending Gemini greeting:', JSON.stringify(greetingMessage, null, 2));
        ws.send(JSON.stringify(greetingMessage));

        // Start audio capture and send to WebSocket (16kHz for Gemini)
        try {
          await audioCaptureRef.current!.startCapture((pcm16Data, base64Audio) => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({
                realtimeInput: {
                  mediaChunks: [{
                    data: base64Audio,
                    mimeType: 'audio/pcm;rate=16000'
                  }]
                }
              }));
            }
          }, 16000); // Gemini uses 16kHz input

          setIsCallActive(true);
          setIsVapiLoading(false);
        } catch (error) {
          console.error('Failed to start audio capture:', error);
          ws.close();
          setIsVapiLoading(false);
        }
      };

      ws.onmessage = async (event) => {
        // Handle binary audio data (Blob)
        if (event.data instanceof Blob) {
          console.log('Gemini binary audio received, size:', event.data.size);
          try {
            const arrayBuffer = await event.data.arrayBuffer();
            const int16Array = new Int16Array(arrayBuffer);
            audioPlaybackRef.current?.addAudioChunk(int16Array);
          } catch (error) {
            console.error('Failed to process audio blob:', error);
          }
          return;
        }

        // Handle JSON messages
        try {
          const data = JSON.parse(event.data);

          // Debug logging
          console.log('Gemini event:', data);

          // Handle audio responses
          if (data.serverContent?.modelTurn?.parts) {
            const parts = data.serverContent.modelTurn.parts;

            for (const part of parts) {
              // Handle inline audio data - ONLY for audio playback
              if (part.inlineData?.data) {
                console.log('Gemini audio chunk received, size:', part.inlineData.data.length);
                audioPlaybackRef.current?.addBase64AudioChunk(part.inlineData.data);
              }

              // Handle text transcripts - ONLY for display
              if (part.text) {
                console.log('Gemini text:', part.text);
                setMessages(prev => [...prev, {
                  role: 'assistant',
                  content: part.text,
                  timestamp: Date.now()
                }]);
              }
            }
          }

          // Handle setup completion
          if (data.setupComplete) {
            console.log('Gemini setup complete');
          }

          // Handle errors
          if (data.error) {
            console.error('Gemini error:', data.error);
          }
        } catch (error) {
          console.error('Failed to parse Gemini message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('Gemini WebSocket error:', error);
        setIsVapiLoading(false);
      };

      ws.onclose = async (event) => {
        console.log('Gemini WebSocket closed. Code:', event.code, 'Reason:', event.reason, 'Clean:', event.wasClean);
        setIsCallActive(false);
        setIsVapiLoading(false);

        // Cleanup audio
        await audioCaptureRef.current?.stopCapture();
        await audioPlaybackRef.current?.stop();
      };

      setGeminiWs(ws);
    } catch (error) {
      console.error('Failed to start Gemini Live call:', error);
      setIsVapiLoading(false);
    }
  };

  const startCall = async () => {
    setIsVapiLoading(true);
    try {
      if (provider === 'vapi' && vapi) {
        await vapi.start(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || '');
      } else if (provider === 'elevenlabs') {
        await elevenLabsConversation.startSession({
          agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || '',
        });
      } else if (provider === 'openai') {
        await startOpenAIRealtimeCall();
      } else if (provider === 'gemini') {
        await startGeminiLiveCall();
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
    } else if (provider === 'openai' && openaiWs) {
      openaiWs.close();
      setOpenaiWs(null);
      // Cleanup will happen in WebSocket onclose handler
    } else if (provider === 'gemini' && geminiWs) {
      geminiWs.close();
      setGeminiWs(null);
      // Cleanup will happen in WebSocket onclose handler
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

      console.log('📞 Adding phone to conference:', { phoneNumber, conferenceId: confId });

      // Call API to initiate outbound call
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

      console.log('✅ Phone added to conference:', data);

      // Show success message
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `📞 Calling ${phoneNumber}... They will join the conversation shortly.`,
        timestamp: Date.now()
      }]);

      // Clear phone input
      setPhoneNumber('');

    } catch (error) {
      console.error('Error adding phone:', error);
      alert(error instanceof Error ? error.message : 'Failed to add phone to call');
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
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setProvider('vapi')}
                className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  provider === 'vapi'
                    ? 'bg-indigo-50 border-indigo-600 text-indigo-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                VAPI
              </button>
              <button
                onClick={() => setProvider('elevenlabs')}
                className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  provider === 'elevenlabs'
                    ? 'bg-indigo-50 border-indigo-600 text-indigo-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                ElevenLabs
              </button>
              <button
                onClick={() => setProvider('openai')}
                className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  provider === 'openai'
                    ? 'bg-indigo-50 border-indigo-600 text-indigo-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                OpenAI
              </button>
              <button
                onClick={() => setProvider('gemini')}
                className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  provider === 'gemini'
                    ? 'bg-indigo-50 border-indigo-600 text-indigo-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Gemini
              </button>
            </div>
          </div>
        )}

        {/* Agent Info */}
        <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-start gap-3 mb-2">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-full border-2 border-indigo-200 shadow-md overflow-hidden">
                <img
                  src="/avatars/assistant-avatar.jpg"
                  alt="AI Assistant Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-900">
                  {provider === 'vapi' && 'VAPI Agent'}
                  {provider === 'elevenlabs' && 'ElevenLabs Agent'}
                  {provider === 'openai' && 'OpenAI Realtime'}
                  {provider === 'gemini' && 'Gemini Live'}
                </h3>
                {provider === 'vapi' && (
                  <Link
                    href="/vapi"
                    className="p-1 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                    aria-label="VAPI config"
                  >
                    <Settings className="w-4 h-4" />
                  </Link>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {provider === 'vapi' && 'Voice AI with function calling'}
                {provider === 'elevenlabs' && 'Real-time conversational AI'}
                {provider === 'openai' && 'GPT-4o multimodal voice chat'}
                {provider === 'gemini' && 'Gemini 2.0 Live API streaming'}
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
          id="voice-call-button"
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

        {/* Conference Call - Add Phone Participant */}
        {isCallActive && provider === 'vapi' && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <UserPlus className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-900">Add Phone Participant</span>
            </div>
            <div className="flex gap-2">
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+972-52-6722216"
                className="flex-1 px-3 py-2 text-sm border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isAddingPhone}
              />
              <button
                onClick={addPhoneToCall}
                disabled={isAddingPhone || !phoneNumber.trim()}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isAddingPhone ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Calling...</span>
                  </>
                ) : (
                  <>
                    <Phone className="w-4 h-4" />
                    <span>Call</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

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
