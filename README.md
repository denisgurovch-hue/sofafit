# SofaFit (Minimal Storefront)

Production repository for the trimmed SofaFit version:

- `/` landing page
- `/store` storefront page
- `*` 404 page

## SEO

Статика: `public/robots.txt` (с `Sitemap:`), `public/sitemap.xml`, `favicon.svg`. В `index.html` — `lang="ru"`, canonical/OG-заглушки с подстановкой `__SITE_URL__` при сборке, JSON-LD Organization + WebSite. На `/` и `/store` мета и OG обновляются в рантайме ([`src/lib/seo.ts`](src/lib/seo.ts)). Для 404 — `noindex` в [`NotFound`](src/pages/NotFound.tsx). Опционально: `VITE_SITE_URL` в `.env` (см. `.env.example`).

## Widget (AI-примерка на карточке товара)

Как подключить сниппет, какие селекторы и параметры `init`, живые примеры — см. **`docs/widget-integration.md`**.

## Deployment

See **`DEPLOY.md`** for:

- Docker deploy of this site (`/opt/sofafit`), HTTPS / reverse proxy
- **Embed widget** ([`sofafit-room-designer`](https://github.com/denisgurovch-hue/sofafit-room-designer)): build, copy into `furniture-inpaint-api`, Git workflow (Lovable + Cursor), production SSH deploy key on the server
