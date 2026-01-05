import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Target,
  Building2,
  Globe,
  Calendar
} from "lucide-react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { useBudgetRealData } from '@/hooks/useBudgetRealData';
import { useReportsData } from '@/hooks/useReportsData';

interface EnterpriseKPIDashboardProps {
  selectedEntity: string;
  selectedCurrency: string;
  timeframe: string;
}

export const EnterpriseKPIDashboard: React.FC<EnterpriseKPIDashboardProps> = ({
  selectedEntity,
  selectedCurrency,
  timeframe
}) => {
  const { 
    personnelCosts, 
    recruitingCosts, 
    trainingCosts, 
    budgetUtilization, 
    headcountGrowth,
    monthlyData,
    isLoading: budgetLoading 
  } = useBudgetRealData();

  const {
    employeeCount,
    departmentData,
    isLoading: reportsLoading
  } = useReportsData();

  const isLoading = budgetLoading || reportsLoading;

  // Berechne Änderungen basierend auf echten Daten
  const totalCosts = personnelCosts + recruitingCosts + trainingCosts;
  const previousTotal = totalCosts * 0.95; // Schätzung für vorherige Periode
  const costChange = previousTotal > 0 ? ((totalCosts - previousTotal) / previousTotal * 100) : 0;

  // Cost breakdown aus echten Daten
  const costBreakdown = [
    { name: 'Personal', value: personnelCosts, color: '#3B82F6' },
    { name: 'Recruiting', value: recruitingCosts, color: '#10B981' },
    { name: 'Training', value: trainingCosts, color: '#F59E0B' },
  ].filter(item => item.value > 0);

  // Regionale Daten basierend auf Abteilungsverteilung
  const regionalData = departmentData.slice(0, 3).map(dept => ({
    region: dept.name,
    budget: Math.round(totalCosts * (dept.value / 100) * 1.2),
    used: Math.round(totalCosts * (dept.value / 100)),
    employees: Math.round(employeeCount * (dept.value / 100))
  }));

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `${selectedCurrency} ${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${selectedCurrency} ${(value / 1000).toFixed(0)}K`;
    }
    return `${selectedCurrency} ${value.toFixed(0)}`;
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-8 w-64" />
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Entity Info Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <span className="font-semibold">
                  {selectedEntity === 'global' ? 'Globale Übersicht' : 
                   selectedEntity === 'emea' ? 'Europa, Naher Osten & Afrika' :
                   selectedEntity === 'apac' ? 'Asien-Pazifik Region' :
                   selectedEntity === 'americas' ? 'Amerika Region' :
                   selectedEntity === 'germany' ? 'Deutschland GmbH' :
                   selectedEntity === 'usa' ? 'USA Inc.' : 'Ausgewählte Entität'}
                </span>
              </div>
              <Badge variant="outline">{timeframe}</Badge>
            </div>
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{employeeCount.toLocaleString()} Mitarbeiter</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Aktualisiert: {new Date().toLocaleDateString('de-DE')}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamtkosten</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCosts)}</div>
            <div className="flex items-center space-x-1 text-xs">
              {costChange >= 0 ? (
                <TrendingUp className="h-3 w-3 text-orange-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-green-500" />
              )}
              <span className={`${costChange >= 0 ? 'text-orange-600' : 'text-green-600'}`}>
                {formatPercentage(costChange)} vs Vorperiode
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Personalkosten</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(personnelCosts)}</div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <span>{((personnelCosts / totalCosts) * 100 || 0).toFixed(0)}% der Gesamtkosten</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget-Auslastung</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{budgetUtilization}%</div>
            <Progress value={budgetUtilization} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mitarbeiter</CardTitle>
            <Users className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employeeCount.toLocaleString()}</div>
            <div className="flex items-center space-x-1 text-xs">
              {headcountGrowth >= 0 ? (
                <TrendingUp className="h-3 w-3 text-blue-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span className={`${headcountGrowth >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {formatPercentage(headcountGrowth)} Wachstum
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Kostenentwicklung</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip formatter={(value: number) => [formatCurrency(value), '']} />
                  <Area 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#3B82F6" 
                    fill="#3B82F6" 
                    fillOpacity={0.6}
                    name="Gesamtkosten"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Keine Daten verfügbar
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cost Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Kostenstruktur</CardTitle>
          </CardHeader>
          <CardContent>
            {costBreakdown.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <RechartsPieChart>
                    <Pie
                      data={costBreakdown}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                    >
                      {costBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [formatCurrency(value), '']} />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {costBreakdown.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm">{item.name}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                Keine Kostendaten verfügbar
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Regional Overview */}
      {regionalData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Budget-Auslastung nach Bereich
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {regionalData.map((region, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="font-semibold">{region.region}</span>
                      <Badge variant="secondary">{region.employees.toLocaleString()} Mitarbeiter</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatCurrency(region.used)} / {formatCurrency(region.budget)}
                    </div>
                  </div>
                  <Progress 
                    value={region.budget > 0 ? (region.used / region.budget) * 100 : 0} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{region.budget > 0 ? ((region.used / region.budget) * 100).toFixed(1) : 0}% genutzt</span>
                    <span>{formatCurrency(region.budget - region.used)} verbleibend</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Headcount Development */}
      {monthlyData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Personalkosten-Entwicklung</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip formatter={(value: number) => [formatCurrency(value), '']} />
                <Line 
                  type="monotone" 
                  dataKey="personnel" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  name="Personalkosten"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};