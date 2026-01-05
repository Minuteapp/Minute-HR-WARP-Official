import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Calendar, Users, Clock } from "lucide-react";
import { useState } from "react";

interface ResourceAllocation {
  id: string;
  resourceName: string;
  resourceInitials: string;
  projectName: string;
  startDate: string;
  endDate: string;
  hours: number;
  color: string;
  utilization: number;
}

const allocationData: ResourceAllocation[] = [
  {
    id: '1',
    resourceName: 'Anna Schmidt',
    resourceInitials: 'AS',
    projectName: 'ERP Migration',
    startDate: '2025-10-20',
    endDate: '2025-11-15',
    hours: 32,
    color: 'bg-blue-500',
    utilization: 80
  },
  {
    id: '2',
    resourceName: 'Anna Schmidt',
    resourceInitials: 'AS',
    projectName: 'API Gateway',
    startDate: '2025-10-22',
    endDate: '2025-11-10',
    hours: 8,
    color: 'bg-purple-500',
    utilization: 20
  },
  {
    id: '3',
    resourceName: 'Max Müller',
    resourceInitials: 'MM',
    projectName: 'Mobile App Redesign',
    startDate: '2025-10-21',
    endDate: '2025-11-20',
    hours: 24,
    color: 'bg-green-500',
    utilization: 60
  },
  {
    id: '4',
    resourceName: 'Sarah Weber',
    resourceInitials: 'SW',
    projectName: 'Cloud Infrastructure',
    startDate: '2025-10-18',
    endDate: '2025-11-25',
    hours: 40,
    color: 'bg-red-500',
    utilization: 100
  },
  {
    id: '5',
    resourceName: 'Sarah Weber',
    resourceInitials: 'SW',
    projectName: 'Security Audit',
    startDate: '2025-10-25',
    endDate: '2025-11-08',
    hours: 8,
    color: 'bg-orange-500',
    utilization: 20
  }
];

const absenceData = [
  { name: 'Anna Schmidt', initials: 'AS', type: 'Urlaub', startDate: '2025-11-01', endDate: '2025-11-05', color: 'bg-yellow-200' },
  { name: 'Tom Fischer', initials: 'TF', type: 'Krank', startDate: '2025-10-23', endDate: '2025-10-25', color: 'bg-red-200' }
];

export const ResourceCalendarView = () => {
  const [currentMonth] = useState('Oktober 2025');
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

  // Generiere Wochentage für die Timeline
  const weekDays = ['Mo 20', 'Di 21', 'Mi 22', 'Do 23', 'Fr 24', 'Sa 25', 'So 26'];
  
  // Gruppiere Allocations nach Ressource
  const resourceGroups = allocationData.reduce((acc, allocation) => {
    if (!acc[allocation.resourceName]) {
      acc[allocation.resourceName] = {
        initials: allocation.resourceInitials,
        allocations: []
      };
    }
    acc[allocation.resourceName].allocations.push(allocation);
    return acc;
  }, {} as Record<string, { initials: string; allocations: ResourceAllocation[] }>);

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="text-lg font-semibold">{currentMonth}</h3>
            <Button variant="outline" size="icon">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm">Heute</Button>
        </div>
        <div className="flex items-center gap-2">
          <Select value={viewMode} onValueChange={(v) => setViewMode(v as 'week' | 'month')}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Wochenansicht</SelectItem>
              <SelectItem value="month">Monatsansicht</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="gap-2">
            <Calendar className="h-4 w-4" />
            Urlaub eintragen
          </Button>
        </div>
      </div>

      {/* Timeline Header */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Ressourcen-Zuweisungen & Verfügbarkeit
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-[900px]">
              {/* Timeline Grid Header */}
              <div className="grid grid-cols-[200px_1fr] border-b">
                <div className="p-4 font-semibold border-r bg-muted/50">Mitarbeiter</div>
                <div className="grid grid-cols-7">
                  {weekDays.map((day) => (
                    <div key={day} className="p-2 text-center text-sm font-medium border-l">
                      {day}
                    </div>
                  ))}
                </div>
              </div>

              {/* Resource Rows */}
              {Object.entries(resourceGroups).map(([name, { initials, allocations }]) => {
                // Berechne Gesamtauslastung
                const totalUtilization = allocations.reduce((sum, a) => sum + a.utilization, 0);
                const absence = absenceData.find(a => a.name === name);

                return (
                  <div key={name} className="grid grid-cols-[200px_1fr] border-b hover:bg-muted/30">
                    {/* Resource Name */}
                    <div className="p-4 border-r flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                        {initials}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant={totalUtilization > 100 ? 'destructive' : 'default'}
                            className={totalUtilization <= 100 ? 'bg-green-500' : ''}
                          >
                            {totalUtilization}%
                          </Badge>
                          {absence && (
                            <Badge variant="outline" className="text-xs">
                              {absence.type}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Timeline Grid */}
                    <div className="grid grid-cols-7 relative">
                      {weekDays.map((_, idx) => (
                        <div key={idx} className="border-l min-h-[80px] p-1">
                          {/* Allocations for this day */}
                          {allocations.map((allocation) => (
                            <div
                              key={allocation.id}
                              className={`${allocation.color} text-white rounded p-1 mb-1 text-xs`}
                              title={`${allocation.projectName} - ${allocation.hours}h`}
                            >
                              <div className="font-semibold truncate">{allocation.projectName}</div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{allocation.hours}h</span>
                              </div>
                            </div>
                          ))}
                          {/* Absences */}
                          {absence && idx >= 2 && idx <= 4 && (
                            <div className={`${absence.color} rounded p-1 text-xs font-medium`}>
                              {absence.type}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workload Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>Workload-Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, idx) => {
              // Simuliere unterschiedliche Auslastung
              const workload = [65, 85, 95, 110, 88, 0, 0][idx];
              const color = 
                workload === 0 ? 'bg-gray-100' :
                workload > 100 ? 'bg-red-500' :
                workload > 80 ? 'bg-orange-500' :
                workload > 60 ? 'bg-yellow-500' :
                'bg-green-500';
              
              return (
                <div key={day} className="text-center">
                  <div className="text-xs font-medium mb-2">{day}</div>
                  <div className={`${color} rounded-lg p-4 text-white font-bold`}>
                    {workload}%
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-6 mt-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>&lt; 60%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span>60-80%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span>80-100%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>&gt; 100%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Absence Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Abwesenheiten & Urlaub</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {absenceData.map((absence, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                    {absence.initials}
                  </div>
                  <div>
                    <p className="font-medium">{absence.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {absence.startDate} - {absence.endDate}
                    </p>
                  </div>
                </div>
                <Badge className={absence.type === 'Urlaub' ? 'bg-yellow-500' : 'bg-red-500'}>
                  {absence.type}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
