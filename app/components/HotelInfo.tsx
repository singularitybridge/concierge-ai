'use client';

import { useState } from 'react';
import { MapPin, Mail, Mountain, Snowflake, Bath, Car, UtensilsCrossed, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

const images = ['/hotel1.jpg', '/hotel2.jpg', '/hotel3.jpg', '/hotel4.jpg'];

const amenities = [
  { icon: Car, label: 'Airport Transfers' },
  { icon: Snowflake, label: 'Daily Ski Shuttles' },
  { icon: Bath, label: 'Private Onsen' },
  { icon: UtensilsCrossed, label: 'Gourmet Dining' },
];

export default function HotelInfo() {
  const [currentImage, setCurrentImage] = useState(0);

  const nextImage = () => setCurrentImage((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImage((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto">
      {/* Hero Image Carousel */}
      <div className="relative h-80 flex-shrink-0 group">
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
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
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
        <div className="absolute bottom-12 left-8 right-8">
          <h1 className="text-4xl font-light text-white tracking-widest" style={{ fontFamily: 'var(--font-cormorant)' }}>
            THE 1898 NISEKO
          </h1>
          <p className="text-white/70 text-sm mt-2 tracking-[0.3em] uppercase">Boutique Hotel</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-8 space-y-8">
        {/* Location */}
        <div className="flex items-start gap-3">
          <MapPin className="w-4 h-4 text-stone-400 mt-1 flex-shrink-0" />
          <div>
            <p className="text-sm text-stone-600 tracking-wide">Kabayama, Kutchan</p>
            <p className="text-sm text-stone-600 tracking-wide">Hokkaido, Japan</p>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-4">
          <p className="text-stone-700 leading-relaxed" style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.1rem' }}>
            An intimate boutique experience with just six exclusive suites, nestled in a quiet
            enclave near Hirafu. Each suite features private elevator access, unobstructed
            Mount Yotei views, and your own private onsen.
          </p>
          <p className="text-stone-700 leading-relaxed" style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.1rem' }}>
            Experience refined mountain hospitality in Japan&apos;s premier alpine destination,
            where carefully considered details meet authentic Japanese tradition.
          </p>
        </div>

        {/* Amenities */}
        <div>
          <h3 className="text-xs font-medium text-stone-500 mb-4 uppercase tracking-[0.2em]">Complimentary Services</h3>
          <div className="grid grid-cols-2 gap-3">
            {amenities.map((amenity) => (
              <div key={amenity.label} className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg border border-stone-100">
                <amenity.icon className="w-4 h-4 text-stone-500" />
                <span className="text-sm text-stone-700">{amenity.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div>
          <h3 className="text-xs font-medium text-stone-500 mb-4 uppercase tracking-[0.2em]">Suite Features</h3>
          <div className="space-y-3">
            {['Private elevator access', 'Mount Yotei panoramic views', 'Private onsen in each suite', 'Heated ski lockers'].map((feature) => (
              <div key={feature} className="flex items-center gap-3 text-sm text-stone-700">
                <div className="w-1 h-1 bg-stone-400 rounded-full" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="pt-6 border-t border-stone-100">
          <a
            href="mailto:reservations@the1898niseko.com"
            className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800 transition-colors"
          >
            <Mail className="w-4 h-4" />
            reservations@the1898niseko.com
          </a>
        </div>
      </div>
    </div>
  );
}
