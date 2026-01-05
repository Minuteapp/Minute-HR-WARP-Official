import React from 'react';
import Header from '@/components/layout/Header';
import { EmployeeTimeTrackingWidget } from '../employee/EmployeeTimeTrackingWidget';
import { MyVacationWidget } from '../employee/MyVacationWidget';
import { MyGoalsWidget } from '../employee/MyGoalsWidget';
import { MyTrainingWidget } from '../employee/MyTrainingWidget';
import { EmployeeWelcomeBanner } from '../employee/EmployeeWelcomeBanner';
import { EmployeeQuickActionsWidget } from '../employee/EmployeeQuickActionsWidget';
import { SalaryBenefitsWidget } from '../employee/SalaryBenefitsWidget';
import { FeedbackKudosWidget } from '../employee/FeedbackKudosWidget';
import { WorkTimeBalanceWidget } from '../employee/WorkTimeBalanceWidget';
import { TeamColleaguesWidget } from '../employee/TeamColleaguesWidget';
import { MyDocumentsWidget } from '../employee/MyDocumentsWidget';
import { EmployeeTasksWidget } from '../employee/EmployeeTasksWidget';
import { EmployeeProjectsWidget } from '../employee/EmployeeProjectsWidget';
import { useSidebarPermissions } from '@/hooks/useSidebarPermissions';

const EmployeeDesktopDashboard: React.FC = () => {
  const { isModuleVisible } = useSidebarPermissions();

  // Check visibility for conditional widgets
  const showProjectsWidget = isModuleVisible('/projects');
  const showPayrollWidget = isModuleVisible('/payroll');

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      <Header />
      <div className="flex-1 overflow-y-auto bg-background p-6 space-y-4">
        {/* Erste Reihe - 4 KPI Widgets */}
        <div className="grid grid-cols-4 gap-4">
          <EmployeeTimeTrackingWidget />
          <MyVacationWidget />
          <MyGoalsWidget />
          <MyTrainingWidget />
        </div>

        {/* Willkommen Banner */}
        <EmployeeWelcomeBanner />

        {/* Zweite Reihe - 4 Widgets (conditional rendering) */}
        <div className="grid grid-cols-4 gap-4">
          <EmployeeQuickActionsWidget />
          {showPayrollWidget && <SalaryBenefitsWidget />}
          <FeedbackKudosWidget />
          <WorkTimeBalanceWidget />
        </div>

        {/* Dritte Reihe - 3 Widgets */}
        <div className="grid grid-cols-3 gap-4">
          <TeamColleaguesWidget />
          <MyDocumentsWidget />
          <EmployeeTasksWidget />
        </div>

        {/* Vierte Reihe - Projekte volle Breite (conditional) */}
        {showProjectsWidget && <EmployeeProjectsWidget />}
      </div>
    </div>
  );
};

export default EmployeeDesktopDashboard;