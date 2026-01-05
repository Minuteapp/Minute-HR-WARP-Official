import jsPDF from "jspdf";
import { format } from "date-fns";

interface HRNote {
  id: string;
  title: string;
  content: string;
  category: string;
  tags?: string[];
  visibility: string;
  created_at: string;
  author_id: string;
}

const categoryLabels: Record<string, string> = {
  performance_review: "Leistungsbeurteilung",
  compensation: "Vergütung",
  project: "Projekt",
  work_arrangement: "Arbeitsmodell",
  onboarding: "Onboarding",
  disciplinary: "Disziplinarisch",
  health: "Gesundheit",
  career_development: "Karriereentwicklung",
  other: "Sonstiges",
};

export const useHRNotesPDFExport = () => {
  const exportNoteToPDF = (note: HRNote) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("HR-Notiz", 20, 20);
    
    // Titel
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(note.title, 20, 35);
    
    // Metadaten
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Kategorie: ${categoryLabels[note.category] || note.category}`, 20, 45);
    doc.text(`Erstellt am: ${format(new Date(note.created_at), 'dd.MM.yyyy HH:mm')}`, 20, 52);
    doc.text(`Sichtbarkeit: ${note.visibility === 'hr_only' ? 'Nur HR' : 'HR & Manager'}`, 20, 59);
    
    // Tags
    if (note.tags && note.tags.length > 0) {
      doc.text(`Tags: ${note.tags.join(', ')}`, 20, 66);
    }
    
    // Trennlinie
    doc.setLineWidth(0.5);
    doc.line(20, 72, 190, 72);
    
    // Content
    doc.setFontSize(10);
    const splitContent = doc.splitTextToSize(note.content, 170);
    doc.text(splitContent, 20, 82);
    
    // Footer mit Datenschutz-Hinweis
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text('Vertraulich - DSGVO-geschützt', 20, pageHeight - 15);
    doc.text(`Exportiert am: ${format(new Date(), 'dd.MM.yyyy HH:mm')}`, 20, pageHeight - 10);
    
    // Speichern
    const fileName = `HR-Notiz-${note.title.replace(/[^a-z0-9]/gi, '-')}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    doc.save(fileName);
  };
  
  const exportMultipleNotesToPDF = (notes: HRNote[]) => {
    const doc = new jsPDF();
    
    // Titel-Seite
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("HR-Notizen Bericht", 20, 30);
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Anzahl Notizen: ${notes.length}`, 20, 45);
    doc.text(`Exportiert am: ${format(new Date(), 'dd.MM.yyyy HH:mm')}`, 20, 52);
    
    // Notizen
    notes.forEach((note, index) => {
      doc.addPage();
      
      // Header
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(`Notiz ${index + 1} von ${notes.length}`, 20, 20);
      
      // Titel
      doc.setFontSize(14);
      doc.text(note.title, 20, 32);
      
      // Metadaten
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Kategorie: ${categoryLabels[note.category] || note.category}`, 20, 42);
      doc.text(`Erstellt am: ${format(new Date(note.created_at), 'dd.MM.yyyy HH:mm')}`, 20, 49);
      
      if (note.tags && note.tags.length > 0) {
        doc.text(`Tags: ${note.tags.join(', ')}`, 20, 56);
      }
      
      // Trennlinie
      doc.setLineWidth(0.5);
      doc.line(20, 62, 190, 62);
      
      // Content
      const splitContent = doc.splitTextToSize(note.content, 170);
      doc.text(splitContent, 20, 72);
    });
    
    // Footer auf letzter Seite
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text('Vertraulich - DSGVO-geschützt', 20, pageHeight - 10);
    
    // Speichern
    const fileName = `HR-Notizen-Bericht-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    doc.save(fileName);
  };
  
  return { exportNoteToPDF, exportMultipleNotesToPDF };
};
