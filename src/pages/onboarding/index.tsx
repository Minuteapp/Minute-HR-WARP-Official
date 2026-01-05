import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutGrid, 
  CheckSquare, 
  FileText, 
  Monitor, 
  GraduationCap, 
  Brain,
  Settings,
  BarChart3,
  Clipboard,
  Download,
  CheckCircle,
  Loader2
} from "lucide-react";
import OnboardingOverviewTab from "@/components/onboarding/OnboardingOverviewTab";
import OnboardingChecklistTab from "@/components/onboarding/OnboardingChecklistTab";
import OnboardingDocumentsTab from "@/components/onboarding/OnboardingDocumentsTab";
import OnboardingHardwareTab from "@/components/onboarding/OnboardingHardwareTab";
import { OnboardingTrainingsTab } from "@/components/onboarding/OnboardingTrainingsTab";
import { OnboardingAnalyticsTab } from "@/components/onboarding/OnboardingAnalyticsTab";
import { useEnhancedOnboarding } from "@/hooks/useEnhancedOnboarding";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEnterprisePermissions } from "@/hooks/useEnterprisePermissions";

const OnboardingPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { wikiArticles, loadingWiki } = useEnhancedOnboarding();
  const { hasAction, isEmployee } = useEnterprisePermissions();
  
  // Nur HR/Admin sehen KI-Analytics
  const canViewAnalytics = hasAction('onboarding', 'export') || hasAction('onboarding', 'approve');

  // Dynamische Stats aus der Datenbank laden
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['onboarding-stats'],
    queryFn: async () => {
      // Abteilungen zählen
      const { count: deptCount } = await supabase
        .from('departments')
        .select('*', { count: 'exact', head: true });
      
      // Standorte zählen  
      const { count: locationCount } = await supabase
        .from('company_locations')
        .select('*', { count: 'exact', head: true });
      
      // Onboarding-Prozesse mit Erfolgsrate
      const { data: processes } = await supabase
        .from('onboarding_progress')
        .select('completion_percentage, created_at, updated_at');
      
      const completedCount = processes?.filter(p => p.completion_percentage === 100).length || 0;
      const totalCount = processes?.length || 0;
      const successRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
      
      // Durchschnittliche Dauer berechnen
      let avgDays = 0;
      if (processes && processes.length > 0) {
        const durations = processes
          .filter(p => p.completion_percentage === 100)
          .map(p => {
            const start = new Date(p.created_at);
            const end = new Date(p.updated_at);
            return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
          })
          .filter(d => d > 0 && d < 365);
        
        if (durations.length > 0) {
          avgDays = Math.round((durations.reduce((a, b) => a + b, 0) / durations.length) * 10) / 10;
        }
      }
      
      return {
        departments: deptCount || 0,
        locations: locationCount || 0,
        successRate: successRate,
        avgDays: avgDays || 0
      };
    }
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold">
                {isEmployee ? 'Mein Onboarding' : 'Onboarding'}
              </h1>
              {!isEmployee && (
                <Badge className="bg-violet-600 hover:bg-violet-600 text-white">Enterprise</Badge>
              )}
            </div>
            {/* Header-Buttons nur für HR/Admin */}
            {!isEmployee && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Clipboard className="h-4 w-4 mr-2" />
                  Filter speichern
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" size="sm">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3 mt-2">
            <p className="text-sm text-muted-foreground">
              {isEmployee 
                ? 'Dein persönlicher Onboarding-Fortschritt und Aufgaben'
                : 'Verwalten Sie den Onboarding-Prozess für neue Mitarbeiter'}
            </p>
          </div>
        </div>

        {/* Statistics Bar - Nur für HR/Admin */}
        {!isEmployee && (
          <div className="px-6 py-3 border-t bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                {loadingStats ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Abteilungen:</span>
                      <span className="text-sm font-medium">{stats?.departments || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Standorte:</span>
                      <span className="text-sm font-medium">{stats?.locations || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Ø Erfolgsrate:</span>
                      <span className="text-sm font-medium">{stats?.successRate || 0}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Ø Dauer:</span>
                      <span className="text-sm font-medium">{stats?.avgDays || 0} Tage</span>
                    </div>
                  </>
                )}
              </div>
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                <CheckCircle className="h-3 w-3 mr-1" />
                System läuft optimal
              </Badge>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="px-6 py-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-transparent p-0 gap-1">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md px-4 py-2"
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              Übersicht
            </TabsTrigger>
            <TabsTrigger 
              value="checklist"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md px-4 py-2"
            >
              <CheckSquare className="h-4 w-4 mr-2" />
              Checklisten
            </TabsTrigger>
            <TabsTrigger 
              value="documents"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md px-4 py-2"
            >
              <FileText className="h-4 w-4 mr-2" />
              Dokumente
            </TabsTrigger>
            <TabsTrigger 
              value="hardware"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md px-4 py-2"
            >
              <Monitor className="h-4 w-4 mr-2" />
              Hardware
            </TabsTrigger>
            <TabsTrigger 
              value="training"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md px-4 py-2"
            >
              <GraduationCap className="h-4 w-4 mr-2" />
              Schulungen
            </TabsTrigger>
            {canViewAnalytics && (
              <TabsTrigger 
                value="analytics"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md px-4 py-2"
              >
                <Brain className="h-4 w-4 mr-2" />
                KI-Analytics
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview">
            <OnboardingOverviewTab />
          </TabsContent>
          
          <TabsContent value="checklist">
            <OnboardingChecklistTab />
          </TabsContent>
          
          <TabsContent value="documents">
            <OnboardingDocumentsTab />
          </TabsContent>

          <TabsContent value="hardware">
            <OnboardingHardwareTab />
          </TabsContent>
          
          <TabsContent value="training">
            <OnboardingTrainingsTab />
          </TabsContent>
          
          {canViewAnalytics && (
            <TabsContent value="analytics">
              <OnboardingAnalyticsTab />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default OnboardingPage;