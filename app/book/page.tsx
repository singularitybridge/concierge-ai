'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Search,
  Calendar,
  Users,
  MapPin,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Home,
  Star,
  Bed,
  Bath,
  X,
  Loader2,
  CheckCircle2,
  User,
  Mail,
  Phone,
  Building,
  CreditCard,
  ArrowRight,
  Minus,
  Plus,
} from 'lucide-react';
import { useRoombossApiStore, LOCATION_CODES, Hotel, RoomType } from '../store/roombossApiStore';

type BookingStep = 'search' | 'results' | 'room' | 'guest' | 'confirmation';

interface AvailableHotel extends Hotel {
  availableRoomTypes?: (RoomType & {
    ratePlan?: {
      ratePlanId: number;
      priceRetail: number;
      priceRack?: number;
      priceNet?: number;
    };
  })[];
}

interface GuestInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialRequests: string;
}

interface BookingResult {
  success: boolean;
  bookingId?: string;
  invoiceNumber?: string;
  invoiceAmount?: number;
  guestIntranetUrl?: string;
}

export default function BookingEngine() {
  const [currentStep, setCurrentStep] = useState<BookingStep>('search');
  const [countryCode, _setCountryCode] = useState('JP');
  const [locationCode, setLocationCode] = useState('HAKUBA');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [searchResults, setSearchResults] = useState<AvailableHotel[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<AvailableHotel | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<RoomType | null>(null);
  const [selectedRatePlan, setSelectedRatePlan] = useState<{ ratePlanId: number; priceRetail: number } | null>(null);
  const [hotelImages, setHotelImages] = useState<Record<string, string>>({});
  const [hotelDescription, setHotelDescription] = useState<string>('');
  const [guestInfo, setGuestInfo] = useState<GuestInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialRequests: '',
  });
  const [bookingResult, setBookingResult] = useState<BookingResult | null>(null);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    isLoading,
    listHotels,
    listAvailable,
    listImages,
    listDescriptions,
    createBooking,
  } = useRoombossApiStore();

  const locations = LOCATION_CODES[countryCode as keyof typeof LOCATION_CODES] || [];
  const totalGuests = adults + children + infants;

  // Set default dates
  useEffect(() => {
    const today = new Date();
    const checkInDate = new Date(today);
    checkInDate.setDate(today.getDate() + 14);
    const checkOutDate = new Date(checkInDate);
    checkOutDate.setDate(checkInDate.getDate() + 3);

    setCheckIn(formatDateForInput(checkInDate));
    setCheckOut(formatDateForInput(checkOutDate));
  }, []);

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const formatDateForApi = (dateStr: string) => {
    return dateStr.replace(/-/g, '');
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = end.getTime() - start.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(price);
  };

  const handleSearch = async () => {
    setError(null);
    try {
      // First get hotels in the location
      const hotelsResponse = await listHotels(countryCode, locationCode) as { hotels?: Hotel[] };
      const hotelsList = hotelsResponse?.hotels || [];

      if (hotelsList.length === 0) {
        setError('No hotels found in this location.');
        return;
      }

      // Then check availability
      const hotelIds = hotelsList.map((h: Hotel) => h.hotelId);
      const availResponse = await listAvailable({
        hotelIds,
        checkIn: formatDateForApi(checkIn),
        checkOut: formatDateForApi(checkOut),
        numberGuests: totalGuests,
        numberAdults: adults,
        numberChildren: children,
        numberInfants: infants,
        rate: 'ota',
      }) as { availableHotels?: AvailableHotel[] };

      const available = availResponse?.availableHotels || [];
      setSearchResults(available);

      if (available.length === 0) {
        setError('No availability found for your dates. Try different dates or location.');
      } else {
        setCurrentStep('results');
      }
    } catch (err) {
      setError('Failed to search. Please try again.');
      console.error(err);
    }
  };

  const handleViewRooms = async (hotel: AvailableHotel) => {
    setSelectedHotel(hotel);
    setShowRoomModal(true);

    // Load images
    try {
      const imgResponse = await listImages(hotel.hotelId) as { hotels?: { hotelImages?: Record<string, string> }[] };
      if (imgResponse?.hotels?.[0]?.hotelImages) {
        setHotelImages(imgResponse.hotels[0].hotelImages);
      }
    } catch (err) {
      console.error('Failed to load images:', err);
    }

    // Load description
    try {
      const descResponse = await listDescriptions(hotel.hotelId, 'en') as { hotels?: { hotelDescription?: string }[] };
      if (descResponse?.hotels?.[0]?.hotelDescription) {
        setHotelDescription(descResponse.hotels[0].hotelDescription);
      }
    } catch (err) {
      console.error('Failed to load description:', err);
    }
  };

  const handleSelectRoom = (room: RoomType, ratePlan: { ratePlanId: number; priceRetail: number }) => {
    setSelectedRoom(room);
    setSelectedRatePlan(ratePlan);
    setShowRoomModal(false);
    setCurrentStep('guest');
  };

  const handleBooking = async () => {
    if (!selectedHotel || !selectedRoom || !selectedRatePlan) return;
    setError(null);

    try {
      const response = await createBooking({
        hotelId: selectedHotel.hotelId,
        roomTypeId: selectedRoom.roomTypeId,
        ratePlanId: selectedRatePlan.ratePlanId,
        checkIn: formatDateForApi(checkIn),
        checkOut: formatDateForApi(checkOut),
        numberGuests: totalGuests,
        numberAdults: adults,
        numberChildren: children,
        numberInfants: infants,
        guestGivenName: guestInfo.firstName,
        guestFamilyName: guestInfo.lastName,
        guestEmail: guestInfo.email || undefined,
        contactNumber: guestInfo.phone || undefined,
        priceRetailMax: selectedRatePlan.priceRetail * calculateNights() * 1.1,
        bookingExtent: 'RESERVATION',
        comment: guestInfo.specialRequests || undefined,
      }) as {
        success: boolean;
        order?: {
          bookings?: { bookingId: string; guestIntranetUrl?: string }[];
          invoicePayments?: { invoiceNumber: string; invoiceAmount: number }[];
        };
        failureMessage?: string;
      };

      if (response?.success) {
        setBookingResult({
          success: true,
          bookingId: response.order?.bookings?.[0]?.bookingId,
          invoiceNumber: response.order?.invoicePayments?.[0]?.invoiceNumber,
          invoiceAmount: response.order?.invoicePayments?.[0]?.invoiceAmount,
          guestIntranetUrl: response.order?.bookings?.[0]?.guestIntranetUrl,
        });
        setCurrentStep('confirmation');
      } else {
        setError(response?.failureMessage || 'Booking failed. Please try again.');
      }
    } catch (err) {
      setError('Booking failed. Please try again.');
      console.error(err);
    }
  };

  const getStepNumber = () => {
    const steps = ['search', 'results', 'room', 'guest', 'confirmation'];
    return steps.indexOf(currentStep) + 1;
  };

  const canProceedToBooking = guestInfo.firstName && guestInfo.lastName && guestInfo.email;

  return (
    <div className="min-h-screen bg-stone-900 relative">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/niseko.jpg"
          alt="Mountain backdrop"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-stone-900/95" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-black/30 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-light text-white" style={{ fontFamily: 'var(--font-cormorant)' }}>
                THE 1898 NISEKO
              </h1>
              <p className="text-[10px] text-white/50 tracking-widest uppercase">Book Your Stay</p>
            </div>
          </Link>

          {/* Step Indicator */}
          {currentStep !== 'search' && (
            <div className="flex items-center gap-2">
              {['Search', 'Results', 'Details', 'Confirm'].map((step, i) => (
                <React.Fragment key={step}>
                  <span className={`px-3 py-1 text-xs rounded-full transition-all ${
                    getStepNumber() > i + 1
                      ? 'bg-amber-500/20 text-amber-400'
                      : getStepNumber() === i + 1
                        ? 'bg-amber-500 text-white'
                        : 'bg-white/10 text-white/40'
                  }`}>
                    {step}
                  </span>
                  {i < 3 && <ChevronRight className="w-4 h-4 text-white/20" />}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Search Step */}
        {currentStep === 'search' && (
          <div className="min-h-[70vh] flex flex-col items-center justify-center">
            <div className="text-center mb-12">
              <h2 className="text-5xl md:text-6xl font-light text-white mb-4" style={{ fontFamily: 'var(--font-cormorant)' }}>
                Find Your Perfect Stay
              </h2>
              <p className="text-white/60 text-lg">Search availability across premium accommodations</p>
            </div>

            <div className="w-full max-w-4xl bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* Location */}
                <div className="md:col-span-2">
                  <label className="text-xs text-white/60 mb-1 block">Destination</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <select
                      value={locationCode}
                      onChange={(e) => setLocationCode(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white appearance-none focus:border-amber-500/50 focus:outline-none"
                    >
                      {locations.map((loc) => (
                        <option key={loc.code} value={loc.code} className="bg-stone-800">
                          {loc.name}, {countryCode}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  </div>
                </div>

                {/* Check-in */}
                <div>
                  <label className="text-xs text-white/60 mb-1 block">Check-in</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white focus:border-amber-500/50 focus:outline-none [color-scheme:dark]"
                    />
                  </div>
                </div>

                {/* Check-out */}
                <div>
                  <label className="text-xs text-white/60 mb-1 block">Check-out</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white focus:border-amber-500/50 focus:outline-none [color-scheme:dark]"
                    />
                  </div>
                </div>

                {/* Guests */}
                <div>
                  <label className="text-xs text-white/60 mb-1 block">Guests</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <div className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setAdults(Math.max(1, adults - 1))} className="text-white/60 hover:text-white">
                          <Minus className="w-4 h-4" />
                        </button>
                        <span>{adults}</span>
                        <button onClick={() => setAdults(adults + 1)} className="text-white/60 hover:text-white">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-white/40 mt-1">{adults} adult{adults > 1 ? 's' : ''}, {children} child, {infants} infant</p>
                </div>
              </div>

              {/* Guest Type Controls */}
              <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-white/50 block mb-1">Adults</label>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setAdults(Math.max(1, adults - 1))} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20">
                      <Minus className="w-4 h-4 text-white" />
                    </button>
                    <span className="text-white w-8 text-center">{adults}</span>
                    <button onClick={() => setAdults(adults + 1)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20">
                      <Plus className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-white/50 block mb-1">Children</label>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setChildren(Math.max(0, children - 1))} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20">
                      <Minus className="w-4 h-4 text-white" />
                    </button>
                    <span className="text-white w-8 text-center">{children}</span>
                    <button onClick={() => setChildren(children + 1)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20">
                      <Plus className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-white/50 block mb-1">Infants</label>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setInfants(Math.max(0, infants - 1))} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20">
                      <Minus className="w-4 h-4 text-white" />
                    </button>
                    <span className="text-white w-8 text-center">{infants}</span>
                    <button onClick={() => setInfants(infants + 1)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20">
                      <Plus className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleSearch}
                disabled={isLoading || !checkIn || !checkOut}
                className="mt-6 w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/50 text-white font-medium py-4 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
                Search Availability
              </button>
            </div>
          </div>
        )}

        {/* Results Step */}
        {currentStep === 'results' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-light text-white" style={{ fontFamily: 'var(--font-cormorant)' }}>
                  Available Properties
                </h2>
                <p className="text-white/60">
                  {searchResults.length} option{searchResults.length !== 1 ? 's' : ''} for {formatDisplayDate(checkIn)} - {formatDisplayDate(checkOut)} ({calculateNights()} nights)
                </p>
              </div>
              <button
                onClick={() => setCurrentStep('search')}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                Modify Search
              </button>
            </div>

            <div className="space-y-4">
              {searchResults.map((hotel) => {
                const lowestPrice = hotel.availableRoomTypes?.reduce((min, room) =>
                  room.ratePlan?.priceRetail && room.ratePlan.priceRetail < min ? room.ratePlan.priceRetail : min,
                  Infinity
                );

                return (
                  <div
                    key={hotel.hotelId}
                    className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden hover:border-amber-500/30 transition-all"
                  >
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-72 h-48 md:h-auto bg-white/5 relative">
                        <div className="absolute inset-0 flex items-center justify-center text-white/20">
                          <Building className="w-16 h-16" />
                        </div>
                      </div>
                      <div className="flex-1 p-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-medium text-white mb-1">{hotel.hotelName}</h3>
                            <div className="flex items-center gap-3 text-white/60 text-sm">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {hotel.locationCode}
                              </span>
                              <span className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-amber-400" />
                                4.5
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-white/50 text-xs">from</p>
                            <p className="text-2xl font-light text-amber-400">
                              {lowestPrice !== Infinity ? formatPrice(lowestPrice) : 'N/A'}
                            </p>
                            <p className="text-white/50 text-xs">per night</p>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center gap-4">
                          <span className="text-white/60 text-sm">
                            {hotel.availableRoomTypes?.length || 0} room type{(hotel.availableRoomTypes?.length || 0) !== 1 ? 's' : ''} available
                          </span>
                        </div>

                        <button
                          onClick={() => handleViewRooms(hotel)}
                          className="mt-4 w-full md:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2"
                        >
                          View Rooms
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Guest Information Step */}
        {currentStep === 'guest' && selectedHotel && selectedRoom && selectedRatePlan && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={() => setCurrentStep('results')}
                  className="flex items-center gap-2 text-white/60 hover:text-white transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Back
                </button>
                <h2 className="text-3xl font-light text-white" style={{ fontFamily: 'var(--font-cormorant)' }}>
                  Guest Information
                </h2>
              </div>

              <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
                <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-amber-400" />
                  Lead Guest Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-white/60 mb-1 block">First Name *</label>
                    <input
                      type="text"
                      value={guestInfo.firstName}
                      onChange={(e) => setGuestInfo({ ...guestInfo, firstName: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:border-amber-500/50 focus:outline-none"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/60 mb-1 block">Last Name *</label>
                    <input
                      type="text"
                      value={guestInfo.lastName}
                      onChange={(e) => setGuestInfo({ ...guestInfo, lastName: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:border-amber-500/50 focus:outline-none"
                      placeholder="Smith"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/60 mb-1 block">Email *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                      <input
                        type="email"
                        value={guestInfo.email}
                        onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
                        className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-white/40 focus:border-amber-500/50 focus:outline-none"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-white/60 mb-1 block">Phone (Optional)</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                      <input
                        type="tel"
                        value={guestInfo.phone}
                        onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })}
                        className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-white/40 focus:border-amber-500/50 focus:outline-none"
                        placeholder="+81 90 1234 5678"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="text-xs text-white/60 mb-1 block">Special Requests (Optional)</label>
                  <textarea
                    value={guestInfo.specialRequests}
                    onChange={(e) => setGuestInfo({ ...guestInfo, specialRequests: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:border-amber-500/50 focus:outline-none min-h-[100px]"
                    placeholder="Any special requests for your stay..."
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400">
                  {error}
                </div>
              )}

              <button
                onClick={handleBooking}
                disabled={isLoading || !canProceedToBooking}
                className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/50 text-white font-medium py-4 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <CreditCard className="w-5 h-5" />
                )}
                Complete Booking
              </button>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 sticky top-24">
                <h3 className="text-lg font-medium text-white mb-4">Booking Summary</h3>

                <div className="space-y-4">
                  <div className="pb-4 border-b border-white/10">
                    <p className="text-white font-medium">{selectedHotel.hotelName}</p>
                    <p className="text-white/60 text-sm">{selectedRoom.roomTypeName}</p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">Check-in</span>
                      <span className="text-white">{formatDisplayDate(checkIn)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Check-out</span>
                      <span className="text-white">{formatDisplayDate(checkOut)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Nights</span>
                      <span className="text-white">{calculateNights()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Guests</span>
                      <span className="text-white">{totalGuests} guest{totalGuests !== 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <div className="flex justify-between items-center">
                      <span className="text-white/60">Per Night</span>
                      <span className="text-white">{formatPrice(selectedRatePlan.priceRetail)}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-white font-medium">Total</span>
                      <span className="text-2xl font-light text-amber-400">
                        {formatPrice(selectedRatePlan.priceRetail * calculateNights())}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Step */}
        {currentStep === 'confirmation' && bookingResult && (
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8">
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </div>

              <h2 className="text-3xl font-light text-white mb-2" style={{ fontFamily: 'var(--font-cormorant)' }}>
                Booking Confirmed!
              </h2>
              <p className="text-white/60 mb-8">Your reservation has been successfully created.</p>

              <div className="bg-white/5 rounded-xl p-6 text-left space-y-4 mb-8">
                <div className="flex justify-between">
                  <span className="text-white/60">Booking Reference</span>
                  <span className="text-white font-mono">{bookingResult.bookingId?.slice(0, 16)}...</span>
                </div>
                {bookingResult.invoiceNumber && (
                  <div className="flex justify-between">
                    <span className="text-white/60">Invoice Number</span>
                    <span className="text-white">{bookingResult.invoiceNumber}</span>
                  </div>
                )}
                {bookingResult.invoiceAmount && (
                  <div className="flex justify-between">
                    <span className="text-white/60">Total Amount</span>
                    <span className="text-amber-400 font-medium">{formatPrice(bookingResult.invoiceAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-white/60">Property</span>
                  <span className="text-white">{selectedHotel?.hotelName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Room</span>
                  <span className="text-white">{selectedRoom?.roomTypeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Dates</span>
                  <span className="text-white">{formatDisplayDate(checkIn)} - {formatDisplayDate(checkOut)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Guest</span>
                  <span className="text-white">{guestInfo.firstName} {guestInfo.lastName}</span>
                </div>
              </div>

              <p className="text-white/50 text-sm mb-6">
                A confirmation email will be sent to {guestInfo.email}
              </p>

              <div className="flex gap-4 justify-center">
                <Link
                  href="/"
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all"
                >
                  Return Home
                </Link>
                <button
                  onClick={() => {
                    setCurrentStep('search');
                    setSelectedHotel(null);
                    setSelectedRoom(null);
                    setSelectedRatePlan(null);
                    setBookingResult(null);
                    setGuestInfo({ firstName: '', lastName: '', email: '', phone: '', specialRequests: '' });
                  }}
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-600 rounded-lg text-white transition-all"
                >
                  Book Another Stay
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Room Selection Modal */}
      {showRoomModal && selectedHotel && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 rounded-2xl border border-white/20 max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-medium text-white">{selectedHotel.hotelName}</h3>
                <p className="text-white/60 text-sm">{selectedHotel.locationCode}, {selectedHotel.countryCode}</p>
              </div>
              <button
                onClick={() => setShowRoomModal(false)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Hotel Images */}
              {Object.keys(hotelImages).length > 0 && (
                <div className="mb-6">
                  <div className="grid grid-cols-2 gap-2 h-48 rounded-xl overflow-hidden">
                    {Object.entries(hotelImages).slice(0, 2).map(([key, url]) => (
                      <div key={key} className="relative bg-white/5">
                        <Image
                          src={url}
                          alt={selectedHotel.hotelName}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hotel Description */}
              {hotelDescription && (
                <div className="mb-6">
                  <p className="text-white/70 text-sm leading-relaxed">{hotelDescription}</p>
                </div>
              )}

              {/* Room Types */}
              <h4 className="text-lg font-medium text-white mb-4">Select a Room</h4>
              <div className="space-y-3">
                {selectedHotel.availableRoomTypes?.map((room) => (
                  <div
                    key={room.roomTypeId}
                    className="bg-white/5 rounded-xl border border-white/10 p-4 hover:border-amber-500/30 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="text-white font-medium">{room.roomTypeName}</h5>
                        <div className="flex items-center gap-4 mt-2 text-white/60 text-sm">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            Max {room.maxNumberGuests} guests
                          </span>
                          {room.numberBedrooms > 0 && (
                            <span className="flex items-center gap-1">
                              <Bed className="w-4 h-4" />
                              {room.numberBedrooms} bedroom{room.numberBedrooms !== 1 ? 's' : ''}
                            </span>
                          )}
                          {room.numberBathrooms > 0 && (
                            <span className="flex items-center gap-1">
                              <Bath className="w-4 h-4" />
                              {room.numberBathrooms} bath
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {room.ratePlan?.priceRetail ? (
                          <>
                            <p className="text-xl font-light text-amber-400">
                              {formatPrice(room.ratePlan.priceRetail)}
                            </p>
                            <p className="text-white/50 text-xs">per night</p>
                            <p className="text-white/40 text-xs mt-1">
                              {formatPrice(room.ratePlan.priceRetail * calculateNights())} total
                            </p>
                          </>
                        ) : (
                          <p className="text-white/50">Contact for price</p>
                        )}
                      </div>
                    </div>
                    {room.ratePlan && (
                      <button
                        onClick={() => handleSelectRoom(room, room.ratePlan!)}
                        className="mt-4 w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-all"
                      >
                        Select This Room
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
