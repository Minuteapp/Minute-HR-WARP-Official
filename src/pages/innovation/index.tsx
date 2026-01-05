
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Lightbulb, 
  Trophy, 
  Target, 
  TrendingUp, 
  Users, 
  Calendar,
  Star,
  Award,
  Brain,
  Rocket,
  Plus,
  ChartBar,
  Search,
  Filter,
  MessageCircle,
  BarChart3,
  Grid,
  Map
} from "lucide-react";
import StandardPageLayout from '@/components/layout/StandardPageLayout';
import { NewIdeaDialog } from '@/components/innovation/NewIdeaDialog';
import { IdeaCard } from '@/components/innovation/IdeaCard';
import { InnovationHeatmap } from '@/components/innovation/InnovationHeatmap';
import ChallengeCard from '@/components/innovation/ChallengeCard';
import LeaderboardTable from '@/components/innovation/LeaderboardTable';
import InnovationAnalytics from '@/components/innovation/InnovationAnalytics';
import { InnovationDashboard } from '@/components/innovation/InnovationDashboard';
import { InnovationWorkflowManager } from '@/components/innovation/InnovationWorkflowManager';
import { useInnovationData } from '@/hooks/useInnovationData';
import { IdeaDetailsModal } from '@/components/innovation/IdeaDetailsModal';
import { SolarSystemVisualization } from '@/components/innovation/visualization/SolarSystemVisualization';
import IdeaSubmissionForm from '@/components/innovation/IdeaSubmissionForm';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEnterprisePermissions } from '@/hooks/useEnterprisePermissions';

