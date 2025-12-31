'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, LogOut, User } from 'lucide-react';
import { useGuestStore } from '@/lib/stores/guest-store';
import LanguageSelector from '../LanguageSelector';

interface GuestHeaderProps {
  title?: string;
  showBack?: boolean;
  backUrl?: string;
  transparent?: boolean;
}

export function GuestHeader({
  title,
  showBack = false,
  backUrl,
  transparent = false,
}: GuestHeaderProps) {
  const router = useRouter();
  const { guestSession, resetGuestState } = useGuestStore();

  const handleLogout = () => {
    resetGuestState();
    localStorage.removeItem('niseko_authenticated');
    localStorage.removeItem('niseko_role');
    router.push('/demo');
  };

  const handleBack = () => {
    if (backUrl) {
      router.push(backUrl);
    } else {
      router.back();
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 ${
        transparent
          ? 'bg-transparent'
          : 'bg-white/10 backdrop-blur-xl border-b border-white/20'
      }`}
    >
      <div className="flex h-16 items-center justify-between px-5">
        {/* Left - Back button or Logo */}
        <div className="flex items-center gap-3">
          {showBack ? (
            <button
              onClick={handleBack}
              className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
          ) : (
            <Link href="/guest" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <span
                  className="text-white font-bold text-xs"
                  style={{ fontFamily: 'var(--font-cormorant)' }}
                >
                  18
                </span>
              </div>
            </Link>
          )}

          {title && (
            <h1
              className="text-xl font-light text-white tracking-wide"
              style={{ fontFamily: 'var(--font-cormorant)' }}
            >
              {title}
            </h1>
          )}
        </div>

        {/* Right - User info and actions */}
        <div className="flex items-center gap-2">
          <LanguageSelector />

          {guestSession && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full">
              <User className="w-4 h-4 text-white/70" />
              <span className="text-sm text-white/70">
                {guestSession.name.split(' ')[0]}
              </span>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            title="Exit Demo"
          >
            <LogOut className="w-5 h-5 text-white/70 hover:text-white" />
          </button>
        </div>
      </div>
    </header>
  );
}

export default GuestHeader;
