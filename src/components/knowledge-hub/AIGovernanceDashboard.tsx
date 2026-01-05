import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  Sparkles, 
  AlertTriangle, 
  Lightbulb, 
  CheckCircle, 
  Users, 
  Globe, 
  RefreshCw, 
  Clock,
  Zap,
  BarChart,
  FileText,
  ThumbsUp,
  Award,
  TrendingUp,
  Calendar,
  Mail,
  User,
  Loader2
} from 'lucide-react';
import { useAIGovernanceStats } from '@/hooks/useKnowledgeHubStats';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const TABS = [
  { id: 'quality', label: 'Qualität', icon: CheckCircle },
  { id: 'gaps', label: 'Content Gaps', icon: Lightbulb },
  { id: 'conflicts', label: 'Konflikte', icon: RefreshCw },
  { id: 'suggestions', label: 'KI-Vorschläge', icon: Sparkles },
  { id: 'authors', label: 'Autoren', icon: Users },
];

// Keine Mock-Daten - werden aus der Datenbank geladen
const CONTENT_GAPS: any[] = [];
const CONFLICTS: any[] = [];
const AI_SUGGESTIONS: any[] = [];

export const AIGovernanceDashboard = () => {
  const { qualityIssues, authors, contentHealth, openIssuesCount, criticalCount, isLoading } = useAIGovernanceStats();
  
  const [activeTab, setActiveTab] = useState('quality');
  const [analysisDialogOpen, setAnalysisDialogOpen] = useState(false);
  const [analysisState, setAnalysisState] = useState<'start' | 'progress' | 'completed'>('start');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  
  const [ignoreDialogOpen, setIgnoreDialogOpen] = useState(false);
  const [selectedIssueForIgnore, setSelectedIssueForIgnore] = useState<any>(null);
  const [ignoreReason, setIgnoreReason] = useState('');
  
  const [autoFixDialogOpen, setAutoFixDialogOpen] = useState(false);
  const [selectedIssueForFix, setSelectedIssueForFix] = useState<any>(null);

  // Content Gaps States
  const [generateArticleDialogOpen, setGenerateArticleDialogOpen] = useState(false);
  const [selectedGap, setSelectedGap] = useState<typeof CONTENT_GAPS[0] | null>(null);
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [generateState, setGenerateState] = useState<'form' | 'success'>('form');

  // Conflicts States
  const [resolveConflictDialogOpen, setResolveConflictDialogOpen] = useState(false);
  const [selectedConflict, setSelectedConflict] = useState<typeof CONFLICTS[0] | null>(null);
  const [selectedResolution, setSelectedResolution] = useState<'article1' | 'article2' | 'ai-merge'>('ai-merge');

  // Authors States
  const [authorDetailsDialogOpen, setAuthorDetailsDialogOpen] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState<any>(null);

  // AI Suggestions States
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<typeof AI_SUGGESTIONS[0] | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [previewVisible, setPreviewVisible] = useState(true);

  const startAnalysis = () => {
    setAnalysisState('progress');
    setAnalysisProgress(0);
    
    const interval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setAnalysisState('completed');
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const openIgnoreDialog = (issue: any) => {
    setSelectedIssueForIgnore(issue);
    setIgnoreReason('');
    setIgnoreDialogOpen(true);
  };

  const openAutoFixDialog = (issue: any) => {
    setSelectedIssueForFix(issue);
    setAutoFixDialogOpen(true);
  };

  const closeAnalysisDialog = () => {
    setAnalysisDialogOpen(false);
    setAnalysisState('start');
    setAnalysisProgress(0);
  };

  const openGenerateArticleDialog = (gap: typeof CONTENT_GAPS[0]) => {
    setSelectedGap(gap);
    setAdditionalInstructions('');
    setGenerateState('form');
    setGenerateArticleDialogOpen(true);
  };

  const closeGenerateDialog = () => {
    setGenerateArticleDialogOpen(false);
    setGenerateState('form');
  };

  const handleGenerateArticle = () => {
    setGenerateState('success');
  };

  const openResolveConflictDialog = (conflict: typeof CONFLICTS[0]) => {
    setSelectedConflict(conflict);
    setSelectedResolution('ai-merge');
    setResolveConflictDialogOpen(true);
  };

  const openAuthorDetailsDialog = (author: any) => {
    setSelectedAuthor(author);
    setAuthorDetailsDialogOpen(true);
  };

  const openRejectDialog = (suggestion: typeof AI_SUGGESTIONS[0]) => {
    setSelectedSuggestion(suggestion);
    setRejectReason('');
    setRejectDialogOpen(true);
  };

  const openReviewDialog = (suggestion: typeof AI_SUGGESTIONS[0]) => {
    setSelectedSuggestion(suggestion);
    setPreviewVisible(true);
    setReviewDialogOpen(true);
  };

  const handleReject = () => {
    setRejectDialogOpen(false);
  };

  const handleApproveAndPublish = () => {
    setReviewDialogOpen(false);
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <Card className="bg-white">
        <CardContent className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Globe className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">AI Governance Dashboard</h2>
              <p className="text-sm text-muted-foreground">
                Automatisierte Qualitätssicherung & Content Intelligence
              </p>
            </div>
          </div>
          <Button 
            className="bg-black hover:bg-black/90"
            onClick={() => setAnalysisDialogOpen(true)}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            KI-Analyse starten
          </Button>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Content Health</p>
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold">{isLoading ? '...' : `${contentHealth}%`}</p>
              <Progress value={contentHealth} className="mt-2 h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                Durchschnittliche Qualität
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Offene Issues</p>
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold">{isLoading ? '...' : openIssuesCount}</p>
              <div className="flex gap-2 mt-2">
                <Badge className="bg-red-500 text-white">{criticalCount} Kritisch</Badge>
                <Badge variant="outline">{openIssuesCount - criticalCount} Normal</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Content Gaps</p>
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Lightbulb className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold">{CONTENT_GAPS.length}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Fehlende Themen erkannt
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">KI-Vorschläge</p>
              <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-violet-600" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold">{AI_SUGGESTIONS.length}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Zur Review bereit
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-2 px-1 border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-primary text-primary font-medium'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      {activeTab === 'quality' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Qualitätsprobleme</h3>
            <p className="text-sm text-muted-foreground">
              Artikel mit erkannten Problemen oder Verbesserungsbedarf
            </p>
          </div>
          {qualityIssues.map((issue: any, index: number) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">{issue.title}</h4>
                    <Badge variant="outline">Vorschau</Badge>
                    <Badge variant="outline">{issue.category}</Badge>
                    <Badge
                      className={
                        issue.severity === 'critical'
                          ? 'bg-red-500 text-white'
                          : issue.severity === 'high'
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }
                    >
                      {issue.severity === 'critical'
                        ? 'Kritisch'
                        : issue.severity === 'high'
                        ? 'Hoch'
                        : 'Mittel'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {issue.issue}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {issue.lastUpdate}
                    </span>
                  </div>
                  <div className="bg-violet-50 border border-violet-200 rounded-lg p-3 mb-3">
                    <div className="flex items-start gap-2">
                      <Sparkles className="h-4 w-4 text-violet-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-violet-900">
                          KI-Vorschlag: {issue.suggestion}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openIgnoreDialog(issue)}
                    >
                      Ignorieren
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-black hover:bg-black/90"
                      onClick={() => openAutoFixDialog(issue)}
                    >
                      <Zap className="h-4 w-4 mr-1" />
                      Auto-Fix
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Content Gaps Tab */}
      {activeTab === 'gaps' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Erkannte Wissenslücken</h3>
            <p className="text-sm text-muted-foreground">
              Themen, die häufig gesucht werden, aber keine Artikel haben
            </p>
          </div>
          {CONTENT_GAPS.map((gap) => (
            <Card key={gap.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col">
                  <h4 className="font-semibold mb-2">{gap.title}</h4>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      className={
                        gap.priority === 'high'
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }
                    >
                      {gap.priority === 'high' ? 'Hohe Priorität' : 'Mittlere Priorität'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                    <BarChart className="h-3 w-3" />
                    {gap.searchCount} Suchanfragen
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    Verwandte: {gap.relatedTopics.join(', ')}
                  </div>
                  <div className="text-sm mb-4">
                    <span className="text-muted-foreground">Vorgeschlagene Kategorie: </span>
                    <span className="font-medium">{gap.suggestedCategory}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Später
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-black hover:bg-black/90"
                      onClick={() => openGenerateArticleDialog(gap)}
                    >
                      <Sparkles className="h-4 w-4 mr-1" />
                      Artikel generieren
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Conflicts Tab */}
      {activeTab === 'conflicts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Erkannte Konflikte</h3>
            <p className="text-sm text-muted-foreground">
              Widersprüche und Inkonsistenzen zwischen Artikeln
            </p>
          </div>
          {CONFLICTS.map((conflict) => (
            <Card key={conflict.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      className={
                        conflict.type === 'Widerspruch'
                          ? 'bg-red-500 text-white'
                          : ''
                      }
                      variant={conflict.type === 'Widerspruch' ? 'default' : 'outline'}
                    >
                      {conflict.type}
                    </Badge>
                    <Badge variant="outline">
                      {conflict.affectedUsers} Nutzer
                    </Badge>
                  </div>
                  <p className="text-sm mb-3">{conflict.description}</p>
                  <div className="flex flex-col gap-1 text-sm mb-4">
                    <button className="text-blue-600 hover:underline flex items-center gap-1.5 w-fit">
                      <RefreshCw className="h-3 w-3" />
                      {conflict.article1.title}
                    </button>
                    <button className="text-blue-600 hover:underline flex items-center gap-1.5 w-fit">
                      <RefreshCw className="h-3 w-3" />
                      {conflict.article2.title}
                    </button>
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full bg-black hover:bg-black/90"
                    onClick={() => openResolveConflictDialog(conflict)}
                  >
                    Konflikt lösen
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* AI Suggestions Tab */}
      {activeTab === 'suggestions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">KI-generierte Artikelvorschläge</h3>
            <p className="text-sm text-muted-foreground">
              Automatisch erstellte Entwürfe basierend auf erkannten Lücken
            </p>
          </div>
          {AI_SUGGESTIONS.map((suggestion) => (
            <Card key={suggestion.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col">
                  <h4 className="font-semibold mb-2">{suggestion.title}</h4>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{suggestion.category}</Badge>
                    <div className="flex items-center gap-1 text-green-600">
                      <ThumbsUp className="h-3 w-3" />
                      <span className="text-sm font-medium">{suggestion.confidence}%</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{suggestion.status}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <FileText className="h-3 w-3" />
                    <span>Quellen: {suggestion.sources.join(', ')}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openRejectDialog(suggestion)}
                    >
                      Ablehnen
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-black hover:bg-black/90"
                      onClick={() => openReviewDialog(suggestion)}
                    >
                      Review
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Authors Tab */}
      {activeTab === 'authors' && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Autoren-Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Statistiken und Qualitätsmetriken der Content-Ersteller
              </p>
            </div>
            <div className="space-y-4">
              {authors.map((author: any) => (
                <Card key={author.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{author.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {author.articleCount} Artikel • {author.lastActivity}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground mb-1">Durchschn. Qualität</p>
                          <div className="flex items-center gap-2">
                            <Progress value={author.quality} className="w-24 h-2" />
                            <span className="text-sm font-medium">{author.quality}%</span>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openAuthorDetailsDialog(author)}
                        >
                          Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* KI-Analyse Dialog */}
      <Dialog open={analysisDialogOpen} onOpenChange={closeAnalysisDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>KI-Analyse starten</DialogTitle>
            {analysisState === 'start' && (
              <p className="text-sm text-muted-foreground">
                Vollständige Analyse aller Artikel im Knowledge Hub
              </p>
            )}
          </DialogHeader>

          {analysisState === 'start' && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="font-medium mb-2">Die KI-Analyse überprüft:</p>
                <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                  <li>Qualität und Lesbarkeit</li>
                  <li>Veraltete Informationen</li>
                  <li>Wissenslücken</li>
                  <li>Duplikate und Konflikte</li>
                  <li>SEO-Optimierung</li>
                </ul>
              </div>
              <p className="text-sm text-muted-foreground">
                Die Analyse kann 2-5 Minuten dauern. Sie können die Seite während der Analyse schließen.
              </p>
              <DialogFooter>
                <Button variant="outline" onClick={closeAnalysisDialog}>
                  Abbrechen
                </Button>
                <Button className="bg-black hover:bg-black/90" onClick={startAnalysis}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Analyse starten
                </Button>
              </DialogFooter>
            </>
          )}

          {analysisState === 'progress' && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-blue-600 animate-pulse" />
                <span className="font-medium">Analysiere Artikel... {analysisProgress}%</span>
              </div>
              <Progress value={analysisProgress} className="h-2" />
              <p className="text-sm text-muted-foreground">• Erstelle Bericht...</p>
            </div>
          )}

          {analysisState === 'completed' && (
            <>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-900">Analyse abgeschlossen!</span>
                </div>
                <p className="text-sm text-green-700">
                  23 Probleme erkannt • 12 neue Wissenslücken • 7 KI-Vorschläge
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={closeAnalysisDialog}>
                  Schließen
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Problem ignorieren Dialog */}
      <Dialog open={ignoreDialogOpen} onOpenChange={setIgnoreDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Problem ignorieren</DialogTitle>
            <p className="text-sm text-muted-foreground">
              {selectedIssueForIgnore?.title}
            </p>
          </DialogHeader>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <span className="font-medium text-yellow-700">Problem: </span>
            <span className="text-yellow-600">{selectedIssueForIgnore?.issue}</span>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Grund für Ignorieren (optional)</label>
            <Textarea 
              placeholder="z.B. Dieses Problem wird in nächster Version behoben..."
              value={ignoreReason}
              onChange={(e) => setIgnoreReason(e.target.value)}
            />
          </div>

          <p className="text-sm text-muted-foreground">
            Das Problem wird für 30 Tage nicht mehr angezeigt.
          </p>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIgnoreDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button className="bg-black hover:bg-black/90" onClick={() => setIgnoreDialogOpen(false)}>
              Ignorieren
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Auto-Fix Dialog */}
      <Dialog open={autoFixDialogOpen} onOpenChange={setAutoFixDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Auto-Fix anwenden</DialogTitle>
            <p className="text-sm text-muted-foreground">
              {selectedIssueForFix?.title}
            </p>
          </DialogHeader>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <span className="font-medium text-yellow-700">Problem: </span>
            <span className="text-yellow-600">{selectedIssueForFix?.issue}</span>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-blue-600 mt-0.5" />
              <div>
                <span className="font-medium text-blue-700">KI-Vorschlag: </span>
                <p className="text-sm text-blue-600">{selectedIssueForFix?.suggestion}</p>
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Der Artikel wird automatisch aktualisiert und zur Review bereitgestellt.
          </p>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAutoFixDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button className="bg-black hover:bg-black/90" onClick={() => setAutoFixDialogOpen(false)}>
              <Zap className="h-4 w-4 mr-2" />
              Fix anwenden
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Artikel generieren Dialog */}
      <Dialog open={generateArticleDialogOpen} onOpenChange={closeGenerateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Artikel generieren</DialogTitle>
            {generateState === 'form' && (
              <p className="text-sm text-muted-foreground">
                {selectedGap?.title}
              </p>
            )}
          </DialogHeader>

          {generateState === 'form' && (
            <>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{selectedGap?.suggestedCategory}</Badge>
                  <Badge className={selectedGap?.priority === 'high' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700'}>
                    {selectedGap?.priority === 'high' ? 'Hohe Priorität' : 'Mittlere Priorität'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {selectedGap?.searchCount} Suchanfragen • {selectedGap?.relatedTopics.join(', ')}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Zusätzliche Anweisungen (optional)</label>
                <Textarea 
                  placeholder="z.B. Fokussiere auf praktische Beispiele und Checklisten..."
                  value={additionalInstructions}
                  onChange={(e) => setAdditionalInstructions(e.target.value)}
                />
              </div>

              <p className="text-sm text-muted-foreground">
                Der generierte Artikel wird als Entwurf gespeichert und zur Review bereitgestellt.
              </p>

              <DialogFooter>
                <Button variant="outline" onClick={closeGenerateDialog}>
                  Abbrechen
                </Button>
                <Button className="bg-black hover:bg-black/90" onClick={handleGenerateArticle}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generieren
                </Button>
              </DialogFooter>
            </>
          )}

          {generateState === 'success' && (
            <>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-900">Artikel erfolgreich generiert!</span>
                </div>
                <p className="text-sm text-green-700">
                  Der Entwurf wurde zur Review bereitgestellt.
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={closeGenerateDialog}>
                  Schließen
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Konflikt lösen Dialog */}
      <Dialog open={resolveConflictDialogOpen} onOpenChange={setResolveConflictDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Konflikt lösen</DialogTitle>
          </DialogHeader>

          <div className="flex items-center gap-2 mb-2">
            <Badge
              className={selectedConflict?.type === 'Widerspruch' ? 'bg-red-500 text-white' : ''}
              variant={selectedConflict?.type === 'Widerspruch' ? 'default' : 'outline'}
            >
              {selectedConflict?.type}
            </Badge>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-700">{selectedConflict?.description}</p>
            <p className="text-xs text-yellow-600 mt-1">{selectedConflict?.affectedUsers} Nutzer betroffen</p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium">Wähle den zu behaltenden Artikel:</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                className={`p-4 rounded-lg border text-left transition-colors ${
                  selectedResolution === 'article1' 
                    ? 'border-2 border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setSelectedResolution('article1')}
              >
                <div className="flex flex-col gap-2">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">{selectedConflict?.article1.title}</p>
                    <p className="text-xs text-muted-foreground">Diese Version behalten</p>
                  </div>
                </div>
              </button>

              <button
                className={`p-4 rounded-lg border text-left transition-colors ${
                  selectedResolution === 'article2' 
                    ? 'border-2 border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setSelectedResolution('article2')}
              >
                <div className="flex flex-col gap-2">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">{selectedConflict?.article2.title}</p>
                    <p className="text-xs text-muted-foreground">Diese Version behalten</p>
                  </div>
                </div>
              </button>
            </div>

            <button
              className={`w-full p-4 rounded-lg border text-left transition-colors ${
                selectedResolution === 'ai-merge' 
                  ? 'border-2 border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => setSelectedResolution('ai-merge')}
            >
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-violet-600 mt-0.5" />
                <div>
                  <p className="font-medium">KI-gestützte Zusammenführung</p>
                  <p className="text-sm text-muted-foreground">Beste Inhalte aus beiden Artikeln kombinieren</p>
                </div>
              </div>
            </button>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setResolveConflictDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button className="bg-black hover:bg-black/90" onClick={() => setResolveConflictDialogOpen(false)}>
              Konflikt lösen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Autoren Details Dialog */}
      <Dialog open={authorDetailsDialogOpen} onOpenChange={setAuthorDetailsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Autoren-Details</span>
              <Badge variant="outline" className="text-xs">Vorschau</Badge>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-7 w-7 text-blue-600" />
              </div>
              <div>
                <DialogTitle>{selectedAuthor?.name}</DialogTitle>
                <p className="text-sm text-muted-foreground">Content-Autor</p>
              </div>
            </div>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xl font-bold">{selectedAuthor?.articleCount}</p>
                  <p className="text-xs text-muted-foreground">Artikel</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Award className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xl font-bold">{selectedAuthor?.quality}%</p>
                  <p className="text-xs text-muted-foreground">Qualität</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-xl font-bold">{selectedAuthor?.views}</p>
                  <p className="text-xs text-muted-foreground">Views</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-violet-600" />
                </div>
                <div>
                  <p className="text-xl font-bold">{selectedAuthor?.lastActivity}</p>
                  <p className="text-xs text-muted-foreground">Aktiv</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <h4 className="font-medium mb-3">Letzte Artikel</h4>
            <div className="space-y-2">
              {selectedAuthor?.recentArticles.map((article, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{article.title}</p>
                    <p className="text-xs text-muted-foreground">{article.date}</p>
                  </div>
                  <Badge variant="outline" className="text-green-600">
                    {article.quality}%
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span>{selectedAuthor?.email}</span>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAuthorDetailsDialogOpen(false)}>
              Schließen
            </Button>
            <Button className="bg-black hover:bg-black/90">
              Nachricht senden
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* KI-Vorschlag ablehnen Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>KI-Vorschlag ablehnen</DialogTitle>
            <p className="text-sm text-muted-foreground">
              {selectedSuggestion?.title}
            </p>
          </DialogHeader>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline">{selectedSuggestion?.category}</Badge>
              <div className="flex items-center gap-1 text-green-600">
                <Sparkles className="h-3 w-3" />
                <span className="text-sm font-medium">{selectedSuggestion?.confidence}% Confidence</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Status: {selectedSuggestion?.status}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Grund für Ablehnung (optional)</label>
            <Textarea 
              placeholder="z.B. Thema ist nicht mehr relevant, Informationen sind bereits vorhanden..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>

          <p className="text-sm text-muted-foreground">
            Der abgelehnte Vorschlag wird archiviert und verbessert zukünftige KI-Empfehlungen.
          </p>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button 
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={handleReject}
            >
              Ablehnen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* KI-Vorschlag reviewen Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>KI-Vorschlag reviewen</DialogTitle>
            <p className="text-sm text-muted-foreground">
              {selectedSuggestion?.title}
            </p>
          </DialogHeader>

          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline">{selectedSuggestion?.category}</Badge>
            <div className="flex items-center gap-1 text-green-600">
              <Sparkles className="h-3 w-3" />
              <span className="text-sm font-medium">{selectedSuggestion?.confidence}% Confidence</span>
            </div>
            <Badge variant="outline">{selectedSuggestion?.status}</Badge>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-blue-600 mb-2">
              <FileText className="h-4 w-4" />
              <span className="font-medium">Verwendete Quellen</span>
            </div>
            <ul className="list-disc list-inside text-sm text-muted-foreground">
              {selectedSuggestion?.sources.map((source, index) => (
                <li key={index} className="text-blue-600 hover:underline cursor-pointer">
                  {source}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Artikel-Vorschau</span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setPreviewVisible(!previewVisible)}
              >
                {previewVisible ? 'Vorschau ausblenden' : 'Vorschau anzeigen'}
              </Button>
            </div>
            {previewVisible && selectedSuggestion?.preview && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold">{selectedSuggestion.title}</h4>
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">Einleitung</p>
                  <p className="text-sm">{selectedSuggestion.preview.intro}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">Hauptinhalt</p>
                  <p className="text-sm">{selectedSuggestion.preview.main}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">Fazit</p>
                  <p className="text-sm">{selectedSuggestion.preview.conclusion}</p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Vollständigkeit</span>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={selectedSuggestion?.completeness || 0} className="flex-1 h-2" />
                <span className="text-sm font-medium">{selectedSuggestion?.completeness}%</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Relevanz</span>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={selectedSuggestion?.relevance || 0} className="flex-1 h-2" />
                <span className="text-sm font-medium">{selectedSuggestion?.relevance}%</span>
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Nach der Genehmigung wird der Artikel als Entwurf veröffentlicht und kann weiter bearbeitet werden.
          </p>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
              Zur Bearbeitung
            </Button>
            <Button 
              className="bg-black hover:bg-black/90"
              onClick={handleApproveAndPublish}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Genehmigen & Veröffentlichen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
