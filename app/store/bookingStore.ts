import { create } from 'zustand';

// ============================================
// RoomBoss-based Data Models
// ============================================

// Property & Room Types
export interface Property {
  id: string;
  name: string;
  nameJapanese: string;
  description: string;
  location: string;
  destination: string;
  images: string[];
  amenities: string[];
  rating: number;
  reviewCount: number;
  distanceToLift: string;
  propertyType: 'hotel' | 'villa' | 'lodge' | 'apartment' | 'chalet';
}

export interface RoomType {
  id: string;
  propertyId: string;
  name: string;
  nameJapanese: string;
  description: string;
  maxGuests: number;
  bedConfiguration: string;
  size: number; // sqm
  amenities: string[];
  images: string[];
}

// Rate Plans & Pricing (RoomBoss model)
export interface RatePlan {
  id: string;
  roomTypeId: string;
  name: string;
  description: string;
  pricingType: 'fixed' | 'occupancy_based';
  baseRate: number; // per night
  incrementPerPerson: number; // for occupancy-based
  currency: string;
  includedServices: string[];
  cancellationPolicy: string;
}

// Restrictions (RoomBoss model)
export interface RateRestrictions {
  ratePlanId: string;
  date: string;
  closed: boolean;
  closedToArrival: boolean;
  minLengthOfStay: number;
  maxLengthOfStay: number;
  minAdvance: number; // days
  maxAdvance: number; // days
}

// Availability
export interface RoomAvailability {
  roomTypeId: string;
  date: string;
  available: number;
  ratePlanId: string;
  rate: number;
}

// Guest Services (GS Purchasing API model)
export type ServiceCategory =
  | 'ski_rental'
  | 'snowboard_rental'
  | 'ski_lesson'
  | 'snowboard_lesson'
  | 'airport_transfer'
  | 'shuttle'
  | 'lift_pass'
  | 'spa'
  | 'restaurant'
  | 'activity';

export interface GuestService {
  id: string;
  vendorId: string;
  vendorName: string;
  category: ServiceCategory;
  name: string;
  nameJapanese: string;
  description: string;
  duration: string;
  price: number;
  currency: string;
  priceType: 'per_person' | 'per_item' | 'per_group' | 'per_day';
  maxParticipants: number;
  availableDates: string[];
  timeSlots: string[];
  images: string[];
  included: string[];
  requirements: string[];
}

// Booking Order Types (RoomBoss model)
export type OrderType = 'internal' | 'request' | 'reservation';
export type OrderStatus = 'draft' | 'pending' | 'confirmed' | 'cancelled';

// Cart Items
export interface CartAccommodation {
  id: string;
  propertyId: string;
  propertyName: string;
  roomTypeId: string;
  roomTypeName: string;
  ratePlanId: string;
  ratePlanName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  pricePerNight: number;
  totalPrice: number;
}

export interface CartService {
  id: string;
  serviceId: string;
  serviceName: string;
  vendorName: string;
  category: ServiceCategory;
  date: string;
  timeSlot?: string;
  quantity: number;
  participants: number;
  pricePerUnit: number;
  totalPrice: number;
}

// Guest Information
export interface GuestInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  specialRequests: string;
  arrivalTime: string;
  departureTime: string;
}

// Search Parameters
export interface SearchParams {
  destination: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
}

// Booking Store State
interface BookingState {
  // Search
  searchParams: SearchParams;
  searchResults: Property[];
  selectedProperty: Property | null;
  availableRoomTypes: RoomType[];
  ratePlans: RatePlan[];
  availability: RoomAvailability[];

  // Services
  availableServices: GuestService[];
  selectedServiceCategory: ServiceCategory | 'all';

  // Cart
  cartAccommodations: CartAccommodation[];
  cartServices: CartService[];

  // Guest & Checkout
  guestInfo: GuestInfo;
  orderType: OrderType;
  orderStatus: OrderStatus;
  bookingReference: string | null;

  // UI State
  currentStep: 'search' | 'results' | 'services' | 'cart' | 'checkout' | 'confirmation';
  isLoading: boolean;
  language: 'en' | 'ja';
  currency: 'JPY' | 'USD' | 'AUD';

