import type { Sofa, SofaAngle } from "@/data/sofas";

// For each detected room angle, list variant angles in order of preference.
// Idea: if the room is shot e.g. from "front-left", an item shot from the same angle
// is ideal; otherwise pick the closest available perspective.
// Exported so other variant pickers (e.g. accessories) can reuse the same fallback.
export const ANGLE_FALLBACK_ORDER: Record<SofaAngle, SofaAngle[]> = {
  front: ["front", "front-left", "front-right", "three-quarter-left", "three-quarter-right", "side-left", "side-right"],
  "front-left": ["front-left", "three-quarter-left", "front", "side-left", "front-right", "three-quarter-right", "side-right"],
  "front-right": ["front-right", "three-quarter-right", "front", "side-right", "front-left", "three-quarter-left", "side-left"],
  "three-quarter-left": ["three-quarter-left", "front-left", "side-left", "front", "three-quarter-right", "front-right", "side-right"],
  "three-quarter-right": ["three-quarter-right", "front-right", "side-right", "front", "three-quarter-left", "front-left", "side-left"],
  "side-left": ["side-left", "three-quarter-left", "front-left", "front", "three-quarter-right", "front-right", "side-right"],
  "side-right": ["side-right", "three-quarter-right", "front-right", "front", "three-quarter-left", "front-left", "side-left"],
};

export function pickSofaVariant(sofa: Sofa, roomAngle: SofaAngle | null | undefined): string {
  const variants = sofa.variants;
  if (!roomAngle || !variants || variants.length === 0) {
    return sofa.image;
  }
  const order = ANGLE_FALLBACK_ORDER[roomAngle] ?? [];
  for (const angle of order) {
    const match = variants.find((v) => v.angle === angle);
    if (match) return match.image;
  }
  // Nothing matched fallback chain — return whatever variant is first, else main image.
  return variants[0]?.image ?? sofa.image;
}
