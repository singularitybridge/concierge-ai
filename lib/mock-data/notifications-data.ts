import { GuestNotification } from '@/types/guest';

export const mockNotifications: GuestNotification[] = [
  {
    id: 'notif-1',
    type: 'welcome',
    title: 'Welcome to The 1898',
    message: 'We are delighted to have you with us. Your room is ready and your concierge Yuki is available 24/7.',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    read: true,
    actionUrl: '/guest',
    actionLabel: 'Meet Yuki',
  },
  {
    id: 'notif-2',
    type: 'service',
    title: 'Private Onsen Booking Confirmed',
    message: 'Your private onsen session is confirmed for tomorrow at 6:00 AM. Rooftop bath with mountain view.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: true,
  },
  {
    id: 'notif-3',
    type: 'offer',
    title: 'Exclusive: 20% Off Spa Treatments',
    message: 'As a valued guest, enjoy 20% off all spa treatments this week. Use code RELAX20.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    read: false,
    actionUrl: '/guest/offers',
    actionLabel: 'View Offer',
  },
  {
    id: 'notif-4',
    type: 'reminder',
    title: 'Kaiseki Dinner Tonight',
    message: 'Your reservation at Yuki Restaurant is at 7:00 PM. Smart casual dress code.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
    read: false,
  },
  {
    id: 'notif-5',
    type: 'service',
    title: 'Airport Pickup Arranged',
    message: 'Your private transfer from New Chitose Airport is confirmed for 3:00 PM.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    read: true,
  },
  {
    id: 'notif-6',
    type: 'offer',
    title: 'Fresh Powder Alert!',
    message: '30cm of fresh snow overnight. Perfect conditions for skiing today. Book a private lesson?',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 10), // 10 hours ago
    read: false,
    actionUrl: '/guest/services?category=activities',
    actionLabel: 'Book Lesson',
  },
];

export function getUnreadNotifications(): GuestNotification[] {
  return mockNotifications.filter(n => !n.read);
}

export function getUnreadCount(): number {
  return mockNotifications.filter(n => !n.read).length;
}

export function markAsRead(id: string): void {
  const notification = mockNotifications.find(n => n.id === id);
  if (notification) {
    notification.read = true;
  }
}

export function markAllAsRead(): void {
  mockNotifications.forEach(n => {
    n.read = true;
  });
}
