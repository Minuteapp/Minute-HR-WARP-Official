import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import { useIsMobile } from '@/hooks/use-device-type';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { SuperAdminRoute } from '@/components/auth/SuperAdminRoute';
import MinuteCompanion from '@/components/chat/MinuteCompanion';
import { useUserOnboarding } from '@/hooks/useUserOnboarding';
import { UserOnboardingWizard } from '@/components/onboarding/UserOnboardingWizard';

// Import pages
import TenantLoginPage from '@/pages/auth/TenantLogin';
import LoginPage from '@/pages/auth/login';
import RegisterPage from '@/pages/auth/register';
import Sidebar from '@/components/layout/Sidebar';
import { GlobalRolePreviewSwitcher } from '@/components/layout/GlobalRolePreviewSwitcher';

// Import all other pages
import LandingPage from '@/pages/LandingPage';
import PublicLandingPage from '@/pages/PublicLandingPage';
import HomePage from '@/pages/marketing/HomePage';
import FeaturesPage from '@/pages/marketing/FeaturesPage';
import FeatureDetailPage from '@/pages/marketing/FeatureDetailPage';
import SolutionsPage from '@/pages/marketing/SolutionsPage';
import PricingPage from '@/pages/marketing/PricingPage';
import BlogPage from '@/pages/marketing/BlogPage';
import BlogPostPage from '@/pages/marketing/BlogPostPage';
import AboutPage from '@/pages/marketing/AboutPage';
import ImpressumPage from '@/pages/marketing/ImpressumPage';
import DatenschutzPage from '@/pages/marketing/DatenschutzPage';
import AGBPage from '@/pages/marketing/AGBPage';
import EnterpriseProjectsPage from '@/pages/projects/index';
import Index from '@/pages/index';
import Mehr from '@/pages/mehr';
import TodayPage from '@/pages/today';
import NotificationsPage from '@/pages/notifications';
import EmployeesPage from '@/pages/employees/index';
import AbsencePage from '@/pages/absence';
import CalendarPage from '@/pages/calendar/index';

import TimePage from '@/pages/time';
import ChatPage from '@/pages/chat';
import TasksPage from '@/pages/tasks';
import CreateProjectPage from '@/pages/CreateProjectPage';
import ProjectDetailPage from '@/pages/projects/[id]';
import ProjectListPage from '@/pages/projects/list';
import VisualToolsPage from '@/pages/projects/visual-tools';
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
import DocumentCategoryPage from '@/pages/documents/category';
import DocumentDetailPage from '@/pages/documents/document-detail';
import NewDocumentsPage from '@/pages/documents/new-documents';
import OpenApprovalsPage from '@/pages/documents/open-approvals';
import ExpiringDocumentsPage from '@/pages/documents/expiring-documents';
import AllDocumentsPage from '@/pages/documents/all-documents';
import DocumentTrashPage from '@/pages/documents/trash';
import ReportsPage from '@/pages/reports';
import ExpensesPage from '@/pages/expenses';
import AIPage from '@/pages/ai/index';
import VoiceAssistantPage from '@/pages/ai/voice-assistant';
import SmartInsightsPage from '@/pages/ai/smart-insights';
import GoalsPage from '@/pages/goals';
import VoicemailPage from '@/pages/voicemail';
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
import WorktimeSettings from '@/pages/settings/worktime';
import AbsenceSettings from '@/pages/settings/absence';
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
import TasksSettings from '@/pages/settings/tasks';
import ProjectsSettings from '@/pages/settings/projects';
import HelpdeskSettings from '@/pages/settings/helpdesk';
import ShiftPlanningSettings from '@/pages/settings/shift-planning';
import ExpensesSettings from '@/pages/settings/expenses';
import OnboardingSettings from '@/pages/settings/onboarding';
import OffboardingSettings from '@/pages/settings/offboarding';
import RewardsSettings from '@/pages/settings/rewards';
import WorkflowSettings from '@/pages/settings/workflow';
import InnovationSettings from '@/pages/settings/innovation';
import KnowledgeSettings from '@/pages/settings/knowledge';
import GlobalMobilitySettings from '@/pages/settings/global-mobility';
import CalendarSettings from '@/pages/settings/calendar';
import WorkforcePlanningSettings from '@/pages/settings/workforce-planning';
import OrgchartSettings from '@/pages/settings/orgchart';
import AssetsSettings from '@/pages/settings/assets';
import CompanyInformationPage from '@/pages/settings/company-information';
import TimeTrackingSettings from '@/pages/settings/timetracking';
import SettingsComplianceDashboard from '@/pages/settings/compliance-dashboard';
import AdminPage from '@/pages/admin/index';
import CompliancePage from '@/pages/compliance/index';
import WorkforcePlanningPage from '@/pages/workforce-planning/index';
import GlobalMobilityPage from '@/pages/global-mobility/index';
import HelpdeskPage from '@/pages/helpdesk/index';
import TicketDetailPage from '@/pages/helpdesk/[id]';
import KnowledgeArticleDetailPage from '@/pages/helpdesk/KnowledgeArticleDetailPage';
import WorkflowDetailPage from '@/pages/helpdesk/WorkflowDetailPage';
import RoadmapPage from '@/pages/projects/roadmap';
import RoadmapDetailPage from '@/pages/projects/RoadmapDetailPage';
import RewardsPage from '@/pages/rewards/index';
import WorkflowPage from '@/pages/workflow/index';
import OrganizationDesignPage from '@/pages/hr/organization-design';
import PulseSurveysPage from '@/pages/PulseSurveys';
import KnowledgeHubPage from '@/pages/knowledge-hub';
import ConfirmChangePage from '@/pages/ConfirmChange';
import NotFoundPage from '@/pages/NotFound';
import TasksProjectDetailPage from '@/pages/tasks/ProjectDetailPage';
import CompanySetupPage from '@/pages/company-setup';

