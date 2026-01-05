import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Download, Calendar, FileSpreadsheet } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface AbsenceExportButtonProps {
  employeeId?: string;
  year?: number;
}

export const AbsenceExportButton: React.FC<AbsenceExportButtonProps> = ({
  employeeId,
  year = new Date().getFullYear()
}) => {
  const { user } = useAuth();
  const [isExporting, setIsExporting] = useState(false);

  const generateICalEvent = (absence: any): string => {
    const formatDate = (date: string) => {
      const d = new Date(date);
      return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const uid = `absence-${absence.id}@hrflow.app`;
    const dtstamp = formatDate(new Date().toISOString().split('T')[0]);
    const dtstart = absence.start_date.replace(/-/g, '');
    const dtend = absence.end_date.replace(/-/g, '');

    const typeLabels: Record<string, string> = {
      vacation: 'Urlaub',
      sick: 'Krankheit',
      sick_leave: 'Krankheit',
      homeoffice: 'Homeoffice',
      training: 'Fortbildung',
      parental: 'Elternzeit',
      business_trip: 'Dienstreise'
    };

    const summary = `${typeLabels[absence.type] || absence.type}${absence.employee_name ? ` - ${absence.employee_name}` : ''}`;

    return `BEGIN:VEVENT
UID:${uid}
DTSTAMP:${dtstamp}
DTSTART;VALUE=DATE:${dtstart}
DTEND;VALUE=DATE:${dtend}
SUMMARY:${summary}
DESCRIPTION:${absence.reason || 'Keine Bemerkung'}
STATUS:${absence.status === 'approved' ? 'CONFIRMED' : 'TENTATIVE'}
END:VEVENT`;
  };

  const exportToIcal = async () => {
    setIsExporting(true);
    try {
      let query = supabase
        .from('absence_requests')
        .select('*')
        .eq('status', 'approved')
        .gte('start_date', `${year}-01-01`)
        .lte('end_date', `${year}-12-31`)
        .order('start_date');

      if (employeeId) {
        query = query.eq('user_id', employeeId);
      }

      const { data: absences, error } = await query;

      if (error) throw error;

      if (!absences || absences.length === 0) {
        toast.info('Keine genehmigten Abwesenheiten zum Exportieren gefunden');
        return;
      }

      const events = absences.map(generateICalEvent).join('\n');

      const icalContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//HRFlow//Absence Calendar//DE
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Abwesenheiten ${year}
${events}
END:VCALENDAR`;

      // Download
      const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `abwesenheiten-${year}.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`${absences.length} Abwesenheit(en) exportiert`);
    } catch (error) {
      console.error('Export-Fehler:', error);
      toast.error('Fehler beim Exportieren');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToCSV = async () => {
    setIsExporting(true);
    try {
      let query = supabase
        .from('absence_requests')
        .select('*')
        .gte('start_date', `${year}-01-01`)
        .lte('end_date', `${year}-12-31`)
        .order('start_date');

      if (employeeId) {
        query = query.eq('user_id', employeeId);
      }

      const { data: absences, error } = await query;

      if (error) throw error;

      if (!absences || absences.length === 0) {
        toast.info('Keine Abwesenheiten zum Exportieren gefunden');
        return;
      }

      const typeLabels: Record<string, string> = {
        vacation: 'Urlaub',
        sick: 'Krankheit',
        sick_leave: 'Krankheit',
        homeoffice: 'Homeoffice',
        training: 'Fortbildung',
        parental: 'Elternzeit',
        business_trip: 'Dienstreise'
      };

      const statusLabels: Record<string, string> = {
        approved: 'Genehmigt',
        pending: 'Ausstehend',
        rejected: 'Abgelehnt'
      };

      const headers = ['Mitarbeiter', 'Typ', 'Startdatum', 'Enddatum', 'Status', 'Abteilung', 'Bemerkung'];
      const rows = absences.map(a => [
        a.employee_name || '',
        typeLabels[a.type] || a.type,
        new Date(a.start_date).toLocaleDateString('de-DE'),
        new Date(a.end_date).toLocaleDateString('de-DE'),
        statusLabels[a.status] || a.status,
        a.department || '',
        a.reason || ''
      ]);

      const csvContent = [
        headers.join(';'),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(';'))
      ].join('\n');

      // Download mit BOM für Excel-Kompatibilität
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `abwesenheiten-${year}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`${absences.length} Abwesenheit(en) als CSV exportiert`);
    } catch (error) {
      console.error('CSV-Export-Fehler:', error);
      toast.error('Fehler beim CSV-Export');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isExporting}>
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? 'Exportiere...' : 'Exportieren'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToIcal}>
          <Calendar className="h-4 w-4 mr-2" />
          iCal-Datei (.ics)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToCSV}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          CSV-Datei (.csv)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
