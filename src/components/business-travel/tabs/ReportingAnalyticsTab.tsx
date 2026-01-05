import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  BarChart3, RefreshCw, Download, TrendingUp, Car, Building, Utensils, MoreHorizontal,
  CheckCircle, Clock, FileText, Send
} from 'lucide-react';

interface ExpenseByCategory {
  category: string;
  amount: number;
  color: string;
}

interface StatusDistribution {
  status: string;
  count: number;
  percentage: number;
  color: string;
}

export function ReportingAnalyticsTab() {
  const [activeSubTab, setActiveSubTab] = useState('overview');

  // Fetch expense data for reporting
  const { data: expenseStats, isLoading } = useQuery({
    queryKey: ['expense-reporting-stats'],
    queryFn: async () => {
      // Fetch business trip expenses
      const { data: expenses, error } = await supabase
        .from('business_trip_expenses')
        .select('category, amount, status');

      if (error) throw error;

      // Calculate category totals
      const categoryTotals: Record<string, number> = {};
      const statusCounts: Record<string, number> = {};
      let totalAmount = 0;
      let totalCount = 0;

      (expenses || []).forEach((expense: any) => {
        const amount = Number(expense.amount) || 0;
        totalAmount += amount;
        totalCount++;

        // Category
        const category = expense.category || 'Sonstige';
        categoryTotals[category] = (categoryTotals[category] || 0) + amount;

        // Status
        const status = expense.status || 'draft';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });

      // Map to categories
      const categories: ExpenseByCategory[] = [
        { category: 'Transport', amount: categoryTotals['Transport'] || categoryTotals['transport'] || 0, color: 'bg-blue-500' },
        { category: 'Unterkunft', amount: categoryTotals['Unterkunft'] || categoryTotals['accommodation'] || 0, color: 'bg-blue-700' },
        { category: 'Verpflegung', amount: categoryTotals['Verpflegung'] || categoryTotals['meals'] || 0, color: 'bg-blue-400' },
        { category: 'Sonstige', amount: categoryTotals['Sonstige'] || categoryTotals['other'] || 0, color: 'bg-blue-200' },
      ];

      // Map to status distribution
      const statuses: StatusDistribution[] = [
        { 
          status: 'paid', 
          count: statusCounts['paid'] || 0, 
          percentage: totalCount > 0 ? Math.round((statusCounts['paid'] || 0) / totalCount * 100) : 0,
          color: 'bg-blue-700' 
        },
        { 
          status: 'approved', 
          count: statusCounts['approved'] || 0, 
          percentage: totalCount > 0 ? Math.round((statusCounts['approved'] || 0) / totalCount * 100) : 0,
          color: 'bg-green-500' 
        },
        { 
          status: 'submitted', 
          count: statusCounts['submitted'] || statusCounts['pending'] || 0, 
          percentage: totalCount > 0 ? Math.round(((statusCounts['submitted'] || 0) + (statusCounts['pending'] || 0)) / totalCount * 100) : 0,
          color: 'bg-orange-500' 
        },
        { 
          status: 'draft', 
          count: statusCounts['draft'] || 0, 
          percentage: totalCount > 0 ? Math.round((statusCounts['draft'] || 0) / totalCount * 100) : 0,
          color: 'bg-gray-400' 
        },
      ];

      return {
        categories,
        statuses,
        totalAmount,
        totalCount
      };
    }
  });

  const maxCategoryAmount = Math.max(...(expenseStats?.categories || []).map(c => c.amount), 1);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid': return 'Bezahlt';
      case 'approved': return 'Genehmigt';
      case 'submitted': return 'Eingereicht';
      case 'draft': return 'Entwurf';
      default: return status;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-700 border-green-200">Genehmigt</Badge>;
      case 'submitted':
        return <Badge className="bg-orange-100 text-orange-700 border-orange-200">Eingereicht</Badge>;
      default:
        return null;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Transport': return <Car className="h-4 w-4" />;
      case 'Unterkunft': return <Building className="h-4 w-4" />;
      case 'Verpflegung': return <Utensils className="h-4 w-4" />;
      default: return <MoreHorizontal className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <BarChart3 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Reporting & Analytics</h2>
            <p className="text-muted-foreground">
              Erweiterte Analysen und benutzerdefinierte Berichte
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Aktualisieren
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Sub-Tabs */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList>
          <TabsTrigger value="overview" className="data-[state=active]:bg-foreground data-[state=active]:text-background">
            Übersicht
          </TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Berichte</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Expenses by Category */}
            <Card>
              <CardHeader>
                <CardTitle>Ausgaben nach Kategorie</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {expenseStats?.categories.map((category) => (
                  <div key={category.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(category.category)}
                        <span className="text-sm font-medium">{category.category}</span>
                      </div>
                      <span className="text-sm font-medium">
                        {category.amount.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${category.color} rounded-full transition-all`}
                        style={{ width: `${(category.amount / maxCategoryAmount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
                
                {(!expenseStats?.categories || expenseStats.categories.every(c => c.amount === 0)) && (
                  <p className="text-muted-foreground text-center py-4">
                    Keine Ausgabendaten vorhanden
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Status Verteilung</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {expenseStats?.statuses.map((status) => (
                  <div key={status.status} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{getStatusLabel(status.status)}</span>
                        {getStatusBadge(status.status)}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {status.count} Berichte
                        </span>
                        <span className="text-sm font-medium">{status.percentage}%</span>
                      </div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${status.color} rounded-full transition-all`}
                        style={{ width: `${status.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}

                {(!expenseStats?.statuses || expenseStats.statuses.every(s => s.count === 0)) && (
                  <p className="text-muted-foreground text-center py-4">
                    Keine Statusdaten vorhanden
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Summary Cards */}
          <div className="grid md:grid-cols-4 gap-4 mt-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Gesamtausgaben</p>
                    <p className="text-2xl font-bold">
                      {(expenseStats?.totalAmount || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-primary opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Anzahl Berichte</p>
                    <p className="text-2xl font-bold">{expenseStats?.totalCount || 0}</p>
                  </div>
                  <FileText className="h-8 w-8 text-primary opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Genehmigt</p>
                    <p className="text-2xl font-bold text-green-600">
                      {expenseStats?.statuses.find(s => s.status === 'approved')?.count || 0}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Ausstehend</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {expenseStats?.statuses.find(s => s.status === 'submitted')?.count || 0}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-600 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Analytics Dashboard</p>
              <p className="text-muted-foreground">Detaillierte Analysen werden hier angezeigt</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Benutzerdefinierte Berichte</p>
              <p className="text-muted-foreground">Erstellen Sie individuelle Berichte</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="mt-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Download className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Daten exportieren</p>
              <p className="text-muted-foreground">Exportieren Sie Daten in verschiedenen Formaten</p>
              <div className="flex gap-2 mt-4">
                <Button variant="outline">CSV</Button>
                <Button variant="outline">Excel</Button>
                <Button variant="outline">PDF</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}