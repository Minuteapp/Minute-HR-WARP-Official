import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to parse amount strings in various formats
function parseAmountString(amountStr: string): number | null {
  if (!amountStr || typeof amountStr !== 'string') return null;
  
  // Remove currency symbols and whitespace
  let cleaned = amountStr.replace(/[€$£CHF\s]/gi, '').trim();
  
  // Count separators to determine format
  const dots = (cleaned.match(/\./g) || []).length;
  const commas = (cleaned.match(/,/g) || []).length;
  
  if (dots === 1 && commas === 0) {
    // English format: 1234.56
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  } else if (commas === 1 && dots === 0) {
    // German format without thousands: 1234,56
    const num = parseFloat(cleaned.replace(',', '.'));
    return isNaN(num) ? null : num;
  } else if (dots >= 1 && commas === 1) {
    // German format with thousands: 1.234,56 or 1.234.567,89
    // Dots are thousands separators, comma is decimal
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  } else if (commas >= 1 && dots === 1) {
    // English format with thousands: 1,234.56 or 1,234,567.89
    // Commas are thousands separators, dot is decimal
    cleaned = cleaned.replace(/,/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  } else if (dots === 0 && commas === 0) {
    // Just a number: 1234
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  }
  
  // Fallback: try parsing as-is
  const num = parseFloat(cleaned.replace(',', '.'));
  return isNaN(num) ? null : num;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileName, fileType, fileSize, base64Content } = await req.json();
    console.log('Analyzing document with Vision:', { fileName, fileType, fileSize, hasContent: !!base64Content });

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const systemPrompt = `Du bist ein Experte für die Analyse von Geschäfts- und HR-Dokumenten mittels Bildanalyse.
Analysiere das bereitgestellte Dokument/Bild und klassifiziere es entsprechend.

Verfügbare Dokumenttypen:
- Rechnung (Eingangsrechnungen, Lieferantenrechnungen, Quittungen, Belege, Spesen, Rechnungen)
- Vertrag (Arbeitsverträge, Vertragsänderungen, Dienstleistungsverträge)
- Lohnabrechnung (Gehaltsabrechnungen, Lohndokumente, Bezügemitteilungen)
- Krankmeldung (Krankschreibungen, Atteste, AU-Bescheinigungen)
- Weiterbildungsnachweis (Zertifikate, Schulungsnachweise, Teilnahmebestätigungen)
- Urlaubsantrag (Urlaubsformulare, Freistellungsanträge)
- Arbeitszeugnis (Zeugnisse, Referenzen, Beurteilungen)
- Richtlinie (Unternehmensrichtlinien, Policies, Handbücher)
- Datenschutz (Datenschutzerklärungen, DSGVO-Dokumente, Einwilligungen)
- Sonstiges (Andere Dokumente)

Verfügbare Kategorien (WICHTIG: Verwende NUR diese Werte):
- company (Unternehmensdokumente - auch für Rechnungen, Quittungen, Belege, Ausgaben)
- training (Schulung & Weiterbildung)
- recruiting (Recruiting & Onboarding)
- employee (Mitarbeiterdokumente)
- payroll (Lohn & Gehalt)
- legal (Rechtliche Dokumente)

HINWEIS: Für Rechnungen, Quittungen und Ausgaben verwende Kategorie "company".

WICHTIG - Entscheide automatisch basierend auf dem Dokumentinhalt:

FREIGABE ERFORDERLICH (requires_approval = true):
- Verträge (rechtlich bindend)
- Arbeitszeugnisse (offizielle Dokumente)
- Richtlinien (unternehmensrelevant)
- Datenschutzerklärungen (Compliance-relevant)
- Rechnungen über 1000€ (Compliance)

SIGNATUR ERFORDERLICH (requires_signature = true):
- Verträge (rechtliche Verbindlichkeit)
- Arbeitszeugnisse (Authentizität)
- Lohnabrechnungen (Bestätigung)

Bei RECHNUNGEN extrahiere zusätzlich:
- Rechnungsnummer (z.B. "RE-2024-001", "INV-12345")
- Rechnungsdatum im Format YYYY-MM-DD (z.B. "2024-03-15")
- Gesamtbetrag (brutto) - KRITISCH WICHTIG für korrekte Extraktion:
  * Immer als DEZIMALZAHL mit PUNKT als Dezimaltrenner zurückgeben
  * Deutsche Zahlen: "1.234,56 €" → 1234.56 (Punkt ist Tausendertrenner, Komma ist Dezimaltrenner)
  * Englische Zahlen: "1,234.56 USD" → 1234.56 (Komma ist Tausendertrenner, Punkt ist Dezimaltrenner)
  * Beispiele: "€ 99,00" → 99.00, "1.234,56 €" → 1234.56, "$1,234.56" → 1234.56
  * KEINE Währungssymbole, KEINE Tausendertrennzeichen in der Ausgabe
  * Suche nach Begriffen wie "Gesamtbetrag", "Total", "Summe", "Brutto", "Endbetrag"
- Währung (EUR, USD, CHF, GBP - standardmäßig EUR wenn nicht erkennbar)
- Lieferant/Rechnungssteller (Firmenname des Absenders)
- Steuerbetrag (MwSt/VAT) - ebenfalls als Dezimalzahl mit Punkt

Wenn kein Bildinhalt verfügbar ist (z.B. bei PDFs ohne Vision-Analyse), setze confidence auf maximal 50 und markiere im summary, dass nur Dateinamen-Analyse möglich war.

Analysiere den INHALT des Dokuments genau - erkenne Text, Logos, Formulare und Struktur.`;

    // Prüfe ob wir ein Bild haben
    const isImage = fileType?.startsWith('image/') || 
                    ['png', 'jpg', 'jpeg', 'gif', 'webp'].some(ext => fileName?.toLowerCase().endsWith(`.${ext}`));
    
    const isPDF = fileType === 'application/pdf' || fileName?.toLowerCase().endsWith('.pdf');

    let messages: any[] = [];
    
    if (base64Content && (isImage || isPDF)) {
      // Vision-basierte Analyse mit Bildinhalt
      const mimeType = isImage ? (fileType || 'image/png') : 'image/png';
      
      console.log('Using Vision API for document analysis');
      
      messages = [
        { role: 'system', content: systemPrompt },
        { 
          role: 'user', 
          content: [
            { 
              type: 'text', 
              text: `Analysiere dieses HR-Dokument:
Dateiname: ${fileName}
Dateityp: ${fileType}
Dateigröße: ${fileSize} Bytes

Untersuche den sichtbaren Inhalt des Dokuments und bestimme:
1. Den genauen Dokumenttyp basierend auf dem Inhalt
2. Die passende Kategorie
3. Eine präzise Zusammenfassung des Inhalts
4. Erkannte Schlüsselwörter/Tags
5. Ob eine Freigabe erforderlich ist
6. Ob eine Signatur erforderlich ist` 
            },
            { 
              type: 'image_url', 
              image_url: { 
                url: `data:${mimeType};base64,${base64Content}`,
                detail: 'high'
              } 
            }
          ]
        }
      ];
    } else {
      // Fallback: Nur Dateinamen-basierte Analyse
      console.log('Using text-only analysis (no image content available)');
      
      messages = [
        { role: 'system', content: systemPrompt },
        { 
          role: 'user', 
          content: `Analysiere dieses Dokument basierend auf den Metadaten:
Dateiname: ${fileName}
Dateityp: ${fileType}
Dateigröße: ${fileSize} Bytes

Bestimme den wahrscheinlichsten Dokumenttyp, die passende Kategorie und weitere Eigenschaften.`
        }
      ];
    }

    // API-Aufruf mit strukturierter Ausgabe via Tool Calling
    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
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
                    enum: ["Rechnung", "Vertrag", "Lohnabrechnung", "Krankmeldung", "Weiterbildungsnachweis", "Urlaubsantrag", "Arbeitszeugnis", "Richtlinie", "Datenschutz", "Sonstiges"],
                    description: "Der erkannte Dokumenttyp"
                  },
                  category: {
                    type: "string",
                    enum: ["training", "recruiting", "company", "employee", "payroll", "legal"],
                    description: "Die Dokumentkategorie (Rechnungen/Ausgaben → 'company')"
                  },
                  summary: {
                    type: "string",
                    description: "Kurze, präzise Zusammenfassung des Dokumentinhalts (max. 200 Zeichen)"
                  },
                  confidence: {
                    type: "number",
                    description: "Konfidenz der Klassifizierung in Prozent (0-100)"
                  },
                  tags: {
                    type: "array",
                    items: { type: "string" },
                    description: "Relevante Tags/Schlüsselwörter für das Dokument"
                  },
                  requires_approval: {
                    type: "boolean",
                    description: "Benötigt das Dokument eine Freigabe?"
                  },
                  requires_signature: {
                    type: "boolean",
                    description: "Benötigt das Dokument eine digitale Signatur?"
                  },
                  detected_entities: {
                    type: "object",
                    properties: {
                      person_name: { type: "string", description: "Erkannter Personenname im Dokument" },
                      company_name: { type: "string", description: "Erkannter Firmenname" },
                      date: { type: "string", description: "Erkanntes Datum im Dokument" },
                      department: { type: "string", description: "Erkannte Abteilung" }
                    },
                    description: "Im Dokument erkannte Entitäten"
                  },
                  invoice_data: {
                    type: "object",
                    properties: {
                      invoice_number: { type: "string", description: "Rechnungsnummer (z.B. RE-2024-001)" },
                      invoice_date: { type: "string", description: "Rechnungsdatum im Format YYYY-MM-DD" },
                      total_amount: { 
                        type: "number", 
                        description: "KRITISCH: Gesamtbetrag als Dezimalzahl. Deutsche '1.234,56 €' → 1234.56. Englische '$1,234.56' → 1234.56. PUNKT als Dezimaltrenner, KEINE Tausendertrennzeichen, KEINE Währungssymbole." 
                      },
                      total_amount_raw: { type: "string", description: "Der Originalbetrag wie im Dokument geschrieben (z.B. '1.234,56 €')" },
                      currency: { type: "string", enum: ["EUR", "USD", "CHF", "GBP"], description: "Währung (Standard: EUR)" },
                      vendor_name: { type: "string", description: "Firmenname des Rechnungsstellers" },
                      tax_amount: { type: "number", description: "MwSt-Betrag als Dezimalzahl mit PUNKT als Dezimaltrenner" }
                    },
                    description: "Rechnungsdaten - NUR ausfüllen wenn es sich um eine Rechnung handelt"
                  }
                },
                required: ["document_type", "category", "summary", "confidence", "requires_approval", "requires_signature"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "analyze_document" } },
        max_tokens: 1000
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('OpenAI API Error:', aiResponse.status, errorText);
      throw new Error(`OpenAI API Error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI Vision Response received');

    // Extrahiere die strukturierten Daten aus dem Tool Call
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error('Keine strukturierte Antwort von der KI erhalten');
    }

    const analysis = JSON.parse(toolCall.function.arguments);
    
    // Post-process invoice amounts for robustness
    if (analysis.invoice_data) {
      const invoiceData = analysis.invoice_data;
      
      // If total_amount looks wrong but we have raw text, try to parse it
      if (invoiceData.total_amount_raw && (!invoiceData.total_amount || invoiceData.total_amount < 1)) {
        const rawAmount = invoiceData.total_amount_raw;
        // Try to parse German format (1.234,56) or English format (1,234.56)
        const parsed = parseAmountString(rawAmount);
        if (parsed !== null) {
          console.log(`Corrected amount from "${rawAmount}" to ${parsed}`);
          invoiceData.total_amount = parsed;
        }
      }
      
      // Validate amount is reasonable (not 0 or negative)
      if (invoiceData.total_amount !== undefined && invoiceData.total_amount <= 0) {
        console.warn('Invalid total_amount detected:', invoiceData.total_amount);
        invoiceData.total_amount = null;
      }
      
      // Default currency to EUR if missing
      if (!invoiceData.currency) {
        invoiceData.currency = 'EUR';
      }
    }
    
    // Reduce confidence if no image content was available
    let finalConfidence = analysis.confidence;
    if (!base64Content) {
      finalConfidence = Math.min(finalConfidence, 50);
      analysis.summary = `[Nur Dateinamen-Analyse] ${analysis.summary}`;
    }
    
    console.log('Document Vision analysis complete:', {
      document_type: analysis.document_type,
      category: analysis.category,
      confidence: finalConfidence,
      requires_approval: analysis.requires_approval,
      requires_signature: analysis.requires_signature,
      invoice_total: analysis.invoice_data?.total_amount
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        analysis: {
          document_type: analysis.document_type,
          category: analysis.category,
          summary: analysis.summary,
          confidence: finalConfidence,
          tags: analysis.tags || [],
          requires_approval: analysis.requires_approval,
          requires_signature: analysis.requires_signature,
          detected_entities: analysis.detected_entities || {},
          invoice_data: analysis.invoice_data || null,
          analysis_method: base64Content ? 'vision' : 'filename'
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in analyze-document-vision function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unbekannter Fehler bei der Dokumentenanalyse',
        success: false 
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
