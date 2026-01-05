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
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { companyId } = await req.json();

    // Lade alle Aufgaben der Firma
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('company_id', companyId)
      .neq('status', 'archived');

    if (tasksError) {
      console.error('Error loading tasks:', tasksError);
      throw new Error('Failed to load tasks');
    }

    if (!tasks || tasks.length === 0) {
      return new Response(JSON.stringify({
        analysis: 'Keine Aufgaben gefunden. Erstellen Sie Aufgaben, um eine KI-Analyse zu erhalten.',
        bottlenecks: [],
        recommendations: []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Berechne Engpässe
    const now = new Date();
    const inProgressTasks = tasks.filter(t => t.status === 'in-progress');
    const reviewTasks = tasks.filter(t => t.status === 'review');
    const overdueTasks = tasks.filter(t => t.due_date && new Date(t.due_date) < now && t.status !== 'done');
    
    // Aufgaben die länger als 3 Tage in Bearbeitung sind
    const staleTasks = inProgressTasks.filter(t => {
      const updatedAt = new Date(t.updated_at);
      const daysDiff = (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff > 3;
    });

    // Erstelle Kontext für OpenAI
    const context = `
Analysiere die folgenden Aufgaben-Statistiken eines Kanban-Boards:

Gesamtaufgaben: ${tasks.length}
- Offen (todo): ${tasks.filter(t => t.status === 'todo').length}
- In Bearbeitung: ${inProgressTasks.length}
- Im Review: ${reviewTasks.length}
- Abgeschlossen: ${tasks.filter(t => t.status === 'done').length}

Engpässe erkannt:
- ${staleTasks.length} Aufgaben sind seit über 3 Tagen in Bearbeitung
- ${overdueTasks.length} Aufgaben sind überfällig
- ${reviewTasks.length} Aufgaben warten auf Review

Aufgaben in Bearbeitung:
${inProgressTasks.slice(0, 5).map(t => `- "${t.title}" (Priorität: ${t.priority || 'normal'})`).join('\n')}

Überfällige Aufgaben:
${overdueTasks.slice(0, 5).map(t => `- "${t.title}" (Fällig: ${t.due_date})`).join('\n')}
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: `Du bist ein Projektmanagement-KI-Assistent. Analysiere Kanban-Board-Daten und gib präzise, 
            umsetzbare Empfehlungen auf Deutsch. Antworte im JSON-Format mit den Feldern:
            - analysis: Eine kurze Zusammenfassung der Situation (max 2 Sätze)
            - recommendations: Array von max 3 konkreten Handlungsempfehlungen
            Sei spezifisch und nenne Aufgaben beim Namen wenn möglich.`
          },
          { role: 'user', content: context }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', response.status, errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    let parsedResponse;
    try {
      // Versuche JSON zu parsen
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        parsedResponse = {
          analysis: aiResponse,
          recommendations: []
        };
      }
    } catch {
      parsedResponse = {
        analysis: aiResponse,
        recommendations: []
      };
    }

    return new Response(JSON.stringify({
      analysis: parsedResponse.analysis || 'Analyse abgeschlossen.',
      bottlenecks: staleTasks.map(t => ({ id: t.id, title: t.title, status: t.status })),
      recommendations: parsedResponse.recommendations || [],
      stats: {
        total: tasks.length,
        inProgress: inProgressTasks.length,
        overdue: overdueTasks.length,
        stale: staleTasks.length
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in kanban-ai-analysis:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      analysis: 'KI-Analyse konnte nicht durchgeführt werden.',
      bottlenecks: [],
      recommendations: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
