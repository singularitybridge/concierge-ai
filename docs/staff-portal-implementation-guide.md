# Staff Portal Implementation Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install @tanstack/react-virtual
npm install react-swipeable
npm install framer-motion  # For animations
```

### 2. File Structure
```
app/
├── staff/
│   ├── page.tsx                    # Main dashboard
│   └── tasks/
│       └── [id]/
│           └── page.tsx            # Task detail page
├── components/
│   └── staff/
│       ├── TaskCard.tsx            # Reusable task card
│       ├── StatusBadge.tsx         # Status indicator
│       ├── PhotoCapture.tsx        # Photo modal
│       ├── SwipeableCard.tsx       # Swipe gesture wrapper
│       ├── QuickActions.tsx        # Bottom sheet
│       └── TaskInstructions.tsx    # Checklist component
lib/
├── hooks/
│   ├── useSwipeGesture.ts         # Custom swipe hook
│   ├── usePhotoCapture.ts         # Camera logic
│   └── useOfflineQueue.ts         # Offline sync
└── utils/
    ├── taskHelpers.ts             # Task utilities
    └── hapticFeedback.ts          # Vibration API
```

---

## Component Implementation

### TaskCard Component

```tsx
// app/components/staff/TaskCard.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MapPin, Clock, ChevronRight } from 'lucide-react';
import { useSwipeable } from 'react-swipeable';

interface Task {
  id: string;
  title: string;
  location: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  dueTime: string;
}

export function TaskCard({ task, onSwipeLeft, onSwipeRight }: {
  task: Task;
  onSwipeLeft?: (id: string) => void;
  onSwipeRight?: (id: string) => void;
}) {
  const [offset, setOffset] = useState(0);
  const [swiping, setSwiping] = useState(false);

  const handlers = useSwipeable({
    onSwiping: (eventData) => {
      setSwiping(true);
      setOffset(eventData.deltaX);
    },
    onSwipedLeft: () => {
      if (Math.abs(offset) > 80) {
        onSwipeLeft?.(task.id);
      }
      setSwiping(false);
      setOffset(0);
    },
    onSwipedRight: () => {
      if (Math.abs(offset) > 80) {
        onSwipeRight?.(task.id);
      }
      setSwiping(false);
      setOffset(0);
    },
    onSwiped: () => {
      setSwiping(false);
      setOffset(0);
    },
    trackMouse: true,
    preventScrollOnSwipe: true,
  });

  const statusColors = {
    'pending': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    'in-progress': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    'completed': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    'blocked': 'bg-red-500/20 text-red-300 border-red-500/30',
  };

  const priorityColor = {
    'urgent': 'bg-red-500',
    'high': 'bg-orange-500',
    'medium': 'bg-amber-500',
    'low': 'bg-white/30',
  }[task.priority];

  return (
    <div className="relative overflow-hidden">
      {/* Swipe Actions Background */}
      {offset < -20 && (
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-emerald-500 flex items-center justify-center rounded-r-2xl">
          <span className="text-white text-sm font-medium">✓</span>
        </div>
      )}
      {offset > 20 && (
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-blue-500 flex items-center justify-center rounded-l-2xl">
          <span className="text-white text-sm font-medium">⚡</span>
        </div>
      )}

      {/* Card Content */}
      <div
        {...handlers}
        style={{
          transform: swiping ? `translateX(${offset}px)` : 'translateX(0)',
          transition: swiping ? 'none' : 'transform 0.3s ease-out',
        }}
      >
        <Link href={`/staff/tasks/${task.id}`} className="block">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-4 active:bg-white/10 transition-all relative">
            {/* Priority Dot */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0 pr-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityColor}`} />
                  <h3 className="text-base font-medium text-white truncate">
                    {task.title}
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{task.location}</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-white/30 flex-shrink-0" />
            </div>

            {/* Description */}
            <p className="text-sm text-white/60 mb-3 line-clamp-2">
              {task.description}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[task.status]}`}>
                {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
              </span>
              <div className="flex items-center gap-1 text-xs text-white/50">
                <Clock className="w-3 h-3" />
                <span>Due {task.dueTime}</span>
              </div>
            </div>

            {/* Urgent Badge */}
            {task.priority === 'urgent' && (
              <div className="absolute top-2 right-2 px-2 py-0.5 bg-red-500 text-white rounded text-[10px] font-bold uppercase">
                Urgent
              </div>
            )}
          </div>
        </Link>
      </div>
    </div>
  );
}
```

---

### PhotoCapture Component

```tsx
// app/components/staff/PhotoCapture.tsx
'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Camera, X } from 'lucide-react';

