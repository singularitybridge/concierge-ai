'use client';

import { Star, Clock } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { GuestService } from '@/types/guest';

interface ServiceCardProps {
  service: GuestService;
  onClick?: () => void;
}

export function ServiceCard({ service, onClick }: ServiceCardProps) {
  // Dynamically get the icon component
  const IconComponent = (LucideIcons as Record<string, React.ComponentType<{ className?: string }>>)[service.icon] || LucideIcons.Sparkles;

  const formatPrice = (price: number) => {
    if (price === 0) return 'Free';
    return `¥${price.toLocaleString()}`;
  };

  return (
    <button
      onClick={onClick}
      className="w-full bg-white/10 backdrop-blur-xl rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/15 transition-all p-4 text-left group"
    >
      <div className="flex gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-amber-500/20 flex items-center justify-center group-hover:bg-amber-500/30 transition-colors">
          <IconComponent className="w-7 h-7 text-amber-400" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-medium text-white truncate">{service.name}</h3>
            {service.popular && (
              <span className="flex-shrink-0 text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full">
                Popular
              </span>
            )}
          </div>

          <p className="text-xs text-white/50 mt-1 line-clamp-2">{service.description}</p>

          {/* Meta row */}
          <div className="flex items-center gap-3 mt-2">
            {/* Rating */}
            {service.rating && (
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span className="text-xs text-white/60">{service.rating}</span>
                {service.reviewCount && (
                  <span className="text-xs text-white/40">({service.reviewCount})</span>
                )}
              </div>
            )}

            {/* Duration */}
            {service.duration && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-white/40" />
                <span className="text-xs text-white/50">{service.duration}min</span>
              </div>
            )}

            {/* Price */}
            <span
              className={`text-xs font-medium ml-auto ${
                service.price === 0 ? 'text-emerald-400' : 'text-white'
              }`}
            >
              {formatPrice(service.price)}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

export default ServiceCard;
