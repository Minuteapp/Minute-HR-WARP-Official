import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { corsHeaders } from "../_shared/cors.ts";
import { FROM_ADDRESS, logEmailConfig } from "../_shared/email-config.ts";

serve(async (req: Request) => {
  console.log("=== Test-Email Function gestartet ===");
  logEmailConfig();
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    console.log("RESEND_API_KEY vorhanden:", !!resendApiKey);
    
    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ success: false, error: "RESEND_API_KEY fehlt" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Parse request body
    let testEmail = "minuteapp@outlook.de"; // Standard Test-Email
    try {
      const body = await req.json();
      if (body.email) {
        testEmail = body.email;
      }
    } catch {
      // Kein Body oder kein JSON - nutze Standard-Email
    }
    
    console.log("Sende Test-Email an:", testEmail);
    console.log("Absender:", FROM_ADDRESS);
    
    const resend = new Resend(resendApiKey);
    
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="de">
      <head>
        <meta charset="UTF-8">
        <title>MINUTE Test-Email</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0070f3, #00c6ff); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .success { background: #10b981; color: white; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 E-Mail-Test erfolgreich!</h1>
          </div>
          <div class="content">
            <div class="success">
              <strong>✅ Die Domain minute-hr.de ist korrekt konfiguriert!</strong>
            </div>
            <p>Diese Test-E-Mail wurde erfolgreich über Resend gesendet.</p>
            <p><strong>Konfiguration:</strong></p>
            <ul>
              <li>Domain: minute-hr.de</li>
              <li>Absender: ${FROM_ADDRESS}</li>
              <li>Zeitpunkt: ${new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' })}</li>
            </ul>
            <p>Alle E-Mail-Funktionen (Einladungen, Benachrichtigungen, etc.) sollten jetzt funktionieren.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} MINUTE. Alle Rechte vorbehalten.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const data = await resend.emails.send({
      from: FROM_ADDRESS,
      to: [testEmail],
      subject: "✅ MINUTE E-Mail-Test erfolgreich",
      html: htmlContent,
    });
    
    console.log("Resend Antwort:", JSON.stringify(data));
    
    if ((data as any).error) {
      console.error("Resend Fehler:", (data as any).error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: (data as any).error.message || "E-Mail-Versand fehlgeschlagen",
          details: (data as any).error
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Test-E-Mail erfolgreich an ${testEmail} gesendet!`,
        id: (data as any).id,
        from: FROM_ADDRESS
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
    
  } catch (error: any) {
    console.error("Fehler:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Unbekannter Fehler",
        stack: error.stack
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
