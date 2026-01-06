import { create } from 'zustand';

// RoomBoss API Configuration
export const ROOMBOSS_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_ROOMBOSS_API_URL || 'https://api.roomboss.com',
  credentials: {
    username: process.env.NEXT_PUBLIC_ROOMBOSS_USERNAME || '',
    password: process.env.NEXT_PUBLIC_ROOMBOSS_PASSWORD || '',
  },
};

// Types for API responses
export interface Hotel {
  hotelId: string;
  hotelName: string;
  countryCode: string;
  locationCode: string;
  latitude?: number;
  longitude?: number;
  currencyCode: string;
  url?: string;
  internalInventory: boolean;
  recordGuestType: boolean;
  maxAgeChildren: number;
  maxAgeInfants: number;
  attributes?: string[];
  roomTypes: RoomType[];
}

export interface RoomType {
  roomTypeId: string;
  roomTypeName: string;
  maxNumberGuests: number;
  numberBedrooms: number;
  numberBathrooms: number;
  maxNumberAdults: number;
  maxNumberChildren: number;
  maxNumberInfants: number;
  attributes?: string[];
  quantityAvailable?: number;
  priceRetail?: number;
  priceRack?: number;
  priceNet?: number;
  priceNumberGuests?: number;
  ratePlan?: RatePlan;
}

export interface RatePlan {
  ratePlanId: number;
  priceRetail: number;
  mealsIncluded: boolean;
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
  rateRestrictionIgnored: boolean;
  discountCode?: string;
}

export interface HotelImage {
  hotelId: string;
  hotelImages: Record<string, string>;
  roomTypes: { roomTypeId: string; roomTypeImages?: Record<string, string> }[];
}

export interface HotelDescription {
  hotelId: string;
  hotelName: string;
  hotelDescription: string;
  roomTypes: {
    roomTypeId: string;
    roomTypeName: string;
    roomTypeDescription: string;
  }[];
}

export interface Vendor {
  id: string;
  name: string;
  image?: string;
  description?: string;
  url?: string;
  countryCode: string;
  locationCode: string;
  latitude?: number;
  longitude?: number;
  currencyCode: string;
  vendorType: string;
  bookingPermission: string;
  bookAndPayEnabled: boolean;
}

export interface Category {
  id: string;
  name: string;
  image?: string;
  description?: string;
  sequence: number;
  active: boolean;
  hasOffers: boolean;
  children: Category[];
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  image?: string;
  sequence: number;
  hasOffers: boolean;
  guestImageRequired: boolean;
  productOptions: ProductOption[];
  unbookableDates: { startDate: string; endDate: string }[];
}

export interface ProductOption {
  id: string;
  position: string;
  label: string;
  inputType: 'DROP_DOWN' | 'FREE_TEXT' | 'FIXED';
  compulsory: boolean;
  value?: string | number;
  selectItems?: { label: string; value: string | number }[];
}

export interface Booking {
  bookingId: string;
  customId?: string;
  active: boolean;
  extent: 'RESERVATION' | 'REQUEST' | 'REQUEST_INTERNAL';
  roomStatus?: string;
  createdDate: string;
  lastModifiedDate?: string;
  bookingType: string;
  bookingSource?: string;
  notes?: string;
  guestIntranetUrl?: string;
  hotel: Hotel;
  items: BookingItem[];
}

export interface BookingItem {
  itemId: string;
  roomType: RoomType;
  checkIn: string;
  checkOut: string;
  numberGuests: number;
  numberAdults: number;
  numberChildren: number;
  numberInfants: number;
  priceRetail: number;
  priceRack: number;
  priceNet: number;
  roomNumber?: string;
  checkedIn?: boolean;
  checkedOut?: boolean;
}

export interface LeadGuest {
  givenName: string;
  familyName: string;
  email?: string;
  phoneNumber?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  nationality?: string;
  dateOfBirth?: string;
  country?: string;
  city?: string;
  address1?: string;
  postcode?: string;
}

export interface InvoicePayment {
  invoiceNumber: string;
  invoiceId: string;
  invoiceDate: string;
  invoiceAmount: number;
  invoiceDueDate: string;
  paymentAmount: number;
  paymentMethod?: string;
  paymentDate?: string;
}

