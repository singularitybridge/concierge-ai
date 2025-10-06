import { useEffect, useRef } from 'react';
import { useSlideStore, SlideData } from '../store/slideStore';

const POLL_INTERVAL = 2000; // 2 seconds

export function useSlideSync(sessionId: string = 'default', enabled: boolean = true) {
  const { updateSlide, setConnectionStatus } = useSlideStore();
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) {
      setConnectionStatus(false);
      return;
    }

    // Fetch current slide data from local API (updated by john agent)
    const fetchSlideData = async () => {
      try {
        const response = await fetch(
          `/api/john-slide-update?sessionId=${sessionId}`
        );

        if (response.ok) {
          const data: SlideData = await response.json();

          // Only update if timestamp is newer
          if (data.timestamp > lastUpdateRef.current) {
            console.log('📡 Slide sync update:', data);
            updateSlide(data);
            lastUpdateRef.current = data.timestamp;
          }

          setConnectionStatus(true);
        } else if (response.status === 404) {
          // No slide data yet, that's okay
          setConnectionStatus(true);
        } else {
          console.error('Failed to fetch slide data:', response.status);
          setConnectionStatus(false);
        }
      } catch (error) {
        console.error('Slide sync error:', error);
        setConnectionStatus(false);
      }
    };

    // Initial fetch
    fetchSlideData();

    // Start polling
    pollTimerRef.current = setInterval(fetchSlideData, POLL_INTERVAL);

    // Cleanup
    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
      setConnectionStatus(false);
    };
  }, [sessionId, enabled, updateSlide, setConnectionStatus]);

  return {
    // Manual refresh function
    refresh: async () => {
      try {
        const response = await fetch(
          `/api/john-slide-update?sessionId=${sessionId}`
        );

        if (response.ok) {
          const data: SlideData = await response.json();
          updateSlide(data);
          lastUpdateRef.current = data.timestamp;
        }
      } catch (error) {
        console.error('Manual refresh error:', error);
      }
    }
  };
}
