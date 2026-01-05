import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Clock } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface OvertimeEntry {
  overtime_hours: number;
  created_at: string;
  reason?: string;
}

interface OvertimeBalanceCardProps {
  overtimeEntries: OvertimeEntry[];
}

export const OvertimeBalanceCard = ({ overtimeEntries }: OvertimeBalanceCardProps) => {
  const currentBalance = overtimeEntries.reduce((sum, entry) => sum + entry.overtime_hours, 0);
  
  const currentYear = new Date().getFullYear();
  const ytdOvertime = overtimeEntries
    .filter(e => new Date(e.created_at).getFullYear() === currentYear)
    .reduce((sum, entry) => sum + Math.max(0, entry.overtime_hours), 0);
  
  const ytdReduced = overtimeEntries
    .filter(e => new Date(e.created_at).getFullYear() === currentYear)
    .reduce((sum, entry) => sum + Math.abs(Math.min(0, entry.overtime_hours)), 0);
  
  const recentMovements = overtimeEntries.slice(0, 3);
  
  const minHours = -10;
  const maxHours = 10;
  const progressValue = ((currentBalance - minHours) / (maxHours - minHours)) * 100;

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          Überstunden & Zeitkonto
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Aktuelles Zeitkonto in grauer Box */}
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground mb-1">Aktuelles Zeitkonto</p>
          <p className="text-4xl font-bold">{currentBalance.toFixed(1)}h</p>
        </div>

        {/* Progress Bar mit Zielkorridor */}
        <div className="space-y-2">
          <Progress value={progressValue} className="h-2" />
          <p className="text-xs text-muted-foreground text-center">
            Zielkorridor: -10h bis +10h
          </p>
        </div>

        {/* Zwei Boxen nebeneinander */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Überstunden (YTD)</p>
            <p className="text-2xl font-bold text-green-600">+{ytdOvertime.toFixed(1)}h</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Abgebaut</p>
            <p className="text-2xl font-bold text-red-600">-{ytdReduced.toFixed(1)}h</p>
          </div>
        </div>

        {/* Letzte Bewegungen */}
        {recentMovements.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-3">Letzte Bewegungen</p>
            <div className="space-y-2">
              {recentMovements.map((movement, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">
                    {format(new Date(movement.created_at), 'dd.MM.yyyy', { locale: de })}
                  </span>
                  <span className={movement.overtime_hours >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                    {movement.overtime_hours >= 0 ? '+' : ''}{movement.overtime_hours.toFixed(1)}h
                    {movement.overtime_hours < 0 && ' (Abbau)'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {recentMovements.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Keine Bewegungen vorhanden
          </p>
        )}
      </CardContent>
    </Card>
  );
};
