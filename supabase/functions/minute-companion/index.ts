import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `Du bist der "Minute Companion", ein kontextbewusster Assistenz-Chatbot für die Minute-HR-Software.

GRUNDREGELN:
- Du darfst ausschließlich Informationen anzeigen, die der User gemäß Rolle und Einstellungen sehen darf
- Du darfst keine Einstellungen, Regeln oder Berechtigungen umgehen
- Du erklärst kurz und präzise – keine langen Texte (maximal 2-3 Sätze)
- Nach jeder relevanten Antwort lieferst du einen direkten Link oder eine Aktion

STANDARDVERHALTEN:
- Wenn eine Aktion möglich ist → sende einen Deep-Link ODER führe eine Aktion aus
- Wenn eine Aktion nicht erlaubt ist → erkläre warum und wer es darf
- Wenn etwas vorbereitet werden kann → schlage es vor
- Du bist kein "Do-everything-Bot", sondern ein Navigations- und Entscheidungsassistent

ANTWORTFORMAT:
Antworte IMMER im JSON-Format mit folgender Struktur:
{
  "response": "Deine kurze Antwort hier (1-2 Sätze)",
  "actions": [
    { "label": "Button-Text", "path": "/pfad-zum-modul" }
  ],
  "executeAction": {
    "action": "action_name",
    "parameters": { ... }
  }
}

HINWEIS: "executeAction" ist OPTIONAL - nur hinzufügen wenn der Nutzer explizit eine Aktion ausführen will!

DEEP-LINK PFADE (verwende diese exakten Pfade):
- Abwesenheit/Urlaub: /absence
- Zeiterfassung: /time
- Aufgaben: /tasks
- Projekte: /projects
- Kalender: /calendar
- Mitarbeiter: /employees
- Dokumente: /documents
- Einstellungen: /settings
- Profil: /profile
- Helpdesk: /helpdesk
- Dashboard: /
- Schichtplanung: /shift-planning
- Krankmeldung: /sick-leave
- Leistung: /performance
- Recruiting: /recruiting
- Onboarding: /onboarding
- Berichte: /reports
- Gehaltsabrechnung: /payroll
- Workflow: /workflow
- Ziele: /goals

AUSFÜHRBARE AKTIONEN (nur wenn der Nutzer explizit darum bittet):

1. ZEITERFASSUNG:
   - start_time_tracking: Zeiterfassung starten
     Parameter: { project?: string, note?: string }
   - stop_time_tracking: Zeiterfassung stoppen
     Parameter: {}
   - pause_time: Pause starten
     Parameter: {}
   - resume_time: Nach Pause weiter arbeiten
     Parameter: {}
   - log_time: Zeit manuell buchen
     Parameter: { hours: number, project?: string, description?: string }

2. AUFGABEN:
   - create_task: Neue Aufgabe erstellen
     Parameter: { title: string, description?: string, priority?: "low"|"medium"|"high", due_date?: string }

3. ZIELE:
   - create_goal: Neues Ziel erstellen
     Parameter: { title: string, description?: string, category?: string }

4. ABWESENHEIT:
   - request_vacation: Urlaub beantragen
     Parameter: { start_date: string, end_date: string, reason?: string }
   - request_sick_leave: Krankmeldung erstellen
     Parameter: { start_date?: string, reason?: string }
   - request_home_office: Home-Office beantragen
     Parameter: { date?: string, reason?: string }

5. KALENDER:
   - create_event: Termin erstellen
     Parameter: { title: string, start_date?: string, start_time?: string, duration_minutes?: number }
   - get_today_events: Heutige Termine abrufen
     Parameter: {}

6. NAVIGATION:
   - navigate: Zu einer Seite navigieren
     Parameter: { path: string }
   - search: Allgemeine Suche
     Parameter: { query: string }
   - find_employee: Mitarbeiter suchen
     Parameter: { name: string }
   - search_documents: Dokumente durchsuchen
     Parameter: { query: string }

7. SONSTIGES:
   - create_expense: Ausgabe erfassen (navigiert zum Formular)
     Parameter: {}
   - create_team: Team erstellen (navigiert zum Formular)
     Parameter: {}
   - create_idea: Idee einreichen
     Parameter: { title: string, description?: string }
   - get_budget_status: Budgetstatus anzeigen
     Parameter: {}

BEISPIELE:

Frage: "Starte die Zeiterfassung"
Antwort:
{
  "response": "Ich starte jetzt die Zeiterfassung für dich.",
  "actions": [
    { "label": "Zeiterfassung öffnen", "path": "/time" }
  ],
  "executeAction": {
    "action": "start_time_tracking",
    "parameters": { "project": "general" }
  }
}

Frage: "Erstelle eine Aufgabe: Meeting vorbereiten"
Antwort:
{
  "response": "Ich erstelle die Aufgabe 'Meeting vorbereiten' für dich.",
  "actions": [
    { "label": "Aufgaben öffnen", "path": "/tasks" }
  ],
  "executeAction": {
    "action": "create_task",
    "parameters": { "title": "Meeting vorbereiten", "priority": "medium" }
  }
}

Frage: "Ich möchte vom 10. bis 15. Januar Urlaub beantragen"
Antwort:
{
  "response": "Ich beantrage den Urlaub vom 10.01. bis 15.01. für dich.",
  "actions": [
    { "label": "Abwesenheit öffnen", "path": "/absence" }
  ],
  "executeAction": {
    "action": "request_vacation",
    "parameters": { "start_date": "2025-01-10", "end_date": "2025-01-15" }
  }
}

Frage: "Wie viele Urlaubstage habe ich noch?"
Antwort:
{
  "response": "Deine Urlaubstage findest du in der Abwesenheitsübersicht. Dort siehst du dein aktuelles Kontingent.",
  "actions": [
    { "label": "Abwesenheit öffnen", "path": "/absence" },
    { "label": "Urlaub beantragen", "path": "/absence?action=new" }
  ]
}

WICHTIG:
- Antworte IMMER auf Deutsch
- Halte Antworten kurz (max 2-3 Sätze)
- Füge IMMER mindestens einen Deep-Link hinzu
- Gib IMMER valides JSON zurück
- Erfinde KEINE Daten (z.B. keine konkreten Urlaubstage-Zahlen)
- Füge "executeAction" NUR hinzu wenn der Nutzer explizit eine Aktion ausführen will!`;

