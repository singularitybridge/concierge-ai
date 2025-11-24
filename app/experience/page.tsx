'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  LogOut, Loader2, Calendar, MapPin, Clock, Sparkles, ChevronRight
} from 'lucide-react';
import VoiceSessionChat from '../components/VoiceSessionChat';

// Event details
const eventDetails = {
  name: 'Grand Opening Celebration',
  date: 'Wednesday, December 10, 2025',
  time: '4:00 PM',
  location: 'The 1898 Niseko, Hokkaido',
};

// Quick actions for common questions
const quickActions = [
  { label: 'RSVP', message: 'I would like to register for the Grand Opening event.' },
  { label: 'Transportation', message: 'What transportation options are available to get to the hotel?' },
  { label: 'Dining', message: 'Tell me about the dining options at the event.' },
  { label: 'Overnight', message: 'Can I stay overnight after the event? What suites are available?' },
];

// Hotel info tabs content with expanded details
const hotelInfo = {
  suites: {
    title: 'Our Suites',
    description: 'Each of our 24 suites blends traditional Japanese aesthetics with modern luxury. All suites feature private onsen baths fed by natural hot springs, heated floors, and panoramic mountain views.',
    items: [
      { name: 'Mountain View Suite', description: '65 sqm with panoramic Mount Yotei views, king bed, private indoor/outdoor onsen, tatami sitting area. From ¥120,000/night.' },
      { name: 'Garden Suite', description: '55 sqm overlooking our zen garden, queen bed, traditional tatami living area, rain shower, writing desk. From ¥90,000/night.' },
      { name: 'Onsen Suite', description: '70 sqm with premium indoor/outdoor private onsen, king bed, heated floors throughout, separate living area. From ¥150,000/night.' },
      { name: 'Sky Suite', description: '85 sqm penthouse with wraparound terrace, king bed, fireplace, panoramic 270° views, butler service included. From ¥200,000/night.' },
    ]
  },
  dining: {
    title: 'Culinary Experience',
    description: 'Our culinary program celebrates Hokkaido\'s exceptional ingredients. Chef Watanabe trained in Kyoto for 15 years and sources 80% of ingredients from local Hokkaido farms and fisheries.',
    items: [
      { name: 'Kaiseki Dinner', description: '8-12 course seasonal Japanese haute cuisine at Yuki Restaurant. Vegetarian and vegan options available. ¥18,000-35,000 per person. Reservations required.' },
      { name: 'Sushi Omakase', description: 'Chef\'s selection featuring morning catch from Otaru and Shakotan. 12-piece omakase ¥15,000. Available at the sushi counter, seats 8.' },
      { name: 'Teppanyaki', description: 'Premium A5 Wagyu from Furano, fresh Hokkaido scallops, seasonal vegetables. Private teppan tables available. ¥25,000 per person.' },
      { name: 'In-Room Dining', description: '24-hour service with full menu until 10:30 PM, late-night menu available. Breakfast sets, ramen, donburi, and more. 30-45 minute delivery.' },
    ]
  },
  location: {
    title: 'Location & Access',
    description: 'The 1898 Niseko is ideally situated in the heart of Niseko, offering easy access to world-class ski resorts and the charming village. We provide complimentary shuttle service to all major areas.',
    items: [
      { name: 'New Chitose Airport', description: '110 km, approximately 2.5 hours by car. Complimentary luxury SUV pickup available with 48-hour advance booking. ¥35,000 per car (up to 4 guests).' },
      { name: 'Niseko Ski Resorts', description: '10 minutes to Grand Hirafu (largest area), 12 min to Niseko Village, 15 min to Annupuri. Free shuttle every 30 minutes, 8 AM - 10 PM.' },
      { name: 'Niseko Village', description: '5 minutes to shops, restaurants, and après-ski. Walking distance to convenience stores. Our concierge can arrange restaurant reservations.' },
      { name: 'Day Trips', description: 'Sapporo 2 hours, Otaru 1.5 hours (canal district, sushi), Lake Toya 1 hour. Private car service available ¥50,000/day.' },
    ]
  }
};

