'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  Calendar,
  Users,
  MapPin,
  Star,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Home,
  Bus,
  Ticket,
  Sparkles,
  ShoppingCart,
  X,
  Plus,
  Minus,
  Check,
  CreditCard,
  User,
  Mail,
  Phone,
  Globe,
  Clock,
  Mountain,
  Snowflake,
  Car,
  GraduationCap,
  Package,
  Heart,
  Info,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Building,
  Bed,
  Bath,
  Maximize,
  Coffee,
  Wifi,
  ParkingCircle,
  Wind,
  PersonStanding,
} from 'lucide-react';
import {
  useBookingStore,
  Property,
  RoomType,
  RatePlan,
  GuestService,
  ServiceCategory,
  CartAccommodation,
  CartService,
  BookingStep,
  CartProduct,
} from '../store/bookingStore';
import { UpsellGate, AccommodationUpsell } from './components/UpsellGate';
import { useUpsellStore } from '../store/upsellStore';
import AIConcierge from './components/AIConcierge';
import { PaymentFlow } from './components/PaymentFlow';
import { usePaymentStore, PaymentReceipt, ReceiptItem } from '../store/paymentStore';

// Service category config
const serviceCategoryConfig: Record<ServiceCategory | 'all', { label: string; icon: React.ReactNode; color: string }> = {
  all: { label: 'All Services', icon: <Package className="w-4 h-4" />, color: 'text-white' },
  ski_rental: { label: 'Ski Rental', icon: <PersonStanding className="w-4 h-4" />, color: 'text-blue-400' },
  snowboard_rental: { label: 'Snowboard Rental', icon: <Snowflake className="w-4 h-4" />, color: 'text-cyan-400' },
  ski_lesson: { label: 'Ski Lessons', icon: <GraduationCap className="w-4 h-4" />, color: 'text-emerald-400' },
  snowboard_lesson: { label: 'Snowboard Lessons', icon: <GraduationCap className="w-4 h-4" />, color: 'text-teal-400' },
  airport_transfer: { label: 'Airport Transfer', icon: <Car className="w-4 h-4" />, color: 'text-amber-400' },
  shuttle: { label: 'Shuttle', icon: <Bus className="w-4 h-4" />, color: 'text-orange-400' },
  lift_pass: { label: 'Lift Pass', icon: <Ticket className="w-4 h-4" />, color: 'text-purple-400' },
  spa: { label: 'Spa & Wellness', icon: <Heart className="w-4 h-4" />, color: 'text-pink-400' },
  restaurant: { label: 'Dining', icon: <Coffee className="w-4 h-4" />, color: 'text-red-400' },
  activity: { label: 'Activities', icon: <Mountain className="w-4 h-4" />, color: 'text-indigo-400' },
};

