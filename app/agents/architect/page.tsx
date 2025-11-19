'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Cpu, Activity, GitBranch, Shield, Zap, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import VoiceSessionChat from '../../components/VoiceSessionChat';

// System narrative data
const systemPulse = {
  uptime: '99.97%',
  lastEvolution: '2 hours ago',
  activeAgents: 4,
  requestsToday: 1247,
};

const recentEvolutions = [
  {
    action: 'Enhanced voice response latency',
    type: 'optimization',
    time: '2 hours ago',
    impact: 'Guest interactions now 40% faster'
  },
  {
    action: 'Resolved reservation sync anomaly',
    type: 'fix',
    time: '6 hours ago',
    impact: 'Data consistency restored across all agents'
  },
  {
    action: 'Deployed dynamic pricing algorithm v2.3',
    type: 'feature',
    time: '1 day ago',
    impact: 'Revenue optimization improved by 12%'
  },
  {
    action: 'Strengthened security protocols',
    type: 'security',
    time: '2 days ago',
    impact: 'Enhanced protection for guest data'
  },
];

const agentHealthStatus = [
  { name: 'Concierge AI', status: 'optimal', load: 23 },
  { name: 'Revenue Manager', status: 'optimal', load: 45 },
  { name: 'Guest Services', status: 'optimal', load: 31 },
  { name: 'Operations', status: 'learning', load: 67 },
];

export default function ArchitectAgentPage() {
  return (
    <div className="flex h-screen bg-stone-100">
      {/* Left: Digital Architect Dashboard */}
      <div className="flex-[2] min-w-0 overflow-hidden">
        <div className="flex flex-col h-full bg-white">
          {/* Hero Image */}
          <div className="relative h-72 flex-shrink-0">
            <Image
              src="/hotel4.jpg"
              alt="Digital Architect"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

            {/* Back Button */}
            <Link
              href="/admin"
              className="absolute top-4 left-4 p-2 bg-white/80 backdrop-blur-sm rounded-full text-stone-600 hover:bg-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            {/* Title Overlay */}
            <div className="absolute bottom-6 left-8 right-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-violet-500 rounded-lg">
                  <Cpu className="w-4 h-4 text-white" />
                </div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/80">The Silent Guardian</p>
              </div>
              <h1 className="text-3xl font-light text-white tracking-wide mb-2" style={{ fontFamily: 'var(--font-cormorant)' }}>
                Digital Architect
              </h1>
              <p className="text-sm text-white/70 max-w-lg">
                While guests experience seamless hospitality, an AI works tirelessly behind the scenes—
                evolving, optimizing, and ensuring every digital interaction is flawless.
              </p>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">

              {/* The Story */}
              <div className="p-5 bg-gradient-to-br from-violet-50 to-stone-50 rounded-xl border border-violet-100">
                <p className="text-sm text-stone-700 leading-relaxed">
                  <span className="font-medium text-violet-700">Every great hotel has a story.</span> Ours is written in code.
                  The Digital Architect is the AI that manages our AI—monitoring system health,
                  resolving issues before they surface, and continuously evolving our platform to
                  deliver exceptional experiences. It's the reason our other agents can focus entirely
                  on serving guests.
                </p>
              </div>

              {/* System Pulse */}
              <div>
                <h3 className="text-xs font-medium text-stone-500 mb-3 uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5" />
                  System Pulse
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  <div className="p-4 bg-stone-50 rounded-lg text-center">
                    <p className="text-2xl font-light text-emerald-600">{systemPulse.uptime}</p>
                    <p className="text-xs text-stone-500 mt-1">Uptime</p>
                  </div>
                  <div className="p-4 bg-stone-50 rounded-lg text-center">
                    <p className="text-2xl font-light text-violet-600">{systemPulse.activeAgents}</p>
                    <p className="text-xs text-stone-500 mt-1">Active Agents</p>
                  </div>
                  <div className="p-4 bg-stone-50 rounded-lg text-center">
                    <p className="text-2xl font-light text-stone-800">{systemPulse.requestsToday.toLocaleString()}</p>
                    <p className="text-xs text-stone-500 mt-1">Requests Today</p>
                  </div>
                  <div className="p-4 bg-stone-50 rounded-lg text-center">
                    <p className="text-sm font-light text-stone-800">{systemPulse.lastEvolution}</p>
                    <p className="text-xs text-stone-500 mt-1">Last Evolution</p>
                  </div>
                </div>
              </div>

              {/* Agent Orchestra */}
              <div>
                <h3 className="text-xs font-medium text-stone-500 mb-3 uppercase tracking-wider flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5" />
                  Agent Orchestra
                </h3>
                <div className="space-y-2">
                  {agentHealthStatus.map((agent) => (
                    <div key={agent.name} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          agent.status === 'optimal' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                        }`} />
                        <div>
                          <p className="text-sm font-medium text-stone-800">{agent.name}</p>
                          <p className="text-xs text-stone-500 capitalize">{agent.status}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              agent.load > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${agent.load}%` }}
                          />
                        </div>
                        <span className="text-xs text-stone-500 w-8">{agent.load}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Evolutions */}
              <div>
                <h3 className="text-xs font-medium text-stone-500 mb-3 uppercase tracking-wider flex items-center gap-2">
                  <GitBranch className="w-3.5 h-3.5" />
                  Recent Evolutions
                </h3>
                <div className="space-y-3">
                  {recentEvolutions.map((evolution, idx) => (
                    <div key={idx} className="p-4 bg-stone-50 rounded-lg border-l-2 border-violet-300">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {evolution.type === 'optimization' && <Zap className="w-3.5 h-3.5 text-amber-500" />}
                          {evolution.type === 'fix' && <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
                          {evolution.type === 'feature' && <GitBranch className="w-3.5 h-3.5 text-violet-500" />}
                          {evolution.type === 'security' && <Shield className="w-3.5 h-3.5 text-blue-500" />}
                          <p className="text-sm font-medium text-stone-800">{evolution.action}</p>
                        </div>
                        <span className="text-xs text-stone-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {evolution.time}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 ml-5">{evolution.impact}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Philosophy */}
              <div className="p-5 bg-stone-800 rounded-xl text-white">
                <p className="text-xs uppercase tracking-wider text-stone-400 mb-2">Our Philosophy</p>
                <p className="text-sm leading-relaxed text-stone-200">
                  "The best technology is invisible. Guests should never think about the systems
                  that serve them—they should simply enjoy flawless experiences. That's what I
                  ensure, every moment of every day."
                </p>
                <p className="text-xs text-violet-400 mt-3">— Digital Architect</p>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Right: Voice Chat */}
      <div className="flex-[1] min-w-0 p-6">
        <VoiceSessionChat agentId="digital-architect" sessionId="architect" />
      </div>
    </div>
  );
}
