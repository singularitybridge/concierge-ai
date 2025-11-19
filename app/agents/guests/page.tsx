'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Users, Star, Calendar, Clock, MessageSquare } from 'lucide-react';
import VoiceSessionChat from '../../components/VoiceSessionChat';

// Mock guest data
const todayArrivals = [
  { name: 'Tanaka Family', room: 'Sky Suite', time: '15:00', guests: 4, vip: true, requests: 'Early check-in, child bed' },
  { name: 'Mr. Chen', room: 'Onsen Suite', time: '16:00', guests: 2, vip: false, requests: 'Airport pickup arranged' },
];

const todayDepartures = [
  { name: 'Ms. Williams', room: 'Mountain Suite', time: '11:00', guests: 1, requests: 'Late checkout approved' },
];

const currentGuests = [
  { name: 'Sato Couple', room: 'Garden Suite', checkIn: 'Dec 8', checkOut: 'Dec 12', requests: 'Anniversary - champagne delivered' },
  { name: 'Kim Family', room: 'Forest Suite', checkIn: 'Dec 9', checkOut: 'Dec 11', requests: 'Kosher meals' },
  { name: 'Dr. Yamamoto', room: 'Valley Suite', checkIn: 'Dec 9', checkOut: 'Dec 13', requests: 'Extra pillows, quiet room' },
];

const recentRequests = [
  { guest: 'Sato Couple', request: 'Dinner reservation at 19:00', status: 'Confirmed', time: '10 min ago' },
  { guest: 'Kim Family', request: 'Ski equipment rental', status: 'In Progress', time: '25 min ago' },
  { guest: 'Dr. Yamamoto', request: 'Spa appointment tomorrow', status: 'Pending', time: '1 hour ago' },
];

export default function GuestsAgentPage() {
  return (
    <div className="flex h-screen bg-stone-100">
      {/* Left: Guest Management Dashboard */}
      <div className="flex-[2] min-w-0 overflow-hidden">
        <div className="flex flex-col h-full bg-white">
          {/* Hero Image */}
          <div className="relative h-64 flex-shrink-0">
            <Image
              src="/hotel3.jpg"
              alt="Guest Services"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            {/* Back Button */}
            <Link
              href="/admin"
              className="absolute top-4 left-4 p-2 bg-white/80 backdrop-blur-sm rounded-full text-stone-600 hover:bg-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            {/* Title Overlay */}
            <div className="absolute bottom-6 left-8 right-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/80">Guest Services</p>
              </div>
              <h1 className="text-2xl font-light text-white tracking-wide" style={{ fontFamily: 'var(--font-cormorant)' }}>
                Reservations & Profiles
              </h1>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Today's Overview */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span className="text-xs text-blue-700">Arrivals Today</span>
                </div>
                <p className="text-2xl font-light text-blue-900">{todayArrivals.length}</p>
              </div>
              <div className="p-4 bg-stone-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-stone-400" />
                  <span className="text-xs text-stone-500">Departures Today</span>
                </div>
                <p className="text-2xl font-light text-stone-800">{todayDepartures.length}</p>
              </div>
              <div className="p-4 bg-stone-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-stone-400" />
                  <span className="text-xs text-stone-500">In-House</span>
                </div>
                <p className="text-2xl font-light text-stone-800">{currentGuests.length}</p>
              </div>
            </div>

            {/* Arrivals */}
            <div>
              <h3 className="text-xs font-medium text-stone-500 mb-3 uppercase tracking-wider">Today's Arrivals</h3>
              <div className="space-y-2">
                {todayArrivals.map((guest, idx) => (
                  <div key={idx} className="p-3 bg-stone-50 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-stone-800">{guest.name}</p>
                        {guest.vip && (
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        )}
                      </div>
                      <span className="text-xs text-stone-500">{guest.time}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-600">{guest.room} • {guest.guests} guests</span>
                    </div>
                    {guest.requests && (
                      <p className="text-xs text-blue-600 mt-1">{guest.requests}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Current Guests */}
            <div>
              <h3 className="text-xs font-medium text-stone-500 mb-3 uppercase tracking-wider">Current Guests</h3>
              <div className="space-y-2">
                {currentGuests.map((guest, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-stone-800">{guest.name}</p>
                      <p className="text-xs text-stone-500">{guest.room} • {guest.checkIn} - {guest.checkOut}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-stone-600 max-w-[200px] truncate">{guest.requests}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Requests */}
            <div>
              <h3 className="text-xs font-medium text-stone-500 mb-3 uppercase tracking-wider">Recent Requests</h3>
              <div className="space-y-2">
                {recentRequests.map((req, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-4 h-4 text-stone-400" />
                      <div>
                        <p className="text-sm text-stone-800">{req.request}</p>
                        <p className="text-xs text-stone-500">{req.guest} • {req.time}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      req.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' :
                      req.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Right: Voice Chat */}
      <div className="flex-[1] min-w-0 p-6">
        <VoiceSessionChat agentId="guest-services" sessionId="guests" />
      </div>
    </div>
  );
}
