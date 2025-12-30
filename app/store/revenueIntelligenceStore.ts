import { create } from 'zustand';

// Types
export interface DailyMetrics {
  date: string;
  occupancy: number;
  adr: number;
  revpar: number;
  roomsSold: number;
  roomsAvailable: number;
  revenue: number;
  compsetOccupancy: number;
  compsetAdr: number;
  compsetRevpar: number;
}

// Lighthouse-inspired: AI Smart Summary
export interface SmartSummary {
  id: string;
  timestamp: string;
  category: 'performance' | 'opportunity' | 'alert' | 'trend';
  priority: 'high' | 'medium' | 'low';
  title: string;
  insight: string;
  metric?: string;
  value?: string;
  recommendation?: string;
}

// Lighthouse-inspired: Market Compression
export interface CompressionDay {
  date: string;
  level: 'high' | 'medium' | 'low' | 'none';
  demandScore: number; // 0-100
  events: string[];
  compsetAvailability: number; // % of compset with availability
}

// Duetto-inspired: Open Pricing Matrix
export interface OpenPricingRate {
  roomType: string;
  segment: string;
  channel: string;
  baseRate: number;
  currentRate: number;
  variance: number; // % difference from base
  recommended: number;
  lastUpdated: string;
}

// Duetto-inspired: Rate Explainer
export interface RateExplainer {
  date: string;
  baseRate: number;
  adjustments: {
    factor: string;
    impact: number;
    description: string;
  }[];
  finalRate: number;
  confidence: number; // 0-100
}

// Actabl-inspired: Alerts System
export interface Alert {
  id: string;
  timestamp: string;
  type: 'rate_parity' | 'competitor' | 'pickup' | 'forecast' | 'budget' | 'compression';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  actionUrl?: string;
  acknowledged: boolean;
}

// Actabl-inspired: Budget Tracking
export interface BudgetData {
  period: string;
  metric: string;
  budget: number;
  actual: number;
  variance: number;
  variancePercent: number;
}

// Sales Pacing (Duetto/Actabl)
export interface SalesPacing {
  period: string;
  target: number;
  actual: number;
  pace: number; // % of target
  daysRemaining: number;
  projectedFinal: number;
}

export interface SegmentData {
  segment: string;
  revenue: number;
  roomNights: number;
  adr: number;
  percentage: number;
  yoyChange: number;
}

export interface ChannelData {
  channel: string;
  revenue: number;
  bookings: number;
  adr: number;
  percentage: number;
  commission: number;
  netRevenue: number;
}

export interface CompetitorRate {
  competitor: string;
  rate: number;
  available: boolean;
  lastUpdated: string;
}

export interface RateParityData {
  channel: string;
  ourRate: number;
  displayedRate: number;
  parity: 'match' | 'higher' | 'lower';
  difference: number;
}

export interface ForecastData {
  date: string;
  forecastOccupancy: number;
  forecastRevenue: number;
  forecastAdr: number;
  otb: number; // On The Books
  pickup: number;
  remainingToSell: number;
  lastYearOccupancy: number;
  events: string[];
  demandLevel: 'very_high' | 'high' | 'medium' | 'low';
  rateRecommendation: 'increase' | 'hold' | 'decrease';
  confidenceScore: number; // 0-100
}

export interface ForecastSummary {
  next30Days: {
    avgOtb: number;
    avgForecast: number;
    totalRevenue: number;
    highDemandDays: number;
    concernDays: number; // Days significantly below last year
  };
  next60Days: {
    avgOtb: number;
    avgForecast: number;
    totalRevenue: number;
    highDemandDays: number;
    concernDays: number;
  };
  next90Days: {
    avgOtb: number;
    avgForecast: number;
    totalRevenue: number;
    highDemandDays: number;
    concernDays: number;
  };
  keyEvents: { date: string; name: string; expectedImpact: string }[];
  aiInsights: string[];
}

export interface PickupData {
  daysOut: number;
  label: string;
  currentOtb: number;
  lastYearOtb: number;
  lastWeekOtb: number;
  pickup7Day: number;
  pickup30Day: number;
}

export interface BenchmarkIndex {
  name: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
  description: string;
}

export interface RevenueIntelligenceState {
  // Time period
  selectedPeriod: 'today' | 'wtd' | 'mtd' | 'ytd' | 'last30' | 'last90';
  selectedDate: string;

  // Core metrics
  currentMetrics: {
    occupancy: number;
    adr: number;
    revpar: number;
    trevpar: number;
    goppar: number;
    totalRevenue: number;
    roomRevenue: number;
    fbRevenue: number;
    otherRevenue: number;
  };

