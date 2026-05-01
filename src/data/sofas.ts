import inesVelurGrey from "@/assets/sofas/ines-velur-grey.jpeg";
import numoMiniYellow from "@/assets/sofas/numo-mini-yellow.jpg";
import slipsonLightGrey from "@/assets/sofas/slipson-light-grey.jpeg";
import filsMiniLatte from "@/assets/sofas/fils-mini-latte.jpg";
import dangoGraphite from "@/assets/sofas/dango-graphite.jpg";
import dangoGraphiteTQL from "@/assets/sofas/dango-graphite-three-quarter-left.jpg";
import dangoGraphiteTQR from "@/assets/sofas/dango-graphite-three-quarter-right.jpg";
import edvinVelurGrey from "@/assets/sofas/edvin-velur-grey.jpeg";
import onteBukleGrey from "@/assets/sofas/onte-bukle-grey.jpeg";
import bonsTVelvetGraphite from "@/assets/sofas/bons-t-velvet-graphite.jpg";
import klaud200 from "@/assets/sofas/klaud-200.webp";

export type SofaType = "straight" | "corner" | "armchair";
export type SofaStyle = "modern" | "scandinavian" | "classic" | "minimal";
export type ColorTone = "light" | "dark" | "colorful" | "neutral";
export type PriceTier = "low" | "medium" | "high";
export type UsageScenario = "movies" | "guests" | "sleeping" | "pets-kids";

export type SofaAngle =
  | "front"
  | "front-left"
  | "front-right"
  | "side-left"
  | "side-right"
  | "three-quarter-left"
  | "three-quarter-right";

export interface SofaImageVariant {
  angle: SofaAngle;
  image: string;
}

export interface Sofa {
  id: string;
  name: string;
  type: SofaType;
  description: string;
  dimensions: string;
  material: string;
  color: string;
  price: number;
  image: string;
  /**
   * Optional alternative shots of the same sofa from different angles.
   * If provided, the app picks the best matching one for the detected room perspective.
   * If empty, `image` is used (current behavior, no regression).
   */
  variants?: SofaImageVariant[];
  url: string;
  style: SofaStyle[];
  colorTone: ColorTone;
  priceTier: PriceTier;
  goodFor: UsageScenario[];
  minRoomSize: number;
  lengthCm: number;
}

