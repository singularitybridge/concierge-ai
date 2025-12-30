import { create } from 'zustand';

// Types
export type ReservationStatus = 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'no_show';
export type RoomStatus = 'clean' | 'dirty' | 'inspected' | 'out_of_order' | 'out_of_service';
export type GuestRequestStatus = 'pending' | 'in_progress' | 'completed' | 'escalated';
export type GuestRequestType = 'housekeeping' | 'maintenance' | 'amenity' | 'food_beverage' | 'concierge' | 'complaint';
export type GuestRequestPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface UpsellOffer {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'spa' | 'dining' | 'activities' | 'room_upgrade' | 'transport' | 'amenity';
  targetAudience: ('couple' | 'family' | 'business' | 'vip' | 'solo' | 'all')[];
  icon: string;
}

export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationality: string;
  vipStatus: 'none' | 'silver' | 'gold' | 'platinum';
  totalStays: number;
  preferences: string[];
  specialRequests?: string;
}

export interface Reservation {
  id: string;
  confirmationNumber: string;
  guest: Guest;
  roomNumber: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  adults: number;
  children: number;
  status: ReservationStatus;
  rate: number;
  totalAmount: number;
  paymentStatus: 'pending' | 'partial' | 'paid';
  source: string;
  specialRequests?: string;
  arrivalTime?: string;
  departureTime?: string;
  isEarlyCheckin?: boolean;
  isLateCheckout?: boolean;
  balance: number;
}

export interface RoomInfo {
  number: string;
  floor: number;
  type: string;
  status: RoomStatus;
  isOccupied: boolean;
  currentGuest?: string;
  reservationId?: string;
  housekeeperAssigned?: string;
  lastCleaned?: string;
  notes?: string;
  // For rooms being cleaned - estimated ready time
  estimatedReadyTime?: string;
  cleaningStartedAt?: string;
  // Room features
  bedType: 'twin' | 'double' | 'king' | 'twin_king';
  view: 'mountain' | 'garden' | 'courtyard' | 'city';
  hasBalcony: boolean;
  sqm: number;
}

export interface RoomUpgradeOption {
  fromType: string;
  toType: string;
  priceDifference: number;
  availableRooms: RoomInfo[];
}

export interface GuestRequest {
  id: string;
  reservationId: string;
  roomNumber: string;
  guestName: string;
  type: GuestRequestType;
  priority: GuestRequestPriority;
  status: GuestRequestStatus;
  description: string;
  createdAt: string;
  assignedTo?: string;
  department: string;
  estimatedCompletion?: string;
  completedAt?: string;
  notes?: string;
}

export interface StaffAlert {
  id: string;
  type: 'vip_arrival' | 'early_checkin' | 'late_checkout' | 'complaint' | 'maintenance' | 'payment' | 'special_request';
  priority: 'info' | 'warning' | 'urgent';
  title: string;
  message: string;
  roomNumber?: string;
  timestamp: string;
  acknowledged: boolean;
}

// Billing & Payment Types
export type ChargeCategory = 'room' | 'minibar' | 'restaurant' | 'spa' | 'room_service' | 'laundry' | 'phone' | 'parking' | 'upgrade' | 'other' | 'tax' | 'service_fee';
export type PaymentMethod = 'credit_card' | 'debit_card' | 'cash' | 'room_charge' | 'bank_transfer' | 'mobile_payment' | 'crypto';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';

export interface BillingCharge {
  id: string;
  category: ChargeCategory;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  date: string;
  time?: string;
  outlet?: string; // e.g., "Yukibana Restaurant", "Lobby Bar"
  reference?: string; // POS reference or receipt number
}

export interface PaymentRecord {
  id: string;
  method: PaymentMethod;
  amount: number;
  currency: string;
  status: PaymentStatus;
  transactionId?: string;
  cardLast4?: string;
  cardBrand?: string;
  timestamp: string;
  processedBy?: string;
}

export interface GuestBilling {
  reservationId: string;
  guestName: string;
  roomNumber: string;
  checkInDate: string;
  checkOutDate: string;
  charges: BillingCharge[];
  payments: PaymentRecord[];
  subtotal: number;
  taxAmount: number;
  serviceCharge: number;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  deposit?: number;
  currency: string;
}

export interface OccupancyMetrics {
  today: { rooms: number; percentage: number };
  tomorrow: { rooms: number; percentage: number };
  dayAfter: { rooms: number; percentage: number };
  mtd: { average: number };
  ytd: { average: number };
}

export interface RoomStatusSummary {
  total: number;
  occupied: number;
  vacant: number;
  clean: number;
  dirty: number;
  inspected: number;
  outOfOrder: number;
  outOfService: number;
}

export interface FrontOfficeState {
  // Current date/time context
  currentDate: string;
  currentShift: 'morning' | 'afternoon' | 'night';

  // Arrivals & Departures
  todayArrivals: Reservation[];
  todayDepartures: Reservation[];
  inHouseGuests: Reservation[];

  // Room information
  rooms: RoomInfo[];
  roomStatusSummary: RoomStatusSummary;

  // Guest requests & services
  guestRequests: GuestRequest[];

  // Alerts
  staffAlerts: StaffAlert[];

  // Metrics
  occupancyMetrics: OccupancyMetrics;
  todayRevenue: number;
  adr: number;

  // Upsells
  upsellOffers: UpsellOffer[];

