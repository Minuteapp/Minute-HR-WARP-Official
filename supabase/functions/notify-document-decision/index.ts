import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotifyDecisionRequest {
  document_id: string;
  document_title: string;
  decision: 'approved' | 'rejected';
  rejection_reason?: string;
  approver_id: string;
  requester_id: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { 
      document_id, 
      document_title, 
      decision, 
      rejection_reason,
      approver_id, 
      requester_id 
    }: NotifyDecisionRequest = await req.json();

    console.log("📬 Creating decision notification:", { document_id, decision, approver_id, requester_id });

    // Hole Approver-Daten
    const { data: approverProfile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", approver_id)
      .single();

    // Hole Requester-Daten
    const { data: requesterProfile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", requester_id)
      .single();

    const approverName = approverProfile?.full_name || "Ein Genehmiger";
    const isApproved = decision === 'approved';

    // Erstelle In-App Benachrichtigung für den Ersteller
    const { data: notification, error: notificationError } = await supabase
      .from("notifications")
      .insert({
        user_id: requester_id,
        type: isApproved ? "document_approved" : "document_rejected",
        title: isApproved 
          ? "Dokument genehmigt" 
          : "Dokument abgelehnt",
        message: isApproved
          ? `${approverName} hat Ihr Dokument "${document_title}" genehmigt.`
          : `${approverName} hat Ihr Dokument "${document_title}" abgelehnt.${rejection_reason ? ` Grund: ${rejection_reason}` : ''}`,
        metadata: {
          document_id,
          document_title,
          decision,
          rejection_reason,
          approver_id,
          approver_name: approverName,
          action_url: `/documents`
        },
        is_read: false
      })
      .select()
      .single();

    if (notificationError) {
      console.error("❌ Failed to create notification:", notificationError);
      throw notificationError;
    }

    console.log("✅ Notification created:", notification?.id);

    // E-Mail senden falls RESEND_API_KEY vorhanden und Requester E-Mail existiert
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (resendApiKey && requesterProfile?.email) {
      try {
        const statusIcon = isApproved ? "✅" : "❌";
        const statusText = isApproved ? "genehmigt" : "abgelehnt";
        const statusColor = isApproved ? "#22c55e" : "#ef4444";
        
        const rejectionSection = !isApproved && rejection_reason 
          ? `<p style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 12px; margin: 16px 0;"><strong>Ablehnungsgrund:</strong><br/>${rejection_reason}</p>`
          : '';

        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "MINUTE <onboarding@resend.dev>",
            to: [requesterProfile.email],
            subject: `${statusIcon} Dokument ${statusText}: ${document_title}`,
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: ${statusColor};">${statusIcon} Ihr Dokument wurde ${statusText}</h2>
                <p>Hallo ${requesterProfile.full_name || ""},</p>
                <p>${approverName} hat Ihr Dokument <strong>"${document_title}"</strong> ${statusText}.</p>
                ${rejectionSection}
                <p><a href="https://app.minute.dev/documents" style="background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Zum Dokument</a></p>
                <p style="color: #6b7280; font-size: 14px; margin-top: 32px;">Mit freundlichen Grüßen,<br/>Ihr MINUTE Team</p>
              </div>
            `,
          }),
        });

        if (emailResponse.ok) {
          console.log("✅ Email sent successfully to", requesterProfile.email);
        } else {
          const errorText = await emailResponse.text();
          console.log("⚠️ Email sending failed:", errorText);
        }
      } catch (emailError) {
        console.log("⚠️ Email sending error:", emailError);
      }
    } else {
      console.log("⚠️ Email not sent - missing RESEND_API_KEY or requester email");
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        notification_id: notification?.id,
        message: `Entscheidungs-Benachrichtigung erfolgreich erstellt (${decision})` 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("❌ Error in notify-document-decision:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
