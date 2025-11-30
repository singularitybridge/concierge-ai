'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShoppingBag, Plus, Minus, X, Check, LogOut,
  Wine, Gift, Heart, ChefHat, Waves
} from 'lucide-react';
import VoiceSessionChat from '../components/VoiceSessionChat';

interface ShopItem {
  id: string;
  name: string;
  description: string;
  details: string;
  price: number;
  priceLabel?: string;
  image: string;
  icon: typeof Wine;
  deliveryTime?: string;
  isService?: boolean;
}

interface CartItem {
  item: ShopItem;
  quantity: number;
}

// Curated selection of 5 items
const shopItems: ShopItem[] = [
  {
    id: 'royce-collection',
    name: 'Royce Chocolate Collection',
    description: 'Hokkaido\'s legendary Royce chocolates, beloved worldwide for their melt-in-your-mouth texture.',
    details: 'A luxurious assortment of 24 handcrafted pieces including the famous Nama (fresh cream) chocolate, delicate champagne truffles, aromatic Uji matcha squares, and exclusive seasonal flavors. Made with fresh Hokkaido cream and premium Belgian cocoa. Perfect as an indulgent treat or an elegant gift. Presented in Royce\'s signature gold gift box.',
    price: 4200,
    image: '/products/royce-collection.jpg',
    icon: Gift,
    deliveryTime: '20 min'
  },
  {
    id: 'whisky-yoichi',
    name: 'Yoichi Single Malt',
    description: 'Award-winning Japanese whisky from Nikka\'s legendary Yoichi distillery in Hokkaido.',
    details: 'Aged 12 years in traditional pot stills using the same methods since 1934. This exceptional single malt captures the essence of Hokkaido with distinctive notes of peat smoke, dried fruit, sea salt, and a hint of sherry sweetness. Winner of multiple international awards including World Whiskies Awards. Served with Hokkaido mineral water and hand-carved ice upon request.',
    price: 18500,
    image: '/products/whisky-yoichi.jpg',
    icon: Wine,
    deliveryTime: '30 min'
  },
  {
    id: 'onsen-salts',
    name: 'Private Onsen Bath Salts',
    description: 'Transform your in-room onsen into a therapeutic spa with these mineral-rich bath salts.',
    details: 'Curated set of 5 artisan bath salt varieties sourced from Japan\'s finest hot springs: Sulfur (Noboribetsu-style for skin renewal), Hinoki cypress (forest bathing essence), Yuzu citrus (energizing and brightening), Uji Matcha (antioxidant-rich), and Furano Lavender (calming aromatherapy). Each jar provides 3-4 luxurious soaks. Includes wooden scoop and usage guide.',
    price: 3800,
    image: '/products/onsen-salts.jpg',
    icon: Waves,
    deliveryTime: '15 min'
  },
  {
    id: 'in-room-massage',
    name: 'In-Room Massage',
    description: 'Restorative bodywork by certified therapists in the privacy of your suite.',
    details: 'Choose from Traditional Japanese Shiatsu (pressure point therapy for energy balance), Swedish Relaxation (flowing strokes for deep relaxation), or Hot Stone therapy (volcanic stones with aromatherapy). Sessions available in 60-minute (¥22,000) or 90-minute (¥32,000) durations. Includes premium aromatherapy oils from Hokkaido botanicals, heated massage table, and complimentary herbal tea service.',
    price: 22000,
    priceLabel: 'from',
    image: '/products/in-room-massage.jpg',
    icon: Heart,
    isService: true,
    deliveryTime: '2hr notice'
  },
  {
    id: 'private-chef',
    name: 'Private Chef Experience',
    description: 'An intimate kaiseki journey prepared tableside in your suite by our executive chef.',
    details: 'Chef Watanabe presents an exquisite 8-course seasonal kaiseki dinner featuring the finest Hokkaido ingredients: Yoichi sea urchin, Shiretoko crab, A5 Wagyu from Kamifurano, and vegetables from our partner farms. Includes sake pairing from local Niseko breweries. Accommodates up to 4 guests with full dietary customization (vegetarian, halal, allergies). The experience includes table setting, live cooking demonstration, and cultural commentary.',
    price: 85000,
    priceLabel: 'per couple',
    image: '/products/private-chef.jpg',
    icon: ChefHat,
    isService: true,
    deliveryTime: '24hr notice'
  },
];

