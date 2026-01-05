import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, Users, AlertCircle, Plus, Filter } from "lucide-react";
import { useHeadcountForecasts } from '@/hooks/useWorkforcePlanning';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const HeadcountForecastView = () => {
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [forecastPeriod, setForecastPeriod] = useState<string>('12_months');
  
  const { data: forecasts, isLoading: forecastsLoading } = useHeadcountForecasts({
    department: selectedDepartment !== 'all' ? selectedDepartment : undefined,
    location: selectedLocation !== 'all' ? selectedLocation : undefined,
    period: forecastPeriod as any
  });

  // Lade echte Daten aus der Datenbank
  const { data: realData, isLoading: dataLoading } = useQuery({
    queryKey: ['headcount-forecast-data', selectedDepartment, selectedLocation],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (!profile?.company_id) return null;

      // Aktuelle Mitarbeiterzahl
      const { count: currentHeadcount } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', profile.company_id)
        .eq('status', 'active');

      // Geplante Einstellungen (offene Stellen)
      const { count: plannedHires } = await supabase
        .from('job_postings')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', profile.company_id)
        .eq('status', 'published');

      // Abteilungsdaten
      const { data: deptData } = await supabase
        .from('departments')
        .select('id, name')
        .eq('company_id', profile.company_id);

      const departmentStats = await Promise.all(
        (deptData || []).map(async (dept) => {
          const { count: current } = await supabase
            .from('employees')
            .select('*', { count: 'exact', head: true })
            .eq('department', dept.name)
            .eq('status', 'active');

          const { count: openPositions } = await supabase
            .from('job_postings')
            .select('*', { count: 'exact', head: true })
            .eq('department', dept.name)
            .eq('status', 'published');

          const planned = (current || 0) + (openPositions || 0);
          const variance = current && current > 0 
            ? ((planned - current) / current) * 100 
            : 0;

          return {
            department: dept.name,
            current: current || 0,
            planned,
            variance: Math.round(variance * 10) / 10,
            trend: variance >= 0 ? 'up' : 'down'
          };
        })
      );

      // Budget-Daten für Personalkosten
      const { data: budgetData } = await supabase
        .from('budgets')
        .select('total_amount, spent_amount')
        .eq('company_id', profile.company_id)
        .eq('category', 'personnel')
        .eq('status', 'active')
        .single();

      const monthlyBudget = budgetData?.total_amount 
        ? Math.round(budgetData.total_amount / 12) 
        : 0;

      return {
        currentHeadcount: currentHeadcount || 0,
        plannedHires: plannedHires || 0,
        departmentStats: departmentStats.filter(d => d.current > 0),
        monthlyBudget,
        companyId: profile.company_id
      };
    }
  });

  const isLoading = forecastsLoading || dataLoading;

  // Generiere Forecast-Daten basierend auf echten Zahlen
  const generateForecastData = () => {
    if (!realData) return [];
    
    const baseHeadcount = realData.currentHeadcount;
    const monthlyGrowth = realData.plannedHires / 12;
    const baseBudget = realData.monthlyBudget || (baseHeadcount * 5000);
    
    const months = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return months.map((month, idx) => {
      const monthOffset = idx;
      const growth = Math.floor(monthlyGrowth * monthOffset);
      
      return {
        month: `${month} ${currentYear}`,
        current: baseHeadcount + growth,
        planned: baseHeadcount + Math.floor(monthlyGrowth * 12 * (idx / 12)),
        predicted: baseHeadcount + Math.floor(growth * 0.95),
        budget: baseBudget + (baseBudget * 0.02 * idx)
      };
    });
  };

  const forecastChartData = generateForecastData();
  const departmentData = realData?.departmentStats || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Abteilung wählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Abteilungen</SelectItem>
              {departmentData.map(dept => (
                <SelectItem key={dept.department} value={dept.department.toLowerCase()}>
                  {dept.department}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Standort wählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Standorte</SelectItem>
              <SelectItem value="remote">Remote</SelectItem>
            </SelectContent>
          </Select>

          <Select value={forecastPeriod} onValueChange={setForecastPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Forecast-Zeitraum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="12_months">12 Monate</SelectItem>
              <SelectItem value="24_months">24 Monate</SelectItem>
              <SelectItem value="36_months">36 Monate</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Erweiterte Filter
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Neuer Forecast
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Aktuelle Belegschaft</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{realData?.currentHeadcount.toLocaleString() || 0}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              <span className="text-green-600">Aktiv</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Offene Stellen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{realData?.plannedHires || 0}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <span>Geplante Einstellungen</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Abteilungen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departmentData.length}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Badge variant="secondary" className="text-xs">Aktiv</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Budget/Monat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {realData?.monthlyBudget 
                ? `€${(realData.monthlyBudget / 1000000).toFixed(1)}M` 
                : '€0'}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <span>Personalkosten</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Headcount Forecast Chart */}
      {forecastChartData.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Headcount Forecast - 12 Monate</CardTitle>
            <CardDescription>
              Vergleich zwischen aktueller Belegschaft, Planung und Prognose
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecastChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => [value, name]} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="current"
                    stackId="1"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.3}
                    name="Aktuell"
                  />
                  <Area
                    type="monotone"
                    dataKey="planned"
                    stackId="2"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                    fillOpacity={0.3}
                    name="Geplant"
                  />
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    stroke="#ff7300"
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    name="Prognose"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Keine Forecast-Daten verfügbar.</p>
            <p className="text-sm">Erstellen Sie Mitarbeiter und Stellenausschreibungen.</p>
          </CardContent>
        </Card>
      )}

      {/* Department Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Headcount nach Abteilungen</CardTitle>
            <CardDescription>
              Soll/Ist-Vergleich und Trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            {departmentData.length > 0 ? (
              <div className="space-y-4">
                {departmentData.map((dept) => (
                  <div key={dept.department} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium">{dept.department}</p>
                        <p className="text-sm text-gray-500">
                          {dept.current} / {dept.planned} Mitarbeiter
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className={`flex items-center ${dept.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {dept.trend === 'up' ? (
                            <TrendingUp className="h-4 w-4 mr-1" />
                          ) : (
                            <TrendingDown className="h-4 w-4 mr-1" />
                          )}
                          <span className="font-medium">{Math.abs(dept.variance)}%</span>
                        </div>
                      </div>
                      <Badge variant={Math.abs(dept.variance) > 10 ? "destructive" : "secondary"}>
                        {Math.abs(dept.variance) > 10 ? 'Kritisch' : 'OK'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Keine Abteilungsdaten verfügbar.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Budget Impact Forecast</CardTitle>
            <CardDescription>
              Monatliche Personalkosten-Entwicklung
            </CardDescription>
          </CardHeader>
          <CardContent>
            {forecastChartData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={forecastChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`€${(value as number).toLocaleString()}`, 'Budget']} />
                    <Bar dataKey="budget" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Keine Budget-Daten verfügbar.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alerts & Recommendations */}
      {departmentData.some(d => Math.abs(d.variance) > 10) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              Forecast Alerts & Empfehlungen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {departmentData.filter(d => d.variance > 10).map(dept => (
                <div key={dept.department} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                  <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-orange-900">{dept.department} - Hoher Bedarf</p>
                    <p className="text-sm text-orange-700">
                      Geplantes Wachstum von {dept.variance}%. Recruiting-Pipeline prüfen.
                    </p>
                  </div>
                </div>
              ))}
              {departmentData.filter(d => d.variance < -10).map(dept => (
                <div key={dept.department} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <Users className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900">{dept.department} - Überkapazität</p>
                    <p className="text-sm text-blue-700">
                      Mögliche Überbesetzung von {Math.abs(dept.variance)}%. Umstrukturierung prüfen.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
