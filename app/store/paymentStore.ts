import { create } from 'zustand';

// ============================================
// Payment Types
// ============================================

export type PaymentMethod =
  | 'credit_card'
  | 'debit_card'
  | 'apple_pay'
  | 'google_pay'
  | 'wechat_pay'
  | 'alipay'
  | 'konbini'        // Convenience store payment (Japan)
  | 'bank_transfer';

export type PaymentStatus =
  | 'idle'
  | 'validating'
  | 'processing'
  | 'authenticating'  // 3D Secure
  | 'success'
  | 'failed'
  | 'cancelled';

export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'jcb' | 'discover' | 'unknown';

export interface CreditCardInfo {
  number: string;
  expiry: string;
  cvc: string;
  name: string;
  brand: CardBrand;
}

export interface KonbiniInfo {
  store: 'seven_eleven' | 'lawson' | 'family_mart' | 'ministop' | 'daily_yamazaki';
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  authorizationCode?: string;
  errorCode?: string;
  errorMessage?: string;
  timestamp: Date;
}

export interface PaymentReceipt {
  receiptNumber: string;
  bookingReference: string;
  transactionId: string;
  paymentMethod: PaymentMethod;
  cardLast4?: string;
  cardBrand?: CardBrand;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  paidAt: Date;
  items: ReceiptItem[];
}

export interface ReceiptItem {
  type: 'accommodation' | 'service' | 'product';
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

// ============================================
// Validation Types
// ============================================

export interface ValidationErrors {
  cardNumber?: string;
  expiry?: string;
  cvc?: string;
  cardName?: string;
}

// ============================================
// Store State
// ============================================

interface PaymentState {
  // Selected payment method
  selectedMethod: PaymentMethod | null;

  // Card info
  cardInfo: CreditCardInfo;

  // Konbini info
  konbiniInfo: KonbiniInfo;

  // Payment status
  status: PaymentStatus;
  statusMessage: string;

  // Processing progress (0-100)
  processingProgress: number;
  processingStep: string;

  // Validation
  validationErrors: ValidationErrors;
  isValid: boolean;

  // Result
  paymentResult: PaymentResult | null;
  receipt: PaymentReceipt | null;

  // Saved cards (mock)
  savedCards: {
    id: string;
    last4: string;
    brand: CardBrand;
    expiry: string;
    isDefault: boolean;
  }[];

  // Actions
  setSelectedMethod: (method: PaymentMethod | null) => void;
  setCardInfo: (info: Partial<CreditCardInfo>) => void;
  setKonbiniInfo: (info: Partial<KonbiniInfo>) => void;
  validateCard: () => boolean;
  detectCardBrand: (number: string) => CardBrand;

  // Payment processing
  processPayment: (amount: number, bookingRef: string) => Promise<PaymentResult>;
  cancelPayment: () => void;
  resetPayment: () => void;

  // Receipt
  generateReceipt: (
    bookingRef: string,
    items: ReceiptItem[],
    subtotal: number,
    tax: number,
    total: number
  ) => PaymentReceipt;
}

// ============================================
// Initial State
// ============================================

const initialCardInfo: CreditCardInfo = {
  number: '',
  expiry: '',
  cvc: '',
  name: '',
  brand: 'unknown',
};

const initialKonbiniInfo: KonbiniInfo = {
  store: 'seven_eleven',
  customerName: '',
  customerEmail: '',
  customerPhone: '',
};

// ============================================
// Helper Functions
// ============================================

function detectCardBrand(number: string): CardBrand {
  const cleaned = number.replace(/\s/g, '');

  if (/^4/.test(cleaned)) return 'visa';
  if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) return 'mastercard';
  if (/^3[47]/.test(cleaned)) return 'amex';
  if (/^35/.test(cleaned)) return 'jcb';
  if (/^6(?:011|5)/.test(cleaned)) return 'discover';

  return 'unknown';
}

function validateCardNumber(number: string): string | undefined {
  const cleaned = number.replace(/\s/g, '');

  if (!cleaned) return 'Card number is required';
  if (!/^\d+$/.test(cleaned)) return 'Invalid card number';
  if (cleaned.length < 13 || cleaned.length > 19) return 'Invalid card number length';

  // Luhn algorithm check
  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    isEven = !isEven;
  }

  if (sum % 10 !== 0) return 'Invalid card number';

  return undefined;
}

function validateExpiry(expiry: string): string | undefined {
  if (!expiry) return 'Expiry date is required';

  const match = expiry.match(/^(\d{2})\/(\d{2})$/);
  if (!match) return 'Invalid format (MM/YY)';

  const month = parseInt(match[1], 10);
  const year = parseInt(match[2], 10) + 2000;

  if (month < 1 || month > 12) return 'Invalid month';

  const now = new Date();
  const expiryDate = new Date(year, month - 1);

  if (expiryDate < now) return 'Card has expired';

  return undefined;
}

