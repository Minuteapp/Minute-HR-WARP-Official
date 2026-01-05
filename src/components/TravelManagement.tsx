import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { ScrollArea } from "./ui/scroll-area";
import { useIsMobile } from "./ui/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { useBusinessTravelPermissions } from "@/hooks/useBusinessTravelPermissions";
import { 
  Calendar, MapPin, Euro, FileText, Users, BarChart3, Settings, Plus, Receipt, Car, 
  CreditCard, Workflow, Link, PieChart, UserCheck, Globe, Menu, Home, Plane, 
  RefreshCw, ChevronDown, ArrowLeft, Search, Bell, Filter, Briefcase
} from "lucide-react";
import { TravelRequestForm } from "./travel/TravelRequestForm";
import { ExpenseForm } from "./travel/ExpenseForm";
import { BusinessTravelDashboard } from "./business-travel/BusinessTravelDashboard";

import { TravelCards } from "./travel/TravelCards";
import { ExpenseList } from "./travel/ExpenseList";
import { AdminPanel } from "./travel/AdminPanel";
import { TeamTravelMap } from "./travel/TeamTravelMap";
import { ExpenseCategories } from "./travel/expenses/ExpenseCategories";
import { PerDiemManagement } from "./travel/expenses/PerDiemManagement";
import { MileageManagement } from "./travel/expenses/MileageManagement";
import { ExpenseCategoriesTab } from "./business-travel/expenses/ExpenseCategoriesTab";
import { PerDiemTab } from "./business-travel/expenses/PerDiemTab";
import { MileageTab } from "./business-travel/expenses/MileageTab";
import { CompanyCardsTab } from "./business-travel/expenses/CompanyCardsTab";
import { WorkflowApprovalTab } from "./business-travel/tabs/WorkflowApprovalTab";
import { IntegrationsTab } from "./business-travel/tabs/IntegrationsTab";
import { ReportingAnalyticsTab } from "./business-travel/tabs/ReportingAnalyticsTab";
import { DocumentArchiveTab } from "./business-travel/tabs/DocumentArchiveTab";
import { LiveMapTab } from "./business-travel/tabs/LiveMapTab";
import { AdminApprovalsTab } from "./business-travel/tabs/AdminApprovalsTab";
import { RolesAndDemoTab } from "./business-travel/tabs/RolesAndDemoTab";
import AdminDashboardTab from "./business-travel/admin/AdminDashboardTab";
import MyTripsTab from "./business-travel/MyTripsTab";
import TripDetailView from "./business-travel/TripDetailView";
import TravelRequestsTab from "./business-travel/TravelRequestsTab";
import TripDetailViewExtended from "./business-travel/TripDetailViewExtended";
import BusinessTripWizardDialog from "./business-travel/wizard/BusinessTripWizardDialog";
import { ExpenseAccountingTab } from "./business-travel/expenses/ExpenseAccountingTab";


interface User {
  id: string;
  name: string;
  role: 'employee' | 'supervisor' | 'hr' | 'finance' | 'admin';
  department: string;
}

