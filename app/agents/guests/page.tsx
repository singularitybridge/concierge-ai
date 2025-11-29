'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Users, Star, Calendar, Clock, MessageSquare, Plane, Car, Bell, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import VoiceSessionChat from '../../components/VoiceSessionChat';
import GuestDetailModal, { GuestData } from '../../components/GuestDetailModal';

// Service request interface (with taskId for linking to tasks page)
interface ServiceRequest {
  id: string;
  taskId: string; // Links to /tasks/[taskId]
  guestId: string;
  guestName: string;
  roomNumber: string;
  type: 'room-service' | 'housekeeping' | 'concierge' | 'maintenance' | 'transport';
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  assignedTo?: string;
}

// Comprehensive guest data
const guestsData: GuestData[] = [
  {
    id: 'tanaka',
    name: 'Tanaka Family',
    roomNumber: '301',
    roomType: 'Sky Suite',
    checkIn: 'Dec 10',
    checkOut: 'Dec 15',
    status: 'vip',
    guestCount: 4,
    nationality: 'Japan',
    language: 'Japanese',
    email: 'tanaka.family@email.jp',
    phone: '+81-90-1234-5678',
    preferences: ['Green tea', 'Extra futons', 'Late breakfast'],
    notes: 'Celebrating 10th anniversary. Complimentary champagne arranged.',
    specialRequests: ['Early check-in requested', 'Child bed needed', 'Connecting rooms if possible'],
    previousStays: 3,
    loyaltyTier: 'platinum',
    arrivalTime: '15:00',
    flightNumber: 'NH1234'
  },
  {
    id: 'chen',
    name: 'Mr. & Mrs. Chen',
    roomNumber: '205',
    roomType: 'Onsen Suite',
    checkIn: 'Dec 10',
    checkOut: 'Dec 13',
    status: 'arriving',
    guestCount: 2,
    nationality: 'Taiwan',
    language: 'Mandarin',
    email: 'david.chen@email.tw',
    phone: '+886-912-345-678',
    preferences: ['Private onsen time', 'Vegetarian options'],
    notes: 'Honeymoon couple. Airport pickup confirmed.',
    specialRequests: ['Airport pickup at 16:00', 'Rose petals in room'],
    previousStays: 0,
    loyaltyTier: 'standard',
    arrivalTime: '16:00',
    flightNumber: 'CI156'
  },
  {
    id: 'sato',
    name: 'Sato Couple',
    roomNumber: '402',
    roomType: 'Garden Suite',
    checkIn: 'Dec 8',
    checkOut: 'Dec 12',
    status: 'checked-in',
    guestCount: 2,
    nationality: 'Japan',
    language: 'Japanese',
    email: 'sato.kenji@email.jp',
    phone: '+81-80-9876-5432',
    preferences: ['Sake selection', 'Morning yoga'],
    notes: 'Anniversary celebration. Champagne delivered.',
    specialRequests: ['Dinner reservation for anniversary'],
    previousStays: 5,
    loyaltyTier: 'gold',
  },
  {
    id: 'kim',
    name: 'Kim Family',
    roomNumber: '303',
    roomType: 'Forest Suite',
    checkIn: 'Dec 9',
    checkOut: 'Dec 11',
    status: 'checked-in',
    guestCount: 4,
    nationality: 'South Korea',
    language: 'Korean',
    email: 'kim.family@email.kr',
    phone: '+82-10-1234-5678',
    preferences: ['Korean breakfast', 'Ski equipment'],
    notes: 'Family ski trip. Children ages 8 and 12.',
    specialRequests: ['Kosher meals', 'Ski instructor for kids'],
    previousStays: 1,
    loyaltyTier: 'standard',
  },
  {
    id: 'yamamoto',
    name: 'Dr. Yamamoto',
    roomNumber: '201',
    roomType: 'Valley Suite',
    checkIn: 'Dec 9',
    checkOut: 'Dec 13',
    status: 'checked-in',
    guestCount: 1,
    nationality: 'Japan',
    language: 'Japanese',
    email: 'dr.yamamoto@hospital.jp',
    phone: '+81-70-1111-2222',
    preferences: ['Quiet room', 'Early check-out option'],
    notes: 'Business traveler. Works remotely. Do not disturb until 10am.',
    specialRequests: ['Extra pillows', 'Desk lamp', 'Quiet room away from elevator'],
    previousStays: 8,
    loyaltyTier: 'platinum',
  },
  {
    id: 'williams',
    name: 'Ms. Williams',
    roomNumber: '404',
    roomType: 'Mountain Suite',
    checkIn: 'Dec 7',
    checkOut: 'Dec 10',
    status: 'checked-out',
    guestCount: 1,
    nationality: 'Australia',
    language: 'English',
    email: 'sarah.williams@email.au',
    phone: '+61-412-345-678',
    preferences: ['Flat white coffee', 'Vegan meals'],
    notes: 'Late checkout approved. Departing at 14:00.',
    specialRequests: ['Late checkout until 14:00'],
    previousStays: 2,
    loyaltyTier: 'gold',
  }
];

