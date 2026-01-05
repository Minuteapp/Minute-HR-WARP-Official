import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarEvent, CalendarViewType } from '@/types/calendar';
import { 
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Users,
  BriefcaseIcon,
  GraduationCap,
  FileText as FileTextIcon,
  User,
  Clock
} from "lucide-react";
import { format, addMonths, subMonths } from 'date-fns';
import { de } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import DayView from '@/components/calendar/views/DayView';
import WeekView from '@/components/calendar/views/WeekView';
import MonthView from '@/components/calendar/views/MonthView';
import { AgendaView } from '@/components/calendar/views/agenda';

interface EnhancedCalendarViewProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onNewEvent?: () => void;
  onDateSelect?: (date: Date) => void;
}

const EnhancedCalendarView: React.FC<EnhancedCalendarViewProps> = ({ 
  events = [], // Standardwert als leeres Array hinzugefügt
  onEventClick,
  onNewEvent,
  onDateSelect
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarViewType>('month');
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [activeFilters, setActiveFilters] = useState<Record<string, boolean>>({});
  
  const handlePrevious = () => {
    setDirection('left');
    setAnimating(true);
    
    if (view === 'month') {
      setCurrentDate(prevDate => subMonths(prevDate, 1));
    } else if (view === 'week') {
      setCurrentDate(prevDate => {
        const newDate = new Date(prevDate);
        newDate.setDate(newDate.getDate() - 7);
        return newDate;
      });
    } else if (view === 'day') {
      setCurrentDate(prevDate => {
        const newDate = new Date(prevDate);
        newDate.setDate(newDate.getDate() - 1);
        return newDate;
      });
    }
  };

  const handleNext = () => {
    setDirection('right');
    setAnimating(true);
    
    if (view === 'month') {
      setCurrentDate(prevDate => addMonths(prevDate, 1));
    } else if (view === 'week') {
      setCurrentDate(prevDate => {
        const newDate = new Date(prevDate);
        newDate.setDate(newDate.getDate() + 7);
        return newDate;
      });
    } else if (view === 'day') {
      setCurrentDate(prevDate => {
        const newDate = new Date(prevDate);
        newDate.setDate(newDate.getDate() + 1);
        return newDate;
      });
    }
  };

  // Animation abschließen
  useEffect(() => {
    if (animating) {
      const timer = setTimeout(() => {
        setAnimating(false);
        setDirection(null);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [animating]);

  // Gruppiere Termine nach Kategorien für die Filter-Chips
  const eventCategories = React.useMemo(() => {
    if (!events || events.length === 0) return {};
    
    const categories = events.reduce((acc, event) => {
      const category = event.type || 'other';
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category]++;
      return acc;
    }, {} as Record<string, number>);
    
    return categories;
  }, [events]);

  // Initialisiere Filter-Chips
  useEffect(() => {
    const initialFilters: Record<string, boolean> = {};
    Object.keys(eventCategories).forEach(category => {
      initialFilters[category] = true;
    });
    setActiveFilters(initialFilters);
  }, [eventCategories]);

  const getEventIcon = (type: string) => {
    const icons = {
      'meeting': <Users className="h-3 w-3 text-blue-700" />,
      'call': <User className="h-3 w-3 text-green-700" />,
      'appointment': <Clock className="h-3 w-3 text-indigo-700" />,
      'training': <GraduationCap className="h-3 w-3 text-amber-700" />,
      'interview': <BriefcaseIcon className="h-3 w-3 text-purple-700" />,
      'contract': <FileTextIcon className="h-3 w-3 text-red-700" />,
      'onboarding': <Users className="h-3 w-3 text-teal-700" />,
      'holiday': <CalendarIcon className="h-3 w-3 text-emerald-700" />
    };
    
    // @ts-ignore - Dynamischer Zugriff
    return icons[type] || <CalendarIcon className="h-3 w-3 text-gray-700" />;
  };

  const goToToday = () => {
    setDirection(null);
    setCurrentDate(new Date());
  };

  // Toggle für Filter-Chips
  const toggleFilter = (category: string) => {
    setActiveFilters(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Gefilterte Events
  const filteredEvents = React.useMemo(() => {
    return events && events.length > 0 ? events.filter(event => {
      const category = event.type || 'other';
      return activeFilters[category] !== false; // Standardmäßig eingeschlossen, wenn nicht explizit deaktiviert
    }) : [];
  }, [events, activeFilters]);

  const renderHeaderTitle = () => {
    if (view === 'month') {
      return format(currentDate, 'MMMM yyyy', { locale: de });
    } else if (view === 'week') {
      const start = new Date(currentDate);
      start.setDate(start.getDate() - start.getDay() + (start.getDay() === 0 ? -6 : 1));
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      
      return `${format(start, 'dd.', { locale: de })} - ${format(end, 'dd. MMMM yyyy', { locale: de })}`;
    } else if (view === 'day') {
      return format(currentDate, 'EEEE, dd. MMMM yyyy', { locale: de });
    } else if (view === 'agenda') {
      return `Agenda: ${format(currentDate, 'MMMM yyyy', { locale: de })}`;
    }
  };

  const handleViewChange = (newView: string) => {
    setAnimating(true);
    setTimeout(() => {
      setView(newView as CalendarViewType);
      setAnimating(false);
    }, 150);
  };

  const renderCalendarView = () => {
    const animationClass = animating
      ? direction === 'left'
        ? 'animate-slide-out-left'
        : 'animate-slide-out-right'
      : 'animate-fade-in';

    switch (view) {
      case 'day':
        return (
          <div className={animationClass}>
            <DayView 
              date={currentDate}
              events={filteredEvents.filter(event => {
                const eventDate = new Date(event.start);
                return eventDate.getDate() === currentDate.getDate() && 
                       eventDate.getMonth() === currentDate.getMonth() &&
                       eventDate.getFullYear() === currentDate.getFullYear();
              })}
              onEventClick={onEventClick}
              onNewEvent={onNewEvent}
              getEventIcon={getEventIcon}
            />
          </div>
        );
      case 'week':
        return (
          <div className={animationClass}>
            <WeekView 
              date={currentDate}
              events={filteredEvents}
              onEventClick={onEventClick}
              onNewEvent={onNewEvent}
              getEventIcon={getEventIcon}
            />
          </div>
        );
      case 'agenda':
        return (
          <div className={animationClass}>
            <AgendaView 
              date={currentDate}
              events={filteredEvents}
              onEventClick={onEventClick}
              getEventIcon={getEventIcon}
            />
          </div>
        );
      case 'month':
      default:
        return (
          <div className={animationClass}>
            <MonthView 
              date={currentDate}
              events={filteredEvents}
              onEventClick={onEventClick}
              onDateSelect={onDateSelect}
              onNewEvent={onNewEvent}
              getEventIcon={getEventIcon}
            />
          </div>
        );
    }
  };

  // Mapping für Kategoriefarben
  const categoryColors: Record<string, string> = {
    'meeting': 'bg-blue-100 text-blue-800 border-blue-300',
    'call': 'bg-green-100 text-green-800 border-green-300',
    'appointment': 'bg-indigo-100 text-indigo-800 border-indigo-300',
    'training': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'interview': 'bg-purple-100 text-purple-800 border-purple-300',
    'contract': 'bg-red-100 text-red-800 border-red-300',
    'onboarding': 'bg-teal-100 text-teal-800 border-teal-300',
    'holiday': 'bg-emerald-100 text-emerald-800 border-emerald-300',
    'other': 'bg-gray-100 text-gray-800 border-gray-300'
  };

  return (
    <Card className="h-full flex flex-col shadow-sm border-gray-200 overflow-hidden">
      <div className="flex flex-col space-y-3 border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              className="p-2 h-9 w-9 rounded-full"
              onClick={handlePrevious}
              aria-label="Vorheriger Zeitraum"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              className="p-2 h-9 w-9 rounded-full"
              onClick={handleNext}
              aria-label="Nächster Zeitraum"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              className="h-9 px-3"
              onClick={goToToday}
              aria-label="Heute"
            >
              Heute
            </Button>

            <h2 className="text-lg font-semibold ml-2">{renderHeaderTitle()}</h2>
          </div>
          
          <div className="flex items-center gap-2">
            <Tabs 
              defaultValue="month" 
              value={view}
              onValueChange={handleViewChange}
              className="w-auto"
            >
              <TabsList className="inline-flex h-10 items-center justify-center rounded-lg bg-white border p-1 shadow-sm mb-0 overflow-x-auto">
                <TabsTrigger 
                  value="day"
                  className="rounded-md px-3 py-1.5 text-sm font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-white"
                >
                  Tag
                </TabsTrigger>
                <TabsTrigger 
                  value="week"
                  className="rounded-md px-3 py-1.5 text-sm font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-white"
                >
                  Woche
                </TabsTrigger>
                <TabsTrigger 
                  value="month"
                  className="rounded-md px-3 py-1.5 text-sm font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-white"
                >
                  Monat
                </TabsTrigger>
                <TabsTrigger 
                  value="agenda"
                  className="rounded-md px-3 py-1.5 text-sm font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-white"
                >
                  Agenda
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        
        {/* Filter-Chips */}
        {Object.keys(eventCategories).length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {Object.entries(eventCategories).map(([category, count]) => (
              <button
                key={category}
                onClick={() => toggleFilter(category)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium border transition-colors flex items-center gap-1",
                  activeFilters[category] !== false ? categoryColors[category] || categoryColors['other'] : 'bg-gray-100 text-gray-500 border-gray-300'
                )}
                aria-pressed={activeFilters[category] !== false}
              >
                {getEventIcon(category)}
                <span className="capitalize">
                  {category === 'meeting' ? 'Besprechung' : 
                   category === 'call' ? 'Anruf' : 
                   category === 'appointment' ? 'Termin' :
                   category === 'training' ? 'Schulung' :
                   category === 'interview' ? 'Bewerbung' : 
                   category === 'contract' ? 'Vertrag' :
                   category === 'onboarding' ? 'Einarbeitung' :
                   category === 'holiday' ? 'Urlaub' : category}
                </span>
                <span className="ml-1 opacity-80">({count})</span>
              </button>
            ))}
          </div>
        )}
      </div>
      
      <CardContent className="flex-1 overflow-auto p-0 relative">
        {renderCalendarView()}
      </CardContent>
    </Card>
  );
};

export default EnhancedCalendarView;
