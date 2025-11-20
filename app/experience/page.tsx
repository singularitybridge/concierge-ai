'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  LogOut, Loader2, Calendar, MapPin, Clock, Sparkles,
  Car, Plane, Utensils, Home, ChevronRight
} from 'lucide-react';
import VoiceSessionChat from '../components/VoiceSessionChat';

// Event details
const eventDetails = {
  name: 'Grand Opening Celebration',
  date: 'Wednesday, December 10, 2025',
  time: '4:00 PM',
  location: 'The 1898 Niseko, Hokkaido',
};

// Hotel info tabs content
const hotelInfo = {
  suites: {
    title: 'Our Suites',
    items: [
      { name: 'Mountain View Suite', description: 'Panoramic views of Mount Yotei, private onsen' },
      { name: 'Garden Suite', description: 'Traditional zen garden, tatami living area' },
      { name: 'Onsen Suite', description: 'Indoor/outdoor private hot spring bath' },
      { name: 'Sky Suite', description: 'Top floor, wraparound terrace, fireplace' },
    ]
  },
  dining: {
    title: 'Culinary Experience',
    items: [
      { name: 'Kaiseki Dinner', description: 'Multi-course seasonal Japanese cuisine' },
      { name: 'Sushi Omakase', description: 'Chef\'s selection of finest local seafood' },
      { name: 'Teppanyaki', description: 'Premium Wagyu and Hokkaido produce' },
      { name: 'In-Room Dining', description: '24-hour private dining service' },
    ]
  },
  location: {
    title: 'Location & Access',
    items: [
      { name: 'New Chitose Airport', description: '2.5 hours by car, complimentary pickup available' },
      { name: 'Niseko Ski Resorts', description: '10 minutes to Grand Hirafu, Annupuri' },
      { name: 'Niseko Village', description: '5 minutes to shops and restaurants' },
      { name: 'Sapporo City', description: '2 hours scenic drive through Hokkaido' },
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

  const currentInfo = hotelInfo[activeTab];

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
            <div className="bg-gradient-to-br from-stone-800 to-stone-900 rounded-xl p-5 text-white">
              <h3 className="text-sm font-medium mb-3">Complete Your RSVP</h3>
              <p className="text-xs text-white/70 mb-4 leading-relaxed">
                Speak with our AI concierge to register for the Grand Opening.
                We'll collect your details for transportation, dining preferences,
                and any special requirements.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs px-2 py-1 bg-white/10 rounded flex items-center gap-1">
                  <Plane className="w-3 h-3" /> Airport Pickup
                </span>
                <span className="text-xs px-2 py-1 bg-white/10 rounded flex items-center gap-1">
                  <Car className="w-3 h-3" /> Valet Parking
                </span>
                <span className="text-xs px-2 py-1 bg-white/10 rounded flex items-center gap-1">
                  <Utensils className="w-3 h-3" /> Dietary Needs
                </span>
                <span className="text-xs px-2 py-1 bg-white/10 rounded flex items-center gap-1">
                  <Home className="w-3 h-3" /> Overnight Stay
                </span>
              </div>
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
                <h3 className="text-sm font-medium text-stone-800 mb-4">{currentInfo.title}</h3>
                <div className="space-y-3">
                  {currentInfo.items.map((item) => (
                    <div key={item.name} className="flex items-start gap-3">
                      <ChevronRight className="w-4 h-4 text-stone-300 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-stone-800">{item.name}</p>
                        <p className="text-xs text-stone-500">{item.description}</p>
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
        <VoiceSessionChat agentId="registration-concierge" sessionId="grand-opening-rsvp" />
      </div>
    </div>
  );
}
