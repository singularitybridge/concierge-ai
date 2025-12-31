import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  GuestSession,
  ServiceOrder,
  DigitalKey,
  RegisteredGuestData,
  registrationToSession,
} from '@/types/guest';

// Default mock guest session
const defaultGuestSession: GuestSession = {
  id: 'demo-guest-001',
  name: 'Avi Osipov',
  email: 'avi@example.com',
  phone: '+1-555-123-4567',
  confirmationCode: 'NIS-2025-DEMO',
  room: {
    number: 'P301',
    type: 'Mountain View Suite',
    floor: 3,
    features: ['Private Onsen', 'Mountain View', 'Tatami Area', 'Pet Friendly'],
  },
  stay: {
    checkIn: '2025-12-20',
    checkOut: '2025-12-24',
    nights: 4,
  },
  wifi: {
    network: 'THE1898_GUEST',
    password: 'NISEKO2025',
  },
  preferences: {
    language: 'en',
    dietaryRestrictions: [],
    specialRequests: ['Airport Pickup at 3:00 PM'],
  },
};

interface GuestState {
  isGuestMode: boolean;
  guestSession: GuestSession | null;
  digitalKey: DigitalKey | null;
  isKeyActive: boolean;
  serviceOrders: ServiceOrder[];
  unreadCount: number;
  setGuestMode: (enabled: boolean) => void;
  setGuestSession: (session: GuestSession | null) => void;
  setGuestSessionFromRegistration: (data: RegisteredGuestData) => void;
  activateKey: () => void;
  deactivateKey: () => void;
  addServiceOrder: (order: ServiceOrder) => void;
  updateServiceOrder: (id: string, status: ServiceOrder['status']) => void;
  setUnreadCount: (count: number) => void;
  decrementUnread: () => void;
  resetGuestState: () => void;
}

export const useGuestStore = create<GuestState>()(
  persist(
    (set, get) => ({
      isGuestMode: false,
      guestSession: null,
      digitalKey: null,
      isKeyActive: false,
      serviceOrders: [],
      unreadCount: 3,

      setGuestMode: (enabled) => {
        set({
          isGuestMode: enabled,
          guestSession: enabled ? defaultGuestSession : null,
          digitalKey: enabled ? {
            id: 'key-001',
            roomNumber: defaultGuestSession.room.number,
            isActive: true,
            expiresAt: new Date('2025-12-24T12:00:00'),
          } : null,
        });
      },

      setGuestSession: (session) => set({ guestSession: session }),

      setGuestSessionFromRegistration: (data) => {
        const session = registrationToSession(data);
        set({
          isGuestMode: true,
          guestSession: session,
          digitalKey: {
            id: 'key-' + session.id,
            roomNumber: session.room.number,
            isActive: true,
            expiresAt: new Date(session.stay.checkOut),
          },
        });
      },

      activateKey: () => {
        set({ isKeyActive: true });
        setTimeout(() => {
          set({ isKeyActive: false });
        }, 3000);
      },

      deactivateKey: () => set({ isKeyActive: false }),

      addServiceOrder: (order) => {
        set((state) => ({
          serviceOrders: [...state.serviceOrders, order],
        }));
      },

      updateServiceOrder: (id, status) => {
        set((state) => ({
          serviceOrders: state.serviceOrders.map((order) =>
            order.id === id ? { ...order, status, updatedAt: new Date() } : order
          ),
        }));
      },

      setUnreadCount: (count) => set({ unreadCount: count }),

      decrementUnread: () => {
        set((state) => ({
          unreadCount: Math.max(0, state.unreadCount - 1),
        }));
      },

      resetGuestState: () => {
        set({
          isGuestMode: false,
          guestSession: null,
          digitalKey: null,
          isKeyActive: false,
          serviceOrders: [],
          unreadCount: 3,
        });
      },
    }),
    {
      name: 'guest-storage',
      partialize: (state) => ({
        isGuestMode: state.isGuestMode,
        guestSession: state.guestSession,
        serviceOrders: state.serviceOrders,
        unreadCount: state.unreadCount,
      }),
    }
  )
);
