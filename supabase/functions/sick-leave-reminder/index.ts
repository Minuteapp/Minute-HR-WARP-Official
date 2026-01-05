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

async function createAutoNotification(absence_request_id: string, user_id: string, type: string, subject: string, message: string) {
  const { error } = await supabase.from("absence_auto_notifications").insert({
    absence_request_id,
    notification_type: type,
    recipient_user_id: user_id,
    recipient_email: null,
    subject,
    message,
    status: 'sent',
  });
  if (error) console.error("notify insert error", error);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const now = new Date().toISOString();

    // 1) Fehlende AU nach 24h erinnern (Mitarbeiter)
    const { data: missingDocs, error: mErr } = await supabase
      .from("absence_requests")
      .select("id, user_id, created_at")
      .eq("absence_type", "sick_leave")
      .eq("document_required", true)
      .in("status", ["pending", "submitted", "in_review"]).or("status.is.null")
      .lte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
    if (mErr) throw mErr;

    for (const ar of missingDocs ?? []) {
      const { count } = await supabase
        .from("absence_documents")
        .select("id", { count: 'exact', head: true })
        .eq("absence_request_id", ar.id);
      if ((count ?? 0) === 0) {
        await createAutoNotification(
          ar.id,
          ar.user_id,
          'reminder_employee',
          'Erinnerung: AU-Bescheinigung benötigt',
          'Bitte laden Sie Ihre AU-Bescheinigung hoch. Vielen Dank!'
        );
      }
    }

    // 2) HR Erinnerung/Eskalation nach 72h ohne AU
    const { data: overdue, error: oErr } = await supabase
      .from("absence_requests")
      .select("id, user_id, created_at")
      .eq("absence_type", "sick_leave")
      .eq("document_required", true)
      .in("status", ["pending", "submitted", "in_review"]).or("status.is.null")
      .lte("created_at", new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString());
    if (oErr) throw oErr;

    // Hole HR-User
    const { data: hrUsers } = await supabase
      .from("user_roles")
      .select("user_id, role")
      .in("role", ["hr", "admin", "superadmin"]);

    for (const ar of overdue ?? []) {
      const { count } = await supabase
        .from("absence_documents")
        .select("id", { count: 'exact', head: true })
        .eq("absence_request_id", ar.id);
      if ((count ?? 0) === 0) {
        for (const hr of hrUsers ?? []) {
          await supabase.from("absence_auto_notifications").insert({
            absence_request_id: ar.id,
            notification_type: 'reminder_hr',
            recipient_user_id: hr.user_id,
            recipient_email: null,
            subject: 'Krankmeldung ohne AU (>72h)',
            message: 'Für eine Krankmeldung fehlt seit über 72 Stunden die AU. Bitte prüfen und ggf. eskalieren.',
            status: 'sent',
            metadata: { runAt: now },
          });
        }
      }
    }

    return new Response(JSON.stringify({ ok: true, checked: (missingDocs?.length ?? 0) + (overdue?.length ?? 0) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("sick-leave-reminder error", error);
    return new Response(JSON.stringify({ error: String(error) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
