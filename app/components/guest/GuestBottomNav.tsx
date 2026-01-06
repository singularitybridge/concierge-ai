'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Sparkles, Bell, Gift } from 'lucide-react';
import { useGuestStore } from '@/lib/stores/guest-store';

const navItems = [
  { key: 'room', url: '/guest/room', icon: Home, label: 'Room' },
  { key: 'services', url: '/guest/services', icon: Sparkles, label: 'Services' },
  { key: 'notifications', url: '/guest/notifications', icon: Bell, label: 'Alerts' },
  { key: 'offers', url: '/guest/offers', icon: Gift, label: 'Offers' },
];

export function GuestBottomNav() {
  const pathname = usePathname();
  const { unreadCount } = useGuestStore();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-xl border-t border-white/20 safe-area-bottom">
      <div className="flex items-center justify-around py-3 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.url || pathname.startsWith(item.url + '/');
          const showBadge = item.key === 'notifications' && unreadCount > 0;

          return (
            <Link
              key={item.key}
              href={item.url}
              className={`relative flex flex-col items-center gap-1.5 px-4 py-2 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="relative">
                <item.icon className={`h-5 w-5 ${isActive ? 'text-amber-400' : ''}`} />
                {showBadge && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default GuestBottomNav;
