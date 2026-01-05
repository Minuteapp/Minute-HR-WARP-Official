import { useState } from 'react';
import { Lightbulb, ChevronDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import InnovationOverviewTab from '@/components/innovation/tabs/InnovationOverviewTab';
import InnovationIdeenpoolTab from '@/components/innovation/tabs/InnovationIdeenpoolTab';
import InnovationBewertungTab from '@/components/innovation/tabs/InnovationBewertungTab';
import InnovationExperimenteTab from '@/components/innovation/tabs/InnovationExperimenteTab';
import InnovationUmsetzungTab from '@/components/innovation/tabs/InnovationUmsetzungTab';
import InnovationPortfolioTab from '@/components/innovation/tabs/InnovationPortfolioTab';
import InnovationKIInsightsTab from '@/components/innovation/tabs/InnovationKIInsightsTab';

import NewIdeaSubmissionDialog from '@/components/innovation/NewIdeaSubmissionDialog';

const Innovation = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [role, setRole] = useState('Administrator');
  const [isNewIdeaDialogOpen, setIsNewIdeaDialogOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        {/* Header */}
        <div className="border-b bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Lightbulb className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Innovation Hub</h1>
                <p className="text-sm text-gray-500">Verwalten Sie Ideen und treiben Sie Innovationen voran</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    {role}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setRole('Administrator')}>Administrator</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setRole('Manager')}>Manager</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setRole('Mitarbeiter')}>Mitarbeiter</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button 
                className="bg-primary hover:bg-primary/90 gap-2"
                onClick={() => setIsNewIdeaDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Neue Idee einreichen
              </Button>
            </div>
          </div>

          {/* Tab Navigation */}
          <TabsList className="mt-4 bg-transparent border-b w-full justify-start rounded-none p-0 h-auto gap-6">
            <TabsTrigger 
              value="overview" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-3 pt-0"
            >
              <div className="flex flex-col items-center">
                <span>Übersicht</span>
                {activeTab === 'overview' && (
                  <span className="text-[10px] text-gray-400 mt-1">Vorschau</span>
                )}
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="ideenpool" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-3 pt-0"
            >
              Ideenpool
            </TabsTrigger>
            <TabsTrigger 
              value="bewertung" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-3 pt-0"
            >
              Bewertung
            </TabsTrigger>
            <TabsTrigger 
              value="experimente" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-3 pt-0"
            >
              Experimente
            </TabsTrigger>
            <TabsTrigger 
              value="umsetzung" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-3 pt-0"
            >
              Umsetzung
            </TabsTrigger>
            <TabsTrigger 
              value="portfolio" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-3 pt-0"
            >
              Portfolio
            </TabsTrigger>
            <TabsTrigger 
              value="ki-insights" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-3 pt-0"
            >
              KI-Insights
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Content - AUSSERHALB des Headers */}
        <div className="px-6 py-6">
          <TabsContent value="overview" className="m-0">
            <InnovationOverviewTab />
          </TabsContent>
          <TabsContent value="ideenpool" className="m-0">
            <InnovationIdeenpoolTab />
          </TabsContent>
          <TabsContent value="bewertung" className="m-0">
            <InnovationBewertungTab />
          </TabsContent>
          <TabsContent value="experimente" className="m-0">
            <InnovationExperimenteTab />
          </TabsContent>
          <TabsContent value="umsetzung" className="m-0">
            <InnovationUmsetzungTab />
          </TabsContent>
          <TabsContent value="portfolio" className="m-0">
            <InnovationPortfolioTab />
          </TabsContent>
          <TabsContent value="ki-insights" className="m-0">
            <InnovationKIInsightsTab />
          </TabsContent>
        </div>
      </Tabs>

      {/* New Idea Dialog */}
      <NewIdeaSubmissionDialog
        open={isNewIdeaDialogOpen}
        onOpenChange={setIsNewIdeaDialogOpen}
      />
    </div>
  );
};

export default Innovation;
