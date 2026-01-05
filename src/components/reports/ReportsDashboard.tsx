import { useState } from 'react';
import { Report } from '@/types/reports';
import { reportService } from '@/services/reportService';
import { useToast } from "@/hooks/use-toast";
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, FileText, PieChart, TrendingUp, BarChart3, Plus, Loader2 } from "lucide-react";
import { useModuleGates } from '@/hooks/useModuleGates';
import { ModuleNotConfigured } from '@/components/ui/module-not-configured';

import ReportStats from './dashboard/ReportStats';
import FinancialOverview from './dashboard/FinancialOverview';
import ReportsList from './dashboard/ReportsList';
import RecentReportList from './dashboard/RecentReportList';
import FavoritedReportsList from './dashboard/FavoritedReportsList';
import RecommendedReportList from './dashboard/RecommendedReportList';

const ReportsDashboard = () => {
  // ZERO-DATA-START: Prüfe ob Modul konfiguriert ist
  const { isReady, isLoading: gatesLoading, missingRequirements, settingsPath, moduleName, moduleDescription } = useModuleGates('reports');

  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: reports = [], isLoading, error, refetch } = useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      try {
        const data = await reportService.getReports();
        return data;
      } catch (error) {
        console.error('Error loading reports:', error);
        toast({
          title: "Fehler beim Laden der Berichte",
          description: "Bitte versuchen Sie es später erneut.",
          variant: "destructive",
        });
        throw error;
      }
    }
  });

  const handleDeleteReport = async (id: string) => {
    try {
      await reportService.deleteReport(id);
      toast({
        title: "Bericht gelöscht",
        description: "Der Bericht wurde erfolgreich gelöscht.",
      });
      refetch();
    } catch (error) {
      console.error('Error deleting report:', error);
      toast({
        title: "Fehler beim Löschen",
        description: "Der Bericht konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    }
  };

  const handleArchiveReport = async (id: string) => {
    try {
      await reportService.archiveReport(id);
      toast({
        title: "Bericht archiviert",
        description: "Der Bericht wurde erfolgreich archiviert.",
      });
      refetch();
    } catch (error) {
      console.error('Error archiving report:', error);
      toast({
        title: "Fehler beim Archivieren",
        description: "Der Bericht konnte nicht archiviert werden.",
        variant: "destructive",
      });
    }
  };

  if (gatesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isReady) {
    return (
      <ModuleNotConfigured
        moduleName={moduleName}
        requiredSettings={missingRequirements}
        settingsPath={settingsPath}
        description={moduleDescription}
      />
    );
  }

  if (error) {
    return <div className="flex items-center justify-center h-64">Fehler beim Laden der Berichte</div>;
  }

  const activeReportsCount = reports.filter(r => 
    r.status === 'draft' || r.status === 'pending'
  ).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start border-b pb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Berichte</h1>
              <p className="text-sm text-muted-foreground">Erstellen und verwalten Sie Ihre Berichte</p>
            </div>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Neuer Bericht
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="flex flex-col space-y-1">
                <CardTitle className="text-sm font-medium">Alle Berichte</CardTitle>
              </div>
              <FileText className="w-4 h-4 text-muted-foreground ml-auto" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reports.length}</div>
              <p className="text-xs text-muted-foreground">
                {activeReportsCount} aktiv
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="flex flex-col space-y-1">
                <CardTitle className="text-sm font-medium">Zeitraum</CardTitle>
              </div>
              <CalendarDays className="w-4 h-4 text-muted-foreground ml-auto" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">30 Tage</div>
              <p className="text-xs text-muted-foreground">
                Letzter Monat
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="flex flex-col space-y-1">
                <CardTitle className="text-sm font-medium">Häufigster Berichtstyp</CardTitle>
              </div>
              <PieChart className="w-4 h-4 text-muted-foreground ml-auto" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Projekt</div>
              <p className="text-xs text-muted-foreground">
                42% aller Berichte
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="flex flex-col space-y-1">
                <CardTitle className="text-sm font-medium">Nutzungstrend</CardTitle>
              </div>
              <TrendingUp className="w-4 h-4 text-muted-foreground ml-auto" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+24%</div>
              <p className="text-xs text-muted-foreground">
                Im Vergleich zum Vormonat
              </p>
            </CardContent>
          </Card>
        </div>

        <ReportStats reports={reports} />
        
        <div className="grid gap-6 md:grid-cols-2">
          <FinancialOverview />
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Berichtsübersicht</CardTitle>
              <CardDescription>
                Verwalten Sie Ihre Berichte
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="all">
                <div className="px-6">
                  <TabsList className="bg-transparent border-b w-full justify-start rounded-none h-auto p-0 space-x-6">
                    <TabsTrigger 
                      value="all"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
                    >
                      Alle
                    </TabsTrigger>
                    <TabsTrigger 
                      value="recent"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
                    >
                      Zuletzt
                    </TabsTrigger>
                    <TabsTrigger 
                      value="favorite"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
                    >
                      Favoriten
                    </TabsTrigger>
                    <TabsTrigger 
                      value="recommended"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
                    >
                      Empfohlen
                    </TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="all" className="m-0">
                  <ReportsList
                    reports={reports}
                    selectedReport={selectedReport}
                    onReportSelect={setSelectedReport}
                    onArchive={handleArchiveReport}
                    onDelete={handleDeleteReport}
                    onUploadComplete={() => refetch()}
                    isLoading={isLoading}
                  />
                </TabsContent>
                <TabsContent value="recent" className="m-0">
                  <RecentReportList 
                    reports={reports}
                    isLoading={isLoading}
                    onArchive={handleArchiveReport}
                    onDelete={handleDeleteReport}
                  />
                </TabsContent>
                <TabsContent value="favorite" className="m-0">
                  <FavoritedReportsList 
                    reports={reports.filter(report => report.metadata?.favorited)}
                    isLoading={isLoading}
                    onArchive={handleArchiveReport}
                    onDelete={handleDeleteReport}
                  />
                </TabsContent>
                <TabsContent value="recommended" className="m-0">
                  <RecommendedReportList />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReportsDashboard;