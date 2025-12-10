'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Building2, Users, User, Phone, Mail, ChevronRight, LogOut, MapPin, Bed, Bath, Sparkles, ArrowUpRight, Calendar, PawPrint } from 'lucide-react';
import VoiceSessionChat from '../../components/VoiceSessionChat';
import { useAuth } from '../../hooks/useAuth';
import { useLanguageStore } from '@/lib/use-language-store';

// Property types
interface Staff {
  id: string;
  name: string;
  role: string;
  avatar: string;
  phone: string;
  email: string;
}

interface PropertyGuest {
  id: string;
  name: string;
  checkIn: string;
  checkOut: string;
  guestCount: number;
  status: 'vip' | 'standard';
}

interface PropertyAPI {
  id: string;
  name: string;
  type: string;
  location: string;
  image: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  amenities: string[];
  status: 'occupied' | 'available' | 'maintenance';
  guest: PropertyGuest | null;
  staffId: string;
}

interface Property extends Omit<PropertyAPI, 'staffId'> {
  staff: Staff;
}

interface StaffAPI {
  id: string;
  name: string;
  role: string;
  department: string;
  avatar: string;
  phone: string;
  email: string;
  status: string;
  rating: number;
  hireDate: string;
  shifts: Array<{
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    type: string;
    location?: string;
  }>;
}

interface GuestAPI {
  id: string;
  name: string;
  email: string;
  phone: string;
  confirmationCode: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guestCount: number;
  status: 'vip' | 'standard';
  propertyId: string;
  specialRequests: Array<{ type: string; time?: string; status: string }>;
  pets: { name: string; type: string } | null;
  preferences: {
    dietary: string[];
    room: string[];
  };
}

type ViewMode = 'properties' | 'guests';