  // YoY comparison
  yoyMetrics: {
    occupancyChange: number;
    adrChange: number;
    revparChange: number;
    revenueChange: number;
  };

  // Benchmark indices
  benchmarkIndices: BenchmarkIndex[];

  // Historical data (last 30 days)
  dailyMetrics: DailyMetrics[];

  // Segmentation
  segmentData: SegmentData[];
  channelData: ChannelData[];

  // Competitor rates
  competitorRates: CompetitorRate[];
  rateParity: RateParityData[];

  // Forecast & Pickup
  forecastData: ForecastData[];
  forecastSummary: ForecastSummary;
  pickupData: PickupData[];

  // Lighthouse-inspired: AI Smart Summaries
  smartSummaries: SmartSummary[];

  // Lighthouse-inspired: Market Compression Calendar
  compressionCalendar: CompressionDay[];

  // Duetto-inspired: Open Pricing Matrix
  openPricingMatrix: OpenPricingRate[];

  // Duetto-inspired: Rate Explainer
  rateExplainer: RateExplainer;

  // Actabl-inspired: Alerts
  alerts: Alert[];

  // Actabl-inspired: Budget Tracking
  budgetData: BudgetData[];

  // Sales Pacing
  salesPacing: SalesPacing[];

  // Actions
  setSelectedPeriod: (period: RevenueIntelligenceState['selectedPeriod']) => void;
  setSelectedDate: (date: string) => void;
  acknowledgeAlert: (alertId: string) => void;
  refreshData: () => void;
}

// Generate mock daily metrics
const generateDailyMetrics = (): DailyMetrics[] => {
  const metrics: DailyMetrics[] = [];
  const today = new Date();

  for (let i = 30; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    // Generate realistic occupancy based on day of week
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;
    const baseOccupancy = isWeekend ? 85 : 70;
    const occupancy = Math.min(98, Math.max(50, baseOccupancy + (Math.random() - 0.5) * 20));

    // ADR varies with occupancy (higher demand = higher rates)
    const baseAdr = 42000; // yen
    const adr = baseAdr + (occupancy - 70) * 500 + (Math.random() - 0.5) * 5000;

    const roomsAvailable = 275;
    const roomsSold = Math.round(roomsAvailable * (occupancy / 100));
    const revenue = roomsSold * adr;
    const revpar = revenue / roomsAvailable;

    // Compset data (slightly different performance)
    const compsetOccupancy = occupancy + (Math.random() - 0.5) * 10;
    const compsetAdr = adr * (0.9 + Math.random() * 0.2);
    const compsetRevpar = compsetOccupancy * compsetAdr / 100;

    metrics.push({
      date: dateStr,
      occupancy: Math.round(occupancy * 10) / 10,
      adr: Math.round(adr),
      revpar: Math.round(revpar),
      roomsSold,
      roomsAvailable,
      revenue: Math.round(revenue),
      compsetOccupancy: Math.round(compsetOccupancy * 10) / 10,
      compsetAdr: Math.round(compsetAdr),
      compsetRevpar: Math.round(compsetRevpar),
    });
  }

  return metrics;
};

// Generate segment data
const generateSegmentData = (): SegmentData[] => {
  const segments = [
    { segment: 'Transient - Leisure', base: 35, adr: 45000 },
    { segment: 'Transient - Business', base: 25, adr: 48000 },
    { segment: 'OTA', base: 20, adr: 40000 },
    { segment: 'Group', base: 10, adr: 38000 },
    { segment: 'Corporate Contract', base: 7, adr: 42000 },
    { segment: 'Wholesale', base: 3, adr: 35000 },
  ];

  const totalRoomNights = 6500; // Monthly room nights

  return segments.map(s => {
    const roomNights = Math.round(totalRoomNights * (s.base / 100) * (0.9 + Math.random() * 0.2));
    const adr = s.adr * (0.95 + Math.random() * 0.1);
    const revenue = roomNights * adr;

    return {
      segment: s.segment,
      revenue: Math.round(revenue),
      roomNights,
      adr: Math.round(adr),
      percentage: s.base,
      yoyChange: Math.round((Math.random() - 0.4) * 20 * 10) / 10,
    };
  });
};

