'use client';

import React, { useState } from 'react';
import {
  Search,
  Hotel,
  Calendar,
  Users,
  CreditCard,
  ShoppingBag,
  History,
  Play,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Globe,
  Building,
  Image as ImageIcon,
  FileText,
  Plus,
  Eye,
  X,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { useRoombossApiStore, LOCATION_CODES, ROOMBOSS_CONFIG } from '../store/roombossApiStore';

type TabType = 'hotels' | 'availability' | 'details' | 'bookings' | 'services' | 'history';

export default function RoombossApiTester() {
  const [activeTab, setActiveTab] = useState<TabType>('hotels');
  const [response, setResponse] = useState<unknown>(null);
  const [copied, setCopied] = useState(false);

  const {
    isLoading,
    requestHistory,
    hotels,
    availableHotels,
    vendors,
    categories,
    products,
    currentBooking,
    listHotels,
    listAvailable,
    listImages,
    listDescriptions,
    listRatePlanDescriptions,
    listBookingsByDate,
    createBooking,
    listBooking,
    cancelBooking,
    listVendors,
    listCategories,
    listProducts,
    clearHistory,
  } = useRoombossApiStore();

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'hotels', label: 'Hotel Directory', icon: <Hotel className="w-4 h-4" /> },
    { id: 'availability', label: 'Availability', icon: <Search className="w-4 h-4" /> },
    { id: 'details', label: 'Hotel Details', icon: <FileText className="w-4 h-4" /> },
    { id: 'bookings', label: 'Bookings', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'services', label: 'Guest Services', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'history', label: 'Request Log', icon: <History className="w-4 h-4" /> },
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">RoomBoss API Tester</h1>
                <p className="text-white/50 text-xs">Test environment - All API endpoints</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-xs text-white/50">Connected to</div>
                <div className="text-sm font-mono text-cyan-400">{ROOMBOSS_CONFIG.baseUrl}</div>
              </div>
              <div className="px-3 py-1 bg-green-500/20 rounded-full flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-green-400 text-xs font-medium">Demo Account</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.id === 'history' && requestHistory.length > 0 && (
                <span className="px-1.5 py-0.5 bg-white/20 rounded text-xs">{requestHistory.length}</span>
              )}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Input Forms */}
          <div className="space-y-4">
            {activeTab === 'hotels' && (
              <HotelDirectoryPanel
                onExecute={async (data) => {
                  const result = await listHotels(data.countryCode, data.locationCode);
                  setResponse(result);
                }}
                isLoading={isLoading}
                hotels={hotels}
              />
            )}

            {activeTab === 'availability' && (
              <AvailabilityPanel
                onExecute={async (data) => {
                  const result = await listAvailable(data);
                  setResponse(result);
                }}
                isLoading={isLoading}
                hotels={hotels}
                availableHotels={availableHotels}
              />
            )}

            {activeTab === 'details' && (
              <HotelDetailsPanel
                onExecuteImages={async (hotelId) => {
                  const result = await listImages(hotelId);
                  setResponse(result);
                }}
                onExecuteDescriptions={async (hotelId, locale) => {
                  const result = await listDescriptions(hotelId, locale);
                  setResponse(result);
                }}
                onExecuteRatePlans={async (hotelId, locale) => {
                  const result = await listRatePlanDescriptions(hotelId, locale);
                  setResponse(result);
                }}
                onExecuteBookingsByDate={async (hotelId, date) => {
                  const result = await listBookingsByDate(hotelId, date);
                  setResponse(result);
                }}
                isLoading={isLoading}
                hotels={hotels}
              />
            )}

            {activeTab === 'bookings' && (
              <BookingsPanel
                onCreateBooking={async (data) => {
                  const result = await createBooking(data);
                  setResponse(result);
                }}
                onListBooking={async (bookingId) => {
                  const result = await listBooking(bookingId);
                  setResponse(result);
                }}
                onCancelBooking={async (bookingId) => {
                  const result = await cancelBooking(bookingId);
                  setResponse(result);
                }}
                isLoading={isLoading}
                hotels={hotels}
                availableHotels={availableHotels}
                currentBooking={currentBooking}
              />
            )}

            {activeTab === 'services' && (
              <GuestServicesPanel
                onListVendors={async (countryCode, locationCode) => {
                  const result = await listVendors(countryCode, locationCode);
                  setResponse(result);
                }}
                onListCategories={async (vendorId, lang) => {
                  const result = await listCategories(vendorId, lang);
                  setResponse(result);
                }}
                onListProducts={async (categoryId, lang) => {
                  const result = await listProducts(categoryId, lang);
                  setResponse(result);
                }}
                isLoading={isLoading}
                vendors={vendors}
                categories={categories}
                products={products}
              />
            )}

            {activeTab === 'history' && (
              <RequestHistoryPanel
                requests={requestHistory}
                onSelect={(request) => setResponse(request.response)}
                onClear={clearHistory}
              />
            )}
          </div>

          {/* Right Panel - Response Viewer */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden sticky top-24 h-[calc(100vh-120px)]">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                Response
              </h3>
              {response && (
                <button
                  onClick={() => copyToClipboard(JSON.stringify(response, null, 2))}
                  className="flex items-center gap-1 px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-xs text-white/70 transition-colors"
                >
                  {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              )}
            </div>
            <div className="p-4 h-[calc(100%-60px)] overflow-auto">
              {response ? (
                <pre className="text-xs text-white/80 font-mono whitespace-pre-wrap">
                  <JsonViewer data={response} />
                </pre>
              ) : (
                <div className="h-full flex items-center justify-center text-white/30">
                  <div className="text-center">
                    <Play className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Execute an API call to see the response</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// JSON Viewer Component with Syntax Highlighting
function JsonViewer({ data }: { data: unknown }) {
  const syntaxHighlight = (json: string) => {
    return json.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        let cls = 'text-amber-400'; // number
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'text-cyan-400'; // key
          } else {
            cls = 'text-green-400'; // string
          }
        } else if (/true|false/.test(match)) {
          cls = 'text-pink-400'; // boolean
        } else if (/null/.test(match)) {
          cls = 'text-gray-500'; // null
        }
        return `<span class="${cls}">${match}</span>`;
      }
    );
  };

  const formatted = JSON.stringify(data, null, 2);
  return <div dangerouslySetInnerHTML={{ __html: syntaxHighlight(formatted) }} />;
}

