'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Clock, User, CheckCircle2, AlertCircle, Loader2,
  MessageSquare, Pencil, Trash2, Send, Calendar, MapPin,
  Tag, History, LogOut, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import VoiceSessionChat from '../../components/VoiceSessionChat';
import { useLanguageStore } from '@/lib/use-language-store';

// Mock tasks data - in production this would come from a database
const tasksData: Record<string, TaskData> = {
  'pricing-review': {
    id: 'pricing-review',
    title: 'Review Dynamic Pricing',
    description: 'Analyze weekend rates for ski season peak. Compare with competitor pricing and adjust our rates to maximize revenue while maintaining occupancy targets.',
    status: 'in-progress',
    priority: 'high',
    assignedTo: {
      name: 'Yuki Tanaka',
      title: 'Revenue Manager',
      avatar: '/avatars/revenue.jpg',
      agentId: 'revenue',
    },
    createdAt: '2025-12-08T09:00:00Z',
    dueDate: '2025-12-10T18:00:00Z',
    location: 'All Suites',
    category: 'Revenue',
    tags: ['pricing', 'ski-season', 'revenue'],
    activity: [
      { id: 1, type: 'created', user: 'System', message: 'Task created', timestamp: '2025-12-08T09:00:00Z' },
      { id: 2, type: 'assigned', user: 'GM Tanaka', message: 'Assigned to Yuki Tanaka', timestamp: '2025-12-08T09:05:00Z' },
      { id: 3, type: 'comment', user: 'Yuki Tanaka', message: 'Started analysis of competitor rates. Will have recommendations by EOD.', timestamp: '2025-12-08T14:30:00Z' },
      { id: 4, type: 'status', user: 'Yuki Tanaka', message: 'Status changed to In Progress', timestamp: '2025-12-08T14:30:00Z' },
    ],
    notes: 'Focus on Dec 20-24 period. Grand Opening guests may extend stays.',
  },
  'vip-arrival': {
    id: 'vip-arrival',
    title: 'VIP Guest Arrival',
    description: 'Prepare welcome package for Tanaka Family arriving Dec 10 for Grand Opening. Includes flower arrangement, sake, and personalized note from GM.',
    status: 'pending',
    priority: 'high',
    assignedTo: {
      name: 'Kenji Sato',
      title: 'Guest Services Director',
      avatar: '/avatars/guests.jpg',
      agentId: 'guests',
    },
    createdAt: '2025-12-07T15:00:00Z',
    dueDate: '2025-12-10T14:00:00Z',
    location: 'Sky Suite 401',
    category: 'Guest Services',
    tags: ['vip', 'grand-opening', 'welcome'],
    activity: [
      { id: 1, type: 'created', user: 'System', message: 'Task created from reservation', timestamp: '2025-12-07T15:00:00Z' },
      { id: 2, type: 'assigned', user: 'System', message: 'Auto-assigned to Kenji Sato', timestamp: '2025-12-07T15:00:00Z' },
      { id: 3, type: 'comment', user: 'Kenji Sato', message: 'Confirmed sake preference: Dassai 23. Arranging with supplier.', timestamp: '2025-12-08T10:00:00Z' },
    ],
    notes: 'Guest has stayed with us before. Prefers room temperature around 22°C.',
  },
  'maintenance-check': {
    id: 'maintenance-check',
    title: 'Onsen Temperature Check',
    description: 'Resolve Valley Suite heating fluctuation reported by previous guest. Temperature dropping intermittently in private onsen.',
    status: 'in-progress',
    priority: 'urgent',
    assignedTo: {
      name: 'Mika Hayashi',
      title: 'Operations Manager',
      avatar: '/avatars/operations.jpg',
      agentId: 'operations',
    },
    createdAt: '2025-12-08T07:30:00Z',
    dueDate: '2025-12-08T17:00:00Z',
    location: 'Garden Suite 204',
    category: 'Maintenance',
    tags: ['onsen', 'urgent', 'heating'],
    activity: [
      { id: 1, type: 'created', user: 'Guest Feedback', message: 'Task created from guest report', timestamp: '2025-12-08T07:30:00Z' },
      { id: 2, type: 'assigned', user: 'System', message: 'Urgent: Assigned to Mika Hayashi', timestamp: '2025-12-08T07:30:00Z' },
      { id: 3, type: 'status', user: 'Mika Hayashi', message: 'Status changed to In Progress', timestamp: '2025-12-08T08:00:00Z' },
      { id: 4, type: 'comment', user: 'Mika Hayashi', message: 'Technician dispatched. Suspect thermostat issue.', timestamp: '2025-12-08T08:15:00Z' },
      { id: 5, type: 'comment', user: 'Mika Hayashi', message: 'Thermostat replaced. Monitoring temperature for next 2 hours.', timestamp: '2025-12-08T10:30:00Z' },
    ],
    notes: 'Room is booked for Dec 9. Must be resolved today.',
  },
  // Service Request Tasks (linked from Guest Services page)
  'dinner-reservation-sato': {
    id: 'dinner-reservation-sato',
    title: 'Dinner Reservation - Sato Couple',
    description: 'Make dinner reservation at 19:00 for anniversary celebration. Sato Couple in Room 402 requested special anniversary setup.',
    status: 'completed',
    priority: 'medium',
    assignedTo: {
      name: 'Yuki Nakamura',
      title: 'Concierge',
      avatar: '/avatars/guest-avatar.jpg',
      agentId: 'guests',
    },
    createdAt: '2025-12-09T08:50:00Z',
    dueDate: '2025-12-09T18:00:00Z',
    location: 'Room 402',
    category: 'Concierge',
    tags: ['dining', 'anniversary', 'reservation'],
    activity: [
      { id: 1, type: 'created', user: 'Guest Request', message: 'Task created from guest service request', timestamp: '2025-12-09T08:50:00Z' },
      { id: 2, type: 'assigned', user: 'System', message: 'Assigned to Yuki Nakamura', timestamp: '2025-12-09T08:50:00Z' },
      { id: 3, type: 'comment', user: 'Yuki Nakamura', message: 'Reserved table 7 with mountain view. Arranged anniversary cake surprise.', timestamp: '2025-12-09T09:15:00Z' },
      { id: 4, type: 'status', user: 'Yuki Nakamura', message: 'Status changed to Completed', timestamp: '2025-12-09T09:20:00Z' },
    ],
    notes: 'Anniversary celebration. Champagne has been delivered to room.',
  },
  'ski-rental-kim': {
    id: 'ski-rental-kim',
    title: 'Ski Equipment Rental - Kim Family',
    description: 'Arrange ski equipment rental for family of 4. Kim Family in Room 303 needs equipment for 2 adults and 2 children (ages 8 and 12).',
    status: 'in-progress',
    priority: 'medium',
    assignedTo: {
      name: 'Takeshi Yamada',
      title: 'Activities Coordinator',
      avatar: '/avatars/operations.jpg',
      agentId: 'operations',
    },
    createdAt: '2025-12-09T08:35:00Z',
    dueDate: '2025-12-09T14:00:00Z',
    location: 'Room 303',
    category: 'Activities',
    tags: ['ski', 'rental', 'family', 'equipment'],
    activity: [
      { id: 1, type: 'created', user: 'Guest Request', message: 'Task created from guest service request', timestamp: '2025-12-09T08:35:00Z' },
      { id: 2, type: 'assigned', user: 'System', message: 'Assigned to Takeshi Yamada', timestamp: '2025-12-09T08:35:00Z' },
      { id: 3, type: 'status', user: 'Takeshi Yamada', message: 'Status changed to In Progress', timestamp: '2025-12-09T08:40:00Z' },
      { id: 4, type: 'comment', user: 'Takeshi Yamada', message: 'Contacted Niseko Sports for family package. Equipment will be delivered by 2pm.', timestamp: '2025-12-09T08:45:00Z' },
    ],
    notes: 'Family ski trip. First time skiing for children - recommend beginner lessons.',
  },
  'spa-appointment-yamamoto': {
    id: 'spa-appointment-yamamoto',
    title: 'Spa Appointment - Dr. Yamamoto',
    description: 'Book spa appointment for tomorrow at 15:00. Dr. Yamamoto in Room 201 requested deep tissue massage.',
    status: 'pending',
    priority: 'low',
    assignedTo: {
      name: 'Yuki Nakamura',
      title: 'Concierge',
      avatar: '/avatars/guest-avatar.jpg',
      agentId: 'guests',
    },
    createdAt: '2025-12-09T08:00:00Z',
    dueDate: '2025-12-10T14:00:00Z',
    location: 'Room 201',
    category: 'Concierge',
    tags: ['spa', 'wellness', 'booking'],
    activity: [
      { id: 1, type: 'created', user: 'Guest Request', message: 'Task created from guest service request', timestamp: '2025-12-09T08:00:00Z' },
      { id: 2, type: 'assigned', user: 'System', message: 'Assigned to Yuki Nakamura', timestamp: '2025-12-09T08:00:00Z' },
    ],
    notes: 'Business traveler. Prefers quiet environment. Do not disturb until 10am.',
  },
  'welcome-package-tanaka': {
    id: 'welcome-package-tanaka',
    title: 'Welcome Package - Tanaka Family',
    description: 'Prepare and deliver welcome champagne and fruit basket to Tanaka Family VIP guests in Sky Suite 301.',
    status: 'pending',
    priority: 'high',
    assignedTo: {
      name: 'Kenji Sato',
      title: 'Guest Services Director',
      avatar: '/avatars/guests.jpg',
      agentId: 'guests',
    },
    createdAt: '2025-12-09T08:55:00Z',
    dueDate: '2025-12-10T14:00:00Z',
    location: 'Sky Suite 301',
    category: 'Guest Services',
    tags: ['vip', 'welcome', 'amenities'],
    activity: [
      { id: 1, type: 'created', user: 'Reservation System', message: 'Task auto-created for VIP arrival', timestamp: '2025-12-09T08:55:00Z' },
      { id: 2, type: 'assigned', user: 'System', message: 'Assigned to Kenji Sato', timestamp: '2025-12-09T08:55:00Z' },
    ],
    notes: '10th anniversary celebration. Platinum loyalty member with 3 previous stays.',
  },
  'airport-pickup-chen': {
    id: 'airport-pickup-chen',
    title: 'Airport Pickup - Chen Family',
    description: 'Arrange airport pickup at New Chitose Airport for Mr. & Mrs. Chen arriving for honeymoon stay.',
    status: 'in-progress',
    priority: 'high',
    assignedTo: {
      name: 'Driver Kenji',
      title: 'Transportation',
      avatar: '/avatars/operations.jpg',
      agentId: 'operations',
    },
    createdAt: '2025-12-09T07:00:00Z',
    dueDate: '2025-12-09T12:00:00Z',
    location: 'New Chitose Airport',
    category: 'Transportation',
    tags: ['airport', 'pickup', 'honeymoon', 'vip'],
    activity: [
      { id: 1, type: 'created', user: 'Reservation System', message: 'Task created from booking', timestamp: '2025-12-09T07:00:00Z' },
      { id: 2, type: 'assigned', user: 'System', message: 'Assigned to Driver Kenji', timestamp: '2025-12-09T07:00:00Z' },
      { id: 3, type: 'status', user: 'Driver Kenji', message: 'Status changed to In Progress', timestamp: '2025-12-09T08:00:00Z' },
      { id: 4, type: 'comment', user: 'Driver Kenji', message: 'En route to airport. Flight NH123 arriving at 11:30.', timestamp: '2025-12-09T09:30:00Z' },
    ],
    notes: 'Honeymoon couple. Arrange champagne in car. Flight NH123.',
  },
  // Tasks from Admin Page
  'room-turnover': {
    id: 'room-turnover',
    title: 'Suite 301 Express Turnover',
    description: 'Early check-out, next guest arriving 2PM - deep clean priority',
    status: 'in-progress',
    priority: 'high',
    assignedTo: {
      name: 'Mika Hayashi',
      title: 'Operations Manager',
      avatar: '/avatars/operations.jpg',
      agentId: 'operations',
    },
    createdAt: '2025-12-10T08:00:00Z',
    dueDate: '2025-12-10T14:00:00Z',
    location: 'Suite 301',
    category: 'Housekeeping',
    tags: ['turnover', 'deep-clean', 'priority'],
    activity: [
      { id: 1, type: 'created', user: 'System', message: 'Task auto-created from check-out', timestamp: '2025-12-10T08:00:00Z' },
      { id: 2, type: 'assigned', user: 'System', message: 'Assigned to Mika Hayashi', timestamp: '2025-12-10T08:00:00Z' },
      { id: 3, type: 'status', user: 'Mika Hayashi', message: 'Status changed to In Progress', timestamp: '2025-12-10T09:00:00Z' },
    ],
    notes: 'Express turnover required. Next guest is VIP platinum member.',
  },
  'airport-pickup': {
    id: 'airport-pickup',
    title: 'Airport Pickup - Sato Family',
    description: 'New Chitose Airport, 4 guests, Flight JL515 arriving 14:30',
    status: 'pending',
    priority: 'high',
    assignedTo: {
      name: 'Kenji Sato',
      title: 'Guest Services Director',
      avatar: '/avatars/guests.jpg',
      agentId: 'guests',
    },
    createdAt: '2025-12-10T07:00:00Z',
    dueDate: '2025-12-10T14:30:00Z',
    location: 'New Chitose Airport',
    category: 'Transportation',
    tags: ['airport', 'pickup', 'family'],
    activity: [
      { id: 1, type: 'created', user: 'Reservation System', message: 'Task created from booking', timestamp: '2025-12-10T07:00:00Z' },
      { id: 2, type: 'assigned', user: 'System', message: 'Assigned to Kenji Sato', timestamp: '2025-12-10T07:00:00Z' },
    ],
    notes: 'Family of 4 with 2 children. Child seats required in vehicle.',
  },
  'restaurant-reservation': {
    id: 'restaurant-reservation',
    title: 'Kaiseki Dinner Booking',
    description: 'VIP table for 6, dietary: 2 vegetarian, 1 gluten-free',
    status: 'pending',
    priority: 'medium',
    assignedTo: {
      name: 'Yuki Tanaka',
      title: 'Revenue Manager',
      avatar: '/avatars/revenue.jpg',
      agentId: 'revenue',
    },
    createdAt: '2025-12-10T09:00:00Z',
    dueDate: '2025-12-10T18:00:00Z',
    location: 'Restaurant - Private Dining Room',
    category: 'Dining',
    tags: ['kaiseki', 'vip', 'dietary-restrictions'],
    activity: [
      { id: 1, type: 'created', user: 'Guest Request', message: 'Task created from concierge request', timestamp: '2025-12-10T09:00:00Z' },
      { id: 2, type: 'assigned', user: 'System', message: 'Assigned to Yuki Tanaka', timestamp: '2025-12-10T09:00:00Z' },
    ],
    notes: 'Special occasion - 25th anniversary celebration. Request chef to prepare custom vegetarian kaiseki course.',
  },
  'onsen-maintenance': {
    id: 'onsen-maintenance',
    title: 'Private Onsen Inspection',
    description: 'Mountain View Suite - guest reported water temperature variance',
    status: 'in-progress',
    priority: 'urgent',
    assignedTo: {
      name: 'Mika Hayashi',
      title: 'Operations Manager',
      avatar: '/avatars/operations.jpg',
      agentId: 'operations',
    },
    createdAt: '2025-12-10T07:30:00Z',
    dueDate: '2025-12-10T12:00:00Z',
    location: 'Mountain View Suite',
    category: 'Maintenance',
    tags: ['onsen', 'temperature', 'urgent'],
    activity: [
      { id: 1, type: 'created', user: 'Guest Feedback', message: 'Task created from guest complaint', timestamp: '2025-12-10T07:30:00Z' },
      { id: 2, type: 'assigned', user: 'System', message: 'Urgent: Assigned to Mika Hayashi', timestamp: '2025-12-10T07:30:00Z' },
      { id: 3, type: 'status', user: 'Mika Hayashi', message: 'Status changed to In Progress', timestamp: '2025-12-10T08:00:00Z' },
      { id: 4, type: 'comment', user: 'Mika Hayashi', message: 'Technician dispatched to check thermostat and heating system.', timestamp: '2025-12-10T08:15:00Z' },
    ],
    notes: 'Guest currently in room. Coordinate with them before entering. Suite is booked through weekend.',
  },
  'ski-equipment': {
    id: 'ski-equipment',
    title: 'Ski Equipment Delivery',
    description: 'Premium rental setup for Room 205, 2 adults + 1 child',
    status: 'pending',
    priority: 'medium',
    assignedTo: {
      name: 'Kenji Sato',
      title: 'Guest Services Director',
      avatar: '/avatars/guests.jpg',
      agentId: 'guests',
    },
    createdAt: '2025-12-10T08:30:00Z',
    dueDate: '2025-12-10T15:00:00Z',
    location: 'Room 205',
    category: 'Activities',
    tags: ['ski', 'rental', 'equipment', 'family'],
    activity: [
      { id: 1, type: 'created', user: 'Guest Request', message: 'Task created from concierge request', timestamp: '2025-12-10T08:30:00Z' },
      { id: 2, type: 'assigned', user: 'System', message: 'Assigned to Kenji Sato', timestamp: '2025-12-10T08:30:00Z' },
    ],
    notes: 'Premium equipment package requested. Child is 10 years old, intermediate level. Parents are advanced skiers.',
  },
};

