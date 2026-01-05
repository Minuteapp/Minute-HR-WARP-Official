import { Card } from "@/components/ui/card";
import { MapPin, Building, Calendar, LayoutGrid, Monitor, Users, Car } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Tooltip } from "recharts";

interface LocationOverviewTabProps {
  location: {
    name: string;
    employees: number;
    active: number;
  };
}

const LocationOverviewTab = ({ location }: LocationOverviewTabProps) => {
  const stats = [
    { label: 'Mitarbeiter', value: location.employees.toLocaleString(), subtext: `${location.active} aktiv jetzt`, subtextColor: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-l-blue-500' },
    { label: 'Auslastung', value: '81.6%', subtext: 'Kapazität: 3500', subtextColor: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-l-green-500' },
    { label: 'Monatsstunden', value: '110.245 h', subtext: 'Ø 38.2 h/MA', subtextColor: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-l-blue-500' },
    { label: 'Abteilungen', value: '12', subtext: '8 Etagen', subtextColor: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-l-orange-500' },
  ];

  const locationInfo = [
    { icon: MapPin, label: 'Adresse', value: 'Alexanderplatz 1, 10178 Berlin' },
    { icon: Building, label: 'Typ', value: 'Hauptstandort' },
    { icon: Calendar, label: 'Eröffnet', value: '2015' },
    { icon: LayoutGrid, label: 'Gesamtfläche', value: '12.500 m²' },
    { icon: Monitor, label: 'Bürofläche', value: '8.500 m²' },
    { icon: Users, label: 'Kapazität', value: '3500 Arbeitsplätze' },
    { icon: Building, label: 'Etagen', value: '8 Etagen' },
    { icon: Car, label: 'Parkplätze', value: '250 Plätze' },
  ];

  const statusItems = [
    { label: 'Status', value: 'Aktiv', isStatus: true },
    { label: 'Auslastung', value: '81.6%', percentage: 81.6 },
    { label: 'Mitarbeiter aktiv', value: '2456 / 2856', percentage: 86 },
    { label: 'Meeting Räume frei', value: '23 / 45', percentage: 51 },
  ];

  const weeklyData = [
    { day: 'Mo', hours: 22500 },
    { day: 'Di', hours: 23200 },
    { day: 'Mi', hours: 22800 },
    { day: 'Do', hours: 22400 },
    { day: 'Fr', hours: 21000 },
  ];

  const departmentData = [
    { name: 'Engineering', value: 30, color: '#6366f1' },
    { name: 'Sales', value: 19, color: '#ec4899' },
    { name: 'Operations', value: 15, color: '#f59e0b' },
    { name: 'Customer Service', value: 14, color: '#10b981' },
    { name: 'Marketing', value: 9, color: '#ef4444' },
    { name: 'Andere', value: 13, color: '#6b7280' },
  ];

  const trendData = [
    { month: 'Jun', hours: 108000, employees: 2800 },
    { month: 'Jul', hours: 109500, employees: 2820 },
    { month: 'Aug', hours: 110000, employees: 2840 },
    { month: 'Sep', hours: 111000, employees: 2850 },
    { month: 'Okt', hours: 109200, employees: 2845 },
    { month: 'Nov', hours: 110245, employees: 2856 },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className={`p-5 border-l-4 ${stat.borderColor} ${stat.bgColor}`}>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-3xl font-bold mt-1">{stat.value}</p>
            <p className={`text-sm mt-2 ${stat.subtextColor}`}>{stat.subtext}</p>
          </Card>
        ))}
      </div>

      {/* Location Info and Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">Standort Informationen</h3>
          <div className="grid grid-cols-2 gap-6">
            {locationInfo.map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <item.icon className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="font-medium">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">Aktueller Status</h3>
          <div className="space-y-4">
            {statusItems.map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">{item.label}</span>
                  {item.isStatus ? (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      {item.value}
                    </span>
                  ) : (
                    <span className="text-sm font-medium">{item.value}</span>
                  )}
                </div>
                {item.percentage !== undefined && (
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gray-900 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Wöchentliche Aktivität</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" />
                <YAxis />
                <Bar dataKey="hours" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Abteilungsverteilung</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, value }) => `${name} ${value}%`}
                  labelLine={true}
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* 6-Month Trend */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">6-Monats Trend</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="hours" 
                stroke="#6366f1" 
                strokeWidth={2}
                dot={{ fill: '#6366f1', strokeWidth: 2 }}
                name="Stunden"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="employees" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ fill: '#10b981', strokeWidth: 2 }}
                name="Mitarbeiter"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default LocationOverviewTab;
