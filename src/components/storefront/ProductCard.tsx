import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StoreProduct } from "./products";

/** object-contain + scale (как у Harmony) — диван целиком в кадре карточки */
const SCALED_CONTAIN_IMAGE_IDS = new Set([
  "harmony-sofa",
  "linden-sectional",
  "sloane-accent-sofa",
  "numo-mini-sofa",
  "ines-velur-sofa",
  "bons-graphite-sofa",
  "onte-line-sectional",
  "modula-beige-sofa",
  "onte-soft-sectional",
]);

interface ProductCardProps {
  product: StoreProduct;
}

const formatPrice = (n: number) =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(n);

const ProductCard = ({ product }: ProductCardProps) => {
  // Unique id per card so the snippet can be initialized once per card with
  // its own mountSelector / productImageSelector / productTitleSelector.
  const cardId = `fi-card-${product.id}`;
  const useScaledContainImage = SCALED_CONTAIN_IMAGE_IDS.has(product.id);

  return (
    <article
      id={cardId}
      className="group flex flex-col bg-store-surface rounded-xl border border-store-border overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-20px_rgba(20,15,10,0.25)]"
    >
      {/* DOM hooks expected by the FurnitureInpaintWidget snippet */}
      <div className="product-main-image relative aspect-[4/5] overflow-hidden bg-store-accent">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className={cn(
            "absolute inset-0 m-auto max-h-full max-w-full transition-transform duration-700",
            useScaledContainImage
              ? "object-contain scale-[1.008] origin-center group-hover:scale-[0.706]"
              : "h-full w-full object-cover group-hover:scale-[0.7]"
          )}
        />
        <span className="absolute top-3 left-3 inline-flex items-center px-2.5 py-1 rounded-full bg-store-surface/95 text-[10px] uppercase tracking-[0.15em] text-store-ink shadow-sm">
          {product.badge}
        </span>
        <button
          type="button"
          aria-label="В избранное"
          className="absolute top-3 right-3 h-8 w-8 inline-flex items-center justify-center rounded-full bg-store-surface/95 text-store-ink hover:bg-store-surface shadow-sm transition-colors"
        >
          <Heart className="h-4 w-4" />
        </button>
      </div>

      <div className="product-body flex flex-col flex-1 p-4 md:p-5">
        <p className="text-[10px] uppercase tracking-[0.2em] text-store-meta">{product.category}</p>
        <h2 className="mt-1.5 font-serif text-lg md:text-xl text-store-ink leading-snug">{product.name}</h2>
        <p className="mt-1 text-sm text-store-ink-muted line-clamp-2 min-h-[2.5rem]">{product.description}</p>
        <div className="mt-3 text-store-ink text-base font-medium">{formatPrice(product.price)}</div>

        {/* Snippet mounts the "AI Try" button into this node */}
        <div className="mt-4 widget-mount" />
      </div>
    </article>
  );
};

export default ProductCard;