function validateCVC(cvc: string, brand: CardBrand): string | undefined {
  if (!cvc) return 'CVC is required';

  const expectedLength = brand === 'amex' ? 4 : 3;

  if (!/^\d+$/.test(cvc)) return 'Invalid CVC';
  if (cvc.length !== expectedLength) return `CVC must be ${expectedLength} digits`;

  return undefined;
}

function generateTransactionId(): string {
  return `TXN${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
}

function generateReceiptNumber(): string {
  return `RCP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
}

function generateAuthCode(): string {
  return Math.random().toString(36).substr(2, 6).toUpperCase();
}

// ============================================
// Store Implementation
// ============================================

export const usePaymentStore = create<PaymentState>((set, get) => ({
  selectedMethod: null,
  cardInfo: initialCardInfo,
  konbiniInfo: initialKonbiniInfo,
  status: 'idle',
  statusMessage: '',
  processingProgress: 0,
  processingStep: '',
  validationErrors: {},
  isValid: false,
  paymentResult: null,
  receipt: null,

  // Mock saved cards
  savedCards: [
    {
      id: 'card-1',
      last4: '4242',
      brand: 'visa',
      expiry: '12/26',
      isDefault: true,
    },
    {
      id: 'card-2',
      last4: '5555',
      brand: 'mastercard',
      expiry: '08/25',
      isDefault: false,
    },
  ],

  setSelectedMethod: (method) => {
    set({ selectedMethod: method, validationErrors: {}, isValid: false });
  },

  setCardInfo: (info) => {
    set((state) => {
      const newCardInfo = { ...state.cardInfo, ...info };

      // Auto-detect card brand
      if (info.number !== undefined) {
        newCardInfo.brand = detectCardBrand(info.number);
      }

      return { cardInfo: newCardInfo };
    });
  },

  setKonbiniInfo: (info) => {
    set((state) => ({
      konbiniInfo: { ...state.konbiniInfo, ...info },
    }));
  },

  validateCard: () => {
    const { cardInfo } = get();
    const errors: ValidationErrors = {};

    errors.cardNumber = validateCardNumber(cardInfo.number);
    errors.expiry = validateExpiry(cardInfo.expiry);
    errors.cvc = validateCVC(cardInfo.cvc, cardInfo.brand);

    if (!cardInfo.name.trim()) {
      errors.cardName = 'Cardholder name is required';
    }

    const isValid = !errors.cardNumber && !errors.expiry && !errors.cvc && !errors.cardName;

    set({ validationErrors: errors, isValid });

    return isValid;
  },

  detectCardBrand,

  processPayment: async (amount, bookingRef) => {
    const { selectedMethod, cardInfo, validateCard } = get();

    // Validate card if credit card payment
    if (selectedMethod === 'credit_card' || selectedMethod === 'debit_card') {
      if (!validateCard()) {
        return {
          success: false,
          errorCode: 'VALIDATION_ERROR',
          errorMessage: 'Please correct the card details',
          timestamp: new Date(),
        };
      }
    }

    // Start processing
    set({
      status: 'validating',
      statusMessage: 'Validating payment details...',
      processingProgress: 0,
      processingStep: 'Validating',
    });

    // Simulate processing steps
    const steps = [
      { progress: 20, step: 'Validating', message: 'Validating payment details...', delay: 800 },
      { progress: 40, step: 'Connecting', message: 'Connecting to payment gateway...', delay: 1000 },
      { progress: 60, step: 'Processing', message: 'Processing transaction...', delay: 1500 },
      { progress: 80, step: 'Authenticating', message: 'Verifying with your bank...', delay: 1200 },
      { progress: 95, step: 'Finalizing', message: 'Finalizing payment...', delay: 800 },
    ];

    for (const step of steps) {
      await new Promise((resolve) => setTimeout(resolve, step.delay));

      // Check if cancelled
      if (get().status === 'cancelled') {
        return {
          success: false,
          errorCode: 'CANCELLED',
          errorMessage: 'Payment was cancelled',
          timestamp: new Date(),
        };
      }

      set({
        status: step.step === 'Authenticating' ? 'authenticating' : 'processing',
        statusMessage: step.message,
        processingProgress: step.progress,
        processingStep: step.step,
      });
    }

    // Simulate success/failure (95% success rate for demo)
    const isSuccess = Math.random() > 0.05;

    // Special test card numbers
    const cardNumber = cardInfo.number.replace(/\s/g, '');
    const forceSuccess = cardNumber.startsWith('4242') || cardNumber.startsWith('5555');
    const forceFail = cardNumber.startsWith('4000000000000002');

    const success = forceFail ? false : (forceSuccess || isSuccess);

    const result: PaymentResult = success
      ? {
          success: true,
          transactionId: generateTransactionId(),
          authorizationCode: generateAuthCode(),
          timestamp: new Date(),
        }
      : {
          success: false,
          errorCode: 'DECLINED',
          errorMessage: 'Your card was declined. Please try a different payment method.',
          timestamp: new Date(),
        };

    set({
      status: success ? 'success' : 'failed',
      statusMessage: success ? 'Payment successful!' : result.errorMessage || 'Payment failed',
      processingProgress: 100,
      processingStep: success ? 'Complete' : 'Failed',
      paymentResult: result,
    });

    return result;
  },

  cancelPayment: () => {
    set({
      status: 'cancelled',
      statusMessage: 'Payment cancelled',
      processingProgress: 0,
      processingStep: '',
    });
  },

  resetPayment: () => {
    set({
      selectedMethod: null,
      cardInfo: initialCardInfo,
      konbiniInfo: initialKonbiniInfo,
      status: 'idle',
      statusMessage: '',
      processingProgress: 0,
      processingStep: '',
      validationErrors: {},
      isValid: false,
      paymentResult: null,
      receipt: null,
    });
  },

  generateReceipt: (bookingRef, items, subtotal, tax, total) => {
    const { selectedMethod, cardInfo, paymentResult } = get();

    const receipt: PaymentReceipt = {
      receiptNumber: generateReceiptNumber(),
      bookingReference: bookingRef,
      transactionId: paymentResult?.transactionId || generateTransactionId(),
      paymentMethod: selectedMethod || 'credit_card',
      cardLast4: cardInfo.number.replace(/\s/g, '').slice(-4),
      cardBrand: cardInfo.brand,
      subtotal,
      tax,
      total,
      currency: 'JPY',
      paidAt: new Date(),
      items,
    };

    set({ receipt });

    return receipt;
  },
}));

