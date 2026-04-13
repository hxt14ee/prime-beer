# TG Mini App Optimization — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Optimize the beer catalog app for Telegram Mini App on all iPhones and Androids — any screen resolution and refresh rate (60/90/120Hz).

**Architecture:** Reduce GPU/CPU load by throttling canvas animations to device capabilities, replacing heavy `backdrop-filter` with lightweight alternatives on low-end devices, optimizing font loading with preconnect/preload, adding proper TG viewport handling, and ensuring buttery 60fps on all devices.

**Tech Stack:** React 19, Vite 8, Tailwind CSS v4, Telegram WebApp SDK, Canvas API

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `index.html` | Modify | Add font preconnect, preload critical font, DNS prefetch |
| `src/main.jsx` | Modify | Improve TG init, add device capability detection, expose CSS vars |
| `src/App.jsx` lines 265-427 | Modify | Throttle BeerBubblesCanvas based on device perf |
| `src/App.jsx` lines 432-503 | Modify | Throttle FoamBubblesCanvas |
| `src/App.jsx` lines 950-1147 | Modify | Add GPU-friendly CSS, reduce backdrop-filter on low-end |
| `src/App.jsx` lines 247-251 | Modify | Add image lazy loading + decoding async |
| `src/App.jsx` lines 550-680 | Modify | Add will-change hints for card animations |
| `src/App.jsx` lines 1578-1683 | Modify | Optimize detail panel mount |
| `vite.config.js` | Modify | Add build optimizations, compression |

---

### Task 1: Font Loading & Resource Hints

**Files:**
- Modify: `index.html`
- Modify: `src/App.jsx:954-960` (font imports in CSS)

- [ ] **Step 1: Add preconnect and DNS prefetch to index.html**

In `index.html`, add before `<meta name="viewport">`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="dns-prefetch" href="https://telegram.org" />
```

- [ ] **Step 2: Move Google Fonts from CSS @import to HTML link with preload**

In `index.html`, add after the preconnect tags:

```html
<link rel="preload" href="/fonts/td-ciryulnik.woff2" as="font" type="font/woff2" crossorigin />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,400;0,500;0,700;0,800;0,900;1,400&family=Commissioner:wght@400;500;600;700&family=Russo+One&display=swap" />
```

In `src/App.jsx`, remove the `@import url(...)` for Google Fonts from the CSS-in-JS block (around line 955). Keep the `@font-face` for TD Ciryulnik.

- [ ] **Step 3: Fix font-face format**

In `src/App.jsx` font-face declaration, change `format('woff')` to `format('woff2')` since the file is actually woff2:

```css
@font-face { font-family: 'TD Ciryulnik'; src: url('/fonts/td-ciryulnik.woff2') format('woff2'); font-display: swap; }
```

- [ ] **Step 4: Commit**

```bash
git add index.html src/App.jsx
git commit -m "perf: optimize font loading with preconnect, preload, correct format"
```

---

### Task 2: Device Capability Detection

**Files:**
- Modify: `src/main.jsx`

- [ ] **Step 1: Add performance tier detection**

In `src/main.jsx`, after the TG initialization block and before `createRoot`, add:

```javascript
// Detect device performance tier for animation throttling
const detectPerfTier = () => {
  const ua = navigator.userAgent;
  const mem = navigator.deviceMemory || 4; // GB, default 4 if unsupported
  const cores = navigator.hardwareConcurrency || 4;
  const dpr = window.devicePixelRatio || 1;
  
  // Low-end: old phones, <4GB RAM, <4 cores
  if (mem <= 2 || cores <= 2) return 'low';
  // High-end: flagship phones, 8+ cores, high DPR
  if (mem >= 6 && cores >= 6) return 'high';
  return 'mid';
};

