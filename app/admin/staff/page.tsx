'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Users, ChevronRight, LogOut, ChevronLeft, Calendar, Clock, MapPin, Phone, Mail, Star } from 'lucide-react';
import VoiceSessionChat from '../../components/VoiceSessionChat';
import { useAuth } from '../../hooks/useAuth';

// Types
interface Shift {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  type: 'morning' | 'afternoon' | 'evening' | 'night' | 'off';
  location?: string;
  notes?: string;
}

interface StaffMember {
  id: string;
  name: string;
  role: string;
  department: string;
  avatar: string;
  phone: string;
  email: string;
  status: 'on-duty' | 'off-duty' | 'on-leave';
  rating: number;
  hireDate: string;
  shifts: Shift[];
}

type CalendarView = 'day' | 'week' | 'month';

export default function StaffPage() {
  const { isAuthenticated, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [staffData, setStaffData] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [calendarView, setCalendarView] = useState<CalendarView>('week');
  const [currentDate, setCurrentDate] = useState(new Date('2024-12-10')); // Mock current date

  // Navigation menu items
  const menuItems = [
    { label: 'Register', href: '/register' },
    { label: 'Staff Portal', href: '/admin', active: true },
    { label: 'Shop', href: '/shop' },
  ];

  useEffect(() => {
    if (isAuthenticated) {
      setMounted(true);
      fetchStaffData();
    }
  }, [isAuthenticated]);

  const fetchStaffData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/staff');
      const data: StaffMember[] = await response.json();
      setStaffData(data);
    } catch (error) {
      console.error('Error fetching staff data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate week dates
  const getWeekDates = (date: Date): Date[] => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
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

  // Get month dates (6 weeks grid)
  const getMonthDates = (date: Date): Date[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Monday start

    const dates: Date[] = [];
    const start = new Date(firstDay);
    start.setDate(start.getDate() - startDay);

    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const weekDates = getWeekDates(currentDate);
  const monthDates = getMonthDates(currentDate);

  // Format date for comparison
  const formatDateKey = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  // Get shift for a staff member on a specific date
  const getShiftForDate = (staff: StaffMember, date: Date): Shift | undefined => {
    const dateKey = formatDateKey(date);
    return staff.shifts.find(s => s.date === dateKey);
  };

  // Shift type colors
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
  const onDutyCount = staffData.filter(s => s.status === 'on-duty').length;
  const offDutyCount = staffData.filter(s => s.status === 'off-duty').length;

  // Context data for voice agent
  const staffContextData = {
    staff: staffData.map(s => ({
      id: s.id,
      name: s.name,
      role: s.role,
      department: s.department,
      status: s.status
    })),
    stats: {
      total: staffData.length,
      onDuty: onDutyCount,
      offDuty: offDutyCount
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

  if (staffData.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center">
        <div className="text-white/50 text-sm">No staff data found</div>
      </div>
    );
  }

  const getStatusColor = (status: StaffMember['status']) => {
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
            <span className="text-white/80">Staff Management</span>
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
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                      <Users className="w-6 h-6 text-white/60" />
                    </div>
                    <div>
                      <h2
                        className="text-3xl font-light text-white tracking-wide"
                        style={{ fontFamily: 'var(--font-cormorant)' }}
                      >
                        Staff Management
                      </h2>
                      <p className="text-sm text-white/50 mt-1">Schedules and assignments</p>
                    </div>
                  </div>

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

                {/* Stats Bar */}
                <div className="grid grid-cols-4 gap-3">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-3.5 h-3.5 text-white/40" />
                      <span className="text-xs text-white/50">Total Staff</span>
                    </div>
                    <p className="text-xl font-light text-white">{staffData.length}</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-xs text-white/50">On Duty</span>
                    </div>
                    <p className="text-xl font-light text-emerald-400">{onDutyCount}</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-white/30" />
                      <span className="text-xs text-white/50">Off Duty</span>
                    </div>
                    <p className="text-xl font-light text-white/60">{offDutyCount}</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-3.5 h-3.5 text-white/40" />
                      <span className="text-xs text-white/50">Today</span>
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

              {/* Calendar Content */}
              <div className="flex-1 overflow-y-auto min-h-0">
                {/* Week View */}
                {calendarView === 'week' && (
                  <div className="p-4">
                    {/* Day Headers */}
                    <div className="grid grid-cols-8 gap-2 mb-3">
                      <div className="text-xs text-white/40 py-2">Staff</div>
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
                            <p className="text-[10px] text-white/40 truncate">{staff.role}</p>
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
                                <p className="text-xs text-white/50">{staff.role}</p>
                              </div>
                            </div>
                            {shift && (
                              <div className={`px-3 py-1.5 rounded-lg border ${getShiftColor(shift.type)}`}>
                                <p className="text-xs font-medium">
                                  {shift.type === 'off' ? 'Day Off' : `${shift.startTime} - ${shift.endTime}`}
                                </p>
                                {shift.location && <p className="text-[10px] opacity-70">{shift.location}</p>}
                              </div>
                            )}
                          </div>
                          {shift?.notes && (
                            <p className="text-xs text-white/40 mt-2 pl-13">{shift.notes}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Month View */}
                {calendarView === 'month' && (
                  <div className="p-4">
                    {/* Day Headers */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {dayNames.map((day) => (
                        <div key={day} className="text-center text-xs text-white/40 py-2">
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1">
                      {monthDates.map((date, i) => {
                        const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                        const isToday = formatDateKey(date) === formatDateKey(new Date('2024-12-10'));
                        const staffOnDuty = staffData.filter(s => {
                          const shift = getShiftForDate(s, date);
                          return shift && shift.type !== 'off';
                        });

                        return (
                          <div
                            key={i}
                            className={`p-2 rounded-lg min-h-[60px] border ${
                              isCurrentMonth ? 'bg-white/5 border-white/10' : 'bg-white/[0.02] border-white/5'
                            } ${isToday ? 'ring-1 ring-amber-400/50' : ''}`}
                          >
                            <p className={`text-xs mb-1 ${isCurrentMonth ? 'text-white/70' : 'text-white/30'} ${isToday ? 'text-amber-400 font-medium' : ''}`}>
                              {date.getDate()}
                            </p>
                            {staffOnDuty.length > 0 && (
                              <div className="flex -space-x-1">
                                {staffOnDuty.slice(0, 3).map((s) => (
                                  <div key={s.id} className="relative w-5 h-5 rounded-full overflow-hidden border border-white/20">
                                    <Image src={s.avatar} alt={s.name} fill className="object-cover" />
                                  </div>
                                ))}
                                {staffOnDuty.length > 3 && (
                                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[8px] text-white">
                                    +{staffOnDuty.length - 3}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
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
                    <p className="text-sm text-white/50">{selectedStaff.role}</p>
                    <p className="text-xs text-white/40">{selectedStaff.department}</p>
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
                    Call
                  </a>
                  <a
                    href={`mailto:${selectedStaff.email}`}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-white/70 hover:text-white transition-colors border border-white/10"
                  >
                    <Mail className="w-3 h-3" />
                    Email
                  </a>
                </div>

                {/* Today's Shift */}
                {(() => {
                  const todayShift = getShiftForDate(selectedStaff, currentDate);
                  return todayShift && (
                    <div>
                      <p className="text-xs text-white/40 mb-2">Today&apos;s Schedule</p>
                      <div className={`p-3 rounded-xl border ${getShiftColor(todayShift.type)}`}>
                        {todayShift.type === 'off' ? (
                          <p className="text-sm">Day Off</p>
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
                            {todayShift.notes && (
                              <p className="text-xs opacity-60 mt-1">{todayShift.notes}</p>
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
                agentId="staff"
                sessionId="staff-management"
                elevenLabsAgentId={process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID}
                title="Staff Assistant"
                subtitle="AI Scheduler"
                avatar="/avatars/operations-avatar.jpg"
                welcomeMessage="I can help you manage staff schedules, check availability, and coordinate shifts. Ask me about any team member or scheduling needs."
                suggestions={[
                  "Who is on duty today?",
                  "Show me Yuki's schedule",
                  "Any staff on leave this week?"
                ]}
                contextData={staffContextData}
                variant="dark"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
