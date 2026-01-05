import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard,
  Target, 
  Users, 
  Building2, 
  BarChart3, 
  Sparkles,
  Plus,
  Eye
} from 'lucide-react';
import { OverviewTab } from './tabs/OverviewTab';
import { MyGoalsTab } from './tabs/MyGoalsTab';
import { TeamGoalsTab } from './tabs/TeamGoalsTab';
import { CompanyGoalsTab } from './tabs/CompanyGoalsTab';
import { OKRKPITab } from './tabs/OKRKPITab';
import { AIAnalysisTab } from './tabs/AIAnalysisTab';

export const GoalsMainTabs = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    {
      id: 'overview',
      label: 'Übersicht',
      icon: LayoutDashboard,
      badge: null,
      component: OverviewTab
    },
    {
      id: 'my-goals',
      label: 'Meine Ziele',
      icon: Target,
      badge: 0,
      component: MyGoalsTab
    },
    {
      id: 'team-goals',
      label: 'Teamziele',
      icon: Users,
      badge: 4,
      component: TeamGoalsTab
    },
    {
      id: 'company-goals',
      label: 'Unternehmensziele',
      icon: Building2,
      badge: 6,
      component: CompanyGoalsTab
    },
    {
      id: 'okr-kpi',
      label: 'OKR & KPI',
      icon: BarChart3,
      badge: null,
      component: OKRKPITab
    },
    {
      id: 'ai-analysis',
      label: 'KI-Analysen',
      icon: Sparkles,
      badge: null,
      component: AIAnalysisTab
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Ziele</h1>
            <p className="text-sm text-gray-600 mt-1">OKR & Goal Management System</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Vorschau
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Neues Ziel
            </Button>
          </div>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-transparent border-b w-full justify-start rounded-none h-auto p-0 space-x-6">
            {tabs.map((tab) => (
              <TabsTrigger 
                key={tab.id}
                value={tab.id}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <div className="p-6">
        {tabs.map((tab) => {
          const Component = tab.component;
          return (
            activeTab === tab.id && <Component key={tab.id} />
          );
        })}
      </div>
    </div>
  );
};
