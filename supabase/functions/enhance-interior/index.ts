import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createLogger, calcCost, type Logger } from "../_shared/logger.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const newReqId = () => crypto.randomUUID().slice(0, 8);
const sizeKB = (s: string | undefined | null) =>
  s ? Math.round(s.length / 1024) : 0;

interface AccessoryRef {
  id: string;
  name: string;
  category: string;
  color: string;
  material: string;
  dimensions: string;
  imageUrl: string;
}

async function callImageAI(
  apiKey: string,
  prompt: string,
  roomImage: string,
  accessoryImages: { name: string; imageUrl: string }[],
  model: string,
  log: Logger,
  attempt: number
): Promise<{ imageUrl?: string; status?: number }> {
  const content: any[] = [
    { type: "text", text: prompt },
    { type: "image_url", image_url: { url: roomImage } },
  ];
  accessoryImages.forEach((acc, idx) => {
    content.push({
      type: "text",
      text: `Референс №${idx + 1}: ${acc.name}. Этот предмет нужно добавить в комнату, точно сохранив его форму, цвет, материал и текстуру.`,
    });
    content.push({ type: "image_url", image_url: { url: acc.imageUrl } });
  });

  log("AI_CALL_START", { model, attempt, refs: accessoryImages.length });
  const aiStart = Date.now();
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content }],
      modalities: ["image", "text"],
    }),
  });

  if (!response.ok) {
    const txt = await response.text();
    log("AI_RESPONSE", { status: response.status, ai_ms: Date.now() - aiStart, error: true, model });
    console.error(`enhance image AI error (${model}):`, response.status, txt);
    return { status: response.status };
  }

  const data = await response.json();
  const bodySize = JSON.stringify(data).length;

  const c = data.choices?.[0]?.message?.content;
  const out =
    data.choices?.[0]?.message?.images?.[0]?.image_url?.url ||
    data.choices?.[0]?.message?.image?.url ||
    (typeof c === "string" && c.startsWith("data:image/") ? c : undefined) ||
    (typeof c === "string" ? c.match(/!\[.*?\]\((data:image\/[^)]+)\)/)?.[1] : undefined);

  const imagesCount = out ? 1 : 0;
  const cost = calcCost(model, data.usage, imagesCount);
  log("AI_RESPONSE", {
    status: response.status,
    ai_ms: Date.now() - aiStart,
    body_kb: Math.round(bodySize / 1024),
    model,
    input_tokens: cost.input_tokens,
    output_tokens: cost.output_tokens,
    images: cost.images,
    cost_usd: cost.cost_usd,
    ...(cost.unknown_model ? { unknown_model: true } : {}),
  });

  if (out) {
    const fmt = out.startsWith("data:") ? out.slice(0, 30) : "url";
    log("IMAGE_EXTRACTED", { format: fmt, size_kb: sizeKB(out) });
  } else {
    log("AI_FAIL", { reason: "no_image_returned", model });
  }

  return { imageUrl: out };
}