export const sofas: Sofa[] = [
  {
    id: "ines-velur-grey",
    name: "Инес Велюр Серый",
    type: "straight",
    description: "Компактный двухместный диван с прямыми подлокотниками и мягкой велюровой обивкой. Устойчивые деревянные ножки придают лёгкость силуэту. Идеален для небольших гостиных и студий.",
    dimensions: "152 × 83 × 85 см",
    material: "Велюр",
    color: "Серый",
    price: 23990,
    image: inesVelurGrey,
    url: "https://www.divan.ru/product/divan-ines-velvet-grey",
    style: ["scandinavian", "minimal", "modern"],
    colorTone: "neutral",
    priceTier: "low",
    goodFor: ["movies", "guests"],
    minRoomSize: 10,
    lengthCm: 152,
  },
  {
    id: "numo-mini-yellow",
    name: "Нумо-Мини 120 Рогожка Жёлтый",
    type: "straight",
    description: "Компактный диван с декоративной прострочкой на спинке и сиденье. Яркая рогожка и светлые деревянные ножки создают тёплую атмосферу. Отлично впишется в небольшую гостиную или кабинет.",
    dimensions: "120 × 82 × 84 см",
    material: "Рогожка",
    color: "Жёлтый",
    price: 18990,
    image: numoMiniYellow,
    url: "https://www.divan.ru/product/divan-numo-mini-textile-yellow",
    style: ["scandinavian", "modern"],
    colorTone: "colorful",
    priceTier: "low",
    goodFor: ["guests", "pets-kids"],
    minRoomSize: 8,
    lengthCm: 120,
  },
  {
    id: "slipson-light-grey",
    name: "Слипсон Вельвет Светло-Серый",
    type: "straight",
    description: "Элегантный трёхместный диван с мягкими подушками спинки и удобными подлокотниками. Вельветовая обивка светло-серого оттенка и светлые деревянные ножки создают воздушный, современный образ.",
    dimensions: "210 × 90 × 88 см",
    material: "Вельвет",
    color: "Светло-серый",
    price: 39990,
    image: slipsonLightGrey,
    url: "https://www.divan.ru/product/divan-slipson-velvet-silver",
    style: ["modern", "scandinavian", "classic"],
    colorTone: "light",
    priceTier: "medium",
    goodFor: ["movies", "guests", "sleeping"],
    minRoomSize: 16,
    lengthCm: 210,
  },
  {
    id: "fils-mini-latte",
    name: "Филс-Мини 140 Велюр Латте",
    type: "straight",
    description: "Компактный двухместный диван с мягкими подушками и прямыми подлокотниками. Велюровая обивка цвета латте и тёмные ножки создают уютный, современный образ. Идеален для небольших гостиных.",
    dimensions: "140 × 82 × 86 см",
    material: "Велюр",
    color: "Латте",
    price: 22990,
    image: filsMiniLatte,
    url: "https://www.divan.ru/product/divan-pryamoj-fils-mini-140-velvet-coffe",
    style: ["modern", "minimal"],
    colorTone: "neutral",
    priceTier: "low",
    goodFor: ["movies", "guests"],
    minRoomSize: 10,
    lengthCm: 140,
  },
  {
    id: "dango-graphite",
    name: "Данго Букле Графитовый",
    type: "straight",
    description: "Компактная кушетка с мягкими округлыми формами и обивкой из букле графитового оттенка. Объёмные подлокотники и спинка создают уютный, обволакивающий силуэт. Идеальна для современных интерьеров.",
    dimensions: "180 × 85 × 80 см",
    material: "Букле",
    color: "Графитовый",
    price: 49990,
    image: dangoGraphite,
    variants: [
      { angle: "three-quarter-left", image: dangoGraphiteTQL },
      { angle: "three-quarter-right", image: dangoGraphiteTQR },
    ],
    url: "https://www.divan.ru/product/divan-pryamoj-fils-mini-140-velvet-coffe",
    style: ["modern", "minimal"],
    colorTone: "dark",
    priceTier: "medium",
    goodFor: ["movies", "sleeping"],
    minRoomSize: 14,
    lengthCm: 180,
  },
  {
    id: "edvin-velur-grey",
    name: "Эдвин Велюр Серый",
    type: "corner",
    description: "Угловой диван с лаконичным дизайном и велюровой обивкой серого оттенка. Модульная конструкция с оттоманкой и тонкие металлические ножки создают современный, воздушный силуэт. Идеален для просторных гостиных.",
    dimensions: "250 × 160 × 82 см",
    material: "Велюр",
    color: "Серый",
    price: 59990,
    image: edvinVelurGrey,
    url: "https://www.divan.ru/product/divan-uglovoj-edvin-velvet-grey",
    style: ["modern", "minimal"],
    colorTone: "neutral",
    priceTier: "high",
    goodFor: ["movies", "guests", "sleeping"],
    minRoomSize: 20,
    lengthCm: 250,
  },
  {
    id: "onte-bukle-grey",
    name: "Онте Букле Серый",
    type: "corner",
    description: "Угловой диван с мягкими округлыми формами и обивкой из букле светло-серого оттенка. Деревянные ножки-полозья придают скандинавский шарм. Просторное сиденье с оттоманкой для максимального комфорта.",
    dimensions: "240 × 155 × 80 см",
    material: "Букле",
    color: "Серый",
    price: 54990,
    image: onteBukleGrey,
    url: "https://www.divan.ru/product/divan-uglovoj-onte-bucle-silver",
    style: ["scandinavian", "modern"],
    colorTone: "light",
    priceTier: "high",
    goodFor: ["movies", "guests", "sleeping", "pets-kids"],
    minRoomSize: 18,
    lengthCm: 240,
  },
  {
    id: "bons-t-velvet-graphite",
    name: "Бонс Т Вельвет Графитовый",
    type: "armchair",
    description: "Уютное кресло с мягкой стёганой спинкой и объёмным сиденьем. Вельветовая обивка графитового оттенка и светлые деревянные ножки создают стильный скандинавский акцент. Идеально как компаньон к дивану.",
    dimensions: "85 × 78 × 82 см",
    material: "Вельвет",
    color: "Графитовый",
    price: 19990,
    image: bonsTVelvetGraphite,
    url: "https://www.divan.ru/product/kreslo-bons-t-velvet-emerald?upholstery=24489-7-1",
    style: ["scandinavian", "classic"],
    colorTone: "dark",
    priceTier: "low",
    goodFor: ["movies"],
    minRoomSize: 8,
    lengthCm: 85,
  },
  {
    id: "klaud-200",
    name: "Клауд 200×85",
    type: "straight",
    description: "Дизайнерский прямой двухместный диван на высоких чёрных металлических ножках. Каркас — берёзовая фанера, наполнение — пенополиуретан разной плотности и синтешар. Лаконичный современный силуэт.",
    dimensions: "200 × 85 × 85 см",
    material: "Велюр",
    color: "Серо-бежевый",
    price: 212100,
    image: klaud200,
    url: "https://lavsit.ru/product/divan-klaud/?attribute_pa_config-cloud-sofa=200-x-85",
    style: ["modern", "minimal"],
    colorTone: "neutral",
    priceTier: "high",
    goodFor: ["movies", "guests"],
    minRoomSize: 14,
    lengthCm: 200,
  },
];

export const typeLabels: Record<SofaType, string> = {
  straight: "Прямые",
  corner: "Угловые",
  armchair: "Кресла",
};
