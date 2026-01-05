import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MapPin } from "lucide-react";

interface Employee {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  location: string;
  status: 'Aktiv' | 'Offline' | 'Urlaub' | 'Pause';
  todayHours: number;
  weekHours: number;
}

interface AllEmployeesTableProps {
  onSelectEmployee: (employeeId: string) => void;
}

const AllEmployeesTable = ({ onSelectEmployee }: AllEmployeesTableProps) => {
  const employees: Employee[] = [];

  const getStatusIndicator = (status: string) => {
    switch (status) {
      case 'Aktiv':
        return <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Aktiv</span>;
      case 'Pause':
        return <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" /> Pause</span>;
      case 'Urlaub':
        return <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-500" /> Urlaub</span>;
      default:
        return <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-gray-400" /> Offline</span>;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-blue-600", "bg-purple-600", "bg-emerald-600", "bg-amber-600", 
      "bg-rose-600", "bg-indigo-600", "bg-cyan-600", "bg-pink-600"
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead className="font-semibold">Mitarbeiter</TableHead>
            <TableHead className="font-semibold">ID</TableHead>
            <TableHead className="font-semibold">Abteilung</TableHead>
            <TableHead className="font-semibold">Standort</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Heute</TableHead>
            <TableHead className="font-semibold">Woche</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id} className="hover:bg-muted/20">
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className={`h-8 w-8 ${getAvatarColor(employee.name)}`}>
                    <AvatarFallback className={`${getAvatarColor(employee.name)} text-white text-xs`}>
                      {getInitials(employee.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{employee.name}</span>
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{employee.employeeId}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{employee.department}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {employee.location}
                </span>
              </TableCell>
              <TableCell className="text-sm">{getStatusIndicator(employee.status)}</TableCell>
              <TableCell className="font-medium">{employee.todayHours.toFixed(1)} h</TableCell>
              <TableCell className="font-medium">{employee.weekHours.toFixed(1)} h</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSelectEmployee(employee.id)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AllEmployeesTable;
