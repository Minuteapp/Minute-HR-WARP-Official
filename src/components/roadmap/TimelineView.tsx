import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Users, 
  Filter,
  SortAsc,
  Settings2,
  MoreHorizontal,
  Clock,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimelineEvent {
  id: string;
  title: string;
  category: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  color: string;
  assignees: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
  tags?: string[];
  progress?: number;
  isAllDay?: boolean;
}

interface TimelineProps {
  roadmapId?: string;
  roadmaps?: any[];
}

// Konvertiere Roadmap-Daten zu Timeline-Events
const convertRoadmapsToEvents = (roadmaps: any[]): TimelineEvent[] => {
  if (!roadmaps || roadmaps.length === 0) return [];
  
  return roadmaps.map((roadmap, index) => ({
    id: roadmap.id,
    title: roadmap.title,
    category: 'Roadmap',
    description: roadmap.description || 'Roadmap',
    startDate: roadmap.start_date ? new Date(roadmap.start_date) : new Date(),
    endDate: roadmap.end_date ? new Date(roadmap.end_date) : undefined,
    color: `bg-gradient-to-r from-blue-500 to-purple-600`,
    assignees: [],
    tags: [roadmap.status || 'draft'],
    progress: 0
  }));
};

export const TimelineView = ({ roadmapId, roadmaps = [] }: TimelineProps) => {
  const [currentPeriod, setCurrentPeriod] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [showDone, setShowDone] = useState(true);
  
  const timelineEvents = convertRoadmapsToEvents(roadmaps);

  // Berechne den Zeitbereich basierend auf currentPeriod und viewMode
  const getTimeRange = () => {
    const start = new Date(currentPeriod);
    const end = new Date(currentPeriod);
    
    switch (viewMode) {
      case 'day':
        end.setDate(start.getDate() + 1);
        break;
      case 'week':
        start.setDate(start.getDate() - 3); // 3 Tage zurück
        end.setDate(start.getDate() + 14);   // 14 Tage vorwärts (2 Wochen)
        break;
      case 'month':
        start.setDate(1);
        end.setMonth(start.getMonth() + 2);
        end.setDate(0);
        break;
    }
    
    return { start, end };
  };

  const { start: periodStart, end: periodEnd } = getTimeRange();

  // Generiere Tage für die Timeline
  const generateDays = () => {
    const days = [];
    const current = new Date(periodStart);
    
    while (current <= periodEnd) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const days = generateDays();

  // Navigiere in der Zeit
  const navigatePeriod = (direction: 'prev' | 'next') => {
    const newPeriod = new Date(currentPeriod);
    
    switch (viewMode) {
      case 'day':
        newPeriod.setDate(newPeriod.getDate() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newPeriod.setDate(newPeriod.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'month':
        newPeriod.setMonth(newPeriod.getMonth() + (direction === 'next' ? 1 : -1));
        break;
    }
    
    setCurrentPeriod(newPeriod);
  };

  const getPeriodLabel = () => {
    if (viewMode === 'week') {
      const endWeek = new Date(periodEnd);
      endWeek.setDate(endWeek.getDate() - 1);
      return `${periodStart.getDate()} ${periodStart.toLocaleDateString('de-DE', { month: 'short' })} - ${endWeek.getDate()} ${endWeek.toLocaleDateString('de-DE', { month: 'short' })}`;
    }
    
    return periodStart.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
  };

  // Berechne die Position eines Events
  const getEventPosition = (event: TimelineEvent) => {
    const totalDays = days.length;
    const startIndex = days.findIndex(day => 
      day.toDateString() === event.startDate.toDateString()
    );
    
    if (startIndex === -1) return null;
    
    const endIndex = event.endDate 
      ? days.findIndex(day => day.toDateString() === event.endDate.toDateString())
      : startIndex;
    
    const left = (startIndex / totalDays) * 100;
    const width = ((endIndex - startIndex + 1) / totalDays) * 100;
    
    return { left: `${left}%`, width: `${Math.max(width, 8)}%` };
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('de-DE', {
      weekday: 'short',
      day: '2-digit'
    });
  };

  const formatDayOnly = (date: Date) => {
    const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    return {
      weekday: weekdays[date.getDay()],
      day: date.getDate()
    };
  };

  // Gruppiere Tage nach Monaten
  const groupDaysByMonth = () => {
    const monthGroups: { [key: string]: Date[] } = {};
    
    days.forEach(day => {
      const monthKey = day.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
      if (!monthGroups[monthKey]) {
        monthGroups[monthKey] = [];
      }
      monthGroups[monthKey].push(day);
    });
    
    return monthGroups;
  };

  const monthGroups = groupDaysByMonth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Timeline</h2>
          <p className="text-muted-foreground">
            Detaillierte, visuelle Darstellung der Projekt-Reise mit wichtigen Meilensteinen,
            Fortschrittsupdates und anstehenden Aufgaben.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-2">
            <Calendar className="h-4 w-4" />
            {timelineEvents.length} Roadmap{timelineEvents.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* View Mode Buttons */}
          <div className="flex items-center gap-1">
            {(['day', 'week', 'month'] as const).map((mode) => (
              <Button
                key={mode}
                variant={viewMode === mode ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode(mode)}
                className="capitalize"
              >
                {mode === 'day' ? 'Tag' : mode === 'week' ? 'Woche' : 'Monat'}
              </Button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => navigatePeriod('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium min-w-[140px] text-center">
              {getPeriodLabel()}
            </span>
            <Button variant="outline" size="icon" onClick={() => navigatePeriod('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDone(!showDone)}
            className="gap-2"
          >
            Abgeschlossen anzeigen
            <div className={cn(
              "w-6 h-3 rounded-full transition-colors",
              showDone ? "bg-primary" : "bg-muted"
            )}>
              <div className={cn(
                "w-3 h-3 rounded-full bg-white transition-transform",
                showDone ? "translate-x-3" : "translate-x-0"
              )} />
            </div>
          </Button>
          
          <Button variant="outline" size="sm" className="gap-2">
            <SortAsc className="h-4 w-4" />
            Sortieren
          </Button>
          
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Filtern
          </Button>
        </div>
      </div>

      {/* Timeline Grid */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {/* Month Headers */}
          <div className="border-b bg-muted/20">
            <div className="flex">
              {Object.entries(monthGroups).map(([month, monthDays], index) => (
                <div
                  key={month}
                  className="text-lg font-semibold p-4 border-r border-border/50 text-left"
                  style={{ width: `${(monthDays.length / days.length) * 100}%` }}
                >
                  {month}
                </div>
              ))}
              <div className="text-lg font-semibold p-4 text-muted-foreground text-right flex-1">
                Feb '25
              </div>
            </div>
          </div>

          {/* Day Headers */}
          <div className="border-b bg-background">
            <div className="flex">
              {days.map((day, index) => {
                const { weekday, day: dayNum } = formatDayOnly(day);
                const isToday = day.toDateString() === new Date().toDateString();
                const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                
                return (
                  <div
                    key={index}
                    className={cn(
                      "flex-1 text-center py-3 border-r border-border/30 min-w-[40px]",
                      isWeekend && "text-muted-foreground bg-muted/10",
                      isToday && "bg-primary/10 text-primary font-semibold"
                    )}
                  >
                    <div className="text-xs font-medium mb-1">
                      {weekday}
                    </div>
                    <div className="text-base">
                      {dayNum}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Timeline Events */}
          <div className="relative p-4" style={{ minHeight: '400px' }}>
            {/* Vertical Grid Lines */}
            <div className="absolute inset-0 flex">
              {days.map((day, index) => (
                <div
                  key={index}
                  className="flex-1 border-r border-border/10"
                />
              ))}
            </div>

            {/* Events */}
            <div className="relative space-y-6">
              {timelineEvents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p>Keine Roadmaps für die Timeline verfügbar</p>
                </div>
              ) : (
                timelineEvents.map((event, eventIndex) => {
                const position = getEventPosition(event);
                if (!position) return null;

                return (
                  <div key={event.id} className="relative">
                    {/* Connection Lines to previous event */}
                    {eventIndex > 0 && (
                      <div className="absolute -top-3 left-4 right-4 h-px bg-border/30" />
                    )}
                    
                    {/* Event Bar */}
                    <div className="relative h-12 group">
                      <div
                        className={cn(
                          "absolute h-8 rounded-lg flex items-center gap-2 px-3 shadow-sm",
                          "hover:shadow-md transition-all duration-200 cursor-pointer",
                          "group-hover:scale-[1.02] group-hover:z-10",
                          event.color
                        )}
                        style={{
                          left: position.left,
                          width: position.width,
                          minWidth: '120px',
                          top: '8px'
                        }}
                      >
                        <div className="flex items-center gap-2 text-white text-sm font-medium truncate flex-1">
                          <span className="truncate">{event.title}</span>
                        </div>
                        
                        {event.tags && event.tags.length > 0 && (
                          <Badge variant="secondary" className="h-5 text-xs bg-white/20 text-white border-white/30">
                            {event.tags[0]}
                          </Badge>
                        )}
                      </div>

                      {/* Event Description */}
                      <div 
                        className="absolute text-xs text-muted-foreground"
                        style={{ 
                          left: position.left,
                          top: '44px'
                        }}
                      >
                        <div className="flex items-center gap-1">
                          <span className="inline-block w-2 h-2 rounded-full bg-muted-foreground/40"></span>
                          <span>{event.description}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
