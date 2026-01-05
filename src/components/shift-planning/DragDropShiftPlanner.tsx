import React, { useState, useEffect, useMemo } from 'react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { de } from 'date-fns/locale';
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Filter, Plus, Clock, Users, Zap } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useShiftData } from '@/hooks/useShiftData';
import type { Shift } from '@/types/shift-planning';

interface Filters {
  department: string;
  search: string;
}

const getWeekDays = (anchor: Date) => {
  const monday = startOfWeek(anchor, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
};

const DragDropShiftPlanner: React.FC = () => {
  const [anchorDate, setAnchorDate] = useState<Date>(new Date());
  const [isAutoAssigning, setIsAutoAssigning] = useState<boolean>(false);
  const [filters, setFilters] = useState<Filters>({ department: 'Alle', search: '' });

  // Verwende den zentralen Hook für alle Schichtdaten
  const { 
    employees, 
    shiftTypes, 
    shifts, 
    isLoading, 
    refreshShifts, 
    createShift,
    updateShift 
  } = useShiftData(false); // false = Schichten nicht automatisch laden

  const weekDays = useMemo(() => getWeekDays(anchorDate), [anchorDate]);

  // Schichten für die aktuelle Woche laden 
  useEffect(() => {
    const start = weekDays[0];
    const end = weekDays[6];
    refreshShifts(start, end);
  }, [anchorDate, refreshShifts, weekDays]);

  const departments = useMemo(() => {
    const set = new Set<string>(['Alle']);
    employees.forEach((e) => set.add(e.department));
    return Array.from(set);
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    return employees.filter((e) => {
      const depOk = filters.department === 'Alle' || e.department === filters.department;
      const q = filters.search.trim().toLowerCase();
      const searchOk = !q || e.name.toLowerCase().includes(q);
      return depOk && searchOk;
    });
  }, [employees, filters]);

  const shiftsFor = (employeeId: string, day: Date) =>
    shifts.filter((s) => s.employeeId === employeeId && isSameDay(new Date(s.date), day));

  const getTypeColor = (typeId: string | undefined) => {
    const t = shiftTypes.find((st) => st.id === typeId);
    return t?.color || 'hsl(var(--primary))';
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;

    // Überprüfe ob es ein neuer Schichttyp ist (aus der Schichttypen-Liste)
    if (source.droppableId === 'shift-types' && destination.droppableId.includes('|')) {
      // Neue Schicht erstellen
      const [dateStr, employeeId] = destination.droppableId.split('|');
      const shiftType = shiftTypes.find(st => st.id === draggableId);
      
      if (!shiftType) return;

      try {
        const newShift = await createShift({
          type: shiftType.id,
          employeeId: employeeId,
          date: dateStr,
          start_time: `${dateStr}T${shiftType.start_time}:00Z`,
          end_time: `${dateStr}T${shiftType.end_time}:00Z`,
          status: 'scheduled',
          notes: `${shiftType.name} - Drag & Drop`,
        });
        
        if (newShift) {
          toast.success(`${shiftType.name} Schicht erstellt`);
        }
      } catch (e) {
        console.error(e);
        toast.error('Schicht konnte nicht erstellt werden');
      }
    } else if (destination.droppableId.includes('|') && source.droppableId.includes('|')) {
      // Existierende Schicht verschieben
      const [dateStr, employeeId] = destination.droppableId.split('|');

      try {
        const success = await updateShift(draggableId, {
          employeeId: employeeId,
          date: dateStr,
        });
        
        if (success) {
          toast.success('Schicht verschoben');
        }
      } catch (e) {
        console.error(e);
        toast.error('Verschieben fehlgeschlagen');
      }
    }
  };

  // Automatische Zuweisung durchführen
  const handleAutoAssign = async () => {
    if (shiftTypes.length === 0) {
      toast.error('Keine Schichttypen verfügbar');
      return;
    }

    setIsAutoAssigning(true);
    try {
      const startDate = weekDays[0].toISOString().split('T')[0];
      const endDate = weekDays[6].toISOString().split('T')[0];
      
      const { data, error } = await supabase.functions.invoke('auto-assign-shifts', {
        body: {
          startDate,
          endDate,
          shiftTypeIds: shiftTypes.map(st => st.id),
          department: filters.department === 'Alle' ? null : filters.department
        }
      });

      if (error) throw error;

      if (data.success) {
        toast.success(data.message);
        // Schichten für die aktuelle Woche neu laden
        const start = weekDays[0];
        const end = weekDays[6];
        await refreshShifts(start, end);
      } else {
        throw new Error(data.error || 'Automatische Zuweisung fehlgeschlagen');
      }
    } catch (e) {
      console.error('Fehler bei automatischer Zuweisung:', e);
      toast.error('Automatische Zuweisung fehlgeschlagen: ' + (e.message || 'Unbekannter Fehler'));
    } finally {
      setIsAutoAssigning(false);
    }
  };

  const hasConflict = (items: Shift[]) => {
    return items.length > 1;
  };

  return (
    <div className="space-y-6">
      {/* Header mit Navigationsleiste */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">Schichtplanung</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setAnchorDate((d) => addDays(d, -7))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {format(weekDays[0], 'dd.MM.')} – {format(weekDays[6], 'dd.MM.yyyy')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={anchorDate}
                  onSelect={(d) => d && setAnchorDate(d)}
                  initialFocus
                  locale={de}
                />
              </PopoverContent>
            </Popover>
            <Button variant="outline" size="sm" onClick={() => setAnchorDate((d) => addDays(d, 7))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleAutoAssign}
            disabled={isAutoAssigning || isLoading}
            className="gap-2"
          >
            {isAutoAssigning ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Zuweisen...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                Automatische Zuweisung
              </>
            )}
          </Button>
          <select
            className="rounded-md border bg-background px-3 py-2 text-sm"
            value={filters.department}
            onChange={(e) => setFilters((f) => ({ ...f, department: e.target.value }))}
          >
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <Input
            placeholder="Mitarbeiter suchen..."
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            className="w-48"
          />
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        {/* Verfügbare Schichttypen */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Verfügbare Schichttypen ziehen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Droppable droppableId="shift-types" direction="horizontal" isDropDisabled={true}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex flex-wrap gap-3"
                >
                  {shiftTypes.map((shiftType, index) => (
                    <Draggable key={shiftType.id} draggableId={shiftType.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`rounded-lg p-3 border-2 border-dashed transition-all cursor-move ${
                            snapshot.isDragging ? 'shadow-lg scale-105' : 'hover:shadow-md'
                          }`}
                          style={{
                            backgroundColor: shiftType.color + '20',
                            borderColor: shiftType.color,
                            ...provided.draggableProps.style,
                          }}
                        >
                          <div className="text-sm font-medium" style={{ color: shiftType.color }}>
                            {shiftType.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {shiftType.start_time} - {shiftType.end_time}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {shiftType.required_staff} Mitarbeiter
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </CardContent>
        </Card>

        {/* Wochenplan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Wochenplan ({filteredEmployees.length} Mitarbeiter)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-auto">
              <div className="min-w-[1000px]">
                {/* Kopfzeile: Wochentage */}
                <div className="grid grid-cols-[250px_repeat(7,minmax(140px,1fr))] border-b bg-muted/30 sticky top-0 z-10">
                  <div className="px-4 py-3 text-sm font-semibold">Mitarbeiter</div>
                  {weekDays.map((d) => (
                    <div key={d.toISOString()} className="px-3 py-3 text-sm font-semibold text-center">
                      <div>{format(d, 'EEE', { locale: de })}</div>
                      <div className="text-xs text-muted-foreground">
                        {format(d, 'dd.MM.', { locale: de })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Mitarbeiterzeilen */}
                {filteredEmployees.map((emp) => (
                  <div
                    key={emp.id}
                    className="grid grid-cols-[250px_repeat(7,minmax(140px,1fr))] border-b hover:bg-muted/20"
                  >
                    {/* Mitarbeiter-Info */}
                    <div className="px-4 py-4 flex items-center gap-3 border-r">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                        {emp.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{emp.name}</div>
                        <div className="text-xs text-muted-foreground">{emp.department}</div>
                      </div>
                    </div>

                    {/* Wochentage */}
                    {weekDays.map((day) => {
                      const cellShifts = shiftsFor(emp.id, day);
                      const conflict = hasConflict(cellShifts);
                      const droppableId = `${format(day, 'yyyy-MM-dd')}|${emp.id}`;
                      
                      return (
                        <Droppable droppableId={droppableId} key={droppableId}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className={`p-2 min-h-[80px] border-l relative ${
                                snapshot.isDraggingOver ? 'bg-primary/5 ring-2 ring-primary/20' : ''
                              } ${conflict ? 'bg-destructive/5 ring-1 ring-destructive/40' : ''}`}
                            >
                              {cellShifts.length === 0 && (
                                <div className="absolute inset-2 border-2 border-dashed border-muted-foreground/20 rounded-md flex items-center justify-center text-xs text-muted-foreground">
                                  Hier ablegen
                                </div>
                              )}

                              {cellShifts.map((shift, idx) => (
                                <Draggable key={shift.id} draggableId={shift.id} index={idx}>
                                  {(dragProvided, dragSnapshot) => (
                                    <div
                                      ref={dragProvided.innerRef}
                                      {...dragProvided.draggableProps}
                                      {...dragProvided.dragHandleProps}
                                      className={`mb-2 rounded-md px-2 py-2 text-xs text-white shadow-sm transition-all ${
                                        dragSnapshot.isDragging ? 'shadow-lg scale-105' : ''
                                      }`}
                                      style={{
                                        background: getTypeColor(shift.type),
                                        ...dragProvided.draggableProps.style,
                                      }}
                                    >
                                      <div className="font-medium truncate">
                                        {shiftTypes.find(st => st.id === shift.type)?.name || 'Unbekannt'}
                                      </div>
                                      <div className="text-[10px] opacity-90">
                                        {format(shift.start_time ? new Date(shift.start_time) : new Date(`${shift.date}T08:00:00`), 'HH:mm')} - 
                                        {format(shift.end_time ? new Date(shift.end_time) : new Date(`${shift.date}T16:00:00`), 'HH:mm')}
                                      </div>
                                      {shift.status === 'conflict' && (
                                        <Badge variant="destructive" className="h-4 text-[9px] mt-1">
                                          Konflikt
                                        </Badge>
                                      )}
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
            
            {filteredEmployees.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                Keine Mitarbeiter gefunden
              </div>
            )}
          </CardContent>
        </Card>
      </DragDropContext>

      {/* Status/Hilfe */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Ziehe Schichttypen auf die Mitarbeiter oder verschiebe existierende Schichten per Drag & Drop
        </div>
        {isLoading && (
          <div className="flex items-center gap-2">
            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
            Lade...
          </div>
        )}
      </div>
    </div>
  );
};

export default DragDropShiftPlanner;