  // Actions
  setSearchParams: (params: Partial<SearchParams>) => void;
  searchAccommodations: () => void;
  selectProperty: (property: Property) => void;
  addAccommodationToCart: (accommodation: CartAccommodation) => void;
  removeAccommodationFromCart: (id: string) => void;
  addServiceToCart: (service: CartService) => void;
  removeServiceFromCart: (id: string) => void;
  updateServiceQuantity: (id: string, quantity: number) => void;
  setGuestInfo: (info: Partial<GuestInfo>) => void;
  setCurrentStep: (step: BookingState['currentStep']) => void;
  setServiceCategory: (category: ServiceCategory | 'all') => void;
  setLanguage: (lang: 'en' | 'ja') => void;
  setCurrency: (currency: 'JPY' | 'USD' | 'AUD') => void;
  processBooking: () => Promise<void>;
  resetBooking: () => void;
  getCartTotal: () => number;
}

// ============================================
// Mock Data - Properties
// ============================================
const mockProperties: Property[] = [
  {
    id: 'prop-1',
    name: 'The 1898 Niseko',
    nameJapanese: 'ザ・1898 ニセコ',
    description: 'Luxury boutique hotel offering ski-in/ski-out access with stunning views of Mount Yotei. Features traditional Japanese hospitality with modern amenities.',
    location: 'Hirafu Village, Niseko',
    destination: 'niseko',
    images: ['/hotel1.jpg', '/hotel2.jpg', '/hotel3.jpg'],
    amenities: ['Ski-in/Ski-out', 'Onsen', 'Restaurant', 'Ski Storage', 'Shuttle Service', 'Concierge', 'Wi-Fi', 'Parking'],
    rating: 4.8,
    reviewCount: 324,
    distanceToLift: '50m',
    propertyType: 'hotel',
  },
  {
    id: 'prop-2',
    name: 'Yuki Chalet',
    nameJapanese: '雪シャレー',
    description: 'Spacious 4-bedroom chalet perfect for families or groups. Private hot tub with mountain views and full kitchen facilities.',
    location: 'Upper Hirafu, Niseko',
    destination: 'niseko',
    images: ['/hotel2.jpg', '/hotel3.jpg'],
    amenities: ['Private Hot Tub', 'Full Kitchen', 'Fireplace', 'Ski Storage', 'Mountain View', 'Wi-Fi', 'Parking'],
    rating: 4.9,
    reviewCount: 156,
    distanceToLift: '200m',
    propertyType: 'chalet',
  },
  {
    id: 'prop-3',
    name: 'Niseko Northern Resort',
    nameJapanese: 'ニセコノーザンリゾート',
    description: 'Modern resort hotel with direct gondola access. Multiple restaurants, spa facilities, and family-friendly amenities.',
    location: 'Annupuri, Niseko',
    destination: 'niseko',
    images: ['/hotel3.jpg', '/hotel1.jpg'],
    amenities: ['Gondola Access', 'Spa', 'Multiple Restaurants', 'Kids Club', 'Fitness Center', 'Ski Rental', 'Wi-Fi'],
    rating: 4.6,
    reviewCount: 512,
    distanceToLift: '0m (Direct Access)',
    propertyType: 'hotel',
  },
  {
    id: 'prop-4',
    name: 'Powder Lodge',
    nameJapanese: 'パウダーロッジ',
    description: 'Cozy lodge accommodation ideal for powder seekers. Located in the heart of Hirafu with easy access to nightlife and dining.',
    location: 'Hirafu Village, Niseko',
    destination: 'niseko',
    images: ['/hotel1.jpg', '/hotel2.jpg'],
    amenities: ['Central Location', 'Shared Onsen', 'Ski Storage', 'Lounge', 'Wi-Fi', 'Breakfast Included'],
    rating: 4.5,
    reviewCount: 287,
    distanceToLift: '300m',
    propertyType: 'lodge',
  },
];

