'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  CreditCard,
  Smartphone,
  Building2,
  Store,
  ChevronRight,
  Check,
  X,
  AlertCircle,
  Lock,
  Shield,
  Loader2,
  CheckCircle2,
  XCircle,
  Receipt,
  Download,
  Mail,
  Copy,
  Printer,
  ArrowLeft,
  Sparkles,
  Clock,
  Info,
} from 'lucide-react';
import {
  usePaymentStore,
  PaymentMethod,
  PaymentStatus,
  CardBrand,
  KonbiniInfo,
  paymentMethodsConfig,
  konbiniStores,
  PaymentReceipt,
  ReceiptItem,
} from '../../store/paymentStore';

// ============================================
// Card Brand Icons
// ============================================

const cardBrandIcons: Record<CardBrand, { bg: string; text: string }> = {
  visa: { bg: 'bg-blue-600', text: 'VISA' },
  mastercard: { bg: 'bg-red-500', text: 'MC' },
  amex: { bg: 'bg-blue-400', text: 'AMEX' },
  jcb: { bg: 'bg-green-600', text: 'JCB' },
  discover: { bg: 'bg-orange-500', text: 'DISC' },
  unknown: { bg: 'bg-gray-500', text: '?' },
};

// ============================================
// Payment Method Selector
// ============================================

interface PaymentMethodSelectorProps {
  onSelect: (method: PaymentMethod) => void;
  selectedMethod: PaymentMethod | null;
}

export function PaymentMethodSelector({ onSelect, selectedMethod }: PaymentMethodSelectorProps) {
  const popularMethods = paymentMethodsConfig.filter((m) => m.popular && m.available);
  const otherMethods = paymentMethodsConfig.filter((m) => !m.popular && m.available);

  return (
    <div className="space-y-6">
      {/* Popular Methods */}
      <div>
        <h3 className="text-sm font-medium text-white/70 mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          Popular Payment Methods
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {popularMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => onSelect(method.id)}
              className={`relative p-4 rounded-xl border transition-all text-left ${
                selectedMethod === method.id
                  ? 'bg-amber-500/20 border-amber-500/50 ring-2 ring-amber-500/30'
                  : 'bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30'
              }`}
            >
              {selectedMethod === method.id && (
                <div className="absolute top-2 right-2">
                  <Check className="w-4 h-4 text-amber-400" />
                </div>
              )}
              <div className="text-2xl mb-2">{method.icon}</div>
              <p className="text-sm font-medium text-white">{method.name}</p>
              <p className="text-xs text-white/50">{method.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Other Methods */}
      <div>
        <h3 className="text-sm font-medium text-white/70 mb-3">Other Payment Methods</h3>
        <div className="space-y-2">
          {otherMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => onSelect(method.id)}
              className={`w-full flex items-center gap-4 p-3 rounded-xl border transition-all ${
                selectedMethod === method.id
                  ? 'bg-amber-500/20 border-amber-500/50'
                  : 'bg-white/5 border-white/20 hover:bg-white/10'
              }`}
            >
              <span className="text-xl">{method.icon}</span>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-white">{method.name}</p>
                <p className="text-xs text-white/50">{method.description}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-white/40">{method.processingTime}</p>
              </div>
              {selectedMethod === method.id && <Check className="w-4 h-4 text-amber-400" />}
            </button>
          ))}
        </div>
      </div>

      {/* Security Notice */}
      <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
        <Shield className="w-5 h-5 text-emerald-400 flex-shrink-0" />
        <p className="text-xs text-emerald-300">
          All payments are secured with 256-bit SSL encryption. Your payment information is never stored on our servers.
        </p>
      </div>
    </div>
  );
}

// ============================================
// Credit Card Form
// ============================================

interface CreditCardFormProps {
  onSubmit: () => void;
  isProcessing: boolean;
}

