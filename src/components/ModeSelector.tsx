import { useTranslation } from "react-i18next";
import { Sparkles, LayoutGrid } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ModeSelectorProps {
  onSelectCatalog: () => void;
  onSelectAI: () => void;
}

const ModeSelector = ({ onSelectCatalog, onSelectAI }: ModeSelectorProps) => {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Card
        onClick={onSelectCatalog}
        className="p-6 cursor-pointer hover:shadow-lg hover:border-primary transition-all group"
      >
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <LayoutGrid className="h-7 w-7" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-foreground">{t("modeSelector.catalogTitle")}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {t("modeSelector.catalogText")}
            </p>
          </div>
        </div>
      </Card>

      <Card
        onClick={onSelectAI}
        className="p-6 cursor-pointer hover:shadow-lg hover:border-primary transition-all group"
      >
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <Sparkles className="h-7 w-7" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-foreground">{t("modeSelector.aiTitle")}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {t("modeSelector.aiText")}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ModeSelector;
