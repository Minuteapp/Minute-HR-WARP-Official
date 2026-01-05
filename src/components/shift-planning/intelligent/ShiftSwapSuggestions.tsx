import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  RefreshCw, 
  Users, 
  Clock, 
  CheckCircle,
  ArrowRightLeft,
  Star,
  TrendingUp,
  Shuffle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SwapSuggestion {
  id: string;
  employee1: {
    id: string;
    name: string;
    currentShift: string;
    preferredShift?: string;
  };
  employee2: {
    id: string;
    name: string;
    currentShift: string;
    preferredShift?: string;
  };
  date: string;
  reason: string;
  benefitScore: number;
  qualificationMatch: boolean;
  workloadImprovement: boolean;
  preferenceMatch: boolean;
  status: 'suggested' | 'approved' | 'declined';
}

const ShiftSwapSuggestions: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Lade echte Swap-Vorschläge aus der Datenbank
  const { data: suggestions = [], isLoading } = useQuery({
    queryKey: ['shift-swap-suggestions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shift_swap_requests')
        .select(`
          *,
          requester:profiles!shift_swap_requests_requester_id_fkey(id, display_name),
          target:profiles!shift_swap_requests_target_id_fkey(id, display_name)
        `)
        .eq('is_ai_suggestion', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((swap: any) => ({
        id: swap.id,
        employee1: {
          id: swap.requester?.id || swap.requester_id,
          name: swap.requester?.display_name || 'Unbekannt',
          currentShift: swap.requester_shift_description || '',
          preferredShift: swap.requester_preferred_shift
        },
        employee2: {
          id: swap.target?.id || swap.target_id,
          name: swap.target?.display_name || 'Unbekannt',
          currentShift: swap.target_shift_description || '',
          preferredShift: swap.target_preferred_shift
        },
        date: swap.swap_date,
        reason: swap.reason || 'KI-Optimierungsvorschlag',
        benefitScore: swap.benefit_score || 0,
        qualificationMatch: swap.qualification_match || false,
        workloadImprovement: swap.workload_improvement || false,
        preferenceMatch: swap.preference_match || false,
        status: swap.status || 'suggested'
      }));
    }
  });

  const approveMutation = useMutation({
    mutationFn: async (suggestionId: string) => {
      const { error } = await supabase
        .from('shift_swap_requests')
        .update({ status: 'approved', approved_at: new Date().toISOString() })
        .eq('id', suggestionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift-swap-suggestions'] });
      toast({
        title: "Schichttausch genehmigt",
        description: "Die Schichten wurden erfolgreich getauscht."
      });
    }
  });

  const declineMutation = useMutation({
    mutationFn: async (suggestionId: string) => {
      const { error } = await supabase
        .from('shift_swap_requests')
        .update({ status: 'declined' })
        .eq('id', suggestionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift-swap-suggestions'] });
      toast({
        title: "Vorschlag abgelehnt",
        description: "Der Schichttausch-Vorschlag wurde abgelehnt."
      });
    }
  });

  const getBenefitColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('de-DE', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const openSuggestions = suggestions.filter((s: SwapSuggestion) => s.status === 'suggested');
  const approvedSuggestions = suggestions.filter((s: SwapSuggestion) => s.status === 'approved');
  const avgBenefitScore = suggestions.length > 0 
    ? Math.round(suggestions.reduce((acc: number, s: SwapSuggestion) => acc + s.benefitScore, 0) / suggestions.length) 
    : 0;
  const preferenceMatches = suggestions.filter((s: SwapSuggestion) => s.preferenceMatch).length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Schichttausch-Vorschläge</h3>
            <p className="text-muted-foreground">Intelligente Tauschoptimierung für bessere Arbeitsverteilung</p>
          </div>
        </div>
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="h-8 bg-muted rounded w-1/2 mx-auto mb-2"></div>
                <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Schichttausch-Vorschläge</h3>
            <p className="text-muted-foreground">Intelligente Tauschoptimierung für bessere Arbeitsverteilung</p>
          </div>
          <Button>
            <RefreshCw className="h-4 w-4 mr-2" />
            Neue Vorschläge generieren
          </Button>
        </div>

        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <Shuffle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Keine Vorschläge vorhanden</h3>
            <p className="text-sm text-muted-foreground max-w-md mb-4">
              Sobald Schichtpläne erstellt wurden, analysiert die KI mögliche Optimierungen und schlägt Tausche vor.
            </p>
            <Button>
              <RefreshCw className="h-4 w-4 mr-2" />
              Analyse starten
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Schichttausch-Vorschläge</h3>
          <p className="text-muted-foreground">Intelligente Tauschoptimierung für bessere Arbeitsverteilung</p>
        </div>
        <Button>
          <RefreshCw className="h-4 w-4 mr-2" />
          Neue Vorschläge generieren
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {openSuggestions.length}
            </div>
            <div className="text-sm text-muted-foreground">Offene Vorschläge</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {approvedSuggestions.length}
            </div>
            <div className="text-sm text-muted-foreground">Genehmigte Tausche</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {avgBenefitScore}
            </div>
            <div className="text-sm text-muted-foreground">Ø Nutzen-Score</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {preferenceMatches}
            </div>
            <div className="text-sm text-muted-foreground">Präferenz-Matches</div>
          </CardContent>
        </Card>
      </div>

      {/* Swap Suggestions */}
      <div className="space-y-4">
        {suggestions.map((suggestion: SwapSuggestion) => (
          <Card key={suggestion.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowRightLeft className="h-5 w-5" />
                    Schichttausch für {formatDate(suggestion.date)}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {suggestion.reason}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className={`text-lg font-bold ${getBenefitColor(suggestion.benefitScore)}`}>
                      {suggestion.benefitScore}%
                    </div>
                    <div className="text-xs text-muted-foreground">Nutzen</div>
                  </div>
                  <Star className={`h-5 w-5 ${suggestion.benefitScore >= 90 ? 'text-yellow-500' : 'text-muted-foreground/30'}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Employee Swap Visualization */}
              <div className="flex items-center justify-between bg-muted/50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{getInitials(suggestion.employee1.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{suggestion.employee1.name}</div>
                    <div className="text-sm text-muted-foreground">{suggestion.employee1.currentShift}</div>
                    {suggestion.employee1.preferredShift && (
                      <div className="text-xs text-blue-600">
                        Präferenz: {suggestion.employee1.preferredShift}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <ArrowRightLeft className="h-6 w-6 text-primary" />
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-medium">{suggestion.employee2.name}</div>
                    <div className="text-sm text-muted-foreground">{suggestion.employee2.currentShift}</div>
                    {suggestion.employee2.preferredShift && (
                      <div className="text-xs text-blue-600">
                        Präferenz: {suggestion.employee2.preferredShift}
                      </div>
                    )}
                  </div>
                  <Avatar>
                    <AvatarFallback>{getInitials(suggestion.employee2.name)}</AvatarFallback>
                  </Avatar>
                </div>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className={`h-4 w-4 ${suggestion.qualificationMatch ? 'text-green-600' : 'text-muted-foreground/30'}`} />
                  <span className="text-sm">Qualifikations-Match</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className={`h-4 w-4 ${suggestion.workloadImprovement ? 'text-green-600' : 'text-muted-foreground/30'}`} />
                  <span className="text-sm">Arbeitsbelastung</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className={`h-4 w-4 ${suggestion.preferenceMatch ? 'text-green-600' : 'text-muted-foreground/30'}`} />
                  <span className="text-sm">Präferenz-Match</span>
                </div>
              </div>

              {/* Actions */}
              {suggestion.status === 'suggested' && (
                <div className="flex gap-2 pt-2">
                  <Button 
                    size="sm"
                    onClick={() => approveMutation.mutate(suggestion.id)}
                    disabled={approveMutation.isPending}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Tausch genehmigen
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => declineMutation.mutate(suggestion.id)}
                    disabled={declineMutation.isPending}
                  >
                    Ablehnen
                  </Button>
                </div>
              )}

              {suggestion.status === 'approved' && (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Tausch durchgeführt
                </Badge>
              )}

              {suggestion.status === 'declined' && (
                <Badge variant="outline" className="text-muted-foreground">
                  Abgelehnt
                </Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ShiftSwapSuggestions;
