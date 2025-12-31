'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Users,
  UserCheck,
  UserMinus,
  BedDouble,
  Bell,
  Clock,
  Search,
  RefreshCw,
  LogOut,
  ChevronRight,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Star,
  Phone,
  Mail,
  CreditCard,
  X,
  Sparkles,
  Calendar,
  Home,
  Wrench,
  UtensilsCrossed,
  MessageSquare,
  ClipboardList,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Heart,
  Wine,
  Coffee,
  Mountain,
  Snowflake,
  Zap,
  Plane,
  ArrowUp,
  Crown,
  Car,
  Briefcase,
  Bus,
  Flower2,
  Gift,
  Check,
  Edit3,
  Eye,
  Maximize2,
  DoorOpen,
  Clock3,
  TrendingUp,
  PanelRightClose,
  PanelRightOpen,
  Mic,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import VoiceSessionChat from '../components/VoiceSessionChat';
import Tooltip, { HotelTerms } from '../components/Tooltip';
import { useFrontOfficeStore, Reservation, GuestRequest, UpsellOffer, Guest, RoomInfo, RoomUpgradeOption, GuestBilling, PaymentMethod, ChargeCategory } from '../store/frontOfficeStore';

export default function FrontOfficeDashboard() {
  const { isAuthenticated, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'arrivals' | 'departures' | 'inhouse'>('arrivals');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [aiPanelVisible, setAiPanelVisible] = useState(true); // AI assistant visible by default

  // Check-in modal state
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  const [checkInReservation, setCheckInReservation] = useState<Reservation | null>(null);
  const [editedGuest, setEditedGuest] = useState<Partial<Guest>>({});
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [selectedUpsells, setSelectedUpsells] = useState<string[]>([]);
  const [roomSelectionTab, setRoomSelectionTab] = useState<'available' | 'coming_soon' | 'upgrades'>('available');

  // Checkout modal state
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [checkoutReservation, setCheckoutReservation] = useState<Reservation | null>(null);
  const [checkoutBilling, setCheckoutBilling] = useState<GuestBilling | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('credit_card');
  const [cardNumber, setCardNumber] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);

  const {
    currentDate,
    currentShift,
    todayArrivals,
    todayDepartures,
    inHouseGuests,
    rooms,
    roomStatusSummary,
    guestRequests,
    staffAlerts,
    occupancyMetrics,
    todayRevenue,
    adr,
    upsellOffers,
    checkInGuest,
    checkInGuestWithDetails,
    checkOutGuest,
    checkOutGuestWithPayment,
    updateRequestStatus,
    acknowledgeAlert,
    getAvailableRooms,
    getRoomsBecomingReady,
    getRoomUpgradeOptions,
    getRecommendedUpsells,
    getGuestBilling,
    refreshData,
  } = useFrontOfficeStore();

  const menuItems = [
    { label: 'Operations', href: '/operations' },
    { label: 'Front Office', href: '/front-office', active: true },
    { label: 'Revenue BI', href: '/revenue-intelligence' },
    { label: 'Employees', href: '/employee-management' },
    { label: 'Marketplace', href: '/marketplace' },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatCurrency = (value: number) => `¥${value.toLocaleString()}`;
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };
  const formatTimeAgo = (isoString: string) => {
    const diff = Date.now() - new Date(isoString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  // Open checkout modal with billing summary
  const handleOpenCheckout = (reservation: Reservation) => {
    const billing = getGuestBilling(reservation.id);
    setCheckoutReservation(reservation);
    setCheckoutBilling(billing || null);
    setSelectedPaymentMethod('credit_card');
    setCardNumber('');
    setProcessingPayment(false);
    setCheckoutModalOpen(true);
  };

  // Process checkout with payment
  const handleProcessCheckout = () => {
    if (!checkoutReservation || !checkoutBilling) return;

    setProcessingPayment(true);

    // Simulate payment processing
    setTimeout(() => {
      const paymentDetails = selectedPaymentMethod === 'credit_card' || selectedPaymentMethod === 'debit_card'
        ? { cardLast4: cardNumber.slice(-4) || '****', cardBrand: 'Visa' }
        : undefined;

      checkOutGuestWithPayment(checkoutReservation.id, selectedPaymentMethod, paymentDetails);
      setProcessingPayment(false);
      setCheckoutModalOpen(false);
      setCheckoutReservation(null);
      setCheckoutBilling(null);
      setSelectedReservation(null);
    }, 1500);
  };

  // Get category icon for billing
  const getCategoryIcon = (category: ChargeCategory) => {
    const icons: Record<ChargeCategory, string> = {
      room: '🛏️',
      minibar: '🍾',
      restaurant: '🍽️',
      spa: '💆',
      room_service: '🛎️',
      laundry: '👔',
      phone: '📞',
      parking: '🅿️',
      upgrade: '⬆️',
      other: '📋',
      tax: '📄',
      service_fee: '💁',
    };
    return icons[category] || '📋';
  };

  // Group charges by category for summary
  const groupChargesByCategory = (charges: GuestBilling['charges']) => {
    const groups: Record<string, { category: ChargeCategory; items: typeof charges; total: number }> = {};
    charges.forEach(charge => {
      if (!groups[charge.category]) {
        groups[charge.category] = { category: charge.category, items: [], total: 0 };
      }
      groups[charge.category].items.push(charge);
      groups[charge.category].total += charge.amount;
    });
    return Object.values(groups);
  };

  // Filter arrivals/departures based on search
  const filteredArrivals = todayArrivals.filter(r =>
    searchQuery === '' ||
    r.guest.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.guest.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.confirmationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.roomNumber.includes(searchQuery)
  );

  const filteredDepartures = todayDepartures.filter(r =>
    searchQuery === '' ||
    r.guest.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.guest.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.confirmationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.roomNumber.includes(searchQuery)
  );

  // Pending requests count
  const pendingRequests = guestRequests.filter(r => r.status === 'pending' || r.status === 'in_progress').length;
  const urgentRequests = guestRequests.filter(r => r.priority === 'urgent' && r.status !== 'completed').length;

  // VIP arrivals
  const vipArrivals = todayArrivals.filter(r => r.guest.vipStatus !== 'none');

  // Unacknowledged alerts
  const activeAlerts = staffAlerts.filter(a => !a.acknowledged);

  const getVipBadgeColor = (status: string) => {
    switch (status) {
      case 'platinum': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'gold': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'silver': return 'bg-slate-400/20 text-slate-300 border-slate-400/30';
      default: return '';
    }
  };

  const getRequestTypeIcon = (type: GuestRequest['type']) => {
    switch (type) {
      case 'housekeeping': return <BedDouble className="w-3.5 h-3.5" />;
      case 'maintenance': return <Wrench className="w-3.5 h-3.5" />;
      case 'food_beverage': return <UtensilsCrossed className="w-3.5 h-3.5" />;
      case 'concierge': return <Star className="w-3.5 h-3.5" />;
      case 'complaint': return <MessageSquare className="w-3.5 h-3.5" />;
      default: return <ClipboardList className="w-3.5 h-3.5" />;
    }
  };

  const getPriorityColor = (priority: GuestRequest['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'medium': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const getUpsellIcon = (iconName: string) => {
    const icons: Record<string, JSX.Element> = {
      heart: <Heart className="w-4 h-4" />,
      sparkles: <Sparkles className="w-4 h-4" />,
      bath: <Home className="w-4 h-4" />,
      wine: <Wine className="w-4 h-4" />,
      utensils: <UtensilsCrossed className="w-4 h-4" />,
      coffee: <Coffee className="w-4 h-4" />,
      mountain: <Mountain className="w-4 h-4" />,
      snowflake: <Snowflake className="w-4 h-4" />,
      zap: <Zap className="w-4 h-4" />,
      plane: <Plane className="w-4 h-4" />,
      'arrow-up': <ArrowUp className="w-4 h-4" />,
      crown: <Crown className="w-4 h-4" />,
      star: <Star className="w-4 h-4" />,
      car: <Car className="w-4 h-4" />,
      briefcase: <Briefcase className="w-4 h-4" />,
      bus: <Bus className="w-4 h-4" />,
      flower: <Flower2 className="w-4 h-4" />,
      gift: <Gift className="w-4 h-4" />,
      clock: <Clock className="w-4 h-4" />,
    };
    return icons[iconName] || <Star className="w-4 h-4" />;
  };

  const getCategoryColor = (category: UpsellOffer['category']) => {
    switch (category) {
      case 'spa': return 'bg-pink-500/20 text-pink-300 border-pink-500/30';
      case 'dining': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'activities': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'room_upgrade': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'transport': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'amenity': return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  // Open check-in modal
  const openCheckInModal = (reservation: Reservation) => {
    setCheckInReservation(reservation);
    setEditedGuest({
      firstName: reservation.guest.firstName,
      lastName: reservation.guest.lastName,
      email: reservation.guest.email,
      phone: reservation.guest.phone,
    });
    setSelectedRoom(reservation.roomNumber);
    setSpecialRequests(reservation.specialRequests || '');
    setSelectedUpsells([]);
    setCheckInModalOpen(true);
  };

  // Handle check-in with details
  const handleCheckInWithDetails = () => {
    if (!checkInReservation) return;

    checkInGuestWithDetails(checkInReservation.id, {
      guest: editedGuest,
      roomNumber: selectedRoom,
      specialRequests,
      selectedUpsells,
    });

    setCheckInModalOpen(false);
    setCheckInReservation(null);
    setSelectedReservation(null);
  };

  // Toggle upsell selection
  const toggleUpsell = (upsellId: string) => {
    setSelectedUpsells(prev =>
      prev.includes(upsellId)
        ? prev.filter(id => id !== upsellId)
        : [...prev, upsellId]
    );
  };

  // Get recommended upsells for current check-in
  const recommendedUpsells = checkInReservation ? getRecommendedUpsells(checkInReservation) : [];

  // Get available rooms for room change
  const availableRooms = checkInReservation ? getAvailableRooms() : [];

  // Get rooms becoming ready with ETA
  const roomsBecomingReady = checkInReservation ? getRoomsBecomingReady() : [];

  // Get room upgrade options
  const upgradeOptions = checkInReservation ? getRoomUpgradeOptions(checkInReservation.roomType, checkInReservation.nights) : [];

  // Get room features display helper
  const getRoomFeatures = (room: RoomInfo) => {
    const features: string[] = [];
    features.push(`${room.sqm}m²`);
    features.push(room.bedType.replace('_', '/').replace('twin', 'Twin').replace('double', 'Double').replace('king', 'King'));
    features.push(room.view.charAt(0).toUpperCase() + room.view.slice(1) + ' view');
    if (room.hasBalcony) features.push('Balcony');
    return features;
  };

  // Calculate upsell total
  const upsellTotal = selectedUpsells.reduce((sum, id) => {
    const offer = upsellOffers.find(o => o.id === id);
    return sum + (offer?.price || 0);
  }, 0);

  if (isAuthenticated === null) {
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
      {/* Background */}
      <Image
        src="/hotel3.jpg"
        alt="The 1898 Niseko"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-emerald-900/80" />

      {/* Content */}
      <div className={`relative z-10 h-screen flex flex-col transition-opacity duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>

        {/* Top Navigation */}
        <nav className="flex items-center justify-between px-6 py-3 flex-shrink-0 border-b border-white/10 bg-black/20 backdrop-blur-xl">
          {/* Left - Breadcrumbs */}
          <div className="flex items-center gap-4">
            {/* Home Button */}
            <Link
              href="/"
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition-all group"
              title="Back to Main Menu"
            >
              <Home className="w-5 h-5 text-white/70 group-hover:text-emerald-400 transition-colors" />
            </Link>

            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm">
              <Link href="/" className="text-white/50 hover:text-white transition-colors">Home</Link>
              <ChevronRight className="w-4 h-4 text-white/30" />
              <span className="text-emerald-400 font-medium">Front Office</span>
            </div>
          </div>

          {/* Center - Menu Items */}
          <div className="flex items-center gap-1 bg-white/5 backdrop-blur-md rounded-full px-2 py-1 border border-white/10">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`px-4 py-1.5 rounded-full text-sm transition-all ${
                  item.active
                    ? 'bg-emerald-500/20 text-emerald-300 font-medium'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* AI Assistant Toggle */}
            <button
              onClick={() => setAiPanelVisible(!aiPanelVisible)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
                aiPanelVisible
                  ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
                  : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10'
              }`}
              title={aiPanelVisible ? 'Hide AI Assistant' : 'Show AI Assistant'}
            >
              {aiPanelVisible ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
              <span className="text-xs font-medium">AI</span>
            </button>

            <div className="h-6 w-px bg-white/10" />

            {/* Current Shift Badge */}
            <div className="px-3 py-1 bg-white/10 rounded-full border border-white/20">
              <span className="text-xs text-white/70 capitalize">{currentShift} Shift</span>
            </div>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search guest, room..."
                className="pl-9 pr-4 py-1.5 bg-white/10 border border-white/20 rounded-lg text-xs text-white placeholder-white/40 w-48 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            <button
              onClick={refreshData}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Refresh data"
            >
              <RefreshCw className="w-4 h-4 text-white/60" />
            </button>
            <button onClick={logout} className="p-2 hover:bg-white/10 rounded-lg">
              <LogOut className="w-4 h-4 text-white/60" />
            </button>
          </div>
        </nav>

        {/* Main Dashboard */}
        <div className="flex-1 overflow-hidden flex">

          {/* Left Panel - Main Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="max-w-[1400px] mx-auto space-y-4">

              {/* Alerts Banner */}
              {activeAlerts.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {activeAlerts.slice(0, 4).map(alert => (
                    <div
                      key={alert.id}
                      className={`flex items-center gap-3 px-4 py-2 rounded-lg border backdrop-blur-xl flex-shrink-0 ${
                        alert.priority === 'urgent'
                          ? 'bg-red-500/20 border-red-500/30'
                          : alert.priority === 'warning'
                          ? 'bg-amber-500/20 border-amber-500/30'
                          : 'bg-blue-500/20 border-blue-500/30'
                      }`}
                    >
                      {alert.priority === 'urgent' ? (
                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                      ) : alert.priority === 'warning' ? (
                        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      ) : (
                        <Info className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white">{alert.title}</p>
                        <p className="text-[10px] text-white/60 truncate">{alert.message}</p>
                      </div>
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                      >
                        <X className="w-3 h-3 text-white/50" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Stats Row */}
              <div className="grid grid-cols-7 gap-3">
                {/* Arrivals */}
                <div className="bg-emerald-500/20 backdrop-blur-xl rounded-xl border border-emerald-500/30 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-emerald-300">Arrivals Today</span>
                    <ArrowDownRight className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">{todayArrivals.length}</p>
                  <p className="text-[10px] text-white/50 mt-1">{todayArrivals.filter(a => a.status === 'checked_in').length} checked in</p>
                </div>

                {/* Departures */}
                <div className="bg-rose-500/20 backdrop-blur-xl rounded-xl border border-rose-500/30 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-rose-300">Departures Today</span>
                    <ArrowUpRight className="w-4 h-4 text-rose-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">{todayDepartures.length}</p>
                  <p className="text-[10px] text-white/50 mt-1">{todayDepartures.filter(d => d.status === 'checked_out').length} checked out</p>
                </div>

                {/* In-House */}
                <div className="bg-blue-500/20 backdrop-blur-xl rounded-xl border border-blue-500/30 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-blue-300">In-House</span>
                    <Users className="w-4 h-4 text-blue-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">{inHouseGuests.length}</p>
                  <p className="text-[10px] text-white/50 mt-1">guests</p>
                </div>

                {/* Occupancy Today */}
                <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Tooltip content={HotelTerms.OCC}>
                      <span className="text-xs text-white/50">Occupancy</span>
                    </Tooltip>
                    <BedDouble className="w-4 h-4 text-white/40" />
                  </div>
                  <p className="text-2xl font-bold text-white">{occupancyMetrics.today.percentage}%</p>
                  <p className="text-[10px] text-white/50 mt-1">{occupancyMetrics.today.rooms} / {roomStatusSummary.total} rooms</p>
                </div>

                {/* Rooms Ready */}
                <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-white/50">Vacant Ready</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">{roomStatusSummary.clean + roomStatusSummary.inspected}</p>
                  <p className="text-[10px] text-white/50 mt-1">{roomStatusSummary.dirty} need cleaning</p>
                </div>

                {/* ADR */}
                <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Tooltip content={HotelTerms.ADR}>
                      <span className="text-xs text-white/50">ADR</span>
                    </Tooltip>
                    <CreditCard className="w-4 h-4 text-white/40" />
                  </div>
                  <p className="text-xl font-bold text-white">{formatCurrency(adr)}</p>
                  <p className="text-[10px] text-white/50 mt-1">today</p>
                </div>

                {/* Requests */}
                <div className={`backdrop-blur-xl rounded-xl border p-4 ${urgentRequests > 0 ? 'bg-red-500/20 border-red-500/30' : 'bg-white/10 border-white/20'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs ${urgentRequests > 0 ? 'text-red-300' : 'text-white/50'}`}>Requests</span>
                    <Bell className={`w-4 h-4 ${urgentRequests > 0 ? 'text-red-400' : 'text-white/40'}`} />
                  </div>
                  <p className="text-2xl font-bold text-white">{pendingRequests}</p>
                  <p className={`text-[10px] mt-1 ${urgentRequests > 0 ? 'text-red-300' : 'text-white/50'}`}>
                    {urgentRequests > 0 ? `${urgentRequests} urgent` : 'pending'}
                  </p>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-12 gap-4">

                {/* Arrivals/Departures List */}
                <div className="col-span-8 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20">
                  {/* Tabs */}
                  <div className="flex border-b border-white/10">
                    <button
                      onClick={() => setActiveTab('arrivals')}
                      className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                        activeTab === 'arrivals'
                          ? 'text-emerald-300 border-b-2 border-emerald-400 bg-emerald-500/10'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <ArrowDownRight className="w-4 h-4" />
                        Arrivals ({filteredArrivals.length})
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab('departures')}
                      className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                        activeTab === 'departures'
                          ? 'text-rose-300 border-b-2 border-rose-400 bg-rose-500/10'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <ArrowUpRight className="w-4 h-4" />
                        Departures ({filteredDepartures.length})
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab('inhouse')}
                      className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                        activeTab === 'inhouse'
                          ? 'text-blue-300 border-b-2 border-blue-400 bg-blue-500/10'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Users className="w-4 h-4" />
                        In-House ({inHouseGuests.length})
                      </div>
                    </button>
                  </div>

                  {/* List */}
                  <div className="max-h-[400px] overflow-y-auto">
                    {activeTab === 'arrivals' && filteredArrivals.map(reservation => (
                      <div
                        key={reservation.id}
                        onClick={() => setSelectedReservation(reservation)}
                        className={`flex items-center gap-4 px-4 py-3 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors ${
                          selectedReservation?.id === reservation.id ? 'bg-white/10' : ''
                        }`}
                      >
                        {/* Time */}
                        <div className="w-12 text-center">
                          <p className="text-xs font-medium text-white">{reservation.arrivalTime || '--:--'}</p>
                        </div>

                        {/* Guest Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-white truncate">
                              {reservation.guest.firstName} {reservation.guest.lastName}
                            </p>
                            {reservation.guest.vipStatus !== 'none' && (
                              <span className={`px-1.5 py-0.5 text-[9px] font-medium rounded border ${getVipBadgeColor(reservation.guest.vipStatus)}`}>
                                {reservation.guest.vipStatus.toUpperCase()}
                              </span>
                            )}
                            {reservation.isEarlyCheckin && (
                              <span className="px-1.5 py-0.5 text-[9px] font-medium rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                EARLY
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-white/50">
                            {reservation.confirmationNumber} • {reservation.source} • {reservation.nights} night{reservation.nights > 1 ? 's' : ''}
                          </p>
                        </div>

                        {/* Room */}
                        <div className="text-center">
                          <p className="text-sm font-bold text-white">{reservation.roomNumber}</p>
                          <p className="text-[10px] text-white/40">{reservation.roomType}</p>
                        </div>

                        {/* Action */}
                        <div>
                          {reservation.status === 'confirmed' ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openCheckInModal(reservation);
                              }}
                              className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-medium rounded-lg border border-emerald-500/30 transition-colors"
                            >
                              Check In
                            </button>
                          ) : (
                            <span className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 text-xs font-medium rounded-lg border border-emerald-500/30">
                              Checked In
                            </span>
                          )}
                        </div>
                      </div>
                    ))}

                    {activeTab === 'departures' && filteredDepartures.map(reservation => (
                      <div
                        key={reservation.id}
                        onClick={() => setSelectedReservation(reservation)}
                        className={`flex items-center gap-4 px-4 py-3 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors ${
                          selectedReservation?.id === reservation.id ? 'bg-white/10' : ''
                        }`}
                      >
                        {/* Room */}
                        <div className="w-12 text-center">
                          <p className="text-sm font-bold text-white">{reservation.roomNumber}</p>
                        </div>

                        {/* Guest Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-white truncate">
                              {reservation.guest.firstName} {reservation.guest.lastName}
                            </p>
                            {reservation.guest.vipStatus !== 'none' && (
                              <span className={`px-1.5 py-0.5 text-[9px] font-medium rounded border ${getVipBadgeColor(reservation.guest.vipStatus)}`}>
                                {reservation.guest.vipStatus.toUpperCase()}
                              </span>
                            )}
                            {reservation.isLateCheckout && (
                              <span className="px-1.5 py-0.5 text-[9px] font-medium rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                LATE C/O
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-white/50">
                            {reservation.confirmationNumber} • Stayed {reservation.nights} night{reservation.nights > 1 ? 's' : ''}
                          </p>
                        </div>

                        {/* Balance */}
                        <div className="text-right">
                          {reservation.balance > 0 ? (
                            <>
                              <p className="text-sm font-bold text-amber-400">{formatCurrency(reservation.balance)}</p>
                              <p className="text-[10px] text-amber-300/70">balance due</p>
                            </>
                          ) : (
                            <>
                              <p className="text-sm font-medium text-emerald-400">Paid</p>
                              <p className="text-[10px] text-white/40">{formatCurrency(reservation.totalAmount)}</p>
                            </>
                          )}
                        </div>

                        {/* Action */}
                        <div>
                          {reservation.status === 'checked_in' ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenCheckout(reservation);
                              }}
                              className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-medium rounded-lg border border-rose-500/30 transition-colors"
                            >
                              Check Out
                            </button>
                          ) : (
                            <span className="px-3 py-1.5 bg-slate-500/20 text-slate-300 text-xs font-medium rounded-lg border border-slate-500/30">
                              Departed
                            </span>
                          )}
                        </div>
                      </div>
                    ))}

                    {activeTab === 'inhouse' && inHouseGuests.slice(0, 20).map(reservation => (
                      <div
                        key={reservation.id}
                        onClick={() => setSelectedReservation(reservation)}
                        className={`flex items-center gap-4 px-4 py-3 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors ${
                          selectedReservation?.id === reservation.id ? 'bg-white/10' : ''
                        }`}
                      >
                        {/* Room */}
                        <div className="w-12 text-center">
                          <p className="text-sm font-bold text-white">{reservation.roomNumber}</p>
                        </div>

                        {/* Guest Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-white truncate">
                              {reservation.guest.firstName} {reservation.guest.lastName}
                            </p>
                            {reservation.guest.vipStatus !== 'none' && (
                              <span className={`px-1.5 py-0.5 text-[9px] font-medium rounded border ${getVipBadgeColor(reservation.guest.vipStatus)}`}>
                                {reservation.guest.vipStatus.toUpperCase()}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-white/50">
                            {reservation.adults} adult{reservation.adults > 1 ? 's' : ''}{reservation.children > 0 ? `, ${reservation.children} child${reservation.children > 1 ? 'ren' : ''}` : ''} • {reservation.roomType}
                          </p>
                        </div>

                        {/* Stay Info */}
                        <div className="text-right">
                          <p className="text-xs text-white">C/O: {reservation.checkOutDate}</p>
                          <p className="text-[10px] text-white/40">{reservation.nights} night{reservation.nights > 1 ? 's' : ''}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column - VIP & Requests */}
                <div className="col-span-4 space-y-4">

                  {/* VIP Arrivals */}
                  {vipArrivals.length > 0 && (
                    <div className="bg-gradient-to-br from-purple-900/30 to-amber-900/20 backdrop-blur-xl rounded-xl border border-purple-500/20 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-amber-400" />
                          <h3 className="text-sm font-medium text-white">VIP Arrivals</h3>
                        </div>
                        <span className="text-xs text-white/40">{vipArrivals.length} guests</span>
                      </div>
                      <div className="space-y-2">
                        {vipArrivals.slice(0, 4).map(vip => (
                          <div key={vip.id} className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                            <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${getVipBadgeColor(vip.guest.vipStatus)}`}>
                              {vip.guest.vipStatus.toUpperCase()}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-white truncate">
                                {vip.guest.firstName} {vip.guest.lastName}
                              </p>
                              <p className="text-[9px] text-white/40">Room {vip.roomNumber} • {vip.arrivalTime}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Guest Requests */}
                  <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-white/60" />
                        <h3 className="text-sm font-medium text-white">Guest Requests</h3>
                      </div>
                      <span className="text-xs text-white/40">{pendingRequests} pending</span>
                    </div>
                    <div className="space-y-2 max-h-[280px] overflow-y-auto">
                      {guestRequests.filter(r => r.status !== 'completed').slice(0, 8).map(request => (
                        <div key={request.id} className="flex items-start gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                          <div className={`p-1.5 rounded ${
                            request.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                            request.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                            'bg-white/10 text-white/60'
                          }`}>
                            {getRequestTypeIcon(request.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-medium text-white truncate">{request.description}</p>
                              <span className={`px-1 py-0.5 text-[8px] font-medium rounded border ${getPriorityColor(request.priority)}`}>
                                {request.priority.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-[9px] text-white/40">
                              Room {request.roomNumber} • {request.department} • {formatTimeAgo(request.createdAt)}
                            </p>
                          </div>
                          {request.status === 'pending' && (
                            <button
                              onClick={() => updateRequestStatus(request.id, 'in_progress')}
                              className="px-2 py-1 text-[9px] bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded border border-blue-500/30"
                            >
                              Start
                            </button>
                          )}
                          {request.status === 'in_progress' && (
                            <button
                              onClick={() => updateRequestStatus(request.id, 'completed')}
                              className="px-2 py-1 text-[9px] bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded border border-emerald-500/30"
                            >
                              Done
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Room Status Summary */}
                  <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-white">Room Status</h3>
                      <Link href="/operations" className="text-[10px] text-blue-400 hover:text-blue-300">
                        View All →
                      </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <p className="text-lg font-bold text-blue-400">{roomStatusSummary.occupied}</p>
                        <p className="text-[10px] text-white/50">Occupied</p>
                      </div>
                      <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <p className="text-lg font-bold text-emerald-400">{roomStatusSummary.clean + roomStatusSummary.inspected}</p>
                        <p className="text-[10px] text-white/50">Vacant Ready</p>
                      </div>
                      <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                        <p className="text-lg font-bold text-amber-400">{roomStatusSummary.dirty}</p>
                        <p className="text-[10px] text-white/50">Dirty</p>
                      </div>
                      <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                        <p className="text-lg font-bold text-red-400">{roomStatusSummary.outOfOrder + roomStatusSummary.outOfService}</p>
                        <p className="text-[10px] text-white/50">OOO/OOS</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* AI Assistant Panel */}
          {aiPanelVisible && (
            <div className="w-80 border-l border-white/10 bg-gradient-to-b from-emerald-900/20 to-slate-900/40 backdrop-blur-xl flex flex-col">
              <VoiceSessionChat
                agentId="front-office-assistant"
                title="Front Office AI"
                subtitle="Voice-enabled assistant"
                avatar="/avatars/assistant-avatar.jpg"
                variant="dark"
                welcomeMessage="I'm your front office assistant. I can help you with check-ins, check-outs, room assignments, guest requests, and more. How can I help you today?"
                suggestions={[
                  "Who's arriving today?",
                  "Check in John Smith",
                  "Any VIP arrivals?",
                ]}
                contextData={{
                  arrivals: todayArrivals.length,
                  departures: todayDepartures.length,
                  inHouse: inHouseGuests.length,
                  pendingRequests: pendingRequests,
                  urgentRequests: urgentRequests,
                  occupancy: occupancyMetrics.today.percentage,
                }}
              />
            </div>
          )}

          {/* Right Sidebar - Selected Reservation Details */}
          {selectedReservation && (
            <div className="w-80 border-l border-white/10 bg-black/20 backdrop-blur-xl overflow-y-auto">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-white">Guest Details</h3>
                  <button
                    onClick={() => setSelectedReservation(null)}
                    className="p-1 hover:bg-white/10 rounded"
                  >
                    <X className="w-4 h-4 text-white/50" />
                  </button>
                </div>

                {/* Guest Header */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-lg font-medium text-white">
                      {selectedReservation.guest.firstName} {selectedReservation.guest.lastName}
                    </h4>
                    {selectedReservation.guest.vipStatus !== 'none' && (
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${getVipBadgeColor(selectedReservation.guest.vipStatus)}`}>
                        {selectedReservation.guest.vipStatus.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/50">{selectedReservation.guest.nationality} • {selectedReservation.guest.totalStays} previous stays</p>
                </div>

                {/* Contact */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs text-white/70">
                    <Mail className="w-3.5 h-3.5 text-white/40" />
                    <span>{selectedReservation.guest.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/70">
                    <Phone className="w-3.5 h-3.5 text-white/40" />
                    <span>{selectedReservation.guest.phone}</span>
                  </div>
                </div>

                {/* Reservation Details */}
                <div className="bg-white/5 rounded-lg p-3 mb-4">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-white/40">Confirmation</p>
                      <p className="text-white font-medium">{selectedReservation.confirmationNumber}</p>
                    </div>
                    <div>
                      <p className="text-white/40">Room</p>
                      <p className="text-white font-medium">{selectedReservation.roomNumber}</p>
                    </div>
                    <div>
                      <p className="text-white/40">Room Type</p>
                      <p className="text-white font-medium">{selectedReservation.roomType}</p>
                    </div>
                    <div>
                      <p className="text-white/40">Source</p>
                      <p className="text-white font-medium">{selectedReservation.source}</p>
                    </div>
                    <div>
                      <p className="text-white/40">Check-in</p>
                      <p className="text-white font-medium">{selectedReservation.checkInDate}</p>
                    </div>
                    <div>
                      <p className="text-white/40">Check-out</p>
                      <p className="text-white font-medium">{selectedReservation.checkOutDate}</p>
                    </div>
                    <div>
                      <p className="text-white/40">Guests</p>
                      <p className="text-white font-medium">
                        {selectedReservation.adults} adult{selectedReservation.adults > 1 ? 's' : ''}
                        {selectedReservation.children > 0 && `, ${selectedReservation.children} child${selectedReservation.children > 1 ? 'ren' : ''}`}
                      </p>
                    </div>
                    <div>
                      <p className="text-white/40">Nights</p>
                      <p className="text-white font-medium">{selectedReservation.nights}</p>
                    </div>
                  </div>
                </div>

                {/* Financials */}
                <div className="bg-white/5 rounded-lg p-3 mb-4">
                  <h5 className="text-xs font-medium text-white mb-2">Financials</h5>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-white/50">Rate/Night</span>
                      <span className="text-white">{formatCurrency(selectedReservation.rate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50">Total</span>
                      <span className="text-white">{formatCurrency(selectedReservation.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-white/10">
                      <span className="text-white/50">Balance</span>
                      <span className={selectedReservation.balance > 0 ? 'text-amber-400 font-medium' : 'text-emerald-400'}>
                        {selectedReservation.balance > 0 ? formatCurrency(selectedReservation.balance) : 'Paid'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Special Requests */}
                {selectedReservation.specialRequests && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-4">
                    <h5 className="text-xs font-medium text-amber-300 mb-1">Special Requests</h5>
                    <p className="text-xs text-white/70">{selectedReservation.specialRequests}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-2">
                  {selectedReservation.status === 'confirmed' && (
                    <button
                      onClick={() => openCheckInModal(selectedReservation)}
                      className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Check In Guest
                    </button>
                  )}
                  {selectedReservation.status === 'checked_in' && (
                    <button
                      onClick={() => handleOpenCheckout(selectedReservation)}
                      className="w-full py-2 bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Check Out Guest
                    </button>
                  )}
                  <button className="w-full py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors border border-white/20">
                    View Full Profile
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Check-In Modal */}
      {checkInModalOpen && checkInReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setCheckInModalOpen(false)}
          />

          {/* Modal */}
          <div className="relative bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div>
                <h2 className="text-lg font-medium text-white">Guest Check-In</h2>
                <p className="text-xs text-white/50">
                  {checkInReservation.guest.firstName} {checkInReservation.guest.lastName} • Room {checkInReservation.roomNumber}
                </p>
              </div>
              <button
                onClick={() => setCheckInModalOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="grid grid-cols-2 gap-6 p-6">

                {/* Left Column - Guest Details & Room */}
                <div className="space-y-6">
                  {/* Guest Details */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-white flex items-center gap-2">
                        <Edit3 className="w-4 h-4 text-white/50" />
                        Guest Details
                      </h3>
                      {checkInReservation.guest.vipStatus !== 'none' && (
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${getVipBadgeColor(checkInReservation.guest.vipStatus)}`}>
                          {checkInReservation.guest.vipStatus.toUpperCase()} VIP
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-white/40 block mb-1">First Name</label>
                        <input
                          type="text"
                          value={editedGuest.firstName || ''}
                          onChange={(e) => setEditedGuest({ ...editedGuest, firstName: e.target.value })}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-white/40 block mb-1">Last Name</label>
                        <input
                          type="text"
                          value={editedGuest.lastName || ''}
                          onChange={(e) => setEditedGuest({ ...editedGuest, lastName: e.target.value })}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-white/40 block mb-1">Email</label>
                        <input
                          type="email"
                          value={editedGuest.email || ''}
                          onChange={(e) => setEditedGuest({ ...editedGuest, email: e.target.value })}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-white/40 block mb-1">Phone</label>
                        <input
                          type="tel"
                          value={editedGuest.phone || ''}
                          onChange={(e) => setEditedGuest({ ...editedGuest, phone: e.target.value })}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-lg font-bold text-white">{checkInReservation.adults}</p>
                        <p className="text-[9px] text-white/40">Adults</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-white">{checkInReservation.children}</p>
                        <p className="text-[9px] text-white/40">Children</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-white">{checkInReservation.nights}</p>
                        <p className="text-[9px] text-white/40">Nights</p>
                      </div>
                    </div>
                  </div>

                  {/* Room Assignment - Visual Selector */}
                  <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                      <h3 className="text-sm font-medium text-white flex items-center gap-2">
                        <BedDouble className="w-4 h-4 text-white/50" />
                        Room Assignment
                      </h3>
                      {selectedRoom !== checkInReservation.roomNumber && (
                        <span className="px-2 py-0.5 text-[10px] bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">
                          Changed to {selectedRoom}
                        </span>
                      )}
                    </div>

                    {/* Room Selection Tabs */}
                    <div className="flex border-b border-white/10">
                      <button
                        onClick={() => setRoomSelectionTab('available')}
                        className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                          roomSelectionTab === 'available'
                            ? 'text-emerald-300 border-b-2 border-emerald-400 bg-emerald-500/10'
                            : 'text-white/60 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Ready Now ({availableRooms.filter(r => r.type === checkInReservation.roomType).length})
                        </div>
                      </button>
                      <button
                        onClick={() => setRoomSelectionTab('coming_soon')}
                        className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                          roomSelectionTab === 'coming_soon'
                            ? 'text-blue-300 border-b-2 border-blue-400 bg-blue-500/10'
                            : 'text-white/60 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          <Clock3 className="w-3.5 h-3.5" />
                          Coming Soon ({roomsBecomingReady.filter(r => r.type === checkInReservation.roomType).length})
                        </div>
                      </button>
                      <button
                        onClick={() => setRoomSelectionTab('upgrades')}
                        className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                          roomSelectionTab === 'upgrades'
                            ? 'text-purple-300 border-b-2 border-purple-400 bg-purple-500/10'
                            : 'text-white/60 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5" />
                          Upgrades ({upgradeOptions.length})
                        </div>
                      </button>
                    </div>

                    {/* Room Grid */}
                    <div className="p-3 max-h-[220px] overflow-y-auto">
                      {/* Available Now Tab */}
                      {roomSelectionTab === 'available' && (
                        <div className="grid grid-cols-2 gap-2">
                          {/* Original assigned room */}
                          <div
                            onClick={() => setSelectedRoom(checkInReservation.roomNumber)}
                            className={`p-3 rounded-lg border cursor-pointer transition-all ${
                              selectedRoom === checkInReservation.roomNumber
                                ? 'bg-emerald-500/20 border-emerald-500/50 ring-1 ring-emerald-500/30'
                                : 'bg-white/5 border-white/10 hover:bg-white/10'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-lg font-bold text-white">{checkInReservation.roomNumber}</span>
                              <span className="px-1.5 py-0.5 text-[8px] bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">
                                ASSIGNED
                              </span>
                            </div>
                            <p className="text-[10px] text-white/50">{checkInReservation.roomType}</p>
                            <p className="text-[9px] text-white/40">Floor {checkInReservation.roomNumber.charAt(0)}</p>
                          </div>

                          {/* Other available rooms of same type */}
                          {availableRooms
                            .filter(r => r.type === checkInReservation.roomType && r.number !== checkInReservation.roomNumber)
                            .slice(0, 9)
                            .map(room => (
                              <div
                                key={room.number}
                                onClick={() => setSelectedRoom(room.number)}
                                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                                  selectedRoom === room.number
                                    ? 'bg-emerald-500/20 border-emerald-500/50 ring-1 ring-emerald-500/30'
                                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-lg font-bold text-white">{room.number}</span>
                                  {selectedRoom === room.number && (
                                    <Check className="w-4 h-4 text-emerald-400" />
                                  )}
                                </div>
                                <div className="flex flex-wrap gap-1 mb-1">
                                  {getRoomFeatures(room).slice(0, 2).map((feature, i) => (
                                    <span key={i} className="px-1 py-0.5 text-[8px] bg-white/10 text-white/60 rounded">
                                      {feature}
                                    </span>
                                  ))}
                                </div>
                                <p className="text-[9px] text-white/40">Floor {room.floor} • {room.view} view</p>
                              </div>
                            ))}
                        </div>
                      )}

                      {/* Coming Soon Tab */}
                      {roomSelectionTab === 'coming_soon' && (
                        <div className="space-y-2">
                          {roomsBecomingReady.filter(r => r.type === checkInReservation.roomType).length === 0 ? (
                            <div className="text-center py-6 text-white/40 text-xs">
                              No rooms of this type are currently being cleaned
                            </div>
                          ) : (
                            roomsBecomingReady
                              .filter(r => r.type === checkInReservation.roomType)
                              .slice(0, 6)
                              .map(room => (
                                <div
                                  key={room.number}
                                  className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10"
                                >
                                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                    <DoorOpen className="w-5 h-5 text-blue-400" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-bold text-white">{room.number}</span>
                                      <span className="px-1.5 py-0.5 text-[8px] bg-blue-500/20 text-blue-300 rounded border border-blue-500/30">
                                        CLEANING
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-white/50">{room.type} • Floor {room.floor}</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {getRoomFeatures(room).map((feature, i) => (
                                        <span key={i} className="px-1 py-0.5 text-[8px] bg-white/10 text-white/50 rounded">
                                          {feature}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="flex items-center gap-1 text-blue-300">
                                      <Clock className="w-3 h-3" />
                                      <span className="text-sm font-bold">{room.estimatedReadyTime}</span>
                                    </div>
                                    <p className="text-[9px] text-white/40">Ready at</p>
                                    {room.housekeeperAssigned && (
                                      <p className="text-[9px] text-white/50 mt-1">{room.housekeeperAssigned}</p>
                                    )}
                                  </div>
                                </div>
                              ))
                          )}
                          {roomsBecomingReady.filter(r => r.type === checkInReservation.roomType).length > 0 && (
                            <p className="text-[10px] text-white/40 text-center pt-2">
                              These rooms cannot be selected until cleaning is complete
                            </p>
                          )}
                        </div>
                      )}

                      {/* Upgrades Tab */}
                      {roomSelectionTab === 'upgrades' && (
                        <div className="space-y-3">
                          {upgradeOptions.length === 0 ? (
                            <div className="text-center py-6 text-white/40 text-xs">
                              No upgrade options available (already at highest room type or no rooms available)
                            </div>
                          ) : (
                            upgradeOptions.map(option => (
                              <div key={option.toType} className="bg-gradient-to-r from-purple-900/30 to-pink-900/20 rounded-lg border border-purple-500/20 overflow-hidden">
                                <div className="px-3 py-2 border-b border-purple-500/20 flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Crown className="w-4 h-4 text-purple-400" />
                                    <span className="text-sm font-medium text-white">Upgrade to {option.toType}</span>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-sm font-bold text-emerald-400">+{formatCurrency(option.priceDifference)}</span>
                                    <p className="text-[9px] text-white/40">for {checkInReservation.nights} night(s)</p>
                                  </div>
                                </div>
                                <div className="p-2 grid grid-cols-3 gap-2">
                                  {option.availableRooms.slice(0, 6).map(room => (
                                    <div
                                      key={room.number}
                                      onClick={() => setSelectedRoom(room.number)}
                                      className={`p-2 rounded-lg border cursor-pointer transition-all ${
                                        selectedRoom === room.number
                                          ? 'bg-purple-500/30 border-purple-500/50 ring-1 ring-purple-500/30'
                                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-white">{room.number}</span>
                                        {selectedRoom === room.number && (
                                          <Check className="w-3 h-3 text-purple-400" />
                                        )}
                                      </div>
                                      <p className="text-[9px] text-white/40 mt-0.5">
                                        {room.sqm}m² • {room.view}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Special Requests */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <h3 className="text-sm font-medium text-white flex items-center gap-2 mb-4">
                      <MessageSquare className="w-4 h-4 text-white/50" />
                      Special Requests
                    </h3>
                    <textarea
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder="Enter any special requests or notes..."
                      rows={3}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 resize-none"
                    />
                  </div>
                </div>

                {/* Right Column - Upsells */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/20 rounded-xl p-4 border border-purple-500/20">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-white flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        Recommended for This Guest
                      </h3>
                      <span className="text-[10px] text-white/40">
                        {checkInReservation.adults === 2 && checkInReservation.children === 0 ? 'Couple' :
                         checkInReservation.children > 0 ? 'Family' :
                         checkInReservation.adults === 1 ? 'Solo' : 'Group'} Traveler
                      </span>
                    </div>

                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                      {recommendedUpsells.slice(0, 12).map(offer => {
                        const isSelected = selectedUpsells.includes(offer.id);
                        return (
                          <div
                            key={offer.id}
                            onClick={() => toggleUpsell(offer.id)}
                            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-emerald-500/20 border-emerald-500/40'
                                : 'bg-white/5 border-white/10 hover:bg-white/10'
                            }`}
                          >
                            <div className={`p-2 rounded-lg ${getCategoryColor(offer.category)}`}>
                              {getUpsellIcon(offer.icon)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-white">{offer.name}</p>
                                <p className="text-sm font-bold text-emerald-400">{formatCurrency(offer.price)}</p>
                              </div>
                              <p className="text-[10px] text-white/50 mt-0.5">{offer.description}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`px-1.5 py-0.5 text-[8px] rounded border ${getCategoryColor(offer.category)}`}>
                                  {offer.category.replace('_', ' ').toUpperCase()}
                                </span>
                                {offer.targetAudience.filter(t => t !== 'all').length > 0 && (
                                  <span className="text-[8px] text-purple-300">
                                    Perfect for {offer.targetAudience.filter(t => t !== 'all').join(', ')}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                              isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-white/30'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {selectedUpsells.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/70">{selectedUpsells.length} item(s) selected</span>
                          <span className="text-lg font-bold text-emerald-400">+{formatCurrency(upsellTotal)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-black/20">
              <div className="text-sm">
                <span className="text-white/50">Total:</span>
                <span className="ml-2 text-lg font-bold text-white">
                  {formatCurrency(checkInReservation.totalAmount + upsellTotal)}
                </span>
                {upsellTotal > 0 && (
                  <span className="ml-2 text-xs text-emerald-400">(+{formatCurrency(upsellTotal)} upsells)</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCheckInModalOpen(false)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors border border-white/20"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCheckInWithDetails}
                  className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  <UserCheck className="w-4 h-4" />
                  Complete Check-In
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal with Billing Summary */}
      {checkoutModalOpen && checkoutReservation && checkoutBilling && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => !processingPayment && setCheckoutModalOpen(false)}
          />

          {/* Modal */}
          <div className="relative bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div>
                <h2 className="text-lg font-medium text-white">Guest Checkout - Billing Summary</h2>
                <p className="text-sm text-white/50">
                  Room {checkoutReservation.roomNumber} • {checkoutReservation.guest.firstName} {checkoutReservation.guest.lastName}
                </p>
              </div>
              <button
                onClick={() => !processingPayment && setCheckoutModalOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                disabled={processingPayment}
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-auto max-h-[calc(90vh-200px)]">
              <div className="grid grid-cols-3 gap-6">
                {/* Stay Summary */}
                <div className="col-span-2 space-y-4">
                  {/* Guest Info & Stay Details */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <h3 className="text-sm font-medium text-white mb-3">Stay Details</h3>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-white/40 text-xs">Check In</p>
                        <p className="text-white">{checkoutBilling.checkInDate}</p>
                      </div>
                      <div>
                        <p className="text-white/40 text-xs">Check Out</p>
                        <p className="text-white">{checkoutBilling.checkOutDate}</p>
                      </div>
                      <div>
                        <p className="text-white/40 text-xs">Nights</p>
                        <p className="text-white">{checkoutReservation.nights}</p>
                      </div>
                      <div>
                        <p className="text-white/40 text-xs">Guests</p>
                        <p className="text-white">{checkoutReservation.adults} adults{checkoutReservation.children > 0 ? `, ${checkoutReservation.children} children` : ''}</p>
                      </div>
                    </div>
                  </div>

                  {/* Charges Breakdown */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <h3 className="text-sm font-medium text-white mb-3">Charges Breakdown</h3>
                    <div className="space-y-3">
                      {groupChargesByCategory(checkoutBilling.charges.filter(c => c.category !== 'tax' && c.category !== 'service_fee')).map((group, idx) => (
                        <div key={idx} className="border-b border-white/5 pb-3 last:border-0 last:pb-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{getCategoryIcon(group.category)}</span>
                              <span className="text-sm font-medium text-white capitalize">{group.category.replace('_', ' ')}</span>
                            </div>
                            <span className="text-sm font-medium text-white">{formatCurrency(group.total)}</span>
                          </div>
                          <div className="ml-8 space-y-1">
                            {group.items.map(item => (
                              <div key={item.id} className="flex justify-between text-xs text-white/60">
                                <span>{item.description}{item.outlet ? ` (${item.outlet})` : ''}</span>
                                <span>{formatCurrency(item.amount)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Previous Payments */}
                  {checkoutBilling.payments.length > 0 && (
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <h3 className="text-sm font-medium text-white mb-3">Previous Payments</h3>
                      <div className="space-y-2">
                        {checkoutBilling.payments.map(payment => (
                          <div key={payment.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-4 h-4 text-emerald-400" />
                              <span className="text-white/70">
                                {payment.cardBrand} •••• {payment.cardLast4}
                              </span>
                              <span className="text-white/40 text-xs">
                                {new Date(payment.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                            <span className="text-emerald-400">-{formatCurrency(payment.amount)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Payment Summary & Options */}
                <div className="space-y-4">
                  {/* Total Summary */}
                  <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl p-4 border border-indigo-500/30">
                    <h3 className="text-sm font-medium text-white mb-3">Bill Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-white/70">
                        <span>Subtotal</span>
                        <span>{formatCurrency(checkoutBilling.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-white/70">
                        <span>Tax (10%)</span>
                        <span>{formatCurrency(checkoutBilling.taxAmount)}</span>
                      </div>
                      <div className="flex justify-between text-white/70">
                        <span>Service Charge</span>
                        <span>{formatCurrency(checkoutBilling.serviceCharge)}</span>
                      </div>
                      <div className="border-t border-white/20 my-2" />
                      <div className="flex justify-between text-white font-medium">
                        <span>Total</span>
                        <span>{formatCurrency(checkoutBilling.totalAmount)}</span>
                      </div>
                      {checkoutBilling.paidAmount > 0 && (
                        <div className="flex justify-between text-emerald-400">
                          <span>Paid</span>
                          <span>-{formatCurrency(checkoutBilling.paidAmount)}</span>
                        </div>
                      )}
                      <div className="border-t border-white/20 my-2" />
                      <div className="flex justify-between text-lg font-bold">
                        <span className={checkoutBilling.balance > 0 ? 'text-amber-400' : 'text-emerald-400'}>
                          {checkoutBilling.balance > 0 ? 'Balance Due' : 'Fully Paid'}
                        </span>
                        <span className={checkoutBilling.balance > 0 ? 'text-amber-400' : 'text-emerald-400'}>
                          {formatCurrency(checkoutBilling.balance)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method Selection */}
                  {checkoutBilling.balance > 0 && (
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <h3 className="text-sm font-medium text-white mb-3">Payment Method</h3>
                      <div className="space-y-2">
                        {[
                          { id: 'credit_card', label: 'Credit Card', icon: '💳' },
                          { id: 'debit_card', label: 'Debit Card', icon: '💳' },
                          { id: 'cash', label: 'Cash', icon: '💴' },
                          { id: 'mobile_payment', label: 'Mobile Payment (PayPay/LINE)', icon: '📱' },
                          { id: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' },
                        ].map(method => (
                          <label
                            key={method.id}
                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                              selectedPaymentMethod === method.id
                                ? 'bg-indigo-500/20 border-indigo-500/50'
                                : 'bg-white/5 border-white/10 hover:bg-white/10'
                            }`}
                          >
                            <input
                              type="radio"
                              name="paymentMethod"
                              value={method.id}
                              checked={selectedPaymentMethod === method.id}
                              onChange={() => setSelectedPaymentMethod(method.id as PaymentMethod)}
                              className="sr-only"
                            />
                            <span className="text-lg">{method.icon}</span>
                            <span className="text-sm text-white">{method.label}</span>
                            {selectedPaymentMethod === method.id && (
                              <Check className="w-4 h-4 text-indigo-400 ml-auto" />
                            )}
                          </label>
                        ))}
                      </div>

                      {/* Card Input (for card payments) */}
                      {(selectedPaymentMethod === 'credit_card' || selectedPaymentMethod === 'debit_card') && (
                        <div className="mt-4">
                          <label className="block text-xs text-white/50 mb-1">Card Number (last 4 digits for record)</label>
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                            placeholder="•••• •••• •••• ••••"
                            className="w-full bg-slate-800 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Print/Email Options */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <h3 className="text-sm font-medium text-white mb-3">Receipt Options</h3>
                    <div className="flex gap-2">
                      <button className="flex-1 py-2 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg border border-white/20 transition-colors">
                        Print Receipt
                      </button>
                      <button className="flex-1 py-2 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg border border-white/20 transition-colors">
                        Email Receipt
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-white/5">
              <button
                onClick={() => !processingPayment && setCheckoutModalOpen(false)}
                disabled={processingPayment}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors border border-white/20 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleProcessCheckout}
                disabled={processingPayment}
                className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {processingPayment ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <DoorOpen className="w-4 h-4" />
                    {checkoutBilling.balance > 0 ? `Pay ${formatCurrency(checkoutBilling.balance)} & Check Out` : 'Complete Checkout'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
