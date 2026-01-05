
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, XCircle, ChevronRight, Info } from 'lucide-react';
import { format, differenceInCalendarDays, isBefore, parseISO, formatDistance } from 'date-fns';
import { de } from 'date-fns/locale';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type Reminder = {
  id: string;
  user_id: string;
  typ: string;
  nachricht: string;
  gelesen: boolean;
  erstellt_am: string;
  gültig_bis: string;
};

type Suggestion = {
  title: string;
  description: string;
  actionLabel: string;
  action: () => void;
  icon: JSX.Element;
  type: 'warning' | 'info' | 'success';
}

const TimeTrackingAI = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  
  // Abfrage der Erinnerungen für den Benutzer
  const { data: reminders, isLoading } = useQuery({
    queryKey: ['zeiterfassungErinnerungen', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('zeiterfassung_erinnerungen')
        .select('*')
        .eq('user_id', user?.id)
        .order('erstellt_am', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });
  
  // Mutation zum Markieren einer Erinnerung als gelesen
  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('zeiterfassung_erinnerungen')
        .update({ gelesen: true })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zeiterfassungErinnerungen', user?.id] });
    }
  });
  
  // Abfrage der Zeiteinträge für die letzten 30 Tage für KI-Analysen
  const { data: recentTimeEntries } = useQuery({
    queryKey: ['recentTimeEntries', user?.id],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .eq('user_id', user?.id)
        .gte('start_time', thirtyDaysAgo.toISOString())
        .order('start_time', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  // Erzeuge KI-Vorschläge basierend auf Datenanalyse
  useEffect(() => {
    if (!recentTimeEntries) return;
    
    const newSuggestions: Suggestion[] = [];
    
    // Überprüfe auf Muster und generiere Vorschläge
    
    // 1. Häufige Überstunden
    const longDays = recentTimeEntries.filter((entry: any) => {
      if (!entry.end_time) return false;
      const start = new Date(entry.start_time);
      const end = new Date(entry.end_time);
      const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60) - (entry.break_minutes || 0) / 60;
      return durationHours > 9;
    });
    
    if (longDays.length > 5) {
      newSuggestions.push({
        title: "Häufige Überstunden erkannt",
        description: `Sie haben in den letzten 30 Tagen an ${longDays.length} Tagen mehr als 9 Stunden gearbeitet. Dies könnte ein Burnout-Risiko darstellen.`,
        actionLabel: "Arbeitszeitverteilung ansehen",
        action: () => {/* Würde zur Auswertungsansicht navigieren */},
        icon: <AlertCircle className="h-5 w-5 text-amber-500" />,
        type: 'warning'
      });
    }
    
    // 2. Regelmäßige Arbeitszeiten
    // Prüfe, ob die letzten Arbeitstage ähnliche Startzeiten hatten
    let startTimes: Record<string, number> = {};
    recentTimeEntries.forEach((entry: any) => {
      const start = new Date(entry.start_time);
      const hour = start.getHours();
      startTimes[hour] = (startTimes[hour] || 0) + 1;
    });
    
    const mostCommonHour = Object.keys(startTimes).reduce((a, b) => 
      startTimes[a] > startTimes[b] ? a : b
    );
    
    if (startTimes[mostCommonHour] > 10) {
      newSuggestions.push({
        title: "Regelmäßige Arbeitszeiten erkannt",
        description: `Ihr typischer Arbeitsbeginn liegt um ${mostCommonHour}:00 Uhr. Möchten Sie eine automatische Erinnerung einrichten?`,
        actionLabel: "Erinnerung einrichten",
        action: () => {/* Würde Erinnerung einrichten */},
        icon: <Info className="h-5 w-5 text-blue-500" />,
        type: 'info'
      });
    }
    
    // 3. Pausenverletzungen analysieren
    const missingBreaks = recentTimeEntries.filter((entry: any) => {
      if (!entry.end_time) return false;
      const start = new Date(entry.start_time);
      const end = new Date(entry.end_time);
      const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return durationHours > 6 && (!entry.break_minutes || entry.break_minutes < 30);
    });
    
    if (missingBreaks.length > 0) {
      newSuggestions.push({
        title: "Pausenzeiten nicht eingehalten",
        description: `Bei ${missingBreaks.length} Arbeitstagen wurden die gesetzlichen Pausenzeiten nicht eingehalten. Bitte beachten Sie die Pausenregeln.`,
        actionLabel: "Mehr Informationen",
        action: () => {/* Würde zur Pausenrichtlinie navigieren */},
        icon: <AlertCircle className="h-5 w-5 text-red-500" />,
        type: 'warning'
      });
    }
    
    setSuggestions(newSuggestions);
  }, [recentTimeEntries]);
  
  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>KI-Hilfe & Erinnerungen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-500">Lädt KI-Analysen...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>KI-Hilfe & Erinnerungen</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="erinnerungen">
          <TabsList className="mb-4">
            <TabsTrigger value="erinnerungen" className="relative">
              Erinnerungen
              {reminders && reminders.filter((r: Reminder) => !r.gelesen).length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {reminders.filter((r: Reminder) => !r.gelesen).length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="vorschlaege">
              KI-Vorschläge
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="erinnerungen">
            {reminders && reminders.length > 0 ? (
              <div className="space-y-4">
                {reminders.map((reminder: Reminder) => (
                  <div 
                    key={reminder.id} 
                    className={`p-4 border rounded-lg ${reminder.gelesen ? 'bg-gray-50' : 'border-amber-200 bg-amber-50'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3">
                        {reminder.typ === 'warnung' ? (
                          <AlertCircle className="h-5 w-5 text-red-500 mt-1" />
                        ) : (
                          <Info className="h-5 w-5 text-blue-500 mt-1" />
                        )}
                        <div>
                          <p className="font-medium">{reminder.nachricht}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {formatDistance(parseISO(reminder.erstellt_am), new Date(), { 
                              addSuffix: true,
                              locale: de 
                            })}
                          </p>
                        </div>
                      </div>
                      
                      {!reminder.gelesen && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => markAsReadMutation.mutate(reminder.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Gelesen
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500">
                <Info className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                <p>Keine Erinnerungen vorhanden</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="vorschlaege">
            {suggestions.length > 0 ? (
              <div className="space-y-4">
                {suggestions.map((suggestion, index) => (
                  <div 
                    key={index}
                    className={`p-4 border rounded-lg ${
                      suggestion.type === 'warning' ? 'border-amber-200 bg-amber-50' :
                      suggestion.type === 'info' ? 'border-blue-200 bg-blue-50' :
                      'border-green-200 bg-green-50'
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {suggestion.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{suggestion.title}</h4>
                        <p className="text-sm mt-1">{suggestion.description}</p>
                        <div className="mt-3">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="flex items-center"
                            onClick={suggestion.action}
                          >
                            {suggestion.actionLabel}
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500">
                <Info className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                <p>Keine KI-Vorschläge verfügbar</p>
                <p className="text-sm mt-2">Die KI benötigt mehr Daten für personalisierte Vorschläge</p>
              </div>
            )}
            
            <Separator className="my-6" />
            
            <div>
              <h3 className="font-medium mb-3">Gesetzliche Vorgaben für Arbeitszeiten</h3>
              <Alert className="mb-3">
                <Info className="h-4 w-4" />
                <AlertTitle>Maximale tägliche Arbeitszeit</AlertTitle>
                <AlertDescription>
                  Die maximale tägliche Arbeitszeit beträgt 8 Stunden, kann ausnahmsweise auf 10 Stunden verlängert werden.
                </AlertDescription>
              </Alert>
              
              <Alert className="mb-3">
                <Info className="h-4 w-4" />
                <AlertTitle>Ruhezeit zwischen Arbeitstagen</AlertTitle>
                <AlertDescription>
                  Zwischen zwei Arbeitstagen muss eine ununterbrochene Ruhezeit von mindestens 11 Stunden liegen.
                </AlertDescription>
              </Alert>
              
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Pausenregelungen</AlertTitle>
                <AlertDescription>
                  Bei mehr als 6 Stunden Arbeit: mindestens 30 Minuten Pause.
                  Bei mehr als 9 Stunden Arbeit: mindestens 45 Minuten Pause.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TimeTrackingAI;
