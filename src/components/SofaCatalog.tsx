import { useState } from "react";
import { useTranslation } from "react-i18next";
import { sofas, type Sofa, type SofaType } from "@/data/sofas";
import SofaCard from "./SofaCard";
import { Button } from "@/components/ui/button";

interface SofaCatalogProps {
  onTryOn: (sofa: Sofa) => void;
  generatingSofaId: string | null;
}

const filters: (SofaType | "all")[] = ["all", "straight", "corner", "armchair"];

const SofaCatalog = ({ onTryOn, generatingSofaId }: SofaCatalogProps) => {
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState<SofaType | "all">("all");

  const filtered = activeFilter === "all"
    ? sofas
    : sofas.filter((s) => s.type === activeFilter);

  return (
    <div>
      <div className="flex gap-2 mb-6 flex-wrap">
        {filters.map((f) => (
          <Button
            key={f}
            variant={activeFilter === f ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter(f)}
          >
            {t(`catalog.${f}`)}
          </Button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((sofa) => (
          <SofaCard
            key={sofa.id}
            sofa={sofa}
            onTryOn={onTryOn}
            generatingSofaId={generatingSofaId}
          />
        ))}
      </div>
    </div>
  );
};

export default SofaCatalog;
