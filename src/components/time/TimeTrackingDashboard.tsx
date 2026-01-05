
import { useTimeTracking } from "@/hooks/useTimeTracking";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Play, Pause, Square, Settings, Edit, Calendar, FileText, Info, AlertTriangle, Users, CheckSquare, TrendingUp, Building2, Shield, BarChart3 } from "lucide-react";
import { useState, useEffect } from "react";
import TimeTrackingDialog from "@/components/dialogs/TimeTrackingDialog";
import PageLayout from "@/components/layout/PageLayout";
import TimeTrackingHistory from "./TimeTrackingHistory";
import TimeTrackingErrorBoundary from "@/components/time-tracking/TimeTrackingErrorBoundary";
import WorkHistoryPage from "./history/WorkHistoryPage";
import TimeTrackingReports from "./TimeTrackingReports";
import TimeTrackingSettings from "./TimeTrackingSettings";

import StatisticsCards from "./widgets/StatisticsCards";
import DailyOverviewWidget from "./widgets/DailyOverviewWidget";
import EditActiveTimeEntryDialog from "./dialogs/EditActiveTimeEntryDialog";
import BreakSchedulerDialog from "./dialogs/BreakSchedulerDialog";
import { useScheduledBreak } from "@/hooks/useScheduledBreak";
import { Coffee } from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import { timeTrackingService } from "@/services/timeTrackingService";
import { TimeEntry } from "@/types/time-tracking.types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardEmptyStateIllustration from "./DashboardEmptyStateIllustration";
import MobileEmployeeTimeView from "./mobile/MobileEmployeeTimeView";
import { useIsMobile } from "@/hooks/use-device-type";
import AdminStatisticsCards from "./widgets/AdminStatisticsCards";
import AllEmployeesView from "./views/AllEmployeesView";
import EmployeeTimeDetailView from "./views/EmployeeTimeDetailView";
import DepartmentsView from "./views/DepartmentsView";
import LocationsView from "./views/LocationsView";
import AnalyticsView from "./views/AnalyticsView";
import DepartmentDetailView from "./views/DepartmentDetailView";
import TeamView from "./views/team/TeamView";
import TeamMemberDetailView from "./views/team/TeamMemberDetailView";
import ExceptionsView from "./views/exceptions/ExceptionsView";
import ApprovalsView from "./views/approvals/ApprovalsView";
import TeamAnalyticsView from "./views/team/TeamAnalyticsView";
import HRTeamOverviewView from "./views/hr/HRTeamOverviewView";
import HRCompanyOverviewView from "./views/hr/HRCompanyOverviewView";
import HRComplianceView from "./views/hr/HRComplianceView";
import HRReportsView from "./views/hr/HRReportsView";
import { Badge } from "@/components/ui/badge";
import { useOriginalRole } from "@/hooks/useOriginalRole";
import { useEffectiveSettings } from "@/hooks/useEffectiveSettings";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useEffectiveRole } from "@/hooks/useEffectiveRole";
import { usePermissionContext } from "@/contexts/PermissionContext";

type ActiveTab = 'dashboard' | 'history' | 'reports' | 'settings';
type AdminTab = 'my-time' | 'team' | 'exceptions' | 'approvals' | 'team-analytics' | 'all-employees' | 'departments' | 'locations' | 'analytics';
type HRAdminTab = 'my-time' | 'team-overview' | 'company-overview' | 'compliance' | 'reports';