export interface ApiRequest {
  id: string;
  timestamp: Date;
  method: string;
  endpoint: string;
  params: Record<string, string>;
  duration: number;
  status: 'success' | 'error';
  statusCode?: number;
  response: unknown;
  error?: string;
}

// Location codes for reference
export const LOCATION_CODES = {
  JP: [
    { code: 'NISEKO', name: 'Niseko', sublocations: ['NISEKO_HIRAFU', 'NISEKO_ANNUPURI', 'NISEKO_HIGASHIYAMA', 'NISEKO_HANAZONO', 'NISEKO_VILLAGE', 'NISEKO_MOIWA'] },
    { code: 'HAKUBA', name: 'Hakuba', sublocations: ['HAKUBA_47', 'HAKUBA_CORTINA', 'HAKUBA_GORYU', 'HAKUBA_HAPPOONE', 'HAKUBA_ECHOLAND'] },
    { code: 'FURANO', name: 'Furano', sublocations: ['FURANO_MOUNTAIN', 'FURANO_TOWN'] },
    { code: 'TOKYO', name: 'Tokyo', sublocations: ['TOKYO_CITY', 'TOKYO_NARITA'] },
    { code: 'SAPPORO', name: 'Sapporo', sublocations: ['SAPPORO_CHITOSE', 'SAPPORO_CITY'] },
    { code: 'RUSUTSU', name: 'Rusutsu', sublocations: [] },
    { code: 'KIRORO', name: 'Kiroro', sublocations: [] },
    { code: 'MYOKO', name: 'Myoko', sublocations: [] },
    { code: 'NOZAWAONSEN', name: 'Nozawa Onsen', sublocations: [] },
  ],
  NZ: [
    { code: 'QUEENSTOWN', name: 'Queenstown', sublocations: [] },
    { code: 'WANAKA', name: 'Wanaka', sublocations: [] },
    { code: 'METHVEN', name: 'Methven', sublocations: [] },
  ],
  CA: [
    { code: 'WHISTLER', name: 'Whistler', sublocations: [] },
    { code: 'REVELSTOKE', name: 'Revelstoke', sublocations: ['REVELSTOKE_ONMOUNTAIN', 'REVELSTOKE_OFFMOUNTAIN'] },
    { code: 'BIGWHITE', name: 'Big White', sublocations: [] },
  ],
  CL: [
    { code: 'PORTILLO', name: 'Portillo', sublocations: [] },
    { code: 'SANTIAGO', name: 'Santiago', sublocations: [] },
  ],
  AU: [
    { code: 'MTBULLER', name: 'Mt Buller', sublocations: [] },
    { code: 'MTHOTHAM', name: 'Mt Hotham', sublocations: [] },
  ],
  US: [
    { code: 'PARKCITY', name: 'Park City', sublocations: [] },
    { code: 'TELLURIDE', name: 'Telluride', sublocations: [] },
  ],
  TH: [
    { code: 'PHUKET', name: 'Phuket', sublocations: [] },
    { code: 'KOHSAMUI', name: 'Koh Samui', sublocations: [] },
  ],
  ID: [
    { code: 'BALI', name: 'Bali', sublocations: ['BALI_CANGGU', 'BALI_SEMINYAK', 'BALI_UMALAS'] },
  ],
};

interface RoombossApiState {
  // Request history
  requestHistory: ApiRequest[];

  // Loading states
  isLoading: boolean;

  // Cached data
  hotels: Hotel[];
  availableHotels: Hotel[];
  hotelImages: HotelImage[];
  hotelDescriptions: HotelDescription[];
  vendors: Vendor[];
  categories: Category[];
  products: Product[];
  currentBooking: { order: { leadGuest: LeadGuest; bookings: Booking[]; invoicePayments: InvoicePayment[] } } | null;

  // Actions
  addToHistory: (request: ApiRequest) => void;
  clearHistory: () => void;
  setLoading: (loading: boolean) => void;

