import { Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface QuizOption<T extends string> {
  value: T;
  label: string;
  description?: string;
}

interface QuizQuestionProps<T extends string> {
  title: string;
  subtitle?: string;
  options: QuizOption<T>[];
  selected: T | T[];
  multiSelect?: boolean;
  onSelect: (value: T) => void;
}

function QuizQuestion<T extends string>({
  title,
  subtitle,
  options,
  selected,
  multiSelect = false,
  onSelect,
}: QuizQuestionProps<T>) {
  const isSelected = (v: T) =>
    multiSelect ? (selected as T[]).includes(v) : selected === v;

  return (
    <div className="space-y-5">
      <div className="space-y-1.5 text-center">
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((opt) => {
          const active = isSelected(opt.value);
          return (
            <Card
              key={opt.value}
              onClick={() => onSelect(opt.value)}
              className={cn(
                "p-4 cursor-pointer transition-all relative",
                "hover:border-primary hover:shadow-sm",
                active && "border-primary ring-2 ring-primary/30 bg-primary/5"
              )}
            >
              {active && (
                <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <Check className="h-3 w-3" />
                </div>
              )}
              <div className="pr-6">
                <p className="font-semibold text-foreground">{opt.label}</p>
                {opt.description && (
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {opt.description}
                  </p>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default QuizQuestion;
