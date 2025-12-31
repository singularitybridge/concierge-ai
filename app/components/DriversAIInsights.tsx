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
  Car,
  Users,
  Clock,
  CheckCircle2,
  Plane,
  Timer,
  AlertCircle,
  Fuel,
  MapPin,
  Star,
  Route,
} from 'lucide-react';

interface DriverMetrics {
  totalTripsToday: number;
  completedTripsToday: number;
  pendingTrips: number;
  inProgressTrips: number;
  availableDrivers: number;
  busyDrivers: number;
  offDutyDrivers: number;
  availableVehicles: number;
  inUseVehicles: number;
  maintenanceVehicles: number;
  avgTripDuration: number;
  avgWaitTime: number;
  onTimeRate: number;
  guestSatisfaction: number;
  totalDistanceToday: number;
  fuelCostToday: number;
  revenueToday: number;
  airportTripsToday: number;
  shuttleTripsToday: number;
  vipTripsToday: number;
  deliveriesCompleted: number;
}

interface DriverTrip {
  id: string;
  type: string;
  status: string;
  priority: string;
  driverId?: string;
  scheduledTime: string;
  flightStatus?: string;
}

interface Vehicle {
  id: string;
  status: string;
  fuelLevel: number;
  nextMaintenanceDue: string;
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
  icon: 'trending' | 'alert' | 'target' | 'lightbulb' | 'car' | 'users' | 'clock' | 'check' | 'plane' | 'timer' | 'fuel' | 'map' | 'star' | 'route';
}

interface DriversAIInsightsProps {
  metrics: DriverMetrics;
  trips: DriverTrip[];
  vehicles: Vehicle[];
}

