# SofaFit (Minimal Storefront)

Production repository for the trimmed SofaFit version:

- `/` landing page
- `/store` storefront page
- `*` 404 page

## Widget (AI-примерка на карточке товара)

Как подключить сниппет, какие селекторы и параметры `init`, живые примеры — см. **`docs/widget-integration.md`**.

## Deployment

See **`DEPLOY.md`** for:

- Docker deploy of this site (`/opt/sofafit`), HTTPS / reverse proxy
- **Embed widget** ([`sofafit-room-designer`](https://github.com/denisgurovch-hue/sofafit-room-designer)): build, copy into `furniture-inpaint-api`, Git workflow (Lovable + Cursor), production SSH deploy key on the server
