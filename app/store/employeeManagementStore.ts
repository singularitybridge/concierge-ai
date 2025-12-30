import { create } from 'zustand';

// Types
export type Department = 'housekeeping' | 'front_desk' | 'maintenance' | 'food_beverage' | 'security' | 'drivers' | 'concierge' | 'spa';

export type EmployeeStatus = 'on_duty' | 'off_duty' | 'on_break' | 'on_leave' | 'sick';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type ShiftType = 'morning' | 'afternoon' | 'night' | 'split';

// Room Status Types (Industry Standard)
export type RoomCleaningStatus = 'dirty' | 'in_progress' | 'clean' | 'inspected' | 'out_of_order' | 'do_not_disturb';
export type RoomOccupancyStatus = 'occupied' | 'vacant' | 'checkout' | 'checkin_expected';
export type RoomPriority = 'vip' | 'early_checkin' | 'checkout' | 'stayover' | 'normal';

export interface HousekeepingRoom {
  id: string;
  roomNumber: string;
  floor: number;
  roomType: 'standard' | 'deluxe' | 'suite' | 'executive';
  cleaningStatus: RoomCleaningStatus;
  occupancyStatus: RoomOccupancyStatus;
  priority: RoomPriority;
  assignedTo?: string;
  lastCleaned?: string;
  lastInspected?: string;
  inspectedBy?: string;
  cleaningStartTime?: string;
  cleaningEndTime?: string;
  actualCleaningMinutes?: number;
  inspectionScore?: number;
  notes?: string;
  guestName?: string;
  checkoutTime?: string;
  checkinTime?: string;
  needsDeepClean: boolean;
  maintenanceIssues: string[];
}

export interface HousekeepingAttendant {
  employeeId: string;
  name: string;
  zone: string;
  floor: number;
  roomsAssigned: number;
  roomsCleaned: number;
  avgCleaningTime: number;
  inspectionPassRate: number;
  reCleanRequests: number;
  currentRoom?: string;
  status: 'available' | 'cleaning' | 'break' | 'inspection';
}

export interface Employee {
  id: string;
  name: string;
  nameJapanese?: string;
  department: Department;
  role: string;
  status: EmployeeStatus;
  avatar?: string;
  phone: string;
  email: string;
  hireDate: string;
  skills: string[];
  certifications: string[];
  performanceScore: number; // 0-100
  currentTask?: string;
  currentLocation?: string;
  lastClockIn?: string;
  lastClockOut?: string;
  hoursThisWeek: number;
  overtimeHours: number;
  // GPS location for drivers
  gpsLocation?: {
    lat: number;
    lng: number;
    heading?: number;
    speed?: number;
    lastUpdated: string;
  };
  currentVehicleId?: string;
}

export interface Shift {
  id: string;
  employeeId: string;
  date: string;
  shiftType: ShiftType;
  startTime: string;
  endTime: string;
  department: Department;
  status: 'scheduled' | 'in_progress' | 'completed' | 'missed' | 'swapped';
  notes?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  department: Department;
  assignedTo?: string;
  assignedBy: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
  dueAt?: string;
  completedAt?: string;
  location?: string;
  roomNumber?: string;
  estimatedMinutes: number;
  actualMinutes?: number;
  notes?: string;
  relatedGuestRequest?: string;
}

export interface HousekeepingMetrics {
  // Room Progress
  roomsCleanedToday: number;
  roomsRemaining: number;
  totalRooms: number;

  // Time Metrics
  avgCleaningTime: number; // minutes
  targetCleaningTime: number;
  turnaroundTime: number; // minutes avg
  movingAroundTime: number; // non-productive time in minutes

  // Quality Metrics
  qualityScore: number; // 0-100
  inspectionPassRate: number; // percentage
  reCleaningRequests: number;
  guestComplaints: number;

  // Productivity Metrics
  roomsPerAttendant: number;
  checkoutsCompleted: number;
  stayoversCompleted: number;
  deepCleansCompleted: number;

  // Resource Metrics
  linensUsed: number;
  suppliesCost: number;

  // Staff Metrics
  attendantsOnDuty: number;
  attendantsOnBreak: number;
  trainingCompletionRate: number;

  // Priority Stats
  vipRoomsReady: number;
  earlyCheckinsPending: number;
  lateCheckoutsPending: number;
}

export interface DepartmentMetrics {
  department: Department;
  totalStaff: number;
  onDuty: number;
  onBreak: number;
  onLeave: number;
  tasksCompleted: number;
  tasksPending: number;
  avgResponseTime: number; // minutes
  satisfactionScore: number;
  overtimeHours: number;
  laborCost: number;
}

export interface AIInsight {
  id: string;
  category: 'staffing' | 'performance' | 'efficiency' | 'alert' | 'opportunity';
  title: string;
  message: string;
  recommendation?: string;
  impact?: string;
  priority: 'low' | 'medium' | 'high';
  department?: Department;
  createdAt: string;
  acknowledged: boolean;
}

export interface TimeOffRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'vacation' | 'sick' | 'personal' | 'emergency';
  startDate: string;
  endDate: string;
  status: 'pending' | 'approved' | 'denied';
  reason: string;
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

// ==========================================
// Driver Management Types
// ==========================================

export type VehicleType = 'sedan' | 'suv' | 'van' | 'minibus' | 'luxury' | 'shuttle';
export type VehicleStatus = 'available' | 'in_use' | 'maintenance' | 'out_of_service';
export type TripType = 'airport_pickup' | 'airport_dropoff' | 'shuttle' | 'vip_transfer' | 'tour' | 'delivery' | 'errand' | 'event';
export type TripStatus = 'pending' | 'assigned' | 'en_route_pickup' | 'guest_picked_up' | 'in_progress' | 'completed' | 'cancelled';
export type TripPriority = 'normal' | 'priority' | 'vip' | 'urgent';

// GPS Location type for driver/vehicle tracking
export interface GPSLocation {
  lat: number;
  lng: number;
  heading?: number; // direction 0-360
  speed?: number; // km/h
  lastUpdated: string;
}

export interface Vehicle {
  id: string;
  name: string;
  type: VehicleType;
  licensePlate: string;
  capacity: number;
  status: VehicleStatus;
  currentDriverId?: string;
  currentTripId?: string;
  fuelLevel: number; // percentage
  mileage: number;
  lastMaintenance: string;
  nextMaintenanceDue: string;
  features: string[];
  image?: string;
  currentLocation?: GPSLocation;
}

export interface DriverTrip {
  id: string;
  type: TripType;
  status: TripStatus;
  priority: TripPriority;
  driverId?: string;
  driverName?: string;
  vehicleId?: string;
  vehicleName?: string;

  // Guest/Request Info
  guestName?: string;
  guestRoom?: string;
  guestPhone?: string;
  numberOfGuests: number;
  luggageCount?: number;
  specialRequests?: string;

  // Location Info
  pickupLocation: string;
  dropoffLocation: string;
  pickupCoords?: { lat: number; lng: number };
  dropoffCoords?: { lat: number; lng: number };
  currentLocation?: { lat: number; lng: number };

  // Time Info
  scheduledTime: string;
  estimatedPickupTime?: string;
  actualPickupTime?: string;
  estimatedArrivalTime?: string;
  actualArrivalTime?: string;
  completedTime?: string;

  // Flight Info (for airport trips)
  flightNumber?: string;
  flightStatus?: 'on_time' | 'delayed' | 'arrived' | 'cancelled';
  flightArrivalTime?: string;
  terminal?: string;

  // Delivery/Errand specific
  deliveryItems?: string;
  deliveryInstructions?: string;

  // Routing
  estimatedDistance?: number; // km
  estimatedDuration?: number; // minutes
  actualDuration?: number;
  routeNotes?: string;

