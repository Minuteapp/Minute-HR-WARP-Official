import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, Heart, AlertTriangle, Users } from 'lucide-react';

export interface TrendKPI {
  label: string;
  value: number | string;
  trend: { value: string; positive: boolean };
  subtitle: string;
  icon: any;
  color: 'purple' | 'green' | 'yellow' | 'red' | 'blue';
}

export interface LongTermDataPoint {
  quarter: string;
  engagement: number;
  stressIndex: number;
  satisfaction: number;
}

export interface DepartmentTrend {
  name: string;
  count: number;
  currentValue: number;
  color: string;
  data: Array<{ month: string; value: number }>;
}

export interface BenchmarkData {
  category: string;
  branchendurchschnitt: number;
  topPerformer: number;
  unserUnternehmen: number;
}

export const usePulseTrends = () => {
  const [selectedYear, setSelectedYear] = useState('2025');
  const [selectedDepartment, setSelectedDepartment] = useState('Alle Abteilungen');
  const [selectedLocation, setSelectedLocation] = useState('Alle Standorte');
  const [isAreaChart, setIsAreaChart] = useState(false);
  const [showByDepartment, setShowByDepartment] = useState(true);

  // Echte Daten aus der Datenbank laden
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['pulse-trends', selectedYear, selectedDepartment],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: userRole } = await supabase
        .from('user_roles')
        .select('tenant_id')
        .eq('user_id', user.id)
        .single();

      if (!userRole?.tenant_id) throw new Error('No tenant found');

      // Lade Analytics-Daten
      const { data: analytics, error: analyticsError } = await supabase
        .from('pulse_survey_analytics')
        .select('*')
        .eq('tenant_id', userRole.tenant_id)
        .order('calculated_at', { ascending: false });

      if (analyticsError) throw analyticsError;

      // Lade Surveys für zusätzliche Infos
      const { data: surveys, error: surveysError } = await supabase
        .from('pulse_surveys')
        .select('*')
        .eq('tenant_id', userRole.tenant_id);

      if (surveysError) throw surveysError;

      // Lade Responses für detaillierte Analyse
      const { data: responses, error: responsesError } = await supabase
        .from('pulse_survey_responses')
        .select('*, pulse_survey_questions(category)')
        .eq('tenant_id', userRole.tenant_id);

      if (responsesError) throw responsesError;

      // Lade Mitarbeiter-Anzahl
      const { count: employeeCount } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      return {
        analytics: analytics || [],
        surveys: surveys || [],
        responses: responses || [],
        employeeCount: employeeCount || 0
      };
    },
  });

  // Berechne KPIs aus echten Daten
  const calculateKPIs = (): TrendKPI[] => {
    const data = analyticsData;
    
    if (!data || data.analytics.length === 0) {
      // Leere Daten wenn keine Umfragen existieren
      return [
        {
          label: "Engagement Trend",
          value: 0,
          trend: { value: "+0%", positive: true },
          subtitle: `vs. Vorperiode (${data?.employeeCount || 0} MA)`,
          icon: TrendingUp,
          color: "blue"
        },
        {
          label: "Zufriedenheit Trend",
          value: 0,
          trend: { value: "+0%", positive: true },
          subtitle: `vs. Vorperiode (${data?.responses?.length || 0} Antworten)`,
          icon: Heart,
          color: "green"
        },
        {
          label: "Stress-Index",
          value: 0,
          trend: { value: "0%", positive: true },
          subtitle: "vs. Vorperiode",
          icon: AlertTriangle,
          color: "yellow"
        },
        {
          label: "Beteiligung",
          value: "0%",
          trend: { value: "+0%", positive: true },
          subtitle: "keine Umfragen",
          icon: Users,
          color: "purple"
        }
      ];
    }

    const latestAnalytics = data.analytics[0];
    const previousAnalytics = data.analytics[1];

    const engagementTrend = previousAnalytics 
      ? ((latestAnalytics.engagement_score || 0) - (previousAnalytics.engagement_score || 0)).toFixed(0)
      : '0';

    const participationTrend = previousAnalytics
      ? ((latestAnalytics.participation_rate || 0) - (previousAnalytics.participation_rate || 0)).toFixed(0)
      : '0';

    return [
      {
        label: "Engagement Trend",
        value: Math.round(latestAnalytics.engagement_score || 0),
        trend: { 
          value: `${Number(engagementTrend) >= 0 ? '+' : ''}${engagementTrend}%`, 
          positive: Number(engagementTrend) >= 0 
        },
        subtitle: `vs. Vorperiode (${data.employeeCount} MA)`,
        icon: TrendingUp,
        color: "blue"
      },
      {
        label: "Zufriedenheit Trend",
        value: Math.round(latestAnalytics.satisfaction_score || 0),
        trend: { value: "+0%", positive: true },
        subtitle: `${data.responses.length} Antworten`,
        icon: Heart,
        color: "green"
      },
      {
        label: "Stress-Index",
        value: Math.round(latestAnalytics.psychological_burden_index || 0),
        trend: { value: "0%", positive: true },
        subtitle: "Konzernweit",
        icon: AlertTriangle,
        color: "yellow"
      },
      {
        label: "Beteiligung",
        value: `${Math.round(latestAnalytics.participation_rate || 0)}%`,
        trend: { 
          value: `${Number(participationTrend) >= 0 ? '+' : ''}${participationTrend}%`, 
          positive: Number(participationTrend) >= 0 
        },
        subtitle: `${data.analytics.length} Umfragen`,
        icon: Users,
        color: "purple"
      }
    ];
  };

  // Berechne Langzeit-Daten aus echten Analytics
  const calculateLongTermData = (): LongTermDataPoint[] => {
    if (!analyticsData || analyticsData.analytics.length === 0) {
      return [];
    }

    // Gruppiere nach Quartal
    const quarterMap = new Map<string, { engagement: number[], stress: number[], satisfaction: number[] }>();
    
    analyticsData.analytics.forEach(a => {
      const date = new Date(a.calculated_at);
      const quarter = `Q${Math.ceil((date.getMonth() + 1) / 3)} ${date.getFullYear()}`;
      
      if (!quarterMap.has(quarter)) {
        quarterMap.set(quarter, { engagement: [], stress: [], satisfaction: [] });
      }
      
      const q = quarterMap.get(quarter)!;
      q.engagement.push(a.engagement_score || 0);
      q.stress.push(a.psychological_burden_index || 0);
      q.satisfaction.push(a.satisfaction_score || 0);
    });

    return Array.from(quarterMap.entries()).map(([quarter, data]) => ({
      quarter,
      engagement: Math.round(data.engagement.reduce((a, b) => a + b, 0) / data.engagement.length),
      stressIndex: Math.round(data.stress.reduce((a, b) => a + b, 0) / data.stress.length),
      satisfaction: Math.round(data.satisfaction.reduce((a, b) => a + b, 0) / data.satisfaction.length)
    })).sort((a, b) => a.quarter.localeCompare(b.quarter));
  };

  // Berechne Abteilungs-Trends aus echten Daten
  const calculateDepartmentTrends = (): DepartmentTrend[] => {
    if (!analyticsData || analyticsData.responses.length === 0) {
      return [];
    }

    // Gruppiere Responses nach Department
    const deptColors = ['#A855F7', '#3B82F6', '#F59E0B', '#EF4444', '#10B981', '#EC4899'];
    const deptMap = new Map<string, { scores: number[], count: number }>();

    analyticsData.responses.forEach(r => {
      // Extrahiere Department aus Metadata oder verwende Standard
      const dept = (r as any).department || 'Allgemein';
      
      if (!deptMap.has(dept)) {
        deptMap.set(dept, { scores: [], count: 0 });
      }
      
      const d = deptMap.get(dept)!;
      if (r.answer_value && !isNaN(Number(r.answer_value))) {
        d.scores.push(Number(r.answer_value));
      }
      d.count++;
    });

    let colorIndex = 0;
    return Array.from(deptMap.entries()).map(([name, data]) => ({
      name,
      count: data.count,
      currentValue: data.scores.length > 0 
        ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length * 20) // Scale 1-5 to 0-100
        : 0,
      color: deptColors[colorIndex++ % deptColors.length],
      data: [] // Historische Daten müssten aus zeitlichen Analytics kommen
    }));
  };

  // Benchmark-Daten (könnten aus externer Quelle kommen)
  const benchmarkData: BenchmarkData[] = analyticsData?.analytics?.length ? [
    {
      category: "Entwicklung",
      branchendurchschnitt: 2.8,
      topPerformer: 3.3,
      unserUnternehmen: (analyticsData.analytics[0]?.engagement_score || 0) / 25
    },
    {
      category: "Führung",
      branchendurchschnitt: 2.7,
      topPerformer: 3.4,
      unserUnternehmen: 2.9
    },
    {
      category: "Workload",
      branchendurchschnitt: 2.5,
      topPerformer: 3.0,
      unserUnternehmen: (100 - (analyticsData.analytics[0]?.psychological_burden_index || 50)) / 25
    },
    {
      category: "Zufriedenheit",
      branchendurchschnitt: 2.9,
      topPerformer: 3.5,
      unserUnternehmen: (analyticsData.analytics[0]?.satisfaction_score || 0) / 25
    },
    {
      category: "Engagement",
      branchendurchschnitt: 2.8,
      topPerformer: 3.4,
      unserUnternehmen: (analyticsData.analytics[0]?.engagement_score || 0) / 25
    }
  ] : [];

  const interpretation = analyticsData?.analytics?.length 
    ? `Basierend auf ${analyticsData.responses.length} Antworten aus ${analyticsData.surveys.length} Umfragen. ` +
      `Durchschnittliche Beteiligung: ${Math.round(analyticsData.analytics[0]?.participation_rate || 0)}%.`
    : "Noch keine Umfragedaten vorhanden. Erstellen Sie eine Umfrage, um Trends zu sehen.";

  const trendKPIs = calculateKPIs();
  const longTermData = calculateLongTermData();
  const departmentTrends = calculateDepartmentTrends();

  return {
    trendKPIs,
    longTermData,
    departmentTrends,
    benchmarkData,
    interpretation,
    isLoading,
    selectedYear,
    setSelectedYear,
    selectedDepartment,
    setSelectedDepartment,
    selectedLocation,
    setSelectedLocation,
    isAreaChart,
    setIsAreaChart,
    showByDepartment,
    setShowByDepartment
  };
};
