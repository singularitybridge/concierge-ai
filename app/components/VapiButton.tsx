'use client';

import { useEffect, useState } from 'react';
import Vapi from '@vapi-ai/web';
import { Phone, PhoneOff } from 'lucide-react';

export default function VapiButton() {
  const [vapi, setVapi] = useState<Vapi | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const vapiInstance = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || '');
    setVapi(vapiInstance);

    // Event listeners
    vapiInstance.on('call-start', () => {
      setIsCallActive(true);
      setIsLoading(false);
    });

    vapiInstance.on('call-end', () => {
      setIsCallActive(false);
      setIsLoading(false);
    });

    vapiInstance.on('error', (error) => {
      console.error('VAPI error:', error);
      setIsLoading(false);
    });

    return () => {
      vapiInstance.stop();
    };
  }, []);

  const startCall = async () => {
    if (!vapi) return;

    setIsLoading(true);
    try {
      await vapi.start(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || '');
    } catch (error) {
      console.error('Failed to start call:', error);
      setIsLoading(false);
    }
  };

  const endCall = () => {
    if (!vapi) return;
    vapi.stop();
  };

  return (
    <button
      onClick={isCallActive ? endCall : startCall}
      disabled={isLoading}
      className={`fixed bottom-6 right-6 p-4 rounded-full shadow-lg transition-all ${
        isCallActive
          ? 'bg-red-500 hover:bg-red-600'
          : 'bg-blue-500 hover:bg-blue-600'
      } text-white disabled:opacity-50 disabled:cursor-not-allowed z-50`}
      aria-label={isCallActive ? 'End call' : 'Start call'}
    >
      {isLoading ? (
        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : isCallActive ? (
        <PhoneOff className="w-6 h-6" />
      ) : (
        <Phone className="w-6 h-6" />
      )}
    </button>
  );
}
