import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { Sofa } from "@/data/sofas";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SofaCardProps {
  sofa: Sofa;
  onTryOn: (sofa: Sofa) => void;
  generatingSofaId: string | null;
}

const SofaCard = ({ sofa, onTryOn, generatingSofaId }: SofaCardProps) => {
  const { t, i18n } = useTranslation();
  const formatPrice = (price: number) => {
    const locale = i18n.language === "en" ? "en-US" : "ru-RU";
    return new Intl.NumberFormat(locale).format(price) + "\u00A0₽";
  };

  const isGeneratingThis = generatingSofaId === sofa.id;
  const isAnyGenerating = generatingSofaId !== null;
  const disabled = isAnyGenerating && !isGeneratingThis;

  return (
    <Card
      className={`overflow-hidden transition-all flex flex-col ${
        disabled ? "opacity-50" : "hover:shadow-lg"
      } ${isGeneratingThis ? "ring-2 ring-primary shadow-lg" : ""}`}
    >
      <div className="aspect-[4/3] bg-muted flex items-center justify-center overflow-hidden">
        <img
          src={sofa.image}
          alt={sofa.name}
          className="h-full w-full object-cover"
        />
      </div>
      <CardContent className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-foreground leading-tight">{sofa.name}</h3>
          <Badge variant="secondary" className="shrink-0 text-xs">
            {sofa.color}
          </Badge>
        </div>
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
          {sofa.description}
        </p>
        <div className="mt-2 text-xs text-muted-foreground space-y-0.5">
          <p>{sofa.dimensions}</p>
          <p>{sofa.material}</p>
        </div>
        <div className="mt-auto pt-3 flex items-center justify-between gap-2">
          <span className="text-lg font-bold text-foreground whitespace-nowrap">
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
                {t("sofaCard.generating")}
              </>
            ) : (
              t("sofaCard.tryOn")
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SofaCard;
