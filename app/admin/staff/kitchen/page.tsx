'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChefHat, ChevronRight, LogOut, ChevronLeft, Calendar, Clock, MapPin, Phone, Mail, Star, Plus, Utensils } from 'lucide-react';
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
  type: 'breakfast' | 'lunch' | 'dinner' | 'prep' | 'off';
  station?: string;
  notes?: string;
}

interface KitchenStaff {
  id: string;
  name: string;
  role: 'headChef' | 'sousChef' | 'lineCook' | 'pastryCook' | 'prepCook';
  avatar: string;
  phone: string;
  email: string;
  status: 'on-duty' | 'off-duty' | 'on-leave';
  rating: number;
  hireDate: string;
  specialties: string[];
  shifts: Shift[];
}

type CalendarView = 'day' | 'week' | 'month';

// Mock kitchen staff data
const mockKitchenStaff: KitchenStaff[] = [
  {
    id: 'k1',
    name: 'Kenji Tanaka',
    role: 'headChef',
    avatar: '/avatars/chef-1.jpg',
    phone: '+81-90-1234-5678',
    email: 'k.tanaka@1898niseko.com',
    status: 'on-duty',
    rating: 4.9,
    hireDate: '2021-03-15',
    specialties: ['Japanese Cuisine', 'French Techniques'],
    shifts: [
      { id: 's1', date: '2024-12-09', startTime: '06:00', endTime: '14:00', type: 'breakfast', station: 'Main Kitchen' },
      { id: 's2', date: '2024-12-10', startTime: '14:00', endTime: '22:00', type: 'dinner', station: 'Main Kitchen' },
      { id: 's3', date: '2024-12-11', startTime: '06:00', endTime: '14:00', type: 'breakfast', station: 'Main Kitchen' },
      { id: 's4', date: '2024-12-12', startTime: '14:00', endTime: '22:00', type: 'dinner', station: 'Main Kitchen' },
      { id: 's5', date: '2024-12-13', startTime: '00:00', endTime: '00:00', type: 'off' },
      { id: 's6', date: '2024-12-14', startTime: '06:00', endTime: '14:00', type: 'breakfast', station: 'Main Kitchen' },
      { id: 's7', date: '2024-12-15', startTime: '14:00', endTime: '22:00', type: 'dinner', station: 'Main Kitchen' },
    ]
  },
  {
    id: 'k2',
    name: 'Yuki Sato',
    role: 'sousChef',
    avatar: '/avatars/chef-2.jpg',
    phone: '+81-90-2345-6789',
    email: 'y.sato@1898niseko.com',
    status: 'on-duty',
    rating: 4.7,
    hireDate: '2022-06-01',
    specialties: ['Sushi', 'Seasonal Japanese'],
    shifts: [
      { id: 's8', date: '2024-12-09', startTime: '14:00', endTime: '22:00', type: 'dinner', station: 'Main Kitchen' },
      { id: 's9', date: '2024-12-10', startTime: '06:00', endTime: '14:00', type: 'breakfast', station: 'Main Kitchen' },
      { id: 's10', date: '2024-12-11', startTime: '14:00', endTime: '22:00', type: 'dinner', station: 'Main Kitchen' },
      { id: 's11', date: '2024-12-12', startTime: '06:00', endTime: '14:00', type: 'breakfast', station: 'Main Kitchen' },
      { id: 's12', date: '2024-12-13', startTime: '14:00', endTime: '22:00', type: 'dinner', station: 'Main Kitchen' },
      { id: 's13', date: '2024-12-14', startTime: '00:00', endTime: '00:00', type: 'off' },
      { id: 's14', date: '2024-12-15', startTime: '06:00', endTime: '14:00', type: 'breakfast', station: 'Main Kitchen' },
    ]
  },
  {
    id: 'k3',
    name: 'Hiroshi Yamamoto',
    role: 'lineCook',
    avatar: '/avatars/chef-3.jpg',
    phone: '+81-90-3456-7890',
    email: 'h.yamamoto@1898niseko.com',
    status: 'on-duty',
    rating: 4.5,
    hireDate: '2023-01-15',
    specialties: ['Grilling', 'Hot Station'],
    shifts: [
      { id: 's15', date: '2024-12-09', startTime: '10:00', endTime: '18:00', type: 'lunch', station: 'Hot Station' },
      { id: 's16', date: '2024-12-10', startTime: '10:00', endTime: '18:00', type: 'lunch', station: 'Hot Station' },
      { id: 's17', date: '2024-12-11', startTime: '14:00', endTime: '22:00', type: 'dinner', station: 'Hot Station' },
      { id: 's18', date: '2024-12-12', startTime: '00:00', endTime: '00:00', type: 'off' },
      { id: 's19', date: '2024-12-13', startTime: '10:00', endTime: '18:00', type: 'lunch', station: 'Hot Station' },
      { id: 's20', date: '2024-12-14', startTime: '14:00', endTime: '22:00', type: 'dinner', station: 'Hot Station' },
      { id: 's21', date: '2024-12-15', startTime: '10:00', endTime: '18:00', type: 'lunch', station: 'Hot Station' },
    ]
  },
  {
    id: 'k4',
    name: 'Sakura Kimura',
    role: 'pastryCook',
    avatar: '/avatars/chef-4.jpg',
    phone: '+81-90-4567-8901',
    email: 's.kimura@1898niseko.com',
    status: 'off-duty',
    rating: 4.8,
    hireDate: '2022-09-01',
    specialties: ['French Pastry', 'Japanese Wagashi'],
    shifts: [
      { id: 's22', date: '2024-12-09', startTime: '04:00', endTime: '12:00', type: 'prep', station: 'Pastry' },
      { id: 's23', date: '2024-12-10', startTime: '04:00', endTime: '12:00', type: 'prep', station: 'Pastry' },
      { id: 's24', date: '2024-12-11', startTime: '00:00', endTime: '00:00', type: 'off' },
      { id: 's25', date: '2024-12-12', startTime: '04:00', endTime: '12:00', type: 'prep', station: 'Pastry' },
      { id: 's26', date: '2024-12-13', startTime: '04:00', endTime: '12:00', type: 'prep', station: 'Pastry' },
      { id: 's27', date: '2024-12-14', startTime: '04:00', endTime: '12:00', type: 'prep', station: 'Pastry' },
      { id: 's28', date: '2024-12-15', startTime: '00:00', endTime: '00:00', type: 'off' },
    ]
  },
  {
    id: 'k5',
    name: 'Takumi Ito',
    role: 'prepCook',
    avatar: '/avatars/chef-5.jpg',
    phone: '+81-90-5678-9012',
    email: 't.ito@1898niseko.com',
    status: 'on-duty',
    rating: 4.3,
    hireDate: '2023-08-01',
    specialties: ['Prep Work', 'Vegetable Cutting'],
    shifts: [
      { id: 's29', date: '2024-12-09', startTime: '05:00', endTime: '13:00', type: 'prep', station: 'Prep Area' },
      { id: 's30', date: '2024-12-10', startTime: '05:00', endTime: '13:00', type: 'prep', station: 'Prep Area' },
      { id: 's31', date: '2024-12-11', startTime: '05:00', endTime: '13:00', type: 'prep', station: 'Prep Area' },
      { id: 's32', date: '2024-12-12', startTime: '05:00', endTime: '13:00', type: 'prep', station: 'Prep Area' },
      { id: 's33', date: '2024-12-13', startTime: '00:00', endTime: '00:00', type: 'off' },
      { id: 's34', date: '2024-12-14', startTime: '00:00', endTime: '00:00', type: 'off' },
      { id: 's35', date: '2024-12-15', startTime: '05:00', endTime: '13:00', type: 'prep', station: 'Prep Area' },
    ]
  }
];