// Generate channel data
const generateChannelData = (): ChannelData[] => {
  const channels = [
    { channel: 'Direct - Website', base: 30, commission: 0 },
    { channel: 'Booking.com', base: 22, commission: 15 },
    { channel: 'Expedia', base: 15, commission: 18 },
    { channel: 'Agoda', base: 10, commission: 17 },
    { channel: 'Direct - Phone', base: 8, commission: 0 },
    { channel: 'GDS', base: 8, commission: 10 },
    { channel: 'Rakuten Travel', base: 5, commission: 12 },
    { channel: 'Other', base: 2, commission: 15 },
  ];

  const totalBookings = 850; // Monthly bookings

  return channels.map(c => {
    const bookings = Math.round(totalBookings * (c.base / 100) * (0.9 + Math.random() * 0.2));
    const avgNights = 1.5 + Math.random() * 0.5;
    const adr = 42000 * (c.commission === 0 ? 1.05 : 0.98); // Direct tends to have higher ADR
    const revenue = bookings * avgNights * adr;
    const commissionAmount = revenue * (c.commission / 100);

    return {
      channel: c.channel,
      revenue: Math.round(revenue),
      bookings,
      adr: Math.round(adr),
      percentage: c.base,
      commission: c.commission,
      netRevenue: Math.round(revenue - commissionAmount),
    };
  });
};

// Generate competitor rates
const generateCompetitorRates = (): CompetitorRate[] => {
  const competitors = [
    'Park Hyatt Niseko',
    'Hilton Niseko Village',
    'The Green Leaf',
    'Niseko Northern Resort',
    'AYA Niseko',
  ];

  const baseRate = 45000;
  const now = new Date().toISOString();

  return competitors.map(competitor => ({
    competitor,
    rate: Math.round(baseRate * (0.85 + Math.random() * 0.35)),
    available: Math.random() > 0.1,
    lastUpdated: now,
  }));
};

// Generate rate parity data
const generateRateParity = (): RateParityData[] => {
  const ourRate = 42500;
  const channels = [
    'Booking.com',
    'Expedia',
    'Agoda',
    'Hotels.com',
    'Trip.com',
    'Rakuten Travel',
  ];

  return channels.map(channel => {
    const variance = (Math.random() - 0.5) * 0.1; // -5% to +5%
    const displayedRate = Math.round(ourRate * (1 + variance));
    const difference = displayedRate - ourRate;

    return {
      channel,
      ourRate,
      displayedRate,
      parity: difference === 0 ? 'match' : difference > 0 ? 'higher' : 'lower',
      difference,
    };
  });
};

// Niseko ski season events calendar
const getNisekoEvents = (date: Date): string[] => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayOfWeek = date.getDay();
  const events: string[] = [];

  // Major holidays and events
  if (month === 12 && day >= 23 && day <= 31) events.push('Christmas/Year-End');
  if (month === 1 && day >= 1 && day <= 3) events.push('New Year Holiday');
  if (month === 1 && day >= 10 && day <= 12) events.push('Coming of Age Day');
  if (month === 1 && day >= 20 && day <= 28) events.push('Chinese New Year');
  if (month === 2 && day >= 5 && day <= 11) events.push('Sapporo Snow Festival');
  if (month === 2 && day === 11) events.push('National Foundation Day');
  if (month === 2 && day === 23) events.push("Emperor's Birthday");
  if (month === 3 && day >= 18 && day <= 22) events.push('Spring Equinox Weekend');

  // Ski competition season
  if (month === 1 && day >= 15 && day <= 17) events.push('FIS Ski Cup Niseko');
  if (month === 2 && day >= 1 && day <= 3) events.push('Niseko Classic Race');

  // School holidays (Australian summer)
  if (month === 12 || month === 1) events.push('Australian School Holidays');

  return events;
};

