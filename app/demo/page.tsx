'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Users, User, ArrowRight, Sparkles, Shield, Phone, MessageSquare } from 'lucide-react';
import { useGuestStore } from '@/lib/stores/guest-store';

export default function DemoPage() {
  const router = useRouter();
  const { setGuestMode } = useGuestStore();

  const handleAdminMode = () => {
    setGuestMode(false);
    localStorage.setItem('niseko_authenticated', 'true');
    localStorage.setItem('niseko_role', 'admin');
    router.push('/admin');
  };

  const handleGuestMode = () => {
    setGuestMode(true);
    localStorage.setItem('niseko_authenticated', 'true');
    localStorage.setItem('niseko_role', 'guest');
    router.push('/guest');
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
        <nav className="flex items-center justify-between px-8 py-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <span className="text-white font-bold text-lg" style={{ fontFamily: 'var(--font-cormorant)' }}>18</span>
            </div>
            <div>
              <h1
                className="text-2xl font-light text-white tracking-wide leading-tight group-hover:text-amber-200 transition-colors"
                style={{ fontFamily: 'var(--font-cormorant)' }}
              >
                THE 1898
              </h1>
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">Niseko</p>
            </div>
          </Link>
        </nav>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-8 pb-16">
          <div className="max-w-4xl w-full">
            {/* Title Section */}
            <div className="text-center mb-12">
              <h2
                className="text-5xl md:text-6xl font-light text-white tracking-wide mb-4"
                style={{ fontFamily: 'var(--font-cormorant)' }}
              >
                Welcome to the Demo
              </h2>
              <p className="text-lg text-white/60 max-w-2xl mx-auto">
                Experience our AI-powered concierge system from two perspectives
              </p>
            </div>

            {/* Mode Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Admin Mode Card */}
              <button
                onClick={handleAdminMode}
                className="group bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 hover:border-amber-400/50 hover:bg-white/15 transition-all text-left"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="p-4 bg-amber-500/20 rounded-xl">
                    <Shield className="w-8 h-8 text-amber-400" />
                  </div>
                  <ArrowRight className="w-6 h-6 text-white/30 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                </div>

                <h3
                  className="text-2xl font-light text-white mb-2"
                  style={{ fontFamily: 'var(--font-cormorant)' }}
                >
                  Staff Portal
                </h3>
                <p className="text-white/60 mb-6">
                  Access the admin dashboard, manage guests, revenue intelligence, and staff operations.
                </p>

                <div className="flex flex-wrap gap-2">
                  <span className="text-xs px-3 py-1 bg-white/10 text-white/70 rounded-full">Dashboard</span>
                  <span className="text-xs px-3 py-1 bg-white/10 text-white/70 rounded-full">Revenue</span>
                  <span className="text-xs px-3 py-1 bg-white/10 text-white/70 rounded-full">Staff</span>
                  <span className="text-xs px-3 py-1 bg-white/10 text-white/70 rounded-full">AI Agents</span>
                </div>
              </button>

              {/* Guest Mode Card */}
              <button
                onClick={handleGuestMode}
                className="group bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 hover:border-emerald-400/50 hover:bg-white/15 transition-all text-left"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="p-4 bg-emerald-500/20 rounded-xl">
                    <User className="w-8 h-8 text-emerald-400" />
                  </div>
                  <ArrowRight className="w-6 h-6 text-white/30 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                </div>

                <h3
                  className="text-2xl font-light text-white mb-2"
                  style={{ fontFamily: 'var(--font-cormorant)' }}
                >
                  Guest Experience
                </h3>
                <p className="text-white/60 mb-6">
                  Explore the guest app with digital key, services, offers, and AI concierge.
                </p>

                <div className="flex flex-wrap gap-2">
                  <span className="text-xs px-3 py-1 bg-white/10 text-white/70 rounded-full">Digital Key</span>
                  <span className="text-xs px-3 py-1 bg-white/10 text-white/70 rounded-full">Services</span>
                  <span className="text-xs px-3 py-1 bg-white/10 text-white/70 rounded-full">Offers</span>
                  <span className="text-xs px-3 py-1 bg-white/10 text-white/70 rounded-full">AI Concierge</span>
                </div>
              </button>
            </div>

            {/* Features Section */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                </div>
                <p className="text-sm text-white/70">AI-Powered</p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white/10 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-amber-400" />
                </div>
                <p className="text-sm text-white/70">Voice Enabled</p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white/10 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-amber-400" />
                </div>
                <p className="text-sm text-white/70">Multi-lingual</p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-amber-400" />
                </div>
                <p className="text-sm text-white/70">24/7 Support</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 text-center">
          <p className="text-xs text-white/40">
            Demo mode • No real bookings or transactions
          </p>
        </div>
      </div>
    </div>
  );
}
