import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { companyId, analysisType } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Lade ESG-Daten aus der Datenbank
    const { data: emissions } = await supabase
      .from('esg_emissions')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(100);

    const { data: measures } = await supabase
      .from('esg_measures')
      .select('*')
      .eq('company_id', companyId)
      .limit(50);

    const { data: targets } = await supabase
      .from('esg_targets')
      .select('*')
      .eq('company_id', companyId);

    // Erstelle Kontext für die KI-Analyse
    const emissionsCount = emissions?.length || 0;
    const measuresCount = measures?.length || 0;
    const totalEmissions = emissions?.reduce((sum: number, e: any) => sum + (Number(e.amount) || 0), 0) || 0;

    let prompt = '';
    let systemPrompt = 'Du bist ein ESG-Experte und Nachhaltigkeitsberater. Antworte immer auf Deutsch. Gib präzise, datenbasierte Empfehlungen.';

    if (analysisType === 'dashboard') {
      prompt = `Analysiere die folgenden ESG-Kennzahlen eines Unternehmens und gib 3-4 konkrete Insights:

Daten:
- Anzahl erfasster Emissionsdatensätze: ${emissionsCount}
- Gesamt-CO₂-Emissionen: ${totalEmissions.toFixed(1)} t CO₂e
- Definierte Maßnahmen: ${measuresCount}
- Ziele definiert: ${targets?.length || 0}

${emissionsCount === 0 ? 'HINWEIS: Es wurden noch keine Emissionsdaten erfasst.' : ''}

Gib die Analyse als JSON-Array zurück mit diesem Format:
[
  {"type": "positive" oder "warning", "text": "Kurze Insight mit **fettgedruckten** Schlüsselbegriffen"}
]`;
    } else if (analysisType === 'forecast') {
      prompt = `Erstelle eine Prognose basierend auf den ESG-Daten:

Aktuelle Daten:
- Erfasste Emissionen: ${emissionsCount} Datensätze
- Gesamt: ${totalEmissions.toFixed(1)} t CO₂e
- Maßnahmen: ${measuresCount}

${emissionsCount === 0 ? 'HINWEIS: Ohne historische Daten ist keine verlässliche Prognose möglich.' : ''}

Gib die Antwort als JSON zurück:
{
  "canForecast": true/false,
  "message": "Kurze Erklärung",
  "recommendation": "Empfehlung für nächste Schritte"
}`;
    } else {
      prompt = `Analysiere die ESG-Daten und gib allgemeine Empfehlungen:
- Emissionen: ${emissionsCount} Datensätze, ${totalEmissions.toFixed(1)} t CO₂e
- Maßnahmen: ${measuresCount}

Gib 2-3 konkrete Handlungsempfehlungen als JSON-Array:
[{"priority": "high/medium/low", "recommendation": "Text"}]`;
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY nicht konfiguriert');
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway Fehler:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Rate Limit erreicht. Bitte versuchen Sie es später erneut.' 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'KI-Credits aufgebraucht. Bitte Credits aufladen.' 
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI Gateway Fehler: ${response.status}`);
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || '';

    // Versuche JSON zu parsen
    let parsedContent;
    try {
      // Extrahiere JSON aus der Antwort
      const jsonMatch = content.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedContent = JSON.parse(jsonMatch[0]);
      } else {
        parsedContent = content;
      }
    } catch {
      parsedContent = content;
    }

    return new Response(JSON.stringify({ 
      success: true,
      analysis: parsedContent,
      rawContent: content,
      dataContext: {
        emissionsCount,
        totalEmissions,
        measuresCount,
        targetsCount: targets?.length || 0
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('ESG AI Analysis Fehler:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unbekannter Fehler' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
