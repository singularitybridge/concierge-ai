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
                {/* Front Side - Japanese Woodblock Print Card */}
                <div
                  className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl shadow-[#401F03]/40"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  {/* Background Image - Mt. Fuji Woodblock Print */}
                  <Image
                    src="/card-bg-fuji.jpg"
                    alt="Mt. Fuji"
                    fill
                    className="object-cover"
                    priority
                  />

                  {/* Warm overlay for brand colors */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#F2AC57]/20 via-transparent to-[#592203]/30" />

                  {/* Dark overlay for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />

                  {/* Card Content */}
                  <div className="relative h-full flex flex-col justify-between p-5">
                    {/* Top Section - Brand */}
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[9px] text-white/70 tracking-[0.25em] mb-0.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">ROOM</p>
                        <h1 className="text-3xl font-light text-white tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{guestSession.room.number}</h1>
                      </div>
                      <div className="text-right">
                        <p className="text-white text-sm tracking-[0.2em] font-light drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">NISEKO</p>
                        <p className="text-[#F2AC57] text-[10px] tracking-[0.15em] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">1898</p>
                      </div>
                    </div>

                    {/* Center - Guest Name */}
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <h2 className="text-lg text-white font-light tracking-[0.15em] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{guestSession.name}</h2>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <Star className="h-2.5 w-2.5 text-[#F2AC57] fill-[#F2AC57] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
                          <p className="text-[9px] text-white/80 tracking-[0.2em] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">PREMIUM GUEST</p>
                          <Star className="h-2.5 w-2.5 text-[#F2AC57] fill-[#F2AC57] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
                        </div>
                      </div>
                    </div>

                    {/* Bottom Section - Key */}
                    <div className="flex items-end justify-between">
                      <button
                        onClick={handleUnlock}
                        className={`relative h-11 w-11 rounded-full flex items-center justify-center transition-all border backdrop-blur-sm ${
                          keyActive
                            ? 'bg-emerald-500/30 border-emerald-400/50'
                            : 'bg-black/20 border-white/30 hover:border-white/50'
                        }`}
                      >
                        <Key className={`h-4 w-4 transition-all drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] ${keyActive ? 'text-emerald-300 rotate-45' : 'text-white'}`} />
                        {keyActive && (
                          <span className="absolute inset-0 rounded-full ring-2 ring-emerald-400 animate-ping" />
                        )}
                      </button>
                      <div className="flex items-center gap-1 text-[9px] text-white/70 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                        <RotateCcw className="h-2.5 w-2.5" />
                        <span className="tracking-[0.15em]">DETAILS</span>
                      </div>
                    </div>
                  </div>

                  {/* Subtle border */}
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />
                </div>

                {/* Back Side - Golden Metal Details */}
                <div
                  className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl shadow-[#401F03]/40 [transform:rotateY(180deg)]"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  {/* Base gold metallic gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#592203] via-[#733858] to-[#260A1C]" />

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
                    <div className="flex items-start justify-between mb-3 pb-3 border-b border-[#F2AC57]/20">
                      <div>
                        <p className="text-[8px] text-[#F2AC57]/50 tracking-[0.2em]">CHECK-IN</p>
                        <p className="text-xs text-[#F7C67E] mt-0.5">{formatDate(guestSession.stay.checkIn)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] text-[#F2AC57]/50 tracking-[0.2em]">CHECK-OUT</p>
                        <p className="text-xs text-[#F7C67E] mt-0.5">{formatDate(guestSession.stay.checkOut)}</p>
                      </div>
                    </div>

                    {/* Middle - Details */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between py-2 border-b border-[#F2AC57]/10">
                        <div className="flex items-center gap-2">
                          <Wifi className="h-3 w-3 text-[#F2AC57]/60" />
                          <span className="text-[9px] text-[#F2AC57]/60">{guestSession.wifi.network}</span>
                        </div>
                        <span className="text-[11px] text-[#F7C67E] font-mono tracking-wider">{guestSession.wifi.password}</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-[#F2AC57]/10">
                        <span className="text-[9px] text-[#F2AC57]/60 tracking-wider">NIGHTS</span>
                        <span className="text-[11px] text-[#F7C67E]">{guestSession.stay.nights}</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-[#F2AC57]/10">
                        <span className="text-[9px] text-[#F2AC57]/60 tracking-wider">FRONT DESK</span>
                        <span className="text-[11px] text-[#F7C67E]">Dial 0</span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-[9px] text-[#F2AC57]/60 tracking-wider">ROOM TYPE</span>
                        <span className="text-[11px] text-[#F7C67E]">{guestSession.room.type}</span>
                      </div>
                    </div>

                    {/* Bottom - Ref & Flip hint */}
                    <div className="flex items-end justify-between pt-2 border-t border-[#F2AC57]/20">
                      <div>
                        <p className="text-[8px] text-[#F2AC57]/40 tracking-[0.1em]">{guestSession.confirmationCode}</p>
                      </div>
                      <div className="flex items-center gap-1 text-[9px] text-[#F2AC57]/50">
                        <RotateCcw className="h-2.5 w-2.5" />
                        <span className="tracking-[0.15em]">FRONT</span>
                      </div>
                    </div>
                  </div>

                  {/* Metallic edge highlight */}
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-[#F2AC57]/20" />
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
              <Link href="/guest" className="flex items-center gap-1 text-sm text-[#F2AC57] hover:text-[#F7C67E]">
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
                      <div className="h-11 w-11 rounded-xl bg-[#F2AC57]/20 flex items-center justify-center">
                        <service.icon className="h-5 w-5 text-[#F2AC57]" />
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
            <div className="bg-gradient-to-r from-[#733858]/30 to-[#733858]/10 backdrop-blur-xl rounded-2xl p-4 border border-[#733858]/40 flex items-center justify-between hover:from-[#733858]/40 hover:to-[#733858]/20 transition-colors">
              <div>
                <h3 className="text-white font-medium">Need Help?</h3>
                <p className="text-sm text-white/60">Talk to Yuki, your AI concierge</p>
              </div>
              <ChevronRight className="h-5 w-5 text-[#F2AC57]" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
