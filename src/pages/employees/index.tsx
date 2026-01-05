import { Routes, Route, useParams, useNavigate } from 'react-router-dom';
import EmployeeList from '../../components/employees/EmployeeList';
import EmployeeDetails from '../../components/employees/EmployeeDetails';
import ArchivedEmployeeList from '../../components/employees/ArchivedEmployeeList';
import { useTenant } from '@/contexts/TenantContext';
import { AlertCircle, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const EmployeeDetailsWrapper = () => {
  const { id } = useParams<{ id: string }>();
  
  if (!id) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <p className="text-xl text-center">Kein Mitarbeiter ausgewählt</p>
      </div>
    );
  }
  
  return <EmployeeDetails employeeId={id} />;
};

const NoTenantSelectedMessage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="max-w-md">
        <CardContent className="pt-6 text-center space-y-4">
          <AlertCircle className="h-12 w-12 mx-auto text-amber-500" />
          <h2 className="text-xl font-semibold">Keine Firma ausgewählt</h2>
          <p className="text-muted-foreground">
            Als Superadmin müssen Sie zuerst eine Firma auswählen, um deren Mitarbeiter einzusehen.
          </p>
          <Button onClick={() => navigate('/admin/companies')} className="gap-2">
            <Building2 className="h-4 w-4" />
            Zur Firmenübersicht
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

const EmployeesPage = () => {
  const { isSuperAdmin, tenantCompany, isLoading } = useTenant();

  // Warten bis Tenant-Context geladen ist
  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Laden...</p>
      </div>
    );
  }

  // Superadmin ohne aktiven Tenant-Context UND ohne eigene Firma
  if (isSuperAdmin && !tenantCompany) {
    return (
      <div className="p-6">
        <NoTenantSelectedMessage />
      </div>
    );
  }

  return (
    <div className="p-6">
      <Routes>
        <Route index element={<EmployeeList />} />
        <Route path="profile/:id" element={<EmployeeDetailsWrapper />} />
        <Route path="archived" element={<ArchivedEmployeeList />} />
      </Routes>
    </div>
  );
};

export default EmployeesPage;
