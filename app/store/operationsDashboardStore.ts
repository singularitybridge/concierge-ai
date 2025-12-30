import { create } from 'zustand';

// Types
export type RoomStatus = 'clean' | 'dirty' | 'in_progress' | 'inspecting' | 'maintenance' | 'occupied' | 'checkout' | 'out_of_order';
export type RoomType = 'standard' | 'deluxe' | 'suite' | 'penthouse';
export type RequestPriority = 'low' | 'medium' | 'high' | 'urgent';
export type RequestStatus = 'pending' | 'in_progress' | 'completed' | 'escalated';
export type AgentType = 'guest' | 'operations' | 'revenue' | 'architect';

export interface Room {
  id: string;
  number: string;
  floor: number;
  type: RoomType;
  status: RoomStatus;
  assignedTo?: string;
  guestName?: string;
  numAdults?: number;
  numChildren?: number;
  checkInDate?: string;
  checkoutDate?: string;
  checkoutTime?: string;
  estimatedReady?: string;
  lastCleaned?: string;
  notes?: string;
}

export interface GuestRequest {
  id: string;
  roomNumber: string;
  guestName: string;
  type: 'amenity' | 'maintenance' | 'housekeeping' | 'concierge' | 'complaint' | 'inquiry';
  message: string;
  priority: RequestPriority;
  status: RequestStatus;
  createdAt: string;
  assignedTo?: string;
  aiHandled: boolean;
  responseTime?: number; // in minutes
}

export interface AIAgentActivity {
  id: string;
  agentType: AgentType;
  action: string;
  details: string;
  timestamp: string;
  roomNumber?: string;
  guestName?: string;
  automated: boolean;
  outcome: 'success' | 'pending' | 'escalated' | 'failed';
}

export interface DashboardMetrics {
  occupancy: number;
  occupancyChange: number;
  adr: number; // Average Daily Rate
  adrChange: number;
  revpar: number; // Revenue Per Available Room
  revparChange: number;
  guestSatisfaction: number;
  satisfactionChange: number;
  roomsToClean: number;
  openRequests: number;
  aiTasksToday: number;
  aiAutomationRate: number;
}

export interface HousekeepingStaff {
  id: string;
  name: string;
  avatar: string;
  status: 'available' | 'busy' | 'break' | 'off';
  currentRoom?: string;
  roomsCleaned: number;
  avgTimePerRoom: number; // in minutes
}

interface OperationsDashboardState {
  // Data
  rooms: Room[];
  requests: GuestRequest[];
  agentActivities: AIAgentActivity[];
  metrics: DashboardMetrics;
  housekeepingStaff: HousekeepingStaff[];

  // UI State
  selectedRoom: Room | null;
  selectedRequest: GuestRequest | null;
  filterStatus: RoomStatus | 'all';
  filterFloor: number | 'all';
  filterType: RoomType | 'all';

  // Actions
  setRooms: (rooms: Room[]) => void;
  setRequests: (requests: GuestRequest[]) => void;
  setAgentActivities: (activities: AIAgentActivity[]) => void;
  setMetrics: (metrics: DashboardMetrics) => void;
  setHousekeepingStaff: (staff: HousekeepingStaff[]) => void;
  setSelectedRoom: (room: Room | null) => void;
  setSelectedRequest: (request: GuestRequest | null) => void;
  setFilterStatus: (status: RoomStatus | 'all') => void;
  setFilterFloor: (floor: number | 'all') => void;
  setFilterType: (type: RoomType | 'all') => void;
  updateRoomStatus: (roomId: string, status: RoomStatus) => void;
  updateRequestStatus: (requestId: string, status: RequestStatus) => void;
  refreshData: () => void;
}

// Room status labels for UI
export const ROOM_STATUS_LABELS: Record<RoomStatus, string> = {
  clean: 'Clean',
  dirty: 'Dirty',
  in_progress: 'In Progress',
  inspecting: 'Inspecting',
  maintenance: 'Maintenance',
  occupied: 'Occupied',
  checkout: 'Checkout',
  out_of_order: 'Out of Order',
};

// All available room statuses
export const ALL_ROOM_STATUSES: RoomStatus[] = [
  'clean',
  'dirty',
  'in_progress',
  'inspecting',
  'maintenance',
  'occupied',
  'checkout',
  'out_of_order',
];