async function scoreEnhanced(
  apiKey: string,
  imageUrl: string,
  previousScore: number,
  accessoriesDescription: string,
  log: Logger
): Promise<{ score: number; comment: string }> {
  const fallback = {
    score: Math.min(10, Math.round((previousScore + 1) * 10) / 10),
    comment: "Аксессуары добавили уюта и завершённости интерьеру.",
  };
  try {
    log("SCORING_START", { prev: previousScore });
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
              "Ты — дизайнер интерьеров. Оцени улучшенный интерьер по шкале 0–10. Новая оценка ОБЯЗАТЕЛЬНО должна быть выше предыдущей на 0.5–2 балла, но не больше 10.",
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Предыдущая оценка: ${previousScore}/10.\nДобавленные аксессуары: ${accessoriesDescription}.\nОцени улучшенный интерьер.`,
              },
              { type: "image_url", image_url: { url: imageUrl } },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "rate_enhanced",
              parameters: {
                type: "object",
                properties: {
                  score: { type: "number" },
                  comment: { type: "string" },
                },
                required: ["score", "comment"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "rate_enhanced" } },
      }),
    });

    if (!response.ok) {
      log("SCORING_DONE", { ai_ms: Date.now() - aiStart, fallback: true, error: true });
      console.error(`scoreEnhanced error:`, response.status);
      return fallback;
    }

    const data = await response.json();
    const scoringModel = "google/gemini-2.5-flash";
    const scoringCost = calcCost(scoringModel, data.usage, 0);
    log("AI_RESPONSE", {
      status: response.status,
      ai_ms: Date.now() - aiStart,
      model: scoringModel,
      input_tokens: scoringCost.input_tokens,
      output_tokens: scoringCost.output_tokens,
      images: 0,
      cost_usd: scoringCost.cost_usd,
      stage: "scoring",
    });
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      log("SCORING_DONE", { fallback: true, reason: "no_tool_call" });
      return fallback;
    }
    const parsed = JSON.parse(toolCall.function.arguments);
    let score = typeof parsed.score === "number" ? parsed.score : NaN;
    if (!Number.isFinite(score)) {
      log("SCORING_DONE", { fallback: true, reason: "bad_score" });
      return fallback;
    }
    if (score <= previousScore) score = Math.min(10, previousScore + 0.5);
    if (score > 10) score = 10;
    score = Math.round(score * 10) / 10;
    const comment =
      typeof parsed.comment === "string" && parsed.comment.trim()
        ? parsed.comment.trim()
        : fallback.comment;
    log("SCORING_DONE", { score });
    return { score, comment };
  } catch (e) {
    console.error(`scoreEnhanced exception:`, e);
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
    const log = createLogger("enhance-interior", reqId, startedAt);
    const { currentImage, accessories, previousScore, roomAngle } = body;
    const prevScore: number =
      typeof previousScore === "number" && Number.isFinite(previousScore) ? previousScore : 7;
    const angle: string | undefined =
      typeof roomAngle === "string" && roomAngle.length > 0 ? roomAngle : undefined;

    const accCount = Array.isArray(accessories) ? accessories.length : 0;
    const accTotalKB = Array.isArray(accessories)
      ? accessories.reduce((sum: number, a: any) => sum + sizeKB(a?.imageUrl), 0)
      : 0;
    log("START", {
      current_kb: sizeKB(currentImage),
      acc_n: accCount,
      acc_total_kb: accTotalKB,
      prev_score: prevScore,
    });

    if (!currentImage || !Array.isArray(accessories) || accessories.length === 0) {
      log("DONE", { reason: "bad_request", total_ms: Date.now() - startedAt });
      return new Response(
        JSON.stringify({ error: "currentImage and accessories are required", requestId: reqId }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const refs = (accessories as AccessoryRef[]).filter(
      (a) => a && typeof a.id === "string" && typeof a.imageUrl === "string"
    );

    if (refs.length === 0) {
      log("DONE", { reason: "no_refs", total_ms: Date.now() - startedAt });
      return new Response(
        JSON.stringify({ error: "no valid accessory references", requestId: reqId }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const accDescription = refs
      .map((a) => `${a.name} — ${a.category}, ${a.color}, ${a.material}, ${a.dimensions}`)
      .join("; ");

    const accListForPrompt = refs
      .map((a, idx) => `${idx + 1}. ${a.name} (${a.category}, ${a.color}, ${a.material}, ${a.dimensions})`)
      .join("\n");

    const angleHint = angle
      ? `\nРеференсные фото аксессуаров сняты с того же ракурса, что и комната (${angle}); сохрани перспективу и пропорции из референсов.`
      : "";

    const prompt = `Ты — профессиональный дизайнер интерьеров.

На первом фото — комната с диваном. Далее идут референсные фото аксессуаров, которые нужно добавить в эту комнату:
${accListForPrompt}
${angleHint}
Правила:
- Добавь в комнату ТОЛЬКО предметы, изображённые на референсных фото. Их форма, цвет, материал, текстура и узор должны ТОЧНО совпадать с референсами.
- НЕ ДОБАВЛЯЙ ничего другого: ни растений, ни картин, ни свечей, ни книг, ни ваз, ни одеял/подушек/ламп/столиков/ковров, которых нет в референсах.
- Размести аксессуары гармонично: подушки и плед — на диване; столик/тумба — рядом с диваном; ковёр — перед диваном; торшер/настольная лампа — рядом с диваном.
- Сохрани диван, освещение, перспективу и общую композицию комнаты неизменными.
- Аксессуары должны выглядеть реалистично, как будто они действительно стоят в комнате (с тенями, отражениями).
- Не добавляй текст, водяные знаки, рамки.
- Верни ТОЛЬКО изображение.`;

    log("PROMPT_BUILT", { prompt_len: prompt.length, refs: refs.length });

    const accessoryImages = refs.map((a) => ({ name: a.name, imageUrl: a.imageUrl }));

    const models = [
      "google/gemini-3.1-flash-image-preview",
      "google/gemini-2.5-flash-image",
    ];

    let attempt = 0;
    for (const model of models) {
      attempt++;
      const result = await callImageAI(
        LOVABLE_API_KEY,
        prompt,
        currentImage,
        accessoryImages,
        model,
        log,
        attempt
      );

      if (result.status === 429) {
        log("DONE", { reason: "429", total_ms: Date.now() - startedAt });
        return new Response(
          JSON.stringify({ error: "Слишком много запросов. Попробуйте через минуту.", requestId: reqId }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (result.status === 402) {
        log("DONE", { reason: "402", total_ms: Date.now() - startedAt });
        return new Response(
          JSON.stringify({ error: "Закончились кредиты AI. Пополните баланс.", requestId: reqId }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (result.imageUrl) {
        const { score, comment } = await scoreEnhanced(
          LOVABLE_API_KEY,
          result.imageUrl,
          prevScore,
          accDescription,
          log
        );
        log("DONE", { total_ms: Date.now() - startedAt, ok: true });
        return new Response(
          JSON.stringify({
            imageUrl: result.imageUrl,
            accessoryIds: refs.map((r) => r.id),
            score,
            scoreComment: comment,
            requestId: reqId,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    log("DONE", { reason: "no_image", total_ms: Date.now() - startedAt });
    throw new Error("AI не вернул изображение улучшения.");
  } catch (e) {
    console.error(`[${reqId}] enhance-interior error:`, e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error", requestId: reqId }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
