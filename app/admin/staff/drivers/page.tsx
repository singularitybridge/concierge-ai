'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Car, ChevronRight, LogOut, ChevronLeft, Calendar, Clock, MapPin, Phone, Mail, Star, Plus, Plane, Mountain } from 'lucide-react';
import VoiceSessionChat from '../../../components/VoiceSessionChat';
import LanguageSelector from '../../../components/LanguageSelector';
import { useAuth } from '../../../hooks/useAuth';
import { useLanguageStore } from '@/lib/use-language-store';
import { translations as defaultTranslations } from '@/lib/translations';

// Types
interface Trip {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'airportPickup' | 'airportDropoff' | 'skiResort' | 'cityTour' | 'onDemand' | 'off';
  destination?: string;
  guestName?: string;
  vehicle?: string;
  notes?: string;
}

interface Driver {
  id: string;
  name: string;
  role: 'driver' | 'chauffeur' | 'shuttleDriver';
  avatar: string;
  phone: string;
  email: string;
  status: 'available' | 'on-trip' | 'off-duty';
  rating: number;
  hireDate: string;
  licenses: string[];
  assignedVehicle?: string;
  trips: Trip[];
}

type CalendarView = 'day' | 'week' | 'month';

// Mock driver data
const mockDrivers: Driver[] = [
  {
    id: 'd1',
    name: 'Takeshi Mori',
    role: 'chauffeur',
    avatar: '/avatars/driver-1.jpg',
    phone: '+81-90-7777-8888',
    email: 't.mori@1898niseko.com',
    status: 'available',
    rating: 4.9,
    hireDate: '2020-05-01',
    licenses: ['Class 2', 'Tourism'],
    assignedVehicle: 'Lexus LX 600',
    trips: [
      { id: 't1', date: '2024-12-09', startTime: '08:00', endTime: '10:00', type: 'airportPickup', destination: 'New Chitose Airport', guestName: 'Mr. Williams', vehicle: 'Lexus LX 600' },
      { id: 't2', date: '2024-12-10', startTime: '14:00', endTime: '16:00', type: 'skiResort', destination: 'Niseko Grand Hirafu', guestName: 'Chen Family', vehicle: 'Lexus LX 600' },
      { id: 't3', date: '2024-12-11', startTime: '09:00', endTime: '18:00', type: 'cityTour', destination: 'Otaru Day Trip', guestName: 'Mr. & Mrs. Park', vehicle: 'Lexus LX 600' },
      { id: 't4', date: '2024-12-12', startTime: '00:00', endTime: '00:00', type: 'off' },
      { id: 't5', date: '2024-12-13', startTime: '16:00', endTime: '18:00', type: 'airportDropoff', destination: 'New Chitose Airport', guestName: 'Ms. Tanaka', vehicle: 'Lexus LX 600' },
      { id: 't6', date: '2024-12-14', startTime: '10:00', endTime: '12:00', type: 'onDemand', destination: 'Kutchan Town', vehicle: 'Lexus LX 600' },
      { id: 't7', date: '2024-12-15', startTime: '08:00', endTime: '10:00', type: 'airportPickup', destination: 'New Chitose Airport', guestName: 'Mr. Smith VIP', vehicle: 'Lexus LX 600' },
    ]
  },
  {
    id: 'd2',
    name: 'Hiroki Sato',
    role: 'driver',
    avatar: '/avatars/driver-2.jpg',
    phone: '+81-90-8888-9999',
    email: 'h.sato@1898niseko.com',
    status: 'on-trip',
    rating: 4.7,
    hireDate: '2022-01-15',
    licenses: ['Class 2'],
    assignedVehicle: 'Toyota Alphard',
    trips: [
      { id: 't8', date: '2024-12-09', startTime: '07:00', endTime: '09:00', type: 'skiResort', destination: 'Niseko Annupuri', guestName: 'Anderson Family', vehicle: 'Toyota Alphard' },
      { id: 't9', date: '2024-12-10', startTime: '08:00', endTime: '10:00', type: 'airportPickup', destination: 'New Chitose Airport', guestName: 'Mr. Yamamoto', vehicle: 'Toyota Alphard' },
      { id: 't10', date: '2024-12-11', startTime: '00:00', endTime: '00:00', type: 'off' },
      { id: 't11', date: '2024-12-12', startTime: '14:00', endTime: '16:00', type: 'skiResort', destination: 'Niseko Village', guestName: 'Kim Family', vehicle: 'Toyota Alphard' },
      { id: 't12', date: '2024-12-13', startTime: '00:00', endTime: '00:00', type: 'off' },
      { id: 't13', date: '2024-12-14', startTime: '08:00', endTime: '10:00', type: 'airportPickup', destination: 'New Chitose Airport', guestName: 'Ms. Wong', vehicle: 'Toyota Alphard' },
      { id: 't14', date: '2024-12-15', startTime: '15:00', endTime: '17:00', type: 'airportDropoff', destination: 'New Chitose Airport', guestName: 'Anderson Family', vehicle: 'Toyota Alphard' },
    ]
  },
  {
    id: 'd3',
    name: 'Yuki Tanaka',
    role: 'shuttleDriver',
    avatar: '/avatars/driver-3.jpg',
    phone: '+81-90-9999-0000',
    email: 'y.tanaka@1898niseko.com',
    status: 'available',
    rating: 4.8,
    hireDate: '2021-11-01',
    licenses: ['Class 2', 'Large Vehicle'],
    assignedVehicle: 'Toyota Coaster',
    trips: [
      { id: 't15', date: '2024-12-09', startTime: '08:00', endTime: '09:00', type: 'skiResort', destination: 'Niseko Grand Hirafu', vehicle: 'Toyota Coaster', notes: 'Morning shuttle' },
      { id: 't16', date: '2024-12-09', startTime: '16:00', endTime: '17:00', type: 'skiResort', destination: 'Niseko Grand Hirafu', vehicle: 'Toyota Coaster', notes: 'Evening return' },
      { id: 't17', date: '2024-12-10', startTime: '08:00', endTime: '09:00', type: 'skiResort', destination: 'Niseko Grand Hirafu', vehicle: 'Toyota Coaster', notes: 'Morning shuttle' },
      { id: 't18', date: '2024-12-10', startTime: '16:00', endTime: '17:00', type: 'skiResort', destination: 'Niseko Grand Hirafu', vehicle: 'Toyota Coaster', notes: 'Evening return' },
      { id: 't19', date: '2024-12-11', startTime: '00:00', endTime: '00:00', type: 'off' },
      { id: 't20', date: '2024-12-12', startTime: '08:00', endTime: '09:00', type: 'skiResort', destination: 'Niseko Village', vehicle: 'Toyota Coaster', notes: 'Morning shuttle' },
      { id: 't21', date: '2024-12-13', startTime: '08:00', endTime: '09:00', type: 'skiResort', destination: 'Niseko Annupuri', vehicle: 'Toyota Coaster', notes: 'Morning shuttle' },
    ]
  },
  {
    id: 'd4',
    name: 'Kenji Nakamura',
    role: 'driver',
    avatar: '/avatars/driver-4.jpg',
    phone: '+81-90-0000-1111',
    email: 'k.nakamura@1898niseko.com',
    status: 'off-duty',
    rating: 4.6,
    hireDate: '2023-06-01',
    licenses: ['Class 2'],
    assignedVehicle: 'Mercedes V-Class',
    trips: [
      { id: 't22', date: '2024-12-09', startTime: '00:00', endTime: '00:00', type: 'off' },
      { id: 't23', date: '2024-12-10', startTime: '00:00', endTime: '00:00', type: 'off' },
      { id: 't24', date: '2024-12-11', startTime: '10:00', endTime: '12:00', type: 'airportPickup', destination: 'New Chitose Airport', guestName: 'VIP Guest', vehicle: 'Mercedes V-Class' },
      { id: 't25', date: '2024-12-12', startTime: '09:00', endTime: '18:00', type: 'cityTour', destination: 'Sapporo Day Trip', guestName: 'Thompson Family', vehicle: 'Mercedes V-Class' },
      { id: 't26', date: '2024-12-13', startTime: '14:00', endTime: '16:00', type: 'skiResort', destination: 'Rusutsu Resort', guestName: 'Mr. Lee', vehicle: 'Mercedes V-Class' },
      { id: 't27', date: '2024-12-14', startTime: '00:00', endTime: '00:00', type: 'off' },
      { id: 't28', date: '2024-12-15', startTime: '10:00', endTime: '12:00', type: 'onDemand', destination: 'Various', vehicle: 'Mercedes V-Class' },
    ]
  }
];

