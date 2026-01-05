import React, { useState } from 'react';
import { Layout } from 'react-grid-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { WidgetLibrary } from './WidgetLibrary';
import { DashboardCanvas } from './DashboardCanvas';
import { WidgetConfigPanel } from './WidgetConfigPanel';
import { TemplateSelector } from './TemplateSelector';
import { useDashboardLayout } from '@/hooks/dashboard/useDashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Save, Eye, RotateCcw, Loader2, Monitor, Smartphone } from 'lucide-react';
import { toast } from 'sonner';

interface DashboardWidget {
  i: string;
  type: string;
  x: number;
  y: number;
  w: number;
  h: number;
  config: {
    title: string;
    icon?: string;
    dataSource?: string;
    color?: string;
    actions?: string[];
  };
}

export const VisualDashboardEditor: React.FC = () => {
  const { user } = useAuth();
  const [isEditMode, setIsEditMode] = useState(true);
  const [selectedWidget, setSelectedWidget] = useState<DashboardWidget | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [deviceType, setDeviceType] = useState<'desktop' | 'mobile'>('desktop');
  const [showTemplates, setShowTemplates] = useState(false);

  // Get user role from user_roles table
  const [userRole, setUserRole] = React.useState<string>('employee');
  
  React.useEffect(() => {
    if (user?.id) {
      // Fetch user role from database
      supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single()
        .then(({ data }) => {
          if (data) setUserRole(data.role);
        });
    }
  }, [user?.id]);

  const {
    currentLayout,
    setCurrentLayout,
    roleTemplates,
    saveLayout,
    applyTemplate,
    resetToDefault,
    isSaving,
    isCustom
  } = useDashboardLayout(user?.id, userRole);

  const handleLayoutChange = (layout: Layout[], widgets: DashboardWidget[]) => {
    setCurrentLayout(widgets);
  };

  const handleWidgetRemove = (widgetId: string) => {
    setCurrentLayout(currentLayout.filter(w => w.i !== widgetId));
    if (selectedWidget?.i === widgetId) {
      setSelectedWidget(null);
    }
  };

  const handleWidgetSave = (updatedWidget: DashboardWidget) => {
    setCurrentLayout(
      currentLayout.map(w => w.i === updatedWidget.i ? updatedWidget : w)
    );
  };

  const handleSave = () => {
    saveLayout(currentLayout);
  };

  const handleReset = () => {
    if (confirm('Möchten Sie wirklich alle Änderungen zurücksetzen?')) {
      resetToDefault();
      setSelectedWidget(null);
    }
  };

  const cols = deviceType === 'mobile' ? 2 : 4;
  const rowHeight = deviceType === 'mobile' ? 120 : 140;

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="edit-mode" className="text-sm font-medium">
                Bearbeitungsmodus
              </Label>
              <Switch
                id="edit-mode"
                checked={isEditMode}
                onCheckedChange={setIsEditMode}
              />
            </div>

            <Separator orientation="vertical" className="h-6" />

            <div className="flex items-center gap-2">
              <Button
                variant={deviceType === 'desktop' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDeviceType('desktop')}
              >
                <Monitor className="h-4 w-4 mr-1" />
                Desktop
              </Button>
              <Button
                variant={deviceType === 'mobile' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDeviceType('mobile')}
              >
                <Smartphone className="h-4 w-4 mr-1" />
                Mobile
              </Button>
            </div>

            <Separator orientation="vertical" className="h-6" />

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTemplates(!showTemplates)}
            >
              {showTemplates ? 'Editor anzeigen' : 'Vorlagen anzeigen'}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {isCustom && (
              <Badge variant="secondary">Angepasst</Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={isSaving}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Zurücksetzen
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditMode(false)}
            >
              <Eye className="h-4 w-4 mr-1" />
              Vorschau
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || currentLayout.length === 0}
              size="sm"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-1" />
              )}
              Speichern
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {showTemplates ? (
        <div className="flex-1 overflow-auto p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Vorlagen für Ihre Rolle</h3>
            <p className="text-sm text-muted-foreground">
              Wählen Sie eine Vorlage als Ausgangspunkt für Ihr Dashboard
            </p>
          </div>
          <TemplateSelector
            templates={roleTemplates}
            onApplyTemplate={(templateId) => {
              applyTemplate(templateId);
              setShowTemplates(false);
              toast.success('Vorlage angewendet');
            }}
            isLoading={isSaving}
          />
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden">
          {isEditMode && (
            <WidgetLibrary
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          )}

          <DashboardCanvas
            widgets={currentLayout}
            onLayoutChange={handleLayoutChange}
            onWidgetRemove={handleWidgetRemove}
            onWidgetSelect={setSelectedWidget}
            isEditMode={isEditMode}
            cols={cols}
            rowHeight={rowHeight}
          />

          {isEditMode && (
            <WidgetConfigPanel
              widget={selectedWidget}
              onClose={() => setSelectedWidget(null)}
              onSave={handleWidgetSave}
            />
          )}
        </div>
      )}
    </div>
  );
};
