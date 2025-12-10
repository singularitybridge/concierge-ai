'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShoppingBag, Plus, Minus, X, Check, LogOut,
  Star, UtensilsCrossed, Flame, ChefHat, Soup,
  Cloud, Leaf, Cake, Filter
} from 'lucide-react';
import VoiceSessionChat from '../components/VoiceSessionChat';
import LanguageSelector from '../components/LanguageSelector';
import { useLanguageStore } from '@/lib/use-language-store';
import { translations as defaultTranslations } from '@/lib/translations';
import { menuItems, menuCategories, MenuItem, getMenuItemsByCategory } from '@/lib/menu-data';

interface CartItem {
  item: MenuItem;
  quantity: number;
}

const categoryIcons: Record<string, typeof Star> = {
  'signature': Star,
  'appetizers': UtensilsCrossed,
  'specialty': ChefHat,
  'stir-fry': Flame,
  'soups': Soup,
  'steamed': Cloud,
  'wild-game': Leaf,
  'mains-desserts': Cake
};

export default function RestaurantMenuPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [mounted, setMounted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const router = useRouter();

  const { translations: storeTranslations, language } = useLanguageStore();
  const t = storeTranslations?.nav ? storeTranslations : defaultTranslations.en;

  // Check authentication
  useEffect(() => {
    const auth = localStorage.getItem('niseko_authenticated');
    if (auth === 'true') {
      setIsAuthenticated(true);
      setMounted(true);
    } else {
      setIsAuthenticated(false);
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('niseko_authenticated');
    localStorage.removeItem('niseko_role');
    router.push('/login');
  };

  // Navigation menu items
  const navMenuItems = [
    { label: t.nav.checkIn, href: '/register' },
    { label: t.admin.title, href: '/admin' },
    { label: t.nav.restaurant, href: '/restaurant', active: true },
  ];

  // Get filtered items
  const filteredItems = selectedCategory === 'all'
    ? menuItems
    : getMenuItemsByCategory(selectedCategory);

  // Cart functions
  const addToCart = (item: MenuItem, quantity: number = 1) => {
    setCart(prev => {
      const existing = prev.find(ci => ci.item.id === item.id);
      if (existing) {
        return prev.map(ci =>
          ci.item.id === item.id
            ? { ...ci, quantity: ci.quantity + quantity }
            : ci
        );
      }
      return [...prev, { item, quantity }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(ci => ci.item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(prev =>
      prev.map(ci =>
        ci.item.id === itemId ? { ...ci, quantity } : ci
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setOrderConfirmed(false);
  };

  const getCartTotal = () => {
    return cart.reduce((total, ci) => total + (ci.item.price || 0) * ci.quantity, 0);
  };

  // Listen for AI-triggered events
  useEffect(() => {
    const handleShowProduct = (event: CustomEvent<{ productId: string }>) => {
      const item = menuItems.find(i => i.id === event.detail.productId);
      if (item) {
        setSelectedItem(item);
      }
    };

    const handleAddToCart = (event: CustomEvent<{ productId: string; quantity: number }>) => {
      const item = menuItems.find(i => i.id === event.detail.productId);
      if (item) {
        addToCart(item, event.detail.quantity || 1);
      }
    };

    const handleRemoveFromCart = (event: CustomEvent<{ productId: string }>) => {
      removeFromCart(event.detail.productId);
    };

    const handleConfirmOrder = () => {
      if (cart.length > 0) {
        setOrderConfirmed(true);
      }
    };

    const handleClearCart = () => {
      clearCart();
    };

    const handleCloseProductModal = () => {
      setSelectedItem(null);
    };

    const handleFilterCategory = (event: CustomEvent<{ category: string }>) => {
      setSelectedCategory(event.detail.category);
    };

    window.addEventListener('shop-show-product', handleShowProduct as EventListener);
    window.addEventListener('shop-add-to-cart', handleAddToCart as EventListener);
    window.addEventListener('shop-remove-from-cart', handleRemoveFromCart as EventListener);
    window.addEventListener('shop-confirm-order', handleConfirmOrder as EventListener);
    window.addEventListener('shop-clear-cart', handleClearCart as EventListener);
    window.addEventListener('shop-close-product', handleCloseProductModal as EventListener);
    window.addEventListener('shop-filter-category', handleFilterCategory as EventListener);

    return () => {
      window.removeEventListener('shop-show-product', handleShowProduct as EventListener);
      window.removeEventListener('shop-add-to-cart', handleAddToCart as EventListener);
      window.removeEventListener('shop-remove-from-cart', handleRemoveFromCart as EventListener);
      window.removeEventListener('shop-confirm-order', handleConfirmOrder as EventListener);
      window.removeEventListener('shop-clear-cart', handleClearCart as EventListener);
      window.removeEventListener('shop-close-product', handleCloseProductModal as EventListener);
      window.removeEventListener('shop-filter-category', handleFilterCategory as EventListener);
    };
  }, [cart.length]);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center">
        <div className="text-white/50 text-sm">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const getItemTitle = (item: MenuItem) => item.title[language as keyof typeof item.title] || item.title.en;
  const getItemDescription = (item: MenuItem) => item.description[language as keyof typeof item.description] || item.description.en;
  const getCategoryName = (cat: typeof menuCategories[0]) => cat.name[language as keyof typeof cat.name] || cat.name.en;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Full Page Background */}
      <Image
        src="/hotel3.jpg"
        alt="The 1898 Niseko"
        fill
        className="object-cover"
        priority
      />

      {/* Sophisticated Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-stone-900/60" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

      {/* Content */}
      <div className={`relative z-10 h-screen flex flex-col transition-opacity duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}>

        {/* Top Navigation Bar */}
        <nav className="flex items-center justify-between px-8 py-4 flex-shrink-0">
          {/* Left - Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm" style={{ fontFamily: 'var(--font-cormorant)' }}>18</span>
            </div>
            <div>
              <h1
                className="text-xl font-light text-white tracking-wide leading-tight group-hover:text-amber-200 transition-colors"
                style={{ fontFamily: 'var(--font-cormorant)' }}
              >
                THE 1898
              </h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">Niseko</p>
            </div>
          </Link>

          {/* Center - Menu Items */}
          <div className="flex items-center gap-1 bg-white/5 backdrop-blur-md rounded-full px-2 py-1.5 border border-white/10">
            {navMenuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`px-4 py-2 rounded-full text-sm transition-all ${
                  item.active
                    ? 'bg-white/15 text-white font-medium'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right - Language Selector & Logout */}
          <div className="flex items-center gap-2">
            <LanguageSelector variant="dark" />
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all"
            >
              <span className="text-sm">{t.nav.logout}</span>
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </nav>

        {/* Main Content - Two Column Layout */}
        <div className="flex-1 flex gap-6 px-8 pb-6 min-h-0">

          {/* Left Column - Menu Content - Full Height Card */}
          <div className="flex-1 min-w-0 flex flex-col">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl flex-1 flex flex-col min-h-0">
              {/* Title Header - Sticky */}
              <div className="mb-4 flex-shrink-0">
                <h2
                  className="text-4xl font-light text-white tracking-wide"
                  style={{ fontFamily: 'var(--font-cormorant)' }}
                >
                  {t.restaurant?.title || 'Restaurant Menu'}
                </h2>
                <p className="text-base text-white/50 mt-2">{t.restaurant?.subtitle || 'Authentic Sichuan Cuisine'}</p>
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2 mb-4 flex-shrink-0">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1.5 rounded-full text-xs transition-all flex items-center gap-1.5 ${
                    selectedCategory === 'all'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  <Filter className="w-3 h-3" />
                  {t.restaurant?.allItems || 'All'}
                </button>
                {menuCategories.map(cat => {
                  const IconComponent = categoryIcons[cat.id] || Star;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-full text-xs transition-all flex items-center gap-1.5 ${
                        selectedCategory === cat.id
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <IconComponent className="w-3 h-3" />
                      {getCategoryName(cat)}
                    </button>
                  );
                })}
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto min-h-0 space-y-4 pr-2">
                {/* Your Order Section */}
                <div className={`rounded-xl p-4 transition-all border ${
                  orderConfirmed
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-white/5 border-white/10'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-white" style={{ fontFamily: 'var(--font-cormorant)' }}>
                      {orderConfirmed ? (t.restaurant?.orderConfirmed || 'Order Confirmed') : (t.restaurant?.yourOrder || 'Your Order')}
                    </h3>
                    {!orderConfirmed && cart.length > 0 && (
                      <span className="text-xs text-white/50">
                        {cart.reduce((sum, ci) => sum + ci.quantity, 0)} {t.restaurant?.items || 'items'}
                      </span>
                    )}
                    {orderConfirmed && (
                      <div className="flex items-center gap-1.5 text-emerald-400">
                        <Check className="w-4 h-4" />
                        <span className="text-xs font-medium">{t.restaurant?.sentToKitchen || 'Sent to kitchen'}</span>
                      </div>
                    )}
                  </div>

                  {orderConfirmed ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-emerald-400 mb-2">
                        {t.restaurant?.thankYou || 'Thank you for your order!'}
                      </p>
                      <p className="text-xs text-emerald-400/70">
                        {t.restaurant?.preparingOrder || 'Your dishes are being prepared.'}
                      </p>
                      <button
                        onClick={clearCart}
                        className="mt-4 text-xs text-emerald-400 hover:text-emerald-300 underline"
                      >
                        {t.restaurant?.newOrder || 'Start new order'}
                      </button>
                    </div>
                  ) : cart.length === 0 ? (
                    <div className="text-center py-6">
                      <ShoppingBag className="w-8 h-8 text-white/30 mx-auto mb-2" />
                      <p className="text-sm text-white/50">{t.restaurant?.emptyOrder || 'Your order is empty'}</p>
                      <p className="text-xs text-white/30 mt-1">{t.restaurant?.browseMenu || 'Browse our menu or ask for recommendations'}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {cart.map(ci => (
                        <div key={ci.item.id} className="flex items-center gap-3 p-2 bg-white/5 rounded-xl border border-white/10">
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={ci.item.image}
                              alt={getItemTitle(ci.item)}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate">{getItemTitle(ci.item)}</p>
                            <div className="flex items-center gap-1.5">
                              {ci.item.isSpicy && <Flame className="w-3 h-3 text-red-400" />}
                              {ci.item.isSignature && <Star className="w-3 h-3 text-amber-400" />}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(ci.item.id, ci.quantity - 1)}
                              className="p-1 text-white/40 hover:text-white/70"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-sm font-medium text-white w-4 text-center">{ci.quantity}</span>
                            <button
                              onClick={() => updateQuantity(ci.item.id, ci.quantity + 1)}
                              className="p-1 text-white/40 hover:text-white/70"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}

                      <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                        <p className="text-sm text-white/70">{t.restaurant?.total || 'Total'}</p>
                        <p className="text-sm text-white/50">{cart.reduce((sum, ci) => sum + ci.quantity, 0)} {t.restaurant?.items || 'items'}</p>
                      </div>

                      <p className="text-xs text-white/40 text-center">
                        {t.restaurant?.addedToRoomBill || 'Charges added to your room bill'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Menu Items Grid - 4 per row with bigger thumbnails */}
                <div className="space-y-3">
                  <h3 className="text-xs font-medium text-white/50 uppercase tracking-wider">
                    {selectedCategory === 'all'
                      ? (t.restaurant?.ourMenu || 'Our Menu')
                      : getCategoryName(menuCategories.find(c => c.id === selectedCategory)!)
                    }
                    <span className="ml-2 text-white/30">({filteredItems.length})</span>
                  </h3>
                  <div className="grid grid-cols-4 gap-3">
                    {filteredItems.map(item => (
                      <div
                        key={item.id}
                        className="bg-white/5 rounded-xl overflow-hidden border border-white/10 hover:border-amber-400/30 transition-all cursor-pointer group"
                        onClick={() => setSelectedItem(item)}
                      >
                        {/* Product Image - Larger */}
                        <div className="relative w-full aspect-square">
                          <Image
                            src={item.image}
                            alt={getItemTitle(item)}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          {item.isSignature && (
                            <span className="absolute top-2 left-2 text-[10px] px-1.5 py-0.5 bg-amber-500/20 backdrop-blur-sm text-amber-400 rounded border border-amber-500/30 flex items-center gap-0.5">
                              <Star className="w-2.5 h-2.5" />
                            </span>
                          )}
                          <div className="absolute top-2 right-2 flex flex-col gap-1">
                            {item.isSpicy && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-red-500/20 backdrop-blur-sm text-red-400 rounded border border-red-500/30 flex items-center gap-0.5">
                                <Flame className="w-2.5 h-2.5" />
                              </span>
                            )}
                            {item.isVegetarian && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/20 backdrop-blur-sm text-emerald-400 rounded border border-emerald-500/30 flex items-center gap-0.5">
                                <Leaf className="w-2.5 h-2.5" />
                              </span>
                            )}
                          </div>
                          {/* Add button overlay on hover */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(item);
                            }}
                            className="absolute bottom-2 right-2 p-2 bg-amber-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-amber-400"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        {/* Product Info */}
                        <div className="p-2">
                          <p className="text-xs font-medium text-white truncate">{getItemTitle(item)}</p>
                          <p className="text-[10px] text-white/50 mt-0.5 line-clamp-1">{getItemDescription(item)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>{/* End scrollable content */}
            </div>
          </div>

          {/* Right Column - Voice Chat */}
          <div className="flex-1 min-w-0 flex flex-col max-w-md">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl flex-1 overflow-hidden">
              <VoiceSessionChat
                agentId="restaurant-concierge"
                sessionId="hotel-restaurant"
                elevenLabsAgentId={process.env.NEXT_PUBLIC_ELEVENLABS_BOUTIQUE_AGENT_ID}
                title={t.restaurant?.chefName || 'Chef Chen'}
                avatar="/avatars/chef-chen.png"
                welcomeMessage={t.restaurant?.welcomeMessage || "Welcome to our restaurant! I'm Chef Chen, and I'll be helping you explore our authentic Sichuan cuisine today. Would you like to try our signature dishes or perhaps something milder?"}
                suggestions={[
                  t.restaurant?.suggestionRecommend || "What do you recommend?",
                  t.restaurant?.suggestionSignature || "Show signature dishes",
                  t.restaurant?.suggestionSpicy || "Something spicy",
                  t.restaurant?.suggestionVegetarian || "Vegetarian options"
                ]}
                contextData={{
                  products: menuItems.map(item => ({
                    id: item.id,
                    name: getItemTitle(item),
                    description: getItemDescription(item),
                    category: item.category,
                    isSpicy: item.isSpicy,
                    isVegetarian: item.isVegetarian,
                    isSignature: item.isSignature
                  })),
                  categories: menuCategories.map(cat => ({
                    id: cat.id,
                    name: getCategoryName(cat)
                  })),
                  cart: cart.map(ci => ({
                    id: ci.item.id,
                    name: getItemTitle(ci.item),
                    quantity: ci.quantity
                  })),
                  cartItemCount: cart.reduce((sum, ci) => sum + ci.quantity, 0),
                  orderConfirmed
                }}
                variant="dark"
                language={language}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-stone-900/95 backdrop-blur-xl rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-white/20">
            {/* Product Image */}
            <div className="relative h-56 w-full">
              <Image
                src={selectedItem.image}
                alt={getItemTitle(selectedItem)}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 p-2 bg-white/10 backdrop-blur-sm rounded-full text-white/70 hover:text-white hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute top-4 left-4 flex items-center gap-2">
                {selectedItem.isSignature && (
                  <span className="text-xs px-2 py-1 bg-amber-500/20 text-amber-400 rounded border border-amber-500/30 flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    {t.restaurant?.signature || 'Signature'}
                  </span>
                )}
                {selectedItem.isSpicy && (
                  <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded border border-red-500/30 flex items-center gap-1">
                    <Flame className="w-3 h-3" />
                    {t.restaurant?.spicy || 'Spicy'}
                  </span>
                )}
                {selectedItem.isVegetarian && (
                  <span className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded border border-emerald-500/30 flex items-center gap-1">
                    <Leaf className="w-3 h-3" />
                    {t.restaurant?.vegetarian || 'Vegetarian'}
                  </span>
                )}
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-2xl font-medium text-white" style={{ fontFamily: 'var(--font-cormorant)' }}>
                  {getItemTitle(selectedItem)}
                </h3>
                <p className="text-xs text-white/70 mt-1">
                  {getCategoryName(menuCategories.find(c => c.id === selectedItem.category)!)}
                </p>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
                <p className="text-sm text-white/80 leading-relaxed">{getItemDescription(selectedItem)}</p>
              </div>

              <button
                onClick={() => {
                  addToCart(selectedItem);
                  setSelectedItem(null);
                }}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl hover:from-amber-400 hover:to-amber-500 transition-colors flex items-center justify-center gap-2 shadow-lg"
              >
                <Plus className="w-4 h-4" />
                {t.restaurant?.addToOrder || 'Add to Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
