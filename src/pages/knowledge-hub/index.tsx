import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, BookOpen, Brain, Clock, Star, TrendingUp, RefreshCw, MessageSquare, Sparkles, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useKnowledgeArticles } from '@/hooks/useKnowledgeArticles';
import { useKnowledgeHubStats } from '@/hooks/useKnowledgeHubStats';
import { ArticleEditor } from '@/components/knowledge-hub/ArticleEditor';
import { ApprovalQueue } from '@/components/knowledge-hub/ApprovalQueue';
import { AIGovernanceDashboard } from '@/components/knowledge-hub/AIGovernanceDashboard';
import { KnowledgeHubSettings } from '@/components/knowledge-hub/KnowledgeHubSettings';
import { ArticleDetailView } from '@/components/knowledge-hub/ArticleDetailView';
import { ArticleList } from '@/components/knowledge-hub/ArticleList';
import { AIAssistantTab } from '@/components/knowledge-hub/AIAssistantTab';
import { RecentlyViewedTab } from '@/components/knowledge-hub/RecentlyViewedTab';
import { FavoritesTab } from '@/components/knowledge-hub/FavoritesTab';
import { useEnterprisePermissions } from '@/hooks/useEnterprisePermissions';
import { useAuth } from '@/contexts/AuthContext';

const KnowledgeHubPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('knowledge-hub');
  const [activeSubTab, setActiveSubTab] = useState('alle');
  const { articles, pendingApprovals, isLoading } = useKnowledgeArticles();
  const { mostReadTopicsCount, updateRate, openFeedbackCount, isLoading: statsLoading } = useKnowledgeHubStats();
  const { canCreate, canApprove } = useEnterprisePermissions();
  const { user } = useAuth();

  const pendingCount = pendingApprovals.filter((a: any) => a.status === 'pending').length;

  // Filter published articles only for employee view - NO mock data
  const publishedArticles = articles.filter((a: any) => a.status === 'published');

  if (showEditor) {
    return <ArticleEditor />;
  }

  if (selectedArticle) {
    return <ArticleDetailView article={selectedArticle} onClose={() => setSelectedArticle(null)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start border-b pb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Wissensdatenbank</h1>
              <p className="text-sm text-muted-foreground">Unternehmenswissen und KI-Governance verwalten</p>
            </div>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-transparent border-b w-full justify-start rounded-none h-auto p-0 space-x-6">
            <TabsTrigger 
              value="knowledge-hub"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
            >
              Knowledge Hub
            </TabsTrigger>
            {canApprove('knowledge-hub') && (
              <TabsTrigger 
                value="freigaben"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3 flex items-center gap-2"
              >
                Freigaben
                {pendingCount > 0 && (
                  <span className="ml-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {pendingCount}
                  </span>
                )}
              </TabsTrigger>
            )}
            {canApprove('knowledge-hub') && (
              <TabsTrigger 
                value="ai-governance"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
              >
                AI Governance
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="knowledge-hub" className="mt-6 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-card rounded-lg border p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Artikel gesamt</p>
                  <BookOpen className="h-5 w-5 text-blue-500" />
                </div>
                <p className="text-2xl font-bold">{publishedArticles.length}</p>
              </div>
              <div className="bg-card rounded-lg border p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Meistgelesene Themen</p>
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <p className="text-2xl font-bold">
                  {statsLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : mostReadTopicsCount}
                </p>
              </div>
              <div className="bg-card rounded-lg border p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Aktualisierungsquote</p>
                  <RefreshCw className="h-5 w-5 text-purple-500" />
                </div>
                <p className="text-2xl font-bold">
                  {statsLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : `${updateRate}%`}
                </p>
              </div>
              <div className="bg-card rounded-lg border p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Offene Feedbacks</p>
                  <MessageSquare className="h-5 w-5 text-orange-500" />
                </div>
                <p className="text-2xl font-bold">
                  {statsLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : openFeedbackCount}
                </p>
              </div>
            </div>

            {/* Sub-Tabs */}
            <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
              <TabsList className="bg-transparent border-b w-full justify-start rounded-none h-auto p-0 space-x-6">
                <TabsTrigger 
                  value="alle"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
                >
                  Alle Artikel
                </TabsTrigger>
                <TabsTrigger 
                  value="ki-assistent"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3 flex items-center gap-2"
                >
                  <Brain className="h-4 w-4" />
                  KI-Assistent
                </TabsTrigger>
                <TabsTrigger 
                  value="zuletzt"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3 flex items-center gap-2"
                >
                  <Clock className="h-4 w-4" />
                  Zuletzt angesehen
                </TabsTrigger>
                <TabsTrigger 
                  value="favoriten"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3 flex items-center gap-2"
                >
                  <Star className="h-4 w-4" />
                  Favoriten
                </TabsTrigger>
              </TabsList>

              <TabsContent value="alle" className="mt-6">
                {isLoading ? (
                  <div className="bg-card rounded-lg border p-8 text-center">Lade Artikel...</div>
                ) : publishedArticles.length === 0 ? (
                  <div className="bg-card rounded-lg border p-8 text-center">
                    <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Keine Artikel vorhanden</h3>
                    <p className="text-sm text-muted-foreground mb-4">Erstellen Sie Ihren ersten Wissensdatenbank-Artikel.</p>
                    {canCreate('knowledge-hub') && (
                      <Button onClick={() => setShowEditor(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Artikel erstellen
                      </Button>
                    )}
                  </div>
                ) : (
                  <ArticleList 
                    articles={publishedArticles} 
                    onSelectArticle={setSelectedArticle}
                    onCreateArticle={canCreate('knowledge-hub') ? () => setShowEditor(true) : undefined}
                  />
                )}
              </TabsContent>

              <TabsContent value="ki-assistent" className="mt-6">
                <AIAssistantTab onCreateArticle={canCreate('knowledge-hub') ? () => setShowEditor(true) : undefined} />
              </TabsContent>

              <TabsContent value="zuletzt" className="mt-6">
                <RecentlyViewedTab 
                  onSelectArticle={setSelectedArticle} 
                  onCreateArticle={canCreate('knowledge-hub') ? () => setShowEditor(true) : undefined}
                />
              </TabsContent>

              <TabsContent value="favoriten" className="mt-6">
                <FavoritesTab 
                  onSelectArticle={setSelectedArticle} 
                  onCreateArticle={canCreate('knowledge-hub') ? () => setShowEditor(true) : undefined}
                />
              </TabsContent>
            </Tabs>
          </TabsContent>

          {canApprove('knowledge-hub') && (
            <TabsContent value="freigaben" className="mt-6">
              <ApprovalQueue />
            </TabsContent>
          )}

          {canApprove('knowledge-hub') && (
            <TabsContent value="ai-governance" className="mt-6">
              <AIGovernanceDashboard />
            </TabsContent>
          )}

        </Tabs>
      </div>
    </div>
  );
};

export default KnowledgeHubPage;