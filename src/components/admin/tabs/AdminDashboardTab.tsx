import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, UserCog, DollarSign, TrendingDown, Layers, Server, AlertTriangle, Sparkles, Loader2 } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const AdminDashboardTab = () => {
  // Aktive Mandanten zählen
  const { data: companiesCount = 0, isLoading: loadingCompanies } = useQuery({
    queryKey: ['admin-companies-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('companies')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);
      if (error) throw error;
      return count || 0;
    }
  });

  // Aktive Nutzer (30 Tage) - basierend auf Login-Historie
  const { data: activeUsersCount = 0, isLoading: loadingActiveUsers } = useQuery({
    queryKey: ['admin-active-users'],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data, error } = await supabase
        .from('user_login_history')
        .select('user_id')
        .gte('login_at', thirtyDaysAgo.toISOString())
        .eq('success', true);
      
      if (error) throw error;
      // Unique users zählen
      const uniqueUsers = new Set(data?.map(d => d.user_id) || []);
      return uniqueUsers.size;
    }
  });

  // Admins zählen
  const { data: adminsCount = 0, isLoading: loadingAdmins } = useQuery({
    queryKey: ['admin-admins-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .in('role', ['admin', 'superadmin']);
      if (error) throw error;
      return count || 0;
    }
  });

  // Gesamtnutzer zählen
  const { data: totalUsersCount = 0, isLoading: loadingTotalUsers } = useQuery({
    queryKey: ['admin-total-users'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    }
  });

  // Aktive Module zählen (alle Module in module_configs)
  const { data: activeModulesCount = 0, isLoading: loadingModules } = useQuery({
    queryKey: ['admin-active-modules'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('module_configs')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);
      if (error) throw error;
      return count || 0;
    }
  });

  const isLoading = loadingCompanies || loadingActiveUsers || loadingAdmins || loadingTotalUsers || loadingModules;

  const kpiData = [
    { label: "Aktive Mandanten", value: isLoading ? "..." : companiesCount.toString(), change: "-", changeType: "neutral", icon: Building2 },
    { label: "Aktive Nutzer (30 Tage)", value: isLoading ? "..." : activeUsersCount.toString(), change: "-", changeType: "neutral", icon: Users },
    { label: "Admins (gesamt)", value: isLoading ? "..." : adminsCount.toString(), change: "-", changeType: "neutral", icon: UserCog },
    { label: "Nutzer (gesamt)", value: isLoading ? "..." : totalUsersCount.toString(), change: "-", changeType: "neutral", icon: Users },
    { label: "Churn-Rate", value: "-", change: "-", changeType: "neutral", icon: TrendingDown },
    { label: "Aktive Module", value: isLoading ? "..." : activeModulesCount.toString(), change: "-", changeType: "neutral", icon: Layers },
    { label: "Systemauslastung", value: "-", change: "-", changeType: "neutral", icon: Server },
    { label: "Kritische Incidents (24h)", value: "0", change: "-", changeType: "neutral", icon: AlertTriangle },
  ];

  const growthData: { month: string; value: number }[] = [];
  const revenueByTariff: { name: string; value: number }[] = [];
  const healthStatus: { name: string; status: string; uptime: string }[] = [];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {kpiData.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index} className="bg-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{kpi.label}</p>
                    <p className="text-2xl font-bold mt-1">
                      {isLoading && kpi.value === "..." ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : (
                        kpi.value
                      )}
                    </p>
                    <p className={`text-sm mt-1 ${
                      kpi.changeType === "positive" ? "text-green-600" : 
                      kpi.changeType === "negative" ? "text-red-600" : 
                      "text-muted-foreground"
                    }`}>
                      {kpi.change}
                    </p>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* KI-Admin-Summary */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900">KI-Admin-Summary</h3>
              <p className="text-sm text-blue-800 mt-1">
                {companiesCount > 0 
                  ? `Sie verwalten ${companiesCount} aktive Mandanten mit ${totalUsersCount} Benutzern. ${activeUsersCount} Nutzer waren in den letzten 30 Tagen aktiv.`
                  : 'Keine Daten verfügbar. Die Zusammenfassung wird angezeigt, sobald Daten vorhanden sind.'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-base">Mandanten-Wachstum</CardTitle>
          </CardHeader>
          <CardContent>
            {growthData.length === 0 ? (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                Keine Daten verfügbar
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-base">Umsatz nach Tarif</CardTitle>
          </CardHeader>
          <CardContent>
            {revenueByTariff.length === 0 ? (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                Keine Daten verfügbar
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={revenueByTariff}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Health Status */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-base">System-Health-Status</CardTitle>
        </CardHeader>
        <CardContent>
          {healthStatus.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              Keine Daten verfügbar
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {healthStatus.map((service, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="font-medium text-sm">{service.name}</span>
                  </div>
                  <p className="text-sm text-green-600 mt-1">{service.status}</p>
                  <p className="text-xs text-muted-foreground mt-1">Uptime: {service.uptime}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
