
import { useState } from 'react';
import { ComplianceHeader } from '../compliance/ComplianceHeader';
import { ComplianceTable } from '../compliance/ComplianceTable';
import { CreateComplianceDialog } from '../compliance/CreateComplianceDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { GlobalMobilityRequest } from '@/types/global-mobility';

// Leere Daten - werden aus der Datenbank geladen
const complianceData: Array<{
  id: string;
  request_id: string;
  compliance_type: string;
  requirement: string;
  status: string;
  due_date: string;
  completed_date: string | null;
  responsible_party: string;
  notes: string | null;
}> = [];

interface ComplianceTabProps {
  requests: GlobalMobilityRequest[];
}

export function ComplianceTab({ requests }: ComplianceTabProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const requestsForDialog = requests.map(r => ({
    id: r.id,
    employee_name: r.title,
  }));

  return (
    <div className="space-y-6">
      <ComplianceHeader onCreateClick={() => setIsCreateDialogOpen(true)} />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {complianceData.filter(c => c.status === 'completed').length}
              </div>
              <p className="text-sm text-muted-foreground">Abgeschlossen</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {complianceData.filter(c => c.status === 'in_progress').length}
              </div>
              <p className="text-sm text-muted-foreground">In Bearbeitung</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">
                {complianceData.filter(c => c.status === 'pending').length}
              </div>
              <p className="text-sm text-muted-foreground">Ausstehend</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                {complianceData.filter(c => c.status === 'overdue').length}
              </div>
              <p className="text-sm text-muted-foreground">Überfällig</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Compliance-Übersicht</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ComplianceTable data={complianceData} />
        </CardContent>
      </Card>

      <CreateComplianceDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={() => setIsCreateDialogOpen(false)}
        requests={requestsForDialog}
      />
    </div>
  );
}
