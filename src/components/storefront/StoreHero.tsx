const StoreHero = () => {
  return (
    <section id="top" className="bg-store-bg border-b border-store-border">
      <div className="container py-14 md:py-20 max-w-3xl">
        <p className="text-[11px] uppercase tracking-[0.3em] text-store-meta mb-4">
          Новая коллекция · Весна 2026
        </p>
        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl leading-[1.05] text-store-ink">
          Дизайнерская мебель
          <br />
          для современного дома
        </h1>
        <p className="mt-5 text-store-ink-muted text-base md:text-lg max-w-xl">
          Создано в студии, сделано на века. Предметы, которые приносят тихое
          тепло в современные интерьеры — и выглядят в вашей комнате так же
          хорошо, как в нашем каталоге.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <a
            href="#collection"
            className="inline-flex h-11 items-center px-6 rounded-full bg-store-ink text-store-surface text-sm tracking-wide hover:opacity-90 transition-opacity"
          >
            Смотреть коллекцию
          </a>
          <a
            href="#cat-sofas"
            className="inline-flex h-11 items-center px-6 rounded-full border border-store-border text-store-ink text-sm tracking-wide hover:bg-store-accent transition-colors"
          >
            Купить диван
          </a>
        </div>
      </div>
    </section>
  );
};

export default StoreHero;