  // Billing
  guestBillings: GuestBilling[];

  // Actions
  checkInGuest: (reservationId: string) => void;
  checkInGuestWithDetails: (reservationId: string, updates: {
    guest?: Partial<Guest>;
    roomNumber?: string;
    specialRequests?: string;
    selectedUpsells?: string[];
  }) => void;
  checkOutGuest: (reservationId: string) => void;
  checkOutGuestWithPayment: (reservationId: string, paymentMethod: PaymentMethod, paymentDetails?: { cardLast4?: string; cardBrand?: string }) => void;
  updateRoomStatus: (roomNumber: string, status: RoomStatus) => void;
  updateRequestStatus: (requestId: string, status: GuestRequestStatus) => void;
  acknowledgeAlert: (alertId: string) => void;
  getAvailableRooms: (roomType?: string) => RoomInfo[];
  getRoomsBecomingReady: () => RoomInfo[];
  getRoomUpgradeOptions: (currentRoomType: string, nights: number) => RoomUpgradeOption[];
  getRecommendedUpsells: (reservation: Reservation) => UpsellOffer[];
  getGuestBilling: (reservationId: string) => GuestBilling | undefined;
  refreshData: () => void;
}

// Guest name generators
const firstNames = ['Takeshi', 'Yuki', 'Hiroshi', 'Sakura', 'Kenji', 'Aiko', 'Ryo', 'Mika', 'John', 'Emily', 'Michael', 'Sarah', 'David', 'Jennifer', 'James', 'Lisa', 'Robert', 'Maria', 'William', 'Anna', 'Chen', 'Wei', 'Min', 'Jae', 'Soo'];
const lastNames = ['Tanaka', 'Yamamoto', 'Suzuki', 'Watanabe', 'Sato', 'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Wilson', 'Anderson', 'Thomas', 'Wang', 'Li', 'Zhang', 'Kim', 'Park'];
const nationalities = ['Japan', 'USA', 'UK', 'Australia', 'China', 'South Korea', 'Singapore', 'Hong Kong', 'Taiwan', 'Germany', 'France', 'Canada'];
const roomTypes = ['Standard', 'Deluxe', 'Suite', 'Penthouse'];
const sources = ['Direct', 'Booking.com', 'Expedia', 'Agoda', 'Phone', 'Corporate', 'Travel Agent'];

const generateConfirmationNumber = () => {
  return 'RB' + Math.random().toString(36).substring(2, 8).toUpperCase();
};

