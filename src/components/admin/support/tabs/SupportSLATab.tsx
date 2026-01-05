import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, Clock, Zap, AlertCircle } from "lucide-react";

const slaDefinitions = [
  { tier: "Enterprise", priority: "Critical", responseTime: "30 Min", resolutionTime: "4 Std", availability: "99,9%", supportHours: "24/7" },
  { tier: "Enterprise", priority: "High", responseTime: "2 Std", resolutionTime: "8 Std", availability: "99,9%", supportHours: "24/7" },
  { tier: "Enterprise", priority: "Medium", responseTime: "4 Std", resolutionTime: "24 Std", availability: "99,9%", supportHours: "24/7" },
  { tier: "Professional", priority: "Critical", responseTime: "2 Std", resolutionTime: "8 Std", availability: "99,5%", supportHours: "Mo-Fr 8-18" },
  { tier: "Professional", priority: "High", responseTime: "4 Std", resolutionTime: "24 Std", availability: "99,5%", supportHours: "Mo-Fr 8-18" },
  { tier: "Professional", priority: "Medium", responseTime: "8 Std", resolutionTime: "48 Std", availability: "99,5%", supportHours: "Mo-Fr 8-18" },
  { tier: "Standard", priority: "Critical", responseTime: "4 Std", resolutionTime: "24 Std", availability: "99%", supportHours: "Mo-Fr 9-17" },
  { tier: "Standard", priority: "High", responseTime: "8 Std", resolutionTime: "48 Std", availability: "99%", supportHours: "Mo-Fr 9-17" },
  { tier: "Standard", priority: "Medium", responseTime: "24 Std", resolutionTime: "72 Std", availability: "99%", supportHours: "Mo-Fr 9-17" },
];

const escalationLevels = [
  { level: 1, title: "First Response", description: "Automatische Zuweisung an verfügbaren Support-Mitarbeiter", time: "0 h" },
  { level: 2, title: "Team Lead Eskalation", description: "Benachrichtigung des Team Leads bei SLA-Risiko", time: "Variable" },
  { level: 3, title: "Management Eskalation", description: "Eskalation an Support Manager bei kritischen Tickets", time: "Variable" },
  { level: 4, title: "Executive Eskalation", description: "Direkte Eskalation an C-Level bei Geschäftskritischen Ausfällen", time: "Kritisch" },
];

const performanceHistory = [
  { month: "Dezember", fulfillment: "94,2%", tickets: 156, status: "Gut" },
  { month: "November", fulfillment: "96,1%", tickets: 142, status: "Ausgezeichnet" },
  { month: "Oktober", fulfillment: "93,8%", tickets: 168, status: "Gut" },
  { month: "September", fulfillment: "95,4%", tickets: 134, status: "Ausgezeichnet" },
  { month: "August", fulfillment: "97,2%", tickets: 98, status: "Ausgezeichnet" },
  { month: "Juli", fulfillment: "96,8%", tickets: 112, status: "Ausgezeichnet" },
];

const getTierBadge = (tier: string) => {
  switch (tier) {
    case "Enterprise": return <Badge className="bg-primary/10 text-primary border-primary/20">Enterprise</Badge>;
    case "Professional": return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Professional</Badge>;
    case "Standard": return <Badge className="bg-green-100 text-green-700 border-green-200">Standard</Badge>;
    default: return <Badge variant="outline">{tier}</Badge>;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Ausgezeichnet": return <Badge className="bg-green-100 text-green-700 border-green-200">Ausgezeichnet</Badge>;
    case "Gut": return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Gut</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
};

const SupportSLATab = () => {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
            </div>
            <p className="text-2xl font-bold">94,2%</p>
            <p className="text-xs text-gray-500">SLA-Erfüllung (Monat)</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Clock className="w-4 h-4 text-gray-600" />
              </div>
            </div>
            <p className="text-2xl font-bold">2,4 h</p>
            <p className="text-xs text-gray-500">Ø Antwortzeit</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-pink-100 rounded-lg">
                <Zap className="w-4 h-4 text-pink-600" />
              </div>
            </div>
            <p className="text-2xl font-bold">6,2 h</p>
            <p className="text-xs text-gray-500">Ø Lösungszeit</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-600" />
              </div>
            </div>
            <p className="text-2xl font-bold">2</p>
            <p className="text-xs text-gray-500">SLA-Risiko Tickets</p>
          </CardContent>
        </Card>
      </div>

      {/* SLA Definitions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">SLA-Definitionen nach Tarif & Priorität</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tarif</TableHead>
                <TableHead>Priorität</TableHead>
                <TableHead>Antwortzeit</TableHead>
                <TableHead>Lösungszeit</TableHead>
                <TableHead>Verfügbarkeit</TableHead>
                <TableHead>Support-Zeiten</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {slaDefinitions.map((sla, index) => (
                <TableRow key={index}>
                  <TableCell>{getTierBadge(sla.tier)}</TableCell>
                  <TableCell className="font-medium">{sla.priority}</TableCell>
                  <TableCell>{sla.responseTime}</TableCell>
                  <TableCell>{sla.resolutionTime}</TableCell>
                  <TableCell>{sla.availability}</TableCell>
                  <TableCell>{sla.supportHours}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Escalation Levels */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Eskalationsstufen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {escalationLevels.map((level) => (
              <div key={level.level} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm">
                  {level.level}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{level.title}</h4>
                  <p className="text-sm text-gray-600">{level.description}</p>
                </div>
                <span className="text-sm text-gray-500">{level.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">SLA-Performance (letzte 6 Monate)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Monat</TableHead>
                <TableHead>SLA-Erfüllung</TableHead>
                <TableHead>Tickets gesamt</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {performanceHistory.map((row, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{row.month}</TableCell>
                  <TableCell>{row.fulfillment}</TableCell>
                  <TableCell>{row.tickets}</TableCell>
                  <TableCell>{getStatusBadge(row.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupportSLATab;
