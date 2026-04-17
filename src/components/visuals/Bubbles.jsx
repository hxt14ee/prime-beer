import React, { useEffect, useRef } from 'react';
import { INITIAL_HEADER_WAVE_DELAY } from '../../utils/ui.js';

export const BeerBubblesCanvas = React.memo(function BeerBubblesCanvas({
  headerRef,
  scrollContainerRef,
}) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
    if (!ctx) return;
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

    // Wave midline in WORLD (page) coordinates. The header wave occupies 20px at
    // the bottom of the header, with its wavy region between y=0 (crests) and
    // y=10 (troughs) in SVG coords. With bottom-[-1px], that maps in screen
    // space to: trough = header_bottom - 9, crest = header_bottom - 19. The
    // MIDLINE (around which the sine oscillates) is header_bottom - 14.
    let waveMidWorld = 280;
    // Half-amplitude in px. Wave is 10px peak-to-peak, so amplitude = 5.
    const waveAmplitude = 5;
    const scrollEl = scrollContainerRef?.current ?? document.querySelector('main');
    const measureWave = () => {
      const header = headerRef?.current ?? document.querySelector('header');
      if (header && scrollEl) {
        const headerRect = header.getBoundingClientRect();
        const mainRect = scrollEl.getBoundingClientRect();
        waveMidWorld = Math.max(0, (headerRect.bottom - mainRect.top) + scrollEl.scrollTop - 14);
      }
    };
    measureWave();
    const ro = new ResizeObserver(measureWave);
    const headerEl = headerRef?.current ?? document.querySelector('header');
    if (headerEl) ro.observe(headerEl);
    window.addEventListener('resize', measureWave);

    const getScrollTop = () => (scrollEl ? scrollEl.scrollTop : 0);

    // Surface Y in WORLD coords at screen-x `x` and time `now` (ms). Matches the
    // wave-smooth 6-second linear translate: wave period is viewport/2 (there are
    // two wave cycles visible across the viewport), and over 6s the pattern shifts
    // left by one viewport width. All HeaderWave instances synchronize to
    // (performance.now() % 6000), so we use the same reference here and the
    // popping location lines up with what the user actually sees.
    const surfaceAtX = (x, now) => {
      const vw = window.innerWidth;
      const shift = ((now % 6000) / 6000) * vw;
      const phase = (4 * Math.PI * (x + shift)) / vw;
      return waveMidWorld - Math.sin(phase) * waveAmplitude;
    };

    // mode: 'spread' = distribute across visible viewport (initial + catch-up respawn)
    //       'below'  = spawn just below viewport bottom (natural pop respawn)
    const makeBubble = (mode = 'spread') => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const scrollTop = getScrollTop();
      // Spawn below the wave's peak line (waveMidWorld - amplitude) so no bubble
      // starts inside the wave region.
      const topBound = Math.max(waveMidWorld + waveAmplitude + 20, scrollTop);
      const bottomBound = scrollTop + vh;
      const worldY = mode === 'below'
        ? bottomBound + Math.random() * 60
        : topBound + Math.random() * Math.max(bottomBound - topBound, 1);
      return {
        x: Math.random() * vw,
        worldY,
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
    const bubbles = Array.from({ length: 450 }).map(() => {
      const b = makeBubble('spread');
      b.baseSize = b.size;
      return b;
    });
    let animId;
    const animate = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const scrollTop = getScrollTop();
      const now = performance.now();
      ctx.clearRect(0, 0, vw, vh);
      bubbles.forEach(b => {
        if (b.popping) {
          b.popFrame++;
          const popDuration = 15;
          const t = b.popFrame / popDuration;
          if (t >= 1) {
            const nb = makeBubble('below');
            nb.baseSize = nb.size;
            Object.assign(b, nb);
            return;
          }
          const popSize = b.baseSize * (1 + t * 1.2);
          const popAlpha = b.opacity * (1 - t);
          // Pop at the surface Y where the bubble actually hit the wave (captured
          // at contact time so the pop animation stays anchored even as the wave
          // continues moving).
          const drawY = b.popY - scrollTop;
          ctx.strokeStyle = `rgba(255, 255, 255, ${popAlpha})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.arc(b.x, drawY, popSize, 0, Math.PI * 2);
          ctx.stroke();
          return;
        }
        b.worldY -= b.speed;
        b.x += Math.sin(b.phase) * (b.drift * 0.1);
        b.phase += 0.012;
        if (b.x < -20) b.x = vw + 20;
        if (b.x > vw + 20) b.x = -20;
        // Compute the wave surface Y at this bubble's current x. Pop when the
        // bubble's rising Y crosses the surface — so crests catch bubbles
        // earlier and troughs let them rise further. This makes the pop line
        // dance with the wave visually.
        const surface = surfaceAtX(b.x, now);
        if (b.worldY < surface) {
          b.popping = true;
          b.popFrame = 0;
          b.popY = surface;
          return;
        }
        // Respawn bubbles that drifted out of the visible area after a big scroll jump.
        // Spread them across the viewport so they appear immediately, not trickle in from bottom.
        if (b.worldY < scrollTop - 80 || b.worldY > scrollTop + vh + 200) {
          const nb = makeBubble('spread');
          nb.baseSize = nb.size;
          Object.assign(b, nb);
          return;
        }
        const screenY = b.worldY - scrollTop;
        if (screenY < -40 || screenY > vh + 40) return;
        ctx.fillStyle = `rgba(255, 255, 255, ${b.opacity})`;
        ctx.beginPath();
        ctx.arc(b.x, screenY, b.size, 0, Math.PI * 2);
        ctx.fill();
      });
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener('resize', setSize);
      window.removeEventListener('resize', measureWave);
      ro.disconnect();
      cancelAnimationFrame(animId);
    };
  }, [headerRef, scrollContainerRef]);
  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 29 }} />;
});

// =======================
// 4b. ПУЗЫРЬКИ В ПЕНЕ (хедер)
// =======================
export const FoamBubblesCanvas = React.memo(function FoamBubblesCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
    if (!ctx) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const respawn = (b) => {
      b.x = Math.random() * canvas.width;
      b.y = Math.random() * canvas.height;
      b.size = Math.random() * 10 + 5;
      b.maxSize = b.size;
      b.speedX = (Math.random() - 0.5) * 0.6;
      b.speedY = (Math.random() - 0.5) * 0.4 - 0.15;
      b.phase = Math.random() * Math.PI * 2;
      b.opacity = Math.random() * 0.5 + 0.2;
      b.life = 0;
      b.maxLife = Math.random() * 300 + 200;
      b.popping = false;
      b.popFrame = 0;
    };
    const bubbles = Array.from({ length: 50 }).map(() => {
      const b = {};
      respawn(b);
      b.life = Math.random() * b.maxLife;
      return b;
    });
    // Draw one frame of bubbles without advancing physics (used to immediately
    // redraw after a resize so we don't leave an empty canvas between the
    // resize callback and the next rAF tick).
    const drawBubbles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      bubbles.forEach(b => {
        if (b.popping) {
          const popProgress = b.popFrame / 12;
          const popSize = b.maxSize * (1 + popProgress * 0.6);
          const popOpacity = b.opacity * (1 - popProgress);
          ctx.strokeStyle = `rgba(140, 100, 50, ${popOpacity * 0.7})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(b.x, b.y, popSize, 0, Math.PI * 2);
          ctx.stroke();
          return;
        }
        const fadeIn = Math.min(b.life / 30, 1);
        const fadeOut = Math.min((b.maxLife - b.life) / 30, 1);
        const alpha = b.opacity * fadeIn * fadeOut;
        ctx.strokeStyle = `rgba(140, 100, 50, ${alpha * 0.7})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
        ctx.stroke();
      });
    };
    // Size strategy: oversize the canvas bitmap at mount with a 200px vertical
    // buffer, then NEVER resize on parent changes. This is the cheapest and
    // cleanest approach — no frame-by-frame bitmap clears, no double-buffer
    // copies, no layout thrashing. The parent's overflow:hidden clips the
    // canvas visually, so as the parent grows (search bar opens) more of the
    // already-rendered canvas simply becomes visible.
    //
    // Density: bubbles spawn across the full canvas height, which includes the
    // buffer area below the parent. As parent grows, the previously-hidden
    // buffer zone becomes visible and shows its bubbles — no sparse area, no
    // hitches. The only thing we respond to is window resize (orientation),
    // which rarely happens and is fine to trigger a full reset.
    const applySize = () => {
      const w = parent.offsetWidth;
      // 200px buffer covers the search-bar opening (+60px) and leaves headroom
      // for any other future parent growth without needing to resize.
      const h = parent.offsetHeight + 200;
      if (canvas.width === w && canvas.height === h) return;
      canvas.width = w;
      canvas.height = h;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      drawBubbles();
    };
    applySize();
    // React only to width changes. On mobile, the keyboard opening changes
    // window.innerHeight substantially — which would cause applySize to
    // re-measure the parent, clear the canvas bitmap, and redraw. Even
    // though drawBubbles redraws current positions, the clearRect creates
    // a single-frame gap that the user perceives as a "jump" in the
    // bubbles. Width-only changes (orientation, actual viewport resize)
    // still trigger a resize.
    let lastWidth = window.innerWidth;
    const onWindowResize = () => {
      const w = window.innerWidth;
      if (w === lastWidth) return;
      lastWidth = w;
      applySize();
    };
    window.addEventListener('resize', onWindowResize);
    let animationId;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      bubbles.forEach(b => {
        b.life++;
        if (b.popping) {
          b.popFrame++;
          const popProgress = b.popFrame / 12;
          const popSize = b.maxSize * (1 + popProgress * 0.6);
          const popOpacity = b.opacity * (1 - popProgress);
          if (popProgress >= 1) { respawn(b); return; }
          ctx.strokeStyle = `rgba(140, 100, 50, ${popOpacity * 0.7})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(b.x, b.y, popSize, 0, Math.PI * 2);
          ctx.stroke();
          return;
        }
        if (b.life > b.maxLife) { b.popping = true; return; }
        b.x += b.speedX + Math.sin(b.phase) * 0.3;
        b.y += b.speedY;
        b.phase += 0.02;
        if (b.x < -10 || b.x > canvas.width + 10 || b.y < -10 || b.y > canvas.height - 20) { respawn(b); return; }
        const fadeIn = Math.min(b.life / 30, 1);
        const fadeOut = Math.min((b.maxLife - b.life) / 30, 1);
        const alpha = b.opacity * fadeIn * fadeOut;
        ctx.strokeStyle = `rgba(140, 100, 50, ${alpha * 0.7})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
        ctx.stroke();
      });
      animationId = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      window.removeEventListener('resize', onWindowResize);
      cancelAnimationFrame(animationId);
    };
  }, []);
  // Use explicit top/left instead of inset-0 — the canvas's CSS size is now
  // managed directly via canvas.style.width/height in setSize(). This prevents
  // CSS from auto-stretching the bitmap during parent resize (the stretching
  // you saw when opening the search bar).
  return <canvas ref={canvasRef} className="absolute top-0 left-0 pointer-events-none z-[1] opacity-80" />;
});

// =======================
// 4c. HEADER WAVE — single shared foam wave, synchronized across header + body
// =======================
// Every instance captures the current position of the 6s `wave-smooth` cycle at mount
// time and rewinds its animation by that amount via a negative `animation-delay`. Because
// every wave renders the same path at the same phase, they translate as one continuous
// ribbon — the header and any modal/pour wave stay locked in step, even when a modal
// mounts seconds after the app started.
export const HeaderWave = React.memo(function HeaderWave({ className = '', style, fill = '#FFF8E7' }) {
  // Color transition is matched BYTE-FOR-BYTE to the foam mask's `background-color`
  // transition in the header (`500ms cubic-bezier(0.4, 0, 0.2, 1) 900ms`). That mask
  // is painted BEHIND the wave, so if their timings differ by even a few ms the wave
  // looks like a decoupled element changing color on its own. With matched timing
  // the wave is perceived as just the upper edge of the foam repaint — one seamless
  // element. Using CSS `color` + SVG `fill="currentColor"` is the most reliable way
  // to transition an SVG fill across React re-renders.
  const containerStyle = {
    animationDelay: INITIAL_HEADER_WAVE_DELAY,
    color: fill,
    transition: 'color 500ms cubic-bezier(0.4, 0, 0.2, 1) 900ms',
    ...style,
  };
  return (
    <div
      className={`w-[200%] h-[20px] flex animate-[wave-smooth_6s_linear_infinite] pointer-events-none ${className}`}
      style={containerStyle}
    >
      <svg viewBox="0 0 1200 20" preserveAspectRatio="none" className="w-[50%] h-full" fill="currentColor" style={{ shapeRendering: 'geometricPrecision' }}>
        <path d="M0,20 V10 Q150,0 300,10 T600,10 T900,10 T1200,10 V20 Z" />
      </svg>
      <svg viewBox="0 0 1200 20" preserveAspectRatio="none" className="w-[50%] h-full" fill="currentColor" style={{ shapeRendering: 'geometricPrecision' }}>
        <path d="M0,20 V10 Q150,0 300,10 T600,10 T900,10 T1200,10 V20 Z" />
      </svg>
    </div>
  );
});