export default function BookingEnginePage() {
  const [mounted, setMounted] = useState(false);
  const [selectedRoomType, setSelectedRoomType] = useState<RoomType | null>(null);
  const [selectedRatePlan, setSelectedRatePlan] = useState<RatePlan | null>(null);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState<GuestService | null>(null);
  const [serviceDate, setServiceDate] = useState('');
  const [serviceTimeSlot, setServiceTimeSlot] = useState('');
  const [serviceQuantity, setServiceQuantity] = useState(1);
  const [serviceParticipants, setServiceParticipants] = useState(1);
  const [lastAddedAccommodation, setLastAddedAccommodation] = useState<{
    propertyName: string;
    roomTypeName: string;
    nights: number;
    totalPrice: number;
  } | null>(null);
  const [showPaymentFlow, setShowPaymentFlow] = useState(false);
  const [completedReceipt, setCompletedReceipt] = useState<PaymentReceipt | null>(null);

  // Payment store
  const { resetPayment } = usePaymentStore();

  const {
    searchParams,
    setSearchParams,
    searchAccommodations,
    searchResults,
    selectedProperty,
    selectProperty,
    availableRoomTypes,
    ratePlans,
    availableServices,
    availableProducts,
    selectedServiceCategory,
    setServiceCategory,
    cartAccommodations,
    cartServices,
    cartProducts,
    addAccommodationToCart,
    removeAccommodationFromCart,
    addServiceToCart,
    removeServiceFromCart,
    addProductToCart,
    removeProductFromCart,
    guestInfo,
    setGuestInfo,
    currentStep,
    setCurrentStep,
    currentFlow,
    isLoading,
    processBooking,
    resetBooking,
    bookingReference,
    getCartTotal,
    getAccommodationTotal,
    getServicesTotal,
    getProductsTotal,
    getCartItemCount,
    hasAccommodation,
    hasServices,
    upsellGateShown,
    markUpsellGateShown,
    language,
    currency,
  } = useBookingStore();

  // Upsell store
  const { setAvailableServices } = useUpsellStore();

  useEffect(() => {
    setMounted(true);
    // Set default check-in date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const checkIn = tomorrow.toISOString().split('T')[0];
    const checkOut = new Date(tomorrow);
    checkOut.setDate(checkOut.getDate() + 3);
    setSearchParams({
      checkIn,
      checkOut: checkOut.toISOString().split('T')[0],
    });
    // Initialize upsell store with available services
    setAvailableServices(availableServices);
  }, []);

  // Update upsell store when services change
  useEffect(() => {
    setAvailableServices(availableServices);
  }, [availableServices, setAvailableServices]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleSearch = () => {
    if (searchParams.checkIn && searchParams.nights > 0) {
      searchAccommodations();
    }
  };

  const handleSelectProperty = (property: Property) => {
    selectProperty(property);
    setShowPropertyModal(true);
    setSelectedRoomType(null);
    setSelectedRatePlan(null);
  };

  const handleAddAccommodation = () => {
    if (!selectedProperty || !selectedRoomType || !selectedRatePlan) return;

    const totalGuests = searchParams.adults + searchParams.children;
    const pricePerNight =
      selectedRatePlan.pricingType === 'occupancy_based'
        ? selectedRatePlan.baseRate + (totalGuests - 1) * selectedRatePlan.incrementPerPerson
        : selectedRatePlan.baseRate;

    const accommodation: CartAccommodation = {
      id: `acc-${Date.now()}`,
      propertyId: selectedProperty.id,
      propertyName: selectedProperty.name,
      roomTypeId: selectedRoomType.id,
      roomTypeName: selectedRoomType.name,
      ratePlanId: selectedRatePlan.id,
      ratePlanName: selectedRatePlan.name,
      checkIn: searchParams.checkIn,
      checkOut: searchParams.checkOut,
      nights: searchParams.nights,
      guests: totalGuests,
      pricePerNight,
      totalPrice: pricePerNight * searchParams.nights,
    };

    addAccommodationToCart(accommodation);

    // Store the added accommodation info for the upsell gate
    setLastAddedAccommodation({
      propertyName: selectedProperty.name,
      roomTypeName: selectedRoomType.name,
      nights: searchParams.nights,
      totalPrice: pricePerNight * searchParams.nights,
    });

    setShowPropertyModal(false);
    setSelectedRoomType(null);
    setSelectedRatePlan(null);

    // Navigate to upsell gate if not already shown
    if (!upsellGateShown.postRoom) {
      setCurrentStep('upsell_post_room');
      markUpsellGateShown('postRoom');
    } else {
      setCurrentStep('services');
    }
  };

  const handleAddService = () => {
    if (!showServiceModal || !serviceDate) return;

    const service: CartService = {
      id: `svc-${Date.now()}`,
      serviceId: showServiceModal.id,
      serviceName: showServiceModal.name,
      vendorName: showServiceModal.vendorName,
      category: showServiceModal.category,
      date: serviceDate,
      timeSlot: serviceTimeSlot || undefined,
      quantity: serviceQuantity,
      participants: serviceParticipants,
      pricePerUnit: showServiceModal.price,
      totalPrice:
        showServiceModal.priceType === 'per_person'
          ? showServiceModal.price * serviceParticipants * serviceQuantity
          : showServiceModal.price * serviceQuantity,
    };

    addServiceToCart(service);
    setShowServiceModal(null);
    setServiceDate('');
    setServiceTimeSlot('');
    setServiceQuantity(1);
    setServiceParticipants(1);
  };

  const filteredServices =
    selectedServiceCategory === 'all'
      ? availableServices
      : availableServices.filter((s) => s.category === selectedServiceCategory);

  const cartItemCount = cartAccommodations.length + cartServices.length + cartProducts.length;

  // Steps configuration for the progress indicator
  const allSteps: { id: BookingStep; label: string; visible: boolean }[] = [
    { id: 'search', label: 'Search', visible: true },
    { id: 'results', label: 'Results', visible: true },
    { id: 'upsell_post_room', label: 'Add-ons', visible: currentStep === 'upsell_post_room' },
    { id: 'services', label: 'Services', visible: true },
    { id: 'upsell_pre_checkout', label: 'Extras', visible: currentStep === 'upsell_pre_checkout' },
    { id: 'cart', label: 'Cart', visible: true },
    { id: 'checkout', label: 'Checkout', visible: true },
    { id: 'confirmation', label: 'Done', visible: true },
  ];

  const visibleSteps = allSteps.filter((s) => s.visible);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white/50 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <Image
        src="/hotel3.jpg"
        alt="Niseko"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-blue-900/80" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/20 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <Link
              href="/bookingdemo"
              aria-label="Start new booking"
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition-all"
            >
              <Home className="w-5 h-5 text-white/70" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-white">Niseko Booking</h1>
              <p className="text-xs text-white/50">Powered by RoomBoss</p>
            </div>
          </div>

          {/* Cart Button */}
          <button
            onClick={() => setCurrentStep('cart')}
            className="relative flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all"
          >
            <ShoppingCart className="w-5 h-5 text-white" />
            <span className="text-sm text-white">Cart</span>
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-amber-500 rounded-full text-xs font-bold text-white flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </button>
        </header>

        {/* Step Indicator */}
        <div className="px-6 py-3 bg-black/10 border-b border-white/10">
          <div className="flex items-center justify-center gap-2 overflow-x-auto">
            {visibleSteps.map((step, i) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => {
                    // Only allow navigation to certain steps
                    const navigableSteps: BookingStep[] = ['search', 'results', 'services', 'cart'];
                    if (navigableSteps.includes(step.id) ||
                        (step.id === 'results' && searchResults.length > 0)) {
                      setCurrentStep(step.id);
                    }
                  }}
                  className={`px-3 py-1 text-xs rounded-full transition-all whitespace-nowrap ${
                    currentStep === step.id
                      ? 'bg-amber-500 text-white'
                      : step.id.startsWith('upsell_')
                        ? 'bg-purple-500/30 text-purple-300'
                        : 'bg-white/10 text-white/50 hover:text-white hover:bg-white/20'
                  }`}
                >
                  {step.label}
                </button>
                {i < visibleSteps.length - 1 && <ChevronRight className="w-4 h-4 text-white/30 mx-1" />}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            {/* Search Step */}
            {currentStep === 'search' && (
              <div className="space-y-8">
                {/* Hero */}
                <div className="text-center py-8">
                  <h2 className="text-4xl font-light text-white mb-2" style={{ fontFamily: 'var(--font-cormorant)' }}>
                    Book Your Niseko Adventure
                  </h2>
                  <p className="text-white/60">Find the perfect accommodation and ski services</p>
                </div>

                {/* Search Form */}
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {/* Destination */}
                    <div>
                      <label htmlFor="destination-select" className="text-xs text-white/60 mb-1 block">Destination</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <select
                          id="destination-select"
                          value={searchParams.destination}
                          onChange={(e) => setSearchParams({ destination: e.target.value })}
                          className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white appearance-none cursor-pointer"
                        >
                          <option value="niseko" className="bg-gray-800 text-white">Niseko, Hokkaido</option>
                          <option value="hakuba" className="bg-gray-800 text-white">Hakuba, Nagano</option>
                          <option value="myoko" className="bg-gray-800 text-white">Myoko Kogen</option>
                        </select>
                      </div>
                    </div>

                    {/* Check-in Date */}
                    <div>
                      <label htmlFor="checkin-date" className="text-xs text-white/60 mb-1 block">Check-in</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input
                          id="checkin-date"
                          type="date"
                          value={searchParams.checkIn}
                          onChange={(e) => {
                            const checkIn = e.target.value;
                            const checkOut = new Date(checkIn);
                            checkOut.setDate(checkOut.getDate() + searchParams.nights);
                            setSearchParams({
                              checkIn,
                              checkOut: checkOut.toISOString().split('T')[0],
                            });
                          }}
                          className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white"
                        />
                      </div>
                    </div>

                    {/* Nights */}
                    <div>
                      <label htmlFor="nights-select" className="text-xs text-white/60 mb-1 block">Nights</label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <select
                          id="nights-select"
                          value={searchParams.nights}
                          onChange={(e) => {
                            const nights = parseInt(e.target.value);
                            const checkOut = new Date(searchParams.checkIn);
                            checkOut.setDate(checkOut.getDate() + nights);
                            setSearchParams({
                              nights,
                              checkOut: checkOut.toISOString().split('T')[0],
                            });
                          }}
                          className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white appearance-none cursor-pointer"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 10, 14].map((n) => (
                            <option key={n} value={n} className="bg-gray-800 text-white">
                              {n} {n === 1 ? 'Night' : 'Nights'}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Guests */}
                    <div>
                      <label htmlFor="guests-select" className="text-xs text-white/60 mb-1 block">Guests</label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <select
                          id="guests-select"
                          value={`${searchParams.adults}-${searchParams.children}`}
                          onChange={(e) => {
                            const [adults, children] = e.target.value.split('-').map(Number);
                            setSearchParams({ adults, children });
                          }}
                          className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white appearance-none cursor-pointer"
                        >
                          <option value="1-0" className="bg-gray-800 text-white">1 Adult</option>
                          <option value="2-0" className="bg-gray-800 text-white">2 Adults</option>
                          <option value="2-1" className="bg-gray-800 text-white">2 Adults, 1 Child</option>
                          <option value="2-2" className="bg-gray-800 text-white">2 Adults, 2 Children</option>
                          <option value="3-0" className="bg-gray-800 text-white">3 Adults</option>
                          <option value="4-0" className="bg-gray-800 text-white">4 Adults</option>
                          <option value="4-2" className="bg-gray-800 text-white">4 Adults, 2 Children</option>
                        </select>
                      </div>
                    </div>

                    {/* Search Button */}
                    <div className="flex items-end">
                      <button
                        onClick={handleSearch}
                        disabled={isLoading}
                        className="w-full bg-amber-500 hover:bg-amber-400 text-gray-900 font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <Search className="w-5 h-5" />
                            Search
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick Services */}
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">Popular Ski Services</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { category: 'ski_rental', label: 'Ski Rental', icon: <PersonStanding className="w-6 h-6" /> },
                      { category: 'ski_lesson', label: 'Ski Lessons', icon: <GraduationCap className="w-6 h-6" /> },
                      { category: 'lift_pass', label: 'Lift Passes', icon: <Ticket className="w-6 h-6" /> },
                      { category: 'airport_transfer', label: 'Transfers', icon: <Car className="w-6 h-6" /> },
                    ].map((item) => (
                      <button
                        key={item.category}
                        onClick={() => {
                          setServiceCategory(item.category as ServiceCategory);
                          setCurrentStep('services');
                        }}
                        className="flex flex-col items-center gap-3 p-6 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all group"
                      >
                        <div className="text-amber-400 group-hover:scale-110 transition-transform">
                          {item.icon}
                        </div>
                        <span className="text-sm text-white">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Results Step */}
            {currentStep === 'results' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-light text-white">Available Properties</h2>
                    <p className="text-sm text-white/50">
                      {searchResults.length} properties found for {searchParams.nights} nights
                    </p>
                  </div>
                  <button
                    onClick={() => setCurrentStep('search')}
                    className="text-sm text-amber-400 hover:text-amber-300 flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Modify Search
                  </button>
                </div>

                {/* Property Cards */}
                <div className="grid gap-4">
                  {searchResults.map((property) => (
                    <div
                      key={property.id}
                      className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 overflow-hidden hover:border-amber-500/50 transition-all"
                    >
                      <div className="flex flex-col md:flex-row">
                        {/* Image */}
                        <div className="md:w-72 h-48 md:h-auto relative flex-shrink-0">
                          <Image
                            src={property.images[0]}
                            alt={property.name}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute top-3 left-3 px-2 py-1 bg-black/50 backdrop-blur rounded text-xs text-white">
                            {property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)}
                          </div>
                        </div>

                        {/* Details */}
                        <div className="flex-1 p-5">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-lg font-medium text-white">{property.name}</h3>
                              <p className="text-xs text-white/50">{property.nameJapanese}</p>
                            </div>
                            <div className="flex items-center gap-1 text-amber-400">
                              <Star className="w-4 h-4 fill-current" />
                              <span className="text-sm font-medium">{property.rating}</span>
                              <span className="text-xs text-white/40">({property.reviewCount})</span>
                            </div>
                          </div>

                          <p className="text-sm text-white/70 mb-3 line-clamp-2">{property.description}</p>

                          <div className="flex items-center gap-4 text-xs text-white/50 mb-4">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {property.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Mountain className="w-3 h-3" />
                              {property.distanceToLift} to lift
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-4">
                            {property.amenities.slice(0, 5).map((amenity) => (
                              <span
                                key={amenity}
                                className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-white/60"
                              >
                                {amenity}
                              </span>
                            ))}
                            {property.amenities.length > 5 && (
                              <span className="px-2 py-1 text-xs text-white/40">
                                +{property.amenities.length - 5} more
                              </span>
                            )}
                          </div>

                          <button
                            onClick={() => handleSelectProperty(property)}
                            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                          >
                            View Rooms
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Continue to Services */}
                <div className="flex justify-center pt-4">
                  <button
                    onClick={() => setCurrentStep('services')}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white transition-all flex items-center gap-2"
                  >
                    <PersonStanding className="w-5 h-5" />
                    Browse Ski Services
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Upsell Gate - Post Room Selection */}
            {currentStep === 'upsell_post_room' && (
              <UpsellGate
                trigger="post_room_selection"
                addedAccommodation={lastAddedAccommodation || undefined}
                onContinue={() => setCurrentStep('services')}
                onSkip={() => setCurrentStep('services')}
              />
            )}

            {/* Services Step */}
            {currentStep === 'services' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-light text-white">Ski Services & Activities</h2>
                    <p className="text-sm text-white/50">Enhance your stay with these services</p>
                  </div>
                </div>

                {/* Category Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {(Object.keys(serviceCategoryConfig) as (ServiceCategory | 'all')[]).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setServiceCategory(cat)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                        selectedServiceCategory === cat
                          ? 'bg-amber-500 text-white'
                          : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                    >
                      {serviceCategoryConfig[cat].icon}
                      <span className="text-sm">{serviceCategoryConfig[cat].label}</span>
                    </button>
                  ))}
                </div>

                {/* Service Cards */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredServices.map((service) => (
                    <div
                      key={service.id}
                      className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 overflow-hidden hover:border-amber-500/50 transition-all"
                    >
                      <div className="h-32 relative">
                        <Image
                          src={service.images[0] || '/hotel1.jpg'}
                          alt={service.name}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute top-2 left-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium bg-black/50 backdrop-blur ${serviceCategoryConfig[service.category].color}`}>
                            {serviceCategoryConfig[service.category].label}
                          </span>
                        </div>
                      </div>

                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-sm font-medium text-white">{service.name}</h3>
                            <p className="text-xs text-white/50">{service.vendorName}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-amber-400">{formatPrice(service.price)}</p>
                            <p className="text-xs text-white/40">{service.priceType.replace('_', ' ')}</p>
                          </div>
                        </div>

                        <p className="text-xs text-white/60 mb-3 line-clamp-2">{service.description}</p>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-white/40">{service.duration}</span>
                          <button
                            onClick={() => {
                              setShowServiceModal(service);
                              setServiceDate(searchParams.checkIn);
                            }}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium rounded transition-colors"
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Continue Button */}
                <div className="flex justify-center pt-4">
                  <button
                    onClick={() => setCurrentStep('cart')}
                    className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    View Cart ({cartItemCount} items)
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Cart Step */}
            {currentStep === 'cart' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-light text-white">Your Cart</h2>

                {cartItemCount === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-16 h-16 text-white/20 mx-auto mb-4" />
                    <p className="text-white/50 mb-4">Your cart is empty</p>
                    <button
                      onClick={() => setCurrentStep('search')}
                      className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
                    >
                      Start Booking
                    </button>
                  </div>
                ) : (
                  <div className="grid lg:grid-cols-3 gap-6">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                      {/* Accommodations */}
                      {cartAccommodations.length > 0 && (
                        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
                          <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                            <Building className="w-4 h-4 text-amber-400" />
                            Accommodation
                          </h3>
                          <div className="space-y-3">
                            {cartAccommodations.map((acc) => (
                              <div key={acc.id} className="flex items-start gap-4 p-3 bg-white/5 rounded-lg">
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-white">{acc.propertyName}</p>
                                  <p className="text-xs text-white/50">{acc.roomTypeName} - {acc.ratePlanName}</p>
                                  <p className="text-xs text-white/40 mt-1">
                                    {acc.checkIn} to {acc.checkOut} ({acc.nights} nights, {acc.guests} guests)
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-bold text-amber-400">{formatPrice(acc.totalPrice)}</p>
                                  <button
                                    onClick={() => removeAccommodationFromCart(acc.id)}
                                    className="text-xs text-red-400 hover:text-red-300 mt-1"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Services */}
                      {cartServices.length > 0 && (
                        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
                          <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                            <PersonStanding className="w-4 h-4 text-amber-400" />
                            Services & Activities
                          </h3>
                          <div className="space-y-3">
                            {cartServices.map((svc) => (
                              <div key={svc.id} className="flex items-start gap-4 p-3 bg-white/5 rounded-lg">
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-white">{svc.serviceName}</p>
                                  <p className="text-xs text-white/50">{svc.vendorName}</p>
                                  <p className="text-xs text-white/40 mt-1">
                                    {svc.date} {svc.timeSlot && `at ${svc.timeSlot}`}
                                    {svc.participants > 1 && ` - ${svc.participants} people`}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-bold text-amber-400">{formatPrice(svc.totalPrice)}</p>
                                  <button
                                    onClick={() => removeServiceFromCart(svc.id)}
                                    className="text-xs text-red-400 hover:text-red-300 mt-1"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Summary */}
                    <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4 h-fit">
                      <h3 className="text-sm font-medium text-white mb-4">Order Summary</h3>

                      <div className="space-y-2 text-sm">
                        {cartAccommodations.length > 0 && (
                          <div className="flex justify-between text-white/70">
                            <span>Accommodation</span>
                            <span>{formatPrice(cartAccommodations.reduce((sum, a) => sum + a.totalPrice, 0))}</span>
                          </div>
                        )}
                        {cartServices.length > 0 && (
                          <div className="flex justify-between text-white/70">
                            <span>Services</span>
                            <span>{formatPrice(cartServices.reduce((sum, s) => sum + s.totalPrice, 0))}</span>
                          </div>
                        )}
                        <div className="border-t border-white/10 pt-2 mt-2">
                          <div className="flex justify-between text-white font-medium">
                            <span>Total</span>
                            <span className="text-amber-400">{formatPrice(getCartTotal())}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          // Show pre-checkout upsell if not shown yet
                          if (!upsellGateShown.preCheckout) {
                            setCurrentStep('upsell_pre_checkout');
                            markUpsellGateShown('preCheckout');
                          } else {
                            setCurrentStep('checkout');
                          }
                        }}
                        className="w-full mt-4 py-3 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        Proceed to Checkout
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => setCurrentStep('results')}
                          className="flex-1 py-2 bg-white/10 hover:bg-white/20 text-white/70 text-xs rounded-lg transition-colors"
                        >
                          + Add Accommodation
                        </button>
                        <button
                          onClick={() => setCurrentStep('services')}
                          className="flex-1 py-2 bg-white/10 hover:bg-white/20 text-white/70 text-xs rounded-lg transition-colors"
                        >
                          + Add Services
                        </button>
                      </div>

                      {/* Accommodation Upsell for products-first flow */}
                      {!hasAccommodation() && cartServices.length > 0 && !upsellGateShown.noAccommodation && (
                        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Building className="w-4 h-4 text-blue-400" />
                            <span className="text-sm font-medium text-blue-400">Need accommodation?</span>
                          </div>
                          <p className="text-xs text-white/60 mb-2">
                            You have services booked but no accommodation. Would you like to add a room?
                          </p>
                          <button
                            onClick={() => setCurrentStep('results')}
                            className="w-full py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-xs font-medium rounded transition-colors"
                          >
                            Browse Properties
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Upsell Gate - Pre Checkout */}
            {currentStep === 'upsell_pre_checkout' && (
              <UpsellGate
                trigger="pre_checkout"
                onContinue={() => setCurrentStep('checkout')}
                onSkip={() => setCurrentStep('checkout')}
              />
            )}

            {/* Checkout Step */}
            {currentStep === 'checkout' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-light text-white">
                    {showPaymentFlow ? 'Payment' : 'Checkout'}
                  </h2>
                  {!showPaymentFlow && (
                    <button
                      onClick={() => setCurrentStep('cart')}
                      className="text-sm text-white/50 hover:text-white transition-colors"
                    >
                      Back to Cart
                    </button>
                  )}
                </div>

                {/* Guest Info Form (shown first) */}
                {!showPaymentFlow && (
                  <div className="grid lg:grid-cols-3 gap-6">
                    {/* Guest Details Form */}
                    <div className="lg:col-span-2 space-y-4">
                      <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
                        <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                          <User className="w-4 h-4 text-amber-400" />
                          Guest Information
                        </h3>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-white/60 mb-1 block">First Name *</label>
                            <input
                              type="text"
                              value={guestInfo.firstName}
                              onChange={(e) => setGuestInfo({ firstName: e.target.value })}
                              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                              placeholder="John"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-white/60 mb-1 block">Last Name *</label>
                            <input
                              type="text"
                              value={guestInfo.lastName}
                              onChange={(e) => setGuestInfo({ lastName: e.target.value })}
                              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                              placeholder="Smith"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-white/60 mb-1 block">Email *</label>
                            <input
                              type="email"
                              value={guestInfo.email}
                              onChange={(e) => setGuestInfo({ email: e.target.value })}
                              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                              placeholder="john@example.com"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-white/60 mb-1 block">Phone *</label>
                            <input
                              type="tel"
                              value={guestInfo.phone}
                              onChange={(e) => setGuestInfo({ phone: e.target.value })}
                              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                              placeholder="+81 90 1234 5678"
                            />
                          </div>
                          <div>
                            <label htmlFor="country-select" className="text-xs text-white/60 mb-1 block">Country *</label>
                            <select
                              id="country-select"
                              value={guestInfo.country}
                              onChange={(e) => setGuestInfo({ country: e.target.value })}
                              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white appearance-none cursor-pointer"
                            >
                              <option value="" className="bg-gray-800 text-white">Select Country</option>
                              <option value="AU" className="bg-gray-800 text-white">Australia</option>
                              <option value="JP" className="bg-gray-800 text-white">Japan</option>
                              <option value="US" className="bg-gray-800 text-white">United States</option>
                              <option value="UK" className="bg-gray-800 text-white">United Kingdom</option>
                              <option value="SG" className="bg-gray-800 text-white">Singapore</option>
                              <option value="HK" className="bg-gray-800 text-white">Hong Kong</option>
                              <option value="OTHER" className="bg-gray-800 text-white">Other</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs text-white/60 mb-1 block">Arrival Time</label>
                            <input
                              type="time"
                              value={guestInfo.arrivalTime}
                              onChange={(e) => setGuestInfo({ arrivalTime: e.target.value })}
                              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-xs text-white/60 mb-1 block">Special Requests</label>
                            <textarea
                              value={guestInfo.specialRequests}
                              onChange={(e) => setGuestInfo({ specialRequests: e.target.value })}
                              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white h-24 resize-none"
                              placeholder="Any special requirements or requests..."
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4 h-fit">
                      <h3 className="text-sm font-medium text-white mb-4">Order Summary</h3>

                      <div className="space-y-3 text-sm max-h-64 overflow-y-auto">
                        {cartAccommodations.map((acc) => (
                          <div key={acc.id} className="flex justify-between text-white/70">
                            <span className="truncate flex-1 mr-2">{acc.roomTypeName}</span>
                            <span>{formatPrice(acc.totalPrice)}</span>
                          </div>
                        ))}
                        {cartServices.map((svc) => (
                          <div key={svc.id} className="flex justify-between text-white/70">
                            <span className="truncate flex-1 mr-2">{svc.serviceName}</span>
                            <span>{formatPrice(svc.totalPrice)}</span>
                          </div>
                        ))}
                        {cartProducts.map((prod) => (
                          <div key={prod.id} className="flex justify-between text-white/70">
                            <span className="truncate flex-1 mr-2">{prod.productName}</span>
                            <span>{formatPrice(prod.totalPrice)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-white/10 pt-3 mt-3 space-y-1">
                        <div className="flex justify-between text-sm text-white/60">
                          <span>Subtotal</span>
                          <span>{formatPrice(getCartTotal())}</span>
                        </div>
                        <div className="flex justify-between text-sm text-white/60">
                          <span>Tax (10%)</span>
                          <span>{formatPrice(Math.round(getCartTotal() * 0.1))}</span>
                        </div>
                        <div className="flex justify-between text-white font-medium text-lg pt-2 border-t border-white/10">
                          <span>Total</span>
                          <span className="text-amber-400">{formatPrice(Math.round(getCartTotal() * 1.1))}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setShowPaymentFlow(true)}
                        disabled={!guestInfo.firstName || !guestInfo.lastName || !guestInfo.email || !guestInfo.phone || !guestInfo.country}
                        className="w-full mt-4 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-white/20 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <CreditCard className="w-5 h-5" />
                        Continue to Payment
                      </button>

                      {(!guestInfo.firstName || !guestInfo.lastName || !guestInfo.email || !guestInfo.phone || !guestInfo.country) && (
                        <p className="text-xs text-amber-400/70 text-center mt-2">
                          Please fill in all required fields
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Payment Flow */}
                {showPaymentFlow && (
                  <div className="max-w-2xl mx-auto">
                    <PaymentFlow
                      amount={getCartTotal()}
                      bookingReference={`RB-${Date.now().toString(36).toUpperCase()}`}
                      items={[
                        ...cartAccommodations.map((acc): ReceiptItem => ({
                          type: 'accommodation',
                          name: acc.propertyName,
                          description: `${acc.roomTypeName} - ${acc.nights} nights`,
                          quantity: 1,
                          unitPrice: acc.totalPrice,
                          totalPrice: acc.totalPrice,
                        })),
                        ...cartServices.map((svc): ReceiptItem => ({
                          type: 'service',
                          name: svc.serviceName,
                          description: `${svc.vendorName} - ${svc.date}`,
                          quantity: svc.quantity,
                          unitPrice: svc.pricePerUnit,
                          totalPrice: svc.totalPrice,
                        })),
                        ...cartProducts.map((prod): ReceiptItem => ({
                          type: 'product',
                          name: prod.productName,
                          description: prod.description,
                          quantity: prod.quantity,
                          unitPrice: prod.pricePerUnit,
                          totalPrice: prod.totalPrice,
                        })),
                      ]}
                      onSuccess={(receipt) => {
                        setCompletedReceipt(receipt);
                        processBooking();
                      }}
                      onCancel={() => {
                        setShowPaymentFlow(false);
                        resetPayment();
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Confirmation Step */}
            {currentStep === 'confirmation' && (
              <div className="max-w-2xl mx-auto text-center py-12">
                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                </div>

                <h2 className="text-3xl font-light text-white mb-2">Booking Confirmed!</h2>
                <p className="text-white/60 mb-6">Thank you for your reservation</p>

                <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6 mb-6">
                  <p className="text-sm text-white/50 mb-2">Booking Reference</p>
                  <p className="text-2xl font-mono font-bold text-amber-400">{bookingReference}</p>
                </div>

                <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6 text-left mb-6">
                  <h3 className="text-sm font-medium text-white mb-4">Booking Details</h3>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/50">Guest Name</span>
                      <span className="text-white">{guestInfo.firstName} {guestInfo.lastName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/50">Email</span>
                      <span className="text-white">{guestInfo.email}</span>
                    </div>
                    {cartAccommodations.length > 0 && (
                      <>
                        <div className="border-t border-white/10 pt-3">
                          <p className="text-xs text-amber-400 mb-2">Accommodation</p>
                          {cartAccommodations.map((acc) => (
                            <div key={acc.id} className="text-sm text-white/70">
                              {acc.propertyName} - {acc.roomTypeName}
                              <br />
                              <span className="text-xs text-white/40">
                                {acc.checkIn} to {acc.checkOut}
                              </span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                    {cartServices.length > 0 && (
                      <div className="border-t border-white/10 pt-3">
                        <p className="text-xs text-amber-400 mb-2">Services</p>
                        {cartServices.map((svc) => (
                          <div key={svc.id} className="text-sm text-white/70">
                            {svc.serviceName}
                            <br />
                            <span className="text-xs text-white/40">{svc.date}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="border-t border-white/10 pt-3">
                      <div className="flex justify-between font-medium">
                        <span className="text-white">Total Paid</span>
                        <span className="text-amber-400">{formatPrice(getCartTotal())}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-white/50 mb-6">
                  A confirmation email has been sent to {guestInfo.email}
                </p>

                <div className="flex gap-4 justify-center">
                  <Link
                    href="/bookingdemo"
                    onClick={() => resetBooking()}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg transition-colors"
                  >
                    Start New Booking
                  </Link>
                  <button
                    onClick={resetBooking}
                    className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-gray-900 font-semibold rounded-lg transition-colors"
                  >
                    Make Another Booking
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Property Room Selection Modal */}
      {showPropertyModal && selectedProperty && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900/95 border border-white/20 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="text-lg font-medium text-white">{selectedProperty.name}</h3>
                <p className="text-xs text-white/50">{selectedProperty.location}</p>
              </div>
              <button
                onClick={() => setShowPropertyModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Room Types */}
                <div>
                  <h4 className="text-sm font-medium text-white mb-3">Select Room Type</h4>
                  <div className="space-y-2">
                    {availableRoomTypes.map((room) => (
                      <button
                        key={room.id}
                        onClick={() => {
                          setSelectedRoomType(room);
                          setSelectedRatePlan(null);
                        }}
                        className={`w-full p-3 rounded-lg border text-left transition-all ${
                          selectedRoomType?.id === room.id
                            ? 'bg-amber-500/20 border-amber-500/50'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-medium text-white">{room.name}</p>
                            <p className="text-xs text-white/50 mt-1">{room.bedConfiguration}</p>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-white/40">
                            <Users className="w-3 h-3" />
                            <span>Max {room.maxGuests}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-xs text-white/40">
                          <span className="flex items-center gap-1">
                            <Maximize className="w-3 h-3" />
                            {room.size}m²
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rate Plans */}
                <div>
                  <h4 className="text-sm font-medium text-white mb-3">Select Rate Plan</h4>
                  {selectedRoomType ? (
                    <div className="space-y-2">
                      {ratePlans
                        .filter((rp) => rp.roomTypeId === selectedRoomType.id)
                        .map((plan) => {
                          const totalGuests = searchParams.adults + searchParams.children;
                          const pricePerNight =
                            plan.pricingType === 'occupancy_based'
                              ? plan.baseRate + (totalGuests - 1) * plan.incrementPerPerson
                              : plan.baseRate;

                          return (
                            <button
                              key={plan.id}
                              onClick={() => setSelectedRatePlan(plan)}
                              className={`w-full p-3 rounded-lg border text-left transition-all ${
                                selectedRatePlan?.id === plan.id
                                  ? 'bg-amber-500/20 border-amber-500/50'
                                  : 'bg-white/5 border-white/10 hover:bg-white/10'
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="text-sm font-medium text-white">{plan.name}</p>
                                  <p className="text-xs text-white/50 mt-1">{plan.description}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-lg font-bold text-amber-400">{formatPrice(pricePerNight)}</p>
                                  <p className="text-xs text-white/40">per night</p>
                                </div>
                              </div>
                              <div className="mt-2 flex flex-wrap gap-1">
                                {plan.includedServices.map((service) => (
                                  <span
                                    key={service}
                                    className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded"
                                  >
                                    {service}
                                  </span>
                                ))}
                              </div>
                              <p className="text-xs text-white/30 mt-2">{plan.cancellationPolicy}</p>
                            </button>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-white/40 text-sm">
                      Select a room type to see available rates
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/10 flex items-center justify-between flex-shrink-0">
              <div>
                {selectedRoomType && selectedRatePlan && (
                  <div>
                    <p className="text-sm text-white/50">
                      {searchParams.nights} nights total
                    </p>
                    <p className="text-xl font-bold text-amber-400">
                      {formatPrice(
                        (selectedRatePlan.pricingType === 'occupancy_based'
                          ? selectedRatePlan.baseRate +
                            (searchParams.adults + searchParams.children - 1) *
                              selectedRatePlan.incrementPerPerson
                          : selectedRatePlan.baseRate) * searchParams.nights
                      )}
                    </p>
                  </div>
                )}
              </div>
              <button
                onClick={handleAddAccommodation}
                disabled={!selectedRoomType || !selectedRatePlan}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-white/20 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Service Modal */}
      {showServiceModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900/95 border border-white/20 rounded-2xl w-full max-w-lg overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-white">{showServiceModal.name}</h3>
                <p className="text-xs text-white/50">{showServiceModal.vendorName}</p>
              </div>
              <button
                onClick={() => setShowServiceModal(null)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 space-y-4">
              <p className="text-sm text-white/70">{showServiceModal.description}</p>

              <div className="flex flex-wrap gap-2">
                {showServiceModal.included.map((item) => (
                  <span
                    key={item}
                    className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/60 mb-1 block">Date *</label>
                  <input
                    type="date"
                    value={serviceDate}
                    onChange={(e) => setServiceDate(e.target.value)}
                    min={searchParams.checkIn}
                    max={searchParams.checkOut}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
                  />
                </div>
                {showServiceModal.timeSlots.length > 0 && showServiceModal.timeSlots[0] !== 'Any Time' && (
                  <div>
                    <label htmlFor="timeslot-select" className="text-xs text-white/60 mb-1 block">Time Slot</label>
                    <select
                      id="timeslot-select"
                      value={serviceTimeSlot}
                      onChange={(e) => setServiceTimeSlot(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-gray-800 text-white">Select time</option>
                      {showServiceModal.timeSlots.map((slot) => (
                        <option key={slot} value={slot} className="bg-gray-800 text-white">
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {showServiceModal.priceType === 'per_person' && (
                <div>
                  <label className="text-xs text-white/60 mb-1 block">Number of Participants</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setServiceParticipants(Math.max(1, serviceParticipants - 1))}
                      className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <Minus className="w-4 h-4 text-white" />
                    </button>
                    <span className="text-lg font-medium text-white w-12 text-center">
                      {serviceParticipants}
                    </span>
                    <button
                      onClick={() =>
                        setServiceParticipants(
                          Math.min(showServiceModal.maxParticipants, serviceParticipants + 1)
                        )
                      }
                      className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              )}

              {(showServiceModal.priceType === 'per_day' || showServiceModal.priceType === 'per_item') && (
                <div>
                  <label className="text-xs text-white/60 mb-1 block">Quantity / Days</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setServiceQuantity(Math.max(1, serviceQuantity - 1))}
                      className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <Minus className="w-4 h-4 text-white" />
                    </button>
                    <span className="text-lg font-medium text-white w-12 text-center">
                      {serviceQuantity}
                    </span>
                    <button
                      onClick={() => setServiceQuantity(serviceQuantity + 1)}
                      className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white/50">Total</span>
                  <span className="text-2xl font-bold text-amber-400">
                    {formatPrice(
                      showServiceModal.priceType === 'per_person'
                        ? showServiceModal.price * serviceParticipants * serviceQuantity
                        : showServiceModal.price * serviceQuantity
                    )}
                  </span>
                </div>
                <button
                  onClick={handleAddService}
                  disabled={!serviceDate}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-white/20 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Concierge - Voice & Chat Assistant */}
      <AIConcierge />
    </div>
  );
}
