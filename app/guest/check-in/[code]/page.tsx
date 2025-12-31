'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Check, X, Loader2, User, Calendar, MapPin, Home } from 'lucide-react';
import { useGuestStore } from '@/lib/stores/guest-store';

type CheckInStatus = 'loading' | 'success' | 'error';

export default function CheckInPage() {
  const router = useRouter();
  const params = useParams();
  const code = params.code as string;
  const { setGuestMode, guestSession } = useGuestStore();

  const [status, setStatus] = useState<CheckInStatus>('loading');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Simulate verification process
    const verifyCode = async () => {
      setStatus('loading');

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Check if valid demo code
      const validCodes = ['NIS-2025-DEMO', 'DEMO123', 'NISEKO2025'];
      const upperCode = code.toUpperCase();

      if (validCodes.includes(upperCode)) {
        setGuestMode(true);
        localStorage.setItem('niseko_authenticated', 'true');
        localStorage.setItem('niseko_role', 'guest');
        setStatus('success');

        // Redirect after success animation
        setTimeout(() => {
          router.push('/guest/room');
        }, 2000);
      } else {
        setStatus('error');
        setError('Invalid booking code. Please check and try again.');
      }
    };

    verifyCode();
  }, [code, setGuestMode, router]);

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
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/70 to-stone-900/80" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <nav className="flex items-center justify-center px-8 py-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg" style={{ fontFamily: 'var(--font-cormorant)' }}>18</span>
            </div>
            <div>
              <h1
                className="text-2xl font-light text-white tracking-wide"
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
          <div className="max-w-md w-full">
            {/* Status Card */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 text-center">
              {status === 'loading' && (
                <>
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
                  </div>
                  <h2
                    className="text-2xl font-light text-white mb-2"
                    style={{ fontFamily: 'var(--font-cormorant)' }}
                  >
                    Verifying Your Booking
                  </h2>
                  <p className="text-white/60">Please wait while we confirm your reservation...</p>
                  <div className="mt-6 p-3 bg-white/5 rounded-lg">
                    <p className="text-xs text-white/40">Booking Code</p>
                    <p className="text-sm font-mono text-white/80">{code.toUpperCase()}</p>
                  </div>
                </>
              )}

              {status === 'success' && guestSession && (
                <>
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center animate-pulse">
                    <Check className="w-10 h-10 text-emerald-400" />
                  </div>
                  <h2
                    className="text-2xl font-light text-white mb-2"
                    style={{ fontFamily: 'var(--font-cormorant)' }}
                  >
                    Welcome, {guestSession.name}!
                  </h2>
                  <p className="text-white/60 mb-6">Your check-in is complete</p>

                  {/* Booking Details */}
                  <div className="space-y-3 text-left">
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                      <Home className="w-5 h-5 text-amber-400" />
                      <div>
                        <p className="text-xs text-white/40">Room</p>
                        <p className="text-sm text-white">{guestSession.room.type} - {guestSession.room.number}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                      <Calendar className="w-5 h-5 text-amber-400" />
                      <div>
                        <p className="text-xs text-white/40">Stay</p>
                        <p className="text-sm text-white">{guestSession.stay.nights} nights</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-white/40 mt-6">Redirecting to your room...</p>
                </>
              )}

              {status === 'error' && (
                <>
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
                    <X className="w-10 h-10 text-red-400" />
                  </div>
                  <h2
                    className="text-2xl font-light text-white mb-2"
                    style={{ fontFamily: 'var(--font-cormorant)' }}
                  >
                    Verification Failed
                  </h2>
                  <p className="text-white/60 mb-6">{error}</p>

                  <div className="space-y-3">
                    <Link
                      href="/demo"
                      className="block w-full py-3 px-6 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition-colors"
                    >
                      Try Again
                    </Link>
                    <Link
                      href="/"
                      className="block w-full py-3 px-6 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
                    >
                      Back to Home
                    </Link>
                  </div>
                </>
              )}
            </div>

            {/* Demo Hint */}
            {status === 'error' && (
              <div className="mt-6 text-center">
                <p className="text-xs text-white/40">
                  Demo codes: NIS-2025-DEMO, DEMO123, NISEKO2025
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
