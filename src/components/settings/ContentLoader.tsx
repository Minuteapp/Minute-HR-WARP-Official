
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

// Import all settings components
import SystemSettings from './SystemSettings';
import CompanySettings from './CompanySettings';
import SecuritySettings from './SecuritySettings';
import CalendarSyncSettings from './calendar/CalendarSyncSettings';
import CalendarHolidaySettings from './calendar/CalendarHolidaySettings';
import TimeRoundingSettings from './time/TimeRoundingSettings';
import TimeReminderSettings from './time/TimeReminderSettings';
import TimePayrollSyncSettings from './time/TimePayrollSyncSettings';
import BudgetIntervalSettings from './budget/BudgetIntervalSettings';
import BudgetExportSettings from './budget/BudgetExportSettings';
import PayrollBenefitSettings from './payroll/PayrollBenefitSettings';
import PayrollGdprSettings from './payroll/PayrollGdprSettings';
import GeneralSettings from './general/GeneralSettings';
import UserManagement from './UserManagement';
import NotificationSettings from './NotificationSettings';
import IntegrationSettings from './IntegrationSettings';
import ComplianceSettings from './ComplianceSettings';
import TimeTrackingSettings from '../time/TimeTrackingSettings';
import { DashboardBuilder } from './DashboardBuilder';
import { WidgetManagement } from './WidgetManagement';
import { DashboardTemplates } from './DashboardTemplates';
import { GlobalSettings } from './global/GlobalSettings';
import { CompanyBranding } from '../../pages/settings/company/components/CompanyBranding';
import { CompanyMasterData } from './company/CompanyMasterData';
import { CompanyOrganization } from './company/CompanyOrganization';
import { CompanyLegal } from './company/CompanyLegal';
import { CompanyLocations } from './company/CompanyLocations';
import { CompanyCommunication } from './company/CompanyCommunication';
import { CompanyReports } from './company/CompanyReports';
import { CompanyInformationModule } from './company/CompanyInformationModule';
import AbsenceRequests from '../../pages/settings/time/components/AbsenceRequests';
import { AbsenceGeneralSettings } from './absence/AbsenceGeneralSettings';
import { AbsenceTypesSettings } from './absence/AbsenceTypesSettings';
import { AbsenceApprovalsSettings } from './absence/AbsenceApprovalsSettings';
import { AbsenceNotificationsSettings } from './absence/AbsenceNotificationsSettings';
import { AbsenceIntegrationsSettings } from './absence/AbsenceIntegrationsSettings';
import { AbsenceVisibilitySettings } from './absence/AbsenceVisibilitySettings';

interface ContentLoaderProps {
  componentName: string;
  title: string;
  breadcrumbs?: {
    category: string;
    subcategory?: string;
  } | null;
}

const componentMap: Record<string, React.ComponentType> = {
  SystemSettings,
  CompanySettings,
  SecuritySettings,
  CalendarSyncSettings,
  CalendarHolidaySettings,
  TimeRoundingSettings,
  TimeReminderSettings,
  TimePayrollSyncSettings,
  BudgetIntervalSettings,
  BudgetExportSettings,
  PayrollBenefitSettings,
  PayrollGdprSettings,
  GeneralSettings,
  UserManagement,
  NotificationSettings,
  IntegrationSettings,
  ComplianceSettings,
  TimeTrackingSettings,
  DashboardBuilder,
  WidgetManagement,
  DashboardTemplates,
  GlobalSettings,
  CompanyBranding,
  CompanyMasterData,
  CompanyOrganization,
  CompanyLegal,
  CompanyLocations,
  CompanyCommunication,
  CompanyReports,
  CompanyInformationModule,
  AbsenceRequests,
  AbsenceGeneralSettings,
  AbsenceTypesSettings,
  AbsenceApprovalsSettings,
  AbsenceNotificationsSettings,
  AbsenceIntegrationsSettings,
  AbsenceVisibilitySettings,
};

const ContentLoader: React.FC<ContentLoaderProps> = ({ 
  componentName, 
  title, 
  breadcrumbs 
}) => {
  const navigate = useNavigate();
  
  const Component = componentMap[componentName];
  
  if (!Component) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Komponente nicht gefunden</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Die angeforderte Einstellungskomponente "{componentName}" wurde nicht gefunden.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {breadcrumbs && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/settings')}
            className="h-auto p-1"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span>Einstellungen</span>
          <span>/</span>
          <span>{breadcrumbs.category}</span>
          {breadcrumbs.subcategory && (
            <>
              <span>/</span>
              <span className="font-medium">{breadcrumbs.subcategory}</span>
            </>
          )}
        </div>
      )}
      
      <div>
        <h1 className="text-2xl font-bold mb-6">{title}</h1>
        <Component />
      </div>
    </div>
  );
};

export default ContentLoader;
