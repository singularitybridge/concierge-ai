'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Key, Wifi, Phone, Calendar, Clock,
  Utensils, Sparkles, Car, ConciergeBell,
  ChevronRight, User, Mail, Star, Award,
  MapPin, CheckCircle2, AlertCircle,
  MessageCircle, Crown, Bot, X, Construction
} from 'lucide-react';
import { useGuestStore } from '@/lib/stores/guest-store';
import { decodeGuestDataFromUrl } from '@/lib/utils/guest-url';
import { RegisteredGuestData, GuestSession, registrationToSession } from '@/types/guest';
import { GuestHeader } from '@/app/components/guest/GuestHeader';
import { GuestBottomNav } from '@/app/components/guest/GuestBottomNav';

// Mock loyalty data generator
// TODO: Fetch from database based on guest email/phone
function generateMockLoyalty() {
  const tiers = ['Silver', 'Gold', 'Platinum', 'Diamond'];
  const tier = tiers[Math.floor(Math.random() * 2) + 1]; // Gold or Platinum
  const points = Math.floor(Math.random() * 5000) + 1000;
  return { tier, points };
}

// Format date for display (e.g., "Dec 29, 2025 14:00")
function formatDateDisplay(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) + ' 14:00';
  } catch {
    return dateStr;
  }
}

// Format checkout date (e.g., "Jan 2, 2026 12:00")
function formatCheckoutDisplay(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) + ' 12:00';
  } catch {
    return dateStr;
  }
}

// Quick service buttons (underConstruction: true = shows modal instead of navigating)
const quickServices = [
  { id: 'restaurant', icon: Utensils, label: 'Restaurant', href: '/restaurant', underConstruction: false },
  { id: 'spa', icon: Sparkles, label: 'Spa', href: '/services/spa', underConstruction: true },
  { id: 'transport', icon: Car, label: 'Transport', href: '/services/transport', underConstruction: true },
  { id: 'room-service', icon: ConciergeBell, label: 'Room Service', href: '/services/room-service', underConstruction: true },
];

