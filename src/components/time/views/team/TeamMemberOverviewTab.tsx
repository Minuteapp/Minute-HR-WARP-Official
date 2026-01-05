import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Mail, Phone, Building2, Users, MapPin, UserCheck, Calendar, CheckSquare } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const weeklyData: Array<{ name: string; hours: number }> = [];

const monthlyData: Array<{ name: string; hours: number }> = [];

const TeamMemberOverviewTab = () => {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-white">
          <p className="text-sm font-medium text-muted-foreground">Heute</p>
          <p className="text-3xl font-bold mt-2">6.2 h</p>
          <p className="text-sm text-primary mt-1">Ø 7.8 h/Tag</p>
        </Card>

        <Card className="p-5 border-2 border-green-100 bg-gradient-to-br from-green-50 to-white">
          <p className="text-sm font-medium text-muted-foreground">Diese Woche</p>
          <p className="text-3xl font-bold mt-2">28.5 h</p>
          <p className="text-sm text-green-600 mt-1">von 40 h</p>
        </Card>

        <Card className="p-5 border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-white">
          <p className="text-sm font-medium text-muted-foreground">Dieser Monat</p>
          <p className="text-3xl font-bold mt-2">124.8 h</p>
          <p className="text-sm text-primary mt-1">+12.5 h Überstunden</p>
        </Card>

        <Card className="p-5 border-2 border-orange-100 bg-gradient-to-br from-orange-50 to-white">
          <p className="text-sm font-medium text-muted-foreground">Urlaub</p>
          <p className="text-3xl font-bold mt-2">12/18</p>
          <p className="text-sm text-destructive mt-1">6 Tage übrig</p>
        </Card>
      </div>

      {/* Personal Info & Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Persönliche Informationen */}
        <Card className="p-5 lg:col-span-2">
          <h3 className="font-semibold mb-4">Persönliche Informationen</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <Mail className="h-4 w-4 text-muted-foreground mt-1" />
              <div>
                <p className="text-sm text-muted-foreground">E-Mail</p>
                <p className="font-medium">anna.schmidt@company.com</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="h-4 w-4 text-muted-foreground mt-1" />
              <div>
                <p className="text-sm text-muted-foreground">Telefon</p>
                <p className="font-medium">+49 30 12345678</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Building2 className="h-4 w-4 text-muted-foreground mt-1" />
              <div>
                <p className="text-sm text-muted-foreground">Abteilung</p>
                <p className="font-medium">Engineering</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="h-4 w-4 text-muted-foreground mt-1" />
              <div>
                <p className="text-sm text-muted-foreground">Team</p>
                <p className="font-medium">Backend Team A</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
              <div>
                <p className="text-sm text-muted-foreground">Standort</p>
                <p className="font-medium">Berlin</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <UserCheck className="h-4 w-4 text-muted-foreground mt-1" />
              <div>
                <p className="text-sm text-muted-foreground">Vorgesetzter</p>
                <p className="font-medium">Thomas Müller</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
              <div>
                <p className="text-sm text-muted-foreground">Eintrittsdatum</p>
                <p className="font-medium">15.03.2020</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckSquare className="h-4 w-4 text-muted-foreground mt-1" />
              <div>
                <p className="text-sm text-muted-foreground">Vertragsart</p>
                <p className="font-medium">Vollzeit</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Aktueller Status */}
        <Card className="p-5">
          <h3 className="font-semibold mb-4">Aktueller Status</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Aktiv</Badge>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Wochenstunden</span>
                <span className="text-sm font-medium">28.5 / 40 h</span>
              </div>
              <Progress value={71} className="h-2" />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Überstunden</span>
              <span className="text-sm font-medium">+12.5 h</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Krankheitstage (Jahr)</span>
              <span className="text-sm font-medium">3 Tage</span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Arbeitstage</p>
              <div className="flex gap-1">
                {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((day, i) => (
                  <Badge
                    key={day}
                    variant={i < 5 ? "default" : "outline"}
                    className={i < 5 ? "bg-primary/10 text-primary hover:bg-primary/10" : ""}
                  >
                    {day}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wochenübersicht */}
        <Card className="p-5">
          <h3 className="font-semibold mb-4">Wochenübersicht</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Monatlicher Trend */}
        <Card className="p-5">
          <h3 className="font-semibold mb-4">Monatlicher Trend</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="hours" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TeamMemberOverviewTab;
