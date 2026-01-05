import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Leaf, Users, Home, Building2 } from "lucide-react";
import type { RemoteWorkStats } from "@/integrations/supabase/hooks/useEmployeeRemoteWork";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface RemoteWorkStatsCardProps {
  stats?: RemoteWorkStats;
}

export const RemoteWorkStatsCard = ({ stats }: RemoteWorkStatsCardProps) => {
  if (!stats) return null;

  const weekdayData = stats.homeoffice_distribution ? [
    { day: 'Mo', value: stats.homeoffice_distribution.Mo || 0 },
    { day: 'Di', value: stats.homeoffice_distribution.Di || 0 },
    { day: 'Mi', value: stats.homeoffice_distribution.Mi || 0 },
    { day: 'Do', value: stats.homeoffice_distribution.Do || 0 },
    { day: 'Fr', value: stats.homeoffice_distribution.Fr || 0 },
  ] : [];

  const getBarColor = (value: number) => {
    return value >= 60 ? '#3b82f6' : '#93c5fd'; // Dark blue for high %, light blue for low %
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 text-white rounded-lg">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-xl">Remote Work Statistiken {stats.year}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {new Date(stats.stats_period_start).toLocaleDateString('de-DE', { month: 'long' })} - {new Date(stats.stats_period_end).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Home className="w-4 h-4 text-blue-600" />
              <div className="text-xs text-muted-foreground">Homeoffice-Tage</div>
            </div>
            <div className="text-2xl font-bold text-blue-600">{stats.homeoffice_days}</div>
            <div className="text-xs text-muted-foreground mt-1">Von {stats.total_work_days} Arbeitstagen</div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-4 h-4 text-gray-600" />
              <div className="text-xs text-muted-foreground">Büro-Tage</div>
            </div>
            <div className="text-2xl font-bold text-gray-600">{stats.office_days}</div>
            <div className="text-xs text-muted-foreground mt-1">Präsenz-Anteil</div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-purple-600" />
              <div className="text-xs text-muted-foreground">Remote-Quote</div>
            </div>
            <div className="text-2xl font-bold text-purple-600">{stats.remote_quote_percentage}%</div>
            <div className="text-xs text-muted-foreground mt-1">Durchschnitt</div>
          </div>
          
          {stats.co2_savings_kg && (
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Leaf className="w-4 h-4 text-green-600" />
                <div className="text-xs text-muted-foreground">CO₂ Ersparnis</div>
              </div>
              <div className="text-2xl font-bold text-green-600">{stats.co2_savings_kg} kg</div>
              <div className="text-xs text-muted-foreground mt-1">Nachhaltigkeit</div>
            </div>
          )}
          
          {stats.meeting_remote_percentage !== undefined && (
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-orange-600" />
                <div className="text-xs text-muted-foreground">Meeting-Anteil</div>
              </div>
              <div className="text-2xl font-bold text-orange-600">{stats.meeting_remote_percentage}%</div>
              <div className="text-xs text-muted-foreground mt-1">Remote-Meetings</div>
            </div>
          )}
          
          {stats.productivity_change_percentage !== undefined && (
            <div className="bg-emerald-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <div className="text-xs text-muted-foreground">Produktivität</div>
              </div>
              <div className={`text-2xl font-bold ${stats.productivity_change_percentage >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {stats.productivity_change_percentage >= 0 ? '+' : ''}{stats.productivity_change_percentage}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">vs. {stats.year - 1}</div>
            </div>
          )}
        </div>
        
        {weekdayData.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Homeoffice-Verteilung nach Wochentag</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={weekdayData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                  <YAxis type="category" dataKey="day" />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                    {weekdayData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getBarColor(entry.value)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-center gap-6 mt-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-blue-500"></div>
                  <span>Homeoffice-Tage (≥60%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-blue-300"></div>
                  <span>Büro-Tage (&lt;60%)</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
