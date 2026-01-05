import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { buildEmailTemplate } from "./email-template.ts";
import { 
  FROM_ADDRESS, 
  isEmailAllowed, 
  getEmailRestrictionMessage, 
  logEmailConfig 
} from "../_shared/email-config.ts";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
  console.log("Starting activation email function");
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
    const { email, name, company, signUpLink } = requestData;
    
    if (!email) {
      return createErrorResponse("Email is required", 400);
    }
    
    if (!company) {
      return createErrorResponse("Company name is required", 400);
    }
    
    if (!signUpLink) {
      return createErrorResponse("Sign-up link is required", 400);
    }
    
    console.log("Preparing to send invitation to:", email, "for company:", company);
    
    // Prüfe ob E-Mail erlaubt ist (Test- oder Produktionsmodus)
    if (!isEmailAllowed(email)) {
      const restrictionMessage = getEmailRestrictionMessage(email);
      console.warn(`E-Mail-Einschränkung: ${restrictionMessage}`);
      return createErrorResponse(restrictionMessage, 403);
    }
    
    // 4. Generate email content
    const logoBase64 = "data:image/png;base64,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";
    
    // Create email HTML content
    const htmlContent = buildEmailTemplate(
      name || email.split('@')[0],
      email,
      company,
      signUpLink,
      logoBase64
    );
    
    // Create plain text version
    const plainText = `Invitation: Administrator for ${company}.
Hello ${name || email},

You have been invited to become an administrator for ${company}.
Click the following link to activate your account:
${signUpLink}

This invitation expires in 7 days.

This is an automatically generated email. Please do not reply to this message.
© ${new Date().getFullYear()} MINUTE. All rights reserved.`;

    // 5. Initialize Resend client with explicit API key
    const resend = new Resend(resendApiKey);
    
    console.log("Sending email via Resend to:", email);
    
    // 6. Send email with Resend's default domain
    try {
      const data = await resend.emails.send({
        from: FROM_ADDRESS,
        to: [email],
        subject: `Einladung: Administrator für ${company}`,
        html: htmlContent,
        text: plainText
      });
      
      console.log("Email sending response:", JSON.stringify(data));
      
      // Return success response
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Email sent successfully",
          id: (data as any).id || 'unknown'
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    } catch (error: any) {
      console.error("Error in Resend API:", error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: error.message || "An unexpected error occurred sending email",
          message: error.message || "An unexpected error occurred sending email"
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500 
        }
      );
    }
  } catch (error: any) {
    console.error("Unhandled error in send-activation-email function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "An unexpected error occurred",
        message: error.message || "An unexpected error occurred" 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
