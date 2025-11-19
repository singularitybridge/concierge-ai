'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Wrench, Bed, Sparkles, AlertTriangle, CheckCircle } from 'lucide-react';
import VoiceSessionChat from '../../components/VoiceSessionChat';

// Mock room status data
const roomStatus = [
  { name: 'Mountain Suite', status: 'Occupied', clean: true, maintenance: false },
  { name: 'Garden Suite', status: 'Occupied', clean: true, maintenance: false },
  { name: 'Onsen Suite', status: 'Checkout', clean: false, maintenance: false },
  { name: 'Valley Suite', status: 'Occupied', clean: true, maintenance: true },
  { name: 'Sky Suite', status: 'Arrival', clean: true, maintenance: false },
  { name: 'Forest Suite', status: 'Occupied', clean: true, maintenance: false },
];

const housekeepingTasks = [
  { room: 'Onsen Suite', task: 'Full turnover', priority: 'High', assignee: 'Yuki', time: '13:00' },
  { room: 'Sky Suite', task: 'Pre-arrival inspection', priority: 'High', assignee: 'Hana', time: '14:00' },
  { room: 'Mountain Suite', task: 'Refresh service', priority: 'Normal', assignee: 'Yuki', time: '15:00' },
];

const maintenanceRequests = [
  { room: 'Valley Suite', issue: 'Onsen temperature fluctuation', status: 'In Progress', reported: '2 hours ago' },
  { room: 'Common Area', issue: 'Lobby fireplace maintenance', status: 'Scheduled', reported: '1 day ago' },
];

const inventory = [
  { item: 'Bath towels', stock: 48, min: 36, status: 'OK' },
  { item: 'Yukata robes', stock: 18, min: 12, status: 'OK' },
  { item: 'Shampoo sets', stock: 8, min: 12, status: 'Low' },
  { item: 'Welcome tea', stock: 24, min: 18, status: 'OK' },
];

export default function OperationsAgentPage() {
  return (
    <div className="flex h-screen bg-stone-100">
      {/* Left: Operations Dashboard */}
      <div className="flex-[2] min-w-0 overflow-hidden">
        <div className="flex flex-col h-full bg-white">
          {/* Hero Image */}
          <div className="relative h-64 flex-shrink-0">
            <Image
              src="/hotel1.jpg"
              alt="Operations"
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
            <div className="absolute bottom-6 left-8 right-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-amber-500 rounded-lg">
                  <Wrench className="w-4 h-4 text-white" />
                </div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/80">Operations</p>
              </div>
              <h1 className="text-2xl font-light text-white tracking-wide" style={{ fontFamily: 'var(--font-cormorant)' }}>
                Housekeeping & Maintenance
              </h1>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Room Status Grid */}
            <div>
              <h3 className="text-xs font-medium text-stone-500 mb-3 uppercase tracking-wider">Room Status</h3>
              <div className="grid grid-cols-3 gap-3">
                {roomStatus.map((room) => (
                  <div key={room.name} className={`p-3 rounded-lg border ${
                    room.status === 'Checkout' ? 'bg-amber-50 border-amber-200' :
                    room.status === 'Arrival' ? 'bg-blue-50 border-blue-200' :
                    'bg-stone-50 border-stone-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-stone-800">{room.name}</p>
                      {room.maintenance && (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        room.status === 'Occupied' ? 'bg-stone-200 text-stone-700' :
                        room.status === 'Checkout' ? 'bg-amber-200 text-amber-800' :
                        'bg-blue-200 text-blue-800'
                      }`}>
                        {room.status}
                      </span>
                      {room.clean ? (
                        <Sparkles className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Bed className="w-3 h-3 text-amber-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Housekeeping Tasks */}
            <div>
              <h3 className="text-xs font-medium text-stone-500 mb-3 uppercase tracking-wider">Housekeeping Queue</h3>
              <div className="space-y-2">
                {housekeepingTasks.map((task, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        task.priority === 'High' ? 'bg-red-500' : 'bg-stone-300'
                      }`} />
                      <div>
                        <p className="text-sm font-medium text-stone-800">{task.room}</p>
                        <p className="text-xs text-stone-500">{task.task}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-stone-600">{task.assignee}</p>
                      <p className="text-xs text-stone-400">{task.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Maintenance */}
            <div>
              <h3 className="text-xs font-medium text-stone-500 mb-3 uppercase tracking-wider">Maintenance Requests</h3>
              <div className="space-y-2">
                {maintenanceRequests.map((req, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Wrench className="w-4 h-4 text-stone-400" />
                      <div>
                        <p className="text-sm font-medium text-stone-800">{req.issue}</p>
                        <p className="text-xs text-stone-500">{req.room} • {req.reported}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      req.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                      'bg-stone-100 text-stone-600'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Inventory */}
            <div>
              <h3 className="text-xs font-medium text-stone-500 mb-3 uppercase tracking-wider">Inventory Alerts</h3>
              <div className="grid grid-cols-2 gap-3">
                {inventory.map((item) => (
                  <div key={item.item} className={`p-3 rounded-lg border ${
                    item.status === 'Low' ? 'bg-red-50 border-red-200' : 'bg-stone-50 border-stone-200'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm text-stone-800">{item.item}</p>
                      {item.status === 'OK' ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                      )}
                    </div>
                    <p className="text-xs text-stone-500">
                      {item.stock} / {item.min} min
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* Right: Voice Chat */}
      <div className="flex-[1] min-w-0 p-6">
        <VoiceSessionChat agentId="operations" sessionId="operations" />
      </div>
    </div>
  );
}
