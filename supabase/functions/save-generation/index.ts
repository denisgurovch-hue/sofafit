import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { createLogger } from "../_shared/logger.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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
    const log = createLogger("save-generation", reqId, startedAt);
    const {
      sofa_id,
      sofa_name,
      input_image_url,
      result_image_url,
      accessories,
      is_enhanced,
      request_id,
      enhance_request_id,
    } = body;

    log("START", {
      sofa_id,
      input_kb: sizeKB(input_image_url),
      result_kb: sizeKB(result_image_url),
      is_enhanced: !!is_enhanced,
      request_id: request_id || null,
      enhance_request_id: enhance_request_id || null,
    });

    if (!sofa_id || !sofa_name) {
      log("DONE", { reason: "bad_request", total_ms: Date.now() - startedAt });
      return new Response(
        JSON.stringify({ error: "sofa_id and sofa_name are required", requestId: reqId }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    log("DB_INSERT_START");
    const dbStart = Date.now();
    const { data, error } = await supabase
      .from("generations")
      .insert({
        sofa_id,
        sofa_name,
        input_image_url: input_image_url || null,
        result_image_url: result_image_url || null,
        accessories: accessories || [],
        is_enhanced: !!is_enhanced,
        request_id: typeof request_id === "string" ? request_id : null,
        enhance_request_id:
          typeof enhance_request_id === "string" ? enhance_request_id : null,
      })
      .select("id")
      .single();

    log("DB_INSERT_DONE", { db_ms: Date.now() - dbStart, ok: !error, id: data?.id });

    if (error) throw error;

    log("DONE", { total_ms: Date.now() - startedAt, ok: true });
    return new Response(
      JSON.stringify({ success: true, id: data.id, requestId: reqId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error(`[${reqId}] save-generation error:`, e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error", requestId: reqId }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
