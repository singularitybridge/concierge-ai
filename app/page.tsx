'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { LogOut, Sparkles, Calendar, Users, Briefcase, ShoppingBag, LayoutDashboard, BarChart3, UserCog, Store } from 'lucide-react';

export default function WelcomePage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const authenticated = localStorage.getItem('niseko_authenticated');

    if (authenticated !== 'true') {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
      setIsLoading(false);
      setMounted(true);
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

  const portals = [
    {
      href: '/operations',
      icon: LayoutDashboard,
      title: 'Operations Dashboard',
      description: 'AI-powered hotel operations center'
    },
    {
      href: '/front-office',
      icon: Users,
      title: 'Front Office',
      description: 'Arrivals, departures & guest services'
    },
    {
      href: '/revenue-intelligence',
      icon: BarChart3,
      title: 'Revenue Intelligence',
      description: 'BI analytics for revenue managers'
    },
    {
      href: '/employee-management',
      icon: UserCog,
      title: 'Employee Management',
      description: 'Staff scheduling, tasks & performance'
    },
    {
      href: '/marketplace',
      icon: Store,
      title: 'Marketplace',
      description: 'PMS integrations & app ecosystem'
    },
    {
      href: '/register',
      icon: Calendar,
      title: 'Register',
      description: 'RSVP for December 10th celebration'
    },
    {
      href: '/admin',
      icon: Briefcase,
      title: 'Staff Portal',
      description: 'Property management system'
    },
    {
      href: '/shop',
      icon: ShoppingBag,
      title: 'Hotel Boutique',
      description: 'Curated local products'
    }
  ];

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

      {/* Sophisticated Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-stone-900/60" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="absolute top-6 right-6 z-20 p-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl border border-white/20 transition-all"
        title="Logout"
      >
        <LogOut className="w-4 h-4 text-white" />
      </button>

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

              {/* Tagline */}
              <p className="text-sm md:text-base text-white/70 max-w-sm mx-auto leading-relaxed">
                Select your experience below
              </p>
            </div>

            {/* Portal Card */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl">
              <div className="space-y-3">
                {portals.map((portal) => (
                  <Link
                    key={portal.href}
                    href={portal.href}
                    className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/30 rounded-xl transition-all group"
                  >
                    <portal.icon className="flex-shrink-0 w-9 h-9 text-amber-400" strokeWidth={1} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white group-hover:text-amber-100 transition-colors">
                        {portal.title}
                      </p>
                      <p className="text-xs text-white/50 truncate">
                        {portal.description}
                      </p>
                    </div>
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-amber-400/20 transition-colors">
                      <svg className="w-3 h-3 text-white/40 group-hover:text-amber-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Demo Footer */}
            <div className="mt-8 text-center">
              <p className="text-xs text-white/40 mb-2">Interactive Demo Environment</p>
              <div className="flex items-center justify-center gap-3 text-xs text-white/30">
                <span>Voice AI</span>
                <span className="w-1 h-1 rounded-full bg-white/30" />
                <span>Real-time</span>
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
