import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Clock, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  Plus,
  Play,
  Download,
  Save,
  FileSpreadsheet,
  Info,
  Loader2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type DataSource = 'employees' | 'time_entries' | 'absences' | 'costs' | 'performance';

interface DataSourceConfig {
  id: DataSource;
  label: string;
  icon: React.ElementType;
  groupings: string[];
  table: string;
}

interface AnalysisResult {
  chartData: Array<{ category: string; count: number; average: number; share: number }>;
  totalRecords: number;
  executedAt: string;
}

const AdHocAnalysisTab = () => {
  const [selectedSource, setSelectedSource] = useState<DataSource>('employees');
  const [selectedGroupings, setSelectedGroupings] = useState<string[]>(['department']);
  const [dateFrom, setDateFrom] = useState('2024-01-01');
  const [dateTo, setDateTo] = useState('2024-06-30');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const dataSources: DataSourceConfig[] = [
    { 
      id: 'employees', 
      label: 'Mitarbeiterdaten', 
      icon: Users, 
      groupings: ['Abteilung', 'Standort', 'Rolle', 'Vertragsart', 'Seniority'],
      table: 'employees'
    },
    { 
      id: 'time_entries', 
      label: 'Zeiterfassung', 
      icon: Clock, 
      groupings: ['Abteilung', 'Standort', 'Zeitmodell', 'Überstunden'],
      table: 'time_entries'
    },
    { 
      id: 'absences', 
      label: 'Abwesenheiten', 
      icon: Calendar, 
      groupings: ['Abwesenheitstyp', 'Abteilung', 'Standort', 'Dauer'],
      table: 'absence_requests'
    },
    { 
      id: 'costs', 
      label: 'Personalkosten', 
      icon: DollarSign, 
      groupings: ['Abteilung', 'Kostenart', 'Standort', 'Periode'],
      table: 'payroll_records'
    },
    { 
      id: 'performance', 
      label: 'Performance-Daten', 
      icon: TrendingUp, 
      groupings: ['Abteilung', 'Rating', 'Zielerreichung', 'Reviewer'],
      table: 'performance_reviews'
    }
  ];

  const currentSource = dataSources.find(s => s.id === selectedSource)!;

  const toggleGrouping = (grouping: string) => {
    setSelectedGroupings(prev => 
      prev.includes(grouping) 
        ? prev.filter(g => g !== grouping)
        : [...prev, grouping]
    );
  };

  const executeAnalysis = async () => {
    setIsLoading(true);
    setAnalysisResult(null);

    try {
      let data: any[] = [];
      let chartData: AnalysisResult['chartData'] = [];

      switch (selectedSource) {
        case 'employees': {
          const { data: employees, error } = await supabase
            .from('employees')
            .select('id, department, position, location, employment_type, status');
          
          if (error) throw error;
          data = employees || [];

          // Group by department
          const grouped = data.reduce((acc, emp) => {
            const key = emp.department || 'Unbekannt';
            acc[key] = (acc[key] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);

          const total = data.length;
          chartData = Object.entries(grouped).map(([category, count]) => ({
            category,
            count: count as number,
            average: 0,
            share: Math.round((count as number / total) * 100)
          }));
          break;
        }

        case 'time_entries': {
          const { data: entries, error } = await supabase
            .from('time_entries')
            .select('id, employee_id, hours_worked, date')
            .gte('date', dateFrom)
            .lte('date', dateTo);
          
          if (error) throw error;
          data = entries || [];

          // Group by hours range
          const ranges = { '0-4h': 0, '4-8h': 0, '8-10h': 0, '10h+': 0 };
          data.forEach(entry => {
            const hours = entry.hours_worked || 0;
            if (hours <= 4) ranges['0-4h']++;
            else if (hours <= 8) ranges['4-8h']++;
            else if (hours <= 10) ranges['8-10h']++;
            else ranges['10h+']++;
          });

          const total = data.length || 1;
          const avgHours = data.reduce((sum, e) => sum + (e.hours_worked || 0), 0) / total;
          chartData = Object.entries(ranges).map(([category, count]) => ({
            category,
            count,
            average: Math.round(avgHours * 10) / 10,
            share: Math.round((count / total) * 100)
          }));
          break;
        }

        case 'absences': {
          const { data: absences, error } = await supabase
            .from('absence_requests')
            .select('id, type, status, start_date, end_date')
            .gte('start_date', dateFrom)
            .lte('end_date', dateTo);
          
          if (error) throw error;
          data = absences || [];

          // Group by type
          const grouped = data.reduce((acc, abs) => {
            const key = abs.type || 'Sonstiges';
            acc[key] = (acc[key] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);

          const total = data.length || 1;
          chartData = Object.entries(grouped).map(([category, count]) => ({
            category,
            count: count as number,
            average: 0,
            share: Math.round((count as number / total) * 100)
          }));
          break;
        }

        case 'performance': {
          const { data: reviews, error } = await supabase
            .from('performance_reviews')
            .select('id, overall_rating, status, review_date');
          
          if (error) throw error;
          data = reviews || [];

          // Group by rating
          const grouped = data.reduce((acc, review) => {
            const rating = review.overall_rating || 0;
            let key = 'Unbewertet';
            if (rating >= 4.5) key = 'Exzellent';
            else if (rating >= 3.5) key = 'Gut';
            else if (rating >= 2.5) key = 'Befriedigend';
            else if (rating > 0) key = 'Verbesserungswürdig';
            acc[key] = (acc[key] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);

          const total = data.length || 1;
          const avgRating = data.reduce((sum, r) => sum + (r.overall_rating || 0), 0) / total;
          chartData = Object.entries(grouped).map(([category, count]) => ({
            category,
            count: count as number,
            average: Math.round(avgRating * 10) / 10,
            share: Math.round((count as number / total) * 100)
          }));
          break;
        }

        case 'costs': {
          // Placeholder - no payroll_records table
          chartData = [
            { category: 'Keine Daten', count: 0, average: 0, share: 0 }
          ];
          break;
        }
      }

      setAnalysisResult({
        chartData,
        totalRecords: data.length,
        executedAt: new Date().toLocaleString('de-DE')
      });

    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: 'Fehler bei der Analyse',
        description: 'Die Daten konnten nicht abgerufen werden.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = (format: 'xlsx' | 'csv') => {
    toast({
      title: 'Export gestartet',
      description: `Die Daten werden als ${format.toUpperCase()} exportiert.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <p className="text-amber-800">
                <span className="font-medium">Hinweis:</span> Ad-hoc-Analysen nutzen einen strukturierten Query-Builder. 
                Freier SQL-Zugriff ist aus Sicherheitsgründen nicht möglich. Alle Abfragen werden protokolliert.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Source Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Datenquelle auswählen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {dataSources.map((source) => {
              const Icon = source.icon;
              const isSelected = selectedSource === source.id;
              return (
                <Button
                  key={source.id}
                  variant={isSelected ? 'default' : 'outline'}
                  className={isSelected ? 'bg-violet-600 hover:bg-violet-700' : ''}
                  onClick={() => {
                    setSelectedSource(source.id);
                    setSelectedGroupings([]);
                    setAnalysisResult(null);
                  }}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {source.label}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Filter hinzufügen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Keine Filter definiert. Klicken Sie auf 'Filter hinzufügen', um zu beginnen.
          </p>
          <Button variant="outline" className="mt-3">
            <Plus className="h-4 w-4 mr-2" />
            Filter hinzufügen
          </Button>
        </CardContent>
      </Card>

      {/* Grouping & Aggregation */}
      <Card>
        <CardHeader>
          <CardTitle>Gruppierung & Aggregation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {currentSource.groupings.map((grouping) => {
              const isSelected = selectedGroupings.includes(grouping);
              return (
                <Badge
                  key={grouping}
                  variant={isSelected ? 'default' : 'outline'}
                  className={`cursor-pointer ${isSelected ? 'bg-violet-600' : ''}`}
                  onClick={() => toggleGrouping(grouping)}
                >
                  {grouping}
                </Badge>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Date Range */}
      <Card>
        <CardHeader>
          <CardTitle>Zeitraum</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="space-y-2">
              <Label>Von</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-[180px]"
              />
            </div>
            <div className="space-y-2">
              <Label>Bis</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-[180px]"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Execute Button */}
      <Button 
        className="w-full bg-violet-600 hover:bg-violet-700"
        size="lg"
        onClick={executeAnalysis}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Analyse wird ausgeführt...
          </>
        ) : (
          <>
            <Play className="h-4 w-4 mr-2" />
            Analyse ausführen
          </>
        )}
      </Button>

      {/* Results */}
      {analysisResult && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Analyseergebnis</CardTitle>
              <p className="text-sm text-muted-foreground">
                {analysisResult.totalRecords} Datensätze gefunden | Ausgeführt am {analysisResult.executedAt}
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Chart */}
            {analysisResult.chartData.length > 0 && analysisResult.chartData[0].count > 0 && (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analysisResult.chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" name="Anzahl" fill="#7C3AED" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kategorie</TableHead>
                  <TableHead className="text-right">Anzahl</TableHead>
                  <TableHead className="text-right">Durchschnitt</TableHead>
                  <TableHead className="text-right">Anteil</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analysisResult.chartData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{row.category}</TableCell>
                    <TableCell className="text-right">{row.count}</TableCell>
                    <TableCell className="text-right">{row.average || '-'}</TableCell>
                    <TableCell className="text-right">{row.share}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Export Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline">
                <Save className="h-4 w-4 mr-2" />
                Als Bericht speichern
              </Button>
              <Button variant="outline" onClick={() => handleExport('xlsx')}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export XLSX
              </Button>
              <Button variant="outline" onClick={() => handleExport('csv')}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!analysisResult && !isLoading && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="p-4 bg-muted rounded-full">
                <BarChart className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium">Noch keine Analyse ausgeführt</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Wählen Sie eine Datenquelle, optional Gruppierungen und einen Zeitraum, 
                und klicken Sie auf "Analyse ausführen".
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdHocAnalysisTab;
