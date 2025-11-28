'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  ShoppingBag, Plus, Minus, X, Check, Sparkles,
  Wine, Gift, Heart, ChefHat, Waves, ArrowLeft
} from 'lucide-react';
import VoiceSessionChat from '../components/VoiceSessionChat';
import Link from 'next/link';

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

  return (
    <div className="flex h-screen bg-stone-100">
      {/* Left: Hotel Boutique */}
      <div className="flex-[2] min-w-0 flex flex-col">
        {/* Hero Section */}
        <div className="relative h-44 flex-shrink-0">
          <Image
            src="/hotel3.jpg"
            alt="The 1898 Boutique"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

          {/* Back Button */}
          <Link
            href="/"
            className="absolute top-4 left-4 p-2 bg-white/80 backdrop-blur-sm rounded-full text-stone-600 hover:bg-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          {/* Title */}
          <div className="absolute bottom-4 left-6 right-6">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <p className="text-xs uppercase tracking-widest text-amber-400">Curated Collection</p>
            </div>
            <h1 className="text-xl font-light text-white" style={{ fontFamily: 'var(--font-cormorant)' }}>
              The 1898 Boutique
            </h1>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Your Order Card */}
          <div className={`rounded-xl p-5 transition-all ${orderConfirmed ? 'bg-emerald-50 border border-emerald-200' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-stone-800" style={{ fontFamily: 'var(--font-cormorant)' }}>
                {orderConfirmed ? 'Order Confirmed' : 'Your Order'}
              </h2>
              {!orderConfirmed && cart.length > 0 && (
                <span className="text-xs text-stone-400">
                  {cart.reduce((sum, ci) => sum + ci.quantity, 0)} items
                </span>
              )}
              {orderConfirmed && (
                <div className="flex items-center gap-1.5 text-emerald-600">
                  <Check className="w-4 h-4" />
                  <span className="text-xs font-medium">Delivered to your suite</span>
                </div>
              )}
            </div>

            {orderConfirmed ? (
              <div className="text-center py-4">
                <p className="text-sm text-emerald-700 mb-2">
                  Thank you for your order!
                </p>
                <p className="text-xs text-emerald-600/70">
                  Your items will be delivered shortly.
                </p>
                <button
                  onClick={clearCart}
                  className="mt-4 text-xs text-emerald-600 hover:text-emerald-700 underline"
                >
                  Start new order
                </button>
              </div>
            ) : cart.length === 0 ? (
              <div className="text-center py-6">
                <ShoppingBag className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                <p className="text-sm text-stone-400">Your order is empty</p>
                <p className="text-xs text-stone-300 mt-1">Ask about our products or add items below</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map(ci => (
                  <div key={ci.item.id} className="flex items-center gap-3 p-2 bg-stone-50 rounded-lg">
                    <ci.item.icon className="w-4 h-4 text-stone-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-stone-800 truncate">{ci.item.name}</p>
                      <p className="text-xs text-stone-400">{formatPrice(ci.item.price)} each</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(ci.item.id, ci.quantity - 1)}
                        className="p-1 text-stone-400 hover:text-stone-600"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-medium w-4 text-center">{ci.quantity}</span>
                      <button
                        onClick={() => updateQuantity(ci.item.id, ci.quantity + 1)}
                        className="p-1 text-stone-400 hover:text-stone-600"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-sm font-medium text-stone-800 w-20 text-right">
                      {formatPrice(ci.item.price * ci.quantity)}
                    </p>
                  </div>
                ))}

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                  <p className="text-sm text-stone-600">Total</p>
                  <p className="text-lg font-medium text-stone-800">{formatPrice(getCartTotal())}</p>
                </div>

                <p className="text-xs text-stone-400 text-center">
                  Charges added to your room bill
                </p>
              </div>
            )}
          </div>

          {/* Products List */}
          <div className="space-y-3">
            <h3 className="text-xs font-medium text-stone-400 uppercase tracking-wider">Our Selection</h3>
            {shopItems.map(item => (
              <div
                key={item.id}
                className="bg-white rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
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
                      <span className="absolute top-2 left-2 text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded">
                        Service
                      </span>
                    )}
                  </div>
                  {/* Product Info */}
                  <div className="flex-1 min-w-0 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-stone-800">{item.name}</p>
                        <p className="text-xs text-stone-500 mt-0.5 line-clamp-2">{item.description}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        {item.priceLabel && (
                          <p className="text-[10px] text-stone-400">{item.priceLabel}</p>
                        )}
                        <p className="text-sm font-medium text-stone-800">{formatPrice(item.price)}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-stone-400">
                        {item.deliveryTime}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(item);
                        }}
                        className="px-3 py-1.5 text-xs bg-stone-800 text-white rounded-lg hover:bg-stone-700 transition-colors flex items-center gap-1"
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

          {/* Hint */}
          <p className="text-center text-xs text-stone-400 py-2">
            Ask about any product for more details
          </p>
        </div>
      </div>

      {/* Right: Voice Chat */}
      <div className="flex-[1] min-w-0 p-6">
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
        />
      </div>

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
            {/* Product Image */}
            <div className="relative h-48 w-full">
              <Image
                src={selectedItem.image}
                alt={selectedItem.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full text-stone-600 hover:bg-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              {selectedItem.isService && (
                <span className="absolute top-4 left-4 text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded">
                  Service
                </span>
              )}
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-xl font-medium text-white" style={{ fontFamily: 'var(--font-cormorant)' }}>
                  {selectedItem.name}
                </h3>
                <p className="text-xs text-white/80 mt-1">{selectedItem.deliveryTime}</p>
              </div>
            </div>

            <div className="p-6">
              <p className="text-sm text-stone-600 mb-4">{selectedItem.description}</p>

              <div className="bg-stone-50 rounded-xl p-4 mb-6">
                <p className="text-xs font-medium text-stone-800 mb-2">Details</p>
                <p className="text-sm text-stone-600 leading-relaxed">{selectedItem.details}</p>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div>
                  {selectedItem.priceLabel && (
                    <p className="text-xs text-stone-400">{selectedItem.priceLabel}</p>
                  )}
                  <p className="text-xl font-medium text-stone-800">{formatPrice(selectedItem.price)}</p>
                </div>
                <div className="flex items-center gap-2 text-stone-400">
                  <selectedItem.icon className="w-5 h-5" />
                </div>
              </div>

              <button
                onClick={() => {
                  addToCart(selectedItem);
                  setSelectedItem(null);
                }}
                className="w-full py-3 bg-stone-800 text-white rounded-xl hover:bg-stone-700 transition-colors flex items-center justify-center gap-2"
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
