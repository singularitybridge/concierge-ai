'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft, Clock, User, CheckCircle2, AlertCircle, Loader2,
  MessageSquare, Pencil, Trash2, Send, Calendar, MapPin,
  ChevronRight, Tag, History
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

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
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;

  const [task, setTask] = useState<TaskData | null>(null);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // In production, fetch from API
    const taskData = tasksData[taskId];
    if (taskData) {
      setTask(taskData);
    }
  }, [taskId]);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-stone-500 mb-4">Task not found</p>
          <Link href="/admin" className="text-sm text-stone-600 hover:text-stone-800">
            Back to Admin
          </Link>
        </div>
      </div>
    );
  }

  const statusColors = {
    'pending': 'bg-amber-100 text-amber-700',
    'in-progress': 'bg-blue-100 text-blue-700',
    'completed': 'bg-emerald-100 text-emerald-700',
    'blocked': 'bg-red-100 text-red-700',
  };

  const priorityColors = {
    'low': 'text-stone-500',
    'medium': 'text-amber-600',
    'high': 'text-orange-600',
    'urgent': 'text-red-600',
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleAddComment = async () => {
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

  const handleStatusChange = async (newStatus: string) => {
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
      status: newStatus as TaskData['status'],
      activity: [...task.activity, statusActivity],
    });
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-stone-100">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 text-stone-400 hover:text-stone-600 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <p className="text-xs text-stone-400 uppercase tracking-wider">Task Details</p>
            </div>
            <button className="p-2 text-stone-400 hover:text-stone-600 transition-colors">
              <Pencil className="w-4 h-4" />
            </button>
            <button className="p-2 text-stone-400 hover:text-red-500 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Task Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-2xl font-light text-stone-800" style={{ fontFamily: 'var(--font-cormorant)' }}>
              {task.title}
            </h1>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[task.status]}`}>
              {task.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
          </div>
          <p className="text-sm text-stone-600 leading-relaxed">
            {task.description}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => handleStatusChange('in-progress')}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
              task.status === 'in-progress'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-white text-stone-600 hover:bg-stone-50'
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => handleStatusChange('completed')}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
              task.status === 'completed'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-white text-stone-600 hover:bg-stone-50'
            }`}
          >
            Complete
          </button>
          <button
            onClick={() => handleStatusChange('blocked')}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
              task.status === 'blocked'
                ? 'bg-red-100 text-red-700'
                : 'bg-white text-stone-600 hover:bg-stone-50'
            }`}
          >
            Blocked
          </button>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {/* Assigned To */}
          <Link
            href={`/agents/${task.assignedTo.agentId}`}
            className="p-4 bg-white rounded-lg hover:bg-stone-50 transition-colors group"
          >
            <p className="text-xs text-stone-400 mb-2 flex items-center gap-1">
              <User className="w-3 h-3" /> Assigned To
            </p>
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8 rounded-full overflow-hidden">
                <Image
                  src={task.assignedTo.avatar}
                  alt={task.assignedTo.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-stone-800 group-hover:text-stone-900">
                  {task.assignedTo.name}
                </p>
                <p className="text-xs text-stone-500">{task.assignedTo.title}</p>
              </div>
            </div>
          </Link>

          {/* Priority */}
          <div className="p-4 bg-white rounded-lg">
            <p className="text-xs text-stone-400 mb-2 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Priority
            </p>
            <p className={`text-sm font-medium capitalize ${priorityColors[task.priority]}`}>
              {task.priority}
            </p>
          </div>

          {/* Due Date */}
          <div className="p-4 bg-white rounded-lg">
            <p className="text-xs text-stone-400 mb-2 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Due Date
            </p>
            <p className="text-sm font-medium text-stone-800">
              {formatDate(task.dueDate)}
            </p>
          </div>

          {/* Location */}
          <div className="p-4 bg-white rounded-lg">
            <p className="text-xs text-stone-400 mb-2 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Location
            </p>
            <p className="text-sm font-medium text-stone-800">
              {task.location}
            </p>
          </div>
        </div>

        {/* Tags */}
        <div className="mb-8">
          <p className="text-xs text-stone-400 mb-2 flex items-center gap-1">
            <Tag className="w-3 h-3" /> Tags
          </p>
          <div className="flex flex-wrap gap-2">
            {task.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-stone-100 text-stone-600 text-xs rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Notes */}
        {task.notes && (
          <div className="p-4 bg-amber-50 rounded-lg mb-8">
            <p className="text-xs text-amber-700 font-medium mb-1">Notes</p>
            <p className="text-sm text-amber-800">{task.notes}</p>
          </div>
        )}

        {/* Activity Log */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-stone-800 mb-4 flex items-center gap-2">
            <History className="w-4 h-4 text-stone-400" />
            Activity
          </h2>
          <div className="space-y-4">
            {task.activity.map((item) => (
              <div key={item.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center flex-shrink-0">
                  {item.type === 'comment' ? (
                    <MessageSquare className="w-3.5 h-3.5 text-stone-500" />
                  ) : item.type === 'status' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-stone-500" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-stone-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-stone-800">{item.user}</p>
                    <span className="text-xs text-stone-400">{formatDate(item.timestamp)}</span>
                  </div>
                  <p className="text-sm text-stone-600">{item.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add Comment */}
        <div className="bg-white rounded-lg p-4">
          <p className="text-xs text-stone-400 mb-3">Add a comment</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Type your update..."
              className="flex-1 px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300"
              onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
            />
            <button
              onClick={handleAddComment}
              disabled={!newComment.trim() || isSubmitting}
              className="px-4 py-2 bg-stone-800 text-white rounded-lg hover:bg-stone-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* AI Agent Link */}
        <Link
          href={`/agents/${task.assignedTo.agentId}`}
          className="mt-6 flex items-center gap-3 p-4 bg-stone-800 rounded-lg text-white hover:bg-stone-700 transition-colors"
        >
          <MessageSquare className="w-5 h-5 text-white/60" />
          <div className="flex-1">
            <p className="text-sm">Chat with {task.assignedTo.name}</p>
            <p className="text-xs text-white/60">Get AI assistance on this task</p>
          </div>
          <ChevronRight className="w-4 h-4 text-white/40" />
        </Link>
      </div>
    </div>
  );
}
