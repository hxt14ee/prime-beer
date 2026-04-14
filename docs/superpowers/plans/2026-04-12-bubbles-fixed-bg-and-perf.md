# Bubbles Fixed Background + TG Mini-App Performance

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the bubble canvas act as a fixed background (not following scroll) and optimize rendering performance for Telegram mini-app, without changing any visible UI.

**Architecture:** Convert BeerBubblesCanvas from world-space (scroll-relative) coordinates to pure viewport-space coordinates so bubbles float independently of scroll. Reduce bubble count adaptively based on device, throttle expensive DOM queries, and minimize redundant work in the animation loop.

**Tech Stack:** React, Canvas 2D API, CSS

---

### Task 1: Convert BeerBubblesCanvas to viewport-space (fixed background)

**Files:**
- Modify: `src/App.jsx:265-427` (BeerBubblesCanvas component)

The core problem: bubbles use `worldY` (page-space) coordinates and compute `screenY = worldY - scrollTop`. When scrolling in TG mini-app, bubbles visually drag with content. Fix: all bubble positions live in viewport (screen) space. No scroll offset needed.

- [ ] **Step 1: Remove scroll-dependent coordinate system**

Replace the entire `BeerBubblesCanvas` component (lines 265-427) with this viewport-space version:

```jsx
const BeerBubblesCanvas = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const setSize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    setSize();
    window.addEventListener('resize', setSize);

    // Wave pop-line in SCREEN (viewport) coordinates.
    // The header wave sits at header bottom - 14px (midline of the 10px-tall wave).
    let waveMidScreen = 280;
    const waveAmplitude = 5;
    const measureWave = () => {
      const header = document.querySelector('header');
      if (header) {
        const headerRect = header.getBoundingClientRect();
        waveMidScreen = Math.max(0, headerRect.bottom - 14);
      }
    };
    measureWave();
    const ro = new ResizeObserver(measureWave);
    const headerEl = document.querySelector('header');
    if (headerEl) ro.observe(headerEl);
    window.addEventListener('resize', measureWave);
    // Re-measure on scroll too, since header may scroll off-screen
    const scrollEl = document.querySelector('main');
    if (scrollEl) scrollEl.addEventListener('scroll', measureWave, { passive: true });

    // Surface Y in SCREEN coords at x, synced with the CSS wave-smooth animation
    const surfaceAtX = (x, now) => {
      const vw = window.innerWidth;
      const shift = ((now % 6000) / 6000) * vw;
      const phase = (4 * Math.PI * (x + shift)) / vw;
      return waveMidScreen - Math.sin(phase) * waveAmplitude;
    };

    // Adaptive bubble count: fewer on mobile for performance
    const isMobile = window.innerWidth < 768;
    const BUBBLE_COUNT = isMobile ? 120 : 300;

    const makeBubble = (spread = false) => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const topBound = Math.max(waveMidScreen + waveAmplitude + 20, 0);
      const y = spread
        ? topBound + Math.random() * Math.max(vh - topBound, 1)
        : vh + Math.random() * 60;
      return {
        x: Math.random() * vw,
        y,
        size: Math.random() * 4.5 + 1.2,
        baseSize: 0,
        speed: Math.random() * 0.6 + 0.25,
        drift: Math.random() * 0.6,
        phase: Math.random() * Math.PI * 2,
        opacity: Math.random() * 0.45 + 0.3,
        popping: false,
        popFrame: 0,
        popY: 0,
      };
    };

    const bubbles = Array.from({ length: BUBBLE_COUNT }).map(() => {
      const b = makeBubble(true);
      b.baseSize = b.size;
      return b;
    });

    let animId;
    const animate = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const now = performance.now();
      ctx.clearRect(0, 0, vw, vh);

      for (let i = 0; i < bubbles.length; i++) {
        const b = bubbles[i];
        if (b.popping) {
          b.popFrame++;
          const t = b.popFrame / 15;
          if (t >= 1) {
            const nb = makeBubble(false);
            nb.baseSize = nb.size;
            Object.assign(b, nb);
            continue;
          }
          const popSize = b.baseSize * (1 + t * 1.2);
          const popAlpha = b.opacity * (1 - t);
          ctx.strokeStyle = `rgba(255, 255, 255, ${popAlpha})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.arc(b.x, b.popY, popSize, 0, Math.PI * 2);
          ctx.stroke();
          continue;
        }

        b.y -= b.speed;
        b.x += Math.sin(b.phase) * (b.drift * 0.1);
        b.phase += 0.012;
        if (b.x < -20) b.x = vw + 20;
        if (b.x > vw + 20) b.x = -20;

        // Pop at the wave surface
        const surface = surfaceAtX(b.x, now);
        if (b.y < surface) {
          b.popping = true;
          b.popFrame = 0;
          b.popY = surface;
          continue;
        }

        // Off-screen below: respawn
        if (b.y > vh + 40) {
          const nb = makeBubble(true);
          nb.baseSize = nb.size;
          Object.assign(b, nb);
          continue;
        }

        // Only draw if on screen
        if (b.y < -40) continue;

        ctx.fillStyle = `rgba(255, 255, 255, ${b.opacity})`;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', setSize);
      window.removeEventListener('resize', measureWave);
      if (scrollEl) scrollEl.removeEventListener('scroll', measureWave);
      ro.disconnect();
      cancelAnimationFrame(animId);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 29 }} />;
};
```

Key changes:
- `b.y` is now viewport Y, not world Y — no scroll offset anywhere
- `waveMidScreen` measured via `getBoundingClientRect()` (already screen-space)
- Re-measures on scroll so the pop-line tracks header position
- Bubble count: 120 on mobile, 300 on desktop (was 450)
- `for` loop instead of `forEach` for micro-perf in hot path
- No `getScrollTop()` helper needed
- Respawn logic simplified: no world-space bounds checking

- [ ] **Step 2: Verify build compiles**

Run: `npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/App.jsx
git commit -m "fix: bubbles use viewport coords (fixed bg, no scroll follow)"
```

---

### Task 2: Optimize FoamBubblesCanvas for mobile

**Files:**
- Modify: `src/App.jsx:432-504` (FoamBubblesCanvas component)

FoamBubblesCanvas renders in 5+ places (age gate, header, cart, detail, sheets). Each runs 50 bubbles at 60fps. On TG mini-app multiple instances can be active simultaneously.

- [ ] **Step 1: Reduce FoamBubblesCanvas bubble count on mobile**

In FoamBubblesCanvas, change line 460 from:

```jsx
    const bubbles = Array.from({ length: 50 }).map(() => {
```

to:

```jsx
    const count = window.innerWidth < 768 ? 20 : 50;
    const bubbles = Array.from({ length: count }).map(() => {
```

Also change the `forEach` loop (line 469) to a `for` loop for micro-perf:

Replace:
```jsx
      bubbles.forEach(b => {
```
with:
```jsx
      for (let i = 0; i < bubbles.length; i++) { const b = bubbles[i];
```

And the matching closing `});` to `}`.

- [ ] **Step 2: Verify build compiles**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/App.jsx
git commit -m "perf: reduce foam bubble count on mobile"
```

---

### Task 3: Optimize heavy CSS — reduce backdrop-filter blur on mobile

**Files:**
- Modify: `src/App.jsx:1090-1099` (`.liquid-glass` CSS in the inline style tag)

`backdrop-filter: blur(6px)` on every card and button is the single biggest performance hit on TG mini-app. Add a media query that reduces blur to 2px on mobile.

- [ ] **Step 1: Add reduced-blur media query**

After the existing `.liquid-glass` block (around line 1099), add:

```css
@media (max-width: 767px) {
  .liquid-glass {
    backdrop-filter: blur(2px);
    -webkit-backdrop-filter: blur(2px);
  }
  .liquid-glass-subtle {
    backdrop-filter: blur(1px);
    -webkit-backdrop-filter: blur(1px);
  }
}
```

- [ ] **Step 2: Verify build compiles**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/App.jsx
git commit -m "perf: reduce backdrop blur on mobile for TG mini-app"
```

---

### Task 4: Move inline style tag to useMemo to prevent re-creation

**Files:**
- Modify: `src/App.jsx:951-1146` (the `<style dangerouslySetInnerHTML>` block)

The massive inline `<style>` tag re-creates its HTML string on every render of App. It never changes. Memoize it.

- [ ] **Step 1: Extract the style string into a module-level constant**

Above the `App` component (before `export default function App()`), add:

```jsx
const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,400;0,500;0,700;0,800;0,900;1,400&family=Commissioner:wght@400;500;600;700&family=Russo+One&display=swap');
  ... (the entire CSS string, unchanged)
`;
```

Then in the JSX, change:
```jsx
<style dangerouslySetInnerHTML={{ __html: `...` }} />
```
to:
```jsx
<style dangerouslySetInnerHTML={{ __html: GLOBAL_STYLES }} />
```

This prevents React from diffing a new string object on every render.

- [ ] **Step 2: Verify build compiles**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/App.jsx
git commit -m "perf: hoist global styles to module scope"
```

---

### Task 5: Push and deploy

- [ ] **Step 1: Push to GitHub**

```bash
git push origin main
```

- [ ] **Step 2: Deploy to Vercel**

```bash
vercel deploy --prod --yes
```

- [ ] **Step 3: Verify deployment**

Check https://beer-store-five.vercel.app/ loads correctly.
