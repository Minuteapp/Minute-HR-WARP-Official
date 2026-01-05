import { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Shield, 
  Workflow, 
  DollarSign, 
  Calculator, 
  Globe, 
  Plug, 
  Leaf, 
  MapPin, 
  Bell, 
  Users, 
  BarChart3,
  Settings,
  Plane
} from "lucide-react";
import GeneralProfilesTab from "./tabs/GeneralProfilesTab";
import TravelPoliciesTab from "./tabs/TravelPoliciesTab";
import ApprovalWorkflowsTab from "./tabs/ApprovalWorkflowsTab";
import BudgetControlTab from "./tabs/BudgetControlTab";
import PerDiemsRulesTab from "./tabs/PerDiemsRulesTab";
import VisaPassportsTab from "./tabs/VisaPassportsTab";
import ProvidersIntegrationsTab from "./tabs/ProvidersIntegrationsTab";
import SustainabilityESGTab from "./tabs/SustainabilityESGTab";
import SecurityLocationTab from "./tabs/SecurityLocationTab";
import NotificationsTab from "./tabs/NotificationsTab";
import RolesVisibilityTab from "./tabs/RolesVisibilityTab";
import ReportingAuditTab from "./tabs/ReportingAuditTab";

const businessTravelTabs = [
  {
    id: "general",
    label: "Allgemein & Profile",
    icon: User,
    description: "Reisearten, Profile und Grundkonfiguration",
    component: GeneralProfilesTab
  },
  {
    id: "policies",
    label: "Reiserichtlinien",
    icon: Shield,
    description: "Policy Engine für Transportmittel, Hotels und Ausnahmen",
    component: TravelPoliciesTab
  },
  {
    id: "workflows",
    label: "Genehmigungsworkflows",
    icon: Workflow,
    description: "Mehrstufige Freigaben und Vertretungslogik",
    component: ApprovalWorkflowsTab
  },
  {
    id: "budget",
    label: "Budgets & Kostensteuerung",
    icon: DollarSign,
    description: "Budget-Management und Spend Controls",
    component: BudgetControlTab
  },
  {
    id: "perdiem",
    label: "Tagegelder & Spesen",
    icon: Calculator,
    description: "Per-Diem Regelungen und Kilometerpauschalen",
    component: PerDiemsRulesTab
  },
  {
    id: "visa",
    label: "Visa & Duty of Care",
    icon: Globe,
    description: "Reisedokumente und Sicherheitsmanagement",
    component: VisaPassportsTab
  },
  {
    id: "providers",
    label: "Anbieter & Integrationen",
    icon: Plug,
    description: "Buchungssysteme und externe APIs",
    component: ProvidersIntegrationsTab
  },
  {
    id: "sustainability",
    label: "Nachhaltigkeit (ESG)",
    icon: Leaf,
    description: "CO₂-Budgets und Nachhaltigkeitsrichtlinien",
    component: SustainabilityESGTab
  },
  {
    id: "security",
    label: "Sicherheit & Standort",
    icon: MapPin,
    description: "Geofencing und Duty of Care",
    component: SecurityLocationTab
  },
  {
    id: "notifications",
    label: "Benachrichtigungen",
    icon: Bell,
    description: "Ereignisse und Kommunikationskanäle",
    component: NotificationsTab
  },
  {
    id: "roles",
    label: "Rollen & Sichtbarkeit",
    icon: Users,
    description: "RBAC und Datenschutz-Konfiguration",
    component: RolesVisibilityTab
  },
  {
    id: "reporting",
    label: "Reporting & Audit",
    icon: BarChart3,
    description: "Berichte, Dashboards und Audit-Logs",
    component: ReportingAuditTab
  }
];

export default function BusinessTravelSettingsPage() {
  const [activeTab, setActiveTab] = useState("general");

  const currentTabInfo = businessTravelTabs.find(tab => tab.id === activeTab);

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-sky-500 text-white">
              <Plane className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Geschäftsreisen-Einstellungen</h1>
              <p className="text-muted-foreground mt-1">
                Zentrale Konfiguration für Reiserichtlinien und Policy-Engine
              </p>
            </div>
          </div>

          {currentTabInfo && (
            <Card className="border-l-4 border-l-sky-500">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <currentTabInfo.icon className="h-5 w-5 text-sky-600" />
                  <div>
                    <h3 className="font-semibold text-lg">{currentTabInfo.label}</h3>
                    <p className="text-muted-foreground text-sm">{currentTabInfo.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-6 xl:grid-cols-12 h-auto p-1">
            {businessTravelTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id} 
                  className="flex flex-col gap-1 h-16 text-xs"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:block">{tab.label.split(' ')[0]}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {businessTravelTabs.map((tab) => {
            const TabComponent = tab.component;
            return (
              <TabsContent key={tab.id} value={tab.id} className="mt-6">
                <TabComponent />
              </TabsContent>
            );
          })}
        </Tabs>

        {/* Policy Engine Integration Notice */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Settings className="h-5 w-5" />
              Policy Engine Integration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-700 text-sm">
              Alle hier konfigurierten Einstellungen werden über die zentrale Policy/Rule-Engine 
              systemweit in den Modulen Geschäftsreisen, Ausgaben, Kalender, Zeiterfassung, 
              Lohn & Gehalt, Dokumente, Compliance/ESG und Kommunikation durchgesetzt.
            </p>
            <div className="flex gap-2 mt-3">
              <Badge variant="secondary" className="text-xs">Real-time Enforcement</Badge>
              <Badge variant="secondary" className="text-xs">Cross-Module Integration</Badge>
              <Badge variant="secondary" className="text-xs">Audit Trail</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}