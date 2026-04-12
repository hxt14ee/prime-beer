import React, { useState, useEffect, useRef, useMemo, useCallback, startTransition } from 'react';
import { createPortal, flushSync } from 'react-dom';
import {
  Search, Star, X, Flame, Droplets, ChevronDown, ChevronUp, ShieldCheck, Check,
  Globe, MapPin, Zap, Plus, Minus, Truck, CalendarCheck, Package, Beer,
  Trash2, Users, Archive, Clock3, Sparkles
} from 'lucide-react';

// =======================
// 1. УТИЛИТЫ И КОНФИГИ ЦВЕТОВ
// =======================
const getContrastYIQ = (hexcolor) => {
  if (!hexcolor) return '#18181B';
  const r = parseInt(hexcolor.slice(1, 3), 16);
  const g = parseInt(hexcolor.slice(3, 5), 16);
  const b = parseInt(hexcolor.slice(5, 7), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 140) ? '#000000' : '#FFFFFF';
};

const hexToRgba = (hex, alpha = 1) => {
  if (!hex) return `rgba(0,0,0,${alpha})`;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

const LOCATIONS = [
  { id: 'push', address: 'Пушкинская, 11Б', area: 'ЦЕНТР' },
  { id: 'holz', address: 'Хользунова, 10Б', area: 'СЕВЕРНЫЙ' }
];

const ORIGINS = [
  { id: 'all', name: 'Всё', icon: Beer },
  { id: 'ru', name: 'Россия', icon: MapPin },
  { id: 'promo', name: 'Акции', icon: Zap },
  { id: 'import', name: 'Импорт', icon: Globe },
  { id: 'collab', name: 'Коллаборации', icon: Users },
  { id: 'tap', name: 'На кране', icon: Droplets },
  { id: 'soon', name: 'Скоро', icon: Clock3 },
  { id: 'not_beer', name: 'Не пиво', icon: Package },
  { id: 'archive', name: 'Архив', icon: Archive }
];

const CATEGORY_GROUPS = [
  {
    group: 'КЛАССИКА', color: '#e0a526', items: [
      { id: 'lager', name: 'Lager / Pilsner', color: '#e0a526' },
      { id: 'wheat', name: 'Wheat / Weisse', color: '#e0a526' },
      { id: 'pale', name: 'Pale Ale / Blonde', color: '#e0a526' },
    ]
  },
  {
    group: 'ОХМЕЛЕННОЕ', color: '#d87706', items: [
      { id: 'ipa', name: 'IPA / DIPA', color: '#d87706' },
      { id: 'neipa', name: 'NEIPA / Hazy', color: '#d87706' },
      { id: 'apa', name: 'APA / Session', color: '#d87706' },
    ]
  },
  {
    group: 'ТЕМНОЕ', color: '#3b2218', items: [
      { id: 'stout', name: 'Stout / Porter', color: '#3b2218' },
      { id: 'pastry_stout', name: 'Pastry Stout', color: '#3b2218' },
      { id: 'dark', name: 'Dark / Brown / Amber', color: '#3b2218' },
    ]
  },
  {
    group: 'КРЕПКОЕ И ВЫДЕРЖАННОЕ', color: '#6b3a1f', items: [
      { id: 'ris', name: 'Imperial Stout (RIS)', color: '#6b3a1f' },
      { id: 'barleywine', name: 'Barleywine / Strong Ale', color: '#6b3a1f' },
      { id: 'barrel_aged', name: 'Barrel Aged (BA)', color: '#6b3a1f' },
    ]
  },
  {
    group: 'БЕЛЬГИЯ И ФЕРМЕРСКИЕ', color: '#c2820e', items: [
      { id: 'belgian', name: 'Belgian Ale', color: '#c2820e' },
      { id: 'saison', name: 'Saison / Farmhouse', color: '#c2820e' },
    ]
  },
  {
    group: 'КИСЛОЕ И ДИКОЕ', color: '#ad173c', items: [
      { id: 'sour', name: 'Sour Ale', color: '#ad173c' },
      { id: 'smoothie', name: 'Smoothie Sour', color: '#ad173c' },
      { id: 'wild', name: 'Wild / Lambic', color: '#ad173c' },
    ]
  },
  {
    group: 'СОЛЁНЫЕ И ГАСТРО', color: '#c43030', items: [
      { id: 'gose', name: 'Classic Gose', color: '#c43030' },
      { id: 'tomato_gose', name: 'Tomato Gose', color: '#c43030' },
      { id: 'culinary', name: 'Culinary / Soup', color: '#c43030' },
    ]
  },
  {
    group: 'АЛЬТЕРНАТИВА', color: '#5a8c2a', items: [
      { id: 'cider', name: 'Cider / Perry', color: '#5a8c2a' },
      { id: 'mead', name: 'Mead / Melomel', color: '#5a8c2a' },
      { id: 'fruit_beer', name: 'Fruit Beer / Hard Seltzer', color: '#5a8c2a' },
    ]
  },
  {
    group: 'БЕЗАЛКОГОЛЬНОЕ', color: '#2d6cb4', items: [
      { id: 'na', name: 'N/A Beer', color: '#2d6cb4' },
      { id: 'na_alt', name: 'N/A Alternative', color: '#2d6cb4' },
    ]
  },
];
const ALL_CATEGORIES = [{ id: 'all_styles', name: 'Любой стиль', color: '#FDE047' }, ...CATEGORY_GROUPS.flatMap(g => g.items)];
const CATEGORIES = ALL_CATEGORIES;

// =======================
// 2. БАЗА ДАННЫХ
// =======================
const MOCK_ITEMS = [
  { id: 1, name: 'West Coast Life', brewery: "Salden's", type: 'ipa', origin: 'ru', onTap: true, isPromo: false, isNotBeer: false, abv: 7.5, ibu: 60, og: 16.5, price: 340, rating: 4.6, image: '', desc: 'Олдскульный West Coast IPA. Мощная хвойно-смолистая горечь и цитрусы.', nutrition: { kcal: 55, p: 0.5, f: 0, c: 4.5 } },
  { id: 2, name: 'Атомная Прачечная', brewery: 'Jaws', type: 'ipa', origin: 'ru', onTap: false, isPromo: false, isNotBeer: false, abv: 7.0, ibu: 101, og: 16, price: 320, rating: 4.8, image: '', desc: 'Легендарная уральская IPA.', nutrition: { kcal: 53, p: 0.6, f: 0, c: 4.0 } },
  { id: 3, name: 'Rupture', brewery: 'Zagovor', type: 'ipa', origin: 'ru', onTap: false, isPromo: true, isNotBeer: false, abv: 6.5, ibu: 40, og: 15, price: 380, rating: 4.7, image: '', desc: 'Классический мягкий IPA с двойным сухим охмелением Citra и Mosaic.', nutrition: { kcal: 50, p: 0.4, f: 0, c: 4.2 } },
  { id: 4, name: 'Punk IPA', brewery: 'BrewDog', type: 'ipa', origin: 'import', onTap: true, isPromo: false, isNotBeer: false, abv: 5.4, ibu: 35, og: 12.5, price: 450, rating: 4.5, image: '', desc: 'Шотландская классика.', nutrition: { kcal: 45, p: 0.5, f: 0, c: 3.8 } },
  { id: 5, name: 'Red Machine', brewery: 'Victory Art Brew', type: 'ipa', origin: 'ru', onTap: false, isPromo: false, isNotBeer: false, abv: 6.9, ibu: 65, og: 16, price: 310, rating: 4.6, image: '', desc: 'Сбалансированный индийский бледный эль.', nutrition: { kcal: 52, p: 0.5, f: 0, c: 4.3 } },
  { id: 6, name: 'Bowler IPA', brewery: 'Gletcher', type: 'ipa', origin: 'ru', onTap: false, isPromo: false, isNotBeer: false, abv: 6.1, ibu: 70, og: 14, price: 290, rating: 4.4, image: '', desc: 'Английский стиль. Цветочные и земляные оттенки хмеля.', nutrition: { kcal: 48, p: 0.4, f: 0, c: 3.9 } },
  { id: 7, name: 'Crazy Moose', brewery: 'Konix', type: 'ipa', origin: 'ru', onTap: false, isPromo: true, isNotBeer: false, abv: 5.5, ibu: 45, og: 13, price: 250, rating: 4.3, image: '', desc: 'Сессионный APA/IPA с легким телом.', nutrition: { kcal: 42, p: 0.3, f: 0, c: 3.5 } },
  { id: 8, name: '100 Рентген', brewery: 'Plan B', type: 'ipa', origin: 'ru', onTap: false, isPromo: false, isNotBeer: false, abv: 8.0, ibu: 80, og: 18, price: 350, rating: 4.7, image: '', desc: 'Двойной IPA (DIPA). Плотный, крепкий.', nutrition: { kcal: 65, p: 0.7, f: 0, c: 5.5 } },
  { id: 9, name: 'Lagunitas IPA', brewery: 'Lagunitas', type: 'ipa', origin: 'import', onTap: false, isPromo: false, isNotBeer: false, abv: 6.2, ibu: 51, og: 14.5, price: 420, rating: 4.5, image: '', desc: 'Калифорнийский крафт.', nutrition: { kcal: 50, p: 0.5, f: 0, c: 4.1 } },
  { id: 10, name: 'Space IPA', brewery: 'Gubaha', type: 'ipa', origin: 'ru', onTap: true, isPromo: true, isNotBeer: false, abv: 6.0, ibu: 50, og: 14, price: 270, rating: 4.2, image: '', desc: 'Питкий IPA на каждый день.', nutrition: { kcal: 46, p: 0.4, f: 0, c: 3.8 } },
  { id: 11, name: 'Синяя Гусеница', brewery: 'Таркос', type: 'neipa', origin: 'ru', onTap: true, isPromo: true, isNotBeer: false, abv: 6.6, ibu: 24, og: 15, price: 280, rating: 4.9, image: '', desc: 'Легендарный Vermont IPA.', nutrition: { kcal: 54, p: 0.5, f: 0, c: 4.6 } },
  { id: 12, name: 'Haze Machine', brewery: 'Zagovor', type: 'neipa', origin: 'ru', onTap: false, isPromo: false, isNotBeer: false, abv: 7.0, ibu: 30, og: 16, price: 420, rating: 4.9, image: '', desc: 'Эталонный New England.', nutrition: { kcal: 56, p: 0.6, f: 0, c: 4.8 } },
  { id: 13, name: 'Puzzle', brewery: 'Stamm', type: 'neipa', origin: 'ru', onTap: false, isPromo: false, isNotBeer: false, abv: 6.5, ibu: 20, og: 15.5, price: 360, rating: 4.7, image: '', desc: 'Монохоп на Citra.', nutrition: { kcal: 52, p: 0.5, f: 0, c: 4.5 } },
  { id: 14, name: 'Local Dealer', brewery: 'Big Village', type: 'neipa', origin: 'ru', onTap: false, isPromo: true, isNotBeer: false, abv: 8.0, ibu: 35, og: 18, price: 390, rating: 4.8, image: '', desc: 'Мощный Double NEIPA.', nutrition: { kcal: 68, p: 0.8, f: 0, c: 5.8 } },
  { id: 15, name: 'Juice & Juice', brewery: 'AF Brew', type: 'neipa', origin: 'ru', onTap: true, isPromo: false, isNotBeer: false, abv: 6.0, ibu: 15, og: 14, price: 350, rating: 4.6, image: '', desc: 'Максимально сочный пейл-эль.', nutrition: { kcal: 48, p: 0.4, f: 0, c: 4.2 } },
  { id: 16, name: 'Yellow Cab', brewery: 'Brouwerij', type: 'neipa', origin: 'import', onTap: false, isPromo: false, isNotBeer: false, abv: 5.5, ibu: 25, og: 13, price: 480, rating: 4.4, image: '', desc: 'Европейский Hazy IPA.', nutrition: { kcal: 44, p: 0.3, f: 0, c: 3.9 } },
  { id: 17, name: 'Magic Drop', brewery: 'Paradox', type: 'neipa', origin: 'ru', onTap: false, isPromo: false, isNotBeer: false, abv: 6.8, ibu: 28, og: 16, price: 330, rating: 4.5, image: '', desc: 'Galaxy и Sabro. Оттенки кокоса и персика.', nutrition: { kcal: 55, p: 0.5, f: 0, c: 4.6 } },
  { id: 18, name: 'Overhype', brewery: 'AF Brew', type: 'neipa', origin: 'ru', onTap: false, isPromo: false, isNotBeer: false, abv: 7.5, ibu: 40, og: 17, price: 450, rating: 4.8, image: '', desc: 'Переохмеленный мутный эль.', nutrition: { kcal: 62, p: 0.7, f: 0, c: 5.2 } },
  { id: 19, name: 'Neon', brewery: 'Bakunin', type: 'neipa', origin: 'ru', onTap: true, isPromo: true, isNotBeer: false, abv: 6.5, ibu: 30, og: 15, price: 290, rating: 4.3, image: '', desc: 'Мягкий мутный эль.', nutrition: { kcal: 50, p: 0.4, f: 0, c: 4.3 } },
  { id: 20, name: 'Cloudy Moscow', brewery: 'Zavod', type: 'neipa', origin: 'ru', onTap: false, isPromo: false, isNotBeer: false, abv: 6.2, ibu: 22, og: 14.5, price: 310, rating: 4.4, image: '', desc: 'Свежий и сочный IPA.', nutrition: { kcal: 49, p: 0.4, f: 0, c: 4.1 } },
  { id: 21, name: 'Guinness Draught', brewery: 'Guinness', type: 'stout', origin: 'import', onTap: true, isPromo: false, isNotBeer: false, abv: 4.2, ibu: 45, og: 10, price: 550, rating: 4.5, image: '', desc: 'Ирландский сухой стаут.', nutrition: { kcal: 35, p: 0.3, f: 0, c: 3.0 } },
  { id: 22, name: 'Lobotomy', brewery: 'AF Brew', type: 'stout', origin: 'ru', onTap: false, isPromo: false, isNotBeer: false, abv: 12.5, ibu: 50, og: 30, price: 1050, rating: 4.95, image: '', desc: 'Русский имперский стаут.', nutrition: { kcal: 95, p: 1.2, f: 0.5, c: 10.5 } },
  { id: 23, name: 'Milk Stout', brewery: "Salden's", type: 'stout', origin: 'ru', onTap: false, isPromo: true, isNotBeer: false, abv: 6.0, ibu: 25, og: 16, price: 320, rating: 4.6, image: '', desc: 'Молочный стаут с лактозой.', nutrition: { kcal: 58, p: 0.6, f: 0, c: 5.5 } },
  { id: 24, name: 'Раскольников', brewery: 'Craft Brew Riots', type: 'stout', origin: 'ru', onTap: false, isPromo: false, isNotBeer: false, abv: 9.5, ibu: 60, og: 22, price: 390, rating: 4.7, image: '', desc: 'Суровый имперский стаут.', nutrition: { kcal: 78, p: 0.9, f: 0, c: 7.2 } },
  { id: 25, name: 'Black Sails', brewery: 'Victory Art Brew', type: 'stout', origin: 'ru', onTap: true, isPromo: false, isNotBeer: false, abv: 6.0, ibu: 50, og: 15, price: 310, rating: 4.5, image: '', desc: 'Black IPA / Porter.', nutrition: { kcal: 50, p: 0.5, f: 0, c: 4.3 } },
  { id: 26, name: 'Достоевский', brewery: 'Brewlok', type: 'stout', origin: 'ru', onTap: false, isPromo: false, isNotBeer: false, abv: 10.0, ibu: 45, og: 24, price: 420, rating: 4.8, image: '', desc: 'Балтийский портер.', nutrition: { kcal: 82, p: 0.8, f: 0, c: 7.5 } },
  { id: 27, name: 'Дурачок', brewery: 'Jaws', type: 'stout', origin: 'ru', onTap: false, isPromo: true, isNotBeer: false, abv: 5.5, ibu: 30, og: 14, price: 280, rating: 4.4, image: '', desc: 'Овсяный стаут.', nutrition: { kcal: 48, p: 0.5, f: 0.2, c: 4.5 } },
  { id: 28, name: 'Eclipse', brewery: 'FiftyFifty', type: 'stout', origin: 'import', onTap: false, isPromo: false, isNotBeer: false, abv: 11.9, ibu: 40, og: 28, price: 1800, rating: 4.9, image: '', desc: 'Культовый имперский стаут.', nutrition: { kcal: 90, p: 1.0, f: 0, c: 9.0 } },
  { id: 29, name: 'Меланхолия', brewery: 'Bakunin', type: 'stout', origin: 'ru', onTap: false, isPromo: false, isNotBeer: false, abv: 10.5, ibu: 65, og: 25, price: 450, rating: 4.7, image: '', desc: 'Плотный балтийский портер.', nutrition: { kcal: 85, p: 0.9, f: 0, c: 8.0 } },
  { id: 30, name: 'Motor', brewery: 'Paradox', type: 'stout', origin: 'ru', onTap: true, isPromo: false, isNotBeer: false, abv: 7.0, ibu: 35, og: 17, price: 330, rating: 4.3, image: '', desc: 'Классический крепкий портер.', nutrition: { kcal: 58, p: 0.6, f: 0, c: 5.2 } },
  { id: 31, name: 'Доза', brewery: '4Brewers', type: 'sour', origin: 'ru', onTap: true, isPromo: false, isNotBeer: false, abv: 6.0, ibu: 0, og: 16, price: 340, rating: 4.8, image: '', desc: 'Густое смузи-саур.', nutrition: { kcal: 60, p: 0.5, f: 0, c: 8.5 } },
  { id: 32, name: 'Ищу Человека', brewery: 'Jaws', type: 'sour', origin: 'ru', onTap: false, isPromo: true, isNotBeer: false, abv: 5.65, ibu: 0, og: 13.5, price: 310, rating: 4.7, image: '', desc: 'Фландрийский красный эль.', nutrition: { kcal: 45, p: 0.4, f: 0, c: 4.2 } },
  { id: 33, name: 'Sour Flow', brewery: 'Panzer', type: 'sour', origin: 'ru', onTap: false, isPromo: false, isNotBeer: false, abv: 4.2, ibu: 10, og: 11, price: 290, rating: 4.5, image: '', desc: 'Саур с малиной и ежевикой.', nutrition: { kcal: 38, p: 0.3, f: 0, c: 4.0 } },
  { id: 34, name: 'Berry Blood', brewery: 'Zavod', type: 'sour', origin: 'ru', onTap: false, isPromo: false, isNotBeer: false, abv: 5.0, ibu: 0, og: 12, price: 320, rating: 4.6, image: '', desc: 'Кислая вишня и смородина.', nutrition: { kcal: 42, p: 0.4, f: 0, c: 4.5 } },
  { id: 35, name: 'Acid Reach', brewery: 'Stamm', type: 'sour', origin: 'ru', onTap: true, isPromo: false, isNotBeer: false, abv: 6.5, ibu: 0, og: 15, price: 380, rating: 4.8, image: '', desc: 'Мощный саур с персиком.', nutrition: { kcal: 55, p: 0.5, f: 0, c: 6.0 } },
  { id: 36, name: 'Love Memory', brewery: 'Zagovor', type: 'sour', origin: 'ru', onTap: false, isPromo: true, isNotBeer: false, abv: 5.5, ibu: 0, og: 14, price: 350, rating: 4.7, image: '', desc: 'Кисло-сладкий эль с клубникой.', nutrition: { kcal: 48, p: 0.4, f: 0, c: 5.5 } },
  { id: 37, name: 'Neon Fields', brewery: 'Paradox', type: 'sour', origin: 'ru', onTap: false, isPromo: false, isNotBeer: false, abv: 6.0, ibu: 0, og: 15, price: 360, rating: 4.6, image: '', desc: 'Смузи с маракуйей и гуавой.', nutrition: { kcal: 56, p: 0.5, f: 0, c: 7.0 } },
  { id: 38, name: 'Duchesse de Bourgogne', brewery: 'Verhaeghe', type: 'sour', origin: 'import', onTap: false, isPromo: false, isNotBeer: false, abv: 6.2, ibu: 11, og: 16, price: 650, rating: 4.9, image: '', desc: 'Бельгийская классика.', nutrition: { kcal: 50, p: 0.4, f: 0, c: 5.2 } },
  { id: 39, name: 'Passion', brewery: "Salden's", type: 'sour', origin: 'ru', onTap: false, isPromo: false, isNotBeer: false, abv: 5.0, ibu: 0, og: 13, price: 300, rating: 4.5, image: '', desc: 'Чистый кислый эль с маракуйей.', nutrition: { kcal: 44, p: 0.4, f: 0, c: 4.8 } },
  { id: 40, name: 'Crimson Flow', brewery: 'Panzer', type: 'sour', origin: 'ru', onTap: true, isPromo: true, isNotBeer: false, abv: 4.5, ibu: 10, og: 12, price: 270, rating: 4.3, image: '', desc: 'Летний саур с гранатом и вишней.', nutrition: { kcal: 40, p: 0.3, f: 0, c: 4.2 } },
  { id: 41, name: 'Зависимость', brewery: '4Brewers', type: 'gose', origin: 'ru', onTap: true, isPromo: false, isNotBeer: false, abv: 5.0, ibu: 0, og: 13, price: 320, rating: 4.8, image: '', desc: 'Знаменитое томатное гозе.', nutrition: { kcal: 46, p: 0.5, f: 0, c: 5.0 } },
  { id: 42, name: 'Salty Dog', brewery: 'Bakunin', type: 'gose', origin: 'ru', onTap: false, isPromo: false, isNotBeer: false, abv: 5.0, ibu: 10, og: 13, price: 290, rating: 4.5, image: '', desc: 'Классический лейпцигский гозе.', nutrition: { kcal: 40, p: 0.4, f: 0, c: 4.0 } },
  { id: 43, name: 'Чили Томат', brewery: 'Таркос', type: 'gose', origin: 'ru', onTap: false, isPromo: true, isNotBeer: false, abv: 4.5, ibu: 0, og: 12, price: 260, rating: 4.6, image: '', desc: 'Острая версия томатного гозе.', nutrition: { kcal: 42, p: 0.6, f: 0, c: 4.5 } },
  { id: 44, name: 'Pizza Boy', brewery: 'Zavod', type: 'gose', origin: 'ru', onTap: true, isPromo: false, isNotBeer: false, abv: 5.5, ibu: 0, og: 14, price: 340, rating: 4.7, image: '', desc: 'Гозе со вкусом пиццы Маргарита.', nutrition: { kcal: 48, p: 0.5, f: 0, c: 5.2 } },
  { id: 45, name: 'Bloody Mary', brewery: "Salden's", type: 'gose', origin: 'ru', onTap: false, isPromo: false, isNotBeer: false, abv: 5.0, ibu: 0, og: 13, price: 310, rating: 4.5, image: '', desc: 'Гозе с сельдереем и табаско.', nutrition: { kcal: 45, p: 0.5, f: 0, c: 5.0 } },
  { id: 46, name: 'Michelada', brewery: 'Panzer', type: 'gose', origin: 'ru', onTap: false, isPromo: true, isNotBeer: false, abv: 4.8, ibu: 0, og: 12.5, price: 300, rating: 4.6, image: '', desc: 'Мексиканский коктейль в гозе.', nutrition: { kcal: 43, p: 0.4, f: 0, c: 4.6 } },
  { id: 47, name: 'Gazpacho', brewery: 'Paradox', type: 'gose', origin: 'ru', onTap: true, isPromo: false, isNotBeer: false, abv: 5.5, ibu: 0, og: 14, price: 330, rating: 4.7, image: '', desc: 'Суп-гозе. Огурец, перец, чеснок.', nutrition: { kcal: 45, p: 0.6, f: 0, c: 4.8 } },
  { id: 48, name: 'Ocean', brewery: 'Stamm', type: 'gose', origin: 'ru', onTap: false, isPromo: false, isNotBeer: false, abv: 5.0, ibu: 0, og: 13, price: 350, rating: 4.4, image: '', desc: 'Фруктовый гозе с гуавой.', nutrition: { kcal: 48, p: 0.3, f: 0, c: 6.0 } },
  { id: 49, name: 'Sea Salt', brewery: 'Jaws', type: 'gose', origin: 'ru', onTap: false, isPromo: false, isNotBeer: false, abv: 4.5, ibu: 12, og: 11, price: 280, rating: 4.3, image: '', desc: 'Пшеничное пиво с солью.', nutrition: { kcal: 38, p: 0.4, f: 0, c: 3.8 } },
  { id: 50, name: 'Spicy Tomato', brewery: 'Big Village', type: 'gose', origin: 'ru', onTap: false, isPromo: true, isNotBeer: false, abv: 6.0, ibu: 0, og: 15, price: 360, rating: 4.8, image: '', desc: 'Острое томатное гозе.', nutrition: { kcal: 50, p: 0.7, f: 0, c: 5.5 } },
  { id: 51, name: 'Хамовники Пильзенское', brewery: 'МПК', type: 'lager', origin: 'ru', onTap: true, isPromo: true, isNotBeer: false, abv: 4.8, ibu: 35, og: 12, price: 190, rating: 4.5, image: '', desc: 'Идеальный российский пилснер.', nutrition: { kcal: 42, p: 0.4, f: 0, c: 3.5 } },
  { id: 52, name: 'Pilsner Urquell', brewery: 'Plzeňský Prazdroj', type: 'lager', origin: 'import', onTap: true, isPromo: false, isNotBeer: false, abv: 4.4, ibu: 40, og: 11.8, price: 450, rating: 4.9, image: '', desc: 'Отец всех пилснеров.', nutrition: { kcal: 40, p: 0.4, f: 0, c: 3.3 } },
  { id: 53, name: 'Жигули Барное', brewery: 'МПК', type: 'lager', origin: 'ru', onTap: false, isPromo: true, isNotBeer: false, abv: 4.9, ibu: 20, og: 12, price: 150, rating: 4.2, image: '', desc: 'Классический светлый лагер.', nutrition: { kcal: 43, p: 0.4, f: 0, c: 3.8 } },
  { id: 54, name: 'Spaten München', brewery: 'Spaten', type: 'lager', origin: 'import', onTap: true, isPromo: false, isNotBeer: false, abv: 5.2, ibu: 21, og: 11.7, price: 420, rating: 4.6, image: '', desc: 'Мюнхенский хеллес.', nutrition: { kcal: 45, p: 0.4, f: 0, c: 3.5 } },
  { id: 55, name: 'Венское', brewery: 'Таркос', type: 'lager', origin: 'ru', onTap: false, isPromo: false, isNotBeer: false, abv: 4.5, ibu: 15, og: 11, price: 210, rating: 4.3, image: '', desc: 'Янтарный лагер в венском стиле.', nutrition: { kcal: 41, p: 0.4, f: 0, c: 3.6 } },
  { id: 56, name: 'Krombacher Pils', brewery: 'Krombacher', type: 'lager', origin: 'import', onTap: false, isPromo: false, isNotBeer: false, abv: 4.8, ibu: 24, og: 11.2, price: 380, rating: 4.5, image: '', desc: 'Немецкий пилснер.', nutrition: { kcal: 39, p: 0.4, f: 0, c: 3.0 } },
  { id: 57, name: 'Stella Artois', brewery: 'Stella Artois', type: 'lager', origin: 'import', onTap: false, isPromo: false, isNotBeer: false, abv: 5.0, ibu: 24, og: 11.5, price: 320, rating: 4.2, image: '', desc: 'Бельгийский светлый лагер.', nutrition: { kcal: 40, p: 0.4, f: 0, c: 3.2 } },
  { id: 58, name: 'Tsingtao', brewery: 'Tsingtao', type: 'lager', origin: 'import', onTap: false, isPromo: true, isNotBeer: false, abv: 4.7, ibu: 15, og: 11, price: 280, rating: 4.1, image: '', desc: 'Китайский лагер.', nutrition: { kcal: 38, p: 0.3, f: 0, c: 3.1 } },
  { id: 59, name: 'Kellerbier', brewery: "Salden's", type: 'lager', origin: 'ru', onTap: true, isPromo: false, isNotBeer: false, abv: 4.5, ibu: 20, og: 12, price: 260, rating: 4.4, image: '', desc: 'Нефильтрованный лагер.', nutrition: { kcal: 43, p: 0.5, f: 0, c: 3.5 } },
  { id: 60, name: 'Budweiser', brewery: 'Budweiser', type: 'lager', origin: 'import', onTap: false, isPromo: false, isNotBeer: false, abv: 5.0, ibu: 12, og: 11, price: 250, rating: 4.0, image: '', desc: 'Американский легкий лагер.', nutrition: { kcal: 35, p: 0.2, f: 0, c: 2.8 } },
  { id: 61, name: 'Zero Point', brewery: 'Jaws', type: 'na', origin: 'ru', onTap: false, isPromo: false, isNotBeer: false, abv: 0.5, ibu: 20, og: 5, price: 290, rating: 4.7, image: '', desc: 'Безалкогольный эль.', nutrition: { kcal: 22, p: 0.2, f: 0, c: 4.5 } },
  { id: 62, name: "Don't Worry Baby", brewery: 'Jaws', type: 'na', origin: 'ru', onTap: false, isPromo: true, isNotBeer: false, abv: 0.5, ibu: 30, og: 6, price: 310, rating: 4.8, image: '', desc: 'Безалкогольный APA.', nutrition: { kcal: 25, p: 0.3, f: 0, c: 5.0 } },
  { id: 63, name: 'Clausthaler Original', brewery: 'Binding', type: 'na', origin: 'import', onTap: true, isPromo: false, isNotBeer: false, abv: 0.4, ibu: 25, og: 6, price: 350, rating: 4.6, image: '', desc: 'Безалкогольный пилснер.', nutrition: { kcal: 26, p: 0.2, f: 0, c: 5.6 } },
  { id: 64, name: 'Балтика 0', brewery: 'Балтика', type: 'na', origin: 'ru', onTap: false, isPromo: true, isNotBeer: false, abv: 0.5, ibu: 10, og: 5, price: 120, rating: 4.0, image: '', desc: 'Самое популярное б/а пиво.', nutrition: { kcal: 30, p: 0.3, f: 0, c: 6.5 } },
  { id: 65, name: 'Stella Artois N.A.', brewery: 'Stella Artois', type: 'na', origin: 'import', onTap: false, isPromo: false, isNotBeer: false, abv: 0.0, ibu: 15, og: 5, price: 250, rating: 4.2, image: '', desc: 'Безалкогольный бельгийский лагер.', nutrition: { kcal: 18, p: 0.2, f: 0, c: 4.0 } },
  { id: 66, name: 'Heineken 0.0', brewery: 'Heineken', type: 'na', origin: 'import', onTap: false, isPromo: false, isNotBeer: false, abv: 0.0, ibu: 14, og: 5, price: 230, rating: 4.3, image: '', desc: 'Идеальный ноль.', nutrition: { kcal: 21, p: 0.2, f: 0, c: 4.8 } },
  { id: 67, name: 'Hoegaarden 0.0', brewery: 'Hoegaarden', type: 'na', origin: 'import', onTap: true, isPromo: false, isNotBeer: false, abv: 0.0, ibu: 10, og: 6, price: 260, rating: 4.5, image: '', desc: 'Безалкогольный витбир.', nutrition: { kcal: 27, p: 0.3, f: 0, c: 6.0 } },
  { id: 68, name: 'Amstel 0.0 Natur', brewery: 'Amstel', type: 'na', origin: 'ru', onTap: false, isPromo: true, isNotBeer: false, abv: 0.0, ibu: 12, og: 5, price: 150, rating: 4.1, image: '', desc: 'Безалкогольный напиток.', nutrition: { kcal: 20, p: 0.2, f: 0, c: 4.5 } },
  { id: 69, name: 'Weihenstephaner N/A', brewery: 'Weihenstephan', type: 'na', origin: 'import', onTap: false, isPromo: false, isNotBeer: false, abv: 0.5, ibu: 14, og: 6, price: 420, rating: 4.8, image: '', desc: 'Эталонное безалкогольное пшеничное.', nutrition: { kcal: 25, p: 0.4, f: 0, c: 5.2 } },
  { id: 70, name: "Maisel's Weisse Alkoholfrei", brewery: 'Maisel', type: 'na', origin: 'import', onTap: false, isPromo: false, isNotBeer: false, abv: 0.4, ibu: 12, og: 6, price: 400, rating: 4.7, image: '', desc: 'Баварское безалкогольное пшеничное.', nutrition: { kcal: 23, p: 0.4, f: 0, c: 4.9 } },
  { id: 101, name: 'Футболка Prime', brewery: 'Prime Store', type: 'merch', origin: 'not_beer', onTap: false, isPromo: false, isNotBeer: true, price: 1800, rating: 5.0, image: '', desc: 'Плотный хлопок 100%.' },
  { id: 102, name: 'Тюльпан Prime', brewery: 'Prime Glass', type: 'merch', origin: 'not_beer', onTap: false, isPromo: false, isNotBeer: true, price: 600, rating: 4.9, image: '', desc: 'Идеальный бокал для IPA.' },
  { id: 103, name: 'Худи "Hop Head"', brewery: 'Prime Store', type: 'merch', origin: 'not_beer', onTap: false, isPromo: true, isNotBeer: true, price: 3500, rating: 4.8, image: '', desc: 'Оверсайз-худи с вышивкой хмеля.' },
  { id: 201, name: 'Ghost in the Machine', brewery: 'Parish', type: 'neipa', origin: 'archive', onTap: false, isPromo: false, isNotBeer: false, abv: 8.5, ibu: 40, og: 18, price: 950, rating: 4.9, image: '', desc: 'Легендарный DIPA, которого больше нет.' },
  { id: 202, name: 'Kentucky Brunch', brewery: 'Toppling Goliath', type: 'stout', origin: 'archive', onTap: false, isPromo: false, isNotBeer: false, abv: 12.0, ibu: 45, og: 30, price: 2500, rating: 5.0, image: '', desc: 'Один из лучших стаутов в мире. Выпит.' },
  { id: 301, name: 'Pliny the Younger', brewery: 'Russian River', type: 'ipa', origin: 'soon', onTap: false, isPromo: false, isNotBeer: false, abv: 10.25, ibu: 90, og: 20, price: 1200, rating: 5.0, image: '', desc: 'Тройной IPA. Ожидается поставка.' },
  { id: 302, name: 'Double Daisy Cutter', brewery: 'Half Acre', type: 'pale', origin: 'soon', onTap: false, isPromo: false, isNotBeer: false, abv: 8.0, ibu: 60, og: 17, price: 650, rating: 4.6, image: '', desc: 'Мощный пейл эль на подходе.' }
];

MOCK_ITEMS.forEach(item => {
  if (item.isPromo) {
    const discount = Math.random() * 0.25 + 0.05; // 5% to 30%
    item.oldPrice = Math.round(item.price / (1 - discount) / 10) * 10;
  }
});

// =======================
// 3. ВЕКТОРНЫЕ ЗАГЛУШКИ
// =======================
const BeerCanIcon = ({ color, label, className }) => (
  <svg viewBox="0 0 100 200" className={className} preserveAspectRatio="xMidYMid meet">
    <defs>
      <linearGradient id={`canGrad-${label}`} x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#d4d4d8" /><stop offset="15%" stopColor="#ffffff" /><stop offset="85%" stopColor="#a1a1aa" /><stop offset="100%" stopColor="#71717a" />
      </linearGradient>
      <linearGradient id={`labelGrad-${label}`} x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor={color} /><stop offset="15%" stopColor="#ffffff" stopOpacity="0.3" /><stop offset="85%" stopColor="#000000" stopOpacity="0.1" /><stop offset="100%" stopColor="#000000" stopOpacity="0.4" />
      </linearGradient>
    </defs>
    <rect x="25" y="15" width="50" height="8" rx="2" fill="#a1a1aa" />
    <rect x="25" y="15" width="50" height="8" rx="2" fill={`url(#canGrad-${label})`} opacity="0.5" />
    <path d="M22 23 Q 50 28 78 23 L80 177 Q 50 182 20 177 Z" fill={`url(#canGrad-${label})`} />
    <path d="M21 50 L79 50 L80 150 L20 150 Z" fill={color} />
    <path d="M21 50 L79 50 L80 150 L20 150 Z" fill={`url(#labelGrad-${label})`} />
    <text x="50" y="110" fontFamily="Russo One, Montserrat, sans-serif" fontSize="24" fontWeight="400" fill="#ffffff" textAnchor="middle" transform="rotate(-90 50 100)" letterSpacing="4">{label}</text>
    <path d="M20 177 Q 50 185 80 177 L76 185 Q 50 190 24 185 Z" fill="#71717a" />
  </svg>
);

const BeerBottleIcon = ({ bottleColor, labelColor, label, className }) => (
  <svg viewBox="0 0 100 200" className={className} preserveAspectRatio="xMidYMid meet">
    <defs>
      <linearGradient id={`bottleGrad-${label}`} x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#2b1408" /><stop offset="20%" stopColor={bottleColor} /><stop offset="80%" stopColor="#1a0a03" /><stop offset="100%" stopColor="#0d0401" />
      </linearGradient>
      <linearGradient id={`glassReflect-${label}`} x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="5%" stopColor="#ffffff" stopOpacity="0.5" /><stop offset="15%" stopColor="#ffffff" stopOpacity="0" />
      </linearGradient>
    </defs>
    <rect x="40" y="5" width="20" height="7" rx="1" fill="#eab308" />
    <path d="M43 12 L57 12 L60 60 L40 60 Z" fill={`url(#bottleGrad-${label})`} />
    <path d="M43 12 L57 12 L60 60 L40 60 Z" fill={`url(#glassReflect-${label})`} />
    <path d="M40 60 Q 75 65 80 100 L80 190 Q 50 198 20 190 L20 100 Q 25 65 40 60 Z" fill={`url(#bottleGrad-${label})`} />
    <path d="M40 60 Q 75 65 80 100 L80 190 Q 50 198 20 190 L20 100 Q 25 65 40 60 Z" fill={`url(#glassReflect-${label})`} />
    <rect x="25" y="110" width="50" height="55" fill={labelColor} rx="3" />
    <rect x="25" y="110" width="50" height="55" fill="#000000" opacity="0.2" rx="3" />
    <circle cx="50" cy="137" r="15" fill="#ffffff" opacity="0.9" />
    <text x="50" y="142" fontFamily="Russo One, Montserrat, sans-serif" fontSize="12" fontWeight="400" fill="#000000" textAnchor="middle">{label}</text>
  </svg>
);

const ItemImage = ({ item, className }) => {
  if (item.isNotBeer) return <Package size={48} className={`text-white/80 drop-shadow-lg ${className}`} />;
  // All beer uses the same bottle PNG (no background) — served from /public
  return <img src="/bottle.png" alt={item.name} className={className} style={{ objectFit: 'contain' }} draggable={false} />;
};

// Литраж: ∞ для крана, 0.33 для импорта/крепкого, 0.5 — стандарт, 0.7 — barleywine/BA/RIS
const getVolumeLabel = (item) => {
  if (item.isNotBeer) return null;
  if (item.onTap) return '0.5 Л';
  if (item.type === 'barleywine' || item.type === 'ris' || item.type === 'barrel_aged') return '0.7 Л';
  if (item.origin === 'import' || item.abv >= 9) return '0.33 Л';
  return '0.5 Л';
};

// =======================
// 4. ПУЗЫРЬКИ
// =======================
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

    // Wave midline in WORLD (page) coordinates.
    let waveMidWorld = 280;
    const waveAmplitude = 5;
    const scrollEl = document.querySelector('main');
    const measureWave = () => {
      const header = document.querySelector('header');
      if (header && scrollEl) {
        const headerRect = header.getBoundingClientRect();
        const mainRect = scrollEl.getBoundingClientRect();
        waveMidWorld = Math.max(0, (headerRect.bottom - mainRect.top) + scrollEl.scrollTop - 14);
      }
    };
    measureWave();
    const ro = new ResizeObserver(measureWave);
    const headerEl = document.querySelector('header');
    if (headerEl) ro.observe(headerEl);
    window.addEventListener('resize', measureWave);

    const getScrollTop = () => (scrollEl ? scrollEl.scrollTop : 0);

    const surfaceAtX = (x, now) => {
      const vw = window.innerWidth;
      const shift = ((now % 6000) / 6000) * vw;
      const phase = (4 * Math.PI * (x + shift)) / vw;
      return waveMidWorld - Math.sin(phase) * waveAmplitude;
    };

    const makeBubble = (mode = 'spread') => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const scrollTop = getScrollTop();
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
          const t = b.popFrame / 15;
          if (t >= 1) {
            const nb = makeBubble('below');
            nb.baseSize = nb.size;
            Object.assign(b, nb);
            return;
          }
          const popSize = b.baseSize * (1 + t * 1.2);
          const popAlpha = b.opacity * (1 - t);
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
        const surface = surfaceAtX(b.x, now);
        if (b.worldY < surface) {
          b.popping = true;
          b.popFrame = 0;
          b.popY = surface;
          return;
        }
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
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 29 }} />;
};

