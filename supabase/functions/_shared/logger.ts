// Shared logger: writes timing events both to console and to generation_logs table.
// Inserts are fire-and-forget — we don't await them in the request hot path.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

export type Logger = (event: string, details?: Record<string, unknown>) => void;

export function createLogger(
  functionName: string,
  requestId: string,
  startedAt: number = Date.now()
): Logger {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const supabase =
    supabaseUrl && serviceKey ? createClient(supabaseUrl, serviceKey) : null;

  return (event: string, details?: Record<string, unknown>) => {
    const elapsed = Date.now() - startedAt;
    const detailsStr = details ? " " + JSON.stringify(details) : "";
    console.log(`[${requestId}] t=${elapsed}ms ${event}${detailsStr}`);

    if (!supabase) return;
    // fire-and-forget — don't block on DB
    supabase
      .from("generation_logs")
      .insert({
        request_id: requestId,
        function_name: functionName,
        event,
        elapsed_ms: elapsed,
        details: details ?? null,
      })
      .then(({ error }) => {
        if (error) console.error(`[${requestId}] log insert failed:`, error.message);
      });
  };
}

// ============= Pricing =============
// USD per 1M tokens for text + USD per output image.
// Source: Lovable AI Gateway pricing (update if rates change).
type Price = { input: number; output: number; image?: number };

const MODEL_PRICING: Record<string, Price> = {
  "google/gemini-2.5-flash": { input: 0.075, output: 0.3 },
  "google/gemini-2.5-flash-lite": { input: 0.0375, output: 0.15 },
  "google/gemini-2.5-pro": { input: 1.25, output: 5 },
  "google/gemini-3-flash-preview": { input: 0.3, output: 2.5 },
  "google/gemini-3.1-pro-preview": { input: 1.25, output: 10 },
  "google/gemini-3.1-flash-image-preview": { input: 0.3, output: 2.5, image: 0.039 },
  "google/gemini-3-pro-image-preview": { input: 1.25, output: 10, image: 0.12 },
  "google/gemini-2.5-flash-image": { input: 0.3, output: 2.5, image: 0.039 },
  "openai/gpt-5-mini": { input: 0.25, output: 2 },
  "openai/gpt-5-nano": { input: 0.05, output: 0.4 },
  "openai/gpt-5": { input: 1.25, output: 10 },
  "openai/gpt-5.2": { input: 1.25, output: 10 },
};

export type Usage = {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
};

export type CostBreakdown = {
  model: string;
  input_tokens: number;
  output_tokens: number;
  images: number;
  cost_usd: number;
  unknown_model?: boolean;
};

export function calcCost(
  model: string,
  usage?: Usage,
  imageCount: number = 0
): CostBreakdown {
  const price = MODEL_PRICING[model];
  const input = usage?.prompt_tokens ?? 0;
  const output = usage?.completion_tokens ?? 0;
  if (!price) {
    return {
      model,
      input_tokens: input,
      output_tokens: output,
      images: imageCount,
      cost_usd: 0,
      unknown_model: true,
    };
  }
  const tokenCost =
    (input / 1_000_000) * price.input + (output / 1_000_000) * price.output;
  const imageCost = imageCount * (price.image ?? 0);
  // round to 6 decimals to keep JSON small but precise enough for fractions of a cent
  const cost_usd = Math.round((tokenCost + imageCost) * 1_000_000) / 1_000_000;
  return {
    model,
    input_tokens: input,
    output_tokens: output,
    images: imageCount,
    cost_usd,
  };
}
