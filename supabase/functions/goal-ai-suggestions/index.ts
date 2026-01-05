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
    const { 
      action, 
      goal_id, 
      goals, 
      category, 
      prompt, 
      user_id, 
      company_id 
    } = await req.json();
    
    console.log('Goal AI Action:', action);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const aiConfig = getAIConfig();
    
    let systemPrompt = '';
    let userPrompt = '';

    switch (action) {
      case 'analyze_goal':
        // Einzelnes Ziel analysieren
        const { data: goal } = await supabase
          .from('goals')
          .select('*')
          .eq('id', goal_id)
          .single();
        
        if (!goal) throw new Error('Ziel nicht gefunden');

        systemPrompt = `Du bist ein Ziel-Management-Experte. Analysiere das Ziel und gib konkrete Verbesserungsvorschläge.
Antworte im JSON-Format:
{
  "suggestions": [
    {
      "id": "<unique-id>",
      "type": "goal_creation|progress_tip|deadline_reminder|optimization|milestone_creation|kpi_suggestion",
      "title": "<Kurzer Titel>",
      "description": "<Beschreibung>",
      "priority": "low|medium|high",
      "actionable": true,
      "suggestedAction": { "type": "update_goal|create_milestone|set_reminder|add_checklist", "data": {} }
    }
  ],
  "insights": {
    "progressTrend": "improving|declining|stable",
    "riskLevel": "low|medium|high",
    "completionProbability": <Zahl 0-100>,
    "recommendations": ["<Empfehlung 1>", "<Empfehlung 2>"]
  },
  "reasoning": "<Erklärung der Analyse>"
}`;

        const daysRemaining = Math.ceil((new Date(goal.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        
        userPrompt = `Analysiere dieses Ziel:
Titel: ${goal.title}
Beschreibung: ${goal.description || 'Keine'}
Fortschritt: ${goal.progress}%
Status: ${goal.status}
Priorität: ${goal.priority}
Deadline: ${goal.due_date} (${daysRemaining} Tage verbleibend)
KPI-Ziel: ${goal.kpi_target || 'Nicht definiert'}
KPI-Aktuell: ${goal.kpi_current || 'Nicht definiert'}
Checkliste: ${goal.checklist?.length || 0} Elemente`;
        break;

      case 'analyze_portfolio':
        // Portfolio-Analyse
        const goalsData = goals || [];
        
        systemPrompt = `Du bist ein Portfolio-Manager für Ziele. Analysiere das gesamte Ziel-Portfolio.
Antworte im JSON-Format wie bei analyze_goal.`;

        userPrompt = `Analysiere dieses Ziel-Portfolio mit ${goalsData.length} Zielen:
${goalsData.map((g: any) => `- ${g.title}: ${g.progress}% (${g.status}, Priorität: ${g.priority})`).join('\n')}

Identifiziere Muster, Risiken und Optimierungspotenziale.`;
        break;

      case 'generate_suggestions':
        // Neue Zielvorschläge generieren
        systemPrompt = `Du bist ein Karriere-Coach. Generiere SMART-Zielvorschläge.
Antworte im JSON-Format:
{
  "suggestions": [
    {
      "id": "<unique-id>",
      "type": "goal_creation",
      "title": "<Ziel-Titel>",
      "description": "<Warum dieses Ziel wichtig ist>",
      "priority": "low|medium|high",
      "actionable": true,
      "suggestedAction": {
        "type": "update_goal",
        "data": {
          "template": {
            "title": "<Vollständiger Titel>",
            "description": "<Detaillierte Beschreibung>",
            "category": "${category || 'personal'}",
            "priority": "medium",
            "measurement_unit": "<Einheit>",
            "kpi_target": "<Zielwert>"
          }
        }
      }
    }
  ],
  "reasoning": "<Erklärung warum diese Ziele vorgeschlagen werden>"
}`;

        userPrompt = prompt 
          ? `Generiere Zielvorschläge basierend auf: "${prompt}" für Kategorie: ${category || 'personal'}`
          : `Generiere 3-5 sinnvolle ${category || 'personal'}-Zielvorschläge für einen HR-Mitarbeiter.`;
        break;

      case 'optimize_structure':
        // Zielstruktur optimieren
        const { data: goalToOptimize } = await supabase
          .from('goals')
          .select('*')
          .eq('id', goal_id)
          .single();
        
        if (!goalToOptimize) throw new Error('Ziel nicht gefunden');

        systemPrompt = `Du bist ein SMART-Ziel-Experte. Optimiere die Struktur des Ziels.
Antworte im JSON-Format wie bei analyze_goal mit Fokus auf Strukturverbesserungen.`;

        userPrompt = `Optimiere dieses Ziel nach SMART-Kriterien:
${JSON.stringify(goalToOptimize, null, 2)}

Prüfe: Spezifisch, Messbar, Erreichbar, Relevant, Terminiert.`;
        break;

      default:
        throw new Error(`Unbekannte Aktion: ${action}`);
    }

    // KI-Anfrage
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
        max_tokens: 2000
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

    // JSON extrahieren
    let result;
    try {
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Kein JSON gefunden');
      }
    } catch (parseError) {
      console.error('JSON-Parse Fehler:', parseError);
      result = {
        suggestions: [],
        insights: {
          progressTrend: 'stable',
          riskLevel: 'medium',
          completionProbability: 50,
          recommendations: ['Analyse konnte nicht vollständig durchgeführt werden.']
        },
        reasoning: 'Parsing-Fehler bei der KI-Antwort.'
      };
    }

    // Audit-Log
    if (company_id) {
      try {
        await supabase.from('ai_gateway_audit_log').insert({
          company_id,
          user_id: user_id || 'system',
          module: 'goal_ai',
          action_type: action,
          model_used: aiConfig.model,
          tokens_input: aiData.usage?.prompt_tokens || 0,
          tokens_output: aiData.usage?.completion_tokens || 0,
          status: 'success',
          prompt_summary: `Goal AI: ${action}`,
          response_summary: result.reasoning?.substring(0, 200)
        });
      } catch (auditError) {
        console.error('Audit-Log Fehler:', auditError);
      }
    }

    console.log('Goal AI erfolgreich:', action);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
    console.error('Fehler in goal-ai-suggestions:', error);
    return new Response(JSON.stringify({ 
      error: errorMessage,
      suggestions: [],
      insights: null
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