export default function DriversAIInsights({
  metrics,
  trips,
  vehicles,
}: DriversAIInsightsProps) {
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

    // 1. Pending Trips Alert
    if (metrics.pendingTrips > 3) {
      generatedInsights.push({
        id: 'pending-trips',
        type: 'action',
        priority: 'high',
        title: `${metrics.pendingTrips} Trips Awaiting Assignment`,
        description: 'Unassigned trips may lead to delays and guest dissatisfaction. Guests are waiting for confirmation.',
        action: 'Assign available drivers immediately or arrange backup transportation',
        metric: {
          label: 'Pending',
          value: metrics.pendingTrips.toString(),
          changeLabel: 'need drivers',
        },
        icon: 'car',
      });
    }

    // 2. Driver Availability
    const totalDrivers = metrics.availableDrivers + metrics.busyDrivers + metrics.offDutyDrivers;
    const availabilityRate = (metrics.availableDrivers / Math.max(totalDrivers, 1)) * 100;

    if (availabilityRate < 20 && metrics.pendingTrips > 0) {
      generatedInsights.push({
        id: 'low-availability',
        type: 'alert',
        priority: 'high',
        title: 'Critical Driver Shortage',
        description: `Only ${metrics.availableDrivers} driver${metrics.availableDrivers !== 1 ? 's' : ''} available with ${metrics.pendingTrips} pending trips. Service capacity is constrained.`,
        action: 'Call in off-duty drivers or arrange third-party transportation backup',
        metric: {
          label: 'Available',
          value: `${metrics.availableDrivers}/${totalDrivers}`,
          changeLabel: 'drivers',
        },
        icon: 'users',
      });
    }

    // 3. VIP Trips Priority
    const pendingVipTrips = trips.filter(t => t.priority === 'vip' && (t.status === 'pending' || t.status === 'assigned')).length;
    if (pendingVipTrips > 0) {
      generatedInsights.push({
        id: 'vip-trips',
        type: 'action',
        priority: 'high',
        title: `${pendingVipTrips} VIP Transfer${pendingVipTrips > 1 ? 's' : ''} Scheduled`,
        description: 'VIP guests require premium service. Ensure best vehicles and experienced drivers are assigned.',
        action: 'Verify VIP assignments have luxury vehicles and top-rated drivers',
        metric: {
          label: 'VIP Trips',
          value: pendingVipTrips.toString(),
          changeLabel: 'upcoming',
        },
        icon: 'star',
      });
    }

    // 4. Flight Delay Monitoring
    const delayedFlights = trips.filter(t => t.flightStatus === 'delayed' && t.type.includes('airport')).length;
    if (delayedFlights > 0) {
      generatedInsights.push({
        id: 'flight-delays',
        type: 'alert',
        priority: 'medium',
        title: `${delayedFlights} Flight${delayedFlights > 1 ? 's' : ''} Delayed`,
        description: 'Airport pickups affected by flight delays. Drivers should adjust schedules accordingly.',
        action: 'Update pickup times and notify affected drivers to optimize their routes',
        metric: {
          label: 'Delayed',
          value: delayedFlights.toString(),
          changeLabel: 'flights',
        },
        icon: 'plane',
      });
    }

    // 5. On-Time Performance
    if (metrics.onTimeRate < 90) {
      generatedInsights.push({
        id: 'on-time-rate',
        type: 'opportunity',
        priority: 'medium',
        title: 'On-Time Rate Below Target',
        description: `${metrics.onTimeRate}% on-time performance. Guest expectations for punctuality are high.`,
        action: 'Review route planning and add buffer time for busy periods',
        metric: {
          label: 'On-Time',
          value: `${metrics.onTimeRate}%`,
          change: metrics.onTimeRate - 95,
          changeLabel: 'vs target',
        },
        icon: 'timer',
      });
    } else if (metrics.onTimeRate >= 98) {
      generatedInsights.push({
        id: 'excellent-on-time',
        type: 'performance',
        priority: 'low',
        title: 'Excellent Punctuality',
        description: `${metrics.onTimeRate}% on-time rate. Drivers are delivering outstanding service.`,
        action: 'Recognize top performers and share best practices',
        metric: {
          label: 'On-Time',
          value: `${metrics.onTimeRate}%`,
          change: metrics.onTimeRate - 90,
          changeLabel: 'above baseline',
        },
        icon: 'check',
      });
    }

    // 6. Wait Time Analysis
    if (metrics.avgWaitTime > 10) {
      generatedInsights.push({
        id: 'high-wait-time',
        type: 'opportunity',
        priority: 'medium',
        title: 'Average Wait Time High',
        description: `Guests waiting ${metrics.avgWaitTime} minutes on average. Target is under 5 minutes.`,
        action: 'Pre-position drivers during peak arrival times',
        metric: {
          label: 'Avg Wait',
          value: `${metrics.avgWaitTime}min`,
          changeLabel: 'for guests',
        },
        icon: 'clock',
      });
    }

    // 7. Vehicle Maintenance
    const lowFuelVehicles = vehicles.filter(v => v.fuelLevel < 25 && v.status !== 'maintenance').length;
    if (lowFuelVehicles > 0) {
      generatedInsights.push({
        id: 'low-fuel',
        type: 'alert',
        priority: 'medium',
        title: `${lowFuelVehicles} Vehicle${lowFuelVehicles > 1 ? 's' : ''} Low on Fuel`,
        description: 'Vehicles with low fuel may interrupt service. Schedule refueling before next trip.',
        action: 'Direct drivers to refuel during their next available window',
        metric: {
          label: 'Low Fuel',
          value: lowFuelVehicles.toString(),
          changeLabel: 'vehicles',
        },
        icon: 'fuel',
      });
    }

    // 8. Fleet Utilization
    const fleetUtilization = (metrics.inUseVehicles / Math.max(metrics.availableVehicles + metrics.inUseVehicles, 1)) * 100;
    if (fleetUtilization > 90 && metrics.pendingTrips > 2) {
      generatedInsights.push({
        id: 'fleet-capacity',
        type: 'alert',
        priority: 'high',
        title: 'Fleet at Near Capacity',
        description: `${fleetUtilization.toFixed(0)}% of vehicles in use. Limited capacity for new requests.`,
        action: 'Consider partnership with external providers for overflow demand',
        metric: {
          label: 'Utilization',
          value: `${fleetUtilization.toFixed(0)}%`,
          changeLabel: 'fleet capacity',
        },
        icon: 'car',
      });
    }

    // 9. Revenue Opportunity
    if (metrics.completedTripsToday > 15 && metrics.revenueToday > 0) {
      const avgRevPerTrip = metrics.revenueToday / metrics.completedTripsToday;
      generatedInsights.push({
        id: 'revenue-performance',
        type: 'performance',
        priority: 'low',
        title: 'Strong Revenue Day',
        description: `¥${metrics.revenueToday.toLocaleString()} revenue from ${metrics.completedTripsToday} trips. Average ¥${avgRevPerTrip.toFixed(0)} per trip.`,
        action: 'Analyze high-value trips to identify upsell opportunities',
        metric: {
          label: 'Revenue',
          value: `¥${(metrics.revenueToday / 1000).toFixed(0)}K`,
          changeLabel: 'today',
        },
        icon: 'trending',
      });
    }

    // 10. Guest Satisfaction
    if (metrics.guestSatisfaction < 4.5) {
      generatedInsights.push({
        id: 'satisfaction',
        type: 'opportunity',
        priority: 'medium',
        title: 'Guest Satisfaction Needs Attention',
        description: `Current rating is ${metrics.guestSatisfaction}/5.0. Review recent feedback for improvement areas.`,
        action: 'Analyze low ratings and address common complaints',
        metric: {
          label: 'Rating',
          value: `${metrics.guestSatisfaction}/5`,
          change: metrics.guestSatisfaction - 4.5,
          changeLabel: 'vs target',
        },
        icon: 'star',
      });
    }

    // Default insight
    if (generatedInsights.length === 0) {
      generatedInsights.push({
        id: 'on-track',
        type: 'performance',
        priority: 'low',
        title: 'Transportation Running Smoothly',
        description: 'All metrics are within expected ranges. Fleet operations are proceeding efficiently.',
        action: 'Continue monitoring and maintain service excellence',
        icon: 'check',
      });
    }

    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return generatedInsights
      .filter(i => !dismissedInsights.has(i.id))
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }, [metrics, trips, vehicles, dismissedInsights]);

  const getIconComponent = (icon: Insight['icon']) => {
    switch (icon) {
      case 'trending': return TrendingUp;
      case 'alert': return AlertTriangle;
      case 'target': return Target;
      case 'lightbulb': return Lightbulb;
      case 'car': return Car;
      case 'users': return Users;
      case 'clock': return Clock;
      case 'check': return CheckCircle2;
      case 'plane': return Plane;
      case 'timer': return Timer;
      case 'fuel': return Fuel;
      case 'map': return MapPin;
      case 'star': return Star;
      case 'route': return Route;
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
        bg: 'from-cyan-500/20 to-blue-500/10',
        border: 'border-cyan-500/30',
        iconBg: 'bg-cyan-500/20',
        iconColor: 'text-cyan-400',
        badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
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
      className={`transition-all duration-700 ease-out mb-4 ${
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
              AI Fleet Insights
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
