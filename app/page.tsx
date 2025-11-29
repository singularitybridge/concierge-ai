'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { LogOut } from 'lucide-react';

export default function WelcomePage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const authenticated = localStorage.getItem('niseko_authenticated');
    const role = localStorage.getItem('niseko_role');

    if (authenticated !== 'true') {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
      setUserRole(role);
      setIsLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('niseko_authenticated');
    localStorage.removeItem('niseko_role');
    localStorage.removeItem('onsen_authenticated');
    localStorage.removeItem('guest_authenticated');
    router.push('/login');
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center">
        <div className="text-white/50 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Full Page Background Image */}
      <Image
        src="/hotel3.jpg"
        alt="The 1898 Niseko"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-black/40" />

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="absolute top-6 right-6 z-20 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg transition-colors"
        title="Logout"
      >
        <LogOut className="w-5 h-5 text-white" />
      </button>

      {/* Content Overlay */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Title */}
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.3em] text-white/70 mb-4">
              Niseko, Hokkaido
            </p>
            <h1
              className="text-5xl md:text-6xl font-light text-white tracking-wide mb-4"
              style={{ fontFamily: 'var(--font-cormorant)' }}
            >
              THE 1898 NISEKO
            </h1>
            <div className="w-16 h-px bg-white/40 mx-auto mb-6" />
            <p className="text-sm text-white/70 max-w-sm mx-auto leading-relaxed">
              {userRole === 'staff'
                ? 'Welcome back. Access your staff tools below.'
                : 'Experience the harmony of century-old Japanese hospitality enhanced by thoughtful technology.'}
            </p>
          </div>

          {/* Portal Options */}
          <div className="space-y-2">
            <Link
              href="/experience"
              className="block p-3 bg-white/70 backdrop-blur-sm rounded-lg hover:bg-white/90 transition-colors text-center"
            >
              <p className="text-sm text-stone-800">Grand Opening Registration</p>
            </Link>

            <Link
              href="/guest"
              className="block p-3 bg-white/70 backdrop-blur-sm rounded-lg hover:bg-white/90 transition-colors text-center"
            >
              <p className="text-sm text-stone-800">Guest Portal</p>
            </Link>

            {userRole === 'staff' && (
              <Link
                href="/admin"
                className="block p-3 bg-white/70 backdrop-blur-sm rounded-lg hover:bg-white/90 transition-colors text-center"
              >
                <p className="text-sm text-stone-800">Staff Portal</p>
              </Link>
            )}

            <Link
              href="/shop"
              className="block p-3 bg-white/70 backdrop-blur-sm rounded-lg hover:bg-white/90 transition-colors text-center"
            >
              <p className="text-sm text-stone-800">Hotel Boutique</p>
            </Link>
          </div>

          {/* Footer */}
          <p className="mt-10 text-center text-xs text-white/50">
            {userRole === 'staff' ? 'Staff Access' : 'Guest Access'}
          </p>
        </div>
      </div>
    </div>
  );
}
