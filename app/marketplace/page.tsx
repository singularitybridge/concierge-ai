'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Store,
  Search,
  Filter,
  Grid3X3,
  List,
  Star,
  Download,
  Check,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  TrendingUp,
  Globe,
  Heart,
  ArrowUpRight,
  MessageSquare,
  Key,
  CreditCard,
  BarChart3,
  Users,
  Sparkles,
  Utensils,
  UserCog,
  Calculator,
  Shield,
  Gem,
  Car,
  Tv,
  X,
  Zap,
  Package,
  DollarSign,
  Activity,
  Settings,
  RefreshCw,
  Home,
  PanelRightClose,
  PanelRightOpen,
  Mic,
  LogOut,
  Play,
  Pause,
  Info,
  ArrowLeft,
  ArrowUpDown,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import VoiceSessionChat from '../components/VoiceSessionChat';
import MarketplaceAIInsights from '../components/MarketplaceAIInsights';
import {
  useMarketplaceStore,
  MarketplaceApp,
  AppCategory,
  CategoryInfo,
} from '../store/marketplaceStore';

export default function MarketplaceDashboard() {
  const { isAuthenticated, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [aiPanelOpen, setAiPanelOpen] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedApp, setSelectedApp] = useState<MarketplaceApp | null>(null);
  const [showInstalledOnly, setShowInstalledOnly] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [pricingDropdownOpen, setPricingDropdownOpen] = useState(false);

  const {
    apps,
    categories,
    insights,
    selectedCategory,
    searchQuery,
    sortBy,
    filterPricing,
    totalInstalled,
    totalMonthlySpend,
    totalApiCalls,
    setSelectedCategory,
    setSearchQuery,
    setSortBy,
    setFilterPricing,
    installApp,
    uninstallApp,
    dismissInsight,
  } = useMarketplaceStore();

  const menuItems = [
    { label: 'Operations', href: '/operations' },
    { label: 'Front Office', href: '/front-office' },
    { label: 'Revenue BI', href: '/revenue-intelligence' },
    { label: 'Employees', href: '/employee-management' },
    { label: 'Marketplace', href: '/marketplace', active: true },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  // Category icon mapping
  const getCategoryIcon = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      TrendingUp: <TrendingUp className="w-4 h-4" />,
      Globe: <Globe className="w-4 h-4" />,
      Heart: <Heart className="w-4 h-4" />,
      ArrowUpRight: <ArrowUpRight className="w-4 h-4" />,
      MessageSquare: <MessageSquare className="w-4 h-4" />,
      Key: <Key className="w-4 h-4" />,
      CreditCard: <CreditCard className="w-4 h-4" />,
      BarChart3: <BarChart3 className="w-4 h-4" />,
      Users: <Users className="w-4 h-4" />,
      Sparkles: <Sparkles className="w-4 h-4" />,
      Utensils: <Utensils className="w-4 h-4" />,
      Star: <Star className="w-4 h-4" />,
      UserCog: <UserCog className="w-4 h-4" />,
      Calculator: <Calculator className="w-4 h-4" />,
      Shield: <Shield className="w-4 h-4" />,
      Gem: <Gem className="w-4 h-4" />,
      Car: <Car className="w-4 h-4" />,
      Tv: <Tv className="w-4 h-4" />,
    };
    return icons[iconName] || <Package className="w-4 h-4" />;
  };

  // Category color mapping
  const getCategoryColor = (color: string) => {
    const colors: Record<string, string> = {
      emerald: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400',
      blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400',
      pink: 'from-pink-500/20 to-pink-600/10 border-pink-500/30 text-pink-400',
      amber: 'from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400',
      violet: 'from-violet-500/20 to-violet-600/10 border-violet-500/30 text-violet-400',
      cyan: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 text-cyan-400',
      green: 'from-green-500/20 to-green-600/10 border-green-500/30 text-green-400',
      indigo: 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/30 text-indigo-400',
      purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400',
      teal: 'from-teal-500/20 to-teal-600/10 border-teal-500/30 text-teal-400',
      orange: 'from-orange-500/20 to-orange-600/10 border-orange-500/30 text-orange-400',
      yellow: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30 text-yellow-400',
      slate: 'from-slate-500/20 to-slate-600/10 border-slate-500/30 text-slate-400',
      gray: 'from-gray-500/20 to-gray-600/10 border-gray-500/30 text-gray-400',
      red: 'from-red-500/20 to-red-600/10 border-red-500/30 text-red-400',
      rose: 'from-rose-500/20 to-rose-600/10 border-rose-500/30 text-rose-400',
      sky: 'from-sky-500/20 to-sky-600/10 border-sky-500/30 text-sky-400',
      fuchsia: 'from-fuchsia-500/20 to-fuchsia-600/10 border-fuchsia-500/30 text-fuchsia-400',
    };
    return colors[color] || colors.blue;
  };

  // Generate app logo with initials and category-based colors
  const getAppLogo = (app: MarketplaceApp, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: { container: 'w-10 h-10', text: 'text-xs' },
      md: { container: 'w-14 h-14', text: 'text-sm' },
      lg: { container: 'w-16 h-16', text: 'text-base' },
    };

    // Color mapping based on category
    const logoColors: Record<string, { bg: string; gradient: string; border: string }> = {
      revenue_management: { bg: 'from-emerald-500 to-emerald-600', gradient: 'from-emerald-500 to-emerald-600', border: 'border-emerald-400/30' },
      channel_management: { bg: 'from-blue-500 to-blue-600', gradient: 'from-blue-500 to-blue-600', border: 'border-blue-400/30' },
      guest_experience: { bg: 'from-pink-500 to-rose-600', gradient: 'from-pink-500 to-rose-600', border: 'border-pink-400/30' },
      upselling: { bg: 'from-amber-500 to-orange-600', gradient: 'from-amber-500 to-orange-600', border: 'border-amber-400/30' },
      guest_messaging: { bg: 'from-violet-500 to-purple-600', gradient: 'from-violet-500 to-purple-600', border: 'border-violet-400/30' },
      digital_keys: { bg: 'from-cyan-500 to-teal-600', gradient: 'from-cyan-500 to-teal-600', border: 'border-cyan-400/30' },
      payments: { bg: 'from-green-500 to-emerald-600', gradient: 'from-green-500 to-emerald-600', border: 'border-green-400/30' },
      business_intelligence: { bg: 'from-indigo-500 to-blue-600', gradient: 'from-indigo-500 to-blue-600', border: 'border-indigo-400/30' },
      crm_marketing: { bg: 'from-purple-500 to-fuchsia-600', gradient: 'from-purple-500 to-fuchsia-600', border: 'border-purple-400/30' },
      housekeeping: { bg: 'from-teal-500 to-cyan-600', gradient: 'from-teal-500 to-cyan-600', border: 'border-teal-400/30' },
      fb_pos: { bg: 'from-orange-500 to-red-600', gradient: 'from-orange-500 to-red-600', border: 'border-orange-400/30' },
      reputation: { bg: 'from-yellow-500 to-amber-600', gradient: 'from-yellow-500 to-amber-600', border: 'border-yellow-400/30' },
      staff_management: { bg: 'from-slate-500 to-gray-600', gradient: 'from-slate-500 to-gray-600', border: 'border-slate-400/30' },
      accounting: { bg: 'from-gray-500 to-slate-600', gradient: 'from-gray-500 to-slate-600', border: 'border-gray-400/30' },
      security: { bg: 'from-red-500 to-rose-600', gradient: 'from-red-500 to-rose-600', border: 'border-red-400/30' },
      spa_activities: { bg: 'from-rose-500 to-pink-600', gradient: 'from-rose-500 to-pink-600', border: 'border-rose-400/30' },
      parking: { bg: 'from-sky-500 to-blue-600', gradient: 'from-sky-500 to-blue-600', border: 'border-sky-400/30' },
      in_room_tech: { bg: 'from-fuchsia-500 to-purple-600', gradient: 'from-fuchsia-500 to-purple-600', border: 'border-fuchsia-400/30' },
    };

    const colors = logoColors[app.category] || { bg: 'from-indigo-500 to-purple-600', gradient: 'from-indigo-500 to-purple-600', border: 'border-indigo-400/30' };

    // Get initials from app name
    const getInitials = (name: string) => {
      const words = name.replace(/[^a-zA-Z0-9\s]/g, '').split(' ').filter(w => w.length > 0);
      if (words.length > 1) {
        return (words[0][0] + words[1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    };

    const initials = getInitials(app.name);

    // If app has a real logo URL, use the image with fallback
    if (app.logo && app.logo.startsWith('http')) {
      return (
        <div className={`${sizeClasses[size].container} rounded-xl flex items-center justify-center bg-white border border-white/20 shadow-lg overflow-hidden p-1.5 relative`}>
          <img
            src={app.logo}
            alt={`${app.name} logo`}
            className="w-full h-full object-contain"
            onError={(e) => {
              // Hide failed image and show initials fallback
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) {
                fallback.style.display = 'flex';
              }
            }}
          />
          {/* Hidden fallback that shows on error */}
          <div
            className={`absolute inset-0 ${sizeClasses[size].container} bg-gradient-to-br ${colors.gradient} rounded-xl items-center justify-center border ${colors.border} font-bold text-white ${sizeClasses[size].text} shadow-lg hidden`}
            style={{ display: 'none' }}
          >
            {initials}
          </div>
        </div>
      );
    }

    // Default: show initials-based logo with category colors
    return (
      <div className={`${sizeClasses[size].container} bg-gradient-to-br ${colors.bg} rounded-xl flex items-center justify-center border ${colors.border} font-bold text-white ${sizeClasses[size].text} shadow-lg`}>
        {initials}
      </div>
    );
  };

  // Filter and sort apps
  const filteredApps = useMemo(() => {
    let result = [...apps];

    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter(app => app.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(app =>
        app.name.toLowerCase().includes(query) ||
        app.shortDescription.toLowerCase().includes(query) ||
        app.vendor.name.toLowerCase().includes(query)
      );
    }

    // Filter by pricing
    if (filterPricing !== 'all') {
      result = result.filter(app => app.pricing === filterPricing);
    }

    // Filter installed only
    if (showInstalledOnly) {
      result = result.filter(app => app.status === 'installed');
    }

    // Sort
    switch (sortBy) {
      case 'popular':
        result.sort((a, b) => b.installCount - a.installCount);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return result;
  }, [apps, selectedCategory, searchQuery, filterPricing, sortBy, showInstalledOnly]);

  // Get installed apps
  const installedApps = useMemo(() => apps.filter(a => a.status === 'installed'), [apps]);

  // Get featured apps
  const featuredApps = useMemo(() => apps.filter(a => a.isFeatured && a.status !== 'installed').slice(0, 4), [apps]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const getCategoryName = (categoryId: AppCategory) => {
    return categories.find(c => c.id === categoryId)?.name || categoryId;
  };

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
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-indigo-900/80" />

      {/* Content */}
      <div className={`relative z-10 h-screen flex flex-col transition-opacity duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>

        {/* Top Navigation */}
        <nav className="flex items-center justify-between px-6 py-3 flex-shrink-0 border-b border-white/10 bg-black/20 backdrop-blur-xl">
          {/* Left - Breadcrumbs */}
          <div className="flex items-center gap-4">
            {/* Home Button */}
            <Link
              href="/"
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition-all group"
              title="Back to Main Menu"
            >
              <Home className="w-5 h-5 text-white/70 group-hover:text-indigo-400 transition-colors" />
            </Link>

            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm">
              <Link href="/" className="text-white/50 hover:text-white transition-colors">Home</Link>
              <ChevronRight className="w-4 h-4 text-white/30" />
              <span className="text-indigo-400 font-medium">Marketplace</span>
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
                    ? 'bg-indigo-500/20 text-indigo-300 font-medium'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* AI Assistant Toggle */}
            <button
              onClick={() => setAiPanelOpen(!aiPanelOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
                aiPanelOpen
                  ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300'
                  : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10'
              }`}
              title={aiPanelOpen ? 'Hide AI Assistant' : 'Show AI Assistant'}
            >
              {aiPanelOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
              <span className="text-xs font-medium">AI</span>
            </button>

            <div className="h-6 w-px bg-white/10" />

            <button onClick={logout} className="p-2 hover:bg-white/10 rounded-lg">
              <LogOut className="w-4 h-4 text-white/60" />
            </button>
          </div>
        </nav>

        {/* Main Content */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Main Dashboard */}
          <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-[1600px] mx-auto space-y-6">
            {/* AI Insights */}
            <MarketplaceAIInsights
              insights={insights}
              onDismiss={dismissInsight}
              onExploreApp={(appId) => {
                const app = apps.find(a => a.id === appId);
                if (app) setSelectedApp(app);
              }}
            />

            {/* Stats Overview */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white/50">Total Available</span>
                  <Store className="w-4 h-4 text-indigo-400" />
                </div>
                <p className="text-2xl font-bold text-white">{apps.length}</p>
                <p className="text-[10px] text-white/40 mt-1">{categories.length} categories</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-600/30 to-teal-600/30 backdrop-blur-xl rounded-xl border border-emerald-500/30 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white/50">Installed</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-2xl font-bold text-emerald-400">{totalInstalled}</p>
                <p className="text-[10px] text-white/40 mt-1">Active integrations</p>
              </div>
              <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white/50">Monthly Spend</span>
                  <DollarSign className="w-4 h-4 text-amber-400" />
                </div>
                <p className="text-2xl font-bold text-white">¥{(totalMonthlySpend / 1000).toFixed(0)}K</p>
                <p className="text-[10px] text-white/40 mt-1">Marketplace apps</p>
              </div>
              <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white/50">API Calls (30d)</span>
                  <Activity className="w-4 h-4 text-cyan-400" />
                </div>
                <p className="text-2xl font-bold text-white">{(totalApiCalls / 1000).toFixed(0)}K</p>
                <p className="text-[10px] text-white/40 mt-1">Total requests</p>
              </div>
            </div>

            {/* Featured Apps */}
            {featuredApps.length > 0 && selectedCategory === 'all' && !searchQuery && (
              <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    Featured Apps
                  </h3>
                  <span className="text-xs text-white/40">Recommended for you</span>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {featuredApps.map(app => (
                    <div
                      key={app.id}
                      onClick={() => setSelectedApp(app)}
                      className="bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 p-4 cursor-pointer transition-all hover:scale-[1.02]"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-white/10">
                          <Package className="w-6 h-6 text-indigo-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-white truncate">{app.name}</h4>
                          <p className="text-[10px] text-white/50">{app.vendor.name}</p>
                        </div>
                      </div>
                      <p className="text-xs text-white/60 line-clamp-2 mb-3">{app.shortDescription}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span className="text-xs text-white">{app.rating}</span>
                          <span className="text-[10px] text-white/40">({app.reviewCount})</span>
                        </div>
                        {app.isNew && (
                          <span className="px-2 py-0.5 text-[9px] font-medium bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
                            NEW
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Categories Bar */}
            <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 text-xs rounded-lg whitespace-nowrap transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-white/10 text-white border border-white/20'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  All Apps
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-2 px-4 py-2 text-xs rounded-lg whitespace-nowrap transition-colors ${
                      selectedCategory === cat.id
                        ? 'bg-white/10 text-white border border-white/20'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {getCategoryIcon(cat.icon)}
                    {cat.name}
                    <span className="text-[10px] text-white/40">({cat.appCount})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Filters & Search */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search apps..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50"
                  />
                </div>

                {/* Pricing Filter Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setPricingDropdownOpen(!pricingDropdownOpen)}
                    className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white hover:bg-white/10 transition-colors"
                  >
                    <DollarSign className="w-4 h-4 text-white/60" />
                    {filterPricing === 'all' ? 'All Pricing' : filterPricing === 'free' ? 'Free' : filterPricing === 'freemium' ? 'Freemium' : filterPricing === 'paid' ? 'Paid' : 'Custom'}
                    <ChevronDown className={`w-4 h-4 text-white/60 transition-transform ${pricingDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {pricingDropdownOpen && (
                    <div className="absolute left-0 top-full mt-1 w-36 bg-slate-800 border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
                      {[
                        { value: 'all', label: 'All Pricing' },
                        { value: 'free', label: 'Free' },
                        { value: 'freemium', label: 'Freemium' },
                        { value: 'paid', label: 'Paid' },
                        { value: 'custom', label: 'Custom' },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setFilterPricing(option.value as any);
                            setPricingDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                            filterPricing === option.value
                              ? 'bg-indigo-500/20 text-indigo-300'
                              : 'text-white/80 hover:bg-white/10'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setShowInstalledOnly(!showInstalledOnly)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                    showInstalledOnly
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Installed Only
                </button>
              </div>

              <div className="flex items-center gap-2">
                {/* Sort Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                    className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white hover:bg-white/10 transition-colors"
                  >
                    <ArrowUpDown className="w-4 h-4 text-white/60" />
                    {sortBy === 'popular' ? 'Most Popular' : sortBy === 'rating' ? 'Highest Rated' : sortBy === 'newest' ? 'Newest' : 'Name A-Z'}
                    <ChevronDown className={`w-4 h-4 text-white/60 transition-transform ${sortDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {sortDropdownOpen && (
                    <div className="absolute right-0 top-full mt-1 w-44 bg-slate-800 border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
                      {[
                        { value: 'popular', label: 'Most Popular' },
                        { value: 'rating', label: 'Highest Rated' },
                        { value: 'newest', label: 'Newest' },
                        { value: 'name', label: 'Name A-Z' },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSortBy(option.value as any);
                            setSortDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                            sortBy === option.value
                              ? 'bg-indigo-500/20 text-indigo-300'
                              : 'text-white/70 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* View Mode */}
                <div className="flex items-center bg-white/5 rounded-lg p-0.5">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-white/50'}`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-white/50'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Apps Grid/List */}
            <div className={viewMode === 'grid' ? 'grid grid-cols-3 gap-4' : 'space-y-3'}>
              {filteredApps.map(app => (
                <div
                  key={app.id}
                  onClick={() => setSelectedApp(app)}
                  className={`bg-white/5 hover:bg-white/10 backdrop-blur-xl rounded-xl border border-white/10 cursor-pointer transition-all hover:border-white/20 ${
                    viewMode === 'list' ? 'p-4' : 'p-5'
                  }`}
                >
                  {viewMode === 'grid' ? (
                    // Grid View
                    <>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3">
                          {getAppLogo(app, 'md')}
                          <div>
                            <h4 className="text-sm font-medium text-white">{app.name}</h4>
                            <p className="text-[11px] text-white/50">{app.vendor.name}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                              <span className="text-xs text-white">{app.rating}</span>
                              <span className="text-[10px] text-white/40">({app.reviewCount})</span>
                            </div>
                          </div>
                        </div>
                        {app.status === 'installed' && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-emerald-500/20 rounded-full">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span className="text-[10px] text-emerald-400 font-medium">Installed</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-white/60 line-clamp-2 mb-4">{app.shortDescription}</p>
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 text-[10px] font-medium rounded-full bg-gradient-to-r ${getCategoryColor(categories.find(c => c.id === app.category)?.color || 'blue')} border`}>
                          {getCategoryName(app.category)}
                        </span>
                        <div className="flex items-center gap-2">
                          {app.isCertified && (
                            <span className="text-[10px] text-blue-400 flex items-center gap-0.5">
                              <Shield className="w-3 h-3" /> Certified
                            </span>
                          )}
                          {app.isNew && (
                            <span className="px-2 py-0.5 text-[9px] font-medium bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
                              NEW
                            </span>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    // List View
                    <div className="flex items-center gap-4">
                      {getAppLogo(app, 'sm')}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-medium text-white">{app.name}</h4>
                          {app.isCertified && <Shield className="w-3 h-3 text-blue-400" />}
                          {app.isNew && (
                            <span className="px-2 py-0.5 text-[9px] font-medium bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
                              NEW
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-white/60 truncate">{app.shortDescription}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-xs text-white">{app.rating}</span>
                      </div>
                      <span className={`px-2 py-1 text-[10px] font-medium rounded-full bg-gradient-to-r ${getCategoryColor(categories.find(c => c.id === app.category)?.color || 'blue')} border`}>
                        {getCategoryName(app.category)}
                      </span>
                      {app.status === 'installed' ? (
                        <div className="flex items-center gap-1 px-2 py-1 bg-emerald-500/20 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span className="text-[10px] text-emerald-400 font-medium">Installed</span>
                        </div>
                      ) : (
                        <ChevronRight className="w-4 h-4 text-white/40" />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {filteredApps.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white/60 mb-2">No apps found</h3>
                <p className="text-sm text-white/40">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
          </div>

          {/* AI Assistant Panel */}
          {aiPanelOpen && (
            <div className="w-[380px] border-l border-white/10 bg-slate-900/50 flex flex-col">
              <VoiceSessionChat
                agentId="marketplace-assistant"
                title="Marketplace Advisor"
                subtitle="Integration Expert"
                avatar="/avatars/assistant-avatar.jpg"
                variant="dark"
                welcomeMessage="I can help you find the right integrations, compare apps, and optimize your tech stack. Ask me about any category or specific integration needs."
                suggestions={[
                  "Which RMS integrates best with our PMS?",
                  "Compare guest messaging platforms",
                  "What integrations improve RevPAR?",
                  "Show me upselling solutions",
                  "Which apps have the best ROI?",
                  "Recommend integrations for boutique hotels",
                ]}
              />
            </div>
          )}
        </div>
      </div>

      {/* App Detail Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedApp(null)} />
          <div className="relative bg-slate-900 rounded-2xl border border-white/20 w-[800px] max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between p-6 border-b border-white/10">
              <div className="flex items-start gap-4">
                {getAppLogo(selectedApp, 'lg')}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-semibold text-white">{selectedApp.name}</h2>
                    {selectedApp.isCertified && (
                      <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">
                        <Shield className="w-3 h-3" /> Certified
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-white/60 mb-2">by {selectedApp.vendor.name}</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="text-sm text-white font-medium">{selectedApp.rating}</span>
                      <span className="text-xs text-white/50">({selectedApp.reviewCount} reviews)</span>
                    </div>
                    <span className="text-xs text-white/40">•</span>
                    <span className="text-xs text-white/50">{selectedApp.installCount.toLocaleString()} installs</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <p className="text-sm text-white/80 leading-relaxed mb-6">{selectedApp.fullDescription}</p>

              {/* Key Info */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Pricing</p>
                  <p className="text-sm font-medium text-white capitalize">{selectedApp.pricing}</p>
                  {selectedApp.priceRange && <p className="text-xs text-white/50 mt-1">{selectedApp.priceRange}</p>}
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Integration</p>
                  <p className="text-sm font-medium text-white capitalize">{selectedApp.integrationType.replace('_', ' ')}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Category</p>
                  <p className="text-sm font-medium text-white">{getCategoryName(selectedApp.category)}</p>
                </div>
              </div>

              {/* Features */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-white mb-3">Features</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedApp.features.map((feature, i) => (
                    <span key={i} className="px-3 py-1.5 text-xs bg-white/5 text-white/70 rounded-lg border border-white/10">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              {/* Integration Capabilities */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-white mb-3">Integration Capabilities</h3>
                <ul className="space-y-2">
                  {selectedApp.integrationCapabilities.map((cap, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-white/70">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      {cap}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Installed App Stats */}
              {selectedApp.status === 'installed' && (
                <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20 mb-6">
                  <h3 className="text-sm font-medium text-emerald-400 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Integration Status
                  </h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-[10px] text-white/40">Installed</p>
                      <p className="text-sm text-white">{selectedApp.installedAt ? new Date(selectedApp.installedAt).toLocaleDateString() : '-'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-white/40">Monthly Cost</p>
                      <p className="text-sm text-white">¥{(selectedApp.monthlySpend || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-white/40">API Calls</p>
                      <p className="text-sm text-white">{(selectedApp.apiCalls || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-white/40">Health</p>
                      <p className={`text-sm flex items-center gap-1 ${selectedApp.healthStatus === 'healthy' ? 'text-emerald-400' : selectedApp.healthStatus === 'warning' ? 'text-amber-400' : 'text-red-400'}`}>
                        {selectedApp.healthStatus === 'healthy' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        {selectedApp.healthStatus || 'Unknown'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-white/10 bg-slate-900/50">
              <a
                href={selectedApp.vendor.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Visit Website
              </a>
              <div className="flex items-center gap-3">
                {selectedApp.status === 'installed' ? (
                  <>
                    <button
                      onClick={() => {
                        uninstallApp(selectedApp.id);
                        setSelectedApp({ ...selectedApp, status: 'not_installed' });
                      }}
                      className="px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      Uninstall
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 text-sm bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
                      <Settings className="w-4 h-4" />
                      Configure
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      installApp(selectedApp.id);
                      setSelectedApp({ ...selectedApp, status: 'installed', installedAt: new Date().toISOString(), healthStatus: 'healthy' });
                    }}
                    className="flex items-center gap-2 px-6 py-2 text-sm bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors font-medium"
                  >
                    <Download className="w-4 h-4" />
                    Install App
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
