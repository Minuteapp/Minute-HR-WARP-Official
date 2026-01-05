import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Archive, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';

interface CompletedProject {
  id: string;
  title: string;
  team: string;
  responsible: string;
  plannedStart: string;
  plannedEnd: string;
  actualEnd: string;
  timeVarianceDays: number;
  plannedTasks: number;
  actualTasks: number;
  plannedDuration: number;
  actualDuration: number;
  plannedBudget: number;
  actualBudget: number;
  budgetVariance: number;
  wasOnTime: boolean;
  wasInBudget: boolean;
}

const ArchiveHistoryTab: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState('2024');

  // Leere Daten - werden aus der Datenbank geladen
  const kpis = {
    completed: 0,
    onTime: 0,
    onTimePercent: 0,
    avgTimeVariance: 0,
    avgBudgetVariance: 0
  };

  const completedProjects: CompletedProject[] = [];

  const lessonsLearned = {
    successFactors: [] as string[],
    challenges: [] as string[],
    recommendations: [] as string[]
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Archive className="h-6 w-6 text-muted-foreground" />
          <div>
            <h2 className="text-lg font-semibold">Archivierte Roadmaps & Projekte</h2>
            <p className="text-sm text-muted-foreground">Historische Projektverläufe und Lessons Learned</p>
          </div>
        </div>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Jahr" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2024">2024</SelectItem>
            <SelectItem value="2023">2023</SelectItem>
            <SelectItem value="2022">2022</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Karten */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Abgeschlossen</p>
                <p className="text-2xl font-bold">{kpis.completed} Projekte</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pünktlich</p>
                <p className="text-2xl font-bold">{kpis.onTime} ({kpis.onTimePercent}%)</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ø Zeit-Varianz</p>
                <p className="text-2xl font-bold">+{kpis.avgTimeVariance} T</p>
                <p className="text-xs text-muted-foreground">Tage Abweichung</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ø Budget-Varianz</p>
                <p className="text-2xl font-bold text-red-600">+{kpis.avgBudgetVariance}K</p>
                <p className="text-xs text-muted-foreground">EUR Abweichung</p>
              </div>
              <TrendingUp className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Abgeschlossene Projekte */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Abgeschlossene Projekte {selectedYear}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {completedProjects.map((project) => (
              <div key={project.id} className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">{project.title}</p>
                      <p className="text-sm text-muted-foreground">{project.team} • {project.responsible}</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Abgeschlossen</Badge>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* Geplant vs. Tatsächlich */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Geplant vs. Tatsächlich</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Start:</p>
                        <p className="font-medium">{project.plannedStart}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Ende (geplant):</p>
                        <p className="font-medium">{project.plannedEnd}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Ende (tatsächlich):</p>
                        <p className="font-medium">{project.actualEnd}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Zeitabweichung:</p>
                        <p className={`font-medium ${project.timeVarianceDays > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {project.timeVarianceDays > 0 ? '+' : ''}{project.timeVarianceDays} Tage
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Metriken */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Metriken</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Aufgaben:</p>
                        <p className="font-medium">{project.actualTasks} (Plan: {project.plannedTasks})</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Dauer:</p>
                        <p className="font-medium">{project.actualDuration} Tage (Plan: {project.plannedDuration})</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Budget:</p>
                        <p className="font-medium">{project.actualBudget}K (Plan: {project.plannedBudget}K)</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Budget-Varianz:</p>
                        <p className={`font-medium ${project.budgetVariance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {project.budgetVariance > 0 ? '+' : ''}{project.budgetVariance}K EUR
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex gap-2 mt-4">
                  {project.wasOnTime ? (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">⊕ Pünktlich</Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Signifikante Verzögerung</Badge>
                  )}
                  {project.wasInBudget ? (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Im Budget</Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Budget überschritten</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lessons Learned & Erkenntnisse */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base text-violet-700">Lessons Learned & Erkenntnisse</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {/* Erfolgsfaktoren */}
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <p className="font-medium text-green-700">Erfolgsfaktoren</p>
              </div>
              <ul className="space-y-2 text-sm text-green-700">
                {lessonsLearned.successFactors.map((item, index) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </div>

            {/* Herausforderungen */}
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <p className="font-medium text-red-700">Herausforderungen</p>
              </div>
              <ul className="space-y-2 text-sm text-red-700">
                {lessonsLearned.challenges.map((item, index) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </div>

            {/* Empfehlungen */}
            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
                <p className="font-medium text-yellow-700">Empfehlungen für zukünftige Projekte</p>
              </div>
              <ul className="space-y-2 text-sm text-yellow-700">
                {lessonsLearned.recommendations.map((item, index) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ArchiveHistoryTab;
