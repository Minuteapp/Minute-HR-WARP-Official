import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export interface AbsenceExportData {
  id: string;
  employee_name?: string;
  department?: string;
  type: string;
  status: string;
  start_date: string;
  end_date: string;
  reason?: string;
  substitute_name?: string;
  created_at?: string;
  approved_by?: string;
  approved_at?: string;
}

const getTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    vacation: 'Urlaub',
    sick_leave: 'Krankheit',
    business_trip: 'Dienstreise',
    homeoffice: 'Homeoffice',
    parental: 'Elternzeit',
    special_vacation: 'Sonderurlaub',
    other: 'Sonstige'
  };
  return labels[type] || type;
};

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    approved: 'Genehmigt',
    pending: 'Ausstehend',
    rejected: 'Abgelehnt',
    archived: 'Archiviert'
  };
  return labels[status] || status;
};

const formatDate = (dateStr: string): string => {
  try {
    return format(new Date(dateStr), 'dd.MM.yyyy', { locale: de });
  } catch {
    return dateStr;
  }
};

export const absenceExportService = {
  /**
   * Export absences to CSV format
   */
  exportToCsv(data: AbsenceExportData[], filename: string = 'abwesenheiten'): void {
    const headers = [
      'Mitarbeiter',
      'Abteilung',
      'Typ',
      'Status',
      'Von',
      'Bis',
      'Grund',
      'Vertretung',
      'Beantragt am',
      'Genehmigt von',
      'Genehmigt am'
    ];

    const rows = data.map(item => [
      item.employee_name || '-',
      item.department || '-',
      getTypeLabel(item.type),
      getStatusLabel(item.status),
      formatDate(item.start_date),
      formatDate(item.end_date),
      item.reason || '-',
      item.substitute_name || '-',
      item.created_at ? formatDate(item.created_at) : '-',
      item.approved_by || '-',
      item.approved_at ? formatDate(item.approved_at) : '-'
    ]);

    // BOM für UTF-8
    const BOM = '\uFEFF';
    const csvContent = BOM + [
      headers.join(';'),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(';'))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  },

  /**
   * Export absences to Excel format
   */
  exportToExcel(data: AbsenceExportData[], filename: string = 'abwesenheiten'): void {
    const worksheetData = [
      ['Mitarbeiter', 'Abteilung', 'Typ', 'Status', 'Von', 'Bis', 'Grund', 'Vertretung', 'Beantragt am', 'Genehmigt von', 'Genehmigt am'],
      ...data.map(item => [
        item.employee_name || '-',
        item.department || '-',
        getTypeLabel(item.type),
        getStatusLabel(item.status),
        formatDate(item.start_date),
        formatDate(item.end_date),
        item.reason || '-',
        item.substitute_name || '-',
        item.created_at ? formatDate(item.created_at) : '-',
        item.approved_by || '-',
        item.approved_at ? formatDate(item.approved_at) : '-'
      ])
    ];

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Spaltenbreiten setzen
    worksheet['!cols'] = [
      { wch: 20 }, // Mitarbeiter
      { wch: 15 }, // Abteilung
      { wch: 12 }, // Typ
      { wch: 12 }, // Status
      { wch: 12 }, // Von
      { wch: 12 }, // Bis
      { wch: 30 }, // Grund
      { wch: 20 }, // Vertretung
      { wch: 12 }, // Beantragt am
      { wch: 20 }, // Genehmigt von
      { wch: 12 }  // Genehmigt am
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Abwesenheiten');
    XLSX.writeFile(workbook, `${filename}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  },

  /**
   * Export absences to PDF format
   */
  exportToPdf(data: AbsenceExportData[], filename: string = 'abwesenheiten', title: string = 'Abwesenheitsbericht'): void {
    const doc = new jsPDF('landscape');
    
    // Titel
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    
    // Datum
    doc.setFontSize(10);
    doc.text(`Erstellt am: ${format(new Date(), 'dd.MM.yyyy HH:mm', { locale: de })}`, 14, 30);

    // Tabelle
    const tableData = data.map(item => [
      item.employee_name || '-',
      item.department || '-',
      getTypeLabel(item.type),
      getStatusLabel(item.status),
      formatDate(item.start_date),
      formatDate(item.end_date),
      item.substitute_name || '-'
    ]);

    autoTable(doc, {
      head: [['Mitarbeiter', 'Abteilung', 'Typ', 'Status', 'Von', 'Bis', 'Vertretung']],
      body: tableData,
      startY: 35,
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250]
      }
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Seite ${i} von ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }

    doc.save(`${filename}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  },

  /**
   * Export team overview to Excel
   */
  exportTeamOverview(members: any[], filename: string = 'team_uebersicht'): void {
    const worksheetData = [
      ['Mitarbeiter', 'Personalnummer', 'Abteilung', 'Status', 'Urlaubstage (verwendet)', 'Urlaubstage (Rest)', 'Krankheitstage'],
      ...members.map(m => [
        m.name,
        m.employeeNumber || '-',
        m.department || '-',
        m.status === 'absent' ? 'Abwesend' : m.status === 'sick' ? 'Krank' : 'Anwesend',
        m.vacationUsed || 0,
        m.vacationRemaining || 0,
        m.sickDays || 0
      ])
    ];

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    worksheet['!cols'] = [
      { wch: 25 },
      { wch: 15 },
      { wch: 20 },
      { wch: 12 },
      { wch: 20 },
      { wch: 20 },
      { wch: 15 }
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Team-Übersicht');
    XLSX.writeFile(workbook, `${filename}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  }
};
