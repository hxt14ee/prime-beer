export const getContrastYIQ = (hexcolor) => {
  if (!hexcolor) return '#18181B';
  const r = parseInt(hexcolor.slice(1, 3), 16);
  const g = parseInt(hexcolor.slice(3, 5), 16);
  const b = parseInt(hexcolor.slice(5, 7), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 140) ? '#000000' : '#FFFFFF';
};

export const hexToRgba = (hex, alpha = 1) => {
  if (!hex) return `rgba(0,0,0,${alpha})`;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

export const HEADER_WAVE_CYCLE_MS = 6000;
export const INITIAL_HEADER_WAVE_DELAY = typeof performance !== 'undefined'
  ? `-${Math.round(performance.now()) % HEADER_WAVE_CYCLE_MS}ms`
  : '0ms';
