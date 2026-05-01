import { useMemo } from "react";
import StoreTopBar from "./StoreTopBar";
import StoreHero from "./StoreHero";
import ProductCard from "./ProductCard";
import { storeProducts, storeCategories, categorySlug } from "./products";
import { useFurnitureWidget } from "@/lib/useFurnitureWidget";

const StorefrontSection = () => {
  const cardIds = useMemo(
    () => storeProducts.map((p) => `fi-card-${p.id}`),
    []
  );
  const status = useFurnitureWidget(cardIds);


  return (
    <div className="bg-store-bg text-store-ink min-h-screen">
      <StoreTopBar />
      <StoreHero />

      {status === "error" && (
        <div className="bg-amber-50 border-y border-amber-200 text-amber-900 text-sm">
          <div className="container py-3">
            ⚠ Не удалось загрузить виджет AI-примерки с demo.sofafit.ru.
          </div>
        </div>
      )}

      <main id="collection" className="container py-12 md:py-16">
        <div className="flex items-end justify-between mb-8 md:mb-10 gap-4">
          <div>
            <h2 className="font-serif text-2xl md:text-3xl text-store-ink">
              Избранные предметы
            </h2>
            <p className="mt-1.5 text-sm text-store-ink-muted">
              Восемь современных must-have, отобранных нашей дизайн-студией.
            </p>
          </div>
          <a
            href="#all"
            className="hidden md:inline text-sm text-store-ink underline underline-offset-4 hover:opacity-70"
          >
            Смотреть все
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6 lg:gap-8">
          {storeProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        <div aria-hidden className="sr-only">
          {storeCategories.map((c) => (
            <span key={c} id={`cat-${categorySlug[c]}`} />
          ))}
        </div>
      </main>

      <footer className="border-t border-store-border bg-store-surface">
        <div className="container py-8 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-store-meta">
          <span>© {new Date().getFullYear()} MAISON. Все права защищены.</span>
          <span>
            Демо-витрина работает на{" "}
            <a href="/" className="text-store-ink hover:underline">
              SofaFit
            </a>
            .
          </span>
        </div>
      </footer>
    </div>
  );
};

export default StorefrontSection;
