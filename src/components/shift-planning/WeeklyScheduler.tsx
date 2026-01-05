import React, { useEffect, useMemo, useState } from 'react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { de } from 'date-fns/locale';
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { shiftPlanningService } from '@/services/shiftPlanningService';
import type { Employee, Shift, ShiftType } from '@/types/shift-planning';

interface Filters {
  department: string;
  search: string;
}

const getWeekDays = (anchor: Date) => {
  const monday = startOfWeek(anchor, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
};

const WeeklyScheduler: React.FC = () => {
  const [anchorDate, setAnchorDate] = useState<Date>(new Date());
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shiftTypes, setShiftTypes] = useState<ShiftType[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [filters, setFilters] = useState<Filters>({ department: 'Alle', search: '' });

  const weekDays = useMemo(() => getWeekDays(anchorDate), [anchorDate]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [emps, types] = await Promise.all([
        shiftPlanningService.getEmployees(),
        shiftPlanningService.getShiftTypes(),
      ]);
      setEmployees(emps);
      setShiftTypes(types);

      const start = weekDays[0];
      const end = weekDays[6];
      const data = await shiftPlanningService.getShifts(start, end);
      setShifts(data);
    } catch (e) {
      console.error(e);
      toast.error('Fehler beim Laden der Schichtdaten');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Beim ersten Rendern und bei Wochenwechsel laden
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anchorDate]);

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
    const { destination, draggableId } = result;
    if (!destination) return;

    // destination.droppableId ist in Form: `${date}|${employeeId}`
    const [dateStr, employeeId] = destination.droppableId.split('|');

    try {
      setIsLoading(true);
      // Lokal aktualisieren
      setShifts((prev) =>
        prev.map((s) => (s.id === draggableId ? { ...s, date: dateStr, employeeId } : s))
      );
      // Server aktualisieren (Mitarbeiter + Datum)
      const updated = await shiftPlanningService.updateShift(draggableId, {
        employeeId,
        date: dateStr,
      } as any);
      if (!updated) throw new Error('Update fehlgeschlagen');
      toast.success('Schicht verschoben');
    } catch (e) {
      console.error(e);
      toast.error('Verschieben fehlgeschlagen');
      loadData();
    } finally {
      setIsLoading(false);
    }
  };

  const quickCreate = async (employeeId: string, date: Date) => {
    const dayStr = format(date, 'yyyy-MM-dd');
    const defaultType = shiftTypes[0];
    if (!defaultType) {
      toast.error('Keine Schichtarten definiert');
      return;
    }
    try {
      setIsLoading(true);
      const created = await shiftPlanningService.createShift({
        shiftTypeId: defaultType.id,
        employeeId,
        date: dayStr,
        startTime: defaultType.start_time,
        endTime: defaultType.end_time,
        notes: 'Schnellerfassung',
      });
      if (created) {
        setShifts((prev) => [...prev, created]);
        toast.success('Schicht erstellt');
      } else {
        toast.error('Erstellen fehlgeschlagen');
      }
    } catch (e) {
      console.error(e);
      toast.error('Erstellen fehlgeschlagen');
    } finally {
      setIsLoading(false);
    }
  };

  const hasConflict = (items: Shift[]) => {
    // Einfacher Konflikt: Mehr als eine Schicht am selben Tag für Mitarbeiter
    if (items.length <= 1) return false;
    // Optional: Zeit-Überlappung prüfen, wenn Zeiten vorhanden sind
    return true;
  };

  return (
    <div className="flex gap-4">
      {/* Filterleiste links */}
      <aside className="w-64 shrink-0 space-y-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <h2 className="text-sm font-medium">Filter</h2>
        </div>
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Abteilung</label>
          <select
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            value={filters.department}
            onChange={(e) => setFilters((f) => ({ ...f, department: e.target.value }))}
          >
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Suche</label>
          <Input
            placeholder="Mitarbeiter suchen"
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Zeitraum</label>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setAnchorDate((d) => addDays(d, -7))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
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
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            <Button variant="outline" size="icon" onClick={() => setAnchorDate((d) => addDays(d, 7))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div>
          <Button variant="secondary" className="w-full" onClick={loadData} disabled={isLoading}>
            Aktualisieren
          </Button>
        </div>
      </aside>

      {/* Kalenderbereich */}
      <section className="flex-1">
        <div className="overflow-auto rounded-lg border">
          <div className="min-w-[900px]">
            {/* Kopfzeile: Wochentage */}
            <div className="grid grid-cols-[240px_repeat(7,minmax(120px,1fr))] border-b bg-muted/30">
              <div className="px-3 py-2 text-sm font-medium">Mitarbeiter</div>
              {weekDays.map((d) => (
                <div key={d.toISOString()} className="px-3 py-2 text-sm font-medium">
                  {format(d, 'EEE dd.MM.', { locale: de })}
                </div>
              ))}
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
              {filteredEmployees.map((emp) => (
                <div
                  key={emp.id}
                  className="grid grid-cols-[240px_repeat(7,minmax(120px,1fr))] border-b"
                >
                  {/* Mitarbeiter-Spalte */}
                  <div className="px-3 py-3 flex items-center gap-2">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium leading-5">{emp.name}</span>
                      <span className="text-xs text-muted-foreground">{emp.department}</span>
                    </div>
                  </div>

                  {/* 7 Tages-Zellen */}
                  {weekDays.map((day) => {
                    const cellShifts = shiftsFor(emp.id, day);
                    const conflict = hasConflict(cellShifts);
                    const droppableId = `${format(day, 'yyyy-MM-dd')}|${emp.id}`;
                    return (
                      <Droppable droppableId={droppableId} key={droppableId}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`px-2 py-2 min-h-[72px] border-l ${
                              conflict ? 'bg-destructive/5 ring-1 ring-destructive/40' : ''
                            }`}
                            onDoubleClick={() => quickCreate(emp.id, day)}
                          >
                            {cellShifts.length === 0 ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 opacity-60 hover:opacity-100"
                                onClick={() => quickCreate(emp.id, day)}
                              >
                                <Plus className="mr-1 h-3 w-3" /> Neu
                              </Button>
                            ) : null}

                            {cellShifts.map((s, idx) => (
                              <Draggable key={s.id} draggableId={s.id} index={idx}>
                                {(dragProvided) => (
                                  <div
                                    ref={dragProvided.innerRef}
                                    {...dragProvided.draggableProps}
                                    {...dragProvided.dragHandleProps}
                                    className={`mb-2 rounded-md px-2 py-1 text-xs text-white shadow-sm`}
                                    style={{
                                      background: getTypeColor(s.type),
                                      ...dragProvided.draggableProps.style,
                                    }}
                                    title={`${format(s.start_time ? new Date(s.start_time) : new Date(`${s.date}T08:00:00`), 'HH:mm')} – ${format(s.end_time ? new Date(s.end_time) : new Date(`${s.date}T16:00:00`), 'HH:mm')}`}
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="truncate">
                                        {s.employeeName || emp.name}
                                      </span>
                                      {s.status === 'conflict' && (
                                        <Badge variant="destructive" className="h-5 text-[10px]">Konflikt</Badge>
                                      )}
                                    </div>
                                    <div className="text-[10px] opacity-90">
                                      {format(s.start_time ? new Date(s.start_time) : new Date(`${s.date}T08:00:00`), 'HH:mm')}–
                                      {format(s.end_time ? new Date(s.end_time) : new Date(`${s.date}T16:00:00`), 'HH:mm')}
                                    </div>
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
            </DragDropContext>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
          <div>
            Tipp: Doppelklick in eine Zelle erstellt schnell eine neue Schicht.
          </div>
          {isLoading && <div className="animate-pulse">Lade…</div>}
        </div>
      </section>
    </div>
  );
};

export default WeeklyScheduler;
