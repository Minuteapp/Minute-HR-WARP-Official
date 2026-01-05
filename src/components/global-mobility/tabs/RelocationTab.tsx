
import { useState } from 'react';
import { RelocationHeader } from '../relocation/RelocationHeader';
import { RelocationInfoCards } from '../relocation/RelocationInfoCards';
import { RelocationTable } from '../relocation/RelocationTable';
import { CreateRelocationTaskDialog } from '../relocation/CreateRelocationTaskDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { GlobalMobilityRequest } from '@/types/global-mobility';

// Leere Daten - werden aus der Datenbank geladen
const relocationTasks: Array<{
  id: string;
  request_id: string;
  category: string;
  task_description: string;
  due_date: string;
  priority: string;
  status: string;
  assigned_to: string;
}> = [];

// Leere Statistiken - werden aus echten Daten berechnet
const categoryStats: Array<{ category: string; total: number; completed: number }> = [];

interface RelocationTabProps {
  requests: GlobalMobilityRequest[];
}

export function RelocationTab({ requests }: RelocationTabProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const requestsForDialog = requests.map(r => ({
    id: r.id,
    employee_name: r.title,
  }));

  return (
    <div className="space-y-6">
      <RelocationHeader onCreateClick={() => setIsCreateDialogOpen(true)} />
      
      <RelocationInfoCards stats={categoryStats} />
      
      <Card>
        <CardHeader>
          <CardTitle>Relocation-Aufgaben</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <RelocationTable data={relocationTasks} />
        </CardContent>
      </Card>

      <CreateRelocationTaskDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={() => setIsCreateDialogOpen(false)}
        requests={requestsForDialog}
      />
    </div>
  );
}
