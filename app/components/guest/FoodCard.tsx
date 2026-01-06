'use client';

import Image from 'next/image';
import { Star } from 'lucide-react';
import { GuestService } from '@/types/guest';

interface FoodCardProps {
  service: GuestService;
  onClick?: () => void;
}

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  fresh: { bg: 'bg-[#F2AC57]', text: 'text-white', label: 'FRESH' },
  limited: { bg: 'bg-[#733858]', text: 'text-white', label: 'LIMITED' },
  seasonal: { bg: 'bg-emerald-500', text: 'text-white', label: 'SEASONAL' },
  signature: { bg: 'bg-[#F2AC57]', text: 'text-[#260A1C]', label: 'SIGNATURE' },
};

export function FoodCard({ service, onClick }: FoodCardProps) {
  const formatPrice = (price: number) => {
    return `¥${price.toLocaleString()}`;
  };

  const statusStyle = service.status ? statusColors[service.status] : null;

  return (
    <button
      onClick={onClick}
      className="w-full relative rounded-2xl overflow-hidden group"
      style={{ aspectRatio: '16/9' }}
    >
      {/* Background Image */}
      {service.image ? (
        <Image
          src={service.image}
          alt={service.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#592203] to-[#260A1C]" />
      )}

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      {/* Price and Status - Top Right */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <span className="text-xl font-semibold text-[#F7C67E] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          {formatPrice(service.price)}
        </span>
        {statusStyle && (
          <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full">
            <span className={`w-2 h-2 rounded-full ${statusStyle.bg}`} />
            <span className="text-xs font-medium tracking-wider text-[#F7C67E]">
              {statusStyle.label}
            </span>
          </div>
        )}
      </div>

      {/* Content - Bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-4 text-left bg-gradient-to-t from-black/80 to-transparent pt-8">
        {/* Name */}
        <h3
          className="text-2xl font-light text-[#F7C67E] mb-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
          style={{ fontFamily: 'var(--font-cormorant)' }}
        >
          {service.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-[#F2AC57]/80 mb-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">{service.description}</p>

        {/* Chef Recommendation Badge */}
        {service.isChefRecommendation && (
          <div className="flex items-center gap-1">
            <span className="text-sm text-[#F2AC57]/70 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">Chef</span>
            <Star className="w-4 h-4 text-[#F2AC57] fill-[#F2AC57] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
            <span className="text-sm text-[#F7C67E] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">Recommendation</span>
          </div>
        )}
      </div>
    </button>
  );
}

export default FoodCard;