  // Billing
  fareEstimate?: number;
  actualFare?: number;
  isPaid: boolean;
  paymentMethod?: 'room_charge' | 'cash' | 'card' | 'complimentary';

  // Source
  requestedBy: string;
  requestSource: 'front_desk' | 'concierge' | 'guest_app' | 'phone' | 'walk_in';
  createdAt: string;
  notes?: string;
}

export interface DriverMessage {
  id: string;
  driverId: string;
  driverName: string;
  senderId: string;
  senderName: string;
  senderRole: 'dispatch' | 'driver' | 'front_desk' | 'concierge';
  message: string;
  timestamp: string;
  isRead: boolean;
  tripId?: string;
  type: 'text' | 'alert' | 'update' | 'instruction';
}

export interface TransportationRequest {
  id: string;
  guestName: string;
  guestRoom?: string;
  guestPhone?: string;
  requestType: TripType;
  pickupLocation: string;
  dropoffLocation: string;
  scheduledTime: string;
  numberOfGuests: number;
  luggageCount?: number;
  specialRequests?: string;
  flightNumber?: string;
  priority: TripPriority;
  status: 'new' | 'confirmed' | 'assigned' | 'completed' | 'cancelled';
  source: 'front_desk' | 'concierge' | 'guest_app' | 'phone';
  createdAt: string;
  createdBy: string;
  notes?: string;
}

export interface DriverMetrics {
  totalTripsToday: number;
  completedTripsToday: number;
  pendingTrips: number;
  inProgressTrips: number;
  availableDrivers: number;
  busyDrivers: number;
  offDutyDrivers: number;
  availableVehicles: number;
  inUseVehicles: number;
  maintenanceVehicles: number;
  avgTripDuration: number;
  avgWaitTime: number;
  onTimeRate: number;
  guestSatisfaction: number;
  totalDistanceToday: number;
  fuelCostToday: number;
  revenueToday: number;
  airportTripsToday: number;
  shuttleTripsToday: number;
  vipTripsToday: number;
  deliveriesCompleted: number;
}

interface EmployeeManagementState {
  // Data
  employees: Employee[];
  shifts: Shift[];
  tasks: Task[];
  departmentMetrics: DepartmentMetrics[];
  housekeepingMetrics: HousekeepingMetrics;
  housekeepingRooms: HousekeepingRoom[];
  housekeepingAttendants: HousekeepingAttendant[];
  aiInsights: AIInsight[];
  timeOffRequests: TimeOffRequest[];

  // Driver Management Data
  vehicles: Vehicle[];
  driverTrips: DriverTrip[];
  driverMessages: DriverMessage[];
  transportationRequests: TransportationRequest[];
  driverMetrics: DriverMetrics;

  // UI State
  selectedDepartment: Department | 'all';
  selectedDate: string;

  // Actions
  setSelectedDepartment: (dept: Department | 'all') => void;
  setSelectedDate: (date: string) => void;
  updateEmployeeStatus: (employeeId: string, status: EmployeeStatus) => void;
  updateEmployee: (employeeId: string, updates: Partial<Employee>) => void;
  updateRoomStatus: (roomId: string, status: RoomCleaningStatus, assignedTo?: string) => void;
  assignRoomToAttendant: (roomId: string, attendantId: string) => void;
  markRoomInspected: (roomId: string, score: number, inspectedBy: string) => void;
  assignTask: (taskId: string, employeeId: string) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  acknowledgeInsight: (insightId: string) => void;
  approveTimeOff: (requestId: string, approved: boolean) => void;
  addShift: (shift: Omit<Shift, 'id'>) => void;
  updateShift: (shiftId: string, updates: Partial<Shift>) => void;
  deleteShift: (shiftId: string) => void;

  // Driver Management Actions
  assignDriverToTrip: (tripId: string, driverId: string, vehicleId: string) => void;
  updateTripStatus: (tripId: string, status: TripStatus) => void;
  addDriverTrip: (trip: Omit<DriverTrip, 'id'>) => void;
  updateDriverTrip: (tripId: string, updates: Partial<DriverTrip>) => void;
  cancelTrip: (tripId: string) => void;
  sendDriverMessage: (message: Omit<DriverMessage, 'id' | 'timestamp'>) => void;
  markMessageRead: (messageId: string) => void;
  updateVehicleStatus: (vehicleId: string, status: VehicleStatus) => void;
  convertRequestToTrip: (requestId: string) => void;
}

