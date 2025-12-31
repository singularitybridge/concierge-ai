'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';

// Dynamically import DriverMap to avoid SSR issues with Leaflet
const DriverMap = dynamic(() => import('../components/DriverMap'), {
  ssr: false,
  loading: () => (
    <div className="bg-slate-800 rounded-xl h-[400px] flex items-center justify-center">
      <div className="text-white/50 text-sm">Loading map...</div>
    </div>
  ),
});
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  BedDouble,
  Wrench,
  Car,
  Shield,
  Coffee,
  Sparkles,
  Bot,
  Send,
  X,
  ChevronRight,
  ChevronLeft,
  LogOut,
  RefreshCw,
  Filter,
  Search,
  Plus,
  MoreVertical,
  Phone,
  Mail,
  MapPin,
  Timer,
  Target,
  Award,
  Bell,
  ClipboardList,
  Briefcase,
  Utensils,
  Gem,
  ConciergeBell,
  Edit3,
  Save,
  Trash2,
  CalendarDays,
  Grid3X3,
  List,
  BrainCircuit,
  UserPlus,
  CheckCircle,
  Plane,
  Navigation,
  Fuel,
  Package,
  MessageSquare,
  Radio,
  Truck,
  Star,
  Route,
  CircleDot,
  PlayCircle,
  PauseCircle,
  StopCircle,
  Map,
  Locate,
  Home,
  Mic,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import VoiceSessionChat from '../components/VoiceSessionChat';
import Tooltip, { HotelTerms } from '../components/Tooltip';
import EmployeeAIInsights from '../components/EmployeeAIInsights';
import HousekeepingAIInsights from '../components/HousekeepingAIInsights';
import DriversAIInsights from '../components/DriversAIInsights';
import {
  useEmployeeManagementStore,
  Department,
  Employee,
  Task,
  TaskStatus,
  TaskPriority,
  Shift,
  ShiftType,
  HousekeepingRoom,
  HousekeepingAttendant,
  RoomCleaningStatus,
  RoomPriority,
  Vehicle,
  DriverTrip,
  DriverMessage,
  TransportationRequest,
  TripType,
  TripStatus,
  TripPriority,
  VehicleStatus,
} from '../store/employeeManagementStore';

