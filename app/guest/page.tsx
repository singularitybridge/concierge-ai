'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  LogOut, Loader2, Calendar, MapPin, Utensils, Snowflake,
  Waves, Clock, Phone, MessageCircle, ChevronRight, Sparkles,
  Wine, Mountain, Car, Shirt, PawPrint, Plane
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
  { icon: Utensils, label: 'Room Service', description: 'Order in-room dining', message: 'How does room service work? What can I order?' },
  { icon: Waves, label: 'Onsen Booking', description: 'Reserve private bath', message: 'I would like to book a private onsen session. What times are available?' },
  { icon: Phone, label: 'Concierge', description: 'Request assistance', message: 'I need assistance with something. Can you help me?' },
  { icon: Shirt, label: 'Housekeeping', description: 'Room refresh', message: 'I would like to request housekeeping service for my room.' },
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

export default function GuestPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const auth = localStorage.getItem('guest_authenticated');
    if (auth === 'true') {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      router.push('/guest-login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('guest_authenticated');
    router.push('/');
  };

  const sendToChat = (message: string) => {
    window.dispatchEvent(new CustomEvent('send-chat-message', { detail: { message } }));
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

  return (
    <div className="flex h-screen bg-stone-100">
      {/* Left: Guest Portal */}
      <div className="flex-[2] min-w-0 flex flex-col">
        {/* Hero Section - Fixed at top */}
        <div className="relative h-48 flex-shrink-0">
          <Image
            src="/hotel2.jpg"
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

          {/* Welcome Message */}
          <div className="absolute bottom-4 left-6 right-6">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <p className="text-xs uppercase tracking-widest text-amber-400">Grand Opening Guest</p>
            </div>
            <h1 className="text-xl font-light text-white" style={{ fontFamily: 'var(--font-cormorant)' }}>
              Welcome, {guestData.name.split(' ')[0]}
            </h1>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Booking Details Card */}
            <div className="bg-white rounded-xl p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg font-medium text-stone-800" style={{ fontFamily: 'var(--font-cormorant)' }}>
                    {guestData.room.name}
                  </h2>
                  <p className="text-xs text-stone-500">{guestData.room.floor}</p>
                </div>
                <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                  Confirmed
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-stone-400" />
                  <div>
                    <p className="text-xs text-stone-500">Check-in</p>
                    <p className="text-sm text-stone-800">{guestData.checkIn}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-stone-400" />
                  <div>
                    <p className="text-xs text-stone-500">Check-out</p>
                    <p className="text-sm text-stone-800">{guestData.checkOut}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {guestData.room.features.map((feature) => (
                  <span key={feature} className="text-xs px-2 py-1 bg-stone-100 text-stone-600 rounded">
                    {feature}
                  </span>
                ))}
              </div>

              {/* Pet & Special Requests */}
              <div className="mt-4 pt-4 border-t border-stone-100 space-y-3">
                <div className="flex items-center gap-2">
                  <PawPrint className="w-4 h-4 text-stone-400" />
                  <p className="text-sm text-stone-700">Traveling with {guestData.pet}</p>
                </div>
                {guestData.specialRequests.map((req, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Plane className="w-4 h-4 text-stone-400" />
                      <p className="text-sm text-stone-700">{req.type} at {req.time}</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">
                      Confirmed
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between">
                <p className="text-xs text-stone-500">
                  Confirmation: <span className="font-mono text-stone-700">{guestData.confirmationCode}</span>
                </p>
                <p className="text-xs text-stone-500">{guestData.nights} nights • {guestData.guests} guest</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h3 className="text-xs font-medium text-stone-500 mb-3 uppercase tracking-wider">Quick Actions</h3>
              <div className="grid grid-cols-4 gap-2">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => sendToChat(action.message)}
                    className="p-3 bg-white rounded-lg hover:bg-stone-50 transition-colors text-center group"
                  >
                    <action.icon className="w-5 h-5 text-stone-400 mx-auto mb-2 group-hover:text-stone-600" />
                    <p className="text-xs font-medium text-stone-700">{action.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Upcoming Activities */}
            <div>
              <h3 className="text-xs font-medium text-stone-500 mb-3 uppercase tracking-wider">Your Schedule</h3>
              <div className="space-y-2">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-3 p-3 bg-white rounded-lg"
                  >
                    <div className="p-2 bg-stone-100 rounded-lg">
                      <activity.icon className="w-4 h-4 text-stone-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-800">{activity.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-stone-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {activity.time}
                        </span>
                        <span className="text-xs text-stone-400">•</span>
                        <span className="text-xs text-stone-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {activity.location}
                        </span>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      activity.status === 'confirmed'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
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
                <h3 className="text-xs font-medium text-stone-500 uppercase tracking-wider">Niseko Experiences</h3>
                <button className="text-xs text-stone-500 hover:text-stone-700 flex items-center gap-1">
                  View all <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {experiences.map((exp) => (
                  <button
                    key={exp.title}
                    className="p-4 bg-white rounded-lg hover:bg-stone-50 transition-colors text-left"
                  >
                    <exp.icon className="w-5 h-5 text-stone-400 mb-2" />
                    <p className="text-sm font-medium text-stone-800">{exp.title}</p>
                    <p className="text-xs text-stone-500 mt-0.5">{exp.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div className="p-4 bg-stone-800 rounded-xl">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-white/60" />
                <div className="flex-1">
                  <p className="text-sm text-white">Need assistance?</p>
                  <p className="text-xs text-white/60">Our AI concierge is available 24/7</p>
                </div>
                <ChevronRight className="w-4 h-4 text-white/40" />
              </div>
            </div>
        </div>
      </div>

      {/* Right: Voice Chat */}
      <div className="flex-[1] min-w-0 p-6">
        <VoiceSessionChat
          agentId="concierge"
          sessionId="guest-portal"
          elevenLabsAgentId={process.env.NEXT_PUBLIC_ELEVENLABS_GUEST_AGENT_ID}
          contextData={{
            guest: guestData,
            activities,
            experiences,
            quickActions: quickActions.map(a => ({ label: a.label, description: a.description }))
          }}
        />
      </div>
    </div>
  );
}
