
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format, startOfWeek, addDays, addWeeks, subWeeks } from 'date-fns';
import { de } from 'date-fns/locale';
import { ArrowLeft, ArrowRight, Info, Download } from 'lucide-react';
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useShiftPlanning } from '@/hooks/useShiftPlanning';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Hilfsfunktionen, um farblichen Besetzungsstatus zu ermitteln
const getOccupationStatus = (occupiedSlots: number, requiredSlots: number) => {
  if (occupiedSlots === 0) return 'empty';
  const ratio = occupiedSlots / requiredSlots;
  if (ratio < 0.5) return 'critical';
  if (ratio < 0.8) return 'warning';
  if (ratio <= 1.2) return 'optimal';
  return 'overbooked';
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'empty':
      return 'bg-gray-100 text-gray-500 border-gray-200';
    case 'critical':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'warning':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'optimal':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'overbooked':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-500 border-gray-200';
  }
};

const getStatusText = (status: string, occupiedSlots: number, requiredSlots: number) => {
  switch (status) {
    case 'empty':
      return 'Leer';
    case 'critical':
      return `Kritisch unterbesetzt (${occupiedSlots}/${requiredSlots})`;
    case 'warning':
      return `Unterbesetzt (${occupiedSlots}/${requiredSlots})`;
    case 'optimal':
      return `Optimal besetzt (${occupiedSlots}/${requiredSlots})`;
    case 'overbooked':
      return `Überbesetzt (${occupiedSlots}/${requiredSlots})`;
    default:
      return 'Unbekannt';
  }
};

const ShiftHeatmap = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekStart, setWeekStart] = useState(startOfWeek(currentDate, { weekStartsOn: 1 }));
  const { shifts, shiftTypes: dbShiftTypes, isLoading } = useShiftPlanning();

  useEffect(() => {
    setWeekStart(startOfWeek(currentDate, { weekStartsOn: 1 }));
  }, [currentDate]);

  // Generiere Tage der aktuellen Woche
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Schichttypen aus der Datenbank oder Fallback auf leere Liste
  const shiftTypes = dbShiftTypes?.length > 0 ? dbShiftTypes.map((st: any) => ({
    id: st.id,
    name: st.name,
    startTime: st.start_time || '08:00',
    endTime: st.end_time || '16:00',
    color: st.color || 'bg-blue-500'
  })) : [];

  // Besetzungsdaten aus echten Schichten berechnen
  const generateOccupationData = () => {
    const data: Record<string, Record<string, { required: number; occupied: number; status: string }>> = {};
    
    weekDays.forEach(day => {
      const dayKey = format(day, 'yyyy-MM-dd');
      data[dayKey] = {};
      
      shiftTypes.forEach((shift: any) => {
        // Zähle echte Schichten für diesen Tag und Schichttyp
        const shiftsForDay = (shifts || []).filter((s: any) => {
          const shiftDate = s.date || (s.start_time ? format(new Date(s.start_time), 'yyyy-MM-dd') : null);
          return shiftDate === dayKey && s.shift_type_id === shift.id;
        });
        
        const occupiedSlots = shiftsForDay.length;
        const requiredSlots = 3; // Standard-Soll (kann aus DB geladen werden)
        
        data[dayKey][shift.id] = {
          required: requiredSlots,
          occupied: occupiedSlots,
          status: getOccupationStatus(occupiedSlots, requiredSlots)
        };
      });
    });
    return data;
  };

  const [occupationData, setOccupationData] = useState(generateOccupationData());

  useEffect(() => {
    setOccupationData(generateOccupationData());
  }, [weekStart, shifts, shiftTypes]);

  const handleExport = () => {
    toast.success("Heatmap wird als PDF exportiert");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (shiftTypes.length === 0) {
    return (
      <Card className="p-12">
        <div className="text-center">
          <Info className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Keine Schichttypen definiert</h3>
          <p className="text-muted-foreground">Erstellen Sie zuerst Schichttypen in den Einstellungen, um die Heatmap zu nutzen.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold">Besetzungs-Heatmap</h2>
          <p className="text-sm text-muted-foreground">
            Visuelle Übersicht der Schichtbesetzung im Zeitverlauf
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentDate(prev => subWeeks(prev, 1))}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            {format(weekStart, 'dd.MM.', { locale: de })} - {format(addDays(weekStart, 6), 'dd.MM.yyyy', { locale: de })}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentDate(prev => addWeeks(prev, 1))}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportieren
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Schichtbesetzung im Wochenüberblick</CardTitle>
          <CardDescription>
            Farbkodierte Anzeige der Besetzungssituation nach Schichttyp und Tag
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex space-x-4">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <span className="text-xs">Kritisch</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <span className="text-xs">Unterbesetzt</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  <span className="text-xs">Optimal</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                  <span className="text-xs">Überbesetzt</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                  <span className="text-xs">Leer</span>
                </div>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Info className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="w-80">
                    <p className="text-sm">
                      Die Heatmap zeigt die Besetzungssituation für jede Schicht an jedem Tag. 
                      Hover über ein Feld, um detaillierte Informationen zu sehen.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-left p-2 w-[120px]"></th>
                    {weekDays.map(day => (
                      <th key={day.toISOString()} className="p-2 text-center min-w-[100px]">
                        <div className="font-medium">
                          {format(day, 'EEEE', { locale: de })}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {format(day, 'd. MMM', { locale: de })}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {shiftTypes.map((shiftType: any) => (
                    <tr key={shiftType.id}>
                      <td className="p-2 border-t">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full ${shiftType.color} mr-2`}></div>
                          <div>
                            <div className="font-medium">{shiftType.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {shiftType.startTime} - {shiftType.endTime}
                            </div>
                          </div>
                        </div>
                      </td>
                      {weekDays.map(day => {
                        const dayKey = format(day, 'yyyy-MM-dd');
                        const data = occupationData[dayKey]?.[shiftType.id] || { required: 0, occupied: 0, status: 'empty' };
                        const statusColor = getStatusColor(data.status);
                        const statusText = getStatusText(data.status, data.occupied, data.required);
                        
                        return (
                          <td key={day.toISOString()} className="p-2 border-t">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div 
                                    className={`h-14 rounded p-2 flex flex-col justify-center items-center ${statusColor} cursor-pointer hover:opacity-80`}
                                  >
                                    <div className="font-medium">{data.occupied}/{data.required}</div>
                                    <div className="text-xs">{data.status !== 'empty' ? 'Mitarbeiter' : ''}</div>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="space-y-1">
                                    <p className="font-medium">{shiftType.name}, {format(day, 'EEEE, d. MMMM', { locale: de })}</p>
                                    <p>{statusText}</p>
                                    {data.status !== 'empty' && data.status !== 'optimal' && (
                                      <p className="text-xs text-muted-foreground">
                                        Klicken, um Empfehlungen zur Optimierung zu sehen
                                      </p>
                                    )}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShiftHeatmap;
