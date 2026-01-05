import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';

export const useSickLeavePDFExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const exportToPDF = async (sickLeaveId: string) => {
    setIsExporting(true);
    try {
      // Call edge function to get HTML
      const { data, error } = await supabase.functions.invoke('export-sick-leave-pdf', {
        body: { sickLeaveId }
      });

      if (error) throw error;

      // Create PDF from HTML using jsPDF
      const doc = new jsPDF();
      
      // Add MINUTE logo/header
      doc.setFontSize(24);
      doc.setTextColor(0, 102, 255);
      doc.text('MINUTE', 105, 20, { align: 'center' });
      
      doc.setFontSize(16);
      doc.setTextColor(102, 102, 102);
      doc.text('Krankmeldung - Bescheinigung', 105, 30, { align: 'center' });
      
      // Draw line
      doc.setDrawColor(0, 102, 255);
      doc.setLineWidth(1);
      doc.line(20, 35, 190, 35);

      const sickLeave = data.sickLeave;
      let yPos = 50;
      
      // Helper function to add info row
      const addInfoRow = (label: string, value: string) => {
        doc.setFontSize(10);
        doc.setTextColor(102, 102, 102);
        doc.text(label, 25, yPos);
        doc.setTextColor(0, 0, 0);
        doc.text(value, 80, yPos);
        yPos += 10;
      };

      // Add information
      addInfoRow('Mitarbeiter:', sickLeave.profiles?.full_name || 'N/A');
      addInfoRow('Abteilung:', sickLeave.profiles?.department || 'N/A');
      addInfoRow('Von:', new Date(sickLeave.start_date).toLocaleDateString('de-DE'));
      addInfoRow('Bis:', sickLeave.end_date ? new Date(sickLeave.end_date).toLocaleDateString('de-DE') : 'N/A');
      addInfoRow('Grund:', sickLeave.reason || 'Nicht angegeben');
      
      const statusText = sickLeave.status === 'approved' ? 'Genehmigt' : 
                        sickLeave.status === 'pending' ? 'Ausstehend' : 'Abgelehnt';
      addInfoRow('Status:', statusText);
      
      if (sickLeave.notes) {
        addInfoRow('Anmerkungen:', sickLeave.notes);
      }
      
      addInfoRow('Ärztliches Attest:', sickLeave.has_documents ? 'Vorhanden' : 'Nicht vorhanden');
      addInfoRow('Arzt kontaktiert:', sickLeave.has_contacted_doctor ? 'Ja' : 'Nein');

      // Footer
      yPos = 270;
      doc.setFontSize(8);
      doc.setTextColor(153, 153, 153);
      doc.text(`Erstellt am ${new Date().toLocaleDateString('de-DE')} um ${new Date().toLocaleTimeString('de-DE')}`, 105, yPos, { align: 'center' });
      doc.text('Dieses Dokument wurde automatisch generiert.', 105, yPos + 5, { align: 'center' });

      // Save PDF
      const fileName = `Krankmeldung_${sickLeave.profiles?.full_name?.replace(/\s/g, '_')}_${new Date(sickLeave.start_date).toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      toast({
        title: "PDF exportiert",
        description: "Die Krankmeldung wurde als PDF heruntergeladen."
      });

      return true;
    } catch (error: any) {
      console.error('Error exporting PDF:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: error.message || "Fehler beim Exportieren des PDFs"
      });
      return false;
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportToPDF,
    isExporting
  };
};