import React, { useState, useEffect, useRef, useMemo, useCallback, startTransition } from 'react';
import { flushSync } from 'react-dom';
import { Search, Star, X, Flame, ChevronDown, ChevronUp, MapPin, Plus, Minus, Truck, CalendarCheck, Beer } from 'lucide-react';
import { ALL_CATEGORIES, CATALOG_ITEMS, CATEGORIES, CATEGORY_GROUPS, LOCATIONS, ORIGINS, createGroupCategory, getVolumeLabel } from './data/catalog.js';
import { ItemImage } from './components/ItemImage.jsx';
import ProductCard from './components/ProductCard.jsx';
import { PrimeMark } from './components/PrimeMark.jsx';
import { BeerBubblesCanvas, FoamBubblesCanvas, HeaderWave } from './components/visuals/Bubbles.jsx';
import { getContrastYIQ, hexToRgba } from './utils/ui.js';

const INITIAL_VISIBLE_ITEMS = 24;
const VISIBLE_BATCH_SIZE = 20;
const LOAD_MORE_THRESHOLD = 720;

// =======================
// 6. ОСНОВНОЙ КОМПОНЕНТ
// =======================
export default function App() {
  const [ageVerified, setAgeVerified] = useState(false);
  const [ageGateClosing, setAgeGateClosing] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isSettling, setIsSettling] = useState(false);
  const [activeLocation, setActiveLocation] = useState(LOCATIONS[0]);
  const [activeOrigin, setActiveOrigin] = useState(ORIGINS[0]);
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [selectedItem, setSelectedItem] = useState(null);
  const [closingDetail, setClosingDetail] = useState(false);
  const [showLocationSheet, setShowLocationSheet] = useState(false);
  const [showCategorySheet, setShowCategorySheet] = useState(false);
  const [showOriginSheet, setShowOriginSheet] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [detailFromCart, setDetailFromCart] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const searchInputRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearchTerm, setActiveSearchTerm] = useState("");
  const [searchChipClosing, setSearchChipClosing] = useState(false);
  const [showStory, setShowStory] = useState(false);
  const [storyRead, setStoryRead] = useState(false);
  const [closingSheet, setClosingSheet] = useState(null);
  const [waveAnimating, setWaveAnimating] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const headerRef = useRef(null);
  const mainRef = useRef(null);
  const [visibleItemCount, setVisibleItemCount] = useState(INITIAL_VISIBLE_ITEMS);
  const sortOptions = useMemo(() => ([
    { id: 'rating', label: 'Рейтинг' },
    { id: 'price', label: 'Цена' },
    { id: 'abv', label: 'Крепость' },
    { id: 'og', label: 'Плотность' },
  ]), []);

  // Show the "scroll to top" FAB once the user has scrolled roughly 1.25 viewport
  // heights — earlier than before so it appears as soon as the header has fully
  // scrolled off and a couple rows of cards are out of view. rAF-throttled so we
  // don't re-render on every scroll frame.
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    let pending = false;
    const onScroll = () => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        pending = false;
        const threshold = window.innerHeight * 1.25;
        setShowScrollTop(el.scrollTop > threshold);
      });
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // NOTE: We intentionally do NOT replay the fly-in stagger when the age gate is
  // dismissed. Cards render once at mount and stay ready behind the gate — when
  // the gate slides away, the cards should already be in their natural position,
  // not re-animate. The fly-in is reserved for actual filter changes.
  const isStyleFilterDisabled = activeOrigin?.id === 'not_beer';

  const targetAccentColor = useMemo(() => {
    const isNotBeer = activeOrigin?.id === 'not_beer';
    return isNotBeer ? '#8B939C' : (activeCategory.id === 'all_styles' ? '#D9B500' : activeCategory.color);
  }, [activeCategory, activeOrigin]);
  const currentItems = useMemo(() => {
    if (!activeOrigin) return [];
    let result = CATALOG_ITEMS;
    const activeCategoryIds = activeCategory.groupItems || [activeCategory.id];
    if (activeOrigin.id === 'not_beer') {
      result = result.filter(item => item.isNotBeer);
    } else if (activeOrigin.id === 'archive') {
      result = result.filter(item => item.origin === 'archive');
      if (activeCategory && activeCategory.id !== 'all_styles') {
        result = result.filter(item => activeCategoryIds.includes(item.type));
      }
    } else if (activeOrigin.id === 'soon') {
      result = result.filter(item => item.origin === 'soon');
      if (activeCategory && activeCategory.id !== 'all_styles') {
        result = result.filter(item => activeCategoryIds.includes(item.type));
      }
    } else {
      result = result.filter(item => !item.isNotBeer && item.origin !== 'archive' && item.origin !== 'soon');
      if (activeOrigin.id === 'ru') result = result.filter(b => b.origin === 'ru');
      if (activeOrigin.id === 'import') result = result.filter(b => b.origin === 'import');
      if (activeOrigin.id === 'collab') result = result.filter(b => b.origin === 'collab');
      if (activeOrigin.id === 'tap') result = result.filter(b => b.onTap);
      if (activeOrigin.id === 'promo') result = result.filter(b => b.isPromo);
      if (activeCategory && activeCategory.id !== 'all_styles') {
        result = result.filter(item => activeCategoryIds.includes(item.type));
      }
    }
    if (activeSearchTerm.trim()) {
      const term = activeSearchTerm.toLowerCase();
      result = result.filter(item => item.name.toLowerCase().includes(term) || item.brewery.toLowerCase().includes(term));
    }
    if (sortConfig.key && sortConfig.direction) {
      result = [...result].sort((a, b) => sortConfig.direction === 'desc' ? b[sortConfig.key] - a[sortConfig.key] : a[sortConfig.key] - b[sortConfig.key]);
    }
    return result;
  }, [activeOrigin, activeCategory, sortConfig, activeSearchTerm]);

  const cartQtyById = useMemo(() => new Map(
    cartItems.map(({ item, quantity }) => [item.id, quantity])
  ), [cartItems]);
  const cartTotalItems = useMemo(() => (
    cartItems.reduce((sum, item) => sum + item.quantity, 0)
  ), [cartItems]);
  const cartTotalPrice = useMemo(() => (
    cartItems.reduce((sum, item) => sum + (item.item.price * item.quantity), 0)
  ), [cartItems]);
  const visibleItems = useMemo(() => (
    currentItems.slice(0, visibleItemCount)
  ), [currentItems, visibleItemCount]);
  const hasSearchMatch = useCallback((query) => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return false;

    return CATALOG_ITEMS.some((item) => (
      !item.isNotBeer &&
      item.origin !== 'archive' &&
      item.origin !== 'soon' &&
      (item.name.toLowerCase().includes(normalizedQuery) || item.brewery.toLowerCase().includes(normalizedQuery))
    ));
  }, []);

  // Search for all items from a specific brewery. Resets origin/category to "all"
  // so the user actually sees everything this brewery makes across styles and sources.
  // Runs the same fade-out → fly-in choreography as style changes so the list
  // transition feels intentional, not a snap. Safe to call with any pending sheet —
  // sheet refs are only closed here if we own them (no-op otherwise).
  const handleSearchSubmit = useCallback((rawQuery) => {
    const q = (rawQuery ?? searchQuery).trim();
    if (!q) return;
    if (!hasSearchMatch(q)) {
      flushSync(() => {
        setShowSearchBar(true);
        setSearchQuery(q);
        setActiveSearchTerm("");
      });
      requestAnimationFrame(() => searchInputRef.current?.focus());
      return;
    }

    mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    setIsTransitioning(true);
    setTimeout(() => {
      flushSync(() => {
        setActiveOrigin(ORIGINS[0]);
        setActiveCategory(ALL_CATEGORIES[0]);
        setShowSearchBar(false);
        setSearchQuery(q);
        setActiveSearchTerm(q);
        setIsTransitioning(false);
        setIsSettling(true);
      });
      setTimeout(() => setIsSettling(false), 1080);
    }, 280);
  }, [hasSearchMatch, searchQuery]);

  const clearSearch = useCallback(({ keepOpen = true } = {}) => {
    setIsTransitioning(true);
    setTimeout(() => {
      flushSync(() => {
        setActiveSearchTerm("");
        setSearchQuery("");
        setShowSearchBar(keepOpen);
        setIsTransitioning(false);
        setIsSettling(true);
      });
      if (keepOpen) requestAnimationFrame(() => searchInputRef.current?.focus());
      setTimeout(() => setIsSettling(false), 1080);
    }, 220);
  }, []);

  // Search for all items from a specific brewery. Resets origin/category to "all"
  // so the user actually sees everything this brewery makes across styles and sources.
  // Runs the same fade-out → fly-in choreography as style changes so the list
  // transition feels intentional, not a snap. Safe to call with any pending sheet —
  // sheet refs are only closed here if we own them (no-op otherwise).
  const handleBrewerySearch = useCallback((brewery) => {
    // Scroll back to the top so the user sees the newly-filtered list in context.
    handleSearchSubmit(brewery);
  }, [handleSearchSubmit]);

  const updateCart = useCallback((e, item, delta) => {
    if (e) e.stopPropagation();
    setCartItems(prev => {
      const existing = prev.find(c => c.item.id === item.id);
      if (!existing && delta > 0) return [...prev, { item, quantity: 1 }];
      if (existing) {
        const newQty = existing.quantity + delta;
        if (newQty <= 0) return prev.filter(c => c.item.id !== item.id);
        return prev.map(c => c.item.id === item.id ? { ...c, quantity: newQty } : c);
      }
      return prev;
    });
  }, []);

  const selectedItemQty = selectedItem ? (cartQtyById.get(selectedItem.id) || 0) : 0;

  useEffect(() => {
    setVisibleItemCount(Math.min(currentItems.length, INITIAL_VISIBLE_ITEMS));
  }, [currentItems]);

  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;

    let frameId = null;
    const maybeLoadMore = () => {
      if (frameId !== null) return;
      frameId = requestAnimationFrame(() => {
        frameId = null;
        if (visibleItemCount >= currentItems.length) return;
        const distanceToBottom = el.scrollHeight - (el.scrollTop + el.clientHeight);
        if (distanceToBottom <= LOAD_MORE_THRESHOLD) {
          setVisibleItemCount((prev) => Math.min(currentItems.length, prev + VISIBLE_BATCH_SIZE));
        }
      });
    };

    maybeLoadMore();
    el.addEventListener('scroll', maybeLoadMore, { passive: true });
    window.addEventListener('resize', maybeLoadMore);

    return () => {
      el.removeEventListener('scroll', maybeLoadMore);
      window.removeEventListener('resize', maybeLoadMore);
      if (frameId !== null) cancelAnimationFrame(frameId);
    };
  }, [currentItems.length, visibleItemCount]);

  const renderedGridItems = useMemo(() => (
    visibleItems.map((item) => (
      <ProductCard
        key={item.id}
        item={item}
        qty={cartQtyById.get(item.id) || 0}
        accentColor={targetAccentColor}
        onSelect={setSelectedItem}
        onUpdateCart={updateCart}
        onBrewerySearch={handleBrewerySearch}
      />
    ))
  ), [visibleItems, cartQtyById, targetAccentColor, updateCart, handleBrewerySearch]);

  const closeDetail = useCallback(() => {
    setClosingDetail(true);
    setTimeout(() => {
      setSelectedItem(null);
      setClosingDetail(false);
      if (detailFromCart) {
        setShowCart(true);
        setDetailFromCart(false);
      }
    }, 220);
  }, [detailFromCart]);

  const closeSheet = useCallback((sheetName, setter) => {
    setClosingSheet(sheetName);
    setTimeout(() => { setter(false); setClosingSheet(null); }, 220);
  }, []);

  const handleFilterChange = (setSheet, filterFn) => {
    setSheet(false);
    setIsTransitioning(true);
    setTimeout(() => {
      // flushSync batches these three updates into a SINGLE commit — the grid's
      // class flips straight from `cards-grid-fading` to `cards-grid-settling`
      // without a blank frame in between. Earlier the rAF pair gave React time
      // to render a frame with no state class at all, which let the generic
      // `.cards-grid > *` transition fire and caused a visible jerk.
      flushSync(() => {
        filterFn();
        setIsTransitioning(false);
        setIsSettling(true);
      });
      // Duration covers max stagger delay (280ms) + animation length (560ms).
      setTimeout(() => setIsSettling(false), 1080);
    }, 280);
  };

  // Pour animation on style change
  const prevAccentRef = useRef(targetAccentColor);
  const [fillColor, setFillColor] = useState(null);
  const [holdBgColor, setHoldBgColor] = useState(targetAccentColor);
  const [pourTransform, setPourTransform] = useState('translateY(105%)');
  const [isPouring, setIsPouring] = useState(false);

  // Synchronized color aliases: accentColor holds during pour (for bg/gradients),
  // but we will pass targetAccentColor directly to the cards so they appear with the right theme.
  const accentColor = holdBgColor;
  const accentContrast = useMemo(() => getContrastYIQ(targetAccentColor), [targetAccentColor]);

  useEffect(() => {
    if (prevAccentRef.current !== targetAccentColor) {
      // Lock hold color at OLD so CSS transitions start from old state
      setHoldBgColor(prevAccentRef.current);
      setFillColor(targetAccentColor);
      setPourTransform('translateY(105%)');
      setIsPouring(false);
      setWaveAnimating(true);

      let targetY = 0;
      if (headerRef.current) {
        const rect = headerRef.current.getBoundingClientRect();
        // +1 offset makes the pour wave bottom land exactly at (header_bottom + 1),
        // which is where the header wave lives (bottom-[-1px]). Result: the pour wave
        // and the header wave cover the same pixel range, eliminating the sliver bug
        // where a cream pour wave left a strip of the new-bg color visible above/below it.
        targetY = Math.max(0, rect.bottom + 1);
      }

      // Next frame: kick off the pour transform AND start the header color transition
      // in the SAME frame so both animations run over the same 1.4s window, ending together.
      let frame1, frame2;
      frame1 = requestAnimationFrame(() => {
        frame2 = requestAnimationFrame(() => {
          setIsPouring(true);
          setPourTransform(`translateY(${targetY}px)`);
          setHoldBgColor(targetAccentColor); // triggers delayed 500ms bg transitions
        });
      });

      const timerClean = setTimeout(() => {
        setWaveAnimating(false);
        setPourTransform('translateY(105%)');
        setIsPouring(false);
      }, 2500);

      prevAccentRef.current = targetAccentColor;
      return () => {
        clearTimeout(timerClean);
        cancelAnimationFrame(frame1);
        cancelAnimationFrame(frame2);
      };
    }
  }, [targetAccentColor]);

  const displayBgColor = holdBgColor;

  return (
    <div className="relative w-full h-[100dvh] font-sans text-zinc-900 select-none overflow-x-hidden" style={{ backgroundColor: displayBgColor, maxWidth: '100vw', transition: 'background-color 500ms cubic-bezier(0.4, 0, 0.2, 1) 900ms' }}>
      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,400;0,500;0,700;0,800;0,900;1,400&family=Commissioner:wght@400;500;600;700&family=Russo+One&display=swap');
        @font-face {
          font-family: 'TD Ciryulnik';
          src:
            local('TD Ciryulnik'),
            local('TD CIRYULNIK'),
            url('/fonts/td-ciryulnik.otf') format('opentype');
          font-style: normal;
          font-weight: 400;
          font-display: swap;
        }
        :root {
          /* Type scale — 1.25 modular ratio, rem-based */
          --text-micro: 0.6875rem;    /* 11px — captions, legal */
          --text-caption: 0.8125rem;  /* 13px — brewery, stats */
          --text-body: 0.9375rem;     /* 15px — default body */
          --text-price: 1.125rem;     /* 18px — prices, emphasis */
          --text-title: 1.5rem;       /* 24px — section titles */
          --text-display: 1.875rem;   /* 30px — hero product name */
          /* Motion easing */
          --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
          --ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);
          --ease-in-strong: cubic-bezier(0.32, 0, 0.67, 0);
          /* Safe area (iOS / Telegram) */
          --safe-top: max(env(safe-area-inset-top, 0px), var(--tg-safe-top, 0px));
          --safe-bottom: max(env(safe-area-inset-bottom, 0px), var(--tg-safe-bottom, 0px));
        }
        /* Telegram mini-app tweaks */
        * { -webkit-touch-callout: none; }
        img { -webkit-user-drag: none; user-drag: none; }
        html { scrollbar-gutter: stable; }
        html, body { overflow-x: hidden; width: 100%; max-width: 100vw; }
        body {
          font-family: 'Commissioner', system-ui, -apple-system, sans-serif;
          background: #000;
          margin: 0;
          padding: 0;
          overflow: hidden;
          overscroll-behavior: none;
          -webkit-overflow-scrolling: touch;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
          font-kerning: normal;
          font-feature-settings: "kern", "liga", "calt";
          font-variation-settings: "FLAR" 4, "VOLM" 50;
          line-height: 1.4;
          letter-spacing: -0.003em;
        }
        h1, h2, h3, h4, h5, h6 { line-height: 1.1; letter-spacing: -0.018em; }
        .font-display {
          font-family: 'Alegreya', Georgia, serif;
          font-feature-settings: "kern", "calt", "onum", "liga" 0, "dlig" 0;
          font-variation-settings: normal;
        }
        .font-logo {
          font-family: 'TD Ciryulnik', 'Russo One', sans-serif !important;
          font-weight: 400;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-feature-settings: normal;
          font-variation-settings: normal;
        }
        .uppercase { letter-spacing: 0.06em; }
        @keyframes float-up { from { opacity: 0; transform: translateY(12px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes cart-rise {
          0% { opacity: 0; transform: translateY(100%); }
          55% { opacity: 1; }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes cart-gradient-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes qty-pop {
          0% { opacity: 0; transform: scale(0.9) translateX(6px); }
          100% { opacity: 1; transform: scale(1) translateX(0); }
        }
        @keyframes plus-fade {
          0% { opacity: 0; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes qty-bump {
          0% { transform: scale(1); }
          40% { transform: scale(1.12); }
          100% { transform: scale(1); }
        }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes search-chip-in {
          0%   { opacity: 0; transform: translateY(-8px) scale(0.96); filter: blur(4px); }
          60%  { opacity: 1; transform: translateY(1px) scale(1.01); filter: blur(0); }
          100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        @keyframes search-chip-out {
          0%   { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-3px) scale(0.97); }
        }
        @keyframes search-bar-in {
          0%   { opacity: 0; transform: translateY(-10px) scale(0.985); filter: blur(8px); }
          55%  { opacity: 1; transform: translateY(1px) scale(1.004); filter: blur(0); }
          100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        /* Age gate exit: backdrop fades + gently blurs out, card zooms up and away
           on top of it — layered exit so the user feels a real "stepping through"
           transition instead of an abrupt unmount. */
        @keyframes age-gate-out {
          0%   { opacity: 1; filter: blur(0); }
          100% { opacity: 0; filter: blur(6px); }
        }
        @keyframes age-card-out {
          0%   { opacity: 1; transform: translateY(0) scale(1); }
          60%  { opacity: 0.6; transform: translateY(-14px) scale(1.02); }
          100% { opacity: 0; transform: translateY(-28px) scale(0.92); }
        }
        @keyframes wave-smooth { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes slide-up-glass { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes slide-down-glass { from { transform: translateY(0); } to { transform: translateY(100%); } }
        @keyframes fade-out { from { opacity: 1; } to { opacity: 0; } }
        @keyframes foam-drift { 0% { transform: translateX(0) translateY(0); } 50% { transform: translateX(-3px) translateY(1px); } 100% { transform: translateX(0) translateY(0); } }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
        button { -webkit-tap-highlight-color: transparent; }
        @keyframes beer-rise { 0% { transform: translateY(105%); } 15% { transform: translateY(80%); } 30% { transform: translateY(55%); } 45% { transform: translateY(35%); } 60% { transform: translateY(18%); } 75% { transform: translateY(6%); } 90% { transform: translateY(1%); } 100% { transform: translateY(0); } }
        @keyframes surface-wobble { 0% { transform: translateX(0%) scaleY(3.5); } 25% { transform: translateX(-12.5%) scaleY(2.8); } 50% { transform: translateX(-25%) scaleY(2); } 75% { transform: translateX(-37.5%) scaleY(1.3); } 100% { transform: translateX(-50%) scaleY(1); } }
        @keyframes foam-rise { 0% { transform: translateY(0) scale(0.4); opacity: 0; } 15% { transform: translateY(-8px) scale(1.1); opacity: 0.7; } 40% { transform: translateY(-25px) scale(1); opacity: 0.6; } 70% { transform: translateY(-50px) scale(0.85); opacity: 0.35; } 100% { transform: translateY(-75px) scale(0.5); opacity: 0; } }
        @keyframes bubble-drift { 0% { transform: translate(0,0) scale(0.3); opacity: 0; } 20% { transform: translate(5px,-12px) scale(1.2); opacity: 0.65; } 50% { transform: translate(-3px,-35px) scale(0.9); opacity: 0.5; } 80% { transform: translate(8px,-55px) scale(0.6); opacity: 0.2; } 100% { transform: translate(4px,-70px) scale(0.3); opacity: 0; } }
        @keyframes foam-head { 0% { transform: scaleY(0); opacity: 0; } 60% { transform: scaleY(0); opacity: 0; } 75% { transform: scaleY(1.3); opacity: 0.5; } 90% { transform: scaleY(0.9); opacity: 0.35; } 100% { transform: scaleY(1); opacity: 0.25; } }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar {-ms-overflow-style: none; scrollbar-width: none; }
        *::-webkit-scrollbar { display: none; }
        * { scrollbar-width: none; }
        .foam-bg {
          background:
            radial-gradient(ellipse 8px 6px at 20% 30%, rgba(255,255,255,0.6) 0%, transparent 100%),
            radial-gradient(ellipse 5px 4px at 50% 15%, rgba(255,255,255,0.5) 0%, transparent 100%),
            radial-gradient(ellipse 7px 5px at 75% 45%, rgba(255,255,255,0.4) 0%, transparent 100%),
            radial-gradient(ellipse 4px 3px at 35% 60%, rgba(255,255,255,0.35) 0%, transparent 100%),
            radial-gradient(ellipse 6px 5px at 85% 20%, rgba(255,255,255,0.45) 0%, transparent 100%),
            radial-gradient(ellipse 9px 7px at 10% 70%, rgba(255,255,255,0.3) 0%, transparent 100%),
            radial-gradient(ellipse 3px 3px at 60% 75%, rgba(255,255,255,0.5) 0%, transparent 100%),
            radial-gradient(ellipse 5px 4px at 45% 40%, rgba(255,255,255,0.4) 0%, transparent 100%),
            linear-gradient(180deg, #FFF8E7 0%, #F5E6C8 40%, #EDD9AB 100%);
          animation: foam-drift 4s ease-in-out infinite;
        }
        .liquid-glass {
          background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.02) 100%);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          isolation: isolate;
          backface-visibility: hidden;
          border-top: 1px solid rgba(255,255,255,0.4);
          border-left: 1px solid rgba(255,255,255,0.4);
          border-right: 1px solid rgba(255,255,255,0.1);
          border-bottom: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 8px 24px rgba(0,0,0,0.08), inset 0 1px 1px rgba(255,255,255,0.3);
          transition: background-color 1000ms ease, border-color 1000ms ease, box-shadow 1000ms ease;
        }
        .liquid-glass-subtle {
          background: linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.08) 100%);
          backdrop-filter: blur(3px);
          -webkit-backdrop-filter: blur(3px);
          isolation: isolate;
          backface-visibility: hidden;
          border: 1px solid rgba(255,255,255,0.5);
          box-shadow: 0 2px 6px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.45);
        }
        /* Card fade — opacity/transform applied per-child (NOT parent), because
           a parent opacity would disable backdrop-filter on every card. We drop
           filter blur (expensive on slower devices and caused visible frame
           drops during the stagger) and keep the motion to cheap GPU-friendly
           transform + opacity only. Fade-out end state and fly-in start state
           use identical values, so there is no position jump when the grid
           class flips from fading to settling. */
        .cards-grid > * {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
        .cards-grid-fading > * {
          opacity: 0;
          transform: translateY(8px) scale(0.95);
          transition:
            opacity 280ms cubic-bezier(0.32, 0, 0.67, 0),
            transform 280ms cubic-bezier(0.32, 0, 0.67, 0);
        }
        /* After a style change, cards play a one-shot entry keyframe — staggered
           top→bottom, start below, land smoothly at rest WITHOUT overshoot. A
           cubic-bezier(0.22, 1, 0.36, 1) (ease-out-quint) gives a strong
           decelerate feel without any bounce. */
        .cards-grid-settling > * {
          animation: card-fly-in 560ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .cards-grid-settling > *:nth-child(1)  { animation-delay: 0ms; }
        .cards-grid-settling > *:nth-child(2)  { animation-delay: 35ms; }
        .cards-grid-settling > *:nth-child(3)  { animation-delay: 70ms; }
        .cards-grid-settling > *:nth-child(4)  { animation-delay: 105ms; }
        .cards-grid-settling > *:nth-child(5)  { animation-delay: 140ms; }
        .cards-grid-settling > *:nth-child(6)  { animation-delay: 175ms; }
        .cards-grid-settling > *:nth-child(7)  { animation-delay: 210ms; }
        .cards-grid-settling > *:nth-child(8)  { animation-delay: 245ms; }
        .cards-grid-settling > *:nth-child(n+9) { animation-delay: 280ms; }
        @keyframes card-fly-in {
          0%   { opacity: 0; transform: translateY(8px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}} />

      {!ageVerified && (
        <div
          className="fixed inset-0 z-[500] flex flex-col items-center justify-center px-6 overflow-hidden"
          style={{
            animation: ageGateClosing
              ? 'age-gate-out 560ms cubic-bezier(0.32, 0, 0.67, 0) forwards'
              : undefined,
          }}
        >
          {/* Пенный фон с пузырями */}
          <div className="absolute inset-0 bg-[#EDD9AB]" />
          <div className="absolute inset-0 foam-bg" style={{ animation: 'none' }} />
          <FoamBubblesCanvas />
          {/* Стекломорфизм контейнер — более выразительный, но пузыри видны сквозь него */}
          <div className="relative z-10 flex flex-col items-center w-full max-w-[340px] p-8 pt-12 pb-10 rounded-[32px]"
            style={{
              background: 'rgba(255,248,231,0.32)',
              backdropFilter: 'blur(10px) saturate(1.2)',
              WebkitBackdropFilter: 'blur(10px) saturate(1.2)',
              border: '1px solid rgba(255,255,255,0.55)',
              boxShadow: '0 10px 40px rgba(120,80,20,0.12), inset 0 1px 0 rgba(255,255,255,0.55)',
              animation: ageGateClosing
                ? 'age-card-out 460ms cubic-bezier(0.32, 0, 0.67, 0) forwards'
                : undefined,
            }}>
            <PrimeMark
              size={88}
              accentColor="#C4A265"
              textColor="#C4A265"
              glass
              showOrbit={false}
              className="mb-5"
            />
            <h1 className="font-display text-[28px] font-black text-center mb-2 text-zinc-800 tracking-[-0.02em] leading-[1.1]">Вам есть 18 лет?</h1>
            <p className="text-center mb-8 text-sm max-w-[260px] font-medium leading-relaxed text-zinc-600">Доступ к приложению разрешен только совершеннолетним пользователям.</p>
            <button
              onClick={() => {
                // Play the close keyframe, then unmount the gate. The card lifts
                // and scales down (460ms) while the whole backdrop blurs + fades
                // out (560ms) — a layered exit that feels intentional.
                if (ageGateClosing) return;
                setAgeGateClosing(true);
                setTimeout(() => {
                  setAgeVerified(true);
                  setAgeGateClosing(false);
                }, 520);
              }}
              className="w-full py-4 rounded-[20px] font-display font-black text-[20px] active:scale-[0.97] transition-all mb-3 tracking-[-0.01em] text-white"
              style={{
                background: 'linear-gradient(135deg, #C4A265 0%, #D4B87A 50%, #B8944F 100%)',
                border: '1px solid rgba(212,184,122,0.6)',
                boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.4), 0 4px 16px rgba(0,0,0,0.1)',
              }}>Да, мне есть 18</button>
            <button onClick={() => window.close()} className="w-full py-4 rounded-[20px] font-display font-bold text-[18px] active:scale-[0.97] transition-all tracking-[-0.01em]"
              style={{
                background: 'rgba(196,162,101,0.12)',
                border: '1px solid rgba(196,162,101,0.28)',
                color: '#B8944F',
              }}>Нет, я младше</button>
          </div>
        </div>
      )}

      <main ref={mainRef} className={`relative w-full h-[100dvh] z-20 overflow-x-hidden no-scrollbar scroll-smooth ${(isTransitioning || isSettling) ? 'overflow-y-hidden' : 'overflow-y-auto'}`} style={{ overscrollBehavior: 'none' }}>

        {/* Pour animation — permanently mounted, now inside main so it shares the stacking context */}
        <div
          className="fixed inset-y-0 z-[28] pointer-events-none overflow-hidden"
          style={{
            left: '-4px',
            right: '-4px',
            width: 'calc(100% + 8px)',
            visibility: waveAnimating ? 'visible' : 'hidden',
          }}
        >
          <div
            className="absolute inset-x-0 bottom-0 top-[-2px]"
            style={{
              backgroundColor: fillColor || 'transparent',
              transform: pourTransform,
              transition: isPouring ? 'transform 1.4s cubic-bezier(0.25, 1, 0.5, 1)' : 'none',
              willChange: 'transform',
            }}
          >
            {/* Pour wave — shares the pour body's color (the new accent), NOT cream.
                Instantly takes the new color (transition:none), because it's a fresh
                element appearing on screen rather than changing color. Combined with
                the +1 targetY above, this makes the pour wave and the header wave
                occupy the exact same pixel range with the exact same color — so
                when waveAnimating flips off at t=2.5s, there is nothing to snap. */}
            <HeaderWave className="absolute top-[-18px] left-0" fill={fillColor || '#FFF8E7'} style={{ transition: 'none' }} />
          </div>
        </div>

        <BeerBubblesCanvas headerRef={headerRef} scrollContainerRef={mainRef} />
        <header ref={headerRef} className="w-full relative" style={{ paddingTop: 'var(--safe-top)' }}>
          <div className="foam-bg pt-4 px-4 pb-6 relative overflow-hidden z-[20]">
            <div className="absolute inset-0 pointer-events-none" style={{
              backgroundColor: displayBgColor,
              WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.25) 25%, rgba(0,0,0,0.1) 55%, transparent 85%)',
              maskImage: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.25) 25%, rgba(0,0,0,0.1) 55%, transparent 85%)',
              transition: 'background-color 500ms cubic-bezier(0.4, 0, 0.2, 1) 900ms'
            }} />
            <FoamBubblesCanvas />
            <div className="flex justify-between items-center h-[70px] relative z-[50]">
              <div className="flex items-center gap-3">
                <PrimeMark
                  size={56}
                  accentColor={accentColor}
                  textColor={accentColor}
                  animated={!storyRead}
                  read={storyRead}
                  showPlate={false}
                  ariaLabel="Открыть историю"
                  className="cursor-pointer active:scale-95 transition-transform"
                  onClick={() => { setShowStory(true); setStoryRead(true); }}
                />
                <button type="button" aria-label="Выбрать адрес" onClick={() => setShowLocationSheet(true)} className="flex flex-col items-start active:opacity-70 text-left ml-1">
                  <span className="text-zinc-400 font-bold text-[10px] uppercase tracking-widest mb-0.5">{activeLocation.area}</span>
                  <div className="flex items-center gap-1">
                    <MapPin size={16} style={{ color: accentColor }} className="transition-colors duration-1000" />
                    <h1 className="text-[15px] font-black tracking-tight text-zinc-900">{activeLocation.address}</h1>
                    <ChevronDown size={14} className="text-zinc-400" />
                  </div>
                </button>
              </div>
              <button
                type="button"
                aria-label={showSearchBar ? 'Свернуть поиск' : activeSearchTerm ? 'Изменить поиск' : 'Открыть поиск'}
                onClick={() => {
                  if (!showSearchBar && activeSearchTerm) {
                    flushSync(() => {
                      setActiveSearchTerm("");
                      setSearchChipClosing(false);
                      setShowSearchBar(true);
                      setSearchQuery(searchQuery || activeSearchTerm);
                    });
                    requestAnimationFrame(() => searchInputRef.current?.focus());
                    return;
                  }
                  if (showSearchBar) {
                    setShowSearchBar(false);
                    return;
                  }
                  // flushSync forces React to commit the state change + render
                  // synchronously during this click event, so the input exists in
                  // the DOM by the time focus() runs — and because focus() is
                  // still inside the user-gesture handler, iOS/Android open the
                  // software keyboard immediately instead of ignoring the call.
                  flushSync(() => setShowSearchBar(true));
                  searchInputRef.current?.focus();
                }}
                className="w-[56px] h-[56px] rounded-full active:scale-95 transition-all flex items-center justify-center duration-1000 liquid-glass"
                style={{ backgroundColor: hexToRgba(accentColor, 0.15) }}
              >
                <Search size={22} strokeWidth={2.5} style={{ color: accentColor }} className="transition-colors duration-1000" />
              </button>
            </div>
            {/* Inline search bar — appears in place instead of a modal so users
                stay in context. Slides down with a soft overshoot, auto-focused.
                Enter submits (runs the same fade→fly-in as the brewery search),
                X collapses. */}
            {(showSearchBar || activeSearchTerm) && (
              <div
                className="mt-3 relative z-[50]"
                style={{ animation: 'search-bar-in 560ms cubic-bezier(0.22, 1, 0.36, 1) both' }}
              >
                {showSearchBar ? (
                  <div
                    className="relative flex items-center rounded-[16px] liquid-glass-subtle"
                    style={{ backgroundColor: hexToRgba(accentColor, 0.12) }}
                  >
                    <Search size={18} className="absolute left-3.5 z-10 text-zinc-500 pointer-events-none" strokeWidth={2.5} />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSearchSubmit();
                        } else if (e.key === 'Escape') {
                          if (activeSearchTerm) {
                            clearSearch();
                          } else {
                            setShowSearchBar(false);
                            setSearchQuery("");
                          }
                        }
                      }}
                      placeholder="Название или пивоварня..."
                      className="relative z-10 flex-1 pl-11 pr-11 py-3 bg-transparent text-[14px] font-medium caret-zinc-900 placeholder:text-zinc-500 focus:outline-none text-zinc-900"
                    />
                    <button
                      type="button"
                      aria-label={activeSearchTerm || searchQuery.trim() ? 'Очистить поиск' : 'Закрыть поиск'}
                      onClick={() => {
                        if (activeSearchTerm || searchQuery.trim()) {
                          clearSearch();
                          return;
                        }
                        setShowSearchBar(false);
                        setSearchQuery("");
                      }}
                      className="absolute right-2 z-10 w-7 h-7 rounded-full flex items-center justify-center active:scale-[0.88] liquid-glass"
                      style={{ backgroundColor: hexToRgba(accentColor, 0.25), transition: 'transform 160ms cubic-bezier(0.23, 1, 0.32, 1), background-color 1000ms ease' }}
                    ><X size={14} /></button>
                  </div>
                ) : (
                  <div
                    className="flex items-center"
                    style={{
                      animation: searchChipClosing
                        ? 'search-chip-out 280ms cubic-bezier(0.32, 0, 0.67, 0) forwards'
                        : 'search-chip-in 420ms cubic-bezier(0.22, 1, 0.36, 1) both',
                    }}
                  >
                    <div
                      className="flex items-center gap-2 max-w-full px-3 py-1.5 rounded-[14px] border text-[13px] font-semibold text-zinc-900/90"
                      style={{
                        background: `linear-gradient(180deg, ${hexToRgba(accentColor, 0.18)} 0%, rgba(255,255,255,0.22) 100%)`,
                        borderColor: 'rgba(255,255,255,0.58)',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.72), 0 6px 14px rgba(120,80,20,0.08)',
                        backdropFilter: 'blur(10px) saturate(1.15)',
                        WebkitBackdropFilter: 'blur(10px) saturate(1.15)'
                      }}
                    >
                      <span className="truncate">{activeSearchTerm}</span>
                      <button
                        type="button"
                        aria-label="Сбросить найденный запрос"
                        onClick={() => {
                          setSearchChipClosing(true);
                          setTimeout(() => {
                            setSearchChipClosing(false);
                            clearSearch({ keepOpen: false });
                          }, 170);
                        }}
                        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 active:scale-[0.88] liquid-glass"
                        style={{ backgroundColor: hexToRgba(accentColor, 0.18) }}
                      >
                        <X size={11} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="flex gap-2 mt-4 relative z-[50]">
              <button onClick={() => setShowOriginSheet(true)} className="flex-1 flex items-center justify-between p-3.5 rounded-[16px] active:scale-[0.98] transition-all liquid-glass-subtle">
                <div className="flex flex-col items-start w-full pr-2">
                  <span className="text-[9px] font-bold uppercase tracking-widest mb-0.5 text-zinc-500">Коллекция</span>
                  <span className="text-[13px] font-black truncate text-zinc-900">{activeOrigin?.name || 'Не выбрана'}</span>
                </div>
                <ChevronDown size={16} className="text-zinc-500 shrink-0" />
              </button>
              <button onClick={() => !isStyleFilterDisabled && setShowCategorySheet(true)}
                className={`flex-1 flex items-center justify-between p-3.5 rounded-[16px] transition-all liquid-glass-subtle ${isStyleFilterDisabled ? 'opacity-50' : 'active:scale-[0.98]'}`}>
                <div className="flex flex-col items-start w-full pr-2">
                  <span className="text-[9px] font-bold uppercase tracking-widest mb-0.5 text-zinc-500">Стиль</span>
                  <span className="text-[13px] font-black truncate text-zinc-900">{isStyleFilterDisabled ? '-' : activeCategory.name}</span>
                </div>
                {!isStyleFilterDisabled && <ChevronDown size={16} className="text-zinc-500 shrink-0" />}
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2 mt-3 relative z-[50]">
              {sortOptions.map(s => {
                const isActive = sortConfig.key === s.id && sortConfig.direction !== null;
                return (
                  <button key={s.id}
                    onClick={() => startTransition(() => setSortConfig(prev => prev.key === s.id ? { key: s.id, direction: prev.direction === 'desc' ? 'asc' : prev.direction === 'asc' ? null : 'desc' } : { key: s.id, direction: 'desc' }))}
                    className="relative flex flex-col items-center justify-center h-[34px] rounded-full text-[10px] font-black tracking-wide liquid-glass-subtle text-zinc-900 overflow-hidden"
                    style={{
                      transition: 'background-color 700ms ease, border-color 700ms ease',
                      backgroundColor: isActive ? hexToRgba(accentColor, 0.28) : undefined,
                      border: isActive ? `1px solid ${hexToRgba(accentColor, 0.5)}` : undefined,
                    }}>
                    <span className="leading-none">{s.label}</span>
                    <svg width="12" height="6" viewBox="0 0 12 6" fill="none" className="mt-[2px]" style={{
                      opacity: isActive ? 0.9 : 0,
                      transform: isActive && sortConfig.direction === 'asc' ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'opacity 260ms ease, transform 360ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                      color: 'currentColor',
                    }}>
                      <path d="M1.5 1.5 L6 5 L10.5 1.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                );
              })}
            </div>
          </div>
          {/* Wave on header level — lives entirely inside the header so the foam shows
              behind it. Fill is the main bg color, so the wave looks like main bg
              "crests" rising up into the foam and seamlessly joining main content below.
              bottom-[-1px] gives a 1px sub-pixel overlap with the main bg area to
              eliminate any rendering seam — harmless because the colors match. */}
          <HeaderWave className="absolute bottom-[-1px] left-0 z-[25]" fill={displayBgColor} />
        </header>
        <div className="px-4 pt-4 pb-[120px] relative z-[30]">
          {activeOrigin && (
            <div className={`grid grid-cols-2 auto-rows-fr gap-3 pb-6 cards-grid ${isTransitioning ? 'cards-grid-fading' : ''} ${isSettling ? 'cards-grid-settling' : ''}`}>
              {currentItems.length > 0 ? renderedGridItems : (
                // Plain icon + label — no glass pill, no background. The content
                // wrapper is z-30 while the BeerBubblesCanvas is fixed z-29, so the
                // icon and text sit on top of the bubbles naturally while bubbles
                // drift visibly around and behind them.
                <div className="col-span-2 py-24 flex flex-col items-center justify-center text-center gap-3 relative z-[1] pointer-events-none">
                  <Search size={44} strokeWidth={2.25} style={{ color: hexToRgba(accentContrast, 0.7) }} />
                  <p className="font-black text-[18px] tracking-[-0.01em]" style={{ color: hexToRgba(accentContrast, 0.9) }}>Ничего не найдено</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Scroll-to-top FAB — fades in once the user passes ~3 viewport heights.
          Lifted above the cart FAB when cart is visible, otherwise sits just above
          the safe-area bottom. The transform is the single animated property so
          it stays smooth even when the cart bar is re-rendering. */}
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Наверх"
        className="fixed right-4 z-[55] w-12 h-12 rounded-full flex items-center justify-center liquid-glass active:scale-[0.92]"
        style={{
          bottom: `calc(var(--safe-bottom) + ${cartTotalItems > 0 ? 104 : 24}px)`,
          backgroundColor: hexToRgba(accentColor, 0.22),
          opacity: showScrollTop ? 1 : 0,
          transform: showScrollTop ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.92)',
          pointerEvents: showScrollTop ? 'auto' : 'none',
          transition: 'opacity 320ms cubic-bezier(0.23, 1, 0.32, 1), transform 420ms cubic-bezier(0.34, 1.56, 0.64, 1), bottom 360ms cubic-bezier(0.23, 1, 0.32, 1), background-color 1000ms ease',
        }}
      >
        <ChevronUp size={22} strokeWidth={2.75} style={{ color: accentContrast }} />
      </button>

      {cartTotalItems > 0 && (
        <div className="fixed bottom-0 left-0 w-full z-50 px-4 pt-6 pointer-events-none" style={{ paddingBottom: 'calc(var(--safe-bottom) + 20px)' }}>
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] to-transparent pointer-events-none" style={{ animation: 'cart-gradient-in 1200ms cubic-bezier(0.23, 1, 0.32, 1) both' }} />
          <button type="button" aria-label="Открыть корзину" onClick={() => setShowCart(true)} className="relative w-full flex items-center justify-between p-4 rounded-[24px] shadow-2xl active:scale-[0.98] pointer-events-auto liquid-glass" style={{ backgroundColor: hexToRgba(accentColor, 0.15), animation: 'cart-rise 1400ms cubic-bezier(0.22, 1, 0.36, 1) both', transformOrigin: 'bottom center', transition: 'transform 180ms cubic-bezier(0.23, 1, 0.32, 1), background-color 1000ms ease' }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-[16px] flex items-center justify-center liquid-glass"><Beer size={20} strokeWidth={2.5} style={{ color: accentContrast }} /></div>
              <div className="flex flex-col items-start">
                <span className="font-black text-[16px]" style={{ color: accentContrast }}>Корзина</span>
                <span className="text-[11px] font-bold opacity-70" style={{ color: accentContrast }}>{cartTotalItems} позиций</span>
              </div>
            </div>
            <div className="px-5 py-2.5 rounded-[12px] liquid-glass"><span className="font-black text-[16px]" style={{ color: accentContrast }}>{cartTotalPrice} ₽</span></div>
          </button>
        </div>
      )}

      {showStory && (
        <div className="fixed inset-0 z-[500] bg-zinc-950 flex flex-col text-white" style={{ animation: 'fade-in 200ms cubic-bezier(0.23, 1, 0.32, 1)' }}>
          <button type="button" aria-label="Закрыть историю" onClick={() => setShowStory(false)} className="absolute top-8 right-4 z-20 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center active:scale-90 border border-white/20"><X size={20} /></button>
          <div className="flex-1 flex flex-col items-center justify-center p-6" style={{ background: `linear-gradient(to bottom, ${hexToRgba(accentColor, 0.2)}, #000000)` }}>
            <Flame size={80} className="mb-6 animate-pulse" style={{ color: accentColor, filter: `drop-shadow(0 0 30px ${hexToRgba(accentColor, 0.6)})` }} />
            <div className="font-logo text-4xl text-center mb-4 leading-[1.1] flex flex-col items-center"><span>ПРАЙМ</span><span>БИР</span></div>
            <p className="text-center text-[15px] font-bold mb-10 text-white/70 max-w-[280px]">Откройте для себя новые вкусы с нашими специальными предложениями на кране.</p>
            <button onClick={() => { setShowStory(false); setStoryRead(true); }} className="w-full max-w-[280px] py-4 rounded-[20px] font-black text-[16px] active:scale-95 shadow-xl duration-1000 liquid-glass" style={{ backgroundColor: hexToRgba(accentColor, 0.6), color: accentContrast }}>В КАТАЛОГ</button>
          </div>
        </div>
      )}

      {showCart && (
        <div className="fixed inset-0 z-[400] flex flex-col justify-end text-zinc-900">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => closeSheet('cart', setShowCart)} style={{ animation: closingSheet === 'cart' ? 'fade-out 200ms cubic-bezier(0.32, 0, 0.67, 0) forwards' : 'fade-in 280ms cubic-bezier(0.23, 1, 0.32, 1)' }} />
          <div className="relative flex flex-col h-[85vh] overflow-hidden" style={{ animation: closingSheet === 'cart' ? 'slide-down-glass 220ms cubic-bezier(0.32, 0, 0.67, 0) forwards' : 'slide-up-glass 340ms cubic-bezier(0.32, 0.72, 0, 1) both' }}>
            {/* Wave top — same as product detail */}
            <div className="relative w-full h-[20px] shrink-0 z-[5]" style={{ marginBottom: '-2px' }}>
              <HeaderWave className="absolute bottom-0 left-0" />
            </div>
            <div className="relative flex-1 p-6 pb-0 flex flex-col overflow-hidden foam-bg" style={{ animation: 'none' }}>
              <div className="absolute inset-0 pointer-events-none transition-colors duration-[1000ms]" style={{
                backgroundColor: targetAccentColor,
                WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 30%, rgba(0,0,0,0.15) 60%, transparent 85%)',
                maskImage: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 30%, rgba(0,0,0,0.15) 60%, transparent 85%)'
              }} />
              <FoamBubblesCanvas />
              {/* Handle removed */}
              <div className="flex justify-between items-center mb-6 px-1 shrink-0 relative z-[5]">
                <h2 className="font-display text-[26px] font-black tracking-[-0.02em]">Ваш заказ</h2>
                <button type="button" aria-label="Закрыть корзину" onClick={() => closeSheet('cart', setShowCart)} className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-600 active:scale-90 liquid-glass" style={{ backgroundColor: hexToRgba(targetAccentColor, 0.15) }}><X size={20} /></button>
              </div>
              <div className="flex-1 overflow-y-auto no-scrollbar pb-[180px] px-1 relative z-[5]">
                <div className="flex flex-col gap-3">
                  {cartItems.map((cartItem) => (
                    <div key={cartItem.item.id} className="flex items-center gap-3 p-3 rounded-[20px] cursor-pointer active:scale-[0.98] transition-transform liquid-glass"
                      style={{ boxShadow: 'none' }}
                      onClick={() => { setDetailFromCart(true); setSelectedItem(cartItem.item); setShowCart(false); }}>
                      <div className="w-14 h-14 rounded-[12px] flex items-center justify-center shrink-0 p-2" style={{ backgroundColor: hexToRgba(accentColor, 0.15) }}>
                        <ItemImage item={cartItem.item} className="w-auto h-full max-h-[40px]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-display text-[17px] font-black text-zinc-800 truncate mb-0.5 tracking-[-0.01em]">{cartItem.item.name}</h4>
                        <span className="text-[13px] font-bold text-zinc-500 block">{cartItem.item.price * cartItem.quantity} ₽</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-full p-1 liquid-glass" onClick={(e) => e.stopPropagation()} style={{ backgroundColor: hexToRgba(targetAccentColor, 0.15) }}>
                        <button onClick={() => updateCart(null, cartItem.item, -1)} className="w-7 h-7 rounded-full flex items-center justify-center active:scale-90 liquid-glass" style={{ backgroundColor: hexToRgba(targetAccentColor, 0.2) }}><Minus size={14} className="text-zinc-900" /></button>
                        <span className="text-[12px] font-black text-zinc-900 w-3 text-center">{cartItem.quantity}</span>
                        <button onClick={() => updateCart(null, cartItem.item, 1)} className="w-7 h-7 rounded-full flex items-center justify-center active:scale-90 liquid-glass" style={{ backgroundColor: hexToRgba(targetAccentColor, 0.3) }}>
                          <Plus size={14} style={{ color: accentContrast }} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute bottom-0 left-0 w-full z-20 pointer-events-none px-4 pt-8" style={{ paddingBottom: 'calc(var(--safe-bottom) + 20px)' }}>
                <div className="absolute inset-0 pointer-events-none" style={{ background: `linear-gradient(to top, ${hexToRgba(targetAccentColor, 0.9)} 0%, ${hexToRgba(targetAccentColor, 0.5)} 40%, transparent 100%)` }} />
                <div className="relative w-full p-4 rounded-[28px] liquid-glass pointer-events-auto" style={{ border: '1px solid rgba(255,255,255,0.6)', boxShadow: 'none' }}>
                  <div className="flex justify-between items-center mb-4 px-2">
                    <span className="text-zinc-500 font-bold text-[12px] uppercase tracking-widest">Итого</span>
                    <span className="text-2xl font-black text-zinc-900">{cartTotalPrice} ₽</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 flex items-center justify-center gap-2 py-4 rounded-[20px] font-black text-[13px] active:scale-[0.98] liquid-glass" style={{ backgroundColor: hexToRgba(targetAccentColor, 0.1) }}><CalendarCheck size={16} /> БРОНЬ</button>
                    <button className="flex-1 flex items-center justify-center gap-2 py-4 rounded-[20px] font-black text-[13px] active:scale-[0.98] liquid-glass" style={{ backgroundColor: hexToRgba(targetAccentColor, 0.3), color: accentContrast }}>
                      <Truck size={16} /> ДОСТАВКА
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedItem && (() => {
        let startY = 0;
        const onTouchStart = (e) => { startY = e.touches[0].clientY; };
        const onTouchEnd = (e) => { if (e.changedTouches[0].clientY - startY > 80) closeDetail(); };
        const itemCat = ALL_CATEGORIES.find(c => c.id === selectedItem.type);
        const itemColor = itemCat ? itemCat.color : '#D9B500';
        const itemContrast = '#FFFFFF';
        return (
          <div className="fixed inset-0 z-[400] flex flex-col justify-end text-zinc-900">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeDetail} style={{ animation: closingDetail ? 'fade-out 200ms cubic-bezier(0.32, 0, 0.67, 0) forwards' : 'fade-in 0.3s ease-out' }} />
            <div className="relative flex flex-col max-h-[95vh]" style={{ animation: closingDetail ? 'slide-down-glass 220ms cubic-bezier(0.32, 0, 0.67, 0) forwards' : 'slide-up-glass 0.3s ease-out both' }}
              onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
              {/* Wave = top edge of card, behind it is blur */}
              <div className="relative w-full h-[20px] shrink-0 z-[5]" style={{ marginBottom: '-2px' }}>
                <HeaderWave className="absolute bottom-0 left-0" />
              </div>
              {/* Card body = foam-bg + item color gradient + bubbles, like header */}
              <div className="relative flex-1 flex flex-col overflow-hidden foam-bg" style={{ animation: 'none' }}>
                <div className="absolute inset-0 pointer-events-none" style={{ background: `linear-gradient(to top, ${hexToRgba(itemColor, 0.85)} 0%, ${hexToRgba(itemColor, 0.5)} 30%, ${hexToRgba(itemColor, 0.15)} 60%, transparent 85%)` }} />
                <FoamBubblesCanvas />
                <button type="button" aria-label="Закрыть карточку товара" onClick={closeDetail} className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center z-20 active:scale-90 liquid-glass"><X size={20} style={{ color: itemColor }} /></button>
                <div className="overflow-y-auto no-scrollbar flex-1 pb-32 relative z-[5]">
                  {/* Swipe indicator removed */}
                  {/* Full-width image */}
                  <div className="w-full h-[280px] flex items-center justify-center relative">
                    <ItemImage item={selectedItem} className="w-auto h-[85%] drop-shadow-2xl relative z-[2]" />
                  </div>
                  {/* Brewery + Rating + Name + Stats */}
                  <div className="px-6 pt-2 mb-5">
                    {!selectedItem.isNotBeer && (
                      <div className="flex items-center justify-between mb-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            const brewery = selectedItem.brewery;
                            // Close the detail sheet first, then kick off the search
                            // after the close animation so the user sees the filtered
                            // list appear cleanly instead of mid-slide.
                            closeDetail();
                            setTimeout(() => handleBrewerySearch(brewery), 240);
                          }}
                          className="font-display px-3 py-1.5 rounded-[10px] text-[15px] font-bold active:scale-[0.96] transition-transform"
                          style={{ color: '#18181B', backgroundColor: 'rgba(255,255,255,0.55)', border: `1px solid rgba(255,255,255,0.6)` }}
                        >{selectedItem.brewery}</button>
                        <div className="flex items-center gap-1 px-3 py-1.5 rounded-[10px]" style={{ backgroundColor: hexToRgba(itemColor, 0.2), border: `1px solid ${hexToRgba(itemColor, 0.35)}` }}>
                          <Star size={13} style={{ color: itemContrast, fill: itemContrast }} /><span className="font-display text-[15px] font-bold" style={{ color: itemContrast }}>{selectedItem.rating}</span>
                        </div>
                      </div>
                    )}
                    <h2 className="font-display text-[32px] font-black leading-[1.05] tracking-[-0.02em] mb-3" style={{ color: itemContrast }}>{selectedItem.name}</h2>
                    {!selectedItem.isNotBeer && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-display px-3 py-1.5 rounded-[10px] text-[14px] font-black" style={{ color: itemContrast, backgroundColor: 'rgba(255,255,255,0.2)', border: `1px solid rgba(255,255,255,0.35)` }}>{getVolumeLabel(selectedItem)}</span>
                        <span className="font-display px-3 py-1.5 rounded-[10px] text-[14px] font-black" style={{ color: itemContrast, backgroundColor: 'rgba(255,255,255,0.2)', border: `1px solid rgba(255,255,255,0.35)` }}>{selectedItem.abv}% ABV</span>
                        <span className="font-display px-3 py-1.5 rounded-[10px] text-[14px] font-black" style={{ color: itemContrast, backgroundColor: 'rgba(255,255,255,0.2)', border: `1px solid rgba(255,255,255,0.35)` }}>{selectedItem.og}% OG</span>
                        {selectedItem.ibu > 0 && <span className="font-display px-3 py-1.5 rounded-[10px] text-[14px] font-black" style={{ color: itemContrast, backgroundColor: 'rgba(255,255,255,0.2)', border: `1px solid rgba(255,255,255,0.35)` }}>{selectedItem.ibu} IBU</span>}
                      </div>
                    )}
                  </div>
                  {!selectedItem.isNotBeer && selectedItem.nutrition && (
                    <div className="mx-6 mb-5 p-4 rounded-[20px]" style={{ backgroundColor: hexToRgba(itemColor, 0.15), border: `1px solid ${hexToRgba(itemColor, 0.3)}` }}>
                      <h3 className="text-[9px] font-black uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: hexToRgba(itemContrast, 0.5) }}><Flame size={12} /> КБЖУ НА 100МЛ</h3>
                      <div className="grid grid-cols-4 gap-2 text-center">
                        <div><span className="text-[18px] font-black" style={{ color: itemContrast }}>{selectedItem.nutrition.kcal}</span><div className="text-[9px] font-bold uppercase mt-0.5" style={{ color: hexToRgba(itemContrast, 0.5) }}>Ккал</div></div>
                        <div><span className="text-[18px] font-black" style={{ color: itemContrast }}>{selectedItem.nutrition.p}</span><div className="text-[9px] font-bold uppercase mt-0.5" style={{ color: hexToRgba(itemContrast, 0.5) }}>Белки</div></div>
                        <div><span className="text-[18px] font-black" style={{ color: itemContrast }}>{selectedItem.nutrition.f}</span><div className="text-[9px] font-bold uppercase mt-0.5" style={{ color: hexToRgba(itemContrast, 0.5) }}>Жиры</div></div>
                        <div><span className="text-[18px] font-black" style={{ color: itemContrast }}>{selectedItem.nutrition.c}</span><div className="text-[9px] font-bold uppercase mt-0.5" style={{ color: hexToRgba(itemContrast, 0.5) }}>Углев</div></div>
                      </div>
                    </div>
                  )}
                  <div className="px-6 mb-6">
                    <h3 className="text-[9px] font-black uppercase tracking-widest mb-2" style={{ color: hexToRgba(itemContrast, 0.5) }}>Описание</h3>
                    <p className="text-[14px] font-medium leading-relaxed" style={{ color: hexToRgba(itemContrast, 0.7) }}>{selectedItem.desc}</p>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 w-full z-20 pointer-events-none px-4 pb-5 pt-8">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#09090B]/60 to-transparent pointer-events-none" />
                  <div className="relative w-full p-4 rounded-[28px] shadow-2xl liquid-glass pointer-events-auto" style={{ border: '1px solid rgba(255,255,255,0.2)', backgroundColor: hexToRgba(itemColor, 0.1) }}>
                    <div className="flex gap-4 items-center px-1">
                      <div className="text-3xl font-black flex-1" style={{ color: itemContrast }}>{selectedItem.price} ₽</div>
                      <div className="h-[56px] flex items-center justify-end" style={{ minWidth: '180px' }}>
                        {(selectedItem.origin === 'archive' || selectedItem.origin === 'soon') ? (
                          <div className="py-4 px-10 rounded-[20px] font-black text-[14px] liquid-glass" style={{ color: hexToRgba(itemContrast, 0.7), backgroundColor: hexToRgba(itemContrast, 0.08), border: `1px solid ${hexToRgba(itemContrast, 0.18)}`, cursor: 'default' }}>
                            {selectedItem.origin === 'archive' ? 'ЗАКОНЧИЛОСЬ' : 'СКОРО'}
                          </div>
                        ) : selectedItemQty === 0 ? (
                          <button onClick={() => updateCart(null, selectedItem, 1)} className="py-4 px-10 rounded-[20px] font-black text-[14px] active:scale-[0.96] liquid-glass" style={{ color: itemContrast, backgroundColor: hexToRgba(itemColor, 0.15), transition: 'transform 180ms cubic-bezier(0.23, 1, 0.32, 1), background-color 1000ms ease', animation: 'plus-fade 520ms cubic-bezier(0.23, 1, 0.32, 1)' }}>В КОРЗИНУ</button>
                        ) : (
                          <div className="flex items-center gap-4 rounded-full p-1 liquid-glass" style={{ backgroundColor: hexToRgba(itemColor, 0.15), animation: 'qty-pop 720ms cubic-bezier(0.23, 1, 0.32, 1)' }}>
                            <button onClick={() => updateCart(null, selectedItem, -1)} className="w-12 h-12 rounded-full flex items-center justify-center active:scale-[0.9]" style={{ backgroundColor: hexToRgba(itemColor, 0.2), transition: 'transform 160ms cubic-bezier(0.23, 1, 0.32, 1), background-color 1000ms ease' }}><Minus size={18} style={{ color: itemContrast }} /></button>
                            <span className="text-[18px] font-black w-6 text-center tabular-nums" style={{ color: itemContrast }}>{selectedItemQty}</span>
                            <button onClick={() => updateCart(null, selectedItem, 1)} className="w-12 h-12 rounded-full flex items-center justify-center active:scale-[0.9]" style={{ backgroundColor: hexToRgba(itemColor, 0.3), transition: 'transform 160ms cubic-bezier(0.23, 1, 0.32, 1), background-color 1000ms ease' }}>
                              <Plus size={18} style={{ color: itemContrast }} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {showOriginSheet && (
        <div className="fixed inset-0 z-[400] flex flex-col justify-end text-zinc-900">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => closeSheet('origin', setShowOriginSheet)} style={{ animation: closingSheet === 'origin' ? 'fade-out 200ms cubic-bezier(0.32, 0, 0.67, 0) forwards' : 'fade-in 0.3s ease-out' }} />
          <div className="relative flex flex-col h-[82vh]" style={{ animation: closingSheet === 'origin' ? 'slide-down-glass 220ms cubic-bezier(0.32, 0, 0.67, 0) forwards' : 'slide-up-glass 0.3s ease-out both' }}>
            <div className="relative w-full h-[20px] shrink-0 z-[5]" style={{ marginBottom: '-2px' }}>
              <HeaderWave className="absolute bottom-0 left-0" />
            </div>
            <div className="relative flex-1 foam-bg p-6 pb-12 overflow-hidden" style={{ animation: 'none' }}>
              <div className="absolute inset-0 pointer-events-none transition-colors duration-[1000ms]" style={{
                backgroundColor: targetAccentColor,
                WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.25) 25%, rgba(0,0,0,0.1) 55%, transparent 85%)',
                maskImage: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.25) 25%, rgba(0,0,0,0.1) 55%, transparent 85%)'
              }} />
              <FoamBubblesCanvas />
              <button type="button" aria-label="Закрыть выбор коллекции" onClick={() => closeSheet('origin', setShowOriginSheet)} className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center z-20 active:scale-90 liquid-glass"><X size={20} className="text-zinc-600" /></button>
              <h3 className="font-display text-[26px] font-black tracking-[-0.02em] mb-4 px-1 relative z-[5]">Коллекция</h3>
              <div className="relative z-[5]">
                {/* "Всё" — big solid full-width button */}
                {(() => {
                  const origin = ORIGINS[0];
                  const active = activeOrigin?.id === origin.id;
                  return (
                    <button onClick={() => handleFilterChange(setShowOriginSheet, () => setActiveOrigin(origin))}
                      className={`flex items-center gap-3 p-4 rounded-[20px] text-left w-full mb-2.5 ${active ? 'shadow-sm' : 'liquid-glass'}`}
                      style={active ? { backgroundColor: hexToRgba(targetAccentColor, 0.35), border: `1px solid ${hexToRgba(targetAccentColor, 0.5)}` } : { backgroundColor: hexToRgba(targetAccentColor, 0.15) }}>
                      <div className="w-10 h-10 rounded-[14px] flex items-center justify-center shrink-0" style={{
                        background: 'rgba(255,255,255,0.08)',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.1)'
                      }}>
                        {origin.icon && <origin.icon size={20} className="text-white drop-shadow-sm" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`font-black text-[13px] block ${active ? 'text-zinc-900' : 'text-zinc-600'}`}>Всё</span>
                        <span className={`text-[9px] font-medium block mt-0.5 ${active ? 'text-zinc-900/60' : 'text-zinc-600/60'}`}>Все позиции каталога</span>
                      </div>
                    </button>
                  );
                })()}
                {/* Rest in 2-col grid — same style as Style sheet groups, no color circles */}
                <div className="grid grid-cols-2 gap-2.5 auto-rows-fr">
                  {ORIGINS.slice(1).map(origin => {
                    const active = activeOrigin?.id === origin.id;
                    return (
                      <button key={origin.id} onClick={() => handleFilterChange(setShowOriginSheet, () => setActiveOrigin(origin))}
                        className={`flex items-center gap-3 p-4 rounded-[20px] text-left h-full min-h-[72px] ${active ? 'shadow-sm' : 'liquid-glass'}`}
                        style={active ? { backgroundColor: hexToRgba(targetAccentColor, 0.35), border: `1px solid ${hexToRgba(targetAccentColor, 0.5)}` } : { backgroundColor: hexToRgba(targetAccentColor, 0.15) }}>
                        <div className="w-10 h-10 rounded-[14px] flex items-center justify-center shrink-0" style={{
                          background: 'rgba(255,255,255,0.08)',
                          backdropFilter: 'blur(8px)',
                          WebkitBackdropFilter: 'blur(8px)',
                          border: '1px solid rgba(255,255,255,0.15)',
                          boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.1)'
                        }}>
                          {origin.icon && <origin.icon size={20} className="text-white drop-shadow-sm" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className={`font-black text-[11px] block truncate ${active ? 'text-zinc-900' : 'text-zinc-600'}`}>{origin.name}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCategorySheet && !isStyleFilterDisabled && (
        <div className="fixed inset-0 z-[400] flex flex-col justify-end text-zinc-900">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => closeSheet('category', setShowCategorySheet)} style={{ animation: closingSheet === 'category' ? 'fade-out 200ms cubic-bezier(0.32, 0, 0.67, 0) forwards' : 'fade-in 0.3s ease-out' }} />
          <div className="relative flex flex-col h-[82vh]" style={{ animation: closingSheet === 'category' ? 'slide-down-glass 220ms cubic-bezier(0.32, 0, 0.67, 0) forwards' : 'slide-up-glass 0.3s ease-out both' }}>
            {/* Wave — same as collection sheet */}
            <div className="relative w-full h-[20px] shrink-0 z-[5]" style={{ marginBottom: '-2px' }}>
              <HeaderWave className="absolute bottom-0 left-0" />
            </div>
            <div className="relative flex-1 foam-bg p-6 pb-12 overflow-hidden" style={{ animation: 'none' }}>
              <div className="absolute inset-0 pointer-events-none transition-colors duration-[1000ms]" style={{
                backgroundColor: targetAccentColor,
                WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.25) 25%, rgba(0,0,0,0.1) 55%, transparent 85%)',
                maskImage: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.25) 25%, rgba(0,0,0,0.1) 55%, transparent 85%)'
              }} />
              <FoamBubblesCanvas />
              <button type="button" aria-label="Закрыть выбор стиля" onClick={() => closeSheet('category', setShowCategorySheet)} className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center z-20 active:scale-90 liquid-glass"><X size={20} className="text-zinc-600" /></button>
              <h3 className="font-display text-[26px] font-black tracking-[-0.02em] mb-4 px-1 relative z-[5]">Стиль</h3>
              <div className="grid grid-cols-2 gap-2.5 relative z-[5] auto-rows-fr">
                {/* Любой стиль — static color like other groups */}
                <button onClick={() => handleFilterChange(setShowCategorySheet, () => setActiveCategory(ALL_CATEGORIES[0]))}
                  className={`flex items-center gap-2.5 px-3 py-4 rounded-[20px] text-left h-full min-h-[76px] overflow-hidden ${activeCategory.id === 'all_styles' ? 'shadow-sm' : 'liquid-glass'}`}
                  style={activeCategory.id === 'all_styles' ? { backgroundColor: hexToRgba(ALL_CATEGORIES[0].color, 0.35), border: `1px solid ${hexToRgba(ALL_CATEGORIES[0].color, 0.5)}` } : { backgroundColor: hexToRgba(targetAccentColor, 0.15) }}>
                  <div className="w-5 h-5 rounded-full shrink-0 shadow-sm border border-black/10" style={{ backgroundColor: ALL_CATEGORIES[0].color }} />
                  <div className="flex-1 min-w-0">
                    <span className={`font-black text-[11px] block truncate ${activeCategory.id === 'all_styles' ? 'text-zinc-900' : 'text-zinc-600'}`}>Любой</span>
                    <span className={`text-[9px] font-medium block mt-0.5 line-clamp-2 ${activeCategory.id === 'all_styles' ? 'text-zinc-900/60' : 'text-zinc-600/60'}`}>Все стили пива</span>
                  </div>
                </button>
                {/* Groups */}
                {CATEGORY_GROUPS.map(group => {
                  const groupCategoryId = `group:${group.group}`;
                  const groupActive = activeCategory.id === groupCategoryId || group.items.some(c => c.id === activeCategory.id);
                  return (
                    <button key={group.group} onClick={() => handleFilterChange(setShowCategorySheet, () => setActiveCategory(createGroupCategory(group)))}
                      className={`flex items-center gap-2.5 px-3 py-4 rounded-[20px] text-left h-full min-h-[76px] overflow-hidden ${groupActive ? 'shadow-sm' : 'liquid-glass'}`}
                      style={groupActive ? { backgroundColor: hexToRgba(group.color, 0.35), border: `1px solid ${hexToRgba(group.color, 0.5)}` } : { backgroundColor: hexToRgba(targetAccentColor, 0.15) }}>
                      <div className="w-5 h-5 rounded-full shrink-0 shadow-sm border border-black/10" style={{ backgroundColor: group.color }} />
                      <div className="flex-1 min-w-0">
                        <span className={`font-black text-[11px] block truncate ${groupActive ? 'text-zinc-900' : 'text-zinc-600'}`}>{group.group}</span>
                        <span className={`text-[9px] font-medium block mt-0.5 line-clamp-2 ${groupActive ? 'text-zinc-900/60' : 'text-zinc-600/60'}`}>{group.items.map(c => c.name).join(' / ')}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {showLocationSheet && (
        <div className="fixed inset-0 z-[400] flex flex-col justify-end text-zinc-900">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => closeSheet('location', setShowLocationSheet)} style={{ animation: closingSheet === 'location' ? 'fade-out 200ms cubic-bezier(0.32, 0, 0.67, 0) forwards' : 'fade-in 280ms cubic-bezier(0.23, 1, 0.32, 1)' }} />
          <div className="relative flex flex-col max-h-[85vh]" style={{ animation: closingSheet === 'location' ? 'slide-down-glass 220ms cubic-bezier(0.32, 0, 0.67, 0) forwards' : 'slide-up-glass 340ms cubic-bezier(0.32, 0.72, 0, 1) both' }}>
            <div className="relative w-full h-[20px] shrink-0 z-[5]" style={{ marginBottom: '-2px' }}>
              <HeaderWave className="absolute bottom-0 left-0" />
            </div>
            <div className="relative foam-bg p-6 pb-12 flex flex-col overflow-hidden" style={{ animation: 'none' }}>
              <div className="absolute inset-0 pointer-events-none transition-colors duration-[1000ms]" style={{
                backgroundColor: targetAccentColor,
                WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.25) 25%, rgba(0,0,0,0.1) 55%, transparent 85%)',
                maskImage: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.25) 25%, rgba(0,0,0,0.1) 55%, transparent 85%)'
              }} />
              <FoamBubblesCanvas />
              <button type="button" aria-label="Закрыть выбор адреса" onClick={() => closeSheet('location', setShowLocationSheet)} className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center z-20 active:scale-90 liquid-glass"><X size={20} className="text-zinc-600" /></button>
              
              <div className="flex items-center gap-3 mb-6 relative z-[5]">
                <div className="w-12 h-12 rounded-full flex items-center justify-center liquid-glass" style={{ backgroundColor: hexToRgba(targetAccentColor, 0.25), borderColor: hexToRgba(targetAccentColor, 0.4), transition: 'background-color 1000ms ease, border-color 1000ms ease' }}>
                  <MapPin size={20} strokeWidth={2.5} style={{ color: targetAccentColor, transition: 'color 1000ms ease' }} />
                </div>
                <h3 className="font-display text-[26px] font-black tracking-[-0.02em]">Локация</h3>
              </div>
              
              <div className="flex flex-col gap-3 relative z-[5]">
                {LOCATIONS.map(loc => (
                  <button key={loc.id} onClick={() => { setActiveLocation(loc); closeSheet('location', setShowLocationSheet); }}
                    className={`flex flex-col items-start p-5 rounded-[20px] transition-all duration-1000 ${activeLocation.id === loc.id ? 'shadow-md' : 'liquid-glass shadow-sm'}`}
                    style={activeLocation.id === loc.id ? { backgroundColor: hexToRgba(targetAccentColor, 0.4), border: `1px solid ${hexToRgba(targetAccentColor, 0.6)}` } : { backgroundColor: hexToRgba(targetAccentColor, 0.15) }}>
                    <span className={`text-[9px] font-black uppercase tracking-widest mb-1 ${activeLocation.id === loc.id ? 'text-zinc-800' : 'text-zinc-500'}`}>{loc.area}</span>
                    <span className="font-black text-[18px] text-zinc-900">{loc.address}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

