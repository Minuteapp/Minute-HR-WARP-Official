import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileName, fileType, fileSize, documentId } = await req.json();
    console.log('Analyzing document:', { fileName, fileType, fileSize, documentId });

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    // Erstelle einen aussagekräftigen Prompt für die Dokumentenanalyse
    const systemPrompt = `Du bist ein Experte für die Analyse von HR-Dokumenten. 
Analysiere die bereitgestellten Dokumentinformationen und klassifiziere sie entsprechend.

Verfügbare Dokumenttypen:
- Vertrag (Arbeitsverträge, Vertragsänderungen)
- Lohnabrechnung (Gehaltsabrechnungen, Lohndokumente)
- Krankmeldung (Krankschreibungen, Atteste)
- Weiterbildungsnachweis (Zertifikate, Schulungsnachweise)
- Urlaubsantrag (Urlaubsformulare)
- Arbeitszeugnis (Zeugnisse, Referenzen)
- Richtlinie (Unternehmensrichtlinien, Policies)
- Datenschutz (Datenschutzerklärungen, DSGVO-Dokumente)
- Sonstiges (Andere Dokumente)

Verfügbare Kategorien:
- training (Schulung & Weiterbildung)
- recruiting (Recruiting & Onboarding)
- company (Unternehmensdokumente)
- employee (Mitarbeiterdokumente)
- payroll (Lohn & Gehalt)
- legal (Rechtliche Dokumente)

WICHTIG - Entscheide automatisch:

FREIGABE ERFORDERLICH (requires_approval = true):
- Verträge (rechtlich bindend, müssen von Vorgesetzten genehmigt werden)
- Arbeitszeugnisse (offizielle Dokumente, brauchen Freigabe)
- Richtlinien (Unternehmensrelevant, brauchen Admin-Freigabe)
- Datenschutzerklärungen (Compliance-relevant, brauchen Freigabe)

SIGNATUR ERFORDERLICH (requires_signature = true):
- Verträge (rechtliche Verbindlichkeit durch Unterschrift)
- Arbeitszeugnisse (Authentizität durch Unterschrift)
- Lohnabrechnungen (Bestätigung durch Signatur)

KEINE FREIGABE/SIGNATUR:
- Weiterbildungsnachweise (nur Dokumentation)
- Krankmeldungen (nur Information, im Krankmeldungs-Modul verwaltet)
- Urlaubsanträge (werden im Urlaubs-Modul verwaltet)
- Sonstige Dokumente (Standard-Dokumente)`;

    const userPrompt = `Analysiere dieses Dokument:
Dateiname: ${fileName}
Dateityp: ${fileType}
Dateigröße: ${fileSize} Bytes

Bestimme den Dokumenttyp, die passende Kategorie und erstelle eine kurze Zusammenfassung.`;

    // Strukturierte Ausgabe mit Tool Calling
    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_document",
              description: "Analysiere das Dokument und extrahiere wichtige Informationen",
              parameters: {
                type: "object",
                properties: {
                  document_type: {
                    type: "string",
                    enum: ["Vertrag", "Lohnabrechnung", "Krankmeldung", "Weiterbildungsnachweis", "Urlaubsantrag", "Arbeitszeugnis", "Richtlinie", "Datenschutz", "Sonstiges"]
                  },
                  category: {
                    type: "string",
                    enum: ["training", "recruiting", "company", "employee", "payroll", "legal"]
                  },
                  summary: {
                    type: "string",
                    description: "Kurze Zusammenfassung des Dokuments (max. 150 Zeichen)"
                  },
                  confidence: {
                    type: "number",
                    description: "Konfidenz der Klassifizierung (0-100)"
                  },
                  tags: {
                    type: "array",
                    items: { type: "string" },
                    description: "Relevante Tags für das Dokument"
                  },
                  requires_approval: {
                    type: "boolean",
                    description: "Benötigt das Dokument eine Freigabe durch einen Vorgesetzten? (true für Verträge, Arbeitszeugnisse, Richtlinien, Datenschutzerklärungen)"
                  },
                  requires_signature: {
                    type: "boolean",
                    description: "Benötigt das Dokument eine digitale Signatur? (true für Verträge, Arbeitszeugnisse, Lohnabrechnungen)"
                  }
                },
                required: ["document_type", "category", "summary", "confidence", "requires_approval", "requires_signature"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "analyze_document" } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('OpenAI API Error:', aiResponse.status, errorText);
      throw new Error(`OpenAI API Error: ${aiResponse.status} - ${errorText}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI Response:', JSON.stringify(aiData));

    // Extrahiere die strukturierten Daten aus dem Tool Call
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error('No tool call in AI response');
    }

    const analysis = JSON.parse(toolCall.function.arguments);
    console.log('Document analysis:', analysis);

    // Aktualisiere das Dokument in der Datenbank mit den Analyseergebnissen
    if (documentId) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { error: updateError } = await supabase
        .from('documents')
        .update({
          document_type: analysis.document_type,
          category: analysis.category,
          requires_approval: analysis.requires_approval,
          requires_signature: analysis.requires_signature,
          status: analysis.requires_approval ? 'pending' : 'approved',
          signature_status: analysis.requires_signature ? 'unsigned' : null,
          metadata: {
            ai_analysis: {
              summary: analysis.summary,
              confidence: analysis.confidence,
              analyzed_at: new Date().toISOString(),
              tags: analysis.tags || [],
              model: 'gpt-4o-mini',
              requires_approval: analysis.requires_approval,
              requires_signature: analysis.requires_signature
            }
          },
          tags: analysis.tags || []
        })
        .eq('id', documentId);

      if (updateError) {
        console.error('Error updating document:', updateError);
        throw updateError;
      }

      console.log('Document updated successfully with AI analysis');
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        analysis: {
          document_type: analysis.document_type,
          category: analysis.category,
          summary: analysis.summary,
          confidence: analysis.confidence,
          tags: analysis.tags || [],
          requires_approval: analysis.requires_approval,
          requires_signature: analysis.requires_signature
        }
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in analyze-document function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
