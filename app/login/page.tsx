'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { KeyRound, Loader2, Sparkles, Shield } from 'lucide-react';

export default function LoginPage() {
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const authenticated = localStorage.getItem('niseko_authenticated');
    if (authenticated === 'true') {
      router.push('/');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: accessCode }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem('niseko_authenticated', 'true');
        localStorage.setItem('niseko_role', data.role);
        if (data.role === 'staff') {
          localStorage.setItem('onsen_authenticated', 'true');
        } else {
          localStorage.setItem('guest_authenticated', 'true');
        }
        router.push('/');
      } else {
        setError(data.error || 'Invalid access code');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Full Page Background */}
      <Image
        src="/hotel3.jpg"
        alt="The 1898 Niseko - Luxury Suite"
        fill
        className="object-cover"
        priority
      />

      {/* Sophisticated Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-stone-900/60" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

      {/* Content */}
      <div className={`relative z-10 min-h-screen flex flex-col transition-opacity duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}>

        {/* Top Badge */}
        <div className="pt-8 md:pt-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs tracking-[0.2em] text-white/90 font-medium">
              AI-POWERED HOSPITALITY
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-md">

            {/* Brand Section */}
            <div className="text-center mb-10">
              <p className="text-xs uppercase tracking-[0.35em] text-amber-400/90 mb-4 font-medium">
                Niseko, Hokkaido
              </p>
              <h1
                className="text-5xl md:text-6xl font-light text-white tracking-wide mb-3"
                style={{ fontFamily: 'var(--font-cormorant)' }}
              >
                THE 1898
              </h1>
              <p
                className="text-2xl md:text-3xl text-white/80 tracking-widest font-light"
                style={{ fontFamily: 'var(--font-cormorant)' }}
              >
                NISEKO
              </p>

              {/* Decorative Line */}
              <div className="flex items-center justify-center gap-4 my-8">
                <div className="w-12 h-px bg-gradient-to-r from-transparent to-amber-400/60" />
                <div className="w-2 h-2 rotate-45 border border-amber-400/60" />
                <div className="w-12 h-px bg-gradient-to-l from-transparent to-amber-400/60" />
              </div>

              {/* Value Proposition */}
              <p className="text-sm md:text-base text-white/70 max-w-sm mx-auto leading-relaxed">
                Experience anticipatory service through our AI concierge —
                where a century of Japanese hospitality meets tomorrow&apos;s intelligence.
              </p>
            </div>

            {/* Login Card */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-400/20 mb-4">
                  <Shield className="w-5 h-5 text-amber-400" />
                </div>
                <h2 className="text-lg font-medium text-white mb-1">Welcome</h2>
                <p className="text-sm text-white/60">Enter your access code to continue</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <div className="relative">
                    <input
                      type="password"
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                      placeholder="Access code"
                      className="w-full px-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-transparent pr-12 transition-all"
                      disabled={isLoading}
                    />
                    <KeyRound className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  </div>
                  {error && (
                    <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-red-400" />
                      {error}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!accessCode.trim() || isLoading}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm font-medium rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <span>Enter Experience</span>
                  )}
                </button>
              </form>

              {/* Access Indicator */}
              <div className="mt-6 pt-5 border-t border-white/10">
                <p className="text-xs text-white/40 text-center">
                  Secure demo access
                </p>
              </div>
            </div>

            {/* Demo Note for Investors */}
            <div className="mt-8 text-center">
              <p className="text-xs text-white/40 mb-2">Interactive Demo Environment</p>
              <div className="flex items-center justify-center gap-3 text-xs text-white/30">
                <span>Voice AI</span>
                <span className="w-1 h-1 rounded-full bg-white/30" />
                <span>Real-time Conversations</span>
                <span className="w-1 h-1 rounded-full bg-white/30" />
                <span>Multi-language</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pb-8 text-center">
          <p className="text-xs text-white/30 tracking-wide">
            Powered by ElevenLabs Conversational AI
          </p>
        </div>
      </div>
    </div>
  );
}
