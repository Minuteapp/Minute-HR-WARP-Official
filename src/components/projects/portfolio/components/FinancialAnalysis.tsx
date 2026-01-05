
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  PieChart,
  BarChart3,
  Calculator,
  AlertTriangle,
  CheckCircle2,
  Info,
  Download
} from 'lucide-react';
import { FinancialCalculationService, ProjectFinancialData } from '@/services/projects/financialCalculations';

interface FinancialAnalysisProps {
  projects: any[];
}

export const FinancialAnalysis: React.FC<FinancialAnalysisProps> = ({ projects }) => {
  const [timeframe, setTimeframe] = useState('current');
  const [analysisType, setAnalysisType] = useState('overview');

  // Finanzielle Analysen berechnen
  const calculateFinancialMetrics = () => {
    const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const totalSpent = projects.reduce((sum, p) => sum + (p.budget_spent || 0), 0);
    const totalRevenue = projects.reduce((sum, p) => sum + (p.expected_revenue || 0), 0);
    
    const capexProjects = projects.filter(p => p.capex_amount > 0);
    const opexProjects = projects.filter(p => p.opex_amount > 0);
    
    const totalCapex = capexProjects.reduce((sum, p) => sum + (p.capex_amount || 0), 0);
    const totalOpex = opexProjects.reduce((sum, p) => sum + (p.opex_amount || 0), 0);

    // ROI Berechnung für Projekte mit erwarteten Einnahmen
    const projectsWithROI = projects.filter(p => p.expected_revenue && p.budget).map(project => {
      const initialInvestment = project.budget;
      const expectedRevenue = project.expected_revenue;
      const operatingCosts = project.opex_amount || 0;
      
      // Einfache Cash Flow Projektion erstellen
      const projectDuration = 2; // Jahre (Annahme)
      const cashFlows = FinancialCalculationService.generateCashFlowProjection({
        initialInvestment,
        expectedRevenue,
        operatingCosts,
        projectDuration,
        cashFlows: []
      });

      const financialData: ProjectFinancialData = {
        initialInvestment,
        expectedRevenue,
        operatingCosts,
        projectDuration,
        cashFlows,
        discountRate: project.discount_rate || 0.10
      };

      const metrics = FinancialCalculationService.calculateAllMetrics(financialData);
      
      return {
        ...project,
        financialMetrics: metrics
      };
    });

    return {
      totalBudget,
      totalSpent,
      totalRevenue,
      totalCapex,
      totalOpex,
      budgetUtilization: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
      projectsWithROI,
      avgROI: projectsWithROI.length > 0 
        ? projectsWithROI.reduce((sum, p) => sum + p.financialMetrics.roi, 0) / projectsWithROI.length 
        : 0,
      profitableProjects: projectsWithROI.filter(p => p.financialMetrics.roi > 0).length,
      totalProjects: projects.length
    };
  };

  const metrics = calculateFinancialMetrics();

  const getROIColor = (roi: number) => {
    if (roi >= 20) return 'text-green-600';
    if (roi >= 10) return 'text-blue-600';
    if (roi >= 0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getROIStatus = (roi: number) => {
    if (roi >= 20) return { status: 'Ausgezeichnet', icon: CheckCircle2, color: 'text-green-600' };
    if (roi >= 10) return { status: 'Gut', icon: TrendingUp, color: 'text-blue-600' };
    if (roi >= 0) return { status: 'Positiv', icon: Info, color: 'text-yellow-600' };
    return { status: 'Verlust', icon: AlertTriangle, color: 'text-red-600' };
  };

  const getNPVColor = (npv: number) => {
    if (npv >= 100000) return 'text-green-600';
    if (npv >= 0) return 'text-blue-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Filter und Steuerung */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Finanzanalyse Portfolio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Aktueller Stand</SelectItem>
                <SelectItem value="ytd">Jahr bis heute</SelectItem>
                <SelectItem value="forecast">Prognose</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={analysisType} onValueChange={setAnalysisType}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overview">Übersicht</SelectItem>
                <SelectItem value="roi">ROI-Analyse</SelectItem>
                <SelectItem value="capex-opex">CAPEX/OPEX</SelectItem>
                <SelectItem value="risk">Risikobewertung</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Finanzielle KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Gesamtbudget</p>
                <p className="text-2xl font-bold">€{metrics.totalBudget.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ausgegeben</p>
                <p className="text-2xl font-bold">€{metrics.totalSpent.toLocaleString()}</p>
                <Progress value={metrics.budgetUtilization} className="mt-2 h-2" />
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Erwartete Einnahmen</p>
                <p className="text-2xl font-bold">€{metrics.totalRevenue.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ø ROI</p>
                <p className={`text-2xl font-bold ${getROIColor(metrics.avgROI)}`}>
                  {metrics.avgROI.toFixed(1)}%
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CAPEX/OPEX Übersicht */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              CAPEX vs OPEX
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>CAPEX (Investitionen)</span>
                  <span>€{metrics.totalCapex.toLocaleString()}</span>
                </div>
                <Progress 
                  value={metrics.totalCapex + metrics.totalOpex > 0 ? (metrics.totalCapex / (metrics.totalCapex + metrics.totalOpex)) * 100 : 0} 
                  className="h-3" 
                />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>OPEX (Betriebskosten)</span>
                  <span>€{metrics.totalOpex.toLocaleString()}</span>
                </div>
                <Progress 
                  value={metrics.totalCapex + metrics.totalOpex > 0 ? (metrics.totalOpex / (metrics.totalCapex + metrics.totalOpex)) * 100 : 0} 
                  className="h-3" 
                />
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between">
                  <span className="font-medium">Gesamt:</span>
                  <span className="font-medium">€{(metrics.totalCapex + metrics.totalOpex).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profitabilität</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Profitable Projekte:</span>
                <Badge variant="secondary">
                  {metrics.profitableProjects} von {metrics.totalProjects}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Profitabilitätsrate:</span>
                <span className="font-medium">
                  {metrics.totalProjects > 0 ? ((metrics.profitableProjects / metrics.totalProjects) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <Progress 
                value={metrics.totalProjects > 0 ? (metrics.profitableProjects / metrics.totalProjects) * 100 : 0} 
                className="h-3" 
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ROI-Details für einzelne Projekte */}
      {analysisType === 'roi' && (
        <Card>
          <CardHeader>
            <CardTitle>ROI-Analyse nach Projekten</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.projectsWithROI.map((project) => {
                const roiStatus = getROIStatus(project.financialMetrics.roi);
                const StatusIcon = roiStatus.icon;
                
                return (
                  <div key={project.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium">{project.name}</h4>
                        <p className="text-sm text-gray-600">{project.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusIcon className={`h-4 w-4 ${roiStatus.color}`} />
                        <span className={`text-sm font-medium ${roiStatus.color}`}>
                          {roiStatus.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">ROI</p>
                        <p className={`font-bold ${getROIColor(project.financialMetrics.roi)}`}>
                          {project.financialMetrics.roi.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">NPV</p>
                        <p className={`font-bold ${getNPVColor(project.financialMetrics.npv)}`}>
                          €{project.financialMetrics.npv.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">IRR</p>
                        <p className="font-bold">
                          {project.financialMetrics.irr.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Amortisation</p>
                        <p className="font-bold">
                          {project.financialMetrics.paybackPeriod > 0 
                            ? `${project.financialMetrics.paybackPeriod} Jahre` 
                            : 'Nie'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t">
                      <div className="flex justify-between text-sm">
                        <span>Investition: €{project.budget?.toLocaleString()}</span>
                        <span>Erwartete Einnahmen: €{project.expected_revenue?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
