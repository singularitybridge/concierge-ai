'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Waves, UtensilsCrossed, Snowflake, Car, Coffee, Search } from 'lucide-react';
import { GuestHeader } from '@/app/components/guest/GuestHeader';
import { ServiceCard } from '@/app/components/guest/ServiceCard';
import { FoodCard } from '@/app/components/guest/FoodCard';
import { mockServices, serviceCategories, getPopularServices } from '@/lib/mock-data/services-data';
import { ServiceCategory, GuestService } from '@/types/guest';

const categoryIcons: Record<ServiceCategory, React.ComponentType<{ className?: string }>> = {
  spa: Waves,
  restaurant: UtensilsCrossed,
  activities: Snowflake,
  transport: Car,
  room_service: Coffee,
};

function ServicesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category') as ServiceCategory | null;

  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(categoryParam);
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const auth = localStorage.getItem('niseko_authenticated');
    if (auth !== 'true') {
      router.push('/demo');
    }
  }, [router]);

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center">
        <div className="text-white/50 text-sm">Loading...</div>
      </div>
    );
  }

  const filteredServices = mockServices.filter((service) => {
    const matchesCategory = !selectedCategory || service.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const popularServices = getPopularServices();

  const handleCategoryClick = (category: ServiceCategory | null) => {
    setSelectedCategory(category);
    if (category) {
      router.push(`/guest/services?category=${category}`, { scroll: false });
    } else {
      router.push('/guest/services', { scroll: false });
    }
  };

  const handleServiceClick = (service: GuestService) => {
    // TODO: Open service detail modal or page
    console.log('Service clicked:', service);
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
        <GuestHeader title="Services" />

        <div className="p-4 space-y-4 pb-24">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 py-3 pl-12 pr-4 text-white placeholder-white/40 focus:outline-none focus:border-amber-400/50"
            />
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            <button
              onClick={() => handleCategoryClick(null)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm transition-all ${
                !selectedCategory
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-400/30'
                  : 'bg-white/10 text-white/70 border border-white/10 hover:bg-white/15'
              }`}
            >
              All
            </button>
            {serviceCategories.map((cat) => {
              const Icon = categoryIcons[cat.key];
              return (
                <button
                  key={cat.key}
                  onClick={() => handleCategoryClick(cat.key)}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all ${
                    selectedCategory === cat.key
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-400/30'
                      : 'bg-white/10 text-white/70 border border-white/10 hover:bg-white/15'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Popular Services (only when no category selected) */}
          {!selectedCategory && !searchQuery && (
            <div>
              <h2
                className="text-lg font-light text-white mb-3"
                style={{ fontFamily: 'var(--font-cormorant)' }}
              >
                Popular Services
              </h2>
              <div className="space-y-3">
                {popularServices.slice(0, 4).map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    onClick={() => handleServiceClick(service)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* All Services */}
          <div>
            <h2
              className="text-lg font-light text-white mb-3"
              style={{ fontFamily: 'var(--font-cormorant)' }}
            >
              {selectedCategory
                ? serviceCategories.find((c) => c.key === selectedCategory)?.label
                : searchQuery
                ? 'Search Results'
                : 'All Services'}
            </h2>
            {filteredServices.length > 0 ? (
              <div className={selectedCategory === 'restaurant' ? 'space-y-4' : 'space-y-3'}>
                {filteredServices.map((service) => (
                  service.category === 'restaurant' && service.image ? (
                    <FoodCard
                      key={service.id}
                      service={service}
                      onClick={() => handleServiceClick(service)}
                    />
                  ) : (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      onClick={() => handleServiceClick(service)}
                    />
                  )
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-white/50">No services found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GuestServicesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-stone-900 flex items-center justify-center">
        <div className="text-white/50 text-sm">Loading...</div>
      </div>
    }>
      <ServicesContent />
    </Suspense>
  );
}
