'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, TrendingUp, Calendar, DollarSign, BarChart3, Percent } from 'lucide-react';
import VoiceSessionChat from '../../components/VoiceSessionChat';
import { useLanguageStore } from '@/lib/use-language-store';

// Mock data for revenue dashboard
const occupancyData = [
  { day: 'Mon', rate: 100 },
  { day: 'Tue', rate: 83 },
  { day: 'Wed', rate: 100 },
  { day: 'Thu', rate: 67 },
  { day: 'Fri', rate: 100 },
  { day: 'Sat', rate: 100 },
  { day: 'Sun', rate: 83 },
];

// Real The 1898 Niseko suite types with premium pricing
const roomPricing = [
  { name: 'Hirafu Penthouse', basePrice: 280000, currentPrice: 320000, demand: 'High' },
  { name: 'Hanazono Penthouse', basePrice: 220000, currentPrice: 250000, demand: 'High' },
  { name: 'Annupuri Duplex', basePrice: 180000, currentPrice: 195000, demand: 'Medium' },
  { name: 'Village Duplex', basePrice: 150000, currentPrice: 150000, demand: 'Medium' },
  { name: 'Moiwa Suite', basePrice: 120000, currentPrice: 135000, demand: 'High' },
  { name: 'Weiss Suite', basePrice: 85000, currentPrice: 78000, demand: 'Low' },
];

export default function RevenueAgentPage() {
  const { language } = useLanguageStore();

  return (
    <div className="flex h-screen bg-stone-100">
      {/* Left: Revenue Dashboard */}
      <div className="flex-[2] min-w-0 overflow-hidden">
        <div className="flex flex-col h-full bg-white">
          {/* Hero Image */}
          <div className="relative h-64 flex-shrink-0">
            <Image
              src="/hotel2.jpg"
              alt="Revenue Management"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            {/* Back Button */}
            <Link
              href="/admin"
              className="absolute top-4 left-4 p-2 bg-white/80 backdrop-blur-sm rounded-full text-stone-600 hover:bg-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            {/* Title Overlay */}
            <div className="absolute bottom-6 left-8 right-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-500 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/80">Revenue Manager</p>
              </div>
              <h1 className="text-2xl font-light text-white tracking-wide" style={{ fontFamily: 'var(--font-cormorant)' }}>
                Pricing & Analytics
              </h1>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 bg-stone-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Percent className="w-4 h-4 text-stone-400" />
                  <span className="text-xs text-stone-500">Occupancy</span>
                </div>
                <p className="text-2xl font-light text-stone-800">89%</p>
                <p className="text-xs text-emerald-600 mt-1">+5% vs last week</p>
              </div>
              <div className="p-4 bg-stone-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-stone-400" />
                  <span className="text-xs text-stone-500">ADR</span>
                </div>
                <p className="text-2xl font-light text-stone-800">¥92K</p>
                <p className="text-xs text-emerald-600 mt-1">+8% vs last week</p>
              </div>
              <div className="p-4 bg-stone-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-stone-400" />
                  <span className="text-xs text-stone-500">RevPAR</span>
                </div>
                <p className="text-2xl font-light text-stone-800">¥82K</p>
                <p className="text-xs text-emerald-600 mt-1">+12% vs last week</p>
              </div>
              <div className="p-4 bg-stone-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-stone-400" />
                  <span className="text-xs text-stone-500">Bookings</span>
                </div>
                <p className="text-2xl font-light text-stone-800">24</p>
                <p className="text-xs text-stone-500 mt-1">Next 30 days</p>
              </div>
            </div>

            {/* Occupancy Chart */}
            <div>
              <h3 className="text-xs font-medium text-stone-500 mb-3 uppercase tracking-wider">Weekly Occupancy</h3>
              <div className="flex items-end gap-2 h-32">
                {occupancyData.map((d) => (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-emerald-100 rounded-t"
                      style={{ height: `${d.rate}%` }}
                    >
                      <div
                        className="w-full bg-emerald-500 rounded-t"
                        style={{ height: `${d.rate}%` }}
                      />
                    </div>
                    <span className="text-xs text-stone-400">{d.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Room Pricing */}
            <div>
              <h3 className="text-xs font-medium text-stone-500 mb-3 uppercase tracking-wider">Dynamic Pricing</h3>
              <div className="space-y-2">
                {roomPricing.map((room) => (
                  <div key={room.name} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-stone-800">{room.name}</p>
                      <p className="text-xs text-stone-500">Base: ¥{room.basePrice.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-stone-800">¥{room.currentPrice.toLocaleString()}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        room.demand === 'High' ? 'bg-emerald-100 text-emerald-700' :
                        room.demand === 'Medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-stone-100 text-stone-600'
                      }`}>
                        {room.demand}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* Right: Voice Chat */}
      <div className="flex-[1] min-w-0 p-6">
        <VoiceSessionChat agentId="revenue-manager" sessionId="revenue" language={language} />
      </div>
    </div>
  );
}