export default function PropertiesPage() {
  const { isAuthenticated, logout } = useAuth();
  const { language } = useLanguageStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [propertiesData, setPropertiesData] = useState<Property[]>([]);
  const [guestsData, setGuestsData] = useState<GuestAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedGuest, setSelectedGuest] = useState<GuestAPI | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('properties');

  // Navigation menu items
  const menuItems = [
    { label: 'Register', href: '/register' },
    { label: 'Staff Portal', href: '/admin', active: true },
    { label: 'Shop', href: '/shop' },
  ];

  useEffect(() => {
    if (isAuthenticated) {
      setMounted(true);
      fetchData();
    }
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [propertiesRes, staffRes, guestsRes] = await Promise.all([
        fetch('/api/properties'),
        fetch('/api/staff'),
        fetch('/api/guests')
      ]);

      const propertiesAPI: PropertyAPI[] = await propertiesRes.json();
      const staffAPI: StaffAPI[] = await staffRes.json();
      const guests: GuestAPI[] = await guestsRes.json();

      // Create staff lookup map
      const staffMap = new Map<string, StaffAPI>();
      staffAPI.forEach(s => staffMap.set(s.id, s));

      // Merge properties with staff data
      const mergedProperties: Property[] = propertiesAPI.map(p => {
        const staffMember = staffMap.get(p.staffId);
        return {
          id: p.id,
          name: p.name,
          type: p.type,
          location: p.location,
          image: p.image,
          bedrooms: p.bedrooms,
          bathrooms: p.bathrooms,
          maxGuests: p.maxGuests,
          amenities: p.amenities,
          status: p.status,
          guest: p.guest,
          staff: staffMember ? {
            id: staffMember.id,
            name: staffMember.name,
            role: staffMember.role,
            avatar: staffMember.avatar,
            phone: staffMember.phone,
            email: staffMember.email
          } : {
            id: 'unknown',
            name: 'Unassigned',
            role: 'N/A',
            avatar: '/avatars/default.jpg',
            phone: '',
            email: ''
          }
        };
      });

      setPropertiesData(mergedProperties);
      setGuestsData(guests);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get property name for guest
  const getPropertyName = (propertyId: string) => {
    const property = propertiesData.find(p => p.id === propertyId);
    return property?.name || propertyId;
  };

  // Stats
  const occupiedCount = propertiesData.filter(p => p.status === 'occupied').length;
  const availableCount = propertiesData.filter(p => p.status === 'available').length;
  const totalGuests = propertiesData.reduce((sum, p) => sum + (p.guest?.guestCount || 0), 0);
  const vipCount = guestsData.filter(g => g.status === 'vip').length;

  // Context data for voice agent
  const contextData = {
    properties: propertiesData.map(p => ({
      id: p.id,
      name: p.name,
      type: p.type,
      status: p.status,
      guest: p.guest ? { name: p.guest.name, checkOut: p.guest.checkOut } : null,
      staff: p.staff.name
    })),
    guests: guestsData.map(g => ({
      id: g.id,
      name: g.name,
      property: getPropertyName(g.propertyId),
      checkIn: g.checkIn,
      checkOut: g.checkOut,
      status: g.status
    })),
    stats: {
      total: propertiesData.length,
      occupied: occupiedCount,
      available: availableCount,
      totalGuests,
      vipGuests: vipCount
    }
  };

  const handlePropertyClick = (property: Property) => {
    if (property.guest) {
      // Navigate to guest portal
      router.push(`/guest/${property.guest.id}`);
    } else {
      // Toggle selection for available properties
      setSelectedProperty(selectedProperty?.id === property.id ? null : property);
    }
  };

  const handleGuestClick = (guest: GuestAPI) => {
    router.push(`/guest/${guest.id}`);
  };

  if (isAuthenticated === null || loading) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center">
        <div className="text-white/50 text-sm">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (propertiesData.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center">
        <div className="text-white/50 text-sm">No properties found</div>
      </div>
    );
  }

  const getStatusColor = (status: Property['status']) => {
    switch (status) {
      case 'occupied': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'available': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'maintenance': return 'bg-red-500/20 text-red-400 border-red-500/30';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="h-screen relative overflow-hidden">
      {/* Full Page Background */}
      <Image
        src="/hotel3.jpg"
        alt="The 1898 Niseko"
        fill
        className="object-cover"
        priority
      />

      {/* Sophisticated Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-stone-900/60" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

      {/* Content */}
      <div className={`relative z-10 h-screen flex flex-col transition-opacity duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}>

        {/* Top Navigation Bar */}
        <nav className="flex items-center justify-between px-8 py-4 flex-shrink-0">
          {/* Left - Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm" style={{ fontFamily: 'var(--font-cormorant)' }}>18</span>
            </div>
            <div>
              <h1
                className="text-xl font-light text-white tracking-wide leading-tight group-hover:text-amber-200 transition-colors"
                style={{ fontFamily: 'var(--font-cormorant)' }}
              >
                THE 1898
              </h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">Niseko</p>
            </div>
          </Link>

          {/* Center - Menu Items */}
          <div className="flex items-center gap-1 bg-white/5 backdrop-blur-md rounded-full px-2 py-1.5 border border-white/10">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`px-4 py-2 rounded-full text-sm transition-all ${
                  item.active
                    ? 'bg-white/15 text-white font-medium'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right - Logout */}
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all"
          >
            <span className="text-sm">Logout</span>
            <LogOut className="w-4 h-4" />
          </button>
        </nav>

        {/* Breadcrumbs */}
        <div className="px-8 pb-3 flex-shrink-0">
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/admin"
              className="text-white/50 hover:text-white transition-colors"
            >
              Staff Portal
            </Link>
            <ChevronRight className="w-4 h-4 text-white/30" />
            <span className="text-white/80">{viewMode === 'properties' ? 'Properties' : 'Guests'}</span>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex gap-6 px-8 pb-6 min-h-0">
          {/* Left: Properties/Guests Grid */}
          <div className="flex-1 min-w-0 flex flex-col">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl flex-1 flex flex-col min-h-0 overflow-hidden">
              {/* Header */}
              <div className="p-6 flex-shrink-0 border-b border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                      {viewMode === 'properties' ? (
                        <Building2 className="w-6 h-6 text-white/60" />
                      ) : (
                        <Users className="w-6 h-6 text-white/60" />
                      )}
                    </div>
                    <div>
                      <h2
                        className="text-3xl font-light text-white tracking-wide"
                        style={{ fontFamily: 'var(--font-cormorant)' }}
                      >
                        {viewMode === 'properties' ? 'Properties' : 'Guests'}
                      </h2>
                      <p className="text-sm text-white/50 mt-1">
                        {viewMode === 'properties'
                          ? 'Manage suites and guest assignments'
                          : 'Current guests and their stays'}
                      </p>
                    </div>
                  </div>

                  {/* View Mode Toggle */}
                  <div className="flex items-center gap-1 bg-white/5 rounded-full p-1 border border-white/10">
                    <button
                      onClick={() => { setViewMode('properties'); setSelectedGuest(null); }}
                      className={`px-4 py-2 rounded-full text-sm transition-all flex items-center gap-2 ${
                        viewMode === 'properties'
                          ? 'bg-white/15 text-white'
                          : 'text-white/50 hover:text-white/70'
                      }`}
                    >
                      <Building2 className="w-4 h-4" />
                      Properties
                    </button>
                    <button
                      onClick={() => { setViewMode('guests'); setSelectedProperty(null); }}
                      className={`px-4 py-2 rounded-full text-sm transition-all flex items-center gap-2 ${
                        viewMode === 'guests'
                          ? 'bg-white/15 text-white'
                          : 'text-white/50 hover:text-white/70'
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      Guests
                    </button>
                  </div>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-4 gap-3">
                  {viewMode === 'properties' ? (
                    <>
                      <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex items-center gap-2 mb-1">
                          <Building2 className="w-3.5 h-3.5 text-white/40" />
                          <span className="text-xs text-white/50">Total</span>
                        </div>
                        <p className="text-xl font-light text-white">{propertiesData.length}</p>
                      </div>
                      <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex items-center gap-2 mb-1">
                          <Users className="w-3.5 h-3.5 text-emerald-400/60" />
                          <span className="text-xs text-white/50">Occupied</span>
                        </div>
                        <p className="text-xl font-light text-emerald-400">{occupiedCount}</p>
                      </div>
                      <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex items-center gap-2 mb-1">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400/60" />
                          <span className="text-xs text-white/50">Available</span>
                        </div>
                        <p className="text-xl font-light text-amber-400">{availableCount}</p>
                      </div>
                      <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-3.5 h-3.5 text-white/40" />
                          <span className="text-xs text-white/50">Guests</span>
                        </div>
                        <p className="text-xl font-light text-white">{totalGuests}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex items-center gap-2 mb-1">
                          <Users className="w-3.5 h-3.5 text-white/40" />
                          <span className="text-xs text-white/50">Total Guests</span>
                        </div>
                        <p className="text-xl font-light text-white">{guestsData.length}</p>
                      </div>
                      <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex items-center gap-2 mb-1">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400/60" />
                          <span className="text-xs text-white/50">VIP</span>
                        </div>
                        <p className="text-xl font-light text-amber-400">{vipCount}</p>
                      </div>
                      <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-3.5 h-3.5 text-white/40" />
                          <span className="text-xs text-white/50">Standard</span>
                        </div>
                        <p className="text-xl font-light text-white">{guestsData.length - vipCount}</p>
                      </div>
                      <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex items-center gap-2 mb-1">
                          <PawPrint className="w-3.5 h-3.5 text-white/40" />
                          <span className="text-xs text-white/50">With Pets</span>
                        </div>
                        <p className="text-xl font-light text-white">{guestsData.filter(g => g.pets).length}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Scrollable Grid */}
              <div className="flex-1 overflow-y-auto p-4 min-h-0">
                {viewMode === 'properties' ? (
                  /* Properties Grid */
                  <div className="grid grid-cols-2 gap-4">
                    {propertiesData.map((property) => (
                      <div
                        key={property.id}
                        onClick={() => handlePropertyClick(property)}
                        className={`p-4 rounded-xl cursor-pointer transition-all border group ${
                          property.guest
                            ? 'bg-white/5 border-white/10 hover:bg-emerald-500/10 hover:border-emerald-400/30'
                            : selectedProperty?.id === property.id
                              ? 'bg-white/15 border-amber-400/50'
                              : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                        }`}
                      >
                        {/* Property Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-base font-medium text-white">{property.name}</h3>
                            <p className="text-xs text-white/50">{property.type}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {property.guest && (
                              <ArrowUpRight className="w-4 h-4 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(property.status)}`}>
                              {property.status}
                            </span>
                          </div>
                        </div>

                        {/* Property Details */}
                        <div className="flex items-center gap-3 text-xs text-white/40 mb-3">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>{property.location}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-white/50 mb-3">
                          <div className="flex items-center gap-1">
                            <Bed className="w-3 h-3" />
                            <span>{property.bedrooms} bed</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Bath className="w-3 h-3" />
                            <span>{property.bathrooms} bath</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>Max {property.maxGuests}</span>
                          </div>
                        </div>

                        {/* Amenities */}
                        <div className="flex flex-wrap gap-1 mb-3">
                          {property.amenities.slice(0, 3).map((amenity) => (
                            <span
                              key={amenity}
                              className="text-[10px] px-2 py-0.5 bg-white/5 rounded-full text-white/50 border border-white/10"
                            >
                              {amenity}
                            </span>
                          ))}
                        </div>

                        {/* Guest Info */}
                        {property.guest ? (
                          <div className="p-2.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20 mb-3 group-hover:bg-emerald-500/15 transition-colors">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-white flex items-center gap-1.5">
                                {property.guest.name}
                                {property.guest.status === 'vip' && (
                                  <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded border border-amber-500/30">VIP</span>
                                )}
                              </span>
                              <span className="text-[10px] text-white/40">{property.guest.guestCount} guests</span>
                            </div>
                            <p className="text-[10px] text-white/40">
                              {property.guest.checkIn} - {property.guest.checkOut}
                            </p>
                            <p className="text-[10px] text-emerald-400/70 mt-1 group-hover:text-emerald-400 transition-colors">
                              Click to view guest portal →
                            </p>
                          </div>
                        ) : (
                          <div className="p-2.5 bg-amber-500/5 rounded-lg border border-amber-500/10 mb-3">
                            <p className="text-xs text-amber-400/70 text-center">Available for booking</p>
                          </div>
                        )}

                        {/* Assigned Staff */}
                        <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                          <div className="relative w-7 h-7 rounded-full overflow-hidden bg-white/10 flex-shrink-0">
                            <Image
                              src={property.staff.avatar}
                              alt={property.staff.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-white truncate">{property.staff.name}</p>
                            <p className="text-[10px] text-white/40 truncate">{property.staff.role}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Guests Grid */
                  <div className="grid grid-cols-2 gap-4">
                    {guestsData.map((guest) => (
                      <div
                        key={guest.id}
                        onClick={() => handleGuestClick(guest)}
                        className="p-4 rounded-xl cursor-pointer transition-all border group bg-white/5 border-white/10 hover:bg-emerald-500/10 hover:border-emerald-400/30"
                      >
                        {/* Guest Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-base font-medium text-white flex items-center gap-2">
                              {guest.name}
                              {guest.status === 'vip' && (
                                <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded border border-amber-500/30">VIP</span>
                              )}
                            </h3>
                            <p className="text-xs text-white/50">{getPropertyName(guest.propertyId)}</p>
                          </div>
                          <ArrowUpRight className="w-4 h-4 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>

                        {/* Stay Details */}
                        <div className="flex items-center gap-4 text-xs text-white/50 mb-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(guest.checkIn)} - {formatDate(guest.checkOut)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>{guest.guestCount}</span>
                          </div>
                        </div>

                        {/* Confirmation */}
                        <div className="text-xs text-white/40 mb-3">
                          <span className="font-mono">{guest.confirmationCode}</span>
                        </div>

                        {/* Pet & Preferences */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {guest.pets && (
                            <span className="text-[10px] px-2 py-0.5 bg-white/10 rounded-full text-white/60 border border-white/10 flex items-center gap-1">
                              <PawPrint className="w-3 h-3" />
                              {guest.pets.name}
                            </span>
                          )}
                          {guest.preferences.dietary.slice(0, 2).map((pref) => (
                            <span
                              key={pref}
                              className="text-[10px] px-2 py-0.5 bg-white/5 rounded-full text-white/50 border border-white/10"
                            >
                              {pref}
                            </span>
                          ))}
                        </div>

                        {/* Special Requests */}
                        {guest.specialRequests.length > 0 && (
                          <div className="text-[10px] text-white/40">
                            {guest.specialRequests.length} special request{guest.specialRequests.length > 1 ? 's' : ''}
                          </div>
                        )}

                        {/* View Portal Link */}
                        <div className="mt-3 pt-2 border-t border-white/10">
                          <p className="text-[10px] text-emerald-400/70 group-hover:text-emerald-400 transition-colors">
                            Click to view guest portal →
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Voice Chat / Details */}
          <div className="w-[400px] flex-shrink-0 flex flex-col min-h-0 gap-4">
            {/* Selected Property Details (only show for available properties) */}
            {selectedProperty && !selectedProperty.guest && (
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl p-5 flex-shrink-0">
                <div className="flex items-center justify-between mb-4">
                  <h3
                    className="text-xl font-light text-white"
                    style={{ fontFamily: 'var(--font-cormorant)' }}
                  >
                    {selectedProperty.name}
                  </h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(selectedProperty.status)}`}>
                    {selectedProperty.status}
                  </span>
                </div>

                {/* Staff Contact */}
                <div className="mb-4">
                  <p className="text-xs text-white/40 mb-2">Assigned Staff</p>
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white/10 flex-shrink-0">
                      <Image
                        src={selectedProperty.staff.avatar}
                        alt={selectedProperty.staff.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{selectedProperty.staff.name}</p>
                      <p className="text-xs text-white/50">{selectedProperty.staff.role}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <a
                      href={`tel:${selectedProperty.staff.phone}`}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-white/70 hover:text-white transition-colors border border-white/10"
                    >
                      <Phone className="w-3 h-3" />
                      Call
                    </a>
                    <a
                      href={`mailto:${selectedProperty.staff.email}`}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-white/70 hover:text-white transition-colors border border-white/10"
                    >
                      <Mail className="w-3 h-3" />
                      Email
                    </a>
                  </div>
                </div>

                {/* Amenities List */}
                <div>
                  <p className="text-xs text-white/40 mb-2">Amenities</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedProperty.amenities.map((amenity) => (
                      <span
                        key={amenity}
                        className="text-xs px-2 py-1 bg-white/5 rounded-lg text-white/60 border border-white/10"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Voice Chat */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl flex-1 overflow-hidden">
              <VoiceSessionChat
                agentId="properties"
                sessionId="properties-management"
                elevenLabsAgentId={process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID}
                title="Properties Assistant"
                subtitle="AI Concierge"
                avatar="/avatars/operations-avatar.jpg"
                welcomeMessage="I can help you manage properties, check guest assignments, and coordinate with staff. Ask me about any suite or availability."
                suggestions={
                  viewMode === 'properties'
                    ? ["Which suites are available?", "Who is in the Sky Suite?", "Show me VIP guests"]
                    : ["List all VIP guests", "Any special requests?", "Guests checking out today"]
                }
                contextData={contextData}
                variant="dark"
                language={language}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
