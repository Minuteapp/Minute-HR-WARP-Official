import React from 'react';
import { DashboardWidget, WidgetData } from '@/types/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CalendarSummaryWidgetProps {
  widget: DashboardWidget;
  data: WidgetData | null;
}

export const CalendarSummaryWidget: React.FC<CalendarSummaryWidgetProps> = ({ widget, data }) => {
  const navigate = useNavigate();

  const handleEventClick = (event: any) => {
    navigate('/calendar');
  };

  const events = data?.items || [];
  const totalEvents = typeof data?.value === 'number' ? data.value : 0;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4" />
          <span className="truncate">{widget.title}</span>
          {totalEvents > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {totalEvents}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0 pb-4">
        {events.length === 0 ? (
          <div className="flex items-center justify-center h-16 text-center">
            <div>
              <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">
                Keine Termine heute
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {events.slice(0, 3).map((event, index) => (
              <div
                key={event.id || index}
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => handleEventClick(event)}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
                  <Clock className="h-3 w-3" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {event.title}
                  </p>
                  
                  <div className="flex items-center gap-2 mt-1">
                    {event.time && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {event.time}
                        </span>
                      </div>
                    )}
                    
                    {event.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground truncate">
                          {event.location}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {event.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                      {event.description}
                    </p>
                  )}
                </div>
                
                <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0 mt-2" />
              </div>
            ))}
            
            {totalEvents > 3 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full mt-2 text-xs"
                onClick={() => navigate('/calendar')}
              >
                {Math.max(0, totalEvents - 3)} weitere Termine anzeigen
              </Button>
            )}
          </div>
        )}
        
        {/* Quick Action */}
        <div className="mt-3 pt-2 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full text-xs"
            onClick={() => navigate('/calendar/new')}
          >
            <Calendar className="h-3 w-3 mr-1" />
            Neuer Termin
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};