
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, TrendingUp, Download, Plus, Calendar, DollarSign } from 'lucide-react';
import { useEnterpriseForecasts, useBudgetDimensions } from '@/hooks/useBudgetEnterprise';
import { AIInsightsPanel } from './dashboard/AIInsightsPanel';
import { ActualVsBudgetChart } from './dashboard/ActualVsBudgetChart';
import { ForecastChart } from '@/components/projects/budget/dashboard/ForecastChart';
import { ScenarioComparison } from './dashboard/ScenarioComparison';
import { UploadDataDialog } from './dashboard/UploadDataDialog';

const BudgetForecastingDashboard = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'month' | 'quarter' | 'year'>('month');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  
  const { data: forecasts, isLoading } = useEnterpriseForecasts();
  const { data: dimensions } = useBudgetDimensions();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Budget Forecasting</h1>
          <p className="text-muted-foreground">
            Intelligente Budgetprognosen und Analysen
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowUploadDialog(true)}>
            <Download className="h-4 w-4 mr-2" />
            Daten hochladen
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Neue Prognose
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive Forecasts</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{forecasts?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              +2 neue diese Woche
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prognostiziert</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€2.4M</div>
            <p className="text-xs text-muted-foreground">
              +12% vs letzter Monat
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Genauigkeit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <Progress value={94} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">KI-Insights</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              Neue Empfehlungen
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <Select value={selectedTimeframe} onValueChange={(value: 'month' | 'quarter' | 'year') => setSelectedTimeframe(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Zeitraum wählen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">Monatlich</SelectItem>
            <SelectItem value="quarter">Quartalsweise</SelectItem>
            <SelectItem value="year">Jährlich</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="forecasts">Prognosen</TabsTrigger>
          <TabsTrigger value="scenarios">Szenarien</TabsTrigger>
          <TabsTrigger value="insights">KI-Insights</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <ForecastChart timeframe={selectedTimeframe} />
            <ActualVsBudgetChart />
          </div>
          <ScenarioComparison />
        </TabsContent>
        
        <TabsContent value="forecasts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Aktive Prognosen</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                  <p className="mt-4 text-gray-600">Lade Prognosen...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {forecasts?.map((forecast) => (
                    <div key={forecast.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{forecast.forecast_name}</h4>
                          <p className="text-sm text-gray-600">{forecast.forecast_type}</p>
                        </div>
                        <Badge variant={forecast.status === 'active' ? 'default' : 'secondary'}>
                          {forecast.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="scenarios" className="space-y-4">
          <ScenarioComparison />
        </TabsContent>
        
        <TabsContent value="insights" className="space-y-4">
          <AIInsightsPanel />
        </TabsContent>
      </Tabs>

      <UploadDataDialog 
        open={showUploadDialog} 
        onOpenChange={setShowUploadDialog} 
      />
    </div>
  );
};

export default BudgetForecastingDashboard;
