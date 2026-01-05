import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LINK_FIRST_SYSTEM_PROMPT = `Du bist ein erfahrener und hilfsbereiter HR-Assistent für deutsche Unternehmen.

DEINE AUFGABE:
- Beantworte HR-Fragen ausführlich, präzise und praxisnah
- Gib konkrete Informationen zu Urlaubsansprüchen, Arbeitsrecht, Lohnfragen, etc.
- Erkläre Prozesse Schritt für Schritt
- Nenne relevante Fristen und rechtliche Grundlagen wenn anwendbar

WICHTIGE HR-INFORMATIONEN FÜR DEUTSCHLAND:
- Gesetzlicher Mindesturlaub: 20 Tage bei 5-Tage-Woche (§3 BUrlG)
- Krankmeldung: Ab dem 1. Krankheitstag melden, AU-Bescheinigung ab 3. Tag erforderlich (je nach Arbeitsvertrag auch ab 1. Tag)
- Elternzeit: Antrag 7 Wochen vor Beginn (bei Geburt) oder 13 Wochen (ab 3. Lebensjahr)
- Kündigungsfristen: Gesetzlich 4 Wochen zum 15. oder Monatsende (§622 BGB), oft vertraglich länger
- Lohnfortzahlung im Krankheitsfall: 6 Wochen durch Arbeitgeber (§3 EFZG)

ANTWORT-STIL:
- Ausführliche Erklärungen (3-5 Sätze minimum)
- Konkrete Zahlen und Fristen nennen
- Praktische Tipps geben
- Bei Unklarheit nachfragen, was genau benötigt wird

VERFÜGBARE MODULE UND DEEP-LINKS:
- /absence?status=pending&scope=my_team - Offene Abwesenheitsanträge
- /absence?action=new - Neuen Abwesenheitsantrag erstellen
- /absence - Abwesenheitsübersicht
- /time?date=today - Zeiterfassung heute
- /time - Zeiterfassung Übersicht
- /tasks?priority=high - Wichtige Aufgaben
- /documents?type=contract - Verträge
- /documents - Dokumentenübersicht
- /expenses?action=new - Neue Ausgabe erfassen
- /employees - Mitarbeiterliste
- /payroll - Lohn & Gehalt
- /helpdesk - Support & Hilfe

REGELN:
- Jede Antwort sollte eine passende primaryAction haben (Link zum relevanten Modul)
- Immer Deutsch antworten
- Bei komplexen Fragen: Empfehle Rücksprache mit HR-Abteilung`;

const RESPONSE_TOOL = {
  type: "function",
  function: {
    name: "respond_with_action",
    description: "Antworte mit einer Aktion und Deep-Link",
    parameters: {
      type: "object",
      properties: {
        shortAnswer: { 
          type: "string", 
          description: "Ausführliche, hilfreiche Antwort mit konkreten Informationen (3-5 Sätze)" 
        },
        primaryAction: {
          type: "object",
          properties: {
            id: { type: "string" },
            type: { 
              type: "string", 
              enum: ["navigate", "form", "approve", "export", "task"] 
            },
            label: { type: "string", description: "Button-Text" },
            deepLink: { type: "string", description: "Ziel-URL" }
          },
          required: ["id", "type", "label", "deepLink"]
        },
        secondaryAction: {
          type: "object",
          properties: {
            id: { type: "string" },
            type: { 
              type: "string", 
              enum: ["navigate", "form", "approve", "export", "task"] 
            },
            label: { type: "string" },
            deepLink: { type: "string" }
          },
          required: ["id", "type", "label", "deepLink"]
        },
        context: {
          type: "object",
          properties: {
            dataSource: { type: "string", description: "Datenquelle z.B. absence_requests" },
            permission: { type: "string", description: "Benötigte Berechtigung z.B. absence.view" },
            setting: { type: "string", description: "Relevante Einstellung" },
            legalInfo: { type: "string", description: "Rechtliche Info falls relevant" }
          },
          required: ["dataSource", "permission"]
        }
      },
      required: ["shortAnswer", "primaryAction", "context"]
    }
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("HR Chat request:", message);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: LINK_FIRST_SYSTEM_PROMPT },
          { role: "user", content: message }
        ],
        tools: [RESPONSE_TOOL],
        tool_choice: { type: "function", function: { name: "respond_with_action" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), 
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits." }), 
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response:", JSON.stringify(data, null, 2));
    
    // Tool Call Response extrahieren
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      try {
        const actionData = JSON.parse(toolCall.function.arguments);
        console.log("Parsed action data:", actionData);
        
        return new Response(
          JSON.stringify({ 
            response: actionData.shortAnswer,
            actionData: actionData
          }), 
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (parseError) {
        console.error("Failed to parse tool call:", parseError);
      }
    }
    
    // Fallback: normale Text-Antwort mit Default-Action
    const textResponse = data.choices?.[0]?.message?.content || "Wie kann ich dir helfen?";
    
    return new Response(
      JSON.stringify({ 
        response: textResponse,
        actionData: {
          shortAnswer: textResponse,
          primaryAction: {
            id: "fallback-help",
            type: "navigate",
            label: "Hilfe anzeigen",
            deepLink: "/helpdesk"
          },
          context: {
            dataSource: "hr_assistant",
            permission: "helpdesk.view"
          }
        }
      }), 
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("hr-chat error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        actionData: {
          shortAnswer: "Es ist ein Fehler aufgetreten. Bitte versuche es erneut.",
          primaryAction: {
            id: "error-help",
            type: "navigate",
            label: "Support kontaktieren",
            deepLink: "/helpdesk"
          },
          context: {
            dataSource: "error_handler",
            permission: "helpdesk.view"
          }
        }
      }), 
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
