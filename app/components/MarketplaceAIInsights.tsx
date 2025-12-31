'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Target,
  Lightbulb,
  ArrowRight,
  X,
  ChevronDown,
  ChevronUp,
  Zap,
  Package,
  DollarSign,
  Clock,
  CheckCircle2,
  ExternalLink,
  BarChart3,
} from 'lucide-react';

interface MarketplaceInsight {
  id: string;
  type: 'recommendation' | 'opportunity' | 'alert' | 'optimization' | 'trend';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action: string;
  relatedAppId?: string;
  potentialImpact?: string;
  dismissed: boolean;
}

interface MarketplaceAIInsightsProps {
  insights: MarketplaceInsight[];
  onDismiss: (id: string) => void;
  onExploreApp?: (appId: string) => void;
}

export default function MarketplaceAIInsights({
  insights,
  onDismiss,
  onExploreApp,
}: MarketplaceAIInsightsProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [activeInsightIndex, setActiveInsightIndex] = useState(0);

  const activeInsights = useMemo(() =>
    insights.filter(i => !i.dismissed),
    [insights]
  );

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isExpanded || activeInsights.length === 0) return;
    const interval = setInterval(() => {
      setActiveInsightIndex((prev) => (prev + 1) % activeInsights.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [isExpanded, activeInsights.length]);

  const getIconComponent = (type: MarketplaceInsight['type']) => {
    switch (type) {
      case 'recommendation': return Target;
      case 'opportunity': return Lightbulb;
      case 'alert': return AlertTriangle;
      case 'optimization': return DollarSign;
      case 'trend': return TrendingUp;
      default: return Sparkles;
    }
  };

  const getPriorityStyles = (priority: MarketplaceInsight['priority'], type: MarketplaceInsight['type']) => {
    if (type === 'alert') {
      return {
        bg: 'from-red-500/20 to-orange-500/10',
        border: 'border-red-500/30',
        iconBg: 'bg-red-500/20',
        iconColor: 'text-red-400',
        badge: 'bg-red-500/20 text-red-300 border-red-500/30',
      };
    }
    if (type === 'recommendation' || priority === 'high') {
      return {
        bg: 'from-indigo-500/20 to-purple-500/10',
        border: 'border-indigo-500/30',
        iconBg: 'bg-indigo-500/20',
        iconColor: 'text-indigo-400',
        badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
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
    if (type === 'optimization') {
      return {
        bg: 'from-amber-500/20 to-orange-500/10',
        border: 'border-amber-500/30',
        iconBg: 'bg-amber-500/20',
        iconColor: 'text-amber-400',
        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      };
    }
    return {
      bg: 'from-cyan-500/20 to-blue-500/10',
      border: 'border-cyan-500/30',
      iconBg: 'bg-cyan-500/20',
      iconColor: 'text-cyan-400',
      badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    };
  };

  const getTypeLabel = (type: MarketplaceInsight['type']) => {
    switch (type) {
      case 'recommendation': return 'Recommended';
      case 'opportunity': return 'Opportunity';
      case 'alert': return 'Alert';
      case 'optimization': return 'Optimize';
      case 'trend': return 'Trending';
    }
  };

  if (activeInsights.length === 0) return null;

  const currentInsight = activeInsights[activeInsightIndex % activeInsights.length];
  const styles = getPriorityStyles(currentInsight.priority, currentInsight.type);
  const IconComponent = getIconComponent(currentInsight.type);

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
                AI Marketplace Advisor
                <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-white/10 text-white/70">
                  {activeInsights.length} insight{activeInsights.length > 1 ? 's' : ''}
                </span>
              </h3>
              <p className="text-[11px] text-white/50">Personalized integration recommendations</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Insight Indicators */}
            <div className="flex items-center gap-1 mr-2">
              {activeInsights.slice(0, 5).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveInsightIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === activeInsightIndex % activeInsights.length
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
                  <div className="flex-1">
                    <p className="text-[10px] font-medium text-amber-400 uppercase tracking-wider mb-1">
                      Recommended Action
                    </p>
                    <p className="text-sm text-white/90">{currentInsight.action}</p>
                  </div>
                  {currentInsight.relatedAppId && onExploreApp && (
                    <button
                      onClick={() => onExploreApp(currentInsight.relatedAppId!)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs text-white transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View App
                    </button>
                  )}
                </div>
              </div>

              {/* Right: Impact */}
              {currentInsight.potentialImpact && (
                <div className="flex flex-col items-end justify-center pl-5 border-l border-white/10">
                  <p className="text-[10px] font-medium text-white/40 uppercase tracking-wider mb-1">
                    Potential Impact
                  </p>
                  <p className="text-lg font-bold text-emerald-400">
                    {currentInsight.potentialImpact}
                  </p>
                </div>
              )}
            </div>

            {/* Footer with navigation and dismiss */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-3.5 h-3.5 text-white/40" />
                <span className="text-[11px] text-white/40">Based on your property profile & industry trends</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onDismiss(currentInsight.id)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs text-white/50 hover:text-white/70 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Dismiss
                </button>
                <button
                  onClick={() => setActiveInsightIndex((prev) => (prev + 1) % activeInsights.length)}
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
