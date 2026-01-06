'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Key,
  Wifi,
  Phone,
  Utensils,
  Sparkles,
  Car,
  Coffee,
  ChevronRight,
  Star,
  RotateCcw,
  Bot,
} from 'lucide-react';
import { GuestHeader } from '@/app/components/guest/GuestHeader';
import { useGuestStore } from '@/lib/stores/guest-store';

const quickServices = [
  { icon: Utensils, label: 'Restaurant', url: '/guest/services?category=restaurant' },
  { icon: Sparkles, label: 'Spa', url: '/guest/services?category=spa' },
  { icon: Car, label: 'Transport', url: '/guest/services?category=transport' },
  { icon: Coffee, label: 'Room Service', url: '/guest/services?category=room_service' },
];

// SVG for Mt. Fuji with Cherry Blossoms - Laser Engraved Style
const JapaneseSceneSVG = () => (
  <svg
    viewBox="0 0 400 200"
    className="absolute inset-0 w-full h-full"
    preserveAspectRatio="xMidYMid slice"
  >
    <defs>
      {/* Gold gradient for engraved effect */}
      <linearGradient id="goldEngraved" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#b8860b" stopOpacity="0.15" />
        <stop offset="50%" stopColor="#daa520" stopOpacity="0.25" />
        <stop offset="100%" stopColor="#b8860b" stopOpacity="0.15" />
      </linearGradient>

      {/* Lighter gold for highlights */}
      <linearGradient id="goldHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#ffd700" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#b8860b" stopOpacity="0.1" />
      </linearGradient>
    </defs>

    {/* Mt. Fuji - Main Mountain */}
    <path
      d="M200 40 L280 160 L120 160 Z"
      fill="url(#goldEngraved)"
      stroke="#c9a227"
      strokeWidth="0.5"
      strokeOpacity="0.4"
    />
    {/* Snow cap */}
    <path
      d="M200 40 L220 70 L180 70 Z"
      fill="url(#goldHighlight)"
      stroke="#daa520"
      strokeWidth="0.3"
      strokeOpacity="0.5"
    />

    {/* Distant mountain left */}
    <path
      d="M50 80 L100 160 L0 160 Z"
      fill="url(#goldEngraved)"
      stroke="#c9a227"
      strokeWidth="0.3"
      strokeOpacity="0.3"
    />

    {/* Torii Gate */}
    <g stroke="#c9a227" strokeWidth="1" fill="none" strokeOpacity="0.5">
      <line x1="60" y1="120" x2="60" y2="160" />
      <line x1="90" y1="120" x2="90" y2="160" />
      <path d="M55 120 Q75 110 95 120" />
      <line x1="55" y1="130" x2="95" y2="130" />
    </g>

    {/* Cherry Blossom Tree - Right side */}
    <g fill="url(#goldEngraved)" stroke="#c9a227" strokeWidth="0.3" strokeOpacity="0.4">
      {/* Trunk */}
      <path d="M350 200 Q360 150 355 100 Q350 80 340 60" fill="none" strokeWidth="2" strokeOpacity="0.5" />
      {/* Branches */}
      <path d="M355 100 Q320 90 300 70" fill="none" strokeWidth="1" />
      <path d="M350 120 Q310 110 280 100" fill="none" strokeWidth="0.8" />
      <path d="M340 80 Q370 60 390 50" fill="none" strokeWidth="0.8" />
    </g>

    {/* Cherry blossoms clusters */}
    <g fill="#c9a227" fillOpacity="0.3">
      <circle cx="300" cy="65" r="15" />
      <circle cx="280" cy="80" r="12" />
      <circle cx="320" cy="55" r="10" />
      <circle cx="270" cy="95" r="14" />
      <circle cx="295" cy="90" r="10" />
      <circle cx="390" cy="45" r="12" />
      <circle cx="370" cy="55" r="10" />
      <circle cx="250" cy="75" r="8" />
    </g>

    {/* Cherry Blossom Tree - Left side */}
    <g fill="url(#goldEngraved)" stroke="#c9a227" strokeWidth="0.3" strokeOpacity="0.4">
      <path d="M30 200 Q20 150 25 120" fill="none" strokeWidth="1.5" strokeOpacity="0.4" />
      <path d="M25 120 Q50 100 80 90" fill="none" strokeWidth="0.6" />
      <path d="M25 130 Q60 120 90 115" fill="none" strokeWidth="0.5" />
    </g>

    {/* Left blossoms */}
    <g fill="#c9a227" fillOpacity="0.25">
      <circle cx="85" cy="85" r="12" />
      <circle cx="70" cy="95" r="10" />
      <circle cx="95" cy="110" r="8" />
      <circle cx="55" cy="80" r="8" />
    </g>

    {/* Water/Lake reflection lines */}
    <g stroke="#c9a227" strokeOpacity="0.2" strokeWidth="0.5" fill="none">
      <path d="M0 170 Q100 165 200 170 Q300 175 400 168" />
      <path d="M0 180 Q150 175 300 180 Q350 182 400 178" />
      <path d="M50 190 Q150 185 250 190" />
    </g>

    {/* Flying birds */}
    <g stroke="#c9a227" strokeWidth="0.5" strokeOpacity="0.4" fill="none">
      <path d="M150 50 Q155 45 160 50 Q165 45 170 50" />
      <path d="M180 60 Q183 57 186 60 Q189 57 192 60" />
      <path d="M130 65 Q134 61 138 65 Q142 61 146 65" />
    </g>
  </svg>
);

