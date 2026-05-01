import { Sofa, SofaStyle, ColorTone, PriceTier, UsageScenario } from "@/data/sofas";

export const MIN_CLEARANCE_CM = 15;

export const getMaxSofaLength = (wallLengthCm: number) =>
  wallLengthCm - 2 * MIN_CLEARANCE_CM;

export interface QuizAnswers {
  roomSize: number; // m²
  usage: UsageScenario[];
  style: SofaStyle;
  colorTone: ColorTone;
  budget: PriceTier;
  wallLengthCm?: number;
  wallPoints?: { p1: { x: number; y: number }; p2: { x: number; y: number } };
}

/**
 * A reason returned by the scorer. We return a key + interpolation params
 * instead of a localized string so the UI layer can translate it.
 */
export type ScoredReason =
  | { key: "style"; params: { style: SofaStyle } }
  | { key: "color" }
  | { key: "budget" }
  | { key: "usage"; params: { usages: UsageScenario[] } }
  | { key: "tooBig" }
  | { key: "wallFit" };

export interface ScoredSofa {
  sofa: Sofa;
  score: number;
  reasons: ScoredReason[];
}

const tierOrder: PriceTier[] = ["low", "medium", "high"];

export function scoreSofa(sofa: Sofa, a: QuizAnswers): ScoredSofa {
  let score = 0;
  const reasons: ScoredReason[] = [];

  // Style
  if (sofa.style.includes(a.style)) {
    score += 30;
    reasons.push({ key: "style", params: { style: a.style } });
  }

  // Color tone
  if (sofa.colorTone === a.colorTone) {
    score += 20;
    reasons.push({ key: "color" });
  } else if (sofa.colorTone === "neutral" || a.colorTone === "neutral") {
    score += 10;
  }

  // Budget
  if (sofa.priceTier === a.budget) {
    score += 20;
    reasons.push({ key: "budget" });
  } else {
    const diff = Math.abs(tierOrder.indexOf(sofa.priceTier) - tierOrder.indexOf(a.budget));
    if (diff === 1) score += 10;
  }

  // Usage scenarios
  const matched = a.usage.filter((u) => sofa.goodFor.includes(u));
  if (matched.length > 0) {
    score += Math.min(30, matched.length * 10);
    reasons.push({ key: "usage", params: { usages: matched } });
  }

  // Room size
  if (a.roomSize >= sofa.minRoomSize) {
    score += 10;
  } else {
    score -= 15;
    reasons.push({ key: "tooBig" });
  }

  // Wall length "perfect fit" bonus
  if (a.wallLengthCm) {
    const maxLen = getMaxSofaLength(a.wallLengthCm);
    if (sofa.lengthCm <= maxLen && sofa.lengthCm >= maxLen - 30) {
      score += 15;
      reasons.push({ key: "wallFit" });
    }
  }

  return { sofa, score, reasons };
}

export function rankSofas(sofas: Sofa[], a: QuizAnswers): ScoredSofa[] {
  return sofas
    .map((s) => scoreSofa(s, a))
    .sort((x, y) => y.score - x.score);
}
