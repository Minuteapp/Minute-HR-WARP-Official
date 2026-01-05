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
    const { companyId, type = 'overview' } = await req.json();

    if (!companyId) {
      return new Response(JSON.stringify({ error: 'companyId ist erforderlich' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Roadmaps laden
    const { data: roadmaps } = await supabase
      .from('roadmaps')
      .select('*')
      .eq('company_id', companyId);

    // Projekte laden
    const { data: projects } = await supabase
      .from('projects')
      .select('*')
      .eq('company_id', companyId);

    // Aufgaben laden
    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('company_id', companyId);

    const roadmapCount = roadmaps?.length || 0;
    const projectCount = projects?.length || 0;
    const taskCount = tasks?.length || 0;

    // Wenn keine Daten vorhanden sind
    if (roadmapCount === 0 && projectCount === 0 && taskCount === 0) {
      return new Response(JSON.stringify({
        analysis: 'Keine Daten für die Analyse vorhanden. Erstellen Sie zunächst Roadmaps, Projekte oder Aufgaben.',
        hasData: false
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Statistiken berechnen
    const now = new Date();
    const openTasks = tasks?.filter(t => t.status !== 'done' && t.status !== 'completed') || [];
    const overdueTasks = tasks?.filter(t => {
      if (!t.due_date) return false;
      return new Date(t.due_date) < now && t.status !== 'done' && t.status !== 'completed';
    }) || [];
    const blockedTasks = tasks?.filter(t => t.status === 'blocked') || [];
    const completedTasks = tasks?.filter(t => t.status === 'done' || t.status === 'completed') || [];

    const activeProjects = projects?.filter(p => p.status === 'active' || p.status === 'in_progress') || [];
    const delayedProjects = projects?.filter(p => {
      if (!p.end_date) return false;
      return new Date(p.end_date) < now && p.status !== 'completed';
    }) || [];

    // Prompt je nach Analysetyp erstellen
    let systemPrompt = '';
    let userPrompt = '';

    switch (type) {
      case 'dependencies':
        systemPrompt = 'Du bist ein Projektmanagement-Experte, der Abhängigkeiten und Risiken analysiert. Antworte auf Deutsch.';
        userPrompt = `Analysiere folgende Projekt- und Aufgabendaten auf Abhängigkeiten und Risiken:

Roadmaps: ${roadmapCount}
Projekte: ${projectCount} (davon ${activeProjects.length} aktiv, ${delayedProjects.length} verzögert)
Aufgaben: ${taskCount} (davon ${openTasks.length} offen, ${blockedTasks.length} blockiert, ${overdueTasks.length} überfällig)

Identifiziere kritische Abhängigkeiten und Risiken. Gib konkrete Handlungsempfehlungen.`;
        break;

      case 'capacity':
        systemPrompt = 'Du bist ein Kapazitätsplanungs-Experte. Antworte auf Deutsch.';
        userPrompt = `Analysiere die Kapazität und den Fortschritt:

Projekte gesamt: ${projectCount}
- Aktiv: ${activeProjects.length}
- Verzögert: ${delayedProjects.length}

Aufgaben gesamt: ${taskCount}
- Offen: ${openTasks.length}
- In Bearbeitung: ${tasks?.filter(t => t.status === 'in_progress').length || 0}
- Blockiert: ${blockedTasks.length}
- Abgeschlossen: ${completedTasks.length}
- Überfällig: ${overdueTasks.length}

Fortschritt: ${taskCount > 0 ? Math.round((completedTasks.length / taskCount) * 100) : 0}%

Gib Empfehlungen zur Kapazitätsoptimierung und Ressourcenverteilung.`;
        break;

      case 'tasks':
        systemPrompt = 'Du bist ein Aufgabenmanagement-Experte. Antworte auf Deutsch.';
        userPrompt = `Analysiere den Aufgabenstatus:

Gesamt: ${taskCount}
Offen: ${openTasks.length}
Überfällig: ${overdueTasks.length}
Blockiert: ${blockedTasks.length}
Abgeschlossen: ${completedTasks.length}

${overdueTasks.length > 0 ? `Überfällige Aufgaben: ${overdueTasks.map(t => t.title).join(', ')}` : ''}
${blockedTasks.length > 0 ? `Blockierte Aufgaben: ${blockedTasks.map(t => t.title).join(', ')}` : ''}

Identifiziere Engpässe und gib Empfehlungen zur Priorisierung.`;
        break;

      default: // overview
        systemPrompt = 'Du bist ein strategischer Projektmanagement-Berater. Antworte auf Deutsch und gib eine kurze, prägnante Analyse.';
        userPrompt = `Erstelle eine Übersichtsanalyse:

Roadmaps: ${roadmapCount}
Projekte: ${projectCount} (${activeProjects.length} aktiv, ${delayedProjects.length} verzögert)
Aufgaben: ${taskCount} (${openTasks.length} offen, ${overdueTasks.length} überfällig, ${blockedTasks.length} blockiert)

Gesamtfortschritt: ${taskCount > 0 ? Math.round((completedTasks.length / taskCount) * 100) : 0}%

Gib 3-5 wichtige Insights und Handlungsempfehlungen.`;
    }

    // OpenAI API aufrufen
    if (!openaiApiKey) {
      // Fallback wenn kein API Key
      return new Response(JSON.stringify({
        analysis: `Analyse-Zusammenfassung:
• ${roadmapCount} Roadmap(s) vorhanden
• ${projectCount} Projekt(e), davon ${activeProjects.length} aktiv und ${delayedProjects.length} verzögert
• ${taskCount} Aufgabe(n): ${openTasks.length} offen, ${overdueTasks.length} überfällig, ${blockedTasks.length} blockiert
• Fortschritt: ${taskCount > 0 ? Math.round((completedTasks.length / taskCount) * 100) : 0}%

${overdueTasks.length > 0 ? '⚠️ Achtung: Es gibt überfällige Aufgaben, die priorisiert werden sollten.' : ''}
${blockedTasks.length > 0 ? '⚠️ Blockierte Aufgaben erfordern sofortige Aufmerksamkeit.' : ''}`,
        hasData: true,
        stats: {
          roadmaps: roadmapCount,
          projects: projectCount,
          tasks: taskCount,
          openTasks: openTasks.length,
          overdueTasks: overdueTasks.length,
          blockedTasks: blockedTasks.length,
          progress: taskCount > 0 ? Math.round((completedTasks.length / taskCount) * 100) : 0
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API Error:', response.status, errorText);
      throw new Error(`OpenAI API Fehler: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices[0]?.message?.content || 'Keine Analyse verfügbar.';

    return new Response(JSON.stringify({
      analysis,
      hasData: true,
      stats: {
        roadmaps: roadmapCount,
        projects: projectCount,
        tasks: taskCount,
        openTasks: openTasks.length,
        overdueTasks: overdueTasks.length,
        blockedTasks: blockedTasks.length,
        progress: taskCount > 0 ? Math.round((completedTasks.length / taskCount) * 100) : 0
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Fehler in roadmap-ai-analysis:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unbekannter Fehler'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
