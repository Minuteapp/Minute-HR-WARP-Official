
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Award, Check, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export function BonusRecommendations() {
  const { toast } = useToast();
  
  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['bonus-recommendations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bonus_recommendations')
        .select(`
          *,
          employees (
            first_name,
            last_name,
            position,
            department
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const handleApprove = async (id: string) => {
    const { error } = await supabase
      .from('bonus_recommendations')
      .update({ 
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: (await supabase.auth.getUser()).data.user?.id
      })
      .eq('id', id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Bonus konnte nicht genehmigt werden."
      });
    } else {
      toast({
        title: "Bonus genehmigt",
        description: "Die Bonusempfehlung wurde erfolgreich genehmigt."
      });
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Lade Bonusempfehlungen...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          KI-Bonusempfehlungen
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations?.map((rec) => (
            <div key={rec.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
              <div className="space-y-1">
                <div className="font-medium">
                  {rec.employees.first_name} {rec.employees.last_name}
                </div>
                <div className="text-sm text-muted-foreground">
                  {rec.employees.position} • {rec.employees.department}
                </div>
                <div className="text-sm">
                  Empfohlener Bonus: {new Intl.NumberFormat('de-DE', { 
                    style: 'currency', 
                    currency: rec.currency 
                  }).format(rec.amount)}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant={
                  rec.status === 'approved' ? 'default' :
                  rec.status === 'rejected' ? 'destructive' :
                  'secondary'
                }>
                  {rec.status === 'approved' ? 'Genehmigt' :
                   rec.status === 'rejected' ? 'Abgelehnt' :
                   'Ausstehend'}
                </Badge>
                {rec.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleApprove(rec.id)}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Genehmigen
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="text-destructive"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Ablehnen
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {(!recommendations || recommendations.length === 0) && (
            <div className="text-center text-muted-foreground p-8">
              Keine Bonusempfehlungen verfügbar
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
