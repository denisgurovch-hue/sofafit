const assetBaseUrl =
  "https://tfivxdtxvjgxwyiwflsh.supabase.co/storage/v1/object/public/generation-images";

const harmonySofa = `${assetBaseUrl}/store%2Fharmony-sofa.jpeg`;
const lindenSectional = `${assetBaseUrl}/store%2Flinden-sectional.jpg`;
const filsSofa = `${assetBaseUrl}/sofas%2Ffils-mini-latte.jpg`;
const averyChair = `${assetBaseUrl}/store%2Favery-lounge-chair.jpg`;
const nolanTable = `${assetBaseUrl}/store%2Fnolan-coffee-table.jpg`;
const miraTable = `${assetBaseUrl}/store%2Fmira-side-table.jpg`;
const ellisBed = `${assetBaseUrl}/store%2Fellis-bed-frame.jpg`;
const rowanLamp = `${assetBaseUrl}/store%2Frowan-floor-lamp.jpg`;

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
    name: "Угловой диван Linden",
    category: "Диваны",
    price: 289000,
    badge: "Новинка",
    description:
      "Просторный модульный силуэт для семейных комнат и интерьеров открытой планировки.",
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