// Generate forecast data with realistic Niseko ski season patterns
const generateForecastData = (): ForecastData[] => {
  const forecast: ForecastData[] = [];
  const today = new Date();

  for (let i = 0; i < 90; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];

    const month = date.getMonth() + 1;
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0;

    // Get events for this date
    const events = getNisekoEvents(date);
    const hasEvents = events.length > 0;

    // Niseko ski season seasonality (peak: Dec-Feb, shoulder: Mar, off-peak: Apr onwards)
    let seasonalityFactor = 1.0;
    if (month === 12 || month === 1 || month === 2) {
      seasonalityFactor = 1.25; // Peak ski season
    } else if (month === 3) {
      seasonalityFactor = 1.0; // Spring skiing
    } else if (month === 4) {
      seasonalityFactor = 0.6; // Season wind-down
    } else {
      seasonalityFactor = 0.4; // Off-season
    }

    // Base OTB with decay for further out dates
    const baseOtb = isWeekend ? 78 : 58;
    const otbDecay = Math.max(0.15, 1 - (i / 100));
    const eventBoost = hasEvents ? 1.15 : 1.0;

    let otb = Math.round(baseOtb * otbDecay * seasonalityFactor * eventBoost * (0.85 + Math.random() * 0.3));
    otb = Math.min(95, Math.max(15, otb));

    // Last year comparison (similar pattern with slight variance)
    const lastYearOccupancy = Math.min(98, Math.max(20, otb + (Math.random() - 0.5) * 15));

    // Forecast includes expected pickup
    const pickupExpectation = i < 7 ? 8 : i < 14 ? 12 : i < 30 ? 18 : i < 60 ? 22 : 25;
    const forecastOccupancy = Math.min(98, otb + pickupExpectation * (0.7 + Math.random() * 0.6));

    // ADR increases with demand
    const baseAdr = 42000;
    const demandAdrPremium = (forecastOccupancy - 60) * 450;
    const seasonalAdrPremium = (seasonalityFactor - 0.4) * 8000;
    const eventAdrPremium = hasEvents ? 5000 : 0;
    const adr = baseAdr + demandAdrPremium + seasonalAdrPremium + eventAdrPremium;

    const forecastRevenue = 275 * forecastOccupancy / 100 * adr;
    const pickup = Math.round(forecastOccupancy - otb);

    // Determine demand level
    let demandLevel: 'very_high' | 'high' | 'medium' | 'low';
    if (forecastOccupancy >= 90) demandLevel = 'very_high';
    else if (forecastOccupancy >= 75) demandLevel = 'high';
    else if (forecastOccupancy >= 55) demandLevel = 'medium';
    else demandLevel = 'low';

    // Rate recommendation based on pickup pace and demand
    let rateRecommendation: 'increase' | 'hold' | 'decrease';
    const vsLastYear = otb - lastYearOccupancy;
    if (otb > 85 || (vsLastYear > 10 && demandLevel !== 'low')) {
      rateRecommendation = 'increase';
    } else if (vsLastYear < -10 || demandLevel === 'low') {
      rateRecommendation = 'decrease';
    } else {
      rateRecommendation = 'hold';
    }

    // Confidence decreases for dates further out
    const confidenceScore = Math.round(Math.max(40, 95 - i * 0.6));

    forecast.push({
      date: dateStr,
      forecastOccupancy: Math.round(forecastOccupancy * 10) / 10,
      forecastRevenue: Math.round(forecastRevenue),
      forecastAdr: Math.round(adr),
      otb,
      pickup,
      remainingToSell: Math.round(275 * (100 - otb) / 100),
      lastYearOccupancy: Math.round(lastYearOccupancy * 10) / 10,
      events,
      demandLevel,
      rateRecommendation,
      confidenceScore,
    });
  }

  return forecast;
};

// Generate forecast summary with AI insights
const generateForecastSummary = (forecastData: ForecastData[]): ForecastSummary => {
  const next30 = forecastData.slice(0, 30);
  const next60 = forecastData.slice(0, 60);
  const next90 = forecastData;

  const calculatePeriodStats = (data: ForecastData[]) => ({
    avgOtb: Math.round(data.reduce((sum, d) => sum + d.otb, 0) / data.length * 10) / 10,
    avgForecast: Math.round(data.reduce((sum, d) => sum + d.forecastOccupancy, 0) / data.length * 10) / 10,
    totalRevenue: Math.round(data.reduce((sum, d) => sum + d.forecastRevenue, 0)),
    highDemandDays: data.filter(d => d.demandLevel === 'very_high' || d.demandLevel === 'high').length,
    concernDays: data.filter(d => d.otb < d.lastYearOccupancy - 10).length,
  });

  // Extract key events
  const eventDates = forecastData
    .filter(d => d.events.length > 0)
    .slice(0, 8)
    .map(d => ({
      date: d.date,
      name: d.events[0],
      expectedImpact: d.demandLevel === 'very_high' ? '+15-20% RevPAR' :
                      d.demandLevel === 'high' ? '+8-12% RevPAR' : '+3-5% RevPAR',
    }));

  // Generate AI insights based on the data
  const avgOtb30 = next30.reduce((sum, d) => sum + d.otb, 0) / 30;
  const avgLY30 = next30.reduce((sum, d) => sum + d.lastYearOccupancy, 0) / 30;
  const lowDemandWeekdays = next30.filter(d => {
    const dow = new Date(d.date).getDay();
    return dow >= 1 && dow <= 4 && d.demandLevel === 'low';
  }).length;
  const highDemandWeekends = next30.filter(d => {
    const dow = new Date(d.date).getDay();
    return (dow === 0 || dow === 5 || dow === 6) && d.forecastOccupancy > 85;
  }).length;
  const increaseDays = forecastData.filter(d => d.rateRecommendation === 'increase').length;

  const aiInsights: string[] = [];

  if (avgOtb30 > avgLY30 + 5) {
    aiInsights.push(`Strong booking pace: OTB running ${(avgOtb30 - avgLY30).toFixed(1)}% ahead of last year for next 30 days.`);
  } else if (avgOtb30 < avgLY30 - 5) {
    aiInsights.push(`Booking pace concern: OTB running ${(avgLY30 - avgOtb30).toFixed(1)}% behind last year. Consider promotional push.`);
  }

  if (lowDemandWeekdays > 8) {
    aiInsights.push(`Midweek softness: ${lowDemandWeekdays} low-demand weekdays in next 30 days. Corporate rate push recommended.`);
  }

  if (highDemandWeekends >= 6) {
    aiInsights.push(`Weekend strength: ${highDemandWeekends} high-occupancy weekends ahead. Optimize BAR rates for revenue maximization.`);
  }

  if (increaseDays > 30) {
    aiInsights.push(`Rate opportunity: ${increaseDays} days showing rate increase potential based on demand signals.`);
  }

  const eventImpact = eventDates.filter(e => e.expectedImpact.includes('15-20')).length;
  if (eventImpact > 0) {
    aiInsights.push(`${eventImpact} major event period(s) approaching. Ensure premium pricing and minimum stay restrictions.`);
  }

  // Add default insight if none generated
  if (aiInsights.length === 0) {
    aiInsights.push('Forecast trending in line with expectations. Continue monitoring pickup pace and competitor movements.');
  }

  return {
    next30Days: calculatePeriodStats(next30),
    next60Days: calculatePeriodStats(next60),
    next90Days: calculatePeriodStats(next90),
    keyEvents: eventDates,
    aiInsights,
  };
};

