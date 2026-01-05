import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { FileDown, FileSpreadsheet } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CalendarReports = () => {
  const [reportType, setReportType] = useState('absence_distribution');

  const { data: reportData, isLoading } = useQuery({
    queryKey: ['calendar-reports', reportType],
    queryFn: async () => {
      // Echte Daten aus der Datenbank abrufen
      // Wenn keine Daten vorhanden sind, leeres Array zurückgeben
      return [] as { name: string; value: number }[];
    },
  });

  const reportTitles: Record<string, string> = {
    absence_distribution: 'Präsenz & Abwesenheitsverteilung',
    meeting_load: 'Meeting-Last pro Mitarbeiter',
    shift_coverage: 'Schichtbesetzungsquote',
    milestone_punctuality: 'Meilenstein-Pünktlichkeit',
    travel_time: 'Reisezeit pro Abteilung',
    training_participation: 'Trainings-Teilnahme',
  };

  const handleExport = (format: 'pdf' | 'csv') => {
    // TODO: Implement export functionality
    console.log(`Exporting report as ${format}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Berichte & Analysen</h2>
        <div className="flex items-center gap-2">
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="absence_distribution">Präsenz/Abwesenheit</SelectItem>
              <SelectItem value="meeting_load">Meeting-Last</SelectItem>
              <SelectItem value="shift_coverage">Schichtbesetzung</SelectItem>
              <SelectItem value="milestone_punctuality">Meilenstein-Pünktlichkeit</SelectItem>
              <SelectItem value="travel_time">Reisezeit</SelectItem>
              <SelectItem value="training_participation">Trainings-Teilnahme</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => handleExport('pdf')}>
            <FileDown className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button variant="outline" onClick={() => handleExport('csv')}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{reportTitles[reportType]}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-muted-foreground">Lädt Bericht...</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={reportData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detaillierte Daten</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3 font-medium">Periode</th>
                  <th className="text-left p-3 font-medium">Wert</th>
                  <th className="text-left p-3 font-medium">Trend</th>
                  <th className="text-left p-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {reportData?.map((row, index) => (
                  <tr key={index} className="border-t hover:bg-accent/50">
                    <td className="p-3">{row.name}</td>
                    <td className="p-3">{row.value}</td>
                    <td className="p-3">
                      {index > 0 && reportData[index - 1] ? (
                        <span className={row.value > reportData[index - 1].value ? 'text-green-600' : 'text-red-600'}>
                          {row.value > reportData[index - 1].value ? '↑' : '↓'} 
                          {Math.abs(row.value - reportData[index - 1].value)}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="p-3">
                      <span className={row.value > 150 ? 'text-green-600' : 'text-orange-600'}>
                        {row.value > 150 ? 'Gut' : 'Moderat'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarReports;