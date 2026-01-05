import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ProjectAllocation {
  name: string;
  hours: number;
  percentage: number;
}

const projectAllocations: ProjectAllocation[] = [];

const chartData = projectAllocations.map(p => ({
  name: p.name,
  hours: p.hours,
}));

const TeamMemberProjectsTab = () => {
  return (
    <div className="space-y-6">
      {/* Projekt-Zuordnungen */}
      <Card className="p-5">
        <h3 className="font-semibold mb-4">Projekt-Zuordnungen (Diese Woche)</h3>
        <div className="space-y-4">
          {projectAllocations.map((project, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">{project.name}</span>
                <span className="text-sm text-muted-foreground">{project.hours} h ({project.percentage}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={project.percentage} className="h-3 flex-1" />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Projektverteilung Chart */}
      <Card className="p-5">
        <h3 className="font-semibold mb-4">Projektverteilung</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 120 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis type="number" axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} width={110} />
              <Tooltip />
              <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default TeamMemberProjectsTab;