// Generate pickup data
const generatePickupData = (): PickupData[] => {
  const periods = [
    { daysOut: 0, label: 'Today' },
    { daysOut: 1, label: 'Tomorrow' },
    { daysOut: 7, label: '+7 Days' },
    { daysOut: 14, label: '+14 Days' },
    { daysOut: 30, label: '+30 Days' },
    { daysOut: 60, label: '+60 Days' },
    { daysOut: 90, label: '+90 Days' },
  ];

  return periods.map(p => {
    const baseOtb = 200 - p.daysOut * 1.5;
    const currentOtb = Math.max(50, Math.round(baseOtb * (0.9 + Math.random() * 0.2)));
    const lastYearOtb = Math.round(currentOtb * (0.85 + Math.random() * 0.3));
    const lastWeekOtb = Math.round(currentOtb * (0.95 + Math.random() * 0.1));

    return {
      daysOut: p.daysOut,
      label: p.label,
      currentOtb,
      lastYearOtb,
      lastWeekOtb,
      pickup7Day: currentOtb - lastWeekOtb,
      pickup30Day: Math.round((currentOtb - lastYearOtb) * 0.3),
    };
  });
};

// Calculate benchmark indices
const calculateBenchmarkIndices = (dailyMetrics: DailyMetrics[]): BenchmarkIndex[] => {
  const recent = dailyMetrics.slice(-7);

  const avgOccupancy = recent.reduce((sum, d) => sum + d.occupancy, 0) / recent.length;
  const avgCompsetOccupancy = recent.reduce((sum, d) => sum + d.compsetOccupancy, 0) / recent.length;
  const mpi = (avgOccupancy / avgCompsetOccupancy) * 100;

  const avgAdr = recent.reduce((sum, d) => sum + d.adr, 0) / recent.length;
  const avgCompsetAdr = recent.reduce((sum, d) => sum + d.compsetAdr, 0) / recent.length;
  const ari = (avgAdr / avgCompsetAdr) * 100;

  const avgRevpar = recent.reduce((sum, d) => sum + d.revpar, 0) / recent.length;
  const avgCompsetRevpar = recent.reduce((sum, d) => sum + d.compsetRevpar, 0) / recent.length;
  const rgi = (avgRevpar / avgCompsetRevpar) * 100;

  return [
    {
      name: 'MPI',
      value: Math.round(mpi * 10) / 10,
      trend: mpi > 100 ? 'up' : mpi < 100 ? 'down' : 'stable',
      change: Math.round((mpi - 100) * 10) / 10,
      description: 'Market Penetration Index - Occupancy vs Compset',
    },
    {
      name: 'ARI',
      value: Math.round(ari * 10) / 10,
      trend: ari > 100 ? 'up' : ari < 100 ? 'down' : 'stable',
      change: Math.round((ari - 100) * 10) / 10,
      description: 'Average Rate Index - ADR vs Compset',
    },
    {
      name: 'RGI',
      value: Math.round(rgi * 10) / 10,
      trend: rgi > 100 ? 'up' : rgi < 100 ? 'down' : 'stable',
      change: Math.round((rgi - 100) * 10) / 10,
      description: 'Revenue Generation Index - RevPAR vs Compset',
    },
  ];
};

