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

    // Lade alle Aufgaben mit Zeitdaten
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*, projects(name)')
      .eq('company_id', companyId)
      .neq('status', 'archived')
      .not('due_date', 'is', null);

    if (tasksError) {
      console.error('Error loading tasks:', tasksError);
      throw new Error('Failed to load tasks');
    }

    if (!tasks || tasks.length === 0) {
      return new Response(JSON.stringify({
        analysis: 'Keine Aufgaben mit Zeitdaten gefunden. Fügen Sie Fälligkeitsdaten hinzu, um eine Zeitplananalyse zu erhalten.',
        conflicts: [],
        recommendations: []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const now = new Date();
    
    // Berechne Statistiken
    const overdueTasks = tasks.filter(t => new Date(t.due_date) < now && t.status !== 'done');
    const dueSoonTasks = tasks.filter(t => {
      const dueDate = new Date(t.due_date);
      const daysDiff = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff >= 0 && daysDiff <= 3 && t.status !== 'done';
    });

    // Finde Überschneidungen (Aufgaben mit gleichen Zuweisungen und überlappenden Zeiten)
    const conflicts: any[] = [];
    for (let i = 0; i < tasks.length; i++) {
      for (let j = i + 1; j < tasks.length; j++) {
        const taskA = tasks[i];
        const taskB = tasks[j];
        
        if (taskA.assigned_to && taskA.assigned_to === taskB.assigned_to) {
          const aStart = new Date(taskA.created_at);
          const aEnd = new Date(taskA.due_date);
          const bStart = new Date(taskB.created_at);
          const bEnd = new Date(taskB.due_date);
          
          // Prüfe Überschneidung
          if (aStart <= bEnd && bStart <= aEnd) {
            conflicts.push({
              tasks: [taskA.title, taskB.title],
              assignee: taskA.assigned_to
            });
          }
        }
      }
    }

    // Erstelle Kontext für OpenAI
    const context = `
Analysiere die Zeitplanung der folgenden Aufgaben:

Gesamtaufgaben mit Fälligkeitsdatum: ${tasks.length}
- Überfällig: ${overdueTasks.length}
- In den nächsten 3 Tagen fällig: ${dueSoonTasks.length}
- Zeitliche Überschneidungen: ${conflicts.length}

Überfällige Aufgaben:
${overdueTasks.slice(0, 5).map(t => `- "${t.title}" (Fällig: ${t.due_date}, Projekt: ${t.projects?.name || 'Unbekannt'})`).join('\n')}

Bald fällige Aufgaben:
${dueSoonTasks.slice(0, 5).map(t => `- "${t.title}" (Fällig: ${t.due_date})`).join('\n')}

Erkannte Konflikte (gleiche Person, überlappende Zeiten):
${conflicts.slice(0, 3).map(c => `- "${c.tasks[0]}" und "${c.tasks[1]}"`).join('\n')}
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
            content: `Du bist ein Projektmanagement-KI-Assistent für Zeitplanung und Gantt-Charts. 
            Analysiere Zeitpläne und gib präzise Empfehlungen auf Deutsch. Antworte im JSON-Format mit:
            - analysis: Kurze Zusammenfassung der Zeitplan-Situation (max 2 Sätze)
            - recommendations: Array von max 3 konkreten Empfehlungen für bessere Zeitplanung
            Erwähne spezifische Aufgaben und schlage Pufferzeiten vor.`
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
      analysis: parsedResponse.analysis || 'Zeitplan-Analyse abgeschlossen.',
      conflicts: conflicts.slice(0, 5),
      recommendations: parsedResponse.recommendations || [],
      stats: {
        total: tasks.length,
        overdue: overdueTasks.length,
        dueSoon: dueSoonTasks.length,
        conflictsCount: conflicts.length
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in gantt-ai-analysis:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      analysis: 'Zeitplan-Analyse konnte nicht durchgeführt werden.',
      conflicts: [],
      recommendations: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