// ============================================
// Mock Data - Room Types
// ============================================
const mockRoomTypes: RoomType[] = [
  // The 1898 Niseko rooms
  {
    id: 'room-1-1',
    propertyId: 'prop-1',
    name: 'Deluxe Mountain View',
    nameJapanese: 'デラックス マウンテンビュー',
    description: 'Spacious room with panoramic views of Mount Yotei. Features Japanese-style soaking tub.',
    maxGuests: 2,
    bedConfiguration: '1 King Bed',
    size: 45,
    amenities: ['Mountain View', 'Soaking Tub', 'Mini Bar', 'Safe', 'Heated Floors'],
    images: ['/hotel1.jpg'],
  },
  {
    id: 'room-1-2',
    propertyId: 'prop-1',
    name: 'Premium Suite',
    nameJapanese: 'プレミアムスイート',
    description: 'Luxurious suite with separate living area and private balcony. Includes access to executive lounge.',
    maxGuests: 4,
    bedConfiguration: '1 King Bed + Sofa Bed',
    size: 75,
    amenities: ['Private Balcony', 'Living Area', 'Executive Lounge', 'Nespresso Machine', 'Premium Amenities'],
    images: ['/hotel2.jpg'],
  },
  {
    id: 'room-1-3',
    propertyId: 'prop-1',
    name: 'Family Room',
    nameJapanese: 'ファミリールーム',
    description: 'Perfect for families with connecting rooms option and child-friendly amenities.',
    maxGuests: 5,
    bedConfiguration: '2 Double Beds + 1 Single',
    size: 60,
    amenities: ['Connecting Rooms', 'Child Amenities', 'Game Console', 'Extra Storage'],
    images: ['/hotel3.jpg'],
  },
  // Yuki Chalet rooms
  {
    id: 'room-2-1',
    propertyId: 'prop-2',
    name: 'Entire Chalet',
    nameJapanese: 'シャレー全体',
    description: '4-bedroom luxury chalet with private hot tub, full kitchen, and stunning mountain views.',
    maxGuests: 10,
    bedConfiguration: '2 King + 2 Queen + 2 Single',
    size: 250,
    amenities: ['Private Hot Tub', 'Full Kitchen', 'Fireplace', '4 Bathrooms', 'Laundry'],
    images: ['/hotel2.jpg'],
  },
  // Niseko Northern Resort rooms
  {
    id: 'room-3-1',
    propertyId: 'prop-3',
    name: 'Standard Twin',
    nameJapanese: 'スタンダードツイン',
    description: 'Comfortable twin room with all essential amenities for a great ski holiday.',
    maxGuests: 2,
    bedConfiguration: '2 Single Beds',
    size: 28,
    amenities: ['Ski Storage Access', 'Wi-Fi', 'TV', 'En-suite Bathroom'],
    images: ['/hotel3.jpg'],
  },
  {
    id: 'room-3-2',
    propertyId: 'prop-3',
    name: 'Superior King',
    nameJapanese: 'スーペリアキング',
    description: 'Upgraded room with king bed and enhanced amenities including bathrobes and slippers.',
    maxGuests: 2,
    bedConfiguration: '1 King Bed',
    size: 35,
    amenities: ['Bathrobes', 'Slippers', 'Premium Toiletries', 'Coffee Machine'],
    images: ['/hotel1.jpg'],
  },
  // Powder Lodge rooms
  {
    id: 'room-4-1',
    propertyId: 'prop-4',
    name: 'Bunk Room',
    nameJapanese: 'バンクルーム',
    description: 'Budget-friendly option with comfortable bunk beds. Great for solo travelers or groups.',
    maxGuests: 4,
    bedConfiguration: '4 Bunk Beds',
    size: 20,
    amenities: ['Shared Bathroom', 'Locker', 'Reading Light'],
    images: ['/hotel1.jpg'],
  },
  {
    id: 'room-4-2',
    propertyId: 'prop-4',
    name: 'Private Double',
    nameJapanese: 'プライベートダブル',
    description: 'Private room with double bed and en-suite bathroom. Breakfast included.',
    maxGuests: 2,
    bedConfiguration: '1 Double Bed',
    size: 18,
    amenities: ['En-suite Bathroom', 'Breakfast Included', 'Wi-Fi'],
    images: ['/hotel2.jpg'],
  },
];

