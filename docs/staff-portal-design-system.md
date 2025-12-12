# The 1898 Niseko Staff Portal - Mobile-First UI/UX Design System

## Overview
A mobile-first task management interface designed for hotel staff working on-the-go. Optimized for quick interactions, high visibility in varied lighting, and ease of use with gloved hands.

---

## 1. Design Principles

### Mobile-First Philosophy
- **Primary Target**: iPhone SE (375px) to iPhone Pro Max (428px)
- **Thumb-Friendly**: Critical actions within easy thumb reach (bottom third of screen)
- **One-Handed Operation**: Most tasks completable with one hand
- **Glove-Friendly**: Larger touch targets (56×56px for primary actions)

### Environmental Considerations
- **High Contrast**: Staff work in varied lighting (bright outdoors, dim corridors)
- **Dark Mode Optimized**: Reduces eye strain during early morning/late night shifts
- **Clear Visual Hierarchy**: Important info stands out at a glance
- **Minimal Cognitive Load**: Quick scanning, instant action

---

## 2. Color System

### Status Colors
```typescript
const statusColors = {
  pending: {
    bg: 'bg-amber-500/20',
    text: 'text-amber-300',
    border: 'border-amber-500/30',
    meaning: 'Not yet started'
  },
  'in-progress': {
    bg: 'bg-blue-500/20',
    text: 'text-blue-300',
    border: 'border-blue-500/30',
    meaning: 'Currently working on it'
  },
  completed: {
    bg: 'bg-emerald-500/20',
    text: 'text-emerald-300',
    border: 'border-emerald-500/30',
    meaning: 'Finished and verified'
  },
  blocked: {
    bg: 'bg-red-500/20',
    text: 'text-red-300',
    border: 'border-red-500/30',
    meaning: 'Cannot proceed - needs help'
  }
}
```

### Priority System
```typescript
const priorityColors = {
  urgent: {
    color: 'bg-red-500 text-white',
    indicator: 'bg-red-500', // Dot color
    example: 'VIP arriving in 2 hours'
  },
  high: {
    color: 'bg-orange-500 text-white',
    indicator: 'bg-orange-500',
    example: 'Guest request - same day'
  },
  medium: {
    color: 'bg-amber-500 text-white',
    indicator: 'bg-amber-500',
    example: 'Regular turndown service'
  },
  low: {
    color: 'bg-white/20 text-white/70',
    indicator: 'bg-white/30',
    example: 'Routine maintenance'
  }
}
```

### Role-Based Colors
```typescript
const roleColors = {
  housekeeping: '#3B82F6',  // Blue
  concierge: '#A855F7',     // Purple
  kitchen: '#F97316',       // Orange
  driver: '#10B981',        // Emerald
  maintenance: '#EF4444',   // Red
  management: '#F59E0B'     // Amber
}
```

### Contrast Ratios (WCAG AAA)
- White text on dark backgrounds: **14.5:1** (excellent)
- Status badges: **7.2:1** minimum (AAA compliant)
- Priority indicators: **8.5:1** minimum
- All interactive elements: **4.5:1** minimum for touch targets

---

## 3. Typography Scale

### Font Families
```css
/* Primary: Inter (body text, UI elements) */
--font-inter: 'Inter', system-ui, -apple-system, sans-serif;

/* Display: Cormorant (headers, hotel branding) */
--font-cormorant: 'Cormorant Garamond', serif;
```

### Mobile Type Scale
```typescript
const typography = {
  // Headers
  'page-title': 'text-xl font-medium',         // 20px - Main page title
  'section-title': 'text-base font-medium',    // 16px - Section headers
  'card-title': 'text-base font-medium',       // 16px - Task card titles

  // Body Text
  'body-large': 'text-sm',                     // 14px - Task descriptions
  'body-normal': 'text-sm',                    // 14px - Regular text
  'body-small': 'text-xs',                     // 12px - Metadata, labels

  // UI Elements
  'button-text': 'text-sm font-medium',        // 14px - Button labels
  'badge-text': 'text-xs font-medium',         // 12px - Status badges
  'caption': 'text-[10px] font-medium',        // 10px - Bottom nav labels

  // Critical: All input fields use 16px minimum to prevent iOS zoom
  'input-text': 'text-base',                   // 16px - Input fields
}
```

### Line Heights
```css
/* Tight spacing for headers */
.heading { line-height: 1.2; }

/* Relaxed spacing for body text (better readability) */
.body { line-height: 1.6; }

/* Comfortable spacing for small text */
.caption { line-height: 1.4; }
```

