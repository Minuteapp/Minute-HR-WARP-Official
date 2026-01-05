import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { DashboardWidgetSidebar } from './DashboardWidgetSidebar';
import { DashboardBuilderCanvas } from './DashboardBuilderCanvas';
import { sampleDashboardTemplate } from './templates/sampleDashboardTemplate';
import { 
  Play,
  Pause,
  Save,
  Trash2,
  Settings,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react';

interface DashboardBuilderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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

export const DashboardBuilderModal = ({ open, onOpenChange }: DashboardBuilderModalProps) => {
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [isEditMode, setIsEditMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentLayout, setCurrentLayout] = useState<DashboardLayout | null>(null);

  const saveDashboard = () => {
    const layout: DashboardLayout = {
      id: currentLayout?.id || `layout-${Date.now()}`,
      name: 'Mein Dashboard',
      userId: 'current-user', // TODO: Get from auth context
      widgets,
      settings: {
        theme: 'auto',
        refreshInterval: 15,
        autoSave: true
      },
      isDefault: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log('Dashboard Layout gespeichert:', layout);
    onOpenChange(false);
  };

  const loadTemplate = (templateName: string) => {
    console.log('Template laden:', templateName);
    setWidgets(sampleDashboardTemplate as any);
  };

  const resetDashboard = () => {
    setWidgets([]);
    setCurrentLayout(null);
  };

  const exportLayout = () => {
    const layoutData = {
      widgets,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(layoutData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dashboard-layout.json';
    a.click();
    URL.revokeObjectURL(url);
  };



  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[98vw] max-h-[98vh] w-full h-full overflow-hidden p-0">
        <DialogHeader className="p-6 pb-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">Dashboard Builder</DialogTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="edit-mode" className="text-sm">Bearbeitungsmodus</Label>
                <Switch 
                  id="edit-mode"
                  checked={isEditMode}
                  onCheckedChange={setIsEditMode}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => loadTemplate('standard')}>
                  <Upload className="mr-2 h-4 w-4" />
                  Template
                </Button>
                <Button variant="outline" size="sm" onClick={exportLayout}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
                <Button variant="outline" size="sm" onClick={resetDashboard}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Reset
                </Button>
                <Button size="sm" onClick={saveDashboard}>
                  <Save className="mr-2 h-4 w-4" />
                  Speichern
                </Button>
              </div>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex h-full overflow-hidden">
          {sidebarOpen && isEditMode && (
            <DashboardWidgetSidebar 
              isOpen={sidebarOpen}
              onToggle={() => setSidebarOpen(!sidebarOpen)}
            />
          )}
          
          <DashboardBuilderCanvas
            widgets={widgets}
            onWidgetsChange={setWidgets}
            availableWidgets={[]}
            isEditMode={isEditMode}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};