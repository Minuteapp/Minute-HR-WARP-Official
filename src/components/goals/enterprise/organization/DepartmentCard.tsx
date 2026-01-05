import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronRight, Target } from "lucide-react";
import { TeamCard } from "./TeamCard";
import { cn } from "@/lib/utils";

interface Employee {
  id: string;
  name: string;
  goalCount: number;
  averageProgress: number;
  goals?: Array<{
    id: string;
    title: string;
    progress: number;
    status: string;
  }>;
}

interface Team {
  id: string;
  name: string;
  memberCount: number;
  employees: Employee[];
}

interface DepartmentCardProps {
  name: string;
  employeeCount: number;
  managerName: string;
  teamCount: number;
  teams: Team[];
  showGoals?: boolean;
}

export const DepartmentCard = ({ 
  name, 
  employeeCount, 
  managerName, 
  teamCount, 
  teams,
  showGoals = false 
}: DepartmentCardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="bg-green-50 border-green-200">
        <CollapsibleTrigger className="w-full">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <ChevronRight className={cn(
                "h-4 w-4 transition-transform text-muted-foreground",
                isOpen && "rotate-90"
              )} />
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold">{name}</p>
                <p className="text-sm text-muted-foreground">~{employeeCount} MA</p>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <p>{managerName}</p>
                <p>{teamCount} Teams</p>
              </div>
            </div>
          </CardContent>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-3 pl-12">
            {teams.map((team) => (
              <TeamCard
                key={team.id}
                name={team.name}
                memberCount={team.memberCount}
                employees={team.employees}
                showGoals={showGoals}
              />
            ))}
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
