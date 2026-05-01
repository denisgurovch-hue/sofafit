import { useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { RotateCcw, Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getMaxSofaLength } from "@/lib/sofaScoring";

export interface WallMeasurePoint {
  x: number; // 0..1
  y: number; // 0..1
}

export interface WallMeasureValue {
  wallLengthCm: number;
  points?: { p1: WallMeasurePoint; p2: WallMeasurePoint };
}

interface WallMeasureStepProps {
  photo: string;
  value: WallMeasureValue | null;
  onChange: (v: WallMeasureValue | null) => void;
}

type Unit = "cm" | "m";

const WallMeasureStep = ({ photo, value, onChange }: WallMeasureStepProps) => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [p1, setP1] = useState<WallMeasurePoint | null>(value?.points?.p1 ?? null);
  const [p2, setP2] = useState<WallMeasurePoint | null>(value?.points?.p2 ?? null);
  const [dragging, setDragging] = useState<"p1" | "p2" | null>(null);

  const [unit, setUnit] = useState<Unit>("cm");
  const [rawValue, setRawValue] = useState<string>(
    value?.wallLengthCm ? String(value.wallLengthCm) : ""
  );
  const [error, setError] = useState<string | null>(null);

  const getRelativeCoords = (e: React.PointerEvent | PointerEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    const x = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
    return { x, y };
  };

  const handlePhotoClick = (e: React.PointerEvent) => {
    if (dragging) return;
    const target = e.target as HTMLElement;
    if (target.dataset.marker) return;
    const point = getRelativeCoords(e);
    if (!p1) setP1(point);
    else if (!p2) setP2(point);
  };

  const handleMarkerDown = (which: "p1" | "p2") => (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setDragging(which);
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };

  useEffect(() => {
    if (!dragging) return;
    const handleMove = (e: PointerEvent) => {
      const point = getRelativeCoords(e);
      if (dragging === "p1") setP1(point);
      else setP2(point);
    };
    const handleUp = () => setDragging(null);
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [dragging]);

  const handleReset = () => {
    setP1(null);
    setP2(null);
  };

  const validateAndApply = () => {
    const num = parseFloat(rawValue.replace(",", "."));
    if (!num || isNaN(num) || num <= 0) {
      setError(t("quiz.wall.errPositive"));
      return;
    }
    const cm = unit === "m" ? num * 100 : num;
    if (cm < 100) {
      setError(t("quiz.wall.errMin"));
      return;
    }
    if (cm > 1000) {
      setError(t("quiz.wall.errMax"));
      return;
    }
    setError(null);
    onChange({
      wallLengthCm: Math.round(cm),
      points: p1 && p2 ? { p1, p2 } : undefined,
    });
  };

  const currentCm = (() => {
    const num = parseFloat(rawValue.replace(",", "."));
    if (!num || isNaN(num)) return null;
    const cm = unit === "m" ? num * 100 : num;
    return cm >= 100 && cm <= 1000 ? Math.round(cm) : null;
  })();

  const previewMaxLen = currentCm ? getMaxSofaLength(currentCm) : null;
  const isApplied = value?.wallLengthCm === currentCm;

  return (
    <div className="space-y-5">
      <div className="space-y-1.5 text-center">
        <h2 className="text-2xl font-bold text-foreground">{t("quiz.wall.title")}</h2>
        <p className="text-sm text-muted-foreground">
          {t("quiz.wall.subtitle")}
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground text-center">
          {t("quiz.wall.tapHint")}
        </p>
        <div
          ref={containerRef}
          onPointerDown={handlePhotoClick}
          className="relative rounded-xl overflow-hidden border bg-muted select-none touch-none cursor-crosshair"
        >
          <img
            src={photo}
            alt=""
            className="w-full h-auto block pointer-events-none max-h-[50vh] object-contain"
            draggable={false}
          />
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {p1 && p2 && (
              <line
                x1={p1.x * 100}
                y1={p1.y * 100}
                x2={p2.x * 100}
                y2={p2.y * 100}
                stroke="hsl(var(--primary))"
                strokeWidth="0.6"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                style={{ strokeWidth: 3 } as React.CSSProperties}
              />
            )}
          </svg>
          {p1 && (
            <Marker
              point={p1}
              label="A"
              onPointerDown={handleMarkerDown("p1")}
              active={dragging === "p1"}
            />
          )}
          {p2 && (
            <Marker
              point={p2}
              label="B"
              onPointerDown={handleMarkerDown("p2")}
              active={dragging === "p2"}
            />
          )}
          {p1 && p2 && currentCm && (
            <div
              className="absolute pointer-events-none px-2 py-0.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold shadow-md -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${((p1.x + p2.x) / 2) * 100}%`,
                top: `${((p1.y + p2.y) / 2) * 100}%`,
              }}
            >
              {currentCm} {t("quiz.wall.unitCm")}
            </div>
          )}
        </div>
        {(p1 || p2) && (
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <RotateCcw className="h-3.5 w-3.5" />
              {t("quiz.wall.resetPoints")}
            </Button>
          </div>
        )}
      </div>

      <div className="rounded-xl border bg-card p-4 space-y-3">
        <Label htmlFor="wall-length" className="text-sm font-medium">
          {t("quiz.wall.distance")}
        </Label>
        <div className="flex gap-2">
          <Input
            id="wall-length"
            type="number"
            inputMode="decimal"
            placeholder={unit === "cm" ? t("quiz.wall.examplecm") : t("quiz.wall.examplem")}
            value={rawValue}
            onChange={(e) => {
              setRawValue(e.target.value);
              setError(null);
            }}
            className="flex-1"
          />
          <Select value={unit} onValueChange={(v) => setUnit(v as Unit)}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cm">{t("quiz.wall.unitCm")}</SelectItem>
              <SelectItem value="m">{t("quiz.wall.unitM")}</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={validateAndApply} variant={isApplied ? "secondary" : "default"}>
            {isApplied ? t("quiz.wall.applied") : t("quiz.wall.apply")}
          </Button>
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
        {previewMaxLen && !error && (
          <p className="text-xs text-muted-foreground inline-flex items-start gap-1.5">
            <Ruler className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
            <span>
              {t("quiz.wall.previewLine1", { wall: currentCm })}{" "}
              <strong className="text-foreground">{previewMaxLen} {t("quiz.wall.unitCm")}</strong>{" "}
              {t("quiz.wall.previewLine2")}
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

interface MarkerProps {
  point: WallMeasurePoint;
  label: string;
  onPointerDown: (e: React.PointerEvent) => void;
  active: boolean;
}

const Marker = ({ point, label, onPointerDown, active }: MarkerProps) => (
  <div
    data-marker="true"
    onPointerDown={onPointerDown}
    className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold shadow-md border-2 border-background cursor-grab touch-none transition-transform ${
      active ? "scale-125 cursor-grabbing" : "hover:scale-110"
    }`}
    style={{
      left: `${point.x * 100}%`,
      top: `${point.y * 100}%`,
      width: 24,
      height: 24,
    }}
  >
    {label}
  </div>
);

export default WallMeasureStep;
