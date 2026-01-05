import { useState, useEffect } from "react";
import { Clock, Calendar, FileText, Settings, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTimeTracking } from "@/hooks/useTimeTracking";
import { useQuery } from "@tanstack/react-query";
import { timeTrackingService } from "@/services/timeTrackingService";
import { useIsMobile } from "@/hooks/use-device-type";
import PendingApprovalsWarning from "./PendingApprovalsWarning";
import MobileStatsCards from "./MobileStatsCards";
import MobileTimeControls from "./MobileTimeControls";
import MobileHistoryView from "./MobileHistoryView";
import DailyOverviewWidget from "../widgets/DailyOverviewWidget";
import TimeTrackingDialog from "@/components/dialogs/TimeTrackingDialog";
import { TimeEntry } from "@/types/time-tracking.types";

type MobileTab = 'dashboard' | 'history' | 'reports' | 'system';

const MobileEmployeeTimeView = () => {
  const [activeTab, setActiveTab] = useState<MobileTab>('dashboard');
  const [showTimeEntryDialog, setShowTimeEntryDialog] = useState(false);
  const [showManualDialog, setShowManualDialog] = useState(false);
  const isMobile = useIsMobile();

  const {
    isTracking,
    isPaused,
    elapsedTime,
    formatTime,
    currentActiveEntry,
    handleTimeAction,
    handlePauseResume,
    handleStop,
    dailyWorkHours,
    weeklyWorkHours,
  } = useTimeTracking();

  // Lade heutige Zeiteinträge für Tagesübersicht
  const { data: todayEntries = [], error: todayError, isLoading: todayLoading } = useQuery({
    queryKey: ['todayTimeEntries'],
    queryFn: () => timeTrackingService.getTodayTimeEntries(),
    refetchInterval: 30000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Fehlerbehandlung
  useEffect(() => {
    if (todayError) {
      console.error('Error loading today entries:', todayError);
    }
  }, [todayError]);

  // Anzahl der nicht genehmigten Einträge (Mock für Demo)
  const pendingApprovalsCount = todayEntries.filter(e => e.status === 'pending').length;

  const getStatus = (): 'online' | 'offline' | 'paused' => {
    if (isTracking && !isPaused) return 'online';
    if (isTracking && isPaused) return 'paused';
    return 'offline';
  };

  const handleEditEntry = (entry: TimeEntry) => {
    console.log('Edit entry:', entry);
  };

  const tabs = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: Clock },
    { id: 'history' as const, label: 'Historie', icon: Calendar },
    { id: 'reports' as const, label: 'Berichte', icon: FileText },
    { id: 'system' as const, label: 'System', icon: Settings },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-2.5">
            {/* Warnbox für nicht genehmigte Einträge */}
            <PendingApprovalsWarning 
              count={pendingApprovalsCount}
              onNavigateToHistory={() => setActiveTab('history')}
            />

            {/* Statistik-Karten */}
            <MobileStatsCards 
              isTracking={isTracking}
              dailyWorkHours={dailyWorkHours}
              weeklyWorkHours={weeklyWorkHours}
              status={getStatus()}
            />

            {/* Zeiterfassungs-Controls */}
            <MobileTimeControls 
              isTracking={isTracking}
              isPaused={isPaused}
              elapsedTime={elapsedTime}
              currentActiveEntry={currentActiveEntry}
              formatTime={formatTime}
              onStart={() => setShowTimeEntryDialog(true)}
              onPauseResume={handlePauseResume}
              onStop={handleStop}
              onManualEntry={() => setShowManualDialog(true)}
            />

            {/* Tagesübersicht Widget */}
            <DailyOverviewWidget 
              date={new Date()}
              entries={todayEntries}
              onEditEntry={handleEditEntry}
            />
          </div>
        );
      
      case 'history':
        return <MobileHistoryView />;
      
      case 'reports':
        return (
          <div className="bg-white rounded-lg p-6 shadow-sm text-center">
            <p className="text-gray-600">Berichte-Ansicht (wird implementiert)</p>
          </div>
        );
      
      case 'system':
        return (
          <div className="bg-white rounded-lg p-6 shadow-sm text-center">
            <p className="text-gray-600">System-Ansicht (wird implementiert)</p>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fehleranzeige */}
      {todayError && (
        <Alert variant="destructive" className="m-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Fehler beim Laden der Daten. Bitte versuchen Sie es später erneut.
          </AlertDescription>
        </Alert>
      )}

      {/* Sticky Tab Navigation */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-2">
          <div className="flex overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-[60px] py-1.5 px-1.5 border-b-2 transition-colors ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500'
                  }`}
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <Icon className="h-3.5 w-3.5" />
                    <span className="text-[9px] font-medium">{tab.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
          
          {/* Vorschau Badge unter aktivem Tab */}
          {activeTab === 'dashboard' && (
            <div className="flex justify-center pb-1">
              <Badge variant="secondary" className="text-[8px] px-1.5 py-0.5 h-3.5">
                Vorschau
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-2.5">
        {renderTabContent()}
      </div>

      {/* Dialoge */}
      <TimeTrackingDialog 
        open={showTimeEntryDialog}
        onOpenChange={setShowTimeEntryDialog}
        mode="start"
      />
      
      <TimeTrackingDialog 
        open={showManualDialog}
        onOpenChange={setShowManualDialog}
        mode="manual"
      />
    </div>
  );
};

export default MobileEmployeeTimeView;
