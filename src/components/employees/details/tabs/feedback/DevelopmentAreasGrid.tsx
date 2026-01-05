import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Circle, ArrowRight, Target } from "lucide-react";

interface DevelopmentAreasGridProps {
  strengths: string[];
  areasForImprovement: string[];
  developmentGoals: string[];
}

export const DevelopmentAreasGrid = ({ 
  strengths, 
  areasForImprovement, 
  developmentGoals 
}: DevelopmentAreasGridProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Entwicklungsschwerpunkte
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stärken */}
          <div className="space-y-3">
            <h3 className="font-semibold text-green-600 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Stärken
            </h3>
            <ul className="space-y-2">
              {strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Entwicklungsfelder */}
          <div className="space-y-3">
            <h3 className="font-semibold text-orange-600 flex items-center gap-2">
              <Circle className="h-4 w-4" />
              Entwicklungsfelder
            </h3>
            <ul className="space-y-2">
              {areasForImprovement.map((area, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Circle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>{area}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Entwicklungsziele */}
          <div className="space-y-3">
            <h3 className="font-semibold text-blue-600 flex items-center gap-2">
              <ArrowRight className="h-4 w-4" />
              Entwicklungsziele
            </h3>
            <ul className="space-y-2">
              {developmentGoals.map((goal, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>{goal}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
