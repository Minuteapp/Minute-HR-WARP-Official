
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Save, Edit2, X, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { PersonalDataForm } from './PersonalDataForm';
import { useEmployeeData } from '@/hooks/useEmployeeData';
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useNavigate } from 'react-router-dom';

interface PersonalDataCardProps {
  employeeId: string;
}

export const PersonalDataCard = ({ employeeId }: PersonalDataCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { employee, isLoading, updateEmployee, isUpdating, deleteEmployee, isDeletingEmployee } = useEmployeeData(employeeId);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    language: 'de',
    timezone: 'europe-berlin'
  });

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || '',
        email: employee.email || '',
        phone: employee.phone || '',
        department: employee.department || '',
        position: employee.position || '',
        language: 'de',
        timezone: 'europe-berlin'
      });
    }
  }, [employee]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleDelete = () => {
    deleteEmployee();
    toast({
      title: "Erfolgreich gelöscht",
      description: "Das Profil wurde erfolgreich gelöscht.",
    });
    setShowDeleteDialog(false);
    navigate('/employees');
  };

  const handleSave = () => {
    updateEmployee({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      department: formData.department,
      position: formData.position,
    });
    toast({
      title: "Erfolgreich gespeichert",
      description: "Ihre Änderungen wurden gespeichert.",
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (employee) {
      setFormData({
        name: employee.name || '',
        email: employee.email || '',
        phone: employee.phone || '',
        department: employee.department || '',
        position: employee.position || '',
        language: 'de',
        timezone: 'europe-berlin'
      });
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return <div>Lädt...</div>;
  }

  if (!employee) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Mitarbeiter nicht gefunden. Bitte überprüfen Sie die ID.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Persönliche Daten
            </CardTitle>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button onClick={handleCancel} variant="outline" className="flex items-center gap-2">
                    <X className="w-4 h-4" />
                    Abbrechen
                  </Button>
                  <Button onClick={handleSave} disabled={isUpdating} className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Speichern
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={handleEdit} variant="outline" className="flex items-center gap-2">
                    <Edit2 className="w-4 h-4" />
                    Bearbeiten
                  </Button>
                  <Button 
                    onClick={() => setShowDeleteDialog(true)} 
                    variant="destructive"
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Profil löschen
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <PersonalDataForm
            formData={formData}
            isEditing={isEditing}
            onChange={setFormData}
          />
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Profil löschen</AlertDialogTitle>
            <AlertDialogDescription>
              Sind Sie sicher, dass Sie dieses Profil löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
              Das Profil wird in den Mitarbeiterdokumenten archiviert.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeletingEmployee}
            >
              {isDeletingEmployee ? "Wird gelöscht..." : "Löschen"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
