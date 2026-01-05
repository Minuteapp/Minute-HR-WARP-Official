
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Employee } from '@/types/employee.types';
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Archive, ArchiveRestore, ArrowLeft, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ArchivedEmployeeList = () => {
  const navigate = useNavigate();
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: archivedEmployees, refetch } = useQuery({
    queryKey: ['archivedEmployees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('archived', true)
        .order('archived_at', { ascending: false });

      if (error) throw error;
      return data as Employee[];
    }
  });

  const handleRestore = async () => {
    if (!selectedEmployee) return;

    try {
      const { error } = await supabase
        .from('employees')
        .update({ 
          archived: false, 
          archived_at: null, 
          archived_by: null 
        })
        .eq('id', selectedEmployee.id);

      if (error) throw error;

      toast.success("Der Mitarbeiter wurde erfolgreich wiederhergestellt.");
      setShowRestoreDialog(false);
      refetch();
    } catch (error) {
      toast.error("Beim Wiederherstellen ist ein Fehler aufgetreten.");
    }
  };

  const handlePermanentDelete = async () => {
    if (!selectedEmployee) return;

    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', selectedEmployee.id);

      if (error) throw error;

      toast.success("Der Mitarbeiter wurde endgültig gelöscht.");
      setShowDeleteDialog(false);
      refetch();
    } catch (error) {
      toast.error("Beim Löschen ist ein Fehler aufgetreten.");
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/employees')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>
          <div className="flex items-center">
            <Archive className="w-5 h-5 mr-2" />
            <h2 className="text-xl font-semibold">Archivierte Mitarbeiter</h2>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b">
              <th className="pb-2">Name</th>
              <th className="pb-2">Position</th>
              <th className="pb-2">Abteilung</th>
              <th className="pb-2">Archiviert am</th>
              <th className="pb-2">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {archivedEmployees?.map((employee) => (
              <tr key={employee.id} className="border-b">
                <td className="py-2">{employee.name}</td>
                <td className="py-2">{employee.position}</td>
                <td className="py-2">{employee.department}</td>
                <td className="py-2">
                  {employee.archived_at ? new Date(employee.archived_at).toLocaleDateString('de-DE') : '-'}
                </td>
                <td className="py-2">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedEmployee(employee);
                        setShowRestoreDialog(true);
                      }}
                    >
                      <ArchiveRestore className="w-4 h-4 mr-1" />
                      Wiederherstellen
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setSelectedEmployee(employee);
                        setShowDeleteDialog(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Löschen
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {(!archivedEmployees || archivedEmployees.length === 0) && (
              <tr>
                <td colSpan={5} className="py-4 text-center text-gray-500">
                  Keine archivierten Mitarbeiter vorhanden
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AlertDialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mitarbeiter wiederherstellen</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie den Mitarbeiter wirklich wiederherstellen? 
              Der Mitarbeiter wird wieder in der aktiven Liste angezeigt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestore}>
              Wiederherstellen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mitarbeiter endgültig löschen</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie den Mitarbeiter wirklich endgültig löschen? 
              Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handlePermanentDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Endgültig löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ArchivedEmployeeList;
