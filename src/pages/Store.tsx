import { useEffect } from "react";
import StorefrontSection from "@/components/storefront/StorefrontSection";
import {
  getSiteBaseUrl,
  setCanonical,
  setOg,
  setRobots,
  setTwitterMeta,
} from "@/lib/seo";

const STORE_TITLE = "MAISON — Дизайнерская мебель для современного дома";
const STORE_DESCRIPTION =
  "MAISON — премиальная современная мебель. Примерьте любой предмет в своей комнате с помощью AI ещё до покупки.";

const Store = () => {
  useEffect(() => {
    document.title = STORE_TITLE;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", STORE_DESCRIPTION);

    const base = getSiteBaseUrl();
    const url = `${base}/store`;
    setCanonical(url);
    setOg("og:url", url);
    setOg("og:title", STORE_TITLE);
    setOg("og:description", STORE_DESCRIPTION);
    setTwitterMeta("twitter:title", STORE_TITLE);
    setTwitterMeta("twitter:description", STORE_DESCRIPTION);
    setRobots(null);
  }, []);

  return <StorefrontSection />;
};

export default Store;
