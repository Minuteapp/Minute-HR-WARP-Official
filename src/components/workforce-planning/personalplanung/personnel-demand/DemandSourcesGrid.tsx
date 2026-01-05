import { DemandSourceCard } from "./DemandSourceCard";
import { Briefcase, Target, Clock, Leaf, Users } from "lucide-react";

interface DemandSource {
  id: string;
  name: string;
  priority: 'high' | 'medium' | 'low';
  demandCount: number;
  fteTotal: number;
}

interface DemandSourcesGridProps {
  sources?: DemandSource[];
}

const defaultSources = [
  { id: '1', name: 'Projekte & Roadmap', icon: Briefcase, priority: 'high' as const },
  { id: '2', name: 'Strategie & OKRs', icon: Target, priority: 'high' as const },
  { id: '3', name: 'Schichtplanung', icon: Clock, priority: 'medium' as const },
  { id: '4', name: 'ESG & Compliance', icon: Leaf, priority: 'low' as const },
  { id: '5', name: 'Fluktuation (Ersatz)', icon: Users, priority: 'high' as const },
];

export const DemandSourcesGrid = ({ sources }: DemandSourcesGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {defaultSources.map((source) => {
        const data = sources?.find(s => s.id === source.id);
        return (
          <DemandSourceCard
            key={source.id}
            title={source.name}
            icon={source.icon}
            priority={data?.priority || source.priority}
            demandCount={data?.demandCount || 0}
            fteTotal={data?.fteTotal || 0}
          />
        );
      })}
    </div>
  );
};
