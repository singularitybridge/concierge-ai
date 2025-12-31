'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Gift, Percent, Sparkles } from 'lucide-react';
import { GuestHeader } from '@/app/components/guest/GuestHeader';
import { OfferCard } from '@/app/components/guest/OfferCard';
import { mockOffers, getActiveOffers } from '@/lib/mock-data/offers-data';
import { GuestOffer } from '@/types/guest';

export default function GuestOffersPage() {
  const router = useRouter();
  const [offers, setOffers] = useState<GuestOffer[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const auth = localStorage.getItem('niseko_authenticated');
    if (auth !== 'true') {
      router.push('/demo');
      return;
    }
    // Load offers
    setOffers(mockOffers);
  }, [router]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center">
        <div className="text-white/50 text-sm">Loading...</div>
      </div>
    );
  }

  const handleOfferClick = (offer: GuestOffer) => {
    // TODO: Open offer detail modal or navigate to services
    if (offer.category) {
      router.push(`/guest/services?category=${offer.category}`);
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <Image
        src="/hotel2.jpg"
        alt="The 1898 Niseko"
        fill
        className="object-cover fixed"
        priority
      />
      <div className="fixed inset-0 bg-gradient-to-br from-black/70 via-black/60 to-stone-900/70" />
      <div className="fixed inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

      {/* Content */}
      <div className="relative z-10">
        <GuestHeader title="Special Offers" />

        <div className="p-4 space-y-4 pb-24">
          {/* Header Card */}
          <div className="bg-gradient-to-r from-amber-500/20 to-amber-600/10 backdrop-blur-xl rounded-2xl p-6 border border-amber-500/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-amber-500/20 rounded-xl">
                <Gift className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h2
                  className="text-xl font-light text-white"
                  style={{ fontFamily: 'var(--font-cormorant)' }}
                >
                  Exclusive Guest Offers
                </h2>
                <p className="text-sm text-white/60">Special deals just for you</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-white/50">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{offers.length} offers available</span>
            </div>
          </div>

          {/* Offers List */}
          <div className="space-y-4">
            {offers.map((offer) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                onClick={() => handleOfferClick(offer)}
              />
            ))}
          </div>

          {offers.length === 0 && (
            <div className="text-center py-12">
              <Gift className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/50">No offers available at the moment</p>
            </div>
          )}

          {/* Terms note */}
          <div className="text-center pt-4">
            <p className="text-xs text-white/30">
              Offers are subject to availability. Terms and conditions apply.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
