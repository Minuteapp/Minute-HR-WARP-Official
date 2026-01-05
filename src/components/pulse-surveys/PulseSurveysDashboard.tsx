import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ClipboardList,
  Shield
} from "lucide-react";
import { NewOverviewTab } from "./tabs/NewOverviewTab";
import { SurveysListTab } from "./tabs/SurveysListTab";
import { QuestionsTemplatesTab } from "./tabs/QuestionsTemplatesTab";
import { ParticipationAnonymityTab } from "./tabs/ParticipationAnonymityTab";
import { AnalysisInsightsTab } from "./tabs/AnalysisInsightsTab";
import { ActionsFollowupsTab } from "./tabs/ActionsFollowupsTab";
import { PulseContinuousTab } from "./tabs/PulseContinuousTab";
import { ArchiveBenchmarksTab } from "./tabs/ArchiveBenchmarksTab";
import { SurveySettingsTab } from "./tabs/SurveySettingsTab";
import { SurveyDetailView } from "./views/SurveyDetailView";
import { SurveyResponsesView } from "./views/SurveyResponsesView";
import { EmployeeSurveyView } from "./employee/EmployeeSurveyView";
import { TeamleadSurveyDashboard } from "./views/TeamleadSurveyDashboard";
import { usePulseSurveyPermissions, getRoleLabel, getRoleColor, type PulseSurveyRole } from "./hooks/usePulseSurveyPermissions";
import { useEffectiveRole } from "@/hooks/useEffectiveRole";
import { useOriginalRole } from "@/hooks/useOriginalRole";

export interface Survey {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'planned' | 'completed' | 'draft';
  isAnonymous: boolean;
  startDate: string;
  endDate: string;
  targetGroup: string;
  totalParticipants: number;
  completedResponses: number;
  lastActivity: string;
  description?: string;
  questions?: SurveyQuestion[];
}

export interface SurveyQuestion {
  id: string;
  text: string;
  category: string;
  type: 'likert' | 'text' | 'multiple' | 'single';
}

const TAB_LABELS: Record<string, string> = {
  overview: 'Übersicht',
  surveys: 'Umfragen',
  questions: 'Fragen & Vorlagen',
  participation: 'Teilnahme & Anonymität',
  analysis: 'Auswertung & Insights',
  actions: 'Maßnahmen & Follow-ups',
  pulse: 'Pulse & Continuous',
  archive: 'Archiv & Benchmarks',
  settings: 'Einstellungen'
};

// Role Switcher Komponente
interface RoleSwitcherProps {
  activeRole: PulseSurveyRole;
  onRoleChange: (role: PulseSurveyRole) => void;
}

const RoleSwitcher = ({ activeRole, onRoleChange }: RoleSwitcherProps) => {
  const roles: PulseSurveyRole[] = ['admin', 'hr', 'teamlead', 'employee'];
  
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 text-sm text-muted-foreground mr-2">
        <Shield className="h-4 w-4" />
        <span>Ansicht:</span>
      </div>
      {roles.map((role) => (
        <Button 
          key={role}
          size="sm" 
          variant={activeRole === role ? 'default' : 'outline'}
          className={activeRole === role ? getRoleColor(role) : ''}
          onClick={() => onRoleChange(role)}
        >
          {getRoleLabel(role)}
        </Button>
      ))}
    </div>
  );
};

