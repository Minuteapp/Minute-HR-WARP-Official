import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart3, TrendingUp, TrendingDown } from "lucide-react";

interface CompetencyData {
  self: number;
  manager: number;
  peers: number;
  trend: number;
}

interface CompetencyComparisonProps {
  competencies: {
    [key: string]: CompetencyData;
  };
}

export const CompetencyComparison = ({ competencies }: CompetencyComparisonProps) => {
  const competencyLabels: { [key: string]: string } = {
    fachliche_kompetenz: "Fachliche Kompetenz",
    teamarbeit: "Teamarbeit",
    kommunikation: "Kommunikation",
    leadership: "Leadership",
    innovation: "Innovation",
  };

  const renderTrendBadge = (trend: number) => {
    if (trend === 0) return null;
    
    const isPositive = trend > 0;
    return (
      <Badge 
        variant={isPositive ? "default" : "destructive"} 
        className={`ml-2 ${isPositive ? 'bg-green-500' : 'bg-red-500'}`}
      >
        {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
        {isPositive ? '+' : ''}{trend.toFixed(1)}
      </Badge>
    );
  };

  const calculateAverage = (comp: CompetencyData) => {
    const values = [comp.self, comp.manager, comp.peers].filter(v => v != null);
    return values.reduce((a, b) => a + b, 0) / values.length;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Kompetenz-Bewertungen (Vergleich)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(competencies).map(([key, comp]) => {
          const average = calculateAverage(comp);
          
          return (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="font-medium">{competencyLabels[key]}</span>
                  {renderTrendBadge(comp.trend)}
                </div>
                <span className="text-sm font-semibold">Ø {average.toFixed(1)}</span>
              </div>
              
              <div className="space-y-1">
                {/* Self Assessment - Black */}
                <div className="flex items-center gap-2">
                  <div className="w-32 text-xs text-muted-foreground">Selbst</div>
                  <div className="flex-1">
                    <Progress 
                      value={(comp.self / 5) * 100} 
                      className="h-2"
                      indicatorClassName="bg-black"
                    />
                  </div>
                  <div className="w-12 text-right text-xs font-medium">{comp.self.toFixed(1)}</div>
                </div>
                
                {/* Manager Assessment - Blue */}
                <div className="flex items-center gap-2">
                  <div className="w-32 text-xs text-muted-foreground">Manager</div>
                  <div className="flex-1">
                    <Progress 
                      value={(comp.manager / 5) * 100} 
                      className="h-2"
                      indicatorClassName="bg-blue-500"
                    />
                  </div>
                  <div className="w-12 text-right text-xs font-medium">{comp.manager.toFixed(1)}</div>
                </div>
                
                {/* Peers Assessment - Purple */}
                <div className="flex items-center gap-2">
                  <div className="w-32 text-xs text-muted-foreground">Peers</div>
                  <div className="flex-1">
                    <Progress 
                      value={(comp.peers / 5) * 100} 
                      className="h-2"
                      indicatorClassName="bg-purple-500"
                    />
                  </div>
                  <div className="w-12 text-right text-xs font-medium">{comp.peers.toFixed(1)}</div>
                </div>
              </div>
            </div>
          );
        })}
        
        <div className="flex items-center justify-center gap-6 pt-4 border-t text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-black"></div>
            <span>Selbsteinschätzung</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Manager</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span>Peers</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