interface PhotoCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (photoData: string, note: string) => void;
  taskTitle: string;
}

export function PhotoCapture({ isOpen, onClose, onConfirm, taskTitle }: PhotoCaptureProps) {
  const [photo, setPhoto] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirm = () => {
    if (photo) {
      onConfirm(photo, note);
      setPhoto(null);
      setNote('');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center">
      <div className="w-full max-w-md mx-4 bg-stone-900 rounded-3xl border border-white/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h3 className="text-lg font-medium text-white">Task Completion</h3>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-white/70 hover:text-white active:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          <p className="text-sm text-white/70 mb-4">
            Take a photo of the completed work for verification
          </p>

          {/* Photo Preview or Capture Button */}
          {photo ? (
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4">
              <Image
                src={photo}
                alt="Task completion"
                fill
                className="object-cover"
              />
              <button
                onClick={() => setPhoto(null)}
                className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-[4/3] bg-white/5 hover:bg-white/10 border-2 border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all mb-4"
            >
              <Camera className="w-12 h-12 text-white/40" />
              <span className="text-sm font-medium text-white/60">
                Tap to take photo
              </span>
            </button>
          )}

          {/* Hidden File Input - Mobile Camera */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"  // Use rear camera
            onChange={handlePhotoCapture}
            className="hidden"
          />

          {/* Optional Note */}
          <div className="mb-4">
            <label className="text-xs text-white/50 mb-2 block">
              Add completion note (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Any additional notes..."
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          {/* Confirm Button */}
          <button
            onClick={handleConfirm}
            disabled={!photo}
            className={`w-full py-4 rounded-xl font-medium transition-all ${
              photo
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                : 'bg-white/5 text-white/30 cursor-not-allowed'
            }`}
          >
            Confirm Completion
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

### Custom Hooks

#### useSwipeGesture Hook

```tsx
// lib/hooks/useSwipeGesture.ts
import { useState, useCallback } from 'react';

export function useSwipeGesture(
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  threshold = 80
) {
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setIsSwiping(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isSwiping) return;
    setCurrentX(e.touches[0].clientX);
  }, [isSwiping]);

  const handleTouchEnd = useCallback(() => {
    if (!isSwiping) return;

    const deltaX = currentX - startX;

    if (Math.abs(deltaX) > threshold) {
      if (deltaX < 0) {
        onSwipeLeft?.();
      } else {
        onSwipeRight?.();
      }
    }

    setIsSwiping(false);
    setCurrentX(0);
    setStartX(0);
  }, [isSwiping, currentX, startX, threshold, onSwipeLeft, onSwipeRight]);

  const offset = isSwiping ? currentX - startX : 0;

  return {
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    offset,
    isSwiping,
  };
}
```

#### useOfflineQueue Hook

```tsx
// lib/hooks/useOfflineQueue.ts
import { useState, useEffect } from 'react';

interface QueuedAction {
  id: string;
  type: 'complete' | 'update_status' | 'add_note';
  taskId: string;
  data: any;
  timestamp: number;
}

export function useOfflineQueue() {
  const [isOnline, setIsOnline] = useState(true);
  const [queue, setQueue] = useState<QueuedAction[]>([]);

  useEffect(() => {
    // Load queue from localStorage
    const savedQueue = localStorage.getItem('actionQueue');
    if (savedQueue) {
      setQueue(JSON.parse(savedQueue));
    }

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      processQueue();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addToQueue = (action: Omit<QueuedAction, 'id' | 'timestamp'>) => {
    const queuedAction: QueuedAction = {
      ...action,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };

    const newQueue = [...queue, queuedAction];
    setQueue(newQueue);
    localStorage.setItem('actionQueue', JSON.stringify(newQueue));

    if (isOnline) {
      processQueue();
    }
  };

  const processQueue = async () => {
    if (queue.length === 0) return;

    // Process each action
    for (const action of queue) {
      try {
        await submitAction(action);
        // Remove from queue on success
        const newQueue = queue.filter(a => a.id !== action.id);
        setQueue(newQueue);
        localStorage.setItem('actionQueue', JSON.stringify(newQueue));
      } catch (error) {
        console.error('Failed to process action:', error);
        break; // Stop processing if one fails
      }
    }
  };

  const submitAction = async (action: QueuedAction) => {
    // In production: API call to submit action
    const response = await fetch('/api/tasks/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(action),
    });

    if (!response.ok) {
      throw new Error('Failed to submit action');
    }

    return response.json();
  };

  return {
    isOnline,
    queueLength: queue.length,
    addToQueue,
  };
}
```

---

### Utility Functions

#### Haptic Feedback

```tsx
// lib/utils/hapticFeedback.ts

export const hapticFeedback = {
  light: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  },

  medium: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(20);
    }
  },

  heavy: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([30, 10, 30]);
    }
  },

  success: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([10, 20, 30]);
    }
  },

  error: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 20, 50]);
    }
  },
};

// Usage:
// import { hapticFeedback } from '@/lib/utils/hapticFeedback';
// hapticFeedback.success(); // On task completion
```

#### Task Helpers

```tsx
// lib/utils/taskHelpers.ts

export const getStatusColor = (status: string) => {
  const colors = {
    'pending': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    'in-progress': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    'completed': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    'blocked': 'bg-red-500/20 text-red-300 border-red-500/30',
  };
  return colors[status as keyof typeof colors] || colors.pending;
};

export const getPriorityDot = (priority: string) => {
  const colors = {
    'urgent': 'bg-red-500',
    'high': 'bg-orange-500',
    'medium': 'bg-amber-500',
    'low': 'bg-white/30',
  };
  return colors[priority as keyof typeof colors] || colors.low;
};

export const formatTimeRemaining = (dueTime: string) => {
  const now = new Date();
  const due = new Date(dueTime);
  const diffMs = due.getTime() - now.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 0) return 'Overdue';
  if (diffMins < 60) return `${diffMins}m remaining`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h remaining`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d remaining`;
};

export const calculateProgress = (
  checkedItems: number[],
  totalItems: number
) => {
  if (totalItems === 0) return 0;
  return Math.round((checkedItems.length / totalItems) * 100);
};
```

---

## API Integration

### Task Endpoints

```typescript
// app/api/tasks/route.ts
import { NextRequest, NextResponse } from 'next/server';

// GET /api/tasks - List all tasks
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get('status');
  const priority = searchParams.get('priority');

  // In production: Fetch from database
  const tasks = await fetchTasksFromDB({ status, priority });

  return NextResponse.json({ tasks });
}

// POST /api/tasks - Create new task
export async function POST(request: NextRequest) {
  const body = await request.json();

  // Validate task data
  const task = await createTask(body);

  return NextResponse.json({ task }, { status: 201 });
}
```

```typescript
// app/api/tasks/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

// GET /api/tasks/:id - Get task details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const task = await fetchTaskById(params.id);

  if (!task) {
    return NextResponse.json(
      { error: 'Task not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ task });
}

// PATCH /api/tasks/:id - Update task
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const task = await updateTask(params.id, body);

  return NextResponse.json({ task });
}

// DELETE /api/tasks/:id - Delete task
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await deleteTask(params.id);

  return NextResponse.json({ success: true }, { status: 204 });
}
```

### Photo Upload

```typescript
// app/api/tasks/[id]/complete/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const formData = await request.formData();
  const photo = formData.get('photo') as File;
  const note = formData.get('note') as string;

  // Upload photo to storage (S3, Cloudinary, etc.)
  const photoUrl = await uploadPhoto(photo);

  // Update task status
  const task = await updateTask(params.id, {
    status: 'completed',
    completionPhoto: photoUrl,
    completionNote: note,
    completedAt: new Date().toISOString(),
  });

  return NextResponse.json({ task });
}
```

---

## Testing

### Unit Tests

```typescript
// __tests__/components/TaskCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskCard } from '@/components/staff/TaskCard';

describe('TaskCard', () => {
  const mockTask = {
    id: '1',
    title: 'Clean Room 301',
    location: 'Suite 301',
    description: 'Deep clean required',
    status: 'pending' as const,
    priority: 'high' as const,
    dueTime: '14:00',
  };

  it('renders task information correctly', () => {
    render(<TaskCard task={mockTask} />);

    expect(screen.getByText('Clean Room 301')).toBeInTheDocument();
    expect(screen.getByText('Suite 301')).toBeInTheDocument();
    expect(screen.getByText(/Due 14:00/)).toBeInTheDocument();
  });

  it('calls onSwipeLeft when swiped left', () => {
    const onSwipeLeft = jest.fn();
    render(<TaskCard task={mockTask} onSwipeLeft={onSwipeLeft} />);

    // Simulate swipe gesture
    // (Testing library specific swipe simulation)

    expect(onSwipeLeft).toHaveBeenCalledWith('1');
  });
});
```

### E2E Tests (Playwright)

```typescript
// e2e/staff-portal.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Staff Portal', () => {
  test('should display task list', async ({ page }) => {
    await page.goto('/staff');

    // Check header
    await expect(page.getByText('Yuki Nakamura')).toBeVisible();

    // Check stats
    await expect(page.getByText('Active Tasks')).toBeVisible();

    // Check task cards
    const taskCards = page.locator('[data-testid="task-card"]');
    await expect(taskCards).toHaveCount(4);
  });

  test('should complete task with photo', async ({ page }) => {
    await page.goto('/staff/tasks/room-301-clean');

    // Check all instructions
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();

    for (let i = 0; i < count; i++) {
      await checkboxes.nth(i).check();
    }

    // Click complete button
    await page.getByRole('button', { name: /complete/i }).click();

    // Upload photo
    await page.setInputFiles('input[type="file"]', 'test-photo.jpg');

    // Confirm
    await page.getByRole('button', { name: /confirm/i }).click();

    // Should redirect to dashboard
    await expect(page).toHaveURL('/staff');

    // Should show success message
    await expect(page.getByText('Task Completed!')).toBeVisible();
  });
});
```

---

## Deployment Checklist

### Pre-Deployment
- [ ] Test on real devices (iOS & Android)
- [ ] Verify camera permissions work
- [ ] Test offline functionality
- [ ] Check all swipe gestures
- [ ] Verify touch target sizes
- [ ] Test in bright sunlight
- [ ] Run accessibility audit
- [ ] Check performance metrics

### Environment Variables
```env
# Production
NEXT_PUBLIC_API_URL=https://api.the1898niseko.com
NEXT_PUBLIC_STORAGE_URL=https://storage.the1898niseko.com
DATABASE_URL=postgresql://...
REDIS_URL=redis://...

# Feature Flags
NEXT_PUBLIC_ENABLE_OFFLINE=true
NEXT_PUBLIC_ENABLE_HAPTICS=true
NEXT_PUBLIC_ENABLE_VOICE_COMMANDS=false
```

### Performance Optimization
```typescript
// next.config.js
module.exports = {
  images: {
    domains: ['storage.the1898niseko.com'],
    deviceSizes: [375, 414, 428],  // Mobile sizes
    imageSizes: [48, 64, 96],       // Avatar sizes
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react'],
  },
};
```

---

## Troubleshooting

### Common Issues

**Camera not working on iOS:**
```typescript
// Ensure HTTPS in production
// Add to Info.plist:
<key>NSCameraUsageDescription</key>
<string>Take photos to verify task completion</string>
```

**Touch targets too small:**
```css
/* Increase size globally */
.btn {
  @apply min-w-[56px] min-h-[56px];
}
```

**Swipe conflicts with scroll:**
```typescript
// Add to swipe handler:
preventScrollOnSwipe: true,
trackTouch: true,
```

**iOS zoom on input focus:**
```html
<!-- Ensure 16px font size -->
<input className="text-base" /> <!-- Not text-sm -->
```

---

## Next Steps

1. Implement authentication (staff login)
2. Add real-time updates (WebSocket)
3. Integrate push notifications
4. Add voice commands (ElevenLabs integration)
5. Create admin dashboard for task assignment
6. Add analytics tracking

---

**Last Updated:** 2025-12-11
**Version:** 1.0.0
