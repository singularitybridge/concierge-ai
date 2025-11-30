'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { TrendingUp, Users, Wrench, Network, Cpu, Plus, X, Loader2, LogOut, BookOpen, Shield, Sparkles, ClipboardList } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const tasks = [
  {
    id: 'pricing-review',
    title: 'Review Dynamic Pricing',
    description: 'Analyze weekend rates for ski season peak',
    assignedTo: 'Yuki Tanaka',
    agent: 'revenue',
  },
  {
    id: 'vip-arrival',
    title: 'VIP Guest Arrival',
    description: 'Prepare welcome package for Tanaka Family',
    assignedTo: 'Kenji Sato',
    agent: 'guests',
  },
  {
    id: 'maintenance-check',
    title: 'Onsen Temperature Check',
    description: 'Resolve Valley Suite heating fluctuation',
    assignedTo: 'Mika Hayashi',
    agent: 'operations',
  },
];

const agents = [
  {
    id: 'guests',
    name: 'Kenji Sato',
    title: 'Guest Services Director',
    description: 'Reservations, guest profiles, and special requests management',
    icon: Users,
    avatar: '/avatars/guests.jpg',
    disabled: false,
  },
  {
    id: 'revenue',
    name: 'Yuki Tanaka',
    title: 'Revenue Manager',
    description: 'Pricing optimization, occupancy analytics, and demand forecasting',
    icon: TrendingUp,
    avatar: '/avatars/revenue.jpg',
    disabled: true,
  },
  {
    id: 'operations',
    name: 'Mika Hayashi',
    title: 'Operations Manager',
    description: 'Housekeeping, maintenance, and room status coordination',
    icon: Wrench,
    avatar: '/avatars/operations.jpg',
    disabled: true,
  },
  {
    id: 'architect',
    name: 'Aiko',
    title: 'Digital Architect',
    description: 'System health, code evolution, and platform orchestration',
    icon: Cpu,
    avatar: '/avatars/architect.jpg',
    disabled: true,
  },
];

const agentAssignments = [
  { name: 'Yuki Tanaka', title: 'Revenue Manager', keywords: ['price', 'revenue', 'rate', 'booking', 'forecast', 'occupancy'] },
  { name: 'Kenji Sato', title: 'Guest Services Director', keywords: ['guest', 'reservation', 'arrival', 'request', 'vip', 'welcome'] },
  { name: 'Mika Hayashi', title: 'Operations Manager', keywords: ['maintenance', 'housekeeping', 'clean', 'repair', 'room', 'inventory'] },
  { name: 'Aiko', title: 'Digital Architect', keywords: ['system', 'error', 'bug', 'performance', 'update', 'deploy'] },
];

const knowledgeBaseDocs = [
  {
    id: 'guest-experience',
    title: 'Guest Experience Standards',
    description: 'VIP protocols, complaint resolution, and service recovery procedures',
    icon: Sparkles,
  },
  {
    id: 'emergency-procedures',
    title: 'Emergency Procedures',
    description: 'Fire safety, medical emergencies, and avalanche protocols',
    icon: Shield,
  },
  {
    id: 'housekeeping-manual',
    title: 'Housekeeping Operations',
    description: 'Room cleaning standards, turndown service, and amenity guidelines',
    icon: ClipboardList,
  },
  {
    id: 'concierge-guide',
    title: 'Concierge Service Guide',
    description: 'Local recommendations, transportation, and activity bookings',
    icon: BookOpen,
  },
];