export default function GuestRoomPage() {
  const router = useRouter();
  const { guestSession } = useGuestStore();
  const [mounted, setMounted] = useState(false);
  const [keyActive, setKeyActive] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    setMounted(true);
    const auth = localStorage.getItem('niseko_authenticated');
    if (auth !== 'true') {
      router.push('/demo');
    }
  }, [router]);

  if (!mounted || !guestSession) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center">
        <div className="text-white/50 text-sm">Loading...</div>
      </div>
    );
  }

  const handleUnlock = (e: React.MouseEvent) => {
    e.stopPropagation();
    setKeyActive(true);
    setTimeout(() => setKeyActive(false), 3000);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <Image
        src="/hotel2.jpg"
        alt="The 1898 Niseko"
        fill
        className="object-cover fixed"
        priority
      />
      <div className="fixed inset-0 bg-gradient-to-br from-black/70 via-black/60 to-stone-900/70" />
      <div className="fixed inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

      {/* Content */}
      <div className="relative z-10">
        <GuestHeader title="My Room" />

        <div className="p-4 space-y-4 pb-24">
          {/* Luxury Hotel Key Card - Golden Metal with Laser Engraved Japanese Scene */}
          <div className="perspective-1000">
            <div
              className="relative w-full cursor-pointer"
              style={{ height: '240px' }}
              onClick={handleFlip}
            >
              <div
                className={`w-full h-full transition-transform duration-700 ease-in-out ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Front Side - Golden Metal Card with Laser Engraved Scene */}
                <div
                  className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl shadow-amber-900/40"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  {/* Base gold metallic gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-700 via-yellow-600 to-amber-800" />

                  {/* Brushed metal texture */}
                  <div
                    className="absolute inset-0 opacity-30"
                    style={{
                      backgroundImage: `repeating-linear-gradient(
                        90deg,
                        transparent,
                        transparent 1px,
                        rgba(255,255,255,0.03) 1px,
                        rgba(255,255,255,0.03) 2px
                      )`
                    }}
                  />

                  {/* Gold shine overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-amber-300/20 to-transparent" />

                  {/* Laser engraved Japanese scene */}
                  <JapaneseSceneSVG />

                  {/* Dark overlay for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />

                  {/* Card Content */}
                  <div className="relative h-full flex flex-col justify-between p-5">
                    {/* Top Section - Brand */}
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[9px] text-amber-200/60 tracking-[0.25em] mb-0.5">ROOM</p>
                        <h1 className="text-3xl font-light text-white tracking-wider drop-shadow-lg">{guestSession.room.number}</h1>
                      </div>
                      <div className="text-right">
                        <p className="text-amber-100 text-sm tracking-[0.2em] font-light drop-shadow">NISEKO</p>
                        <p className="text-amber-200/70 text-[10px] tracking-[0.15em]">1898</p>
                      </div>
                    </div>

                    {/* Center - Guest Name */}
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <h2 className="text-lg text-white font-light tracking-[0.15em] drop-shadow-lg">{guestSession.name}</h2>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <Star className="h-2.5 w-2.5 text-amber-300/80 fill-amber-300/80" />
                          <p className="text-[9px] text-amber-200/70 tracking-[0.2em]">PREMIUM GUEST</p>
                          <Star className="h-2.5 w-2.5 text-amber-300/80 fill-amber-300/80" />
                        </div>
                      </div>
                    </div>

                    {/* Bottom Section - Key */}
                    <div className="flex items-end justify-between">
                      <button
                        onClick={handleUnlock}
                        className={`relative h-11 w-11 rounded-full flex items-center justify-center transition-all border ${
                          keyActive
                            ? 'bg-emerald-500/30 border-emerald-400/50'
                            : 'bg-black/20 border-amber-400/30 hover:border-amber-300/50'
                        }`}
                      >
                        <Key className={`h-4 w-4 transition-all ${keyActive ? 'text-emerald-300 rotate-45' : 'text-amber-200'}`} />
                        {keyActive && (
                          <span className="absolute inset-0 rounded-full ring-2 ring-emerald-400 animate-ping" />
                        )}
                      </button>
                      <div className="flex items-center gap-1 text-[9px] text-amber-200/50">
                        <RotateCcw className="h-2.5 w-2.5" />
                        <span className="tracking-[0.15em]">DETAILS</span>
                      </div>
                    </div>
                  </div>

                  {/* Metallic edge highlight */}
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-amber-300/30" />
                </div>

                {/* Back Side - Golden Metal Details */}
                <div
                  className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl shadow-amber-900/40 [transform:rotateY(180deg)]"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  {/* Base gold metallic gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-800 via-yellow-700 to-amber-900" />

                  {/* Brushed metal texture */}
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: `repeating-linear-gradient(
                        0deg,
                        transparent,
                        transparent 1px,
                        rgba(255,255,255,0.02) 1px,
                        rgba(255,255,255,0.02) 2px
                      )`
                    }}
                  />

                  {/* Card Content */}
                  <div className="relative h-full flex flex-col p-5">
                    {/* Top Row - Dates */}
                    <div className="flex items-start justify-between mb-3 pb-3 border-b border-amber-400/20">
                      <div>
                        <p className="text-[8px] text-amber-300/50 tracking-[0.2em]">CHECK-IN</p>
                        <p className="text-xs text-amber-100 mt-0.5">{formatDate(guestSession.stay.checkIn)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] text-amber-300/50 tracking-[0.2em]">CHECK-OUT</p>
                        <p className="text-xs text-amber-100 mt-0.5">{formatDate(guestSession.stay.checkOut)}</p>
                      </div>
                    </div>

                    {/* Middle - Details */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between py-2 border-b border-amber-400/10">
                        <div className="flex items-center gap-2">
                          <Wifi className="h-3 w-3 text-amber-300/60" />
                          <span className="text-[9px] text-amber-200/60">{guestSession.wifi.network}</span>
                        </div>
                        <span className="text-[11px] text-amber-100 font-mono tracking-wider">{guestSession.wifi.password}</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-amber-400/10">
                        <span className="text-[9px] text-amber-200/60 tracking-wider">NIGHTS</span>
                        <span className="text-[11px] text-amber-100">{guestSession.stay.nights}</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-amber-400/10">
                        <span className="text-[9px] text-amber-200/60 tracking-wider">FRONT DESK</span>
                        <span className="text-[11px] text-amber-100">Dial 0</span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-[9px] text-amber-200/60 tracking-wider">ROOM TYPE</span>
                        <span className="text-[11px] text-amber-100">{guestSession.room.type}</span>
                      </div>
                    </div>

                    {/* Bottom - Ref & Flip hint */}
                    <div className="flex items-end justify-between pt-2 border-t border-amber-400/20">
                      <div>
                        <p className="text-[8px] text-amber-300/40 tracking-[0.1em]">{guestSession.confirmationCode}</p>
                      </div>
                      <div className="flex items-center gap-1 text-[9px] text-amber-200/50">
                        <RotateCcw className="h-2.5 w-2.5" />
                        <span className="tracking-[0.15em]">FRONT</span>
                      </div>
                    </div>
                  </div>

                  {/* Metallic edge highlight */}
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-amber-300/20" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Services */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3
                className="text-lg text-white"
                style={{ fontFamily: 'var(--font-cormorant)' }}
              >
                Quick Services
              </h3>
              <Link href="/guest" className="flex items-center gap-1 text-sm text-amber-400 hover:text-amber-300">
                <Bot className="h-4 w-4" />
                Ask AI
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-4 gap-2">
                {quickServices.map((service) => (
                  <Link key={service.label} href={service.url}>
                    <button className="w-full h-auto flex flex-col items-center gap-2 py-3 hover:bg-white/10 rounded-xl transition-colors">
                      <div className="h-11 w-11 rounded-xl bg-amber-500/20 flex items-center justify-center">
                        <service.icon className="h-5 w-5 text-amber-400" />
                      </div>
                      <span className="text-[10px] text-white/70">{service.label}</span>
                    </button>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Need Help */}
          <Link href="/guest">
            <div className="bg-gradient-to-r from-amber-500/20 to-amber-600/10 backdrop-blur-xl rounded-2xl p-4 border border-amber-500/30 flex items-center justify-between hover:from-amber-500/30 hover:to-amber-600/20 transition-colors">
              <div>
                <h3 className="text-white font-medium">Need Help?</h3>
                <p className="text-sm text-white/60">Talk to Yuki, your AI concierge</p>
              </div>
              <ChevronRight className="h-5 w-5 text-amber-400" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
