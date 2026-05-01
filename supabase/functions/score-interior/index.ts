import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createLogger, calcCost, type Logger } from "../_shared/logger.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const newReqId = () => crypto.randomUUID().slice(0, 8);

async function scoreInterior(
  apiKey: string,
  imageUrl: string,
  log: Logger
): Promise<{ score: number; comment: string; sceneDescription: string }> {
  const fallback = {
    score: 7.0,
    comment:
      "Хороший базовый интерьер. Добавьте аксессуары — подушки, плед или ковёр — чтобы сделать пространство уютнее.",
    sceneDescription: "",
  };
  try {
    log("AI_CALL_START", { model: "google/gemini-2.5-flash" });
    const aiStart = Date.now();
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "Ты — строгий, но дружелюбный дизайнер интерьеров. Оцени интерьер с диваном и подробно опиши его для последующего подбора аксессуаров.",
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Оцени интерьер и дай его описание." },
              { type: "image_url", image_url: { url: imageUrl } },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "rate_interior",
              description: "Rate the interior and describe its scene for accessory matching.",
              parameters: {
                type: "object",
                properties: {
                  score: { type: "number" },
                  comment: { type: "string" },
                  sceneDescription: { type: "string" },
                },
                required: ["score", "comment", "sceneDescription"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "rate_interior" } },
      }),
    });

    if (!response.ok) {
      log("AI_RESPONSE", { status: response.status, ai_ms: Date.now() - aiStart, error: true });
      console.error(`Score AI error:`, response.status, await response.text());
      return fallback;
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
    if (!toolCall?.function?.arguments) {
      log("PARSED", { fallback: true, reason: "no_tool_call" });
      return fallback;
    }
    const parsed = JSON.parse(toolCall.function.arguments);
    const score = Math.max(0, Math.min(10, Number(parsed.score) || 7));
    const comment = String(parsed.comment || fallback.comment);
    const sceneDescription = String(parsed.sceneDescription || "");
    log("PARSED", { score, scene_len: sceneDescription.length });
    return { score, comment, sceneDescription };
  } catch (e) {
    console.error(`scoreInterior error:`, e);
    return fallback;
  }
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
    const log = createLogger("score-interior", reqId, startedAt);
    const { imageUrl } = body;

    log("START", { image_kb: imageUrl ? Math.round(String(imageUrl).length / 1024) : 0 });

    if (!imageUrl || typeof imageUrl !== "string") {
      log("DONE", { reason: "bad_request", total_ms: Date.now() - startedAt });
      return new Response(
        JSON.stringify({ error: "imageUrl is required", requestId: reqId }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { score, comment, sceneDescription } = await scoreInterior(
      LOVABLE_API_KEY,
      imageUrl,
      log
    );

    log("DONE", { total_ms: Date.now() - startedAt, ok: true });
    return new Response(
      JSON.stringify({ score, scoreComment: comment, sceneDescription, requestId: reqId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error(`[${reqId}] score-interior error:`, e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error", requestId: reqId }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
