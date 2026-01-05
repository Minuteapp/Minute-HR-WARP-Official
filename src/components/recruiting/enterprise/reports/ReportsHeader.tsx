import { FileText, Download, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const ReportsHeader = () => {
  const handleExcelExport = async () => {
    try {
      const { data: jobs } = await supabase.from('job_postings').select('*');
      const { data: applications } = await supabase.from('job_applications').select('*');
      const { data: candidates } = await supabase.from('candidates').select('*');

      const workbook = XLSX.utils.book_new();
      
      if (jobs) {
        const jobsSheet = XLSX.utils.json_to_sheet(jobs);
        XLSX.utils.book_append_sheet(workbook, jobsSheet, 'Stellen');
      }
      
      if (applications) {
        const applicationsSheet = XLSX.utils.json_to_sheet(applications);
        XLSX.utils.book_append_sheet(workbook, applicationsSheet, 'Bewerbungen');
      }
      
      if (candidates) {
        const candidatesSheet = XLSX.utils.json_to_sheet(candidates);
        XLSX.utils.book_append_sheet(workbook, candidatesSheet, 'Kandidaten');
      }

      XLSX.writeFile(workbook, `recruiting-report-${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Excel-Export erfolgreich');
    } catch (error) {
      toast.error('Export fehlgeschlagen');
    }
  };

  const handlePdfExport = async () => {
    try {
      const { data: jobs } = await supabase.from('job_postings').select('title, department, location, status');
      const { data: applications } = await supabase.from('job_applications').select('current_stage, submitted_at');

      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text('Recruiting Report', 14, 22);
      doc.setFontSize(10);
      doc.text(`Erstellt am: ${new Date().toLocaleDateString('de-DE')}`, 14, 30);

      if (jobs && jobs.length > 0) {
        doc.setFontSize(14);
        doc.text('Stellen', 14, 45);
        autoTable(doc, {
          startY: 50,
          head: [['Titel', 'Abteilung', 'Standort', 'Status']],
          body: jobs.map(job => [job.title, job.department || '-', job.location || '-', job.status]),
        });
      }

      doc.save(`recruiting-report-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('PDF-Export erfolgreich');
    } catch (error) {
      toast.error('Export fehlgeschlagen');
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <FileText className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Reports & Analytics</h2>
          <p className="text-sm text-muted-foreground">
            Umfassende Analysen und Auswertungen
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={handleExcelExport} className="gap-2">
          <FileSpreadsheet className="h-4 w-4" />
          Excel exportieren
        </Button>
        <Button onClick={handlePdfExport} className="gap-2">
          <Download className="h-4 w-4" />
          PDF exportieren
        </Button>
      </div>
    </div>
  );
};

export default ReportsHeader;