// Generate sample employees
const generateEmployees = (): Employee[] => {
  const departments: { dept: Department; roles: string[] }[] = [
    { dept: 'housekeeping', roles: ['Room Attendant', 'Housekeeping Supervisor', 'Laundry Attendant', 'Public Area Cleaner'] },
    { dept: 'front_desk', roles: ['Front Desk Agent', 'Front Desk Supervisor', 'Night Auditor', 'Reservations Agent'] },
    { dept: 'maintenance', roles: ['Maintenance Technician', 'HVAC Specialist', 'Electrician', 'General Handyman'] },
    { dept: 'food_beverage', roles: ['Server', 'Bartender', 'Host/Hostess', 'Room Service Attendant'] },
    { dept: 'security', roles: ['Security Officer', 'Security Supervisor', 'Night Security'] },
    { dept: 'drivers', roles: ['Shuttle Driver', 'Airport Transfer Driver', 'Ski Shuttle Driver'] },
    { dept: 'concierge', roles: ['Concierge', 'Guest Relations', 'Bell Captain', 'Bellhop'] },
    { dept: 'spa', roles: ['Spa Therapist', 'Spa Receptionist', 'Fitness Instructor'] },
  ];

  const japaneseNames = [
    { name: 'Yuki Tanaka', japanese: '田中 雪' },
    { name: 'Kenji Yamamoto', japanese: '山本 健二' },
    { name: 'Sakura Sato', japanese: '佐藤 さくら' },
    { name: 'Takeshi Suzuki', japanese: '鈴木 武' },
    { name: 'Aiko Watanabe', japanese: '渡辺 愛子' },
    { name: 'Hiroshi Ito', japanese: '伊藤 博' },
    { name: 'Mei Nakamura', japanese: '中村 芽衣' },
    { name: 'Ryo Kobayashi', japanese: '小林 亮' },
    { name: 'Hana Yoshida', japanese: '吉田 花' },
    { name: 'Daichi Matsumoto', japanese: '松本 大地' },
    { name: 'Emi Inoue', japanese: '井上 恵美' },
    { name: 'Sho Kimura', japanese: '木村 翔' },
    { name: 'Mika Hayashi', japanese: '林 美香' },
    { name: 'Kota Shimizu', japanese: '清水 航太' },
    { name: 'Yui Yamada', japanese: '山田 結衣' },
    { name: 'Naoki Mori', japanese: '森 直樹' },
    { name: 'Rina Ogawa', japanese: '小川 里奈' },
    { name: 'Haruki Fujita', japanese: '藤田 春樹' },
    { name: 'Nana Okada', japanese: '岡田 奈々' },
    { name: 'Shota Hasegawa', japanese: '長谷川 翔太' },
    { name: 'Ayumi Ishikawa', japanese: '石川 歩美' },
    { name: 'Kazuki Maeda', japanese: '前田 和樹' },
    { name: 'Saki Kondo', japanese: '近藤 咲' },
    { name: 'Yusuke Fukuda', japanese: '福田 佑介' },
    { name: 'Misaki Ueda', japanese: '上田 美咲' },
    { name: 'Taro Nishimura', japanese: '西村 太郎' },
    { name: 'Kaori Endo', japanese: '遠藤 香織' },
    { name: 'Shun Aoki', japanese: '青木 駿' },
    { name: 'Mao Saito', japanese: '斎藤 真央' },
    { name: 'Kenta Miura', japanese: '三浦 健太' },
  ];

  const statuses: EmployeeStatus[] = ['on_duty', 'on_duty', 'on_duty', 'on_break', 'off_duty', 'on_leave'];
  const employees: Employee[] = [];
  let nameIndex = 0;

  // Simulated GPS locations for drivers (Niseko area)
  const driverLocations = [
    { lat: 42.8048, lng: 140.6874, heading: 0, speed: 0 }, // Hotel
    { lat: 42.7890, lng: 141.2500, heading: 90, speed: 55 }, // En route to airport
    { lat: 42.7752, lng: 141.6925, heading: 180, speed: 0 }, // At airport
    { lat: 42.8500, lng: 140.7200, heading: 270, speed: 35 }, // Ski area
    { lat: 42.8100, lng: 140.7000, heading: 45, speed: 45 }, // Village
  ];
  let driverIndex = 0;

  departments.forEach(({ dept, roles }) => {
    roles.forEach((role, roleIndex) => {
      const count = role.includes('Supervisor') || role.includes('Captain') || role.includes('Specialist') ? 1 : Math.floor(Math.random() * 2) + 2;
      for (let i = 0; i < count; i++) {
        if (nameIndex >= japaneseNames.length) nameIndex = 0;
        const { name, japanese } = japaneseNames[nameIndex];
        const empStatus = statuses[Math.floor(Math.random() * statuses.length)];

        // Add GPS location for drivers who are on duty
        let gpsLocation = undefined;
        let currentVehicleId = undefined;
        if (dept === 'drivers' && empStatus === 'on_duty') {
          const loc = driverLocations[driverIndex % driverLocations.length];
          gpsLocation = {
            lat: loc.lat + (Math.random() - 0.5) * 0.01,
            lng: loc.lng + (Math.random() - 0.5) * 0.01,
            heading: loc.heading,
            speed: loc.speed,
            lastUpdated: new Date().toISOString(),
          };
          currentVehicleId = `veh-${(driverIndex % 5) + 1}`;
          driverIndex++;
        }

        employees.push({
          id: `emp-${dept}-${roleIndex}-${i}`,
          name,
          nameJapanese: japanese,
          department: dept,
          role,
          status: empStatus,
          phone: `090-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
          email: `${name.toLowerCase().replace(' ', '.')}@1898niseko.com`,
          hireDate: `202${Math.floor(Math.random() * 4)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
          skills: generateSkills(dept),
          certifications: generateCertifications(dept),
          performanceScore: Math.floor(70 + Math.random() * 30),
          currentTask: Math.random() > 0.5 ? `Task-${Math.floor(Math.random() * 100)}` : undefined,
          hoursThisWeek: Math.floor(20 + Math.random() * 25),
          overtimeHours: Math.random() > 0.7 ? Math.floor(Math.random() * 8) : 0,
          gpsLocation,
          currentVehicleId,
        });
        nameIndex++;
      }
    });
  });

  return employees;
};

const generateSkills = (dept: Department): string[] => {
  const skillsByDept: Record<Department, string[]> = {
    housekeeping: ['Deep Cleaning', 'Laundry', 'Inventory Management', 'Quality Inspection', 'Chemical Safety'],
    front_desk: ['Customer Service', 'PMS Systems', 'Multi-language', 'Conflict Resolution', 'Upselling'],
    maintenance: ['Plumbing', 'Electrical', 'HVAC', 'Carpentry', 'Painting'],
    food_beverage: ['Food Safety', 'Wine Service', 'POS Systems', 'Mixology', 'Customer Service'],
    security: ['Surveillance', 'Emergency Response', 'First Aid', 'Conflict De-escalation'],
    drivers: ['Defensive Driving', 'GPS Navigation', 'Customer Service', 'Vehicle Maintenance'],
    concierge: ['Local Knowledge', 'Reservation Systems', 'VIP Services', 'Multi-language'],
    spa: ['Massage Therapy', 'Aromatherapy', 'Customer Service', 'Product Knowledge'],
  };
  const skills = skillsByDept[dept];
  return skills.slice(0, Math.floor(2 + Math.random() * 3));
};

const generateCertifications = (dept: Department): string[] => {
  const certsByDept: Record<Department, string[]> = {
    housekeeping: ['Housekeeping Certification', 'Chemical Handling'],
    front_desk: ['Hotel Management Certificate', 'First Aid'],
    maintenance: ['Electrical License', 'HVAC Certification', 'Plumbing License'],
    food_beverage: ['Food Handling Certificate', 'Alcohol Service License', 'First Aid'],
    security: ['Security Guard License', 'First Aid', 'CPR'],
    drivers: ['Commercial License', 'Defensive Driving', 'First Aid'],
    concierge: ['Les Clefs d\'Or', 'Tourism Certificate'],
    spa: ['Massage Therapy License', 'Aromatherapy Certification'],
  };
  return certsByDept[dept].slice(0, Math.floor(1 + Math.random() * 2));
};

// Generate shifts for the week
const generateShifts = (employees: Employee[]): Shift[] => {
  const shifts: Shift[] = [];
  const today = new Date();
  const shiftTypes: ShiftType[] = ['morning', 'afternoon', 'night'];
  const shiftTimes: Record<ShiftType, { start: string; end: string }> = {
    morning: { start: '06:00', end: '14:00' },
    afternoon: { start: '14:00', end: '22:00' },
    night: { start: '22:00', end: '06:00' },
    split: { start: '06:00', end: '22:00' },
  };

  employees.forEach(emp => {
    for (let d = -1; d < 7; d++) {
      if (Math.random() > 0.3) { // 70% chance of having a shift
        const date = new Date(today);
        date.setDate(date.getDate() + d);
        const shiftType = shiftTypes[Math.floor(Math.random() * shiftTypes.length)];
        const times = shiftTimes[shiftType];

        shifts.push({
          id: `shift-${emp.id}-${d}`,
          employeeId: emp.id,
          date: date.toISOString().split('T')[0],
          shiftType,
          startTime: times.start,
          endTime: times.end,
          department: emp.department,
          status: d < 0 ? 'completed' : d === 0 ? (Math.random() > 0.5 ? 'in_progress' : 'scheduled') : 'scheduled',
        });
      }
    }
  });

  return shifts;
};

// Generate tasks
const generateTasks = (): Task[] => {
  const taskTemplates: { title: string; dept: Department; priority: TaskPriority; minutes: number }[] = [
    { title: 'Clean Room 301', dept: 'housekeeping', priority: 'medium', minutes: 30 },
    { title: 'Clean Room 302', dept: 'housekeeping', priority: 'medium', minutes: 30 },
    { title: 'Clean Room 405', dept: 'housekeeping', priority: 'high', minutes: 35 },
    { title: 'Deep Clean Suite 501', dept: 'housekeeping', priority: 'high', minutes: 60 },
    { title: 'Restock Amenities Floor 3', dept: 'housekeeping', priority: 'low', minutes: 20 },
    { title: 'Laundry Collection', dept: 'housekeeping', priority: 'medium', minutes: 45 },
    { title: 'Fix AC Unit Room 202', dept: 'maintenance', priority: 'urgent', minutes: 60 },
    { title: 'Replace Light Bulbs Lobby', dept: 'maintenance', priority: 'low', minutes: 30 },
    { title: 'Repair Bathroom Faucet 405', dept: 'maintenance', priority: 'high', minutes: 45 },
    { title: 'HVAC Inspection', dept: 'maintenance', priority: 'medium', minutes: 120 },
    { title: 'VIP Check-in Preparation', dept: 'front_desk', priority: 'high', minutes: 20 },
    { title: 'Process Group Booking', dept: 'front_desk', priority: 'medium', minutes: 30 },
    { title: 'Airport Pickup - Tanaka Family', dept: 'drivers', priority: 'high', minutes: 90 },
    { title: 'Ski Shuttle Run #3', dept: 'drivers', priority: 'medium', minutes: 45 },
    { title: 'Restaurant Dinner Service', dept: 'food_beverage', priority: 'high', minutes: 180 },
    { title: 'Room Service Order 301', dept: 'food_beverage', priority: 'high', minutes: 20 },
    { title: 'Lobby Security Patrol', dept: 'security', priority: 'medium', minutes: 30 },
    { title: 'CCTV System Check', dept: 'security', priority: 'low', minutes: 20 },
    { title: 'Restaurant Reservation - 8 guests', dept: 'concierge', priority: 'medium', minutes: 15 },
    { title: 'Ski Pass Arrangement', dept: 'concierge', priority: 'high', minutes: 20 },
    { title: 'Spa Treatment - Deep Tissue', dept: 'spa', priority: 'high', minutes: 90 },
    { title: 'Yoga Class Setup', dept: 'spa', priority: 'medium', minutes: 30 },
  ];

  const statuses: TaskStatus[] = ['pending', 'pending', 'in_progress', 'completed', 'completed'];
  const now = new Date();

  return taskTemplates.map((t, i) => ({
    id: `task-${i}`,
    title: t.title,
    description: `${t.title} - Standard procedure`,
    department: t.dept,
    assignedTo: Math.random() > 0.3 ? `emp-${t.dept}-0-0` : undefined,
    assignedBy: 'Manager',
    status: statuses[Math.floor(Math.random() * statuses.length)],
    priority: t.priority,
    createdAt: new Date(now.getTime() - Math.random() * 3600000 * 4).toISOString(),
    dueAt: new Date(now.getTime() + Math.random() * 3600000 * 2).toISOString(),
    estimatedMinutes: t.minutes,
    actualMinutes: Math.random() > 0.5 ? Math.floor(t.minutes * (0.8 + Math.random() * 0.4)) : undefined,
    roomNumber: t.title.match(/\d+/)?.[0],
  }));
};

// Generate department metrics
const generateDepartmentMetrics = (employees: Employee[], tasks: Task[]): DepartmentMetrics[] => {
  const departments: Department[] = ['housekeeping', 'front_desk', 'maintenance', 'food_beverage', 'security', 'drivers', 'concierge', 'spa'];

  return departments.map(dept => {
    const deptEmployees = employees.filter(e => e.department === dept);
    const deptTasks = tasks.filter(t => t.department === dept);

    return {
      department: dept,
      totalStaff: deptEmployees.length,
      onDuty: deptEmployees.filter(e => e.status === 'on_duty').length,
      onBreak: deptEmployees.filter(e => e.status === 'on_break').length,
      onLeave: deptEmployees.filter(e => e.status === 'on_leave' || e.status === 'sick').length,
      tasksCompleted: deptTasks.filter(t => t.status === 'completed').length,
      tasksPending: deptTasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length,
      avgResponseTime: Math.floor(5 + Math.random() * 15),
      satisfactionScore: Math.floor(80 + Math.random() * 20),
      overtimeHours: deptEmployees.reduce((sum, e) => sum + e.overtimeHours, 0),
      laborCost: deptEmployees.length * (1500 + Math.random() * 500) * 8, // Daily labor cost in JPY
    };
  });
};

// Generate housekeeping rooms
const generateHousekeepingRooms = (): HousekeepingRoom[] => {
  const rooms: HousekeepingRoom[] = [];
  const roomTypes: Array<'standard' | 'deluxe' | 'suite' | 'executive'> = ['standard', 'standard', 'standard', 'deluxe', 'deluxe', 'suite', 'executive'];
  const cleaningStatuses: RoomCleaningStatus[] = ['dirty', 'dirty', 'in_progress', 'clean', 'clean', 'inspected', 'inspected', 'inspected'];
  const priorities: RoomPriority[] = ['vip', 'early_checkin', 'checkout', 'checkout', 'stayover', 'stayover', 'normal', 'normal', 'normal'];
  const guestNames = ['Tanaka', 'Suzuki', 'Yamamoto', 'Watanabe', 'Ito', 'Sato', 'Nakamura', 'Kobayashi'];

  for (let floor = 2; floor <= 5; floor++) {
    for (let room = 1; room <= 12; room++) {
      const roomNumber = `${floor}${String(room).padStart(2, '0')}`;
      const isOccupied = Math.random() > 0.35;
      const cleaningStatus = cleaningStatuses[Math.floor(Math.random() * cleaningStatuses.length)];

      rooms.push({
        id: `room-${roomNumber}`,
        roomNumber,
        floor,
        roomType: roomTypes[Math.floor(Math.random() * roomTypes.length)],
        cleaningStatus: isOccupied && Math.random() > 0.3 ? 'do_not_disturb' : cleaningStatus,
        occupancyStatus: isOccupied ? 'occupied' : (Math.random() > 0.5 ? 'vacant' : 'checkout'),
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        assignedTo: Math.random() > 0.4 ? `emp-housekeeping-0-${Math.floor(Math.random() * 3)}` : undefined,
        lastCleaned: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        inspectionScore: Math.random() > 0.3 ? Math.floor(85 + Math.random() * 15) : undefined,
        guestName: isOccupied ? guestNames[Math.floor(Math.random() * guestNames.length)] : undefined,
        checkoutTime: !isOccupied ? '11:00' : undefined,
        checkinTime: Math.random() > 0.7 ? '15:00' : undefined,
        needsDeepClean: Math.random() > 0.85,
        maintenanceIssues: Math.random() > 0.9 ? ['AC not cooling', 'Faucet leak'] : [],
      });
    }
  }

  return rooms;
};

// Generate housekeeping attendants
const generateHousekeepingAttendants = (employees: Employee[]): HousekeepingAttendant[] => {
  const housekeepers = employees.filter(e => e.department === 'housekeeping' && e.status === 'on_duty');
  const zones = ['East Wing', 'West Wing', 'North Wing', 'South Wing'];
  const statuses: Array<'available' | 'cleaning' | 'break' | 'inspection'> = ['available', 'cleaning', 'cleaning', 'cleaning'];

  return housekeepers.slice(0, 8).map((emp, i) => ({
    employeeId: emp.id,
    name: emp.name,
    zone: zones[i % zones.length],
    floor: 2 + (i % 4),
    roomsAssigned: Math.floor(8 + Math.random() * 6),
    roomsCleaned: Math.floor(3 + Math.random() * 5),
    avgCleaningTime: Math.floor(25 + Math.random() * 10),
    inspectionPassRate: Math.floor(85 + Math.random() * 15),
    reCleanRequests: Math.floor(Math.random() * 2),
    currentRoom: Math.random() > 0.3 ? `${2 + (i % 4)}${String(Math.floor(1 + Math.random() * 12)).padStart(2, '0')}` : undefined,
    status: statuses[Math.floor(Math.random() * statuses.length)],
  }));
};

// Generate housekeeping specific metrics
const generateHousekeepingMetrics = (): HousekeepingMetrics => {
  const roomsCleaned = Math.floor(25 + Math.random() * 15);
  const roomsRemaining = Math.floor(5 + Math.random() * 10);
  const totalRooms = 48; // 4 floors x 12 rooms

  return {
    // Room Progress
    roomsCleanedToday: roomsCleaned,
    roomsRemaining: roomsRemaining,
    totalRooms,

    // Time Metrics
    avgCleaningTime: Math.floor(26 + Math.random() * 8),
    targetCleaningTime: 30,
    turnaroundTime: Math.floor(35 + Math.random() * 15),
    movingAroundTime: Math.floor(5 + Math.random() * 4),

    // Quality Metrics
    qualityScore: Math.floor(88 + Math.random() * 12),
    inspectionPassRate: Math.floor(92 + Math.random() * 8),
    reCleaningRequests: Math.floor(Math.random() * 3),
    guestComplaints: Math.floor(Math.random() * 2),

    // Productivity Metrics
    roomsPerAttendant: Math.round((roomsCleaned / 6) * 10) / 10,
    checkoutsCompleted: Math.floor(10 + Math.random() * 8),
    stayoversCompleted: Math.floor(roomsCleaned * 0.4),
    deepCleansCompleted: Math.floor(Math.random() * 4),

    // Resource Metrics
    linensUsed: Math.floor(80 + Math.random() * 40),
    suppliesCost: Math.floor(15000 + Math.random() * 5000),

    // Staff Metrics
    attendantsOnDuty: Math.floor(5 + Math.random() * 3),
    attendantsOnBreak: Math.floor(Math.random() * 2),
    trainingCompletionRate: Math.floor(85 + Math.random() * 15),

    // Priority Stats
    vipRoomsReady: Math.floor(2 + Math.random() * 3),
    earlyCheckinsPending: Math.floor(Math.random() * 4),
    lateCheckoutsPending: Math.floor(Math.random() * 3),
  };
};

// Generate AI insights
const generateAIInsights = (employees: Employee[], metrics: DepartmentMetrics[]): AIInsight[] => {
  const insights: AIInsight[] = [];
  const now = new Date().toISOString();

  // Staffing insights
  const housekeepingMetrics = metrics.find(m => m.department === 'housekeeping');
  if (housekeepingMetrics && housekeepingMetrics.tasksPending > housekeepingMetrics.onDuty * 2) {
    insights.push({
      id: 'insight-1',
      category: 'staffing',
      title: 'Housekeeping Understaffed',
      message: `${housekeepingMetrics.tasksPending} pending tasks with only ${housekeepingMetrics.onDuty} staff on duty. Consider calling in additional staff.`,
      recommendation: 'Call in 2 additional room attendants or redistribute tasks from other departments.',
      impact: 'High - may delay room readiness for check-ins',
      priority: 'high',
      department: 'housekeeping',
      createdAt: now,
      acknowledged: false,
    });
  }

  // Overtime alert
  const highOvertimeDept = metrics.find(m => m.overtimeHours > 20);
  if (highOvertimeDept) {
    insights.push({
      id: 'insight-2',
      category: 'alert',
      title: 'High Overtime Alert',
      message: `${highOvertimeDept.department} department has accumulated ${highOvertimeDept.overtimeHours} overtime hours this week.`,
      recommendation: 'Review scheduling to balance workload and consider hiring temporary staff.',
      impact: `Potential additional labor cost of ¥${(highOvertimeDept.overtimeHours * 2500).toLocaleString()}`,
      priority: 'medium',
      department: highOvertimeDept.department,
      createdAt: now,
      acknowledged: false,
    });
  }

  // Performance opportunity
  const highPerformers = employees.filter(e => e.performanceScore > 90);
  if (highPerformers.length > 0) {
    insights.push({
      id: 'insight-3',
      category: 'opportunity',
      title: 'Top Performers Identified',
      message: `${highPerformers.length} employees with performance scores above 90%. Consider for recognition or promotion.`,
      recommendation: `Review ${highPerformers[0].name} and ${highPerformers.length - 1} others for advancement opportunities.`,
      priority: 'low',
      createdAt: now,
      acknowledged: false,
    });
  }

  // Efficiency insight
  insights.push({
    id: 'insight-4',
    category: 'efficiency',
    title: 'Room Cleaning Efficiency Up',
    message: 'Average room cleaning time has improved by 8% compared to last week.',
    recommendation: 'Document and share best practices from top-performing housekeepers.',
    impact: 'Potential to clean 3 additional rooms per shift',
    priority: 'low',
    department: 'housekeeping',
    createdAt: now,
    acknowledged: false,
  });

  // Peak demand prediction
  insights.push({
    id: 'insight-5',
    category: 'staffing',
    title: 'Weekend Peak Staffing',
    message: 'Based on reservations, this weekend will have 95% occupancy. Current staffing may be insufficient.',
    recommendation: 'Schedule 3 additional housekeeping staff and 2 extra F&B servers for Saturday.',
    impact: 'Ensure service quality during peak demand',
    priority: 'high',
    createdAt: now,
    acknowledged: false,
  });

  // Driver optimization
  insights.push({
    id: 'insight-6',
    category: 'efficiency',
    title: 'Shuttle Route Optimization',
    message: 'Ski shuttle utilization is 45% below capacity on morning runs.',
    recommendation: 'Consolidate morning shuttle runs from 4 to 3, reassign 1 driver to airport transfers.',
    impact: 'Save ¥12,000 daily in fuel and labor costs',
    priority: 'medium',
    department: 'drivers',
    createdAt: now,
    acknowledged: false,
  });

  return insights;
};

// Generate time off requests
const generateTimeOffRequests = (employees: Employee[]): TimeOffRequest[] => {
  const types: TimeOffRequest['type'][] = ['vacation', 'sick', 'personal'];
  const statuses: TimeOffRequest['status'][] = ['pending', 'pending', 'approved', 'approved', 'denied'];

  return employees.slice(0, 5).map((emp, i) => ({
    id: `timeoff-${i}`,
    employeeId: emp.id,
    employeeName: emp.name,
    type: types[Math.floor(Math.random() * types.length)],
    startDate: new Date(Date.now() + (i + 1) * 86400000 * 3).toISOString().split('T')[0],
    endDate: new Date(Date.now() + (i + 2) * 86400000 * 3).toISOString().split('T')[0],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    reason: ['Family event', 'Personal matters', 'Medical appointment', 'Vacation travel'][Math.floor(Math.random() * 4)],
    submittedAt: new Date(Date.now() - Math.random() * 86400000 * 5).toISOString(),
  }));
};

// ==========================================
// Driver Management Data Generators
// ==========================================

// Hotel location (Niseko area - Japan ski resort)
const HOTEL_LOCATION = { lat: 42.8048, lng: 140.6874 };
const AIRPORT_LOCATION = { lat: 42.7752, lng: 141.6925 }; // New Chitose Airport

// Generate vehicle fleet
const generateVehicles = (): Vehicle[] => {
  const vehicles: Vehicle[] = [
    {
      id: 'veh-1',
      name: 'Toyota Alphard #1',
      type: 'van',
      licensePlate: '品川 300 あ 1234',
      capacity: 7,
      status: 'available',
      fuelLevel: 85,
      mileage: 45230,
      lastMaintenance: '2024-12-15',
      nextMaintenanceDue: '2025-01-15',
      features: ['WiFi', 'USB Charging', 'Leather Seats', 'Climate Control'],
      currentLocation: { lat: HOTEL_LOCATION.lat, lng: HOTEL_LOCATION.lng, heading: 0, speed: 0, lastUpdated: new Date().toISOString() },
    },
    {
      id: 'veh-2',
      name: 'Toyota Alphard #2',
      type: 'van',
      licensePlate: '品川 300 あ 1235',
      capacity: 7,
      status: 'in_use',
      fuelLevel: 62,
      mileage: 38920,
      lastMaintenance: '2024-12-01',
      nextMaintenanceDue: '2025-01-01',
      features: ['WiFi', 'USB Charging', 'Leather Seats', 'Climate Control'],
      currentLocation: { lat: 42.7890, lng: 141.2500, heading: 90, speed: 65, lastUpdated: new Date().toISOString() },
    },
    {
      id: 'veh-3',
      name: 'Mercedes S-Class',
      type: 'luxury',
      licensePlate: '品川 500 さ 7777',
      capacity: 4,
      status: 'available',
      fuelLevel: 95,
      mileage: 12450,
      lastMaintenance: '2024-12-20',
      nextMaintenanceDue: '2025-02-20',
      features: ['WiFi', 'USB Charging', 'Premium Audio', 'Massage Seats', 'Mini Bar'],
      currentLocation: { lat: HOTEL_LOCATION.lat, lng: HOTEL_LOCATION.lng, heading: 0, speed: 0, lastUpdated: new Date().toISOString() },
    },
    {
      id: 'veh-4',
      name: 'Toyota Hiace Shuttle',
      type: 'shuttle',
      licensePlate: '品川 200 か 5678',
      capacity: 14,
      status: 'in_use',
      fuelLevel: 45,
      mileage: 78340,
      lastMaintenance: '2024-12-10',
      nextMaintenanceDue: '2025-01-10',
      features: ['Luggage Rack', 'Air Conditioning', 'PA System'],
      currentLocation: { lat: 42.7800, lng: 141.6500, heading: 270, speed: 45, lastUpdated: new Date().toISOString() },
    },
    {
      id: 'veh-5',
      name: 'Lexus LX',
      type: 'suv',
      licensePlate: '品川 500 さ 8888',
      capacity: 5,
      status: 'available',
      fuelLevel: 78,
      mileage: 28750,
      lastMaintenance: '2024-12-05',
      nextMaintenanceDue: '2025-01-05',
      features: ['WiFi', 'USB Charging', 'Ski Rack', '4WD', 'Snow Tires'],
      currentLocation: { lat: HOTEL_LOCATION.lat + 0.001, lng: HOTEL_LOCATION.lng + 0.001, heading: 0, speed: 0, lastUpdated: new Date().toISOString() },
    },
    {
      id: 'veh-6',
      name: 'Toyota Crown Sedan',
      type: 'sedan',
      licensePlate: '品川 300 た 4567',
      capacity: 4,
      status: 'maintenance',
      fuelLevel: 30,
      mileage: 52100,
      lastMaintenance: '2024-12-25',
      nextMaintenanceDue: '2025-01-25',
      features: ['WiFi', 'USB Charging', 'Leather Seats'],
    },
    {
      id: 'veh-7',
      name: 'Coaster Minibus',
      type: 'minibus',
      licensePlate: '品川 200 は 9012',
      capacity: 20,
      status: 'available',
      fuelLevel: 90,
      mileage: 95200,
      lastMaintenance: '2024-12-18',
      nextMaintenanceDue: '2025-01-18',
      features: ['Luggage Compartment', 'Air Conditioning', 'PA System', 'TV Screens'],
    },
  ];
  return vehicles;
};

// Generate driver trips
const generateDriverTrips = (employees: Employee[]): DriverTrip[] => {
  const drivers = employees.filter(e => e.department === 'drivers');
  const now = new Date();
  const trips: DriverTrip[] = [];

  // Active and upcoming trips
  const tripTemplates = [
    {
      type: 'airport_pickup' as TripType,
      guestName: 'Mr. John Smith',
      guestRoom: '501',
      numberOfGuests: 2,
      luggageCount: 4,
      pickupLocation: 'Narita International Airport - Terminal 1',
      dropoffLocation: 'Hotel Main Entrance',
      flightNumber: 'JL001',
      flightStatus: 'on_time' as const,
      terminal: 'Terminal 1',
      priority: 'vip' as TripPriority,
      status: 'en_route_pickup' as TripStatus,
    },
    {
      type: 'airport_dropoff' as TripType,
      guestName: 'Ms. Emily Chen',
      guestRoom: '302',
      numberOfGuests: 1,
      luggageCount: 2,
      pickupLocation: 'Hotel Main Entrance',
      dropoffLocation: 'Haneda Airport - Terminal 2',
      flightNumber: 'NH879',
      terminal: 'Terminal 2',
      priority: 'normal' as TripPriority,
      status: 'assigned' as TripStatus,
    },
    {
      type: 'shuttle' as TripType,
      guestName: 'Ski Shuttle - Morning Run',
      numberOfGuests: 8,
      pickupLocation: 'Hotel Main Entrance',
      dropoffLocation: 'Hakuba Ski Resort - Base Lodge',
      priority: 'normal' as TripPriority,
      status: 'in_progress' as TripStatus,
    },
    {
      type: 'vip_transfer' as TripType,
      guestName: 'Mr. Tanaka (CEO Guest)',
      guestRoom: '1001',
      numberOfGuests: 3,
      pickupLocation: 'Hotel Main Entrance',
      dropoffLocation: 'Tokyo Imperial Palace - East Gardens',
      priority: 'vip' as TripPriority,
      status: 'pending' as TripStatus,
      specialRequests: 'Requires Japanese-speaking driver. Water bottles and newspapers requested.',
    },
    {
      type: 'tour' as TripType,
      guestName: 'Wilson Family',
      guestRoom: '405',
      numberOfGuests: 4,
      pickupLocation: 'Hotel Main Entrance',
      dropoffLocation: 'Mt. Fuji Day Tour',
      priority: 'normal' as TripPriority,
      status: 'assigned' as TripStatus,
      specialRequests: 'Full day tour with stops at Lake Kawaguchi and Oshino Hakkai',
    },
    {
      type: 'delivery' as TripType,
      guestName: 'Front Desk Request',
      numberOfGuests: 0,
      pickupLocation: 'Hotel - Receiving Area',
      dropoffLocation: 'Tokyo Station - Package Pickup',
      priority: 'priority' as TripPriority,
      status: 'pending' as TripStatus,
      deliveryItems: 'Guest luggage (3 pieces) - delayed baggage from airline',
      deliveryInstructions: 'Deliver directly to Room 602 upon return',
    },
    {
      type: 'errand' as TripType,
      guestName: 'Concierge Request',
      numberOfGuests: 0,
      pickupLocation: 'Hotel',
      dropoffLocation: 'Ginza Mitsukoshi Department Store',
      priority: 'normal' as TripPriority,
      status: 'pending' as TripStatus,
      deliveryItems: 'Purchase luxury gift for VIP guest (Budget: ¥50,000)',
      deliveryInstructions: 'Gift wrapping required. Receipt needed for room charge.',
    },
    {
      type: 'event' as TripType,
      guestName: 'Wedding Party Transfer',
      numberOfGuests: 12,
      pickupLocation: 'Tokyo Chapel',
      dropoffLocation: 'Hotel Banquet Hall',
      priority: 'vip' as TripPriority,
      status: 'assigned' as TripStatus,
      specialRequests: 'Decorate vehicle with flowers. Champagne service.',
    },
  ];

  tripTemplates.forEach((template, i) => {
    const scheduledTime = new Date(now.getTime() + (i - 2) * 60 * 60 * 1000);
    const driver = drivers[i % drivers.length];

    trips.push({
      id: `trip-${i + 1}`,
      ...template,
      driverId: template.status !== 'pending' ? driver?.id : undefined,
      driverName: template.status !== 'pending' ? driver?.name : undefined,
      vehicleId: template.status !== 'pending' ? `veh-${(i % 7) + 1}` : undefined,
      scheduledTime: scheduledTime.toISOString(),
      estimatedPickupTime: new Date(scheduledTime.getTime() + 5 * 60 * 1000).toISOString(),
      estimatedArrivalTime: new Date(scheduledTime.getTime() + 45 * 60 * 1000).toISOString(),
      estimatedDistance: 15 + Math.random() * 50,
      estimatedDuration: 30 + Math.floor(Math.random() * 60),
      fareEstimate: 5000 + Math.floor(Math.random() * 15000),
      isPaid: false,
      requestedBy: 'Front Desk',
      requestSource: 'front_desk',
      createdAt: new Date(now.getTime() - Math.random() * 86400000).toISOString(),
    });
  });

  // Add some completed trips
  for (let i = 0; i < 5; i++) {
    const completedTime = new Date(now.getTime() - (i + 1) * 2 * 60 * 60 * 1000);
    const driver = drivers[i % drivers.length];
    trips.push({
      id: `trip-completed-${i + 1}`,
      type: ['airport_pickup', 'airport_dropoff', 'shuttle', 'vip_transfer'][i % 4] as TripType,
      status: 'completed',
      priority: 'normal',
      driverId: driver?.id,
      driverName: driver?.name,
      vehicleId: `veh-${(i % 7) + 1}`,
      guestName: `Guest ${i + 1}`,
      numberOfGuests: 1 + Math.floor(Math.random() * 3),
      pickupLocation: 'Hotel',
      dropoffLocation: i % 2 === 0 ? 'Narita Airport' : 'City Center',
      scheduledTime: completedTime.toISOString(),
      actualPickupTime: new Date(completedTime.getTime() + 5 * 60 * 1000).toISOString(),
      completedTime: new Date(completedTime.getTime() + 50 * 60 * 1000).toISOString(),
      actualDuration: 45 + Math.floor(Math.random() * 20),
      fareEstimate: 8000,
      actualFare: 7500 + Math.floor(Math.random() * 1000),
      isPaid: true,
      paymentMethod: 'room_charge',
      requestedBy: 'Concierge',
      requestSource: 'concierge',
      createdAt: new Date(completedTime.getTime() - 60 * 60 * 1000).toISOString(),
    });
  }

  return trips;
};

// Generate driver messages
const generateDriverMessages = (employees: Employee[]): DriverMessage[] => {
  const drivers = employees.filter(e => e.department === 'drivers');
  const messages: DriverMessage[] = [];

  const messageTemplates = [
    { msg: 'Flight JL001 has landed. Proceeding to arrivals.', type: 'update' as const },
    { msg: 'Guest picked up. En route to hotel. ETA 35 minutes.', type: 'update' as const },
    { msg: 'Traffic heavy on Route 1. Taking alternate route via Expressway.', type: 'alert' as const },
    { msg: 'Vehicle fuel low. Will refuel after current trip.', type: 'alert' as const },
    { msg: 'Please confirm pickup location for Mr. Tanaka - main entrance or VIP lounge?', type: 'text' as const },
    { msg: 'Shuttle departing in 10 minutes. Currently 6 guests confirmed.', type: 'update' as const },
    { msg: 'Package pickup completed. Returning to hotel.', type: 'update' as const },
    { msg: 'Please prepare welcome amenities for VIP guest arriving in 20 minutes.', type: 'instruction' as const },
  ];

  const now = new Date();
  messageTemplates.forEach((template, i) => {
    const driver = drivers[i % drivers.length];
    messages.push({
      id: `msg-${i + 1}`,
      driverId: driver?.id || '',
      driverName: driver?.name || '',
      senderId: i % 2 === 0 ? driver?.id || '' : 'dispatch',
      senderName: i % 2 === 0 ? driver?.name || '' : 'Dispatch Center',
      senderRole: i % 2 === 0 ? 'driver' : 'dispatch',
      message: template.msg,
      timestamp: new Date(now.getTime() - i * 15 * 60 * 1000).toISOString(),
      isRead: i > 2,
      type: template.type,
    });
  });

  return messages;
};

// Generate transportation requests
const generateTransportationRequests = (): TransportationRequest[] => {
  const requests: TransportationRequest[] = [
    {
      id: 'req-1',
      guestName: 'Mr. Robert Johnson',
      guestRoom: '705',
      guestPhone: '+1-555-0123',
      requestType: 'airport_pickup',
      pickupLocation: 'Narita Airport Terminal 2',
      dropoffLocation: 'Hotel',
      scheduledTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      numberOfGuests: 2,
      luggageCount: 3,
      flightNumber: 'AA123',
      priority: 'normal',
      status: 'new',
      source: 'guest_app',
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      createdBy: 'Guest App',
    },
    {
      id: 'req-2',
      guestName: 'Ms. Sarah Williams',
      guestRoom: '402',
      requestType: 'vip_transfer',
      pickupLocation: 'Hotel',
      dropoffLocation: 'Roppongi Hills',
      scheduledTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      numberOfGuests: 1,
      specialRequests: 'Luxury vehicle preferred',
      priority: 'vip',
      status: 'confirmed',
      source: 'concierge',
      createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      createdBy: 'Concierge - Yamada',
    },
    {
      id: 'req-3',
      guestName: 'Tanaka Group',
      guestRoom: '801-803',
      requestType: 'tour',
      pickupLocation: 'Hotel',
      dropoffLocation: 'Nikko Day Trip',
      scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      numberOfGuests: 8,
      specialRequests: 'English-speaking guide. Include lunch at traditional restaurant.',
      priority: 'priority',
      status: 'new',
      source: 'front_desk',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      createdBy: 'Front Desk - Sato',
    },
  ];

  return requests;
};

// Generate driver metrics
const generateDriverMetrics = (trips: DriverTrip[], vehicles: Vehicle[], employees: Employee[]): DriverMetrics => {
  const drivers = employees.filter(e => e.department === 'drivers');
  const completedTrips = trips.filter(t => t.status === 'completed');
  const activeTrips = trips.filter(t => ['en_route_pickup', 'guest_picked_up', 'in_progress'].includes(t.status));
  const pendingTrips = trips.filter(t => ['pending', 'assigned'].includes(t.status));

  return {
    totalTripsToday: trips.length,
    completedTripsToday: completedTrips.length,
    pendingTrips: pendingTrips.length,
    inProgressTrips: activeTrips.length,
    availableDrivers: drivers.filter(d => d.status === 'on_duty' && !activeTrips.find(t => t.driverId === d.id)).length,
    busyDrivers: drivers.filter(d => activeTrips.find(t => t.driverId === d.id)).length,
    offDutyDrivers: drivers.filter(d => d.status !== 'on_duty').length,
    availableVehicles: vehicles.filter(v => v.status === 'available').length,
    inUseVehicles: vehicles.filter(v => v.status === 'in_use').length,
    maintenanceVehicles: vehicles.filter(v => v.status === 'maintenance').length,
    avgTripDuration: 42,
    avgWaitTime: 8,
    onTimeRate: 94,
    guestSatisfaction: 4.7,
    totalDistanceToday: completedTrips.reduce((sum, t) => sum + (t.estimatedDistance || 0), 0),
    fuelCostToday: 12500,
    revenueToday: completedTrips.reduce((sum, t) => sum + (t.actualFare || 0), 0),
    airportTripsToday: trips.filter(t => t.type.includes('airport')).length,
    shuttleTripsToday: trips.filter(t => t.type === 'shuttle').length,
    vipTripsToday: trips.filter(t => t.priority === 'vip').length,
    deliveriesCompleted: completedTrips.filter(t => t.type === 'delivery' || t.type === 'errand').length,
  };
};

// Create the store
export const useEmployeeManagementStore = create<EmployeeManagementState>((set, get) => {
  const employees = generateEmployees();
  const tasks = generateTasks();
  const departmentMetrics = generateDepartmentMetrics(employees, tasks);
  const vehicles = generateVehicles();
  const driverTrips = generateDriverTrips(employees);

  return {
    employees,
    shifts: generateShifts(employees),
    tasks,
    departmentMetrics,
    housekeepingMetrics: generateHousekeepingMetrics(),
    housekeepingRooms: generateHousekeepingRooms(),
    housekeepingAttendants: generateHousekeepingAttendants(employees),
    aiInsights: generateAIInsights(employees, departmentMetrics),
    timeOffRequests: generateTimeOffRequests(employees),

    // Driver Management Data
    vehicles,
    driverTrips,
    driverMessages: generateDriverMessages(employees),
    transportationRequests: generateTransportationRequests(),
    driverMetrics: generateDriverMetrics(driverTrips, vehicles, employees),

    selectedDepartment: 'all',
    selectedDate: new Date().toISOString().split('T')[0],

    setSelectedDepartment: (dept) => set({ selectedDepartment: dept }),
    setSelectedDate: (date) => set({ selectedDate: date }),

    updateEmployeeStatus: (employeeId, status) => set((state) => ({
      employees: state.employees.map(e =>
        e.id === employeeId ? { ...e, status } : e
      ),
    })),

    updateEmployee: (employeeId, updates) => set((state) => ({
      employees: state.employees.map(e =>
        e.id === employeeId ? { ...e, ...updates } : e
      ),
    })),

    updateRoomStatus: (roomId, status, assignedTo) => set((state) => ({
      housekeepingRooms: state.housekeepingRooms.map(r =>
        r.id === roomId ? {
          ...r,
          cleaningStatus: status,
          assignedTo: assignedTo || r.assignedTo,
          cleaningStartTime: status === 'in_progress' ? new Date().toISOString() : r.cleaningStartTime,
          cleaningEndTime: status === 'clean' ? new Date().toISOString() : r.cleaningEndTime,
        } : r
      ),
    })),

    assignRoomToAttendant: (roomId, attendantId) => set((state) => ({
      housekeepingRooms: state.housekeepingRooms.map(r =>
        r.id === roomId ? { ...r, assignedTo: attendantId } : r
      ),
    })),

    markRoomInspected: (roomId, score, inspectedBy) => set((state) => ({
      housekeepingRooms: state.housekeepingRooms.map(r =>
        r.id === roomId ? {
          ...r,
          cleaningStatus: 'inspected' as RoomCleaningStatus,
          inspectionScore: score,
          inspectedBy,
          lastInspected: new Date().toISOString(),
        } : r
      ),
    })),

    assignTask: (taskId, employeeId) => set((state) => ({
      tasks: state.tasks.map(t =>
        t.id === taskId ? { ...t, assignedTo: employeeId, status: 'in_progress' } : t
      ),
    })),

    updateTaskStatus: (taskId, status) => set((state) => ({
      tasks: state.tasks.map(t =>
        t.id === taskId ? { ...t, status, completedAt: status === 'completed' ? new Date().toISOString() : undefined } : t
      ),
    })),

    acknowledgeInsight: (insightId) => set((state) => ({
      aiInsights: state.aiInsights.map(i =>
        i.id === insightId ? { ...i, acknowledged: true } : i
      ),
    })),

    approveTimeOff: (requestId, approved) => set((state) => ({
      timeOffRequests: state.timeOffRequests.map(r =>
        r.id === requestId ? { ...r, status: approved ? 'approved' : 'denied', reviewedAt: new Date().toISOString() } : r
      ),
    })),

    addShift: (shift) => set((state) => ({
      shifts: [...state.shifts, { ...shift, id: `shift-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` }],
    })),

    updateShift: (shiftId, updates) => set((state) => ({
      shifts: state.shifts.map(s =>
        s.id === shiftId ? { ...s, ...updates } : s
      ),
    })),

    deleteShift: (shiftId) => set((state) => ({
      shifts: state.shifts.filter(s => s.id !== shiftId),
    })),

    // Driver Management Actions
    assignDriverToTrip: (tripId, driverId, vehicleId) => set((state) => {
      const driver = state.employees.find(e => e.id === driverId);
      const vehicle = state.vehicles.find(v => v.id === vehicleId);
      return {
        driverTrips: state.driverTrips.map(t =>
          t.id === tripId ? {
            ...t,
            driverId,
            driverName: driver?.name,
            vehicleId,
            vehicleName: vehicle?.name,
            status: 'assigned' as TripStatus,
          } : t
        ),
        vehicles: state.vehicles.map(v =>
          v.id === vehicleId ? { ...v, status: 'in_use' as VehicleStatus, currentDriverId: driverId, currentTripId: tripId } : v
        ),
      };
    }),

    updateTripStatus: (tripId, status) => set((state) => ({
      driverTrips: state.driverTrips.map(t =>
        t.id === tripId ? {
          ...t,
          status,
          actualPickupTime: status === 'guest_picked_up' ? new Date().toISOString() : t.actualPickupTime,
          completedTime: status === 'completed' ? new Date().toISOString() : t.completedTime,
        } : t
      ),
      vehicles: status === 'completed'
        ? state.vehicles.map(v =>
            v.currentTripId === tripId ? { ...v, status: 'available' as VehicleStatus, currentDriverId: undefined, currentTripId: undefined } : v
          )
        : state.vehicles,
    })),

    addDriverTrip: (trip) => set((state) => ({
      driverTrips: [...state.driverTrips, { ...trip, id: `trip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` }],
    })),

    updateDriverTrip: (tripId, updates) => set((state) => ({
      driverTrips: state.driverTrips.map(t =>
        t.id === tripId ? { ...t, ...updates } : t
      ),
    })),

    cancelTrip: (tripId) => set((state) => {
      const trip = state.driverTrips.find(t => t.id === tripId);
      return {
        driverTrips: state.driverTrips.map(t =>
          t.id === tripId ? { ...t, status: 'cancelled' as TripStatus } : t
        ),
        vehicles: trip?.vehicleId
          ? state.vehicles.map(v =>
              v.id === trip.vehicleId ? { ...v, status: 'available' as VehicleStatus, currentDriverId: undefined, currentTripId: undefined } : v
            )
          : state.vehicles,
      };
    }),

    sendDriverMessage: (message) => set((state) => ({
      driverMessages: [
        {
          ...message,
          id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString(),
        },
        ...state.driverMessages,
      ],
    })),

    markMessageRead: (messageId) => set((state) => ({
      driverMessages: state.driverMessages.map(m =>
        m.id === messageId ? { ...m, isRead: true } : m
      ),
    })),

    updateVehicleStatus: (vehicleId, status) => set((state) => ({
      vehicles: state.vehicles.map(v =>
        v.id === vehicleId ? { ...v, status } : v
      ),
    })),

    convertRequestToTrip: (requestId) => set((state) => {
      const request = state.transportationRequests.find(r => r.id === requestId);
      if (!request) return state;

      const newTrip: DriverTrip = {
        id: `trip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: request.requestType,
        status: 'pending',
        priority: request.priority,
        guestName: request.guestName,
        guestRoom: request.guestRoom,
        guestPhone: request.guestPhone,
        numberOfGuests: request.numberOfGuests,
        luggageCount: request.luggageCount,
        pickupLocation: request.pickupLocation,
        dropoffLocation: request.dropoffLocation,
        scheduledTime: request.scheduledTime,
        flightNumber: request.flightNumber,
        specialRequests: request.specialRequests,
        isPaid: false,
        requestedBy: request.createdBy,
        requestSource: request.source,
        createdAt: new Date().toISOString(),
      };

      return {
        driverTrips: [...state.driverTrips, newTrip],
        transportationRequests: state.transportationRequests.map(r =>
          r.id === requestId ? { ...r, status: 'assigned' } : r
        ),
      };
    }),
  };
});
