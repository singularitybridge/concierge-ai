import HotelPages from './components/HotelPages';
import VoiceSessionChat from './components/VoiceSessionChat';

const AGENT_NAME = 'integration-expert';

export default function Home() {
  return (
    <div className="flex h-screen bg-stone-100">
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