// =======================
// 4b. ПУЗЫРЬКИ В ПЕНЕ (хедер)
// =======================
const FoamBubblesCanvas = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const parent = canvas.parentElement;
    const setSize = () => {
      canvas.width = parent.offsetWidth;
      canvas.height = parent.offsetHeight;
    };
    setSize();
    const ro = new ResizeObserver(setSize);
    ro.observe(parent);
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
    return () => { ro.disconnect(); cancelAnimationFrame(animationId); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-[1] opacity-80" />;
};

// =======================
// 4c. HEADER WAVE — single shared foam wave, synchronized across header + body
// =======================
// Every instance captures the current position of the 6s `wave-smooth` cycle at mount
// time and rewinds its animation by that amount via a negative `animation-delay`. Because
// every wave renders the same path at the same phase, they translate as one continuous
// ribbon — the header and any modal/pour wave stay locked in step, even when a modal
// mounts seconds after the app started.
const HeaderWave = React.memo(function HeaderWave({ className = '', style, fill = '#FFF8E7' }) {
  const animationDelay = useMemo(
    () => `-${performance.now() % 6000}ms`,
    []
  );
  // Color transition is matched BYTE-FOR-BYTE to the foam mask's `background-color`
  // transition in the header (`500ms cubic-bezier(0.4, 0, 0.2, 1) 900ms`). That mask
  // is painted BEHIND the wave, so if their timings differ by even a few ms the wave
  // looks like a decoupled element changing color on its own. With matched timing
  // the wave is perceived as just the upper edge of the foam repaint — one seamless
  // element. Using CSS `color` + SVG `fill="currentColor"` is the most reliable way
  // to transition an SVG fill across React re-renders.
  const containerStyle = {
    animationDelay,
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

// =======================
// 5. PRODUCT CARD — memoized to prevent re-rendering all 70 cards on every cart update
// =======================
const ProductCard = React.memo(function ProductCard({ item, qty, index, accentColor, accentContrast, onSelect, onUpdateCart, onBrewerySearch }) {
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
            style={{ color: hexToRgba(accentContrast, 0.85), border: `1px solid ${hexToRgba(accentContrast, 0.18)}`, backgroundColor: hexToRgba(accentContrast, 0.04) }}
          >{item.brewery}</button>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-[10px] shrink-0" style={{ border: `1px solid ${hexToRgba(accentContrast, 0.18)}`, backgroundColor: hexToRgba(accentContrast, 0.04) }}>
            <Star size={11} style={{ color: accentContrast, fill: accentContrast, opacity: 0.85 }} />
            <span className="font-display text-[13px] font-bold leading-none" style={{ color: hexToRgba(accentContrast, 0.9) }}>{item.rating}</span>
          </div>
        </div>
      )}
      <div className="relative flex items-center justify-center h-[130px] pt-1 group-hover:scale-105" style={{ transition: 'transform 600ms cubic-bezier(0.23, 1, 0.32, 1)' }}>
        <ItemImage item={item} className="w-auto h-[110px] drop-shadow-[0_6px_12px_rgba(0,0,0,0.2)]" />
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
            <span className="font-display px-1.5 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: hexToRgba(accentContrast, 0.08), color: hexToRgba(accentContrast, 0.65), border: `1px solid ${hexToRgba(accentContrast, 0.1)}` }}>{getVolumeLabel(item)}</span>
            <span className="font-display px-1.5 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: hexToRgba(accentContrast, 0.08), color: hexToRgba(accentContrast, 0.65), border: `1px solid ${hexToRgba(accentContrast, 0.1)}` }}>{item.abv}% ABV</span>
            <span className="font-display px-1.5 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: hexToRgba(accentContrast, 0.08), color: hexToRgba(accentContrast, 0.65), border: `1px solid ${hexToRgba(accentContrast, 0.1)}` }}>{item.og}% OG</span>
            {item.ibu > 0 && <span className="font-display px-1.5 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: hexToRgba(accentContrast, 0.08), color: hexToRgba(accentContrast, 0.65), border: `1px solid ${hexToRgba(accentContrast, 0.1)}` }}>{item.ibu} IBU</span>}
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
  const [showStory, setShowStory] = useState(false);
  const [storyRead, setStoryRead] = useState(false);
  const [closingSheet, setClosingSheet] = useState(null);
  const [waveAnimating, setWaveAnimating] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [searchChipClosing, setSearchChipClosing] = useState(false);
  const headerRef = useRef(null);
  const mainRef = useRef(null);

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
    return isNotBeer ? '#8B939C' : (activeCategory.id === 'all_styles' ? '#FDE047' : activeCategory.color);
  }, [activeCategory, activeOrigin]);
  const isStout = activeCategory.id === 'stout';

  const currentItems = useMemo(() => {
    if (!activeOrigin) return [];
    let result = MOCK_ITEMS;
    if (activeOrigin.id === 'not_beer') {
      result = result.filter(item => item.isNotBeer);
    } else if (activeOrigin.id === 'archive') {
      result = result.filter(item => item.origin === 'archive');
      if (activeCategory && activeCategory.id !== 'all_styles') {
        result = result.filter(item => item.type === activeCategory.id);
      }
    } else if (activeOrigin.id === 'soon') {
      result = result.filter(item => item.origin === 'soon');
      if (activeCategory && activeCategory.id !== 'all_styles') {
        result = result.filter(item => item.type === activeCategory.id);
      }
    } else {
      result = result.filter(item => !item.isNotBeer && item.origin !== 'archive' && item.origin !== 'soon');
      if (activeOrigin.id === 'ru') result = result.filter(b => b.origin === 'ru');
      if (activeOrigin.id === 'import') result = result.filter(b => b.origin === 'import');
      if (activeOrigin.id === 'collab') result = result.filter(b => b.origin === 'collab');
      if (activeOrigin.id === 'tap') result = result.filter(b => b.onTap);
      if (activeOrigin.id === 'promo') result = result.filter(b => b.isPromo);
      if (activeCategory && activeCategory.id !== 'all_styles') {
        result = result.filter(item => item.type === activeCategory.id);
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

  const cartTotalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotalPrice = cartItems.reduce((sum, item) => sum + (item.item.price * item.quantity), 0);

  // Search for all items from a specific brewery. Resets origin/category to "all"
  // so the user actually sees everything this brewery makes across styles and sources.
  // Runs the same fade-out → fly-in choreography as style changes so the list
  // transition feels intentional, not a snap. Safe to call with any pending sheet —
  // sheet refs are only closed here if we own them (no-op otherwise).
  const handleBrewerySearch = useCallback((brewery) => {
    // Scroll back to the top so the user sees the newly-filtered list and the
    // search chip floating in, not a half-scrolled middle section.
    mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    setIsTransitioning(true);
    setTimeout(() => {
      // Single-commit fading → settling to prevent the intermediate jerk.
      flushSync(() => {
        setActiveOrigin(ORIGINS[0]);
        setActiveCategory(ALL_CATEGORIES[0]);
        setSearchQuery(brewery);
        setActiveSearchTerm(brewery);
        setShowSearchBar(true);
        setIsTransitioning(false);
        setIsSettling(true);
      });
      setTimeout(() => setIsSettling(false), 880);
    }, 280);
  }, []);

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

  const getQty = (itemId) => cartItems.find(c => c.item.id === itemId)?.quantity || 0;

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

  const handleFilterChange = (setSheet, filterFn, isNotBeer = false) => {
    setSheet(false);
    setIsTransitioning(true);
    const nextColor = isNotBeer ? '#8B939C' : activeCategory.color;
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
      setTimeout(() => setIsSettling(false), 880);
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
        @font-face { font-family: 'TD Ciryulnik'; src: url('/fonts/td-ciryulnik.woff2') format('woff2'); font-display: block; }
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
          font-family: 'TD Ciryulnik', 'Russo One', sans-serif;
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
          0%   { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
          100% { opacity: 0; transform: translateY(-10px) scale(0.94); filter: blur(6px); }
        }
        @keyframes search-bar-in {
          0%   { opacity: 0; transform: translateY(-12px); filter: blur(6px); }
          100% { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        /* Age gate exit: backdrop fades + gently blurs out, card zooms up and away
           on top of it — layered exit so the user feels a real "stepping through"
           transition instead of an abrupt unmount. */
        @keyframes age-gate-out {
          0%   { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes age-card-out {
          0%   { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.97); }
        }
        @keyframes wave-smooth { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes slide-up-glass { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes slide-down-glass { from { transform: translateY(0); } to { transform: translateY(100%); } }
        @keyframes fade-out { from { opacity: 1; } to { opacity: 0; } }
        @keyframes foam-drift { 0% { transform: translateX(0) translateY(0); } 50% { transform: translateX(-3px) translateY(1px); } 100% { transform: translateX(0) translateY(0); } }
        @keyframes logo-glow { 0%, 100% { opacity: 1; filter: brightness(1); } 50% { opacity: 0.85; filter: brightness(1.15); } }
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
              ? 'age-gate-out 350ms cubic-bezier(0.4, 0, 0.2, 1) forwards'
              : undefined,
          }}
        >
          {/* Непрозрачный пенный фон */}
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
                ? 'age-card-out 300ms cubic-bezier(0.4, 0, 0.2, 1) forwards'
                : undefined,
            }}>
            <div className="w-[80px] h-[80px] mb-5 rounded-full shadow-lg flex items-center justify-center bg-white border-[3px] border-white/60">
              <div className="font-logo text-[17px] leading-[1.1] flex flex-col items-center" style={{ color: '#C4A265' }}>
                <span>ПРАЙМ</span><span>БИР</span>
              </div>
            </div>
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
                }, 350);
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

      <main ref={mainRef} className="relative w-full h-[100dvh] z-20 overflow-y-auto overflow-x-hidden no-scrollbar scroll-smooth" style={{ overscrollBehavior: 'none' }}>

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

        <BeerBubblesCanvas />
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
                <div className="relative w-[56px] h-[56px] rounded-full flex items-center justify-center cursor-pointer active:scale-95 transition-transform" onClick={() => { setShowStory(true); setStoryRead(true); }}>
                  {storyRead ? (
                    <div className="absolute inset-0 rounded-full bg-zinc-300" />
                  ) : (
                    <div className="absolute inset-0 rounded-full animate-[spin_2.5s_linear_infinite] transition-colors duration-1000"
                      style={{ background: `conic-gradient(from 0deg, transparent 0%, transparent 40%, ${accentColor} 100%)` }} />
                  )}
                  <div className="relative w-[50px] h-[50px] rounded-full bg-white flex items-center justify-center z-10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]">
                    <div className="font-logo text-[14px] leading-[1.1] flex flex-col items-center transition-colors duration-1000" style={{ color: accentColor }}>
                      <span>ПРАЙМ</span><span>БИР</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setShowLocationSheet(true)} className="flex flex-col items-start active:opacity-70 text-left ml-1">
                  <span className="text-zinc-400 font-bold text-[10px] uppercase tracking-widest mb-0.5">{activeLocation.area}</span>
                  <div className="flex items-center gap-1">
                    <MapPin size={16} style={{ color: accentColor }} className="transition-colors duration-1000" />
                    <h1 className="text-[15px] font-black tracking-tight text-zinc-900">{activeLocation.address}</h1>
                    <ChevronDown size={14} className="text-zinc-400" />
                  </div>
                </button>
              </div>
              <button
                onClick={() => {
                  if (showSearchBar) {
                    setShowSearchBar(false);
                    if (!activeSearchTerm) setSearchQuery("");
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
            {showSearchBar && (
              <div
                className="mt-3 relative z-[50]"
                style={{ animation: 'search-bar-in 420ms cubic-bezier(0.16, 1, 0.3, 1) both' }}
              >
                <div
                  className="relative flex items-center rounded-[16px] liquid-glass-subtle"
                  style={{ backgroundColor: hexToRgba(accentColor, 0.12) }}
                >
                  <Search size={18} className="absolute left-3.5 text-zinc-500 pointer-events-none" strokeWidth={2.5} />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const q = searchQuery.trim();
                        if (!q) return;
                        searchInputRef.current?.blur();
                        mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                        setIsTransitioning(true);
                        setTimeout(() => {
                          flushSync(() => {
                            setActiveOrigin(ORIGINS[0]);
                            setActiveCategory(ALL_CATEGORIES[0]);
                            setActiveSearchTerm(q);
                            setIsTransitioning(false);
                            setIsSettling(true);
                          });
                          setTimeout(() => setIsSettling(false), 880);
                        }, 280);
                      } else if (e.key === 'Escape') {
                        setShowSearchBar(false);
                        if (!activeSearchTerm) setSearchQuery("");
                      }
                    }}
                    placeholder="Название или пивоварня..."
                    className="flex-1 pl-11 pr-11 py-3 bg-transparent text-[14px] font-medium text-zinc-900 placeholder:text-zinc-500 focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      setShowSearchBar(false);
                      if (activeSearchTerm) {
                        setIsTransitioning(true);
                        setTimeout(() => {
                          flushSync(() => {
                            setActiveSearchTerm("");
                            setSearchQuery("");
                            setIsTransitioning(false);
                            setIsSettling(true);
                          });
                          setTimeout(() => setIsSettling(false), 880);
                        }, 280);
                      } else {
                        setSearchQuery("");
                      }
                    }}
                    className="absolute right-2 w-7 h-7 rounded-full flex items-center justify-center active:scale-[0.88] liquid-glass"
                    style={{ backgroundColor: hexToRgba(accentColor, 0.25), transition: 'transform 160ms cubic-bezier(0.23, 1, 0.32, 1), background-color 1000ms ease' }}
                  ><X size={14} /></button>
                </div>
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
              {[{ id: 'rating', label: 'Рейтинг' }, { id: 'price', label: 'Цена' }, { id: 'abv', label: 'Крепость' }, { id: 'og', label: 'Плотность' }].map(s => {
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
              {currentItems.length > 0 ? currentItems.map((item, index) => (
                <ProductCard
                  key={item.id}
                  item={item}
                  qty={getQty(item.id)}
                  index={index}
                  accentColor={targetAccentColor}
                  accentContrast={accentContrast}
                  onSelect={setSelectedItem}
                  onUpdateCart={updateCart}
                  onBrewerySearch={handleBrewerySearch}
                />
              )) : (
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
          <button onClick={() => setShowCart(true)} className="relative w-full flex items-center justify-between p-4 rounded-[24px] shadow-2xl active:scale-[0.98] pointer-events-auto liquid-glass" style={{ backgroundColor: hexToRgba(accentColor, 0.15), animation: 'cart-rise 1400ms cubic-bezier(0.22, 1, 0.36, 1) both', transformOrigin: 'bottom center', transition: 'transform 180ms cubic-bezier(0.23, 1, 0.32, 1), background-color 1000ms ease' }}>
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
          <button onClick={() => setShowStory(false)} className="absolute top-8 right-4 z-20 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center active:scale-90 border border-white/20"><X size={20} /></button>
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
                <button onClick={() => closeSheet('cart', setShowCart)} className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-600 active:scale-90 liquid-glass" style={{ backgroundColor: hexToRgba(targetAccentColor, 0.15) }}><X size={20} /></button>
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
        const detailRef = React.createRef();
        let startY = 0;
        const onTouchStart = (e) => { startY = e.touches[0].clientY; };
        const onTouchEnd = (e) => { if (e.changedTouches[0].clientY - startY > 80) closeDetail(); };
        const itemCat = ALL_CATEGORIES.find(c => c.id === selectedItem.type);
        const itemColor = itemCat ? itemCat.color : '#FDE047';
        const itemContrast = getContrastYIQ(itemColor);
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
                <button onClick={closeDetail} className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center z-20 active:scale-90 liquid-glass"><X size={20} style={{ color: itemColor }} /></button>
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
                          style={{ color: itemContrast, backgroundColor: hexToRgba(itemColor, 0.2), border: `1px solid ${hexToRgba(itemColor, 0.35)}` }}
                        >{selectedItem.brewery}</button>
                        <div className="flex items-center gap-1 px-3 py-1.5 rounded-[10px]" style={{ backgroundColor: hexToRgba(itemColor, 0.2), border: `1px solid ${hexToRgba(itemColor, 0.35)}` }}>
                          <Star size={13} style={{ color: itemContrast, fill: itemContrast }} /><span className="font-display text-[15px] font-bold" style={{ color: itemContrast }}>{selectedItem.rating}</span>
                        </div>
                      </div>
                    )}
                    <h2 className="font-display text-[32px] font-black leading-[1.05] tracking-[-0.02em] mb-3" style={{ color: itemContrast }}>{selectedItem.name}</h2>
                    {!selectedItem.isNotBeer && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-display px-2.5 py-1 rounded-[8px] text-[12px] font-bold" style={{ color: itemContrast, backgroundColor: hexToRgba(itemColor, 0.2), border: `1px solid ${hexToRgba(itemColor, 0.35)}` }}>{getVolumeLabel(selectedItem)}</span>
                        <span className="font-display px-2.5 py-1 rounded-[8px] text-[12px] font-bold" style={{ color: itemContrast, backgroundColor: hexToRgba(itemColor, 0.2), border: `1px solid ${hexToRgba(itemColor, 0.35)}` }}>{selectedItem.abv}% ABV</span>
                        <span className="font-display px-2.5 py-1 rounded-[8px] text-[12px] font-bold" style={{ color: itemContrast, backgroundColor: hexToRgba(itemColor, 0.2), border: `1px solid ${hexToRgba(itemColor, 0.35)}` }}>{selectedItem.og}% OG</span>
                        {selectedItem.ibu > 0 && <span className="font-display px-2.5 py-1 rounded-[8px] text-[12px] font-bold" style={{ color: itemContrast, backgroundColor: hexToRgba(itemColor, 0.2), border: `1px solid ${hexToRgba(itemColor, 0.35)}` }}>{selectedItem.ibu} IBU</span>}
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
                        ) : getQty(selectedItem.id) === 0 ? (
                          <button onClick={() => updateCart(null, selectedItem, 1)} className="py-4 px-10 rounded-[20px] font-black text-[14px] active:scale-[0.96] liquid-glass" style={{ color: itemContrast, backgroundColor: hexToRgba(itemColor, 0.15), transition: 'transform 180ms cubic-bezier(0.23, 1, 0.32, 1), background-color 1000ms ease', animation: 'plus-fade 520ms cubic-bezier(0.23, 1, 0.32, 1)' }}>В КОРЗИНУ</button>
                        ) : (
                          <div className="flex items-center gap-4 rounded-full p-1 liquid-glass" style={{ backgroundColor: hexToRgba(itemColor, 0.15), animation: 'qty-pop 720ms cubic-bezier(0.23, 1, 0.32, 1)' }}>
                            <button onClick={() => updateCart(null, selectedItem, -1)} className="w-12 h-12 rounded-full flex items-center justify-center active:scale-[0.9]" style={{ backgroundColor: hexToRgba(itemColor, 0.2), transition: 'transform 160ms cubic-bezier(0.23, 1, 0.32, 1), background-color 1000ms ease' }}><Minus size={18} style={{ color: itemContrast }} /></button>
                            <span className="text-[18px] font-black w-6 text-center tabular-nums" style={{ color: itemContrast }}>{getQty(selectedItem.id)}</span>
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
              <button onClick={() => closeSheet('origin', setShowOriginSheet)} className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center z-20 active:scale-90 liquid-glass"><X size={20} className="text-zinc-600" /></button>
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
                      <button key={origin.id} onClick={() => handleFilterChange(setShowOriginSheet, () => setActiveOrigin(origin), origin.id === 'not_beer')}
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
              <button onClick={() => closeSheet('category', setShowCategorySheet)} className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center z-20 active:scale-90 liquid-glass"><X size={20} className="text-zinc-600" /></button>
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
                  const groupActive = group.items.some(c => c.id === activeCategory.id);
                  return (
                    <button key={group.group} onClick={() => handleFilterChange(setShowCategorySheet, () => setActiveCategory(group.items[0]))}
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
              <button onClick={() => closeSheet('location', setShowLocationSheet)} className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center z-20 active:scale-90 liquid-glass"><X size={20} className="text-zinc-600" /></button>
              
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
