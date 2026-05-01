import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

const LANGS = [
  { code: "ru", label: "RU" },
  { code: "en", label: "EN" },
] as const;

interface LanguageSwitcherProps {
  className?: string;
}

const LanguageSwitcher = ({ className }: LanguageSwitcherProps) => {
  const { i18n, t } = useTranslation();
  const current = (i18n.resolvedLanguage || i18n.language || "ru").slice(0, 2);

  return (
    <div
      role="group"
      aria-label={t("language.switchTo")}
      className={cn(
        "inline-flex items-center rounded-full border bg-background p-0.5 text-xs font-medium",
        className
      )}
    >
      {LANGS.map((l) => {
        const active = current === l.code;
        return (
          <button
            key={l.code}
            type="button"
            onClick={() => i18n.changeLanguage(l.code)}
            aria-pressed={active}
            className={cn(
              "px-2.5 py-1 rounded-full transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {l.label}
          </button>
        );
      })}
    </div>
  );
};

export default LanguageSwitcher;
