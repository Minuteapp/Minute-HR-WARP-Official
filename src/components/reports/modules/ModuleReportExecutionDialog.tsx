import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Download, FileSpreadsheet, FileText, Loader2, 
  Calendar, Play, AlertCircle 
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format, parseISO, subMonths } from 'date-fns';
import { de } from 'date-fns/locale';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ModuleReportExecutionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportId: string;
  reportTitle: string;
  moduleId: string;
  moduleColor: string;
}

const ModuleReportExecutionDialog: React.FC<ModuleReportExecutionDialogProps> = ({
  open,
  onOpenChange,
  reportId,
  reportTitle,
  moduleId,
  moduleColor,
}) => {
  const { user } = useAuth();
  const companyId = user?.company_id;
  
  const [startDate, setStartDate] = useState(format(subMonths(new Date(), 1), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [hasExecuted, setHasExecuted] = useState(false);

  // Report data query
  const { data: reportData, isLoading, refetch } = useQuery({
    queryKey: ['module-report-execution', reportId, companyId, startDate, endDate],
    queryFn: async () => {
      if (!companyId) return { columns: [], rows: [] };
      
      return await fetchReportData(reportId, companyId, startDate, endDate);
    },
    enabled: !!companyId && hasExecuted,
  });

  const fetchReportData = async (
    reportId: string, 
    companyId: string, 
    startDate: string, 
    endDate: string
  ): Promise<{ columns: string[]; rows: Record<string, unknown>[] }> => {
    switch (reportId) {
      // Employee reports
      case 'emp-overview': {
        const { data, error } = await supabase
          .from('employees')
          .select('first_name, last_name, email, position, department, hire_date, status')
          .eq('company_id', companyId)
          .order('last_name');
        
        if (error) throw error;
        return {
          columns: ['Vorname', 'Nachname', 'E-Mail', 'Position', 'Abteilung', 'Eintrittsdatum', 'Status'],
          rows: (data || []).map(e => ({
            Vorname: e.first_name,
            Nachname: e.last_name,
            'E-Mail': e.email,
            Position: e.position || '-',
            Abteilung: e.department || '-',
            Eintrittsdatum: e.hire_date ? format(parseISO(e.hire_date), 'dd.MM.yyyy') : '-',
            Status: e.status || 'aktiv',
          })),
        };
      }

      case 'emp-contracts': {
        const { data, error } = await supabase
          .from('employees')
          .select('first_name, last_name, contract_type, contract_end_date, hire_date')
          .eq('company_id', companyId)
          .order('contract_end_date', { ascending: true, nullsFirst: false });
        
        if (error) throw error;
        return {
          columns: ['Mitarbeiter', 'Vertragsart', 'Vertragsbeginn', 'Vertragsende'],
          rows: (data || []).map(e => ({
            Mitarbeiter: `${e.first_name} ${e.last_name}`,
            Vertragsart: e.contract_type || 'Unbefristet',
            Vertragsbeginn: e.hire_date ? format(parseISO(e.hire_date), 'dd.MM.yyyy') : '-',
            Vertragsende: e.contract_end_date ? format(parseISO(e.contract_end_date), 'dd.MM.yyyy') : 'Unbefristet',
          })),
        };
      }

      case 'emp-birthdays': {
        const { data, error } = await supabase
          .from('employees')
          .select('first_name, last_name, birth_date, department')
          .eq('company_id', companyId)
          .not('birth_date', 'is', null)
          .order('birth_date');
        
        if (error) throw error;
        return {
          columns: ['Mitarbeiter', 'Geburtstag', 'Abteilung'],
          rows: (data || []).map(e => ({
            Mitarbeiter: `${e.first_name} ${e.last_name}`,
            Geburtstag: e.birth_date ? format(parseISO(e.birth_date), 'dd.MM.') : '-',
            Abteilung: e.department || '-',
          })),
        };
      }

      case 'emp-anniversaries': {
        const { data, error } = await supabase
          .from('employees')
          .select('first_name, last_name, hire_date, department')
          .eq('company_id', companyId)
          .not('hire_date', 'is', null)
          .order('hire_date');
        
        if (error) throw error;
        
        const now = new Date();
        return {
          columns: ['Mitarbeiter', 'Eintrittsdatum', 'Jahre im Unternehmen', 'Abteilung'],
          rows: (data || []).map(e => {
            const hireDate = parseISO(e.hire_date);
            const years = Math.floor((now.getTime() - hireDate.getTime()) / (1000 * 60 * 60 * 24 * 365));
            return {
              Mitarbeiter: `${e.first_name} ${e.last_name}`,
              Eintrittsdatum: format(hireDate, 'dd.MM.yyyy'),
              'Jahre im Unternehmen': years,
              Abteilung: e.department || '-',
            };
          }),
        };
      }

      // Time & Absence reports
      case 'time-monthly': {
        const { data, error } = await supabase
          .from('time_entries')
          .select('employee_id, date, hours, employees(first_name, last_name)')
          .eq('company_id', companyId)
          .gte('date', startDate)
          .lte('date', endDate);
        
        if (error) throw error;
        
        // Aggregate by employee
        const aggregated: Record<string, { name: string; hours: number; days: number }> = {};
        (data || []).forEach((entry: any) => {
          const empId = entry.employee_id;
          if (!aggregated[empId]) {
            aggregated[empId] = {
              name: entry.employees ? `${entry.employees.first_name} ${entry.employees.last_name}` : 'Unbekannt',
              hours: 0,
              days: 0,
            };
          }
          aggregated[empId].hours += entry.hours || 0;
          aggregated[empId].days += 1;
        });
        
        return {
          columns: ['Mitarbeiter', 'Arbeitstage', 'Gesamtstunden', 'Ø Stunden/Tag'],
          rows: Object.values(aggregated).map(a => ({
            Mitarbeiter: a.name,
            Arbeitstage: a.days,
            Gesamtstunden: a.hours.toFixed(1),
            'Ø Stunden/Tag': a.days > 0 ? (a.hours / a.days).toFixed(1) : '0',
          })),
        };
      }

      case 'absence-summary': {
        const { data: absences, error: absError } = await supabase
          .from('absence_requests')
          .select('user_id, absence_type, start_date, end_date, status')
          .eq('company_id', companyId)
          .gte('start_date', startDate)
          .lte('end_date', endDate);
        
        if (absError) throw absError;
        
        const { data: sickLeaves, error: sickError } = await supabase
          .from('sick_leaves')
          .select('employee_id, start_date, end_date, status')
          .eq('company_id', companyId)
          .gte('start_date', startDate)
          .lte('end_date', endDate);
        
        if (sickError) throw sickError;
        
        // Aggregate by type
        const summary: Record<string, { count: number; days: number }> = {
          Urlaub: { count: 0, days: 0 },
          Krankheit: { count: 0, days: 0 },
          Sonstiges: { count: 0, days: 0 },
        };
        
        (absences || []).forEach((a: any) => {
          const type = a.absence_type?.toLowerCase().includes('urlaub') ? 'Urlaub' : 
                       a.absence_type?.toLowerCase().includes('krank') ? 'Krankheit' : 'Sonstiges';
          const days = Math.ceil((new Date(a.end_date).getTime() - new Date(a.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1;
          summary[type].count += 1;
          summary[type].days += days;
        });
        
        (sickLeaves || []).forEach((s: any) => {
          const days = Math.ceil((new Date(s.end_date).getTime() - new Date(s.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1;
          summary.Krankheit.count += 1;
          summary.Krankheit.days += days;
        });
        
        return {
          columns: ['Abwesenheitsart', 'Anzahl', 'Tage gesamt'],
          rows: Object.entries(summary).map(([type, data]) => ({
            Abwesenheitsart: type,
            Anzahl: data.count,
            'Tage gesamt': data.days,
          })),
        };
      }

      case 'overtime-report': {
        const { data, error } = await supabase
          .from('time_entries')
          .select('employee_id, hours, overtime_hours, employees(first_name, last_name)')
          .eq('company_id', companyId)
          .gte('date', startDate)
          .lte('date', endDate);
        
        if (error) throw error;
        
        const aggregated: Record<string, { name: string; overtime: number }> = {};
        (data || []).forEach((entry: any) => {
          const empId = entry.employee_id;
          if (!aggregated[empId]) {
            aggregated[empId] = {
              name: entry.employees ? `${entry.employees.first_name} ${entry.employees.last_name}` : 'Unbekannt',
              overtime: 0,
            };
          }
          aggregated[empId].overtime += entry.overtime_hours || 0;
        });
        
        return {
          columns: ['Mitarbeiter', 'Überstunden'],
          rows: Object.values(aggregated)
            .filter(a => a.overtime > 0)
            .sort((a, b) => b.overtime - a.overtime)
            .map(a => ({
              Mitarbeiter: a.name,
              Überstunden: a.overtime.toFixed(1),
            })),
        };
      }

      case 'vacation-balance': {
        const { data, error } = await supabase
          .from('absence_quotas')
          .select('user_id, total_days, used_days, remaining_days')
          .eq('company_id', companyId)
          .eq('absence_type', 'urlaub')
          .eq('quota_year', new Date().getFullYear());
        
        if (error) throw error;
        
        return {
          columns: ['Mitarbeiter-ID', 'Gesamtanspruch', 'Verbraucht', 'Verbleibend'],
          rows: (data || []).map(q => ({
            'Mitarbeiter-ID': q.user_id?.substring(0, 8) + '...',
            Gesamtanspruch: q.total_days,
            Verbraucht: q.used_days || 0,
            Verbleibend: q.remaining_days || (q.total_days - (q.used_days || 0)),
          })),
        };
      }

      // Recruiting reports
      case 'rec-funnel': {
        const { data, error } = await supabase
          .from('job_applications')
          .select('status')
          .eq('company_id', companyId)
          .gte('created_at', startDate)
          .lte('created_at', endDate);
        
        if (error) throw error;
        
        const statusCounts: Record<string, number> = {};
        (data || []).forEach((a: any) => {
          const status = a.status || 'Neu';
          statusCounts[status] = (statusCounts[status] || 0) + 1;
        });
        
        return {
          columns: ['Status', 'Anzahl Bewerbungen', 'Anteil'],
          rows: Object.entries(statusCounts).map(([status, count]) => ({
            Status: status,
            'Anzahl Bewerbungen': count,
            Anteil: `${((count / (data?.length || 1)) * 100).toFixed(1)}%`,
          })),
        };
      }

      case 'rec-sources': {
        const { data, error } = await supabase
          .from('job_applications')
          .select('source')
          .eq('company_id', companyId)
          .gte('created_at', startDate)
          .lte('created_at', endDate);
        
        if (error) throw error;
        
        const sourceCounts: Record<string, number> = {};
        (data || []).forEach((a: any) => {
          const source = a.source || 'Unbekannt';
          sourceCounts[source] = (sourceCounts[source] || 0) + 1;
        });
        
        return {
          columns: ['Quelle', 'Anzahl', 'Anteil'],
          rows: Object.entries(sourceCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([source, count]) => ({
              Quelle: source,
              Anzahl: count,
              Anteil: `${((count / (data?.length || 1)) * 100).toFixed(1)}%`,
            })),
        };
      }

      // Performance reports
      case 'perf-overview': {
        const { data, error } = await supabase
          .from('performance_reviews')
          .select('employee_id, review_date, overall_rating, status, employees(first_name, last_name)')
          .eq('company_id', companyId)
          .gte('review_date', startDate)
          .lte('review_date', endDate)
          .order('review_date', { ascending: false });
        
        if (error) throw error;
        
        return {
          columns: ['Mitarbeiter', 'Bewertungsdatum', 'Gesamtbewertung', 'Status'],
          rows: (data || []).map((r: any) => ({
            Mitarbeiter: r.employees ? `${r.employees.first_name} ${r.employees.last_name}` : 'Unbekannt',
            Bewertungsdatum: r.review_date ? format(parseISO(r.review_date), 'dd.MM.yyyy') : '-',
            Gesamtbewertung: r.overall_rating || '-',
            Status: r.status || 'Ausstehend',
          })),
        };
      }

      case 'perf-ratings': {
        const { data, error } = await supabase
          .from('performance_reviews')
          .select('overall_rating')
          .eq('company_id', companyId)
          .gte('review_date', startDate)
          .lte('review_date', endDate);
        
        if (error) throw error;
        
        const ratingCounts: Record<string, number> = {};
        (data || []).forEach((r: any) => {
          const rating = r.overall_rating?.toString() || 'Nicht bewertet';
          ratingCounts[rating] = (ratingCounts[rating] || 0) + 1;
        });
        
        return {
          columns: ['Bewertung', 'Anzahl', 'Anteil'],
          rows: Object.entries(ratingCounts)
            .sort((a, b) => b[0].localeCompare(a[0]))
            .map(([rating, count]) => ({
              Bewertung: rating,
              Anzahl: count,
              Anteil: `${((count / (data?.length || 1)) * 100).toFixed(1)}%`,
            })),
        };
      }

      // Project reports
      case 'proj-status': {
        const { data, error } = await supabase
          .from('projects')
          .select('name, status, start_date, end_date, budget')
          .eq('company_id', companyId)
          .order('start_date', { ascending: false });
        
        if (error) throw error;
        
        return {
          columns: ['Projekt', 'Status', 'Startdatum', 'Enddatum', 'Budget'],
          rows: (data || []).map(p => ({
            Projekt: p.name,
            Status: p.status || 'Geplant',
            Startdatum: p.start_date ? format(parseISO(p.start_date), 'dd.MM.yyyy') : '-',
            Enddatum: p.end_date ? format(parseISO(p.end_date), 'dd.MM.yyyy') : '-',
            Budget: p.budget ? `${p.budget.toLocaleString('de-DE')} €` : '-',
          })),
        };
      }

      default:
        return { columns: ['Hinweis'], rows: [{ Hinweis: 'Für diesen Berichtstyp sind noch keine Daten verfügbar.' }] };
    }
  };

  const handleExecute = () => {
    setHasExecuted(true);
    refetch();
  };

  const exportToExcel = () => {
    if (!reportData?.rows.length) return;
    
    const worksheet = XLSX.utils.json_to_sheet(reportData.rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Bericht');
    XLSX.writeFile(workbook, `${reportTitle}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    toast.success('Excel-Export erfolgreich');
  };

  const exportToPDF = () => {
    if (!reportData?.rows.length) return;
    
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(reportTitle, 14, 20);
    doc.setFontSize(10);
    doc.text(`Zeitraum: ${format(parseISO(startDate), 'dd.MM.yyyy', { locale: de })} - ${format(parseISO(endDate), 'dd.MM.yyyy', { locale: de })}`, 14, 28);
    doc.text(`Erstellt am: ${format(new Date(), 'dd.MM.yyyy HH:mm', { locale: de })}`, 14, 34);
    
    autoTable(doc, {
      head: [reportData.columns],
      body: reportData.rows.map(row => reportData.columns.map(col => String(row[col] || ''))),
      startY: 42,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
    });
    
    doc.save(`${reportTitle}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    toast.success('PDF-Export erfolgreich');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className={`h-5 w-5 ${moduleColor}`} />
            {reportTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Date Range Filter */}
          <div className="flex flex-wrap items-end gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Von
              </Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-40"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Bis
              </Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-40"
              />
            </div>
            <Button onClick={handleExecute} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Bericht ausführen
            </Button>
          </div>

          {/* Results */}
          {hasExecuted && (
            <>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : reportData?.rows.length ? (
                <>
                  {/* Export Buttons & Stats */}
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">
                      {reportData.rows.length} Datensätze
                    </Badge>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={exportToExcel}>
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Excel
                      </Button>
                      <Button variant="outline" size="sm" onClick={exportToPDF}>
                        <Download className="h-4 w-4 mr-2" />
                        PDF
                      </Button>
                    </div>
                  </div>

                  {/* Data Table */}
                  <ScrollArea className="h-[400px] border rounded-lg">
                    <Table>
                      <TableHeader className="sticky top-0 bg-background">
                        <TableRow>
                          {reportData.columns.map((col) => (
                            <TableHead key={col}>{col}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.rows.map((row, idx) => (
                          <TableRow key={idx}>
                            {reportData.columns.map((col) => (
                              <TableCell key={col}>{String(row[col] ?? '-')}</TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <AlertCircle className="h-8 w-8 mb-2" />
                  <p>Keine Daten für den ausgewählten Zeitraum gefunden.</p>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModuleReportExecutionDialog;
