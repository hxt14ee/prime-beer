import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Telegram Mini App init (iOS/Android)
const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : null;
if (tg) {
  try {
    tg.ready();
    tg.expand();
    if (typeof tg.disableVerticalSwipes === 'function') tg.disableVerticalSwipes();
    if (typeof tg.enableClosingConfirmation === 'function') tg.enableClosingConfirmation();
    if (tg.setHeaderColor) tg.setHeaderColor('#EDD9AB');
    if (tg.setBackgroundColor) tg.setBackgroundColor('#EDD9AB');
    // Expose safe-area insets as CSS vars
    const apply = () => {
      const root = document.documentElement;
      const top = tg.safeAreaInset?.top ?? 0;
      const bottom = tg.safeAreaInset?.bottom ?? 0;
      root.style.setProperty('--tg-safe-top', top + 'px');
      root.style.setProperty('--tg-safe-bottom', bottom + 'px');
    };
    apply();
    tg.onEvent?.('viewportChanged', apply);
    tg.onEvent?.('safeAreaChanged', apply);
  } catch (e) { /* noop */ }
}

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

// Prevent double-tap zoom / pinch on iOS Safari inside Telegram
document.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('dblclick', (e) => e.preventDefault(), { passive: false });
document.addEventListener('touchstart', () => {}, { passive: true });
document.addEventListener('touchmove', () => {}, { passive: true });

// Detect device performance tier for animation throttling
const detectPerfTier = () => {
  const ua = navigator.userAgent;
  const mem = navigator.deviceMemory || 4;
  const cores = navigator.hardwareConcurrency || 4;
  const dpr = window.devicePixelRatio || 1;

  if (mem <= 2 || cores <= 2) return 'low';
  if (mem >= 6 && cores >= 6) return 'high';
  return 'mid';
};

const perfTier = detectPerfTier();
document.documentElement.dataset.perfTier = perfTier;
document.documentElement.style.setProperty('--perf-tier', perfTier);

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

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
