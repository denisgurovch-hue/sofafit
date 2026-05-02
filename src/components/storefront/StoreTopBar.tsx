import { Search, Heart, User, ShoppingBag } from "lucide-react";
import {
  storeCategories,
  type StoreCategory,
  type StoreCategoryFilter,
} from "./products";

interface StoreTopBarProps {
  activeFilter: StoreCategoryFilter;
  onFilterChange: (filter: StoreCategoryFilter) => void;
}

const StoreTopBar = ({ activeFilter, onFilterChange }: StoreTopBarProps) => {
  const scrollToCollection = () => {
    document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" });
  };

  const pick = (filter: StoreCategoryFilter) => {
    onFilterChange(filter);
    scrollToCollection();
  };

  const linkClass = (active: boolean) =>
    [
      "text-[13px] tracking-wide transition-colors whitespace-nowrap",
      active ? "text-store-ink font-semibold" : "text-store-ink/80 hover:text-store-ink",
    ].join(" ");

  return (
    <header className="sticky top-0 z-40 bg-store-surface/95 backdrop-blur border-b border-store-border">
      <div className="container">
        {/* Top row */}
        <div className="flex h-16 items-center gap-6">
          {/* Logo */}
          <a href="#top" className="flex items-baseline gap-1 shrink-0">
            <span className="font-serif text-xl tracking-[0.15em] text-store-ink">
              MAISON
            </span>
            <span className="text-[10px] uppercase tracking-[0.25em] text-store-meta">
              · est. 2014
            </span>
          </a>

          {/* Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-auto">
            <label className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-store-meta" />
              <input
                type="text"
                placeholder="Поиск по коллекции"
                className="w-full h-10 pl-9 pr-4 rounded-full bg-store-bg border border-store-border text-sm text-store-ink placeholder:text-store-meta focus:outline-none focus:ring-2 focus:ring-store-ink/10"
              />
            </label>
          </div>

          {/* Icons */}
          <nav className="flex items-center gap-1 ml-auto md:ml-0">
            <button
              type="button"
              aria-label="Избранное"
              className="h-9 w-9 inline-flex items-center justify-center rounded-full hover:bg-store-accent text-store-ink transition-colors"
            >
              <Heart className="h-4.5 w-4.5" />
            </button>
            <button
              type="button"
              aria-label="Аккаунт"
              className="h-9 w-9 inline-flex items-center justify-center rounded-full hover:bg-store-accent text-store-ink transition-colors"
            >
              <User className="h-4.5 w-4.5" />
            </button>
            <button
              type="button"
              aria-label="Корзина"
              className="relative h-9 w-9 inline-flex items-center justify-center rounded-full hover:bg-store-accent text-store-ink transition-colors"
            >
              <ShoppingBag className="h-4.5 w-4.5" />
              <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-store-ink text-store-surface text-[10px] font-medium inline-flex items-center justify-center">
                2
              </span>
            </button>
          </nav>
        </div>

        {/* Categories row — filters catalog */}
        <nav
          className="flex h-11 items-center justify-start md:justify-center gap-6 md:gap-8 border-t border-store-border/70 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Категории каталога"
        >
          <button
            type="button"
            onClick={() => pick("all")}
            className={linkClass(activeFilter === "all")}
          >
            Все
          </button>
          {storeCategories.map((c: StoreCategory) => (
            <button
              key={c}
              type="button"
              onClick={() => pick(c)}
              className={linkClass(activeFilter === c)}
            >
              {c}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default StoreTopBar;
