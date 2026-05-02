/** Base URL for canonical / Open Graph (prod: env or window.location.origin). */
export function getSiteBaseUrl(): string {
  if (typeof window === "undefined") return "https://sofafit.ru";
  const fromEnv = import.meta.env.VITE_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  return window.location.origin;
}

function upsertMeta(attrName: "name" | "property", key: string, content: string) {
  let el = document.querySelector(`meta[${attrName}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attrName, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export function setCanonical(href: string) {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.rel = "canonical";
    document.head.appendChild(link);
  }
  link.href = href;
}

export function setOg(property: string, content: string) {
  upsertMeta("property", property, content);
}

export function setTwitterMeta(name: string, content: string) {
  upsertMeta("name", name, content);
}

/** Pass `null` to remove noindex and allow indexing again. */
export function setRobots(content: string | null) {
  const existing = document.querySelector('meta[name="robots"]');
  if (content === null) {
    existing?.remove();
    return;
  }
  upsertMeta("name", "robots", content);
}
