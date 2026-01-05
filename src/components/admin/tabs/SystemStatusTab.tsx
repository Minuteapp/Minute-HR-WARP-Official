import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Cpu, HardDrive, Database, Zap, AlertTriangle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const SystemStatusTab = () => {
  const stats = [
    { label: "CPU-Auslastung", value: "-", icon: Cpu, status: "unknown" },
    { label: "RAM-Nutzung", value: "-", icon: Database, status: "unknown" },
    { label: "Storage", value: "-", icon: HardDrive, status: "unknown" },
    { label: "API Response Time", value: "-", icon: Zap, status: "unknown" },
  ];

  const chartData: { time: string; cpu: number; ram: number; api: number }[] = [];

  const services: { name: string; status: string; uptime: string; response: string }[] = [];

  const tenantResources: { tenant: string; apiRequests: string; storage: string; aiTokens: string }[] = [];

  const alerts: { message: string; time: string }[] = [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold">Systemstatus & Ressourcen</h2>
        <p className="text-sm text-muted-foreground">Echtzeit-Monitoring der Plattform-Infrastruktur</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold text-muted-foreground">{stat.value}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-muted" />
                  <stat.icon className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System Load Chart */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Systemauslastung (24h)</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Keine Daten verfügbar
            </div>
          ) : (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="cpu" name="CPU %" stroke="#22c55e" strokeWidth={2} />
                  <Line type="monotone" dataKey="ram" name="RAM %" stroke="#8b5cf6" strokeWidth={2} />
                  <Line type="monotone" dataKey="api" name="API ms" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Service Status */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Service-Status</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {services.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              Keine Service-Daten verfügbar
            </div>
          ) : (
            <div className="divide-y">
              {services.map((service, index) => (
                <div key={index} className="flex items-center justify-between px-6 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="font-medium">{service.name}</span>
                    <span className="text-sm text-green-600">{service.status}</span>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <span>Uptime: {service.uptime}</span>
                    <span>Response: {service.response}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tenant Resource Usage */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Mandanten-Ressourcennutzung (24h)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mandant</TableHead>
                <TableHead>API Requests</TableHead>
                <TableHead>Storage</TableHead>
                <TableHead>KI-Tokens</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenantResources.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    Keine Daten verfügbar
                  </TableCell>
                </TableRow>
              ) : (
                tenantResources.map((tenant, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{tenant.tenant}</TableCell>
                    <TableCell>{tenant.apiRequests}</TableCell>
                    <TableCell>{tenant.storage}</TableCell>
                    <TableCell>{tenant.aiTokens}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* System Alerts */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">System-Alerts (24h)</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="py-4 text-center text-muted-foreground">
              Keine Alerts vorhanden
            </div>
          ) : (
            <div className="space-y-2">
              {alerts.map((alert, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                  <span className="text-primary">{alert.message}</span>
                  <span className="text-sm text-muted-foreground">{alert.time}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemStatusTab;
