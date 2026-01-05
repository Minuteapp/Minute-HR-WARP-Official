import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronRight, Users } from "lucide-react";
import { EmployeeCard } from "./EmployeeCard";
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

interface TeamCardProps {
  name: string;
  memberCount: number;
  employees: Employee[];
  showGoals?: boolean;
}

export const TeamCard = ({ name, memberCount, employees, showGoals = false }: TeamCardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="bg-pink-50 border-pink-200">
        <CollapsibleTrigger className="w-full">
          <CardContent className="py-3">
            <div className="flex items-center gap-3">
              <ChevronRight className={cn(
                "h-4 w-4 transition-transform text-muted-foreground",
                isOpen && "rotate-90"
              )} />
              <div className="p-2 bg-pink-100 rounded-lg">
                <Users className="h-4 w-4 text-pink-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium">{name}</p>
              </div>
              <span className="text-sm text-muted-foreground">{memberCount} Mitgl.</span>
            </div>
          </CardContent>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4">
            <div className="grid grid-cols-2 gap-3 pl-8">
              {employees.map((employee) => (
                <EmployeeCard
                  key={employee.id}
                  name={employee.name}
                  goalCount={employee.goalCount}
                  averageProgress={employee.averageProgress}
                  goals={employee.goals}
                  showGoals={showGoals}
                />
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
