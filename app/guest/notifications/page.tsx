'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Bell, Check, Sparkles, Gift, Clock, MessageSquare, ChevronRight } from 'lucide-react';
import { GuestHeader } from '@/app/components/guest/GuestHeader';
import { mockNotifications, markAsRead, markAllAsRead } from '@/lib/mock-data/notifications-data';
import { useGuestStore } from '@/lib/stores/guest-store';
import { GuestNotification, NotificationType } from '@/types/guest';

const notificationIcons: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
  welcome: MessageSquare,
  service: Check,
  offer: Gift,
  reminder: Clock,
  checkout: Bell,
};

const notificationColors: Record<NotificationType, string> = {
  welcome: 'bg-emerald-500/20 text-emerald-400',
  service: 'bg-sky-500/20 text-sky-400',
  offer: 'bg-amber-500/20 text-amber-400',
  reminder: 'bg-purple-500/20 text-purple-400',
  checkout: 'bg-red-500/20 text-red-400',
};

export default function GuestNotificationsPage() {
  const router = useRouter();
  const { setUnreadCount, decrementUnread } = useGuestStore();
  const [notifications, setNotifications] = useState<GuestNotification[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const auth = localStorage.getItem('niseko_authenticated');
    if (auth !== 'true') {
      router.push('/demo');
      return;
    }
    // Load notifications
    setNotifications([...mockNotifications]);
  }, [router]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center">
        <div className="text-white/50 text-sm">Loading...</div>
      </div>
    );
  }

  const handleNotificationClick = (notification: GuestNotification) => {
    if (!notification.read) {
      markAsRead(notification.id);
      decrementUnread();
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
      );
    }
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <Image
        src="/hotel2.jpg"
        alt="The 1898 Niseko"
        fill
        className="object-cover fixed"
        priority
      />
      <div className="fixed inset-0 bg-gradient-to-br from-black/70 via-black/60 to-stone-900/70" />
      <div className="fixed inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

      {/* Content */}
      <div className="relative z-10">
        <GuestHeader title="Notifications" />

        <div className="p-4 space-y-4 pb-24">
          {/* Header with mark all read */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-400" />
              <span className="text-sm text-white/70">
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
              </span>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-amber-400 hover:text-amber-300"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="space-y-3">
            {notifications.map((notification) => {
              const Icon = notificationIcons[notification.type];
              const colorClass = notificationColors[notification.type];

              return (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full text-left bg-white/10 backdrop-blur-xl rounded-xl border transition-all p-4 ${
                    notification.read
                      ? 'border-white/10 opacity-70'
                      : 'border-white/20 hover:border-amber-400/30'
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Icon */}
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${colorClass}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3
                          className={`text-sm font-medium ${
                            notification.read ? 'text-white/70' : 'text-white'
                          }`}
                        >
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <span className="flex-shrink-0 w-2 h-2 bg-amber-400 rounded-full mt-1.5" />
                        )}
                      </div>
                      <p className="text-xs text-white/50 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] text-white/40">
                          {formatTime(notification.timestamp)}
                        </span>
                        {notification.actionLabel && (
                          <span className="text-xs text-amber-400 flex items-center gap-1">
                            {notification.actionLabel}
                            <ChevronRight className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {notifications.length === 0 && (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/50">No notifications yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
