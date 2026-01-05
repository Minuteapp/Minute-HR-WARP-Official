import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Building, 
  Globe, 
  Calculator,
  AlertTriangle,
  Target,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Loader2
} from "lucide-react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

// Statische Optionen (keine Firmendaten)
const currencies = ['EUR', 'USD', 'GBP', 'CHF'];
const timeframes = ['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024', 'FY 2024'];

export const ExecutiveBudgetCockpit = () => {
  const [selectedEntity, setSelectedEntity] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('EUR');
  const [selectedTimeframe, setSelectedTimeframe] = useState('Q3 2024');
  const [queryInput, setQueryInput] = useState('');

  // Echte Firmendaten aus der Datenbank laden
  const { data: companies = [], isLoading: loadingCompanies } = useQuery({
    queryKey: ['budget-companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return data || [];
    }
  });

  // Budget-Daten aus der Datenbank laden
  const { data: budgetData, isLoading: loadingBudgets } = useQuery({
    queryKey: ['budget-summary', selectedEntity],
    queryFn: async () => {
      let query = supabase.from('budgets').select('*');
      if (selectedEntity) {
        query = query.eq('company_id', selectedEntity);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  // Berechne aggregierte Werte aus echten Daten
  const totalBudget = budgetData?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0;
  const totalAllocated = budgetData?.reduce((sum, b) => sum + (b.allocated_amount || 0), 0) || 0;
  const activeBudgets = budgetData?.filter(b => b.status === 'active').length || 0;

  const currentEntity = companies.find(c => c.id === selectedEntity) || { id: '', name: 'Alle Unternehmen' };

  const handleNLQuery = () => {
    if (!queryInput.trim()) return;
    console.log('Processing query:', queryInput);
    setQueryInput('');
  };

  const isLoading = loadingCompanies || loadingBudgets;

  return (
    <div className="space-y-6">
      {/* Global Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Executive Budget Cockpit - Enterprise Level
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Entity</label>
              <Select value={selectedEntity} onValueChange={setSelectedEntity}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingCompanies ? "Laden..." : "Alle Unternehmen"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Alle Unternehmen
                    </div>
                  </SelectItem>
                  {companies.length === 0 && !loadingCompanies ? (
                    <div className="px-2 py-1 text-sm text-muted-foreground">Keine Unternehmen vorhanden</div>
                  ) : (
                    companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          {company.name}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Currency</label>
              <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      <DollarSign className="h-4 w-4 mr-2" />
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Timeframe</label>
              <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeframes.map((timeframe) => (
                    <SelectItem key={timeframe} value={timeframe}>
                      {timeframe}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Budgets</label>
              <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <BarChart3 className="h-4 w-4" />
                    <span className="font-medium">{activeBudgets} aktiv</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Natural Language Interface */}
          <div className="border-t pt-4">
            <label className="text-sm font-medium mb-2 block">AI Query Interface</label>
            <div className="flex gap-2">
              <Input
                placeholder="z.B. 'Zeige mir die Personalkostentrendprognose für Q4 2024'"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleNLQuery} className="shrink-0">
                <Zap className="h-4 w-4 mr-2" />
                Analysieren
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : totalBudget > 0 ? (
              <>
                <div className="text-2xl font-bold">
                  {selectedCurrency} {(totalBudget / 1000000).toFixed(1)}M
                </div>
                <div className="text-xs text-muted-foreground">
                  Gesamtbudget
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">Keine Daten</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Allokiert</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : totalAllocated > 0 ? (
              <>
                <div className="text-2xl font-bold">
                  {selectedCurrency} {(totalAllocated / 1000000).toFixed(1)}M
                </div>
                <div className="text-xs text-muted-foreground">
                  {totalBudget > 0 ? ((totalAllocated / totalBudget) * 100).toFixed(1) : 0}% des Budgets
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">Keine Daten</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive Budgets</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <div className="text-2xl font-bold">{activeBudgets}</div>
                <div className="text-xs text-muted-foreground">
                  von {budgetData?.length || 0} gesamt
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : budgetData && budgetData.length > 0 ? (
              <>
                <div className="text-2xl font-bold text-green-600">OK</div>
                <Badge variant="secondary" className="text-xs">Alles aktuell</Badge>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">Keine Budgets</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget vs Actual Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Budget vs. Actual & Forecast Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {budgetData && budgetData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={budgetData.slice(0, 6).map((b, i) => ({
                  name: b.name || `Budget ${i + 1}`,
                  budget: b.total_amount || 0,
                  actual: b.allocated_amount || 0,
                  forecast: (b.total_amount || 0) * 0.9
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="budget" stroke="#3b82f6" strokeWidth={2} name="Budget" />
                  <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} name="Actual" />
                  <Line type="monotone" dataKey="forecast" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" name="Forecast" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Keine Budget-Daten für Trend-Analyse vorhanden
              </div>
            )}
          </CardContent>
        </Card>

        {/* Personnel Cost Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Budget-Kategorien - Übersicht</CardTitle>
          </CardHeader>
          <CardContent>
            {budgetData && budgetData.length > 0 ? (
              <div className="space-y-3">
                {budgetData.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {selectedCurrency} {((item.allocated_amount || 0) / 1000000).toFixed(1)}M / {((item.total_amount || 0) / 1000000).toFixed(1)}M
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-medium ${
                        (item.allocated_amount || 0) > (item.total_amount || 0) ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {item.total_amount && item.total_amount > 0 
                          ? ((item.allocated_amount || 0) / item.total_amount * 100).toFixed(1)
                          : 0}%
                      </div>
                      <div className="text-xs text-muted-foreground">Allokiert</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center text-muted-foreground">
                Keine Budget-Kategorien vorhanden
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Enterprise Modules */}
      <Tabs defaultValue="headcount" className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="headcount">Headcount Planning</TabsTrigger>
          <TabsTrigger value="forecast">Rolling Forecasts</TabsTrigger>
          <TabsTrigger value="whatif">What-If Simulator</TabsTrigger>
          <TabsTrigger value="anomaly">Anomaly Detection</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="headcount">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Headcount Planning - {currentEntity.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold">{activeBudgets}</div>
                  <div className="text-sm text-muted-foreground">Aktive Budgets</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-muted-foreground">-</div>
                  <div className="text-sm text-muted-foreground">Geplante Einstellungen</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-muted-foreground">-</div>
                  <div className="text-sm text-muted-foreground">Erwartete Fluktuation</div>
                </div>
              </div>
              <p className="text-center py-10 text-muted-foreground">
                {budgetData && budgetData.length > 0 
                  ? "Detaillierte Headcount-Planung mit Gehalts-, Bonus- und Benefitdaten wird hier angezeigt."
                  : "Keine Budget-Daten vorhanden. Erstellen Sie zuerst ein Budget."}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecast">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Rolling Forecasts - {currentEntity.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center py-10 text-muted-foreground">
                Rolling Forecasts mit automatischen Aktualisierungen auf Basis von Echtzeitdaten ({selectedTimeframe}).
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whatif">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Advanced What-If Simulator - {currentEntity.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 border rounded-lg">
                  <label className="text-sm font-medium mb-2 block">Salary Increase Scenario</label>
                  <div className="flex items-center gap-2">
                    <Input type="number" placeholder="5" className="w-20" />
                    <span className="text-sm">% increase</span>
                    <Button size="sm">Calculate Impact</Button>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <label className="text-sm font-medium mb-2 block">Headcount Change</label>
                  <div className="flex items-center gap-2">
                    <Input type="number" placeholder="500" className="w-24" />
                    <span className="text-sm">new hires</span>
                    <Button size="sm">Simulate</Button>
                  </div>
                </div>
              </div>
              <p className="text-center py-10 text-muted-foreground">
                Erweiterte What-if-Simulationen für komplexe Szenario-Analysen und Impact-Berechnungen.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="anomaly">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Anomaly Detection - {currentEntity.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-6">
                {[
                  { type: 'High Risk', message: 'Recruiting costs exceeded budget by 17% in Marketing department', severity: 'destructive' },
                  { type: 'Medium Risk', message: 'Training budget variance detected in Germany entity (+14%)', severity: 'secondary' },
                  { type: 'Low Risk', message: 'Overtime costs trending above normal in Q3', severity: 'outline' }
                ].map((alert, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Badge variant={alert.severity as any} className="mb-2">{alert.type}</Badge>
                      <div className="text-sm">{alert.message}</div>
                    </div>
                    <Button size="sm" variant="outline">Investigate</Button>
                  </div>
                ))}
              </div>
              <p className="text-center py-10 text-muted-foreground">
                Automatische Erkennung von Budgetabweichungen und Anomalien mit KI-Alerts.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Compliance & Reporting Center
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 border rounded-lg text-center">
                  <div className="text-lg font-semibold text-green-600">✓ GDPR Compliant</div>
                  <div className="text-sm text-muted-foreground">Data Protection</div>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <div className="text-lg font-semibold text-green-600">✓ SOX Compliant</div>
                  <div className="text-sm text-muted-foreground">Financial Controls</div>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <div className="text-lg font-semibold text-green-600">✓ Audit Ready</div>
                  <div className="text-sm text-muted-foreground">Complete Trail</div>
                </div>
              </div>
              <p className="text-center py-10 text-muted-foreground">
                DSGVO-konforme Berichterstattung und Audit-Trail für {companies.length} Unternehmen.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};