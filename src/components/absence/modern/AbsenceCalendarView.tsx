import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { absenceService } from '@/services/absenceService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Filter,
  Download,
  Search,
  X
} from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import { de } from 'date-fns/locale';

export const AbsenceCalendarView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string | null>(null);

  const { data: absenceData = [], isLoading } = useQuery({
    queryKey: ['absence-requests'],
    queryFn: absenceService.getRequests
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getAbsencesForDate = (date: Date) => {
    return absenceData.filter(absence => {
      const absenceStart = new Date(absence.start_date);
      const absenceEnd = new Date(absence.end_date);
      return date >= absenceStart && date <= absenceEnd;
    });
  };

  const getAbsenceCountsByType = (absences: any[]) => {
    return {
      vacation: absences.filter(a => a.type === 'vacation').length,
      sick: absences.filter(a => a.type === 'sick').length,
      business: absences.filter(a => a.type === 'business').length,
      other: absences.filter(a => !['vacation', 'sick', 'business'].includes(a.type)).length
    };
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'vacation':
        return 'bg-blue-500';
      case 'sick':
        return 'bg-red-500';
      case 'business':
        return 'bg-purple-500';
      default:
        return 'bg-slate-500';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'vacation':
        return 'Urlaub';
      case 'sick':
        return 'Krank';
      case 'business':
        return 'Dienstreise';
      default:
        return type;
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => addMonths(prev, 1));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setShowDetailDialog(true);
    setSearchTerm('');
    setFilterType(null);
  };

  const getFilteredAbsences = () => {
    if (!selectedDate) return [];
    let absences = getAbsencesForDate(selectedDate);
    
    if (searchTerm) {
      absences = absences.filter(a => 
        a.employee_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterType) {
      absences = absences.filter(a => a.type === filterType);
    }
    
    return absences;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Abwesenheits-Kalender
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Neuer Antrag
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={handlePrevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-semibold">
                {format(currentDate, 'MMMM yyyy', { locale: de })}
              </h2>
              <Button variant="outline" size="sm" onClick={handleNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Urlaub</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm">Krank</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm">Dienstreise</span>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              const absences = getAbsencesForDate(day);
              const counts = getAbsenceCountsByType(absences);
              const totalCount = absences.length;
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isDayToday = isToday(day);
              
              return (
                <div
                  key={index}
                  className={`min-h-[80px] p-2 border rounded-lg cursor-pointer transition-colors ${
                    isCurrentMonth 
                      ? 'bg-card hover:bg-accent/50' 
                      : 'bg-muted/30 text-muted-foreground'
                  } ${
                    isDayToday ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleDateClick(day)}
                >
                  <div className="text-sm font-medium mb-1">
                    {format(day, 'd')}
                  </div>
                  
                  {totalCount > 0 && (
                    <div className="space-y-1">
                      {/* Kompakte Zähler nach Typ */}
                      <div className="flex flex-wrap gap-1">
                        {counts.vacation > 0 && (
                          <Badge variant="secondary" className="bg-blue-500 text-white text-xs px-1.5 py-0">
                            {counts.vacation}
                          </Badge>
                        )}
                        {counts.sick > 0 && (
                          <Badge variant="secondary" className="bg-red-500 text-white text-xs px-1.5 py-0">
                            {counts.sick}
                          </Badge>
                        )}
                        {counts.business > 0 && (
                          <Badge variant="secondary" className="bg-purple-500 text-white text-xs px-1.5 py-0">
                            {counts.business}
                          </Badge>
                        )}
                        {counts.other > 0 && (
                          <Badge variant="secondary" className="bg-slate-500 text-white text-xs px-1.5 py-0">
                            {counts.other}
                          </Badge>
                        )}
                      </div>
                      {/* Gesamt-Anzahl */}
                      <div className="text-xs text-muted-foreground">
                        {totalCount} Abwesend
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Abwesenheiten am {selectedDate && format(selectedDate, 'dd. MMMM yyyy', { locale: de })}
            </DialogTitle>
          </DialogHeader>
          
          {/* Suche und Filter */}
          <div className="flex items-center gap-3 py-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Mitarbeiter suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant={filterType === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType(null)}
              >
                Alle
              </Button>
              <Button
                variant={filterType === 'vacation' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('vacation')}
                className={filterType === 'vacation' ? 'bg-blue-500 hover:bg-blue-600' : ''}
              >
                Urlaub
              </Button>
              <Button
                variant={filterType === 'sick' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('sick')}
                className={filterType === 'sick' ? 'bg-red-500 hover:bg-red-600' : ''}
              >
                Krank
              </Button>
              <Button
                variant={filterType === 'business' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('business')}
                className={filterType === 'business' ? 'bg-purple-500 hover:bg-purple-600' : ''}
              >
                Dienstreise
              </Button>
            </div>
          </div>

          {/* Statistik-Badges */}
          {selectedDate && (
            <div className="flex items-center gap-3 pb-2 border-b">
              <span className="text-sm text-muted-foreground">Gesamt:</span>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                {getAbsencesForDate(selectedDate).filter(a => a.type === 'vacation').length} Urlaub
              </Badge>
              <Badge variant="secondary" className="bg-red-100 text-red-700">
                {getAbsencesForDate(selectedDate).filter(a => a.type === 'sick').length} Krank
              </Badge>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                {getAbsencesForDate(selectedDate).filter(a => a.type === 'business').length} Dienstreise
              </Badge>
            </div>
          )}

          {/* Scrollbare Liste */}
          <ScrollArea className="h-[400px] pr-4">
            {getFilteredAbsences().length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm || filterType 
                  ? 'Keine Abwesenheiten gefunden' 
                  : 'Keine Abwesenheiten an diesem Tag'}
              </div>
            ) : (
              <div className="space-y-2">
                {getFilteredAbsences().map((absence, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getTypeColor(absence.type)}`}></div>
                      <div>
                        <h4 className="font-medium">{absence.employee_name || 'Unbekannter Mitarbeiter'}</h4>
                        <p className="text-sm text-muted-foreground">
                          {getTypeLabel(absence.type)} • {format(new Date(absence.start_date), 'dd.MM.')} - {format(new Date(absence.end_date), 'dd.MM.yyyy')}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant={absence.status === 'approved' ? 'default' : 'secondary'}
                      className={absence.status === 'approved' ? 'bg-green-500' : ''}
                    >
                      {absence.status === 'approved' ? 'Genehmigt' : 'Ausstehend'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};