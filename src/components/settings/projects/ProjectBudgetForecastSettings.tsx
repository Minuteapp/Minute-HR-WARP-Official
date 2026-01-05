
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, TrendingUp, BarChart, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProjectBudgetForecastSettings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <DollarSign className="h-6 w-6" />
          Budget-Forecasting Einstellungen
        </h2>
        <p className="text-muted-foreground">
          Konfigurieren Sie erweiterte Budgetprognosen und Finanzanalysen
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Forecasting-Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <h3 className="font-medium">Erweiterte Prognosen</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                KI-gestützte Budgetvorhersagen mit Konfidenz-Intervallen
              </p>
              <ul className="text-sm space-y-1">
                <li>• Maschinelles Lernen für Prognosen</li>
                <li>• Saisonale Trends-Analyse</li>
                <li>• Multi-Szenario-Modeling</li>
                <li>• Statistische Konfidenz-Bewertung</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <BarChart className="h-5 w-5 text-blue-600" />
                <h3 className="font-medium">Burn-Rate-Tracking</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Detaillierte Analyse der Budget-Verbrauchsraten
              </p>
              <ul className="text-sm space-y-1">
                <li>• Tägliche/Wöchentliche Burn-Rates</li>
                <li>• Velocity-basierte Prognosen</li>
                <li>• Team-spezifische Kostenanalysen</li>
                <li>• Ressourcen-Effizienz-Metriken</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <h3 className="font-medium">Risikobewertung</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Identifikation und Bewertung von Budget-Risiken
              </p>
              <ul className="text-sm space-y-1">
                <li>• Automatische Risiko-Erkennung</li>
                <li>• Budget-Varianz-Analysen</li>
                <li>• Frühe Warnsysteme</li>
                <li>• Kostenüberschreitungs-Prognosen</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <DollarSign className="h-5 w-5 text-purple-600" />
                <h3 className="font-medium">ROI-Analysen</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Return on Investment Berechnungen und Projektbewertungen
              </p>
              <ul className="text-sm space-y-1">
                <li>• Projekt-ROI-Berechnungen</li>
                <li>• Cost-Benefit-Analysen</li>
                <li>• Portfolio-Performance</li>
                <li>• Investitions-Empfehlungen</li>
              </ul>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Präzise Finanzprognosen ermöglichen bessere strategische Entscheidungen
              </p>
              <Link to="/projects/budget-forecast">
                <Button>
                  Budget-Forecasting öffnen
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Forecast-Genauigkeit & Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-700">87%</div>
                <div className="text-sm text-green-600">Prognose-Genauigkeit</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-700">±5%</div>
                <div className="text-sm text-blue-600">Durchschn. Abweichung</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-700">24h</div>
                <div className="text-sm text-purple-600">Forecast-Update-Zyklus</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-700">95%</div>
                <div className="text-sm text-orange-600">Früherkennung Risiken</div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Implementierte Algorithmen</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ul className="text-sm space-y-1">
                  <li>• Linear Regression für Trends</li>
                  <li>• ARIMA für Zeitreihen-Prognosen</li>
                  <li>• Monte Carlo Simulationen</li>
                  <li>• Bayesian Inference</li>
                </ul>
                <ul className="text-sm space-y-1">
                  <li>• Neural Network Prognosen</li>
                  <li>• Ensemble Methods</li>
                  <li>• Seasonal Decomposition</li>
                  <li>• Konfidenz-Intervall-Berechnung</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectBudgetForecastSettings;

