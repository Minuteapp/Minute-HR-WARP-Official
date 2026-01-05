import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Globe, 
  TrendingUp, 
  Brain, 
  Calculator, 
  Users, 
  Building2,
  DollarSign,
  AlertTriangle,
  BarChart3,
  PieChart,
  Target,
  Zap,
  Search,
  Plus
} from "lucide-react";
import { EnterpriseKPIDashboard } from './EnterpriseKPIDashboard';
import { MultiEntityView } from './MultiEntityView';
import { AIForecastingEngine } from './AIForecastingEngine';
import { HeadcountPlanningModule } from './HeadcountPlanningModule';
import { NaturalLanguageInterface } from './NaturalLanguageInterface';
import { RollingForecastPanel } from './RollingForecastPanel';
import { AnomalyDetectionPanel } from './AnomalyDetectionPanel';
import { WhatIfSimulatorAdvanced } from './WhatIfSimulatorAdvanced';
import { ComplianceReportingCenter } from './ComplianceReportingCenter';

export const EnterpriseBudgetDashboard = () => {
  const [selectedEntity, setSelectedEntity] = useState('global');
  const [selectedCurrency, setSelectedCurrency] = useState('EUR');
  const [timeframe, setTimeframe] = useState('quarterly');

  // Keine Mock-Daten - Nullwerte für neue Firmen
  const enterpriseMetrics = {
    totalBudget: 0,
    allocatedBudget: 0,
    utilization: 0,
    projectedSavings: 0,
    entitiesCount: 0,
    anomaliesDetected: 0,
    forecastAccuracy: 0
  };

  // Leeres Entity-Array für neue Firmen
  const entities: { id: string; name: string; country: string; employees: number }[] = [];

  const currencies = ['EUR', 'USD', 'GBP', 'JPY', 'CNY', 'CHF'];

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-6">
        {/* Header - Pulse Surveys Style */}
        <div className="flex justify-between items-start border-b pb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Budget & Forecast</h1>
              <p className="text-sm text-muted-foreground">
                Global Financial Planning & Analysis für Unternehmen
              </p>
            </div>
          </div>
          
          {/* Global Controls */}
          <div className="flex flex-wrap gap-3 items-center">
            <Select value={selectedEntity} onValueChange={setSelectedEntity}>
              <SelectTrigger className="w-48">
                <Building2 className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {entities.map((entity) => (
                  <SelectItem key={entity.id} value={entity.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{entity.name}</span>
                      <Badge variant="secondary" className="ml-2">
                        {entity.employees.toLocaleString()}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
              <SelectTrigger className="w-24">
                <DollarSign className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency} value={currency}>
                    {currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>

            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Forecast
            </Button>
          </div>
        </div>

      {/* Executive Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {selectedCurrency} {(enterpriseMetrics.totalBudget / 1000000).toFixed(0)}M
            </div>
            <p className="text-xs text-muted-foreground">
              +12.5% vs. last year
            </p>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilization</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enterpriseMetrics.utilization}%</div>
            <p className="text-xs text-muted-foreground">
              Budget utilization rate
            </p>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entities</CardTitle>
            <Building2 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enterpriseMetrics.entitiesCount}</div>
            <p className="text-xs text-muted-foreground">
              Global subsidiaries
            </p>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Headcount</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">10.2K</div>
            <p className="text-xs text-muted-foreground">
              Global employees
            </p>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Accuracy</CardTitle>
            <Brain className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enterpriseMetrics.forecastAccuracy}%</div>
            <p className="text-xs text-muted-foreground">
              Forecast precision
            </p>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Savings</CardTitle>
            <Zap className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {selectedCurrency} {(enterpriseMetrics.projectedSavings / 1000000).toFixed(1)}M
            </div>
            <p className="text-xs text-muted-foreground">
              Projected savings
            </p>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enterpriseMetrics.anomaliesDetected}</div>
            <p className="text-xs text-muted-foreground">
              Active anomalies
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Natural Language Interface */}
      <NaturalLanguageInterface selectedEntity={selectedEntity} selectedCurrency={selectedCurrency} />

        {/* Main Content Tabs - Underline Style */}
        <Tabs defaultValue="dashboard" className="w-full space-y-6">
          <TabsList className="bg-transparent border-b w-full justify-start rounded-none h-auto p-0 space-x-6">
            <TabsTrigger 
              value="dashboard"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
            >
              Dashboard
            </TabsTrigger>
            <TabsTrigger 
              value="multi-entity"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
            >
              Multi-Entity
            </TabsTrigger>
            <TabsTrigger 
              value="ai-forecasting"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
            >
              AI Forecasting
            </TabsTrigger>
            <TabsTrigger 
              value="headcount"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
            >
              Headcount
            </TabsTrigger>
            <TabsTrigger 
              value="rolling-forecast"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
            >
              Rolling Forecast
            </TabsTrigger>
            <TabsTrigger 
              value="what-if"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
            >
              What-If
            </TabsTrigger>
            <TabsTrigger 
              value="anomalies"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
            >
              Anomalies
            </TabsTrigger>
            <TabsTrigger 
              value="compliance"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
            >
              Compliance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <EnterpriseKPIDashboard 
              selectedEntity={selectedEntity}
              selectedCurrency={selectedCurrency}
              timeframe={timeframe}
            />
          </TabsContent>

          <TabsContent value="multi-entity" className="mt-6">
            <MultiEntityView 
              entities={entities}
              selectedCurrency={selectedCurrency}
              timeframe={timeframe}
            />
          </TabsContent>

          <TabsContent value="ai-forecasting" className="mt-6">
            <AIForecastingEngine 
              selectedEntity={selectedEntity}
              selectedCurrency={selectedCurrency}
            />
          </TabsContent>

          <TabsContent value="headcount" className="mt-6">
            <HeadcountPlanningModule 
              selectedEntity={selectedEntity}
              selectedCurrency={selectedCurrency}
            />
          </TabsContent>

          <TabsContent value="rolling-forecast" className="mt-6">
            <RollingForecastPanel 
              selectedEntity={selectedEntity}
              selectedCurrency={selectedCurrency}
              timeframe={timeframe}
            />
          </TabsContent>

          <TabsContent value="what-if" className="mt-6">
            <WhatIfSimulatorAdvanced 
              selectedEntity={selectedEntity}
              selectedCurrency={selectedCurrency}
            />
          </TabsContent>

          <TabsContent value="anomalies" className="mt-6">
            <AnomalyDetectionPanel 
              selectedEntity={selectedEntity}
              selectedCurrency={selectedCurrency}
            />
          </TabsContent>

          <TabsContent value="compliance" className="mt-6">
            <ComplianceReportingCenter 
              entities={entities}
              selectedCurrency={selectedCurrency}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EnterpriseBudgetDashboard;