import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "https://teydpbqficbdgqovoqlo.supabase.co";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRleWRwYnFmaWNiZGdxb3ZvcWxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgyNDc0OTMsImV4cCI6MjA1MzgyMzQ5M30.nl7hQoe8RC9YYw2nwxLbEuEVcJCbfuxAy2dALZI47X0";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper to parse AU dates from OCR text
function parseDatesFromText(text: string): { start?: string; end?: string } {
  const dateRegex = /(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{2,4})/g;
  const found: Date[] = [];
  let m: RegExpExecArray | null;
  while ((m = dateRegex.exec(text)) !== null) {
    const [_, d, mo, y] = m;
    const year = y.length === 2 ? `20${y}` : y;
    const iso = `${year}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
    const dt = new Date(iso + "T00:00:00Z");
    if (!isNaN(dt.getTime())) found.push(dt);
  }
  found.sort((a, b) => a.getTime() - b.getTime());
  if (found.length === 0) return {};
  if (found.length === 1) return { start: found[0].toISOString().slice(0, 10) };
  return { start: found[0].toISOString().slice(0, 10), end: found[found.length - 1].toISOString().slice(0, 10) };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const MINDEE_API_KEY = Deno.env.get("MINDEE_API_KEY");
    if (!MINDEE_API_KEY) {
      return new Response(JSON.stringify({ error: "MINDEE_API_KEY not set" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Fetch a small batch of queued AU docs
    const { data: queue, error: qErr } = await supabase
      .from("au_ocr_queue")
      .select("id, absence_document_id, status")
      .eq("status", "queued")
      .order("created_at", { ascending: true })
      .limit(5);
    if (qErr) throw qErr;
    if (!queue || queue.length === 0) {
      return new Response(JSON.stringify({ processed: 0 }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let processed = 0;

    for (const item of queue) {
      // Mark as processing
      await supabase.from("au_ocr_queue").update({ status: "processing" }).eq("id", item.id);

      // Get file path from absence_documents
      const { data: doc, error: dErr } = await supabase
        .from("absence_documents")
        .select("file_path, absence_request_id")
        .eq("id", item.absence_document_id)
        .maybeSingle();
      if (dErr || !doc) {
        await supabase.from("au_ocr_queue").update({ status: "error", error: dErr?.message || "document not found" }).eq("id", item.id);
        continue;
      }

      // Download the file via storage public URL or signed
      // Assuming file_path is accessible via Supabase Storage public URL
      let fileResp: Response;
      try {
        const url = doc.file_path.startsWith("http") ? doc.file_path : `${SUPABASE_URL}/storage/v1/object/public/${doc.file_path}`;
        fileResp = await fetch(url);
        if (!fileResp.ok) throw new Error(`Download failed: ${fileResp.status}`);
      } catch (e) {
        await supabase.from("au_ocr_queue").update({ status: "error", error: String(e) }).eq("id", item.id);
        continue;
      }

      const blob = await fileResp.blob();
      const form = new FormData();
      form.append("document", new File([blob], "au-upload"));

      // Mindee generic OCR endpoint (invoice-like); adapt to custom if needed
      const ocrResp = await fetch("https://api.mindee.net/v1/products/mindee/invoices/v4/predict", {
        method: "POST",
        headers: { "Authorization": `Token ${MINDEE_API_KEY}` },
        body: form,
      });
      if (!ocrResp.ok) {
        await supabase.from("au_ocr_queue").update({ status: "error", error: `Mindee HTTP ${ocrResp.status}` }).eq("id", item.id);
        continue;
      }
      const ocrJson = await ocrResp.json();

      // Try to assemble a raw text for simple date parse
      const textParts: string[] = [];
      try {
        const doco = ocrJson?.document?.inference?.pages ?? [];
        for (const p of doco) {
          const fields = p?.prediction ?? {};
          for (const k of Object.keys(fields)) {
            const v = fields[k];
            if (Array.isArray(v)) {
              v.forEach((x) => x?.value && textParts.push(String(x.value)));
            } else if (v?.value) {
              textParts.push(String(v.value));
            }
          }
        }
      } catch (_) {}
      const rawText = textParts.join(" \n ");
      const dates = parseDatesFromText(rawText);

      // Save results
      await supabase
        .from("au_ocr_queue")
        .update({ status: "done", extracted_data: { rawText, dates } })
        .eq("id", item.id);

      if (dates.start || dates.end) {
        await supabase
          .from("sick_leave_details")
          .upsert({
            absence_request_id: doc.absence_request_id,
            ocr_extracted_start: dates.start ?? null,
            ocr_extracted_end: dates.end ?? null,
          }, { onConflict: "absence_request_id" });
      }

      processed += 1;
    }

    return new Response(JSON.stringify({ processed }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("ocr-au error", error);
    return new Response(JSON.stringify({ error: String(error) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
