import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTimeTracking } from '@/hooks/useTimeTracking';
import { useWorkTimeModels } from '@/hooks/time-tracking/useWorkTimeModels';
import { useTimeValidation } from '@/hooks/time-tracking/useTimeValidation';
import { useLocationZones } from '@/hooks/location-zones/useLocationZones';
import { useEffect, useState } from 'react';
import ActiveTimeTracking from './ActiveTimeTracking';
import WorkTimeModelSelector from './WorkTimeModelSelector';
import TimeValidationDisplay from './TimeValidationDisplay';
import OvertimeManagement from './OvertimeManagement';
import AiSuggestionsPanel from '../ai/AiSuggestionsPanel';
import SmartNotifications from '../ai/SmartNotifications';
import { TimeTrackingDialogs } from '../TimeTrackingDialogs';
import ActiveTimeEntryEditor from '@/components/time-tracking/ActiveTimeEntryEditor';


const EnhancedTimeTrackingDashboard = () => {
  const timeTracking = useTimeTracking();
  const { selectedModel } = useWorkTimeModels();
  const { validateTimeEntry } = useTimeValidation();
  const { currentDetection } = useLocationZones();

  // Wrapper-Funktion, die die richtige Signatur hat
  const handleTimeEntryStart = async (data?: any): Promise<boolean> => {
    if (timeTracking.handleTimeAction) {
      const result = await timeTracking.handleTimeAction(data);
      // Stelle sicher, dass immer ein boolean zurückgegeben wird
      return result === true;
    }
    return false;
  };

  // Verwende TimeTrackingDialogs als Hook, um die Dialoge und Handler zu erhalten
  const timeTrackingDialogs = TimeTrackingDialogs({
    onTimeEntryStart: handleTimeEntryStart
  });

  // Event-Listener für das Öffnen des Time Entry Dialogs
  useEffect(() => {
    const handleOpenTimeEntryDialog = () => {
      console.log('Opening time entry dialog from event');
      timeTrackingDialogs.setShowTimeEntryDialog(true);
    };

    document.addEventListener('open-time-entry-dialog', handleOpenTimeEntryDialog);
    
    return () => {
      document.removeEventListener('open-time-entry-dialog', handleOpenTimeEntryDialog);
    };
  }, [timeTrackingDialogs.setShowTimeEntryDialog]);

  // Aktuelle Validierung für laufende Zeiterfassung
  const currentValidation = selectedModel && timeTracking.currentActiveEntry 
    ? validateTimeEntry(
        new Date(timeTracking.currentActiveEntry.start_time),
        new Date(),
        0, // Pausenzeit wird später implementiert
        selectedModel
      )
    : { isValid: true, warnings: [], errors: [], suggestions: [] };

  // Handler für KI-Vorschläge
  const handleApplyAiSuggestion = (suggestion: any) => {
    console.log('Applying AI suggestion:', suggestion);
    
    if (suggestion.type === 'project_assignment' && suggestion.data?.projectId) {
      // Projekt automatisch zuweisen
      // Dies würde mit dem Zeiterfassungs-System integriert
    }
  };

  return (
    <div className="space-y-6">
      <SmartNotifications
        workingHours={timeTracking.elapsedTime / 3600}
        currentLocation={currentDetection?.zone?.name}
        currentProject={timeTracking.currentActiveEntry?.project}
      />

      <Tabs defaultValue="dashboard">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="ai-assistant">KI-Assistent</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Zeiterfassung-Dashboard</h2>
              <button 
                className="text-sm text-blue-600 hover:text-blue-800"
                onClick={() => timeTrackingDialogs.handleViewDetails && timeTracking.currentActiveEntry && timeTrackingDialogs.handleViewDetails(timeTracking.currentActiveEntry)}
              >
                Details anzeigen
              </button>
            </div>
            
            <ActiveTimeTracking
              isTracking={timeTracking.isTracking}
              isPaused={timeTracking.isPaused}
              elapsedTime={timeTracking.elapsedTime}
              lastDisplayTime={timeTracking.lastDisplayTime}
              handleTimeAction={timeTracking.handleTimeAction}
              handlePauseResume={timeTracking.handlePauseResume}
              handleStop={timeTracking.handleStop}
              formatTime={timeTracking.formatTime}
              setShowManualDialog={timeTrackingDialogs.setShowManualDialog}
              activeEntry={timeTracking.currentActiveEntry}
              dailyWorkHours={timeTracking.dailyWorkHours}
              weeklyWorkHours={timeTracking.weeklyWorkHours}
              getCurrentPausedTime={timeTracking.getCurrentPausedTime}
            />

            {/* Live-Editor für aktive Zeiterfassung */}
            {timeTracking.currentActiveEntry && (
              <ActiveTimeEntryEditor
                currentEntry={timeTracking.currentActiveEntry}
                isTracking={timeTracking.isTracking}
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="ai-assistant" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AiSuggestionsPanel
              currentEntry={timeTracking.currentActiveEntry}
              location={currentDetection?.zone?.name}
              onApplySuggestion={handleApplyAiSuggestion}
            />
            <TimeValidationDisplay
              validation={currentValidation}
              currentHours={timeTracking.dailyWorkHours}
              weeklyHours={timeTracking.weeklyWorkHours}
              breakMinutes={0}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Render nur die dialogs JSX-Elemente */}
      {timeTrackingDialogs.dialogs}
    </div>
  );
};

export default EnhancedTimeTrackingDashboard;
