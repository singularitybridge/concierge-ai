'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export default function Tooltip({ content, children, position = 'bottom', className = '' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const calculatePosition = () => {
    if (!triggerRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipWidth = 250; // Approximate max width
    const tooltipHeight = 60; // Approximate height
    const padding = 8;

    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = triggerRect.top - tooltipHeight - padding + window.scrollY;
        left = triggerRect.left + (triggerRect.width / 2) - (tooltipWidth / 2) + window.scrollX;
        break;
      case 'bottom':
        top = triggerRect.bottom + padding + window.scrollY;
        left = triggerRect.left + (triggerRect.width / 2) - (tooltipWidth / 2) + window.scrollX;
        break;
      case 'left':
        top = triggerRect.top + (triggerRect.height / 2) - (tooltipHeight / 2) + window.scrollY;
        left = triggerRect.left - tooltipWidth - padding + window.scrollX;
        break;
      case 'right':
        top = triggerRect.top + (triggerRect.height / 2) - (tooltipHeight / 2) + window.scrollY;
        left = triggerRect.right + padding + window.scrollX;
        break;
    }

    // Keep tooltip within viewport
    const viewportWidth = window.innerWidth;
    if (left < 10) left = 10;
    if (left + tooltipWidth > viewportWidth - 10) {
      left = viewportWidth - tooltipWidth - 10;
    }
    if (top < 10) {
      // Flip to bottom if too high
      top = triggerRect.bottom + padding + window.scrollY;
    }

    setCoords({ top, left });
  };

  const handleMouseEnter = () => {
    calculatePosition();
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  const tooltipElement = isVisible && mounted ? (
    <div
      className="fixed z-[9999] max-w-[250px] px-3 py-2 text-xs text-white bg-slate-800 rounded-lg shadow-2xl border border-slate-600 pointer-events-none animate-fade-in"
      style={{
        top: coords.top,
        left: coords.left,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
      }}
    >
      <div className="leading-relaxed">{content}</div>
      {/* Arrow */}
      <div
        className={`absolute w-2 h-2 bg-slate-800 border-slate-600 transform rotate-45 ${
          position === 'top' ? 'bottom-[-5px] left-1/2 -translate-x-1/2 border-r border-b' :
          position === 'bottom' ? 'top-[-5px] left-1/2 -translate-x-1/2 border-l border-t' :
          position === 'left' ? 'right-[-5px] top-1/2 -translate-y-1/2 border-t border-r' :
          'left-[-5px] top-1/2 -translate-y-1/2 border-b border-l'
        }`}
      />
    </div>
  ) : null;

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`cursor-help border-b border-dotted border-white/40 hover:border-white/70 transition-colors ${className}`}
      >
        {children}
      </span>
      {mounted && typeof document !== 'undefined' && tooltipElement && createPortal(tooltipElement, document.body)}
    </>
  );
}

// Pre-defined tooltips for hotel industry terms
export const HotelTerms: Record<string, string> = {
  ADR: 'Average Daily Rate - The average rental income per paid occupied room',
  RevPAR: 'Revenue Per Available Room - Total room revenue divided by total available rooms',
  TRevPAR: 'Total Revenue Per Available Room - All revenue (rooms, F&B, spa, etc.) divided by available rooms',
  GOPPAR: 'Gross Operating Profit Per Available Room - Operating profit divided by available rooms',
  OCC: 'Occupancy - Percentage of available rooms that are occupied',
  MPI: 'Market Penetration Index - Your occupancy compared to your competitive set (100 = fair share)',
  ARI: 'Average Rate Index - Your ADR compared to your competitive set (100 = fair share)',
  RGI: 'Revenue Generation Index - Your RevPAR compared to your competitive set (100 = fair share)',
  OTB: 'On The Books - Reservations already confirmed for a future date',
  Pickup: 'New reservations made for a specific date since last measurement',
  Pace: 'Comparison of current bookings vs same time last year',
  CompSet: 'Competitive Set - Group of similar hotels used for benchmarking',
  DRR: 'Daily Revenue Report - Daily summary of revenue by department',
  GOP: 'Gross Operating Profit - Revenue minus operating expenses',
  NOI: 'Net Operating Income - GOP minus fixed charges',
  CPOR: 'Cost Per Occupied Room - Total costs divided by occupied rooms',
  LOS: 'Length of Stay - Average number of nights guests stay',
  BAR: 'Best Available Rate - Lowest unrestricted rate available',
  Rack: 'Rack Rate - The standard published rate before discounts',
  Yield: 'Revenue management strategy to maximize revenue',
  OTA: 'Online Travel Agency - Third-party booking sites like Booking.com, Expedia',
  GDS: 'Global Distribution System - Reservation network used by travel agents',
  CRS: 'Central Reservation System - Hotel\'s booking management system',
  PMS: 'Property Management System - Software managing hotel operations',
  F_B: 'Food & Beverage - Restaurant, bar, and room service revenue',
  Ancillary: 'Additional revenue from spa, parking, activities, etc.',
  DirectBooking: 'Reservations made directly with the hotel (no commission)',
  Commission: 'Fee paid to OTAs/agents, typically 15-25% of booking value',
  NetADR: 'ADR after deducting commissions and fees',
  Transient: 'Individual travelers (not group bookings)',
  Group: 'Block bookings for meetings, events, tours',
  Corporate: 'Business travelers with negotiated rates',
  Leisure: 'Vacation/holiday travelers',
  VIP: 'Very Important Person - High-value or special guests',
  DND: 'Do Not Disturb - Guest privacy request',
  OOO: 'Out of Order - Room unavailable due to maintenance',
  OOS: 'Out of Service - Room temporarily unavailable',
  Stayover: 'Guest continuing their stay (not checking out)',
  Turndown: 'Evening housekeeping service',
  Amenity: 'Complimentary items/services for guests',
  Upsell: 'Offering room upgrades or additional services',
  Forecast: 'Predicted future occupancy and revenue',
  Budget: 'Annual financial targets set by management',
  Variance: 'Difference between actual and budgeted figures',
  YoY: 'Year over Year - Comparison with same period last year',
  MTD: 'Month to Date - From start of month to current date',
  YTD: 'Year to Date - From start of year to current date',
};

// Wrapper component for easy term tooltips
export function Term({ term, children }: { term: keyof typeof HotelTerms; children?: ReactNode }) {
  return (
    <Tooltip content={HotelTerms[term]}>
      {children || term}
    </Tooltip>
  );
}