  // Hotel API methods
  listHotels: (countryCode: string, locationCode: string) => Promise<unknown>;
  listAvailable: (params: {
    hotelIds: string[];
    checkIn: string;
    checkOut: string;
    numberGuests: number;
    numberAdults?: number;
    numberChildren?: number;
    numberInfants?: number;
    rate?: string;
    discountCode?: string;
  }) => Promise<unknown>;
  listImages: (hotelId: string) => Promise<unknown>;
  listDescriptions: (hotelId: string, locale: string) => Promise<unknown>;
  listRatePlanDescriptions: (hotelId: string, locale: string) => Promise<unknown>;
  listBookingsByDate: (hotelId: string, date: string) => Promise<unknown>;

  // Booking methods
  createBooking: (params: {
    hotelId: string;
    roomTypeId: string;
    ratePlanId: number;
    checkIn: string;
    checkOut: string;
    numberGuests: number;
    numberAdults: number;
    numberChildren: number;
    numberInfants: number;
    guestGivenName: string;
    guestFamilyName: string;
    guestEmail?: string;
    contactNumber?: string;
    priceRetailMax: number;
    bookingExtent?: string;
    comment?: string;
  }) => Promise<unknown>;
  listBooking: (bookingId: string) => Promise<unknown>;
  cancelBooking: (bookingId: string) => Promise<unknown>;

  // GS Purchasing API methods
  listVendors: (countryCode: string, locationCode: string) => Promise<unknown>;
  listCategories: (vendorId: string, lang?: string) => Promise<unknown>;
  listProducts: (categoryId: string, lang?: string) => Promise<unknown>;
}