// ============================================
// Mock Data - Rate Plans
// ============================================
const mockRatePlans: RatePlan[] = [
  // The 1898 Niseko rates
  {
    id: 'rate-1-1-1',
    roomTypeId: 'room-1-1',
    name: 'Best Available Rate',
    description: 'Our best flexible rate with free cancellation up to 7 days before arrival.',
    pricingType: 'occupancy_based',
    baseRate: 45000,
    incrementPerPerson: 8000,
    currency: 'JPY',
    includedServices: ['Breakfast', 'Onsen Access', 'Wi-Fi'],
    cancellationPolicy: 'Free cancellation until 7 days before check-in',
  },
  {
    id: 'rate-1-1-2',
    roomTypeId: 'room-1-1',
    name: 'Non-Refundable Saver',
    description: 'Save 15% with our non-refundable rate.',
    pricingType: 'occupancy_based',
    baseRate: 38250,
    incrementPerPerson: 6800,
    currency: 'JPY',
    includedServices: ['Breakfast', 'Onsen Access', 'Wi-Fi'],
    cancellationPolicy: 'Non-refundable',
  },
  {
    id: 'rate-1-2-1',
    roomTypeId: 'room-1-2',
    name: 'Suite Package',
    description: 'Premium suite experience with exclusive benefits.',
    pricingType: 'occupancy_based',
    baseRate: 85000,
    incrementPerPerson: 12000,
    currency: 'JPY',
    includedServices: ['Full Breakfast', 'Private Onsen Session', 'Welcome Champagne', 'Late Checkout'],
    cancellationPolicy: 'Free cancellation until 14 days before check-in',
  },
  {
    id: 'rate-1-3-1',
    roomTypeId: 'room-1-3',
    name: 'Family Package',
    description: 'Special family rate with kids activities included.',
    pricingType: 'fixed',
    baseRate: 65000,
    incrementPerPerson: 0,
    currency: 'JPY',
    includedServices: ['Breakfast for all', 'Kids Club Access', 'Family Onsen Time'],
    cancellationPolicy: 'Free cancellation until 7 days before check-in',
  },
  // Yuki Chalet rates
  {
    id: 'rate-2-1-1',
    roomTypeId: 'room-2-1',
    name: 'Weekly Stay',
    description: 'Book for 7 nights and enjoy the full chalet experience.',
    pricingType: 'fixed',
    baseRate: 180000,
    incrementPerPerson: 0,
    currency: 'JPY',
    includedServices: ['Daily Housekeeping', 'Welcome Pack', 'Concierge Service'],
    cancellationPolicy: 'Free cancellation until 30 days before check-in',
  },
  // Northern Resort rates
  {
    id: 'rate-3-1-1',
    roomTypeId: 'room-3-1',
    name: 'Standard Rate',
    description: 'Great value accommodation with gondola access.',
    pricingType: 'fixed',
    baseRate: 22000,
    incrementPerPerson: 0,
    currency: 'JPY',
    includedServices: ['Gondola Access', 'Wi-Fi'],
    cancellationPolicy: 'Free cancellation until 3 days before check-in',
  },
  {
    id: 'rate-3-2-1',
    roomTypeId: 'room-3-2',
    name: 'Ski & Stay Package',
    description: 'Includes ski pass and equipment rental.',
    pricingType: 'occupancy_based',
    baseRate: 35000,
    incrementPerPerson: 15000,
    currency: 'JPY',
    includedServices: ['Lift Pass', 'Ski Rental', 'Breakfast'],
    cancellationPolicy: 'Free cancellation until 7 days before check-in',
  },
  // Powder Lodge rates
  {
    id: 'rate-4-1-1',
    roomTypeId: 'room-4-1',
    name: 'Bunk Rate',
    description: 'Budget-friendly per-bed pricing.',
    pricingType: 'fixed',
    baseRate: 5500,
    incrementPerPerson: 0,
    currency: 'JPY',
    includedServices: ['Breakfast', 'Shared Onsen'],
    cancellationPolicy: 'Free cancellation until 24 hours before check-in',
  },
  {
    id: 'rate-4-2-1',
    roomTypeId: 'room-4-2',
    name: 'B&B Rate',
    description: 'Bed and breakfast included.',
    pricingType: 'fixed',
    baseRate: 12000,
    incrementPerPerson: 0,
    currency: 'JPY',
    includedServices: ['Full Breakfast', 'Onsen Access'],
    cancellationPolicy: 'Free cancellation until 48 hours before check-in',
  },
];

