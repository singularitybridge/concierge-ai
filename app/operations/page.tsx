'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  LayoutDashboard,
  BedDouble,
  Sparkles,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  Bot,
  AlertTriangle,
  CheckCircle2,
  CircleDot,
  ChevronRight,
  LogOut,
  Filter,
  RefreshCw,
  Zap,
  DollarSign,
  Star,
  ArrowUpRight,
  Wrench,
  Coffee,
  UserCheck,
  Send,
  MoreHorizontal,
  Home,
  PanelRightClose,
  PanelRightOpen,
  Mic,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import VoiceSessionChat from '../components/VoiceSessionChat';
import Tooltip, { HotelTerms } from '../components/Tooltip';
import {
  useOperationsDashboardStore,
  RoomStatus,
  RoomType,
  RequestPriority,
  AgentType,
  ROOM_STATUS_LABELS,
  ALL_ROOM_STATUSES,
  ROOM_TYPE_LABELS,
  ALL_ROOM_TYPES,
} from '../store/operationsDashboardStore';

export default function OperationsDashboard() {
  const { isAuthenticated, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [aiQueryInput, setAiQueryInput] = useState('');
  const [aiPanelVisible, setAiPanelVisible] = useState(true); // AI assistant visible by default

  const {
    rooms,
    requests,
    agentActivities,
    metrics,
    housekeepingStaff,
    selectedRoom,
    filterStatus,
    filterFloor,
    filterType,
    setSelectedRoom,
    setFilterStatus,
    setFilterFloor,
    setFilterType,
    refreshData,
  } = useOperationsDashboardStore();

  // Navigation menu items
  const menuItems = [
    { label: 'Operations', href: '/operations', active: true },
    { label: 'Front Office', href: '/front-office' },
    { label: 'Revenue BI', href: '/revenue-intelligence' },
    { label: 'Employees', href: '/employee-management' },
    { label: 'Marketplace', href: '/marketplace' },
  ];

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter rooms
  const filteredRooms = rooms.filter(room => {
    if (filterStatus !== 'all' && room.status !== filterStatus) return false;
    if (filterFloor !== 'all' && room.floor !== filterFloor) return false;
    if (filterType !== 'all' && room.type !== filterType) return false;
    return true;
  });

  // Room status counts
  const statusCounts: Record<RoomStatus, number> = {
    clean: rooms.filter(r => r.status === 'clean').length,
    dirty: rooms.filter(r => r.status === 'dirty').length,
    in_progress: rooms.filter(r => r.status === 'in_progress').length,
    inspecting: rooms.filter(r => r.status === 'inspecting').length,
    occupied: rooms.filter(r => r.status === 'occupied').length,
    checkout: rooms.filter(r => r.status === 'checkout').length,
    maintenance: rooms.filter(r => r.status === 'maintenance').length,
    out_of_order: rooms.filter(r => r.status === 'out_of_order').length,
  };

  // Total rooms count
  const totalRooms = rooms.length;

  // Pending requests
  const pendingRequests = requests.filter(r => r.status === 'pending' || r.status === 'in_progress');

  const getStatusColor = (status: RoomStatus) => {
    switch (status) {
      case 'clean': return 'bg-emerald-500';
      case 'dirty': return 'bg-red-500';
      case 'in_progress': return 'bg-amber-500';
      case 'inspecting': return 'bg-blue-500';
      case 'occupied': return 'bg-purple-500';
      case 'checkout': return 'bg-orange-500';
      case 'maintenance': return 'bg-gray-500';
      case 'out_of_order': return 'bg-rose-700';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBgColor = (status: RoomStatus) => {
    switch (status) {
      case 'clean': return 'bg-emerald-500/20 border-emerald-500/30';
      case 'dirty': return 'bg-red-500/20 border-red-500/30';
      case 'in_progress': return 'bg-amber-500/20 border-amber-500/30';
      case 'inspecting': return 'bg-blue-500/20 border-blue-500/30';
      case 'occupied': return 'bg-purple-500/20 border-purple-500/30';
      case 'checkout': return 'bg-orange-500/20 border-orange-500/30';
      case 'maintenance': return 'bg-gray-500/20 border-gray-500/30';
      case 'out_of_order': return 'bg-rose-700/20 border-rose-700/30';
      default: return 'bg-gray-500/20 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority: RequestPriority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'low': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    }
  };

  const getAgentColor = (type: AgentType) => {
    switch (type) {
      case 'guest': return 'bg-blue-500/20 text-blue-400';
      case 'operations': return 'bg-amber-500/20 text-amber-400';
      case 'revenue': return 'bg-emerald-500/20 text-emerald-400';
      case 'architect': return 'bg-purple-500/20 text-purple-400';
    }
  };

  const getAgentIcon = (type: AgentType) => {
    switch (type) {
      case 'guest': return MessageSquare;
      case 'operations': return Wrench;
      case 'revenue': return DollarSign;
      case 'architect': return Bot;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const formatCurrency = (value: number) => {
    return `¥${value.toLocaleString()}`;
  };

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

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-stone-900/70" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

      {/* Content */}
      <div className={`relative z-10 h-screen flex flex-col transition-opacity duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>

        {/* Top Navigation Bar */}
        <nav className="flex items-center justify-between px-6 py-3 flex-shrink-0 border-b border-white/10 bg-black/20 backdrop-blur-xl">
          {/* Left - Breadcrumbs & Logo */}
          <div className="flex items-center gap-4">
            {/* Home Button */}
            <Link
              href="/"
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition-all group"
              title="Back to Main Menu"
            >
              <Home className="w-5 h-5 text-white/70 group-hover:text-amber-400 transition-colors" />
            </Link>

            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm">
              <Link href="/" className="text-white/50 hover:text-white transition-colors">Home</Link>
              <ChevronRight className="w-4 h-4 text-white/30" />
              <span className="text-amber-400 font-medium">Operations Dashboard</span>
            </div>
          </div>

          {/* Center - Menu Items */}
          <div className="flex items-center gap-1 bg-white/5 backdrop-blur-md rounded-full px-2 py-1 border border-white/10">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`px-4 py-1.5 rounded-full text-sm transition-all ${
                  item.active
                    ? 'bg-amber-500/20 text-amber-300 font-medium'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right - AI Toggle, Time & Logout */}
          <div className="flex items-center gap-3">
            {/* AI Assistant Toggle */}
            <button
              onClick={() => setAiPanelVisible(!aiPanelVisible)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
                aiPanelVisible
                  ? 'bg-purple-500/20 border-purple-500/30 text-purple-300'
                  : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10'
              }`}
              title={aiPanelVisible ? 'Hide AI Assistant' : 'Show AI Assistant'}
            >
              {aiPanelVisible ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
              <span className="text-xs font-medium">AI</span>
            </button>

            <div className="h-6 w-px bg-white/10" />

            <div className="text-right">
              <p className="text-sm text-white font-medium">
                {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-[10px] text-white/50">
                {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </p>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </nav>

        {/* Main Dashboard Content */}
        <div className="flex-1 flex gap-4 p-4 min-h-0 overflow-hidden">

          {/* Left Column - Metrics & Room Grid */}
          <div className="flex-1 flex flex-col gap-4 min-w-0">

            {/* Top Metrics Row */}
            <div className="grid grid-cols-6 gap-3 flex-shrink-0">
              {/* Occupancy */}
              <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
                <div className="flex items-center justify-between mb-2">
                  <Tooltip content={HotelTerms.OCC}>
                    <span className="text-xs text-white/50">Occupancy</span>
                  </Tooltip>
                  <BedDouble className="w-4 h-4 text-white/40" />
                </div>
                <p className="text-2xl font-light text-white">{metrics.occupancy}%</p>
                <div className={`flex items-center gap-1 mt-1 ${metrics.occupancyChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {metrics.occupancyChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span className="text-xs">{Math.abs(metrics.occupancyChange)}%</span>
                </div>
              </div>

              {/* ADR */}
              <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
                <div className="flex items-center justify-between mb-2">
                  <Tooltip content={HotelTerms.ADR}>
                    <span className="text-xs text-white/50">ADR</span>
                  </Tooltip>
                  <DollarSign className="w-4 h-4 text-white/40" />
                </div>
                <p className="text-2xl font-light text-white">{formatCurrency(metrics.adr)}</p>
                <div className={`flex items-center gap-1 mt-1 ${metrics.adrChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {metrics.adrChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span className="text-xs">{Math.abs(metrics.adrChange)}%</span>
                </div>
              </div>

              {/* RevPAR */}
              <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
                <div className="flex items-center justify-between mb-2">
                  <Tooltip content={HotelTerms.RevPAR}>
                    <span className="text-xs text-white/50">RevPAR</span>
                  </Tooltip>
                  <TrendingUp className="w-4 h-4 text-white/40" />
                </div>
                <p className="text-2xl font-light text-white">{formatCurrency(metrics.revpar)}</p>
                <div className={`flex items-center gap-1 mt-1 ${metrics.revparChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {metrics.revparChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span className="text-xs">{Math.abs(metrics.revparChange)}%</span>
                </div>
              </div>

              {/* Guest Satisfaction */}
              <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white/50">Guest Score</span>
                  <Star className="w-4 h-4 text-amber-400" />
                </div>
                <p className="text-2xl font-light text-white">{metrics.guestSatisfaction}<span className="text-sm text-white/50">/5</span></p>
                <div className={`flex items-center gap-1 mt-1 ${metrics.satisfactionChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {metrics.satisfactionChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span className="text-xs">+{metrics.satisfactionChange}</span>
                </div>
              </div>

              {/* AI Tasks */}
              <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-xl rounded-xl border border-purple-500/30 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white/50">AI Tasks Today</span>
                  <Bot className="w-4 h-4 text-purple-400" />
                </div>
                <p className="text-2xl font-light text-white">{metrics.aiTasksToday}</p>
                <div className="flex items-center gap-1 mt-1 text-purple-400">
                  <Zap className="w-3 h-3" />
                  <span className="text-xs">{metrics.aiAutomationRate}% automated</span>
                </div>
              </div>

              {/* Open Requests */}
              <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white/50">Open Requests</span>
                  <MessageSquare className="w-4 h-4 text-white/40" />
                </div>
                <p className="text-2xl font-light text-white">{metrics.openRequests}</p>
                <div className="flex items-center gap-1 mt-1 text-amber-400">
                  <Clock className="w-3 h-3" />
                  <span className="text-xs">{metrics.roomsToClean} rooms to clean</span>
                </div>
              </div>
            </div>

            {/* Room Status Grid */}
            <div className="flex-1 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 flex flex-col min-h-0 overflow-hidden">
              {/* Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <LayoutDashboard className="w-5 h-5 text-white/60" />
                  <h2 className="text-lg font-light text-white" style={{ fontFamily: 'var(--font-cormorant)' }}>
                    Room Status
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  {/* Status Filter */}
                  <div className="relative">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as RoomStatus | 'all')}
                      className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 pr-8 text-xs text-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-400/50"
                      style={{ colorScheme: 'dark' }}
                    >
                      <option value="all" className="bg-stone-800 text-white">All Status</option>
                      {ALL_ROOM_STATUSES.map(status => (
                        <option key={status} value={status} className="bg-stone-800 text-white">
                          {ROOM_STATUS_LABELS[status]}
                        </option>
                      ))}
                    </select>
                    <Filter className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-white/40 pointer-events-none" />
                  </div>
                  {/* Floor Filter */}
                  <div className="relative">
                    <select
                      value={filterFloor}
                      onChange={(e) => setFilterFloor(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                      className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 pr-8 text-xs text-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-400/50"
                      style={{ colorScheme: 'dark' }}
                    >
                      <option value="all" className="bg-stone-800 text-white">All Floors</option>
                      {[1, 2, 3, 4, 5].map(f => (
                        <option key={f} value={f} className="bg-stone-800 text-white">Floor {f} (55 rooms)</option>
                      ))}
                    </select>
                    <Filter className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-white/40 pointer-events-none" />
                  </div>
                  {/* Room Type Filter */}
                  <div className="relative">
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value as RoomType | 'all')}
                      className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 pr-8 text-xs text-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-400/50"
                      style={{ colorScheme: 'dark' }}
                    >
                      <option value="all" className="bg-stone-800 text-white">All Types</option>
                      {ALL_ROOM_TYPES.map(type => (
                        <option key={type} value={type} className="bg-stone-800 text-white">
                          {ROOM_TYPE_LABELS[type]}
                        </option>
                      ))}
                    </select>
                    <Filter className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-white/40 pointer-events-none" />
                  </div>
                  <button
                    onClick={refreshData}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors active:scale-95"
                    title="Refresh data"
                  >
                    <RefreshCw className="w-4 h-4 text-white/60 hover:text-white" />
                  </button>
                </div>
              </div>

              {/* Status Legend */}
              <div className="px-4 py-2 border-b border-white/10 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] text-white/50">Clean ({statusCounts.clean})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <span className="text-[10px] text-white/50">Dirty ({statusCounts.dirty})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="text-[10px] text-white/50">In Progress ({statusCounts.in_progress})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span className="text-[10px] text-white/50">Inspecting ({statusCounts.inspecting})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                    <span className="text-[10px] text-white/50">Occupied ({statusCounts.occupied})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                    <span className="text-[10px] text-white/50">Checkout ({statusCounts.checkout})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-500" />
                    <span className="text-[10px] text-white/50">Maintenance ({statusCounts.maintenance})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-700" />
                    <span className="text-[10px] text-white/50">Out of Order ({statusCounts.out_of_order})</span>
                  </div>
                </div>
                <div className="text-[10px] text-white/40">
                  {filteredRooms.length} of {totalRooms} rooms
                </div>
              </div>

              {/* Room Grid */}
              <div className="flex-1 p-4 overflow-y-auto">
                {filterFloor === 'all' ? (
                  // Show all floors grouped
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map(floor => {
                      const floorRooms = filteredRooms.filter(r => r.floor === floor);
                      if (floorRooms.length === 0) return null;
                      return (
                        <div key={floor}>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xs font-medium text-white/60">Floor {floor}</h3>
                            <div className="flex-1 h-px bg-white/10" />
                            <span className="text-[10px] text-white/40">{floorRooms.length} rooms</span>
                          </div>
                          <div className="grid grid-cols-11 gap-1.5">
                            {floorRooms.map((room) => (
                              <button
                                key={room.id}
                                onClick={() => setSelectedRoom(selectedRoom?.id === room.id ? null : room)}
                                className={`relative p-1.5 rounded-lg border transition-all ${
                                  selectedRoom?.id === room.id
                                    ? 'ring-2 ring-amber-400 ' + getStatusBgColor(room.status)
                                    : getStatusBgColor(room.status) + ' hover:brightness-125'
                                }`}
                              >
                                <div className={`absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full ${getStatusColor(room.status)}`} />
                                <p className="text-xs font-medium text-white">{room.number}</p>
                                <p className="text-[8px] text-white/50 capitalize truncate">{room.type}</p>
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  // Show single floor with larger tiles
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="text-sm font-medium text-white/80">Floor {filterFloor}</h3>
                      <div className="flex-1 h-px bg-white/10" />
                      <span className="text-xs text-white/40">{filteredRooms.length} rooms</span>
                    </div>
                    <div className="grid grid-cols-11 gap-2">
                      {filteredRooms.map((room) => (
                        <button
                          key={room.id}
                          onClick={() => setSelectedRoom(selectedRoom?.id === room.id ? null : room)}
                          className={`relative p-2 rounded-lg border transition-all ${
                            selectedRoom?.id === room.id
                              ? 'ring-2 ring-amber-400 ' + getStatusBgColor(room.status)
                              : getStatusBgColor(room.status) + ' hover:brightness-125'
                          }`}
                        >
                          <div className={`absolute top-1 right-1 w-2 h-2 rounded-full ${getStatusColor(room.status)}`} />
                          <p className="text-sm font-medium text-white">{room.number}</p>
                          <p className="text-[9px] text-white/50 capitalize">{room.type}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Selected Room Details */}
              {selectedRoom && (
                <div className="p-4 border-t border-white/10 bg-white/5 flex-shrink-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-medium text-white">Room {selectedRoom.number}</h3>
                        <span className={`px-2 py-0.5 rounded text-[10px] capitalize border ${getStatusBgColor(selectedRoom.status)}`}>
                          {selectedRoom.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-white/50 capitalize">{selectedRoom.type} Room • Floor {selectedRoom.floor}</p>
                    </div>
                    <button className="p-2 hover:bg-white/10 rounded-lg">
                      <MoreHorizontal className="w-4 h-4 text-white/60" />
                    </button>
                  </div>

                  {/* Guest Information */}
                  {selectedRoom.guestName && (
                    <div className="mt-3 p-3 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-medium text-white/70">Guest Information</span>
                      </div>
                      <div className="grid grid-cols-4 gap-3">
                        <div className="col-span-2">
                          <p className="text-[10px] text-white/40">Guest Name</p>
                          <p className="text-sm text-white font-medium">{selectedRoom.guestName}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-white/40">Adults</p>
                          <p className="text-sm text-white">{selectedRoom.numAdults || 0}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-white/40">Children</p>
                          <p className="text-sm text-white">{selectedRoom.numChildren || 0}</p>
                        </div>
                      </div>
                      {(selectedRoom.checkInDate || selectedRoom.checkoutDate) && (
                        <div className="grid grid-cols-2 gap-3 mt-2 pt-2 border-t border-white/10">
                          {selectedRoom.checkInDate && (
                            <div>
                              <p className="text-[10px] text-white/40">Check-in</p>
                              <p className="text-sm text-white">{new Date(selectedRoom.checkInDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                            </div>
                          )}
                          {selectedRoom.checkoutDate && (
                            <div>
                              <p className="text-[10px] text-white/40">Check-out</p>
                              <p className="text-sm text-white">{new Date(selectedRoom.checkoutDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Room Operations Info */}
                  <div className="grid grid-cols-3 gap-4 mt-3">
                    {selectedRoom.assignedTo && (
                      <div>
                        <p className="text-[10px] text-white/40">Assigned To</p>
                        <p className="text-sm text-white">{selectedRoom.assignedTo}</p>
                      </div>
                    )}
                    {selectedRoom.checkoutTime && (
                      <div>
                        <p className="text-[10px] text-white/40">Checkout Time</p>
                        <p className="text-sm text-white">{selectedRoom.checkoutTime}</p>
                      </div>
                    )}
                    {selectedRoom.estimatedReady && (
                      <div>
                        <p className="text-[10px] text-white/40">Est. Ready</p>
                        <p className="text-sm text-white">{selectedRoom.estimatedReady}</p>
                      </div>
                    )}
                    {selectedRoom.lastCleaned && (
                      <div>
                        <p className="text-[10px] text-white/40">Last Cleaned</p>
                        <p className="text-sm text-white">{new Date(selectedRoom.lastCleaned).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - AI & Requests */}
          <div className={`flex-shrink-0 flex flex-col gap-4 min-h-0 transition-all duration-300 ${aiPanelVisible ? 'w-[420px]' : 'w-[320px]'}`}>

            {/* AI Assistant with Voice Support */}
            {aiPanelVisible && (
              <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 backdrop-blur-xl rounded-xl border border-purple-500/30 flex flex-col min-h-0 overflow-hidden" style={{ height: '50%' }}>
                <VoiceSessionChat
                  agentId="operations-assistant"
                  title="Operations AI"
                  subtitle="Voice-enabled assistant"
                  avatar="/avatars/assistant-avatar.jpg"
                  variant="dark"
                  welcomeMessage="I'm your operations assistant. I can help you manage rooms, coordinate housekeeping, and handle guest requests. Ask me anything about hotel operations."
                  suggestions={[
                    "Show me dirty rooms on floor 3",
                    "List urgent guest requests",
                    "What's today's occupancy?",
                  ]}
                  contextData={{
                    metrics: metrics,
                    occupancy: metrics.occupancy,
                    openRequests: metrics.openRequests,
                    roomsToClean: metrics.roomsToClean,
                    aiTasksToday: metrics.aiTasksToday,
                  }}
                />
              </div>
            )}

            {/* AI Agent Activity - Compact view when AI panel is visible */}
            <div className={`bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-xl rounded-xl border border-purple-500/20 flex flex-col min-h-0 ${aiPanelVisible ? '' : 'flex-1'}`} style={aiPanelVisible ? { height: '25%' } : {}}>
              <div className="p-3 border-b border-white/10 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                    <Bot className="w-3 h-3 text-white" />
                  </div>
                  <h2 className="text-xs font-medium text-white">AI Activity</h2>
                </div>
                <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 rounded-full">
                  <CircleDot className="w-2 h-2 text-emerald-400 animate-pulse" />
                  <span className="text-[9px] text-emerald-400">Live</span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                {agentActivities.slice(0, aiPanelVisible ? 3 : 10).map((activity) => {
                  const AgentIcon = getAgentIcon(activity.agentType);
                  return (
                    <div key={activity.id} className="p-2 hover:bg-white/5 rounded-lg transition-colors mb-1">
                      <div className="flex items-start gap-2">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${getAgentColor(activity.agentType)}`}>
                          <AgentIcon className="w-3 h-3" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="text-[11px] font-medium text-white truncate">{activity.action}</span>
                            {activity.automated && <Zap className="w-2.5 h-2.5 text-amber-400 flex-shrink-0" />}
                            {activity.outcome === 'success' && <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400 flex-shrink-0" />}
                          </div>
                          <p className="text-[10px] text-white/50 truncate">{activity.details}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Guest Requests */}
            <div className="flex-1 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 flex flex-col min-h-0">
              <div className="p-4 border-b border-white/10 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-white/60" />
                  <h2 className="text-sm font-medium text-white">Guest Requests</h2>
                </div>
                <span className="text-xs text-white/50">{pendingRequests.length} pending</span>
              </div>

              <div className="flex-1 overflow-y-auto p-2">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className={`p-3 rounded-lg border mb-2 transition-colors hover:bg-white/5 ${
                      request.status === 'escalated' ? 'border-red-500/30 bg-red-500/10' : 'border-white/10'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-medium text-white">Room {request.roomNumber}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] border capitalize ${getPriorityColor(request.priority)}`}>
                            {request.priority}
                          </span>
                          {request.aiHandled && (
                            <span className="flex items-center gap-0.5 text-[9px] text-purple-400">
                              <Bot className="w-3 h-3" />
                              AI
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-white/50 mt-0.5">{request.guestName}</p>
                        <p className="text-[11px] text-white/70 mt-1 line-clamp-2">{request.message}</p>
                      </div>
                      {request.status === 'completed' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      ) : request.status === 'escalated' ? (
                        <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                      ) : (
                        <Clock className="w-4 h-4 text-white/40 flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
                      <span className="text-[10px] text-white/40">{formatTimeAgo(request.createdAt)}</span>
                      {request.responseTime && (
                        <span className="text-[10px] text-emerald-400">Resolved in {request.responseTime}m</span>
                      )}
                      {request.assignedTo && (
                        <span className="text-[10px] text-white/50">{request.assignedTo}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Housekeeping Staff Quick View */}
            <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4 flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-white/60" />
                  <h3 className="text-sm font-medium text-white">Housekeeping Team</h3>
                </div>
                <Link href="/employee-management?dept=housekeeping" className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1">
                  View All <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {housekeepingStaff.map((staff) => (
                  <div
                    key={staff.id}
                    className="flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg border border-white/10"
                  >
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-white/20 overflow-hidden">
                        <div className="w-full h-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                          <span className="text-[10px] text-white font-medium">
                            {staff.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-stone-900 ${
                        staff.status === 'available' ? 'bg-emerald-500' :
                        staff.status === 'busy' ? 'bg-amber-500' :
                        staff.status === 'break' ? 'bg-blue-500' : 'bg-gray-500'
                      }`} />
                    </div>
                    <div>
                      <p className="text-xs text-white font-medium">{staff.name.split(' ')[0]}</p>
                      <p className="text-[9px] text-white/50">
                        {staff.status === 'busy' && staff.currentRoom ? `Room ${staff.currentRoom}` : staff.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
