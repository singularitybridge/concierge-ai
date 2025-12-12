'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  CheckCircle2, Clock, AlertCircle, MapPin, Filter,
  ChevronRight, Camera, MessageSquare, User, Menu
} from 'lucide-react';

// Mock staff member data
const staffMember = {
  name: 'Yuki Nakamura',
  role: 'Housekeeping',
  avatar: '/avatars/00001.png',
  status: 'available', // available, busy, break, offline
};

// Mock tasks data
const tasks = [
  {
    id: 'room-301-clean',
    title: 'Deep Clean Suite 301',
    location: 'Sky Suite 301',
    priority: 'urgent',
    status: 'in-progress',
    dueTime: '14:00',
    category: 'housekeeping',
    description: 'Express turnover - VIP arriving 2PM',
  },
  {
    id: 'room-204-turndown',
    title: 'Evening Turndown Service',
    location: 'Garden Suite 204',
    priority: 'high',
    status: 'pending',
    dueTime: '18:00',
    category: 'housekeeping',
    description: 'Include welcome amenities',
  },
  {
    id: 'laundry-delivery',
    title: 'Deliver Pressed Linens',
    location: 'Room 402',
    priority: 'medium',
    status: 'pending',
    dueTime: '15:30',
    category: 'housekeeping',
    description: '4 sets of bed linens',
  },
  {
    id: 'minibar-restock',
    title: 'Minibar Restock',
    location: 'Mountain View Suite',
    priority: 'low',
    status: 'completed',
    dueTime: '12:00',
    category: 'housekeeping',
    description: 'Completed with photo verification',
  },
];

type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'blocked';
type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';

export default function StaffDashboard() {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const statusColors: Record<TaskStatus, string> = {
    'pending': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    'in-progress': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    'completed': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    'blocked': 'bg-red-500/20 text-red-300 border-red-500/30',
  };

  const priorityColors: Record<TaskPriority, string> = {
    'urgent': 'bg-red-500 text-white',
    'high': 'bg-orange-500 text-white',
    'medium': 'bg-amber-500 text-white',
    'low': 'bg-white/20 text-white/70',
  };

  const statusOptions = [
    { value: 'all', label: 'All', count: 4 },
    { value: 'urgent', label: 'Urgent', count: 1 },
    { value: 'today', label: 'Today', count: 3 },
    { value: 'mine', label: 'My Tasks', count: 4 },
  ];

  const filteredTasks = selectedStatus === 'all'
    ? tasks
    : selectedStatus === 'urgent'
    ? tasks.filter(t => t.priority === 'urgent')
    : tasks;

  const activeTasks = tasks.filter(t => t.status !== 'completed').length;
  const completedToday = tasks.filter(t => t.status === 'completed').length;

  return (
    <div className="min-h-screen bg-stone-900">
      {/* Mobile Header - Fixed */}
      <header className="sticky top-0 z-50 bg-stone-900/95 backdrop-blur-md border-b border-white/10">
        <div className="px-4 py-3">
          {/* Top Row: Avatar, Name, Menu */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-amber-500/30">
                <Image
                  src={staffMember.avatar}
                  alt={staffMember.name}
                  fill
                  className="object-cover"
                />
                {/* Status Indicator */}
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-stone-900" />
              </div>
              <div>
                <h1 className="text-base font-medium text-white">{staffMember.name}</h1>
                <p className="text-xs text-white/50">{staffMember.role}</p>
              </div>
            </div>
            <button className="p-2 text-white/70 hover:text-white active:bg-white/10 rounded-lg transition-colors">
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Status Selector */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-white/50">Status:</span>
            <select className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500/50">
              <option value="available">Available</option>
              <option value="busy">Busy</option>
              <option value="break">On Break</option>
            </select>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <p className="text-xs text-blue-300/70 mb-1">Active Tasks</p>
              <p className="text-2xl font-semibold text-blue-300">{activeTasks}</p>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
              <p className="text-xs text-emerald-300/70 mb-1">Completed Today</p>
              <p className="text-2xl font-semibold text-emerald-300">{completedToday}</p>
            </div>
          </div>
        </div>

        {/* Filter Chips - Horizontal Scroll */}
        <div className="overflow-x-auto px-4 pb-3 hide-scrollbar">
          <div className="flex gap-2 min-w-max">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedStatus(option.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  selectedStatus === option.value
                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {option.label} ({option.count})
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Task List - Scrollable */}
      <main className="px-4 py-4 pb-24">
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <Link
              key={task.id}
              href={`/staff/tasks/${task.id}`}
              className="block"
            >
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-4 active:bg-white/10 transition-all">
                {/* Header Row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 pr-3">
                    <div className="flex items-center gap-2 mb-1">
                      {/* Priority Dot */}
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        task.priority === 'urgent' ? 'bg-red-500' :
                        task.priority === 'high' ? 'bg-orange-500' :
                        task.priority === 'medium' ? 'bg-amber-500' :
                        'bg-white/30'
                      }`} />
                      <h3 className="text-base font-medium text-white truncate">
                        {task.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/50">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{task.location}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/30 flex-shrink-0" />
                </div>

                {/* Description */}
                <p className="text-sm text-white/60 mb-3 line-clamp-2">
                  {task.description}
                </p>

                {/* Footer Row */}
                <div className="flex items-center justify-between">
                  {/* Status Badge */}
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[task.status as TaskStatus]}`}>
                    {task.status === 'in-progress' ? 'In Progress' : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                  </span>

                  {/* Due Time */}
                  <div className="flex items-center gap-1 text-xs text-white/50">
                    <Clock className="w-3 h-3" />
                    <span>Due {task.dueTime}</span>
                  </div>
                </div>

                {/* Priority Badge (top-right corner) */}
                {(task.priority === 'urgent' || task.priority === 'high') && (
                  <div className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${priorityColors[task.priority as TaskPriority]}`}>
                    {task.priority}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </main>

      {/* Bottom Action Bar - Fixed */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-stone-900/95 backdrop-blur-md border-t border-white/10 px-4 py-3 safe-area-bottom">
        <div className="grid grid-cols-3 gap-2">
          <button className="flex flex-col items-center gap-1 py-3 px-4 bg-white/5 hover:bg-white/10 active:bg-white/15 rounded-xl transition-colors">
            <MessageSquare className="w-5 h-5 text-white/70" />
            <span className="text-[10px] text-white/50 font-medium">Message</span>
          </button>
          <button className="flex flex-col items-center gap-1 py-3 px-4 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 rounded-xl transition-colors shadow-lg shadow-amber-500/20">
            <Camera className="w-5 h-5 text-white" />
            <span className="text-[10px] text-white font-medium">Quick Photo</span>
          </button>
          <button className="flex flex-col items-center gap-1 py-3 px-4 bg-white/5 hover:bg-white/10 active:bg-white/15 rounded-xl transition-colors">
            <User className="w-5 h-5 text-white/70" />
            <span className="text-[10px] text-white/50 font-medium">Profile</span>
          </button>
        </div>
      </div>

      {/* Hide scrollbar for filter chips */}
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .safe-area-bottom {
          padding-bottom: max(0.75rem, env(safe-area-inset-bottom));
        }
      `}</style>
    </div>
  );
}