export const PulseSurveysDashboard = () => {
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail' | 'responses'>('list');
  
  // Ermittle die effektive Rolle aus dem System (berücksichtigt Impersonation)
  const { role: effectiveModuleRole, loading: roleLoading } = useEffectiveRole();
  const { isOriginalSuperAdmin } = useOriginalRole();
  
  // Nur SuperAdmins können die Rolle manuell überschreiben (für Testzwecke)
  const [manualRoleOverride, setManualRoleOverride] = useState<PulseSurveyRole | null>(null);
  
  // Die aktive Ansichtsrolle: manuelle Überschreibung (nur für SuperAdmins) oder effektive Rolle
  const activeViewRole = useMemo((): PulseSurveyRole => {
    if (isOriginalSuperAdmin && manualRoleOverride) {
      return manualRoleOverride;
    }
    return effectiveModuleRole as PulseSurveyRole;
  }, [isOriginalSuperAdmin, manualRoleOverride, effectiveModuleRole]);
  
  const permissions = usePulseSurveyPermissions(activeViewRole);
  const { visibleTabs } = permissions;
  
  if (roleLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-muted-foreground">Lädt...</div>
      </div>
    );
  }

  // Handler-Funktionen (vor den bedingten Returns definieren)
  const handleViewSurvey = (survey: Survey) => {
    setSelectedSurvey(survey);
    setViewMode('detail');
  };

  const handleViewResponses = (survey: Survey) => {
    setSelectedSurvey(survey);
    setViewMode('responses');
  };

  const handleBackToList = () => {
    setSelectedSurvey(null);
    setViewMode('list');
  };

  const handleBackToDetail = () => {
    setViewMode('detail');
  };

  // Mitarbeiter-Ansicht: Komplett andere UI
  if (activeViewRole === 'employee') {
    return (
      <div className="space-y-6 bg-white min-h-screen">
        {/* Role Switcher Header */}
        <div className="flex justify-between items-start border-b pb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
              <ClipboardList className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Mitarbeiterumfragen</h1>
              <p className="text-sm text-muted-foreground">
                Employee Feedback & Organizational Listening
              </p>
            </div>
          </div>
          
          {/* RoleSwitcher nur für SuperAdmins sichtbar */}
          {isOriginalSuperAdmin && (
            <RoleSwitcher activeRole={activeViewRole} onRoleChange={setManualRoleOverride} />
          )}
        </div>

        <EmployeeSurveyView />
      </div>
    );
  }

  // Teamleiter-Ansicht: Eingeschränkte Tabs mit Team-Fokus
  if (activeViewRole === 'teamlead') {
    return (
      <div className="space-y-6 bg-white min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-start border-b pb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
              <ClipboardList className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold">Mitarbeiterumfragen</h1>
                <Badge variant="outline" className="text-xs">Vorschau</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Employee Feedback & Organizational Listening
              </p>
            </div>
          </div>
          
          {/* RoleSwitcher nur für SuperAdmins sichtbar */}
          {isOriginalSuperAdmin && (
            <RoleSwitcher activeRole={activeViewRole} onRoleChange={setManualRoleOverride} />
          )}
        </div>

        <Tabs defaultValue="overview" className="w-full space-y-6">
          <TabsList className="bg-transparent border-b w-full justify-start rounded-none h-auto p-0 space-x-6">
            {visibleTabs.map((tab) => (
              <TabsTrigger 
                key={tab}
                value={tab} 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
              >
                {TAB_LABELS[tab]}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <TeamleadSurveyDashboard />
          </TabsContent>

          <TabsContent value="surveys" className="mt-6">
            <SurveysListTab onViewSurvey={handleViewSurvey} />
          </TabsContent>

          <TabsContent value="participation" className="mt-6">
            <ParticipationAnonymityTab />
          </TabsContent>

          <TabsContent value="analysis" className="mt-6">
            <AnalysisInsightsTab />
          </TabsContent>

          <TabsContent value="actions" className="mt-6">
            <ActionsFollowupsTab />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // Admin/HR-Ansicht: Voller Zugriff
  return (
    <div className="space-y-6 bg-white min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-start border-b pb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
            <ClipboardList className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold">Mitarbeiterumfragen</h1>
              <Badge variant="outline" className="text-xs">Vorschau</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Employee Feedback & Organizational Listening
            </p>
          </div>
        </div>
        
        {/* RoleSwitcher nur für SuperAdmins sichtbar */}
        {isOriginalSuperAdmin && (
          <RoleSwitcher activeRole={activeViewRole} onRoleChange={setManualRoleOverride} />
        )}
      </div>

      <Tabs defaultValue="overview" className="w-full space-y-6">
        <TabsList className="bg-transparent border-b w-full justify-start rounded-none h-auto p-0 space-x-6">
          {visibleTabs.map((tab) => (
            <TabsTrigger 
              key={tab}
              value={tab} 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
            >
              {TAB_LABELS[tab]}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <NewOverviewTab />
        </TabsContent>

        <TabsContent value="surveys" className="mt-6">
          {viewMode === 'list' && (
            <SurveysListTab onViewSurvey={handleViewSurvey} />
          )}
          {viewMode === 'detail' && selectedSurvey && (
            <SurveyDetailView 
              survey={selectedSurvey}
              onBack={handleBackToList}
              onViewResponses={() => handleViewResponses(selectedSurvey)}
            />
          )}
          {viewMode === 'responses' && selectedSurvey && (
            <SurveyResponsesView 
              survey={selectedSurvey}
              onBack={handleBackToDetail}
            />
          )}
        </TabsContent>

        <TabsContent value="questions" className="mt-6">
          <QuestionsTemplatesTab />
        </TabsContent>

        <TabsContent value="participation" className="mt-6">
          <ParticipationAnonymityTab />
        </TabsContent>

        <TabsContent value="analysis" className="mt-6">
          <AnalysisInsightsTab />
        </TabsContent>

        <TabsContent value="actions" className="mt-6">
          <ActionsFollowupsTab />
        </TabsContent>

        <TabsContent value="pulse" className="mt-6">
          <PulseContinuousTab />
        </TabsContent>

        <TabsContent value="archive" className="mt-6">
          <ArchiveBenchmarksTab />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <SurveySettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};