// Service requests data (linked to tasks)
const requestsData: ServiceRequest[] = [
  {
    id: 'req-001',
    taskId: 'dinner-reservation-sato',
    guestId: 'sato',
    guestName: 'Sato Couple',
    roomNumber: '402',
    type: 'concierge',
    description: 'Dinner reservation at 19:00 for anniversary',
    status: 'completed',
    priority: 'medium',
    createdAt: '10 min ago',
    assignedTo: 'Yuki'
  },
  {
    id: 'req-002',
    taskId: 'ski-rental-kim',
    guestId: 'kim',
    guestName: 'Kim Family',
    roomNumber: '303',
    type: 'concierge',
    description: 'Ski equipment rental for family',
    status: 'in-progress',
    priority: 'medium',
    createdAt: '25 min ago',
    assignedTo: 'Takeshi'
  },
  {
    id: 'req-003',
    taskId: 'spa-appointment-yamamoto',
    guestId: 'yamamoto',
    guestName: 'Dr. Yamamoto',
    roomNumber: '201',
    type: 'concierge',
    description: 'Spa appointment tomorrow at 15:00',
    status: 'pending',
    priority: 'low',
    createdAt: '1 hour ago'
  },
  {
    id: 'req-004',
    taskId: 'welcome-package-tanaka',
    guestId: 'tanaka',
    guestName: 'Tanaka Family',
    roomNumber: '301',
    type: 'room-service',
    description: 'Welcome champagne and fruit basket',
    status: 'pending',
    priority: 'high',
    createdAt: '5 min ago'
  },
  {
    id: 'req-005',
    taskId: 'airport-pickup-chen',
    guestId: 'chen',
    guestName: 'Mr. & Mrs. Chen',
    roomNumber: '205',
    type: 'transport',
    description: 'Airport pickup at New Chitose Airport',
    status: 'in-progress',
    priority: 'high',
    createdAt: '2 hours ago',
    assignedTo: 'Driver Kenji'
  }
];

type ViewTab = 'guests' | 'arrivals' | 'requests';