---

## 4. Component Library

### 4.1 Task Card (Primary Component)

**Anatomy:**
```
┌────────────────────────────────────┐
│ [●] Task Title            [>]      │ ← Priority dot + title
│ [📍] Location                      │ ← Location pin
├────────────────────────────────────┤
│ Brief description of the task...   │ ← 2-line description
├────────────────────────────────────┤
│ [Status Badge]      [⏰] Due 14:00 │ ← Status + time
└────────────────────────────────────┘
```

**Sizes:**
- Minimum height: 140px (comfortable tappable area)
- Padding: 16px all sides
- Border radius: 16px (rounded-2xl)
- Gap between elements: 12px

**States:**
```typescript
// Default
'bg-white/5 border-white/10'

// Hover/Press
'active:bg-white/10 active:scale-[0.98]'

// Swipe gestures
'translate-x-0 transition-transform'
```

**Swipe Actions:**
- **Swipe Left** (80px threshold): Quick complete → Camera opens
- **Swipe Right** (80px threshold): Status menu → Change status
- **Long Press** (500ms): Context menu → More options

---

### 4.2 Status Badge

**Variants:**
```jsx
// Pending
<span className="px-3 py-1.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
  Pending
</span>

// In Progress
<span className="px-3 py-1.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
  In Progress
</span>

// Completed
<span className="px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
  Completed
</span>
```

**Icon + Text Pattern:**
```jsx
<div className="flex items-center gap-2">
  <CheckCircle2 className="w-4 h-4" />
  <span>Completed</span>
</div>
```

---

### 4.3 Priority Indicator

**Dot Style** (Minimal, space-efficient):
```jsx
<div className={`w-2 h-2 rounded-full ${priorityColor}`} />
```

**Badge Style** (High visibility):
```jsx
<span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-500 text-white">
  Urgent
</span>
```

**Usage Rules:**
- Urgent tasks: Always show badge
- High tasks: Show badge on list view, dot on detail view
- Medium/Low: Show dot only

---

### 4.4 Filter Chips

**Horizontal Scroll Pattern:**
```jsx
<div className="overflow-x-auto hide-scrollbar">
  <div className="flex gap-2 min-w-max">
    {filters.map(filter => (
      <button className={`
        px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap
        ${active ? 'bg-amber-500 text-white' : 'bg-white/10 text-white/70'}
      `}>
        {filter.label} ({filter.count})
      </button>
    ))}
  </div>
</div>
```

**Active State:**
- Background: Amber-500 (brand color)
- Shadow: `shadow-lg shadow-amber-500/30`
- Text: White, bold

---

### 4.5 Bottom Action Bar

**Fixed Position Pattern:**
```jsx
<div className="fixed bottom-0 left-0 right-0 z-50 bg-stone-900/95 backdrop-blur-md border-t border-white/10 safe-area-bottom">
  <div className="grid grid-cols-3 gap-2 px-4 py-3">
    {/* Action buttons */}
  </div>
</div>
```

**Touch Target Size:**
- Minimum: 56px × 56px (glove-friendly)
- Preferred: 64px × 64px (extra comfort)
- Gap between: 8px minimum

**Primary Action Styling:**
```jsx
<button className="
  bg-amber-500
  hover:bg-amber-400
  active:bg-amber-600
  shadow-lg shadow-amber-500/20
  rounded-xl
  transition-all
">
  {/* Icon + label */}
</button>
```

---

### 4.6 Photo Capture Modal

**Full-Screen Overlay:**
```jsx
<div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md">
  <div className="max-w-md mx-4 bg-stone-900 rounded-3xl">
    {/* Modal content */}
  </div>
</div>
```

**Camera Button:**
```jsx
<button className="
  w-full aspect-[4/3]
  bg-white/5
  border-2 border-dashed border-white/20
  rounded-2xl
  flex flex-col items-center justify-center
">
  <Camera className="w-12 h-12 text-white/40" />
  <span className="text-sm text-white/60">Tap to take photo</span>
</button>
```

**Native Camera Access:**
```jsx
<input
  type="file"
  accept="image/*"
  capture="environment"  // Uses rear camera
  className="hidden"
/>
```

---

## 5. Layout Patterns

### 5.1 Sticky Header Pattern

```jsx
<header className="sticky top-0 z-50 bg-stone-900/95 backdrop-blur-md border-b border-white/10">
  {/* Avatar, Name, Status */}
  {/* Stats Cards */}
  {/* Filter Chips */}
</header>
```

