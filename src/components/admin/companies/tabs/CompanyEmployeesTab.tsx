import React, { useState, useEffect } from 'react';
import { CompanyDetails } from '../types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Key, UserCog } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Employee } from '@/types/employee.types';
import { AdminEmployeeDialog } from '@/components/admin/AdminEmployeeDialog';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';

export interface CompanyEmployeesTabProps {
  company: CompanyDetails;
}

export const CompanyEmployeesTab: React.FC<CompanyEmployeesTabProps> = ({ company }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  // Mitarbeiter laden
  const loadEmployees = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('company_id', company.id)
        .eq('archived', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading employees:', error);
        toast({
          title: 'Fehler beim Laden der Mitarbeiter',
          description: error.message,
          variant: 'destructive'
        });
        return;
      }

      setEmployees(data || []);
    } catch (error) {
      console.error('Error loading employees:', error);
      toast({
        title: 'Fehler beim Laden der Mitarbeiter',
        description: 'Ein unerwarteter Fehler ist aufgetreten.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, [company.id]);

  const handleEmployeeAdded = () => {
    setIsAddDialogOpen(false);
    loadEmployees();
    toast({
      title: 'Mitarbeiter hinzugefügt',
      description: 'Der Mitarbeiter wurde erfolgreich zur Firma hinzugefügt.'
    });
  };

  const handleAccessData = (employeeId: string) => {
    // TODO: Implement access data view
    console.log('Access data for employee:', employeeId);
    toast({
      title: 'Zugangsdaten',
      description: 'Zugangsdaten-Ansicht wird geöffnet.'
    });
  };

  const handleLoginAsUser = (employeeId: string) => {
    // TODO: Implement login as user
    console.log('Login as user:', employeeId);
    toast({
      title: 'Als Benutzer anmelden',
      description: 'Sie werden als dieser Benutzer angemeldet.'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Lade Mitarbeiter...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Mitarbeiter</h3>
        <Button onClick={() => setIsAddDialogOpen(true)} className="bg-purple-600 hover:bg-purple-700 gap-2">
          <UserPlus className="h-4 w-4" />
          Mitarbeiter hinzufügen
        </Button>
      </div>

      {employees.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">Keine Mitarbeiter gefunden</p>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>E-Mail</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Abteilung</TableHead>
                <TableHead>Startdatum</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">
                    {employee.first_name && employee.last_name
                      ? `${employee.first_name} ${employee.last_name}`
                      : employee.name}
                  </TableCell>
                  <TableCell>{employee.email || '-'}</TableCell>
                  <TableCell>{employee.position || '-'}</TableCell>
                  <TableCell>{employee.department || '-'}</TableCell>
                  <TableCell>
                    {employee.start_date
                      ? format(parseISO(employee.start_date), 'dd.MM.yyyy')
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={employee.status === 'active' ? 'default' : 'secondary'}
                      className="bg-black text-white hover:bg-black/90"
                    >
                      {employee.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAccessData(employee.id)}
                        className="gap-1 text-sm"
                      >
                        <Key className="h-3 w-3" />
                        Zugangsdaten
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLoginAsUser(employee.id)}
                        className="gap-1 text-sm text-purple-600 hover:text-purple-700"
                      >
                        <UserCog className="h-3 w-3" />
                        Als Benutzer anmelden
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AdminEmployeeDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={handleEmployeeAdded}
        companyId={company.id}
      />
    </div>
  );
};