const InnovationHub = () => {
  const [showIdeaDialog, setShowIdeaDialog] = useState(false);
  const [activeView, setActiveView] = useState<"grid" | "heatmap" | "3d">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);

  const { ideas, loading, stats: realStats, refetch: loadData } = useInnovationData();
  const { hasAction } = useEnterprisePermissions();
  
  // Nur Admins/Manager sehen Workflows und Analytics
  const canManageInnovation = hasAction('innovation', 'approve') || hasAction('innovation', 'update');

  // Statistiken aus echten Daten berechnen
  const stats = {
    totalIdeas: ideas?.length || 0,
    activeChallenges: 0, // Wird später aus DB geladen
    implementedIdeas: ideas?.filter((i: any) => i.status === 'completed' || i.status === 'implemented')?.length || 0,
    participants: 0 // Wird später aus DB geladen
  };

  // Challenges aus Datenbank laden
  const { data: challenges } = useQuery({
    queryKey: ['innovation-challenges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('innovation_challenges')
        .select('*')
        .eq('status', 'active')
        .order('deadline', { ascending: true });
      if (error) throw error;
      return data || [];
    }
  });

  const activeChallenges = challenges || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Implementiert":
        return "bg-green-500";
      case "In Entwicklung":
        return "bg-blue-500";
      case "In Bewertung":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <StandardPageLayout
      title="Innovation Hub"
      subtitle="Fördern Sie Kreativität und Innovation in Ihrem Unternehmen"
      actions={
        <Button onClick={() => setShowIdeaDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Neue Idee einreichen
        </Button>
      }
    >
      {/* Statistik-Übersicht */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Eingereichte Ideen</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalIdeas}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Lightbulb className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aktive Challenges</p>
                <p className="text-2xl font-bold text-gray-900">{activeChallenges.length}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Implementierte Ideen</p>
                <p className="text-2xl font-bold text-gray-900">{stats.implementedIdeas}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Rocket className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Teilnehmer</p>
                <p className="text-2xl font-bold text-gray-900">{stats.participants}</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="ideas" className="space-y-6">
        <TabsList className={`grid w-full ${canManageInnovation ? 'grid-cols-6' : 'grid-cols-4'}`}>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="ideas">Ideen</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          {canManageInnovation && <TabsTrigger value="workflows">Workflows</TabsTrigger>}
          {canManageInnovation && <TabsTrigger value="analytics">Analytics</TabsTrigger>}
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <InnovationDashboard />
        </TabsContent>

        <TabsContent value="ideas" className="space-y-6">
          {/* Enhanced Ideas View with Filters */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Ideen durchsuchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Status</SelectItem>
                  <SelectItem value="new">Neu</SelectItem>
                  <SelectItem value="in_review">In Prüfung</SelectItem>
                  <SelectItem value="approved">Genehmigt</SelectItem>
                  <SelectItem value="in_progress">In Umsetzung</SelectItem>
                  <SelectItem value="completed">Abgeschlossen</SelectItem>
                </SelectContent>
              </Select>

              <Select value={tagFilter} onValueChange={setTagFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Tags" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Tags</SelectItem>
                  <SelectItem value="Tech">Tech</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="Process">Process</SelectItem>
                  <SelectItem value="ESG">ESG</SelectItem>
                  <SelectItem value="Cost-Saving">Cost-Saving</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button
                variant={activeView === "grid" ? "default" : "outline"}
                onClick={() => setActiveView("grid")}
                size="sm"
              >
                <Grid className="w-4 h-4 mr-2" />
                Grid
              </Button>
              <Button
                variant={activeView === "heatmap" ? "default" : "outline"}
                onClick={() => setActiveView("heatmap")}
                size="sm"
              >
                <Map className="w-4 h-4 mr-2" />
                Heatmap
              </Button>
              <Button
                variant={activeView === "3d" ? "default" : "outline"}
                onClick={() => setActiveView("3d")}
                size="sm"
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                3D Sonnensystem
              </Button>
            </div>
          </div>

          {activeView === "grid" ? (
            ideas && ideas.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ideas.map((idea) => (
                  <IdeaCard key={idea.id} idea={idea} onDelete={loadData} onClick={() => setSelectedIdea(idea)} />
                ))}
              </div>
            ) : (
              <Card className="p-12">
                <div className="text-center">
                  <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Noch keine Ideen vorhanden</h3>
                  <p className="text-muted-foreground mb-4">Reichen Sie die erste Idee ein, um den Innovation Hub zu starten.</p>
                  <Button onClick={() => setShowIdeaDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Erste Idee einreichen
                  </Button>
                </div>
              </Card>
            )
          ) : activeView === "heatmap" ? (
            <InnovationHeatmap ideas={ideas || []} />
          ) : (
            <SolarSystemVisualization
              centralTheme="KI-Innovation"
              ideas={ideas || []}
              onIdeaClick={(idea) => setSelectedIdea(idea)}
              onAddIdea={() => setShowSubmissionForm(true)}
            />
          )}
        </TabsContent>

        <TabsContent value="challenges" className="space-y-6">
          {activeChallenges.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {activeChallenges.map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))}
            </div>
          ) : (
            <Card className="p-12">
              <div className="text-center">
                <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Keine aktiven Challenges</h3>
                <p className="text-muted-foreground">Erstellen Sie eine Challenge, um Mitarbeiter zur Ideeneinreichung zu motivieren.</p>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          <LeaderboardTable />
        </TabsContent>

        {canManageInnovation && (
          <TabsContent value="workflows" className="space-y-6">
            <InnovationWorkflowManager />
          </TabsContent>
        )}

        {canManageInnovation && (
          <TabsContent value="analytics" className="space-y-6">
            <InnovationAnalytics />
          </TabsContent>
        )}
      </Tabs>

      <NewIdeaDialog 
        open={showIdeaDialog} 
        onOpenChange={setShowIdeaDialog} 
      />

      {/* Ideen-Details Modal */}
      {selectedIdea && (
        <IdeaDetailsModal
          idea={selectedIdea}
          open={!!selectedIdea}
          onClose={() => setSelectedIdea(null)}
        />
      )}
    </StandardPageLayout>
  );
};

export default InnovationHub;