// Room type labels for UI
export const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  standard: 'Standard',
  deluxe: 'Deluxe',
  suite: 'Suite',
  penthouse: 'Penthouse',
};

// All available room types
export const ALL_ROOM_TYPES: RoomType[] = [
  'standard',
  'deluxe',
  'suite',
  'penthouse',
];

// Mock Data
const generateMockRooms = (): Room[] => {
  const floors = [1, 2, 3, 4, 5];
  const roomsPerFloor = 55; // 55 rooms per floor = 275 total rooms

  // Room types distribution by floor
  const getTypeForRoom = (floor: number, roomNum: number): Room['type'] => {
    if (floor === 5) return 'penthouse'; // Floor 5 is all penthouse suites
    if (roomNum >= 50) return 'suite'; // Rooms 50-55 are suites
    if (roomNum >= 35) return 'deluxe'; // Rooms 35-49 are deluxe
    return 'standard'; // Rooms 01-34 are standard
  };

  // Status distribution (weighted to be realistic)
  const getRandomStatus = (): RoomStatus => {
    const rand = Math.random() * 100;
    if (rand < 45) return 'occupied';      // 45% occupied
    if (rand < 63) return 'clean';         // 18% clean
    if (rand < 76) return 'dirty';         // 13% dirty
    if (rand < 86) return 'checkout';      // 10% checkout
    if (rand < 93) return 'in_progress';   // 7% in progress
    if (rand < 96) return 'inspecting';    // 3% inspecting
    if (rand < 98) return 'maintenance';   // 2% maintenance
    return 'out_of_order';                 // 2% out of order
  };

  const staffNames = ['Yuki Tanaka', 'Hana Sato', 'Ken Yamamoto', 'Mai Suzuki', 'Takeshi Ito', 'Aiko Watanabe'];
  const guestNames = [
    'Mr. Anderson', 'Ms. Chen', 'Mr. Johnson', 'Mrs. Williams', 'Mr. Kim', 'Ms. Garcia',
    'Mr. Thompson', 'Ms. Nakamura', 'Mr. Brown', 'Mrs. Taylor', 'Mr. Lee', 'Ms. Martinez',
    'Mr. Wilson', 'Ms. Yamada', 'Mr. Davis', 'Mrs. Moore', 'Mr. Tanaka', 'Ms. Robinson'
  ];

  const rooms: Room[] = [];

  floors.forEach(floor => {
    for (let i = 1; i <= roomsPerFloor; i++) {
      // Room number format: floor digit + 2-digit room number (e.g., 101, 155, 201, 255)
      const roomNum = `${floor}${i.toString().padStart(2, '0')}`;
      const status = getRandomStatus();
      const type = getTypeForRoom(floor, i);

      // Generate guest data for occupied/checkout rooms
      const hasGuest = ['occupied', 'checkout'].includes(status);
      const numAdults = hasGuest ? 1 + Math.floor(Math.random() * 2) : undefined; // 1-2 adults
      const numChildren = hasGuest ? Math.floor(Math.random() * 3) : undefined; // 0-2 children

      // Generate check-in/checkout dates
      const today = new Date();
      const checkInDaysAgo = Math.floor(Math.random() * 5) + 1; // 1-5 days ago
      const stayLength = Math.floor(Math.random() * 7) + 1; // 1-7 nights
      const checkInDate = hasGuest ? new Date(today.getTime() - checkInDaysAgo * 86400000).toISOString().split('T')[0] : undefined;
      const checkoutDate = hasGuest ? new Date(today.getTime() + (stayLength - checkInDaysAgo) * 86400000).toISOString().split('T')[0] : undefined;

      rooms.push({
        id: `room-${roomNum}`,
        number: roomNum,
        floor,
        type,
        status,
        assignedTo: ['dirty', 'in_progress', 'inspecting'].includes(status)
          ? staffNames[Math.floor(Math.random() * staffNames.length)]
          : undefined,
        guestName: hasGuest
          ? guestNames[Math.floor(Math.random() * guestNames.length)]
          : undefined,
        numAdults,
        numChildren,
        checkInDate,
        checkoutDate,
        checkoutTime: status === 'checkout'
          ? `${10 + Math.floor(Math.random() * 3)}:00` // 10:00, 11:00, or 12:00
          : undefined,
        estimatedReady: status === 'in_progress'
          ? `${13 + Math.floor(Math.random() * 4)}:${Math.random() > 0.5 ? '00' : '30'}` // 13:00-16:30
          : undefined,
        lastCleaned: status === 'clean'
          ? new Date(Date.now() - Math.random() * 86400000).toISOString()
          : undefined,
      });
    }
  });

  return rooms;
};

