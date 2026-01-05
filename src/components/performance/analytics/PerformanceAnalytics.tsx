import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, BarChart3, PieChart, Users, Target, Download, Filter, Loader2 } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";

export const PerformanceAnalytics = () => {
  const { tenantCompany } = useTenant();
  const currentCompanyId = tenantCompany?.id;
  const [selectedPeriod, setSelectedPeriod] = useState<string>('current');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');

  // ECHTE DATEN: Laden aus Supabase mit company_id Filter
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['performance-analytics', currentCompanyId],
    queryFn: async () => {
      if (!currentCompanyId) return null;
      
      // Hole Performance Reviews für Statistiken
      const { data: reviews, error } = await supabase
        .from('performance_reviews')
        .select('status, overall_score')
        .eq('company_id', currentCompanyId);

      if (error) {
        console.error('Error fetching analytics:', error);
        return null;
      }

      const totalReviews = reviews?.length || 0;
      const completedReviews = reviews?.filter(r => r.status === 'completed').length || 0;
      const scores = reviews?.filter(r => r.overall_score).map(r => r.overall_score) || [];
      const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

      return {
        metrics: [
          {
            metric: 'Durchschnittsbewertung',
            value: avgScore.toFixed(1),
            change: 0,
            trend: 'stable' as const,
            color: 'text-green-600'
          },
          {
            metric: 'Review-Abschlussrate',
            value: totalReviews > 0 ? Math.round((completedReviews / totalReviews) * 100) : 0,
            change: 0,
            trend: 'stable' as const,
            color: 'text-blue-600'
          },
          {
            metric: 'Gesamt Reviews',
            value: totalReviews,
            change: 0,
            trend: 'stable' as const,
            color: 'text-purple-600'
          },
          {
            metric: 'Abgeschlossen',
            value: completedReviews,
            change: 0,
            trend: 'stable' as const,
            color: 'text-green-600'
          }
        ],
        performanceDistribution: calculateDistribution(scores)
      };
    },
    enabled: !!currentCompanyId
  });

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'stable': return <BarChart3 className="h-4 w-4 text-gray-600" />;
      default: return <BarChart3 className="h-4 w-4 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const hasData = analyticsData && analyticsData.metrics.some(m => Number(m.value) > 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Performance Analytics</h2>
          <p className="text-sm text-gray-500">KI-gestützte Insights und Trends</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-4">
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Zeitraum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current">Aktueller Zeitraum</SelectItem>
            <SelectItem value="q4-2024">Q4 2024</SelectItem>
            <SelectItem value="q3-2024">Q3 2024</SelectItem>
            <SelectItem value="2024">Jahr 2024</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Abteilung" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Abteilungen</SelectItem>
            <SelectItem value="engineering">Engineering</SelectItem>
            <SelectItem value="product">Product</SelectItem>
            <SelectItem value="sales">Sales</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!hasData ? (
        <Card>
          <CardContent className="py-16">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Keine Analysedaten</h3>
              <p className="text-muted-foreground">
                Es sind noch keine Performance-Daten für Analysen vorhanden.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {analyticsData.metrics.map((data, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-600">{data.metric}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-2xl font-bold">
                          {data.value}{data.metric.includes('rate') || data.metric.includes('Rate') ? '%' : ''}
                        </span>
                        <div className="flex items-center gap-1">
                          {getTrendIcon(data.trend)}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Performance Distribution */}
          {analyticsData.performanceDistribution.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Performance-Verteilung
                </CardTitle>
                <CardDescription>Verteilung der Bewertungen über alle Mitarbeiter</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.performanceDistribution.map((range, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-20 text-sm font-medium">{range.range}</div>
                      <div className="flex-1 flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                          <div 
                            className={`${range.color} h-6 rounded-full flex items-center justify-center text-white text-xs font-medium`}
                            style={{ width: `${range.percentage}%` }}
                          >
                            {range.percentage > 15 && `${range.percentage}%`}
                          </div>
                        </div>
                        <div className="w-12 text-sm text-gray-600">{range.count}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                KI-Insights & Empfehlungen
              </CardTitle>
              <CardDescription>Automatisch generierte Erkenntnisse und Handlungsempfehlungen</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>Mehr Daten erforderlich für KI-Insights.</p>
                <p className="text-sm mt-2">Insights werden automatisch generiert, sobald genügend Performance-Daten vorliegen.</p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

function calculateDistribution(scores: number[]) {
  if (scores.length === 0) return [];

  const ranges = [
    { range: '4.5 - 5.0', min: 4.5, max: 5.0, color: 'bg-green-500' },
    { range: '4.0 - 4.4', min: 4.0, max: 4.4, color: 'bg-blue-500' },
    { range: '3.5 - 3.9', min: 3.5, max: 3.9, color: 'bg-yellow-500' },
    { range: '3.0 - 3.4', min: 3.0, max: 3.4, color: 'bg-orange-500' },
    { range: '< 3.0', min: 0, max: 2.9, color: 'bg-red-500' }
  ];

  return ranges.map(range => {
    const count = scores.filter(s => s >= range.min && s <= range.max).length;
    const percentage = scores.length > 0 ? Math.round((count / scores.length) * 100) : 0;
    return { ...range, count, percentage };
  }).filter(r => r.count > 0);
}
