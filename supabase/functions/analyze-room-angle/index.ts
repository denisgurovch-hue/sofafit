import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createLogger, calcCost } from "../_shared/logger.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ANGLES = [
  "front",
  "front-left",
  "front-right",
  "side-left",
  "side-right",
  "three-quarter-left",
  "three-quarter-right",
] as const;

const newReqId = () => crypto.randomUUID().slice(0, 8);
const sizeKB = (s: string | undefined | null) =>
  s ? Math.round(s.length / 1024) : 0;

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
    const log = createLogger("analyze-room-angle", reqId, startedAt);
    const { roomPhoto } = body;

    log("START", { roomPhoto_kb: sizeKB(roomPhoto) });

    if (!roomPhoto || typeof roomPhoto !== "string") {
      log("DONE", { reason: "bad_request", total_ms: Date.now() - startedAt });
      return new Response(
        JSON.stringify({ error: "roomPhoto is required", requestId: reqId }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const model = "google/gemini-2.5-flash-lite";
    const prompt = `На фото — помещение (комната). Определи, с какого ракурса оно снято относительно стены, у которой логичнее всего поставить диван.

Возможные значения ракурса:
- "front" — стена прямо перед камерой, фронтальный вид.
- "front-left" — стена слегка повёрнута влево.
- "front-right" — стена слегка повёрнута вправо.
- "three-quarter-left" — стена видна под углом ~45° слева (диван на ней будет смотреть вправо-вперёд).
- "three-quarter-right" — стена видна под углом ~45° справа (диван будет смотреть влево-вперёд).
- "side-left" — стена сильно сбоку слева (почти профильный вид).
- "side-right" — стена сильно сбоку справа (почти профильный вид).

Верни результат через вызов функции report_angle.`;

    const aiStart = Date.now();
    log("AI_CALL_START", { model, attempt: 1 });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: roomPhoto } },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "report_angle",
              description: "Сообщает определённый ракурс комнаты относительно опорной стены.",
              parameters: {
                type: "object",
                properties: {
                  angle: {
                    type: "string",
                    enum: ANGLES as unknown as string[],
                    description: "Определённый ракурс комнаты.",
                  },
                  confidence: {
                    type: "number",
                    description: "Уверенность от 0 до 1.",
                  },
                  rationale: {
                    type: "string",
                    description: "Краткое объяснение (1-2 предложения).",
                  },
                },
                required: ["angle", "confidence", "rationale"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "report_angle" } },
      }),
    });

    if (response.status === 429) {
      log("DONE", { reason: "429", total_ms: Date.now() - startedAt });
      return new Response(
        JSON.stringify({ error: "Rate limited", requestId: reqId }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (response.status === 402) {
      log("DONE", { reason: "402", total_ms: Date.now() - startedAt });
      return new Response(
        JSON.stringify({ error: "Payment required", requestId: reqId }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!response.ok) {
      const errorText = await response.text();
      log("AI_RESPONSE", { status: response.status, ai_ms: Date.now() - aiStart, error: true, model });
      console.error(`[${reqId}] analyze-room-angle AI error:`, response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI gateway error", requestId: reqId }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const cost = calcCost(model, data.usage, 0);
    log("AI_RESPONSE", {
      status: response.status,
      ai_ms: Date.now() - aiStart,
      model,
      input_tokens: cost.input_tokens,
      output_tokens: cost.output_tokens,
      cost_usd: cost.cost_usd,
      ...(cost.unknown_model ? { unknown_model: true } : {}),
    });

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    let angle: string | null = null;
    let confidence = 0;
    let rationale = "";
    if (toolCall?.function?.arguments) {
      try {
        const args = JSON.parse(toolCall.function.arguments);
        if (typeof args.angle === "string" && (ANGLES as readonly string[]).includes(args.angle)) {
          angle = args.angle;
        }
        if (typeof args.confidence === "number") confidence = args.confidence;
        if (typeof args.rationale === "string") rationale = args.rationale;
      } catch (e) {
        console.error(`[${reqId}] failed to parse tool args:`, e);
      }
    }

    if (!angle) {
      log("DONE", { reason: "no_angle", total_ms: Date.now() - startedAt });
      return new Response(
        JSON.stringify({ angle: null, requestId: reqId }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    log("DONE", { total_ms: Date.now() - startedAt, ok: true, angle, confidence });
    return new Response(
      JSON.stringify({ angle, confidence, rationale, requestId: reqId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error(`[${reqId}] analyze-room-angle error:`, e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error", requestId: reqId }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
