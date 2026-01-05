import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronDown, Users, Briefcase, TrendingUp } from "lucide-react";

interface OrgChartPersonCardProps {
  person: {
    id: string;
    name: string;
    initials: string;
    position: string;
    department: string;
    metrics: {
      employees: number;
      teams: number;
      performance: number;
    };
  };
  onClick?: () => void;
}

export const OrgChartPersonCard = ({ person, onClick }: OrgChartPersonCardProps) => {
  return (
    <div 
      className="bg-green-50 border-2 border-green-200 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-all min-w-[240px]"
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-12 w-12 border-2 border-green-300">
          <AvatarFallback className="bg-green-600 text-white font-semibold">
            {person.initials}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-green-900">{person.name}</h3>
              <p className="text-sm text-green-700">{person.position}</p>
              <p className="text-xs text-green-600">{person.department}</p>
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="mt-3 space-y-1 text-sm">
            <div className="flex items-center gap-2 text-green-800">
              <Users className="h-4 w-4" />
              <span>{person.metrics.employees.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 text-orange-600">
              <Briefcase className="h-4 w-4" />
              <span>{person.metrics.teams}</span>
            </div>
            <div className="flex items-center gap-2 text-blue-600">
              <TrendingUp className="h-4 w-4" />
              <span>{person.metrics.performance}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
