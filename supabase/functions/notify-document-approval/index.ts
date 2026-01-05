import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  FROM_ADDRESS, 
  isEmailAllowed, 
  logEmailConfig 
} from "../_shared/email-config.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotifyApprovalRequest {
  document_id: string;
  document_title: string;
  approver_id: string;
  requester_id: string;
  requester_name?: string;
}

serve(async (req) => {
  console.log("Starting notify-document-approval function");
  logEmailConfig();
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { document_id, document_title, approver_id, requester_id, requester_name }: NotifyApprovalRequest = await req.json();

    console.log("📬 Creating approval notification:", { document_id, approver_id, requester_id });

    // Hole Approver-Daten
    const { data: approverProfile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", approver_id)
      .single();

    // Hole Requester-Daten falls nicht übergeben
    let requesterDisplayName = requester_name;
    if (!requesterDisplayName) {
      const { data: requesterProfile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", requester_id)
        .single();
      requesterDisplayName = requesterProfile?.full_name || "Ein Mitarbeiter";
    }

    // Erstelle In-App Benachrichtigung
    const { data: notification, error: notificationError } = await supabase
      .from("notifications")
      .insert({
        user_id: approver_id,
        type: "document_approval_request",
        title: "Neue Dokumentenfreigabe angefordert",
        message: `${requesterDisplayName} hat das Dokument "${document_title}" zur Freigabe eingereicht.`,
        metadata: {
          document_id,
          document_title,
          requester_id,
          requester_name: requesterDisplayName,
          action_url: `/documents/approvals`
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

    // Optional: E-Mail senden falls RESEND_API_KEY vorhanden und E-Mail erlaubt
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (resendApiKey && approverProfile?.email && isEmailAllowed(approverProfile.email)) {
      try {
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: FROM_ADDRESS,
            to: [approverProfile.email],
            subject: `Dokumentenfreigabe angefordert: ${document_title}`,
            html: `
              <h2>Neue Freigabeanfrage</h2>
              <p>Hallo ${approverProfile.full_name || ""},</p>
              <p>${requesterDisplayName} hat das Dokument <strong>"${document_title}"</strong> zur Freigabe eingereicht.</p>
              <p>Bitte prüfen Sie das Dokument und erteilen Sie die Freigabe.</p>
              <p><a href="https://app.minute.dev/documents/approvals" style="background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Zur Freigabe</a></p>
              <p>Mit freundlichen Grüßen,<br/>Ihr MINUTE Team</p>
            `,
          }),
        });

        if (emailResponse.ok) {
          console.log("✅ Email sent successfully");
        } else {
          console.log("⚠️ Email sending failed, but notification was created");
        }
      } catch (emailError) {
        console.log("⚠️ Email sending error:", emailError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        notification_id: notification?.id,
        message: "Benachrichtigung erfolgreich erstellt" 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("❌ Error in notify-document-approval:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
