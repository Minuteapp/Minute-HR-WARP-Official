
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentTemplatesTab } from './tabs/DocumentTemplatesTab';
import { GoalTemplatesTab } from './tabs/GoalTemplatesTab';
import { PerformanceTemplatesTab } from './tabs/PerformanceTemplatesTab';
import { RecruitingTemplatesTab } from './tabs/RecruitingTemplatesTab';
import { PayrollTemplatesTab } from './tabs/PayrollTemplatesTab';
import { TrainingTemplatesTab } from './tabs/TrainingTemplatesTab';
import { BudgetTemplatesTab } from './tabs/BudgetTemplatesTab';
import { CustomTemplatesTab } from './tabs/CustomTemplatesTab';
import { TemplateStatistics } from './TemplateStatistics';
import { TemplateSearchAndFilter } from './TemplateSearchAndFilter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Target, BarChart3, UserPlus, DollarSign, GraduationCap, TrendingUp, Upload } from 'lucide-react';

export const TemplateManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('documents');

  const templateTabs = [
    {
      id: 'documents',
      label: 'Dokumente',
      icon: FileText,
      component: DocumentTemplatesTab,
      description: 'Dokumentenvorlagen für alle Bereiche'
    },
    {
      id: 'goals',
      label: 'Ziele',
      icon: Target,
      component: GoalTemplatesTab,
      description: 'Zielvorlagen für Performance Management'
    },
    {
      id: 'performance',
      label: 'Performance',
      icon: BarChart3,
      component: PerformanceTemplatesTab,
      description: 'Bewertungsvorlagen und Feedback-Templates'
    },
    {
      id: 'recruiting',
      label: 'Recruiting & Onboarding',
      icon: UserPlus,
      component: RecruitingTemplatesTab,
      description: 'Vorlagen für Rekrutierung und Einarbeitung'
    },
    {
      id: 'payroll',
      label: 'Lohn & Gehalt',
      icon: DollarSign,
      component: PayrollTemplatesTab,
      description: 'Gehaltsabrechnungs- und Vertragsvorlagen'
    },
    {
      id: 'training',
      label: 'Weiterbildung',
      icon: GraduationCap,
      component: TrainingTemplatesTab,
      description: 'Schulungsvorlagen und Zertifikate'
    },
    {
      id: 'budget',
      label: 'Budget & Forecast',
      icon: TrendingUp,
      component: BudgetTemplatesTab,
      description: 'Budget- und Planungsvorlagen'
    },
    {
      id: 'custom',
      label: 'Eigene Templates',
      icon: Upload,
      component: CustomTemplatesTab,
      description: 'Hochgeladene und benutzerdefinierte Vorlagen'
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Template Management</CardTitle>
          <CardDescription>
            Zentrale Verwaltung von Vorlagen für alle Module der HR-Plattform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TemplateSearchAndFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </CardContent>
      </Card>

      <TemplateStatistics />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 lg:grid-cols-8 w-full">
          {templateTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id}
                className="flex flex-col gap-1 p-3 h-auto"
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs">{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {templateTabs.map((tab) => {
          const Component = tab.component;
          return (
            <TabsContent key={tab.id} value={tab.id} className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <tab.icon className="h-5 w-5" />
                    <CardTitle>{tab.label}</CardTitle>
                  </div>
                  <CardDescription>{tab.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Component 
                    searchTerm={searchTerm}
                    selectedCategory={selectedCategory}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};
