import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createLogger, calcCost } from "../_shared/logger.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const newReqId = () => crypto.randomUUID().slice(0, 8);

interface CatalogItem {
  id: string;
  name: string;
  category: string;
  color: string;
  material: string;
  dimensions: string;
  description?: string;
}

function fallbackIds(catalog: CatalogItem[]): string[] {
  const seen = new Set<string>();
  const picked: string[] = [];
  for (const c of catalog) {
    if (!seen.has(c.category)) {
      seen.add(c.category);
      picked.push(c.id);
    }
    if (picked.length >= 2) break;
  }
  if (picked.length === 0) return catalog.slice(0, 2).map((c) => c.id);
  return picked;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startedAt = Date.now();
  let reqId = newReqId();

  try {
    const body = await req.json();
    if (typeof body?.requestId === "string" && body.requestId.length > 0) {
      reqId = body.requestId.slice(0, 16);
    }
    const log = createLogger("pick-accessories", reqId, startedAt);
    const { sceneDescription, catalog } = body;

    log("START", {
      scene_len: typeof sceneDescription === "string" ? sceneDescription.length : 0,
      catalog_n: Array.isArray(catalog) ? catalog.length : 0,
    });

    if (!Array.isArray(catalog) || catalog.length === 0) {
      log("DONE", { reason: "bad_request", total_ms: Date.now() - startedAt });
      return new Response(
        JSON.stringify({ error: "catalog is required", requestId: reqId }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const items = (catalog as CatalogItem[]);
    const list = items
      .map(
        (a) =>
          `- ${a.id} | ${a.category} | ${a.name} | ${a.color} | ${a.material} | ${a.dimensions}${
            a.description ? ` | ${a.description}` : ""
          }`
      )
      .join("\n");

    const scene =
      typeof sceneDescription === "string" && sceneDescription.trim()
        ? sceneDescription.trim()
        : "Универсальный современный уютный интерьер с диваном.";

    log("AI_CALL_START", { model: "google/gemini-2.5-flash" });
    const aiStart = Date.now();
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "Ты — дизайнер интерьеров. По описанию комнаты с диваном выбери из каталога 2–3 аксессуара, которые лучше всего подходят по стилю, цветовой гамме и настроению. Аксессуары должны быть из РАЗНЫХ категорий (подушки/пледы, столики/тумбы, ковры, освещение). Используй только id из каталога.",
          },
          {
            role: "user",
            content: `Описание комнаты:\n${scene}\n\nКаталог:\n${list}\n\nВыбери 2–3 подходящих id.`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "pick_accessories",
              description: "Return chosen accessory ids from the catalog.",
              parameters: {
                type: "object",
                properties: {
                  accessoryIds: {
                    type: "array",
                    items: { type: "string" },
                    minItems: 2,
                    maxItems: 3,
                  },
                  reason: { type: "string" },
                },
                required: ["accessoryIds"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "pick_accessories" } },
      }),
    });

    if (response.status === 429) {
      log("AI_RESPONSE", { status: 429, ai_ms: Date.now() - aiStart });
      log("DONE", { reason: "429", total_ms: Date.now() - startedAt });
      return new Response(
        JSON.stringify({ error: "Слишком много запросов.", requestId: reqId }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (response.status === 402) {
      log("AI_RESPONSE", { status: 402, ai_ms: Date.now() - aiStart });
      log("DONE", { reason: "402", total_ms: Date.now() - startedAt });
      return new Response(
        JSON.stringify({ error: "Закончились кредиты AI.", requestId: reqId }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!response.ok) {
      const t = await response.text();
      log("AI_RESPONSE", { status: response.status, ai_ms: Date.now() - aiStart, error: true });
      console.error(`pick-accessories AI error:`, response.status, t);
      const fb = fallbackIds(items);
      log("FALLBACK_USED", { ids: fb });
      log("DONE", { reason: "fallback", total_ms: Date.now() - startedAt });
      return new Response(
        JSON.stringify({ accessoryIds: fb, requestId: reqId }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const bodySize = JSON.stringify(data).length;
    const model = "google/gemini-2.5-flash";
    const cost = calcCost(model, data.usage, 0);
    log("AI_RESPONSE", {
      status: response.status,
      ai_ms: Date.now() - aiStart,
      body_kb: Math.round(bodySize / 1024),
      model,
      input_tokens: cost.input_tokens,
      output_tokens: cost.output_tokens,
      images: 0,
      cost_usd: cost.cost_usd,
    });

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    let ids: string[] = [];
    if (toolCall?.function?.arguments) {
      try {
        const args = JSON.parse(toolCall.function.arguments);
        if (Array.isArray(args.accessoryIds)) {
          ids = args.accessoryIds.filter(
            (id: unknown) => typeof id === "string" && items.some((c) => c.id === id)
          );
        }
      } catch (e) {
        console.error(`pick-accessories parse error:`, e);
      }
    }

    let usedFallback = false;
    if (ids.length === 0) {
      ids = fallbackIds(items);
      usedFallback = true;
      log("FALLBACK_USED", { ids });
    }
    ids = ids.slice(0, 3);
    log("PARSED", { ids, fallback: usedFallback });
    log("DONE", { total_ms: Date.now() - startedAt, ok: true });

    return new Response(
      JSON.stringify({ accessoryIds: ids, requestId: reqId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error(`[${reqId}] pick-accessories error:`, e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error", requestId: reqId }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