export default function KitchenManagementPage() {
  const { isAuthenticated, logout } = useAuth();
  const { translations: storeTranslations, language } = useLanguageStore();
  const t = storeTranslations?.admin ? storeTranslations : defaultTranslations.en;
  const [mounted, setMounted] = useState(false);
  const [staffData, setStaffData] = useState<KitchenStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState<KitchenStaff | null>(null);
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
      // Using mock data for now
      setStaffData(mockKitchenStaff);
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

  const getShiftForDate = (staff: KitchenStaff, date: Date): Shift | undefined => {
    const dateKey = formatDateKey(date);
    return staff.shifts.find(s => s.date === dateKey);
  };

  const getShiftColor = (type: Shift['type']) => {
    switch (type) {
      case 'breakfast': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'lunch': return 'bg-sky-500/20 text-sky-400 border-sky-500/30';
      case 'dinner': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'prep': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
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
  const onDutyCount = staffData.filter(s => s.status === 'on-duty').length;
  const inKitchenCount = staffData.filter(s => {
    const shift = getShiftForDate(s, currentDate);
    return shift && shift.type !== 'off';
  }).length;
  const offDutyCount = staffData.filter(s => s.status === 'off-duty').length;

  // Get role display name from translations
  const getRoleName = (role: KitchenStaff['role']) => {
    return t.staffManagement.kitchen.roles[role] || role;
  };

  // Get shift type name from translations
  const getShiftName = (type: Shift['type']) => {
    if (type === 'off') return t.staffManagement.common.dayOff;
    return t.staffManagement.kitchen.shifts[type] || type;
  };

  // Context data for voice agent
  const kitchenContextData = {
    department: 'kitchen',
    language,
    staff: staffData.map(s => ({
      id: s.id,
      name: s.name,
      role: getRoleName(s.role),
      status: s.status,
      specialties: s.specialties
    })),
    stats: {
      total: staffData.length,
      onDuty: onDutyCount,
      inKitchen: inKitchenCount,
      offDuty: offDutyCount
    },
    currentDate: formatDateKey(currentDate)
  };

  if (isAuthenticated === null || loading) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center">
        <div className="text-white/50 text-sm">{t.staffManagement.common.loading || 'Loading...'}...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const getStatusColor = (status: KitchenStaff['status']) => {
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
            <span className="text-white/80">{t.staffManagement.kitchen.title}</span>
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
                    <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <ChefHat className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                      <h2
                        className="text-3xl font-light text-white tracking-wide"
                        style={{ fontFamily: 'var(--font-cormorant)' }}
                      >
                        {t.staffManagement.kitchen.title}
                      </h2>
                      <p className="text-sm text-white/50 mt-1">{t.staffManagement.kitchen.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Add Staff Button */}
                    <button className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-lg border border-amber-500/30 transition-colors">
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
                      <ChefHat className="w-3.5 h-3.5 text-white/40" />
                      <span className="text-xs text-white/50">{t.staffManagement.kitchen.stats.totalStaff}</span>
                    </div>
                    <p className="text-xl font-light text-white">{staffData.length}</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-xs text-white/50">{t.staffManagement.kitchen.stats.onDuty}</span>
                    </div>
                    <p className="text-xl font-light text-emerald-400">{onDutyCount}</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2 mb-1">
                      <Utensils className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-xs text-white/50">{t.staffManagement.kitchen.stats.inKitchen}</span>
                    </div>
                    <p className="text-xl font-light text-amber-400">{inKitchenCount}</p>
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
                          <p className={`text-sm font-medium ${formatDateKey(date) === formatDateKey(currentDate) ? 'text-amber-400' : 'text-white/70'}`}>
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
                                    {shift.type === 'off' ? 'OFF' : getShiftName(shift.type)}
                                  </p>
                                  {shift.type !== 'off' && (
                                    <p className="text-[9px] opacity-70 truncate">{shift.startTime.slice(0, 5)}</p>
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
                              ? 'bg-white/15 border-amber-400/50'
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
                                {shift.station && <p className="text-[10px] opacity-70">{shift.station}</p>}
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
                    <p>{t.staffManagement.common.monthView || 'Month view coming soon'}</p>
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
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedStaff.specialties.map((spec, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-sm text-white">{selectedStaff.rating}</span>
                  <span className="text-xs text-white/40">{t.staffManagement.common.rating || 'rating'}</span>
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
                            <div className="flex items-center gap-2 mb-1">
                              <Utensils className="w-3 h-3 opacity-70" />
                              <span className="text-xs opacity-70">{getShiftName(todayShift.type)}</span>
                            </div>
                            {todayShift.station && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-3 h-3 opacity-70" />
                                <span className="text-xs opacity-70">{todayShift.station}</span>
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
                agentId="kitchen"
                sessionId="kitchen-management"
                elevenLabsAgentId={process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID}
                title={t.staffManagement.kitchen.title}
                subtitle={t.staffManagement.kitchen.subtitle}
                avatar="/avatars/chef-avatar.jpg"
                welcomeMessage={t.voice?.kitchenWelcome || "I can help you manage kitchen schedules, coordinate meal service shifts, and check chef availability."}
                suggestions={[
                  t.voice?.kitchenSuggestion1 || "Who's working dinner service?",
                  t.voice?.kitchenSuggestion2 || "Show prep staff schedule",
                  t.voice?.kitchenSuggestion3 || "Any chefs on leave?"
                ]}
                contextData={kitchenContextData}
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
