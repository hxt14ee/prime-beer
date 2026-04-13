import React from 'react';
import { hexToRgba } from '../utils/ui.js';

export const PrimeMark = React.memo(function PrimeMark({
  size = 56,
  accentColor = '#D9B500',
  textColor,
  animated = false,
  read = false,
  glass = false,
  showOrbit = true,
  showPlate = true,
  className = '',
  ariaLabel,
  ...restProps
}) {
  const RootTag = typeof restProps.onClick === 'function' ? 'button' : 'div';
  const resolvedTextColor = textColor || accentColor;
  const plateSize = showOrbit ? Math.round(size * 0.72) : size;
  const fontSize = size <= 60 ? 13.4 : 19.5;
  const lineHeight = size <= 60 ? 0.82 : 0.86;
  const letterSpacing = size <= 60 ? '0.022em' : '0.028em';

  const plateStyle = glass
    ? {
        background: 'radial-gradient(circle at 30% 26%, rgba(255,255,255,0.48), rgba(255,255,255,0.20) 46%, rgba(255,255,255,0.08) 100%)',
        backdropFilter: 'blur(18px) saturate(1.2)',
        WebkitBackdropFilter: 'blur(18px) saturate(1.2)',
        border: '1px solid rgba(255,255,255,0.58)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.72), inset 0 -10px 18px rgba(255,255,255,0.08), 0 16px 34px rgba(120,80,20,0.14)'
      }
    : {
        background: 'linear-gradient(180deg, rgba(255,250,240,0.98) 0%, rgba(247,237,214,0.94) 100%)',
        border: '1px solid rgba(255,255,255,0.84)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.88), inset 0 -6px 14px rgba(217,168,61,0.14), 0 8px 18px rgba(120,80,20,0.12)'
      };

  return (
    <RootTag
      type={RootTag === 'button' ? 'button' : undefined}
      aria-label={ariaLabel}
      className={`relative rounded-full flex items-center justify-center ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        ...(RootTag === 'button'
          ? { padding: 0, border: 'none', background: 'transparent' }
          : null)
      }}
      {...restProps}
    >
      {showOrbit && (
        <>
          <div
            className="absolute inset-[3px] rounded-full pointer-events-none"
            style={{ border: `1.5px solid ${read ? 'rgba(161,161,170,0.5)' : hexToRgba(accentColor, 0.18)}` }}
          />
          {!read && (
            <div
              className={`absolute inset-[3px] rounded-full pointer-events-none ${animated ? 'animate-[spin_2.5s_linear_infinite]' : ''}`}
              style={{
                background: `conic-gradient(from -90deg, transparent 0deg 156deg, ${hexToRgba(accentColor, 0.2)} 204deg, ${hexToRgba(accentColor, 0.72)} 286deg, ${accentColor} 324deg, ${accentColor} 340deg, transparent 360deg)`,
                WebkitMaskImage: 'radial-gradient(farthest-side, transparent calc(100% - 2.5px), #000 calc(100% - 2.5px))',
                maskImage: 'radial-gradient(farthest-side, transparent calc(100% - 2.5px), #000 calc(100% - 2.5px))',
                filter: 'drop-shadow(0 0 7px rgba(0,0,0,0.08))'
              }}
            />
          )}
        </>
      )}

      <div
        className={`relative z-10 flex items-center justify-center ${showPlate ? 'rounded-full' : ''}`}
        style={showPlate ? { width: `${plateSize}px`, height: `${plateSize}px`, ...plateStyle } : undefined}
      >
        <div
          className="font-logo flex flex-col items-center"
          style={{
            color: resolvedTextColor,
            fontFamily: "'TD Ciryulnik', 'Russo One', sans-serif",
            fontSize: `${fontSize}px`,
            lineHeight,
            letterSpacing,
            transform: size <= 60 ? 'translateY(0.5px)' : 'translateY(1px)',
            textShadow: glass
              ? '0 1px 0 rgba(255,255,255,0.62), 0 6px 16px rgba(160,120,45,0.12)'
              : '0 1px 0 rgba(255,255,255,0.72), 0 3px 10px rgba(120,80,20,0.12)'
          }}
        >
          <span>ПРАЙМ</span>
          <span>БИР</span>
        </div>
      </div>
    </RootTag>
  );
});