const generateGuest = (): Guest => {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const vipOptions: Guest['vipStatus'][] = ['none', 'none', 'none', 'silver', 'gold', 'platinum'];

  return {
    id: Math.random().toString(36).substring(2, 9),
    firstName,
    lastName,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
    phone: `+81-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
    nationality: nationalities[Math.floor(Math.random() * nationalities.length)],
    vipStatus: vipOptions[Math.floor(Math.random() * vipOptions.length)],
    totalStays: Math.floor(Math.random() * 10),
    preferences: [],
  };
};

const generateReservation = (checkInOffset: number, status: ReservationStatus): Reservation => {
  const today = new Date();
  const checkIn = new Date(today);
  checkIn.setDate(today.getDate() + checkInOffset);

  const nights = Math.floor(Math.random() * 5) + 1;
  const checkOut = new Date(checkIn);
  checkOut.setDate(checkIn.getDate() + nights);

  const guest = generateGuest();
  const roomType = roomTypes[Math.floor(Math.random() * roomTypes.length)];
  const floor = Math.floor(Math.random() * 5) + 1;
  const roomNum = Math.floor(Math.random() * 55) + 1;
  const roomNumber = `${floor}${roomNum.toString().padStart(2, '0')}`;

  const baseRates: Record<string, number> = { Standard: 35000, Deluxe: 48000, Suite: 72000, Penthouse: 125000 };
  const rate = baseRates[roomType] * (0.9 + Math.random() * 0.2);

  const adults = Math.floor(Math.random() * 2) + 1;
  const children = Math.random() > 0.7 ? Math.floor(Math.random() * 2) + 1 : 0;

  const totalAmount = rate * nights;
  const paymentStatuses: Reservation['paymentStatus'][] = ['pending', 'partial', 'paid'];
  const paymentStatus = paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];
  const balance = paymentStatus === 'paid' ? 0 : paymentStatus === 'partial' ? totalAmount * 0.5 : totalAmount;

  const hours = Math.floor(Math.random() * 12) + 8; // 8 AM to 8 PM
  const minutes = Math.floor(Math.random() * 60);
  const arrivalTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

  return {
    id: Math.random().toString(36).substring(2, 9),
    confirmationNumber: generateConfirmationNumber(),
    guest,
    roomNumber,
    roomType,
    checkInDate: checkIn.toISOString().split('T')[0],
    checkOutDate: checkOut.toISOString().split('T')[0],
    nights,
    adults,
    children,
    status,
    rate: Math.round(rate),
    totalAmount: Math.round(totalAmount),
    paymentStatus,
    source: sources[Math.floor(Math.random() * sources.length)],
    arrivalTime,
    isEarlyCheckin: Math.random() > 0.85,
    isLateCheckout: Math.random() > 0.85,
    balance: Math.round(balance),
  };
};

const generateRooms = (): RoomInfo[] => {
  const rooms: RoomInfo[] = [];
  const housekeepers = ['Yuki S.', 'Kenji M.', 'Aiko T.', 'Hiroshi N.', 'Sakura K.'];
  const views: RoomInfo['view'][] = ['mountain', 'garden', 'courtyard', 'city'];

  const roomTypeConfig: Record<string, { sqm: number; beds: RoomInfo['bedType'][]; hasBalcony: boolean }> = {
    Standard: { sqm: 28, beds: ['twin', 'double'], hasBalcony: false },
    Deluxe: { sqm: 38, beds: ['double', 'king'], hasBalcony: true },
    Suite: { sqm: 55, beds: ['king', 'twin_king'], hasBalcony: true },
    Penthouse: { sqm: 95, beds: ['king'], hasBalcony: true },
  };

  for (let floor = 1; floor <= 5; floor++) {
    for (let room = 1; room <= 55; room++) {
      const roomNumber = `${floor}${room.toString().padStart(2, '0')}`;
      let roomType: string;
      if (room <= 34) roomType = 'Standard';
      else if (room <= 49) roomType = 'Deluxe';
      else if (room <= 54) roomType = 'Suite';
      else roomType = 'Penthouse';

      const config = roomTypeConfig[roomType];
      const isOccupied = Math.random() > 0.25;
      const statuses: RoomStatus[] = isOccupied
        ? ['clean']
        : ['clean', 'clean', 'dirty', 'dirty', 'inspected', 'out_of_order'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      // For dirty rooms, add estimated ready time
      let estimatedReadyTime: string | undefined;
      let cleaningStartedAt: string | undefined;
      let housekeeperAssigned: string | undefined;

      if (status === 'dirty' && !isOccupied) {
        const now = new Date();
        const minutesUntilReady = Math.floor(Math.random() * 90) + 15; // 15-105 minutes
        const readyTime = new Date(now.getTime() + minutesUntilReady * 60000);
        estimatedReadyTime = readyTime.toTimeString().slice(0, 5);

        // Some rooms have cleaning in progress
        if (Math.random() > 0.5) {
          const startedMinutesAgo = Math.floor(Math.random() * 30);
          const startTime = new Date(now.getTime() - startedMinutesAgo * 60000);
          cleaningStartedAt = startTime.toTimeString().slice(0, 5);
          housekeeperAssigned = housekeepers[Math.floor(Math.random() * housekeepers.length)];
        }
      }

      // Determine view based on room position
      const view = floor >= 4 ? 'mountain' : views[room % views.length];

      rooms.push({
        number: roomNumber,
        floor,
        type: roomType,
        status,
        isOccupied,
        currentGuest: isOccupied ? `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}` : undefined,
        estimatedReadyTime,
        cleaningStartedAt,
        housekeeperAssigned,
        bedType: config.beds[Math.floor(Math.random() * config.beds.length)],
        view,
        hasBalcony: config.hasBalcony && (floor >= 3 || roomType !== 'Standard'),
        sqm: config.sqm + Math.floor(Math.random() * 5),
      });
    }
  }

  return rooms;
};

const generateGuestRequests = (): GuestRequest[] => {
  const requestTypes: { type: GuestRequestType; descriptions: string[]; department: string }[] = [
    { type: 'housekeeping', descriptions: ['Extra towels needed', 'Room cleaning requested', 'Bed linen change', 'Minibar restock', 'Turndown service'], department: 'Housekeeping' },
    { type: 'maintenance', descriptions: ['AC not cooling properly', 'TV remote not working', 'Bathroom light flickering', 'Safe won\'t open', 'WiFi connectivity issue'], department: 'Engineering' },
    { type: 'amenity', descriptions: ['Extra pillows', 'Iron and ironing board', 'Baby crib needed', 'Yoga mat request', 'Extra blanket'], department: 'Housekeeping' },
    { type: 'food_beverage', descriptions: ['Room service order', 'Late night snack request', 'Special dietary meal', 'Champagne for celebration', 'Breakfast in room'], department: 'F&B' },
    { type: 'concierge', descriptions: ['Restaurant reservation', 'Ski equipment rental', 'Airport transfer', 'Spa appointment', 'Tour booking'], department: 'Concierge' },
    { type: 'complaint', descriptions: ['Noise from adjacent room', 'Room temperature issue', 'Slow service complaint', 'Billing discrepancy', 'WiFi speed complaint'], department: 'Front Office' },
  ];

  const requests: GuestRequest[] = [];
  const numRequests = Math.floor(Math.random() * 8) + 5;

  for (let i = 0; i < numRequests; i++) {
    const reqType = requestTypes[Math.floor(Math.random() * requestTypes.length)];
    const floor = Math.floor(Math.random() * 5) + 1;
    const roomNum = Math.floor(Math.random() * 55) + 1;
    const roomNumber = `${floor}${roomNum.toString().padStart(2, '0')}`;
    const priorities: GuestRequestPriority[] = ['low', 'medium', 'medium', 'high', 'urgent'];
    const statuses: GuestRequestStatus[] = ['pending', 'pending', 'in_progress', 'in_progress', 'completed'];

    const createdMinutesAgo = Math.floor(Math.random() * 180);
    const createdAt = new Date();
    createdAt.setMinutes(createdAt.getMinutes() - createdMinutesAgo);

    requests.push({
      id: Math.random().toString(36).substring(2, 9),
      reservationId: Math.random().toString(36).substring(2, 9),
      roomNumber,
      guestName: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
      type: reqType.type,
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      description: reqType.descriptions[Math.floor(Math.random() * reqType.descriptions.length)],
      createdAt: createdAt.toISOString(),
      department: reqType.department,
    });
  }

  return requests.sort((a, b) => {
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
};

const generateStaffAlerts = (arrivals: Reservation[]): StaffAlert[] => {
  const alerts: StaffAlert[] = [];
  const now = new Date().toISOString();

  // VIP arrival alerts
  arrivals.filter(a => a.guest.vipStatus !== 'none').forEach(a => {
    alerts.push({
      id: Math.random().toString(36).substring(2, 9),
      type: 'vip_arrival',
      priority: a.guest.vipStatus === 'platinum' ? 'urgent' : 'warning',
      title: `VIP ${a.guest.vipStatus.toUpperCase()} Arrival`,
      message: `${a.guest.firstName} ${a.guest.lastName} arriving today - Room ${a.roomNumber}`,
      roomNumber: a.roomNumber,
      timestamp: now,
      acknowledged: false,
    });
  });

  // Early check-in alerts
  arrivals.filter(a => a.isEarlyCheckin).forEach(a => {
    alerts.push({
      id: Math.random().toString(36).substring(2, 9),
      type: 'early_checkin',
      priority: 'info',
      title: 'Early Check-in Request',
      message: `${a.guest.firstName} ${a.guest.lastName} requested early check-in - Room ${a.roomNumber}`,
      roomNumber: a.roomNumber,
      timestamp: now,
      acknowledged: false,
    });
  });

  // Sample maintenance alert
  alerts.push({
    id: Math.random().toString(36).substring(2, 9),
    type: 'maintenance',
    priority: 'warning',
    title: 'Maintenance Required',
    message: 'Room 312 - AC unit reported not working properly',
    roomNumber: '312',
    timestamp: now,
    acknowledged: false,
  });

  // Sample payment alert
  alerts.push({
    id: Math.random().toString(36).substring(2, 9),
    type: 'payment',
    priority: 'info',
    title: 'Balance Due at Checkout',
    message: '3 departures today have outstanding balances totaling ¥85,000',
    timestamp: now,
    acknowledged: true,
  });

  return alerts;
};

const calculateRoomStatusSummary = (rooms: RoomInfo[]): RoomStatusSummary => {
  return {
    total: rooms.length,
    occupied: rooms.filter(r => r.isOccupied).length,
    vacant: rooms.filter(r => !r.isOccupied).length,
    clean: rooms.filter(r => r.status === 'clean').length,
    dirty: rooms.filter(r => r.status === 'dirty').length,
    inspected: rooms.filter(r => r.status === 'inspected').length,
    outOfOrder: rooms.filter(r => r.status === 'out_of_order').length,
    outOfService: rooms.filter(r => r.status === 'out_of_service').length,
  };
};

// Upsell offers
const upsellOffers: UpsellOffer[] = [
  // Spa & Wellness
  { id: 'spa-couples', name: 'Couples Spa Package', description: '90-minute couples massage with hot stone therapy and champagne', price: 45000, category: 'spa', targetAudience: ['couple', 'vip'], icon: 'heart' },
  { id: 'spa-relaxation', name: 'Relaxation Massage', description: '60-minute full body relaxation massage', price: 18000, category: 'spa', targetAudience: ['all'], icon: 'sparkles' },
  { id: 'spa-onsen', name: 'Private Onsen Session', description: '2-hour private onsen with mountain views', price: 25000, category: 'spa', targetAudience: ['couple', 'vip', 'solo'], icon: 'bath' },

  // Dining
  { id: 'dinner-romantic', name: 'Romantic Dinner', description: 'Private candlelit dinner for two with 7-course kaiseki menu', price: 65000, category: 'dining', targetAudience: ['couple', 'vip'], icon: 'wine' },
  { id: 'dinner-family', name: 'Family Dining Experience', description: 'Kids-friendly teppanyaki dinner with entertainment', price: 48000, category: 'dining', targetAudience: ['family'], icon: 'utensils' },
  { id: 'breakfast-room', name: 'In-Room Breakfast', description: 'Premium Japanese breakfast delivered to your room', price: 8500, category: 'dining', targetAudience: ['all'], icon: 'coffee' },

  // Activities
  { id: 'ski-pass', name: 'Ski Lift Pass', description: 'Full-day ski lift pass for Niseko United', price: 12000, category: 'activities', targetAudience: ['all'], icon: 'mountain' },
  { id: 'kids-club', name: 'Kids Snow Camp', description: 'Half-day supervised snow activities for children 4-12', price: 15000, category: 'activities', targetAudience: ['family'], icon: 'snowflake' },
  { id: 'snowmobile', name: 'Snowmobile Tour', description: '2-hour guided snowmobile adventure through backcountry', price: 35000, category: 'activities', targetAudience: ['couple', 'solo', 'vip'], icon: 'zap' },
  { id: 'heli-ski', name: 'Helicopter Skiing', description: 'Premium backcountry helicopter skiing experience', price: 180000, category: 'activities', targetAudience: ['vip'], icon: 'plane' },

  // Room Upgrades
  { id: 'upgrade-deluxe', name: 'Upgrade to Deluxe', description: 'Upgrade to a spacious Deluxe room with mountain view', price: 15000, category: 'room_upgrade', targetAudience: ['all'], icon: 'arrow-up' },
  { id: 'upgrade-suite', name: 'Upgrade to Suite', description: 'Upgrade to a luxurious Suite with separate living area', price: 35000, category: 'room_upgrade', targetAudience: ['couple', 'family', 'vip'], icon: 'crown' },
  { id: 'upgrade-penthouse', name: 'Upgrade to Penthouse', description: 'Ultimate luxury - Top floor penthouse with panoramic views', price: 85000, category: 'room_upgrade', targetAudience: ['vip'], icon: 'star' },

  // Transport
  { id: 'airport-transfer', name: 'Airport Transfer', description: 'Private car transfer to/from New Chitose Airport', price: 28000, category: 'transport', targetAudience: ['all'], icon: 'car' },
  { id: 'airport-vip', name: 'VIP Airport Service', description: 'Luxury vehicle with meet & greet and luggage handling', price: 55000, category: 'transport', targetAudience: ['vip', 'business'], icon: 'briefcase' },
  { id: 'ski-shuttle', name: 'Private Ski Shuttle', description: 'On-demand private shuttle to ski slopes', price: 8000, category: 'transport', targetAudience: ['all'], icon: 'bus' },

  // Amenities
  { id: 'champagne', name: 'Welcome Champagne', description: 'Bottle of premium champagne waiting in room', price: 18000, category: 'amenity', targetAudience: ['couple', 'vip'], icon: 'wine' },
  { id: 'flowers', name: 'Flower Arrangement', description: 'Beautiful seasonal flower arrangement for room', price: 12000, category: 'amenity', targetAudience: ['couple', 'vip'], icon: 'flower' },
  { id: 'kids-welcome', name: 'Kids Welcome Pack', description: 'Toys, snacks, and kid-friendly amenities', price: 5000, category: 'amenity', targetAudience: ['family'], icon: 'gift' },
  { id: 'late-checkout', name: 'Late Checkout (2PM)', description: 'Extend your stay until 2:00 PM', price: 8000, category: 'amenity', targetAudience: ['all'], icon: 'clock' },
];

// Generate guest billing data for a reservation
const generateGuestBilling = (reservation: Reservation): GuestBilling => {
  const charges: BillingCharge[] = [];
  const guestName = `${reservation.guest.firstName} ${reservation.guest.lastName}`;

  // Room charges (per night)
  for (let i = 0; i < reservation.nights; i++) {
    const chargeDate = new Date(reservation.checkInDate);
    chargeDate.setDate(chargeDate.getDate() + i);
    charges.push({
      id: `room-${reservation.id}-${i}`,
      category: 'room',
      description: `${reservation.roomType} Room - Night ${i + 1}`,
      quantity: 1,
      unitPrice: reservation.rate,
      amount: reservation.rate,
      date: chargeDate.toISOString().split('T')[0],
      outlet: 'Room Division',
    });
  }

  // Mini bar charges (random)
  if (Math.random() > 0.4) {
    const minibarItems = [
      { desc: 'Premium Water (2)', price: 800 },
      { desc: 'Soft Drinks', price: 500 },
      { desc: 'Japanese Whisky', price: 3500 },
      { desc: 'Craft Beer Selection', price: 1800 },
      { desc: 'Premium Snacks', price: 1200 },
      { desc: 'Sake (300ml)', price: 2500 },
    ];
    const numItems = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numItems; i++) {
      const item = minibarItems[Math.floor(Math.random() * minibarItems.length)];
      charges.push({
        id: `minibar-${reservation.id}-${i}`,
        category: 'minibar',
        description: `Mini Bar - ${item.desc}`,
        quantity: 1,
        unitPrice: item.price,
        amount: item.price,
        date: reservation.checkInDate,
        time: `${Math.floor(Math.random() * 12) + 18}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
        outlet: 'In-Room Mini Bar',
      });
    }
  }

  // Restaurant charges (random)
  if (Math.random() > 0.3) {
    const restaurants = ['Yukibana Japanese Restaurant', 'Powder Lounge & Bar', 'Mountain View Breakfast'];
    const numMeals = Math.floor(Math.random() * 4) + 1;
    for (let i = 0; i < numMeals; i++) {
      const mealPrice = Math.floor(Math.random() * 15000) + 3500;
      charges.push({
        id: `restaurant-${reservation.id}-${i}`,
        category: 'restaurant',
        description: restaurants[Math.floor(Math.random() * restaurants.length)],
        quantity: reservation.adults + reservation.children,
        unitPrice: mealPrice,
        amount: mealPrice * (reservation.adults + reservation.children),
        date: reservation.checkInDate,
        time: ['07:30', '12:00', '18:30', '20:00'][Math.floor(Math.random() * 4)],
        outlet: restaurants[Math.floor(Math.random() * restaurants.length)],
        reference: `POS-${Math.floor(Math.random() * 10000)}`,
      });
    }
  }

  // Spa charges (random)
  if (Math.random() > 0.6) {
    const spaServices = [
      { desc: 'Deep Tissue Massage (60min)', price: 18000 },
      { desc: 'Hot Stone Therapy (90min)', price: 25000 },
      { desc: 'Couples Spa Package', price: 45000 },
      { desc: 'Onsen Access', price: 3500 },
      { desc: 'Facial Treatment', price: 15000 },
    ];
    const service = spaServices[Math.floor(Math.random() * spaServices.length)];
    charges.push({
      id: `spa-${reservation.id}`,
      category: 'spa',
      description: service.desc,
      quantity: 1,
      unitPrice: service.price,
      amount: service.price,
      date: reservation.checkInDate,
      time: '14:00',
      outlet: 'Niseko Wellness Spa',
    });
  }

  // Room service charges (random)
  if (Math.random() > 0.5) {
    const roomServiceItems = [
      { desc: 'In-Room Breakfast', price: 4500 },
      { desc: 'Late Night Snacks', price: 2800 },
      { desc: 'Champagne Service', price: 12000 },
      { desc: 'Afternoon Tea Set', price: 6500 },
    ];
    const item = roomServiceItems[Math.floor(Math.random() * roomServiceItems.length)];
    charges.push({
      id: `roomservice-${reservation.id}`,
      category: 'room_service',
      description: `Room Service - ${item.desc}`,
      quantity: 1,
      unitPrice: item.price,
      amount: item.price,
      date: reservation.checkInDate,
      outlet: 'Room Service',
    });
  }

  // Room upgrade (random)
  if (Math.random() > 0.8) {
    charges.push({
      id: `upgrade-${reservation.id}`,
      category: 'upgrade',
      description: 'Room Upgrade - Mountain View Premium',
      quantity: reservation.nights,
      unitPrice: 8000,
      amount: 8000 * reservation.nights,
      date: reservation.checkInDate,
      outlet: 'Front Desk',
    });
  }

  // Laundry (random)
  if (Math.random() > 0.7) {
    charges.push({
      id: `laundry-${reservation.id}`,
      category: 'laundry',
      description: 'Express Laundry Service',
      quantity: 1,
      unitPrice: 3500,
      amount: 3500,
      date: reservation.checkInDate,
      outlet: 'Housekeeping',
    });
  }

  // Parking (random)
  if (Math.random() > 0.6) {
    charges.push({
      id: `parking-${reservation.id}`,
      category: 'parking',
      description: 'Valet Parking',
      quantity: reservation.nights,
      unitPrice: 2000,
      amount: 2000 * reservation.nights,
      date: reservation.checkInDate,
      outlet: 'Valet Services',
    });
  }

  // Calculate totals
  const subtotal = charges.reduce((sum, c) => sum + c.amount, 0);
  const taxAmount = Math.round(subtotal * 0.10); // 10% consumption tax
  const serviceCharge = Math.round(subtotal * 0.10); // 10% service charge
  const totalAmount = subtotal + taxAmount + serviceCharge;

  // Add tax and service charges
  charges.push({
    id: `tax-${reservation.id}`,
    category: 'tax',
    description: 'Consumption Tax (10%)',
    quantity: 1,
    unitPrice: taxAmount,
    amount: taxAmount,
    date: reservation.checkOutDate,
  });

  charges.push({
    id: `service-${reservation.id}`,
    category: 'service_fee',
    description: 'Service Charge (10%)',
    quantity: 1,
    unitPrice: serviceCharge,
    amount: serviceCharge,
    date: reservation.checkOutDate,
  });

  // Generate any pre-payments
  const payments: PaymentRecord[] = [];
  const depositAmount = Math.round(reservation.totalAmount * 0.3);
  if (reservation.paymentStatus !== 'pending') {
    payments.push({
      id: `payment-deposit-${reservation.id}`,
      method: 'credit_card',
      amount: reservation.paymentStatus === 'paid' ? totalAmount : depositAmount,
      currency: 'JPY',
      status: 'completed',
      cardLast4: Math.floor(Math.random() * 9000 + 1000).toString(),
      cardBrand: ['Visa', 'Mastercard', 'Amex', 'JCB'][Math.floor(Math.random() * 4)],
      timestamp: reservation.checkInDate,
      processedBy: 'Front Desk',
    });
  }

  const paidAmount = payments.reduce((sum, p) => sum + (p.status === 'completed' ? p.amount : 0), 0);

  return {
    reservationId: reservation.id,
    guestName,
    roomNumber: reservation.roomNumber,
    checkInDate: reservation.checkInDate,
    checkOutDate: reservation.checkOutDate,
    charges,
    payments,
    subtotal,
    taxAmount,
    serviceCharge,
    totalAmount,
    paidAmount,
    balance: totalAmount - paidAmount,
    deposit: reservation.paymentStatus !== 'pending' ? depositAmount : undefined,
    currency: 'JPY',
  };
};