// ============================================
// Payment Method Configuration
// ============================================

export interface PaymentMethodConfig {
  id: PaymentMethod;
  name: string;
  nameJapanese: string;
  icon: string;
  description: string;
  processingTime: string;
  fees: string;
  available: boolean;
  popular?: boolean;
}

export const paymentMethodsConfig: PaymentMethodConfig[] = [
  {
    id: 'credit_card',
    name: 'Credit Card',
    nameJapanese: 'クレジットカード',
    icon: '💳',
    description: 'Visa, Mastercard, AMEX, JCB',
    processingTime: 'Instant',
    fees: 'No additional fees',
    available: true,
    popular: true,
  },
  {
    id: 'debit_card',
    name: 'Debit Card',
    nameJapanese: 'デビットカード',
    icon: '💳',
    description: 'Pay directly from your bank account',
    processingTime: 'Instant',
    fees: 'No additional fees',
    available: true,
  },
  {
    id: 'apple_pay',
    name: 'Apple Pay',
    nameJapanese: 'Apple Pay',
    icon: '',
    description: 'Pay with Face ID or Touch ID',
    processingTime: 'Instant',
    fees: 'No additional fees',
    available: true,
    popular: true,
  },
  {
    id: 'google_pay',
    name: 'Google Pay',
    nameJapanese: 'Google Pay',
    icon: '🔷',
    description: 'Pay with your Google account',
    processingTime: 'Instant',
    fees: 'No additional fees',
    available: true,
  },
  {
    id: 'wechat_pay',
    name: 'WeChat Pay',
    nameJapanese: '微信支付',
    icon: '💚',
    description: 'Pay with WeChat',
    processingTime: 'Instant',
    fees: 'No additional fees',
    available: true,
  },
  {
    id: 'alipay',
    name: 'Alipay',
    nameJapanese: '支付宝',
    icon: '🔵',
    description: 'Pay with Alipay',
    processingTime: 'Instant',
    fees: 'No additional fees',
    available: true,
  },
  {
    id: 'konbini',
    name: 'Convenience Store',
    nameJapanese: 'コンビニ払い',
    icon: '🏪',
    description: 'Pay at 7-Eleven, Lawson, FamilyMart',
    processingTime: '1-2 business days',
    fees: '¥200 handling fee',
    available: true,
  },
  {
    id: 'bank_transfer',
    name: 'Bank Transfer',
    nameJapanese: '銀行振込',
    icon: '🏦',
    description: 'Transfer from your bank account',
    processingTime: '1-3 business days',
    fees: 'Bank fees may apply',
    available: true,
  },
];

// ============================================
// Konbini Store Configuration
// ============================================

export const konbiniStores = [
  { id: 'seven_eleven', name: '7-Eleven', nameJapanese: 'セブン-イレブン', icon: '🔴' },
  { id: 'lawson', name: 'Lawson', nameJapanese: 'ローソン', icon: '🔵' },
  { id: 'family_mart', name: 'FamilyMart', nameJapanese: 'ファミリーマート', icon: '🟢' },
  { id: 'ministop', name: 'Ministop', nameJapanese: 'ミニストップ', icon: '🟡' },
  { id: 'daily_yamazaki', name: 'Daily Yamazaki', nameJapanese: 'デイリーヤマザキ', icon: '🟠' },
];
