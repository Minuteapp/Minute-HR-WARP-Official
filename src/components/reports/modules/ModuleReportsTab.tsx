import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, Clock, Calendar, Target, TrendingUp, 
  Briefcase, DollarSign, Globe, ArrowLeft, Info,
  Play, FileText
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import ModuleReportExecutionDialog from './ModuleReportExecutionDialog';

interface Module {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  table?: string;
  reports: ModuleReport[];
}

interface ModuleReport {
  id: string;
  title: string;
  description: string;
}

const ModuleReportsTab = () => {
  const { user } = useAuth();
  const companyId = user?.company_id;
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [selectedReport, setSelectedReport] = useState<{ id: string; title: string } | null>(null);

  // Fetch counts for each module
  const { data: moduleCounts = {} } = useQuery({
    queryKey: ['module-report-counts', companyId],
    queryFn: async () => {
      if (!companyId) return {};
      
      const counts: Record<string, number> = {};
      
      // Employees
      const { count: empCount } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId);
      counts.employees = empCount || 0;
      
      // Time entries
      const { count: timeCount } = await supabase
        .from('time_entries')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId);
      counts.time = timeCount || 0;
      
      // Absence requests
      const { count: absenceCount } = await supabase
        .from('absence_requests')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId);
      counts.absence = absenceCount || 0;
      
      // Job applications
      const { count: jobCount } = await supabase
        .from('job_applications')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId);
      counts.recruiting = jobCount || 0;
      
      // Performance reviews
      const { count: perfCount } = await supabase
        .from('performance_reviews')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId);
      counts.performance = perfCount || 0;
      
      // Projects
      const { count: projCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId);
      counts.projects = projCount || 0;

      return counts;
    },
    enabled: !!companyId,
  });

  const modules: Module[] = [
    {
      id: 'employees',
      title: 'Mitarbeiter',
      description: 'Stammdaten, Verträge und Personalakten',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      table: 'employees',
      reports: [
        { id: 'emp-overview', title: 'Mitarbeiterübersicht', description: 'Alle aktiven Mitarbeiter mit Stammdaten' },
        { id: 'emp-contracts', title: 'Vertragsübersicht', description: 'Laufende Verträge und Befristungen' },
        { id: 'emp-birthdays', title: 'Geburtstagsliste', description: 'Kommende Geburtstage der Mitarbeiter' },
        { id: 'emp-anniversaries', title: 'Jubiläen', description: 'Betriebszugehörigkeit und Jubiläen' },
      ]
    },
    {
      id: 'time-absence',
      title: 'Zeit & Abwesenheit',
      description: 'Zeiterfassung und Abwesenheitsverwaltung',
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      reports: [
        { id: 'time-monthly', title: 'Monatliche Zeitübersicht', description: 'Arbeitsstunden pro Mitarbeiter' },
        { id: 'absence-summary', title: 'Abwesenheitsübersicht', description: 'Urlaub, Krankheit und Sonstiges' },
        { id: 'overtime-report', title: 'Überstundenreport', description: 'Angesammelte Überstunden' },
        { id: 'vacation-balance', title: 'Urlaubssaldo', description: 'Verbleibende Urlaubstage' },
      ]
    },
    {
      id: 'shift-planning',
      title: 'Schichtplanung',
      description: 'Dienstpläne und Schichtbesetzung',
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      reports: [
        { id: 'shift-coverage', title: 'Schichtbesetzung', description: 'Aktuelle und geplante Besetzung' },
        { id: 'shift-changes', title: 'Schichttausch', description: 'Anträge auf Schichtwechsel' },
      ]
    },
    {
      id: 'recruiting',
      title: 'Recruiting',
      description: 'Bewerbungen und Einstellungen',
      icon: Target,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      table: 'job_applications',
      reports: [
        { id: 'rec-funnel', title: 'Recruiting Funnel', description: 'Bewerbungstrichter-Analyse' },
        { id: 'rec-sources', title: 'Recruiting-Quellen', description: 'Herkunft der Bewerbungen' },
        { id: 'rec-time-to-hire', title: 'Time-to-Hire', description: 'Durchschnittliche Besetzungsdauer' },
        { id: 'rec-cost', title: 'Cost-per-Hire', description: 'Kosten pro Einstellung' },
      ]
    },
    {
      id: 'performance',
      title: 'Performance',
      description: 'Leistungsbewertung und Zielvereinbarungen',
      icon: TrendingUp,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      table: 'performance_reviews',
      reports: [
        { id: 'perf-overview', title: 'Performance-Übersicht', description: 'Aktuelle Bewertungszyklen' },
        { id: 'perf-goals', title: 'Zielerreichung', description: 'Status der Zielvereinbarungen' },
        { id: 'perf-ratings', title: 'Rating-Verteilung', description: 'Verteilung der Bewertungen' },
      ]
    },
    {
      id: 'projects',
      title: 'Projekte',
      description: 'Projektmanagement und Ressourcen',
      icon: Briefcase,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      table: 'projects',
      reports: [
        { id: 'proj-status', title: 'Projektstatus', description: 'Übersicht aller Projekte' },
        { id: 'proj-resources', title: 'Ressourcenauslastung', description: 'Mitarbeiter-Zuordnungen' },
        { id: 'proj-hours', title: 'Projektstunden', description: 'Erfasste Stunden pro Projekt' },
      ]
    },
    {
      id: 'budget',
      title: 'Budget & Forecast',
      description: 'Personalbudget und Prognosen',
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      reports: [
        { id: 'budget-overview', title: 'Budget-Übersicht', description: 'Aktueller Budgetstatus' },
        { id: 'budget-forecast', title: 'Personalkosten-Forecast', description: 'Prognose der Personalkosten' },
      ]
    },
    {
      id: 'global-mobility',
      title: 'Global Mobility',
      description: 'Internationale Einsätze und Entsendungen',
      icon: Globe,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-100',
      reports: [
        { id: 'mobility-overview', title: 'Entsendungsübersicht', description: 'Aktive Auslandsentsendungen' },
        { id: 'mobility-expiring', title: 'Ablaufende Visa', description: 'Visa und Arbeitserlaubnisse' },
      ]
    },
  ];

  const getReportCount = (module: Module) => {
    return module.reports.length;
  };

  const getDataCount = (moduleId: string) => {
    switch (moduleId) {
      case 'employees': return moduleCounts.employees || 0;
      case 'time-absence': return (moduleCounts.time || 0) + (moduleCounts.absence || 0);
      case 'recruiting': return moduleCounts.recruiting || 0;
      case 'performance': return moduleCounts.performance || 0;
      case 'projects': return moduleCounts.projects || 0;
      default: return 0;
    }
  };

  if (selectedModule) {
    return (
      <div className="space-y-6">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => setSelectedModule(null)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück zur Übersicht
        </Button>

        {/* Module Header */}
        <div className="flex items-center gap-4">
          <div className={`p-3 ${selectedModule.bgColor} rounded-lg`}>
            <selectedModule.icon className={`h-6 w-6 ${selectedModule.color}`} />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{selectedModule.title}</h2>
            <p className="text-muted-foreground">{selectedModule.description}</p>
          </div>
        </div>

        {/* Module Reports */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {selectedModule.reports.map((report) => (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 ${selectedModule.bgColor} rounded-lg`}>
                    <FileText className={`h-4 w-4 ${selectedModule.color}`} />
                  </div>
                  <CardTitle className="text-base">{report.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{report.description}</p>
                <Button 
                  className="w-full"
                  onClick={() => setSelectedReport({ id: report.id, title: report.title })}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Bericht ausführen
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Report Execution Dialog */}
        {selectedReport && (
          <ModuleReportExecutionDialog
            open={!!selectedReport}
            onOpenChange={(open) => !open && setSelectedReport(null)}
            reportId={selectedReport.id}
            reportTitle={selectedReport.title}
            moduleId={selectedModule.id}
            moduleColor={selectedModule.color}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">Modulberichte</p>
              <p className="text-sm text-blue-700 mt-1">
                Jedes Kernmodul stellt spezifische Berichte bereit. Klicken Sie auf ein Modul, um die verfügbaren Berichte anzuzeigen.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Module Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {modules.map((module) => {
          const Icon = module.icon;
          const reportCount = getReportCount(module);
          const dataCount = getDataCount(module.id);
          
          return (
            <Card 
              key={module.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedModule(module)}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className={`p-3 ${module.bgColor} rounded-lg`}>
                    <Icon className={`h-6 w-6 ${module.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{module.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {module.description}
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <Badge variant="secondary">{reportCount} Berichte</Badge>
                      {dataCount > 0 && (
                        <Badge variant="outline">{dataCount} Datensätze</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ModuleReportsTab;