export default function GuestsAgentPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ViewTab>('guests');
  const [selectedGuest, setSelectedGuest] = useState<GuestData | null>(null);
  const [guests, setGuests] = useState(guestsData);
  const [requests, setRequests] = useState(requestsData);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Filter data based on tab
  const arrivals = guests.filter(g => g.status === 'arriving' || g.status === 'vip');
  const departures = guests.filter(g => g.status === 'checked-out');
  const inHouseGuests = guests.filter(g => g.status === 'checked-in' || g.status === 'vip');
  const pendingRequests = requests.filter(r => r.status === 'pending' || r.status === 'in-progress');

  // Show notification
  const showNotification = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Find guest by ID or partial name match
  const findGuest = (guestId: string): GuestData | undefined => {
    const searchTerm = guestId.toLowerCase().replace(/[^a-z]/g, '');
    return guests.find(g =>
      g.id.toLowerCase() === searchTerm ||
      g.name.toLowerCase().includes(searchTerm) ||
      g.name.toLowerCase().replace(/[^a-z]/g, '').includes(searchTerm)
    );
  };

  // Find request by ID
  const findRequest = (requestId: string): ServiceRequest | undefined => {
    return requests.find(r => r.id === requestId || r.taskId === requestId);
  };

  // Navigate to task page for a request
  const navigateToTask = (taskId: string) => {
    router.push(`/tasks/${taskId}`);
  };

  // Event handlers for voice commands
  useEffect(() => {
    const handleShowGuestCard = (e: CustomEvent<{ guestId: string }>) => {
      const guest = findGuest(e.detail.guestId);
      if (guest) {
        setSelectedGuest(guest);
      }
    };

    const handleShowRequestCard = (e: CustomEvent<{ requestId: string }>) => {
      const request = findRequest(e.detail.requestId);
      if (request) {
        // Navigate to task page instead of showing modal
        navigateToTask(request.taskId);
      }
    };

    const handleCloseModal = () => {
      setSelectedGuest(null);
    };

    const handleFilterView = (e: CustomEvent<{ view: string }>) => {
      const view = e.detail.view as ViewTab;
      if (['guests', 'arrivals', 'requests'].includes(view)) {
        setActiveTab(view);
      }
    };

    const handleSendMessage = (e: CustomEvent<{ guestId: string; message: string; channel: string }>) => {
      const guest = findGuest(e.detail.guestId);
      if (guest) {
        showNotification(`Message sent to ${guest.name} via ${e.detail.channel}`, 'success');
      }
    };

    const handleOfferPickup = (e: CustomEvent<{ guestId: string; pickupType: string }>) => {
      const guest = findGuest(e.detail.guestId);
      if (guest) {
        showNotification(`${e.detail.pickupType} pickup offered to ${guest.name}`, 'success');
      }
    };

    const handleAddGuestNote = (e: CustomEvent<{ guestId: string; note: string; category: string }>) => {
      const guestId = e.detail.guestId;
      setGuests(prev => prev.map(g => {
        if (g.id === guestId || g.name.toLowerCase().includes(guestId.toLowerCase())) {
          const newNote = g.notes ? `${g.notes}\n[${e.detail.category}] ${e.detail.note}` : `[${e.detail.category}] ${e.detail.note}`;
          return { ...g, notes: newNote };
        }
        return g;
      }));
      showNotification(`Note added to guest profile`, 'success');
    };

    const handleUpdateRequest = (e: CustomEvent<{ requestId: string; status: string; note?: string }>) => {
      setRequests(prev => prev.map(r => {
        if (r.id === e.detail.requestId) {
          return {
            ...r,
            status: e.detail.status as ServiceRequest['status']
          };
        }
        return r;
      }));
      showNotification(`Request updated to ${e.detail.status}`, 'success');
    };

    window.addEventListener('guest-show-card', handleShowGuestCard as EventListener);
    window.addEventListener('guest-show-request', handleShowRequestCard as EventListener);
    window.addEventListener('guest-close-modal', handleCloseModal);
    window.addEventListener('guest-filter-view', handleFilterView as EventListener);
    window.addEventListener('guest-send-message', handleSendMessage as EventListener);
    window.addEventListener('guest-offer-pickup', handleOfferPickup as EventListener);
    window.addEventListener('guest-add-note', handleAddGuestNote as EventListener);
    window.addEventListener('guest-update-request', handleUpdateRequest as EventListener);

    return () => {
      window.removeEventListener('guest-show-card', handleShowGuestCard as EventListener);
      window.removeEventListener('guest-show-request', handleShowRequestCard as EventListener);
      window.removeEventListener('guest-close-modal', handleCloseModal);
      window.removeEventListener('guest-filter-view', handleFilterView as EventListener);
      window.removeEventListener('guest-send-message', handleSendMessage as EventListener);
      window.removeEventListener('guest-offer-pickup', handleOfferPickup as EventListener);
      window.removeEventListener('guest-add-note', handleAddGuestNote as EventListener);
      window.removeEventListener('guest-update-request', handleUpdateRequest as EventListener);
    };
  }, [guests, requests]);

  // Prepare context data for the voice agent
  const guestServicesData = {
    arrivals: arrivals.map(g => ({ id: g.id, name: g.name, room: g.roomNumber, time: g.arrivalTime, vip: g.status === 'vip' })),
    departures: departures.map(g => ({ id: g.id, name: g.name, room: g.roomNumber })),
    currentGuests: inHouseGuests.map(g => ({ id: g.id, name: g.name, room: g.roomNumber, checkOut: g.checkOut })),
    requests: pendingRequests.map(r => ({ id: r.id, guest: r.guestName, type: r.type, description: r.description, status: r.status, priority: r.priority }))
  };

  return (
    <div className="flex h-screen bg-stone-100">
      {/* Left: Guest Management Dashboard */}
      <div className="flex-[2] min-w-0 overflow-hidden">
        <div className="flex flex-col h-full bg-white">
          {/* Hero Image */}
          <div className="relative h-48 flex-shrink-0">
            <Image
              src="/hotel3.jpg"
              alt="Guest Services"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            {/* Back Button */}
            <Link
              href="/admin"
              className="absolute top-4 left-4 p-2 bg-white/80 backdrop-blur-sm rounded-full text-stone-600 hover:bg-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            {/* Title Overlay */}
            <div className="absolute bottom-4 left-6 right-6">
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/80">Guest Services</p>
              </div>
              <h1 className="text-xl font-light text-white tracking-wide" style={{ fontFamily: 'var(--font-cormorant)' }}>
                Reservations & Profiles
              </h1>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-4 gap-3 p-4 border-b border-stone-100">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Plane className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-xs text-blue-700">Arrivals</span>
              </div>
              <p className="text-xl font-light text-blue-900">{arrivals.length}</p>
            </div>
            <div className="p-3 bg-stone-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Car className="w-3.5 h-3.5 text-stone-400" />
                <span className="text-xs text-stone-500">Departures</span>
              </div>
              <p className="text-xl font-light text-stone-800">{departures.length}</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-xs text-emerald-700">In-House</span>
              </div>
              <p className="text-xl font-light text-emerald-900">{inHouseGuests.length}</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Bell className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-xs text-amber-700">Requests</span>
              </div>
              <p className="text-xl font-light text-amber-900">{pendingRequests.length}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-stone-100">
            {(['guests', 'arrivals', 'requests'] as ViewTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'text-stone-800 border-b-2 border-stone-800'
                    : 'text-stone-400 hover:text-stone-600'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Guests Tab */}
            {activeTab === 'guests' && inHouseGuests.map((guest) => (
              <div
                key={guest.id}
                onClick={() => setSelectedGuest(guest)}
                className="p-4 bg-stone-50 rounded-xl hover:bg-stone-100 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-stone-800">{guest.name}</p>
                    {guest.status === 'vip' && (
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    )}
                    {guest.loyaltyTier !== 'standard' && (
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        guest.loyaltyTier === 'platinum' ? 'bg-purple-100 text-purple-600' : 'bg-amber-100 text-amber-600'
                      }`}>
                        {guest.loyaltyTier}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-stone-400">{guest.roomNumber}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-500">{guest.roomType} • {guest.guestCount} guests</span>
                  <span className="text-stone-400">{guest.checkIn} - {guest.checkOut}</span>
                </div>
                {guest.notes && (
                  <p className="text-xs text-blue-600 mt-2 truncate">{guest.notes}</p>
                )}
              </div>
            ))}

            {/* Arrivals Tab */}
            {activeTab === 'arrivals' && (
              <>
                <h3 className="text-xs font-medium text-stone-400 uppercase tracking-wider">Today's Arrivals</h3>
                {arrivals.map((guest) => (
                  <div
                    key={guest.id}
                    onClick={() => setSelectedGuest(guest)}
                    className="p-4 bg-blue-50 rounded-xl hover:bg-blue-100 cursor-pointer transition-colors border border-blue-100"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-stone-800">{guest.name}</p>
                        {guest.status === 'vip' && (
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        )}
                      </div>
                      <span className="text-xs font-medium text-blue-600">{guest.arrivalTime}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-600">{guest.roomType} • Room {guest.roomNumber}</span>
                      <span className="text-stone-500">{guest.guestCount} guests</span>
                    </div>
                    {guest.flightNumber && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-stone-500">
                        <Plane className="w-3 h-3" />
                        <span>{guest.flightNumber}</span>
                      </div>
                    )}
                    {guest.specialRequests && guest.specialRequests.length > 0 && (
                      <p className="text-xs text-blue-700 mt-2">{guest.specialRequests.join(' • ')}</p>
                    )}
                  </div>
                ))}

                {departures.length > 0 && (
                  <>
                    <h3 className="text-xs font-medium text-stone-400 uppercase tracking-wider mt-6">Today's Departures</h3>
                    {departures.map((guest) => (
                      <div
                        key={guest.id}
                        onClick={() => setSelectedGuest(guest)}
                        className="p-4 bg-stone-50 rounded-xl hover:bg-stone-100 cursor-pointer transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-sm font-medium text-stone-800">{guest.name}</p>
                          <span className="text-xs px-2 py-0.5 bg-stone-200 text-stone-600 rounded-full">Departing</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-stone-500">
                          <span>Room {guest.roomNumber}</span>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </>
            )}

            {/* Requests Tab */}
            {activeTab === 'requests' && requests.map((req) => (
              <div
                key={req.id}
                onClick={() => navigateToTask(req.taskId)}
                className={`p-4 rounded-xl cursor-pointer transition-colors ${
                  req.status === 'completed'
                    ? 'bg-emerald-50 hover:bg-emerald-100'
                    : req.priority === 'urgent' || req.priority === 'high'
                    ? 'bg-amber-50 hover:bg-amber-100 border border-amber-200'
                    : 'bg-stone-50 hover:bg-stone-100'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {req.status === 'completed' ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    ) : req.priority === 'urgent' ? (
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    ) : (
                      <MessageSquare className="w-4 h-4 text-stone-400" />
                    )}
                    <p className="text-sm font-medium text-stone-800">{req.description}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    req.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                    req.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {req.status.replace('-', ' ')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-stone-500">
                  <span>{req.guestName} • Room {req.roomNumber}</span>
                  <span>{req.createdAt}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  {req.assignedTo && (
                    <p className="text-xs text-stone-400">Assigned to {req.assignedTo}</p>
                  )}
                  <div className="flex items-center gap-1 text-xs text-blue-600 ml-auto">
                    <span>View task</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Voice Chat */}
      <div className="flex-[1] min-w-0 p-4">
        <VoiceSessionChat
          agentId="guest-services"
          sessionId="guests-management"
          elevenLabsAgentId={process.env.NEXT_PUBLIC_ELEVENLABS_GUESTSERVICES_AGENT_ID}
          title="Guest Services"
          subtitle="AI Assistant"
          avatar="/avatars/operations-avatar.jpg"
          welcomeMessage="I can help you check on guests, view arrivals, and manage service requests. Try asking about a specific guest or the pending requests."
          suggestions={[
            "Did the Tanaka family arrive?",
            "Show me pending requests",
            "Who's checking out today?"
          ]}
          contextData={{ guestServicesData }}
        />
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className={`fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-lg text-sm text-white ${
          notification.type === 'success' ? 'bg-emerald-600' : 'bg-blue-600'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Guest Detail Modal */}
      <GuestDetailModal
        guest={selectedGuest}
        isOpen={!!selectedGuest}
        onClose={() => setSelectedGuest(null)}
        onSendMessage={(guestId) => {
          showNotification(`Opening message dialog for ${selectedGuest?.name}`);
        }}
        onOfferPickup={(guestId) => {
          showNotification(`Pickup offer sent to ${selectedGuest?.name}`);
        }}
        onAddNote={(guestId) => {
          showNotification(`Opening note dialog for ${selectedGuest?.name}`);
        }}
      />
    </div>
  );
}
