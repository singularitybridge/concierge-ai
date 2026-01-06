// Guest-related type definitions

export type ServiceCategory =
  | 'spa'
  | 'restaurant'
  | 'activities'
  | 'transport'
  | 'room_service';

export type NotificationType =
  | 'welcome'
  | 'service'
  | 'offer'
  | 'reminder'
  | 'checkout';

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'checked_in'
  | 'checked_out'
  | 'cancelled';

export type ServiceOrderStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface GuestSession {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  confirmationCode: string;
  room: GuestRoom;
  stay: GuestStay;
  wifi: WifiCredentials;
  preferences?: GuestPreferences;
}

export interface GuestRoom {
  number: string;
  type: string;
  floor: number;
  features: string[];
}

export interface GuestStay {
  checkIn: string;
  checkOut: string;
  nights: number;
}

export interface WifiCredentials {
  network: string;
  password: string;
}

export interface GuestPreferences {
  language?: string;
  dietaryRestrictions?: string[];
  specialRequests?: string[];
}

export interface GuestService {
  id: string;
  name: string;
  nameJa?: string;
  description: string;
  descriptionJa?: string;
  category: ServiceCategory;
  price: number;
  currency: 'JPY';
  duration?: number; // in minutes
  rating?: number;
  reviewCount?: number;
  popular?: boolean;
  available?: boolean;
  icon: string; // Lucide icon name
  image?: string;
}

export interface GuestNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

export interface GuestOffer {
  id: string;
  title: string;
  description: string;
  discount: number;
  discountType: 'percentage' | 'fixed';
  validFrom: Date;
  validUntil: Date;
  category?: ServiceCategory;
  image?: string;
  terms?: string;
  code?: string;
}

export interface ServiceOrder {
  id: string;
  serviceId: string;
  serviceName: string;
  status: ServiceOrderStatus;
  quantity: number;
  totalPrice: number;
  notes?: string;
  scheduledTime?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DigitalKey {
  id: string;
  roomNumber: string;
  isActive: boolean;
  expiresAt: Date;
  lastUsed?: Date;
}

/**
 * Registration data from check-in flow
 * TODO: In production, this would be stored in database and retrieved by guestId
 */
export interface RegisteredGuestData {
  guestId: string;
  name: string;
  email: string;
  phone: string;
  partySize: number;
  children: number;
  arrivalDate: string;
  departureDate: string;
  roomPreference: string;
  transportation: string;
  dietary: string;
  remarks: string;
  registeredAt: string;
}

/**
 * Mock room data based on preference
 * TODO: In production, fetch actual room assignment from database
 */
function generateMockRoom(preference: string): GuestRoom {
  const roomMappings: Record<string, GuestRoom> = {
    'mountain view': {
      number: 'M301',
      type: 'Mountain View Suite',
      floor: 3,
      features: ['Mountain View', 'Private Onsen', 'Tatami Area', 'Heated Floors'],
    },
    'garden': {
      number: 'G201',
      type: 'Garden Suite',
      floor: 2,
      features: ['Zen Garden View', 'Tatami Living', 'Tea Set', 'Shoji Screens'],
    },
    'onsen': {
      number: 'O401',
      type: 'Premium Onsen Suite',
      floor: 4,
      features: ['Premium Private Onsen', 'Heated Floors', 'Mountain View', 'Butler Service'],
    },
    'sky': {
      number: 'S501',
      type: 'Sky Penthouse',
      floor: 5,
      features: ['Wraparound Terrace', 'Butler Service', 'Private Dining', '360 Views'],
    },
    'standard': {
      number: 'R202',
      type: 'Deluxe Room',
      floor: 2,
      features: ['Garden View', 'Tatami Area', 'Tea Set'],
    },
  };

  const key = preference?.toLowerCase() || 'standard';
  const matchedKey = Object.keys(roomMappings).find((k) => key.includes(k)) || 'standard';
  return roomMappings[matchedKey];
}

/**
 * Generate a random WiFi password
 * TODO: In production, use actual hotel WiFi credentials
 */
function generateWifiPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let password = 'NISEKO';
  for (let i = 0; i < 4; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

/**
 * Parse a date string that might be in various formats
 * Handles: "2026-01-02", "January 2nd, 2026", "Jan 2, 2026", etc.
 */
function parseFlexibleDate(dateStr: string): Date {
  if (!dateStr) return new Date();

  // Try ISO format first (YYYY-MM-DD)
  const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    return new Date(parseInt(isoMatch[1]), parseInt(isoMatch[2]) - 1, parseInt(isoMatch[3]));
  }

  // Try standard Date parsing
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }

  // Try to extract date parts from human-readable format
  // Matches: "January 2nd, 2026", "Jan 2, 2026", "December 29th", etc.
  const months: Record<string, number> = {
    january: 0, jan: 0, february: 1, feb: 1, march: 2, mar: 2,
    april: 3, apr: 3, may: 4, june: 5, jun: 5, july: 6, jul: 6,
    august: 7, aug: 7, september: 8, sep: 8, sept: 8, october: 9, oct: 9,
    november: 10, nov: 10, december: 11, dec: 11
  };

  const humanMatch = dateStr.toLowerCase().match(/(\w+)\s+(\d+)(?:st|nd|rd|th)?,?\s*(\d{4})?/);
  if (humanMatch) {
    const monthName = humanMatch[1];
    const day = parseInt(humanMatch[2]);
    const year = humanMatch[3] ? parseInt(humanMatch[3]) : new Date().getFullYear();
    const month = months[monthName];
    if (month !== undefined && day >= 1 && day <= 31) {
      return new Date(year, month, day);
    }
  }

  // Fallback to current date
  return new Date();
}

/**
 * Converts registration data to GuestSession
 * TODO: In production, fetch from database by guestId
 */
export function registrationToSession(data: RegisteredGuestData): GuestSession {
  const arrival = parseFlexibleDate(data.arrivalDate);
  const departure = parseFlexibleDate(data.departureDate);

  // Calculate nights, ensuring we get a valid number
  let nights = 1;
  if (!isNaN(arrival.getTime()) && !isNaN(departure.getTime())) {
    const diffTime = departure.getTime() - arrival.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    nights = Math.max(1, diffDays);
  }

  const confirmationCode = 'NIS-' + Date.now().toString(36).toUpperCase().slice(-6);

  return {
    id: data.guestId,
    name: data.name,
    email: data.email || undefined,
    phone: data.phone || undefined,
    confirmationCode,
    room: generateMockRoom(data.roomPreference),
    stay: {
      checkIn: data.arrivalDate,
      checkOut: data.departureDate,
      nights,
    },
    wifi: {
      network: 'THE1898_GUEST',
      password: generateWifiPassword(),
    },
    preferences: {
      language: 'en',
      dietaryRestrictions: data.dietary ? [data.dietary] : [],
      specialRequests: data.remarks ? [data.remarks] : [],
    },
  };
}
