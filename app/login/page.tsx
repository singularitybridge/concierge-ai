'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { KeyRound, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: accessCode }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem('onsen_authenticated', 'true');
        router.push('/admin');
      } else {
        setError('Invalid access code');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Header */}
      <div className="p-6">
        <h1 className="text-xl font-light text-stone-800 tracking-wide text-center" style={{ fontFamily: 'var(--font-cormorant)' }}>
          THE 1898 NISEKO
        </h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 pb-12">
        <div className="w-full max-w-sm">
          {/* Image */}
          <div className="relative h-48 mb-8 rounded-xl overflow-hidden">
            <Image
              src="/hotel2.jpg"
              alt="The 1898 Niseko"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-xs uppercase tracking-[0.2em] text-white/80">Staff Portal</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs text-stone-500 mb-2 uppercase tracking-wider">
                Access Code
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  placeholder="Enter your access code"
                  className="w-full px-4 py-3 bg-white border border-stone-200 rounded-lg text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300 pr-10"
                  disabled={isLoading}
                />
                <KeyRound className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              </div>
              {error && (
                <p className="mt-2 text-xs text-red-500">{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={!accessCode.trim() || isLoading}
              className="w-full py-3 bg-stone-800 text-white text-sm rounded-lg hover:bg-stone-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Enter'
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-xs text-stone-400">
            Property Management System
          </p>
        </div>
      </div>
    </div>
  );
}
