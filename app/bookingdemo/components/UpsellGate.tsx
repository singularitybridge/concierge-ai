'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  Plus,
  Check,
  ChevronRight,
  Sparkles,
  Star,
  Building,
  PersonStanding,
  GraduationCap,
  Ticket,
  Car,
  Bus,
  Heart,
  Mountain,
  Snowflake,
  Coffee,
  Package,
  ArrowRight,
  Gift,
} from 'lucide-react';
import {
  useBookingStore,
  ServiceCategory,
  CartService,
  Property,
} from '../../store/bookingStore';
import {
  useUpsellStore,
  UpsellRecommendation,
  UpsellTrigger,
  buildUpsellContext,
} from '../../store/upsellStore';

// Service category icons
const categoryIcons: Record<ServiceCategory, React.ReactNode> = {
  ski_rental: <PersonStanding className="w-5 h-5" />,
  snowboard_rental: <Snowflake className="w-5 h-5" />,
  ski_lesson: <GraduationCap className="w-5 h-5" />,
  snowboard_lesson: <GraduationCap className="w-5 h-5" />,
  airport_transfer: <Car className="w-5 h-5" />,
  shuttle: <Bus className="w-5 h-5" />,
  lift_pass: <Ticket className="w-5 h-5" />,
  spa: <Heart className="w-5 h-5" />,
  restaurant: <Coffee className="w-5 h-5" />,
  activity: <Mountain className="w-5 h-5" />,
};

// Category colors
const categoryColors: Record<ServiceCategory, string> = {
  ski_rental: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
  snowboard_rental: 'text-cyan-400 bg-cyan-500/20 border-cyan-500/30',
  ski_lesson: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
  snowboard_lesson: 'text-teal-400 bg-teal-500/20 border-teal-500/30',
  airport_transfer: 'text-amber-400 bg-amber-500/20 border-amber-500/30',
  shuttle: 'text-orange-400 bg-orange-500/20 border-orange-500/30',
  lift_pass: 'text-purple-400 bg-purple-500/20 border-purple-500/30',
  spa: 'text-pink-400 bg-pink-500/20 border-pink-500/30',
  restaurant: 'text-red-400 bg-red-500/20 border-red-500/30',
  activity: 'text-indigo-400 bg-indigo-500/20 border-indigo-500/30',
};

interface UpsellGateProps {
  trigger: UpsellTrigger;
  onContinue: () => void;
  onSkip: () => void;
  addedAccommodation?: {
    propertyName: string;
    roomTypeName: string;
    nights: number;
    totalPrice: number;
  };
}

