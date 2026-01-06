'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  User,
  Shield,
  ArrowRight,
  KeyRound,
  ScanLine,
  Hotel,
  Lock,
  Sparkles,
  Phone,
  MessageSquare,
  Users,
} from 'lucide-react';
import { useGuestStore } from '@/lib/stores/guest-store';

type TabType = 'guest' | 'staff';

export default function DemoPage() {
  const router = useRouter();
  const { setGuestMode } = useGuestStore();
  const [activeTab, setActiveTab] = useState<TabType>('guest');
  const [checkInCode, setCheckInCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleGuestCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (checkInCode.trim()) {
      router.push(`/guest/check-in/${checkInCode}`);
    }
  };

  const handleDemoCheckIn = () => {
    router.push('/guest/check-in/DEMO123');
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setGuestMode(false);
    localStorage.setItem('niseko_authenticated', 'true');
    localStorage.setItem('niseko_role', 'admin');
    router.push('/admin');
  };

  const handleAdminDemo = () => {
    setGuestMode(false);
    localStorage.setItem('niseko_authenticated', 'true');
    localStorage.setItem('niseko_role', 'admin');
    router.push('/');
  };

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

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-stone-900/70" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <span className="text-white font-bold" style={{ fontFamily: 'var(--font-cormorant)' }}>18</span>
              </div>
              <div>
                <h1 className="font-bold text-lg text-white">THE 1898</h1>
                <p className="text-xs text-white/50">Niseko Concierge</p>
              </div>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-6 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Hero */}
            <div className="text-center mb-12">
              <h2
                className="text-4xl md:text-5xl font-light text-white tracking-wide mb-4"
                style={{ fontFamily: 'var(--font-cormorant)' }}
              >
                Welcome to <span className="text-amber-400">THE 1898</span>
              </h2>
              <p className="text-lg text-white/60 max-w-2xl mx-auto">
                Your digital gateway to seamless hotel experiences. Check in with ease,
                access your room, and enjoy personalized services.
              </p>
            </div>

            {/* Tabs */}
            <div className="w-full max-w-md mx-auto mb-8">
              <div className="grid grid-cols-2 bg-white/10 backdrop-blur-xl rounded-xl p-1 border border-white/20">
                <button
                  onClick={() => setActiveTab('guest')}
                  className={`flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'guest'
                      ? 'bg-amber-500 text-white shadow-lg'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  <User className="h-4 w-4" />
                  Guest
                </button>
                <button
                  onClick={() => setActiveTab('staff')}
                  className={`flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'staff'
                      ? 'bg-amber-500 text-white shadow-lg'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  <Shield className="h-4 w-4" />
                  Staff
                </button>
              </div>
            </div>

            {/* Guest Tab Content */}
            {activeTab === 'guest' && (
              <>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* QR Code Check-in */}
                  <div className="bg-white/10 backdrop-blur-xl rounded-2xl border-2 border-amber-400/30 hover:border-amber-400/50 transition-colors overflow-hidden">
                    <div className="p-6 border-b border-white/10">
                      <h3 className="flex items-center gap-2 text-xl font-medium text-white" style={{ fontFamily: 'var(--font-cormorant)' }}>
                        <ScanLine className="h-5 w-5 text-amber-400" />
                        Scan QR Code
                      </h3>
                      <p className="text-sm text-white/50 mt-1">
                        Scan the QR code provided at reception for instant check-in
                      </p>
                    </div>
                    <div className="p-6">
                      <div className="flex flex-col items-center py-6">
                        <div className="h-32 w-32 border-2 border-dashed border-amber-400/40 rounded-xl flex items-center justify-center mb-4 bg-white/5">
                          <ScanLine className="h-12 w-12 text-amber-400/40" />
                        </div>
                        <button className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white transition-colors">
                          Open Camera
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Manual Code Entry */}
                  <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
                    <div className="p-6 border-b border-white/10">
                      <h3 className="flex items-center gap-2 text-xl font-medium text-white" style={{ fontFamily: 'var(--font-cormorant)' }}>
                        <KeyRound className="h-5 w-5 text-amber-400" />
                        Enter Code
                      </h3>
                      <p className="text-sm text-white/50 mt-1">
                        Enter your booking code manually to check in
                      </p>
                    </div>
                    <div className="p-6">
                      <form onSubmit={handleGuestCheckIn} className="space-y-4">
                        <div className="space-y-2">
                          <label htmlFor="code" className="block text-sm text-white/70">
                            Booking Code
                          </label>
                          <input
                            id="code"
                            type="text"
                            placeholder="e.g. NIS-2025-DEMO"
                            value={checkInCode}
                            onChange={(e) => setCheckInCode(e.target.value.toUpperCase())}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-center text-lg tracking-widest placeholder:text-white/30 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/50"
                            maxLength={15}
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 rounded-xl text-white font-medium transition-colors"
                        >
                          Check In
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </form>
                    </div>
                  </div>
                </div>

                {/* Demo Link */}
                <div className="mt-8 text-center">
                  <p className="text-sm text-white/50 mb-2">
                    Want to see a demo?
                  </p>
                  <button
                    onClick={handleDemoCheckIn}
                    className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
                  >
                    Try Demo Check-in →
                  </button>
                </div>
              </>
            )}

            {/* Staff Tab Content */}
            {activeTab === 'staff' && (
              <>
                <div className="max-w-md mx-auto">
                  <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
                    <div className="p-6 border-b border-white/10">
                      <h3 className="flex items-center gap-2 text-xl font-medium text-white" style={{ fontFamily: 'var(--font-cormorant)' }}>
                        <Lock className="h-5 w-5 text-amber-400" />
                        Staff Login
                      </h3>
                      <p className="text-sm text-white/50 mt-1">
                        Access the hotel management dashboard
                      </p>
                    </div>
                    <div className="p-6">
                      <form onSubmit={handleAdminLogin} className="space-y-4">
                        <div className="space-y-2">
                          <label htmlFor="email" className="block text-sm text-white/70">
                            Email
                          </label>
                          <input
                            id="email"
                            type="email"
                            placeholder="staff@the1898.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="password" className="block text-sm text-white/70">
                            Password
                          </label>
                          <input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/50"
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 rounded-xl text-white font-medium transition-colors"
                        >
                          Sign In
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </form>
                    </div>
                  </div>
                </div>

                {/* Demo Link */}
                <div className="mt-8 text-center">
                  <p className="text-sm text-white/50 mb-2">
                    Want to explore the admin panel?
                  </p>
                  <button
                    onClick={handleAdminDemo}
                    className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
                  >
                    View Admin Demo →
                  </button>
                </div>
              </>
            )}

            {/* Features */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: KeyRound, label: 'Digital Key', desc: 'Unlock with your phone' },
                { icon: ScanLine, label: 'QR Check-in', desc: 'Instant registration' },
                { icon: Hotel, label: 'Room Services', desc: 'Order from app' },
                { icon: User, label: 'Personalized', desc: 'Tailored offers' },
              ].map((feature) => (
                <div
                  key={feature.label}
                  className="text-center p-4 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="h-12 w-12 mx-auto rounded-full bg-amber-500/10 flex items-center justify-center mb-3">
                    <feature.icon className="h-6 w-6 text-amber-400" />
                  </div>
                  <h3 className="font-medium text-white">{feature.label}</h3>
                  <p className="text-xs text-white/50">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* Footer */}
        <div className="px-6 py-4 text-center border-t border-white/10">
          <p className="text-xs text-white/40">
            Demo mode • No real bookings or transactions
          </p>
        </div>
      </div>
    </div>
  );
}