// Helper function to make authenticated API calls
async function apiCall(
  endpoint: string,
  params: Record<string, string | number | boolean> = {}
): Promise<{ data: unknown; duration: number; status: number }> {
  const startTime = Date.now();

  const url = new URL(`${ROOMBOSS_CONFIG.baseUrl}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.append(key, String(value));
    }
  });

  const auth = btoa(`${ROOMBOSS_CONFIG.credentials.username}:${ROOMBOSS_CONFIG.credentials.password}`);

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Accept': 'application/json',
    },
  });

  const duration = Date.now() - startTime;
  const data = await response.json();

  return { data, duration, status: response.status };
}

export const useRoombossApiStore = create<RoombossApiState>((set, get) => ({
  requestHistory: [],
  isLoading: false,
  hotels: [],
  availableHotels: [],
  hotelImages: [],
  hotelDescriptions: [],
  vendors: [],
  categories: [],
  products: [],
  currentBooking: null,

  addToHistory: (request) => set((state) => ({
    requestHistory: [request, ...state.requestHistory].slice(0, 100), // Keep last 100 requests
  })),

  clearHistory: () => set({ requestHistory: [] }),

  setLoading: (loading) => set({ isLoading: loading }),

  // Hotel API: List Hotels
  listHotels: async (countryCode, locationCode) => {
    const endpoint = '/extws/hotel/v1/list';
    const params = { countryCode, locationCode };

    set({ isLoading: true });

    try {
      const { data, duration, status } = await apiCall(endpoint, params);

      const request: ApiRequest = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        method: 'GET',
        endpoint,
        params: params as Record<string, string>,
        duration,
        status: status === 200 ? 'success' : 'error',
        statusCode: status,
        response: data,
      };

      get().addToHistory(request);

      if ((data as { hotels?: Hotel[] }).hotels) {
        set({ hotels: (data as { hotels: Hotel[] }).hotels });
      }

      return data;
    } catch (error) {
      const request: ApiRequest = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        method: 'GET',
        endpoint,
        params: params as Record<string, string>,
        duration: 0,
        status: 'error',
        response: null,
        error: (error as Error).message,
      };
      get().addToHistory(request);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Hotel API: List Available
  listAvailable: async (params) => {
    const endpoint = '/extws/hotel/v1/listAvailable';
    const queryParams: Record<string, string | number> = {
      checkIn: params.checkIn,
      checkOut: params.checkOut,
      numberGuests: params.numberGuests,
    };

    // Add multiple hotelIds
    params.hotelIds.forEach((id) => {
      queryParams[`hotelId`] = id; // Note: For multiple, we'd need to handle differently
    });

    if (params.numberAdults) queryParams.numberAdults = params.numberAdults;
    if (params.numberChildren) queryParams.numberChildren = params.numberChildren;
    if (params.numberInfants) queryParams.numberInfants = params.numberInfants;
    if (params.rate) queryParams.rate = params.rate;
    if (params.discountCode) queryParams.discountCode = params.discountCode;

    set({ isLoading: true });

    try {
      // Build URL manually for multiple hotelIds
      const url = new URL(`${ROOMBOSS_CONFIG.baseUrl}${endpoint}`);
      params.hotelIds.forEach((id) => url.searchParams.append('hotelId', id));
      url.searchParams.append('checkIn', params.checkIn);
      url.searchParams.append('checkOut', params.checkOut);
      url.searchParams.append('numberGuests', String(params.numberGuests));
      if (params.numberAdults) url.searchParams.append('numberAdults', String(params.numberAdults));
      if (params.numberChildren) url.searchParams.append('numberChildren', String(params.numberChildren));
      if (params.numberInfants) url.searchParams.append('numberInfants', String(params.numberInfants));
      if (params.rate) url.searchParams.append('rate', params.rate);
      if (params.discountCode) url.searchParams.append('discountCode', params.discountCode);

      const auth = btoa(`${ROOMBOSS_CONFIG.credentials.username}:${ROOMBOSS_CONFIG.credentials.password}`);
      const startTime = Date.now();

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json',
        },
      });

      const duration = Date.now() - startTime;
      const data = await response.json();

      const request: ApiRequest = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        method: 'GET',
        endpoint,
        params: { hotelIds: params.hotelIds.join(','), ...queryParams } as Record<string, string>,
        duration,
        status: response.status === 200 ? 'success' : 'error',
        statusCode: response.status,
        response: data,
      };

      get().addToHistory(request);

      if ((data as { availableHotels?: Hotel[] }).availableHotels) {
        set({ availableHotels: (data as { availableHotels: Hotel[] }).availableHotels });
      }

      return data;
    } catch (error) {
      const request: ApiRequest = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        method: 'GET',
        endpoint,
        params: queryParams as Record<string, string>,
        duration: 0,
        status: 'error',
        response: null,
        error: (error as Error).message,
      };
      get().addToHistory(request);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Hotel API: List Images
  listImages: async (hotelId) => {
    const endpoint = '/extws/hotel/v1/listImage';
    const params = { hotelId };

    set({ isLoading: true });

    try {
      const { data, duration, status } = await apiCall(endpoint, params);

      const request: ApiRequest = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        method: 'GET',
        endpoint,
        params,
        duration,
        status: status === 200 ? 'success' : 'error',
        statusCode: status,
        response: data,
      };

      get().addToHistory(request);

      if ((data as { hotels?: HotelImage[] }).hotels) {
        set({ hotelImages: (data as { hotels: HotelImage[] }).hotels });
      }

      return data;
    } catch (error) {
      const request: ApiRequest = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        method: 'GET',
        endpoint,
        params,
        duration: 0,
        status: 'error',
        response: null,
        error: (error as Error).message,
      };
      get().addToHistory(request);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Hotel API: List Descriptions
  listDescriptions: async (hotelId, locale) => {
    const endpoint = '/extws/hotel/v1/listDescription';
    const params = { hotelId, locale };

    set({ isLoading: true });

    try {
      const { data, duration, status } = await apiCall(endpoint, params);

      const request: ApiRequest = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        method: 'GET',
        endpoint,
        params,
        duration,
        status: status === 200 ? 'success' : 'error',
        statusCode: status,
        response: data,
      };

      get().addToHistory(request);

      if ((data as { hotels?: HotelDescription[] }).hotels) {
        set({ hotelDescriptions: (data as { hotels: HotelDescription[] }).hotels });
      }

      return data;
    } catch (error) {
      const request: ApiRequest = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        method: 'GET',
        endpoint,
        params,
        duration: 0,
        status: 'error',
        response: null,
        error: (error as Error).message,
      };
      get().addToHistory(request);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Hotel API: List Rate Plan Descriptions
  listRatePlanDescriptions: async (hotelId, locale) => {
    const endpoint = '/extws/hotel/v1/listRatePlanDescription';
    const params = { hotelId, locale };

    set({ isLoading: true });

    try {
      const { data, duration, status } = await apiCall(endpoint, params);

      const request: ApiRequest = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        method: 'GET',
        endpoint,
        params,
        duration,
        status: status === 200 ? 'success' : 'error',
        statusCode: status,
        response: data,
      };

      get().addToHistory(request);
      return data;
    } catch (error) {
      const request: ApiRequest = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        method: 'GET',
        endpoint,
        params,
        duration: 0,
        status: 'error',
        response: null,
        error: (error as Error).message,
      };
      get().addToHistory(request);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Hotel API: List Bookings by Date
  listBookingsByDate: async (hotelId, date) => {
    const endpoint = '/extws/hotel/v1/listBookings';
    const params = { hotelId, date };

    set({ isLoading: true });

    try {
      const { data, duration, status } = await apiCall(endpoint, params);

      const request: ApiRequest = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        method: 'GET',
        endpoint,
        params,
        duration,
        status: status === 200 ? 'success' : 'error',
        statusCode: status,
        response: data,
      };

      get().addToHistory(request);
      return data;
    } catch (error) {
      const request: ApiRequest = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        method: 'GET',
        endpoint,
        params,
        duration: 0,
        status: 'error',
        response: null,
        error: (error as Error).message,
      };
      get().addToHistory(request);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Create Booking
  createBooking: async (params) => {
    const endpoint = '/extws/hotel/v1/createBooking';

    set({ isLoading: true });

    try {
      const url = new URL(`${ROOMBOSS_CONFIG.baseUrl}${endpoint}`);
      url.searchParams.append('hotelId', params.hotelId);
      url.searchParams.append('roomTypeId', params.roomTypeId);
      url.searchParams.append('ratePlanId', String(params.ratePlanId));
      url.searchParams.append('rate', 'ota');
      url.searchParams.append('checkIn', params.checkIn);
      url.searchParams.append('checkOut', params.checkOut);
      url.searchParams.append('numberGuests', String(params.numberGuests));
      url.searchParams.append('numberAdults', String(params.numberAdults));
      url.searchParams.append('numberChildren', String(params.numberChildren));
      url.searchParams.append('numberInfants', String(params.numberInfants));
      url.searchParams.append('guestGivenName', params.guestGivenName);
      url.searchParams.append('guestFamilyName', params.guestFamilyName);
      url.searchParams.append('priceRetailMax', String(params.priceRetailMax));
      if (params.guestEmail) url.searchParams.append('guestEmail', params.guestEmail);
      if (params.contactNumber) url.searchParams.append('contactNumber', params.contactNumber);
      if (params.bookingExtent) url.searchParams.append('bookingExtent', params.bookingExtent);
      if (params.comment) url.searchParams.append('comment', params.comment);

      const auth = btoa(`${ROOMBOSS_CONFIG.credentials.username}:${ROOMBOSS_CONFIG.credentials.password}`);
      const startTime = Date.now();

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json',
        },
      });

      const duration = Date.now() - startTime;
      const data = await response.json();

      const request: ApiRequest = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        method: 'GET',
        endpoint,
        params: params as unknown as Record<string, string>,
        duration,
        status: response.status === 200 && (data as { success?: boolean }).success ? 'success' : 'error',
        statusCode: response.status,
        response: data,
      };

      get().addToHistory(request);

      if ((data as { success?: boolean }).success) {
        set({ currentBooking: data as { order: { leadGuest: LeadGuest; bookings: Booking[]; invoicePayments: InvoicePayment[] } } });
      }

      return data;
    } catch (error) {
      const request: ApiRequest = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        method: 'GET',
        endpoint,
        params: params as unknown as Record<string, string>,
        duration: 0,
        status: 'error',
        response: null,
        error: (error as Error).message,
      };
      get().addToHistory(request);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // List Booking
  listBooking: async (bookingId) => {
    const endpoint = '/extws/hotel/v1/listBooking';
    const params = { bookingId };

    set({ isLoading: true });

    try {
      const { data, duration, status } = await apiCall(endpoint, params);

      const request: ApiRequest = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        method: 'GET',
        endpoint,
        params,
        duration,
        status: status === 200 ? 'success' : 'error',
        statusCode: status,
        response: data,
      };

      get().addToHistory(request);

      if ((data as { success?: boolean }).success) {
        set({ currentBooking: data as { order: { leadGuest: LeadGuest; bookings: Booking[]; invoicePayments: InvoicePayment[] } } });
      }

      return data;
    } catch (error) {
      const request: ApiRequest = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        method: 'GET',
        endpoint,
        params,
        duration: 0,
        status: 'error',
        response: null,
        error: (error as Error).message,
      };
      get().addToHistory(request);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Cancel Booking
  cancelBooking: async (bookingId) => {
    const endpoint = '/extws/hotel/v1/cancelBooking';
    const params = { bookingId };

    set({ isLoading: true });

    try {
      const { data, duration, status } = await apiCall(endpoint, params);

      const request: ApiRequest = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        method: 'GET',
        endpoint,
        params,
        duration,
        status: status === 200 && (data as { success?: boolean }).success ? 'success' : 'error',
        statusCode: status,
        response: data,
      };

      get().addToHistory(request);
      return data;
    } catch (error) {
      const request: ApiRequest = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        method: 'GET',
        endpoint,
        params,
        duration: 0,
        status: 'error',
        response: null,
        error: (error as Error).message,
      };
      get().addToHistory(request);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // GS Purchasing API: List Vendors
  listVendors: async (countryCode, locationCode) => {
    const endpoint = '/extws/gs/v1/vendors/list';
    const params = { countryCode, locationCode };

    set({ isLoading: true });

    try {
      const { data, duration, status } = await apiCall(endpoint, params);

      const request: ApiRequest = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        method: 'GET',
        endpoint,
        params,
        duration,
        status: status === 200 ? 'success' : 'error',
        statusCode: status,
        response: data,
      };

      get().addToHistory(request);

      if ((data as { vendors?: Vendor[] }).vendors) {
        set({ vendors: (data as { vendors: Vendor[] }).vendors });
      }

      return data;
    } catch (error) {
      const request: ApiRequest = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        method: 'GET',
        endpoint,
        params,
        duration: 0,
        status: 'error',
        response: null,
        error: (error as Error).message,
      };
      get().addToHistory(request);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // GS Purchasing API: List Categories
  listCategories: async (vendorId, lang = 'en') => {
    const endpoint = '/extws/gs/v1/categories/list';
    const params = { vendorId, lang };

    set({ isLoading: true });

    try {
      const { data, duration, status } = await apiCall(endpoint, params);

      const request: ApiRequest = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        method: 'GET',
        endpoint,
        params,
        duration,
        status: status === 200 ? 'success' : 'error',
        statusCode: status,
        response: data,
      };

      get().addToHistory(request);

      if ((data as { categories?: Category[] }).categories) {
        set({ categories: (data as { categories: Category[] }).categories });
      }

      return data;
    } catch (error) {
      const request: ApiRequest = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        method: 'GET',
        endpoint,
        params,
        duration: 0,
        status: 'error',
        response: null,
        error: (error as Error).message,
      };
      get().addToHistory(request);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // GS Purchasing API: List Products
  listProducts: async (categoryId, lang = 'en') => {
    const endpoint = '/extws/gs/v1/products/list';
    const params = { categoryId, lang };

    set({ isLoading: true });

    try {
      const { data, duration, status } = await apiCall(endpoint, params);

      const request: ApiRequest = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        method: 'GET',
        endpoint,
        params,
        duration,
        status: status === 200 ? 'success' : 'error',
        statusCode: status,
        response: data,
      };

      get().addToHistory(request);

      if ((data as { products?: Product[] }).products) {
        set({ products: (data as { products: Product[] }).products });
      }

      return data;
    } catch (error) {
      const request: ApiRequest = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        method: 'GET',
        endpoint,
        params,
        duration: 0,
        status: 'error',
        response: null,
        error: (error as Error).message,
      };
      get().addToHistory(request);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));
