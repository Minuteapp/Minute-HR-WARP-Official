import { Card } from "@/components/ui/card";
import { Clock, Calendar, TrendingUp, Umbrella, Mail, Phone, Building, Users, MapPin, User, CalendarDays, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line } from "recharts";

const EmployeeTimeOverview = () => {
  const weekData: Array<{ day: string; hours: number }> = [];

  const monthData: Array<{ week: string; hours: number }> = [];

  return (
    <div className="space-y-6">
      {/* 4 Statistik-Karten */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Heute */}
        <Card className="border-l-4 border-l-blue-400 p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Heute</p>
              <p className="text-2xl font-bold mt-1">--</p>
              <p className="text-xs text-gray-500 mt-1">Ø -- h/Tag</p>
            </div>
            <Clock className="h-8 w-8 text-blue-500" />
          </div>
        </Card>

        {/* Diese Woche */}
        <Card className="border-l-4 border-l-yellow-400 p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Diese Woche</p>
              <p className="text-2xl font-bold mt-1">--</p>
              <p className="text-xs text-gray-500 mt-1">von -- h</p>
            </div>
            <Calendar className="h-8 w-8 text-orange-500" />
          </div>
        </Card>

        {/* Dieser Monat */}
        <Card className="border-l-4 border-l-gray-400 p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Dieser Monat</p>
              <p className="text-2xl font-bold mt-1">--</p>
              <p className="text-xs text-gray-500 mt-1">-- Überstunden</p>
            </div>
            <TrendingUp className="h-8 w-8 text-gray-600" />
          </div>
        </Card>

        {/* Urlaub */}
        <Card className="border-l-4 border-l-green-400 p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Urlaub</p>
              <p className="text-2xl font-bold mt-1">--/--</p>
              <p className="text-xs text-gray-500 mt-1">-- Tage übrig</p>
            </div>
            <Umbrella className="h-8 w-8 text-green-500" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Persönliche Informationen */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Persönliche Informationen</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">maximilian.kruger@company.de</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">+49 123 456789</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Building className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">Produktmanagement</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Users className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">Product Team A</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">Berlin</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <User className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">Julia Bauer</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <CalendarDays className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">01.03.2020</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <FileText className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">Vollzeit</span>
            </div>
          </div>
        </Card>

        {/* Aktueller Status */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Aktueller Status</h3>
          <div className="space-y-4">
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Aktiv</Badge>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Wochenstunden</span>
                <span className="font-medium">28.5 / 40 h</span>
              </div>
              <Progress value={71.3} className="h-2" />
            </div>

            <div className="flex justify-between text-sm py-3 border-t">
              <span className="text-gray-600">Überstunden</span>
              <span className="font-medium text-green-600">+12.5h</span>
            </div>

            <div className="flex justify-between text-sm py-3 border-t">
              <span className="text-gray-600">Krankheitstage (Jahr)</span>
              <span className="font-medium">3 Tage</span>
            </div>

            <div className="pt-3 border-t">
              <p className="text-sm text-gray-600 mb-2">Arbeitstage</p>
              <div className="flex gap-2">
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Mo</Badge>
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Di</Badge>
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Mi</Badge>
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Do</Badge>
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Fr</Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Placeholder für weitere Infos */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Weitere Informationen</h3>
          <p className="text-sm text-gray-500">Zusätzliche Details und Statistiken</p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wochenübersicht */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Wochenübersicht</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weekData}>
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Bar dataKey="hours" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Monatlicher Trend */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Monatlicher Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthData}>
              <XAxis dataKey="week" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="hours" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeTimeOverview;
