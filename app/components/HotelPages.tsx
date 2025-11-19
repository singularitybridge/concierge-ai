'use client';

import { useState, useEffect } from 'react';
import { MapPin, Mail, Mountain, Snowflake, Bath, Car, UtensilsCrossed, ChevronLeft, ChevronRight, Bed, Sparkles, Coffee, Calendar, Clock, Phone, Users, Mic } from 'lucide-react';
import Image from 'next/image';

const images = ['/hotel1.jpg', '/hotel2.jpg', '/hotel3.jpg', '/hotel4.jpg'];

type Page = 'invitation' | 'suites' | 'dining' | 'location';

interface RegistrationData {
  guestName: string;
  company?: string;
  email?: string;
  phone?: string;
  totalGuests?: number;
  children?: string;
  transportation?: string;
  dietary?: string;
  timing?: string;
  overnight?: boolean;
  remarks?: string;
}

export default function HotelPages() {
  const [currentImage, setCurrentImage] = useState(0);
  const [activePage, setActivePage] = useState<Page>('invitation');
  const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null);
  const [isRegistrationComplete, setIsRegistrationComplete] = useState(false);

  const nextImage = () => setCurrentImage((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImage((prev) => (prev - 1 + images.length) % images.length);

  // Listen for events from voice AI
  useEffect(() => {
    const handleNavigateTab = (event: CustomEvent<{ tab: string }>) => {
      const tab = event.detail.tab as Page;
      if (['invitation', 'suites', 'dining', 'location'].includes(tab)) {
        setActivePage(tab);
      }
    };

    const handleShowRegistration = (event: CustomEvent<RegistrationData>) => {
      console.log('📋 show-registration event received:', event.detail);
      setRegistrationData(event.detail);
      setIsRegistrationComplete(false);
      setActivePage('invitation');
    };

    const handleRegistrationComplete = (event: CustomEvent<{ guestName: string }>) => {
      console.log('✅ registration-complete event received:', event.detail);
      setIsRegistrationComplete(true);
    };

    window.addEventListener('navigate-tab', handleNavigateTab as EventListener);
    window.addEventListener('show-registration', handleShowRegistration as EventListener);
    window.addEventListener('registration-complete', handleRegistrationComplete as EventListener);

    return () => {
      window.removeEventListener('navigate-tab', handleNavigateTab as EventListener);
      window.removeEventListener('show-registration', handleShowRegistration as EventListener);
      window.removeEventListener('registration-complete', handleRegistrationComplete as EventListener);
    };
  }, []);

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Hero Image Carousel */}
      <div className="relative h-64 flex-shrink-0 group">
        <Image
          src={images[currentImage]}
          alt="The 1898 Niseko"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Navigation Arrows */}
        <button
          onClick={prevImage}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
        >
          <ChevronLeft className="w-5 h-5 text-stone-800" />
        </button>
        <button
          onClick={nextImage}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
        >
          <ChevronRight className="w-5 h-5 text-stone-800" />
        </button>

        {/* Image Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentImage(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentImage ? 'bg-white w-6' : 'bg-white/40'
              }`}
            />
          ))}
        </div>

        {/* Hotel Name Overlay */}
        <div className="absolute bottom-10 left-8 right-8">
          <h1 className="text-3xl font-light text-white tracking-widest" style={{ fontFamily: 'var(--font-cormorant)' }}>
            THE 1898 NISEKO
          </h1>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex border-b border-stone-200 px-6">
        {(['invitation', 'suites', 'dining', 'location'] as Page[]).map((page) => (
          <button
            key={page}
            onClick={() => setActivePage(page)}
            className={`px-4 py-3 text-xs uppercase tracking-[0.15em] transition-colors ${
              activePage === page
                ? 'text-stone-800 border-b-2 border-stone-800'
                : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            {page === 'invitation' ? 'Event' : page}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activePage === 'invitation' && <InvitationPage registrationData={registrationData} isComplete={isRegistrationComplete} />}
        {activePage === 'suites' && <SuitesPage />}
        {activePage === 'dining' && <DiningPage />}
        {activePage === 'location' && <LocationPage />}
      </div>
    </div>
  );
}

function InvitationPage({ registrationData, isComplete }: { registrationData: RegistrationData | null; isComplete: boolean }) {
  return (
    <div className="p-8 space-y-6">
      {/* Registration Summary - shown when data is available */}
      {registrationData && (
        <div className={`p-5 rounded-lg border ${isComplete ? 'bg-green-50 border-green-200' : 'bg-stone-50 border-stone-200'}`}>
          <div className="flex items-center gap-2 mb-3">
            {isComplete ? (
              <>
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-green-800">Registration Confirmed</h3>
              </>
            ) : (
              <h3 className="text-sm font-medium text-stone-700">Registration Summary</h3>
            )}
          </div>
          <div className="space-y-1.5 text-sm">
            <p className="text-stone-700"><span className="text-stone-500">Guest:</span> {registrationData.guestName}</p>
            {registrationData.company && <p className="text-stone-700"><span className="text-stone-500">Company:</span> {registrationData.company}</p>}
            {registrationData.email && <p className="text-stone-700"><span className="text-stone-500">Email:</span> {registrationData.email}</p>}
            {registrationData.phone && <p className="text-stone-700"><span className="text-stone-500">Phone:</span> {registrationData.phone}</p>}
            {registrationData.totalGuests && <p className="text-stone-700"><span className="text-stone-500">Guests:</span> {registrationData.totalGuests}</p>}
            {registrationData.children && <p className="text-stone-700"><span className="text-stone-500">Children:</span> {registrationData.children}</p>}
            {registrationData.transportation && <p className="text-stone-700"><span className="text-stone-500">Transportation:</span> {registrationData.transportation}</p>}
            {registrationData.dietary && <p className="text-stone-700"><span className="text-stone-500">Dietary:</span> {registrationData.dietary}</p>}
            {registrationData.timing && <p className="text-stone-700"><span className="text-stone-500">Timing:</span> {registrationData.timing}</p>}
            {registrationData.overnight !== undefined && <p className="text-stone-700"><span className="text-stone-500">Overnight:</span> {registrationData.overnight ? 'Yes' : 'No'}</p>}
            {registrationData.remarks && <p className="text-stone-700"><span className="text-stone-500">Remarks:</span> {registrationData.remarks}</p>}
          </div>
          {isComplete && (
            <p className="mt-3 text-xs text-green-700">We look forward to welcoming you on December 10th.</p>
          )}
        </div>
      )}

      {/* Event Header */}
      <div className="text-center pb-4 border-b border-stone-200">
        <p className="text-xs uppercase tracking-[0.3em] text-stone-400 mb-2">You are cordially invited to</p>
        <h2 className="text-2xl font-light text-stone-800 tracking-wide" style={{ fontFamily: 'var(--font-cormorant)' }}>
          Grand Opening Celebration
        </h2>
      </div>

      {/* Event Details */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-stone-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-stone-700">Wednesday, December 10, 2025</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Clock className="w-4 h-4 text-stone-400 flex-shrink-0" />
          <div>
            <p className="text-sm text-stone-700">16:00 Tokyo Time</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <MapPin className="w-4 h-4 text-stone-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-stone-700">52-50 Kabayama, Kutchan-cho</p>
            <p className="text-sm text-stone-600">Abuta-gun District, Hokkaido</p>
          </div>
        </div>
      </div>

      {/* Voice Registration CTA */}
      <div className="bg-stone-800 text-white rounded-lg p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Mic className="w-4 h-4" />
          <h3 className="text-sm font-medium uppercase tracking-wider">Register via Voice</h3>
        </div>
        <p className="text-sm text-stone-300 leading-relaxed">
          Use our AI Concierge to register for this exclusive event. Simply start a voice call
          and provide your details including guests, dietary requirements, and transportation needs.
        </p>
      </div>

      {/* Registration Info */}
      <div>
        <h3 className="text-xs font-medium text-stone-500 mb-3 uppercase tracking-[0.2em]">Registration Details</h3>
        <div className="space-y-2 text-sm text-stone-600">
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5" />
            <span>Guest name, company & contact</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5" />
            <span>Partners & children attending</span>
          </div>
          <div className="flex items-center gap-2">
            <Car className="w-3.5 h-3.5" />
            <span>Transportation arrangements</span>
          </div>
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Dietary requirements & allergies</span>
          </div>
          <div className="flex items-center gap-2">
            <Bed className="w-3.5 h-3.5" />
            <span>Overnight accommodation</span>
          </div>
        </div>
      </div>

      {/* RSVP Contact */}
      <div className="pt-4 border-t border-stone-100">
        <p className="text-xs text-stone-400 uppercase tracking-wider mb-2">RSVP Contact</p>
        <div className="space-y-1">
          <a href="tel:080-6376-6211" className="flex items-center gap-2 text-sm text-stone-600 hover:text-stone-800">
            <Phone className="w-3.5 h-3.5" />
            Katrina: 080-6376-6211
          </a>
          <a href="mailto:klam@aidpartners.com" className="flex items-center gap-2 text-sm text-stone-600 hover:text-stone-800">
            <Mail className="w-3.5 h-3.5" />
            klam@aidpartners.com
          </a>
        </div>
      </div>
    </div>
  );
}

function SuitesPage() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-light text-stone-800 tracking-wide mb-2" style={{ fontFamily: 'var(--font-cormorant)' }}>
          Exclusive Suites
        </h2>
        <p className="text-sm text-stone-500">Six intimate retreats with unparalleled views</p>
      </div>

      <p className="text-stone-700 leading-relaxed" style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.1rem' }}>
        Each of our six suites features floor-to-ceiling windows framing Mount Yotei, heated floors,
        and premium furnishings. Private natural onsen baths fed by mineral-rich spring water
        offer the ultimate in relaxation.
      </p>

      {/* Suite Features */}
      <div>
        <h3 className="text-xs font-medium text-stone-500 mb-4 uppercase tracking-[0.2em]">Suite Amenities</h3>
        <div className="space-y-3">
          {[
            { icon: Bath, label: 'Private natural onsen with mineral-rich spring water' },
            { icon: Sparkles, label: 'Heated floors throughout' },
            { icon: Mountain, label: 'Floor-to-ceiling Mount Yotei views' },
            { icon: Bed, label: 'Direct private elevator access' },
            { icon: Snowflake, label: 'Ski boot warmers & heated lockers' },
          ].map((feature) => (
            <div key={feature.label} className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg border border-stone-100">
              <feature.icon className="w-4 h-4 text-stone-500" />
              <span className="text-sm text-stone-700">{feature.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Services */}
      <div>
        <h3 className="text-xs font-medium text-stone-500 mb-4 uppercase tracking-[0.2em]">Housekeeping</h3>
        <div className="space-y-2">
          {[
            'Daily refresh & turndown service',
            'Complimentary self-service laundry',
            'Professional wash-and-fold available',
          ].map((service) => (
            <div key={service} className="flex items-center gap-3 text-sm text-stone-700">
              <div className="w-1 h-1 bg-stone-400 rounded-full" />
              <span>{service}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Event Note */}
      <div className="p-4 bg-stone-800 text-white rounded-lg">
        <p className="text-sm">
          <span className="font-medium">Grand Opening Event:</span> Overnight accommodation available
          for guests. Please indicate during registration if you wish to stay.
        </p>
      </div>
    </div>
  );
}

function DiningPage() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-light text-stone-800 tracking-wide mb-2" style={{ fontFamily: 'var(--font-cormorant)' }}>
          Gourmet Dining
        </h2>
        <p className="text-sm text-stone-500">World-class cuisine with on-site sommelier</p>
      </div>

      <p className="text-stone-700 leading-relaxed" style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.1rem' }}>
        Our world-class on-site restaurant features acclaimed chefs highlighting Hokkaido&apos;s
        seasonal produce and local seafood. Artisanal breakfasts with fresh-baked breads and
        in-suite chef-selected dining complete the culinary experience.
      </p>

      {/* Dining Features */}
      <div>
        <h3 className="text-xs font-medium text-stone-500 mb-4 uppercase tracking-[0.2em]">On-Site Dining</h3>
        <div className="space-y-3">
          {[
            { icon: UtensilsCrossed, label: 'Acclaimed chef-driven restaurant' },
            { icon: Sparkles, label: 'On-site sommelier services' },
            { icon: Coffee, label: 'Artisanal breakfast with fresh-baked breads' },
          ].map((feature) => (
            <div key={feature.label} className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg border border-stone-100">
              <feature.icon className="w-4 h-4 text-stone-500" />
              <span className="text-sm text-stone-700">{feature.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Nearby Restaurants */}
      <div>
        <h3 className="text-xs font-medium text-stone-500 mb-4 uppercase tracking-[0.2em]">Nearby Dining</h3>
        <div className="space-y-2">
          {[
            'Sushi Shin — Michelin three-star',
            'Tsubaki Wagyu Kaiseki',
            'Luke\'s Steakhouse',
            'Bar Gyu+ & Toshiro\'s Bar',
          ].map((restaurant) => (
            <div key={restaurant} className="flex items-center gap-3 text-sm text-stone-700">
              <div className="w-1 h-1 bg-stone-400 rounded-full" />
              <span>{restaurant}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Event Note */}
      <div className="p-4 bg-stone-800 text-white rounded-lg">
        <p className="text-sm">
          <span className="font-medium">Grand Opening Event:</span> Please inform us of any dietary
          requirements or food allergies during registration.
        </p>
      </div>
    </div>
  );
}

function LocationPage() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-light text-stone-800 tracking-wide mb-2" style={{ fontFamily: 'var(--font-cormorant)' }}>
          Getting Here
        </h2>
        <p className="text-sm text-stone-500">Transportation options to The 1898 Niseko</p>
      </div>

      <p className="text-stone-700 leading-relaxed" style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.1rem' }}>
        Located 2.5 hours from New Chitose Airport in Sapporo, at the heart of Japan&apos;s
        premier alpine destination. We offer complimentary airport transfers for all guests.
      </p>

      {/* Transportation Options */}
      <div>
        <h3 className="text-xs font-medium text-stone-500 mb-4 uppercase tracking-[0.2em]">Transportation</h3>
        <div className="space-y-3">
          {[
            { icon: Car, label: 'Complimentary airport transfers' },
            { icon: Car, label: 'Private car service available' },
            { icon: Snowflake, label: 'Daily ski resort shuttles' },
            { icon: MapPin, label: 'Valet parking with winter care' },
          ].map((feature) => (
            <div key={feature.label} className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg border border-stone-100">
              <feature.icon className="w-4 h-4 text-stone-500" />
              <span className="text-sm text-stone-700">{feature.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Address */}
      <div>
        <h3 className="text-xs font-medium text-stone-500 mb-4 uppercase tracking-[0.2em]">Address</h3>
        <div className="p-4 bg-stone-50 rounded-lg border border-stone-100">
          <p className="text-sm text-stone-700">52-50 Kabayama, Kutchan-cho</p>
          <p className="text-sm text-stone-700">Abuta-gun District</p>
          <p className="text-sm text-stone-700">Hokkaido 044-0081, Japan</p>
        </div>
      </div>

      {/* Distance Info */}
      <div>
        <h3 className="text-xs font-medium text-stone-500 mb-4 uppercase tracking-[0.2em]">Distances</h3>
        <div className="space-y-2">
          {[
            'New Chitose Airport — 2.5 hours',
            'Sapporo City — 2 hours',
            'Grand Hirafu Gondola — 5 minutes',
            'Kutchan Station — 15 minutes',
          ].map((distance) => (
            <div key={distance} className="flex items-center gap-3 text-sm text-stone-700">
              <div className="w-1 h-1 bg-stone-400 rounded-full" />
              <span>{distance}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Event Note */}
      <div className="p-4 bg-stone-800 text-white rounded-lg">
        <p className="text-sm">
          <span className="font-medium">Grand Opening Event:</span> Please indicate your transportation
          needs during registration so we can arrange pickup accordingly.
        </p>
      </div>
    </div>
  );
}
