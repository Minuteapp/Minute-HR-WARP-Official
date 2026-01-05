
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Clock, Users, Palette, Edit, Trash2 } from 'lucide-react';
import { shiftPlanningService } from '@/services/shiftPlanningService';
import { ShiftType } from '@/types/shift-planning';
import { toast } from 'sonner';

const ShiftTypes = () => {
  const [shiftTypes, setShiftTypes] = useState<ShiftType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadShiftTypes();
  }, []);

  const loadShiftTypes = async () => {
    setIsLoading(true);
    try {
      const types = await shiftPlanningService.getShiftTypes();
      setShiftTypes(types);
    } catch (error) {
      console.error('Fehler beim Laden der Schichttypen:', error);
      toast.error('Fehler beim Laden der Schichttypen');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5); // HH:MM Format
  };

  const calculateDuration = (startTime: string, endTime: string) => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    
    // Handle overnight shifts
    if (end < start) {
      end.setDate(end.getDate() + 1);
    }
    
    const diffMs = end.getTime() - start.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    return `${diffHours}h`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Schichttypen</h2>
          <p className="text-muted-foreground">
            Verwalten Sie die verschiedenen Schichttypen für Ihr Unternehmen
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Neuer Schichttyp
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shiftTypes.map((shiftType) => (
          <Card key={shiftType.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: shiftType.color }}
                  />
                  {shiftType.name}
                </CardTitle>
                <Badge variant={shiftType.is_active ? "default" : "secondary"}>
                  {shiftType.is_active ? "Aktiv" : "Inaktiv"}
                </Badge>
              </div>
              {shiftType.description && (
                <p className="text-sm text-muted-foreground">
                  {shiftType.description}
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">
                      {formatTime(shiftType.start_time)} - {formatTime(shiftType.end_time)}
                    </div>
                    <div className="text-muted-foreground">
                      {calculateDuration(shiftType.start_time, shiftType.end_time)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">
                      {shiftType.min_employees} - {shiftType.max_employees}
                    </div>
                    <div className="text-muted-foreground">
                      Mitarbeiter
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="h-4 w-4 mr-2" />
                  Bearbeiten
                </Button>
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {shiftTypes.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Keine Schichttypen gefunden</h3>
            <p className="text-muted-foreground mb-6">
              Erstellen Sie Ihren ersten Schichttyp, um mit der Schichtplanung zu beginnen.
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Ersten Schichttyp erstellen
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ShiftTypes;
