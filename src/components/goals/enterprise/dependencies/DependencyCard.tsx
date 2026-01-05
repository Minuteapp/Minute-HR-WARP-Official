import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { DependencyTypeBadge } from "./DependencyTypeBadge";
import { DependencyImpactBadge } from "./DependencyImpactBadge";

interface DependencyCardProps {
  sourceGoal: {
    title: string;
    owner: string;
    progress: number;
  };
  targetGoal: {
    title: string;
    owner: string;
    progress: number;
  };
  dependencyType: 'blocks' | 'enables' | 'influences';
  impactLevel: 'low' | 'medium' | 'high';
}

export const DependencyCard = ({
  sourceGoal,
  targetGoal,
  dependencyType,
  impactLevel
}: DependencyCardProps) => {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <DependencyTypeBadge type={dependencyType} />
          <DependencyImpactBadge level={impactLevel} />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <p className="font-medium text-foreground">{sourceGoal.title}</p>
          <p className="text-sm text-muted-foreground">{sourceGoal.owner}</p>
        </div>
        
        <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        
        <div className="flex-1">
          <p className="font-medium text-foreground">{targetGoal.title}</p>
          <p className="text-sm text-muted-foreground">{targetGoal.owner}</p>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="text-center">
            <p className="text-muted-foreground">Quelle</p>
            <p className="font-semibold text-foreground">{sourceGoal.progress}%</p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground">Ziel</p>
            <p className="font-semibold text-foreground">{targetGoal.progress}%</p>
          </div>
        </div>
      </div>
    </Card>
  );
};
