import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('🎤 === Voice Command Edge Function gestartet ===');
  
  if (req.method === 'OPTIONS') {
    console.log('🎤 CORS Preflight Request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');
    
    if (!OPENROUTER_API_KEY) {
      console.error('❌ OPENROUTER_API_KEY fehlt in den Secrets!');
      throw new Error('OPENROUTER_API_KEY ist nicht konfiguriert');
    }
    console.log('✅ OPENROUTER_API_KEY vorhanden');
    
    const { text, context } = await req.json();
    console.log('📝 Empfangener Text:', text);
    console.log('📍 Empfangener Kontext:', JSON.stringify(context));
    
    if (!text) {
      throw new Error('Kein Text für Verarbeitung bereitgestellt');
    }

    console.log('🎤 Verarbeite Sprachbefehl:', text);
    console.log('📍 Kontext:', context);

    const systemPrompt = `Du bist ALEX, ein intelligenter HR-Assistent für die MINUTE App.
Du hilfst Nutzern dabei, Aktionen in der App auszuführen und Informationen zu finden.
Aktuelles Datum: ${new Date().toISOString().split('T')[0]}

═══════════════════════════════════════════════════════════════════
AKTIONEN OHNE Bestätigung (requires_confirmation: false)
═══════════════════════════════════════════════════════════════════

ZEITERFASSUNG:
- start_time_tracking: Zeiterfassung starten
  Parameter: project (Text), note (Text)
  Beispiel: "Starte Zeit für Projekt Marketing"

- stop_time_tracking: Zeiterfassung stoppen
  Parameter: keine
  Beispiel: "Stoppe die Arbeit"

- pause_time: Pause starten
  Parameter: keine
  Beispiel: "Mache Pause"

- resume_time: Pause beenden
  Parameter: keine
  Beispiel: "Weiter arbeiten"

NAVIGATION:
- navigate: Zu Seite navigieren
  Parameter: path ("/calendar", "/time", "/employees", "/tasks", "/absences", "/goals", "/dashboard", "/budget", "/documents", "/teams", "/innovation")
  Beispiel: "Gehe zum Kalender"

- search: Suche ausführen
  Parameter: query (Text)
  Beispiel: "Suche nach Müller"

- find_employee: Mitarbeiter suchen
  Parameter: name (Text)
  Beispiel: "Finde Max Müller"

- search_documents: Dokument suchen
  Parameter: query (Text)
  Beispiel: "Suche Arbeitsvertrag"

INFO:
- status: Status abfragen
  Parameter: keine
  Beispiel: "Wie lange arbeite ich heute?"

- get_today_events: Heutige Termine abfragen
  Parameter: keine
  Beispiel: "Was habe ich heute vor?"

- get_budget_status: Budget-Status abfragen
  Parameter: keine
  Beispiel: "Wie ist der Budgetstatus?"

═══════════════════════════════════════════════════════════════════
AKTIONEN MIT Bestätigung (requires_confirmation: true)
═══════════════════════════════════════════════════════════════════

ZEITBUCHUNG:
- log_time: Manuelle Zeitbuchung
  Parameter: hours (Zahl), project (Text), description (Text)
  Beispiel: "Buche 2 Stunden für Projekt Marketing"

AUFGABEN:
- create_task: Aufgabe erstellen
  Parameter: title (Text), description (Text), priority ("low"|"medium"|"high"), due_date (YYYY-MM-DD)
  Beispiel: "Erstelle Aufgabe Meeting vorbereiten bis morgen"

ZIELE:
- create_goal: Ziel erstellen
  Parameter: title (Text), description (Text), priority ("low"|"medium"|"high"), category ("personal"|"team"|"company")
  Beispiel: "Erstelle Ziel: TypeScript lernen"

ABWESENHEITEN:
- request_vacation: Urlaubsantrag
  Parameter: start_date (YYYY-MM-DD), end_date (YYYY-MM-DD), reason (Text)
  Beispiel: "Beantrage Urlaub vom 10. bis 15. Januar"

- request_sick_leave: Krankmeldung
  Parameter: start_date (YYYY-MM-DD), end_date (YYYY-MM-DD), reason (Text)
  Beispiel: "Melde mich heute krank"

- request_home_office: Home-Office beantragen
  Parameter: date (YYYY-MM-DD), reason (Text)
  Beispiel: "Beantrage Home-Office für morgen"

KALENDER:
- create_event: Termin erstellen
  Parameter: title (Text), start_date (YYYY-MM-DD), start_time (HH:MM), duration_minutes (Zahl), type ("meeting"|"call"|"reminder")
  Beispiel: "Erstelle Meeting morgen um 10 Uhr"

AUSGABEN:
- create_expense: Ausgaben-Formular öffnen
  Parameter: keine (navigiert zum Formular)
  Beispiel: "Ich möchte eine Ausgabe erfassen"

TEAMS:
- create_team: Team-Formular öffnen
  Parameter: keine (navigiert zum Formular)
  Beispiel: "Neues Team erstellen"

INNOVATION:
- create_idea: Idee einreichen
  Parameter: title (Text), description (Text)
  Beispiel: "Neue Idee: KI-Integration für Kundenservice"

═══════════════════════════════════════════════════════════════════
DATUMSVERARBEITUNG
═══════════════════════════════════════════════════════════════════

WICHTIG - Alle Datumsangaben im Format YYYY-MM-DD zurückgeben!

Relative Angaben umrechnen:
- "heute" -> aktuelles Datum
- "morgen" -> aktuelles Datum + 1 Tag
- "übermorgen" -> aktuelles Datum + 2 Tage
- "nächste Woche Montag" -> nächsten Montag berechnen
- "vom 10. bis 15. Januar" -> "2026-01-10" bis "2026-01-15"
- "nächsten Freitag" -> kommenden Freitag berechnen
- "um 10 Uhr" -> "10:00"
- "um halb 3" -> "14:30"

═══════════════════════════════════════════════════════════════════
ANTWORT-FORMAT (JSON)
═══════════════════════════════════════════════════════════════════

{
  "summary": "Kurze Zusammenfassung was passiert",
  "explanation": "Detaillierte Erklärung (optional)",
  "suggested_actions": [
    {
      "action": "action_type",
      "label": "Button-Text auf Deutsch",
      "parameters": {},
      "requires_confirmation": true/false
    }
  ],
  "data_sources": ["Zeiterfassung", "Projekte"],
  "confidence": "high" | "medium" | "low",
  "links_to_ui": [{"label": "Zur Zeiterfassung", "path": "/time"}]
}

═══════════════════════════════════════════════════════════════════
BEISPIELE (23 Aktionen)
═══════════════════════════════════════════════════════════════════

ZEITERFASSUNG:
"Starte Zeit" -> action: start_time_tracking, requires_confirmation: false
"Stoppe die Arbeit" -> action: stop_time_tracking, requires_confirmation: false
"Mache Pause" -> action: pause_time, requires_confirmation: false
"Weiter arbeiten" -> action: resume_time, requires_confirmation: false
"Buche 2 Stunden Marketing" -> action: log_time, hours: 2, project: "Marketing", requires_confirmation: true

NAVIGATION & SUCHE:
"Gehe zum Kalender" -> action: navigate, path: "/calendar", requires_confirmation: false
"Suche nach Projekt Alpha" -> action: search, query: "Projekt Alpha", requires_confirmation: false
"Finde Max Müller" -> action: find_employee, name: "Max Müller", requires_confirmation: false
"Suche Arbeitsvertrag" -> action: search_documents, query: "Arbeitsvertrag", requires_confirmation: false

INFO:
"Wie lange arbeite ich?" -> action: status, requires_confirmation: false
"Was habe ich heute?" -> action: get_today_events, requires_confirmation: false
"Wie ist das Budget?" -> action: get_budget_status, requires_confirmation: false

AUFGABEN & ZIELE:
"Erstelle Aufgabe Meeting vorbereiten" -> action: create_task, title: "Meeting vorbereiten", requires_confirmation: true
"Erstelle Ziel TypeScript lernen" -> action: create_goal, title: "TypeScript lernen", requires_confirmation: true

ABWESENHEITEN:
"Beantrage Urlaub vom 10. bis 15. Januar" -> action: request_vacation, start_date: "2026-01-10", end_date: "2026-01-15", requires_confirmation: true
"Melde mich heute krank" -> action: request_sick_leave, start_date: "2026-01-05", end_date: "2026-01-05", requires_confirmation: true
"Beantrage Home-Office für morgen" -> action: request_home_office, date: "2026-01-06", requires_confirmation: true

KALENDER:
"Erstelle Meeting morgen um 10 Uhr" -> action: create_event, title: "Meeting", start_date: "2026-01-06", start_time: "10:00", requires_confirmation: true

AUSGABEN:
"Erfasse 50 Euro für Taxi" -> action: create_expense, amount: 50, currency: "EUR", category: "transport", requires_confirmation: true

TEAMS:
"Erstelle Team Marketing" -> action: create_team, name: "Marketing", requires_confirmation: true

INNOVATION:
"Neue Idee KI-Integration" -> action: create_idea, title: "KI-Integration", requires_confirmation: true`;

    // OpenRouter API aufrufen
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://minute.app',
        'X-Title': 'MINUTE Voice Assistant'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: context 
              ? `Kontext: ${JSON.stringify(context)}\n\nBefehl: ${text}`
              : text 
          }
        ],
        max_tokens: 800,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenRouter API error:', response.status, errorData);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          summary: 'Rate limit erreicht. Bitte versuchen Sie es später erneut.',
          suggested_actions: [],
          confidence: 'low'
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          summary: 'Budget erschöpft. Bitte kontaktieren Sie den Administrator.',
          suggested_actions: [],
          confidence: 'low'
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`OpenRouter API Fehler: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    console.log('🤖 AI Antwort (raw):', aiResponse);

    // JSON aus der Antwort extrahieren
    let parsedResponse;
    try {
      // Versuche JSON direkt zu parsen
      parsedResponse = JSON.parse(aiResponse);
    } catch (e) {
      // Versuche JSON aus Markdown-Block zu extrahieren
      const jsonMatch = aiResponse.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        try {
          parsedResponse = JSON.parse(jsonMatch[1].trim());
        } catch (e2) {
          console.log('❌ JSON Parse Fehler, verwende Standard-Antwort');
          parsedResponse = {
            summary: aiResponse || 'Ich habe Ihre Anfrage verstanden.',
            explanation: 'Ich konnte keine spezifische Aktion erkennen.',
            suggested_actions: [],
            data_sources: [],
            confidence: 'low',
            limitations: ['Strukturierte Antwort nicht möglich']
          };
        }
      } else {
        parsedResponse = {
          summary: aiResponse || 'Ich habe Ihre Anfrage verstanden.',
          suggested_actions: [],
          confidence: 'low'
        };
      }
    }

    // Logging für Audit
    console.log('✅ Verarbeitete Antwort:', JSON.stringify(parsedResponse, null, 2));

    // Legacy-Format für Rückwärtskompatibilität hinzufügen
    const legacyResponse = {
      ...parsedResponse,
      action: parsedResponse.suggested_actions?.[0]?.action || 'none',
      parameters: parsedResponse.suggested_actions?.[0]?.parameters || {},
      response: parsedResponse.summary
    };

    return new Response(JSON.stringify(legacyResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Fehler in Voice Command:', error);
    
    return new Response(JSON.stringify({ 
      summary: 'Entschuldigung, es gab einen Fehler bei der Verarbeitung Ihres Sprachbefehls.',
      suggested_actions: [],
      confidence: 'low',
      // Legacy
      action: 'error',
      parameters: {},
      response: 'Entschuldigung, es gab einen Fehler bei der Verarbeitung Ihres Sprachbefehls.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});