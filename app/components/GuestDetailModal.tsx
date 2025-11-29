'use client';

import { X, Star, Phone, Mail, MessageSquare, Car, StickyNote, Clock, Calendar, Users, Globe, Heart, MapPin } from 'lucide-react';

export interface GuestData {
  id: string;
  name: string;
  roomNumber: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  status: 'arriving' | 'checked-in' | 'checked-out' | 'vip';
  guestCount: number;
  nationality: string;
  language: string;
  email?: string;
  phone?: string;
  preferences: string[];
  notes: string;
  specialRequests?: string[];
  previousStays: number;
  loyaltyTier: 'standard' | 'gold' | 'platinum';
  arrivalTime?: string;
  flightNumber?: string;
}

interface GuestDetailModalProps {
  guest: GuestData | null;
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (guestId: string) => void;
  onOfferPickup: (guestId: string) => void;
  onAddNote: (guestId: string) => void;
}

export default function GuestDetailModal({
  guest,
  isOpen,
  onClose,
  onSendMessage,
  onOfferPickup,
  onAddNote
}: GuestDetailModalProps) {
  if (!isOpen || !guest) return null;

  const statusColors = {
    'arriving': 'bg-blue-100 text-blue-700',
    'checked-in': 'bg-emerald-100 text-emerald-700',
    'checked-out': 'bg-stone-100 text-stone-600',
    'vip': 'bg-amber-100 text-amber-700'
  };

  const tierColors = {
    'standard': 'text-stone-500',
    'gold': 'text-amber-500',
    'platinum': 'text-purple-500'
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-stone-800 to-stone-700 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-stone-600 flex items-center justify-center text-2xl font-light">
              {guest.name.charAt(0)}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-medium">{guest.name}</h2>
                {guest.status === 'vip' && (
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                )}
              </div>

              <div className="flex items-center gap-3 text-sm text-stone-300">
                <span>{guest.roomType}</span>
                <span>•</span>
                <span className="font-medium text-white">{guest.roomNumber}</span>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[guest.status]}`}>
                  {guest.status === 'vip' ? 'VIP Guest' : guest.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
                {guest.loyaltyTier !== 'standard' && (
                  <span className={`flex items-center gap-1 text-xs ${tierColors[guest.loyaltyTier]}`}>
                    <Star className="w-3 h-3 fill-current" />
                    {guest.loyaltyTier.charAt(0).toUpperCase() + guest.loyaltyTier.slice(1)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[50vh] overflow-y-auto">
          {/* Stay Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-stone-100 rounded-lg">
                <Calendar className="w-4 h-4 text-stone-500" />
              </div>
              <div>
                <p className="text-xs text-stone-400">Check-in</p>
                <p className="text-sm font-medium text-stone-800">{guest.checkIn}</p>
                {guest.arrivalTime && (
                  <p className="text-xs text-blue-600">{guest.arrivalTime}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-stone-100 rounded-lg">
                <Clock className="w-4 h-4 text-stone-500" />
              </div>
              <div>
                <p className="text-xs text-stone-400">Check-out</p>
                <p className="text-sm font-medium text-stone-800">{guest.checkOut}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-stone-100 rounded-lg">
                <Users className="w-4 h-4 text-stone-500" />
              </div>
              <div>
                <p className="text-xs text-stone-400">Guests</p>
                <p className="text-sm font-medium text-stone-800">{guest.guestCount} {guest.guestCount === 1 ? 'guest' : 'guests'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-stone-100 rounded-lg">
                <Globe className="w-4 h-4 text-stone-500" />
              </div>
              <div>
                <p className="text-xs text-stone-400">From</p>
                <p className="text-sm font-medium text-stone-800">{guest.nationality}</p>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          {(guest.email || guest.phone) && (
            <div className="pt-4 border-t border-stone-100">
              <h4 className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-3">Contact</h4>
              <div className="space-y-2">
                {guest.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-stone-400" />
                    <span className="text-stone-700">{guest.phone}</span>
                  </div>
                )}
                {guest.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-stone-400" />
                    <span className="text-stone-700">{guest.email}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Preferences */}
          {guest.preferences.length > 0 && (
            <div className="pt-4 border-t border-stone-100">
              <h4 className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-3">Preferences</h4>
              <div className="flex flex-wrap gap-2">
                {guest.preferences.map((pref, idx) => (
                  <span key={idx} className="flex items-center gap-1 px-2.5 py-1 bg-rose-50 text-rose-700 rounded-full text-xs">
                    <Heart className="w-3 h-3" />
                    {pref}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Special Requests */}
          {guest.specialRequests && guest.specialRequests.length > 0 && (
            <div className="pt-4 border-t border-stone-100">
              <h4 className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-3">Special Requests</h4>
              <ul className="space-y-1.5">
                {guest.specialRequests.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-stone-600">
                    <span className="text-blue-500 mt-0.5">•</span>
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Notes */}
          {guest.notes && (
            <div className="pt-4 border-t border-stone-100">
              <h4 className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-3">Notes</h4>
              <p className="text-sm text-stone-600 bg-stone-50 p-3 rounded-lg">{guest.notes}</p>
            </div>
          )}

          {/* Previous Stays */}
          {guest.previousStays > 0 && (
            <div className="pt-4 border-t border-stone-100">
              <div className="flex items-center gap-2 text-sm text-stone-500">
                <MapPin className="w-4 h-4" />
                <span>{guest.previousStays} previous {guest.previousStays === 1 ? 'stay' : 'stays'} at The 1898</span>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-stone-100 bg-stone-50">
          <div className="flex gap-2">
            <button
              onClick={() => onSendMessage(guest.id)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-800 text-white rounded-lg hover:bg-stone-700 transition-colors text-sm"
            >
              <MessageSquare className="w-4 h-4" />
              Send Message
            </button>
            <button
              onClick={() => onOfferPickup(guest.id)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-stone-200 text-stone-700 rounded-lg hover:bg-stone-50 transition-colors text-sm"
            >
              <Car className="w-4 h-4" />
              Pickup
            </button>
            <button
              onClick={() => onAddNote(guest.id)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-stone-200 text-stone-700 rounded-lg hover:bg-stone-50 transition-colors text-sm"
            >
              <StickyNote className="w-4 h-4" />
              Note
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