export default function GuestRoomPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const guestId = params.slug as string;

  const [session, setSession] = useState<GuestSession | null>(null);
  const [loyalty, setLoyalty] = useState<{ tier: string; points: number } | null>(null);
  const [isKeyActive, setIsKeyActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConstructionModal, setShowConstructionModal] = useState(false);
  const [constructionFeature, setConstructionFeature] = useState('');
  const initialized = useRef(false);

  const { guestSession: storedSession, setGuestSession } = useGuestStore();

  useEffect(() => {
    // Prevent running multiple times
    if (initialized.current) {
      return;
    }

    // Try URL params first (primary source)
    const encodedData = searchParams.get('d');

    if (encodedData) {
      const decodedData = decodeGuestDataFromUrl(encodedData);

      if (decodedData && decodedData.guestId === guestId) {
        const guestSession = registrationToSession(decodedData);
        initialized.current = true;
        setSession(guestSession);
        setGuestSession(guestSession);
        setLoyalty(generateMockLoyalty());
        setLoading(false);
        return;
      }
    }

    // Fallback to Zustand store
    if (storedSession && storedSession.id === guestId) {
      initialized.current = true;
      setSession(storedSession);
      setLoyalty(generateMockLoyalty());
      setLoading(false);
      return;
    }

    // No data found
    setError('Guest data not found. Please check in again or contact the front desk.');
    setLoading(false);
  }, [guestId, searchParams]);

  const handleKeyActivate = () => {
    setIsKeyActive(true);
    setTimeout(() => setIsKeyActive(false), 3000);
  };

  const handleConstructionClick = (featureName: string) => {
    setConstructionFeature(featureName);
    setShowConstructionModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/50 text-sm">Loading your room portal...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-amber-400 mx-auto mb-4" />
          <h1 className="text-2xl font-light text-white mb-2" style={{ fontFamily: 'var(--font-cormorant)' }}>
            Room Portal Unavailable
          </h1>
          <p className="text-white/50 text-sm mb-6">{error}</p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-xl text-sm transition-colors border border-amber-500/30"
          >
            <span>Return to Check-In</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <Image
        src="/hotel3.jpg"
        alt="The 1898 Niseko"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-stone-900/70" />

      {/* Content */}
      <div className="relative z-10 min-h-screen pb-24">
        {/* Header */}
        <GuestHeader title="Room Portal" />

        {/* Main Content */}
        <main className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto">

          {/* ═══════════════════════════════════════════════════════════════
              VIP GOLD CARD - Combined Guest Info & Digital Key
          ═══════════════════════════════════════════════════════════════ */}
          <div className="relative overflow-hidden rounded-2xl shadow-2xl shadow-amber-500/20">
            {/* Gold Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-900/90 via-amber-800/80 to-stone-900/90" />

            {/* Decorative Elements */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-amber-400/30 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-amber-500/20 to-transparent rounded-full translate-y-1/2 -translate-x-1/2" />
            </div>

            {/* Card Content */}
            <div className="relative p-5">
              {/* Header Row - Brand & VIP Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center">
                    <Crown className="h-4 w-4 text-amber-900" />
                  </div>
                  <span className="text-amber-200 text-lg tracking-wider" style={{ fontFamily: 'var(--font-cormorant)' }}>
                    NISEKO 1898
                  </span>
                </div>
                {loyalty && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-400/20 rounded-full border border-amber-400/30">
                    <Star className="h-3 w-3 text-amber-300 fill-amber-300" />
                    <span className="text-amber-300 text-xs font-medium">{loyalty.tier} VIP</span>
                  </div>
                )}
              </div>

              {/* Card Holder Name */}
              <div className="mb-4">
                <p className="text-[10px] text-amber-300/60 uppercase tracking-widest mb-1">Card Holder</p>
                <h2 className="text-2xl text-white tracking-wide" style={{ fontFamily: 'var(--font-cormorant)' }}>
                  {session.name}
                </h2>
              </div>

              {/* Room Number & Points Row */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-14 rounded-lg bg-gradient-to-br from-amber-400/30 to-amber-600/30 flex items-center justify-center border border-amber-400/20">
                    <div className="grid grid-cols-2 gap-0.5">
                      <div className="w-2.5 h-2.5 bg-amber-300/60 rounded-sm" />
                      <div className="w-2.5 h-2.5 bg-amber-300/40 rounded-sm" />
                      <div className="w-2.5 h-2.5 bg-amber-300/40 rounded-sm" />
                      <div className="w-2.5 h-2.5 bg-amber-300/60 rounded-sm" />
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-amber-300/60 uppercase tracking-wider">Room</p>
                    <p className="text-2xl font-bold text-white font-mono tracking-wider">{session.room.number}</p>
                  </div>
                </div>
                {loyalty && (
                  <div className="text-right">
                    <p className="text-[10px] text-amber-300/60 uppercase tracking-wider">Points</p>
                    <p className="text-2xl font-bold text-amber-300 font-mono">{loyalty.points.toLocaleString()}</p>
                  </div>
                )}
              </div>

              {/* Contact Info Row */}
              <div className="grid grid-cols-2 gap-3 mb-5 pb-5 border-b border-amber-400/20">
                {session.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-amber-400/60" />
                    <span className="text-xs text-amber-100/80 truncate">{session.phone}</span>
                  </div>
                )}
                {session.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-amber-400/60" />
                    <span className="text-xs text-amber-100/80 truncate">{session.email}</span>
                  </div>
                )}
              </div>

              {/* Digital Key Section */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-amber-300/60 uppercase tracking-wider mb-1">Digital Key</p>
                  <p className="text-sm text-amber-100/80">
                    {isKeyActive ? 'Door Unlocked!' : 'Tap to unlock room'}
                  </p>
                </div>
                <button
                  onClick={handleKeyActivate}
                  className={`relative h-16 w-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isKeyActive
                      ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/50 scale-105'
                      : 'bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/40 hover:scale-105'
                  }`}
                >
                  <Key className={`h-7 w-7 text-white transition-transform ${isKeyActive ? 'rotate-45' : ''}`} />
                  {isKeyActive && (
                    <span className="absolute inset-0 rounded-full border-2 border-emerald-300 animate-ping" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════
              YOUR STAY & QUICK SERVICES - Side by side on desktop
          ═══════════════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* YOUR STAY CARD */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/20">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/20">
                <Clock className="h-5 w-5 text-sky-400" />
              </div>
              <h3 className="text-lg text-white" style={{ fontFamily: 'var(--font-cormorant)' }}>Your Stay</h3>
            </div>

            <div className="p-4 space-y-3">
              {/* Check-in / Nights / Check-out Row */}
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                <div>
                  <p className="text-xs text-white/50">Check-in</p>
                  <p className="font-medium text-white text-sm">{formatDateDisplay(session.stay.checkIn)}</p>
                </div>
                <div className="flex flex-col items-center px-4">
                  <span className="text-2xl font-bold text-amber-400">{session.stay.nights}</span>
                  <span className="text-[10px] text-white/50">nights</span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/50">Check-out</p>
                  <p className="font-medium text-white text-sm">{formatCheckoutDisplay(session.stay.checkOut)}</p>
                </div>
              </div>

              {/* WiFi & Front Desk Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/20">
                    <Wifi className="h-4 w-4 text-sky-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-white/50">WiFi</p>
                    <p className="font-mono text-sm font-medium text-white">{session.wifi.password}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20">
                    <Phone className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-white/50">Front Desk</p>
                    <p className="text-sm font-medium text-white">Dial 0</p>
                  </div>
                </div>
              </div>

              {/* Room Details */}
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/20">
                  <MapPin className="h-4 w-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-[10px] text-white/50">Room Details</p>
                  <p className="text-sm font-medium text-white">{session.room.type} • Floor {session.room.floor}</p>
                </div>
              </div>
            </div>
            </div>

            {/* QUICK SERVICES CARD */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/20">
            {/* Header with Ask AI */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-lg text-white" style={{ fontFamily: 'var(--font-cormorant)' }}>Quick Services</h3>
              <Link href="/register" className="flex items-center gap-1 text-sm text-amber-400 hover:text-amber-300 transition-colors">
                <Bot className="h-4 w-4" />
                Ask AI
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Service Grid */}
            <div className="p-4">
              <div className="grid grid-cols-4 gap-2">
                {quickServices.map((service) => {
                  const Icon = service.icon;

                  if (service.underConstruction) {
                    return (
                      <button
                        key={service.id}
                        onClick={() => handleConstructionClick(service.label)}
                        className="flex flex-col items-center gap-2 py-3 rounded-xl hover:bg-white/10 transition-all group"
                      >
                        <div className="h-11 w-11 rounded-xl bg-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Icon className="h-5 w-5 text-amber-400" />
                        </div>
                        <span className="text-[10px] text-white/70">{service.label}</span>
                      </button>
                    );
                  }

                  return (
                    <Link
                      key={service.id}
                      href={service.href}
                      className="flex flex-col items-center gap-2 py-3 rounded-xl hover:bg-white/10 transition-all group"
                    >
                      <div className="h-11 w-11 rounded-xl bg-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Icon className="h-5 w-5 text-amber-400" />
                      </div>
                      <span className="text-[10px] text-white/70">{service.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
            </div>
          </div>
          {/* End of grid */}

          {/* ═══════════════════════════════════════════════════════════════
              PREFERENCES (if any)
          ═══════════════════════════════════════════════════════════════ */}
          {session.preferences && (session.preferences.dietaryRestrictions?.length || session.preferences.specialRequests?.length) && (
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
              <h3 className="text-sm uppercase tracking-wider text-white/50 mb-3">Your Preferences</h3>
              <div className="space-y-2">
                {session.preferences.dietaryRestrictions && session.preferences.dietaryRestrictions.length > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                    <Utensils className="h-4 w-4 text-amber-400/60" />
                    <div>
                      <p className="text-[10px] text-white/50">Dietary</p>
                      <p className="text-sm text-white">{session.preferences.dietaryRestrictions.join(', ')}</p>
                    </div>
                  </div>
                )}
                {session.preferences.specialRequests && session.preferences.specialRequests.length > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                    <MessageCircle className="h-4 w-4 text-amber-400/60" />
                    <div>
                      <p className="text-[10px] text-white/50">Special Requests</p>
                      <p className="text-sm text-white">{session.preferences.specialRequests.join(', ')}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </main>

        {/* Bottom Navigation */}
        <GuestBottomNav />
      </div>

      {/* Under Construction Modal */}
      {showConstructionModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowConstructionModal(false)}
          />

          {/* Modal */}
          <div className="relative bg-gradient-to-br from-stone-800/95 to-stone-900/95 backdrop-blur-xl rounded-2xl p-6 max-w-sm w-full border border-white/20 shadow-2xl">
            {/* Close button */}
            <button
              onClick={() => setShowConstructionModal(false)}
              className="absolute top-4 right-4 p-1 text-white/50 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Content */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Construction className="w-8 h-8 text-amber-400" />
              </div>

              <h3
                className="text-xl text-white mb-2"
                style={{ fontFamily: 'var(--font-cormorant)' }}
              >
                Coming Soon
              </h3>

              <p className="text-white/60 text-sm mb-4">
                The <span className="text-amber-400 font-medium">{constructionFeature}</span> feature
                is currently under development. We&apos;re working to bring you an exceptional experience.
              </p>

              <p className="text-white/40 text-xs mb-6">
                In the meantime, please contact the front desk for assistance.
              </p>

              <button
                onClick={() => setShowConstructionModal(false)}
                className="w-full py-3 px-4 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-xl text-sm font-medium transition-colors border border-amber-500/30"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
