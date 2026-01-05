import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock, Calendar, Activity, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useMyActiveSickLeave } from '@/hooks/useMyActiveSickLeave';
import { useMySickLeaves } from '@/hooks/sick-leave/useMySickLeaves';
import { useMySickLeaveStats } from '@/hooks/sick-leave/useMySickLeaveStats';
import { NewSickLeaveDialog } from './NewSickLeaveDialog';
import { RecoveryDialog } from './RecoveryDialog';
import { ExtensionDialog } from './ExtensionDialog';

export const MySickLeaves = () => {
  const { activeSickLeave, isLoading: isLoadingActive } = useMyActiveSickLeave();
  const { sickLeaves, isLoading: isLoadingList } = useMySickLeaves();
  const { stats } = useMySickLeaveStats();
  
  const [newSickLeaveDialogOpen, setNewSickLeaveDialogOpen] = useState(false);
  const [recoveryDialogOpen, setRecoveryDialogOpen] = useState(false);
  const [extensionDialogOpen, setExtensionDialogOpen] = useState(false);

  if (isLoadingActive || isLoadingList) {
    return <div className="p-6">Lädt...</div>;
  }

  return (
    <div className="p-6">
      <div className="space-y-6">
        {/* Grid Layout: Krankmeldungen links (70%), Statistiken rechts (30%) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Linke Spalte - Krankmeldungen */}
          <div className="lg:col-span-2 space-y-4">
            {/* Aktive Krankmeldung - Alert-Box */}
            {activeSickLeave && (
              <Alert className="bg-primary/10 border-primary/20">
                <AlertCircle className="h-5 w-5 text-primary" />
                <AlertTitle className="text-primary font-semibold">
                  Aktuell krankgemeldet
                </AlertTitle>
                <AlertDescription>
                  Sie sind vom {format(new Date(activeSickLeave.start_date), 'dd.MM.yyyy', { locale: de })} 
                  {activeSickLeave.end_date && ` bis ${format(new Date(activeSickLeave.end_date), 'dd.MM.yyyy', { locale: de })}`} krankgemeldet. 
                  Gute Besserung!
                </AlertDescription>
                <div className="flex gap-2 mt-4">
                  <Button 
                    onClick={() => setRecoveryDialogOpen(true)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Genesung melden
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setExtensionDialogOpen(true)}
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Verlängerung einreichen
                  </Button>
                </div>
              </Alert>
            )}

            {/* Liste der Krankmeldungen - Card-basiert */}
            <div className="space-y-3">
              {sickLeaves && sickLeaves.length > 0 ? (
                sickLeaves.map((sickLeave) => {
                  const duration = sickLeave.end_date 
                    ? Math.ceil((new Date(sickLeave.end_date).getTime() - new Date(sickLeave.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1
                    : 1;
                  
                  return (
                    <Card key={sickLeave.id} className="rounded-xl border hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          {/* Datumsbereich */}
                          <div>
                            <div className="font-medium text-base">
                              {format(new Date(sickLeave.start_date), 'dd.MM.yyyy', { locale: de })}
                              {sickLeave.end_date && ` - ${format(new Date(sickLeave.end_date), 'dd.MM.yyyy', { locale: de })}`}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {duration} {duration === 1 ? 'Tag' : 'Tage'} • {sickLeave.description || 'Keine Angabe'}
                            </div>
                          </div>
                          
                          {/* Status-Badges */}
                          <div className="flex gap-2 flex-wrap justify-end">
                            {sickLeave.status === 'completed' && (
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Abgeschlossen
                              </Badge>
                            )}
                            {sickLeave.status === 'approved' && (
                              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                                <Activity className="w-3 h-3 mr-1" />
                                Aktiv
                              </Badge>
                            )}
                            {sickLeave.status === 'pending' && (
                              <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                                <Clock className="w-3 h-3 mr-1" />
                                Ausstehend
                              </Badge>
                            )}
                            {sickLeave.has_contacted_doctor && (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Attest hochgeladen
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <Card className="rounded-xl border">
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">Keine Krankmeldungen vorhanden</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* "Neue Krankmeldung einreichen" - Gestrichelter Container */}
            <button
              onClick={() => setNewSickLeaveDialogOpen(true)}
              className="w-full border-2 border-dashed border-primary/30 rounded-xl p-8 text-center hover:border-primary/50 hover:bg-primary/5 transition-colors"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Plus className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-base">Neue Krankmeldung einreichen</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Krankmeldung mit oder ohne Attest einreichen
                  </p>
                </div>
              </div>
            </button>
          </div>
          
          {/* Rechte Spalte - Statistiken */}
          <div className="space-y-4">
            {/* Krankheitstage 2025 */}
            <Card className="rounded-xl">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>Krankheitstage (2025)</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{stats.totalDays}</div>
                <p className="text-sm text-muted-foreground mt-1">
                  Von durchschnittlich {stats.averageDays} Tagen
                </p>
              </CardContent>
            </Card>

            {/* Letzte Krankmeldung */}
            <Card className="rounded-xl">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Activity className="w-4 h-4 text-green-600" />
                  <span>Letzte Krankmeldung</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{stats.lastDuration}</div>
                <p className="text-sm text-muted-foreground mt-1">
                  {stats.lastRelativeTime}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Dialoge */}
      <NewSickLeaveDialog 
        isOpen={newSickLeaveDialogOpen}
        onOpenChange={setNewSickLeaveDialogOpen}
      />
      
      {activeSickLeave && (
        <>
          <RecoveryDialog 
            isOpen={recoveryDialogOpen}
            onOpenChange={setRecoveryDialogOpen}
            activeSickLeave={activeSickLeave}
          />
          
          <ExtensionDialog 
            isOpen={extensionDialogOpen}
            onOpenChange={setExtensionDialogOpen}
            activeSickLeave={activeSickLeave}
          />
        </>
      )}
    </div>
  );
};
