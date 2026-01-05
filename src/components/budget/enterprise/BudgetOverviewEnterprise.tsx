
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Building,
  Users,
  FolderOpen,
  Target
} from "lucide-react";
import { useBudgetDimensions, useEnterpriseForecasts } from '@/hooks/useBudgetEnterprise';

export const BudgetOverviewEnterprise = () => {
  const { data: dimensions } = useBudgetDimensions();
  const { data: forecasts } = useEnterpriseForecasts({ status: 'active' });

  const departmentData = [
    { name: 'IT & Technologie', budget: 850000, used: 620000, forecast: 780000, status: 'good' },
    { name: 'Personal & HR', budget: 1200000, used: 1150000, forecast: 1280000, status: 'warning' },
    { name: 'Marketing & Vertrieb', budget: 450000, used: 380000, forecast: 420000, status: 'good' },
    { name: 'Forschung & Entwicklung', budget: 600000, used: 580000, forecast: 650000, status: 'critical' },
    { name: 'Verwaltung', budget: 320000, used: 240000, forecast: 290000, status: 'good' }
  ];

  const locationData = [
    { name: 'Hauptsitz München', budget: 2100000, used: 1580000, progress: 75 },
    { name: 'Niederlassung Berlin', budget: 800000, used: 650000, progress: 81 },
    { name: 'Standort Hamburg', budget: 520000, used: 340000, progress: 65 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-100 text-green-700';
      case 'warning': return 'bg-yellow-100 text-yellow-700';
      case 'critical': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Department Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-blue-600" />
              Abteilungsbudgets
            </CardTitle>
            <Button variant="outline" size="sm">
              Details anzeigen
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {departmentData.map((dept) => (
              <div key={dept.name} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(dept.status)}
                  <div>
                    <h4 className="font-medium">{dept.name}</h4>
                    <p className="text-sm text-gray-500">
                      Budget: €{dept.budget.toLocaleString()} | 
                      Verbraucht: €{dept.used.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {Math.round((dept.used / dept.budget) * 100)}% verbraucht
                    </div>
                    <div className="text-xs text-gray-500">
                      Prognose: €{dept.forecast.toLocaleString()}
                    </div>
                  </div>
                  <Badge className={getStatusColor(dept.status)}>
                    {dept.status === 'good' ? 'Im Plan' : 
                     dept.status === 'warning' ? 'Warnung' : 'Kritisch'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Location Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {locationData.map((location) => (
          <Card key={location.name}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building className="h-4 w-4" />
                {location.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Budget</span>
                  <span className="font-medium">€{location.budget.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Verbraucht</span>
                  <span className="font-medium">€{location.used.toLocaleString()}</span>
                </div>
                <Progress value={location.progress} className="h-2" />
                <div className="flex justify-between items-center">
                  <Badge variant="outline">{location.progress}% verbraucht</Badge>
                  {location.progress > 80 ? (
                    <TrendingUp className="h-4 w-4 text-red-500" />
                  ) : (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Project Budget Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-purple-600" />
            Projektbudgets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">23</div>
              <div className="text-sm text-gray-500">Aktive Projekte</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">€1.8M</div>
              <div className="text-sm text-gray-500">Gesamtbudget</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">€1.2M</div>
              <div className="text-sm text-gray-500">Verbraucht</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">67%</div>
              <div className="text-sm text-gray-500">Durchschnitt</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Integration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-indigo-600" />
            Live-Datenintegrationen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <div className="font-medium">Zeiterfassung</div>
                <div className="text-xs text-gray-500">Letzter Sync: vor 2 Min</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <div className="font-medium">Ausgaben</div>
                <div className="text-xs text-gray-500">Letzter Sync: vor 5 Min</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <div className="font-medium">Projekte</div>
                <div className="text-xs text-gray-500">Letzter Sync: vor 1 Min</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div>
                <div className="font-medium">Lohn & Gehalt</div>
                <div className="text-xs text-gray-500">Sync läuft...</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
