import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// KI-Provider konfigurieren
function getAIConfig(): { url: string; headers: Record<string, string>; model: string } {
  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  const openrouterKey = Deno.env.get('OPENROUTER_API_KEY');
  
  if (openaiKey) {
    return {
      url: 'https://api.openai.com/v1/chat/completions',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      model: 'gpt-4o-mini'
    };
  } else if (openrouterKey) {
    return {
      url: 'https://openrouter.ai/api/v1/chat/completions',
      headers: {
        'Authorization': `Bearer ${openrouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': Deno.env.get('SUPABASE_URL') || 'https://localhost',
      },
      model: 'openai/gpt-4o-mini'
    };
  }
  
  throw new Error('Kein KI-Provider konfiguriert. Bitte OPENAI_API_KEY oder OPENROUTER_API_KEY setzen.');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { employee_id } = await req.json();
    
    if (!employee_id) {
      throw new Error('employee_id ist erforderlich');
    }

    console.log('Generiere KI-Insights für Mitarbeiter:', employee_id);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Mitarbeiterdaten laden
    const { data: employee, error: empError } = await supabase
      .from('employees')
      .select('*')
      .eq('id', employee_id)
      .single();

    if (empError || !employee) {
      throw new Error('Mitarbeiter nicht gefunden');
    }

    // Zusätzliche Daten laden (parallel)
    const [goalsResult, feedbackResult, timeEntriesResult] = await Promise.all([
      supabase.from('goals').select('*').eq('user_id', employee_id).limit(10),
      supabase.from('feedback_entries').select('*').or(`sender_id.eq.${employee_id},recipient_id.eq.${employee_id}`).limit(20),
      supabase.from('time_entries').select('*').eq('employee_id', employee_id).gte('date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]).limit(100)
    ]);

    const goals = goalsResult.data || [];
    const feedback = feedbackResult.data || [];
    const timeEntries = timeEntriesResult.data || [];

    // KI-Analyse durchführen
    const aiConfig = getAIConfig();
    
    const systemPrompt = `Du bist ein HR-Analytics-Experte. Analysiere die Mitarbeiterdaten und erstelle detaillierte Insights.
Antworte IMMER im folgenden JSON-Format:
{
  "leadership_potential": <Zahl 0-100>,
  "technical_skills": <Zahl 0-100>,
  "collaboration": <Zahl 0-100>,
  "summary": "<Kurze Zusammenfassung der Stärken und Entwicklungspotenziale>",
  "recommendations": [
    {"title": "<Titel>", "description": "<Beschreibung>", "priority": "low|medium|high"},
    ...
  ],
  "reasoning": {
    "leadership_factors": "<Erklärung der Leadership-Bewertung>",
    "skills_factors": "<Erklärung der Skills-Bewertung>",
    "collaboration_factors": "<Erklärung der Zusammenarbeit-Bewertung>"
  }
}`;

    const userPrompt = `Analysiere diesen Mitarbeiter:

Name: ${employee.name}
Position: ${employee.position || 'Nicht angegeben'}
Abteilung: ${employee.department || 'Nicht angegeben'}
Eintrittsdatum: ${employee.start_date || 'Nicht angegeben'}

Ziele (${goals.length}):
${goals.map((g: any) => `- ${g.title}: ${g.progress}% (${g.status})`).join('\n') || 'Keine Ziele'}

Feedback-Einträge (${feedback.length}):
${feedback.slice(0, 5).map((f: any) => `- ${f.type}: ${f.content?.substring(0, 100) || 'Kein Inhalt'}`).join('\n') || 'Kein Feedback'}

Zeiterfassung (letzte 90 Tage): ${timeEntries.length} Einträge

Erstelle eine detaillierte Analyse mit konkreten Empfehlungen.`;

    const response = await fetch(aiConfig.url, {
      method: 'POST',
      headers: aiConfig.headers,
      body: JSON.stringify({
        model: aiConfig.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1500
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('KI-API Fehler:', response.status, errorText);
      throw new Error(`KI-API Fehler: ${response.status}`);
    }

    const aiData = await response.json();
    const aiContent = aiData.choices?.[0]?.message?.content;
    
    if (!aiContent) {
      throw new Error('Keine Antwort vom KI-Modell');
    }

    // JSON aus Antwort extrahieren
    let insights;
    try {
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        insights = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Kein JSON in Antwort gefunden');
      }
    } catch (parseError) {
      console.error('JSON-Parse Fehler:', parseError, 'Content:', aiContent);
      // KEIN Fallback mehr! Stattdessen Fehler zurückgeben
      return new Response(JSON.stringify({ 
        has_insights: false,
        error: 'KI-Analyse konnte nicht verarbeitet werden. Bitte später erneut versuchen.',
        generated_at: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // In Datenbank speichern (Upsert)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 Tage gültig

    const insightRecord = {
      employee_id,
      has_insights: true,
      leadership_potential: insights.leadership_potential,
      technical_skills: insights.technical_skills,
      collaboration: insights.collaboration,
      summary: insights.summary,
      recommendations: insights.recommendations,
      reasoning: insights.reasoning,
      generated_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
      ai_provider: aiConfig.url.includes('openai.com') ? 'openai' : 'openrouter',
      model_used: aiConfig.model
    };

    const { data: savedInsight, error: saveError } = await supabase
      .from('employee_ai_insights')
      .upsert(insightRecord, { onConflict: 'employee_id' })
      .select()
      .single();

    if (saveError) {
      console.error('Fehler beim Speichern der Insights:', saveError);
      // Trotzdem Insights zurückgeben
    }

    // Audit-Log erstellen
    try {
      await supabase.from('ai_gateway_audit_log').insert({
        company_id: employee.company_id,
        user_id: employee_id,
        module: 'employee_insights',
        action_type: 'generate_insights',
        model_used: aiConfig.model,
        tokens_input: aiData.usage?.prompt_tokens || 0,
        tokens_output: aiData.usage?.completion_tokens || 0,
        status: 'success',
        prompt_summary: 'Mitarbeiter-Insights generiert',
        response_summary: insights.summary?.substring(0, 200)
      });
    } catch (auditError) {
      console.error('Audit-Log Fehler:', auditError);
    }

    console.log('KI-Insights erfolgreich generiert für:', employee.name);

    return new Response(JSON.stringify({
      id: savedInsight?.id || crypto.randomUUID(),
      ...insightRecord
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
    console.error('Fehler in employee-ai-insights:', error);
    return new Response(JSON.stringify({ 
      error: errorMessage,
      has_insights: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
