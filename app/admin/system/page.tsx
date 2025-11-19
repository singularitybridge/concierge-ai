'use client';

import { useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mic, Brain, TrendingUp, Users, Wrench, Database, MessageSquare, Cpu, Phone } from 'lucide-react';
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  MarkerType,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Custom node component for agents
const AgentNode = ({ data }: { data: { label: string; description: string; icon: string; color: string } }) => {
  const icons: Record<string, React.ReactNode> = {
    brain: <Brain className="w-5 h-5" />,
    trending: <TrendingUp className="w-5 h-5" />,
    users: <Users className="w-5 h-5" />,
    wrench: <Wrench className="w-5 h-5" />,
    mic: <Mic className="w-5 h-5" />,
    cpu: <Cpu className="w-5 h-5" />,
    database: <Database className="w-5 h-5" />,
    message: <MessageSquare className="w-5 h-5" />,
    phone: <Phone className="w-5 h-5" />,
  };

  return (
    <div className={`px-4 py-3 rounded-lg border-2 ${data.color} min-w-[160px]`}>
      <div className="flex items-center gap-2 mb-1">
        {icons[data.icon]}
        <span className="font-medium text-sm">{data.label}</span>
      </div>
      <p className="text-xs text-stone-500">{data.description}</p>
    </div>
  );
};

const nodeTypes = {
  agent: AgentNode,
};