// Calculate current metrics from daily data
const calculateCurrentMetrics = (dailyMetrics: DailyMetrics[]) => {
  const recent = dailyMetrics.slice(-30);

  const totalRevenue = recent.reduce((sum, d) => sum + d.revenue, 0);
  const roomRevenue = totalRevenue;
  const fbRevenue = Math.round(totalRevenue * 0.25); // F&B is ~25% of room revenue
  const otherRevenue = Math.round(totalRevenue * 0.08); // Other ~8%

  const avgOccupancy = recent.reduce((sum, d) => sum + d.occupancy, 0) / recent.length;
  const avgAdr = recent.reduce((sum, d) => sum + d.adr, 0) / recent.length;
  const avgRevpar = recent.reduce((sum, d) => sum + d.revpar, 0) / recent.length;

  const totalRev = roomRevenue + fbRevenue + otherRevenue;
  const trevpar = totalRev / (275 * 30);
  const goppar = trevpar * 0.35; // Assuming 35% GOP margin

  return {
    occupancy: Math.round(avgOccupancy * 10) / 10,
    adr: Math.round(avgAdr),
    revpar: Math.round(avgRevpar),
    trevpar: Math.round(trevpar),
    goppar: Math.round(goppar),
    totalRevenue: totalRev,
    roomRevenue,
    fbRevenue,
    otherRevenue,
  };
};

// Generate AI Smart Summaries (Lighthouse-inspired)
const generateSmartSummaries = (dailyMetrics: DailyMetrics[]): SmartSummary[] => {
  const recent = dailyMetrics.slice(-7);
  const avgOccupancy = recent.reduce((sum, d) => sum + d.occupancy, 0) / recent.length;
  const avgRevpar = recent.reduce((sum, d) => sum + d.revpar, 0) / recent.length;
  const today = new Date().toISOString();

  const summaries: SmartSummary[] = [
    {
      id: '1',
      timestamp: today,
      category: 'performance',
      priority: 'high',
      title: 'Weekly Performance Summary',
      insight: `RevPAR increased by ${((avgRevpar / 35000 - 1) * 100).toFixed(1)}% compared to last week. Strong weekend bookings drove occupancy to ${avgOccupancy.toFixed(1)}% average.`,
      metric: 'RevPAR',
      value: `¥${Math.round(avgRevpar).toLocaleString()}`,
      recommendation: 'Consider increasing weekend rates by 5-8% for next month.',
    },
    {
      id: '2',
      timestamp: today,
      category: 'opportunity',
      priority: 'medium',
      title: 'Midweek Gap Opportunity',
      insight: 'Tuesday and Wednesday occupancy trailing weekend by 25 percentage points. Corporate segment showing 12% YoY decline.',
      metric: 'Midweek Occ',
      value: '62%',
      recommendation: 'Launch targeted corporate package or extend weekend rates to Monday.',
    },
    {
      id: '3',
      timestamp: today,
      category: 'trend',
      priority: 'medium',
      title: 'Booking Window Shift',
      insight: 'Average lead time shortened from 21 days to 14 days. Last-minute bookings up 18% YoY.',
      metric: 'Avg Lead Time',
      value: '14 days',
      recommendation: 'Adjust dynamic pricing to capture last-minute demand premium.',
    },
    {
      id: '4',
      timestamp: today,
      category: 'alert',
      priority: 'high',
      title: 'Competitor Rate Alert',
      insight: 'Park Hyatt Niseko dropped rates by 15% for next weekend. 3 of 5 compset properties showing aggressive discounting.',
      metric: 'Compset Avg',
      value: '¥38,500',
      recommendation: 'Monitor pickup closely before matching rates. Consider value-adds instead.',
    },
  ];

  return summaries;
};

// Generate Market Compression Calendar (Lighthouse-inspired)
const generateCompressionCalendar = (): CompressionDay[] => {
  const calendar: CompressionDay[] = [];
  const today = new Date();
  const events = [
    { name: 'Niseko Snow Festival', dates: [10, 11, 12] },
    { name: 'Chinese New Year', dates: [28, 29, 30] },
    { name: 'Japan Ski Week', dates: [15, 16, 17, 18] },
    { name: 'Corporate Retreat Season', dates: [5, 6, 20, 21] },
  ];

  for (let i = 0; i < 60; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const dayOfMonth = date.getDate();
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;

    // Find events on this day
    const dayEvents = events
      .filter(e => e.dates.includes(dayOfMonth))
      .map(e => e.name);

    // Calculate demand score
    let demandScore = isWeekend ? 70 : 45;
    if (dayEvents.length > 0) demandScore += 25;
    demandScore += Math.random() * 15;
    demandScore = Math.min(100, Math.max(0, demandScore));

    // Determine compression level
    let level: 'high' | 'medium' | 'low' | 'none';
    if (demandScore >= 85) level = 'high';
    else if (demandScore >= 65) level = 'medium';
    else if (demandScore >= 40) level = 'low';
    else level = 'none';

    calendar.push({
      date: date.toISOString().split('T')[0],
      level,
      demandScore: Math.round(demandScore),
      events: dayEvents,
      compsetAvailability: Math.max(10, 100 - demandScore + Math.random() * 20),
    });
  }

  return calendar;
};

