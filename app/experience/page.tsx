'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  LogOut, Loader2, Calendar, MapPin, Clock, Sparkles, ChevronRight,
  User, Building2, Mail, Phone, Users, Car, UtensilsCrossed, BedDouble, MessageSquare, Check, X
} from 'lucide-react';
import VoiceSessionChat from '../components/VoiceSessionChat';

// Event details
const eventDetails = {
  name: 'Grand Opening Celebration',
  date: 'Wednesday, December 10, 2025',
  time: '4:00 PM',
  location: 'The 1898 Niseko, Hokkaido',
};

// Hotel info content
const hotelInfo = {
  suites: {
    title: 'Our Suites',
    description: 'Each of our 24 suites blends traditional Japanese aesthetics with modern luxury.',
    items: [
      { name: 'Mountain View Suite', description: '65 sqm, panoramic Mount Yotei views, private onsen. From ¥120,000/night.' },
      { name: 'Garden Suite', description: '55 sqm, zen garden views, tatami living area. From ¥90,000/night.' },
      { name: 'Onsen Suite', description: '70 sqm, premium private onsen, heated floors. From ¥150,000/night.' },
      { name: 'Sky Suite', description: '85 sqm penthouse, wraparound terrace, butler service. From ¥200,000/night.' },
    ]
  },
  dining: {
    title: 'Culinary Experience',
    description: 'Chef Watanabe celebrates Hokkaido\'s exceptional ingredients.',
    items: [
      { name: 'Kaiseki Dinner', description: '8-12 course seasonal cuisine. ¥18,000-35,000 per person.' },
      { name: 'Sushi Omakase', description: 'Chef\'s selection, 12 pieces. ¥15,000.' },
      { name: 'Teppanyaki', description: 'Premium A5 Wagyu, Hokkaido scallops. ¥25,000 per person.' },
      { name: 'In-Room Dining', description: '24-hour service, full menu until 10:30 PM.' },
    ]
  },
  location: {
    title: 'Getting Here',
    description: 'Ideally situated in the heart of Niseko with complimentary shuttle service.',
    items: [
      { name: 'New Chitose Airport', description: '110 km, ~2.5 hours. Luxury SUV pickup ¥35,000 (up to 4 guests).' },
      { name: 'Ski Resorts', description: '10-15 min to Grand Hirafu, Niseko Village, Annupuri. Free shuttle.' },
      { name: 'Niseko Village', description: '5 min to shops & restaurants. Walking distance.' },
      { name: 'Day Trips', description: 'Sapporo 2h, Otaru 1.5h, Lake Toya 1h. Private car ¥50,000/day.' },
    ]
  }
};

// Guest registration data structure
interface GuestRegistration {
  name: string;
  company: string;
  email: string;
  phone: string;
  partySize: string;
  children: string;
  transportation: string;
  dietary: string;
  overnight: string;
  remarks: string;
}

const emptyRegistration: GuestRegistration = {
  name: '',
  company: '',
  email: '',
  phone: '',
  partySize: '',
  children: '',
  transportation: '',
  dietary: '',
  overnight: '',
  remarks: ''
};

// Field display config
const registrationFields = [
  { key: 'name', label: 'Name', icon: User },
  { key: 'company', label: 'Company', icon: Building2 },
  { key: 'email', label: 'Email', icon: Mail },
  { key: 'phone', label: 'Phone', icon: Phone },
  { key: 'partySize', label: 'Party Size', icon: Users },
  { key: 'transportation', label: 'Transportation', icon: Car },
  { key: 'dietary', label: 'Dietary', icon: UtensilsCrossed },
  { key: 'overnight', label: 'Accommodation', icon: BedDouble },
] as const;

type InfoPanelType = 'suites' | 'dining' | 'location' | null;

