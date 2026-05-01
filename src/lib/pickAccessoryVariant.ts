import type { Accessory } from "@/data/accessories";
import type { SofaAngle } from "@/data/sofas";
import { ANGLE_FALLBACK_ORDER } from "@/lib/pickSofaVariant";

export function pickAccessoryVariant(
  accessory: Accessory,
  roomAngle: SofaAngle | null | undefined
): string {
  const variants = accessory.variants;
  if (!roomAngle || !variants || variants.length === 0) {
    return accessory.image;
  }
  const order = ANGLE_FALLBACK_ORDER[roomAngle] ?? [];
  for (const angle of order) {
    const match = variants.find((v) => v.angle === angle);
    if (match) return match.image;
  }
  return variants[0]?.image ?? accessory.image;
}