// Generate initial data
const generateInitialData = () => {
  const todayArrivals = Array.from({ length: Math.floor(Math.random() * 15) + 20 }, () =>
    generateReservation(0, 'confirmed')
  );

  const todayDepartures = Array.from({ length: Math.floor(Math.random() * 12) + 15 }, () =>
    generateReservation(-Math.floor(Math.random() * 3) - 1, 'checked_in')
  );

  const inHouseGuests = Array.from({ length: Math.floor(Math.random() * 50) + 150 }, () =>
    generateReservation(-Math.floor(Math.random() * 5), 'checked_in')
  );

  const rooms = generateRooms();
  const roomStatusSummary = calculateRoomStatusSummary(rooms);
  const guestRequests = generateGuestRequests();
  const staffAlerts = generateStaffAlerts(todayArrivals);

  // Generate billing data for all reservations
  const allReservations = [...todayArrivals, ...todayDepartures, ...inHouseGuests];
  const guestBillings = allReservations.map(res => generateGuestBilling(res));

  const occupancyMetrics: OccupancyMetrics = {
    today: { rooms: roomStatusSummary.occupied, percentage: Math.round((roomStatusSummary.occupied / roomStatusSummary.total) * 100) },
    tomorrow: { rooms: Math.floor(Math.random() * 50) + 180, percentage: Math.floor(Math.random() * 20) + 70 },
    dayAfter: { rooms: Math.floor(Math.random() * 50) + 170, percentage: Math.floor(Math.random() * 20) + 65 },
    mtd: { average: Math.floor(Math.random() * 10) + 75 },
    ytd: { average: Math.floor(Math.random() * 10) + 72 },
  };

  return {
    todayArrivals,
    todayDepartures,
    inHouseGuests,
    rooms,
    roomStatusSummary,
    guestRequests,
    staffAlerts,
    occupancyMetrics,
    guestBillings,
    todayRevenue: Math.floor(Math.random() * 5000000) + 8000000,
    adr: Math.floor(Math.random() * 5000) + 42000,
  };
};

