import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Plus, Search, Lock, FileText, Users, Calendar, MessageSquare, Zap } from "lucide-react";
import { Survey } from "../PulseSurveysDashboard";
import { CreateSurveyDialog } from "../dialogs/CreateSurveyDialog";
import { usePulseSurveys } from "@/hooks/usePulseSurveys";

const quickTemplates = [
  { name: 'Engagement Survey', icon: FileText, color: 'bg-blue-100 text-blue-600' },
  { name: 'Zufriedenheitsumfrage', icon: Users, color: 'bg-green-100 text-green-600' },
  { name: 'Pulse Survey', icon: Zap, color: 'bg-violet-100 text-violet-600' },
  { name: 'Führungskräftefeedback', icon: MessageSquare, color: 'bg-orange-100 text-orange-600' },
  { name: 'Onboarding-Feedback', icon: Calendar, color: 'bg-cyan-100 text-cyan-600' },
  { name: 'Offboarding-Feedback', icon: FileText, color: 'bg-red-100 text-red-600' },
];

interface SurveysListTabProps {
  onViewSurvey: (survey: Survey) => void;
}

export const SurveysListTab = ({ onViewSurvey }: SurveysListTabProps) => {
  const { surveys, isLoading } = usePulseSurveys();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700 border-green-200">Aktiv</Badge>;
      case 'planned':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Geplant</Badge>;
      case 'completed':
        return <Badge className="bg-gray-100 text-gray-700 border-gray-200">Abgeschlossen</Badge>;
      case 'draft':
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Entwurf</Badge>;
      default:
        return null;
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-violet-500';
      case 'planned': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'draft': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  // Konvertiere DB-Surveys zu Survey-Format und filtere
  const filteredSurveys = surveys.map((s: any) => ({
    id: s.id,
    name: s.title || s.name || 'Unbenannte Umfrage',
    type: s.survey_type || 'Pulse Survey',
    status: s.status || 'draft',
    isAnonymous: s.is_anonymous ?? true,
    startDate: s.start_date || '',
    endDate: s.end_date || '',
    targetGroup: s.target_audience || 'Alle Mitarbeiter',
    totalParticipants: s.total_participants || 0,
    completedResponses: s.completed_responses || 0,
    lastActivity: s.updated_at ? new Date(s.updated_at).toLocaleDateString('de-DE') : '—',
    description: s.description || '',
    questions: s.questions || []
  } as Survey)).filter(survey => {
    if (statusFilter !== 'all' && survey.status !== statusFilter) return false;
    if (typeFilter !== 'all' && survey.type !== typeFilter) return false;
    if (searchQuery && !survey.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Umfragen</h2>
          <p className="text-sm text-muted-foreground">Verwalten Sie alle Mitarbeiterumfragen</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="bg-violet-600 hover:bg-violet-700">
          <Plus className="h-4 w-4 mr-2" />
          Neue Umfrage
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Umfrage suchen..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Alle Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            <SelectItem value="active">Aktiv</SelectItem>
            <SelectItem value="planned">Geplant</SelectItem>
            <SelectItem value="completed">Abgeschlossen</SelectItem>
            <SelectItem value="draft">Entwurf</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Alle Typen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Typen</SelectItem>
            <SelectItem value="Engagement Survey">Engagement Survey</SelectItem>
            <SelectItem value="Pulse Survey">Pulse Survey</SelectItem>
            <SelectItem value="Führungskräftefeedback">Führungskräftefeedback</SelectItem>
            <SelectItem value="Onboarding-Feedback">Onboarding-Feedback</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Survey Cards */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : filteredSurveys.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Keine Umfragen vorhanden</h3>
              <p className="text-muted-foreground mb-4">
                Erstellen Sie Ihre erste Umfrage, um Feedback von Ihren Mitarbeitern zu sammeln.
              </p>
              <Button onClick={() => setCreateDialogOpen(true)} className="bg-violet-600 hover:bg-violet-700">
                <Plus className="h-4 w-4 mr-2" />
                Erste Umfrage erstellen
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredSurveys.map((survey) => (
            <Card key={survey.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{survey.name}</h3>
                    {getStatusBadge(survey.status)}
                    {survey.isAnonymous && (
                      <Badge variant="outline" className="text-xs">
                        <Lock className="h-3 w-3 mr-1" />
                        Anonym
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{survey.type}</p>
                
                <div className="grid grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Zeitraum</p>
                    <p className="font-medium">
                      {survey.startDate && survey.endDate 
                        ? `${survey.startDate} - ${survey.endDate}`
                        : 'Nicht festgelegt'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Zielgruppe</p>
                    <p className="font-medium">{survey.targetGroup}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Teilnahme</p>
                    <p className="font-medium">{survey.completedResponses} / {survey.totalParticipants}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Letzte Aktivität</p>
                    <p className="font-medium">{survey.lastActivity}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 mr-4">
                    <span className="text-sm text-muted-foreground">Rücklaufquote</span>
                    <Progress 
                      value={survey.totalParticipants > 0 ? (survey.completedResponses / survey.totalParticipants) * 100 : 0} 
                      className={`flex-1 h-2 [&>div]:${getProgressColor(survey.status)}`}
                    />
                    <span className="text-sm font-medium">
                      {survey.totalParticipants > 0 
                        ? Math.round((survey.completedResponses / survey.totalParticipants) * 100) 
                        : 0}%
                    </span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-violet-600 border-violet-200 hover:bg-violet-50"
                    onClick={() => onViewSurvey(survey)}
                  >
                    Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Quick Start Templates */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Schnellstart Vorlagen</h3>
        <div className="grid grid-cols-3 gap-4">
          {quickTemplates.map((template) => (
            <Card 
              key={template.name} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setCreateDialogOpen(true)}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg ${template.color} flex items-center justify-center`}>
                  <template.icon className="h-5 w-5" />
                </div>
                <span className="font-medium">{template.name}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <CreateSurveyDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </div>
  );
};
