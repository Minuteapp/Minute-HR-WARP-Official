import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, TrendingUp } from "lucide-react";

interface SuccessionPlanningCardProps {
  succession: any;
}

export const SuccessionPlanningCard = ({ succession }: SuccessionPlanningCardProps) => {
  if (!succession) {
    return (
      <Card className="bg-orange-50 border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-600" />
            Nachfolgeplanung & Potenzial
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Keine Nachfolgeplanung definiert
          </p>
        </CardContent>
      </Card>
    );
  }

  const getTalentPoolLabel = (status: string) => {
    switch (status) {
      case "high_potential":
        return "🔥 High Potential";
      case "ready_for_leadership":
        return "Ready for Leadership";
      case "key_talent":
        return "Key Talent";
      default:
        return status;
    }
  };

  const getReadinessLabel = (status: string) => {
    switch (status) {
      case "ready_now":
        return "Ready Now";
      case "ready_1_year":
        return "Ready in 1 Jahr";
      case "ready_2_years":
        return "Ready in 2 Jahren";
      default:
        return status;
    }
  };

  const developmentSteps = Array.isArray(succession.development_steps)
    ? succession.development_steps
    : [];

  return (
    <Card className="bg-orange-50 border-orange-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-600" />
            Nachfolgeplanung & Potenzial
          </CardTitle>
          <Badge className="bg-orange-500">
            {getTalentPoolLabel(succession.talent_pool_status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Karrierepfad</div>
            <div className="font-semibold">{succession.career_track || "N/A"}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Nächste Position</div>
            <div className="font-semibold">{succession.next_position || "N/A"}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Bereitschaftsstatus</div>
            <Badge className="bg-green-500">
              {getReadinessLabel(succession.readiness_status)}
            </Badge>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Nachfolger für</div>
            <div className="font-semibold">
              {succession.successor_for_positions?.length || 0} Schlüsselpositionen
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Nächste Entwicklungsschritte
          </h4>
          <ul className="space-y-2">
            {developmentSteps.length > 0 ? (
              developmentSteps.map((step: any, idx: number) => (
                <li key={idx} className="text-sm flex items-start gap-2">
                  <span className="text-orange-600">•</span>
                  <span>
                    {step.step} <span className="text-muted-foreground">({step.timeline})</span>
                  </span>
                </li>
              ))
            ) : (
              <li className="text-sm text-muted-foreground">Keine Entwicklungsschritte definiert</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
