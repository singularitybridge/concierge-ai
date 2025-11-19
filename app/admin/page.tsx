import Link from 'next/link';
import { ArrowLeft, TrendingUp, Users, Wrench, Network, Cpu } from 'lucide-react';

const agents = [
  {
    id: 'revenue',
    name: 'Revenue Manager',
    description: 'Pricing optimization, occupancy analytics, and demand forecasting',
    icon: TrendingUp,
    color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  },
  {
    id: 'guests',
    name: 'Guest Services',
    description: 'Reservations, guest profiles, and special requests management',
    icon: Users,
    color: 'bg-blue-50 text-blue-600 border-blue-200',
  },
  {
    id: 'operations',
    name: 'Operations',
    description: 'Housekeeping, maintenance, and room status coordination',
    icon: Wrench,
    color: 'bg-amber-50 text-amber-600 border-amber-200',
  },
  {
    id: 'architect',
    name: 'Digital Architect',
    description: 'System health, code evolution, and platform orchestration',
    icon: Cpu,
    color: 'bg-violet-50 text-violet-600 border-violet-200',
  },
];

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-stone-100">
      {/* Header */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-light text-stone-800 tracking-wide" style={{ fontFamily: 'var(--font-cormorant)' }}>
                THE 1898 NISEKO
              </h1>
              <p className="text-xs text-stone-500 uppercase tracking-wider">Property Management</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-light text-stone-800 mb-2" style={{ fontFamily: 'var(--font-cormorant)' }}>
            Welcome back
          </h2>
          <p className="text-sm text-stone-500">
            Select an AI assistant to help manage your property
          </p>
        </div>

        {/* System Overview Link */}
        <Link
          href="/admin/system"
          className="flex items-center gap-4 p-5 bg-stone-800 text-white rounded-xl hover:bg-stone-700 transition-colors mb-6"
        >
          <div className="p-3 bg-stone-700 rounded-lg">
            <Network className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium">System Architecture</h3>
            <p className="text-xs text-stone-300 mt-0.5">
              View the agentic system design and architectural overview
            </p>
          </div>
          <div className="text-stone-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        {/* Agent Cards */}
        <div className="grid gap-4">
          {agents.map((agent) => (
            <Link
              key={agent.id}
              href={`/agents/${agent.id}`}
              className="flex items-center gap-4 p-5 bg-white rounded-xl border border-stone-200 hover:border-stone-300 hover:shadow-sm transition-all group"
            >
              <div className={`p-3 rounded-lg border ${agent.color}`}>
                <agent.icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-stone-800 group-hover:text-stone-900">
                  {agent.name}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  {agent.description}
                </p>
              </div>
              <div className="text-stone-300 group-hover:text-stone-400 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded-lg border border-stone-200">
            <p className="text-2xl font-light text-stone-800">6</p>
            <p className="text-xs text-stone-500">Total Suites</p>
          </div>
          <div className="p-4 bg-white rounded-lg border border-stone-200">
            <p className="text-2xl font-light text-emerald-600">83%</p>
            <p className="text-xs text-stone-500">Occupancy</p>
          </div>
          <div className="p-4 bg-white rounded-lg border border-stone-200">
            <p className="text-2xl font-light text-stone-800">12</p>
            <p className="text-xs text-stone-500">Pending Tasks</p>
          </div>
        </div>
      </div>
    </div>
  );
}
