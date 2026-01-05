
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RelocationCategoryIcon } from './RelocationCategoryIcon';
import { RelocationPriorityBadge } from './RelocationPriorityBadge';
import { RelocationStatusBadge } from './RelocationStatusBadge';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface RelocationTask {
  id: string;
  request_id: string | null;
  category: string;
  task_description: string;
  due_date: string | null;
  priority: string;
  status: string;
  assigned_to: string | null;
}

interface RelocationTableProps {
  data: RelocationTask[];
}

export function RelocationTable({ data }: RelocationTableProps) {
  if (data.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center">
        <p className="text-muted-foreground">Keine Relocation-Aufgaben vorhanden</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Kategorie</TableHead>
            <TableHead>Aufgabe</TableHead>
            <TableHead>Fälligkeitsdatum</TableHead>
            <TableHead>Priorität</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Zuständig</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((task) => (
            <TableRow key={task.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <RelocationCategoryIcon category={task.category} />
                  <span>{task.category}</span>
                </div>
              </TableCell>
              <TableCell className="font-medium">{task.task_description}</TableCell>
              <TableCell>
                {task.due_date ? format(new Date(task.due_date), 'dd.MM.yyyy', { locale: de }) : '-'}
              </TableCell>
              <TableCell>
                <RelocationPriorityBadge priority={task.priority} />
              </TableCell>
              <TableCell>
                <RelocationStatusBadge status={task.status} />
              </TableCell>
              <TableCell>{task.assigned_to || '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
