
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, Target, TrendingUp, PieChart } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProjectPortfolioSettings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          Portfolio-Dashboard Einstellungen
        </h2>
        <p className="text-muted-foreground">
          Konfigurieren Sie Ihr Projektportfolio-Dashboard mit erweiterten Analysen
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Portfolio-Dashboard Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Target className="h-5 w-5 text-blue-600" />
                <h3 className="font-medium">Key Metrics Übersicht</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Zentrale Projektmetriken auf einen Blick
              </p>
              <ul className="text-sm space-y-1">
                <li>• Gesamtanzahl aktiver Projekte</li>
                <li>• Portfolio-Gesundheit</li>
                <li>• Durchschnittlicher Fortschritt</li>
                <li>• Budget-Auslastung</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <h3 className="font-medium">Fortschritts-Tracking</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Detaillierte Fortschrittsanalysen
              </p>
              <ul className="text-sm space-y-1">
                <li>• Zeitbasierte Fortschrittskurven</li>
                <li>• Meilenstein-Tracking</li>
                <li>• Velocity-Messungen</li>
                <li>• Prognosealgorithmen</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <PieChart className="h-5 w-5 text-purple-600" />
                <h3 className="font-medium">Budget-Analysen</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Finanzielle Portfolio-Übersicht
              </p>
              <ul className="text-sm space-y-1">
                <li>• Gesamtbudget vs. Ausgaben</li>
                <li>• Cost-per-Project Analysen</li>
                <li>• ROI-Berechnungen</li>
                <li>• Budget-Varianz-Reports</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <BarChart3 className="h-5 w-5 text-orange-600" />
                <h3 className="font-medium">Timeline-Visualisierung</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Zeitliche Projektübersicht
              </p>
              <ul className="text-sm space-y-1">
                <li>• Gantt-Chart für Portfolio</li>
                <li>• Kritische Pfad-Analyse</li>
                <li>• Ressourcen-Auslastung</li>
                <li>• Deadline-Überwachung</li>
              </ul>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Das Portfolio-Dashboard bietet umfassende Analysen für strategische Entscheidungen
              </p>
              <Link to="/projects/portfolio">
                <Button>
                  Portfolio-Dashboard öffnen
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Implementierte Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-green-700">✅ Bereits implementiert</h4>
              <ul className="text-sm space-y-1">
                <li>• ProjectPortfolioDashboard Komponente</li>
                <li>• Mobile-responsive Design</li>
                <li>• Real-time Datenaktualisierung</li>
                <li>• Interaktive Charts und Diagramme</li>
                <li>• Export-Funktionen für Reports</li>
                <li>• Filtermöglichkeiten nach Status/Priorität</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-blue-700">🔄 In Entwicklung</h4>
              <ul className="text-sm space-y-1">
                <li>• Erweiterte Prognosealgorithmen</li>
                <li>• Custom Dashboard-Layouts</li>
                <li>• Automatisierte Reports</li>
                <li>• Team-Performance-Metriken</li>
                <li>• Integration mit externen Tools</li>
                <li>• Advanced Analytics mit KI</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectPortfolioSettings;