export default function ExperiencePage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [registration, setRegistration] = useState<GuestRegistration>(emptyRegistration);
  const [infoPanel, setInfoPanel] = useState<InfoPanelType>(null);
  const [isComplete, setIsComplete] = useState(false);
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

  // Count filled fields for progress
  const filledCount = Object.values(registration).filter(v => v && v.trim() !== '').length;
  const totalFields = registrationFields.length;

  // Listen for agent events
  useEffect(() => {
    // Update a single registration field
    const handleUpdateField = (event: CustomEvent<{ field: string; value: string }>) => {
      const { field, value } = event.detail;
      setRegistration(prev => ({ ...prev, [field]: value }));
    };

    // Show info panel (suites, dining, location)
    const handleShowInfo = (event: CustomEvent<{ panel: string }>) => {
      const panel = event.detail.panel.toLowerCase() as InfoPanelType;
      if (panel === 'suites' || panel === 'dining' || panel === 'location') {
        setInfoPanel(panel);
      }
    };

    // Hide info panel
    const handleHideInfo = () => {
      setInfoPanel(null);
    };

    // Mark registration complete
    const handleComplete = () => {
      setIsComplete(true);
      setInfoPanel(null);
    };

    // Reset registration
    const handleReset = () => {
      setRegistration(emptyRegistration);
      setIsComplete(false);
      setInfoPanel(null);
    };

    // Legacy navigate-tab support
    const handleNavigateTab = (event: CustomEvent<{ tab: string }>) => {
      const tab = event.detail.tab.toLowerCase() as InfoPanelType;
      if (tab === 'suites' || tab === 'dining' || tab === 'location') {
        setInfoPanel(tab);
      }
    };

    window.addEventListener('update-registration-field', handleUpdateField as EventListener);
    window.addEventListener('show-info-panel', handleShowInfo as EventListener);
    window.addEventListener('hide-info-panel', handleHideInfo as EventListener);
    window.addEventListener('registration-complete', handleComplete as EventListener);
    window.addEventListener('reset-registration', handleReset as EventListener);
    window.addEventListener('navigate-tab', handleNavigateTab as EventListener);

    return () => {
      window.removeEventListener('update-registration-field', handleUpdateField as EventListener);
      window.removeEventListener('show-info-panel', handleShowInfo as EventListener);
      window.removeEventListener('hide-info-panel', handleHideInfo as EventListener);
      window.removeEventListener('registration-complete', handleComplete as EventListener);
      window.removeEventListener('reset-registration', handleReset as EventListener);
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
        {/* Hero Section */}
        <div className="relative h-44 flex-shrink-0">
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

          {/* Event Header */}
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
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Event Details - Compact */}
          <div className="bg-white rounded-xl p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-stone-400" />
                <span className="text-sm text-stone-700">{eventDetails.date}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-stone-400" />
                <span className="text-sm text-stone-700">{eventDetails.time}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-stone-400" />
                <span className="text-sm text-stone-700">Niseko, Hokkaido</span>
              </div>
            </div>
          </div>

          {/* Your Registration Card */}
          <div className={`rounded-xl p-5 transition-all ${isComplete ? 'bg-emerald-50 border border-emerald-200' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-stone-800" style={{ fontFamily: 'var(--font-cormorant)' }}>
                {isComplete ? 'Registration Complete' : 'Your Registration'}
              </h2>
              {!isComplete && filledCount > 0 && (
                <span className="text-xs text-stone-400">
                  {filledCount} of {totalFields} details
                </span>
              )}
              {isComplete && (
                <div className="flex items-center gap-1.5 text-emerald-600">
                  <Check className="w-4 h-4" />
                  <span className="text-xs font-medium">Confirmed</span>
                </div>
              )}
            </div>

            {isComplete ? (
              <div className="text-center py-4">
                <p className="text-sm text-emerald-700 mb-2">
                  Thank you, {registration.name || 'Guest'}!
                </p>
                <p className="text-xs text-emerald-600/70">
                  We look forward to welcoming you on December 10th.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {registrationFields.map(({ key, label, icon: Icon }) => {
                  const value = registration[key as keyof GuestRegistration];
                  const hasValue = value && value.trim() !== '';

                  return (
                    <div
                      key={key}
                      className={`flex items-start gap-2.5 p-2.5 rounded-lg transition-all ${
                        hasValue
                          ? 'bg-stone-50'
                          : 'bg-stone-50/50'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${
                        hasValue ? 'text-stone-600' : 'text-stone-300'
                      }`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] uppercase tracking-wide text-stone-400 mb-0.5">
                          {label}
                        </p>
                        <p className={`text-sm truncate ${
                          hasValue ? 'text-stone-800' : 'text-stone-300'
                        }`}>
                          {hasValue ? value : '—'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Special Remarks - Full width if has value */}
            {!isComplete && registration.remarks && (
              <div className="mt-3 p-2.5 rounded-lg bg-stone-50">
                <div className="flex items-start gap-2.5">
                  <MessageSquare className="w-3.5 h-3.5 mt-0.5 text-stone-600 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-stone-400 mb-0.5">
                      Special Requests
                    </p>
                    <p className="text-sm text-stone-800">{registration.remarks}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Dynamic Info Panel - Shows hotel info when relevant */}
          {infoPanel && hotelInfo[infoPanel] && (
            <div className="bg-white rounded-xl p-5 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-stone-800">
                  {hotelInfo[infoPanel].title}
                </h3>
                <button
                  onClick={() => setInfoPanel(null)}
                  className="p-1 text-stone-400 hover:text-stone-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-stone-500 mb-4 leading-relaxed">
                {hotelInfo[infoPanel].description}
              </p>
              <div className="space-y-2.5">
                {hotelInfo[infoPanel].items.map((item) => (
                  <div key={item.name} className="flex items-start gap-2.5">
                    <ChevronRight className="w-3.5 h-3.5 text-stone-300 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-stone-700">{item.name}</p>
                      <p className="text-xs text-stone-500 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subtle hint when no panel is shown */}
          {!infoPanel && !isComplete && (
            <p className="text-center text-xs text-stone-400 py-2">
              Ask about suites, dining, or directions anytime
            </p>
          )}
        </div>
      </div>

      {/* Right: Voice Chat */}
      <div className="flex-[1] min-w-0 p-6">
        <VoiceSessionChat
          agentId="registration-concierge"
          sessionId="grand-opening-rsvp"
          elevenLabsAgentId={process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID}
          title="Takeshi"
          avatar="/avatars/registration-avatar.jpg"
          welcomeMessage="Good evening! I'm Takeshi, and I'm delighted you're considering joining us for our Grand Opening. Let me help you register — it would be my pleasure to assist with any questions about the celebration."
          suggestions={[
            "I'd like to register",
            "Tell me about the suites",
            "What dining options are available?",
            "How do I get there?"
          ]}
          contextData={{
            event: eventDetails,
            registration,
            infoPanel,
            isComplete
          }}
        />
      </div>
    </div>
  );
}
