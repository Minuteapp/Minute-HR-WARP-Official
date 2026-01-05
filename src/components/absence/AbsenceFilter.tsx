
import { useState, useEffect } from 'react';
import { useAbsenceManagement } from '@/hooks/useAbsenceManagement';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, SearchIcon, FilterIcon, XIcon, CheckIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { AbsenceType, AbsenceStatus } from '@/types/absence.types';

export const AbsenceFilter = () => {
  const { updateFilter, filter, getTypeLabel } = useAbsenceManagement();
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    filter.start_date && filter.end_date
      ? { from: filter.start_date, to: filter.end_date }
      : undefined
  );
  const [selectedStatuses, setSelectedStatuses] = useState<AbsenceStatus[]>(
    filter.status || []
  );
  const [selectedTypes, setSelectedTypes] = useState<AbsenceType[]>(
    filter.types || []
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Filter aktualisieren, wenn sich Datumsbereich ändert
  useEffect(() => {
    if (dateRange?.from) {
      updateFilter({
        start_date: dateRange.from,
        end_date: dateRange.to || dateRange.from
      });
    } else if (filter.start_date || filter.end_date) {
      // Wenn das Datum zurückgesetzt wurde, entferne die Filter
      updateFilter({
        start_date: undefined,
        end_date: undefined
      });
    }
  }, [dateRange, updateFilter]);

  // Filter aktualisieren, wenn sich Status ändert
  useEffect(() => {
    updateFilter({ status: selectedStatuses.length > 0 ? selectedStatuses : undefined });
  }, [selectedStatuses, updateFilter]);

  // Filter aktualisieren, wenn sich Typen ändern
  useEffect(() => {
    updateFilter({ types: selectedTypes.length > 0 ? selectedTypes : undefined });
  }, [selectedTypes, updateFilter]);

  const toggleStatus = (status: AbsenceStatus) => {
    setSelectedStatuses(prev => 
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const toggleType = (type: AbsenceType) => {
    setSelectedTypes(prev => 
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const clearFilters = () => {
    setDateRange(undefined);
    setSelectedStatuses([]);
    setSelectedTypes([]);
    setSearchQuery('');
    updateFilter({
      start_date: undefined,
      end_date: undefined,
      status: undefined,
      types: undefined
    });
  };

  const handleSearch = () => {
    // Implementiere Suche nach Mitarbeiternamen oder Abteilung
    console.log('Searching for:', searchQuery);
    // Dies würde normalerweise Filter für Mitarbeitername oder Abteilung setzen
  };

  // Korrigierte Handler-Funktion für die Datumsauswahl
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
  };

  const hasActiveFilters = dateRange?.from || selectedStatuses.length > 0 || selectedTypes.length > 0 || searchQuery;

  return (
    <Card>
      <CardContent className="py-4">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <SearchIcon className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Nach Mitarbeiter suchen..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button onClick={handleSearch}>Suchen</Button>
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center"
            >
              <FilterIcon className="h-4 w-4 mr-2" />
              Filter
              {hasActiveFilters && (
                <Badge variant="default" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                  {(dateRange?.from ? 1 : 0) + selectedStatuses.length + selectedTypes.length}
                </Badge>
              )}
            </Button>
            {hasActiveFilters && (
              <Button 
                variant="ghost" 
                onClick={clearFilters}
                size="sm"
                className="text-muted-foreground"
              >
                <XIcon className="h-4 w-4 mr-1" />
                Filter zurücksetzen
              </Button>
            )}
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <div className="space-y-2">
                <Label>Zeitraum</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left",
                        !dateRange && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "dd.MM.yyyy", { locale: de })} -{" "}
                            {format(dateRange.to, "dd.MM.yyyy", { locale: de })}
                          </>
                        ) : (
                          format(dateRange.from, "dd.MM.yyyy", { locale: de })
                        )
                      ) : (
                        "Zeitraum auswählen"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={(range) => handleDateRangeChange(range as DateRange | undefined)}
                      numberOfMonths={2}
                      locale={de}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(['pending', 'approved', 'rejected', 'archived'] as AbsenceStatus[]).map((status) => (
                    <Button 
                      key={status}
                      variant={selectedStatuses.includes(status) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleStatus(status)}
                      className="justify-start"
                    >
                      {selectedStatuses.includes(status) && <CheckIcon className="mr-2 h-4 w-4" />}
                      <span>{status === 'pending' ? 'Beantragt' : 
                             status === 'approved' ? 'Genehmigt' : 
                             status === 'rejected' ? 'Abgelehnt' : 'Archiviert'}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Typ</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(['vacation', 'sick_leave', 'parental', 'other', 'business_trip'] as AbsenceType[]).map((type) => (
                    <Button 
                      key={type}
                      variant={selectedTypes.includes(type) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleType(type)}
                      className="justify-start"
                    >
                      {selectedTypes.includes(type) && <CheckIcon className="mr-2 h-4 w-4" />}
                      <span>{getTypeLabel(type)}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
