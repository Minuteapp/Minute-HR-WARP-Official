
import React from 'react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { absenceService } from '@/services/absenceService';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const AbsenceStatistics: React.FC = () => {
  const [year, setYear] = useState('2025');
  const [viewType, setViewType] = useState('department');

  // Echte Datenanbindung über Service
  const { data: absenceRequests = [] } = useQuery({
    queryKey: ['absence-requests'],
    queryFn: absenceService.getRequests
  });

  // Berechne echte Statistiken aus den Abwesenheitsdaten
  const processStatistics = () => {
    if (!absenceRequests.length) return { monthlyData: [], departmentData: [], employeeData: [] };

    const months = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
    
    // Monatliche Statistiken
    const monthlyStats = months.map((month, index) => {
      const monthData = absenceRequests.filter(req => {
        const startDate = new Date(req.start_date);
        return startDate.getMonth() === index && startDate.getFullYear() === parseInt(year);
      });

      return {
        name: month,
        Urlaub: monthData.filter(req => req.type === 'vacation').length,
        Krankheit: monthData.filter(req => req.type === 'sick_leave' || req.type === 'sick').length,
        Dienstreise: monthData.filter(req => req.type === 'business_trip').length,
        Sonstiges: monthData.filter(req => !['vacation', 'sick_leave', 'sick', 'business_trip'].includes(req.type)).length,
      };
    });

    // Abteilungsstatistiken
    const departments = [...new Set(absenceRequests.map(req => req.department).filter(Boolean))];
    const departmentStats = departments.map(dept => {
      const deptData = absenceRequests.filter(req => req.department === dept);
      return {
        name: dept,
        Urlaub: deptData.filter(req => req.type === 'vacation').length,
        Krankheit: deptData.filter(req => req.type === 'sick_leave' || req.type === 'sick').length,
        Dienstreise: deptData.filter(req => req.type === 'business_trip').length,
        Sonstiges: deptData.filter(req => !['vacation', 'sick_leave', 'sick', 'business_trip'].includes(req.type)).length,
      };
    });

    // Mitarbeiterstatistiken (Top 5)
    const employees = [...new Set(absenceRequests.map(req => req.employee_name).filter(Boolean))];
    const employeeStats = employees.slice(0, 5).map(emp => {
      const empData = absenceRequests.filter(req => req.employee_name === emp);
      return {
        name: emp.length > 10 ? emp.substring(0, 10) + '...' : emp,
        Urlaub: empData.filter(req => req.type === 'vacation').length,
        Krankheit: empData.filter(req => req.type === 'sick_leave' || req.type === 'sick').length,
        Dienstreise: empData.filter(req => req.type === 'business_trip').length,
        Sonstiges: empData.filter(req => !['vacation', 'sick_leave', 'sick', 'business_trip'].includes(req.type)).length,
      };
    });

    return { monthlyData: monthlyStats, departmentData: departmentStats, employeeData: employeeStats };
  };

  const { monthlyData, departmentData, employeeData } = processStatistics();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Abwesenheitsstatistik</h2>
        <div className="flex gap-3">
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Jahr" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2026">2026</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="departments">Abteilungen</TabsTrigger>
          <TabsTrigger value="employees">Mitarbeiter</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Abwesenheiten nach Monat</CardTitle>
              <CardDescription>Anzahl der Abwesenheitstage pro Monat nach Typ</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Urlaub" fill="#3B82F6" />
                    <Bar dataKey="Krankheit" fill="#EF4444" />
                    <Bar dataKey="Dienstreise" fill="#8B5CF6" />
                    <Bar dataKey="Sonstiges" fill="#6B7280" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Abwesenheiten nach Abteilung</CardTitle>
              <CardDescription>Anzahl der Abwesenheitstage pro Abteilung nach Typ</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={departmentData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Urlaub" fill="#3B82F6" />
                    <Bar dataKey="Krankheit" fill="#EF4444" />
                    <Bar dataKey="Dienstreise" fill="#8B5CF6" />
                    <Bar dataKey="Sonstiges" fill="#6B7280" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Abwesenheiten nach Mitarbeiter</CardTitle>
              <CardDescription>Anzahl der Abwesenheitstage pro Mitarbeiter nach Typ</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={employeeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Urlaub" fill="#3B82F6" />
                    <Bar dataKey="Krankheit" fill="#EF4444" />
                    <Bar dataKey="Dienstreise" fill="#8B5CF6" />
                    <Bar dataKey="Sonstiges" fill="#6B7280" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AbsenceStatistics;
