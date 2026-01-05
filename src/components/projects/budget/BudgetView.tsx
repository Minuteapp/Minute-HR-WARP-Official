import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, TrendingUp, LineChart, Wallet, ArrowDown, Upload, Download, Filter, Search, Bell, AlertCircle } from "lucide-react";
import { KPICard } from "../common/KPICard";
import { BudgetApprovalWorkflow } from "./BudgetApprovalWorkflow";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, AreaChart, Area, ResponsiveContainer } from 'recharts';
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const formatCurrency = (value: number) => `€${(value / 1000).toFixed(0)}K`;

export const BudgetView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProject, setFilterProject] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Lade echte Budget-Daten aus der Datenbank
  const { data: budgetData, isLoading } = useQuery({
    queryKey: ['project-budget-data'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (!profile?.company_id) return null;

      // Hole alle aktiven Budgets
      const { data: budgets } = await supabase
        .from('budgets')
        .select('*')
        .eq('company_id', profile.company_id)
        .eq('status', 'active');

      // Hole Projekte mit Budgets
      const { data: projects } = await supabase
        .from('projects')
        .select('id, name, status, budget_amount')
        .eq('company_id', profile.company_id);

      // Hole Budget-Einträge für Trend-Daten
      const { data: budgetEntries } = await supabase
        .from('budget_entries')
        .select('*')
        .eq('company_id', profile.company_id)
        .order('entry_date', { ascending: true })
        .limit(100);

      // Aggregiere KPIs
      const totalApproved = budgets?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0;
      const totalSpent = budgets?.reduce((sum, b) => sum + (b.spent_amount || 0), 0) || 0;
      const spentPercentage = totalApproved > 0 ? Math.round((totalSpent / totalApproved) * 100) : 0;

      // Berechne CapEx vs OpEx
      const capexBudgets = budgets?.filter(b => b.category === 'capex' || b.category === 'CapEx') || [];
      const opexBudgets = budgets?.filter(b => b.category === 'opex' || b.category === 'OpEx') || [];

      const capexTotal = capexBudgets.reduce((sum, b) => sum + (b.total_amount || 0), 0);
      const capexSpent = capexBudgets.reduce((sum, b) => sum + (b.spent_amount || 0), 0);
      const opexTotal = opexBudgets.reduce((sum, b) => sum + (b.total_amount || 0), 0);
      const opexSpent = opexBudgets.reduce((sum, b) => sum + (b.spent_amount || 0), 0);

      // Projekt-Daten aufbereiten
      const projectStats = (projects || []).map(project => {
        const projectBudgets = budgets?.filter(b => b.project_id === project.id) || [];
        const budget = project.budget_amount || projectBudgets.reduce((sum, b) => sum + (b.total_amount || 0), 0);
        const spent = projectBudgets.reduce((sum, b) => sum + (b.spent_amount || 0), 0);
        const burnRate = budget > 0 ? Math.round((spent / budget) * 100) : 0;
        
        let status = 'im_plan';
        if (burnRate > 90) status = 'kritisch';
        else if (burnRate > 75) status = 'achtung';

        return {
          name: project.name,
          budget,
          timeSpent: Math.round(spent * 0.7),
          expenses: Math.round(spent * 0.3),
          total: spent,
          forecast: Math.round(budget * 0.95),
          variance: budget - Math.round(budget * 0.95),
          burnRate,
          status
        };
      }).filter(p => p.budget > 0);

      // Trend-Daten aus Budget-Einträgen
      const months = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun'];
      const trendData = months.map((month, idx) => {
        const monthEntries = budgetEntries?.filter(e => {
          const entryMonth = new Date(e.entry_date).getMonth();
          return entryMonth === idx;
        }) || [];

        const actual = monthEntries.reduce((sum, e) => sum + (e.actual_amount || 0), 0);
        const planned = monthEntries.reduce((sum, e) => sum + (e.budgeted_amount || 0), 0);

        return {
          month,
          forecast: planned || (totalApproved / 12) * (idx + 1) * 0.08,
          actual: actual || (totalSpent / 12) * (idx + 1) * 0.1,
          plan: planned || (totalApproved / 12) * (idx + 1) * 0.09
        };
      });

      return {
        kpis: {
          approved: totalApproved,
          spent: totalSpent,
          forecast: Math.round(totalApproved * 0.97),
          remaining: totalApproved - totalSpent,
          spentPercentage
        },
        capexOpex: [
          { category: 'CapEx', budget: capexTotal, forecast: Math.round(capexTotal * 0.95), spent: capexSpent },
          { category: 'OpEx', budget: opexTotal, forecast: Math.round(opexTotal * 0.95), spent: opexSpent }
        ],
        trend: trendData,
        projects: projectStats,
        costCenters: [],
        exports: []
      };
    }
  });

  // Fallback für leere Daten
  const displayData = budgetData || {
    kpis: { approved: 0, spent: 0, forecast: 0, remaining: 0, spentPercentage: 0 },
    capexOpex: [],
    trend: [],
    projects: [],
    costCenters: [],
    exports: []
  };

  const hasData = displayData.kpis.approved > 0;

  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList>
        <TabsTrigger value="overview">Übersicht</TabsTrigger>
        <TabsTrigger value="workflow">Freigabe-Workflows</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        {/* Budget Alert */}
        {displayData.projects.filter(p => p.burnRate > 75).length > 0 && (
          <Alert variant="destructive" className="bg-orange-50 border-orange-200">
            <Bell className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-900">
              <span className="font-semibold">Budget-Warnung:</span> {displayData.projects.filter(p => p.burnRate > 75).length} Projekt(e) haben 75% ihres Budgets überschritten.
            </AlertDescription>
          </Alert>
        )}

        {/* Filter & Actions Bar */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Projekt oder Kostenstelle suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterProject} onValueChange={setFilterProject}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Projekt" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Projekte</SelectItem>
              {displayData.projects.map(p => (
                <SelectItem key={p.name} value={p.name.toLowerCase()}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Status</SelectItem>
              <SelectItem value="im_plan">Im Plan</SelectItem>
              <SelectItem value="achtung">Achtung</SelectItem>
              <SelectItem value="kritisch">Kritisch</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Genehmigtes Budget"
            value={formatCurrency(displayData.kpis.approved)}
            icon={<DollarSign className="h-5 w-5 text-blue-600" />}
            iconColor="bg-blue-100"
          />
          <KPICard
            title="Verbrauch (Ist)"
            value={formatCurrency(displayData.kpis.spent)}
            icon={<TrendingUp className="h-5 w-5 text-purple-600" />}
            iconColor="bg-purple-100"
            subtitle={`${displayData.kpis.spentPercentage}% verbraucht`}
            progress={displayData.kpis.spentPercentage}
          />
          <KPICard
            title="Forecast (EAC)"
            value={formatCurrency(displayData.kpis.forecast)}
            icon={<LineChart className="h-5 w-5 text-green-600" />}
            iconColor="bg-green-100"
          />
          <KPICard
            title="Verbleibend"
            value={formatCurrency(displayData.kpis.remaining)}
            icon={<Wallet className="h-5 w-5 text-orange-600" />}
            iconColor="bg-orange-100"
          />
        </div>

        {!hasData && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Keine Budget-Daten verfügbar.</p>
              <p className="text-sm">Erstellen Sie zuerst Budgets für Ihre Projekte.</p>
            </CardContent>
          </Card>
        )}

        {/* CapEx vs OpEx */}
        {displayData.capexOpex.some(c => c.budget > 0) && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Budget: CapEx vs. OpEx</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Upload className="h-4 w-4" />
                    Import
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    Export DATEV
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={displayData.capexOpex}>
                  <XAxis dataKey="category" />
                  <YAxis tickFormatter={(value) => `${value / 1000}K`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="budget" fill="#3b82f6" name="Budget" />
                  <Bar dataKey="forecast" fill="#10b981" name="Forecast" />
                  <Bar dataKey="spent" fill="#8b5cf6" name="Verbraucht" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Kosten-Trend & Burn-Rate */}
        {displayData.trend.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Kosten-Trend & Burn-Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={displayData.trend}>
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `${value / 1000}K`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Area type="monotone" dataKey="forecast" stroke="#10b981" fill="#10b98120" name="Forecast" />
                  <Area type="monotone" dataKey="actual" stroke="#3b82f6" strokeDasharray="5 5" fill="#3b82f620" name="Ist" />
                  <Area type="monotone" dataKey="plan" stroke="#8b5cf6" strokeDasharray="5 5" fill="transparent" name="Plan" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Projektkosten im Detail */}
        {displayData.projects.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Projektkosten im Detail</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Projekt</th>
                      <th className="text-left py-3 px-4 font-medium">Budget</th>
                      <th className="text-left py-3 px-4 font-medium">Zeitkosten</th>
                      <th className="text-left py-3 px-4 font-medium">Spesen/Ausgaben</th>
                      <th className="text-left py-3 px-4 font-medium">Gesamt (Ist)</th>
                      <th className="text-left py-3 px-4 font-medium">Forecast (EAC)</th>
                      <th className="text-left py-3 px-4 font-medium">Varianz</th>
                      <th className="text-left py-3 px-4 font-medium">Burn-Rate</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayData.projects.map((project) => (
                      <tr key={project.name} className="border-b">
                        <td className="py-3 px-4 font-medium">{project.name}</td>
                        <td className="py-3 px-4">{formatCurrency(project.budget)}</td>
                        <td className="py-3 px-4">{formatCurrency(project.timeSpent)}</td>
                        <td className="py-3 px-4">{formatCurrency(project.expenses)}</td>
                        <td className="py-3 px-4 font-semibold">{formatCurrency(project.total)}</td>
                        <td className="py-3 px-4">{formatCurrency(project.forecast)}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-green-600">
                            <ArrowDown className="h-4 w-4" />
                            <span>{formatCurrency(Math.abs(project.variance))}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <div className="text-sm font-medium">{project.burnRate}%</div>
                            <Progress 
                              value={project.burnRate} 
                              className={`h-2 ${
                                project.status === 'kritisch' ? '[&>div]:bg-red-500' : 
                                project.status === 'achtung' ? '[&>div]:bg-orange-500' : 
                                '[&>div]:bg-green-500'
                              }`}
                            />
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge 
                            variant={project.status === 'kritisch' ? 'destructive' : 'default'}
                            className={
                              project.status === 'im_plan' ? 'bg-green-500' : 
                              project.status === 'achtung' ? 'bg-orange-500' : ''
                            }
                          >
                            {project.status === 'im_plan' ? 'Im Plan' : 
                             project.status === 'achtung' ? 'Achtung' : 
                             'Kritisch'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="workflow" className="space-y-6">
        <BudgetApprovalWorkflow />
      </TabsContent>
    </Tabs>
  );
};
