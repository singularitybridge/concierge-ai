import Link from 'next/link';
import { Settings2 } from 'lucide-react';
import HotelPages from './components/HotelPages';
import VoiceSessionChat from './components/VoiceSessionChat';

const AGENT_NAME = 'integration-expert';

export default function Home() {
  return (
    <div className="flex h-screen bg-stone-100 relative">
      {/* Admin Button */}
      <Link
        href="/admin"
        className="absolute top-4 right-4 z-50 p-2 bg-white/80 backdrop-blur-sm border border-stone-200 rounded-lg text-stone-500 hover:text-stone-700 hover:bg-white transition-colors shadow-sm"
        aria-label="Admin Panel"
      >
        <Settings2 className="w-4 h-4" />
      </Link>

      {/* Left: Hotel Pages (2/3) */}
      <div className="flex-[2] min-w-0">
        <div className="h-full">
          <HotelPages />
        </div>
      </div>

      {/* Right: Voice Chat (1/3) */}
      <div className="flex-[1] min-w-0 p-6">
        <VoiceSessionChat agentId={AGENT_NAME} sessionId="default" />
      </div>
    </div>
  );
}
