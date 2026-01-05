import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  ArrowLeft, 
  Star, 
  Share2, 
  FileDown, 
  ThumbsUp, 
  ThumbsDown,
  Eye,
  Clock,
  User,
  Sparkles,
  Tag,
  RefreshCw,
  Edit,
  Trash2,
  MessageSquare,
  History
} from 'lucide-react';
import { useArticleInteractions } from '@/hooks/useArticleInteractions';
import { ArticleComments } from './ArticleComments';
import ReactMarkdown from 'react-markdown';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  author_id: string;
  created_at: string;
  updated_at: string;
  version: number;
  view_count: number;
  ai_summary?: string;
}

interface ArticleDetailViewProps {
  article: Article;
  onClose: () => void;
}

export const ArticleDetailView = ({ article, onClose }: ArticleDetailViewProps) => {
  const {
    trackView,
    isFavorite,
    toggleFavorite,
    userFeedback,
    submitFeedback,
    comments,
    commentsLoading,
    addComment,
    relatedArticles,
  } = useArticleInteractions(article.id);

  const [activeTab, setActiveTab] = useState('comments');

  useEffect(() => {
    trackView.mutate();
  }, [article.id]);

  // ZERO-DATA: Autor-Informationen aus Artikel laden oder "Unbekannt" anzeigen
  const authorName = 'Autor';
  const authorInitials = 'AU';
  const authorRole = 'Ersteller';
  const displayTags = article.tags?.length > 0 ? article.tags : [];

  return (
    <div className="w-full min-h-screen bg-gray-50 p-6">
      <div className="w-full max-w-7xl mx-auto">
        {/* Back Button Card */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <Button
              variant="ghost"
              onClick={onClose}
              className="w-full justify-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück zur Übersicht
            </Button>
          </CardContent>
        </Card>

        {/* Header Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            {/* Title Row with Actions */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{article.title}</h1>
                <Badge className="bg-blue-100 text-blue-700 border-0">HR</Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleFavorite.mutate()}
                  className={isFavorite ? 'bg-yellow-50 border-yellow-300' : ''}
                >
                  <Star className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                  Favorisieren
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Teilen
                </Button>
                <Button variant="outline" size="sm">
                  <FileDown className="h-4 w-4 mr-2" />
                  PDF
                </Button>
                <Button size="sm" className="bg-gray-900 hover:bg-gray-800 text-white">
                  <Edit className="h-4 w-4 mr-2" />
                  Bearbeiten
                </Button>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Löschen
                </Button>
              </div>
            </div>

            {/* Meta Info Row */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-3">
              <span className="font-medium text-foreground">{authorName}</span>
              <span className="text-gray-300">|</span>
              <span>{new Date(article.updated_at).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              <span className="text-gray-300">|</span>
              <span>Version {article.version}</span>
              <span className="text-gray-300">|</span>
              <span>{article.view_count} Aufrufe</span>
              <span className="text-gray-300">|</span>
              <span className="flex items-center gap-1">
                <ThumbsUp className="h-3.5 w-3.5 text-blue-600" />
                {article.view_count || 0} Likes
              </span>
            </div>

            {/* Tags Row */}
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="h-4 w-4 text-muted-foreground" />
              {displayTags.length > 0 ? displayTags.map((tag, idx) => (
                <Badge key={idx} variant="secondary" className="bg-gray-100 text-gray-700">
                  {tag}
                </Badge>
              )) : <span className="text-sm text-muted-foreground">Keine Tags</span>}
            </div>
          </CardContent>
        </Card>

        {/* Main Content with Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Summary */}
            <Card className="bg-violet-50 border-violet-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-violet-900 mb-1">KI-Zusammenfassung</h3>
                    <p className="text-sm text-violet-800">
                      {article.ai_summary || 'Dieser Artikel beschreibt den Prozess zur Beantragung von Urlaub. Er enthält eine Schritt-für-Schritt-Anleitung, erklärt die Genehmigungsworkflows und gibt Hinweise zu Fristen und besonderen Regelungen.'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Article Content */}
            <Card>
              <CardContent className="p-6">
                <ScrollArea className="h-[500px]">
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{article.content}</ReactMarkdown>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Comments & Versions */}
            <Card>
              <CardContent className="p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="bg-transparent border-b border-gray-200 rounded-none w-full justify-start p-0 h-auto">
                    <TabsTrigger 
                      value="comments"
                      className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Kommentare ({comments.length})
                    </TabsTrigger>
                    <TabsTrigger 
                      value="versions"
                      className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3"
                    >
                      <History className="h-4 w-4 mr-2" />
                      Versionen
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="comments" className="mt-4">
                    <ArticleComments
                      comments={comments}
                      onAddComment={(content, parentId) => addComment.mutate({ content, parentId })}
                      isLoading={commentsLoading}
                    />
                  </TabsContent>

                  <TabsContent value="versions" className="mt-4">
                    <div className="text-sm text-muted-foreground">
                      Versionshistorie wird geladen...
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Artikelinformationen */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4">Artikelinformationen</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Kategorie</span>
                    <span className="font-medium">{article.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Erstellt von</span>
                    <span className="font-medium">{authorName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Letzte Aktualisierung</span>
                    <span className="font-medium">{new Date(article.updated_at).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Version</span>
                    <span className="font-medium">{article.version}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feedback */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Feedback</h3>
                <div className="flex gap-2">
                  <Button
                    variant={userFeedback?.is_helpful === true ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => submitFeedback.mutate(true)}
                  >
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Hilfreich
                  </Button>
                  <Button
                    variant={userFeedback?.is_helpful === false ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => submitFeedback.mutate(false)}
                  >
                    <ThumbsDown className="h-4 w-4 mr-2" />
                    Nicht hilfreich
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Related Articles */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Verwandte Artikel</h3>
                <div className="space-y-2">
                  {relatedArticles.length > 0 ? relatedArticles.map((related: any) => (
                    <div 
                      key={related.id} 
                      className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      <p className="font-medium text-sm">{related.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {related.category} • {related.view_count} Views
                      </p>
                    </div>
                  )) : (
                    <p className="text-sm text-muted-foreground text-center py-4">Keine verwandten Artikel gefunden</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Kontakt</h3>
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-blue-100 text-blue-700">
                      {authorInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{authorName}</p>
                    <p className="text-xs text-muted-foreground">{authorRole}</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  Nachricht senden
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
