import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface LocationEmployeesTabProps {
  location: {
    employees: number;
  };
}

const LocationEmployeesTab = ({ location }: LocationEmployeesTabProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const employees = [
    { name: 'Anna Schmidt', id: 'E10234', department: 'Engineering', position: 'Senior Engineer', status: 'active', today: '6.2 h' },
    { name: 'Max Müller', id: 'E10456', department: 'Engineering', position: 'Team Lead', status: 'active', today: '5.8 h' },
    { name: 'Lisa Weber', id: 'E10567', department: 'Sales', position: 'Sales Manager', status: 'pause', today: '4.2 h' },
    { name: 'Tom Fischer', id: 'E10789', department: 'Marketing', position: 'Marketing Specialist', status: 'active', today: '7.1 h' },
    { name: 'Sarah Klein', id: 'E10890', department: 'Operations', position: 'Operations Lead', status: 'active', today: '6.8 h' },
    { name: 'Julia Becker', id: 'E11023', department: 'HR', position: 'HR Manager', status: 'active', today: '7.1 h' },
    { name: 'Michael Braun', id: 'E11145', department: 'Customer Service', position: 'CS Lead', status: 'active', today: '5.5 h' },
    { name: 'Sophia Schneider', id: 'E11234', department: 'Engineering', position: 'Software Engineer', status: 'active', today: '7.8 h' },
  ];

  const getStatusIndicator = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Aktiv</span>;
      case 'pause':
        return <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500"></span> Pause</span>;
      case 'offline':
        return <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-400"></span> Offline</span>;
      default:
        return null;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
  };

  const getAvatarColor = (name: string) => {
    const colors = ['bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700', 'bg-green-100 text-green-700', 'bg-orange-100 text-orange-700'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Mitarbeiter am Standort ({location.employees})</h3>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Mitarbeiter suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">Mitarbeiter</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">ID</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">Abteilung</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">Position</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">Heute</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground"></th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((employee, index) => (
              <tr key={index} className="border-b hover:bg-muted/50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${getAvatarColor(employee.name)}`}>
                      {getInitials(employee.name)}
                    </div>
                    <span className="font-medium">{employee.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-muted-foreground">{employee.id}</td>
                <td className="py-3 px-4">{employee.department}</td>
                <td className="py-3 px-4">{employee.position}</td>
                <td className="py-3 px-4">{getStatusIndicator(employee.status)}</td>
                <td className="py-3 px-4">{employee.today}</td>
                <td className="py-3 px-4">
                  <Button variant="ghost" size="sm">Details</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-6 pt-4 border-t">
        <p className="text-sm text-muted-foreground">Zeige {filteredEmployees.length} von {location.employees} Mitarbeitern</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Zurück</Button>
          <Button variant="outline" size="sm">Weiter</Button>
        </div>
      </div>
    </Card>
  );
};

export default LocationEmployeesTab;