const perfTier = detectPerfTier();
document.documentElement.dataset.perfTier = perfTier;
document.documentElement.style.setProperty('--perf-tier', perfTier);
```

- [ ] **Step 2: Expose refresh rate detection**

Add after the perf tier code:

```javascript
// Detect screen refresh rate for animation frame budget
let screenHz = 60;
const detectHz = () => {
  let last = 0;
  let samples = [];
  let count = 0;
  const measure = (ts) => {
    if (last) samples.push(ts - last);
    last = ts;
    count++;
    if (count < 20) {
      requestAnimationFrame(measure);
    } else {
      const avg = samples.reduce((a, b) => a + b, 0) / samples.length;
      screenHz = Math.round(1000 / avg);
      document.documentElement.style.setProperty('--screen-hz', String(screenHz));
    }
  };
  requestAnimationFrame(measure);
};
detectHz();
```

- [ ] **Step 3: Commit**

```bash
git add src/main.jsx
git commit -m "perf: add device capability and refresh rate detection"
```

---

### Task 3: Throttle BeerBubblesCanvas

**Files:**
- Modify: `src/App.jsx:265-427`

- [ ] **Step 1: Add frame skipping based on perf tier**

Replace the `animate` function and bubble count initialization (around lines 349-418) with performance-aware version. Find:

```javascript
const bubbles = Array.from({ length: 450 }).map(() => {
```

Replace with:

```javascript
const perfTier = document.documentElement.dataset.perfTier || 'mid';
const bubbleCount = perfTier === 'low' ? 120 : perfTier === 'mid' ? 280 : 450;
const frameSkip = perfTier === 'low' ? 2 : 1; // render every Nth frame on low-end
let frameCount = 0;
const bubbles = Array.from({ length: bubbleCount }).map(() => {
```

- [ ] **Step 2: Add frame skipping to animate loop**

Find the `animate` function body. After `const now = performance.now();` add:

```javascript
frameCount++;
if (frameCount % frameSkip !== 0) {
  animId = requestAnimationFrame(animate);
  return;
}
```

- [ ] **Step 3: Cap DPR to 1 on low-end devices**

Find:
```javascript
const dpr = Math.min(window.devicePixelRatio || 1, 2);
```

Replace with:
```javascript
const perfTier = document.documentElement.dataset.perfTier || 'mid';
const dpr = perfTier === 'low' ? 1 : Math.min(window.devicePixelRatio || 1, 2);
```

- [ ] **Step 4: Commit**

```bash
git add src/App.jsx
git commit -m "perf: throttle BeerBubblesCanvas based on device capability"
```

---

### Task 4: Throttle FoamBubblesCanvas

**Files:**
- Modify: `src/App.jsx:432-503`

- [ ] **Step 1: Add perf-aware bubble count and frame skip**

Find:
```javascript
const bubbles = Array.from({ length: 50 }).map(() => {
```

Replace with:
```javascript
const perfTier = document.documentElement.dataset.perfTier || 'mid';
const bubbleCount = perfTier === 'low' ? 15 : perfTier === 'mid' ? 30 : 50;
const frameSkip = perfTier === 'low' ? 2 : 1;
let frameCount = 0;
const bubbles = Array.from({ length: bubbleCount }).map(() => {
```

- [ ] **Step 2: Add frame skipping to animate loop**

In the `animate` function, after `ctx.clearRect(0, 0, canvas.width, canvas.height);`, add before the `bubbles.forEach`:

```javascript
frameCount++;
if (frameCount % frameSkip !== 0) {
  animationId = requestAnimationFrame(animate);
  return;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/App.jsx
git commit -m "perf: throttle FoamBubblesCanvas for low-end devices"
```

---

### Task 5: GPU-Friendly CSS & Reduced Backdrop-Filter

**Files:**
- Modify: `src/App.jsx:1090-1107` (liquid-glass CSS classes)

- [ ] **Step 1: Add will-change and GPU acceleration hints to liquid-glass**

Find the `.liquid-glass` CSS block and update it:

```css
.liquid-glass {
  background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.02) 100%);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  border-top: 1px solid rgba(255,255,255,0.4);
  border-left: 1px solid rgba(255,255,255,0.4);
  border-right: 1px solid rgba(255,255,255,0.1);
  border-bottom: 1px solid rgba(255,255,255,0.1);
  box-shadow: 0 8px 24px rgba(0,0,0,0.08), inset 0 1px 1px rgba(255,255,255,0.3);
  transition: background-color 1000ms ease, border-color 1000ms ease, box-shadow 1000ms ease;
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
}
[data-perf-tier="low"] .liquid-glass {
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
}
```

- [ ] **Step 2: Add reduced motion and low-perf overrides**

After the existing `@media (prefers-reduced-motion: reduce)` block, add:

```css
[data-perf-tier="low"] .foam-bg {
  animation: none !important;
}
[data-perf-tier="low"] .liquid-glass-subtle {
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  background: rgba(255,255,255,0.2);
}
```

- [ ] **Step 3: Commit**

```bash
git add src/App.jsx
git commit -m "perf: reduce backdrop-filter and animations on low-end devices"
```

---

### Task 6: Optimize Image Loading

**Files:**
- Modify: `src/App.jsx:247-251` (ItemImage component)

- [ ] **Step 1: Add loading=lazy and decoding=async to images**

Find:
```jsx
const ItemImage = ({ item, className }) => {
  if (item.isNotBeer) return <Package size={48} className={className} />;
  return <img src="/bottle.png" alt={item.name} className={className} style={{ objectFit: 'contain' }} draggable={false} />;
};
```

Replace with:
```jsx
const ItemImage = ({ item, className }) => {
  if (item.isNotBeer) return <Package size={48} className={className} />;
  return <img src="/bottle.png" alt={item.name} className={className} style={{ objectFit: 'contain' }} draggable={false} loading="lazy" decoding="async" />;
};
```

- [ ] **Step 2: Commit**

```bash
git add src/App.jsx
git commit -m "perf: add lazy loading and async decoding for images"
```

---

### Task 7: Optimize Card Animations for Variable Refresh Rates

**Files:**
- Modify: `src/App.jsx:1115-1146` (card animation CSS)

- [ ] **Step 1: Add will-change hints for card transitions**

Find:
```css
.cards-grid > * {
  opacity: 1;
  transform: translateY(0) scale(1);
}
```

Replace with:
```css
.cards-grid > * {
  opacity: 1;
  transform: translateY(0) scale(1);
  will-change: transform, opacity;
  contain: layout style paint;
}
```

- [ ] **Step 2: Add low-perf card animation override**

After the `.cards-grid-settling > *:nth-child(n+9)` rule, add:

```css
[data-perf-tier="low"] .cards-grid-settling > * {
  animation-duration: 300ms;
}
[data-perf-tier="low"] .cards-grid-fading > * {
  transition-duration: 150ms;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/App.jsx
git commit -m "perf: add containment and will-change hints for card animations"
```

---

### Task 8: Optimize Detail Panel Mount

**Files:**
- Modify: `src/App.jsx:1578-1583`

- [ ] **Step 1: Remove createRef inside render**

Find:
```javascript
{selectedItem && (() => {
    const detailRef = React.createRef();
    let startY = 0;
```

Replace with:
```javascript
{selectedItem && (() => {
    let startY = 0;
```

Note: `detailRef` is created but never used in the JSX — it's dead code causing unnecessary allocation on every render.

- [ ] **Step 2: Add contain property to detail overlay**

Find the detail panel backdrop div:
```jsx
<div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeDetail}
```

Add a low-perf override in the CSS section:
```css
[data-perf-tier="low"] .fixed .bg-black\/60 {
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  background: rgba(0,0,0,0.7);
}
```

- [ ] **Step 3: Commit**

```bash
git add src/App.jsx
git commit -m "perf: remove dead createRef, reduce detail panel GPU cost"
```

---

### Task 9: Vite Build Optimizations

**Files:**
- Modify: `vite.config.js`

- [ ] **Step 1: Add build optimizations**

Replace entire `vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2020',
    cssTarget: 'chrome80',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          icons: ['lucide-react'],
        },
      },
    },
  },
})
```

- [ ] **Step 2: Commit**

```bash
git add vite.config.js
git commit -m "perf: add Vite build optimizations, code splitting, terser"
```

---

### Task 10: TG Viewport & Safe Area Hardening

**Files:**
- Modify: `src/main.jsx`

- [ ] **Step 1: Add robust viewport height fix for TG on iOS**

In `src/main.jsx`, after the safe area setup, add:

```javascript
// Fix iOS TG viewport height — Telegram's webview sometimes reports
// wrong innerHeight. Force recalc on visibility change and resize.
const fixVh = () => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
};
fixVh();
window.addEventListener('resize', fixVh);
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) fixVh();
});
```

- [ ] **Step 2: Add passive touch listeners for better scroll perf**

In `src/main.jsx`, update the gesture prevention listeners:

```javascript
// Prevent double-tap zoom on iOS — passive: false required for preventDefault
document.addEventListener('gesturestart', (e) => e.preventDefault(), { passive: false });
document.addEventListener('dblclick', (e) => e.preventDefault(), { passive: false });

// Improve scroll performance — mark touch events as passive
document.addEventListener('touchstart', () => {}, { passive: true });
document.addEventListener('touchmove', () => {}, { passive: true });
```

- [ ] **Step 3: Commit**

```bash
git add src/main.jsx
git commit -m "perf: harden TG viewport height fix, passive touch listeners"
```

---

### Task 11: Final Build & Deploy

- [ ] **Step 1: Run production build**

```bash
cd D:/пивко/prime-beer
npm run build
```

Expected: Build succeeds with smaller bundle thanks to code splitting and terser.

- [ ] **Step 2: Push branch**

```bash
git push -u origin tg-mini-app-optimize
```

- [ ] **Step 3: Deploy to Vercel**

```bash
npx vercel --prod
```

Expected: Deployed to https://beer-store-five.vercel.app
