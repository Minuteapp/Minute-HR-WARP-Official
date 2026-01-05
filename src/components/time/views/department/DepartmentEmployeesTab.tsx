import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search } from "lucide-react";

const DepartmentEmployeesTab = () => {
  const employees: Array<{ id: string; name: string; position: string; team: string; status: string; today: number; week: number }> = [];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = ["bg-blue-600", "bg-purple-600", "bg-emerald-600", "bg-amber-600", "bg-rose-600", "bg-indigo-600"];
    return colors[name.charCodeAt(0) % colors.length];
  };

  const getStatusIndicator = (status: string) => {
    if (status === "Aktiv") {
      return <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Aktiv</span>;
    }
    return <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" /> Pause</span>;
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        {/* Header with Search */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Mitarbeiter (856)</h3>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Mitarbeiter suchen..." className="pl-10" />
          </div>
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="font-semibold">Mitarbeiter</TableHead>
              <TableHead className="font-semibold">ID</TableHead>
              <TableHead className="font-semibold">Position</TableHead>
              <TableHead className="font-semibold">Team</TableHead>
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
                <TableCell className="text-sm text-muted-foreground">{employee.id}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{employee.position}</TableCell>
                <TableCell className="text-sm text-blue-600">{employee.team}</TableCell>
                <TableCell className="text-sm">{getStatusIndicator(employee.status)}</TableCell>
                <TableCell className="font-medium">{employee.today.toFixed(1)} h</TableCell>
                <TableCell className="font-medium">{employee.week.toFixed(1)} h</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <p className="text-sm text-muted-foreground">Zeige 8 von 856 Mitarbeitern</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>Zurück</Button>
            <Button variant="outline" size="sm">Weiter</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DepartmentEmployeesTab;
