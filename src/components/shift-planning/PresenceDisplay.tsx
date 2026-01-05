
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, addHours, isAfter, isBefore, isSameDay } from 'date-fns';
import { de } from 'date-fns/locale';
import { shiftPlanningService } from '@/services/shiftPlanningService';
import { Clock, Filter, Users, Building, MapPin, Phone } from "lucide-react";
import { useShiftPlanning } from '@/hooks/useShiftPlanning';

const PresenceDisplay = () => {
  const [activeTab, setActiveTab] = useState("present");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const { employees, isLoading } = useShiftPlanning();

  // Heutige Schichten laden und echte Anwesenheit berechnen
  const [todayShifts, setTodayShifts] = useState<any[]>([]);
  React.useEffect(() => {
    const load = async () => {
      const today = new Date();
      const shifts = await shiftPlanningService.getShifts(today, today);
      setTodayShifts(shifts);
    };
    load();
  }, []);

  const now = new Date();
  const getShiftForEmployee = (empId: string) => todayShifts.find((s) => s.employeeId === empId);

  const presentEmployees = employees.filter((e) => {
    const s = getShiftForEmployee(e.id);
    if (!s || !s.start_time || !s.end_time) return false;
    const start = new Date(s.start_time);
    const end = new Date(s.end_time);
    return isBefore(now, end) && isAfter(now, start);
  });

  const expectedEmployees = employees
    .filter((e) => {
      const s = getShiftForEmployee(e.id);
      if (!s || !s.start_time) return false;
      const start = new Date(s.start_time);
      return isAfter(start, now) && start.getTime() - now.getTime() <= 2 * 60 * 60 * 1000;
    })
    .filter((e) => !presentEmployees.includes(e));

  const absentEmployees = employees.filter(
    (e) => !presentEmployees.includes(e) && !expectedEmployees.includes(e)
  );

  const filterEmployees = (employeeList) => {
    return employeeList.filter(employee => {
      const locationMatch = selectedLocation === "all" || employee.location === selectedLocation;
      const departmentMatch = selectedDepartment === "all" || employee.department === selectedDepartment;
      return locationMatch && departmentMatch;
    });
  };

  const filteredPresent = filterEmployees(presentEmployees);
  const filteredExpected = filterEmployees(expectedEmployees);
  const filteredAbsent = filterEmployees(absentEmployees);

  // Ableitungen aus echten Daten
  const locations: string[] = [];
  const departments = Array.from(new Set((employees || []).map(e => e.department).filter(Boolean)));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold">Live-Anwesenheitsanzeige</h2>
          <p className="text-sm text-muted-foreground">
            Aktuelle Übersicht aller anwesenden, erwarteten und abwesenden Mitarbeiter
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-[130px]">
              <Building className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Standort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Standorte</SelectItem>
              {locations.map(location => (
                <SelectItem key={location} value={location.toLowerCase()}>{location}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-[150px]">
              <Users className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Abteilung" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Abteilungen</SelectItem>
              {departments.map(department => (
                <SelectItem key={department} value={department.toLowerCase()}>{department}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
              Anwesend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredPresent.length}</div>
            <p className="text-sm text-muted-foreground">Mitarbeiter im Dienst</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <div className="h-3 w-3 rounded-full bg-amber-500 mr-2"></div>
              Erwartet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredExpected.length}</div>
            <p className="text-sm text-muted-foreground">In den nächsten 2 Stunden</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <div className="h-3 w-3 rounded-full bg-gray-300 mr-2"></div>
              Abwesend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredAbsent.length}</div>
            <p className="text-sm text-muted-foreground">Nicht im Dienst</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Mitarbeiterübersicht</CardTitle>
          <CardDescription>
            Detaillierte Anzeige des Anwesenheitsstatus aller Mitarbeiter
          </CardDescription>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-2">
              <TabsTrigger value="present">Anwesend</TabsTrigger>
              <TabsTrigger value="expected">Erwartet</TabsTrigger>
              <TabsTrigger value="absent">Abwesend</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        
        <CardContent>
          <TabsContent value="present" className="mt-0">
            <div className="space-y-1">
              {filteredPresent.map((employee, index) => {
                const s = getShiftForEmployee(employee.id);
                return (
                  <EmployeeStatusCard 
                    key={index}
                    employee={employee}
                    status="present"
                    startTime={s?.start_time ? new Date(s.start_time) : null}
                    endTime={s?.end_time ? new Date(s.end_time) : null}
                    nextShift={null}
                  />
                );
              })}
              
              {filteredPresent.length === 0 && (
                <EmptyState message="Keine anwesenden Mitarbeiter gefunden" />
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="expected" className="mt-0">
            <div className="space-y-1">
              {filteredExpected.map((employee, index) => {
                const s = getShiftForEmployee(employee.id);
                return (
                  <EmployeeStatusCard 
                    key={index}
                    employee={employee}
                    status="expected"
                    startTime={s?.start_time ? new Date(s.start_time) : null}
                    endTime={s?.end_time ? new Date(s.end_time) : null}
                    nextShift={null}
                  />
                );
              })}
              
              {filteredExpected.length === 0 && (
                <EmptyState message="Keine erwarteten Mitarbeiter gefunden" />
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="absent" className="mt-0">
            <div className="space-y-1">
              {filteredAbsent.map((employee, index) => (
                <EmployeeStatusCard 
                  key={index}
                  employee={employee}
                  status="absent"
                  startTime={null}
                  endTime={null}
                  nextShift={null}
                />
              ))}
              
              {filteredAbsent.length === 0 && (
                <EmptyState message="Keine abwesenden Mitarbeiter gefunden" />
              )}
            </div>
          </TabsContent>
        </CardContent>
      </Card>
    </div>
  );
};

interface EmployeeStatusCardProps {
  employee: any;
  status: string;
  startTime: Date | null;
  endTime: Date | null;
  nextShift: Date | null;
}

const EmployeeStatusCard = ({ employee, status, startTime, endTime, nextShift }: EmployeeStatusCardProps) => {
  const getStatusDetails = () => {
    switch (status) {
      case 'present':
        return {
          badge: <Badge className="bg-green-100 text-green-800 border-green-300">Im Dienst</Badge>,
          time: startTime && endTime && (
            <div className="text-xs text-muted-foreground flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {format(startTime, 'HH:mm')} - {format(endTime, 'HH:mm')} Uhr
            </div>
          )
        };
      case 'expected':
        return {
          badge: <Badge className="bg-amber-100 text-amber-800 border-amber-300">Erwartet</Badge>,
          time: startTime && (
            <div className="text-xs text-muted-foreground flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              Ab {format(startTime, 'HH:mm')} Uhr
            </div>
          )
        };
      case 'absent':
        return {
          badge: <Badge className="bg-gray-100 text-gray-800 border-gray-300">Nicht im Dienst</Badge>,
          time: nextShift && (
            <div className="text-xs text-muted-foreground flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              Nächste Schicht: {format(nextShift, 'dd.MM.', { locale: de })}
            </div>
          )
        };
      default:
        return { badge: null, time: null };
    }
  };

  const { badge, time } = getStatusDetails();
  
  // Standort aus echten Daten oder Fallback
  const location = employee.location || '—';

  return (
    <div className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name)}`} />
          <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium">{employee.name}</div>
          {time}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {badge}
        <div className="flex items-center text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 mr-1" />
          {location}
        </div>
        <div className="flex items-center text-xs text-muted-foreground">
          <Users className="h-3 w-3 mr-1" />
          {employee.department}
        </div>
        <Button size="icon" variant="ghost" className="h-8 w-8">
          <Phone className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>
    </div>
  );
};

const EmptyState = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-10 text-center">
    <Users className="h-10 w-10 text-muted-foreground mb-2" />
    <h3 className="font-medium">Keine Mitarbeiter gefunden</h3>
    <p className="text-sm text-muted-foreground mt-1">
      {message}
    </p>
  </div>
);

export default PresenceDisplay;
