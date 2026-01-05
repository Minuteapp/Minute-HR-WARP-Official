
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Mic, Settings2, Pencil } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useCompany } from '@/contexts/CompanyContext';
import { useTenant } from '@/contexts/TenantContext';
import { useTenantContext } from '@/hooks/useTenantContext';
import TimeTrackingWidget from '@/components/dashboard/TimeTrackingWidget';
import CalendarWidget from '@/components/dashboard/CalendarWidget';
import TeamStatusCard from '@/components/dashboard/TeamStatusCard';
import ProjectStatusWidget from '@/components/dashboard/ProjectStatusWidget';
import TasksWidget from '@/components/dashboard/TasksWidget';
import SearchWidget from '@/components/dashboard/SearchWidget';
import { CompanyBrandedHeader } from '@/components/CompanyBrandedHeader';
import { DashboardBuilderModal } from '@/components/dashboard/DashboardBuilderModal';
import { ModuleHeader } from '@/components/layout/ModuleHeader';
import MobileTimeTrackingCard from '@/components/dashboard/mobile/MobileTimeTrackingCard';
import MobileTeamCard from '@/components/dashboard/mobile/MobileTeamCard';
import MobileCalendarCard from '@/components/dashboard/mobile/MobileCalendarCard';
import MobileTasksCard from '@/components/dashboard/mobile/MobileTasksCard';
import MobileRecruitingCard from '@/components/dashboard/mobile/MobileRecruitingCard';
import MobileGoalsCard from '@/components/dashboard/mobile/MobileGoalsCard';
import MobileBottomNav from '@/components/dashboard/mobile/MobileBottomNav';

const DashboardPage = () => {
  const { user } = useAuth();
  const { currentCompany, loading } = useCompany();
  const { tenantCompany } = useTenant();
  const { clearTenantContext } = useTenantContext();
  const [showBuilderModal, setShowBuilderModal] = useState(false);
  const navigate = useNavigate();
  
  // NOTFALL: Tenant-Kontext löschen
  const handleEmergencyExit = async () => {
    try {
      await clearTenantContext();
      window.location.href = '/admin';
    } catch (error) {
      console.error('Emergency exit failed:', error);
      // Fallback: Direkte Navigation
      window.location.href = '/admin';
    }
  };
  
  if (loading) {
    return (
      <div className="w-full p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-6"></div>
          <div className="h-32 bg-muted rounded mb-6"></div>
        </div>
      </div>
    );
  }
  
  return (
    <>
      {/* Mobile View - BREITERE ANSICHT */}
      <div className="md:hidden min-h-screen bg-[#F5F5F7] pb-24 max-w-[500px] mx-auto">
        {/* Mobile Header mit BLAUEM Gradient */}
        <div className="sticky top-0 z-40 bg-gradient-to-r from-[#5B50FF] via-[#6366F1] to-[#5B50FF]">
          {/* Status Bar */}
          <div className="flex items-center justify-between px-5 py-2">
            <span className="text-xs text-white/70">mobile_dashboard</span>
            <div className="flex items-center gap-1">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4].map((bar) => (
                  <div key={bar} className="w-1 h-3 bg-yellow-400 rounded-full" />
                ))}
              </div>
              <span className="text-xs text-white font-medium ml-1">100%</span>
            </div>
          </div>
          {/* Logo */}
          <div className="flex justify-center px-5 pb-5 pt-2">
            <h1 className="text-3xl font-bold text-white tracking-wide">MINUTE</h1>
          </div>
        </div>

        {/* Edit Button for Mobile */}
        <div className="absolute top-14 right-4 z-50">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-white/20 text-white hover:bg-white/30"
            onClick={() => setShowBuilderModal(true)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>

        {/* Mobile Dashboard Cards - 2-spaltiges Grid BREITER */}
        <div className="px-3 py-3">
          <div className="grid grid-cols-2 gap-3">
            <MobileTimeTrackingCard />
            <MobileTeamCard />
            <MobileCalendarCard />
            <MobileTasksCard />
            <MobileRecruitingCard />
            <MobileGoalsCard />
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav />
      </div>

      {/* Desktop View */}
      <div className="hidden md:block">
          <ModuleHeader 
          title="Dashboard" 
          subtitle="Übersicht aller wichtigen Informationen"
          actions={
            <>
              <Button 
                variant="outline"
                onClick={() => setShowBuilderModal(true)}
                className="whitespace-nowrap"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Dashboard bearbeiten
              </Button>
              <Button 
                onClick={() => navigate('/ai/voice-assistant')}
                variant="outline"
                size="icon"
              >
                <Mic className="h-4 w-4" />
              </Button>
              {currentCompany && (
                <CompanyBrandedHeader 
                  companyId={currentCompany.id} 
                  fallbackTitle={currentCompany.name}
                />
              )}
            </>
          }
        />
        <div className="w-full p-6">
        
        <Card className="p-6 shadow-lg mb-6">
          <h2 className="font-semibold text-lg mb-2">
            Willkommen bei {currentCompany?.name || 'MINUTE'}
          </h2>
          <p className="text-gray-600">
            Angemeldet als: {user?.email || 'Benutzer'}
          </p>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <TimeTrackingWidget />
          <CalendarWidget />
          <SearchWidget />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          <div className="border border-primary/40 shadow-lg rounded-lg">
            <TeamStatusCard />
          </div>
          <div className="border border-primary/40 shadow-lg rounded-lg">
            <ProjectStatusWidget />
          </div>
          <div className="border border-primary/40 shadow-lg rounded-lg">
            <TasksWidget />
          </div>
        </div>

        <DashboardBuilderModal 
          open={showBuilderModal}
          onOpenChange={setShowBuilderModal}
        />
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