export default function ExperiencePage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<'suites' | 'dining' | 'location'>('suites');
  const router = useRouter();

  useEffect(() => {
    const auth = localStorage.getItem('guest_authenticated');
    if (auth === 'true') {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      router.push('/register');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('guest_authenticated');
    router.push('/');
  };

  const sendToChat = (message: string) => {
    window.dispatchEvent(new CustomEvent('send-chat-message', { detail: { message } }));
  };

  // Listen for navigate-tab events from AI agent
  useEffect(() => {
    const handleNavigateTab = (event: CustomEvent<{ tab: string }>) => {
      const tab = event.detail.tab.toLowerCase();
      if (tab === 'suites' || tab === 'dining' || tab === 'location') {
        setActiveTab(tab);
      }
    };

    window.addEventListener('navigate-tab', handleNavigateTab as EventListener);
    return () => {
      window.removeEventListener('navigate-tab', handleNavigateTab as EventListener);
    };
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-stone-100">
      {/* Left: Registration Experience */}
      <div className="flex-[2] min-w-0 flex flex-col">
        {/* Hero Section - Fixed at top */}
        <div className="relative h-48 flex-shrink-0">
          <Image
            src="/hotel3.jpg"
            alt="The 1898 Niseko"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full text-stone-600 hover:bg-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>

          {/* Event Info */}
          <div className="absolute bottom-4 left-6 right-6">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <p className="text-xs uppercase tracking-widest text-amber-400">You're Invited</p>
            </div>
            <h1 className="text-xl font-light text-white" style={{ fontFamily: 'var(--font-cormorant)' }}>
              {eventDetails.name}
            </h1>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => sendToChat(action.message)}
                  className="px-3 py-1.5 text-xs bg-white text-stone-600 rounded-lg hover:bg-stone-50 transition-colors"
                >
                  {action.label}
                </button>
              ))}
            </div>

            {/* Event Details Card */}
            <div className="bg-white rounded-xl p-5">
              <h2 className="text-lg font-medium text-stone-800 mb-4" style={{ fontFamily: 'var(--font-cormorant)' }}>
                Event Details
              </h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-stone-400" />
                  <div>
                    <p className="text-sm text-stone-800">{eventDetails.date}</p>
                    <p className="text-xs text-stone-500">Mark your calendar</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-stone-400" />
                  <div>
                    <p className="text-sm text-stone-800">{eventDetails.time}</p>
                    <p className="text-xs text-stone-500">Cocktails & ceremony</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-stone-400" />
                  <div>
                    <p className="text-sm text-stone-800">{eventDetails.location}</p>
                    <p className="text-xs text-stone-500">Niseko, Hokkaido, Japan</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Registration Info */}
            <div className="bg-stone-800 rounded-xl p-5 text-white">
              <h3 className="text-sm font-medium mb-3">Complete Your RSVP</h3>
              <p className="text-xs text-white/70 leading-relaxed">
                Speak with our AI concierge to register for the Grand Opening.
                We'll collect your details for transportation, dining preferences,
                and any special requirements.
              </p>
            </div>

            {/* Hotel Info Tabs */}
            <div>
              <div className="flex gap-1 mb-4">
                {(['suites', 'dining', 'location'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 text-xs rounded-lg transition-colors capitalize ${
                      activeTab === tab
                        ? 'bg-stone-800 text-white'
                        : 'bg-white text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="bg-white rounded-xl p-5">
                <h3 className="text-sm font-medium text-stone-800 mb-2">{hotelInfo[activeTab].title}</h3>
                <p className="text-xs text-stone-500 mb-4 leading-relaxed">{hotelInfo[activeTab].description}</p>
                <div className="space-y-3">
                  {hotelInfo[activeTab].items.map((item) => (
                    <div key={item.name} className="flex items-start gap-3">
                      <ChevronRight className="w-4 h-4 text-stone-300 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-stone-800">{item.name}</p>
                        <p className="text-xs text-stone-500 leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Note */}
            <p className="text-center text-xs text-stone-400">
              Questions? Ask our AI concierge for assistance.
            </p>
        </div>
      </div>

      {/* Right: Voice Chat */}
      <div className="flex-[1] min-w-0 p-6">
        <VoiceSessionChat
          agentId="registration-concierge"
          sessionId="grand-opening-rsvp"
          elevenLabsAgentId={process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID}
          contextData={{
            event: eventDetails,
            hotelInfo,
            quickActions: quickActions.map(a => ({ label: a.label })),
            activeTab
          }}
        />
      </div>
    </div>
  );
}