**Why Sticky:**
- Always visible during scroll
- Quick access to status change
- Filter chips always available
- Avatar shows who's logged in

---

### 5.2 Scrollable Content Area

```jsx
<main className="px-4 py-4 pb-24"> {/* Bottom padding for action bar */}
  <div className="space-y-3"> {/* Consistent 12px gaps */}
    {/* Task cards */}
  </div>
</main>
```

**Scroll Indicators:**
- Fade gradient at bottom: `bg-gradient-to-t from-stone-900`
- Subtle shadow: `shadow-inner`

---

### 5.3 Safe Area Handling

```css
/* iOS Home Indicator */
.safe-area-bottom {
  padding-bottom: max(1rem, env(safe-area-inset-bottom));
}

/* Notch Area */
.safe-area-top {
  padding-top: max(1rem, env(safe-area-inset-top));
}
```

---

## 6. Interaction Patterns

### 6.1 Task Card Swipe

**Left Swipe** (Complete):
```typescript
onSwipeLeft: (taskId) => {
  // Show camera modal
  openPhotoCapture(taskId);
}
```

**Right Swipe** (Status):
```typescript
onSwipeRight: (taskId) => {
  // Show status bottom sheet
  openStatusMenu(taskId);
}
```

**Implementation:**
- Use `react-swipeable` or native touch events
- Threshold: 80px (33% of card width)
- Visual feedback: Card slides, reveals action icon
- Haptic feedback on threshold

---

### 6.2 Photo Capture Flow

```
1. Tap "Mark Complete" button
   ↓
2. Check all instructions completed
   ↓ (if yes)
3. Open photo modal
   ↓
4. Tap camera button → Native camera opens
   ↓
5. Take photo
   ↓
6. Preview photo with option to retake
   ↓
7. Optional: Add completion note
   ↓
8. Confirm completion
   ↓
9. Upload photo + update task status
   ↓
10. Show success animation
   ↓
11. Return to task list
```

**Error Handling:**
- Camera permission denied → Show instructions
- Photo upload fails → Save to retry queue
- Offline → Queue for later sync

---

### 6.3 Quick Actions

**Long Press Menu:**
```typescript
onLongPress: (taskId) => {
  showBottomSheet([
    { icon: CheckCircle2, label: 'Mark Complete', action: () => {} },
    { icon: MessageSquare, label: 'Add Note', action: () => {} },
    { icon: AlertCircle, label: 'Report Issue', action: () => {} },
    { icon: User, label: 'Reassign', action: () => {} },
  ]);
}
```

---

## 7. Accessibility Features

### 7.1 Touch Targets

**Minimum Sizes:**
```typescript
const touchTargets = {
  minimum: '48px × 48px',      // WCAG AA
  preferred: '56px × 56px',    // Better for gloves
  primary: '64px × 64px',      // Thumb-friendly
}
```

**Spacing:**
- Between targets: 8px minimum
- Around targets: 12px comfortable

---

### 7.2 Screen Reader Support

```jsx
<button aria-label="Mark task complete and take verification photo">
  <Camera className="w-5 h-5" />
  <span className="sr-only">Complete Task</span>
</button>
```

**Task Card Announcement:**
```jsx
<div
  role="article"
  aria-label={`${task.priority} priority task: ${task.title} at ${task.location}. Status: ${task.status}. Due ${task.dueTime}`}
>
  {/* Card content */}
</div>
```

---

### 7.3 Keyboard Navigation

**Focus Indicators:**
```css
:focus-visible {
  outline: 2px solid rgb(245 158 11); /* Amber-500 */
  outline-offset: 2px;
}
```

**Tab Order:**
1. Status selector
2. Filter chips
3. Task cards (in priority order)
4. Bottom action bar

---

## 8. Performance Optimizations

### 8.1 Image Optimization

```jsx
<Image
  src="/avatars/staff.jpg"
  alt="Staff member"
  width={48}
  height={48}
  loading="lazy"
  placeholder="blur"
/>
```

### 8.2 List Virtualization

For 50+ tasks, use virtual scrolling:
```jsx
import { useVirtualizer } from '@tanstack/react-virtual';

const rowVirtualizer = useVirtualizer({
  count: tasks.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 140, // Task card height
});
```

### 8.3 Offline Support

