import { useState } from "react";
import { usePulseSurveys } from "@/hooks/usePulseSurveys";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, Search, MoreVertical, Calendar, Users, ExternalLink } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateSurveyModal } from "../CreateSurveyModal";

const statusConfig = {
  draft: { label: 'Entwurf', color: 'bg-gray-100 text-gray-800' },
  active: { label: 'Aktiv', color: 'bg-green-100 text-green-800' },
  planned: { label: 'Geplant', color: 'bg-blue-100 text-blue-800' },
  closed: { label: 'Geschlossen', color: 'bg-red-100 text-red-800' },
  archived: { label: 'Archiviert', color: 'bg-gray-100 text-gray-600' },
};

const typeConfig = {
  mood_pulse: { label: 'Mood Pulse', icon: '📊' },
  quarterly_engagement: { label: 'Quarterly Engagement', icon: '📈' },
  leadership_check: { label: 'Leadership Check', icon: '👔' },
  wellbeing: { label: 'Wellbeing', icon: '💚' },
  onboarding: { label: 'Onboarding', icon: '🚀' },
  exit: { label: 'Exit Survey', icon: '👋' },
};

export const ManageSurveysTab = () => {
  const { surveys, isLoading } = usePulseSurveys();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filteredSurveys = surveys.filter(survey => {
    const matchesSearch = survey.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || survey.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return <div className="animate-pulse">Lade Umfragen...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Umfrage suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="min-w-[140px]">
                {statusFilter === 'all' ? 'Alle Status' : statusConfig[statusFilter as keyof typeof statusConfig]?.label}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                Alle Status
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('active')}>
                Aktiv
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('planned')}>
                Geplant
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('closed')}>
                Geschlossen
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('archived')}>
                Archiviert
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Neue Umfrage
        </Button>
      </div>

      <CreateSurveyModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />

      {/* Survey Cards Grid */}
      {filteredSurveys.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Keine Umfragen gefunden. Erstellen Sie eine neue Umfrage.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSurveys.map((survey) => {
            const typeInfo = typeConfig[survey.survey_type as keyof typeof typeConfig];
            const statusInfo = statusConfig[survey.status as keyof typeof statusConfig];
            const participation = null; // TODO: Aus pulse_survey_analytics laden

            return (
              <Card key={survey.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{typeInfo?.icon}</span>
                        <Badge variant="secondary" className="text-xs">
                          {typeInfo?.label}
                        </Badge>
                      </div>
                      <CardTitle className="text-base line-clamp-2">
                        {survey.title}
                      </CardTitle>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Bearbeiten</DropdownMenuItem>
                        <DropdownMenuItem>Duplizieren</DropdownMenuItem>
                        <DropdownMenuItem>Ergebnisse anzeigen</DropdownMenuItem>
                        <DropdownMenuItem>Schließen</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Löschen</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {survey.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {survey.description}
                    </p>
                  )}

                  <div className="space-y-2">
                    <Badge className={statusInfo.color}>
                      {statusInfo.label}
                    </Badge>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {survey.start_date 
                            ? new Date(survey.start_date).toLocaleDateString('de-DE')
                            : 'Kein Datum'
                          }
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>Alle Mitarbeiter</span>
                      </div>
                    </div>

                    {survey.status === 'active' && participation !== null && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Beteiligung</span>
                          <span className="font-medium">{participation}%</span>
                        </div>
                        <Progress value={participation} className="h-2" />
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t">
                    <Button
                      variant="link"
                      className="h-auto p-0 text-xs"
                      onClick={() => console.log('View results', survey.id)}
                    >
                      Ergebnisse
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
