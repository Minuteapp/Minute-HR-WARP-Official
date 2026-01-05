
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProjectFormData } from "../types";
import { User } from '@supabase/supabase-js';

export const createProject = async (formData: ProjectFormData, user?: User | null) => {
  try {
    console.log('Starting project creation with data:', formData);
    
    // Benutzer prüfen (wird jetzt als Parameter übergeben)
    if (!user) {
      console.error('User not authenticated');
      throw new Error("Benutzer nicht authentifiziert");
    }
    
    console.log('User authenticated:', user.id);
    
    // Company-ID ermitteln - direkt über RPC für Tenant-Modus (bereits erweitert mit allen Fallbacks)
    const { data: companyId, error: companyError } = await supabase.rpc('get_effective_company_id');
    
    if (companyError) {
      console.error('Error getting company_id:', companyError);
    }
    
    // company_id ist Pflicht (NOT NULL + FK)
    if (!companyId) {
      throw new Error("Keine Firma zugeordnet. Bitte kontaktieren Sie den Administrator.");
    }
    
    console.log('Using company_id:', companyId);
    
    // Validierung der Pflichtfelder
    if (!formData.name || formData.name.trim() === '') {
      throw new Error("Projektname ist erforderlich");
    }
    
    // Bereite die Projektdaten vor - nur gültige Felder verwenden
    const projectData = {
      name: formData.name.trim(),
      description: formData.description?.trim() || null,
      start_date: formData.startDate && formData.startDate.trim() !== '' ? formData.startDate : null,
      end_date: formData.dueDate && formData.dueDate.trim() !== '' ? formData.dueDate : null,
      status: formData.status || 'pending',
      priority: formData.priority || 'medium',
      budget: typeof formData.budget === 'string' ? parseFloat(formData.budget) || null : formData.budget || null,
      currency: formData.currency || 'EUR',
      project_type: formData.project_type || 'standard',
      owner_id: user.id,
      company_id: companyId,
      team_members: formData.team && formData.team.length > 0 ? formData.team.map(member => member.id) : [],
      tags: formData.tags || [],
      progress: 0,
      visibility: 'internal',
      is_template: false,
      custom_fields: {},
      milestone_data: [],
      dependencies: []
    };
    
    console.log('Prepared project data:', projectData);
    
    // Projekt erstellen
    const { data: project, error } = await supabase
      .from('projects')
      .insert([projectData])
      .select()
      .single();
    
    if (error) {
      console.error("Database error while creating project:", error);
      throw new Error(`Datenbankfehler: ${error.message}`);
    }
    
    if (!project) {
      throw new Error("Projekt konnte nicht erstellt werden - keine Daten zurückgegeben");
    }
    
    console.log("Project created successfully:", project);
    
    // Aufgaben erstellen, falls vorhanden
    if (formData.tasks && formData.tasks.length > 0) {
      console.log('Creating tasks...');
      const tasksToInsert = formData.tasks.map(task => ({
        title: task.title || 'Neue Aufgabe',
        description: task.description || '',
        due_date: task.dueDate && task.dueDate.trim() !== '' ? task.dueDate : null,
        priority: task.priority || 'medium',
        status: 'todo',
        project_id: project.id,
        assigned_to: task.assignedTo && task.assignedTo.length > 0 ? task.assignedTo[0] : null
      }));
      
      const { error: tasksError } = await supabase
        .from('project_tasks')
        .insert(tasksToInsert);
      
      if (tasksError) {
        console.warn("Warning: Could not create tasks:", tasksError);
      }
    }
    
    // Meilensteine erstellen, falls vorhanden
    if (formData.milestones && formData.milestones.length > 0) {
      console.log('Creating milestones...');
      const milestonesToInsert = formData.milestones.map(milestone => ({
        title: milestone.title || 'Neuer Meilenstein',
        description: milestone.description || '',
        due_date: milestone.dueDate || null,
        status: 'pending',
        project_id: project.id,
        dependencies: milestone.dependencies || []
      }));
      
      const { error: milestonesError } = await supabase
        .from('project_milestones')
        .insert(milestonesToInsert);
      
      if (milestonesError) {
        console.warn("Warning: Could not create milestones:", milestonesError);
      }
    }
    
    // Benachrichtigungen an alle Teammitglieder senden
    if (formData.team && formData.team.length > 0) {
      console.log('Sending notifications to team members...');
      const notifications = formData.team.map(member => ({
        user_id: member.id,
        notification_type: 'project_assignment',
        source_module: 'projects',
        source_id: project.id,
        source_table: 'projects',
        priority: 'medium',
        title: 'Neues Projekt zugewiesen',
        message: `Sie wurden dem Projekt "${project.name}" hinzugefügt.`,
        action_url: `/projects/${project.id}`,
        company_id: companyId,
        metadata: {
          project_id: project.id,
          project_name: project.name,
          assigned_by: user.id
        }
      }));
      
      const { error: notificationError } = await supabase
        .from('unified_notifications')
        .insert(notifications);
      
      if (notificationError) {
        console.warn("Warning: Could not create notifications:", notificationError);
      }
    }
    
    return project;
    
  } catch (error: any) {
    console.error("Error in createProject:", error);
    
    // Detailliertere Fehlermeldung für verschiedene Fehlertypen
    if (typeof error === 'string') {
      throw new Error(error);
    } else if (error?.message) {
      throw new Error(error.message);
    } else {
      throw new Error('Unbekannter Fehler beim Erstellen des Projekts');
    }
  }
};