const generateMockRequests = (): GuestRequest[] => {
  const requests: GuestRequest[] = [
    {
      id: 'req-001',
      roomNumber: '305',
      guestName: 'Mr. Anderson',
      type: 'amenity',
      message: 'Could we get extra towels and bathrobes for room 305?',
      priority: 'medium',
      status: 'pending',
      createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
      aiHandled: true,
    },
    {
      id: 'req-002',
      roomNumber: '412',
      guestName: 'Ms. Chen',
      type: 'maintenance',
      message: 'The air conditioning seems to be making a strange noise',
      priority: 'high',
      status: 'in_progress',
      createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
      assignedTo: 'Ken Yamamoto',
      aiHandled: false,
    },
    {
      id: 'req-003',
      roomNumber: '208',
      guestName: 'Mr. Johnson',
      type: 'concierge',
      message: 'Need restaurant recommendations for dinner tonight, preferably Japanese cuisine',
      priority: 'low',
      status: 'completed',
      createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
      aiHandled: true,
      responseTime: 2,
    },
    {
      id: 'req-004',
      roomNumber: '501',
      guestName: 'Mrs. Williams',
      type: 'complaint',
      message: 'Room service order arrived cold. Very disappointed.',
      priority: 'urgent',
      status: 'escalated',
      createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
      aiHandled: false,
    },
    {
      id: 'req-005',
      roomNumber: '102',
      guestName: 'Mr. Kim',
      type: 'housekeeping',
      message: 'Please clean the room, we will be out from 2-6pm',
      priority: 'medium',
      status: 'pending',
      createdAt: new Date(Date.now() - 60 * 60000).toISOString(),
      aiHandled: true,
    },
    {
      id: 'req-006',
      roomNumber: '315',
      guestName: 'Ms. Garcia',
      type: 'inquiry',
      message: 'What time does the spa close today?',
      priority: 'low',
      status: 'completed',
      createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
      aiHandled: true,
      responseTime: 1,
    },
  ];
  return requests;
};

const generateMockAgentActivities = (): AIAgentActivity[] => {
  return [
    {
      id: 'act-001',
      agentType: 'guest',
      action: 'Responded to inquiry',
      details: 'Provided spa hours and recommended treatments based on guest preferences',
      timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
      roomNumber: '315',
      guestName: 'Ms. Garcia',
      automated: true,
      outcome: 'success',
    },
    {
      id: 'act-002',
      agentType: 'operations',
      action: 'Optimized housekeeping queue',
      details: 'Reordered cleaning priority based on checkout times and guest requests',
      timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
      automated: true,
      outcome: 'success',
    },
    {
      id: 'act-003',
      agentType: 'guest',
      action: 'Pre-arrival engagement',
      details: 'Sent welcome message and collected preferences for arriving guest',
      timestamp: new Date(Date.now() - 18 * 60000).toISOString(),
      guestName: 'Mr. Thompson',
      automated: true,
      outcome: 'success',
    },
    {
      id: 'act-004',
      agentType: 'revenue',
      action: 'Upsell opportunity detected',
      details: 'Identified room upgrade opportunity for returning guest, sent personalized offer',
      timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
      roomNumber: '208',
      guestName: 'Mr. Johnson',
      automated: true,
      outcome: 'pending',
    },
    {
      id: 'act-005',
      agentType: 'operations',
      action: 'Escalated maintenance issue',
      details: 'A/C complaint in room 412 escalated to maintenance team with priority flag',
      timestamp: new Date(Date.now() - 35 * 60000).toISOString(),
      roomNumber: '412',
      guestName: 'Ms. Chen',
      automated: false,
      outcome: 'escalated',
    },
    {
      id: 'act-006',
      agentType: 'architect',
      action: 'Coordinated multi-agent task',
      details: 'Orchestrated early check-in request: housekeeping priority + front desk notification',
      timestamp: new Date(Date.now() - 42 * 60000).toISOString(),
      roomNumber: '301',
      automated: true,
      outcome: 'success',
    },
    {
      id: 'act-007',
      agentType: 'guest',
      action: 'Processed amenity request',
      details: 'Extra towels request logged and dispatched to housekeeping',
      timestamp: new Date(Date.now() - 50 * 60000).toISOString(),
      roomNumber: '305',
      guestName: 'Mr. Anderson',
      automated: true,
      outcome: 'success',
    },
    {
      id: 'act-008',
      agentType: 'revenue',
      action: 'Dynamic pricing update',
      details: 'Adjusted rates for next weekend based on demand forecast (+12%)',
      timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
      automated: true,
      outcome: 'success',
    },
  ];
};