const MultiTenantAppContent = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { isSuperAdmin, tenantCompany, isLoading: tenantLoading, error: tenantError } = useTenant();
  const isMobile = useIsMobile();
  const { showOnboardingWizard, completeOnboarding, skipOnboarding } = useUserOnboarding();

  console.log('🚀 MultiTenantAppContent state:', { 
    isSuperAdmin, 
    tenantCompany: tenantCompany?.name, 
    tenantLoading,
    authLoading,
    tenantError,
    isAuthenticated,
    showOnboardingWizard
  });
  
  // DEBUG: Zusätzliche Tenant-Context Information
  console.log('🔍 Tenant Context Debug:', {
    tenantCompanyExists: !!tenantCompany,
    tenantCompanyName: tenantCompany?.name,
    isSuperAdminValue: isSuperAdmin,
    shouldShowTenantArea: tenantCompany && !isSuperAdmin,
    shouldShowSuperAdminArea: isSuperAdmin
  });

  // Loading state - CRITICAL: Auch authLoading berücksichtigen um 404-Flicker zu vermeiden
  if (tenantLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-lg font-medium">Lade Anwendung...</div>
        </div>
      </div>
    );
  }

  // Tenant Error State - Handle gracefully
  if (tenantError && !isSuperAdmin) {
    console.log('❌ Tenant error detected:', tenantError);
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="text-lg font-medium mb-4">Verbindungsfehler</div>
          <p className="text-gray-600 mb-6">
            Es gab ein Problem beim Laden der Anwendung. Bitte versuchen Sie es erneut.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Seite neu laden
          </button>
        </div>
      </div>
    );
  }

  // Super-Admin Bereich (MINUTE Portal)
  if (isSuperAdmin) {
    if (!isAuthenticated) {
      return (
        <Routes>
          {/* Marketing Website Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/funktionen" element={<FeaturesPage />} />
          <Route path="/funktionen/:slug" element={<FeatureDetailPage />} />
          <Route path="/loesungen" element={<SolutionsPage />} />
          <Route path="/preise" element={<PricingPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/ueber-uns" element={<AboutPage />} />
          {/* Legal Pages */}
          <Route path="/impressum" element={<ImpressumPage />} />
          <Route path="/datenschutz" element={<DatenschutzPage />} />
          <Route path="/agb" element={<AGBPage />} />
          {/* Legacy routes */}
          <Route path="/landing" element={<HomePage />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="/login" element={<Navigate to="/auth/login" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      );
    }

    // Mobile: Kein Layout-Wrapper für Dashboard
    if (isMobile) {
      return (
        <>
        <Routes>
          <Route path="/landing" element={<Navigate to="/dashboard" replace />} />
          <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/mehr" element={<ProtectedRoute><Mehr /></ProtectedRoute>} />
          <Route path="/today" element={<ProtectedRoute><TodayPage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          <Route path="/employees/*" element={<ProtectedRoute><EmployeesPage /></ProtectedRoute>} />
          <Route path="/absence" element={<ProtectedRoute><AbsencePage /></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
          <Route path="/time" element={<ProtectedRoute><TimePage /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          <Route path="/tasks" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
          <Route path="/tasks/projects/:projectId" element={<ProtectedRoute><TasksProjectDetailPage /></ProtectedRoute>} />
          <Route path="/projects" element={<ProtectedRoute><EnterpriseProjectsPage /></ProtectedRoute>} />
          <Route path="/projects/list" element={<ProtectedRoute><ProjectListPage /></ProtectedRoute>} />
          <Route path="/projects/visual-tools" element={<ProtectedRoute><VisualToolsPage /></ProtectedRoute>} />
          <Route path="/projects/new" element={<ProtectedRoute><CreateProjectPage /></ProtectedRoute>} />
          <Route path="/projects/portfolio" element={<ProtectedRoute><ProjectPortfolioPage /></ProtectedRoute>} />
          <Route path="/projects/gantt" element={<ProtectedRoute><GanttPage /></ProtectedRoute>} />
          <Route path="/projects/kanban" element={<ProtectedRoute><ProjectKanbanPage /></ProtectedRoute>} />
          <Route path="/projects/manage" element={<ProtectedRoute><ProjectManagementPage /></ProtectedRoute>} />
          <Route path="/projects/teams" element={<ProtectedRoute><ProjectTeamsPage /></ProtectedRoute>} />
          <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetailPage /></ProtectedRoute>} />
          <Route path="/projects/reports" element={<ProtectedRoute><ProjectReportsPage /></ProtectedRoute>} />
          <Route path="/projects/roadmap" element={<ProtectedRoute><RoadmapPage /></ProtectedRoute>} />
          <Route path="/projects/roadmap/:id" element={<ProtectedRoute><RoadmapDetailPage /></ProtectedRoute>} />
          <Route path="/rewards" element={<ProtectedRoute><RewardsPage /></ProtectedRoute>} />
          <Route path="/workflow" element={<ProtectedRoute><WorkflowPage /></ProtectedRoute>} />
          <Route path="/budget" element={<ProtectedRoute><BudgetPage /></ProtectedRoute>} />
          <Route path="/workforce-planning" element={<ProtectedRoute><WorkforcePlanningPage /></ProtectedRoute>} />
          <Route path="/hr/organization-design" element={<ProtectedRoute><OrganizationDesignPage /></ProtectedRoute>} />
          <Route path="/pulse-surveys" element={<ProtectedRoute><PulseSurveysPage /></ProtectedRoute>} />
          <Route path="/payroll" element={<ProtectedRoute><PayrollPage /></ProtectedRoute>} />
          <Route path="/recruiting" element={<ProtectedRoute><RecruitingPage /></ProtectedRoute>} />
          <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
          <Route path="/performance" element={<ProtectedRoute><PerformancePage /></ProtectedRoute>} />
          <Route path="/knowledge-hub" element={<ProtectedRoute><KnowledgeHubPage /></ProtectedRoute>} />
          <Route path="/documents" element={<ProtectedRoute><DocumentsPage /></ProtectedRoute>} />
          <Route path="/documents/new" element={<ProtectedRoute><NewDocumentsPage /></ProtectedRoute>} />
          <Route path="/documents/approvals" element={<ProtectedRoute><OpenApprovalsPage /></ProtectedRoute>} />
          <Route path="/documents/expiring" element={<ProtectedRoute><ExpiringDocumentsPage /></ProtectedRoute>} />
          <Route path="/documents/all" element={<ProtectedRoute><AllDocumentsPage /></ProtectedRoute>} />
          <Route path="/documents/trash" element={<ProtectedRoute><DocumentTrashPage /></ProtectedRoute>} />
          <Route path="/documents/category/:category" element={<ProtectedRoute><DocumentCategoryPage /></ProtectedRoute>} />
          <Route path="/documents/detail/:id" element={<ProtectedRoute><DocumentDetailPage /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
          <Route path="/expenses" element={<ProtectedRoute><ExpensesPage /></ProtectedRoute>} />
          <Route path="/global-mobility" element={<ProtectedRoute><GlobalMobilityPage /></ProtectedRoute>} />
          <Route path="/helpdesk" element={<ProtectedRoute><HelpdeskPage /></ProtectedRoute>} />
          <Route path="/helpdesk/knowledge/:id" element={<ProtectedRoute><KnowledgeArticleDetailPage /></ProtectedRoute>} />
          <Route path="/helpdesk/workflow/:id" element={<ProtectedRoute><WorkflowDetailPage /></ProtectedRoute>} />
          <Route path="/helpdesk/:id" element={<ProtectedRoute><TicketDetailPage /></ProtectedRoute>} />
          <Route path="/compliance" element={<ProtectedRoute><CompliancePage /></ProtectedRoute>} />
          <Route path="/ai" element={<ProtectedRoute><AIPage /></ProtectedRoute>} />
          <Route path="/ai/voice-assistant" element={<ProtectedRoute><VoiceAssistantPage /></ProtectedRoute>} />
          <Route path="/ai/smart-insights" element={<ProtectedRoute><SmartInsightsPage /></ProtectedRoute>} />
          <Route path="/goals" element={<ProtectedRoute><GoalsPage /></ProtectedRoute>} />
          <Route path="/voicemail" element={<ProtectedRoute><VoicemailPage /></ProtectedRoute>} />
          <Route path="/environment" element={<ProtectedRoute><EnvironmentPage /></ProtectedRoute>} />
          <Route path="/business-travel/*" element={<ProtectedRoute><BusinessTravelPage /></ProtectedRoute>} />
          <Route path="/shift-planning" element={<ProtectedRoute><ShiftPlanningPage /></ProtectedRoute>} />
          <Route path="/sick-leave" element={<ProtectedRoute><SickLeavePage /></ProtectedRoute>} />
          <Route path="/innovation" element={<ProtectedRoute><InnovationPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/settings/global" element={<ProtectedRoute><GlobalSettingsPage /></ProtectedRoute>} />
          <Route path="/settings/users" element={<ProtectedRoute><UsersRolesSettings /></ProtectedRoute>} />
          <Route path="/settings/company" element={<ProtectedRoute><CompanySettings /></ProtectedRoute>} />
          <Route path="/settings/company/company-data" element={<ProtectedRoute><CompanyDataPage /></ProtectedRoute>} />
          <Route path="/settings/company/locations" element={<ProtectedRoute><LocationsPage /></ProtectedRoute>} />
          <Route path="/settings/company/subsidiaries" element={<ProtectedRoute><SubsidiariesPage /></ProtectedRoute>} />
          <Route path="/settings/company/branding" element={<ProtectedRoute><BrandingPage /></ProtectedRoute>} />
          <Route path="/settings/company/banking" element={<ProtectedRoute><BankingPage /></ProtectedRoute>} />
          <Route path="/settings/company/compliance-docs" element={<ProtectedRoute><ComplianceDocsPage /></ProtectedRoute>} />
          <Route path="/settings/time" element={<ProtectedRoute><TimeSettings /></ProtectedRoute>} />
          <Route path="/settings/worktime" element={<ProtectedRoute><WorktimeSettings /></ProtectedRoute>} />
          <Route path="/settings/absence" element={<ProtectedRoute><AbsenceSettings /></ProtectedRoute>} />
          <Route path="/settings/worktime-absence" element={<ProtectedRoute><WorktimeAbsenceSettings /></ProtectedRoute>} />
          <Route path="/settings/worktime-absence/drag-drop" element={<ProtectedRoute><WorktimeAbsenceDragDrop /></ProtectedRoute>} />
          <Route path="/settings/payroll" element={<ProtectedRoute><PayrollSettings /></ProtectedRoute>} />
          <Route path="/settings/recruiting" element={<ProtectedRoute><RecruitingSettings /></ProtectedRoute>} />
          <Route path="/settings/performance" element={<ProtectedRoute><PerformanceSettings /></ProtectedRoute>} />
          <Route path="/settings/training" element={<ProtectedRoute><TrainingSettings /></ProtectedRoute>} />
          <Route path="/settings/documents" element={<ProtectedRoute><DocumentsSettings /></ProtectedRoute>} />
          <Route path="/settings/notifications" element={<ProtectedRoute><NotificationsSettings /></ProtectedRoute>} />
          <Route path="/settings/integrations" element={<ProtectedRoute><IntegrationsSettings /></ProtectedRoute>} />
          <Route path="/settings/system" element={<ProtectedRoute><SystemSettings /></ProtectedRoute>} />
          <Route path="/settings/dashboard" element={<ProtectedRoute><DashboardConfigPage /></ProtectedRoute>} />
          <Route path="/settings/ai" element={<ProtectedRoute><AISettings /></ProtectedRoute>} />
          <Route path="/settings/business-travel" element={<ProtectedRoute><BusinessTravelSettingsPage /></ProtectedRoute>} />
          <Route path="/settings/tasks" element={<ProtectedRoute><TasksSettings /></ProtectedRoute>} />
          <Route path="/settings/projects" element={<ProtectedRoute><ProjectsSettings /></ProtectedRoute>} />
          <Route path="/settings/helpdesk" element={<ProtectedRoute><HelpdeskSettings /></ProtectedRoute>} />
          <Route path="/settings/shift-planning" element={<ProtectedRoute><ShiftPlanningSettings /></ProtectedRoute>} />
          <Route path="/settings/expenses" element={<ProtectedRoute><ExpensesSettings /></ProtectedRoute>} />
          <Route path="/settings/onboarding" element={<ProtectedRoute><OnboardingSettings /></ProtectedRoute>} />
          <Route path="/settings/offboarding" element={<ProtectedRoute><OffboardingSettings /></ProtectedRoute>} />
          <Route path="/settings/rewards" element={<ProtectedRoute><RewardsSettings /></ProtectedRoute>} />
          <Route path="/settings/workflow" element={<ProtectedRoute><WorkflowSettings /></ProtectedRoute>} />
          <Route path="/settings/innovation" element={<ProtectedRoute><InnovationSettings /></ProtectedRoute>} />
          <Route path="/settings/knowledge" element={<ProtectedRoute><KnowledgeSettings /></ProtectedRoute>} />
          <Route path="/settings/global-mobility" element={<ProtectedRoute><GlobalMobilitySettings /></ProtectedRoute>} />
          <Route path="/settings/calendar" element={<ProtectedRoute><CalendarSettings /></ProtectedRoute>} />
          <Route path="/settings/workforce-planning" element={<ProtectedRoute><WorkforcePlanningSettings /></ProtectedRoute>} />
          <Route path="/settings/orgchart" element={<ProtectedRoute><OrgchartSettings /></ProtectedRoute>} />
          <Route path="/settings/assets" element={<ProtectedRoute><AssetsSettings /></ProtectedRoute>} />
          <Route path="/settings/company-information" element={<ProtectedRoute><CompanyInformationPage /></ProtectedRoute>} />
          <Route path="/settings/timetracking" element={<ProtectedRoute><TimeTrackingSettings /></ProtectedRoute>} />
          <Route path="/settings/compliance-dashboard" element={<ProtectedRoute><SettingsComplianceDashboard /></ProtectedRoute>} />
          <Route path="/company-setup" element={<ProtectedRoute><CompanySetupPage /></ProtectedRoute>} />
          <Route path="/admin/*" element={<SuperAdminRoute><AdminPage /></SuperAdminRoute>} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <MinuteCompanion />
        <UserOnboardingWizard 
          isOpen={showOnboardingWizard} 
          onComplete={completeOnboarding} 
          onSkip={skipOnboarding} 
        />
        </>
      );
    }

    return (
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-auto bg-white relative">
          {/* Globaler Role Preview Switcher */}
          <GlobalRolePreviewSwitcher />
          
          <Routes>
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/mehr" element={<ProtectedRoute><Mehr /></ProtectedRoute>} />
            <Route path="/today" element={<ProtectedRoute><TodayPage /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
            <Route path="/employees/*" element={<ProtectedRoute><EmployeesPage /></ProtectedRoute>} />
            <Route path="/absence" element={<ProtectedRoute><AbsencePage /></ProtectedRoute>} />
             <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
            <Route path="/time" element={<ProtectedRoute><TimePage /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
            <Route path="/tasks" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
            <Route path="/tasks/projects/:projectId" element={<ProtectedRoute><TasksProjectDetailPage /></ProtectedRoute>} />
            <Route path="/projects" element={<ProtectedRoute><EnterpriseProjectsPage /></ProtectedRoute>} />
            <Route path="/projects/list" element={<ProtectedRoute><ProjectListPage /></ProtectedRoute>} />
            <Route path="/projects/visual-tools" element={<ProtectedRoute><VisualToolsPage /></ProtectedRoute>} />
            <Route path="/projects/new" element={<ProtectedRoute><CreateProjectPage /></ProtectedRoute>} />
            <Route path="/projects/portfolio" element={<ProtectedRoute><ProjectPortfolioPage /></ProtectedRoute>} />
            <Route path="/projects/gantt" element={<ProtectedRoute><GanttPage /></ProtectedRoute>} />
            <Route path="/projects/kanban" element={<ProtectedRoute><ProjectKanbanPage /></ProtectedRoute>} />
            <Route path="/projects/manage" element={<ProtectedRoute><ProjectManagementPage /></ProtectedRoute>} />
            <Route path="/projects/teams" element={<ProtectedRoute><ProjectTeamsPage /></ProtectedRoute>} />
            <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetailPage /></ProtectedRoute>} />
            <Route path="/projects/reports" element={<ProtectedRoute><ProjectReportsPage /></ProtectedRoute>} />
            <Route path="/projects/roadmap" element={<ProtectedRoute><RoadmapPage /></ProtectedRoute>} />
            <Route path="/projects/roadmap/:id" element={<ProtectedRoute><RoadmapDetailPage /></ProtectedRoute>} />
            <Route path="/rewards" element={<ProtectedRoute><RewardsPage /></ProtectedRoute>} />
            <Route path="/workflow" element={<ProtectedRoute><WorkflowPage /></ProtectedRoute>} />
            <Route path="/budget" element={<ProtectedRoute><BudgetPage /></ProtectedRoute>} />
          <Route path="/workforce-planning" element={<ProtectedRoute><WorkforcePlanningPage /></ProtectedRoute>} />
          <Route path="/hr/organization-design" element={<ProtectedRoute><OrganizationDesignPage /></ProtectedRoute>} />
          <Route path="/pulse-surveys" element={<ProtectedRoute><PulseSurveysPage /></ProtectedRoute>} />
            <Route path="/payroll" element={<ProtectedRoute><PayrollPage /></ProtectedRoute>} />
            <Route path="/recruiting" element={<ProtectedRoute><RecruitingPage /></ProtectedRoute>} />
            <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
            <Route path="/performance" element={<ProtectedRoute><PerformancePage /></ProtectedRoute>} />
            <Route path="/knowledge-hub" element={<ProtectedRoute><KnowledgeHubPage /></ProtectedRoute>} />
            <Route path="/documents" element={<ProtectedRoute><DocumentsPage /></ProtectedRoute>} />
            <Route path="/documents/new" element={<ProtectedRoute><NewDocumentsPage /></ProtectedRoute>} />
            <Route path="/documents/approvals" element={<ProtectedRoute><OpenApprovalsPage /></ProtectedRoute>} />
            <Route path="/documents/expiring" element={<ProtectedRoute><ExpiringDocumentsPage /></ProtectedRoute>} />
            <Route path="/documents/all" element={<ProtectedRoute><AllDocumentsPage /></ProtectedRoute>} />
            <Route path="/documents/category/:category" element={<ProtectedRoute><DocumentCategoryPage /></ProtectedRoute>} />
            <Route path="/documents/detail/:id" element={<ProtectedRoute><DocumentDetailPage /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
            <Route path="/expenses" element={<ProtectedRoute><ExpensesPage /></ProtectedRoute>} />
            <Route path="/global-mobility" element={<ProtectedRoute><GlobalMobilityPage /></ProtectedRoute>} />
            <Route path="/helpdesk" element={<ProtectedRoute><HelpdeskPage /></ProtectedRoute>} />
            <Route path="/helpdesk/knowledge/:id" element={<ProtectedRoute><KnowledgeArticleDetailPage /></ProtectedRoute>} />
            <Route path="/helpdesk/workflow/:id" element={<ProtectedRoute><WorkflowDetailPage /></ProtectedRoute>} />
            <Route path="/helpdesk/:id" element={<ProtectedRoute><TicketDetailPage /></ProtectedRoute>} />
            <Route path="/compliance" element={<ProtectedRoute><CompliancePage /></ProtectedRoute>} />
            <Route path="/ai" element={<ProtectedRoute><AIPage /></ProtectedRoute>} />
            <Route path="/ai/voice-assistant" element={<ProtectedRoute><VoiceAssistantPage /></ProtectedRoute>} />
            <Route path="/ai/smart-insights" element={<ProtectedRoute><SmartInsightsPage /></ProtectedRoute>} />
            <Route path="/goals" element={<ProtectedRoute><GoalsPage /></ProtectedRoute>} />
            <Route path="/voicemail" element={<ProtectedRoute><VoicemailPage /></ProtectedRoute>} />
            <Route path="/environment" element={<ProtectedRoute><EnvironmentPage /></ProtectedRoute>} />
            <Route path="/business-travel/*" element={<ProtectedRoute><BusinessTravelPage /></ProtectedRoute>} />
            <Route path="/shift-planning" element={<ProtectedRoute><ShiftPlanningPage /></ProtectedRoute>} />
            <Route path="/sick-leave" element={<ProtectedRoute><SickLeavePage /></ProtectedRoute>} />
            <Route path="/innovation" element={<ProtectedRoute><InnovationPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/settings/global" element={<ProtectedRoute><GlobalSettingsPage /></ProtectedRoute>} />
            <Route path="/settings/users" element={<ProtectedRoute><UsersRolesSettings /></ProtectedRoute>} />
            <Route path="/settings/company" element={<ProtectedRoute><CompanySettings /></ProtectedRoute>} />
            <Route path="/settings/company/company-data" element={<ProtectedRoute><CompanyDataPage /></ProtectedRoute>} />
            <Route path="/settings/company/locations" element={<ProtectedRoute><LocationsPage /></ProtectedRoute>} />
            <Route path="/settings/company/subsidiaries" element={<ProtectedRoute><SubsidiariesPage /></ProtectedRoute>} />
            <Route path="/settings/company/branding" element={<ProtectedRoute><BrandingPage /></ProtectedRoute>} />
            <Route path="/settings/company/banking" element={<ProtectedRoute><BankingPage /></ProtectedRoute>} />
            <Route path="/settings/company/compliance-docs" element={<ProtectedRoute><ComplianceDocsPage /></ProtectedRoute>} />
            <Route path="/settings/time" element={<ProtectedRoute><TimeSettings /></ProtectedRoute>} />
            <Route path="/settings/worktime" element={<ProtectedRoute><WorktimeSettings /></ProtectedRoute>} />
            <Route path="/settings/absence" element={<ProtectedRoute><AbsenceSettings /></ProtectedRoute>} />
            <Route path="/settings/worktime-absence" element={<ProtectedRoute><WorktimeAbsenceSettings /></ProtectedRoute>} />
            <Route path="/settings/worktime-absence/drag-drop" element={<ProtectedRoute><WorktimeAbsenceDragDrop /></ProtectedRoute>} />
            <Route path="/settings/payroll" element={<ProtectedRoute><PayrollSettings /></ProtectedRoute>} />
            <Route path="/settings/recruiting" element={<ProtectedRoute><RecruitingSettings /></ProtectedRoute>} />
            <Route path="/settings/performance" element={<ProtectedRoute><PerformanceSettings /></ProtectedRoute>} />
            <Route path="/settings/training" element={<ProtectedRoute><TrainingSettings /></ProtectedRoute>} />
            <Route path="/settings/documents" element={<ProtectedRoute><DocumentsSettings /></ProtectedRoute>} />
            <Route path="/settings/notifications" element={<ProtectedRoute><NotificationsSettings /></ProtectedRoute>} />
            <Route path="/settings/integrations" element={<ProtectedRoute><IntegrationsSettings /></ProtectedRoute>} />
            <Route path="/settings/system" element={<ProtectedRoute><SystemSettings /></ProtectedRoute>} />
            <Route path="/settings/dashboard" element={<ProtectedRoute><DashboardConfigPage /></ProtectedRoute>} />
            <Route path="/settings/ai" element={<ProtectedRoute><AISettings /></ProtectedRoute>} />
            <Route path="/settings/business-travel" element={<ProtectedRoute><BusinessTravelSettingsPage /></ProtectedRoute>} />
            <Route path="/settings/tasks" element={<ProtectedRoute><TasksSettings /></ProtectedRoute>} />
            <Route path="/settings/projects" element={<ProtectedRoute><ProjectsSettings /></ProtectedRoute>} />
            <Route path="/settings/helpdesk" element={<ProtectedRoute><HelpdeskSettings /></ProtectedRoute>} />
            <Route path="/settings/shift-planning" element={<ProtectedRoute><ShiftPlanningSettings /></ProtectedRoute>} />
            <Route path="/settings/expenses" element={<ProtectedRoute><ExpensesSettings /></ProtectedRoute>} />
            <Route path="/settings/onboarding" element={<ProtectedRoute><OnboardingSettings /></ProtectedRoute>} />
            <Route path="/settings/offboarding" element={<ProtectedRoute><OffboardingSettings /></ProtectedRoute>} />
            <Route path="/settings/rewards" element={<ProtectedRoute><RewardsSettings /></ProtectedRoute>} />
            <Route path="/settings/workflow" element={<ProtectedRoute><WorkflowSettings /></ProtectedRoute>} />
            <Route path="/settings/innovation" element={<ProtectedRoute><InnovationSettings /></ProtectedRoute>} />
            <Route path="/settings/knowledge" element={<ProtectedRoute><KnowledgeSettings /></ProtectedRoute>} />
            <Route path="/settings/global-mobility" element={<ProtectedRoute><GlobalMobilitySettings /></ProtectedRoute>} />
            <Route path="/settings/calendar" element={<ProtectedRoute><CalendarSettings /></ProtectedRoute>} />
            <Route path="/settings/workforce-planning" element={<ProtectedRoute><WorkforcePlanningSettings /></ProtectedRoute>} />
            <Route path="/settings/orgchart" element={<ProtectedRoute><OrgchartSettings /></ProtectedRoute>} />
            <Route path="/settings/assets" element={<ProtectedRoute><AssetsSettings /></ProtectedRoute>} />
            <Route path="/settings/company-information" element={<ProtectedRoute><CompanyInformationPage /></ProtectedRoute>} />
            <Route path="/settings/timetracking" element={<ProtectedRoute><TimeTrackingSettings /></ProtectedRoute>} />
            <Route path="/settings/compliance-dashboard" element={<ProtectedRoute><SettingsComplianceDashboard /></ProtectedRoute>} />
            <Route path="/company-setup" element={<ProtectedRoute><CompanySetupPage /></ProtectedRoute>} />
            <Route path="/admin/*" element={<SuperAdminRoute><AdminPage /></SuperAdminRoute>} />
            <Route path="/companies" element={<Navigate to="/admin/companies" replace />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
        <MinuteCompanion />
        <UserOnboardingWizard 
          isOpen={showOnboardingWizard} 
          onComplete={completeOnboarding} 
          onSkip={skipOnboarding} 
        />
      </div>
    );
  }

  // Tenant-spezifischer Bereich (Firmen-Portal)
  // WICHTIG: Nur für echte Tenant-Benutzer, nicht für Super-Admins im Tenant-Modus
  if (tenantCompany && !isSuperAdmin) {
    if (!isAuthenticated) {
      return (
        <Routes>
          <Route path="/login" element={<TenantLoginPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      );
    }

    // Mobile: Kein Layout-Wrapper für Dashboard
    if (isMobile) {
      return (
        <Routes>
          <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/mehr" element={<ProtectedRoute><Mehr /></ProtectedRoute>} />
          <Route path="/today" element={<ProtectedRoute><TodayPage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          <Route path="/employees/*" element={<ProtectedRoute><EmployeesPage /></ProtectedRoute>} />
          <Route path="/absence" element={<ProtectedRoute><AbsencePage /></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
          <Route path="/time" element={<ProtectedRoute><TimePage /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          <Route path="/tasks" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
          <Route path="/projects" element={<ProtectedRoute><EnterpriseProjectsPage /></ProtectedRoute>} />
          <Route path="/projects/new" element={<ProtectedRoute><CreateProjectPage /></ProtectedRoute>} />
          <Route path="/projects/portfolio" element={<ProtectedRoute><ProjectPortfolioPage /></ProtectedRoute>} />
          <Route path="/projects/gantt" element={<ProtectedRoute><GanttPage /></ProtectedRoute>} />
          <Route path="/projects/kanban" element={<ProtectedRoute><ProjectKanbanPage /></ProtectedRoute>} />
          <Route path="/projects/manage" element={<ProtectedRoute><ProjectManagementPage /></ProtectedRoute>} />
          <Route path="/projects/teams" element={<ProtectedRoute><ProjectTeamsPage /></ProtectedRoute>} />
          <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetailPage /></ProtectedRoute>} />
          <Route path="/projects/reports" element={<ProtectedRoute><ProjectReportsPage /></ProtectedRoute>} />
          <Route path="/projects/roadmap" element={<ProtectedRoute><RoadmapPage /></ProtectedRoute>} />
          <Route path="/projects/roadmap/:id" element={<ProtectedRoute><RoadmapDetailPage /></ProtectedRoute>} />
          <Route path="/rewards" element={<ProtectedRoute><RewardsPage /></ProtectedRoute>} />
          <Route path="/workflow" element={<ProtectedRoute><WorkflowPage /></ProtectedRoute>} />
          <Route path="/budget" element={<ProtectedRoute><BudgetPage /></ProtectedRoute>} />
          <Route path="/workforce-planning" element={<ProtectedRoute><WorkforcePlanningPage /></ProtectedRoute>} />
          <Route path="/hr/organization-design" element={<ProtectedRoute><OrganizationDesignPage /></ProtectedRoute>} />
          <Route path="/pulse-surveys" element={<ProtectedRoute><PulseSurveysPage /></ProtectedRoute>} />
          <Route path="/payroll" element={<ProtectedRoute><PayrollPage /></ProtectedRoute>} />
          <Route path="/recruiting" element={<ProtectedRoute><RecruitingPage /></ProtectedRoute>} />
          <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
          <Route path="/performance" element={<ProtectedRoute><PerformancePage /></ProtectedRoute>} />
          <Route path="/documents" element={<ProtectedRoute><DocumentsPage /></ProtectedRoute>} />
          <Route path="/documents/new" element={<ProtectedRoute><NewDocumentsPage /></ProtectedRoute>} />
          <Route path="/documents/approvals" element={<ProtectedRoute><OpenApprovalsPage /></ProtectedRoute>} />
          <Route path="/documents/expiring" element={<ProtectedRoute><ExpiringDocumentsPage /></ProtectedRoute>} />
          <Route path="/documents/all" element={<ProtectedRoute><AllDocumentsPage /></ProtectedRoute>} />
          <Route path="/documents/category/:category" element={<ProtectedRoute><DocumentCategoryPage /></ProtectedRoute>} />
          <Route path="/documents/detail/:id" element={<ProtectedRoute><DocumentDetailPage /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
          <Route path="/expenses" element={<ProtectedRoute><ExpensesPage /></ProtectedRoute>} />
          <Route path="/ai" element={<ProtectedRoute><AIPage /></ProtectedRoute>} />
          <Route path="/ai/voice-assistant" element={<ProtectedRoute><VoiceAssistantPage /></ProtectedRoute>} />
          <Route path="/ai/smart-insights" element={<ProtectedRoute><SmartInsightsPage /></ProtectedRoute>} />
          <Route path="/goals" element={<ProtectedRoute><GoalsPage /></ProtectedRoute>} />
          <Route path="/voicemail" element={<ProtectedRoute><VoicemailPage /></ProtectedRoute>} />
          <Route path="/environment" element={<ProtectedRoute><EnvironmentPage /></ProtectedRoute>} />
          <Route path="/business-travel/*" element={<ProtectedRoute><BusinessTravelPage /></ProtectedRoute>} />
          <Route path="/shift-planning" element={<ProtectedRoute><ShiftPlanningPage /></ProtectedRoute>} />
          <Route path="/sick-leave" element={<ProtectedRoute><SickLeavePage /></ProtectedRoute>} />
          <Route path="/innovation" element={<ProtectedRoute><InnovationPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/settings/global" element={<ProtectedRoute><GlobalSettingsPage /></ProtectedRoute>} />
            <Route path="/settings/users" element={<ProtectedRoute><UsersRolesSettings /></ProtectedRoute>} />
            <Route path="/settings/compliance-dashboard" element={<ProtectedRoute><SettingsComplianceDashboard /></ProtectedRoute>} />
          <Route path="/settings/company" element={<ProtectedRoute><CompanySettings /></ProtectedRoute>} />
          <Route path="/settings/company/company-data" element={<ProtectedRoute><CompanyDataPage /></ProtectedRoute>} />
          <Route path="/settings/company/locations" element={<ProtectedRoute><LocationsPage /></ProtectedRoute>} />
          <Route path="/settings/company/subsidiaries" element={<ProtectedRoute><SubsidiariesPage /></ProtectedRoute>} />
          <Route path="/settings/company/branding" element={<ProtectedRoute><BrandingPage /></ProtectedRoute>} />
          <Route path="/settings/company/banking" element={<ProtectedRoute><BankingPage /></ProtectedRoute>} />
          <Route path="/settings/company/compliance-docs" element={<ProtectedRoute><ComplianceDocsPage /></ProtectedRoute>} />
          <Route path="/settings/time" element={<ProtectedRoute><TimeSettings /></ProtectedRoute>} />
          <Route path="/settings/worktime" element={<ProtectedRoute><WorktimeSettings /></ProtectedRoute>} />
          <Route path="/settings/absence" element={<ProtectedRoute><AbsenceSettings /></ProtectedRoute>} />
          <Route path="/settings/worktime-absence" element={<ProtectedRoute><WorktimeAbsenceSettings /></ProtectedRoute>} />
          <Route path="/settings/worktime-absence/drag-drop" element={<ProtectedRoute><WorktimeAbsenceDragDrop /></ProtectedRoute>} />
          <Route path="/settings/payroll" element={<ProtectedRoute><PayrollSettings /></ProtectedRoute>} />
          <Route path="/settings/recruiting" element={<ProtectedRoute><RecruitingSettings /></ProtectedRoute>} />
          <Route path="/settings/performance" element={<ProtectedRoute><PerformanceSettings /></ProtectedRoute>} />
          <Route path="/settings/training" element={<ProtectedRoute><TrainingSettings /></ProtectedRoute>} />
          <Route path="/settings/documents" element={<ProtectedRoute><DocumentsSettings /></ProtectedRoute>} />
          <Route path="/settings/notifications" element={<ProtectedRoute><NotificationsSettings /></ProtectedRoute>} />
          <Route path="/settings/integrations" element={<ProtectedRoute><IntegrationsSettings /></ProtectedRoute>} />
          <Route path="/settings/system" element={<ProtectedRoute><SystemSettings /></ProtectedRoute>} />
          <Route path="/settings/dashboard" element={<ProtectedRoute><DashboardConfigPage /></ProtectedRoute>} />
          <Route path="/settings/ai" element={<ProtectedRoute><AISettings /></ProtectedRoute>} />
          <Route path="/settings/business-travel" element={<ProtectedRoute><BusinessTravelSettingsPage /></ProtectedRoute>} />
          <Route path="/settings/tasks" element={<ProtectedRoute><TasksSettings /></ProtectedRoute>} />
          <Route path="/settings/projects" element={<ProtectedRoute><ProjectsSettings /></ProtectedRoute>} />
          <Route path="/settings/helpdesk" element={<ProtectedRoute><HelpdeskSettings /></ProtectedRoute>} />
          <Route path="/settings/shift-planning" element={<ProtectedRoute><ShiftPlanningSettings /></ProtectedRoute>} />
          <Route path="/settings/expenses" element={<ProtectedRoute><ExpensesSettings /></ProtectedRoute>} />
          <Route path="/settings/onboarding" element={<ProtectedRoute><OnboardingSettings /></ProtectedRoute>} />
          <Route path="/settings/offboarding" element={<ProtectedRoute><OffboardingSettings /></ProtectedRoute>} />
          <Route path="/settings/rewards" element={<ProtectedRoute><RewardsSettings /></ProtectedRoute>} />
          <Route path="/settings/workflow" element={<ProtectedRoute><WorkflowSettings /></ProtectedRoute>} />
          <Route path="/settings/innovation" element={<ProtectedRoute><InnovationSettings /></ProtectedRoute>} />
          <Route path="/settings/knowledge" element={<ProtectedRoute><KnowledgeSettings /></ProtectedRoute>} />
          <Route path="/settings/global-mobility" element={<ProtectedRoute><GlobalMobilitySettings /></ProtectedRoute>} />
          <Route path="/settings/calendar" element={<ProtectedRoute><CalendarSettings /></ProtectedRoute>} />
          <Route path="/settings/workforce-planning" element={<ProtectedRoute><WorkforcePlanningSettings /></ProtectedRoute>} />
          <Route path="/settings/orgchart" element={<ProtectedRoute><OrgchartSettings /></ProtectedRoute>} />
          <Route path="/settings/assets" element={<ProtectedRoute><AssetsSettings /></ProtectedRoute>} />
          <Route path="/settings/company-information" element={<ProtectedRoute><CompanyInformationPage /></ProtectedRoute>} />
          <Route path="/settings/timetracking" element={<ProtectedRoute><TimeTrackingSettings /></ProtectedRoute>} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      );
    }

    return (
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-auto bg-white relative">
          {/* Globaler Role Preview Switcher */}
          <GlobalRolePreviewSwitcher />
          
          <Routes>
            <Route path="/landing" element={<Navigate to="/dashboard" replace />} />
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/mehr" element={<ProtectedRoute><Mehr /></ProtectedRoute>} />
            <Route path="/today" element={<ProtectedRoute><TodayPage /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
            <Route path="/employees/*" element={<ProtectedRoute><EmployeesPage /></ProtectedRoute>} />
            <Route path="/absence" element={<ProtectedRoute><AbsencePage /></ProtectedRoute>} />
             <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
            <Route path="/time" element={<ProtectedRoute><TimePage /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
            <Route path="/tasks" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
            <Route path="/projects" element={<ProtectedRoute><EnterpriseProjectsPage /></ProtectedRoute>} />
            <Route path="/projects/new" element={<ProtectedRoute><CreateProjectPage /></ProtectedRoute>} />
            <Route path="/projects/portfolio" element={<ProtectedRoute><ProjectPortfolioPage /></ProtectedRoute>} />
            <Route path="/projects/gantt" element={<ProtectedRoute><GanttPage /></ProtectedRoute>} />
            <Route path="/projects/kanban" element={<ProtectedRoute><ProjectKanbanPage /></ProtectedRoute>} />
            <Route path="/projects/manage" element={<ProtectedRoute><ProjectManagementPage /></ProtectedRoute>} />
            <Route path="/projects/teams" element={<ProtectedRoute><ProjectTeamsPage /></ProtectedRoute>} />
            <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetailPage /></ProtectedRoute>} />
            <Route path="/projects/reports" element={<ProtectedRoute><ProjectReportsPage /></ProtectedRoute>} />
            <Route path="/projects/roadmap" element={<ProtectedRoute><RoadmapPage /></ProtectedRoute>} />
            <Route path="/projects/roadmap/:id" element={<ProtectedRoute><RoadmapDetailPage /></ProtectedRoute>} />
            <Route path="/rewards" element={<ProtectedRoute><RewardsPage /></ProtectedRoute>} />
            <Route path="/workflow" element={<ProtectedRoute><WorkflowPage /></ProtectedRoute>} />
            <Route path="/budget" element={<ProtectedRoute><BudgetPage /></ProtectedRoute>} />
            <Route path="/workforce-planning" element={<ProtectedRoute><WorkforcePlanningPage /></ProtectedRoute>} />
            <Route path="/hr/organization-design" element={<ProtectedRoute><OrganizationDesignPage /></ProtectedRoute>} />
            <Route path="/pulse-surveys" element={<ProtectedRoute><PulseSurveysPage /></ProtectedRoute>} />
            <Route path="/payroll" element={<ProtectedRoute><PayrollPage /></ProtectedRoute>} />
            <Route path="/recruiting" element={<ProtectedRoute><RecruitingPage /></ProtectedRoute>} />
            <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
            <Route path="/performance" element={<ProtectedRoute><PerformancePage /></ProtectedRoute>} />
            <Route path="/knowledge-hub" element={<ProtectedRoute><KnowledgeHubPage /></ProtectedRoute>} />
            <Route path="/documents" element={<ProtectedRoute><DocumentsPage /></ProtectedRoute>} />
            <Route path="/documents/new" element={<ProtectedRoute><NewDocumentsPage /></ProtectedRoute>} />
            <Route path="/documents/approvals" element={<ProtectedRoute><OpenApprovalsPage /></ProtectedRoute>} />
            <Route path="/documents/expiring" element={<ProtectedRoute><ExpiringDocumentsPage /></ProtectedRoute>} />
            <Route path="/documents/all" element={<ProtectedRoute><AllDocumentsPage /></ProtectedRoute>} />
            <Route path="/documents/category/:category" element={<ProtectedRoute><DocumentCategoryPage /></ProtectedRoute>} />
            <Route path="/documents/detail/:id" element={<ProtectedRoute><DocumentDetailPage /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
            <Route path="/expenses" element={<ProtectedRoute><ExpensesPage /></ProtectedRoute>} />
            <Route path="/global-mobility" element={<ProtectedRoute><GlobalMobilityPage /></ProtectedRoute>} />
            <Route path="/helpdesk" element={<ProtectedRoute><HelpdeskPage /></ProtectedRoute>} />
            <Route path="/helpdesk/knowledge/:id" element={<ProtectedRoute><KnowledgeArticleDetailPage /></ProtectedRoute>} />
            <Route path="/helpdesk/workflow/:id" element={<ProtectedRoute><WorkflowDetailPage /></ProtectedRoute>} />
            <Route path="/compliance" element={<ProtectedRoute><CompliancePage /></ProtectedRoute>} />
            <Route path="/ai" element={<ProtectedRoute><AIPage /></ProtectedRoute>} />
            <Route path="/ai/voice-assistant" element={<ProtectedRoute><VoiceAssistantPage /></ProtectedRoute>} />
            <Route path="/ai/smart-insights" element={<ProtectedRoute><SmartInsightsPage /></ProtectedRoute>} />
            <Route path="/goals" element={<ProtectedRoute><GoalsPage /></ProtectedRoute>} />
            <Route path="/voicemail" element={<ProtectedRoute><VoicemailPage /></ProtectedRoute>} />
            <Route path="/environment" element={<ProtectedRoute><EnvironmentPage /></ProtectedRoute>} />
            <Route path="/business-travel/*" element={<ProtectedRoute><BusinessTravelPage /></ProtectedRoute>} />
            <Route path="/shift-planning" element={<ProtectedRoute><ShiftPlanningPage /></ProtectedRoute>} />
            <Route path="/sick-leave" element={<ProtectedRoute><SickLeavePage /></ProtectedRoute>} />
            <Route path="/innovation" element={<ProtectedRoute><InnovationPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/settings/global" element={<ProtectedRoute><GlobalSettingsPage /></ProtectedRoute>} />
            <Route path="/settings/users" element={<ProtectedRoute><UsersRolesSettings /></ProtectedRoute>} />
            <Route path="/settings/compliance-dashboard" element={<ProtectedRoute><SettingsComplianceDashboard /></ProtectedRoute>} />
            <Route path="/settings/company" element={<ProtectedRoute><CompanySettings /></ProtectedRoute>} />
            <Route path="/settings/company/company-data" element={<ProtectedRoute><CompanyDataPage /></ProtectedRoute>} />
            <Route path="/settings/company/locations" element={<ProtectedRoute><LocationsPage /></ProtectedRoute>} />
            <Route path="/settings/company/subsidiaries" element={<ProtectedRoute><SubsidiariesPage /></ProtectedRoute>} />
            <Route path="/settings/company/branding" element={<ProtectedRoute><BrandingPage /></ProtectedRoute>} />
            <Route path="/settings/company/banking" element={<ProtectedRoute><BankingPage /></ProtectedRoute>} />
            <Route path="/settings/company/compliance-docs" element={<ProtectedRoute><ComplianceDocsPage /></ProtectedRoute>} />
            <Route path="/settings/time" element={<ProtectedRoute><TimeSettings /></ProtectedRoute>} />
            <Route path="/settings/worktime" element={<ProtectedRoute><WorktimeSettings /></ProtectedRoute>} />
            <Route path="/settings/absence" element={<ProtectedRoute><AbsenceSettings /></ProtectedRoute>} />
            <Route path="/settings/worktime-absence" element={<ProtectedRoute><WorktimeAbsenceSettings /></ProtectedRoute>} />
            <Route path="/settings/worktime-absence/drag-drop" element={<ProtectedRoute><WorktimeAbsenceDragDrop /></ProtectedRoute>} />
            <Route path="/settings/payroll" element={<ProtectedRoute><PayrollSettings /></ProtectedRoute>} />
            <Route path="/settings/recruiting" element={<ProtectedRoute><RecruitingSettings /></ProtectedRoute>} />
            <Route path="/settings/performance" element={<ProtectedRoute><PerformanceSettings /></ProtectedRoute>} />
            <Route path="/settings/training" element={<ProtectedRoute><TrainingSettings /></ProtectedRoute>} />
            <Route path="/settings/documents" element={<ProtectedRoute><DocumentsSettings /></ProtectedRoute>} />
            <Route path="/settings/notifications" element={<ProtectedRoute><NotificationsSettings /></ProtectedRoute>} />
            <Route path="/settings/integrations" element={<ProtectedRoute><IntegrationsSettings /></ProtectedRoute>} />
            <Route path="/settings/system" element={<ProtectedRoute><SystemSettings /></ProtectedRoute>} />
            <Route path="/settings/dashboard" element={<ProtectedRoute><DashboardConfigPage /></ProtectedRoute>} />
            <Route path="/settings/ai" element={<ProtectedRoute><AISettings /></ProtectedRoute>} />
            <Route path="/settings/business-travel" element={<ProtectedRoute><BusinessTravelSettingsPage /></ProtectedRoute>} />
            <Route path="/settings/tasks" element={<ProtectedRoute><TasksSettings /></ProtectedRoute>} />
            <Route path="/settings/projects" element={<ProtectedRoute><ProjectsSettings /></ProtectedRoute>} />
            <Route path="/settings/helpdesk" element={<ProtectedRoute><HelpdeskSettings /></ProtectedRoute>} />
            <Route path="/settings/shift-planning" element={<ProtectedRoute><ShiftPlanningSettings /></ProtectedRoute>} />
            <Route path="/settings/expenses" element={<ProtectedRoute><ExpensesSettings /></ProtectedRoute>} />
            <Route path="/settings/onboarding" element={<ProtectedRoute><OnboardingSettings /></ProtectedRoute>} />
            <Route path="/settings/offboarding" element={<ProtectedRoute><OffboardingSettings /></ProtectedRoute>} />
            <Route path="/settings/rewards" element={<ProtectedRoute><RewardsSettings /></ProtectedRoute>} />
            <Route path="/settings/workflow" element={<ProtectedRoute><WorkflowSettings /></ProtectedRoute>} />
            <Route path="/settings/innovation" element={<ProtectedRoute><InnovationSettings /></ProtectedRoute>} />
            <Route path="/settings/knowledge" element={<ProtectedRoute><KnowledgeSettings /></ProtectedRoute>} />
            <Route path="/settings/global-mobility" element={<ProtectedRoute><GlobalMobilitySettings /></ProtectedRoute>} />
            <Route path="/settings/workforce-planning" element={<ProtectedRoute><WorkforcePlanningSettings /></ProtectedRoute>} />
            <Route path="/settings/orgchart" element={<ProtectedRoute><OrgchartSettings /></ProtectedRoute>} />
            <Route path="/settings/assets" element={<ProtectedRoute><AssetsSettings /></ProtectedRoute>} />
            <Route path="/settings/company-information" element={<ProtectedRoute><CompanyInformationPage /></ProtectedRoute>} />
            <Route path="/settings/timetracking" element={<ProtectedRoute><TimeTrackingSettings /></ProtectedRoute>} />
            <Route path="/company-setup" element={<ProtectedRoute><CompanySetupPage /></ProtectedRoute>} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
        <MinuteCompanion />
        <UserOnboardingWizard 
          isOpen={showOnboardingWizard} 
          onComplete={completeOnboarding} 
          onSkip={skipOnboarding} 
        />
      </div>
    );
  }

  // Fallback für authentifizierte Benutzer ohne Tenant/SuperAdmin-Zuordnung
  // Diese Benutzer bekommen Zugriff auf die Standard-Anwendung
  if (isAuthenticated) {
    return (
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        {!isMobile && <Sidebar />}
        <div className="flex-1 flex flex-col overflow-auto bg-white">
          <Routes>
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/mehr" element={<ProtectedRoute><Mehr /></ProtectedRoute>} />
            <Route path="/today" element={<ProtectedRoute><TodayPage /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
            <Route path="/employees/*" element={<ProtectedRoute><EmployeesPage /></ProtectedRoute>} />
            <Route path="/absence" element={<ProtectedRoute><AbsencePage /></ProtectedRoute>} />
            <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
            <Route path="/time" element={<ProtectedRoute><TimePage /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
            <Route path="/tasks" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
            <Route path="/projects" element={<ProtectedRoute><EnterpriseProjectsPage /></ProtectedRoute>} />
            <Route path="/projects/list" element={<ProtectedRoute><ProjectListPage /></ProtectedRoute>} />
            <Route path="/projects/visual-tools" element={<ProtectedRoute><VisualToolsPage /></ProtectedRoute>} />
            <Route path="/projects/new" element={<ProtectedRoute><CreateProjectPage /></ProtectedRoute>} />
            <Route path="/projects/portfolio" element={<ProtectedRoute><ProjectPortfolioPage /></ProtectedRoute>} />
            <Route path="/projects/gantt" element={<ProtectedRoute><GanttPage /></ProtectedRoute>} />
            <Route path="/projects/kanban" element={<ProtectedRoute><ProjectKanbanPage /></ProtectedRoute>} />
            <Route path="/projects/manage" element={<ProtectedRoute><ProjectManagementPage /></ProtectedRoute>} />
            <Route path="/projects/teams" element={<ProtectedRoute><ProjectTeamsPage /></ProtectedRoute>} />
            <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetailPage /></ProtectedRoute>} />
            <Route path="/projects/reports" element={<ProtectedRoute><ProjectReportsPage /></ProtectedRoute>} />
            <Route path="/projects/roadmap" element={<ProtectedRoute><RoadmapPage /></ProtectedRoute>} />
            <Route path="/projects/roadmap/:id" element={<ProtectedRoute><RoadmapDetailPage /></ProtectedRoute>} />
            <Route path="/projects/roadmap/:id" element={<ProtectedRoute><RoadmapDetailPage /></ProtectedRoute>} />
            <Route path="/rewards" element={<ProtectedRoute><RewardsPage /></ProtectedRoute>} />
            <Route path="/workflow" element={<ProtectedRoute><WorkflowPage /></ProtectedRoute>} />
            <Route path="/budget" element={<ProtectedRoute><BudgetPage /></ProtectedRoute>} />
            <Route path="/workforce-planning" element={<ProtectedRoute><WorkforcePlanningPage /></ProtectedRoute>} />
            <Route path="/hr/organization-design" element={<ProtectedRoute><OrganizationDesignPage /></ProtectedRoute>} />
            <Route path="/pulse-surveys" element={<ProtectedRoute><PulseSurveysPage /></ProtectedRoute>} />
            <Route path="/payroll" element={<ProtectedRoute><PayrollPage /></ProtectedRoute>} />
            <Route path="/recruiting" element={<ProtectedRoute><RecruitingPage /></ProtectedRoute>} />
            <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
            <Route path="/performance" element={<ProtectedRoute><PerformancePage /></ProtectedRoute>} />
            <Route path="/knowledge-hub" element={<ProtectedRoute><KnowledgeHubPage /></ProtectedRoute>} />
            <Route path="/documents" element={<ProtectedRoute><DocumentsPage /></ProtectedRoute>} />
            <Route path="/documents/new" element={<ProtectedRoute><NewDocumentsPage /></ProtectedRoute>} />
            <Route path="/documents/approvals" element={<ProtectedRoute><OpenApprovalsPage /></ProtectedRoute>} />
            <Route path="/documents/expiring" element={<ProtectedRoute><ExpiringDocumentsPage /></ProtectedRoute>} />
            <Route path="/documents/all" element={<ProtectedRoute><AllDocumentsPage /></ProtectedRoute>} />
            <Route path="/documents/category/:category" element={<ProtectedRoute><DocumentCategoryPage /></ProtectedRoute>} />
            <Route path="/documents/detail/:id" element={<ProtectedRoute><DocumentDetailPage /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
            <Route path="/expenses" element={<ProtectedRoute><ExpensesPage /></ProtectedRoute>} />
            <Route path="/global-mobility" element={<ProtectedRoute><GlobalMobilityPage /></ProtectedRoute>} />
            <Route path="/helpdesk" element={<ProtectedRoute><HelpdeskPage /></ProtectedRoute>} />
            <Route path="/helpdesk/knowledge/:id" element={<ProtectedRoute><KnowledgeArticleDetailPage /></ProtectedRoute>} />
            <Route path="/helpdesk/workflow/:id" element={<ProtectedRoute><WorkflowDetailPage /></ProtectedRoute>} />
            <Route path="/compliance" element={<ProtectedRoute><CompliancePage /></ProtectedRoute>} />
            <Route path="/ai" element={<ProtectedRoute><AIPage /></ProtectedRoute>} />
            <Route path="/ai/voice-assistant" element={<ProtectedRoute><VoiceAssistantPage /></ProtectedRoute>} />
            <Route path="/ai/smart-insights" element={<ProtectedRoute><SmartInsightsPage /></ProtectedRoute>} />
            <Route path="/goals" element={<ProtectedRoute><GoalsPage /></ProtectedRoute>} />
            <Route path="/voicemail" element={<ProtectedRoute><VoicemailPage /></ProtectedRoute>} />
            <Route path="/environment" element={<ProtectedRoute><EnvironmentPage /></ProtectedRoute>} />
            <Route path="/business-travel/*" element={<ProtectedRoute><BusinessTravelPage /></ProtectedRoute>} />
            <Route path="/shift-planning" element={<ProtectedRoute><ShiftPlanningPage /></ProtectedRoute>} />
            <Route path="/sick-leave" element={<ProtectedRoute><SickLeavePage /></ProtectedRoute>} />
            <Route path="/innovation" element={<ProtectedRoute><InnovationPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/settings/global" element={<ProtectedRoute><GlobalSettingsPage /></ProtectedRoute>} />
            <Route path="/settings/users" element={<ProtectedRoute><UsersRolesSettings /></ProtectedRoute>} />
            <Route path="/settings/company" element={<ProtectedRoute><CompanySettings /></ProtectedRoute>} />
            <Route path="/settings/company/company-data" element={<ProtectedRoute><CompanyDataPage /></ProtectedRoute>} />
            <Route path="/settings/company/locations" element={<ProtectedRoute><LocationsPage /></ProtectedRoute>} />
            <Route path="/settings/company/subsidiaries" element={<ProtectedRoute><SubsidiariesPage /></ProtectedRoute>} />
            <Route path="/settings/company/branding" element={<ProtectedRoute><BrandingPage /></ProtectedRoute>} />
            <Route path="/settings/company/banking" element={<ProtectedRoute><BankingPage /></ProtectedRoute>} />
            <Route path="/settings/company/compliance-docs" element={<ProtectedRoute><ComplianceDocsPage /></ProtectedRoute>} />
            <Route path="/settings/time" element={<ProtectedRoute><TimeSettings /></ProtectedRoute>} />
            <Route path="/settings/worktime" element={<ProtectedRoute><WorktimeSettings /></ProtectedRoute>} />
            <Route path="/settings/absence" element={<ProtectedRoute><AbsenceSettings /></ProtectedRoute>} />
            <Route path="/settings/worktime-absence" element={<ProtectedRoute><WorktimeAbsenceSettings /></ProtectedRoute>} />
            <Route path="/settings/worktime-absence/drag-drop" element={<ProtectedRoute><WorktimeAbsenceDragDrop /></ProtectedRoute>} />
            <Route path="/settings/payroll" element={<ProtectedRoute><PayrollSettings /></ProtectedRoute>} />
            <Route path="/settings/recruiting" element={<ProtectedRoute><RecruitingSettings /></ProtectedRoute>} />
            <Route path="/settings/performance" element={<ProtectedRoute><PerformanceSettings /></ProtectedRoute>} />
            <Route path="/settings/training" element={<ProtectedRoute><TrainingSettings /></ProtectedRoute>} />
            <Route path="/settings/documents" element={<ProtectedRoute><DocumentsSettings /></ProtectedRoute>} />
            <Route path="/settings/notifications" element={<ProtectedRoute><NotificationsSettings /></ProtectedRoute>} />
            <Route path="/settings/integrations" element={<ProtectedRoute><IntegrationsSettings /></ProtectedRoute>} />
            <Route path="/settings/system" element={<ProtectedRoute><SystemSettings /></ProtectedRoute>} />
            <Route path="/settings/dashboard" element={<ProtectedRoute><DashboardConfigPage /></ProtectedRoute>} />
            <Route path="/settings/ai" element={<ProtectedRoute><AISettings /></ProtectedRoute>} />
            <Route path="/settings/business-travel" element={<ProtectedRoute><BusinessTravelSettingsPage /></ProtectedRoute>} />
            <Route path="/settings/tasks" element={<ProtectedRoute><TasksSettings /></ProtectedRoute>} />
            <Route path="/settings/projects" element={<ProtectedRoute><ProjectsSettings /></ProtectedRoute>} />
            <Route path="/settings/helpdesk" element={<ProtectedRoute><HelpdeskSettings /></ProtectedRoute>} />
            <Route path="/settings/shift-planning" element={<ProtectedRoute><ShiftPlanningSettings /></ProtectedRoute>} />
            <Route path="/settings/expenses" element={<ProtectedRoute><ExpensesSettings /></ProtectedRoute>} />
            <Route path="/settings/onboarding" element={<ProtectedRoute><OnboardingSettings /></ProtectedRoute>} />
            <Route path="/settings/offboarding" element={<ProtectedRoute><OffboardingSettings /></ProtectedRoute>} />
            <Route path="/settings/rewards" element={<ProtectedRoute><RewardsSettings /></ProtectedRoute>} />
            <Route path="/settings/workflow" element={<ProtectedRoute><WorkflowSettings /></ProtectedRoute>} />
            <Route path="/settings/innovation" element={<ProtectedRoute><InnovationSettings /></ProtectedRoute>} />
            <Route path="/settings/knowledge" element={<ProtectedRoute><KnowledgeSettings /></ProtectedRoute>} />
            <Route path="/settings/global-mobility" element={<ProtectedRoute><GlobalMobilitySettings /></ProtectedRoute>} />
            <Route path="/settings/calendar" element={<ProtectedRoute><CalendarSettings /></ProtectedRoute>} />
            <Route path="/settings/workforce-planning" element={<ProtectedRoute><WorkforcePlanningSettings /></ProtectedRoute>} />
            <Route path="/settings/orgchart" element={<ProtectedRoute><OrgchartSettings /></ProtectedRoute>} />
            <Route path="/settings/assets" element={<ProtectedRoute><AssetsSettings /></ProtectedRoute>} />
            <Route path="/settings/company-information" element={<ProtectedRoute><CompanyInformationPage /></ProtectedRoute>} />
            <Route path="/settings/timetracking" element={<ProtectedRoute><TimeTrackingSettings /></ProtectedRoute>} />
            <Route path="/settings/compliance-dashboard" element={<ProtectedRoute><SettingsComplianceDashboard /></ProtectedRoute>} />
            <Route path="/company-setup" element={<ProtectedRoute><CompanySetupPage /></ProtectedRoute>} />
            <Route path="/admin/*" element={<SuperAdminRoute><AdminPage /></SuperAdminRoute>} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
        <MinuteCompanion />
        <UserOnboardingWizard 
          isOpen={showOnboardingWizard} 
          onComplete={completeOnboarding} 
          onSkip={skipOnboarding} 
        />
      </div>
    );
  }
  
  // Fallback für nicht-authentifizierte Benutzer - Zeige Marketing Website
  return (
    <Routes>
      {/* Marketing Website Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/funktionen" element={<FeaturesPage />} />
      <Route path="/funktionen/:slug" element={<FeatureDetailPage />} />
      <Route path="/loesungen" element={<SolutionsPage />} />
      <Route path="/preise" element={<PricingPage />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/blog/:slug" element={<BlogPostPage />} />
      <Route path="/ueber-uns" element={<AboutPage />} />
      {/* Legal Pages */}
      <Route path="/impressum" element={<ImpressumPage />} />
      <Route path="/datenschutz" element={<DatenschutzPage />} />
      <Route path="/agb" element={<AGBPage />} />
      {/* Auth Routes */}
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />
      <Route path="/login" element={<Navigate to="/auth/login" replace />} />
      <Route path="/landing" element={<HomePage />} />
      <Route path="/confirm-change" element={<ConfirmChangePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default MultiTenantAppContent;