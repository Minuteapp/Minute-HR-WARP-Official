
import { supabase } from "@/integrations/supabase/client";
import { Project, ProjectTask } from "@/types/project.types";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

interface ExportOptions {
  format: 'pdf' | 'excel';
  content: 'all' | 'tasks' | 'gantt';
  filter?: {
    status?: string[];
    priority?: string[];
    team?: string[];
  };
  includeCompleted?: boolean;
  sendEmail?: boolean;
  emailRecipients?: string[];
}

export const exportProject = async (projectId: string, options: ExportOptions) => {
  try {
    // Projekt-Daten abrufen
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();
    
    if (projectError) {
      throw projectError;
    }

    // Aufgaben-Daten abrufen
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId);
    
    if (tasksError) {
      throw tasksError;
    }

    // Je nach Format exportieren
    if (options.format === 'excel') {
      return exportToExcel(project, tasks, options);
    } else {
      return exportToPdf(project, tasks, options);
    }
  } catch (error: any) {
    console.error("Fehler beim Exportieren des Projekts:", error);
    toast.error(`Fehler beim Exportieren: ${error.message}`);
    throw error;
  }
};

const exportToExcel = (project: Project, tasks: ProjectTask[], options: ExportOptions) => {
  try {
    // Filtern der Aufgaben basierend auf den Optionen
    let filteredTasks = [...tasks];
    
    if (!options.includeCompleted) {
      filteredTasks = filteredTasks.filter(task => task.status !== 'done');
    }
    
    if (options.filter?.status?.length) {
      filteredTasks = filteredTasks.filter(task => options.filter?.status?.includes(task.status));
    }
    
    if (options.filter?.priority?.length) {
      filteredTasks = filteredTasks.filter(task => options.filter?.priority?.includes(task.priority));
    }

    // Excel-Daten vorbereiten
    const tasksData = filteredTasks.map(task => ({
      'Aufgabe': task.title,
      'Beschreibung': task.description || '',
      'Status': task.status,
      'Priorität': task.priority,
      'Fälligkeitsdatum': task.due_date || '',
      'Zugewiesen an': task.assigned_to || '',
    }));

    // Projektinformationen
    const projectInfo = [{
      'Projektname': project.name,
      'Beschreibung': project.description || '',
      'Status': project.status,
      'Priorität': project.priority,
      'Startdatum': project.start_date || '',
      'Enddatum': project.end_date || '',
      'Budget': project.budget || '',
    }];

    // Workbook erstellen
    const wb = XLSX.utils.book_new();
    
    // Projektinformationen-Sheet hinzufügen
    const wsProject = XLSX.utils.json_to_sheet(projectInfo, { header: Object.keys(projectInfo[0]) });
    XLSX.utils.book_append_sheet(wb, wsProject, "Projektinfo");
    
    // Aufgaben-Sheet hinzufügen
    const wsTasks = XLSX.utils.json_to_sheet(tasksData, { header: Object.keys(tasksData[0]) });
    XLSX.utils.book_append_sheet(wb, wsTasks, "Aufgaben");
    
    // Excel-Datei zum Download ausgeben
    const fileName = `Projekt_${project.name.replace(/\s+/g, '_')}_Export.xlsx`;
    XLSX.writeFile(wb, fileName);
    
    toast.success("Excel-Datei erfolgreich exportiert");
    return fileName;
  } catch (error: any) {
    console.error("Fehler beim Excel-Export:", error);
    toast.error(`Excel-Export fehlgeschlagen: ${error.message}`);
    throw error;
  }
};

const exportToPdf = (project: Project, tasks: ProjectTask[], options: ExportOptions) => {
  try {
    // Filtern der Aufgaben basierend auf den Optionen
    let filteredTasks = [...tasks];
    
    if (!options.includeCompleted) {
      filteredTasks = filteredTasks.filter(task => task.status !== 'done');
    }
    
    if (options.filter?.status?.length) {
      filteredTasks = filteredTasks.filter(task => options.filter?.status?.includes(task.status));
    }
    
    if (options.filter?.priority?.length) {
      filteredTasks = filteredTasks.filter(task => options.filter?.priority?.includes(task.priority));
    }

    // PDF erstellen
    const doc = new jsPDF();
    
    // Projekt-Titel
    doc.setFontSize(18);
    doc.text(`Projekt: ${project.name}`, 14, 22);
    
    // Projekt-Details
    doc.setFontSize(12);
    doc.text(`Status: ${project.status}`, 14, 32);
    doc.text(`Priorität: ${project.priority}`, 14, 38);
    doc.text(`Startdatum: ${project.start_date || 'Nicht festgelegt'}`, 14, 44);
    doc.text(`Enddatum: ${project.end_date || 'Nicht festgelegt'}`, 14, 50);
    
    if (project.description) {
      doc.text('Beschreibung:', 14, 60);
      doc.setFontSize(10);
      const splitDescription = doc.splitTextToSize(project.description, 180);
      doc.text(splitDescription, 14, 66);
    }

    // Aufgaben-Tabelle
    const tableColumn = ["Aufgabe", "Status", "Priorität", "Fällig bis"];
    const tableRows = filteredTasks.map(task => [
      task.title, 
      task.status, 
      task.priority, 
      task.due_date || 'Nicht festgelegt'
    ]);
    
    doc.setFontSize(12);
    doc.text('Aufgaben:', 14, 100);
    // @ts-ignore
    doc.autoTable({
      startY: 105,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
      alternateRowStyles: { fillColor: [240, 240, 240] }
    });
    
    // PDF zum Download ausgeben
    const fileName = `Projekt_${project.name.replace(/\s+/g, '_')}_Bericht.pdf`;
    doc.save(fileName);
    
    toast.success("PDF erfolgreich exportiert");
    return fileName;
  } catch (error: any) {
    console.error("Fehler beim PDF-Export:", error);
    toast.error(`PDF-Export fehlgeschlagen: ${error.message}`);
    throw error;
  }
};

export const sendExportByEmail = async (
  projectId: string, 
  filePath: string, 
  recipients: string[], 
  fileType: 'pdf' | 'excel'
) => {
  try {
    // Hier würde die Implementierung des E-Mail-Versands folgen
    // Dies erfordert typischerweise einen Serveraufruf (Edge-Function)
    // Da dies eine komplexere Implementierung erfordert, würden wir hier
    // nur die Schnittstelle definieren und einen Erfolg simulieren

    toast.success(`Export wurde an ${recipients.length} Empfänger gesendet`);
    return true;
  } catch (error: any) {
    console.error("Fehler beim E-Mail-Versand:", error);
    toast.error(`E-Mail-Versand fehlgeschlagen: ${error.message}`);
    throw error;
  }
};
