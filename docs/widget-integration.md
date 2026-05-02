# Встраивание виджета AI-примерки (product card)

Виджет загружает сценарий примерки мебели в интерьере: кнопка на карточке товара открывает модальное окно (iframe на стороне SofaFit API).

Исходники **сниппета и UI в iframe** живут в отдельном проекте [`sofafit-room-designer`](https://github.com/denisgurovch-hue/sofafit-room-designer); сборка попадает в API как статика на `demo.sofafit.ru` (см. **`DEPLOY.md`**). Этот репозиторий показывает **пример интеграции** на React и служит демо-витриной.

---

## Живые примеры

| Что смотреть | URL |
|--------------|-----|
| Минимальная статическая страница с одной карточкой | [https://193.187.95.17/static/demo-product-card.html](https://193.187.95.17/static/demo-product-card.html) |
| Демо-магазин: сетка карточек, фильтры категорий | [https://sofafit.ru/store](https://sofafit.ru/store) |

Реализация витрины в коде: страница [`Store`](../src/pages/Store.tsx) → [`StorefrontSection`](../src/components/storefront/StorefrontSection.tsx) → [`ProductCard`](../src/components/storefront/ProductCard.tsx), инициализация — [`useFurnitureWidget`](../src/lib/useFurnitureWidget.ts).

---

## Подключение скрипта

Подключите скрипт с продакшена API (тот же URL, что использует демо):

```text
https://demo.sofafit.ru/static/product-card-snippet.js?v=iframe-loader-1
```

После загрузки доступен глобальный объект **`window.FurnitureInpaintWidget`** с методом **`init(options)`**.

---

## Параметры `init`

| Поле | Обязательно | Описание |
|------|-------------|----------|
| `apiBaseUrl` | да | Базовый URL API, например `https://demo.sofafit.ru` |
| `mountSelector` | да | CSS-селектор узла, куда вставится кнопка (например `#fi-card-sofa-1 .widget-mount`) |
| `productImageSelector` | да | Селектор `<img>` с фото товара для примерки |
| `productTitleSelector` | нет | Селектор заголовка товара (для подписей в сценарии) |
| `partnerKey` | нет | Ключ партнёра, если включена выдача по договору |
| `buttonText` | нет | Текст кнопки (по умолчанию у демо: «AI-примерка») |
| `modalTitle` | нет | Заголовок модального окна |

Сигнатура дублируется в TypeScript: [`useFurnitureWidget.ts`](../src/lib/useFurnitureWidget.ts) (`declare global` для `FurnitureInpaintWidget`).

---

## Контракт разметки (рекомендуемый минимум)

Чтобы на одной странице было несколько карточек, у каждой должен быть **свой корень** с уникальным `id`, а селекторы — **областью этого корня** (как `#fi-card-…` в примере ниже).

Пример структуры (упрощённо):

```html
<article id="fi-card-my-sofa">
  <div class="product-main-image">
    <img src="https://example.com/shop/sofa.jpg" alt="Диван" />
  </div>
  <div class="product-body">
    <h2>Название товара</h2>
    <!-- … цена и т.д. -->
    <div class="widget-mount"></div>
  </div>
</article>
```

Инициализация для этой карточки:

```js
FurnitureInpaintWidget.init({
  apiBaseUrl: "https://demo.sofafit.ru",
  mountSelector: "#fi-card-my-sofa .widget-mount",
  productImageSelector: "#fi-card-my-sofa .product-main-image img",
  productTitleSelector: "#fi-card-my-sofa .product-body h2",
  buttonText: "AI-примерка",
  modalTitle: "AI-примерка мебели",
});
```

Имена классов (`product-main-image`, `product-body`, `widget-mount`) на вашем сайте могут быть любыми — важно, чтобы **`init` получал корректные селекторы**.

---

## URL изображения товара

Бэкенд скачивает фото по URL из атрибута `src` у выбранного `<img>`.

- Должен быть **обычный HTTP(S)-URL**, доступный с серверов SofaFit (не `data:` в огромном объёме — это ломает сценарий с iframe).
- Если у вас относительный путь (`/images/sofa.jpg`), перед `init` преобразуйте его в **абсолютный** относительно вашего сайта:  
  `new URL(relativeSrc, window.location.origin).href`  
  (так делает [`useFurnitureWidget`](../src/lib/useFurnitureWidget.ts).)

---

## Особенности демо-витрины (React)

На [sofafit.ru/store](https://sofafit.ru/store):

- У карточки есть **CSS-трансформации при hover**; модалку после создания переносят в **`document.body`**, чтобы `position: fixed` не ломался (см. код в [`useFurnitureWidget.ts`](../src/lib/useFurnitureWidget.ts)).
- На других сайтах при необходимости повторите этот приём или упростите стили карточки.

---

## Безопасность и окружение

- Убедитесь, что **CSP** (если включён) разрешает загрузку скрипта с `demo.sofafit.ru`, работу **iframe** и запросы к API по вашей политике.
- Для продакшена домены и ключи могут отличаться — уточняйте у команды SofaFit при подключении партнёра.

---

## Где что лежит

| Что | Где |
|-----|-----|
| Пример React + список карточек | [`src/components/storefront/`](../src/components/storefront/), [`src/lib/useFurnitureWidget.ts`](../src/lib/useFurnitureWidget.ts) |
| Деплой статики виджета / embed | **`DEPLOY.md`** |
| Репозиторий UI embed | [`sofafit-room-designer`](https://github.com/denisgurovch-hue/sofafit-room-designer) |
