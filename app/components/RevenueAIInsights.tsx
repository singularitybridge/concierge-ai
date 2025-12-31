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
  Calendar,
  Users,
  DollarSign,
  BarChart3,
  CheckCircle2,
  Clock,
  Flame,
  Shield,
} from 'lucide-react';

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
  icon: 'trending' | 'alert' | 'target' | 'lightbulb' | 'calendar' | 'users' | 'dollar' | 'flame' | 'shield';
}

interface RevenueAIInsightsProps {
  currentMetrics: {
    occupancy: number;
    adr: number;
    revpar: number;
    trevpar: number;
    goppar: number;
    totalRevenue: number;
  };
  yoyMetrics: {
    occupancyChange: number;
    adrChange: number;
    revparChange: number;
    revenueChange: number;
  };
  benchmarkIndices: Array<{
    name: string;
    value: number;
    trend: 'up' | 'down' | 'stable';
    change: number;
  }>;
  segmentData: Array<{
    segment: string;
    revenue: number;
    yoyChange: number;
    percentage: number;
  }>;
  forecastSummary: {
    next30Days: {
      avgOtb: number;
      avgForecast: number;
      highDemandDays: number;
      concernDays: number;
    };
  };
  channelData: Array<{
    channel: string;
    revenue: number;
    commission: number;
    percentage: number;
  }>;
}