export default function AdminPage() {
  const { isAuthenticated, logout } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [taskInput, setTaskInput] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignedAgent, setAssignedAgent] = useState<{ name: string; title: string } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      setMounted(true);
    }
  }, [isAuthenticated]);

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

  const handleSubmitTask = async () => {
    if (!taskInput.trim()) return;

    setIsAssigning(true);

    // Simulate AI thinking
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock assignment based on keywords
    const input = taskInput.toLowerCase();
    let assigned = agentAssignments[0]; // Default to Yuki

    for (const agent of agentAssignments) {
      if (agent.keywords.some(keyword => input.includes(keyword))) {
        assigned = agent;
        break;
      }
    }

    setAssignedAgent(assigned);
    setIsAssigning(false);
  };

  const closeModal = () => {
    setShowModal(false);
    setTaskInput('');
    setAssignedAgent(null);
    setIsAssigning(false);
  };

  // Navigation menu items
  const menuItems = [
    { label: 'Grand Opening', href: '/experience' },
    { label: 'Guest Portal', href: '/guest' },
    { label: 'Staff Portal', href: '/admin', active: true },
    { label: 'Shop', href: '/shop' },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
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

        {/* Main Content */}
        <div className="flex-1 flex gap-6 px-8 pb-6 min-h-0">
          {/* Main Card - Full Height */}
          <div className="flex-1 min-w-0 flex flex-col">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl flex-1 flex flex-col min-h-0">
              {/* Title Header - Sticky */}
              <div className="mb-6 flex-shrink-0">
                <h2
                  className="text-4xl font-light text-white tracking-wide"
                  style={{ fontFamily: 'var(--font-cormorant)' }}
                >
                  Staff Portal
                </h2>
                <p className="text-base text-white/50 mt-2">Property Management System</p>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto min-h-0 pr-2">
              {/* Two Column Layout */}
              <div className="grid md:grid-cols-2 gap-6">

              {/* Left Column - Team & Tasks */}
              <div className="space-y-6">

                {/* Your Team Card */}
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h2
                      className="text-xl font-light text-white tracking-wide"
                      style={{ fontFamily: 'var(--font-cormorant)' }}
                    >
                      Your AI Team
                    </h2>
                    <span className="text-xs text-amber-400/80">{agents.length} agents</span>
                  </div>

                  <div className="space-y-2">
                    {agents.map((agent) => (
                      agent.disabled ? (
                        <div
                          key={agent.id}
                          className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl opacity-60 cursor-not-allowed"
                        >
                          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white/10 flex-shrink-0 ring-2 ring-white/10">
                            <Image
                              src={agent.avatar}
                              alt={agent.name}
                              fill
                              className="object-cover opacity-70"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white/50">
                              {agent.name}
                            </p>
                            <p className="text-xs text-white/30 truncate">
                              {agent.title}
                            </p>
                          </div>
                          <span className="text-[10px] text-white/40 bg-white/5 px-2 py-0.5 rounded-full">
                            Coming Soon
                          </span>
                        </div>
                      ) : (
                        <Link
                          key={agent.id}
                          href={`/agents/${agent.id}`}
                          className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/30 rounded-xl transition-all group"
                        >
                          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white/10 flex-shrink-0 ring-2 ring-white/10 group-hover:ring-amber-400/30 transition-all">
                            <Image
                              src={agent.avatar}
                              alt={agent.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white group-hover:text-amber-100 transition-colors">
                              {agent.name}
                            </p>
                            <p className="text-xs text-white/50 truncate">
                              {agent.title}
                            </p>
                          </div>
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-amber-400/20 transition-colors">
                            <svg className="w-3 h-3 text-white/40 group-hover:text-amber-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </Link>
                      )
                    ))}
                  </div>
                </div>

                {/* Active Tasks Card */}
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h2
                      className="text-xl font-light text-white tracking-wide"
                      style={{ fontFamily: 'var(--font-cormorant)' }}
                    >
                      Active Tasks
                    </h2>
                    <button
                      onClick={() => setShowModal(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-amber-400 hover:text-amber-300 bg-amber-400/10 hover:bg-amber-400/20 rounded-full transition-colors border border-amber-400/20"
                    >
                      <Plus className="w-3 h-3" />
                      Add
                    </button>
                  </div>

                  <div className="space-y-2">
                    {tasks.map((task) => (
                      <Link
                        key={task.id}
                        href={`/tasks/${task.id}`}
                        className="block p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/30 rounded-xl transition-all group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white group-hover:text-amber-100 transition-colors">
                              {task.title}
                            </p>
                            <p className="text-xs text-white/40 mt-0.5">
                              {task.description}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-xs text-amber-400/70 bg-amber-400/10 px-2 py-0.5 rounded-full">
                            {task.assignedTo}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Knowledge Base & Stats */}
              <div className="space-y-6">

                {/* Knowledge Base Card */}
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h2
                      className="text-xl font-light text-white tracking-wide"
                      style={{ fontFamily: 'var(--font-cormorant)' }}
                    >
                      Knowledge Base
                    </h2>
                    <span className="text-xs text-amber-400/80">{knowledgeBaseDocs.length + 1} docs</span>
                  </div>

                  <div className="space-y-2">
                    {knowledgeBaseDocs.map((doc) => (
                      <Link
                        key={doc.id}
                        href={`/docs/${doc.id}`}
                        className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/30 rounded-xl transition-all group"
                      >
                        <doc.icon className="flex-shrink-0 w-5 h-5 text-amber-400/70 group-hover:text-amber-400 transition-colors" strokeWidth={1.5} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white group-hover:text-amber-100 transition-colors">
                            {doc.title}
                          </p>
                          <p className="text-xs text-white/40 truncate">
                            {doc.description}
                          </p>
                        </div>
                      </Link>
                    ))}

                    {/* System Architecture Link */}
                    <Link
                      href="/admin/system"
                      className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/30 rounded-xl transition-all group"
                    >
                      <Network className="flex-shrink-0 w-5 h-5 text-amber-400/70 group-hover:text-amber-400 transition-colors" strokeWidth={1.5} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white group-hover:text-amber-100 transition-colors">
                          System Architecture
                        </p>
                        <p className="text-xs text-white/40 truncate">
                          Agentic system design overview
                        </p>
                      </div>
                    </Link>
                  </div>
                </div>

                {/* Property Stats Card */}
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <h2
                    className="text-xl font-light text-white tracking-wide mb-4"
                    style={{ fontFamily: 'var(--font-cormorant)' }}
                  >
                    Property Overview
                  </h2>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-2xl font-light text-amber-400">6</p>
                      <p className="text-xs text-white/50 mt-1">Suites</p>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-2xl font-light text-amber-400">83%</p>
                      <p className="text-xs text-white/50 mt-1">Occupancy</p>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-2xl font-light text-amber-400">12</p>
                      <p className="text-xs text-white/50 mt-1">Tasks</p>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-xs text-white/40 mb-3">Quick Actions</p>
                    <div className="flex gap-2">
                      <button className="flex-1 px-3 py-2 text-xs text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10">
                        View Reports
                      </button>
                      <button className="flex-1 px-3 py-2 text-xs text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10">
                        Analytics
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              </div>{/* End two column grid */}
              </div>{/* End scrollable content */}
            </div>
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-stone-900/95 backdrop-blur-xl rounded-2xl max-w-md w-full p-6 relative border border-white/20 shadow-2xl">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 text-white/40 hover:text-white/60 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {!assignedAgent ? (
              <>
                <h3
                  className="text-2xl font-light text-white mb-2"
                  style={{ fontFamily: 'var(--font-cormorant)' }}
                >
                  How can we help?
                </h3>
                <p className="text-sm text-white/50 mb-6">
                  Describe what you need and we'll assign the right team member
                </p>

                <textarea
                  value={taskInput}
                  onChange={(e) => setTaskInput(e.target.value)}
                  placeholder="e.g., Check room rates for next weekend..."
                  className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 resize-none h-28 mb-4"
                  disabled={isAssigning}
                />

                <button
                  onClick={handleSubmitTask}
                  disabled={!taskInput.trim() || isAssigning}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm font-medium rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                >
                  {isAssigning ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Finding the right person...
                    </>
                  ) : (
                    'Submit Task'
                  )}
                </button>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                  <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3
                  className="text-xl font-light text-white mb-1"
                  style={{ fontFamily: 'var(--font-cormorant)' }}
                >
                  Task Assigned
                </h3>
                <p className="text-sm text-white/50 mb-4">
                  We've assigned this to
                </p>
                <div className="p-4 bg-white/5 rounded-xl mb-6 border border-white/10">
                  <p className="font-medium text-amber-400">{assignedAgent.name}</p>
                  <p className="text-xs text-white/50">{assignedAgent.title}</p>
                </div>
                <button
                  onClick={closeModal}
                  className="px-6 py-2.5 text-sm text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/10"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
