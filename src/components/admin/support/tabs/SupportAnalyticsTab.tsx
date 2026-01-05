import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, TrendingUp, AlertCircle } from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const ticketsByModuleData = [
  { name: "Workforce Planning", value: 140 },
  { name: "Schichtplanung", value: 120 },
  { name: "Zeiterfassung", value: 85 },
  { name: "Urlaubsverwaltung", value: 65 },
  { name: "Admin", value: 50 },
  { name: "Berichte", value: 40 },
];

const solutionTimeTrendData = [
  { name: "KW 46", value: 7.2 },
  { name: "KW 47", value: 6.8 },
  { name: "KW 48", value: 6.5 },
  { name: "KW 49", value: 6.0 },
  { name: "KW 50", value: 6.2 },
];

const ticketsByPriorityData = [
  { name: "Critical", value: 8, color: "#ef4444" },
  { name: "High", value: 34, color: "#f97316" },
  { name: "Medium", value: 89, color: "#8b5cf6" },
  { name: "Low", value: 47, color: "#9ca3af" },
];

const supportLoadByReleaseData = [
  { name: "v2.3.0", value: 45 },
  { name: "v2.3.5", value: 62 },
  { name: "v2.4.0", value: 78 },
  { name: "v2.4.1", value: 35 },
];

const topClientsData = [
  { name: "Retail Excellence GmbH", tickets: 23, avgSolution: "5.2 h" },
  { name: "Manufacturing Pro AG", tickets: 18, avgSolution: "6.1 h" },
  { name: "Tech Innovations Ltd", tickets: 15, avgSolution: "4.3 h" },
  { name: "Healthcare Services GmbH", tickets: 12, avgSolution: "3.8 h" },
  { name: "Consulting Pro AG", tickets: 11, avgSolution: "5.9 h" },
];

const recurringProblemsData = [
  { problem: "Schichtplanung – Speicherfehler", status: "In Bearbeitung", count: 18, statusColor: "bg-violet-100 text-violet-700" },
  { problem: "Workforce Planning – Export-Probleme", status: "Wird untersucht", count: 14, statusColor: "bg-orange-100 text-orange-700" },
  { problem: "Login – 2FA-Probleme", status: "Gelöst", count: 12, statusColor: "bg-green-100 text-green-700" },
  { problem: "Admin – Nutzer können nicht hinzugefügt werden", status: "In Bearbeitung", count: 9, statusColor: "bg-violet-100 text-violet-700" },
  { problem: "Zeiterfassung – Rundungsfehler", status: "Gelöst", count: 7, statusColor: "bg-green-100 text-green-700" },
];

const SupportAnalyticsTab = () => {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ø Lösungszeit (Monat)</p>
                <p className="text-3xl font-bold mt-1">6,2 h</p>
                <div className="flex items-center gap-1 mt-2 text-green-600 text-sm">
                  <TrendingDown className="w-4 h-4" />
                  <span>-12%</span>
                </div>
              </div>
              <div className="p-3 bg-violet-100 rounded-full">
                <TrendingDown className="w-6 h-6 text-violet-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tickets (Monat)</p>
                <p className="text-3xl font-bold mt-1">178</p>
                <div className="flex items-center gap-1 mt-2 text-green-600 text-sm">
                  <TrendingUp className="w-4 h-4" />
                  <span>+8%</span>
                </div>
              </div>
              <div className="p-3 bg-violet-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-violet-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Wiederkehrende Probleme</p>
                <p className="text-3xl font-bold mt-1">18</p>
                <span className="inline-block mt-2 px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                  Handlungsbedarf
                </span>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Tickets nach Modul</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={ticketsByModuleData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={60} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Lösungszeit-Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={solutionTimeTrendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis unit=" h" />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: "#8b5cf6", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Tickets nach Priorität</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={ticketsByPriorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {ticketsByPriorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Support-Load nach Release</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={supportLoadByReleaseData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Top Mandanten (Tickets)</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-muted-foreground border-b">
                  <th className="pb-3 font-medium">Mandant</th>
                  <th className="pb-3 font-medium text-right">Tickets</th>
                  <th className="pb-3 font-medium text-right">Ø Lösung</th>
                </tr>
              </thead>
              <tbody>
                {topClientsData.map((client, index) => (
                  <tr key={index} className="border-b last:border-0">
                    <td className="py-3 text-sm">{client.name}</td>
                    <td className="py-3 text-sm text-right font-medium">{client.tickets}</td>
                    <td className="py-3 text-sm text-right text-muted-foreground">{client.avgSolution}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Wiederkehrende Probleme</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recurringProblemsData.map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.problem}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${item.statusColor}`}>
                      {item.status}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">{item.count}x</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SupportAnalyticsTab;
