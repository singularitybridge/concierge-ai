'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  LogOut, Calendar, MapPin, Utensils, Snowflake,
  Waves, Clock, ChevronRight, Check,
  Wine, Mountain, Car, Shirt, PawPrint, Plane, Coffee, Sparkle
} from 'lucide-react';
import VoiceSessionChat from '../components/VoiceSessionChat';

// Mock guest data
const guestData = {
  name: 'Avi Osipov',
  confirmationCode: 'NIS-2025-DEMO',
  checkIn: 'December 20, 2025',
  checkOut: 'December 24, 2025',
  nights: 4,
  room: {
    name: 'Mountain View Suite',
    floor: '3rd Floor',
    features: ['Private Onsen', 'Mountain View', 'Tatami Area', 'Pet Friendly'],
  },
  guests: 1,
  pet: 'Shmutzi (Cat)',
  specialRequests: [
    { type: 'Airport Pickup', time: '3:00 PM', status: 'confirmed' },
  ],
};

const quickActions = [
  { icon: Utensils, label: 'Room Service', description: 'Order in-room dining', serviceType: 'room_service' },
  { icon: Waves, label: 'Onsen Booking', description: 'Reserve private bath', serviceType: 'onsen' },
  { icon: Coffee, label: 'Amenities', description: 'Towels & supplies', serviceType: 'amenities' },
  { icon: Shirt, label: 'Housekeeping', description: 'Room refresh', serviceType: 'housekeeping' },
];

const activities = [
  {
    id: 1,
    title: 'Kaiseki Dinner',
    time: 'Tonight, 7:00 PM',
    location: 'Yuki Restaurant',
    icon: Wine,
    status: 'confirmed',
  },
  {
    id: 2,
    title: 'Private Onsen',
    time: 'Tomorrow, 6:00 AM',
    location: 'Rooftop Bath',
    icon: Waves,
    status: 'confirmed',
  },
  {
    id: 3,
    title: 'Ski Lesson',
    time: 'Dec 21, 9:00 AM',
    location: 'Grand Hirafu',
    icon: Snowflake,
    status: 'pending',
  },
];

const experiences = [
  { icon: Snowflake, title: 'Powder Skiing', description: 'World-class slopes' },
  { icon: Mountain, title: 'Snowshoe Trek', description: 'Guided forest walks' },
  { icon: Car, title: 'Village Tour', description: 'Local culture & shops' },
];

// Service request type
interface ServiceRequest {
  id: string;
  type: string;
  details: string;
  time: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed';
}

// Activity type
interface Activity {
  id: number;
  title: string;
  time: string;
  location: string;
  icon: typeof Wine;
  status: 'confirmed' | 'pending' | 'cancelled';
}

