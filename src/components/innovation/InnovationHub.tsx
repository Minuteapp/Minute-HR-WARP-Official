import React, { useState } from 'react';
import { 
  Lightbulb, 
  Eye, 
  Upload, 
  Star, 
  Kanban,
  BarChart3,
  Inbox
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InnovationDashboard } from './pages/InnovationDashboard';
import { InnovationVisualization } from './pages/InnovationVisualization';
import { IdeaSubmission } from './pages/IdeaSubmission';
import { AIRating } from './pages/AIRating';
import { ProjectManagement } from './pages/ProjectManagement';
import { InnovationAnalytics } from './pages/InnovationAnalytics';
import { InnovationInbox } from './inbox/InnovationInbox';

export const InnovationHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState('inbox');

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
              <p className="text-sm text-muted-foreground">Ideen einreichen, bewerten und umsetzen</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-transparent border-b w-full justify-start rounded-none h-auto p-0 space-x-6">
            <TabsTrigger 
              value="inbox"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3 flex items-center gap-2"
            >
              <Inbox className="h-4 w-4" />
              Posteingang
            </TabsTrigger>
            <TabsTrigger 
              value="dashboard"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3 flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger 
              value="visualization"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3 flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Visualisierung
            </TabsTrigger>
            <TabsTrigger 
              value="submission"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3 flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Idee einreichen
            </TabsTrigger>
            <TabsTrigger 
              value="rating"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3 flex items-center gap-2"
            >
              <Star className="h-4 w-4" />
              KI-Bewertung
            </TabsTrigger>
            <TabsTrigger 
              value="projects"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3 flex items-center gap-2"
            >
              <Kanban className="h-4 w-4" />
              Projekte
            </TabsTrigger>
            <TabsTrigger 
              value="analytics"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3 flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inbox" className="mt-6">
            <InnovationInbox />
          </TabsContent>

          <TabsContent value="dashboard" className="mt-6">
            <InnovationDashboard onNavigate={(page) => setActiveTab(page)} />
          </TabsContent>

          <TabsContent value="visualization" className="mt-6">
            <InnovationVisualization />
          </TabsContent>

          <TabsContent value="submission" className="mt-6">
            <IdeaSubmission onNavigate={(page) => setActiveTab(page)} />
          </TabsContent>

          <TabsContent value="rating" className="mt-6">
            <AIRating />
          </TabsContent>

          <TabsContent value="projects" className="mt-6">
            <ProjectManagement />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <InnovationAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