export function UpsellGate({
  trigger,
  onContinue,
  onSkip,
  addedAccommodation,
}: UpsellGateProps) {
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());
  const [addingService, setAddingService] = useState<string | null>(null);

  const {
    searchParams,
    cartAccommodations,
    cartServices,
    availableServices,
    addServiceToCart,
    selectedProperty,
    searchResults,
    setCurrentStep,
  } = useBookingStore();

  const {
    currentRecommendations,
    generateRecommendations,
    setAvailableServices,
    acceptRecommendation,
    declineAllForGate,
    getTopRecommendations,
  } = useUpsellStore();

  // Generate recommendations on mount
  useEffect(() => {
    setAvailableServices(availableServices);

    const context = buildUpsellContext(
      searchParams,
      cartAccommodations,
      cartServices,
      searchParams.childAges,
      selectedProperty?.amenities || [],
      selectedProperty?.distanceToLift || ''
    );

    generateRecommendations(context, trigger);
  }, [trigger]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleAddService = async (recommendation: UpsellRecommendation) => {
    setAddingService(recommendation.id);

    // Find the full service details
    const service = availableServices.find((s) => s.id === recommendation.serviceId);
    if (!service) return;

    // Create cart service
    const cartService: CartService = {
      id: `svc-${Date.now()}`,
      serviceId: service.id,
      serviceName: service.name,
      vendorName: service.vendorName,
      category: service.category,
      date: searchParams.checkIn,
      quantity: 1,
      participants: searchParams.adults + searchParams.children,
      pricePerUnit: service.price,
      totalPrice:
        service.priceType === 'per_person'
          ? service.price * (searchParams.adults + searchParams.children)
          : service.price,
    };

    // Add to cart
    addServiceToCart(cartService);
    acceptRecommendation(recommendation.id);
    setSelectedServices((prev) => new Set([...prev, recommendation.id]));

    // Brief delay for animation
    await new Promise((r) => setTimeout(r, 300));
    setAddingService(null);
  };

  const handleSkipAll = () => {
    declineAllForGate();
    onSkip();
  };

  const handleContinue = () => {
    onContinue();
  };

  const topRecommendations = getTopRecommendations(6);

  // Get title based on trigger
  const getTitle = () => {
    switch (trigger) {
      case 'post_room_selection':
        return 'Complete Your Ski Trip';
      case 'pre_checkout':
        return 'Before You Go...';
      case 'no_accommodation':
        return 'Need a Place to Stay?';
      default:
        return 'Recommended for You';
    }
  };

  // Get subtitle based on trigger
  const getSubtitle = () => {
    switch (trigger) {
      case 'post_room_selection':
        return 'Based on your booking, we recommend these services';
      case 'pre_checkout':
        return 'You might also be interested in';
      case 'no_accommodation':
        return 'We noticed you have services booked. Complete your trip with accommodation.';
      default:
        return 'Personalized recommendations for your trip';
    }
  };

  return (
    <div className="space-y-6">
      {/* Added Item Confirmation (for post-room) */}
      {addedAccommodation && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <Check className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Room Added to Cart</p>
              <p className="text-sm text-white/70 mt-1">
                {addedAccommodation.propertyName} - {addedAccommodation.roomTypeName}
              </p>
              <p className="text-xs text-white/50 mt-0.5">
                {addedAccommodation.nights} nights - {formatPrice(addedAccommodation.totalPrice)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-full mb-4">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-sm text-amber-400 font-medium">Personalized Recommendations</span>
        </div>
        <h2 className="text-2xl font-light text-white mb-2">{getTitle()}</h2>
        <p className="text-white/60">{getSubtitle()}</p>
      </div>

      {/* Recommendations Grid */}
      {topRecommendations.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topRecommendations.map((recommendation) => {
            const service = availableServices.find((s) => s.id === recommendation.serviceId);
            if (!service) return null;

            const isSelected = selectedServices.has(recommendation.id);
            const isAdding = addingService === recommendation.id;

            return (
              <div
                key={recommendation.id}
                className={`relative bg-white/10 backdrop-blur-xl rounded-xl border overflow-hidden transition-all ${
                  isSelected
                    ? 'border-emerald-500/50 bg-emerald-500/10'
                    : 'border-white/20 hover:border-amber-500/50'
                }`}
              >
                {/* Priority Badge */}
                {recommendation.priority === 'high' && (
                  <div className="absolute top-2 right-2 z-10">
                    <div className="px-2 py-0.5 bg-amber-500 rounded text-xs font-medium text-white">
                      Recommended
                    </div>
                  </div>
                )}

                {/* Image */}
                <div className="h-28 relative">
                  <Image
                    src={service.images[0] || '/hotel1.jpg'}
                    alt={service.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-2 left-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${categoryColors[service.category]}`}
                    >
                      {categoryIcons[service.category]}
                      {service.category.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-sm font-medium text-white line-clamp-1">{service.name}</h3>
                      <p className="text-xs text-white/50">{service.vendorName}</p>
                    </div>
                  </div>

                  {/* Reason */}
                  <p className="text-xs text-amber-400/90 mb-3 line-clamp-2">
                    {recommendation.reason}
                  </p>

                  {/* Price & Action */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-bold text-amber-400">
                        {formatPrice(recommendation.estimatedPrice)}
                      </p>
                      <p className="text-xs text-white/40">
                        {recommendation.priceType.replace('_', ' ')}
                      </p>
                    </div>

                    {isSelected ? (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-lg">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs text-emerald-400 font-medium">Added</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAddService(recommendation)}
                        disabled={isAdding}
                        className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/50 text-white text-xs font-medium rounded-lg transition-colors"
                      >
                        {isAdding ? (
                          <span className="animate-pulse">Adding...</span>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            Add
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Discount Message */}
                  {recommendation.discountMessage && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-emerald-400">
                      <Gift className="w-3 h-3" />
                      {recommendation.discountMessage}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-white/50">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No additional recommendations at this time</p>
        </div>
      )}

      {/* No Accommodation Upsell (special case) */}
      {trigger === 'no_accommodation' && searchResults.length > 0 && (
        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
          <div className="flex items-center gap-2 mb-4">
            <Building className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-medium text-white">Available Properties</h3>
          </div>
          <div className="space-y-3">
            {searchResults.slice(0, 3).map((property) => (
              <button
                key={property.id}
                onClick={() => setCurrentStep('results')}
                className="w-full flex items-center gap-4 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all text-left"
              >
                <div className="w-16 h-16 relative rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={property.images[0]}
                    alt={property.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{property.name}</p>
                  <p className="text-xs text-white/50">{property.location}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1 text-amber-400">
                      <Star className="w-3 h-3 fill-current" />
                      <span className="text-xs">{property.rating}</span>
                    </div>
                    <span className="text-xs text-white/40">|</span>
                    <span className="text-xs text-white/40">{property.distanceToLift} to lift</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-white/30" />
              </button>
            ))}
          </div>
          <button
            onClick={() => setCurrentStep('results')}
            className="w-full mt-3 py-2 text-sm text-amber-400 hover:text-amber-300"
          >
            View All Properties
          </button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
        <button
          onClick={handleSkipAll}
          className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl transition-colors"
        >
          {selectedServices.size > 0 ? 'Continue Without More' : 'Skip Recommendations'}
        </button>
        <button
          onClick={handleContinue}
          className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {selectedServices.size > 0 ? (
            <>
              Continue with {selectedServices.size} Added
              <ArrowRight className="w-4 h-4" />
            </>
          ) : (
            <>
              Browse All Services
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Selection Summary */}
      {selectedServices.size > 0 && (
        <div className="text-center text-sm text-white/50">
          {selectedServices.size} service{selectedServices.size !== 1 ? 's' : ''} added to your cart
        </div>
      )}
    </div>
  );
}

// Accommodation Upsell Component (for products-first flow)
interface AccommodationUpsellProps {
  onSelectProperty: (property: Property) => void;
  onSkip: () => void;
}

export function AccommodationUpsell({ onSelectProperty, onSkip }: AccommodationUpsellProps) {
  const { searchResults, searchParams, cartServices } = useBookingStore();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Get the date range from services
  const serviceDates = cartServices.map((s) => s.date).filter(Boolean);
  const dateRange =
    serviceDates.length > 0
      ? `${serviceDates[0]}${serviceDates.length > 1 ? ` to ${serviceDates[serviceDates.length - 1]}` : ''}`
      : `${searchParams.checkIn} to ${searchParams.checkOut}`;

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-full mb-4">
          <Building className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-blue-400 font-medium">Accommodation Suggestion</span>
        </div>
        <h2 className="text-2xl font-light text-white mb-2">Need a Place to Stay?</h2>
        <p className="text-white/60">
          We noticed you have services booked for <span className="text-amber-400">{dateRange}</span>.
          <br />
          Here are properties available near the slopes:
        </p>
      </div>

      {/* Properties */}
      <div className="space-y-3 mb-6">
        {searchResults.slice(0, 3).map((property) => (
          <button
            key={property.id}
            onClick={() => onSelectProperty(property)}
            className="w-full flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-500/30 rounded-xl transition-all text-left"
          >
            <div className="w-20 h-20 relative rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={property.images[0]}
                alt={property.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-white">{property.name}</p>
                  <p className="text-xs text-white/50">{property.location}</p>
                </div>
                <div className="flex items-center gap-1 text-amber-400">
                  <Star className="w-3 h-3 fill-current" />
                  <span className="text-xs font-medium">{property.rating}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs text-white/40">{property.distanceToLift} to lift</span>
                <span className="text-xs text-white/40">|</span>
                <span className="text-xs text-white/40">{property.propertyType}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {property.amenities.slice(0, 3).map((amenity) => (
                  <span
                    key={amenity}
                    className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-xs text-white/50"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-white/30 flex-shrink-0" />
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={onSkip}
          className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl transition-colors"
        >
          Continue Without Accommodation
        </button>
        <button
          onClick={() => searchResults[0] && onSelectProperty(searchResults[0])}
          className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <Building className="w-4 h-4" />
          View All Properties
        </button>
      </div>
    </div>
  );
}

export default UpsellGate;
