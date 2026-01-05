import React, { useState } from 'react';
import { Trash2, Move, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface DashboardConfig {
  id: string;
  name: string;
  is_default: boolean;
  layout_config: any[];
}

interface LayoutGridProps {
  config: DashboardConfig;
  onConfigUpdate: (config: DashboardConfig) => void;
}

const LayoutGrid: React.FC<LayoutGridProps> = ({ config, onConfigUpdate }) => {
  const [selectedContainer, setSelectedContainer] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const removeWidget = async (containerId: string) => {
    try {
      // Entferne aus der Datenbank
      const { error } = await supabase
        .from('dashboard_containers')
        .delete()
        .eq('id', containerId);

      if (error) throw error;

      // Update lokale Konfiguration
      const updatedConfig = {
        ...config,
        layout_config: config.layout_config.filter(container => container.id !== containerId)
      };

      // Update Dashboard Config in der Datenbank
      await supabase
        .from('dashboard_configs')
        .update({ layout_config: updatedConfig.layout_config })
        .eq('id', config.id);

      onConfigUpdate(updatedConfig);
      toast.success('Widget wurde entfernt');
    } catch (error) {
      console.error('Fehler beim Entfernen des Widgets:', error);
      toast.error('Fehler beim Entfernen des Widgets');
    }
  };

  const updateContainer = async (containerId: string, updates: any) => {
    try {
      // Update in der Datenbank
      const { error } = await supabase
        .from('dashboard_containers')
        .update(updates)
        .eq('id', containerId);

      if (error) throw error;

      // Update lokale Konfiguration
      const updatedConfig = {
        ...config,
        layout_config: config.layout_config.map(container =>
          container.id === containerId ? { ...container, ...updates } : container
        )
      };

      // Update Dashboard Config in der Datenbank
      await supabase
        .from('dashboard_configs')
        .update({ layout_config: updatedConfig.layout_config })
        .eq('id', config.id);

      onConfigUpdate(updatedConfig);
      setEditDialogOpen(false);
      toast.success('Widget wurde aktualisiert');
    } catch (error) {
      console.error('Fehler beim Aktualisieren:', error);
      toast.error('Fehler beim Aktualisieren des Widgets');
    }
  };

  const openEditDialog = (container: any) => {
    setSelectedContainer(container);
    setEditDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Dashboard Layout</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border-2 border-dashed border-muted rounded-lg p-4">
          <div className="grid grid-cols-6 gap-3 min-h-[500px]">
            {config.layout_config.length === 0 ? (
              <div className="col-span-6 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-4">🎯</div>
                  <h3 className="text-lg font-medium mb-2">Ziehen Sie Widgets hierher</h3>
                  <p className="text-muted-foreground">
                    Wählen Sie Widgets aus der Seitenleiste aus
                  </p>
                </div>
              </div>
            ) : (
              config.layout_config.map((container, index) => (
                <div
                  key={container.id || index}
                  className={`
                    bg-background border border-border rounded-lg p-3 
                    hover:shadow-md transition-all duration-200
                    flex flex-col justify-between
                    group relative
                  `}
                  style={{
                    gridColumn: `span ${Math.min(container.width || 1, 6)}`,
                    gridRow: `span ${container.height || 1}`
                  }}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">
                        {container.display_name || container.widget_type}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {container.module_name}
                      </p>
                    </div>
                  </div>

                  {/* Content Preview */}
                  <div className="flex-1 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <div className="text-2xl mb-1">📊</div>
                      <div className="text-xs">
                        {container.width}x{container.height}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 flex space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={() => openEditDialog(container)}
                    >
                      <Settings className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => removeWidget(container.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Widget bearbeiten</DialogTitle>
            </DialogHeader>
            {selectedContainer && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Breite</Label>
                    <Select
                      value={selectedContainer.width?.toString() || '1'}
                      onValueChange={(value) =>
                        setSelectedContainer(prev => ({ ...prev, width: parseInt(value) }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Spalte</SelectItem>
                        <SelectItem value="2">2 Spalten</SelectItem>
                        <SelectItem value="3">3 Spalten</SelectItem>
                        <SelectItem value="4">4 Spalten</SelectItem>
                        <SelectItem value="5">5 Spalten</SelectItem>
                        <SelectItem value="6">6 Spalten</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Höhe</Label>
                    <Select
                      value={selectedContainer.height?.toString() || '1'}
                      onValueChange={(value) =>
                        setSelectedContainer(prev => ({ ...prev, height: parseInt(value) }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Reihe</SelectItem>
                        <SelectItem value="2">2 Reihen</SelectItem>
                        <SelectItem value="3">3 Reihen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                    Abbrechen
                  </Button>
                  <Button
                    onClick={() =>
                      updateContainer(selectedContainer.id, {
                        width: selectedContainer.width,
                        height: selectedContainer.height
                      })
                    }
                  >
                    Speichern
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default LayoutGrid;