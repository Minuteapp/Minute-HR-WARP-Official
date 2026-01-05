import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Clock, TrendingUp } from "lucide-react";

interface SuccessionPositionCardProps {
  plan: any;
}

export const SuccessionPositionCard = ({ plan }: SuccessionPositionCardProps) => {
  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'critical':
        return <Badge variant="destructive">Kritisch</Badge>;
      case 'high':
        return <Badge variant="destructive" className="bg-orange-600">Hoch</Badge>;
      case 'medium':
        return <Badge variant="secondary">Mittel</Badge>;
      default:
        return <Badge variant="outline">Niedrig</Badge>;
    }
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    return parts.map(p => p[0]).join('').toUpperCase();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{plan.position}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{plan.department}</p>
            <p className="text-sm text-muted-foreground">Aktuell: {plan.currentHolder}</p>
          </div>
          <div className="flex items-center gap-2">
            {getRiskBadge(plan.risk)}
            {plan.isKeyPosition && (
              <Badge variant="outline" className="bg-blue-100 text-blue-800">
                Schlüsselposition
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {plan.candidates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-500" />
            <p>Keine Nachfolgekandidaten definiert</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h4 className="font-medium">Nachfolgekandidaten ({plan.candidates.length})</h4>
            <div className="grid gap-4">
              {plan.candidates.map((candidate: any, index: number) => (
                <div key={candidate.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(candidate.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{candidate.name}</p>
                        <p className="text-sm text-muted-foreground">{candidate.position}</p>
                      </div>
                      <Badge variant="outline" className="ml-2">
                        #{index + 1} Nachfolger
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Bereitschaft</span>
                        <span className="font-medium">{candidate.readiness}%</span>
                      </div>
                      <Progress value={candidate.readiness} className="h-2" />
                    </div>

                    {candidate.developmentPlan && candidate.developmentPlan.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {candidate.developmentPlan.map((item: string, i: number) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Zeit bis bereit</p>
              <p className="font-medium">{plan.timeToReady || '6-12 Monate'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Business Impact</p>
              <p className="font-medium">{plan.businessImpact || 'Hoch'}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