interface TaskData {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo: {
    name: string;
    title: string;
    avatar: string;
    agentId: string;
  };
  createdAt: string;
  dueDate: string;
  location: string;
  category: string;
  tags: string[];
  activity: Array<{
    id: number;
    type: 'created' | 'assigned' | 'comment' | 'status';
    user: string;
    message: string;
    timestamp: string;
  }>;
  notes: string;
}

export default function TaskDetailPage() {
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;
  const { language } = useLanguageStore();

  const [task, setTask] = useState<TaskData | null>(null);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Navigation menu items
  const menuItems = [
    { label: 'Register', href: '/register' },
    { label: 'Staff Portal', href: '/admin', active: true },
    { label: 'Shop', href: '/shop' },
  ];

  useEffect(() => {
    // In production, fetch from API
    const taskData = tasksData[taskId];
    if (taskData) {
      setTask(taskData);
    }
  }, [taskId]);

  useEffect(() => {
    if (isAuthenticated && task) {
      setMounted(true);
    }
  }, [isAuthenticated, task]);

  // Listen for voice assistant task updates
  useEffect(() => {
    const handleStatusUpdate = (event: CustomEvent<{ status: string }>) => {
      if (!task) return;
      const newStatus = event.detail.status as TaskData['status'];
      handleStatusChange(newStatus);
    };

    const handleNotesUpdate = (event: CustomEvent<{ notes: string; append?: boolean }>) => {
      if (!task) return;
      const { notes, append } = event.detail;
      setTask(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          notes: append ? `${prev.notes}\n${notes}` : notes
        };
      });
    };

    const handleAddComment = (event: CustomEvent<{ comment: string }>) => {
      if (!task) return;
      const newActivity = {
        id: task.activity.length + 1,
        type: 'comment' as const,
        user: 'AI Assistant',
        message: event.detail.comment,
        timestamp: new Date().toISOString(),
      };
      setTask(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          activity: [...prev.activity, newActivity]
        };
      });
    };

    window.addEventListener('task-update-status', handleStatusUpdate as EventListener);
    window.addEventListener('task-update-notes', handleNotesUpdate as EventListener);
    window.addEventListener('task-add-comment', handleAddComment as EventListener);

    return () => {
      window.removeEventListener('task-update-status', handleStatusUpdate as EventListener);
      window.removeEventListener('task-update-notes', handleNotesUpdate as EventListener);
      window.removeEventListener('task-add-comment', handleAddComment as EventListener);
    };
  }, [task]);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-white/50" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/50 mb-4">Task not found</p>
          <Link href="/admin" className="text-sm text-amber-400 hover:text-amber-300">
            Back to Staff Portal
          </Link>
        </div>
      </div>
    );
  }

  const statusColors = {
    'pending': 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    'in-progress': 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    'completed': 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    'blocked': 'bg-red-500/20 text-red-300 border border-red-500/30',
  };

  const priorityColors = {
    'low': 'text-white/50',
    'medium': 'text-amber-400',
    'high': 'text-orange-400',
    'urgent': 'text-red-400',
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleAddCommentManual = async () => {
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    const newActivity = {
      id: task.activity.length + 1,
      type: 'comment' as const,
      user: 'You',
      message: newComment,
      timestamp: new Date().toISOString(),
    };

    setTask({
      ...task,
      activity: [...task.activity, newActivity],
    });
    setNewComment('');
    setIsSubmitting(false);
  };

  const handleStatusChange = async (newStatus: TaskData['status']) => {
    // Simulate API call
    const statusActivity = {
      id: task.activity.length + 1,
      type: 'status' as const,
      user: 'You',
      message: `Status changed to ${newStatus.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
      timestamp: new Date().toISOString(),
    };

    setTask({
      ...task,
      status: newStatus,
      activity: [...task.activity, statusActivity],
    });
  };

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
            <span className="text-white/80">Task Details</span>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex gap-6 px-8 pb-6 min-h-0">
          {/* Left: Task Content */}
          <div className="flex-1 min-w-0 flex flex-col">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl flex-1 flex flex-col min-h-0 overflow-hidden">
              {/* Header */}
              <div className="p-6 flex-shrink-0 border-b border-white/10">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-3xl font-light text-white tracking-wide" style={{ fontFamily: 'var(--font-cormorant)' }}>
                    {task.title}
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[task.status]}`}>
                      {task.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                    <button className="p-2 text-white/40 hover:text-white/70 transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-white/40 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-white/70 leading-relaxed">
                  {task.description}
                </p>

                {/* Quick Actions */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleStatusChange('in-progress')}
                    className={`px-3 py-1.5 text-xs rounded-lg transition-colors border ${
                      task.status === 'in-progress'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                        : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    In Progress
                  </button>
                  <button
                    onClick={() => handleStatusChange('completed')}
                    className={`px-3 py-1.5 text-xs rounded-lg transition-colors border ${
                      task.status === 'completed'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    Complete
                  </button>
                  <button
                    onClick={() => handleStatusChange('blocked')}
                    className={`px-3 py-1.5 text-xs rounded-lg transition-colors border ${
                      task.status === 'blocked'
                        ? 'bg-red-500/20 text-red-300 border-red-500/30'
                        : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    Blocked
                  </button>
                </div>
              </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0">
                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Assigned To */}
                  <Link
                    href={`/agents/${task.assignedTo.agentId}`}
                    className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors group"
                  >
                    <p className="text-xs text-white/40 mb-2 flex items-center gap-1">
                      <User className="w-3 h-3" /> Assigned To
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-white/20">
                        <Image
                          src={task.assignedTo.avatar}
                          alt={task.assignedTo.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white group-hover:text-amber-200 transition-colors">
                          {task.assignedTo.name}
                        </p>
                        <p className="text-xs text-white/50">{task.assignedTo.title}</p>
                      </div>
                    </div>
                  </Link>

                  {/* Priority */}
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <p className="text-xs text-white/40 mb-2 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Priority
                    </p>
                    <p className={`text-sm font-medium capitalize ${priorityColors[task.priority]}`}>
                      {task.priority}
                    </p>
                  </div>

                  {/* Due Date */}
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <p className="text-xs text-white/40 mb-2 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Due Date
                    </p>
                    <p className="text-sm font-medium text-white">
                      {formatDate(task.dueDate)}
                    </p>
                  </div>

                  {/* Location */}
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <p className="text-xs text-white/40 mb-2 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Location
                    </p>
                    <p className="text-sm font-medium text-white">
                      {task.location}
                    </p>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <p className="text-xs text-white/40 mb-2 flex items-center gap-1">
                    <Tag className="w-3 h-3" /> Tags
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {task.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-white/10 text-white/70 text-xs rounded border border-white/10"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {task.notes && (
                  <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
                    <p className="text-xs text-amber-400 font-medium mb-1">Notes</p>
                    <p className="text-sm text-amber-200 whitespace-pre-wrap">{task.notes}</p>
                  </div>
                )}

                {/* Activity Log */}
                <div>
                  <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                    <History className="w-4 h-4 text-white/40" />
                    Activity
                  </h3>
                  <div className="space-y-4">
                    {task.activity.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                          {item.type === 'comment' ? (
                            <MessageSquare className="w-3.5 h-3.5 text-white/50" />
                          ) : item.type === 'status' ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-white/50" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-white/50" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium text-white">{item.user}</p>
                            <span className="text-xs text-white/40">{formatDate(item.timestamp)}</span>
                          </div>
                          <p className="text-sm text-white/60">{item.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add Comment */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-xs text-white/40 mb-3">Add a comment</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Type your update..."
                      className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddCommentManual()}
                    />
                    <button
                      onClick={handleAddCommentManual}
                      disabled={!newComment.trim() || isSubmitting}
                      className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-400 transition-colors disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Voice Chat */}
          <div className="w-[400px] flex-shrink-0 flex flex-col min-h-0">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl flex-1 overflow-hidden">
              <VoiceSessionChat
                agentId="task-assistant"
                sessionId={`task-${taskId}`}
                elevenLabsAgentId={process.env.NEXT_PUBLIC_ELEVENLABS_TASK_AGENT_ID}
                title="Yuki"
                subtitle="Task Assistant"
                avatar="/avatars/yuki-avatar.jpg"
                welcomeMessage={`Hi, I'm Yuki. Let me check what we're working on...`}
                suggestions={[
                  "Mark as complete",
                  "Add an update",
                  "Change status",
                  "Add a note"
                ]}
                contextData={{
                  taskData: {
                    id: task.id,
                    title: task.title,
                    description: task.description,
                    status: task.status,
                    priority: task.priority,
                    notes: task.notes,
                    location: task.location,
                    dueDate: task.dueDate,
                    assignedTo: task.assignedTo,
                    category: task.category,
                    tags: task.tags
                  }
                }}
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