const initialData = generateInitialData();

export const useFrontOfficeStore = create<FrontOfficeState>((set, get) => ({
  currentDate: new Date().toISOString().split('T')[0],
  currentShift: (() => {
    const hour = new Date().getHours();
    if (hour >= 7 && hour < 15) return 'morning';
    if (hour >= 15 && hour < 23) return 'afternoon';
    return 'night';
  })(),

  ...initialData,
  upsellOffers,

  checkInGuest: (reservationId) => {
    const arrivals = get().todayArrivals.map(r =>
      r.id === reservationId ? { ...r, status: 'checked_in' as ReservationStatus } : r
    );
    const checkedInReservation = arrivals.find(r => r.id === reservationId && r.status === 'checked_in');
    const inHouse = checkedInReservation
      ? [...get().inHouseGuests, checkedInReservation]
      : get().inHouseGuests;

    // Update room to occupied
    const rooms = get().rooms.map(r =>
      r.number === checkedInReservation?.roomNumber
        ? { ...r, isOccupied: true, currentGuest: `${checkedInReservation.guest.firstName} ${checkedInReservation.guest.lastName}`, reservationId }
        : r
    );

    set({ todayArrivals: arrivals, inHouseGuests: inHouse, rooms, roomStatusSummary: calculateRoomStatusSummary(rooms) });
  },

  checkInGuestWithDetails: (reservationId, updates) => {
    const { guest: guestUpdates, roomNumber: newRoom, specialRequests, selectedUpsells } = updates;

    let arrivals = get().todayArrivals.map(r => {
      if (r.id !== reservationId) return r;

      const updatedGuest = guestUpdates ? { ...r.guest, ...guestUpdates } : r.guest;
      const updatedRoom = newRoom || r.roomNumber;
      const upsellTotal = selectedUpsells
        ? selectedUpsells.reduce((sum, id) => {
            const offer = upsellOffers.find(o => o.id === id);
            return sum + (offer?.price || 0);
          }, 0)
        : 0;

      return {
        ...r,
        status: 'checked_in' as ReservationStatus,
        guest: updatedGuest,
        roomNumber: updatedRoom,
        specialRequests: specialRequests || r.specialRequests,
        totalAmount: r.totalAmount + upsellTotal,
        balance: r.balance + upsellTotal,
      };
    });

    const checkedInReservation = arrivals.find(r => r.id === reservationId);
    const inHouse = checkedInReservation
      ? [...get().inHouseGuests, checkedInReservation]
      : get().inHouseGuests;

    // Update room to occupied
    const rooms = get().rooms.map(r =>
      r.number === checkedInReservation?.roomNumber
        ? { ...r, isOccupied: true, currentGuest: `${checkedInReservation.guest.firstName} ${checkedInReservation.guest.lastName}`, reservationId }
        : r
    );

    set({ todayArrivals: arrivals, inHouseGuests: inHouse, rooms, roomStatusSummary: calculateRoomStatusSummary(rooms) });
  },

  checkOutGuest: (reservationId) => {
    const departure = get().todayDepartures.find(r => r.id === reservationId);
    const departures = get().todayDepartures.map(r =>
      r.id === reservationId ? { ...r, status: 'checked_out' as ReservationStatus } : r
    );
    const inHouse = get().inHouseGuests.filter(r => r.id !== reservationId);

    // Update room to vacant dirty
    const rooms = get().rooms.map(r =>
      r.number === departure?.roomNumber
        ? { ...r, isOccupied: false, currentGuest: undefined, reservationId: undefined, status: 'dirty' as RoomStatus }
        : r
    );

    set({ todayDepartures: departures, inHouseGuests: inHouse, rooms, roomStatusSummary: calculateRoomStatusSummary(rooms) });
  },

  checkOutGuestWithPayment: (reservationId, paymentMethod, paymentDetails) => {
    const departure = get().todayDepartures.find(r => r.id === reservationId);
    const billing = get().guestBillings.find(b => b.reservationId === reservationId);

    if (billing && billing.balance > 0) {
      // Add payment record
      const newPayment: PaymentRecord = {
        id: `payment-checkout-${reservationId}-${Date.now()}`,
        method: paymentMethod,
        amount: billing.balance,
        currency: billing.currency,
        status: 'completed',
        cardLast4: paymentDetails?.cardLast4,
        cardBrand: paymentDetails?.cardBrand,
        timestamp: new Date().toISOString(),
        processedBy: 'Front Desk',
        transactionId: `TXN-${Date.now()}`,
      };

      // Update billing record
      const updatedBillings = get().guestBillings.map(b =>
        b.reservationId === reservationId
          ? { ...b, payments: [...b.payments, newPayment], paidAmount: b.totalAmount, balance: 0 }
          : b
      );

      set({ guestBillings: updatedBillings });
    }

    // Now perform regular checkout
    const departures = get().todayDepartures.map(r =>
      r.id === reservationId ? { ...r, status: 'checked_out' as ReservationStatus, paymentStatus: 'paid' as const, balance: 0 } : r
    );
    const inHouse = get().inHouseGuests.filter(r => r.id !== reservationId);

    // Update room to vacant dirty
    const rooms = get().rooms.map(r =>
      r.number === departure?.roomNumber
        ? { ...r, isOccupied: false, currentGuest: undefined, reservationId: undefined, status: 'dirty' as RoomStatus }
        : r
    );

    set({ todayDepartures: departures, inHouseGuests: inHouse, rooms, roomStatusSummary: calculateRoomStatusSummary(rooms) });
  },

  getGuestBilling: (reservationId) => {
    return get().guestBillings.find(b => b.reservationId === reservationId);
  },

  updateRoomStatus: (roomNumber, status) => {
    const rooms = get().rooms.map(r =>
      r.number === roomNumber ? { ...r, status } : r
    );
    set({ rooms, roomStatusSummary: calculateRoomStatusSummary(rooms) });
  },

  updateRequestStatus: (requestId, status) => {
    const requests = get().guestRequests.map(r =>
      r.id === requestId ? { ...r, status, completedAt: status === 'completed' ? new Date().toISOString() : undefined } : r
    );
    set({ guestRequests: requests });
  },

  acknowledgeAlert: (alertId) => {
    const alerts = get().staffAlerts.map(a =>
      a.id === alertId ? { ...a, acknowledged: true } : a
    );
    set({ staffAlerts: alerts });
  },

  getAvailableRooms: (roomType) => {
    return get().rooms.filter(r =>
      !r.isOccupied &&
      (r.status === 'clean' || r.status === 'inspected') &&
      r.status !== 'out_of_order' &&
      r.status !== 'out_of_service' &&
      (!roomType || r.type === roomType)
    );
  },

  getRoomsBecomingReady: () => {
    return get().rooms.filter(r =>
      !r.isOccupied &&
      r.status === 'dirty' &&
      r.estimatedReadyTime
    ).sort((a, b) => {
      // Sort by estimated ready time
      if (!a.estimatedReadyTime) return 1;
      if (!b.estimatedReadyTime) return -1;
      return a.estimatedReadyTime.localeCompare(b.estimatedReadyTime);
    });
  },

  getRoomUpgradeOptions: (currentRoomType, nights) => {
    const roomTypeHierarchy = ['Standard', 'Deluxe', 'Suite', 'Penthouse'];
    const baseRates: Record<string, number> = { Standard: 35000, Deluxe: 48000, Suite: 72000, Penthouse: 125000 };

    const currentTypeIndex = roomTypeHierarchy.indexOf(currentRoomType);
    if (currentTypeIndex === -1) return [];

    const upgradeOptions: RoomUpgradeOption[] = [];
    const availableRooms = get().rooms.filter(r =>
      !r.isOccupied &&
      (r.status === 'clean' || r.status === 'inspected') &&
      r.status !== 'out_of_order' &&
      r.status !== 'out_of_service'
    );

    // Get upgrade options for room types above current
    for (let i = currentTypeIndex + 1; i < roomTypeHierarchy.length; i++) {
      const upgradeType = roomTypeHierarchy[i];
      const roomsOfType = availableRooms.filter(r => r.type === upgradeType);

      if (roomsOfType.length > 0) {
        const priceDifferencePerNight = baseRates[upgradeType] - baseRates[currentRoomType];
        upgradeOptions.push({
          fromType: currentRoomType,
          toType: upgradeType,
          priceDifference: priceDifferencePerNight * nights,
          availableRooms: roomsOfType,
        });
      }
    }

    return upgradeOptions;
  },

  getRecommendedUpsells: (reservation) => {
    const { guest, adults, children } = reservation;

    // Determine guest profile
    const profiles: ('couple' | 'family' | 'business' | 'vip' | 'solo')[] = [];

    if (guest.vipStatus !== 'none') profiles.push('vip');
    if (children > 0) profiles.push('family');
    if (adults === 2 && children === 0) profiles.push('couple');
    if (adults === 1 && children === 0) profiles.push('solo');
    // Could add business detection based on source or corporate rate
    if (reservation.source === 'Corporate' || reservation.source === 'GDS') profiles.push('business');

    // Get relevant upsells
    return upsellOffers.filter(offer =>
      offer.targetAudience.includes('all') ||
      offer.targetAudience.some(audience => profiles.includes(audience))
    ).sort((a, b) => {
      // Prioritize by relevance (non-'all' matches first)
      const aRelevance = a.targetAudience.filter(t => t !== 'all' && profiles.includes(t)).length;
      const bRelevance = b.targetAudience.filter(t => t !== 'all' && profiles.includes(t)).length;
      return bRelevance - aRelevance;
    });
  },

  refreshData: () => {
    set({ ...generateInitialData(), upsellOffers });
  },
}));
