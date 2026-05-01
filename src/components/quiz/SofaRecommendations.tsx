import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Sparkles, Star, RotateCcw, Ruler, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SofaCard from "@/components/SofaCard";
import { Sofa, sofas, UsageScenario } from "@/data/sofas";
import {
  QuizAnswers,
  rankSofas,
  getMaxSofaLength,
  MIN_CLEARANCE_CM,
  ScoredReason,
} from "@/lib/sofaScoring";

interface SofaRecommendationsProps {
  answers: QuizAnswers;
  onTryOn: (sofa: Sofa) => void;
  onRestart: () => void;
  generatingSofaId: string | null;
}

const SofaRecommendations = ({
  answers,
  onTryOn,
  onRestart,
  generatingSofaId,
}: SofaRecommendationsProps) => {
  const { t, i18n } = useTranslation();
  const [wallFilterDisabled, setWallFilterDisabled] = useState(false);

  const wallActive = !!answers.wallLengthCm && !wallFilterDisabled;
  const maxLength = answers.wallLengthCm ? getMaxSofaLength(answers.wallLengthCm) : null;

  const ranked = useMemo(() => rankSofas(sofas, answers), [answers]);

  const filtered = useMemo(() => {
    if (!wallActive || !maxLength) return ranked;
    return ranked.filter(({ sofa }) => sofa.lengthCm <= maxLength);
  }, [ranked, wallActive, maxLength]);

  const top3 = filtered.slice(0, 3);
  const rest = filtered.slice(3);

  const formatPrice = (p: number) => {
    const locale = i18n.language === "en" ? "en-US" : "ru-RU";
    return new Intl.NumberFormat(locale).format(p) + " ₽";
  };
  const isAnyGenerating = generatingSofaId !== null;

  const tooFew = wallActive && filtered.length < 2;

  const renderReason = (r: ScoredReason): string => {
    switch (r.key) {
      case "style":
        return t("recommendations.reasons.style", {
          style: t(`recommendations.styles.${r.params.style}`),
        });
      case "color":
        return t("recommendations.reasons.color");
      case "budget":
        return t("recommendations.reasons.budget");
      case "usage": {
        const list = (r.params.usages as UsageScenario[])
          .map((u) => t(`recommendations.usageWords.${u}`))
          .join(", ");
        return t("recommendations.reasons.usage", { list });
      }
      case "tooBig":
        return t("recommendations.reasons.tooBig");
      case "wallFit":
        return t("recommendations.reasons.wallFit");
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              {t("recommendations.yourPrefs")}
            </div>
            <p className="text-sm text-foreground">
              {t("recommendations.summary", {
                room: answers.roomSize,
                style: t(`recommendations.styles.${answers.style}`),
                color: t(`recommendations.colors.${answers.colorTone}`),
                budget: t(`recommendations.budgets.${answers.budget}`),
              })}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={onRestart} disabled={isAnyGenerating}>
            <RotateCcw className="h-4 w-4" />
            {t("recommendations.restart")}
          </Button>
        </CardContent>
      </Card>

      {/* Wall filter banner */}
      {wallActive && maxLength && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5">
          <div className="inline-flex items-center gap-2 text-sm text-foreground">
            <Ruler className="h-4 w-4 text-primary shrink-0" />
            <span>
              {t("recommendations.wallFilter")} <strong>{maxLength} cm</strong>{" "}
              <span className="text-muted-foreground">
                {t("recommendations.wallFilterDetail", {
                  wall: answers.wallLengthCm,
                  clearance: MIN_CLEARANCE_CM,
                })}
              </span>
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setWallFilterDisabled(true)}
            className="shrink-0"
          >
            <X className="h-3.5 w-3.5" />
            {t("recommendations.remove")}
          </Button>
        </div>
      )}

      {/* Too few results fallback */}
      {tooFew && (
        <Card className="border-dashed">
          <CardContent className="p-5 space-y-3 text-center">
            <p className="text-sm text-foreground">
              {filtered.length === 0
                ? t("recommendations.tooFewZero")
                : t("recommendations.tooFewOne")}
            </p>
            <Button variant="outline" size="sm" onClick={() => setWallFilterDisabled(true)}>
              {t("recommendations.showAll")}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Top 3 */}
      {top3.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary fill-primary" />
            <h2 className="text-xl font-bold text-foreground">{t("recommendations.bestForYou")}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {top3.map(({ sofa, reasons }, idx) => {
              const isGeneratingThis = generatingSofaId === sofa.id;
              const disabled = isAnyGenerating && !isGeneratingThis;
              return (
                <Card
                  key={sofa.id}
                  className={`overflow-hidden transition-all relative border-primary/40 ${
                    disabled ? "opacity-50" : "hover:shadow-lg"
                  } ${isGeneratingThis ? "ring-2 ring-primary shadow-lg" : ""}`}
                >
                  <div className="absolute top-3 left-3 z-10 flex flex-col items-start gap-1.5">
                    <Badge className="bg-primary text-primary-foreground shadow-sm">
                      {t("recommendations.bestPick", { n: idx + 1 })}
                    </Badge>
                    {wallActive && (
                      <Badge variant="secondary" className="shadow-sm gap-1">
                        <Ruler className="h-3 w-3" />
                        {t("recommendations.fitsWall")}
                      </Badge>
                    )}
                  </div>
                  <div className="aspect-[4/3] bg-muted overflow-hidden">
                    <img src={sofa.image} alt={sofa.name} className="h-full w-full object-cover" />
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-foreground leading-tight">{sofa.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {sofa.dimensions} · {sofa.material}
                      </p>
                    </div>
                    {reasons.length > 0 && (
                      <ul className="space-y-1">
                        {reasons.slice(0, 3).map((r, i) => (
                          <li key={i} className="text-xs text-foreground flex items-start gap-1.5">
                            <span className="text-primary mt-0.5">✓</span>
                            <span>{renderReason(r)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-lg font-bold text-foreground">
                        {formatPrice(sofa.price)}
                      </span>
                      <Button
                        size="sm"
                        onClick={() => onTryOn(sofa)}
                        disabled={isAnyGenerating}
                      >
                        {isGeneratingThis ? (
                          <>
                            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                            {t("recommendations.generating")}
                          </>
                        ) : (
                          t("recommendations.tryOn")
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Rest */}
      {rest.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">{t("recommendations.otherOptions")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rest.map(({ sofa }) => (
              <div key={sofa.id} className="relative">
                {wallActive && (
                  <div className="absolute top-3 left-3 z-10">
                    <Badge variant="secondary" className="shadow-sm gap-1">
                      <Ruler className="h-3 w-3" />
                      {t("recommendations.fitsWall")}
                    </Badge>
                  </div>
                )}
                <SofaCard
                  sofa={sofa}
                  onTryOn={onTryOn}
                  generatingSofaId={generatingSofaId}
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default SofaRecommendations;
