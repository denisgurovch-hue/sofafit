import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, Sparkles, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import QuizQuestion, { QuizOption } from "./QuizQuestion";
import WallMeasureStep, { WallMeasureValue } from "./WallMeasureStep";
import { QuizAnswers } from "@/lib/sofaScoring";
import { ColorTone, PriceTier, SofaStyle, UsageScenario } from "@/data/sofas";

interface SofaQuizProps {
  onComplete: (answers: QuizAnswers) => void;
  onCancel: () => void;
  initialAnswers?: QuizAnswers | null;
  roomPhoto: string;
}

const SofaQuiz = ({ onComplete, onCancel, initialAnswers, roomPhoto }: SofaQuizProps) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [roomSize, setRoomSize] = useState<number>(initialAnswers?.roomSize ?? 18);
  const [usage, setUsage] = useState<UsageScenario[]>(initialAnswers?.usage ?? []);
  const [style, setStyle] = useState<SofaStyle | null>(initialAnswers?.style ?? null);
  const [colorTone, setColorTone] = useState<ColorTone | null>(initialAnswers?.colorTone ?? null);
  const [budget, setBudget] = useState<PriceTier | null>(initialAnswers?.budget ?? null);
  const [wallMeasure, setWallMeasure] = useState<WallMeasureValue | null>(
    initialAnswers?.wallLengthCm ? { wallLengthCm: initialAnswers.wallLengthCm } : null
  );

  const totalSteps = 6;
  const progress = ((step + 1) / totalSteps) * 100;
  const isWallStep = step === 5;

  const usageOptions: QuizOption<UsageScenario>[] = (
    ["movies", "guests", "sleeping", "pets-kids"] as UsageScenario[]
  ).map((v) => ({
    value: v,
    label: t(`quiz.usage.${v}.label`),
    description: t(`quiz.usage.${v}.description`),
  }));

  const styleOptions: QuizOption<SofaStyle>[] = (
    ["modern", "scandinavian", "classic", "minimal"] as SofaStyle[]
  ).map((v) => ({
    value: v,
    label: t(`quiz.style.${v}.label`),
    description: t(`quiz.style.${v}.description`),
  }));

  const colorOptions: QuizOption<ColorTone>[] = (
    ["light", "dark", "colorful", "neutral"] as ColorTone[]
  ).map((v) => ({
    value: v,
    label: t(`quiz.color.${v}.label`),
    description: t(`quiz.color.${v}.description`),
  }));

  const budgetOptions: QuizOption<PriceTier>[] = (
    ["low", "medium", "high"] as PriceTier[]
  ).map((v) => ({
    value: v,
    label: t(`quiz.budget.${v}.label`),
    description: t(`quiz.budget.${v}.description`),
  }));

  const canNext = (() => {
    switch (step) {
      case 0: return roomSize > 0;
      case 1: return usage.length > 0;
      case 2: return style !== null;
      case 3: return colorTone !== null;
      case 4: return budget !== null;
      case 5: return wallMeasure !== null && wallMeasure.wallLengthCm > 0;
      default: return false;
    }
  })();

  const finish = (
    wallLengthCm?: number,
    wallPoints?: QuizAnswers["wallPoints"]
  ) => {
    if (style && colorTone && budget) {
      onComplete({ roomSize, usage, style, colorTone, budget, wallLengthCm, wallPoints });
    }
  };

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      finish(wallMeasure?.wallLengthCm, wallMeasure?.points);
    }
  };

  const handleSkipWall = () => finish(undefined, undefined);

  const handleBack = () => {
    if (step === 0) onCancel();
    else setStep(step - 1);
  };

  const toggleUsage = (v: UsageScenario) => {
    setUsage((prev) => prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-primary" />
            {t("quiz.title")}
          </span>
          <span>{t("quiz.stepOf", { current: step + 1, total: totalSteps })}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="min-h-[340px]">
        {step === 0 && (
          <div className="space-y-6">
            <div className="space-y-1.5 text-center">
              <h2 className="text-2xl font-bold text-foreground">{t("quiz.roomTitle")}</h2>
              <p className="text-sm text-muted-foreground">{t("quiz.roomSubtitle")}</p>
            </div>
            <div className="rounded-xl border bg-card p-6 space-y-5">
              <div className="text-center">
                <div className="text-4xl font-bold text-foreground">{roomSize} m²</div>
                <p className="text-sm text-muted-foreground mt-1">{t("quiz.roomArea")}</p>
              </div>
              <Slider
                value={[roomSize]}
                onValueChange={(v) => setRoomSize(v[0])}
                min={5}
                max={60}
                step={1}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>5 m²</span>
                <span>60 m²</span>
              </div>
              <div className="flex flex-wrap gap-2 justify-center pt-2">
                {[10, 15, 20, 30, 40].map((v) => (
                  <Button
                    key={v}
                    variant={roomSize === v ? "default" : "outline"}
                    size="sm"
                    onClick={() => setRoomSize(v)}
                  >
                    {v} m²
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <QuizQuestion<UsageScenario>
            title={t("quiz.usageTitle")}
            subtitle={t("quiz.usageSubtitle")}
            options={usageOptions}
            selected={usage}
            multiSelect
            onSelect={toggleUsage}
          />
        )}

        {step === 2 && (
          <QuizQuestion<SofaStyle>
            title={t("quiz.styleTitle")}
            options={styleOptions}
            selected={style ?? ("" as SofaStyle)}
            onSelect={(v) => setStyle(v)}
          />
        )}

        {step === 3 && (
          <QuizQuestion<ColorTone>
            title={t("quiz.colorTitle")}
            options={colorOptions}
            selected={colorTone ?? ("" as ColorTone)}
            onSelect={(v) => setColorTone(v)}
          />
        )}

        {step === 4 && (
          <QuizQuestion<PriceTier>
            title={t("quiz.budgetTitle")}
            options={budgetOptions}
            selected={budget ?? ("" as PriceTier)}
            onSelect={(v) => setBudget(v)}
          />
        )}

        {step === 5 && (
          <WallMeasureStep
            photo={roomPhoto}
            value={wallMeasure}
            onChange={setWallMeasure}
          />
        )}
      </div>

      {isWallStep ? (
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
            {t("quiz.back")}
          </Button>
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <Button variant="ghost" onClick={handleSkipWall}>
              <SkipForward className="h-4 w-4" />
              {t("quiz.skipStep")}
            </Button>
            <Button onClick={handleNext} disabled={!canNext}>
              {t("quiz.continueWithSize")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3 pt-2">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
            {step === 0 ? t("quiz.cancel") : t("quiz.back")}
          </Button>
          <Button onClick={handleNext} disabled={!canNext}>
            {t("quiz.next")}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default SofaQuiz;