export function TravelManagement() {
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [showNewTripWizard, setShowNewTripWizard] = useState(false);
  const isMobile = useIsMobile();
  const sheetRef = useRef<HTMLDivElement>(null);
  
  // KRITISCH: Echte User-Daten aus Auth-Context statt Mock
  const { user } = useAuth();
  
  // Rollenbasierte Berechtigungen
  const permissions = useBusinessTravelPermissions();
  
  // User-Objekt für Legacy-Komponenten (wird schrittweise entfernt)
  const currentUser: User = {
    id: user?.id || '',
    name: user?.email?.split('@')[0] || 'User',
    role: 'employee',
    department: 'Default'
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sheetRef.current && !sheetRef.current.contains(event.target as Node)) {
        setShowMobileMenu(false);
      }
    };

    if (showMobileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMobileMenu]);

  // Define available views basierend auf Berechtigungen
  const getAvailableViews = useMemo(() => {
    const allViews = [
      { key: 'dashboard', label: 'Dashboard', icon: Home, permission: permissions.canViewDashboard },
      { key: 'my-trips', label: 'Meine Reisen', icon: Briefcase, permission: permissions.canViewMyTrips },
      { key: 'travel-requests', label: 'Reiseanträge', icon: Plane, permission: permissions.canViewTravelRequests },
      { key: 'expenses', label: 'Spesen', icon: Receipt, permission: permissions.canViewExpenses },
      { key: 'expense-categories', label: 'Spesenkategorien', icon: FileText, permission: permissions.canViewExpenseCategories },
      { key: 'per-diem', label: 'Tagegeld', icon: Euro, permission: permissions.canViewPerDiem },
      { key: 'mileage', label: 'Kilometergelder', icon: Car, permission: permissions.canViewMileage },
      { key: 'company-cards', label: 'Firmenkarten', icon: CreditCard, permission: permissions.canViewCompanyCards },
      { key: 'workflow', label: 'Workflow', icon: Workflow, permission: permissions.canViewWorkflow },
      { key: 'integrations', label: 'Integrationen', icon: Link, permission: permissions.canViewIntegrations },
      { key: 'reporting', label: 'Berichte', icon: PieChart, permission: permissions.canViewReporting },
      { key: 'team-travel', label: 'Team Reisen', icon: Users, permission: permissions.canViewTeamTravel },
      { key: 'roles-demo', label: 'Rollen & Demo', icon: UserCheck, permission: permissions.canViewRolesDemo },
      { key: 'admin', label: 'Administration', icon: Settings, permission: permissions.canViewAdmin }
    ];
    
    return allViews.filter(view => view.permission);
  }, [permissions]);

  // Tab-Wechsel wenn aktueller Tab nicht mehr sichtbar
  useEffect(() => {
    const availableKeys = getAvailableViews.map(v => v.key);
    if (!availableKeys.includes(activeView) && availableKeys.length > 0) {
      setActiveView(availableKeys[0]);
    }
  }, [getAvailableViews, activeView]);

  const getCurrentPageTitle = () => {
    const currentView = getAvailableViews.find(view => view.key === activeView);
    if (currentView) return currentView.label;
    
    switch (activeView) {
      case 'new-travel': return 'Neuer Reiseantrag';
      case 'new-expense': return 'Neue Spesenabrechnung';
      default: return 'Business Travel & Spesen';
    }
  };

  // Desktop header
  const DesktopHeader = () => (
    <div className="border-b bg-white sticky top-0 z-40">
      <div className="w-full px-4">
        <div className="flex justify-between items-start py-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-sky-100 flex items-center justify-center">
              <Plane className="h-6 w-6 text-sky-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Geschäftsreisen</h1>
              <p className="text-sm text-muted-foreground">Business Travel und Spesenabrechnung</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Mobile header
  const MobileHeader = () => (
    <div className="bg-white border-b sticky top-0 z-50 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {['new-travel', 'new-expense'].includes(activeView) ? (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setActiveView(activeView === 'new-travel' ? 'travel-requests' : 'expenses')}
              className="p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          ) : (
            <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-0">
                <SheetHeader className="px-6 py-4 border-b">
                  <SheetTitle className="text-left">Navigation</SheetTitle>
                  <SheetDescription className="text-left">
                    Wählen Sie einen Bereich aus
                  </SheetDescription>
                </SheetHeader>
                <ScrollArea className="flex-1 px-6 py-4">
                  <div className="space-y-2">
                    {getAvailableViews.map((item) => (
                      <Button
                        key={item.key}
                        variant={activeView === item.key ? "secondary" : "ghost"}
                        className="w-full justify-start gap-3 h-12"
                        onClick={() => {
                          setActiveView(item.key);
                          setShowMobileMenu(false);
                        }}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>
          )}
        </div>
        
        <div className="flex-1 text-center">
          <h1 className="font-semibold text-lg truncate">{getCurrentPageTitle()}</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="p-2">
            <Bell className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );

  // Mobile bottom navigation
  const MobileBottomNav = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t z-50 safe-area-pb">
      <div className="grid grid-cols-4 gap-1 p-2">
        {getAvailableViews.slice(0, 4).map((item) => (
          <Button
            key={item.key}
            variant={activeView === item.key ? "secondary" : "ghost"}
            className="flex-col h-14 p-1 gap-1"
            onClick={() => setActiveView(item.key)}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs">{item.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );

  // Desktop navigation tabs
  const DesktopTabs = () => (
    <div className="overflow-x-auto px-6">
      <TabsList className="bg-transparent border-b w-full justify-start rounded-none h-auto p-0 space-x-4 inline-flex min-w-max">
        {getAvailableViews.map((item) => (
          <TabsTrigger 
            key={item.key} 
            value={item.key} 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3 flex items-center gap-2 whitespace-nowrap"
          >
            <item.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{item.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
  );

  // ENTFERNT: Mock User durch echte Auth-Daten ersetzt
  // Travel/Expense Komponenten sollten useAuth() Hook intern verwenden

  return (
    <div className="min-h-screen bg-background">
      {isMobile ? <MobileHeader /> : <DesktopHeader />}

      <div className={`${isMobile ? 'pb-20' : ''}`} ref={sheetRef}>
        <Tabs value={activeView} onValueChange={setActiveView} className="space-y-6">
          {!isMobile && <DesktopTabs />}

          {/* Main Content */}
          <div className={isMobile ? "px-4 py-4" : "px-6 py-6"}>
            <TabsContent value="dashboard" className="mt-0">
              <BusinessTravelDashboard />
            </TabsContent>

            <TabsContent value="my-trips" className="mt-0">
              {selectedTripId ? (
                <TripDetailViewExtended
                  tripId={selectedTripId}
                  onBack={() => setSelectedTripId(null)}
                />
              ) : (
                <MyTripsTab onTripSelect={(tripId) => setSelectedTripId(tripId)} />
              )}
            </TabsContent>

            <TabsContent value="travel-requests" className="mt-0">
              {selectedTripId ? (
                <TripDetailViewExtended
                  tripId={selectedTripId}
                  onBack={() => setSelectedTripId(null)}
                />
              ) : (
                <TravelRequestsTab
                  onTripClick={(tripId) => setSelectedTripId(tripId)}
                  onNewTrip={() => setShowNewTripWizard(true)}
                />
              )}
              <BusinessTripWizardDialog
                open={showNewTripWizard}
                onOpenChange={setShowNewTripWizard}
                employeeData={{
                  name: currentUser.name,
                  employeeId: currentUser.id,
                  department: currentUser.department,
                  supervisor: ""
                }}
              />
            </TabsContent>

            <TabsContent value="new-travel" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Neuer Reiseantrag</CardTitle>
                  <CardDescription>
                    Beantragen Sie eine neue Geschäftsreise mit allen erforderlichen Details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TravelRequestForm user={currentUser} onSubmit={() => setActiveView('travel-requests')} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="expenses" className="mt-0">
              <ExpenseAccountingTab isAdmin={true} />
            </TabsContent>

            <TabsContent value="new-expense" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Neue Spesenabrechnung</CardTitle>
                  <CardDescription>
                    Erfassen Sie Ihre Reisekosten mit automatischer Belegverarbeitung
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ExpenseForm user={currentUser} onSubmit={() => setActiveView('expenses')} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Expense Management Modules */}
            <TabsContent value="expense-categories" className="mt-0">
              <ExpenseCategoriesTab />
            </TabsContent>

            <TabsContent value="per-diem" className="mt-0">
              <PerDiemTab />
            </TabsContent>

            <TabsContent value="mileage" className="mt-0">
              <MileageTab />
            </TabsContent>

            <TabsContent value="company-cards" className="mt-0">
              <CompanyCardsTab />
            </TabsContent>

            <TabsContent value="workflow" className="mt-0">
              <WorkflowApprovalTab />
            </TabsContent>

            <TabsContent value="integrations" className="mt-0">
              <IntegrationsTab />
            </TabsContent>

            <TabsContent value="reporting" className="mt-0">
              <ReportingAnalyticsTab />
            </TabsContent>

            {/* Team Management */}
            <TabsContent value="team-travel" className="mt-0">
              <LiveMapTab />
            </TabsContent>

            <TabsContent value="roles-demo" className="mt-0">
              <RolesAndDemoTab />
            </TabsContent>

            <TabsContent value="admin" className="mt-0">
              <AdminApprovalsTab />
            </TabsContent>

            <TabsContent value="documents" className="mt-0">
              <DocumentArchiveTab />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {isMobile && <MobileBottomNav />}
    </div>
  );
}