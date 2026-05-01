import { Heart } from "lucide-react";
import type { StoreProduct } from "./products";

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
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[0.7]"
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