// Define nodes
const initialNodes: Node[] = [
  // Telephony
  {
    id: 'twilio',
    type: 'agent',
    position: { x: -150, y: 105 },
    data: {
      label: 'Twilio',
      description: 'Phone Numbers',
      icon: 'phone',
      color: 'bg-red-50 border-red-300 text-red-700',
    },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  // Voice Providers
  {
    id: 'vapi',
    type: 'agent',
    position: { x: 50, y: 50 },
    data: {
      label: 'VAPI',
      description: 'Voice AI Provider',
      icon: 'mic',
      color: 'bg-purple-50 border-purple-300 text-purple-700',
    },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  {
    id: 'elevenlabs',
    type: 'agent',
    position: { x: 50, y: 160 },
    data: {
      label: 'ElevenLabs',
      description: 'Voice Synthesis',
      icon: 'mic',
      color: 'bg-indigo-50 border-indigo-300 text-indigo-700',
    },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  // Main Concierge
  {
    id: 'concierge',
    type: 'agent',
    position: { x: 300, y: 105 },
    data: {
      label: 'Concierge AI',
      description: 'Main Guest Interface',
      icon: 'brain',
      color: 'bg-stone-800 border-stone-900 text-white',
    },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  // Agent Hub
  {
    id: 'hub',
    type: 'agent',
    position: { x: 550, y: 105 },
    data: {
      label: 'Agent Hub',
      description: 'Orchestration Layer',
      icon: 'message',
      color: 'bg-sky-50 border-sky-300 text-sky-700',
    },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  // Specialized Agents
  {
    id: 'revenue',
    type: 'agent',
    position: { x: 800, y: 0 },
    data: {
      label: 'Revenue Manager',
      description: 'Pricing & Analytics',
      icon: 'trending',
      color: 'bg-emerald-50 border-emerald-300 text-emerald-700',
    },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  {
    id: 'guests',
    type: 'agent',
    position: { x: 800, y: 105 },
    data: {
      label: 'Guest Services',
      description: 'Reservations & Profiles',
      icon: 'users',
      color: 'bg-blue-50 border-blue-300 text-blue-700',
    },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  {
    id: 'operations',
    type: 'agent',
    position: { x: 800, y: 210 },
    data: {
      label: 'Operations',
      description: 'Housekeeping & Maintenance',
      icon: 'wrench',
      color: 'bg-amber-50 border-amber-300 text-amber-700',
    },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  // Data Sources
  {
    id: 'pms',
    type: 'agent',
    position: { x: 1050, y: 105 },
    data: {
      label: 'PMS API',
      description: 'Property Data',
      icon: 'database',
      color: 'bg-stone-50 border-stone-300 text-stone-700',
    },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  // Digital Architect - oversees everything
  {
    id: 'architect',
    type: 'agent',
    position: { x: 550, y: 280 },
    data: {
      label: 'Digital Architect',
      description: 'System Guardian',
      icon: 'cpu',
      color: 'bg-violet-50 border-violet-300 text-violet-700',
    },
    sourcePosition: Position.Top,
    targetPosition: Position.Bottom,
  },
];

// Define edges
const initialEdges: Edge[] = [
  // Twilio to Voice Providers
  {
    id: 'twilio-vapi',
    source: 'twilio',
    target: 'vapi',
    style: { stroke: '#ef4444' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' },
  },
  {
    id: 'twilio-elevenlabs',
    source: 'twilio',
    target: 'elevenlabs',
    style: { stroke: '#ef4444' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' },
  },
  // Voice to Concierge
  {
    id: 'vapi-concierge',
    source: 'vapi',
    target: 'concierge',
    animated: true,
    style: { stroke: '#a855f7' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#a855f7' },
  },
  {
    id: 'elevenlabs-concierge',
    source: 'elevenlabs',
    target: 'concierge',
    animated: true,
    style: { stroke: '#6366f1' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' },
  },
  // Concierge to Hub
  {
    id: 'concierge-hub',
    source: 'concierge',
    target: 'hub',
    animated: true,
    style: { stroke: '#57534e', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#57534e' },
  },
  // Hub to Agents
  {
    id: 'hub-revenue',
    source: 'hub',
    target: 'revenue',
    style: { stroke: '#10b981' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' },
  },
  {
    id: 'hub-guests',
    source: 'hub',
    target: 'guests',
    style: { stroke: '#3b82f6' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
  },
  {
    id: 'hub-operations',
    source: 'hub',
    target: 'operations',
    style: { stroke: '#f59e0b' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' },
  },
  // Agents to PMS
  {
    id: 'revenue-pms',
    source: 'revenue',
    target: 'pms',
    style: { stroke: '#78716c' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#78716c' },
  },
  {
    id: 'guests-pms',
    source: 'guests',
    target: 'pms',
    style: { stroke: '#78716c' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#78716c' },
  },
  {
    id: 'operations-pms',
    source: 'operations',
    target: 'pms',
    style: { stroke: '#78716c' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#78716c' },
  },
  // Digital Architect monitoring connections
  {
    id: 'architect-hub',
    source: 'architect',
    target: 'hub',
    animated: true,
    style: { stroke: '#8b5cf6', strokeDasharray: '5,5' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' },
  },
  {
    id: 'architect-concierge',
    source: 'architect',
    target: 'concierge',
    style: { stroke: '#8b5cf6', strokeDasharray: '5,5' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' },
  },
];

export default function SystemArchitecturePage() {
  return (
    <div className="min-h-screen bg-stone-100">
      {/* Header */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-light text-stone-800 tracking-wide" style={{ fontFamily: 'var(--font-cormorant)' }}>
                System Architecture
              </h1>
              <p className="text-xs text-stone-500 uppercase tracking-wider">Agentic System Design</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Description */}
        <div className="bg-white rounded-xl border border-stone-200 p-6 mb-6">
          <h2 className="text-lg font-medium text-stone-800 mb-3">Multi-Agent Architecture</h2>
          <p className="text-sm text-stone-600 mb-4">
            The 1898 Niseko uses a multi-agent AI system to provide personalized guest experiences.
            Voice interactions flow through VAPI or ElevenLabs to the main Concierge AI, which
            orchestrates specialized agents for different property management functions.
          </p>
          <div className="grid grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-red-50 rounded-lg border border-red-100">
              <p className="font-medium text-red-700 mb-1">Twilio Telephony</p>
              <p className="text-stone-500">Connect phone numbers to voice providers for inbound/outbound calls</p>
            </div>
            <div className="p-3 bg-stone-50 rounded-lg">
              <p className="font-medium text-stone-700 mb-1">Voice Providers</p>
              <p className="text-stone-500">VAPI & ElevenLabs with function calling for interactive UI</p>
            </div>
            <div className="p-3 bg-stone-50 rounded-lg">
              <p className="font-medium text-stone-700 mb-1">Agent Hub</p>
              <p className="text-stone-500">Orchestration layer routing to specialized domain agents</p>
            </div>
            <div className="p-3 bg-stone-50 rounded-lg">
              <p className="font-medium text-stone-700 mb-1">Domain Agents</p>
              <p className="text-stone-500">Specialized AI for revenue, guests, and operations</p>
            </div>
          </div>
        </div>

        {/* Diagram */}
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <div className="p-4 border-b border-stone-200">
            <h3 className="text-sm font-medium text-stone-700">System Flow Diagram</h3>
          </div>
          <div className="h-[500px]">
            <ReactFlow
              nodes={initialNodes}
              edges={initialEdges}
              nodeTypes={nodeTypes}
              fitView
              fitViewOptions={{ padding: 0.2 }}
              proOptions={{ hideAttribution: true }}
            >
              <Background color="#e7e5e4" gap={16} />
              <Controls />
            </ReactFlow>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 bg-white rounded-xl border border-stone-200 p-6">
          <h3 className="text-sm font-medium text-stone-700 mb-4">Component Legend</h3>
          <div className="grid grid-cols-5 gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-red-400"></div>
              <span className="text-stone-600">Telephony</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-purple-400"></div>
              <span className="text-stone-600">Voice Provider</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-stone-800"></div>
              <span className="text-stone-600">Main Interface</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-sky-400"></div>
              <span className="text-stone-600">Orchestration</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-violet-400"></div>
              <span className="text-stone-600">System Guardian</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
