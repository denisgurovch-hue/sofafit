import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getSiteBaseUrl, setCanonical, setOg, setRobots, setTwitterMeta } from "@/lib/seo";

const NotFound = () => {
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);

    const title = `${t("notFound.title")} — SofaFit`;
    const description = t("notFound.text");
    document.title = title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", description);

    const base = getSiteBaseUrl();
    const url = `${base}${location.pathname}`;
    setCanonical(url);
    setOg("og:url", url);
    setOg("og:title", title);
    setOg("og:description", description);
    setTwitterMeta("twitter:title", title);
    setTwitterMeta("twitter:description", description);
    setRobots("noindex, nofollow");

    return () => {
      setRobots(null);
    };
  }, [location.pathname, t]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">{t("notFound.title")}</h1>
        <p className="mb-4 text-xl text-muted-foreground">{t("notFound.text")}</p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          {t("notFound.back")}
        </a>
      </div>
    </div>
  );
};

export default NotFound;
