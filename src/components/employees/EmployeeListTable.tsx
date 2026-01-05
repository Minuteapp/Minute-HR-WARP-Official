import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Archive } from 'lucide-react';
import { Employee } from '@/types/employee.types';
import { useIsMobile } from '@/hooks/use-device-type';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface EmployeeListTableProps {
  employees: Employee[];
}

const EmployeeListTable = ({ employees }: EmployeeListTableProps) => {
  // Filter out archived employees
  const activeEmployees = employees.filter(employee => !employee.archived);
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);

  const handleArchiveClick = (e: React.MouseEvent, employee: Employee) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedEmployee(employee);
    setArchiveDialogOpen(true);
  };

  const handleArchiveConfirm = async () => {
    if (!selectedEmployee) return;
    
    setIsArchiving(true);
    try {
      const { error } = await supabase
        .from('employees')
        .update({ 
          archived: true,
          archived_at: new Date().toISOString(),
          status: 'inactive'
        })
        .eq('id', selectedEmployee.id);

      if (error) throw error;

      toast.success(`${selectedEmployee.name} wurde archiviert`);
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    } catch (error: any) {
      toast.error('Fehler beim Archivieren: ' + error.message);
    } finally {
      setIsArchiving(false);
      setArchiveDialogOpen(false);
      setSelectedEmployee(null);
    }
  };

  if (isMobile) {
    return (
      <>
        <AlertDialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Mitarbeiter archivieren</AlertDialogTitle>
              <AlertDialogDescription>
                Möchten Sie {selectedEmployee?.name} wirklich archivieren? Der Mitarbeiter wird als inaktiv markiert und erscheint nicht mehr in der aktiven Liste.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isArchiving}>Abbrechen</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleArchiveConfirm}
                disabled={isArchiving}
                className="bg-red-600 hover:bg-red-700"
              >
                {isArchiving ? 'Archiviert...' : 'Archivieren'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        <div className="space-y-6">
          {activeEmployees.map((employee) => (
            <Link
              to={`/employees/profile/${employee.id}`}
              key={employee.id}
              className="block bg-white rounded-2xl p-4 shadow-sm"
            >
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-teal-700 flex items-center justify-center text-white">
                      {employee.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-base">{employee.name}</div>
                      <div className="text-sm text-gray-500">{employee.department}</div>
                    </div>
                  </div>
                  <div className="text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      employee.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : employee.status === 'probation'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {employee.status === 'active' ? 'Aktiv' : employee.status === 'probation' ? 'Probezeit' : 'Inaktiv'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex gap-2">
                    <button className="w-8 h-8 bg-teal-700 rounded-full flex items-center justify-center text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                      </svg>
                    </button>
                    <button 
                      className="w-8 h-8 bg-white border border-red-300 rounded-full flex items-center justify-center text-red-600 hover:bg-red-50"
                      onClick={(e) => handleArchiveClick(e, employee)}
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <AlertDialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mitarbeiter archivieren</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie {selectedEmployee?.name} wirklich archivieren? Der Mitarbeiter wird als inaktiv markiert und erscheint nicht mehr in der aktiven Liste.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isArchiving}>Abbrechen</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleArchiveConfirm}
              disabled={isArchiving}
              className="bg-red-600 hover:bg-red-700"
            >
              {isArchiving ? 'Archiviert...' : 'Archivieren'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="grid grid-cols-10 gap-4 mt-6 mb-4 text-sm font-medium text-gray-500">
        <div className="col-span-2">Mitarbeiter</div>
        <div>Mitarbeiternr.</div>
        <div>Standort</div>
        <div>Team</div>
        <div>Position</div>
        <div>Beschäftigung</div>
        <div>Email</div>
        <div>Status</div>
        <div>Aktionen</div>
      </div>
      
      <div className="space-y-2">
        {activeEmployees.map((employee) => (
          <div
            key={employee.id}
            className="grid grid-cols-10 gap-4 items-center py-2 px-4 hover:bg-gray-50 rounded-lg shadow-md transition-all duration-200"
          >
            <Link
              to={`/employees/profile/${employee.id}`}
              className="col-span-2 flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                {employee.name.charAt(0)}
              </div>
              <div>
                <div className="font-medium">{employee.name}</div>
                <div className="text-sm text-gray-500">{employee.department}</div>
              </div>
            </Link>
            <div className="text-sm">{employee.employee_number || '-'}</div>
            <div className="text-sm">{employee.location || '-'}</div>
            <div>{employee.team}</div>
            <div>{employee.position}</div>
            <div className="text-sm">
              {employee.employment_type ? (
                <span className={`px-2 py-1 rounded-full text-xs ${
                  employee.employment_type === 'full_time' ? 'bg-blue-100 text-blue-800' :
                  employee.employment_type === 'part_time' ? 'bg-gray-100 text-gray-800' :
                  employee.employment_type === 'temporary' ? 'bg-orange-100 text-orange-800' :
                  employee.employment_type === 'freelance' ? 'bg-purple-100 text-purple-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {employee.employment_type === 'full_time' ? 'Vollzeit' :
                   employee.employment_type === 'part_time' ? 'Teilzeit' :
                   employee.employment_type === 'temporary' ? 'Befristet' :
                   employee.employment_type === 'freelance' ? 'Freiberuflich' :
                   'Praktikant'}
                </span>
              ) : '-'}
            </div>
            <div className="text-sm truncate">{employee.email || '-'}</div>
            <div>
              <span className={`px-2 py-1 rounded-full text-xs ${
                employee.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : employee.status === 'probation'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {employee.status === 'active' ? 'Aktiv' : employee.status === 'probation' ? 'Probezeit' : 'Inaktiv'}
              </span>
            </div>
            <div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={(e) => handleArchiveClick(e, employee)}
              >
                <Archive className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default EmployeeListTable;
