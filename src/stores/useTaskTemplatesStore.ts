
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { TaskTemplate } from '@/types/taskTemplate';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';

interface TaskTemplatesState {
  templates: TaskTemplate[];
  selectedTemplate: TaskTemplate | null;
  isLoading: boolean;
}

interface TaskTemplatesActions {
  addTemplate: (template: Omit<TaskTemplate, 'id' | 'createdAt'>) => void;
  updateTemplate: (id: string, updates: Partial<TaskTemplate>) => void;
  deleteTemplate: (id: string) => void;
  selectTemplate: (id: string | null) => void;
  fetchTemplates: () => Promise<void>;
}

type TaskTemplatesStore = TaskTemplatesState & TaskTemplatesActions;

export const useTaskTemplatesStore = create<TaskTemplatesStore>((set, get) => ({
  templates: [],
  selectedTemplate: null,
  isLoading: false,

  addTemplate: (templateData) => {
    const newTemplate: TaskTemplate = {
      ...templateData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      templates: [...state.templates, newTemplate],
    }));

    toast.success('Vorlage erfolgreich erstellt');
  },

  updateTemplate: (id, updates) => {
    set((state) => ({
      templates: state.templates.map((template) =>
        template.id === id ? { ...template, ...updates } : template
      ),
    }));

    toast.success('Vorlage erfolgreich aktualisiert');
  },

  deleteTemplate: (id) => {
    set((state) => ({
      templates: state.templates.filter((template) => template.id !== id),
      selectedTemplate: state.selectedTemplate?.id === id ? null : state.selectedTemplate,
    }));

    toast.success('Vorlage erfolgreich gelöscht');
  },

  selectTemplate: (id) => {
    if (id === null) {
      set({ selectedTemplate: null });
      return;
    }

    const template = get().templates.find((t) => t.id === id);
    if (template) {
      set({ selectedTemplate: template });
    }
  },

  fetchTemplates: async () => {
    set({ isLoading: true });
    
    try {
      // Lade Vorlagen aus der Datenbank
      const { data, error } = await supabase
        .from('task_templates')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Konvertiere DB-Daten zu TaskTemplate Format
      const templates: TaskTemplate[] = (data || []).map((t: any) => ({
        id: t.id,
        title: t.title,
        description: t.description || '',
        defaultDurationDays: t.default_duration_days || 1,
        status: t.status || 'todo',
        priority: t.priority || 'medium',
        autoTimeTracking: t.auto_time_tracking || false,
        isTeamTemplate: t.is_team_template || false,
        createdBy: t.created_by,
        createdAt: t.created_at,
        tags: t.tags || [],
        subtasks: t.subtasks || []
      }));
      
      set({ templates, isLoading: false });
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Fehler beim Laden der Vorlagen');
      // Bei Fehler: Leere Liste anzeigen statt Fake-Daten
      set({ templates: [], isLoading: false });
    }
  },
}));
