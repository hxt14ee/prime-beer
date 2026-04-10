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

// Prevent double-tap zoom / pinch on iOS Safari inside Telegram
document.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('dblclick', (e) => e.preventDefault(), { passive: false });

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
