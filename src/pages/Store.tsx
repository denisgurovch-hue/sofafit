import { useEffect } from "react";
import StorefrontSection from "@/components/storefront/StorefrontSection";

const Store = () => {
  useEffect(() => {
    document.title = "MAISON — Дизайнерская мебель для современного дома";
    const meta = document.querySelector('meta[name="description"]');
    if (meta)
      meta.setAttribute(
        "content",
        "MAISON — премиальная современная мебель. Примерьте любой предмет в своей комнате с помощью AI ещё до покупки."
      );
  }, []);

  return <StorefrontSection />;
};

export default Store;
