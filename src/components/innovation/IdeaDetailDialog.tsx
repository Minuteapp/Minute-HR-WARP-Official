import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useInnovationData } from "@/hooks/useInnovationData";
import { IdeaWorkflowTracker } from "./IdeaWorkflowTracker";
import {
  MessageCircle,
  Star,
  TrendingUp,
  Calendar,
  User,
  Target,
  DollarSign,
  ThumbsUp,
  ThumbsDown,
  Send,
  GitBranch,
  Activity
} from "lucide-react";

interface IdeaDetailDialogProps {
  idea: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const IdeaDetailDialog = ({ idea, open, onOpenChange }: IdeaDetailDialogProps) => {
  const [comment, setComment] = useState("");
  const [isVoting, setIsVoting] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const { toast } = useToast();
  const { voteOnIdea, commentOnIdea } = useInnovationData();

  if (!idea) return null;

  const handleVote = async (score: number) => {
    try {
      setIsVoting(true);
      await voteOnIdea(idea.id, score);
      toast({
        title: "Bewertung gespeichert",
        description: "Ihre Bewertung wurde erfolgreich gespeichert.",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Beim Speichern der Bewertung ist ein Fehler aufgetreten.",
        variant: "destructive"
      });
    } finally {
      setIsVoting(false);
    }
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    
    try {
      setIsCommenting(true);
      await commentOnIdea(idea.id, comment);
      setComment("");
      toast({
        title: "Kommentar hinzugefügt",
        description: "Ihr Kommentar wurde erfolgreich hinzugefügt.",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Beim Hinzufügen des Kommentars ist ein Fehler aufgetreten.",
        variant: "destructive"
      });
    } finally {
      setIsCommenting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'in_review': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-emerald-100 text-emerald-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const averageVoteScore = 0; // Voting-System wird später implementiert

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto w-[95vw]">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl font-bold mb-2">{idea.title}</DialogTitle>
              <div className="flex items-center gap-2 mb-4">
                <Badge className={getStatusColor(idea.status)}>
                  {idea.status.replace('_', ' ').toUpperCase()}
                </Badge>
                {idea.tags?.map((tag: string) => (
                  <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Details
            </TabsTrigger>
            <TabsTrigger value="workflow" className="flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              Workflow
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Aktivität
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Description */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5" />
                      Beschreibung
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {idea.description || "Keine Beschreibung verfügbar."}
                    </p>
                  </CardContent>
                </Card>

                {/* KI Insights */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      KI-Analyse
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Erfolgswahrscheinlichkeit</span>
                          <span className="text-sm text-muted-foreground">
                            {idea.predicted_success_probability ? `${Math.round(idea.predicted_success_probability * 100)}%` : 'N/A'}
                          </span>
                        </div>
                        <Progress value={idea.predicted_success_probability ? idea.predicted_success_probability * 100 : 0} />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">ROI Schätzung</span>
                          <span className="text-sm text-muted-foreground">
                            {idea.estimated_roi ? `${Math.round(idea.estimated_roi)}%` : 'N/A'}
                          </span>
                        </div>
                        <Progress value={idea.estimated_roi ? Math.min(idea.estimated_roi, 100) : 0} />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Comments Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5" />
                      Kommentare (0)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Add Comment */}
                    <div className="space-y-3">
                      <Textarea
                        placeholder="Kommentar hinzufügen..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={3}
                      />
                      <Button 
                        onClick={handleComment}
                        disabled={!comment.trim() || isCommenting}
                        className="w-full"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {isCommenting ? "Wird gesendet..." : "Kommentar hinzufügen"}
                      </Button>
                    </div>

                    <Separator />

                    {/* Comments List */}
                    <div className="space-y-3">
                      <p className="text-muted-foreground text-center py-4">
                        Noch keine Kommentare vorhanden.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Voting */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5" />
                      Bewertung
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        0.0/10
                      </div>
                      <p className="text-sm text-muted-foreground">
                        0 Bewertungen
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVote(3)}
                        disabled={isVoting}
                        className="flex-1"
                      >
                        <ThumbsDown className="h-4 w-4 mr-1" />
                        Niedrig
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVote(7)}
                        disabled={isVoting}
                        className="flex-1"
                      >
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        Hoch
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Metriken
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Impact Score</span>
                        <span className="text-sm font-medium">
                          {idea.impact_score || 'N/A'}/10
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Komplexität</span>
                        <span className="text-sm font-medium">
                          {idea.complexity_score || 'N/A'}/10
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Strategic Fit</span>
                        <span className="text-sm font-medium">
                          {idea.strategic_fit || 'N/A'}/10
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Metadata */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Eingereicht von Mitarbeiter</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Erstellt: {formatDate(idea.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Aktualisiert: {formatDate(idea.updated_at)}
                      </span>
                    </div>
                    {idea.estimated_roi && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          ROI: {Math.round(idea.estimated_roi)}%
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="workflow" className="mt-6">
            <IdeaWorkflowTracker currentStatus={idea.status} ideaId={idea.id} />
          </TabsContent>

          <TabsContent value="activity" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Aktivitätsverlauf
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                    <div className="h-2 w-2 bg-blue-600 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Idee eingereicht</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(idea.created_at)}
                      </p>
                    </div>
                  </div>
                  
                  {idea.status !== 'new' && (
                    <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                      <div className="h-2 w-2 bg-green-600 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">KI-Analyse abgeschlossen</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(idea.updated_at)}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">
                      Weitere Aktivitäten werden hier angezeigt...
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};