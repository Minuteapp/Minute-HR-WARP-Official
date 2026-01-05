import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Hilfsfunktion: Arbeitstage berechnen
function calculateWorkingDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let workingDays = 0;
  
  const current = new Date(start);
  while (current <= end) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workingDays++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return workingDays;
}

// Quartal aus Datum ermitteln
function getQuarter(date: Date): string {
  const quarter = Math.floor(date.getMonth() / 3) + 1;
  return `Q${quarter} ${date.getFullYear()}`;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { companyId } = await req.json();
    
    if (!companyId) {
      return new Response(
        JSON.stringify({ error: 'companyId ist erforderlich' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Lade Trend-Forecast für Company:', companyId);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Lade historische Abwesenheitsdaten der letzten 2 Jahre
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    
    const { data: absences, error: absenceError } = await supabase
      .from('absence_requests')
      .select('type, start_date, end_date, status')
      .eq('company_id', companyId)
      .gte('start_date', twoYearsAgo.toISOString().split('T')[0])
      .in('status', ['approved', 'pending']);

    if (absenceError) {
      console.error('Fehler beim Laden der Abwesenheiten:', absenceError);
      throw absenceError;
    }

    console.log('Geladene Abwesenheiten:', absences?.length || 0);

    // Gruppiere nach Quartalen
    const quarterlyData: Record<string, number> = {};
    
    absences?.forEach(absence => {
      const startDate = new Date(absence.start_date);
      const quarter = getQuarter(startDate);
      const days = calculateWorkingDays(absence.start_date, absence.end_date);
      
      if (!quarterlyData[quarter]) {
        quarterlyData[quarter] = 0;
      }
      quarterlyData[quarter] += days;
    });

    // Sortiere Quartale chronologisch
    const sortedQuarters = Object.keys(quarterlyData).sort((a, b) => {
      const [qA, yA] = a.split(' ');
      const [qB, yB] = b.split(' ');
      if (yA !== yB) return parseInt(yA) - parseInt(yB);
      return parseInt(qA.replace('Q', '')) - parseInt(qB.replace('Q', ''));
    });

    const historicalData = sortedQuarters.map(quarter => ({
      quarter,
      value: quarterlyData[quarter],
      type: 'historical' as const
    }));

    // KI-Prognose mit Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      console.log('LOVABLE_API_KEY nicht konfiguriert, verwende einfache Prognose');
      
      // Einfache lineare Prognose ohne KI
      const avgValue = historicalData.length > 0 
        ? historicalData.reduce((sum, d) => sum + d.value, 0) / historicalData.length 
        : 100;
      
      const now = new Date();
      const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
      const currentYear = now.getFullYear();
      
      const forecast = [];
      for (let i = 1; i <= 2; i++) {
        let q = currentQuarter + i;
        let y = currentYear;
        if (q > 4) {
          q -= 4;
          y += 1;
        }
        forecast.push({
          quarter: `Q${q} ${y}`,
          value: Math.round(avgValue * (1 + (Math.random() * 0.2 - 0.1))),
          type: 'forecast' as const
        });
      }

      return new Response(
        JSON.stringify({
          historical: historicalData,
          forecast,
          analysis: 'Einfache Prognose basierend auf historischen Durchschnittswerten.',
          trend: 'stable'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // KI-Analyse mit Lovable AI
    const prompt = `Du bist ein HR-Analyst. Analysiere die folgenden historischen Abwesenheitsdaten (Quartalswerte in Tagen) und erstelle eine Prognose für die nächsten 2 Quartale.

Historische Daten:
${historicalData.map(d => `${d.quarter}: ${d.value} Tage`).join('\n')}

Erstelle eine kurze Analyse (max 2 Sätze) und prognostiziere die Werte für die nächsten 2 Quartale.`;

    console.log('Sende Anfrage an Lovable AI...');

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'Du bist ein HR-Analyst, der Abwesenheitstrends analysiert. Antworte auf Deutsch.' },
          { role: 'user', content: prompt }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'create_forecast',
              description: 'Erstellt eine Prognose für Abwesenheitstrends',
              parameters: {
                type: 'object',
                properties: {
                  analysis: {
                    type: 'string',
                    description: 'Kurze Analyse der Trends (max 2 Sätze)'
                  },
                  trend: {
                    type: 'string',
                    enum: ['increasing', 'stable', 'decreasing'],
                    description: 'Allgemeiner Trend'
                  },
                  forecasts: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        quarter: { type: 'string', description: 'Quartal im Format "Q1 2025"' },
                        value: { type: 'number', description: 'Prognostizierte Abwesenheitstage' }
                      },
                      required: ['quarter', 'value']
                    }
                  }
                },
                required: ['analysis', 'trend', 'forecasts']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'create_forecast' } }
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        console.log('Rate limit erreicht, verwende Fallback');
        return new Response(
          JSON.stringify({ error: 'Rate limit erreicht, bitte später erneut versuchen.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        console.log('Keine Credits verfügbar');
        return new Response(
          JSON.stringify({ error: 'Keine Credits verfügbar.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await aiResponse.text();
      console.error('AI Gateway Fehler:', aiResponse.status, errorText);
      throw new Error(`AI Gateway Fehler: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI Response erhalten:', JSON.stringify(aiData));

    // Extrahiere Tool-Aufruf
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      const forecastData = JSON.parse(toolCall.function.arguments);
      
      const forecast = forecastData.forecasts.map((f: any) => ({
        quarter: f.quarter,
        value: f.value,
        type: 'forecast' as const
      }));

      return new Response(
        JSON.stringify({
          historical: historicalData,
          forecast,
          analysis: forecastData.analysis,
          trend: forecastData.trend
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fallback wenn kein Tool-Call
    const now = new Date();
    const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
    const currentYear = now.getFullYear();
    const avgValue = historicalData.length > 0 
      ? historicalData.reduce((sum, d) => sum + d.value, 0) / historicalData.length 
      : 100;

    const fallbackForecast = [];
    for (let i = 1; i <= 2; i++) {
      let q = currentQuarter + i;
      let y = currentYear;
      if (q > 4) {
        q -= 4;
        y += 1;
      }
      fallbackForecast.push({
        quarter: `Q${q} ${y}`,
        value: Math.round(avgValue),
        type: 'forecast' as const
      });
    }

    return new Response(
      JSON.stringify({
        historical: historicalData,
        forecast: fallbackForecast,
        analysis: aiData.choices?.[0]?.message?.content || 'Prognose basierend auf historischen Daten.',
        trend: 'stable'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Fehler in absence-trend-forecast:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unbekannter Fehler' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
