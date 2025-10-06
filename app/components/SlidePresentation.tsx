'use client';

import { useEffect, useRef } from 'react';
import Reveal from 'reveal.js';
import 'reveal.js/dist/reveal.css';
import 'reveal.js/dist/theme/white.css';
import { useSlideStore } from '../store/slideStore';
import { useSlideSync } from '../hooks/useSlideSync';

interface SlidePresentationProps {
  sessionId?: string;
  enabled?: boolean;
}

export default function SlidePresentation({ sessionId = 'default', enabled = true }: SlidePresentationProps) {
  const deckDivRef = useRef<HTMLDivElement>(null);
  const deckRef = useRef<Reveal.Api | null>(null);
  const { currentSlide, slideData, isConnected } = useSlideStore();

  // Sync with workspace
  useSlideSync(sessionId, enabled);

  // Initialize Reveal.js
  useEffect(() => {
    if (!deckDivRef.current || deckRef.current) return;

    const revealInstance = new Reveal(deckDivRef.current, {
      transition: 'slide',
      controlsLayout: 'edges',
      hash: true,
      respondToHashChanges: false,
      embedded: false,
      width: '100%',
      height: '100%',
    });

    revealInstance.initialize().then(() => {
      console.log('✅ Reveal.js initialized');
      deckRef.current = revealInstance;

      // Listen for slide changes from user navigation
      revealInstance.on('slidechanged', (event: any) => {
        const slideIndex = event.indexh;
        console.log('👆 User navigated to slide:', slideIndex);

        // Update store (but don't trigger workspace update to avoid loops)
        useSlideStore.setState({ currentSlide: slideIndex });
      });
    });

    return () => {
      if (deckRef.current) {
        deckRef.current.destroy();
        deckRef.current = null;
      }
    };
  }, []);

  // Navigate when AI updates slide
  useEffect(() => {
    if (!deckRef.current || currentSlide === null) return;

    const currentIndex = deckRef.current.getState().indexh;
    if (currentIndex !== currentSlide) {
      console.log('🤖 AI navigating to slide:', currentSlide);
      deckRef.current.slide(currentSlide);
    }
  }, [currentSlide]);

  // Update slide content dynamically
  useEffect(() => {
    if (!slideData || !slideData.content) return;

    const slideElement = document.querySelector(`[data-slide-index="${slideData.slideIndex}"] .dynamic-content`);
    if (slideElement) {
      console.log('📝 Updating slide content:', slideData.content);
      slideElement.innerHTML = slideData.content;
    }
  }, [slideData]);

  if (!enabled) {
    return null;
  }

  return (
    <div className="relative w-full h-screen">
      {/* Connection indicator */}
      <div className="absolute top-6 left-6 z-50 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="text-sm font-medium text-gray-700">
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      {/* Current topic indicator */}
      {slideData?.topic && (
        <div className="absolute top-6 right-6 z-50 bg-indigo-600 px-4 py-2 rounded-lg shadow-sm">
          <span className="text-sm font-medium text-white">Topic: {slideData.topic}</span>
        </div>
      )}

      {/* Reveal.js container */}
      <div className="reveal" ref={deckDivRef}>
        <div className="slides">
          {/* Slide 0: Welcome */}
          <section data-slide-index="0">
            <h2>Welcome</h2>
            <p>Ask me about integrations!</p>
            <div className="dynamic-content"></div>
          </section>

          {/* Slide 1: Integration Overview */}
          <section data-slide-index="1">
            <h2>Integration Overview</h2>
            <div className="dynamic-content">
              <ul>
                <li>Available integrations</li>
                <li>Authentication methods</li>
                <li>Common use cases</li>
              </ul>
            </div>
          </section>

          {/* Slide 2: Technical Details */}
          <section data-slide-index="2">
            <h2>Technical Details</h2>
            <div className="dynamic-content">
              <p>Detailed implementation information will appear here.</p>
            </div>
          </section>

          {/* Slide 3: Code Examples */}
          <section data-slide-index="3">
            <h2>Code Examples</h2>
            <div className="dynamic-content">
              <pre><code>// Example code will appear here</code></pre>
            </div>
          </section>

          {/* Slide 4: Next Steps */}
          <section data-slide-index="4">
            <h2>Next Steps</h2>
            <div className="dynamic-content">
              <p>Action items and recommendations</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
