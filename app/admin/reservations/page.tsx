'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  CalendarCheck, Users, Clock, ChevronRight, LogOut,
  DollarSign, Building2, Mail, Phone, AlertCircle,
  CheckCircle, Calendar, CreditCard, ArrowUpRight
} from 'lucide-react';
import VoiceSessionChat from '../../components/VoiceSessionChat';
import { useAuth } from '../../hooks/useAuth';
import { useLanguageStore } from '@/lib/use-language-store';

interface Reservation {
  id: string;
  guestId?: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  propertyId: string;
  checkIn: string;
  checkOut: string;
  status: 'pending' | 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled';
  createdAt: string;
  totalAmount: number;
  currency: string;
  paymentStatus: 'pending' | 'deposit-paid' | 'paid';
  source: string;
  guestCount?: number;
  notes?: string;
}

interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface Property {
  id: string;
  name: string;
  type: string;
}

export default function ReservationsPage() {
  const { isAuthenticated, logout } = useAuth();
  const { language } = useLanguageStore();
  const [mounted, setMounted] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [guests, setGuests] = useState<Map<string, Guest>>(new Map());
  const [properties, setProperties] = useState<Map<string, Property>>(new Map());
  const [loading, setLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'pending' | 'checked-in'>('upcoming');

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
      const [resRes, guestsRes, propertiesRes] = await Promise.all([
        fetch('/api/reservations'),
        fetch('/api/guests'),
        fetch('/api/properties')
      ]);

      const reservationsData: Reservation[] = await resRes.json();
      const guestsData: Guest[] = await guestsRes.json();
      const propertiesData: Property[] = await propertiesRes.json();

      // Create lookup maps
      const guestsMap = new Map<string, Guest>();
      guestsData.forEach(g => guestsMap.set(g.id, g));

      const propertiesMap = new Map<string, Property>();
      propertiesData.forEach(p => propertiesMap.set(p.id, p));

      // Sort by check-in date
      reservationsData.sort((a, b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime());

      setReservations(reservationsData);
      setGuests(guestsMap);
      setProperties(propertiesMap);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGuestInfo = (reservation: Reservation) => {
    if (reservation.guestId && guests.has(reservation.guestId)) {
      const guest = guests.get(reservation.guestId)!;
      return { name: guest.name, email: guest.email, phone: guest.phone };
    }
    return {
      name: reservation.guestName || 'Unknown Guest',
      email: reservation.guestEmail || '',
      phone: reservation.guestPhone || ''
    };
  };

  const getPropertyName = (propertyId: string) => {
    return properties.get(propertyId)?.name || propertyId;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency }).format(amount);
  };

  const getNights = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  // Filter reservations
  const today = new Date().toISOString().split('T')[0];
  const filteredReservations = reservations.filter(r => {
    switch (filter) {
      case 'upcoming':
        return r.checkIn >= today && r.status !== 'checked-out' && r.status !== 'cancelled';
      case 'pending':
        return r.status === 'pending' || r.paymentStatus === 'pending';
      case 'checked-in':
        return r.status === 'checked-in';
      default:
        return true;
    }
  });

  // Stats
  const upcomingCount = reservations.filter(r => r.checkIn >= today && r.status !== 'checked-out' && r.status !== 'cancelled').length;
  const checkedInCount = reservations.filter(r => r.status === 'checked-in').length;
  const pendingCount = reservations.filter(r => r.status === 'pending' || r.paymentStatus === 'pending').length;
  const totalRevenue = reservations.filter(r => r.status !== 'cancelled').reduce((sum, r) => sum + r.totalAmount, 0);

  const getStatusColor = (status: Reservation['status']) => {
    switch (status) {
      case 'checked-in': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'confirmed': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'pending': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'checked-out': return 'bg-stone-500/20 text-stone-400 border-stone-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
    }
  };

  const getPaymentColor = (status: Reservation['paymentStatus']) => {
    switch (status) {
      case 'paid': return 'text-emerald-400';
      case 'deposit-paid': return 'text-blue-400';
      case 'pending': return 'text-amber-400';
    }
  };

  const contextData = {
    reservations: filteredReservations.map(r => ({
      id: r.id,
      guest: getGuestInfo(r).name,
      property: getPropertyName(r.propertyId),
      checkIn: r.checkIn,
      checkOut: r.checkOut,
      status: r.status,
      paymentStatus: r.paymentStatus,
      amount: formatCurrency(r.totalAmount, r.currency)
    })),
    stats: {
      upcoming: upcomingCount,
      checkedIn: checkedInCount,
      pending: pendingCount,
      totalRevenue: formatCurrency(totalRevenue, 'JPY')
    }
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

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-stone-900/60" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

      {/* Content */}
      <div className={`relative z-10 h-screen flex flex-col transition-opacity duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}>

        {/* Top Navigation */}
        <nav className="flex items-center justify-between px-8 py-4 flex-shrink-0">
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
            <Link href="/admin" className="text-white/50 hover:text-white transition-colors">
              Staff Portal
            </Link>
            <ChevronRight className="w-4 h-4 text-white/30" />
            <span className="text-white/80">Reservations</span>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex gap-6 px-8 pb-6 min-h-0">
          {/* Left: Reservations List */}
          <div className="flex-1 min-w-0 flex flex-col">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl flex-1 flex flex-col min-h-0 overflow-hidden">
              {/* Header */}
              <div className="p-6 flex-shrink-0 border-b border-white/10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                    <CalendarCheck className="w-6 h-6 text-white/60" />
                  </div>
                  <div>
                    <h2
                      className="text-3xl font-light text-white tracking-wide"
                      style={{ fontFamily: 'var(--font-cormorant)' }}
                    >
                      Reservations
                    </h2>
                    <p className="text-sm text-white/50 mt-1">Manage bookings and arrivals</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-3 mb-4">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-3.5 h-3.5 text-blue-400/60" />
                      <span className="text-xs text-white/50">Upcoming</span>
                    </div>
                    <p className="text-xl font-light text-blue-400">{upcomingCount}</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400/60" />
                      <span className="text-xs text-white/50">Checked In</span>
                    </div>
                    <p className="text-xl font-light text-emerald-400">{checkedInCount}</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400/60" />
                      <span className="text-xs text-white/50">Pending</span>
                    </div>
                    <p className="text-xl font-light text-amber-400">{pendingCount}</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-3.5 h-3.5 text-white/40" />
                      <span className="text-xs text-white/50">Revenue</span>
                    </div>
                    <p className="text-lg font-light text-white">{formatCurrency(totalRevenue, 'JPY')}</p>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2">
                  {(['all', 'upcoming', 'pending', 'checked-in'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-3 py-1.5 rounded-full text-xs transition-all border ${
                        filter === f
                          ? 'bg-white/15 text-white border-white/30'
                          : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10 hover:text-white/70'
                      }`}
                    >
                      {f === 'checked-in' ? 'Checked In' : f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scrollable List */}
              <div className="flex-1 overflow-y-auto p-4 min-h-0">
                <div className="space-y-3">
                  {filteredReservations.map((reservation) => {
                    const guestInfo = getGuestInfo(reservation);
                    const nights = getNights(reservation.checkIn, reservation.checkOut);

                    return (
                      <div
                        key={reservation.id}
                        onClick={() => setSelectedReservation(selectedReservation?.id === reservation.id ? null : reservation)}
                        className={`p-4 rounded-xl cursor-pointer transition-all border ${
                          selectedReservation?.id === reservation.id
                            ? 'bg-white/15 border-amber-400/50'
                            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-base font-medium text-white">{guestInfo.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Building2 className="w-3 h-3 text-white/40" />
                              <span className="text-xs text-white/50">{getPropertyName(reservation.propertyId)}</span>
                            </div>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(reservation.status)}`}>
                            {reservation.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-white/50 mb-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(reservation.checkIn)} - {formatDate(reservation.checkOut)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{nights} nights</span>
                          </div>
                          {reservation.guestCount && (
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              <span>{reservation.guestCount}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-3 h-3 text-white/40" />
                            <span className={`text-xs ${getPaymentColor(reservation.paymentStatus)}`}>
                              {reservation.paymentStatus}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-white">
                            {formatCurrency(reservation.totalAmount, reservation.currency)}
                          </span>
                        </div>

                        {reservation.notes && (
                          <p className="text-xs text-white/40 mt-2 italic">{reservation.notes}</p>
                        )}
                      </div>
                    );
                  })}

                  {filteredReservations.length === 0 && (
                    <div className="text-center py-12">
                      <CalendarCheck className="w-12 h-12 text-white/20 mx-auto mb-3" />
                      <p className="text-white/50">No reservations found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Details & Voice Chat */}
          <div className="w-[400px] flex-shrink-0 flex flex-col min-h-0 gap-4">
            {/* Selected Reservation Details */}
            {selectedReservation && (
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl p-5 flex-shrink-0">
                <div className="flex items-center justify-between mb-4">
                  <h3
                    className="text-xl font-light text-white"
                    style={{ fontFamily: 'var(--font-cormorant)' }}
                  >
                    Reservation Details
                  </h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(selectedReservation.status)}`}>
                    {selectedReservation.status}
                  </span>
                </div>

                {/* Guest Info */}
                <div className="mb-4">
                  <p className="text-xs text-white/40 mb-2">Guest Information</p>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <p className="text-sm font-medium text-white mb-2">
                      {getGuestInfo(selectedReservation).name}
                    </p>
                    {getGuestInfo(selectedReservation).email && (
                      <div className="flex items-center gap-2 text-xs text-white/50 mb-1">
                        <Mail className="w-3 h-3" />
                        <span>{getGuestInfo(selectedReservation).email}</span>
                      </div>
                    )}
                    {getGuestInfo(selectedReservation).phone && (
                      <div className="flex items-center gap-2 text-xs text-white/50">
                        <Phone className="w-3 h-3" />
                        <span>{getGuestInfo(selectedReservation).phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Contact Actions */}
                  <div className="flex gap-2 mt-2">
                    {getGuestInfo(selectedReservation).phone && (
                      <a
                        href={`tel:${getGuestInfo(selectedReservation).phone}`}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-white/70 hover:text-white transition-colors border border-white/10"
                      >
                        <Phone className="w-3 h-3" />
                        Call
                      </a>
                    )}
                    {getGuestInfo(selectedReservation).email && (
                      <a
                        href={`mailto:${getGuestInfo(selectedReservation).email}`}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-white/70 hover:text-white transition-colors border border-white/10"
                      >
                        <Mail className="w-3 h-3" />
                        Email
                      </a>
                    )}
                  </div>
                </div>

                {/* Booking Info */}
                <div className="mb-4">
                  <p className="text-xs text-white/40 mb-2">Booking Details</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                      <p className="text-white/40">Property</p>
                      <p className="text-white">{getPropertyName(selectedReservation.propertyId)}</p>
                    </div>
                    <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                      <p className="text-white/40">Source</p>
                      <p className="text-white capitalize">{selectedReservation.source}</p>
                    </div>
                    <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                      <p className="text-white/40">Check-in</p>
                      <p className="text-white">{selectedReservation.checkIn}</p>
                    </div>
                    <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                      <p className="text-white/40">Check-out</p>
                      <p className="text-white">{selectedReservation.checkOut}</p>
                    </div>
                  </div>
                </div>

                {/* Payment */}
                <div>
                  <p className="text-xs text-white/40 mb-2">Payment</p>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                    <div>
                      <p className={`text-xs ${getPaymentColor(selectedReservation.paymentStatus)}`}>
                        {selectedReservation.paymentStatus}
                      </p>
                      <p className="text-lg font-medium text-white mt-1">
                        {formatCurrency(selectedReservation.totalAmount, selectedReservation.currency)}
                      </p>
                    </div>
                    {selectedReservation.guestId && (
                      <Link
                        href={`/guest/${selectedReservation.guestId}`}
                        className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 transition-colors"
                      >
                        View Portal
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Voice Chat */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl flex-1 overflow-hidden">
              <VoiceSessionChat
                agentId="reservations"
                sessionId="reservations-management"
                elevenLabsAgentId={process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID}
                title="Reservations Assistant"
                subtitle="AI Concierge"
                avatar="/avatars/operations-avatar.jpg"
                welcomeMessage="I can help you manage reservations, check upcoming arrivals, and handle booking inquiries. What would you like to know?"
                suggestions={[
                  "Show upcoming arrivals",
                  "Any pending payments?",
                  "Who's checking in tomorrow?"
                ]}
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