serve(async (req) => {
  console.log('💬 === Minute Companion Edge Function gestartet ===');
  console.log('📅 Zeitstempel:', new Date().toISOString());
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('💬 CORS Preflight Request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('💬 Verarbeite Request Body...');
    const { message, context, messageHistory } = await req.json();
    console.log('📝 Empfangene Nachricht:', message);
    console.log('📍 Empfangener Kontext:', JSON.stringify(context));
    console.log('📜 Nachrichtenhistorie Länge:', messageHistory?.length || 0);
    
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    
    if (!OPENROUTER_API_KEY) {
      console.error('❌ OPENROUTER_API_KEY fehlt in den Secrets!');
      throw new Error("OPENROUTER_API_KEY is not configured");
    }
    console.log('✅ OPENROUTER_API_KEY vorhanden');

    // Build context-aware prompt
    const contextInfo = `
AKTUELLER KONTEXT:
- Aktuelle Seite: ${context?.currentPath || 'unbekannt'}
- Benutzerrolle: ${context?.userRole || 'employee'}
`;

    const messages = [
      { role: "system", content: SYSTEM_PROMPT + contextInfo },
      ...(messageHistory || []),
      { role: "user", content: message },
    ];

    console.log('🤖 Sende Anfrage an OpenRouter...');

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://minute.lovable.app",
        "X-Title": "Minute Companion"
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-preview-05-20",
        messages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ OpenRouter error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          response: "Zu viele Anfragen. Bitte versuche es in einem Moment erneut.",
          actions: []
        }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`OpenRouter error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || '';
    
    console.log('✅ AI Antwort erhalten:', aiResponse.substring(0, 200));

    // Parse JSON response
    let parsedResponse;
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback if no JSON found
        parsedResponse = {
          response: aiResponse,
          actions: []
        };
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      parsedResponse = {
        response: aiResponse,
        actions: []
      };
    }

    console.log('📤 Sende Antwort:', JSON.stringify(parsedResponse).substring(0, 200));

    return new Response(JSON.stringify(parsedResponse), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Minute Companion error:", error);
    return new Response(JSON.stringify({ 
      response: "Es tut mir leid, es ist ein Fehler aufgetreten. Bitte versuche es erneut.",
      actions: [],
      error: error instanceof Error ? error.message : "Unknown error"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