const generateMockHousekeepingStaff = (): HousekeepingStaff[] => {
  return [
    {
      id: 'hk-001',
      name: 'Yuki Tanaka',
      avatar: '/avatars/staff-1.jpg',
      status: 'busy',
      currentRoom: '302',
      roomsCleaned: 5,
      avgTimePerRoom: 28,
    },
    {
      id: 'hk-002',
      name: 'Hana Sato',
      avatar: '/avatars/staff-2.jpg',
      status: 'busy',
      currentRoom: '215',
      roomsCleaned: 4,
      avgTimePerRoom: 32,
    },
    {
      id: 'hk-003',
      name: 'Ken Yamamoto',
      avatar: '/avatars/staff-3.jpg',
      status: 'available',
      roomsCleaned: 6,
      avgTimePerRoom: 25,
    },
    {
      id: 'hk-004',
      name: 'Mai Suzuki',
      avatar: '/avatars/staff-4.jpg',
      status: 'break',
      roomsCleaned: 3,
      avgTimePerRoom: 30,
    },
  ];
};

// Generate metrics based on room data
const generateMetrics = (rooms: Room[]): DashboardMetrics => {
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter(r => r.status === 'occupied' || r.status === 'checkout').length;
  const roomsToClean = rooms.filter(r => r.status === 'dirty' || r.status === 'checkout').length;

  return {
    occupancy: Math.round((occupiedRooms / totalRooms) * 100),
    occupancyChange: 5.2,
    adr: 42500, // yen
    adrChange: 8.3,
    revpar: 36975,
    revparChange: 12.1,
    guestSatisfaction: 4.7,
    satisfactionChange: 0.2,
    roomsToClean,
    openRequests: 7,
    aiTasksToday: 156 + Math.floor(totalRooms / 10), // Scale AI tasks with hotel size
    aiAutomationRate: 78,
  };
};

// Initialize rooms first so we can use them for metrics
const initialRooms = generateMockRooms();

export const useOperationsDashboardStore = create<OperationsDashboardState>((set) => ({
  // Initial data
  rooms: initialRooms,
  requests: generateMockRequests(),
  agentActivities: generateMockAgentActivities(),
  metrics: generateMetrics(initialRooms),
  housekeepingStaff: generateMockHousekeepingStaff(),

  // UI State
  selectedRoom: null,
  selectedRequest: null,
  filterStatus: 'all',
  filterFloor: 'all',
  filterType: 'all',

  // Actions
  setRooms: (rooms) => set({ rooms }),
  setRequests: (requests) => set({ requests }),
  setAgentActivities: (activities) => set({ agentActivities: activities }),
  setMetrics: (metrics) => set({ metrics }),
  setHousekeepingStaff: (staff) => set({ housekeepingStaff: staff }),
  setSelectedRoom: (room) => set({ selectedRoom: room }),
  setSelectedRequest: (request) => set({ selectedRequest: request }),
  setFilterStatus: (status) => set({ filterStatus: status }),
  setFilterFloor: (floor) => set({ filterFloor: floor }),
  setFilterType: (type) => set({ filterType: type }),

  updateRoomStatus: (roomId, status) => set((state) => ({
    rooms: state.rooms.map(room =>
      room.id === roomId ? { ...room, status } : room
    ),
  })),

  updateRequestStatus: (requestId, status) => set((state) => ({
    requests: state.requests.map(request =>
      request.id === requestId ? { ...request, status } : request
    ),
  })),

  refreshData: () => {
    const newRooms = generateMockRooms();
    set({
      rooms: newRooms,
      metrics: generateMetrics(newRooms),
      agentActivities: generateMockAgentActivities(),
      selectedRoom: null,
    });
  },
}));
