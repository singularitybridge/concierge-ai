'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  Lightbulb,
  ArrowRight,
  X,
  ChevronDown,
  ChevronUp,
  Zap,
  BedDouble,
  Users,
  Clock,
  CheckCircle2,
  Star,
  Timer,
  AlertCircle,
  Sparkle,
} from 'lucide-react';

interface HousekeepingMetrics {
  roomsCleanedToday: number;
  roomsRemaining: number;
  totalRooms: number;
  avgCleaningTime: number;
  targetCleaningTime: number;
  turnaroundTime: number;
  qualityScore: number;
  inspectionPassRate: number;
  reCleaningRequests: number;
  guestComplaints: number;
  roomsPerAttendant: number;
  checkoutsCompleted: number;
  stayoversCompleted: number;
  deepCleansCompleted: number;
  attendantsOnDuty: number;
  attendantsOnBreak: number;
  vipRoomsReady: number;
  earlyCheckinsPending: number;
  lateCheckoutsPending: number;
}

interface HousekeepingRoom {
  id: string;
  roomNumber: string;
  cleaningStatus: string;
  priority: string;
  assignedTo?: string;
}

interface Insight {
  id: string;
  type: 'opportunity' | 'alert' | 'performance' | 'action';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action: string;
  metric?: {
    label: string;
    value: string;
    change?: number;
    changeLabel?: string;
  };
  icon: 'trending' | 'alert' | 'target' | 'lightbulb' | 'bed' | 'users' | 'clock' | 'check' | 'star' | 'timer' | 'sparkle';
}

interface HousekeepingAIInsightsProps {
  metrics: HousekeepingMetrics;
  rooms: HousekeepingRoom[];
}

