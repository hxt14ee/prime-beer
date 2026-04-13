import React from 'react';
import { Package } from 'lucide-react';

export const ItemImage = React.memo(function ItemImage({ item, className }) {
  if (item.isNotBeer) return <Package size={48} className={`text-white/80 drop-shadow-lg ${className}`} />;
  // All beer uses the same bottle PNG (no background) вЂ” served from /public
  return <img src="/bottle.png" alt={item.name} className={className} style={{ objectFit: 'contain' }} draggable={false} />;
});

// Р›РёС‚СЂР°Р¶: в€ћ РґР»СЏ РєСЂР°РЅР°, 0.33 РґР»СЏ РёРјРїРѕСЂС‚Р°/РєСЂРµРїРєРѕРіРѕ, 0.5 вЂ” СЃС‚Р°РЅРґР°СЂС‚, 0.7 вЂ” barleywine/BA/RIS