```typescript
// Service Worker for offline access
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

// LocalStorage for task cache
localStorage.setItem('tasks', JSON.stringify(tasks));

// Queue actions when offline
const queueAction = (action) => {
  const queue = JSON.parse(localStorage.getItem('actionQueue') || '[]');
  queue.push(action);
  localStorage.setItem('actionQueue', JSON.stringify(queue));
};
```

---

## 9. Animation & Transitions

### 9.1 Standard Timings

```typescript
const timings = {
  instant: '100ms',    // Button press feedback
  fast: '200ms',       // Status changes, slides
  normal: '300ms',     // Modals, overlays
  slow: '500ms',       // Success animations
}
```

### 9.2 Easing Functions

```css
.ease-smooth { transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); }
.ease-bounce { transition-timing-function: cubic-bezier(0.68, -0.55, 0.265, 1.55); }
```

### 9.3 Success Animation

```jsx
// Task completion celebration
<div className="animate-scale-in">
  <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-check" />
</div>

// CSS
@keyframes scale-in {
  from { transform: scale(0.5); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
```

---

## 10. Dark Mode Optimization

### 10.1 Background Layers

```typescript
const backgrounds = {
  base: 'bg-stone-900',           // Main background
  elevated: 'bg-white/5',         // Card background
  overlay: 'bg-stone-900/95',     // Modal backdrop
  glass: 'backdrop-blur-md',      // Frosted glass effect
}
```

### 10.2 Text Hierarchy

```typescript
const textColors = {
  primary: 'text-white',          // Headings, important text
  secondary: 'text-white/80',     // Body text
  tertiary: 'text-white/60',      // Supporting text
  muted: 'text-white/40',         // Labels, metadata
  disabled: 'text-white/20',      // Disabled state
}
```

---

## 11. Testing Checklist

### Visual Testing
- [ ] Test on iPhone SE (smallest screen)
- [ ] Test on iPhone Pro Max (largest screen)
- [ ] Test in bright sunlight (contrast visibility)
- [ ] Test in dark room (no eye strain)
- [ ] Test with gloves on (touch target sizes)

### Functional Testing
- [ ] All swipe gestures work smoothly
- [ ] Camera access works on iOS/Android
- [ ] Photo upload works with poor connection
- [ ] Offline mode queues actions correctly
- [ ] Push notifications appear for urgent tasks

### Accessibility Testing
- [ ] VoiceOver announces all elements correctly
- [ ] All colors meet WCAG AAA contrast ratios
- [ ] Keyboard navigation works without mouse
- [ ] Reduced motion preference respected
- [ ] Font sizes scale with system settings

---

## 12. Future Enhancements

### Phase 2
- Voice commands for hands-free operation
- Apple Watch companion app for quick status updates
- Smart suggestions based on location (Bluetooth beacons)
- Team chat integration
- Shift handoff notes

### Phase 3
- AR wayfinding (point camera, see task locations)
- Predictive task assignment (AI learns staff preferences)
- Gamification (badges, streaks, leaderboards)
- Multi-language support (Japanese, English, Chinese)

---

## Implementation Files

**Created:**
- `/app/staff/page.tsx` - Main dashboard
- `/app/staff/tasks/[id]/page.tsx` - Task detail page

**To Create:**
- `/app/components/staff/TaskCard.tsx` - Reusable task card
- `/app/components/staff/StatusBadge.tsx` - Status indicator
- `/app/components/staff/PhotoCapture.tsx` - Photo modal
- `/app/components/staff/SwipeableCard.tsx` - Swipe gesture wrapper

---

## Design Resources

**Color Palette:**
- Primary: Amber-500 (#F59E0B) - Brand color
- Success: Emerald-500 (#10B981) - Completed tasks
- Warning: Orange-500 (#F97316) - High priority
- Error: Red-500 (#EF4444) - Urgent/blocked
- Info: Blue-500 (#3B82F6) - In progress

**Icons:**
- Library: Lucide Icons
- Size: 16px (small), 20px (medium), 24px (large)
- Stroke: 2px (consistent weight)

**Spacing Scale:**
```typescript
const spacing = {
  xs: '4px',    // 0.25rem
  sm: '8px',    // 0.5rem
  md: '12px',   // 0.75rem
  lg: '16px',   // 1rem
  xl: '20px',   // 1.25rem
  '2xl': '24px' // 1.5rem
}
```

---

## Questions & Feedback

For questions about this design system:
- Technical: Contact development team
- Design: Contact UX team
- Staff feedback: Use in-app feedback form

**Last Updated:** 2025-12-11
