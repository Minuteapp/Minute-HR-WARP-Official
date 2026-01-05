import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";

const EmployeeTimeProjects = () => {
  const projects: Array<{ name: string; hours: number; percent: number; color: string }> = [];

  const chartData = projects.map(p => ({ name: p.name, hours: p.hours }));

  return (
    <div className="space-y-6">
      {/* Projekt-Zuordnungen */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Projekt-Zuordnungen (Diese Woche)</h3>
        <div className="space-y-4">
          {projects.map((project, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{project.name}</span>
                <span className="text-gray-600">{project.hours}h ({project.percent}%)</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${project.color}`}
                  style={{ width: `${project.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Projektverteilung Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Projektverteilung</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData} layout="vertical">
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12 }} />
            <Bar dataKey="hours" fill="#3b82f6" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

export default EmployeeTimeProjects;