// ============================================
// Mock Data - Guest Services (Ski-related)
// ============================================
const mockGuestServices: GuestService[] = [
  // Ski Rentals
  {
    id: 'svc-rental-1',
    vendorId: 'vendor-rhythm',
    vendorName: 'Rhythm Japan',
    category: 'ski_rental',
    name: 'Premium Ski Package',
    nameJapanese: 'プレミアムスキーパッケージ',
    description: 'High-performance skis, boots, and poles. Includes helmet. Perfect for intermediate to advanced skiers.',
    duration: 'Per Day',
    price: 8500,
    currency: 'JPY',
    priceType: 'per_person',
    maxParticipants: 10,
    availableDates: [],
    timeSlots: ['08:00-18:00'],
    images: ['/hotel1.jpg'],
    included: ['Skis', 'Boots', 'Poles', 'Helmet'],
    requirements: ['Height/Weight info required'],
  },
  {
    id: 'svc-rental-2',
    vendorId: 'vendor-rhythm',
    vendorName: 'Rhythm Japan',
    category: 'ski_rental',
    name: 'Standard Ski Package',
    nameJapanese: 'スタンダードスキーパッケージ',
    description: 'Quality rental skis suitable for all levels. Great value for beginners and intermediate skiers.',
    duration: 'Per Day',
    price: 5500,
    currency: 'JPY',
    priceType: 'per_person',
    maxParticipants: 10,
    availableDates: [],
    timeSlots: ['08:00-18:00'],
    images: ['/hotel2.jpg'],
    included: ['Skis', 'Boots', 'Poles'],
    requirements: ['Height/Weight info required'],
  },
  // Snowboard Rentals
  {
    id: 'svc-rental-3',
    vendorId: 'vendor-rhythm',
    vendorName: 'Rhythm Japan',
    category: 'snowboard_rental',
    name: 'Premium Snowboard Package',
    nameJapanese: 'プレミアムスノーボードパッケージ',
    description: 'Top-of-the-line snowboard with responsive bindings and comfortable boots.',
    duration: 'Per Day',
    price: 8000,
    currency: 'JPY',
    priceType: 'per_person',
    maxParticipants: 10,
    availableDates: [],
    timeSlots: ['08:00-18:00'],
    images: ['/hotel3.jpg'],
    included: ['Snowboard', 'Bindings', 'Boots', 'Helmet'],
    requirements: ['Stance preference (Regular/Goofy)'],
  },
  {
    id: 'svc-rental-4',
    vendorId: 'vendor-niseko-sports',
    vendorName: 'Niseko Sports',
    category: 'snowboard_rental',
    name: 'Standard Snowboard Package',
    nameJapanese: 'スタンダードスノーボードパッケージ',
    description: 'Reliable snowboard equipment for all skill levels.',
    duration: 'Per Day',
    price: 5000,
    currency: 'JPY',
    priceType: 'per_person',
    maxParticipants: 10,
    availableDates: [],
    timeSlots: ['08:00-18:00'],
    images: ['/hotel1.jpg'],
    included: ['Snowboard', 'Bindings', 'Boots'],
    requirements: ['Stance preference (Regular/Goofy)'],
  },
  // Ski Lessons
  {
    id: 'svc-lesson-1',
    vendorId: 'vendor-niss',
    vendorName: 'NISS (Niseko International Snowsports School)',
    category: 'ski_lesson',
    name: 'Private Ski Lesson',
    nameJapanese: 'プライベートスキーレッスン',
    description: 'One-on-one instruction tailored to your skill level. Fast-track your skiing improvement.',
    duration: '2 Hours',
    price: 28000,
    currency: 'JPY',
    priceType: 'per_group',
    maxParticipants: 4,
    availableDates: [],
    timeSlots: ['09:00-11:00', '11:30-13:30', '14:00-16:00'],
    images: ['/hotel2.jpg'],
    included: ['Certified Instructor', 'Lift Priority', 'Video Analysis'],
    requirements: ['Skill level assessment', 'Min age: 4 years'],
  },
  {
    id: 'svc-lesson-2',
    vendorId: 'vendor-niss',
    vendorName: 'NISS (Niseko International Snowsports School)',
    category: 'ski_lesson',
    name: 'Group Ski Lesson',
    nameJapanese: 'グループスキーレッスン',
    description: 'Learn with others at your skill level. Fun and social way to improve.',
    duration: '2 Hours',
    price: 8500,
    currency: 'JPY',
    priceType: 'per_person',
    maxParticipants: 8,
    availableDates: [],
    timeSlots: ['09:30-11:30', '13:30-15:30'],
    images: ['/hotel3.jpg'],
    included: ['Certified Instructor', 'Small Group Size'],
    requirements: ['Skill level: Beginner to Intermediate', 'Min age: 6 years'],
  },
  {
    id: 'svc-lesson-3',
    vendorId: 'vendor-niss',
    vendorName: 'NISS (Niseko International Snowsports School)',
    category: 'ski_lesson',
    name: 'Kids Ski Camp',
    nameJapanese: 'キッズスキーキャンプ',
    description: 'Full-day program for children including lunch. Safe, fun learning environment.',
    duration: 'Full Day (6 Hours)',
    price: 18000,
    currency: 'JPY',
    priceType: 'per_person',
    maxParticipants: 6,
    availableDates: [],
    timeSlots: ['09:00-15:00'],
    images: ['/hotel1.jpg'],
    included: ['Certified Instructor', 'Lunch', 'Snacks', 'Indoor Activities'],
    requirements: ['Age: 4-12 years', 'Basic skiing ability preferred'],
  },
  // Snowboard Lessons
  {
    id: 'svc-lesson-4',
    vendorId: 'vendor-niss',
    vendorName: 'NISS (Niseko International Snowsports School)',
    category: 'snowboard_lesson',
    name: 'Private Snowboard Lesson',
    nameJapanese: 'プライベートスノーボードレッスン',
    description: 'Personalized snowboard coaching for rapid progression.',
    duration: '2 Hours',
    price: 28000,
    currency: 'JPY',
    priceType: 'per_group',
    maxParticipants: 4,
    availableDates: [],
    timeSlots: ['09:00-11:00', '11:30-13:30', '14:00-16:00'],
    images: ['/hotel2.jpg'],
    included: ['Certified Instructor', 'Lift Priority', 'Video Analysis'],
    requirements: ['Min age: 6 years'],
  },
  {
    id: 'svc-lesson-5',
    vendorId: 'vendor-niss',
    vendorName: 'NISS (Niseko International Snowsports School)',
    category: 'snowboard_lesson',
    name: 'First Timer Snowboard Package',
    nameJapanese: '初心者スノーボードパッケージ',
    description: 'Complete beginner package including rental and lesson. Perfect introduction to snowboarding.',
    duration: '3 Hours',
    price: 15000,
    currency: 'JPY',
    priceType: 'per_person',
    maxParticipants: 6,
    availableDates: [],
    timeSlots: ['09:30-12:30', '13:30-16:30'],
    images: ['/hotel3.jpg'],
    included: ['Lesson', 'Snowboard Rental', 'Boots', 'Helmet'],
    requirements: ['Absolute beginners only', 'Min age: 8 years'],
  },
  // Airport Transfers
  {
    id: 'svc-transfer-1',
    vendorId: 'vendor-niseko-transport',
    vendorName: 'Niseko Transport',
    category: 'airport_transfer',
    name: 'New Chitose Airport Private Transfer',
    nameJapanese: '新千歳空港プライベート送迎',
    description: 'Door-to-door private transfer from New Chitose Airport to your accommodation.',
    duration: '2.5 Hours',
    price: 35000,
    currency: 'JPY',
    priceType: 'per_group',
    maxParticipants: 6,
    availableDates: [],
    timeSlots: ['Any Time'],
    images: ['/hotel1.jpg'],
    included: ['Private Vehicle', 'Professional Driver', 'Luggage Handling', 'Child Seats Available'],
    requirements: ['Flight details required', 'Accommodation address'],
  },
  {
    id: 'svc-transfer-2',
    vendorId: 'vendor-niseko-transport',
    vendorName: 'Niseko Transport',
    category: 'airport_transfer',
    name: 'Shared Airport Shuttle',
    nameJapanese: '空港シャトルバス',
    description: 'Affordable shared shuttle service from New Chitose Airport.',
    duration: '3 Hours',
    price: 4500,
    currency: 'JPY',
    priceType: 'per_person',
    maxParticipants: 20,
    availableDates: [],
    timeSlots: ['10:00', '13:00', '16:00', '19:00'],
    images: ['/hotel2.jpg'],
    included: ['Shared Coach', 'Luggage Storage'],
    requirements: ['Flight details required'],
  },
  // Shuttles
  {
    id: 'svc-shuttle-1',
    vendorId: 'vendor-niseko-transport',
    vendorName: 'Niseko Transport',
    category: 'shuttle',
    name: 'Inter-Resort Shuttle',
    nameJapanese: 'リゾート間シャトル',
    description: 'Shuttle service between Niseko resort areas (Hirafu, Hanazono, Annupuri, Niseko Village).',
    duration: '15-30 mins',
    price: 500,
    currency: 'JPY',
    priceType: 'per_person',
    maxParticipants: 30,
    availableDates: [],
    timeSlots: ['Every 30 mins from 08:00-21:00'],
    images: ['/hotel3.jpg'],
    included: ['Unlimited Day Pass Available'],
    requirements: [],
  },
  {
    id: 'svc-shuttle-2',
    vendorId: 'vendor-niseko-transport',
    vendorName: 'Niseko Transport',
    category: 'shuttle',
    name: 'Night Shuttle',
    nameJapanese: 'ナイトシャトル',
    description: 'Late night shuttle for dinner and entertainment in Hirafu.',
    duration: 'As needed',
    price: 800,
    currency: 'JPY',
    priceType: 'per_person',
    maxParticipants: 20,
    availableDates: [],
    timeSlots: ['19:00-00:00 (Hourly)'],
    images: ['/hotel1.jpg'],
    included: ['Door-to-Door Service'],
    requirements: [],
  },
  // Lift Passes
  {
    id: 'svc-lift-1',
    vendorId: 'vendor-niseko-united',
    vendorName: 'Niseko United',
    category: 'lift_pass',
    name: 'Niseko United All Mountain Pass',
    nameJapanese: 'ニセコユナイテッド全山パス',
    description: 'Access all 4 Niseko United resorts: Grand Hirafu, Hanazono, Niseko Village, and Annupuri.',
    duration: 'Per Day',
    price: 8500,
    currency: 'JPY',
    priceType: 'per_person',
    maxParticipants: 50,
    availableDates: [],
    timeSlots: ['08:30-16:30', 'Night: 16:30-20:30'],
    images: ['/hotel2.jpg'],
    included: ['All 4 Resorts', 'Inter-Resort Transport'],
    requirements: ['Photo ID may be required'],
  },
  {
    id: 'svc-lift-2',
    vendorId: 'vendor-niseko-united',
    vendorName: 'Niseko United',
    category: 'lift_pass',
    name: 'Night Skiing Pass',
    nameJapanese: 'ナイター券',
    description: 'Experience the magic of night skiing under the lights at Grand Hirafu.',
    duration: '16:30-20:30',
    price: 3200,
    currency: 'JPY',
    priceType: 'per_person',
    maxParticipants: 50,
    availableDates: [],
    timeSlots: ['16:30-20:30'],
    images: ['/hotel3.jpg'],
    included: ['Night Skiing Access', 'Illuminated Runs'],
    requirements: [],
  },
  {
    id: 'svc-lift-3',
    vendorId: 'vendor-niseko-united',
    vendorName: 'Niseko United',
    category: 'lift_pass',
    name: '5-Day Lift Pass',
    nameJapanese: '5日間リフト券',
    description: 'Great value 5-day pass for extended stays. Non-consecutive days allowed.',
    duration: '5 Days',
    price: 36000,
    currency: 'JPY',
    priceType: 'per_person',
    maxParticipants: 50,
    availableDates: [],
    timeSlots: ['08:30-16:30'],
    images: ['/hotel1.jpg'],
    included: ['All 4 Resorts', 'Flexible Days'],
    requirements: [],
  },
  // Activities
  {
    id: 'svc-activity-1',
    vendorId: 'vendor-nac',
    vendorName: 'NAC (Niseko Adventure Centre)',
    category: 'activity',
    name: 'Backcountry Guided Tour',
    nameJapanese: 'バックカントリーガイドツアー',
    description: 'Explore untouched powder with experienced guides. Equipment and safety gear included.',
    duration: '5 Hours',
    price: 25000,
    currency: 'JPY',
    priceType: 'per_person',
    maxParticipants: 6,
    availableDates: [],
    timeSlots: ['08:00-13:00'],
    images: ['/hotel2.jpg'],
    included: ['Guide', 'Avalanche Safety Gear', 'Beacon', 'Probe', 'Shovel'],
    requirements: ['Advanced skiing/boarding ability', 'Good fitness level', 'Min age: 16 years'],
  },
  {
    id: 'svc-activity-2',
    vendorId: 'vendor-nac',
    vendorName: 'NAC (Niseko Adventure Centre)',
    category: 'activity',
    name: 'Snowshoe Nature Tour',
    nameJapanese: 'スノーシュー自然ツアー',
    description: 'Peaceful snowshoe walk through the winter forest. Suitable for all fitness levels.',
    duration: '3 Hours',
    price: 8000,
    currency: 'JPY',
    priceType: 'per_person',
    maxParticipants: 10,
    availableDates: [],
    timeSlots: ['09:30-12:30', '14:00-17:00'],
    images: ['/hotel3.jpg'],
    included: ['Guide', 'Snowshoes', 'Poles', 'Hot Drink'],
    requirements: ['Min age: 6 years'],
  },
  // Spa
  {
    id: 'svc-spa-1',
    vendorId: 'vendor-1898-spa',
    vendorName: 'The 1898 Spa',
    category: 'spa',
    name: 'Après-Ski Massage',
    nameJapanese: 'アプレスキーマッサージ',
    description: 'Relaxing full-body massage to soothe tired muscles after a day on the slopes.',
    duration: '60 Minutes',
    price: 15000,
    currency: 'JPY',
    priceType: 'per_person',
    maxParticipants: 1,
    availableDates: [],
    timeSlots: ['10:00', '12:00', '14:00', '16:00', '18:00', '20:00'],
    images: ['/hotel1.jpg'],
    included: ['Full Body Massage', 'Aromatherapy', 'Herbal Tea'],
    requirements: [],
  },
  {
    id: 'svc-spa-2',
    vendorId: 'vendor-1898-spa',
    vendorName: 'The 1898 Spa',
    category: 'spa',
    name: 'Onsen & Spa Package',
    nameJapanese: '温泉&スパパッケージ',
    description: 'Complete relaxation package including private onsen session and choice of treatment.',
    duration: '2 Hours',
    price: 25000,
    currency: 'JPY',
    priceType: 'per_person',
    maxParticipants: 2,
    availableDates: [],
    timeSlots: ['11:00', '14:00', '17:00'],
    images: ['/hotel2.jpg'],
    included: ['Private Onsen', '60min Treatment', 'Refreshments', 'Robe & Slippers'],
    requirements: ['Book 24 hours in advance'],
  },
];

