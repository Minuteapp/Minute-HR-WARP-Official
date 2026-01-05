
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EventInvitationRequest {
  event: {
    title: string;
    startTime: string;
    endTime: string;
    location?: string;
    description?: string;
  };
  recipients: string[];
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { event, recipients }: EventInvitationRequest = await req.json();

    // Validate request
    if (!event.title || !event.startTime || !event.endTime) {
      return new Response(
        JSON.stringify({ error: "Missing required event details" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (!recipients || recipients.length === 0) {
      return new Response(
        JSON.stringify({ error: "No recipients provided" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // In a real implementation, this would connect to an email service
    // For now, we'll just log the request and simulate success
    console.log("Sending event invitation:", {
      event,
      recipients,
    });

    // Normally, you would use a service like Resend, SendGrid, or similar here
    // This is a placeholder for that implementation
    
    const sentCount = recipients.length;
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Einladungen wurden an ${sentCount} Teilnehmer gesendet`,
        sentTo: recipients,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-event-invitation function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
