import { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutDashboard, 
  Gift,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
  BarChart3,
  Send,
  Archive,
  Settings
} from "lucide-react";
import { usePermissionContext } from '@/contexts/PermissionContext';
import { RewardsOverviewNew } from './RewardsOverviewNew';
import { RewardsCatalog } from './RewardsCatalog';
import { PeerRecognitionTab } from './PeerRecognitionTab';
import { BudgetsTab } from './BudgetsTab';
import { RewardsReportsTab } from './RewardsReportsTab';
import DistributionTab from './DistributionTab';
import ArchiveTab from './ArchiveTab';
import SettingsTab from './SettingsTab';

export const RewardsDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { hasPermission } = usePermissionContext();

  // Berechtigungsbasierte Tabs
  const allTabs = [
    { id: 'overview', label: 'Übersicht', icon: LayoutDashboard, requiredAction: 'view' },
    { id: 'catalog', label: 'Belohnungskatalog', icon: Gift, requiredAction: 'view' },
    { id: 'rules', label: 'Incentive-Regeln', icon: Sparkles, requiredAction: 'update', adminOnly: true },
    { id: 'performance', label: 'Leistungsbasiert', icon: TrendingUp, requiredAction: 'view' },
    { id: 'peer', label: 'Peer-Anerkennung', icon: Users, requiredAction: 'view' },
    { id: 'budgets', label: 'Budgets', icon: Wallet, requiredAction: 'view', scope: 'budget' },
    { id: 'reports', label: 'Auswertungen', icon: BarChart3, requiredAction: 'export' },
    { id: 'distribution', label: 'Ausgabe', icon: Send, requiredAction: 'update' },
    { id: 'archive', label: 'Archiv', icon: Archive, requiredAction: 'view' },
    { id: 'settings', label: 'Einstellungen', icon: Settings, requiredAction: 'update', adminOnly: true },
  ];

  const tabs = useMemo(() => {
    const canAdmin = hasPermission('benefits', 'update');
    return allTabs.filter(tab => {
      if (tab.adminOnly && !canAdmin) return false;
      return hasPermission('benefits', tab.requiredAction);
    });
  }, [hasPermission]);

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start border-b pb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-pink-100 flex items-center justify-center">
              <Gift className="h-6 w-6 text-pink-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Belohnungen & Goodies</h1>
              <p className="text-sm text-muted-foreground">Motivieren Sie Ihr Team mit automatisierten Belohnungen und Incentives</p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex items-center gap-6 border-b bg-transparent h-auto p-0 overflow-x-auto w-full justify-start rounded-none">
          {tabs.map(tab => (
            <TabsTrigger 
              key={tab.id}
              value={tab.id} 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3 flex items-center gap-2"
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <RewardsOverviewNew />
        </TabsContent>

        <TabsContent value="catalog" className="mt-6">
          <RewardsCatalog />
        </TabsContent>

        <TabsContent value="rules" className="mt-6">
          <div className="text-center py-10 text-muted-foreground">
            Incentive-Regeln (Coming Soon)
          </div>
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          <div className="text-center py-10 text-muted-foreground">
            Leistungsbasierte Belohnungen (Coming Soon)
          </div>
        </TabsContent>

        <TabsContent value="peer" className="mt-6">
          <PeerRecognitionTab />
        </TabsContent>

        <TabsContent value="budgets" className="mt-6">
          <BudgetsTab />
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <RewardsReportsTab />
        </TabsContent>

        <TabsContent value="distribution" className="mt-6">
          <DistributionTab />
        </TabsContent>

        <TabsContent value="archive" className="mt-6">
          <ArchiveTab />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <SettingsTab />
        </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