// Generate Open Pricing Matrix (Duetto-inspired)
const generateOpenPricingMatrix = (): OpenPricingRate[] => {
  const roomTypes = ['Standard', 'Deluxe', 'Suite', 'Penthouse'];
  const segments = ['BAR', 'Corporate', 'OTA', 'Wholesale', 'Group'];
  const channels = ['Direct', 'Booking.com', 'Expedia'];
  const now = new Date().toISOString();

  const baseRates: Record<string, number> = {
    Standard: 35000,
    Deluxe: 48000,
    Suite: 72000,
    Penthouse: 125000,
  };

  const segmentMultipliers: Record<string, number> = {
    BAR: 1.0,
    Corporate: 0.88,
    OTA: 0.95,
    Wholesale: 0.75,
    Group: 0.82,
  };

  const matrix: OpenPricingRate[] = [];

  roomTypes.forEach(roomType => {
    segments.forEach(segment => {
      channels.forEach(channel => {
        const base = baseRates[roomType];
        const segmentMult = segmentMultipliers[segment];
        const channelVariance = channel === 'Direct' ? 1.0 : 0.98 + Math.random() * 0.04;
        const demandAdjust = 0.95 + Math.random() * 0.15;

        const currentRate = Math.round(base * segmentMult * channelVariance * demandAdjust);
        const recommended = Math.round(currentRate * (0.98 + Math.random() * 0.06));

        matrix.push({
          roomType,
          segment,
          channel,
          baseRate: base,
          currentRate,
          variance: Math.round((currentRate / base - 1) * 100 * 10) / 10,
          recommended,
          lastUpdated: now,
        });
      });
    });
  });

  return matrix;
};

// Generate Rate Explainer (Duetto-inspired)
const generateRateExplainer = (): RateExplainer => {
  const today = new Date().toISOString().split('T')[0];
  const baseRate = 42000;

  return {
    date: today,
    baseRate,
    adjustments: [
      { factor: 'Day of Week (Saturday)', impact: 8500, description: 'Weekend premium applied' },
      { factor: 'Seasonality (Peak)', impact: 5200, description: 'Ski season demand surge' },
      { factor: 'Compression (+2 Events)', impact: 3800, description: 'High market demand detected' },
      { factor: 'Pickup Pace (+15%)', impact: 2100, description: 'Above-normal booking velocity' },
      { factor: 'Compset Position', impact: -1500, description: 'Slight undercut to gain share' },
      { factor: 'LOS Discount (3+ nights)', impact: -2000, description: 'Length of stay incentive' },
    ],
    finalRate: baseRate + 8500 + 5200 + 3800 + 2100 - 1500 - 2000,
    confidence: 87,
  };
};

// Generate Alerts (Actabl-inspired)
const generateAlerts = (): Alert[] => {
  const now = new Date().toISOString();

  return [
    {
      id: 'a1',
      timestamp: now,
      type: 'rate_parity',
      severity: 'critical',
      title: 'Rate Parity Violation',
      message: 'Expedia showing ¥40,200 vs your direct rate of ¥42,500. Undercutting by ¥2,300.',
      acknowledged: false,
    },
    {
      id: 'a2',
      timestamp: now,
      type: 'compression',
      severity: 'warning',
      title: 'High Compression Day Ahead',
      message: 'January 15th showing 92% market demand. Only 2/5 compset properties have availability.',
      acknowledged: false,
    },
    {
      id: 'a3',
      timestamp: now,
      type: 'pickup',
      severity: 'warning',
      title: 'Slow Pickup Alert',
      message: 'Next Thursday pickup 35% below same-time-last-year. Consider promotional push.',
      acknowledged: false,
    },
    {
      id: 'a4',
      timestamp: now,
      type: 'competitor',
      severity: 'info',
      title: 'Competitor Sold Out',
      message: 'Hilton Niseko Village sold out for Jan 18-20. Opportunity to capture overflow.',
      acknowledged: true,
    },
    {
      id: 'a5',
      timestamp: now,
      type: 'budget',
      severity: 'info',
      title: 'Budget Milestone',
      message: 'MTD RevPAR at 108% of budget. On track to exceed monthly target by ¥2.1M.',
      acknowledged: true,
    },
  ];
};

