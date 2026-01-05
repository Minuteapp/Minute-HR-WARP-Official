import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Info, CheckCircle, Clock, Plus, Calendar, Activity } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { useMyActiveSickLeave } from '@/hooks/useMyActiveSickLeave';
import { useMySickLeaveStats } from '@/hooks/useMySickLeaveStats';
import { useSickLeaves } from '@/hooks/useSickLeaves';
import { NewSickLeaveDialog } from './NewSickLeaveDialog';
import { RecoveryDialog } from './RecoveryDialog';
import { ExtensionDialog } from './ExtensionDialog';

export const MySickLeaves = () => {
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);
  const [showExtensionDialog, setShowExtensionDialog] = useState(false);
  
  const { activeSickLeave, isLoading: activeLoading } = useMyActiveSickLeave();
  const { totalDaysThisYear, lastSickLeaveDays, lastSickLeaveDate, isLoading: statsLoading } = useMySickLeaveStats();
  const { sickLeaves, isLoading: leavesLoading, fetchSickLeaves } = useSickLeaves();

  const handleSuccess = () => {
    fetchSickLeaves();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-0">Aktiv</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0">Abgeschlossen</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-0">Ausstehend</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 border-0">{status}</Badge>;
    }
  };

  // Filter past sick leaves (not active)
  const pastSickLeaves = sickLeaves.filter(sl => sl.id !== activeSickLeave?.id);

  if (activeLoading || statsLoading || leavesLoading) {
    return (
      <div className="p-6 w-full">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg" />
          <div className="h-64 bg-gray-200 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-6 bg-white">
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Krankmeldungen</h1>
        <p className="text-sm text-gray-600 mt-1">Verwalten Sie Krankmeldungen, Atteste und Analysen zentral</p>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <Activity className="w-4 h-4 text-gray-700" />
        <span className="text-sm font-medium text-gray-700">Meine Krankmeldungen</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content - 3 columns */}
        <div className="lg:col-span-3 space-y-6">
          {/* Section Header */}
          <h2 className="text-lg font-semibold text-gray-900">Meine Krankmeldungen</h2>

          {/* Active Sick Leave */}
          {activeSickLeave && (
            <Card className="border-2 border-indigo-200 bg-indigo-50">
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-white rounded-full">
                    <Info className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-indigo-900 mb-1">
                      Aktuell krankgemeldet
                    </h3>
                    <p className="text-sm text-indigo-800 mb-4">
                      Sie sind vom {format(parseISO(activeSickLeave.start_date), 'dd.MM.yyyy', { locale: de })} bis {format(parseISO(activeSickLeave.end_date || activeSickLeave.start_date), 'dd.MM.yyyy', { locale: de })} krankgemeldet. Gute Besserung!
                    </p>
                    <div className="flex gap-3">
                      <Button 
                        onClick={() => setShowRecoveryDialog(true)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Genesung melden
                      </Button>
                      <Button 
                        onClick={() => setShowExtensionDialog(true)}
                        size="sm"
                        variant="outline"
                        className="border-indigo-300 text-indigo-700 hover:bg-indigo-100"
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        Verlängerung einreichen
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Past Sick Leaves */}
          {pastSickLeaves.map((sickLeave) => (
            <Card key={sickLeave.id} className="border border-gray-200">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        {format(parseISO(sickLeave.start_date), 'dd.MM.yyyy', { locale: de })} - {format(parseISO(sickLeave.end_date || sickLeave.start_date), 'dd.MM.yyyy', { locale: de })}
                      </span>
                      {getStatusBadge(sickLeave.status)}
                      {sickLeave.has_contacted_doctor && (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Attest hochgeladen
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {sickLeave.description ? (
                        <span>{sickLeave.description}</span>
                      ) : (
                        <span>{sickLeave.notes ? `${sickLeave.notes.substring(0, 30)}...` : 'Keine Angaben'}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {/* New Sick Leave Button */}
          <Card className="border-2 border-dashed border-gray-300 hover:border-indigo-400 transition-colors cursor-pointer" onClick={() => setShowNewDialog(true)}>
            <div className="p-8 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-3">
                <Plus className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">
                Neue Krankmeldung einreichen
              </h3>
              <p className="text-sm text-gray-600">
                Krankmeldung mit oder ohne Attest einreichen
              </p>
            </div>
          </Card>
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-4">
          {/* Krankheitstage Card */}
          <Card className="border border-gray-200 bg-white">
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Krankheitstage (2025)</span>
                <Calendar className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="mb-1">
                <span className="text-3xl font-bold text-gray-900">{totalDaysThisYear || 0}</span>
              </div>
              <div className="text-xs text-gray-500">
                Von durchschnittlich 12 Tagen
              </div>
            </div>
          </Card>

          {/* Letzte Krankmeldung Card */}
          <Card className="border border-gray-200 bg-white">
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Letzte Krankmeldung</span>
                <Activity className="w-4 h-4 text-green-600" />
              </div>
              <div className="mb-1">
                <span className="text-3xl font-bold text-gray-900">{lastSickLeaveDays || 0} Tage</span>
              </div>
              <div className="text-xs text-gray-500">
                {lastSickLeaveDate ? `vor ${Math.floor((new Date().getTime() - new Date(lastSickLeaveDate).getTime()) / (1000 * 60 * 60 * 24))} Tagen` : 'Keine Daten'}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <NewSickLeaveDialog 
        open={showNewDialog}
        onOpenChange={setShowNewDialog}
        onSuccess={handleSuccess}
      />
      {activeSickLeave && (
        <>
          <RecoveryDialog 
            open={showRecoveryDialog}
            onOpenChange={setShowRecoveryDialog}
            sickLeave={activeSickLeave}
            onSuccess={handleSuccess}
          />
          <ExtensionDialog 
            open={showExtensionDialog}
            onOpenChange={setShowExtensionDialog}
            sickLeave={activeSickLeave}
            onSuccess={handleSuccess}
          />
        </>
      )}
    </div>
  );
};

export default MySickLeaves;
