import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthProvider';
import { PermissionProvider } from '@/contexts/PermissionContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { GoalsProvider } from '@/contexts/GoalsContext';
import { CompanyProvider } from '@/contexts/CompanyContext';
import { TenantProvider } from '@/contexts/TenantContext';
import { ImpersonationProvider } from '@/contexts/ImpersonationContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Toaster } from '@/components/ui/sonner';
import { ImpersonationBanner } from '@/components/admin/impersonation';
import Sidebar from '@/components/layout/Sidebar';
import { SettingsDebugOverlay } from '@/components/debug/SettingsDebugOverlay';
import { DBDebugPanel, useDBDebugPanel } from '@/components/debug/DBDebugPanel';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-device-type';
import { offlineManager } from '@/lib/offline/OfflineManager';
import { useRealtimeSyncInitializer } from '@/hooks/useRealtimeSync';
import { useEffect } from 'react';

// Pages
import Index from '@/pages/index';
import LoginPage from '@/pages/auth/login';
import RegisterPage from '@/pages/auth/register';
import TodayPage from '@/pages/today';
import NotificationsPage from '@/pages/notifications';
import EmployeesPage from '@/pages/employees/index';
import AbsencePage from '@/pages/absence';
import CalendarPage from '@/pages/calendar/index';
import TimePage from '@/pages/time';
import ChatPage from '@/pages/chat';
import TasksPage from '@/pages/tasks';
// import ProjectsPage from '@/pages/ProjectsPage'; // Nicht mehr benötigt
import CreateProjectPage from '@/pages/CreateProjectPage';
import ProjectDetailPage from '@/pages/projects/[id]';
import ProjectListPage from '@/pages/projects/list';
import ProjectPortfolioPage from '@/pages/projects/portfolio';
import GanttPage from '@/pages/projects/gantt';
import ProjectManagementPage from '@/pages/projects/manage';
import ProjectTeamsPage from '@/pages/projects/teams';
import ProjectKanbanPage from '@/pages/projects/kanban';
import ProjectReportsPage from '@/pages/projects/reports';
import BudgetPage from '@/pages/budget/index';
import PayrollPage from '@/pages/payroll';
import RecruitingPage from '@/pages/recruiting';
import OnboardingPage from '@/pages/onboarding';
import PerformancePage from '@/pages/performance';
import DocumentsPage from '@/pages/documents';
import ReportsPage from '@/pages/reports';
import ExpensesPage from '@/pages/expenses';
import AIPage from '@/pages/ai/index';
import GoalsPage from '@/pages/goals';
import VoicemailPage from '@/pages/voicemail';
import VoiceAssistantPage from '@/pages/ai/voice-assistant';
import SmartInsightsPage from '@/pages/ai/smart-insights';
import EnvironmentPage from '@/pages/environment/index';
import BusinessTravelPage from '@/pages/business-travel/index';
import ShiftPlanningPage from '@/pages/shift-planning';
import SickLeavePage from '@/pages/sick-leave';
import InnovationPage from '@/pages/InnovationPage';
import ProfilePage from '@/pages/profile';
import SettingsPage from '@/pages/settings';
import UsersRolesSettings from '@/pages/settings/users';
import CompanySettings from '@/pages/settings/company';
import CompanyDataPage from '@/pages/settings/company/company-data';
import LocationsPage from '@/pages/settings/company/locations';
import SubsidiariesPage from '@/pages/settings/company/subsidiaries';
import BrandingPage from '@/pages/settings/company/branding';
import BankingPage from '@/pages/settings/company/banking';
import ComplianceDocsPage from '@/pages/settings/company/compliance-docs';
import TimeSettings from '@/pages/settings/time';
import WorktimeAbsenceSettings from '@/pages/settings/worktime-absence';
import WorktimeAbsenceDragDrop from '@/pages/settings/time/drag-drop';
import PayrollSettings from '@/pages/settings/payroll';
import RecruitingSettings from '@/pages/settings/recruiting';
import PerformanceSettings from '@/pages/settings/performance';
import TrainingSettings from '@/pages/settings/training';
import DocumentsSettings from '@/pages/settings/documents';
import NotificationsSettings from '@/pages/settings/notifications';
import IntegrationsSettings from '@/pages/settings/integrations';
import SystemSettings from '@/pages/settings/system';
import AISettings from '@/pages/settings/ai';
import DashboardConfigPage from '@/pages/settings/dashboard';
import GlobalSettingsPage from '@/pages/settings/global';
import BusinessTravelSettingsPage from '@/pages/settings/business-travel';
import AdminPage from '@/pages/admin/index';
import GlossaryAdmin from '@/pages/admin/GlossaryAdmin';
import CompliancePage from '@/pages/compliance/index';
import WorkforcePlanningPage from '@/pages/workforce-planning/index';
import GlobalMobilityPage from '@/pages/global-mobility/index';
import HelpdeskPage from '@/pages/helpdesk/index';
import RoadmapPage from '@/pages/projects/roadmap';
import VisualToolsPage from '@/pages/projects/visual-tools';
import RewardsPage from '@/pages/rewards/index';
import ConfirmChangePage from '@/pages/ConfirmChange';
import CompanyCardsPage from '@/pages/company-cards/index';
import MyPortalPage from '@/pages/my-portal/index';

import NotFoundPage from '@/pages/NotFound';
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1
    }
  }
});
import MultiTenantAppContent from '@/components/MultiTenantAppContent';

const AppContent = () => {
  const { isVisible: isDBDebugVisible, setIsVisible: setDBDebugVisible } = useDBDebugPanel();
  
  // Initialize Offline Manager
  useEffect(() => {
    offlineManager.initialize();
  }, []);

  // Initialize Realtime Sync Service
  useRealtimeSyncInitializer();

  return (
    <>
      <MultiTenantAppContent />
      <DBDebugPanel isVisible={isDBDebugVisible} onClose={() => setDBDebugVisible(false)} />
    </>
  );
};
const App = () => {
  return <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TenantProvider>
          <CompanyProvider>
            <PermissionProvider>
              <NotificationProvider>
                <GoalsProvider>
                  <ImpersonationProvider>
                    <SettingsProvider>
                      <LanguageProvider>
                        <Router>
                          <ImpersonationBanner />
                          <AppContent />
                          <SettingsDebugOverlay />
                          <Toaster />
                        </Router>
                      </LanguageProvider>
                    </SettingsProvider>
                  </ImpersonationProvider>
                </GoalsProvider>
              </NotificationProvider>
            </PermissionProvider>
          </CompanyProvider>
        </TenantProvider>
      </AuthProvider>
    </QueryClientProvider>;
};
export default App;