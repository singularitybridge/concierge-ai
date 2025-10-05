'use client';

import { useConversation } from '@elevenlabs/react';
import { useCallback } from 'react';

export default function ElevenLabsButton() {
  const conversation = useConversation({
    onConnect: () => console.log('🎙️ ElevenLabs: Connected'),
    onDisconnect: () => console.log('🔇 ElevenLabs: Disconnected'),
    onMessage: (message) => console.log('📨 ElevenLabs message:', message),
    onError: (error) => console.error('❌ ElevenLabs error:', error),
  });

  const startConversation = useCallback(async () => {
    try {
      const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;

      if (!agentId) {
        alert('ElevenLabs Agent ID not configured. Please set NEXT_PUBLIC_ELEVENLABS_AGENT_ID in .env.local');
        return;
      }

      await conversation.startSession({
        agentId: agentId,
        connectionType: 'webrtc', // or 'websocket'
      });

      console.log('✅ ElevenLabs conversation started');
    } catch (error) {
      console.error('Failed to start ElevenLabs conversation:', error);
    }
  }, [conversation]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {conversation.status === 'connected' ? (
        <button
          onClick={stopConversation}
          className="bg-red-500 hover:bg-red-600 text-white rounded-full p-4 shadow-lg transition-all duration-200 flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="6" height="6" x="9" y="9" />
          </svg>
          <span className="text-sm font-medium">Stop (ElevenLabs)</span>
        </button>
      ) : (
        <button
          onClick={startConversation}
          disabled={conversation.status === 'connecting'}
          className="bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white rounded-full p-4 shadow-lg transition-all duration-200 flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" x2="12" y1="19" y2="22" />
          </svg>
          <span className="text-sm font-medium">
            {conversation.status === 'connecting' ? 'Connecting...' : 'Talk (ElevenLabs)'}
          </span>
        </button>
      )}

      {/* Status indicator */}
      {conversation.status === 'connected' && (
        <div className="absolute -top-2 -right-2 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
      )}
    </div>
  );
}
