import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { companyId } = await req.json();

    if (!companyId) {
      return new Response(
        JSON.stringify({ error: 'company_id ist erforderlich' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Lade aktuelle Abwesenheitsdaten
    const today = new Date().toISOString().split('T')[0];
    const threeMonthsAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const threeMonthsLater = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Aktive Abwesenheiten heute
    const { data: activeToday } = await supabase
      .from('absence_requests')
      .select('*, department')
      .eq('company_id', companyId)
      .eq('status', 'approved')
      .lte('start_date', today)
      .gte('end_date', today);

    // Ausstehende Anträge
    const { data: pendingRequests } = await supabase
      .from('absence_requests')
      .select('*')
      .eq('company_id', companyId)
      .eq('status', 'pending');

    // Abwesenheiten der letzten 3 Monate (für Muster-Analyse)
    const { data: recentAbsences } = await supabase
      .from('absence_requests')
      .select('*')
      .eq('company_id', companyId)
      .eq('status', 'approved')
      .gte('start_date', threeMonthsAgo);

    // Geplante Abwesenheiten für die nächsten 3 Monate
    const { data: upcomingAbsences } = await supabase
      .from('absence_requests')
      .select('*, department')
      .eq('company_id', companyId)
      .eq('status', 'approved')
      .gte('start_date', today)
      .lte('start_date', threeMonthsLater);

    // Blackout-Perioden
    const { data: blackoutPeriods } = await supabase
      .from('absence_blackout_periods')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .gte('end_date', today);

    // Feiertage
    const { data: holidays } = await supabase
      .from('absence_holidays')
      .select('*')
      .eq('company_id', companyId)
      .gte('holiday_date', today)
      .lte('holiday_date', threeMonthsLater);

    // Mitarbeiter-Anzahl pro Abteilung
    const { data: employees } = await supabase
      .from('employees')
      .select('id, department')
      .eq('company_id', companyId)
      .eq('status', 'active');

    // 2. Analysiere Daten und erstelle Insights
    const insights = [];

    // Insight: Aktuelle Abwesende
    const absentToday = activeToday?.length || 0;
    const totalEmployees = employees?.length || 1;
    const absentPercentage = Math.round((absentToday / totalEmployees) * 100);

    if (absentPercentage > 20) {
      insights.push({
        id: 'high_absence_today',
        type: 'warning',
        title: 'Hohe Abwesenheitsquote',
        description: `${absentToday} von ${totalEmployees} Mitarbeitern (${absentPercentage}%) sind heute abwesend.`,
        priority: 'high'
      });
    }

    // Insight: Ausstehende Genehmigungen
    const pendingCount = pendingRequests?.length || 0;
    if (pendingCount > 0) {
      const oldPending = pendingRequests?.filter(r => {
        const daysSinceCreation = (Date.now() - new Date(r.created_at).getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceCreation > 3;
      }) || [];

      if (oldPending.length > 0) {
        insights.push({
          id: 'overdue_approvals',
          type: 'warning',
          title: 'Überfällige Genehmigungen',
          description: `${oldPending.length} Anträge warten seit mehr als 3 Tagen auf Genehmigung.`,
          priority: 'high'
        });
      } else {
        insights.push({
          id: 'pending_approvals',
          type: 'info',
          title: 'Ausstehende Anträge',
          description: `${pendingCount} Antrag/Anträge warten auf Genehmigung.`,
          priority: 'medium'
        });
      }
    }

    // Insight: Team-Engpässe erkennen
    const departmentAbsences: Record<string, { upcoming: number; total: number }> = {};
    
    employees?.forEach(emp => {
      if (emp.department) {
        if (!departmentAbsences[emp.department]) {
          departmentAbsences[emp.department] = { upcoming: 0, total: 0 };
        }
        departmentAbsences[emp.department].total++;
      }
    });

    upcomingAbsences?.forEach(absence => {
      if (absence.department && departmentAbsences[absence.department]) {
        departmentAbsences[absence.department].upcoming++;
      }
    });

    // Finde Abteilungen mit hoher Abwesenheitsrate
    Object.entries(departmentAbsences).forEach(([dept, data]) => {
      const rate = (data.upcoming / data.total) * 100;
      if (rate > 30 && data.total >= 3) {
        insights.push({
          id: `dept_bottleneck_${dept}`,
          type: 'warning',
          title: 'Team-Engpass erkannt',
          description: `${dept}: ${data.upcoming} von ${data.total} Mitarbeitern haben geplante Abwesenheiten.`,
          priority: 'high'
        });
      }
    });

    // Insight: Blackout-Perioden
    if (blackoutPeriods && blackoutPeriods.length > 0) {
      const nextBlackout = blackoutPeriods[0];
      insights.push({
        id: 'upcoming_blackout',
        type: 'info',
        title: 'Bevorstehende Urlaubssperre',
        description: `${nextBlackout.reason}: ${new Date(nextBlackout.start_date).toLocaleDateString('de-DE')} - ${new Date(nextBlackout.end_date).toLocaleDateString('de-DE')}`,
        priority: 'low'
      });
    }

    // Insight: Feiertage in Brückentags-Nähe
    if (holidays && holidays.length > 0) {
      const bridgeDayOpportunities = holidays.filter(h => {
        const date = new Date(h.holiday_date);
        const dayOfWeek = date.getDay();
        return dayOfWeek === 1 || dayOfWeek === 5; // Montag oder Freitag
      });

      if (bridgeDayOpportunities.length > 0) {
        insights.push({
          id: 'bridge_day_hint',
          type: 'success',
          title: 'Brückentag-Möglichkeit',
          description: `${bridgeDayOpportunities.length} Feiertag(e) bieten Brückentags-Möglichkeiten in den nächsten 3 Monaten.`,
          priority: 'low'
        });
      }
    }

    // Insight: Krankheitsmuster (wenn verfügbar)
    const sickLeaves = recentAbsences?.filter(a => a.type === 'sick' || a.type === 'sick_leave') || [];
    if (sickLeaves.length > 5) {
      // Prüfe auf Montags-Muster
      const mondaySick = sickLeaves.filter(s => new Date(s.start_date).getDay() === 1).length;
      const mondayRate = (mondaySick / sickLeaves.length) * 100;
      
      if (mondayRate > 40) {
        insights.push({
          id: 'monday_sick_pattern',
          type: 'warning',
          title: 'Auffälliges Muster',
          description: `${Math.round(mondayRate)}% der Krankmeldungen beginnen an Montagen.`,
          priority: 'medium'
        });
      }
    }

    // Insight: Trend-Prognose
    const currentMonth = new Date().getMonth();
    const q4Months = [9, 10, 11]; // Oktober, November, Dezember
    if (q4Months.includes(currentMonth)) {
      const lastYearQ4 = recentAbsences?.filter(a => {
        const month = new Date(a.start_date).getMonth();
        return q4Months.includes(month);
      })?.length || 0;

      insights.push({
        id: 'q4_trend',
        type: 'info',
        title: 'Q4 Trend-Prognose',
        description: 'Erfahrungsgemäß höhere Urlaubsanfragen vor Jahresende. Planen Sie Vertretungen frühzeitig.',
        priority: 'medium'
      });
    }

    // Insight: Vertretungsverfügbarkeit
    if (upcomingAbsences && upcomingAbsences.length > 0) {
      const absencesWithoutSubstitute = upcomingAbsences.filter(a => !a.substitute_id && !a.substitute_user_id);
      if (absencesWithoutSubstitute.length > 0) {
        insights.push({
          id: 'missing_substitutes',
          type: 'warning',
          title: 'Vertretungen fehlen',
          description: `${absencesWithoutSubstitute.length} genehmigte Abwesenheit(en) haben keine Vertretung zugewiesen.`,
          priority: 'high'
        });
      } else if (upcomingAbsences.length > 0) {
        insights.push({
          id: 'substitutes_ok',
          type: 'success',
          title: 'Vertretungen vollständig',
          description: 'Alle genehmigten Abwesenheiten haben Vertretungen zugewiesen.',
          priority: 'low'
        });
      }
    }

    // Sortiere nach Priorität
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    insights.sort((a, b) => priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder]);

    // 3. Summary-Statistiken
    const summary = {
      absentToday,
      totalEmployees,
      absentPercentage,
      pendingRequests: pendingCount,
      upcomingAbsences: upcomingAbsences?.length || 0,
      activeBo: blackoutPeriods?.length || 0
    };

    console.log(`AI-Analyse für Company ${companyId}: ${insights.length} Insights generiert`);

    return new Response(
      JSON.stringify({ 
        insights,
        summary,
        generatedAt: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in absence-ai-analysis:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
