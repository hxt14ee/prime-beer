import { Beer, MapPin, Zap, Globe, Users, Droplets, Clock3, Package, Archive } from 'lucide-react';

export const LOCATIONS = [
  { id: 'push', address: 'Пушкинская, 11Б', area: 'ЦЕНТР' },
  { id: 'holz', address: 'Хользунова, 10Б', area: 'СЕВЕРНЫЙ' }
];

export const ORIGINS = [
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

export const CATEGORY_GROUPS = [
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
export const ALL_CATEGORIES = [{ id: 'all_styles', name: 'Любой стиль', color: '#D9B500' }, ...CATEGORY_GROUPS.flatMap(g => g.items)];
export const CATEGORIES = ALL_CATEGORIES;
export const createGroupCategory = (group) => ({
  id: `group:${group.group}`,
  name: group.group,
  color: group.color,
  groupItems: group.items.map((item) => item.id),
});
export const STYLE_TARGET_COUNT = 50;

// =======================
// 2. БАЗА ДАННЫХ
// =======================
export const MOCK_ITEMS = [
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

export const STYLE_LIBRARY = {
  lager: {
    descriptors: ['Golden', 'Crisp', 'North', 'Bavarian', 'Amber', 'Silver', 'Pils', 'Keller', 'Vienna', 'Hoppy'],
    series: ['Lager', 'Pils', 'Helles', 'Export', 'Kellerbier'],
    breweries: ['Ayinger', 'Augustiner', 'Jaws', 'Tarkos', 'МПК', 'Spaten', 'Krombacher', 'Konix', 'Bakunin', 'Salden\'s'],
    desc: 'Чистый лагер с сухим финалом и аккуратной хмелевой горчинкой.',
    abv: [4.2, 5.6], ibu: [16, 38], og: [10, 13], price: [190, 430], origins: ['ru', 'import']
  },
  wheat: {
    descriptors: ['Cloudy', 'Bavarian', 'White', 'Silk', 'Banana', 'Clove', 'Sunny', 'Velvet', 'Farm', 'Cream'],
    series: ['Weisse', 'Wheat', 'Wit', 'Blanche', 'Hefeweizen'],
    breweries: ['Maisel', 'Weihenstephan', 'Jaws', 'Tarkos', 'Konix', 'Salden\'s', 'Bakunin', 'Paulaner'],
    desc: 'Пшеничное пиво с мягким телом, хлебной сладостью и эфирами банана и гвоздики.',
    abv: [4.4, 6.3], ibu: [8, 22], og: [11, 15], price: [220, 470], origins: ['ru', 'import']
  },
  pale: {
    descriptors: ['Bright', 'Daylight', 'Coast', 'Citra', 'Mosaic', 'Easy', 'Summer', 'Fresh', 'Golden', 'Hop'],
    series: ['Pale Ale', 'Blonde', 'Golden Ale', 'Easy Pale', 'Summer Ale'],
    breweries: ['Salden\'s', 'Jaws', 'Konix', 'Brewlok', 'Victory Art Brew', 'AF Brew', 'Panzer', 'Stamm'],
    desc: 'Питкий светлый эль с ярким хмелевым ароматом и мягкой солодовой базой.',
    abv: [4.5, 6.2], ibu: [20, 45], og: [11, 14], price: [240, 420], origins: ['ru', 'import']
  },
  ipa: {
    descriptors: ['West Coast', 'Resin', 'Citrus', 'Hop', 'Electric', 'Pine', 'Signal', 'Velocity', 'Radar', 'Bitter'],
    series: ['IPA', 'India Pale Ale', 'Hop Bomb', 'Coast IPA', 'Double Hop'],
    breweries: ['Jaws', 'AF Brew', 'Bakunin', 'Lagunitas', 'BrewDog', 'Konix', 'Plan B', 'Gletcher', 'Zagovor', 'Salden\'s'],
    desc: 'Хмелевой IPA с сухим телом, цитрусом, хвойностью и выразительной горечью.',
    abv: [5.5, 8.5], ibu: [40, 95], og: [13, 19], price: [260, 520], origins: ['ru', 'import', 'collab']
  },
  neipa: {
    descriptors: ['Hazy', 'Juicy', 'Cloud', 'Soft', 'Tropic', 'Velour', 'Glow', 'Mango', 'Peach', 'Galaxy'],
    series: ['NEIPA', 'Hazy IPA', 'Juicy IPA', 'New England', 'Soft IPA'],
    breweries: ['AF Brew', 'Bakunin', 'Big Village', 'Stamm', 'Zagovor', 'Paradox', 'Jaws', 'Brewlok'],
    desc: 'Мутный IPA с сочным телом, низкой горечью и ароматом тропических фруктов.',
    abv: [5.8, 8.2], ibu: [12, 40], og: [14, 18], price: [290, 560], origins: ['ru', 'import', 'collab']
  },
  apa: {
    descriptors: ['Session', 'Bright', 'Cascade', 'Copper', 'Signal', 'Easy', 'Orange', 'Canyon', 'River', 'Draft'],
    series: ['APA', 'Pale Ale', 'Session Pale', 'American Pale', 'Hop Session'],
    breweries: ['Jaws', 'Konix', 'Victory Art Brew', 'Panzer', 'Plan B', 'Brewlok', 'Tarkos', 'Salden\'s'],
    desc: 'Американский пейл-эль с цитрусовым хмелем, карамельным солодом и легким телом.',
    abv: [4.7, 6.4], ibu: [25, 48], og: [11, 15], price: [230, 430], origins: ['ru', 'import']
  },
  stout: {
    descriptors: ['Black', 'Midnight', 'Velvet', 'Nitro', 'Coal', 'Dark', 'Dry', 'Port', 'Ink', 'Smoke'],
    series: ['Stout', 'Porter', 'Dry Stout', 'Oatmeal Stout', 'Robust Porter'],
    breweries: ['Guinness', 'AF Brew', 'Bakunin', 'Brewlok', 'Jaws', 'Paradox', 'Victory Art Brew', 'Left Hand'],
    desc: 'Темное пиво с нотами кофе, какао, жженого солода и бархатистым телом.',
    abv: [4.2, 8.5], ibu: [24, 60], og: [11, 19], price: [260, 620], origins: ['ru', 'import']
  },
  pastry_stout: {
    descriptors: ['Chocolate', 'Vanilla', 'Cookie', 'Maple', 'Coconut', 'Brownie', 'Dessert', 'Caramel', 'Pecan', 'Toffee'],
    series: ['Pastry Stout', 'Dessert Stout', 'Imperial Pastry', 'Sweet Stout', 'Cake Stout'],
    breweries: ['AF Brew', 'Bakunin', 'Paradox', 'Brewlok', 'Zagovor', 'Big Village', 'Plan B'],
    desc: 'Десертный стаут с плотным телом и выраженными нотами шоколада, ванили и карамели.',
    abv: [8.0, 13.5], ibu: [20, 55], og: [20, 32], price: [420, 980], origins: ['ru', 'import', 'collab']
  },
  dark: {
    descriptors: ['Amber', 'Brown', 'Toasted', 'Autumn', 'Caramel', 'Malt', 'Copper', 'Chestnut', 'Brick', 'Roasted'],
    series: ['Brown Ale', 'Amber Ale', 'Dark Lager', 'Schwarz', 'Dark Ale'],
    breweries: ['Tarkos', 'Konix', 'Jaws', 'Brewlok', 'Bakunin', 'Stamm', 'Salden\'s'],
    desc: 'Солодовый темный эль с хлебной корочкой, карамелью и умеренной обжаркой.',
    abv: [4.8, 7.2], ibu: [18, 40], og: [11, 17], price: [230, 470], origins: ['ru', 'import']
  },
  ris: {
    descriptors: ['Imperial', 'Night', 'Obsidian', 'Tsar', 'Baltic', 'Czar', 'Dark Star', 'Raven', 'Cask', 'Noir'],
    series: ['RIS', 'Imperial Stout', 'Russian Stout', 'Baltic Imperial', 'Royal Stout'],
    breweries: ['AF Brew', 'Bakunin', 'Paradox', 'Brewlok', 'Toppling Goliath', 'Cycle', 'Jaws'],
    desc: 'Русский имперский стаут с мощным телом, кофейной горечью и долгим согревающим финишем.',
    abv: [9.5, 14.5], ibu: [40, 90], og: [23, 34], price: [520, 1400], origins: ['ru', 'import']
  },
  barleywine: {
    descriptors: ['Old', 'Cellar', 'English', 'American', 'Oak', 'Reserve', 'Brass', 'Winter', 'Strong', 'Estate'],
    series: ['Barleywine', 'Strong Ale', 'Vintage Ale', 'Old Ale', 'Malt Wine'],
    breweries: ['Sierra Nevada', 'Jaws', 'Bakunin', 'Brewlok', 'Anchor', 'Fuller\'s', 'Plan B'],
    desc: 'Крепкий солодовый эль с тонами сухофруктов, карамели и согревающим послевкусием.',
    abv: [9.0, 15.0], ibu: [28, 75], og: [20, 33], price: [480, 1200], origins: ['ru', 'import']
  },
  barrel_aged: {
    descriptors: ['Bourbon', 'Rum', 'Oak', 'Port', 'Brandy', 'Cognac', 'Whiskey', 'Cask', 'Cellar', 'Reserve'],
    series: ['BA Stout', 'BA Barleywine', 'Oak Reserve', 'Barrel Aged', 'Cask Edition'],
    breweries: ['Paradox', 'Bakunin', 'AF Brew', 'Brewlok', 'Firestone Walker', 'De Molen', 'Founders'],
    desc: 'Выдержанное в бочке пиво с дубом, спиртуозностью, ванилью и насыщенным послевкусием.',
    abv: [10.0, 16.0], ibu: [25, 70], og: [23, 35], price: [650, 1800], origins: ['ru', 'import', 'collab']
  },
  belgian: {
    descriptors: ['Abbey', 'Golden', 'Tripel', 'Dubbel', 'Monk', 'Chalice', 'Spice', 'Yeast', 'Cloister', 'Heritage'],
    series: ['Belgian Ale', 'Tripel', 'Dubbel', 'Strong Ale', 'Abbey Ale'],
    breweries: ['Chimay', 'Westmalle', 'La Trappe', 'Bosteels', 'Tarkos', 'Jaws', 'Bakunin'],
    desc: 'Бельгийский эль с пряными эфирами, фруктовостью дрожжей и сухим финишем.',
    abv: [6.2, 10.5], ibu: [18, 38], og: [14, 22], price: [320, 720], origins: ['import', 'ru']
  },
  saison: {
    descriptors: ['Farm', 'Pepper', 'Rustic', 'Field', 'Hay', 'Dry', 'Barn', 'Wildflower', 'Sun', 'Stone'],
    series: ['Saison', 'Farmhouse', 'Table Saison', 'Dry Saison', 'Country Ale'],
    breweries: ['Fantome', 'Dupont', 'Bakunin', 'Jaws', 'Stamm', 'Plan B', 'AF Brew'],
    desc: 'Сухой фермерский эль с перечностью, фруктовыми эфирами и освежающим финалом.',
    abv: [5.0, 8.5], ibu: [18, 42], og: [11, 17], price: [290, 620], origins: ['import', 'ru', 'collab']
  },
  sour: {
    descriptors: ['Berry', 'Cherry', 'Acid', 'Tropic', 'Crimson', 'Lime', 'Passion', 'Neon', 'Plum', 'Velvet'],
    series: ['Sour Ale', 'Fruit Sour', 'Kettle Sour', 'Fruited Sour', 'Dry Sour'],
    breweries: ['Jaws', 'Stamm', 'Panzer', 'Paradox', 'Zagovor', 'Bakunin', '4Brewers', 'Salden\'s'],
    desc: 'Кислый эль с яркой фруктовой кислотностью и чистым освежающим профилем.',
    abv: [4.0, 7.5], ibu: [0, 18], og: [10, 17], price: [260, 520], origins: ['ru', 'import', 'collab']
  },
  smoothie: {
    descriptors: ['Mango', 'Banana', 'Guava', 'Strawberry', 'Blueberry', 'Peach', 'Raspberry', 'Tropic', 'Cream', 'Thick'],
    series: ['Smoothie Sour', 'Pastry Sour', 'Fruit Smoothie', 'Thick Sour', 'Puree Sour'],
    breweries: ['4Brewers', 'Bakunin', 'AF Brew', 'Paradox', 'Big Village', 'Plan B', 'Stamm'],
    desc: 'Густой фруктовый саур со смузи-текстурой, пюре и десертной насыщенностью.',
    abv: [5.0, 8.0], ibu: [0, 12], og: [14, 22], price: [320, 620], origins: ['ru', 'collab']
  },
  wild: {
    descriptors: ['Lambic', 'Brett', 'Cellar', 'Funk', 'Oak', 'Rustic', 'Old World', 'Wild', 'Barn', 'Terroir'],
    series: ['Wild Ale', 'Lambic', 'Gueuze', 'Mixed Fermentation', 'Brett Ale'],
    breweries: ['Cantillon', '3 Fonteinen', 'Oud Beersel', 'Plan B', 'Bakunin', 'Stamm'],
    desc: 'Дикий эль со сложной кислотностью, фанком, дубом и глубокой ферментационной ароматикой.',
    abv: [5.0, 8.5], ibu: [0, 18], og: [11, 18], price: [420, 980], origins: ['import', 'collab', 'ru']
  },
  gose: {
    descriptors: ['Salty', 'Sea', 'Lemon', 'Classic', 'Coriander', 'Breeze', 'Brine', 'Summer', 'Light', 'Wave'],
    series: ['Gose', 'Sea Ale', 'Salt Sour', 'Classic Gose', 'Leipzig Gose'],
    breweries: ['Bakunin', 'Jaws', 'Tarkos', 'Big Village', 'Paradox', 'Salden\'s', 'Anderson Valley'],
    desc: 'Солоноватый кислый эль с кориандром, лимонной кислотностью и легким телом.',
    abv: [4.2, 6.2], ibu: [0, 16], og: [10, 14], price: [250, 480], origins: ['ru', 'import']
  },
  tomato_gose: {
    descriptors: ['Tomato', 'Bloody', 'Chili', 'Celery', 'Spicy', 'Red', 'Soup', 'Pepper', 'Savory', 'Garden'],
    series: ['Tomato Gose', 'Bloody Gose', 'Michelada Gose', 'Red Gose', 'Spicy Gose'],
    breweries: ['4Brewers', 'Jaws', 'Tarkos', 'Big Village', 'Paradox', 'Panzer', 'Bakunin'],
    desc: 'Томатное гозе с гастрономическим профилем, солью, специями и яркой кислотностью.',
    abv: [4.5, 6.5], ibu: [0, 12], og: [11, 15], price: [280, 520], origins: ['ru', 'collab']
  },
  culinary: {
    descriptors: ['Pizza', 'Gazpacho', 'Curry', 'Kimchi', 'Pickle', 'Herb', 'Basil', 'Smoked', 'Savory', 'Umami'],
    series: ['Culinary Ale', 'Soup Gose', 'Gastro Beer', 'Kitchen Sour', 'Savory Ale'],
    breweries: ['Paradox', 'Big Village', 'AF Brew', 'Plan B', 'Bakunin', 'Stamm'],
    desc: 'Гастрономическое пиво с необычными ингредиентами, специями и выразительным savory-профилем.',
    abv: [4.8, 7.2], ibu: [0, 20], og: [11, 17], price: [320, 620], origins: ['ru', 'collab']
  },
  cider: {
    descriptors: ['Apple', 'Dry', 'Pear', 'Orchard', 'Sparkling', 'Wild', 'Oak', 'Country', 'Harvest', 'Golden'],
    series: ['Cider', 'Dry Cider', 'Apple Cider', 'Farm Cider', 'Sparkling Cider'],
    breweries: ['St. Anton', 'Bullevie', 'Abrau Cider', 'Gravity Project', 'Cidrerie', 'Mela Rosa'],
    desc: 'Сухой сидр с яблочной кислотностью, легкой танинностью и чистым освежающим вкусом.',
    abv: [4.0, 7.5], ibu: [0, 0], og: [9, 15], price: [240, 520], origins: ['ru', 'import']
  },
  mead: {
    descriptors: ['Honey', 'Wildflower', 'Berry', 'Spice', 'Oak', 'Forest', 'Heather', 'Golden', 'Cherry', 'Amber'],
    series: ['Mead', 'Melomel', 'Session Mead', 'Spiced Mead', 'Honey Wine'],
    breweries: ['Steppe Meadery', 'Medovarus', 'Mjod', 'Gravity Mead', 'Plan B', 'Big Village'],
    desc: 'Медовуха с выраженным медовым ароматом, фруктовостью и винной структурой.',
    abv: [5.0, 14.0], ibu: [0, 0], og: [12, 24], price: [280, 760], origins: ['ru', 'import']
  },
  fruit_beer: {
    descriptors: ['Berry', 'Peach', 'Citrus', 'Cherry', 'Lime', 'Pineapple', 'Guava', 'Raspberry', 'Passion', 'Plum'],
    series: ['Fruit Beer', 'Hard Seltzer', 'Fruit Ale', 'Sparkling Fruit', 'Seltzer'],
    breweries: ['Jaws', 'Big Village', 'Salden\'s', 'Bakunin', 'Panzer', 'AF Brew', 'Stamm'],
    desc: 'Фруктовое пиво или hard seltzer с ярким соковым профилем и освежающей карбонизацией.',
    abv: [4.0, 7.0], ibu: [0, 15], og: [8, 14], price: [230, 480], origins: ['ru', 'import']
  },
  na: {
    descriptors: ['Zero', 'Free', 'Clear', 'Balance', 'Fresh', 'Calm', 'Drive', 'Easy', 'Light', 'Bright'],
    series: ['N/A Beer', '0.0 Lager', 'Alcohol Free IPA', 'Free Ale', 'Zero Brew'],
    breweries: ['Jaws', 'Heineken', 'Clausthaler', 'Maisel', 'Weihenstephan', 'Балтика', 'Amstel', 'Hoegaarden'],
    desc: 'Безалкогольное пиво с чистым вкусом, легким телом и аккуратной хмелевой ароматиκой.',
    abv: [0.0, 0.5], ibu: [8, 28], og: [4, 7], price: [120, 420], origins: ['ru', 'import']
  },
  na_alt: {
    descriptors: ['Hop', 'Citrus', 'Ginger', 'Cola', 'Berry', 'Tonic', 'Tea', 'Yuzu', 'Mint', 'Basil'],
    series: ['N/A Kombucha', 'N/A Tonic Ale', 'Hop Water', 'Alcohol Free Sour', 'Sparkling Tea'],
    breweries: ['Jaws Lab', 'AF Brew Free', 'Big Village Zero', 'Hophead', 'Tarkos Zero', 'Plan B Free'],
    desc: 'Безалкогольная альтернатива с ярким вкусом, карбонизацией и крафтовым характером.',
    abv: [0.0, 0.3], ibu: [0, 18], og: [3, 6], price: [160, 360], origins: ['ru', 'import']
  },
};

export const roundToTen = (value) => Math.round(value / 10) * 10;
export const lerp = (min, max, progress) => min + (max - min) * progress;
export const pickFrom = (values, index, stride = 1) => values[(index * stride) % values.length];

export const buildGeneratedCatalog = (baseItems) => {
  const catalog = baseItems.map((item) => ({ ...item }));
  const takenKeys = new Set(catalog.map((item) => `${item.type}|${item.brewery}|${item.name}`.toLowerCase()));
  let nextId = Math.max(...catalog.map((item) => item.id)) + 1;

  const visibleStyleIds = CATEGORY_GROUPS.flatMap((group) => group.items.map((item) => item.id));

  visibleStyleIds.forEach((styleId) => {
    const profile = STYLE_LIBRARY[styleId];
    if (!profile) return;

    let existingCount = catalog.filter((item) => (
      item.type === styleId &&
      !item.isNotBeer &&
      item.origin !== 'archive' &&
      item.origin !== 'soon'
    )).length;

    let iteration = 0;
    while (existingCount < STYLE_TARGET_COUNT) {
      const brewery = pickFrom(profile.breweries, iteration, 3);
      const descriptor = pickFrom(profile.descriptors, iteration, 5);
      const series = pickFrom(profile.series, iteration, 7);
      const suffix = iteration >= (profile.descriptors.length * profile.series.length)
        ? ` ${Math.floor(iteration / Math.max(1, profile.series.length)) + 1}`
        : '';
      const name = `${descriptor} ${series}${suffix}`;
      const uniqueKey = `${styleId}|${brewery}|${name}`.toLowerCase();

      if (takenKeys.has(uniqueKey)) {
        iteration += 1;
        continue;
      }

      const progress = ((iteration % STYLE_TARGET_COUNT) + 1) / (STYLE_TARGET_COUNT + 1);
      const abv = Number(lerp(profile.abv[0], profile.abv[1], progress).toFixed(profile.abv[1] <= 1 ? 1 : 1));
      const ibu = Math.round(lerp(profile.ibu[0], profile.ibu[1], ((iteration * 13) % STYLE_TARGET_COUNT) / STYLE_TARGET_COUNT));
      const og = Number(lerp(profile.og[0], profile.og[1], ((iteration * 7) % STYLE_TARGET_COUNT) / STYLE_TARGET_COUNT).toFixed(1));
      const price = roundToTen(lerp(profile.price[0], profile.price[1], ((iteration * 11) % STYLE_TARGET_COUNT) / STYLE_TARGET_COUNT));
      const origin = pickFrom(profile.origins, iteration, 2);
      const isPromo = iteration % 7 === 0;
      const onTap = iteration % 6 === 0 && styleId !== 'barrel_aged' && styleId !== 'barleywine' && styleId !== 'ris' && styleId !== 'mead';
      const rating = Number((4.1 + (((iteration * 17) % 9) * 0.1)).toFixed(1));
      const carbsBase = styleId === 'smoothie' || styleId === 'pastry_stout' ? 7.2 : styleId === 'na' || styleId === 'na_alt' ? 4.6 : 4.2;

      const generatedItem = {
        id: nextId++,
        name,
        brewery,
        type: styleId,
        origin,
        onTap,
        isPromo,
        isNotBeer: false,
        abv,
        ibu,
        og,
        price,
        rating,
        image: '',
        desc: profile.desc,
        nutrition: {
          kcal: Math.round(28 + abv * 4 + carbsBase * 2),
          p: Number((0.2 + ((iteration % 5) * 0.1)).toFixed(1)),
          f: 0,
          c: Number((carbsBase + ((iteration % 4) * 0.5)).toFixed(1))
        }
      };

      catalog.push(generatedItem);
      takenKeys.add(uniqueKey);
      existingCount += 1;
      iteration += 1;
    }
  });

  catalog.forEach((item, index) => {
    if (item.isPromo && !item.oldPrice) {
      const discount = 0.08 + ((index % 6) * 0.03);
      item.oldPrice = roundToTen(item.price / (1 - discount));
    }
  });

  return catalog;
};

export const CATALOG_ITEMS = buildGeneratedCatalog(MOCK_ITEMS);

export const getVolumeLabel = (item) => {
  if (item.isNotBeer) return null;
  if (item.onTap) return '0.5 Л';
  if (item.type === 'barleywine' || item.type === 'ris' || item.type === 'barrel_aged') return '0.7 Л';
  if (item.origin === 'import' || item.abv >= 9) return '0.33 Л';
  return '0.5 Л';
};
