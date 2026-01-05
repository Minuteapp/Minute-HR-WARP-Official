import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, Filter, Calendar } from "lucide-react";
import { useWorkforceExtended } from "@/hooks/useWorkforceExtended";
import { useState } from "react";

export const CapacityDemand = () => {
  const { demands, supplies, isLoading } = useWorkforceExtended();
  const [filter, setFilter] = useState<string>('all');

  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fulfilled': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const totalDemandHours = demands?.reduce((sum, d) => sum + d.hours_needed, 0) || 0;
  const totalSupplyHours = supplies?.reduce((sum, s) => sum + s.available_hours, 0) || 0;
  const utilizationRate = totalSupplyHours > 0 ? (totalDemandHours / totalSupplyHours) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamtbedarf</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDemandHours.toFixed(0)} h</div>
            <p className="text-xs text-muted-foreground">
              {demands?.length || 0} Anforderungen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verfügbare Kapazität</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSupplyHours.toFixed(0)} h</div>
            <p className="text-xs text-muted-foreground">
              {supplies?.length || 0} Ressourcen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auslastungsgrad</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{utilizationRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Kapazitätsauslastung
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Bedarf vs. Kapazität</CardTitle>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle</SelectItem>
                <SelectItem value="department">Nach Abteilung</SelectItem>
                <SelectItem value="role">Nach Rolle</SelectItem>
                <SelectItem value="location">Nach Standort</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Demand List */}
            <div>
              <h3 className="font-semibold mb-3">Offene Bedarfe</h3>
              <div className="space-y-3">
                {demands?.filter(d => d.status === 'open').map((demand) => (
                  <div key={demand.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{demand.role_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {demand.department} • {demand.required_skills.join(', ')}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(demand.start_date).toLocaleDateString('de-DE')} - {new Date(demand.end_date).toLocaleDateString('de-DE')}
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="font-bold">{demand.hours_needed} h</div>
                      <div className="flex gap-2">
                        <Badge variant="secondary" className={getPriorityColor(demand.priority)}>
                          {demand.priority}
                        </Badge>
                        <Badge variant="secondary" className={getStatusColor(demand.status)}>
                          {demand.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
                {(!demands || demands.filter(d => d.status === 'open').length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Keine offenen Bedarfe gefunden</p>
                  </div>
                )}
              </div>
            </div>

            {/* Supply List */}
            <div>
              <h3 className="font-semibold mb-3">Verfügbare Ressourcen</h3>
              <div className="space-y-3">
                {supplies?.filter(s => s.status === 'available').map((supply) => (
                  <div key={supply.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">Ressource {supply.user_id.slice(0, 8)}</div>
                      <div className="text-sm text-muted-foreground">
                        {supply.department} • Skills: {supply.skills.join(', ')}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Verfügbar: {new Date(supply.availability_start).toLocaleDateString('de-DE')} - {new Date(supply.availability_end).toLocaleDateString('de-DE')}
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="font-bold">{supply.available_hours} h</div>
                      <div className="text-sm text-muted-foreground">
                        {supply.cost_rate}€/h
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {supply.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                {(!supplies || supplies.filter(s => s.status === 'available').length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Keine verfügbaren Ressourcen gefunden</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};