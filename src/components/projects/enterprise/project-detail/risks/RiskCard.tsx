
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, User, MessageSquare, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface RiskCardProps {
  risk: any;
}

export const RiskCard = ({ risk }: RiskCardProps) => {
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge className="bg-red-500 text-white hover:bg-red-500">Kritisch</Badge>;
      case 'high':
        return <Badge className="bg-orange-500 text-white hover:bg-orange-500">Hoch</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500 text-white hover:bg-yellow-500">Mittel</Badge>;
      case 'low':
        return <Badge className="bg-green-500 text-white hover:bg-green-500">Niedrig</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in-progress':
      case 'in_progress':
        return <Badge variant="outline" className="border-gray-300">In Bearbeitung</Badge>;
      case 'mitigated':
        return <Badge className="bg-green-100 text-green-600 border border-green-200 hover:bg-green-100">Mitigiert</Badge>;
      case 'open':
        return <Badge variant="outline" className="border-gray-300">Offen</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const probability = risk.probability || 0;
  const impact = risk.impact || 0;
  const riskScore = risk.risk_score || (probability * impact);
  const isHighRisk = riskScore >= 70;

  return (
    <Card className="bg-white border border-gray-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <h4 className="font-semibold">{risk.title || risk.name}</h4>
              {risk.description && (
                <p className="text-sm text-muted-foreground mt-1">{risk.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getSeverityBadge(risk.severity)}
            {getStatusBadge(risk.status)}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Bearbeiten</DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">Löschen</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-muted-foreground">Wahrscheinlichkeit</span>
              <span className="text-sm font-medium">{probability}/10</span>
            </div>
            <Progress value={probability * 10} className="h-2 [&>div]:bg-gray-900" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-muted-foreground">Auswirkung</span>
              <span className="text-sm font-medium">{impact}/10</span>
            </div>
            <Progress value={impact * 10} className="h-2 [&>div]:bg-gray-900" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-muted-foreground">Risiko-Score</span>
              <span className={`text-sm font-medium ${isHighRisk ? 'text-red-500' : ''}`}>
                {riskScore}/100
              </span>
            </div>
            <Progress value={riskScore} className="h-2 [&>div]:bg-gray-900" />
          </div>
        </div>

        {risk.mitigation && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-start gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Maßnahme & Strategie</p>
                <p className="text-sm mt-1">{risk.mitigation}</p>
              </div>
            </div>
          </div>
        )}

        {risk.responsible && (
          <div className="mt-4 flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Verantwortlich:</span>
            <span>{risk.responsible}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
