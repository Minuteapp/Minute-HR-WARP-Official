import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Lightbulb, 
  TrendingUp, 
  Star, 
  MessageCircle, 
  Award,
  Brain,
  Target,
  BarChart3
} from "lucide-react";
import { useInnovation } from '@/hooks/useInnovation';

export const InnovationDashboard = () => {
  const { statistics, isLoading } = useInnovation();

  if (isLoading) {
    return <div className="p-6">Lade Dashboard...</div>;
  }

  if (!statistics) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-8 text-center">
          <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Keine Daten verfügbar</h3>
          <p className="text-muted-foreground">
            Das Dashboard wird angezeigt, sobald Innovationsdaten vorhanden sind.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive Ideen</CardTitle>
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.total_ideas}</div>
            <p className="text-xs text-muted-foreground">
              +{statistics.ideas_this_month} diesen Monat
            </p>
            <div className="mt-2">
              <Progress value={Math.min(100, (statistics.ideas_this_month / Math.max(1, statistics.total_ideas)) * 100)} className="h-1" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Implementiert</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.implemented_ideas}</div>
            <p className="text-xs text-muted-foreground">
              Umgesetzte Ideen
            </p>
            <div className="mt-2">
              <Progress value={Math.min(100, (statistics.implemented_ideas / Math.max(1, statistics.total_ideas)) * 100)} className="h-1" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pilotprojekte</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.active_pilot_projects}</div>
            <p className="text-xs text-muted-foreground">
              Aktive Projekte
            </p>
            <div className="mt-2">
              <Progress value={Math.min(100, statistics.active_pilot_projects * 10)} className="h-1" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Beteiligung</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.participation_rate}%</div>
            <p className="text-xs text-muted-foreground">
              Beteiligungsrate
            </p>
            <div className="mt-2">
              <Progress value={statistics.participation_rate} className="h-1" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            KI Insights & Predictive Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            KI Insights werden hier angezeigt, sobald genügend Daten verfügbar sind.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};