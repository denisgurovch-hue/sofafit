import { useEffect, useState } from "react";

const SNIPPET_URL =
  "https://demo.sofafit.ru/static/product-card-snippet.js?v=iframe-loader-1";
const API_BASE_URL = "https://demo.sofafit.ru";

declare global {
  interface Window {
    FurnitureInpaintWidget?: {
      init: (opts: {
        apiBaseUrl: string;
        mountSelector: string;
        productImageSelector: string;
        productTitleSelector?: string;
        partnerKey?: string;
        buttonText?: string;
        modalTitle?: string;
      }) => void;
    };
  }
}

const SCRIPT_ATTR = "data-furniture-inpaint-loader";

const loadScriptOnce = (): Promise<void> => {
  if (typeof window === "undefined") return Promise.reject(new Error("ssr"));
  if (window.FurnitureInpaintWidget) return Promise.resolve();

  const existing = document.querySelector<HTMLScriptElement>(
    `script[${SCRIPT_ATTR}]`
  );
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("snippet failed to load"))
      );
    });
  }

  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SNIPPET_URL;
    s.async = true;
    s.setAttribute(SCRIPT_ATTR, "1");
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("snippet failed to load"));
    document.head.appendChild(s);
  });
};

/**
 * Loads the FurnitureInpaintWidget snippet from 193.187.95.17 and initializes
 * it once per card id. The snippet's init() uses document.querySelector for
 * its selectors, so each card needs its own scoped selectors via #cardId.
 */
export function useFurnitureWidget(cardIds: string[]) {
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">(
    "idle"
  );

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");


    loadScriptOnce()
      .then(async () => {
        if (cancelled) return;
        const widget = window.FurnitureInpaintWidget;
        if (!widget) {
          setStatus("error");
          return;
        }
        // init each card with selectors scoped to that card id
        for (const id of cardIds) {
          if (cancelled) return;
          const root = document.getElementById(id);
          if (!root) continue;
          const mount = root.querySelector(".widget-mount");
          // Only init if mount is empty (snippet itself also guards via attr)
          if (mount && mount.childElementCount > 0) continue;

          // The widget backend (demo.sofafit.ru) downloads the product image
          // by URL. Vite serves assets at relative paths like "/assets/x.jpg",
          // which the backend would resolve against its own origin and get 403.
          // Force the <img src> to an absolute URL on our origin so the
          // backend can fetch it successfully.
          const productImg = root.querySelector<HTMLImageElement>(
            ".product-main-image img"
          );
          if (productImg) {
            const currentSrc = productImg.getAttribute("src") || productImg.src;
            if (currentSrc && !/^https?:\/\//i.test(currentSrc) && !currentSrc.startsWith("data:")) {
              productImg.src = new URL(currentSrc, window.location.origin).href;
            }
          }

          // NOTE: Do NOT replace the <img src> with a data: URL here.
          // The widget snippet now runs inside an iframe (iframe-loader-1)
          // hosted on demo.sofafit.ru, and passing a giant base64 data: URL
          // across origins breaks the iframe (it shows a broken-image
          // placeholder and never renders the UI). The product image must
          // remain a normal http(s) URL so the iframe can load it.
          widget.init({
            apiBaseUrl: API_BASE_URL,
            mountSelector: `#${id} .widget-mount`,
            productImageSelector: `#${id} .product-main-image img`,
            productTitleSelector: `#${id} .product-body h2`,
            buttonText: "AI-примерка",
            modalTitle: "AI-примерка мебели",
          });

          // The snippet creates a position:fixed modal inside .widget-mount.
          // Because the card uses CSS transforms on hover (translate/scale),
          // any descendant with position:fixed becomes positioned relative
          // to the transformed ancestor and "jumps" on hover.
          // Move the modal out to <body> so it's truly fixed to the viewport.
          const modal = root.querySelector<HTMLElement>(".widget-mount .fi-modal");
          if (modal && modal.parentElement !== document.body) {
            modal.setAttribute("data-fi-card", id);
            document.body.appendChild(modal);
          }
        }
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
      // Remove any modals we relocated to <body> so re-mounts don't pile up.
      cardIds.forEach((id) => {
        document
          .querySelectorAll(`body > [data-fi-card="${id}"]`)
          .forEach((node) => node.remove());
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardIds.join("|")]);

  return status;
}