export default function RevenueAIInsights({
  currentMetrics,
  yoyMetrics,
  benchmarkIndices,
  segmentData,
  forecastSummary,
  channelData,
}: RevenueAIInsightsProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [dismissedInsights, setDismissedInsights] = useState<Set<string>>(new Set());
  const [isVisible, setIsVisible] = useState(false);
  const [activeInsightIndex, setActiveInsightIndex] = useState(0);

  // Animate in on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Auto-rotate insights every 8 seconds
  useEffect(() => {
    if (!isExpanded) return;
    const interval = setInterval(() => {
      setActiveInsightIndex((prev) => (prev + 1) % insights.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [isExpanded]);

  // Generate insights based on data analysis
  const insights = useMemo(() => {
    const generatedInsights: Insight[] = [];

    // 1. Market Performance Analysis (MPI/ARI/RGI)
    const mpi = benchmarkIndices.find(b => b.name === 'MPI');
    const ari = benchmarkIndices.find(b => b.name === 'ARI');
    const rgi = benchmarkIndices.find(b => b.name === 'RGI');

    if (mpi && mpi.value < 100) {
      generatedInsights.push({
        id: 'mpi-opportunity',
        type: 'opportunity',
        priority: mpi.value < 90 ? 'high' : 'medium',
        title: 'Occupancy Below Market Average',
        description: `Your market penetration index is ${mpi.value}, meaning you're capturing ${100 - mpi.value}% less market share than your fair share. This represents potential revenue leakage.`,
        action: 'Consider promotional campaigns targeting high-converting channels or reviewing your visibility on OTAs',
        metric: {
          label: 'MPI',
          value: mpi.value.toString(),
          change: mpi.change,
          changeLabel: 'vs last week',
        },
        icon: 'target',
      });
    }

    if (ari && ari.value > 105) {
      generatedInsights.push({
        id: 'ari-opportunity',
        type: 'performance',
        priority: 'medium',
        title: 'Strong Rate Positioning',
        description: `Your ADR is ${ari.value - 100}% above market average. You're successfully commanding premium rates. Consider if there's room for further rate optimization during high-demand periods.`,
        action: 'Maintain rate integrity and explore dynamic pricing for peak dates',
        metric: {
          label: 'ARI',
          value: ari.value.toString(),
          change: ari.change,
          changeLabel: 'vs last week',
        },
        icon: 'trending',
      });
    }

    // 2. RevPAR Analysis
    if (yoyMetrics.revparChange < -5) {
      generatedInsights.push({
        id: 'revpar-alert',
        type: 'alert',
        priority: 'high',
        title: 'RevPAR Decline Detected',
        description: `RevPAR is down ${Math.abs(yoyMetrics.revparChange)}% year-over-year. This could be due to rate compression or occupancy softness. Immediate attention recommended.`,
        action: 'Analyze rate parity, review competitive positioning, and consider tactical promotions',
        metric: {
          label: 'RevPAR YoY',
          value: `${yoyMetrics.revparChange > 0 ? '+' : ''}${yoyMetrics.revparChange}%`,
          change: yoyMetrics.revparChange,
          changeLabel: 'vs last year',
        },
        icon: 'alert',
      });
    } else if (yoyMetrics.revparChange > 10) {
      generatedInsights.push({
        id: 'revpar-growth',
        type: 'performance',
        priority: 'low',
        title: 'Excellent RevPAR Growth',
        description: `RevPAR is up ${yoyMetrics.revparChange}% year-over-year, outperforming last year significantly. Your revenue strategy is delivering strong results.`,
        action: 'Document successful strategies and apply learnings to shoulder periods',
        metric: {
          label: 'RevPAR YoY',
          value: `+${yoyMetrics.revparChange}%`,
          change: yoyMetrics.revparChange,
          changeLabel: 'vs last year',
        },
        icon: 'trending',
      });
    }

    // 3. Demand Forecast Analysis
    if (forecastSummary.next30Days.highDemandDays > 8) {
      generatedInsights.push({
        id: 'high-demand-opportunity',
        type: 'action',
        priority: 'high',
        title: `${forecastSummary.next30Days.highDemandDays} High-Demand Days Ahead`,
        description: `Strong demand expected in the next 30 days. Current OTB is ${forecastSummary.next30Days.avgOtb}% with forecast reaching ${forecastSummary.next30Days.avgForecast}%. Optimize your rate strategy now.`,
        action: 'Close discount rates, increase BAR by 10-15%, and review length-of-stay restrictions',
        metric: {
          label: 'High Demand Days',
          value: forecastSummary.next30Days.highDemandDays.toString(),
          changeLabel: 'next 30 days',
        },
        icon: 'flame',
      });
    }

    if (forecastSummary.next30Days.concernDays > 5) {
      generatedInsights.push({
        id: 'soft-demand-alert',
        type: 'alert',
        priority: 'medium',
        title: 'Soft Demand Periods Identified',
        description: `${forecastSummary.next30Days.concernDays} days in the next month are tracking below last year. Proactive action can help recover this business.`,
        action: 'Launch targeted promotions, reach out to corporate accounts, or create packages',
        metric: {
          label: 'Concern Days',
          value: forecastSummary.next30Days.concernDays.toString(),
          changeLabel: 'below last year pace',
        },
        icon: 'calendar',
      });
    }

    // 4. Segment Performance
    const decliningSegments = segmentData.filter(s => s.yoyChange < -10);
    const growingSegments = segmentData.filter(s => s.yoyChange > 15);

    if (decliningSegments.length > 0) {
      const worstSegment = decliningSegments.sort((a, b) => a.yoyChange - b.yoyChange)[0];
      generatedInsights.push({
        id: 'segment-decline',
        type: 'alert',
        priority: 'medium',
        title: `${worstSegment.segment} Down ${Math.abs(worstSegment.yoyChange)}%`,
        description: `This segment represents ${worstSegment.percentage}% of your business and is showing significant decline. Understanding the cause is crucial.`,
        action: 'Review segment rate competitiveness and reach out to key accounts for feedback',
        metric: {
          label: 'Segment YoY',
          value: `${worstSegment.yoyChange}%`,
          change: worstSegment.yoyChange,
          changeLabel: worstSegment.segment,
        },
        icon: 'users',
      });
    }

    if (growingSegments.length > 0) {
      const bestSegment = growingSegments.sort((a, b) => b.yoyChange - a.yoyChange)[0];
      generatedInsights.push({
        id: 'segment-growth',
        type: 'opportunity',
        priority: 'low',
        title: `${bestSegment.segment} Growing +${bestSegment.yoyChange}%`,
        description: `Strong momentum in this segment. Consider increasing investment in channels that drive this business.`,
        action: 'Allocate more inventory and marketing spend to capitalize on this trend',
        metric: {
          label: 'Segment YoY',
          value: `+${bestSegment.yoyChange}%`,
          change: bestSegment.yoyChange,
          changeLabel: bestSegment.segment,
        },
        icon: 'trending',
      });
    }

    // 5. Channel Mix Optimization
    const directChannels = channelData.filter(c => c.commission === 0);
    const otaChannels = channelData.filter(c => c.commission > 0);
    const directPercentage = directChannels.reduce((sum, c) => sum + c.percentage, 0);
    const totalCommission = otaChannels.reduce((sum, c) => sum + (c.revenue * c.commission / 100), 0);

    if (directPercentage < 35) {
      generatedInsights.push({
        id: 'direct-booking-opportunity',
        type: 'opportunity',
        priority: 'medium',
        title: 'Direct Booking Opportunity',
        description: `Only ${directPercentage}% of bookings come direct. Increasing direct bookings by 5% could save significant commission costs.`,
        action: 'Enhance website UX, offer book-direct incentives, and promote loyalty benefits',
        metric: {
          label: 'Direct Share',
          value: `${directPercentage}%`,
          changeLabel: 'of total bookings',
        },
        icon: 'shield',
      });
    }

    // 6. Rate Optimization Based on Current Occupancy
    if (currentMetrics.occupancy > 85 && ari && ari.value < 100) {
      generatedInsights.push({
        id: 'rate-increase-opportunity',
        type: 'action',
        priority: 'high',
        title: 'Rate Increase Recommended',
        description: `High occupancy (${currentMetrics.occupancy}%) with below-market rates (ARI: ${ari.value}) indicates pricing power. You may be leaving money on the table.`,
        action: 'Increase BAR rates immediately by 5-8% and monitor pickup velocity',
        metric: {
          label: 'Current Occupancy',
          value: `${currentMetrics.occupancy}%`,
          changeLabel: 'ARI: ' + ari.value,
        },
        icon: 'dollar',
      });
    }

    // Ensure we have at least one insight
    if (generatedInsights.length === 0) {
      generatedInsights.push({
        id: 'performance-summary',
        type: 'performance',
        priority: 'low',
        title: 'Revenue Performance On Track',
        description: 'Key metrics are performing within expected ranges. Continue monitoring market conditions and competitive positioning.',
        action: 'Focus on optimizing high-demand periods and maintaining rate parity',
        icon: 'lightbulb',
      });
    }

    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return generatedInsights
      .filter(i => !dismissedInsights.has(i.id))
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }, [currentMetrics, yoyMetrics, benchmarkIndices, segmentData, forecastSummary, channelData, dismissedInsights]);

  const getIconComponent = (icon: Insight['icon']) => {
    switch (icon) {
      case 'trending': return TrendingUp;
      case 'alert': return AlertTriangle;
      case 'target': return Target;
      case 'lightbulb': return Lightbulb;
      case 'calendar': return Calendar;
      case 'users': return Users;
      case 'dollar': return DollarSign;
      case 'flame': return Flame;
      case 'shield': return Shield;
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
        bg: 'from-emerald-500/20 to-teal-500/10',
        border: 'border-emerald-500/30',
        iconBg: 'bg-emerald-500/20',
        iconColor: 'text-emerald-400',
        badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      };
    }
    return {
      bg: 'from-blue-500/20 to-indigo-500/10',
      border: 'border-blue-500/30',
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-400',
      badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
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
      className={`transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
    >
      <div className={`bg-gradient-to-r ${styles.bg} backdrop-blur-xl rounded-2xl border ${styles.border} overflow-hidden shadow-xl`}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg ${styles.iconBg} flex items-center justify-center`}>
              <Sparkles className={`w-4 h-4 ${styles.iconColor}`} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                AI Revenue Insights
                <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-white/10 text-white/70">
                  {insights.length} insight{insights.length > 1 ? 's' : ''}
                </span>
              </h3>
              <p className="text-[11px] text-white/50">Powered by real-time analytics</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Insight Indicators */}
            <div className="flex items-center gap-1 mr-2">
              {insights.slice(0, 5).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveInsightIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === activeInsightIndex % insights.length
                      ? 'bg-white w-4'
                      : 'bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-white/60" />
              ) : (
                <ChevronDown className="w-4 h-4 text-white/60" />
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        {isExpanded && (
          <div className="p-5">
            <div className="flex gap-5">
              {/* Left: Icon and Type */}
              <div className="flex flex-col items-center gap-2">
                <div className={`w-12 h-12 rounded-xl ${styles.iconBg} flex items-center justify-center`}>
                  <IconComponent className={`w-6 h-6 ${styles.iconColor}`} />
                </div>
                <span className={`px-2 py-1 text-[10px] font-medium rounded-full border ${styles.badge}`}>
                  {getTypeLabel(currentInsight.type)}
                </span>
              </div>

              {/* Middle: Content */}
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-semibold text-white mb-2">
                  {currentInsight.title}
                </h4>
                <p className="text-sm text-white/70 leading-relaxed mb-4">
                  {currentInsight.description}
                </p>

                {/* Action Recommendation */}
                <div className="flex items-start gap-2 p-3 bg-white/5 rounded-xl border border-white/10">
                  <Zap className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] font-medium text-amber-400 uppercase tracking-wider mb-1">
                      Recommended Action
                    </p>
                    <p className="text-sm text-white/90">{currentInsight.action}</p>
                  </div>
                </div>
              </div>

              {/* Right: Metric */}
              {currentInsight.metric && (
                <div className="flex flex-col items-end justify-center pl-5 border-l border-white/10">
                  <p className="text-[10px] font-medium text-white/40 uppercase tracking-wider mb-1">
                    {currentInsight.metric.label}
                  </p>
                  <p className={`text-3xl font-bold ${
                    currentInsight.metric.change !== undefined
                      ? currentInsight.metric.change >= 0
                        ? 'text-emerald-400'
                        : 'text-red-400'
                      : 'text-white'
                  }`}>
                    {currentInsight.metric.value}
                  </p>
                  {currentInsight.metric.changeLabel && (
                    <p className="text-[11px] text-white/50 mt-1">
                      {currentInsight.metric.changeLabel}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Footer with navigation and dismiss */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-white/40" />
                <span className="text-[11px] text-white/40">Updated just now</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDismissedInsights(prev => new Set([...prev, currentInsight.id]))}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs text-white/50 hover:text-white/70 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Dismiss
                </button>
                <button
                  onClick={() => setActiveInsightIndex((prev) => (prev + 1) % insights.length)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  Next Insight
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
