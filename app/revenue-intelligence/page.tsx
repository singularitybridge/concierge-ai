'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  PieChart,
  Calendar,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Building2,
  Users,
  BedDouble,
  Globe,
  AlertTriangle,
  CheckCircle2,
  Target,
  Zap,
  ChevronRight,
  LogOut,
  LineChart,
  Activity,
  Sparkles,
  Bell,
  AlertCircle,
  Info,
  X,
  Lightbulb,
  TrendingUp as Trending,
  Flame,
  Gauge,
  MessageSquare,
  Bot,
  ChevronDown,
  ChevronUp,
  CalendarDays,
  Send,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useRevenueIntelligenceStore } from '../store/revenueIntelligenceStore';

export default function RevenueIntelligenceDashboard() {
  const { isAuthenticated, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiMessages, setAiMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [forecastViewMode, setForecastViewMode] = useState<'chart' | 'table'>('chart');
  const [selectedForecastPeriod, setSelectedForecastPeriod] = useState<'30' | '60' | '90'>('30');
  const [aiContext, setAiContext] = useState<string>('');

  // Helper to open AI panel with context
  const openAiWithContext = (context: string, question?: string) => {
    setAiContext(context);
    setAiPanelOpen(true);
    if (question) {
      setAiQuestion(question);
    }
  };

  const {
    selectedPeriod,
    setSelectedPeriod,
    currentMetrics,
    yoyMetrics,
    benchmarkIndices,
    dailyMetrics,
    segmentData,
    channelData,
    competitorRates,
    rateParity,
    forecastData,
    forecastSummary,
    pickupData,
    smartSummaries,
    compressionCalendar,
    openPricingMatrix,
    rateExplainer,
    alerts,
    budgetData,
    salesPacing,
    acknowledgeAlert,
    refreshData,
  } = useRevenueIntelligenceStore();

  const menuItems = [
    { label: 'Operations', href: '/operations' },
    { label: 'Revenue BI', href: '/revenue-intelligence', active: true },
    { label: 'Employees', href: '/employee-management' },
    { label: 'Staff Portal', href: '/admin/staff' },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatCurrency = (value: number) => `¥${value.toLocaleString()}`;
  const formatPercent = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;

  // Get last 14 days for the trend chart
  const trendData = dailyMetrics.slice(-14);

  // Small Ask AI button component
  const AskAiButton = ({ context, question, size = 'sm' }: { context: string; question?: string; size?: 'sm' | 'xs' }) => (
    <button
      onClick={() => openAiWithContext(context, question)}
      className={`flex items-center gap-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-medium rounded-lg border border-purple-500/30 transition-colors ${
        size === 'xs' ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-1 text-[10px]'
      }`}
      title="Ask AI for insights"
    >
      <Bot className={size === 'xs' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
      <span>Ask AI</span>
    </button>
  );

  // Mini sparkline component
  const Sparkline = ({ data, color }: { data: number[]; color: string }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    return (
      <svg viewBox="0 0 100 30" className="w-20 h-8">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          points={data.map((v, i) => `${(i / (data.length - 1)) * 100},${30 - ((v - min) / range) * 25}`).join(' ')}
        />
      </svg>
    );
  };

  // Index gauge component
  const IndexGauge = ({ value, name }: { value: number; name: string }) => {
    const angle = Math.min(Math.max((value - 70) / 60 * 180, 0), 180) - 90;
    const isGood = value >= 100;

    return (
      <div className="relative w-24 h-12">
        <svg viewBox="0 0 100 50" className="w-full h-full">
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke={isGood ? '#22c55e' : '#ef4444'}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${((value - 70) / 60) * 126} 126`}
          />
          <line
            x1="50"
            y1="50"
            x2="50"
            y2="15"
            stroke="white"
            strokeWidth="2"
            transform={`rotate(${angle}, 50, 50)`}
          />
        </svg>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
          <span className={`text-lg font-bold ${isGood ? 'text-emerald-400' : 'text-red-400'}`}>{value.toFixed(0)}</span>
        </div>
      </div>
    );
  };

  // AI response generator based on actual dashboard data
  const getAiResponse = (question: string, forecast: typeof forecastData, summary: typeof forecastSummary): string => {
    const q = question.toLowerCase();

    // Helper to get top performing segments
    const topSegments = [...segmentData].sort((a, b) => b.revenue - a.revenue).slice(0, 3);
    const growingSegments = segmentData.filter(s => s.yoyChange > 0);
    const decliningSegments = segmentData.filter(s => s.yoyChange < 0);

    // Helper to get channel insights
    const topChannels = [...channelData].sort((a, b) => b.revenue - a.revenue).slice(0, 3);
    const highCommissionChannels = channelData.filter(c => c.commission > 10);
    const directChannel = channelData.find(c => c.channel.toLowerCase().includes('direct'));

    // Helper for competitor insights
    const soldOutCompetitors = competitorRates.filter(c => !c.available);
    const availableCompetitors = competitorRates.filter(c => c.available);
    const avgCompetitorRate = availableCompetitors.length > 0
      ? Math.round(availableCompetitors.reduce((sum, c) => sum + c.rate, 0) / availableCompetitors.length)
      : 0;
    const ourRate = 42500; // Current rate

    // Rate parity issues
    const parityViolations = rateParity.filter(r => r.parity !== 'match');
    const undercuttingChannels = rateParity.filter(r => r.parity === 'lower');

    // Occupancy analysis
    if (q.includes('occupancy') || q.includes('occ ')) {
      const mpi = benchmarkIndices.find(b => b.name === 'MPI')?.value || 100;
      const weekendData = trendData.filter((_, i) => {
        const date = new Date(trendData[i]?.date || '');
        return date.getDay() === 0 || date.getDay() === 6;
      });
      const weekdayData = trendData.filter((_, i) => {
        const date = new Date(trendData[i]?.date || '');
        return date.getDay() !== 0 && date.getDay() !== 6;
      });
      const avgWeekendOcc = weekendData.length > 0 ? Math.round(weekendData.reduce((sum, d) => sum + d.occupancy, 0) / weekendData.length) : 0;
      const avgWeekdayOcc = weekdayData.length > 0 ? Math.round(weekdayData.reduce((sum, d) => sum + d.occupancy, 0) / weekdayData.length) : 0;

      return `Occupancy Analysis:

Current Performance:
• Today's Occupancy: ${currentMetrics.occupancy}%
• YoY Change: ${yoyMetrics.occupancyChange >= 0 ? '+' : ''}${yoyMetrics.occupancyChange}%
• MPI (vs Compset): ${mpi} ${mpi >= 100 ? '✓ Outperforming' : '⚠ Underperforming'}
• 30-Day Forecast: ${summary.next30Days.avgForecast}%

Trend Analysis (Last 14 Days):
• Weekend Avg: ${avgWeekendOcc}%
• Weekday Avg: ${avgWeekdayOcc}%
• Gap: ${avgWeekendOcc - avgWeekdayOcc} pts ${avgWeekendOcc > avgWeekdayOcc ? '(weekend outperforming)' : ''}

${currentMetrics.occupancy > 80 ? '✓ Strong occupancy - focus on rate optimization' : currentMetrics.occupancy > 65 ? '→ Moderate occupancy - balanced approach recommended' : '⚠ Below target - promotional action needed'}

Key Drivers:
• ${topSegments[0]?.segment || 'Leisure'} segment driving ${topSegments[0]?.percentage || 0}% of business
• ${soldOutCompetitors.length} competitors sold out = overflow opportunity
• ${summary.next30Days.highDemandDays} high-demand days in next 30 days

Recommendations:
1. ${currentMetrics.occupancy > 85 ? 'Increase rates - demand supports premium pricing' : avgWeekdayOcc < 60 ? 'Focus midweek promotions to lift weekday occupancy' : 'Maintain current strategy'}
2. ${mpi < 100 ? 'Review distribution strategy - losing share to compset' : 'Maintain rate discipline during high demand'}
3. Target ${decliningSegments[0]?.segment || 'corporate'} segment showing decline`;
    }

    // ADR analysis
    if (q.includes('adr') || q.includes('average daily rate') || q.includes('rate analysis')) {
      const ari = benchmarkIndices.find(b => b.name === 'ARI')?.value || 100;
      const directAdr = directChannel?.adr || currentMetrics.adr;
      const otaChannel = channelData.find(c => c.channel.toLowerCase().includes('booking') || c.channel.toLowerCase().includes('expedia'));
      const otaAdr = otaChannel?.adr || currentMetrics.adr;
      const adrDiff = directAdr - otaAdr;

      return `ADR (Average Daily Rate) Analysis:

Current Performance:
• Current ADR: ¥${currentMetrics.adr.toLocaleString()}
• YoY Change: ${yoyMetrics.adrChange >= 0 ? '+' : ''}${yoyMetrics.adrChange}%
• vs Compset Avg: ¥${avgCompetitorRate.toLocaleString()} (${ourRate > avgCompetitorRate ? '+' : ''}¥${(ourRate - avgCompetitorRate).toLocaleString()})

Rate Position vs Compset:
• ARI (Average Rate Index): ${ari} ${ari >= 100 ? '✓ Outperforming market' : '⚠ Below market'}
• Your Rate: ¥${ourRate.toLocaleString()}
• Competitor Range: ¥${Math.min(...availableCompetitors.map(c => c.rate)).toLocaleString()} - ¥${Math.max(...availableCompetitors.map(c => c.rate)).toLocaleString()}

Channel ADR Comparison:
• Direct: ¥${directAdr.toLocaleString()}
• OTA: ¥${otaAdr.toLocaleString()}
• Difference: ${adrDiff >= 0 ? '+' : ''}¥${adrDiff.toLocaleString()} ${adrDiff > 0 ? '✓ Direct higher' : '⚠ OTA higher'}

Optimization Opportunities:
1. ${soldOutCompetitors.length > 0 ? `${soldOutCompetitors.length} competitors sold out - push rates +10-15%` : 'Monitor compset for sellout opportunities'}
2. ${summary.next30Days.highDemandDays} high-demand days support premium pricing
3. ${adrDiff < 0 ? 'Improve direct channel rate positioning' : 'Maintain direct channel premium'}

Rate Strategy:
• ${ari >= 100 ? 'Maintain premium positioning' : 'Review pricing strategy vs compset'}
• ${parityViolations.length > 0 ? `Address ${parityViolations.length} rate parity issues` : 'Rate parity maintained across channels'}`;
    }

    // RevPAR analysis
    if (q.includes('revpar') || q.includes('revenue per')) {
      return `RevPAR Analysis:

Current Performance:
• RevPAR: ¥${currentMetrics.revpar.toLocaleString()}
• YoY Growth: ${yoyMetrics.revparChange >= 0 ? '+' : ''}${yoyMetrics.revparChange}%
• RGI (Revenue Generation Index): ${benchmarkIndices.find(b => b.name === 'RGI')?.value || 100}

RevPAR Breakdown:
• Occupancy contribution: ${currentMetrics.occupancy}%
• ADR contribution: ¥${currentMetrics.adr.toLocaleString()}
• Formula: ${currentMetrics.occupancy}% × ¥${currentMetrics.adr.toLocaleString()} = ¥${currentMetrics.revpar.toLocaleString()}

Market Position:
${(benchmarkIndices.find(b => b.name === 'RGI')?.value || 100) >= 100
  ? '✓ Outperforming compset - capturing more than fair share'
  : '⚠ Below fair share - review pricing and distribution strategy'}

Growth Levers:
1. Rate optimization on high-demand days (+¥2,000-3,000)
2. Occupancy lift on midweek (-5 rooms/day opportunity)
3. Channel mix improvement (reduce OTA commission)`;
    }

    // Benchmark/Index analysis
    if (q.includes('mpi') || q.includes('ari') || q.includes('rgi') || q.includes('index') || q.includes('benchmark') || q.includes('compset')) {
      return `Competitive Index Analysis:

Current Indices:
${benchmarkIndices.map(b => `• ${b.name}: ${b.value} (${b.value >= 100 ? '✓ Above fair share' : '⚠ Below fair share'})`).join('\n')}

What These Mean:
• MPI (Market Penetration): Your occupancy vs market
• ARI (Average Rate): Your ADR vs market
• RGI (Revenue Generation): Your RevPAR vs market

Index > 100 = Outperforming | Index < 100 = Underperforming

Strategic Implications:
${benchmarkIndices[0]?.value >= 100 && benchmarkIndices[1]?.value >= 100
  ? '✓ Strong position - maintain rate discipline and capture demand'
  : benchmarkIndices[0]?.value >= 100
    ? '→ Good occupancy but rate opportunity exists - push ADR'
    : '⚠ Market share concern - review distribution and pricing'}

Compset Properties:
• Park Hyatt Niseko, Hilton Niseko Village, The Green Leaf
• AYA Niseko, Niseko Northern Resort`;
    }

    // Segment analysis
    if (q.includes('segment') || q.includes('focus') || q.includes('target') || q.includes('transient') || q.includes('corporate') || q.includes('group')) {
      const totalSegmentRevenue = segmentData.reduce((sum, s) => sum + s.revenue, 0);
      const bestPerformer = growingSegments.sort((a, b) => b.yoyChange - a.yoyChange)[0];
      const worstPerformer = decliningSegments.sort((a, b) => a.yoyChange - b.yoyChange)[0];

      return `Segment Analysis & Recommendations:

Current Mix Performance:
${segmentData.slice(0, 5).map(s => `• ${s.segment}: ¥${(s.revenue/1000000).toFixed(1)}M (${s.percentage}%) ${s.yoyChange >= 0 ? '↑' : '↓'}${Math.abs(s.yoyChange)}% YoY`).join('\n')}

Total Revenue: ¥${(totalSegmentRevenue/1000000).toFixed(1)}M

Segment Health Check:
${growingSegments.length > 0 ? `✓ Growing: ${growingSegments.map(s => `${s.segment} (+${s.yoyChange}%)`).join(', ')}` : '⚠ No segments showing YoY growth'}
${decliningSegments.length > 0 ? `⚠ Declining: ${decliningSegments.map(s => `${s.segment} (${s.yoyChange}%)`).join(', ')}` : '✓ All segments stable or growing'}

Top Performer: ${bestPerformer?.segment || 'N/A'} (+${bestPerformer?.yoyChange || 0}% YoY)
Needs Attention: ${worstPerformer?.segment || 'N/A'} (${worstPerformer?.yoyChange || 0}% YoY)

Focus Areas:
1. ${worstPerformer ? `${worstPerformer.segment}: Address ${Math.abs(worstPerformer.yoyChange)}% decline with targeted campaigns` : 'Maintain current segment balance'}
2. ${topSegments[0]?.segment}: Leverage strength (${topSegments[0]?.percentage}% of mix) with premium pricing
3. ${summary.next30Days.concernDays} low-demand days ideal for corporate/group push
4. ${directChannel ? `Direct channel at ¥${(directChannel.revenue/1000000).toFixed(1)}M - grow to reduce OTA dependency` : 'Grow direct bookings'}`;
    }

    // Channel analysis
    if (q.includes('channel') || q.includes('ota') || q.includes('direct') || q.includes('booking.com') || q.includes('expedia') || q.includes('distribution')) {
      const totalChannelRevenue = channelData.reduce((sum, c) => sum + c.revenue, 0);
      const totalCommission = channelData.reduce((sum, c) => sum + (c.revenue * c.commission / 100), 0);
      const otaRevenue = highCommissionChannels.reduce((sum, c) => sum + c.revenue, 0);
      const directRevenue = directChannel?.revenue || 0;
      const otaShare = totalChannelRevenue > 0 ? Math.round((otaRevenue / totalChannelRevenue) * 100) : 0;
      const directShare = totalChannelRevenue > 0 ? Math.round((directRevenue / totalChannelRevenue) * 100) : 0;

      return `Channel Performance Analysis:

Revenue by Channel:
${channelData.slice(0, 5).map(c => `• ${c.channel}: ¥${(c.revenue/1000000).toFixed(1)}M | ADR ¥${c.adr.toLocaleString()} | ${c.commission}% comm | Net ¥${(c.netRevenue/1000000).toFixed(1)}M`).join('\n')}

Channel Mix:
• Direct: ${directShare}% of revenue (¥${(directRevenue/1000000).toFixed(1)}M)
• OTA: ${otaShare}% of revenue (¥${(otaRevenue/1000000).toFixed(1)}M)
• Total Commission Paid: ¥${(totalCommission/1000000).toFixed(1)}M

Channel Efficiency (by Net ADR):
${[...channelData].sort((a, b) => (b.adr * (1 - b.commission/100)) - (a.adr * (1 - a.commission/100))).slice(0, 3).map((c, i) => `${i + 1}. ${c.channel}: ¥${Math.round(c.adr * (1 - c.commission/100)).toLocaleString()} net`).join('\n')}

${parityViolations.length > 0 ? `⚠ Rate Parity Issues: ${undercuttingChannels.map(c => c.channel).join(', ')} undercutting` : '✓ Rate parity maintained'}

Optimization Strategy:
1. ${otaShare > 30 ? `Reduce OTA dependency (currently ${otaShare}%) - target 25%` : 'OTA mix healthy'}
2. ${directShare < 30 ? `Grow direct channel (currently ${directShare}%) - save ¥${Math.round(totalCommission * 0.2 / 1000000)}M in commission` : 'Strong direct share - maintain'}
3. ${parityViolations.length > 0 ? `Address ${parityViolations.length} rate parity violations` : 'Monitor rate parity daily'}
4. Top performer ${topChannels[0]?.channel} driving ¥${(topChannels[0]?.revenue/1000000 || 0).toFixed(1)}M`;
    }

    // Rate parity analysis
    if (q.includes('parity') || q.includes('rate match') || q.includes('undercutting')) {
      return `Rate Parity Analysis:

Current Status:
${rateParity.map(r => `• ${r.channel}: ¥${r.displayedRate.toLocaleString()} ${r.parity === 'match' ? '✓ Match' : r.parity === 'lower' ? `⚠ Under by ¥${Math.abs(r.difference).toLocaleString()}` : `↑ Over by ¥${r.difference.toLocaleString()}`}`).join('\n')}

Parity Violations Found: ${rateParity.filter(r => r.parity !== 'match').length}

Impact Assessment:
• Undercutting erodes direct booking confidence
• Price-sensitive guests will book lowest rate
• Brand value perception affected

Recommended Actions:
1. Contact ${rateParity.filter(r => r.parity === 'lower').map(r => r.channel).join(', ')} about violations
2. Review wholesale/packaging agreements
3. Implement rate monitoring automation
4. Consider closed-user-group rates for direct`;
    }

    // Competitor analysis
    if (q.includes('competitor') || q.includes('competition') || q.includes('park hyatt') || q.includes('hilton')) {
      const cheapestCompetitor = availableCompetitors.sort((a, b) => a.rate - b.rate)[0];
      const premiumCompetitor = availableCompetitors.sort((a, b) => b.rate - a.rate)[0];
      const ourPosition = availableCompetitors.filter(c => c.rate < ourRate).length + 1;

      return `Competitor Analysis:

Current Rates (Tonight):
${competitorRates.map(c => `• ${c.competitor}: ${c.available ? `¥${c.rate.toLocaleString()}` : 'SOLD OUT'}`).join('\n')}
• Your Rate: ¥${ourRate.toLocaleString()}

Market Position:
• Your Position: #${ourPosition} of ${availableCompetitors.length + 1} (by rate)
• vs Market Avg: ${ourRate > avgCompetitorRate ? '+' : ''}¥${(ourRate - avgCompetitorRate).toLocaleString()} (${avgCompetitorRate > 0 ? Math.round((ourRate - avgCompetitorRate) / avgCompetitorRate * 100) : 0}%)
• Rate Spread: ¥${cheapestCompetitor?.rate.toLocaleString() || 'N/A'} - ¥${premiumCompetitor?.rate.toLocaleString() || 'N/A'}

Competitive Intelligence:
${soldOutCompetitors.length > 0 ? `✓ ${soldOutCompetitors.length} competitors SOLD OUT: ${soldOutCompetitors.map(c => c.competitor).join(', ')}` : '• All competitors available'}
${premiumCompetitor ? `• Premium leader: ${premiumCompetitor.competitor} (¥${premiumCompetitor.rate.toLocaleString()})` : ''}
${cheapestCompetitor ? `• Budget option: ${cheapestCompetitor.competitor} (¥${cheapestCompetitor.rate.toLocaleString()})` : ''}

Strategic Response:
1. ${soldOutCompetitors.length > 0 ? `Capture overflow - ${soldOutCompetitors.length} competitors sold out, push rates +10-15%` : 'Monitor for sellout opportunities'}
2. ${ourRate > avgCompetitorRate ? 'Maintain premium positioning with value differentiation' : 'Consider rate increase - below market average'}
3. ${premiumCompetitor && ourRate < premiumCompetitor.rate ? `Gap to ${premiumCompetitor.competitor}: ¥${(premiumCompetitor.rate - ourRate).toLocaleString()} - room to increase` : 'At or near market premium'}
4. Track ${availableCompetitors[0]?.competitor || 'compset'} pace weekly`;
    }

    // Budget analysis
    if (q.includes('budget') || q.includes('actual') || q.includes('variance') || q.includes('target')) {
      return `Budget vs Actual Analysis:

MTD Performance:
${budgetData.filter(b => b.period === 'MTD').map(b => `• ${b.metric}: ${b.variancePercent >= 0 ? '✓' : '⚠'} ${b.variancePercent >= 0 ? '+' : ''}${b.variancePercent}% vs budget`).join('\n')}

YTD Performance:
${budgetData.filter(b => b.period === 'YTD').map(b => `• ${b.metric}: ${b.variancePercent >= 0 ? '✓' : '⚠'} ${b.variancePercent >= 0 ? '+' : ''}${b.variancePercent}% vs budget`).join('\n')}

Key Insights:
${budgetData[0]?.variancePercent >= 0
  ? '✓ Tracking ahead of budget - maintain momentum'
  : '⚠ Behind budget - corrective action needed'}

Forecast to Year-End:
• Current trajectory: ${budgetData[0]?.variancePercent >= 0 ? 'Exceeding' : 'Below'} annual target
• Risk factors: Shoulder season softness, competitor pricing
• Upside: Event periods, direct booking growth`;
    }

    // Pacing analysis
    if (q.includes('pacing') || q.includes('pace') || q.includes('on track')) {
      return `Sales Pacing Analysis:

Current Pacing:
${salesPacing.map(p => `• ${p.period}: ${p.pace}% of target (${p.actual.toLocaleString()}/${p.target.toLocaleString()} room nights)`).join('\n')}

Pacing Assessment:
${salesPacing[0]?.pace >= 100 ? '✓ Ahead of pace - excellent momentum' : salesPacing[0]?.pace >= 90 ? '→ On track - maintain efforts' : '⚠ Behind pace - action required'}

Projections:
${salesPacing.map(p => `• ${p.period}: Projected ${p.projectedFinal.toLocaleString()} (${p.daysRemaining} days remaining)`).join('\n')}

To Get Back on Track:
1. Focus promotional efforts on ${salesPacing.find(p => p.pace < 90)?.period || 'underperforming periods'}
2. Increase direct marketing spend
3. Activate corporate contacts for group bookings`;
    }

    // High demand analysis
    if (q.includes('high demand') || q.includes('jan 15') || q.includes('busy')) {
      const highDemandDays = forecast.filter(d => d.demandLevel === 'very_high' || d.demandLevel === 'high');
      const eventDays = forecast.filter(d => d.events.length > 0).slice(0, 5);
      return `Based on the forecast data, I've identified ${highDemandDays.length} high-demand days in the next 90 days.

Key demand drivers:
${eventDays.map(d => `• ${new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: ${d.events[0]} (${d.demandLevel} demand, ${d.otb}% OTB)`).join('\n')}

The peak season (Dec-Feb) shows strong demand due to:
1. Australian school holidays bringing international skiers
2. Japanese New Year holiday period
3. Sapporo Snow Festival proximity effect
4. Chinese New Year travel surge

Recommendation: Implement minimum stay requirements and premium pricing for these periods.`;
    }

    // Rate strategy
    if (q.includes('rate') || q.includes('pricing') || q.includes('weekend')) {
      const weekendDays = forecast.slice(0, 30).filter(d => {
        const dow = new Date(d.date).getDay();
        return dow === 0 || dow === 5 || dow === 6;
      });
      const avgWeekendOtb = weekendDays.reduce((sum, d) => sum + d.otb, 0) / weekendDays.length;
      const increaseDays = forecast.filter(d => d.rateRecommendation === 'increase').length;

      return `Rate Strategy Analysis (Next 30 Days):

Weekend Performance:
• Average OTB: ${avgWeekendOtb.toFixed(1)}% (${weekendDays.length} weekend days)
• ${increaseDays} days showing rate increase potential

Recommendations:
1. Increase BAR rates by 8-12% for weekends with >75% OTB
2. Apply dynamic premium (+15-20%) during event periods
3. Consider midweek promotions to balance occupancy
4. Monitor competitor Park Hyatt Niseko pricing closely

Current Rate Confidence: ${forecast[0]?.confidenceScore || 87}%`;
    }

    // Segments analysis
    if (q.includes('segment') || q.includes('focus') || q.includes('target')) {
      return `Segment Analysis & Recommendations:

Current Mix Performance:
• Transient Leisure: Strong, driving 35% of revenue. Premium pricing acceptable.
• OTA: 20% share with higher commission costs. Push direct bookings.
• Corporate: Showing 12% YoY decline. Needs attention.
• Group: Opportunity for midweek inventory.

Focus Areas:
1. Corporate Segment: Launch targeted packages for company retreats
2. Direct Bookings: Enhance loyalty program benefits
3. Group Sales: Proactive outreach for February/March
4. Extended Stay: Offer 7+ night discounts for Australian market

The ${summary.next30Days.concernDays} concern days identified are primarily midweek - ideal for corporate push.`;
    }

    // Competitor analysis
    if (q.includes('competitor') || q.includes('compset') || q.includes('competition')) {
      return `Competitor Pricing Analysis:

Current Market Position:
• Your Rate: ¥42,500 (base standard room)
• Compset Average: ¥38,500-45,000 range
• Position: Mid-premium tier

Key Observations:
1. Park Hyatt Niseko dropped rates 15% for upcoming weekend
2. Hilton Niseko Village showing sold-out for Jan 18-20
3. 3 of 5 compset properties showing availability constraints

Strategic Response:
• Do NOT match Park Hyatt discount - maintain value positioning
• Capture overflow from sold-out competitors with slight premium
• Consider value-adds (spa credit, F&B voucher) vs price cuts

Opportunity: ${summary.next30Days.highDemandDays} high-demand days where you can command premium rates.`;
    }

    // Pickup analysis
    if (q.includes('pickup') || q.includes('booking') || q.includes('pace')) {
      const avgOtb = summary.next30Days.avgOtb;
      const avgForecast = summary.next30Days.avgForecast;
      return `Pickup & Booking Pace Analysis:

30-Day Outlook:
• Current Avg OTB: ${avgOtb}%
• Forecast Occupancy: ${avgForecast}%
• Expected Pickup: ${(avgForecast - avgOtb).toFixed(1)} percentage points

Pace Assessment:
${avgOtb > 60 ? '✓ Strong pace - ahead of typical booking curve' : '⚠ Below typical pace - promotional action may be needed'}

Key Insights:
${summary.aiInsights.slice(0, 3).map(i => `• ${i}`).join('\n')}

Booking Window Trend: Average lead time shortened to 14 days - optimize last-minute pricing strategy.`;
    }

    // Default response - comprehensive summary using actual data
    const mpi = benchmarkIndices.find(b => b.name === 'MPI')?.value || 100;
    const ari = benchmarkIndices.find(b => b.name === 'ARI')?.value || 100;
    const rgi = benchmarkIndices.find(b => b.name === 'RGI')?.value || 100;

    return `Here's your Revenue Intelligence Summary:

📊 Current Performance:
• Occupancy: ${currentMetrics.occupancy}% (${yoyMetrics.occupancyChange >= 0 ? '+' : ''}${yoyMetrics.occupancyChange}% YoY)
• ADR: ¥${currentMetrics.adr.toLocaleString()} (${yoyMetrics.adrChange >= 0 ? '+' : ''}${yoyMetrics.adrChange}% YoY)
• RevPAR: ¥${currentMetrics.revpar.toLocaleString()} (${yoyMetrics.revparChange >= 0 ? '+' : ''}${yoyMetrics.revparChange}% YoY)

📈 Competitive Position:
• MPI: ${mpi} ${mpi >= 100 ? '✓' : '⚠'}
• ARI: ${ari} ${ari >= 100 ? '✓' : '⚠'}
• RGI: ${rgi} ${rgi >= 100 ? '✓' : '⚠'}

🔮 30-Day Forecast:
• Avg OTB: ${summary.next30Days.avgOtb}%
• Forecast Occ: ${summary.next30Days.avgForecast}%
• High Demand Days: ${summary.next30Days.highDemandDays}
• Concern Days: ${summary.next30Days.concernDays}

🏨 Market Conditions:
• ${soldOutCompetitors.length} of ${competitorRates.length} competitors sold out
• ${parityViolations.length} rate parity ${parityViolations.length === 1 ? 'issue' : 'issues'}
• Top segment: ${topSegments[0]?.segment || 'N/A'} (${topSegments[0]?.percentage || 0}%)

📅 Upcoming Events:
${summary.keyEvents.slice(0, 3).map(e => `• ${e.name} (${e.expectedImpact})`).join('\n')}

Ask me about:
• "Analyze occupancy" - Detailed occupancy analysis
• "ADR strategy" - Rate optimization recommendations
• "Channel mix" - Distribution analysis
• "Competitor pricing" - Compset analysis
• "Which segments need focus?" - Segment strategy`;
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
      {/* Background */}
      <Image
        src="/hotel3.jpg"
        alt="The 1898 Niseko"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-blue-900/80" />

      {/* Content */}
      <div className={`relative z-10 h-screen flex flex-col transition-opacity duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>

        {/* Top Navigation */}
        <nav className="flex items-center justify-between px-6 py-3 flex-shrink-0 border-b border-white/10">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-medium text-white tracking-wide leading-tight">
                Revenue Intelligence
              </h1>
              <p className="text-[9px] uppercase tracking-[0.2em] text-white/50">Business Analytics</p>
            </div>
          </Link>

          <div className="flex items-center gap-1 bg-white/5 backdrop-blur-md rounded-full px-2 py-1 border border-white/10">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`px-4 py-1.5 rounded-full text-sm transition-all ${
                  item.active
                    ? 'bg-blue-500/20 text-blue-300 font-medium'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* Period Selector */}
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as typeof selectedPeriod)}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-xs text-white cursor-pointer"
              style={{ colorScheme: 'dark' }}
            >
              <option value="today">Today</option>
              <option value="wtd">Week to Date</option>
              <option value="mtd">Month to Date</option>
              <option value="ytd">Year to Date</option>
              <option value="last30">Last 30 Days</option>
              <option value="last90">Last 90 Days</option>
            </select>
            <button
              onClick={refreshData}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Refresh data"
            >
              <RefreshCw className="w-4 h-4 text-white/60" />
            </button>
            <button onClick={logout} className="p-2 hover:bg-white/10 rounded-lg">
              <LogOut className="w-4 h-4 text-white/60" />
            </button>
          </div>
        </nav>

        {/* Main Dashboard */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-[1800px] mx-auto space-y-4">

            {/* Alerts Banner (Actabl-inspired) */}
            {alerts.filter(a => !a.acknowledged && a.severity !== 'info').length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {alerts.filter(a => !a.acknowledged && a.severity !== 'info').map(alert => (
                  <div
                    key={alert.id}
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg border backdrop-blur-xl flex-shrink-0 ${
                      alert.severity === 'critical'
                        ? 'bg-red-500/20 border-red-500/30'
                        : 'bg-amber-500/20 border-amber-500/30'
                    }`}
                  >
                    {alert.severity === 'critical' ? (
                      <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white">{alert.title}</p>
                      <p className="text-[10px] text-white/60 truncate">{alert.message}</p>
                    </div>
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                    >
                      <X className="w-3 h-3 text-white/50" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Top Row - Key Metrics */}
            <div className="grid grid-cols-6 gap-3">
              {/* Occupancy */}
              <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4 group relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white/50">Occupancy</span>
                  <BedDouble className="w-4 h-4 text-blue-400" />
                </div>
                <p className="text-2xl font-bold text-white">{currentMetrics.occupancy}%</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`flex items-center gap-0.5 ${yoyMetrics.occupancyChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {yoyMetrics.occupancyChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    <span className="text-xs">{formatPercent(yoyMetrics.occupancyChange)}</span>
                  </div>
                  <span className="text-[10px] text-white/40">vs LY</span>
                </div>
                <Sparkline data={trendData.map(d => d.occupancy)} color="#3b82f6" />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <AskAiButton context="occupancy" question="Analyze my occupancy performance" size="xs" />
                </div>
              </div>

              {/* ADR */}
              <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4 group relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white/50">ADR</span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-2xl font-bold text-white">{formatCurrency(currentMetrics.adr)}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`flex items-center gap-0.5 ${yoyMetrics.adrChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {yoyMetrics.adrChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    <span className="text-xs">{formatPercent(yoyMetrics.adrChange)}</span>
                  </div>
                  <span className="text-[10px] text-white/40">vs LY</span>
                </div>
                <Sparkline data={trendData.map(d => d.adr)} color="#22c55e" />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <AskAiButton context="adr" question="Analyze my ADR performance" size="xs" />
                </div>
              </div>

              {/* RevPAR */}
              <div className="bg-gradient-to-br from-blue-600/30 to-purple-600/30 backdrop-blur-xl rounded-xl border border-blue-500/30 p-4 group relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white/50">RevPAR</span>
                  <Activity className="w-4 h-4 text-purple-400" />
                </div>
                <p className="text-2xl font-bold text-white">{formatCurrency(currentMetrics.revpar)}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`flex items-center gap-0.5 ${yoyMetrics.revparChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {yoyMetrics.revparChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    <span className="text-xs">{formatPercent(yoyMetrics.revparChange)}</span>
                  </div>
                  <span className="text-[10px] text-white/40">vs LY</span>
                </div>
                <Sparkline data={trendData.map(d => d.revpar)} color="#a855f7" />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <AskAiButton context="revpar" question="Analyze my RevPAR performance" size="xs" />
                </div>
              </div>

              {/* TRevPAR */}
              <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white/50">TRevPAR</span>
                  <BarChart3 className="w-4 h-4 text-amber-400" />
                </div>
                <p className="text-2xl font-bold text-white">{formatCurrency(currentMetrics.trevpar)}</p>
                <p className="text-[10px] text-white/40 mt-1">Total Revenue Per Room</p>
              </div>

              {/* GOPPAR */}
              <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white/50">GOPPAR</span>
                  <Target className="w-4 h-4 text-green-400" />
                </div>
                <p className="text-2xl font-bold text-white">{formatCurrency(currentMetrics.goppar)}</p>
                <p className="text-[10px] text-white/40 mt-1">Gross Operating Profit</p>
              </div>

              {/* Total Revenue */}
              <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white/50">Total Revenue</span>
                  <DollarSign className="w-4 h-4 text-white/40" />
                </div>
                <p className="text-xl font-bold text-white">{formatCurrency(currentMetrics.totalRevenue)}</p>
                <div className={`flex items-center gap-0.5 mt-1 ${yoyMetrics.revenueChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {yoyMetrics.revenueChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span className="text-xs">{formatPercent(yoyMetrics.revenueChange)} vs LY</span>
                </div>
              </div>
            </div>

            {/* Second Row - Benchmark Indices & Performance Trend */}
            <div className="grid grid-cols-12 gap-4">
              {/* Benchmark Indices */}
              <div className="col-span-4 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-white">Competitive Index</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-white/40">vs Compset</span>
                    <AskAiButton context="benchmark" question="Explain my competitive indices" size="xs" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {benchmarkIndices.map((index) => (
                    <div key={index.name} className="text-center">
                      <IndexGauge value={index.value} name={index.name} />
                      <p className="text-xs font-medium text-white mt-2">{index.name}</p>
                      <p className="text-[9px] text-white/40">{index.description.split(' - ')[1]}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-white/10">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-white/40">Index &gt; 100 = Outperforming market</span>
                    <span className="text-emerald-400">Fair Share: 100</span>
                  </div>
                </div>
              </div>

              {/* Performance Trend Chart */}
              <div className="col-span-8 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-white">Performance Trend (14 Days)</h3>
                  <div className="flex items-center gap-4 text-[10px]">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-0.5 bg-blue-400 rounded" />
                      <span className="text-white/50">Occupancy</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-0.5 bg-emerald-400 rounded" />
                      <span className="text-white/50">ADR</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-0.5 bg-purple-400 rounded" />
                      <span className="text-white/50">RevPAR</span>
                    </div>
                  </div>
                </div>
                <div className="h-40 flex items-end gap-1">
                  {trendData.map((day, i) => {
                    const maxRevpar = Math.max(...trendData.map(d => d.revpar));
                    const height = (day.revpar / maxRevpar) * 100;
                    const dayName = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' });
                    const isWeekend = new Date(day.date).getDay() === 0 || new Date(day.date).getDay() === 6;

                    return (
                      <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full flex flex-col items-center gap-0.5" style={{ height: '120px' }}>
                          <div
                            className={`w-full rounded-t ${isWeekend ? 'bg-purple-500/60' : 'bg-blue-500/60'}`}
                            style={{ height: `${height}%` }}
                            title={`${day.date}: ¥${day.revpar.toLocaleString()}`}
                          />
                        </div>
                        <span className="text-[8px] text-white/40">{dayName}</span>
                        <span className="text-[8px] text-white/30">{day.occupancy}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Third Row - Segmentation & Channels */}
            <div className="grid grid-cols-12 gap-4">
              {/* Segment Performance */}
              <div className="col-span-6 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-white">Revenue by Segment</h3>
                  <div className="flex items-center gap-2">
                    <AskAiButton context="segment" question="Which segments need focus?" size="xs" />
                    <PieChart className="w-4 h-4 text-white/40" />
                  </div>
                </div>
                <div className="space-y-2">
                  {segmentData.map((segment, i) => {
                    const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-pink-500', 'bg-cyan-500'];
                    return (
                      <div key={segment.segment} className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${colors[i % colors.length]}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-white truncate">{segment.segment}</span>
                            <span className="text-xs font-medium text-white">{formatCurrency(segment.revenue)}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${colors[i % colors.length]} rounded-full`}
                                style={{ width: `${segment.percentage}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-white/40 w-8">{segment.percentage}%</span>
                            <span className={`text-[10px] ${segment.yoyChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {segment.yoyChange >= 0 ? '+' : ''}{segment.yoyChange}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Channel Mix */}
              <div className="col-span-6 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-white">Channel Performance</h3>
                  <div className="flex items-center gap-2">
                    <AskAiButton context="channel" question="How can I optimize channel mix?" size="xs" />
                    <Globe className="w-4 h-4 text-white/40" />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-white/40 text-left">
                        <th className="pb-2 font-medium">Channel</th>
                        <th className="pb-2 font-medium text-right">Revenue</th>
                        <th className="pb-2 font-medium text-right">ADR</th>
                        <th className="pb-2 font-medium text-right">Comm.</th>
                        <th className="pb-2 font-medium text-right">Net</th>
                      </tr>
                    </thead>
                    <tbody>
                      {channelData.slice(0, 6).map((channel) => (
                        <tr key={channel.channel} className="border-t border-white/5">
                          <td className="py-2 text-white">{channel.channel}</td>
                          <td className="py-2 text-white text-right">{formatCurrency(channel.revenue)}</td>
                          <td className="py-2 text-white/70 text-right">{formatCurrency(channel.adr)}</td>
                          <td className="py-2 text-white/50 text-right">{channel.commission}%</td>
                          <td className="py-2 text-emerald-400 text-right">{formatCurrency(channel.netRevenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Fourth Row - Rate Parity & Competitors */}
            <div className="grid grid-cols-12 gap-4">
              {/* Rate Parity */}
              <div className="col-span-4 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-white">Rate Parity Monitor</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-white/40">Our Rate: ¥42,500</span>
                    <AskAiButton context="parity" question="Analyze rate parity issues" size="xs" />
                  </div>
                </div>
                <div className="space-y-2">
                  {rateParity.map((item) => (
                    <div key={item.channel} className="flex items-center justify-between py-1.5 border-b border-white/5">
                      <span className="text-xs text-white">{item.channel}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-white/70">{formatCurrency(item.displayedRate)}</span>
                        {item.parity === 'match' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : item.parity === 'lower' ? (
                          <div className="flex items-center gap-0.5 text-amber-400">
                            <ArrowDownRight className="w-3 h-3" />
                            <span className="text-[10px]">{formatCurrency(Math.abs(item.difference))}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-0.5 text-red-400">
                            <ArrowUpRight className="w-3 h-3" />
                            <span className="text-[10px]">{formatCurrency(item.difference)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Competitor Rates */}
              <div className="col-span-4 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-white">Competitor Rates</h3>
                  <div className="flex items-center gap-2">
                    <AskAiButton context="competitor" question="Analyze competitor pricing" size="xs" />
                    <Building2 className="w-4 h-4 text-white/40" />
                  </div>
                </div>
                <div className="space-y-2">
                  {competitorRates.map((comp) => (
                    <div key={comp.competitor} className="flex items-center justify-between py-1.5 border-b border-white/5">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${comp.available ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        <span className="text-xs text-white truncate max-w-[140px]">{comp.competitor}</span>
                      </div>
                      <span className={`text-xs ${comp.available ? 'text-white' : 'text-white/40'}`}>
                        {comp.available ? formatCurrency(comp.rate) : 'Sold Out'}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-white/40">Your Rate</span>
                    <span className="text-blue-400 font-medium">¥42,500</span>
                  </div>
                </div>
              </div>

              {/* Pickup Report */}
              <div className="col-span-4 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-white">Pickup Report</h3>
                  <div className="flex items-center gap-2">
                    <AskAiButton context="pickup" question="Analyze booking pickup pace" size="xs" />
                    <Calendar className="w-4 h-4 text-white/40" />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-white/40 text-left">
                        <th className="pb-2 font-medium">Period</th>
                        <th className="pb-2 font-medium text-right">OTB</th>
                        <th className="pb-2 font-medium text-right">vs LY</th>
                        <th className="pb-2 font-medium text-right">7D Pickup</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pickupData.map((pickup) => (
                        <tr key={pickup.label} className="border-t border-white/5">
                          <td className="py-1.5 text-white">{pickup.label}</td>
                          <td className="py-1.5 text-white text-right">{pickup.currentOtb}</td>
                          <td className={`py-1.5 text-right ${pickup.currentOtb >= pickup.lastYearOtb ? 'text-emerald-400' : 'text-red-400'}`}>
                            {pickup.currentOtb >= pickup.lastYearOtb ? '+' : ''}{pickup.currentOtb - pickup.lastYearOtb}
                          </td>
                          <td className={`py-1.5 text-right ${pickup.pickup7Day >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {pickup.pickup7Day >= 0 ? '+' : ''}{pickup.pickup7Day}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Fifth Row - 90-Day Forecast - Enhanced */}
            <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-medium text-white">90-Day Demand Forecast</h3>
                  <div className="flex items-center gap-2">
                    {['30', '60', '90'].map((period) => (
                      <button
                        key={period}
                        onClick={() => setSelectedForecastPeriod(period as '30' | '60' | '90')}
                        className={`px-2 py-0.5 text-[10px] rounded ${
                          selectedForecastPeriod === period
                            ? 'bg-blue-500/30 text-blue-300'
                            : 'bg-white/5 text-white/50 hover:bg-white/10'
                        }`}
                      >
                        {period}D
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-3 text-[10px] mr-3">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-2 bg-blue-500/70 rounded" />
                      <span className="text-white/50">OTB</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-2 bg-emerald-500/50 rounded" />
                      <span className="text-white/50">Pickup</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 border border-amber-500/70 rounded" />
                      <span className="text-white/50">Last Year</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setAiPanelOpen(!aiPanelOpen)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs font-medium rounded-lg border border-purple-500/30 transition-colors"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    Ask AI
                  </button>
                </div>
              </div>

              <div className="p-4">
                {/* Summary Stats */}
                <div className="grid grid-cols-5 gap-3 mb-4">
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <p className="text-[10px] text-white/40 mb-1">Avg OTB ({selectedForecastPeriod}D)</p>
                    <p className="text-lg font-bold text-white">
                      {selectedForecastPeriod === '30' ? forecastSummary.next30Days.avgOtb :
                       selectedForecastPeriod === '60' ? forecastSummary.next60Days.avgOtb :
                       forecastSummary.next90Days.avgOtb}%
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <p className="text-[10px] text-white/40 mb-1">Forecast Occ</p>
                    <p className="text-lg font-bold text-emerald-400">
                      {selectedForecastPeriod === '30' ? forecastSummary.next30Days.avgForecast :
                       selectedForecastPeriod === '60' ? forecastSummary.next60Days.avgForecast :
                       forecastSummary.next90Days.avgForecast}%
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <p className="text-[10px] text-white/40 mb-1">Projected Revenue</p>
                    <p className="text-lg font-bold text-white">
                      ¥{((selectedForecastPeriod === '30' ? forecastSummary.next30Days.totalRevenue :
                         selectedForecastPeriod === '60' ? forecastSummary.next60Days.totalRevenue :
                         forecastSummary.next90Days.totalRevenue) / 1000000).toFixed(0)}M
                    </p>
                  </div>
                  <div className="bg-emerald-500/10 rounded-lg p-3 border border-emerald-500/20">
                    <p className="text-[10px] text-emerald-300/70 mb-1">High Demand Days</p>
                    <p className="text-lg font-bold text-emerald-400">
                      {selectedForecastPeriod === '30' ? forecastSummary.next30Days.highDemandDays :
                       selectedForecastPeriod === '60' ? forecastSummary.next60Days.highDemandDays :
                       forecastSummary.next90Days.highDemandDays}
                    </p>
                  </div>
                  <div className="bg-amber-500/10 rounded-lg p-3 border border-amber-500/20">
                    <p className="text-[10px] text-amber-300/70 mb-1">Concern Days</p>
                    <p className="text-lg font-bold text-amber-400">
                      {selectedForecastPeriod === '30' ? forecastSummary.next30Days.concernDays :
                       selectedForecastPeriod === '60' ? forecastSummary.next60Days.concernDays :
                       forecastSummary.next90Days.concernDays}
                    </p>
                  </div>
                </div>

                {/* Forecast Chart */}
                <div className="h-36 flex items-end gap-0.5 mb-3">
                  {forecastData.slice(0, parseInt(selectedForecastPeriod)).map((day, i) => {
                    const otbHeight = (day.otb / 100) * 100;
                    const pickupHeight = (day.pickup / 100) * 80;
                    const lyHeight = (day.lastYearOccupancy / 100) * 100;
                    const isWeekend = new Date(day.date).getDay() === 0 || new Date(day.date).getDay() === 6;
                    const hasEvent = day.events.length > 0;
                    const demandColor = day.demandLevel === 'very_high' ? 'bg-red-500/80' :
                                       day.demandLevel === 'high' ? 'bg-purple-500/70' :
                                       isWeekend ? 'bg-blue-500/70' : 'bg-blue-500/50';

                    return (
                      <div
                        key={day.date}
                        className="flex-1 flex flex-col justify-end relative group"
                        title={`${day.date}: OTB ${day.otb}% | Forecast ${day.forecastOccupancy}% | LY ${day.lastYearOccupancy}%${day.events.length > 0 ? ` | ${day.events.join(', ')}` : ''}`}
                      >
                        {/* Event marker */}
                        {hasEvent && (
                          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-amber-400 rounded-full" />
                        )}
                        {/* Last year line marker */}
                        <div
                          className="absolute w-full h-0.5 bg-amber-500/50 left-0"
                          style={{ bottom: `${lyHeight}%` }}
                        />
                        {/* Pickup bar */}
                        <div
                          className="w-full bg-emerald-500/40 rounded-t-sm"
                          style={{ height: `${pickupHeight}%` }}
                        />
                        {/* OTB bar */}
                        <div
                          className={`w-full rounded-t-sm ${demandColor}`}
                          style={{ height: `${otbHeight}%` }}
                        />
                        {/* Tooltip on hover */}
                        <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10">
                          <div className="bg-slate-800 rounded-lg p-2 text-[9px] whitespace-nowrap shadow-xl border border-white/20">
                            <p className="font-medium text-white">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                            <p className="text-blue-300">OTB: {day.otb}%</p>
                            <p className="text-emerald-300">Forecast: {day.forecastOccupancy}%</p>
                            <p className="text-amber-300">LY: {day.lastYearOccupancy}%</p>
                            {day.events.length > 0 && (
                              <p className="text-purple-300 mt-1">{day.events[0]}</p>
                            )}
                            <p className={`mt-1 ${day.rateRecommendation === 'increase' ? 'text-emerald-400' : day.rateRecommendation === 'decrease' ? 'text-red-400' : 'text-white/50'}`}>
                              Rate: {day.rateRecommendation.toUpperCase()}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Timeline labels */}
                <div className="flex justify-between text-[9px] text-white/30 mb-4">
                  <span>Today</span>
                  <span>+{Math.round(parseInt(selectedForecastPeriod) / 3)} Days</span>
                  <span>+{Math.round(parseInt(selectedForecastPeriod) * 2 / 3)} Days</span>
                  <span>+{selectedForecastPeriod} Days</span>
                </div>

                {/* Key Events & AI Insights */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Key Events */}
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <CalendarDays className="w-3.5 h-3.5 text-amber-400" />
                      <h4 className="text-xs font-medium text-white">Key Events</h4>
                    </div>
                    <div className="space-y-1.5 max-h-[100px] overflow-y-auto">
                      {forecastSummary.keyEvents.slice(0, 5).map((event, i) => (
                        <div key={i} className="flex items-center justify-between text-[10px]">
                          <div className="flex items-center gap-2">
                            <span className="text-white/40">{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            <span className="text-white">{event.name}</span>
                          </div>
                          <span className="text-emerald-400">{event.expectedImpact}</span>
                        </div>
                      ))}
                      {forecastSummary.keyEvents.length === 0 && (
                        <p className="text-[10px] text-white/40">No major events in selected period</p>
                      )}
                    </div>
                  </div>

                  {/* AI Insights */}
                  <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-lg p-3 border border-purple-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      <h4 className="text-xs font-medium text-white">AI Insights</h4>
                    </div>
                    <div className="space-y-1.5 max-h-[100px] overflow-y-auto">
                      {forecastSummary.aiInsights.map((insight, i) => (
                        <p key={i} className="text-[10px] text-white/70 leading-relaxed">
                          • {insight}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Assistant Panel (Slide-out) */}
            {aiPanelOpen && (
              <div className="fixed inset-y-0 right-0 w-96 bg-slate-900/98 backdrop-blur-xl border-l border-white/20 shadow-2xl z-50 flex flex-col">
                {/* Panel Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-white">Revenue AI Assistant</h3>
                      <p className="text-[10px] text-white/40">Ask about forecasts, trends & recommendations</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setAiPanelOpen(false)}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-white/60" />
                  </button>
                </div>

                {/* Quick Questions */}
                <div className="px-4 py-3 border-b border-white/10">
                  <p className="text-[10px] text-white/40 mb-2">Quick questions:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Why is Jan 15 high demand?',
                      'Rate strategy for weekends?',
                      'Which segments need focus?',
                      'Competitor pricing analysis',
                    ].map((q, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setAiQuestion(q);
                          // Simulate AI response
                          setAiMessages(prev => [
                            ...prev,
                            { role: 'user', content: q },
                            { role: 'assistant', content: getAiResponse(q, forecastData, forecastSummary) }
                          ]);
                          setAiQuestion('');
                        }}
                        className="px-2 py-1 text-[10px] bg-white/5 hover:bg-white/10 text-white/70 rounded-lg border border-white/10 transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {aiMessages.length === 0 && (
                    <div className="text-center py-8">
                      <Bot className="w-12 h-12 text-white/20 mx-auto mb-3" />
                      <p className="text-sm text-white/40">Ask me anything about your</p>
                      <p className="text-sm text-white/40">revenue forecasts and performance</p>
                    </div>
                  )}
                  {aiMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-lg p-3 ${
                          msg.role === 'user'
                            ? 'bg-blue-500/20 border border-blue-500/30'
                            : 'bg-white/5 border border-white/10'
                        }`}
                      >
                        <p className="text-xs text-white/90 whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={aiQuestion}
                      onChange={(e) => setAiQuestion(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && aiQuestion.trim()) {
                          setAiMessages(prev => [
                            ...prev,
                            { role: 'user', content: aiQuestion },
                            { role: 'assistant', content: getAiResponse(aiQuestion, forecastData, forecastSummary) }
                          ]);
                          setAiQuestion('');
                        }
                      }}
                      placeholder="Ask about forecasts, trends, recommendations..."
                      className="flex-1 px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50"
                    />
                    <button
                      onClick={() => {
                        if (aiQuestion.trim()) {
                          setAiMessages(prev => [
                            ...prev,
                            { role: 'user', content: aiQuestion },
                            { role: 'assistant', content: getAiResponse(aiQuestion, forecastData, forecastSummary) }
                          ]);
                          setAiQuestion('');
                        }
                      }}
                      className="p-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Revenue Breakdown */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white/50">Room Revenue</span>
                  <BedDouble className="w-4 h-4 text-blue-400" />
                </div>
                <p className="text-xl font-bold text-white">{formatCurrency(currentMetrics.roomRevenue)}</p>
                <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '70%' }} />
                </div>
                <p className="text-[10px] text-white/40 mt-1">70% of total revenue</p>
              </div>

              <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white/50">F&B Revenue</span>
                  <Zap className="w-4 h-4 text-amber-400" />
                </div>
                <p className="text-xl font-bold text-white">{formatCurrency(currentMetrics.fbRevenue)}</p>
                <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '22%' }} />
                </div>
                <p className="text-[10px] text-white/40 mt-1">22% of total revenue</p>
              </div>

              <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white/50">Other Revenue</span>
                  <Users className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-xl font-bold text-white">{formatCurrency(currentMetrics.otherRevenue)}</p>
                <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '8%' }} />
                </div>
                <p className="text-[10px] text-white/40 mt-1">8% of total revenue (Spa, Parking, etc.)</p>
              </div>
            </div>

            {/* AI Smart Summaries (Lighthouse-inspired) */}
            <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 backdrop-blur-xl rounded-xl border border-purple-500/20 p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-white">AI Smart Summary</h3>
                    <p className="text-[10px] text-white/40">Powered by Generative AI</p>
                  </div>
                </div>
                <span className="text-[10px] text-white/30">Updated just now</span>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {smartSummaries.map(summary => {
                  const categoryColors = {
                    performance: 'border-blue-500/30 bg-blue-500/10',
                    opportunity: 'border-emerald-500/30 bg-emerald-500/10',
                    alert: 'border-red-500/30 bg-red-500/10',
                    trend: 'border-amber-500/30 bg-amber-500/10',
                  };
                  const categoryIcons = {
                    performance: <BarChart3 className="w-4 h-4 text-blue-400" />,
                    opportunity: <Lightbulb className="w-4 h-4 text-emerald-400" />,
                    alert: <AlertTriangle className="w-4 h-4 text-red-400" />,
                    trend: <TrendingUp className="w-4 h-4 text-amber-400" />,
                  };

                  return (
                    <div key={summary.id} className={`rounded-lg border p-3 ${categoryColors[summary.category]}`}>
                      <div className="flex items-center justify-between mb-2">
                        {categoryIcons[summary.category]}
                        {summary.value && (
                          <span className="text-xs font-bold text-white">{summary.value}</span>
                        )}
                      </div>
                      <h4 className="text-xs font-medium text-white mb-1">{summary.title}</h4>
                      <p className="text-[10px] text-white/60 mb-2 line-clamp-2">{summary.insight}</p>
                      {summary.recommendation && (
                        <p className="text-[10px] text-purple-300 italic">→ {summary.recommendation}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Market Compression Calendar & Rate Explainer Row */}
            <div className="grid grid-cols-12 gap-4">
              {/* Market Compression Calendar (Lighthouse-inspired) */}
              <div className="col-span-7 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-white">Market Compression Calendar</h3>
                    <div className="flex items-center gap-2 text-[10px]">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-red-500/70" />
                        <span className="text-white/50">High</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-amber-500/70" />
                        <span className="text-white/50">Medium</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-emerald-500/70" />
                        <span className="text-white/50">Low</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <AskAiButton context="high demand" question="Analyze high demand periods" size="xs" />
                    <Flame className="w-4 h-4 text-white/40" />
                  </div>
                </div>
                <div className="grid grid-cols-14 gap-1">
                  {compressionCalendar.slice(0, 42).map((day, i) => {
                    const levelColors = {
                      high: 'bg-red-500/70 hover:bg-red-500',
                      medium: 'bg-amber-500/70 hover:bg-amber-500',
                      low: 'bg-emerald-500/50 hover:bg-emerald-500',
                      none: 'bg-white/10 hover:bg-white/20',
                    };
                    const date = new Date(day.date);
                    const dayNum = date.getDate();
                    const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                    return (
                      <div
                        key={day.date}
                        className={`aspect-square rounded flex items-center justify-center cursor-pointer transition-colors ${levelColors[day.level]} ${isWeekend ? 'ring-1 ring-white/20' : ''}`}
                        title={`${day.date}: ${day.demandScore}% demand${day.events.length > 0 ? ` - ${day.events.join(', ')}` : ''}`}
                      >
                        <span className="text-[9px] text-white/80">{dayNum}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 flex items-center justify-between text-[10px] text-white/40">
                  <span>Next 6 weeks • Click for details</span>
                  <span>{compressionCalendar.filter(d => d.level === 'high').length} high compression days</span>
                </div>
              </div>

              {/* Rate Explainer (Duetto-inspired) */}
              <div className="col-span-5 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-white">Rate Explainer</h3>
                  <div className="flex items-center gap-2">
                    <AskAiButton context="rate" question="Explain rate recommendations" size="xs" />
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-white/40">Confidence</span>
                      <span className="text-xs font-bold text-emerald-400">{rateExplainer.confidence}%</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between py-1 border-b border-white/10">
                    <span className="text-xs text-white/60">Base Rate</span>
                    <span className="text-xs font-medium text-white">{formatCurrency(rateExplainer.baseRate)}</span>
                  </div>
                  {rateExplainer.adjustments.map((adj, i) => (
                    <div key={i} className="flex items-center justify-between py-1 border-b border-white/5">
                      <div className="flex-1">
                        <p className="text-[10px] text-white">{adj.factor}</p>
                        <p className="text-[9px] text-white/40">{adj.description}</p>
                      </div>
                      <span className={`text-xs font-medium ${adj.impact >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {adj.impact >= 0 ? '+' : ''}{formatCurrency(adj.impact)}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-2 border-t border-white/20">
                    <span className="text-xs font-medium text-white">Recommended Rate</span>
                    <span className="text-lg font-bold text-purple-400">{formatCurrency(rateExplainer.finalRate)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Budget vs Actual & Sales Pacing Row (Actabl-inspired) */}
            <div className="grid grid-cols-12 gap-4">
              {/* Budget vs Actual */}
              <div className="col-span-6 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-white">Budget vs Actual</h3>
                  <div className="flex items-center gap-2">
                    <AskAiButton context="budget" question="How am I tracking vs budget?" size="xs" />
                    <Target className="w-4 h-4 text-white/40" />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-white/40 text-left">
                        <th className="pb-2 font-medium">Period</th>
                        <th className="pb-2 font-medium">Metric</th>
                        <th className="pb-2 font-medium text-right">Budget</th>
                        <th className="pb-2 font-medium text-right">Actual</th>
                        <th className="pb-2 font-medium text-right">Var %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {budgetData.map((item, i) => (
                        <tr key={i} className="border-t border-white/5">
                          <td className="py-1.5 text-white/50">{item.period}</td>
                          <td className="py-1.5 text-white">{item.metric}</td>
                          <td className="py-1.5 text-white/70 text-right">
                            {item.metric === 'Occupancy' ? `${item.budget}%` :
                             item.metric === 'Revenue' ? `¥${(item.budget / 1000000).toFixed(0)}M` :
                             formatCurrency(item.budget)}
                          </td>
                          <td className="py-1.5 text-white text-right">
                            {item.metric === 'Occupancy' ? `${item.actual}%` :
                             item.metric === 'Revenue' ? `¥${(item.actual / 1000000).toFixed(0)}M` :
                             formatCurrency(item.actual)}
                          </td>
                          <td className={`py-1.5 text-right font-medium ${item.variancePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {item.variancePercent >= 0 ? '+' : ''}{item.variancePercent}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sales Pacing (Duetto-inspired) */}
              <div className="col-span-6 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-white">Sales Pacing</h3>
                  <div className="flex items-center gap-2">
                    <AskAiButton context="pacing" question="Am I on track with sales pacing?" size="xs" />
                    <Gauge className="w-4 h-4 text-white/40" />
                  </div>
                </div>
                <div className="space-y-3">
                  {salesPacing.map((pace, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-white">{pace.period}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-white/40">{pace.actual.toLocaleString()} / {pace.target.toLocaleString()}</span>
                          <span className={`text-xs font-bold ${pace.pace >= 100 ? 'text-emerald-400' : pace.pace >= 80 ? 'text-amber-400' : 'text-red-400'}`}>
                            {pace.pace}%
                          </span>
                        </div>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            pace.pace >= 100 ? 'bg-emerald-500' : pace.pace >= 80 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(100, pace.pace)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-0.5 text-[9px] text-white/30">
                        <span>{pace.daysRemaining} days remaining</span>
                        <span>Projected: {pace.projectedFinal.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Open Pricing Matrix (Duetto-inspired) */}
            <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-white">Open Pricing Matrix</h3>
                </div>
                <div className="flex items-center gap-2">
                  <AskAiButton context="rate" question="Recommend optimal pricing strategy" size="xs" />
                  <select className="bg-white/10 border border-white/20 rounded px-2 py-1 text-[10px] text-white" style={{ colorScheme: 'dark' }}>
                    <option value="today">Today</option>
                    <option value="tomorrow">Tomorrow</option>
                    <option value="weekend">This Weekend</option>
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-white/40 text-left">
                      <th className="pb-2 font-medium">Room Type</th>
                      <th className="pb-2 font-medium">Segment</th>
                      <th className="pb-2 font-medium text-right">Base</th>
                      <th className="pb-2 font-medium text-right">Current</th>
                      <th className="pb-2 font-medium text-right">Var</th>
                      <th className="pb-2 font-medium text-right">Recommended</th>
                    </tr>
                  </thead>
                  <tbody>
                    {openPricingMatrix
                      .filter(r => r.channel === 'Direct')
                      .slice(0, 12)
                      .map((rate, i) => (
                        <tr key={i} className="border-t border-white/5">
                          <td className="py-1.5 text-white">{rate.roomType}</td>
                          <td className="py-1.5 text-white/70">{rate.segment}</td>
                          <td className="py-1.5 text-white/50 text-right">{formatCurrency(rate.baseRate)}</td>
                          <td className="py-1.5 text-white text-right">{formatCurrency(rate.currentRate)}</td>
                          <td className={`py-1.5 text-right ${rate.variance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {rate.variance >= 0 ? '+' : ''}{rate.variance}%
                          </td>
                          <td className="py-1.5 text-purple-400 font-medium text-right">{formatCurrency(rate.recommended)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[10px]">
                <span className="text-white/40">Showing Direct channel rates • {openPricingMatrix.length} combinations total</span>
                <button className="text-blue-400 hover:text-blue-300">View Full Matrix →</button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