// Hotel Directory Panel
function HotelDirectoryPanel({
  onExecute,
  isLoading,
  hotels,
}: {
  onExecute: (data: { countryCode: string; locationCode: string }) => Promise<void>;
  isLoading: boolean;
  hotels: unknown[];
}) {
  const [countryCode, setCountryCode] = useState('JP');
  const [locationCode, setLocationCode] = useState('HAKUBA');

  const locations = LOCATION_CODES[countryCode as keyof typeof LOCATION_CODES] || [];

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
      <div className="p-4 border-b border-white/10">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Hotel className="w-4 h-4 text-blue-400" />
          List Hotels
        </h3>
        <p className="text-white/50 text-xs mt-1">GET /extws/hotel/v1/list</p>
      </div>
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-white/50 mb-1">Country Code *</label>
            <select
              value={countryCode}
              onChange={(e) => {
                setCountryCode(e.target.value);
                const locs = LOCATION_CODES[e.target.value as keyof typeof LOCATION_CODES];
                if (locs && locs.length > 0) {
                  setLocationCode(locs[0].code);
                }
              }}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
            >
              {Object.keys(LOCATION_CODES).map((code) => (
                <option key={code} value={code} className="bg-slate-800">
                  {code}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1">Location Code *</label>
            <select
              value={locationCode}
              onChange={(e) => setLocationCode(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
            >
              {locations.map((loc) => (
                <option key={loc.code} value={loc.code} className="bg-slate-800">
                  {loc.name} ({loc.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={() => onExecute({ countryCode, locationCode })}
          disabled={isLoading}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          Execute
        </button>

        {hotels.length > 0 && (
          <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="flex items-center gap-2 text-green-400 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              Found {hotels.length} hotel(s)
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Availability Panel
function AvailabilityPanel({
  onExecute,
  isLoading,
  hotels,
  availableHotels,
}: {
  onExecute: (data: {
    hotelIds: string[];
    checkIn: string;
    checkOut: string;
    numberGuests: number;
    numberAdults?: number;
    numberChildren?: number;
    numberInfants?: number;
    rate?: string;
  }) => Promise<void>;
  isLoading: boolean;
  hotels: { hotelId: string; hotelName: string }[];
  availableHotels: unknown[];
}) {
  const [selectedHotels, setSelectedHotels] = useState<string[]>([]);
  const [checkIn, setCheckIn] = useState('20260210');
  const [checkOut, setCheckOut] = useState('20260212');
  const [numberGuests, setNumberGuests] = useState(2);
  const [numberAdults, setNumberAdults] = useState(2);
  const [numberChildren, setNumberChildren] = useState(0);
  const [numberInfants, setNumberInfants] = useState(0);
  const [useOtaRates, setUseOtaRates] = useState(true);

  const toggleHotel = (hotelId: string) => {
    setSelectedHotels((prev) =>
      prev.includes(hotelId) ? prev.filter((id) => id !== hotelId) : [...prev, hotelId]
    );
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
      <div className="p-4 border-b border-white/10">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Search className="w-4 h-4 text-blue-400" />
          Search Availability
        </h3>
        <p className="text-white/50 text-xs mt-1">GET /extws/hotel/v1/listAvailable</p>
      </div>
      <div className="p-4 space-y-4">
        {/* Hotel Selection */}
        <div>
          <label className="block text-xs text-white/50 mb-2">Select Hotels * (from Hotel Directory)</label>
          {hotels.length === 0 ? (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-sm">
              Run Hotel Directory first to load hotels
            </div>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {hotels.map((hotel) => (
                <label
                  key={hotel.hotelId}
                  className="flex items-center gap-2 p-2 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10"
                >
                  <input
                    type="checkbox"
                    checked={selectedHotels.includes(hotel.hotelId)}
                    onChange={() => toggleHotel(hotel.hotelId)}
                    className="rounded border-white/20"
                  />
                  <span className="text-white text-sm">{hotel.hotelName}</span>
                  <span className="text-white/40 text-xs font-mono">{hotel.hotelId.slice(0, 12)}...</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-white/50 mb-1">Check-in (yyyyMMdd) *</label>
            <input
              type="text"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              placeholder="20260210"
            />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1">Check-out (yyyyMMdd) *</label>
            <input
              type="text"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              placeholder="20260212"
            />
          </div>
        </div>

        {/* Guests */}
        <div className="grid grid-cols-4 gap-2">
          <div>
            <label className="block text-xs text-white/50 mb-1">Guests *</label>
            <input
              type="number"
              value={numberGuests}
              onChange={(e) => setNumberGuests(parseInt(e.target.value))}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              min="1"
            />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1">Adults</label>
            <input
              type="number"
              value={numberAdults}
              onChange={(e) => setNumberAdults(parseInt(e.target.value))}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              min="0"
            />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1">Children</label>
            <input
              type="number"
              value={numberChildren}
              onChange={(e) => setNumberChildren(parseInt(e.target.value))}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              min="0"
            />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1">Infants</label>
            <input
              type="number"
              value={numberInfants}
              onChange={(e) => setNumberInfants(parseInt(e.target.value))}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              min="0"
            />
          </div>
        </div>

        {/* Options */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={useOtaRates}
            onChange={(e) => setUseOtaRates(e.target.checked)}
            className="rounded border-white/20"
          />
          <span className="text-white text-sm">Use OTA Rates (rate=ota)</span>
        </label>

        <button
          onClick={() =>
            onExecute({
              hotelIds: selectedHotels,
              checkIn,
              checkOut,
              numberGuests,
              numberAdults,
              numberChildren,
              numberInfants,
              rate: useOtaRates ? 'ota' : undefined,
            })
          }
          disabled={isLoading || selectedHotels.length === 0}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Search Availability
        </button>

        {availableHotels.length > 0 && (
          <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="flex items-center gap-2 text-green-400 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              Found {availableHotels.length} hotel(s) with availability
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Hotel Details Panel
function HotelDetailsPanel({
  onExecuteImages,
  onExecuteDescriptions,
  onExecuteRatePlans,
  onExecuteBookingsByDate,
  isLoading,
  hotels,
}: {
  onExecuteImages: (hotelId: string) => Promise<void>;
  onExecuteDescriptions: (hotelId: string, locale: string) => Promise<void>;
  onExecuteRatePlans: (hotelId: string, locale: string) => Promise<void>;
  onExecuteBookingsByDate: (hotelId: string, date: string) => Promise<void>;
  isLoading: boolean;
  hotels: { hotelId: string; hotelName: string }[];
}) {
  const [hotelId, setHotelId] = useState('');
  const [locale, setLocale] = useState('en');
  const [date, setDate] = useState('20260101');

  return (
    <div className="space-y-4">
      {/* Hotel Selection */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
        <label className="block text-xs text-white/50 mb-2">Select Hotel (from Hotel Directory)</label>
        {hotels.length === 0 ? (
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-sm">
            Run Hotel Directory first to load hotels
          </div>
        ) : (
          <select
            value={hotelId}
            onChange={(e) => setHotelId(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="" className="bg-slate-800">Select a hotel...</option>
            {hotels.map((hotel) => (
              <option key={hotel.hotelId} value={hotel.hotelId} className="bg-slate-800">
                {hotel.hotelName}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* List Images */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-blue-400" />
            List Images
          </h3>
          <p className="text-white/50 text-xs mt-1">GET /extws/hotel/v1/listImage</p>
        </div>
        <div className="p-4">
          <button
            onClick={() => onExecuteImages(hotelId)}
            disabled={isLoading || !hotelId}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Get Images
          </button>
        </div>
      </div>

      {/* List Descriptions */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-400" />
            List Descriptions
          </h3>
          <p className="text-white/50 text-xs mt-1">GET /extws/hotel/v1/listDescription</p>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <label className="block text-xs text-white/50 mb-1">Locale</label>
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="en" className="bg-slate-800">English (en)</option>
              <option value="ja" className="bg-slate-800">Japanese (ja)</option>
              <option value="zh" className="bg-slate-800">Chinese (zh)</option>
              <option value="ko" className="bg-slate-800">Korean (ko)</option>
            </select>
          </div>
          <button
            onClick={() => onExecuteDescriptions(hotelId, locale)}
            disabled={isLoading || !hotelId}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Get Descriptions
          </button>
        </div>
      </div>

      {/* List Rate Plan Descriptions */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-blue-400" />
            List Rate Plan Descriptions
          </h3>
          <p className="text-white/50 text-xs mt-1">GET /extws/hotel/v1/listRatePlanDescription</p>
        </div>
        <div className="p-4">
          <button
            onClick={() => onExecuteRatePlans(hotelId, locale)}
            disabled={isLoading || !hotelId}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Get Rate Plans
          </button>
        </div>
      </div>

      {/* List Bookings by Date */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            List Bookings by Date
          </h3>
          <p className="text-white/50 text-xs mt-1">GET /extws/hotel/v1/listBookings</p>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <label className="block text-xs text-white/50 mb-1">Date (yyyyMMdd)</label>
            <input
              type="text"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              placeholder="20260101"
            />
          </div>
          <button
            onClick={() => onExecuteBookingsByDate(hotelId, date)}
            disabled={isLoading || !hotelId}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Get Bookings
          </button>
        </div>
      </div>
    </div>
  );
}

// Bookings Panel
function BookingsPanel({
  onCreateBooking,
  onListBooking,
  onCancelBooking,
  isLoading,
  hotels,
  availableHotels,
  currentBooking,
}: {
  onCreateBooking: (data: {
    hotelId: string;
    roomTypeId: string;
    ratePlanId: number;
    checkIn: string;
    checkOut: string;
    numberGuests: number;
    numberAdults: number;
    numberChildren: number;
    numberInfants: number;
    guestGivenName: string;
    guestFamilyName: string;
    guestEmail?: string;
    contactNumber?: string;
    priceRetailMax: number;
    bookingExtent?: string;
  }) => Promise<void>;
  onListBooking: (bookingId: string) => Promise<void>;
  onCancelBooking: (bookingId: string) => Promise<void>;
  isLoading: boolean;
  hotels: { hotelId: string; hotelName: string; roomTypes?: { roomTypeId: string; roomTypeName: string }[] }[];
  availableHotels: { hotelId: string; hotelName: string; availableRoomTypes?: { roomTypeId: string; roomTypeName: string; ratePlan?: { ratePlanId: number; priceRetail: number } }[] }[];
  currentBooking: { order: { bookings: { bookingId: string }[] } } | null;
}) {
  const [activeSection, setActiveSection] = useState<'create' | 'view' | 'cancel'>('create');

  // Create booking form state
  const [hotelId, setHotelId] = useState('');
  const [roomTypeId, setRoomTypeId] = useState('');
  const [ratePlanId, setRatePlanId] = useState(0);
  const [checkIn, setCheckIn] = useState('20260210');
  const [checkOut, setCheckOut] = useState('20260212');
  const [numberGuests, setNumberGuests] = useState(2);
  const [numberAdults, setNumberAdults] = useState(2);
  const [numberChildren, setNumberChildren] = useState(0);
  const [numberInfants, setNumberInfants] = useState(0);
  const [guestGivenName, setGuestGivenName] = useState('Test');
  const [guestFamilyName, setGuestFamilyName] = useState('Booking');
  const [guestEmail, setGuestEmail] = useState('test@example.com');
  const [priceRetailMax, setPriceRetailMax] = useState(500000);

  // View/Cancel booking state
  const [bookingId, setBookingId] = useState('');

  const selectedHotel = availableHotels.find((h) => h.hotelId === hotelId);
  const availableRooms = selectedHotel?.availableRoomTypes || [];

  return (
    <div className="space-y-4">
      {/* Section Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'create' as const, label: 'Create Booking', icon: <Plus className="w-4 h-4" /> },
          { id: 'view' as const, label: 'View Booking', icon: <Eye className="w-4 h-4" /> },
          { id: 'cancel' as const, label: 'Cancel Booking', icon: <X className="w-4 h-4" /> },
        ].map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${
              activeSection === section.id
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'bg-white/5 text-white/60 hover:bg-white/10 border border-transparent'
            }`}
          >
            {section.icon}
            {section.label}
          </button>
        ))}
      </div>

      {/* Create Booking */}
      {activeSection === 'create' && (
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-green-400" />
              Create Booking
            </h3>
            <p className="text-white/50 text-xs mt-1">GET /extws/hotel/v1/createBooking</p>
          </div>
          <div className="p-4 space-y-4">
            {availableHotels.length === 0 ? (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-sm">
                Run Availability Search first to find available rooms with pricing
              </div>
            ) : (
              <>
                {/* Hotel & Room Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-white/50 mb-1">Hotel *</label>
                    <select
                      value={hotelId}
                      onChange={(e) => {
                        setHotelId(e.target.value);
                        setRoomTypeId('');
                        setRatePlanId(0);
                      }}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                    >
                      <option value="" className="bg-slate-800">Select hotel...</option>
                      {availableHotels.map((hotel) => (
                        <option key={hotel.hotelId} value={hotel.hotelId} className="bg-slate-800">
                          {hotel.hotelName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1">Room Type *</label>
                    <select
                      value={roomTypeId}
                      onChange={(e) => {
                        setRoomTypeId(e.target.value);
                        const room = availableRooms.find((r) => r.roomTypeId === e.target.value);
                        if (room?.ratePlan) {
                          setRatePlanId(room.ratePlan.ratePlanId);
                          setPriceRetailMax(room.ratePlan.priceRetail);
                        }
                      }}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                      disabled={!hotelId}
                    >
                      <option value="" className="bg-slate-800">Select room...</option>
                      {availableRooms.map((room) => (
                        <option key={room.roomTypeId} value={room.roomTypeId} className="bg-slate-800">
                          {room.roomTypeName} - ¥{room.ratePlan?.priceRetail?.toLocaleString()}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Rate Plan & Price */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-white/50 mb-1">Rate Plan ID *</label>
                    <input
                      type="number"
                      value={ratePlanId}
                      onChange={(e) => setRatePlanId(parseInt(e.target.value))}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1">Max Price (priceRetailMax) *</label>
                    <input
                      type="number"
                      value={priceRetailMax}
                      onChange={(e) => setPriceRetailMax(parseInt(e.target.value))}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-white/50 mb-1">Check-in *</label>
                    <input
                      type="text"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1">Check-out *</label>
                    <input
                      type="text"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Guests */}
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="block text-xs text-white/50 mb-1">Guests *</label>
                    <input
                      type="number"
                      value={numberGuests}
                      onChange={(e) => setNumberGuests(parseInt(e.target.value))}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1">Adults *</label>
                    <input
                      type="number"
                      value={numberAdults}
                      onChange={(e) => setNumberAdults(parseInt(e.target.value))}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1">Children</label>
                    <input
                      type="number"
                      value={numberChildren}
                      onChange={(e) => setNumberChildren(parseInt(e.target.value))}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1">Infants</label>
                    <input
                      type="number"
                      value={numberInfants}
                      onChange={(e) => setNumberInfants(parseInt(e.target.value))}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Guest Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-white/50 mb-1">First Name *</label>
                    <input
                      type="text"
                      value={guestGivenName}
                      onChange={(e) => setGuestGivenName(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1">Last Name *</label>
                    <input
                      type="text"
                      value={guestFamilyName}
                      onChange={(e) => setGuestFamilyName(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-white/50 mb-1">Email</label>
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  onClick={() =>
                    onCreateBooking({
                      hotelId,
                      roomTypeId,
                      ratePlanId,
                      checkIn,
                      checkOut,
                      numberGuests,
                      numberAdults,
                      numberChildren,
                      numberInfants,
                      guestGivenName,
                      guestFamilyName,
                      guestEmail,
                      priceRetailMax,
                      bookingExtent: 'RESERVATION',
                    })
                  }
                  disabled={isLoading || !hotelId || !roomTypeId || !ratePlanId}
                  className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Create Booking
                </button>
              </>
            )}

            {currentBooking && (
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="flex items-center gap-2 text-green-400 text-sm mb-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Last Booking Created
                </div>
                <div className="font-mono text-xs text-white/70">
                  {currentBooking.order.bookings[0]?.bookingId}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* View Booking */}
      {activeSection === 'view' && (
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-400" />
              View Booking
            </h3>
            <p className="text-white/50 text-xs mt-1">GET /extws/hotel/v1/listBooking</p>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-xs text-white/50 mb-1">Booking ID *</label>
              <input
                type="text"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-blue-500"
                placeholder="8a80818a9b75ada3019b7a371b4f62ba"
              />
            </div>

            {currentBooking && (
              <button
                onClick={() => setBookingId(currentBooking.order.bookings[0]?.bookingId || '')}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                Use last created booking ID
              </button>
            )}

            <button
              onClick={() => onListBooking(bookingId)}
              disabled={isLoading || !bookingId}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
              View Booking
            </button>
          </div>
        </div>
      )}

      {/* Cancel Booking */}
      {activeSection === 'cancel' && (
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <X className="w-4 h-4 text-red-400" />
              Cancel Booking
            </h3>
            <p className="text-white/50 text-xs mt-1">GET /extws/hotel/v1/cancelBooking</p>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-xs text-white/50 mb-1">Booking ID *</label>
              <input
                type="text"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-blue-500"
                placeholder="8a80818a9b75ada3019b7a371b4f62ba"
              />
            </div>

            {currentBooking && (
              <button
                onClick={() => setBookingId(currentBooking.order.bookings[0]?.bookingId || '')}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                Use last created booking ID
              </button>
            )}

            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              Warning: This action will cancel the booking and cannot be undone.
            </div>

            <button
              onClick={() => onCancelBooking(bookingId)}
              disabled={isLoading || !bookingId}
              className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
              Cancel Booking
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Guest Services Panel
function GuestServicesPanel({
  onListVendors,
  onListCategories,
  onListProducts,
  isLoading,
  vendors,
  categories,
  products,
}: {
  onListVendors: (countryCode: string, locationCode: string) => Promise<void>;
  onListCategories: (vendorId: string, lang: string) => Promise<void>;
  onListProducts: (categoryId: string, lang: string) => Promise<void>;
  isLoading: boolean;
  vendors: { id: string; name: string; vendorType: string }[];
  categories: { id: string; name: string; children?: { id: string; name: string }[] }[];
  products: { id: string; name: string }[];
}) {
  const [countryCode, setCountryCode] = useState('JP');
  const [locationCode, setLocationCode] = useState('NISEKO');
  const [vendorId, setVendorId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [lang, setLang] = useState('en');

  const locations = LOCATION_CODES[countryCode as keyof typeof LOCATION_CODES] || [];

  // Flatten categories for selection
  const flatCategories = categories.flatMap((cat) => [
    { id: cat.id, name: cat.name },
    ...(cat.children || []).map((child) => ({ id: child.id, name: `  └ ${child.name}` })),
  ]);

  return (
    <div className="space-y-4">
      {/* List Vendors */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Building className="w-4 h-4 text-amber-400" />
            List Vendors
          </h3>
          <p className="text-white/50 text-xs mt-1">GET /extws/gs/v1/vendors/list</p>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/50 mb-1">Country Code *</label>
              <select
                value={countryCode}
                onChange={(e) => {
                  setCountryCode(e.target.value);
                  const locs = LOCATION_CODES[e.target.value as keyof typeof LOCATION_CODES];
                  if (locs && locs.length > 0) {
                    setLocationCode(locs[0].code);
                  }
                }}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              >
                {Object.keys(LOCATION_CODES).map((code) => (
                  <option key={code} value={code} className="bg-slate-800">
                    {code}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">Location Code *</label>
              <select
                value={locationCode}
                onChange={(e) => setLocationCode(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              >
                {locations.map((loc) => (
                  <option key={loc.code} value={loc.code} className="bg-slate-800">
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={() => onListVendors(countryCode, locationCode)}
            disabled={isLoading}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/50 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            List Vendors
          </button>

          {vendors.length > 0 && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                Found {vendors.length} vendor(s)
              </div>
            </div>
          )}
        </div>
      </div>

      {/* List Categories */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-cyan-400" />
            List Categories
          </h3>
          <p className="text-white/50 text-xs mt-1">GET /extws/gs/v1/categories/list</p>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-xs text-white/50 mb-1">Vendor *</label>
            {vendors.length === 0 ? (
              <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-xs">
                List vendors first
              </div>
            ) : (
              <select
                value={vendorId}
                onChange={(e) => setVendorId(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="" className="bg-slate-800">Select vendor...</option>
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id} className="bg-slate-800">
                    {vendor.name} ({vendor.vendorType})
                  </option>
                ))}
              </select>
            )}
          </div>
          <button
            onClick={() => onListCategories(vendorId, lang)}
            disabled={isLoading || !vendorId}
            className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-500/50 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            List Categories
          </button>
        </div>
      </div>

      {/* List Products */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-purple-400" />
            List Products
          </h3>
          <p className="text-white/50 text-xs mt-1">GET /extws/gs/v1/products/list</p>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-xs text-white/50 mb-1">Category *</label>
            {flatCategories.length === 0 ? (
              <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-xs">
                List categories first
              </div>
            ) : (
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="" className="bg-slate-800">Select category...</option>
                {flatCategories.map((cat) => (
                  <option key={cat.id} value={cat.id} className="bg-slate-800">
                    {cat.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          <button
            onClick={() => onListProducts(categoryId, lang)}
            disabled={isLoading || !categoryId}
            className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-purple-500/50 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            List Products
          </button>

          {products.length > 0 && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                Found {products.length} product(s)
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Request History Panel
function RequestHistoryPanel({
  requests,
  onSelect,
  onClear,
}: {
  requests: {
    id: string;
    timestamp: Date;
    method: string;
    endpoint: string;
    duration: number;
    status: 'success' | 'error';
    statusCode?: number;
    response: unknown;
  }[];
  onSelect: (request: { response: unknown }) => void;
  onClear: () => void;
}) {
  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <History className="w-4 h-4 text-blue-400" />
          Request History
        </h3>
        {requests.length > 0 && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 px-2 py-1 bg-red-500/20 hover:bg-red-500/30 rounded text-xs text-red-400 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>
      <div className="max-h-[600px] overflow-y-auto">
        {requests.length === 0 ? (
          <div className="p-8 text-center text-white/30">
            <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No requests yet</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {requests.map((request) => (
              <button
                key={request.id}
                onClick={() => onSelect(request)}
                className="w-full p-4 hover:bg-white/5 transition-colors text-left"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-1.5 py-0.5 rounded text-xs font-mono ${
                      request.status === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {request.method}
                    </span>
                    <span className="text-white/80 text-sm font-mono truncate max-w-[200px]">
                      {request.endpoint}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {request.status === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                    <span className="text-white/40 text-xs">{request.statusCode}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-white/40">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {request.duration}ms
                  </span>
                  <span>{request.timestamp.toLocaleTimeString()}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
