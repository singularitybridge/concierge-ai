import { create } from 'zustand';

export interface SlideData {
  slideIndex: number;
  topic: string;
  content: string;
  timestamp: number;
}

interface SlideStore {
  // Current slide state
  currentSlide: number;
  slideData: SlideData | null;

  // Connection state
  isConnected: boolean;
  lastUpdate: number;

  // Actions
  updateSlide: (data: Partial<SlideData>) => void;
  setSlideIndex: (index: number) => void;
  setConnectionStatus: (status: boolean) => void;
  reset: () => void;
}

export const useSlideStore = create<SlideStore>((set, get) => ({
  // Initial state
  currentSlide: 0,
  slideData: null,
  isConnected: false,
  lastUpdate: 0,

  // Update slide with new data
  updateSlide: (data: Partial<SlideData>) => {
    const current = get().slideData;
    const updated: SlideData = {
      slideIndex: data.slideIndex ?? current?.slideIndex ?? 0,
      topic: data.topic ?? current?.topic ?? '',
      content: data.content ?? current?.content ?? '',
      timestamp: data.timestamp ?? Date.now(),
    };

    set({
      slideData: updated,
      currentSlide: updated.slideIndex,
      lastUpdate: Date.now(),
    });
  },

  // Set slide index only
  setSlideIndex: (index: number) => {
    set({ currentSlide: index });

    const current = get().slideData;
    if (current) {
      set({
        slideData: { ...current, slideIndex: index, timestamp: Date.now() },
        lastUpdate: Date.now(),
      });
    }
  },

  // Update connection status
  setConnectionStatus: (status: boolean) => {
    set({ isConnected: status });
  },

  // Reset to initial state
  reset: () => {
    set({
      currentSlide: 0,
      slideData: null,
      isConnected: false,
      lastUpdate: 0,
    });
  },
}));
