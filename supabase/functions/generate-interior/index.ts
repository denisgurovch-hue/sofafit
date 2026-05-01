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

async function callImageAI(
  apiKey: string,
  prompt: string,
  roomPhoto: string,
  sofaImageUrl: string,
  model: string,
  log: Logger,
  attempt: number
): Promise<{ imageUrl?: string; error?: string; status?: number }> {
  log("AI_CALL_START", { model, attempt });
  const aiStart = Date.now();
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
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
            { type: "image_url", image_url: { url: sofaImageUrl } },
          ],
        },
      ],
      modalities: ["image", "text"],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    log("AI_RESPONSE", { status: response.status, ai_ms: Date.now() - aiStart, error: true, model });
    console.error(`AI gateway error (${model}):`, response.status, errorText);
    return { error: errorText, status: response.status };
  }

  const data = await response.json();
  const bodySize = JSON.stringify(data).length;

  const imageUrl =
    data.choices?.[0]?.message?.images?.[0]?.image_url?.url ||
    data.choices?.[0]?.message?.image?.url ||
    extractBase64Image(data.choices?.[0]?.message?.content);

  const imagesCount = imageUrl ? 1 : 0;
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

  if (imageUrl) {
    const fmt = imageUrl.startsWith("data:") ? imageUrl.slice(0, 30) : "url";
    log("IMAGE_EXTRACTED", { format: fmt, size_kb: sizeKB(imageUrl) });
  } else {
    log("AI_FAIL", { reason: "no_image_returned", model });
  }

  return { imageUrl };
}

function extractBase64Image(content: string | undefined): string | undefined {
  if (!content) return undefined;
  if (content.startsWith("data:image/")) return content;
  const match = content.match(/!\[.*?\]\((data:image\/[^)]+)\)/);
  if (match) return match[1];
  return undefined;
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
    const log = createLogger("generate-interior", reqId, startedAt);
    const { roomPhoto, sofa, wall, roomAngle } = body;

    log("START", {
      roomPhoto_kb: sizeKB(roomPhoto),
      sofa_id: sofa?.id || sofa?.name || "?",
      has_wall: !!wall,
      room_angle: roomAngle ?? null,
    });

    if (!roomPhoto || !sofa) {
      log("DONE", { reason: "bad_request", total_ms: Date.now() - startedAt });
      return new Response(
        JSON.stringify({ error: "roomPhoto and sofa are required", requestId: reqId }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const sofaDescription = `${sofa.name}, ${sofa.color}, ${sofa.material}, размеры ${sofa.dimensions}. ${sofa.description}`;

    let wallBlock = "";
    if (wall && typeof wall.lengthCm === "number" && wall.lengthCm > 0) {
      const sofaLenMatch = String(sofa.dimensions || "").match(/(\d+)/);
      const sofaLenCm = sofaLenMatch ? parseInt(sofaLenMatch[1], 10) : null;
      const scalePct =
        sofaLenCm && wall.lengthCm > 0
          ? Math.round((sofaLenCm / wall.lengthCm) * 100)
          : null;

      if (wall.points?.p1 && wall.points?.p2) {
        const p1x = Math.round(wall.points.p1.x * 100);
        const p1y = Math.round(wall.points.p1.y * 100);
        const p2x = Math.round(wall.points.p2.x * 100);
        const p2y = Math.round(wall.points.p2.y * 100);
        wallBlock = `

Дополнительная инструкция по размещению (важно!):
- Пользователь отметил на фото комнаты участок стены двумя точками:
  A — координаты (x=${p1x}%, y=${p1y}% от левого верхнего угла фото),
  B — координаты (x=${p2x}%, y=${p2y}% от левого верхнего угла фото).
- Реальная длина участка стены между A и B = ${wall.lengthCm} см.
- Размести диван ВДОЛЬ этой стены, центрируя его примерно посередине отрезка AB, основанием прижатым к стене.
- Соблюдай масштаб: ширина дивана на изображении должна примерно соответствовать его реальной длине относительно отмеренной стены${
          scalePct
            ? ` (диван ${sofaLenCm} см на стене ${wall.lengthCm} см → диван должен занимать ~${scalePct}% длины отрезка AB)`
            : ""
        }.
- Оставь визуальный отступ ~15 см с каждой стороны от краёв стены (A и B).
- Ориентация дивана — параллельно линии AB.`;
      } else {
        wallBlock = `

Дополнительная инструкция по размещению:
- Пользователь указал, что предполагаемая длина стены, вдоль которой ставится диван = ${wall.lengthCm} см.
- Соблюдай масштаб: ширина дивана на изображении должна соответствовать его реальной длине относительно этой стены${
          scalePct ? ` (диван ${sofaLenCm} см → ~${scalePct}% длины стены)` : ""
        }.`;
      }
    }

    const angleBlock =
      typeof roomAngle === "string" && roomAngle.length > 0
        ? `\n\nРакурс комнаты: ${roomAngle}. Фото дивана подобрано под этот ракурс — используй его форму и перспективу как есть, не разворачивай и не меняй угол обзора дивана.`
        : "";

    const prompt = `Ты — профессиональный дизайнер интерьеров.

На первом фото — комната. На втором фото — диван, который нужно встроить в эту комнату.
Описание дивана: ${sofaDescription}.

ВАЖНО: Ты ДОЛЖЕН сгенерировать и вернуть изображение комнаты с встроенным диваном. Только изображение, без текста.

Правила:
- Используй именно тот диван, что на втором фото — сохрани его форму, цвет, текстуру и пропорции.
- Если на фото комнаты уже есть диван или кресло — замени его на диван со второго фото.
- Если дивана нет — размести его в наиболее подходящем месте (у стены, в зоне отдыха).
- Сохрани реалистичное освещение, перспективу и масштаб.
- НЕ добавляй аксессуары, подушки, пледы, столики, ковры или лампы — только диван.
- Не добавляй текст, водяные знаки или рамки.
- Верни ТОЛЬКО изображение.${angleBlock}${wallBlock}`;

    log("PROMPT_BUILT", { prompt_len: prompt.length, sofa_img_kb: sizeKB(sofa.imageUrl) });

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
        roomPhoto,
        sofa.imageUrl,
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
        log("DONE", { total_ms: Date.now() - startedAt, ok: true });
        return new Response(
          JSON.stringify({ imageUrl: result.imageUrl, requestId: reqId }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    log("DONE", { reason: "no_image", total_ms: Date.now() - startedAt });
    throw new Error("AI не вернул изображение. Попробуйте ещё раз.");
  } catch (e) {
    console.error(`[${reqId}] generate-interior error:`, e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error", requestId: reqId }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
