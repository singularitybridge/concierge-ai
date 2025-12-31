'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Key,
  Wifi,
  Phone,
  MapPin,
  Clock,
  Utensils,
  Sparkles,
  Car,
  Coffee,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import { GuestHeader } from '@/app/components/guest/GuestHeader';
import { DigitalKeyButton } from '@/app/components/guest/DigitalKeyButton';
import { useGuestStore } from '@/lib/stores/guest-store';

const quickServices = [
  { icon: Utensils, label: 'Restaurant', url: '/guest/services?category=restaurant' },
  { icon: Sparkles, label: 'Spa', url: '/guest/services?category=spa' },
  { icon: Car, label: 'Transport', url: '/guest/services?category=transport' },
  { icon: Coffee, label: 'Room Service', url: '/guest/services?category=room_service' },
];

export default function GuestRoomPage() {
  const router = useRouter();
  const { guestSession, isGuestMode } = useGuestStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if in guest mode
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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
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
        <GuestHeader title={`Room ${guestSession.room.number}`} />

        <div className="p-4 space-y-4 pb-24">
          {/* Welcome Card */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <p className="text-sm text-white/60">Welcome back,</p>
            <h2
              className="text-3xl font-light text-white tracking-wide mb-2"
              style={{ fontFamily: 'var(--font-cormorant)' }}
            >
              {guestSession.name}
            </h2>
            <div className="flex items-center gap-2 text-sm text-white/50">
              <MapPin className="h-4 w-4" />
              <span>
                {guestSession.room.type} • Floor {guestSession.room.floor}
              </span>
            </div>
          </div>

          {/* Digital Key */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20">
                <Key className="h-5 w-5 text-amber-400" />
              </div>
              <h3
                className="text-lg text-white"
                style={{ fontFamily: 'var(--font-cormorant)' }}
              >
                Digital Key
              </h3>
            </div>
            <div className="p-4">
              <DigitalKeyButton roomNumber={guestSession.room.number} />
            </div>
          </div>

          {/* Stay Info */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20">
                <Clock className="h-5 w-5 text-amber-400" />
              </div>
              <h3
                className="text-lg text-white"
                style={{ fontFamily: 'var(--font-cormorant)' }}
              >
                Your Stay
              </h3>
            </div>
            <div className="p-4 space-y-3">
              {/* Check-in / Check-out */}
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div>
                  <p className="text-xs text-white/40">Check-in</p>
                  <p className="text-sm font-medium text-white">
                    {formatDate(guestSession.stay.checkIn)}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-white/30" />
                <div className="text-right">
                  <p className="text-xs text-white/40">Check-out</p>
                  <p className="text-sm font-medium text-white">
                    {formatDate(guestSession.stay.checkOut)}
                  </p>
                </div>
              </div>

              {/* WiFi */}
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/20">
                  <Wifi className="h-5 w-5 text-sky-400" />
                </div>
                <div>
                  <p className="text-xs text-white/40">WiFi Password</p>
                  <p className="font-mono text-sm font-medium text-white">
                    {guestSession.wifi.password}
                  </p>
                </div>
              </div>

              {/* Front Desk */}
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20">
                  <Phone className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-white/40">Front Desk</p>
                  <p className="text-sm font-medium text-white">Dial 0 from room phone</p>
                </div>
              </div>
            </div>
          </div>

          {/* Room Features */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <h3
                className="text-lg text-white"
                style={{ fontFamily: 'var(--font-cormorant)' }}
              >
                Room Features
              </h3>
            </div>
            <div className="p-4">
              <div className="flex flex-wrap gap-2">
                {guestSession.room.features.map((feature) => (
                  <span
                    key={feature}
                    className="text-xs px-3 py-1.5 bg-white/10 text-white/70 rounded-full border border-white/10"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Services */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <h3
                className="text-lg text-white"
                style={{ fontFamily: 'var(--font-cormorant)' }}
              >
                Quick Services
              </h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-4 gap-3">
                {quickServices.map((service) => (
                  <Link key={service.label} href={service.url}>
                    <button className="w-full h-auto flex flex-col items-center gap-2 py-4 hover:bg-white/10 rounded-xl transition-colors">
                      <div className="h-12 w-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                        <service.icon className="h-6 w-6 text-amber-400" />
                      </div>
                      <span className="text-xs text-white/70">{service.label}</span>
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
