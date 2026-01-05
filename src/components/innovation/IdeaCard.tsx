import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Star, 
  MessageCircle, 
  TrendingUp, 
  Clock, 
  User,
  BarChart3,
  LinkIcon,
  Brain,
  CheckCircle2,
  AlertTriangle,
  Eye,
  FolderPlus,
  Rocket,
  Trash2,
  Edit,
  MoreHorizontal
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { innovationService } from "@/services/innovationService";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";

interface IdeaAnalysis {
  innovation_score: number;
  feasibility_score: number;
  market_potential: number;
  risk_assessment: string;
  summary: string;
  category: string;
  implementation_complexity: string;
  investment_level: string;
}

interface Idea {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  status: string;
  submitter_id: string;
  impact_score?: number;
  complexity_score?: number;
  predicted_success_probability?: number;
  estimated_roi?: number;
  created_at: string;
  votes?: { score: number }[];
  comments?: any[];
}

interface IdeaCardProps {
  idea: Idea;
  onDelete?: () => void;
  onClick?: () => void;
}

export const IdeaCard: React.FC<IdeaCardProps> = ({ idea, onDelete, onClick }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [analysis, setAnalysis] = useState<IdeaAnalysis | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [isVoteDialogOpen, setIsVoteDialogOpen] = useState(false);
  const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false);
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [userRating, setUserRating] = useState<number>(0);

  // Load AI analysis if idea is submitted or under review
  useEffect(() => {
    const loadAnalysis = async () => {
      if (!['new', 'under_review'].includes(idea.status)) return;
      
      setIsLoadingAnalysis(true);
      try {
        const analysisData = await innovationService.getIdeaAnalysis(idea.id);
        setAnalysis(analysisData);
      } catch (error) {
        console.error('Failed to load analysis:', error);
      } finally {
        setIsLoadingAnalysis(false);
      }
    };

    loadAnalysis();
  }, [idea.id, idea.status]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted":
        return "bg-blue-500 text-white";
      case "under_review":
        return "bg-yellow-500 text-white";
      case "completed":
        return "bg-green-500 text-white";
      case "in_progress":
        return "bg-blue-500 text-white";
      case "approved":
        return "bg-emerald-500 text-white";
      case "new":
        return "bg-gray-500 text-white";
      case "rejected":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "submitted":
        return "Eingereicht";
      case "under_review":
        return "In Prüfung";
      case "completed":
        return "Abgeschlossen";
      case "in_progress":
        return "In Umsetzung";
      case "approved":
        return "Genehmigt";
      case "new":
        return "Neu";
      case "rejected":
        return "Abgelehnt";
      default:
        return status;
    }
  };

  const getAnalysisIcon = () => {
    if (isLoadingAnalysis) return <Brain className="h-4 w-4 animate-pulse text-blue-500" />;
    if (analysis) return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    if (['new', 'under_review'].includes(idea.status)) return <Brain className="h-4 w-4 text-gray-400" />;
    return null;
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getRiskLabel = (risk: string) => {
    switch (risk) {
      case 'low': return 'Niedrig';
      case 'medium': return 'Mittel';
      case 'high': return 'Hoch';
      default: return risk;
    }
  };

  const totalVotes = idea.votes?.reduce((sum, vote) => sum + vote.score, 0) || 0;
  const averageVoting = idea.votes?.length ? totalVotes / idea.votes.length : 0;
  const commentsCount = idea.comments?.length || 0;

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const handleVote = () => {
    setIsVoteDialogOpen(true);
  };

  const submitVote = async () => {
    if (userRating === 0) {
      toast({
        title: "Bewertung erforderlich",
        description: "Bitte wählen Sie eine Bewertung aus",
        variant: "destructive"
      });
      return;
    }

    try {
      await innovationService.voteIdea(idea.id, userRating > 3 ? 'upvote' : 'downvote');
      toast({
        title: "Bewertung abgegeben",
        description: "Ihre Bewertung wurde erfolgreich gespeichert"
      });
      setIsVoteDialogOpen(false);
      setUserRating(0);
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Bewertung konnte nicht gespeichert werden",
        variant: "destructive"
      });
    }
  };

  const handleConvertToPilot = () => {
    setIsConvertDialogOpen(true);
  };

  const convertToPilotProject = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      await innovationService.createPilotProject({
        title: `Pilotprojekt: ${idea.title}`,
        description: idea.description || "",
        idea_id: idea.id,
        status: "preparing",
        start_date: new Date().toISOString().split('T')[0],
        end_date: "",
        budget: 0,
        success_metrics: ["Erfolg messen"],
        responsible_person: user.id,
        team_members: [],
        progress: 0,
        attachments: [],
        created_by: user.id
      });
      
      toast({
        title: "Pilotprojekt erstellt",
        description: "Die Idee wurde erfolgreich in ein Pilotprojekt umgewandelt"
      });
      setIsConvertDialogOpen(false);
      navigate('/innovation/pilot-projects');
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Pilotprojekt konnte nicht erstellt werden",
        variant: "destructive"
      });
    }
  };

  const convertToProject = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create regular project
      const { data, error } = await supabase
        .from('projects')
        .insert({
          title: idea.title,
          description: idea.description || "",
          status: 'active',
          priority: 'medium',
          owner_id: user.id,
          team_members: [user.id],
          progress: 0,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Projekt erstellt",
        description: "Die Idee wurde erfolgreich in ein reguläres Projekt umgewandelt"
      });
      setIsProjectDialogOpen(false);
      navigate('/projects');
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Projekt konnte nicht erstellt werden",
        variant: "destructive"
      });
    }
  };

  const handleDeleteIdea = async () => {
    try {
      await supabase
        .from('innovation_ideas')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', idea.id);
      
      toast({
        title: "Idee gelöscht",
        description: "Die Idee wurde erfolgreich gelöscht."
      });
      
      if (onDelete) onDelete();
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Idee konnte nicht gelöscht werden",
        variant: "destructive"
      });
    }
  };

  const handleEditIdea = () => {
    navigate(`/innovation/ideas/${idea.id}/edit`);
  };

  return (
    <Card 
      className={`hover:shadow-lg transition-all duration-200 cursor-pointer ${
        idea.status === 'new' ? 'border-l-4 border-l-blue-500 border border-blue-200' : ''
      }`} 
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg line-clamp-2">{idea.title}</h3>
            {idea.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {idea.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 ml-2">
            {getAnalysisIcon()}
            <Badge className={`${getStatusColor(idea.status)} text-xs`}>
              {getStatusLabel(idea.status)}
            </Badge>
            
            {/* Action Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  handleEditIdea();
                }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Bearbeiten
                </DropdownMenuItem>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Löschen
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Idee löschen?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Sind Sie sicher, dass Sie diese Idee löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteIdea}>
                        Löschen
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* AI Analysis Trigger Button */}
        {!analysis && ['new', 'under_review'].includes(idea.status) && (
          <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Button
              onClick={async () => {
                setIsLoadingAnalysis(true);
                try {
                  await innovationService.triggerIdeaAnalysis(
                    idea.id, 
                    idea.title, 
                    idea.description || '', 
                    idea.tags
                  );
                  // Reload analysis after triggering
                  setTimeout(async () => {
                    try {
                      const analysisData = await innovationService.getIdeaAnalysis(idea.id);
                      setAnalysis(analysisData);
                    } catch (error) {
                      console.error('Failed to reload analysis:', error);
                    } finally {
                      setIsLoadingAnalysis(false);
                    }
                  }, 3000); // Wait 3 seconds for analysis to complete
                } catch (error) {
                  console.error('Failed to trigger analysis:', error);
                  setIsLoadingAnalysis(false);
                }
              }}
              disabled={isLoadingAnalysis}
              className="flex items-center gap-2"
            >
              {isLoadingAnalysis ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  KI analysiert...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4" />
                  KI-Analyse starten
                </>
              )}
            </Button>
          </div>
        )}

        {/* AI Analysis Results */}
        {analysis && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">KI-Analyse</span>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-3">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">{analysis.innovation_score}/10</div>
                <div className="text-xs text-gray-600">Innovation</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">{analysis.feasibility_score}/10</div>
                <div className="text-xs text-gray-600">Machbarkeit</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">{analysis.market_potential}/10</div>
                <div className="text-xs text-gray-600">Marktpotential</div>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm mb-2">
              <div className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                <span>Risiko: </span>
                <span className={getRiskColor(analysis.risk_assessment)}>
                  {getRiskLabel(analysis.risk_assessment)}
                </span>
              </div>
              <Badge variant="outline" className="text-xs">
                {analysis.category}
              </Badge>
            </div>

            {analysis.summary && (
              <p className="text-sm text-gray-700 italic line-clamp-2">
                "{analysis.summary}"
              </p>
            )}
          </div>
        )}

        {/* Loading Analysis */}
        {isLoadingAnalysis && (
          <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-center">
            <div className="flex items-center gap-2 text-gray-600">
              <Brain className="h-4 w-4 animate-pulse" />
              <span className="text-sm">KI analysiert Idee...</span>
            </div>
          </div>
        )}

        {/* Tags */}
        {idea.tags && idea.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {idea.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {idea.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{idea.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4 text-blue-500" />
            <span className="text-muted-foreground">Impact:</span>
            <span className="font-medium">{idea.impact_score || 0}/10</span>
          </div>
          <div className="flex items-center gap-1">
            <BarChart3 className="h-4 w-4 text-green-500" />
            <span className="text-muted-foreground">ROI:</span>
            <span className="font-medium">{idea.estimated_roi || 0}%</span>
          </div>
        </div>

        {/* Predictive AI Scoring */}
        {idea.predicted_success_probability && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg border">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-xs font-medium text-purple-700">KI Prognose</span>
            </div>
            <div className="text-sm">
              <span className="text-purple-900 font-semibold">
                {Math.round(idea.predicted_success_probability * 100)}% Erfolgswahrscheinlichkeit
              </span>
            </div>
          </div>
        )}

        {/* Engagement Stats */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4" />
              <span>{totalVotes} Votes</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              <span>{commentsCount}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{new Date(idea.created_at).toLocaleDateString('de-DE')}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              handleVote();
            }}
          >
            <Star className="h-4 w-4 mr-1" />
            Bewerten ({totalVotes})
          </Button>
          
          <Button variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>
            <Eye className="h-4 w-4" />
          </Button>
        </div>

        {/* Project Conversion Buttons - always visible */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t">
          <Button 
            variant="default" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              handleConvertToPilot();
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Rocket className="h-4 w-4 mr-1" />
            Pilotprojekt
          </Button>
          
          <Button 
            variant="default" 
            size="sm" 
            onClick={(e) => {
                e.stopPropagation();
                setIsProjectDialogOpen(true);
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              <FolderPlus className="h-4 w-4 mr-1" />
              Projekt
            </Button>
        </div>
      </CardContent>

      {/* Vote Dialog */}
      <Dialog open={isVoteDialogOpen} onOpenChange={setIsVoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Idee bewerten</DialogTitle>
            <DialogDescription>
              Bewerten Sie diese Idee von 1 (schlecht) bis 5 (ausgezeichnet)
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center gap-2 py-4">
            {[1, 2, 3, 4, 5].map((rating) => (
              <Button
                key={rating}
                variant={userRating === rating ? "default" : "outline"}
                size="lg"
                onClick={() => setUserRating(rating)}
                className="w-12 h-12"
              >
                {rating}
              </Button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setIsVoteDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button className="flex-1" onClick={submitVote}>
              Bewertung abgeben
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Convert to Pilot Dialog */}
      <Dialog open={isConvertDialogOpen} onOpenChange={setIsConvertDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>In Pilotprojekt umwandeln</DialogTitle>
            <DialogDescription>
              Möchten Sie diese genehmigte Idee in ein Pilotprojekt umwandeln?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Ein neues Pilotprojekt wird mit dem Titel "{idea.title}" erstellt. 
              Sie können die Details später im Pilotprojekt-Bereich anpassen.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setIsConvertDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button className="flex-1" onClick={convertToPilotProject}>
              Pilotprojekt erstellen
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Convert to Project Dialog */}
      <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>In Projekt umwandeln</DialogTitle>
            <DialogDescription>
              Möchten Sie diese Idee in ein reguläres Projekt umwandeln?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Ein neues Projekt wird mit dem Titel "{idea.title}" erstellt. 
              Das Projekt erscheint dann im Projekte-Modul und kann dort vollständig verwaltet werden.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setIsProjectDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button className="flex-1" onClick={convertToProject}>
              Projekt erstellen
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};