import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Download, 
  Plus, 
  Play, 
  Pencil, 
  Trash2, 
  FileText, 
  FileSpreadsheet,
  Calendar,
  Mail,
  Clock,
  CheckCircle,
  Send
} from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface ScheduledReport {
  id: string;
  title: string;
  format: 'PDF' | 'XLSX' | 'CSV';
  frequency: string;
  nextRun: string;
  recipients: string[];
  isActive: boolean;
}

interface ExportHistoryItem {
  id: string;
  date: string;
  reportName: string;
  format: string;
  user: string;
  status: 'success' | 'failed' | 'pending';
}

const ExportDistributionTab = () => {
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([
    {
      id: '1',
      title: 'HR-Monatsbericht',
      format: 'PDF',
      frequency: 'Monatlich',
      nextRun: '01.01.2025',
      recipients: ['hr@unternehmen.de', 'ceo@unternehmen.de'],
      isActive: true
    },
    {
      id: '2',
      title: 'Abwesenheitsübersicht',
      format: 'XLSX',
      frequency: 'Wöchentlich',
      nextRun: '30.12.2024',
      recipients: ['team-leads@unternehmen.de'],
      isActive: true
    },
    {
      id: '3',
      title: 'Performance-Report',
      format: 'PDF',
      frequency: 'Quartalsweise',
      nextRun: '01.04.2025',
      recipients: ['management@unternehmen.de'],
      isActive: false
    }
  ]);

  // Fetch reports for export history
  const { data: reports } = useQuery({
    queryKey: ['reports-export-history'],
    queryFn: async () => {
      const { data } = await supabase
        .from('reports')
        .select('id, title, type, created_at, created_by, status')
        .order('created_at', { ascending: false })
        .limit(20);
      return data || [];
    }
  });

  const exportHistory: ExportHistoryItem[] = reports?.map((report, index) => ({
    id: report.id,
    date: format(new Date(report.created_at), 'dd.MM.yyyy HH:mm', { locale: de }),
    reportName: report.title,
    format: index % 3 === 0 ? 'PDF' : index % 3 === 1 ? 'XLSX' : 'CSV',
    user: 'System',
    status: 'success' as const
  })) || [];

  const toggleReportActive = (id: string) => {
    setScheduledReports(prev => 
      prev.map(report => 
        report.id === id ? { ...report, isActive: !report.isActive } : report
      )
    );
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'PDF': return <FileText className="h-4 w-4 text-red-500" />;
      case 'XLSX': return <FileSpreadsheet className="h-4 w-4 text-green-600" />;
      case 'CSV': return <FileText className="h-4 w-4 text-blue-500" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Export & Verteilung</h3>
          <p className="text-sm text-muted-foreground">
            Planen Sie automatische Berichte und verwalten Sie Exporte
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Jetzt exportieren
          </Button>
          <Button className="bg-violet-600 hover:bg-violet-700">
            <Plus className="h-4 w-4 mr-2" />
            Neuen Bericht planen
          </Button>
        </div>
      </div>

      {/* Scheduled Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-violet-600" />
            Geplante Berichte & Verteilung
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Automatisierte Berichtserstellung und Versand an Empfänger
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {scheduledReports.map((report) => (
            <div 
              key={report.id} 
              className="flex items-center justify-between p-4 border rounded-lg bg-card"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium">{report.title}</h4>
                  <Badge variant={report.isActive ? "default" : "secondary"}>
                    {report.isActive ? 'Aktiv' : 'Inaktiv'}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                  <span className="flex items-center gap-1">
                    {getFormatIcon(report.format)}
                    {report.format}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {report.frequency}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Nächste Ausführung: {report.nextRun}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Empfänger:</span>
                  {report.recipients.map((email, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {email}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Play className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Switch 
                  checked={report.isActive}
                  onCheckedChange={() => toggleReportActive(report.id)}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Export History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-violet-600" />
            Export-Verlauf
          </CardTitle>
        </CardHeader>
        <CardContent>
          {exportHistory.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Datum & Uhrzeit</TableHead>
                  <TableHead>Bericht</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Benutzer</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exportHistory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.date}</TableCell>
                    <TableCell>{item.reportName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getFormatIcon(item.format)}
                        {item.format}
                      </div>
                    </TableCell>
                    <TableCell>{item.user}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className="bg-green-50 text-green-700 border-green-200"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Erfolgreich
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Send className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Noch keine Exporte vorhanden</p>
              <p className="text-sm">Exportieren Sie einen Bericht, um den Verlauf zu sehen</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExportDistributionTab;