export function CreditCardForm({ onSubmit, isProcessing }: CreditCardFormProps) {
  const {
    cardInfo,
    setCardInfo,
    validationErrors,
    validateCard,
    savedCards,
  } = usePaymentStore();

  const [useSavedCard, setUseSavedCard] = useState<string | null>(null);
  const [showSavedCards, setShowSavedCards] = useState(savedCards.length > 0);

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const groups = cleaned.match(/.{1,4}/g) || [];
    return groups.join(' ').substr(0, 19);
  };

  // Format expiry
  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardInfo({ number: formatted });
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiry(e.target.value);
    setCardInfo({ expiry: formatted });
  };

  const handleCVCChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substr(0, cardInfo.brand === 'amex' ? 4 : 3);
    setCardInfo({ cvc: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateCard()) {
      onSubmit();
    }
  };

  const handleUseSavedCard = (cardId: string) => {
    const card = savedCards.find((c) => c.id === cardId);
    if (card) {
      setUseSavedCard(cardId);
      setCardInfo({
        number: `**** **** **** ${card.last4}`,
        expiry: card.expiry,
        brand: card.brand,
        name: '',
        cvc: '',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Saved Cards */}
      {showSavedCards && savedCards.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-white/70">Saved Cards</h4>
          {savedCards.map((card) => (
            <button
              key={card.id}
              type="button"
              onClick={() => handleUseSavedCard(card.id)}
              className={`w-full flex items-center gap-4 p-3 rounded-xl border transition-all ${
                useSavedCard === card.id
                  ? 'bg-amber-500/20 border-amber-500/50'
                  : 'bg-white/5 border-white/20 hover:bg-white/10'
              }`}
            >
              <div
                className={`w-12 h-8 rounded flex items-center justify-center text-xs font-bold text-white ${cardBrandIcons[card.brand].bg}`}
              >
                {cardBrandIcons[card.brand].text}
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm text-white">•••• •••• •••• {card.last4}</p>
                <p className="text-xs text-white/50">Expires {card.expiry}</p>
              </div>
              {card.isDefault && (
                <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/30 rounded text-xs text-amber-400">
                  Default
                </span>
              )}
              {useSavedCard === card.id && <Check className="w-5 h-5 text-amber-400" />}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setUseSavedCard(null);
              setShowSavedCards(false);
              setCardInfo({ number: '', expiry: '', cvc: '', name: '', brand: 'unknown' });
            }}
            className="text-sm text-amber-400 hover:text-amber-300"
          >
            + Use a different card
          </button>
        </div>
      )}

      {/* New Card Form */}
      {(!showSavedCards || !useSavedCard) && (
        <>
          {savedCards.length > 0 && !showSavedCards && (
            <button
              type="button"
              onClick={() => setShowSavedCards(true)}
              className="text-sm text-amber-400 hover:text-amber-300 mb-4"
            >
              ← Use a saved card
            </button>
          )}

          {/* Card Number */}
          <div>
            <label className="text-sm text-white/70 mb-2 block">Card Number</label>
            <div className="relative">
              <input
                type="text"
                value={cardInfo.number}
                onChange={handleCardNumberChange}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                className={`w-full bg-white/10 border rounded-xl px-4 py-3 text-white placeholder:text-white/30 pr-16 ${
                  validationErrors.cardNumber ? 'border-red-500' : 'border-white/20'
                }`}
              />
              {cardInfo.brand !== 'unknown' && (
                <div
                  className={`absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 rounded text-xs font-bold text-white ${cardBrandIcons[cardInfo.brand].bg}`}
                >
                  {cardBrandIcons[cardInfo.brand].text}
                </div>
              )}
            </div>
            {validationErrors.cardNumber && (
              <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {validationErrors.cardNumber}
              </p>
            )}
          </div>

          {/* Expiry and CVC */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-white/70 mb-2 block">Expiry Date</label>
              <input
                type="text"
                value={cardInfo.expiry}
                onChange={handleExpiryChange}
                placeholder="MM/YY"
                maxLength={5}
                className={`w-full bg-white/10 border rounded-xl px-4 py-3 text-white placeholder:text-white/30 ${
                  validationErrors.expiry ? 'border-red-500' : 'border-white/20'
                }`}
              />
              {validationErrors.expiry && (
                <p className="text-xs text-red-400 mt-1">{validationErrors.expiry}</p>
              )}
            </div>
            <div>
              <label className="text-sm text-white/70 mb-2 block">CVC</label>
              <div className="relative">
                <input
                  type="text"
                  value={cardInfo.cvc}
                  onChange={handleCVCChange}
                  placeholder={cardInfo.brand === 'amex' ? '1234' : '123'}
                  maxLength={cardInfo.brand === 'amex' ? 4 : 3}
                  className={`w-full bg-white/10 border rounded-xl px-4 py-3 text-white placeholder:text-white/30 ${
                    validationErrors.cvc ? 'border-red-500' : 'border-white/20'
                  }`}
                />
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              </div>
              {validationErrors.cvc && (
                <p className="text-xs text-red-400 mt-1">{validationErrors.cvc}</p>
              )}
            </div>
          </div>

          {/* Cardholder Name */}
          <div>
            <label className="text-sm text-white/70 mb-2 block">Cardholder Name</label>
            <input
              type="text"
              value={cardInfo.name}
              onChange={(e) => setCardInfo({ name: e.target.value.toUpperCase() })}
              placeholder="JOHN SMITH"
              className={`w-full bg-white/10 border rounded-xl px-4 py-3 text-white placeholder:text-white/30 uppercase ${
                validationErrors.cardName ? 'border-red-500' : 'border-white/20'
              }`}
            />
            {validationErrors.cardName && (
              <p className="text-xs text-red-400 mt-1">{validationErrors.cardName}</p>
            )}
          </div>
        </>
      )}

      {/* CVC for saved card */}
      {useSavedCard && (
        <div>
          <label className="text-sm text-white/70 mb-2 block">CVC</label>
          <input
            type="text"
            value={cardInfo.cvc}
            onChange={handleCVCChange}
            placeholder="123"
            maxLength={3}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/30"
          />
          <p className="text-xs text-white/40 mt-1">Enter the 3-digit code on the back of your card</p>
        </div>
      )}

      {/* Test Card Info */}
      <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-blue-300">
            <p className="font-medium mb-1">Test Card Numbers:</p>
            <p>• 4242 4242 4242 4242 - Always succeeds</p>
            <p>• 4000 0000 0000 0002 - Always declines</p>
            <p>• Any future expiry and 3-digit CVC</p>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isProcessing}
        className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Lock className="w-5 h-5" />
            Pay Securely
          </>
        )}
      </button>
    </form>
  );
}

// ============================================
// Payment Processing Animation
// ============================================

interface PaymentProcessingProps {
  status: PaymentStatus;
  statusMessage: string;
  progress: number;
  step: string;
  onCancel: () => void;
}

export function PaymentProcessing({ status, statusMessage, progress, step, onCancel }: PaymentProcessingProps) {
  const steps = ['Validating', 'Connecting', 'Processing', 'Authenticating', 'Finalizing', 'Complete'];
  const currentStepIndex = steps.indexOf(step);

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-8">
      {/* Animated Circle */}
      <div className="relative">
        {/* Background circle */}
        <svg className="w-32 h-32 transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="56"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-white/10"
          />
          <circle
            cx="64"
            cy="64"
            r="56"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            className="text-amber-500 transition-all duration-500"
            strokeDasharray={`${2 * Math.PI * 56}`}
            strokeDashoffset={`${2 * Math.PI * 56 * (1 - progress / 100)}`}
          />
        </svg>

        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          {status === 'success' ? (
            <CheckCircle2 className="w-12 h-12 text-emerald-400" />
          ) : status === 'failed' ? (
            <XCircle className="w-12 h-12 text-red-400" />
          ) : (
            <div className="text-2xl font-bold text-white">{progress}%</div>
          )}
        </div>
      </div>

      {/* Status Message */}
      <div className="text-center">
        <p className="text-lg font-medium text-white mb-2">{statusMessage}</p>
        <p className="text-sm text-white/50">Please do not close this window</p>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center gap-2">
        {steps.slice(0, -1).map((s, i) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-2 h-2 rounded-full transition-all ${
                i < currentStepIndex
                  ? 'bg-amber-500'
                  : i === currentStepIndex
                  ? 'bg-amber-500 animate-pulse'
                  : 'bg-white/20'
              }`}
            />
            {i < steps.length - 2 && <div className="w-8 h-0.5 bg-white/20 mx-1" />}
          </div>
        ))}
      </div>

      {/* Cancel Button (only during processing) */}
      {status === 'processing' && (
        <button
          onClick={onCancel}
          className="text-sm text-white/50 hover:text-white/70 transition-colors"
        >
          Cancel Payment
        </button>
      )}
    </div>
  );
}

// ============================================
// Order Receipt
// ============================================

interface OrderReceiptProps {
  receipt: PaymentReceipt;
  onClose: () => void;
  onNewBooking: () => void;
}

export function OrderReceipt({ receipt, onClose, onNewBooking }: OrderReceiptProps) {
  const [copied, setCopied] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const handleCopyRef = () => {
    navigator.clipboard.writeText(receipt.bookingReference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="text-center py-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-light text-white mb-2">Payment Successful!</h2>
        <p className="text-white/60">Your booking has been confirmed</p>
      </div>

      {/* Receipt Card */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
        {/* Receipt Header */}
        <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Receipt className="w-5 h-5 text-amber-400" />
              <span className="text-sm font-medium text-white">Payment Receipt</span>
            </div>
            <span className="text-xs text-white/50">#{receipt.receiptNumber}</span>
          </div>
        </div>

        {/* Receipt Body */}
        <div className="p-4 space-y-4">
          {/* Booking Reference */}
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
            <div>
              <p className="text-xs text-white/50">Booking Reference</p>
              <p className="text-lg font-mono font-bold text-amber-400">{receipt.bookingReference}</p>
            </div>
            <button
              onClick={handleCopyRef}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              {copied ? (
                <Check className="w-5 h-5 text-emerald-400" />
              ) : (
                <Copy className="w-5 h-5 text-white/50" />
              )}
            </button>
          </div>

          {/* Transaction Details */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-white/50">Transaction ID</p>
              <p className="text-sm font-mono text-white">{receipt.transactionId}</p>
            </div>
            <div>
              <p className="text-xs text-white/50">Date & Time</p>
              <p className="text-sm text-white">{formatDate(receipt.paidAt)}</p>
            </div>
            <div>
              <p className="text-xs text-white/50">Payment Method</p>
              <div className="flex items-center gap-2">
                {receipt.cardBrand && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-xs font-bold text-white ${cardBrandIcons[receipt.cardBrand].bg}`}
                  >
                    {cardBrandIcons[receipt.cardBrand].text}
                  </span>
                )}
                <span className="text-sm text-white">•••• {receipt.cardLast4}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-white/50">Status</p>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 rounded text-xs text-emerald-400">
                <Check className="w-3 h-3" />
                Paid
              </span>
            </div>
          </div>

          {/* Items */}
          <div className="border-t border-white/10 pt-4">
            <p className="text-xs text-white/50 mb-3">Order Items</p>
            <div className="space-y-2">
              {receipt.items.map((item, i) => (
                <div key={i} className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-sm text-white">{item.name}</p>
                    <p className="text-xs text-white/40">{item.description}</p>
                  </div>
                  <p className="text-sm text-white">{formatPrice(item.totalPrice)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="border-t border-white/10 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/50">Subtotal</span>
              <span className="text-white">{formatPrice(receipt.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/50">Tax (10%)</span>
              <span className="text-white">{formatPrice(receipt.tax)}</span>
            </div>
            <div className="flex justify-between text-lg font-medium pt-2 border-t border-white/10">
              <span className="text-white">Total Paid</span>
              <span className="text-amber-400">{formatPrice(receipt.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handlePrint}
          className="flex-1 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <Printer className="w-4 h-4" />
          Print Receipt
        </button>
        <button
          onClick={() => {}}
          className="flex-1 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <Mail className="w-4 h-4" />
          Email Receipt
        </button>
      </div>

      {/* Confirmation Email Notice */}
      <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl">
        <div className="flex items-start gap-2">
          <Mail className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-300">
            A confirmation email with your booking details and receipt has been sent to your email address.
          </p>
        </div>
      </div>

      {/* New Booking Button */}
      <button
        onClick={onNewBooking}
        className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium rounded-xl transition-all"
      >
        Make Another Booking
      </button>
    </div>
  );
}

// ============================================
// Konbini Payment Form
// ============================================

export function KonbiniForm({ onSubmit }: { onSubmit: () => void }) {
  const { konbiniInfo, setKonbiniInfo } = usePaymentStore();

  return (
    <div className="space-y-6">
      {/* Store Selection */}
      <div>
        <label className="text-sm text-white/70 mb-3 block">Select Convenience Store</label>
        <div className="grid grid-cols-2 gap-3">
          {konbiniStores.map((store) => (
            <button
              key={store.id}
              type="button"
              onClick={() => setKonbiniInfo({ store: store.id as KonbiniInfo['store'] })}
              className={`p-3 rounded-xl border transition-all text-left ${
                konbiniInfo.store === store.id
                  ? 'bg-amber-500/20 border-amber-500/50'
                  : 'bg-white/5 border-white/20 hover:bg-white/10'
              }`}
            >
              <span className="text-xl mr-2">{store.icon}</span>
              <span className="text-sm text-white">{store.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Customer Info */}
      <div className="space-y-4">
        <div>
          <label className="text-sm text-white/70 mb-2 block">Full Name (カタカナ)</label>
          <input
            type="text"
            value={konbiniInfo.customerName}
            onChange={(e) => setKonbiniInfo({ customerName: e.target.value })}
            placeholder="ヤマダ タロウ"
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/30"
          />
        </div>
        <div>
          <label className="text-sm text-white/70 mb-2 block">Email</label>
          <input
            type="email"
            value={konbiniInfo.customerEmail}
            onChange={(e) => setKonbiniInfo({ customerEmail: e.target.value })}
            placeholder="your@email.com"
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/30"
          />
        </div>
        <div>
          <label className="text-sm text-white/70 mb-2 block">Phone Number</label>
          <input
            type="tel"
            value={konbiniInfo.customerPhone}
            onChange={(e) => setKonbiniInfo({ customerPhone: e.target.value })}
            placeholder="090-1234-5678"
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/30"
          />
        </div>
      </div>

      {/* Info Notice */}
      <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
        <div className="flex items-start gap-2">
          <Clock className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-300">
            <p className="font-medium mb-1">Payment Instructions:</p>
            <p>1. Complete this form to receive a payment slip</p>
            <p>2. Visit your selected convenience store within 3 days</p>
            <p>3. Show the payment slip at the register</p>
            <p>4. Your booking will be confirmed upon payment</p>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onSubmit}
        className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2"
      >
        <Store className="w-5 h-5" />
        Generate Payment Slip
      </button>
    </div>
  );
}

// ============================================
// Main Payment Flow Component
// ============================================

interface PaymentFlowProps {
  amount: number;
  bookingReference: string;
  items: ReceiptItem[];
  onSuccess: (receipt: PaymentReceipt) => void;
  onCancel: () => void;
}

export function PaymentFlow({ amount, bookingReference, items, onSuccess, onCancel }: PaymentFlowProps) {
  const {
    selectedMethod,
    setSelectedMethod,
    status,
    statusMessage,
    processingProgress,
    processingStep,
    processPayment,
    cancelPayment,
    resetPayment,
    generateReceipt,
    receipt,
  } = usePaymentStore();

  const [step, setStep] = useState<'select' | 'form' | 'processing' | 'complete'>('select');

  const tax = Math.round(amount * 0.1);
  const total = amount + tax;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setStep('form');
  };

  const handlePayment = async () => {
    setStep('processing');
    const result = await processPayment(total, bookingReference);

    if (result.success) {
      const generatedReceipt = generateReceipt(bookingReference, items, amount, tax, total);
      setStep('complete');
      onSuccess(generatedReceipt);
    } else {
      // Stay on processing to show error, then go back
      setTimeout(() => {
        setStep('form');
      }, 2000);
    }
  };

  const handleBack = () => {
    if (step === 'form') {
      setStep('select');
      setSelectedMethod(null);
    }
  };

  const handleCancel = () => {
    cancelPayment();
    resetPayment();
    onCancel();
  };

  // Handle status changes
  useEffect(() => {
    if (status === 'success' && receipt) {
      setStep('complete');
    }
  }, [status, receipt]);

  return (
    <div className="space-y-6">
      {/* Header */}
      {step !== 'complete' && step !== 'processing' && (
        <div className="flex items-center justify-between">
          {step === 'form' ? (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div />
          )}
          <div className="text-right">
            <p className="text-xs text-white/50">Amount to Pay</p>
            <p className="text-2xl font-bold text-amber-400">{formatPrice(total)}</p>
          </div>
        </div>
      )}

      {/* Step Content */}
      {step === 'select' && (
        <PaymentMethodSelector onSelect={handleMethodSelect} selectedMethod={selectedMethod} />
      )}

      {step === 'form' && selectedMethod && (
        <>
          {(selectedMethod === 'credit_card' || selectedMethod === 'debit_card') && (
            <CreditCardForm onSubmit={handlePayment} isProcessing={status === 'processing'} />
          )}
          {selectedMethod === 'konbini' && <KonbiniForm onSubmit={handlePayment} />}
          {(selectedMethod === 'apple_pay' || selectedMethod === 'google_pay') && (
            <div className="text-center py-12">
              <Smartphone className="w-16 h-16 mx-auto mb-4 text-white/30" />
              <p className="text-white/60 mb-4">
                {selectedMethod === 'apple_pay' ? 'Apple Pay' : 'Google Pay'} is not available in demo mode
              </p>
              <button
                onClick={handleBack}
                className="text-amber-400 hover:text-amber-300"
              >
                Choose another method
              </button>
            </div>
          )}
          {(selectedMethod === 'wechat_pay' || selectedMethod === 'alipay') && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">{selectedMethod === 'wechat_pay' ? '💚' : '🔵'}</div>
              <p className="text-white/60 mb-4">
                {selectedMethod === 'wechat_pay' ? 'WeChat Pay' : 'Alipay'} QR code would appear here
              </p>
              <button
                onClick={handlePayment}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-colors"
              >
                Simulate Payment
              </button>
            </div>
          )}
        </>
      )}

      {step === 'processing' && (
        <PaymentProcessing
          status={status}
          statusMessage={statusMessage}
          progress={processingProgress}
          step={processingStep}
          onCancel={handleCancel}
        />
      )}

      {step === 'complete' && receipt && (
        <OrderReceipt
          receipt={receipt}
          onClose={onCancel}
          onNewBooking={() => {
            resetPayment();
            onCancel();
          }}
        />
      )}
    </div>
  );
}

export default PaymentFlow;
