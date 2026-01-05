import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ThumbsUp, CheckCircle, Sparkles, MessageSquare, Euro, Clock, User, Calendar, Users, Share2, Rocket, FlaskConical } from 'lucide-react';

interface IdeaDetailProps {
  idea: {
    id: string;
    titel: string;
    beschreibung: string;
    kategorie: string;
    status: string;
    votes: number;
    eingereichtVon: string;
    team: string;
    datum: string;
    betroffeneBereiche: string[];
    tags: string[];
    nutzen: {
      kosteneinsparung: string;
      qualitaet: string;
      zufriedenheit: string;
    };
    kiInsights: string[];
    experiment: {
      hypothese: string;
      dauer: string;
      budget: string;
      verantwortlich: string;
      kpis: string[];
      ergebnisse: string;
    };
    bewertung: {
      gesamt: number;
      dimensionen: Array<{ name: string; wert: number; max: number }>;
    };
    kommentare: Array<{ autor: string; text: string; datum: string }>;
  } | null;
  open: boolean;
  onClose: () => void;
}

const getProgressColor = (wert: number, max: number) => {
  const percent = (wert / max) * 100;
  if (percent >= 70) return 'bg-green-500';
  if (percent >= 40) return 'bg-orange-500';
  return 'bg-red-500';
};

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case 'umsetzung': return 'bg-green-500';
    case 'skaliert': return 'bg-green-600';
    case 'experiment': return 'bg-blue-500';
    case 'in bewertung': return 'bg-orange-500';
    case 'neu': return 'bg-purple-500';
    case 'abgelehnt': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

const PortfolioIdeaDetailDialog = ({ idea, open, onClose }: IdeaDetailProps) => {
  if (!idea) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0">
        <div className="flex">
          {/* Linke Spalte */}
          <div className="flex-1 p-6 border-r">
            {/* Zurück Button */}
            <Button variant="ghost" onClick={onClose} className="mb-4 -ml-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück
            </Button>

            {/* Header */}
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold">{idea.titel}</h2>
                <Badge variant="outline" className="flex items-center gap-1">
                  <ThumbsUp className="h-3 w-3" />
                  {idea.votes}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Badge className={`${getStatusBadgeColor(idea.status)} text-white border-0`}>
                  {idea.status}
                </Badge>
                <Badge variant="outline">{idea.kategorie}</Badge>
              </div>
            </div>

            {/* Beschreibung */}
            <p className="text-muted-foreground mb-4">{idea.beschreibung}</p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {idea.tags.map((tag) => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>

            {/* Erwarteter Nutzen */}
            <Card className="mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Euro className="h-4 w-4 text-green-600" />
                  Erwarteter Nutzen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Kosteneinsparung:</span>
                  <span className="font-medium text-green-600">{idea.nutzen.kosteneinsparung}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Qualität:</span>
                  <span>{idea.nutzen.qualitaet}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mitarbeiterzufriedenheit:</span>
                  <span>{idea.nutzen.zufriedenheit}</span>
                </div>
              </CardContent>
            </Card>

            {/* KI-Insights */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <span className="font-semibold text-purple-900">KI-Insights</span>
              </div>
              <ul className="space-y-2">
                {idea.kiInsights.map((insight, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-purple-700">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    {insight}
                  </li>
                ))}
              </ul>
            </div>

            {/* Experiment / Validierung */}
            <Card className="mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <FlaskConical className="h-4 w-4 text-purple-600" />
                  Experiment / Validierung
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-sm text-muted-foreground">Hypothese:</span>
                  <p className="text-sm font-medium">{idea.experiment.hypothese}</p>
                </div>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground block">Dauer</span>
                    <span className="font-medium">{idea.experiment.dauer}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Budget</span>
                    <span className="font-medium">{idea.experiment.budget}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Verantwortlich</span>
                    <span className="font-medium">{idea.experiment.verantwortlich}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">KPIs</span>
                    <div className="flex flex-wrap gap-1">
                      {idea.experiment.kpis.map((kpi) => (
                        <Badge key={kpi} variant="outline" className="text-xs">{kpi}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Ergebnisse */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-green-900 text-sm">Ergebnisse</span>
                  </div>
                  <p className="text-sm text-green-700">{idea.experiment.ergebnisse}</p>
                </div>
              </CardContent>
            </Card>

            {/* Diskussion */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Diskussion ({idea.kommentare.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {idea.kommentare.map((kommentar, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{kommentar.autor}</span>
                      <span className="text-xs text-muted-foreground">{kommentar.datum}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{kommentar.text}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Rechte Sidebar */}
          <div className="w-80 p-6 bg-gray-50">
            {/* Details */}
            <Card className="mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Eingereicht von:</span>
                  <span className="font-medium">{idea.eingereichtVon}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Team:</span>
                  <span className="font-medium">{idea.team}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Datum:</span>
                  <span className="font-medium">{idea.datum}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Betroffene Bereiche:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {idea.betroffeneBereiche.map((bereich) => (
                      <Badge key={bereich} variant="outline" className="text-xs">{bereich}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bewertungs-Score */}
            <Card className="mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Bewertungs-Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <span className="text-4xl font-bold text-purple-600">{idea.bewertung.gesamt}</span>
                  <span className="text-muted-foreground text-sm"> von 10 Punkten</span>
                </div>
                <div className="space-y-3">
                  {idea.bewertung.dimensionen.map((dim) => (
                    <div key={dim.name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">{dim.name}</span>
                        <span className="font-medium">{dim.wert}/{dim.max}</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${getProgressColor(dim.wert, dim.max)} rounded-full transition-all`}
                          style={{ width: `${(dim.wert / dim.max) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Aktionen */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Aktionen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Bewerten
                </Button>
                <Button variant="outline" className="w-full">
                  <FlaskConical className="h-4 w-4 mr-2" />
                  Experiment starten
                </Button>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Zur Umsetzung freigeben
                </Button>
                <Button variant="outline" className="w-full">
                  <Rocket className="h-4 w-4 mr-2" />
                  In Projekt umwandeln
                </Button>
                <Button variant="outline" className="w-full">
                  <Share2 className="h-4 w-4 mr-2" />
                  Teilen
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PortfolioIdeaDetailDialog;
