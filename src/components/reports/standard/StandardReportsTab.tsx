import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, Star, FileText, Calendar, Users, Heart, 
  TrendingUp, Clock, Briefcase, Download, Eye, Copy,
  Play, Info
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ReportExecutionDialog from './ReportExecutionDialog';

interface StandardReport {
  id: string;
  title: string;
  description: string;
  category: string;
  frequency: string;
  icon: React.ElementType;
  lastExecuted?: string;
  isFavorite?: boolean;
}

const StandardReportsTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState<StandardReport | null>(null);
  const [showExecutionDialog, setShowExecutionDialog] = useState(false);

  const reports: StandardReport[] = [
    {
      id: 'employee-headcount',
      title: 'Mitarbeiterbestand & Fluktuation',
      description: 'Aktuelle Mitarbeiterzahlen, Zu- und Abgänge, Fluktuationsrate nach Abteilung',
      category: 'HR-Berichte',
      frequency: 'Monatlich',
      icon: Users,
      isFavorite: true,
    },
    {
      id: 'sick-leave-analysis',
      title: 'Krankenstandsquote',
      description: 'Analyse der Krankmeldungen mit Trends und Vergleich zum Vorjahr',
      category: 'HR-Berichte',
      frequency: 'Wöchentlich',
      icon: Heart,
    },
    {
      id: 'time-to-hire',
      title: 'Time-to-Hire Analyse',
      description: 'Durchschnittliche Besetzungsdauer nach Position und Abteilung',
      category: 'Recruiting',
      frequency: 'Monatlich',
      icon: Clock,
    },
    {
      id: 'overtime-utilization',
      title: 'Überstunden & Auslastung',
      description: 'Überstundenstatistik und Kapazitätsauslastung pro Team',
      category: 'Workforce',
      frequency: 'Wöchentlich',
      icon: TrendingUp,
    },
    {
      id: 'absence-overview',
      title: 'Abwesenheitsübersicht',
      description: 'Vollständige Übersicht aller Abwesenheitsarten nach Zeitraum',
      category: 'HR-Berichte',
      frequency: 'Monatlich',
      icon: Calendar,
    },
    {
      id: 'performance-cycles',
      title: 'Performance-Zyklen',
      description: 'Übersicht der Performance Reviews mit Zielerreichung',
      category: 'Performance',
      frequency: 'Quartalsweise',
      icon: TrendingUp,
      isFavorite: true,
    },
    {
      id: 'project-hours',
      title: 'Projektstunden-Report',
      description: 'Zeiterfassung nach Projekten mit Budgetvergleich',
      category: 'Projekte',
      frequency: 'Wöchentlich',
      icon: Briefcase,
    },
    {
      id: 'recruiting-funnel',
      title: 'Recruiting Funnel',
      description: 'Bewerbungstrichter von Eingang bis Einstellung',
      category: 'Recruiting',
      frequency: 'Wöchentlich',
      icon: Users,
    },
  ];

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || report.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(reports.map(r => r.category))];

  const handleExecuteReport = (report: StandardReport) => {
    setSelectedReport(report);
    setShowExecutionDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">Vollzugriff: Sie haben Zugriff auf alle verfügbaren Berichte.</p>
              <p className="text-sm text-blue-700 mt-1">
                Standardberichte basieren auf System-Defaults und können mit echten Daten aus Ihrer Datenbank ausgeführt werden.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Berichte durchsuchen..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Alle Kategorien" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Kategorien</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredReports.map((report) => {
          const Icon = report.icon;
          return (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{report.title}</CardTitle>
                        {report.isFavorite && (
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        )}
                      </div>
                      <Badge variant="secondary" className="mt-1">{report.category}</Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{report.description}</p>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {report.frequency}
                  </span>
                  {report.lastExecuted && (
                    <span>Zuletzt: {report.lastExecuted}</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button 
                    className="flex-1"
                    onClick={() => handleExecuteReport(report)}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Bericht ausführen
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredReports.length === 0 && (
        <Card className="bg-muted/50">
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Keine Berichte gefunden</h3>
            <p className="text-muted-foreground">
              Versuchen Sie einen anderen Suchbegriff oder Filter.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Report Execution Dialog */}
      {selectedReport && (
        <ReportExecutionDialog 
          report={selectedReport}
          open={showExecutionDialog}
          onOpenChange={setShowExecutionDialog}
        />
      )}
    </div>
  );
};

export default StandardReportsTab;
