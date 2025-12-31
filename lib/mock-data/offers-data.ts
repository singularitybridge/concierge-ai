import { GuestOffer } from '@/types/guest';

export const mockOffers: GuestOffer[] = [
  {
    id: 'offer-1',
    title: 'Spa Week Special',
    description: 'Enjoy 20% off all spa and wellness treatments. Includes private onsen, massage, and facial services.',
    discount: 20,
    discountType: 'percentage',
    validFrom: new Date('2025-12-01'),
    validUntil: new Date('2025-12-31'),
    category: 'spa',
    image: '/offers/spa-offer.jpg',
    terms: 'Valid for bookings made during your stay. Cannot be combined with other offers.',
    code: 'RELAX20',
  },
  {
    id: 'offer-2',
    title: 'Kaiseki Experience',
    description: 'Complimentary sake pairing with any kaiseki dinner course. A ¥8,000 value.',
    discount: 8000,
    discountType: 'fixed',
    validFrom: new Date('2025-12-15'),
    validUntil: new Date('2026-01-15'),
    category: 'restaurant',
    image: '/offers/kaiseki-offer.jpg',
    terms: 'One per table. Advance reservation required.',
    code: 'SAKE2025',
  },
  {
    id: 'offer-3',
    title: 'First Tracks Program',
    description: 'Early lift access at Grand Hirafu before the crowds. Includes hot chocolate and pastry.',
    discount: 15,
    discountType: 'percentage',
    validFrom: new Date('2025-12-20'),
    validUntil: new Date('2026-03-31'),
    category: 'activities',
    image: '/offers/ski-offer.jpg',
    terms: 'Subject to weather conditions. Available on select days.',
  },
  {
    id: 'offer-4',
    title: 'Extended Stay Discount',
    description: 'Stay 5+ nights and receive 10% off your entire stay plus complimentary airport transfer.',
    discount: 10,
    discountType: 'percentage',
    validFrom: new Date('2025-11-01'),
    validUntil: new Date('2026-04-30'),
    image: '/offers/stay-offer.jpg',
    terms: 'Must book directly. Non-refundable rate.',
  },
  {
    id: 'offer-5',
    title: 'Late Night Ramen Deal',
    description: 'Order any ramen after 10 PM and get a complimentary gyoza plate.',
    discount: 100,
    discountType: 'percentage',
    validFrom: new Date('2025-12-01'),
    validUntil: new Date('2026-02-28'),
    category: 'room_service',
    image: '/offers/ramen-offer.jpg',
    terms: 'Room service orders only. Valid 10 PM - 2 AM.',
    code: 'LATENIGHT',
  },
];

export function getActiveOffers(): GuestOffer[] {
  const now = new Date();
  return mockOffers.filter(o => o.validFrom <= now && o.validUntil >= now);
}

export function getOffersByCategory(category: string): GuestOffer[] {
  const now = new Date();
  return mockOffers.filter(
    o => o.category === category && o.validFrom <= now && o.validUntil >= now
  );
}

export function getOfferById(id: string): GuestOffer | undefined {
  return mockOffers.find(o => o.id === id);
}