export default function HousekeepingAIInsights({
  metrics,
  rooms,
}: HousekeepingAIInsightsProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [dismissedInsights, setDismissedInsights] = useState<Set<string>>(new Set());
  const [isVisible, setIsVisible] = useState(false);
  const [activeInsightIndex, setActiveInsightIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isExpanded) return;
    const interval = setInterval(() => {
      setActiveInsightIndex((prev) => (prev + 1) % Math.max(insights.length, 1));
    }, 8000);
    return () => clearInterval(interval);
  }, [isExpanded]);

  const insights = useMemo(() => {
    const generatedInsights: Insight[] = [];

    // 1. Room Progress Analysis
    const progressRate = (metrics.roomsCleanedToday / metrics.totalRooms) * 100;
    const expectedProgress = 70; // Expected by this time of day

    if (progressRate < expectedProgress - 15) {
      generatedInsights.push({
        id: 'behind-schedule',
        type: 'alert',
        priority: 'high',
        title: 'Behind Cleaning Schedule',
        description: `Only ${progressRate.toFixed(0)}% of rooms cleaned. ${metrics.roomsRemaining} rooms remaining with ${metrics.attendantsOnDuty} attendants on duty.`,
        action: 'Consider calling in backup staff or reassigning priorities to checkout rooms',
        metric: {
          label: 'Progress',
          value: `${progressRate.toFixed(0)}%`,
          change: progressRate - expectedProgress,
          changeLabel: 'vs expected',
        },
        icon: 'timer',
      });
    }

    // 2. VIP Room Priority
    const vipRoomsNotReady = rooms.filter(r => r.priority === 'vip' && r.cleaningStatus !== 'inspected').length;
    if (vipRoomsNotReady > 0) {
      generatedInsights.push({
        id: 'vip-rooms',
        type: 'action',
        priority: 'high',
        title: `${vipRoomsNotReady} VIP Rooms Need Attention`,
        description: 'VIP guests expect rooms ready by guaranteed check-in time. These rooms should be prioritized immediately.',
        action: 'Assign your best attendants to VIP rooms and conduct supervisor inspection',
        metric: {
          label: 'VIP Pending',
          value: vipRoomsNotReady.toString(),
          changeLabel: 'need priority',
        },
        icon: 'star',
      });
    }

    // 3. Early Check-in Pressure
    if (metrics.earlyCheckinsPending > 3) {
      generatedInsights.push({
        id: 'early-checkin',
        type: 'action',
        priority: 'high',
        title: `${metrics.earlyCheckinsPending} Early Check-ins Waiting`,
        description: 'Guests are waiting for rooms. Front desk is under pressure to accommodate early arrivals.',
        action: 'Focus attendants on early check-in rooms to reduce guest wait times',
        metric: {
          label: 'Waiting',
          value: metrics.earlyCheckinsPending.toString(),
          changeLabel: 'guests',
        },
        icon: 'clock',
      });
    }

    // 4. Quality Score Analysis
    if (metrics.qualityScore < 90) {
      generatedInsights.push({
        id: 'quality-score',
        type: 'opportunity',
        priority: 'medium',
        title: 'Quality Score Below Target',
        description: `Quality score is ${metrics.qualityScore}% with ${metrics.reCleaningRequests} re-cleaning requests. Guest satisfaction may be impacted.`,
        action: 'Schedule refresher training and increase inspection frequency',
        metric: {
          label: 'Quality',
          value: `${metrics.qualityScore}%`,
          change: metrics.qualityScore - 95,
          changeLabel: 'vs target',
        },
        icon: 'sparkle',
      });
    } else if (metrics.qualityScore >= 95) {
      generatedInsights.push({
        id: 'excellent-quality',
        type: 'performance',
        priority: 'low',
        title: 'Excellent Quality Performance',
        description: `Quality score is ${metrics.qualityScore}% with high inspection pass rates. Team is delivering consistent results.`,
        action: 'Recognize top performers and share best practices',
        metric: {
          label: 'Quality',
          value: `${metrics.qualityScore}%`,
          change: metrics.qualityScore - 90,
          changeLabel: 'above baseline',
        },
        icon: 'check',
      });
    }

    // 5. Cleaning Time Efficiency
    if (metrics.avgCleaningTime > metrics.targetCleaningTime + 5) {
      generatedInsights.push({
        id: 'slow-cleaning',
        type: 'opportunity',
        priority: 'medium',
        title: 'Cleaning Times Above Target',
        description: `Average cleaning time is ${metrics.avgCleaningTime} minutes vs ${metrics.targetCleaningTime} minute target. This reduces daily capacity.`,
        action: 'Review cleaning procedures and optimize supply cart stocking',
        metric: {
          label: 'Avg Time',
          value: `${metrics.avgCleaningTime}min`,
          change: metrics.avgCleaningTime - metrics.targetCleaningTime,
          changeLabel: 'vs target',
        },
        icon: 'timer',
      });
    }

    // 6. Re-cleaning Requests
    if (metrics.reCleaningRequests > 2) {
      generatedInsights.push({
        id: 'reclean-requests',
        type: 'alert',
        priority: 'medium',
        title: `${metrics.reCleaningRequests} Re-Cleaning Requests`,
        description: 'Multiple rooms required re-cleaning. This impacts efficiency and guest satisfaction.',
        action: 'Review specific issues and provide targeted coaching to affected attendants',
        metric: {
          label: 'Re-cleans',
          value: metrics.reCleaningRequests.toString(),
          changeLabel: 'today',
        },
        icon: 'alert',
      });
    }

    // 7. Staffing Balance
    const staffingRatio = metrics.roomsRemaining / Math.max(metrics.attendantsOnDuty, 1);
    if (staffingRatio > 12) {
      generatedInsights.push({
        id: 'understaffed',
        type: 'alert',
        priority: 'high',
        title: 'High Room-to-Attendant Ratio',
        description: `Each attendant has ~${staffingRatio.toFixed(0)} rooms remaining. Standard is 8-10 rooms per shift.`,
        action: 'Request additional housekeeping support or extend shifts if possible',
        metric: {
          label: 'Ratio',
          value: `${staffingRatio.toFixed(0)}:1`,
          changeLabel: 'rooms per attendant',
        },
        icon: 'users',
      });
    }

    // 8. Guest Complaints
    if (metrics.guestComplaints > 0) {
      generatedInsights.push({
        id: 'complaints',
        type: 'alert',
        priority: 'high',
        title: `${metrics.guestComplaints} Guest Complaint${metrics.guestComplaints > 1 ? 's' : ''} Today`,
        description: 'Immediate attention required to address guest concerns and prevent negative reviews.',
        action: 'Supervisor should personally follow up with affected guests and ensure resolution',
        metric: {
          label: 'Complaints',
          value: metrics.guestComplaints.toString(),
          changeLabel: 'today',
        },
        icon: 'alert',
      });
    }

    // 9. Unassigned Rooms
    const unassignedRooms = rooms.filter(r => !r.assignedTo && r.cleaningStatus === 'dirty').length;
    if (unassignedRooms > 5) {
      generatedInsights.push({
        id: 'unassigned',
        type: 'action',
        priority: 'medium',
        title: `${unassignedRooms} Rooms Unassigned`,
        description: 'Dirty rooms without attendant assignments will delay room availability.',
        action: 'Distribute unassigned rooms among available attendants',
        metric: {
          label: 'Unassigned',
          value: unassignedRooms.toString(),
          changeLabel: 'dirty rooms',
        },
        icon: 'bed',
      });
    }

    // Default insight
    if (generatedInsights.length === 0) {
      generatedInsights.push({
        id: 'on-track',
        type: 'performance',
        priority: 'low',
        title: 'Housekeeping On Track',
        description: 'All key metrics are within expected ranges. Room turnover is proceeding smoothly.',
        action: 'Continue current pace and maintain quality standards',
        icon: 'check',
      });
    }

    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return generatedInsights
      .filter(i => !dismissedInsights.has(i.id))
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }, [metrics, rooms, dismissedInsights]);

  const getIconComponent = (icon: Insight['icon']) => {
    switch (icon) {
      case 'trending': return TrendingUp;
      case 'alert': return AlertTriangle;
      case 'target': return Target;
      case 'lightbulb': return Lightbulb;
      case 'bed': return BedDouble;
      case 'users': return Users;
      case 'clock': return Clock;
      case 'check': return CheckCircle2;
      case 'star': return Star;
      case 'timer': return Timer;
      case 'sparkle': return Sparkle;
      default: return Sparkles;
    }
  };

  const getPriorityStyles = (priority: Insight['priority'], type: Insight['type']) => {
    if (type === 'alert') {
      return {
        bg: 'from-red-500/20 to-orange-500/10',
        border: 'border-red-500/30',
        iconBg: 'bg-red-500/20',
        iconColor: 'text-red-400',
        badge: 'bg-red-500/20 text-red-300 border-red-500/30',
      };
    }
    if (type === 'action' || priority === 'high') {
      return {
        bg: 'from-amber-500/20 to-orange-500/10',
        border: 'border-amber-500/30',
        iconBg: 'bg-amber-500/20',
        iconColor: 'text-amber-400',
        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      };
    }
    if (type === 'opportunity') {
      return {
        bg: 'from-blue-500/20 to-cyan-500/10',
        border: 'border-blue-500/30',
        iconBg: 'bg-blue-500/20',
        iconColor: 'text-blue-400',
        badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      };
    }
    return {
      bg: 'from-emerald-500/20 to-teal-500/10',
      border: 'border-emerald-500/30',
      iconBg: 'bg-emerald-500/20',
      iconColor: 'text-emerald-400',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    };
  };

  const getTypeLabel = (type: Insight['type']) => {
    switch (type) {
      case 'opportunity': return 'Opportunity';
      case 'alert': return 'Alert';
      case 'performance': return 'Performance';
      case 'action': return 'Action Required';
    }
  };

  if (insights.length === 0) return null;

  const currentInsight = insights[activeInsightIndex % insights.length];
  const styles = getPriorityStyles(currentInsight.priority, currentInsight.type);
  const IconComponent = getIconComponent(currentInsight.icon);

  return (
    <div
      className={`transition-all duration-700 ease-out mb-3 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
    >
      <div className={`bg-gradient-to-r ${styles.bg} backdrop-blur-xl rounded-xl border ${styles.border} overflow-hidden shadow-lg`}>
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-lg ${styles.iconBg} flex items-center justify-center`}>
              <Sparkles className={`w-3 h-3 ${styles.iconColor}`} />
            </div>
            <h3 className="text-[11px] font-semibold text-white flex items-center gap-1.5">
              AI Housekeeping Insights
              <span className="px-1.5 py-0.5 text-[8px] font-medium rounded-full bg-white/10 text-white/70">
                {insights.length}
              </span>
            </h3>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5 mr-1">
              {insights.slice(0, 4).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveInsightIndex(idx)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    idx === activeInsightIndex % insights.length
                      ? 'bg-white w-2.5'
                      : 'bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-0.5 hover:bg-white/10 rounded transition-colors"
            >
              {isExpanded ? (
                <ChevronUp className="w-3 h-3 text-white/60" />
              ) : (
                <ChevronDown className="w-3 h-3 text-white/60" />
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        {isExpanded && (
          <div className="p-3">
            <div className="flex gap-3">
              {/* Left: Icon */}
              <div className="flex flex-col items-center gap-1.5">
                <div className={`w-8 h-8 rounded-lg ${styles.iconBg} flex items-center justify-center`}>
                  <IconComponent className={`w-4 h-4 ${styles.iconColor}`} />
                </div>
                <span className={`px-1.5 py-0.5 text-[8px] font-medium rounded-full border ${styles.badge}`}>
                  {getTypeLabel(currentInsight.type)}
                </span>
              </div>

              {/* Middle: Content */}
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-semibold text-white mb-1">
                  {currentInsight.title}
                </h4>
                <p className="text-[10px] text-white/70 leading-relaxed mb-2">
                  {currentInsight.description}
                </p>

                <div className="flex items-start gap-1.5 p-2 bg-white/5 rounded-lg border border-white/10">
                  <Zap className="w-3 h-3 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[8px] font-medium text-amber-400 uppercase tracking-wider">
                      Action
                    </p>
                    <p className="text-[10px] text-white/90">{currentInsight.action}</p>
                  </div>
                </div>
              </div>

              {/* Right: Metric */}
              {currentInsight.metric && (
                <div className="flex flex-col items-end justify-center pl-3 border-l border-white/10">
                  <p className="text-[8px] font-medium text-white/40 uppercase tracking-wider">
                    {currentInsight.metric.label}
                  </p>
                  <p className={`text-xl font-bold ${
                    currentInsight.metric.change !== undefined
                      ? currentInsight.metric.change >= 0
                        ? 'text-emerald-400'
                        : 'text-red-400'
                      : 'text-white'
                  }`}>
                    {currentInsight.metric.value}
                  </p>
                  {currentInsight.metric.changeLabel && (
                    <p className="text-[9px] text-white/50">
                      {currentInsight.metric.changeLabel}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end mt-2 pt-2 border-t border-white/10">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setDismissedInsights(prev => new Set([...prev, currentInsight.id]))}
                  className="flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] text-white/50 hover:text-white/70 hover:bg-white/5 rounded transition-colors"
                >
                  <X className="w-2.5 h-2.5" />
                  Dismiss
                </button>
                <button
                  onClick={() => setActiveInsightIndex((prev) => (prev + 1) % insights.length)}
                  className="flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] text-white bg-white/10 hover:bg-white/20 rounded transition-colors"
                >
                  Next
                  <ArrowRight className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