export default function HotelBoutiquePage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

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
  const menuItems = [
    { label: 'Grand Opening', href: '/experience' },
    { label: 'Guest Portal', href: '/guest' },
    { label: 'Staff Portal', href: '/admin' },
    { label: 'Shop', href: '/shop', active: true },
  ];

  // Cart functions
  const addToCart = (item: ShopItem, quantity: number = 1) => {
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
    return cart.reduce((total, ci) => total + ci.item.price * ci.quantity, 0);
  };

  const formatPrice = (price: number) => {
    return `¥${price.toLocaleString()}`;
  };

  // Listen for AI-triggered events
  useEffect(() => {
    const handleShowProduct = (event: CustomEvent<{ productId: string }>) => {
      const item = shopItems.find(i => i.id === event.detail.productId);
      if (item) {
        setSelectedItem(item);
      }
    };

    const handleAddToCart = (event: CustomEvent<{ productId: string; quantity: number }>) => {
      const item = shopItems.find(i => i.id === event.detail.productId);
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

    window.addEventListener('shop-show-product', handleShowProduct as EventListener);
    window.addEventListener('shop-add-to-cart', handleAddToCart as EventListener);
    window.addEventListener('shop-remove-from-cart', handleRemoveFromCart as EventListener);
    window.addEventListener('shop-confirm-order', handleConfirmOrder as EventListener);
    window.addEventListener('shop-clear-cart', handleClearCart as EventListener);
    window.addEventListener('shop-close-product', handleCloseProductModal as EventListener);

    return () => {
      window.removeEventListener('shop-show-product', handleShowProduct as EventListener);
      window.removeEventListener('shop-add-to-cart', handleAddToCart as EventListener);
      window.removeEventListener('shop-remove-from-cart', handleRemoveFromCart as EventListener);
      window.removeEventListener('shop-confirm-order', handleConfirmOrder as EventListener);
      window.removeEventListener('shop-clear-cart', handleClearCart as EventListener);
      window.removeEventListener('shop-close-product', handleCloseProductModal as EventListener);
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
            {menuItems.map((item) => (
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

          {/* Right - Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all"
          >
            <span className="text-sm">Logout</span>
            <LogOut className="w-4 h-4" />
          </button>
        </nav>

        {/* Main Content - Two Column Layout */}
        <div className="flex-1 flex gap-6 px-8 pb-6 min-h-0">

          {/* Left Column - Shop Content - Full Height Card */}
          <div className="flex-1 min-w-0 flex flex-col">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl flex-1 flex flex-col min-h-0">
              {/* Title Header - Sticky */}
              <div className="mb-6 flex-shrink-0">
                <h2
                  className="text-4xl font-light text-white tracking-wide"
                  style={{ fontFamily: 'var(--font-cormorant)' }}
                >
                  Curated Collection
                </h2>
                <p className="text-base text-white/50 mt-2">Hokkaido&apos;s Finest Treasures</p>
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
                    {orderConfirmed ? 'Order Confirmed' : 'Your Order'}
                  </h3>
                {!orderConfirmed && cart.length > 0 && (
                  <span className="text-xs text-white/50">
                    {cart.reduce((sum, ci) => sum + ci.quantity, 0)} items
                  </span>
                )}
                {orderConfirmed && (
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <Check className="w-4 h-4" />
                    <span className="text-xs font-medium">Delivered to your suite</span>
                  </div>
                )}
              </div>

              {orderConfirmed ? (
                <div className="text-center py-4">
                  <p className="text-sm text-emerald-400 mb-2">
                    Thank you for your order!
                  </p>
                  <p className="text-xs text-emerald-400/70">
                    Your items will be delivered shortly.
                  </p>
                  <button
                    onClick={clearCart}
                    className="mt-4 text-xs text-emerald-400 hover:text-emerald-300 underline"
                  >
                    Start new order
                  </button>
                </div>
              ) : cart.length === 0 ? (
                <div className="text-center py-6">
                  <ShoppingBag className="w-8 h-8 text-white/30 mx-auto mb-2" />
                  <p className="text-sm text-white/50">Your order is empty</p>
                  <p className="text-xs text-white/30 mt-1">Ask about our products or add items below</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map(ci => (
                    <div key={ci.item.id} className="flex items-center gap-3 p-2 bg-white/5 rounded-xl border border-white/10">
                      <ci.item.icon className="w-4 h-4 text-amber-400/70 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{ci.item.name}</p>
                        <p className="text-xs text-white/40">{formatPrice(ci.item.price)} each</p>
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
                      <p className="text-sm font-medium text-white w-20 text-right">
                        {formatPrice(ci.item.price * ci.quantity)}
                      </p>
                    </div>
                  ))}

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                    <p className="text-sm text-white/70">Total</p>
                    <p className="text-lg font-medium text-amber-400">{formatPrice(getCartTotal())}</p>
                  </div>

                  <p className="text-xs text-white/40 text-center">
                    Charges added to your room bill
                  </p>
                </div>
              )}
              </div>

              {/* Products List */}
              <div className="space-y-3">
                <h3 className="text-xs font-medium text-white/50 uppercase tracking-wider">Our Selection</h3>
                {shopItems.map(item => (
                  <div
                    key={item.id}
                    className="bg-white/5 rounded-xl overflow-hidden border border-white/10 hover:border-amber-400/30 transition-all cursor-pointer"
                    onClick={() => setSelectedItem(item)}
                >
                  <div className="flex">
                    {/* Product Image */}
                    <div className="relative w-28 h-28 flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                      {item.isService && (
                        <span className="absolute top-2 left-2 text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded border border-amber-500/30">
                          Service
                        </span>
                      )}
                    </div>
                    {/* Product Info */}
                    <div className="flex-1 min-w-0 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-white">{item.name}</p>
                          <p className="text-xs text-white/50 mt-0.5 line-clamp-2">{item.description}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          {item.priceLabel && (
                            <p className="text-[10px] text-white/40">{item.priceLabel}</p>
                          )}
                          <p className="text-sm font-medium text-amber-400">{formatPrice(item.price)}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-white/40">
                          {item.deliveryTime}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(item);
                          }}
                          className="px-3 py-1.5 text-xs bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-400 hover:to-amber-500 transition-colors flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                  </div>
                ))}
              </div>
              </div>{/* End scrollable content */}
            </div>
          </div>

          {/* Right Column - Voice Chat */}
          <div className="flex-1 min-w-0 flex flex-col max-w-md">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl flex-1 overflow-hidden">
              <VoiceSessionChat
                agentId="boutique-concierge"
                sessionId="hotel-boutique"
                elevenLabsAgentId={process.env.NEXT_PUBLIC_ELEVENLABS_BOUTIQUE_AGENT_ID}
                title="Hana"
                avatar="/avatars/boutique-avatar.jpg"
                welcomeMessage="Hello! I'm Hana from The 1898 Boutique. I'd love to help you find the perfect Hokkaido treasure — whether it's our famous chocolates, local whisky, or a relaxing spa experience. What catches your eye?"
                suggestions={[
                  "What do you recommend?",
                  "Tell me about the whisky",
                  "Add the chocolates",
                  "Something relaxing"
                ]}
                contextData={{
                  products: shopItems.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    priceLabel: item.priceLabel,
                    description: item.description,
                    details: item.details,
                    isService: item.isService,
                    deliveryTime: item.deliveryTime
                  })),
                  cart: cart.map(ci => ({
                    id: ci.item.id,
                    name: ci.item.name,
                    quantity: ci.quantity,
                    price: ci.item.price,
                    subtotal: ci.item.price * ci.quantity
                  })),
                  cartTotal: getCartTotal(),
                  orderConfirmed
                }}
                variant="dark"
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
            <div className="relative h-48 w-full">
              <Image
                src={selectedItem.image}
                alt={selectedItem.name}
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
              {selectedItem.isService && (
                <span className="absolute top-4 left-4 text-xs px-2 py-1 bg-amber-500/20 text-amber-400 rounded border border-amber-500/30">
                  Service
                </span>
              )}
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-xl font-medium text-white" style={{ fontFamily: 'var(--font-cormorant)' }}>
                  {selectedItem.name}
                </h3>
                <p className="text-xs text-white/70 mt-1">{selectedItem.deliveryTime}</p>
              </div>
            </div>

            <div className="p-6">
              <p className="text-sm text-white/70 mb-4">{selectedItem.description}</p>

              <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
                <p className="text-xs font-medium text-white/80 mb-2">Details</p>
                <p className="text-sm text-white/60 leading-relaxed">{selectedItem.details}</p>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div>
                  {selectedItem.priceLabel && (
                    <p className="text-xs text-white/40">{selectedItem.priceLabel}</p>
                  )}
                  <p className="text-xl font-medium text-amber-400">{formatPrice(selectedItem.price)}</p>
                </div>
                <div className="flex items-center gap-2 text-amber-400/50">
                  <selectedItem.icon className="w-5 h-5" />
                </div>
              </div>

              <button
                onClick={() => {
                  addToCart(selectedItem);
                  setSelectedItem(null);
                }}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl hover:from-amber-400 hover:to-amber-500 transition-colors flex items-center justify-center gap-2 shadow-lg"
              >
                <Plus className="w-4 h-4" />
                Add to Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
