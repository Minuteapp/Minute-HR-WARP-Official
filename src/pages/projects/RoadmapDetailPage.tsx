import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRoadmapDetail } from '@/hooks/useRoadmapDetail';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { EditRoadmapDialog } from '@/components/roadmap/EditRoadmapDialog';
import { 
  ArrowLeft, 
  Edit, 
  Calendar, 
  Users, 
  Target, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronDown,
  MapPin,
  Building2,
  FolderKanban,
  TrendingUp,
  DollarSign,
  Activity,
  FileText,
  Loader2,
  Eye
} from 'lucide-react';
import { format, differenceInDays, isAfter, isBefore } from 'date-fns';
import { de } from 'date-fns/locale';

const RoadmapDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: roadmap, isLoading, error } = useRoadmapDetail(id);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['goals', 'timeline', 'budget', 'team', 'risks', 'updates'])
  );

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !roadmap) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Roadmap nicht gefunden</h2>
          <Button onClick={() => navigate('/projects/roadmap')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück zur Übersicht
          </Button>
        </div>
      </div>
    );
  }

  // Berechnungen
  const now = new Date();
  const startDate = roadmap.start_date ? new Date(roadmap.start_date) : null;
  const endDate = roadmap.end_date ? new Date(roadmap.end_date) : null;
  
  let timeProgress = 0;
  if (startDate && endDate) {
    const totalDays = differenceInDays(endDate, startDate);
    const elapsedDays = differenceInDays(now, startDate);
    timeProgress = Math.max(0, Math.min(100, (elapsedDays / totalDays) * 100));
  }

  const isDelayed = roadmap.progress < timeProgress - 10;
  const completedMilestones = roadmap.milestones.filter(m => m.status === 'completed').length;
  const activeProjects = roadmap.projects.filter(p => p.status === 'active' || p.status === 'in_progress').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700 border-green-300">Aktiv</Badge>;
      case 'draft':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-300">Entwurf</Badge>;
      case 'completed':
        return <Badge className="bg-gray-100 text-gray-700 border-gray-300">Abgeschlossen</Badge>;
      case 'on_hold':
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">Pausiert</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <Badge variant="destructive">Kritisch</Badge>;
      case 'high':
        return <Badge className="bg-orange-100 text-orange-700 border-orange-300">Hoch</Badge>;
      case 'medium':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-300">Mittel</Badge>;
      case 'low':
        return <Badge className="bg-gray-100 text-gray-700 border-gray-300">Niedrig</Badge>;
      default:
        return null;
    }
  };

  const getRiskBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <Badge variant="destructive" className="text-xs">HOCH</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-700 text-xs">MITTEL</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-700 text-xs">NIEDRIG</Badge>;
      default:
        return null;
    }
  };

  // Budget aus metadata
  const budget = roadmap.metadata?.budget || {};
  const budgetTotal = budget.total || 0;
  const budgetSpent = budget.spent || 0;
  const budgetRemaining = budgetTotal - budgetSpent;
  const budgetProgress = budgetTotal > 0 ? (budgetSpent / budgetTotal) * 100 : 0;

  // Strategische Ziele aus strategic_objectives JSONB
  const strategicObjectives = roadmap.strategic_objectives || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Back Navigation */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/projects/roadmap')}
          className="mb-4 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück zur Übersicht
        </Button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold">{roadmap.title}</h1>
                {getStatusBadge(roadmap.status)}
                {getPriorityBadge(roadmap.priority)}
              </div>
              <p className="text-muted-foreground mb-4">{roadmap.description || 'Keine Beschreibung'}</p>
              
              {/* Tags */}
              {roadmap.metadata?.tags && roadmap.metadata.tags.length > 0 && (
                <div className="flex gap-2 mb-4">
                  {roadmap.metadata.tags.map((tag: string, i: number) => (
                    <Badge key={i} variant="outline">{tag}</Badge>
                  ))}
                </div>
              )}

              {/* Meta Info Bar */}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {roadmap.team_name && (
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{roadmap.team_name}</span>
                  </div>
                )}
                {roadmap.metadata?.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{roadmap.metadata.location}</span>
                  </div>
                )}
                {roadmap.metadata?.department && (
                  <div className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    <span>{roadmap.metadata.department}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <FolderKanban className="h-4 w-4" />
                  <span>{roadmap.projects.length} Projekte</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  <span>{roadmap.progress}% Fortschritt</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>
                    {roadmap.visibility === 'private' ? 'Privat' :
                     roadmap.visibility === 'team' ? 'Team' :
                     roadmap.visibility === 'department' ? 'Abteilung' : 'Unternehmen'}
                  </span>
                </div>
              </div>
            </div>
            
            <Button onClick={() => setShowEditDialog(true)} className="gap-2">
              <Edit className="h-4 w-4" />
              Bearbeiten
            </Button>
          </div>
        </div>

        {/* Main Layout - 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{roadmap.projects.length}</div>
                  <div className="text-sm text-muted-foreground">Projekte</div>
                  <div className="text-xs text-muted-foreground">{activeProjects} aktiv</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{roadmap.milestones.length}</div>
                  <div className="text-sm text-muted-foreground">Meilensteine</div>
                  <div className="text-xs text-muted-foreground">{completedMilestones} erreicht</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{roadmap.goals.length}</div>
                  <div className="text-sm text-muted-foreground">Ziele</div>
                  <div className="text-xs text-muted-foreground">
                    {roadmap.goals.filter(g => g.status === 'completed').length} erreicht
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{roadmap.progress}%</div>
                  <div className="text-sm text-muted-foreground">Ø Fortschritt</div>
                  <div className="text-xs text-muted-foreground">{Math.round(timeProgress)}% Zeit</div>
                </CardContent>
              </Card>
            </div>

            {/* Strategic Goals */}
            <Collapsible open={expandedSections.has('goals')} onOpenChange={() => toggleSection('goals')}>
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        Strategische Ziele
                      </CardTitle>
                      <ChevronDown className={`h-5 w-5 transition-transform ${expandedSections.has('goals') ? 'rotate-180' : ''}`} />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    {strategicObjectives.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4 text-center">Keine strategischen Ziele definiert</p>
                    ) : (
                      <ol className="space-y-3">
                        {strategicObjectives.map((objective: any, index: number) => (
                          <li key={objective.id || index} className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center font-medium">
                              {index + 1}
                            </span>
                            <div>
                              <p className="font-medium">{objective.title}</p>
                              {objective.description && (
                                <p className="text-sm text-muted-foreground">{objective.description}</p>
                              )}
                            </div>
                          </li>
                        ))}
                      </ol>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Time Progress */}
            <Collapsible open={expandedSections.has('timeline')} onOpenChange={() => toggleSection('timeline')}>
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" />
                        Zeitlicher Fortschritt
                      </CardTitle>
                      <ChevronDown className={`h-5 w-5 transition-transform ${expandedSections.has('timeline') ? 'rotate-180' : ''}`} />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0 space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Zeitfortschritt</span>
                        <span>{Math.round(timeProgress)}%</span>
                      </div>
                      <Progress value={timeProgress} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        {startDate && endDate ? (
                          `${format(startDate, 'dd.MM.yyyy', { locale: de })} - ${format(endDate, 'dd.MM.yyyy', { locale: de })}`
                        ) : 'Kein Zeitraum definiert'}
                      </p>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Arbeitsfortschritt</span>
                        <span>{roadmap.progress}%</span>
                      </div>
                      <Progress value={roadmap.progress} className="h-2" />
                    </div>
                    {isDelayed && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Roadmap ist hinter dem Zeitplan ({Math.round(timeProgress - roadmap.progress)}% Verzögerung)</span>
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Projects Timeline */}
            {roadmap.projects.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FolderKanban className="h-5 w-5 text-primary" />
                    Projekte
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {roadmap.projects.map((project: any) => (
                    <div key={project.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{project.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {project.start_date && project.end_date ? (
                            `${format(new Date(project.start_date), 'MMM yyyy', { locale: de })} - ${format(new Date(project.end_date), 'MMM yyyy', { locale: de })}`
                          ) : 'Kein Zeitraum'}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-24">
                          <Progress value={project.progress || 0} className="h-2" />
                        </div>
                        <span className="text-sm font-medium w-12 text-right">{project.progress || 0}%</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Budget */}
            {budgetTotal > 0 && (
              <Collapsible open={expandedSections.has('budget')} onOpenChange={() => toggleSection('budget')}>
                <Card>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-primary" />
                          Budget
                        </CardTitle>
                        <ChevronDown className={`h-4 w-4 transition-transform ${expandedSections.has('budget') ? 'rotate-180' : ''}`} />
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Gesamt-Budget</span>
                        <span className="font-medium">{budgetTotal.toLocaleString('de-DE')} €</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Ausgegeben</span>
                        <span className="font-medium">{budgetSpent.toLocaleString('de-DE')} €</span>
                      </div>
                      <Progress value={budgetProgress} className="h-2" />
                      <div className="flex justify-between text-sm">
                        <span>Verbleibend</span>
                        <span className={`font-medium ${budgetRemaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {budgetRemaining.toLocaleString('de-DE')} €
                        </span>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            )}

            {/* Team */}
            <Collapsible open={expandedSections.has('team')} onOpenChange={() => toggleSection('team')}>
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        Team ({roadmap.team_members.length})
                      </CardTitle>
                      <ChevronDown className={`h-4 w-4 transition-transform ${expandedSections.has('team') ? 'rotate-180' : ''}`} />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    {roadmap.team_members.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">Kein Team zugeordnet</p>
                    ) : (
                      <div className="space-y-3">
                        {roadmap.team_members.map((member) => (
                          <div key={member.id} className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={member.avatar_url} />
                              <AvatarFallback>
                                {member.full_name?.split(' ').map(n => n[0]).join('') || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{member.full_name || 'Unbekannt'}</p>
                              {member.role && (
                                <p className="text-xs text-muted-foreground">{member.role}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Risks */}
            <Collapsible open={expandedSections.has('risks')} onOpenChange={() => toggleSection('risks')}>
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-primary" />
                        Risiken ({roadmap.risks.length})
                      </CardTitle>
                      <ChevronDown className={`h-4 w-4 transition-transform ${expandedSections.has('risks') ? 'rotate-180' : ''}`} />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    {roadmap.risks.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">Keine Risiken dokumentiert</p>
                    ) : (
                      <div className="space-y-3">
                        {roadmap.risks.map((risk) => (
                          <div key={risk.id} className="p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <p className="text-sm font-medium">{risk.title}</p>
                              {getRiskBadge(risk.severity)}
                            </div>
                            {risk.description && (
                              <p className="text-xs text-muted-foreground mb-2">{risk.description}</p>
                            )}
                            {risk.mitigation && (
                              <p className="text-xs text-green-700 bg-green-50 p-2 rounded">
                                <strong>Mitigation:</strong> {risk.mitigation}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Updates / Comments */}
            <Collapsible open={expandedSections.has('updates')} onOpenChange={() => toggleSection('updates')}>
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Activity className="h-4 w-4 text-primary" />
                        Updates ({roadmap.comments.length})
                      </CardTitle>
                      <ChevronDown className={`h-4 w-4 transition-transform ${expandedSections.has('updates') ? 'rotate-180' : ''}`} />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    {roadmap.comments.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">Keine Updates vorhanden</p>
                    ) : (
                      <div className="space-y-3">
                        {roadmap.comments.slice(0, 5).map((comment) => (
                          <div key={comment.id} className="border-l-2 border-primary/30 pl-3">
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(comment.created_at), 'dd.MM.yyyy HH:mm', { locale: de })}
                            </p>
                            <p className="text-sm">{comment.content}</p>
                            {comment.author_name && (
                              <p className="text-xs text-muted-foreground">von {comment.author_name}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      {showEditDialog && (
        <EditRoadmapDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          roadmap={roadmap}
        />
      )}
    </div>
  );
};

export default RoadmapDetailPage;
