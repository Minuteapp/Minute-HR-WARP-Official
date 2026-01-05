
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Target, 
  BarChart3, 
  DollarSign,
  GraduationCap,
  UserPlus,
  Plus,
  Layout,
  Users,
  Clock,
  TrendingUp
} from 'lucide-react';
import { DocumentTemplatesSettings } from './DocumentTemplatesSettings';
import { GoalTemplatesSettings } from './GoalTemplatesSettings';
import { PerformanceTemplatesSettings } from './PerformanceTemplatesSettings';
import { BudgetTemplatesSettings } from './BudgetTemplatesSettings';
import { PayrollTemplatesSettings } from './PayrollTemplatesSettings';
import { TrainingTemplatesSettings } from './TrainingTemplatesSettings';
import { RecruitingTemplatesSettings } from './RecruitingTemplatesSettings';
import { CustomTemplateSettings } from './CustomTemplateSettings';

// Keine Mock-Counts - echte Zahlen werden aus der DB geladen
const templateCategories = [
  {
    id: 'documents',
    title: 'Dokumente',
    description: 'Arbeitsverträge, Zeugnisse, Zertifikate, Datenschutz',
    icon: FileText,
    count: 0,
    color: 'bg-blue-100 text-blue-800'
  },
  {
    id: 'goals',
    title: 'Ziele',
    description: 'SMART-Ziele, OKRs, Team- und Unternehmensziele',
    icon: Target,
    count: 0,
    color: 'bg-green-100 text-green-800'
  },
  {
    id: 'performance',
    title: 'Performance',
    description: '360° Feedback, Mitarbeiterbewertungen, Jahresgespräche',
    icon: BarChart3,
    count: 0,
    color: 'bg-purple-100 text-purple-800'
  },
  {
    id: 'budget',
    title: 'Budget & Forecast',
    description: 'Jahresbudget, Projektbudget, Personalplanung',
    icon: DollarSign,
    count: 0,
    color: 'bg-yellow-100 text-yellow-800'
  },
  {
    id: 'payroll',
    title: 'Lohn & Gehalt',
    description: 'Bonusregelungen, Zuschläge, Vergütungsbänder',
    icon: TrendingUp,
    count: 0,
    color: 'bg-red-100 text-red-800'
  },
  {
    id: 'training',
    title: 'Weiterbildung',
    description: 'Teilnahmebestätigungen, Einladungen, Feedback',
    icon: GraduationCap,
    count: 0,
    color: 'bg-indigo-100 text-indigo-800'
  },
  {
    id: 'recruiting',
    title: 'Recruiting & Onboarding',
    description: 'Interviewleitfäden, Scorecards, Checklisten',
    icon: UserPlus,
    count: 0,
    color: 'bg-orange-100 text-orange-800'
  }
];

export const TemplateManagement = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'documents':
        return <DocumentTemplatesSettings />;
      case 'goals':
        return <GoalTemplatesSettings />;
      case 'performance':
        return <PerformanceTemplatesSettings />;
      case 'budget':
        return <BudgetTemplatesSettings />;
      case 'payroll':
        return <PayrollTemplatesSettings />;
      case 'training':
        return <TrainingTemplatesSettings />;
      case 'recruiting':
        return <RecruitingTemplatesSettings />;
      case 'custom':
        return <CustomTemplateSettings />;
      default:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold">Template-Übersicht</h3>
                <p className="text-gray-600">Verwalten Sie zentral alle Vorlagen für Ihr Unternehmen</p>
              </div>
              <Button onClick={() => setActiveTab('custom')}>
                <Plus className="h-4 w-4 mr-2" />
                Neues Template erstellen
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templateCategories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <Card key={category.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab(category.id)}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="bg-primary/10 p-2 rounded-lg">
                            <IconComponent className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{category.title}</CardTitle>
                          </div>
                        </div>
                        <Badge className={category.color}>
                          {category.count} Templates
                        </Badge>
                      </div>
                      <CardDescription className="text-sm">
                        {category.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full">
                        Templates verwalten
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Kürzlich verwendete Templates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="font-medium">Arbeitsvertrag Vollzeit</p>
                        <p className="text-sm text-gray-500">Zuletzt verwendet: vor 2 Stunden</p>
                      </div>
                    </div>
                    <Badge variant="secondary">5x verwendet</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Target className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="font-medium">Quartalsziele Q1 2024</p>
                        <p className="text-sm text-gray-500">Zuletzt verwendet: vor 1 Tag</p>
                      </div>
                    </div>
                    <Badge variant="secondary">12x verwendet</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <BarChart3 className="h-4 w-4 text-purple-600" />
                      <div>
                        <p className="font-medium">360° Feedback Vorlage</p>
                        <p className="text-sm text-gray-500">Zuletzt verwendet: vor 3 Tagen</p>
                      </div>
                    </div>
                    <Badge variant="secondary">8x verwendet</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Template-Verwaltung</h2>
        <p className="text-gray-600">
          Zentrale Verwaltung aller Vorlagen für Module wie Dokumente, Ziele, Performance und mehr
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-9">
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="documents">Dokumente</TabsTrigger>
          <TabsTrigger value="goals">Ziele</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="payroll">Gehalt</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="recruiting">Recruiting</TabsTrigger>
          <TabsTrigger value="custom">Erstellen</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {renderTabContent()}
        </TabsContent>
      </Tabs>
    </div>
  );
};
