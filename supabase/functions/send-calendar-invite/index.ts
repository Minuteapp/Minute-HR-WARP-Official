import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CalendarInviteRequest {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location?: string;
  description?: string;
  attendees: string[];
  isAllDay: boolean;
}

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('de-DE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const generateICSContent = (
  title: string,
  date: string,
  startTime: string,
  endTime: string,
  location: string,
  description: string,
  isAllDay: boolean
): string => {
  const eventDate = new Date(date);
  const year = eventDate.getFullYear();
  const month = String(eventDate.getMonth() + 1).padStart(2, '0');
  const day = String(eventDate.getDate()).padStart(2, '0');
  
  const uid = `${Date.now()}@minute-calendar`;
  const now = new Date();
  const dtstamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  
  let dtstart: string;
  let dtend: string;
  
  if (isAllDay) {
    dtstart = `${year}${month}${day}`;
    const nextDay = new Date(eventDate);
    nextDay.setDate(nextDay.getDate() + 1);
    dtend = `${nextDay.getFullYear()}${String(nextDay.getMonth() + 1).padStart(2, '0')}${String(nextDay.getDate()).padStart(2, '0')}`;
  } else {
    const [startHour, startMinute] = startTime.split(':');
    const [endHour, endMinute] = endTime.split(':');
    dtstart = `${year}${month}${day}T${startHour}${startMinute}00`;
    dtend = `${year}${month}${day}T${endHour}${endMinute}00`;
  }

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//MINUTE//Calendar//DE
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${dtstamp}
${isAllDay ? `DTSTART;VALUE=DATE:${dtstart}` : `DTSTART:${dtstart}`}
${isAllDay ? `DTEND;VALUE=DATE:${dtend}` : `DTEND:${dtend}`}
SUMMARY:${title}
${location ? `LOCATION:${location}` : ''}
${description ? `DESCRIPTION:${description.replace(/\n/g, '\\n')}` : ''}
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;
};

const sendEmailWithResend = async (
  to: string,
  subject: string,
  html: string,
  icsContent: string
): Promise<{ success: boolean; error?: string }> => {
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  
  if (!RESEND_API_KEY) {
    console.error('[send-calendar-invite] RESEND_API_KEY not configured');
    return { success: false, error: 'RESEND_API_KEY not configured' };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "MINUTE Kalender <onboarding@resend.dev>",
        to: [to],
        subject,
        html,
        attachments: [
          {
            filename: "termin.ics",
            content: btoa(unescape(encodeURIComponent(icsContent))),
          },
        ],
      }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error(`[send-calendar-invite] Resend API error:`, result);
      return { success: false, error: result.message || 'Failed to send email' };
    }

    return { success: true };
  } catch (error: any) {
    console.error(`[send-calendar-invite] Exception:`, error);
    return { success: false, error: error.message };
  }
};

const handler = async (req: Request): Promise<Response> => {
  console.log('[send-calendar-invite] Function called');

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: CalendarInviteRequest = await req.json();
    console.log('[send-calendar-invite] Request body:', JSON.stringify(body));

    const { title, date, startTime, endTime, location, description, attendees, isAllDay } = body;

    if (!attendees || attendees.length === 0) {
      console.log('[send-calendar-invite] No attendees provided');
      return new Response(
        JSON.stringify({ error: "No attendees provided" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const formattedDate = formatDate(date);
    const timeInfo = isAllDay ? "Ganztägig" : `${startTime} - ${endTime} Uhr`;

    // Generate ICS file content
    const icsContent = generateICSContent(
      title,
      date,
      startTime,
      endTime,
      location || '',
      description || '',
      isAllDay
    );

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .detail { margin-bottom: 15px; }
          .detail-label { font-weight: bold; color: #6b7280; font-size: 12px; text-transform: uppercase; }
          .detail-value { font-size: 16px; margin-top: 4px; }
          .footer { text-align: center; margin-top: 30px; color: #9ca3af; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📅 Termineinladung</h1>
          </div>
          <div class="content">
            <p>Sie wurden zu folgendem Termin eingeladen:</p>
            
            <div class="detail">
              <div class="detail-label">Termin</div>
              <div class="detail-value">${title}</div>
            </div>
            
            <div class="detail">
              <div class="detail-label">Datum</div>
              <div class="detail-value">${formattedDate}</div>
            </div>
            
            <div class="detail">
              <div class="detail-label">Zeit</div>
              <div class="detail-value">${timeInfo}</div>
            </div>
            
            ${location ? `
            <div class="detail">
              <div class="detail-label">Ort</div>
              <div class="detail-value">${location}</div>
            </div>
            ` : ''}
            
            ${description ? `
            <div class="detail">
              <div class="detail-label">Beschreibung</div>
              <div class="detail-value">${description}</div>
            </div>
            ` : ''}
            
            <p style="margin-top: 20px;">Die angehängte .ics-Datei können Sie in Ihren Kalender importieren.</p>
          </div>
          <div class="footer">
            <p>Diese E-Mail wurde automatisch von MINUTE gesendet.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const results: { email: string; success: boolean; error?: string }[] = [];

    for (const email of attendees) {
      console.log(`[send-calendar-invite] Sending to: ${email}`);
      
      const result = await sendEmailWithResend(
        email,
        `Termineinladung: ${title}`,
        emailHtml,
        icsContent
      );

      console.log(`[send-calendar-invite] Result for ${email}:`, result);
      results.push({ email, ...result });
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`[send-calendar-invite] Completed: ${successCount}/${attendees.length} emails sent`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: successCount, 
        total: attendees.length,
        results 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("[send-calendar-invite] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
