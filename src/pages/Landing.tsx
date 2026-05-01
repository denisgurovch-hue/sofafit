import { Link } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  Upload,
  Sparkles,
  ShoppingBag,
  Send,
  Mail,
  TrendingUp,
  PackageCheck,
  ShoppingCart,
  Plug,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import slipsonSofa from "@/assets/sofas/slipson-light-grey.jpeg";
import emptyRoom from "@/assets/landing/empty-room.jpg";
import roomWithSofa from "@/assets/landing/room-with-sofa.png";
import { useFurnitureWidget } from "@/lib/useFurnitureWidget";

const Landing = () => {
  const { t, i18n } = useTranslation();

  const landingDemoCardIds = useMemo(() => ["fi-card-landing-demo"], []);
  const demoWidgetStatus = useFurnitureWidget(landingDemoCardIds, {
    buttonText: "AI примерка",
    modalTitle: "AI-примерка мебели",
  });

  useEffect(() => {
    document.title = t("landing.meta.title");
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", t("landing.meta.description"));
  }, [t, i18n.language]);

  const howSteps = [
    { icon: Upload, title: t("landing.how.step1Title"), text: t("landing.how.step1Text") },
    { icon: Sparkles, title: t("landing.how.step2Title"), text: t("landing.how.step2Text") },
    { icon: ShoppingBag, title: t("landing.how.step3Title"), text: t("landing.how.step3Text") },
  ];

  const benefits = [
    { icon: TrendingUp, title: t("landing.benefits.conversionTitle"), text: t("landing.benefits.conversionText") },
    { icon: PackageCheck, title: t("landing.benefits.returnsTitle"), text: t("landing.benefits.returnsText") },
    { icon: ShoppingCart, title: t("landing.benefits.aovTitle"), text: t("landing.benefits.aovText") },
    { icon: Plug, title: t("landing.benefits.widgetTitle"), text: t("landing.benefits.widgetText") },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">S</span>
            </div>
            <span className="font-semibold text-lg text-foreground">SofaFit</span>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Button asChild size="sm">
              <Link to="/store">
                Перейти в демо-магазин
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="container py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight">
                {t("landing.hero.title1")}
                <br />
                <span className="text-primary">{t("landing.hero.title2")}</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                {t("landing.hero.subtitle")}
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button asChild size="lg">
                  <Link to="/store">
                    {t("landing.hero.ctaDemo")}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <a href="#how">{t("landing.hero.ctaHow")}</a>
                </Button>
              </div>
            </div>

            {/* Before / After collage */}
            <div className="relative max-w-xl w-[70%] mx-auto">
              <div className="space-y-4 md:space-y-5">
                <div className="space-y-2 md:-translate-x-4">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {t("landing.hero.before")}
                  </div>
                  <div className="aspect-[16/10] rounded-xl border bg-muted overflow-hidden">
                    <img
                      src={emptyRoom}
                      alt={t("landing.hero.beforeAlt")}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="space-y-2 md:translate-x-6">
                  <div className="text-xs font-medium text-primary uppercase tracking-wide">
                    {t("landing.hero.after")}
                  </div>
                  <div className="aspect-[16/10] rounded-xl border-2 border-primary/30 shadow-lg overflow-hidden bg-background">
                    <img
                      src={roomWithSofa}
                      alt={t("landing.hero.afterAlt")}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="bg-muted/40 py-16 md:py-24 border-y">
          <div className="container">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                {t("landing.how.title")}
              </h2>
              <p className="text-muted-foreground text-lg">
                {t("landing.how.subtitle")}
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {howSteps.map(({ icon: Icon, title, text }) => (
                <Card key={title} className="p-6 space-y-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{text}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="container py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                {t("landing.benefits.title")}
              </h2>
              <p className="text-muted-foreground text-lg">
                {t("landing.benefits.subtitle")}
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {benefits.map(({ icon: Icon, title, text }) => (
                <div key={title} className="flex gap-3">
                  <div className="h-10 w-10 shrink-0 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-foreground">{title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Demo block — FurnitureInpaintWidget mounts "AI примерка" into .widget-mount */}
        <section className="bg-muted/40 py-16 md:py-24 border-y">
          <div className="container">
            <Card className="overflow-hidden">
              <article
                id="fi-card-landing-demo"
                className="grid md:grid-cols-2"
              >
                <div className="product-main-image aspect-[4/3] md:aspect-auto bg-muted overflow-hidden">
                  <img
                    src={slipsonSofa}
                    alt={t("landing.demo.alt")}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="product-body p-8 md:p-12 flex flex-col justify-center space-y-5">
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    {t("landing.demo.title")}
                  </h2>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    {t("landing.demo.text")}
                  </p>
                  {demoWidgetStatus === "error" && (
                    <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                      Не удалось загрузить виджет AI-примерки с demo.sofafit.ru.
                    </p>
                  )}
                  <div className="widget-mount pt-1" />
                </div>
              </article>
            </Card>
          </div>
        </section>

        {/* Contacts */}
        <section className="container py-16 md:py-24">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              {t("landing.contacts.title")}
            </h2>
            <p className="text-muted-foreground text-lg">
              {t("landing.contacts.text")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button asChild size="lg" variant="default">
                <a href="https://t.me/DenisVGurov" target="_blank" rel="noopener noreferrer">
                  <Send className="h-4 w-4" />
                  @DenisVGurov
                </a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="mailto:DenisVGurov@Gmail.com">
                  <Mail className="h-4 w-4" />
                  DenisVGurov@Gmail.com
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">S</span>
            </div>
            <span className="font-medium text-foreground">SofaFit</span>
          </div>
          <div>© {new Date().getFullYear()} SofaFit. {t("footer.rights")}</div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
