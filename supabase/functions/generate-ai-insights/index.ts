import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { modules = [], timeframe = '30d' } = await req.json();
    
    console.log('🧠 Generating AI insights for modules:', modules);

    // Initialize Supabase client for data access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Collect data from different modules
    const systemData = await collectSystemData(supabase, modules, timeframe);
    
    // Generate insights using OpenAI
    const insights = await generateInsightsWithAI(systemData);

    return new Response(JSON.stringify({ 
      insights,
      timestamp: new Date().toISOString(),
      modules_analyzed: modules.length,
      data_points: Object.keys(systemData).length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error generating insights:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      error: 'Failed to generate insights',
      details: errorMessage
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function collectSystemData(supabase: any, modules: string[], timeframe: string) {
  const data: any = {};
  const timeframeDate = getTimeframeDate(timeframe);

  console.log('📊 Collecting system data since:', timeframeDate);

  try {
    // Employee data
    if (modules.includes('employees')) {
      const { data: employees } = await supabase
        .from('employees')
        .select('department, position, status, created_at')
        .gte('created_at', timeframeDate);
      data.employees = employees || [];
    }

    // Project data
    if (modules.includes('projects')) {
      const { data: projects } = await supabase
        .from('projects')
        .select('name, status, progress, deadline, team_members, created_at')
        .gte('created_at', timeframeDate);
      data.projects = projects || [];
    }

    // Time entries
    if (modules.includes('time_entries')) {
      const { data: timeEntries } = await supabase
        .from('time_entries')
        .select('user_id, start_time, end_time, break_minutes, activity_type')
        .gte('start_time', timeframeDate);
      data.timeEntries = timeEntries || [];
    }

    // Absence requests
    if (modules.includes('absence_requests')) {
      const { data: absences } = await supabase
        .from('absence_requests')
        .select('type, status, start_date, end_date, user_id, created_at')
        .gte('created_at', timeframeDate);
      data.absences = absences || [];
    }

    // Tasks
    const { data: tasks } = await supabase
      .from('tasks')
      .select('title, status, priority, assignee, due_date, created_at')
      .gte('created_at', timeframeDate);
    data.tasks = tasks || [];

    // AI usage logs for efficiency metrics
    const { data: aiUsage } = await supabase
      .from('ai_usage_logs')
      .select('module_used, time_saved_minutes, efficiency_score, usage_date')
      .gte('usage_date', timeframeDate);
    data.aiUsage = aiUsage || [];

  } catch (error) {
    console.error('❌ Error collecting data:', error);
  }

  return data;
}

async function generateInsightsWithAI(systemData: any) {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not found');
  }

  const dataSnapshot = {
    employees_count: systemData.employees?.length || 0,
    projects_count: systemData.projects?.length || 0,
    time_entries_count: systemData.timeEntries?.length || 0,
    absences_count: systemData.absences?.length || 0,
    tasks_count: systemData.tasks?.length || 0,
    departments: [...new Set(systemData.employees?.map((e: any) => e.department) || [])],
    project_statuses: systemData.projects?.reduce((acc: any, p: any) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {}),
    absence_types: systemData.absences?.reduce((acc: any, a: any) => {
      acc[a.type] = (acc[a.type] || 0) + 1;
      return acc;
    }, {}),
    average_work_hours: calculateAverageWorkHours(systemData.timeEntries || []),
    productivity_metrics: calculateProductivityMetrics(systemData)
  };

  console.log('🤖 Sending data to OpenAI for analysis:', dataSnapshot);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-5-2025-08-07',
      messages: [
        {
          role: 'system',
          content: `Du bist ein KI-Analyst für Unternehmensinsights. Analysiere die gegebenen HR- und Projektdaten und erstelle 3-5 actionable Insights auf Deutsch.

Jeder Insight sollte folgende Struktur haben:
{
  "type": "trend|anomaly|prediction|recommendation",
  "category": "hr|projects|finance|productivity|risk", 
  "title": "Kurzer prägnanter Titel mit Emoji",
  "description": "Detaillierte Erklärung mit konkreten Zahlen",
  "impact": "high|medium|low",
  "confidence": 70-95,
  "data": {...relevante Daten...},
  "actionRequired": true/false
}

Fokussiere auf:
- Trends bei Überstunden, Abwesenheiten, Projektfortschritt
- Anomalien in der Produktivität
- Risiken für Burnout oder Projektdeadlines  
- Empfehlungen zur Optimierung
- Konkrete, messbare Metriken`
        },
        {
          role: 'user',
          content: `Analysiere diese Unternehmensdaten und generiere Insights:\n\n${JSON.stringify(dataSnapshot, null, 2)}`
        }
      ],
      max_completion_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('OpenAI API error:', response.status, errorData);
    
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    
    throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
  }

  const result = await response.json();
  const insightsText = result.choices[0].message.content;

  try {
    // Try to parse as JSON array
    const insights = JSON.parse(insightsText);
    return Array.isArray(insights) ? insights : [insights];
  } catch {
    // If not valid JSON, create a single insight from the text
    return [{
      type: 'recommendation',
      category: 'productivity',
      title: '🤖 KI-Analyse durchgeführt',
      description: insightsText,
      impact: 'medium',
      confidence: 75,
      data: dataSnapshot,
      actionRequired: false
    }];
  }
}

function getTimeframeDate(timeframe: string): string {
  const now = new Date();
  const days = parseInt(timeframe.replace('d', '')) || 30;
  const pastDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
  return pastDate.toISOString();
}

function calculateAverageWorkHours(timeEntries: any[]): number {
  if (timeEntries.length === 0) return 0;
  
  const totalMinutes = timeEntries.reduce((sum, entry) => {
    if (!entry.start_time || !entry.end_time) return sum;
    const start = new Date(entry.start_time);
    const end = new Date(entry.end_time);
    const minutes = (end.getTime() - start.getTime()) / (1000 * 60);
    return sum + Math.max(0, minutes - (entry.break_minutes || 0));
  }, 0);
  
  return Math.round((totalMinutes / 60) / timeEntries.length * 100) / 100;
}

function calculateProductivityMetrics(systemData: any) {
  const completedTasks = systemData.tasks?.filter((t: any) => t.status === 'completed').length || 0;
  const totalTasks = systemData.tasks?.length || 0;
  const completedProjects = systemData.projects?.filter((p: any) => p.status === 'completed').length || 0;
  const totalProjects = systemData.projects?.length || 0;
  
  return {
    task_completion_rate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    project_completion_rate: totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0,
    ai_time_saved: systemData.aiUsage?.reduce((sum: number, log: any) => sum + (log.time_saved_minutes || 0), 0) || 0
  };
}