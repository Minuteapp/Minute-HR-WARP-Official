import Header from '@/components/layout/Header';
import CalendarWidget from '../CalendarWidget';
import TimeTrackingWidget from '../TimeTrackingWidget';
import QuickActionsWidget from '../QuickActionsWidget';
import ProjectWidget from '../ProjectWidget';
import TasksWidget from '../TasksWidget';
import TeamStatusCard from '../TeamStatusCard';
import RecruitingWidget from '../RecruitingWidget';
import GoalsWidget from '../GoalsWidget';
import PageLayout from '@/components/layout/PageLayout';
import React from 'react';

const DesktopDashboard = () => {
  
  return <div className="flex-1 flex flex-col h-screen overflow-hidden">
      <Header />
      <div className="flex-1 overflow-y-auto bg-white">
        <PageLayout>
          <div className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="border border-primary/40 shadow-lg rounded-lg">
                <CalendarWidget />
              </div>
              <div className="border border-primary/40 shadow-lg rounded-lg">
                <TimeTrackingWidget />
              </div>
              <div className="border border-primary/40 shadow-lg rounded-lg">
                <TeamStatusCard />
              </div>
            </div>
            
            <div className="border border-primary/40 shadow-lg rounded-lg">
              <QuickActionsWidget />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="border border-primary/40 shadow-lg rounded-lg">
                <ProjectWidget />
              </div>
              <div className="border border-primary/40 shadow-lg rounded-lg">
                <TasksWidget />
              </div>
              <div className="border border-primary/40 shadow-lg rounded-lg">
                <RecruitingWidget />
              </div>
              <div className="border border-primary/40 shadow-lg rounded-lg">
                <GoalsWidget />
              </div>
            </div>
          </div>
        </PageLayout>
      </div>
    </div>;
};
export default DesktopDashboard;