// ============================================
// Initial State
// ============================================
const initialSearchParams: SearchParams = {
  destination: 'niseko',
  checkIn: '',
  checkOut: '',
  nights: 3,
  adults: 2,
  children: 0,
};

const initialGuestInfo: GuestInfo = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  country: '',
  specialRequests: '',
  arrivalTime: '',
  departureTime: '',
};

// ============================================
// Store Implementation
// ============================================
export const useBookingStore = create<BookingState>((set, get) => ({
  // Initial State
  searchParams: initialSearchParams,
  searchResults: [],
  selectedProperty: null,
  availableRoomTypes: [],
  ratePlans: mockRatePlans,
  availability: [],

  availableServices: mockGuestServices,
  selectedServiceCategory: 'all',

  cartAccommodations: [],
  cartServices: [],

  guestInfo: initialGuestInfo,
  orderType: 'reservation',
  orderStatus: 'draft',
  bookingReference: null,

  currentStep: 'search',
  isLoading: false,
  language: 'en',
  currency: 'JPY',

  // Actions
  setSearchParams: (params) => {
    set((state) => ({
      searchParams: { ...state.searchParams, ...params },
    }));
  },

  searchAccommodations: () => {
    set({ isLoading: true });

    // Simulate API call
    setTimeout(() => {
      const { searchParams } = get();
      const results = mockProperties.filter(
        (p) => p.destination === searchParams.destination
      );

      set({
        searchResults: results,
        isLoading: false,
        currentStep: 'results',
      });
    }, 500);
  },

  selectProperty: (property) => {
    const roomTypes = mockRoomTypes.filter((rt) => rt.propertyId === property.id);
    set({
      selectedProperty: property,
      availableRoomTypes: roomTypes,
    });
  },

  addAccommodationToCart: (accommodation) => {
    set((state) => ({
      cartAccommodations: [...state.cartAccommodations, accommodation],
    }));
  },

  removeAccommodationFromCart: (id) => {
    set((state) => ({
      cartAccommodations: state.cartAccommodations.filter((a) => a.id !== id),
    }));
  },

  addServiceToCart: (service) => {
    set((state) => ({
      cartServices: [...state.cartServices, service],
    }));
  },

  removeServiceFromCart: (id) => {
    set((state) => ({
      cartServices: state.cartServices.filter((s) => s.id !== id),
    }));
  },

  updateServiceQuantity: (id, quantity) => {
    set((state) => ({
      cartServices: state.cartServices.map((s) =>
        s.id === id
          ? { ...s, quantity, totalPrice: s.pricePerUnit * quantity }
          : s
      ),
    }));
  },

  setGuestInfo: (info) => {
    set((state) => ({
      guestInfo: { ...state.guestInfo, ...info },
    }));
  },

  setCurrentStep: (step) => {
    set({ currentStep: step });
  },

  setServiceCategory: (category) => {
    set({ selectedServiceCategory: category });
  },

  setLanguage: (lang) => {
    set({ language: lang });
  },

  setCurrency: (currency) => {
    set({ currency });
  },

  processBooking: async () => {
    set({ isLoading: true, orderStatus: 'pending' });

    // Simulate API call to RoomBoss
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const bookingRef = `RB-${Date.now().toString(36).toUpperCase()}`;

    set({
      isLoading: false,
      orderStatus: 'confirmed',
      bookingReference: bookingRef,
      currentStep: 'confirmation',
    });
  },

  resetBooking: () => {
    set({
      searchParams: initialSearchParams,
      searchResults: [],
      selectedProperty: null,
      availableRoomTypes: [],
      cartAccommodations: [],
      cartServices: [],
      guestInfo: initialGuestInfo,
      orderType: 'reservation',
      orderStatus: 'draft',
      bookingReference: null,
      currentStep: 'search',
    });
  },

  getCartTotal: () => {
    const state = get();
    const accommodationTotal = state.cartAccommodations.reduce(
      (sum, a) => sum + a.totalPrice,
      0
    );
    const servicesTotal = state.cartServices.reduce(
      (sum, s) => sum + s.totalPrice,
      0
    );
    return accommodationTotal + servicesTotal;
  },
}));
