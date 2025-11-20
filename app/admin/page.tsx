'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, TrendingUp, Users, Wrench, Network, Cpu, ChevronRight, Plus, X, Loader2, LogOut } from 'lucide-react';
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
    id: 'revenue',
    name: 'Yuki Tanaka',
    title: 'Revenue Manager',
    description: 'Pricing optimization, occupancy analytics, and demand forecasting',
    icon: TrendingUp,
    avatar: '/avatars/revenue.jpg',
  },
  {
    id: 'guests',
    name: 'Kenji Sato',
    title: 'Guest Services Director',
    description: 'Reservations, guest profiles, and special requests management',
    icon: Users,
    avatar: '/avatars/guests.jpg',
  },
  {
    id: 'operations',
    name: 'Mika Hayashi',
    title: 'Operations Manager',
    description: 'Housekeeping, maintenance, and room status coordination',
    icon: Wrench,
    avatar: '/avatars/operations.jpg',
  },
  {
    id: 'architect',
    name: 'Aiko',
    title: 'Digital Architect',
    description: 'System health, code evolution, and platform orchestration',
    icon: Cpu,
    avatar: '/avatars/architect.jpg',
  },
];

const agentAssignments = [
  { name: 'Yuki Tanaka', title: 'Revenue Manager', keywords: ['price', 'revenue', 'rate', 'booking', 'forecast', 'occupancy'] },
  { name: 'Kenji Sato', title: 'Guest Services Director', keywords: ['guest', 'reservation', 'arrival', 'request', 'vip', 'welcome'] },
  { name: 'Mika Hayashi', title: 'Operations Manager', keywords: ['maintenance', 'housekeeping', 'clean', 'repair', 'room', 'inventory'] },
  { name: 'Aiko', title: 'Digital Architect', keywords: ['system', 'error', 'bug', 'performance', 'update', 'deploy'] },
];

export default function AdminPage() {
  const { isAuthenticated, logout } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [taskInput, setTaskInput] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignedAgent, setAssignedAgent] = useState<{ name: string; title: string } | null>(null);

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

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-stone-100">
        <div className="max-w-3xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="p-2 text-stone-400 hover:text-stone-600 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-light text-stone-800 tracking-wide" style={{ fontFamily: 'var(--font-cormorant)' }}>
                  THE 1898 NISEKO
                </h1>
                <p className="text-xs text-stone-400 uppercase tracking-widest mt-1">Property Management</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2 text-stone-400 hover:text-stone-600 rounded-full transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Active Tasks */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-3xl font-light text-stone-800" style={{ fontFamily: 'var(--font-cormorant)' }}>
              Active Tasks
            </h2>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-stone-600 hover:text-stone-800 bg-white rounded-full hover:bg-stone-50 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Task
            </button>
          </div>
          <p className="text-sm text-stone-500 mb-6">
            Current priorities being handled by your team
          </p>
          <div className="space-y-2">
            {tasks.map((task) => (
              <Link
                key={task.id}
                href={`/tasks/${task.id}`}
                className="flex items-center justify-between p-4 bg-white rounded-lg hover:bg-stone-50 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-stone-800 group-hover:text-stone-900">
                    {task.title}
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {task.description}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <span className="text-xs text-stone-500">{task.assignedTo}</span>
                  <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-stone-400" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Your Team */}
        <div className="mb-10">
          <h2 className="text-3xl font-light text-stone-800 mb-3" style={{ fontFamily: 'var(--font-cormorant)' }}>
            Your Team
          </h2>
          <p className="text-sm text-stone-500">
            AI assistants dedicated to managing your property
          </p>
        </div>

        {/* Agent Cards */}
        <div className="space-y-3 mb-10">
          {agents.map((agent) => (
            <Link
              key={agent.id}
              href={`/agents/${agent.id}`}
              className="flex items-center gap-4 p-4 bg-white rounded-lg hover:bg-stone-50 transition-colors group"
            >
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-stone-200 flex-shrink-0">
                <Image
                  src={agent.avatar}
                  alt={agent.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-stone-800 group-hover:text-stone-900">
                  {agent.name}
                </h3>
                <p className="text-xs text-stone-500">
                  {agent.title}
                </p>
                <p className="text-xs text-stone-400 mt-1 truncate">
                  {agent.description}
                </p>
              </div>
              <svg className="w-4 h-4 text-stone-300 group-hover:text-stone-400 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>

        {/* Knowledge Base */}
        <div className="mb-4">
          <h2 className="text-3xl font-light text-stone-800 mb-3" style={{ fontFamily: 'var(--font-cormorant)' }}>
            Knowledge Base
          </h2>
        </div>

        {/* System Architecture Link */}
        <Link
          href="/admin/system"
          className="flex items-center gap-4 p-4 bg-white rounded-lg hover:bg-stone-50 transition-colors group"
        >
          <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center flex-shrink-0">
            <Network className="w-5 h-5 text-stone-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-stone-700 group-hover:text-stone-900">
              System Architecture
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              View the agentic system design and architectural overview
            </p>
          </div>
          <svg className="w-4 h-4 text-stone-300 group-hover:text-stone-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-3xl font-light text-stone-700">6</p>
            <p className="text-xs text-stone-400 mt-1">Total Suites</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-light text-stone-700">83%</p>
            <p className="text-xs text-stone-400 mt-1">Occupancy</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-light text-stone-700">12</p>
            <p className="text-xs text-stone-400 mt-1">Pending Tasks</p>
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 relative">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-600"
            >
              <X className="w-5 h-5" />
            </button>

            {!assignedAgent ? (
              <>
                <h3 className="text-xl font-light text-stone-800 mb-2" style={{ fontFamily: 'var(--font-cormorant)' }}>
                  How can we help you today?
                </h3>
                <p className="text-sm text-stone-500 mb-6">
                  Describe what you need and we'll assign the right team member
                </p>

                <textarea
                  value={taskInput}
                  onChange={(e) => setTaskInput(e.target.value)}
                  placeholder="e.g., Check room rates for next weekend..."
                  className="w-full p-3 border border-stone-200 rounded-lg text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300 resize-none h-24 mb-4"
                  disabled={isAssigning}
                />

                <button
                  onClick={handleSubmitTask}
                  disabled={!taskInput.trim() || isAssigning}
                  className="w-full py-2.5 bg-stone-800 text-white text-sm rounded-lg hover:bg-stone-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isAssigning ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Finding the right person...
                    </>
                  ) : (
                    'Submit'
                  )}
                </button>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-stone-800 mb-1">
                  Task Assigned
                </h3>
                <p className="text-sm text-stone-500 mb-4">
                  We've assigned this to
                </p>
                <div className="p-4 bg-stone-50 rounded-lg mb-6">
                  <p className="font-medium text-stone-800">{assignedAgent.name}</p>
                  <p className="text-xs text-stone-500">{assignedAgent.title}</p>
                </div>
                <button
                  onClick={closeModal}
                  className="px-6 py-2 text-sm text-stone-600 hover:text-stone-800 transition-colors"
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