const TimeTrackingDashboard = () => {
  const isMobile = useIsMobile();
  const { isOriginalSuperAdmin, loading: roleLoading } = useOriginalRole();
  
  // Effektive Rolle für rollenbasierte Ansichten (berücksichtigt Impersonation)
  const { role: effectiveModuleRole, isAdmin, isHROrAdmin, isTeamleadOrHigher, loading: effectiveRoleLoading } = useEffectiveRole();
  
  // KRITISCH: Rechtematrix für Zeiterfassungs-Modul
  const { hasPermission, loading: permissionLoading } = usePermissionContext();
  
  // Prüfe spezifische Berechtigungen aus der Rechtematrix
  const canViewAllEmployees = useMemo(() => hasPermission('time_tracking', 'view', 'global') || hasPermission('time_tracking', 'approve'), [hasPermission]);
  const canViewDepartments = useMemo(() => hasPermission('time_tracking', 'view', 'department') || hasPermission('time_tracking', 'approve'), [hasPermission]);
  const canViewAnalytics = useMemo(() => hasPermission('time_tracking', 'export') || hasPermission('time_tracking', 'approve'), [hasPermission]);
  const canApprove = useMemo(() => hasPermission('time_tracking', 'approve'), [hasPermission]);
  
  // Bestimme ob User Admin-Tabs sehen darf (basierend auf Rechtematrix, NICHT auf Rolle)
  const hasAdminTabAccess = useMemo(() => {
    return canViewAllEmployees || canViewDepartments || canViewAnalytics || canApprove;
  }, [canViewAllEmployees, canViewDepartments, canViewAnalytics, canApprove]);
  
  // Settings-Driven Architecture: Lade Zeiterfassungs-Einstellungen
  const { isAllowed, loading: settingsLoading, getRestrictionReason } = useEffectiveSettings('timetracking');
  
  // Prüfe ob manuelle Buchung erlaubt ist
  const canManualBook = isAllowed('manual_booking_allowed');
  
  // Bestimme die Ansichts-Rolle basierend auf der effektiven Rolle (NICHT nur Rechtematrix)
  // Nur SuperAdmins können die Rolle manuell überschreiben
  const [manualRoleOverride, setManualRoleOverride] = useState<string | null>(null);
  
  // Die tatsächliche Rolle für die Ansicht - basiert primär auf der effektiven Benutzerrolle
  const selectedRole = useMemo(() => {
    // SuperAdmin kann manuell überschreiben
    if (isOriginalSuperAdmin && manualRoleOverride) {
      return manualRoleOverride;
    }
    
    // Verwende die Flags aus useEffectiveRole um korrekte Ansicht zu bestimmen
    // Dies berücksichtigt auch Impersonation korrekt
    if (isAdmin) return 'Admin';
    if (isHROrAdmin) return 'HRAdmin';
    if (isTeamleadOrHigher) return 'Teamleiter';
    
    // Fallback: Mitarbeiter (für employee und unbekannte Rollen)
    return 'Mitarbeiter';
  }, [isOriginalSuperAdmin, manualRoleOverride, isAdmin, isHROrAdmin, isTeamleadOrHigher]);
  
  const {
    isTracking,
    isPaused,
    elapsedTime,
    lastDisplayTime,
    formatTime,
    currentActiveEntry,
    handleTimeAction,
    handlePauseResume,
    handleStop,
    dailyWorkHours,
    weeklyWorkHours,
    isLoading,
    pausedTime
  } = useTimeTracking();

  // Scheduled Break Hook
  const {
    breakCountdown,
    isScheduledBreak,
    handleScheduleBreak,
    handleScheduleBreakUntil,
    handleCancelScheduledBreak,
    handleResumeEarly
  } = useScheduledBreak({
    isPaused,
    onPauseResume: handlePauseResume
  });
  
  const [showManualDialog, setShowManualDialog] = useState(false);
  const [showTimeEntryDialog, setShowTimeEntryDialog] = useState(false);
  const [showEditActiveDialog, setShowEditActiveDialog] = useState(false);
  const [showBreakDialog, setShowBreakDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [adminTab, setAdminTab] = useState<AdminTab>('my-time');
  const [hrAdminTab, setHRAdminTab] = useState<HRAdminTab>('my-time');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null);
  const [selectedTeamMemberId, setSelectedTeamMemberId] = useState<string | null>(null);
  
  // Lade heutige Zeiteinträge für Tagesübersicht
  const { data: todayEntries = [] } = useQuery({
    queryKey: ['todayTimeEntries'],
    queryFn: () => timeTrackingService.getTodayTimeEntries(),
    refetchInterval: 30000,
  });

  // Lade alle Zeiteinträge für Berichte-Widget
  const { data: allTimeEntries = [] } = useQuery({
    queryKey: ['allTimeEntries'],
    queryFn: () => timeTrackingService.getTimeEntries(),
    refetchInterval: 30000,
  });
  
  // Event-Listener für Dialog-Open-Event
  useEffect(() => {
    const handleOpenTimeEntryDialog = () => {
      setShowTimeEntryDialog(true);
    };

    const handleOpenManualTimeEntryDialog = () => {
      setShowManualDialog(true);
    };

    document.addEventListener('open-time-entry-dialog', handleOpenTimeEntryDialog);
    document.addEventListener('open-manual-time-entry-dialog', handleOpenManualTimeEntryDialog);
    
    return () => {
      document.removeEventListener('open-time-entry-dialog', handleOpenTimeEntryDialog);
      document.removeEventListener('open-manual-time-entry-dialog', handleOpenManualTimeEntryDialog);
    };
  }, []);
  
  // Mobile Ansicht für Mitarbeiter
  if (isMobile && selectedRole === 'Mitarbeiter') {
    return (
      <TimeTrackingErrorBoundary>
        <MobileEmployeeTimeView />
      </TimeTrackingErrorBoundary>
    );
  }

  if (isLoading || roleLoading) {
    return (
      <PageLayout>
        <div className="flex justify-center items-center h-full">Lädt Zeiterfassung...</div>
      </PageLayout>
    );
  }

  const formatHours = (hours: number) => {
    return hours.toFixed(2).replace('.', ',') + ' h';
  };

  const getStatusText = () => {
    if (isTracking && !isPaused) return "Online";
    if (isTracking && isPaused) return "Pausiert";
    return "Offline";
  };

  const getStatusColor = () => {
    if (isTracking && !isPaused) return "text-green-600";
    if (isTracking && isPaused) return "text-yellow-600";
    return "text-gray-600";
  };

  const getStatus = (): 'online' | 'offline' | 'paused' => {
    if (isTracking && !isPaused) return 'online';
    if (isTracking && isPaused) return 'paused';
    return 'offline';
  };

  const handleSelectEmployee = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
  };

  const handleBackToEmployees = () => {
    setSelectedEmployeeId(null);
  };

  const handleSelectDepartment = (departmentId: string) => {
    setSelectedDepartmentId(departmentId);
  };

  const handleBackToDepartments = () => {
    setSelectedDepartmentId(null);
  };

  const handleSelectTeamMember = (memberId: string) => {
    setSelectedTeamMemberId(memberId);
  };

  const handleBackToTeam = () => {
    setSelectedTeamMemberId(null);
  };

  const handleEditEntry = (entry: TimeEntry) => {
    // Implementierung für Bearbeitung
    console.log('Edit entry:', entry);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'history':
        return selectedRole === 'Mitarbeiter' ? <WorkHistoryPage /> : <TimeTrackingHistory />;
      case 'reports':
        return <TimeTrackingReports />;
      case 'settings':
        return <TimeTrackingSettings />;
      default:
        return (
          <>
            {/* Status Cards */}
            <StatisticsCards 
              dailyWorkHours={dailyWorkHours}
              weeklyWorkHours={weeklyWorkHours}
              status={getStatus()}
            />

            {/* Main Zeiterfassung Card */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-center text-xl font-semibold text-gray-900">
                  Zeiterfassung
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-6 py-8 min-h-[400px] justify-center">
                {!isTracking ? (
                  <>
                    <p className="text-gray-600 text-center mb-4">Keine aktive Zeiterfassung</p>
                    <button
                      onClick={() => setShowTimeEntryDialog(true)}
                      className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all flex items-center justify-center group"
                    >
                      <Play className="w-10 h-10 text-white ml-1" fill="white" />
                    </button>
                    {canManualBook ? (
                      <button
                        onClick={() => setShowManualDialog(true)}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors mt-4"
                      >
                        <Clock className="h-4 w-4" />
                        Zeit manuell erfassen
                      </button>
                    ) : (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-2 text-sm text-gray-400 mt-4 cursor-not-allowed">
                              <Clock className="h-4 w-4" />
                              Zeit manuell erfassen
                              <Info className="h-3 w-3" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">{getRestrictionReason('manual_booking_allowed') || 'Manuelle Buchung nicht erlaubt'}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </>
                ) : (
                  <div className="w-full max-w-md space-y-6">
                    {/* Status Badge */}
                    <div className="flex justify-center">
                      <div className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                        isPaused ? 'bg-yellow-500 text-white' : 'bg-green-500 text-white'
                      }`}>
                        {isPaused ? 'Pausiert' : 'Aktiv'}
                      </div>
                    </div>

                    {/* Timer Display */}
                    <div className="text-center">
                      <div className="text-5xl font-bold font-mono tracking-wider mb-2">
                        {formatTime(elapsedTime)}
                      </div>
                    </div>

                    {/* Projekt/Standort Info */}
                    {currentActiveEntry && (
                      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Projekt:</span>
                          <span className="font-medium">{currentActiveEntry.project || '-'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Standort:</span>
                          <span className="font-medium">
                            {currentActiveEntry.location === 'office' ? 'Büro' : 
                             currentActiveEntry.location === 'home' ? 'Home Office' : 
                             currentActiveEntry.location === 'mobile' ? 'Mobil' : 
                             currentActiveEntry.location || '-'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Edit Button */}
                    <button
                      onClick={() => setShowEditActiveDialog(true)}
                      className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      <Edit className="w-4 h-4" />
                      Projekt / Aufgabe bearbeiten
                    </button>

                    {/* Pause Button mit Mini-Countdown Badge */}
                    <button
                      onClick={() => setShowBreakDialog(true)}
                      className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-orange-200 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors text-sm text-orange-700"
                    >
                      <Coffee className="w-4 h-4" />
                      Pause planen
                      {isScheduledBreak && breakCountdown > 0 && (
                        <Badge className="ml-2 bg-orange-500 text-white hover:bg-orange-500 font-mono">
                          {Math.floor(breakCountdown / 60)}:{String(breakCountdown % 60).padStart(2, '0')}
                        </Badge>
                      )}
                    </button>

                    {/* Control Buttons */}
                    <div className="flex gap-3 justify-center">
                      <Button
                        onClick={handlePauseResume}
                        size="lg"
                        className="rounded-full w-16 h-16 bg-orange-500 hover:bg-orange-600 shadow-lg"
                      >
                        {isPaused ? <Play className="w-6 h-6" fill="white" /> : <Pause className="w-6 h-6" fill="white" />}
                      </Button>
                      <Button
                        onClick={handleStop}
                        size="lg"
                        className="rounded-full w-16 h-16 bg-red-500 hover:bg-red-600 shadow-lg"
                      >
                        <Square className="w-6 h-6" fill="white" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tagesübersicht Widget */}
            <DailyOverviewWidget 
              date={new Date()}
              entries={todayEntries}
              onEditEntry={handleEditEntry}
            />

          </>
        );
    }
  };
  
  return (
    <PageLayout>
      <div className="min-h-screen space-y-6 w-full">
        {/* Header - Pulse Surveys Style */}
        <div className="flex justify-between items-start border-b pb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Clock className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Zeiterfassung</h1>
              <p className="text-sm text-muted-foreground">
                Vollständige Zeiterfassung mit gesetzlichen Validierungen und Arbeitszeitmodellen
              </p>
            </div>
          </div>
          {isOriginalSuperAdmin && (
            <div className="flex gap-3 items-center">
              <Select value={selectedRole} onValueChange={(value) => setManualRoleOverride(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Rolle wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mitarbeiter">Mitarbeiter</SelectItem>
                  <SelectItem value="Teamleiter">Teamleiter</SelectItem>
                  <SelectItem value="HRAdmin">HR Admin</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Tabs - Teamleiter */}
        {selectedRole === 'Teamleiter' ? (
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button 
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  adminTab === 'my-time' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => { setAdminTab('my-time'); setSelectedTeamMemberId(null); }}
              >
                <Clock className="h-4 w-4" />
                Meine Zeit
              </button>
              <button 
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  adminTab === 'team' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => { setAdminTab('team'); setSelectedTeamMemberId(null); }}
              >
                <Users className="h-4 w-4" />
                Team
              </button>
              <button 
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  adminTab === 'exceptions' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => { setAdminTab('exceptions'); setSelectedTeamMemberId(null); }}
              >
                <AlertTriangle className="h-4 w-4" />
                Ausnahmen
                <Badge className="bg-red-500 text-white hover:bg-red-500 text-xs">3</Badge>
              </button>
              <button 
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  adminTab === 'approvals' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => { setAdminTab('approvals'); setSelectedTeamMemberId(null); }}
              >
                <CheckSquare className="h-4 w-4" />
                Genehmigungen
                <Badge className="bg-red-500 text-white hover:bg-red-500 text-xs">3</Badge>
              </button>
              <button 
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  adminTab === 'team-analytics' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => { setAdminTab('team-analytics'); setSelectedTeamMemberId(null); }}
              >
                <TrendingUp className="h-4 w-4" />
                Analysen
              </button>
            </nav>
          </div>
        ) : selectedRole === 'HRAdmin' ? (
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button 
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  hrAdminTab === 'my-time' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setHRAdminTab('my-time')}
              >
                <Clock className="h-4 w-4" />
                Meine Zeiterfassung
              </button>
              <button 
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  hrAdminTab === 'team-overview' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setHRAdminTab('team-overview')}
              >
                <Users className="h-4 w-4" />
                Team-Übersicht
              </button>
              <button 
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  hrAdminTab === 'company-overview' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setHRAdminTab('company-overview')}
              >
                <Building2 className="h-4 w-4" />
                Unternehmensübersicht
              </button>
              <button 
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  hrAdminTab === 'compliance' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setHRAdminTab('compliance')}
              >
                <Shield className="h-4 w-4" />
                Compliance
              </button>
              <button 
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  hrAdminTab === 'reports' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setHRAdminTab('reports')}
              >
                <BarChart3 className="h-4 w-4" />
                Berichte
              </button>
            </nav>
          </div>
        ) : selectedRole === 'Admin' ? (
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button 
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  adminTab === 'my-time' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => { setAdminTab('my-time'); setSelectedEmployeeId(null); setSelectedDepartmentId(null); setSelectedTeamMemberId(null); }}
              >
                <Clock className="h-4 w-4" />
                Meine Zeit
              </button>
              {/* Alle Mitarbeiter - nur mit entsprechender Berechtigung */}
              {canViewAllEmployees && (
                <button 
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    adminTab === 'all-employees' 
                      ? 'border-blue-500 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => { setAdminTab('all-employees'); setSelectedEmployeeId(null); setSelectedDepartmentId(null); setSelectedTeamMemberId(null); }}
                >
                  Alle Mitarbeiter
                </button>
              )}
              {/* Abteilungen - nur mit entsprechender Berechtigung */}
              {canViewDepartments && (
                <button 
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    adminTab === 'departments' 
                      ? 'border-blue-500 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => { setAdminTab('departments'); setSelectedEmployeeId(null); setSelectedDepartmentId(null); }}
                >
                  Abteilungen
                </button>
              )}
              {/* Standorte - nur mit entsprechender Berechtigung */}
              {canViewAllEmployees && (
                <button 
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    adminTab === 'locations' 
                      ? 'border-blue-500 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => { setAdminTab('locations'); setSelectedEmployeeId(null); setSelectedDepartmentId(null); }}
                >
                  Standorte
                </button>
              )}
              {/* Analysen - nur mit entsprechender Berechtigung */}
              {canViewAnalytics && (
                <button 
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    adminTab === 'analytics' 
                      ? 'border-blue-500 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => { setAdminTab('analytics'); setSelectedEmployeeId(null); setSelectedDepartmentId(null); }}
                >
                  Analysen
                </button>
              )}
            </nav>
          </div>
        ) : (
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button 
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === 'dashboard' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('dashboard')}
              >
                <Clock className="h-4 w-4" />
                Dashboard
              </button>
              <button 
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === 'history' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('history')}
              >
                <Calendar className="h-4 w-4" />
                Arbeitshistorie
              </button>
              <button 
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === 'reports' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('reports')}
              >
                <FileText className="h-4 w-4" />
                Berichte
              </button>
              <button 
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === 'settings' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('settings')}
              >
                <Settings className="h-4 w-4" />
                System
              </button>
            </nav>
          </div>
        )}

        {/* Tab Content */}
        {selectedRole === 'Teamleiter' ? (
          selectedTeamMemberId ? (
            <TeamMemberDetailView 
              memberId={selectedTeamMemberId}
              onBack={handleBackToTeam}
            />
          ) : adminTab === 'my-time' ? (
            renderTabContent()
          ) : adminTab === 'team' ? (
            <TeamView onSelectMember={handleSelectTeamMember} />
          ) : adminTab === 'exceptions' ? (
            <ExceptionsView />
          ) : adminTab === 'approvals' ? (
            <ApprovalsView />
          ) : adminTab === 'team-analytics' ? (
            <TeamAnalyticsView />
          ) : null
        ) : selectedRole === 'HRAdmin' ? (
          hrAdminTab === 'my-time' ? (
            renderTabContent()
          ) : hrAdminTab === 'team-overview' ? (
            <HRTeamOverviewView />
          ) : hrAdminTab === 'company-overview' ? (
            <HRCompanyOverviewView />
          ) : hrAdminTab === 'compliance' ? (
            <HRComplianceView />
          ) : hrAdminTab === 'reports' ? (
            <HRReportsView />
          ) : null
        ) : selectedRole === 'Admin' ? (
          selectedTeamMemberId ? (
            <TeamMemberDetailView 
              memberId={selectedTeamMemberId}
              onBack={handleBackToTeam}
            />
          ) : selectedEmployeeId ? (
            <EmployeeTimeDetailView 
              employeeId={selectedEmployeeId}
              onBack={handleBackToEmployees}
            />
          ) : selectedDepartmentId ? (
            <DepartmentDetailView 
              departmentId={selectedDepartmentId}
              onBack={handleBackToDepartments}
            />
          ) : adminTab === 'my-time' ? (
            renderTabContent()
          ) : adminTab === 'all-employees' ? (
            <AllEmployeesView onSelectEmployee={handleSelectEmployee} />
          ) : adminTab === 'departments' ? (
            <DepartmentsView onSelectDepartment={handleSelectDepartment} />
          ) : adminTab === 'locations' ? (
            <LocationsView />
          ) : adminTab === 'analytics' ? (
            <AnalyticsView />
          ) : null
        ) : (
          renderTabContent()
        )}


        <TimeTrackingDialog 
          open={showManualDialog}
          onOpenChange={setShowManualDialog}
          mode="manual"
        />
        
        <TimeTrackingDialog 
          open={showTimeEntryDialog}
          onOpenChange={setShowTimeEntryDialog}
          mode="start"
        />

        <EditActiveTimeEntryDialog 
          open={showEditActiveDialog}
          onOpenChange={setShowEditActiveDialog}
          entry={currentActiveEntry}
          elapsedTime={elapsedTime}
        />

        <BreakSchedulerDialog
          open={showBreakDialog}
          onOpenChange={setShowBreakDialog}
          isPaused={isPaused}
          isScheduledBreak={isScheduledBreak}
          breakCountdown={breakCountdown}
          onScheduleBreak={handleScheduleBreak}
          onScheduleBreakUntil={handleScheduleBreakUntil}
          onCancelScheduledBreak={handleCancelScheduledBreak}
          onResumeEarly={handleResumeEarly}
        />
      </div>
    </PageLayout>
  );
};

export default TimeTrackingDashboard;
