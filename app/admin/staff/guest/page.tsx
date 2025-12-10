'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Users, ChevronRight, LogOut, ChevronLeft, Calendar, Clock, MapPin, Phone, Mail, Star, Plus, Sparkles, Bell } from 'lucide-react';
import VoiceSessionChat from '../../../components/VoiceSessionChat';
import LanguageSelector from '../../../components/LanguageSelector';
import { useAuth } from '../../../hooks/useAuth';
import { useLanguageStore } from '@/lib/use-language-store';
import { translations as defaultTranslations } from '@/lib/translations';

// Types
interface Shift {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'morning' | 'afternoon' | 'evening' | 'night' | 'off';
  location?: string;
  notes?: string;
}

interface GuestStaff {
  id: string;
  name: string;
  role: 'frontDesk' | 'concierge' | 'butler' | 'bellhop' | 'guestRelations';
  avatar: string;
  phone: string;
  email: string;
  status: 'on-duty' | 'off-duty' | 'on-leave';
  rating: number;
  hireDate: string;
  languages: string[];
  assignedFloor?: string;
  shifts: Shift[];
}

type CalendarView = 'day' | 'week' | 'month';

// Mock guest services staff data
const mockGuestStaff: GuestStaff[] = [
  {
    id: 'g1',
    name: 'Akiko Hayashi',
    role: 'frontDesk',
    avatar: '/avatars/staff-1.jpg',
    phone: '+81-90-1111-2222',
    email: 'a.hayashi@1898niseko.com',
    status: 'on-duty',
    rating: 4.9,
    hireDate: '2021-04-01',
    languages: ['Japanese', 'English', 'Mandarin'],
    shifts: [
      { id: 's1', date: '2024-12-09', startTime: '07:00', endTime: '15:00', type: 'morning', location: 'Front Desk' },
      { id: 's2', date: '2024-12-10', startTime: '07:00', endTime: '15:00', type: 'morning', location: 'Front Desk' },
      { id: 's3', date: '2024-12-11', startTime: '15:00', endTime: '23:00', type: 'afternoon', location: 'Front Desk' },
      { id: 's4', date: '2024-12-12', startTime: '15:00', endTime: '23:00', type: 'afternoon', location: 'Front Desk' },
      { id: 's5', date: '2024-12-13', startTime: '00:00', endTime: '00:00', type: 'off' },
      { id: 's6', date: '2024-12-14', startTime: '07:00', endTime: '15:00', type: 'morning', location: 'Front Desk' },
      { id: 's7', date: '2024-12-15', startTime: '07:00', endTime: '15:00', type: 'morning', location: 'Front Desk' },
    ]
  },
  {
    id: 'g2',
    name: 'Ryo Nakamura',
    role: 'concierge',
    avatar: '/avatars/staff-2.jpg',
    phone: '+81-90-2222-3333',
    email: 'r.nakamura@1898niseko.com',
    status: 'on-duty',
    rating: 4.8,
    hireDate: '2020-11-15',
    languages: ['Japanese', 'English', 'French'],
    shifts: [
      { id: 's8', date: '2024-12-09', startTime: '08:00', endTime: '20:00', type: 'morning', location: 'Concierge Desk' },
      { id: 's9', date: '2024-12-10', startTime: '08:00', endTime: '20:00', type: 'morning', location: 'Concierge Desk' },
      { id: 's10', date: '2024-12-11', startTime: '00:00', endTime: '00:00', type: 'off' },
      { id: 's11', date: '2024-12-12', startTime: '08:00', endTime: '20:00', type: 'morning', location: 'Concierge Desk' },
      { id: 's12', date: '2024-12-13', startTime: '08:00', endTime: '20:00', type: 'morning', location: 'Concierge Desk' },
      { id: 's13', date: '2024-12-14', startTime: '00:00', endTime: '00:00', type: 'off' },
      { id: 's14', date: '2024-12-15', startTime: '08:00', endTime: '20:00', type: 'morning', location: 'Concierge Desk' },
    ]
  },
  {
    id: 'g3',
    name: 'Mei Watanabe',
    role: 'butler',
    avatar: '/avatars/staff-3.jpg',
    phone: '+81-90-3333-4444',
    email: 'm.watanabe@1898niseko.com',
    status: 'on-duty',
    rating: 4.9,
    hireDate: '2022-01-10',
    languages: ['Japanese', 'English'],
    assignedFloor: 'VIP Suite Floor',
    shifts: [
      { id: 's15', date: '2024-12-09', startTime: '06:00', endTime: '14:00', type: 'morning', location: 'VIP Suites' },
      { id: 's16', date: '2024-12-10', startTime: '14:00', endTime: '22:00', type: 'afternoon', location: 'VIP Suites' },
      { id: 's17', date: '2024-12-11', startTime: '06:00', endTime: '14:00', type: 'morning', location: 'VIP Suites' },
      { id: 's18', date: '2024-12-12', startTime: '00:00', endTime: '00:00', type: 'off' },
      { id: 's19', date: '2024-12-13', startTime: '14:00', endTime: '22:00', type: 'afternoon', location: 'VIP Suites' },
      { id: 's20', date: '2024-12-14', startTime: '06:00', endTime: '14:00', type: 'morning', location: 'VIP Suites' },
      { id: 's21', date: '2024-12-15', startTime: '00:00', endTime: '00:00', type: 'off' },
    ]
  },
  {
    id: 'g4',
    name: 'Kenji Suzuki',
    role: 'bellhop',
    avatar: '/avatars/staff-4.jpg',
    phone: '+81-90-4444-5555',
    email: 'k.suzuki@1898niseko.com',
    status: 'on-duty',
    rating: 4.6,
    hireDate: '2023-03-01',
    languages: ['Japanese', 'English'],
    shifts: [
      { id: 's22', date: '2024-12-09', startTime: '06:00', endTime: '14:00', type: 'morning', location: 'Lobby' },
      { id: 's23', date: '2024-12-10', startTime: '06:00', endTime: '14:00', type: 'morning', location: 'Lobby' },
      { id: 's24', date: '2024-12-11', startTime: '14:00', endTime: '22:00', type: 'afternoon', location: 'Lobby' },
      { id: 's25', date: '2024-12-12', startTime: '14:00', endTime: '22:00', type: 'afternoon', location: 'Lobby' },
      { id: 's26', date: '2024-12-13', startTime: '06:00', endTime: '14:00', type: 'morning', location: 'Lobby' },
      { id: 's27', date: '2024-12-14', startTime: '00:00', endTime: '00:00', type: 'off' },
      { id: 's28', date: '2024-12-15', startTime: '06:00', endTime: '14:00', type: 'morning', location: 'Lobby' },
    ]
  },
  {
    id: 'g5',
    name: 'Yumi Takahashi',
    role: 'guestRelations',
    avatar: '/avatars/staff-5.jpg',
    phone: '+81-90-5555-6666',
    email: 'y.takahashi@1898niseko.com',
    status: 'off-duty',
    rating: 4.7,
    hireDate: '2022-08-15',
    languages: ['Japanese', 'English', 'Korean'],
    shifts: [
      { id: 's29', date: '2024-12-09', startTime: '09:00', endTime: '17:00', type: 'morning', location: 'Guest Relations' },
      { id: 's30', date: '2024-12-10', startTime: '00:00', endTime: '00:00', type: 'off' },
      { id: 's31', date: '2024-12-11', startTime: '09:00', endTime: '17:00', type: 'morning', location: 'Guest Relations' },
      { id: 's32', date: '2024-12-12', startTime: '09:00', endTime: '17:00', type: 'morning', location: 'Guest Relations' },
      { id: 's33', date: '2024-12-13', startTime: '00:00', endTime: '00:00', type: 'off' },
      { id: 's34', date: '2024-12-14', startTime: '09:00', endTime: '17:00', type: 'morning', location: 'Guest Relations' },
      { id: 's35', date: '2024-12-15', startTime: '09:00', endTime: '17:00', type: 'morning', location: 'Guest Relations' },
    ]
  }
];