function EmployeeManagementContent() {
  const { isAuthenticated, logout } = useAuth();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiMessages, setAiMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedEmployee, setEditedEmployee] = useState<Partial<Employee>>({});
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [shiftManagementOpen, setShiftManagementOpen] = useState(false);
  const [shiftManagementDept, setShiftManagementDept] = useState<Department | null>(null);
  const [shiftWeekOffset, setShiftWeekOffset] = useState(0);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [newShiftModal, setNewShiftModal] = useState(false);
  const [newShift, setNewShift] = useState<Partial<Shift>>({});

  const {
    employees,
    shifts,
    tasks,
    departmentMetrics,
    housekeepingMetrics,
    housekeepingRooms,
    housekeepingAttendants,
    aiInsights,
    timeOffRequests,
    selectedDepartment,
    selectedDate,
    setSelectedDepartment,
    updateTaskStatus,
    acknowledgeInsight,
    approveTimeOff,
    updateEmployee,
    addShift,
    updateShift,
    deleteShift,
    updateRoomStatus,
    assignRoomToAttendant,
    markRoomInspected,
    // Driver Management
    vehicles,
    driverTrips,
    driverMessages,
    transportationRequests,
    driverMetrics,
    assignDriverToTrip,
    updateTripStatus,
    addDriverTrip,
    updateDriverTrip,
    cancelTrip,
    sendDriverMessage,
    markMessageRead,
    updateVehicleStatus,
    convertRequestToTrip,
  } = useEmployeeManagementStore();

  // Housekeeping panel states
  const [selectedFloor, setSelectedFloor] = useState<number | 'all'>('all');
  const [roomStatusFilter, setRoomStatusFilter] = useState<RoomCleaningStatus | 'all'>('all');
  const [selectedRoom, setSelectedRoom] = useState<HousekeepingRoom | null>(null);
  const [housekeepingView, setHousekeepingView] = useState<'rooms' | 'attendants' | 'kpis'>('rooms');

  // Shift Management AI states
  const [shiftAiPanelOpen, setShiftAiPanelOpen] = useState(false);
  const [shiftAiQuestion, setShiftAiQuestion] = useState('');
  const [shiftAiMessages, setShiftAiMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);

  // Department Management Modal states
  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [deptModalDept, setDeptModalDept] = useState<Department | null>(null);
  const [deptModalView, setDeptModalView] = useState<'overview' | 'employees' | 'shifts' | 'tasks' | 'kpis' | 'operations'>('overview');
  const [deptAiQuestion, setDeptAiQuestion] = useState('');
  const [deptAiMessages, setDeptAiMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [deptSelectedEmployee, setDeptSelectedEmployee] = useState<Employee | null>(null);
  const [deptEditMode, setDeptEditMode] = useState(false);
  const [deptEditedEmployee, setDeptEditedEmployee] = useState<Partial<Employee>>({});
  const [deptEditingShift, setDeptEditingShift] = useState<Shift | null>(null);

  // Driver Management states
  const [driverView, setDriverView] = useState<'dispatch' | 'fleet' | 'shuttles' | 'deliveries' | 'messages' | 'analytics'>('dispatch');
  const [selectedTrip, setSelectedTrip] = useState<DriverTrip | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [driverMessage, setDriverMessage] = useState('');
  const [tripFilter, setTripFilter] = useState<TripType | 'all'>('all');
  const [tripStatusFilter, setTripStatusFilter] = useState<TripStatus | 'all'>('all');
  const [newTripModalOpen, setNewTripModalOpen] = useState(false);
  const [newTripData, setNewTripData] = useState<Partial<DriverTrip>>({
    type: 'airport_pickup',
    priority: 'normal',
    numberOfGuests: 1,
    isPaid: false,
    requestSource: 'front_desk',
    requestedBy: 'Front Desk',
  });
  const [assignDriverModal, setAssignDriverModal] = useState<{ tripId: string; currentDriverId?: string; currentVehicleId?: string } | null>(null);
  const [driverAiQuestion, setDriverAiQuestion] = useState('');
  const [driverAiMessages, setDriverAiMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [showDriverMap, setShowDriverMap] = useState(false);
  const [selectedMapDriver, setSelectedMapDriver] = useState<string | null>(null);

  const menuItems = [
    { label: 'Operations', href: '/operations' },
    { label: 'Front Office', href: '/front-office' },
    { label: 'Revenue BI', href: '/revenue-intelligence' },
    { label: 'Employees', href: '/employee-management', active: true },
    { label: 'Marketplace', href: '/marketplace' },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  // Department icons and colors
  const departmentConfig: Record<Department, { icon: React.ReactNode; color: string; label: string }> = {
    housekeeping: { icon: <BedDouble className="w-4 h-4" />, color: 'blue', label: 'Housekeeping' },
    front_desk: { icon: <ConciergeBell className="w-4 h-4" />, color: 'purple', label: 'Front Desk' },
    maintenance: { icon: <Wrench className="w-4 h-4" />, color: 'amber', label: 'Maintenance' },
    food_beverage: { icon: <Utensils className="w-4 h-4" />, color: 'emerald', label: 'F&B' },
    security: { icon: <Shield className="w-4 h-4" />, color: 'red', label: 'Security' },
    drivers: { icon: <Car className="w-4 h-4" />, color: 'cyan', label: 'Drivers' },
    concierge: { icon: <Briefcase className="w-4 h-4" />, color: 'pink', label: 'Concierge' },
    spa: { icon: <Gem className="w-4 h-4" />, color: 'violet', label: 'Spa' },
  };

  // Filter employees by department
  const filteredEmployees = employees.filter(e =>
    (selectedDepartment === 'all' || e.department === selectedDepartment) &&
    (searchQuery === '' || e.name.toLowerCase().includes(searchQuery.toLowerCase()) || e.role.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Calculate totals
  const totalOnDuty = employees.filter(e => e.status === 'on_duty').length;
  const totalOnBreak = employees.filter(e => e.status === 'on_break').length;
  const totalOffDuty = employees.filter(e => e.status === 'off_duty').length;
  const totalOnLeave = employees.filter(e => e.status === 'on_leave' || e.status === 'sick').length;

  // Get today's shifts
  const todayShifts = shifts.filter(s => s.date === selectedDate);

  // Priority colors
  const priorityColors: Record<TaskPriority, string> = {
    low: 'bg-slate-500/20 text-slate-300',
    medium: 'bg-blue-500/20 text-blue-300',
    high: 'bg-amber-500/20 text-amber-300',
    urgent: 'bg-red-500/20 text-red-300',
  };

  // Status colors
  const statusColors: Record<TaskStatus, string> = {
    pending: 'bg-slate-500/20 text-slate-300',
    in_progress: 'bg-blue-500/20 text-blue-300',
    completed: 'bg-emerald-500/20 text-emerald-300',
    cancelled: 'bg-red-500/20 text-red-300',
  };

  // Employee status colors
  const employeeStatusColors: Record<string, string> = {
    on_duty: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    on_break: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    off_duty: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    on_leave: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    sick: 'bg-red-500/20 text-red-300 border-red-500/30',
  };

  // Shift type config
  const shiftTypeConfig: Record<ShiftType, { label: string; color: string; time: string }> = {
    morning: { label: 'Morning', color: 'bg-blue-500', time: '06:00 - 14:00' },
    afternoon: { label: 'Afternoon', color: 'bg-amber-500', time: '14:00 - 22:00' },
    night: { label: 'Night', color: 'bg-purple-500', time: '22:00 - 06:00' },
    split: { label: 'Split', color: 'bg-cyan-500', time: 'Varies' },
  };

  // Room cleaning status config (Industry Standard)
  const roomStatusConfig: Record<RoomCleaningStatus, { label: string; color: string; bgColor: string; icon: string }> = {
    dirty: { label: 'Dirty', color: 'text-red-400', bgColor: 'bg-red-500/20', icon: '🔴' },
    in_progress: { label: 'Cleaning', color: 'text-amber-400', bgColor: 'bg-amber-500/20', icon: '🟡' },
    clean: { label: 'Clean', color: 'text-blue-400', bgColor: 'bg-blue-500/20', icon: '🔵' },
    inspected: { label: 'Inspected', color: 'text-emerald-400', bgColor: 'bg-emerald-500/20', icon: '✅' },
    out_of_order: { label: 'OOO', color: 'text-slate-400', bgColor: 'bg-slate-500/20', icon: '⚫' },
    do_not_disturb: { label: 'DND', color: 'text-purple-400', bgColor: 'bg-purple-500/20', icon: '🟣' },
  };

  // Room priority config
  const roomPriorityConfig: Record<RoomPriority, { label: string; color: string }> = {
    vip: { label: 'VIP', color: 'text-amber-400 bg-amber-500/20' },
    early_checkin: { label: 'Early C/I', color: 'text-orange-400 bg-orange-500/20' },
    checkout: { label: 'Checkout', color: 'text-blue-400 bg-blue-500/20' },
    stayover: { label: 'Stayover', color: 'text-cyan-400 bg-cyan-500/20' },
    normal: { label: 'Normal', color: 'text-slate-400 bg-slate-500/20' },
  };

  // Computed room statistics
  const roomStats = {
    dirty: housekeepingRooms.filter(r => r.cleaningStatus === 'dirty').length,
    inProgress: housekeepingRooms.filter(r => r.cleaningStatus === 'in_progress').length,
    clean: housekeepingRooms.filter(r => r.cleaningStatus === 'clean').length,
    inspected: housekeepingRooms.filter(r => r.cleaningStatus === 'inspected').length,
    outOfOrder: housekeepingRooms.filter(r => r.cleaningStatus === 'out_of_order').length,
    dnd: housekeepingRooms.filter(r => r.cleaningStatus === 'do_not_disturb').length,
    total: housekeepingRooms.length,
  };

  // Filtered rooms for display
  const filteredRooms = housekeepingRooms.filter(room => {
    const floorMatch = selectedFloor === 'all' || room.floor === selectedFloor;
    const statusMatch = roomStatusFilter === 'all' || room.cleaningStatus === roomStatusFilter;
    return floorMatch && statusMatch;
  });

  // Get week dates for shift management
  const getWeekDates = (offset: number) => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1 + offset * 7); // Monday

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates(shiftWeekOffset);
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Open shift management for a department
  const openShiftManagement = (dept: Department) => {
    setShiftManagementDept(dept);
    setShiftManagementOpen(true);
    setShiftWeekOffset(0);
    setShiftAiMessages([]); // Clear previous AI messages
    setShiftAiQuestion('');
  };

  // Get shifts for a specific department and date
  const getShiftsForDeptAndDate = (dept: Department, date: string) => {
    return shifts.filter(s => s.department === dept && s.date === date);
  };

  // Handle employee edit
  const handleStartEdit = () => {
    if (selectedEmployee) {
      setEditedEmployee({ ...selectedEmployee });
      setEditMode(true);
    }
  };

  const handleSaveEmployee = () => {
    if (selectedEmployee && editedEmployee) {
      updateEmployee(selectedEmployee.id, editedEmployee);
      setSelectedEmployee({ ...selectedEmployee, ...editedEmployee });
      setEditMode(false);
      setEditedEmployee({});
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditedEmployee({});
  };

  // Handle new shift
  const handleAddShift = () => {
    if (newShift.employeeId && newShift.date && newShift.shiftType && shiftManagementDept) {
      const employee = employees.find(e => e.id === newShift.employeeId);
      const shiftTimes: Record<ShiftType, { start: string; end: string }> = {
        morning: { start: '06:00', end: '14:00' },
        afternoon: { start: '14:00', end: '22:00' },
        night: { start: '22:00', end: '06:00' },
        split: { start: '06:00', end: '22:00' },
      };
      const times = shiftTimes[newShift.shiftType as ShiftType];

      addShift({
        employeeId: newShift.employeeId,
        date: newShift.date,
        shiftType: newShift.shiftType as ShiftType,
        startTime: times.start,
        endTime: times.end,
        department: shiftManagementDept,
        status: 'scheduled',
        notes: newShift.notes,
      });
      setNewShiftModal(false);
      setNewShift({});
    }
  };

  // Generate Shift AI Insights based on department data
  const getShiftAiInsights = (dept: Department) => {
    const deptEmployees = employees.filter(e => e.department === dept);
    const deptShifts = shifts.filter(s => s.department === dept && weekDates.some(d => d.toISOString().split('T')[0] === s.date));
    const morningShifts = deptShifts.filter(s => s.shiftType === 'morning').length;
    const afternoonShifts = deptShifts.filter(s => s.shiftType === 'afternoon').length;
    const nightShifts = deptShifts.filter(s => s.shiftType === 'night').length;
    const totalHours = deptShifts.length * 8;
    const avgShiftsPerEmployee = deptEmployees.length > 0 ? (deptShifts.length / deptEmployees.length).toFixed(1) : 0;
    const employeesWithOT = deptEmployees.filter(e => e.overtimeHours > 0);

    const insights = [];

    // Coverage analysis
    if (morningShifts < afternoonShifts * 0.7) {
      insights.push({
        type: 'warning',
        title: 'Morning Understaffed',
        message: `Only ${morningShifts} morning shifts vs ${afternoonShifts} afternoon. Consider rebalancing.`,
      });
    }

    if (nightShifts < 2) {
      insights.push({
        type: 'alert',
        title: 'Low Night Coverage',
        message: `Only ${nightShifts} night shifts scheduled. Minimum 2 recommended for safety.`,
      });
    }

    // Overtime alert
    if (employeesWithOT.length > 0) {
      insights.push({
        type: 'warning',
        title: 'Overtime Detected',
        message: `${employeesWithOT.length} employees have overtime (${employeesWithOT.reduce((sum, e) => sum + e.overtimeHours, 0)}h total).`,
      });
    }

    // Optimal staffing
    if (parseFloat(avgShiftsPerEmployee as string) > 5) {
      insights.push({
        type: 'alert',
        title: 'Heavy Workload',
        message: `Avg ${avgShiftsPerEmployee} shifts/employee. Consider hiring or redistributing.`,
      });
    } else if (parseFloat(avgShiftsPerEmployee as string) >= 4) {
      insights.push({
        type: 'success',
        title: 'Good Coverage',
        message: `Well balanced with ${avgShiftsPerEmployee} shifts per employee on average.`,
      });
    }

    // Weekend coverage
    const weekendShifts = deptShifts.filter(s => {
      const day = new Date(s.date).getDay();
      return day === 0 || day === 6;
    }).length;
    if (weekendShifts < deptEmployees.length * 0.3) {
      insights.push({
        type: 'info',
        title: 'Weekend Coverage',
        message: `Only ${weekendShifts} weekend shifts. May need more coverage for peak times.`,
      });
    }

    return insights.slice(0, 4);
  };

  // Shift AI Response generator
  const getShiftAiResponse = (question: string, dept: Department): string => {
    const q = question.toLowerCase();
    const deptEmployees = employees.filter(e => e.department === dept);
    const deptShifts = shifts.filter(s => s.department === dept && weekDates.some(d => d.toISOString().split('T')[0] === s.date));
    const deptName = departmentConfig[dept].label;

    if (q.includes('coverage') || q.includes('staffing') || q.includes('staff')) {
      const morningCount = deptShifts.filter(s => s.shiftType === 'morning').length;
      const afternoonCount = deptShifts.filter(s => s.shiftType === 'afternoon').length;
      const nightCount = deptShifts.filter(s => s.shiftType === 'night').length;
      return `${deptName} Coverage Analysis:\n• Morning shifts: ${morningCount}\n• Afternoon shifts: ${afternoonCount}\n• Night shifts: ${nightCount}\n• Total employees: ${deptEmployees.length}\n\nRecommendation: ${morningCount < afternoonCount ? 'Consider adding more morning coverage.' : 'Coverage looks balanced.'}`;
    }

    if (q.includes('overtime') || q.includes('ot') || q.includes('hours')) {
      const withOT = deptEmployees.filter(e => e.overtimeHours > 0);
      const totalOT = withOT.reduce((sum, e) => sum + e.overtimeHours, 0);
      return `Overtime Report for ${deptName}:\n• ${withOT.length} employees with overtime\n• Total OT hours: ${totalOT}h\n• Top OT: ${withOT[0]?.name || 'None'} (${withOT[0]?.overtimeHours || 0}h)\n\n${totalOT > 20 ? '⚠️ High overtime detected. Consider hiring or redistributing shifts.' : '✓ Overtime is within acceptable range.'}`;
    }

    if (q.includes('weekend') || q.includes('saturday') || q.includes('sunday')) {
      const weekendShifts = deptShifts.filter(s => {
        const day = new Date(s.date).getDay();
        return day === 0 || day === 6;
      });
      return `Weekend Schedule for ${deptName}:\n• ${weekendShifts.length} total weekend shifts\n• Saturday: ${weekendShifts.filter(s => new Date(s.date).getDay() === 6).length} shifts\n• Sunday: ${weekendShifts.filter(s => new Date(s.date).getDay() === 0).length} shifts\n\n${weekendShifts.length < 4 ? 'Consider adding more weekend coverage for peak guest traffic.' : 'Weekend coverage looks adequate.'}`;
    }

    if (q.includes('optimize') || q.includes('improve') || q.includes('recommend')) {
      return `Optimization Recommendations for ${deptName}:\n\n1. Balance shift distribution across employees\n2. Ensure minimum 2 staff per shift type\n3. Monitor overtime and redistribute if >10h/week\n4. Cross-train employees for flexibility\n5. Schedule senior staff during peak hours\n\nWould you like specific recommendations for any shift type?`;
    }

    if (q.includes('who') || q.includes('available') || q.includes('assign')) {
      const available = deptEmployees.filter(e => e.status === 'on_duty' || e.status === 'off_duty');
      return `Available Staff in ${deptName}:\n${available.slice(0, 5).map(e => `• ${e.name} (${e.role}) - ${e.hoursThisWeek}h this week`).join('\n')}\n\n${available.length > 5 ? `...and ${available.length - 5} more` : ''}`;
    }

    return `I can help you with ${deptName} shift management. Try asking about:\n• Coverage analysis\n• Overtime reports\n• Weekend scheduling\n• Optimization recommendations\n• Available staff\n\nWhat would you like to know?`;
  };

  // Handle Shift AI question
  const handleShiftAiQuestion = () => {
    if (!shiftAiQuestion.trim() || !shiftManagementDept) return;

    const userMessage = shiftAiQuestion.trim();
    setShiftAiMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setShiftAiQuestion('');

    setTimeout(() => {
      const response = getShiftAiResponse(userMessage, shiftManagementDept);
      setShiftAiMessages(prev => [...prev, { role: 'assistant', content: response }]);
    }, 500);
  };

  // Department-specific configurations
  const departmentFeatures: Record<Department, {
    kpis: { label: string; key: string; unit: string; target?: number }[];
    features: string[];
    faqs: { label: string; q: string }[];
    specialMetrics: () => { label: string; value: string | number; trend?: 'up' | 'down' | 'neutral'; color: string }[];
  }> = {
    housekeeping: {
      kpis: [
        { label: 'Rooms Cleaned', key: 'roomsCleaned', unit: 'rooms' },
        { label: 'Avg Clean Time', key: 'avgCleanTime', unit: 'min', target: 30 },
        { label: 'Quality Score', key: 'qualityScore', unit: '%', target: 95 },
        { label: 'Turnaround', key: 'turnaround', unit: 'min', target: 45 },
      ],
      features: ['Room Status Board', 'Linen Tracking', 'Quality Inspections', 'Deep Clean Schedule'],
      faqs: [
        { label: 'Room status', q: 'What is the current room cleaning status?' },
        { label: 'Quality scores', q: 'Show quality inspection scores' },
        { label: 'Supplies', q: 'What is the linen and supplies usage?' },
      ],
      specialMetrics: () => [
        { label: 'Rooms Ready', value: `${housekeepingMetrics.roomsCleanedToday}/${housekeepingMetrics.totalRooms}`, color: 'text-blue-400' },
        { label: 'Inspection Pass', value: `${housekeepingMetrics.inspectionPassRate}%`, trend: 'up', color: 'text-emerald-400' },
        { label: 'Re-cleans', value: housekeepingMetrics.reCleaningRequests, trend: 'down', color: 'text-amber-400' },
        { label: 'Guest Complaints', value: housekeepingMetrics.guestComplaints, color: 'text-red-400' },
      ],
    },
    front_desk: {
      kpis: [
        { label: 'Check-ins Today', key: 'checkins', unit: 'guests' },
        { label: 'Check-outs Today', key: 'checkouts', unit: 'guests' },
        { label: 'Avg Wait Time', key: 'waitTime', unit: 'min', target: 5 },
        { label: 'Guest Satisfaction', key: 'satisfaction', unit: '%', target: 90 },
      ],
      features: ['Guest Check-in/out', 'Room Assignments', 'Key Management', 'VIP Handling'],
      faqs: [
        { label: 'Arrivals today', q: 'How many arrivals are expected today?' },
        { label: 'VIP guests', q: 'Are there any VIP guests arriving?' },
        { label: 'Room availability', q: 'What is the current room availability?' },
      ],
      specialMetrics: () => [
        { label: 'Arrivals', value: Math.floor(15 + Math.random() * 10), color: 'text-blue-400' },
        { label: 'Departures', value: Math.floor(12 + Math.random() * 8), color: 'text-amber-400' },
        { label: 'In-house', value: Math.floor(35 + Math.random() * 10), color: 'text-emerald-400' },
        { label: 'VIP Today', value: Math.floor(2 + Math.random() * 3), color: 'text-purple-400' },
      ],
    },
    maintenance: {
      kpis: [
        { label: 'Open Work Orders', key: 'openOrders', unit: 'tickets' },
        { label: 'Avg Resolution', key: 'resolution', unit: 'hrs', target: 4 },
        { label: 'Preventive Done', key: 'preventive', unit: '%', target: 100 },
        { label: 'Emergency Response', key: 'emergency', unit: 'min', target: 15 },
      ],
      features: ['Work Order Management', 'Equipment Tracking', 'Preventive Maintenance', 'Vendor Coordination'],
      faqs: [
        { label: 'Open tickets', q: 'How many maintenance tickets are open?' },
        { label: 'Urgent issues', q: 'Are there any urgent maintenance issues?' },
        { label: 'Equipment status', q: 'What is the equipment status?' },
      ],
      specialMetrics: () => [
        { label: 'Open Orders', value: Math.floor(5 + Math.random() * 8), color: 'text-amber-400' },
        { label: 'Completed Today', value: Math.floor(8 + Math.random() * 5), trend: 'up', color: 'text-emerald-400' },
        { label: 'Urgent', value: Math.floor(Math.random() * 3), color: 'text-red-400' },
        { label: 'Avg Response', value: `${Math.floor(10 + Math.random() * 10)}min`, color: 'text-blue-400' },
      ],
    },
    food_beverage: {
      kpis: [
        { label: 'Covers Today', key: 'covers', unit: 'guests' },
        { label: 'Revenue', key: 'revenue', unit: '¥' },
        { label: 'Table Turn', key: 'tableTurn', unit: 'min', target: 60 },
        { label: 'Food Rating', key: 'rating', unit: '/5', target: 4.5 },
      ],
      features: ['Restaurant Management', 'Room Service', 'Bar Operations', 'Event Catering'],
      faqs: [
        { label: 'Today\'s bookings', q: 'How many restaurant reservations today?' },
        { label: 'Room service', q: 'What is the room service status?' },
        { label: 'Inventory', q: 'Any inventory alerts?' },
      ],
      specialMetrics: () => [
        { label: 'Breakfast', value: `${Math.floor(25 + Math.random() * 15)} covers`, color: 'text-amber-400' },
        { label: 'Lunch Res.', value: Math.floor(15 + Math.random() * 10), color: 'text-blue-400' },
        { label: 'Dinner Res.', value: Math.floor(20 + Math.random() * 15), color: 'text-purple-400' },
        { label: 'Room Service', value: `${Math.floor(5 + Math.random() * 5)} orders`, color: 'text-emerald-400' },
      ],
    },
    security: {
      kpis: [
        { label: 'Patrol Rounds', key: 'patrols', unit: 'rounds' },
        { label: 'Incidents', key: 'incidents', unit: 'reports' },
        { label: 'Response Time', key: 'response', unit: 'min', target: 3 },
        { label: 'Camera Coverage', key: 'cameras', unit: '%', target: 100 },
      ],
      features: ['Patrol Management', 'Incident Reporting', 'Access Control', 'CCTV Monitoring'],
      faqs: [
        { label: 'Patrol status', q: 'What is the current patrol status?' },
        { label: 'Incidents today', q: 'Any incidents reported today?' },
        { label: 'Access logs', q: 'Show recent access control logs' },
      ],
      specialMetrics: () => [
        { label: 'Patrols Done', value: `${Math.floor(8 + Math.random() * 4)}/12`, color: 'text-emerald-400' },
        { label: 'Incidents', value: Math.floor(Math.random() * 2), color: 'text-amber-400' },
        { label: 'Guards On', value: Math.floor(3 + Math.random() * 2), color: 'text-blue-400' },
        { label: 'Cameras OK', value: '98%', color: 'text-emerald-400' },
      ],
    },
    drivers: {
      kpis: [
        { label: 'Trips Today', key: 'trips', unit: 'trips' },
        { label: 'Km Driven', key: 'distance', unit: 'km' },
        { label: 'Fuel Used', key: 'fuel', unit: 'L' },
        { label: 'On-time Rate', key: 'ontime', unit: '%', target: 95 },
      ],
      features: ['Vehicle Management', 'Shuttle Schedule', 'Airport Transfers', 'Fuel Tracking'],
      faqs: [
        { label: 'Shuttle status', q: 'What is the shuttle schedule status?' },
        { label: 'Vehicle availability', q: 'Which vehicles are available?' },
        { label: 'Airport pickups', q: 'Any airport pickups scheduled?' },
      ],
      specialMetrics: () => [
        { label: 'Active Trips', value: Math.floor(1 + Math.random() * 3), color: 'text-blue-400' },
        { label: 'Vehicles Ready', value: `${Math.floor(3 + Math.random() * 2)}/5`, color: 'text-emerald-400' },
        { label: 'Next Shuttle', value: '14:30', color: 'text-amber-400' },
        { label: 'Airport Queue', value: Math.floor(2 + Math.random() * 3), color: 'text-purple-400' },
      ],
    },
    concierge: {
      kpis: [
        { label: 'Requests Today', key: 'requests', unit: 'requests' },
        { label: 'Bookings Made', key: 'bookings', unit: 'bookings' },
        { label: 'Response Time', key: 'response', unit: 'min', target: 5 },
        { label: 'Guest Rating', key: 'rating', unit: '/5', target: 4.8 },
      ],
      features: ['Guest Requests', 'Tour Bookings', 'Restaurant Reservations', 'Activity Planning'],
      faqs: [
        { label: 'Pending requests', q: 'What guest requests are pending?' },
        { label: 'Today\'s tours', q: 'Any tours scheduled today?' },
        { label: 'Reservations', q: 'Show restaurant reservation requests' },
      ],
      specialMetrics: () => [
        { label: 'Open Requests', value: Math.floor(3 + Math.random() * 5), color: 'text-amber-400' },
        { label: 'Tours Booked', value: Math.floor(2 + Math.random() * 4), color: 'text-blue-400' },
        { label: 'Dining Res.', value: Math.floor(5 + Math.random() * 5), color: 'text-purple-400' },
        { label: 'Completed', value: Math.floor(10 + Math.random() * 8), trend: 'up', color: 'text-emerald-400' },
      ],
    },
    spa: {
      kpis: [
        { label: 'Appointments', key: 'appointments', unit: 'bookings' },
        { label: 'Revenue', key: 'revenue', unit: '¥' },
        { label: 'Utilization', key: 'utilization', unit: '%', target: 80 },
        { label: 'Guest Rating', key: 'rating', unit: '/5', target: 4.7 },
      ],
      features: ['Appointment Booking', 'Therapist Schedule', 'Treatment Rooms', 'Product Inventory'],
      faqs: [
        { label: 'Today\'s bookings', q: 'How many spa appointments today?' },
        { label: 'Available slots', q: 'What spa slots are available?' },
        { label: 'Therapist status', q: 'Show therapist availability' },
      ],
      specialMetrics: () => [
        { label: 'Booked Today', value: Math.floor(8 + Math.random() * 6), color: 'text-purple-400' },
        { label: 'In Treatment', value: Math.floor(2 + Math.random() * 3), color: 'text-blue-400' },
        { label: 'Available', value: `${Math.floor(3 + Math.random() * 3)} slots`, color: 'text-emerald-400' },
        { label: 'Revenue', value: `¥${Math.floor(50 + Math.random() * 30)}K`, trend: 'up', color: 'text-amber-400' },
      ],
    },
  };

  // Open department management modal
  const openDeptModal = (dept: Department) => {
    setDeptModalDept(dept);
    setDeptModalOpen(true);
    setDeptModalView('overview');
    setDeptAiMessages([]);
    setDeptAiQuestion('');
    setDeptSelectedEmployee(null);
    setDeptEditMode(false);
    setDeptEditedEmployee({});
    setDeptEditingShift(null);
  };

  // Auto-open department modal from URL query parameter
  useEffect(() => {
    const deptParam = searchParams.get('dept');
    if (deptParam && mounted) {
      const validDepts: Department[] = ['housekeeping', 'front_desk', 'maintenance', 'food_beverage', 'security', 'drivers', 'concierge', 'spa'];
      if (validDepts.includes(deptParam as Department)) {
        openDeptModal(deptParam as Department);
      }
    }
  }, [searchParams, mounted]);

  // Department AI Response generator
  const getDeptAiResponse = (question: string, dept: Department): string => {
    const q = question.toLowerCase();
    const deptEmployees = employees.filter(e => e.department === dept);
    const deptTasks = tasks.filter(t => t.department === dept);
    const deptShifts = shifts.filter(s => s.department === dept);
    const deptName = departmentConfig[dept].label;
    const metrics = departmentMetrics.find(m => m.department === dept);
    const onDuty = deptEmployees.filter(e => e.status === 'on_duty');
    const pendingTasks = deptTasks.filter(t => t.status === 'pending');

    if (q.includes('status') || q.includes('overview') || q.includes('summary')) {
      return `${deptName} Status Summary:\n\n• Staff: ${onDuty.length}/${deptEmployees.length} on duty\n• Tasks: ${pendingTasks.length} pending, ${deptTasks.filter(t => t.status === 'completed').length} completed\n• Performance: ${metrics?.tasksPending || 0} pending items\n\n${onDuty.length < deptEmployees.length * 0.5 ? '⚠️ Understaffed - consider calling in additional staff' : '✓ Staffing levels adequate'}`;
    }

    if (q.includes('employee') || q.includes('staff') || q.includes('who')) {
      return `${deptName} Staff:\n\nOn Duty:\n${onDuty.slice(0, 5).map(e => `• ${e.name} - ${e.role}`).join('\n')}\n\nOff Duty:\n${deptEmployees.filter(e => e.status !== 'on_duty').slice(0, 3).map(e => `• ${e.name} (${e.status.replace('_', ' ')})`).join('\n')}`;
    }

    if (q.includes('task') || q.includes('pending') || q.includes('work')) {
      return `${deptName} Tasks:\n\nPending (${pendingTasks.length}):\n${pendingTasks.slice(0, 5).map(t => `• ${t.title} - ${t.priority} priority`).join('\n')}\n\nIn Progress:\n${deptTasks.filter(t => t.status === 'in_progress').slice(0, 3).map(t => `• ${t.title}`).join('\n') || '• None currently'}`;
    }

    if (q.includes('performance') || q.includes('metric') || q.includes('kpi')) {
      const specialMetrics = departmentFeatures[dept].specialMetrics();
      return `${deptName} Performance:\n\n${specialMetrics.map(m => `• ${m.label}: ${m.value}`).join('\n')}\n\nTrends: Overall performance is ${Math.random() > 0.5 ? 'improving' : 'stable'}.`;
    }

    if (q.includes('schedule') || q.includes('shift')) {
      const todayShifts = deptShifts.filter(s => s.date === new Date().toISOString().split('T')[0]);
      return `${deptName} Schedule:\n\nToday's Shifts:\n• Morning: ${todayShifts.filter(s => s.shiftType === 'morning').length} staff\n• Afternoon: ${todayShifts.filter(s => s.shiftType === 'afternoon').length} staff\n• Night: ${todayShifts.filter(s => s.shiftType === 'night').length} staff\n\nTotal scheduled this week: ${deptShifts.length} shifts`;
    }

    return `I can help with ${deptName} management. Ask about:\n• Status/overview\n• Staff/employees\n• Tasks/work orders\n• Performance/KPIs\n• Schedule/shifts`;
  };

  // Handle Department AI question
  const handleDeptAiQuestion = () => {
    if (!deptAiQuestion.trim() || !deptModalDept) return;

    const userMessage = deptAiQuestion.trim();
    setDeptAiMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setDeptAiQuestion('');

    setTimeout(() => {
      const response = getDeptAiResponse(userMessage, deptModalDept);
      setDeptAiMessages(prev => [...prev, { role: 'assistant', content: response }]);
    }, 500);
  };

  // Prepare driver locations for the map
  const getDriverLocationsForMap = () => {
    return employees
      .filter(e => e.department === 'drivers' && e.gpsLocation)
      .map(driver => {
        // Find if driver has an active trip
        const activeTrip = driverTrips.find(
          t => t.driverId === driver.id && ['assigned', 'en_route_pickup', 'guest_picked_up', 'in_progress'].includes(t.status)
        );
        // Find vehicle
        const vehicle = vehicles.find(v => v.currentDriverId === driver.id || v.id === driver.currentVehicleId);

        let status: 'available' | 'in_transit' | 'at_pickup' | 'at_dropoff' | 'offline' = 'offline';
        if (driver.status === 'on_duty') {
          if (!activeTrip) {
            status = 'available';
          } else if (activeTrip.status === 'en_route_pickup') {
            status = 'in_transit';
          } else if (activeTrip.status === 'guest_picked_up' || activeTrip.status === 'assigned') {
            status = 'at_pickup';
          } else if (activeTrip.status === 'in_progress') {
            status = 'in_transit';
          }
        }

        return {
          id: driver.id,
          name: driver.name,
          lat: driver.gpsLocation!.lat,
          lng: driver.gpsLocation!.lng,
          heading: driver.gpsLocation!.heading,
          speed: driver.gpsLocation!.speed,
          status,
          vehicleName: vehicle?.name,
          currentTrip: activeTrip?.guestName,
          lastUpdated: driver.gpsLocation!.lastUpdated,
        };
      });
  };

  // Get trip routes for map display
  const getTripRoutesForMap = () => {
    return driverTrips
      .filter(t => t.driverId && ['en_route_pickup', 'guest_picked_up', 'in_progress'].includes(t.status))
      .map(trip => ({
        driverId: trip.driverId!,
        pickup: trip.pickupCoords || { lat: 42.8048, lng: 140.6874 },
        dropoff: trip.dropoffCoords || { lat: 42.7752, lng: 141.6925 },
      }));
  };

  // Driver AI Insights generator based on current view
  const getDriverAiInsights = (): { title: string; insights: string[]; recommendations: string[] } => {
    const activeTrips = driverTrips.filter(t => ['en_route_pickup', 'guest_picked_up', 'in_progress'].includes(t.status));
    const pendingTrips = driverTrips.filter(t => t.status === 'pending');
    const availableDrivers = employees.filter(e => e.department === 'drivers' && e.status === 'on_duty');
    const availableVehicles = vehicles.filter(v => v.status === 'available');
    const airportTrips = driverTrips.filter(t => t.type === 'airport_pickup' || t.type === 'airport_dropoff');
    const deliveries = driverTrips.filter(t => t.type === 'delivery' || t.type === 'errand');

    switch (driverView) {
      case 'dispatch':
        return {
          title: 'Dispatch Insights',
          insights: [
            `${pendingTrips.length} trips awaiting assignment${pendingTrips.length > 3 ? ' - consider prioritizing' : ''}`,
            `${availableDrivers.length} drivers available, ${activeTrips.length} currently active`,
            `On-time rate today: ${driverMetrics.onTimeRate}%${driverMetrics.onTimeRate < 90 ? ' - below target' : ' - excellent'}`,
            pendingTrips.some(t => t.priority === 'vip') ? 'VIP trips pending - prioritize assignment!' : 'No VIP trips waiting',
          ],
          recommendations: [
            pendingTrips.length > availableDrivers.length ? 'Consider calling in additional drivers' : 'Driver availability is adequate',
            driverMetrics.avgWaitTime > 10 ? 'Reduce wait times by pre-positioning drivers' : 'Wait times are within target',
            activeTrips.length > 5 ? 'High activity - monitor for delays' : 'Activity level is manageable',
          ],
        };
      case 'fleet':
        const lowFuel = vehicles.filter(v => v.fuelLevel < 30);
        const maintenanceDue = vehicles.filter(v => new Date(v.nextMaintenanceDue) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
        return {
          title: 'Fleet Insights',
          insights: [
            `${availableVehicles.length}/${vehicles.length} vehicles available`,
            lowFuel.length > 0 ? `${lowFuel.length} vehicle(s) need refueling: ${lowFuel.map(v => v.name).join(', ')}` : 'All vehicles adequately fueled',
            maintenanceDue.length > 0 ? `${maintenanceDue.length} vehicle(s) due for maintenance soon` : 'No immediate maintenance required',
            `Average fleet mileage: ${Math.round(vehicles.reduce((s, v) => s + v.mileage, 0) / vehicles.length).toLocaleString()} km`,
          ],
          recommendations: [
            lowFuel.length > 0 ? `Refuel ${lowFuel[0]?.name} before next assignment` : 'Fuel levels are good',
            maintenanceDue.length > 0 ? 'Schedule maintenance to avoid disruptions' : 'Maintenance schedule is on track',
            vehicles.filter(v => v.status === 'maintenance').length > 1 ? 'Multiple vehicles in maintenance - ensure coverage' : 'Fleet availability is adequate',
          ],
        };
      case 'shuttles':
        const upcomingAirport = airportTrips.filter(t => t.status !== 'completed' && t.status !== 'cancelled');
        const delayedFlights = airportTrips.filter(t => t.flightStatus === 'delayed');
        return {
          title: 'Airport & Shuttle Insights',
          insights: [
            `${upcomingAirport.length} airport transfers scheduled`,
            delayedFlights.length > 0 ? `${delayedFlights.length} flight(s) delayed - adjust pickup times` : 'All flights on schedule',
            `${driverTrips.filter(t => t.type === 'shuttle').length} shuttle runs today`,
            `Peak airport time: Most pickups around ${airportTrips.length > 0 ? '14:00-16:00' : 'No data'}`,
          ],
          recommendations: [
            delayedFlights.length > 0 ? 'Monitor flight status and adjust ETAs accordingly' : 'Continue monitoring flight arrivals',
            upcomingAirport.filter(t => !t.driverId).length > 0 ? 'Assign drivers to unassigned airport transfers' : 'All airport transfers assigned',
            'Pre-position drivers near airport during peak hours',
          ],
        };
      case 'deliveries':
        const pendingDeliveries = deliveries.filter(t => t.status === 'pending');
        const urgentDeliveries = deliveries.filter(t => t.priority === 'urgent' || t.priority === 'priority');
        return {
          title: 'Delivery Insights',
          insights: [
            `${pendingDeliveries.length} deliveries pending`,
            `${deliveries.filter(t => t.status === 'completed').length} completed today`,
            urgentDeliveries.length > 0 ? `${urgentDeliveries.length} urgent/priority delivery(ies)` : 'No urgent deliveries',
            `Average delivery time: ${driverMetrics.avgTripDuration} minutes`,
          ],
          recommendations: [
            pendingDeliveries.length > 3 ? 'Consider batching deliveries by area' : 'Delivery queue is manageable',
            urgentDeliveries.length > 0 ? 'Prioritize urgent deliveries immediately' : 'Standard delivery priority applies',
            'Optimize routes for multiple deliveries',
          ],
        };
      default:
        return {
          title: 'Driver Operations Insights',
          insights: [
            `Total trips today: ${driverMetrics.totalTripsToday}`,
            `Guest satisfaction: ${driverMetrics.guestSatisfaction}/5.0`,
            `Revenue generated: ¥${driverMetrics.revenueToday.toLocaleString()}`,
          ],
          recommendations: ['Monitor key metrics', 'Maintain service quality', 'Optimize resource utilization'],
        };
    }
  };

  // Driver AI Response generator
  const getDriverAiResponse = (question: string): string => {
    const q = question.toLowerCase();
    const activeTrips = driverTrips.filter(t => ['en_route_pickup', 'guest_picked_up', 'in_progress'].includes(t.status));
    const pendingTrips = driverTrips.filter(t => t.status === 'pending');
    const availableDrivers = employees.filter(e => e.department === 'drivers' && e.status === 'on_duty');

    if (q.includes('available') || q.includes('driver') && q.includes('free')) {
      return `Available Drivers:\n\n${availableDrivers.map(d => `• ${d.name} - ${d.role}`).join('\n') || 'No drivers currently available'}\n\nTotal: ${availableDrivers.length} drivers ready for assignment.`;
    }
    if (q.includes('pending') || q.includes('unassigned') || q.includes('waiting')) {
      return `Pending Trips (${pendingTrips.length}):\n\n${pendingTrips.slice(0, 5).map(t => `• ${t.guestName} - ${t.type.replace(/_/g, ' ')} at ${new Date(t.scheduledTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`).join('\n') || 'No pending trips'}\n\n${pendingTrips.length > 5 ? `...and ${pendingTrips.length - 5} more` : ''}`;
    }
    if (q.includes('vehicle') || q.includes('car') || q.includes('fleet')) {
      const available = vehicles.filter(v => v.status === 'available');
      const inUse = vehicles.filter(v => v.status === 'in_use');
      return `Fleet Status:\n\n• Available: ${available.length} (${available.map(v => v.name).join(', ') || 'None'})\n• In Use: ${inUse.length}\n• Maintenance: ${vehicles.filter(v => v.status === 'maintenance').length}\n\nLow Fuel Alert: ${vehicles.filter(v => v.fuelLevel < 30).map(v => v.name).join(', ') || 'None'}`;
    }
    if (q.includes('airport') || q.includes('flight') || q.includes('pickup')) {
      const airportTrips = driverTrips.filter(t => (t.type === 'airport_pickup' || t.type === 'airport_dropoff') && t.status !== 'completed');
      return `Airport Transfers:\n\n${airportTrips.map(t => `• ${t.guestName} - ${t.type === 'airport_pickup' ? 'Pickup' : 'Dropoff'} at ${new Date(t.scheduledTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}${t.flightNumber ? ` (${t.flightNumber})` : ''} - ${t.driverName || 'Unassigned'}`).join('\n') || 'No airport transfers scheduled'}`;
    }
    if (q.includes('vip') || q.includes('priority')) {
      const vipTrips = driverTrips.filter(t => t.priority === 'vip' && t.status !== 'completed');
      return `VIP Trips:\n\n${vipTrips.map(t => `• ${t.guestName} (Room ${t.guestRoom || 'N/A'}) - ${t.type.replace(/_/g, ' ')}\n  ${t.specialRequests || 'No special requests'}`).join('\n\n') || 'No VIP trips currently scheduled'}`;
    }
    if (q.includes('performance') || q.includes('metric') || q.includes('stat')) {
      return `Today's Performance:\n\n• Completed Trips: ${driverMetrics.completedTripsToday}\n• On-Time Rate: ${driverMetrics.onTimeRate}%\n• Avg Wait Time: ${driverMetrics.avgWaitTime} min\n• Guest Satisfaction: ${driverMetrics.guestSatisfaction}/5.0\n• Revenue: ¥${driverMetrics.revenueToday.toLocaleString()}\n• Distance: ${Math.round(driverMetrics.totalDistanceToday)} km`;
    }
    if (q.includes('delivery') || q.includes('errand') || q.includes('package')) {
      const deliveries = driverTrips.filter(t => (t.type === 'delivery' || t.type === 'errand'));
      return `Deliveries & Errands:\n\n• Pending: ${deliveries.filter(t => t.status === 'pending').length}\n• In Progress: ${deliveries.filter(t => t.status === 'in_progress').length}\n• Completed: ${deliveries.filter(t => t.status === 'completed').length}\n\n${deliveries.filter(t => t.status === 'pending').slice(0, 3).map(t => `• ${t.deliveryItems?.slice(0, 40)}...`).join('\n') || ''}`;
    }
    return `I can help you with:\n• Driver availability and assignments\n• Trip status and scheduling\n• Vehicle fleet management\n• Airport transfers and shuttles\n• Delivery tracking\n• Performance metrics\n\nTry asking about specific topics like "available drivers", "pending trips", or "VIP bookings".`;
  };

  // Handle driver AI question
  const handleDriverAiQuestion = () => {
    if (!driverAiQuestion.trim()) return;
    const userMessage = driverAiQuestion;
    setDriverAiMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setDriverAiQuestion('');
    setTimeout(() => {
      const response = getDriverAiResponse(userMessage);
      setDriverAiMessages(prev => [...prev, { role: 'assistant', content: response }]);
    }, 500);
  };

  // Handle creating new trip
  const handleCreateTrip = () => {
    if (!newTripData.guestName || !newTripData.pickupLocation || !newTripData.dropoffLocation) return;
    addDriverTrip({
      ...newTripData,
      type: newTripData.type || 'airport_pickup',
      status: 'pending',
      priority: newTripData.priority || 'normal',
      numberOfGuests: newTripData.numberOfGuests || 1,
      pickupLocation: newTripData.pickupLocation || '',
      dropoffLocation: newTripData.dropoffLocation || '',
      scheduledTime: newTripData.scheduledTime || new Date().toISOString(),
      isPaid: false,
      requestedBy: 'Front Desk',
      requestSource: 'front_desk',
      createdAt: new Date().toISOString(),
    } as Omit<DriverTrip, 'id'>);
    setNewTripModalOpen(false);
    setNewTripData({
      type: 'airport_pickup',
      priority: 'normal',
      numberOfGuests: 1,
      isPaid: false,
      requestSource: 'front_desk',
      requestedBy: 'Front Desk',
    });
  };

  // Driver FAQ by view
  const getDriverFaqs = (): { label: string; q: string }[] => {
    switch (driverView) {
      case 'dispatch':
        return [
          { label: 'Available drivers', q: 'Which drivers are available right now?' },
          { label: 'Pending trips', q: 'What trips are waiting for assignment?' },
          { label: 'VIP bookings', q: 'Are there any VIP trips today?' },
          { label: 'Performance', q: 'How is our performance today?' },
        ];
      case 'fleet':
        return [
          { label: 'Vehicle status', q: 'What is the current fleet status?' },
          { label: 'Low fuel', q: 'Which vehicles need refueling?' },
          { label: 'Maintenance', q: 'Any vehicles due for maintenance?' },
          { label: 'Available cars', q: 'Which vehicles are available?' },
        ];
      case 'shuttles':
        return [
          { label: 'Airport pickups', q: 'What airport pickups are scheduled?' },
          { label: 'Flight delays', q: 'Are any flights delayed?' },
          { label: 'Shuttle schedule', q: 'What is the shuttle schedule?' },
          { label: 'Unassigned', q: 'Any unassigned airport transfers?' },
        ];
      case 'deliveries':
        return [
          { label: 'Pending deliveries', q: 'What deliveries are pending?' },
          { label: 'Urgent tasks', q: 'Any urgent deliveries?' },
          { label: 'Completed', q: 'How many deliveries completed today?' },
          { label: 'In progress', q: 'What deliveries are in progress?' },
        ];
      default:
        return [
          { label: 'Overview', q: 'Give me an overview of driver operations' },
          { label: 'Metrics', q: 'What are today\'s performance metrics?' },
        ];
    }
  };

  // AI Response generator
  const getAiResponse = (question: string): string => {
    const q = question.toLowerCase();

    if (q.includes('understaffed') || q.includes('staffing') || q.includes('coverage')) {
      const understaffedDepts = departmentMetrics.filter(d => d.onDuty < d.totalStaff * 0.4);
      return `Staffing Analysis:

Current Coverage:
${departmentMetrics.map(d => `• ${departmentConfig[d.department].label}: ${d.onDuty}/${d.totalStaff} on duty (${Math.round(d.onDuty / d.totalStaff * 100)}%)`).join('\n')}

${understaffedDepts.length > 0 ? `
Departments Needing Attention:
${understaffedDepts.map(d => `• ${departmentConfig[d.department].label}: Only ${d.onDuty} staff available with ${d.tasksPending} pending tasks`).join('\n')}

Recommendations:
1. Call in additional staff for ${understaffedDepts[0] ? departmentConfig[understaffedDepts[0].department].label : 'understaffed departments'}
2. Consider cross-training staff for flexibility
3. Review scheduling to ensure adequate coverage` : 'All departments have adequate staffing levels.'}`;
    }

    if (q.includes('housekeeping') || q.includes('cleaning') || q.includes('rooms')) {
      return `Housekeeping Performance:

Today's Progress:
• Rooms Cleaned: ${housekeepingMetrics.roomsCleanedToday}
• Rooms Remaining: ${housekeepingMetrics.roomsRemaining}
• Completion Rate: ${Math.round(housekeepingMetrics.roomsCleanedToday / (housekeepingMetrics.roomsCleanedToday + housekeepingMetrics.roomsRemaining) * 100)}%

Efficiency Metrics:
• Avg Cleaning Time: ${housekeepingMetrics.avgCleaningTime} min (Target: ${housekeepingMetrics.targetCleaningTime} min)
• Turnaround Time: ${housekeepingMetrics.turnaroundTime} min
• Quality Score: ${housekeepingMetrics.qualityScore}%

${housekeepingMetrics.avgCleaningTime > housekeepingMetrics.targetCleaningTime ?
`Recommendations:
1. Review cleaning procedures - current time exceeds target by ${housekeepingMetrics.avgCleaningTime - housekeepingMetrics.targetCleaningTime} min
2. Identify bottlenecks in high-traffic rooms
3. Consider paired cleaning for larger suites` :
`Performance Status: Excellent - cleaning time is within target`}`;
    }

    if (q.includes('overtime') || q.includes('hours') || q.includes('labor cost')) {
      const totalOvertime = departmentMetrics.reduce((sum, d) => sum + d.overtimeHours, 0);
      const totalLaborCost = departmentMetrics.reduce((sum, d) => sum + d.laborCost, 0);
      const highOvertimeDepts = departmentMetrics.filter(d => d.overtimeHours > 10);

      return `Labor & Overtime Analysis:

Total Overtime This Week: ${totalOvertime} hours
Estimated Overtime Cost: ¥${(totalOvertime * 2500).toLocaleString()}
Total Daily Labor Cost: ¥${totalLaborCost.toLocaleString()}

By Department:
${departmentMetrics.map(d => `• ${departmentConfig[d.department].label}: ${d.overtimeHours}h OT (¥${d.laborCost.toLocaleString()}/day)`).join('\n')}

${highOvertimeDepts.length > 0 ? `
High Overtime Alert:
${highOvertimeDepts.map(d => `• ${departmentConfig[d.department].label}: ${d.overtimeHours}h - review scheduling`).join('\n')}

Recommendations:
1. Hire temporary staff for ${highOvertimeDepts[0] ? departmentConfig[highOvertimeDepts[0].department].label : 'high-overtime departments'}
2. Implement shift swapping to balance workload
3. Review task allocation efficiency` : 'Overtime levels are within acceptable range.'}`;
    }

    if (q.includes('performance') || q.includes('top performer') || q.includes('best')) {
      const topPerformers = [...employees].sort((a, b) => b.performanceScore - a.performanceScore).slice(0, 5);
      const lowPerformers = [...employees].sort((a, b) => a.performanceScore - b.performanceScore).slice(0, 3);

      return `Performance Analysis:

Top Performers:
${topPerformers.map((e, i) => `${i + 1}. ${e.name} (${departmentConfig[e.department].label}) - Score: ${e.performanceScore}%`).join('\n')}

Needs Improvement:
${lowPerformers.map(e => `• ${e.name} (${departmentConfig[e.department].label}) - Score: ${e.performanceScore}%`).join('\n')}

Recommendations:
1. Recognize top performers with incentives
2. Provide additional training for underperformers
3. Consider ${topPerformers[0].name} for team lead position
4. Pair low performers with mentors`;
    }

    if (q.includes('task') || q.includes('pending') || q.includes('workload')) {
      const pendingTasks = tasks.filter(t => t.status === 'pending');
      const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
      const urgentTasks = tasks.filter(t => t.priority === 'urgent' && t.status !== 'completed');

      return `Task Overview:

Current Status:
• Pending: ${pendingTasks.length} tasks
• In Progress: ${inProgressTasks.length} tasks
• Completed Today: ${tasks.filter(t => t.status === 'completed').length} tasks

${urgentTasks.length > 0 ? `
Urgent Tasks Requiring Attention:
${urgentTasks.map(t => `• ${t.title} (${departmentConfig[t.department].label})`).join('\n')}
` : ''}
By Department:
${departmentMetrics.map(d => `• ${departmentConfig[d.department].label}: ${d.tasksPending} pending, ${d.tasksCompleted} completed`).join('\n')}

Recommendations:
1. ${urgentTasks.length > 0 ? `Prioritize ${urgentTasks[0].title}` : 'All urgent tasks completed'}
2. Balance workload across available staff
3. Review task estimation accuracy`;
    }

    if (q.includes('schedule') || q.includes('shift') || q.includes('tomorrow')) {
      const tomorrowDate = new Date();
      tomorrowDate.setDate(tomorrowDate.getDate() + 1);
      const tomorrowShifts = shifts.filter(s => s.date === tomorrowDate.toISOString().split('T')[0]);

      return `Schedule Overview:

Today's Shifts: ${todayShifts.length} scheduled
• Morning (6AM-2PM): ${todayShifts.filter(s => s.shiftType === 'morning').length} staff
• Afternoon (2PM-10PM): ${todayShifts.filter(s => s.shiftType === 'afternoon').length} staff
• Night (10PM-6AM): ${todayShifts.filter(s => s.shiftType === 'night').length} staff

Tomorrow's Coverage: ${tomorrowShifts.length} shifts scheduled

Time Off Pending: ${timeOffRequests.filter(r => r.status === 'pending').length} requests
${timeOffRequests.filter(r => r.status === 'pending').slice(0, 3).map(r => `• ${r.employeeName}: ${r.startDate} to ${r.endDate}`).join('\n')}

Recommendations:
1. Review pending time-off requests
2. Ensure weekend coverage is adequate
3. Plan for holiday staffing needs`;
    }

    // Default response
    return `Employee Management Summary:

Staff Overview:
• Total Employees: ${employees.length}
• On Duty: ${totalOnDuty}
• On Break: ${totalOnBreak}
• On Leave: ${totalOnLeave}

Today's Operations:
• Tasks Pending: ${tasks.filter(t => t.status === 'pending').length}
• Tasks In Progress: ${tasks.filter(t => t.status === 'in_progress').length}
• Rooms Cleaned: ${housekeepingMetrics.roomsCleanedToday}/${housekeepingMetrics.roomsCleanedToday + housekeepingMetrics.roomsRemaining}

Active Alerts: ${aiInsights.filter(i => !i.acknowledged).length}

Ask me about:
• "Staffing coverage" - Department coverage analysis
• "Housekeeping performance" - Cleaning metrics
• "Overtime analysis" - Labor costs
• "Top performers" - Performance rankings
• "Pending tasks" - Task workload`;
  };

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
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-indigo-900/80" />

      {/* Content */}
      <div className={`relative z-10 h-screen flex flex-col transition-opacity duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>

        {/* Top Navigation */}
        <nav className="flex items-center justify-between px-6 py-3 flex-shrink-0 border-b border-white/10 bg-black/20 backdrop-blur-xl pr-[400px]">
          {/* Left - Breadcrumbs */}
          <div className="flex items-center gap-4">
            {/* Home Button */}
            <Link
              href="/"
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition-all group"
              title="Back to Main Menu"
            >
              <Home className="w-5 h-5 text-white/70 group-hover:text-blue-400 transition-colors" />
            </Link>

            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm">
              <Link href="/" className="text-white/50 hover:text-white transition-colors">Home</Link>
              <ChevronRight className="w-4 h-4 text-white/30" />
              <span className="text-blue-400 font-medium">Employee Management</span>
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
                    ? 'bg-blue-500/20 text-blue-300 font-medium'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <RefreshCw className="w-4 h-4 text-white/60" />
            </button>
            <button onClick={logout} className="p-2 hover:bg-white/10 rounded-lg">
              <LogOut className="w-4 h-4 text-white/60" />
            </button>
          </div>
        </nav>

        {/* Main Dashboard */}
        <div className="flex-1 overflow-y-auto p-4 pr-[400px]">
          <div className="space-y-4">

            {/* AI Alerts Banner */}
            {aiInsights.filter(i => !i.acknowledged && i.priority === 'high').length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {aiInsights.filter(i => !i.acknowledged && i.priority === 'high').map(insight => (
                  <div
                    key={insight.id}
                    className="flex items-center gap-3 px-4 py-2 rounded-lg border backdrop-blur-xl flex-shrink-0 bg-amber-500/20 border-amber-500/30"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white">{insight.title}</p>
                      <p className="text-[10px] text-white/60 truncate">{insight.message}</p>
                    </div>
                    <button
                      onClick={() => acknowledgeInsight(insight.id)}
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                    >
                      <X className="w-3 h-3 text-white/50" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* AI Staff Insights */}
            <EmployeeAIInsights
              departmentMetrics={departmentMetrics}
              timeOffRequests={timeOffRequests}
              totalEmployees={employees.length}
              totalOnDuty={totalOnDuty}
              totalOnBreak={totalOnBreak}
              totalOnLeave={totalOnLeave}
              totalTasks={tasks.length}
              completedTasks={tasks.filter(t => t.status === 'completed').length}
              pendingTasks={tasks.filter(t => t.status === 'pending').length}
              urgentTasks={tasks.filter(t => t.priority === 'urgent' && t.status !== 'completed').length}
            />

            {/* Top Row - Staff Overview Cards */}
            <div className="grid grid-cols-5 gap-3">
              {/* Total Staff */}
              <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white/50">Total Staff</span>
                  <Users className="w-4 h-4 text-indigo-400" />
                </div>
                <p className="text-2xl font-bold text-white">{employees.length}</p>
                <p className="text-[10px] text-white/40 mt-1">{departmentMetrics.length} departments</p>
              </div>

              {/* On Duty */}
              <div className="bg-gradient-to-br from-emerald-600/30 to-teal-600/30 backdrop-blur-xl rounded-xl border border-emerald-500/30 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white/50">On Duty</span>
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-2xl font-bold text-emerald-400">{totalOnDuty}</p>
                <p className="text-[10px] text-white/40 mt-1">{Math.round(totalOnDuty / employees.length * 100)}% of staff</p>
              </div>

              {/* On Break */}
              <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white/50">On Break</span>
                  <Coffee className="w-4 h-4 text-amber-400" />
                </div>
                <p className="text-2xl font-bold text-white">{totalOnBreak}</p>
                <p className="text-[10px] text-white/40 mt-1">Returning soon</p>
              </div>

              {/* Off Duty */}
              <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white/50">Off Duty</span>
                  <UserX className="w-4 h-4 text-slate-400" />
                </div>
                <p className="text-2xl font-bold text-white">{totalOffDuty}</p>
                <p className="text-[10px] text-white/40 mt-1">Not scheduled</p>
              </div>

              {/* On Leave */}
              <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white/50">On Leave</span>
                  <Calendar className="w-4 h-4 text-purple-400" />
                </div>
                <p className="text-2xl font-bold text-white">{totalOnLeave}</p>
                <p className="text-[10px] text-white/40 mt-1">{timeOffRequests.filter(r => r.status === 'pending').length} pending requests</p>
              </div>
            </div>

            {/* Second Row - Department Overview */}
            <div className="grid grid-cols-12 gap-4">
              {/* Department Overview */}
              <div className="col-span-12 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-white">Department Overview</h3>
                  <div className="flex items-center gap-2 relative z-10">
                    <select
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value as Department | 'all')}
                      className="bg-slate-800 border border-white/20 rounded-lg px-2 py-1 text-xs text-white cursor-pointer appearance-none pr-6"
                    >
                      <option value="all">All Departments</option>
                      <option value="housekeeping">Housekeeping</option>
                      <option value="front_desk">Front Desk</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="food_beverage">Food & Beverage</option>
                      <option value="security">Security</option>
                      <option value="drivers">Drivers</option>
                      <option value="concierge">Concierge</option>
                      <option value="spa">Spa & Wellness</option>
                    </select>
                    <ChevronRight className="w-3 h-3 text-white/40 absolute right-1.5 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {departmentMetrics.map(dept => (
                    <div
                      key={dept.department}
                      className={`rounded-lg p-3 border transition-all ${
                        selectedDepartment === dept.department
                          ? 'bg-indigo-500/20 border-indigo-500/40'
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div
                        className="cursor-pointer"
                        onClick={() => openDeptModal(dept.department)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-${departmentConfig[dept.department].color}-400`}>
                            {departmentConfig[dept.department].icon}
                          </span>
                          <span className="text-[10px] text-white/40">{dept.onDuty}/{dept.totalStaff}</span>
                        </div>
                        <p className="text-xs font-medium text-white truncate">{departmentConfig[dept.department].label}</p>
                        <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-${departmentConfig[dept.department].color}-500 rounded-full`}
                            style={{ width: `${(dept.onDuty / dept.totalStaff) * 100}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between mt-2 text-[9px]">
                          <span className="text-emerald-400">{dept.tasksCompleted} done</span>
                          <span className="text-amber-400">{dept.tasksPending} pending</span>
                        </div>
                      </div>
                      <button
                        onClick={() => openShiftManagement(dept.department)}
                        className="w-full mt-2 px-2 py-1 text-[9px] bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded border border-white/10 transition-colors flex items-center justify-center gap-1"
                      >
                        <CalendarDays className="w-3 h-3" />
                        Manage Shifts
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Third Row - Task Management & Staff List */}
            <div className="grid grid-cols-12 gap-4">
              {/* Active Tasks */}
              <div className="col-span-5 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-white">Active Tasks</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-white/40">{tasks.filter(t => t.status !== 'completed').length} active</span>
                    <ClipboardList className="w-4 h-4 text-white/40" />
                  </div>
                </div>
                <div className="space-y-2 max-h-[280px] overflow-y-auto">
                  {tasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled').slice(0, 8).map(task => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      <div className={`w-2 h-2 rounded-full ${
                        task.priority === 'urgent' ? 'bg-red-500' :
                        task.priority === 'high' ? 'bg-amber-500' :
                        task.priority === 'medium' ? 'bg-blue-500' : 'bg-slate-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white truncate">{task.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[9px] text-white/40">{departmentConfig[task.department].label}</span>
                          {task.roomNumber && (
                            <span className="text-[9px] text-white/40">Room {task.roomNumber}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] ${statusColors[task.status]}`}>
                          {task.status.replace('_', ' ')}
                        </span>
                        {task.status === 'pending' && (
                          <button
                            onClick={() => updateTaskStatus(task.id, 'in_progress')}
                            className="p-1 hover:bg-white/10 rounded transition-colors"
                            title="Start task"
                          >
                            <ChevronRight className="w-3 h-3 text-white/50" />
                          </button>
                        )}
                        {task.status === 'in_progress' && (
                          <button
                            onClick={() => updateTaskStatus(task.id, 'completed')}
                            className="p-1 hover:bg-emerald-500/20 rounded transition-colors"
                            title="Complete task"
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Staff Directory */}
              <div className="col-span-7 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-white">Staff Directory</h3>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-white/40" />
                      <input
                        type="text"
                        placeholder="Search staff..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-7 pr-3 py-1 bg-white/10 border border-white/20 rounded-lg text-xs text-white placeholder-white/30 w-40"
                      />
                    </div>
                    <div className="flex items-center bg-white/5 rounded-lg border border-white/10 p-0.5">
                      <button
                        onClick={() => setViewMode('cards')}
                        className={`p-1.5 rounded transition-colors ${viewMode === 'cards' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'}`}
                        title="Card View"
                      >
                        <Grid3X3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'}`}
                        title="List View"
                      >
                        <List className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card View */}
                {viewMode === 'cards' && (
                  <div className="grid grid-cols-3 gap-3 max-h-[300px] overflow-y-auto">
                    {filteredEmployees.slice(0, 9).map((emp) => (
                      <div
                        key={emp.id}
                        className={`rounded-lg p-3 border transition-all cursor-pointer hover:scale-[1.02] ${employeeStatusColors[emp.status]}`}
                        onClick={() => setSelectedEmployee(emp)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-medium text-white flex-shrink-0">
                            {emp.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-white truncate">{emp.name}</p>
                            <p className="text-[9px] text-white/50 truncate">{emp.nameJapanese}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <span className={`text-${departmentConfig[emp.department].color}-400`}>
                                {departmentConfig[emp.department].icon}
                              </span>
                              <span className="text-[9px] text-white/60 truncate">{emp.role}</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <div className="w-10 h-1 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  emp.performanceScore >= 90 ? 'bg-emerald-500' :
                                  emp.performanceScore >= 75 ? 'bg-blue-500' :
                                  emp.performanceScore >= 60 ? 'bg-amber-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${emp.performanceScore}%` }}
                              />
                            </div>
                            <span className="text-[9px] text-white/50">{emp.performanceScore}%</span>
                          </div>
                          <span className="text-[9px] text-white/40">{emp.hoursThisWeek}h</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* List View */}
                {viewMode === 'list' && (
                  <div className="overflow-x-auto max-h-[300px]">
                    <table className="w-full text-xs">
                      <thead className="sticky top-0 bg-slate-900/90">
                        <tr className="text-white/40 text-left">
                          <th className="pb-2 font-medium">Employee</th>
                          <th className="pb-2 font-medium">Role</th>
                          <th className="pb-2 font-medium">Status</th>
                          <th className="pb-2 font-medium text-center">Performance</th>
                          <th className="pb-2 font-medium text-right">Hours</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredEmployees.slice(0, 8).map((emp) => (
                          <tr
                            key={emp.id}
                            className="border-t border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                            onClick={() => setSelectedEmployee(emp)}
                          >
                            <td className="py-2">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] font-medium text-white">
                                  {emp.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                  <p className="text-white font-medium">{emp.name}</p>
                                  <p className="text-[9px] text-white/40">{emp.nameJapanese}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-2">
                              <div className="flex items-center gap-1.5">
                                <span className={`text-${departmentConfig[emp.department].color}-400`}>
                                  {departmentConfig[emp.department].icon}
                                </span>
                                <span className="text-white/70 truncate max-w-[100px]">{emp.role}</span>
                              </div>
                            </td>
                            <td className="py-2">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                                emp.status === 'on_duty' ? 'bg-emerald-500/20 text-emerald-300' :
                                emp.status === 'on_break' ? 'bg-amber-500/20 text-amber-300' :
                                emp.status === 'on_leave' || emp.status === 'sick' ? 'bg-purple-500/20 text-purple-300' :
                                'bg-slate-500/20 text-slate-300'
                              }`}>
                                {emp.status.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="py-2 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <div className="w-12 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      emp.performanceScore >= 90 ? 'bg-emerald-500' :
                                      emp.performanceScore >= 75 ? 'bg-blue-500' :
                                      emp.performanceScore >= 60 ? 'bg-amber-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${emp.performanceScore}%` }}
                                  />
                                </div>
                                <span className="text-white/50 w-7">{emp.performanceScore}%</span>
                              </div>
                            </td>
                            <td className="py-2 text-right">
                              <span className="text-white">{emp.hoursThisWeek}h</span>
                              {emp.overtimeHours > 0 && (
                                <span className="text-amber-400 ml-1">+{emp.overtimeHours}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[10px]">
                  <span className="text-white/40">Showing {Math.min(viewMode === 'cards' ? 9 : 8, filteredEmployees.length)} of {filteredEmployees.length} employees</span>
                  <button className="text-indigo-400 hover:text-indigo-300">View All</button>
                </div>
              </div>
            </div>

            {/* Fourth Row - AI Insights & Time Off Requests */}
            <div className="grid grid-cols-12 gap-4">
              {/* AI Insights */}
              <div className="col-span-8 bg-gradient-to-br from-purple-900/30 to-indigo-900/30 backdrop-blur-xl rounded-xl border border-purple-500/20 p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <h3 className="text-sm font-medium text-white">AI Workforce Insights</h3>
                  </div>
                  <span className="text-[10px] text-white/40">{aiInsights.filter(i => !i.acknowledged).length} active insights</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {aiInsights.filter(i => !i.acknowledged).slice(0, 3).map(insight => {
                    const categoryColors = {
                      staffing: 'border-blue-500/30 bg-blue-500/10',
                      performance: 'border-emerald-500/30 bg-emerald-500/10',
                      efficiency: 'border-cyan-500/30 bg-cyan-500/10',
                      alert: 'border-red-500/30 bg-red-500/10',
                      opportunity: 'border-amber-500/30 bg-amber-500/10',
                    };
                    const categoryIcons = {
                      staffing: <Users className="w-4 h-4 text-blue-400" />,
                      performance: <Award className="w-4 h-4 text-emerald-400" />,
                      efficiency: <TrendingUp className="w-4 h-4 text-cyan-400" />,
                      alert: <AlertTriangle className="w-4 h-4 text-red-400" />,
                      opportunity: <Target className="w-4 h-4 text-amber-400" />,
                    };

                    return (
                      <div key={insight.id} className={`rounded-lg border p-3 ${categoryColors[insight.category]}`}>
                        <div className="flex items-center justify-between mb-2">
                          {categoryIcons[insight.category]}
                          <span className={`px-1.5 py-0.5 rounded text-[9px] ${
                            insight.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                            insight.priority === 'medium' ? 'bg-amber-500/20 text-amber-300' :
                            'bg-slate-500/20 text-slate-300'
                          }`}>
                            {insight.priority}
                          </span>
                        </div>
                        <h4 className="text-xs font-medium text-white mb-1">{insight.title}</h4>
                        <p className="text-[10px] text-white/60 mb-2 line-clamp-2">{insight.message}</p>
                        {insight.recommendation && (
                          <p className="text-[10px] text-purple-300 italic line-clamp-2">Rec: {insight.recommendation}</p>
                        )}
                        <button
                          onClick={() => acknowledgeInsight(insight.id)}
                          className="mt-2 text-[9px] text-white/40 hover:text-white/60"
                        >
                          Dismiss
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Time Off Requests */}
              <div className="col-span-4 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-white">Time Off Requests</h3>
                  <Bell className="w-4 h-4 text-white/40" />
                </div>
                <div className="space-y-2">
                  {timeOffRequests.filter(r => r.status === 'pending').slice(0, 4).map(request => (
                    <div key={request.id} className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white font-medium truncate">{request.employeeName}</p>
                        <p className="text-[9px] text-white/40">
                          {request.type} | {request.startDate} - {request.endDate}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => approveTimeOff(request.id, true)}
                          className="p-1 hover:bg-emerald-500/20 rounded transition-colors"
                          title="Approve"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        </button>
                        <button
                          onClick={() => approveTimeOff(request.id, false)}
                          className="p-1 hover:bg-red-500/20 rounded transition-colors"
                          title="Deny"
                        >
                          <X className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {timeOffRequests.filter(r => r.status === 'pending').length === 0 && (
                    <p className="text-xs text-white/40 text-center py-4">No pending requests</p>
                  )}
                </div>
              </div>
            </div>

            {/* Fifth Row - Today's Schedule */}
            <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-medium text-white">Today's Schedule</h3>
                  <div className="flex items-center gap-2 text-[10px]">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-blue-500/50" />
                      <span className="text-white/50">Morning</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-amber-500/50" />
                      <span className="text-white/50">Afternoon</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-purple-500/50" />
                      <span className="text-white/50">Night</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/50">{todayShifts.length} shifts today</span>
                  <Calendar className="w-4 h-4 text-white/40" />
                </div>
              </div>
              <div className="grid grid-cols-8 gap-2">
                {Object.entries(departmentConfig).map(([dept, config]) => {
                  const deptShifts = todayShifts.filter(s => s.department === dept as Department);
                  const morningCount = deptShifts.filter(s => s.shiftType === 'morning').length;
                  const afternoonCount = deptShifts.filter(s => s.shiftType === 'afternoon').length;
                  const nightCount = deptShifts.filter(s => s.shiftType === 'night').length;

                  return (
                    <div key={dept} className="bg-white/5 rounded-lg p-3 border border-white/10">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-${config.color}-400`}>{config.icon}</span>
                        <span className="text-[10px] text-white font-medium">{config.label}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] text-blue-300">AM</span>
                          <span className="text-[10px] text-white">{morningCount}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] text-amber-300">PM</span>
                          <span className="text-[10px] text-white">{afternoonCount}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] text-purple-300">Night</span>
                          <span className="text-[10px] text-white">{nightCount}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* AI Assistant Panel with Voice Support - Always Visible */}
        <div className="fixed inset-y-0 right-0 w-96 bg-gradient-to-b from-blue-900/95 to-slate-900/98 backdrop-blur-xl border-l border-blue-500/20 shadow-2xl z-40 flex flex-col">
          {/* Voice-enabled AI Chat */}
          <VoiceSessionChat
            agentId="employee-management-assistant"
            title="HR Assistant"
            subtitle="Voice-enabled workforce assistant"
            avatar="/avatars/assistant-avatar.jpg"
            variant="dark"
            welcomeMessage="I'm your HR assistant. I can help you with staffing coverage, employee scheduling, performance tracking, task management, and workforce analytics. What would you like to know?"
            suggestions={[
              "Who is on duty now?",
              "Show overtime report",
              "What tasks are pending?",
            ]}
            contextData={{
              totalEmployees: employees.length,
              onDuty: totalOnDuty,
              onBreak: totalOnBreak,
              offDuty: totalOffDuty,
              onLeave: totalOnLeave,
              pendingTasks: tasks.filter(t => t.status === 'pending').length,
              departmentMetrics: departmentMetrics,
            }}
          />
        </div>

        {/* Employee Detail Modal */}
        {selectedEmployee && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900/95 border border-white/20 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-4 border-b border-white/10 flex items-center justify-between flex-shrink-0">
                <h3 className="text-sm font-medium text-white">
                  {editMode ? 'Edit Employee' : 'Employee Details'}
                </h3>
                <div className="flex items-center gap-2">
                  {!editMode ? (
                    <button
                      onClick={handleStartEdit}
                      className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-indigo-400"
                      title="Edit Employee"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleSaveEmployee}
                        className="p-1.5 hover:bg-emerald-500/20 rounded-lg transition-colors text-emerald-400"
                        title="Save Changes"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/60"
                        title="Cancel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => { setSelectedEmployee(null); setEditMode(false); setEditedEmployee({}); }}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-white/60" />
                  </button>
                </div>
              </div>
              <div className="p-4 overflow-y-auto">
                {/* Avatar and Basic Info */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xl font-medium text-white flex-shrink-0">
                    {(editMode ? editedEmployee.name || selectedEmployee.name : selectedEmployee.name).split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    {editMode ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editedEmployee.name || ''}
                          onChange={(e) => setEditedEmployee({ ...editedEmployee, name: e.target.value })}
                          className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-sm text-white"
                          placeholder="Name"
                        />
                        <input
                          type="text"
                          value={editedEmployee.role || ''}
                          onChange={(e) => setEditedEmployee({ ...editedEmployee, role: e.target.value })}
                          className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-xs text-white"
                          placeholder="Role"
                        />
                      </div>
                    ) : (
                      <>
                        <h4 className="text-lg font-medium text-white">{selectedEmployee.name}</h4>
                        <p className="text-sm text-white/50">{selectedEmployee.nameJapanese}</p>
                        <p className="text-xs text-white/40">{selectedEmployee.role}</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Status and Department */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <p className="text-[10px] text-white/40 mb-1">Department</p>
                    <div className="flex items-center gap-2">
                      <span className={`text-${departmentConfig[selectedEmployee.department].color}-400`}>
                        {departmentConfig[selectedEmployee.department].icon}
                      </span>
                      <span className="text-sm text-white">{departmentConfig[selectedEmployee.department].label}</span>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <p className="text-[10px] text-white/40 mb-1">Status</p>
                    {editMode ? (
                      <select
                        value={editedEmployee.status || selectedEmployee.status}
                        onChange={(e) => setEditedEmployee({ ...editedEmployee, status: e.target.value as any })}
                        className="bg-slate-800 border border-white/20 rounded px-2 py-0.5 text-xs text-white w-full"
                      >
                        <option value="on_duty">On Duty</option>
                        <option value="off_duty">Off Duty</option>
                        <option value="on_break">On Break</option>
                        <option value="on_leave">On Leave</option>
                        <option value="sick">Sick</option>
                      </select>
                    ) : (
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        selectedEmployee.status === 'on_duty' ? 'bg-emerald-500/20 text-emerald-300' :
                        selectedEmployee.status === 'on_break' ? 'bg-amber-500/20 text-amber-300' :
                        selectedEmployee.status === 'on_leave' || selectedEmployee.status === 'sick' ? 'bg-purple-500/20 text-purple-300' :
                        'bg-slate-500/20 text-slate-300'
                      }`}>
                        {selectedEmployee.status.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <p className="text-[10px] text-white/40 mb-1">Performance</p>
                    <p className={`text-lg font-bold ${
                      selectedEmployee.performanceScore >= 90 ? 'text-emerald-400' :
                      selectedEmployee.performanceScore >= 75 ? 'text-blue-400' :
                      selectedEmployee.performanceScore >= 60 ? 'text-amber-400' : 'text-red-400'
                    }`}>{selectedEmployee.performanceScore}%</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <p className="text-[10px] text-white/40 mb-1">Hours This Week</p>
                    <p className="text-lg font-bold text-white">
                      {selectedEmployee.hoursThisWeek}h
                      {selectedEmployee.overtimeHours > 0 && (
                        <span className="text-sm text-amber-400 ml-1">+{selectedEmployee.overtimeHours}</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="bg-white/5 rounded-lg p-3 border border-white/10 mb-4">
                  <p className="text-[10px] text-white/40 mb-2">Contact Information</p>
                  {editMode ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3 h-3 text-white/40" />
                        <input
                          type="text"
                          value={editedEmployee.phone || ''}
                          onChange={(e) => setEditedEmployee({ ...editedEmployee, phone: e.target.value })}
                          className="flex-1 px-2 py-1 bg-white/10 border border-white/20 rounded text-xs text-white"
                          placeholder="Phone"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-3 h-3 text-white/40" />
                        <input
                          type="email"
                          value={editedEmployee.email || ''}
                          onChange={(e) => setEditedEmployee({ ...editedEmployee, email: e.target.value })}
                          className="flex-1 px-2 py-1 bg-white/10 border border-white/20 rounded text-xs text-white"
                          placeholder="Email"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-white/60">
                        <Phone className="w-3 h-3" />
                        <span>{selectedEmployee.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-white/60">
                        <Mail className="w-3 h-3" />
                        <span>{selectedEmployee.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-white/60">
                        <Calendar className="w-3 h-3" />
                        <span>Hired: {selectedEmployee.hireDate}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Skills */}
                <div className="mb-4">
                  <p className="text-[10px] text-white/40 mb-2">Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedEmployee.skills.map(skill => (
                      <span key={skill} className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded text-[10px]">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Certifications */}
                <div className="mb-4">
                  <p className="text-[10px] text-white/40 mb-2">Certifications</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedEmployee.certifications.map(cert => (
                      <span key={cert} className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded text-[10px]">
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Upcoming Shifts */}
                <div>
                  <p className="text-[10px] text-white/40 mb-2">Upcoming Shifts</p>
                  <div className="space-y-1">
                    {shifts
                      .filter(s => s.employeeId === selectedEmployee.id && new Date(s.date) >= new Date())
                      .slice(0, 5)
                      .map(shift => (
                        <div key={shift.id} className="flex items-center justify-between text-xs bg-white/5 rounded px-2 py-1.5 border border-white/10">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${shiftTypeConfig[shift.shiftType].color}`} />
                            <span className="text-white/70">{new Date(shift.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                          </div>
                          <span className="text-white/50">{shiftTypeConfig[shift.shiftType].time}</span>
                        </div>
                      ))
                    }
                    {shifts.filter(s => s.employeeId === selectedEmployee.id && new Date(s.date) >= new Date()).length === 0 && (
                      <p className="text-[10px] text-white/40 text-center py-2">No upcoming shifts</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Department Shift Management Modal */}
        {shiftManagementOpen && shiftManagementDept && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900/95 border border-white/20 rounded-2xl w-full max-w-5xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-4 border-b border-white/10 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <span className={`text-${departmentConfig[shiftManagementDept].color}-400`}>
                    {departmentConfig[shiftManagementDept].icon}
                  </span>
                  <div>
                    <h3 className="text-sm font-medium text-white">{departmentConfig[shiftManagementDept].label} - Shift Management</h3>
                    <p className="text-[10px] text-white/40">
                      Week of {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShiftWeekOffset(shiftWeekOffset - 1)}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-white/60" />
                  </button>
                  <button
                    onClick={() => setShiftWeekOffset(0)}
                    className="px-2 py-1 text-xs text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => setShiftWeekOffset(shiftWeekOffset + 1)}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-white/60" />
                  </button>
                  <div className="w-px h-4 bg-white/20 mx-2" />
                  <button
                    onClick={() => {
                      setNewShift({ department: shiftManagementDept });
                      setNewShiftModal(true);
                    }}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 rounded-lg transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    Add Shift
                  </button>
                  <button
                    onClick={() => setShiftManagementOpen(false)}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-white/60" />
                  </button>
                </div>
              </div>

              {/* Shift Calendar */}
              <div className="p-4 overflow-auto flex-1">
                <div className="min-w-[800px]">
                  {/* Header - Days of week */}
                  <div className="grid grid-cols-8 gap-2 mb-2">
                    <div className="p-2 text-xs text-white/40">Employee</div>
                    {weekDates.map((date, i) => {
                      const isToday = date.toDateString() === new Date().toDateString();
                      return (
                        <div
                          key={i}
                          className={`p-2 text-center rounded-lg ${isToday ? 'bg-indigo-500/20 border border-indigo-500/30' : 'bg-white/5'}`}
                        >
                          <p className={`text-xs font-medium ${isToday ? 'text-indigo-300' : 'text-white/70'}`}>{dayNames[i]}</p>
                          <p className={`text-[10px] ${isToday ? 'text-indigo-400' : 'text-white/40'}`}>{date.getDate()}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Employee rows */}
                  <div className="space-y-1">
                    {employees
                      .filter(e => e.department === shiftManagementDept)
                      .map(emp => (
                        <div key={emp.id} className="grid grid-cols-8 gap-2">
                          {/* Employee name */}
                          <div className="p-2 bg-white/5 rounded-lg border border-white/10 flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-[8px] font-medium text-white">
                              {emp.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] text-white truncate">{emp.name}</p>
                              <p className="text-[8px] text-white/40 truncate">{emp.role}</p>
                            </div>
                          </div>

                          {/* Day columns */}
                          {weekDates.map((date, i) => {
                            const dateStr = date.toISOString().split('T')[0];
                            const dayShifts = shifts.filter(s => s.employeeId === emp.id && s.date === dateStr);
                            const isToday = date.toDateString() === new Date().toDateString();

                            return (
                              <div
                                key={i}
                                className={`p-1 rounded-lg border transition-colors min-h-[60px] ${
                                  isToday ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-white/5 border-white/10'
                                } ${dayShifts.length === 0 ? 'hover:bg-white/10 cursor-pointer' : ''}`}
                                onClick={() => {
                                  if (dayShifts.length === 0) {
                                    setNewShift({ employeeId: emp.id, date: dateStr, department: shiftManagementDept });
                                    setNewShiftModal(true);
                                  }
                                }}
                              >
                                {dayShifts.map(shift => (
                                  <div
                                    key={shift.id}
                                    className={`rounded p-1.5 mb-1 cursor-pointer group relative ${shiftTypeConfig[shift.shiftType].color}/20 border ${shiftTypeConfig[shift.shiftType].color.replace('bg-', 'border-')}/30`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingShift(shift);
                                    }}
                                  >
                                    <p className="text-[9px] font-medium text-white">{shiftTypeConfig[shift.shiftType].label}</p>
                                    <p className="text-[8px] text-white/50">{shift.startTime} - {shift.endTime}</p>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteShift(shift.id);
                                      }}
                                      className="absolute top-0.5 right-0.5 p-0.5 bg-red-500/20 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <X className="w-2.5 h-2.5 text-red-400" />
                                    </button>
                                  </div>
                                ))}
                                {dayShifts.length === 0 && (
                                  <div className="h-full flex items-center justify-center">
                                    <Plus className="w-3 h-3 text-white/20" />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* AI Insights & Assistant Row */}
              <div className="px-4 pb-2 grid grid-cols-2 gap-4">
                {/* AI Insights Panel */}
                <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-xl border border-indigo-500/20 p-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <h4 className="text-xs font-medium text-white">AI Insights</h4>
                  </div>
                  <div className="space-y-2 max-h-[120px] overflow-y-auto">
                    {shiftManagementDept && getShiftAiInsights(shiftManagementDept).map((insight, i) => (
                      <div
                        key={i}
                        className={`p-2 rounded-lg border text-[10px] ${
                          insight.type === 'alert' ? 'bg-red-500/10 border-red-500/20 text-red-300' :
                          insight.type === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' :
                          insight.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' :
                          'bg-blue-500/10 border-blue-500/20 text-blue-300'
                        }`}
                      >
                        <p className="font-medium">{insight.title}</p>
                        <p className="text-white/60 mt-0.5">{insight.message}</p>
                      </div>
                    ))}
                    {shiftManagementDept && getShiftAiInsights(shiftManagementDept).length === 0 && (
                      <p className="text-[10px] text-white/40 text-center py-2">No alerts - schedule looks good!</p>
                    )}
                  </div>
                </div>

                {/* AI Assistant Panel */}
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="w-4 h-4 text-purple-400" />
                    <h4 className="text-xs font-medium text-white">Shift Assistant</h4>
                  </div>

                  {/* FAQ Quick Links */}
                  {shiftAiMessages.length === 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {[
                        { label: 'Coverage analysis', q: 'How is our staffing coverage?' },
                        { label: 'Overtime report', q: 'Show overtime status' },
                        { label: 'Weekend shifts', q: 'What is our weekend coverage?' },
                        { label: 'Optimize schedule', q: 'How can we optimize?' },
                        { label: 'Available staff', q: 'Who is available?' },
                      ].map((faq, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setShiftAiQuestion(faq.q);
                            setTimeout(() => {
                              setShiftAiMessages([{ role: 'user', content: faq.q }]);
                              setTimeout(() => {
                                if (shiftManagementDept) {
                                  const response = getShiftAiResponse(faq.q, shiftManagementDept);
                                  setShiftAiMessages(prev => [...prev, { role: 'assistant', content: response }]);
                                }
                              }, 300);
                            }, 100);
                            setShiftAiQuestion('');
                          }}
                          className="px-2 py-1 text-[9px] bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-full transition-colors"
                        >
                          {faq.label}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="space-y-2 max-h-[80px] overflow-y-auto mb-2">
                    {shiftAiMessages.length === 0 ? (
                      <p className="text-[10px] text-white/40">Click a topic above or ask your own question...</p>
                    ) : (
                      shiftAiMessages.slice(-4).map((msg, i) => (
                        <div key={i} className={`text-[10px] ${msg.role === 'user' ? 'text-purple-300' : 'text-white/70'}`}>
                          <span className="font-medium">{msg.role === 'user' ? 'You: ' : 'AI: '}</span>
                          <span className="whitespace-pre-wrap">{msg.content.slice(0, 150)}{msg.content.length > 150 ? '...' : ''}</span>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={shiftAiQuestion}
                      onChange={(e) => setShiftAiQuestion(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleShiftAiQuestion()}
                      placeholder="Ask about shifts..."
                      className="flex-1 px-2 py-1.5 bg-white/10 border border-white/20 rounded-lg text-[10px] text-white placeholder-white/30"
                    />
                    <button
                      onClick={handleShiftAiQuestion}
                      className="p-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-colors"
                    >
                      <Send className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Shift Legend */}
              <div className="p-3 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {Object.entries(shiftTypeConfig).map(([type, config]) => (
                    <div key={type} className="flex items-center gap-1.5">
                      <div className={`w-3 h-3 rounded ${config.color}`} />
                      <span className="text-[10px] text-white/60">{config.label} ({config.time})</span>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-white/40">
                  {employees.filter(e => e.department === shiftManagementDept).length} employees |
                  {shifts.filter(s => s.department === shiftManagementDept && weekDates.some(d => d.toISOString().split('T')[0] === s.date)).length} shifts this week
                </p>
              </div>
            </div>
          </div>
        )}

        {/* New Shift Modal */}
        {newShiftModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-slate-900/95 border border-white/20 rounded-xl w-full max-w-sm shadow-2xl">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-sm font-medium text-white">Add New Shift</h3>
                <button
                  onClick={() => { setNewShiftModal(false); setNewShift({}); }}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-white/60" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="text-[10px] text-white/40 block mb-1">Employee</label>
                  <select
                    value={newShift.employeeId || ''}
                    onChange={(e) => setNewShift({ ...newShift, employeeId: e.target.value })}
                    className="w-full bg-slate-800 border border-white/20 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    <option value="">Select employee...</option>
                    {employees
                      .filter(e => e.department === shiftManagementDept)
                      .map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name} - {emp.role}</option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-white/40 block mb-1">Date</label>
                  <input
                    type="date"
                    value={newShift.date || ''}
                    onChange={(e) => setNewShift({ ...newShift, date: e.target.value })}
                    className="w-full bg-slate-800 border border-white/20 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-white/40 block mb-1">Shift Type</label>
                  <select
                    value={newShift.shiftType || ''}
                    onChange={(e) => setNewShift({ ...newShift, shiftType: e.target.value as ShiftType })}
                    className="w-full bg-slate-800 border border-white/20 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    <option value="">Select shift type...</option>
                    {Object.entries(shiftTypeConfig).map(([type, config]) => (
                      <option key={type} value={type}>{config.label} ({config.time})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-white/40 block mb-1">Notes (optional)</label>
                  <input
                    type="text"
                    value={newShift.notes || ''}
                    onChange={(e) => setNewShift({ ...newShift, notes: e.target.value })}
                    placeholder="Add any notes..."
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-xs text-white placeholder-white/30"
                  />
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => { setNewShiftModal(false); setNewShift({}); }}
                    className="flex-1 px-3 py-2 text-xs text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddShift}
                    disabled={!newShift.employeeId || !newShift.date || !newShift.shiftType}
                    className="flex-1 px-3 py-2 text-xs bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-500/50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    Add Shift
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Shift Modal */}
        {editingShift && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-slate-900/95 border border-white/20 rounded-xl w-full max-w-sm shadow-2xl">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-sm font-medium text-white">Edit Shift</h3>
                <button
                  onClick={() => setEditingShift(null)}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-white/60" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="text-[10px] text-white/40 block mb-1">Employee</label>
                  <p className="text-xs text-white">{employees.find(e => e.id === editingShift.employeeId)?.name}</p>
                </div>
                <div>
                  <label className="text-[10px] text-white/40 block mb-1">Date</label>
                  <input
                    type="date"
                    value={editingShift.date}
                    onChange={(e) => setEditingShift({ ...editingShift, date: e.target.value })}
                    className="w-full bg-slate-800 border border-white/20 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-white/40 block mb-1">Shift Type</label>
                  <select
                    value={editingShift.shiftType}
                    onChange={(e) => {
                      const shiftType = e.target.value as ShiftType;
                      const shiftTimes: Record<ShiftType, { start: string; end: string }> = {
                        morning: { start: '06:00', end: '14:00' },
                        afternoon: { start: '14:00', end: '22:00' },
                        night: { start: '22:00', end: '06:00' },
                        split: { start: '06:00', end: '22:00' },
                      };
                      setEditingShift({
                        ...editingShift,
                        shiftType,
                        startTime: shiftTimes[shiftType].start,
                        endTime: shiftTimes[shiftType].end,
                      });
                    }}
                    className="w-full bg-slate-800 border border-white/20 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    {Object.entries(shiftTypeConfig).map(([type, config]) => (
                      <option key={type} value={type}>{config.label} ({config.time})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-white/40 block mb-1">Status</label>
                  <select
                    value={editingShift.status}
                    onChange={(e) => setEditingShift({ ...editingShift, status: e.target.value as any })}
                    className="w-full bg-slate-800 border border-white/20 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="missed">Missed</option>
                    <option value="swapped">Swapped</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => {
                      deleteShift(editingShift.id);
                      setEditingShift(null);
                    }}
                    className="px-3 py-2 text-xs text-red-400 hover:bg-red-500/20 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                  <div className="flex-1" />
                  <button
                    onClick={() => setEditingShift(null)}
                    className="px-3 py-2 text-xs text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      updateShift(editingShift.id, {
                        date: editingShift.date,
                        shiftType: editingShift.shiftType,
                        startTime: editingShift.startTime,
                        endTime: editingShift.endTime,
                        status: editingShift.status,
                      });
                      setEditingShift(null);
                    }}
                    className="px-3 py-2 text-xs bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Room Detail Modal */}
        {selectedRoom && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-white/20 rounded-xl w-full max-w-md shadow-2xl">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${roomStatusConfig[selectedRoom.cleaningStatus].bgColor} flex items-center justify-center`}>
                    <span className="text-lg">{roomStatusConfig[selectedRoom.cleaningStatus].icon}</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-white">Room {selectedRoom.roomNumber}</h3>
                    <p className="text-[10px] text-white/40">Floor {selectedRoom.floor} • {selectedRoom.roomType}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRoom(null)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-white/60" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                {/* Current Status */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <p className="text-[10px] text-white/40 mb-1">Cleaning Status</p>
                    <p className={`text-sm font-medium ${roomStatusConfig[selectedRoom.cleaningStatus].color}`}>
                      {roomStatusConfig[selectedRoom.cleaningStatus].label}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <p className="text-[10px] text-white/40 mb-1">Priority</p>
                    <span className={`text-xs px-2 py-0.5 rounded ${roomPriorityConfig[selectedRoom.priority].color}`}>
                      {roomPriorityConfig[selectedRoom.priority].label}
                    </span>
                  </div>
                </div>

                {/* Occupancy Info */}
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <p className="text-[10px] text-white/40 mb-2">Occupancy</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      selectedRoom.occupancyStatus === 'occupied' ? 'bg-blue-500/20 text-blue-300' :
                      selectedRoom.occupancyStatus === 'checkout' ? 'bg-amber-500/20 text-amber-300' :
                      'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {selectedRoom.occupancyStatus.replace('_', ' ')}
                    </span>
                    {selectedRoom.guestName && (
                      <span className="text-xs text-white/60">Guest: {selectedRoom.guestName}</span>
                    )}
                  </div>
                  {selectedRoom.checkoutTime && (
                    <p className="text-[10px] text-white/40 mt-1">Checkout: {selectedRoom.checkoutTime}</p>
                  )}
                </div>

                {/* Assignment */}
                <div>
                  <label className="text-[10px] text-white/40 block mb-1">Assign to Attendant</label>
                  <select
                    value={selectedRoom.assignedTo || ''}
                    onChange={(e) => {
                      assignRoomToAttendant(selectedRoom.id, e.target.value);
                      setSelectedRoom({ ...selectedRoom, assignedTo: e.target.value });
                    }}
                    className="w-full bg-slate-800 border border-white/20 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    <option value="">Unassigned</option>
                    {housekeepingAttendants.map(att => (
                      <option key={att.employeeId} value={att.employeeId}>
                        {att.name} ({att.zone})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Update Workflow */}
                <div>
                  <label className="text-[10px] text-white/40 block mb-2">Update Status</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['dirty', 'in_progress', 'clean', 'inspected', 'out_of_order'] as RoomCleaningStatus[]).map(status => (
                      <button
                        key={status}
                        onClick={() => {
                          updateRoomStatus(selectedRoom.id, status);
                          setSelectedRoom({ ...selectedRoom, cleaningStatus: status });
                        }}
                        className={`p-2 rounded-lg border text-[10px] transition-colors ${
                          selectedRoom.cleaningStatus === status
                            ? roomStatusConfig[status].bgColor + ' border-white/30'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <span className="block">{roomStatusConfig[status].icon}</span>
                        <span className={selectedRoom.cleaningStatus === status ? roomStatusConfig[status].color : 'text-white/60'}>
                          {roomStatusConfig[status].label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Inspection Score (if inspected) */}
                {selectedRoom.cleaningStatus === 'inspected' && selectedRoom.inspectionScore && (
                  <div className="bg-emerald-500/10 rounded-lg p-3 border border-emerald-500/20">
                    <p className="text-[10px] text-emerald-400 mb-1">Inspection Score</p>
                    <p className="text-xl font-bold text-emerald-400">{selectedRoom.inspectionScore}%</p>
                  </div>
                )}

                {/* Maintenance Issues */}
                {selectedRoom.maintenanceIssues.length > 0 && (
                  <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/20">
                    <p className="text-[10px] text-red-400 mb-2">Maintenance Issues</p>
                    <div className="space-y-1">
                      {selectedRoom.maintenanceIssues.map((issue, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-red-300">
                          <AlertTriangle className="w-3 h-3" />
                          <span>{issue}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => setSelectedRoom(null)}
                    className="flex-1 px-3 py-2 text-xs text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    Close
                  </button>
                  {selectedRoom.cleaningStatus === 'clean' && (
                    <button
                      onClick={() => {
                        const score = Math.floor(85 + Math.random() * 15);
                        markRoomInspected(selectedRoom.id, score, 'Supervisor');
                        setSelectedRoom({ ...selectedRoom, cleaningStatus: 'inspected', inspectionScore: score });
                      }}
                      className="flex-1 px-3 py-2 text-xs bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
                    >
                      Mark Inspected
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Department Management Modal */}
        {deptModalOpen && deptModalDept && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900/95 border border-white/20 rounded-2xl w-full max-w-6xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col relative">
              {/* Modal Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <span className={`text-${departmentConfig[deptModalDept].color}-400 text-2xl`}>
                    {departmentConfig[deptModalDept].icon}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{departmentConfig[deptModalDept].label} Management</h3>
                    <p className="text-xs text-white/40">Department Dashboard & Operations</p>
                  </div>
                </div>
                <button
                  onClick={() => setDeptModalOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white/60" />
                </button>
              </div>

              {/* Tab Navigation */}
              <div className="px-4 py-2 border-b border-white/10 flex items-center gap-1 bg-white/5 flex-shrink-0 overflow-x-auto">
                {deptModalDept === 'drivers' ? (
                  // Driver-specific tabs
                  <>
                    {(['dispatch', 'fleet', 'shuttles', 'deliveries', 'messages', 'analytics'] as const).map(tab => (
                      <button
                        key={tab}
                        onClick={() => setDriverView(tab)}
                        className={`px-4 py-2 text-xs rounded-lg transition-colors whitespace-nowrap ${
                          driverView === tab
                            ? 'bg-white/10 text-white'
                            : 'text-white/50 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {tab === 'dispatch' && '🚗 Dispatch Board'}
                        {tab === 'fleet' && '🚐 Fleet'}
                        {tab === 'shuttles' && '✈️ Airport & Shuttles'}
                        {tab === 'deliveries' && '📦 Deliveries'}
                        {tab === 'messages' && '💬 Messages'}
                        {tab === 'analytics' && '📊 Analytics'}
                      </button>
                    ))}
                  </>
                ) : deptModalDept === 'housekeeping' ? (
                  // Housekeeping department tabs (includes operations)
                  <>
                    {(['overview', 'operations', 'employees', 'shifts', 'tasks', 'kpis'] as const).map(tab => (
                      <button
                        key={tab}
                        onClick={() => setDeptModalView(tab)}
                        className={`px-4 py-2 text-xs rounded-lg transition-colors ${
                          deptModalView === tab
                            ? 'bg-white/10 text-white'
                            : 'text-white/50 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {tab === 'overview' && 'Overview'}
                        {tab === 'operations' && '🛏️ Room Operations'}
                        {tab === 'employees' && 'Employees'}
                        {tab === 'shifts' && 'Shift Schedule'}
                        {tab === 'tasks' && 'Tasks & Assignments'}
                        {tab === 'kpis' && 'KPIs & Metrics'}
                      </button>
                    ))}
                  </>
                ) : (
                  // Standard department tabs
                  <>
                    {(['overview', 'employees', 'shifts', 'tasks', 'kpis'] as const).map(tab => (
                      <button
                        key={tab}
                        onClick={() => setDeptModalView(tab)}
                        className={`px-4 py-2 text-xs rounded-lg transition-colors ${
                          deptModalView === tab
                            ? 'bg-white/10 text-white'
                            : 'text-white/50 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {tab === 'overview' && 'Overview'}
                        {tab === 'employees' && 'Employees'}
                        {tab === 'shifts' && 'Shift Schedule'}
                        {tab === 'tasks' && 'Tasks & Assignments'}
                        {tab === 'kpis' && 'KPIs & Metrics'}
                      </button>
                    ))}
                  </>
                )}
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-auto p-4">
                {/* Driver Management Content */}
                {deptModalDept === 'drivers' && (
                  <>
                    {/* Dispatch Board */}
                    {driverView === 'dispatch' && (
                      <div className="space-y-4">
                        {/* AI Fleet Insights */}
                        <DriversAIInsights
                          metrics={driverMetrics}
                          trips={driverTrips}
                          vehicles={vehicles}
                        />

                        {/* Quick Stats */}
                        <div className="grid grid-cols-6 gap-3">
                          <div className="bg-emerald-500/10 rounded-xl p-3 border border-emerald-500/20">
                            <p className="text-[10px] text-emerald-400">Available</p>
                            <p className="text-2xl font-bold text-emerald-400">{driverMetrics.availableDrivers}</p>
                            <p className="text-[10px] text-white/40">drivers</p>
                          </div>
                          <div className="bg-blue-500/10 rounded-xl p-3 border border-blue-500/20">
                            <p className="text-[10px] text-blue-400">Active Trips</p>
                            <p className="text-2xl font-bold text-blue-400">{driverMetrics.inProgressTrips}</p>
                            <p className="text-[10px] text-white/40">in progress</p>
                          </div>
                          <div className="bg-amber-500/10 rounded-xl p-3 border border-amber-500/20">
                            <p className="text-[10px] text-amber-400">Pending</p>
                            <p className="text-2xl font-bold text-amber-400">{driverMetrics.pendingTrips}</p>
                            <p className="text-[10px] text-white/40">to assign</p>
                          </div>
                          <div className="bg-purple-500/10 rounded-xl p-3 border border-purple-500/20">
                            <p className="text-[10px] text-purple-400">Completed</p>
                            <p className="text-2xl font-bold text-purple-400">{driverMetrics.completedTripsToday}</p>
                            <p className="text-[10px] text-white/40">today</p>
                          </div>
                          <div className="bg-cyan-500/10 rounded-xl p-3 border border-cyan-500/20">
                            <p className="text-[10px] text-cyan-400">On-Time</p>
                            <p className="text-2xl font-bold text-cyan-400">{driverMetrics.onTimeRate}%</p>
                            <p className="text-[10px] text-white/40">rate</p>
                          </div>
                          <div className="bg-pink-500/10 rounded-xl p-3 border border-pink-500/20">
                            <p className="text-[10px] text-pink-400">Satisfaction</p>
                            <p className="text-2xl font-bold text-pink-400">{driverMetrics.guestSatisfaction}</p>
                            <p className="text-[10px] text-white/40">/ 5.0</p>
                          </div>
                        </div>

                        {/* Map View Toggle & Map */}
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-medium text-white flex items-center gap-2">
                            <Locate className="w-4 h-4 text-cyan-400" />
                            Driver Locations
                          </h4>
                          <button
                            onClick={() => setShowDriverMap(!showDriverMap)}
                            className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg transition-colors ${
                              showDriverMap
                                ? 'bg-cyan-500 text-white'
                                : 'bg-white/10 text-white/70 hover:bg-white/20'
                            }`}
                          >
                            <Map className="w-4 h-4" />
                            {showDriverMap ? 'Hide Map' : 'Show Map'}
                          </button>
                        </div>

                        {showDriverMap && (
                          <div className="mb-4">
                            <DriverMap
                              drivers={getDriverLocationsForMap()}
                              selectedDriverId={selectedMapDriver}
                              onDriverClick={(driverId) => {
                                setSelectedMapDriver(driverId);
                                // Find employee and show their active trip
                                const driver = employees.find(e => e.id === driverId);
                                if (driver) {
                                  const activeTrip = driverTrips.find(
                                    t => t.driverId === driverId && !['completed', 'cancelled'].includes(t.status)
                                  );
                                  if (activeTrip) setSelectedTrip(activeTrip);
                                }
                              }}
                              tripRoutes={getTripRoutesForMap()}
                              height="350px"
                            />
                            {/* Map Legend */}
                            <div className="mt-2 flex items-center justify-center gap-4 text-xs">
                              <div className="flex items-center gap-1">
                                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                                <span className="text-white/50">Available</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="w-3 h-3 rounded-full bg-blue-500" />
                                <span className="text-white/50">In Transit</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="w-3 h-3 rounded-full bg-amber-500" />
                                <span className="text-white/50">At Pickup</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="w-3 h-3 rounded-full bg-purple-500" />
                                <span className="text-white/50">At Dropoff</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="w-3 h-3 rounded-full bg-pink-500" />
                                <span className="text-white/50">Hotel</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="w-3 h-3 rounded-full bg-cyan-500" />
                                <span className="text-white/50">Airport</span>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-12 gap-4">
                          {/* Active Trips */}
                          <div className="col-span-8 space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium text-white">Active & Pending Trips</h4>
                              <div className="flex gap-2">
                                <select
                                  value={tripFilter}
                                  onChange={(e) => setTripFilter(e.target.value as TripType | 'all')}
                                  className="bg-slate-800 border border-white/20 rounded-lg px-2 py-1 text-xs text-white"
                                >
                                  <option value="all">All Types</option>
                                  <option value="airport_pickup">Airport Pickup</option>
                                  <option value="airport_dropoff">Airport Dropoff</option>
                                  <option value="shuttle">Shuttle</option>
                                  <option value="vip_transfer">VIP Transfer</option>
                                  <option value="tour">Tour</option>
                                  <option value="delivery">Delivery</option>
                                  <option value="errand">Errand</option>
                                </select>
                                <button
                                  onClick={() => setNewTripModalOpen(true)}
                                  className="flex items-center gap-1 px-3 py-1 text-xs bg-indigo-500 text-white hover:bg-indigo-600 rounded-lg"
                                >
                                  <Plus className="w-3 h-3" />
                                  New Trip
                                </button>
                              </div>
                            </div>

                            <div className="space-y-2 max-h-[400px] overflow-auto">
                              {driverTrips
                                .filter(t => t.status !== 'completed' && t.status !== 'cancelled')
                                .filter(t => tripFilter === 'all' || t.type === tripFilter)
                                .sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime())
                                .map(trip => (
                                  <div
                                    key={trip.id}
                                    onClick={() => setSelectedTrip(trip)}
                                    className={`bg-white/5 rounded-xl p-3 border cursor-pointer transition-colors ${
                                      selectedTrip?.id === trip.id ? 'border-cyan-500/50 bg-cyan-500/10' : 'border-white/10 hover:bg-white/10'
                                    }`}
                                  >
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className={`px-2 py-0.5 rounded text-[10px] ${
                                            trip.type === 'airport_pickup' || trip.type === 'airport_dropoff' ? 'bg-blue-500/20 text-blue-300' :
                                            trip.type === 'vip_transfer' ? 'bg-purple-500/20 text-purple-300' :
                                            trip.type === 'shuttle' ? 'bg-cyan-500/20 text-cyan-300' :
                                            trip.type === 'tour' ? 'bg-emerald-500/20 text-emerald-300' :
                                            trip.type === 'delivery' || trip.type === 'errand' ? 'bg-amber-500/20 text-amber-300' :
                                            'bg-pink-500/20 text-pink-300'
                                          }`}>
                                            {trip.type.replace(/_/g, ' ').toUpperCase()}
                                          </span>
                                          {trip.priority === 'vip' && (
                                            <span className="px-2 py-0.5 rounded text-[10px] bg-yellow-500/20 text-yellow-300">VIP</span>
                                          )}
                                          {trip.priority === 'urgent' && (
                                            <span className="px-2 py-0.5 rounded text-[10px] bg-red-500/20 text-red-300">URGENT</span>
                                          )}
                                          <span className={`px-2 py-0.5 rounded text-[10px] ${
                                            trip.status === 'pending' ? 'bg-slate-500/20 text-slate-300' :
                                            trip.status === 'assigned' ? 'bg-blue-500/20 text-blue-300' :
                                            trip.status === 'en_route_pickup' ? 'bg-amber-500/20 text-amber-300' :
                                            trip.status === 'guest_picked_up' ? 'bg-emerald-500/20 text-emerald-300' :
                                            'bg-cyan-500/20 text-cyan-300'
                                          }`}>
                                            {trip.status.replace(/_/g, ' ')}
                                          </span>
                                        </div>
                                        <p className="text-sm font-medium text-white">{trip.guestName}</p>
                                        <div className="flex items-center gap-4 mt-1 text-[10px] text-white/50">
                                          <span className="flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />
                                            {trip.pickupLocation.slice(0, 30)}...
                                          </span>
                                          <span>→</span>
                                          <span>{trip.dropoffLocation.slice(0, 30)}...</span>
                                        </div>
                                        {trip.flightNumber && (
                                          <div className="flex items-center gap-1 mt-1 text-[10px] text-blue-400">
                                            <Plane className="w-3 h-3" />
                                            {trip.flightNumber} • {trip.terminal}
                                          </div>
                                        )}
                                      </div>
                                      <div className="text-right">
                                        <p className="text-sm font-medium text-white">
                                          {new Date(trip.scheduledTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                        <p className="text-[10px] text-white/40">{trip.numberOfGuests} guests</p>
                                        {trip.driverName && (
                                          <p className="text-[10px] text-cyan-400 mt-1">{trip.driverName}</p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>

                          {/* Trip Details / Assign Panel */}
                          <div className="col-span-4 space-y-3">
                            {selectedTrip ? (
                              <div className="bg-white/5 rounded-xl border border-white/10 p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="text-sm font-medium text-white">Trip Details</h4>
                                  <button onClick={() => setSelectedTrip(null)} className="p-1 hover:bg-white/10 rounded">
                                    <X className="w-4 h-4 text-white/40" />
                                  </button>
                                </div>

                                <div className="space-y-3">
                                  <div className="bg-white/5 rounded-lg p-2">
                                    <p className="text-[10px] text-white/40">Guest</p>
                                    <p className="text-sm text-white">{selectedTrip.guestName}</p>
                                    {selectedTrip.guestRoom && <p className="text-[10px] text-white/50">Room {selectedTrip.guestRoom}</p>}
                                  </div>

                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-white/5 rounded-lg p-2">
                                      <p className="text-[10px] text-white/40">Guests</p>
                                      <p className="text-sm text-white">{selectedTrip.numberOfGuests}</p>
                                    </div>
                                    <div className="bg-white/5 rounded-lg p-2">
                                      <p className="text-[10px] text-white/40">Luggage</p>
                                      <p className="text-sm text-white">{selectedTrip.luggageCount || 0} pcs</p>
                                    </div>
                                  </div>

                                  <div className="bg-white/5 rounded-lg p-2">
                                    <p className="text-[10px] text-white/40">Route</p>
                                    <p className="text-xs text-white">{selectedTrip.pickupLocation}</p>
                                    <p className="text-[10px] text-white/30 my-1">↓</p>
                                    <p className="text-xs text-white">{selectedTrip.dropoffLocation}</p>
                                  </div>

                                  {selectedTrip.specialRequests && (
                                    <div className="bg-amber-500/10 rounded-lg p-2 border border-amber-500/20">
                                      <p className="text-[10px] text-amber-400">Special Requests</p>
                                      <p className="text-xs text-white/70">{selectedTrip.specialRequests}</p>
                                    </div>
                                  )}

                                  {selectedTrip.status === 'pending' && (
                                    <div>
                                      <p className="text-[10px] text-white/40 mb-2">Assign Driver & Vehicle</p>
                                      <select className="w-full bg-slate-800 border border-white/20 rounded-lg px-2 py-1.5 text-xs text-white mb-2">
                                        <option value="">Select Driver</option>
                                        {employees.filter(e => e.department === 'drivers' && e.status === 'on_duty').map(d => (
                                          <option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                      </select>
                                      <select className="w-full bg-slate-800 border border-white/20 rounded-lg px-2 py-1.5 text-xs text-white mb-2">
                                        <option value="">Select Vehicle</option>
                                        {vehicles.filter(v => v.status === 'available').map(v => (
                                          <option key={v.id} value={v.id}>{v.name} ({v.capacity} seats)</option>
                                        ))}
                                      </select>
                                      <button className="w-full px-3 py-2 text-xs bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg">
                                        Assign & Dispatch
                                      </button>
                                    </div>
                                  )}

                                  {selectedTrip.status !== 'pending' && selectedTrip.status !== 'completed' && (
                                    <div className="space-y-2">
                                      {/* Current Assignment */}
                                      {selectedTrip.driverName && (
                                        <div className="bg-cyan-500/10 rounded-lg p-2 border border-cyan-500/20">
                                          <p className="text-[10px] text-cyan-400">Current Driver</p>
                                          <div className="flex items-center justify-between">
                                            <p className="text-sm text-white">{selectedTrip.driverName}</p>
                                            <button
                                              onClick={() => setAssignDriverModal({
                                                tripId: selectedTrip.id,
                                                currentDriverId: selectedTrip.driverId,
                                                currentVehicleId: selectedTrip.vehicleId
                                              })}
                                              className="text-[10px] text-cyan-400 hover:text-cyan-300"
                                            >
                                              Change →
                                            </button>
                                          </div>
                                          {selectedTrip.vehicleName && (
                                            <p className="text-[10px] text-white/50">{selectedTrip.vehicleName}</p>
                                          )}
                                        </div>
                                      )}
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => {
                                            const nextStatus: Record<TripStatus, TripStatus> = {
                                              assigned: 'en_route_pickup',
                                              en_route_pickup: 'guest_picked_up',
                                              guest_picked_up: 'in_progress',
                                              in_progress: 'completed',
                                              pending: 'assigned',
                                              completed: 'completed',
                                              cancelled: 'cancelled',
                                            };
                                            updateTripStatus(selectedTrip.id, nextStatus[selectedTrip.status]);
                                          }}
                                          className="flex-1 px-3 py-2 text-xs bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg flex items-center justify-center gap-1"
                                        >
                                          <PlayCircle className="w-3 h-3" />
                                          Next Status
                                        </button>
                                        <button
                                          onClick={() => cancelTrip(selectedTrip.id)}
                                          className="px-3 py-2 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="bg-white/5 rounded-xl border border-white/10 p-4">
                                <h4 className="text-sm font-medium text-white mb-3">Available Drivers</h4>
                                <div className="space-y-2">
                                  {employees.filter(e => e.department === 'drivers' && e.status === 'on_duty').map(driver => (
                                    <div key={driver.id} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-[10px] text-white font-medium">
                                        {driver.name.split(' ').map(n => n[0]).join('')}
                                      </div>
                                      <div className="flex-1">
                                        <p className="text-xs text-white">{driver.name}</p>
                                        <p className="text-[10px] text-white/40">{driver.role}</p>
                                      </div>
                                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* New Requests */}
                            {transportationRequests.filter(r => r.status === 'new').length > 0 && (
                              <div className="bg-amber-500/10 rounded-xl border border-amber-500/20 p-4">
                                <h4 className="text-sm font-medium text-amber-400 mb-2 flex items-center gap-2">
                                  <Bell className="w-4 h-4" />
                                  New Requests ({transportationRequests.filter(r => r.status === 'new').length})
                                </h4>
                                <div className="space-y-2">
                                  {transportationRequests.filter(r => r.status === 'new').map(req => (
                                    <div key={req.id} className="bg-white/5 rounded-lg p-2">
                                      <p className="text-xs text-white">{req.guestName}</p>
                                      <p className="text-[10px] text-white/50">{req.requestType.replace(/_/g, ' ')}</p>
                                      <button
                                        onClick={() => convertRequestToTrip(req.id)}
                                        className="mt-1 text-[10px] text-indigo-400 hover:text-indigo-300"
                                      >
                                        Convert to Trip →
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* AI Insights & Assistant Panel */}
                        <div className="grid grid-cols-12 gap-4 mt-4">
                          {/* AI Insights */}
                          <div className="col-span-8 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-xl border border-indigo-500/20 p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <BrainCircuit className="w-5 h-5 text-indigo-400" />
                              <h4 className="text-sm font-medium text-white">{getDriverAiInsights().title}</h4>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-[10px] text-white/40 mb-2">Key Insights</p>
                                <div className="space-y-1.5">
                                  {getDriverAiInsights().insights.map((insight, i) => (
                                    <div key={i} className="flex items-start gap-2 text-xs text-white/70">
                                      <CircleDot className="w-3 h-3 text-indigo-400 mt-0.5 flex-shrink-0" />
                                      <span>{insight}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <p className="text-[10px] text-white/40 mb-2">Recommendations</p>
                                <div className="space-y-1.5">
                                  {getDriverAiInsights().recommendations.map((rec, i) => (
                                    <div key={i} className="flex items-start gap-2 text-xs text-white/70">
                                      <Sparkles className="w-3 h-3 text-purple-400 mt-0.5 flex-shrink-0" />
                                      <span>{rec}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* AI Assistant */}
                          <div className="col-span-4 bg-white/5 rounded-xl border border-white/10 p-4 flex flex-col">
                            <div className="flex items-center gap-2 mb-3">
                              <Bot className="w-4 h-4 text-cyan-400" />
                              <h4 className="text-sm font-medium text-white">AI Assistant</h4>
                            </div>

                            {/* FAQ Buttons */}
                            <div className="flex flex-wrap gap-1 mb-3">
                              {getDriverFaqs().map((faq, i) => (
                                <button
                                  key={i}
                                  onClick={() => {
                                    setDriverAiQuestion(faq.q);
                                    setTimeout(() => handleDriverAiQuestion(), 100);
                                  }}
                                  className="px-2 py-1 text-[10px] bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 rounded"
                                >
                                  {faq.label}
                                </button>
                              ))}
                            </div>

                            {/* Chat Messages */}
                            <div className="flex-1 min-h-[100px] max-h-[150px] overflow-auto space-y-2 mb-2">
                              {driverAiMessages.length === 0 ? (
                                <p className="text-xs text-white/30 text-center py-4">Ask me anything about dispatch operations</p>
                              ) : (
                                driverAiMessages.map((msg, i) => (
                                  <div key={i} className={`text-xs p-2 rounded ${msg.role === 'user' ? 'bg-cyan-500/20 text-cyan-100 ml-4' : 'bg-white/10 text-white/80 mr-4'}`}>
                                    <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
                                  </div>
                                ))
                              )}
                            </div>

                            {/* Input */}
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={driverAiQuestion}
                                onChange={(e) => setDriverAiQuestion(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleDriverAiQuestion()}
                                placeholder="Ask about drivers, trips..."
                                className="flex-1 px-2 py-1.5 bg-white/10 border border-white/20 rounded text-xs text-white placeholder-white/30"
                              />
                              <button
                                onClick={handleDriverAiQuestion}
                                className="px-2 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded"
                              >
                                <Send className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Fleet Management */}
                    {driverView === 'fleet' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-white">Vehicle Fleet ({vehicles.length})</h4>
                          <div className="flex gap-2 text-xs">
                            <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded">{vehicles.filter(v => v.status === 'available').length} Available</span>
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded">{vehicles.filter(v => v.status === 'in_use').length} In Use</span>
                            <span className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded">{vehicles.filter(v => v.status === 'maintenance').length} Maintenance</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          {vehicles.map(vehicle => (
                            <div
                              key={vehicle.id}
                              onClick={() => setSelectedVehicle(vehicle)}
                              className={`bg-white/5 rounded-xl p-4 border cursor-pointer transition-colors ${
                                selectedVehicle?.id === vehicle.id ? 'border-cyan-500/50 bg-cyan-500/10' : 'border-white/10 hover:bg-white/10'
                              }`}
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <p className="text-sm font-medium text-white">{vehicle.name}</p>
                                  <p className="text-[10px] text-white/40">{vehicle.licensePlate}</p>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[10px] ${
                                  vehicle.status === 'available' ? 'bg-emerald-500/20 text-emerald-300' :
                                  vehicle.status === 'in_use' ? 'bg-blue-500/20 text-blue-300' :
                                  vehicle.status === 'maintenance' ? 'bg-amber-500/20 text-amber-300' :
                                  'bg-red-500/20 text-red-300'
                                }`}>
                                  {vehicle.status.replace(/_/g, ' ')}
                                </span>
                              </div>

                              <div className="grid grid-cols-3 gap-2 mb-3">
                                <div className="text-center">
                                  <p className="text-lg font-bold text-white">{vehicle.capacity}</p>
                                  <p className="text-[10px] text-white/40">Seats</p>
                                </div>
                                <div className="text-center">
                                  <p className={`text-lg font-bold ${vehicle.fuelLevel > 50 ? 'text-emerald-400' : vehicle.fuelLevel > 25 ? 'text-amber-400' : 'text-red-400'}`}>
                                    {vehicle.fuelLevel}%
                                  </p>
                                  <p className="text-[10px] text-white/40">Fuel</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-lg font-bold text-white">{(vehicle.mileage / 1000).toFixed(0)}k</p>
                                  <p className="text-[10px] text-white/40">km</p>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-1">
                                {vehicle.features.slice(0, 3).map(f => (
                                  <span key={f} className="px-1.5 py-0.5 bg-white/10 rounded text-[8px] text-white/60">{f}</span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* AI Insights & Assistant Panel */}
                        <div className="grid grid-cols-12 gap-4 mt-4">
                          {/* AI Insights */}
                          <div className="col-span-8 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-xl border border-indigo-500/20 p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <BrainCircuit className="w-5 h-5 text-indigo-400" />
                              <h4 className="text-sm font-medium text-white">{getDriverAiInsights().title}</h4>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-[10px] text-white/40 mb-2">Key Insights</p>
                                <div className="space-y-1.5">
                                  {getDriverAiInsights().insights.map((insight, i) => (
                                    <div key={i} className="flex items-start gap-2 text-xs text-white/70">
                                      <CircleDot className="w-3 h-3 text-indigo-400 mt-0.5 flex-shrink-0" />
                                      <span>{insight}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <p className="text-[10px] text-white/40 mb-2">Recommendations</p>
                                <div className="space-y-1.5">
                                  {getDriverAiInsights().recommendations.map((rec, i) => (
                                    <div key={i} className="flex items-start gap-2 text-xs text-white/70">
                                      <Sparkles className="w-3 h-3 text-purple-400 mt-0.5 flex-shrink-0" />
                                      <span>{rec}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* AI Assistant */}
                          <div className="col-span-4 bg-white/5 rounded-xl border border-white/10 p-4 flex flex-col">
                            <div className="flex items-center gap-2 mb-3">
                              <Bot className="w-4 h-4 text-cyan-400" />
                              <h4 className="text-sm font-medium text-white">AI Assistant</h4>
                            </div>
                            <div className="flex flex-wrap gap-1 mb-3">
                              {getDriverFaqs().map((faq, i) => (
                                <button
                                  key={i}
                                  onClick={() => {
                                    setDriverAiQuestion(faq.q);
                                    setTimeout(() => handleDriverAiQuestion(), 100);
                                  }}
                                  className="px-2 py-1 text-[10px] bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 rounded"
                                >
                                  {faq.label}
                                </button>
                              ))}
                            </div>
                            <div className="flex-1 min-h-[80px] max-h-[120px] overflow-auto space-y-2 mb-2">
                              {driverAiMessages.length === 0 ? (
                                <p className="text-xs text-white/30 text-center py-4">Ask about fleet status</p>
                              ) : (
                                driverAiMessages.slice(-4).map((msg, i) => (
                                  <div key={i} className={`text-xs p-2 rounded ${msg.role === 'user' ? 'bg-cyan-500/20 text-cyan-100 ml-4' : 'bg-white/10 text-white/80 mr-4'}`}>
                                    <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
                                  </div>
                                ))
                              )}
                            </div>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={driverAiQuestion}
                                onChange={(e) => setDriverAiQuestion(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleDriverAiQuestion()}
                                placeholder="Ask about vehicles..."
                                className="flex-1 px-2 py-1.5 bg-white/10 border border-white/20 rounded text-xs text-white placeholder-white/30"
                              />
                              <button onClick={handleDriverAiQuestion} className="px-2 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded">
                                <Send className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Airport & Shuttles */}
                    {driverView === 'shuttles' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          {/* Airport Transfers */}
                          <div className="bg-white/5 rounded-xl border border-white/10 p-4">
                            <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                              <Plane className="w-4 h-4 text-blue-400" />
                              Airport Transfers Today
                            </h4>
                            <div className="space-y-2">
                              {driverTrips.filter(t => t.type === 'airport_pickup' || t.type === 'airport_dropoff').map(trip => (
                                <div key={trip.id} className="bg-white/5 rounded-lg p-3 border border-white/10">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className={`px-2 py-0.5 rounded text-[10px] ${
                                      trip.type === 'airport_pickup' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-blue-500/20 text-blue-300'
                                    }`}>
                                      {trip.type === 'airport_pickup' ? 'PICKUP' : 'DROPOFF'}
                                    </span>
                                    <span className="text-xs text-white">
                                      {new Date(trip.scheduledTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                  <p className="text-sm text-white">{trip.guestName}</p>
                                  {trip.flightNumber && (
                                    <p className="text-xs text-blue-400">{trip.flightNumber} • {trip.terminal}</p>
                                  )}
                                  <p className="text-[10px] text-white/40 mt-1">{trip.driverName || 'Unassigned'}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Shuttle Schedule */}
                          <div className="bg-white/5 rounded-xl border border-white/10 p-4">
                            <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                              <Truck className="w-4 h-4 text-cyan-400" />
                              Shuttle Schedule
                            </h4>
                            <div className="space-y-2">
                              {driverTrips.filter(t => t.type === 'shuttle').map(trip => (
                                <div key={trip.id} className="bg-white/5 rounded-lg p-3 border border-white/10">
                                  <div className="flex items-center justify-between mb-1">
                                    <p className="text-sm text-white">{trip.guestName}</p>
                                    <span className="text-xs text-cyan-400">
                                      {new Date(trip.scheduledTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-white/50">{trip.dropoffLocation}</p>
                                  <div className="flex items-center justify-between mt-1">
                                    <span className="text-[10px] text-white/40">{trip.numberOfGuests} guests</span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] ${
                                      trip.status === 'in_progress' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-500/20 text-slate-300'
                                    }`}>{trip.status}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* AI Insights & Assistant Panel */}
                        <div className="grid grid-cols-12 gap-4 mt-4">
                          {/* AI Insights */}
                          <div className="col-span-8 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl border border-blue-500/20 p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <BrainCircuit className="w-5 h-5 text-blue-400" />
                              <h4 className="text-sm font-medium text-white">{getDriverAiInsights().title}</h4>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-[10px] text-white/40 mb-2">Key Insights</p>
                                <div className="space-y-1.5">
                                  {getDriverAiInsights().insights.map((insight, i) => (
                                    <div key={i} className="flex items-start gap-2 text-xs text-white/70">
                                      <Plane className="w-3 h-3 text-blue-400 mt-0.5 flex-shrink-0" />
                                      <span>{insight}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <p className="text-[10px] text-white/40 mb-2">Recommendations</p>
                                <div className="space-y-1.5">
                                  {getDriverAiInsights().recommendations.map((rec, i) => (
                                    <div key={i} className="flex items-start gap-2 text-xs text-white/70">
                                      <Sparkles className="w-3 h-3 text-cyan-400 mt-0.5 flex-shrink-0" />
                                      <span>{rec}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* AI Assistant */}
                          <div className="col-span-4 bg-white/5 rounded-xl border border-white/10 p-4 flex flex-col">
                            <div className="flex items-center gap-2 mb-3">
                              <Bot className="w-4 h-4 text-cyan-400" />
                              <h4 className="text-sm font-medium text-white">AI Assistant</h4>
                            </div>
                            <div className="flex flex-wrap gap-1 mb-3">
                              {getDriverFaqs().map((faq, i) => (
                                <button
                                  key={i}
                                  onClick={() => {
                                    setDriverAiQuestion(faq.q);
                                    setTimeout(() => handleDriverAiQuestion(), 100);
                                  }}
                                  className="px-2 py-1 text-[10px] bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 rounded"
                                >
                                  {faq.label}
                                </button>
                              ))}
                            </div>
                            <div className="flex-1 min-h-[80px] max-h-[120px] overflow-auto space-y-2 mb-2">
                              {driverAiMessages.length === 0 ? (
                                <p className="text-xs text-white/30 text-center py-4">Ask about airport & shuttles</p>
                              ) : (
                                driverAiMessages.slice(-4).map((msg, i) => (
                                  <div key={i} className={`text-xs p-2 rounded ${msg.role === 'user' ? 'bg-blue-500/20 text-blue-100 ml-4' : 'bg-white/10 text-white/80 mr-4'}`}>
                                    <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
                                  </div>
                                ))
                              )}
                            </div>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={driverAiQuestion}
                                onChange={(e) => setDriverAiQuestion(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleDriverAiQuestion()}
                                placeholder="Ask about transfers..."
                                className="flex-1 px-2 py-1.5 bg-white/10 border border-white/20 rounded text-xs text-white placeholder-white/30"
                              />
                              <button onClick={handleDriverAiQuestion} className="px-2 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded">
                                <Send className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Deliveries & Errands */}
                    {driverView === 'deliveries' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-white">Deliveries & Errands</h4>
                          <button
                            onClick={() => {
                              setNewTripData(prev => ({ ...prev, type: 'delivery' }));
                              setNewTripModalOpen(true);
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-indigo-500 text-white hover:bg-indigo-600 rounded-lg"
                          >
                            <Plus className="w-3 h-3" />
                            New Task
                          </button>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          {['pending', 'in_progress', 'completed'].map(status => (
                            <div key={status} className={`rounded-xl border p-4 ${
                              status === 'pending' ? 'bg-amber-500/5 border-amber-500/20' :
                              status === 'in_progress' ? 'bg-blue-500/5 border-blue-500/20' :
                              'bg-emerald-500/5 border-emerald-500/20'
                            }`}>
                              <h5 className={`text-xs font-medium mb-3 ${
                                status === 'pending' ? 'text-amber-400' :
                                status === 'in_progress' ? 'text-blue-400' : 'text-emerald-400'
                              }`}>
                                {status === 'pending' ? 'Pending' : status === 'in_progress' ? 'In Progress' : 'Completed'}
                              </h5>
                              <div className="space-y-2">
                                {driverTrips
                                  .filter(t => (t.type === 'delivery' || t.type === 'errand') && t.status === status)
                                  .map(trip => (
                                    <div key={trip.id} className="bg-white/5 rounded-lg p-2 border border-white/10">
                                      <p className="text-xs text-white">{trip.guestName}</p>
                                      <p className="text-[10px] text-white/50">{trip.deliveryItems?.slice(0, 50)}...</p>
                                      <p className="text-[10px] text-white/40 mt-1">{trip.dropoffLocation}</p>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* AI Insights & Assistant Panel */}
                        <div className="grid grid-cols-12 gap-4 mt-4">
                          {/* AI Insights */}
                          <div className="col-span-8 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl border border-amber-500/20 p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <BrainCircuit className="w-5 h-5 text-amber-400" />
                              <h4 className="text-sm font-medium text-white">{getDriverAiInsights().title}</h4>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-[10px] text-white/40 mb-2">Key Insights</p>
                                <div className="space-y-1.5">
                                  {getDriverAiInsights().insights.map((insight, i) => (
                                    <div key={i} className="flex items-start gap-2 text-xs text-white/70">
                                      <Package className="w-3 h-3 text-amber-400 mt-0.5 flex-shrink-0" />
                                      <span>{insight}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <p className="text-[10px] text-white/40 mb-2">Recommendations</p>
                                <div className="space-y-1.5">
                                  {getDriverAiInsights().recommendations.map((rec, i) => (
                                    <div key={i} className="flex items-start gap-2 text-xs text-white/70">
                                      <Sparkles className="w-3 h-3 text-orange-400 mt-0.5 flex-shrink-0" />
                                      <span>{rec}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* AI Assistant */}
                          <div className="col-span-4 bg-white/5 rounded-xl border border-white/10 p-4 flex flex-col">
                            <div className="flex items-center gap-2 mb-3">
                              <Bot className="w-4 h-4 text-amber-400" />
                              <h4 className="text-sm font-medium text-white">AI Assistant</h4>
                            </div>
                            <div className="flex flex-wrap gap-1 mb-3">
                              {getDriverFaqs().map((faq, i) => (
                                <button
                                  key={i}
                                  onClick={() => {
                                    setDriverAiQuestion(faq.q);
                                    setTimeout(() => handleDriverAiQuestion(), 100);
                                  }}
                                  className="px-2 py-1 text-[10px] bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 rounded"
                                >
                                  {faq.label}
                                </button>
                              ))}
                            </div>
                            <div className="flex-1 min-h-[80px] max-h-[120px] overflow-auto space-y-2 mb-2">
                              {driverAiMessages.length === 0 ? (
                                <p className="text-xs text-white/30 text-center py-4">Ask about deliveries</p>
                              ) : (
                                driverAiMessages.slice(-4).map((msg, i) => (
                                  <div key={i} className={`text-xs p-2 rounded ${msg.role === 'user' ? 'bg-amber-500/20 text-amber-100 ml-4' : 'bg-white/10 text-white/80 mr-4'}`}>
                                    <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
                                  </div>
                                ))
                              )}
                            </div>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={driverAiQuestion}
                                onChange={(e) => setDriverAiQuestion(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleDriverAiQuestion()}
                                placeholder="Ask about deliveries..."
                                className="flex-1 px-2 py-1.5 bg-white/10 border border-white/20 rounded text-xs text-white placeholder-white/30"
                              />
                              <button onClick={handleDriverAiQuestion} className="px-2 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded">
                                <Send className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Messages */}
                    {driverView === 'messages' && (
                      <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-4 bg-white/5 rounded-xl border border-white/10 p-4">
                          <h4 className="text-sm font-medium text-white mb-3">Drivers</h4>
                          <div className="space-y-2">
                            {employees.filter(e => e.department === 'drivers').map(driver => (
                              <div key={driver.id} className="flex items-center gap-3 p-2 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-[10px] text-white font-medium">
                                  {driver.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div className="flex-1">
                                  <p className="text-xs text-white">{driver.name}</p>
                                  <p className="text-[10px] text-white/40">{driver.status.replace(/_/g, ' ')}</p>
                                </div>
                                <span className={`w-2 h-2 rounded-full ${driver.status === 'on_duty' ? 'bg-emerald-400' : 'bg-slate-400'}`} />
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="col-span-8 bg-white/5 rounded-xl border border-white/10 p-4 flex flex-col">
                          <h4 className="text-sm font-medium text-white mb-3">Recent Messages</h4>
                          <div className="flex-1 space-y-2 max-h-[350px] overflow-auto mb-3">
                            {driverMessages.map(msg => (
                              <div key={msg.id} className={`p-2 rounded-lg ${
                                msg.senderRole === 'driver' ? 'bg-cyan-500/10 ml-8' : 'bg-white/5 mr-8'
                              }`}>
                                <div className="flex items-center justify-between mb-1">
                                  <p className="text-[10px] font-medium text-white/70">{msg.senderName}</p>
                                  <p className="text-[10px] text-white/40">
                                    {new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                </div>
                                <p className="text-xs text-white/80">{msg.message}</p>
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={driverMessage}
                              onChange={(e) => setDriverMessage(e.target.value)}
                              placeholder="Type a message..."
                              className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-xs text-white placeholder-white/30"
                            />
                            <button className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg">
                              <Send className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Analytics */}
                    {driverView === 'analytics' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-4 gap-4">
                          <div className="bg-white/5 rounded-xl border border-white/10 p-4">
                            <p className="text-[10px] text-white/40 mb-1">Total Trips Today</p>
                            <p className="text-3xl font-bold text-white">{driverMetrics.totalTripsToday}</p>
                          </div>
                          <div className="bg-white/5 rounded-xl border border-white/10 p-4">
                            <p className="text-[10px] text-white/40 mb-1">Revenue Today</p>
                            <p className="text-3xl font-bold text-emerald-400">¥{driverMetrics.revenueToday.toLocaleString()}</p>
                          </div>
                          <div className="bg-white/5 rounded-xl border border-white/10 p-4">
                            <p className="text-[10px] text-white/40 mb-1">Distance Covered</p>
                            <p className="text-3xl font-bold text-blue-400">{Math.round(driverMetrics.totalDistanceToday)} km</p>
                          </div>
                          <div className="bg-white/5 rounded-xl border border-white/10 p-4">
                            <p className="text-[10px] text-white/40 mb-1">Fuel Cost</p>
                            <p className="text-3xl font-bold text-amber-400">¥{driverMetrics.fuelCostToday.toLocaleString()}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white/5 rounded-xl border border-white/10 p-4">
                            <h4 className="text-sm font-medium text-white mb-3">Trip Types Breakdown</h4>
                            <div className="space-y-2">
                              {[
                                { label: 'Airport Transfers', value: driverMetrics.airportTripsToday, color: 'bg-blue-500' },
                                { label: 'Shuttles', value: driverMetrics.shuttleTripsToday, color: 'bg-cyan-500' },
                                { label: 'VIP Transfers', value: driverMetrics.vipTripsToday, color: 'bg-purple-500' },
                                { label: 'Deliveries', value: driverMetrics.deliveriesCompleted, color: 'bg-amber-500' },
                              ].map(item => (
                                <div key={item.label} className="flex items-center gap-3">
                                  <div className={`w-3 h-3 rounded ${item.color}`} />
                                  <span className="flex-1 text-xs text-white/70">{item.label}</span>
                                  <span className="text-sm font-medium text-white">{item.value}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="bg-white/5 rounded-xl border border-white/10 p-4">
                            <h4 className="text-sm font-medium text-white mb-3">Performance Metrics</h4>
                            <div className="space-y-3">
                              <div>
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-white/50">On-Time Rate</span>
                                  <span className="text-white">{driverMetrics.onTimeRate}%</span>
                                </div>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${driverMetrics.onTimeRate}%` }} />
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-white/50">Guest Satisfaction</span>
                                  <span className="text-white">{driverMetrics.guestSatisfaction}/5.0</span>
                                </div>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${driverMetrics.guestSatisfaction * 20}%` }} />
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-white/50">Avg Wait Time</span>
                                  <span className="text-white">{driverMetrics.avgWaitTime} min</span>
                                </div>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(100, (15 - driverMetrics.avgWaitTime) / 15 * 100)}%` }} />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* New Trip Modal */}
                    {newTripModalOpen && (
                      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
                        <div className="bg-slate-900 rounded-2xl border border-white/20 w-full max-w-lg max-h-[85vh] overflow-auto">
                          <div className="p-4 border-b border-white/10 flex items-center justify-between sticky top-0 bg-slate-900 z-10">
                            <h3 className="text-lg font-semibold text-white">Create New Trip</h3>
                            <button onClick={() => setNewTripModalOpen(false)} className="p-1 hover:bg-white/10 rounded">
                              <X className="w-5 h-5 text-white/60" />
                            </button>
                          </div>
                          <div className="p-4 space-y-4">
                            <div>
                              <label className="block text-xs text-white/60 mb-1">Trip Type</label>
                              <select
                                value={newTripData.type || 'airport_pickup'}
                                onChange={(e) => setNewTripData(prev => ({ ...prev, type: e.target.value as any }))}
                                className="w-full bg-slate-800 border border-white/20 rounded-lg px-3 py-2 text-sm text-white"
                              >
                                <option value="airport_pickup">Airport Pickup</option>
                                <option value="airport_dropoff">Airport Dropoff</option>
                                <option value="shuttle">Shuttle</option>
                                <option value="vip_transfer">VIP Transfer</option>
                                <option value="tour">Tour</option>
                                <option value="delivery">Delivery</option>
                                <option value="errand">Errand</option>
                                <option value="event">Event</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs text-white/60 mb-1">Priority</label>
                              <select
                                value={newTripData.priority || 'normal'}
                                onChange={(e) => setNewTripData(prev => ({ ...prev, priority: e.target.value as any }))}
                                className="w-full bg-slate-800 border border-white/20 rounded-lg px-3 py-2 text-sm text-white"
                              >
                                <option value="normal">Normal</option>
                                <option value="priority">Priority</option>
                                <option value="vip">VIP</option>
                                <option value="urgent">Urgent</option>
                              </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs text-white/60 mb-1">Guest Name *</label>
                                <input
                                  type="text"
                                  value={newTripData.guestName || ''}
                                  onChange={(e) => setNewTripData(prev => ({ ...prev, guestName: e.target.value }))}
                                  className="w-full bg-slate-800 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30"
                                  placeholder="Guest name"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-white/60 mb-1">Room Number</label>
                                <input
                                  type="text"
                                  value={newTripData.guestRoom || ''}
                                  onChange={(e) => setNewTripData(prev => ({ ...prev, guestRoom: e.target.value }))}
                                  className="w-full bg-slate-800 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30"
                                  placeholder="Room #"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs text-white/60 mb-1">Number of Guests</label>
                                <input
                                  type="number"
                                  min="1"
                                  value={newTripData.numberOfGuests || 1}
                                  onChange={(e) => setNewTripData(prev => ({ ...prev, numberOfGuests: parseInt(e.target.value) || 1 }))}
                                  className="w-full bg-slate-800 border border-white/20 rounded-lg px-3 py-2 text-sm text-white"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-white/60 mb-1">Scheduled Time</label>
                                <input
                                  type="datetime-local"
                                  value={newTripData.scheduledTime?.slice(0, 16) || ''}
                                  onChange={(e) => setNewTripData(prev => ({ ...prev, scheduledTime: new Date(e.target.value).toISOString() }))}
                                  className="w-full bg-slate-800 border border-white/20 rounded-lg px-3 py-2 text-sm text-white"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs text-white/60 mb-1">Pickup Location *</label>
                              <input
                                type="text"
                                value={newTripData.pickupLocation || ''}
                                onChange={(e) => setNewTripData(prev => ({ ...prev, pickupLocation: e.target.value }))}
                                className="w-full bg-slate-800 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30"
                                placeholder="Pickup address"
                              />
                            </div>

                            <div>
                              <label className="block text-xs text-white/60 mb-1">Dropoff Location *</label>
                              <input
                                type="text"
                                value={newTripData.dropoffLocation || ''}
                                onChange={(e) => setNewTripData(prev => ({ ...prev, dropoffLocation: e.target.value }))}
                                className="w-full bg-slate-800 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30"
                                placeholder="Dropoff address"
                              />
                            </div>

                            {(newTripData.type === 'airport_pickup' || newTripData.type === 'airport_dropoff') && (
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs text-white/60 mb-1">Flight Number</label>
                                  <input
                                    type="text"
                                    value={newTripData.flightNumber || ''}
                                    onChange={(e) => setNewTripData(prev => ({ ...prev, flightNumber: e.target.value }))}
                                    className="w-full bg-slate-800 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30"
                                    placeholder="e.g. JL123"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-white/60 mb-1">Terminal</label>
                                  <input
                                    type="text"
                                    value={newTripData.terminal || ''}
                                    onChange={(e) => setNewTripData(prev => ({ ...prev, terminal: e.target.value }))}
                                    className="w-full bg-slate-800 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30"
                                    placeholder="Terminal"
                                  />
                                </div>
                              </div>
                            )}

                            {(newTripData.type === 'delivery' || newTripData.type === 'errand') && (
                              <div>
                                <label className="block text-xs text-white/60 mb-1">Delivery Items / Description</label>
                                <textarea
                                  value={newTripData.deliveryItems || ''}
                                  onChange={(e) => setNewTripData(prev => ({ ...prev, deliveryItems: e.target.value }))}
                                  className="w-full bg-slate-800 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 h-20 resize-none"
                                  placeholder="Describe the delivery items or errand"
                                />
                              </div>
                            )}

                            <div>
                              <label className="block text-xs text-white/60 mb-1">Special Requests</label>
                              <textarea
                                value={newTripData.specialRequests || ''}
                                onChange={(e) => setNewTripData(prev => ({ ...prev, specialRequests: e.target.value }))}
                                className="w-full bg-slate-800 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 h-16 resize-none"
                                placeholder="Any special requirements..."
                              />
                            </div>
                          </div>
                          <div className="p-4 border-t border-white/10 flex gap-3 sticky bottom-0 bg-slate-900">
                            <button
                              onClick={() => setNewTripModalOpen(false)}
                              className="flex-1 px-4 py-2 text-sm bg-white/10 hover:bg-white/20 text-white rounded-lg"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleCreateTrip}
                              disabled={!newTripData.guestName || !newTripData.pickupLocation || !newTripData.dropoffLocation}
                              className="flex-1 px-4 py-2 text-sm bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-500/50 disabled:cursor-not-allowed text-white rounded-lg"
                            >
                              Create Trip
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Assign/Change Driver Modal */}
                    {assignDriverModal && (
                      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
                        <div className="bg-slate-900 rounded-2xl border border-white/20 w-full max-w-md">
                          <div className="p-4 border-b border-white/10 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-white">
                              {assignDriverModal.currentDriverId ? 'Change Driver' : 'Assign Driver'}
                            </h3>
                            <button onClick={() => setAssignDriverModal(null)} className="p-1 hover:bg-white/10 rounded">
                              <X className="w-5 h-5 text-white/60" />
                            </button>
                          </div>
                          <div className="p-4 space-y-4">
                            <div>
                              <label className="block text-xs text-white/60 mb-2">Select Driver</label>
                              <div className="space-y-2 max-h-[200px] overflow-auto">
                                {employees.filter(e => e.department === 'drivers' && e.status === 'on_duty').map(driver => (
                                  <label
                                    key={driver.id}
                                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                      assignDriverModal.currentDriverId === driver.id
                                        ? 'bg-cyan-500/20 border-cyan-500/50'
                                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                                    }`}
                                  >
                                    <input
                                      type="radio"
                                      name="driver"
                                      value={driver.id}
                                      checked={assignDriverModal.currentDriverId === driver.id}
                                      onChange={() => setAssignDriverModal(prev => prev ? { ...prev, currentDriverId: driver.id } : null)}
                                      className="sr-only"
                                    />
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-[10px] text-white font-medium">
                                      {driver.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-sm text-white">{driver.name}</p>
                                      <p className="text-[10px] text-white/40">{driver.role}</p>
                                    </div>
                                    {assignDriverModal.currentDriverId === driver.id && (
                                      <CheckCircle className="w-5 h-5 text-cyan-400" />
                                    )}
                                  </label>
                                ))}
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs text-white/60 mb-2">Select Vehicle</label>
                              <select
                                value={assignDriverModal.currentVehicleId || ''}
                                onChange={(e) => setAssignDriverModal(prev => prev ? { ...prev, currentVehicleId: e.target.value } : null)}
                                className="w-full bg-slate-800 border border-white/20 rounded-lg px-3 py-2 text-sm text-white"
                              >
                                <option value="">Select a vehicle</option>
                                {vehicles.filter(v => v.status === 'available').map(v => (
                                  <option key={v.id} value={v.id}>{v.name} ({v.capacity} seats) - {v.fuelLevel}% fuel</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div className="p-4 border-t border-white/10 flex gap-3">
                            <button
                              onClick={() => setAssignDriverModal(null)}
                              className="flex-1 px-4 py-2 text-sm bg-white/10 hover:bg-white/20 text-white rounded-lg"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => {
                                if (assignDriverModal.currentDriverId && assignDriverModal.currentVehicleId) {
                                  assignDriverToTrip(
                                    assignDriverModal.tripId,
                                    assignDriverModal.currentDriverId,
                                    assignDriverModal.currentVehicleId
                                  );
                                  setAssignDriverModal(null);
                                  setSelectedTrip(null);
                                }
                              }}
                              disabled={!assignDriverModal.currentDriverId || !assignDriverModal.currentVehicleId}
                              className="flex-1 px-4 py-2 text-sm bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-500/50 disabled:cursor-not-allowed text-white rounded-lg"
                            >
                              {assignDriverModal.currentDriverId ? 'Update Assignment' : 'Assign Driver'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Standard Department Views (non-driver) */}
                {deptModalDept !== 'drivers' && (
                  <>
                {/* Overview Tab */}
                {deptModalView === 'overview' && (
                  <div className="space-y-4">
                    {/* AI Housekeeping Insights - Only for Housekeeping */}
                    {deptModalDept === 'housekeeping' && (
                      <HousekeepingAIInsights
                        metrics={housekeepingMetrics}
                        rooms={housekeepingRooms}
                      />
                    )}

                    <div className="grid grid-cols-12 gap-4">
                    {/* Department Stats */}
                    <div className="col-span-8 space-y-4">
                      {/* Key Metrics Grid */}
                      <div className="grid grid-cols-4 gap-3">
                        {departmentFeatures[deptModalDept].specialMetrics().map((metric, i) => (
                          <div key={i} className={`${metric.color} rounded-xl p-4 border border-white/10`}>
                            <p className="text-[10px] text-white/40 mb-1">{metric.label}</p>
                            <div className="flex items-center gap-2">
                              <p className="text-xl font-bold text-white">{metric.value}</p>
                              {metric.trend && (
                                <span className={`text-xs ${
                                  metric.trend === 'up' ? 'text-emerald-400' :
                                  metric.trend === 'down' ? 'text-red-400' : 'text-white/40'
                                }`}>
                                  {metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '−'}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Staff Overview */}
                      <div className="bg-white/5 rounded-xl border border-white/10 p-4">
                        <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                          <Users className="w-4 h-4 text-white/60" />
                          Staff Overview
                        </h4>
                        <div className="grid grid-cols-4 gap-3">
                          {(() => {
                            const deptEmployees = employees.filter(e => e.department === deptModalDept);
                            const onDuty = deptEmployees.filter(e => e.status === 'on_duty').length;
                            const onBreak = deptEmployees.filter(e => e.status === 'on_break').length;
                            const offDuty = deptEmployees.filter(e => e.status === 'off_duty').length;
                            const onLeave = deptEmployees.filter(e => e.status === 'on_leave' || e.status === 'sick').length;
                            return (
                              <>
                                <div className="bg-emerald-500/10 rounded-lg p-3 border border-emerald-500/20">
                                  <p className="text-[10px] text-emerald-400">On Duty</p>
                                  <p className="text-2xl font-bold text-emerald-400">{onDuty}</p>
                                </div>
                                <div className="bg-amber-500/10 rounded-lg p-3 border border-amber-500/20">
                                  <p className="text-[10px] text-amber-400">On Break</p>
                                  <p className="text-2xl font-bold text-amber-400">{onBreak}</p>
                                </div>
                                <div className="bg-slate-500/10 rounded-lg p-3 border border-slate-500/20">
                                  <p className="text-[10px] text-slate-400">Off Duty</p>
                                  <p className="text-2xl font-bold text-slate-400">{offDuty}</p>
                                </div>
                                <div className="bg-purple-500/10 rounded-lg p-3 border border-purple-500/20">
                                  <p className="text-[10px] text-purple-400">Leave/Sick</p>
                                  <p className="text-2xl font-bold text-purple-400">{onLeave}</p>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Department Features */}
                      <div className="bg-white/5 rounded-xl border border-white/10 p-4">
                        <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-indigo-400" />
                          Department Features
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {departmentFeatures[deptModalDept].features.map((feature, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs text-white/70 bg-white/5 rounded-lg px-3 py-2">
                              <CheckCircle className="w-3 h-3 text-emerald-400" />
                              {feature}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Today's Tasks Summary */}
                      <div className="bg-white/5 rounded-xl border border-white/10 p-4">
                        <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                          <ClipboardList className="w-4 h-4 text-white/60" />
                          Today&apos;s Tasks
                        </h4>
                        <div className="grid grid-cols-3 gap-3">
                          {(() => {
                            const deptStats = departmentMetrics.find(d => d.department === deptModalDept);
                            return (
                              <>
                                <div className="bg-white/5 rounded-lg p-3 text-center">
                                  <p className="text-2xl font-bold text-white">{(deptStats?.tasksCompleted || 0) + (deptStats?.tasksPending || 0)}</p>
                                  <p className="text-[10px] text-white/40">Total Tasks</p>
                                </div>
                                <div className="bg-emerald-500/10 rounded-lg p-3 text-center">
                                  <p className="text-2xl font-bold text-emerald-400">{deptStats?.tasksCompleted || 0}</p>
                                  <p className="text-[10px] text-emerald-400/60">Completed</p>
                                </div>
                                <div className="bg-amber-500/10 rounded-lg p-3 text-center">
                                  <p className="text-2xl font-bold text-amber-400">{deptStats?.tasksPending || 0}</p>
                                  <p className="text-[10px] text-amber-400/60">Pending</p>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* AI Assistant Sidebar */}
                    <div className="col-span-4 bg-gradient-to-b from-indigo-500/10 to-purple-500/10 rounded-xl border border-indigo-500/20 p-4 flex flex-col h-fit">
                      <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                        <BrainCircuit className="w-4 h-4 text-indigo-400" />
                        {departmentConfig[deptModalDept].label} AI Assistant
                      </h4>

                      {/* Quick FAQ Links */}
                      <div className="mb-3">
                        <p className="text-[10px] text-white/40 mb-2">Quick Questions</p>
                        <div className="flex flex-wrap gap-1">
                          {departmentFeatures[deptModalDept].faqs.map((faq, i) => (
                            <button
                              key={i}
                              onClick={() => {
                                setDeptAiQuestion(faq.q);
                                setTimeout(() => handleDeptAiQuestion(), 100);
                              }}
                              className="px-2 py-1 text-[10px] bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded border border-white/10 transition-colors"
                            >
                              {faq.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Chat Messages */}
                      <div className="flex-1 max-h-[300px] overflow-auto mb-3 space-y-2">
                        {deptAiMessages.length === 0 ? (
                          <p className="text-xs text-white/40 text-center py-4">
                            Ask me anything about {departmentConfig[deptModalDept].label.toLowerCase()} operations, staffing, or performance.
                          </p>
                        ) : (
                          deptAiMessages.map((msg, i) => (
                            <div
                              key={i}
                              className={`p-2 rounded-lg text-xs ${
                                msg.role === 'user'
                                  ? 'bg-indigo-500/20 text-indigo-200 ml-4'
                                  : 'bg-white/10 text-white/80 mr-4'
                              }`}
                            >
                              {msg.content}
                            </div>
                          ))
                        )}
                      </div>

                      {/* Input */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={deptAiQuestion}
                          onChange={(e) => setDeptAiQuestion(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleDeptAiQuestion()}
                          placeholder="Ask about this department..."
                          className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-xs text-white placeholder-white/30"
                        />
                        <button
                          onClick={handleDeptAiQuestion}
                          className="px-3 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
                        >
                          <Send className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                  </div>
                )}

                {/* Employees Tab */}
                {deptModalView === 'employees' && (
                  <div className="grid grid-cols-12 gap-4 h-full">
                    {/* Employee List */}
                    <div className={`${deptSelectedEmployee ? 'col-span-5' : 'col-span-12'} space-y-3`}>
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-white">
                          {departmentConfig[deptModalDept].label} Staff ({employees.filter(e => e.department === deptModalDept).length})
                        </h4>
                        <button className="flex items-center gap-1 px-3 py-1.5 text-xs bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 rounded-lg transition-colors">
                          <UserPlus className="w-3 h-3" />
                          Add Employee
                        </button>
                      </div>
                      <div className={`grid ${deptSelectedEmployee ? 'grid-cols-1' : 'grid-cols-2'} gap-2 max-h-[500px] overflow-auto`}>
                        {employees.filter(e => e.department === deptModalDept).map(emp => (
                          <div
                            key={emp.id}
                            onClick={() => {
                              setDeptSelectedEmployee(emp);
                              setDeptEditMode(false);
                              setDeptEditedEmployee({});
                            }}
                            className={`bg-white/5 hover:bg-white/10 rounded-xl p-3 border cursor-pointer transition-colors ${
                              deptSelectedEmployee?.id === emp.id ? 'border-indigo-500/50 bg-indigo-500/10' : 'border-white/10'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium text-xs">
                                {emp.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium text-white truncate">{emp.name}</p>
                                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                    emp.status === 'on_duty' ? 'bg-emerald-400' :
                                    emp.status === 'on_break' ? 'bg-amber-400' :
                                    emp.status === 'off_duty' ? 'bg-slate-400' : 'bg-purple-400'
                                  }`} />
                                </div>
                                <p className="text-[10px] text-white/40 truncate">{emp.role}</p>
                              </div>
                              {!deptSelectedEmployee && (
                                <div className="text-right">
                                  <p className={`text-xs font-medium ${
                                    emp.performanceScore >= 90 ? 'text-emerald-400' :
                                    emp.performanceScore >= 75 ? 'text-blue-400' : 'text-amber-400'
                                  }`}>{emp.performanceScore}%</p>
                                  <p className="text-[10px] text-white/40">{emp.hoursThisWeek}h</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Employee Detail Panel */}
                    {deptSelectedEmployee && (
                      <div className="col-span-7 bg-white/5 rounded-xl border border-white/10 p-4 overflow-auto max-h-[550px]">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                              {deptSelectedEmployee.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              {deptEditMode ? (
                                <input
                                  type="text"
                                  value={deptEditedEmployee.name || deptSelectedEmployee.name}
                                  onChange={(e) => setDeptEditedEmployee({ ...deptEditedEmployee, name: e.target.value })}
                                  className="px-2 py-1 bg-white/10 border border-white/20 rounded text-sm text-white font-medium"
                                />
                              ) : (
                                <h3 className="text-lg font-semibold text-white">{deptSelectedEmployee.name}</h3>
                              )}
                              {deptEditMode ? (
                                <input
                                  type="text"
                                  value={deptEditedEmployee.role || deptSelectedEmployee.role}
                                  onChange={(e) => setDeptEditedEmployee({ ...deptEditedEmployee, role: e.target.value })}
                                  className="px-2 py-1 bg-white/10 border border-white/20 rounded text-xs text-white/60 mt-1"
                                />
                              ) : (
                                <p className="text-xs text-white/50">{deptSelectedEmployee.role}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {deptEditMode ? (
                              <>
                                <button
                                  onClick={() => {
                                    // Save changes would go here
                                    setDeptEditMode(false);
                                    setDeptEditedEmployee({});
                                  }}
                                  className="p-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg transition-colors"
                                >
                                  <Save className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setDeptEditMode(false);
                                    setDeptEditedEmployee({});
                                  }}
                                  className="p-2 bg-white/10 hover:bg-white/20 text-white/60 rounded-lg transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => {
                                  setDeptEditMode(true);
                                  setDeptEditedEmployee({ ...deptSelectedEmployee });
                                }}
                                className="p-2 bg-white/10 hover:bg-white/20 text-white/60 rounded-lg transition-colors"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => setDeptSelectedEmployee(null)}
                              className="p-2 bg-white/10 hover:bg-white/20 text-white/60 rounded-lg transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Status & Performance */}
                        <div className="grid grid-cols-3 gap-3 mb-4">
                          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                            <p className="text-[10px] text-white/40 mb-1">Status</p>
                            {deptEditMode ? (
                              <select
                                value={deptEditedEmployee.status || deptSelectedEmployee.status}
                                onChange={(e) => setDeptEditedEmployee({ ...deptEditedEmployee, status: e.target.value as Employee['status'] })}
                                className="w-full bg-slate-800 border border-white/20 rounded px-2 py-1 text-xs text-white"
                              >
                                <option value="on_duty">On Duty</option>
                                <option value="on_break">On Break</option>
                                <option value="off_duty">Off Duty</option>
                                <option value="on_leave">On Leave</option>
                                <option value="sick">Sick</option>
                              </select>
                            ) : (
                              <span className={`px-2 py-0.5 rounded-full text-xs ${
                                deptSelectedEmployee.status === 'on_duty' ? 'bg-emerald-500/20 text-emerald-300' :
                                deptSelectedEmployee.status === 'on_break' ? 'bg-amber-500/20 text-amber-300' :
                                deptSelectedEmployee.status === 'on_leave' || deptSelectedEmployee.status === 'sick' ? 'bg-purple-500/20 text-purple-300' :
                                'bg-slate-500/20 text-slate-300'
                              }`}>
                                {deptSelectedEmployee.status.replace('_', ' ')}
                              </span>
                            )}
                          </div>
                          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                            <p className="text-[10px] text-white/40 mb-1">Performance</p>
                            <p className={`text-lg font-bold ${
                              deptSelectedEmployee.performanceScore >= 90 ? 'text-emerald-400' :
                              deptSelectedEmployee.performanceScore >= 75 ? 'text-blue-400' :
                              deptSelectedEmployee.performanceScore >= 60 ? 'text-amber-400' : 'text-red-400'
                            }`}>{deptSelectedEmployee.performanceScore}%</p>
                          </div>
                          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                            <p className="text-[10px] text-white/40 mb-1">Hours This Week</p>
                            <p className="text-lg font-bold text-white">
                              {deptSelectedEmployee.hoursThisWeek}h
                              {deptSelectedEmployee.overtimeHours > 0 && (
                                <span className="text-sm text-amber-400 ml-1">+{deptSelectedEmployee.overtimeHours}</span>
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Contact Info */}
                        <div className="bg-white/5 rounded-lg p-3 border border-white/10 mb-4">
                          <p className="text-[10px] text-white/40 mb-2">Contact Information</p>
                          {deptEditMode ? (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Phone className="w-3 h-3 text-white/40" />
                                <input
                                  type="text"
                                  value={deptEditedEmployee.phone || deptSelectedEmployee.phone}
                                  onChange={(e) => setDeptEditedEmployee({ ...deptEditedEmployee, phone: e.target.value })}
                                  className="flex-1 px-2 py-1 bg-white/10 border border-white/20 rounded text-xs text-white"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <Mail className="w-3 h-3 text-white/40" />
                                <input
                                  type="email"
                                  value={deptEditedEmployee.email || deptSelectedEmployee.email}
                                  onChange={(e) => setDeptEditedEmployee({ ...deptEditedEmployee, email: e.target.value })}
                                  className="flex-1 px-2 py-1 bg-white/10 border border-white/20 rounded text-xs text-white"
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2 text-xs text-white/60">
                                <Phone className="w-3 h-3" />
                                <span>{deptSelectedEmployee.phone}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-white/60">
                                <Mail className="w-3 h-3" />
                                <span>{deptSelectedEmployee.email}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-white/60">
                                <Calendar className="w-3 h-3" />
                                <span>Hired: {deptSelectedEmployee.hireDate}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Skills */}
                        <div className="mb-4">
                          <p className="text-[10px] text-white/40 mb-2">Skills</p>
                          <div className="flex flex-wrap gap-1">
                            {deptSelectedEmployee.skills.map(skill => (
                              <span key={skill} className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded text-[10px]">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Certifications */}
                        <div className="mb-4">
                          <p className="text-[10px] text-white/40 mb-2">Certifications</p>
                          <div className="flex flex-wrap gap-1">
                            {deptSelectedEmployee.certifications.map(cert => (
                              <span key={cert} className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded text-[10px]">
                                {cert}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Upcoming Shifts */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-[10px] text-white/40">Upcoming Shifts</p>
                            <button
                              onClick={() => {
                                setNewShift({ employeeId: deptSelectedEmployee.id, department: deptModalDept });
                                setNewShiftModal(true);
                              }}
                              className="text-[10px] text-indigo-400 hover:text-indigo-300"
                            >
                              + Add Shift
                            </button>
                          </div>
                          <div className="space-y-1 max-h-[150px] overflow-auto">
                            {shifts
                              .filter(s => s.employeeId === deptSelectedEmployee.id && new Date(s.date) >= new Date())
                              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                              .slice(0, 7)
                              .map(shift => (
                                <div key={shift.id} className="flex items-center justify-between text-xs bg-white/5 rounded px-2 py-1.5 border border-white/10 group">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${shiftTypeConfig[shift.shiftType].color}`} />
                                    <span className="text-white/70">{new Date(shift.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-white/50">{shiftTypeConfig[shift.shiftType].time}</span>
                                    <button
                                      onClick={() => setDeptEditingShift(shift)}
                                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-all"
                                    >
                                      <Edit3 className="w-3 h-3 text-white/40" />
                                    </button>
                                  </div>
                                </div>
                              ))
                            }
                            {shifts.filter(s => s.employeeId === deptSelectedEmployee.id && new Date(s.date) >= new Date()).length === 0 && (
                              <p className="text-[10px] text-white/40 text-center py-2">No upcoming shifts</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Shifts Tab */}
                {deptModalView === 'shifts' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <h4 className="text-sm font-medium text-white">Shift Schedule</h4>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setShiftWeekOffset(shiftWeekOffset - 1)}
                            className="p-1 hover:bg-white/10 rounded transition-colors"
                          >
                            <ChevronLeft className="w-4 h-4 text-white/60" />
                          </button>
                          <span className="text-xs text-white/60">
                            {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                          <button
                            onClick={() => setShiftWeekOffset(shiftWeekOffset + 1)}
                            className="p-1 hover:bg-white/10 rounded transition-colors"
                          >
                            <ChevronRight className="w-4 h-4 text-white/60" />
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setNewShift({ department: deptModalDept });
                          setNewShiftModal(true);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 rounded-lg transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        Add Shift
                      </button>
                    </div>

                    {/* Shift Calendar Grid */}
                    <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                      <div className="grid grid-cols-8 border-b border-white/10">
                        <div className="p-2 text-xs text-white/40 bg-white/5">Employee</div>
                        {weekDates.map((date, i) => (
                          <div
                            key={i}
                            className={`p-2 text-center text-xs ${
                              date.toDateString() === new Date().toDateString()
                                ? 'bg-indigo-500/20 text-indigo-300'
                                : 'text-white/60 bg-white/5'
                            }`}
                          >
                            <div className="font-medium">{dayNames[i]}</div>
                            <div className="text-[10px] text-white/40">{date.getDate()}</div>
                          </div>
                        ))}
                      </div>
                      {employees.filter(e => e.department === deptModalDept).slice(0, 8).map(emp => (
                        <div key={emp.id} className="grid grid-cols-8 border-b border-white/5 last:border-0">
                          <div className="p-2 text-xs text-white/70 flex items-center gap-2 bg-white/5">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-[8px] text-white">
                              {emp.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className="truncate">{emp.name.split(' ')[0]}</span>
                          </div>
                          {weekDates.map((date, dayIdx) => {
                            const dateStr = date.toISOString().split('T')[0];
                            const dayShifts = shifts.filter(s => s.employeeId === emp.id && s.date === dateStr);
                            return (
                              <div
                                key={dayIdx}
                                className="p-1 min-h-[50px] border-l border-white/5 hover:bg-white/5 cursor-pointer"
                                onClick={() => {
                                  if (dayShifts.length === 0) {
                                    setNewShift({ employeeId: emp.id, department: deptModalDept, date: dateStr });
                                    setNewShiftModal(true);
                                  }
                                }}
                              >
                                {dayShifts.map(shift => (
                                  <div
                                    key={shift.id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDeptEditingShift(shift);
                                    }}
                                    className={`px-1 py-0.5 rounded text-[8px] mb-0.5 ${shiftTypeConfig[shift.shiftType].color} bg-opacity-20 border border-current cursor-pointer hover:opacity-80 transition-opacity`}
                                  >
                                    {shiftTypeConfig[shift.shiftType].label}
                                  </div>
                                ))}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>

                    {/* Shift Summary */}
                    <div className="grid grid-cols-4 gap-3">
                      {Object.entries(shiftTypeConfig).map(([type, config]) => {
                        const count = shifts.filter(s => {
                          const emp = employees.find(e => e.id === s.employeeId);
                          return emp?.department === deptModalDept && s.shiftType === type;
                        }).length;
                        return (
                          <div key={type} className="bg-white/5 rounded-lg p-3 border border-white/10">
                            <div className="flex items-center gap-2 mb-1">
                              <div className={`w-3 h-3 rounded-full ${config.color}`} />
                              <span className="text-xs text-white/60">{config.label}</span>
                            </div>
                            <p className="text-lg font-bold text-white">{count}</p>
                            <p className="text-[10px] text-white/40">{config.time}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Tasks Tab */}
                {deptModalView === 'tasks' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-white">Tasks & Assignments</h4>
                      <button className="flex items-center gap-1 px-3 py-1.5 text-xs bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 rounded-lg transition-colors">
                        <Plus className="w-3 h-3" />
                        Create Task
                      </button>
                    </div>

                    {/* Task Categories */}
                    <div className="grid grid-cols-3 gap-4">
                      {/* Pending Tasks */}
                      <div className="bg-amber-500/10 rounded-xl border border-amber-500/20 p-4">
                        <h5 className="text-xs font-medium text-amber-400 mb-3 flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          Pending ({departmentMetrics.find(d => d.department === deptModalDept)?.tasksPending || 0})
                        </h5>
                        <div className="space-y-2">
                          {[...Array(Math.min(departmentMetrics.find(d => d.department === deptModalDept)?.tasksPending || 0, 5))].map((_, i) => (
                            <div key={i} className="bg-white/5 rounded-lg p-2 border border-white/10">
                              <p className="text-xs text-white mb-1">
                                {deptModalDept === 'housekeeping' && ['Clean Room 405', 'Inspect Floor 3', 'Restock Supplies', 'Deep Clean Suite'][i % 4]}
                                {deptModalDept === 'front_desk' && ['Process Check-in', 'Handle Complaint', 'Update Records', 'VIP Arrival'][i % 4]}
                                {deptModalDept === 'maintenance' && ['Fix AC Unit', 'Replace Bulbs', 'Plumbing Repair', 'HVAC Check'][i % 4]}
                                {deptModalDept === 'food_beverage' && ['Room Service 302', 'Setup Banquet', 'Inventory Check', 'Menu Update'][i % 4]}
                                {deptModalDept === 'security' && ['Patrol Floor 2', 'Check Cameras', 'Incident Report', 'Access Audit'][i % 4]}
                                {deptModalDept === 'drivers' && ['Airport Pickup', 'City Tour', 'VIP Transfer', 'Shuttle Run'][i % 4]}
                                {deptModalDept === 'concierge' && ['Book Restaurant', 'Theater Tickets', 'Tour Arrange', 'Special Request'][i % 4]}
                                {deptModalDept === 'spa' && ['Massage 2PM', 'Facial Setup', 'Pool Maint', 'Equipment Check'][i % 4]}
                              </p>
                              <p className="text-[10px] text-white/40">Assigned: Staff {i + 1}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* In Progress */}
                      <div className="bg-blue-500/10 rounded-xl border border-blue-500/20 p-4">
                        <h5 className="text-xs font-medium text-blue-400 mb-3 flex items-center gap-2">
                          <RefreshCw className="w-3 h-3" />
                          In Progress ({Math.floor((departmentMetrics.find(d => d.department === deptModalDept)?.tasksPending || 0) / 2)})
                        </h5>
                        <div className="space-y-2">
                          {[...Array(Math.min(Math.floor((departmentMetrics.find(d => d.department === deptModalDept)?.tasksPending || 0) / 2), 3))].map((_, i) => (
                            <div key={i} className="bg-white/5 rounded-lg p-2 border border-white/10">
                              <p className="text-xs text-white mb-1">Task in progress {i + 1}</p>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                                  <div className="h-full bg-blue-400 rounded-full" style={{ width: `${40 + i * 20}%` }} />
                                </div>
                                <span className="text-[10px] text-blue-400">{40 + i * 20}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Completed Today */}
                      <div className="bg-emerald-500/10 rounded-xl border border-emerald-500/20 p-4">
                        <h5 className="text-xs font-medium text-emerald-400 mb-3 flex items-center gap-2">
                          <CheckCircle className="w-3 h-3" />
                          Completed ({departmentMetrics.find(d => d.department === deptModalDept)?.tasksCompleted || 0})
                        </h5>
                        <div className="space-y-2">
                          {[...Array(Math.min(departmentMetrics.find(d => d.department === deptModalDept)?.tasksCompleted || 0, 5))].map((_, i) => (
                            <div key={i} className="bg-white/5 rounded-lg p-2 border border-white/10 opacity-75">
                              <p className="text-xs text-white mb-1 line-through">Completed task {i + 1}</p>
                              <p className="text-[10px] text-emerald-400">Completed at {9 + i}:{i * 10 % 60 || '00'} AM</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* KPIs Tab */}
                {deptModalView === 'kpis' && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-white">Key Performance Indicators</h4>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-4 gap-3">
                      {departmentFeatures[deptModalDept].kpis.map((kpi, i) => {
                        const value = departmentFeatures[deptModalDept].specialMetrics()[i]?.value || 'N/A';
                        const target = kpi.target;
                        const numValue = typeof value === 'number' ? value : parseFloat(String(value));
                        const isAboveTarget = target && !isNaN(numValue) && numValue >= target;
                        return (
                          <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10">
                            <p className="text-[10px] text-white/40 mb-1">{kpi.label}</p>
                            <p className={`text-2xl font-bold ${isAboveTarget ? 'text-emerald-400' : 'text-white'}`}>
                              {value}{kpi.unit}
                            </p>
                            {target && (
                              <p className="text-[10px] text-white/40 mt-1">
                                Target: {target}{kpi.unit}
                                {isAboveTarget && <span className="text-emerald-400 ml-1">✓</span>}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Performance Trends */}
                    <div className="bg-white/5 rounded-xl border border-white/10 p-4">
                      <h5 className="text-xs font-medium text-white mb-3">Performance Trends (Last 7 Days)</h5>
                      <div className="h-40 flex items-end gap-2">
                        {[...Array(7)].map((_, i) => {
                          const height = 40 + Math.random() * 50;
                          return (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                              <div
                                className={`w-full rounded-t ${departmentConfig[deptModalDept].color === 'blue' ? 'bg-blue-500' : departmentConfig[deptModalDept].color === 'amber' ? 'bg-amber-500' : departmentConfig[deptModalDept].color === 'emerald' ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                                style={{ height: `${height}%` }}
                              />
                              <span className="text-[8px] text-white/40">{dayNames[i]}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Department Insights */}
                    <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl border border-indigo-500/20 p-4">
                      <h5 className="text-xs font-medium text-white mb-3 flex items-center gap-2">
                        <Sparkles className="w-3 h-3 text-indigo-400" />
                        AI Insights
                      </h5>
                      <div className="space-y-2 text-xs text-white/70">
                        <p>• Department efficiency is {Math.random() > 0.5 ? 'above' : 'at'} target levels this week.</p>
                        <p>• {employees.filter(e => e.department === deptModalDept && e.performanceScore >= 90).length} employees show exceptional performance.</p>
                        <p>• Consider scheduling optimization during peak hours for better coverage.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Operations Tab - Housekeeping Only */}
                {deptModalView === 'operations' && deptModalDept === 'housekeeping' && (
                  <div className="space-y-4">
                    {/* AI Housekeeping Insights */}
                    <HousekeepingAIInsights
                      metrics={housekeepingMetrics}
                      rooms={housekeepingRooms}
                    />

                    {/* View Toggle */}
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-white flex items-center gap-2">
                        <BedDouble className="w-4 h-4 text-blue-400" />
                        Room Operations
                      </h4>
                      <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5">
                        <button
                          onClick={() => setHousekeepingView('rooms')}
                          className={`px-3 py-1.5 text-xs rounded transition-colors ${housekeepingView === 'rooms' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'}`}
                        >
                          🏠 Rooms
                        </button>
                        <button
                          onClick={() => setHousekeepingView('attendants')}
                          className={`px-3 py-1.5 text-xs rounded transition-colors ${housekeepingView === 'attendants' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'}`}
                        >
                          👤 Attendants
                        </button>
                        <button
                          onClick={() => setHousekeepingView('kpis')}
                          className={`px-3 py-1.5 text-xs rounded transition-colors ${housekeepingView === 'kpis' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'}`}
                        >
                          📊 KPIs
                        </button>
                      </div>
                    </div>

                    {/* Room Status Summary */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {Object.entries(roomStatusConfig).map(([status, config]) => (
                        <button
                          key={status}
                          onClick={() => setRoomStatusFilter(roomStatusFilter === status ? 'all' : status as RoomCleaningStatus)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                            roomStatusFilter === status ? config.bgColor + ' ring-1 ring-white/30' : 'bg-white/5 hover:bg-white/10'
                          }`}
                        >
                          <span>{config.icon}</span>
                          <span className={config.color}>
                            {roomStats[status === 'in_progress' ? 'inProgress' : status === 'out_of_order' ? 'outOfOrder' : status === 'do_not_disturb' ? 'dnd' : status as keyof typeof roomStats]}
                          </span>
                          <span className="text-white/40">{config.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* Rooms View */}
                    {housekeepingView === 'rooms' && (
                      <div className="space-y-3">
                        {/* Floor Filter */}
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-white/40">Filter by Floor:</span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => setSelectedFloor('all')}
                              className={`px-3 py-1 text-xs rounded transition-colors ${selectedFloor === 'all' ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
                            >
                              All
                            </button>
                            {[2, 3, 4, 5].map(floor => (
                              <button
                                key={floor}
                                onClick={() => setSelectedFloor(floor)}
                                className={`px-3 py-1 text-xs rounded transition-colors ${selectedFloor === floor ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
                              >
                                F{floor}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Room Grid */}
                        <div className="grid grid-cols-8 gap-2">
                          {filteredRooms.map(room => (
                            <div
                              key={room.id}
                              onClick={() => setSelectedRoom(room)}
                              className={`p-2 rounded-lg border cursor-pointer transition-all hover:scale-105 ${roomStatusConfig[room.cleaningStatus].bgColor} border-white/10`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-white">{room.roomNumber}</span>
                                {room.priority !== 'normal' && (
                                  <span className={`text-[9px] px-1 rounded ${roomPriorityConfig[room.priority].color}`}>
                                    {room.priority === 'vip' ? '★' : room.priority === 'early_checkin' ? '⏰' : ''}
                                  </span>
                                )}
                              </div>
                              <p className={`text-[10px] ${roomStatusConfig[room.cleaningStatus].color}`}>
                                {roomStatusConfig[room.cleaningStatus].label}
                              </p>
                              {room.assignedTo && (
                                <p className="text-[9px] text-white/40 truncate mt-0.5">{room.assignedTo}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Attendants View */}
                    {housekeepingView === 'attendants' && (
                      <div className="grid grid-cols-2 gap-3">
                        {housekeepingAttendants.map(attendant => (
                          <div key={attendant.employeeId} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-medium text-white">
                              {attendant.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white truncate">{attendant.name}</p>
                              <p className="text-[10px] text-white/40">{attendant.zone} • Floor {attendant.floor}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-white font-medium">{attendant.roomsCleaned}/{attendant.roomsAssigned}</p>
                              <p className="text-[9px] text-white/40">{attendant.avgCleaningTime}min avg</p>
                            </div>
                            <div className={`w-3 h-3 rounded-full ${
                              attendant.status === 'cleaning' ? 'bg-amber-500' :
                              attendant.status === 'available' ? 'bg-emerald-500' :
                              attendant.status === 'break' ? 'bg-purple-500' : 'bg-blue-500'
                            }`} title={attendant.status} />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* KPIs View */}
                    {housekeepingView === 'kpis' && (
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                          <p className="text-xs text-white/40">Rooms Progress</p>
                          <p className="text-2xl font-bold text-white mt-1">{housekeepingMetrics.roomsCleanedToday}/{housekeepingMetrics.totalRooms}</p>
                          <div className="mt-2 h-1.5 bg-white/10 rounded-full">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(housekeepingMetrics.roomsCleanedToday / housekeepingMetrics.totalRooms) * 100}%` }} />
                          </div>
                          <p className="text-[10px] text-white/40 mt-1">{Math.round((housekeepingMetrics.roomsCleanedToday / housekeepingMetrics.totalRooms) * 100)}% complete</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                          <p className="text-xs text-white/40">Avg Clean Time</p>
                          <p className={`text-2xl font-bold mt-1 ${housekeepingMetrics.avgCleaningTime <= housekeepingMetrics.targetCleaningTime ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {housekeepingMetrics.avgCleaningTime}min
                          </p>
                          <p className="text-[10px] text-white/40 mt-1">Target: {housekeepingMetrics.targetCleaningTime}min</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                          <p className="text-xs text-white/40">Inspection Pass Rate</p>
                          <p className="text-2xl font-bold text-emerald-400 mt-1">{housekeepingMetrics.inspectionPassRate}%</p>
                          <p className="text-[10px] text-white/40 mt-1">{housekeepingMetrics.reCleaningRequests} re-cleans needed</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                          <p className="text-xs text-white/40">Rooms per Attendant</p>
                          <p className="text-2xl font-bold text-white mt-1">{housekeepingMetrics.roomsPerAttendant}</p>
                          <p className="text-[10px] text-white/40 mt-1">{housekeepingMetrics.attendantsOnDuty} on duty</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                          <p className="text-xs text-white/40">Turnaround Time</p>
                          <p className="text-2xl font-bold text-white mt-1">{housekeepingMetrics.turnaroundTime}min</p>
                          <p className="text-[10px] text-white/40 mt-1">+{housekeepingMetrics.movingAroundTime}min transit</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                          <p className="text-xs text-white/40">Quality Score</p>
                          <p className="text-2xl font-bold text-emerald-400 mt-1">{housekeepingMetrics.qualityScore}%</p>
                          <p className="text-[10px] text-white/40 mt-1">{housekeepingMetrics.guestComplaints} complaints</p>
                        </div>
                      </div>
                    )}

                    {/* Selected Room Detail Panel */}
                    {selectedRoom && (
                      <div className="bg-white/5 rounded-xl border border-white/10 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="text-sm font-medium text-white">Room {selectedRoom.roomNumber} Details</h5>
                          <button
                            onClick={() => setSelectedRoom(null)}
                            className="p-1 hover:bg-white/10 rounded transition-colors"
                          >
                            <X className="w-4 h-4 text-white/60" />
                          </button>
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                          <div>
                            <p className="text-[10px] text-white/40">Status</p>
                            <p className={`text-sm font-medium ${roomStatusConfig[selectedRoom.cleaningStatus].color}`}>
                              {roomStatusConfig[selectedRoom.cleaningStatus].label}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-white/40">Room Type</p>
                            <p className="text-sm text-white">{selectedRoom.roomType}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-white/40">Floor</p>
                            <p className="text-sm text-white">Floor {selectedRoom.floor}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-white/40">Priority</p>
                            <p className={`text-sm ${roomPriorityConfig[selectedRoom.priority].color}`}>
                              {roomPriorityConfig[selectedRoom.priority].label}
                            </p>
                          </div>
                          {selectedRoom.assignedTo && (
                            <div>
                              <p className="text-[10px] text-white/40">Assigned To</p>
                              <p className="text-sm text-white">{selectedRoom.assignedTo}</p>
                            </div>
                          )}
                          {selectedRoom.estimatedCompletion && (
                            <div>
                              <p className="text-[10px] text-white/40">Est. Completion</p>
                              <p className="text-sm text-white">{selectedRoom.estimatedCompletion}</p>
                            </div>
                          )}
                          {selectedRoom.lastCleaned && (
                            <div>
                              <p className="text-[10px] text-white/40">Last Cleaned</p>
                              <p className="text-sm text-white">{new Date(selectedRoom.lastCleaned).toLocaleString()}</p>
                            </div>
                          )}
                          {selectedRoom.guestCheckout && (
                            <div>
                              <p className="text-[10px] text-white/40">Guest Checkout</p>
                              <p className="text-sm text-white">{selectedRoom.guestCheckout}</p>
                            </div>
                          )}
                        </div>
                        {selectedRoom.notes && (
                          <div className="mt-3 pt-3 border-t border-white/10">
                            <p className="text-[10px] text-white/40">Notes</p>
                            <p className="text-xs text-white/70 mt-1">{selectedRoom.notes}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                  </>
                )}
              </div>

              {/* Shift Edit Modal (inside department modal) */}
              {deptEditingShift && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-10">
                  <div className="bg-slate-800 border border-white/20 rounded-xl p-4 w-full max-w-md shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-medium text-white">Edit Shift</h4>
                      <button
                        onClick={() => setDeptEditingShift(null)}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                      >
                        <X className="w-4 h-4 text-white/60" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      {/* Employee Info */}
                      <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <p className="text-[10px] text-white/40 mb-1">Employee</p>
                        <p className="text-sm text-white">
                          {employees.find(e => e.id === deptEditingShift.employeeId)?.name || 'Unknown'}
                        </p>
                      </div>

                      {/* Date */}
                      <div>
                        <label className="text-[10px] text-white/40 block mb-1">Date</label>
                        <input
                          type="date"
                          value={deptEditingShift.date}
                          onChange={(e) => setDeptEditingShift({ ...deptEditingShift, date: e.target.value })}
                          className="w-full bg-slate-700 border border-white/20 rounded-lg px-3 py-2 text-sm text-white"
                        />
                      </div>

                      {/* Shift Type */}
                      <div>
                        <label className="text-[10px] text-white/40 block mb-1">Shift Type</label>
                        <select
                          value={deptEditingShift.shiftType}
                          onChange={(e) => setDeptEditingShift({ ...deptEditingShift, shiftType: e.target.value as ShiftType })}
                          className="w-full bg-slate-700 border border-white/20 rounded-lg px-3 py-2 text-sm text-white"
                        >
                          <option value="morning">Morning (6:00 - 14:00)</option>
                          <option value="afternoon">Afternoon (14:00 - 22:00)</option>
                          <option value="night">Night (22:00 - 6:00)</option>
                          <option value="split">Split Shift</option>
                        </select>
                      </div>

                      {/* Status */}
                      <div>
                        <label className="text-[10px] text-white/40 block mb-1">Status</label>
                        <select
                          value={deptEditingShift.status}
                          onChange={(e) => setDeptEditingShift({ ...deptEditingShift, status: e.target.value as Shift['status'] })}
                          className="w-full bg-slate-700 border border-white/20 rounded-lg px-3 py-2 text-sm text-white"
                        >
                          <option value="scheduled">Scheduled</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>

                      {/* Notes */}
                      <div>
                        <label className="text-[10px] text-white/40 block mb-1">Notes</label>
                        <textarea
                          value={deptEditingShift.notes || ''}
                          onChange={(e) => setDeptEditingShift({ ...deptEditingShift, notes: e.target.value })}
                          className="w-full bg-slate-700 border border-white/20 rounded-lg px-3 py-2 text-sm text-white resize-none"
                          rows={2}
                          placeholder="Add notes..."
                        />
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-2">
                        <button
                          onClick={() => {
                            // Delete shift would go here
                            setDeptEditingShift(null);
                          }}
                          className="px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="flex-1" />
                        <button
                          onClick={() => setDeptEditingShift(null)}
                          className="px-4 py-2 text-xs text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            // Save shift changes would go here
                            setDeptEditingShift(null);
                          }}
                          className="px-4 py-2 text-xs bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Wrapper component with Suspense boundary for useSearchParams
export default function EmployeeManagementDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-stone-900 flex items-center justify-center">
        <div className="text-white/50 text-sm">Loading...</div>
      </div>
    }>
      <EmployeeManagementContent />
    </Suspense>
  );
}
