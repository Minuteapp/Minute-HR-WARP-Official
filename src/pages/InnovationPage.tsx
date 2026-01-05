import React, { useState, useEffect } from 'react';
import { useInnovationData } from '@/hooks/useInnovationData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Plus, Lightbulb, Target, Brain, Users, Settings, 
  BarChart3, FlaskConical, Rocket, Briefcase, Sparkles,
  Bell, Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { CreateIdeaDialog } from '@/components/innovation/forms/CreateIdeaDialog';
import { IdeaDetailsModal } from '@/components/innovation/IdeaDetailsModal';
import { supabase } from '@/integrations/supabase/client';

// Tab-Komponenten importieren
import InnovationOverviewTab from '@/components/innovation/tabs/InnovationOverviewTab';
import InnovationIdeenpoolTab from '@/components/innovation/tabs/InnovationIdeenpoolTab';
import InnovationBewertungTab from '@/components/innovation/tabs/InnovationBewertungTab';
import InnovationExperimenteTab from '@/components/innovation/tabs/InnovationExperimenteTab';
import InnovationUmsetzungTab from '@/components/innovation/tabs/InnovationUmsetzungTab';
import InnovationPortfolioTab from '@/components/innovation/tabs/InnovationPortfolioTab';
import InnovationKIInsightsTab from '@/components/innovation/tabs/InnovationKIInsightsTab';


const InnovationPage = () => {
  const { ideas, loading, stats, createIdea, voteOnIdea } = useInnovationData();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedIdea, setSelectedIdea] = useState(null);

  // Real-time Updates für neue Ideen
  useEffect(() => {
    const channel = supabase
      .channel('innovation-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'innovation_ideas'
        },
        (payload) => {
          console.log('Real-time update:', payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start border-b pb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
              <Lightbulb className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Innovation Hub</h1>
              <p className="text-sm text-muted-foreground">Ideen sammeln, bewerten und gemeinsam umsetzen</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Suchen..." 
                className="pl-9 w-64"
              />
            </div>
            <Button variant="outline" size="icon">
              <Sparkles className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
            <CreateIdeaDialog />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Tab Navigation */}
          <TabsList className="bg-transparent border-b w-full justify-start rounded-none h-auto p-0 space-x-6">
            <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3">Übersicht</TabsTrigger>
            <TabsTrigger value="ideenpool" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3">Ideenpool</TabsTrigger>
            <TabsTrigger value="bewertung" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3">Bewertung</TabsTrigger>
            <TabsTrigger value="experimente" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3">Experimente</TabsTrigger>
            <TabsTrigger value="umsetzung" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3">Umsetzung</TabsTrigger>
            <TabsTrigger value="portfolio" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3">Portfolio</TabsTrigger>
            <TabsTrigger value="ki-insights" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3">KI-Insights</TabsTrigger>
          </TabsList>

          {/* Tab Contents */}
          <TabsContent value="overview" className="mt-6">
            <InnovationOverviewTab />
          </TabsContent>

          <TabsContent value="ideenpool" className="mt-6">
            <InnovationIdeenpoolTab />
          </TabsContent>

          <TabsContent value="bewertung" className="mt-6">
            <InnovationBewertungTab />
          </TabsContent>

          <TabsContent value="experimente" className="mt-6">
            <InnovationExperimenteTab />
          </TabsContent>

          <TabsContent value="umsetzung" className="mt-6">
            <InnovationUmsetzungTab />
          </TabsContent>

          <TabsContent value="portfolio" className="mt-6">
            <InnovationPortfolioTab />
          </TabsContent>

          <TabsContent value="ki-insights" className="mt-6">
            <InnovationKIInsightsTab />
          </TabsContent>
        </Tabs>

        {/* Ideen-Details Modal */}
        {selectedIdea && (
          <IdeaDetailsModal
            idea={selectedIdea}
            open={!!selectedIdea}
            onClose={() => setSelectedIdea(null)}
          />
        )}
      </div>
    </div>
  );
};

export default InnovationPage;
