import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  FROM_ADDRESS, 
  isEmailAllowed, 
  getEmailRestrictionMessage, 
  logEmailConfig 
} from "../_shared/email-config.ts";

// Create standardized error response
function createErrorResponse(message: string, status: number): Response {
  return new Response(
    JSON.stringify({ 
      success: false, 
      error: message 
    }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status 
    }
  );
}

serve(async (req: Request) => {
  console.log("Starting admin invitation function");
  logEmailConfig();
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // 1. Get API key from environment
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    console.log("RESEND_API_KEY available:", !!resendApiKey);
    
    if (!resendApiKey) {
      console.error("Missing Resend API key");
      return createErrorResponse("API key for email service is missing", 500);
    }
    
    // 2. Parse request data
    let requestData;
    try {
      const text = await req.text();
      console.log("Raw request body:", text);
      requestData = JSON.parse(text);
      console.log("Parsed request data:", JSON.stringify(requestData));
    } catch (error) {
      console.error("Error parsing request body:", error);
      return createErrorResponse("Invalid request format", 400);
    }
    
    // 3. Validate required fields
    const { email, companyName, companyId, signUpLink } = requestData;
    
    if (!email) {
      return createErrorResponse("Email is required", 400);
    }
    
    if (!companyName) {
      return createErrorResponse("Company name is required", 400);
    }
    
    if (!companyId) {
      return createErrorResponse("Company ID is required", 400);
    }
    
    console.log("Preparing to send admin invitation to:", email, "for company:", companyName);
    
    // Prüfe ob E-Mail erlaubt ist (Test- oder Produktionsmodus)
    if (!isEmailAllowed(email)) {
      const restrictionMessage = getEmailRestrictionMessage(email);
      console.warn(`E-Mail-Einschränkung: ${restrictionMessage}`);
      return createErrorResponse(restrictionMessage, 403);
    }
    
    // 4. Create registration link if not provided
    let registrationLink = signUpLink;
    if (!registrationLink) {
      const origin = req.headers.get('origin') || 'https://e9e72bf1-199f-4e01-878e-e14d3bdd184a.lovableproject.com';
      registrationLink = `${origin}/auth/register?company=${encodeURIComponent(companyId)}&invitation=true&role=admin`;
    }
    
    console.log("Registration link:", registrationLink);
    
    // 5. Generate email content
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="de">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Administrator-Einladung für ${companyName}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0070f3; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #0070f3; color: white !important; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Administrator-Einladung</h1>
          </div>
          <div class="content">
            <h2>Hallo!</h2>
            <p>Sie wurden eingeladen, Administrator für <strong>${companyName}</strong> zu werden.</p>
            <p>Klicken Sie auf die Schaltfläche unten, um Ihr Konto zu aktivieren:</p>
            <a href="${registrationLink}" class="button">Konto aktivieren</a>
            <p>Diese Einladung läuft in 7 Tagen ab.</p>
            <p>Falls Sie Probleme mit der Schaltfläche haben, kopieren Sie diesen Link in Ihren Browser:</p>
            <p style="word-break: break-all; color: #0070f3;">${registrationLink}</p>
          </div>
          <div class="footer">
            <p>Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht auf diese Nachricht.</p>
            <p>© ${new Date().getFullYear()} MINUTE. Alle Rechte vorbehalten.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    // Create plain text version
    const plainText = `Administrator-Einladung für ${companyName}

Hallo!

Sie wurden eingeladen, Administrator für ${companyName} zu werden.
Klicken Sie auf den folgenden Link, um Ihr Konto zu aktivieren:
${registrationLink}

Diese Einladung läuft in 7 Tagen ab.

Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht auf diese Nachricht.
© ${new Date().getFullYear()} MINUTE. Alle Rechte vorbehalten.`;

    // 6. Initialize Resend client with explicit API key
    const resend = new Resend(resendApiKey);
    
    console.log("Sending admin invitation email via Resend to:", email);
    
    // 7. Send email with Resend's default domain
    try {
      const data = await resend.emails.send({
        from: FROM_ADDRESS,
        to: [email],
        subject: `Einladung: Administrator für ${companyName}`,
        html: htmlContent,
        text: plainText
      });
      
      console.log("Email sending response:", JSON.stringify(data));
      
      // Check for errors in response
      if (data.error) {
        console.error("Error from Resend API:", data.error);
        return createErrorResponse(
          data.error.message || "Failed to send email",
          500
        );
      }
      
      // 8. Update invitation status in database
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        const { data: updateData, error: updateError } = await supabase.rpc('update_admin_invitation', {
          p_email: email,
          p_company_id: companyId
        });
        
        if (updateError) {
          console.warn("Error updating invitation status:", updateError);
          // Continue anyway since email was sent successfully
        } else {
          console.log("Invitation status updated successfully:", updateData);
        }
      } catch (dbError) {
        console.warn("Database update error:", dbError);
        // Continue anyway since email was sent successfully
      }
      
      // Return success response
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Admin invitation email sent successfully",
          id: (data as any).id || 'unknown'
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    } catch (error: any) {
      console.error("Error in Resend API:", error);
      return createErrorResponse(
        error.message || "An unexpected error occurred sending email",
        500
      );
    }
  } catch (error: any) {
    console.error("Unhandled error in send-admin-invitation function:", error);
    return createErrorResponse(
      error.message || "An unexpected error occurred",
      500
    );
  }
});