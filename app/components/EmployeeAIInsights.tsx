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
  Clock,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  UserX,
  Timer,
  Award,
} from 'lucide-react';

interface DepartmentMetrics {
  department: string;
  totalStaff: number;
  onDuty: number;
  onBreak: number;
  onLeave: number;
  tasksCompleted: number;
  tasksPending: number;
  avgResponseTime: number;
  satisfactionScore: number;
  overtimeHours: number;
  laborCost: number;
}

interface TimeOffRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: string;
  startDate: string;
  endDate: string;
  status: string;
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
  icon: 'trending' | 'alert' | 'target' | 'lightbulb' | 'calendar' | 'users' | 'clock' | 'check' | 'award' | 'timer';
}

interface EmployeeAIInsightsProps {
  departmentMetrics: DepartmentMetrics[];
  timeOffRequests: TimeOffRequest[];
  totalEmployees: number;
  totalOnDuty: number;
  totalOnBreak: number;
  totalOnLeave: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  urgentTasks: number;
}

export default function EmployeeAIInsights({
  departmentMetrics,
  timeOffRequests,
  totalEmployees,
  totalOnDuty,
  totalOnBreak,
  totalOnLeave,
  totalTasks,
  completedTasks,
  pendingTasks,
  urgentTasks,
}: EmployeeAIInsightsProps) {
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

    // 1. Staffing Level Analysis
    const staffingRate = (totalOnDuty / totalEmployees) * 100;
    if (staffingRate < 60) {
      generatedInsights.push({
        id: 'low-staffing',
        type: 'alert',
        priority: 'high',
        title: 'Low Staffing Levels',
        description: `Only ${staffingRate.toFixed(0)}% of staff are currently on duty. This may impact service quality and response times.`,
        action: 'Consider calling in additional staff or redistributing workload across departments',
        metric: {
          label: 'On Duty',
          value: `${totalOnDuty}/${totalEmployees}`,
          changeLabel: `${staffingRate.toFixed(0)}% capacity`,
        },
        icon: 'users',
      });
    }

    // 2. Pending Time-Off Requests
    const pendingTimeOff = timeOffRequests.filter(r => r.status === 'pending');
    if (pendingTimeOff.length > 3) {
      generatedInsights.push({
        id: 'pending-timeoff',
        type: 'action',
        priority: 'medium',
        title: `${pendingTimeOff.length} Pending Time-Off Requests`,
        description: 'Multiple time-off requests are awaiting approval. Delayed decisions may affect staff morale and scheduling.',
        action: 'Review and process pending requests to ensure adequate coverage planning',
        metric: {
          label: 'Pending',
          value: pendingTimeOff.length.toString(),
          changeLabel: 'requests awaiting',
        },
        icon: 'calendar',
      });
    }

    // 3. Urgent Tasks Analysis
    if (urgentTasks > 0) {
      generatedInsights.push({
        id: 'urgent-tasks',
        type: 'alert',
        priority: 'high',
        title: `${urgentTasks} Urgent Tasks Pending`,
        description: 'High-priority tasks require immediate attention to maintain guest satisfaction and operational efficiency.',
        action: 'Assign available staff to urgent tasks immediately',
        metric: {
          label: 'Urgent',
          value: urgentTasks.toString(),
          changeLabel: 'need attention',
        },
        icon: 'alert',
      });
    }

    // 4. Department Performance Analysis
    const underperformingDepts = departmentMetrics.filter(d => d.satisfactionScore < 85);
    if (underperformingDepts.length > 0) {
      const worstDept = underperformingDepts.sort((a, b) => a.satisfactionScore - b.satisfactionScore)[0];
      generatedInsights.push({
        id: 'dept-performance',
        type: 'opportunity',
        priority: 'medium',
        title: `${worstDept.department} Needs Attention`,
        description: `Satisfaction score of ${worstDept.satisfactionScore}% is below target. ${worstDept.tasksPending} tasks are pending.`,
        action: 'Review staffing levels and task distribution for this department',
        metric: {
          label: 'Satisfaction',
          value: `${worstDept.satisfactionScore}%`,
          change: worstDept.satisfactionScore - 90,
          changeLabel: 'vs target',
        },
        icon: 'trending',
      });
    }

    // 5. Overtime Alert
    const totalOvertime = departmentMetrics.reduce((sum, d) => sum + d.overtimeHours, 0);
    if (totalOvertime > 20) {
      generatedInsights.push({
        id: 'overtime-alert',
        type: 'alert',
        priority: 'medium',
        title: 'High Overtime Hours',
        description: `${totalOvertime} overtime hours this week across all departments. This impacts labor costs and staff well-being.`,
        action: 'Review scheduling to balance workload and consider additional hiring',
        metric: {
          label: 'Overtime',
          value: `${totalOvertime}h`,
          changeLabel: 'this week',
        },
        icon: 'timer',
      });
    }

    // 6. Task Completion Rate
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 100;
    if (completionRate > 85) {
      generatedInsights.push({
        id: 'high-completion',
        type: 'performance',
        priority: 'low',
        title: 'Strong Task Completion',
        description: `${completionRate.toFixed(0)}% of tasks completed. Team is performing above expectations.`,
        action: 'Recognize high performers and share best practices across teams',
        metric: {
          label: 'Completion',
          value: `${completionRate.toFixed(0)}%`,
          change: completionRate - 80,
          changeLabel: 'vs baseline',
        },
        icon: 'check',
      });
    } else if (completionRate < 70) {
      generatedInsights.push({
        id: 'low-completion',
        type: 'alert',
        priority: 'high',
        title: 'Low Task Completion Rate',
        description: `Only ${completionRate.toFixed(0)}% of tasks completed. ${pendingTasks} tasks are still pending.`,
        action: 'Identify bottlenecks and reallocate resources to clear backlog',
        metric: {
          label: 'Completion',
          value: `${completionRate.toFixed(0)}%`,
          change: completionRate - 80,
          changeLabel: 'vs baseline',
        },
        icon: 'alert',
      });
    }

    // 7. Response Time Analysis
    const avgResponseTime = departmentMetrics.reduce((sum, d) => sum + d.avgResponseTime, 0) / departmentMetrics.length;
    if (avgResponseTime > 15) {
      generatedInsights.push({
        id: 'slow-response',
        type: 'opportunity',
        priority: 'medium',
        title: 'Response Times Above Target',
        description: `Average response time is ${avgResponseTime.toFixed(0)} minutes. Guest expectations are typically under 10 minutes.`,
        action: 'Optimize task routing and ensure adequate staffing during peak hours',
        metric: {
          label: 'Avg Response',
          value: `${avgResponseTime.toFixed(0)}min`,
          changeLabel: 'across departments',
        },
        icon: 'clock',
      });
    }

    // Default insight if none generated
    if (generatedInsights.length === 0) {
      generatedInsights.push({
        id: 'all-good',
        type: 'performance',
        priority: 'low',
        title: 'Operations Running Smoothly',
        description: 'All key metrics are within expected ranges. Staff performance is on track.',
        action: 'Continue monitoring and maintain current strategies',
        icon: 'check',
      });
    }

    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return generatedInsights
      .filter(i => !dismissedInsights.has(i.id))
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }, [departmentMetrics, timeOffRequests, totalEmployees, totalOnDuty, totalTasks, completedTasks, pendingTasks, urgentTasks, dismissedInsights]);

  const getIconComponent = (icon: Insight['icon']) => {
    switch (icon) {
      case 'trending': return TrendingUp;
      case 'alert': return AlertTriangle;
      case 'target': return Target;
      case 'lightbulb': return Lightbulb;
      case 'calendar': return Calendar;
      case 'users': return Users;
      case 'clock': return Clock;
      case 'check': return CheckCircle2;
      case 'award': return Award;
      case 'timer': return Timer;
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
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-lg ${styles.iconBg} flex items-center justify-center`}>
              <Sparkles className={`w-3.5 h-3.5 ${styles.iconColor}`} />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-white flex items-center gap-2">
                AI Staff Insights
                <span className="px-1.5 py-0.5 text-[9px] font-medium rounded-full bg-white/10 text-white/70">
                  {insights.length}
                </span>
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 mr-2">
              {insights.slice(0, 5).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveInsightIndex(idx)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    idx === activeInsightIndex % insights.length
                      ? 'bg-white w-3'
                      : 'bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              {isExpanded ? (
                <ChevronUp className="w-3.5 h-3.5 text-white/60" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-white/60" />
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        {isExpanded && (
          <div className="p-4">
            <div className="flex gap-4">
              {/* Left: Icon and Type */}
              <div className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-xl ${styles.iconBg} flex items-center justify-center`}>
                  <IconComponent className={`w-5 h-5 ${styles.iconColor}`} />
                </div>
                <span className={`px-1.5 py-0.5 text-[9px] font-medium rounded-full border ${styles.badge}`}>
                  {getTypeLabel(currentInsight.type)}
                </span>
              </div>

              {/* Middle: Content */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-white mb-1">
                  {currentInsight.title}
                </h4>
                <p className="text-xs text-white/70 leading-relaxed mb-3">
                  {currentInsight.description}
                </p>

                {/* Action Recommendation */}
                <div className="flex items-start gap-2 p-2 bg-white/5 rounded-lg border border-white/10">
                  <Zap className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[9px] font-medium text-amber-400 uppercase tracking-wider mb-0.5">
                      Recommended Action
                    </p>
                    <p className="text-xs text-white/90">{currentInsight.action}</p>
                  </div>
                </div>
              </div>

              {/* Right: Metric */}
              {currentInsight.metric && (
                <div className="flex flex-col items-end justify-center pl-4 border-l border-white/10">
                  <p className="text-[9px] font-medium text-white/40 uppercase tracking-wider mb-0.5">
                    {currentInsight.metric.label}
                  </p>
                  <p className={`text-2xl font-bold ${
                    currentInsight.metric.change !== undefined
                      ? currentInsight.metric.change >= 0
                        ? 'text-emerald-400'
                        : 'text-red-400'
                      : 'text-white'
                  }`}>
                    {currentInsight.metric.value}
                  </p>
                  {currentInsight.metric.changeLabel && (
                    <p className="text-[10px] text-white/50 mt-0.5">
                      {currentInsight.metric.changeLabel}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3 text-white/40" />
                <span className="text-[10px] text-white/40">Updated just now</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDismissedInsights(prev => new Set([...prev, currentInsight.id]))}
                  className="flex items-center gap-1 px-2 py-1 text-[10px] text-white/50 hover:text-white/70 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X className="w-3 h-3" />
                  Dismiss
                </button>
                <button
                  onClick={() => setActiveInsightIndex((prev) => (prev + 1) % insights.length)}
                  className="flex items-center gap-1 px-2 py-1 text-[10px] text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  Next
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
