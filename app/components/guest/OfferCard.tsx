'use client';

import { Gift, Clock, Tag } from 'lucide-react';
import { GuestOffer } from '@/types/guest';

interface OfferCardProps {
  offer: GuestOffer;
  onClick?: () => void;
}

export function OfferCard({ offer, onClick }: OfferCardProps) {
  const formatDiscount = () => {
    if (offer.discountType === 'percentage') {
      return `${offer.discount}% OFF`;
    }
    return `¥${offer.discount.toLocaleString()} OFF`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const daysRemaining = () => {
    const now = new Date();
    const diff = new Date(offer.validUntil).getTime() - now.getTime();
    const days = Math.ceil(diff / 86400000);
    if (days <= 0) return 'Expired';
    if (days === 1) return '1 day left';
    return `${days} days left`;
  };

  return (
    <button
      onClick={onClick}
      className="w-full bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 hover:border-amber-400/30 hover:bg-white/15 transition-all overflow-hidden text-left"
    >
      {/* Discount Banner */}
      <div className="bg-gradient-to-r from-amber-500/30 to-amber-600/20 p-4 border-b border-amber-500/20">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-amber-400">{formatDiscount()}</span>
          {offer.code && (
            <div className="flex items-center gap-1 px-3 py-1 bg-white/10 rounded-full">
              <Tag className="w-3 h-3 text-white/60" />
              <span className="text-xs font-mono text-white/80">{offer.code}</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3
          className="text-lg font-medium text-white mb-1"
          style={{ fontFamily: 'var(--font-cormorant)' }}
        >
          {offer.title}
        </h3>
        <p className="text-sm text-white/60 line-clamp-2">{offer.description}</p>

        {/* Meta */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center gap-1 text-white/40">
            <Clock className="w-4 h-4" />
            <span className="text-xs">{daysRemaining()}</span>
          </div>
          <span className="text-xs text-white/40">
            Valid until {formatDate(offer.validUntil)}
          </span>
        </div>
      </div>
    </button>
  );
}

export default OfferCard;