export default function DriversManagementPage() {
  const { isAuthenticated, logout } = useAuth();
  const { translations: storeTranslations, language } = useLanguageStore();
  const t = storeTranslations?.admin ? storeTranslations : defaultTranslations.en;
  const [mounted, setMounted] = useState(false);
  const [driversData, setDriversData] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [calendarView, setCalendarView] = useState<CalendarView>('week');
  const [currentDate, setCurrentDate] = useState(new Date('2024-12-10'));

  const menuItems = [
    { label: t.nav.checkIn, href: '/register' },
    { label: t.admin.title, href: '/admin', active: true },
    { label: t.nav.restaurant, href: '/restaurant' },
  ];

  useEffect(() => {
    if (isAuthenticated) {
      setMounted(true);
      setDriversData(mockDrivers);
      setLoading(false);
    }
  }, [isAuthenticated]);

  const getWeekDates = (date: Date): Date[] => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date);
    monday.setDate(diff);

    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const weekDates = getWeekDates(currentDate);

  const formatDateKey = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const getTripsForDate = (driver: Driver, date: Date): Trip[] => {
    const dateKey = formatDateKey(date);
    return driver.trips.filter(t => t.date === dateKey);
  };

  const getTripColor = (type: Trip['type']) => {
    switch (type) {
      case 'airportPickup': return 'bg-sky-500/20 text-sky-400 border-sky-500/30';
      case 'airportDropoff': return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
      case 'skiResort': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'cityTour': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'onDemand': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'off': return 'bg-white/5 text-white/30 border-white/10';
    }
  };

  const getTripIcon = (type: Trip['type']) => {
    switch (type) {
      case 'airportPickup':
      case 'airportDropoff':
        return <Plane className="w-3 h-3" />;
      case 'skiResort':
        return <Mountain className="w-3 h-3" />;
      default:
        return <Car className="w-3 h-3" />;
    }
  };

  const navigateCalendar = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (calendarView === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (calendarView === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  // Stats
  const totalDrivers = driversData.length;
  const availableDrivers = driversData.filter(d => d.status === 'available').length;
  const onTripDrivers = driversData.filter(d => d.status === 'on-trip').length;
  const offDutyDrivers = driversData.filter(d => d.status === 'off-duty').length;
  const totalVehicles = new Set(driversData.map(d => d.assignedVehicle).filter(Boolean)).size;

  // Get role display name from translations
  const getRoleName = (role: Driver['role']) => {
    return t.staffManagement.drivers.roles[role] || role;
  };

  // Get trip type name from translations
  const getTripTypeName = (type: Trip['type']) => {
    if (type === 'off') return t.staffManagement.common.dayOff;
    return t.staffManagement.drivers.tripTypes[type] || type;
  };

  // Context data for voice agent
  const driversContextData = {
    department: 'transportation',
    language,
    drivers: driversData.map(d => ({
      id: d.id,
      name: d.name,
      role: getRoleName(d.role),
      status: d.status,
      vehicle: d.assignedVehicle,
      licenses: d.licenses
    })),
    stats: {
      totalDrivers,
      available: availableDrivers,
      onTrip: onTripDrivers,
      offDuty: offDutyDrivers,
      vehicles: totalVehicles
    },
    currentDate: formatDateKey(currentDate)
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

  const getStatusColor = (status: Driver['status']) => {
    switch (status) {
      case 'available': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'on-trip': return 'bg-sky-500/20 text-sky-400 border-sky-500/30';
      case 'off-duty': return 'bg-white/10 text-white/50 border-white/20';
    }
  };

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

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

          {/* Right - Language & Logout */}
          <div className="flex items-center gap-2">
            <LanguageSelector variant="dark" />
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all"
            >
              <span className="text-sm">{t.nav.logout}</span>
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </nav>

        {/* Breadcrumbs */}
        <div className="px-8 pb-3 flex-shrink-0">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/admin" className="text-white/50 hover:text-white transition-colors">
              {t.admin.title}
            </Link>
            <ChevronRight className="w-4 h-4 text-white/30" />
            <Link href="/admin/staff" className="text-white/50 hover:text-white transition-colors">
              {t.staffManagement.title}
            </Link>
            <ChevronRight className="w-4 h-4 text-white/30" />
            <span className="text-white/80">{t.staffManagement.drivers.title}</span>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex gap-6 px-8 pb-6 min-h-0">
          {/* Left: Driver List & Calendar */}
          <div className="flex-1 min-w-0 flex flex-col">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl flex-1 flex flex-col min-h-0 overflow-hidden">
              {/* Header */}
              <div className="p-6 flex-shrink-0 border-b border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-sky-500/20 flex items-center justify-center">
                      <Car className="w-6 h-6 text-sky-400" />
                    </div>
                    <div>
                      <h2
                        className="text-3xl font-light text-white tracking-wide"
                        style={{ fontFamily: 'var(--font-cormorant)' }}
                      >
                        {t.staffManagement.drivers.title}
                      </h2>
                      <p className="text-sm text-white/50 mt-1">{t.staffManagement.drivers.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Add Driver Button */}
                    <button className="flex items-center gap-2 px-4 py-2 bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 rounded-lg border border-sky-500/30 transition-colors">
                      <Plus className="w-4 h-4" />
                      <span className="text-sm">{t.staffManagement.common.addStaff}</span>
                    </button>

                    {/* Calendar View Toggle */}
                    <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 border border-white/10">
                      {(['day', 'week', 'month'] as CalendarView[]).map((view) => (
                        <button
                          key={view}
                          onClick={() => setCalendarView(view)}
                          className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                            calendarView === view
                              ? 'bg-white/15 text-white'
                              : 'text-white/50 hover:text-white/70'
                          }`}
                        >
                          {view.charAt(0).toUpperCase() + view.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-5 gap-3">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2 mb-1">
                      <Car className="w-3.5 h-3.5 text-white/40" />
                      <span className="text-xs text-white/50">{t.staffManagement.drivers.stats.totalDrivers}</span>
                    </div>
                    <p className="text-xl font-light text-white">{totalDrivers}</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-xs text-white/50">{t.staffManagement.drivers.stats.available}</span>
                    </div>
                    <p className="text-xl font-light text-emerald-400">{availableDrivers}</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-sky-400" />
                      <span className="text-xs text-white/50">{t.staffManagement.drivers.stats.onTrip}</span>
                    </div>
                    <p className="text-xl font-light text-sky-400">{onTripDrivers}</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-white/30" />
                      <span className="text-xs text-white/50">{t.staffManagement.drivers.stats.offDuty}</span>
                    </div>
                    <p className="text-xl font-light text-white/60">{offDutyDrivers}</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-3.5 h-3.5 text-white/40" />
                      <span className="text-xs text-white/50">{t.staffManagement.drivers.stats.vehicles}</span>
                    </div>
                    <p className="text-xl font-light text-white">{totalVehicles}</p>
                  </div>
                </div>
              </div>

              {/* Calendar Navigation */}
              <div className="px-6 py-3 flex items-center justify-between border-b border-white/10 flex-shrink-0">
                <button
                  onClick={() => navigateCalendar('prev')}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-white/60" />
                </button>
                <h3 className="text-sm font-medium text-white">
                  {calendarView === 'month'
                    ? `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
                    : calendarView === 'week'
                    ? `${weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                    : currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </h3>
                <button
                  onClick={() => navigateCalendar('next')}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-white/60" />
                </button>
              </div>

              {/* Calendar Content - Week View */}
              <div className="flex-1 overflow-y-auto min-h-0">
                {calendarView === 'week' && (
                  <div className="p-4">
                    {/* Day Headers */}
                    <div className="grid grid-cols-8 gap-2 mb-3">
                      <div className="text-xs text-white/40 py-2">{t.staffManagement.common.staff || 'Driver'}</div>
                      {weekDates.map((date, i) => (
                        <div key={i} className="text-center">
                          <p className="text-xs text-white/40">{dayNames[i]}</p>
                          <p className={`text-sm font-medium ${formatDateKey(date) === formatDateKey(currentDate) ? 'text-sky-400' : 'text-white/70'}`}>
                            {date.getDate()}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Driver Rows */}
                    {driversData.map((driver) => (
                      <div
                        key={driver.id}
                        className={`grid grid-cols-8 gap-2 mb-2 p-2 rounded-xl cursor-pointer transition-colors ${
                          selectedDriver?.id === driver.id ? 'bg-white/10' : 'hover:bg-white/5'
                        }`}
                        onClick={() => setSelectedDriver(selectedDriver?.id === driver.id ? null : driver)}
                      >
                        {/* Driver Info */}
                        <div className="flex items-center gap-2">
                          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-white/10 flex-shrink-0">
                            <Image src={driver.avatar} alt={driver.name} fill className="object-cover" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-white truncate">{driver.name}</p>
                            <p className="text-[10px] text-white/40 truncate">{driver.assignedVehicle}</p>
                          </div>
                        </div>

                        {/* Trips */}
                        {weekDates.map((date, i) => {
                          const trips = getTripsForDate(driver, date);
                          const firstTrip = trips[0];
                          return (
                            <div key={i} className="flex items-center justify-center">
                              {firstTrip ? (
                                <div className={`w-full py-1.5 px-1 rounded-lg text-center border ${getTripColor(firstTrip.type)}`}>
                                  <div className="flex items-center justify-center gap-1">
                                    {getTripIcon(firstTrip.type)}
                                    <p className="text-[10px] font-medium">
                                      {firstTrip.type === 'off' ? 'OFF' : getTripTypeName(firstTrip.type).split(' ')[0]}
                                    </p>
                                  </div>
                                  {firstTrip.type !== 'off' && trips.length > 1 && (
                                    <p className="text-[9px] opacity-70">+{trips.length - 1} more</p>
                                  )}
                                </div>
                              ) : (
                                <div className="w-full py-2 rounded-lg bg-white/5 border border-white/10" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}

                {/* Day View */}
                {calendarView === 'day' && (
                  <div className="p-4 space-y-3">
                    {driversData.map((driver) => {
                      const trips = getTripsForDate(driver, currentDate);
                      return (
                        <div
                          key={driver.id}
                          className={`p-4 rounded-xl cursor-pointer transition-colors border ${
                            selectedDriver?.id === driver.id
                              ? 'bg-white/15 border-sky-400/50'
                              : 'bg-white/5 border-white/10 hover:bg-white/10'
                          }`}
                          onClick={() => setSelectedDriver(selectedDriver?.id === driver.id ? null : driver)}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white/10">
                                <Image src={driver.avatar} alt={driver.name} fill className="object-cover" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white">{driver.name}</p>
                                <p className="text-xs text-white/50">{driver.assignedVehicle}</p>
                              </div>
                            </div>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getStatusColor(driver.status)}`}>
                              {driver.status.replace('-', ' ')}
                            </span>
                          </div>

                          {trips.length > 0 && (
                            <div className="space-y-2">
                              {trips.map((trip) => (
                                <div key={trip.id} className={`p-2 rounded-lg border ${getTripColor(trip.type)}`}>
                                  {trip.type === 'off' ? (
                                    <p className="text-xs">{t.staffManagement.common.dayOff}</p>
                                  ) : (
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        {getTripIcon(trip.type)}
                                        <span className="text-xs">{getTripTypeName(trip.type)}</span>
                                      </div>
                                      <span className="text-[10px] opacity-70">{trip.startTime} - {trip.endTime}</span>
                                    </div>
                                  )}
                                  {trip.destination && (
                                    <p className="text-[10px] opacity-70 mt-1">{trip.destination}</p>
                                  )}
                                  {trip.guestName && (
                                    <p className="text-[10px] opacity-60">{trip.guestName}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Month View */}
                {calendarView === 'month' && (
                  <div className="p-4 text-center text-white/40">
                    <p>Month view coming soon</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Driver Details & Voice Chat */}
          <div className="w-[400px] flex-shrink-0 flex flex-col min-h-0 gap-4">
            {/* Selected Driver Details */}
            {selectedDriver && (
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl p-5 flex-shrink-0">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative w-14 h-14 rounded-full overflow-hidden bg-white/10">
                    <Image src={selectedDriver.avatar} alt={selectedDriver.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-medium text-white">{selectedDriver.name}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getStatusColor(selectedDriver.status)}`}>
                        {selectedDriver.status.replace('-', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-white/50">{getRoleName(selectedDriver.role)}</p>
                    <p className="text-xs text-sky-400">{selectedDriver.assignedVehicle}</p>
                  </div>
                </div>

                {/* Licenses */}
                <div className="mb-4">
                  <p className="text-xs text-white/40 mb-2">Licenses</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedDriver.licenses.map((license, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 bg-sky-500/20 text-sky-400 rounded-full">
                        {license}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-sm text-white">{selectedDriver.rating}</span>
                  <span className="text-xs text-white/40">rating</span>
                </div>

                {/* Contact */}
                <div className="flex gap-2 mb-4">
                  <a
                    href={`tel:${selectedDriver.phone}`}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-white/70 hover:text-white transition-colors border border-white/10"
                  >
                    <Phone className="w-3 h-3" />
                    {t.staffManagement.common.call || 'Call'}
                  </a>
                  <a
                    href={`mailto:${selectedDriver.email}`}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-white/70 hover:text-white transition-colors border border-white/10"
                  >
                    <Mail className="w-3 h-3" />
                    {t.staffManagement.common.email || 'Email'}
                  </a>
                </div>

                {/* Today's Trips */}
                {(() => {
                  const todayTrips = getTripsForDate(selectedDriver, currentDate);
                  return todayTrips.length > 0 && (
                    <div>
                      <p className="text-xs text-white/40 mb-2">{t.staffManagement.common.todaySchedule || "Today's Schedule"}</p>
                      <div className="space-y-2">
                        {todayTrips.map((trip) => (
                          <div key={trip.id} className={`p-3 rounded-xl border ${getTripColor(trip.type)}`}>
                            {trip.type === 'off' ? (
                              <p className="text-sm">{t.staffManagement.common.dayOff}</p>
                            ) : (
                              <>
                                <div className="flex items-center gap-2 mb-1">
                                  {getTripIcon(trip.type)}
                                  <span className="text-sm font-medium">{getTripTypeName(trip.type)}</span>
                                </div>
                                <div className="flex items-center gap-2 mb-1">
                                  <Clock className="w-3 h-3 opacity-70" />
                                  <span className="text-xs opacity-70">{trip.startTime} - {trip.endTime}</span>
                                </div>
                                {trip.destination && (
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-3 h-3 opacity-70" />
                                    <span className="text-xs opacity-70">{trip.destination}</span>
                                  </div>
                                )}
                                {trip.guestName && (
                                  <p className="text-xs opacity-60 mt-1">{trip.guestName}</p>
                                )}
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Voice Chat */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl flex-1 overflow-hidden">
              <VoiceSessionChat
                agentId="drivers"
                sessionId="drivers-management"
                elevenLabsAgentId={process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID}
                title={t.staffManagement.drivers.title}
                subtitle={t.staffManagement.drivers.subtitle}
                avatar="/avatars/driver-avatar.jpg"
                welcomeMessage="I can help you manage transportation, schedule airport transfers, and coordinate ski resort shuttles."
                suggestions={[
                  "Available drivers now?",
                  "Airport pickups today?",
                  "Schedule ski shuttle"
                ]}
                contextData={driversContextData}
                variant="dark"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
