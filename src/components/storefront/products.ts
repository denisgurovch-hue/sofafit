const harmonySofa = "/store/harmony-sofa.jpeg";
const lindenSectional = "/store/linden-sectional.png";
const filsSofa = "/sofas/fils-mini-latte.jpg";
const numoMiniYellow = "/store/numo-mini-yellow.png";
const inesVelurGrey = "/store/ines-velur-grey.png";
const bonsVelvetGraphite = "/store/bons-t-velvet-graphite.png";
const onteSectionalMetal = "/store/onte-bukle-sectional-right.png";
const modulaBeige = "/store/modula-beige-three-seater.png";
const onteSectionalWood = "/store/onte-bukle-sectional-left.png";
const averyChair = "/store/avery-lounge-chair.jpg";
const nolanTable = "/store/nolan-coffee-table.jpg";
const miraTable = "/store/mira-side-table.jpg";
const ellisBed = "/store/ellis-bed-frame.jpg";
const rowanLamp = "/store/rowan-floor-lamp.jpg";

export type StoreCategory =
  | "Диваны"
  | "Кресла"
  | "Столы"
  | "Кровати"
  | "Освещение";
export type StoreBadge = "Новинка" | "Хит продаж" | "Лимитированно" | "Выбор редакции";

export interface StoreProduct {
  id: string;
  name: string;
  category: StoreCategory;
  price: number;
  badge: StoreBadge;
  description: string;
  image: string;
}

export const storeProducts: StoreProduct[] = [
  {
    id: "harmony-sofa",
    name: "Диван Harmony",
    category: "Диваны",
    price: 189000,
    badge: "Хит продаж",
    description:
      "Скульптурные линии, глубокая посадка и мягкая практичная обивка для современных гостиных.",
    image: harmonySofa,
  },
  {
    id: "linden-sectional",
    name: "Диван Linden",
    category: "Диваны",
    price: 289000,
    badge: "Новинка",
    description:
      "Двухместный диван с бежевой обивкой, тонкими чёрными металлическими ножками и комплектом подушек — спокойный силуэт для светлых гостиных.",
    image: lindenSectional,
  },
  {
    id: "avery-lounge-chair",
    name: "Кресло Avery",
    category: "Кресла",
    price: 67000,
    badge: "Выбор редакции",
    description:
      "Низкое кресло с ножками из ореха и аккуратной обивкой из букле.",
    image: averyChair,
  },
  {
    id: "nolan-coffee-table",
    name: "Журнальный стол Nolan",
    category: "Столы",
    price: 86000,
    badge: "Лимитированно",
    description:
      "Основание из массива дерева и каменная столешница с тёплой современной отделкой.",
    image: nolanTable,
  },
  {
    id: "mira-side-table",
    name: "Приставной столик Mira",
    category: "Столы",
    price: 47000,
    badge: "Новинка",
    description:
      "Компактный акцентный столик с минималистичным силуэтом и деталями из шлифованного металла.",
    image: miraTable,
  },
  {
    id: "ellis-bed-frame",
    name: "Кровать Ellis",
    category: "Кровати",
    price: 149000,
    badge: "Хит продаж",
    description:
      "Кровать-платформа с мягким изголовьем и спокойным силуэтом в духе бутик-отелей.",
    image: ellisBed,
  },
  {
    id: "rowan-floor-lamp",
    name: "Торшер Rowan",
    category: "Освещение",
    price: 41000,
    badge: "Выбор редакции",
    description:
      "Скульптурный торшер с льняным абажуром и архитектурной формой.",
    image: rowanLamp,
  },
  {
    id: "sloane-accent-sofa",
    name: "Акцентный диван Sloane",
    category: "Диваны",
    price: 162000,
    badge: "Лимитированно",
    description:
      "Компактный акцентный диван с элегантными пропорциями для небольших пространств.",
    image: filsSofa,
  },
  {
    id: "numo-mini-sofa",
    name: "Диван Numo Mini",
    category: "Диваны",
    price: 145000,
    badge: "Новинка",
    description:
      "Двухместный диван в стиле mid-century: горчичная обивка, стёганый спинка и конические деревянные ножки.",
    image: numoMiniYellow,
  },
  {
    id: "ines-velur-sofa",
    name: "Диван Ines Velvet",
    category: "Диваны",
    price: 178000,
    badge: "Выбор редакции",
    description:
      "Графитовый велюр, массивные подлокотники и цельная подушка сиденья — спокойный минималистичный силуэт.",
    image: inesVelurGrey,
  },
  {
    id: "bons-graphite-sofa",
    name: "Диван Bons",
    category: "Диваны",
    price: 139000,
    badge: "Новинка",
    description:
      "Компактный стёганый диван глубокого графитового цвета — выразительная фактура и светлые деревянные ножки.",
    image: bonsVelvetGraphite,
  },
  {
    id: "onte-line-sectional",
    name: "Угловой диван Onte Line",
    category: "Диваны",
    price: 319000,
    badge: "Хит продаж",
    description:
      "Светло-серый модуль с оттоманкой: пластичные подушки и тонкие металлические опоры для лёгкого современного силуэта.",
    image: onteSectionalMetal,
  },
  {
    id: "modula-beige-sofa",
    name: "Модульный диван Modula",
    category: "Диваны",
    price: 269000,
    badge: "Лимитированно",
    description:
      "Три секции, мягкие бежевые объёмы и декоративные подушки — низкий профиль и спокойная палитра для светлых интерьеров.",
    image: modulaBeige,
  },
  {
    id: "onte-soft-sectional",
    name: "Угловой диван Onte Soft",
    category: "Диваны",
    price: 299000,
    badge: "Новинка",
    description:
      "П-образная конфигурация из текстурированной серой ткани на деревянном основании с мягкими скруглёнными формами.",
    image: onteSectionalWood,
  },
];

export const storeCategories: StoreCategory[] = [
  "Диваны",
  "Кресла",
  "Столы",
  "Кровати",
  "Освещение",
];

export const categorySlug: Record<StoreCategory, string> = {
  "Диваны": "sofas",
  "Кресла": "chairs",
  "Столы": "tables",
  "Кровати": "beds",
  "Освещение": "lighting",
};

/** Menu filter: one category or entire catalog */
export type StoreCategoryFilter = StoreCategory | "all";