export default function GuestPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [schedule, setSchedule] = useState<Activity[]>(activities);
  const [activeAction, setActiveAction] = useState<string | null>(null);
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

  // Listen for agent events
  useEffect(() => {
    const handleServiceProcessing = (event: CustomEvent<{ serviceType: string }>) => {
      // Highlight the quick action button when agent starts processing
      setActiveAction(event.detail.serviceType);
    };

    const handleServiceRequest = (event: CustomEvent<ServiceRequest>) => {
      const request = event.detail;
      setServiceRequests(prev => [...prev, { ...request, id: `sr-${Date.now()}`, status: 'confirmed' }]);
      // Clear active action when service is confirmed
      setActiveAction(null);
    };

    const handleUpdateSchedule = (event: CustomEvent<{ action: string; title: string; time?: string; location?: string; status?: string }>) => {
      const { action, title, time, location, status } = event.detail;
      if (action === 'add' && time && location) {
        setSchedule(prev => [...prev, {
          id: Date.now(),
          title,
          time,
          location,
          icon: Sparkle,
          status: (status as 'confirmed' | 'pending') || 'pending'
        }]);
        // Clear active action when activity is booked
        setActiveAction(null);
      }
    };

    window.addEventListener('service-processing', handleServiceProcessing as EventListener);
    window.addEventListener('service-request', handleServiceRequest as EventListener);
    window.addEventListener('update-schedule', handleUpdateSchedule as EventListener);

    return () => {
      window.removeEventListener('service-processing', handleServiceProcessing as EventListener);
      window.removeEventListener('service-request', handleServiceRequest as EventListener);
      window.removeEventListener('update-schedule', handleUpdateSchedule as EventListener);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('niseko_authenticated');
    localStorage.removeItem('niseko_role');
    router.push('/login');
  };

  const handleQuickAction = (serviceType: string) => {
    // Set active action for visual feedback
    setActiveAction(serviceType);
    // Dispatch event to trigger voice chat with the service type
    window.dispatchEvent(new CustomEvent('quick-action', { detail: { serviceType } }));
  };

  // Navigation menu items
  const menuItems = [
    { label: 'Register', href: '/register' },
    { label: 'Staff Portal', href: '/admin' },
    { label: 'Shop', href: '/shop' },
  ];

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

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Full Page Background */}
      <Image
        src="/hotel2.jpg"
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
                href={item.href}
                className={`px-4 py-2 rounded-full text-sm transition-all ${
                  item.active
                    ? 'bg-white/15 text-white font-medium'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
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

        {/* Main Content - Two Column Layout */}
        <div className="flex-1 flex gap-6 px-8 pb-6 min-h-0">

          {/* Left Column - Guest Info - Full Height Card */}
          <div className="flex-1 min-w-0 flex flex-col">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl flex-1 flex flex-col min-h-0">
              {/* Welcome Header - Sticky */}
              <div className="mb-6 flex-shrink-0">
                <h2
                  className="text-4xl font-light text-white tracking-wide"
                  style={{ fontFamily: 'var(--font-cormorant)' }}
                >
                  Welcome, {guestData.name.split(' ')[0]}
                </h2>
                <p className="text-base text-white/50 mt-2">{guestData.room.name} • {guestData.nights} Nights</p>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto min-h-0 space-y-4 pr-2">
                {/* Booking Details Section */}
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-white" style={{ fontFamily: 'var(--font-cormorant)' }}>
                      {guestData.room.name}
                    </h3>
                    <p className="text-xs text-white/50">{guestData.room.floor}</p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
                    Confirmed
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-400/70" />
                    <div>
                      <p className="text-xs text-white/40">Check-in</p>
                      <p className="text-sm text-white">{guestData.checkIn}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-400/70" />
                    <div>
                      <p className="text-xs text-white/40">Check-out</p>
                      <p className="text-sm text-white">{guestData.checkOut}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {guestData.room.features.map((feature) => (
                    <span key={feature} className="text-xs px-2 py-1 bg-white/10 text-white/70 rounded border border-white/10">
                      {feature}
                    </span>
                  ))}
                </div>

                {/* Pet & Special Requests */}
                <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                  <div className="flex items-center gap-2">
                    <PawPrint className="w-4 h-4 text-amber-400/70" />
                    <p className="text-sm text-white/80">Traveling with {guestData.pet}</p>
                  </div>
                  {guestData.specialRequests.map((req, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Plane className="w-4 h-4 text-amber-400/70" />
                        <p className="text-sm text-white/80">{req.type} at {req.time}</p>
                      </div>
                      <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full">
                        Confirmed
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                  <p className="text-xs text-white/40">
                    Confirmation: <span className="font-mono text-white/70">{guestData.confirmationCode}</span>
                  </p>
                  <p className="text-xs text-white/40">{guestData.nights} nights • {guestData.guests} guest</p>
                </div>
              </div>

            {/* Quick Actions */}
            <div>
              <h3 className="text-xs font-medium text-white/50 mb-3 uppercase tracking-wider">Quick Actions</h3>
              <div className="grid grid-cols-4 gap-2">
                {quickActions.map((action) => {
                  const isActive = activeAction === action.serviceType;
                  return (
                    <button
                      key={action.label}
                      onClick={() => handleQuickAction(action.serviceType)}
                      className={`p-3 rounded-xl transition-all text-center group border ${
                        isActive
                          ? 'bg-amber-500/20 border-amber-400/30 ring-2 ring-amber-400/30 ring-offset-2 ring-offset-transparent'
                          : 'bg-white/10 border-white/10 hover:bg-white/15 hover:border-white/20'
                      }`}
                    >
                      <action.icon className={`w-5 h-5 mx-auto mb-2 transition-colors ${
                        isActive ? 'text-amber-400' : 'text-white/50 group-hover:text-white/70'
                      }`} />
                      <p className={`text-xs font-medium transition-colors ${
                        isActive ? 'text-amber-400' : 'text-white/80'
                      }`}>{action.label}</p>
                      <p className={`text-[10px] mt-0.5 transition-colors ${
                        isActive ? 'text-amber-400/70' : 'text-white/40'
                      }`}>{action.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Service Requests */}
            {serviceRequests.length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-white/50 mb-3 uppercase tracking-wider">Active Requests</h3>
                <div className="space-y-2">
                  {serviceRequests.map((request) => (
                    <div key={request.id} className="flex items-center gap-3 p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                      <div className="p-2 bg-emerald-500/20 rounded-lg">
                        <Check className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white capitalize">{request.type.replace('_', ' ')}</p>
                        <p className="text-xs text-white/50">{request.details}</p>
                      </div>
                      <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full">
                        {request.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Activities */}
            <div>
              <h3 className="text-xs font-medium text-white/50 mb-3 uppercase tracking-wider">Your Schedule</h3>
              <div className="space-y-2">
                {schedule.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-3 p-3 bg-white/10 rounded-xl border border-white/10"
                  >
                    <div className="p-2 bg-white/10 rounded-lg">
                      <activity.icon className="w-4 h-4 text-amber-400/70" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{activity.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-white/50 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {activity.time}
                        </span>
                        <span className="text-xs text-white/30">•</span>
                        <span className="text-xs text-white/50 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {activity.location}
                        </span>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      activity.status === 'confirmed'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {activity.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Experiences */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-medium text-white/50 uppercase tracking-wider">Niseko Experiences</h3>
                <button className="text-xs text-white/50 hover:text-white/70 flex items-center gap-1">
                  View all <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {experiences.map((exp) => (
                  <button
                    key={exp.title}
                    className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-colors text-left"
                  >
                    <exp.icon className="w-5 h-5 text-amber-400/70 mb-2" />
                    <p className="text-sm font-medium text-white">{exp.title}</p>
                    <p className="text-xs text-white/50 mt-0.5">{exp.description}</p>
                  </button>
                ))}
              </div>
            </div>
              </div>{/* End scrollable content */}
            </div>
          </div>

          {/* Right Column - Voice Chat */}
          <div className="flex-1 min-w-0 flex flex-col max-w-md">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl flex-1 overflow-hidden">
              <VoiceSessionChat
                agentId="concierge"
                sessionId="guest-portal"
                elevenLabsAgentId={process.env.NEXT_PUBLIC_ELEVENLABS_GUEST_AGENT_ID}
                title="Yuki"
                avatar="/avatars/guest-avatar.jpg"
                welcomeMessage="Hello! Welcome to The 1898. I'm Yuki, your personal concierge. It's wonderful to have you with us — how can I make your stay special today?"
                suggestions={[
                  "Clean my room please",
                  "I'd like room service",
                  "Book an onsen session",
                  "What's good for dinner?"
                ]}
                contextData={{
                  guest: guestData,
                  schedule: schedule.map(s => ({ title: s.title, time: s.time, location: s.location, status: s.status })),
                  serviceRequests,
                  experiences,
                  availableServices: quickActions.map(a => ({ label: a.label, description: a.description, type: a.serviceType }))
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
