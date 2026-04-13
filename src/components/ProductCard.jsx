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

  // Entrance animations are driven by the parent grid's `.cards-grid-settling`
  // class (stagger + blur + overshoot via the card-fly-in keyframe). Using an
  // inline `animation` style here would override the class selector and lock
  // cards into the old float-up path — so we deliberately don't set one.

  return (
    <div onClick={() => onSelect(item)}
      className="group relative w-full rounded-[24px] overflow-hidden transition-transform liquid-glass cursor-pointer active:scale-[0.98] flex flex-col h-full">

      {!item.isNotBeer && (
        <div className="flex items-center justify-between gap-2 px-3 pt-3 pb-1">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onBrewerySearch?.(item.brewery); }}
            className="font-display px-2.5 py-1 rounded-[10px] text-[13px] font-bold leading-none truncate min-w-0 block active:scale-[0.94] transition-transform"
            style={{ color: '#18181B', border: `1px solid rgba(255,255,255,0.6)`, backgroundColor: 'rgba(255,255,255,0.55)' }}
          >{item.brewery}</button>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-[10px] shrink-0" style={{ border: `1px solid ${hexToRgba(accentContrast, 0.18)}`, backgroundColor: hexToRgba(accentContrast, 0.04) }}>
            <Star size={11} style={{ color: accentContrast, fill: accentContrast, opacity: 0.85 }} />
            <span className="font-display text-[13px] font-bold leading-none" style={{ color: hexToRgba(accentContrast, 0.9) }}>{item.rating}</span>
          </div>
        </div>
      )}
      <div className="relative flex items-center justify-center h-[130px] pt-1">
        <ItemImage item={item} className="w-auto h-[110px] drop-shadow-[0_6px_12px_rgba(0,0,0,0.2)] transition-transform duration-500 group-hover:scale-105" />
        {isOverlay && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div className="font-display font-black text-[14px] px-5 py-2.5 rounded-[16px] border border-white/70 tracking-[-0.01em] uppercase" style={{
              backgroundColor: 'rgba(255,255,255,0.35)',
              color: '#18181b',
              backdropFilter: 'blur(28px) saturate(1.4)',
              WebkitBackdropFilter: 'blur(28px) saturate(1.4)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.18), inset 0 1px 1px rgba(255,255,255,0.6)'
            }}>
              {overlayText}
            </div>
          </div>
        )}
      </div>
      <div className="p-3 pt-1.5 flex-1 flex flex-col">
        <h3 className="font-display text-[18px] font-black leading-[1.1] line-clamp-2 mb-2 tracking-[-0.01em]" style={{ color: accentContrast }}>{item.name}</h3>
        {!item.isNotBeer && (
          <div className="flex flex-wrap gap-1 mb-2.5">
            <span className="font-display px-2 py-0.5 rounded-full text-[11px] font-black" style={{ backgroundColor: 'rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.9)', border: `1px solid rgba(255,255,255,0.25)` }}>{getVolumeLabel(item)}</span>
            <span className="font-display px-2 py-0.5 rounded-full text-[11px] font-black" style={{ backgroundColor: 'rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.9)', border: `1px solid rgba(255,255,255,0.25)` }}>{item.abv}% ABV</span>
            <span className="font-display px-2 py-0.5 rounded-full text-[11px] font-black" style={{ backgroundColor: 'rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.9)', border: `1px solid rgba(255,255,255,0.25)` }}>{item.og}% OG</span>
            {item.ibu > 0 && <span className="font-display px-2 py-0.5 rounded-full text-[11px] font-black" style={{ backgroundColor: 'rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.9)', border: `1px solid rgba(255,255,255,0.25)` }}>{item.ibu} IBU</span>}
          </div>
        )}
        <div className="flex items-center justify-between mt-auto pt-2">
          <div className="flex flex-col justify-center">
            {item.isPromo && item.oldPrice && (
              <span className="font-bold text-[11px] line-through opacity-60 mb-0.5" style={{ color: accentContrast }}>{item.oldPrice} ₽</span>
            )}
            <span className="font-black text-[16px] leading-none" style={{ color: accentContrast }}>{item.price} ₽</span>
          </div>
          {isOverlay ? (
            <div className="h-8 flex items-center justify-end shrink-0">
              <div className="rounded-full liquid-glass flex items-center justify-center px-3"
                   style={{ height: '32px', backgroundColor: hexToRgba(accentContrast, 0.08), border: `1px solid ${hexToRgba(accentContrast, 0.18)}`, cursor: 'default' }}
                   onClick={(e) => e.stopPropagation()}>
                <span className="font-display font-black text-[10px] uppercase tracking-wide leading-none" style={{ color: hexToRgba(accentContrast, 0.7) }}>{overlayText}</span>
              </div>
            </div>
          ) : (
            <div className="h-8 flex items-center justify-end shrink-0" style={{ minWidth: '76px' }}>
              {/* Pill: animate ONLY width + padding + background. Both enter (0→1)
                  and exit (1→0) run the same 520ms curve so add and remove feel
                  equally deliberate — no snap-release.  Smaller collapsed width
                  (78px instead of 92px) keeps long prices like "1050 ₽" on one line. */}
              <div className="rounded-full liquid-glass overflow-hidden cursor-pointer"
                   style={{
                     transition: 'width 520ms cubic-bezier(0.32, 0.72, 0, 1), padding 520ms cubic-bezier(0.32, 0.72, 0, 1), background-color 1400ms ease',
                     width: qty === 0 ? '32px' : '78px',
                     height: '32px',
                     padding: qty === 0 ? '0px' : '2px',
                     backgroundColor: qty === 0 ? hexToRgba(accentColor, 0.15) : 'transparent',
                   }}
                   onClick={(e) => {
                     if (qty === 0) onUpdateCart(e, item, 1);
                     else e.stopPropagation();
                   }}>

                <div className="relative w-full h-full flex items-center justify-center">
                  {/* Plus icon. On EXIT (pill is growing for an add) it fades
                      out fast so the counter can take over. On ENTER (pill is
                      shrinking back after a remove) it fades back in AFTER the
                      pill has fully closed — mirror of the counter's delay. */}
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{
                      opacity: qty === 0 ? 1 : 0,
                      transform: qty === 0 ? 'scale(1)' : 'scale(0.55)',
                      pointerEvents: qty === 0 ? 'auto' : 'none',
                      transition: qty === 0
                        ? 'opacity 260ms cubic-bezier(0.23, 1, 0.32, 1) 320ms, transform 360ms cubic-bezier(0.34, 1.56, 0.64, 1) 320ms'
                        : 'opacity 140ms cubic-bezier(0.32, 0, 0.67, 0), transform 180ms cubic-bezier(0.32, 0, 0.67, 0)',
                    }}
                  >
                    <Plus size={16} strokeWidth={2.5} style={{ color: accentContrast }} />
                  </div>

                  {/* Counter for qty > 0. Both directions use a symmetric delay
                      pattern so add and remove look like mirror images of the
                      same animation — pill opens/closes then content fades. */}
                  <div
                    className="absolute inset-0 flex items-center justify-between px-0.5"
                    style={{
                      opacity: qty > 0 ? 1 : 0,
                      transform: qty > 0 ? 'scale(1)' : 'scale(0.92)',
                      pointerEvents: qty > 0 ? 'auto' : 'none',
                      transition: qty > 0
                        ? 'opacity 260ms cubic-bezier(0.23, 1, 0.32, 1) 320ms, transform 360ms cubic-bezier(0.34, 1.56, 0.64, 1) 320ms'
                        : 'opacity 140ms cubic-bezier(0.32, 0, 0.67, 0), transform 180ms cubic-bezier(0.32, 0, 0.67, 0)',
                    }}
                  >
                    <button
                      onClick={(e) => { e.stopPropagation(); onUpdateCart(e, item, -1); }}
                      className="w-[22px] h-[22px] rounded-full flex items-center justify-center active:scale-[0.88] shrink-0"
                      style={{
                        backgroundColor: hexToRgba(accentContrast, 0.14),
                        border: `1px solid ${hexToRgba(accentContrast, 0.32)}`,
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35)',
                        transition: 'transform 160ms cubic-bezier(0.23, 1, 0.32, 1)',
                      }}
                    ><Minus size={11} strokeWidth={3.25} style={{ color: accentContrast }} /></button>
                    <span className="text-[12px] font-black w-4 text-center tabular-nums" style={{ color: accentContrast }}>{qty}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); onUpdateCart(e, item, 1); }}
                      className="w-[22px] h-[22px] rounded-full flex items-center justify-center active:scale-[0.88] shrink-0"
                      style={{
                        backgroundColor: hexToRgba(accentContrast, 0.14),
                        border: `1px solid ${hexToRgba(accentContrast, 0.32)}`,
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35)',
                        transition: 'transform 160ms cubic-bezier(0.23, 1, 0.32, 1)',
                      }}
                    ><Plus size={11} strokeWidth={3.25} style={{ color: accentContrast }} /></button>
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
