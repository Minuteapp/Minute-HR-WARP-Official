
import { Resend } from "https://esm.sh/resend@2.0.0";
import { corsHeaders } from "../_shared/cors.ts";

interface SendEmailParams {
  email: string;
  company: string;
  emailHTML: string;
  plainText: string;
  resendApiKey: string;
}

/**
 * Sends activation email using the Resend service with maximum simplicity for reliability
 */
export async function sendActivationEmail({
  email,
  company,
  emailHTML,
  plainText,
  resendApiKey
}: SendEmailParams): Promise<Response> {
  try {
    console.log("Starting simplified email sending process to:", email);
    
    if (!resendApiKey) {
      console.error("Missing Resend API key");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Missing Resend API key configuration",
          message: "Missing Resend API key configuration" 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // Initialize Resend client with API key
    const resend = new Resend(resendApiKey);
    
    // Send email with minimal configuration
    const data = await resend.emails.send({
      from: "MINUTE <onboarding@resend.dev>",
      to: [email],
      subject: `Einladung: Administrator für ${company}`,
      html: emailHTML,
      text: plainText
    });
    
    console.log("Resend API response:", JSON.stringify(data));
    
    // Check for errors in response
    if (data.error) {
      console.error("Error from Resend API:", data.error);
      
      // Handle domain verification errors specifically
      if (data.error.message?.includes("You can only send testing emails")) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "E-Mail-Domain nicht verifiziert. Bitte verifizieren Sie Ihre Domain bei Resend unter https://resend.com/domains oder verwenden Sie die Domain onboarding@resend.dev als Absender.",
            message: "Domain nicht verifiziert. Bitte verifizieren Sie Ihre Domain bei Resend."
          }),
          { 
            status: 403, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: data.error.message || "Failed to send email",
          message: data.error.message || "Failed to send email"
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // Success response
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
  } catch (error) {
    console.error("Unexpected error in sendActivationEmail:", error);
    
    // Provide a reliable error response
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred while sending email";
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage,
        message: errorMessage
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
}