// Generate Budget Data (Actabl-inspired)
const generateBudgetData = (): BudgetData[] => {
  return [
    { period: 'MTD', metric: 'Revenue', budget: 185000000, actual: 192500000, variance: 7500000, variancePercent: 4.1 },
    { period: 'MTD', metric: 'Occupancy', budget: 78, actual: 81.2, variance: 3.2, variancePercent: 4.1 },
    { period: 'MTD', metric: 'ADR', budget: 42000, actual: 43200, variance: 1200, variancePercent: 2.9 },
    { period: 'MTD', metric: 'RevPAR', budget: 32760, actual: 35078, variance: 2318, variancePercent: 7.1 },
    { period: 'YTD', metric: 'Revenue', budget: 2100000000, actual: 2185000000, variance: 85000000, variancePercent: 4.0 },
    { period: 'YTD', metric: 'GOPPAR', budget: 12500, actual: 13100, variance: 600, variancePercent: 4.8 },
  ];
};

// Generate Sales Pacing (Duetto/Actabl)
const generateSalesPacing = (): SalesPacing[] => {
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const currentDay = today.getDate();
  const daysRemaining = daysInMonth - currentDay;

  return [
    {
      period: 'This Month',
      target: 8250, // room nights
      actual: Math.round(8250 * (currentDay / daysInMonth) * 1.05),
      pace: 105,
      daysRemaining,
      projectedFinal: 8662,
    },
    {
      period: 'This Week',
      target: 1925,
      actual: 1650,
      pace: 86,
      daysRemaining: 3,
      projectedFinal: 1890,
    },
    {
      period: 'Next 30 Days',
      target: 8250,
      actual: 5200,
      pace: 63,
      daysRemaining: 30,
      projectedFinal: 8050,
    },
    {
      period: 'Next 90 Days',
      target: 24750,
      actual: 12800,
      pace: 52,
      daysRemaining: 90,
      projectedFinal: 23500,
    },
  ];
};

// Initialize data
const initialDailyMetrics = generateDailyMetrics();
const initialForecastData = generateForecastData();

export const useRevenueIntelligenceStore = create<RevenueIntelligenceState>((set, get) => ({
  selectedPeriod: 'mtd',
  selectedDate: new Date().toISOString().split('T')[0],

  currentMetrics: calculateCurrentMetrics(initialDailyMetrics),

  yoyMetrics: {
    occupancyChange: 5.2,
    adrChange: 8.7,
    revparChange: 14.5,
    revenueChange: 12.3,
  },

  benchmarkIndices: calculateBenchmarkIndices(initialDailyMetrics),
  dailyMetrics: initialDailyMetrics,
  segmentData: generateSegmentData(),
  channelData: generateChannelData(),
  competitorRates: generateCompetitorRates(),
  rateParity: generateRateParity(),
  forecastData: initialForecastData,
  forecastSummary: generateForecastSummary(initialForecastData),
  pickupData: generatePickupData(),

  // New Lighthouse/Duetto/Actabl-inspired features
  smartSummaries: generateSmartSummaries(initialDailyMetrics),
  compressionCalendar: generateCompressionCalendar(),
  openPricingMatrix: generateOpenPricingMatrix(),
  rateExplainer: generateRateExplainer(),
  alerts: generateAlerts(),
  budgetData: generateBudgetData(),
  salesPacing: generateSalesPacing(),

  setSelectedPeriod: (period) => set({ selectedPeriod: period }),
  setSelectedDate: (date) => set({ selectedDate: date }),

  acknowledgeAlert: (alertId) => {
    const alerts = get().alerts.map(a =>
      a.id === alertId ? { ...a, acknowledged: true } : a
    );
    set({ alerts });
  },

  refreshData: () => {
    const newDailyMetrics = generateDailyMetrics();
    const newForecastData = generateForecastData();
    set({
      dailyMetrics: newDailyMetrics,
      currentMetrics: calculateCurrentMetrics(newDailyMetrics),
      benchmarkIndices: calculateBenchmarkIndices(newDailyMetrics),
      segmentData: generateSegmentData(),
      channelData: generateChannelData(),
      competitorRates: generateCompetitorRates(),
      rateParity: generateRateParity(),
      forecastData: newForecastData,
      forecastSummary: generateForecastSummary(newForecastData),
      pickupData: generatePickupData(),
      smartSummaries: generateSmartSummaries(newDailyMetrics),
      compressionCalendar: generateCompressionCalendar(),
      openPricingMatrix: generateOpenPricingMatrix(),
      rateExplainer: generateRateExplainer(),
      alerts: generateAlerts(),
      budgetData: generateBudgetData(),
      salesPacing: generateSalesPacing(),
    });
  },
}));
