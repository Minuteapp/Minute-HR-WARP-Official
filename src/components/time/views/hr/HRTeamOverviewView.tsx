import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, TrendingUp, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const teamStats = [
  { label: 'Aktive Mitarbeiter', value: '--', icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  { label: 'Ø Arbeitsstunden/Woche', value: '--', icon: Clock, color: 'text-green-600', bgColor: 'bg-green-50' },
  { label: 'Produktivität', value: '--', icon: TrendingUp, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  { label: 'Offene Anträge', value: '--', icon: AlertCircle, color: 'text-orange-600', bgColor: 'bg-orange-50' },
];

const departments: Array<{ name: string; employees: number; avgHours: number; productivity: number }> = [];

const HRTeamOverviewView = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Team-Übersicht</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {teamStats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Departments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Abteilungsübersicht</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Abteilung</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Mitarbeiter</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Ø Stunden/Woche</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Produktivität</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((dept) => (
                  <tr key={dept.name} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">{dept.name}</td>
                    <td className="py-3 px-4">{dept.employees}</td>
                    <td className="py-3 px-4">{dept.avgHours.toFixed(1)}h</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Progress value={dept.productivity} className="w-20 h-2" />
                        <span className="text-sm">{dept.productivity}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HRTeamOverviewView;
