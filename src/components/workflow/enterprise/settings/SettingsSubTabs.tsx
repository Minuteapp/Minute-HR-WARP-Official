import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Shield, Sparkles, Plug, Gauge, Lock } from 'lucide-react';

interface SettingsSubTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const SettingsSubTabs = ({ activeTab, onTabChange }: SettingsSubTabsProps) => {
  const tabs = [
    { value: 'permissions', label: 'Berechtigungen', icon: Users },
    { value: 'security', label: 'Sicherheit', icon: Shield },
    { value: 'ai', label: 'KI-Einstellungen', icon: Sparkles },
    { value: 'integrations', label: 'Integrationen', icon: Plug },
    { value: 'performance', label: 'Performance', icon: Gauge },
    { value: 'privacy', label: 'Datenschutz', icon: Lock },
  ];

  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <TabsList className="h-auto flex-wrap gap-1 bg-transparent p-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5"
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
};
