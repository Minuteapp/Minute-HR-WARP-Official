
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type TeamMember = {
  id: string;
  name: string;
  role: string;
  permissions: 'admin' | 'editor' | 'viewer';
};

interface Employee {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  position?: string;
}

interface TeamSectionProps {
  team: TeamMember[];
  onChange: (field: string, value: TeamMember[]) => void;
}

export const TeamSection = ({ team, onChange }: TeamSectionProps) => {
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [searchEmployee, setSearchEmployee] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [permissions, setPermissions] = useState<'admin' | 'editor' | 'viewer'>('viewer');
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);

  // Mitarbeiter aus der Datenbank laden
  const { data: employees, isLoading, error } = useQuery({
    queryKey: ['employees-for-team'],
    queryFn: async () => {
      console.log('Lade Mitarbeiter aus der Datenbank...');
      const { data, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name, email, position')
        .order('last_name', { ascending: true });
      
      if (error) {
        console.error('Fehler beim Laden der Mitarbeiter:', error);
        throw error;
      }
      console.log('Geladene Mitarbeiter:', data);
      return data as Employee[];
    }
  });

  // Gefilterte Mitarbeiter basierend auf der Sucheingabe
  const filteredEmployees = employees?.filter(employee => {
    if (!searchEmployee) return false;
    
    const fullName = `${employee.first_name || ''} ${employee.last_name || ''}`.toLowerCase();
    const email = (employee.email || '').toLowerCase();
    const position = (employee.position || '').toLowerCase();
    const searchTerm = searchEmployee.toLowerCase();
    
    return fullName.includes(searchTerm) || 
           email.includes(searchTerm) || 
           position.includes(searchTerm);
  }) || [];

  const handleAddMember = () => {
    if (!selectedEmployee || role.trim() === '') {
      toast.error("Bitte wählen Sie einen Mitarbeiter und geben Sie eine Rolle an");
      return;
    }

    const selectedEmployeeData = employees?.find(emp => emp.id === selectedEmployee);
    if (!selectedEmployeeData) {
      toast.error("Der ausgewählte Mitarbeiter wurde nicht gefunden");
      return;
    }

    const employeeName = `${selectedEmployeeData.first_name || ''} ${selectedEmployeeData.last_name || ''}`.trim();
    
    // Prüfen, ob der Mitarbeiter bereits im Team ist
    if (team.some(member => member.id === selectedEmployee)) {
      toast.error("Dieser Mitarbeiter ist bereits im Team");
      return;
    }

    const updatedTeam = [
      ...team,
      {
        id: selectedEmployee,
        name: employeeName || selectedEmployeeData.email || 'Unbekannter Mitarbeiter',
        role: role,
        permissions: permissions
      }
    ];

    onChange('team', updatedTeam);
    setSelectedEmployee("");
    setSearchEmployee("");
    setRole("");
    setPermissions('viewer');
    setShowEmployeeDropdown(false);
  };

  const handleRemoveMember = (id: string) => {
    const updatedTeam = team.filter(member => member.id !== id);
    onChange('team', updatedTeam);
  };

  const handleSelectEmployee = (employee: Employee) => {
    setSelectedEmployee(employee.id);
    setSearchEmployee(`${employee.first_name || ''} ${employee.last_name || ''}`);
    setShowEmployeeDropdown(false);
  };

  if (error) {
    console.error('Fehler bei der Abfrage der Mitarbeiter:', error);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team & Verantwortlichkeiten</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Teammitglieder</h3>
          
          {team.length > 0 && (
            <div className="space-y-4">
              {team.map(member => (
                <div key={member.id} className="flex items-center space-x-4 p-4 border rounded-md">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm text-gray-500">Name</Label>
                      <div>{member.name}</div>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Rolle</Label>
                      <div>{member.role}</div>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Berechtigungen</Label>
                      <div>
                        {member.permissions === 'admin' && 'Administrator'}
                        {member.permissions === 'editor' && 'Bearbeiter'}
                        {member.permissions === 'viewer' && 'Betrachter'}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveMember(member.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="pt-4 border-t">
            <h4 className="text-md font-medium mb-4">Teammitglied hinzufügen</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="employee">Mitarbeiter</Label>
                <div className="relative">
                  <Input
                    id="employeeSearch"
                    value={searchEmployee}
                    onChange={(e) => {
                      setSearchEmployee(e.target.value);
                      setShowEmployeeDropdown(true);
                    }}
                    onFocus={() => setShowEmployeeDropdown(true)}
                    placeholder="Nach Mitarbeiter suchen..."
                    className="pr-10"
                  />
                  {isLoading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    </div>
                  )}
                  {showEmployeeDropdown && searchEmployee && filteredEmployees.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {filteredEmployees.map((employee) => (
                        <div 
                          key={employee.id} 
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleSelectEmployee(employee)}
                        >
                          <div className="font-medium">{employee.first_name} {employee.last_name}</div>
                          {employee.position && <div className="text-sm text-gray-500">{employee.position}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <Label htmlFor="role">Rolle</Label>
                <Input
                  id="role"
                  placeholder="z.B. Entwickler, Designer"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="permissions">Berechtigungen</Label>
                <Select
                  value={permissions}
                  onValueChange={(value: 'admin' | 'editor' | 'viewer') => setPermissions(value)}
                >
                  <SelectTrigger id="permissions">
                    <SelectValue placeholder="Berechtigungen auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="editor">Bearbeiter</SelectItem>
                    <SelectItem value="viewer">Betrachter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button 
                  type="button" 
                  onClick={handleAddMember} 
                  className="w-full md:w-auto"
                  disabled={!selectedEmployee || !role.trim()}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Hinzufügen
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
