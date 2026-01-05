import { Progress } from "@/components/ui/progress";

interface PulseDepartmentBarProps {
  department: string;
  employeeCount: number;
  satisfaction: number;
  engagement: number;
}

export const PulseDepartmentBar = ({
  department,
  employeeCount,
  satisfaction,
  engagement,
}: PulseDepartmentBarProps) => {
  return (
    <div className="space-y-2 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold">{department}</h4>
          <p className="text-sm text-muted-foreground">{employeeCount} Mitarbeiter</p>
        </div>
      </div>
      <div className="space-y-2">
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Zufriedenheit</span>
            <span className="font-medium">{satisfaction}%</span>
          </div>
          <Progress value={satisfaction} className="h-2" />
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Engagement</span>
            <span className="font-medium">{engagement}%</span>
          </div>
          <Progress value={engagement} className="h-2" />
        </div>
      </div>
    </div>
  );
};
