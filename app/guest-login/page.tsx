'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function GuestLoginPage() {
  const [confirmationCode, setConfirmationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Mock validation
    await new Promise(resolve => setTimeout(resolve, 1000));

    setIsLoading(false);

    if (confirmationCode === 'NIS-2025-DEMO') {
      // Demo code works - redirect to a guest page (placeholder)
      localStorage.setItem('guest_authenticated', 'true');
      window.location.href = '/guest';
    } else {
      setError('No reservation found with this confirmation code');
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="p-2 text-stone-400 hover:text-stone-600 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-light text-stone-800 tracking-wide" style={{ fontFamily: 'var(--font-cormorant)' }}>
            THE 1898 NISEKO
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 pb-12">
        <div className="w-full max-w-sm">
          {/* Image */}
          <div className="relative h-40 mb-6 rounded-xl overflow-hidden">
            <Image
              src="/hotel1.jpg"
              alt="Guest Portal"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-xs uppercase tracking-[0.2em] text-white/80">Guest Portal</p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-light text-stone-800 mb-2" style={{ fontFamily: 'var(--font-cormorant)' }}>
              Welcome Back
            </h2>
            <p className="text-sm text-stone-500">
              Enter your reservation confirmation code to access your guest portal
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-stone-500 mb-1.5 uppercase tracking-wider">
                Confirmation Code
              </label>
              <input
                type="text"
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value.toUpperCase())}
                placeholder="e.g. NIS-2025-XXXX"
                className="w-full px-3 py-2.5 bg-white border border-stone-200 rounded-lg text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300 uppercase"
                required
              />
              {error && (
                <p className="mt-2 text-xs text-red-500">{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={!confirmationCode.trim() || isLoading}
              className="w-full py-2.5 bg-stone-800 text-white text-sm rounded-lg hover:bg-stone-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Looking up...
                </>
              ) : (
                'Access Portal'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-stone-400">
            Don't have a reservation?{' '}
            <Link href="/register" className="text-stone-600 hover:text-stone-800">
              Register for updates
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
