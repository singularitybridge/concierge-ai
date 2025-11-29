'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const auth = localStorage.getItem('niseko_authenticated');
    if (auth === 'true') {
      setIsAuthenticated(true);
      setMounted(true);
    } else {
      setIsAuthenticated(false);
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('niseko_authenticated');
    localStorage.removeItem('niseko_role');
    localStorage.removeItem('guest_authenticated');
    router.push('/login');
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
      <div className="min-h-screen bg-stone-900 flex items-center justify-center">
        <div className="text-white/50 text-sm">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Navigation menu items
  const menuItems = [
    { label: 'Grand Opening', href: '/experience', active: true },
    { label: 'Guest Portal', href: '/guest' },
    { label: 'Staff Portal', href: '/admin' },
    { label: 'Shop', href: '#', disabled: true },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Full Page Background */}
      <Image
        src="/hotel3.jpg"
        alt="The 1898 Niseko"
        fill
        className="object-cover"
        priority
      />

      {/* Sophisticated Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-stone-900/60" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

      {/* Content */}
      <div className={`relative z-10 h-screen flex flex-col transition-opacity duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}>

        {/* Top Navigation Bar */}
        <nav className="flex items-center justify-between px-8 py-4 flex-shrink-0">
          {/* Left - Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm" style={{ fontFamily: 'var(--font-cormorant)' }}>18</span>
            </div>
            <div>
              <h1
                className="text-xl font-light text-white tracking-wide leading-tight group-hover:text-amber-200 transition-colors"
                style={{ fontFamily: 'var(--font-cormorant)' }}
              >
                THE 1898
              </h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">Niseko</p>
            </div>
          </Link>

          {/* Center - Menu Items */}
          <div className="flex items-center gap-1 bg-white/5 backdrop-blur-md rounded-full px-2 py-1.5 border border-white/10">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.disabled ? '#' : item.href}
                className={`px-4 py-2 rounded-full text-sm transition-all ${
                  item.active
                    ? 'bg-white/15 text-white font-medium'
                    : item.disabled
                      ? 'text-white/30 cursor-not-allowed'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
                onClick={item.disabled ? (e) => e.preventDefault() : undefined}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right - Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all"
          >
            <span className="text-sm">Logout</span>
            <LogOut className="w-4 h-4" />
          </button>
        </nav>

        {/* Page Title */}
        <div className="text-center py-4 flex-shrink-0">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs tracking-[0.2em] text-white/90 font-medium">
              EXCLUSIVE INVITATION
            </span>
          </div>
          <h2
            className="text-2xl font-light text-white tracking-wide"
            style={{ fontFamily: 'var(--font-cormorant)' }}
          >
            Grand Opening Celebration
          </h2>
          <p className="text-sm text-white/50 mt-1">December 10, 2025 • 4:00 PM</p>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="flex-1 flex gap-6 px-8 pb-6 min-h-0">

          {/* Left Column - Registration Experience */}
          <div className="flex-1 min-w-0 flex flex-col gap-4 overflow-y-auto">

            {/* Registration Card */}
            <div className={`bg-white/10 backdrop-blur-xl rounded-2xl p-5 border shadow-2xl flex-shrink-0 transition-all ${
              isComplete ? 'border-emerald-500/30' : 'border-white/20'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h2
                  className="text-xl font-light text-white tracking-wide"
                  style={{ fontFamily: 'var(--font-cormorant)' }}
                >
                  {isComplete ? 'Registration Complete' : 'Your Registration'}
                </h2>
                {!isComplete && filledCount > 0 && (
                  <span className="text-xs text-amber-400/80">
                    {filledCount} of {totalFields} details
                  </span>
                )}
                {isComplete && (
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <Check className="w-4 h-4" />
                    <span className="text-xs font-medium">Confirmed</span>
                  </div>
                )}
              </div>

              {isComplete ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                    <Check className="w-8 h-8 text-emerald-400" />
                  </div>
                  <p className="text-base text-white mb-2">
                    Thank you, {registration.name || 'Guest'}!
                  </p>
                  <p className="text-sm text-white/50">
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
                        className={`flex items-start gap-3 p-3 rounded-xl transition-all ${
                          hasValue
                            ? 'bg-white/10 border border-amber-400/20'
                            : 'bg-white/5 border border-white/10'
                        }`}
                      >
                        <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                          hasValue ? 'text-amber-400' : 'text-white/30'
                        }`} strokeWidth={1.5} />
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] uppercase tracking-wide text-white/40 mb-0.5">
                            {label}
                          </p>
                          <p className={`text-sm truncate ${
                            hasValue ? 'text-white' : 'text-white/30'
                          }`}>
                            {hasValue ? value : '—'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Special Remarks */}
              {!isComplete && registration.remarks && (
                <div className="mt-3 p-3 rounded-xl bg-white/10 border border-amber-400/20">
                  <div className="flex items-start gap-3">
                    <MessageSquare className="w-4 h-4 mt-0.5 text-amber-400 flex-shrink-0" strokeWidth={1.5} />
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-white/40 mb-0.5">
                        Special Requests
                      </p>
                      <p className="text-sm text-white">{registration.remarks}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Dynamic Info Panel */}
            {infoPanel && hotelInfo[infoPanel] && (
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 border border-white/20 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300 flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <h3
                    className="text-lg font-light text-white"
                    style={{ fontFamily: 'var(--font-cormorant)' }}
                  >
                    {hotelInfo[infoPanel].title}
                  </h3>
                  <button
                    onClick={() => setInfoPanel(null)}
                    className="p-1.5 text-white/40 hover:text-white/70 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-white/50 mb-4 leading-relaxed">
                  {hotelInfo[infoPanel].description}
                </p>
                <div className="space-y-2.5">
                  {hotelInfo[infoPanel].items.map((item) => (
                    <div key={item.name} className="flex items-start gap-3 p-2 rounded-lg bg-white/5">
                      <ChevronRight className="w-3.5 h-3.5 text-amber-400/50 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-white/90">{item.name}</p>
                        <p className="text-xs text-white/50 leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hint when no panel */}
            {!infoPanel && !isComplete && (
              <div className="text-center py-2 flex-shrink-0">
                <p className="text-xs text-white/30">
                  Ask about suites, dining, or directions anytime
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Voice Chat */}
          <div className="flex-1 min-w-0 flex flex-col max-w-md">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl flex-1 overflow-hidden">
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
                variant="dark"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
