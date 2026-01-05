import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip } from "recharts";
import { Users, Calendar } from "lucide-react";

const DepartmentOverviewTab = () => {
  const weekData: Array<{ day: string; hours: number }> = [];

  const monthTrend: Array<{ month: string; hours: number; productivity: number }> = [];

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5 border-l-4 border-l-blue-500 bg-blue-50/50">
          <p className="text-sm font-medium text-muted-foreground">Mitarbeiter</p>
          <p className="text-3xl font-bold mt-2">--</p>
          <p className="text-sm text-emerald-600 mt-1">-- aktiv jetzt</p>
        </Card>

        <Card className="p-5 border-l-4 border-l-emerald-500 bg-emerald-50/50">
          <p className="text-sm font-medium text-muted-foreground">Monatsstunden</p>
          <p className="text-3xl font-bold mt-2">--</p>
          <p className="text-sm text-emerald-600 mt-1">Ø -- h/MA</p>
        </Card>

        <Card className="p-5 border-l-4 border-l-blue-400 bg-blue-50/30">
          <p className="text-sm font-medium text-muted-foreground">Projekte</p>
          <p className="text-3xl font-bold mt-2">--/--</p>
          <p className="text-sm text-emerald-600 mt-1">Aktiv</p>
        </Card>

        <Card className="p-5 border-l-4 border-l-orange-400 bg-orange-50/50">
          <p className="text-sm font-medium text-muted-foreground">Effizienz</p>
          <p className="text-3xl font-bold mt-2">--</p>
          <p className="text-sm text-red-500 mt-1">Zufriedenheit: --</p>
        </Card>
      </div>

      {/* Information Cards Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Abteilungs Informationen */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Abteilungs Informationen</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Beschreibung</p>
              <p className="font-medium">Verantwortlich für Software-Entwicklung und technische Innovation</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <Users className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Abteilungsleiter</p>
                  <p className="font-medium">Thomas Müller</p>
                  <p className="text-sm text-muted-foreground">thomas.mueller@company.com</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Gegründet</p>
                  <p className="font-medium">2015</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <Users className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Struktur</p>
                  <p className="font-medium">12 Team Leads</p>
                  <p className="text-sm text-muted-foreground">234 Senior, 610 Junior</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground">$</span>
                <div>
                  <p className="text-sm text-muted-foreground">Jahresbudget</p>
                  <p className="font-medium">€12.5M</p>
                  <p className="text-sm text-muted-foreground">68% genutzt</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Status */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Aktiv</Badge>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Budget Nutzung</span>
                <span className="font-medium">68%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gray-900 h-2 rounded-full" style={{ width: '68%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Mitarbeiter aktiv</span>
                <span className="font-medium">745 / 856</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gray-900 h-2 rounded-full" style={{ width: '87%' }} />
              </div>
            </div>

            <div>
              <span className="text-sm text-muted-foreground block mb-2">Standorte</span>
              <div className="flex gap-2">
                <Badge variant="outline">Berlin</Badge>
                <Badge variant="outline">München</Badge>
                <Badge variant="outline">Hamburg</Badge>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Wochenübersicht</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={weekData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Bar dataKey="hours" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">6-Monats Trend</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={monthTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                formatter={(value: number, name: string) => [
                  name === 'hours' ? `${value.toLocaleString()}` : `${value}`,
                  name === 'hours' ? 'Stunden' : 'Produktivität'
                ]}
              />
              <Line yAxisId="left" type="monotone" dataKey="hours" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }} />
              <Line yAxisId="right" type="monotone" dataKey="productivity" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};

export default DepartmentOverviewTab;
