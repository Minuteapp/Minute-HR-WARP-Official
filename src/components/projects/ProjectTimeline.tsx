
import React, { useState } from 'react';
import { useProjects } from '@/hooks/projects/useProjects';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { de } from 'date-fns/locale';
import { TimelineList } from './timeline/TimelineList';
import { TimelineHeader } from './timeline/TimelineHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ProjectTimeline = () => {
  const { projects, isLoading } = useProjects();
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const today = new Date();

  // Konvertiere projects zu einem kompatiblen Format
  const convertedProjects = projects.map(project => ({
    ...project,
    createdAt: project.created_at,
    dueDate: project.end_date,
    startDate: project.start_date,
    updatedAt: project.updated_at
  }));

  // Nur Projekte mit Start- und Enddatum anzeigen
  const validProjects = convertedProjects.filter(p => p.startDate && p.dueDate);
  
  // Sortieren nach Startdatum
  const sortedProjects = [...validProjects].sort((a, b) => {
    if (!a.startDate || !b.startDate) return 0;
    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
  });

  // Zeitraum für die Anzeige berechnen basierend auf dem ausgewählten viewMode
  const getDateRange = () => {
    const startDate = new Date(currentDate);
    let endDate;
    
    switch (viewMode) {
      case 'day':
        endDate = addDays(currentDate, 1);
        break;
      case 'week':
        endDate = addDays(currentDate, 7);
        break;
      case 'month':
        endDate = addDays(currentDate, 30);
        break;
    }
    
    return { startDate, endDate };
  };
  
  const { startDate, endDate } = getDateRange();
  
  const handlePreviousPeriod = () => {
    switch (viewMode) {
      case 'day':
        setCurrentDate(date => addDays(date, -1));
        break;
      case 'week':
        setCurrentDate(date => addDays(date, -7));
        break;
      case 'month':
        setCurrentDate(date => addDays(date, -30));
        break;
    }
  };
  
  const handleNextPeriod = () => {
    switch (viewMode) {
      case 'day':
        setCurrentDate(date => addDays(date, 1));
        break;
      case 'week':
        setCurrentDate(date => addDays(date, 7));
        break;
      case 'month':
        setCurrentDate(date => addDays(date, 30));
        break;
    }
  };

  const getDateRangeText = () => {
    const formatStr = 'd. MMM';
    const startDateText = format(startDate, formatStr, { locale: de });
    const endDateText = format(endDate, formatStr, { locale: de });
    return `${startDateText} - ${endDateText}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-500">Projekte werden geladen...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (sortedProjects.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center p-10 bg-gray-50 rounded-lg border border-gray-200">
            <CalendarDays className="h-12 w-12 text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-800 mt-4">Keine Projekte mit Zeitplan gefunden</h2>
            <p className="text-gray-500 mt-2">Fügen Sie Start- und Enddaten zu Ihren Projekten hinzu, um sie hier anzuzeigen.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="border-b bg-muted/20">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>
            Projekt Timeline
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <TimelineHeader viewMode={viewMode} onViewModeChange={setViewMode} />
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={handlePreviousPeriod}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="text-sm font-medium px-2 min-w-[150px] text-center">
              {getDateRangeText()}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPeriod}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="relative bg-white rounded-lg shadow-sm">
          {/* Timeline header */}
          <div className="flex border-b">
            <div className="w-36 shrink-0 p-3 border-r">
              <span className="text-sm font-medium text-gray-500">Projekte</span>
            </div>
            <div className="flex-1 p-3">
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 7 }).map((_, index) => {
                  const date = addDays(startDate, index);
                  const dayOfWeek = format(date, 'EEE', { locale: de });
                  const dayOfMonth = format(date, 'd');
                  const isToday = date.toDateString() === today.toDateString();
                  
                  return (
                    <div key={index} className={`text-center ${isToday ? 'bg-primary/10 rounded-md' : ''}`}>
                      <div className="text-xs text-gray-500 uppercase">{dayOfWeek}</div>
                      <div className={`text-sm font-medium ${isToday ? 'text-primary' : 'text-gray-800'}`}>{dayOfMonth}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Timeline content */}
          <div className="max-h-[600px] overflow-y-auto">
            <TimelineList 
              projects={sortedProjects}
              today={today}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectTimeline;