export default function GuestManagementPage() {
  const { isAuthenticated, logout } = useAuth();
  const { translations: storeTranslations, language } = useLanguageStore();
  const t = storeTranslations?.admin ? storeTranslations : defaultTranslations.en;
  const [mounted, setMounted] = useState(false);
  const [staffData, setStaffData] = useState<GuestStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState<GuestStaff | null>(null);
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
      setStaffData(mockGuestStaff);
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

  const getShiftForDate = (staff: GuestStaff, date: Date): Shift | undefined => {
    const dateKey = formatDateKey(date);
    return staff.shifts.find(s => s.date === dateKey);
  };

  const getShiftColor = (type: Shift['type']) => {
    switch (type) {
      case 'morning': return 'bg-sky-500/20 text-sky-400 border-sky-500/30';
      case 'afternoon': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'evening': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'night': return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
      case 'off': return 'bg-white/5 text-white/30 border-white/10';
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
  const totalStaff = staffData.length;
  const atFrontDesk = staffData.filter(s => s.role === 'frontDesk' && s.status === 'on-duty').length;
  const onFloor = staffData.filter(s => {
    const shift = getShiftForDate(s, currentDate);
    return shift && shift.type !== 'off';
  }).length;
  const offDuty = staffData.filter(s => s.status === 'off-duty').length;

  // Get role display name from translations
  const getRoleName = (role: GuestStaff['role']) => {
    return t.staffManagement.guest.roles[role] || role;
  };

  // Context data for voice agent
  const guestContextData = {
    department: 'guest-services',
    language,
    staff: staffData.map(s => ({
      id: s.id,
      name: s.name,
      role: getRoleName(s.role),
      status: s.status,
      languages: s.languages,
      assignedFloor: s.assignedFloor
    })),
    stats: {
      total: totalStaff,
      atFrontDesk,
      onFloor,
      offDuty
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

  const getStatusColor = (status: GuestStaff['status']) => {
    switch (status) {
      case 'on-duty': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'off-duty': return 'bg-white/10 text-white/50 border-white/20';
      case 'on-leave': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
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
            <span className="text-white/80">{t.staffManagement.guest.title}</span>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex gap-6 px-8 pb-6 min-h-0">
          {/* Left: Staff List & Calendar */}
          <div className="flex-1 min-w-0 flex flex-col">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl flex-1 flex flex-col min-h-0 overflow-hidden">
              {/* Header */}
              <div className="p-6 flex-shrink-0 border-b border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h2
                        className="text-3xl font-light text-white tracking-wide"
                        style={{ fontFamily: 'var(--font-cormorant)' }}
                      >
                        {t.staffManagement.guest.title}
                      </h2>
                      <p className="text-sm text-white/50 mt-1">{t.staffManagement.guest.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Add Staff Button */}
                    <button className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg border border-purple-500/30 transition-colors">
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
                <div className="grid grid-cols-4 gap-3">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-3.5 h-3.5 text-white/40" />
                      <span className="text-xs text-white/50">{t.staffManagement.guest.stats.totalStaff}</span>
                    </div>
                    <p className="text-xl font-light text-white">{totalStaff}</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2 mb-1">
                      <Bell className="w-3.5 h-3.5 text-purple-400" />
                      <span className="text-xs text-white/50">{t.staffManagement.guest.stats.atFrontDesk}</span>
                    </div>
                    <p className="text-xl font-light text-purple-400">{atFrontDesk}</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-xs text-white/50">{t.staffManagement.guest.stats.onFloor}</span>
                    </div>
                    <p className="text-xl font-light text-emerald-400">{onFloor}</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-3.5 h-3.5 text-white/40" />
                      <span className="text-xs text-white/50">{t.staffManagement.common.today}</span>
                    </div>
                    <p className="text-sm font-light text-white">{currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
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
                      <div className="text-xs text-white/40 py-2">{t.staffManagement.common.staff || 'Staff'}</div>
                      {weekDates.map((date, i) => (
                        <div key={i} className="text-center">
                          <p className="text-xs text-white/40">{dayNames[i]}</p>
                          <p className={`text-sm font-medium ${formatDateKey(date) === formatDateKey(currentDate) ? 'text-purple-400' : 'text-white/70'}`}>
                            {date.getDate()}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Staff Rows */}
                    {staffData.map((staff) => (
                      <div
                        key={staff.id}
                        className={`grid grid-cols-8 gap-2 mb-2 p-2 rounded-xl cursor-pointer transition-colors ${
                          selectedStaff?.id === staff.id ? 'bg-white/10' : 'hover:bg-white/5'
                        }`}
                        onClick={() => setSelectedStaff(selectedStaff?.id === staff.id ? null : staff)}
                      >
                        {/* Staff Info */}
                        <div className="flex items-center gap-2">
                          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-white/10 flex-shrink-0">
                            <Image src={staff.avatar} alt={staff.name} fill className="object-cover" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-white truncate">{staff.name}</p>
                            <p className="text-[10px] text-white/40 truncate">{getRoleName(staff.role)}</p>
                          </div>
                        </div>

                        {/* Shifts */}
                        {weekDates.map((date, i) => {
                          const shift = getShiftForDate(staff, date);
                          return (
                            <div key={i} className="flex items-center justify-center">
                              {shift ? (
                                <div className={`w-full py-1.5 px-1 rounded-lg text-center border ${getShiftColor(shift.type)}`}>
                                  <p className="text-[10px] font-medium">
                                    {shift.type === 'off' ? 'OFF' : `${shift.startTime.slice(0, 5)}`}
                                  </p>
                                  {shift.type !== 'off' && (
                                    <p className="text-[9px] opacity-70 truncate">{shift.location}</p>
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
                    {staffData.map((staff) => {
                      const shift = getShiftForDate(staff, currentDate);
                      return (
                        <div
                          key={staff.id}
                          className={`p-4 rounded-xl cursor-pointer transition-colors border ${
                            selectedStaff?.id === staff.id
                              ? 'bg-white/15 border-purple-400/50'
                              : 'bg-white/5 border-white/10 hover:bg-white/10'
                          }`}
                          onClick={() => setSelectedStaff(selectedStaff?.id === staff.id ? null : staff)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white/10">
                                <Image src={staff.avatar} alt={staff.name} fill className="object-cover" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white">{staff.name}</p>
                                <p className="text-xs text-white/50">{getRoleName(staff.role)}</p>
                              </div>
                            </div>
                            {shift && (
                              <div className={`px-3 py-1.5 rounded-lg border ${getShiftColor(shift.type)}`}>
                                <p className="text-xs font-medium">
                                  {shift.type === 'off' ? t.staffManagement.common.dayOff : `${shift.startTime} - ${shift.endTime}`}
                                </p>
                                {shift.location && <p className="text-[10px] opacity-70">{shift.location}</p>}
                              </div>
                            )}
                          </div>
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

          {/* Right: Staff Details & Voice Chat */}
          <div className="w-[400px] flex-shrink-0 flex flex-col min-h-0 gap-4">
            {/* Selected Staff Details */}
            {selectedStaff && (
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl p-5 flex-shrink-0">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative w-14 h-14 rounded-full overflow-hidden bg-white/10">
                    <Image src={selectedStaff.avatar} alt={selectedStaff.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-medium text-white">{selectedStaff.name}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getStatusColor(selectedStaff.status)}`}>
                        {selectedStaff.status.replace('-', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-white/50">{getRoleName(selectedStaff.role)}</p>
                    {selectedStaff.assignedFloor && (
                      <p className="text-xs text-purple-400">{selectedStaff.assignedFloor}</p>
                    )}
                  </div>
                </div>

                {/* Languages */}
                <div className="mb-4">
                  <p className="text-xs text-white/40 mb-2">Languages</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedStaff.languages.map((lang, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-sm text-white">{selectedStaff.rating}</span>
                  <span className="text-xs text-white/40">rating</span>
                </div>

                {/* Contact */}
                <div className="flex gap-2 mb-4">
                  <a
                    href={`tel:${selectedStaff.phone}`}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-white/70 hover:text-white transition-colors border border-white/10"
                  >
                    <Phone className="w-3 h-3" />
                    {t.staffManagement.common.call || 'Call'}
                  </a>
                  <a
                    href={`mailto:${selectedStaff.email}`}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-white/70 hover:text-white transition-colors border border-white/10"
                  >
                    <Mail className="w-3 h-3" />
                    {t.staffManagement.common.email || 'Email'}
                  </a>
                </div>

                {/* Today's Shift */}
                {(() => {
                  const todayShift = getShiftForDate(selectedStaff, currentDate);
                  return todayShift && (
                    <div>
                      <p className="text-xs text-white/40 mb-2">{t.staffManagement.common.todaySchedule || "Today's Schedule"}</p>
                      <div className={`p-3 rounded-xl border ${getShiftColor(todayShift.type)}`}>
                        {todayShift.type === 'off' ? (
                          <p className="text-sm">{t.staffManagement.common.dayOff}</p>
                        ) : (
                          <>
                            <div className="flex items-center gap-2 mb-1">
                              <Clock className="w-3 h-3" />
                              <span className="text-sm">{todayShift.startTime} - {todayShift.endTime}</span>
                            </div>
                            {todayShift.location && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-3 h-3 opacity-70" />
                                <span className="text-xs opacity-70">{todayShift.location}</span>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Voice Chat */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl flex-1 overflow-hidden">
              <VoiceSessionChat
                agentId="guest"
                sessionId="guest-management"
                elevenLabsAgentId={process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID}
                title={t.staffManagement.guest.title}
                subtitle={t.staffManagement.guest.subtitle}
                avatar="/avatars/concierge-avatar.jpg"
                welcomeMessage="I can help you manage guest services staff, coordinate front desk coverage, and check butler assignments."
                suggestions={[
                  "Who's at front desk now?",
                  "Show concierge schedule",
                  "Butler assignments today?"
                ]}
                contextData={guestContextData}
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
