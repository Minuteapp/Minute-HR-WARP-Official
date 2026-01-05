
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  FileText, 
  Download, 
  Calendar,
  TrendingUp,
  Clock,
  Users,
  Target
} from 'lucide-react';

interface ProjectReportsProps {
  projectId: string;
  projectName: string;
}

export const ProjectReports: React.FC<ProjectReportsProps> = ({
  projectId,
  projectName
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');

  // Mock-Daten für Berichte
  const reports = [
    {
      id: '1',
      name: 'Monats-Statusbericht',
      type: 'status',
      generatedAt: '2024-01-20',
      format: 'PDF',
      size: '2.5 MB'
    },
    {
      id: '2',
      name: 'Zeiterfassungsbericht',
      type: 'timetracking',
      generatedAt: '2024-01-18',
      format: 'Excel',
      size: '1.2 MB'
    },
    {
      id: '3',
      name: 'Budget-Analyse',
      type: 'budget',
      generatedAt: '2024-01-15',
      format: 'PDF',
      size: '890 KB'
    }
  ];

  // Mock-Daten für Metriken
  const metrics = {
    projectProgress: 65,
    tasksCompleted: 24,
    totalTasks: 36,
    teamProductivity: 85,
    budgetUsed: 45,
    hoursLogged: 156,
    plannedHours: 200
  };

  return (
    <div className="space-y-6">
      {/* Projekt-Metriken */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Projekt-Fortschritt</p>
                <p className="text-2xl font-bold">{metrics.projectProgress}%</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
            <Progress value={metrics.projectProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aufgaben erledigt</p>
                <p className="text-2xl font-bold">{metrics.tasksCompleted}/{metrics.totalTasks}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-500" />
            </div>
            <Progress value={(metrics.tasksCompleted / metrics.totalTasks) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Produktivität</p>
                <p className="text-2xl font-bold">{metrics.teamProductivity}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
            <Progress value={metrics.teamProductivity} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Stunden erfasst</p>
                <p className="text-2xl font-bold">{metrics.hoursLogged}h</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              von {metrics.plannedHours}h geplant
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Berichts-Generator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Berichte generieren
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <BarChart3 className="h-8 w-8 text-blue-500" />
                <div>
                  <h3 className="font-medium">Status-Bericht</h3>
                  <p className="text-sm text-gray-600">Projekt-Fortschritt und Meilensteine</p>
                </div>
              </div>
              <Button variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Generieren
              </Button>
            </div>

            <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="h-8 w-8 text-green-500" />
                <div>
                  <h3 className="font-medium">Zeiterfassung</h3>
                  <p className="text-sm text-gray-600">Arbeitsstunden und Produktivität</p>
                </div>
              </div>
              <Button variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Generieren
              </Button>
            </div>

            <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <Users className="h-8 w-8 text-purple-500" />
                <div>
                  <h3 className="font-medium">Team-Performance</h3>
                  <p className="text-sm text-gray-600">Mitarbeiter-Leistung und Auslastung</p>
                </div>
              </div>
              <Button variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Generieren
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gespeicherte Berichte */}
      <Card>
        <CardHeader>
          <CardTitle>Gespeicherte Berichte</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">{report.name}</h3>
                    <p className="text-sm text-gray-600">
                      {report.format} • {report.size} • {new Date(report.generatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{report.type}</Badge>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Projekt-Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Projekt-Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Performance-Trends</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Team-Produktivität</span>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-green-600 font-medium">+12%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Aufgaben-Completion Rate</span>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-green-600 font-medium">+8%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Budget-Effizienz</span>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    <span className="text-blue-600 font-medium">+5%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Aktuelle Woche</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Erledigte Aufgaben</span>
                  <span className="font-medium">8</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Erfasste Stunden</span>
                  <span className="font-medium">42h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Budget verwendet</span>
                  <span className="font-medium">€850</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
