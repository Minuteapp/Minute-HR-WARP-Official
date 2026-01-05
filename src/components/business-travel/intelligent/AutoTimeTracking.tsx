
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, Play, MapPin, Briefcase, Loader2 } from 'lucide-react';
import { useIntelligentFeatures, TimeTrackingEntry } from '@/hooks/business-travel/useIntelligentFeatures';
import { BusinessTrip } from '@/types/business-travel';

interface AutoTimeTrackingProps {
  trip: BusinessTrip;
}

const AutoTimeTracking: React.FC<AutoTimeTrackingProps> = ({ trip }) => {
  const [generatedEntries, setGeneratedEntries] = useState<TimeTrackingEntry[]>([]);
  const { generateTravelTimeEntries, createTimeTrackingEntries, isCreatingTimeEntries } = useIntelligentFeatures();

  const handleGenerateEntries = async () => {
    const entries = await generateTravelTimeEntries(trip);
    setGeneratedEntries(entries);
  };

  const handleCreateEntries = () => {
    createTimeTrackingEntries(trip);
    setGeneratedEntries([]);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'travel': return <MapPin className="h-4 w-4" />;
      case 'work': return <Briefcase className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'travel': return 'bg-blue-100 text-blue-800';
      case 'work': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'travel': return 'Reisezeit';
      case 'work': return 'Arbeitszeit';
      default: return 'Sonstige';
    }
  };

  const totalHours = generatedEntries.reduce((sum, entry) => sum + entry.duration, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Automatische Zeiterfassung
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800 mb-3">
              <strong>Intelligente Zeiterfassung:</strong> Basierend auf Ihren Reisedaten werden 
              automatisch Zeiterfassungseinträge für Reise- und Arbeitszeiten erstellt.
            </p>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Reise:</span> {trip.destination}
              </div>
              <div>
                <span className="font-medium">Zeitraum:</span> {trip.start_date} - {trip.end_date}
              </div>
            </div>
          </div>

          {generatedEntries.length === 0 ? (
            <Button 
              onClick={handleGenerateEntries}
              className="w-full"
            >
              <Play className="h-4 w-4 mr-2" />
              Zeiterfassung generieren
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Vorgeschlagene Einträge</h4>
                <Badge variant="outline">
                  {totalHours}h Gesamt
                </Badge>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {generatedEntries.map((entry, index) => (
                  <div key={entry.id}>
                    <Card className="border-l-4 border-l-blue-500">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="mt-1">
                              {getTypeIcon(entry.type)}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h5 className="font-medium text-sm">{entry.description}</h5>
                                <Badge 
                                  variant="secondary" 
                                  className={getTypeColor(entry.type)}
                                >
                                  {getTypeName(entry.type)}
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                                <div>
                                  <span className="font-medium">Datum:</span> {entry.date}
                                </div>
                                <div>
                                  <span className="font-medium">Zeit:</span> {entry.startTime} - {entry.endTime}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <Badge variant="outline" className="text-xs">
                            {entry.duration}h
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {index < generatedEntries.length - 1 && (
                      <Separator className="my-2" />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleCreateEntries}
                  disabled={isCreatingTimeEntries}
                  className="flex-1"
                >
                  {isCreatingTimeEntries ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Erstelle Einträge...
                    </>
                  ) : (
                    'Alle Einträge erstellen'
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => setGeneratedEntries([])}
                  disabled={isCreatingTimeEntries}
                >
                  Abbrechen
                </Button>
              </div>

              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm text-green-800">
                  ✅ Die Einträge werden automatisch in Ihr Zeiterfassungssystem übertragen 
                  und können nachträglich angepasst werden.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AutoTimeTracking;
