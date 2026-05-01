import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Sofa,
  Ruler,
  Wrench,
  Lightbulb,
  Blinds,
  Palette,
  Sparkles,
  Wand2,
  Layers,
  Lamp,
  Flower2,
  Image as ImageIcon,
  Flame,
  BookOpen,
  type LucideIcon,
} from "lucide-react";

const SOFA_ICONS: LucideIcon[] = [Sofa, Ruler, Wrench, Lightbulb, Blinds, Palette, Sparkles, Wand2];
const ACCESSORY_ICONS: LucideIcon[] = [Layers, Sofa, Lamp, Flower2, ImageIcon, Flame, BookOpen, Sparkles];

const STEP_MS = 5000;

export type StepKind = "sofa" | "accessory";

// Backwards-compat exports (kept so existing imports keep working).
// They are no longer the source of step labels — labels come from i18n now.
export type Step = { icon: LucideIcon; label: string };
export const SOFA_STEPS: Step[] = SOFA_ICONS.map((icon) => ({ icon, label: "" }));
export const ACCESSORY_STEPS: Step[] = ACCESSORY_ICONS.map((icon) => ({ icon, label: "" }));

interface GenerationLoaderProps {
  title?: string;
  hint?: string;
  /** Pass a list of legacy Step objects to override the icons used. */
  steps?: Step[];
  /** Which i18n step list to use for labels. Defaults to "sofa". */
  kind?: StepKind;
}

const GenerationLoader = ({
  title,
  hint,
  steps,
  kind,
}: GenerationLoaderProps) => {
  const { t } = useTranslation();

  // Decide kind: explicit prop wins; otherwise infer from `steps` reference; otherwise "sofa".
  const resolvedKind: StepKind =
    kind ?? (steps === ACCESSORY_STEPS ? "accessory" : "sofa");

  const icons = resolvedKind === "accessory" ? ACCESSORY_ICONS : SOFA_ICONS;
  const labels = t(
    resolvedKind === "accessory" ? "loader.accessorySteps" : "loader.sofaSteps",
    { returnObjects: true }
  ) as string[];

  const length = Math.min(icons.length, labels.length);

  const startIndex = useMemo(
    () => Math.floor(Math.random() * length),
    [length]
  );
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((x) => x + 1), STEP_MS);
    return () => clearInterval(id);
  }, []);

  const index = (startIndex + tick) % length;
  const Icon = icons[index];
  const label = labels[index];

  const resolvedTitle =
    title ?? t(resolvedKind === "accessory" ? "loader.titleAccessories" : "loader.titleSofa");
  const resolvedHint = hint ?? t("loader.hint");

  return (
    <div className="flex flex-col items-center gap-6 text-center px-6 max-w-sm">
      <div className="relative h-20 w-20">
        <div className="absolute inset-0 rounded-full bg-primary/10 flex items-center justify-center">
          <Icon
            key={`icon-${index}`}
            className="h-10 w-10 text-primary animate-in fade-in zoom-in-95 duration-700"
          />
        </div>
        <div
          className="absolute inset-[-6px] rounded-full border-2 border-transparent border-t-primary animate-spin"
          style={{ animationDuration: "2.5s" }}
        />
      </div>

      <div className="space-y-2">
        <p className="text-lg font-semibold text-foreground">{resolvedTitle}</p>
        <p
          key={`label-${index}`}
          className="text-sm text-muted-foreground animate-in fade-in slide-in-from-bottom-1 duration-700 min-h-[1.25rem]"
        >
          {label}
        </p>
      </div>

      <p className="text-xs text-muted-foreground">{resolvedHint}</p>
    </div>
  );
};

export default GenerationLoader;
