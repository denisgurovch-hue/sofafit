import { useState } from "react";
import { useTranslation } from "react-i18next";
import { accessories, type Accessory, type AccessoryCategory } from "@/data/accessories";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";

interface AccessoryPickerProps {
  selected: Accessory[];
  onSelectionChange: (accessories: Accessory[]) => void;
  maxItems?: number;
}

const categories: (AccessoryCategory | "all")[] = ["all", "pillows", "tables", "rugs", "lighting"];

const AccessoryPicker = ({ selected, onSelectionChange, maxItems = 3 }: AccessoryPickerProps) => {
  const { t, i18n } = useTranslation();
  const [filter, setFilter] = useState<AccessoryCategory | "all">("all");

  const filtered = filter === "all" ? accessories : accessories.filter((a) => a.category === filter);

  const isSelected = (id: string) => selected.some((a) => a.id === id);

  const toggle = (accessory: Accessory) => {
    if (isSelected(accessory.id)) {
      onSelectionChange(selected.filter((a) => a.id !== accessory.id));
    } else {
      if (selected.length >= maxItems) {
        toast({
          title: t("accessories.max", { n: maxItems }),
          description: t("accessories.removeOne"),
        });
        return;
      }
      onSelectionChange([...selected, accessory]);
    }
  };

  const formatPrice = (price: number) => {
    const locale = i18n.language === "en" ? "en-US" : "ru-RU";
    return new Intl.NumberFormat(locale).format(price) + " ₽";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground">
          {t("accessories.title")}
          {selected.length > 0 && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({selected.length}/{maxItems})
            </span>
          )}
        </h3>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {categories.map((c) => (
          <Button
            key={c}
            variant={filter === c ? "default" : "outline"}
            size="sm"
            className="h-7 text-xs"
            onClick={() => setFilter(c)}
          >
            {c === "all" ? t("accessories.all") : t(`accessories.categories.${c}`)}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-1">
        {filtered.map((accessory) => {
          const checked = isSelected(accessory.id);
          return (
            <label
              key={accessory.id}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                checked
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40"
              }`}
            >
              <Checkbox
                checked={checked}
                onCheckedChange={() => toggle(accessory)}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {accessory.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {accessory.description}
                </p>
              </div>
              <span className="text-sm font-semibold text-foreground shrink-0">
                {formatPrice(accessory.price)}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default AccessoryPicker;
