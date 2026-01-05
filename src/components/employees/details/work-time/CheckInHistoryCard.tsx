import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface CheckInRecord {
  start_time: string;
  end_time?: string;
  location?: string;
  break_minutes?: number;
}

interface CheckInHistoryCardProps {
  checkInHistory: CheckInRecord[];
}

export const CheckInHistoryCard = ({ checkInHistory }: CheckInHistoryCardProps) => {
  const getLocationBadge = (location?: string) => {
    if (!location) return <Badge className="bg-black text-white hover:bg-black/90">Unbekannt</Badge>;
    
    const lowerLocation = location.toLowerCase();
    
    if (lowerLocation.includes('büro') || lowerLocation.includes('office')) {
      return <Badge className="bg-black text-white hover:bg-black/90">Büro</Badge>;
    }
    if (lowerLocation.includes('remote') || lowerLocation.includes('home') || lowerLocation.includes('zuhause')) {
      return <Badge className="bg-black text-white hover:bg-black/90">Remote</Badge>;
    }
    if (lowerLocation.includes('kunde') || lowerLocation.includes('customer')) {
      return <Badge className="bg-black text-white hover:bg-black/90">Kunde</Badge>;
    }
    
    return <Badge className="bg-black text-white hover:bg-black/90">{location}</Badge>;
  };

  const calculateHours = (entry: CheckInRecord) => {
    if (!entry.end_time) return '-';
    
    const start = new Date(entry.start_time);
    const end = new Date(entry.end_time);
    const minutes = (end.getTime() - start.getTime()) / (1000 * 60);
    const breakMinutes = entry.break_minutes || 0;
    const hours = (minutes - breakMinutes) / 60;
    
    return `${hours.toFixed(1)}h`;
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          Check-In/Out Historie (Letzte 7 Tage)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {checkInHistory.length > 0 ? (
          <div className="space-y-3">
            {checkInHistory.map((entry, index) => (
              <div 
                key={index} 
                className="grid grid-cols-5 gap-4 p-3 bg-muted/50 rounded-lg items-center"
              >
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Datum</p>
                  <p className="text-sm font-medium">
                    {format(new Date(entry.start_time), 'dd.MM.yyyy', { locale: de })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Check-In</p>
                  <p className="text-sm font-medium">
                    {format(new Date(entry.start_time), 'HH:mm', { locale: de })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Check-Out</p>
                  <p className="text-sm font-medium">
                    {entry.end_time ? format(new Date(entry.end_time), 'HH:mm', { locale: de }) : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Stunden</p>
                  <p className="text-sm font-medium">{calculateHours(entry)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Standort</p>
                  {getLocationBadge(entry.location)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            Keine Check-In Historie vorhanden
          </p>
        )}
      </CardContent>
    </Card>
  );
};
