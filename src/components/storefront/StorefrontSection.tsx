import { useMemo, useState } from "react";
import StoreTopBar from "./StoreTopBar";
import StoreHero from "./StoreHero";
import ProductCard from "./ProductCard";
import { storeProducts, type StoreCategoryFilter } from "./products";
import { useFurnitureWidget } from "@/lib/useFurnitureWidget";

const StorefrontSection = () => {
  const [categoryFilter, setCategoryFilter] = useState<StoreCategoryFilter>("all");

  const filteredProducts = useMemo(
    () =>
      categoryFilter === "all"
        ? storeProducts
        : storeProducts.filter((p) => p.category === categoryFilter),
    [categoryFilter]
  );

  const cardIds = useMemo(
    () => filteredProducts.map((p) => `fi-card-${p.id}`),
    [filteredProducts]
  );
  const status = useFurnitureWidget(cardIds);

  const scrollToCollection = () => {
    document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleBrowseSofas = () => {
    setCategoryFilter("Диваны");
    scrollToCollection();
  };

  const handleShowAll = () => {
    setCategoryFilter("all");
    scrollToCollection();
  };

  return (
    <div className="bg-store-bg text-store-ink min-h-screen">
      <StoreTopBar activeFilter={categoryFilter} onFilterChange={setCategoryFilter} />
      <StoreHero onBrowseSofas={handleBrowseSofas} />

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
              {categoryFilter === "all" ? "Избранные предметы" : categoryFilter}
            </h2>
            <p className="mt-1.5 text-sm text-store-ink-muted">
              {categoryFilter === "all"
                ? "Современные must-have, отобранные нашей дизайн-студией."
                : `Категория «${categoryFilter}» в нашей демо-коллекции.`}
            </p>
          </div>
          <button
            type="button"
            onClick={handleShowAll}
            className="hidden md:inline text-sm text-store-ink underline underline-offset-4 hover:opacity-70"
          >
            Смотреть все
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6 lg:gap-8">
          {filteredProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
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
