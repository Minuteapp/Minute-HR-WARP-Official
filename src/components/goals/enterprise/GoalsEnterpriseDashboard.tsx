import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, GitBranch, BarChart3, RotateCcw, FileText, Archive } from "lucide-react";
import { ExecutiveOverviewTab } from "./tabs/ExecutiveOverviewTab";
import { GoalHierarchyTab } from "./tabs/GoalHierarchyTab";
import { OKRsKPIsTab } from "./tabs/OKRsKPIsTab";
import { ReviewsAdjustmentsTab } from "./tabs/ReviewsAdjustmentsTab";
import { ReportsExportTab } from "./tabs/ReportsExportTab";
import { ArchiveTab } from "./tabs/ArchiveTab";
import { useEnterprisePermissions } from "@/hooks/useEnterprisePermissions";

export const GoalsEnterpriseDashboard = () => {
  const { hasAction } = useEnterprisePermissions();
  
  // Berechtigungen basierend auf Rolle
  const canViewExecutive = true; // Alle können Übersicht sehen
  const canViewHierarchy = hasAction('goals', 'update') || hasAction('goals', 'approve');
  const canViewOKRs = true; // Alle können OKRs sehen
  const canViewReviews = hasAction('goals', 'update') || hasAction('goals', 'approve');
  const canViewReports = hasAction('goals', 'export') || hasAction('goals', 'approve');
  const canViewArchive = true; // Alle können Archiv sehen

  const getDefaultTab = () => {
    if (canViewExecutive) return 'executive';
    if (canViewOKRs) return 'okrs';
    return 'executive';
  };

  const [activeTab, setActiveTab] = useState(getDefaultTab());

  useEffect(() => {
    const tabPermissions: Record<string, boolean> = {
      'executive': canViewExecutive,
      'hierarchy': canViewHierarchy,
      'okrs': canViewOKRs,
      'reviews': canViewReviews,
      'reports': canViewReports,
      'archive': canViewArchive,
    };
    
    if (!tabPermissions[activeTab]) {
      setActiveTab(getDefaultTab());
    }
  }, [canViewExecutive, canViewHierarchy, canViewOKRs, canViewReviews, canViewReports, canViewArchive, activeTab]);

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-6">
        {/* Header - Pulse Surveys Style */}
        <div className="flex justify-between items-start border-b pb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <Target className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Ziele-Modul (Enterprise)</h1>
              <p className="text-sm text-muted-foreground">
                Strategische Zielsteuerung, OKRs & Zielkaskadierung
              </p>
            </div>
          </div>
        </div>

        {/* Tabs - Underline Style */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
          <TabsList className="bg-transparent border-b w-full justify-start rounded-none h-auto p-0 space-x-6">
            {canViewExecutive && (
              <TabsTrigger 
                value="executive"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
              >
                Übersicht
              </TabsTrigger>
            )}
            {canViewHierarchy && (
              <TabsTrigger 
                value="hierarchy"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
              >
                Zielhierarchie
              </TabsTrigger>
            )}
            {canViewOKRs && (
              <TabsTrigger 
                value="okrs"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
              >
                OKRs & KPIs
              </TabsTrigger>
            )}
            {canViewReviews && (
              <TabsTrigger 
                value="reviews"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
              >
                Reviews
              </TabsTrigger>
            )}
            {canViewReports && (
              <TabsTrigger 
                value="reports"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
              >
                Reports
              </TabsTrigger>
            )}
            {canViewArchive && (
              <TabsTrigger 
                value="archive"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
              >
                Archiv
              </TabsTrigger>
            )}
          </TabsList>

          {canViewExecutive && (
            <TabsContent value="executive" className="mt-6">
              <ExecutiveOverviewTab />
            </TabsContent>
          )}

          {canViewHierarchy && (
            <TabsContent value="hierarchy" className="mt-6">
              <GoalHierarchyTab />
            </TabsContent>
          )}

          {canViewOKRs && (
            <TabsContent value="okrs" className="mt-6">
              <OKRsKPIsTab />
            </TabsContent>
          )}

          {canViewReviews && (
            <TabsContent value="reviews" className="mt-6">
              <ReviewsAdjustmentsTab />
            </TabsContent>
          )}

          {canViewReports && (
            <TabsContent value="reports" className="mt-6">
              <ReportsExportTab />
            </TabsContent>
          )}

          {canViewArchive && (
            <TabsContent value="archive" className="mt-6">
              <ArchiveTab />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};
