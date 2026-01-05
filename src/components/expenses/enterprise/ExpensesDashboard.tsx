import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LayoutGrid, 
  Receipt, 
  Users, 
  CreditCard, 
  CheckSquare, 
  FileText, 
  Calendar, 
  BarChart3, 
  Archive, 
  Settings 
} from 'lucide-react';
import OverviewTab from './overview/OverviewTab';
import MyExpensesTab from './tabs/MyExpensesTab';
import TeamExpensesTab from './tabs/TeamExpensesTab';
import CorporateCardsTab from './tabs/CorporateCardsTab';
import ApprovalsTab from './tabs/ApprovalsTab';
import PoliciesTab from './tabs/PoliciesTab';
import BillingTab from './tabs/BillingTab';
import AnalyticsTab from './tabs/AnalyticsTab';
import ArchiveTab from './tabs/ArchiveTab';
import ExpenseSettingsTab from './tabs/ExpenseSettingsTab';
import { useExpensePermissions } from '@/hooks/useExpensePermissions';

const ExpensesDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const {
    canViewOverview,
    canViewMyExpenses,
    canViewTeamExpenses,
    canViewCorporateCards,
    canViewApprovals,
    canViewPolicies,
    canViewBilling,
    canViewAnalytics,
    canViewArchive,
    canViewSettings,
    isLoading,
  } = useExpensePermissions();

  // Wenn der aktuelle Tab nicht mehr sichtbar ist, auf einen erlaubten Tab wechseln
  useEffect(() => {
    const tabPermissions: Record<string, boolean> = {
      'overview': canViewOverview,
      'my-expenses': canViewMyExpenses,
      'team-expenses': canViewTeamExpenses,
      'corporate-cards': canViewCorporateCards,
      'approvals': canViewApprovals,
      'policies': canViewPolicies,
      'billing': canViewBilling,
      'analytics': canViewAnalytics,
      'archive': canViewArchive,
      'settings': canViewSettings,
    };

    if (!tabPermissions[activeTab]) {
      // Ersten erlaubten Tab finden
      const firstAllowedTab = Object.entries(tabPermissions).find(([, allowed]) => allowed)?.[0];
      if (firstAllowedTab) {
        setActiveTab(firstAllowedTab);
      }
    }
  }, [activeTab, canViewOverview, canViewMyExpenses, canViewTeamExpenses, canViewCorporateCards, canViewApprovals, canViewPolicies, canViewBilling, canViewAnalytics, canViewArchive, canViewSettings]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start border-b pb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
              <Receipt className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Ausgaben</h1>
              <p className="text-sm text-muted-foreground">Spesen und Ausgabenverwaltung</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-transparent border-b w-full justify-start rounded-none h-auto p-0 space-x-6 flex-wrap">
            {canViewOverview && (
              <TabsTrigger 
                value="overview"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3 flex items-center gap-2"
              >
                <LayoutGrid className="h-4 w-4" />
                Übersicht
              </TabsTrigger>
            )}
            {canViewMyExpenses && (
              <TabsTrigger 
                value="my-expenses"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3 flex items-center gap-2"
              >
                <Receipt className="h-4 w-4" />
                Meine Ausgaben
              </TabsTrigger>
            )}
            {canViewTeamExpenses && (
              <TabsTrigger 
                value="team-expenses"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3 flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Team-Ausgaben
              </TabsTrigger>
            )}
            {canViewCorporateCards && (
              <TabsTrigger 
                value="corporate-cards"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3 flex items-center gap-2"
              >
                <CreditCard className="h-4 w-4" />
                Firmenkarten
              </TabsTrigger>
            )}
            {canViewApprovals && (
              <TabsTrigger 
                value="approvals"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3 flex items-center gap-2"
              >
                <CheckSquare className="h-4 w-4" />
                Genehmigungen
              </TabsTrigger>
            )}
            {canViewPolicies && (
              <TabsTrigger 
                value="policies"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3 flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Richtlinien
              </TabsTrigger>
            )}
            {canViewBilling && (
              <TabsTrigger 
                value="billing"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3 flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                Abrechnung
              </TabsTrigger>
            )}
            {canViewAnalytics && (
              <TabsTrigger 
                value="analytics"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3 flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Auswertungen
              </TabsTrigger>
            )}
            {canViewArchive && (
              <TabsTrigger 
                value="archive"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3 flex items-center gap-2"
              >
                <Archive className="h-4 w-4" />
                Archiv
              </TabsTrigger>
            )}
            {canViewSettings && (
              <TabsTrigger 
                value="settings"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3 flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Einstellungen
              </TabsTrigger>
            )}
          </TabsList>
          
          {canViewOverview && (
            <TabsContent value="overview" className="mt-6">
              <OverviewTab />
            </TabsContent>
          )}
          
          {canViewMyExpenses && (
            <TabsContent value="my-expenses" className="mt-6">
              <MyExpensesTab />
            </TabsContent>
          )}
          
          {canViewTeamExpenses && (
            <TabsContent value="team-expenses" className="mt-6">
              <TeamExpensesTab />
            </TabsContent>
          )}
          
          {canViewCorporateCards && (
            <TabsContent value="corporate-cards" className="mt-6">
              <CorporateCardsTab />
            </TabsContent>
          )}
          
          {canViewApprovals && (
            <TabsContent value="approvals" className="mt-6">
              <ApprovalsTab />
            </TabsContent>
          )}
          
          {canViewPolicies && (
            <TabsContent value="policies" className="mt-6">
              <PoliciesTab />
            </TabsContent>
          )}
          
          {canViewBilling && (
            <TabsContent value="billing" className="mt-6">
              <BillingTab />
            </TabsContent>
          )}
          
          {canViewAnalytics && (
            <TabsContent value="analytics" className="mt-6">
              <AnalyticsTab />
            </TabsContent>
          )}
          
          {canViewArchive && (
            <TabsContent value="archive" className="mt-6">
              <ArchiveTab />
            </TabsContent>
          )}
          
          {canViewSettings && (
            <TabsContent value="settings" className="mt-6">
              <ExpenseSettingsTab />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default ExpensesDashboard;
