import React from 'react';
import { Star, Plus, Minus } from 'lucide-react';
import { getVolumeLabel } from '../data/catalog.js';
import { hexToRgba } from '../utils/ui.js';
import { ItemImage } from './ItemImage.jsx';

const ProductCard = React.memo(function ProductCard({ item, qty, accentColor, onSelect, onUpdateCart, onBrewerySearch }) {
  const accentContrast = '#FFFFFF';
  const isArchive = item.origin === 'archive';
  const isSoon = item.origin === 'soon';
  const isOverlay = isArchive || isSoon;
  const overlayText = isArchive ? 'Закончилось' : (isSoon ? 'Скоро' : '');

  const easeOut = 'var(--ease-out, cubic-bezier(0.23, 1, 0.32, 1))';
  const easeInStrong = 'var(--ease-in-strong, cubic-bezier(0.32, 0, 0.67, 0))';
  const easeDrawer = 'var(--ease-drawer, cubic-bezier(0.32, 0.72, 0, 1))';

  const pressTransformTransition = `transform var(--motion-press, 160ms) ${easeOut}`;
  const glassColorTransition = [
    `background-color var(--motion-glass, 760ms) ${easeOut}`,
    `border-color var(--motion-glass, 760ms) ${easeOut}`,
    `box-shadow var(--motion-glass, 760ms) ${easeOut}`,
    `color var(--motion-glass, 760ms) ${easeOut}`,
  ].join(', ');

  const cardTransition = [
    pressTransformTransition,
    glassColorTransition,
    `opacity var(--motion-fade, 280ms) ${easeOut}`,
  ].join(', ');

  const pillTransition = [
    `width var(--motion-pill, 320ms) ${easeDrawer}`,
    `padding var(--motion-pill, 320ms) ${easeDrawer}`,
    glassColorTransition,
  ].join(', ');

  const plusEnterTransition = `opacity var(--motion-press, 160ms) ${easeOut} 120ms, transform var(--motion-content-in, 220ms) ${easeOut} 120ms`;
  const plusExitTransition = `opacity var(--motion-content-out, 100ms) ${easeInStrong}, transform var(--motion-content-shift, 140ms) ${easeInStrong}`;
  const counterEnterTransition = `opacity var(--motion-press, 160ms) ${easeOut} 110ms, transform var(--motion-content-in, 220ms) ${easeOut} 110ms`;
  const counterExitTransition = `opacity var(--motion-content-out, 100ms) ${easeInStrong}, transform var(--motion-content-shift, 140ms) ${easeInStrong}`;

  return (
    <div
      onClick={() => onSelect(item)}
      className="product-card-shell group relative w-full rounded-[24px] overflow-hidden liquid-glass cursor-pointer active:scale-[0.98] flex flex-col h-full"
      style={{ transition: cardTransition }}
    >
      {!item.isNotBeer && (
        <div className="flex items-center justify-between gap-2 px-3 pt-3 pb-1">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onBrewerySearch?.(item.brewery); }}
            className="product-card-brewery-button font-display px-2.5 py-1 rounded-[10px] text-[13px] font-bold leading-none truncate min-w-0 block active:scale-[0.94]"
            style={{
              color: '#18181B',
              border: `1px solid rgba(255,255,255,0.6)`,
              backgroundColor: 'rgba(255,255,255,0.55)',
              transition: `${pressTransformTransition}, ${glassColorTransition}`,
            }}
          >
            {item.brewery}
          </button>
          <div
            className="flex items-center gap-1 px-2.5 py-1 rounded-[10px] shrink-0"
            style={{
              border: `1px solid ${hexToRgba(accentContrast, 0.18)}`,
              backgroundColor: hexToRgba(accentContrast, 0.04),
            }}
          >
            <Star size={11} style={{ color: accentContrast, fill: accentContrast, opacity: 0.85 }} />
            <span className="font-display text-[13px] font-bold leading-none" style={{ color: hexToRgba(accentContrast, 0.9) }}>
              {item.rating}
            </span>
          </div>
        </div>
      )}

      <div className="relative flex items-center justify-center h-[130px] pt-1">
        <ItemImage item={item} className="product-card-image w-auto h-[110px] drop-shadow-[0_6px_12px_rgba(0,0,0,0.2)] group-hover:scale-105" />
        {isOverlay && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div
              className="product-card-overlay-badge font-display font-black text-[14px] px-5 py-2.5 rounded-[16px] border border-white/70 tracking-[-0.01em] uppercase"
              style={{
                backgroundColor: 'rgba(255,255,255,0.35)',
                color: '#18181b',
                backdropFilter: 'blur(28px) saturate(1.4)',
                WebkitBackdropFilter: 'blur(28px) saturate(1.4)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.18), inset 0 1px 1px rgba(255,255,255,0.6)',
                transition: `${glassColorTransition}, opacity var(--motion-fade, 280ms) ${easeOut}`,
              }}
            >
              {overlayText}
            </div>
          </div>
        )}
      </div>

      <div className="p-3 pt-1.5 flex-1 flex flex-col">
        <h3 className="font-display text-[18px] font-black leading-[1.1] line-clamp-2 mb-2 tracking-[-0.01em]" style={{ color: accentContrast }}>
          {item.name}
        </h3>
        {!item.isNotBeer && (
          <div className="flex flex-wrap gap-1 mb-2.5">
            <span className="font-display px-2 py-0.5 rounded-full text-[11px] font-black" style={{ backgroundColor: 'rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.9)', border: '1px solid rgba(255,255,255,0.25)' }}>
              {getVolumeLabel(item)}
            </span>
            <span className="font-display px-2 py-0.5 rounded-full text-[11px] font-black" style={{ backgroundColor: 'rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.9)', border: '1px solid rgba(255,255,255,0.25)' }}>
              {item.abv}% ABV
            </span>
            <span className="font-display px-2 py-0.5 rounded-full text-[11px] font-black" style={{ backgroundColor: 'rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.9)', border: '1px solid rgba(255,255,255,0.25)' }}>
              {item.og}% OG
            </span>
            {item.ibu > 0 && (
              <span className="font-display px-2 py-0.5 rounded-full text-[11px] font-black" style={{ backgroundColor: 'rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.9)', border: '1px solid rgba(255,255,255,0.25)' }}>
                {item.ibu} IBU
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-auto pt-2">
          <div className="flex flex-col justify-center">
            {item.isPromo && item.oldPrice && (
              <span className="font-bold text-[11px] line-through opacity-60 mb-0.5" style={{ color: accentContrast }}>
                {item.oldPrice} ₽
              </span>
            )}
            <span className="font-black text-[16px] leading-none" style={{ color: accentContrast }}>
              {item.price} ₽
            </span>
          </div>

          {isOverlay ? (
            <div className="h-8 flex items-center justify-end shrink-0">
              <div
                className="product-card-pill rounded-full liquid-glass flex items-center justify-center px-3"
                style={{
                  height: '32px',
                  backgroundColor: hexToRgba(accentContrast, 0.08),
                  border: `1px solid ${hexToRgba(accentContrast, 0.18)}`,
                  cursor: 'default',
                  transition: glassColorTransition,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <span className="font-display font-black text-[10px] uppercase tracking-wide leading-none" style={{ color: hexToRgba(accentContrast, 0.7) }}>
                  {overlayText}
                </span>
              </div>
            </div>
          ) : (
            <div className="h-8 flex items-center justify-end shrink-0" style={{ minWidth: '76px' }}>
              <div
                className="product-card-pill rounded-full liquid-glass overflow-hidden cursor-pointer"
                style={{
                  transition: pillTransition,
                  width: qty === 0 ? '32px' : '78px',
                  height: '32px',
                  padding: qty === 0 ? '0px' : '2px',
                  backgroundColor: qty === 0 ? hexToRgba(accentColor, 0.15) : 'transparent',
                }}
                onClick={(e) => {
                  if (qty === 0) onUpdateCart(e, item, 1);
                  else e.stopPropagation();
                }}
              >
                <div className="relative w-full h-full flex items-center justify-center">
                  <div
                    className="product-card-plus-content absolute inset-0 flex items-center justify-center"
                    style={{
                      opacity: qty === 0 ? 1 : 0,
                      transform: qty === 0 ? 'scale(1)' : 'scale(0.55)',
                      pointerEvents: qty === 0 ? 'auto' : 'none',
                      transition: qty === 0 ? plusEnterTransition : plusExitTransition,
                    }}
                  >
                    <Plus size={16} strokeWidth={2.5} style={{ color: accentContrast }} />
                  </div>

                  <div
                    className="product-card-counter-content absolute inset-0 flex items-center justify-between px-0.5"
                    style={{
                      opacity: qty > 0 ? 1 : 0,
                      transform: qty > 0 ? 'scale(1)' : 'scale(0.92)',
                      pointerEvents: qty > 0 ? 'auto' : 'none',
                      transition: qty > 0 ? counterEnterTransition : counterExitTransition,
                    }}
                  >
                    <button
                      onClick={(e) => { e.stopPropagation(); onUpdateCart(e, item, -1); }}
                      className="product-card-counter-button w-[22px] h-[22px] rounded-full flex items-center justify-center active:scale-[0.88] shrink-0"
                      style={{
                        backgroundColor: hexToRgba(accentContrast, 0.14),
                        border: `1px solid ${hexToRgba(accentContrast, 0.32)}`,
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35)',
                        transition: `${pressTransformTransition}, ${glassColorTransition}`,
                      }}
                    >
                      <Minus size={11} strokeWidth={3.25} style={{ color: accentContrast }} />
                    </button>
                    <span className="text-[12px] font-black w-4 text-center tabular-nums" style={{ color: accentContrast }}>
                      {qty}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); onUpdateCart(e, item, 1); }}
                      className="product-card-counter-button w-[22px] h-[22px] rounded-full flex items-center justify-center active:scale-[0.88] shrink-0"
                      style={{
                        backgroundColor: hexToRgba(accentContrast, 0.14),
                        border: `1px solid ${hexToRgba(accentContrast, 0.32)}`,
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35)',
                        transition: `${pressTransformTransition}, ${glassColorTransition}`,
                      }}
                    >
                      <Plus size={11} strokeWidth={3.25} style={{ color: accentContrast }} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default ProductCard;
