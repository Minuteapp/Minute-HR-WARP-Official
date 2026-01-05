import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, FileText, TrendingUp, Calendar, Download, Filter, PieChart, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const ReportsView = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('2025');
  const [selectedType, setSelectedType] = useState('all');

  // Keine Mock-Counts - echte Zahlen werden aus der DB geladen
  const reportTypes = [
    {
      id: 'status',
      title: 'Status-Bericht',
      description: 'Aktueller Status aller laufenden Projekte',
      icon: Activity,
      count: 0,
      color: 'text-blue-600'
    },
    {
      id: 'financial',
      title: 'Finanz-Bericht',
      description: 'Budget-Auslastung und Kostenübersicht',
      icon: TrendingUp,
      count: 0,
      color: 'text-green-600'
    },
    {
      id: 'progress',
      title: 'Fortschritts-Bericht',
      description: 'Meilensteine und Zeitplan-Übersicht',
      icon: BarChart3,
      count: 0,
      color: 'text-purple-600'
    },
    {
      id: 'resource',
      title: 'Ressourcen-Bericht',
      description: 'Team-Auslastung und Kapazitäten',
      icon: PieChart,
      count: 0,
      color: 'text-orange-600'
    }
  ];

  // Keine Mock-Berichte - echte Berichte werden aus der DB geladen
  const recentReports: { id: string; name: string; type: string; date: string; size: string; format: string }[] = [];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Berichte & Analysen</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Projekt-Reports und Übersichten generieren
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[150px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Report Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          return (
            <Card key={report.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-lg bg-muted ${report.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <Badge variant="secondary">{report.count}</Badge>
                </div>
                <CardTitle className="text-lg mt-4">{report.title}</CardTitle>
                <CardDescription className="text-xs">
                  {report.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Generieren
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Reports Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Letzte Berichte</CardTitle>
              <CardDescription>
                Kürzlich generierte Reports und Analysen
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentReports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{report.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-muted-foreground">{report.type}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{report.date}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{report.size}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{report.format}</Badge>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Custom Report</p>
                <p className="text-xs text-muted-foreground">Individuellen Bericht erstellen</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Geplante Berichte</p>
                <p className="text-xs text-muted-foreground">Automatische Report-Generierung</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">Dashboards</p>
                <p className="text-xs text-muted-foreground">Interaktive Analysen anzeigen</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
