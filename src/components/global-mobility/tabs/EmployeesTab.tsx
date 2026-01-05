
import { useState } from 'react';
import { EmployeesHeader } from '../employees/EmployeesHeader';
import { EmployeesInfoCards } from '../employees/EmployeesInfoCards';
import { EmployeesTable } from '../employees/EmployeesTable';
import { CreateEmployeeDataDialog } from '../employees/CreateEmployeeDataDialog';
import { EmployeeDetailsModal } from '../employees/EmployeeDetailsModal';
import { Card, CardContent } from '@/components/ui/card';
import type { GlobalMobilityRequest } from '@/types/global-mobility';

interface EmployeeFamily {
  id: string;
  request_id: string | null;
  contract_status: string | null;
  employment_model: string | null;
  work_time_model: string | null;
  family_members_count: number | null;
  created_at: string | null;
  request?: {
    employee_name: string | null;
    current_location: string | null;
    destination_location: string | null;
  };
}

// Leeres Array für neue Firmen - Daten werden aus der Datenbank geladen
const mockEmployeeData: EmployeeFamily[] = [];

interface EmployeesTabProps {
  requests: GlobalMobilityRequest[];
}

export function EmployeesTab({ requests }: EmployeesTabProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeFamily | null>(null);

  const employmentModels = [
    { model: 'Vollzeit', count: 15 },
    { model: 'Teilzeit', count: 5 },
    { model: 'Remote', count: 3 },
  ];

  const familyStats = {
    withFamily: 12,
    withoutFamily: 11,
  };

  const dataIntegrity = 87;

  const handleViewDetails = (employee: EmployeeFamily) => {
    setSelectedEmployee(employee);
  };

  const requestsForDialog = requests.map(r => ({
    id: r.id,
    employee_name: r.title,
  }));

  return (
    <div className="space-y-6">
      <EmployeesHeader onCreateClick={() => setIsCreateDialogOpen(true)} />
      
      <EmployeesInfoCards
        employmentModels={employmentModels}
        familyStats={familyStats}
        dataIntegrity={dataIntegrity}
      />
      
      <Card>
        <CardContent className="p-0">
          <EmployeesTable
            data={mockEmployeeData}
            onViewDetails={handleViewDetails}
          />
        </CardContent>
      </Card>

      <CreateEmployeeDataDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={() => setIsCreateDialogOpen(false)}
        requests={requestsForDialog}
      />

      <EmployeeDetailsModal
        employee={selectedEmployee}
        open={!!selectedEmployee}
        onOpenChange={(open) => !open && setSelectedEmployee(null)}
      />
    </div>
  );
}
