import { useState, useEffect, useCallback } from 'react';

interface DashboardWidget {
  id: string;
  type: string;
  title: string;
  size: 'small' | 'medium' | 'large' | 'wide';
  position: { x: number; y: number };
  settings: {
    color?: string;
    darkMode?: boolean;
    refreshInterval?: number;
    pinned?: boolean;
    visible?: boolean;
    customActions?: string[];
  };
  data?: any;
}

interface DashboardLayout {
  id: string;
  name: string;
  userId: string;
  widgets: DashboardWidget[];
  settings: {
    theme: 'light' | 'dark' | 'auto';
    refreshInterval: number;
    autoSave: boolean;
  };
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UseDashboardLayoutReturn {
  currentLayout: DashboardLayout | null;
  layouts: DashboardLayout[];
  loading: boolean;
  error: string | null;
  saveLayout: (layout: Partial<DashboardLayout>) => Promise<void>;
  loadLayout: (layoutId: string) => Promise<void>;
  deleteLayout: (layoutId: string) => Promise<void>;
  createFromTemplate: (templateName: string) => Promise<void>;
  exportLayout: (layoutId: string) => void;
  importLayout: (file: File) => Promise<void>;
  resetToDefault: () => Promise<void>;
}

export const useDashboardLayout = (userId: string): UseDashboardLayoutReturn => {
  const [currentLayout, setCurrentLayout] = useState<DashboardLayout | null>(null);
  const [layouts, setLayouts] = useState<DashboardLayout[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user's dashboard layouts
  const loadLayouts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // TODO: Replace with actual API call
      const mockLayouts: DashboardLayout[] = [
        {
          id: 'default',
          name: 'Standard Dashboard',
          userId,
          widgets: [],
          settings: {
            theme: 'auto',
            refreshInterval: 15,
            autoSave: true
          },
          isDefault: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      // Load from localStorage as fallback
      const savedLayouts = localStorage.getItem(`dashboard-layouts-${userId}`);
      if (savedLayouts) {
        const parsedLayouts = JSON.parse(savedLayouts);
        setLayouts([...mockLayouts, ...parsedLayouts]);
      } else {
        setLayouts(mockLayouts);
      }

      // Load current layout
      const currentLayoutId = localStorage.getItem(`current-layout-${userId}`);
      if (currentLayoutId) {
        const layout = mockLayouts.find(l => l.id === currentLayoutId) || mockLayouts[0];
        setCurrentLayout(layout);
      } else {
        setCurrentLayout(mockLayouts[0]);
      }
    } catch (err) {
      setError('Fehler beim Laden der Dashboard-Layouts');
      console.error('Dashboard layout loading error:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Save layout
  const saveLayout = useCallback(async (layoutData: Partial<DashboardLayout>) => {
    setLoading(true);
    setError(null);

    try {
      const layout: DashboardLayout = {
        id: layoutData.id || `layout-${Date.now()}`,
        name: layoutData.name || 'Neues Dashboard',
        userId,
        widgets: layoutData.widgets || [],
        settings: layoutData.settings || {
          theme: 'auto',
          refreshInterval: 15,
          autoSave: true
        },
        isDefault: layoutData.isDefault || false,
        createdAt: layoutData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Update layouts
      const updatedLayouts = layouts.map(l => 
        l.id === layout.id ? layout : l
      );
      
      // Add new layout if it doesn't exist
      if (!layouts.find(l => l.id === layout.id)) {
        updatedLayouts.push(layout);
      }

      setLayouts(updatedLayouts);
      setCurrentLayout(layout);

      // Save to localStorage
      localStorage.setItem(`dashboard-layouts-${userId}`, JSON.stringify(updatedLayouts));
      localStorage.setItem(`current-layout-${userId}`, layout.id);

      // TODO: Save to backend API
      console.log('Dashboard layout saved:', layout);
    } catch (err) {
      setError('Fehler beim Speichern des Dashboard-Layouts');
      console.error('Dashboard layout saving error:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, layouts]);

  // Load specific layout
  const loadLayout = useCallback(async (layoutId: string) => {
    setLoading(true);
    setError(null);

    try {
      const layout = layouts.find(l => l.id === layoutId);
      if (!layout) {
        throw new Error('Layout nicht gefunden');
      }

      setCurrentLayout(layout);
      localStorage.setItem(`current-layout-${userId}`, layoutId);
    } catch (err) {
      setError('Fehler beim Laden des Dashboard-Layouts');
      console.error('Dashboard layout loading error:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, layouts]);

  // Delete layout
  const deleteLayout = useCallback(async (layoutId: string) => {
    setLoading(true);
    setError(null);

    try {
      const updatedLayouts = layouts.filter(l => l.id !== layoutId);
      setLayouts(updatedLayouts);

      // If current layout was deleted, switch to default
      if (currentLayout?.id === layoutId) {
        const defaultLayout = updatedLayouts.find(l => l.isDefault) || updatedLayouts[0];
        setCurrentLayout(defaultLayout);
        if (defaultLayout) {
          localStorage.setItem(`current-layout-${userId}`, defaultLayout.id);
        }
      }

      localStorage.setItem(`dashboard-layouts-${userId}`, JSON.stringify(updatedLayouts));
    } catch (err) {
      setError('Fehler beim Löschen des Dashboard-Layouts');
      console.error('Dashboard layout deletion error:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, layouts, currentLayout]);

  // Create from template
  const createFromTemplate = useCallback(async (templateName: string) => {
    setLoading(true);
    setError(null);

    try {
      const templates: Record<string, Partial<DashboardLayout>> = {
        'projektmanager': {
          name: 'Projektmanager Dashboard',
          widgets: [
            {
              id: 'projects-widget',
              type: 'projects',
              title: 'Meine Projekte',
              size: 'large',
              position: { x: 0, y: 0 },
              settings: { visible: true, pinned: true, refreshInterval: 5 }
            },
            {
              id: 'tasks-widget',
              type: 'tasks',
              title: 'Offene Aufgaben',
              size: 'medium',
              position: { x: 2, y: 0 },
              settings: { visible: true, refreshInterval: 10 }
            },
            {
              id: 'team-widget',
              type: 'team',
              title: 'Team Status',
              size: 'medium',
              position: { x: 0, y: 1 },
              settings: { visible: true, refreshInterval: 15 }
            }
          ]
        },
        'hr-admin': {
          name: 'HR Admin Dashboard',
          widgets: [
            {
              id: 'team-widget',
              type: 'team',
              title: 'Team Übersicht',
              size: 'wide',
              position: { x: 0, y: 0 },
              settings: { visible: true, pinned: true, refreshInterval: 5 }
            },
            {
              id: 'approvals-widget',
              type: 'approvals',
              title: 'Pending Approvals',
              size: 'medium',
              position: { x: 0, y: 1 },
              settings: { visible: true, refreshInterval: 5 }
            },
            {
              id: 'time-tracking-widget',
              type: 'time',
              title: 'Zeiterfassung',
              size: 'medium',
              position: { x: 2, y: 1 },
              settings: { visible: true, refreshInterval: 15 }
            }
          ]
        },
        'controlling': {
          name: 'Controlling Dashboard',
          widgets: [
            {
              id: 'forecast-widget',
              type: 'forecast',
              title: 'Budget Forecast',
              size: 'large',
              position: { x: 0, y: 0 },
              settings: { visible: true, pinned: true, refreshInterval: 30 }
            },
            {
              id: 'expenses-widget',
              type: 'expenses',
              title: 'Ausgaben',
              size: 'medium',
              position: { x: 2, y: 0 },
              settings: { visible: true, refreshInterval: 15 }
            },
            {
              id: 'performance-widget',
              type: 'performance',
              title: 'Performance Metrics',
              size: 'wide',
              position: { x: 0, y: 1 },
              settings: { visible: true, refreshInterval: 60 }
            }
          ]
        }
      };

      const template = templates[templateName];
      if (!template) {
        throw new Error('Template nicht gefunden');
      }

      await saveLayout({
        ...template,
        id: `template-${templateName}-${Date.now()}`
      });
    } catch (err) {
      setError('Fehler beim Erstellen des Templates');
      console.error('Template creation error:', err);
    } finally {
      setLoading(false);
    }
  }, [saveLayout]);

  // Export layout
  const exportLayout = useCallback((layoutId: string) => {
    const layout = layouts.find(l => l.id === layoutId);
    if (!layout) return;

    const exportData = {
      layout,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-${layout.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [layouts]);

  // Import layout
  const importLayout = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);

    try {
      const text = await file.text();
      const importData = JSON.parse(text);
      
      if (!importData.layout) {
        throw new Error('Ungültiges Layout-Format');
      }

      const layout = importData.layout;
      layout.id = `imported-${Date.now()}`;
      layout.name = `${layout.name} (Importiert)`;
      layout.userId = userId;
      layout.updatedAt = new Date().toISOString();

      await saveLayout(layout);
    } catch (err) {
      setError('Fehler beim Importieren des Layouts');
      console.error('Layout import error:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, saveLayout]);

  // Reset to default
  const resetToDefault = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const defaultLayout = layouts.find(l => l.isDefault);
      if (defaultLayout) {
        await loadLayout(defaultLayout.id);
      }
    } catch (err) {
      setError('Fehler beim Zurücksetzen auf Standard');
      console.error('Reset to default error:', err);
    } finally {
      setLoading(false);
    }
  }, [layouts, loadLayout]);

  // Load layouts on mount
  useEffect(() => {
    if (userId) {
      loadLayouts();
    }
  }, [userId, loadLayouts]);

  return {
    currentLayout,
    layouts,
    loading,
    error,
    saveLayout,
    loadLayout,
    deleteLayout,
    createFromTemplate,
    exportLayout,
    importLayout,
    resetToDefault
  };
};