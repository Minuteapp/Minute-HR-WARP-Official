import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Save,
  Download,
  Upload,
  RotateCcw,
  Eye,
  EyeOff,
} from 'lucide-react';
import { DeviceSwitcher, DeviceType } from './dashboard/DeviceSwitcher';
import { WidgetPalette, WidgetDefinition } from './dashboard/WidgetPalette';
import { DashboardLivePreview, PreviewWidget } from './dashboard/DashboardLivePreview';
import { WidgetSettingsPanel } from './dashboard/WidgetSettings';
import { toast } from 'sonner';

export const DashboardBuilder = () => {
  const [activeDevice, setActiveDevice] = useState<DeviceType>('desktop');
  const [widgets, setWidgets] = useState<PreviewWidget[]>([]);
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(true);
  const [showPalette, setShowPalette] = useState(true);

  const handleWidgetAdd = useCallback((widgetDef: WidgetDefinition) => {
    const newWidget: PreviewWidget = {
      id: `${widgetDef.id}-${Date.now()}`,
      type: widgetDef.type,
      title: widgetDef.title,
      size: widgetDef.defaultSize,
      position: widgets.length,
    };
    setWidgets(prev => [...prev, newWidget]);
    setSelectedWidgetId(newWidget.id);
    toast.success(`${widgetDef.title} hinzugefügt`);
  }, [widgets.length]);

  const handleWidgetRemove = useCallback((widgetId: string) => {
    setWidgets(prev => prev.filter(w => w.id !== widgetId));
    if (selectedWidgetId === widgetId) {
      setSelectedWidgetId(null);
    }
    toast.success('Widget entfernt');
  }, [selectedWidgetId]);

  const handleWidgetUpdate = useCallback((widgetId: string, updates: Partial<PreviewWidget>) => {
    setWidgets(prev => prev.map(w => 
      w.id === widgetId ? { ...w, ...updates } : w
    ));
  }, []);

  const handleWidgetReorder = useCallback((newWidgets: PreviewWidget[]) => {
    setWidgets(newWidgets);
  }, []);

  const handleSave = () => {
    const layoutData = {
      device: activeDevice,
      widgets,
      savedAt: new Date().toISOString(),
    };
    console.log('Dashboard Layout gespeichert:', layoutData);
    toast.success('Dashboard-Layout gespeichert');
  };

  const handleExport = () => {
    const layoutData = {
      widgets,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(layoutData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dashboard-layout.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Layout exportiert');
  };

  const handleReset = () => {
    setWidgets([]);
    setSelectedWidgetId(null);
    toast.info('Dashboard zurückgesetzt');
  };

  const selectedWidget = widgets.find(w => w.id === selectedWidgetId) || null;
  const addedWidgetIds = widgets.map(w => w.id.split('-')[0]);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Dashboard Builder</h3>
        <p className="text-sm text-muted-foreground">
          Gestalte dein persönliches Dashboard mit Live-Vorschau
        </p>
      </div>

      {/* Toolbar */}
      <Card className="p-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <DeviceSwitcher 
              activeDevice={activeDevice}
              onDeviceChange={setActiveDevice}
            />
            
            <div className="flex items-center gap-2">
              <Label htmlFor="edit-mode" className="text-sm">Bearbeiten</Label>
              <Switch
                id="edit-mode"
                checked={isEditMode}
                onCheckedChange={setIsEditMode}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowPalette(!showPalette)}
            >
              {showPalette ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              Palette
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Speichern
            </Button>
          </div>
        </div>
      </Card>

      {/* Main Builder Area */}
      <Card className="overflow-hidden" style={{ height: 'calc(100vh - 320px)', minHeight: '500px' }}>
        <div className="flex h-full">
          {/* Widget Palette */}
          {showPalette && isEditMode && (
            <WidgetPalette
              onWidgetAdd={handleWidgetAdd}
              addedWidgetIds={addedWidgetIds}
            />
          )}

          {/* Live Preview */}
          <DashboardLivePreview
            device={activeDevice}
            widgets={widgets}
            onWidgetRemove={handleWidgetRemove}
            onWidgetReorder={handleWidgetReorder}
            selectedWidgetId={selectedWidgetId}
            onWidgetSelect={setSelectedWidgetId}
            isEditMode={isEditMode}
          />

          {/* Widget Settings Panel */}
          {isEditMode && (
            <WidgetSettingsPanel
              widget={selectedWidget}
              onClose={() => setSelectedWidgetId(null)}
              onUpdate={handleWidgetUpdate}
              onDelete={handleWidgetRemove}
            />
          )}
        </div>
      </Card>
    </div>
  );
};
